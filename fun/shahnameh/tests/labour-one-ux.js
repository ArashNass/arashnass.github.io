// Muted local integration checks. Test fixtures isolate mechanics; they do not measure human difficulty.
(async()=>{
if(location.hostname!=='127.0.0.1'||location.port!=='8776')throw Error('Local test only');
const sleep=ms=>new Promise(r=>setTimeout(r,ms)),result={probes:[],errors:[]};
addEventListener('error',e=>result.errors.push(e.message));
const box=document.createElement('pre');box.id='ux-report';box.style='position:fixed;inset:15px;z-index:101;overflow:auto;background:#101520f5;color:white;padding:18px;font:14px/1.5 monospace';document.body.append(box);
const check=(name,pass,detail='')=>{result.probes.push({name,pass:!!pass,detail});box.textContent+=`${pass?'PASS':'FAIL'} ${name} ${JSON.stringify(detail)}\n`;};
try{
while(!window.__sh?.scene()?.player)await sleep(20);
const S=window.__sh;S.snd.A.failed=true;S.SET.music=S.SET.fx=0;S.SET.narrator=false;S.game.loop.sleep();
let T=performance.now()+1e6,dt=1000/60;const clocks=new Map();
const step=(n=1)=>{const tw=S.scene().tweens;if(!clocks.has(tw)){clocks.set(tw,tw.getDelta);tw.getDelta=()=>dt;}for(let i=0;i<n;i++){T+=dt;S.game.headlessStep(T,dt);}};
const load=async()=>{const old=S.scene().player,first=!S.scene().started;S.begin(1,false,false,true);for(let i=0;i<500;i++){step(2);await sleep(3);if(S.scene().player?.active&&(first||S.scene().player!==old))break;}return S.scene();};
const put=(s,c,r=14)=>{s.player.body.reset(c*16,r*16-1-.47*s.player.displayHeight);s.player.setVelocity(0);};
const el=id=>document.getElementById(id);
let s=await load();check('Muted before gameplay',S.snd.A.muted&&S.SET.music===0&&S.SET.fx===0&&!S.SET.narrator);
check('Opening has one short movement cue',el('hint').textContent.includes('Move')&&el('hint').textContent.length<35);
put(s,7);step(2);check('Movement dismisses its cue',el('hint').classList.contains('hidden'));
put(s,10);step(2);check('Strike taught near the first foe',el('hint').textContent.includes('Strike'));
S.pressed.attack=true;step(2);check('Striking dismisses its cue',el('hint').classList.contains('hidden'));
put(s,19);step(2);check('Gap cue uses bound jump keys',el('hint').textContent.includes('press again')&&el('hint').textContent.includes('↑'));
step(250);check('Gap instruction disappears',el('hint').classList.contains('hidden'));
s=await load();check('Retry does not repeat movement tutorial',el('hint').classList.contains('hidden'));
s.gather(8);check('Rakhsh threshold updates visibly',el('feedStatus').textContent==='Rakhsh ready'&&s.rakhshFed);
s.gainFarr(100);check('Charged Farr shows its action key',el('farrKey').textContent==='F'&&el('farrBtn').getAttribute('aria-label').includes('Call'));
s.inv=99999;put(s,53);step(3);check('Stand starts without a standing instruction',!!s.siege&&el('hint').classList.contains('hidden'),el('hint').textContent);
let phases=new Set(),entries=0,lastWave=0,minDist=Infinity;const spawn=s.spawnFoe.bind(s);s.spawnFoe=(...args)=>{minDist=Math.min(minDist,Math.abs(s.player.x-args[1])/16);entries++;return spawn(...args)};
for(let i=0;i<60*90&&s.siege;i++){
 s.inv=99999;
 const g=s.siege;
 if(g.wave>0){phases.add(g.wave);if(g.wave!==lastWave){check('Wave '+g.wave+' has compact progress',el('standStatus').textContent===`Wave ${g.wave}/3`);lastWave=g.wave}}
 for(const f of s.foes.getChildren())if(f.active&&f.body.enable&&f.roam?.[0]>=40*16&&i%60===0)s.damage(f,20,true);
 S.keys.right=i%180<90;S.keys.left=!S.keys.right;step();if(i%120===0)await sleep(1);
}
S.keys.right=S.keys.left=false;
check('All three waves complete; entries keep six-tile clearance',s.siegeDone&&phases.size===3&&entries===8&&minDist>=6,{entries,minDist});
check('Wave strip clears with the arena',el('standStatus').classList.contains('hidden'));
s=await load();put(s,89);step(3);check('Den waits for grounded entry',s.prologueOn===true);
// Start its playable timeline directly: the full painting is tested through the normal UI separately.
step(45);for(const event of s.denTimers||[])event.remove(false);
s.prologueFight();step(100);el('denSkip').click();const immediate={bottom:s.player.body.bottom,y:s.player.y,bodyY:s.player.body.y,offset:s.player.body.offset.y,height:s.player.body.height,scale:s.player.scaleY};step(2);
check('Skip hands off grounded and clears the cast',s.bossOn&&!s.frozen&&s.player.visible&&!s.sleeper&&!s.guard&&!s.denLion&&Math.abs(s.player.body.bottom-224)<3,{boss:s.bossOn,frozen:s.frozen,visible:s.player.visible,sleeper:!!s.sleeper,guard:!!s.guard,denLion:!!s.denLion,bottom:s.player.body.bottom,immediate});
check('Skip hides itself and cancels old timeline',el('denSkip').classList.contains('hidden')&&s.denTimers.length===0);
let lion=s.lion;check('Lion introduces charge before other attacks',lion.state==='roar'&&lion.openings===0);s.inv=99999;step(900);check('Skipped story cannot spawn a second lion',s.lion===lion);
check('Boss uses compact tells and opening marker',el('hint').classList.contains('hidden')&&el('bossState').textContent.length<30);
// Damage integration: ordinary strike boxes, no direct boss damage, normal windows.
let hits=0;const hp=lion.hp;
for(let i=0;i<60*120&&lion.hp>0;i++){
 s.inv=99999;
 if(lion.calm()){
  const target=lion.x+(lion.x>100*16?-46:46);put(s,target/16);s.face=target<lion.x?1:-1;S.pressed.attack=i%24===0;
 }else{put(s,(lion.x>102*16?94:110));S.pressed.jump=i%45===0;S.keys.jump=true}
 step();if(i%120===0)await sleep(1);
}
S.keys.jump=false;
check('Actual strike collisions can defeat revised lion',lion.hp<=0,{start:hp,end:lion.hp});
s=await load();s.hp=1;s.inv=0;put(s,70);s.hurt(s.player.x,false,'terrain');check('Raft retry gives one relevant sentence',el('deadTip').textContent==='Keep moving across the sinking rafts.');await sleep(1000);check('Retry receives keyboard focus',document.activeElement===el('retryBtn'));
check('No script errors',result.errors.length===0,result.errors);
}catch(e){result.error=e.stack;box.textContent+='FAIL '+e.stack+'\n'}
box.textContent+='LEVEL ONE UX REVIEW COMPLETE';window.__uxReview=result;fetch('/__result',{method:'POST',body:JSON.stringify(result)});
})();
