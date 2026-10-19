// Local normal-speed crowding preview; production saves and audio are untouched.
(async () => {
 if (location.hostname !== '127.0.0.1' || location.port !== '8774') return;
 const wait = () => new Promise(resolve => setTimeout(resolve, 30));
 while (!window.__sh?.scene()?.player) await wait();
 const S = window.__sh, old = S.scene().player, first = !S.scene().started;
 S.snd.A.muted = true; S.snd.A.failed = true; S.SET.voice = 0;
 S.begin(1, false, false, true);
 while (!S.scene()?.player?.active || (!first && S.scene().player === old)) await wait();
 const sc = S.scene(); sc.foes.clear(true, true);
 sc.player.body.reset(11 * 16, 224 - 1 - .47 * sc.player.displayHeight); sc.player.setVelocity(0);
 ['divwarrior','spearman','ghul'].forEach((kind,i) => sc.spawnFoe(kind,17 * 16 + i * 3,224));
})();
