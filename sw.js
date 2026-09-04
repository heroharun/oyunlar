/* Oyun Salonu SW — kurulumda TÜM oyunları indirir (internetsiz oynanır),
   internet varken her açılışta sunucudan taze sürüm çeker (güncel kalır) */
const CACHE = 'oyunlar-v11';

/* çevrimdışı paket: portal + tüm oyunlar (SW konumuna göre göreli çözülür) */
const PAKET = ['./', 'manifest.json',
  'ikon/icon-192.png', 'ikon/icon-512.png', 'ikon/apple-touch-icon.png',
  '2048/', '2248/', 'aklin-ters-kosesi/', 'anka/', 'arkeolog/', 'ates-su/', 'ayna-araba/', 'bedesten/', 'bereket/', 'bit-pazari/', 'blok-yagmuru/', 'boltbloom/', 'boyama/', 'buz-kule/', 'cop-basket/', 'denge-ustasi/', 'dini-tabu/', 'dondurmaci/', 'donerci/', 'duble-yol/', 'fatihin-toplari/', 'gokyuzu-kartali/', 'hafizlik-ajandasi/', 'hal/', 'hikmet-yolculari/', 'hiz-ustasi/', 'hokey/', 'isikli-hafiza/', 'itfaiye-komutani/', 'iyilik-adasi/', 'kedi/', 'kelime-bahcesi/', 'kelime-yorungesi/', 'kelime/', 'kim-alim/', 'kiz-giydirme/', 'kos-zipla/', 'kuafor-salonum/', 'kuafor/', 'kule/', 'kutlu-yolculuk/', 'maden/', 'mangala/', 'mayin/', 'mekan/', 'meyve/', 'minik-asci/', 'minik-cicekci/', 'minik-modaci/', 'minik-nalbur/', 'minik-sifaci/', 'minik-veteriner/', 'namaz-vakti/', 'nur-bahcesi/', 'nur-tahti/', 'ormanci/', 'park/', 'penalti/', 'piyano/', 'postane/', 'renk-tuzagi/', 'sekerci-bizim/', 'sesli-masallar/', 'sikke-sirala/', 'sudoku/', 'taktak/', 'tava-tabak/', 'tesettur-butigi/', 'teskilat/dist/', 'topac-sumo/', 'tugla-kiran/', 'usta-sofor/', 'yikim/', 'yilan/', 'yorunge/', 'yumurta/'];

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

/* portaldan 'tazele' gelince paketi yeniden indir (sürüm damgası değişti) */
self.addEventListener('message', e => {
  if (e.data && e.data.tip === 'tazele') {
    e.waitUntil((async () => {
      const cache = await caches.open(CACHE);
      await Promise.all(PAKET.map(async u => {
        try {
          const r = await fetch(u, { cache: 'no-cache' });
          if (r && r.ok) await cache.put(u, r);
        } catch (err) {}
      }));
      const cs = await self.clients.matchAll();
      cs.forEach(c => c.postMessage({ tip: 'tazelendi' }));
    })());
  }
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || !req.url.startsWith(self.location.origin)) return;
  e.respondWith((async () => {
    const cache = await caches.open(CACHE);
    /* ÖNBELLEKTEN ANINDA AÇ + arka planda tazele:
       iOS PWA'da SW/ağ uyanana kadar dokunuşun asılı kalmasını bitirir.
       Guncellik: internet varken arka planda taze surum cekilir (en fazla 1 acilis geride). */
    let hit = await cache.match(req, { ignoreSearch: true });
    if (!hit && req.mode === 'navigate')
      hit = await cache.match(req.url.replace(/index\.html$/, ''), { ignoreSearch: true });
    const tazele = (async () => {
      try {
        const fresh = await fetch(req.mode === 'navigate'
          ? new Request(req.url, { cache: 'no-cache' }) : req);
        if (fresh && fresh.ok) await cache.put(req, fresh.clone());
        return fresh;
      } catch (err) { return null; }
    })();
    if (hit) { e.waitUntil(tazele); return hit; }
    /* önbellekte yok: ağı bekle (ilk ziyaret), gelirse kaydet */
    const fresh = await tazele;
    if (fresh) return fresh;
    /* çevrimdışı ve önbellekte yok: gezinmeyi portala düşür */
    if (req.mode === 'navigate') {
      const portal = await cache.match(self.registration.scope);
      if (portal) return portal;
    }
    return Response.error();
  })());
});
