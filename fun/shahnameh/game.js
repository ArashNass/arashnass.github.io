/* Shahnameh: The Seven Labours of Rostam. Khan I, the Lion of the Reeds.
   Built on Phaser 3. Placeholder pixel art is generated in code; drop PixelLab
   sprite strips into ./assets and list them in ART below to replace it. */
(() => {
'use strict';
const $ = id => document.getElementById(id);
const store = { get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }, set(k, v) { try { localStorage.setItem(k, v); } catch (e) {} } };

/* ---------------------------------------------------------------
   ART: set a filename (inside ./assets) to use real sprites.
   Each file is ONE animation as a horizontal strip of square frames,
   transparent background, character facing RIGHT.
   ------------------------------------------------------------- */
const ART = {
  'rostam-idle': 'rostam-idle.png', 'rostam-run': 'rostam-run.png', 'rostam-jump': 'rostam-jump.png', 'rostam-attack': 'rostam-attack.png', 'rostam-hurt': 'rostam-hurt.png',
  'lion-walk': 'lion-walk.png', 'lion-run': 'lion-run.png', 'lion-roar': 'lion-roar.png',
  'jackal-run': 'jackal-run.png', 'div-hop': 'div-hop.png'
};
const FPS = { 'rostam-idle': 5, 'rostam-run': 12, 'rostam-jump': 6, 'rostam-attack': 15, 'rostam-hurt': 6, 'lion-walk': 9, 'lion-run': 14, 'lion-roar': 6, 'jackal-run': 12, 'div-hop': 8, 'coin-spin': 8, 'fire-burn': 10 };
// on-screen frame height in game pixels; equal to the PixelLab frame size so sprites draw 1:1
const SIZE = { rostam: 80, lion: 100, jackal: 58, div: 64 };
const BODY = { rostam: [0.2, 0.55], lion: [0.48, 0.3], jackal: [0.48, 0.31], div: [0.34, 0.52] };
const V = 4;   // bump to bust caches when assets change

// PixelLab VFX strips in ./assets/fx: frame size, frame count, fps, and the effect's origin as a fraction of the frame
const FX = {
  hit: { w: 67, h: 49, n: 8, fps: 16, ox: 0.493, oy: 0.469 }, swing: { w: 61, h: 57, n: 9, fps: 30, ox: 0.443, oy: 0.596 },
  dust: { w: 53, h: 29, n: 8, fps: 16, ox: 0.491, oy: 0.448 }, pickup: { w: 43, h: 49, n: 10, fps: 18, ox: 0.488, oy: 0.653 },
  poof: { w: 56, h: 45, n: 10, fps: 14, ox: 0.536, oy: 0.6 }, heal: { w: 36, h: 60, n: 12, fps: 14, ox: 0.5, oy: 0.7 },
  stun: { w: 39, h: 23, n: 12, fps: 12, ox: 0.487, oy: 0.652, loop: true }, fire: { w: 27, h: 27, n: 12, fps: 12, ox: 0.481, oy: 0.815, loop: true },
  fireflies: { w: 172, h: 141, n: 16, fps: 8, ox: 0.483, oy: 0.418, loop: true }, glow: { w: 53, h: 79, n: 12, fps: 10, ox: 0.491, oy: 0.506, loop: true },
  liondust: { w: 79, h: 70, n: 16, fps: 14, ox: 0.43, oy: 0.957 }
};
// provisions on the road to Mazandaran; 'lamb' is a roast leg that restores a heart
const FOOD = ['lamb', 'pomegranate', 'naan', 'grapes'];

const W = 480, H = 270, TS = 16, ROWS = 17;
const OUT = '#1a0f2e';
const PAL = { skin: '#e2a574', tiger: '#e9a43c', stripe: '#3a1f10', chain: '#a9b4c8', red: '#b8303f', boot: '#5a3418', helm: '#f1ead8', beard: '#2a1a12', mace: '#e8c25a', wood: '#7a4a22' };

/* ------------------------- pixel painter ------------------------ */
function canvas(w, h) { const c = document.createElement('canvas'); c.width = w; c.height = h; const x = c.getContext('2d'); x.imageSmoothingEnabled = false; return [c, x]; }
function paint(x, ox, oy, shapes) {
  for (const pass of [0, 1]) for (const s of shapes) {
    if (s.no && !pass) continue;
    const g = pass || s.no ? 0 : 1; x.fillStyle = pass ? s.c : OUT;
    if (s.t === 'r') x.fillRect(Math.round(ox + s.x - g), Math.round(oy + s.y - g), s.w + 2 * g, s.h + 2 * g);
    else if (s.t === 'e') {
      const rx = s.rx + g, ry = s.ry + g;
      for (let yy = -Math.ceil(ry); yy <= Math.ceil(ry); yy++) {
        const k = 1 - (yy / (ry + 0.5)) ** 2; if (k < 0) continue;
        const hw = Math.round(rx * Math.sqrt(k)); x.fillRect(Math.round(ox + s.x - hw), Math.round(oy + s.y + yy), hw * 2 + 1, 1);
      }
    } else if (s.t === 'l') {
      const n = Math.max(1, Math.ceil(Math.hypot(s.x2 - s.x, s.y2 - s.y))), w = s.w + 2 * g;
      for (let i = 0; i <= n; i++) { const px = s.x + (s.x2 - s.x) * i / n, py = s.y + (s.y2 - s.y) * i / n; x.fillRect(Math.round(ox + px - w / 2), Math.round(oy + py - w / 2), w, w); }
    }
  }
}
const R = (x, y, w, h, c, no) => ({ t: 'r', x, y, w, h, c, no });
const Ell = (x, y, rx, ry, c, no) => ({ t: 'e', x, y, rx, ry, c, no });
const Ln = (x, y, x2, y2, w, c, no) => ({ t: 'l', x, y, x2, y2, w, c, no });
const dir = (a, l) => [Math.sin(a) * l, Math.cos(a) * l];   // 0 = down, + = forward

function rostamFrame(pose) {
  const { lf, lb, af, ab, bob = 0, mace = 0.5, lean = 0 } = pose;
  const hx = 24 + lean, hy = 31 + bob, sh = [24 + lean * 2, 21 + bob];
  const foot = a => { const [dx, dy] = dir(a, 13); return [hx + dx, hy + dy]; };
  const [bfx, bfy] = foot(lb), [ffx, ffy] = foot(lf);
  const [abx, aby] = dir(ab, 9), [afx, afy] = dir(af, 9);
  const hand = [sh[0] + 2 + afx, sh[1] + afy], [mx, my] = dir(mace, 15);
  const tip = [hand[0] + mx, hand[1] + my];
  return [
    Ln(hx - 1, hy, bfx - 1, bfy, 4, '#8a2633'), R(bfx - 3, bfy - 1, 6, 3, PAL.boot),
    Ln(sh[0] - 2, sh[1], sh[0] - 2 + abx, sh[1] + aby, 3, '#c98c5e'),
    Ln(hx + 1, hy, ffx + 1, ffy, 4, PAL.red), R(ffx - 2, ffy - 1, 7, 3, PAL.boot),
    Ell(sh[0], 25 + bob, 7, 8, PAL.chain), Ell(sh[0], 24 + bob, 6, 7, PAL.tiger),
    R(sh[0] - 4, 20 + bob, 1, 3, PAL.stripe, 1), R(sh[0] + 1, 22 + bob, 1, 3, PAL.stripe, 1), R(sh[0] - 2, 26 + bob, 1, 3, PAL.stripe, 1), R(sh[0] + 3, 27 + bob, 1, 2, PAL.stripe, 1),
    R(sh[0] - 6, 29 + bob, 13, 2, '#c8a040'),
    Ell(sh[0] + 1, 14 + bob, 5, 5, PAL.skin), Ell(sh[0] + 3, 18 + bob, 4, 3, PAL.beard),
    Ell(sh[0], 10 + bob, 6, 4, PAL.helm), R(sh[0] - 6, 7 + bob, 2, 3, PAL.helm), R(sh[0] + 5, 6 + bob, 2, 3, PAL.helm),
    R(sh[0] + 3, 13 + bob, 1, 1, '#120a08', 1), R(sh[0] - 2, 11 + bob, 5, 1, '#d9cfb4', 1),
    Ln(hand[0], hand[1], tip[0], tip[1], 2, PAL.wood),
    Ell(tip[0], tip[1], 3, 3, PAL.mace), R(tip[0] - 4, tip[1] - 2, 2, 1, PAL.mace), R(tip[0] + 3, tip[1] - 2, 2, 1, PAL.mace),
    Ln(sh[0] + 2, sh[1], hand[0], hand[1], 3, PAL.skin)
  ];
}
const ROSTAM = {
  idle: [0, 1, 2, 3].map(i => ({ lf: 0.12, lb: -0.12, af: 0.5, ab: -0.2, bob: i < 2 ? 0 : 1, mace: 2.4 })),
  run: [0, 1, 2, 3, 4, 5].map(i => { const s = Math.sin(i / 6 * Math.PI * 2); return { lf: s * 0.8, lb: -s * 0.8, af: -s * 0.7 + 0.6, ab: s * 0.7, bob: Math.abs(Math.cos(i / 6 * Math.PI * 2)) > 0.5 ? 0 : 1, mace: 2.2, lean: 1 }; }),
  jump: [{ lf: 0.9, lb: -0.4, af: 2.3, ab: -1, bob: -1, mace: 3.2 }, { lf: 0.5, lb: -0.2, af: 1.6, ab: -1.3, bob: 0, mace: 2.6 }],
  attack: [3.6, 2.8, 1.4, 0.7].map((m, i) => ({ lf: 0.5, lb: -0.4, af: [2.8, 2.2, 1.1, 0.6][i], ab: -0.6, bob: i > 1 ? 1 : 0, mace: m, lean: i > 1 ? 2 : -1 })),
  hurt: [{ lf: 0.4, lb: -0.5, af: 2.6, ab: 2.4, bob: 1, mace: 3.4, lean: -2 }]
};
function lionFrame(i, mode) {
  const ph = i / 6 * Math.PI * 2, s = Math.sin(ph), run = mode === 'run', roar = mode === 'roar';
  const by = 40 + (run ? Math.abs(s) * -2 : 0), st = run ? 10 : 7;
  const legs = [[22, -s], [28, s], [44, s], [50, -s]].map(([x, k], j) => Ln(x, by + 4, x + k * st * (j < 2 ? 1 : 1), 62, 4, j % 2 ? '#c98a34' : '#b07528'));
  const mouth = roar ? 4 + (i % 2) * 2 : 1;
  return [
    Ln(16, by - 2, 6, by - 12 + s * 3, 2, '#c98a34'), Ell(5, by - 13 + s * 3, 2, 3, '#7a3e12'),
    ...legs.filter((_, j) => j % 2),
    Ell(34, by, 17, 9, '#d99a40'), Ell(32, by - 3, 13, 4, '#e8b45a', 1),
    ...legs.filter((_, j) => !(j % 2)),
    Ell(52, by - 8, 11, 12, '#9a5418'), ...[0, 1, 2, 3, 4, 5].map(k => Ell(52 + Math.cos(k) * 10, by - 8 + Math.sin(k) * 11, 3, 3, '#8a4410')),
    Ell(57, by - 7, 7, 6, '#e8b45a'), R(61, by - 4, 5, mouth, '#5a1018'), R(62, by - 4, 1, 1, '#fff', 1),
    Ell(62, by - 6, 3, 2, '#e8b45a'), R(63, by - 8, 1, 1, OUT, 1), R(57, by - 10, 2, 2, '#ffd23a', 1), R(58, by - 10, 1, 1, OUT, 1)
  ];
}
function jackalFrame(i) {
  const s = Math.sin(i / 4 * Math.PI * 2);
  return [Ln(6, 15, 1, 11 - s, 2, '#8a6230'), Ln(10, 18, 8 - s * 4, 26, 2, '#8a6230'), Ln(20, 18, 22 + s * 4, 26, 2, '#8a6230'),
    Ell(15, 16, 8, 4, '#b8894a'), Ln(12, 18, 10 + s * 4, 26, 2, '#a07840'), Ln(18, 18, 20 - s * 4, 26, 2, '#a07840'),
    Ell(24, 12, 4, 3, '#b8894a'), Ln(27, 13, 30, 14, 2, '#b8894a'), R(22, 6, 2, 4, '#b8894a'), R(25, 7, 2, 3, '#b8894a'), R(25, 11, 1, 1, '#ffd23a', 1)];
}
function divFrame(i) {
  const sq = [0, 2, -1, -2][i], y = 22 + sq;
  return [R(9, 26, 4, 6, '#3a52b8'), R(19, 26, 4, 6, '#3a52b8'),
    Ell(16, y, 9, 9 - sq * 0.5, '#4a6ad0'), R(9, y + 3, 14, 4, '#e9a43c'), R(11, y + 4, 1, 1, PAL.stripe, 1), R(16, y + 5, 1, 1, PAL.stripe, 1), R(20, y + 4, 1, 1, PAL.stripe, 1),
    R(11, y - 6, 1, 1, '#2a3a90', 1), R(20, y - 2, 1, 1, '#2a3a90', 1), R(14, y + 1, 1, 1, '#2a3a90', 1),
    Ln(10, y - 8, 7, y - 15, 2, '#f1ead8'), Ln(22, y - 8, 25, y - 15, 2, '#f1ead8'),
    Ell(19, y - 4, 3, 3, '#fff6c0'), R(20, y - 4, 2, 2, '#c01818', 1), R(16, y + 1, 6, 2, '#5a1018', 1), R(17, y + 1, 1, 1, '#fff', 1), R(20, y + 1, 1, 1, '#fff', 1)];
}

/* ---------------------------- level ---------------------------- */
// '#' ground  '=' glazed-tile ledge (jump through)  '^' thorns  'c' coin  'j' jackal  'd' div  'F' fire altar (checkpoint)  'L' lion  'P' Rostam
function buildMap() {
  const C = 128, g = Array.from({ length: ROWS }, () => Array(C).fill('.'));
  const ground = (a, b, top) => { for (let c = a; c <= b; c++) for (let r = top; r < ROWS; r++) g[r][c] = '#'; };
  const put = (c, r, ch) => { g[r][c] = ch; };
  const row = (a, b, r, ch) => { for (let c = a; c <= b; c++) g[r][c] = ch; };
  ground(0, 21, 14); ground(25, 39, 14); ground(40, 47, 12); ground(48, 59, 14); ground(60, 68, 16); row(60, 68, 15, '^'); ground(69, 84, 14); ground(85, 127, 14);
  row(61, 63, 11, '='); row(66, 68, 10, '='); row(74, 77, 10, '='); row(79, 82, 7, '=');
  for (const c of [33, 41]) { put(c, 12, '#'); put(c, 13, '#'); }
  put(3, 13, 'P');
  [[8, 12], [10, 11], [12, 12], [22, 11], [23, 10], [24, 11], [43, 9], [44, 8], [45, 9], [62, 9], [67, 8], [75, 8], [76, 8], [80, 5], [81, 5]].forEach(([c, r]) => put(c, r, 'c'));
  put(16, 13, 'j'); put(30, 13, 'j'); put(45, 11, 'd'); put(55, 13, 'j'); put(72, 13, 'd'); put(80, 13, 'j');
  put(52, 13, 'F'); put(110, 12, 'L');
  return g;
}

/* -------------------------- textures --------------------------- */
function makeTextures(scene) {
  const T = scene.textures;
  const strip = (key, n, fw, fh, draw) => {
    if (T.exists(key)) return;
    const [c, x] = canvas(fw * n, fh);
    for (let i = 0; i < n; i++) draw(x, i * fw, i);
    T.addCanvas(key, c); const t = T.get(key);
    for (let i = 0; i < n; i++) t.add(i, 0, i * fw, 0, fw, fh);
  };
  strip('rostam-idle', 4, 48, 48, (x, o, i) => paint(x, o, 0, rostamFrame(ROSTAM.idle[i])));
  strip('rostam-run', 6, 48, 48, (x, o, i) => paint(x, o, 0, rostamFrame(ROSTAM.run[i])));
  strip('rostam-jump', 2, 48, 48, (x, o, i) => paint(x, o, 0, rostamFrame(ROSTAM.jump[i])));
  strip('rostam-attack', 4, 48, 48, (x, o, i) => paint(x, o, 0, rostamFrame(ROSTAM.attack[i])));
  strip('rostam-hurt', 1, 48, 48, (x, o) => paint(x, o, 0, rostamFrame(ROSTAM.hurt[0])));
  strip('lion-walk', 6, 72, 72, (x, o, i) => paint(x, o + 2, 4, lionFrame(i, 'walk')));
  strip('lion-run', 6, 72, 72, (x, o, i) => paint(x, o + 2, 4, lionFrame(i, 'run')));
  strip('lion-roar', 2, 72, 72, (x, o, i) => paint(x, o + 2, 4, lionFrame(i, 'roar')));
  strip('jackal-run', 4, 32, 32, (x, o, i) => paint(x, o, 2, jackalFrame(i)));
  strip('div-hop', 4, 34, 34, (x, o, i) => paint(x, o + 1, 1, divFrame(i)));
  strip('coin-spin', 4, 10, 10, (x, o, i) => { const w = [4, 3, 1, 3][i]; paint(x, o + 5, 5, [Ell(0, 0, w, 4, '#e8c25a'), R(-Math.max(0, w - 2), -2, 1, 2, '#fff3b0', 1)]); });
  strip('fire-burn', 4, 16, 32, (x, o, i) => {
    paint(x, o, 0, [R(3, 22, 10, 9, '#d9c6a0'), R(2, 20, 12, 3, '#b8a07a'), R(5, 25, 6, 2, '#8a7356', 1)]);
    const fl = [0, 1, 2, 1][i];
    paint(x, o, 0, [Ell(8, 14 - fl, 4, 6 + fl, '#ff8a2a'), Ell(8, 15 - fl, 2, 4, '#ffe08a', 1)]);
  });
  strip('altar-cold', 1, 16, 32, (x, o) => paint(x, o, 0, [R(3, 22, 10, 9, '#d9c6a0'), R(2, 20, 12, 3, '#b8a07a'), R(5, 25, 6, 2, '#8a7356', 1)]));
  strip('feather', 1, 16, 32, (x, o) => paint(x, o, 0, [Ln(8, 30, 8, 4, 1, '#f1ead8'), Ell(8, 16, 5, 12, '#2fa8b5'), Ell(8, 14, 3, 8, '#e8c25a', 1), Ell(8, 12, 2, 3, '#b8303f', 1), Ell(8, 12, 1, 1, OUT, 1)]));
  // tiles: 0 ground top, 1 ground fill, 2 glazed ledge, 3 thorns
  if (!T.exists('tiles')) {
    const [c, x] = canvas(TS * 4, TS);
    x.fillStyle = '#c98a4b'; x.fillRect(0, 0, 32, 16);
    for (let i = 0; i < 40; i++) { x.fillStyle = i % 3 ? '#b07a40' : '#dba060'; x.fillRect((i * 7) % 32, 4 + (i * 5) % 12, 1, 1); }
    x.fillStyle = '#5f9b45'; x.fillRect(0, 0, 16, 4); x.fillStyle = '#7fbf55'; x.fillRect(0, 0, 16, 2);
    x.fillStyle = OUT; x.fillRect(0, 0, 16, 1);
    for (let i = 0; i < 6; i++) { x.fillStyle = '#7fbf55'; x.fillRect(1 + i * 3, 4, 1, 1 + (i % 2)); }
    x.fillStyle = '#e8434f'; x.fillRect(5, 1, 1, 1); x.fillStyle = '#fff'; x.fillRect(12, 1, 1, 1);
    x.fillStyle = '#a8703a'; x.fillRect(19, 6, 3, 1); x.fillRect(26, 11, 3, 1);
    x.fillStyle = '#1f3f9a'; x.fillRect(32, 0, 16, 8); x.fillStyle = '#2fa8b5'; x.fillRect(33, 1, 14, 6);
    x.fillStyle = '#e8c25a'; x.fillRect(39, 2, 2, 4); x.fillRect(38, 3, 4, 2); x.fillStyle = '#fff'; x.fillRect(34, 1, 3, 1);
    x.fillStyle = OUT; x.fillRect(32, 7, 16, 1);
    x.fillStyle = '#5a3418'; for (let k = 0; k < 4; k++) x.fillRect(49 + k * 4, 6, 1, 10);
    x.fillStyle = '#d9cfb4'; for (let k = 0; k < 4; k++) { x.fillRect(48 + k * 4, 8, 1, 1); x.fillRect(50 + k * 4, 11, 1, 1); x.fillRect(49 + k * 4, 5, 1, 1); }
    T.addCanvas('tiles', c);
  }
  // night parallax: the far sky and the ruins are PixelLab paintings (loaded); these nearer layers tile, so they are drawn here
  const layer = (key, w, h, draw) => { if (T.exists(key)) return; const [c, x] = canvas(w, h); draw(x, w, h); T.addCanvas(key, c); };
  const wrap = (w, f) => { f(0); f(-w); f(w); };          // draw a shape three times so the layer tiles seamlessly
  const hash = i => { const s = Math.sin(i * 127.1) * 43758.5453; return s - Math.floor(s); };
  layer('bg-mist', 512, H, (x, w) => {                     // drifting bands of valley fog
    for (let b = 0; b < 4; b++) {
      const y0 = 150 + b * 26, a = [0.07, 0.1, 0.12, 0.16][b];
      for (let i = 0; i < 20; i++) wrap(w, o => {
        const cx = o + hash(b * 31 + i) * w, rx = 30 + hash(i + b) * 60, ry = 5 + hash(i * 3 + b) * 7;
        x.fillStyle = `rgba(170,200,230,${a})`; x.beginPath(); x.ellipse(Math.round(cx), y0 + Math.round(hash(i * 7) * 14), rx, ry, 0, 0, 7); x.fill();
      });
    }
  });
  layer('bg-hills', 512, H, (x, w) => {                    // two ridges of dark hills with cypresses, rimmed by moonlight
    const ridge = (base, amp, k, col, rim) => {
      const yAt = i => Math.round(base + Math.sin(i / w * Math.PI * 2 * k) * amp + Math.sin(i / w * Math.PI * 2 * (k * 3 + 1)) * amp * 0.35);
      x.fillStyle = col; x.beginPath(); x.moveTo(0, H); for (let i = 0; i <= w; i += 2) x.lineTo(i, yAt(i)); x.lineTo(w, H); x.closePath(); x.fill();
      x.fillStyle = rim; for (let i = 0; i < w; i++) x.fillRect(i, yAt(i), 1, 1);
      return yAt;
    };
    ridge(176, 9, 2, '#18203a', '#3e5878');
    const near = ridge(204, 7, 3, '#0f1528', '#2c4260');
    for (let k = 0; k < 9; k++) {                           // cypress trees, the Persian garden's sentinel
      const cx = Math.round((k * 61 + 23) % w), hgt = 26 + Math.round(hash(k) * 22), base = near(cx) + 2;
      wrap(w, o => {
        x.fillStyle = '#0b1020'; x.beginPath(); x.ellipse(o + cx, base - hgt / 2, 4 + (k % 2), hgt / 2, 0, 0, 7); x.fill();
        x.fillStyle = '#26405a'; for (let y = base - hgt + 3; y < base - 2; y += 3) x.fillRect(o + cx - 3, y, 1, 2);
      });
    }
  });
  const reeds = (x, w, n, seed, hMin, hMax, stem, head, rim) => {
    for (let i = 0; i < n; i++) {
      const rx = Math.round(hash(i + seed) * w), h = hMin + hash(i * 3 + seed) * (hMax - hMin), lean = (hash(i * 5 + seed) - 0.5) * 8;
      wrap(w, o => {
        x.strokeStyle = stem; x.lineWidth = 1.5; x.beginPath(); x.moveTo(o + rx, H); x.quadraticCurveTo(o + rx + lean / 2, H - h / 2, o + rx + lean, H - h); x.stroke();
        if (i % 3 === 0) { x.fillStyle = head; x.fillRect(Math.round(o + rx + lean) - 1, Math.round(H - h) - 6, 3, 8); x.fillStyle = rim; x.fillRect(Math.round(o + rx + lean) - 1, Math.round(H - h) - 6, 1, 4); }
        else if (i % 3 === 1) { x.strokeStyle = stem; x.beginPath(); x.moveTo(o + rx + lean / 2, H - h / 2); x.lineTo(o + rx + lean / 2 + (lean > 0 ? 9 : -9), H - h / 2 - 7); x.stroke(); }
      });
    }
  };
  layer('bg-reeds', 512, H, (x, w) => reeds(x, w, 110, 11, 34, 78, '#142232', '#1c2a3a', '#4a6a82'));
  layer('fg-reeds', 512, H, (x, w) => reeds(x, w, 34, 97, 18, 46, '#05080f', '#070b14', '#16283a'));
  layer('vignette', W, H, x => {
    const g = x.createRadialGradient(W / 2, H * 0.55, H * 0.35, W / 2, H * 0.55, W * 0.62);
    g.addColorStop(0, 'rgba(6,8,22,0)'); g.addColorStop(1, 'rgba(6,8,22,0.62)'); x.fillStyle = g; x.fillRect(0, 0, W, H);
  });
  layer('glow', 64, 64, x => {                             // soft warm light pool for fires
    const g = x.createRadialGradient(32, 32, 0, 32, 32, 32); g.addColorStop(0, 'rgba(255,170,80,0.55)'); g.addColorStop(1, 'rgba(255,120,40,0)');
    x.fillStyle = g; x.fillRect(0, 0, 64, 64);
  });
}

/* ---------------------------- audio ---------------------------- */
const A = { ctx: null, master: null, muted: store.get('sh-muted') === '1', timer: null, step: 0, next: 0 };
function audio() {
  if (!A.ctx) { const C = window.AudioContext || window.webkitAudioContext; if (!C) return null; A.ctx = new C(); A.master = A.ctx.createGain(); A.master.gain.value = A.muted ? 0 : 0.5; A.master.connect(A.ctx.destination); }
  if (A.ctx.state === 'suspended') A.ctx.resume(); return A.ctx;
}
function tone(f, d, { type = 'triangle', vol = 0.15, to = 0, t } = {}) {
  const c = A.ctx; if (!c) return; t = t ?? c.currentTime;
  const o = c.createOscillator(), g = c.createGain(); o.type = type; o.frequency.setValueAtTime(f, t); if (to) o.frequency.exponentialRampToValueAtTime(to, t + d);
  g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 0.008); g.gain.exponentialRampToValueAtTime(0.0001, t + d);
  o.connect(g).connect(A.master); o.start(t); o.stop(t + d + 0.02);
}
const sfx = (k) => { if (!A.ctx || A.muted) return; ({
  jump: () => tone(260, 0.15, { type: 'square', vol: 0.05, to: 520 }),
  coin: () => { tone(1320, 0.08, { vol: 0.08 }); tone(1760, 0.14, { vol: 0.06, t: A.ctx.currentTime + 0.05 }); },
  swing: () => tone(200, 0.12, { type: 'sawtooth', vol: 0.05, to: 90 }),
  hit: () => tone(120, 0.18, { type: 'square', vol: 0.12, to: 50 }),
  hurt: () => tone(300, 0.3, { type: 'sawtooth', vol: 0.1, to: 80 }),
  roar: () => { tone(90, 0.7, { type: 'sawtooth', vol: 0.18, to: 55 }); tone(140, 0.6, { type: 'square', vol: 0.06, to: 70 }); },
  fire: () => [0, 3, 7].forEach((n, i) => tone(440 * 2 ** (n / 12), 0.2, { vol: 0.07, t: A.ctx.currentTime + i * 0.07 })),
  win: () => [0, 1, 5, 7, 8, 12].forEach((n, i) => tone(293.66 * 2 ** (n / 12), 0.3, { vol: 0.08, t: A.ctx.currentTime + i * 0.13 }))
})[k](); };
// a little setar-and-daf loop in a Shur-like mode
const SHUR = [0, 1, 3, 5, 7, 8, 10, 12], MEL = [4, 3, 2, 1, 2, -1, 1, 0, 3, 2, 1, 2, 1, -1, 0, -1];
function musicTick() {
  const c = A.ctx;
  while (A.next < c.currentTime + 0.25) {
    const i = A.step % 16, n = MEL[i], t = A.next;
    if (n >= 0) { tone(293.66 * 2 ** (SHUR[n] / 12), 0.22, { vol: 0.05, t }); tone(587.3 * 2 ** (SHUR[n] / 12), 0.08, { vol: 0.015, t: t + 0.02 }); }
    if (i % 4 === 0) tone(80, 0.18, { type: 'sine', vol: 0.18, to: 45, t });
    if (i % 4 === 2) tone(220, 0.05, { type: 'square', vol: 0.025, t });
    A.step++; A.next += 0.21;
  }
}
// a low drone on D and A under the melody, breathing slowly: the reeds at night
function drone(on) {
  const c = A.ctx; if (!c) return;
  if (A.drone) { const d = A.drone; A.drone = null; d.g.gain.setTargetAtTime(0.0001, c.currentTime, 0.4); setTimeout(() => d.o.forEach(o => o.stop()), 1500); }
  if (!on) return;
  const g = c.createGain(), lp = c.createBiquadFilter(), lfo = c.createOscillator(), lg = c.createGain();
  lp.type = 'lowpass'; lp.frequency.value = 420; g.gain.value = 0.0001; g.gain.setTargetAtTime(0.05, c.currentTime, 1.2);
  lfo.frequency.value = 0.09; lg.gain.value = 0.02; lfo.connect(lg).connect(g.gain);
  const o = [73.42, 73.9, 110].map((f, i) => { const x = c.createOscillator(); x.type = i === 2 ? 'triangle' : 'sawtooth'; x.frequency.value = f; x.connect(lp); x.start(); return x; });
  lp.connect(g).connect(A.master); lfo.start(); o.push(lfo); A.drone = { g, o };
}
const music = on => { clearInterval(A.timer); A.timer = null; drone(false); if (on && !A.muted && audio()) { A.next = A.ctx.currentTime + 0.05; A.timer = setInterval(musicTick, 60); drone(true); } };
function setMuted(m) {
  A.muted = m; store.set('sh-muted', m ? '1' : '0'); if (A.master) A.master.gain.value = m ? 0 : 0.5;
  $('muteIco').setAttribute('d', m ? 'M4 9v6h4l5 4V5L8 9z M17 9l5 6 M22 9l-5 6' : 'M4 9v6h4l5 4V5L8 9z M16 9a4 4 0 0 1 0 6 M19 6a8 8 0 0 1 0 12');
  music(!m && game && game.scene.isActive('play') && playing);
}

