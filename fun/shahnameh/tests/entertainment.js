(async()=>{
if(location.hostname!=='127.0.0.1'||location.port!=='8778')throw Error('Dedicated test origin required');
const sleep=ms=>new Promise(r=>setTimeout(r,ms)),result={suite:'entertainment',probes:[],errors:[],notes:['Optional-trail reachability bots start at the trial marker, use movement/jump/strike inputs, and use high health/invulnerability to isolate terrain reachability. Separate tests exercise normal damage, failure, timeout, rewards, coordination and pause behavior.']};
addEventListener('error',e=>result.errors.push(e.message));const box=document.createElement('pre');box.id='entertainment-report';box.style='position:fixed;inset:12px;z-index:101;background:#101520ee;color:white;overflow:auto;padding:15px';document.body.append(box);
const check=(name,pass,detail={})=>{result.probes.push({name,pass:!!pass,...detail});box.textContent+=`${pass?'PASS':'FAIL'} ${name} ${JSON.stringify(detail)}\n`;};
try{
 while(!window.__sh?.scene()?.player)await sleep(20);
 const S=window.__sh;S.snd.A.muted=true;S.snd.A.failed=true;S.SET.voice=0;S.game.loop.sleep();
 let T=performance.now()+1e6,dt=1000/60;const clocks=new Map();
 const step=(n=1)=>{const tw=S.scene().tweens;if(!clocks.has(tw)){clocks.set(tw,tw.getDelta);tw.getDelta=()=>dt;}for(let i=0;i<n;i++){T+=dt;S.game.headlessStep(T,dt);}};
 const resetKeys=()=>{for(const k in S.keys)S.keys[k]=false;for(const k in S.pressed)S.pressed[k]=false;};
 const load=async n=>{resetKeys();const old=S.scene().player,first=!S.scene().started&&S.scene().lv===S.LEVELS[n];S.begin(n,false,false,true);for(let i=0;i<500;i++){step(2);await sleep(3);if(S.scene().player?.active&&(first||S.scene().player!==old)&&S.scene().lv===S.LEVELS[n])break;}const sc=S.scene();sc.drawDark=()=>{};sc.hp=sc.maxHp=999;sc.inv=99999;sc.hordeDone=true;sc.prayed=true;sc.water=100;return sc;};
 const place=(sc,x,y)=>{const r=sc.groundAt(x)??14;sc.player.body.reset(x,y??r*16-1-.47*sc.player.displayHeight);sc.player.setVelocity(0);};
 const motion={};
 for(const fps of [30,60]){
  dt=1000/fps;let sc=await load(1);sc.foes.clear(true,true);place(sc,8*16);step(3);S.keys.right=true;step(Math.round(fps/10));motion[fps]=sc.player.body.velocity.x;S.keys.right=false;sc.player.setVelocity(0);
  sc.cool=5;S.pressed.attack=true;step();const buffered=sc.attackBuf>0;step(Math.ceil(6*fps/60));check(`${fps}Hz strike input buffers across cooldown`,buffered&&sc.atk>0,{attack:sc.atk});
  sc.atk=0;sc.dodgeCd=5;S.pressed.dodge=true;step();const dodgeBuffered=sc.dodgeBuf>0;step(Math.ceil(6*fps/60));check(`${fps}Hz dodge input buffers across cooldown`,dodgeBuffered&&sc.dodgeT>0);
  sc.attackBuf=sc.dodgeBuf=sc.buf=5;sc.chargeT=40;sc.chargeFull=true;S.setPaused(true);check(`${fps}Hz pausing clears all queued actions`,sc.attackBuf===0&&sc.dodgeBuf===0&&sc.buf===0&&sc.chargeT===0&&!sc.chargeFull);S.setPaused(false);
 }
 check('Movement response is consistent at 30 and 60 Hz',Math.abs(motion[30]-motion[60])<0.1,{motion});
 dt=1000/60;
 {const sc=await load(1);sc.foes.clear(true,true);sc.inv=0;sc.farr=0;sc.dodgeT=14;sc.dodgeRewarded=false;const hp=sc.hp;sc.hurt(sc.player.x+20);const earned=sc.farr;sc.hurt(sc.player.x+20);
  check('Precisely timed dodge earns Farr and a counter window without damage',sc.hp===hp&&sc.counterT===48&&earned===6&&sc.farr===6);
  sc.dodgeT=0;sc.cool=0;S.pressed.attack=true;step();check('The next strike consumes the counter window',sc.counterStrike&&sc.counterT===0);
  const f=sc.spawnFoe('divwarrior',sc.player.x+25,224);f.hp=10;f.setVelocity(0);sc.player.body.reset(sc.player.x,224-1-.47*sc.player.displayHeight);step(8);check('Counterstrike deals its extra damage',f.hp===8,{hp:f.hp});step(30);check('Counter damage expires after that strike',!sc.counterStrike);
 }
 {const sc=await load(6);sc.foes.clear(true,true);place(sc,30*16);const f=sc.spawnFoe('divwarrior',sc.player.x+40,224);f.hp=10;f.dir=-1;f.cool=0;step(3);let attacks=0;const hazard=sc.hazard;sc.hazard=function(...args){attacks++;return hazard.apply(this,args);};
  check('Div warrior visibly commits to its club windup',!!f.smash);
  sc.heavy='heavy';sc.damage(f,3);sc.heavy=null;sc.atk=0;step(40);
  check('Heavy blow staggers a warrior and cancels its delayed club hit',f.hp===7&&!f.smash&&attacks===0,{hp:f.hp,attacks});
  step(130);check('Interrupted warrior recovers and can attack again',attacks>0,{attacks});sc.hazard=hazard;
 }
 // Every trail must be completable with actual movement, jumps, and strikes.
 for(const n of (new URLSearchParams(location.search).get('levels')?.split(',').map(Number)||[1,2,3,4,5,6,7])){
  const sc=await load(n),t=sc.trial;check(`Khan ${n}: optional trial is present and initially idle`,!!t&&t.state==='ready'&&t.sparks.length===0);
  place(sc,t.x);step(3);document.getElementById('offerBtn').click();step();check(`Khan ${n}: interaction starts the optional trial`,t.state==='running'&&t.sparks.length===3&&document.getElementById('s-temple').classList.contains('hidden'));
  S.keys.jump=true;let frame=0,terrainHits=0,rested=false;const terrainDetails=[];const hurt=sc.hurt;sc.hurt=function(x,thirst,cause){if(cause==='terrain'){terrainHits++;if(terrainDetails.length<5)terrainDetails.push({x:this.player.x,feet:this.player.body.bottom,vy:this.player.body.velocity.y,target:t.sparks.find(c=>c.active)?.x});}return hurt.call(this,x,thirst,cause);};
  for(;frame<Math.ceil(t.cfg.seconds*60)+60&&t.state==='running';frame++){
   sc.inv=99999;sc.hp=999;sc.water=100;
   let c=t.sparks.find(c=>c.active);if(!c)break;const b=sc.player.body;const restX=n===2?63*16:n===4?85*16:null;if(t.count===2&&restX&&!rested){if(Math.abs(sc.player.x-restX)<7&&b.blocked.down)rested=true;else c={x:restX,y:1000};}
   S.keys.right=sc.player.x<c.x-3;S.keys.left=sc.player.x>c.x+3;
   const direction=S.keys.left?-1:1,ahead=sc.layer.getTileAtWorldXY(sc.player.x+direction*26,b.bottom+4),wall=sc.layer.getTileAtWorldXY(sc.player.x+direction*22,b.center.y);if(b.blocked.down&&((Math.abs(c.x-sc.player.x)<90&&c.y<b.center.y+4)||wall?.collides||(S.keys.left?b.blocked.left:b.blocked.right)||!ahead?.collides||ahead.index%4===3))S.pressed.jump=true;
   if(!b.blocked.down&&sc.airJumps>0&&b.velocity.y>-90&&c.y<b.bottom-10)S.pressed.jump=true;
   if(frame%24===0)S.pressed.attack=true;
   step();if(frame%120===0)await sleep(1);
  }
  sc.hurt=hurt;resetKeys();check(`Khan ${n}: trial sparks are reachable using normal inputs`,t.state==='complete'&&t.count===3&&terrainHits===0,{seconds:frame/60,terrainHits,terrainDetails,count:t.count,state:t.state,x:sc.player.x,y:sc.player.y});
  check(`Khan ${n}: trial result is saved`,!!JSON.parse(localStorage.getItem('sh-trials')||'{}')[n]?.best);
 }
 {const sc=await load(1),t=sc.trial;const records=JSON.parse(localStorage.getItem('sh-trials')||'{}');delete records[1];localStorage.setItem('sh-trials',JSON.stringify(records));place(sc,t.x);sc.startTrial();const beforeReward=+localStorage.getItem('sh-purse')||0,beforeCount=sc.coinCount;for(const c of t.sparks.slice())sc.eat(c);check('First trial clear earns exactly three provisions',(+localStorage.getItem('sh-purse')||0)===beforeReward+3&&sc.coinCount===beforeCount+3);t.state='ready';sc.startTrial();sc.inv=0;sc.hp=5;sc.hurt(sc.player.x+20);
  check('Taking a real hit fails only the trial and clears its sparks',t.state==='ready'&&t.sparks.length===0&&sc.hp===4&&!sc.done);
  sc.inv=99999;sc.startTrial();t.until=sc.time.now-1;step();check('Trial timeout is retryable and leaves the main journey active',t.state==='ready'&&!sc.done&&t.sparks.length===0);
  sc.startTrial();t.count=2;const purse=+localStorage.getItem('sh-purse')||0;sc.eat(t.sparks[0]);check('Repeated clears cannot farm provisions',(+localStorage.getItem('sh-purse')||0)===purse);
 }
 {const sc=await load(6);sc.foes.clear(true,true);place(sc,3*16);sc.horde={wave:0,live:[]};sc.hordeWave();step(1);const before=sc.horde.live.length;const mark=sc.children.list.find(o=>o.type==='Ellipse'&&o.depth===7);const markedX=mark?.x;step(32);const after=sc.horde.live.length;
  check('Horde entrance gives visible preparation time before enemies appear',before===0&&after>0,{before,after});
  check('Horde arrivals match the marked spawn position',Number.isFinite(markedX)&&sc.horde.live.some(f=>Math.abs(f.home.x-markedX)<1),{markedX,arrivals:sc.horde.live.map(f=>f.home.x)});
 }
 {const sc=await load(5);sc.foes.clear(true,true);place(sc,38*16);const a=sc.spawnFoe('spearman',35*16,224),b=sc.spawnFoe('spearman',36*16,224);a.cool=b.cool=0;let together=0,attacks=new Set();
  for(let i=0;i<420;i++){sc.inv=99999;step();if(a.thrust)attacks.add('a');if(b.thrust)attacks.add('b');if(a.thrust&&b.thrust)together++;if(i%120===0)await sleep(1);}
  check('Nearby spearmen take turns while both remain dangerous',together===0&&attacks.size===2,{together,attackers:[...attacks]});
 }
 check('Entertainment audit has no runtime errors',result.errors.length===0);box.textContent+='ENTERTAINMENT AUDIT COMPLETE';
}catch(e){result.error=e.stack;box.textContent+='FAIL '+e.stack;}
window.__entertainmentResult=result;fetch('/__result',{method:'POST',body:JSON.stringify(result)});
})();
