-- 进度同步改为「版本号」方式：同一台设备连续保存直接覆盖（花掉的金币不会被还原）；
-- 版本对不上（别的设备改过 / 刚登录）时才做合并（并集 / 取大）。
alter table hzxy.progress add column if not exists rev int not null default 1;
drop function if exists public.hzxy_save_progress(text,text,jsonb);
drop function if exists hzxy.save_progress(text,text,jsonb);
create or replace function hzxy.save_progress(p_token text, p_module text, p_data jsonb, p_base_rev int) returns jsonb
language plpgsql security definer set search_path='' as $$
declare u uuid := hzxy.uid(p_token); cur hzxy.progress%rowtype; m jsonb;
begin
  if coalesce(p_module,'') !~ '^[a-z0-9_.-]{1,24}$' then raise exception 'bad_module' using errcode='P0001'; end if;
  if p_data is not null and jsonb_typeof(p_data) <> 'object' then raise exception 'bad_data' using errcode='P0001'; end if;
  if p_data is not null and octet_length(p_data::text) > 400000 then raise exception 'too_big' using errcode='P0001'; end if;
  insert into hzxy.daily_active(user_id,day) values (u,hzxy.today()) on conflict do nothing;
  select * into cur from hzxy.progress where user_id=u and module=p_module for update;
  if not found then
    if p_data is null then return jsonb_build_object('rev',0); end if;
    insert into hzxy.progress(user_id,module,data,rev) values (u,p_module,p_data,1);
    return jsonb_build_object('rev',1,'merged',false);
  end if;
  if p_data is null then   -- 只拉取
    if p_base_rev = cur.rev then return jsonb_build_object('rev',cur.rev); end if;
    return jsonb_build_object('rev',cur.rev,'data',cur.data,'merged',true);
  end if;
  if p_base_rev = cur.rev then   -- 快进：直接覆盖
    update hzxy.progress set data=p_data, rev=cur.rev+1, updated_at=now() where user_id=u and module=p_module;
    return jsonb_build_object('rev',cur.rev+1,'merged',false);
  end if;
  m := hzxy.jmerge(cur.data, p_data);
  update hzxy.progress set data=m, rev=cur.rev+1, updated_at=now() where user_id=u and module=p_module;
  return jsonb_build_object('rev',cur.rev+1,'data',m,'merged',true);
end $$;
create or replace function hzxy.load_progress(p_token text) returns jsonb language plpgsql security definer set search_path='' as $$
declare u uuid := hzxy.uid(p_token);
begin
  return coalesce((select jsonb_object_agg(module,jsonb_build_object('rev',rev,'data',data)) from hzxy.progress where user_id = u),'{}'::jsonb);
end $$;
revoke execute on all functions in schema hzxy from public, anon, authenticated;
grant execute on function hzxy.register(text,text), hzxy.login(text,text), hzxy.logout(text), hzxy.ping(text),
  hzxy.save_progress(text,text,jsonb,int), hzxy.load_progress(text) to anon, authenticated;
create or replace function public.hzxy_save_progress(p_token text, p_module text, p_data jsonb, p_base_rev int) returns jsonb
  language sql security invoker set search_path='' as $$ select hzxy.save_progress(p_token,p_module,p_data,p_base_rev) $$;
