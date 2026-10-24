(async()=>{
if(location.hostname!=='127.0.0.1'||location.port!=='8777')throw Error('Dedicated test origin required');
const sleep=ms=>new Promise(r=>setTimeout(r,ms)),result={suite:'encounters',probes:[],errors:[],notes:['Route bots use raised health, keep water filled and bypass the horde/puzzle to isolate terrain traversal; combat and progression are checked by the separate core, boss and flow suites.']};
addEventListener('error',e=>result.errors.push(e.message));const box=document.createElement('pre');box.id='encounter-report';box.style='position:fixed;inset:12px;z-index:101;background:#101520ee;color:white;overflow:auto;padding:15px';document.body.append(box);
const check=(name,pass,detail={})=>{result.probes.push({name,pass:!!pass,...detail});box.textContent+=`${pass?'PASS':'FAIL'} ${name} ${JSON.stringify(detail)}\n`;};
try{
 while(!window.__sh?.scene()?.player)await sleep(20);
 const S=window.__sh;S.snd.A.muted=true;S.snd.A.failed=true;S.SET.voice=0;S.game.loop.sleep();
 let T=performance.now()+1e6,dt=1000/60;const clocks=new Map();
 const step=(n=1)=>{const tw=S.scene().tweens;if(!clocks.has(tw)){clocks.set(tw,tw.getDelta);tw.getDelta=()=>dt;}for(let i=0;i<n;i++){T+=dt;S.game.headlessStep(T,dt);}};
 const load=async n=>{S.keys.right=S.keys.left=S.keys.jump=false;const old=S.scene().player,first=!S.scene().started;S.begin(n,false,false,true);for(let i=0;i<500;i++){step(2);await sleep(3);if(S.scene().player?.active&&(first||S.scene().player!==old)&&S.scene().lv===S.LEVELS[n])break;}const sc=S.scene();sc.drawDark=()=>{};sc.hp=sc.maxHp=999;sc.inv=99999;sc.hordeDone=true;sc.siegeDone=true;sc.prayed=true;sc.water=100;return sc;};
 const place=(sc,x)=>{const r=sc.groundAt(x)??14;sc.player.body.reset(x,r*16-1-.47*sc.player.displayHeight);sc.player.setVelocity(0);};
 for(let n=2;n<=7;n++){
  let sc=await load(n),fs=sc.foes.getChildren();
  check(`Khan ${n}: every map foe has a deliberate encounter area`,fs.length>0&&fs.every(f=>f.encounter&&f.roam[1]-f.roam[0]>f.body.width+2),{count:fs.length});
  check(`Khan ${n}: three optional feathers remain`,sc.coins.getChildren().filter(c=>c.kind==='sfeather').length===3);
  check(`Khan ${n}: checkpoint floors are safe`,sc.altars.every(a=>{const t=sc.layer.getTileAtWorldXY(a.x,a.y+3);return t?.collides&&t.index%4!==3;}),{count:sc.altars.length});
  for(const fps of [30,60]){
   dt=1000/fps;sc=await load(n);fs=sc.foes.getChildren();let escaped=[],buried=[];
   for(let i=0;i<fps*24;i++){
    const target=fs[Math.floor(i/(fps*3))%fs.length];place(sc,Math.min(target.home.x, (n===2?125:n===3?110:n===4||n===5?111:n===6?119:145)*16));sc.inv=99999;sc.water=100;step();
    for(const f of fs){if(!f.active||!f.body.enable)continue;const b=f.body;if(b.left<f.roam[0]-4||b.right>f.roam[1]+4)escaped.push({kind:f.kind,x:f.x,roam:f.roam});if(b.allowGravity&&b.bottom>18*16)buried.push(f.kind);}
    if(i%120===0)await sleep(1);
   }
   check(`Khan ${n}: ${fps}Hz foes stay in encounter areas`,!escaped.length,{escaped:escaped.slice(0,3)});
   check(`Khan ${n}: ${fps}Hz no foe falls through terrain`,!buried.length);
  }
  dt=1000/60;sc=await load(n);let hits=0;sc.hurt=()=>hits++;
  for(const a of sc.altars){place(sc,a.x);for(let i=0;i<600;i++){sc.water=100;sc.player.setVelocity(0);step();if(i%120===0)await sleep(1);}}
  delete sc.hurt;check(`Khan ${n}: all checkpoint rest areas remain free of enemy attacks`,hits===0,{hits});
  sc=await load(n);const cues=[];for(const c of [26,43,58,75,90,106,119,132,143]){if(c>(n===2?110:n===3?110:n===4||n===5?111:n===6?119:145))break;place(sc,c*16);step();cues.push(document.getElementById('hint').textContent);}
  check(`Khan ${n}: contextual route advice advances`,new Set(cues).size>=3,{cues});
  sc=await load(n);let reached=false,frame=0;const goal=(n===2?128:n===3?114:n===4||n===5?115:n===6?125:149)*16;
  S.keys.jump=true;
  for(;frame<12000;frame++){
   sc.hp=999;sc.inv=99999;sc.water=100;
   if(sc.bossOn||sc.player.x>goal){reached=true;break;}
   S.keys.right=true;
   const b=sc.player.body,ahead=sc.layer.getTileAtWorldXY(sc.player.x+26,b.bottom+4),wall=sc.layer.getTileAtWorldXY(sc.player.x+22,b.center.y);
   const danger=!ahead?.collides||ahead.index%4===3||wall?.collides||b.blocked.right;
   if(b.blocked.down&&danger)S.pressed.jump=true;
   if(!b.blocked.down&&sc.airJumps>0&&b.velocity.y>-100)S.pressed.jump=true;
   if(frame%20===0)S.pressed.attack=true;
   step();if(frame%180===0)await sleep(1);
  }
  S.keys.right=S.keys.jump=false;
  check(`Khan ${n}: movement/jump/strike input traverses route`,reached,{seconds:frame/60,x:sc.player.x,goal});
 }
 // Exercise the real six horde waves with movement and strike input, not direct damage.
 {const sc=await load(6);sc.hordeDone=false;place(sc,sc.hordeAt.x);sc.startHorde();let waves=0,frame=0;
  for(;frame<18000&&!sc.hordeDone;frame++){
   sc.hp=999;sc.inv=99999;waves=Math.max(waves,sc.horde?.wave||0);
   const enemies=(sc.horde?.live||[]).filter(f=>f.active&&f.body.enable);
   const f=enemies.sort((a,b)=>Math.abs(a.x-sc.player.x)-Math.abs(b.x-sc.player.x))[0];
   const target=f?f.x:sc.hordeAt.x;
   S.keys.right=sc.player.x<target-8;S.keys.left=sc.player.x>target+8;
   if(frame%18===0)S.pressed.attack=true;
   step();if(frame%180===0)await sleep(1);
  }
  S.keys.right=S.keys.left=false;
  check('Horde spawns and completes all six waves with real strike combat',sc.hordeDone&&waves===6,{waves,seconds:frame/60,remaining:(sc.horde?.live||[]).filter(f=>f.active&&f.body.enable).map(f=>({kind:f.kind,x:f.x,hp:f.hp}))});
  check('Horde completion opens the forward gate',sc.hordeDone&&sc.gates?.[1]?.r.active===false);
 }
 // A flyer flashes before diving and commits to its initial aim.
 {const sc=await load(3),f=sc.foes.getChildren().find(f=>f.kind==='bat'&&f.home.x<30*16);sc.foes.getChildren().filter(o=>o!==f).forEach(o=>o.destroy());sc.atk=0;S.pressed.attack=false;sc.player.body.setAllowGravity(false);sc.player.body.reset(30*16,f.y+80);sc.player.setVelocity(0);f.state='circle';f.cool=0;let warning=false,dive=false,aim;
  for(let i=0;i<240;i++){step();if(f.state==='warn'){warning=true;aim={...f.aim};break;}}
  if(warning){place(sc,30*16);for(let i=0;i<40;i++){step();if(f.state==='dive'){dive=true;break;}}}
  check('Bats give a visible warning before their committed dive',warning&&dive&&f.aim.x===aim.x,{warning,dive,active:f.active,state:f.state,x:f.x,y:f.y,player:{x:sc.player.x,y:sc.player.y}});
 }
 check('No runtime errors during all-labour encounter audit',result.errors.length===0);box.textContent+='ENCOUNTER AUDIT COMPLETE';
}catch(e){result.error=e.stack;box.textContent+='FAIL '+e.stack;}
window.__encounterResult=result;fetch('/__result',{method:'POST',body:JSON.stringify(result)});
})();
