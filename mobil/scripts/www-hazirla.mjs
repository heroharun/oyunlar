/* MasalPark mobil: web kökünü (üst dizin) www/ içine derler.
   - test / araç / kaynak klasörleri ve node_modules paket dışı
   - Service Worker kapatılır (mağaza uygulamasında güncelleme mağazadan gelir;
     iOS WKWebView'da SW zaten çalışmaz)
   - kökten bağımsız (/manifest.json) referanslar göreli yapılır
   Çalıştır: npm run www   (mobil/ içinden) */
import { cpSync, rmSync, mkdirSync, readFileSync, writeFileSync, existsSync, statSync, readdirSync } from 'node:fs';
import { join, dirname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const MOBIL = dirname(dirname(fileURLToPath(import.meta.url)));
const KOK = dirname(MOBIL);
const WWW = join(MOBIL, 'www');

/* paket dışı: tam yol eşleşmesi (köke göre) */
const DISLA_KLASOR = new Set([
  'mobil', '.git', '.github', 'arac', 'bulut-worker', 'claudedocs',
  'iyilik-adasi-test', 'zekatim-test', 'zekatim-test2',
  'teskilat/node_modules', 'teskilat/src', 'teskilat/public',
]);
const DISLA_DOSYA = new Set([
  'CNAME', 'sw.js', '.DS_Store', '.gitignore', 'README.md',
  'teskilat/dist/sw.js', 'teskilat/index.html', 'teskilat/vite.config.ts',
  'teskilat/tsconfig.json', 'teskilat/package.json', 'teskilat/package-lock.json',
  'topac-sumo/orijinal.html',
]);
const DISLA_UZANTI = /\.(md|map|ts|log|sh|mjs|toml|lock)$/;

function filtre(src) {
  const rel = relative(KOK, src).split('\\').join('/');
  if (rel === '') return true;
  const st = statSync(src);
  if (st.isDirectory()) return !DISLA_KLASOR.has(rel) && !rel.split('/').some(p => p === 'node_modules');
  if (DISLA_DOSYA.has(rel)) return false;
  if (rel.startsWith('teskilat/') && !rel.startsWith('teskilat/dist/')) return false;
  if (rel.endsWith('.DS_Store')) return false;
  if (DISLA_UZANTI.test(rel) && !rel.startsWith('teskilat/dist/')) return false;
  return true;
}

rmSync(WWW, { recursive: true, force: true });
mkdirSync(WWW, { recursive: true });
/* kök → www: Node, kökü kendi alt dizinine kopyalamayı reddeder; kök girdilerini tek tek kopyala */
for (const ad of readdirSync(KOK)) {
  const src = join(KOK, ad);
  if (!filtre(src)) continue;
  cpSync(src, join(WWW, ad), { recursive: true, filter: filtre });
}

/* --- portal: SW kaydı ve sürüm-damgası yenilemesi kapalı --- */
const portalYol = join(WWW, 'index.html');
let portal = readFileSync(portalYol, 'utf8');
const swKayit = "if('serviceWorker' in navigator)\n  navigator.serviceWorker.register('sw.js').catch(()=>{});";
if (!portal.includes(swKayit)) throw new Error('portal SW kayıt bloğu bulunamadı — www-hazirla.mjs güncellenmeli');
portal = portal.replace(swKayit, "/* mobil uygulama: Service Worker yok, güncellemeler mağazadan gelir */\nwindow.MASALPARK_MOBIL=true;");
/* sürüm kontrolü yerel dosyaya bakar, hiç değişmez → zararsız; yine de reload döngüsü riskine karşı kapat */
portal = portal.replace("document.addEventListener('visibilitychange',()=>{ if(!document.hidden)setTimeout(kontrol,400); });",
  "if(!window.MASALPARK_MOBIL)document.addEventListener('visibilitychange',()=>{ if(!document.hidden)setTimeout(kontrol,400); });");
portal = portal.replace("setInterval(kontrol,5*60*1000);", "if(!window.MASALPARK_MOBIL)setInterval(kontrol,5*60*1000);");
/* Capacitor'ın yerel sunucusu klasör adreslerine ("oyun/") kök index.html döndürür (tek sayfa uygulama varsayımı);
   oyun bağlantılarını açıkça index.html'e yönlendir */
let baglanti = 0;
portal = portal.replace(/href="([a-z0-9-]+(?:\/dist)?)\/"/g, (m, yol) => { baglanti++; return `href="${yol}/index.html"`; });
if (baglanti < 70) throw new Error(`portalda yalnız ${baglanti} oyun bağlantısı çevrildi — kalıp değişmiş olabilir`);
writeFileSync(portalYol, portal);

/* --- kökten bağımsız referanslar (GitHub Pages kökünde çalışır, uygulama paketinde de kök www/ olduğu için
       Android'de https://localhost/ altında sorunsuz; iOS capacitor://localhost/ için de aynı) ---
   Yine de göreli yapmak daha güvenli: */
const hafizlik = join(WWW, 'hafizlik-ajandasi/index.html');
if (existsSync(hafizlik)) {
  writeFileSync(hafizlik, readFileSync(hafizlik, 'utf8').replace('href="/manifest.json"', 'href="../manifest.json"'));
}

/* özet */
let adet = 0, boyut = 0;
function gez(d) {
  for (const ad of readdirSync(d)) {
    const p = join(d, ad); const st = statSync(p);
    if (st.isDirectory()) gez(p); else { adet++; boyut += st.size; }
  }
}
gez(WWW);
console.log(`www/ hazır: ${adet} dosya, ${(boyut / 1048576).toFixed(1)} MB`);
