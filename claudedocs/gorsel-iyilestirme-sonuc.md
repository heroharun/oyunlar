# MasalPark — 10 oyun görsel iyileştirme sonucu

Brifteki mobil yerleşim düzeltmeleri oyunların kendi `index.html` dosyalarına uygulandı. Renkler, yazı tipi aileleri, mevcut Türkçe metinler, puanlama ve oyun kuralları korundu. Yeni metinler yalnızca Ateş & Su'nun yön önerisi ve kilitli bölüm geri bildirimi için eklendi.

| Oyun | Değişiklik | 375 × 667 ekranı |
| --- | --- | --- |
| Sesli Masallar | Kare kapak; kırpmayan görseller; görsel, metin ve sürekli görünür oynatma kontrolleri; varsayılan açık metin; yatayda iki sütun. Pakette bulunmayan MP3 yolları yerine mevcut cihaz seslendirmesine doğrudan geçiş. | [Görsel](gorsel-kontrol/sesli-masallar-375.png) |
| Namaz Vakti | Yardım üst ortada; vakit etiketleri ve küçük yazılar en az 12 px; güvenli alan üst dolgusu düzeltildi; boş geri bildirim çizgisi kaldırıldı; soru açıkken hareket kontrolleri görünmez ve dokunmaya kapalı. | [Görsel](gorsel-kontrol/namaz-vakti-375.png) |
| Kim Âlim | Yardım soru ekranında jokerlerin yanında, menülerde ayrılmış üst köşede; soru/şık grubu ortalandı; etiketler büyütüldü; yatayda iki sütun şıklar ve kaydırılabilir merdiven. | [Görsel](gorsel-kontrol/kim-alim-375.png) |
| Boyama | Tek satır başlık; ayrı kaydırılabilir resim şeridi; 44 px renk hedefleri, 8 px aralık; tek sıra kaydırılabilir palet; dört araç tek sırada; çizim alanı en az 45dvh; yatayda çizim ve araçlar yan yana. | [Görsel](gorsel-kontrol/boyama-375.png) |
| Kız Giydirme | Güvenli üst boşluk; en fazla 120 px menü kartları ve daha büyük karakter alanı; yatay yardım kartının tamamı kaydırılarak erişilebilir. | [Görsel](gorsel-kontrol/kiz-giydirme-375.png) |
| Mangala | Dikeyde 56 px kuyulu iki sütun tahta; hazneler taşların dolaşım sırasına uygun üst/alt konumda; sayı rozetleri kuyuların dışında; yatay tahta büyütüldü. PeerJS yalnızca Oda Kur/Katıl işleminde yüklenir; hata ve yeniden deneme korunur. | [Görsel](gorsel-kontrol/mangala-375.png) |
| Kelime Avı | 29 Türkçe harf dört sırada; en az 44 px klavye hedefleri; SİL/DENE ve istatistikler en az 12 px; yüksekliğe uyan ızgara; yatayda ızgara ve klavye yan yana. | [Görsel](gorsel-kontrol/kelime-375.png) |
| Yumurta Fabrikası | Açılış/yardım kartları üst ve alt kenarları erişilebilir biçimde kaydırılır; güvenli alan dolguları; küçük HUD, market ve canvas yazıları büyütüldü. Başlat düğmesinin mevcut `click` dinleyicisi çalışıyor; yeni dinleyici eklenmedi. | [Görsel](gorsel-kontrol/yumurta-375.png) |
| Dondurmacı | Dar ekranda erişilebilir adı korunan ikon Market; sığan HUD; 12 px etiketler; en az 56 px VER; büyüyen külah ve yukarı alınan kazanlar; canvas alt kontrollerinde güvenli alan payı. | [Görsel](gorsel-kontrol/dondurmaci-375.png) |
| Ateş & Su | Yardım mola yanında; hareket tuşları açıkta; 12 px skor etiketleri; yatay önerisi; kilitli bölüme dokununca mesaj ve azaltılmış hareket tercihine uyan sarsıntı. Alt güvenli alan dolgusu korundu. | [Görsel](gorsel-kontrol/ates-su-375.png) |

Ortak yardım düğmesinin iki dokunuştan sonra kaybolması, yer ayrılan dört oyunda kaldırıldı. İkonu olmayan dokuz sayfa mevcut `ikon/icon-192.png` dosyasına bağlandı; tarayıcının eksik favicon isteği önlendi.

## Doğrulama

- Chrome mobil dokunma emülasyonu: **375×667, 390×844, 412×915, 844×390, 667×375**.
- **93 ekran durumu:** 50 açılış ekranı ve 43 oyun içi ekran. Boyama doğrudan açılır; Yumurta Fabrikası yatayda mevcut dik tut uyarısını gösterir.
- Bu durumlarda belge yatay taşması, ölçülen görünür DOM kontrollerinde 44×44 px altı hedef, okunabilir DOM metinlerinde 12 px altı yazı, yardım düğmesi/kontrol çakışması, JavaScript çalışma zamanı istisnası ve HTTP 4xx/5xx görülmedi.
- [Ham ekran ölçümleri](gorsel-kontrol/ekran-olcumleri.json).
- **10 etkileşim senaryosu:** masal oynat/duraklat/sonraki, boyama ve resim seçimi, çevrimdışı Mangala hamlesi ve yön değişimi, çevrimdışı çevrimiçi-mod hata/yeniden deneme, kayıtlı 7 harf modunda Türkçe klavye, Namaz soru ve yardım, Kim Âlim yardım ve son şık, yatay giydirme yardımını kapatma, Market erişimi ve Ateş & Su kilit/tuş/mola erişimi.
- Güvenli alan senaryolarında CSS ortam değerleri test sırasında **44 px üst / 34 px alt** olarak taklit edildi. Boyama çizim alanının %45 yükseklik sınırı ve masal kontrollerinin alt güvenli alan üzerinde kalması ayrıca ölçüldü.
- **34 satır içi JavaScript betiği** `node --check` kontrolünden geçti; `git diff --check` temiz.
- `mobil/` altında **`npm run www` başarılı:** 79 sayfa işlendi, 147 dosya / 14,6 MB web paketi üretildi. Mevcut RevenueCat/Firebase yapılandırma eksikliği uyarıları görsel değişikliklerden bağımsızdır.

## Kapsam sınırları

Bu turda fiziksel telefon veya yerel iOS/Android uygulaması çalıştırılmadı; çentik payı tarayıcıda taklit edildi. Web paketleme kontrolü, native uygulama derlemesi değildir. Canlı iki cihazlı PeerJS bağlantısı ve gerçek cihazdaki ses kalitesi doğrulanmadı. Ekran hedefi ölçümleri DOM arayüz kontrollerini kapsar; canvas/SVG içindeki tüm çizim bölgeleri için genel bir 44 px garantisi değildir.

Ek gözlem: Kelime Avı'nın mevcut ilk açılış mod seçiminde, kayıt bulunmadığında 7 harf seçip Başla'ya basmak 5 harfli ilk ızgarayı koruyabiliyor. Bu, brifteki görsel kapsamın dışında kalan mevcut oyun başlangıç mantığıdır; değiştirilmedi. 7 harfli yerleşim testi kayıtlı mod tercihiyle açılarak yapıldı.
