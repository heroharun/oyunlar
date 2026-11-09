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

Android derlemesi için Android Studio'nun JDK'sı kullanılır:
`export JAVA_HOME="/Applications/Android Studio.app/Contents/jbr/Contents/Home"`

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
4. Aile Paketi uygulama içi satın alma: RevenueCat Capacitor eklentisi; ürün kimlikleri
   App Store Connect ve Play Console'da oluşturulduktan sonra eklenir.
5. Android imzalama anahtarı (`*.keystore`, depoya girmez) ve `bundleRelease` (AAB).
