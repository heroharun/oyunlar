# Aklın Ters Köşesi

> Ekranda gördüğüne hemen inanma.

Mobil öncelikli, tarayıcıda çalışan, 50 bölümlük ters köşe zeka bulmacası.
Build sistemi yok, npm yok, dış kütüphane yok. `index.html` açılır ve oyun çalışır.

## Çalıştırma

En basit yol: `index.html` dosyasına çift tıkla.

Sensör (sallama/eğme) ve bazı tarayıcı özellikleri `file://` üzerinden kısıtlı olabilir.
Tam deneyim için küçük bir sunucu:

```bash
cd aklin-ters-kosesi
python3 -m http.server 8000
# tarayıcı: http://localhost:8000
```

Telefonda test için bilgisayarın yerel IP'sini kullan: `http://192.168.x.x:8000`

Debug paneli: `http://localhost:8000/?debug=1`
Doğrudan bölüm açma: `?debug=1&level=37`

## Dosya yapısı

| Dosya | İçerik |
|---|---|
| `index.html` | 9 ekran/katman: açılış, menü, bölüm seçme, oyun, duraklatma, tamamlama, günlük ödül, başarılar, ayarlar |
| `style.css` | Tasarım sistemi, responsive düzen, animasyonlar, erişilebilirlik modları |
| `assets.js` | ~50 özgün SVG sprite ve Mino karakteri (idle / happy / confused / hint) |
| `audio.js` | Web Audio API ile procedural ses + titreşim |
| `levels.js` | 50 bölümün tamamı, saf veri |
| `game.js` | Motorun tamamı |
| `test/` | jsdom ile otomatik oynanış ve dayanıklılık testleri |

## Mimari

`game.js` içindeki bölümler: SaveManager, GameState, UIManager, FX (parçacık),
ObjectFactory, LevelRenderer, InteractionManager, GestureManager, SensorManager,
SolutionValidator, HintManager, AchievementManager, Daily, Debug.

Oyun durumları: `BOOT → MENU / LEVEL_SELECT → PLAYING → COMPLETED`, ayrıca duraklatma katmanı.

### Bölüm veri modeli

```js
{
  id: 3, title: 'Kapıyı aç', category: 'gizli nesne', difficulty: 2,
  instruction: 'Kapıyı aç. Anahtar ortada yok.',
  scene: [ { id:'mat', sprite:'mat', x:50, y:82, size:40, drag:true, label:'paspas' } ],
  steps: [
    { do: { action:'dragOffScreen', sourceId:'mat' }, then:{ reveal:['key'] }, say:'Bak sen!' },
    { do: { action:'dropOnTarget', sourceId:'key', targetId:'door' }, then:{ sprite:{ door:'doorOpen' } } }
  ],
  hint: '...', secondHint: '...', reward: 1
}
```

Tek adımlık bölümler `steps` yerine `solution` yazabilir.
Talimat metnindeki `[[id|Kelime]]` parçaları sürüklenebilir/dokunulabilir kelime nesnesine dönüşür —
bu yüzden "yağmur" kelimesini ekrandan atmak gerçek bir hamledir.

### Desteklenen çözüm eylemleri

`tap`, `doubleTap`, `longPress`, `dropOnTarget`, `hideBehind`, `dragOffScreen`,
`orderedTapSequence`, `multiTap`, `pinchOut`, `pinchIn`, `rotate`, `swipe`,
`shake`, `tilt`, `wait`, `stateEquals`, `tapEmpty`

Hedef olarak sahne nesnelerinin yanı sıra arayüz düğmeleri de kullanılabilir:
`hud-level`, `hud-bulb`, `hud-sound`, `hud-restart`.

### Adım sonrası efektler (`then` / `onSolve`)

`reveal`, `remove`, `sprite`, `color`, `text`, `scale`, `rotate`, `move`,
`water`, `night`, `snow`, `fly`, `drag`, `spawn`

