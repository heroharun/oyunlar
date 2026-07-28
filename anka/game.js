/* ============================================================================
   MİT: ANKA PROTOKOLÜ — Oyun motoru
   Saf HTML/CSS/JS. Kütüphane yok, backend yok, internet gerekmez.
   İçerik riddles.js dosyasındadır; bu dosya yalnızca mekaniği yürütür.
   ========================================================================== */

'use strict';

/* ── Ayarlanabilir sabitler ─────────────────────────────────────────────── */
const DEV_MODE       = false;   // true yapınca sağ altta geliştirici paneli çıkar
const GAME_DURATION  = 20 * 60; // saniye — test için 300 yapabilirsin
const FINAL_SECONDS  = 30;      // vericiyi susturmak için son sayaç
const FREQ_CODE      = ['19', '23', '07'];
const STORAGE_KEY    = 'anka-protokolu-v1';

const HINT_COST  = [50, 100, 200];
const ALARM_COST = { obje: 5, kod: 15, suphe: 30 };

/* ── Kısayollar ─────────────────────────────────────────────────────────── */
const $  = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
const esc = (s) => String(s).replace(/[&<>"']/g, (c) =>
  ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

/* ── Kalıcı kayıt (localStorage) ────────────────────────────────────────── */
const Save = {
  read() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const d = raw ? JSON.parse(raw) : null;
      return {
        codeName: (d && typeof d.codeName === 'string') ? d.codeName : '',
        best:     (d && Number.isFinite(d.best)) ? d.best : 0,
        sound:    (d && typeof d.sound === 'boolean') ? d.sound : true,
        achievements: (d && Array.isArray(d.achievements)) ? d.achievements : []
      };
    } catch (e) {
      return { codeName: '', best: 0, sound: true, achievements: [] };
    }
  },
  write(patch) {
    try {
      const next = Object.assign(Save.read(), patch);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch (e) { /* depolama kapalıysa oyun yine de oynanır */ }
  }
};

/* ── Ses (Web Audio ile üretilir, harici dosya yok) ─────────────────────── */
const Sfx = {
  ctx: null,
  on: true,
  init() {
    if (this.ctx || !window.AudioContext && !window.webkitAudioContext) return;
    try { this.ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { this.ctx = null; }
  },
  tone(freq, dur, type = 'sine', vol = 0.05) {
    if (!this.on || !this.ctx) return;
    if (this.ctx.state === 'suspended') this.ctx.resume();
    const t = this.ctx.currentTime;
    const o = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    o.type = type; o.frequency.setValueAtTime(freq, t);
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(this.ctx.destination);
    o.start(t); o.stop(t + dur);
  },
  click()  { this.tone(320, 0.05, 'square', 0.03); },
  good()   { this.tone(520, 0.09); setTimeout(() => this.tone(780, 0.14), 90); },
  bad()    { this.tone(150, 0.18, 'sawtooth', 0.04); },
  found()  { this.tone(660, 0.07); setTimeout(() => this.tone(880, 0.1), 70); },
  alarm()  { this.tone(220, 0.25, 'square', 0.035); },
  static() { this.tone(90, 0.3, 'sawtooth', 0.03); },
  win()    { [523, 659, 784, 1046].forEach((f, i) => setTimeout(() => this.tone(f, 0.2), i * 130)); }
};

/* ── Oyun durumu ────────────────────────────────────────────────────────── */
let S = null;
let ticker = null;
let finalTicker = null;

function freshState() {
  return {
    codeName: '',
    score: 0,
    time: GAME_DURATION,
    alarm: 0,
    room: 'analiz',
    inventory: [],
    evidence: [],
    codes: {},
    flags: {},
    solved: [],
    log: [],
    hintsUsed: 0,
    hintLevel: {},
    wrongObjects: 0,
    wrongCodes: 0,
    wrongBeforeFirst: 0,
    freqNoHint: false,
    selectedItem: null,
    accuseRetryUsed: false,
    finalTries: 0,
    running: false,
    ended: false
  };
}

/* ============================================================================
   1 — EKRAN YÖNETİMİ
   ========================================================================== */
function showScreen(id) {
  $$('.screen').forEach((s) => s.classList.toggle('is-active', s.id === id));
}

function toast(msg, kind = '') {
  const box = $('#toasts');
  const el = document.createElement('div');
  el.className = 'toast ' + kind;
  el.textContent = msg;
  box.appendChild(el);
  setTimeout(() => el.remove(), 3400);
}

function note(text) { $('#stageNote').textContent = text || ''; }

function openModal(title, html) {
  $('#modalTitle').textContent = title;
  $('#modalBody').innerHTML = html;
  $('#modalLayer').hidden = false;
  const first = $('#modalBody button, #modalBody input');
  if (first) first.focus(); else $('#modalLayer .icon-btn').focus();
}
function closeModal() {
  $('#modalLayer').hidden = true;
  $('#modalBody').innerHTML = '';
}
const modalOpen = () => !$('#modalLayer').hidden;

function logEntry(text) {
  const used = GAME_DURATION - S.time;
  const t = `${String(Math.floor(used / 60)).padStart(2, '0')}:${String(used % 60).padStart(2, '0')}`;
  S.log.push({ t, text });
}

/* ============================================================================
   2 — PUAN, ALARM, SÜRE
   ========================================================================== */
function addScore(n, reason) {
  S.score = Math.max(0, S.score + n);
  if (reason) toast(`${n > 0 ? '+' : ''}${n} · ${reason}`, n > 0 ? 'good' : 'bad');
  renderHud();
}

function addAlarm(n) {
  S.alarm = Math.min(100, Math.max(0, S.alarm + n));
  if (n > 0) Sfx.alarm();
  renderHud();
  if (S.alarm >= 100 && !S.ended) endGame('sizdi');
}

function renderHud() {
  const m = Math.floor(S.time / 60), s = S.time % 60;
  const tEl = $('#hudTime');
  tEl.textContent = `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  tEl.classList.toggle('warn', S.time <= 180);
  $('#hudScore').textContent = S.score;
  $('#hudAlarm').textContent = S.alarm;
  $('#alarmFill').style.width = S.alarm + '%';
  $('#hudAgent').textContent = S.codeName;
  $('#evCount').textContent = S.evidence.length;

  const v = $('#alarmVignette');
  v.className = 'vignette' + (S.alarm >= 85 ? ' lvl3' : S.alarm >= 60 ? ' lvl2' : S.alarm >= 30 ? ' lvl1' : '');
}

function startTimer() {
  clearInterval(ticker);
  S.running = true;
  ticker = setInterval(() => {
    if (!S.running || S.ended) return;
    S.time--;
    renderHud();
    if (S.time <= 0) { S.time = 0; endGame('sizdi'); }
  }, 1000);
}

/* ============================================================================
   3 — BİLMECE AKIŞI
   ========================================================================== */
function activeRiddle() {
  return RIDDLES.find((r) => !S.solved.includes(r.id) && (!r.need || S.flags[r.need])) || null;
}

function findObj(id) {
  for (const key of ROOM_ORDER) {
    const o = ROOMS[key].objects.find((x) => x.id === id);
    if (o) return Object.assign({ room: key }, o);
  }
  return null;
}

function solvedRiddleFor(objId) {
  return RIDDLES.find((r) => r.answerObjectId === objId && S.solved.includes(r.id)) || null;
}

/* Bilmece dışı, sırayla yapılması gereken işler için yönlendirme metni */
function currentObjective() {
  const F = S.flags;
  if (F.kitap_ok && !F.cekmece_ok)
    return { room: 'analiz', where: 'ANALİZ ODASI', text: 'Kitaptan çıkan anahtarı envanterden seç ve kilitli çekmecede kullan.' };
  if (F.cekmece_ok && !F.not_ok)
    return { room: 'analiz', where: 'ANALİZ ODASI', text: 'Çekmecedeki not dört parçaya ayrılmış. Parçaları doğru sıraya diz.' };
  if (F.fener_ok && !F.guv_ok)
    return { room: 'guvenlik', where: 'GÜVENLİK OFİSİ', text: 'Personel kartlarını, kapı kayıtlarını ve kamera görüntüsünü incele. Üçüncü kod, kayıt defterinin 7. sayfasında.' };
  if (F.guv_ok && !F.radyo_ok)
    return { room: 'haberlesme', where: 'HABERLEŞME ODASI', text: 'Radyonun pil yuvası boş. Kablo kutusuna bak, pili radyoda kullan.' };
  if (F.radyo_ok && !F.freq_ok)
    return { room: 'haberlesme', where: 'HABERLEŞME ODASI', text: `Frekans paneline üç kodu gir. Şu ana kadar bulduklarımız: ${Object.values(S.codes).join('-') || '—'}` };
  if (F.freq_ok && !F.isik_ok)
    return { room: 'haberlesme', where: 'HABERLEŞME ODASI', text: 'Radyo bir ışık dizisi yayınlıyor. Frekans panelini tekrar aç ve diziyi eşleştir.' };
  if (F.isik_ok && !F.suclama_ok)
    return { room: null, where: 'SUÇLAMA', text: 'Kanıtlar yeterli. Alttaki “Suçlama” düğmesiyle köstebeği ve gerekçeni bildir.' };
  if (F.hoparlor_ok && !S.ended)
    return { room: 'haberlesme', where: 'SON GÖREV', text: 'Verici hoparlörün arkasında. Hoparlöre tıkla ve aktarımı durdur.' };
  return null;
}

function renderRiddle() {
  const r = activeRiddle();
  const strip = $('#riddleStrip');
  const btn = $('#btnHint');

  if (r) {
    $('#riddleWhere').textContent = ROOMS[r.room].ad.toUpperCase();
    $('#riddleText').textContent = r.question;
    btn.hidden = false;
    btn.disabled = (S.hintLevel[r.id] || 0) >= 3;
    btn.textContent = (S.hintLevel[r.id] || 0) >= 3 ? 'İpucu bitti' : `İpucu (${3 - (S.hintLevel[r.id] || 0)})`;
    strip.hidden = false;
    return;
  }
  const obj = currentObjective();
  if (obj) {
    $('#riddleWhere').textContent = obj.where;
    $('#riddleText').textContent = obj.text;
    btn.hidden = true;
    strip.hidden = false;
    return;
  }
  strip.hidden = true;
}

function useHint() {
  const r = activeRiddle();
  if (!r) return;
  const lvl = (S.hintLevel[r.id] || 0);
  if (lvl >= 3) return;
  const text = [r.hint1, r.hint2, r.hint3][lvl];
  S.hintLevel[r.id] = lvl + 1;
  S.hintsUsed++;
  addScore(-HINT_COST[lvl], `${lvl + 1}. ipucu`);
  logEntry(`İpucu kullanıldı (${r.id}, seviye ${lvl + 1}): ${text}`);
  openModal(`İpucu ${lvl + 1}/3`, `<p>${esc(text)}</p>
    <div class="btn-row"><button class="btn" data-act="close-modal">Kapat</button></div>`);
  renderRiddle();
}

function solveRiddle(r) {
  S.solved.push(r.id);
  r.completed = true;
  if (r.gives) S.flags[r.gives] = true;
  addScore(r.reward, 'Bilmece çözüldü');
  if (!S.hintLevel[r.id]) addScore(250, 'İpucusuz çözüm');
  Sfx.good();
  logEntry(`Bilmece çözüldü: ${r.id}`);

  /* Bilmeceye özel ödüller */
  if (r.id === 'saat') {
    S.codes.saat = '19';
    if (S.wrongBeforeFirst === 0) grantAchievement('keskin-goz');
    reveal('Saatin arkası', 'Kadranı çevirdin. Arka kapağın içine kalemle bir sayı kazınmış:', '19');
  }
  if (r.id === 'kitap') {
    addItem('anahtar');
    reveal('Oyulmuş kitap', 'Sayfaların ortası oyulmuş. İçinde küçük bir anahtar duruyor.', null);
  }
  if (r.id === 'pusula') {
    S.codes.pusula = '23';
    reveal('Pusulanın altı', 'Pusulayı kaldırdın. Altındaki keçeye iki hane yazılmış:', '23');
  }
  if (r.id === 'fener') {
    addItem('uv-fener');
    reveal('El feneri', 'Mercek UV. Görünmez mürekkebi ortaya çıkarabilir. Şifreli fotoğrafta denemelisin.', null);
  }
  if (r.id === 'hoparlor') {
    reveal('Hoparlörün arkası', 'Izgarayı söktün. Duvar boşluğuna küçük bir verici yerleştirilmiş. Kırmızı ışığı düzenli yanıp sönüyor.', null);
    setTimeout(startFinalTask, 900);
  }
  renderAll();
}

function reveal(baslik, metin, kod) {
  openModal(baslik, `
    <p>${esc(metin)}</p>
    ${kod ? `<p class="countdown" style="font-size:46px;color:var(--brass)">${esc(kod)}</p>` : ''}
    <div class="btn-row"><button class="btn btn-primary" data-act="close-modal">Devam</button></div>`);
}

function wrongObject(obj) {
  S.wrongObjects++;
  if (!S.solved.length) S.wrongBeforeFirst++;
  addScore(-100, 'Yanlış nesne');
  addAlarm(ALARM_COST.obje);
  Sfx.bad();
  $('#stage').classList.add('shake');
  setTimeout(() => $('#stage').classList.remove('shake'), 360);
  const btn = $(`[data-obj="${obj.id}"]`);
  if (btn) { btn.classList.add('wrong'); setTimeout(() => btn.classList.remove('wrong'), 320); }
  note(obj.metin);
}

/* ============================================================================
   4 — ENVANTER VE KANITLAR
   ========================================================================== */
function addItem(id) {
  if (S.inventory.includes(id)) return;
  S.inventory.push(id);
  Sfx.found();
  toast(`Envantere eklendi: ${ITEMS[id].ad}`, 'good');
  logEntry(`Eşya bulundu: ${ITEMS[id].ad}`);
  renderInventory();
}

function addEvidence(id) {
  if (S.evidence.includes(id)) return;
  const e = EVIDENCE_DB[id];
  S.evidence.push(id);
  Sfx.found();
  if (e.tur === 'gizli') addScore(300, 'Gizli kanıt');
  toast(`Yeni kanıt: ${e.ad}`, 'good');
  logEntry(`Kanıt panosuna eklendi: ${e.ad}`);
  renderHud();
  updateAccuseButton();
}

function coreEvidenceCount() {
  return S.evidence.filter((id) => EVIDENCE_DB[id].tur === 'ana').length;
}

function updateAccuseButton() {
  const ready = !!S.flags.isik_ok && coreEvidenceCount() >= 4 && !S.flags.suclama_ok;
  $('#btnAccuse').disabled = !ready;
}

function suspicionOf(id) {
  const base = SUSPECTS.find((x) => x.id === id).baseSuspicion;
  const add = S.evidence.reduce((sum, evId) => {
    const e = EVIDENCE_DB[evId];
    return sum + (e.isaret === id ? e.puan : 0);
  }, 0);
  return Math.min(100, base + add);
}

function renderInventory() {
  const ul = $('#inv');
  ul.innerHTML = S.inventory.map((id) => `
    <li><button class="inv-item" data-act="item" data-item="${id}"
        aria-pressed="${S.selectedItem === id}"
        aria-label="${esc(ITEMS[id].ad)}" title="${esc(ITEMS[id].ad)}">${ITEMS[id].ikon}</button></li>`).join('');
}

function openItem(id) {
  const it = ITEMS[id];
  openModal(it.ad, `
    <p style="font-size:52px;text-align:center;margin:0 0 10px">${it.ikon}</p>
    <p>${esc(it.metin)}</p>
    <div class="btn-row">
      <button class="btn btn-primary" data-act="aim" data-item="${id}">Kullan</button>
      <button class="btn" data-act="close-modal">Kapat</button>
    </div>`);
}

function aimItem(id) {
  S.selectedItem = id;
  closeModal();
  $('#stage').classList.add('aiming');
  note(`${ITEMS[id].ad} seçildi. Kullanacağın nesneye tıkla. (İptal için envanterdeki eşyaya tekrar tıkla.)`);
  renderInventory();
}

function clearAim() {
  S.selectedItem = null;
  $('#stage').classList.remove('aiming');
  renderInventory();
  note('');
}

function tryCombo(targetId) {
  const key = `${S.selectedItem}|${targetId}`;
  const result = COMBOS[key];
  if (!result) {
    toast('Bu ikisi bir işe yaramıyor.', 'bad');
    clearAim();
    return true;
  }
  const item = S.selectedItem;
  clearAim();
  runCombo(result, item);
  return true;
}

function runCombo(result) {
  if (result === 'cekmece_ac') {
    S.flags.cekmece_ok = true;
    logEntry('Kilitli çekmece açıldı.');
    Sfx.good();
    openNotePuzzle();
  }
  if (result === 'dolap_ac') {
    S.flags.dolap_ok = true;
    addItem('usb');
    addEvidence('usb');
    reveal('Arşiv dolabı', 'Kart okuyucu yeşile döndü. Dolabın içinde, dosyaların arkasına itilmiş bir USB bellek var. Kayıp olduğu bildirilen bellek bu.', null);
  }
  if (result === 'radyo_ac') {
    S.flags.radyo_ok = true;
    Sfx.static();
    reveal('Radyo', 'Pil yerine oturdu. Radyo cızırdayarak uyandı. Frekans paneli artık kod kabul ediyor.', null);
  }
  if (result === 'foto_uv') {
    addEvidence('uv-yazi');
    reveal('UV altında', 'Fotoğrafın arkasında, çıplak gözle görünmeyen bir yazı beliriyor:\n\n“ANKA — 3. raf, arka duvar.”', null);
  }
  renderAll();
}

/* ============================================================================
   5 — ODA VE NESNE ETKİLEŞİMLERİ
   ========================================================================== */
function renderRooms() {
  $('#roomTabs').innerHTML = ROOM_ORDER.map((id) => {
    const r = ROOMS[id];
    const act = activeRiddle();
    const objv = currentObjective();
    const hasTask = (act && act.room === id) || (objv && objv.room === id);
    return `<button class="room-tab" data-act="room" data-room="${id}"
      aria-current="${S.room === id}">${esc(r.ad)}${hasTask ? '<span class="dot">●</span>' : ''}</button>`;
  }).join('');
}

function renderStage() {
  const room = ROOMS[S.room];
  $('#stage').innerHTML = room.objects.map((o) => {
    const done = !!solvedRiddleFor(o.id);
    return `<button class="hot ${done ? 'done' : ''}" data-act="obj" data-obj="${o.id}"
      style="left:${o.x}%;top:${o.y}%" aria-label="${esc(o.ad)}">
      <span class="glyph" aria-hidden="true">${o.ikon}</span>
      <span class="cap">${esc(o.ad)}</span></button>`;
  }).join('');
}

function gotoRoom(id) {
  if (!ROOMS[id]) return;
  S.room = id;
  clearAim();
  renderAll();
  note(ROOMS[id].atmosfer);
}

function handleObject(objId) {
  const obj = findObj(objId);
  if (!obj) return;

  if (S.selectedItem) { tryCombo(objId); return; }

  const r = activeRiddle();

  /* 1) Etkileşimli nesneler kendi işlerini yapar */
  if (obj.act) { runAct(obj.act, obj); return; }

  /* 2) Aktif bilmecenin doğru cevabı mı? */
  if (r && r.room === S.room && objId === r.answerObjectId) { solveRiddle(r); return; }

  /* 2b) Verici bulunduysa hoparlör son görevi yeniden açar */
  if (objId === 'hoparlor' && S.flags.hoparlor_ok && !S.ended) { renderFinalTask(); return; }

  /* 3) Daha önce çözülmüş bir bilmecenin nesnesi mi? */
  const done = solvedRiddleFor(objId);
  if (done) {
    const kod = objId === 'duvar-saati' ? '19' : objId === 'pusula' ? '23' : null;
    reveal(obj.ad, kod ? 'Buradan çıkan kodu zaten aldın:' : obj.metin, kod);
    return;
  }

  /* 4) Bu odada aktif bir bilmece varsa yanlış seçim sayılır */
  if (r && r.room === S.room) { wrongObject(obj); return; }

  /* 5) Aksi hâlde sadece bilgi ver */
  note(obj.metin);
  Sfx.click();
}

function runAct(act, obj) {
  switch (act) {

    case 'cerceve':
      if (!S.inventory.includes('foto')) {
        addItem('foto');
        reveal('Fotoğraf çerçevesi', 'Camın altındaki fotoğrafı çıkardın. Arkası boş görünüyor ama kâğıt olması gerekenden parlak.', null);
      } else note('Çerçeve boş. Fotoğraf sende.');
      break;

    case 'bilgisayar':
      if (S.inventory.includes('kart')) {
        addEvidence('oturum-kaydi');
        reveal('Oturum kaydı', 'Kartı okuttun. Terminal son oturumu gösteriyor:\n\n20.52 — Analiz terminaline arşiv sorumlusu yetkisiyle giriş yapılmış.', null);
      } else note('Oturum açmak için bir personel kartı gerekiyor.');
      break;

    case 'cekmece':
      if (S.flags.not_ok) { note('Çekmece boş. Notu aldın.'); break; }
      if (S.flags.cekmece_ok) { openNotePuzzle(); break; }
      note(S.inventory.includes('anahtar')
        ? 'Kilitli. Envanterden anahtarı seçip burada kullan.'
        : 'Kilitli. Küçük bir anahtar lazım.');
      break;

    case 'daktilo':
      if (!S.evidence.includes('daktilo-serit')) {
        addEvidence('daktilo-serit');
        reveal('Daktilo şeridi', 'Şeridi ışığa tuttun. Son basılan satır ters okunuyor:\n\n“kart iade edilmeyecek”', null);
      } else note('Şeridi zaten inceledin.');
      break;

    case 'dolap':
      if (S.flags.dolap_ok) { note('Dolap açık ve boş.'); break; }
      note(S.inventory.includes('kart')
        ? 'Kart okuyuculu dolap. Envanterden personel kartını seçip burada kullan.'
        : 'Kart okuyuculu dolap. Yetkili bir kart gerekiyor.');
      break;

    case 'kartlar':
      if (!S.inventory.includes('kart')) {
        addItem('kart');
        addEvidence('ece-kart');
        reveal('Personel kartları', 'Askılıkta bir yuva boş. Kartı masanın altında, yere düşmüş hâlde buldun. Üzerinde Ece yazıyor.\n\nBiri kartı almış — sahibi düşürmüş olsa askılığa geri asardı.', null);
      } else note('Askılıkta kalan kartlar bu gece kullanılmamış.');
      break;

    case 'defter':
      openLogbook();
      break;

    case 'kamera':
      if (!S.evidence.includes('arsiv-giris')) {
        note('Kayıtta ne arayacağını bilmiyorsun. Önce kapı kayıtlarına bakmalısın.');
        break;
      }
      if (!S.evidence.includes('kerem-kamera')) {
        addEvidence('kerem-kamera');
        checkGuvenlikDone();
        reveal('Kamera kaydı · 21.03', 'Kesinti anına ait tampon kaydı açtın. Arşiv koridorunda bir kişi var.\n\nGörüntüdeki kişi Kerem. Oysa Kerem 20.40’ta binadan ayrıldığını beyan etmişti.', null);
      } else note('Kayıt zaten kanıt panosunda.');
      break;

    case 'radyo':
      if (S.flags.radyo_ok) { note('Radyo çalışıyor. Frekans panelini kullan.'); break; }
      note(S.inventory.includes('pil')
        ? 'Pil yuvası boş. Envanterden pili seçip radyoda kullan.'
        : 'Pil yuvası boş. Binada bir pil olmalı.');
      break;

    case 'kablo':
      if (!S.inventory.includes('pil')) {
        addItem('pil');
        reveal('Kablo kutusu', 'Kabloların arasında dolu bir pil buldun.', null);
      } else note('Kutuda başka işe yarar bir şey yok.');
      break;

    case 'terminal':
      if (!S.evidence.includes('aktarim-kuyrugu')) {
        addEvidence('aktarim-kuyrugu');
        reveal('Sunucu terminali', 'Aktarım kuyruğunda tek dosya var: ANKA.pkg\n\nHedef adres bina dışını değil, bina içindeki bir vericiyi gösteriyor. Dosya hâlâ burada.', null);
      } else note('Kuyruk değişmedi. Aktarım devam ediyor.');
      break;

    case 'frekans':
      if (!S.flags.radyo_ok) { note('Panel ölü. Radyo beslenmeden çalışmaz.'); break; }
      if (!S.flags.freq_ok) { openFreqPanel(); break; }
      if (!S.flags.isik_ok) { openLightPuzzle(); break; }
      note('Frekans kilitlendi. Kaynak: duvar içindeki hoparlör hattı.');
      break;
  }
  renderAll();
}

function checkGuvenlikDone() {
  if (S.codes.defter && S.evidence.includes('kerem-kamera') && S.evidence.includes('ece-kart')) {
    S.flags.guv_ok = true;
  }
}

/* ── Kayıt defteri ──────────────────────────────────────────────────────── */
const LOGBOOK_PAGES = [
  '1 — 15.10 Kerem giriş. Arşiv.',
  '2 — 16.00 Bora giriş. Güvenlik.',
  '3 — 17.45 Ece giriş. Haberleşme.',
  '4 — 18.20 Deniz giriş. Analiz.',
  '5 — 19.30 Temizlik ekibi çıkış.',
  '6 — 20.40 Kerem çıkış (beyan). İmza okunmuyor.',
  '7 — 21.05 Arşiv kapısı açıldı. Kart: ECE. Not: elektrik kesintisi 21.07.',
  '8 — Sayfa boş.'
];

function openLogbook() {
  const body = `
    <p class="muted">Elle tutulan giriş-çıkış defteri. Sayfalar numaralı; hepsini okuyabilirsin.</p>
    <div class="opt-grid">
      ${LOGBOOK_PAGES.map((_, i) => `<button class="opt" data-act="page" data-page="${i}">
        <span class="opt-name">Sayfa ${i + 1}</span></button>`).join('')}
    </div>
    <p id="pageOut" style="margin-top:16px;font-family:var(--mono);font-size:13px;color:var(--brass)"></p>`;
  openModal('Güvenlik kayıt defteri', body);
}

function readPage(i) {
  $('#pageOut').textContent = LOGBOOK_PAGES[i];
  Sfx.click();
  if (i === 6) {
    if (!S.codes.defter) {
      S.codes.defter = '07';
      addScore(300, 'Üçüncü kod bulundu');
      logEntry('Kod bulundu: 07 (kayıt defteri, 7. sayfa)');
      toast('Kod alındı: 07', 'good');
    }
    if (!S.evidence.includes('arsiv-giris')) addEvidence('arsiv-giris');
    checkGuvenlikDone();
    renderAll();
  }
}

/* ============================================================================
   6 — NOT BULMACASI (parça sıralama)
   ========================================================================== */
const NOTE_FRAGMENTS = ['KUZEYE', 'DEĞİL,', 'KUZEYİ', 'GÖSTERENE BAK.'];
let noteOrder = [];
let fragPick = null;

function openNotePuzzle() {
  noteOrder = [3, 1, 0, 2];   // kasıtlı olarak karışık başlar
  fragPick = null;
  openModal('Parçalanmış not', `
    <p class="muted">Parçaları doğru sıraya diz. İki parçaya tıklayarak yerlerini değiştir; masaüstünde sürükleyebilirsin de.</p>
    <div class="frag-row" id="fragRow"></div>
    <p id="fragOut" style="font-family:var(--mono);font-size:13px;color:var(--dim)">Sıra henüz doğru değil.</p>
    <div class="btn-row"><button class="btn" data-act="close-modal">Sonra bakarım</button></div>`);
  renderFrags();
}

function renderFrags() {
  const row = $('#fragRow');
  if (!row) return;
  row.innerHTML = noteOrder.map((fi, pos) => `
    <button class="frag" draggable="true" data-act="frag" data-frag="${pos}"
      aria-pressed="${fragPick === pos}">${esc(NOTE_FRAGMENTS[fi])}</button>`).join('');
}

function pickFrag(pos) {
  if (fragPick === null) { fragPick = pos; renderFrags(); return; }
  if (fragPick === pos) { fragPick = null; renderFrags(); return; }
  swapFrags(fragPick, pos);
  fragPick = null;
}

function swapFrags(a, b) {
  const t = noteOrder[a]; noteOrder[a] = noteOrder[b]; noteOrder[b] = t;
  renderFrags();
  Sfx.click();
  checkNote();
}

function checkNote() {
  const ok = noteOrder.every((fi, i) => fi === i);
  const out = $('#fragOut');
  if (!ok) { if (out) out.textContent = 'Sıra henüz doğru değil.'; return; }
  S.flags.not_ok = true;
  addItem('not');
  addEvidence('not');
  addScore(400, 'Not birleştirildi');
  Sfx.good();
  logEntry('Not birleştirildi: “Kuzeye değil, kuzeyi gösterene bak.”');
  openModal('Not birleşti', `
    <p>Parçalar yerine oturdu. Elle yazılmış tek satır:</p>
    <p style="font-family:var(--mono);font-size:17px;color:var(--brass);text-align:center;margin:18px 0">
      “Kuzeye değil, kuzeyi gösterene bak.”</p>
    <div class="btn-row"><button class="btn btn-primary" data-act="close-modal">Devam</button></div>`);
  renderAll();
}

/* ============================================================================
   7 — FREKANS PANELİ VE IŞIK BULMACASI
   ========================================================================== */
function openFreqPanel() {
  const bulunan = Object.values(S.codes);
  openModal('Frekans paneli', `
    <p class="muted">Üç haneli üç alan. Kodları odalardan topladın.</p>
    <div class="code-row">
      <input class="code-in" id="f0" inputmode="numeric" maxlength="2" aria-label="Birinci kod">
      <span class="code-sep">–</span>
      <input class="code-in" id="f1" inputmode="numeric" maxlength="2" aria-label="İkinci kod">
      <span class="code-sep">–</span>
      <input class="code-in" id="f2" inputmode="numeric" maxlength="2" aria-label="Üçüncü kod">
    </div>
    <p style="font-family:var(--mono);font-size:11.5px;color:var(--dim)">
      Defterindekiler: ${bulunan.length ? esc(bulunan.join(' · ')) : 'henüz kod yok'}</p>
    <p id="freqOut" style="font-family:var(--mono);font-size:12.5px;color:var(--signal);min-height:18px"></p>
    <div class="btn-row">
      <button class="btn btn-primary" data-act="submit-freq">Frekansı Kilitle</button>
      <button class="btn" data-act="close-modal">Kapat</button>
    </div>`);
}

function submitFreq() {
  const vals = ['f0', 'f1', 'f2'].map((id) => ($(`#${id}`).value || '').trim().padStart(2, '0'));
  if (vals.join('-') === FREQ_CODE.join('-')) {
    S.flags.freq_ok = true;
    if (S.hintsUsed === 0) grantAchievement('sifreci');
    addScore(600, 'Frekans kilitlendi');
    addEvidence('frekans');
    Sfx.static();
    logEntry('Frekans kilitlendi: 19-23-07');
    setTimeout(openLightPuzzle, 400);
  } else {
    S.wrongCodes++;
    addScore(-250, 'Yanlış şifre');
    addAlarm(ALARM_COST.kod);
    Sfx.bad();
    const out = $('#freqOut');
    if (out) out.textContent = S.wrongCodes % 3 === 0
      ? 'Üçüncü hata. Panel seni kaydetti. Kodları tekrar kontrol et: saat, pusula, defterin 7. sayfası.'
      : 'Frekans tutmadı. Alarm seviyesi yükseldi.';
  }
  renderAll();
}

function sigRow(desen) {
  return `<span class="signal-row">${desen.map((d) => `<i class="sig ${d}"></i>`).join('')}</span>`;
}

function openLightPuzzle() {
  openModal('Işık dizisi', `
    <p>Radyo kilitlendi. Hoparlör hattından gelen sinyal, duvardaki bir lambayı şu ritimde yakıyor:</p>
    ${sigRow(LIGHT_PUZZLE.dizi)}
    <p class="muted">Aynı ritmi hangi nesne üretiyor? Desenleri karşılaştır.</p>
    <div class="opt-grid">
      ${LIGHT_PUZZLE.secenekler.map((o) => `
        <button class="opt" data-act="opt" data-opt="${o.id}">
          <span class="opt-name">${esc(o.ad)}</span>
          ${sigRow(o.desen)}
        </button>`).join('')}
    </div>`);
}

function pickLight(id) {
  if (id === LIGHT_PUZZLE.dogru) {
    S.flags.isik_ok = true;
    addScore(500, 'Sinyal kaynağı bulundu');
    Sfx.good();
    logEntry('Işık dizisi çözüldü. Kaynak: hoparlör hattı.');
    updateAccuseButton();
    openModal('Kaynak bulundu', `
      <p>Ritim tuttu. Sinyal duvarın içindeki hoparlör hattından geliyor.</p>
      <p>Ama vericiye dokunmadan önce bir adım daha var: bu gece bu binada kimin yaptığını isimle bildirmen gerekiyor.
      Kanıt panosunu aç, gerekçeni kur ve suçlamayı yap.</p>
      <div class="btn-row"><button class="btn btn-primary" data-act="close-modal">Anlaşıldı</button></div>`);
  } else {
    addScore(-100, 'Yanlış eşleşme');
    addAlarm(ALARM_COST.obje);
    Sfx.bad();
    toast('Desen tutmadı.', 'bad');
  }
  renderAll();
}

/* ============================================================================
   8 — ŞÜPHELİLER, KANIT PANOSU, SUÇLAMA
   ========================================================================== */
function openSuspects() {
  openModal('Şüpheliler', `
    <p class="muted">Dördü de kurgusal karakterlerdir. Şüphe puanı bulduğun kanıtlarla değişir — ama puana değil, kanıtların anlattığı hikâyeye bak.</p>
    <div class="sus-list">${SUSPECTS.map(susCard).join('')}</div>`);
}

function susCard(s, pickable = false, picked = null) {
  const sp = suspicionOf(s.id);
  const tag = pickable ? 'button' : 'div';
  const attrs = pickable ? ` type="button" data-act="sus" data-sus="${s.id}" aria-pressed="${picked === s.id}"` : '';
  return `
    <${tag} class="sus ${pickable ? 'pickable' : ''}"${attrs}>
      <span class="sus-av" aria-hidden="true">${s.avatar}</span>
      <span class="sus-body">
        <span class="sus-name">${esc(s.ad)}</span>
        <span class="sus-role">${esc(s.gorev)}</span>
        <span class="sus-quote">“${esc(s.ifade)}”</span>
        <span class="sus-meta">Giriş ${esc(s.giris)} · Çıkış ${esc(s.cikis)} · ${esc(s.odalar)}</span>
        <span class="sus-bar-k">ŞÜPHE ${sp}</span>
        <span class="sus-bar"><i style="width:${sp}%"></i></span>
      </span>
    </${tag}>`;
}

function openEvidence() {
  if (!S.evidence.length) {
    openModal('Kanıt panosu', `<p>Pano boş. Odaları aramaya devam et.</p>
      <div class="btn-row"><button class="btn" data-act="close-modal">Kapat</button></div>`);
    return;
  }
  openModal('Kanıt panosu', `
    <p class="muted">${coreEvidenceCount()} temel kanıt · ${S.evidence.length - coreEvidenceCount()} gizli kanıt.
    Suçlama için en az 4 temel kanıt gerekiyor.</p>
    <div class="ev-grid">${S.evidence.map(evCard).join('')}</div>`);
}

function evCard(id, pickable = false, picked = []) {
  const e = EVIDENCE_DB[id];
  const tag = pickable ? 'button' : 'div';
  const attrs = pickable ? ` type="button" data-act="ev" data-ev="${id}" aria-pressed="${picked.includes(id)}"` : '';
  return `
    <${tag} class="ev-card ${e.tur === 'gizli' ? 'gizli' : ''}"${attrs}>
      <span class="ev-name">${esc(e.ad)}</span>
      <span class="ev-text">${esc(e.metin)}</span>
      <span class="ev-tag">${e.tur === 'gizli' ? 'GİZLİ' : 'TEMEL'}</span>
    </${tag}>`;
}

let accusePick = null;
let accuseEv = [];

function openAccuse() {
  accusePick = null;
  accuseEv = [];
  renderAccuse();
}

function renderAccuse() {
  const core = S.evidence.filter((id) => EVIDENCE_DB[id].tur === 'ana');
  openModal('Suçlama', `
    <h4>1 · Köstebeği seç</h4>
    <div class="sus-list">${SUSPECTS.map((s) => susCard(s, true, accusePick)).join('')}</div>
    <h4>2 · Gerekçeni kur (tam 3 kanıt)</h4>
    <div class="ev-grid">${core.map((id) => evCard(id, true, accuseEv)).join('')}</div>
    <p style="font-family:var(--mono);font-size:11.5px;color:var(--dim);margin-top:14px">
      Seçili: ${accusePick ? esc(SUSPECTS.find((x) => x.id === accusePick).ad) : '—'} · ${accuseEv.length}/3 kanıt</p>
    <div class="btn-row">
      <button class="btn btn-danger" data-act="confirm-accuse"
        ${accusePick && accuseEv.length === 3 ? '' : 'disabled'}>Suçlamayı Bildir</button>
      <button class="btn" data-act="close-modal">Vazgeç</button>
    </div>`);
}

function pickSuspect(id) { accusePick = id; renderAccuse(); }

function pickEvidence(id) {
  const i = accuseEv.indexOf(id);
  if (i >= 0) accuseEv.splice(i, 1);
  else if (accuseEv.length < 3) accuseEv.push(id);
  else toast('Zaten üç kanıt seçtin. Birini bırakman gerek.', 'bad');
  renderAccuse();
}

function confirmAccuse() {
  /* Gerekçe kabul kuralı: beyanı çürüten kamera kaydı zorunlu, yanına
     kartı/erişimi gösteren kanıtlardan en az ikisi gerekli. Böylece oyuncu
     tek bir "doğru üçlüyü" bilmek zorunda kalmaz ama rastgele de seçemez. */
  const destek = ['arsiv-giris', 'usb', 'ece-kart'].filter((id) => accuseEv.includes(id)).length;
  const dogruKanit = accuseEv.includes('kerem-kamera') && destek >= 2;

  if (accusePick !== KOSTEBEK) {
    addAlarm(ALARM_COST.suphe);
    Sfx.bad();
    logEntry(`Yanlış suçlama: ${accusePick}`);
    if (!S.accuseRetryUsed) {
      S.accuseRetryUsed = true;
      openModal('Tutmadı', `
        <p>Suçlama tutanağa geçmeden önce kontrol edildi. Bu isim, elindeki kanıtlarla uyuşmuyor.</p>
        <p class="muted">Bir kereye mahsus kanıtları yeniden inceleyebilirsin. İkinci yanlış isim dosyayı kapatır.</p>
        <div class="btn-row">
          <button class="btn btn-primary" data-act="open-accuse">Kanıtları Yeniden İncele</button>
          <button class="btn" data-act="close-modal">Kapat</button>
        </div>`);
      renderAll();
      return;
    }
    endGame('yanlis');
    return;
  }

  if (!dogruKanit) {
    Sfx.bad();
    openModal('Gerekçe zayıf', `
      <p>İsim doğru olabilir ama seçtiğin üç kanıt bu ismi taşımıyor.</p>
      <p class="muted">Kendine sor: hangi kanıt onun beyanını doğrudan çürütüyor? Yanına, kartın başkası tarafından
      kullanıldığını veya çalınan dosyaya erişimi olduğunu gösteren iki kanıt daha koy.
      Bunlardan biri hâlâ arşivde, kilitli dolapta olabilir.</p>
      <div class="btn-row">
        <button class="btn btn-primary" data-act="open-accuse">Gerekçeyi Yeniden Kur</button>
        <button class="btn" data-act="close-modal">Kapat</button>
      </div>`);
    return;
  }

  S.flags.suclama_ok = true;
  addScore(2000, 'Köstebek tespit edildi');
  Sfx.good();
  logEntry('Köstebek tespit edildi: Kerem.');
  updateAccuseButton();
  openModal('Teşhis doğrulandı', `
    <p>Kerem 20.40’ta çıktığını beyan etmişti. Kamera onu 21.03’te arşiv koridorunda gösteriyor.
    Arşiv kapısı 21.05’te Ece’nin kartıyla açıldı; kart askılıkta değil, yerde bulundu.
    Kayıp USB, arşiv dolabından çıktı ve o dolabın yetkisi arşiv sorumlusunda.</p>
    <p>Zincir kapandı. Şimdi vericiyi bul: sinyal hoparlör hattından geliyordu.</p>
    <div class="btn-row"><button class="btn btn-primary" data-act="close-modal">Haberleşme Odasına Dön</button></div>`);
  renderAll();
}

/* ============================================================================
   9 — SON GÖREV: VERİCİ
   ========================================================================== */
let finalLeft = FINAL_SECONDS;

function startFinalTask() {
  S.running = false;              // ana sayaç durur, son sayaç başlar
  finalLeft = FINAL_SECONDS;
  renderFinalTask();
  clearInterval(finalTicker);
  finalTicker = setInterval(() => {
    finalLeft--;
    const el = $('#finalClock');
    if (el) el.textContent = String(finalLeft).padStart(2, '0');
    if (finalLeft <= 0) { clearInterval(finalTicker); endGame('sizdi'); }
  }, 1000);
}

function renderFinalTask(err) {
  openModal('Verici · aktarım sürüyor', `
    <p>Vericinin tuş takımı üç haneli üç alan istiyor. Frekansın aynısı.</p>
    <p class="countdown" id="finalClock">${String(finalLeft).padStart(2, '0')}</p>
    <div class="code-row">
      <input class="code-in" id="v0" inputmode="numeric" maxlength="2" aria-label="Birinci kod">
      <span class="code-sep">–</span>
      <input class="code-in" id="v1" inputmode="numeric" maxlength="2" aria-label="İkinci kod">
      <span class="code-sep">–</span>
      <input class="code-in" id="v2" inputmode="numeric" maxlength="2" aria-label="Üçüncü kod">
    </div>
    <p style="font-family:var(--mono);font-size:12px;color:var(--signal);min-height:18px">${err ? esc(err) : ''}</p>
    <div class="btn-row"><button class="btn btn-primary" data-act="submit-final">Aktarımı Durdur</button></div>`);
}

function submitFinal() {
  const vals = ['v0', 'v1', 'v2'].map((id) => ($(`#${id}`).value || '').trim().padStart(2, '0'));
  if (vals.join('-') === FREQ_CODE.join('-')) {
    clearInterval(finalTicker);
    endGame('basari');
    return;
  }
  S.finalTries++;
  S.wrongCodes++;
  addScore(-250, 'Yanlış şifre');
  addAlarm(ALARM_COST.kod);
  Sfx.bad();
  if (S.finalTries >= 3) { clearInterval(finalTicker); endGame('sizdi'); return; }
  renderFinalTask(`Kabul edilmedi. Kalan deneme: ${3 - S.finalTries}`);
}

/* ============================================================================
   10 — BAŞARIMLAR, RÜTBE, FİNAL
   ========================================================================== */
function grantAchievement(id) {
  if (!S.achievements) S.achievements = [];
  if (S.achievements.includes(id)) return;
  S.achievements.push(id);
  const a = ACHIEVEMENTS.find((x) => x.id === id);
  toast(`Başarım: ${a.ad}`, 'good');
  logEntry(`Başarım kazanıldı: ${a.ad}`);
}

function rankFor(score) { return RANKS.find((r) => score >= r.min).ad; }

function endGame(kind) {
  if (S.ended) return;
  S.ended = true;
  S.running = false;
  clearInterval(ticker);
  clearInterval(finalTicker);
  clearAim();
  closeModal();

  let ending;
  if (kind === 'basari') {
    addScore(S.time * 5, 'Kalan süre');
    const temiz = S.alarm <= 20 && S.hintsUsed === 0 && S.wrongCodes === 0 && S.wrongObjects === 0;
    ending = ENDINGS[temiz ? 'kusursuz' : 'basarili'];
    Sfx.win();
  } else if (kind === 'yanlis') {
    ending = ENDINGS.yanlis;
    Sfx.bad();
  } else {
    ending = ENDINGS.sizdi;
    Sfx.bad();
  }

  /* Başarım kontrolleri */
  const gizliToplam = Object.keys(EVIDENCE_DB).filter((k) => EVIDENCE_DB[k].tur === 'gizli').length;
  const gizliBulunan = S.evidence.filter((id) => EVIDENCE_DB[id].tur === 'gizli').length;
  if (gizliBulunan === gizliToplam) grantAchievement('golge-takibi');
  if (kind === 'basari' && S.alarm < 25) grantAchievement('sogukkanli');
  if (kind === 'basari' && S.time > 300) grantAchievement('zamana-karsi');
  if (S.score >= 9500) grantAchievement('anka');

  const saved = Save.read();
  const best = Math.max(saved.best, S.score);
  const allAch = Array.from(new Set([...(saved.achievements || []), ...(S.achievements || [])]));
  Save.write({ best, achievements: allAch, codeName: S.codeName });

  const used = GAME_DURATION - S.time;
  $('#alarmVignette').className = 'vignette';
  $('#finalPanel').innerHTML = `
    <p class="final-kicker">Görev raporu · ANKA Protokolü</p>
    <h2 class="final-title ${ending.tip}">${esc(ending.baslik)}</h2>
    <p class="final-story">${esc(ending.metin)}</p>
    <p class="final-rank">${esc(rankFor(S.score))}</p>
    <table class="sheet">
      <tbody>
        <tr><td>Ajan kod adı</td><td>${esc(S.codeName)}</td></tr>
        <tr><td>Toplam puan</td><td>${S.score}</td></tr>
        <tr><td>En yüksek puan</td><td>${best}</td></tr>
        <tr><td>Tamamlama süresi</td><td>${String(Math.floor(used / 60)).padStart(2, '0')}:${String(used % 60).padStart(2, '0')}</td></tr>
        <tr><td>Kullanılan ipucu</td><td>${S.hintsUsed}</td></tr>
        <tr><td>Yanlış nesne / şifre</td><td>${S.wrongObjects} / ${S.wrongCodes}</td></tr>
        <tr><td>Gizli kanıt</td><td>${gizliBulunan} / ${gizliToplam}</td></tr>
        <tr><td>Alarm seviyesi</td><td>${S.alarm}</td></tr>
      </tbody>
    </table>
    ${(S.achievements && S.achievements.length) ? `<div class="ach-row">${S.achievements.map((id) => {
      const a = ACHIEVEMENTS.find((x) => x.id === id);
      return `<span class="ach" title="${esc(a.metin)}">★ ${esc(a.ad)}</span>`;
    }).join('')}</div>` : ''}
    <div class="btn-row">
      <button class="btn btn-primary" data-act="again">Yeni Görev</button>
      <button class="btn" data-act="home">Ana Ekran</button>
    </div>`;
  showScreen('screen-final');
}

/* ============================================================================
   11 — GÖRÜNÜM YENİLEME
   ========================================================================== */
function renderAll() {
  renderHud();
  renderRooms();
  renderStage();
  renderRiddle();
  renderInventory();
  updateAccuseButton();
}

/* ============================================================================
   12 — BRİFİNG (daktilo efekti)
   ========================================================================== */
const BRIEF_TEXT =
`> GÜVENLİ HAT AÇILDI
> ALICI: {AD}

Merkez binasında güvenlik ihlali tespit edildi.
ANKA Protokolü kayıp.

Dosyanın binada bulunan gizli bir verici aracılığıyla
dışarı aktarılacağı düşünülüyor. Güvenlik sistemleri
devre dışı. Kayıt tutulmuyor.

Binadaki ipuçlarını takip et, kodları çöz ve köstebeği bul.

Kimseye güvenme.

> HAT KAPANIYOR`;

let typerTimer = null;

function runBrief() {
  const el = $('#briefText');
  const text = BRIEF_TEXT.replace('{AD}', S.codeName);
  el.textContent = '';
  el.classList.remove('done');
  $('#btnStartOp').disabled = true;
  let i = 0;
  clearInterval(typerTimer);
  typerTimer = setInterval(() => {
    el.textContent = text.slice(0, ++i);
    if (i % 3 === 0) Sfx.tone(240, 0.012, 'square', 0.012);
    if (i >= text.length) finishBrief();
  }, 18);
}

function finishBrief() {
  clearInterval(typerTimer);
  const el = $('#briefText');
  el.textContent = BRIEF_TEXT.replace('{AD}', S.codeName);
  el.classList.add('done');
  $('#btnStartOp').disabled = false;
  $('#btnSkipBrief').disabled = true;
}

/* ============================================================================
   13 — OYUNU BAŞLAT / BİTİR
   ========================================================================== */
function newGame() {
  const saved = Save.read();
  S = freshState();
  S.achievements = [];
  RIDDLES.forEach((r) => { r.completed = false; });
  Sfx.on = saved.sound;
  $('#btnSound').textContent = saved.sound ? '🔊' : '🔇';
}

function startOperation() {
  showScreen('screen-game');
  logEntry(`Operasyon başladı. Ajan: ${S.codeName}`);
  renderAll();
  startTimer();
  note(ROOMS[S.room].atmosfer);
}

function quitToTitle() {
  clearInterval(ticker); clearInterval(finalTicker); clearInterval(typerTimer);
  if (S) { S.running = false; S.ended = true; }
  $('#alarmVignette').className = 'vignette';
  closeModal();
  refreshTitle();
  showScreen('screen-title');
}

function refreshTitle() {
  const saved = Save.read();
  const line = $('#bestLine');
  if (saved.best > 0) {
    line.hidden = false;
    line.textContent = `En yüksek puan: ${saved.best} · ${rankFor(saved.best)}`;
  } else line.hidden = true;
  $('#codeName').value = saved.codeName || '';
  Sfx.on = saved.sound;
  $('#btnSound').textContent = saved.sound ? '🔊' : '🔇';
}

/* ============================================================================
   14 — YARDIM VE AYARLAR
   ========================================================================== */
function openHowTo() {
  openModal('Nasıl oynanır?', `
    <h4>Amaç</h4>
    <p>Dört odada bilmeceleri çöz, üç kodu topla, kanıtlarla köstebeği bul ve
    süre dolmadan vericiyi sustur.</p>
    <h4>Kontroller</h4>
    <ul>
      <li>Oda sekmeleriyle odalar arasında geç. Yanındaki kırmızı nokta orada iş olduğunu gösterir.</li>
      <li>Sahnedeki nesnelere tıkla. Aktif bilmecenin cevabı olan nesneyi bulmalısın.</li>
      <li>Envanterdeki eşyaya tıkla, “Kullan” de, sonra hedefe tıkla.</li>
      <li>Klavyeyle de oynanır: Tab ile gez, Enter ile seç, Esc ile pencereleri kapat.</li>
    </ul>
    <h4>Ceza ve alarm</h4>
    <ul>
      <li>Yanlış nesne: −100 puan, +5 alarm</li>
      <li>Yanlış şifre: −250 puan, +15 alarm</li>
      <li>Yanlış suçlama: +30 alarm</li>
      <li>Alarm 100’e ulaşırsa görev kaybedilir.</li>
    </ul>
    <h4>İpucu</h4>
    <p>Her bilmecenin üç ipucu var: sırasıyla 50, 100 ve 200 puan götürür.
    Hiç ipucu kullanmadan çözersen 250 puan bonus alırsın.</p>
    <div class="btn-row"><button class="btn" data-act="close-modal">Kapat</button></div>`);
}

function openSettings() {
  const saved = Save.read();
  openModal('Ayarlar', `
    <h4>Ses</h4>
    <p class="muted">Bütün sesler tarayıcıda üretilir. Harici müzik veya telifli ses kullanılmaz.</p>
    <div class="btn-row" style="margin-top:0">
      <button class="btn" data-act="toggle-sound">Ses: ${saved.sound ? 'Açık' : 'Kapalı'}</button>
    </div>
    <h4>Kayıtlı veriler</h4>
    <p class="muted">Bu cihazda yalnızca kod adın, en yüksek puanın, ses tercihin ve başarımların saklanır.
    Sunucuya hiçbir şey gönderilmez.</p>
    <div class="btn-row" style="margin-top:0">
      <button class="btn btn-danger" data-act="wipe">Kayıtları Sil</button>
    </div>
    <h4>Başarımlar</h4>
    <ul>${ACHIEVEMENTS.map((a) => `<li><strong>${esc(a.ad)}</strong> — ${esc(a.metin)}
      ${(saved.achievements || []).includes(a.id) ? ' ✓' : ''}</li>`).join('')}</ul>
    <div class="btn-row"><button class="btn" data-act="close-modal">Kapat</button></div>`);
}

function openLog() {
  openModal('Görev günlüğü', S.log.length ? `
    <ul class="log-list">${S.log.slice().reverse().map((l) =>
      `<li><span class="log-t">${esc(l.t)}</span><span>${esc(l.text)}</span></li>`).join('')}</ul>`
    : '<p>Günlük boş.</p>');
}

/* ============================================================================
   15 — OLAY YÖNETİMİ (tek delege dinleyici, satır içi onclick yok)
   ========================================================================== */
document.addEventListener('click', (e) => {
  const t = e.target.closest('[data-act]');
  if (!t) return;
  const act = t.dataset.act;

  Sfx.init();

  switch (act) {
    /* Akış */
    case 'goto-title':  showScreen('screen-title'); break;
    case 'goto-name':   newGame(); refreshTitle(); showScreen('screen-name'); $('#codeName').focus(); break;
    case 'goto-brief': {
      const v = ($('#codeName').value || '').trim().toUpperCase().slice(0, 16);
      if (v.length < 2) { toast('Kod adı en az 2 karakter olmalı.', 'bad'); $('#codeName').focus(); return; }
      S.codeName = v;
      Save.write({ codeName: v });
      $('#briefName').textContent = v;
      $('#btnSkipBrief').disabled = false;
      showScreen('screen-brief');
      runBrief();
      break;
    }
    case 'skip-brief':  finishBrief(); break;
    case 'start-op':    startOperation(); break;
    case 'quit':        quitToTitle(); break;
    case 'again':       newGame(); refreshTitle(); showScreen('screen-name'); break;
    case 'home':        quitToTitle(); break;

    /* Yardım / ayar */
    case 'open-howto':  openHowTo(); break;
    case 'open-settings': openSettings(); break;
    case 'wipe':
      try { localStorage.removeItem(STORAGE_KEY); } catch (err) {}
      toast('Kayıtlar silindi.');
      closeModal(); refreshTitle();
      break;
    case 'toggle-sound': {
      const next = !Save.read().sound;
      Save.write({ sound: next });
      Sfx.on = next;
      $('#btnSound').textContent = next ? '🔊' : '🔇';
      $('#btnSound').setAttribute('aria-label', next ? 'Sesi kapat' : 'Sesi aç');
      if (modalOpen() && $('#modalTitle').textContent === 'Ayarlar') openSettings();
      break;
    }

    /* Oyun içi */
    case 'room':  gotoRoom(t.dataset.room); break;
    case 'obj':   handleObject(t.dataset.obj); break;
    case 'item':
      if (S.selectedItem === t.dataset.item) clearAim();
      else if (S.selectedItem) { tryComboItems(t.dataset.item); }
      else openItem(t.dataset.item);
      break;
    case 'aim':   aimItem(t.dataset.item); break;
    case 'hint':  useHint(); break;
    case 'page':  readPage(Number(t.dataset.page)); break;
    case 'frag':  pickFrag(Number(t.dataset.frag)); break;
    case 'opt':   pickLight(t.dataset.opt); break;

    case 'open-log':      openLog(); break;
    case 'open-evidence': openEvidence(); break;
    case 'open-suspects': openSuspects(); break;
    case 'open-accuse':   openAccuse(); break;
    case 'sus':           pickSuspect(t.dataset.sus); break;
    case 'ev':            pickEvidence(t.dataset.ev); break;
    case 'confirm-accuse': confirmAccuse(); break;

    case 'submit-freq':  submitFreq(); break;
    case 'submit-final': submitFinal(); break;

    case 'close-modal':  closeModal(); break;
  }
});

/* Eşya + eşya birleştirme (UV fener + fotoğraf) */
function tryComboItems(otherId) {
  const key = `${S.selectedItem}|${otherId}`;
  const alt = `${otherId}|${S.selectedItem}`;
  const result = COMBOS[key] || COMBOS[alt];
  if (!result) { toast('Bu ikisi bir işe yaramıyor.', 'bad'); clearAim(); return; }
  clearAim();
  runCombo(result);
}

/* Not parçaları için sürükle-bırak (masaüstü) */
let dragFrom = null;
document.addEventListener('dragstart', (e) => {
  const f = e.target.closest('.frag');
  if (!f) return;
  dragFrom = Number(f.dataset.frag);
  e.dataTransfer.effectAllowed = 'move';
  try { e.dataTransfer.setData('text/plain', String(dragFrom)); } catch (err) {}
});
document.addEventListener('dragover', (e) => {
  const f = e.target.closest('.frag');
  if (!f) return;
  e.preventDefault();
  f.classList.add('dragover');
});
document.addEventListener('dragleave', (e) => {
  const f = e.target.closest('.frag');
  if (f) f.classList.remove('dragover');
});
document.addEventListener('drop', (e) => {
  const f = e.target.closest('.frag');
  if (!f || dragFrom === null) return;
  e.preventDefault();
  f.classList.remove('dragover');
  const to = Number(f.dataset.frag);
  if (to !== dragFrom) swapFrags(dragFrom, to);
  dragFrom = null;
});

/* Klavye */
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    if (modalOpen()) closeModal();
    else if (S && S.selectedItem) clearAim();
  }
  if (e.key === 'Enter' && $('#screen-name').classList.contains('is-active')) {
    e.preventDefault();
    document.querySelector('[data-act="goto-brief"]').click();
  }
});

