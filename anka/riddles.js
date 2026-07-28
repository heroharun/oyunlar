/* ============================================================================
   MİT: ANKA PROTOKOLÜ — İçerik verisi
   ----------------------------------------------------------------------------
   Bu dosya oyunun TÜM içeriğini tutar. Motor (game.js) burada tanımlı verileri
   okur; yeni oda, eşya, bilmece veya kanıt eklemek için sadece bu dosyayı
   düzenlemen yeterlidir. Motor kodunu değiştirmen gerekmez.

   TAMAMEN KURGUDUR. Gerçek kurum, personel, operasyon, bina veya yöntemle
   ilgisi yoktur. Tüm isimler, birimler ve olaylar uydurmadır.
   ========================================================================== */

'use strict';

/* --------------------------------------------------------------------------
   ODALAR
   Her nesne: { id, ad, ikon, x, y, tur, metin }
     x / y : sahne içindeki yüzde konumu (0-100), merkez noktası
     tur   : 'bilmece'  -> bir bilmecenin cevabı olabilir
             'etkilesim'-> kendi penceresini açar (act alanı ile)
             'dekor'    -> dikkat dağıtıcı nesne
     act   : 'etkilesim' nesnelerinde motorun çalıştıracağı eylem anahtarı
   ------------------------------------------------------------------------ */
