# MasalPark — 10 ücretsiz oyun için görsel iyileştirme brifi

Bağlam: MasalPark, tek dosyalık HTML/CSS/JS oyunlardan oluşan bir çocuk oyun portalı. Oyunlar Capacitor ile
iOS ve Android mağaza uygulaması olarak paketleniyor. Her oyun kendi klasöründe tek `index.html` (CSS ve JS
dosyanın içinde). Harici kütüphane yok. Aşağıdaki sorunlar iPhone 13 (390×844), iPhone SE (375×667) ve
Pixel 7 (412×915) ekranlarında, dikey ve yatay konumda, gerçek Android emülatöründe ve tarayıcı emülasyonunda
tespit edildi.

İstenen: her oyun için listelenen sorunları ilgili `index.html` içinde düzelt. Oyun mantığına dokunma,
yalnızca düzen/CSS ve gerekiyorsa küçük DOM değişiklikleri yap. Her oyunun mevcut görsel kimliğini
(renk paleti, yazı tipi, köşe yuvarlaklığı) koru. Türkçe metinleri değiştirme.

## Genel kurallar (10 oyunun hepsine uygulanacak)

1. **Güvenli alan**: Üstte sabit duran çubuklar ve ekranın en üst satırındaki butonlar
   `padding-top: env(safe-area-inset-top)` almalı; alttaki sabit kontroller `env(safe-area-inset-bottom)`.
   Android 15 ve iOS'ta uygulama kenardan kenara çizildiği için durum çubuğu içerikle çakışıyor.
   Viewport meta'da `viewport-fit=cover` zaten var, kaldırma.
2. **Dokunma hedefi**: Çocuk uygulaması. Tıklanabilir her öğe en az 44×44 CSS px olmalı (Apple kılavuzu).
   Daha küçükse görseli büyütme yerine görünmez `padding` veya `::before` ile dokunma alanını genişlet.
3. **Yazı boyutu**: Hiçbir okunması gereken metin 12 px'in altına inmesin. 10 px etiketler var (aşağıda).
4. **Yatay taşma**: `document.scrollingElement.scrollWidth` hiçbir ekranda `innerWidth`'i aşmamalı.
   Yatay kaydırılan şeritler (kategori seçici gibi) `overflow-x:auto` ile bilinçli olmalı ve kaydırılabilir
   olduğu belli olmalı (kenarda solan gölge veya yarım görünen sonraki öğe).
