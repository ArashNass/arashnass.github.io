// Run against a local static server with Playwright and Edge installed.
const {chromium}=require('playwright'),assert=require('node:assert/strict');
(async()=>{const b=await chromium.launch({headless:true,channel:process.env.BROWSER_CHANNEL||'msedge'});try{
const p=await b.newPage({viewport:{width:1440,height:900}}),errors=[];p.on('pageerror',e=>errors.push(e.message));
await p.addInitScript(()=>{localStorage.setItem('sh-muted','1');localStorage.setItem('sh-prologue','1')});
await p.goto((process.env.GAME_URL||'http://127.0.0.1:8769/fun/shahnameh/')+'#debug');await p.waitForFunction(()=>window.__sh?.scene()?.player);
const names=['The Reedlands','The Burning Desert','The Night Plain','The Enchanted Garden','The Green Land','The Mountain Camp','The Hidden Cavern'];let layout;
for(let n=1;n<=7;n++){
await p.evaluate(n=>window.__sh.begin(n),n);await p.waitForFunction(()=>document.querySelector('.cimg.on')?.naturalWidth>0);
assert.equal(await p.locator('#entryTitle').textContent(),names[n-1]);assert((await p.locator('.cimg.on').getAttribute('src')).includes('entry-'+n+'.png'));
assert.equal(await p.locator('#cineNarrator').isVisible(),false);assert.equal(await p.locator('#cineSkip').isDisabled(),true);
const metrics=await p.locator('#entryTitle').evaluate(el=>({size:getComputedStyle(el).fontSize,y:el.getBoundingClientRect().y}));if(layout)assert.deepEqual(metrics,layout);else layout=metrics;
await p.waitForFunction(()=>document.getElementById('s-cine').classList.contains('hidden'));assert.equal(await p.evaluate(()=>localStorage.getItem('sh-cur')),String(n));
}
await p.evaluate(()=>window.__sh.cinema('outro2'));assert.equal(await p.locator('#cineNarrator').isVisible(),true);assert.equal(await p.locator('.entry-stage').isVisible(),false);await p.locator('#cineSkip').click();
for(const v of [{width:844,height:390},{width:390,height:844}]){await p.setViewportSize(v);await p.evaluate(()=>window.__sh.begin(4));await p.waitForFunction(()=>document.querySelector('.cimg.on')?.naturalWidth>0);const r=await p.locator('#entryTitle').boundingBox(),button=await p.locator('#cineSkip').boundingBox();assert(r.x>=0&&r.x+r.width<=v.width+1);assert(r.y>button.y+button.height);await p.waitForFunction(()=>document.getElementById('s-cine').classList.contains('hidden'));}
assert.deepEqual(errors,[]);console.log('Seven chapter landscapes, consistent titles, timed entry, story controls and mobile layouts passed.');
}finally{await b.close()}})().catch(e=>{console.error(e);process.exitCode=1});