const ROOMS = {
  analiz: {
    id: 'analiz',
    ad: 'Analiz Odası',
    kod: 'A-01',
    atmosfer: 'Ekranlar hâlâ açık. Biri buradan aceleyle çıkmış.',
    objects: [
      { id: 'duvar-saati',       ad: 'Duvar saati',        ikon: '🕰️', x: 17, y: 17, tur: 'bilmece',
        metin: 'Akrep ve yelkovan 21.07’de donmuş. Elektrik kesintisinin saati.' },
      { id: 'dunya-haritasi',    ad: 'Dünya haritası',     ikon: '🗺️', x: 45, y: 14, tur: 'dekor',
        metin: 'Üç şehir işaretlenmiş. Hepsi eski bir tatbikat senaryosundan.' },
      { id: 'fotograf-cercevesi',ad: 'Fotoğraf çerçevesi', ikon: '🖼️', x: 76, y: 16, tur: 'etkilesim', act: 'cerceve',
        metin: 'Camın altında bir şey kıpırdıyor.' },
      { id: 'masa-lambasi',      ad: 'Masa lambası',       ikon: '💡', x: 19, y: 47, tur: 'dekor',
        metin: 'Ampul sıcak. Kesintiden hemen önce yanıyormuş.' },
      { id: 'bilgisayar',        ad: 'Bilgisayar',         ikon: '🖥️', x: 49, y: 51, tur: 'etkilesim', act: 'bilgisayar',
        metin: 'Ekranda oturum açma kaydı bekliyor.' },
      { id: 'kahve-kupasi',      ad: 'Kahve kupası',       ikon: '☕', x: 69, y: 55, tur: 'dekor',
        metin: 'Dibinde soğumuş kahve. Kimse bitirmeye vakit bulamamış.' },
      { id: 'telefon',           ad: 'Masa telefonu',      ikon: '☎️', x: 85, y: 49, tur: 'dekor',
        metin: 'Hat ölü. Santral kesintiden beri kapalı.' },
      { id: 'kilitli-cekmece',   ad: 'Kilitli çekmece',    ikon: '🗄️', x: 37, y: 80, tur: 'etkilesim', act: 'cekmece',
        metin: 'Küçük bir kilit. Anahtar burada değil.' }
    ]
  },

  arsiv: {
    id: 'arsiv',
    ad: 'Arşiv Odası',
    kod: 'A-02',
    atmosfer: 'Kâğıt ve toz kokusu. Raflardan biri yerinden oynatılmış.',
    objects: [
      { id: 'kitaplik',      ad: 'Kitaplık',        ikon: '📚', x: 15, y: 25, tur: 'bilmece',
        metin: 'Raflar dolu. Bir cildin sırtı diğerlerinden daha aşınmış.' },
      { id: 'dosya-kutulari',ad: 'Dosya kutuları',  ikon: '📦', x: 37, y: 19, tur: 'dekor',
        metin: 'Etiketler soluk. Hepsi kapanmış eski dosyalar.' },
      { id: 'gazete',        ad: 'Eski gazete',     ikon: '📰', x: 59, y: 21, tur: 'dekor',
        metin: 'Tarih dört yıl öncesine ait. Kimse okumamış.' },
      { id: 'pusula',        ad: 'Pusula',          ikon: '🧭', x: 82, y: 23, tur: 'bilmece',
        metin: 'Cam çatlak ama iğne hâlâ kuzeyi buluyor.' },
      { id: 'daktilo',       ad: 'Daktilo',         ikon: '⌨️', x: 23, y: 57, tur: 'etkilesim', act: 'daktilo',
        metin: 'Şeridi hâlâ takılı. Son yazılanlar şeride basılmış olabilir.' },
      { id: 'eski-fotograf', ad: 'Eski fotoğraf',   ikon: '📷', x: 47, y: 55, tur: 'dekor',
        metin: 'Merkez binasının açılış günü. Yüzler tanınmıyor.' },
      { id: 'muhur',         ad: 'Mühür',           ikon: '🔖', x: 67, y: 57, tur: 'dekor',
        metin: 'Kurumuş ıstampa. Yıllardır kullanılmamış.' },
      { id: 'kilitli-dolap', ad: 'Kilitli dolap',   ikon: '🚪', x: 86, y: 65, tur: 'etkilesim', act: 'dolap',
        metin: 'Kart okuyuculu dolap. Yeşil ışık yanıp sönüyor.' }
    ]
  },

  guvenlik: {
    id: 'guvenlik',
    ad: 'Güvenlik Ofisi',
    kod: 'A-03',
    atmosfer: 'Monitörlerin yarısı kar taneciği gösteriyor.',
    objects: [
      { id: 'kamera-ekranlari', ad: 'Kamera ekranları',      ikon: '📺', x: 23, y: 21, tur: 'etkilesim', act: 'kamera',
        metin: 'Kesinti anına ait kayıt hâlâ tamponda duruyor.' },
      { id: 'alarm-paneli',     ad: 'Alarm paneli',          ikon: '🚨', x: 49, y: 17, tur: 'dekor',
        metin: 'Dokunma. Manuel tetikleme seviyeyi yükseltir.' },
      { id: 'telsiz',           ad: 'Telsiz',                ikon: '📻', x: 74, y: 19, tur: 'dekor',
        metin: 'Pili bitmiş. Haberleşme odasında yedeği olmalı.' },
      { id: 'personel-kartlari',ad: 'Personel kartları',     ikon: '🪪', x: 19, y: 51, tur: 'etkilesim', act: 'kartlar',
        metin: 'Kart askılığı. Bir yuva boş.' },
      { id: 'kayit-defteri',    ad: 'Güvenlik kayıt defteri',ikon: '📓', x: 43, y: 53, tur: 'etkilesim', act: 'defter',
        metin: 'Elle tutulan giriş-çıkış defteri. Sayfalar numaralı.' },
      { id: 'klavye',           ad: 'Klavye',                ikon: '⌨️', x: 65, y: 55, tur: 'dekor',
        metin: 'Tuşların üçü aşınmış. Anlamlı bir iz vermiyor.' },
      { id: 'el-feneri',        ad: 'El feneri',             ikon: '🔦', x: 86, y: 49, tur: 'bilmece',
        metin: 'Ucunda mor bir mercek var.' },
      { id: 'dolap',            ad: 'Malzeme dolabı',        ikon: '🗃️', x: 56, y: 81, tur: 'dekor',
        metin: 'Yedek üniformalar ve boş bir ilk yardım çantası.' }
    ]
  },

  haberlesme: {
    id: 'haberlesme',
    ad: 'Haberleşme Odası',
    kod: 'A-04',
    atmosfer: 'Duvarın içinden düzenli bir uğultu geliyor.',
    objects: [
      { id: 'radyo',            ad: 'Radyo',            ikon: '📻', x: 21, y: 25, tur: 'etkilesim', act: 'radyo',
        metin: 'Pil yuvası boş.' },
      { id: 'frekans-paneli',   ad: 'Frekans paneli',   ikon: '🎛️', x: 45, y: 21, tur: 'etkilesim', act: 'frekans',
        metin: 'Üç haneli üç alan. Radyo beslenmeden çalışmaz.' },
      { id: 'hoparlor',         ad: 'Hoparlör',         ikon: '🔊', x: 74, y: 17, tur: 'bilmece',
        metin: 'Duvara gömülü. Izgarasının arkası karanlık.' },
      { id: 'kulaklik',         ad: 'Kulaklık',         ikon: '🎧', x: 19, y: 55, tur: 'dekor',
        metin: 'Kablosu kesilmiş. İşe yaramaz.' },
      { id: 'mikrofon',         ad: 'Mikrofon',         ikon: '🎙️', x: 41, y: 57, tur: 'dekor',
        metin: 'Anahtarı kapalı. Yayın yapılmamış.' },
      { id: 'kablo-kutusu',     ad: 'Kablo kutusu',     ikon: '🧰', x: 63, y: 59, tur: 'etkilesim', act: 'kablo',
        metin: 'Kabloların arasında bir şey parlıyor.' },
      { id: 'sunucu-terminali', ad: 'Sunucu terminali', ikon: '💾', x: 86, y: 51, tur: 'etkilesim', act: 'terminal',
        metin: 'Aktarım kuyruğu ekranda akıyor.' },
      { id: 'pano',             ad: 'Devre panosu',     ikon: '🔌', x: 56, y: 81, tur: 'dekor',
        metin: 'Sigortalar sağlam. Kesinti buradan yapılmamış.' }
    ]
  }
};

