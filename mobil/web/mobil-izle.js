/* MasalPark mağaza uygulaması: oyun sayfalarına derleme sırasında eklenir.
   Ekran olayı (hangi oyun) + JS hatalarını Crashlytics'e bildirir. Kimlik, isim, konum yok. */
(function () {
  'use strict';
  var C = window.Capacitor;
  if (!C || !C.registerPlugin) return;
  var A, K;
  try { A = C.registerPlugin('FirebaseAnalytics'); K = C.registerPlugin('FirebaseCrashlytics'); } catch (e) { return; }
  var oyun = location.pathname.replace(/^\//, '').replace(/\/index\.html$/, '').replace(/\/dist$/, '') || 'portal';
  try { A.setCurrentScreen({ screenName: oyun }).catch(function () {}); } catch (e) {}
  try { A.logEvent({ name: 'ekran', params: { oyun: oyun } }).catch(function () {}); } catch (e) {}
  function bildir(m) { try { K.recordException({ message: ('[' + oyun + '] ' + m).slice(0, 500) }).catch(function () {}); } catch (e) {} }
  window.addEventListener('error', function (e) {
    bildir((e.message || 'hata') + ' @ ' + (e.filename || '').split('/').pop() + ':' + (e.lineno || 0));
  });
  window.addEventListener('unhandledrejection', function (e) {
    var r = e.reason; bildir('promise: ' + (r && r.message ? r.message : r));
  });
})();
