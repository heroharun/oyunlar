# Kelime Yörüngesi

**Harfleri Birleştir, Dünyanı Canlandır**

Mobil öncelikli, tek dokunuşla oynanan Türkçe kelime bulmacası. Harfler ekranın altında bir
yörünge üzerinde durur; parmakla birleştirilen her doğru kelime, üstteki küçük gezegenin
dünyasında bir şeyi canlandırır: çiçek açar, ağaç büyür, ev ışıkları yanar, köprü tamamlanır,
gökyüzüne yıldız eklenir, çarklar dönmeye başlar.

Kurulum yok, build yok, npm yok. `index.html` dosyasını aç, oyun çalışır.

## Dosyalar

| Dosya | İşi |
|---|---|
| `index.html` | İskelet ve dosya bağlantıları |
| `style.css` | Tema, yerleşim, animasyonlar |
| `game.js` | Oyun akışı: seçim, kontrol, puan, ipucu, kayıt |
| `levels.js` | Bölümler: harfler, kelimeler, sahne ve renk paleti |
| `dictionary.js` | Türkçe sözlük (bonus kelimeler buradan bulunur) |
| `scenes.js` | Küçük dünyanın prosedürel SVG çizimi |
| `audio.js` | WebAudio ile üretilen sesler (ses dosyası yok) |
| `manifest.json`, `service-worker.js` | Ana ekrana ekleme ve çevrimdışı oynama |

Hiçbir harici istek yok: font, görsel, ses, sözlük API'si kullanılmaz.

## Yeni bölüm eklemek

`levels.js` içindeki diziye yeni bir nesne ekle:

```js
{
  id: 13,
  title: 'Uyuyan Değirmen',
  hint: 'Taşlar dönmeyi unuttu.',
  letters: ['D', 'E', 'Ğ', 'İ', 'R'],      // 3–7 harf
  words: ['DER', 'DERİ', 'DEĞİR'],          // sahnedeki parça sayısı = kelime sayısı
  scene: 'carkli',                          // aşağıdaki sahnelerden biri
  palette: { sky1:'#…', sky2:'#…', land1:'#…', land2:'#…',
             item:'#…', item2:'#…', stem:'#…', glow:'#…' }
}
```

Sahneler: `cicek`, `agac`, `ev`, `kopru`, `tekne`, `gol`, `ruzgar`, `carkli`, `sehir`, `yildiz`.

Kural: bölümün her kelimesi hem harf havuzundan yazılabilmeli hem de `dictionary.js` içinde
bulunmalı. Sözlükteki, o harflerle yazılabilen ama listede olmayan kelimeler otomatik olarak
**bonus kelime** olur — ana kutulara girmez, yıldız tozu kazandırır.

## Ayarlar

`game.js` başındaki `CONFIG`:

- `slotOrder`: `'length'` (harf sayısına göre), `'alpha'` (alfabetik) veya `'level'` (bölümdeki sıra)
- `hintCosts`: üç ipucunun fiyatı — *Harf aç*, *Işık tut* (kelimeyi sen seçersin), *Kelimeyi aç*
- `minWordLength`, `pointsPerLetter`, `coinPerLetter`, `bonusCoin`, `startCoins`

## Oynanış notları

- Karıştırma sınırsız ve ücretsizdir, puan düşürmez.
- Aynı harf bir kelimede bir kez kullanılır; havuzda iki tane varsa ikisi de ayrı taştır.
- Bulunan bir kelimeye dokununca o kelimenin dünyaya ne kattığı gösterilir.
- İlerleme `localStorage` içinde bu cihazda saklanır; sunucuya hiçbir şey gönderilmez.

## Yayına alma

Klasörü olduğu gibi statik bir sunucuya (ör. GitHub Pages) koymak yeterli. Çevrimdışı önbellek
için dosyalarda değişiklik yaptığında `service-worker.js` içindeki `CACHE` sürümünü artır.
