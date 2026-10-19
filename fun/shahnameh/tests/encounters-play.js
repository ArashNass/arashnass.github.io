// Normal-health, muted local preview. ?level=2 through ?level=7 select a labour.
(async()=>{
 if(location.hostname!=='127.0.0.1'||location.port!=='8777')return;
 while(!window.__sh?.scene()?.player)await new Promise(r=>setTimeout(r,30));
 const S=window.__sh;S.snd.A.muted=true;S.snd.A.failed=true;S.SET.voice=0;
 S.begin(Math.max(1,Math.min(7,Number(new URLSearchParams(location.search).get('level'))||2)),false,false,true);
})();
