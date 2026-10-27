// Run against a local static server: NODE_PATH=<Playwright packages> node tests/menu-background.cjs
const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
(async () => {
  const browser = await chromium.launch({ headless: true, channel: 'msedge' });
  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    const errors = []; page.on('pageerror', error => errors.push(error.message));
    await page.addInitScript(() => {
      localStorage.setItem('sh-muted', '1');
      localStorage.setItem('sh-cur', '5'); localStorage.setItem('sh-unlocked', '5');
      localStorage.setItem('sh-prologue', '1');
    });
    // Expose the existing scene for assertions only; production has no test hook.
    await page.route('**/game.js?*', route => route.fulfill({ contentType: 'text/javascript', body:
      fs.readFileSync(path.join(__dirname, '../game.js'), 'utf8').replace('game = new Phaser.Game(', 'game = window.__menuGame = new Phaser.Game(') }));
    await page.goto(process.env.GAME_URL || 'http://127.0.0.1:8769/fun/shahnameh/');
    await page.waitForFunction(() => window.__menuGame?.scene.getScene('play')?.player);
    const state = () => page.locator('#s-map').evaluate(m => ({ display: getComputedStyle(m).display, inert: m.inert, backing: m.classList.contains('menu-backdrop') }));
    for (const [open, close] of [
      ['#s-map [data-settings]', '#setDone'], ['#s-map [data-help]', '#helpDone'],
      ['#prologueBtn', '#clipDone'], ['#castAll', '#guideClose'], ['#mapTale', '#storyClose'],
    ]) {
      await page.locator(open).first().click();
      assert.deepEqual(await state(), { display: 'flex', inert: true, backing: true });
      assert.equal(await page.locator('#s-map').evaluate(m => m.contains(document.activeElement)), false);
      await page.locator(close).click();
      assert.deepEqual(await state(), { display: 'flex', inert: false, backing: false });
    }
    await page.locator('#prologueBtn').click();
    await page.locator('#clipList [data-play]').first().click();
    await page.locator('#cineSkip').click();
    assert.deepEqual(await state(), { display: 'flex', inert: true, backing: true });
    await page.locator('#clipDone').click();
    await page.setViewportSize({ width: 390, height: 844 });
    await page.locator('#journeyMenu').click();
    await page.locator('#s-map [data-settings]').click();
    assert.deepEqual(await state(), { display: 'flex', inert: true, backing: true });
    await page.locator('#setDone').click();
    assert.deepEqual(await state(), { display: 'flex', inert: false, backing: false });
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.locator('#rideBtn').click(); await page.locator('#cineSkip').click();
    await page.waitForFunction(() => document.body.classList.contains('playing'));
    await page.locator('#pauseBtn').click();
    const before = await page.evaluate(() => { const s = window.__menuGame.scene.getScene('play'); return { x: s.player.x, y: s.player.y, name: s.lv.name }; });
    for (const [open, close] of [['[data-settings]', '#setDone'], ['[data-help]', '#helpDone'], ['[data-story]', '#storyClose']]) {
      await page.locator('#s-pause ' + open).click();
      assert.deepEqual(await state(), { display: 'none', inert: false, backing: false });
      assert.deepEqual(await page.evaluate(() => { const s = window.__menuGame.scene.getScene('play'); return { x: s.player.x, y: s.player.y, name: s.lv.name }; }), before);
      assert.equal(await page.evaluate(() => window.__menuGame.scene.isPaused('play')), true);
      await page.locator(close).click();
    }
    assert.deepEqual(errors, []);
    console.log('Menu backgrounds passed: five home panels, cinematic return, mobile Settings, and current-level pause preservation.');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });

