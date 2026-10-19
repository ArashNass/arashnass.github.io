(async () => {
if (location.hostname !== '127.0.0.1' || location.port !== '8774') throw Error('Dedicated test origin required');
const sleep = ms => new Promise(r => setTimeout(r, ms)), result = {probes: [], errors: []};
addEventListener('error', e => result.errors.push(e.message));
const box = document.createElement('pre'); box.id = 'enemy-report'; box.style = 'position:fixed;inset:12px;z-index:101;background:#101520ee;color:white;overflow:auto;padding:15px'; document.body.append(box);
const check = (name, pass, detail = {}) => { result.probes.push({name, pass:!!pass, ...detail}); box.textContent += `${pass ? 'PASS' : 'FAIL'} ${name} ${JSON.stringify(detail)}\n`; };
try {
 while (!window.__sh?.scene()?.player) await sleep(20);
 const S = window.__sh; S.snd.A.muted = true; S.snd.A.failed = true; S.SET.voice = 0; S.game.loop.sleep();
 let T = performance.now()+1e6, dt=1000/60; const clocks = new Map();
 const step = (n=1) => { const tw=S.scene().tweens; if(!clocks.has(tw)){clocks.set(tw,tw.getDelta);tw.getDelta=()=>dt;} for(let i=0;i<n;i++){T+=dt;S.game.headlessStep(T,dt);} };
 const load = async () => {
  const old=S.scene().player, first=!S.scene().started; S.begin(1,false,false,true);
  for(let i=0;i<500;i++){step(2);await sleep(3);if(S.scene().player?.active&&(first||S.scene().player!==old))break;}
  const sc=S.scene();sc.foes.clear(true,true);sc.drawDark=()=>{};sc.hp=999;sc.inv=99999;
  const tile=sc.layer.getTileAt(10,14).index;
  for(let x=5;x<=35;x++){for(let y=5;y<14;y++)sc.layer.removeTileAt(x,y);for(let y=14;y<sc.layer.layer.height;y++)sc.layer.putTileAt(tile,x,y).setCollision(true,true,true,true);}
  sc.player.body.reset(3*16,224-1-.47*sc.player.displayHeight);sc.player.setVelocity(0);step(2);return sc;
 };
 const gap=(a,b)=>Math.abs(a.body.center.x-b.body.center.x)-(a.body.width+b.body.width)/2;
 const freeze = kinds => {const old={};for(const kind of new Set(kinds)){old[kind]=S.FOES[kind].tick;S.FOES[kind].tick=(s,f)=>f.setVelocityX(0);}return ()=>{for(const kind in old)S.FOES[kind].tick=old[kind];};};
 for(const fps of [30,60])for(const kinds of [['jackal','jackal'],['jackal','divwarrior'],['scorpion','spearman'],['firediv','ghul']]){
  dt=1000/fps;const sc=await load(),restore=freeze(kinds);
  try{const pair=kinds.map(k=>sc.spawnFoe(k,16*16,224));step(fps*2);check(`${fps}Hz coincident ${kinds.join('+')} separates`,gap(...pair)>=7,{gap:gap(...pair)});check(`${fps}Hz bodies stay synchronized ${kinds.join('+')}`,pair.every(f=>Math.abs(f.x-f.body.center.x)<1));}finally{restore();}
 }
 dt=1000/60;
 {const sc=await load(),restore=freeze(['jackal']);try{const tile=sc.layer.getTileAt(8,14).index;for(let y=9;y<14;y++)sc.layer.putTileAt(tile,8,y).setCollision(true,true,true,true);const pair=[sc.spawnFoe('jackal',162,224),sc.spawnFoe('jackal',162,224)];step(120);check('pair against wall separates using free side',gap(...pair)>=7&&pair.every(f=>f.body.left>=144),{gap:gap(...pair),left:pair.map(f=>f.body.left)});}finally{restore();}}
 {const sc=await load(),restore=freeze(['jackal']);try{for(let x=12;x<=15;x++)for(let y=14;y<sc.layer.layer.height;y++)sc.layer.removeTileAt(x,y);const pair=[sc.spawnFoe('jackal',174,224),sc.spawnFoe('jackal',174,224)];step(120);check('separation does not push a pair into a pit',gap(...pair)>=7&&pair.every(f=>f.body.right<=192&&f.body.bottom<226),{gap:gap(...pair),right:pair.map(f=>f.body.right)});}finally{restore();}}
 {const sc=await load(),restore=freeze(['jackal','divwarrior']);try{const a=sc.spawnFoe('divwarrior',256,224),b=sc.spawnFoe('jackal',256,224);a.smash=true;step(60);check('committed attacker holds its position while neighbour moves',Math.abs(a.x-256)<1&&gap(a,b)>=7,{x:a.x,gap:gap(a,b)});}finally{restore();}}
 for(const fps of [30,60]){
  dt=1000/fps;const sc=await load(),pack=['jackal','divwarrior','spearman'].map((k,i)=>sc.spawnFoe(k,250+i*4,224));let maxOverlap=0;
  for(let i=0;i<fps*8;i++){step();if(i>fps)for(let a=0;a<pack.length;a++)for(let b=a+1;b<pack.length;b++)if(Math.abs(pack[a].body.bottom-pack[b].body.bottom)<15)maxOverlap=Math.max(maxOverlap,-gap(pack[a],pack[b]));if(i%120===0)await sleep(1);}
  check(`${fps}Hz active mixed pack avoids sustained body overlap`,maxOverlap<7,{maxOverlap});
 }

 {const sc=await load();const pack=['divwarrior','spearman','scorpion'].map((k,i)=>sc.spawnFoe(k,250+i*3,224));let hazards=0;const original=sc.hazard;sc.hazard=function(...args){hazards++;return original.apply(this,args);};const hp=sc.hp;
  try{for(let i=0;i<600;i++){sc.inv=0;if(i%120===0){sc.player.body.reset(300,224-1-.47*sc.player.displayHeight);sc.player.setVelocity(0);}step();if(i%120===0)await sleep(1);}check('mixed group still attacks and damages the player',hazards>0&&sc.hp<hp,{hazards,damage:hp-sc.hp});}finally{sc.hazard=original;}
 }
 check('enemy regression has no runtime errors',result.errors.length===0);
 box.textContent+='ENEMY REGRESSION COMPLETE';
}catch(e){result.error=e.stack;box.textContent+='FAIL '+e.stack;}
window.__enemyResult=result;fetch('/__result',{method:'POST',body:JSON.stringify(result)});
})();
