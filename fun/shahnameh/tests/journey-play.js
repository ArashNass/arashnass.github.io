// Normal-health previews; no audio. ?level=1..7 and ?at=<column> choose a location.
(async()=>{
 if(!['127.0.0.1','localhost'].includes(location.hostname)||location.port!=='8779')return;
 while(!window.__sh?.scene()?.player)await new Promise(r=>setTimeout(r,30));
 const S=window.__sh;S.snd.A.muted=true;S.snd.A.failed=true;S.SET.voice=0;
 const q=new URLSearchParams(location.search),n=Math.max(1,Math.min(7,Number(q.get('level'))||1)),old=S.scene().player,first=!S.scene().started&&S.scene().lv===S.LEVELS[n];S.begin(n,false,false,true);
 for(let i=0;i<500;i++){await new Promise(r=>setTimeout(r,20));if((first||S.scene().player!==old)&&S.scene().lv===S.LEVELS[n])break;}
 const sc=S.scene();if(q.has('at')){const x=Number(q.get('at'))*16,r=sc.groundAt(x)??14;sc.player.body.reset(x,r*16-1-.47*sc.player.displayHeight);sc.player.setVelocity(0);}S.setPaused(true);
})();
