/* =========================================================
   Kelime Yörüngesi — scenes.js
   Küçük dünya, prosedürel SVG ile çizilir. Harici görsel yok.

   Fikir: her bölüm minik bir gezegenin tepesidir. Parçalar
   gezegenin eğrisi üzerine, yüzeyin normaline dik oturur.
   Bulunan her kelime bir parçayı (.kp) "on" durumuna getirir.
   ========================================================= */

const KY_SCENES = (function () {
  const CX = 200, CY = 700, R = 520;   // gezegen merkezi + yarıçapı
  const VW = 400, VH = 240;
  const PXDEG = R * Math.PI / 180;      // 1 derece ≈ kaç piksel yay

  function mulberry32(a) {
    return function () {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function surface(deg) {
    const t = deg * Math.PI / 180;
    return { x: CX + R * Math.sin(t), y: CY - R * Math.cos(t) };
  }

  function star(r, cx, cy) {
    return 'M' + cx + ' ' + (cy - r) +
      ' Q' + (cx + r * 0.16) + ' ' + (cy - r * 0.16) + ' ' + (cx + r) + ' ' + cy +
      ' Q' + (cx + r * 0.16) + ' ' + (cy + r * 0.16) + ' ' + cx + ' ' + (cy + r) +
      ' Q' + (cx - r * 0.16) + ' ' + (cy + r * 0.16) + ' ' + (cx - r) + ' ' + cy +
      ' Q' + (cx - r * 0.16) + ' ' + (cy - r * 0.16) + ' ' + cx + ' ' + (cy - r) + 'Z';
  }

  /* ---- parça üreticileri: taban (0,0) yüzeydedir, yukarı = -y ---- */
  const ITEM = {
    cicek: {
      step: 6.2, cap: 24,
      draw: function (p, rnd) {
        const h = 30 + rnd() * 16;
        const c = rnd() < 0.5 ? p.item : p.item2;
        let petals = '';
        for (let k = 0; k < 5; k++) {
          petals += '<ellipse rx="5" ry="10.5" cy="-8" fill="' + c + '" transform="rotate(' + (k * 72) + ')"/>';
        }
        return '<path d="M0 0 q' + (-5 + rnd() * 10).toFixed(1) + ' ' + (-h / 2).toFixed(1) + ' 0 ' + (-h).toFixed(1) +
          '" stroke="' + p.stem + '" stroke-width="3.2" fill="none" stroke-linecap="round"/>' +
          '<path d="M0 ' + (-h * 0.45).toFixed(1) + ' q-13 -7 -15 4 q9 7 15 -4Z" fill="' + p.stem + '" opacity=".85"/>' +
          '<g transform="translate(0 ' + (-h).toFixed(1) + ')">' + petals +
          '<circle r="4.5" fill="' + p.glow + '"/></g>';
      }
    },

    agac: {
      step: 7.7, cap: 24,
      draw: function (p, rnd) {
        const h = 40 + rnd() * 24, w = 5 + rnd() * 2;
        return '<path d="M' + (-w) + ' 0 L' + (-w * 0.45).toFixed(1) + ' ' + (-h).toFixed(1) +
          ' L' + (w * 0.45).toFixed(1) + ' ' + (-h).toFixed(1) + ' L' + w + ' 0Z" fill="' + p.stem + '"/>' +
          '<path d="M0 ' + (-h * 0.62).toFixed(1) + ' l-12 -10 M0 ' + (-h * 0.78).toFixed(1) + ' l13 -9" stroke="' + p.stem + '" stroke-width="2.6" stroke-linecap="round"/>' +
          '<circle cx="-11" cy="' + (-h - 6).toFixed(1) + '" r="' + (13 + rnd() * 4).toFixed(1) + '" fill="' + p.item2 + '"/>' +
          '<circle cx="12" cy="' + (-h - 9).toFixed(1) + '" r="' + (12 + rnd() * 4).toFixed(1) + '" fill="' + p.item2 + '"/>' +
          '<circle cx="0" cy="' + (-h - 20).toFixed(1) + '" r="' + (16 + rnd() * 5).toFixed(1) + '" fill="' + p.item + '"/>';
      }
    },

    ev: {
      step: 8.6, cap: 22,
      draw: function (p, rnd) {
        const w = 32 + rnd() * 12, h = 24 + rnd() * 12;
        return '<rect x="' + (-w / 2).toFixed(1) + '" y="' + (-h).toFixed(1) + '" width="' + w.toFixed(1) + '" height="' + h.toFixed(1) + '" rx="2" fill="' + p.item2 + '"/>' +
          '<path d="M' + (-w / 2 - 5).toFixed(1) + ' ' + (-h).toFixed(1) + ' L0 ' + (-h - 18).toFixed(1) + ' L' + (w / 2 + 5).toFixed(1) + ' ' + (-h).toFixed(1) + 'Z" fill="' + p.item + '"/>' +
          '<rect x="' + (w / 2 - 13).toFixed(1) + '" y="' + (-h - 26).toFixed(1) + '" width="6" height="12" fill="' + p.item + '"/>' +
          '<circle cx="0" cy="' + (-h * 0.55).toFixed(1) + '" r="12" fill="' + p.stem + '" opacity=".28"/>' +
          '<rect x="-5" y="' + (-h * 0.55 - 5).toFixed(1) + '" width="10" height="10" rx="1.5" fill="' + p.stem + '"/>' +
          '<rect x="' + (-w / 2 + 3).toFixed(1) + '" y="-11" width="8" height="11" rx="1" fill="' + p.glow + '" opacity=".55"/>';
      }
    },

    kopru: {
      step: 6.8, cap: 20,
      draw: function (p) {
        return '<path d="M-32 0 A32 26 0 0 1 32 0" fill="none" stroke="' + p.item2 + '" stroke-width="5" stroke-linecap="round"/>' +
          '<path d="M-18 -21 V-30 M0 -26 V-30 M18 -21 V-30" stroke="' + p.item2 + '" stroke-width="3"/>' +
          '<rect x="-34" y="-34" width="68" height="6" rx="3" fill="' + p.item + '"/>' +
          '<circle cx="0" cy="-31" r="3" fill="' + p.glow + '"/>';
      }
    },

    tekne: {
      step: 8.6, cap: 22,
      draw: function (p, rnd) {
        const m = 34 + rnd() * 14;
        return '<path d="M-22 -9 L22 -9 L14 3 L-14 3Z" fill="' + p.item2 + '"/>' +
          '<rect x="-1.2" y="' + (-m - 9).toFixed(1) + '" width="2.4" height="' + m.toFixed(1) + '" rx="1" fill="' + p.stem + '"/>' +
          '<path d="M2 ' + (-m - 7).toFixed(1) + ' L18 -12 L2 -12Z" fill="' + p.item + '"/>' +
          '<path d="M-2 ' + (-m - 2).toFixed(1) + ' L-14 -12 L-2 -12Z" fill="' + p.glow + '" opacity=".8"/>';
      }
    },

    gol: {
      step: 6.6, cap: 24,
      draw: function (p, rnd) {
        if (rnd() < 0.45) {
          const h = 26 + rnd() * 14;
          return '<path d="M0 0 q-5 ' + (-h / 2).toFixed(1) + ' -1 ' + (-h).toFixed(1) + '" stroke="' + p.stem + '" stroke-width="2.6" fill="none" stroke-linecap="round"/>' +
            '<rect x="-3.5" y="' + (-h - 14).toFixed(1) + '" width="6" height="14" rx="3" fill="' + p.item2 + '"/>' +
            '<path d="M6 0 q-4 -14 0 -22" stroke="' + p.stem + '" stroke-width="2.2" fill="none" stroke-linecap="round"/>';
        }
        return '<ellipse rx="' + (17 + rnd() * 6).toFixed(1) + '" ry="5" fill="' + p.stem + '" opacity=".9"/>' +
          '<ellipse cx="14" cy="-3" rx="9" ry="3.4" fill="' + p.stem + '" opacity=".6"/>' +
          '<g transform="translate(-3 -9)"><circle r="6" fill="' + p.item + '"/><circle r="2.5" fill="' + p.glow + '"/></g>';
      }
    },

    ruzgar: {
      step: 8.2, cap: 22,
      draw: function (p, rnd) {
        const h = 54 + rnd() * 20;
        let blades = '';
        for (let k = 0; k < 3; k++) {
          blades += '<path d="M0 -2 L5 -30 L-4 -24Z" fill="' + p.item + '" transform="rotate(' + (k * 120) + ')"/>';
        }
        return '<path d="M-4 0 L-1.6 ' + (-h).toFixed(1) + ' L1.6 ' + (-h).toFixed(1) + ' L4 0Z" fill="' + p.item2 + '"/>' +
          '<g transform="translate(0 ' + (-h).toFixed(1) + ')"><g class="ky-spin">' + blades + '</g>' +
          '<circle r="3.6" fill="' + p.glow + '"/></g>';
      }
    },

    carkli: {
      step: 7.3, cap: 20,
      draw: function (p, rnd) {
        const h = 26 + rnd() * 20, r = 13 + rnd() * 5;
        let teeth = '';
        for (let k = 0; k < 8; k++) {
          teeth += '<rect x="-2.6" y="' + (-r - 5).toFixed(1) + '" width="5.2" height="6" rx="1.4" fill="' + p.item2 + '" transform="rotate(' + (k * 45) + ')"/>';
        }
        return '<rect x="-3" y="' + (-h).toFixed(1) + '" width="6" height="' + h.toFixed(1) + '" rx="2" fill="' + p.stem + '"/>' +
          '<g transform="translate(0 ' + (-h).toFixed(1) + ')"><g class="ky-spin">' + teeth +
          '<circle r="' + r.toFixed(1) + '" fill="' + p.item2 + '"/><circle r="' + (r - 4).toFixed(1) + '" fill="' + p.item + '"/>' +
          '<circle r="3" fill="' + p.glow + '"/></g></g>';
      }
    },

    sehir: {
      step: 4.6, cap: 22,
      draw: function (p, rnd) {
        const w = 26 + rnd() * 16, h = 44 + rnd() * 46;
        let win = '';
        const cols = Math.max(2, Math.round(w / 12));
        const rows = Math.max(2, Math.round(h / 16));
        for (let r = 0; r < rows; r++) {
          for (let c = 0; c < cols; c++) {
            if (rnd() < 0.32) continue;
            const wx = -w / 2 + 5 + c * ((w - 10) / Math.max(1, cols - 1 || 1));
            win += '<rect x="' + (wx - 2.6).toFixed(1) + '" y="' + (-h + 9 + r * 14).toFixed(1) + '" width="5.2" height="6.5" rx="1" fill="' + p.stem + '" opacity="' + (0.5 + rnd() * 0.5).toFixed(2) + '"/>';
          }
        }
        return '<rect x="' + (-w / 2).toFixed(1) + '" y="' + (-h).toFixed(1) + '" width="' + w.toFixed(1) + '" height="' + h.toFixed(1) + '" rx="2.5" fill="' + p.item2 + '"/>' +
          '<rect x="' + (-w / 2).toFixed(1) + '" y="' + (-h).toFixed(1) + '" width="' + w.toFixed(1) + '" height="4" rx="2" fill="' + p.item + '"/>' + win;
      }
    },

    yildiz: {
      sky: true,
      draw: function (p, rnd, i, n) {
        const r = 5 + rnd() * 6;
        return '<path d="' + star(r, 0, 0) + '" fill="' + (i % 3 === 0 ? p.item2 : p.item) + '"/>' +
          '<circle r="' + (r * 1.9).toFixed(1) + '" fill="' + p.glow + '" opacity=".14"/>';
      }
    }
  };

  function build(level, count) {
    const p = level.palette;
    const uid = 'kys' + level.id;
    const rnd = mulberry32(level.id * 7919 + count);
    const spec = ITEM[level.scene] || ITEM.cicek;
    const n = Math.max(1, count);

    // sabit arkaplan yıldızları
    let bg = '';
    const brnd = mulberry32(level.id * 131);
    for (let i = 0; i < 26; i++) {
      const x = brnd() * VW, y = 6 + brnd() * 150, s = 0.6 + brnd() * 1.3;
      bg += '<circle cx="' + x.toFixed(1) + '" cy="' + y.toFixed(1) + '" r="' + s.toFixed(2) + '" fill="#fff" opacity="' + (0.12 + brnd() * 0.4).toFixed(2) + '"/>';
    }

    let parts = '';
    if (spec.sky) {
      const prnd = mulberry32(level.id * 977);
      for (let i = 0; i < n; i++) {
        const x = 34 + (i + 0.5) * ((VW - 68) / n) + (prnd() - 0.5) * 26;
        const y = 34 + prnd() * 96;
        parts += '<g transform="translate(' + x.toFixed(1) + ' ' + y.toFixed(1) + ')">' +
          '<g class="kp kp-c" data-i="' + i + '">' + spec.draw(p, prnd, i, n) + '</g></g>';
      }
    } else {
      const spread = Math.min(spec.cap, (spec.step * (n - 1)) / 2);
      for (let i = 0; i < n; i++) {
        const deg = n === 1 ? 0 : -spread + (i * (spread * 2)) / (n - 1);
        const s = surface(deg);
        parts += '<g transform="translate(' + s.x.toFixed(1) + ' ' + s.y.toFixed(1) + ') rotate(' + deg.toFixed(2) + ')">' +
          '<g class="kp" data-i="' + i + '">' + spec.draw(p, rnd, i, n) + '</g></g>';
      }
    }

    return '' +
      '<svg class="ky-scene-svg" viewBox="0 0 ' + VW + ' ' + VH + '" preserveAspectRatio="xMidYMax slice" aria-hidden="true">' +
      '<defs>' +
      '<linearGradient id="' + uid + 'sky" x1="0" y1="0" x2="0" y2="1">' +
      '<stop offset="0" stop-color="' + p.sky1 + '"/><stop offset="1" stop-color="' + p.sky2 + '"/></linearGradient>' +
      '<linearGradient id="' + uid + 'land" x1="0" y1="0" x2="0" y2="1">' +
      '<stop offset="0" stop-color="' + p.land1 + '"/><stop offset="1" stop-color="' + p.land2 + '"/></linearGradient>' +
      '<radialGradient id="' + uid + 'halo" cx="50%" cy="0%" r="34%">' +
      '<stop offset="0" stop-color="' + p.glow + '" stop-opacity=".30"/>' +
      '<stop offset="1" stop-color="' + p.glow + '" stop-opacity="0"/></radialGradient>' +
      '</defs>' +
      '<rect width="' + VW + '" height="' + VH + '" fill="url(#' + uid + 'sky)"/>' +
      bg +
      '<circle cx="' + CX + '" cy="' + CY + '" r="' + (R + 46) + '" fill="url(#' + uid + 'halo)"/>' +
      parts +
      '<circle cx="' + CX + '" cy="' + CY + '" r="' + R + '" fill="url(#' + uid + 'land)"/>' +
      '<circle cx="' + CX + '" cy="' + CY + '" r="' + R + '" fill="none" stroke="' + p.glow + '" stroke-opacity=".35" stroke-width="1.6"/>' +
      '</svg>';
  }

  return { build: build };
})();
