# 汉字学园 · Hanzi Xueyuan

一个模块化的汉字学习网站：首页列出各个学习模块，每个模块放在自己的文件夹里，也能单独运行。

- 在线访问：https://deepmind-hub777.github.io/hanzi-xueyuan/
- 当前模块：
  - **天天拼词园**（`modules/pinci/`）：从汉字里描出藏着的常用字（主园 900 关）；后花园考部首与结构（323 关）。
  - **千字文**（`modules/qianziwen/`）：250 组四字句，慢速朗读、拼音、释义、插画、笔顺描红、听音辨字；另有「循序听读」和「为什么学」两页。

> ⚠️ 千字文的拼音与释义仍待校订（页面上保留了「待校订」提示）。多音字核对见 [`modules/qianziwen/POLYPHONES.md`](modules/qianziwen/POLYPHONES.md)。

## 目录结构

```
index.html          首页（模块卡片）
hub.css / hub.js    首页样式与脚本：读取 modules.json 生成卡片
modules.json        模块清单（唯一需要登记的地方）
shared/
  hubbar.js         共享顶栏：「‹ 汉字学园」返回首页 + 模块名
  fonts/            首页/顶栏用的毛笔字体子集（志莽行书；「千」字用马善政体）及 OFL 授权
modules/
  pinci/            天天拼词园（index.html、game.js、style.css、data/、audio/、fonts/）
  qianziwen/        千字文（index.html、src/、site/、data/、assets/、vendor/）
.nojekyll           让 GitHub Pages 原样发布所有文件
```

## 模块清单 `modules.json`

```json
{
  "site": { "title": "汉字学园", "subtitle": "拼字 · 识字 · 读经典" },
  "modules": [
    {
      "id": "pinci",                  // 唯一 id，只用小写字母/数字/短横线
      "title": "天天拼词园",            // 卡片标题
      "description": "……",            // 一两句简介
      "icon": "拼",                    // 卡片图标：一个汉字（用毛笔字体显示）
      "path": "modules/pinci/",       // 入口，相对网站根目录
      "enabled": true,                // false = 首页不显示（文件可以留着）
      "order": 10,                    // 从小到大排序
      "badge": "可选的小标签",          // 可选
      "links": [                      // 可选：卡片上的按钮，第一个是主按钮；不写则只有「进入」
        { "title": "主园 · 字中找字", "path": "modules/pinci/" }
      ]
    }
  ]
}
```

（JSON 本身不能写注释，上面的 `//` 只是说明。）

## 怎样添加一个模块

1. 在 `modules/` 下新建文件夹，例如 `modules/chengyu/`，放入它自己的 `index.html` 和全部资源。**所有路径都用相对路径**（如 `data/x.json`、`./style.css`），不要用 `/` 开头的绝对路径，这样模块在 GitHub Pages 子路径下和单独运行时都能用。
2. 在模块每个页面的 `<head>` 或 `<body>` 末尾加入共享顶栏（`data-hub` 是回到网站根目录的相对路径，按页面所在层级写）：
   ```html
   <script src="../../shared/hubbar.js" data-hub="../../" data-title="成语乐园"></script>
   ```
   子目录里的页面（如 `modules/chengyu/sub/page.html`）就写 `../../../`。顶栏是固定定位，高 48px（加刘海安全区），脚本会给 `<body>` 加 `padding-top`，并给 `<html>`、`<body>` 加 `in-hub` 类；如果你的页面用了 `100vh` 全屏布局，参考 `modules/pinci/style.css` 末尾用 `html.in-hub` 扣掉顶栏高度。
3. 本地存储（localStorage）的键名加模块前缀：`hzxy.<模块id>.…`，例如 `hzxy.chengyu.v1`，避免和其他模块冲突。
4. 在 `modules.json` 的 `modules` 数组里加一条（id、title、description、icon、path、enabled、order，可选 links）。
5. 本地预览：在仓库根目录运行 `python3 -m http.server 8000`，打开 http://localhost:8000/ 。确认首页出现新卡片、点进去顶栏能返回首页、浏览器控制台没有报错或 404。
6. 提交并推送到 `main`，GitHub Pages 会在一两分钟内更新。

## 怎样移除或隐藏一个模块

- **暂时隐藏**：把该模块的 `"enabled"` 改成 `false`。首页不再显示，文件和旧链接仍可访问。
- **彻底删除**：从 `modules.json` 删掉那一条，再删除 `modules/<id>/` 文件夹。另外检查其他模块有没有链接到它（目前千字文会链接到 `../pinci/`；删除拼词园后，千字文页面里的「拼词园 第 N 关」按钮会失效，需要同时删掉 `modules/qianziwen/src/hub-links.js` 里的链接部分）。