const ROOM_ORDER = ['analiz', 'arsiv', 'guvenlik', 'haberlesme'];

/* --------------------------------------------------------------------------
   BİLMECELER
   need : bu bilmecenin açılması için gereken bayrak (gameState.flags)
   gives: çözülünce açılan bayrak
   ------------------------------------------------------------------------ */
const RIDDLES = [
  {
    id: 'saat',
    room: 'analiz',
    need: null,
    gives: 'saat_ok',
    question: 'Konuşmam ama zamanı söylerim.\nYüzüm vardır, gözüm yoktur.',
    answerObjectId: 'duvar-saati',
    hint1: 'Aradığın eşya zamanı gösteriyor.',
    hint2: 'Duvara asılı olan nesneyi incele.',
    hint3: 'Duvar saatine tıkla.',
    reward: 500,
    penalty: 100,
    completed: false
  },
  {
    id: 'kitap',
    room: 'arsiv',
    need: 'saat_ok',
    gives: 'kitap_ok',
    question: 'Binlerce ses taşırım,\nfakat tek kelime konuşmam.\nBeni açan geçmişi görür.',
    answerObjectId: 'kitaplik',
    hint1: 'Bu nesne sayfalardan oluşuyor.',
    hint2: 'Arşivde raflara bak.',
    hint3: 'Kitaplığa tıkla.',
    reward: 500,
    penalty: 100,
    completed: false
  },
  {
    id: 'pusula',
    room: 'arsiv',
    need: 'not_ok',
    gives: 'pusula_ok',
    question: 'Kuzeye değil, kuzeyi gösterene bak.',
    answerObjectId: 'pusula',
    hint1: 'Yön bulmaya yarayan bir alet arıyorsun.',
    hint2: 'Arşiv odasının sağ üst köşesine bak.',
    hint3: 'Pusulaya tıkla.',
    reward: 500,
    penalty: 100,
    completed: false
  },
  {
    id: 'fener',
    room: 'guvenlik',
    need: 'pusula_ok',
    gives: 'fener_ok',
    question: 'Karanlıkta göz olurum.\nGösterdiğim şeyi gündüz kimse göremez.',
    answerObjectId: 'el-feneri',
    hint1: 'Işık veren, elde taşınan bir alet.',
    hint2: 'Güvenlik ofisinde, sağ tarafta.',
    hint3: 'El fenerine tıkla.',
    reward: 500,
    penalty: 100,
    completed: false
  },
  {
    id: 'hoparlor',
    room: 'haberlesme',
    need: 'suclama_ok',
    gives: 'hoparlor_ok',
    question: 'Beni görmezsin ama sesimi duyarsın.\nDuvarın içinde yaşar, uzakları yakın ederim.',
    answerObjectId: 'hoparlor',
    hint1: 'Ses çıkaran ama ağzı olmayan bir nesne.',
    hint2: 'Duvara gömülü olanı incele.',
    hint3: 'Hoparlöre tıkla.',
    reward: 500,
    penalty: 100,
    completed: false
  }
];

/* --------------------------------------------------------------------------
   ENVANTER EŞYALARI
   ------------------------------------------------------------------------ */
const ITEMS = {
  'anahtar':   { ad: 'Küçük anahtar',      ikon: '🔑', metin: 'Kitabın oyulmuş sayfalarından çıktı. Küçük bir kilide ait.' },
  'not':       { ad: 'Parçalanmış not',    ikon: '📄', metin: 'Dört parçaya ayrılmış, elle yazılmış bir not.' },
  'uv-fener':  { ad: 'UV el feneri',       ikon: '🔦', metin: 'Mor ışık veriyor. Çıplak gözle görünmeyen mürekkebi ortaya çıkarır.' },
  'kart':      { ad: 'Personel kartı',     ikon: '🪪', metin: 'Ece adına düzenlenmiş kapı kartı. Askılıkta değil, masanın altındaydı.' },
  'foto':      { ad: 'Şifreli fotoğraf',   ikon: '🖼️', metin: 'Arkası boş görünüyor. Ama kâğıt fazla parlak.' },
  'pil':       { ad: 'Pil',                ikon: '🔋', metin: 'Dolu. Radyoya uyuyor.' },
  'usb':       { ad: 'USB bellek',         ikon: '💾', metin: 'Kayıp olduğu bildirilen bellek. İçindeki dizin adı: ANKA.' }
};

