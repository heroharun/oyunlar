# TOPAÇ SUMO — Arena (bizim sürüm)

Özgün oyun fikri ve ilk sürümü **Alameddin Ç.** — <https://sumo.alameddinc.com>. Teşekkürler! 🙏
Bu repo oyunu kendi altyapımıza taşır, multiplayer'ı hızlandırır ve yeni add-on'lar ekler.

## Ne değişti

### 1. Multiplayer "arada yavaş" — düzeltmeler
Sebep tek değildi, üç koldan ele alındı:

- **Client-side prediction (netcode).** Eskiden misafir, kendi topacının hareketini bile
  host'tan snapshot dönene kadar göremiyordu → tam bir round-trip input gecikmesi.
  Artık misafir kendi topacını **lokal tahmin** ediyor (anında tepki), host snapshot'ı
  geldikçe yumuşakça uzlaşıyor. Büyük sapmada (çarpışma/itiş) anında düzeltme. `PREDICT=true`.
- **Kendi PeerServer'ımız.** Eskiden bağlantı kurulumu PeerJS'in ücretsiz public bulutuna
  bağlıydı (rate-limitli, SLA'sız). `server/peerserver.js` ile sinyal bizim.
- **Doğrudan-öncelik + kendi TURN.** `iceTransportPolicy:'all'` → önce P2P (düşük gecikme),
  olmazsa kendi coturn'ümüz üzerinden relay. TURN sadece gerektiğinde devrede.

### 2. Beş yeni add-on
| Add-on | Etki |
|---|---|
| 🛡 **KALKAN** | ~5 sn itişe ve silah hasarına bağışık (BLOK) |
| 🧲 **MIKNATIS** | ~4 sn rakibi kendine çeker (çapa'lı rakibi çekemez) |
| ⚓ **ÇAPA** | ~4 sn yerinden oynamaz — ring dışına itilemez |
| 🚀 **ROKET** | ~5 sn hız +%60 ve dash hep hazır |
| ❄ **BUZ** | rakibi ~1,4 sn dondurur (hareket edemez) |

Mevcut add-on'lar (kılıç/bıçak/tabanca/taramalı/zincir/büyü/küçül/klon/görünmez/kılık/onarım) korundu.

## Çalıştırma (yerel)
Tek dosya, statik. Ama multiplayer için WebRTC gerektiğinden `file://` değil bir sunucudan aç:
```bash
cd topac-sumo
python3 -m http.server 8080     # → http://localhost:8080
```
Tek makinede test için: bir sekmede **ODA KUR**, koddan diğer sekmede/cihazda **KATIL**.

## Deploy (prod) — MasalPark altyapısı (11 Kasım 2026)
Oyun, sinyal ve TURN ayarlarını açılışta **`https://api.masalpark.com/v1/rtc`** adresinden çeker
(`agAyar()`); API'ye ulaşılamazsa PeerJS public bulutu + yalnız STUN ile devam eder.
- Sinyal: `wss://api.masalpark.com/peer` → `sunucu/peer/` (PeerServer konteyneri, Caddy `handle /peer/*`).
- TURN: Hetzner sunucusunda coturn, süreli kimlik (API üretir). Sunucu/IP değişince yalnız sunucu `.env`
  ve `/etc/turnserver.conf` güncellenir; oyun ve mobil uygulama için yeni sürüm gerekmez.
- Bu klasördeki `docker-compose.yml`, `server/`, `coturn/` eski bağımsız kurulum içindir; canlı kurulum `sunucu/` altındadır.

## Dosyalar
```
index.html              oyun (tek dosya) — prediction + 5 add-on + config
orijinal.html           Alameddin Ç.'nin ilk sürümü (referans/kredi)
server/peerserver.js    kendi PeerJS sinyal sunucumuz
coturn/turnserver.conf  kendi TURN sunucu şablonu
docker-compose.yml      web + peer tek komutla
```

## Bilinmesi gerekenler
- **Prediction 2 cihazda test edilmeli.** Kod syntax olarak doğrulandı, tek-oyunculu/bot
  mantığı değişmedi; ama gerçek gecikme hissi ancak iki ayrı cihaz + TURN ile ölçülür.
  Sorun çıkarsa `PREDICT=false` yapıp eski (yumuşak ama gecikmeli) davranışa dönülür.
- Simülasyon **host-authoritative** kaldı (hile/çarpışma host'ta) — prediction sadece
  misafirin kendi topacının hissini düzeltir, otoriteyi değiştirmez.
- Add-on efektleri host'ta hesaplanır, misafire snapshot ile senkronlanır (HUD + görsel).

## Kredi
Fikir ve orijinal oyun: **Alameddin Ç.** — sumo.alameddinc.com
Altyapı taşıma, netcode prediction, yeni add-on'lar: **Harun**
