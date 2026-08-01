/* =========================================================
   assets.js - Aklın Ters Köşesi
   Tüm görseller elle çizilmiş hisli, özgün SVG'lerdir.
   Her sprite 0 0 100 100 viewBox içinde tanımlanır.
   ========================================================= */
(function (global) {
  'use strict';

  var INK = '#2f2a45';

  /* Ortak sarmalayıcı: kontur stilleri tek yerde */
  function wrap(inner, extra) {
    return '<svg viewBox="0 0 100 100" class="sprite-svg" preserveAspectRatio="xMidYMid meet" aria-hidden="true">' +
      '<g fill="none" stroke="' + INK + '" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"' +
      (extra || '') + '>' + inner + '</g></svg>';
  }

  /* Küçük yardımcılar */
  function eyes(cx1, cx2, cy, r) {
    r = r || 3.2;
    return '<circle cx="' + cx1 + '" cy="' + cy + '" r="' + r + '" fill="' + INK + '" stroke="none"/>' +
      '<circle cx="' + cx2 + '" cy="' + cy + '" r="' + r + '" fill="' + INK + '" stroke="none"/>';
  }

  var SPRITES = {

    /* ---------- Karakter ---------- */
    mino: function (state) {
      var mouth = '<path d="M40 66 q10 9 20 0" />';
      var brow = '';
      if (state === 'happy') { mouth = '<path d="M38 62 q12 14 24 0" fill="#fff"/>'; }
      if (state === 'confused') { mouth = '<path d="M40 70 q10 -8 20 0" />'; brow = '<path d="M32 40 l10 -4"/><path d="M68 40 l-10 -4"/>'; }
      if (state === 'hint') { mouth = '<path d="M42 66 q8 6 16 0" />'; }
      return wrap(
        '<path d="M50 12 c22 0 32 18 32 36 c0 22 -14 38 -32 38 c-18 0 -32 -16 -32 -38 c0 -18 10 -36 32 -36 z" fill="#a78bfa"/>' +
        '<path d="M34 14 l4 -12 l8 10" fill="#c4b5fd"/>' +
        '<circle cx="39" cy="49" r="9" fill="#fff"/><circle cx="61" cy="49" r="9" fill="#fff"/>' +
        '<circle cx="40" cy="50" r="4" fill="' + INK + '" stroke="none"/>' +
        '<circle cx="62" cy="50" r="4" fill="' + INK + '" stroke="none"/>' +
        brow + mouth +
        '<circle cx="26" cy="64" r="5" fill="#f9a8d4" stroke="none" opacity="0.75"/>' +
        '<circle cx="74" cy="64" r="5" fill="#f9a8d4" stroke="none" opacity="0.75"/>'
      );
    },

    /* ---------- Hayvanlar ---------- */
    cat: wrap('<path d="M24 40 l-4 -20 l20 10" fill="#fbbf24"/><path d="M76 40 l4 -20 l-20 10" fill="#fbbf24"/>' +
      '<ellipse cx="50" cy="56" rx="30" ry="26" fill="#fbbf24"/>' + eyes(40, 60, 52) +
      '<path d="M50 62 l-4 4 h8 z" fill="' + INK + '" stroke="none"/><path d="M44 70 q6 6 12 0"/>' +
      '<path d="M18 58 h-12 M18 66 h-12 M82 58 h12 M82 66 h12"/>'),

    rabbit: wrap('<ellipse cx="38" cy="26" rx="8" ry="20" fill="#fce7f3"/><ellipse cx="62" cy="26" rx="8" ry="20" fill="#fce7f3"/>' +
      '<ellipse cx="50" cy="62" rx="26" ry="24" fill="#fff"/>' + eyes(41, 59, 58) +
      '<path d="M50 66 l-3 3 h6 z" fill="#f472b6" stroke="none"/><path d="M46 74 q4 4 8 0"/>'),

    mouse: wrap('<circle cx="30" cy="40" r="11" fill="#cbd5e1"/><circle cx="70" cy="40" r="11" fill="#cbd5e1"/>' +
      '<ellipse cx="50" cy="60" rx="24" ry="20" fill="#e2e8f0"/>' + eyes(43, 57, 56) +
      '<circle cx="50" cy="66" r="3" fill="#f472b6" stroke="none"/><path d="M74 70 q16 4 12 18"/>'),

    dog: wrap('<ellipse cx="26" cy="44" rx="9" ry="18" fill="#d6a06a"/><ellipse cx="74" cy="44" rx="9" ry="18" fill="#d6a06a"/>' +
      '<ellipse cx="50" cy="58" rx="27" ry="24" fill="#f0c191"/>' + eyes(41, 59, 52) +
      '<ellipse cx="50" cy="68" rx="5" ry="4" fill="' + INK + '" stroke="none"/><path d="M50 72 v6 M44 78 q6 5 12 0"/>'),

    bird: wrap('<ellipse cx="46" cy="56" rx="26" ry="22" fill="#7dd3fc"/>' +
      '<path d="M40 50 q18 8 0 20" fill="#38bdf8"/>' + eyes(38, 52, 46, 3) +
      '<path d="M22 50 l-12 4 l12 6" fill="#fb923c"/><path d="M70 62 q18 6 18 -10 q-8 12 -18 4" fill="#7dd3fc"/>'),

    fish: wrap('<ellipse cx="46" cy="52" rx="28" ry="18" fill="#fb923c"/>' +
      '<path d="M74 52 l18 -14 v28 z" fill="#fdba74"/>' + eyes(34, 34, 46, 3.4) +
      '<path d="M28 58 q8 6 16 0"/>'),

    elephant: wrap('<ellipse cx="52" cy="52" rx="30" ry="26" fill="#c7d2fe"/>' +
      '<path d="M24 44 q-16 4 -14 22 q2 12 14 8" fill="#a5b4fc"/>' + eyes(44, 64, 46) +
      '<path d="M52 70 q0 18 -14 20 q-8 2 -6 -8" fill="#c7d2fe"/>'),

    /* ---------- Yiyecekler ---------- */
    carrot: wrap('<path d="M40 30 l30 44 q-6 12 -18 12 l-24 -40 z" fill="#fb923c"/>' +
      '<path d="M40 30 q-10 -18 4 -22 q2 12 10 14 q10 -12 18 -4 q-10 6 -8 16 z" fill="#4ade80"/>'),
    cheese: wrap('<path d="M14 66 l40 -30 l34 12 v22 z" fill="#fde047"/>' +
      '<circle cx="42" cy="62" r="5" fill="#facc15"/><circle cx="64" cy="66" r="4" fill="#facc15"/>'),
    bone: wrap('<path d="M28 40 a10 10 0 1 1 8 12 l30 12 a10 10 0 1 1 -6 12 a10 10 0 1 1 -8 -12 l-30 -12 a10 10 0 1 1 6 -12 z" fill="#fff"/>'),
    cookie: wrap('<circle cx="50" cy="54" r="28" fill="#d9a066"/><circle cx="42" cy="44" r="4" fill="#6b4423" stroke="none"/>' +
      '<circle cx="60" cy="52" r="4" fill="#6b4423" stroke="none"/><circle cx="46" cy="64" r="4" fill="#6b4423" stroke="none"/>'),
    cake: wrap('<rect x="20" y="46" width="60" height="34" rx="6" fill="#fbcfe8"/>' +
      '<path d="M20 58 q10 10 20 0 q10 10 20 0 q10 10 20 0" fill="#fff"/>' +
      '<rect x="47" y="24" width="6" height="18" rx="3" fill="#fde047"/><circle cx="50" cy="22" r="5" fill="#fb923c"/>'),
    apple: wrap('<path d="M50 34 q-26 -6 -26 22 q0 26 26 30 q26 -4 26 -30 q0 -28 -26 -22 z" fill="#f87171"/>' +
      '<path d="M50 34 v-12" /><path d="M52 26 q14 -10 18 2 q-14 4 -18 -2 z" fill="#4ade80"/>'),
    lemon: wrap('<ellipse cx="50" cy="54" rx="30" ry="22" fill="#facc15"/><path d="M50 34 v40 M24 54 h52"/>'),

    /* ---------- Kaplar ---------- */
    bowl: wrap('<path d="M18 50 h64 q-4 30 -32 30 q-28 0 -32 -30 z" fill="#93c5fd"/><path d="M14 50 h72"/>'),
    glass: wrap('<path d="M30 26 h40 l-5 56 h-30 z" fill="rgba(186,230,253,0.45)"/>'),
    cup: wrap('<path d="M28 40 h44 l-5 38 h-34 z" fill="#fca5a5"/><path d="M72 48 q14 2 12 14 q-2 10 -14 8"/>'),
    aquarium: wrap('<rect x="16" y="26" width="68" height="56" rx="8" fill="rgba(147,197,253,0.25)"/>' +
      '<path d="M30 78 q6 -8 12 0 q6 -8 12 0 q6 -8 12 0" stroke-width="3"/>'),
    teapot: wrap('<path d="M26 46 h48 q4 30 -24 32 q-28 -2 -24 -32 z" fill="#fcd34d"/><path d="M22 46 h56"/>' +
      '<path d="M74 52 q16 4 12 18" /><rect x="44" y="30" width="12" height="10" rx="4" fill="#fcd34d"/>'),

    /* ---------- Gökyüzü ---------- */
    sun: wrap('<circle cx="50" cy="50" r="24" fill="#fde047"/>' +
      '<path d="M50 14 v-8 M50 86 v8 M14 50 h-8 M86 50 h8 M24 24 l-6 -6 M76 24 l6 -6 M24 76 l-6 6 M76 76 l6 6"/>' +
      eyes(42, 58, 48, 2.6) + '<path d="M44 58 q6 6 12 0"/>'),
    moon: wrap('<path d="M64 18 a34 34 0 1 0 18 52 a30 30 0 0 1 -18 -52 z" fill="#fef08a"/>' +
      '<circle cx="46" cy="44" r="2.6" fill="' + INK + '" stroke="none"/><path d="M40 58 q8 6 14 -2"/>'),
    star: wrap('<path d="M50 16 l10 22 l24 3 l-18 17 l5 24 l-21 -12 l-21 12 l5 -24 l-18 -17 l24 -3 z" fill="#fcd34d"/>'),
    cloud: wrap('<path d="M28 66 a16 16 0 0 1 2 -32 a20 20 0 0 1 38 -2 a15 15 0 0 1 4 34 z" fill="#e0f2fe"/>'),
    raincloud: wrap('<path d="M28 56 a16 16 0 0 1 2 -32 a20 20 0 0 1 38 -2 a15 15 0 0 1 4 34 z" fill="#cbd5e1"/>' +
      '<path d="M36 64 l-4 12 M52 64 l-4 14 M68 64 l-4 12" stroke="#60a5fa"/>'),
    snowflake: wrap('<path d="M50 16 v68 M20 33 l60 34 M80 33 l-60 34 M50 30 l-8 -8 M50 30 l8 -8 M50 70 l-8 8 M50 70 l8 8"/>'),
    ice: wrap('<path d="M26 30 h48 l6 46 h-60 z" fill="rgba(191,219,254,0.7)"/><path d="M38 38 l10 30 M62 40 l-8 26" stroke-width="3"/>'),
    waterdrop: wrap('<path d="M50 18 q24 30 24 42 a24 24 0 0 1 -48 0 q0 -12 24 -42 z" fill="#7dd3fc"/>'),
    flame: wrap('<path d="M50 14 q22 24 16 40 q-4 12 -16 12 q-12 0 -16 -12 q-6 -16 16 -40 z" fill="#fb923c"/>' +
      '<path d="M50 40 q10 12 6 20 q-2 6 -6 6 q-4 0 -6 -6 q-4 -8 6 -20 z" fill="#fde047"/>'),

    /* ---------- Nesneler ---------- */
    candle: wrap('<rect x="38" y="34" width="24" height="50" rx="6" fill="#fef3c7"/><path d="M50 34 v-8"/>'),
    candleLit: wrap('<rect x="38" y="44" width="24" height="40" rx="6" fill="#fef3c7"/>' +
      '<path d="M50 44 q10 -12 6 -20 q-2 -6 -6 -6 q-4 0 -6 6 q-4 8 6 20 z" fill="#fb923c"/>'),
    lamp: wrap('<path d="M28 44 l22 -24 l22 24 z" fill="#cbd5e1"/><path d="M50 44 v26"/>' +
      '<circle cx="50" cy="76" r="10" fill="#f1f5f9"/>'),
    lampOn: wrap('<path d="M28 44 l22 -24 l22 24 z" fill="#cbd5e1"/><path d="M50 44 v26"/>' +
      '<circle cx="50" cy="76" r="12" fill="#fde047"/><path d="M28 76 h-8 M80 76 h8 M50 94 v6"/>'),
    bulb: wrap('<path d="M50 16 a20 20 0 0 1 12 36 v8 h-24 v-8 a20 20 0 0 1 12 -36 z" fill="#fde047"/>' +
      '<path d="M40 68 h20 M42 76 h16"/>'),
    door: wrap('<rect x="24" y="14" width="52" height="72" rx="6" fill="#d6a06a"/><circle cx="64" cy="52" r="4" fill="' + INK + '" stroke="none"/>'),
    doorOpen: wrap('<rect x="24" y="14" width="52" height="72" rx="6" fill="#1f2937"/>' +
      '<path d="M24 14 l24 10 v52 l-24 10 z" fill="#d6a06a"/>'),
    key: wrap('<circle cx="30" cy="52" r="14" fill="#fbbf24"/><circle cx="30" cy="52" r="5" fill="#fff"/>' +
      '<path d="M44 52 h34 M70 52 v12 M60 52 v10" />'),
    lock: wrap('<rect x="26" y="46" width="48" height="38" rx="8" fill="#94a3b8"/>' +
      '<path d="M38 46 v-10 a12 12 0 0 1 24 0 v10"/><circle cx="50" cy="64" r="5" fill="' + INK + '" stroke="none"/>'),
    mat: wrap('<rect x="16" y="52" width="68" height="26" rx="6" fill="#a3a3a3"/>' +
      '<path d="M30 52 v26 M44 52 v26 M58 52 v26 M72 52 v26" stroke-width="3"/>'),
    box: wrap('<rect x="20" y="40" width="60" height="44" rx="5" fill="#d6a06a"/><path d="M20 54 h60 M50 40 v44"/>'),
    tree: wrap('<rect x="44" y="58" width="12" height="28" rx="4" fill="#a16207"/>' +
      '<circle cx="50" cy="40" r="26" fill="#4ade80"/><circle cx="32" cy="50" r="14" fill="#22c55e"/><circle cx="68" cy="50" r="14" fill="#22c55e"/>'),
    flower: wrap('<path d="M50 58 v26"/><circle cx="50" cy="36" r="10" fill="#fde047"/>' +
      '<circle cx="34" cy="30" r="9" fill="#f9a8d4"/><circle cx="66" cy="30" r="9" fill="#f9a8d4"/>' +
      '<circle cx="36" cy="48" r="9" fill="#f9a8d4"/><circle cx="64" cy="48" r="9" fill="#f9a8d4"/>'),
    balloon: wrap('<ellipse cx="50" cy="42" rx="24" ry="28" fill="#f87171"/><path d="M50 70 v18 q10 6 0 10"/>'),
    cage: wrap('<path d="M22 78 h56 M22 78 v-40 a28 28 0 0 1 56 0 v40" fill="rgba(255,255,255,0.35)"/>' +
      '<path d="M36 78 v-44 M50 78 v-50 M64 78 v-44" stroke-width="3"/>'),
    cageOpen: wrap('<path d="M22 78 h56 M22 78 v-40 a28 28 0 0 1 56 0 v40" fill="rgba(255,255,255,0.35)"/>' +
      '<path d="M36 78 v-44 M64 78 v-44" stroke-width="3"/><path d="M50 28 l24 -12" stroke-width="3"/>'),
    latch: wrap('<rect x="34" y="40" width="32" height="20" rx="8" fill="#fbbf24"/><path d="M50 40 v-12"/>'),
    curtain: wrap('<path d="M18 16 h64 v68 h-64 z" fill="#c084fc"/><path d="M32 16 v68 M50 16 v68 M68 16 v68" stroke-width="3"/>'),
    ball: wrap('<circle cx="50" cy="52" r="26" fill="#fff"/><path d="M50 26 v52 M24 52 h52" stroke-width="3"/>'),
    goal: wrap('<path d="M14 78 v-46 h72 v46" fill="rgba(255,255,255,0.35)"/><path d="M30 32 v46 M50 32 v46 M70 32 v46 M14 48 h72 M14 62 h72" stroke-width="2.5"/>'),
    battery: wrap('<rect x="18" y="38" width="58" height="30" rx="6" fill="#86efac"/><rect x="76" y="46" width="8" height="14" rx="3" fill="#86efac"/>' +
      '<path d="M30 46 v14 M23 53 h14 M62 53 h14" stroke-width="3"/>'),
    car: wrap('<path d="M16 66 v-12 l14 -16 h34 l12 16 h8 v12 z" fill="#60a5fa"/>' +
      '<circle cx="32" cy="72" r="9" fill="' + INK + '"/><circle cx="70" cy="72" r="9" fill="' + INK + '"/>'),
    clock: wrap('<circle cx="50" cy="54" r="28" fill="#fff"/><path d="M50 54 v-14 M50 54 l12 8"/>' +
      '<path d="M28 28 l-8 -8 M72 28 l8 -8" stroke-width="3"/>'),
    gift: wrap('<rect x="20" y="44" width="60" height="38" rx="5" fill="#f472b6"/><path d="M50 44 v38 M20 58 h60"/>' +
      '<path d="M50 44 q-16 -18 -2 -18 q10 0 2 18 q16 -18 2 -18 q-10 0 -2 18" fill="#fbbf24"/>'),
    stone: wrap('<path d="M22 74 q-8 -22 10 -32 q22 -14 38 0 q16 12 6 32 z" fill="#cbd5e1"/>'),
    picture: wrap('<rect x="20" y="24" width="60" height="52" rx="4" fill="#fff"/>' +
      '<path d="M26 68 l16 -20 l12 12 l10 -14 l10 22 z" fill="#86efac"/><circle cx="64" cy="38" r="6" fill="#fde047"/>'),
    speakerOn: wrap('<path d="M24 40 h14 l16 -14 v52 l-16 -14 h-14 z" fill="#a5b4fc"/><path d="M62 38 q10 12 0 26 M72 30 q16 22 0 42"/>'),
    speakerOff: wrap('<path d="M24 40 h14 l16 -14 v52 l-16 -14 h-14 z" fill="#cbd5e1"/><path d="M64 40 l20 20 M84 40 l-20 20"/>'),
    triLeft: wrap('<path d="M18 82 v-58 l56 58 z" fill="#f9a8d4"/>'),
    triRight: wrap('<path d="M82 82 v-58 l-56 58 z" fill="#c4b5fd"/>'),
    triFull: wrap('<path d="M50 16 l38 66 h-76 z" fill="#f9a8d4"/>'),
    hole: wrap('<ellipse cx="50" cy="60" rx="26" ry="12" fill="#1f2937"/>'),
    plant: wrap('<path d="M50 82 v-30" /><path d="M50 56 q-22 -4 -22 -22 q22 2 22 22 z" fill="#4ade80"/>' +
      '<path d="M50 62 q22 -4 22 -22 q-22 2 -22 22 z" fill="#22c55e"/>' +
      '<path d="M32 82 h36 l-4 -14 h-28 z" fill="#fb923c"/>'),
    seed: wrap('<ellipse cx="50" cy="56" rx="10" ry="14" fill="#a16207"/>'),
    ghostSpot: wrap('<circle cx="50" cy="50" r="20" fill="rgba(0,0,0,0.06)" stroke="none"/>'),
    heart: wrap('<path d="M50 82 q-34 -20 -34 -40 a17 17 0 0 1 34 -8 a17 17 0 0 1 34 8 q0 20 -34 40 z" fill="#fb7185"/>')
  };

  var Assets = {
    INK: INK,
    has: function (name) { return Object.prototype.hasOwnProperty.call(SPRITES, name); },
    /** Sprite'ın SVG kodunu döndürür. Bilinmeyen isimlerde nötr bir kutu döner. */
    get: function (name, state) {
      var s = SPRITES[name];
      if (typeof s === 'function') return s(state);
      if (typeof s === 'string') return s;
      return wrap('<rect x="20" y="20" width="60" height="60" rx="10" fill="#e9d5ff"/>');
    },
    list: function () { return Object.keys(SPRITES); }
  };

  global.Assets = Assets;
})(window);
