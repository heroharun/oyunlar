/* MasalPark mağaza uygulaması katmanı (yalnız Capacitor paketine girer, web'e değil)
   - Kilit: 10 oyun ücretsiz, kalanı "Aile Paketi" tek seferlik satın almayla açılır (RevenueCat)
   - Firebase Analytics olayları + Crashlytics'e JS hataları
   Eklentilere bundler olmadan erişim: Capacitor.registerPlugin(ad) → yerel köprü */
(function () {
  'use strict';
  var AYAR = {
    ucretsiz: ['sesli-masallar', 'namaz-vakti', 'kim-alim', 'boyama', 'kiz-giydirme',
               'mangala', 'kelime', 'yumurta', 'dondurmaci', 'ates-su'],
    hak: 'aile_paketi',              /* RevenueCat entitlement kimliği */
    revenuecat: { ios: '', android: '' },   /* RevenueCat "public SDK key" — mağaza hesapları açılınca doldurulur */
    gizlilik: 'https://masalpark.com/gizlilik.html'
  };

  var C = window.Capacitor;
  if (!C || !C.registerPlugin) return;
  var platform = C.getPlatform ? C.getPlatform() : 'web';
  function eklenti(ad) { try { return C.registerPlugin(ad); } catch (e) { return null; } }
  var Analytics = eklenti('FirebaseAnalytics');
  var Crash = eklenti('FirebaseCrashlytics');
  var Purchases = eklenti('Purchases');

  /* ---- ölçüm ---- */
  function olay(ad, param) {
    if (!Analytics) return;
    try { Analytics.logEvent({ name: ad, params: param || {} }).catch(function () {}); } catch (e) {}
  }
  function hataBildir(m) {
    if (!Crash) return;
    try { Crash.recordException({ message: String(m).slice(0, 500) }).catch(function () {}); } catch (e) {}
  }
  window.addEventListener('error', function (e) {
    hataBildir((e.message || 'hata') + ' @ ' + (e.filename || '') + ':' + (e.lineno || 0));
  });
  window.addEventListener('unhandledrejection', function (e) {
    var r = e.reason; hataBildir('promise: ' + (r && r.message ? r.message : r));
  });
  olay('portal_acildi', { platform: platform });

  /* ---- kilit durumu ---- */
  var KEY = 'mp_ailePaketi';
  var acik = false;
  try { acik = localStorage.getItem(KEY) === '1'; } catch (e) {}
  function acikMi(slug) { return acik || AYAR.ucretsiz.indexOf(slug) >= 0; }
  function slugOf(a) { return (a.getAttribute('href') || '').replace(/\/.*$/, ''); }
  function acikYap(v) {
    acik = !!v;
    try { localStorage.setItem(KEY, acik ? '1' : '0'); } catch (e) {}
    rozetle();
  }

  /* ---- görünüm ---- */
  var css = document.createElement('style');
  css.textContent =
    'a.game.kilitli{filter:saturate(.55);opacity:.82}' +
    'a.game .kilitRozet{position:absolute;left:10px;top:10px;font-size:15px;line-height:1;' +
    '  background:rgba(255,255,255,.88);border:1px solid rgba(138,106,31,.45);border-radius:999px;padding:4px 6px}' +
    '#apKaplama{position:fixed;inset:0;z-index:1000;background:rgba(18,16,42,.55);display:flex;align-items:flex-end;justify-content:center}' +
    '#apKutu{width:100%;max-width:520px;background:#FBF4E1;color:#2B2419;border-radius:22px 22px 0 0;padding:22px 20px calc(22px + env(safe-area-inset-bottom));' +
    '  box-shadow:0 -10px 40px rgba(0,0,0,.35);font:16px/1.45 system-ui,-apple-system,Segoe UI,Roboto,sans-serif}' +
    '#apKutu .apBaslik{margin:0 0 6px;font-size:22px;font-weight:800;color:#2c5f4f}' +
    '#apKutu p{margin:8px 0}' +
    '#apKutu ul{margin:8px 0 12px 18px;padding:0}' +
    '#apKutu .apBtn{display:block;width:100%;margin-top:10px;padding:13px;border-radius:14px;border:1px solid #A5822F;' +
    '  background:linear-gradient(180deg,#E9CB7E,#C9A24B);color:#3A2B0C;font:inherit;font-weight:800;font-size:17px;cursor:pointer}' +
    '#apKutu .apBtn.ikincil{background:transparent;border-color:rgba(78,107,52,.4);color:#2c5f4f;font-weight:700;font-size:15px}' +
    '#apKutu .apKucuk{font-size:12.5px;color:#6b6252;margin-top:10px}' +
    '#apKutu .apKucuk a{color:#2c5f4f}' +
    '#apDurum{min-height:20px;font-weight:700;color:#2c5f4f}';
  document.head.appendChild(css);

  var rozetleMesgul = false;
  function rozetle() {
    if (rozetleMesgul) return;
    rozetleMesgul = true;
    try {
      var kartlar = document.querySelectorAll('a.game');
      for (var i = 0; i < kartlar.length; i++) {
        var a = kartlar[i], var_ = a.querySelector('.kilitRozet');
        if (acikMi(slugOf(a))) {
          if (var_) var_.remove();
          a.classList.remove('kilitli');
        } else if (!var_) {
          var s = document.createElement('span');
          s.className = 'kilitRozet'; s.textContent = '🔒'; s.setAttribute('aria-label', 'Aile Paketi ile açılır');
          a.appendChild(s); a.classList.add('kilitli');
        }
      }
      var r = document.getElementById('ailePaketiRozet');
      if (r) r.textContent = acik ? '✓ AİLE PAKETİ AKTİF' : '🔒 AİLE PAKETİ: TÜM OYUNLAR';
    } finally { rozetleMesgul = false; }
  }
  var zaman = null;
  new MutationObserver(function () {
    if (rozetleMesgul) return;
    clearTimeout(zaman); zaman = setTimeout(rozetle, 60);
  }).observe(document.body, { childList: true, subtree: true });
  rozetle();

  /* kilitli karta dokunma → Aile Paketi ekranı; açık karta dokunma → olay */
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a.game');
    if (!a || (e.target.closest && e.target.closest('.favBtn'))) return;
    var k = slugOf(a);
    if (acikMi(k)) { olay('oyun_acildi', { oyun: k }); return; }
    e.preventDefault(); e.stopImmediatePropagation();
    goster(k);
  }, true);
  var rozetBtn = document.getElementById('ailePaketiRozet');
  if (rozetBtn) rozetBtn.addEventListener('click', function () { goster('rozet'); });

  /* ---- RevenueCat ---- */
  var anahtar = AYAR.revenuecat[platform] || '';
  var rcHazir = null;   /* Promise<boolean> */
  function rcBaslat() {
    if (rcHazir) return rcHazir;
    if (!Purchases || !anahtar) return (rcHazir = Promise.resolve(false));
    rcHazir = Purchases.configure({ apiKey: anahtar })
      .then(function () { return Purchases.getCustomerInfo(); })
      .then(function (r) { musteriIsle(r && r.customerInfo); return true; })
      .catch(function (e) { hataBildir('revenuecat: ' + (e && e.message)); return false; });
    return rcHazir;
  }
  function musteriIsle(ci) {
    var aktif = !!(ci && ci.entitlements && ci.entitlements.active && ci.entitlements.active[AYAR.hak]);
    if (aktif !== acik) acikYap(aktif);
  }
  function paketGetir() {
    return Purchases.getOfferings().then(function (o) {
      var cur = o && o.current;
      var p = cur && cur.availablePackages && cur.availablePackages[0];
      if (!p) throw new Error('paket yok');
      return p;
    });
  }
  rcBaslat();

  /* ---- Aile Paketi ekranı ---- */
  var kaplama = null;
  function kapat() { if (kaplama) { kaplama.remove(); kaplama = null; } }
  function goster(kaynak) {
    kapat();
    olay('aile_paketi_goruntulendi', { kaynak: kaynak || '' });
    kaplama = document.createElement('div'); kaplama.id = 'apKaplama';
    kaplama.innerHTML =
      '<div id="apKutu" role="dialog" aria-labelledby="apBaslik">' +
      '<div class="apBaslik" id="apBaslik" role="heading" aria-level="2">🎁 Aile Paketi</div>' +
      '<p>MasalPark\'ta <b>10 oyun ücretsiz</b>. Aile Paketi ile <b>77 oyunun tamamı</b> ve bundan sonra eklenecek her yeni oyun açılır.</p>' +
      '<ul><li>Tek seferlik ödeme, abonelik yok</li><li>Reklam yok, üyelik yok</li>' +
      '<li>Aynı mağaza hesabındaki tüm cihazlarda geçerli</li></ul>' +
      '<p id="apDurum"></p>' +
      '<button class="apBtn" id="apAl">Aile Paketi\'ni Al <span id="apFiyat"></span></button>' +
      '<button class="apBtn ikincil" id="apGeri">Satın alımları geri yükle</button>' +
      '<button class="apBtn ikincil" id="apKapat">Şimdi değil</button>' +
      '<p class="apKucuk">Satın alma mağaza hesabın üzerinden yapılır; çocuğun yerine bir yetişkin onaylamalı. ' +
      '<a href="' + AYAR.gizlilik + '">Gizlilik</a></p>' +
      '</div>';
    document.body.appendChild(kaplama);
    var durum = kaplama.querySelector('#apDurum'), fiyat = kaplama.querySelector('#apFiyat');
    var al = kaplama.querySelector('#apAl'), geri = kaplama.querySelector('#apGeri');
    kaplama.querySelector('#apKapat').addEventListener('click', kapat);
    kaplama.addEventListener('click', function (e) { if (e.target === kaplama) kapat(); });

    if (acik) { durum.textContent = '✓ Aile Paketi bu cihazda aktif.'; al.disabled = true; al.style.opacity = '.5'; }

    var paket = null;
    rcBaslat().then(function (hazir) {
      if (!hazir) {
        durum.textContent = 'Satın alma, uygulamanın mağaza yayınıyla birlikte açılacak.';
        al.disabled = true; al.style.opacity = '.5';
        return;
      }
      return paketGetir().then(function (p) {
        paket = p;
        var ps = p.product && (p.product.priceString || p.product.price);
        if (ps) fiyat.textContent = '· ' + ps;
      }).catch(function (e) { durum.textContent = 'Fiyat alınamadı, interneti kontrol et.'; hataBildir('offerings: ' + (e && e.message)); });
    });

    al.addEventListener('click', function () {
      if (!paket || al.disabled) return;
      al.disabled = true; durum.textContent = 'Mağaza açılıyor…';
      Purchases.purchasePackage({ aPackage: paket }).then(function (r) {
        musteriIsle(r && r.customerInfo);
        if (acik) { olay('satin_alma_tamam', {}); durum.textContent = '🎉 Teşekkürler! Tüm oyunlar açıldı.'; setTimeout(kapat, 1400); }
        else { durum.textContent = 'Satın alma tamamlanmadı.'; al.disabled = false; }
      }).catch(function (e) {
        al.disabled = false;
        if (e && e.userCancelled) { durum.textContent = ''; return; }
        durum.textContent = 'Satın alma başarısız: ' + ((e && e.message) || 'bilinmeyen hata');
        hataBildir('purchase: ' + (e && e.message));
      });
    });
    geri.addEventListener('click', function () {
      durum.textContent = 'Kontrol ediliyor…';
      rcBaslat().then(function (hazir) {
        if (!hazir) { durum.textContent = 'Mağaza bağlantısı henüz yok.'; return; }
        return Purchases.restorePurchases().then(function (r) {
          musteriIsle(r && r.customerInfo);
          olay('geri_yukleme', { sonuc: acik ? 'var' : 'yok' });
          durum.textContent = acik ? '✓ Aile Paketi geri yüklendi.' : 'Bu hesapta Aile Paketi bulunamadı.';
          if (acik) setTimeout(kapat, 1400);
        });
      }).catch(function (e) { durum.textContent = 'Geri yükleme başarısız.'; hataBildir('restore: ' + (e && e.message)); });
    });
  }

  window.MP_KILIT = { acikMi: acikMi, goster: goster, olay: olay };
})();