/* ============================================================================
   16 — GELİŞTİRİCİ MODU
   ========================================================================== */
function buildDevBar() {
  if (!DEV_MODE) return;
  const bar = $('#devbar');
  bar.hidden = false;
  const actions = [
    ['+1000 puan', () => { addScore(1000, 'DEV'); }],
    ['Süre −5dk',  () => { S.time = Math.max(10, S.time - 300); renderHud(); }],
    ['Süre +5dk',  () => { S.time += 300; renderHud(); }],
    ['Alarm +20',  () => addAlarm(20)],
    ['Tüm eşyalar', () => { Object.keys(ITEMS).forEach(addItem); }],
    ['Tüm kanıtlar', () => { Object.keys(EVIDENCE_DB).forEach(addEvidence); }],
    ['Bilmeceleri çöz', () => {
      RIDDLES.forEach((r) => { if (r.id !== 'hoparlor' && !S.solved.includes(r.id)) { S.solved.push(r.id); if (r.gives) S.flags[r.gives] = true; } });
      Object.assign(S.flags, { cekmece_ok: 1, not_ok: 1, guv_ok: 1, radyo_ok: 1, freq_ok: 1, isik_ok: 1 });
      S.codes = { saat: '19', pusula: '23', defter: '07' };
      renderAll();
    }],
    ['Final: başarı', () => endGame('basari')],
    ['Final: sızdı',  () => endGame('sizdi')]
  ];
  actions.forEach(([label, fn]) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.textContent = label;
    b.addEventListener('click', fn);
    bar.appendChild(b);
  });
}

/* ============================================================================
   17 — AÇILIŞ
   ========================================================================== */
(function init() {
  S = freshState();
  refreshTitle();
  buildDevBar();
  showScreen('screen-title');
})();
