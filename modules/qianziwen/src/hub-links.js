// 汉字学园 · 跨模块联动：千字文的字 → 天天拼词园主园关卡 / 后花园部首与结构。
// 数据：data/pinci-links.json（由拼词园数据生成，繁→简用 OpenCC）。模块单独运行时若没有拼词园，只显示部首信息。
let linksPromise;
const loadLinks = () => (linksPromise ??= fetch('data/pinci-links.json').then((r) => (r.ok ? r.json() : { chars: {} })).catch(() => ({ chars: {} })));
const PINCI = '../pinci/';

export async function renderHubLinks(root, characters, pinyins) {
  const { chars } = await loadLinks();
  root.replaceChildren();
  characters.forEach((character, index) => {
    const info = chars[character];
    const card = document.createElement('article'); card.className = 'hub-link-card';
    const head = document.createElement('p'); head.className = 'hub-link-head';
    const big = document.createElement('span'); big.className = 'hub-link-char'; big.textContent = character;
    head.append(big);
    if (info?.s && info.s !== character) { const s = document.createElement('span'); s.className = 'hub-link-simp'; s.textContent = `简 ${info.s}`; head.append(s); }
    const py = document.createElement('span'); py.className = 'hub-link-py'; py.textContent = pinyins[index] ?? ''; head.append(py);
    card.append(head);
    const facts = document.createElement('p'); facts.className = 'hub-link-facts';
    if (info?.radical) {
      const struct = info.sub ? `${info.structure}（${info.sub}）` : info.structure;
      facts.textContent = `部首「${info.radical}」${info.radicalName} · ${struct}结构`;
    } else facts.textContent = '部首与结构资料暂缺';
    card.append(facts);
    const row = document.createElement('p'); row.className = 'hub-link-row';
    if (info?.lv) { const a = document.createElement('a'); a.href = `${PINCI}#lv=${info.lv}`; a.textContent = `拼词园 第 ${info.lv} 关`; a.title = `去天天拼词园，看「${info.s}」里藏着哪些字`; row.append(a); }
    if (info?.bs) { const a = document.createElement('a'); a.href = `${PINCI}#bs=${info.bs}`; a.textContent = `后花园 第 ${info.bs} 关`; a.title = '去后花园练部首与结构'; row.append(a); }
    if (row.childElementCount) card.append(row);
    root.append(card);
  });
}
