(async () => {
if (!['localhost','127.0.0.1'].includes(location.hostname) || location.port !== '8770') throw Error('Use dedicated localhost:8770');
const lines=[], errors=[], levels=[], sleep=ms=>new Promise(r=>setTimeout(r,ms));
addEventListener('error',e=>errors.push(e.message));
const box=document.createElement('pre');box.id='narration-report';box.style='position:fixed;inset:20px;z-index:101;background:#101520f5;color:white;padding:20px;overflow:auto;pointer-events:none';document.body.append(box);
const log=(ok,m)=>{lines.push((ok?'PASS ':'FAIL ')+m);box.textContent=lines.join('\n');};
try {
 while(!window.__sh?.scene()?.player)await sleep(30);
 const S=window.__sh,A=S.snd.A; A.failed=true; A.background=true; A.muted=false;S.SET.voice=90;
 const ctx=S.snd.audio();if(ctx.state==='running')await ctx.suspend();A.master.gain.value=0;
 const jobs=await (await fetch('assets/voice/narration-manifest.json')).json();
 log(jobs.recordings.length===30,'All 13 new story passages and 17 tale pages have recordings');
 for(const j of jobs.recordings){
  const r=await fetch('assets/voice/'+j.id+'.mp3');if(!r.ok)throw Error('Missing '+j.id);
  const b=await ctx.decodeAudioData(await r.arrayBuffer());const data=b.getChannelData(0);let power=0,peak=0;for(const v of data){power+=v*v;peak=Math.max(peak,Math.abs(v));}levels.push({id:j.id,rmsDb:20*Math.log10(Math.sqrt(power/data.length)),peak});const words=j.text.split(/\s+/).length,wpm=words/b.duration*60;
  log(S.VOICED.has(j.id)&&b.duration>3&&wpm>45&&wpm<300,j.id+' decodes and has plausible complete-reading duration ('+b.duration.toFixed(1)+'s)');
 }
 let pages=0;
 for(let n=1;n<=7;n++){
  const articles=[...document.getElementById('tale-'+n).content.querySelectorAll('article')];
  for(let i=0;i<articles.length;i++){
   S.openStory(i,n);const b=document.getElementById('storyListen');
   log(document.querySelector('#leaf article').dataset.voice===`tale-${n}-${i+1}`&&!b.disabled&&b.getAttribute('aria-pressed')==='false',`Tale ${n} page ${i+1} has the correct recording and opens without autoplay`);
   b.click();log(b.getAttribute('aria-pressed')==='true',`Tale ${n} page ${i+1} can start reading`);b.click();
   document.getElementById('storyClose').click();pages++;
  }
 }
 S.openStory(0,1);const b=document.getElementById('storyListen');b.click();document.getElementById('nextPg').click();
 log(b.getAttribute('aria-pressed')==='false'&&document.querySelector('#leaf article').dataset.voice==='tale-1-2','Turning a page stops the previous reading');
 b.click();document.getElementById('muteBtn').click();log(b.disabled&&b.getAttribute('aria-pressed')==='false','Mute stops the reading and disables Listen');
 A.muted=false;S.SET.voice=0;document.getElementById('storyClose').click();S.openStory(0,2);
 log(b.disabled&&b.textContent==='Narrator is off','Narrator volume zero prevents tale playback');
 document.getElementById('storyClose').click();log(document.getElementById('s-story').classList.contains('hidden'),'Closing the tale returns to its previous screen');
 log(ctx.state==='suspended'&&A.master.gain.value===0,'Narration validation stayed silent');
 log(!errors.length,'No runtime errors during narration checks');
}catch(e){lines.push('FAIL '+e.message);}
box.textContent=lines.join('\n')+'\nNARRATION CHECKS COMPLETE';fetch('/__result',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({suite:'narration',lines,errors,levels})});
})();
