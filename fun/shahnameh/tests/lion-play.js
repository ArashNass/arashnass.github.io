// Local, muted lion playtest: normal game speed and normal player health.
(async () => {
  if (location.hostname !== '127.0.0.1' || location.port !== '8773') return;
  const wait = () => new Promise(resolve => setTimeout(resolve, 30));
  while (!window.__sh?.scene()?.player) await wait();
  const S = window.__sh, old = S.scene().player, first = !S.scene().started;
  S.snd.A.muted = true; S.snd.A.failed = true; S.SET.voice = 0;
  S.begin(1, false, false, true);
  while (!S.scene()?.player?.active || (!first && S.scene().player === old)) await wait();
  const sc = S.scene();
  sc.foes.clear(true, true); sc.hordeDone = true;
  sc.player.body.reset(93 * 16, 224 - 1 - .47 * sc.player.displayHeight);
  sc.player.setVelocity(0);
  if (!sc.bossOn) sc.startBoss();
})();
