(async()=>{
if(location.hostname!=='127.0.0.1'||location.port!=='8781')throw Error('Dedicated test origin required');
const sleep=ms=>new Promise(r=>setTimeout(r,ms)),result={probes:[],errors:[]};addEventListener('error',e=>result.errors.push(e.message));
const report=document.createElement('pre');report.style='position:fixed;inset:10px;background:#101520ee;color:white;z-index:101;overflow:auto';document.body.append(report);
const check=(name,pass,detail={})=>{result.probes.push({name,pass:!!pass,...detail});report.textContent+=`${pass?'PASS':'FAIL'} ${name} ${JSON.stringify(detail)}\n`;};
try{
while(!window.__sh?.scene()?.player)await sleep(20);const S=window.__sh;S.snd.A.muted=true;S.snd.A.failed=true;S.SET.voice=0;S.game.loop.sleep();
let T=performance.now()+1e6,dt=1000/60;const clocks=new Map();const step=(n=1)=>{const m=S.scene().tweens;if(!clocks.has(m)){clocks.set(m,m.getDelta);m.getDelta=()=>dt;}for(let i=0;i<n;i++){T+=dt;S.game.headlessStep(T,dt);}};
const clear=()=>{for(const k in S.keys)S.keys[k]=false;for(const k in S.pressed)S.pressed[k]=false;};
const load=async(n=1,rise=false)=>{clear();const old=S.scene().player;S.begin(n,rise,false,true);for(let i=0;i<500;i++){step(2);await sleep(3);if(S.scene().player!==old&&S.scene().lv===S.LEVELS[n])break;}const s=S.scene();s.drawDark=()=>{};s.hp=s.maxHp=5;s.inv=9999;return s;};
const place=(s,o,x,row=14)=>{o.body.reset(x,row*16-1-.47*o.displayHeight);o.body.updateFromGameObject();o.body.prev.copy(o.body.position);o.body.prevFrame.copy(o.body.position);o.setVelocity(0);};
for(const fps of [30,60]){
 dt=1000/fps;const s=await load(),f=s.foes.getChildren().find(f=>f.kind==='jackal');for(const o of s.foes.getChildren().slice())if(o!==f)o.destroy();s.journey.stop();
 f.l1state='stalk';f.l1timer=0;place(s,f,18*16);place(s,s.player,14.5*16);step(8);check(`${fps}Hz jackal gives a visible warning`,f.l1state==='warn'&&f.tell?.active&&!f.l1danger,{state:f.l1state,down:f.body.blocked.down,x:f.x,px:s.player.x});
 const dir=f.dir,hp=s.hp;s.inv=0;place(s,s.player,f.x+8);step(Math.round(fps*.25));check(`${fps}Hz warning contact does not damage`,s.hp===hp);
 check(`${fps}Hz crossing behind does not change committed direction`,f.dir===dir);
 let rush=false,recover=false,trace=[];for(let i=0;i<fps*2;i++){step();if(f.l1state==='rush')rush=true;if(f.l1state==='recover'){recover=true;break;}}check(`${fps}Hz rush reaches a bounded recovery`,rush&&recover&&!f.l1danger);
 place(s,s.player,f.x-3);s.inv=0;s.hp=5;step(4);check(`${fps}Hz recovery is a safe punish window`,s.hp===5&&!f.l1danger);
}
dt=1000/60;
{const s=await load(),f=s.foes.getChildren().find(f=>f.kind==='jackal');for(const o of s.foes.getChildren().slice())if(o!==f)o.destroy();s.journey.stop();f.l1state='stalk';f.l1timer=0;place(s,f,18*16);place(s,s.player,14.5*16);s.inv=0;
for(let i=0;i<100&&s.hp===5;i++)step();check('Committed jackal rush deals real damage',s.hp<5,{hp:s.hp});}
{const s=await load(),f=s.foes.getChildren().find(f=>f.kind==='div');for(const o of s.foes.getChildren().slice())if(o!==f)o.destroy();s.journey.stop();f.l1state='stalk';place(s,f,45*16,12);place(s,s.player,43*16,12);f.hopT=0;step(8);check('Div warns before leaving the ground',f.l1state==='warn'&&f.tell?.active&&Math.abs(f.body.velocity.y)<1,{state:f.l1state,down:f.body.blocked.down,x:f.x,px:s.player.x,y:f.body.bottom});
const dir=f.dir;place(s,s.player,47*16,12);let leapt=false,recovered=false;for(let i=0;i<160;i++){step();if(f.l1state==='leap'&&f.body.velocity.y<0){leapt=true;check('Div keeps its committed leap direction',f.dir===dir&&Math.sign(f.body.velocity.x)===dir);break;}}for(let i=0;i<160;i++){step();if(f.l1state==='recover'){recovered=true;break;}}check('Div exposes recovery after landing',leapt&&recovered&&!f.leap);}
{const s=await load();s.foes.clear(true,true);place(s,s.player,10*16);step(3);const j=s.journey;let hits=0;
for(let attempt=0;attempt<3;attempt++){place(s,s.player,12*16);j.hunter.x=s.player.x+38;j.hunter.y=224;s.face=1;s.cool=0;const before=j.drivenBack||0;for(let i=0;i<35&&(j.drivenBack||0)===before;i++){if(i===0)S.pressed.attack=true;step();}hits=j.drivenBack||0;step(30);}
check('Three actual mace repels earn Rakhsh support',hits===3&&s.rakhshEarned&&s.rakhshFed,{hits});place(s,s.player,28*16);step(3);check('Pursuit still ends at the first refuge',j.phase==='rescued');
const again=await load(1,true);check('Earned support survives a checkpoint retry',again.start.x>=27*16&&again.rakhshEarned&&again.rakhshFed,{start:again.start.x});
place(again,again.player,94*16);again.startBoss();let arrived=false,early=false;for(let i=0;i<900;i++){step();if(again.rakhshRode){arrived=true;early=again.bossT<720;break;}}check('Earned Rakhsh support arrives at an early boss opening',arrived&&early,{bossFrames:again.bossT});}

{const s=await load();s.foes.clear(true,true);place(s,s.player,94*16);s.startBoss();for(let i=0;i<250&&s.frozen;i++)step();const b=s.boss;b.hp=Math.floor(b.max/2);b.state='pawReady';b.tm=1;b.pawChain=0;b.dir=-1;place(s,b,99*16);place(s,s.player,96*16);let warnings=0,swipes=0,last=b.state,second=false,opening=false;
for(let i=0;i<180;i++){step();if(b.state!==last){if(b.state==='paw')swipes++;if(b.state==='pawReady'){warnings++;second=b.intent.includes('Second');}if(b.state==='recover'){opening=true;break;}last=b.state;}}
check('Wounded lion follows first swipe with a fresh readable warning',warnings===1&&second);check('Two swipes end in a guaranteed longer opening',swipes===2&&opening&&b.tm>=70,{swipes,tm:b.tm});}
{const s=await load();s.journey.stop();const pair=s.foes.getChildren().filter(f=>f.home.x>69*16);for(const f of s.foes.getChildren().slice())if(!pair.includes(f))f.destroy();place(s,s.player,76*16);for(const f of pair){f.l1state='stalk';f.hopT=0;place(s,f,(f.kind==='div'?73:79)*16);}const actors=new Set();let simultaneous=0;for(let i=0;i<600;i++){step();const active=pair.filter(f=>['warn','rush','leap'].includes(f.l1state));simultaneous=Math.max(simultaneous,active.length);for(const f of active)actors.add(f.kind);}check('Mixed hunters take turns committing to attacks',simultaneous<=1,{simultaneous});check('Both hunters remain active threats',actors.size===2,{actors:[...actors]});}
{const s=await load(2),f=s.foes.getChildren().find(f=>f.kind==='scorpion');step(3);check('Other labours do not receive first-labour AI states',!f.l1state);}
check('Quality pass has no script errors',result.errors.length===0);report.textContent+='FIRST QUALITY COMPLETE';
}catch(e){result.error=e.stack;report.textContent+='FAIL '+e.stack;}
fetch('/__result',{method:'POST',body:JSON.stringify(result)});
})();
