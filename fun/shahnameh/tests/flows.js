(async()=>{
if (!["localhost","127.0.0.1"].includes(location.hostname) || location.port !== "8770") throw Error("Tests require the dedicated localhost:8770 origin");
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const lines=[],issues=[],errors=[];
addEventListener('error',e=>errors.push(e.message));
const report=document.createElement('pre');report.id='flow-report';report.style='position:fixed;inset:20px;z-index:100;background:#101520ed;color:#eee;padding:20px;overflow:auto;font:13px/1.5 monospace;pointer-events:none';document.body.append(report);
const log=(ok,msg)=>{lines.push((ok?'PASS ':'FAIL ')+msg);report.textContent=lines.join('\n');};
const until=async(fn,msg,ms=25000)=>{const t=Date.now();while(!fn()){if(Date.now()-t>ms)throw Error('Timed out: '+msg);await sleep(40);}};
try{
 await until(()=>window.__sh?.scene()?.player,'game boot'); const S=window.__sh;
 S.snd.A.muted=true;S.SET.voice=0;
 // Use a dedicated origin for this harness, never the user's production save.
 localStorage.setItem('sh-prologue','1');
 for(let n=1;n<=7;n++){
  S.begin(n);await until(()=>!document.getElementById('s-cine').classList.contains('hidden'),'intro '+n);
  log(document.querySelector('.cimg.on')?.getAttribute('src').includes('khan'+n+'-intro'),'Khan '+n+' uses the correct opening image');
  const clock=S.scene().time.now;await sleep(150);
  log(S.scene().time.now===clock,'Khan '+n+' physics and level clock wait during the opening');
  document.getElementById('cineSkip').click();
  await until(()=>S.scene().lv===S.LEVELS[n]&&S.scene().player?.active&&S.game.scene.isActive('play'),'play '+n);await sleep(150);
  log(document.getElementById('s-cine').classList.contains('hidden'),'Khan '+n+' starts after skip');
  const scene=S.scene();scene.hp=scene.maxHp;scene.t0-=2000;
  if(n<7){
   scene.win({destroy(){}});await until(()=>!document.getElementById('s-cine').classList.contains('hidden'),'outro '+n);
   log(document.querySelector('.cimg.on')?.getAttribute('src').includes('khan'+n+'-outro'),'Khan '+n+' uses the correct closing image');
   log(+localStorage.getItem('sh-unlocked')>=n+1,'Khan '+n+' completion is saved before the closing');
   document.getElementById('cineSkip').click();
   log(!document.getElementById('s-win').classList.contains('hidden'),'Khan '+n+' closing leads to results');
  }else{
   scene.freeKing();await until(()=>!document.getElementById('s-cine').classList.contains('hidden'),'ending after freeing king',20000);
   log(document.querySelector('.cimg.on')?.getAttribute('src').includes('end1'),'Khan VII keeps the king-restoration ending');
   const before=localStorage.getItem('sh-best-7');
   issues.push({id:'final-save',beforeEnding:before,detail:'Seventh completion snapshot observed before the ending is dismissed.'});
   document.getElementById('cineSkip').click();await until(()=>!document.getElementById('s-win').classList.contains('hidden'),'final results');
   log(+localStorage.getItem('sh-best-7')>0,'Khan VII completion is saved after ending');
  }
 }
 // Replay eligibility, return flow, and already completed level starts.
 S.openMap(false);document.getElementById('prologueBtn').click();
 log(document.querySelectorAll('#clipList .clip[data-play]').length===22,'Replay library includes 6 prologue, 13 labour, and 3 ending scenes');
 document.querySelector('#clipList [data-play="intro3"]').click();
 log(document.querySelector('.cimg.on')?.getAttribute('src').includes('khan3-intro'),'Replay selects the correct labour scene');
 document.getElementById('cineSkip').click();
 log(!document.getElementById('s-clips').classList.contains('hidden'),'Replay returns to the library');
 document.getElementById('clipClose').click();
 // A checkpoint retry should not replay the opening.
 S.begin(2);document.getElementById('cineSkip').click();await until(()=>S.scene().lv===S.LEVELS[2]&&S.game.scene.isActive('play'),'checkpoint level');await sleep(200);
 let scene=S.scene();const a=scene.altars[0];scene.player.body.reset(a.x+12,a.y-1-.47*scene.player.displayHeight);scene.player.setVelocity(0);await sleep(200);
 scene.hp=1;scene.inv=0;scene.frozen=false;scene.hurt(scene.player.x-10);await sleep(950);
 log(document.getElementById('retryBtn').textContent.includes('Rise'),'Actual checkpoint is used after death');
 document.getElementById('retryBtn').click();await sleep(500);
 log(document.getElementById('s-cine').classList.contains('hidden')&&S.game.scene.isActive('play'),'Checkpoint retry skips the opening and resumes play');
 // Observe reward copy and input state for comparison with the targeted regression suite.
 S.begin(1);document.getElementById('cineSkip').click();await until(()=>S.scene().lv===S.LEVELS[1]&&S.game.scene.isActive('play'),'reward case');await sleep(150);
 let f=JSON.parse(localStorage.getItem('sh-feathers')||'{}');[0,1,2].forEach(k=>f['1:'+k]=1);localStorage.setItem('sh-feathers',JSON.stringify(f));
 scene=S.scene();scene.hp=1;scene.win({destroy(){}});await until(()=>!document.getElementById('s-cine').classList.contains('hidden'),'reward outro');document.getElementById('cineSkip').click();
 issues.push({id:'star-copy',hp:1,maxHp:scene.maxHp,copy:document.getElementById('winStars').innerText});
 S.begin(1);document.getElementById('cineSkip').click();await sleep(300);S.setPaused(true);
 dispatchEvent(new KeyboardEvent('keydown',{key:'x'}));const pending=S.pressed.attack;S.setPaused(false);
 issues.push({id:'pause-input',attackQueuedInMenu:pending,attackPendingAfterResume:S.pressed.attack});
 await sleep(100);
 // The boss-rush transition path must continue to bypass every story panel.
 S.openMap(false);document.getElementById('rushBtn').click();await sleep(400);
 for(let n=1;n<=7;n++){
  await until(()=>S.scene().lv===S.LEVELS[n]&&S.game.scene.isActive('play'),'rush level '+n);await sleep(120);
  log(document.getElementById('s-cine').classList.contains('hidden'),'Boss rush '+n+' bypasses story');
  S.scene().win({destroy(){}});
  await sleep(n<7?1400:700);
 }
 log(document.getElementById('winTitle').textContent==='The boss rush is done','Boss rush reaches its final results');
 // Observe controller Start while a settings dialog is open.
 S.begin(1);document.getElementById('cineSkip').click();await sleep(300);S.setPaused(true);
 document.querySelector('#s-pause [data-settings]').click();
 const originalPads=navigator.getGamepads.bind(navigator), buttons=Array.from({length:17},()=>({pressed:false,value:0}));
 buttons[9]={pressed:true,value:1};
 Object.defineProperty(navigator,'getGamepads',{configurable:true,value:()=>[{buttons,axes:[0,0]}]});
 await sleep(100);
 issues.push({id:'gamepad-settings',settingsVisible:!document.getElementById('s-set').classList.contains('hidden'),worldActive:S.game.scene.isActive('play')});
 Object.defineProperty(navigator,'getGamepads',{configurable:true,value:originalPads});
 log(errors.length===0,'No runtime errors in story and progression scenarios');
 window.__auditResult={lines,issues,errors};fetch('/__result',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(window.__auditResult)});
 report.textContent=lines.join('\n')+'\n\nREGRESSION OBSERVATIONS\n'+JSON.stringify(issues,null,2)+'\n\nFLOW AUDIT COMPLETE';
}catch(e){lines.push('FAIL '+e.message);window.__auditResult={lines,issues,errors,error:e.message};report.textContent=lines.join('\n')+'\nFLOW AUDIT STOPPED';}
})();
