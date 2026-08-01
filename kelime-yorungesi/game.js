/* =========================================================
   Kelime Yörüngesi — game.js
   Tüm oyun akışı: harf yörüngesi, seçim, kelime kontrolü,
   ipuçları, ilerleme ve kayıt.
   ========================================================= */

(function () {
  'use strict';

  /* ---------------- ayarlar ---------------- */

  const CONFIG = {
    minWordLength: 3,
    slotOrder: 'length',            // 'length' | 'alpha' | 'level'
    hintCosts: { letter: 25, target: 40, word: 80 },
    startCoins: 120,
    coinPerLetter: 2,
    bonusCoin: 6,
    pointsPerLetter: 12,
    longWordBonus: 20,              // 5+ harfli kelimelere ek puan
    saveKey: 'ky_save_v2'
  };

  const CANVAS_FONT = 'ui-rounded, "SF Pro Rounded", Nunito, "Trebuchet MS", system-ui, sans-serif';

  const SCENE_EFFECT = {
    cicek: 'bir çiçek açtı',
    agac: 'bir ağaç büyüdü',
    ev: 'bir evin ışığı yandı',
    kopru: 'köprüye bir kemer eklendi',
    tekne: 'bir yelken açıldı',
    gol: 'göle bir nilüfer düştü',
    ruzgar: 'bir pervane dönmeye başladı',
    carkli: 'bir çark dönmeye başladı',
    sehir: 'bir bina aydınlandı',
    yildiz: 'gökyüzüne bir yıldız eklendi'
  };

  /* ---------------- kısa yardımcılar ---------------- */

  const $ = function (id) { return document.getElementById(id); };
  const clamp = function (v, a, b) { return v < a ? a : (v > b ? b : v); };
  const cmpTR = function (a, b) { return a.localeCompare(b, 'tr'); };
  const TAU = Math.PI * 2;

  /* ---------------- kayıt ---------------- */

  const Save = {
    data: { coins: CONFIG.startCoins, score: 0, unlocked: 1, seen: false, progress: {} },
    load: function () {
      try {
        const raw = localStorage.getItem(CONFIG.saveKey);
        if (raw) {
          const d = JSON.parse(raw);
          if (d && typeof d === 'object') Object.assign(this.data, d);
        }
      } catch (e) { }
      if (!this.data.progress) this.data.progress = {};
      return this.data;
    },
    write: function () {
      try { localStorage.setItem(CONFIG.saveKey, JSON.stringify(this.data)); } catch (e) { }
    },
    level: function (id) {
      if (!this.data.progress[id]) this.data.progress[id] = { words: [], bonus: [] };
      return this.data.progress[id];
    }
  };

  /* ---------------- durum ---------------- */

  const S = {
    li: 0,
    level: null,
    words: [],
    bonusPool: new Set(),
    found: new Set(),
    bonus: new Set(),
    revealed: {},
    letters: [],
    sel: [],
    pointer: null,
    dragging: false,
    status: 'idle',
    clearToken: 0,
    aiming: false,
    busy: false
  };

  const W = { cx: 0, cy: 0, ring: 0, tile: 26, size: 0 };

  /* ---------------- DOM ---------------- */

  let scene, slotsEl, bonusEl, bonusListEl, currentEl, canvas, ctx, toastEl, sheetEl,
    barEl, ribbonTextEl, lvNoEl, lvTitleEl, statCoinEl, statScoreEl, toolsEl;

  /* =========================================================
     BÖLÜM KURULUMU
     ========================================================= */

  function orderWords(level) {
    const ws = level.words.slice();
    if (CONFIG.slotOrder === 'length') {
      ws.sort(function (a, b) { return a.length - b.length || cmpTR(a, b); });
    } else if (CONFIG.slotOrder === 'alpha') {
      ws.sort(cmpTR);
    }
    return ws;
  }

  function buildBonusPool(level) {
    const pool = new Set();
    const main = new Set(level.words);
    KY_DICT.forEach(function (w) {
      if (w.length < CONFIG.minWordLength) return;
      if (main.has(w)) return;
      if (kyCanSpell(w, level.letters)) pool.add(w);
    });
    return pool;
  }

  function startLevel(index) {
    S.li = clamp(index, 0, KY_LEVELS.length - 1);
    S.level = KY_LEVELS[S.li];
    S.words = orderWords(S.level);
    S.bonusPool = buildBonusPool(S.level);
    S.revealed = {};
    S.sel = [];
    S.status = 'idle';
    S.aiming = false;
    S.busy = false;

    const rec = Save.level(S.level.id);
    S.found = new Set(rec.words.filter(function (w) { return S.words.indexOf(w) !== -1; }));
    S.bonus = new Set(rec.bonus || []);

    lvNoEl.textContent = 'Bölüm ' + String(S.level.id).padStart(2, '0');
    lvTitleEl.textContent = S.level.title;

    scene.innerHTML = KY_SCENES.build(S.level, S.words.length);
    renderSlots();
    renderBonus();
    buildLetters();
    layoutWheel();
    growWorld(S.found.size, true);
    updateRibbon();
    updateHud();
    updateCurrent();
    updateTools();
  }

  /* =========================================================
     KELİME YUVALARI
     ========================================================= */

  function renderSlots() {
    let html = '';
    for (let i = 0; i < S.words.length; i++) {
      html += '<div class="slot" data-i="' + i + '">';
      for (let k = 0; k < S.words[i].length; k++) html += '<span class="cell"></span>';
      html += '</div>';
    }
    slotsEl.innerHTML = html;
    for (let i = 0; i < S.words.length; i++) updateSlot(i);
  }

  function slotEl(i) { return slotsEl.querySelector('.slot[data-i="' + i + '"]'); }

  function updateSlot(i) {
    const el = slotEl(i);
    if (!el) return;
    const word = S.words[i];
    const isFound = S.found.has(word);
    el.classList.toggle('found', isFound);
    const cells = el.children;
    for (let k = 0; k < cells.length; k++) {
      const c = cells[k];
      if (isFound) {
        c.textContent = word[k];
        c.classList.remove('revealed');
      } else if (S.revealed[i] && S.revealed[i].has(k)) {
        c.textContent = word[k];
        c.classList.add('revealed');
      } else {
        c.textContent = '';
        c.classList.remove('revealed');
      }
    }
  }

  function renderBonus() {
    const list = Array.from(S.bonus);
    bonusEl.hidden = list.length === 0;
    bonusListEl.textContent = list.join(' · ');
  }

  /* =========================================================
     KÜÇÜK DÜNYA
     ========================================================= */

  function growWorld(count, silent) {
    const parts = scene.querySelectorAll('.kp');
    for (let i = 0; i < parts.length; i++) parts[i].classList.toggle('on', i < count);
    if (!silent) {
      scene.classList.remove('flash');
      void scene.offsetWidth;
      scene.classList.add('flash');
    }
  }

  function updateRibbon() {
    const total = S.words.length;
    const done = S.found.size;
    barEl.style.width = (total ? (done / total) * 100 : 0) + '%';
    if (done === 0) ribbonTextEl.textContent = S.level.hint;
    else if (done === total) ribbonTextEl.textContent = 'Dünyan tamam';
    else ribbonTextEl.textContent = done + '/' + total + ' kelime';
  }

  function updateHud() {
    statCoinEl.textContent = Save.data.coins;
    statScoreEl.textContent = Save.data.score;
  }

  /* =========================================================
     HARF YÖRÜNGESİ
     ========================================================= */

  function buildLetters() {
    const n = S.level.letters.length;
    S.letters = S.level.letters.map(function (ch, i) {
      const a = -Math.PI / 2 + (i * TAU) / n;
      return { ch: ch, ang: a, tAng: a, x: 0, y: 0, selected: false, order: -1 };
    });
  }

  function layoutWheel() {
    const size = Math.round(canvas.clientWidth);
    if (!size) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 3);
    canvas.width = Math.round(size * dpr);
    canvas.height = Math.round(size * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    W.size = size;
    W.cx = size / 2;
    W.cy = size / 2;
    W.ring = size * 0.345;
    const n = Math.max(3, S.letters.length);
    const arc = (TAU * W.ring) / n;
    W.tile = clamp(arc / 2 - 5, 17, size * 0.132);
    positionLetters();
  }

  function positionLetters() {
    for (const L of S.letters) {
      L.x = W.cx + W.ring * Math.cos(L.ang);
      L.y = W.cy + W.ring * Math.sin(L.ang);
    }
  }

  function shuffleLetters() {
    const n = S.letters.length;
    if (n < 2) return;
    const angles = S.letters.map(function (L) { return L.tAng; });
    let order, tries = 0;
    do {
      order = angles.slice();
      for (let i = order.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        const t = order[i]; order[i] = order[j]; order[j] = t;
      }
      tries++;
    } while (tries < 12 && order.every(function (a, i) { return a === angles[i]; }));

    for (let i = 0; i < n; i++) {
      let target = order[i];
      // en kısa yoldan dönsün
      while (target - S.letters[i].ang > Math.PI) target -= TAU;
      while (target - S.letters[i].ang < -Math.PI) target += TAU;
      S.letters[i].tAng = target;
    }
    cancelSelection();
    KY_AUDIO.play('shuffle');
  }

  /* ---------------- çizim ---------------- */

  function statusColor() {
    if (S.status === 'ok') return '#6BE3B0';
    if (S.status === 'bad') return '#FF7A8A';
    if (S.status === 'dup') return '#FFB86B';
    return '#FFD9A0';
  }

  function draw() {
    if (!W.size) return;
    ctx.clearRect(0, 0, W.size, W.size);

    // yörünge halkası
    ctx.save();
    ctx.setLineDash([2, 9]);
    ctx.lineWidth = 1.4;
    ctx.strokeStyle = 'rgba(255,217,160,0.30)';
    ctx.beginPath();
    ctx.arc(W.cx, W.cy, W.ring, 0, TAU);
    ctx.stroke();
    ctx.restore();

    ctx.save();
    ctx.lineWidth = 1;
    ctx.strokeStyle = 'rgba(255,255,255,0.07)';
    ctx.beginPath();
    ctx.arc(W.cx, W.cy, W.ring * 0.42, 0, TAU);
    ctx.stroke();
    ctx.restore();

    drawTrail();
    for (const L of S.letters) drawTile(L);
  }

  function drawTrail() {
    if (!S.sel.length) return;
    const col = statusColor();
    const pts = S.sel.map(function (i) { return S.letters[i]; });

    ctx.save();
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.shadowColor = col;
    ctx.shadowBlur = 16;
    ctx.strokeStyle = col;
    ctx.globalAlpha = 0.9;
    ctx.lineWidth = Math.max(4, W.tile * 0.32);

    ctx.beginPath();
    ctx.moveTo(pts[0].x, pts[0].y);
    for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
    if (S.dragging && S.pointer) ctx.lineTo(S.pointer.x, S.pointer.y);
    ctx.stroke();

    if (S.dragging && S.pointer) {
      ctx.globalAlpha = 0.85;
      ctx.fillStyle = col;
      ctx.beginPath();
      ctx.arc(S.pointer.x, S.pointer.y, Math.max(3, W.tile * 0.16), 0, TAU);
      ctx.fill();
    }
    ctx.restore();
  }

  function drawTile(L) {
    const sel = L.selected;
    const r = W.tile * (sel ? 1.1 : 1);
    const col = statusColor();

    ctx.save();
    if (sel) { ctx.shadowColor = col; ctx.shadowBlur = 18; }

    const g = ctx.createLinearGradient(L.x, L.y - r, L.x, L.y + r);
    if (sel) {
      g.addColorStop(0, col);
      g.addColorStop(1, shade(col, -0.28));
    } else {
      g.addColorStop(0, 'rgba(255,255,255,0.16)');
      g.addColorStop(1, 'rgba(255,255,255,0.055)');
    }
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(L.x, L.y, r, 0, TAU);
    ctx.fill();
    ctx.restore();

    ctx.save();
    ctx.lineWidth = 1.2;
    ctx.strokeStyle = sel ? 'rgba(255,255,255,0.55)' : 'rgba(255,255,255,0.20)';
    ctx.beginPath();
    ctx.arc(L.x, L.y, r, 0, TAU);
    ctx.stroke();
    ctx.restore();

    ctx.save();
    ctx.fillStyle = sel ? '#141A38' : '#EDF1FF';
    ctx.font = '800 ' + (r * 1.02).toFixed(1) + 'px ' + CANVAS_FONT;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(L.ch, L.x, L.y + r * 0.05);
    ctx.restore();
  }

  function shade(hex, amt) {
    const m = /^#([0-9a-f]{6})$/i.exec(hex);
    if (!m) return hex;
    const n = parseInt(m[1], 16);
    const c = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map(function (v) {
      return clamp(Math.round(v + 255 * amt), 0, 255);
    });
    return 'rgb(' + c.join(',') + ')';
  }

  /* ---------------- animasyon döngüsü ---------------- */

  let raf = 0;
  function loop() {
    let moving = false;
    for (const L of S.letters) {
      const d = L.tAng - L.ang;
      if (Math.abs(d) > 0.0009) { L.ang += d * 0.17; moving = true; }
      else L.ang = L.tAng;
    }
    if (moving) positionLetters();
    draw();
    raf = requestAnimationFrame(loop);
  }

  /* =========================================================
     GİRDİ (pointer)
     ========================================================= */

  function pointAt(e) {
    const rect = canvas.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }

  function letterAt(p) {
    let best = -1, bestD = Infinity;
    for (let i = 0; i < S.letters.length; i++) {
      const L = S.letters[i];
      const d = Math.hypot(p.x - L.x, p.y - L.y);
      if (d < W.tile * 0.95 && d < bestD) { bestD = d; best = i; }
    }
    return best;
  }

  function pick(i) {
    if (i < 0) return;
    const L = S.letters[i];
    if (L.selected) {
      // geri sarma: bir önceki harfe dönülürse son harf bırakılır
      if (S.sel.length >= 2 && S.sel[S.sel.length - 2] === i) {
        const last = S.sel.pop();
        S.letters[last].selected = false;
        S.letters[last].order = -1;
        updateCurrent();
      }
      return;
    }
    L.selected = true;
    L.order = S.sel.length;
    S.sel.push(i);
    KY_AUDIO.play('tap', S.sel.length - 1);
    updateCurrent();
  }

  function currentWord() {
    return S.sel.map(function (i) { return S.letters[i].ch; }).join('');
  }

  function updateCurrent() {
    const w = currentWord();
    currentEl.textContent = w;
    currentEl.classList.toggle('show', w.length > 0);
    currentEl.classList.toggle('ok', S.status === 'ok');
    currentEl.classList.toggle('bad', S.status === 'bad');
    currentEl.classList.toggle('dup', S.status === 'dup');
  }

  function cancelSelection() {
    S.clearToken++;
    for (const L of S.letters) { L.selected = false; L.order = -1; }
    S.sel = [];
    S.status = 'idle';
    S.dragging = false;
    S.pointer = null;
    updateCurrent();
  }

  function releaseAfter(status, delay) {
    S.status = status;
    updateCurrent();
    const token = ++S.clearToken;
    setTimeout(function () {
      if (token !== S.clearToken) return;
      for (const L of S.letters) { L.selected = false; L.order = -1; }
      S.sel = [];
      S.status = 'idle';
      updateCurrent();
    }, delay);
  }

  function onDown(e) {
    if (S.busy) return;
    e.preventDefault();
    KY_AUDIO.unlock();
    S.clearToken++;
    for (const L of S.letters) { L.selected = false; L.order = -1; }
    S.sel = [];
    S.status = 'idle';
    S.dragging = true;
    const p = pointAt(e);
    S.pointer = p;
    try { canvas.setPointerCapture(e.pointerId); } catch (err) { }
    pick(letterAt(p));
    updateCurrent();
  }

  function onMove(e) {
    if (!S.dragging) return;
    e.preventDefault();
    S.pointer = pointAt(e);
    pick(letterAt(S.pointer));
  }

  function onUp(e) {
    if (!S.dragging) return;
    if (e) e.preventDefault();
    S.dragging = false;
    S.pointer = null;
    submit();
  }

  /* =========================================================
     KELİME KONTROLÜ
     ========================================================= */

  function submit() {
    const w = currentWord();

    if (w.length < CONFIG.minWordLength) { cancelSelection(); return; }

    if (S.found.has(w) || S.bonus.has(w)) {
      KY_AUDIO.play('dupe');
      toast('Bu kelimeyi zaten buldun', 'warn');
      const i = S.words.indexOf(w);
      if (i !== -1) bounceSlot(i);
      releaseAfter('dup', 420);
      return;
    }

    if (S.words.indexOf(w) !== -1) { onCorrect(w); releaseAfter('ok', 380); return; }

    if (S.bonusPool.has(w)) { onBonus(w); releaseAfter('ok', 380); return; }

    KY_AUDIO.play('wrong');
    releaseAfter('bad', 340);
  }

  function bounceSlot(i) {
    const el = slotEl(i);
    if (!el) return;
    el.classList.remove('bounce');
    void el.offsetWidth;
    el.classList.add('bounce');
  }

  function onCorrect(word) {
    S.found.add(word);
    const i = S.words.indexOf(word);
    updateSlot(i);

    const pts = word.length * CONFIG.pointsPerLetter + (word.length >= 5 ? CONFIG.longWordBonus : 0);
    Save.data.score += pts;
    Save.data.coins += word.length * CONFIG.coinPerLetter;

    const rec = Save.level(S.level.id);
    if (rec.words.indexOf(word) === -1) rec.words.push(word);
    Save.write();

    KY_AUDIO.play('correct');
    growWorld(S.found.size);
    updateHud();
    updateRibbon();
    updateTools();

    if (S.found.size === S.words.length) {
      S.busy = true;
      setTimeout(levelComplete, 850);
    }
  }

  function onBonus(word) {
    S.bonus.add(word);
    Save.data.coins += CONFIG.bonusCoin;
    Save.data.score += word.length * 4;
    const rec = Save.level(S.level.id);
    if (rec.bonus.indexOf(word) === -1) rec.bonus.push(word);
    Save.write();

    KY_AUDIO.play('bonus');
    renderBonus();
    updateHud();
    updateTools();
    toast('Bonus kelime: ' + word + '  +' + CONFIG.bonusCoin, 'good');
  }

  /* =========================================================
     İPUÇLARI
     ========================================================= */

  function unfoundIndices() {
    const out = [];
    for (let i = 0; i < S.words.length; i++) if (!S.found.has(S.words[i])) out.push(i);
    return out;
  }

  function hiddenCells(i) {
    const out = [];
    const set = S.revealed[i];
    for (let k = 0; k < S.words[i].length; k++) if (!set || !set.has(k)) out.push(k);
    return out;
  }

  function pay(kind) {
    const cost = CONFIG.hintCosts[kind];
    if (Save.data.coins < cost) {
      toast('Yıldız tozun yetmiyor. Bonus kelime bul, kazan.', 'warn');
      return false;
    }
    Save.data.coins -= cost;
    Save.write();
    updateHud();
    updateTools();
    return true;
  }

  function revealCell(i, k) {
    if (!S.revealed[i]) S.revealed[i] = new Set();
    S.revealed[i].add(k);
    updateSlot(i);
    KY_AUDIO.play('hint');
    if (hiddenCells(i).length === 0) revealWholeWord(i, true);
  }

  function revealWholeWord(i, quiet) {
    const word = S.words[i];
    if (S.found.has(word)) return;
    S.found.add(word);
    updateSlot(i);
    const rec = Save.level(S.level.id);
    if (rec.words.indexOf(word) === -1) rec.words.push(word);
    Save.write();
    if (!quiet) KY_AUDIO.play('correct');
    growWorld(S.found.size);
    updateRibbon();
    if (S.found.size === S.words.length) { S.busy = true; setTimeout(levelComplete, 850); }
  }

  function hintRandomLetter() {
    const cand = unfoundIndices().filter(function (i) { return hiddenCells(i).length > 0; });
    if (!cand.length) { toast('Açılacak harf kalmadı', 'warn'); return; }
    if (!pay('letter')) return;
    const i = cand[Math.floor(Math.random() * cand.length)];
    const cells = hiddenCells(i);
    revealCell(i, cells[Math.floor(Math.random() * cells.length)]);
  }

  function hintWholeWord() {
    const cand = unfoundIndices();
    if (!cand.length) { toast('Tüm kelimeler bulundu', 'warn'); return; }
    if (!pay('word')) return;
    const i = cand[Math.floor(Math.random() * cand.length)];
    if (!S.revealed[i]) S.revealed[i] = new Set();
    for (let k = 0; k < S.words[i].length; k++) S.revealed[i].add(k);
    KY_AUDIO.play('hint');
    revealWholeWord(i);
  }

  function armTargetHint() {
    if (S.aiming) { disarmTargetHint(); return; }
    const cand = unfoundIndices().filter(function (i) { return hiddenCells(i).length > 0; });
    if (!cand.length) { toast('Açılacak harf kalmadı', 'warn'); return; }
    if (Save.data.coins < CONFIG.hintCosts.target) {
      toast('Yıldız tozun yetmiyor. Bonus kelime bul, kazan.', 'warn');
      return;
    }
    S.aiming = true;
    for (const i of cand) { const el = slotEl(i); if (el) el.classList.add('aim'); }
    toolsEl.querySelector('[data-hint="target"]').classList.add('armed');
    toast('Işık tutmak istediğin kelimeye dokun', 'warn');
  }

  function disarmTargetHint() {
    S.aiming = false;
    const aimed = slotsEl.querySelectorAll('.slot.aim');
    for (let i = 0; i < aimed.length; i++) aimed[i].classList.remove('aim');
    toolsEl.querySelector('[data-hint="target"]').classList.remove('armed');
  }

  function updateTools() {
    const btns = toolsEl.querySelectorAll('.tool');
    for (let i = 0; i < btns.length; i++) {
      const kind = btns[i].getAttribute('data-hint');
      btns[i].disabled = Save.data.coins < CONFIG.hintCosts[kind];
    }
  }

  /* =========================================================
     BÖLÜM SONU + EKRANLAR
     ========================================================= */

  function levelComplete() {
    KY_AUDIO.play('complete');
    const next = S.li + 1;
    if (next + 1 > Save.data.unlocked) Save.data.unlocked = Math.min(next + 1, KY_LEVELS.length);
    Save.data.seen = true;
    Save.write();

    const last = next >= KY_LEVELS.length;
    openSheet(
      '<span class="kicker">Bölüm ' + String(S.level.id).padStart(2, '0') + ' tamam</span>' +
      '<h2>' + S.level.title + ' canlandı</h2>' +
      '<p>' + S.words.length + ' kelime, ' + S.words.length + ' küçük değişiklik.</p>' +
      '<div class="tally">' +
      '<div><b>' + S.words.length + '</b><span>Kelime</span></div>' +
      '<div><b>' + S.bonus.size + '</b><span>Bonus</span></div>' +
      '<div><b>' + Save.data.score + '</b><span>Puan</span></div>' +
      '</div>' +
      (last
        ? '<p>Tüm bölümleri bitirdin. Yeni dünyalar yolda.</p><button class="btn" data-act="levels">Bölümlere dön</button>'
        : '<button class="btn" data-act="next">Sonraki bölüm</button>' +
        '<button class="btn btn--ghost" data-act="levels">Bölümler</button>')
    );
  }

  function openSheet(html) {
    sheetEl.innerHTML = '<div class="card">' + html + '</div>';
    sheetEl.hidden = false;
  }

  function closeSheet() {
    sheetEl.hidden = true;
    sheetEl.innerHTML = '';
    S.busy = false;
  }

  function homeSheet() {
    const cont = Save.data.unlocked > 1 || Object.keys(Save.data.progress).length > 0;
    openSheet(
      '<span class="kicker">Türkçe kelime bulmacası</span>' +
      '<p class="brand">Kelime<br>Yörüngesi</p>' +
      '<p>Harfleri parmağınla birleştir, kelimeyi kur. Bulduğun her kelime bölümün küçük dünyasında bir şeyi canlandırır.</p>' +
      '<button class="btn" data-act="play">' + (cont ? 'Devam et' : 'Başla') + '</button>' +
      '<button class="btn btn--ghost" data-act="levels">Bölümler</button>' +
      '<p class="foot">Reklamsız, üyeliksiz, internetsiz oynanır.<br>İlerlemen bu cihazda saklanır.</p>'
    );
  }

  function levelsSheet() {
    let g = '<div class="lvgrid">';
    for (let i = 0; i < KY_LEVELS.length; i++) {
      const lv = KY_LEVELS[i];
      const rec = Save.data.progress[lv.id];
      const done = rec ? rec.words.length : 0;
      const locked = i + 1 > Save.data.unlocked;
      g += '<button data-act="go" data-i="' + i + '"' + (locked ? ' disabled' : '') +
        (done >= lv.words.length ? ' class="done"' : '') + '>' +
        '<span class="n">' + String(lv.id).padStart(2, '0') + '</span>' +
        '<span class="t">' + (locked ? 'Kilitli' : lv.title) + '</span>' +
        '<span class="d">' + (locked ? '' : done + '/' + lv.words.length) + '</span>' +
        '</button>';
    }
    g += '</div>';
    openSheet(
      '<span class="kicker">Yörüngeler</span>' +
      '<h2>Bölümler</h2>' + g +
      '<button class="btn btn--ghost" data-act="close">Kapat</button>'
    );
  }

  /* =========================================================
     BİLDİRİM
     ========================================================= */

  let toastTimer = 0;
  function toast(msg, kind) {
    toastEl.textContent = msg;
    toastEl.className = 'toast show' + (kind ? ' ' + kind : '');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.className = 'toast'; }, 1700);
  }

  /* =========================================================
     BAĞLAMA
     ========================================================= */

  function bind() {
    canvas.addEventListener('pointerdown', onDown);
    canvas.addEventListener('pointermove', onMove);
    canvas.addEventListener('pointerup', onUp);
    canvas.addEventListener('pointercancel', function () { cancelSelection(); });
    canvas.addEventListener('contextmenu', function (e) { e.preventDefault(); });

    $('btnShuffle').addEventListener('click', function () { KY_AUDIO.unlock(); shuffleLetters(); });

    $('btnMenu').addEventListener('click', function () { levelsSheet(); });

    const sound = $('btnSound');
    sound.classList.toggle('is-off', KY_AUDIO.isMuted());
    sound.addEventListener('click', function () {
      const muted = KY_AUDIO.toggle();
      sound.classList.toggle('is-off', muted);
      toast(muted ? 'Ses kapalı' : 'Ses açık');
    });

    toolsEl.addEventListener('click', function (e) {
      const btn = e.target.closest('.tool');
      if (!btn || btn.disabled) return;
      KY_AUDIO.unlock();
      const kind = btn.getAttribute('data-hint');
      if (kind !== 'target' && S.aiming) disarmTargetHint();
      if (kind === 'letter') hintRandomLetter();
      else if (kind === 'word') hintWholeWord();
      else if (kind === 'target') armTargetHint();
    });

    slotsEl.addEventListener('click', function (e) {
      const el = e.target.closest('.slot');
      if (!el) return;
      const i = parseInt(el.getAttribute('data-i'), 10);
      if (S.aiming && el.classList.contains('aim')) {
        const cells = hiddenCells(i);
        if (!cells.length) return;
        if (!pay('target')) { disarmTargetHint(); return; }
        disarmTargetHint();
        revealCell(i, cells[0]);
        return;
      }
      if (S.found.has(S.words[i])) {
        bounceSlot(i);
        KY_AUDIO.play('tap', 3);
        toast(S.words[i] + ' · ' + (SCENE_EFFECT[S.level.scene] || 'dünyanı büyüttü'), 'good');
      }
    });

    sheetEl.addEventListener('click', function (e) {
      const btn = e.target.closest('[data-act]');
      if (!btn) {
        if (e.target === sheetEl && sheetEl.querySelector('[data-act="close"]')) closeSheet();
        return;
      }
      KY_AUDIO.unlock();
      const act = btn.getAttribute('data-act');
      if (act === 'play') { closeSheet(); startLevel(Math.min(Save.data.unlocked - 1, KY_LEVELS.length - 1)); }
      else if (act === 'levels') levelsSheet();
      else if (act === 'close') closeSheet();
      else if (act === 'next') { closeSheet(); startLevel(S.li + 1); }
      else if (act === 'go') { closeSheet(); startLevel(parseInt(btn.getAttribute('data-i'), 10)); }
    });

    // sayfa kaydırmasını oyun alanında engelle
    document.addEventListener('touchmove', function (e) {
      if (e.target === canvas) e.preventDefault();
    }, { passive: false });

    if (window.ResizeObserver) {
      new ResizeObserver(function () { layoutWheel(); }).observe(canvas.parentElement);
    } else {
      window.addEventListener('resize', layoutWheel);
    }

    document.addEventListener('visibilitychange', function () {
      if (document.hidden) { cancelAnimationFrame(raf); raf = 0; }
      else if (!raf) loop();
    });
  }

  /* =========================================================
     BAŞLANGIÇ
     ========================================================= */

  function init() {
    scene = $('scene');
    slotsEl = $('slots');
    bonusEl = $('bonus');
    bonusListEl = $('bonusList');
    currentEl = $('current');
    canvas = $('wheel');
    ctx = canvas.getContext('2d');
    toastEl = $('toast');
    sheetEl = $('sheet');
    barEl = $('bar');
    ribbonTextEl = $('ribbonText');
    lvNoEl = $('lvNo');
    lvTitleEl = $('lvTitle');
    statCoinEl = $('statCoin');
    statScoreEl = $('statScore');
    toolsEl = $('tools');

    Save.load();
    const costs = document.querySelectorAll('[data-cost]');
    for (let i = 0; i < costs.length; i++) {
      costs[i].textContent = CONFIG.hintCosts[costs[i].getAttribute('data-cost')];
    }

    bind();
    startLevel(Math.min(Save.data.unlocked - 1, KY_LEVELS.length - 1));
    homeSheet();
    loop();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();

  // geliştirme kolaylığı: konsoldan erişim
  window.KY = { CONFIG: CONFIG, S: S, start: startLevel, save: Save };
})();
