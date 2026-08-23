// Bumped so the shell cached by the previous version is dropped on activate.
// The fetch handler answers from cache first, so without a new name a returning
// visitor would keep getting the old index.html for one more visit.
const CACHE_NAME = 'neuroforge-v2';
// Relative to the worker's own location: the same file is served from
// /neuroplasticity-trainer/ on Pages and from / on neuro.alftech.space, and the
// hardcoded Pages paths cached the wrong thing on the second of those.
const ASSETS = [
  './',
  './index.html',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cached) => {
      const fetched = fetch(event.request).then((response) => {
        if (response && response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        }
        return response;
      }).catch(() => cached);
      return cached || fetched;
    })
  );
});
