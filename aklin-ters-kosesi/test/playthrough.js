/* 50 bölümün tamamını motor üzerinden çözen otomatik test */
const { JSDOM } = require('jsdom');
const path = require('path').join(__dirname, '..', 'index.html');

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

(async () => {
  const dom = await JSDOM.fromFile(path, {
    runScripts: 'dangerously', resources: 'usable', pretendToBeVisual: true,
    virtualConsole: new (require('jsdom').VirtualConsole)()
  });
  const w = dom.window;
  await sleep(400);
  if (!w.ATK) { console.log('HATA: ATK yüklenmedi'); process.exit(1); }
  const ATK = w.ATK;

  // Sahne ölçüsü jsdom'da 0 olduğu için bırakma testleri API üzerinden yapılır.
  const results = [];

  function el(id) { const o = ATK.objs()[id]; return o ? o.el : null; }

  async function doAction(a) {
    switch (a.action) {
      case 'tap':
        if (a.requireState === 'soundOff') { ATK.save.data.sound = false; }
        ATK.tap(a.targetId, el(a.targetId)); break;
      case 'doubleTap':
        ATK.tap(a.targetId, el(a.targetId)); ATK.tap(a.targetId, el(a.targetId)); break;
      case 'longPress':
        ATK.press(a.targetId, el(a.targetId), (a.ms || 700) + 50); break;
      case 'dropOnTarget':
      case 'hideBehind':
        ATK.drop(a.sourceId, a.targetId, false, el(a.sourceId)); break;
      case 'dragOffScreen':
        ATK.drop(a.sourceId, null, true, el(a.sourceId)); break;
      case 'orderedTapSequence':
        a.sequence.forEach(id => ATK.tap(id, el(id))); break;
      case 'multiTap':
        for (let i = 0; i < a.count; i++) ATK.tap(a.targetId, el(a.targetId)); break;
      case 'pinchOut':
        ATK.gesture('pinch', a.targetId, (a.scale || 1.6) + 0.1); break;
      case 'pinchIn':
        ATK.gesture('pinch', a.targetId, (a.scale || 0.5) - 0.05); break;
      case 'rotate':
        ATK.gesture('rotate', a.targetId, (a.degrees || 150) + 10); break;
      case 'swipe':
        ATK.gesture('swipe', a.targetId, a.direction); break;
      case 'shake':
        ATK.gesture('shake', null, null); break;
      case 'tilt':
        ATK.gesture('tilt', null, a.direction); break;
      case 'stateEquals': {
        const rec = ATK.objs()[a.targetId];
        for (let i = 0; i < 6 && rec.state !== a.state; i++) ATK.tap(a.targetId, rec.el);
        break;
      }
      case 'tapEmpty':
        ATK.tapEmpty(); break;
      case 'wait':
        await sleep((a.seconds + 0.6) * 1000); break;
      default: throw new Error('bilinmeyen eylem ' + a.action);
    }
  }

  for (const lvl of ATK.levels) {
    ATK.state.screen = 'PLAYING';
    ATK.load(lvl.id, true);
    await sleep(lvl.preview ? 620 * (lvl.preview.length + 1) + 200 : 30);
    const steps = lvl.steps && lvl.steps.length ? lvl.steps : [{ do: lvl.solution }];
    let guard = 0;
    while (ATK.state.stepIndex < steps.length && guard++ < 12) {
      const a = ATK.step();
      if (!a) break;
      await doAction(a);
      await sleep(20);
    }
    const done = ATK.state.screen === 'COMPLETED';
    results.push({ id: lvl.id, title: lvl.title, done, wrong: ATK.state.wrongCount });
    await sleep(30);
  }

  const failed = results.filter(r => !r.done);
  console.log('Çözülen bölüm: ' + (results.length - failed.length) + '/' + results.length);
  if (failed.length) console.log('BAŞARISIZ:\n' + failed.map(f => '  ' + f.id + ' ' + f.title).join('\n'));
  const noisy = results.filter(r => r.wrong > 0);
  if (noisy.length) console.log('Beklenmedik yanlış hamle sayacı:', noisy.map(n => n.id + '(' + n.wrong + ')').join(', '));
  console.log('Kayıt: ulaşılan bölüm=' + ATK.save.data.reached + ', ampul=' + ATK.save.data.bulbs +
    ', başarı=' + ATK.save.data.ach.length);
  dom.window.close();
  process.exit(failed.length ? 1 : 0);
})();
