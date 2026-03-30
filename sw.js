// ShowPrep Service Worker — v7
const CACHE = 'showprep-v7';

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(cache => {
      // Cache the main app shell
      return cache.addAll(['./']);
    }).catch(() => {})
  );
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  // Remove old caches from previous versions
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  if(e.request.method !== 'GET') return;
  // Skip non-http requests
  if(!e.request.url.startsWith('http')) return;
  e.respondWith(
    // Network first — always try to get fresh content
    fetch(e.request)
      .then(res => {
        if(res.ok){
          const clone = res.clone();
          caches.open(CACHE).then(cache => cache.put(e.request, clone));
        }
        return res;
      })
      .catch(() => {
        // Network failed — serve from cache
        return caches.match(e.request);
      })
  );
});
