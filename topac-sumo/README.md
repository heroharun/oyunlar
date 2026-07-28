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

## Deploy (prod, "düzgün")
```bash
docker compose up -d
#  web  → :8080  (oyun)
#  peer → :9000/peer  (kendi sinyal sunucumuz)
```
Sonra:
1. **PeerServer'ı bağla** — `index.html` içinde:
   ```js
   const SIGNAL = { host:'sumo.ornek.com', port:443, secure:true, path:'/peer' };
   ```
   (443'ü Caddy/Nginx ile TLS terminate edip `/peer`'i 9000'e proxy'le; WebSocket upgrade açık.)
2. **TURN'ü kur** — `coturn/turnserver.conf`'u bir VPS'e koy (`/etc/turnserver.conf`),
   `external-ip` ve `realm`'i kendi sunucuna göre ayarla, `systemctl enable --now coturn`.
   `index.html` `RTC_CONFIG` içindeki `turn:` adres/kullanıcı/parola bununla eşleşmeli.
3. **peerjs.js'i self-host et** (opsiyonel ama önerilir) — şu an `unpkg.com` CDN'inden
   yükleniyor; kendi sunucuna kopyalayıp `<script src>`'i değiştir (dış bağımlılık kalmasın).

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
