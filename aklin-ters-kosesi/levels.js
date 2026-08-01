/* =========================================================
   levels.js - Aklın Ters Köşesi
   50 özgün bölüm. Bölümler tamamen veri olarak tanımlanır;
   motor bu veriyi okuyup sahneyi ve çözümü üretir.

   Nesne alanları:
     id, sprite | text | shape, x, y (yüzde), size (sahne genişliğinin %'si),
     drag, click, hold, pinch, hidden, rot, scale, z, color, fontSize, label, state
   Talimat içindeki [[id|Metin]] parçaları sürüklenebilir kelime nesnesine dönüşür.

   Çözüm eylemleri:
     tap, doubleTap, longPress, dropOnTarget, hideBehind, dragOffScreen,
     orderedTapSequence, multiTap, pinchOut, pinchIn, rotate, swipe,
     shake, tilt, wait, stateEquals, tapEmpty
   ========================================================= */
(function (global) {
  'use strict';

  var LEVELS = [
    /* ---------------- 1 - 10 : temel dokunma ve sürükleme ---------------- */
    {
      id: 1, title: 'Merhaba Mino', category: 'dikkat', difficulty: 1,
      instruction: 'Mor düşünce yaratığına dokun.',
      tutorial: 'Nesnelere tek dokunuşla etkileşebilirsin.',
      scene: [
        { id: 'mino1', sprite: 'mino', x: 50, y: 48, size: 36, label: 'Mino' },
        { id: 'ball1', sprite: 'ball', x: 20, y: 78, size: 18, label: 'top' },
        { id: 'apple1', sprite: 'apple', x: 80, y: 78, size: 18, label: 'elma' }
      ],
      solution: { action: 'tap', targetId: 'mino1' },
      hint: 'Ekranda mor olan tek bir şey var.', secondHint: 'Ortadaki büyük gözlü arkadaşa dokun.', reward: 1
    },
    {
      id: 2, title: 'Tavşanı besle', category: 'sürükleme', difficulty: 1,
      instruction: 'Havucu tavşana götür.',
      tutorial: 'Nesneleri parmağınla sürükleyebilirsin.',
      scene: [
        { id: 'rabbit', sprite: 'rabbit', x: 72, y: 55, size: 32, label: 'tavşan' },
        { id: 'carrot', sprite: 'carrot', x: 24, y: 68, size: 22, drag: true, label: 'havuç' }
      ],
      solution: { action: 'dropOnTarget', sourceId: 'carrot', targetId: 'rabbit' },
      hint: 'Havuç kendi kendine gitmez.', secondHint: 'Havucu basılı tutup tavşanın üstüne bırak.', reward: 0
    },
    {
      id: 3, title: 'Kapıyı aç', category: 'gizli nesne', difficulty: 2,
      instruction: 'Kapıyı aç. Anahtar ortada yok.',
      scene: [
        { id: 'door', sprite: 'door', x: 55, y: 40, size: 40, label: 'kapı' },
        { id: 'mat', sprite: 'mat', x: 50, y: 82, size: 40, drag: true, label: 'paspas' },
        { id: 'key', sprite: 'key', x: 50, y: 82, size: 22, hidden: true, drag: true, z: 5, label: 'anahtar' }
      ],
      steps: [
        { do: { action: 'dragOffScreen', sourceId: 'mat' }, then: { reveal: ['key'] }, say: 'Bak sen! Altında bir şey varmış.' },
        { do: { action: 'dropOnTarget', sourceId: 'key', targetId: 'door' }, then: { sprite: { door: 'doorOpen' } } }
      ],
      hint: 'Anahtarlar bazen ayak altındadır.', secondHint: 'Paspası ekranın dışına sürükle.', reward: 1
    },
    {
      id: 4, title: 'Mumu yak', category: 'birleştirme', difficulty: 2,
      instruction: 'Mumu yak. Kibrit yok.',
      scene: [
        { id: 'candle', sprite: 'candle', x: 50, y: 68, size: 30, label: 'mum' },
        { id: 'sun4', sprite: 'sun', x: 22, y: 22, size: 26, drag: true, label: 'güneş' }
      ],
      solution: { action: 'dropOnTarget', sourceId: 'sun4', targetId: 'candle' },
      onSolve: { sprite: { candle: 'candleLit' }, remove: ['sun4'] },
      hint: 'Ekranda ısı veren başka ne var?', secondHint: 'Güneşi mumun üstüne bırak.', reward: 0
    },
    {
      id: 5, title: 'Gizli yıldız', category: 'gizli nesne', difficulty: 2,
      instruction: 'Gökyüzündeki yıldızı bul ve ona dokun.',
      scene: [
        { id: 'cloud5', sprite: 'cloud', x: 50, y: 40, size: 44, drag: true, z: 4, label: 'bulut' },
        { id: 'star5', sprite: 'star', x: 52, y: 42, size: 22, hidden: true, label: 'yıldız' },
        { id: 'moon5', sprite: 'moon', x: 22, y: 76, size: 20, label: 'ay' }
      ],
      steps: [
        { do: { action: 'dragOffScreen', sourceId: 'cloud5' }, then: { reveal: ['star5'] } },
        { do: { action: 'tap', targetId: 'star5' } }
      ],
      hint: 'Bir şey yıldızın önünü kapatıyor.', secondHint: 'Bulutu kenara çek.', reward: 0
    },
    {
      id: 6, title: 'Balonu şişir', category: 'çoklu dokunma', difficulty: 1,
      instruction: 'Balonu şişir. Bir dokunuş yetmez.',
      tutorial: 'Bazı nesneler çift dokunuşa cevap verir.',
      scene: [
        { id: 'balloon6', sprite: 'balloon', x: 50, y: 55, size: 26, label: 'balon' },
        { id: 'stone6', sprite: 'stone', x: 22, y: 80, size: 18, label: 'taş' }
      ],
      solution: { action: 'doubleTap', targetId: 'balloon6' },
      onSolve: { scale: { balloon6: 1.6 } },
      hint: 'Aynı yere iki kez.', secondHint: 'Balona hızlıca iki kere dokun.', reward: 1
    },
    {
      id: 7, title: 'Lambayı yak', category: 'dokunma', difficulty: 2,
      instruction: 'Lambayı yak ve yanık tut.',
      tutorial: 'Basılı tutmak da bir hamledir.',
      scene: [
        { id: 'lamp7', sprite: 'lamp', x: 50, y: 45, size: 34, hold: true, label: 'lamba' },
        { id: 'book7', sprite: 'box', x: 22, y: 82, size: 20, label: 'kutu' }
      ],
      solution: { action: 'longPress', targetId: 'lamp7', ms: 1000 },
      onSolve: { sprite: { lamp7: 'lampOn' } },
      hint: 'Düğmeyi bırakmazsan ne olur?', secondHint: 'Lambaya parmağını bir saniye basılı tut.', reward: 0
    },
    {
      id: 8, title: 'Gece yap', category: 'ekran dışı', difficulty: 2,
      instruction: 'Ortalığı karart.',
      scene: [
        { id: 'sun8', sprite: 'sun', x: 50, y: 32, size: 30, drag: true, label: 'güneş' },
        { id: 'tree8', sprite: 'tree', x: 26, y: 74, size: 30, label: 'ağaç' },
        { id: 'moon8', sprite: 'moon', x: 78, y: 78, size: 20, label: 'ay' }
      ],
      solution: { action: 'dragOffScreen', sourceId: 'sun8' },
      onSolve: { night: true },
      hint: 'Güneş batmazsa gece olmaz.', secondHint: 'Güneşi ekranın dışına sürükle.', reward: 1
    },
    {
      id: 9, title: 'Çiçek sırası', category: 'sıra bulma', difficulty: 2,
      instruction: 'Çiçeklere küçükten büyüğe dokun.',
      scene: [
        { id: 'f_big', sprite: 'flower', x: 24, y: 52, size: 34, label: 'büyük çiçek' },
        { id: 'f_small', sprite: 'flower', x: 50, y: 62, size: 16, label: 'küçük çiçek' },
        { id: 'f_mid', sprite: 'flower', x: 76, y: 56, size: 24, label: 'orta çiçek' }
      ],
      solution: { action: 'orderedTapSequence', sequence: ['f_small', 'f_mid', 'f_big'] },
      hint: 'Boyutlarına iyi bak.', secondHint: 'En küçük olanla başla, en büyükle bitir.', reward: 0
    },
    {
      id: 10, title: 'Fareyi mutlu et', category: 'gizli nesne', difficulty: 2,
      instruction: 'Fareye peynir ver. Peynir görünmüyor.',
      scene: [
        { id: 'mouse10', sprite: 'mouse', x: 74, y: 60, size: 26, label: 'fare' },
        { id: 'box10', sprite: 'box', x: 26, y: 62, size: 30, drag: true, z: 4, label: 'kutu' },
        { id: 'cheese10', sprite: 'cheese', x: 26, y: 64, size: 22, hidden: true, drag: true, label: 'peynir' }
      ],
      steps: [
        { do: { action: 'dragOffScreen', sourceId: 'box10' }, then: { reveal: ['cheese10'] } },
        { do: { action: 'dropOnTarget', sourceId: 'cheese10', targetId: 'mouse10' } }
      ],
      hint: 'Kutunun içinde değil, altında.', secondHint: 'Önce kutuyu kaldır, sonra peyniri fareye götür.', reward: 1
    },

    /* ---------------- 11 - 20 : metin ve sayılar da nesnedir ---------------- */
    {
      id: 11, title: 'En büyük sayı', category: 'kelime oyunu', difficulty: 3,
      instruction: 'Ekrandaki en büyük sayıya dokun. Cevabı ararken [[big11|1000]] kere düşünme.',
      scene: [
        { id: 'n6', text: '6', x: 26, y: 58, fontSize: 46 },
        { id: 'n9', text: '9', x: 50, y: 58, fontSize: 46 },
        { id: 'n12', text: '12', x: 74, y: 58, fontSize: 46 }
      ],
      solution: { action: 'tap', targetId: 'big11' },
      hint: 'Sayılar sadece sahnede olmak zorunda değil.', secondHint: 'Soru cümlesini tekrar oku.', reward: 1
    },
    {
      id: 12, title: 'Kediyi koru', category: 'kelime oyunu', difficulty: 3,
      instruction: 'Kediyi [[rain12|yağmurdan]] koru.',
      scene: [
        { id: 'cat12', sprite: 'cat', x: 50, y: 68, size: 30, label: 'kedi' },
        { id: 'rc12', sprite: 'raincloud', x: 50, y: 26, size: 42, label: 'yağmur bulutu' }
      ],
      solution: { action: 'dragOffScreen', sourceId: 'rain12' },
      onSolve: { remove: ['rc12'] },
      hint: 'Yağmuru durduramıyorsan, onu kaldır.', secondHint: 'Soru cümlesindeki kelimeyi ekran dışına sürükle.', reward: 0
    },
    {
      id: 13, title: 'En küçüğü seç', category: 'kelime oyunu', difficulty: 3,
      instruction: 'En küçük nesneye dokun[[dot13|.]]',
      scene: [
        { id: 'c13a', shape: 'circle', color: '#f9a8d4', x: 28, y: 55, size: 26, label: 'büyük daire' },
        { id: 'c13b', shape: 'circle', color: '#93c5fd', x: 55, y: 60, size: 16, label: 'orta daire' },
        { id: 'c13c', shape: 'circle', color: '#86efac', x: 76, y: 65, size: 9, label: 'küçük daire' }
      ],
      solution: { action: 'tap', targetId: 'dot13' },
      hint: 'Cümlenin sonuna bak.', secondHint: 'Noktadan küçüğü var mı?', reward: 1
    },
    {
      id: 14, title: 'Balığı kurtar', category: 'kelime oyunu', difficulty: 3,
      instruction: 'Akvaryumda [[water14|su]] yok. Balığı kurtar.',
      scene: [
        { id: 'aq14', sprite: 'aquarium', x: 62, y: 55, size: 46, label: 'akvaryum' },
        { id: 'fish14', sprite: 'fish', x: 24, y: 76, size: 24, drag: true, label: 'balık' }
      ],
      steps: [
        { do: { action: 'dropOnTarget', sourceId: 'water14', targetId: 'aq14' }, then: { water: 'aq14' }, say: 'Su geldi!' },
        { do: { action: 'dropOnTarget', sourceId: 'fish14', targetId: 'aq14' } }
      ],
      hint: 'Suyu nereden bulacaksın?', secondHint: 'Cümledeki "su" kelimesini akvaryuma taşı.', reward: 1
    },
    {
      id: 15, title: 'Yanlışı düzelt', category: 'mantık tuzağı', difficulty: 3,
      instruction: 'Cümleyi düzelt: Kedi [[bark15|havlar]].',
      chipOpts: { bark15: { cycle: ['havlar', 'miyavlar', 'kükrer'], drag: false } },
      scene: [
        { id: 'cat15', sprite: 'cat', x: 50, y: 60, size: 34, label: 'kedi' }
      ],
      solution: { action: 'stateEquals', targetId: 'bark15', state: 'miyavlar' },
      hint: 'Kelimeye dokunmayı dene.', secondHint: 'Kedi ne der?', reward: 0
    },
    {
      id: 16, title: 'Köpeği doyur', category: 'kelime oyunu', difficulty: 3,
      instruction: 'Mama kabı boş. Köpeğe bir [[bone16|kemik]] bul.',
      scene: [
        { id: 'dog16', sprite: 'dog', x: 30, y: 52, size: 32, label: 'köpek' },
        { id: 'bowl16', sprite: 'bowl', x: 72, y: 72, size: 28, label: 'mama kabı' }
      ],
      solution: { action: 'dropOnTarget', sourceId: 'bone16', targetId: 'bowl16' },
      onSolve: { spawn: { id: 'bone16b', sprite: 'bone', x: 72, y: 68, size: 20 } },
      hint: 'Kemik yazısı da bir kemiktir.', secondHint: 'Cümledeki kelimeyi kaba sürükle.', reward: 0
    },
    {
      id: 17, title: '5 yap', category: 'sayı mantığı', difficulty: 3,
      instruction: 'Ekranda 5 yaz. Elindekiler: [[two17|2]] ve [[three17|3]].',
      scene: [
        { id: 'plate17', shape: 'rect', color: '#fef3c7', x: 50, y: 62, size: 46, h: 30, label: 'tabela' }
      ],
      solution: { action: 'dropOnTarget', sourceId: 'two17', targetId: 'three17' },
      onSolve: { text: { three17: '5' }, remove: ['two17'] },
      hint: '2 ile 3 bir araya gelirse?', secondHint: '2 rakamını 3 rakamının üstüne bırak.', reward: 1
    },
    {
      id: 18, title: 'Kelimeyi tamamla', category: 'kelime oyunu', difficulty: 3,
      instruction: 'Eksik harfi yerine koy: K [[eLetter18|E]] ? İ',
      scene: [
        { id: 'slot18', shape: 'rect', color: '#e9d5ff', x: 50, y: 58, size: 20, h: 22, label: 'boşluk' },
        { id: 'cat18', sprite: 'cat', x: 50, y: 84, size: 18, label: 'kedi' },
        { id: 'wrongD', text: 'Z', x: 24, y: 58, fontSize: 40, drag: true },
        { id: 'rightD', text: 'D', x: 76, y: 58, fontSize: 40, drag: true }
      ],
      solution: { action: 'dropOnTarget', sourceId: 'rightD', targetId: 'slot18' },
      hint: 'Kedi kelimesini düşün: K, E, ?, İ', secondHint: 'D harfini boşluğa bırak.', reward: 0
    },
    {
      id: 19, title: 'Sessizliği sağla', category: 'arayüz', difficulty: 4,
      instruction: 'Bebek uyuyor. Ortalığı sessizleştir.',
      scene: [
        { id: 'spk19', sprite: 'speakerOn', x: 50, y: 60, size: 34, label: 'hoparlör resmi' },
        { id: 'mino19', sprite: 'mino', x: 22, y: 80, size: 20 }
      ],
      solution: { action: 'tap', targetId: 'hud-sound', requireState: 'soundOff' },
      hint: 'Sahnedeki hoparlör sadece bir resim.', secondHint: 'Üst çubuktaki ses düğmesini kapat.', reward: 1
    },
    {
      id: 20, title: 'Yine en büyük sayı', category: 'arayüz', difficulty: 4,
      instruction: 'Ekrandaki en büyük sayıya dokun.',
      scene: [
        { id: 'n4', text: '4', x: 30, y: 58, fontSize: 48 },
        { id: 'n7', text: '7', x: 50, y: 58, fontSize: 48 },
        { id: 'n11', text: '11', x: 70, y: 58, fontSize: 48 }
      ],
      solution: { action: 'tap', targetId: 'hud-level' },
      hint: 'Sahnenin dışına da bakabilirsin.', secondHint: 'Kaçıncı bölümdesin?', reward: 1
    },

    /* ---------------- 21 - 30 : birleştirme, saklama, boyut ---------------- */
    {
      id: 21, title: 'Buzu erit', category: 'boyut değiştirme', difficulty: 3,
      instruction: 'Buzu erit.',
      tutorial: 'İki parmakla büyütüp küçültebilirsin. Masaüstünde alttaki düğmeleri kullan.',
      scene: [
        { id: 'ice21', sprite: 'ice', x: 55, y: 68, size: 30, label: 'buz' },
        { id: 'sun21', sprite: 'sun', x: 30, y: 26, size: 22, pinch: true, label: 'güneş' }
      ],
      solution: { action: 'pinchOut', targetId: 'sun21', scale: 1.8 },
      onSolve: { remove: ['ice21'], spawn: { id: 'pool21', sprite: 'waterdrop', x: 55, y: 72, size: 20 } },
      hint: 'Güneş biraz uzak kalmış.', secondHint: 'Güneşi iki parmakla büyüt.', reward: 1
    },
    {
      id: 22, title: 'Fili sığdır', category: 'boyut değiştirme', difficulty: 4,
      instruction: 'Fili kutuya koy.',
      scene: [
        { id: 'box22', sprite: 'box', x: 74, y: 68, size: 30, label: 'kutu' },
        { id: 'eleph', sprite: 'elephant', x: 32, y: 56, size: 42, pinch: true, drag: true, label: 'fil' }
      ],
      steps: [
        { do: { action: 'pinchIn', targetId: 'eleph', scale: 0.45 }, say: 'Şimdi sığar!' },
        { do: { action: 'dropOnTarget', sourceId: 'eleph', targetId: 'box22' } }
      ],
      hint: 'Kutuyu büyütemezsin ama...', secondHint: 'Fili küçült, sonra kutuya bırak.', reward: 1
    },
    {
      id: 23, title: 'Üçgen yap', category: 'nesne birleştirme', difficulty: 3,
      instruction: 'Ekranda bir üçgen oluştur.',
      scene: [
        { id: 'tri_a', sprite: 'triLeft', x: 30, y: 60, size: 34, drag: true, label: 'sol parça' },
        { id: 'tri_b', sprite: 'triRight', x: 72, y: 60, size: 34, label: 'sağ parça' }
      ],
      solution: { action: 'dropOnTarget', sourceId: 'tri_a', targetId: 'tri_b' },
      onSolve: { sprite: { tri_b: 'triFull' }, remove: ['tri_a'] },
      hint: 'İki yarım bir tam eder.', secondHint: 'Parçaları üst üste getir.', reward: 0
    },
    {
      id: 24, title: 'Saklambaç', category: 'saklama', difficulty: 4,
      instruction: 'Mino sayıyor. Kediyi ağacın arkasına sakla.',
      tutorial: 'Bir nesneyi başka bir nesnenin arkasına bırakabilirsin.',
      scene: [
        { id: 'tree24', sprite: 'tree', x: 70, y: 55, size: 40, z: 3, label: 'ağaç' },
        { id: 'cat24', sprite: 'cat', x: 26, y: 68, size: 26, drag: true, z: 6, label: 'kedi' },
        { id: 'mino24', sprite: 'mino', x: 22, y: 26, size: 18 }
      ],
      solution: { action: 'hideBehind', sourceId: 'cat24', targetId: 'tree24' },
      hint: 'Ağaç iyi bir saklanma yeri.', secondHint: 'Kediyi ağacın üstüne bırak, arkasına geçecek.', reward: 1
    },
    {
      id: 25, title: 'Bardağı doldur', category: 'boyut değiştirme', difficulty: 4,
      instruction: 'Bardağı doldur. Tek damla var.',
      scene: [
        { id: 'glass25', sprite: 'glass', x: 70, y: 62, size: 30, label: 'bardak' },
        { id: 'drop25', sprite: 'waterdrop', x: 28, y: 50, size: 14, pinch: true, drag: true, label: 'su damlası' }
      ],
      steps: [
        { do: { action: 'pinchOut', targetId: 'drop25', scale: 1.9 } },
        { do: { action: 'dropOnTarget', sourceId: 'drop25', targetId: 'glass25' }, then: { water: 'glass25' } }
      ],
      hint: 'Damla çok küçük.', secondHint: 'Önce damlayı büyüt, sonra bardağa dök.', reward: 0
    },
    {
      id: 26, title: 'Gölge yap', category: 'sürükleme', difficulty: 2,
      instruction: 'Mino terledi. Ona gölge yap.',
      scene: [
        { id: 'sun26', sprite: 'sun', x: 70, y: 24, size: 26, label: 'güneş' },
        { id: 'cloud26', sprite: 'cloud', x: 26, y: 32, size: 34, drag: true, label: 'bulut' },
        { id: 'mino26', sprite: 'mino', x: 60, y: 72, size: 28 }
      ],
      solution: { action: 'dropOnTarget', sourceId: 'cloud26', targetId: 'sun26' },
      hint: 'Güneşin önüne bir şey gelmeli.', secondHint: 'Bulutu güneşin üstüne bırak.', reward: 0
    },
    {
      id: 27, title: 'Turuncu bul', category: 'nesne birleştirme', difficulty: 3,
      instruction: 'Turuncu rengi oluştur.',
      scene: [
        { id: 'red27', shape: 'circle', color: '#ef4444', x: 30, y: 58, size: 24, drag: true, label: 'kırmızı' },
        { id: 'yellow27', shape: 'circle', color: '#facc15', x: 70, y: 58, size: 24, label: 'sarı' },
        { id: 'blue27', shape: 'circle', color: '#3b82f6', x: 50, y: 82, size: 20, drag: true, label: 'mavi' }
      ],
      solution: { action: 'dropOnTarget', sourceId: 'red27', targetId: 'yellow27' },
      onSolve: { color: { yellow27: '#fb923c' }, remove: ['red27'] },
      hint: 'İki renk karışırsa yeni bir renk çıkar.', secondHint: 'Kırmızıyı sarının üstüne bırak.', reward: 1
    },
    {
      id: 28, title: 'Kar yağdır', category: 'boyut değiştirme', difficulty: 4,
      instruction: 'Kar yağmasını sağla.',
      scene: [
        { id: 'sun28', sprite: 'sun', x: 50, y: 30, size: 34, pinch: true, label: 'güneş' },
        { id: 'tree28', sprite: 'tree', x: 30, y: 74, size: 28 },
        { id: 'mino28', sprite: 'mino', x: 72, y: 76, size: 20 }
      ],
      solution: { action: 'pinchIn', targetId: 'sun28', scale: 0.4 },
      onSolve: { snow: true },
      hint: 'Hava neden sıcak?', secondHint: 'Güneşi iki parmakla küçült.', reward: 0
    },
    {
      id: 29, title: 'Kuşu uçur', category: 'mantık tuzağı', difficulty: 4,
      instruction: 'Kuşu özgür bırak.',
      scene: [
        { id: 'cage29', sprite: 'cage', x: 50, y: 58, size: 46, z: 4, label: 'kafes' },
        { id: 'bird29', sprite: 'bird', x: 50, y: 62, size: 22, z: 3, label: 'kuş' },
        { id: 'latch29', sprite: 'latch', x: 50, y: 33, size: 14, z: 6, label: 'kafes mandalı' }
      ],
      steps: [
        { do: { action: 'tap', targetId: 'latch29' }, then: { sprite: { cage29: 'cageOpen' }, remove: ['latch29'] }, say: 'Mandal açıldı.' },
        { do: { action: 'tap', targetId: 'bird29' } }
      ],
      onSolve: { fly: ['bird29'] },
      hint: 'Kuşu değil, kafesi düşün.', secondHint: 'Önce üstteki mandala dokun.', reward: 1
    },
    {
      id: 30, title: 'Kurabiyeyi sakla', category: 'saklama', difficulty: 4,
      instruction: 'Mino diyette. Kurabiyeyi perdenin arkasına sakla.',
      scene: [
        { id: 'curtain30', sprite: 'curtain', x: 74, y: 50, size: 40, z: 3, label: 'perde' },
        { id: 'cookie30', sprite: 'cookie', x: 26, y: 66, size: 22, drag: true, z: 6, label: 'kurabiye' },
        { id: 'mino30', sprite: 'mino', x: 26, y: 28, size: 20 }
      ],
      solution: { action: 'hideBehind', sourceId: 'cookie30', targetId: 'curtain30' },
      hint: 'Görünmezse yoktur.', secondHint: 'Kurabiyeyi perdenin üstüne bırak.', reward: 0
    },

    /* ---------------- 31 - 40 : sıralama, zamanlama, bekleme ---------------- */
    {
      id: 31, title: 'Sayı sırası', category: 'sıra bulma', difficulty: 3,
      instruction: 'Sayılara küçükten büyüğe dokun.',
      scene: [
        { id: 's4', text: '4', x: 24, y: 44, fontSize: 42 },
        { id: 's1', text: '1', x: 70, y: 40, fontSize: 42 },
        { id: 's3', text: '3', x: 34, y: 74, fontSize: 42 },
        { id: 's2', text: '2', x: 76, y: 72, fontSize: 42 }
      ],
      solution: { action: 'orderedTapSequence', sequence: ['s1', 's2', 's3', 's4'] },
      hint: 'Yerleri karışık ama değerleri belli.', secondHint: '1, 2, 3, 4.', reward: 0
    },
    {
      id: 32, title: 'Kapıyı çal', category: 'çoklu dokunma', difficulty: 3,
      instruction: 'Kapıyı 5 kez çal.',
      scene: [
        { id: 'door32', sprite: 'door', x: 50, y: 52, size: 42, label: 'kapı' },
        { id: 'mino32', sprite: 'mino', x: 22, y: 82, size: 20 }
      ],
      solution: { action: 'multiTap', targetId: 'door32', count: 5, withinMs: 4000 },
      hint: 'Say bakalım.', secondHint: 'Kapıya art arda beş kez dokun.', reward: 1
    },
    {
      id: 33, title: 'Hiçbir şey yapma', category: 'zamanlama', difficulty: 4,
      instruction: 'Mino uyumak istiyor. 5 saniye boyunca hiçbir şeye dokunma.',
      scene: [
        { id: 'mino33', sprite: 'mino', x: 50, y: 55, size: 36 },
        { id: 'moon33', sprite: 'moon', x: 78, y: 24, size: 20 }
      ],
      solution: { action: 'wait', seconds: 5 },
      hint: 'Bazen en iyi hamle hamle yapmamaktır.', secondHint: 'Elini ekrandan çek ve bekle.', reward: 1
    },
    {
      id: 34, title: 'Arabayı çalıştır', category: 'sıra bulma', difficulty: 4,
      instruction: 'Kabloları doğru sırayla bağla: önce artı, sonra eksi, sonra kontak.',
      scene: [
        { id: 'bat34', sprite: 'battery', x: 26, y: 34, size: 28, label: 'pil' },
        { id: 'plus34', text: '+', x: 26, y: 66, fontSize: 44, label: 'artı uç' },
        { id: 'minus34', text: '−', x: 52, y: 66, fontSize: 44, label: 'eksi uç' },
        { id: 'car34', sprite: 'car', x: 76, y: 60, size: 32, label: 'kontak' }
      ],
      solution: { action: 'orderedTapSequence', sequence: ['plus34', 'minus34', 'car34'] },
      hint: 'Soruda sıra yazıyor.', secondHint: '+ , − , araba.', reward: 0
    },
    {
      id: 35, title: 'Perdeyi aç', category: 'hareket', difficulty: 3,
      instruction: 'Perdeyi kenara kaydır.',
      scene: [
        { id: 'curtain35', sprite: 'curtain', x: 50, y: 50, size: 60, z: 5, label: 'perde' },
        { id: 'sun35', sprite: 'sun', x: 50, y: 46, size: 26, hidden: true }
      ],
      steps: [
        { do: { action: 'swipe', targetId: 'curtain35', direction: 'left' }, then: { remove: ['curtain35'], reveal: ['sun35'] } },
        { do: { action: 'tap', targetId: 'sun35' } }
      ],
      hint: 'Perdeler sürüklenerek açılır.', secondHint: 'Perdeyi hızlıca sola kaydır, sonra arkasındakine dokun.', reward: 1
    },
    {
      id: 36, title: 'Hızlı ol', category: 'zamanlama', difficulty: 4,
      instruction: 'Balonu 3 saniye içinde 8 kez dokunarak patlat.',
      scene: [
        { id: 'balloon36', sprite: 'balloon', x: 50, y: 55, size: 30, label: 'balon' }
      ],
      solution: { action: 'multiTap', targetId: 'balloon36', count: 8, withinMs: 3000 },
      onSolve: { remove: ['balloon36'] },
      hint: 'Yavaş dokunursan sayaç sıfırlanır.', secondHint: 'Parmağını hızlıca art arda vur.', reward: 1
    },
    {
      id: 37, title: 'Hafıza ışıkları', category: 'hafıza', difficulty: 5,
      instruction: 'Işıkların yanma sırasını izle ve aynısını tekrarla.',
      preview: ['l1', 'l3', 'l2'],
      scene: [
        { id: 'l1', sprite: 'bulb', x: 26, y: 55, size: 22, label: 'sol ışık' },
        { id: 'l2', sprite: 'bulb', x: 50, y: 55, size: 22, label: 'orta ışık' },
        { id: 'l3', sprite: 'bulb', x: 74, y: 55, size: 22, label: 'sağ ışık' }
      ],
      solution: { action: 'orderedTapSequence', sequence: ['l1', 'l3', 'l2'] },
      hint: 'Sıra baştan gösterildi: sol ile başladı.', secondHint: 'Sol, sağ, orta.', reward: 1
    },
    {
      id: 38, title: 'Çayı demle', category: 'zamanlama', difficulty: 4,
      instruction: 'Demliği 2 saniye basılı tut.',
      scene: [
        { id: 'teapot38', sprite: 'teapot', x: 50, y: 55, size: 36, hold: true, label: 'demlik' },
        { id: 'cup38', sprite: 'cup', x: 76, y: 78, size: 20 }
      ],
      solution: { action: 'longPress', targetId: 'teapot38', ms: 2000 },
      hint: 'Sabır gerek.', secondHint: 'Parmağını demlikten kaldırma.', reward: 0
    },
    {
      id: 39, title: 'Günü sırala', category: 'sıra bulma', difficulty: 3,
      instruction: 'Sabahtan geceye doğru sırala.',
      scene: [
        { id: 'moon39', sprite: 'moon', x: 26, y: 55, size: 24, label: 'ay' },
        { id: 'sun39', sprite: 'sun', x: 50, y: 55, size: 24, label: 'güneş' },
        { id: 'star39', sprite: 'star', x: 74, y: 55, size: 24, label: 'yıldız' }
      ],
      solution: { action: 'orderedTapSequence', sequence: ['sun39', 'moon39', 'star39'] },
      hint: 'Önce gündüz olan.', secondHint: 'Güneş, ay, yıldız.', reward: 0
    },
    {
      id: 40, title: 'Işığı ayarla', category: 'çoklu mekanik', difficulty: 5,
      instruction: 'Lambaya 3 kez dokun, sonra basılı tutarak parlaklığı sabitle.',
      scene: [
        { id: 'lamp40', sprite: 'lamp', x: 50, y: 50, size: 34, hold: true, label: 'lamba' },
        { id: 'mino40', sprite: 'mino', x: 24, y: 80, size: 20 }
      ],
      steps: [
        { do: { action: 'multiTap', targetId: 'lamp40', count: 3, withinMs: 3000 }, then: { sprite: { lamp40: 'lampOn' } }, say: 'Işık açıldı, şimdi sabitle.' },
        { do: { action: 'longPress', targetId: 'lamp40', ms: 1200 } }
      ],
      hint: 'İki farklı hamle gerekiyor.', secondHint: 'Üç kez dokun, sonra basılı tut.', reward: 1
    },

    /* ---------------- 41 - 50 : ters köşe finalleri ---------------- */
    {
      id: 41, title: 'Elmayı düşür', category: 'sensör', difficulty: 5,
      instruction: 'Elmayı ağaçtan düşür. Elinle koparamazsın.',
      tutorial: 'Telefonunu sallayabilirsin. Masaüstünde "Salla" düğmesini kullan.',
      scene: [
        { id: 'tree41', sprite: 'tree', x: 50, y: 46, size: 52, label: 'ağaç' },
        { id: 'apple41', sprite: 'apple', x: 62, y: 46, size: 16, z: 5, label: 'elma' },
        { id: 'mino41', sprite: 'mino', x: 24, y: 80, size: 20 }
      ],
      solution: { action: 'shake' },
      onSolve: { move: { apple41: { x: 62, y: 86 } } },
      hint: 'Ağaç sallanırsa ne olur?', secondHint: 'Telefonu salla ya da alttaki "Salla" düğmesine bas.', reward: 1
    },
    {
      id: 42, title: 'Topu deliğe götür', category: 'sensör', difficulty: 5,
      instruction: 'Topu sağdaki deliğe yuvarla. Topa dokunmak yasak.',
      tutorial: 'Telefonu yana eğ. Masaüstünde ok tuşları veya "Eğ" düğmeleri iş görür.',
      scene: [
        { id: 'hole42', sprite: 'hole', x: 80, y: 74, size: 26, label: 'delik' },
        { id: 'ball42', sprite: 'ball', x: 26, y: 70, size: 20, label: 'top' }
      ],
      solution: { action: 'tilt', direction: 'right' },
      onSolve: { move: { ball42: { x: 80, y: 72 } } },
      hint: 'Yer çekimi arkadaşın.', secondHint: 'Telefonu sağa eğ.', reward: 1
    },
    {
      id: 43, title: 'Yıldızları göster', category: 'çoklu mekanik', difficulty: 5,
      instruction: 'Yıldızlar gündüz görünmez. Onları ortaya çıkar, sonra gökyüzüne dokun.',
      scene: [
        { id: 'sun43', sprite: 'sun', x: 30, y: 28, size: 28, drag: true, label: 'güneş' },
        { id: 'tree43', sprite: 'tree', x: 74, y: 74, size: 28 }
      ],
      steps: [
        { do: { action: 'dragOffScreen', sourceId: 'sun43' }, then: { night: true, spawn: { id: 'star43', sprite: 'star', x: 60, y: 30, size: 16 } }, say: 'Gece oldu.' },
        { do: { action: 'tapEmpty' } }
      ],
      hint: 'Önce gündüzden kurtul.', secondHint: 'Güneşi ekrandan çıkar, sonra boş bir yere dokun.', reward: 1
    },
    {
      id: 44, title: 'Tabloyu düzelt', category: 'perspektif', difficulty: 5,
      instruction: 'Tablo ters asılmış. Düzelt.',
      tutorial: 'İki parmakla döndürebilirsin. Masaüstünde "Döndür" düğmesi var.',
      scene: [
        { id: 'pic44', sprite: 'picture', x: 50, y: 52, size: 44, rot: 180, pinch: true, label: 'tablo' }
      ],
      solution: { action: 'rotate', targetId: 'pic44', degrees: 150 },
      onSolve: { rotate: { pic44: 0 } },
      hint: 'Tabloyu çevirmen gerek.', secondHint: 'İki parmağını tablonun üstünde çevir ya da "Döndür" düğmesine bas.', reward: 1
    },
    {
      id: 45, title: 'Anahtar küçük geldi', category: 'çoklu mekanik', difficulty: 5,
      instruction: 'Kilidi aç.',
      scene: [
        { id: 'lock45', sprite: 'lock', x: 72, y: 55, size: 40, label: 'kilit' },
        { id: 'key45', sprite: 'key', x: 26, y: 66, size: 14, drag: true, pinch: true, label: 'anahtar' }
      ],
      steps: [
        { do: { action: 'pinchOut', targetId: 'key45', scale: 1.7 }, say: 'Şimdi oldu.' },
        { do: { action: 'dropOnTarget', sourceId: 'key45', targetId: 'lock45' } }
      ],
      hint: 'Anahtar kilide göre çok küçük.', secondHint: 'Önce anahtarı büyüt, sonra kilide götür.', reward: 1
    },
    {
      id: 46, title: 'Mino uyusun', category: 'çoklu mekanik', difficulty: 6,
      instruction: 'Mino uyuyamıyor. Odayı gece yap, gürültüyü kes, sonra ona iyi geceler de.',
      scene: [
        { id: 'sun46', sprite: 'sun', x: 26, y: 24, size: 24, drag: true, label: 'güneş' },
        { id: 'mino46', sprite: 'mino', x: 50, y: 62, size: 34 },
        { id: 'radio46', sprite: 'speakerOn', x: 78, y: 76, size: 20, label: 'radyo' }
      ],
      steps: [
        { do: { action: 'dragOffScreen', sourceId: 'sun46' }, then: { night: true }, say: 'Karanlık oldu.' },
        { do: { action: 'tap', targetId: 'hud-sound', requireState: 'soundOff' }, then: { sprite: { radio46: 'speakerOff' } }, say: 'Sessizlik.' },
        { do: { action: 'longPress', targetId: 'mino46', ms: 1000 } }
      ],
      hint: 'Üç ayrı şey gerekiyor: karanlık, sessizlik, sevgi.', secondHint: 'Güneşi çıkar, üstteki ses düğmesini kapat, Mino’yu basılı tut.', reward: 1
    },
    {
      id: 47, title: 'Hiçbirine dokunma', category: 'mantık tuzağı', difficulty: 5,
      instruction: 'Bu bölümde hiçbir nesneye dokunmamalısın.',
      scene: [
        { id: 'a47', sprite: 'apple', x: 26, y: 40, size: 20, label: 'elma' },
        { id: 'b47', sprite: 'star', x: 70, y: 38, size: 20, label: 'yıldız' },
        { id: 'c47', sprite: 'heart', x: 30, y: 76, size: 20, label: 'kalp' },
        { id: 'd47', sprite: 'gift', x: 72, y: 76, size: 20, label: 'hediye' }
      ],
      solution: { action: 'tapEmpty' },
      hint: 'Ekranda nesne olmayan yerler de var.', secondHint: 'Ortadaki boşluğa dokun.', reward: 0
    },
    {
      id: 48, title: 'Limonata karıştır', category: 'sensör', difficulty: 6,
      instruction: 'Limonu suya at, karıştır ve Mino’ya ver.',
      scene: [
        { id: 'glass48', sprite: 'glass', x: 50, y: 58, size: 30, label: 'bardak' },
        { id: 'lemon48', sprite: 'lemon', x: 22, y: 42, size: 20, drag: true, label: 'limon' },
        { id: 'mino48', sprite: 'mino', x: 80, y: 76, size: 22 }
      ],
      steps: [
        { do: { action: 'dropOnTarget', sourceId: 'lemon48', targetId: 'glass48' }, then: { remove: ['lemon48'], water: 'glass48' }, say: 'Şimdi karıştır.' },
        { do: { action: 'shake' }, say: 'Karıştı!' },
        { do: { action: 'dropOnTarget', sourceId: 'glass48', targetId: 'mino48' }, prepare: { drag: ['glass48'] } }
      ],
      hint: 'Kaşık yok ama telefonun var.', secondHint: 'Limonu bardağa at, telefonu salla, bardağı Mino’ya sürükle.', reward: 1
    },
    {
      id: 49, title: 'Gol at', category: 'çoklu mekanik', difficulty: 6,
      instruction: 'Topu kaleye gönder. Önündeki taş engel oluyor.',
      scene: [
        { id: 'goal49', sprite: 'goal', x: 76, y: 40, size: 40, label: 'kale' },
        { id: 'stone49', sprite: 'stone', x: 52, y: 62, size: 24, drag: true, label: 'taş' },
        { id: 'ball49', sprite: 'ball', x: 24, y: 72, size: 20, drag: true, label: 'top' }
      ],
      steps: [
        { do: { action: 'dragOffScreen', sourceId: 'stone49' }, say: 'Yol açıldı.' },
        { do: { action: 'dropOnTarget', sourceId: 'ball49', targetId: 'goal49' } }
      ],
      hint: 'Engeli kaldırmadan olmaz.', secondHint: 'Taşı ekran dışına at, sonra topu kaleye sürükle.', reward: 1
    },
    {
      id: 50, title: 'Ters köşe finali', category: 'çoklu mekanik', difficulty: 6,
      instruction: '[[end50|SON]] kelimesini ekrandan at, Mino’yu büyüt ve bölüm numarasına dokun.',
      scene: [
        { id: 'mino50', sprite: 'mino', x: 50, y: 58, size: 30, pinch: true, label: 'Mino' },
        { id: 'star50a', sprite: 'star', x: 22, y: 34, size: 16 },
        { id: 'star50b', sprite: 'star', x: 78, y: 36, size: 16 }
      ],
      steps: [
        { do: { action: 'dragOffScreen', sourceId: 'end50' }, say: 'Son daha gelmedi.' },
        { do: { action: 'pinchOut', targetId: 'mino50', scale: 1.6 }, say: 'Mino kocaman oldu!' },
        { do: { action: 'tap', targetId: 'hud-level' } }
      ],
      hint: 'Üç farklı yeteneğini birden kullan.', secondHint: 'Kelimeyi at, Mino’yu iki parmakla büyüt, üstteki bölüm rozetine dokun.', reward: 1
    }
  ];

  global.LEVELS = LEVELS;
})(window);
