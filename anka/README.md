# MİT: ANKA Protokolü

Tarayıcıda çalışan, tamamen kurgusal bir istihbarat–bilmece oyunu. Dört oda,
beş bilmece, üç kod, dört şüpheli ve 20 dakika.

> **Kurgu uyarısı.** Bu oyun yalnızca eğlence amaçlıdır. Gerçek bir kurumun
> personeli, operasyonu, binası, yöntemi veya gizli bilgisi kullanılmamıştır.
> Bütün kişiler, birimler, kayıtlar ve olaylar uydurmadır. Kurum teması sadece
> sinematik bir ajanlık atmosferi kurmak için kullanılmıştır.

---

## Nasıl çalıştırılır?

`index.html` dosyasına çift tıkla. Kurulum, sunucu, npm veya internet bağlantısı
gerekmez. Bütün sesler tarayıcıda üretilir; telifli hiçbir dosya yoktur.

GitHub Pages'e koyacaksan klasörü olduğu gibi yükle, `index.html` giriş noktasıdır.

## Dosya yapısı

```
anka/
├── index.html            # ekranların iskeleti
├── style.css             # arayüz
├── game.js               # motor: durum, çizim, etkileşim, finaller
├── riddles.js            # TÜM içerik: odalar, bilmeceler, şüpheliler, kanıtlar
├── test-playthrough.js   # jsdom ile uçtan uca oynanış testi (isteğe bağlı)
└── README.md
```

İçerik ile motor ayrıdır: yeni oda, bilmece veya kanıt eklemek için yalnızca
`riddles.js` düzenlenir.

## Oyun mekanikleri

**Akış.** Saat bilmecesi → kitaptan anahtar → çekmecedeki notu sırala → pusula →
el feneri → güvenlik ofisinde kart, kapı kaydı ve kamera → pil + radyo →
frekans `19-23-07` → ışık dizisi → suçlama → hoparlör → 30 saniyelik son kod.

**Kodlar.** `19` saatin arkasında, `23` pusulanın altında, `07` güvenlik kayıt
defterinin 7. sayfasında.

**Köstebek.** Kerem. Beyanı 20.40'ta çıktığını söyler; kamera onu 21.03'te arşiv
koridorunda gösterir. Arşiv kapısı 21.05'te Ece'nin kartıyla açılır, kart ise
askılıkta değil yerde bulunur. Kayıp USB arşiv dolabından çıkar. Ece ilk bakışta
suçlu görünür ama kartı kullanan Kerem'dir.

**Gerekçe kuralı.** Suçlama için tam üç kanıt seçilir. Kabul edilmesi için kamera
görüntüsü zorunlu, yanına `arsiv-giris` / `usb` / `ece-kart` kanıtlarından en az
ikisi gerekir. `riddles.js` içindeki `DOGRU_KANITLAR` ideal üçlüyü belgeler.

**Puan.** Bilmece +500, ipucusuz çözüm +250, gizli kanıt +300, not birleştirme
+400, üçüncü kod +300, frekans +600, köstebek +2000, kalan her saniye +5.
Yanlış nesne −100, yanlış şifre −250. Puan sıfırın altına inmez.

**Alarm.** Yanlış nesne +5, yanlış şifre +15, yanlış suçlama +30. 30'dan sonra
ekran kenarı kızarır, 60'tan sonra titrer, 100'de görev kaybedilir.

**Finaller.** Kusursuz Operasyon (alarm ≤20, ipucusuz, hatasız) · Görev Başarılı ·
Yanlış Şüpheli (ilk yanlış isimde bir düzeltme hakkı verilir) · Protokol Sızdırıldı.

**Rütbeler.** Aday Analist → Saha Destek Uzmanı → İstihbarat Analisti →
Kıdemli Operasyon Uzmanı → Başanalist → ANKA Ajanı (9500+).

## Yeni oda nasıl eklenir?

`riddles.js` içinde `ROOMS` nesnesine yeni bir anahtar ekle, sonra `ROOM_ORDER`
dizisine kimliğini yaz:

