const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const { EventEmitter } = require('node:events');
const source = fs.readFileSync(require('node:path').join(__dirname, '../game.js'), 'utf8');
function fixture(voice = false) {
  let now = 0, endVoice, callbacks = 0, paused = false;
  const tasks = [], keys = { right: true }, pressed = { attack: true };
  const context = { keys, pressed, banner() {}, hint() {}, say(k, { then }) { endVoice = then; return voice; } };
  vm.createContext(context); vm.runInContext(source.slice(source.indexOf('function heldBeat('), source.indexOf('const LEVELS = {')), context);
  const scene = { events: new EventEmitter(), player: { setVelocity() {}, play() {} }, anims: { exists: () => true }, physics: { pause() { paused = true; }, resume() { paused = false; } }, time: { delayedCall(ms, fn) { const task = { at: now + ms, fn, removed: false, remove() { this.removed = true; } }; tasks.push(task); return task; } } };
  const advance = ms => { const until = now + ms; while (true) { const task = tasks.filter(t => !t.removed && t.at <= until).sort((a, b) => a.at - b.at)[0]; if (!task) break; now = task.at; task.removed = true; task.fn(); } now = until; };
  return { scene, keys, pressed, advance, start() { context.heldBeat(scene, { fa: '', title: '', text: 'Read this short story.', voice: 'test', min: 2000, pose: 'pose' }, () => callbacks++); }, finishVoice: () => endVoice(), paused: () => paused, count: () => callbacks };
}
{
 const f = fixture(); f.start(); assert(f.paused()); assert.equal(f.keys.right, false); assert.equal(f.pressed.attack, false);
 f.advance(1999); assert.equal(f.count(), 0); f.advance(1); assert.equal(f.count(), 1); assert(!f.paused()); assert.equal(f.scene.pose, null);
 f.advance(50000); assert.equal(f.count(), 1);
}
{
 const f = fixture(true); f.start(); f.advance(2000); assert.equal(f.count(), 0); f.finishVoice(); assert.equal(f.count(), 1); assert(!f.paused());
 f.finishVoice(); assert.equal(f.count(), 1);
}
{
 const f = fixture(true); f.start(); f.finishVoice(); assert.equal(f.count(), 0); f.advance(2000); assert.equal(f.count(), 1);
}
{
 const f = fixture(true); f.start(); f.advance(45000); assert.equal(f.count(), 1); assert(!f.paused());
}
{
 const f = fixture(true); f.start(); f.scene.events.emit('shutdown'); f.advance(50000); f.finishVoice(); assert.equal(f.count(), 0); assert(!f.paused());
}
assert(source.includes("const LIVE = !location.port.startsWith('877') || location.search.includes('live');"));
assert(source.includes("if (LIVE && !rush && !this.dragonStoryDone)"));
assert(source.includes("if (!s.bossOn && !s.guideDone"));
console.log('Story beats: silent/voiced timing, interruption, watchdog, shutdown and legacy gating passed.');
