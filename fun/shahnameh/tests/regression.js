(async()=>{
if (!["localhost","127.0.0.1"].includes(location.hostname) || location.port !== "8770") throw Error("Tests require the dedicated localhost:8770 origin");
const sleep=ms=>new Promise(r=>setTimeout(r,ms)), lines=[],errors=[];
addEventListener('error',e=>errors.push(e.message));
const box=document.createElement('pre');box.id='regression-report';box.style='position:fixed;inset:20px;z-index:101;background:#101520f5;color:#eee;padding:20px;overflow:auto;font:13px/1.5 monospace;pointer-events:none';document.body.append(box);
const log=(ok,msg)=>{lines.push((ok?'PASS ':'FAIL ')+msg);box.textContent=lines.join('\n');};
const until=async(fn,msg,ms=20000)=>{let t=Date.now();while(!fn()){if(Date.now()-t>ms)throw Error('Timed out: '+msg);await sleep(30);}};
try{
 await until(()=>window.__sh?.scene()?.player,'boot');const S=window.__sh;S.snd.A.muted=true;S.SET.voice=0;
 const begin=async n=>{const previous=S.scene().player,first=!S.scene().started&&!S.scene().done&&S.scene().lv===S.LEVELS[n];S.begin(n);document.getElementById('cineSkip').click();await until(()=>(first||S.scene().player!==previous)&&S.scene().lv===S.LEVELS[n]&&S.game.scene.isActive('play'),'level '+n);await sleep(120);return S.scene()};
 let sc=await begin(1);
 S.setPaused(true);dispatchEvent(new KeyboardEvent('keydown',{key:'x'}));
 log(!S.pressed.attack&&!S.keys.attack,'Keyboard Strike is ignored in the pause menu');S.setPaused(false);
 log(!S.pressed.attack&&!S.keys.attack,'Resuming clears held and queued Strike');
 S.setPaused(true);document.querySelector('#s-pause [data-settings]').click();
 const getPads=navigator.getGamepads.bind(navigator), buttons=Array.from({length:17},()=>({pressed:false,value:0}));buttons[9]={pressed:true,value:1};
 Object.defineProperty(navigator,'getGamepads',{configurable:true,value:()=>[{buttons,axes:[0,0]}]});await sleep(90);
 log(S.game.scene.isPaused('play')&&!document.getElementById('s-set').classList.contains('hidden'),'Controller Start cannot resume behind Settings');
 buttons[9]={pressed:false,value:0};await sleep(50);Object.defineProperty(navigator,'getGamepads',{configurable:true,value:getPads});
 // Rebind through the real Settings handlers, including HTML-sensitive key names.
 document.querySelector('#keyList [data-a="attack"][data-i="0"]').click();dispatchEvent(new KeyboardEvent('keydown',{key:'q'}));
 log(S.SET.keys.attack[0]==='q','Strike rebind is saved');
 log([...document.querySelectorAll('[data-action-key="attack"]')].every(e=>e.textContent==='Q / J'),'Visible attack instructions use the saved bindings');
 document.querySelector('#keyList [data-a="farr"][data-i="0"]').click();dispatchEvent(new KeyboardEvent('keydown',{key:'<'}));
 log([...document.querySelectorAll('[data-action-key="farr"]')].every(e=>e.textContent==='<'),'HTML-sensitive bindings render safely as text');
 log(document.querySelector('meta[name=viewport]').content.indexOf('user-scalable=no')<0&&!document.querySelector('meta[name=viewport]').content.includes('maximum-scale'),'Mobile viewport permits reader zoom');
 document.getElementById('setDone').click();S.setPaused(false);
 // Focus stays in the cinematic, and native buttons retain Enter/Space handling.
 S.begin(3);let ov=document.getElementById('s-cine'), next=document.getElementById('cineNext'), skip=document.getElementById('cineSkip');
 next.focus();next.dispatchEvent(new KeyboardEvent('keydown',{key:'Tab',shiftKey:true,bubbles:true,cancelable:true}));
 log(document.activeElement===skip,'Shift-Tab wraps to Skip inside the cinematic');
 const image=document.querySelector('.cimg.on').src,e=new KeyboardEvent('keydown',{key:'Enter',bubbles:true,cancelable:true});skip.dispatchEvent(e);
 log(!e.defaultPrevented&&document.querySelector('.cimg.on').src===image,'Enter on Skip is left to native button activation');
 skip.click();await sleep(200);
 // All combinations of health/feathers produce correct stars and advice.
 for(const healthy of [false,true])for(const allFeathers of [false,true]){
  sc=await begin(1);let F=JSON.parse(localStorage.getItem('sh-feathers')||'{}');[0,1,2].forEach(k=>{if(allFeathers)F['1:'+k]=1;else delete F['1:'+k]});localStorage.setItem('sh-feathers',JSON.stringify(F));
  sc.hp=healthy?sc.maxHp:1;sc.t0-=2000;sc.win({destroy(){}});await until(()=>!ov.classList.contains('hidden'),'reward outro');skip.click();
  const text=document.getElementById('winStars').textContent.toLowerCase(),count=document.querySelectorAll('#winStars i.on').length;
  log(count===1+Number(healthy)+Number(allFeathers),'Correct star count: health='+healthy+', feathers='+allFeathers);
  log((healthy||text.includes('keep half your hearts'))&&(allFeathers||text.includes('find all three feathers'))&&(!allFeathers||!text.includes('find all three feathers')),'Correct missing-objective advice: health='+healthy+', feathers='+allFeathers);
 }
 // Actual final rescue saves before the first ending picture; presentation cannot re-award the result.
 sc=await begin(7);sc.t0-=2000;sc.freeKing();await until(()=>+localStorage.getItem('sh-best-7')>0,'save at restored sight',15000);
 log(ov.classList.contains('hidden'),'Final victory is saved before the ending opens');
 const result=sc.recordVictory(),stars=localStorage.getItem('sh-stars'),time=localStorage.getItem('sh-best-7');sc.hp=1;
 log(sc.recordVictory()===result&&localStorage.getItem('sh-stars')===stars&&localStorage.getItem('sh-best-7')===time,'Final completion is idempotent and preserves its score snapshot');
 await until(()=>!ov.classList.contains('hidden'),'ending',15000);skip.click();await sleep(650);
 log(!document.getElementById('s-win').classList.contains('hidden'),'Saved final victory still leads to the normal results');
 // Background silence, cinematic pause and saved mute preference.
 const focus=document.hasFocus.bind(document);Object.defineProperty(document,'hidden',{configurable:true,get:()=>false});Object.defineProperty(document,'hasFocus',{configurable:true,value:()=>true});dispatchEvent(new Event('focus'));
 S.begin(1);next.click();const caption=document.querySelector('.ccap p').textContent,preference=localStorage.getItem('sh-muted');
 Object.defineProperty(document,'hasFocus',{configurable:true,value:()=>false});dispatchEvent(new Event('blur'));await sleep(180);
 log(S.snd.A.background&&S.snd.A.master.gain.value===0,'Blur mutes the master audio immediately');
 log(Object.values(S.snd.A.tracks).every(t=>t.el.paused),'Blur pauses every music media element');
 log(document.querySelector('.ccap p').textContent===caption,'Cinematic text does not advance in the background');
 log(localStorage.getItem('sh-muted')===preference,'Background silence does not rewrite the saved mute preference');
 Object.defineProperty(document,'hasFocus',{configurable:true,value:()=>true});dispatchEvent(new Event('focus'));
 log(S.snd.A.muted&&S.snd.A.master.gain.value===0,'Returning focus respects the existing mute preference');
 skip.click();await sleep(150);S.setPaused(true);
 document.querySelector('#s-pause [data-settings]').click();document.getElementById('keyReset').click();document.getElementById('setDone').click();
 log(S.SET.keys.attack[0]==='x'&&S.SET.keys.farr[0]==='f','Reset controls restores defaults');
 Object.defineProperty(document,'hasFocus',{configurable:true,value:focus});
 // Exercise the actual desert puzzle's wrong-answer, replay, solve, boss and spring path.
 sc=await begin(2);sc.hp=sc.maxHp=99;sc.prayed=true;sc.water=100;sc.startStones();
 await until(()=>sc.puzzle.showing,'puzzle demonstration');
 log(sc.frozen,'Bell demonstration freezes gameplay');
 await until(()=>!sc.puzzle.showing,'bell demonstration ends');
 sc.strikeStone((sc.puzzle.seq[0]+1)%4);
 log(sc.puzzle.at===0&&!sc.puzzle.done,'A wrong bell resets progress without opening the spring');
 await until(()=>sc.puzzle.showing,'wrong answer replay');await until(()=>!sc.puzzle.showing,'replay ends');
 log(!sc.frozen,'The bell sequence replay restores control');
 sc.puzzle.seq.forEach(i=>sc.strikeStone(i));
 log(sc.puzzle.done&&sc.water===100,'The correct sequence opens the spring and restores water');
 await until(()=>sc.boss?.texture?.key.startsWith('queen-'),'queen after puzzle');
 log(!!sc.boss,'Solving the bell puzzle summons the Scorpion Queen');
 await until(()=>!sc.intro&&sc.boss.body.enable,'queen vulnerable simulation');sc.boss.hp=1;sc.damage(sc.boss,1,true);
 await until(()=>sc.springOpen,'queen defeat opens water');
 log(sc.springOpen&&!sc.boss,'Queen defeat makes the spring accessible');
 sc.reachSpring();await until(()=>!ov.classList.contains('hidden'),'spring outro');
 log(document.querySelector('.cimg.on').src.includes('khan2-outro'),'Drinking after the Queen leads to the desert closing');skip.click();
 log(!document.getElementById('s-win').classList.contains('hidden'),'The full desert puzzle path reaches results');
 // Run the lion's actual death/reward/pickup with normal browser time, not the accelerated self-test.
 sc=await begin(1);sc.hp=sc.maxHp=99;sc.startBoss();await until(()=>!sc.intro&&sc.boss?.body.enable,'normal-time lion intro');
 sc.boss.hp=1;sc.damage(sc.boss,1,true);
 const reward=()=>sc.children.list.find(o=>o.texture?.key==='feather'&&o.kind!=='sfeather'&&o.spark&&o.glow&&!o.taken);
 await until(()=>reward(),'normal-time victory feather',20000);
 log(!!reward(),'Lion defeat produces a landed victory feather at normal speed');
 const f=reward(),dx=f.body.center.x-sc.player.body.center.x,dy=f.body.center.y-sc.player.body.center.y;
 sc.player.body.reset(sc.player.x+dx,sc.player.y+dy);sc.player.setVelocity(0);
 await until(()=>!ov.classList.contains('hidden'),'normal-time victory overlap',10000);
 log(document.querySelector('.cimg.on').src.includes('khan1-outro'),'Actual feather overlap completes the lion labour at normal speed');skip.click();
 // Active-time boss-rush scoring excludes menu pauses.
 S.openMap(false);document.getElementById('rushBtn').click();await until(()=>S.rushTime()!=null&&S.game.scene.isActive('play'),'rush');await sleep(150);
 S.setPaused(true);const scoreTime=S.rushTime();await sleep(1200);
 log(Math.abs(S.rushTime()-scoreTime)<5,'Boss-rush score clock stops during a menu pause');S.setPaused(false);await sleep(150);
 log(S.rushTime()>scoreTime+80&&S.rushTime()<scoreTime+600,'Boss-rush score clock resumes without adding paused time');S.setPaused(true);
 log(errors.length===0,'No runtime errors during the regression scenarios');
 window.__regressionResult={suite:'regression',lines,errors};
 fetch('/__result',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(window.__regressionResult)});
 box.textContent=lines.join('\n')+'\nREGRESSION SUITE COMPLETE';
}catch(e){lines.push('FAIL '+e.message);window.__regressionResult={suite:'regression',lines,errors,error:e.message};fetch('/__result',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(window.__regressionResult)});box.textContent=lines.join('\n')+'\nREGRESSION SUITE STOPPED';}
})();