## 模块之间的联动

- 千字文课程页新增「字的家族 · 拼詞園聯動」区块：每个字显示（按简化字）部首、部首名称和结构，以及
  - 「拼词园 第 N 关」：天天拼词园主园里以这个字为母字的关卡（`../pinci/#lv=N`），1000 字中 159 个有；
  - 「后花园 第 N 关」：后花园部首与结构挑战里含这个字的关卡（`../pinci/#bs=N`），774 个有。
- 数据：`modules/qianziwen/data/pinci-links.json`，由拼词园的 `data/index.js` 和 `data/bushou.js` 生成；繁→简用 OpenCC（t2s）。
- 天天拼词园支持网址 `#lv=N`（主园第 N 关）和 `#bs=N`（后花园第 N 关）直接打开关卡；从外部链接进来可以预览尚未解锁的关卡。

## 本地存储与旧进度

- 天天拼词园的进度键改为 `hzxy.pinci.v1`（原站是 `pinciwang.v1`）。千字文不使用本地存储。
- 浏览器的本地存储按网址隔离，**原来两个独立网站上的进度不会自动迁移到这里**，需要重新开始。

## 千字文录音：只有慢速

- 所有录音（整组朗读、逐字、听音辨字、循序听读页）都换成慢速，没有速度切换，也不保存设置。
- Microsoft Edge 在线 TTS（[edge-tts](https://github.com/rany2/edge-tts)），声音 `zh-CN-XiaoxiaoNeural`，语速 -40%；每个字单独录，整组 = 4 个字 + 0.45 秒停顿。
- 多音字用同音、单一读音的替身字录（如 46 组「靡恃己長」的 長 cháng 用「常」录），并用音高轮廓检查了声调；10 处拼音已改正。详见 `modules/qianziwen/POLYPHONES.md`。

## 体积

总计约 83 MB（GitHub Pages 上限 1 GB）：千字文 65 MB（插画 51 MB、录音 8.9 MB、数据和笔顺 5.6 MB），天天拼词园 19 MB，shared 约 70 KB。

## 授权与署名

- **千字文模块**：来自 [Deepmind-hub777/tncg-native-cognition-graph](https://github.com/Deepmind-hub777/tncg-native-cognition-graph) 的 `feature/qianziwen-module` 分支（edfca82），由 **Doubao Agent**、**Codex / Codex Agent** 与 **Deepmind-hub777** 协作完成。文档与教学材料采用 **CC BY 4.0**（`modules/qianziwen/LICENSE-CC-BY-4.0.txt`）。
  - Hanzi Writer 3.7.3，MIT（`modules/qianziwen/vendor/HANZI-WRITER-LICENSE.txt`）；
  - 笔顺数据 hanzi-writer-data，源自 Make Me a Hanzi，Arphic Public License（`modules/qianziwen/data/strokes/ARPHICPL.TXT`）；
  - 正文底本：维基文库《千字文》，来源见 `modules/qianziwen/data/sources.md`；插画由图像生成工具制作（待审）。
  - 汉字学园版的慢速录音：Microsoft Edge TTS `zh-CN-XiaoxiaoNeural`。
- **天天拼词园模块**：来自 [Deepmind-hub777/pinciwang](https://github.com/Deepmind-hub777/pinciwang)（d134d21），提交者 Deepmind-hub777，v6 后花园与 v7 多设备适配由 Grok Bot 完成。笔画与结构数据来自 Make Me a Hanzi（Arphic Public License / LGPL），部首依据 GF 0011-2009 / GF 0012-2009 及若干 MIT 开源字典数据；读音为 edge-tts；书法字体钟齐志莽行书（SIL OFL 1.1）。详见 `modules/pinci/README.md`。
- **共享字体**：钟齐志莽行书 Zhi Mang Xing、马善政 Ma Shan Zheng，均为 SIL Open Font License 1.1（`shared/fonts/OFL-*.txt`）。
- 汉字学园的整合（首页、模块清单、共享顶栏、联动、慢速录音、多音字核对）由 Grok Bot 完成，2026-11-24。原仓库没有改动。

## 测试

Playwright（Chrome）在 390×844（手机）、800×1280（三星平板竖屏）、1280×800（平板横屏）、1920×1080（电脑）四种尺寸下跑通：首页 → 拼词园首页/关卡/后花园 → 返回首页 → 千字文课程/联动/慢速录音（含 46 组 長 cháng）→ 联动跳转拼词园再返回 → 循序听读 → 为什么学 → 顶栏返回首页。无控制台错误、无 404、无横向溢出。
