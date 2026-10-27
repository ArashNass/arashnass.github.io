const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const source = fs.readFileSync(path.join(__dirname, '../game.js'), 'utf8');
const reset = source.slice(source.indexOf('function resetProgress()'), source.indexOf("$('resetProgress').onclick = resetProgress;"));

function run(confirmed, blocked = false) {
  const saved = {
    'sh-cur': '7', 'sh-unlocked': '7', 'sh-stars': '{"7":3}',
    'sh-feathers': '{"1:0":1}', 'sh-legend': '{"7":1}', 'sh-trials': '{"1":{"best":1000}}',
    'sh-best': '5000', 'sh-best-7': '6000', 'sh-rush': '7000',
    'sh-purse': '90', 'sh-upg': '{"heart":2}', 'sh-farr': '100', 'sh-lasso': '1',
    'sh-prologue': '1', 'sh-map-seen': '7', 'sh-toldRing': '1',
    'sh-set': '{"music":25,"shake":false}', 'sh-muted': '1', 'sh-diff': 'gentle',
    'another-game-save': 'keep',
  };
  const original = { ...saved }, events = [];
  Object.defineProperty(saved, 'removeItem', { value(key) {
    if (blocked) throw new Error('Storage denied');
    delete saved[key];
  } });
  const context = {
    localStorage: saved, playing: true,
    window: { confirm(message) { assert.match(message, /cannot be undone/); return confirmed; }, alert() { events.push('error'); } },
    clearInput() { events.push('clear input'); },
    game: { scene: { stop(name) { assert.equal(name, 'play'); events.push('stop'); } } },
    location: { reload() { events.push('reload'); } },
  };
  vm.runInNewContext(reset + '\nresetProgress();', context);
  if (!confirmed || blocked) {
    assert.deepEqual({ ...saved }, original);
    assert.equal(context.playing, true);
    assert.deepEqual(events, blocked ? ['error'] : []);
  } else {
    assert.deepEqual({ ...saved }, Object.fromEntries(Object.entries(original).filter(([key]) => ['sh-set', 'sh-muted', 'sh-diff', 'another-game-save'].includes(key))));
    assert.equal(context.playing, false);
    assert.deepEqual(events, ['clear input', 'stop', 'reload']);
  }
}
run(false);
run(true);
run(true, true);
console.log('Reset progress: cancellation, save clearing, preserved preferences, reload and storage failure passed.');
