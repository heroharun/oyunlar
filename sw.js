/* Oyun Salonu SW — kurulumda TÜM oyunları indirir (internetsiz oynanır),
   internet varken her açılışta sunucudan taze sürüm çeker (güncel kalır) */
const CACHE = 'oyunlar-v4';

/* çevrimdışı paket: portal + tüm oyunlar (SW konumuna göre göreli çözülür) */
const PAKET = ['./', 'manifest.json',
  'ikon/icon-192.png', 'ikon/icon-512.png', 'ikon/apple-touch-icon.png',
  '2048/', '2248/', 'aklin-ters-kosesi/', 'anka/', 'arkeolog/', 'ates-su/',
  'ayna-araba/', 'bereket/', 'blok-yagmuru/', 'boltbloom/', 'boyama/',
  'buz-kule/', 'cop-basket/', 'denge-ustasi/', 'dondurmaci/', 'donerci/',
  'duble-yol/', 'fatihin-toplari/',
  'gokyuzu-kartali/', 'hafizlik-ajandasi/', 'hal/', 'hikmet-yolculari/',
  'hokey/', 'isikli-hafiza/', 'iyilik-adasi/', 'kelime/', 'kelime-bahcesi/',
  'kelime-yorungesi/', 'kim-alim/', 'kos-zipla/', 'kuafor/', 'kuafor-salonum/',
  'kule/', 'kutlu-yolculuk/', 'maden/', 'mayin/', 'meyve/', 'minik-cicekci/',
  'minik-modaci/', 'minik-nalbur/', 'minik-sifaci/', 'namaz-vakti/',
  'nur-bahcesi/', 'nur-tahti/', 'ormanci/', 'penalti/', 'piyano/', 'postane/',
  'renk-tuzagi/', 'sekerci-bizim/', 'sudoku/', 'tava-tabak/', 'tesettur-butigi/',
  'teskilat/', 'topac-sumo/', 'tugla-kiran/', 'usta-sofor/', 'yikim/', 'yilan/',
  'yorunge/', 'yumurta/'];

self.addEventListener('install', e => {
  e.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    /* tek tek indir: biri hata verirse kurulum bozulmasın */
    await Promise.all(PAKET.map(async u => {
      try {
        const r = await fetch(u, { cache: 'no-cache' });
        if (r && r.ok) await cache.put(u, r);
      } catch (err) {}
    }));
    self.skipWaiting();
  })());
});

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
      /* önce ağ: sayfa açılışlarında HTTP önbelleğini atla ki oyunlar hep güncel gelsin */
      const fresh = await fetch(req.mode === 'navigate'
        ? new Request(req.url, { cache: 'no-cache' }) : req);
      if (fresh && fresh.ok) cache.put(req, fresh.clone());
      return fresh;
    } catch (err) {
      /* çevrimdışı: önbellekten ver */
      const hit = await cache.match(req, { ignoreSearch: true });
      if (hit) return hit;
      /* .../oyun/index.html gibi istekleri .../oyun/ kaydına düşür */
      if (req.mode === 'navigate') {
        const kok = await cache.match(req.url.replace(/index\.html$/, ''), { ignoreSearch: true });
        if (kok) return kok;
        /* kapsam kökü: github.io'da /oyunlar/, masalpark.com'da / — ikisinde de çalışır */
        const portal = await cache.match(self.registration.scope);
        if (portal) return portal;
      }
      throw err;
    }
  })());
});
