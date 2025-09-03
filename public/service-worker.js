
const CACHE = 'cookbook-cache-v3';
const scopePath = self.registration?.scope ? new URL(self.registration.scope).pathname : '/'
const toPath = (p) => new URL(p, self.registration?.scope || self.location).pathname
const BASE = toPath('./') // e.g., '/cook-easy/' or '/'
const ASSETS = [
  BASE,
  toPath('index.html'),
  toPath('manifest.webmanifest?v=2'),
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE).then(cache => cache.addAll(ASSETS))
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.map(k => k !== CACHE && caches.delete(k))))
  );
});

self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  // Network-first for navigation, cache-first for static
  if (e.request.mode === 'navigate') {
    e.respondWith(
      fetch(e.request).then(resp => {
        const copy = resp.clone();
        caches.open(CACHE).then(c => c.put(BASE, copy));
        return resp;
      }).catch(() => caches.match(BASE))
    );
    return;
  }
  e.respondWith(
    caches.match(e.request).then(cached => cached || fetch(e.request).then(resp => {
      const copy = resp.clone();
      caches.open(CACHE).then(c => c.put(e.request, copy));
      return resp;
    }))
  );
});
