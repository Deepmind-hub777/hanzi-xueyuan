/* 汉字学园 · 共享顶栏：<script src="(相对路径)/shared/hubbar.js" data-hub="(回到首页的相对路径)" data-title="模块名"></script>
   模块单独运行（没有 shared/ 目录）时，这个脚本加载不到，模块照常使用。 */
(function () {
  var me = document.currentScript; if (!me) return;
  var hub = me.getAttribute('data-hub') || '../../';
  var title = me.getAttribute('data-title') || '';
  var css = document.createElement('style');
  css.textContent =
    '@font-face{font-family:"HubBrush";src:url("' + hub + 'shared/fonts/hub-brush.woff2?v=2") format("woff2");font-display:swap}' +
    '@font-face{font-family:"HubBrush";src:url("' + hub + 'shared/fonts/hub-brush-qian.woff2") format("woff2");unicode-range:U+5343;font-display:swap}' +
    ':root{--hubbar-h:calc(48px + env(safe-area-inset-top,0px))}' +
    'body.in-hub{padding-top:var(--hubbar-h)!important}' +
    '.hubbar{position:fixed;z-index:9999;top:0;left:0;right:0;height:var(--hubbar-h);padding:env(safe-area-inset-top,0px) max(10px,env(safe-area-inset-right,0px)) 0 max(10px,env(safe-area-inset-left,0px));' +
    'display:flex;align-items:center;gap:8px;background:rgba(246,239,224,.94);-webkit-backdrop-filter:blur(8px);backdrop-filter:blur(8px);border-bottom:1px solid #d9c7a6;box-shadow:0 2px 10px rgba(80,60,30,.08);box-sizing:border-box;' +
    'font-family:-apple-system,"PingFang SC","Hiragino Sans GB","Microsoft YaHei","Noto Sans CJK SC",sans-serif}' +
    '.hubbar a.hubbar-back{flex:none;white-space:nowrap;display:inline-flex;align-items:center;gap:6px;min-height:44px;min-width:44px;padding:0 12px 0 8px;border-radius:22px;color:#5b3f1f;text-decoration:none;font-size:15px;box-sizing:border-box}' +
    '.hubbar a.hubbar-back:hover,.hubbar a.hubbar-back:focus-visible{background:#eadbbf;outline:none}' +
    '.hubbar a.hubbar-back:focus-visible{box-shadow:0 0 0 3px #b77f3e}' +
    '.hubbar svg{width:20px;height:20px;flex:none}' +
    '.hubbar .hubbar-brand{font-family:"HubBrush","KaiTi","STKaiti",serif;font-size:22px;line-height:1}' +
    '.hubbar .hubbar-title{flex:none;margin-left:auto;font-family:"HubBrush","KaiTi","STKaiti",serif;font-size:21px;color:#2b231b;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;padding-right:4px}' +
    /* 手机：返回链接和标题永不换行；空间不够时先缩登录按钮（昵称省略），再缩字号 */
    '@media (max-width:480px){.hubbar{gap:4px}.hubbar a.hubbar-back{gap:4px;padding:0 8px 0 4px}.hubbar .hubbar-brand{font-size:19px}.hubbar .hubbar-title{font-size:19px}.hubbar .hubbar-title.long{font-size:16px}}' +
    '@media (max-width:359px){.hubbar a.hubbar-back{padding:0 4px 0 0;min-width:0}.hubbar svg{width:18px;height:18px}.hubbar .hubbar-brand{font-size:16px}.hubbar .hubbar-title{font-size:16px}.hubbar .hubbar-title.long{font-size:14px}}' +
    '@media print{.hubbar{display:none}body.in-hub{padding-top:0!important}}';
  document.head.appendChild(css);
  function mount() {
    if (document.querySelector('.hubbar')) return;
    var bar = document.createElement('nav'); bar.className = 'hubbar'; bar.setAttribute('aria-label', '汉字学园');
    bar.innerHTML = '<a class="hubbar-back" href="' + hub + '" aria-label="返回汉字学园首页">' +
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5l-7 7 7 7" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>' +
      '<span class="hubbar-brand">汉字学园</span></a><span class="hubbar-title"></span>';
    var tt = bar.querySelector('.hubbar-title'); tt.textContent = title; if (title.length > 5) tt.className += ' long';
    document.body.insertBefore(bar, document.body.firstChild);
    document.body.classList.add('in-hub');
    document.documentElement.classList.add('in-hub');
  }
  if (document.body) mount(); else document.addEventListener('DOMContentLoaded', mount);
})();
