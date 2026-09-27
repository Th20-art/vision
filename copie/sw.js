/* Service worker — Vision (PWA)
   - manifest.json + navigations HTML : network-first (toujours à jour)
   - autres ressources (images, svg…) : cache-first avec mise à jour en arrière-plan */
const CACHE = 'vision-copie-v9';
const CORE = [
  './',
  'index.html',
  'css/base.css', 'css/app.css', 'css/demos.css',
  'js/core.js', 'js/esprit-critique.js', 'js/amazon.js', 'js/dynamic-island.js',
  'js/onboarding.js', 'js/ambitions.js', 'js/progression.js', 'js/game.js', 'js/g-accueil.js', 'css/g-accueil.css', 'js/g-celebration.js', 'css/g-celebration.css', 'js/g-serie.js', 'css/g-serie.css', 'js/g-quetes.js', 'css/g-quetes.css', 'js/g-ligue.js', 'css/g-ligue.css', 'js/g-boutique.js', 'css/g-boutique.css', 'js/g-mascotte.js', 'css/g-mascotte.css', 'js/g-rappels.js', 'css/g-rappels.css', 'js/affiner.js', 'js/ia-chat.js', 'js/capsule.js', 'js/boot.js'
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
      Promise.all(keys.filter(k => k.startsWith('vision-copie-') && k !== CACHE).map(k => caches.delete(k)))
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
