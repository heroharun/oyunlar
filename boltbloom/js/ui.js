/* ============================================================
   Bolt Bloom — ui.js
   Ekranlar, HUD, harita, koleksiyon, magaza, gunluk odul,
   ayarlar, modallar, girdi yonetimi, debug paneli
   ============================================================ */
(function () {
  'use strict';
  var BB = window.BB;
  var util = BB.util, CONFIG = BB.CONFIG, R = BB.Renderer, Save = BB.Save;
  var G = BB.Game;

  var ICONS = {
    hammer: 'M3 20l6-6 2 2-6 6zM13 3l8 8-2.5 2.5-2-2-3 3-4-4 3-3-2-2z',
    undo: 'M12 5V2L7 6l5 4V7a5 5 0 1 1-5 5H5a7 7 0 1 0 7-7z',
    brush: 'M4 20c3 1 6-1 6-4l-2-2c-3 0-5 3-4 6zM20 3l-9 9 2 2 9-9c1-1-1-3-2-2z',
    slot: 'M12 4a8 8 0 1 0 0 16 8 8 0 0 0 0-16zm1 7h3v2h-3v3h-2v-3H8v-2h3V8h2z',
    magnet: 'M6 3H3v9a9 9 0 0 0 18 0V3h-3v9a6 6 0 0 1-12 0zM3 14h3v3H3zm15 0h3v3h-3z',
    xray: 'M12 5C6 5 2 12 2 12s4 7 10 7 10-7 10-7-4-7-10-7zm0 11a4 4 0 1 1 0-8 4 4 0 0 1 0 8z',
    swap: 'M7 4l4 4H8v5H6V8H3zm10 16l-4-4h3v-5h2v5h3z',
    coin: 'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm0 3a7 7 0 1 1 0 14 7 7 0 0 1 0-14z',
    star: 'M12 2l3 6.5 7 .9-5 4.8 1.3 7L12 17.8 5.7 21.2 7 14.2 2 9.4l7-.9z',
    lock: 'M17 9V7a5 5 0 0 0-10 0v2H5v12h14V9zm-8-2a3 3 0 0 1 6 0v2H9z',
    gear: 'M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8zm9 4l2 1.5-2 3.4-2.4-.8a7.6 7.6 0 0 1-1.9 1.1l-.5 2.5h-4l-.5-2.5a7.6 7.6 0 0 1-1.9-1.1l-2.4.8-2-3.4L3 12l-2-1.5 2-3.4 2.4.8a7.6 7.6 0 0 1 1.9-1.1L7.8 4h4l.5 2.8a7.6 7.6 0 0 1 1.9 1.1l2.4-.8 2 3.4z'
  };
  function icon(name, cls) {
    return '<svg class="ic ' + (cls || '') + '" viewBox="0 0 24 24" aria-hidden="true"><path d="' + (ICONS[name] || '') + '"/></svg>';
  }

  var UI = {
    current: 'boot',

    /* ================= Ekran yonetimi ================= */
    showScreen: function (name) {
      util.els('.screen').forEach(function (s) {
        s.classList.toggle('active', s.dataset.screen === name);
      });
      this.current = name;
      document.getElementById('app').scrollTop = 0;
      if (name === 'map') this.buildMap();
      if (name === 'collection') this.buildCollection();
      if (name === 'shop') this.buildShop();
      if (name === 'daily') this.buildDaily();
      if (name === 'settings') this.buildSettings();
      if (name === 'menu') this.buildMenu();
    },

    /* ================= HUD ================= */
    updateHud: function () {
      var coins = Save.data.coins;
      util.els('[data-coins]').forEach(function (e) { e.textContent = coins; });
      if (!G.level) return;
      var l = document.getElementById('hudLevel');
      if (l) l.textContent = 'Bolum ' + G.level.id;
      var sub = document.getElementById('hudSub');
      if (sub) {
        var bits = [G.level.objectName];
        if (G.level.moveLimit != null) bits.push('Hamle ' + G.moves + '/' + G.level.moveLimit);
        sub.textContent = bits.join(' · ');
      }
    },
    updateTimer: function () {
      var t = document.getElementById('hudTimer');
      if (!t || !G.level) return;
      if (G.level.timeLimit == null) { t.style.display = 'none'; return; }
      t.style.display = '';
      t.textContent = util.fmtTime(G.timeLeft == null ? 0 : G.timeLeft);
      t.classList.toggle('low', G.timeLeft != null && G.timeLeft < 30);
    },

    renderBoosters: function () {
      var row = document.getElementById('boosterRow');
      if (!row) return;
      row.innerHTML = '';
      BB.Boosters.order.forEach(function (key) {
        var d = BB.Boosters.defs[key];
        var n = Save.data.boosters[key] || 0;
        var b = document.createElement('button');
        b.className = 'booster' + (G.boosterMode === key ? ' selected' : '') + (n <= 0 ? ' empty' : '');
        b.dataset.booster = key;
        b.setAttribute('aria-label', d.name + ', ' + n + ' adet');
        b.innerHTML = icon(d.icon) + '<span class="bname">' + d.name + '</span><span class="badge">' + n + '</span>';
        row.appendChild(b);
      });
    },

    /* ================= Toast ================= */
    toast: function (text, ms) {
      var t = document.getElementById('toast');
      if (!t) return;
      t.textContent = text;
      t.classList.add('show');
      clearTimeout(this._toastT);
      this._toastT = setTimeout(function () { t.classList.remove('show'); }, ms || 1800);
    },

    /* ================= Modallar ================= */
    showModal: function (kind, html) {
      var root = document.getElementById('modalRoot');
      root.innerHTML = '';
      var card = document.createElement('div');
      card.className = 'modal-card modal-' + kind;
      card.innerHTML = html || this.modalHtml(kind);
      root.appendChild(card);
      root.classList.add('open');
      root.dataset.kind = kind;
    },
    hideModal: function () {
      var root = document.getElementById('modalRoot');
      root.classList.remove('open');
      root.innerHTML = '';
    },
    modalHtml: function (kind) {
      if (kind === 'pause') {
        var s = Save.data.settings;
        return '<h2>Duraklatildi</h2>' +
          '<div class="toggles">' +
          this.toggleRow('sfx', 'Ses efektleri', s.sfx) +
          this.toggleRow('music', 'Muzik', s.music) +
          this.toggleRow('vibrate', 'Titresim', s.vibrate) +
          '</div>' +
          '<div class="mbtns">' +
          '<button class="btn primary" data-act="resume">Devam et</button>' +
          '<button class="btn" data-act="restart">Yeniden basla</button>' +
          '<button class="btn ghost" data-act="quit">Bolum haritasi</button>' +
          '</div>';
      }
      return '';
    },
    toggleRow: function (key, label, on) {
      return '<label class="trow"><span>' + label + '</span>' +
        '<button class="switch' + (on ? ' on' : '') + '" role="switch" aria-checked="' + (!!on) + '" data-toggle="' + key + '"><i></i></button></label>';
    },

    pickColor: function (colors, cb) {
      var html = '<h2>Yeni renk sec</h2><div class="colorpick">';
      colors.forEach(function (c) {
        var col = BB.colorOf(c);
        html += '<button class="cpick" data-color="' + c + '" style="--c:' + col.hex + ';--cd:' + col.dark + '" aria-label="' + col.name + '">' +
          BB.screwMarkup(c, 40, 'normal') + '<span>' + col.name + '</span></button>';
      });
      html += '</div><div class="mbtns"><button class="btn ghost" data-act="closeModal">Vazgec</button></div>';
      this.showModal('color', html);
      this._colorCb = cb;
    },

    /* ================= Kazanma / kaybetme ================= */
    showWin: function (d) {
      var stars = '';
      for (var i = 1; i <= 3; i++) stars += '<span class="star' + (i <= d.score.stars ? ' on' : '') + '" style="--i:' + i + '">' + icon('star') + '</span>';
      var rar = BB.RARITY[d.level.rarity];
      var html = '<div class="winhead"><h2>Tamam!</h2><p>' + d.level.name + '</p></div>' +
        '<div class="stars">' + stars + '</div>' +
        '<div class="collectcard" style="--r:' + rar.hex + '">' +
          '<div class="cc-art">' + this.objectThumb(d.level) + '</div>' +
          '<div class="cc-meta"><strong>' + d.level.objectName + '</strong>' +
          '<span>' + rar.name + ' · Bolum ' + d.level.id + '</span></div>' +
          (d.first ? '<div class="cc-new">YENI</div>' : '') +
        '</div>' +
        '<ul class="statlist">' +
        '<li><span>Skor</span><b data-count="' + d.score.score + '">0</b></li>' +
        '<li><span>Hamle</span><b>' + d.moves + '</b></li>' +
        '<li><span>Sure</span><b>' + util.fmtTime(d.time) + '</b></li>' +
        '<li><span>Bos yuva bonusu</span><b>' + (d.score.emptySlots * CONFIG.score.emptyReserveSlot) + '</b></li>' +
        (d.mistakes === 0 ? '<li class="hl"><span>Hatasiz cozum</span><b>+' + CONFIG.score.perfectBonus + '</b></li>' : '') +
        (d.gold ? '<li class="hl"><span>Altin vida</span><b>' + d.gold + '</b></li>' : '') +
        '<li class="coinrow"><span>Kazanilan</span><b>' + icon('coin') + ' ' + d.coins + '</b></li>' +
        '</ul>' +
        '<div class="mbtns">' +
        (d.level.id < BB.LEVELS.length ? '<button class="btn primary" data-act="next">Sonraki bolum</button>' : '<button class="btn primary" data-act="quit">Haritaya don</button>') +
        '<button class="btn" data-act="replay">Tekrar oyna</button>' +
        '<button class="btn ghost" data-act="quit">Harita</button>' +
        '</div>';
      this.showModal('win', html);
      this.countUp();
      BB.Particles.rain(50);
    },
    countUp: function () {
      var el = document.querySelector('[data-count]');
      if (!el) return;
      var target = Number(el.dataset.count) || 0;
      var t0 = util.now();
      function step() {
        var t = util.clamp((util.now() - t0) / 900, 0, 1);
        el.textContent = Math.round(target * util.easeOut(t));
        if (t < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    },

    showLose: function (reason) {
      var titles = { tray: 'Yuvalar doldu', time: 'Sure bitti', moves: 'Hamle hakkin bitti' };
      var hints = {
        tray: 'Bekleme alanindaki tum yuvalar doldu. Vidalari acik kutulara gonderecek sirayi kur.',
        time: 'Bu bolumde sure sinirli. Once kutu rengine uyan vidalari topla.',
        moves: 'Hamle sinirina takildin. Bos yere bekleme yuvasi doldurma.'
      };
      var inv = Save.data.boosters;
      var html = '<h2>' + (titles[reason] || 'Bolum bitti') + '</h2>' +
        '<p class="losehint">' + (hints[reason] || '') + '</p>' +
        '<div class="mbtns">' +
        '<button class="btn primary" data-act="undoLose"' + (inv.undo > 0 ? '' : ' disabled') + '>Son hamleyi geri al (' + (inv.undo || 0) + ')</button>' +
        (reason === 'tray' ? '<button class="btn" data-act="addSlot"' + (inv.slot > 0 ? '' : ' disabled') + '>Ek yuva ac (' + (inv.slot || 0) + ')</button>' : '') +
        '<button class="btn" data-act="restart">Yeniden basla</button>' +
        '<button class="btn ghost" data-act="quit">Ana harita</button>' +
        '</div>';
      this.showModal('lose', html);
    },

    objectThumb: function (level) {
      var tpl = BB.OBJECTS[level.objectType];
      if (!tpl) return '';
      var tones = (BB.THEMES[level.theme] || BB.THEMES.workshop).tones;
      var s = '<svg viewBox="-200 -220 400 440" aria-hidden="true">';
      tpl.pieces.slice().sort(function (a, b) { return a.l - b.l; }).forEach(function (p) {
        var tone = tones[p.t % tones.length];
        s += '<g transform="translate(' + p.x + ' ' + p.y + ') rotate(' + (p.r || 0) + ')">' +
          '<path d="' + BB.shapePath(p.s, p.w, p.h) + '" fill="' + tone + '" stroke="' + BB.shade(tone, -0.4) + '" stroke-width="3"/>' +
          '</g>';
      });
      return s + '</svg>';
    },

    /* ================= Ana menu ================= */
    buildMenu: function () {
      var last = 0;
      for (var k in Save.data.collection) if (Save.data.collection[k]) last = Math.max(last, Number(k));
      var box = document.getElementById('menuLast');
      if (!box) return;
      if (!last) {
        box.innerHTML = '<div class="lastempty">Ilk nesneni onardiginda burada gorunecek.</div>';
      } else {
        var def = BB.levelDef(last);
        var tpl = BB.OBJECTS[def.objectType];
        box.innerHTML = '<div class="lastcard">' + this.objectThumb({ objectType: def.objectType, theme: def.theme }) +
          '<div><span class="eyebrow">Son onarilan</span><strong>' + tpl.name + '</strong></div></div>';
      }
      var totalStars = 0;
      for (var s in Save.data.stars) totalStars += Save.data.stars[s];
      var st = document.getElementById('menuStars');
      if (st) st.textContent = totalStars + ' / ' + (BB.LEVELS.length * 3);
    },

    /* ================= Bolum haritasi ================= */
    buildMap: function () {
      var wrap = document.getElementById('mapScroll');
      if (!wrap) return;
      wrap.innerHTML = '';
      var unlocked = Save.data.unlocked;
      BB.REGIONS.slice().reverse().forEach(function (reg) {
        var th = BB.THEMES[reg.key];
        var sec = document.createElement('section');
        sec.className = 'region';
        sec.style.setProperty('--ra', th.bgA);
        sec.style.setProperty('--rb', th.bgB);
        var ids = [];
        for (var i = reg.to; i >= reg.from; i--) ids.push(i);
        var nodes = ids.map(function (id, k) {
          var def = BB.levelDef(id);
          var stars = Save.data.stars[id] || 0;
          var locked = id > unlocked;
          var cur = id === unlocked;
          var st = '';
          for (var s = 1; s <= 3; s++) st += '<i class="' + (s <= stars ? 'on' : '') + '"></i>';
          return '<button class="node' + (locked ? ' locked' : '') + (cur ? ' current' : '') + (stars ? ' done' : '') +
            (def.boss ? ' boss' : '') + '" data-level="' + id + '" style="--side:' + (k % 2 ? 1 : -1) + '"' +
            (locked ? ' disabled aria-disabled="true"' : '') + ' aria-label="Bolum ' + id + ': ' + def.name + '">' +
            '<span class="nodenum">' + id + '</span>' +
            '<span class="nodestars">' + st + '</span>' +
            (locked ? '<span class="nodelock">' + icon('lock') + '</span>' : '') +
            (def.gift ? '<span class="nodegift">🎁</span>' : '') +
            '</button>';
        }).join('');
        sec.innerHTML = '<h3 class="regionname">' + th.name + '</h3><div class="nodes">' + nodes + '</div>';
        wrap.appendChild(sec);
      });
      var cur = wrap.querySelector('.node.current');
      if (cur) setTimeout(function () { cur.scrollIntoView({ block: 'center', behavior: 'auto' }); }, 30);
    },

    /* ================= Koleksiyon ================= */
    buildCollection: function () {
      var grid = document.getElementById('collGrid');
      if (!grid) return;
      grid.innerHTML = '';
      BB.LEVELS.forEach(function (def) {
        var tpl = BB.OBJECTS[def.objectType];
        var owned = !!Save.data.collection[def.id];
        var rar = BB.RARITY[(tpl && tpl.rarity) || 'common'];
        var stars = Save.data.stars[def.id] || 0;
        var st = '';
        for (var s = 1; s <= 3; s++) st += '<i class="' + (s <= stars ? 'on' : '') + '"></i>';
        var card = document.createElement('article');
        card.className = 'ccard' + (owned ? '' : ' silhouette');
        card.style.setProperty('--r', rar.hex);
        card.innerHTML = '<div class="cc-art">' + UI.objectThumb({ objectType: def.objectType, theme: def.theme }) + '</div>' +
          '<div class="cc-meta"><strong>' + (owned ? tpl.name : '???') + '</strong>' +
          '<span>Bolum ' + def.id + ' · ' + rar.name + '</span>' +
          '<span class="ccstars">' + st + '</span></div>';
        grid.appendChild(card);
      });
      var owned = BB.LEVELS.filter(function (d) { return Save.data.collection[d.id]; }).length;
      var head = document.getElementById('collCount');
      if (head) head.textContent = owned + ' / ' + BB.LEVELS.length;
    },

    /* ================= Magaza ================= */
    buildShop: function () {
      var grid = document.getElementById('shopGrid');
      if (!grid) return;
      grid.innerHTML = '';
      BB.Boosters.order.forEach(function (key) {
        var d = BB.Boosters.defs[key];
        var price = CONFIG.boosterPrices[key];
        var have = Save.data.boosters[key] || 0;
        var it = document.createElement('article');
        it.className = 'shopitem';
        it.innerHTML = '<div class="si-ic">' + icon(d.icon) + '</div>' +
          '<div class="si-body"><strong>' + d.name + '</strong><span>' + d.hint + '</span>' +
          '<span class="si-have">Elinde: ' + have + '</span></div>' +
          '<button class="btn small" data-buy="' + key + '">' + icon('coin') + ' ' + price + '</button>';
        grid.appendChild(it);
      });
      var extra = document.createElement('div');
      extra.className = 'shopnote';
      extra.innerHTML = '<strong>Gercek para paketleri</strong>' +
        '<p>Bu prototipte odeme sistemi yok. Alan hazir, baglanti sonra eklenir.</p>' +
        '<div class="fakepacks">' +
        '<button class="btn ghost small" data-act="soon">Kucuk kasa</button>' +
        '<button class="btn ghost small" data-act="soon">Buyuk kasa</button>' +
        '<button class="btn ghost small" data-act="soon">Reklamsiz</button>' +
        '</div>';
      grid.appendChild(extra);
    },

    /* ================= Gunluk odul ================= */
    dailyRewards: [
      { label: '50 coin', type: 'coins', v: 50 },
      { label: '1 Geri Al', type: 'undo', v: 1 },
      { label: '75 coin', type: 'coins', v: 75 },
      { label: '1 Cekic', type: 'hammer', v: 1 },
      { label: '100 coin', type: 'coins', v: 100 },
      { label: '1 Ek Yuva', type: 'slot', v: 1 },
      { label: 'Ozel kutu gorunumu', type: 'skin', v: 1 }
    ],
    todayKey: function () {
      var d = new Date();
      return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate();
    },
    buildDaily: function () {
      var grid = document.getElementById('dailyGrid');
      if (!grid) return;
      var dd = Save.data.daily;
      var claimedToday = dd.last === this.todayKey();
      var day = util.clamp(dd.streak, 0, 7);
      grid.innerHTML = '';
      this.dailyRewards.forEach(function (r, i) {
        var got = i < day;
        var isNext = (i === day % 7) && !claimedToday;
        var c = document.createElement('div');
        c.className = 'dayitem' + (got ? ' got' : '') + (isNext ? ' next' : '');
        c.innerHTML = '<span class="dn">' + (i + 1) + '. gun</span><strong>' + r.label + '</strong>';
        grid.appendChild(c);
      });
      var btn = document.getElementById('dailyClaim');
      if (btn) {
        btn.disabled = claimedToday;
        btn.textContent = claimedToday ? 'Bugun alindi' : 'Odulu al';
      }
      var note = document.getElementById('dailyNote');
      if (note) note.textContent = claimedToday ? 'Yarin tekrar gel. Seri: ' + dd.streak + ' gun.' : 'Seri: ' + dd.streak + ' gun.';
    },
    claimDaily: function () {
      var dd = Save.data.daily;
      if (dd.last === this.todayKey()) { this.toast('Bugunun odulu zaten alindi.', 1600); return; }
      var idx = dd.streak % 7;
      var r = this.dailyRewards[idx];
      if (r.type === 'coins') Save.addCoins(r.v);
      else if (r.type === 'skin') { Save.data.boxSkin = true; Save.addCoins(120); }
      else Save.data.boosters[r.type] = (Save.data.boosters[r.type] || 0) + r.v;
      dd.streak = dd.streak + 1;
      dd.last = this.todayKey();
      Save.save();
      BB.Audio.play('coin');
      this.toast(r.label + ' alindi.', 2000);
      this.buildDaily();
      this.updateHud();
      BB.Particles.rain(30);
    },

    /* ================= Ayarlar ================= */
    buildSettings: function () {
      var list = document.getElementById('settingsList');
      if (!list) return;
      var s = Save.data.settings;
      list.innerHTML =
        this.toggleRow('sfx', 'Ses efektleri', s.sfx) +
        this.toggleRow('music', 'Muzik', s.music) +
        this.toggleRow('vibrate', 'Titresim', s.vibrate) +
        this.toggleRow('colorblind', 'Renk korlugu modu', s.colorblind) +
        this.toggleRow('reducedMotion', 'Azaltilmis hareket', s.reducedMotion) +
        this.toggleRow('tutorial', 'Ogreticiyi goster', s.tutorial) +
        '<div class="setnote">Surum ' + CONFIG.version + '</div>' +
        '<button class="btn danger" data-act="resetData">Veriyi sifirla</button>';
    },

    /* ================= Ogretici katmani ================= */
    showTutorial: function (text, targetEl, isLast) {
      var root = document.getElementById('tutorialRoot');
      root.classList.add('open');
      var hole = '';
      if (targetEl) {
        var r = targetEl.getBoundingClientRect();
        var host = document.getElementById('app').getBoundingClientRect();
        var cx = r.left + r.width / 2 - host.left, cy = r.top + r.height / 2 - host.top;
        var rad = Math.max(r.width, r.height) / 2 + 22;
        hole = '<div class="tut-hole" style="left:' + cx + 'px;top:' + cy + 'px;width:' + rad * 2 + 'px;height:' + rad * 2 + 'px"></div>' +
          '<div class="tut-hand" style="left:' + cx + 'px;top:' + (cy + rad * 0.7) + 'px"></div>';
      }
      root.innerHTML = hole +
        '<div class="tut-card"><div class="tut-pip">' + this.pipSvg() + '</div>' +
        '<p>' + text + '</p>' +
        '<div class="tut-btns">' +
        (targetEl && !isLast ? '' : '<button class="btn primary small" data-act="tutNext">' + (isLast ? 'Basla' : 'Devam') + '</button>') +
        (isLast ? '' : '<button class="btn ghost small" data-act="tutSkip">Atla</button>') +
        '</div></div>';
    },
    hideTutorial: function () {
      var root = document.getElementById('tutorialRoot');
      root.classList.remove('open');
      root.innerHTML = '';
    },
    pipSvg: function () {
      return '<svg viewBox="-30 -30 60 60" aria-hidden="true">' +
        '<circle cx="0" cy="4" r="22" fill="#8FD8E8" stroke="#2B2440" stroke-width="3"/>' +
        '<circle cx="0" cy="0" r="15" fill="#FFF8EE" stroke="#2B2440" stroke-width="2.5"/>' +
        '<circle cx="-5" cy="-1" r="3.2" fill="#2B2440"/><circle cx="5" cy="-1" r="3.2" fill="#2B2440"/>' +
        '<path d="M-5 7q5 4 10 0" stroke="#2B2440" stroke-width="2.4" fill="none" stroke-linecap="round"/>' +
        '<rect x="-2" y="-30" width="4" height="9" rx="2" fill="#2B2440"/><circle cx="0" cy="-31" r="4" fill="#F2A03D" stroke="#2B2440" stroke-width="2"/>' +
        '</svg>';
    },

    /* ================= Debug ================= */
    buildDebug: function () {
      var p = document.getElementById('debugPanel');
      p.classList.add('on');
      p.innerHTML = '<div class="dbg-head">DEBUG <button data-act="dbgClose">x</button></div>' +
        '<div class="dbg-row"><label>Bolum</label><input id="dbgLevel" type="number" min="1" max="' + BB.LEVELS.length + '" value="1"><button data-act="dbgGo">Git</button></div>' +
        '<div class="dbg-row">' +
        '<button data-act="dbgCoins">+1000 coin</button>' +
        '<button data-act="dbgBoosters">+9 booster</button>' +
        '</div><div class="dbg-row">' +
        '<button data-act="dbgReveal">Tum vidalar</button>' +
        '<button data-act="dbgHitbox">Hitbox</button>' +
        '</div><div class="dbg-row">' +
        '<button data-act="dbgWin">Kazan</button>' +
        '<button data-act="dbgLose">Kaybet</button>' +
        '</div><div class="dbg-row">' +
        '<button data-act="dbgQueue">Kutu sirasi</button>' +
        '<button data-act="dbgReset">LocalStorage sifirla</button>' +
        '</div><div class="dbg-fps" id="dbgFps">fps —</div><pre id="dbgOut"></pre>';
      var fpsEl = document.getElementById('dbgFps');
      var frames = 0, t0 = util.now();
      function tick() {
        frames++;
        var now = util.now();
        if (now - t0 > 500) {
          var fps = Math.round(frames * 1000 / (now - t0));
          fpsEl.textContent = 'fps ' + fps;
          if (fps < CONFIG.lowFpsThreshold) BB.Particles.quality = 0.4;
          frames = 0; t0 = now;
        }
        requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
    }
  };

  /* ============================================================
     Girdi yonetimi
     ============================================================ */
  var Input = {
    pointers: {},
    dragging: false,
    startCam: null,
    startPt: null,
    moved: 0,
    lastTapT: 0,
    pinchDist: 0,

    init: function () {
      var stage = document.getElementById('stageWrap');
      var self = this;
      stage.addEventListener('pointerdown', function (e) { self.down(e); });
      stage.addEventListener('pointermove', function (e) { self.move(e); });
      stage.addEventListener('pointerup', function (e) { self.up(e); });
      stage.addEventListener('pointercancel', function (e) { self.up(e); });
      stage.addEventListener('wheel', function (e) {
        e.preventDefault();
        R.setCamera(R.cam.rot, R.cam.tilt, R.cam.zoom + (e.deltaY < 0 ? CONFIG.zoom.step : -CONFIG.zoom.step));
      }, { passive: false });
      stage.addEventListener('contextmenu', function (e) { e.preventDefault(); });

      document.addEventListener('keydown', function (e) { self.key(e); });

      // Klavye erisimi: vidalar odaklanabilir
      document.getElementById('stage').addEventListener('keydown', function (e) {
        if (e.key !== 'Enter' && e.key !== ' ') return;
        var g = e.target.closest ? e.target.closest('.screw') : null;
        if (g) { e.preventDefault(); G.tapScrew(g.dataset.id); }
      });
    },

    down: function (e) {
      this.pointers[e.pointerId] = { x: e.clientX, y: e.clientY };
      var n = Object.keys(this.pointers).length;
      if (n === 1) {
        this.startPt = { x: e.clientX, y: e.clientY };
        this.startCam = { rot: R.cam.rot, tilt: R.cam.tilt };
        this.moved = 0;
        this.dragging = true;
        this.screwTarget = e.target.closest ? e.target.closest('.screw') : null;
        try { e.target.setPointerCapture && e.target.setPointerCapture(e.pointerId); } catch (err) { }
      } else if (n === 2) {
        this.dragging = false;
        this.pinchDist = this.dist();
        this.startZoom = R.cam.zoom;
      }
    },
    dist: function () {
      var k = Object.keys(this.pointers);
      if (k.length < 2) return 0;
      var a = this.pointers[k[0]], b = this.pointers[k[1]];
      return Math.hypot(a.x - b.x, a.y - b.y);
    },
    move: function (e) {
      if (!this.pointers[e.pointerId]) return;
      this.pointers[e.pointerId] = { x: e.clientX, y: e.clientY };
      var n = Object.keys(this.pointers).length;
      if (n >= 2) {
        var d = this.dist();
        if (this.pinchDist > 0) R.setCamera(R.cam.rot, R.cam.tilt, this.startZoom * (d / this.pinchDist));
        return;
      }
      if (!this.dragging || !this.startPt) return;
      var dx = e.clientX - this.startPt.x, dy = e.clientY - this.startPt.y;
      this.moved = Math.max(this.moved, Math.hypot(dx, dy));
      if (this.moved > 9) {
        R.setCamera(this.startCam.rot + dx * 0.12, this.startCam.tilt - dy * 0.05, R.cam.zoom);
      }
    },
    up: function (e) {
      var wasDragging = this.dragging, moved = this.moved, target = this.screwTarget;
      delete this.pointers[e.pointerId];
      if (Object.keys(this.pointers).length === 0) {
        this.dragging = false;
        this.pinchDist = 0;
      }
      if (!wasDragging) return;
      if (moved > 9) return;
      if (target) {
        G.tapScrew(target.dataset.id);
      } else {
        var now = util.now();
        if (now - this.lastTapT < 320) { R.setCamera(0, 0, 1); UI.toast('Kamera sifirlandi', 900); }
        this.lastTapT = now;
        if (G.boosterMode) BB.Boosters.cancel();
      }
      this.screwTarget = null;
    },
    key: function (e) {
      if (UI.current !== 'game') return;
      var k = e.key.toLowerCase();
      if (k === 'escape') { e.preventDefault(); G.state === G.STATES.PAUSED ? G.resume() : G.pause(); }
      if (G.state !== G.STATES.PLAYING) return;
      if (k === 'r') { R.setCamera(0, 0, 1); }
      if (k === 'z') { if (Save.data.boosters.undo > 0) BB.Boosters.use('undo'); else UI.toast('Geri al booster kalmadi.', 1400); }
      if (k === ' ' && e.target === document.body) { e.preventDefault(); G.showHint(); }
      if (k === '+' || k === '=') R.setCamera(R.cam.rot, R.cam.tilt, R.cam.zoom + CONFIG.zoom.step);
      if (k === '-') R.setCamera(R.cam.rot, R.cam.tilt, R.cam.zoom - CONFIG.zoom.step);
    }
  };

  /* ============================================================
     Global tiklama yonlendirmesi (delegasyon)
     ============================================================ */
  function onClick(e) {
    var t = e.target.closest ? e.target.closest('[data-act],[data-nav],[data-level],[data-booster],[data-buy],[data-toggle],[data-color],[data-cam],.tslot,.box') : null;
    if (!t) return;

    if (t.dataset.nav) { BB.Audio.unlock(); UI.showScreen(t.dataset.nav); return; }
    if (t.dataset.level) { BB.Audio.unlock(); G.start(Number(t.dataset.level)); return; }
    if (t.dataset.booster) { BB.Boosters.use(t.dataset.booster); return; }
    if (t.dataset.cam) {
      if (t.dataset.cam === 'in') R.setCamera(R.cam.rot, R.cam.tilt, R.cam.zoom + CONFIG.zoom.step);
      if (t.dataset.cam === 'out') R.setCamera(R.cam.rot, R.cam.tilt, R.cam.zoom - CONFIG.zoom.step);
      if (t.dataset.cam === 'reset') R.setCamera(0, 0, 1);
      return;
    }
    if (t.dataset.buy) {
      var key = t.dataset.buy, price = CONFIG.boosterPrices[key];
      if (Save.spendCoins(price)) {
        Save.data.boosters[key] = (Save.data.boosters[key] || 0) + 1;
        Save.save(); BB.Audio.play('coin');
        UI.toast(BB.Boosters.defs[key].name + ' alindi.', 1500);
        UI.buildShop(); UI.updateHud(); UI.renderBoosters();
      } else { BB.Audio.play('warn'); UI.toast('Yeterli Gear Coin yok.', 1600); }
      return;
    }
    if (t.dataset.toggle) {
      var kk = t.dataset.toggle;
      var s = Save.data.settings;
      s[kk] = !s[kk];
      Save.save();
      t.classList.toggle('on', s[kk]);
      t.setAttribute('aria-checked', String(!!s[kk]));
      if (kk === 'music') BB.Audio.setMusic(s[kk]);
      if (kk === 'colorblind' && G.level && UI.current === 'game') {
        R.buildDefs(G.level);
        G.level.screws.forEach(function (sc) { R.setScrewColor(sc); });
        R.renderBoxes(G); R.renderTray(G);
      }
      if (kk === 'reducedMotion') document.body.classList.toggle('reduced', s[kk]);
      return;
    }
    if (t.dataset.color) {
      var cb = UI._colorCb; UI._colorCb = null;
      UI.hideModal();
      if (cb) cb(t.dataset.color);
      return;
    }
    if (t.classList.contains('tslot') && G.boosterMode === 'brush') {
      BB.Boosters.applyToReserve(Number(t.dataset.i)); return;
    }
    if (t.classList.contains('box') && G.boosterMode === 'swap') {
      BB.Boosters.applyToBox(Number(t.dataset.index)); return;
    }

    var act = t.dataset.act;
    if (!act) return;
    switch (act) {
      case 'boot': BB.Audio.unlock(); UI.showScreen('menu'); break;
      case 'play':
        BB.Audio.unlock();
        UI.showScreen('map');
        break;
      case 'continue':
        BB.Audio.unlock();
        G.start(Math.min(Save.data.unlocked, BB.LEVELS.length));
        break;
      case 'pause': G.pause(); break;
      case 'resume': G.resume(); break;
      case 'restart': UI.hideModal(); G.start(G.level.id); break;
      case 'quit': UI.hideModal(); G.quit(); break;
      case 'next':
        UI.hideModal();
        G.start(Math.min(G.level.id + 1, BB.LEVELS.length));
        break;
      case 'replay': UI.hideModal(); G.start(G.level.id); break;
      case 'undoLose':
        if ((Save.data.boosters.undo || 0) <= 0) { UI.toast('Geri al kalmadi.', 1500); break; }
        UI.hideModal();
        G.setState(G.STATES.PLAYING);
        G.busy = false;
        if (G.undo(false)) BB.Boosters.consume('undo');
        break;
      case 'addSlot':
        if ((Save.data.boosters.slot || 0) <= 0) { UI.toast('Ek yuva kalmadi.', 1500); break; }
        UI.hideModal();
        G.setState(G.STATES.PLAYING);
        G.busy = false;
        G.addReserveSlot();
        BB.Boosters.consume('slot');
        G.autoTransfer().then(function () { G.checkWin(); });
        break;
      case 'closeModal': UI._colorCb = null; UI.hideModal(); break;
      case 'tutNext': BB.Tutorial.next(); break;
      case 'tutSkip': BB.Tutorial.skip(); break;
      case 'claimDaily': UI.claimDaily(); break;
      case 'soon': UI.toast('Bu bolum prototipte kapali.', 1600); break;
      case 'resetData':
        UI.showModal('confirm', '<h2>Emin misin?</h2><p class="losehint">Tum ilerleme, para ve koleksiyon silinecek.</p>' +
          '<div class="mbtns"><button class="btn danger" data-act="resetYes">Evet, sifirla</button><button class="btn ghost" data-act="closeModal">Vazgec</button></div>');
        break;
      case 'resetYes':
        Save.reset(); UI.hideModal(); UI.buildSettings(); UI.updateHud();
        UI.toast('Veriler sifirlandi.', 1600);
        break;
      // debug
      case 'dbgClose': document.getElementById('debugPanel').classList.remove('on'); break;
      case 'dbgGo': G.start(util.clamp(Number(document.getElementById('dbgLevel').value) || 1, 1, BB.LEVELS.length)); break;
      case 'dbgCoins': Save.addCoins(1000); UI.updateHud(); break;
      case 'dbgBoosters':
        for (var b in Save.data.boosters) Save.data.boosters[b] = 9;
        Save.save(); UI.renderBoosters(); break;
      case 'dbgReveal':
        if (!G.level) break;
        G.xray = !G.xray; R.syncVisibility(G.level, G.xray); break;
      case 'dbgHitbox':
        document.getElementById('app').classList.toggle('showhit'); break;
      case 'dbgWin':
        if (!G.level) break;
        G.level.screws.forEach(function (s) { s.state = 'boxed'; });
        G.level.pieces.forEach(function (p) { p.state = 'gone'; });
        G.reserve = G.reserve.map(function () { return null; });
        G.pendingFlights = 0; G.fallingCount = 0;
        R.syncVisibility(G.level, false); G.checkWin(); break;
      case 'dbgLose': G.lose('tray'); break;
      case 'dbgQueue':
        if (!G.level) break;
        document.getElementById('dbgOut').textContent =
          'sirada: ' + G.level.boxQueue.slice(G.level.queueIndex).join(', ') +
          '\naktif: ' + G.boxes.map(function (b) { return b ? b.color + ' ' + b.count + '/' + b.cap : '-'; }).join(' | ');
        break;
      case 'dbgReset': Save.reset(); UI.toast('Sifirlandi.', 1200); break;
    }
  }

  /* ============================================================
     Baslatma
     ============================================================ */
  function boot() {
    Save.load();
    document.body.classList.toggle('reduced', !!Save.data.settings.reducedMotion);
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      Save.data.settings.reducedMotion = true;
      document.body.classList.add('reduced');
    }
    R.init();
    Input.init();
    document.addEventListener('click', onClick);
    document.addEventListener('pointerdown', function once() {
      BB.Audio.unlock();
      document.removeEventListener('pointerdown', once);
    });
    document.addEventListener('visibilitychange', function () {
      if (document.hidden && G.state === G.STATES.PLAYING) G.pause();
      G.lastTick = util.now();
    });
    window.addEventListener('resize', function () {
      BB.Particles.resize();
      if (G.level && UI.current === 'game') { R.renderBoxes(G); R.renderTray(G); }
    });
    window.addEventListener('error', function (ev) {
      console.error('[BoltBloom] Beklenmeyen hata:', ev.message);
    });

    UI.updateHud();
    UI.showScreen('boot');
    if (/[?&]debug=1/.test(location.search)) { G.debug = true; UI.buildDebug(); }
    console.log('%cBolt Bloom ' + CONFIG.version + ' hazir. Debug icin ?debug=1', 'color:#F2A03D;font-weight:bold');
  }

  BB.UI = UI;
  BB.Input = Input;

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
