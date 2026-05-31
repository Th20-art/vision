/* Service worker — Vision (PWA)
   - manifest.json + navigations HTML : network-first (toujours à jour)
   - autres ressources (images, svg…) : cache-first avec mise à jour en arrière-plan */
const CACHE = 'vision-v48';
const CORE = [
  './',
  'index.html'
];

self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE).then(cache => cache.addAll(CORE)).catch(() => {})
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);
  const isManifest = url.pathname.endsWith('manifest.json');
  const isDoc = req.mode === 'navigate' || req.destination === 'document';

  // network-first pour le manifest et les pages (mises à jour immédiates)
  if (isManifest || isDoc) {
    event.respondWith(
      fetch(req).then(res => {
        if (res && res.status === 200 && url.origin === self.location.origin) {
          const copy = res.clone();
          caches.open(CACHE).then(c => c.put(req, copy)).catch(() => {});
        }
        return res;
      }).catch(() => caches.match(req))
    );
    return;
  }

  // cache-first pour le reste (images, svg, polices…)
  event.respondWith(
    caches.match(req).then(cached => {
      const network = fetch(req).then(res => {
        if (res && res.status === 200 && url.origin === self.location.origin) {
          const copy = res.clone();
          caches.open(CACHE).then(c => c.put(req, copy)).catch(() => {});
        }
        return res;
      }).catch(() => cached);
      return cached || network;
    })
  );
});