```js
depo: {
  id: 'depo', ad: 'Depo', kod: 'A-05',
  atmosfer: 'Raflar boş. Toz taze.',
  objects: [
    { id: 'sandik', ad: 'Sandık', ikon: '📦', x: 40, y: 50,
      tur: 'etkilesim', act: 'sandik', metin: 'Kapağı aralık.' }
  ]
}
```

`x` ve `y` sahnedeki yüzde konumdur (0–100), nesnenin merkezini verir.
`tur: 'dekor'` olan nesneler yalnızca metin gösterir. `act` verirsen `game.js`
içindeki `runAct()` fonksiyonuna aynı isimde bir `case` eklemen gerekir.

## Yeni bilmece nasıl eklenir?

`RIDDLES` dizisine bir nesne ekle. Sıra `need` bayrağıyla kurulur: bir bilmece,
`need` alanındaki bayrak açılana kadar görünmez.

```js
{
  id: 'ayna', room: 'depo',
  need: 'fener_ok',        // bu bayrak açılınca sırası gelir
  gives: 'ayna_ok',        // çözülünce bu bayrağı açar
  question: 'Bana bakarsın, kendini görürsün.',
  answerObjectId: 'ayna',
  hint1: '…', hint2: '…', hint3: '…',
  reward: 500, penalty: 100, completed: false
}
```

Ödül vermek istersen `game.js` içindeki `solveRiddle()` fonksiyonunda
`if (r.id === 'ayna') { … }` bloğu aç.

## Ses dosyaları nasıl değiştirilir?

Harici ses yok. Bütün efektler `game.js` içindeki `Sfx` nesnesinde Web Audio API
ile üretilir. Frekans, süre ve dalga tipini `Sfx.tone(frekans, süre, tip, ses)`
çağrılarından değiştirebilirsin. Kendi dosyalarını kullanmak istersen `Sfx`
metotlarını `new Audio('sesler/klik.mp3').play()` ile değiştirmen yeterli;
çağrı noktalarını değiştirmen gerekmez.

## Geliştirici modu

`game.js` dosyasının başındaki `DEV_MODE` değerini `true` yap. Sağ altta bir
panel çıkar: puan ekleme, süre değiştirme, alarm yükseltme, bütün eşya ve
kanıtları verme, bilmeceleri toplu çözme, finalleri doğrudan test etme.
`false` iken paneli oluşturan kod hiç çalışmaz.

Süreyi kalıcı değiştirmek için aynı bölümdeki `GAME_DURATION` sabitini kullan
(saniye cinsinden; test için `5 * 60` iyi bir değer).

## Test

```bash
npm i jsdom
node test-playthrough.js
```

Test, açılıştan final ekranına kadar tüm görevi oynar: yanlış nesne cezası,
not sıralama, kod girişi, ışık bulmacası, yanlış suçlama düzeltme hakkı,
son sayaç ve rapor ekranı dahil 58 kontrol.

## Erişilebilirlik

Bütün etkileşimler gerçek `button` öğeleridir; oyun baştan sona klavyeyle
oynanabilir (Tab ile gez, Enter ile seç, Esc ile pencereleri kapat ve eşya
seçimini iptal et). Odak göstergeleri görünür, dokunma alanları en az 44 piksel,
metin kontrastı yüksektir. Bilgi hiçbir yerde yalnızca renkle verilmez; alarm
seviyesi hem sayı hem çubuk olarak gösterilir. `prefers-reduced-motion` açıksa
animasyonlar kapanır.

## Saklanan veriler

Tarayıcının `localStorage` alanında yalnızca kod adın, en yüksek puanın, ses
tercihin ve başarımların tutulur. Hiçbir veri sunucuya gönderilmez. Ayarlar
penceresindeki "Kayıtları Sil" düğmesi hepsini temizler.

## Bilinen sınırlamalar

- Odalar CSS ile kurulmuş şematik sahnelerdir; çizim veya fotoğraf yoktur.
- Kanıt panosunda kartlar arasında görsel bağlantı çizme (sürükleyip birleştirme)
  henüz yok; bağlantı kurma işi suçlama ekranında yapılır.
- Bilmeceler sabittir, rastgele seçim yoktur.
- Skor tablosu yereldir, cihazlar arası paylaşılmaz.
- Ses için Web Audio API gerekir; desteklenmeyen ortamda oyun sessiz çalışır.
