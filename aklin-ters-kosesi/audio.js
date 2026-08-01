/* =========================================================
   audio.js - Aklın Ters Köşesi
   Web Audio API ile tamamen procedural ses üretimi.
   Hiçbir ses dosyası gerekmez, çevrimdışı çalışır.
   ========================================================= */
(function (global) {
  'use strict';

  var ctx = null;
  var master = null;
  var musicGain = null;
  var musicTimer = null;

  var settings = { sound: true, music: false, vibrate: true };

  function ensure() {
    if (ctx) return ctx;
    var AC = global.AudioContext || global.webkitAudioContext;
    if (!AC) return null;
    try {
      ctx = new AC();
      master = ctx.createGain();
      master.gain.value = 0.35;
      master.connect(ctx.destination);
      musicGain = ctx.createGain();
      musicGain.gain.value = 0.0;
      musicGain.connect(master);
    } catch (e) { ctx = null; }
    return ctx;
  }

  function tone(opts) {
    if (!settings.sound) return;
    var c = ensure();
    if (!c) return;
    if (c.state === 'suspended') { c.resume().catch(function () {}); }
    var t0 = c.currentTime + (opts.delay || 0);
    var osc = c.createOscillator();
    var g = c.createGain();
    osc.type = opts.type || 'sine';
    osc.frequency.setValueAtTime(opts.from || 440, t0);
    if (opts.to) osc.frequency.exponentialRampToValueAtTime(Math.max(20, opts.to), t0 + (opts.dur || 0.15));
    var peak = opts.gain == null ? 0.25 : opts.gain;
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(peak, t0 + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + (opts.dur || 0.15));
    osc.connect(g);
    g.connect(opts.bus || master);
    osc.start(t0);
    osc.stop(t0 + (opts.dur || 0.15) + 0.05);
  }

  function noise(dur, gain) {
    if (!settings.sound) return;
    var c = ensure();
    if (!c) return;
    var len = Math.floor(c.sampleRate * dur);
    var buf = c.createBuffer(1, len, c.sampleRate);
    var d = buf.getChannelData(0);
    for (var i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len);
    var src = c.createBufferSource();
    src.buffer = buf;
    var g = c.createGain();
    g.gain.value = gain == null ? 0.12 : gain;
    var f = c.createBiquadFilter();
    f.type = 'bandpass';
    f.frequency.value = 1200;
    src.connect(f); f.connect(g); g.connect(master);
    src.start();
  }

  function vibrate(pattern) {
    if (!settings.vibrate) return;
    if (global.navigator && typeof global.navigator.vibrate === 'function') {
      try { global.navigator.vibrate(pattern); } catch (e) {}
    }
  }

  var SOUNDS = {
    tap: function () { tone({ type: 'triangle', from: 660, to: 880, dur: 0.07, gain: 0.16 }); vibrate(5); },
    button: function () { tone({ type: 'square', from: 420, to: 620, dur: 0.08, gain: 0.12 }); vibrate(5); },
    dragStart: function () { tone({ type: 'sine', from: 300, to: 460, dur: 0.09, gain: 0.13 }); vibrate(4); },
    drop: function () { tone({ type: 'sine', from: 460, to: 260, dur: 0.11, gain: 0.14 }); },
    correct: function () {
      [523, 659, 784, 1046].forEach(function (f, i) {
        tone({ type: 'triangle', from: f, dur: 0.22, gain: 0.2, delay: i * 0.085 });
      });
      vibrate([18, 60, 24]);
    },
    wrong: function () {
      tone({ type: 'sawtooth', from: 220, to: 150, dur: 0.16, gain: 0.11 });
      vibrate(20);
    },
    hint: function () { tone({ type: 'sine', from: 880, to: 1320, dur: 0.2, gain: 0.16 }); },
    bulb: function () {
      tone({ type: 'triangle', from: 990, dur: 0.12, gain: 0.18 });
      tone({ type: 'triangle', from: 1320, dur: 0.18, gain: 0.16, delay: 0.1 });
    },
    levelComplete: function () {
      [523, 587, 659, 784, 1046].forEach(function (f, i) {
        tone({ type: 'triangle', from: f, dur: 0.3, gain: 0.2, delay: i * 0.1 });
      });
      noise(0.35, 0.07);
      vibrate([15, 50, 15, 50, 30]);
    },
    unlock: function () { tone({ type: 'square', from: 300, to: 900, dur: 0.25, gain: 0.14 }); },
    shake: function () { noise(0.25, 0.1); }
  };

  /* Basit, döngüsel ve rahatsız etmeyen arka plan melodisi */
  var MELODY = [523, 587, 659, 587, 698, 659, 587, 523];
  var mIndex = 0;

  function musicStep() {
    if (!settings.music) return;
    var c = ensure();
    if (!c) return;
    tone({ type: 'sine', from: MELODY[mIndex % MELODY.length], dur: 0.55, gain: 0.05, bus: musicGain });
    if (mIndex % 4 === 0) tone({ type: 'sine', from: MELODY[mIndex % MELODY.length] / 2, dur: 0.8, gain: 0.04, bus: musicGain });
    mIndex++;
  }

  var AudioManager = {
    init: function (s) {
      if (s) settings = { sound: !!s.sound, music: !!s.music, vibrate: !!s.vibrate };
    },
    /** İlk kullanıcı etkileşiminde çağrılır (autoplay politikası). */
    unlockContext: function () {
      var c = ensure();
      if (c && c.state === 'suspended') c.resume().catch(function () {});
    },
    set: function (key, value) {
      settings[key] = !!value;
      if (key === 'music') {
        if (value) this.startMusic(); else this.stopMusic();
      }
      if (key === 'sound' && !value && musicTimer) this.stopMusic();
    },
    get: function (key) { return settings[key]; },
    play: function (name) {
      var fn = SOUNDS[name];
      if (fn) { try { fn(); } catch (e) {} }
    },
    vibrate: vibrate,
    startMusic: function () {
      if (musicTimer) return;
      ensure();
      if (musicGain) musicGain.gain.value = 1;
      musicTimer = setInterval(musicStep, 620);
    },
    stopMusic: function () {
      if (musicTimer) { clearInterval(musicTimer); musicTimer = null; }
      if (musicGain) musicGain.gain.value = 0;
    }
  };

  global.AudioManager = AudioManager;
})(window);
