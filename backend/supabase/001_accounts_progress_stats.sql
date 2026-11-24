-- 汉字学园 账号（昵称 + 4 位数字密码）、云端进度、使用统计
-- 只存昵称和密码哈希；不收真名/邮箱/手机号/IP。表全部放在不对外暴露的 hzxy schema；
-- 前端（anon key）只能调用 public.hzxy_* 这几个 RPC。
create extension if not exists pgcrypto with schema extensions;
create schema if not exists hzxy;
revoke all on schema hzxy from public, anon, authenticated;

create table if not exists hzxy.users(
  id uuid primary key default gen_random_uuid(),
  nickname text not null,
  nick_key text not null unique,
  pin_hash text not null,
  failed_count int not null default 0,
  locked_until timestamptz,
  created_at timestamptz not null default now(),
  last_seen timestamptz,
  reward_points int not null default 0          -- 预留：将来的小奖励（暂未使用）
);
create table if not exists hzxy.sessions(
  token_hash text primary key,
  user_id uuid not null references hzxy.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  last_used timestamptz not null default now()
);
create index if not exists sessions_user on hzxy.sessions(user_id);
create table if not exists hzxy.progress(
  user_id uuid not null references hzxy.users(id) on delete cascade,
  module text not null,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  primary key(user_id,module)
);
create table if not exists hzxy.daily_active(
  user_id uuid not null references hzxy.users(id) on delete cascade,
  day date not null,
  primary key(user_id,day)
);
create table if not exists hzxy.rewards(                 -- 预留：奖励发放记录（暂未使用）
  id bigint generated always as identity primary key,
  user_id uuid not null references hzxy.users(id) on delete cascade,
  kind text not null,
  amount int not null default 0,
  note text,
  created_at timestamptz not null default now(),
  claimed_at timestamptz
);
alter table hzxy.users enable row level security;
alter table hzxy.sessions enable row level security;
alter table hzxy.progress enable row level security;
alter table hzxy.daily_active enable row level security;
alter table hzxy.rewards enable row level security;
revoke all on all tables in schema hzxy from public, anon, authenticated;

-- ---------- helpers ----------
create or replace function hzxy.today() returns date language sql stable set search_path='' as
$$ select (now() at time zone 'Asia/Bangkok')::date $$;

create or replace function hzxy.nick_norm(p text) returns text language sql immutable set search_path='' as
$$ select regexp_replace(btrim(normalize(coalesce(p,''),NFKC)),'\s+',' ','g') $$;

create or replace function hzxy.check_nick(p text) returns text language plpgsql immutable set search_path='' as $$
declare n text := hzxy.nick_norm(p); k text; w text;
begin
  if char_length(n) < 2 or char_length(n) > 16 then raise exception 'nick_invalid' using errcode='P0001'; end if;
  if n ~ '[[:cntrl:]<>"''&\\/@:;{}`]' then raise exception 'nick_invalid' using errcode='P0001'; end if;
  k := lower(replace(n,' ',''));
  foreach w in array array['傻逼','煞笔','傻b','操你','草泥马','妈的','你妈','fuck','shit','bitch','admin','管理员','官方','客服'] loop
    if position(w in k) > 0 then raise exception 'nick_blocked' using errcode='P0001'; end if;
  end loop;
  return n;
end $$;

create or replace function hzxy.uid(p_token text) returns uuid language plpgsql security definer set search_path='' as $$
declare u uuid;
begin
  update hzxy.sessions set last_used = now()
   where token_hash = encode(extensions.digest(coalesce(p_token,''),'sha256'),'hex')
     and last_used > now() - interval '180 days'
  returning user_id into u;
  if u is null then raise exception 'auth' using errcode='P0001'; end if;
  return u;
end $$;

create or replace function hzxy.new_session(u uuid) returns text language plpgsql security definer set search_path='' as $$
declare t text := encode(extensions.gen_random_bytes(32),'hex');
begin
  delete from hzxy.sessions where user_id = u and last_used < now() - interval '180 days';
  delete from hzxy.sessions where token_hash in (select token_hash from hzxy.sessions where user_id=u order by last_used desc offset 19);
  insert into hzxy.sessions(token_hash,user_id) values (encode(extensions.digest(t,'sha256'),'hex'), u);
  insert into hzxy.daily_active(user_id,day) values (u,hzxy.today()) on conflict do nothing;
  update hzxy.users set last_seen = now() where id = u;
  return t;
end $$;

