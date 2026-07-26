/* Oyun Salonu SW — ziyaret edilen sayfaları önbelleğe alır, çevrimdışı çalıştırır */
const CACHE = 'oyunlar-v1';

self.addEventListener('install', e => { self.skipWaiting(); });
self.addEventListener('activate', e => {
  e.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || !req.url.startsWith(self.location.origin)) return;
  e.respondWith((async () => {
    const cache = await caches.open(CACHE);
    try {
      /* önce ağ: oyunlar hep güncel kalsın; başarılıysa önbelleğe yaz */
      const fresh = await fetch(req);
      if (fresh && fresh.ok) cache.put(req, fresh.clone());
      return fresh;
    } catch (err) {
      /* çevrimdışı: önbellekten ver */
      const hit = await cache.match(req, { ignoreSearch: true });
      if (hit) return hit;
      const portal = await cache.match('/oyunlar/');
      if (portal && req.mode === 'navigate') return portal;
      throw err;
    }
  })());
});
