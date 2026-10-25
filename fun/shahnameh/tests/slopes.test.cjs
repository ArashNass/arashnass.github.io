const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const source = fs.readFileSync(require('node:path').join(__dirname, '../game.js'), 'utf8');
const fn = source.slice(source.indexOf('function cutSlopes('), source.indexOf('const STANDS ='));
for (const cur of [1,3,4,5,6,7]) {
 const context = {cur, ROWS:17, PLINTHS:[[3,4]]};vm.createContext(context);vm.runInContext(fn,context);
 const map=Array.from({length:17},(_,r)=>Array.from({length:12},(_,c)=>r>=(c<5?14:13)?'#':'.'));
 const before=JSON.stringify(map), slopes=context.cutSlopes(map);
 assert.equal(JSON.stringify(map),before,`Labour ${cur} must retain its original terrain`);
 assert.equal(slopes['3,13'],1);assert.equal(slopes['4,13'],2);
 map[15][4]='^';assert.equal(Object.keys(context.cutSlopes(map)).length,0,'Never ramp over a pit');
}
assert(source.includes("this.slopes = LIVE && !rush && this.lv.smoothSteps ? cutSlopes(map) : {}"));
console.log('All six added labour palettes retain terrain, form ramps, avoid pits and preserve legacy/rush gating.');
