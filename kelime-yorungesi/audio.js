/* =========================================================
   Kelime Yörüngesi — audio.js
   Tüm sesler WebAudio ile anlık üretilir. Harici ses dosyası yok.
   ========================================================= */

const KY_AUDIO = (function () {
  let ctx = null;
  let muted = false;
  try { muted = localStorage.getItem('ky_mute') === '1'; } catch (e) { }

  function ac() {
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
    }
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }

  function tone(freq, start, dur, type, vol, slideTo) {
    const c = ac();
    if (!c) return;
    const t0 = c.currentTime + start;
    const osc = c.createOscillator();
    const g = c.createGain();
    osc.type = type || 'sine';
    osc.frequency.setValueAtTime(freq, t0);
    if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, t0 + dur);
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(vol, t0 + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(g); g.connect(c.destination);
    osc.start(t0); osc.stop(t0 + dur + 0.03);
  }

  function noise(start, dur, vol) {
    const c = ac();
    if (!c) return;
    const len = Math.floor(c.sampleRate * dur);
    const buf = c.createBuffer(1, len, c.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len);
    const src = c.createBufferSource();
    const g = c.createGain();
    const f = c.createBiquadFilter();
    f.type = 'bandpass'; f.frequency.value = 1200;
    g.gain.value = vol;
    src.buffer = buf; src.connect(f); f.connect(g); g.connect(c.destination);
    src.start(c.currentTime + start);
  }

  const SCALE = [523.25, 587.33, 659.25, 739.99, 830.61, 987.77, 1046.5, 1174.7];

  const PLAY = {
    tap: function (i) {
      tone(SCALE[Math.min(i || 0, SCALE.length - 1)] * 0.5, 0, 0.09, 'triangle', 0.10);
    },
    correct: function () {
      tone(523.25, 0, 0.16, 'triangle', 0.14);
      tone(659.25, 0.07, 0.18, 'triangle', 0.13);
      tone(783.99, 0.14, 0.30, 'sine', 0.14);
    },
    bonus: function () {
      tone(880, 0, 0.10, 'square', 0.07);
      tone(1174.7, 0.08, 0.12, 'square', 0.06);
      tone(1567.9, 0.16, 0.26, 'sine', 0.09);
    },
    wrong: function () {
      tone(196, 0, 0.20, 'sawtooth', 0.07, 146);
    },
    dupe: function () {
      tone(392, 0, 0.10, 'triangle', 0.09);
      tone(392, 0.11, 0.12, 'triangle', 0.07);
    },
    shuffle: function () {
      noise(0, 0.22, 0.05);
      tone(300, 0, 0.18, 'sine', 0.05, 520);
    },
    hint: function () {
      tone(659.25, 0, 0.12, 'sine', 0.10);
      tone(987.77, 0.09, 0.22, 'sine', 0.09);
    },
    complete: function () {
      const seq = [523.25, 659.25, 783.99, 1046.5];
      seq.forEach(function (f, i) { tone(f, i * 0.11, 0.42, 'triangle', 0.13); });
      tone(1567.9, 0.46, 0.7, 'sine', 0.08);
    }
  };

  return {
    play: function (name, arg) {
      if (muted) return;
      const fn = PLAY[name];
      if (fn) { try { fn(arg); } catch (e) { } }
    },
    unlock: function () { if (!muted) ac(); },
    isMuted: function () { return muted; },
    toggle: function () {
      muted = !muted;
      try { localStorage.setItem('ky_mute', muted ? '1' : '0'); } catch (e) { }
      if (!muted) { ac(); PLAY.tap(2); }
      return muted;
    }
  };
})();