5. **Yardım düğmesi `#mpNasilBtn`**: Ortak "?" düğmesi `position:fixed; left:10px; bottom:…` ile sol altta
   duruyor ve oyun kontrollerinin üstüne biniyor (Namaz Vakti'nde "Zıpla" tuşu, Ateş & Su'da sol ok tuşu,
   Kim Âlim'de son şık). Çözüm: oyun kontrolleri olan ekranlarda düğmeyi sağ üste (`top`, `right`) taşı
   ya da oyun başlayınca küçült/gizle ve duraklat menüsüne koy. Hangi köşe boşsa o köşe seçilsin;
   kural: hiçbir zaman başka bir tıklanabilir öğeyle kesişmesin.
6. **Yatay konum**: Oyun yatayda anlamsızsa (Kelime Avı, Boyama gibi) ya düzgün yatay düzen ver ya da
   "cihazı dik tut" ekranı göster. Yarım çalışan yatay düzen bırakma.
7. **Boş alan**: Dikey telefonda içerik ekranın ortasında küçük kalıp üst/alt boşluk bırakıyorsa
   (Mangala), içeriği ekranı dolduracak şekilde ölçekle.

## Oyun bazında bulgular

### 1. Sesli Masallar (`sesli-masallar/index.html`)
- **Kapak görseli yanlış kırpılıyor**: `.cover-art img { aspect-ratio: 9/16; object-fit: cover }`
  yatay (16:9'a yakın) illüstrasyonu dikey ince bir şeride kırpıyor. Tavşan ve kaplumbağa kadrajın
  dışında kalıyor; ekranda ağaç ve gökyüzü görünüyor. Kapak kutusunu 4:5 veya 1:1 yap, `object-fit: cover`
  ile birlikte `object-position` ile karakterlere odakla; ya da görsel oranına uyan kutu kullan.
- **Masal sayfası görseli de aynı sorunu taşıyor** (`position:absolute; inset:0; object-fit:cover`):
  telefonda sayfanın tamamını kaplayan görsel karakterleri kesiyor. Üstte görsel, altta metin ve
  ses kontrolleri olacak şekilde sabit bir düzen öner: görsel alanı 4:3 veya 1:1, altında metin kartı,
  en altta oynat/duraklat/önceki/sonraki.
- **Kontroller ilk ekranda görünmüyor**: Masal açıldığında oynat/sonraki butonları görünür alanda
  değil, kaydırmak gerekiyor. Kontroller her zaman ekranın altında sabit durmalı.
- **Dil çubuğu (TR/EN/عربي/FR) üstte sabit ve durum çubuğunun altına giriyor** (Android'de doğrulandı).
  Güvenli alan dolgusu ekle.
- `.frame` 9:16 çerçevesi tablet/yatayda iyi; telefonda `height: min(100dvh,100vh)` yerine `100dvh`
  tek başına yeterli, adres çubuğu olmadığı için.

### 2. Namaz Vakti (`namaz-vakti/index.html`)
- Üstteki vakit sekmeleri (İmsak, Sabah, Öğle, İkindi, Akşam, Yatsı) **10 px**. En az 12 px yap;
  sığmazsa harf aralığını azalt veya ikonlu kısa etiket kullan.
- "?" yardım düğmesi sol alttaki **"Zıpla" tuşunun üstüne biniyor**. Genel kural 5.
- Soru kartı açıldığında kartın altında tek başına küçük sarı bir çizgi kalıyor (kartın alt kenarında
  `-` gibi görünen artefakt); muhtemelen ilerleme çubuğunun boş hali. Boşken gizle.
- Alt kontrol tuşları (Zıpla, Eğil) soru kartı açıkken soluk ama hâlâ görünür; kart açıkken tamamen
  pasif ve `pointer-events:none` olmalı.
- Bir kaynak 404 veriyor (konsol). Eksik dosya veya yanlış yol; kontrol et.

### 3. Kim Âlim Olmak İster? (`kim-alim/index.html`)
- "?" düğmesi kategori ekranında **"Osmanlı Tarihi" kartının**, soru ekranında **D şıkkının** üstüne
  biniyor. Genel kural 5. Soru ekranında zaten üstte "Çekil / Merdiven" çubuğu var; "?" oraya alınabilir.
- Soru ekranında üst çubuk ile soru kartı arasında büyük boş alan var (ekranın üçte biri). Soru kartını
  dikeyde ortala veya joker çubuğunun hemen altına al; şıklar arasında eşit boşluk kalsın.
- "0 / 15 rozet" ve açıklama metni 11 px; 12 px'e çıkar.

### 4. Boyama Kitabı (`boyama/index.html`)
- Üstteki resim seçici şerit (`button.pickbtn`) **sağdan taşıyor**; yarım kalan 🌸 butonu ekran dışında.
  Şerit `overflow-x:auto; scroll-snap-type:x mandatory` olmalı, sağ kenarda solan gölgeyle kaydırılabilir
  olduğu belli olmalı; ya da butonları iki satıra kır.
- Renk paleti daireleri **32×32 px**, çocuk parmağı için küçük. En az 40×40, aralarında 8 px.
- iPhone SE'de çizim alanı **çok küçülüyor** (ekranın beşte biri), palet ve butonlar yer kaplıyor.
  Küçük ekranda paleti tek satır yatay kaydırmalı yap, alt butonları ikonlu küçült, çizim alanına
  en az ekran yüksekliğinin %45'i kalsın.
- iPhone SE'de alt butonlar ("Temizle") ikinci satıra düşüyor; dört buton tek satıra sığmazsa ikon +
  kısa etiket kullan.
- Çizim alanının üstündeki "Boyama Kitabı" başlığı iki satıra kırılıyor; tek satır olacak şekilde küçült
  veya başlığı kaldırıp yeri resim seçiciye ver.

### 5. Kız Giydirme (`kiz-giydirme/index.html`)
- Genel olarak iyi. Ana ekranda üstteki beş yuvarlak düğme ekranın en üst kenarına yapışık; durum çubuğu
  ile çakışır. `padding-top: max(12px, env(safe-area-inset-top))`.
- Yatay konumda "Nasıl Oynanır" kartı ekranı aşıyor ve kaydırılamıyor (başlık ve ilk iki adım görünüyor,
  "Hadi Başlayalım" butonuna ulaşılamıyor). Kartı `max-height: 90dvh; overflow-y:auto` yap.
- Dört büyük kart (Oluştur, Giydir, Fotoğraf, Albümüm) ekranın %60'ını kaplıyor, karakter küçük
  kalıyor. Kartları daha alçak yap (en fazla 120 px), karakter alanını büyüt.

### 6. Mangala (`mangala/index.html`)
- Dikey telefonda tahta ekranın ortasında **küçük bir şerit**, üstte ve altta büyük boşluk var.
  Kuyu çapı yaklaşık 36 px, içindeki taşlar ve sayı rozeti üst üste biniyor. Dikeyde tahtayı
  90° döndürülmüş (dikey) yerleştir ya da kuyuları iki satır yerine daha büyük çizip tahtayı
  ekran genişliğine ölçekle; kuyu çapı en az 56 px olsun.
- Sayı rozetleri (4) kuyu kenarına taşıyor ve taşları kapatıyor; rozeti kuyunun dışına (üst sırada
  üste, alt sırada alta) al.
- Yatay konum iyi; dikeyde aynı kaliteyi hedefle.
- `unpkg.com` üzerinden PeerJS yükleniyor; çevrimdışı tek kişilik modda bu isteğin başarısızlığı
  konsolda hata üretmesin, yalnız çevrim içi oyun seçilince yüklensin.

### 7. Kelime Avı (`kelime/index.html`)
- Klavye tuşları iPhone 13'te **34×54 px**, iPhone SE'de **27×45 px**. Çocuk için dar. Tuş aralığını
  3 px'e indir, tuş genişliğini `calc((100vw - 2*kenar - 10*aralık)/11)` ile hesapla ve en az 32 px
  genişlik hedefle; sığmazsa klavyeyi 3 satır yerine Türkçe harfleri de içeren 4 satıra böl.
- "SİL" ve "DENE" etiketleri **10 px**; 12 px yap veya yalnız ikon bırak.
- Üst bilgi satırı ("5 harfli · oyun 0 · kazanma %0 · seri 0 (rekor 0)") SE'de 10 px'e düşüyor; iki
  satıra kırılabilir veya kısaltılabilir.
- Izgara ile klavye arasında SE'de boşluk kalmıyor, ızgara hücrelerini küçült ki klavye sıkışmasın.
- Bir kaynak 404 veriyor (konsol).

### 8. Yumurta Fabrikası (`yumurta/index.html`)
- Açılış kartındaki açıklama 6 satır; iPhone SE'de "Nasıl Oynanır" butonu alt kenara yaklaşıyor.
  Metni 3 satıra kısalt veya kartı kaydırılabilir yap.
- Üst HUD'daki para ve "Yumurta Çiftliği" rozetleri ekranın en üst kenarında; güvenli alan dolgusu.
- Sağ kenardaki dikey ikon sütunu (ayarlar, ses, kasa) 44 px hedefin altında görünüyor; kontrol et.
- Not: açılış kartını kapatma butonu programatik tıklamayla kapanmadı; buton `click` yerine yalnızca
  `pointerdown/touchstart` dinliyorsa erişilebilirlik için `click` de dinlemeli.

### 9. Dondurmacı (`dondurmaci/index.html`)
- Üst HUD'daki "SATIŞ", "MUTLU" etiketleri **10 px**; 12 px yap.
- iPhone SE'de **"🛒 Market" butonu sağdan taşıyor** (sağ kenarı ekran dışında). HUD'ı
  `flex-wrap` veya `grid` ile sığdır; dar ekranda Market yalnız ikon olsun.
- Tezgâh ile kazanlar arasında büyük boş bant var ("kazanlara dokun ↓" yazısı etrafı); kazanları
  yukarı al, külah alanı büyüsün.
- "VER" butonu küçük ve köşede; en az 56 px yüksekliğinde belirgin bir aksiyon butonu olsun.
- Market paneli iyi; yalnızca SE'de "Top değeri: 10₺" iki satıra kırılıyor, satır yüksekliğini sabitle.
- Bir kaynak 404 veriyor (konsol).

### 10. Ateş & Su (`ates-su/index.html`)
- "?" düğmesi **sol kontrol tuşlarının ilkinin (sol ok) üstüne biniyor**, oyun oynanamaz hale geliyor.
  Genel kural 5; burada mutlaka üst orta "mola" düğmesinin yanına taşınmalı.
- Üst skor etiketleri ("🔥 Ateş", "💧 Su", yıldızlar) **10 px**.
- Dikey konumda oyun alanı daralıyor ve platformlar sıkışıyor; yatay konum çok daha iyi. Oyun başlarken
  "yatay tutmanız önerilir" ipucu göster veya dikeyde sahneyi `scale()` ile sığdır.
- Alt kontrol tuşları sol/sağ gruplar hâlinde iyi, ama tuşlar ekranın en alt kenarına yapışık;
  `padding-bottom: env(safe-area-inset-bottom)` ekle.
- Bölüm seçme ekranında yalnız 1 açık bölüm ve kilit görünüyor; kilitli bölüm kartı tıklanınca
  geri bildirim yok. Küçük bir sarsıntı animasyonu ve "önce 1. bölümü bitir" mesajı ekle.

## Teslim biçimi

Her oyun için değişen CSS/HTML parçalarını `index.html` içinde yerinde düzelt; tam dosya ver.
Değişikliği 3 ekran genişliğinde (375, 390, 412) ve yatayda zihinsel olarak doğrula.
Ekran görüntüleri ayrı klasörde: `iphone-*.png` ilk ekran, `p2-*.png` oyun içi, `land-*.png` yatay,
`se-*.png` iPhone SE.