-- 进度合并：对象按键递归；数组取并集；数字取大；布尔取或；其他用新值
create or replace function hzxy.jmerge(a jsonb, b jsonb) returns jsonb language plpgsql immutable set search_path='' as $$
declare r jsonb; k text; v jsonb;
begin
  if a is null or a = 'null'::jsonb then return b; end if;
  if b is null or b = 'null'::jsonb then return a; end if;
  if jsonb_typeof(a)='object' and jsonb_typeof(b)='object' then
    r := a;
    for k, v in select * from jsonb_each(b) loop
      r := jsonb_set(r, array[k], hzxy.jmerge(a->k, v), true);
    end loop;
    return r;
  elsif jsonb_typeof(a)='array' and jsonb_typeof(b)='array' then
    return a || coalesce((select jsonb_agg(e order by o) from jsonb_array_elements(b) with ordinality as t(e,o) where not (a @> jsonb_build_array(e))),'[]'::jsonb);
  elsif jsonb_typeof(a)='number' and jsonb_typeof(b)='number' then
    return case when (a::text)::numeric >= (b::text)::numeric then a else b end;
  elsif jsonb_typeof(a)='boolean' and jsonb_typeof(b)='boolean' then
    return to_jsonb((a::text)::boolean or (b::text)::boolean);
  end if;
  return b;
end $$;

-- ---------- API（security definer，放在不暴露的 hzxy schema） ----------
create or replace function hzxy.register(p_nick text, p_pin text) returns jsonb language plpgsql security definer set search_path='' as $$
declare n text; u uuid;
begin
  n := hzxy.check_nick(p_nick);
  if coalesce(p_pin,'') !~ '^[0-9]{4}$' then raise exception 'pin_invalid' using errcode='P0001'; end if;
  if (select count(*) from hzxy.users where created_at > now() - interval '1 minute') >= 30 then
    raise exception 'busy' using errcode='P0001'; end if;
  begin
    insert into hzxy.users(nickname,nick_key,pin_hash)
    values (n, lower(replace(n,' ','')), extensions.crypt(p_pin, extensions.gen_salt('bf',8))) returning id into u;
  exception when unique_violation then raise exception 'nick_taken' using errcode='P0001';
  end;
  return jsonb_build_object('token', hzxy.new_session(u), 'nickname', n);
end $$;

create or replace function hzxy.login(p_nick text, p_pin text) returns jsonb language plpgsql security definer set search_path='' as $$
declare r hzxy.users%rowtype;
begin
  select * into r from hzxy.users where nick_key = lower(replace(hzxy.nick_norm(p_nick),' ','')) for update;
  if not found then
    perform extensions.crypt('0000', extensions.gen_salt('bf',8));
    raise exception 'bad_login' using errcode='P0001';
  end if;
  if r.locked_until is not null and r.locked_until > now() then
    raise exception 'locked:%', ceil(extract(epoch from r.locked_until - now()))::int using errcode='P0001';
  end if;
  if coalesce(p_pin,'') !~ '^[0-9]{4}$' or extensions.crypt(p_pin, r.pin_hash) <> r.pin_hash then
    if r.failed_count + 1 >= 5 then
      update hzxy.users set failed_count = 0, locked_until = now() + interval '10 minutes' where id = r.id;
    else
      update hzxy.users set failed_count = r.failed_count + 1 where id = r.id;
    end if;
    return jsonb_build_object('error','bad_login','left', greatest(0, 4 - r.failed_count));
  end if;
  update hzxy.users set failed_count = 0, locked_until = null where id = r.id;
  return jsonb_build_object('token', hzxy.new_session(r.id), 'nickname', r.nickname);
end $$;

create or replace function hzxy.logout(p_token text) returns void language sql security definer set search_path='' as
$$ delete from hzxy.sessions where token_hash = encode(extensions.digest(coalesce(p_token,''),'sha256'),'hex') $$;

create or replace function hzxy.ping(p_token text) returns jsonb language plpgsql security definer set search_path='' as $$
declare u uuid := hzxy.uid(p_token); n text;
begin
  insert into hzxy.daily_active(user_id,day) values (u,hzxy.today()) on conflict do nothing;
  update hzxy.users set last_seen = now() where id = u returning nickname into n;
  return jsonb_build_object('nickname', n);
end $$;

-- 上传本机进度并与云端合并，返回合并后的进度
create or replace function hzxy.save_progress(p_token text, p_module text, p_data jsonb) returns jsonb language plpgsql security definer set search_path='' as $$
declare u uuid := hzxy.uid(p_token); m jsonb;
begin
  if coalesce(p_module,'') !~ '^[a-z0-9_.-]{1,24}$' then raise exception 'bad_module' using errcode='P0001'; end if;
  if p_data is null or jsonb_typeof(p_data) <> 'object' then raise exception 'bad_data' using errcode='P0001'; end if;
  if octet_length(p_data::text) > 400000 then raise exception 'too_big' using errcode='P0001'; end if;
  insert into hzxy.progress as p(user_id,module,data) values (u,p_module,p_data)
  on conflict (user_id,module) do update set data = hzxy.jmerge(p.data, excluded.data), updated_at = now()
  returning data into m;
  insert into hzxy.daily_active(user_id,day) values (u,hzxy.today()) on conflict do nothing;
  return m;
