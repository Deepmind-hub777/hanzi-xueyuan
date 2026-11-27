var CACHE = "shell-v7";
var SHELL = [
  "./",
  "./index.html",
  "./level.html",
  "./series.html",
  "./progress.html",
  "./about.html",
  "./signup.html",
  "./app.css",
  "./app.js",
  "./data/links.js",
  "./i18n/pack.js",
  "./manifest.json",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/icon.svg"
];

function cleanResponse(response) {
  if (!response || response.redirected !== true) return Promise.resolve(response);
  return Promise.resolve(new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: new Headers(response.headers)
  }));
}

function store(cache, request, response) {
  if (!response || response.status < 200 || response.status > 299) return Promise.resolve(response);
  var copy = response.clone();
  return cache.put(request, copy).then(function () {
    return response;
  });
}

self.addEventListener("install", function (event) {
  event.waitUntil(caches.open(CACHE).then(function (cache) {
    return Promise.all(SHELL.map(function (path) {
      return fetch(path, { redirect: "follow" }).then(function (response) {
        return cleanResponse(response).then(function (clean) {
          return store(cache, path, clean);
        });
      });
    }));
  }).then(function () {
    return self.skipWaiting();
  }));
});

self.addEventListener("activate", function (event) {
  event.waitUntil(caches.keys().then(function (keys) {
    return Promise.all(keys.filter(function (key) {
      return key !== CACHE;
    }).map(function (key) {
      return caches.delete(key);
    }));
  }).then(function () {
    return self.clients.claim();
  }));
});

function navigationCandidates(url) {
  var path = url.pathname;
  var list = [path];
  function add(next) {
    if (!next) next = "/";
    if (list.indexOf(next) === -1) list.push(next);
  }
  if (path.endsWith(".html")) {
    var bare = path.slice(0, -5) || "/";
    add(bare);
    if (bare.endsWith("/index")) add(bare.slice(0, -"index".length));
  } else if (path.endsWith("/")) {
    add(path + "index.html");
  } else {
    add(path + ".html");
    if (path.endsWith("/index")) add(path.slice(0, -"index".length) || "/");
  }
  return list.map(function (item) {
    return url.origin + item;
  });
}

function matchNavigation(request) {
  var url = new URL(request.url);
  var candidates = navigationCandidates(url);
  return caches.open(CACHE).then(function (cache) {
    return candidates.reduce(function (chain, candidate) {
      return chain.then(function (hit) {
        if (hit) return hit;
        return cache.match(candidate, { ignoreSearch: true });
      });
    }, Promise.resolve(undefined));
  });
}

function networkNavigate(request) {
  return fetch(request.url, { redirect: "follow", credentials: "same-origin" }).then(function (response) {
    return cleanResponse(response);
  }).then(function (clean) {
    return caches.open(CACHE).then(function (cache) {
      return store(cache, request, clean);
    });
  });
}

function cacheFirst(request) {
  return caches.match(request, { ignoreSearch: true }).then(function (hit) {
    if (hit) return hit;
    return fetch(request).then(function (response) {
      return cleanResponse(response).then(function (clean) {
        return caches.open(CACHE).then(function (cache) {
          return store(cache, request, clean);
        });
      });
    });
  });
}

self.addEventListener("fetch", function (event) {
  var url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;
  if (event.request.method !== "GET") return;
  if (event.request.mode === "navigate") {
    event.respondWith(networkNavigate(event.request).catch(function () {
      return matchNavigation(event.request).then(function (hit) {
        return hit || Promise.reject(new Error("offline"));
      });
    }));
    return;
  }
  event.respondWith(cacheFirst(event.request));
});
