(async()=>{
if(location.hostname!=='127.0.0.1'||location.port!=='8779')throw Error('Dedicated test origin required');
const sleep=ms=>new Promise(r=>setTimeout(r,ms)),result={suite:'journey',probes:[],errors:[],notes:['Focused scenarios position the player to isolate each mechanic. The existing all-route suite separately traverses full levels using movement/jump/strike inputs.']};
addEventListener('error',e=>result.errors.push(e.message));const box=document.createElement('pre');box.id='journey-report';box.style='position:fixed;inset:12px;z-index:101;background:#101520ee;color:white;overflow:auto;padding:15px';document.body.append(box);
const check=(name,pass,detail={})=>{result.probes.push({name,pass:!!pass,...detail});box.textContent+=`${pass?'PASS':'FAIL'} ${name} ${JSON.stringify(detail)}\n`;};
try{
 while(!window.__sh?.scene()?.player)await sleep(20);
 const S=window.__sh;S.snd.A.muted=true;S.snd.A.failed=true;S.SET.voice=0;S.game.loop.sleep();
 let T=performance.now()+1e6,dt=1000/60;const clocks=new Map();
 const step=(n=1)=>{const tw=S.scene().tweens;if(!clocks.has(tw)){clocks.set(tw,tw.getDelta);tw.getDelta=()=>dt;}for(let i=0;i<n;i++){T+=dt;S.game.headlessStep(T,dt);}};
 const keys=()=>{for(const k in S.keys)S.keys[k]=false;for(const k in S.pressed)S.pressed[k]=false;};
 const load=async(n,rise=false)=>{keys();const old=S.scene().player,first=!S.scene().started&&S.scene().lv===S.LEVELS[n];S.begin(n,rise,false,true);for(let i=0;i<500;i++){step(2);await sleep(3);if(S.scene().player?.active&&(first||S.scene().player!==old)&&S.scene().lv===S.LEVELS[n])break;}const sc=S.scene();sc.drawDark=()=>{};sc.hp=sc.maxHp=999;sc.inv=99999;sc.water=100;sc.hordeDone=true;sc.siegeDone=true;return sc;};
 const place=(s,c,r)=>{const x=c*16,foot=(r??s.groundAt(x)??14)*16;s.player.body.reset(x,foot-1-.47*s.player.displayHeight);s.player.body.updateFromGameObject();s.player.body.prev.copy(s.player.body.position);s.player.body.prevFrame.copy(s.player.body.position);s.player.setVelocity(0);};
 {const sc=await load(1);sc.foes.clear(true,true);place(sc,8);step(120);
  check('First labour has no pursuit: the lion only watches until the fire has held',!sc.journey?.hunter&&sc.journey?.phase==='approach'&&!sc.journey?.lion);
  check('Opening contains no spawned lion or horse',!sc.children.list.some(o=>o.texture&&/lion|rakhsh/.test(o.texture.key))&&!sc.bossOn);
  place(sc,28);step(170);check('First refuge does not spawn a horse or start the boss',!sc.children.list.some(o=>o.texture&&/lion|rakhsh/.test(o.texture.key))&&!sc.bossOn);
 }
 for(const sheltered of [false,true]){const sc=await load(2);sc.foes.clear(true,true);sc.prayed=false;place(sc,sheltered?77.5:75);step(2);const j=sc.journey;
  check(`Sand surge gives advance warning (${sheltered?'high':'low'} route)`,!!j.surge&&j.surge.age<0&&!j.surge.o.visible);
  step(100);check(sheltered?'Raised rocks shelter the player from the surge':'Low sand route costs water when the surge reaches the player',sheltered?!j.surge?.hit&&sc.water>90:j.surge?.hit&&sc.water<90,{water:sc.water,hit:j.surge?.hit});
 }
 {const sc=await load(3);sc.foes.clear(true,true);place(sc,36.5);sc.hp=5;sc.inv=0;step(2);const j=sc.journey;
  check('Dragon crosses the moon and marks its fire before impact',j.log.some(x=>x.id==='dragon-34')&&j.marks.some(m=>m.active)&&j.hazards.length===0);
  step(45);check('Marked dragon fire does not damage before its warning expires',sc.hp===5,{hp:sc.hp});step(40);
  check('Remaining on a marked landing causes real fire damage',sc.hp<5&&j.hazards.length>0,{hp:sc.hp});
 }
 {const sc=await load(4);sc.foes.clear(true,true);place(sc,34);step(2);const j=sc.journey,b=j.bridges[0];
  check('Garden blooms an actual walkable shortcut',b.state==='bloom'&&sc.layer.getTileAt(35,14)?.collides);
  S.keys.right=true;step(55);S.keys.right=false;check('Player walks over the newly blooming bridge',sc.player.x>38*16&&sc.player.body.bottom<230,{x:sc.player.x,feet:sc.player.body.bottom});
  place(sc,31);for(let i=0;i<400&&b.state!=='fading';i++)step();check('Bridge warns violet before vanishing',b.state==='fading'&&sc.layer.getTileAt(35,14)?.tint===0xc278ce);
  step(65);check('Enchanted shortcut really vanishes',b.state==='gone'&&!sc.layer.getTileAt(35,14));step(170);check('Garden shortcut returns for another attempt',b.state==='bloom'&&!!sc.layer.getTileAt(35,14));
  sc.startWitch();sc.unmask();step(3);check('Unmasking withers the garden and ends the route illusions',j.withering&&j.closed&&!sc.layer.getTileAt(35,14));
 }
 {const sc=await load(5);sc.foes.clear(true,true);place(sc,60);const foot=sc.player.body.bottom;step(3);const j=sc.journey;
  check('Olad pursuit changes Rostam to a mounted playable rider',j.phase==='pursuit'&&sc.mounted&&sc.player.texture.key==='ride-gallop');
  check('Mount transition preserves the ground contact',Math.abs(sc.player.body.bottom-foot)<3,{before:foot,after:sc.player.body.bottom});
  let parried=false;const knifeTrace=[];
  for(let i=0;i<360;i++){const sh=sc.shots.getChildren().find(o=>o.journey&&!o.back);if(sh&&i%5===0&&knifeTrace.length<30)knifeTrace.push({d:sh.x-sc.player.x,y:sh.y,py:sc.player.body.center.y,atk:sc.atk,cool:sc.cool,face:sc.face,box:sc.strikeBox()});if(sh&&sh.x-sc.player.x<75&&sh.x>sc.player.x+35&&sc.cool<=0)S.pressed.attack=true;step();if(sc.shots.getChildren().some(o=>o.journey&&o.back))parried=true;if(i%120===0)await sleep(1);}
  check('A real mace strike can parry a pursuit knife',parried,{phase:j.phase,knifeTrace:parried?undefined:knifeTrace,playerX:sc.player.x});
  place(sc,107);step(32);check('The pursuit ends and restores on-foot combat before the boss',j.phase==='escaped'&&!sc.mounted&&!sc.bossOn);step(90);check('No late pursuit knives appear at the final checkpoint',!sc.shots.getChildren().some(sh=>sh.journey));
 }
 {const sc=await load(6);sc.foes.clear(true,true);place(sc,72,9);sc.hordeDone=false;sc.horde={wave:2,live:[],spawning:Infinity};step(2);const j=sc.journey;
  check('War drums warn of fire lanes before they ignite',j.log.some(x=>x.id==='war-drums')&&j.marks.some(m=>m.active)&&j.hazards.length===0);
  step(65);check('Horde fire lane is real and leaves the high platform clear',j.hazards.length>0&&j.hazards.every(h=>h.r.top>sc.player.body.bottom));
  for(const d of j.drums){place(sc,(d.g.x-30)/16,9);sc.face=1;for(let i=0;i<100&&d.g.active;i++){if(i%24===0)S.pressed.attack=true;step();}}
  check('Mace strikes destroy both war drums',j.drums.every(d=>!d.g.active));
  step(240);check('Silencing both drums stops their fire lanes',j.hazards.length===0);
 }
 {let sc=await load(7);sc.foes.clear(true,true);let j=sc.journey;place(sc,100.5,10);step(5);const b=j.crumble.find(b=>b.c===100);
  check('Mountain ledge cracks after being stood on',b.state==='cracking');place(sc,98);step(60);check('Cracked ledge falls after its warning',b.state==='gone'&&!sc.layer.getTileAt(100,10));step(180);check('Fallen ledge reforms for retry',b.state==='solid'&&!!sc.layer.getTileAt(100,10));
  place(sc,120);step(3);check('Cave ice announces marked columns before falling',j.log.some(x=>x.id==='cave-ice')&&j.marks.some(m=>m.active));step(85);check('Falling cave ice creates a real impact zone',j.hazards.length>0);
  place(sc,139);sc.face=1;for(let i=0;i<120&&j.seal.active;i++){if(i%24===0)S.pressed.attack=true;step();}
  check('Normal mace attacks can shatter the cave ice seal',!j.seal.active&&j.sealHp<=0);
  S.keys.right=true;step(42);S.keys.right=false;check('Breaking the seal physically opens the path to the last fire',sc.player.x>142*16&&!sc.bossOn,{x:sc.player.x});
  sc=await load(7,true);check('Checkpoint retry beyond the seal does not recreate a blocking wall',sc.start.x>=143*16&&!sc.journey.seal,{start:sc.start.x});
  check('Cave entrance has an additional safe checkpoint',sc.altars.some(a=>Math.floor(a.x/16)===119));
 }
 {const old=S.scene().player;document.getElementById('rushBtn').click();for(let i=0;i<400;i++){step(2);await sleep(2);if(S.scene().player!==old&&S.scene().lv===S.LEVELS[1])break;}S.keys.right=true;step(90);S.keys.right=false;check('Boss Rush excludes route encounters and their blockers',!S.scene().journey&&!!S.scene().bossOn,{journey:!!S.scene().journey,boss:S.scene().bossOn,level:S.scene().lv.name});}
 check('All story encounters have no script errors',result.errors.length===0);box.textContent+='JOURNEY AUDIT COMPLETE';
}catch(e){result.error=e.stack;box.textContent+='FAIL '+e.stack;}
window.__journeyResult=result;fetch('/__result',{method:'POST',body:JSON.stringify(result)});
})();
