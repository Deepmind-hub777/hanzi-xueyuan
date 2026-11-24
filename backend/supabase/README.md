# 汉字学园 · 账号与云端进度（Supabase）

- 项目：Supabase「Hanzi Xueyuan」（ref `ipocnpognxtbslzrdssf`，免费版）
- 前端：`shared/account.js`（同一份也放在 pinciwang 和 千字文 独立站）。只用 publishable key（公开的），只调用下面几个 RPC。
- 只保存昵称 + 4 位数字密码的 bcrypt 哈希；不收集真实姓名、邮箱、手机号，不存 IP。

## 表（schema `hzxy`，不对外暴露，RLS 开启且无任何策略 = 前端无法直接读写）
| 表 | 内容 |
|---|---|
| `users` | 昵称、密码哈希、错误次数/锁定时间、注册时间、最近活跃、`reward_points`（预留） |
| `sessions` | 登录令牌的 sha256（令牌本身只在用户设备上），180 天不用自动失效 |
| `progress` | 每人每模块一份进度 JSON（`pinci`、`qianziwen`），`rev` 版本号 |
| `daily_active` | 每人每天一行（曼谷时间），用来算日活 |
| `rewards` | 预留：将来的奖励记录（暂未使用） |

## 前端可调用的 RPC（public）
`hzxy_register(p_nick,p_pin)`、`hzxy_login(p_nick,p_pin)`、`hzxy_logout(p_token)`、`hzxy_ping(p_token)`、
`hzxy_save_progress(p_token,p_module,p_data,p_base_rev)`、`hzxy_load_progress(p_token)`

- 昵称：2–16 字，去首尾空格、不分大小写、忽略空格查重；屏蔽少量不雅词。
- 密码连错 5 次锁 10 分钟。每分钟最多 30 个新注册。
- 同步：同一设备连续保存直接覆盖（花掉的金币不会被还原）；版本对不上（刚登录 / 别的设备改过）时合并：对象逐键合并、数组取并集、数字取大、布尔取或。

## 统计（只有项目管理员能看）
Supabase 后台 → 项目 Hanzi Xueyuan → SQL Editor，运行：
```sql
select * from hzxy.stats_summary;   -- 总人数、近 7 天新增、今日/7 天/30 天活跃
select * from hzxy.stats_daily;     -- 每天活跃人数、新注册
select * from hzxy.stats_cleared;   -- 各模块（主园/千字文园/后花园/千字文）玩家数与通关总数
select * from hzxy.stats_users;     -- 每个昵称：注册时间、最近活跃、活跃天数、拼词园通关数
```
也可以在 Table Editor 里把 schema 切到 `hzxy` 看原始表。

## 迁移文件
`001_accounts_progress_stats.sql`、`002_progress_rev_sync.sql`（已在线上项目执行）。
