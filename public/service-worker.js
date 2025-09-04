const CACHE = "cookbook-cache-v4";
const scopePath = self.registration?.scope
  ? new URL(self.registration.scope).pathname
  : "/";
const toPath = (p) =>
  new URL(p, self.registration?.scope || self.location).pathname;
const BASE = toPath("./"); // resolves to scope root e.g., '/cook-easy/' or '/'
const INDEX = toPath("index.html");
const ASSETS = [BASE, INDEX, toPath("manifest.webmanifest?v=2")];

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => cache.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.map((k) => k !== CACHE && caches.delete(k)))
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  const url = new URL(e.request.url);
  // Network-first for navigation, cache-first for static
  if (e.request.mode === "navigate") {
    e.respondWith(
      fetch(e.request)
        .then((resp) => {
          const copy = resp.clone();
          // Cache the index.html for offline navigations
          caches.open(CACHE).then((c) => c.put(INDEX, copy));
          return resp;
        })
        .catch(() => caches.match(INDEX))
    );
    return;
  }
  // Always fetch latest recipe.json (do not serve from cache)
  if (url.pathname.endsWith('/recipe.json')) {
    e.respondWith(
      fetch(e.request, { cache: 'no-store' }).catch(() => caches.match(e.request))
    );
    return;
  }
  e.respondWith(
    caches.match(e.request).then(
      (cached) =>
        cached ||
        fetch(e.request).then((resp) => {
          const copy = resp.clone();
          caches.open(CACHE).then((c) => c.put(e.request, copy));
          return resp;
        })
    )
  );
});
