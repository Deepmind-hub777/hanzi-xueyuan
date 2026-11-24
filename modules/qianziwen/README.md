# 千字文互动学习

> 用一千个不重复的字，串起天文、地理、器物与人事。本课程以繁体字形教学：
> 繁体保留造字的构件与语义线索，是 AI 时代仍然稀缺的那种纵深。
> 记忆交给韵文，判断留给自己。——详见 [`docs/teaching-purpose.md`](docs/teaching-purpose.md)

## 本地预览

在本目录运行任意静态服务器，例如 `python3 -m http.server 4173`，再打开 `http://localhost:4173/`。（汉字学园版没有复制原仓库的 `tools/`、测试和交接文档，原始文件见 [tncg-native-cognition-graph](https://github.com/Deepmind-hub777/tncg-native-cognition-graph/tree/feature/qianziwen-module/09-learning-library/qianziwen)。）互动课程位于根路径，顺序听读页位于 [`site/`](site/)。同一局域网内的手机也可访问电脑的局域网地址。需要自选端口时，可先设置 `PORT` 环境变量。

## 当前内容

- 正文共 250 组（1000 字），按每页四组排列，共 63 页；最后一页有两组。第 1 组「天地玄黃」是已确认的样板。
- 第 2–250 组正文拼音、简体释义及逐字释义拼音、英文短注均为待校订稿；字段状态保持 `needs_review`。
- 第 2–250 组插画已生成并登记在 `lessons.json`；仍是待教学审核的视觉草稿，状态为 `needs_review`。
- **汉字学园版：全部录音改为慢速（只有慢速，没有切换）。** 1000 个逐字录音由 Microsoft Edge TTS `zh-CN-XiaoxiaoNeural`（语速 -40%）逐字单独合成；每组整句由 4 个单字录音加 0.45 秒停顿拼成，字与字之间停顿清楚。多音字一律用同音、单一读音的替身字录音，保证读音与显示拼音一致，核对表见 [`POLYPHONES.md`](POLYPHONES.md)。原版的 Google Cloud TTS `cmn-CN-Standard-A` 常速/0.72 慢速录音不再使用。`data/audio-manifest.json` 记录每个文件实际朗读的文字。
- 笔顺数据覆盖 990 个字。缺少标准笔顺资源的 10 个字列于 [`data/stroke-gaps.json`](data/stroke-gaps.json)；界面应显示“暂无笔顺”，不可绘制伪造笔画。

## 顺序听读页

打开 `site/` 可按组查看插画、繁体原文、逐字拼音、带拼音的简体解释和英文短注，并播放慢速普通话音频。可用上一组/下一组顺序浏览、输入组号跳转，进度会显示当前组在全篇的位置。页面读取现有 `data/lessons.json`，不改变课程数据结构。

## 为什么在 AI 时代学习《千字文》

查看[中英文课程说明](site/why-qianziwen.html)：介绍繁体字形教学的理由、三种课堂用法与内容审校边界。

## 数据与复核

- `data/corpus-source.txt` 是固定版本维基文库主文的转录底稿；底本与字形异文仍待逐项核对，来源说明见 `data/sources.md`。
- 第 2–250 组释义草稿及留痕见 `data/meaning-drafts.part1..3.json`；对齐脚本为 `tools/align-pinyin.py`，合并脚本为 `tools/apply-meaning-drafts.mjs`。
- 拼音风险与 sequence-specific override 说明见 `data/pinyin-review.md`；不要在未核订时将字段状态改为 `verified`。
- 笔顺来源与授权说明见 `THIRD_PARTY_NOTICES.md`。

## 音频生成凭据

`tools/generate-audio.mjs` 支持 `TTS_ACCESS_TOKEN`、gcloud 用户凭据和 ADC 的显式凭据顺序。ADC 可能属于不同 Google 身份；未配置有效凭据时先停止并检查身份与项目，不要把 access token 写入仓库或日志。完整生成记录见 `HANDOFF.md` 与 `handoff/review-qzw-round1.md`。

## Android 真机

用户已报告第一组样板在 Android 手机上声音与描红通过。扩展到全篇后的页面和音频资产仍需在目标 Android Chrome 设备复核；桌面浏览器结果不替代真机验收。

## 汉字学园中的改动（2026-11-24）

- 来源：Deepmind-hub777/tncg-native-cognition-graph 分支 `feature/qianziwen-module`（edfca82）的 `09-learning-library/qianziwen/`，原仓库未改动。
- 录音全部换成慢速，见上文与 `POLYPHONES.md`；10 处拼音按多音字核对改正（`lessons.json` 中带 `pinyin.hubReview` 说明）。
- 新增「字的家族 · 拼詞園聯動」区块（`src/hub-links.js` + `data/pinci-links.json`）：显示每个字的部首、结构，并可跳到天天拼词园对应关卡。
- 缺笔顺的 10 个字不再请求不存在的 JSON（避免 404），直接显示占位。
- 加入共享顶栏（`../../shared/hubbar.js`）与统一风格 `hub-theme.css`。单独运行时两者缺失也不影响使用。
