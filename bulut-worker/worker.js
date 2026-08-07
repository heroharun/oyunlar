/* MasalPark Bulut Kaydı — Cloudflare Worker + D1
   API:
     GET /api/kayit/AILE-XXXX-XXXX  → {veri, zaman} | {yok:true}
     PUT /api/kayit/AILE-XXXX-XXXX  (gövde: MASALPARK1.… yedek kodu) → {tamam:true}
*/
const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,PUT,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};
const json = (o, durum = 200) =>
  new Response(JSON.stringify(o), {
    status: durum,
    headers: { 'Content-Type': 'application/json', ...CORS },
  });

export default {
  async fetch(req, env) {
    if (req.method === 'OPTIONS') return new Response(null, { headers: CORS });
    const url = new URL(req.url);
    const m = url.pathname.match(/^\/api\/kayit\/([A-Za-z0-9-]{8,24})$/);
    if (!m) return json({ hata: 'yol' }, 404);
    const kod = m[1].toUpperCase();

    if (req.method === 'GET') {
      const r = await env.DB.prepare('SELECT veri, zaman FROM kayitlar WHERE kod=?1')
        .bind(kod).first();
      if (!r) return json({ yok: true });
      return json({ veri: r.veri, zaman: r.zaman });
    }

    if (req.method === 'PUT') {
      const veri = await req.text();
      if (veri.length > 300000) return json({ hata: 'buyuk' }, 413);
      if (!veri.startsWith('MASALPARK1.')) return json({ hata: 'bicim' }, 400);
      await env.DB.prepare(
        'INSERT INTO kayitlar (kod, veri, zaman) VALUES (?1, ?2, ?3) ' +
        'ON CONFLICT(kod) DO UPDATE SET veri=excluded.veri, zaman=excluded.zaman'
      ).bind(kod, veri, Date.now()).run();
      return json({ tamam: true });
    }

    return json({ hata: 'yontem' }, 405);
  },
};
