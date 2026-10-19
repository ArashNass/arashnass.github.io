// Muted, normal-health preview of an optional trail; paused and ready to try.
(async()=>{
 if(!['127.0.0.1','localhost'].includes(location.hostname)||location.port!=='8778')return;
 while(!window.__sh?.scene()?.player)await new Promise(r=>setTimeout(r,30));
 const S=window.__sh;S.snd.A.muted=true;S.snd.A.failed=true;S.SET.voice=0;
 const old=S.scene().player,n=Math.max(1,Math.min(7,Number(new URLSearchParams(location.search).get('level'))||1));const first=!S.scene().started&&S.scene().lv===S.LEVELS[n];S.begin(n,false,false,true);
 for(let i=0;i<500;i++){await new Promise(r=>setTimeout(r,20));if((first||S.scene().player!==old)&&S.scene().lv===S.LEVELS[n])break;}
 const sc=S.scene(),t=sc.trial;sc.player.body.reset(t.x,t.y-1-.47*sc.player.displayHeight);sc.player.setVelocity(0);S.setPaused(true);
})();