/* Birleştirme kuralları: 'eşya|hedef' -> motor tarafından işlenen sonuç anahtarı */
const COMBOS = {
  'anahtar|kilitli-cekmece': 'cekmece_ac',
  'kart|kilitli-dolap':      'dolap_ac',
  'pil|radyo':               'radyo_ac',
  'uv-fener|foto':           'foto_uv'
};

/* --------------------------------------------------------------------------
   ŞÜPHELİLER (tamamen kurgusal karakterler)
   ------------------------------------------------------------------------ */
const SUSPECTS = [
  {
    id: 'deniz', ad: 'Deniz', gorev: 'Analist', avatar: 'D',
    giris: '18.20', cikis: '—', odalar: 'Analiz Odası',
    ifade: 'Saat 21.00’de analiz odasında rapor hazırlıyordum.',
    baseSuspicion: 20
  },
  {
    id: 'bora', ad: 'Bora', gorev: 'Güvenlik görevlisi', avatar: 'B',
    giris: '16.00', cikis: '—', odalar: 'Güvenlik Ofisi, Koridor',
    ifade: 'Elektrikler kesildiğinde güvenlik panelini kontrol ediyordum.',
    baseSuspicion: 25
  },
  {
    id: 'ece', ad: 'Ece', gorev: 'Yazılım uzmanı', avatar: 'E',
    giris: '17.45', cikis: '—', odalar: 'Analiz Odası, Haberleşme Odası',
    ifade: 'Bu gece arşiv odasına hiç girmedim.',
    baseSuspicion: 30
  },
  {
    id: 'kerem', ad: 'Kerem', gorev: 'Arşiv sorumlusu', avatar: 'K',
    giris: '15.10', cikis: '20.40 (beyan)', odalar: 'Arşiv Odası',
    ifade: 'Saat 20.40’ta binadan ayrıldım.',
    baseSuspicion: 15
  }
];

const KOSTEBEK = 'kerem';

/* --------------------------------------------------------------------------
   KANITLAR
   tur: 'ana'  -> suçlama için sayılan temel kanıt (en az 4 gerekli)
        'gizli'-> bulunması zorunlu olmayan bonus kanıt (+300)
   isaret: bu kanıtın şüphe puanı eklediği kişi
   ------------------------------------------------------------------------ */
const EVIDENCE_DB = {
  'ece-kart': {
    ad: 'Ece’nin personel kartı', tur: 'ana', isaret: 'ece', puan: 20,
    metin: 'Kart, sahibinin masasında değil, güvenlik ofisinin altında bulundu. Yani biri onu almış.'
  },
  'arsiv-giris': {
    ad: 'Arşiv kapı kaydı', tur: 'ana', isaret: 'ece', puan: 25,
    metin: '21.05 — Arşiv kapısı Ece’nin kartıyla açıldı. Ece o saatte haberleşme odasındaydı.'
  },
  'kerem-kamera': {
    ad: 'Kamera görüntüsü', tur: 'ana', isaret: 'kerem', puan: 45,
    metin: '21.03 — Arşiv koridorunda Kerem görülüyor. Oysa 20.40’ta çıktığını beyan etmiş.'
  },
  'usb': {
    ad: 'Kayıp USB bellek', tur: 'ana', isaret: 'kerem', puan: 30,
    metin: 'Arşiv dolabında bulundu. Dolabın erişim yetkisi arşiv sorumlusunda.'
  },
  'not': {
    ad: 'Parçalanmış not', tur: 'ana', isaret: null, puan: 0,
    metin: '“Kuzeye değil, kuzeyi gösterene bak.” Aceleyle yırtılmış, yakılmamış.'
  },
  'frekans': {
    ad: 'Radyo frekansı 19-23-07', tur: 'ana', isaret: null, puan: 0,
    metin: 'Aktarımın taşındığı frekans. Bina içinden besleniyor.'
  },
  'uv-yazi': {
    ad: 'Görünmez yazı', tur: 'gizli', isaret: 'kerem', puan: 15,
    metin: 'Fotoğrafın arkasında UV altında beliren yazı: “ANKA — 3. raf, arka duvar.”'
  },
  'daktilo-serit': {
    ad: 'Daktilo şeridi', tur: 'gizli', isaret: 'kerem', puan: 10,
    metin: 'Şeritte son basılan satır okunabiliyor: “kart iade edilmeyecek”.'
  },
  'oturum-kaydi': {
    ad: 'Oturum kaydı', tur: 'gizli', isaret: 'kerem', puan: 10,
    metin: '20.52 — Analiz terminaline arşiv sorumlusu yetkisiyle giriş yapılmış.'
  },
  'aktarim-kuyrugu': {
    ad: 'Aktarım kuyruğu', tur: 'gizli', isaret: null, puan: 0,
    metin: 'Kuyrukta tek dosya var: ANKA.pkg — hedef adres bina içi bir vericiyi gösteriyor.'
  }
};