/* ---------------------------- input ---------------------------- */
const keys = { left: false, right: false, jump: false, attack: false }, pressed = { jump: false, attack: false };
const KEYMAP = { ArrowLeft: 'left', a: 'left', A: 'left', ArrowRight: 'right', d: 'right', D: 'right', ArrowUp: 'jump', w: 'jump', W: 'jump', ' ': 'jump', z: 'jump', Z: 'jump', x: 'attack', X: 'attack', j: 'attack', J: 'attack', k: 'attack', K: 'attack' };
const press = (k, down) => { if (down && !keys[k] && k in pressed) pressed[k] = true; keys[k] = down; };
addEventListener('keydown', e => {
  if (!$('s-story').classList.contains('hidden')) {             // the tale is open: page through it
    if (e.key === 'ArrowRight') turn(1); else if (e.key === 'ArrowLeft') turn(-1); else if (e.key === 'Escape') closeStory();
    return;
  }
  if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', ' '].includes(e.key) && e.target.tagName !== 'BUTTON') e.preventDefault();
  if (e.key === 'm' || e.key === 'M') return setMuted(!A.muted);
  if (e.key === 'Escape' || e.key === 'p' || e.key === 'P') { if (playing || paused) setPaused(!paused); return; }
  if (e.key === 'Enter' && !playing && !paused && e.target.tagName !== 'BUTTON') return begin();
  const k = KEYMAP[e.key]; if (k) press(k, true);
});
addEventListener('keyup', e => { const k = KEYMAP[e.key]; if (k) press(k, false); });
document.querySelectorAll('.tb').forEach(b => {
  const k = b.dataset.k;
  b.addEventListener('pointerdown', e => { e.preventDefault(); audio(); b.setPointerCapture?.(e.pointerId); b.classList.add('on'); press(k, true); });
  const off = e => { e.preventDefault(); b.classList.remove('on'); press(k, false); };
  ['pointerup', 'pointercancel', 'lostpointercapture'].forEach(ev => b.addEventListener(ev, off));
});
addEventListener('blur', () => { for (const k in keys) keys[k] = false; });

