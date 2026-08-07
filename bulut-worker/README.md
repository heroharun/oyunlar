# MasalPark Bulut Kaydı — Kurulum (bir kere, ~5 dakika)

Aile koduyla bulut yedeği için küçük bir Cloudflare Worker + D1 veritabanı.
Ücretsiz katman fazlasıyla yeter (günde 100k okuma/yazma).

## Adımlar

```bash
npm install -g wrangler
cd bulut-worker
wrangler login                       # tarayıcıda Cloudflare girişi açılır

wrangler d1 create masalpark-kayit   # çıktıdaki database_id'yi kopyala
# wrangler.toml içindeki BURAYA-D1-ID-GELECEK yerine yapıştır

wrangler d1 execute masalpark-kayit --remote \
  --command "CREATE TABLE IF NOT EXISTS kayitlar (kod TEXT PRIMARY KEY, veri TEXT, zaman INTEGER)"

wrangler deploy                      # çıktıda URL verir:
# https://masalpark-kayit.<hesap-adi>.workers.dev
```

## Portalı bağlama

`index.html` içinde `BULUT_API` sabiti var; varsayılanı:

```
https://masalpark-kayit.heroharun.workers.dev/api/kayit/
```

Deploy çıktısındaki adres farklıysa bu sabiti güncelle (sonunda `/api/kayit/` kalsın).
Alternatif: koda dokunmadan tarayıcı konsolunda
`localStorage.setItem('mp_bulutApi','https://.../api/kayit/')` ile de değiştirilebilir.

## Notlar

- Kod formatı: `AILE-XXXX-XXXX` (I, L, O, 0, 1 karakterleri kullanılmaz).
- Her aile kodu tek satır tutar; yeni yedek eskisinin üzerine yazar (son yazan kazanır).
- Kayıt gövdesi portalın ürettiği `MASALPARK1.` yedek kodudur; kişisel veri içermez.
- Sınır: kayıt başına 300 KB.
