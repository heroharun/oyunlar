/* ============================================================
   Bolt Bloom — game.js
   Oyun durumu, vida mantigi, kutular, tepsi, boosterlar,
   geri alma, ipucu, ogretici, skor
   ============================================================ */
(function () {
  'use strict';
  var BB = window.BB;
  var util = BB.util, CONFIG = BB.CONFIG, R = BB.Renderer, P = BB.Particles;

  var STATES = { BOOT: 'BOOT', MENU: 'MENU', LEVEL_SELECT: 'LEVEL_SELECT', PLAYING: 'PLAYING', PAUSED: 'PAUSED', WIN: 'WIN', LOSE: 'LOSE', TRANSITION: 'TRANSITION' };

  var Game = {
    STATES: STATES,
    state: STATES.BOOT,
    level: null,
    boxes: [],
    reserve: [],
    reserveOrder: 0,
    moves: 0,
    mistakes: 0,
    boosterUsed: 0,
    goldTaken: 0,
    elapsed: 0,
    timeLeft: null,
    undoStack: [],
    busy: false,
    pendingFlights: 0,
    fallingCount: 0,
    boosterMode: null,
    lastAction: 0,
    hintTimer: null,
    rafId: null,
    lastTick: 0,
    debug: false,
    showHitbox: false,

    /* ================= Bolum baslatma ================= */
    start: function (levelId) {
      BB.cancelAnims();
      P.clear();
      this.level = BB.buildLevel(levelId);
      var L = this.level;
      this.boxes = [];
      L.queueIndex = 0;
      for (var i = 0; i < L.activeBoxes; i++) this.pullBox(i);
      this.reserve = [];
      for (var j = 0; j < L.reserveSlots; j++) this.reserve.push(null);
      this.reserveOrder = 0;
      this.moves = 0; this.mistakes = 0; this.boosterUsed = 0; this.goldTaken = 0;
      this.elapsed = 0;
      this.timeLeft = L.timeLimit;
      this.undoStack = [];
      this.busy = false; this.pendingFlights = 0; this.fallingCount = 0;
      this.boosterMode = null;
      this.xray = false;

      document.body.dataset.theme = L.theme;
      var stageWrap = document.getElementById('stageWrap');
      stageWrap.style.setProperty('--bgA', L.themeData.bgA);
      stageWrap.style.setProperty('--bgB', L.themeData.bgB);
      stageWrap.style.setProperty('--glow', L.themeData.glow);

      R.build(L);
      R.setCamera(0, 0, 1);
      R.syncVisibility(L, false);
      R.renderBoxes(this);
      R.renderTray(this);
      BB.UI.renderBoosters();
      BB.UI.updateHud();
      BB.UI.showScreen('game');
      this.setState(STATES.PLAYING);
      this.touch();
      this.startLoop();

      if (L.tutorial && BB.Save.data.settings.tutorial) BB.Tutorial.start();
      else BB.UI.toast(L.name + ' — ' + L.brief, 2600);
    },

    pullBox: function (index) {
      var L = this.level;
      while (L.queueIndex < L.boxQueue.length) {
        var color = L.boxQueue[L.queueIndex++];
        if (this.remainingOfColor(color) <= 0) continue;   // artik o renkten vida yok
        this.boxes[index] = { color: color, cap: CONFIG.boxCapacity, count: 0, shown: 0, id: 'b' + (L.queueIndex) + '_' + index };
        return true;
      }
      this.boxes[index] = null;
      return false;
    },

    remainingOfColor: function (color, exclude) {
      var n = 0;
      this.level.screws.forEach(function (s) {
        if (s === exclude) return;
        if (s.color !== color) return;
        if (s.state === 'board' || s.state === 'moving' || s.state === 'reserved') n++;
      });
      return n;
    },

    setState: function (s) { this.state = s; document.body.dataset.state = s; },

    /* ================= Ana dongu (sure/ipucu) ================= */
    startLoop: function () {
      var self = this;
      if (this.rafId) cancelAnimationFrame(this.rafId);
      this.lastTick = util.now();
      function loop() {
        var now = util.now();
        var dt = Math.min(200, now - self.lastTick);
        self.lastTick = now;
        if (self.state === STATES.PLAYING) {
          self.elapsed += dt / 1000;
          if (self.timeLeft != null) {
            self.timeLeft -= dt / 1000;
            if (self.timeLeft <= 0) { self.timeLeft = 0; self.lose('time'); }
          }
          self.tickTimed(dt);
          if (!self.busy && now - self.lastAction > CONFIG.hintIdleMs) {
            self.showHint();
            self.touch();
          }
          BB.UI.updateTimer();
        }
        self.rafId = requestAnimationFrame(loop);
      }
      this.rafId = requestAnimationFrame(loop);
    },
    stopLoop: function () { if (this.rafId) { cancelAnimationFrame(this.rafId); this.rafId = null; } },
    touch: function () { this.lastAction = util.now(); R.clearHints(); },

    // Zamanli vidalar
    tickTimed: function (dt) {
      var self = this;
      this.level.screws.forEach(function (s) {
        if (s.type !== 'timed' || s.state !== 'board') return;
        if (s.locked) {
          s.lockLeft = (s.lockLeft || 0) - dt;
          if (s.lockLeft <= 0) { s.locked = false; s.timer = 8000; R.refreshScrew(s); }
          return;
        }
        if (!self.isAccessible(s)) { s.timer = null; return; }
        if (s.timer == null) s.timer = 8000;
        s.timer -= dt;
        var el = R.screwEls[s.id];
        if (el) {
          var ring = el.querySelector('.timed-ring');
          if (ring) {
            var total = 2 * Math.PI * (s.type === 'bigNut' ? 21 : 18);
            ring.setAttribute('stroke-dashoffset', (total * (1 - util.clamp(s.timer / 8000, 0, 1))).toFixed(1));
          }
        }
        if (s.timer <= 0) {
          s.locked = true; s.lockLeft = 4000; s.timer = null;
          R.refreshScrew(s);
          BB.Audio.play('warn');
        }
      });
    },

    /* ================= Erisebilirlik ================= */
    findScrew: function (id) {
      for (var i = 0; i < this.level.screws.length; i++) if (this.level.screws[i].id === id) return this.level.screws[i];
      return null;
    },
    findPiece: function (id) {
      for (var i = 0; i < this.level.pieces.length; i++) if (this.level.pieces[i].id === id) return this.level.pieces[i];
      return null;
    },
    isBlocked: function (s) {
      var self = this;
      return s.blockedBy.some(function (pid) {
        var p = self.findPiece(pid);
        return p && p.state !== 'gone';
      });
    },
    isAccessible: function (s) {
      if (!s || s.state !== 'board') return false;
      if (s.locked) return false;
      if (this.isBlocked(s)) return false;
      if (s.type === 'chained' && s.chainWith) {
        var o = this.findScrew(s.chainWith);
        if (o && o.state === 'board') return false;
      }
      return true;
    },

    /* ================= Vidaya dokunma ================= */
    tapScrew: function (id) {
      if (this.state !== STATES.PLAYING) return;
      var s = this.findScrew(id);
      if (!s) return;
      this.touch();

      if (this.boosterMode) { BB.Boosters.applyToScrew(s); return; }
      if (this.busy) { this.nudge(id); return; }
      if (s.state !== 'board') return;

      if (!this.isAccessible(s)) {
        this.nudge(id);
        BB.Audio.play('warn');
        var self = this;
        s.blockedBy.forEach(function (pid) {
          var p = self.findPiece(pid);
          if (p && p.state !== 'gone') R.flashPiece(pid);
        });
        if (s.type === 'chained' && s.chainWith) {
          var o = this.findScrew(s.chainWith);
          if (o && o.state === 'board') R.hintPulse(o.id);
        }
        BB.UI.toast(s.locked ? 'Vida geçici olarak kilitli.' : 'Bu vida kapalı. Önce üstündeki parçayı çıkar.', 1600);
        return;
      }

      // Pasli vida: ilk dokunus kabugu kirar
      if (s.type === 'rusty' && s.taps < 1) {
        s.taps = 1; R.refreshScrew(s);
        BB.Audio.play('rust'); BB.Haptics.light();
        var pos = R.screwScreenPos(s.id), host = document.getElementById('flyLayer').getBoundingClientRect();
        if (pos) P.burst(pos.x - host.left, pos.y - host.top, '#8A6034', 10);
        BB.UI.toast('Pas kırıldı. Tekrar dokun.', 1200);
        return;
      }
      // Donmus vida: ilk dokunus buzu kirar
      if (s.type === 'frozen' && !s.thawed) {
        s.thawed = true; R.refreshScrew(s);
        BB.Audio.play('ice'); BB.Haptics.light();
        var pos2 = R.screwScreenPos(s.id), host2 = document.getElementById('flyLayer').getBoundingClientRect();
        if (pos2) P.burst(pos2.x - host2.left, pos2.y - host2.top, '#CBF0FF', 14);
        BB.UI.toast('Buz kırıldı.', 1200);
        return;
      }

      var target = this.findTarget(s.color);
      if (!target) { BB.Audio.play('warn'); BB.UI.toast('Yer kalmadı.', 1400); return; }

      if (s.type === 'returning' && target.kind !== 'box') {
        this.returnSpin(s);
        return;
      }
      if (this.level.moveLimit != null && this.moves >= this.level.moveLimit) { this.lose('moves'); return; }

      this.pushUndo();
      this.removeScrew(s, target);
    },

    nudge: function (id) {
      var el = R.screwEls[id];
      if (!el) return;
      el.classList.remove('shake'); void el.getBoundingClientRect(); el.classList.add('shake');
      setTimeout(function () { el.classList.remove('shake'); }, 420);
    },

    returnSpin: function (s) {
      var self = this;
      this.busy = true;
      BB.Audio.play('warn');
      BB.UI.toast('Bu vida bekleme yuvasına gitmez. Uygun kutu gerekli.', 1900);
      R.spin(s, 260).then(function () {
        var el = R.screwEls[s.id];
        if (el) el.querySelector('.screw-spin').setAttribute('transform', '');
        self.busy = false;
      });
    },

    findTarget: function (color) {
      for (var i = 0; i < this.boxes.length; i++) {
        var b = this.boxes[i];
        if (b && b.color === color && b.count < b.cap) return { kind: 'box', idx: i, slot: b.count };
      }
      for (var j = 0; j < this.reserve.length; j++) if (!this.reserve[j]) return { kind: 'reserve', idx: j };
      return null;
    },

    /* ================= Vida sokme ================= */
    removeScrew: function (s, target) {
      var self = this;
      var L = this.level;
      this.busy = true;
      s.state = 'moving';
      BB.Audio.play('spin');
      BB.Haptics.light();
      var el = R.screwEls[s.id];
      if (el) el.classList.add('picking');

      var dur = s.type === 'bigNut' ? CONFIG.anim.spinBig : CONFIG.anim.spin;
      if (BB.reduced()) dur = 140;

      return R.spin(s, dur).then(function () {
        if (el) el.classList.remove('picking');
        var from = R.screwScreenPos(s.id) || { x: 0, y: 0 };
        R.hideScrew(s.id);
        self.moves++;

        var willClose = false;
        if (target.kind === 'box') {
          var b = self.boxes[target.idx];
          b.count++;
          s.state = 'boxed';
          willClose = (b.count >= b.cap);
        } else {
          s.state = 'reserved';
          s.arriving = true;
          s.order = self.reserveOrder++;
          self.reserve[target.idx] = s;
          self.mistakes++;
          document.getElementById('app').classList.add('warnflash');
          setTimeout(function () { document.getElementById('app').classList.remove('warnflash'); }, 320);
        }
        if (s.type === 'gold') {
          self.goldTaken++;
          BB.Save.addCoins(CONFIG.coins.goldScrew);
          BB.Audio.play('coin');
          BB.UI.updateHud();
          BB.UI.toast('+' + CONFIG.coins.goldScrew + " Gear Coin", 1400);
        }

        R.renderBoxes(self);
        R.renderTray(self);
        if (BB.Tutorial.active && BB.Tutorial.idx === 0) BB.Tutorial.next();
        self.checkPieceFalls();
        R.syncVisibility(L, self.xray);
        BB.UI.updateHud();

        var to = target.kind === 'box' ? R.boxSlotPos(target.idx, target.slot) : R.traySlotPos(target.idx);
        if (!to) to = { x: from.x, y: from.y - 100 };
        self.pendingFlights++;
        if (!willClose) self.busy = false;

        var fdur = BB.reduced() ? 120 : (target.kind === 'box' ? CONFIG.anim.fly : CONFIG.anim.flyReserve);
        R.flyScrew(from, to, s.color, s.type, fdur, target.kind === 'box' ? 80 : 50).then(function () {
          self.pendingFlights--;
          if (target.kind === 'box') {
            var bx = self.boxes[target.idx];
            if (bx) bx.shown = Math.min(bx.cap, bx.shown + 1);
            R.renderBoxes(self);
            R.bumpBox(target.idx);
            BB.Audio.play('pop');
            var hostR = document.getElementById('flyLayer').getBoundingClientRect();
            P.burst(to.x - hostR.left, to.y - hostR.top, BB.colorOf(s.color).light, 8);
          } else {
            s.arriving = false;
            R.renderTray(self);
            R.shakeTray(target.idx);
            BB.Audio.play('slot');
          }
          self.afterArrival(target, willClose);
        });
      });
    },

    afterArrival: function (target, willClose) {
      var self = this;
      var chain = Promise.resolve();
      if (target.kind === 'box' && willClose) {
        chain = chain.then(function () {
          BB.Audio.play('boxfill');
          BB.Haptics.double();
          return R.closeBox(target.idx);
        }).then(function () {
          self.pullBox(target.idx);
          R.renderBoxes(self);
          return self.autoTransfer();
        }).then(function () {
          self.busy = false;
        });
      } else if (target.kind === 'reserve') {
        var free = this.reserve.filter(function (x) { return !x; }).length;
        if (free === 0) { this.lose('tray'); return; }
        if (free === 1) { BB.Audio.play('warn'); BB.Haptics.light(); }
      }
      chain.then(function () {
        self.reconcileBoxes();
        self.checkWin();
      });
    },

    /* ---- Bekleme yuvasindan kutulara otomatik aktarim ---- */
    autoTransfer: function () {
      var self = this;
      function step() {
        var best = null;
        for (var i = 0; i < self.reserve.length; i++) {
          var s = self.reserve[i];
          if (!s || s.arriving) continue;
          for (var b = 0; b < self.boxes.length; b++) {
            var box = self.boxes[b];
            if (!box || box.color !== s.color || box.count >= box.cap) continue;
            if (!best || s.order < best.s.order) best = { s: s, from: i, box: b, slot: box.count };
            break;
          }
        }
        if (!best) return Promise.resolve();
        var box = self.boxes[best.box];
        box.count++;
        best.s.state = 'boxed';
        best.s.arriving = true;
        var fromPt = R.traySlotPos(best.from);
        self.reserve[best.from] = null;
        R.renderTray(self);
        R.renderBoxes(self);
        var toPt = R.boxSlotPos(best.box, best.slot) || fromPt;
        var willClose = box.count >= box.cap;
        return R.flyScrew(fromPt, toPt, best.s.color, best.s.type, BB.reduced() ? 100 : 330, 60).then(function () {
          box.shown = Math.min(box.cap, box.shown + 1);
          best.s.arriving = false;
          R.renderBoxes(self);
          R.bumpBox(best.box);
          BB.Audio.play('pop');
          if (!willClose) return null;
          BB.Audio.play('boxfill');
          return R.closeBox(best.box).then(function () {
            self.pullBox(best.box);
            R.renderBoxes(self);
          });
        }).then(function () {
          return new Promise(function (r) { setTimeout(r, BB.reduced() ? 20 : 90); });
        }).then(step);
      }
      return step();
    },

    /* ---- Dolmasi imkansiz kutulari erken kapat ---- */
    reconcileBoxes: function () {
      var self = this;
      var changed = false;
      this.boxes.forEach(function (b, i) {
        if (!b) return;
        var rem = 0;
        self.level.screws.forEach(function (s) {
          if (s.color === b.color && (s.state === 'board' || s.state === 'moving' || s.state === 'reserved')) rem++;
        });
        if (b.count + rem < b.cap && b.count === b.shown) {
          // bu kutu asla dolmayacak — muhurle ve siradakini getir
          b.count = b.cap; b.shown = b.cap;
          changed = true;
          R.closeBox(i).then(function () {
            self.pullBox(i);
            R.renderBoxes(self);
            self.autoTransfer().then(function () { self.checkWin(); });
          });
        }
      });
      return changed;
    },

    /* ================= Parca dusmesi ================= */
    checkPieceFalls: function () {
      var self = this, L = this.level;
      var any = false;
      L.pieces.forEach(function (p) {
        if (p.fixed || p.state !== 'attached' || !p.screwIds.length) return;
        var held = p.screwIds.some(function (sid) {
          var s = self.findScrew(sid);
          return s && s.state === 'board';
        });
        if (held) return;
        var covered = L.pieces.some(function (q) {
          if (q === p || q.fixed || q.state === 'gone') return false;
          if (q.l <= p.l) return false;
          return BB.pieceCoversPoint(q, p.x, p.y);
        });
        if (covered) return;
        p.state = 'falling';
        any = true;
        self.fallingCount++;
        BB.Audio.play('drop');
        BB.Haptics.light();
        R.fallPiece(p, BB.reduced()).then(function () {
          p.state = 'gone';
          self.fallingCount--;
          R.syncVisibility(L, self.xray);
          self.checkPieceFalls();
          self.checkWin();
        });
      });
      if (any) R.syncVisibility(L, this.xray);
      return any;
    },

    /* ================= Kazanma / kaybetme ================= */
    checkWin: function () {
      if (this.state !== STATES.PLAYING) return;
      if (this.pendingFlights > 0 || this.fallingCount > 0) return;
      var pending = this.level.screws.some(function (s) { return s.state !== 'boxed'; });
      if (pending) return;
      if (this.reserve.some(function (x) { return !!x; })) return;
      this.win();
    },

    win: function () {
      var self = this;
      this.setState(STATES.WIN);
      this.busy = true;
      BB.Audio.play('win');
      BB.Haptics.double();
      P.rain(70);
      // kalan sabit parcalari da temizle
      this.level.pieces.forEach(function (p, i) {
        if (p.state === 'gone') return;
        setTimeout(function () {
          p.fall = p.fall || { dx: 0, dy: 320, rot: 20 };
          R.fallPiece(p, BB.reduced());
          p.state = 'gone';
        }, i * 70);
      });

      var sc = this.computeScore();
      var save = BB.Save.data;
      var first = !save.collection[this.level.id];
      var coins = CONFIG.coins.levelClear + CONFIG.coins.perStar * sc.stars +
        (this.mistakes === 0 ? CONFIG.coins.perfect : 0) + (first ? CONFIG.coins.firstClear : 0);
      if (this.level.gift) coins += 60;

      save.collection[this.level.id] = true;
      save.stars[this.level.id] = Math.max(save.stars[this.level.id] || 0, sc.stars);
      save.best[this.level.id] = Math.max(save.best[this.level.id] || 0, sc.score);
      if (this.level.id + 1 <= BB.LEVELS.length) save.unlocked = Math.max(save.unlocked, this.level.id + 1);
      BB.Save.addCoins(coins);
      BB.Save.save();

      setTimeout(function () {
        BB.UI.showWin({
          level: self.level, score: sc, coins: coins, moves: self.moves,
          time: self.elapsed, mistakes: self.mistakes, gold: self.goldTaken, first: first
        });
      }, BB.reduced() ? 300 : 1100);
    },

    lose: function (reason) {
      if (this.state !== STATES.PLAYING) return;
      this.setState(STATES.LOSE);
      this.busy = true;
      BB.Audio.play('lose');
      BB.Haptics.heavy();
      document.getElementById('app').classList.add('slowmo');
      var self = this;
      setTimeout(function () {
        document.getElementById('app').classList.remove('slowmo');
        BB.UI.showLose(reason);
      }, BB.reduced() ? 200 : 900);
    },

    computeScore: function () {
      var c = CONFIG.score;
      var L = this.level;
      var emptySlots = this.reserve.filter(function (x) { return !x; }).length;
      var timeBonus = Math.max(0, c.timeBonusCap - Math.max(0, this.elapsed - c.timeGraceSec) * c.timePenaltyPerSec);
      var score = c.base + c.perScrew * L.screws.length +
        c.emptyReserveSlot * emptySlots + Math.round(timeBonus) +
        (this.boosterUsed === 0 ? c.noBoosterBonus : 0) +
        (this.mistakes === 0 ? c.perfectBonus : 0) +
        c.goldScrew * this.goldTaken;
      var max = c.base + c.perScrew * L.screws.length + c.emptyReserveSlot * L.reserveSlots +
        c.timeBonusCap + c.noBoosterBonus + c.perfectBonus + c.goldScrew * L.goldCount;
      var ratio = score / max;
      var stars = 1;
      if (ratio >= c.star3) stars = 3; else if (ratio >= c.star2) stars = 2;
      return { score: score, max: max, ratio: ratio, stars: stars, timeBonus: Math.round(timeBonus), emptySlots: emptySlots };
    },

    /* ================= Geri alma ================= */
    pushUndo: function () {
      var snap = {
        screws: this.level.screws.map(function (s) {
          return { id: s.id, state: s.state, taps: s.taps, thawed: s.thawed, locked: s.locked, color: s.color, type: s.type, order: s.order, arriving: false };
        }),
        pieces: this.level.pieces.map(function (p) { return { id: p.id, state: p.state }; }),
        boxes: JSON.parse(JSON.stringify(this.boxes)),
        queueIndex: this.level.queueIndex,
        reserve: this.reserve.map(function (s) { return s ? s.id : null; }),
        reserveLen: this.reserve.length,
        moves: this.moves, mistakes: this.mistakes, elapsed: this.elapsed, timeLeft: this.timeLeft,
        goldTaken: this.goldTaken, reserveOrder: this.reserveOrder
      };
      this.undoStack.push(snap);
      if (this.undoStack.length > CONFIG.maxUndo) this.undoStack.shift();
    },

    canUndo: function () { return this.undoStack.length > 0 && !this.busy; },

    undo: function (free) {
      if (!this.undoStack.length) { BB.UI.toast('Geri alınacak hamle yok.', 1400); return false; }
      if (this.busy) { BB.UI.toast('Animasyon bitsin.', 1200); return false; }
      var snap = this.undoStack.pop();
      var self = this, L = this.level;
      var restoredScrews = [], restoredPieces = [];

      snap.screws.forEach(function (ss) {
        var s = self.findScrew(ss.id);
        if (!s) return;
        if (s.state !== 'board' && ss.state === 'board') restoredScrews.push(s.id);
        s.state = ss.state; s.taps = ss.taps; s.thawed = ss.thawed; s.locked = ss.locked;
        s.color = ss.color; s.type = ss.type; s.order = ss.order; s.arriving = false;
        s.timer = null; s.lockLeft = 0;
      });
      snap.pieces.forEach(function (pp) {
        var p = self.findPiece(pp.id);
        if (!p) return;
        if (p.state !== 'attached' && pp.state === 'attached') restoredPieces.push(p.id);
        p.state = pp.state;
      });
      this.boxes = snap.boxes;
      L.queueIndex = snap.queueIndex;
      this.reserve = [];
      for (var i = 0; i < snap.reserveLen; i++) {
        var id = snap.reserve[i];
        this.reserve.push(id ? this.findScrew(id) : null);
      }
      this.moves = snap.moves; this.mistakes = snap.mistakes;
      this.goldTaken = snap.goldTaken; this.reserveOrder = snap.reserveOrder;
      if (snap.timeLeft != null) this.timeLeft = snap.timeLeft;
      this.fallingCount = 0;

      restoredPieces.forEach(function (pid) { R.restorePiece(self.findPiece(pid)); });
      L.screws.forEach(function (s) { R.refreshScrew(s); R.setScrewColor(s); });
      R.syncVisibility(L, this.xray);
      restoredScrews.forEach(function (sid) { R.showScrew(sid); });
      R.renderBoxes(this);
      R.renderTray(this);
      BB.UI.updateHud();
      if (this.state === STATES.LOSE) { this.setState(STATES.PLAYING); this.busy = false; }
      BB.Audio.play('booster');
      this.touch();
      if (!free) { this.boosterUsed++; }
      return true;
    },

    /* ================= Ipucu ================= */
    bestHint: function () {
      var self = this;
      var cands = this.level.screws.filter(function (s) { return self.isAccessible(s); });
      if (!cands.length) return null;
      var freeSlots = this.reserve.filter(function (x) { return !x; }).length;
      var scored = cands.map(function (s) {
        var score = 0;
        var t = self.findTarget(s.color);
        if (t && t.kind === 'box') score += 100; else score -= 60 - freeSlots * 5;
        // parca acacak vidalar daha degerli
        var p = self.findPiece(s.pieceId);
        if (p) {
          var left = p.screwIds.filter(function (sid) {
            var o = self.findScrew(sid);
            return o && o.state === 'board';
          }).length;
          score += (left === 1) ? 40 : (12 - left * 2);
          // bu parca dusunce acilan vida sayisi
          var opens = self.level.screws.filter(function (o) {
            return o.state === 'board' && o.blockedBy.indexOf(p.id) >= 0;
          }).length;
          score += opens * 14;
        }
        if (s.type === 'gold') score += 25;
        if (s.type === 'timed') score += 20;
        if (s.type === 'rusty' && s.taps < 1) score -= 5;
        return { s: s, score: score };
      });
      scored.sort(function (a, b) { return b.score - a.score; });
      return scored[0].s;
    },
    showHint: function () {
      if (this.busy || this.state !== STATES.PLAYING) return;
      var s = this.bestHint();
      if (s) { R.hintPulse(s.id); BB.Pip.say('Bunu dene.'); }
    },

    /* ================= Duraklat / cikis ================= */
    pause: function () {
      if (this.state !== STATES.PLAYING) return;
      this.setState(STATES.PAUSED);
      BB.UI.showModal('pause');
    },
    resume: function () {
      if (this.state !== STATES.PAUSED) return;
      BB.UI.hideModal();
      this.setState(STATES.PLAYING);
      this.lastTick = util.now();
      this.touch();
    },
    restart: function () {
      BB.UI.hideModal();
      this.start(this.level.id);
    },
    quit: function () {
      BB.UI.hideModal();
      this.stopLoop();
      this.setState(STATES.LEVEL_SELECT);
      BB.cancelAnims();
      P.clear();
      BB.UI.showScreen('map');
      BB.UI.buildMap();
    },
    addReserveSlot: function () {
      if (this.reserve.length >= 9) return false;
      this.reserve.push(null);
      R.renderTray(this);
      return true;
    }
  };

  /* Parca nokta testi (levels.js icindeki ile ayni mantik) */
  BB.pieceCoversPoint = function (piece, wx, wy) {
    var dx = wx - piece.x, dy = wy - piece.y;
    if (piece.r) {
      var a = -piece.r * Math.PI / 180, c = Math.cos(a), s = Math.sin(a);
      var nx = dx * c - dy * s, ny = dx * s + dy * c; dx = nx; dy = ny;
    }
    return BB.shapeContains(piece, dx, dy);
  };

  BB.reduced = function () {
    return !!(BB.Save.data && BB.Save.data.settings.reducedMotion);
  };

  /* ============================================================
     Boosterlar
     ============================================================ */
  var Boosters = {
    defs: {
      hammer: { name: 'Çekiç', hint: 'Bir vidayı anında kaldırır.', icon: 'hammer' },
      undo: { name: 'Geri Al', hint: 'Son hamleyi geri alır.', icon: 'undo' },
      brush: { name: 'Fırça', hint: 'Bekleyen bir vidanın rengini değiştirir.', icon: 'brush' },
      slot: { name: 'Ek Yuva', hint: 'Bekleme alanına 1 yuva ekler.', icon: 'slot' },
      magnet: { name: 'Mıknatıs', hint: 'Uyan tüm açık vidaları toplar.', icon: 'magnet' },
      xray: { name: 'X-Ray', hint: 'Kapalı vidaları gösterir.', icon: 'xray' },
      swap: { name: 'Kutu Değiştir', hint: 'Bir kutuyu sıradakiyle değiştirir.', icon: 'swap' }
    },
    order: ['hammer', 'undo', 'brush', 'slot', 'magnet', 'xray', 'swap'],

    use: function (key) {
      var G = Game;
      if (G.state !== Game.STATES.PLAYING) return;
      var inv = BB.Save.data.boosters;
      if (G.boosterMode === key) { this.cancel(); return; }
      if ((inv[key] || 0) <= 0) { BB.UI.toast(this.defs[key].name + ' kalmadı. Mağazadan alabilirsin.', 2000); BB.Audio.play('warn'); return; }
      if (G.busy) { BB.UI.toast('Animasyon bitsin.', 1200); return; }
      G.touch();

      switch (key) {
        case 'undo':
          if (G.undo(false)) { this.consume(key); }
          break;
        case 'slot':
          if (G.addReserveSlot()) { this.consume(key); BB.Audio.play('booster'); BB.UI.toast('Yeni yuva eklendi.', 1400); }
          else BB.UI.toast('Daha fazla yuva eklenemez.', 1400);
          break;
        case 'magnet':
          this.magnet(); break;
        case 'xray':
          this.xray(); break;
        case 'hammer':
        case 'brush':
        case 'swap':
          G.boosterMode = key;
          BB.UI.renderBoosters();
          BB.UI.toast(this.promptFor(key), 2400);
          BB.Audio.play('booster');
          break;
      }
    },
    promptFor: function (key) {
      if (key === 'hammer') return 'Kaldırmak istediğin vidaya dokun.';
      if (key === 'brush') return 'Bekleme yuvasındaki bir vidaya dokun.';
      if (key === 'swap') return 'Değiştirmek istediğin kutuya dokun.';
      return '';
    },
    cancel: function () {
      Game.boosterMode = null;
      BB.UI.renderBoosters();
      BB.UI.toast('Booster iptal edildi.', 1000);
    },
    consume: function (key) {
      var inv = BB.Save.data.boosters;
      inv[key] = Math.max(0, (inv[key] || 0) - 1);
      Game.boosterUsed++;
      BB.Save.save();
      BB.UI.renderBoosters();
      BB.UI.updateHud();
    },

    applyToScrew: function (s) {
      var G = Game;
      if (G.boosterMode === 'hammer') {
        if (!G.isAccessible(s)) { BB.UI.toast('Kapalı vidaya çekiç işlemez.', 1600); BB.Audio.play('warn'); return; }
        G.pushUndo();
        this.consume('hammer');
        G.boosterMode = null;
        BB.UI.renderBoosters();
        var from = BB.Renderer.screwScreenPos(s.id);
        var host = document.getElementById('flyLayer').getBoundingClientRect();
        s.state = 'boxed';       // sistemden tamamen cikar
        G.moves++;
        BB.Renderer.hideScrew(s.id);
        if (from) P.burst(from.x - host.left, from.y - host.top, BB.colorOf(s.color).hex, 22);
        BB.Audio.play('booster'); BB.Haptics.double();
        G.checkPieceFalls();
        BB.Renderer.syncVisibility(G.level, G.xray);
        G.reconcileBoxes();
        BB.UI.updateHud();
        setTimeout(function () { G.checkWin(); }, 60);
        return;
      }
      BB.UI.toast('Önce bekleme yuvasındaki bir vidayı seç.', 1600);
    },

    applyToReserve: function (index) {
      var G = Game;
      if (G.boosterMode !== 'brush') return;
      var s = G.reserve[index];
      if (!s) { BB.UI.toast('Bu yuva boş.', 1200); return; }
      var colors = G.boxes.filter(function (b) { return b; }).map(function (b) { return b.color; });
      colors = colors.filter(function (c, i) { return colors.indexOf(c) === i; });
      if (!colors.length) { BB.UI.toast('Aktif kutu yok.', 1400); return; }
      BB.UI.pickColor(colors, function (c) {
        G.pushUndo();
        Boosters.consume('brush');
        G.boosterMode = null;
        BB.UI.renderBoosters();
        s.color = c;
        BB.Audio.play('booster');
        BB.Renderer.renderTray(G);
        G.autoTransfer().then(function () { G.reconcileBoxes(); G.checkWin(); });
      });
    },

    applyToBox: function (index) {
      var G = Game;
      if (G.boosterMode !== 'swap') return;
      var L = G.level;
      if (L.queueIndex >= L.boxQueue.length) { BB.UI.toast('Sırada kutu yok.', 1400); return; }
      G.pushUndo();
      this.consume('swap');
      G.boosterMode = null;
      BB.UI.renderBoosters();
      var old = G.boxes[index];
      if (old && old.count > 0) {
        // icindekiler bekleme alanina donmez; kutu muhurlenir
        BB.Renderer.closeBox(index);
      }
      G.pullBox(index);
      BB.Renderer.renderBoxes(G);
      BB.Audio.play('booster');
      G.autoTransfer().then(function () { G.reconcileBoxes(); G.checkWin(); });
    },

    magnet: function () {
      var G = Game;
      if (G.busy) return;
      var cands = G.level.screws.filter(function (s) {
        if (!G.isAccessible(s)) return false;
        if (s.type === 'rusty' && s.taps < 1) return false;
        if (s.type === 'frozen' && !s.thawed) return false;
        var t = G.findTarget(s.color);
        return t && t.kind === 'box';
      });
      if (!cands.length) { BB.UI.toast('Şu an uyan açık vida yok.', 1600); return; }
      this.consume('magnet');
      G.pushUndo();
      BB.Audio.play('booster');
      var i = 0;
      function next() {
        if (i >= cands.length) return Promise.resolve();
        var s = cands[i++];
        if (!G.isAccessible(s) || s.state !== 'board') return next();
        var t = G.findTarget(s.color);
        if (!t || t.kind !== 'box') return next();
        return G.removeScrew(s, t).then(function () {
          return new Promise(function (r) { setTimeout(r, 140); });
        }).then(next);
      }
      next();
    },

    xray: function () {
      var G = Game;
      this.consume('xray');
      G.xray = true;
      BB.Renderer.syncVisibility(G.level, true);
      BB.Audio.play('booster');
      BB.UI.toast('Kapalı vidalar 5 saniye görünür.', 2000);
      setTimeout(function () {
        G.xray = false;
        BB.Renderer.syncVisibility(G.level, false);
      }, 5000);
    }
  };

  /* ============================================================
     Ogretici
     ============================================================ */
  var Tutorial = {
    steps: [
      { text: 'Merhaba! Ben Pip. Parlayan vidaya dokun.', target: 'screw' },
      { text: 'Vidalar kendi renk kutularına gider.', target: 'boxes' },
      { text: 'Uymayan vidalar buradaki geçici yuvalarda bekler.', target: 'tray' },
      { text: 'Yuvaların hepsini doldurma, yoksa bölüm biter.', target: 'tray' },
      { text: 'Parçaları serbest bırakmak için doğru sırayı bul. Hazırsın!', target: null }
    ],
    idx: 0, active: false,
    start: function () {
      this.idx = 0; this.active = true;
      this.show();
    },
    show: function () {
      if (!this.active) return;
      var st = this.steps[this.idx];
      if (!st) { this.finish(); return; }
      var targetEl = null;
      if (st.target === 'boxes') targetEl = document.getElementById('boxRow');
      else if (st.target === 'tray') targetEl = document.getElementById('tray');
      else if (st.target === 'screw') {
        var s = Game.bestHint();
        if (s) { BB.Renderer.hintPulse(s.id); targetEl = BB.Renderer.screwEls[s.id]; }
      }
      BB.UI.showTutorial(st.text, targetEl, this.idx === this.steps.length - 1);
    },
    next: function () {
      this.idx++;
      if (this.idx >= this.steps.length) this.finish();
      else this.show();
    },
    onScrewRemoved: function () {
      if (this.active && this.idx === 0) this.next();
    },
    finish: function () {
      this.active = false;
      BB.UI.hideTutorial();
      BB.Save.data.tutorialDone = true;
      BB.Save.save();
    },
    skip: function () { this.finish(); }
  };

  /* Pip (maskot) */
  var Pip = {
    say: function (text, mood) {
      var box = document.getElementById('pipBox');
      if (!box) return;
      box.classList.add('show');
      box.dataset.mood = mood || 'happy';
      var bubble = box.querySelector('.pip-bubble');
      if (bubble) bubble.textContent = text;
      clearTimeout(this._t);
      this._t = setTimeout(function () { box.classList.remove('show'); }, 2800);
    }
  };

  BB.Game = Game;
  BB.Boosters = Boosters;
  BB.Tutorial = Tutorial;
  BB.Pip = Pip;
})();