## Ekonomi

- Başlangıç: 5 ampul
- 1. ipucu 1 ampul, 2. ipucu 2 ampul
- Bölüm tamamlama: `reward:1` olan bölümlerde garanti 1 ampul, diğerlerinde %50 ihtimal
- Bölümü geçme: 1 bilet ya da 3 ampul
- Günlük ödül 7 günlük döngü, aynı gün iki kez alınamaz
- 9 başarı, her biri ampul verir

## Masaüstü ve erişilebilirlik alternatifleri

Sensör ya da çoklu dokunma gerektiren her adımda alt çubukta düğme çıkar
(Büyüt / Küçült / Döndür / Salla / Sola-Sağa eğ / Kaydır).

Klavye: `Tab` nesne seç, `Enter` dokun, `Enter`+`Enter` taşı, `Esc` iptal,
`S` salla, `←` `→` eğ, `+` `−` boyut, `R` döndür.
Ayrıca fare tekerleği büyütüp küçültür.

Ayarlarda: az hareket, yüksek kontrast, ses/müzik/titreşim, ilerlemeyi sıfırla.

## Testler

```bash
npm install jsdom
node test/playthrough.js    # 50 bölümün tamamını motor üzerinden çözer
node test/pointer-test.js   # sürükleme, bırakma, yanlış hamle, bozuk kayıt
```

Son sonuç: `50/50 bölüm çözüldü`, `15/15 dayanıklılık testi geçti`.

## Bilinen sınırlamalar

1. **Sensörler.** iOS 13+ hareket izni ister; Ayarlar → "Sensörleri etkinleştir" düğmesi bunu tetikler. İzin verilmezse bölümler alt çubuk düğmeleriyle çözülür.
2. **`file://` protokolü.** Bazı tarayıcılarda localStorage ve sensör olayları kısıtlanır; kayıt çalışmazsa oyun varsayılan kayda düşer, çökmez.
3. **Ses.** Tarayıcı politikası gereği ilk dokunuştan önce ses üretilmez. Müzik varsayılan olarak kapalıdır.
4. **Ekran dışına atma** sahne kutusunun dışı olarak ölçülür; kelime nesneleri sahnenin üstünden geldiği için onlarda "yukarı atma" sayılmaz, sağ/sol/aşağı sayılır.
5. **Testler jsdom üzerinde** çalışır; gerçek çok parmaklı jest ve sensör davranışı yalnızca gerçek cihazda doğrulanabilir.
6. **7. gün ödülü** ("Altın Mino") şu an ampul olarak verilir; ayrı bir karakter görünümü henüz çizilmedi.
7. Bölümlerin tamamı Türkçedir; çoklu dil desteği yoktur.

## Elle test kontrol listesi

- [ ] 360×640, 390×844, 430×932, tablet ve masaüstünde düzen bozulmuyor
- [ ] Hızlı çift dokunma tek hamle sayılıyor (B6)
- [ ] Sürüklerken parmak ekran dışına çıkınca nesne eve dönüyor
- [ ] Doğru cevap animasyonu sırasında yapılan dokunuş ikinci ödül vermiyor
- [ ] Yeniden başlat sonrası eski nesneler ve sayaçlar temizleniyor
- [ ] Bölüm değişiminde bekleme sayacı ve sensörler sıfırlanıyor
- [ ] localStorage elle bozulduğunda oyun açılıyor
- [ ] Ekran döndürüldüğünde nesne konumları korunuyor
- [ ] İki parmakla sayfa zoom olmuyor
- [ ] Masaüstünde sensör bölümleri (41, 42, 48) düğmelerle çözülüyor
- [ ] Ampul 0 iken ipucu alınamıyor, bakiye eksiye inmiyor
- [ ] Günlük ödül aynı gün ikinci kez alınamıyor
- [ ] Ses kapalıyken görsel geri bildirim yeterli (B19 ve B46 hâlâ çözülebilir)
