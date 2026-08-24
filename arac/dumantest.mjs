// Duman testi: node arac/dumantest.mjs <oyun...>  (oyun yoksa portal)
// iPhone 13 profili: JS hatası + yatay taşma raporu. Sunucuyu kendisi açar/kapatır.
import { existsSync } from 'fs';
const PW = ['/tmp/node_modules/playwright/index.mjs',
  process.env.HOME + '/.masalpark/node_modules/playwright/index.mjs'].find(existsSync);
const { chromium, devices } = await import(PW);
import { spawn } from 'child_process';
const KOK = new URL('..', import.meta.url).pathname;
const srv = spawn('python3', ['-m','http.server','8899','--bind','127.0.0.1'], { cwd: KOK, stdio: 'ignore' });
await new Promise(r => setTimeout(r, 1200));
const oyunlar = process.argv.slice(2); if (!oyunlar.length) oyunlar.push('');
const b = await chromium.launch();
let sorun = 0;
for (const o of oyunlar) {
  const ctx = await b.newContext({ ...devices['iPhone 13'] });
  const p = await ctx.newPage();
  const hata = []; p.on('pageerror', e => hata.push(e.message.slice(0, 60)));
  try {
    await p.goto('http://127.0.0.1:8899/' + (o ? o + '/' : ''), { waitUntil: 'domcontentloaded', timeout: 20000 });
    await p.waitForTimeout(2000);
    const t = await p.evaluate(() => document.documentElement.scrollWidth - innerWidth);
    const durum = (hata.length ? 'HATA:' + hata[0] : 'temiz') + (t > 3 ? ` TAŞMA+${t}px` : '');
    if (hata.length || t > 3) sorun++;
    console.log((o || 'PORTAL').padEnd(20), durum);
  } catch (e) { sorun++; console.log((o || 'PORTAL').padEnd(20), 'YÜKLENEMEDİ'); }
  await ctx.close();
}
await b.close(); srv.kill();
process.exit(sorun ? 1 : 0);
