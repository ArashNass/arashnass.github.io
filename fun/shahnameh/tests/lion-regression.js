(async()=>{
if(location.hostname!=='127.0.0.1'||location.port!=='8773')throw Error('Dedicated test origin required');
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


 const check=(name,pass,details={})=>{result.probes.push({name,pass,...details});write((pass?'PASS ':'FAIL ')+name+' '+JSON.stringify(details));};

 {const sc=await load(1),B=sc.boss;B.state='prowl';B.tm=0;B.body.reset(B.keep*16,224-1-.47*B.displayHeight);sc.player.body.reset(sc.wall.x+25,sc.player.y);step();check('lion makes space at left boundary',B.state==='prowl'&&B.body.velocity.x>0,{state:B.state,vx:B.body.velocity.x});}
 {const sc=await load(1),B=sc.boss;B.state='charge';B.tm=50;B.dir=-1;B.body.blocked.right=true;B.body.blocked.left=false;B.hitKeep=false;sc.lionAI();check('opposite wall flag does not cancel an escaping charge',B.state==='charge');}
 {const sc=await load(1),B=sc.boss;B.state='pounce';B.tm=-36;B.body.blocked.down=false;sc.lionAI();check('airborne attack has bounded recovery',B.state==='recover');}
 {const sc=await load(1),B=sc.boss;B.body.reset(94*16,224-1-.47*B.displayHeight);sc.player.body.reset(90*16,160-1-.47*sc.player.displayHeight);B.brain=null;B.state='prowl';B.tm=0;const random=Math.random;Math.random=()=>0;sc.lionAI();Math.random=random;check('ledge target gets a reachable leap instead of a ground swipe',B.state==='crouch',{state:B.state});}
 for(const fps of [30,60])for(const policy of ['left-corner','right-corner','ground','close','crossing','ledge']){
  dt=1000/fps;const sc=await load(1),B=sc.boss;sc.inv=99999;let seed=fps+policy.length;const random=Math.random;Math.random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
  if(policy==='right-corner')sc.placeBoss(B),B.body.reset(sc.wallR.x-40,B.y);
  let maxIdle=0,idle=0,lastX=B.x;const states=new Set();let openings=0,lastState=B.state;const transitions=[];
  for(let i=0;i<fps*45;i++){
   sc.hp=999;sc.inv=999;
   const px=policy==='ground'?Math.max(sc.wall.x+40,Math.min(sc.wallR.x-40,B.x-95)):policy==='left-corner'?sc.wall.x+25:policy==='right-corner'?sc.wallR.x-25:policy==='close'?B.x-40:policy==='crossing'?(Math.floor(i/(fps*3))%2?sc.wall.x+55:sc.wallR.x-55):90*16;
   if(policy!=='ground'||i%120===0){sc.player.body.reset(px,(policy==='ledge'?10:14)*16-1-.47*sc.player.displayHeight);sc.player.setVelocity(0);}
   step();states.add(B.state);
   if(B.state!==lastState){transitions.push(B.state);if(B.calm())openings++;lastState=B.state;}
   idle=Math.abs(B.x-lastX)<.1&&!B.calm()?idle+dt:0;maxIdle=Math.max(idle,maxIdle);lastX=B.x;
   if(i%120===0)await sleep(1);
  }
  Math.random=random;
  check(fps+'fps '+policy+' keeps cycling',openings>=8&&states.size>=5&&maxIdle<3500,{openings,maxIdle,states:[...states],transitions});
  if(policy==='ground')check(fps+'fps close ground pressure includes paw swipes',states.has('pawReady')&&states.has('paw'));
 }

 dt=1000/60;
 {const sc=await load(1),B=sc.boss;let frames=0,strikes=0;
  for(;frames<18000&&B.hp>0;frames++){
   sc.hp=999;sc.inv=999;
   if(B.body.enable&&!B.immune()){
    const side=B.x>sc.cam.scrollX+240?-1:1;
    const px=side<0?B.body.left-sc.player.body.width/2-10:B.body.right+sc.player.body.width/2+10;
    sc.face=-side;sc.player.body.reset(px,sc.bossFloorAt(px)-1-.47*sc.player.displayHeight);sc.player.setVelocity(0);
    if(frames%18===0){sc.atk=10;sc.hitDone=new Set();sc.heavy=null;strikes++;}
   }else if(frames%60===0){sc.player.body.reset(sc.wall.x+230,224-1-.47*sc.player.displayHeight);sc.player.setVelocity(0);}
   step();if(frames%180===0)await sleep(1);
  }
  check('lion can be defeated through real player strike collisions',B.hp<=0,{seconds:frames/60,strikes,hp:B.hp});
 }
 window.__lionResult=result;write('LION REGRESSION COMPLETE');fetch('/__result',{method:'POST',body:JSON.stringify(result)});S.game.loop.wake();
}catch(e){result.error=e.stack;window.__lionResult=result;write('FAIL '+e.stack);fetch('/__result',{method:'POST',body:JSON.stringify(result)});}
})();
