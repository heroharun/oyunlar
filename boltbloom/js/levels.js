/* ============================================================
   Bolt Bloom — levels.js
   Bolum tanimlari (saf veri) + bolum insa edici
   Insa edici, cozulebilir bir vida sirasi uretip renkleri
   o siraya gore 3'lu bloklar halinde dagitir. Boylece kutu
   sirasi her zaman bir cozume karsilik gelir.
   ============================================================ */
(function () {
  'use strict';
  var BB = window.BB;
  var util = BB.util, CONFIG = BB.CONFIG;

  /* ---------------- Bolum tanimlari ---------------- */
  var LEVELS = [
    {
      id: 1, name: 'İlk Atölye', theme: 'workshop', objectType: 'toyCar',
      screws: 9, colors: ['orange', 'blue', 'green'], activeBoxes: 2, reserveSlots: 5,
      tutorial: true, brief: 'Parlak vidalara dokun, kutuları doldur.'
    },
    {
      id: 2, name: 'Tozlu Sandık', theme: 'workshop', objectType: 'chest',
      screws: 12, colors: ['orange', 'blue', 'yellow'], activeBoxes: 2, reserveSlots: 5,
      brief: 'Üst plakalar alttaki vidaları kapatır.'
    },
    {
      id: 3, name: 'Radyo Sesleri', theme: 'workshop', objectType: 'radio',
      screws: 15, colors: ['orange', 'blue', 'green', 'pink'], activeBoxes: 2, reserveSlots: 5,
      brief: 'Uymayan vidalar bekleme yuvasinda bekler.'
    },
    {
      id: 4, name: 'Şeker Objektif', theme: 'candy', objectType: 'camera',
      screws: 18, colors: ['pink', 'yellow', 'teal', 'purple'], activeBoxes: 3, reserveSlots: 5,
      types: { rusty: 2 }, brief: 'Paslı vidalar iki dokunuş ister.'
    },
    {
      id: 5, name: 'Şekerli Kalkış', theme: 'candy', objectType: 'rocket',
      screws: 21, colors: ['pink', 'yellow', 'teal', 'red'], activeBoxes: 3, reserveSlots: 5,
      types: { rusty: 2, gold: 1 }, gift: true, brief: 'Altın vida ekstra para verir.'
    },
    {
      id: 6, name: 'Pervane Şurubu', theme: 'candy', objectType: 'plane',
      screws: 21, colors: ['pink', 'yellow', 'teal', 'purple', 'green'], activeBoxes: 3, reserveSlots: 5,
      types: { chained: 2, rusty: 1 }, brief: 'Zincirli vida, eşi çıkmadan sökülmez.'
    },
    {
      id: 7, name: 'Derin Liman', theme: 'harbor', objectType: 'submarine',
      screws: 24, colors: ['teal', 'blue', 'yellow', 'orange', 'green'], activeBoxes: 3, reserveSlots: 5,
      types: { rusty: 2, chained: 1, gold: 1 }, brief: 'Kutu sırasını takip et.'
    },
    {
      id: 8, name: 'Fener Nöbeti', theme: 'harbor', objectType: 'lighthouse',
      screws: 24, colors: ['teal', 'blue', 'red', 'yellow', 'purple'], activeBoxes: 3, reserveSlots: 5,
      types: { frozen: 3, rusty: 1 }, brief: 'Donmuş vidaların önce buzu kırılır.'
    },
    {
      id: 9, name: 'Demir Kanatlar', theme: 'harbor', objectType: 'mechBird',
      screws: 27, colors: ['teal', 'blue', 'orange', 'green', 'pink', 'purple'], activeBoxes: 3, reserveSlots: 4,
      types: { frozen: 2, chained: 2, returning: 1 }, brief: 'Bir yuva eksik. Acele etme.'
    },
    {
      id: 10, name: 'Dev Bekçi', theme: 'roboLab', objectType: 'bossRobot',
      screws: 39, colors: ['purple', 'blue', 'teal', 'orange', 'red', 'green'], activeBoxes: 3, reserveSlots: 5,
      boss: true, gift: true, types: { rusty: 3, frozen: 2, chained: 2, gold: 3, bigNut: 2 },
      brief: 'Bölge patronu. Katmanları sırayla aç.'
    },
    {
      id: 11, name: 'Laboratuvar Çırağı', theme: 'roboLab', objectType: 'robot',
      screws: 27, colors: ['purple', 'blue', 'green', 'yellow', 'red'], activeBoxes: 3, reserveSlots: 5,
      types: { timed: 2, rusty: 2, gold: 1 }, brief: 'Zamanlı vidalar geri kilitlenir.'
    },
    {
      id: 12, name: 'Dişli Dino', theme: 'roboLab', objectType: 'dinosaur',
      screws: 30, colors: ['purple', 'green', 'orange', 'teal', 'red', 'yellow'], activeBoxes: 3, reserveSlots: 5,
      moveLimit: 42, types: { chained: 3, rusty: 2, bigNut: 1 }, brief: 'Hamle hakkın sınırlı.'
    },
    {
      id: 13, name: 'Zamanın Kulesi', theme: 'hangar', objectType: 'clockTower',
      screws: 33, colors: ['blue', 'orange', 'purple', 'teal', 'yellow', 'red'], activeBoxes: 3, reserveSlots: 5,
      timeLimit: 240, types: { frozen: 2, timed: 2, gold: 2 }, brief: 'Süre işliyor.'
    },
    {
      id: 14, name: 'Ejderha Tamiri', theme: 'hangar', objectType: 'dragon',
      screws: 36, colors: ['red', 'orange', 'purple', 'green', 'teal', 'blue', 'yellow'], activeBoxes: 3, reserveSlots: 5,
      types: { rusty: 3, chained: 3, frozen: 2, returning: 2, gold: 2 }, brief: 'Tüm mekanikler bir arada.'
    },
    {
      id: 15, name: 'Yıldız Gemisi', theme: 'hangar', objectType: 'spaceStation',
      screws: 45, colors: ['blue', 'teal', 'purple', 'orange', 'yellow', 'red', 'green', 'pink'],
      activeBoxes: 3, reserveSlots: 5, boss: true, gift: true,
      types: { rusty: 4, chained: 3, frozen: 2, gold: 4, bigNut: 2, timed: 2 },
      brief: 'Büyük final. Çok katmanlı gövde.'
    }
  ];

  var REGIONS = [
    { key: 'workshop', from: 1, to: 3 },
    { key: 'candy', from: 4, to: 6 },
    { key: 'harbor', from: 7, to: 9 },
    { key: 'roboLab', from: 10, to: 12 },
    { key: 'hangar', from: 13, to: 15 }
  ];

  /* ---------------- Yardimci geometri ---------------- */
  function toLocal(piece, wx, wy) {
    var dx = wx - piece.x, dy = wy - piece.y;
    if (!piece.r) return [dx, dy];
    var a = -piece.r * Math.PI / 180, c = Math.cos(a), s = Math.sin(a);
    return [dx * c - dy * s, dx * s + dy * c];
  }
  function toWorld(piece, lx, ly) {
    if (!piece.r) return [piece.x + lx, piece.y + ly];
    var a = piece.r * Math.PI / 180, c = Math.cos(a), s = Math.sin(a);
    return [piece.x + (lx * c - ly * s), piece.y + (lx * s + ly * c)];
  }
  function pieceCovers(piece, wx, wy) {
    var l = toLocal(piece, wx, wy);
    return BB.shapeContains(piece, l[0], l[1]);
  }

  var MIN_SCREW_GAP = 30;
  function farEnough(lx, ly, placed) {
    for (var i = 0; i < placed.length; i++) {
      var dx = lx - placed[i][0], dy = ly - placed[i][1];
      if (dx * dx + dy * dy < MIN_SCREW_GAP * MIN_SCREW_GAP) return false;
    }
    return true;
  }
  // Bir parca icin sonraki vida yuvasini uret (yazili yuvalar bitince halka uzerinde uret)
  function anchorAt(piece, i, placed) {
    var a = piece.a;
    if (a && i < a.length) return a[i];
    var k = (a ? i - a.length : i);
    var golden = 2.39996;
    for (var attempt = 0; attempt < 14; attempt++) {
      var ang = (k + attempt * 0.37) * golden + 0.6;
      var band = 0.34 - 0.09 * ((k + attempt) % 3);
      var lx = Math.cos(ang) * piece.w * band;
      var ly = Math.sin(ang) * piece.h * band;
      if (BB.shapeContains(piece, lx, ly) && farEnough(lx, ly, placed)) {
        return [Math.round(lx), Math.round(ly)];
      }
    }
    return [0, 0];
  }

  /* ---------------- Bolum insasi ---------------- */
  function buildLevel(id) {
    var def = null;
    for (var i = 0; i < LEVELS.length; i++) if (LEVELS[i].id === id) def = LEVELS[i];
    if (!def) {
      console.warn('[BoltBloom] Bölüm bulunamadı: ' + id + ' — yedek bölüm yükleniyor.');
      def = LEVELS[0];
    }
    var tpl = BB.OBJECTS[def.objectType];
    if (!tpl) {
      console.warn('[BoltBloom] Nesne şablonu yok: ' + def.objectType + ' — toyCar kullanılıyor.');
      tpl = BB.OBJECTS.toyCar;
    }

    var rnd = util.rng(1000 + def.id * 7919);

    /* 1) Parcalar */
    var pieces = tpl.pieces.map(function (p, idx) {
      var fall = p.fall || [p.x * 1.15, 300, (p.x >= 0 ? 1 : -1) * 30];
      return {
        id: 'p' + idx, s: p.s, x: p.x, y: p.y, w: p.w, h: p.h, r: p.r || 0,
        l: p.l, tone: p.t, fixed: p.fixed, detail: p.detail,
        a: p.a, fall: { dx: fall[0], dy: fall[1], rot: fall[2] },
        screwIds: [], state: 'attached'
      };
    });
    var loose = pieces.filter(function (p) { return !p.fixed; });
    if (!loose.length) { console.error('[BoltBloom] Şablonda sökülebilir parça yok.'); loose = pieces; }

    /* 2) Vida sayisi: 3'un kati ve parca sayisindan buyuk */
    var want = Math.max(loose.length, def.screws || 9);
    want = Math.ceil(want / 3) * 3;

    /* 3) Vida yerlesimi — once her parcaya 1, sonra sirayla */
    var screws = [];
    var perPiece = {}, localPts = {};
    loose.forEach(function (p) { perPiece[p.id] = 0; localPts[p.id] = []; });
    function capOf(p, slack) {
      return Math.max(1, Math.min(8, Math.round((p.w * p.h) / 2400))) + slack;
    }
    var round = 0, slack = 0;
    while (screws.length < want && round < 60) {
      var placedThisRound = 0;
      for (var pi = 0; pi < loose.length && screws.length < want; pi++) {
        var p = loose[pi];
        if (round > 0 && perPiece[p.id] >= capOf(p, slack)) continue;
        var loc = anchorAt(p, perPiece[p.id], localPts[p.id]);
        if (perPiece[p.id] > 0 && !farEnough(loc[0], loc[1], localPts[p.id])) continue;
        localPts[p.id].push(loc);
        var w = toWorld(p, loc[0], loc[1]);
        screws.push({
          id: 's' + screws.length, pieceId: p.id, layer: p.l,
          x: Math.round(w[0]), y: Math.round(w[1]),
          color: 'orange', type: 'normal', chainWith: null,
          state: 'board', taps: 0, thawed: true, locked: false,
          blockedBy: [], gold: false
        });
        p.screwIds.push(screws[screws.length - 1].id);
        perPiece[p.id]++;
        placedThisRound++;
      }
      round++;
      if (!placedThisRound) { slack++; if (slack > 3) break; }
    }
    // 3'un katina indir (fazlaligi, birden fazla vidasi olan parcalardan al)
    while (screws.length % 3 !== 0) {
      for (var k = screws.length - 1; k >= 0; k--) {
        var s = screws[k];
        var owner = pieces.filter(function (pp) { return pp.id === s.pieceId; })[0];
        if (owner.screwIds.length > 1) {
          owner.screwIds.splice(owner.screwIds.indexOf(s.id), 1);
          screws.splice(k, 1);
          break;
        }
      }
    }

    /* 4) Kapatma iliskileri */
    var wantBlockRatio = def.blockRatio != null ? def.blockRatio : (def.id === 1 ? 0 : Math.min(0.34, 0.10 + def.id * 0.02));
    computeBlocking(pieces, screws);
    if (wantBlockRatio <= 0) {
      unblockAll(pieces, screws, localPts);
    } else {
      forceBlocking(pieces, screws, localPts, rnd, wantBlockRatio);
    }
    computeBlocking(pieces, screws);

    /* 5) Cozum sirasi simulasyonu */
    var order = simulate(pieces, screws, rnd);
    if (!order) {
      console.warn('[BoltBloom] Bölüm ' + def.id + ': kilitlenme tespit edildi, kapatmalar gevşetildi.');
      screws.forEach(function (s) { s.blockedBy = s.blockedBy.slice(0, 1); });
      order = simulate(pieces, screws, rnd) || screws.slice();
    }

    /* 6) Renkler — sirayla 3'lu bloklar */
    var palette = (def.colors && def.colors.length ? def.colors : ['orange', 'blue', 'green']).slice();
    var chunkCount = order.length / 3;
    var chunkColors = [];
    for (var c = 0; c < chunkCount; c++) chunkColors.push(palette[c % palette.length]);
    util.shuffle(chunkColors, rnd);
    for (var ci = 0; ci < chunkCount; ci++) {
      for (var j = 0; j < 3; j++) order[ci * 3 + j].color = chunkColors[ci];
    }
    var boxQueue = chunkColors.slice();

    /* 7) Vida turleri */
    applyTypes(order, def.types || {}, rnd);

    /* 8) Bolum nesnesi */
    var activeBoxes = def.activeBoxes || (def.id >= CONFIG.activeBoxesLevel ? 3 : 2);
    var level = {
      def: def,
      id: def.id,
      name: def.name,
      theme: def.theme,
      themeData: BB.THEMES[def.theme] || BB.THEMES.workshop,
      objectType: def.objectType,
      objectName: tpl.name,
      rarity: tpl.rarity || 'common',
      brief: def.brief || '',
      pieces: pieces,
      screws: screws,
      solution: order.map(function (s) { return s.id; }),
      boxQueue: boxQueue,
      queueIndex: 0,
      activeBoxes: activeBoxes,
      reserveSlots: def.reserveSlots || CONFIG.reserveDefault,
      timeLimit: def.timeLimit || null,
      moveLimit: def.moveLimit || null,
      tutorial: !!def.tutorial,
      boss: !!def.boss,
      gift: !!def.gift,
      goldCount: screws.filter(function (s) { return s.type === 'gold'; }).length
    };
    return level;
  }

  function computeBlocking(pieces, screws) {
    screws.forEach(function (s) {
      s.blockedBy = pieces.filter(function (p) {
        return !p.fixed && p.l > s.layer && pieceCovers(p, s.x, s.y);
      }).map(function (p) { return p.id; });
    });
  }

  function moveScrew(screw, piece, local, localPts) {
    var pts = localPts[piece.id];
    for (var i = 0; i < pts.length; i++) {
      if (pts[i][0] === screw.lx && pts[i][1] === screw.ly) { pts.splice(i, 1); break; }
    }
    screw.lx = local[0]; screw.ly = local[1];
    pts.push(local);
    var w = toWorld(piece, local[0], local[1]);
    screw.x = Math.round(w[0]);
    screw.y = Math.round(w[1]);
  }

  // Kasitli kapatma: alt katman vidalarini ust katman parcalarinin altina tasi
  function forceBlocking(pieces, screws, localPts, rnd, ratio) {
    var byId = {};
    pieces.forEach(function (p) { byId[p.id] = p; });
    screws.forEach(function (s) {
      var p = byId[s.pieceId];
      var l = toLocal(p, s.x, s.y);
      s.lx = Math.round(l[0]); s.ly = Math.round(l[1]);
    });
    var target = Math.round(screws.length * ratio);
    var current = screws.filter(function (s) { return s.blockedBy.length; }).length;
    if (current >= target) return;

    var covers = pieces.filter(function (p) { return !p.fixed && p.l > 0; });
    util.shuffle(covers, rnd);
    for (var qi = 0; qi < covers.length && current < target; qi++) {
      var q = covers[qi];
      var unders = pieces.filter(function (p) { return !p.fixed && p.l < q.l && p.id !== q.id; });
      util.shuffle(unders, rnd);
      for (var pi = 0; pi < unders.length && current < target; pi++) {
        var p = unders[pi];
        var free = screws.filter(function (s) { return s.pieceId === p.id && !s.blockedBy.length; });
        if (free.length < 1) continue;
        // q ile p'nin kesisiminde uygun bir nokta bul
        var pt = null;
        for (var t = 0; t < 60 && !pt; t++) {
          var lx = (rnd() * 0.7 - 0.35) * q.w;
          var ly = (rnd() * 0.7 - 0.35) * q.h;
          if (!BB.shapeContains(q, lx, ly)) continue;
          var w = toWorld(q, lx, ly);
          var pl = toLocal(p, w[0], w[1]);
          if (!BB.shapeContains(p, pl[0], pl[1])) continue;
          var others = localPts[p.id].filter(function (o) { return !(o[0] === free[0].lx && o[1] === free[0].ly); });
          if (!farEnough(pl[0], pl[1], others)) continue;
          pt = [Math.round(pl[0]), Math.round(pl[1])];
        }
        if (!pt) continue;
        moveScrew(free[0], p, pt, localPts);
        computeBlocking(pieces, screws);
        current = screws.filter(function (s) { return s.blockedBy.length; }).length;
      }
    }
  }

  // Ogretici bolumu icin: kapatilmis vidalari acik bir noktaya tasi
  function unblockAll(pieces, screws, localPts) {
    var byId = {};
    pieces.forEach(function (p) { byId[p.id] = p; });
    screws.forEach(function (s) {
      if (!s.blockedBy.length) return;
      var p = byId[s.pieceId];
      var own = toLocal(p, s.x, s.y);
      var others = localPts[p.id].filter(function (o) {
        return Math.abs(o[0] - own[0]) > 0.6 || Math.abs(o[1] - own[1]) > 0.6;
      });
      for (var t = 0; t < 120; t++) {
        var ang = t * 2.39996;
        var band = 0.44 - 0.07 * (t % 5);
        var lx = Math.cos(ang) * p.w * band, ly = Math.sin(ang) * p.h * band;
        if (!BB.shapeContains(p, lx, ly)) continue;
        var w = toWorld(p, lx, ly);
        var covered = pieces.some(function (q) {
          return !q.fixed && q.l > p.l && pieceCovers(q, w[0], w[1]);
        });
        if (covered) continue;
        if (!farEnough(lx, ly, others)) continue;
        s.x = Math.round(w[0]); s.y = Math.round(w[1]);
        localPts[p.id] = others.concat([[lx, ly]]);
        break;
      }
    });
  }

  function coveredFromAbove(piece, pieces, fallen) {
    for (var i = 0; i < pieces.length; i++) {
      var q = pieces[i];
      if (q === piece || q.fixed || fallen[q.id]) continue;
      if (q.l <= piece.l) continue;
      if (pieceCovers(q, piece.x, piece.y)) return true;
    }
    return false;
  }

  function simulate(pieces, screws, rnd) {
    var removed = {}, fallen = {}, order = [], guard = 0;
    while (order.length < screws.length) {
      if (guard++ > 8000) return null;
      var acc = [];
      for (var i = 0; i < screws.length; i++) {
        var s = screws[i];
        if (removed[s.id]) continue;
        var ok = true;
        for (var b = 0; b < s.blockedBy.length; b++) if (!fallen[s.blockedBy[b]]) { ok = false; break; }
        if (ok) acc.push(s);
      }
      if (!acc.length) return null;
      var pick = acc[Math.floor(rnd() * acc.length)];
      removed[pick.id] = true;
      order.push(pick);
      var changed = true;
      while (changed) {
        changed = false;
        for (var p = 0; p < pieces.length; p++) {
          var pc = pieces[p];
          if (pc.fixed || fallen[pc.id] || !pc.screwIds.length) continue;
          var all = true;
          for (var k = 0; k < pc.screwIds.length; k++) if (!removed[pc.screwIds[k]]) { all = false; break; }
          if (!all) continue;
          if (coveredFromAbove(pc, pieces, fallen)) continue;
          fallen[pc.id] = true;
          changed = true;
        }
      }
    }
    return order;
  }

  function applyTypes(order, types, rnd) {
    var n = order.length;
    var used = {};
    function pickIdx(minI, maxI) {
      for (var t = 0; t < 60; t++) {
        var i = minI + Math.floor(rnd() * (maxI - minI));
        if (!used[i]) { used[i] = true; return i; }
      }
      return -1;
    }
    var count;
    // zincirli ciftler
    count = types.chained || 0;
    for (var c = 0; c < count; c++) {
      var i1 = pickIdx(0, Math.max(1, Math.floor(n * 0.6)));
      var i2 = pickIdx(Math.max(i1 + 1, Math.floor(n * 0.35)), n);
      if (i1 < 0 || i2 < 0 || i2 <= i1) continue;
      order[i2].type = 'chained';
      order[i2].chainWith = order[i1].id;
      order[i1].chainHead = true;
    }
    var simple = [
      ['rusty', types.rusty || 0],
      ['frozen', types.frozen || 0],
      ['gold', types.gold || 0],
      ['bigNut', types.bigNut || 0],
      ['timed', types.timed || 0],
      ['returning', types.returning || 0]
    ];
    simple.forEach(function (pair) {
      for (var i = 0; i < pair[1]; i++) {
        var idx = pickIdx(3, n);
        if (idx < 0) continue;
        order[idx].type = pair[0];
        if (pair[0] === 'frozen') order[idx].thawed = false;
        if (pair[0] === 'gold') order[idx].gold = true;
      }
    });
  }

  BB.LEVELS = LEVELS;
  BB.REGIONS = REGIONS;
  BB.buildLevel = buildLevel;
  BB.levelDef = function (id) {
    for (var i = 0; i < LEVELS.length; i++) if (LEVELS[i].id === id) return LEVELS[i];
    return null;
  };
  BB.regionOf = function (id) {
    for (var i = 0; i < REGIONS.length; i++) if (id >= REGIONS[i].from && id <= REGIONS[i].to) return REGIONS[i];
    return REGIONS[0];
  };
})();
