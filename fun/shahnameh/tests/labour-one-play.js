// Local, muted first-labour preview with normal health and unchanged encounters.
(async () => {
 if (location.hostname !== '127.0.0.1' || location.port !== '8776') return;
 while (!window.__sh?.scene()?.player) await new Promise(resolve => setTimeout(resolve,30));
 const S = window.__sh; S.snd.A.muted = true; S.snd.A.failed = true; S.SET.voice = 0;
 S.begin(1, false, false, true);
})();
