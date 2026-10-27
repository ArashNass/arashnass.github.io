// Local browser regression for the first two labours. Requires Playwright and Edge.
const { chromium } = require('playwright');
const assert = require('node:assert/strict');
(async () => {
  const browser = await chromium.launch({ headless: true, channel: 'msedge' });
  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    const errors = []; page.on('pageerror', e => errors.push(e.message));
    await page.addInitScript(() => { localStorage.setItem('sh-muted', '1'); localStorage.setItem('sh-prologue', '1'); });
    await page.goto((process.env.GAME_URL || 'http://127.0.0.1:8769/fun/shahnameh/') + '#debug');
    await page.waitForFunction(() => window.__sh?.scene()?.player);
    await page.evaluate(() => {
      const S = window.__sh; S.game.loop.sleep(); S.snd.A.failed = true;
      let t = performance.now() + 100000;
      window.renderScene = () => { t += 1000 / 60; S.game.step(t, 1000 / 60); };
      window.frames = n => { const sc = S.scene(); sc.tweens.getDelta = () => 1000 / 60; for (let i = 0; i < n; i++) { t += 1000 / 60; S.game.headlessStep(t, 1000 / 60); } };
      window.put = (x, y = 224) => { const sc = S.scene(), p = sc.player; p.body.reset(x, y - 1 - 0.47 * p.displayHeight); p.setVelocity(0); sc.hp = 999; sc.inv = 99999; };
    });
    const load = async (n, rise = false) => {
      await page.evaluate(([n, rise]) => { window.oldPlayer = __sh.scene().player; __sh.begin(n, rise, false, true); }, [n, rise]);
      for (let i = 0; i < 500; i++) {
        await page.evaluate(() => frames(2));
        if (await page.evaluate(n => __sh.scene().lv === __sh.LEVELS[n] && __sh.scene().player !== oldPlayer, n)) break;
        await page.waitForTimeout(10);
      }
      await page.evaluate(() => { frames(3); __sh.scene().hp = 999; __sh.scene().inv = 99999; });
    };
    // First Begin uses the already-created initial scene.
    await page.evaluate(() => { __sh.begin(1, false, false, true); frames(5); });
    const patrol = await page.evaluate(() => {
      const sc = __sh.scene(), f = sc.foes.getChildren().find(f => f.openingPatrol); put(24 * 16);
      let min = Infinity, max = -Infinity, turns = 0, dir = f.dir;
      for (let i = 0; i < 1200; i++) { frames(1); min = Math.min(min, f.body.left); max = Math.max(max, f.body.right); if (dir !== f.dir) turns++; dir = f.dir; }
      return { min, max, turns };
    });
    assert(patrol.max - patrol.min > 200 && patrol.turns >= 2 && patrol.max <= 22 * 16 + 2, JSON.stringify(patrol));
    const checkpoint = await page.evaluate(() => {
      const sc = __sh.scene(), a = sc.altars[0], cold = a.texture.key === 'altar-cold' && !a.flame;
      put(a.x + 2); frames(55); const lit = a.lit && a.flame.active && a.flame.anims.isPlaying;
      sc.kindle(a); const same = a.flame; frames(120); return { cold, lit, persistent: same === a.flame && same.active };
    });
    assert(checkpoint.cold && checkpoint.lit && checkpoint.persistent);
    await page.evaluate(() => { put(34 * 16); frames(70); });
    assert(await page.evaluate(() => !!__sh.scene().siege && __sh.scene().siege.S.reeds && __sh.scene().reedBed.R - __sh.scene().reedBed.L >= 440));
    if (process.env.SHOTS) { await page.evaluate(() => renderScene()); await page.waitForTimeout(750); await page.screenshot({ path: process.env.SHOTS + '/reeds.png' }); }
    const stand = await page.evaluate(() => {
      const sc = __sh.scene(); let wave = 0;
      for (let i = 0; i < 5400 && sc.siege; i++) {
        wave = Math.max(wave, sc.siege.wave);
        if (i % 30 === 0) for (const f of sc.foes.getChildren().slice()) if (f.active && f.body.enable && f.x > 32 * 16 && f.x < 60 * 16) sc.damage(f, 99, true);
        frames(1);
      }
      frames(120); return { wave, done: sc.siegeDone, burnt: sc.reedBed.burnt, shake: sc.cam.shakeEffect.isRunning, reeds: sc.reedBed.reeds.alpha };
    });
    assert(stand.wave === 3 && stand.done && stand.burnt && !stand.shake && stand.reeds === 0, JSON.stringify(stand));
    await page.evaluate(() => { put(53 * 16); frames(4); });
    await load(1, true);
    assert(await page.evaluate(() => { const s = __sh.scene(); return s.siegeDone && !s.siege && s.reedBed.burnt && s.altars[1].flame?.active; }));
    await page.evaluate(() => { put(89 * 16); frames(110); });
    await page.locator('#cineSkip').click();
    if (process.env.SHOTS) {
      await page.evaluate(() => { frames(270); renderScene(); });
      await page.screenshot({ path: process.env.SHOTS + '/lion-first.png' });
      await page.evaluate(() => { frames(170); renderScene(); });
      await page.screenshot({ path: process.env.SHOTS + '/lion-second.png' });
    }
    const wake = await page.evaluate(() => {
      const sc = __sh.scene();
      for (let i = 0; i < 1200 && !sc.bossOn; i++) { frames(1); if (!document.getElementById('s-cine').classList.contains('hidden')) document.getElementById('cineSkip').click(); }
      return { exchanges: sc.prologueExchanges, rise: sc.wakeStandingAt - sc.wakeStartedAt, standing: sc.time.now - sc.wakeStandingAt, boss: sc.bossOn };
    });
    assert(wake.exchanges === 2 && wake.rise >= 2500 && wake.standing >= 2200 && wake.boss, JSON.stringify(wake));
    await load(2);
    await page.evaluate(() => {
      const sc = __sh.scene(); sc.prayed = true; sc.ramDug = true; put(148 * 16);
      sc.ram = sc.physics.add.sprite(160 * 16, 180, 'ram-idle'); sc.fit(sc.ram, 'ram'); sc.ram.glow = sc.add.image(0, 0, 'glow');
      sc.startQueen(); frames(200); sc.boss.hp = Math.floor(sc.boss.max / 2); frames(250);
    });
    assert(await page.evaluate(() => __sh.scene().boss.state === 'brood' && !__sh.scene().boss.body.enable));
    const brood = await page.evaluate(() => {
      const sc = __sh.scene(), q = sc.boss; let defeated = 0, returnedEarly = false;
      frames(500); const waits = q.state === 'brood';
      for (let i = 0; i < 4000 && q.state.startsWith('brood'); i++) {
        if (i % 30 === 0) for (const f of q.brood?.live || []) if (f.active && f.body.enable) { sc.damage(f, 99, true); defeated++; }
        if (q.body.enable && defeated < 8) returnedEarly = true;
        frames(1);
      }
      return { waits, defeated, returnedEarly, visible: q.alpha === 1 && q.body.enable, state: q.state };
    });
    assert(brood.waits && brood.defeated === 8 && !brood.returnedEarly && brood.visible, JSON.stringify(brood));
    await page.evaluate(() => { const sc = __sh.scene(); sc.damage(sc.boss, 99, true); frames(700); });
    const spring = await page.evaluate(() => {
      const sc = __sh.scene(); return { pool: sc.pool.x, scroll: sc.cam.scrollX, width: sc.cam.width, zoom: sc.cam.zoom, drank: sc.drank, centred: Math.abs(sc.pool.x - (sc.cam.scrollX + sc.cam.width / sc.cam.zoom / 2)) < 2, ramRight: sc.ram.x > sc.pool.x && sc.ram.flipX, horseLeft: sc.rakhshDrinks.x < sc.pool.x, open: sc.springOpen };
    });
    if (process.env.SHOTS) { await page.evaluate(() => renderScene()); await page.waitForTimeout(750); await page.screenshot({ path: process.env.SHOTS + '/spring.png' }); }
    assert(spring.centred && spring.ramRight && spring.horseLeft && spring.open, JSON.stringify(spring));
    await page.evaluate(() => { const sc = __sh.scene(); put(sc.pool.x - 40); frames(10); });
    assert(await page.evaluate(() => { const sc = __sh.scene(); return sc.drank && sc.player.x < sc.pool.x && sc.player.flipX === false; }));
    if (process.env.SHOTS) {
      await page.evaluate(() => { __sh.scene().inv = 0; frames(120); renderScene(); });
      await page.waitForTimeout(750); await page.screenshot({ path: process.env.SHOTS + '/drinking.png' });
    }
    assert.deepEqual(errors, []);
    console.log(JSON.stringify({ patrol, checkpoint, stand, wake, brood, spring }, null, 2));
  } finally { await browser.close(); }
})().catch(e => { console.error(e); process.exitCode = 1; });

