/* Kelime Yörüngesi — çevrimdışı önbellek.
   Dosyalarda değişiklik yaptığında CACHE sürümünü artır. */

const CACHE = 'kelime-yorungesi-v1';

const ASSETS = [
  './',
  './index.html',
  './style.css',
  './dictionary.js',
  './levels.js',
  './scenes.js',
  './audio.js',
  './game.js',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

self.addEventListener('install', function (e) {
  e.waitUntil(
    caches.open(CACHE).then(function (c) { return c.addAll(ASSETS); }).then(function () {
      return self.skipWaiting();
    })
  );
});

self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.map(function (k) {
        return k === CACHE ? null : caches.delete(k);
      }));
    }).then(function () { return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function (e) {
  const req = e.request;
  if (req.method !== 'GET') return;
  e.respondWith((async function () {
    const cache = await caches.open(CACHE);
    try {
      // önce ağ: oyun hep güncel kalsın
      const fresh = await fetch(req);
      if (fresh && fresh.ok) cache.put(req, fresh.clone());
      return fresh;
    } catch (err) {
      // çevrimdışı: önbellekten ver
      const hit = await cache.match(req, { ignoreSearch: true });
      if (hit) return hit;
      const shell = await cache.match('./index.html');
      if (shell && req.mode === 'navigate') return shell;
      throw err;
    }
  })());
});
