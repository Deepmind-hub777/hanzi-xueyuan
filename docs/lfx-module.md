# 故事台阶模块

`modules/lfx/` 由配套仓库的 `scripts/publish_to_hub.py` 生成。不要手改这个目录。发布结果里不放 `README.md`，避免说明文件被 Pages 公开。

六个页面引用 `../../shared/account.js`，并带 `data-sync="lfx=hzxy.lfx.v1"`。

缩略图只热链目录数据里的地址。请求不带引用来源，加载失败时改用自绘占位。不下载、不入库、不缓存，也不扩展到课文、音频、PDF 或插图。服务线程继续跳过跨域请求。
