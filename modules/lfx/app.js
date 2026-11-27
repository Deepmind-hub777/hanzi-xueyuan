(function () {
  var DATA = window.LINKS;
  var ZH = {
    "about.compare": "这里是公开页面的目录。",
    "about.did": "这里有级别、系列、集号、外链、本地勾选和界面语言。",
    "about.not": "课文、音频、练习和绘本仍在第三方官方站。用学园昵称登录后，看过的进度会保存，并同步到其他设备。Quiz、词汇、游戏、打印需要在第三方官方站登录。",
    "about.page": "单集没有单独地址。打开后到的是该集所在的系列页，页码用底表里的地址，没有另算。",
    "about.parts": "卡片底部的 Quiz、词汇、游戏、打印是链接，需要登录第三方官方站。文和听不单独列出。",
    "about.thumb": "缩略图仍在原地址。加载失败时只留下灰色占位，不把图片存进本站。",
    "about.title": "关于",
    "common.about": "关于",
    "common.back": "返回",
    "common.draft_note": "本版只有目录卡，没有课程页。",
    "common.episodes": "集",
    "common.export": "导出 JSON",
    "export.title": "导出学习记录",
    "export.csv": "导出 CSV",
    "export.json": "导出 JSON",
    "export.scope_one": "当前读者",
    "export.scope_all": "全部读者",
    "export.hint": "记录只存在这台设备上。子账号请用昵称，不要填真名。",
    "common.home": "首页",
    "common.lang": "语言",
    "common.missing": "没有这一条目录。",
    "common.need_network": "需要联网才能打开。",
    "common.open": "打开",
    "common.prereq_note": "这 6 个系列在底表里记在 L1 之下，这里单独列出。",
    "common.progress": "进度",
    "common.seen": "已看",
    "common.series": "系列",
    "common.source": "来源：第三方官方站（公开免费页）",
    "common.thai_review": "待泰籍中文老师审校",
    "common.total": "底表",
    "install.add": "用浏览器菜单把这个目录加到主屏幕。",
    "install.dismiss": "关闭",
    "level.pre": "语音前置",
    "local.title": "自建课（draft）",
    "parts.offer": "官方站提供：",
    "series.login": "Quiz、词汇、游戏、打印需要登录。",
    "series.compact": "试看 30 秒。黑屏就点一下。",
    "link.quiz": "练习",
    "link.words": "词汇",
    "link.game": "游戏",
    "link.print": "打印",
    "link.need": "需登录",
    "part.mp3": "听",
    "part.print": "印",
    "part.quiz": "练",
    "part.star": "星",
    "part.text": "文",
    "part.vocab": "词",
    "profile.add": "增加读者",
    "profile.full": "最多 3 个读者。",
    "profile.label": "读者",
    "profile.name": "名字",
    "profile.placeholder": "数字或昵称",
    "progress.levels": "各级",
    "progress.overview": "总已看",
    "profile.rename": "改名",
    "progress.days": "近 7 天",
    "progress.subset": "语音前置已经算在 L1 里，不另计入总集数。",
    "progress.title": "进度",
    "series.both": "标 {listed}，现有 {open} 可访问",
    "signup.entry": "第一次用？先免费注册",
    "signup.open": "打开官方网站",
    "signup.preview": "未登录只能试看 30 秒",
    "signup.remind": "由家长或老师协助注册。账号和密码只在官方网站填写，本网页不收集任何账号信息。",
    "signup.remind_title": "请注意",
    "signup.step1": "打开官方网站，找到注册。",
    "signup.step2": "用家长邮箱免费注册。",
    "signup.step3": "登录后回到本网页，点系列链接。在同一个浏览器里，登录状态会保留。",
    "signup.steps_title": "怎么做",
    "signup.title": "先注册再观看",
    "signup.why": "不登录只能试看 30 秒。注册和登录是免费的。",
    "signup.why_title": "为什么要注册"
  };
  var PARTS = ["quiz", "vocab", "text", "mp3", "print", "star"];

  function lang() {
    var stored = localStorage.getItem("hzy.lang.v1");
    if (stored === "zh" || stored === "en" || stored === "th") return stored;
    return "en";
  }

  function t(key) {
    return line(lang(), key);
  }

  function line(code, key) {
    var table = window.I18N_PACK && window.I18N_PACK[code];
    if (table && table[key]) return table[key];
    if (code === "zh" && ZH[key]) return ZH[key];
    return "";
  }

  function langOrder() {
    if (lang() === "th") return ["th", "en", "zh"];
    if (lang() === "zh") return ["zh", "en", "th"];
    return ["en", "th", "zh"];
  }

  function triRaw(map) {
    var wrap = el("div", "tri");
    langOrder().forEach(function (code, index) {
      if (!map[code]) return;
      var node = el("p", index === 0 ? "tri-main" : index === 1 ? "tri-sub" : "tri-minor", map[code]);
      node.lang = code === "zh" ? "zh-Hans" : code;
      wrap.appendChild(node);
    });
    return wrap;
  }

  function tri(key, role) {
    var code = lang();
    var node = el("p", role === "title" ? "page-title" : "copy", line(code, key) || line("en", key));
    node.lang = code === "zh" ? "zh-Hans" : code;
    return node;
  }

  function byDp(dp) {
    var rows = DATA && DATA.series ? DATA.series : [];
    for (var i = 0; i < rows.length; i += 1) {
      if (rows[i].dp_code === dp) return rows[i];
    }
    return null;
  }

  function query() {
    return new URLSearchParams(location.search);
  }

  function levelRows(id) {
    return DATA.series.filter(function (row) { return row.level === id; });
  }

  function preRows() {
    return DATA.series.filter(function (row) { return row.track === "prerequisite"; });
  }

  function countText(seriesCount, episodeCount) {
    return seriesCount + " " + t("common.series") + " / " + episodeCount + " " + t("common.episodes");
  }

  function accessLine(series) {
    if (series.story_count != null && series.story_count !== series.episode_count) {
      return t("series.both").replace("{listed}", series.story_count).replace("{open}", series.episode_count);
    }
    return series.episode_count + " " + t("common.episodes");
  }

  function clear(node) {
    while (node.firstChild) node.removeChild(node.firstChild);
  }

  function el(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (text != null) node.textContent = text;
    return node;
  }

  function icon(name) {
    var paths = {
      home: "M4 11 L12 4 L20 11 V20 H14 V14 H10 V20 H4 Z",
      progress: "M4 16 L8 12 L12 15 L20 6 M20 6 V11 M20 6 H15",
      about: "M12 3.5 a8.5 8.5 0 1 0 0.1 0 M12 10.5 V16.5 M12 8 h.01",
      moon: "M15 3.5 A7.5 7.5 0 1 0 19 16.5 A6 6 0 0 1 15 3.5 Z",
      sun: "M12 8 a4 4 0 1 0 0.1 0 M12 2.5 V5 M12 19 V21.5 M2.5 12 H5 M19 12 H21.5",
      check: "M6 12.5 L10.5 17 L18 8",
      quiz: "M8 8 a4 4 0 1 1 2.5 6.5 V16 M12 19 h.01",
      vocab: "M5 6 H14 a4 4 0 0 1 4 4 V19 H9 a4 4 0 0 0-4 4 Z",
      text: "M6 7 H18 M6 12 H18 M6 17 H14",
      mp3: "M8 10 H11 L16 6 V18 L11 14 H8 Z M18 9.5 a3.2 3.2 0 0 1 0 5 M20 7 a6 6 0 0 1 0 10",
      print: "M7 8 V4 H17 V8 M6 14 H18 V20 H6 Z M6 11 H18",
      star: "M12 4 L14.2 9.2 L20 9.8 L15.6 13.6 L17 19.4 L12 16.4 L7 19.4 L8.4 13.6 L4 9.8 L9.8 9.2 Z"
    };
    var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("viewBox", "0 0 24 24");
    svg.setAttribute("aria-hidden", "true");
    svg.classList.add("nav-ico");
    var path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("d", paths[name] || "");
    path.setAttribute("fill", "none");
    path.setAttribute("stroke", "currentColor");
    path.setAttribute("stroke-width", "1.8");
    path.setAttribute("stroke-linejoin", "round");
    path.setAttribute("stroke-linecap", "round");
    svg.appendChild(path);
    return svg;
  }

  function httpUrl(value) {
    try {
      var url = new URL(value);
      if (url.protocol === "https:" || url.protocol === "http:") return url.href;
    } catch (err) {
      return "";
    }
    return "";
  }

  function showToast(message) {
    var toast = document.getElementById("toast");
    if (!toast) return;
    toast.hidden = false;
    toast.textContent = message;
  }

  function readJson(key, fallback) {
    try {
      var value = JSON.parse(localStorage.getItem(key) || "");
      if (value) return value;
    } catch (err) {
      return fallback;
    }
    return fallback;
  }

  function profiles() {
    var data = readJson("hzy.profile.v1", null);
    if (!data || !Array.isArray(data.profiles) || !data.profiles.length) {
      data = { active: "p1", profiles: [{ id: "p1", name: "1" }] };
    }
    if (!data.profiles.some(function (item) { return item.id === data.active; })) {
      data.active = data.profiles[0].id;
    }
    return data;
  }

  function saveProfiles(data) {
    localStorage.setItem("hzy.profile.v1", JSON.stringify(data));
  }

  function activeProfile() {
    var data = profiles();
    for (var i = 0; i < data.profiles.length; i += 1) {
      if (data.profiles[i].id === data.active) return data.profiles[i];
    }
    return data.profiles[0];
  }

  function seenAll() {
    var data = readJson("hzy.seen.v1", {});
    return data && typeof data === "object" ? data : {};
  }

  function seenFor(id) {
    var all = seenAll();
    return all[id] && typeof all[id] === "object" ? all[id] : {};
  }

  function episodeKey(dp, n) {
    return dp + ":" + n;
  }

  function isSeen(dp, n) {
    return !!seenFor(activeProfile().id)[episodeKey(dp, n)];
  }

  function setSeen(dp, n, value) {
    var id = activeProfile().id;
    var all = seenAll();
    var mine = all[id] && typeof all[id] === "object" ? all[id] : {};
    var key = episodeKey(dp, n);
    if (value) mine[key] = today();
    else delete mine[key];
    all[id] = mine;
    localStorage.setItem("hzy.seen.v1", JSON.stringify(all));
    if (value) markToday(id);
    publishProgress();
  }

  function today() {
    var now = new Date();
    var month = String(now.getMonth() + 1).padStart(2, "0");
    var day = String(now.getDate()).padStart(2, "0");
    return now.getFullYear() + "-" + month + "-" + day;
  }

  function markToday(id) {
    var all = readJson("hzy.days.v1", {});
    var list = Array.isArray(all[id]) ? all[id] : [];
    var day = today();
    if (list.indexOf(day) === -1) list.push(day);
    all[id] = list;
    localStorage.setItem("hzy.days.v1", JSON.stringify(all));
  }


  /* ---------- 汉字学园账号（hzxy）进度镜像 ----------
     本机进度仍以 hzy.* 为准；hzxy.lfx.v1 是给 shared/account.js 同步用的镜像。
     登录后云端合并回来的数据写进 hzxy.lfx.v1，这里把它并回 hzy.*。 */
  var CLOUD_KEY = "hzxy.lfx.v1";

  function publishProgress() {
    try {
      localStorage.setItem(CLOUD_KEY, JSON.stringify({
        v: 1, seen: seenAll(), days: readJson("hzy.days.v1", {})
      }));
    } catch (e) {}
  }

  function adoptCloud() {
    var remote = null;
    try { remote = JSON.parse(localStorage.getItem(CLOUD_KEY) || "null"); } catch (e) { remote = null; }
    if (!remote || !remote.seen || typeof remote.seen !== "object") return false;
    var local = seenAll();
    var changed = false;
    Object.keys(remote.seen).forEach(function (person) {
      var theirs = remote.seen[person];
      if (!theirs || typeof theirs !== "object") return;
      var mine = local[person] && typeof local[person] === "object" ? local[person] : {};
      Object.keys(theirs).forEach(function (key) {
        if (!mine[key]) { mine[key] = theirs[key]; changed = true; }
        else if (theirs[key] && theirs[key] < mine[key]) { mine[key] = theirs[key]; changed = true; }
      });
      local[person] = mine;
    });
    if (changed) localStorage.setItem("hzy.seen.v1", JSON.stringify(local));
    var days = remote.days;
    if (days && typeof days === "object") {
      var mineDays = readJson("hzy.days.v1", {});
      var daysChanged = false;
      Object.keys(days).forEach(function (person) {
        var theirs = days[person];
        if (!Array.isArray(theirs)) return;
        var list = Array.isArray(mineDays[person]) ? mineDays[person] : [];
        theirs.forEach(function (day) {
          if (list.indexOf(day) === -1) { list.push(day); daysChanged = true; }
        });
        mineDays[person] = list;
      });
      if (daysChanged) localStorage.setItem("hzy.days.v1", JSON.stringify(mineDays));
    }
    return changed;
  }

  function recentDays(id) {
    var all = readJson("hzy.days.v1", {});
    var list = Array.isArray(all[id]) ? all[id] : [];
    var start = new Date();
    start.setHours(0, 0, 0, 0);
    start = start.getTime() - 6 * 86400000;
    var uniq = {};
    list.forEach(function (iso) {
      var time = Date.parse(iso + "T00:00:00");
      if (time >= start) uniq[iso] = true;
    });
    return Object.keys(uniq).length;
  }

  function countSeen(rows) {
    var total = 0;
    rows.forEach(function (series) {
      series.episodes.forEach(function (episode) {
        if (isSeen(series.dp_code, episode.n)) total += 1;
      });
    });
    return total;
  }

  function spineMark(text) {
    var value = String(text || "").trim();
    return value ? value.slice(0, 1) : "";
  }

  function thumb(url, mark, level) {
    var box = el("div", "thumb");
    if (level) box.classList.add("lv-" + level);
    var label = mark == null ? "" : String(mark);
    function placeholder() {
      if (box.querySelector(".ph")) return;
      var ph = el("div", "ph");
      ph.setAttribute("aria-hidden", "true");
      var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      svg.setAttribute("viewBox", "0 0 80 64");
      svg.setAttribute("aria-hidden", "true");
      var cover = document.createElementNS("http://www.w3.org/2000/svg", "rect");
      cover.setAttribute("x", "10");
      cover.setAttribute("y", "8");
      cover.setAttribute("width", "60");
      cover.setAttribute("height", "48");
      cover.setAttribute("rx", "8");
      cover.setAttribute("fill", "none");
      cover.setAttribute("stroke", "currentColor");
      cover.setAttribute("stroke-width", "3");
      var lineA = document.createElementNS("http://www.w3.org/2000/svg", "path");
      lineA.setAttribute("d", "M22 28h36M22 38h24");
      lineA.setAttribute("stroke", "currentColor");
      lineA.setAttribute("stroke-width", "3");
      lineA.setAttribute("stroke-linecap", "round");
      svg.appendChild(cover);
      svg.appendChild(lineA);
      ph.appendChild(svg);
      ph.appendChild(el("span", "ph-mark", label));
      box.appendChild(ph);
    }
    var src = httpUrl(url);
    if (!src) {
      placeholder();
      return box;
    }
    var img = document.createElement("img");
    img.alt = "";
    img.loading = "lazy";
    img.decoding = "async";
    img.referrerPolicy = "no-referrer";
    img.addEventListener("error", function () {
      img.remove();
      placeholder();
    });
    img.src = src;
    box.appendChild(img);
    return box;
  }

  function firstThumb(series) {
    var episodes = series.episodes || [];
    for (var i = 0; i < episodes.length; i += 1) {
      if (episodes[i].n === 1 && episodes[i].thumb) return episodes[i].thumb;
    }
    return episodes[0] ? episodes[0].thumb : "";
  }

  function seriesHref(series, from) {
    var href = "series.html?dp=" + encodeURIComponent(series.dp_code);
    if (from) href += "&from=" + encodeURIComponent(from);
    return href;
  }

  function bindOffline(anchor) {
    anchor.addEventListener("click", function (event) {
      if (navigator.onLine) return;
      event.preventDefault();
      showToast(t("common.need_network"));
    });
  }

  function sourceLine() {
    return el("p", "source", t("common.source"));
  }

  function backLink(href, text) {
    var link = el("a", "back", text || t("common.back"));
    link.href = href || "index.html";
    return link;
  }

  function levelTitle(id) {
    var n = String(id || "").replace(/^L/, "");
    var map = { en: "Level " + n, th: "ระดับ " + n, zh: "第 " + n + " 级" };
    var code = lang();
    var node = el("p", "tri-main", map[code] || map.en);
    node.lang = code === "zh" ? "zh-Hans" : code;
    return node;
  }

  function fixedPair(primary, secondary) {
    var wrap = el("div", "tri");
    if (primary) {
      var main = el("p", "tri-main", primary);
      main.lang = "en";
      wrap.appendChild(main);
    }
    if (secondary) {
      var sub = el("p", primary ? "tri-sub" : "tri-main", secondary);
      sub.lang = "zh-Hans";
      wrap.appendChild(sub);
    }
    return wrap;
  }

  function storyTitle(episode) {
    var en = episode.title_en || "";
    var zh = episode.title_zh || "";
    if (en && zh && en !== zh) return fixedPair(en, zh);
    return fixedPair(en || zh, "");
  }

  function seriesTitle(series) {
    var en = series.title_site || "";
    var zh = series.title_zh || "";
    if (en && zh) return fixedPair(en, zh);
    return fixedPair(en || zh, "");
  }

  function renderHome(root) {
    var hero = el("section", "hero");
    var wall = el("div", "hero-wall");
    DATA.levels.forEach(function (level) {
      var rows = levelRows(level.id);
      wall.appendChild(thumb(rows[0] ? firstThumb(rows[0]) : "", level.id, level.id));
    });
    hero.appendChild(wall);
    var copy = el("div", "hero-copy");
    copy.appendChild(tri("home.lead", "title"));
    hero.appendChild(copy);
    root.appendChild(hero);
    var steps = el("ol", "stepbar");
    ["home.flow1", "home.flow2", "home.flow3"].forEach(function (key, index) {
      var item = el("li");
      item.appendChild(el("span", "step-num", String(index + 1)));
      item.appendChild(tri(key));
      steps.appendChild(item);
    });
    root.appendChild(steps);
    root.appendChild(signupEntry());
    var grid = el("div", "grid levels");
    DATA.levels.forEach(function (level) {
      var rows = levelRows(level.id);
      var card = el("a", "card lv-" + level.id);
      card.href = "level.html?level=" + encodeURIComponent(level.id);
      card.appendChild(thumb(rows[0] ? firstThumb(rows[0]) : "", level.id, level.id));
      var body = el("div", "pad");
      body.appendChild(levelTitle(level.id));
      body.appendChild(el("p", "meta", countText(level.series_count, level.episode_count)));
      card.appendChild(body);
      grid.appendChild(card);
    });
    root.appendChild(grid);
    var pre = el("a", "card");
    pre.href = "level.html?track=pre";
    var preBody = el("div", "pad");
    preBody.appendChild(tri("level.pre", "title"));
    preBody.appendChild(el("p", "meta", countText(DATA.prerequisite.series_count, DATA.prerequisite.episode_count)));
    pre.appendChild(preBody);
    root.appendChild(pre);
  }

  function renderLevel(root) {
    var params = query();
    var track = params.get("track");
    var level = params.get("level");
    var rows = [];
    var heading = "";
    if (track === "pre") {
      rows = preRows();
      heading = t("level.pre");
    } else if (level && DATA.levels.some(function (item) { return item.id === level; })) {
      rows = levelRows(level);
      heading = level;
    }
    root.appendChild(backLink("index.html"));
    if (!heading) {
      root.appendChild(el("p", null, t("common.missing")));
      return;
    }
    root.appendChild(track === "pre" ? tri("level.pre", "title") : levelTitle(level));
    if (track === "pre") root.appendChild(tri("common.prereq_note"));
    var episodes = rows.reduce(function (sum, row) { return sum + row.episode_count; }, 0);
    root.appendChild(el("p", "meta", countText(rows.length, episodes) + " · " + t("common.seen") + " " + countSeen(rows) + "/" + episodes));
    var grid = el("div", "grid");
    rows.forEach(function (series) {
      var card = el("a", "card lv-" + (series.level || "L1"));
      card.href = seriesHref(series, track === "pre" ? "pre" : "");
      card.appendChild(thumb(firstThumb(series), spineMark(series.title_site || series.title_zh), series.level));
      var body = el("div", "pad");
      body.appendChild(seriesTitle(series));
      var seen = countSeen([series]);
      body.appendChild(el("p", "meta", accessLine(series)));
      body.appendChild(el("p", "meta", t("common.seen") + " " + seen + "/" + series.episode_count));
      card.appendChild(body);
      grid.appendChild(card);
    });
    root.appendChild(grid);
  }

  function renderSeries(root) {
    var params = query();
    var series = byDp(params.get("dp") || "");
    if (series && params.get("from") === "pre") {
      root.appendChild(backLink("level.html?track=pre"));
    } else if (series) {
      root.appendChild(backLink("level.html?level=" + encodeURIComponent(series.level)));
    } else {
      root.appendChild(backLink("index.html"));
    }
    if (!series) {
      root.appendChild(el("p", null, t("common.missing")));
      return;
    }
    root.appendChild(seriesTitle(series));
    root.appendChild(el("p", "meta", series.level + " · " + accessLine(series)));
    var notice = el("div", "series-note");
    var line1 = el("p", "note-line");
    line1.appendChild(signupEntry());
    line1.appendChild(document.createTextNode(" " + t("series.login")));
    notice.appendChild(line1);
    notice.appendChild(el("p", "note-line", t("series.compact")));
    root.appendChild(notice);
    var episodes = series.episodes.slice().sort(function (a, b) { return a.n - b.n; });
    var grid = el("div", "grid episodes");
    episodes.forEach(function (episode) {
      grid.appendChild(episodeBlock(series, episode));
    });
    root.appendChild(grid);
  }

  function episodeBlock(series, episode) {
    var wrap = el("div", "story-wrap lv-" + (series.level || "L1"));
    var seenBtn = el("button", "seen" + (isSeen(series.dp_code, episode.n) ? " on" : ""));
    seenBtn.type = "button";
    seenBtn.setAttribute("aria-label", t("common.seen"));
    seenBtn.setAttribute("aria-pressed", isSeen(series.dp_code, episode.n) ? "true" : "false");
    seenBtn.appendChild(icon("check"));
    seenBtn.addEventListener("click", function (event) {
      event.preventDefault();
      event.stopPropagation();
      var next = !isSeen(series.dp_code, episode.n);
      setSeen(series.dp_code, episode.n, next);
      seenBtn.classList.toggle("on", next);
      seenBtn.setAttribute("aria-pressed", next ? "true" : "false");
    });
    var href = httpUrl(episode.page_url);
    var card = el(href ? "a" : "div", "card");
    if (href) {
      card.href = href;
      card.target = "_blank";
      card.rel = "noopener noreferrer";
      bindOffline(card);
    }
    card.appendChild(thumb(episode.thumb, episode.n, series.level));
    var body = el("div", "pad");
    body.appendChild(storyTitle(episode));
    card.appendChild(body);
    wrap.appendChild(card);
    var foot = el("div", "card-foot");
    foot.appendChild(seenBtn);
    var kinds = [
      { kind: "quiz", part: "quiz", label: "link.quiz", prefix: "https://chinese.littlefox.com/en/quiz/main/" },
      { kind: "words", part: "vocab", label: "link.words", prefix: "https://chinese.littlefox.com/en/supplement/vocabulary/" },
      { kind: "game", part: "star", label: "link.game", prefix: "https://chinese.littlefox.com/en/starwords_h5/main/" },
      { kind: "print", part: "print", label: "link.print", prefix: "https://chinese.littlefox.com/en/supplement/printable_book/" }
    ];
    var shown = 0;
    kinds.forEach(function (item) {
      if (!(episode.parts && episode.parts[item.part] === true && episode.c_code)) return;
      if (shown) foot.appendChild(el("span", "sep", "·"));
      foot.appendChild(pieceLink(item, episode.c_code));
      shown += 1;
    });
    if (shown) foot.appendChild(el("span", "need-login", t("link.need")));
    wrap.appendChild(foot);
    return wrap;
  }

  function pieceLink(item, code) {
    var link = el("a", "foot-link");
    link.setAttribute("data-kind", item.kind);
    link.href = item.prefix + code;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.textContent = t(item.label);
    bindOffline(link);
    link.addEventListener("click", function (event) {
      event.stopPropagation();
    });
    return link;
  }

  function readerName(stored) {
    var text = String(stored || "").trim();
    var bare = text.replace(/^Reader\s+/i, "");
    return /^\d+$/.test(bare) ? bare : text;
  }

  function readerLabel(stored) {
    var bare = readerName(stored);
    if (/^\d+$/.test(bare)) return t("profile.label") + " " + bare;
    return bare;
  }

  function renderProfiles(root) {
    var data = profiles();
    var current = activeProfile();
    if (data.profiles.length > 1) {
      data.profiles.forEach(function (item) {
        var button = el("button", "block", readerLabel(item.name));
        button.type = "button";
        button.addEventListener("click", function () {
          data.active = item.id;
          saveProfiles(data);
          boot();
        });
        root.appendChild(button);
      });
    }
    var nameLabel = document.createElement("label");
    nameLabel.className = "field-label";
    nameLabel.htmlFor = "reader-name";
    nameLabel.textContent = t("profile.name");
    root.appendChild(nameLabel);
    var input = document.createElement("input");
    input.className = "text";
    input.id = "reader-name";
    input.placeholder = t("profile.placeholder");
    input.value = readerName(current.name);
    root.appendChild(input);
    var rename = el("button", "block", t("profile.rename"));
    rename.type = "button";
    rename.addEventListener("click", function () {
      var name = input.value.trim();
      if (!name) return;
      data.profiles.forEach(function (item) {
        if (item.id === current.id) item.name = name;
      });
      saveProfiles(data);
      boot();
    });
    root.appendChild(rename);
    var add = el("button", "block", t("profile.add"));
    add.type = "button";
    add.addEventListener("click", function () {
      if (data.profiles.length >= 3) {
        showToast(t("profile.full"));
        return;
      }
      var id = "p" + Date.now();
      data.profiles.push({ id: id, name: String(data.profiles.length + 1) });
      data.active = id;
      saveProfiles(data);
      boot();
    });
    root.appendChild(add);
  }

  function meter(label, got, total) {
    var row = el("div", "meter");
    row.appendChild(el("p", "meter-label", label + " " + got + "/" + total));
    var track = el("div", "meter-track");
    var fill = el("div", "meter-fill");
    fill.style.width = (total ? Math.round((got / total) * 100) : 0) + "%";
    track.appendChild(fill);
    row.appendChild(track);
    return row;
  }

  function progressGroup(title) {
    var box = el("section", "progress-group");
    box.appendChild(el("h2", "group-title", title));
    return box;
  }

  function renderProgress(root) {
    root.appendChild(tri("progress.title", "title"));
    var readers = progressGroup(t("profile.label"));
    renderProfiles(readers);
    root.appendChild(readers);
    var seen = 0;
    var bars = [];
    DATA.levels.forEach(function (level) {
      var rows = levelRows(level.id);
      var got = countSeen(rows);
      seen += got;
      bars.push(meter(level.id, got, level.episode_count));
    });
    var levels = progressGroup(t("progress.levels"));
    levels.appendChild(meter(t("progress.overview"), seen, DATA.episode_count));
    bars.forEach(function (row) { levels.appendChild(row); });
    levels.appendChild(el("p", "note", t("level.pre") + " " + countSeen(preRows()) + "/" + DATA.prerequisite.episode_count));
    levels.appendChild(el("p", "note", t("progress.subset")));
    levels.appendChild(el("p", null, t("progress.days") + " " + recentDays(activeProfile().id)));
    root.appendChild(levels);
    root.appendChild(renderOfficial());
    root.appendChild(renderRecordExport());
  }

  function renderOfficial() {
    var box = el("section", "progress-group official");
    box.appendChild(tri("official.title", "title"));
    box.appendChild(tri("official.hint"));
    var link = el("a", "block", t("official.action"));
    link.href = "https://chinese.littlefox.com/en/login";
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    box.appendChild(link);
    return box;
  }

  function renderRecordExport() {
    var box = el("section", "record-export progress-group");
    box.appendChild(tri("export.title", "title"));
    var hint = tri("export.hint");
    hint.classList.add("export-hint");
    box.appendChild(hint);
    var scopeAll = false;
    var scope = el("div", "scope");
    var one = el("button", "block on");
    one.type = "button";
    one.appendChild(tri("export.scope_one"));
    var all = el("button", "block");
    all.type = "button";
    all.appendChild(tri("export.scope_all"));
    function pick(next) {
      scopeAll = next;
      one.classList.toggle("on", !next);
      all.classList.toggle("on", next);
    }
    one.addEventListener("click", function () { pick(false); });
    all.addEventListener("click", function () { pick(true); });
    scope.appendChild(one);
    scope.appendChild(all);
    box.appendChild(scope);
    var csv = el("button", "block");
    csv.type = "button";
    csv.appendChild(tri("export.csv"));
    csv.addEventListener("click", function () { downloadRecord("csv", scopeAll); });
    var json = el("button", "block");
    json.type = "button";
    json.appendChild(tri("export.json"));
    json.addEventListener("click", function () { downloadRecord("json", scopeAll); });
    box.appendChild(csv);
    box.appendChild(json);
    return box;
  }

  function seenDate(value) {
    return typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : null;
  }

  function learningRows(allReaders) {
    var people = allReaders ? profiles().profiles : [activeProfile()];
    var index = {};
    DATA.series.forEach(function (series) {
      series.episodes.forEach(function (episode) {
        index[episodeKey(series.dp_code, episode.n)] = { series: series, episode: episode };
      });
    });
    var rows = [];
    people.forEach(function (person) {
      var mine = seenFor(person.id);
      Object.keys(mine).forEach(function (key) {
        if (!mine[key]) return;
        var hit = index[key];
        if (!hit) return;
        rows.push({
          reader: readerLabel(person.name),
          date: seenDate(mine[key]),
          level: hit.series.level,
          dp_code: hit.series.dp_code,
          series_title_en: hit.series.title_site || "",
          n: hit.episode.n,
          c_code: hit.episode.c_code || "",
          title_en: hit.episode.title_en || "",
          title_zh: hit.episode.title_zh || "",
          seen: true
        });
      });
    });
    rows.sort(function (a, b) {
      if (a.reader !== b.reader) return a.reader < b.reader ? -1 : 1;
      if (a.dp_code !== b.dp_code) return a.dp_code < b.dp_code ? -1 : 1;
      return a.n - b.n;
    });
    return rows;
  }

  function csvCell(value) {
    if (value === null || value === undefined) return "null";
    var text = String(value);
    if (/[",\n\r]/.test(text)) return '"' + text.replace(/"/g, '""') + '"';
    return text;
  }

  function learningCsv(rows) {
    var head = ["reader", "date", "level", "dp_code", "series_title_en", "n", "c_code", "title_en", "title_zh", "seen"];
    var lines = [head.join(",")];
    rows.forEach(function (row) {
      lines.push(head.map(function (key) {
        return csvCell(key === "seen" ? (row.seen ? "true" : "false") : row[key]);
      }).join(","));
    });
    return lines.join("\n") + "\n";
  }

  function downloadBlob(blob, name) {
    var link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = name;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(link.href);
  }

  function downloadRecord(kind, allReaders) {
    var rows = learningRows(allReaders);
    var stamp = today().replace(/-/g, "");
    if (kind === "csv") {
      downloadBlob(new Blob([learningCsv(rows)], { type: "text/csv;charset=utf-8" }), "story-steps-record-" + stamp + ".csv");
      return;
    }
    downloadBlob(new Blob([JSON.stringify(rows, null, 2)], { type: "application/json" }), "story-steps-record-" + stamp + ".json");
  }

  function signupEntry() {
    var link = el("a", "signup-link", t("signup.entry"));
    link.href = "signup.html";
    return link;
  }

  function renderSignup(root) {
    root.appendChild(tri("signup.title", "title"));
    root.appendChild(tri("signup.why_title", "title"));
    root.appendChild(tri("signup.why"));
    root.appendChild(tri("signup.steps_title", "title"));
    var list = el("div", "steps");
    ["signup.step1", "signup.step2", "signup.step3"].forEach(function (key) {
      var step = el("div", "step");
      step.appendChild(tri(key));
      list.appendChild(step);
    });
    root.appendChild(list);
    root.appendChild(tri("signup.remind_title", "title"));
    root.appendChild(tri("signup.remind"));
    var open = el("a", "open");
    open.appendChild(tri("signup.open"));
    open.href = "https://chinese.littlefox.com/en/user/join";
    open.target = "_blank";
    open.rel = "noopener noreferrer";
    bindOffline(open);
    root.appendChild(open);
    root.appendChild(sourceLine());
  }

  function renderAbout(root) {
    root.appendChild(tri("about.title", "title"));
    ["about.compare", "about.did", "about.not", "about.page", "about.parts", "about.thumb"].forEach(function (key) {
      root.appendChild(tri(key));
    });
    root.appendChild(sourceLine());
  }

  function renderTabs(page) {
    var bar = document.getElementById("tabbar");
    if (!bar) return;
    bar.hidden = false;
    document.body.classList.add("has-tabs");
    clear(bar);
    function link(href, key, id, glyph) {
      var node = el("a", page === id ? "on" : "");
      node.href = href;
      node.appendChild(icon(glyph));
      node.appendChild(el("span", null, t(key)));
      return node;
    }
    bar.appendChild(link("index.html", "common.home", "home", "home"));
    bar.appendChild(link("progress.html", "common.progress", "progress", "progress"));
    bar.appendChild(link("about.html", "common.about", "about", "about", "about"));
  }

  function renderInstall(root) {
    if (!window.matchMedia) return;
    var standalone = window.matchMedia("(display-mode: standalone)").matches;
    if (standalone || localStorage.getItem("hzy.install.v1") === "off") return;
    if (document.getElementById("install")) return;
    var bar = el("div", "install");
    bar.id = "install";
    bar.appendChild(el("p", null, t("install.add")));
    var button = el("button", null, t("install.dismiss"));
    button.type = "button";
    button.addEventListener("click", function () {
      localStorage.setItem("hzy.install.v1", "off");
      bar.remove();
    });
    bar.appendChild(button);
    root.insertBefore(bar, root.firstChild);
  }

  function themeMode() {
    var stored = localStorage.getItem("hzy.theme.v1");
    if (stored === "dark" || stored === "light") return stored;
    return "system";
  }

  function applyTheme() {
    var mode = themeMode();
    if (mode === "system") document.documentElement.removeAttribute("data-theme");
    else document.documentElement.setAttribute("data-theme", mode);
  }

  function renderTools(root) {
    var row = el("div", "tools");
    var brand = el("div", "brand");
    brand.appendChild(icon("vocab"));
    brand.appendChild(el("span", null, t("common.brand")));
    row.appendChild(brand);
    var langs = el("div", "langs");
    [{ id: "en", label: "EN" }, { id: "th", label: "TH" }, { id: "zh", label: "中" }].forEach(function (item) {
      var button = el("button", item.id === lang() ? "on" : "", item.label);
      button.type = "button";
      button.addEventListener("click", function () {
        localStorage.setItem("hzy.lang.v1", item.id);
        boot();
      });
      langs.appendChild(button);
    });
    row.appendChild(langs);
    var themeBtn = el("button", "tool icon-btn");
    themeBtn.type = "button";
    themeBtn.setAttribute("aria-label", themeMode() === "dark" ? t("theme.toLight") : t("theme.toDark"));
    themeBtn.appendChild(icon(themeMode() === "dark" ? "sun" : "moon"));
    themeBtn.addEventListener("click", function () {
      localStorage.setItem("hzy.theme.v1", themeMode() === "dark" ? "light" : "dark");
      boot();
    });
    row.appendChild(themeBtn);
    var acctSlot = el("span", "flow hzac-slot");
    acctSlot.id = "hzac-slot";
    row.appendChild(acctSlot);
    if (window.HZXY_ACCOUNT && window.HZXY_ACCOUNT.mountIn) window.HZXY_ACCOUNT.mountIn(acctSlot);
    root.appendChild(row);
  }

  function boot() {
    var root = document.getElementById("app");
    if (!root) return;
    adoptCloud();
    clear(root);
    var toast = document.getElementById("toast");
    if (toast) toast.hidden = true;
    applyTheme();
    document.documentElement.lang = lang() === "zh" ? "zh-Hans" : lang();
    var page = document.body.getAttribute("data-page");
    renderTabs(page);
    renderInstall(root);
    renderTools(root);
    if (!DATA || !DATA.series) {
      root.appendChild(el("p", null, t("common.missing")));
      return;
    }
    if (page === "home") renderHome(root);
    else if (page === "level") renderLevel(root);
    else if (page === "series") renderSeries(root);
    else if (page === "progress") renderProgress(root);
    else if (page === "about") renderAbout(root);
    else if (page === "signup") renderSignup(root);
  }

  window.addEventListener("hzxy-progress", function (event) {
    if (!event.detail || event.detail.module !== "lfx") return;
    if (adoptCloud()) boot();
  });

  if ((location.protocol === "http:" || location.protocol === "https:") && navigator.serviceWorker) {
    navigator.serviceWorker.register("sw.js");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
