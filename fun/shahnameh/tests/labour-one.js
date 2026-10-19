(async()=>{
if(location.hostname!=='127.0.0.1'||location.port!=='8776')throw Error('Dedicated test origin required');
const sleep=ms=>new Promise(r=>setTimeout(r,ms)), result={probes:[],errors:[]};
addEventListener('error',e=>result.errors.push(e.message));const box=document.createElement('pre');box.id='labour-report';box.style='position:fixed;inset:12px;z-index:101;background:#101520ee;color:white;overflow:auto;padding:15px';document.body.append(box);
const check=(name,pass,detail={})=>{result.probes.push({name,pass:!!pass,...detail});box.textContent+=`${pass?'PASS':'FAIL'} ${name} ${JSON.stringify(detail)}\n`;};
try{
 while(!window.__sh?.scene()?.player)await sleep(20);
 const S=window.__sh;S.snd.A.muted=true;S.snd.A.failed=true;S.SET.voice=0;S.game.loop.sleep();
 let T=performance.now()+1e6,dt=1000/60;const clocks=new Map();
 const step=(n=1)=>{const tw=S.scene().tweens;if(!clocks.has(tw)){clocks.set(tw,tw.getDelta);tw.getDelta=()=>dt;}for(let i=0;i<n;i++){T+=dt;S.game.headlessStep(T,dt);}};
 const load=async()=>{const old=S.scene().player,first=!S.scene().started;S.begin(1,false,false,true);for(let i=0;i<500;i++){step(2);await sleep(3);if(S.scene().player?.active&&(first||S.scene().player!==old))break;}const sc=S.scene();sc.drawDark=()=>{};sc.hp=999;sc.inv=99999;return sc;};
 {const sc=await load(),foes=sc.foes.getChildren();check('first labour has five deliberately grouped enemies',foes.length===5);check('three fires protect landing, midpoint, and boss approach',sc.altars.length===3&&sc.altars.map(a=>Math.floor(a.x/16)).join(',')==='27,52,82');check('exactly three optional feathers remain',sc.coins.getChildren().filter(c=>c.kind==='sfeather').length===3);check('midpoint to thorns is a quiet platforming approach',foes.every(f=>f.home.x<48*16||f.home.x>69*16));check('final fire has a separate healing pickup',sc.coins.getChildren().some(c=>c.kind==='heart'&&c.x>84*16));}
 for(const fps of [30,60]){dt=1000/fps;const sc=await load();let escaped=[];
  for(let i=0;i<fps*30;i++){sc.inv=99999;sc.player.body.reset((i<fps*10?3:i<fps*20?73:85)*16,224-1-.47*sc.player.displayHeight);sc.player.setVelocity(0);step();for(const f of sc.foes.getChildren())if(f.body.left<f.roam[0]-3||f.body.right>f.roam[1]+3)escaped.push({kind:f.kind,x:f.x,roam:f.roam});if(i%120===0)await sleep(1);}
  check(`${fps}Hz enemies remain inside safe encounter areas`,escaped.length===0,{escaped:escaped.slice(0,3)});
  check(`${fps}Hz final hunters leave the last fire clear`,sc.foes.getChildren().filter(f=>f.home.x>69*16).every(f=>f.body.right<82*16));
 }
 dt=1000/60;
 {const sc=await load();const cues=[];for(const c of [3,19,28,40,50,70,82]){sc.player.body.reset(c*16,224-1-.47*sc.player.displayHeight);sc.player.setVelocity(0);step();cues.push(document.getElementById('hint').textContent);}check('context cues cover gap, Div, thorns, duo, and final fire',cues[1].includes('gap ahead')&&cues[3].includes('blue Div')&&cues[4].includes('Thorns')&&cues[5].includes('Two hunters')&&cues[6].includes('last fire'));}
 // Traverse from spawn using normal movement/jump/strike input, without teleporting through terrain.
 {const sc=await load();let frame=0, reached=false;const startX=sc.player.x;S.keys.jump=true;
  for(;frame<18000&&!sc.done;frame++){
   sc.hp=999;sc.inv=999;
   let target=1468;
   if(sc.boss?.hp>0){reached=true;target=sc.boss.x-(sc.boss.calm()?50:110);}
   else if(sc.bossOn){const feather=sc.children.list.find(o=>o.texture?.key==='feather'&&o.kind!=='sfeather'&&o.spark&&!o.taken);if(feather)target=feather.x;else target=sc.player.x;}
   S.keys.right=sc.player.x<target-5;S.keys.left=sc.player.x>target+5;
   const b=sc.player.body,ahead=sc.layer.getTileAtWorldXY(sc.player.x+26,b.bottom+4),wall=sc.layer.getTileAtWorldXY(sc.player.x+22,b.center.y);
   const danger=!ahead?.collides||ahead.index%4===3||wall?.collides||b.blocked.right;
   if(!sc.bossOn&&b.blocked.down&&danger)S.pressed.jump=true;
   if(!sc.bossOn&&!b.blocked.down&&sc.airJumps>0&&b.velocity.y>-100)S.pressed.jump=true;
   if(frame%20===0)S.pressed.attack=true;
   step();if(frame%180===0)await sleep(1);
  }
  S.keys.right=S.keys.left=S.keys.jump=false;
  check('normal movement input traverses the route from spawn to lion',reached,{seconds:frame/60,startX,x:sc.player.x});
  check('route and real strike combat reach the closing scene',sc.done&&sc.boss?.hp<=0,{done:sc.done,hp:sc.boss?.hp,x:sc.player.x});
 }
 check('first-labour audit has no script errors',result.errors.length===0);box.textContent+='FIRST LABOUR COMPLETE';
}catch(e){result.error=e.stack;box.textContent+='FAIL '+e.stack;}
window.__labourResult=result;fetch('/__result',{method:'POST',body:JSON.stringify(result)});
})();
