/* 汉字学园首页：读 modules.json，按 order 排序，只显示 enabled:true 的模块。 */
(function () {
  var grid = document.getElementById('hub-grid');
  function el(tag, cls, text) { var e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; }
  function progress(id) {
    try {
      if (id === 'pinci') {
        var s = JSON.parse(localStorage.getItem('hzxy.pinci.v1') || 'null'); if (!s || !s.G) return '';
        var n = function (g) { return Object.keys((s.G[g] || {}).cleared || {}).length; }, m = n('main'), q = n('qz'), b = n('bushou');
        return (m || q || b) ? '主园 ' + m + ' · 千字文园 ' + q + ' · 后花园 ' + b + ' 关已过' : '';
      }
      if (id === 'lfx') {
        var x = JSON.parse(localStorage.getItem('hzxy.lfx.v1') || 'null');
        if (!x || !x.seen) return '';
        var total = 0;
        Object.keys(x.seen).forEach(function (p) { total += Object.keys(x.seen[p] || {}).length; });
        return total ? '已看 ' + total + ' 集' : '';
      }
    } catch (e) {}
    return '';
  }
  function refreshCard(id) {
    var c = document.getElementById('mod-' + id); if (!c) return;
    var p = progress(id), meta = c.querySelector('.card-meta');
    if (!p) { if (meta) meta.textContent = ''; return; }
    if (!meta) { meta = el('p', 'card-meta'); c.querySelector('.card-main').after(meta); }
    meta.textContent = p;
  }
  window.addEventListener('hzxy-progress', function () { refreshCard('pinci'); refreshCard('lfx'); });
  fetch('modules.json', { cache: 'no-cache' }).then(function (r) { if (!r.ok) throw new Error('modules.json ' + r.status); return r.json(); })
    .then(function (cfg) {
      if (cfg.site) {
        if (cfg.site.title) { document.getElementById('hub-title').textContent = cfg.site.title; }
        if (cfg.site.subtitle) document.getElementById('hub-sub').textContent = cfg.site.subtitle;
      }
      var mods = (cfg.modules || []).filter(function (m) { return m.enabled !== false; })
        .sort(function (a, b) { return (a.order || 0) - (b.order || 0); });
      grid.replaceChildren();
      mods.forEach(function (m) {
        var card = el('article', 'card'); card.id = 'mod-' + m.id;
        var main = el('a', 'card-main'); main.href = m.path;
        var icon = el('span', 'card-icon', m.icon || m.title.charAt(0)); icon.setAttribute('aria-hidden', 'true');
        var txt = el('span', 'card-text');
        txt.append(el('span', 'card-title', m.title), el('span', 'card-desc', m.description || ''));
        if (m.badge) txt.append(el('span', 'card-badge', m.badge));
        main.append(icon, txt); card.append(main);
        var p = progress(m.id); if (p) card.append(el('p', 'card-meta', p));
        var links = (m.links && m.links.length) ? m.links : [{ title: '进入', path: m.path }];
        var ul = el('ul', 'card-links');
        links.forEach(function (l, i) { var li = el('li'); var a = el('a', i === 0 ? 'primary' : '', l.title); a.href = l.path; li.append(a); ul.append(li); });
        card.append(ul); grid.append(card);
      });
    })
    .catch(function (e) {
      grid.replaceChildren(el('p', 'hub-error', '模块清单载入失败：' + e.message));
      console.error(e);
    });
})();
