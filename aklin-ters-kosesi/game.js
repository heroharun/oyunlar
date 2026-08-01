/* =========================================================
   game.js - Aklın Ters Köşesi
   Motor: durum, sahne çizimi, etkileşim, çözüm doğrulama,
   ipucu, kayıt, başarı, günlük ödül, parçacık, debug.
   ========================================================= */
(function (global) {
  'use strict';

  /* ---------------------------------------------------------
     0. Yardımcılar
  --------------------------------------------------------- */
  var doc = global.document;
  function $(sel, root) { return (root || doc).querySelector(sel); }
  function $$(sel, root) { return Array.prototype.slice.call((root || doc).querySelectorAll(sel)); }
  function on(el, ev, fn, opt) { if (el) el.addEventListener(ev, fn, opt || false); }
  function clamp(v, a, b) { return v < a ? a : (v > b ? b : v); }
  function todayKey() {
    var d = new Date();
    return d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2);
  }
  function daysBetween(a, b) {
    if (!a || !b) return 99;
    return Math.round((new Date(b) - new Date(a)) / 86400000);
  }

  /* ---------------------------------------------------------
     1. SaveManager
  --------------------------------------------------------- */
  var STORAGE_KEY = 'atk_save_v1';

  function defaultSave() {
    return {
      version: 1,
      reached: 1,
      completed: [],
      bulbs: 5,
      tickets: 0,
      hintsUsed: {},
      sound: true, music: false, vibrate: true, reduced: false, contrast: false,
      daily: { last: null, day: 0 },
      ach: [],
      stats: { solved: 0, wrong: 0, firstTry: 0, noHintStreak: 0, hidden: 0, sensor: 0 }
    };
  }

  var SaveManager = {
    data: defaultSave(),
    load: function () {
      var d = defaultSave();
      try {
        var raw = global.localStorage.getItem(STORAGE_KEY);
        if (raw) {
          var parsed = JSON.parse(raw);
          if (parsed && typeof parsed === 'object') {
            Object.keys(d).forEach(function (k) {
              if (parsed[k] === undefined || parsed[k] === null) return;
              if (typeof d[k] === typeof parsed[k]) d[k] = parsed[k];
            });
            if (!Array.isArray(d.completed)) d.completed = [];
            if (!Array.isArray(d.ach)) d.ach = [];
            if (typeof d.bulbs !== 'number' || d.bulbs < 0 || !isFinite(d.bulbs)) d.bulbs = 5;
            if (typeof d.reached !== 'number' || d.reached < 1) d.reached = 1;
            d.reached = clamp(Math.floor(d.reached), 1, LEVELS.length);
            if (!d.daily || typeof d.daily !== 'object') d.daily = { last: null, day: 0 };
            if (!d.stats || typeof d.stats !== 'object') d.stats = defaultSave().stats;
          }
        }
      } catch (e) {
        d = defaultSave(); /* bozuk kayıt: varsayılana dön */
      }
      this.data = d;
      return d;
    },
    save: function () {
      try { global.localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data)); } catch (e) {}
    },
    reset: function () {
      this.data = defaultSave();
      this.save();
    },
    addBulbs: function (n) {
      this.data.bulbs = Math.max(0, this.data.bulbs + n);
      this.save();
      UI.syncCounters();
    }
  };

  var LEVELS = global.LEVELS || [];

  /* ---------------------------------------------------------
     2. Oyun durumu
  --------------------------------------------------------- */
  var State = {
    screen: 'BOOT',
    level: null,
    steps: [],
    stepIndex: 0,
    inputLocked: true,
    hintStage: 0,
    wrongCount: 0,
    usedHint: false,
    seqProgress: 0,
    tapCounter: { id: null, count: 0, first: 0 },
    lastTap: { id: null, time: 0 },
    pendingWrong: null,
    waitTimer: null,
    waitLeft: 0,
    kbSelected: null,
    debug: false,
    showHitbox: false
  };

  var objs = {};      /* id -> {el, data, x, y, scale, rot, hidden, isChip, chipEl, placeholder} */
  var sceneEl, dragLayer, phoneEl;

  /* ---------------------------------------------------------
     3. UIManager
  --------------------------------------------------------- */
  var UI = {
    screens: ['screen-boot', 'screen-menu', 'screen-levels', 'screen-game'],
    show: function (id) {
      UI.screens.forEach(function (s) {
        var el = doc.getElementById(s);
        if (el) el.classList.toggle('active', s === id);
      });
    },
    overlay: function (id, visible) {
      var el = doc.getElementById(id);
      if (el) el.hidden = !visible;
    },
    anyOverlayOpen: function () {
      return $$('.overlay').some(function (o) { return !o.hidden; });
    },
    syncCounters: function () {
      var b = SaveManager.data.bulbs;
      ['menuBulbs', 'levelsBulbs', 'hudBulbs'].forEach(function (id) {
        var el = doc.getElementById(id);
        if (el) el.textContent = b;
      });
      var mp = doc.getElementById('menuProgress');
      if (mp) mp.textContent = 'Bölüm ' + SaveManager.data.reached + ' · ' + LEVELS.length;
      var snd = doc.getElementById('hud-sound');
      if (snd) {
        snd.textContent = SaveManager.data.sound ? '🔊' : '🔇';
        snd.setAttribute('aria-label', SaveManager.data.sound ? 'Sesi kapat' : 'Sesi aç');
      }
    },
    toast: function (msg, ms) {
      var t = doc.getElementById('toast');
      if (!t) return;
      t.textContent = msg;
      t.hidden = false;
      clearTimeout(t._timer);
      t._timer = setTimeout(function () { t.hidden = true; }, ms || 1800);
    },
    bubble: function (msg, ms) {
      var b = doc.getElementById('minoBubble');
      if (!b) return;
      if (!msg) { b.hidden = true; return; }
      b.textContent = msg;
      b.hidden = false;
      clearTimeout(b._timer);
      if (ms !== 0) b._timer = setTimeout(function () { b.hidden = true; }, ms || 2600);
    },
    setMino: function (slotId, mood) {
      var el = doc.getElementById(slotId);
      if (el) el.innerHTML = Assets.get('mino', mood || 'idle');
    }
  };

  /* ---------------------------------------------------------
     4. Parçacık sistemi (konfeti / kar)
  --------------------------------------------------------- */
  var FX = (function () {
    var canvas, ctx, parts = [], running = false, snowing = false;
    var COLORS = ['#7c5cff', '#ffc93c', '#35c48f', '#ff7a7a', '#5ec8ff'];

    function resize() {
      if (!canvas) return;
      canvas.width = global.innerWidth;
      canvas.height = global.innerHeight;
    }
    function init() {
      canvas = doc.getElementById('fx');
      if (!canvas) return;
      ctx = canvas.getContext('2d');
      resize();
      on(global, 'resize', resize);
    }
    function loop() {
      if (!ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (var i = parts.length - 1; i >= 0; i--) {
        var p = parts[i];
        p.vy += p.g;
        p.x += p.vx; p.y += p.vy; p.r += p.vr;
        p.life--;
        if (p.life <= 0 || p.y > canvas.height + 40) { parts.splice(i, 1); continue; }
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.r);
        ctx.globalAlpha = Math.min(1, p.life / 25);
        ctx.fillStyle = p.color;
        if (p.shape === 'circle') { ctx.beginPath(); ctx.arc(0, 0, p.size / 2, 0, 6.284); ctx.fill(); }
        else ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
        ctx.restore();
      }
      if (snowing) spawnSnow(1);
      if (parts.length) global.requestAnimationFrame(loop);
      else { running = false; if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height); }
    }
    function start() { if (!running) { running = true; global.requestAnimationFrame(loop); } }
    function spawnSnow(n) {
      for (var i = 0; i < n; i++) {
        parts.push({
          x: Math.random() * canvas.width, y: -10,
          vx: (Math.random() - .5) * .6, vy: 1 + Math.random(), g: 0.002,
          r: 0, vr: 0.02, size: 4 + Math.random() * 5, life: 400,
          color: '#ffffff', shape: 'circle'
        });
      }
    }
    return {
      init: init,
      confetti: function (cx, cy) {
        if (!ctx || SaveManager.data.reduced) return;
        for (var i = 0; i < 60; i++) {
          var a = Math.random() * Math.PI * 2, sp = 3 + Math.random() * 8;
          parts.push({
            x: cx, y: cy, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 4, g: 0.28,
            r: Math.random() * 6, vr: (Math.random() - .5) * .3,
            size: 6 + Math.random() * 7, life: 70 + Math.random() * 40,
            color: COLORS[(Math.random() * COLORS.length) | 0],
            shape: Math.random() < .3 ? 'circle' : 'rect'
          });
        }
        start();
      },
      snow: function (enable) {
        snowing = !!enable && !SaveManager.data.reduced;
        if (snowing) { spawnSnow(40); start(); }
      },
      clear: function () { parts.length = 0; snowing = false; if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height); }
    };
  })();

  /* ---------------------------------------------------------
     5. ObjectFactory + LevelRenderer
  --------------------------------------------------------- */
  function sceneRect() { return sceneEl.getBoundingClientRect(); }

  function createObject(data) {
    var el = doc.createElement('div');
    el.className = 'obj';
    el.dataset.objId = data.id;
    el.setAttribute('data-obj-id', data.id);
    el.setAttribute('role', 'button');
    el.setAttribute('tabindex', '0');
    el.setAttribute('aria-label', data.label || data.text || data.sprite || 'nesne');

    if (data.text !== undefined) {
      el.classList.add('text');
      el.textContent = data.text;
    } else if (data.shape) {
      el.classList.add('shape', data.shape);
      el.style.background = data.color || '#ddd';
    } else {
      el.innerHTML = Assets.get(data.sprite, data.state);
    }
    if (data.drag) el.classList.add('draggable');
    if (data.hidden) el.classList.add('hidden-obj');
    el.style.zIndex = data.z || 2;

    var rec = {
      el: el, data: data,
      x: data.x, y: data.y,
      scale: data.scale || 1, rot: data.rot || 0,
      hidden: !!data.hidden, drag: !!data.drag, pinch: !!data.pinch,
      isChip: false
    };
    objs[data.id] = rec;
    applyTransform(rec);
    sceneEl.appendChild(el);
    return rec;
  }

  function applyTransform(rec) {
    rec.el.style.left = rec.x + '%';
    rec.el.style.top = rec.y + '%';
    rec.el.style.transform = 'translate(-50%, -50%) rotate(' + rec.rot + 'deg) scale(' + rec.scale + ')';
  }

  function layoutObjects() {
    if (!sceneEl) return;
    var w = sceneEl.clientWidth || 320;
    doc.documentElement.style.setProperty('--scene-unit', (w / 100) + 'px');
    Object.keys(objs).forEach(function (id) {
      var r = objs[id];
      if (r.isChip || !r.el || !r.el.parentNode) return;
      var d = r.data;
      if (d.text !== undefined) {
        var fs = (d.fontSize || 30) * (w / 360);
        r.el.style.fontSize = fs.toFixed(1) + 'px';
      } else {
        var px = (d.size || 20) * w / 100;
        r.el.style.width = px + 'px';
        r.el.style.height = (d.h ? d.h * w / 100 : px) + 'px';
      }
    });
  }

  /* Talimat metnindeki [[id|Metin]] parçalarını kelime-nesnesine çevirir */
  function renderInstruction(level) {
    var host = doc.getElementById('instruction');
    host.innerHTML = '';
    var text = level.instruction || '';
    var re = /\[\[([a-zA-Z0-9_]+)\|([^\]]*)\]\]/g;
    var last = 0, m;
    while ((m = re.exec(text)) !== null) {
      if (m.index > last) host.appendChild(doc.createTextNode(text.slice(last, m.index)));
      var id = m[1], label = m[2];
      var opts = (level.chipOpts && level.chipOpts[id]) || {};
      var chip = doc.createElement('span');
      chip.className = 'chip' + (opts.drag === false ? ' no-drag' : '');
      chip.textContent = label;
      chip.setAttribute('data-obj-id', id);
      chip.setAttribute('role', 'button');
      chip.setAttribute('tabindex', '0');
      chip.setAttribute('aria-label', 'kelime: ' + label);
      host.appendChild(chip);
      objs[id] = {
        el: chip, isChip: true, chipEl: chip,
        data: { id: id, text: label, fontSize: 26, drag: opts.drag !== false },
        drag: opts.drag !== false, pinch: false, hidden: false,
        scale: 1, rot: 0, x: 50, y: 50,
        cycle: opts.cycle || null, cycleIndex: 0, state: opts.cycle ? opts.cycle[0] : null
      };
      last = re.lastIndex;
    }
    if (last < text.length) host.appendChild(doc.createTextNode(text.slice(last)));
  }

  function clearScene() {
    if (State.waitTimer) { clearInterval(State.waitTimer); State.waitTimer = null; }
    if (State.pendingWrong) { clearTimeout(State.pendingWrong); State.pendingWrong = null; }
    objs = {};
    if (sceneEl) {
      sceneEl.innerHTML = '';
      sceneEl.classList.remove('night');
    }
    FX.snow(false);
    UI.bubble(null);
    var gb = doc.getElementById('gestureBar');
    if (gb) gb.innerHTML = '';
  }

  function normalizeSteps(level) {
    if (level.steps && level.steps.length) return level.steps.slice();
    return [{ do: level.solution }];
  }

  function loadLevel(id, skipAnim) {
    var level = LEVELS.filter(function (l) { return l.id === id; })[0];
    if (!level) return;
    clearScene();
    State.level = level;
    State.steps = normalizeSteps(level);
    State.stepIndex = 0;
    State.hintStage = 0;
    State.wrongCount = 0;
    State.usedHint = false;
    State.seqProgress = 0;
    State.tapCounter = { id: null, count: 0, first: 0 };
    State.kbSelected = null;
    State.screen = 'PLAYING';
    State.inputLocked = false;

    doc.getElementById('hudLevelNum').textContent = level.id;
    renderInstruction(level);
    (level.scene || []).forEach(createObject);
    layoutObjects();
    UI.setMino('gameMino', 'idle');
    UI.syncCounters();
    updateHintButton();
    buildGestureBar();
    startStep();

    if (!skipAnim && !SaveManager.data.reduced) {
      sceneEl.classList.remove('card-out');
      sceneEl.classList.add('card-in');
      setTimeout(function () { sceneEl.classList.remove('card-in'); }, 320);
    }
    if (level.tutorial) UI.bubble(level.tutorial, 3600);
    if (level.preview) runPreview(level.preview);
    UI.show('screen-game');
    Debug.sync();
  }

  function runPreview(seq) {
    State.inputLocked = true;
    var i = 0;
    UI.bubble('İzle...', 2200);
    var t = setInterval(function () {
      if (i > 0) { var prev = objs[seq[i - 1]]; if (prev) prev.el.style.filter = ''; }
      if (i >= seq.length) { clearInterval(t); State.inputLocked = false; UI.bubble('Şimdi sen tekrarla.', 1800); return; }
      var r = objs[seq[i]];
      if (r) {
        r.el.style.filter = 'drop-shadow(0 0 14px #ffc93c) brightness(1.25)';
        AudioManager.play('tap');
      }
      i++;
    }, 620);
  }

  /* ---------------------------------------------------------
     6. Efektler (adım sonrası / bölüm sonrası)
  --------------------------------------------------------- */
  function applyEffects(fx) {
    if (!fx) return;
    if (fx.reveal) fx.reveal.forEach(function (id) {
      var r = objs[id]; if (r) { r.hidden = false; r.el.classList.remove('hidden-obj'); r.el.classList.add('bounce'); }
    });
    if (fx.remove) fx.remove.forEach(function (id) {
      var r = objs[id];
      if (r && r.el) { r.el.style.transition = 'opacity .25s'; r.el.style.opacity = '0'; r.hidden = true; setTimeout(function () { if (r.el) r.el.classList.add('hidden-obj'); }, 260); }
    });
    if (fx.sprite) Object.keys(fx.sprite).forEach(function (id) {
      var r = objs[id]; if (r) { r.el.innerHTML = Assets.get(fx.sprite[id]); r.el.classList.add('bounce'); }
    });
    if (fx.color) Object.keys(fx.color).forEach(function (id) {
      var r = objs[id]; if (r) r.el.style.background = fx.color[id];
    });
    if (fx.text) Object.keys(fx.text).forEach(function (id) {
      var r = objs[id]; if (r) { r.el.textContent = fx.text[id]; r.el.classList.add('bounce'); }
    });
    if (fx.scale) Object.keys(fx.scale).forEach(function (id) {
      var r = objs[id]; if (r) { r.scale = fx.scale[id]; applyTransform(r); }
    });
    if (fx.rotate) Object.keys(fx.rotate).forEach(function (id) {
      var r = objs[id]; if (r) { r.el.style.transition = 'transform .5s ease'; r.rot = fx.rotate[id]; applyTransform(r); }
    });
    if (fx.move) Object.keys(fx.move).forEach(function (id) {
      var r = objs[id];
      if (r) { r.el.style.transition = 'left .6s ease, top .6s cubic-bezier(.4,1.4,.6,1)'; r.x = fx.move[id].x; r.y = fx.move[id].y; applyTransform(r); }
    });
    if (fx.water) { var w = objs[fx.water]; if (w) w.el.classList.add('filled'); }
    if (fx.night) sceneEl.classList.add('night');
    if (fx.snow) FX.snow(true);
    if (fx.fly) fx.fly.forEach(function (id) { var r = objs[id]; if (r) r.el.classList.add('fly'); });
    if (fx.drag) fx.drag.forEach(function (id) { var r = objs[id]; if (r) { r.drag = true; r.el.classList.add('draggable'); } });
    if (fx.spawn) {
      var s = fx.spawn;
      if (!objs[s.id]) { createObject(s); layoutObjects(); objs[s.id].el.classList.add('bounce'); }
    }
  }

  /* ---------------------------------------------------------
     7. Adım / çözüm yönetimi
  --------------------------------------------------------- */
  function currentAction() {
    var st = State.steps[State.stepIndex];
    return st && st.do ? st.do : null;
  }

  function startStep() {
    State.seqProgress = 0;
    State.tapCounter = { id: null, count: 0, first: 0 };
    buildGestureBar();
    var a = currentAction();
    if (!a) return;
    if (a.action === 'wait') startWaitTimer(a.seconds || 5);
    if (a.action === 'shake' || a.action === 'tilt') {
      Sensors.enable();
      SaveManager.data.stats.sensor = SaveManager.data.stats.sensor || 0;
    }
  }

  function startWaitTimer(seconds) {
    if (State.waitTimer) clearInterval(State.waitTimer);
    State.waitLeft = seconds;
    UI.bubble(State.waitLeft + ' saniye...', 0);
    State.waitTimer = setInterval(function () {
      State.waitLeft--;
      if (State.waitLeft <= 0) {
        clearInterval(State.waitTimer); State.waitTimer = null;
        UI.bubble(null);
        stepSolved();
      } else {
        UI.bubble(State.waitLeft + ' saniye...', 0);
      }
    }, 1000);
  }

  function resetWaitTimer() {
    var a = currentAction();
    if (a && a.action === 'wait' && State.waitTimer) {
      startWaitTimer(a.seconds || 5);
      UI.bubble('Baştan... dokunma!', 0);
    }
  }

  function stepSolved() {
    var step = State.steps[State.stepIndex];
    applyEffects(step.then);
    AudioManager.play('correct');
    State.stepIndex++;
    if (State.stepIndex < State.steps.length) {
      if (step.say) UI.bubble(step.say, 2200);
      startStep();
      Debug.sync();
    } else {
      levelSolved();
    }
  }

  function levelSolved() {
    if (State.screen === 'COMPLETED') return;
    State.screen = 'COMPLETED';
    State.inputLocked = true;
    applyEffects(State.level.onSolve);
    UI.setMino('gameMino', 'happy');
    UI.bubble('Ters köşe!', 2200);
    AudioManager.play('levelComplete');
    var r = sceneRect();
    FX.confetti(r.left + r.width / 2, r.top + r.height / 2);
    Object.keys(objs).forEach(function (id) {
      var o = objs[id];
      if (o && !o.isChip && !o.hidden) { o.el.classList.remove('bounce'); void o.el.offsetWidth; o.el.classList.add('bounce'); }
    });

    var lvl = State.level;
    var d = SaveManager.data;
    var first = d.completed.indexOf(lvl.id) === -1;
    var earned = 0;
    if (first) {
      d.completed.push(lvl.id);
      d.stats.solved++;
      if (State.wrongCount === 0) d.stats.firstTry++;
      if (!State.usedHint) d.stats.noHintStreak++; else d.stats.noHintStreak = 0;
      if (lvl.category === 'gizli nesne') d.stats.hidden++;
      if (lvl.category === 'sensör') d.stats.sensor++;
      earned = lvl.reward ? 1 : (Math.random() < 0.5 ? 1 : 0);
      d.bulbs += earned;
      if (lvl.id + 1 > d.reached) d.reached = Math.min(LEVELS.length, lvl.id + 1);
    }
    SaveManager.save();
    UI.syncCounters();
    var unlocked = Achievements.check();

    setTimeout(function () {
      doc.getElementById('completeTitle').textContent = first ? 'Ters köşe!' : 'Yine çözdün';
      doc.getElementById('completeText').textContent = lvl.title;
      var rw = doc.getElementById('completeReward');
      rw.hidden = earned === 0;
      rw.innerHTML = '<span class="ico">💡</span> +' + earned + ' ampul';
      UI.setMino('completeMino', 'happy');
      var next = doc.getElementById('btnNextLevel');
      next.textContent = lvl.id >= LEVELS.length ? 'Bölümlere dön' : 'Sonraki bölüm';
      UI.overlay('ov-complete', true);
      if (unlocked.length) UI.toast('Başarı: ' + unlocked[0].title);
    }, SaveManager.data.reduced ? 200 : 900);
  }

  function wrong(el, silent) {
    State.wrongCount++;
    SaveManager.data.stats.wrong++;
    SaveManager.save();
    if (!silent) {
      AudioManager.play('wrong');
      UI.setMino('gameMino', 'confused');
      setTimeout(function () { if (State.screen === 'PLAYING') UI.setMino('gameMino', 'idle'); }, 900);
      sceneEl.classList.add('nudge');
      setTimeout(function () { sceneEl.classList.remove('nudge'); }, 350);
      UI.bubble('Hmm... o değil.', 1200);
    }
    if (el) {
      el.classList.remove('wiggle'); void el.offsetWidth; el.classList.add('wiggle');
      setTimeout(function () { el.classList.remove('wiggle'); }, 400);
    }
    if (State.wrongCount === 3) {
      var hb = doc.getElementById('btnHint');
      hb.classList.add('glow');
    }
    Achievements.check();
  }

  /* ---------------------------------------------------------
     8. Çözüm doğrulayıcı (olay bazlı)
  --------------------------------------------------------- */
  function stateOk(a) {
    if (!a.requireState) return true;
    if (a.requireState === 'soundOff') return SaveManager.data.sound === false;
    if (a.requireState === 'soundOn') return SaveManager.data.sound === true;
    return true;
  }

  function handleTap(id, el) {
    var a = currentAction();
    if (!a) return;
    if (State.pendingWrong) { clearTimeout(State.pendingWrong); State.pendingWrong = null; }

    /* Kelime nesnesi durum döngüsü (ör. "havlar" -> "miyavlar") */
    var rec = objs[id];
    if (rec && rec.cycle) {
      rec.cycleIndex = (rec.cycleIndex + 1) % rec.cycle.length;
      rec.state = rec.cycle[rec.cycleIndex];
      rec.el.textContent = rec.state;
      AudioManager.play('tap');
      if (a.action === 'stateEquals' && a.targetId === id && a.state === rec.state) { stepSolved(); return; }
      return;
    }

    AudioManager.play('tap');

    switch (a.action) {
      case 'tap':
        if (id === a.targetId && stateOk(a)) stepSolved();
        else wrong(el);
        return;

      case 'doubleTap':
        var now = Date.now();
        if (State.lastTap.id === id && now - State.lastTap.time < 340) {
          State.lastTap = { id: null, time: 0 };
          if (id === a.targetId) { stepSolved(); return; }
          wrong(el); return;
        }
        State.lastTap = { id: id, time: now };
        State.pendingWrong = setTimeout(function () {
          State.pendingWrong = null;
          wrong(el);
        }, 380);
        return;

      case 'orderedTapSequence':
        if (a.sequence[State.seqProgress] === id) {
          State.seqProgress++;
          if (el) { el.classList.add('bounce'); setTimeout(function () { el.classList.remove('bounce'); }, 500); }
          if (State.seqProgress >= a.sequence.length) stepSolved();
        } else {
          State.seqProgress = 0;
          wrong(el);
        }
        return;

      case 'multiTap':
        if (id !== a.targetId) { wrong(el); return; }
        var t = Date.now();
        if (State.tapCounter.id !== id || t - State.tapCounter.first > (a.withinMs || 3000)) {
          State.tapCounter = { id: id, count: 0, first: t };
        }
        State.tapCounter.count++;
        if (el) { el.classList.add('wiggle'); setTimeout(function () { el.classList.remove('wiggle'); }, 320); }
        var left = (a.count || 3) - State.tapCounter.count;
        if (left <= 0) { stepSolved(); }
        else UI.bubble(left + ' tane daha', 900);
        return;

      case 'tapEmpty':
        wrong(el);
        return;

      default:
        /* Bu adım dokunma istemiyor: nazik geri bildirim */
        wrong(el);
    }
  }

  function handleTapEmpty() {
    var a = currentAction();
    if (!a) return;
    if (a.action === 'tapEmpty') { AudioManager.play('tap'); stepSolved(); }
    else { AudioManager.play('tap'); wrong(null, true); UI.bubble('Boşluğa dokundun.', 900); }
  }

  function handleLongPress(id, el, heldMs) {
    var a = currentAction();
    if (!a) return;
    if (a.action === 'longPress' && a.targetId === id && heldMs >= (a.ms || 700)) { stepSolved(); return true; }
    return false;
  }

  function handleDrop(sourceId, targetId, offScreen, sourceEl) {
    var a = currentAction();
    if (!a) return false;
    if (offScreen) {
      if (a.action === 'dragOffScreen' && a.sourceId === sourceId) {
        if (sourceEl) sourceEl.classList.add('hidden-obj');
        if (objs[sourceId]) objs[sourceId].hidden = true;
        stepSolved();
        return true;
      }
      wrong(sourceEl);
      return false;
    }
    if (targetId) {
      if ((a.action === 'dropOnTarget' || a.action === 'hideBehind') && a.sourceId === sourceId && a.targetId === targetId) {
        if (a.action === 'hideBehind') {
          var s = objs[sourceId], tg = objs[targetId];
          if (s && tg) {
            s.el.style.zIndex = Math.max(1, (parseInt(tg.el.style.zIndex, 10) || 2) - 1);
            s.el.classList.add('behind');
            s.x = tg.x; s.y = tg.y + 4; applyTransform(s);
          }
        } else {
          var src = objs[sourceId], tgt = objs[targetId];
          if (src && tgt) { src.x = tgt.x; src.y = tgt.y; applyTransform(src); }
        }
        AudioManager.play('drop');
        stepSolved();
        return true;
      }
    }
    return false;
  }

  function handleGesture(kind, targetId, value) {
    var a = currentAction();
    if (!a) return;
    if (kind === 'pinch') {
      if (a.action === 'pinchOut' && a.targetId === targetId && value >= (a.scale || 1.6)) { stepSolved(); return; }
      if (a.action === 'pinchIn' && a.targetId === targetId && value <= (a.scale || 0.5)) { stepSolved(); return; }
    }
    if (kind === 'rotate') {
      if (a.action === 'rotate' && a.targetId === targetId && Math.abs(value) >= (a.degrees || 150)) { stepSolved(); return; }
    }
    if (kind === 'swipe') {
      if (a.action === 'swipe' && (!a.targetId || a.targetId === targetId) && a.direction === value) { stepSolved(); return; }
    }
    if (kind === 'shake') {
      if (a.action === 'shake') { AudioManager.play('shake'); stepSolved(); return; }
    }
    if (kind === 'tilt') {
      if (a.action === 'tilt' && a.direction === value) { stepSolved(); return; }
    }
  }

  /* ---------------------------------------------------------
     9. InteractionManager (pointer + jest)
  --------------------------------------------------------- */
  var pointers = {};
  var pointerCount = 0;
  var candidate = null;   /* {id, el, startX, startY, moved, time} */
  var drag = null;        /* {id, rec, offX, offY, wasChip} */
  var gesture = null;     /* {id, rec, startDist, startAngle, baseScale, baseRot} */
  var holdTimer = null;
  var holdStart = 0;

  function objIdFromEvent(e) {
    var el = e.target && e.target.closest ? e.target.closest('[data-obj-id]') : null;
    if (!el) return null;
    var id = el.getAttribute('data-obj-id');
    if (!id || !objs[id]) return null;
    if (objs[id].hidden) return null;
    return id;
  }

  function pointerDown(e) {
    AudioManager.unlockContext();
    if (State.inputLocked || State.screen !== 'PLAYING' || UI.anyOverlayOpen()) return;
    resetWaitTimer();

    pointers[e.pointerId] = { x: e.clientX, y: e.clientY, sx: e.clientX, sy: e.clientY, t: Date.now() };
    pointerCount = Object.keys(pointers).length;

    var id = objIdFromEvent(e);

    if (pointerCount === 2) {
      cancelHold();
      startGesture(id);
      return;
    }
    if (!id) { candidate = { id: null, el: null, startX: e.clientX, startY: e.clientY, moved: false, t: Date.now() }; return; }

    var rec = objs[id];
    candidate = { id: id, el: rec.el, startX: e.clientX, startY: e.clientY, moved: false, t: Date.now() };
    try { if (rec.el.setPointerCapture && !rec.isChip) rec.el.setPointerCapture(e.pointerId); } catch (err) {}

    var a = currentAction();
    var holdMs = (a && a.action === 'longPress' && a.targetId === id) ? (a.ms || 700) : 900;
    holdStart = Date.now();
    holdTimer = setTimeout(function () {
      holdTimer = null;
      if (!candidate || candidate.moved || drag) return;
      var ok = handleLongPress(id, rec.el, Date.now() - holdStart);
      if (ok) { candidate = null; }
      else { rec.el.classList.add('wiggle'); setTimeout(function () { rec.el.classList.remove('wiggle'); }, 350); }
    }, holdMs);
  }

  function cancelHold() { if (holdTimer) { clearTimeout(holdTimer); holdTimer = null; } }

  function pointerMove(e) {
    var p = pointers[e.pointerId];
    if (!p) return;
    p.x = e.clientX; p.y = e.clientY;

    if (gesture) { updateGesture(); return; }
    if (drag) { moveDrag(e.clientX, e.clientY); return; }
    if (!candidate) return;

    var dx = e.clientX - candidate.startX, dy = e.clientY - candidate.startY;
    if (!candidate.moved && (dx * dx + dy * dy) > 64) {
      candidate.moved = true;
      cancelHold();
      if (candidate.id && objs[candidate.id] && objs[candidate.id].drag) beginDrag(candidate.id, e.clientX, e.clientY);
    }
  }

  function pointerUp(e) {
    var p = pointers[e.pointerId];
    delete pointers[e.pointerId];
    pointerCount = Object.keys(pointers).length;
    cancelHold();

    if (gesture) {
      if (pointerCount < 2) endGesture();
      return;
    }
    if (drag) { endDrag(e.clientX, e.clientY); return; }
    if (!candidate || !p) { candidate = null; return; }

    var dt = Date.now() - candidate.t;
    var dx = e.clientX - candidate.startX, dy = e.clientY - candidate.startY;
    var dist2 = dx * dx + dy * dy;

    if (candidate.id) {
      if (!candidate.moved && dt < 600) handleTap(candidate.id, candidate.el);
      else if (dist2 > 900 && dt < 500) {
        var dir = Math.abs(dx) > Math.abs(dy) ? (dx < 0 ? 'left' : 'right') : (dy < 0 ? 'up' : 'down');
        handleGesture('swipe', candidate.id, dir);
      }
    } else if (!candidate.moved && dt < 600) {
      handleTapEmpty();
    }
    candidate = null;
  }

  /* ---- sürükleme ---- */
  function beginDrag(id, cx, cy) {
    var rec = objs[id];
    if (!rec) return;
    var wasChip = rec.isChip;

    if (wasChip) {
      /* Kelimeyi sahneye taşı: aynı id ile gerçek nesne yarat */
      var chip = rec.chipEl;
      var cr = chip.getBoundingClientRect();
      var sr = sceneRect();
      var ph = doc.createElement('span');
      ph.className = 'chip-slot';
      ph.style.width = cr.width + 'px';
      chip.style.display = 'none';
      chip.parentNode.insertBefore(ph, chip);
      rec.placeholder = ph;

      var el = doc.createElement('div');
      el.className = 'obj text draggable dragging';
      el.setAttribute('data-obj-id', id);
      el.setAttribute('role', 'button');
      el.setAttribute('tabindex', '0');
      el.setAttribute('aria-label', 'kelime: ' + rec.data.text);
      el.textContent = rec.data.text;
      el.style.fontSize = Math.max(20, cr.height * 0.8) + 'px';
      el.style.zIndex = 800;
      sceneEl.appendChild(el);
      rec.el = el;
      rec.isChip = false;
      rec.x = ((cr.left + cr.width / 2) - sr.left) / sr.width * 100;
      rec.y = ((cr.top + cr.height / 2) - sr.top) / sr.height * 100;
      rec.fromChip = true;
      applyTransform(rec);
    }

    var r = rec.el.getBoundingClientRect();
    drag = {
      id: id, rec: rec,
      offX: (r.left + r.width / 2) - cx,
      offY: (r.top + r.height / 2) - cy,
      homeX: rec.x, homeY: rec.y,
      wasChip: wasChip
    };
    rec.el.classList.add('dragging');
    AudioManager.play('dragStart');
  }

  function moveDrag(cx, cy) {
    var sr = sceneRect();
    var nx = cx + drag.offX, ny = cy + drag.offY;
    drag.rec.x = (nx - sr.left) / sr.width * 100;
    drag.rec.y = (ny - sr.top) / sr.height * 100;
    applyTransform(drag.rec);
  }

  function findDropTarget(sourceId) {
    var src = objs[sourceId];
    if (!src) return null;
    var r = src.el.getBoundingClientRect();
    var px = r.left + r.width / 2, py = r.top + r.height / 2;
    var best = null, bestArea = Infinity;
    Object.keys(objs).forEach(function (id) {
      if (id === sourceId) return;
      var o = objs[id];
      if (!o || o.hidden || o.isChip || !o.el || !o.el.parentNode) return;
      if (o.el.classList.contains('hidden-obj')) return;
      var b = o.el.getBoundingClientRect();
      var pad = 6;
      if (px >= b.left - pad && px <= b.right + pad && py >= b.top - pad && py <= b.bottom + pad) {
        var area = b.width * b.height;
        if (area < bestArea) { bestArea = area; best = id; }
      }
    });
    return best;
  }

  function isOffScreen(rec) {
    var sr = sceneRect();
    var r = rec.el.getBoundingClientRect();
    var cx = r.left + r.width / 2, cy = r.top + r.height / 2;
    var m = 8;
    if (cx < sr.left - m || cx > sr.right + m) return true;
    if (cy > sr.bottom + m) return true;
    /* Kelime nesneleri zaten sahnenin üstünden gelir: yukarısı sayılmaz */
    if (!rec.fromChip && cy < sr.top - m) return true;
    if (rec.fromChip && cy < sr.top - 120) return true;
    return false;
  }

  function endDrag() {
    var d = drag;
    drag = null;
    if (!d) return;
    var rec = d.rec;
    rec.el.classList.remove('dragging');

    var off = isOffScreen(rec);
    var targetId = off ? null : findDropTarget(d.id);
    var solved = handleDrop(d.id, targetId, off, rec.el);

    if (!solved) {
      /* eve dön */
      if (d.wasChip) {
        restoreChip(rec);
      } else {
        rec.el.style.transition = 'left .25s ease, top .25s ease';
        rec.x = d.homeX; rec.y = d.homeY;
        applyTransform(rec);
        setTimeout(function () { if (rec.el) rec.el.style.transition = ''; }, 280);
      }
      if (!off) { AudioManager.play('drop'); }
    }
    candidate = null;
  }

  function restoreChip(rec) {
    if (rec.el && rec.el.parentNode) rec.el.parentNode.removeChild(rec.el);
    if (rec.placeholder && rec.placeholder.parentNode) rec.placeholder.parentNode.removeChild(rec.placeholder);
    rec.placeholder = null;
    rec.chipEl.style.display = '';
    rec.el = rec.chipEl;
    rec.isChip = true;
    rec.fromChip = false;
  }

  /* ---- iki parmak: büyüt / küçült / döndür ---- */
  function twoPointers() {
    var keys = Object.keys(pointers);
    if (keys.length < 2) return null;
    return [pointers[keys[0]], pointers[keys[1]]];
  }

  function startGesture(hintId) {
    var pts = twoPointers();
    if (!pts) return;
    var mx = (pts[0].x + pts[1].x) / 2, my = (pts[0].y + pts[1].y) / 2;
    var id = hintId || objectAtPoint(mx, my) || firstPinchable();
    if (!id || !objs[id]) return;
    var rec = objs[id];
    if (rec.isChip) return;
    gesture = {
      id: id, rec: rec,
      startDist: dist(pts[0], pts[1]),
      startAngle: angle(pts[0], pts[1]),
      baseScale: rec.scale, baseRot: rec.rot,
      scale: rec.scale, deltaRot: 0
    };
    if (drag) { drag = null; rec.el.classList.remove('dragging'); }
    candidate = null; /* iki parmak başlayınca tek dokunma iptal */
  }

  function dist(a, b) { var dx = a.x - b.x, dy = a.y - b.y; return Math.sqrt(dx * dx + dy * dy); }
  function angle(a, b) { return Math.atan2(b.y - a.y, b.x - a.x) * 180 / Math.PI; }

  function updateGesture() {
    var pts = twoPointers();
    if (!pts || !gesture) return;
    var d = dist(pts[0], pts[1]);
    var ratio = gesture.startDist > 0 ? d / gesture.startDist : 1;
    gesture.scale = clamp(gesture.baseScale * ratio, 0.2, 4);
    gesture.deltaRot = angle(pts[0], pts[1]) - gesture.startAngle;
    gesture.rec.scale = gesture.scale;
    gesture.rec.rot = gesture.baseRot + gesture.deltaRot;
    applyTransform(gesture.rec);
  }

  function endGesture() {
    if (!gesture) return;
    var g = gesture;
    gesture = null;
    var scaleFactor = g.rec.scale / (g.rec.data.scale || 1);
    handleGesture('pinch', g.id, scaleFactor);
    if (Math.abs(g.deltaRot) > 20) handleGesture('rotate', g.id, totalRotation(g.rec));
  }

  function totalRotation(rec) {
    var base = rec.data.rot || 0;
    return rec.rot - base;
  }

  function objectAtPoint(x, y) {
    var el = doc.elementFromPoint(x, y);
    var host = el && el.closest ? el.closest('[data-obj-id]') : null;
    if (!host) return null;
    var id = host.getAttribute('data-obj-id');
    return objs[id] && !objs[id].hidden ? id : null;
  }

  function firstPinchable() {
    var found = null;
    Object.keys(objs).forEach(function (id) {
      if (!found && objs[id].pinch && !objs[id].hidden) found = id;
    });
    return found;
  }

  /* Masaüstü: fare tekerleği ile boyut */
  function onWheel(e) {
    if (State.inputLocked || State.screen !== 'PLAYING') return;
    var id = objIdFromEvent(e);
    if (!id || !objs[id].pinch) return;
    e.preventDefault();
    scaleObject(id, e.deltaY < 0 ? 1.12 : 1 / 1.12);
  }

  function scaleObject(id, factor) {
    var rec = objs[id];
    if (!rec) return;
    rec.scale = clamp(rec.scale * factor, 0.2, 4);
    applyTransform(rec);
    handleGesture('pinch', id, rec.scale / (rec.data.scale || 1));
  }

  function rotateObject(id, deg) {
    var rec = objs[id];
    if (!rec) return;
    rec.el.style.transition = 'transform .18s ease';
    rec.rot += deg;
    applyTransform(rec);
    handleGesture('rotate', id, totalRotation(rec));
  }

  /* ---------------------------------------------------------
     10. Jest yardım çubuğu (masaüstü + erişilebilirlik)
  --------------------------------------------------------- */
  function buildGestureBar() {
    var bar = doc.getElementById('gestureBar');
    if (!bar) return;
    bar.innerHTML = '';
    var a = currentAction();
    if (!a) return;

    function addBtn(label, fn) {
      var b = doc.createElement('button');
      b.type = 'button';
      b.className = 'btn';
      b.textContent = label;
      on(b, 'click', function () { AudioManager.play('button'); fn(); });
      bar.appendChild(b);
    }

    if (a.action === 'pinchOut') addBtn('🔍 Büyüt', function () { scaleObject(a.targetId, 1.18); });
    if (a.action === 'pinchIn') addBtn('🔎 Küçült', function () { scaleObject(a.targetId, 1 / 1.18); });
    if (a.action === 'rotate') addBtn('🔄 Döndür', function () { rotateObject(a.targetId, 30); });
    if (a.action === 'shake') addBtn('📳 Salla', function () { handleGesture('shake', null, null); });
    if (a.action === 'tilt') {
      addBtn('⬅️ Sola eğ', function () { handleGesture('tilt', null, 'left'); });
      addBtn('➡️ Sağa eğ', function () { handleGesture('tilt', null, 'right'); });
    }
    if (a.action === 'swipe') addBtn('👉 Kaydır', function () { handleGesture('swipe', a.targetId, a.direction); });
  }

  /* ---------------------------------------------------------
     11. SensorManager
  --------------------------------------------------------- */
  var Sensors = (function () {
    var active = false, lastShake = 0, last = { x: 0, y: 0, z: 0 };

    function onMotion(e) {
      var acc = e.accelerationIncludingGravity || e.acceleration;
      if (!acc) return;
      var dx = Math.abs((acc.x || 0) - last.x), dy = Math.abs((acc.y || 0) - last.y), dz = Math.abs((acc.z || 0) - last.z);
      last = { x: acc.x || 0, y: acc.y || 0, z: acc.z || 0 };
      if (dx + dy + dz > 26 && Date.now() - lastShake > 700) {
        lastShake = Date.now();
        handleGesture('shake', null, null);
      }
    }
    function onOrient(e) {
      var g = e.gamma;
      if (g == null) return;
      if (g > 28) handleGesture('tilt', null, 'right');
      else if (g < -28) handleGesture('tilt', null, 'left');
    }
    return {
      enable: function () {
        if (active) return;
        active = true;
        on(global, 'devicemotion', onMotion);
        on(global, 'deviceorientation', onOrient);
      },
      disable: function () {
        if (!active) return;
        active = false;
        global.removeEventListener('devicemotion', onMotion);
        global.removeEventListener('deviceorientation', onOrient);
      },
      request: function () {
        var need = (global.DeviceMotionEvent && typeof global.DeviceMotionEvent.requestPermission === 'function');
        if (!need) { Sensors.enable(); UI.toast('Sensörler açık.'); return; }
        global.DeviceMotionEvent.requestPermission().then(function (r) {
          if (r === 'granted') { Sensors.enable(); UI.toast('Sensörler açık.'); }
          else UI.toast('İzin verilmedi. Alt düğmeleri kullanabilirsin.');
        }).catch(function () { UI.toast('Sensör açılamadı. Alt düğmeleri kullan.'); });
      }
    };
  })();

  /* ---------------------------------------------------------
     12. HintManager
  --------------------------------------------------------- */
  function hintCost() { return State.hintStage === 0 ? 1 : 2; }

  function updateHintButton() {
    var btn = doc.getElementById('btnHint');
    var lbl = doc.getElementById('hintLabel');
    if (!btn || !lbl) return;
    btn.classList.remove('glow');
    if (State.hintStage >= 2) { lbl.textContent = 'İpucu bitti'; btn.disabled = true; return; }
    btn.disabled = false;
    lbl.textContent = 'İpucu (' + hintCost() + ')';
  }

  function useHint() {
    if (!State.level || State.hintStage >= 2) return;
    var cost = hintCost();
    if (SaveManager.data.bulbs < cost) {
      UI.toast('Ampul yetmiyor. Bölüm tamamlayarak kazanabilirsin.');
      return;
    }
    SaveManager.data.bulbs -= cost;
    State.usedHint = true;
    SaveManager.data.hintsUsed[State.level.id] = (SaveManager.data.hintsUsed[State.level.id] || 0) + 1;
    SaveManager.data.stats.noHintStreak = 0;
    SaveManager.save();
    UI.syncCounters();
    AudioManager.play('hint');
    UI.setMino('gameMino', 'hint');
    var text = State.hintStage === 0 ? State.level.hint : (State.level.secondHint || State.level.hint);
    State.hintStage++;
    updateHintButton();
    UI.bubble(text, 5200);
  }

  function skipLevel() {
    var d = SaveManager.data;
    if (d.tickets > 0) { d.tickets--; }
    else if (d.bulbs >= 3) { d.bulbs -= 3; }
    else { UI.toast('Geçmek için 3 ampul ya da bir bilet gerekli.'); return; }
    if (d.completed.indexOf(State.level.id) === -1) d.completed.push(State.level.id);
    if (State.level.id + 1 > d.reached) d.reached = Math.min(LEVELS.length, State.level.id + 1);
    SaveManager.save();
    UI.syncCounters();
    nextLevel();
  }

  function nextLevel() {
    var id = State.level ? State.level.id + 1 : 1;
    UI.overlay('ov-complete', false);
    if (id > LEVELS.length) {
      UI.toast('50 bölümün hepsi bitti. Ters köşe ustası!');
      buildLevelGrid();
      UI.show('screen-levels');
      State.screen = 'LEVEL_SELECT';
      return;
    }
    if (!SaveManager.data.reduced) {
      sceneEl.classList.add('card-out');
      setTimeout(function () { sceneEl.classList.remove('card-out'); loadLevel(id); }, 200);
    } else loadLevel(id);
  }

  /* ---------------------------------------------------------
     13. Başarılar
  --------------------------------------------------------- */
  var ACHIEVEMENTS = [
    { id: 'first', title: 'İlk Ters Köşe', desc: 'İlk bölümü çöz.', icon: '🌟', bulbs: 1, test: function (d) { return d.completed.length >= 1; } },
    { id: 'l10', title: '10 Bölüm', desc: '10 bölüm tamamla.', icon: '🔟', bulbs: 2, test: function (d) { return d.completed.length >= 10; } },
    { id: 'l25', title: '25 Bölüm', desc: '25 bölüm tamamla.', icon: '🏅', bulbs: 3, test: function (d) { return d.completed.length >= 25; } },
    { id: 'l50', title: '50 Bölüm', desc: 'Tüm bölümleri tamamla.', icon: '👑', bulbs: 5, test: function (d) { return d.completed.length >= 50; } },
    { id: 'nohint5', title: 'İpucusuz 5', desc: 'Üst üste 5 bölümü ipucusuz çöz.', icon: '🧠', bulbs: 3, test: function (d) { return d.stats.noHintStreak >= 5; } },
    { id: 'firsttry10', title: 'İlk Denemede 10', desc: '10 bölümü hatasız çöz.', icon: '🎯', bulbs: 3, test: function (d) { return d.stats.firstTry >= 10; } },
    { id: 'hidden10', title: 'Gizli Nesne Avcısı', desc: '10 gizli nesne bölümü çöz.', icon: '🔍', bulbs: 2, test: function (d) { return d.stats.hidden >= 10; } },
    { id: 'sensor5', title: 'Sallayan El', desc: '5 sensör bölümü tamamla.', icon: '📳', bulbs: 2, test: function (d) { return d.stats.sensor >= 5; } },
    { id: 'wrong100', title: 'Israrcı', desc: '100 yanlış dokunma yap.', icon: '😅', bulbs: 2, test: function (d) { return d.stats.wrong >= 100; } }
  ];

  var Achievements = {
    check: function () {
      var d = SaveManager.data;
      var unlocked = [];
      ACHIEVEMENTS.forEach(function (a) {
        if (d.ach.indexOf(a.id) === -1 && a.test(d)) {
          d.ach.push(a.id);
          d.bulbs += a.bulbs;
          unlocked.push(a);
        }
      });
      if (unlocked.length) { SaveManager.save(); UI.syncCounters(); AudioManager.play('bulb'); }
      return unlocked;
    },
    render: function () {
      var host = doc.getElementById('achList');
      if (!host) return;
      var d = SaveManager.data;
      host.innerHTML = '';
      ACHIEVEMENTS.forEach(function (a) {
        var got = d.ach.indexOf(a.id) !== -1;
        var row = doc.createElement('div');
        row.className = 'ach' + (got ? ' unlocked' : '');
        row.innerHTML = '<span class="badge">' + a.icon + '</span><div><strong>' + a.title + '</strong><small>' + a.desc + ' · +' + a.bulbs + ' 💡</small></div>';
        host.appendChild(row);
      });
    }
  };

  /* ---------------------------------------------------------
     14. Günlük ödül
  --------------------------------------------------------- */
  var DAILY = [
    { label: '2 ampul', icon: '💡', bulbs: 2 },
    { label: '3 ampul', icon: '💡', bulbs: 3 },
    { label: '1 bilet', icon: '🎟️', tickets: 1 },
    { label: '4 ampul', icon: '💡', bulbs: 4 },
    { label: '2 bilet', icon: '🎟️', tickets: 2 },
    { label: '5 ampul', icon: '💡', bulbs: 5 },
    { label: 'Altın Mino', icon: '👑', bulbs: 3, skin: true }
  ];

  var Daily = {
    canClaim: function () { return SaveManager.data.daily.last !== todayKey(); },
    nextIndex: function () {
      var d = SaveManager.data.daily;
      if (!d.last) return 0;
      var gap = daysBetween(d.last, todayKey());
      if (gap === 0) return (d.day - 1 + 7) % 7;
      if (gap === 1) return d.day % 7;
      return 0;
    },
    render: function () {
      var host = doc.getElementById('dailyGrid');
      if (!host) return;
      host.innerHTML = '';
      var idx = Daily.nextIndex();
      DAILY.forEach(function (r, i) {
        var cell = doc.createElement('div');
        var claimed = !Daily.canClaim() && i === idx;
        cell.className = 'day' + (claimed ? ' claimed' : '') + (Daily.canClaim() && i === idx ? ' today' : '');
        cell.innerHTML = '<b>' + (i + 1) + '. gün</b><span class="gift">' + r.icon + '</span>' + r.label;
        host.appendChild(cell);
      });
      var btn = doc.getElementById('btnClaimDaily');
      btn.disabled = !Daily.canClaim();
      btn.textContent = Daily.canClaim() ? 'Ödülü al' : 'Yarın tekrar gel';
    },
    claim: function () {
      if (!Daily.canClaim()) { UI.toast('Bugünkü ödülü aldın.'); return; }
      var idx = Daily.nextIndex();
      var r = DAILY[idx];
      var d = SaveManager.data;
      if (r.bulbs) d.bulbs += r.bulbs;
      if (r.tickets) d.tickets = (d.tickets || 0) + r.tickets;
      d.daily.last = todayKey();
      d.daily.day = idx + 1;
      SaveManager.save();
      UI.syncCounters();
      AudioManager.play('bulb');
      UI.toast('Aldın: ' + r.label);
      Daily.render();
    }
  };

  /* ---------------------------------------------------------
     15. Bölüm seçme
  --------------------------------------------------------- */
  function buildLevelGrid() {
    var grid = doc.getElementById('levelGrid');
    if (!grid) return;
    grid.innerHTML = '';
    var d = SaveManager.data;
    LEVELS.forEach(function (l) {
      var b = doc.createElement('button');
      b.type = 'button';
      b.textContent = l.id;
      var done = d.completed.indexOf(l.id) !== -1;
      var locked = l.id > d.reached;
      b.className = 'lvl' + (done ? ' done' : '') + (locked ? ' locked' : '') + (l.id === d.reached && !done ? ' current' : '');
      b.setAttribute('aria-label', 'Bölüm ' + l.id + (locked ? ' (kilitli)' : done ? ' (tamamlandı)' : ''));
      if (locked) b.disabled = true;
      else on(b, 'click', function () { AudioManager.play('button'); loadLevel(l.id); });
      grid.appendChild(b);
    });
  }

  /* ---------------------------------------------------------
     16. Klavye kontrolü
  --------------------------------------------------------- */
  function onKeyDown(e) {
    if (State.screen !== 'PLAYING' || UI.anyOverlayOpen()) return;
    var a = currentAction();
    var focusEl = doc.activeElement;
    var focusId = focusEl && focusEl.getAttribute ? focusEl.getAttribute('data-obj-id') : null;

    if (e.key === 'Enter' || e.key === ' ') {
      if (!focusId) return;
      e.preventDefault();
      if (State.kbSelected && State.kbSelected !== focusId) {
        var solved = handleDrop(State.kbSelected, focusId, false, objs[State.kbSelected] && objs[State.kbSelected].el);
        if (!solved) wrong(focusEl);
        State.kbSelected = null;
        UI.bubble(null);
        return;
      }
      if (objs[focusId] && objs[focusId].drag && !State.kbSelected && a &&
          (a.action === 'dropOnTarget' || a.action === 'hideBehind') && a.sourceId === focusId) {
        State.kbSelected = focusId;
        UI.bubble('Seçildi. Hedefe Enter ile bırak.', 2600);
        return;
      }
      handleTap(focusId, focusEl);
      return;
    }
    if (e.key === 'Escape') { State.kbSelected = null; UI.bubble(null); return; }
    if (!a) return;
    var t = a.targetId;
    if ((e.key === '+' || e.key === '=') && t) { scaleObject(t, 1.18); }
    if ((e.key === '-' || e.key === '_') && t) { scaleObject(t, 1 / 1.18); }
    if ((e.key === 'r' || e.key === 'R') && t) { rotateObject(t, 30); }
    if (e.key === 's' || e.key === 'S') { handleGesture('shake', null, null); }
    if (e.key === 'ArrowLeft') { handleGesture('tilt', null, 'left'); }
    if (e.key === 'ArrowRight') { handleGesture('tilt', null, 'right'); }
  }

  /* ---------------------------------------------------------
     17. Debug paneli
  --------------------------------------------------------- */
  var Debug = {
    frames: 0, last: 0,
    init: function () {
      State.debug = /[?&]debug=1/.test(global.location.search);
      var panel = doc.getElementById('debugPanel');
      if (!panel) return;
      panel.hidden = !State.debug;
      if (!State.debug) return;

      on($('#dbgGo'), 'click', function () {
        var v = parseInt($('#dbgLevelInput').value, 10) || 1;
        loadLevel(clamp(v, 1, LEVELS.length));
      });
      on($('#dbgBulbs'), 'click', function () { SaveManager.addBulbs(10); });
      on($('#dbgSolve'), 'click', function () { while (State.stepIndex < State.steps.length - 1) { applyEffects(State.steps[State.stepIndex].then); State.stepIndex++; } levelSolved(); });
      on($('#dbgShow'), 'click', function () {
        var a = currentAction();
        UI.bubble(a ? JSON.stringify(a) : 'yok', 6000);
      });
      on($('#dbgHit'), 'click', function () {
        State.showHitbox = !State.showHitbox;
        doc.body.classList.toggle('hitbox-debug', State.showHitbox);
      });
      on($('#dbgShake'), 'click', function () { handleGesture('shake', null, null); });
      on($('#dbgTilt'), 'click', function () { handleGesture('tilt', null, 'right'); });
      on($('#dbgUnlock'), 'click', function () {
        SaveManager.data.reached = LEVELS.length; SaveManager.save(); buildLevelGrid(); UI.toast('Tüm bölümler açıldı.');
      });
      on($('#dbgReset'), 'click', function () { SaveManager.reset(); UI.syncCounters(); buildLevelGrid(); UI.toast('Kayıt sıfırlandı.'); });

      function tick(ts) {
        Debug.frames++;
        if (ts - Debug.last > 1000) {
          var el = $('#dbgFps');
          if (el) el.textContent = 'FPS: ' + Debug.frames;
          Debug.frames = 0; Debug.last = ts;
        }
        global.requestAnimationFrame(tick);
      }
      global.requestAnimationFrame(tick);
    },
    sync: function () {
      if (!State.debug) return;
      var el = $('#dbgState');
      if (el && State.level) el.textContent = 'B' + State.level.id + ' adım ' + (State.stepIndex + 1) + '/' + State.steps.length;
    }
  };

  /* ---------------------------------------------------------
     18. Ayarlar
  --------------------------------------------------------- */
  function applySettings() {
    var d = SaveManager.data;
    AudioManager.init({ sound: d.sound, music: d.music, vibrate: d.vibrate });
    doc.body.classList.toggle('reduced-motion', !!d.reduced);
    doc.body.classList.toggle('high-contrast', !!d.contrast);
    var map = { setSound: 'sound', setMusic: 'music', setVibrate: 'vibrate', setReduced: 'reduced', setContrast: 'contrast' };
    Object.keys(map).forEach(function (k) {
      var el = doc.getElementById(k);
      if (el) el.checked = !!d[map[k]];
    });
    if (d.music) AudioManager.startMusic(); else AudioManager.stopMusic();
    UI.syncCounters();
  }

  function bindSetting(elId, key) {
    var el = doc.getElementById(elId);
    on(el, 'change', function () {
      SaveManager.data[key] = el.checked;
      SaveManager.save();
      if (key === 'sound' || key === 'music' || key === 'vibrate') AudioManager.set(key, el.checked);
      if (key === 'reduced') doc.body.classList.toggle('reduced-motion', el.checked);
      if (key === 'contrast') doc.body.classList.toggle('high-contrast', el.checked);
      UI.syncCounters();
    });
  }

  /* ---------------------------------------------------------
     19. Başlangıç ve olay bağlama
  --------------------------------------------------------- */
  function bindHudObjects() {
    /* HUD düğmeleri de birer "nesne"dir: bazı bölümlerin çözümü buradadır */
    on(doc.getElementById('hud-level'), 'click', function () {
      if (State.screen === 'PLAYING' && !State.inputLocked) handleTap('hud-level', this);
    });
    on(doc.getElementById('hud-bulb'), 'click', function () {
      if (State.screen === 'PLAYING' && !State.inputLocked) handleTap('hud-bulb', this);
    });
    on(doc.getElementById('hud-sound'), 'click', function () {
      var d = SaveManager.data;
      d.sound = !d.sound;
      SaveManager.save();
      AudioManager.set('sound', d.sound);
      UI.syncCounters();
      applySettings();
      if (State.screen === 'PLAYING' && !State.inputLocked) handleTap('hud-sound', this);
      else UI.toast(d.sound ? 'Ses açık' : 'Ses kapalı');
    });
    on(doc.getElementById('hud-restart'), 'click', function () {
      AudioManager.play('button');
      if (State.level) loadLevel(State.level.id, true);
    });
    on(doc.getElementById('hud-pause'), 'click', function () {
      AudioManager.play('button');
      State.inputLocked = true;
      UI.overlay('ov-pause', true);
    });
  }

  function bindUI() {
    on(doc.getElementById('btnBootStart'), 'click', function () {
      AudioManager.unlockContext(); AudioManager.play('button');
      UI.show('screen-menu'); State.screen = 'MENU';
      if (Daily.canClaim()) UI.toast('Günlük ödülün hazır.');
    });
    on(doc.getElementById('btnPlay'), 'click', function () {
      AudioManager.play('button');
      loadLevel(SaveManager.data.reached);
    });
    on(doc.getElementById('btnLevels'), 'click', function () {
      AudioManager.play('button'); buildLevelGrid(); UI.show('screen-levels'); State.screen = 'LEVEL_SELECT';
    });
    on(doc.getElementById('btnLevelsBack'), 'click', function () {
      AudioManager.play('button'); UI.show('screen-menu'); State.screen = 'MENU';
    });
    on(doc.getElementById('btnDaily'), 'click', function () { AudioManager.play('button'); Daily.render(); UI.overlay('ov-daily', true); });
    on(doc.getElementById('btnClaimDaily'), 'click', function () { Daily.claim(); });
    on(doc.getElementById('btnDailyClose'), 'click', function () { UI.overlay('ov-daily', false); });
    on(doc.getElementById('btnAch'), 'click', function () { AudioManager.play('button'); Achievements.render(); UI.overlay('ov-ach', true); });
    on(doc.getElementById('btnAchClose'), 'click', function () { UI.overlay('ov-ach', false); });
    on(doc.getElementById('btnHowTo'), 'click', function () { AudioManager.play('button'); UI.overlay('ov-howto', true); });
    on(doc.getElementById('btnHowToClose'), 'click', function () { UI.overlay('ov-howto', false); });

    on(doc.getElementById('btnMenuSettings'), 'click', function () { AudioManager.play('button'); applySettings(); UI.overlay('ov-settings', true); });
    on(doc.getElementById('btnPauseSettings'), 'click', function () { applySettings(); UI.overlay('ov-settings', true); });
    on(doc.getElementById('btnSettingsClose'), 'click', function () {
      UI.overlay('ov-settings', false);
      if (State.screen === 'PLAYING' && !UI.anyOverlayOpen()) State.inputLocked = false;
    });
    on(doc.getElementById('btnSensorPerm'), 'click', function () { Sensors.request(); });
    on(doc.getElementById('btnResetProgress'), 'click', function () {
      if (global.confirm('Tüm ilerleme silinsin mi?')) {
        SaveManager.reset(); applySettings(); buildLevelGrid(); UI.toast('İlerleme sıfırlandı.');
        UI.overlay('ov-settings', false); UI.show('screen-menu'); State.screen = 'MENU';
      }
    });

    on(doc.getElementById('btnResume'), 'click', function () {
      UI.overlay('ov-pause', false); State.inputLocked = false; State.screen = 'PLAYING';
    });
    on(doc.getElementById('btnPauseRestart'), 'click', function () {
      UI.overlay('ov-pause', false); if (State.level) loadLevel(State.level.id, true);
    });
    on(doc.getElementById('btnPauseMenu'), 'click', function () {
      UI.overlay('ov-pause', false); UI.show('screen-menu'); State.screen = 'MENU'; UI.syncCounters();
    });

    on(doc.getElementById('btnNextLevel'), 'click', function () { AudioManager.play('button'); nextLevel(); });
    on(doc.getElementById('btnCompleteMenu'), 'click', function () {
      UI.overlay('ov-complete', false); UI.show('screen-menu'); State.screen = 'MENU'; UI.syncCounters();
    });

    on(doc.getElementById('btnHint'), 'click', function () { useHint(); });
    on(doc.getElementById('btnRetry'), 'click', function () { AudioManager.play('button'); if (State.level) loadLevel(State.level.id, true); });
    on(doc.getElementById('btnSkip'), 'click', function () { AudioManager.play('button'); skipLevel(); });

    ['setSound', 'setMusic', 'setVibrate', 'setReduced', 'setContrast'].forEach(function (id) {
      bindSetting(id, { setSound: 'sound', setMusic: 'music', setVibrate: 'vibrate', setReduced: 'reduced', setContrast: 'contrast' }[id]);
    });
  }

  function bindPointer() {
    var host = doc.getElementById('screen-game');
    on(sceneEl, 'pointerdown', pointerDown);
    on(doc.getElementById('questionCard'), 'pointerdown', pointerDown);
    on(global, 'pointermove', pointerMove, { passive: true });
    on(global, 'pointerup', pointerUp);
    on(global, 'pointercancel', function (e) {
      delete pointers[e.pointerId];
      pointerCount = Object.keys(pointers).length;
      cancelHold();
      if (drag) endDrag();
      if (gesture && pointerCount < 2) endGesture();
      candidate = null;
    });
    on(host, 'wheel', onWheel, { passive: false });
    on(doc, 'keydown', onKeyDown);
    /* Sayfanın kendi zoom/scroll davranışını engelle */
    on(doc, 'gesturestart', function (e) { e.preventDefault(); });
    on(doc, 'touchmove', function (e) { if (e.touches && e.touches.length > 1) e.preventDefault(); }, { passive: false });
    on(doc, 'dblclick', function (e) { e.preventDefault(); }, { passive: false });
  }

  function init() {
    sceneEl = doc.getElementById('scene');
    dragLayer = doc.getElementById('dragLayer');
    phoneEl = doc.getElementById('phone');

    SaveManager.load();
    applySettings();
    FX.init();
    UI.setMino('bootMino', 'idle');
    UI.setMino('menuMino', 'idle');
    UI.setMino('gameMino', 'idle');
    UI.setMino('completeMino', 'happy');
    UI.syncCounters();
    buildLevelGrid();
    bindUI();
    bindHudObjects();
    bindPointer();
    Debug.init();

    on(global, 'resize', function () { layoutObjects(); });
    on(global, 'orientationchange', function () { setTimeout(layoutObjects, 250); });
    on(doc, 'visibilitychange', function () {
      if (doc.hidden) {
        cancelHold();
        if (State.waitTimer) { clearInterval(State.waitTimer); State.waitTimer = null; }
        AudioManager.stopMusic();
      } else {
        if (State.screen === 'PLAYING') {
          var a = currentAction();
          if (a && a.action === 'wait') startWaitTimer(a.seconds || 5);
          if (SaveManager.data.music) AudioManager.startMusic();
        }
      }
    });

    if (State.debug) {
      var m = /[?&]level=(\d+)/.exec(global.location.search);
      if (m) { loadLevel(clamp(parseInt(m[1], 10), 1, LEVELS.length)); return; }
    }
    UI.show('screen-boot');
    State.screen = 'BOOT';
  }

  if (doc.readyState === 'loading') on(doc, 'DOMContentLoaded', init);
  else init();

  /* Test ve debug için sınırlı dışa açılım */
  global.ATK = {
    state: State, save: SaveManager, load: loadLevel, objs: function () { return objs; },
    tap: handleTap, drop: handleDrop, gesture: handleGesture, tapEmpty: handleTapEmpty,
    press: handleLongPress, hint: useHint, next: nextLevel,
    step: function () { return currentAction(); }, levels: LEVELS
  };
})(window);