/* ---------------------------- scene ---------------------------- */
let game = null, playing = false;
const touch = matchMedia('(pointer:coarse)').matches || 'ontouchstart' in window;

class Play extends Phaser.Scene {
  constructor() { super('play'); }
  preload() {
    const L = this.load, q = '?v=' + V;
    for (const [k, f] of Object.entries(ART)) if (f) L.image(k, 'assets/' + f + q);
    for (const [k, f] of Object.entries(FX)) L.spritesheet('fx-' + k, `assets/fx/${k}.png${q}`, { frameWidth: f.w, frameHeight: f.h });
    L.spritesheet('food', 'assets/food.png' + q, { frameWidth: 27, frameHeight: 27 });
    L.image('bg-far', 'assets/bg/far.png' + q); L.image('bg-ruins', 'assets/bg/ruins.png' + q);
    L.image('tiles', 'assets/tiles.png' + q); L.image('altar', 'assets/altar.png' + q); L.image('feather', 'assets/feather.png' + q);
  }
  create() {
    // turn loaded strips into square frames; anything missing falls back to placeholder art
    for (const [k, f] of Object.entries(ART)) if (f && this.textures.exists(k)) {
      const t = this.textures.get(k), img = t.getSourceImage(), fh = img.height, n = Math.max(1, Math.round(img.width / fh));
      for (let i = 0; i < n; i++) t.add(i, 0, i * fh, 0, fh, fh);
    }
    makeTextures(this);
    for (const k of Object.keys(FPS)) {
      const t = this.textures.get(k), n = t.frameTotal - 1;
      if (!this.anims.exists(k)) this.anims.create({ key: k, frames: this.anims.generateFrameNumbers(k, { start: 0, end: Math.max(0, n - 1) }), frameRate: FPS[k], repeat: /attack|hurt|roar|jump/.test(k) ? 0 : -1 });
    }
    const map = buildMap(), C = map[0].length;
    this.levelW = C * TS;
    for (const [k, f] of Object.entries(FX)) if (!this.anims.exists('fx-' + k)) this.anims.create({ key: 'fx-' + k, frames: this.anims.generateFrameNumbers('fx-' + k, { start: 0, end: f.n - 1 }), frameRate: f.fps, repeat: f.loop ? -1 : 0 });
    // backdrop: the moonlit range with Damavand gives way to the ruined fire temple as Rostam nears the reeds
    this.far = this.add.image(0, 0, 'bg-far').setOrigin(0).setScrollFactor(0);
    this.ruins = this.add.image(0, 0, 'bg-ruins').setOrigin(0).setScrollFactor(0).setAlpha(0);
    this.mist = this.add.tileSprite(0, 0, W, H, 'bg-mist').setOrigin(0).setScrollFactor(0);
    this.hills = this.add.tileSprite(0, 0, W, H, 'bg-hills').setOrigin(0).setScrollFactor(0);
    this.reeds = this.add.tileSprite(0, 0, W, H, 'bg-reeds').setOrigin(0).setScrollFactor(0);
    this.fgReeds = this.add.tileSprite(0, 6, W, H, 'fg-reeds').setOrigin(0).setScrollFactor(0).setDepth(12).setAlpha(0.92);
    this.add.image(0, 0, 'vignette').setOrigin(0).setScrollFactor(0).setDepth(13);
    const data = map.map((row, r) => row.map((ch, c) => ch === '#' ? (r > 0 && map[r - 1][c] === '#' ? 1 : 0) : ch === '=' ? 2 : ch === '^' ? 3 : -1));
    const tm = this.make.tilemap({ data, tileWidth: TS, tileHeight: TS });
    const ts = tm.addTilesetImage('tiles', 'tiles', TS, TS, 0, 0);
    this.layer = tm.createLayer(0, ts, 0, 0);
    this.layer.setCollision([0, 1, 2]);
    this.layer.forEachTile(t => { if (t.index === 2) t.setCollision(false, false, true, false); });
    this.physics.world.setBounds(0, 0, this.levelW, ROWS * TS + 200);
    this.physics.world.checkCollision.down = false;

    this.coins = this.physics.add.staticGroup();
    this.foes = this.physics.add.group();
    this.altars = [];
    map.forEach((row, r) => row.forEach((ch, c) => {
      const x = c * TS + TS / 2, y = r * TS + TS;
      if (ch === 'c') {
        // roast lamb on the high perches, fruit and bread everywhere else
        const kind = (c === 44 && r === 8) || (c === 80 && r === 5) ? 'lamb' : FOOD[1 + (this.coins.getLength() % 3)];
        const f = this.coins.create(x, y - 6, 'food', FOOD.indexOf(kind)); f.kind = kind; f.body.setSize(16, 16);
        this.tweens.add({ targets: f, y: f.y - 3, yoyo: true, repeat: -1, duration: 900 + (c % 5) * 90, ease: 'Sine.easeInOut' });
      }
      else if (ch === 'P') this.start = { x, y };
      else if (ch === 'j') this.spawnFoe('jackal', x, y);
      else if (ch === 'd') this.spawnFoe('div', x, y);
      else if (ch === 'F') { const a = this.add.image(x, y, 'altar').setOrigin(0.5, 1).setDepth(2); a.lit = false; this.altars.push(a); }
      else if (ch === 'L') this.lionAt = { x, y };
    }));
    this.respawn = { ...this.start };
    this.player = this.physics.add.sprite(this.start.x, this.start.y - 30, 'rostam-idle', 0);
    this.fit(this.player, 'rostam');
    this.player.setDepth(5);
    this.physics.add.collider(this.player, this.layer);
    this.physics.add.collider(this.foes, this.layer);
    this.physics.add.overlap(this.player, this.coins, (pl, c) => this.eat(c));
    // fireflies over the reed beds
    for (const fx of [14, 37, 58, 76, 98, 118]) this.add.sprite(fx * TS, 160, 'fx-fireflies').play({ key: 'fx-fireflies', startFrame: fx % 16 }).setDepth(11).setAlpha(0.9);
    this.lion = null;
    this.cam = this.cameras.main;
    this.cam.setBounds(0, 0, this.levelW, ROWS * TS);
    this.cam.startFollow(this.player, true, 0.12, 0.12);
    this.cam.setRoundPixels(true);
    this.hp = 5; this.coinCount = 0; this.kills = 0; this.wasGround = true; this.face = 1; this.inv = 0; this.atk = 0; this.cool = 0; this.coyote = 0; this.buf = 0; this.bossOn = false; this.done = false; this.t0 = this.time.now;
    this.renderHearts(); $('coins').textContent = 0;
    this.parts = this.add.particles(0, 0, 'coin-spin', { frame: 0, speed: { min: 30, max: 90 }, lifespan: 450, scale: { start: 0.8, end: 0 }, gravityY: 120, emitting: false }).setDepth(9);
  }
  fit(s, kind) {
    const fh = s.frame.height, sc = SIZE[kind] / fh, [bw, bh] = BODY[kind];
    s.setScale(sc); s.body.setSize(fh * bw, fh * bh); s.body.setOffset((fh - fh * bw) / 2, fh - fh * bh - fh * 0.03);
  }
  spawnFoe(kind, x, y) {
    const f = this.foes.create(x, y - 20, kind === 'jackal' ? 'jackal-run' : 'div-hop', 0);
    this.fit(f, kind); f.kind = kind; f.hp = kind === 'div' ? 2 : 1; f.dir = -1; f.hopT = Math.random() * 60;
    f.play(kind === 'jackal' ? 'jackal-run' : 'div-hop'); f.setVelocityX(kind === 'jackal' ? -55 : 0);
    return f;
  }
  // play a PixelLab effect once (or looping) at a point; origin follows the effect's own anchor
  fx(key, x, y, { flip = false, depth = 9, follow = null } = {}) {
    const f = FX[key], s = this.add.sprite(Math.round(x), Math.round(y), 'fx-' + key).setOrigin(flip ? 1 - f.ox : f.ox, f.oy).setFlipX(flip).setDepth(depth);
    s.play('fx-' + key); if (!f.loop) s.once('animationcomplete', () => s.destroy());
    if (follow) s.follow = follow;
    return s;
  }
  eat(c) {
    if (!c.active) return;
    const heal = c.kind === 'lamb' && this.hp < 5;
    c.destroy(); this.coinCount++; $('coins').textContent = this.coinCount; sfx('coin');
    this.fx('pickup', c.x, c.y + 6);
    if (c.kind === 'lamb') { if (heal) { this.hp++; this.renderHearts(); } this.fx('heal', this.player.x, this.player.body.bottom - 4, { depth: 6 }); sfx('fire'); }
  }
  sparkle(x, y, tint) { this.parts.setParticleTint(tint); this.parts.explode(8, x, y); }
  renderHearts() { $('hearts').innerHTML = Array.from({ length: 5 }, (_, i) => `<img src="assets/ui/heart${i < this.hp ? '' : '-off'}.png?v=${V}" alt="">`).join(''); $('hearts').setAttribute('aria-label', this.hp + ' of 5 hearts'); }
  hurt(fromX) {
    if (this.inv > 0 || this.done) return;
    this.hp--; this.renderHearts(); this.inv = 90; sfx('hurt'); this.cam.shake(160, 0.008); this.cam.flash(120, 180, 40, 60);
    this.player.setVelocity((this.player.x < fromX ? -1 : 1) * 160, -220);
    if (this.hp <= 0) { this.done = true; playing = false; music(false); document.body.classList.remove('playing'); this.player.setTint(0x777777); $('deadTip').textContent = TIPS[Math.floor(Math.random() * TIPS.length)]; setTimeout(() => $('s-dead').classList.remove('hidden'), 900); }
  }
  strikeBox() { const p = this.player; return new Phaser.Geom.Rectangle(this.face > 0 ? p.body.right - 4 : p.body.left - 30, p.body.top - 6, 34, p.body.height + 8); }
  damage(f, n = 1) {
    f.hp -= n; f.setTintFill(0xffffff); this.time.delayedCall(80, () => f.active && f.clearTint());
    const hx = Phaser.Math.Clamp(this.face > 0 ? f.body.left + 6 : f.body.right - 6, f.body.left, f.body.right);
    this.fx('hit', hx, f.body.center.y - 4, { depth: 10 }); sfx('hit'); this.cam.shake(80, 0.004);
    this.hitStop(f === this.lion ? 70 : 45);
    if (f.hp <= 0) {
      if (f === this.lion) return this.lionDown();
      this.kills++; f.body.enable = false;
      this.fx('poof', f.x, f.body.bottom - 14, { depth: 10 });
      this.tweens.add({ targets: f, alpha: 0, y: f.y - 6, duration: 220, onComplete: () => f.destroy() });
    }
  }
  // a tiny freeze on impact makes blows feel heavy
  hitStop(ms) { this.physics.world.pause(); this.anims.pauseAll(); this.time.delayedCall(ms, () => { this.physics.world.resume(); this.anims.resumeAll(); }); }
  roarRings(l) {
    const x = l.x + (l.flipX ? -30 : 30), y = l.y - 4;
    for (let i = 0; i < 3; i++) {
      const g = this.add.ellipse(x, y, 10, 12).setStrokeStyle(2, 0xf6dc8c, 0.9).setDepth(9);
      this.tweens.add({ targets: g, scaleX: 9, scaleY: 7, alpha: 0, delay: i * 160, duration: 650, ease: 'Quad.easeOut', onComplete: () => g.destroy() });
    }
    this.cam.shake(400, 0.006);
  }
  startBoss() {
    this.bossOn = true;
    const x0 = 86 * TS;
    this.cam.stopFollow(); this.tweens.add({ targets: this.cam, scrollX: Math.min(this.levelW - W, x0), duration: 700, ease: 'Sine.easeInOut' });
    this.wall = this.add.rectangle(x0 - 4, 0, 8, ROWS * TS, 0, 0).setOrigin(0.5, 0); this.physics.add.existing(this.wall, true);
    this.physics.add.collider(this.player, this.wall);
    const l = this.lion = this.physics.add.sprite(this.lionAt.x, this.lionAt.y - 40, 'lion-walk', 0);
    this.fit(l, 'lion'); l.hp = 8; l.max = 8; l.state = 'roar'; l.tm = 70; l.dir = -1; l.setFlipX(true); l.play('lion-roar'); l.setDepth(4);
    this.physics.add.collider(l, this.layer); this.physics.add.collider(l, this.wall);
    sfx('roar'); this.roarRings(l);
    $('boss').classList.remove('hidden'); this.bossBar(); banner();
  }
  bossBar() { $('bossHp').style.width = (this.lion.hp / this.lion.max * 100) + '%'; }
  lionAI() {
    const l = this.lion, p = this.player; if (!l || !l.active || l.hp <= 0) return;
    l.tm--; const toP = Math.sign(p.x - l.x) || 1;
    if (l.state === 'prowl') { l.setVelocityX(toP * 45); l.dir = toP; if (l.anims.currentAnim?.key !== 'lion-walk') l.play('lion-walk'); if (l.tm <= 0) { l.state = Math.random() < 0.6 ? 'roar' : 'pounce'; l.tm = 45; l.setVelocityX(0); if (l.state === 'roar') { l.play('lion-roar'); sfx('roar'); this.roarRings(l); } } }
    else if (l.state === 'roar') { l.setVelocityX(0); if (l.tm <= 0) { l.state = 'charge'; l.dir = toP; l.tm = 110; l.play('lion-run'); } }
    else if (l.state === 'charge') { l.setVelocityX(l.dir * 230); if (l.body.blocked.left || l.body.blocked.right || l.tm <= 0) { l.state = 'stun'; l.tm = 70; l.setVelocityX(0); l.play('lion-walk'); l.anims.pause(); this.cam.shake(200, 0.01);
      this.fx('dust', l.x + l.dir * 30, l.body.bottom, { depth: 8 }); this.stars = this.fx('stun', l.x, l.body.top - 6, { depth: 10, follow: l }); } }
    else if (l.state === 'pounce') { if (l.tm === 44) { l.dir = toP; l.setVelocity(toP * 170, -330); l.play('lion-run'); } if (l.tm < 30 && l.body.blocked.down) { l.state = 'prowl'; l.tm = 70 + Math.random() * 40; l.setVelocityX(0); } }
    else if (l.state === 'stun') { if (this.stars) this.stars.setPosition(Math.round(l.x), Math.round(l.body.top - 6)); if (l.tm <= 0) { l.anims.resume(); l.state = 'prowl'; l.tm = 80; this.stars?.destroy(); this.stars = null; } }
    if (l.state === 'pounce' && l.tm < 30 && l.body.blocked.down && !l.landed) { l.landed = true; this.fx('dust', l.x, l.body.bottom, { depth: 8 }); }
    if (l.state !== 'pounce') l.landed = false;
    l.setFlipX(l.dir < 0);
  }
  lionDown() {
    const l = this.lion; l.body.enable = false; l.anims.stop(); sfx('win'); this.stars?.destroy(); this.stars = null;
    // the lion breaks into motes the colour of the Simurgh
    l.setVisible(false); this.fx('liondust', l.x + (l.flipX ? 6 : -6), l.body.bottom + 1, { flip: l.flipX, depth: 4 }); this.cam.flash(300, 255, 240, 200);
    $('boss').classList.add('hidden'); this.wall.destroy();
    // the Simurgh's feather drifts down where the lion fell
    const fx = Phaser.Math.Clamp(l.x, 88 * TS, this.levelW - 40), fy = this.lionAt.y - 30;
    const glow = this.add.sprite(fx, fy - 60, 'fx-glow').play('fx-glow').setDepth(5);
    const f = this.physics.add.staticImage(fx, fy - 60, 'feather').setDepth(6);
    this.tweens.add({ targets: [f, glow], y: fy, duration: 1600, ease: 'Sine.easeOut', onUpdate: () => f.refreshBody(), onComplete: () => {
      this.tweens.add({ targets: [f, glow], y: fy - 5, yoyo: true, repeat: -1, duration: 900, ease: 'Sine.easeInOut', onUpdate: () => f.refreshBody() });
    } });
    this.physics.add.overlap(this.player, f, () => this.win(f));
    this.cam.startFollow(this.player, true, 0.12, 0.12);
  }
  win(f) {
    if (this.done) return; this.done = true; playing = false; music(false); sfx('fire'); f.destroy(); document.body.classList.remove('playing');
    const s = Math.round((this.time.now - this.t0) / 1000);
    $('winMsg').textContent = 'With the lion of the reeds slain, Rostam takes up a feather of the Simurgh. Ahead lies the waterless desert of the second labour.';
    $('winStats').innerHTML = `<div><b>${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}</b>time</div><div><b>${this.coinCount}</b>provisions</div><div><b>${this.kills}</b>foes</div><div><b>${this.hp}</b>hearts</div>`;
    const best = +(store.get('sh-best') || 0); if (!best || s < best) store.set('sh-best', s);
    $('winBest').textContent = !best || s < best ? 'A new best time!' : `Best time ${Math.floor(best / 60)}:${String(best % 60).padStart(2, '0')}`;
    setTimeout(() => $('s-win').classList.remove('hidden'), 600);
  }
  update(time, delta) {
    const k = delta / 16.67, p = this.player, b = p.body;
    const sx = this.cam.scrollX;
    this.far.x = this.ruins.x = -Math.round(sx * 0.05);
    const ra = Phaser.Math.Clamp((sx - 760) / 520, 0, 1);
    this.ruins.setAlpha(ra); this.hills.setAlpha(1 - ra * 0.75);
    this.mist.tilePositionX = Math.round(sx * 0.25 + time * 0.004); this.hills.tilePositionX = Math.round(sx * 0.4);
    this.reeds.tilePositionX = Math.round(sx * 0.7); this.fgReeds.tilePositionX = Math.round(sx * 1.25);
    if (!playing || this.done) { if (this.done && this.hp <= 0) p.setVelocityX(0); return; }
    this.inv = Math.max(0, this.inv - k); p.setAlpha(this.inv > 0 && Math.floor(this.inv / 5) % 2 ? 0.35 : 1);
    const dirX = (keys.right ? 1 : 0) - (keys.left ? 1 : 0), ground = b.blocked.down;
    if (dirX) this.face = dirX;
    const tv = dirX * 125; b.velocity.x += (tv - b.velocity.x) * (ground ? 0.3 : 0.15);
    this.coyote = ground ? 6 : this.coyote - 1;
    if (pressed.jump) this.buf = 6; pressed.jump = false;
    if (this.buf-- > 0 && this.coyote > 0) { p.setVelocityY(-335); this.coyote = 0; this.buf = 0; sfx('jump'); this.fx('dust', p.x, b.bottom, { depth: 6 }); }
    if (ground && !this.wasGround && this.fallV > 200) this.fx('dust', p.x, b.bottom, { depth: 6 });
    this.wasGround = ground; this.fallV = b.velocity.y;
    if (!keys.jump && b.velocity.y < -120) p.setVelocityY(b.velocity.y * 0.85);
    this.cool -= k;
    if (pressed.attack && this.cool <= 0) {
      this.atk = 16; this.cool = 22; sfx('swing'); p.play('rostam-attack', true); this.hitDone = new Set();
      this.swingFx = this.fx('swing', p.x + this.face * 6, p.y - 2, { flip: this.face < 0, depth: 6 });
    }
    if (this.swingFx?.active) this.swingFx.setPosition(Math.round(p.x + this.face * 6), Math.round(p.y - 2));
    pressed.attack = false;
    if (this.atk > 0) {
      this.atk -= k;
      if (this.atk < 12 && this.atk > 3) {
        const box = this.strikeBox();
        const targets = [...this.foes.getChildren(), ...(this.lion && this.lion.active && this.lion.hp > 0 ? [this.lion] : [])];
        for (const f of targets) if (f.body.enable && !this.hitDone.has(f) && Phaser.Geom.Intersects.RectangleToRectangle(box, f.body)) { this.hitDone.add(f); this.damage(f); f.setVelocity(this.face * (f === this.lion ? 60 : 140), -120); }
      }
    }
    // thorns and pits
    const tile = this.layer.getTileAtWorldXY(p.x, b.bottom - 2);
    if (tile && tile.index === 3) { this.hurt(tile.pixelX + 8); p.setVelocityY(-300); }
    if (p.y > ROWS * TS + 60) { this.inv = 0; this.hurt(p.x); if (this.hp > 0) { p.setPosition(this.respawn.x, this.respawn.y - 30); p.setVelocity(0); this.inv = 80; } }
    // animation
    const anim = this.atk > 0 ? 'rostam-attack' : this.inv > 70 ? 'rostam-hurt' : !ground ? 'rostam-jump' : Math.abs(b.velocity.x) > 15 ? 'rostam-run' : 'rostam-idle';
    if (p.anims.currentAnim?.key !== anim && !(anim === 'rostam-attack' && p.anims.isPlaying)) p.play(anim);
    if (anim === 'rostam-jump') p.setFrame(b.velocity.y < 0 ? 0 : 1);
    p.setFlipX(this.face < 0);
    this.cam.setFollowOffset(-this.face * 30, 0);
    // foes
    for (const f of this.foes.getChildren()) {
      if (!f.body.enable) continue;
      if (f.kind === 'jackal') {
        const ahead = this.layer.getTileAtWorldXY(f.x + f.dir * 10, f.body.bottom + 4);
        if (f.body.blocked.left || f.body.blocked.right || (f.body.blocked.down && (!ahead || ahead.index === 3))) f.dir *= -1;
        f.setVelocityX(f.dir * 55); f.setFlipX(f.dir < 0);
      } else {
        f.hopT -= k; f.dir = Math.sign(p.x - f.x) || 1; f.setFlipX(f.dir < 0);
        if (f.body.blocked.down) { f.setVelocityX(0); if (f.hopT <= 0 && Math.abs(p.x - f.x) < 200) { f.setVelocity(f.dir * 70, -230); f.hopT = 70; } }
      }
      if (Phaser.Geom.Intersects.RectangleToRectangle(b, f.body)) {
        if (b.velocity.y > 60 && b.bottom - f.body.top < 12) { this.damage(f, 2); p.setVelocityY(keys.jump ? -330 : -230); }
        else this.hurt(f.x);
      }
    }
    // checkpoint
    for (const a of this.altars) if (!a.lit && p.x > a.x) {
      a.lit = true; this.respawn = { x: a.x, y: a.y }; sfx('fire');
      const g = this.add.image(a.x, a.y - 22, 'glow').setDepth(1).setScale(2).setBlendMode(Phaser.BlendModes.ADD);
      this.tweens.add({ targets: g, alpha: 0.6, yoyo: true, repeat: -1, duration: 700, ease: 'Sine.easeInOut' });
      this.fx('fire', a.x, a.y - 20, { depth: 3 }); this.fx('pickup', a.x, a.y - 18);
      toast('The sacred fire is lit. Rostam will return here if he falls.');
    }
    // boss
    if (!this.bossOn && p.x > 88 * TS) this.startBoss();
    if (this.lion && this.lion.active && this.lion.hp > 0) {
      this.lionAI(); this.bossBar();
      const lb = this.lion.body;
      if (Phaser.Geom.Intersects.RectangleToRectangle(b, lb)) {
        if (b.velocity.y > 60 && b.bottom - lb.top < 14) { this.damage(this.lion); p.setVelocityY(-320); }
        else this.hurt(this.lion.x);
      }
    }
  }
}

