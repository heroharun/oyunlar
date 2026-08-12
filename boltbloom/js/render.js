/* ============================================================
   Bolt Bloom — render.js
   SVG sahne cizimi, kamera, kutu/tepsi arayuzu, parcaciklar
   ============================================================ */
(function () {
  'use strict';
  var BB = window.BB;
  var util = BB.util, CONFIG = BB.CONFIG;
  var SVGNS = 'http://www.w3.org/2000/svg';

  /* ---------------- Renk yardimcilari ---------------- */
  function hex2rgb(h) {
    h = h.replace('#', '');
    if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
    return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
  }
  function rgb2hex(r, g, b) {
    function c(v) { v = Math.round(util.clamp(v, 0, 255)).toString(16); return v.length < 2 ? '0' + v : v; }
    return '#' + c(r) + c(g) + c(b);
  }
  function shade(h, amt) {
    var c = hex2rgb(h);
    if (amt >= 0) return rgb2hex(c[0] + (255 - c[0]) * amt, c[1] + (255 - c[1]) * amt, c[2] + (255 - c[2]) * amt);
    return rgb2hex(c[0] * (1 + amt), c[1] * (1 + amt), c[2] * (1 + amt));
  }
  BB.shade = shade;

  function mk(tag, attrs, parent) {
    var e = document.createElementNS(SVGNS, tag);
    if (attrs) for (var k in attrs) e.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(e);
    return e;
  }
  function div(cls, parent, html) {
    var d = document.createElement('div');
    if (cls) d.className = cls;
    if (html != null) d.innerHTML = html;
    if (parent) parent.appendChild(d);
    return d;
  }

  /* ============================================================
     Renderer
     ============================================================ */
  var R = {
    svg: null, defs: null, root: null,
    layerGroups: {},
    screwEls: {}, pieceEls: {},
    level: null,
    cam: { rot: 0, tilt: 0, zoom: 1 },
    fxCtx: null, fxCanvas: null,

    init: function () {
      this.svg = document.getElementById('stage');
      this.defs = document.getElementById('stageDefs');
      this.root = document.getElementById('objRoot');
      this.fxCanvas = document.getElementById('fx');
      this.flyLayer = document.getElementById('flyLayer');
      this.boxRow = document.getElementById('boxRow');
      this.tray = document.getElementById('tray');
      Particles.init(this.fxCanvas);
    },

    /* ---------- Tanimlar (gradyanlar) ---------- */
    buildDefs: function (level) {
      var d = this.defs;
      while (d.firstChild) d.removeChild(d.firstChild);
      var tones = level.themeData.tones;

      tones.forEach(function (t, i) {
        var g = mk('linearGradient', { id: 'tn' + i, x1: '0', y1: '0', x2: '0.25', y2: '1' }, d);
        mk('stop', { offset: '0', 'stop-color': shade(t, 0.34) }, g);
        mk('stop', { offset: '0.48', 'stop-color': t }, g);
        mk('stop', { offset: '1', 'stop-color': shade(t, -0.26) }, g);
      });

      var gl = mk('linearGradient', { id: 'gloss', x1: '0', y1: '0', x2: '0', y2: '1' }, d);
      mk('stop', { offset: '0', 'stop-color': '#ffffff', 'stop-opacity': '0.55' }, gl);
      mk('stop', { offset: '0.52', 'stop-color': '#ffffff', 'stop-opacity': '0.06' }, gl);
      mk('stop', { offset: '1', 'stop-color': '#ffffff', 'stop-opacity': '0' }, gl);

      BB.COLOR_KEYS.forEach(function (k) {
        var col = BB.colorOf(k);
        var g = mk('radialGradient', { id: 'sg-' + k, cx: '0.34', cy: '0.28', r: '0.86' }, d);
        mk('stop', { offset: '0', 'stop-color': shade(col.hex, 0.5) }, g);
        mk('stop', { offset: '0.45', 'stop-color': col.hex }, g);
        mk('stop', { offset: '1', 'stop-color': col.dark }, g);
      });

      var go = mk('radialGradient', { id: 'sg-goldring', cx: '0.4', cy: '0.3', r: '0.9' }, d);
      mk('stop', { offset: '0', 'stop-color': '#FFF3C4' }, go);
      mk('stop', { offset: '1', 'stop-color': '#E8A317' }, go);
    },

    /* ---------- Sahne kurulumu ---------- */
    build: function (level) {
      this.level = level;
      this.screwEls = {}; this.pieceEls = {}; this.layerGroups = {};
      this.buildDefs(level);
      var root = this.root;
      while (root.firstChild) root.removeChild(root.firstChild);

      // katmanlari sirala
      var layers = [];
      level.pieces.forEach(function (p) { if (layers.indexOf(p.l) < 0) layers.push(p.l); });
      level.screws.forEach(function (s) { if (layers.indexOf(s.layer) < 0) layers.push(s.layer); });
      layers.sort(function (a, b) { return a - b; });

      var self = this;
      layers.forEach(function (L) {
        var g = mk('g', { class: 'layer', 'data-layer': L }, root);
        self.layerGroups[L] = g;
        level.pieces.filter(function (p) { return p.l === L; }).forEach(function (p) {
          self.pieceEls[p.id] = self.drawPiece(p, level, g);
        });
        level.screws.filter(function (s) { return s.layer === L; }).forEach(function (s) {
          self.screwEls[s.id] = self.drawScrew(s, g);
        });
      });
      this.applyCamera();
    },

    /* ---------- Parca ---------- */
    drawPiece: function (p, level, parent) {
      var g = mk('g', {
        class: 'piece', 'data-id': p.id,
        transform: 'translate(' + p.x + ' ' + p.y + ') rotate(' + p.r + ')'
      }, parent);
      var path = BB.shapePath(p.s, p.w, p.h);
      var tone = level.themeData.tones[p.tone % level.themeData.tones.length];

      mk('path', { d: path, class: 'p-shadow', transform: 'translate(3.5 7)', fill: 'rgba(30,20,52,0.20)' }, g);
      mk('path', { d: path, class: 'p-body', fill: 'url(#tn' + (p.tone % level.themeData.tones.length) + ')', stroke: shade(tone, -0.42), 'stroke-width': 2.4, 'stroke-linejoin': 'round' }, g);
      var gi = mk('g', { transform: 'scale(0.9)', 'pointer-events': 'none' }, g);
      mk('path', { d: path, fill: 'url(#gloss)' }, gi);

      // detaylar
      if (p.detail === 'hub') {
        mk('circle', { r: Math.min(p.w, p.h) * 0.26, fill: shade(tone, -0.35), opacity: 0.75 }, g);
        mk('circle', { r: Math.min(p.w, p.h) * 0.12, fill: shade(tone, 0.3), opacity: 0.9 }, g);
      } else if (p.detail === 'window') {
        mk('path', {
          d: BB.shapePath(p.s === 'circle' ? 'circle' : 'rect', p.w * 0.68, p.h * 0.6),
          fill: '#BFE6F5', opacity: 0.85, stroke: shade(tone, -0.35), 'stroke-width': 2
        }, g);
        mk('path', { d: BB.shapePath('rect', p.w * 0.2, p.h * 0.5), transform: 'translate(' + (-p.w * 0.16) + ' 0) rotate(18)', fill: '#fff', opacity: 0.5 }, g);
      } else if (p.detail === 'grid') {
        for (var i = -1; i <= 1; i++) {
          mk('rect', {
            x: -p.w * 0.32, y: i * p.h * 0.18 - 2, width: p.w * 0.64, height: 4, rx: 2,
            fill: shade(tone, -0.3), opacity: 0.45
          }, g);
        }
      }
      // vida delikleri
      var self = this;
      p.screwIds.forEach(function (sid) {
        var s = null;
        for (var i = 0; i < level.screws.length; i++) if (level.screws[i].id === sid) s = level.screws[i];
        if (!s) return;
        var lx = s.x - p.x, ly = s.y - p.y;
        if (p.r) {
          var a = -p.r * Math.PI / 180, c = Math.cos(a), sn = Math.sin(a);
          var nx = lx * c - ly * sn, ny = lx * sn + ly * c; lx = nx; ly = ny;
        }
        mk('circle', { cx: lx, cy: ly, r: 13, fill: 'rgba(20,12,38,0.30)' }, g);
        mk('circle', { cx: lx, cy: ly - 1.5, r: 12, fill: shade(tone, -0.5), opacity: 0.55 }, g);
      });
      return g;
    },

    /* ---------- Vida ---------- */
    drawScrew: function (s, parent) {
      var col = BB.colorOf(s.color);
      var big = s.type === 'bigNut';
      var r = big ? 16 : 13;
      var g = mk('g', {
        class: 'screw type-' + s.type, 'data-id': s.id,
        transform: 'translate(' + s.x + ' ' + s.y + ')',
        tabindex: '0', role: 'button',
        'aria-label': col.name + ' vida' + (s.type !== 'normal' ? ' (' + s.type + ')' : '')
      }, parent);

      mk('circle', { r: r + 2, fill: 'rgba(20,12,38,0.28)', cy: 3, 'pointer-events': 'none' }, g);
      var spin = mk('g', { class: 'screw-spin', 'pointer-events': 'none' }, g);

      if (big) {
        mk('path', { d: BB.shapePath('hex', r * 2, r * 2), fill: 'url(#sg-' + s.color + ')', stroke: col.dark, 'stroke-width': 2.2, 'stroke-linejoin': 'round' }, spin);
      } else {
        mk('circle', { r: r, fill: 'url(#sg-' + s.color + ')', stroke: col.dark, 'stroke-width': 2.2 }, spin);
      }
      // oyuk (arti)
      mk('path', {
        d: 'M' + (-r * 0.62) + ' -2.2h' + (r * 1.24) + 'v4.4h' + (-r * 1.24) + 'z M-2.2 ' + (-r * 0.62) + 'v' + (r * 1.24) + 'h4.4v' + (-r * 1.24) + 'z',
        fill: col.dark, opacity: 0.55
      }, spin);
      // sembol
      mk('path', { d: BB.symbolPath(col.sym, r * 0.44), fill: '#fff', opacity: 0.95, transform: 'translate(0 0)' }, spin);
      // ust parlama
      mk('path', { d: 'M' + (-r * 0.62) + ' ' + (-r * 0.42) + 'a' + (r * 0.72) + ' ' + (r * 0.72) + ' 0 0 1 ' + (r * 1.24) + ' 0', fill: 'none', stroke: '#fff', 'stroke-opacity': 0.55, 'stroke-width': 2.4, 'stroke-linecap': 'round' }, spin);

      // tur gostergeleri
      var badge = mk('g', { class: 'screw-badge', 'pointer-events': 'none' }, g);
      this.drawScrewBadge(s, badge, r);

      mk('circle', { class: 'screw-hit', r: r + 12, fill: 'transparent' }, g);
      return g;
    },

    drawScrewBadge: function (s, badge, r) {
      while (badge.firstChild) badge.removeChild(badge.firstChild);
      if (s.type === 'rusty' && s.taps < 1) {
        mk('circle', { r: r + 4, fill: 'none', stroke: '#8A6034', 'stroke-width': 3.4, 'stroke-dasharray': '5 4', opacity: 0.95 }, badge);
        mk('circle', { r: r - 3, fill: '#8A6034', opacity: 0.32 }, badge);
      } else if (s.type === 'frozen' && !s.thawed) {
        mk('circle', { r: r + 6, fill: '#CBF0FF', opacity: 0.75, stroke: '#7FD3F5', 'stroke-width': 2 }, badge);
        for (var i = 0; i < 6; i++) {
          mk('rect', { x: -1.6, y: -(r + 7), width: 3.2, height: 7, fill: '#EAFBFF', transform: 'rotate(' + (i * 60) + ')' }, badge);
        }
      } else if (s.type === 'chained' && s.chainWith) {
        mk('circle', { r: r + 4, fill: 'none', stroke: '#5B6478', 'stroke-width': 3 }, badge);
        mk('path', { d: 'M-7 -7h14v14h-14z', fill: 'none', stroke: '#5B6478', 'stroke-width': 3, transform: 'rotate(45) scale(0.6)' }, badge);
      } else if (s.type === 'gold') {
        mk('circle', { r: r + 4.5, fill: 'none', stroke: 'url(#sg-goldring)', 'stroke-width': 4 }, badge);
        mk('path', { d: BB.symbolPath('star', 5), fill: '#FFF3C4', transform: 'translate(' + (r + 2) + ' ' + (-r - 2) + ')' }, badge);
      } else if (s.type === 'timed') {
        mk('circle', { class: 'timed-ring', r: r + 5, fill: 'none', stroke: '#FF7A5C', 'stroke-width': 3.2, 'stroke-dasharray': (2 * Math.PI * (r + 5)).toFixed(1), 'stroke-dashoffset': '0', transform: 'rotate(-90)' }, badge);
      } else if (s.type === 'returning') {
        mk('path', { d: 'M' + (-r - 5) + ' 0a' + (r + 5) + ' ' + (r + 5) + ' 0 1 1 ' + (r + 5) + ' ' + (r + 5), fill: 'none', stroke: '#3BB8A0', 'stroke-width': 3.2, 'stroke-linecap': 'round' }, badge);
      }
      if (s.locked) {
        mk('circle', { r: r + 6, fill: 'rgba(40,30,60,0.45)' }, badge);
      }
    },

    refreshScrew: function (s) {
      var el = this.screwEls[s.id];
      if (!el) return;
      var badge = el.querySelector('.screw-badge');
      if (badge) this.drawScrewBadge(s, badge, s.type === 'bigNut' ? 16 : 13);
      el.setAttribute('class', 'screw type-' + s.type + (s.locked ? ' is-locked' : ''));
    },

    setScrewColor: function (s) {
      var el = this.screwEls[s.id];
      if (!el) return;
      var col = BB.colorOf(s.color);
      var spin = el.querySelector('.screw-spin');
      var r = s.type === 'bigNut' ? 16 : 13;
      var head = spin.children[0];
      head.setAttribute('fill', 'url(#sg-' + s.color + ')');
      head.setAttribute('stroke', col.dark);
      spin.children[1].setAttribute('fill', col.dark);
      spin.children[2].setAttribute('d', BB.symbolPath(col.sym, r * 0.44));
      el.setAttribute('aria-label', col.name + ' vida');
    },

    /* ---------- Gorunurluk (kapatilmis vidalar) ---------- */
    syncVisibility: function (level, xray) {
      var self = this;
      level.screws.forEach(function (s) {
        var el = self.screwEls[s.id];
        if (!el) return;
        if (s.state !== 'board') { el.style.display = 'none'; return; }
        var blocked = s.blockedBy.some(function (pid) { return self.pieceState(level, pid) !== 'gone'; });
        el.style.display = (blocked && !xray) ? 'none' : '';
        el.classList.toggle('is-xray', !!(blocked && xray));
      });
    },
    pieceState: function (level, pid) {
      for (var i = 0; i < level.pieces.length; i++) if (level.pieces[i].id === pid) return level.pieces[i].state;
      return 'gone';
    },

    /* ---------- Kamera ---------- */
    setCamera: function (rot, tilt, zoom) {
      this.cam.rot = util.clamp(rot, -CONFIG.rotateMaxDeg, CONFIG.rotateMaxDeg);
      this.cam.tilt = util.clamp(tilt, -CONFIG.tiltMaxDeg, CONFIG.tiltMaxDeg);
      this.cam.zoom = util.clamp(zoom, CONFIG.zoom.min, CONFIG.zoom.max);
      this.applyCamera();
    },
    applyCamera: function () {
      if (!this.root) return;
      var c = this.cam;
      var sx = c.zoom * (1 - Math.abs(c.rot) / 90 * 0.35);
      var sy = c.zoom * (1 - Math.abs(c.tilt) / 90 * 0.18);
      this.root.setAttribute('transform', 'translate(' + (c.rot * 1.4).toFixed(2) + ' ' + (c.tilt * 1.2).toFixed(2) + ') scale(' + sx.toFixed(4) + ' ' + sy.toFixed(4) + ')');
      var k = CONFIG.parallaxPerLayer;
      for (var L in this.layerGroups) {
        var off = (c.rot / CONFIG.rotateMaxDeg) * k * (Number(L) + 1);
        var offY = (c.tilt / CONFIG.tiltMaxDeg) * (k * 0.55) * (Number(L) + 1);
        this.layerGroups[L].setAttribute('transform', 'translate(' + off.toFixed(2) + ' ' + offY.toFixed(2) + ')');
      }
    },

    /* ---------- Ekran koordinati ---------- */
    screwScreenPos: function (id) {
      var el = this.screwEls[id];
      if (!el) return null;
      var r = el.getBoundingClientRect();
      return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
    },

    /* ---------- Animasyonlar ---------- */
    spin: function (s, dur) {
      var el = this.screwEls[s.id];
      if (!el) return Promise.resolve();
      var spin = el.querySelector('.screw-spin');
      var turns = s.type === 'bigNut' ? 4 : 2.5;
      return anim(dur, function (t) {
        var e = util.easeInOut(t);
        spin.setAttribute('transform', 'rotate(' + (e * 360 * turns).toFixed(1) + ') scale(' + (1 + 0.12 * Math.sin(Math.PI * t)).toFixed(3) + ')');
      });
    },

    hideScrew: function (id) {
      var el = this.screwEls[id];
      if (el) el.style.display = 'none';
    },
    showScrew: function (id) {
      var el = this.screwEls[id];
      if (!el) return;
      el.style.display = '';
      el.classList.remove('picking');
      var sp = el.querySelector('.screw-spin');
      if (sp) sp.setAttribute('transform', '');
      el.classList.add('pop-in');
      setTimeout(function () { el.classList.remove('pop-in'); }, 400);
    },

    // Ucan vida (DOM overlay)
    flyScrew: function (fromPt, toPt, color, type, dur, arc) {
      var host = this.flyLayer;
      var rect = host.getBoundingClientRect();
      var d = document.createElement('div');
      d.className = 'fly-screw';
      d.innerHTML = BB.screwMarkup(color, 30, type);
      host.appendChild(d);
      var x0 = fromPt.x - rect.left, y0 = fromPt.y - rect.top;
      var x1 = toPt.x - rect.left, y1 = toPt.y - rect.top;
      var cx = (x0 + x1) / 2, cy = Math.min(y0, y1) - (arc == null ? 70 : arc);
      return anim(dur, function (t) {
        var e = util.easeInOut(t);
        var mt = 1 - e;
        var x = mt * mt * x0 + 2 * mt * e * cx + e * e * x1;
        var y = mt * mt * y0 + 2 * mt * e * cy + e * e * y1;
        d.style.transform = 'translate(' + (x - 15) + 'px,' + (y - 15) + 'px) rotate(' + (e * 420).toFixed(0) + 'deg) scale(' + (1 - 0.15 * e).toFixed(3) + ')';
      }).then(function () { if (d.parentNode) d.parentNode.removeChild(d); });
    },

    fallPiece: function (p, reduced) {
      var el = this.pieceEls[p.id];
      if (!el) return Promise.resolve();
      var base = 'translate(' + p.x + ' ' + p.y + ') rotate(' + p.r + ')';
      var dur = reduced ? 220 : CONFIG.anim.pieceFall;
      el.classList.add('is-falling');
      var self = this;
      return anim(reduced ? 60 : CONFIG.anim.pieceRelease, function (t) {
        var w = Math.sin(t * Math.PI * 3) * 3 * (1 - t);
        el.setAttribute('transform', 'translate(' + (p.x + w) + ' ' + p.y + ') rotate(' + (p.r + w * 1.4) + ')');
      }).then(function () {
        var pos = self.screwLessCenter(p);
        Particles.burst(pos.x, pos.y, '#ffffff', 8, 'dust');
        return anim(dur, function (t) {
          var e = t * t;
          var x = p.x + p.fall.dx * e;
          var y = p.y + p.fall.dy * e;
          var rot = p.r + p.fall.rot * util.easeOut(t);
          el.setAttribute('transform', 'translate(' + x.toFixed(1) + ' ' + y.toFixed(1) + ') rotate(' + rot.toFixed(1) + ') scale(' + (1 - 0.25 * t).toFixed(3) + ')');
          el.setAttribute('opacity', (1 - Math.max(0, (t - 0.55) / 0.45)).toFixed(3));
        });
      }).then(function () {
        el.style.display = 'none';
        el.setAttribute('transform', base);
      });
    },
    screwLessCenter: function (p) {
      var el = this.pieceEls[p.id];
      if (!el) return { x: 0, y: 0 };
      var r = el.getBoundingClientRect();
      var host = this.flyLayer.getBoundingClientRect();
      return { x: r.left + r.width / 2 - host.left, y: r.top + r.height / 2 - host.top };
    },
    restorePiece: function (p) {
      var el = this.pieceEls[p.id];
      if (!el) return;
      el.style.display = '';
      el.setAttribute('opacity', 1);
      el.classList.remove('is-falling');
      el.setAttribute('transform', 'translate(' + p.x + ' ' + p.y + ') rotate(' + p.r + ')');
      el.classList.add('pop-in');
      setTimeout(function () { el.classList.remove('pop-in'); }, 400);
    },

    flashPiece: function (pid) {
      var el = this.pieceEls[pid];
      if (!el) return;
      el.classList.add('flash');
      setTimeout(function () { el.classList.remove('flash'); }, 500);
    },

    /* ---------- Kutular ---------- */
    renderBoxes: function (state) {
      var row = this.boxRow;
      row.innerHTML = '';
      state.boxes.forEach(function (b, i) {
        if (!b) { div('box box-empty', row); return; }
        var col = BB.colorOf(b.color);
        var el = div('box', row);
        el.dataset.index = i;
        el.dataset.color = b.color;
        el.style.setProperty('--c', col.hex);
        el.style.setProperty('--cd', col.dark);
        el.style.setProperty('--cl', col.light);
        var lid = div('box-lid', el);
        lid.innerHTML = '<svg viewBox="-12 -12 24 24" aria-hidden="true"><path d="' + BB.symbolPath(col.sym, 8) + '" fill="#fff"/></svg>';
        var body = div('box-body', el);
        var slots = div('box-slots', body);
        for (var k = 0; k < b.cap; k++) {
          var s = div('bslot' + (k < b.count ? ' filled' : ''), slots);
          s.dataset.slot = k;
          if (k < b.count) s.innerHTML = BB.screwMarkup(b.color, 22, 'normal');
        }
        el.setAttribute('aria-label', col.name + ' kutu, ' + b.count + ' / ' + b.cap);
      });
      // sonraki kutular
      var nextWrap = document.getElementById('nextBoxes');
      if (nextWrap) {
        nextWrap.innerHTML = '';
        var q = state.level.boxQueue.slice(state.level.queueIndex, state.level.queueIndex + 4);
        q.forEach(function (c) {
          var col = BB.colorOf(c);
          var chip = div('nextchip', nextWrap);
          chip.style.background = col.hex;
          chip.style.borderColor = col.dark;
          chip.innerHTML = '<svg viewBox="-10 -10 20 20"><path d="' + BB.symbolPath(col.sym, 6) + '" fill="#fff"/></svg>';
        });
        if (!q.length) nextWrap.innerHTML = '<span class="nextdone">son kutu</span>';
      }
    },
    boxSlotPos: function (index, slot) {
      var box = this.boxRow.querySelector('.box[data-index="' + index + '"]');
      if (!box) return null;
      var el = box.querySelector('.bslot[data-slot="' + slot + '"]') || box;
      var r = el.getBoundingClientRect();
      return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
    },
    bumpBox: function (index) {
      var box = this.boxRow.querySelector('.box[data-index="' + index + '"]');
      if (!box) return;
      box.classList.remove('bump'); void box.offsetWidth; box.classList.add('bump');
    },
    closeBox: function (index) {
      var box = this.boxRow.querySelector('.box[data-index="' + index + '"]');
      if (!box) return Promise.resolve();
      var r = box.getBoundingClientRect();
      var host = this.flyLayer.getBoundingClientRect();
      Particles.confettiAt(r.left + r.width / 2 - host.left, r.top + r.height / 2 - host.top, 26);
      box.classList.add('sealed');
      return new Promise(function (res) { setTimeout(res, CONFIG.anim.boxClose); });
    },

    /* ---------- Bekleme tepsisi ---------- */
    renderTray: function (state) {
      var t = this.tray;
      t.innerHTML = '';
      for (var i = 0; i < state.reserve.length; i++) {
        var s = state.reserve[i];
        var el = div('tslot' + (s ? ' filled' : ''), t);
        el.dataset.i = i;
        if (s) {
          el.innerHTML = BB.screwMarkup(s.color, 30, s.type);
          el.setAttribute('aria-label', BB.colorOf(s.color).name + ' vida bekliyor');
        } else {
          el.setAttribute('aria-label', 'boş yuva');
        }
      }
      var free = state.reserve.filter(function (x) { return !x; }).length;
      t.classList.toggle('danger', free <= 1);
      var warn = document.getElementById('trayWarn');
      if (warn) warn.classList.toggle('on', free <= 1);
    },
    traySlotPos: function (i) {
      var el = this.tray.querySelector('.tslot[data-i="' + i + '"]');
      if (!el) return null;
      var r = el.getBoundingClientRect();
      return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
    },
    shakeTray: function (i) {
      var el = this.tray.querySelector('.tslot[data-i="' + i + '"]');
      if (!el) return;
      el.classList.remove('shake'); void el.offsetWidth; el.classList.add('shake');
    },

    hintPulse: function (id) {
      var el = this.screwEls[id];
      if (!el) return;
      el.classList.add('hint');
      setTimeout(function () { el.classList.remove('hint'); }, 2600);
    },
    clearHints: function () {
      for (var k in this.screwEls) this.screwEls[k].classList.remove('hint');
    }
  };

  /* ---------------- Serbest vida cizimi (DOM/SVG string) ---------------- */
  BB.screwMarkup = function (colorKey, size, type) {
    var col = BB.colorOf(colorKey);
    var r = 13, uid = 'f' + Math.random().toString(36).slice(2, 7);
    var head = type === 'bigNut'
      ? '<path d="' + BB.shapePath('hex', r * 2, r * 2) + '" fill="url(#' + uid + ')" stroke="' + col.dark + '" stroke-width="2.2" stroke-linejoin="round"/>'
      : '<circle r="' + r + '" fill="url(#' + uid + ')" stroke="' + col.dark + '" stroke-width="2.2"/>';
    return '<svg viewBox="-17 -17 34 34" width="' + size + '" height="' + size + '" aria-hidden="true">' +
      '<defs><radialGradient id="' + uid + '" cx="0.34" cy="0.28" r="0.86">' +
      '<stop offset="0" stop-color="' + shade(col.hex, 0.5) + '"/>' +
      '<stop offset="0.45" stop-color="' + col.hex + '"/>' +
      '<stop offset="1" stop-color="' + col.dark + '"/></radialGradient></defs>' +
      head +
      '<path d="M-8 -2.2h16v4.4h-16z M-2.2 -8v16h4.4v-16z" fill="' + col.dark + '" opacity="0.5"/>' +
      '<path d="' + BB.symbolPath(col.sym, 5.7) + '" fill="#fff" opacity="0.95"/>' +
      '<path d="M-8 -5.5a9 9 0 0 1 16 0" fill="none" stroke="#fff" stroke-opacity="0.5" stroke-width="2.2" stroke-linecap="round"/>' +
      '</svg>';
  };

  /* ---------------- Genel animasyon yardimcisi ---------------- */
  var running = [];
  function anim(dur, step) {
    return new Promise(function (resolve) {
      if (dur <= 0) { step(1); resolve(); return; }
      var t0 = util.now();
      var handle = { cancelled: false };
      running.push(handle);
      function frame() {
        if (handle.cancelled) { resolve(); return; }
        var t = util.clamp((util.now() - t0) / dur, 0, 1);
        step(t);
        if (t < 1) requestAnimationFrame(frame);
        else {
          var i = running.indexOf(handle); if (i >= 0) running.splice(i, 1);
          resolve();
        }
      }
      requestAnimationFrame(frame);
    });
  }
  BB.anim = anim;
  BB.cancelAnims = function () { running.forEach(function (h) { h.cancelled = true; }); running.length = 0; };

  /* ============================================================
     Parcacik sistemi (canvas + havuz)
     ============================================================ */
  var Particles = {
    canvas: null, ctx: null, pool: [], active: 0, raf: null, dpr: 1, quality: 1,
    init: function (canvas) {
      this.canvas = canvas;
      this.ctx = canvas.getContext('2d');
      for (var i = 0; i < CONFIG.particleCap; i++) this.pool.push({ live: false });
      this.resize();
      var self = this;
      window.addEventListener('resize', function () { self.resize(); });
    },
    resize: function () {
      if (!this.canvas) return;
      var host = this.canvas.parentNode;
      var w = host.clientWidth, h = host.clientHeight;
      this.dpr = Math.min(2, window.devicePixelRatio || 1);
      this.canvas.width = Math.max(1, w * this.dpr);
      this.canvas.height = Math.max(1, h * this.dpr);
      this.canvas.style.width = w + 'px';
      this.canvas.style.height = h + 'px';
      this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    },
    spawn: function (x, y, vx, vy, color, size, life, kind) {
      for (var i = 0; i < this.pool.length; i++) {
        var p = this.pool[i];
        if (p.live) continue;
        p.live = true; p.x = x; p.y = y; p.vx = vx; p.vy = vy;
        p.color = color; p.size = size; p.life = life; p.max = life; p.kind = kind || 'dot';
        p.rot = Math.random() * Math.PI; p.vr = (Math.random() - 0.5) * 0.3;
        this.start();
        return;
      }
    },
    burst: function (x, y, color, n, kind) {
      n = Math.round(n * this.quality);
      for (var i = 0; i < n; i++) {
        var a = Math.random() * Math.PI * 2, sp = 1 + Math.random() * 3.4;
        this.spawn(x, y, Math.cos(a) * sp, Math.sin(a) * sp - 1, color, 2 + Math.random() * 3, 420 + Math.random() * 320, kind);
      }
    },
    confettiAt: function (x, y, n) {
      n = Math.round(n * this.quality);
      var cols = ['#FF8A3D', '#3D8BFF', '#38C25C', '#FF6FB5', '#FFC93D', '#9B5DE5'];
      for (var i = 0; i < n; i++) {
        var a = -Math.PI / 2 + (Math.random() - 0.5) * 2.2, sp = 2.4 + Math.random() * 5;
        this.spawn(x, y, Math.cos(a) * sp, Math.sin(a) * sp, cols[i % cols.length], 4 + Math.random() * 4, 900 + Math.random() * 500, 'confetti');
      }
    },
    rain: function (n) {
      if (!this.canvas) return;
      var w = this.canvas.clientWidth;
      n = Math.round(n * this.quality);
      var cols = ['#FF8A3D', '#3D8BFF', '#38C25C', '#FF6FB5', '#FFC93D', '#9B5DE5', '#22C3C3'];
      for (var i = 0; i < n; i++) {
        this.spawn(Math.random() * w, -20 - Math.random() * 120, (Math.random() - 0.5) * 1.4, 2 + Math.random() * 2.4,
          cols[i % cols.length], 5 + Math.random() * 5, 2200 + Math.random() * 900, 'confetti');
      }
    },
    start: function () {
      if (this.raf) return;
      var self = this, last = util.now();
      function loop() {
        var now = util.now(), dt = Math.min(50, now - last); last = now;
        var ctx = self.ctx;
        ctx.clearRect(0, 0, self.canvas.clientWidth, self.canvas.clientHeight);
        var alive = 0;
        for (var i = 0; i < self.pool.length; i++) {
          var p = self.pool[i];
          if (!p.live) continue;
          p.life -= dt;
          if (p.life <= 0) { p.live = false; continue; }
          alive++;
          p.vy += 0.035 * dt * (p.kind === 'dust' ? 0.3 : 1);
          p.vx *= 0.995;
          p.x += p.vx * dt * 0.06;
          p.y += p.vy * dt * 0.06;
          p.rot += p.vr;
          var a = util.clamp(p.life / p.max, 0, 1);
          ctx.globalAlpha = p.kind === 'dust' ? a * 0.55 : a;
          ctx.fillStyle = p.color;
          if (p.kind === 'confetti') {
            ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot);
            ctx.fillRect(-p.size / 2, -p.size / 3, p.size, p.size * 0.66);
            ctx.restore();
          } else {
            ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, 6.2832); ctx.fill();
          }
        }
        ctx.globalAlpha = 1;
        if (alive > 0) self.raf = requestAnimationFrame(loop);
        else { self.raf = null; ctx.clearRect(0, 0, self.canvas.clientWidth, self.canvas.clientHeight); }
      }
      this.raf = requestAnimationFrame(loop);
    },
    clear: function () {
      this.pool.forEach(function (p) { p.live = false; });
      if (this.ctx && this.canvas) this.ctx.clearRect(0, 0, this.canvas.clientWidth, this.canvas.clientHeight);
    }
  };

  BB.Renderer = R;
  BB.Particles = Particles;
})();
