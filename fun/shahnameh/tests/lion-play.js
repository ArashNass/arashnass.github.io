// Local, muted boss playtest: normal game speed and normal player health.
(async () => {
  if (location.hostname !== '127.0.0.1' || location.port !== '8773') return;
  const wait = () => new Promise(resolve => setTimeout(resolve, 30));
  while (!window.__sh?.scene()?.player) await wait();
  const n = Math.max(1, Math.min(7, +(new URLSearchParams(location.search).get('boss') || 1)));
  const S = window.__sh, old = S.scene().player, first = n === 1 && !S.scene().started;
  S.snd.A.muted = true; S.snd.A.failed = true; S.SET.voice = 0;
  S.begin(n, false, false, true);
  while (!S.scene()?.player?.active || S.scene().lv !== S.LEVELS[n] || (!first && S.scene().player === old)) await wait();
  const sc = S.scene();
  sc.foes.clear(true, true); sc.hordeDone = true; sc.prayed = true; sc.water = 100;
  const left = [0, 86, 138, 112, 112, 112, 124, 146][n];
  sc.player.body.reset((left + 6) * 16, 224 - 1 - .47 * sc.player.displayHeight);
  sc.player.setVelocity(0);
  const start = ['', 'startBoss', 'startQueen', 'startDragon', 'startWitch', 'startOlad', 'startArzhang', 'startWhiteDiv'][n];
  if (!sc.bossOn) sc[start]();
  if (n === 4 && !sc.unmasked) sc.unmask();
})();