function begin() {
  audio(); ['s-title', 's-win', 's-dead', 's-pause'].forEach(id => $(id).classList.add('hidden'));
  $('touch').classList.toggle('hidden', !touch); $('boss').classList.add('hidden');
  const sc = game.scene.getScene('play');
  if (paused) { paused = false; game.scene.resume('play'); }
  if (sc.done || sc.started) sc.scene.restart();
  sc.started = true; playing = true; music(true); document.body.classList.add('playing');
}
let paused = false;
function setPaused(on) {
  if (on === paused) return;
  paused = on; playing = !on;
  for (const k in keys) keys[k] = false;
  if (on) game.scene.pause('play'); else game.scene.resume('play');
  $('s-pause').classList.toggle('hidden', !on); music(!on);
  if (on) $('resumeBtn').focus();
}
// a short line at the bottom of the screen
let toastT = 0;
function toast(msg) { const t = $('toast'); t.textContent = msg; t.classList.add('on'); clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('on'), 3200); }
function banner() { const b = $('banner'); b.classList.remove('on'); void b.offsetWidth; b.classList.add('on'); }
// the tale, paged like a manuscript
const pages = [...$('tale').content.querySelectorAll('article')];
let pg = 0, storyFrom = null;
function showPage(i) {
  pg = Phaser.Math.Clamp(i, 0, pages.length - 1);
  $('leaf').replaceChildren(pages[pg].cloneNode(true)); $('leaf').scrollTop = 0;
  $('dots').innerHTML = pages.map((_, k) => `<i class="${k === pg ? 'on' : ''}"></i>`).join('');
  $('prevPg').disabled = pg === 0; $('nextPg').textContent = pg === pages.length - 1 ? 'Close' : 'Next \u2192';
}
const turn = d => (pg === pages.length - 1 && d > 0 ? closeStory() : showPage(pg + d));
function openStory(i = 0) {
  if (playing) setPaused(true);
  storyFrom = document.querySelector('.ov:not(.hidden):not(#s-story)');
  storyFrom?.classList.add('hidden'); $('s-story').classList.remove('hidden'); showPage(i); $('nextPg').focus();
}
function closeStory() { $('s-story').classList.add('hidden'); (storyFrom || $('s-title')).classList.remove('hidden'); storyFrom?.querySelector('.btn')?.focus(); }
document.querySelectorAll('[data-story]').forEach(b => b.onclick = () => openStory(+b.dataset.story || 0));
$('prevPg').onclick = () => turn(-1); $('nextPg').onclick = () => turn(1); $('storyClose').onclick = closeStory;
$('pauseBtn').onclick = () => setPaused(true); $('resumeBtn').onclick = () => setPaused(false);
$('restartBtn').onclick = () => { const sc = game.scene.getScene('play'); sc.done = true; begin(); };
addEventListener('blur', () => { if (playing) setPaused(true); });
const TIPS = ['The lion charges in a straight line. Step aside, or leap over it, and strike while it is dazed.',
  'Land on a foe from above to strike it twice as hard.', 'Roast lamb restores a heart. Look for it on the high ledges.',
  'Light the fire altars: if Rostam falls, he returns to the last sacred fire.', 'The blue Divs hop toward you. Strike as they land.'];
game = new Phaser.Game({
  type: Phaser.AUTO, parent: 'game', width: W, height: H, pixelArt: true, backgroundColor: '#14286b',
  scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
  physics: { default: 'arcade', arcade: { gravity: { y: 900 }, debug: location.hash === '#physics' } },
  scene: [Play]
});
$('playBtn').onclick = begin; $('againBtn').onclick = begin; $('retryBtn').onclick = begin;
$('muteBtn').onclick = () => { audio(); setMuted(!A.muted); };
setMuted(A.muted);
if (location.hash === '#debug') window.__sh = { game, scene: () => game.scene.getScene('play'), keys, pressed, setPaused, openStory };
})();
