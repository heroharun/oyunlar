# MasalPark Mobil (iOS + Android)

Üst dizindeki web oyunlarını Capacitor ile mağaza uygulamasına sarar.
Web kökü **değişmez**; `npm run www` üst dizini `www/` içine kopyalayıp
uygulamaya özel küçük düzeltmeleri uygular (`scripts/www-hazirla.mjs`):

- paket dışı: `mobil/`, `arac/`, `bulut-worker/`, `*-test*` klasörleri, `teskilat/` kaynakları (yalnız `teskilat/dist/` girer), `sw.js`, `CNAME`
- Service Worker kaydı kapatılır, `window.MASALPARK_MOBIL = true` işareti eklenir (güncellemeler mağazadan gelir)
- Portaldaki `oyun/` bağlantıları `oyun/index.html` olur (Capacitor'ın yerel sunucusu klasör adresine kök sayfayı döndürür)
- `hafizlik-ajandasi` içindeki `/manifest.json` göreli yapılır

## Komutlar (bu klasörde)

| Komut | Ne yapar |
|---|---|
| `npm run www` | web paketini `www/` içine derler |
| `npm run sync` | `www` + her iki yerel projeye kopyalar (`npx cap sync`) |
| `npm run ios` | sync + Xcode'da açar |
| `npm run android` | sync + Android Studio'da açar |
| `npm run android:debug` | sync + debug APK (`android/app/build/outputs/apk/debug/`) |

Android derlemesi için JDK 24 kullanılır (Android Studio'nun JDK'sı 25, Gradle 8.14 Groovy betiklerinde sorun çıkarıyor):
`export JAVA_HOME=$(/usr/libexec/java_home -v 24)`

## Release (mağaza) paketi

- **Android**: `npm run sync && cd android && ./gradlew bundleRelease` →
  `android/app/build/outputs/bundle/release/app-release.aab` (Play Console'a bu yüklenir).
  İmza anahtarı depo dışında: `~/.masalpark/android-imza/` (keystore + keystore.properties).
  **Bu klasörü yedekle** (parola dosyanın içinde). Google Play App Signing kullanıldığı için bu yalnızca
  yükleme anahtarıdır; kaybolursa Play Console'dan sıfırlatılabilir ama vakit kaybettirir.
- **iOS**: Apple Developer hesabı gerekir. Xcode → Signing & Capabilities → takım seç →
  Product → Archive → Distribute (TestFlight / App Store).
- Her yeni yüklemede `versionCode` (android/app/build.gradle) ve `CURRENT_PROJECT_VERSION` (Xcode) bir artar;
  `versionName` / `MARKETING_VERSION` kullanıcıya görünen sürümdür (şu an 1.0.0).

Komut satırından iOS simülatör derlemesi:
`cd ios/App && xcodebuild -project App.xcodeproj -scheme App -sdk iphonesimulator CODE_SIGNING_ALLOWED=NO build`

## Kimlikler

- Paket / bundle kimliği: `com.masalpark.app` (mağazaya yüklendikten sonra değiştirilemez)
- Uygulama adı: MasalPark
- Simge ve açılış ekranı: `assets/logo.png` ve `assets/icon-only.png` kaynaklarından
  `npx @capacitor/assets generate` ile üretildi. Kaynaklar 512 px simgeden büyütüldü;
  mağaza için 1024 px gerçek çizim gelince `assets/` içine koyup komutu tekrar çalıştır.

## Oyun eklenince

Web köküne yeni oyun eklemek yeterli; `npm run sync` sonrası yeni paket alınır.
Portal bağlantı kalıbı (`href="oyun/"`) değişirse `www-hazirla.mjs` hata verir, betik güncellenmeli.

## Sıradaki adımlar

1. Google Play Console hesabı (25 $), kimlik doğrulaması, 12 kişilik kapalı test (14 gün).
2. Apple Developer Program (99 $/yıl), Xcode'da Signing & Capabilities altında takım seçimi.
3. Gizlilik politikası sayfası (masalpark.com/gizlilik), mağaza formları.
4. Satış modeli: ücretli uygulama (uygulama içi satın alma yok). Fiyat her iki konsolda belirlenir.
