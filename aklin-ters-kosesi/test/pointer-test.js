/* Gerçek pointer olaylarıyla sürükleme, boşluğa dokunma ve dayanıklılık testleri */
const { JSDOM, VirtualConsole } = require('jsdom');
const FILE = require('path').join(__dirname, '..', 'index.html');
const sleep = ms => new Promise(r => setTimeout(r, ms));
const SR = { left: 0, top: 100, width: 300, height: 400, right: 300, bottom: 500 };
let pass = 0, fail = 0;
function check(name, cond) { if (cond) { pass++; console.log('  ✓ ' + name); } else { fail++; console.log('  ✗ ' + name); } }

(async () => {
  const dom = await JSDOM.fromFile(FILE, {
    runScripts: 'dangerously', resources: 'usable', pretendToBeVisual: true,
    virtualConsole: new VirtualConsole()
  });
  const w = dom.window, d = w.document;
  await sleep(400);
  const ATK = w.ATK;
  const scene = d.getElementById('scene');

  // Sahne ve nesneler için gerçekçi ölçüler taklit edilir
  Object.defineProperty(scene, 'clientWidth', { value: 300 });
  w.HTMLElement.prototype.getBoundingClientRect = function () {
    if (this === scene) return Object.assign({ x: SR.left, y: SR.top }, SR);
    if (this.getAttribute && this.getAttribute('data-obj-id') && this.parentNode === scene) {
      const x = parseFloat(this.style.left) || 50, y = parseFloat(this.style.top) || 50;
      const size = 60;
      const cx = SR.left + SR.width * x / 100, cy = SR.top + SR.height * y / 100;
      return { left: cx - size / 2, top: cy - size / 2, right: cx + size / 2, bottom: cy + size / 2, width: size, height: size, x: cx - size / 2, y: cy - size / 2 };
    }
    return { left: 0, top: 0, right: 0, bottom: 0, width: 0, height: 0, x: 0, y: 0 };
  };

  function pt(type, x, y, target) {
    const e = new w.MouseEvent(type, { bubbles: true, cancelable: true, clientX: x, clientY: y });
    Object.defineProperty(e, 'pointerId', { value: 1 });
    (target || w).dispatchEvent(e);
  }
  function center(id) {
    const r = ATK.objs()[id].el.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
  }
  function dragTo(id, tx, ty) {
    const c = center(id), el = ATK.objs()[id].el;
    pt('pointerdown', c.x, c.y, el);
    pt('pointermove', c.x + 20, c.y + 20);
    pt('pointermove', tx, ty);
    pt('pointerup', tx, ty);
  }

  console.log('Sürükleme ve dokunma testleri');
  ATK.load(2, true); await sleep(30);
  const rb = center('rabbit');
  dragTo('carrot', rb.x, rb.y);
  check('B2: havuç tavşana bırakıldı -> çözüldü', ATK.state.screen === 'COMPLETED');

  ATK.load(8, true); await sleep(30);
  dragTo('sun8', SR.left - 60, SR.top + 200);
  check('B8: güneş ekran dışına atıldı -> çözüldü', ATK.state.screen === 'COMPLETED');

  ATK.load(2, true); await sleep(30);
  dragTo('carrot', SR.left + 150, SR.top + 380);
  check('B2: boşluğa bırakınca çözülmez', ATK.state.screen === 'PLAYING');
  check('B2: havuç eski yerine döndü', Math.abs(ATK.objs()['carrot'].x - 24) < 0.6);

  ATK.load(47, true); await sleep(30);
  const p = { x: SR.left + 150, y: SR.top + 200 };
  pt('pointerdown', p.x, p.y, scene);
  pt('pointerup', p.x, p.y);
  check('B47: boş alana dokunma -> çözüldü', ATK.state.screen === 'COMPLETED');

  ATK.load(1, true); await sleep(30);
  const c1 = center('ball1');
  pt('pointerdown', c1.x, c1.y, ATK.objs()['ball1'].el);
  pt('pointerup', c1.x, c1.y);
  check('B1: yanlış nesne çözmez', ATK.state.screen === 'PLAYING');
  check('B1: yanlış sayacı arttı', ATK.state.wrongCount === 1);
  const c2 = center('mino1');
  pt('pointerdown', c2.x, c2.y, ATK.objs()['mino1'].el);
  pt('pointerup', c2.x, c2.y);
  check('B1: doğru nesne çözer', ATK.state.screen === 'COMPLETED');

  console.log('\nDayanıklılık testleri');
  // Aynı nesneye iki kez dokunmak ödülü iki kez vermemeli
  const before = ATK.save.data.bulbs;
  ATK.tap('mino1', ATK.objs()['mino1'].el);
  check('Çözüm animasyonunda ikinci dokunuş yok sayılır', ATK.save.data.bulbs === before);

  // Yeniden başlatma eski nesneleri temizler
  ATK.load(3, true); await sleep(20);
  const idsA = Object.keys(ATK.objs()).length;
  ATK.load(3, true); await sleep(20);
  check('Yeniden başlatmada nesne sayısı sabit', Object.keys(ATK.objs()).length === idsA);

  // İpucu ampulü eksiye düşürmez
  ATK.save.data.bulbs = 0; w.ATK.hint();
  check('Ampul yokken ipucu alınmaz', ATK.save.data.bulbs === 0 && ATK.state.hintStage === 0);
  ATK.save.data.bulbs = 2; w.ATK.hint(); w.ATK.hint();
  check('İki ipucu 3 ampul ister, bakiye eksiye inmez', ATK.save.data.bulbs >= 0);

  // Bozuk kayıt (jsdom dosya kökeninde localStorage engellidir; sahte depo kullanılır)
  let store = {};
  try {
    Object.defineProperty(w, 'localStorage', {
      configurable: true,
      value: {
        getItem: k => (k in store ? store[k] : null),
        setItem: (k, v) => { store[k] = String(v); },
        removeItem: k => { delete store[k]; }
      }
    });
  } catch (e) {}
  store['atk_save_v1'] = '{bozuk json';
  const loaded = ATK.save.load();
  check('Bozuk kayıt varsayılana döner', loaded.bulbs === 5 && loaded.reached === 1);
  store['atk_save_v1'] = JSON.stringify({ bulbs: -50, reached: 999, completed: 'x' });
  const l2 = ATK.save.load();
  check('Anlamsız değerler düzeltilir', l2.bulbs === 5 && l2.reached === 50 && Array.isArray(l2.completed));
  store['atk_save_v1'] = JSON.stringify({ bulbs: 7, reached: 12, completed: [1, 2, 3] });
  const l3 = ATK.save.load();
  check('Geçerli kayıt korunur', l3.bulbs === 7 && l3.reached === 12 && l3.completed.length === 3);

  console.log('\nSonuç: ' + pass + ' geçti, ' + fail + ' kaldı');
  dom.window.close();
  process.exit(fail ? 1 : 0);
})();
