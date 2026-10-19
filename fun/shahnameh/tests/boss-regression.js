(async()=>{
if(location.hostname!=='127.0.0.1'||location.port!=='8772')throw Error('Dedicated test origin required');
const sleep=ms=>new Promise(r=>setTimeout(r,ms)), result={trials:[],probes:[],errors:[]};
addEventListener('error',e=>result.errors.push(e.message));
const box=document.createElement('pre');box.id='boss-audit-report';box.style='position:fixed;inset:12px;z-index:101;background:#101520ee;color:white;overflow:auto;padding:15px;pointer-events:none';document.body.append(box);
const write=s=>box.textContent+=s+'\n';
try{
 while(!window.__sh?.scene()?.player)await sleep(30);
 const S=window.__sh;S.snd.A.muted=true;S.SET.voice=0;S.SET.shake=false;S.SET.flash=false;S.game.loop.sleep();
 let T=performance.now()+1e6,dt=1000/60;const clocks=new Map();
 const step=(n=1)=>{const m=S.scene()?.tweens;if(m&&!clocks.has(m)){clocks.set(m,m.getDelta);m.getDelta=()=>dt;}for(let i=0;i<n;i++){T+=dt;S.game.headlessStep(T,dt);}};
 const bases={};for(const k of ['hurt','hazard','shoot','iceStrike','splitFloor','sweepHigh'])bases[k]=S.scene()[k];
 const start=[null,'startBoss','startQueen','startDragon','startWitch','startOlad','startArzhang','startWhiteDiv'];
 const left=[0,86,138,112,112,112,124,146],ledge=[0,90,142,116,116,116,128,150];
 const load=async n=>{
  let sc=S.scene();for(const k in bases)sc[k]=bases[k];
  const previousPlayer=sc.player, first=!sc.started&&!sc.done&&sc.lv===S.LEVELS[n];let created=false;S.begin(n,false,false,true);for(let i=0;i<500;i++){step(3);await sleep(8);sc=S.scene();created=(first||sc.player!==previousPlayer)&&sc.player?.active&&!!sc.foes?.children;if(created&&sc.lv===S.LEVELS[n])break;}if(!created)throw Error('Level not ready '+n);
  sc.drawDark=()=>{}; // Core/general suites cover rendering; this suite isolates combat physics.
  sc.hp=sc.maxHp=999;sc.water=100;sc.hordeDone=true;sc.foes.clear(true,true);sc.prayed=true;
  sc.player.body.reset((left[n]+6)*16,14*16-1-.47*sc.player.displayHeight);sc.player.setVelocity(0);
  if(!sc.bossOn)sc[start[n]]();if(n===4&&!sc.unmasked)sc.unmask();
  for(let i=0;i<220&&(sc.intro||sc.frozen||!sc.boss?.body.enable);i++){step(1);if(i%60===0)await sleep(2);}
  sc.frozen=false;sc.intro=false;sc.hp=999;return sc;
 };

 const check=(name,ok,details={})=>{result.probes.push({name,pass:!!ok,...details});write((ok?'PASS ':'FAIL ')+name+' '+JSON.stringify(details));};
 for(const fps of [30,60]){dt=1000/fps;for(let n=1;n<=7;n++){const sc=await load(n),B=sc.boss;let below=false;for(let i=0;i<fps*30;i++){step();below ||= B.body.top>472;if(i%120===0)await sleep(1);}check(`boss ${n} remains in arena at ${fps}fps`,!below,{y:B.y,state:B.state});}}
 for(const fps of [30,60]){dt=1000/fps;const sc=await load(1),B=sc.boss;B.state='roar';B.tm=120;let frames=0;while(B.state==='roar'&&frames<200){step();frames++;}check(`real-time roar at ${fps}fps`,Math.abs(frames*dt-2000)<dt+1,{ms:frames*dt});}
 dt=1000/60;
 {const sc=await load(5),B=sc.boss;B.state='guard';B.tm=999;B.dir=-1;B.body.reset(132*16,224-1-.47*B.displayHeight);B.setVelocity(0);sc.player.body.reset(B.x-28,224-1-.47*sc.player.displayHeight);sc.player.setVelocity(0);S.keys.right=true;step();S.keys.right=false;sc.atk=10;sc.hitDone=new Set();sc.heavy=null;const hp=B.hp;step();check('blocked strike has no knockback',B.hp===hp&&B.body.velocity.y>=0,{hp:B.hp,vy:B.body.velocity.y});}
 {const sc=await load(1),B=sc.boss;B.state='stun';B.tm=100;B.setVelocity(0);sc.inv=0;sc.player.body.reset(sc.player.x+B.body.center.x-sc.player.body.center.x,sc.player.y+B.body.center.y-sc.player.body.center.y);sc.player.setVelocity(0);const hp=sc.hp;step();check('stunned lion contact is safe',sc.hp===hp);}
 {const sc=await load(5),B=sc.boss;B.state='ready';B.tm=20;B.dir=-1;sc.player.body.reset(B.x+30,sc.player.y);sc.oladAI();check('Olad windup commits direction',B.dir===-1);}
 {const sc=await load(3),B=sc.boss;B.state='lunge';B.tm=30;B.dir=1;B.setVelocityX(250);sc.player.body.reset(B.x-60,sc.player.y);sc.dragonAI();check('dragon lunge faces movement',B.dir===1&&!B.flipX&&B.body.velocity.x>0);}
 {const sc=await load(7),B=sc.boss;let created=0;sc.hazard=function(...args){created++;return bases.hazard.apply(this,args)};sc.iceStrike(sc.player.x);B.hp=1;sc.damage(B,1,true);step(110);check('queued icicle cannot attack after death',created===0,{created});}
 {const sc=await load(1),B=sc.boss;B.state='crouch';B.tm=32;B.dir=-1;B.setVelocity(0);step(20);check('lion has visible pounce anticipation',B.state==='crouch'&&B.body.velocity.y===0);step(14);check('lion launches after anticipation',B.state==='pounce'&&B.body.velocity.y<0);}
 {const sc=await load(5),B=sc.boss;B.hp=Math.floor(B.max/2);B.state='walk';B.tm=0;const random=Math.random;Math.random=()=>0;sc.oladAI();Math.random=random;B.state='slash';B.tm=0;sc.oladAI();check('Olad second phase warns before follow-up',B.state==='ready'&&B.tm>=30);B.state='slash';B.tm=0;sc.oladAI();check('Olad combo ends with punish window',B.state==='open'&&B.tm>=80);}
 {const sc=await load(2),B=sc.boss;B.state='walk';B.diveAge=800;sc.queenAI();check('Queen cannot indefinitely skip burrow',B.state==='dive');B.state='surfacing';B.tm=18;check('Queen eruption is not advertised as opening',B.immune());step(19);check('Queen opens after eruption',B.state==='surfaced'&&!B.immune());}
 {const sc=await load(3),B=sc.boss;B.hp=Math.floor(B.max/2);B.state='breath';B.tm=0;B.fired=true;const random=Math.random;Math.random=()=>0;sc.dragonAI();Math.random=random;check('dragon phase two has warned follow-up',B.state==='coil'&&B.tm>=30);}
 {const sc=await load(6),B=sc.boss;sc.placeBoss(B);B.body.reset(B.x,1000);step();check('boss out-of-world recovery',B.body.bottom<300);}
 for(const n of [6,7]){const sc=await load(n),B=sc.boss;B.state=n===6?'raise':'raise';B.tm=1;if(n===6)B.combo=['split'];let opened=false;for(let i=0;i<150;i++){step();if(B.state===(n===6?'rest':'stuck')){opened=true;break;}}check(`boss ${n} floor hazard expires before opening`,opened&&sc.hazards.every(z=>z.until<=sc.time.now),{state:B.state,remaining:sc.hazards.map(z=>z.until-sc.time.now)});}


 // Queen: turn toward a trailing player with a committed tell; never advertise an active eruption as safe.
 {const sc=await load(2),B=sc.boss;B.state='walk';B.dir=1;B.think=999;B.diveAge=0;B.rearT=37;sc.player.body.reset(B.x-90,sc.player.y);sc.queenAI();check('Queen reacts to a player behind her',B.state==='turn'&&B.tm>=26&&B.turnDir===-1);sc.player.body.reset(B.x+90,sc.player.y);B.tm=0;sc.queenAI();check('Queen turn stays committed during warning',B.dir===-1&&B.state==='walk');}
 {const sc=await load(2),B=sc.boss;sc.stars?.destroy();sc.stars=null;B.state='surfacing';B.tm=18;sc.queenAI();check('Queen eruption has no misleading stun stars',!sc.stars&&!B.calm());B.tm=0;sc.queenAI();check('Queen recovery displays stars only after eruption',B.calm()&&sc.stars?.active);}
 {const sc=await load(2),B=sc.boss;B.state='under';B.underAge=241;B.goal=NaN;B.body.enable=false;B.setAlpha(0);sc.queenAI();check('Queen damaged burrow target recovers into warning',Number.isFinite(B.goal)&&sc.swirl?.active);}

 {const sc=await load(3),B=sc.boss;B.state='lunge';B.tm=30;B.dir=-1;B.body.blocked.right=true;B.body.blocked.left=false;B.hitKeep=false;sc.dragonAI();check('dragon lunge ignores the wall behind it',B.state==='lunge');}
 {const sc=await load(3),B=sc.boss;B.state='breath';B.tm=0;B.fired=true;B.breathUntil=sc.time.now+100;sc.dragonAI();check('dragon recovery waits for flame hazard to expire',B.state==='breath');check('dragon does not signal a safe opening during flame breath',!B.open()&&!B.calm());step(8);check('dragon advances after its flame expires',B.state!=='breath');}
 {const sc=await load(3),B=sc.boss;B.state='lurk';B.tm=100;B.body.reset(B.keep*16,B.y);sc.player.body.reset(B.x-100,sc.player.y);sc.dragonAI();check('dragon moves out of a pinned boundary',B.body.velocity.x>0);}

 {const sc=await load(4),B=sc.boss;B.state='cast';B.tm=30;B.dir=-1;B.aimX=B.x-100;B.aimY=sc.player.y;sc.player.body.reset(B.x+100,sc.player.y);sc.witchAI();check('witch keeps committed cast facing',B.dir===-1&&B.flipX);}
 {const sc=await load(4),B=sc.boss;const hp=B.hp;B.onBack();check('reflected witch curse rewards a safe stagger',B.hp<hp&&B.state==='reel'&&B.calm()&&sc.stars?.active);step(75);check('witch resumes after a bounded parry stagger',B.state!=='reel'&&B.body.enable);}
 {const sc=await load(4),B=sc.boss;const x=B.x;B.state='blink';B.tm=0;B.body.enable=false;B.setAlpha(0);sc.witchAI();check('witch teleport changes position inside arena',Math.abs(B.x-x)>60&&B.x>=sc.wall.x+55&&B.x<=sc.wallR.x-55&&B.body.enable);}

 {const sc=await load(5),B=sc.boss;B.state='walk';B.tm=0;B.body.reset(B.keep*16,B.y);sc.player.body.reset(B.x-100,sc.player.y);sc.oladAI();check('Olad makes room instead of walking into boundary',B.state==='walk'&&B.body.velocity.x>0);}
 {const sc=await load(5),B=sc.boss;B.state='walk';B.tm=0;B.body.reset(124*16,B.y);sc.player.body.reset(B.x-70,160-1-.47*sc.player.displayHeight);B.brain={recent:[],ready:{knife:sc.time.now+10000}};sc.oladAI();check('Olad waits for a reachable ledge attack instead of slashing below it',['walk','retreat'].includes(B.state));}
 {const sc=await load(5),B=sc.boss;B.state='retreat';B.tm=20;B.dir=1;B.body.blocked.right=true;B.body.blocked.left=false;sc.oladAI();check('Olad retreat ignores the wall he is leaving',B.state==='retreat');B.state='knife';B.tm=0;B.intent='Knife drawn';sc.oladAI();check('Olad clears attack warning during punish window',B.state==='open'&&B.intent==='');}

 for(const n of [6,7]){const sc=await load(n),B=sc.boss;B.state='charge';B.tm=40;B.dir=1;B.body.blocked.left=true;B.body.blocked.right=false;sc.charge(B,n===6?'arzhang-walk':'whitediv-walk');check('Div '+n+' charge ignores the wall behind it',B.state==='charge');}
 {const sc=await load(6),B=sc.boss;B.state='walk';B.tm=90;B.chargeCd=9999;B.body.reset(B.keep*16,B.y);sc.player.body.reset(B.x-160,sc.player.y);sc.arzhangAI();check('Arzhang changes tactics when pinned at keep line',B.tm<=24);B.combo=['split','sweep'];sc.windUp(B,60);check('Arzhang cue identifies the next axe blow and count',B.intent.includes('Ground split')&&B.intent.includes('2 blows'));}
 {const sc=await load(6),B=sc.boss;B.state='stompReady';B.tm=1;B.stompX=B.x-20;B.stompWarn=sc.add.rectangle(B.x,200,164,24);sc.arzhangAI();check('Arzhang stomp removes warning and hits the committed area',!B.stompWarn&&sc.hazards.some(z=>Math.abs(z.r.x-(B.stompX-82))<1));}
 // Observe actual fights under three repeatable player strategies. These are not human fun scores.
 for(const policy of ['ground','jump','camp'])for(let n=1;n<=7;n++){
  dt=1000/60;const sc=await load(n),B=sc.boss;B.hp=Math.ceil(B.max/2);sc.inv=99999;
  const visited=new Set(),attacks=new Set(),moves=[];let last='',below=false;const originalRandom=Math.random;let seed=1700+n;
  Math.random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
  for(const [method,move] of [['splitFloor','split'],['sweepHigh','sweep']])sc[method]=function(...args){attacks.add(move);return bases[method].apply(this,args)};
  try{for(let i=0;i<3600;i++){
   sc.hp=999;sc.inv=999;sc.water=100;
   if(policy==='camp'){sc.player.body.reset((ledge[n])*16,10*16-1-.47*sc.player.displayHeight);sc.player.setVelocity(0);}
   else if(policy==='jump'&&i%65===0){sc.player.setVelocityY(-335);}
   else if(policy==='ground'&&i%120===0){sc.player.body.reset(Math.max(sc.wall.x+40,Math.min(sc.wallR.x-40,B.x-95)),224-1-.47*sc.player.displayHeight);sc.player.setVelocity(0);}
   step();visited.add(B.state);
   const attackStates={1:['charge','pounce','paw'],2:['sting','spit','dive'],3:['breath','lunge','embers'],4:['cast','vanish'],5:['slash','knife','retreat'],6:['stomp','charge'],7:['slam','throw','roar','charge']};
   if(attackStates[n].includes(B.state))attacks.add(B.state==='slash'?B.attackMove||'slash':B.state==='cast'?B.castMove||'cast':B.state==='smash'?(B.combo?.[0]||'axe'):B.state);
   below ||= B.body.top>472;
   if(B.state!==last){moves.push(B.state);last=B.state;}
   if(i%240===0)await sleep(1);
  }}finally{Math.random=originalRandom;}
  result.trials.push({labour:n,policy,seconds:60,states:[...visited],attacks:[...attacks],sequence:moves});
  check(`boss ${n} varies attacks for ${policy}`,visited.size>=4&&attacks.size>=2&&!below,{states:[...visited],attacks:[...attacks]});
  if(n===1&&policy==='ground')check('lion uses close paw attacks',visited.has('pawReady')&&visited.has('paw'));
  if(n===1&&policy==='camp')check('lion actively hunts the ledge',visited.has('crouch')&&visited.has('pounce'));
 }
 {const sc=await load(1),B=sc.boss;B.state='crouch';B.tm=30;B.aimX=B.x-100;B.dir=-1;sc.player.body.reset(B.x+120,sc.player.y);step(12);check('lion pounce target stays committed during tell',B.aimX===B.x-100&&B.dir===-1);}
 {const sc=await load(1),B=sc.boss;B.state='recover';B.tm=100;const hp=B.hp;const first=sc.damage(B),second=sc.damage(B);check('one melee impact cannot drain a boss instantly',first===true&&second===false&&B.hp===hp-1);}
 {const sc=await load(1),B=sc.boss;sc.hp=99;sc.inv=0;sc.player.body.reset(90*16,10*16-1-.47*sc.player.displayHeight);sc.player.setVelocity(0);const hp=sc.hp;for(let i=0;i<2400&&sc.hp===hp;i++){step();if(i%180===0)await sleep(1);}check('lion camping ledge can be reached by a warned leap',sc.hp<hp,{hpBefore:hp,hpAfter:sc.hp,state:B.state});}
 {const sc=await load(5),B=sc.boss;B.state='knifeReady';B.tm=1;B.aimX=sc.player.x;B.aimY=sc.player.body.center.y;sc.oladAI();const knife=sc.shots.getChildren().find(x=>x.texture.key==='knife');check('Olad creates a parryable physical knife',!!knife&&knife.curse);if(knife){const hp=B.hp;sc.deflect(knife);for(let i=0;i<120&&B.hp===hp;i++)step();check('parried knife damages Olad and opens his guard',B.hp<hp&&B.state==='open',{hp:B.hp,state:B.state});}}
 {const sc=await load(1),B=sc.boss;const before=sc.bossRead(B).camp;sc.intro=true;sc.frozen=true;step(120);check('forced introduction does not train camping memory',sc.bossRead(B).camp===before);sc.intro=false;sc.frozen=false;}
 // Defeat through the actual player's melee update: no forced boss damage, immunity changes or forced opening states.
 for(let n=1;n<=7;n++){
  const sc=await load(n),B=sc.boss;let strikes=0,elapsed=0;const states=new Set();
  for(;elapsed<24000&&B.hp>0;elapsed++){
   sc.hp=999;sc.inv=999;sc.water=100;states.add(B.state);
   if(B.body.enable&&B.alpha>.5&&!B.immune?.()){
    const side=B.x>sc.cam.scrollX+240?-1:1;
    const px=side<0?B.body.left-sc.player.body.width/2-10:B.body.right+sc.player.body.width/2+10;
    sc.face=side<0?1:-1;
    sc.player.body.reset(px,sc.bossFloorAt(px)-1-.47*sc.player.displayHeight);sc.player.setVelocity(0);
    if(elapsed%18===0){sc.atk=10;sc.hitDone=new Set();sc.heavy=null;strikes++;}
   }else if(elapsed%60===0){sc.player.body.reset((left[n]+19)*16,224-1-.47*sc.player.displayHeight);sc.player.setVelocity(0);}
   step();if(elapsed%180===0)await sleep(1);
  }
  check(`boss ${n} defeated by player strike collisions`,B.hp<=0,{seconds:elapsed/60,strikes,hp:B.hp,states:[...states]});
 }
 S.setPaused(true);write('BOSS FIX REGRESSION COMPLETE');
}catch(e){result.error=e.stack;write(e.stack);}fetch('/__result',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(result)});
})();