end $$;

create or replace function hzxy.load_progress(p_token text) returns jsonb language plpgsql security definer set search_path='' as $$
declare u uuid := hzxy.uid(p_token);
begin
  return coalesce((select jsonb_object_agg(module,data) from hzxy.progress where user_id = u),'{}'::jsonb);
end $$;

revoke execute on all functions in schema hzxy from public, anon, authenticated;
grant usage on schema hzxy to anon, authenticated;
grant execute on function hzxy.register(text,text), hzxy.login(text,text), hzxy.logout(text), hzxy.ping(text),
  hzxy.save_progress(text,text,jsonb), hzxy.load_progress(text) to anon, authenticated;

-- ---------- 前端可调用的 RPC（public，security invoker 包装） ----------
create or replace function public.hzxy_register(p_nick text, p_pin text) returns jsonb language sql security invoker set search_path='' as $$ select hzxy.register(p_nick,p_pin) $$;
create or replace function public.hzxy_login(p_nick text, p_pin text) returns jsonb language sql security invoker set search_path='' as $$ select hzxy.login(p_nick,p_pin) $$;
create or replace function public.hzxy_logout(p_token text) returns void language sql security invoker set search_path='' as $$ select hzxy.logout(p_token) $$;
create or replace function public.hzxy_ping(p_token text) returns jsonb language sql security invoker set search_path='' as $$ select hzxy.ping(p_token) $$;
create or replace function public.hzxy_save_progress(p_token text, p_module text, p_data jsonb) returns jsonb language sql security invoker set search_path='' as $$ select hzxy.save_progress(p_token,p_module,p_data) $$;
create or replace function public.hzxy_load_progress(p_token text) returns jsonb language sql security invoker set search_path='' as $$ select hzxy.load_progress(p_token) $$;

-- ---------- 统计（只能在 Supabase 后台 SQL Editor 里看；anon 无权访问） ----------
create or replace view hzxy.stats_summary with (security_invoker = true) as
select (select count(*) from hzxy.users) as total_users,
       (select count(*) from hzxy.users where created_at >= now() - interval '7 days') as new_users_7d,
       (select count(distinct user_id) from hzxy.daily_active where day = hzxy.today()) as active_today,
       (select count(distinct user_id) from hzxy.daily_active where day > hzxy.today() - 7) as active_7d,
       (select count(distinct user_id) from hzxy.daily_active where day > hzxy.today() - 30) as active_30d;
create or replace view hzxy.stats_daily with (security_invoker = true) as
select day, count(*) as active_users,
       (select count(*) from hzxy.users u where (u.created_at at time zone 'Asia/Bangkok')::date = d.day) as new_users
from hzxy.daily_active d group by day order by day desc;
create or replace view hzxy.stats_cleared with (security_invoker = true) as
select 'pinci.'||g as module, count(distinct p.user_id) as players,
       coalesce(sum((select count(*) from jsonb_object_keys(case when jsonb_typeof(p.data->'G'->g->'cleared')='object' then p.data->'G'->g->'cleared' else '{}'::jsonb end))),0) as levels_cleared
from hzxy.progress p cross join unnest(array['main','qz','bushou']) g
where p.module='pinci' and p.data->'G'->g is not null group by g
union all
select 'qianziwen' as module, count(*) as players,
       coalesce(sum((select count(*) from jsonb_object_keys(case when jsonb_typeof(p.data->'seen')='object' then p.data->'seen' else '{}'::jsonb end))),0) as levels_cleared
from hzxy.progress p where p.module='qianziwen';
create or replace view hzxy.stats_users with (security_invoker = true) as
select u.nickname, u.created_at, u.last_seen,
  (select count(*) from hzxy.daily_active d where d.user_id=u.id) as active_days,
  (select coalesce(sum((select count(*) from jsonb_object_keys(case when jsonb_typeof(p.data->'G'->g->'cleared')='object' then p.data->'G'->g->'cleared' else '{}'::jsonb end))),0)
     from hzxy.progress p cross join unnest(array['main','qz','bushou']) g where p.user_id=u.id and p.module='pinci') as pinci_cleared,
  (select coalesce(max((p.data->'G'->'main'->>'coins')::numeric),0) from hzxy.progress p where p.user_id=u.id and p.module='pinci') as main_coins,
  u.reward_points
from hzxy.users u order by u.last_seen desc nulls last;
revoke all on hzxy.stats_summary, hzxy.stats_daily, hzxy.stats_cleared, hzxy.stats_users from public, anon, authenticated;
