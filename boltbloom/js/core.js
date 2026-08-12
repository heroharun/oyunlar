/* ============================================================
   Bolt Bloom — core.js
   CONFIG, palet, yardimcilar, kayit sistemi, ses sistemi
   ============================================================ */
(function () {
  'use strict';
  var BB = (window.BB = window.BB || {});

  /* ---------------- CONFIG ---------------- */
  var CONFIG = {
    version: '1.0.0',
    storageKey: 'boltbloom.save.v1',

    boxCapacity: 3,
    activeBoxesEarly: 2,      // bolum 1-3
    activeBoxesLevel: 4,      // bolum >= 4 -> 3 kutu
    activeBoxesMax: 4,        // booster ile
    reserveDefault: 5,

    hintIdleMs: 9000,
    zoom: { min: 0.8, max: 1.8, step: 0.15 },
    rotateMaxDeg: 14,
    tiltMaxDeg: 7,
    parallaxPerLayer: 5,

    anim: {
      spin: 430,
      spinBig: 900,
      fly: 470,
      flyReserve: 400,
      pieceRelease: 120,
      pieceFall: 760,
      boxClose: 520,
      autoTransferStagger: 130
    },

    score: {
      base: 1000,
      perScrew: 25,
      emptyReserveSlot: 120,
      timeBonusCap: 600,
      timeGraceSec: 60,
      timePenaltyPerSec: 5,
      noBoosterBonus: 300,
      perfectBonus: 400,
      goldScrew: 150,
      star2: 0.62,
      star3: 0.86
    },

    coins: { levelClear: 40, perStar: 15, goldScrew: 25, perfect: 30, firstClear: 30 },

    boosterPrices: { hammer: 120, undo: 80, brush: 150, slot: 100, magnet: 180, xray: 90, swap: 110 },

    maxUndo: 12,
    particleCap: 170,
    lowFpsThreshold: 38
  };

  /* ---------------- Renkler + semboller ---------------- */
  var COLORS = {
    orange: { name: 'Turuncu', hex: '#FF8A3D', dark: '#C75E1C', light: '#FFC08A', sym: 'plus' },
    blue: { name: 'Mavi', hex: '#3D8BFF', dark: '#1D57B8', light: '#9CC4FF', sym: 'star' },
    green: { name: 'Yeşil', hex: '#38C25C', dark: '#1B8438', light: '#9BE7AF', sym: 'triangle' },
    pink: { name: 'Pembe', hex: '#FF6FB5', dark: '#C2337A', light: '#FFB4D8', sym: 'heart' },
    yellow: { name: 'Sarı', hex: '#FFC93D', dark: '#C08A00', light: '#FFE49C', sym: 'circle' },
    purple: { name: 'Mor', hex: '#9B5DE5', dark: '#65309F', light: '#CFAAF5', sym: 'square' },
    red: { name: 'Kırmızı', hex: '#F0483E', dark: '#A61E17', light: '#FFA49E', sym: 'diamond' },
    teal: { name: 'Turkuaz', hex: '#22C3C3', dark: '#0D7F7F', light: '#9AE9E9', sym: 'bar' }
  };

  // Renk korlugu icin daha ayrisan palet
  var COLORS_CB = {
    orange: { hex: '#E36C00', dark: '#9E4A00', light: '#FFB870' },
    blue: { hex: '#1364D6', dark: '#0B3F8C', light: '#8FBBF2' },
    green: { hex: '#0E9F6E', dark: '#066846', light: '#84DCC0' },
    pink: { hex: '#D6006E', dark: '#8C0048', light: '#FF97C7' },
    yellow: { hex: '#F2D024', dark: '#A88E00', light: '#FFEE9B' },
    purple: { hex: '#6A2DBD', dark: '#431677', light: '#BFA0EC' },
    red: { hex: '#B00020', dark: '#73000F', light: '#FF8E96' },
    teal: { hex: '#00A6B8', dark: '#006975', light: '#8DE3EC' }
  };

  var COLOR_KEYS = Object.keys(COLORS);

  /* ---------------- Tema bolgeleri ---------------- */
  var THEMES = {
    workshop: {
      name: 'Oyuncak Atölyesi',
      bgA: '#F3E4CE', bgB: '#FCF7EE', glow: '#FFE9C2',
      tones: ['#F0A24C', '#E0763C', '#89B6E8', '#D6DEEC', '#5C6B87']
    },
    candy: {
      name: 'Şeker Fabrikası',
      bgA: '#FBDCEB', bgB: '#FFF3F8', glow: '#FFD9EA',
      tones: ['#FF9CC4', '#F26FA5', '#9BE0D2', '#FFE6B0', '#7A5C86']
    },
    harbor: {
      name: 'Denizaltı Limanı',
      bgA: '#CDE7EE', bgB: '#EFFAFC', glow: '#BFEAF2',
      tones: ['#57BFD1', '#2E8FA6', '#F0C86B', '#DCE9EC', '#3F5C69']
    },
    roboLab: {
      name: 'Robot Laboratuvarı',
      bgA: '#DCD9F2', bgB: '#F5F3FF', glow: '#D6CEFA',
      tones: ['#8F86D8', '#5F55B0', '#7ED9C4', '#E4E1F5', '#3A3560']
    },
    hangar: {
      name: 'Uzay Hangarı',
      bgA: '#D6DEF0', bgB: '#F1F5FF', glow: '#C4D4F5',
      tones: ['#7C92C4', '#4E639B', '#F2A65A', '#E6ECF8', '#2E3A5C']
    }
  };

  var RARITY = {
    common: { name: 'Yaygın', hex: '#8FA0B8' },
    rare: { name: 'Nadir', hex: '#3D8BFF' },
    epic: { name: 'Destansı', hex: '#9B5DE5' },
    legendary: { name: 'Efsanevi', hex: '#FFA51F' }
  };

  /* ---------------- Yardimcilar ---------------- */
  var util = {
    clamp: function (v, a, b) { return v < a ? a : (v > b ? b : v); },
    lerp: function (a, b, t) { return a + (b - a) * t; },
    easeOut: function (t) { return 1 - Math.pow(1 - t, 3); },
    easeIn: function (t) { return t * t * t; },
    easeInOut: function (t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; },
    backOut: function (t) { var c = 1.9; return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2); },
    // deterministik RNG (mulberry32)
    rng: function (seed) {
      var a = seed >>> 0;
      return function () {
        a |= 0; a = (a + 0x6D2B79F5) | 0;
        var t = Math.imul(a ^ (a >>> 15), 1 | a);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
      };
    },
    shuffle: function (arr, rnd) {
      for (var i = arr.length - 1; i > 0; i--) {
        var j = Math.floor(rnd() * (i + 1));
        var t = arr[i]; arr[i] = arr[j]; arr[j] = t;
      }
      return arr;
    },
    fmtTime: function (sec) {
      sec = Math.max(0, Math.floor(sec));
      var m = Math.floor(sec / 60), s = sec % 60;
      return m + ':' + (s < 10 ? '0' : '') + s;
    },
    el: function (sel, root) { return (root || document).querySelector(sel); },
    els: function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); },
    now: function () { return (window.performance && performance.now) ? performance.now() : Date.now(); }
  };

  /* ---------------- Sembol yollari (SVG path, 0,0 merkezli) ---------------- */
  function polyPath(pts) {
    var d = '';
    for (var i = 0; i < pts.length; i++) d += (i ? 'L' : 'M') + pts[i][0].toFixed(2) + ' ' + pts[i][1].toFixed(2);
    return d + 'Z';
  }
  function starPts(r1, r2, n, rot) {
    var pts = [];
    for (var i = 0; i < n * 2; i++) {
      var a = rot + (Math.PI * i) / n;
      var r = i % 2 === 0 ? r1 : r2;
      pts.push([Math.cos(a) * r, Math.sin(a) * r]);
    }
    return pts;
  }
  var SYMBOLS = {
    plus: function (s) {
      var a = s * 0.34, b = s;
      return polyPath([[-a, -b], [a, -b], [a, -a], [b, -a], [b, a], [a, a], [a, b], [-a, b], [-a, a], [-b, a], [-b, -a], [-a, -a]]);
    },
    star: function (s) { return polyPath(starPts(s, s * 0.46, 5, -Math.PI / 2)); },
    triangle: function (s) { return polyPath([[0, -s], [s * 0.92, s * 0.72], [-s * 0.92, s * 0.72]]); },
    heart: function (s) {
      var k = s;
      return 'M0 ' + (k * 0.95).toFixed(2) + 'C' + (-k * 1.15) + ' ' + (k * 0.1) + ' ' + (-k * 0.72) + ' ' + (-k * 1.05) +
        ' 0 ' + (-k * 0.32) + 'C' + (k * 0.72) + ' ' + (-k * 1.05) + ' ' + (k * 1.15) + ' ' + (k * 0.1) + ' 0 ' + (k * 0.95) + 'Z';
    },
    circle: function (s) {
      return 'M' + (-s) + ' 0a' + s + ' ' + s + ' 0 1 0 ' + (s * 2) + ' 0a' + s + ' ' + s + ' 0 1 0 ' + (-s * 2) + ' 0Z';
    },
    square: function (s) { var a = s * 0.82; return polyPath([[-a, -a], [a, -a], [a, a], [-a, a]]); },
    diamond: function (s) { return polyPath([[0, -s], [s * 0.82, 0], [0, s], [-s * 0.82, 0]]); },
    bar: function (s) { var a = s * 0.95, b = s * 0.34; return polyPath([[-a, -b], [a, -b], [a, b], [-a, b]]); }
  };

  BB.symbolPath = function (symKey, size) {
    var f = SYMBOLS[symKey] || SYMBOLS.circle;
    return f(size);
  };
  BB.polyPath = polyPath;

  /* ---------------- Kayit sistemi ---------------- */
  var DEFAULT_SAVE = {
    v: 1,
    unlocked: 1,
    coins: 250,
    stars: {},        // { levelId: 0..3 }
    best: {},         // { levelId: score }
    collection: {},   // { levelId: true }
    boosters: { hammer: 3, undo: 5, brush: 2, slot: 2, magnet: 1, xray: 2, swap: 1 },
    settings: { sfx: true, music: true, vibrate: true, colorblind: false, reducedMotion: false, tutorial: true },
    daily: { last: null, streak: 0 },
    tutorialDone: false
  };

  var SaveManager = {
    data: null,
    load: function () {
      var raw = null;
      try { raw = localStorage.getItem(CONFIG.storageKey); } catch (e) { console.warn('[BoltBloom] localStorage okunamadı:', e); }
      var d = null;
      if (raw) {
        try { d = JSON.parse(raw); } catch (e) { console.warn('[BoltBloom] Bozuk kayıt verisi, sıfırlanıyor.'); d = null; }
      }
      this.data = this.merge(DEFAULT_SAVE, d && typeof d === 'object' ? d : {});
      // basit dogrulama
      if (typeof this.data.unlocked !== 'number' || this.data.unlocked < 1) this.data.unlocked = 1;
      if (typeof this.data.coins !== 'number' || !isFinite(this.data.coins)) this.data.coins = 0;
      return this.data;
    },
    merge: function (def, src) {
      var out = {};
      for (var k in def) {
        if (!Object.prototype.hasOwnProperty.call(def, k)) continue;
        var dv = def[k], sv = src ? src[k] : undefined;
        if (dv && typeof dv === 'object' && !Array.isArray(dv)) {
          out[k] = this.merge(dv, sv && typeof sv === 'object' ? sv : {});
        } else {
          out[k] = (sv === undefined || sv === null) ? dv : sv;
        }
      }
      // def'te olmayan ama src'te olan sayisal alanlari koru (stars/best/collection)
      return out;
    },
    save: function () {
      try { localStorage.setItem(CONFIG.storageKey, JSON.stringify(this.data)); }
      catch (e) { console.warn('[BoltBloom] Kayit yazılamadı:', e); }
    },
    reset: function () {
      try { localStorage.removeItem(CONFIG.storageKey); } catch (e) { }
      this.data = JSON.parse(JSON.stringify(DEFAULT_SAVE));
      this.save();
    },
    addCoins: function (n) { this.data.coins = Math.max(0, this.data.coins + n); this.save(); },
    spendCoins: function (n) {
      if (this.data.coins < n) return false;
      this.data.coins -= n; this.save(); return true;
    }
  };

  /* ---------------- Ses (Web Audio, procedural) ---------------- */
  var AudioManager = {
    ctx: null,
    master: null,
    musicGain: null,
    musicTimer: null,
    unlocked: false,
    init: function () {
      if (this.ctx) return;
      var AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      try {
        this.ctx = new AC();
        this.master = this.ctx.createGain();
        this.master.gain.value = 0.45;
        this.master.connect(this.ctx.destination);
        this.musicGain = this.ctx.createGain();
        this.musicGain.gain.value = 0.0;
        this.musicGain.connect(this.master);
      } catch (e) { console.warn('[BoltBloom] Ses başlatılamadı:', e); }
    },
    unlock: function () {
      this.init();
      if (!this.ctx) return;
      if (this.ctx.state === 'suspended') this.ctx.resume();
      this.unlocked = true;
      if (SaveManager.data && SaveManager.data.settings.music) this.startMusic();
    },
    on: function () { return this.unlocked && this.ctx && SaveManager.data && SaveManager.data.settings.sfx; },
    tone: function (opt) {
      if (!this.on()) return;
      var c = this.ctx, t = c.currentTime;
      var o = c.createOscillator(), g = c.createGain();
      o.type = opt.type || 'sine';
      o.frequency.setValueAtTime(opt.f0, t);
      if (opt.f1 && opt.f1 !== opt.f0) o.frequency.exponentialRampToValueAtTime(Math.max(20, opt.f1), t + (opt.dur || 0.12));
      var vol = (opt.vol == null ? 0.3 : opt.vol);
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(vol, t + 0.008);
      g.gain.exponentialRampToValueAtTime(0.0001, t + (opt.dur || 0.12));
      o.connect(g); g.connect(this.master);
      o.start(t); o.stop(t + (opt.dur || 0.12) + 0.02);
    },
    noise: function (dur, vol, freq, q) {
      if (!this.on()) return;
      var c = this.ctx, t = c.currentTime;
      var len = Math.floor(c.sampleRate * dur);
      var buf = c.createBuffer(1, len, c.sampleRate);
      var d = buf.getChannelData(0);
      for (var i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len);
      var src = c.createBufferSource(); src.buffer = buf;
      var f = c.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = freq || 900; f.Q.value = q || 1.2;
      var g = c.createGain(); g.gain.value = vol == null ? 0.25 : vol;
      src.connect(f); f.connect(g); g.connect(this.master);
      src.start(t);
    },
    play: function (name) {
      if (!this.on()) return;
      switch (name) {
        case 'tap': this.tone({ type: 'triangle', f0: 620, f1: 820, dur: 0.07, vol: 0.22 }); break;
        case 'spin': this.noise(0.22, 0.16, 1800, 3); this.tone({ type: 'sawtooth', f0: 210, f1: 330, dur: 0.22, vol: 0.1 }); break;
        case 'pop': this.tone({ type: 'sine', f0: 880, f1: 1320, dur: 0.1, vol: 0.26 }); break;
        case 'slot': this.tone({ type: 'square', f0: 420, f1: 300, dur: 0.09, vol: 0.15 }); break;
        case 'boxfill':
          this.tone({ type: 'triangle', f0: 523, dur: 0.1, vol: 0.24 });
          var self = this;
          setTimeout(function () { self.tone({ type: 'triangle', f0: 659, dur: 0.1, vol: 0.24 }); }, 90);
          setTimeout(function () { self.tone({ type: 'triangle', f0: 784, dur: 0.16, vol: 0.26 }); }, 180);
          break;
        case 'drop': this.noise(0.3, 0.28, 260, 0.8); this.tone({ type: 'sine', f0: 150, f1: 60, dur: 0.28, vol: 0.2 }); break;
        case 'coin': this.tone({ type: 'square', f0: 1180, f1: 1600, dur: 0.09, vol: 0.14 }); break;
        case 'warn': this.tone({ type: 'sawtooth', f0: 260, f1: 180, dur: 0.18, vol: 0.2 }); break;
        case 'ice': this.noise(0.25, 0.3, 3200, 2.5); break;
        case 'rust': this.noise(0.18, 0.3, 700, 1.5); break;
        case 'booster': this.tone({ type: 'triangle', f0: 400, f1: 900, dur: 0.2, vol: 0.22 }); break;
        case 'win':
          var s = this, notes = [523, 659, 784, 1046];
          notes.forEach(function (n, i) { setTimeout(function () { s.tone({ type: 'triangle', f0: n, dur: 0.24, vol: 0.26 }); }, i * 120); });
          break;
        case 'lose':
          var s2 = this, n2 = [440, 370, 294, 220];
          n2.forEach(function (n, i) { setTimeout(function () { s2.tone({ type: 'sawtooth', f0: n, dur: 0.28, vol: 0.2 }); }, i * 150); });
          break;
      }
    },
    startMusic: function () {
      if (!this.ctx || this.musicTimer) return;
      var self = this;
      this.musicGain.gain.setTargetAtTime(0.10, this.ctx.currentTime, 1.2);
      var scale = [261.6, 293.7, 329.6, 392.0, 440.0, 523.3];
      var step = 0;
      this.musicTimer = setInterval(function () {
        if (!self.ctx || !SaveManager.data.settings.music) return;
        var c = self.ctx, t = c.currentTime;
        var f = scale[(step * 3 + Math.floor(Math.random() * 2)) % scale.length] / 2;
        var o = c.createOscillator(), g = c.createGain();
        o.type = 'sine'; o.frequency.value = f;
        g.gain.setValueAtTime(0.0001, t);
        g.gain.exponentialRampToValueAtTime(0.5, t + 0.4);
        g.gain.exponentialRampToValueAtTime(0.0001, t + 1.8);
        o.connect(g); g.connect(self.musicGain);
        o.start(t); o.stop(t + 2);
        step++;
      }, 1500);
    },
    stopMusic: function () {
      if (this.musicTimer) { clearInterval(this.musicTimer); this.musicTimer = null; }
      if (this.musicGain && this.ctx) this.musicGain.gain.setTargetAtTime(0.0001, this.ctx.currentTime, 0.4);
    },
    setMusic: function (on) { if (on) this.startMusic(); else this.stopMusic(); }
  };

  /* ---------------- Titresim ---------------- */
  var Haptics = {
    can: function () {
      return !!navigator.vibrate && SaveManager.data && SaveManager.data.settings.vibrate;
    },
    buzz: function (pattern) { if (this.can()) { try { navigator.vibrate(pattern); } catch (e) { } } },
    light: function () { this.buzz(10); },
    double: function () { this.buzz([18, 50, 18]); },
    heavy: function () { this.buzz([60, 60, 120]); }
  };

  /* ---------------- Disari ac ---------------- */
  BB.CONFIG = CONFIG;
  BB.COLORS = COLORS;
  BB.COLORS_CB = COLORS_CB;
  BB.COLOR_KEYS = COLOR_KEYS;
  BB.THEMES = THEMES;
  BB.RARITY = RARITY;
  BB.util = util;
  BB.Save = SaveManager;
  BB.Audio = AudioManager;
  BB.Haptics = Haptics;

  BB.colorOf = function (key) {
    var cb = SaveManager.data && SaveManager.data.settings.colorblind;
    var base = COLORS[key] || COLORS.orange;
    if (!cb) return base;
    var alt = COLORS_CB[key] || {};
    return { name: base.name, sym: base.sym, hex: alt.hex || base.hex, dark: alt.dark || base.dark, light: alt.light || base.light };
  };
})();