/* Suçlamayı destekleyen doğru kanıt üçlüsü (sıra önemsiz) */
const DOGRU_KANITLAR = ['kerem-kamera', 'arsiv-giris', 'usb'];

/* --------------------------------------------------------------------------
   IŞIK BULMACASI — radyo açıldıktan sonra
   ------------------------------------------------------------------------ */
const LIGHT_PUZZLE = {
  dizi: ['kisa', 'uzun', 'kisa', 'kisa'],
  secenekler: [
    { id: 'ayna',     ad: 'Ayna',     desen: ['uzun', 'kisa', 'uzun'] },
    { id: 'hoparlor', ad: 'Hoparlör', desen: ['kisa', 'uzun', 'kisa', 'kisa'] },
    { id: 'telefon',  ad: 'Telefon',  desen: ['kisa', 'kisa', 'uzun'] },
    { id: 'harita',   ad: 'Harita',   desen: ['uzun', 'uzun', 'kisa'] }
  ],
  dogru: 'hoparlor'
};

/* --------------------------------------------------------------------------
   BAŞARIMLAR
   ------------------------------------------------------------------------ */
const ACHIEVEMENTS = [
  { id: 'keskin-goz',    ad: 'Keskin Göz',    metin: 'İlk bilmeceyi yanlış nesneye hiç tıklamadan çöz.' },
  { id: 'sifreci',       ad: 'Şifreci',       metin: 'Frekans kodunu hiç ipucu kullanmadan bul.' },
  { id: 'golge-takibi',  ad: 'Gölge Takibi',  metin: 'Bütün gizli kanıtları bul.' },
  { id: 'sogukkanli',    ad: 'Soğukkanlı',    metin: 'Alarm seviyesi 25’in altındayken görevi bitir.' },
  { id: 'zamana-karsi',  ad: 'Zamana Karşı',  metin: 'Beş dakikadan fazla süre kalmışken görevi bitir.' },
  { id: 'anka',          ad: 'ANKA',          metin: 'En yüksek rütbeye ulaş.' }
];

/* --------------------------------------------------------------------------
   RÜTBELER
   ------------------------------------------------------------------------ */
const RANKS = [
  { min: 9500, ad: 'ANKA Ajanı' },
  { min: 8500, ad: 'Başanalist' },
  { min: 7000, ad: 'Kıdemli Operasyon Uzmanı' },
  { min: 5000, ad: 'İstihbarat Analisti' },
  { min: 3000, ad: 'Saha Destek Uzmanı' },
  { min: 0,    ad: 'Aday Analist' }
];

/* --------------------------------------------------------------------------
   FİNALLER
   ------------------------------------------------------------------------ */
const ENDINGS = {
  kusursuz: {
    baslik: 'Kusursuz Operasyon',
    tip: 'iyi',
    metin: 'Aktarım kesildi, köstebek teşhis edildi, alarm hiç yükselmedi. Merkez sabaha temiz uyandı. Kayıtlara tek satır düşüldü: görev tamamlandı.'
  },
  basarili: {
    baslik: 'Görev Başarılı',
    tip: 'iyi',
    metin: 'Verici susturuldu ve köstebek tespit edildi. Ama arkanda çok gürültü bıraktın. Rapor uzun olacak.'
  },
  yanlis: {
    baslik: 'Yanlış Şüpheli',
    tip: 'kotu',
    metin: 'Masum bir isim tutanağa geçti. Gerçek köstebek, sen dosyayı kapatırken binadan çıktı. Aktarım devam ediyor.'
  },
  sizdi: {
    baslik: 'Protokol Sızdırıldı',
    tip: 'kotu',
    metin: 'Süre doldu ve verici görevini tamamladı. ANKA Protokolü artık binanın dışında. Merkez bu geceyi uzun süre konuşacak.'
  }
};
