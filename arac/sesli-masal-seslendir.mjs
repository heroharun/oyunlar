#!/usr/bin/env node
/* Sesli Masallar anlatımlarını Gemini TTS ile seslendirir → sesli-masallar/ses/{dil}/{nn}.mp3
   Kullanım: node arac/sesli-masal-seslendir.mjs [--dil tr,en,ar,fr] [--ses Sulafat] [--sahne 1,2] [--cikti DIZIN] [--zorla]
   Anahtar: ~/.config/gcloud-keys/gemini-reels.key   Gerekli: ffmpeg (libmp3lame)
   Çıktı: 24 kHz mono MP3 ~40 kb/s (bir masal, dört dil ≈ 4 MB). Var olan dosyalar --zorla yoksa atlanır. */
import { readFileSync, writeFileSync, mkdirSync, existsSync, statSync, unlinkSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { homedir } from 'node:os';
import { join } from 'node:path';

const arg = (k, d) => { const i = process.argv.indexOf('--' + k); return i > -1 ? (process.argv[i + 1] ?? true) : d; };
const DILLER = String(arg('dil', 'tr,en,ar,fr')).split(',');
const SES = arg('ses', 'Sulafat');
const SAHNE = arg('sahne', '') ? String(arg('sahne')).split(',').map(Number) : null;
const CIKTI = arg('cikti', 'sesli-masallar/ses');
const ZORLA = process.argv.includes('--zorla');
const MODEL = process.env.TTS_MODEL || 'gemini-3.8-flash-tts';
const KEY = readFileSync(join(homedir(), '.config/gcloud-keys/gemini-reels.key'), 'utf8').trim();

/* anlatım metinlerini index.html içindeki veri bloğundan çek */
const html = readFileSync('sesli-masallar/index.html', 'utf8');
const i = html.indexOf('Masal Park — Sesli Masal verisi');
const code = html.slice(html.indexOf('>', html.lastIndexOf('<script', i)) + 1, html.indexOf('</script>', i));
const win = {}; new Function('window', code)(win);
const masal = win.MasalPark.stories[0];

const STIL = {
  tr: 'Türkçe. Çocuklara masal anlatan sıcak, şefkatli ve öğretici bir kadın anaokulu öğretmeni gibi konuş. Sakin, net, biraz yavaş tempo; her cümle anlaşılır. Karakterlerin konuşmalarını hafifçe canlandır ama abartma. Doğal insan sesi, robotik değil.',
  en: 'English. Speak like a warm, caring kindergarten teacher telling a story to young children: calm, clear, slightly slow, gently expressive in the dialogue lines, never over-acted. Natural human voice.',
  ar: 'Arabic (Modern Standard). Speak like a warm, caring kindergarten teacher telling a story to young children: calm, clear, slightly slow, gently expressive in dialogue, never over-acted. Natural human voice.',
  fr: 'French. Speak like a warm, caring kindergarten teacher telling a story to young children: calm, clear, slightly slow, gently expressive in dialogue, never over-acted. Natural human voice.',
};

async function uret(metin, dil) {
  const body = {
    contents: [{ parts: [{ text: metin, speechMetadata: { style: STIL[dil] } }] }],
    generationConfig: { responseModalities: ['AUDIO'], speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: SES } } } },
  };
  const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`, {
    method: 'POST', headers: { 'Content-Type': 'application/json', 'x-goog-api-key': KEY }, body: JSON.stringify(body),
  });
  if (!r.ok) throw new Error(r.status + ' ' + (await r.text()).slice(0, 600));
  const d = await r.json();
  const part = d.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
  if (!part) throw new Error('ses yok: ' + JSON.stringify(d).slice(0, 400));
  return { ham: Buffer.from(part.inlineData.data, 'base64'), mime: part.inlineData.mimeType, kullanim: d.usageMetadata };
}

let toplam = 0;
for (const dil of DILLER) {
  const dizin = join(CIKTI, dil); mkdirSync(dizin, { recursive: true });
  for (let n = 0; n < masal.scenes.length; n++) {
    if (SAHNE && !SAHNE.includes(n + 1)) continue;
    const ad = String(n + 1).padStart(2, '0'), mp3 = join(dizin, ad + '.mp3');
    if (existsSync(mp3) && !ZORLA) { console.log(dil, ad, 'var, atlandı'); toplam += statSync(mp3).size; continue; }
    const metin = masal.scenes[n].narration[dil];
    let sonuc, deneme = 0;
    while (true) { try { sonuc = await uret(metin, dil); break; } catch (e) { if (++deneme > 3) throw e; console.log(dil, ad, 'yeniden:', e.message.slice(0, 120)); await new Promise(r => setTimeout(r, 3000 * deneme)); } }
    const ham = join(dizin, ad + (sonuc.ham.subarray(0, 4).toString() === 'RIFF' ? '.wav' : '.pcm'));
    writeFileSync(ham, sonuc.ham);
    const giris = ham.endsWith('.pcm') ? ['-f', 's16le', '-ar', '24000', '-ac', '1', '-i', ham] : ['-i', ham];
    execFileSync('ffmpeg', ['-y', '-hide_banner', '-loglevel', 'error', ...giris,
      '-af', 'loudnorm=I=-18:TP=-1.5:LRA=11,silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.25',
      '-ac', '1', '-ar', '24000', '-c:a', 'libmp3lame', '-b:a', '40k', '-id3v2_version', '0', '-write_xing', '0', mp3]);
    unlinkSync(ham);
    const boyut = statSync(mp3).size; toplam += boyut;
    const sn = execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', mp3]).toString().trim();
    console.log(dil, ad, (boyut / 1024).toFixed(0) + ' KB', Number(sn).toFixed(1) + ' s', sonuc.mime);
  }
}
console.log('toplam', (toplam / 1024 / 1024).toFixed(2), 'MB');
