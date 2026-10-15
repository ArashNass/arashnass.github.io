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
  // parallax layers in the spirit of Persian miniatures
  const layer = (key, h, draw) => { if (T.exists(key)) return; const [c, x] = canvas(512, h); draw(x); T.addCanvas(key, c); };
  layer('bg-sky', H, x => {
    const g = x.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#14286b'); g.addColorStop(0.55, '#2f5fb8'); g.addColorStop(1, '#a8dcd4');
    x.fillStyle = g; x.fillRect(0, 0, 512, H);
    x.fillStyle = 'rgba(255,240,190,.9)'; for (let i = 0; i < 26; i++) x.fillRect((i * 97) % 512, (i * 53) % 90, 1, 1);
    const cloud = (cx, cy, s) => {
      x.strokeStyle = '#e8c25a'; x.fillStyle = '#f6efd8'; x.lineWidth = 1.5;
      for (const [dx, dy, r] of [[0, 0, 7], [9, -4, 8], [19, 0, 7], [27, 3, 5], [-8, 3, 5]]) { x.beginPath(); x.arc(cx + dx * s, cy + dy * s, r * s, 0, 7); x.fill(); x.stroke(); }
      x.beginPath(); x.arc(cx + 30 * s, cy - 2 * s, 4 * s, 0.5, 5); x.stroke(); x.beginPath(); x.arc(cx - 12 * s, cy, 3 * s, 2, 6.5); x.stroke();
    };
    for (const xx of [0, 512]) { cloud(60 + xx - 512 * (xx > 0), 50, 1); cloud(250 - (xx ? 512 : 0), 30, 0.8); cloud(410 - (xx ? 512 : 0), 70, 1.1); }
    x.fillStyle = '#f6dc8c'; x.beginPath(); x.arc(380, 40, 16, 0, 7); x.fill(); x.strokeStyle = '#e8c25a'; x.lineWidth = 2;
    for (let k = 0; k < 12; k++) { const a = k * Math.PI / 6; x.beginPath(); x.moveTo(380 + Math.cos(a) * 19, 40 + Math.sin(a) * 19); x.lineTo(380 + Math.cos(a) * 25, 40 + Math.sin(a) * 25); x.stroke(); }
  });
  layer('bg-rocks', H, x => {
    const cols = ['#c9a6d9', '#e8a9b8', '#a99ad6', '#d9b48a'];
    for (let k = 0; k < 9; k++) {
      const bx = k * 64 - 20, top = 120 + (k * 37) % 50, col = cols[k % 4];
      for (const off of [0, 512]) {
        x.fillStyle = col; x.strokeStyle = '#5a3a6a'; x.lineWidth = 1.5;
        x.beginPath(); x.moveTo(bx + off - 512, H); x.lineTo(bx + off - 512, top + 30);
        for (let j = 0; j <= 6; j++) x.quadraticCurveTo(bx + off - 512 + j * 13 - 6, top - 10 - (j % 2) * 14, bx + off - 512 + j * 13, top + (j % 3) * 6);
        x.lineTo(bx + off - 512 + 80, H); x.closePath(); x.fill(); x.stroke();
        x.strokeStyle = 'rgba(90,58,106,.45)'; for (let j = 1; j < 4; j++) { x.beginPath(); x.arc(bx + off - 512 + 20 + j * 14, top + 26 + j * 8, 8, 3.4, 6); x.stroke(); }
      }
    }
  });
  layer('bg-hills', H, x => {
    x.fillStyle = '#7fae5a'; x.strokeStyle = '#3a5a2a'; x.lineWidth = 1.5;
    x.beginPath(); x.moveTo(0, H); for (let i = 0; i <= 512; i += 8) x.lineTo(i, 196 + Math.sin(i / 512 * Math.PI * 4) * 10 + Math.sin(i / 512 * Math.PI * 10) * 4); x.lineTo(512, H); x.closePath(); x.fill(); x.stroke();
    for (let k = 0; k < 10; k++) {
      const cx = (k * 53 + 20) % 512, base = 198 + Math.sin(cx / 512 * Math.PI * 4) * 10;
      if (k % 3 === 0) { x.fillStyle = '#e8a9b8'; x.beginPath(); x.arc(cx, base - 16, 10, 0, 7); x.fill(); x.fillStyle = '#fff'; for (let j = 0; j < 6; j++) x.fillRect(cx - 7 + (j * 5) % 14, base - 22 + (j * 3) % 12, 1, 1); x.fillStyle = '#5a3418'; x.fillRect(cx - 1, base - 8, 2, 8); }
      else { x.fillStyle = '#2f5a3a'; x.beginPath(); x.ellipse(cx, base - 20, 4, 20, 0, 0, 7); x.fill(); x.strokeStyle = '#1a3a22'; x.stroke(); }
    }
  });
  layer('bg-reeds', H, x => {
    for (let i = 0; i < 90; i++) {
      const rx = (i * 41) % 512, h = 30 + (i * 17) % 40, lean = ((i * 13) % 9 - 4) * 0.8;
      x.strokeStyle = i % 2 ? '#8a9a3a' : '#a8b04a'; x.lineWidth = 1.5;
      x.beginPath(); x.moveTo(rx, H); x.quadraticCurveTo(rx + lean, H - h / 2, rx + lean * 2, H - h); x.stroke();
      if (i % 3 === 0) { x.fillStyle = '#7a5a2a'; x.fillRect(rx + lean * 2 - 1, H - h - 5, 3, 7); }
    }
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
const music = on => { clearInterval(A.timer); A.timer = null; if (on && !A.muted && audio()) { A.next = A.ctx.currentTime + 0.05; A.timer = setInterval(musicTick, 60); } };
function setMuted(m) {
  A.muted = m; store.set('sh-muted', m ? '1' : '0'); if (A.master) A.master.gain.value = m ? 0 : 0.5;
  $('muteIco').setAttribute('d', m ? 'M4 9v6h4l5 4V5L8 9z M17 9l5 6 M22 9l-5 6' : 'M4 9v6h4l5 4V5L8 9z M16 9a4 4 0 0 1 0 6 M19 6a8 8 0 0 1 0 12');
  music(!m && game && game.scene.isActive('play') && playing);
}

/* ---------------------------- input ---------------------------- */
const keys = { left: false, right: false, jump: false, attack: false }, pressed = { jump: false, attack: false };
const KEYMAP = { ArrowLeft: 'left', a: 'left', A: 'left', ArrowRight: 'right', d: 'right', D: 'right', ArrowUp: 'jump', w: 'jump', W: 'jump', ' ': 'jump', z: 'jump', Z: 'jump', x: 'attack', X: 'attack', j: 'attack', J: 'attack', k: 'attack', K: 'attack' };
const press = (k, down) => { if (down && !keys[k] && k in pressed) pressed[k] = true; keys[k] = down; };
addEventListener('keydown', e => { if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', ' '].includes(e.key)) e.preventDefault(); if (e.key === 'm' || e.key === 'M') return setMuted(!A.muted); if (e.key === 'Enter' && !playing) return begin(); const k = KEYMAP[e.key]; if (k) press(k, true); });
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
  preload() { for (const [k, f] of Object.entries(ART)) if (f) this.load.image(k, 'assets/' + f); }
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
    this.sky = this.add.tileSprite(0, 0, W, H, 'bg-sky').setOrigin(0).setScrollFactor(0);
    this.rocks = this.add.tileSprite(0, 0, W, H, 'bg-rocks').setOrigin(0).setScrollFactor(0);
    this.hills = this.add.tileSprite(0, 0, W, H, 'bg-hills').setOrigin(0).setScrollFactor(0);
    this.reeds = this.add.tileSprite(0, 0, W, H, 'bg-reeds').setOrigin(0).setScrollFactor(0);
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
      if (ch === 'c') this.coins.create(x, y - 8, 'coin-spin', 0).play('coin-spin');
      else if (ch === 'P') this.start = { x, y };
      else if (ch === 'j') this.spawnFoe('jackal', x, y);
      else if (ch === 'd') this.spawnFoe('div', x, y);
      else if (ch === 'F') { const a = this.add.sprite(x, y, 'altar-cold', 0).setOrigin(0.5, 1); a.lit = false; this.altars.push(a); }
      else if (ch === 'L') this.lionAt = { x, y };
    }));
    this.respawn = { ...this.start };
    this.player = this.physics.add.sprite(this.start.x, this.start.y - 30, 'rostam-idle', 0);
    this.fit(this.player, 'rostam');
    this.player.setDepth(5);
    this.physics.add.collider(this.player, this.layer);
    this.physics.add.collider(this.foes, this.layer);
    this.physics.add.overlap(this.player, this.coins, (pl, c) => { c.destroy(); this.coinCount++; $('coins').textContent = this.coinCount; sfx('coin'); this.sparkle(c.x, c.y, 0xf6dc8c); });
    this.lion = null;
    this.cam = this.cameras.main;
    this.cam.setBounds(0, 0, this.levelW, ROWS * TS);
    this.cam.startFollow(this.player, true, 0.12, 0.12);
    this.cam.setRoundPixels(true);
    this.hp = 5; this.coinCount = 0; this.face = 1; this.inv = 0; this.atk = 0; this.cool = 0; this.coyote = 0; this.buf = 0; this.bossOn = false; this.done = false; this.t0 = this.time.now;
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
  sparkle(x, y, tint) { this.parts.setParticleTint(tint); this.parts.explode(8, x, y); }
  renderHearts() { $('hearts').innerHTML = Array.from({ length: 5 }, (_, i) => `<span class="${i < this.hp ? '' : 'off'}">&#9829;</span>`).join(''); }
  hurt(fromX) {
    if (this.inv > 0 || this.done) return;
    this.hp--; this.renderHearts(); this.inv = 90; sfx('hurt'); this.cam.shake(160, 0.008); this.cam.flash(120, 180, 40, 60);
    this.player.setVelocity((this.player.x < fromX ? -1 : 1) * 160, -220);
    if (this.hp <= 0) { this.done = true; playing = false; music(false); this.player.setTint(0x777777); setTimeout(() => $('s-dead').classList.remove('hidden'), 900); }
  }
  strikeBox() { const p = this.player; return new Phaser.Geom.Rectangle(this.face > 0 ? p.body.right - 4 : p.body.left - 30, p.body.top - 6, 34, p.body.height + 8); }
  damage(f, n = 1) {
    f.hp -= n; f.setTintFill(0xffffff); this.time.delayedCall(80, () => f.active && f.clearTint());
    this.sparkle(f.x, f.y - 8, 0xffffff); sfx('hit'); this.cam.shake(80, 0.004);
    if (f.hp <= 0) {
      if (f === this.lion) return this.lionDown();
      this.tweens.add({ targets: f, alpha: 0, angle: 90 * (this.face), y: f.y - 10, duration: 260, onComplete: () => f.destroy() }); f.body.enable = false;
    }
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
    sfx('roar'); this.cam.shake(500, 0.006);
    $('boss').classList.remove('hidden'); this.bossBar();
  }
  bossBar() { $('bossHp').style.width = (this.lion.hp / this.lion.max * 100) + '%'; }
  lionAI() {
    const l = this.lion, p = this.player; if (!l || !l.active || l.hp <= 0) return;
    l.tm--; const toP = Math.sign(p.x - l.x) || 1;
    if (l.state === 'prowl') { l.setVelocityX(toP * 45); l.dir = toP; if (l.anims.currentAnim?.key !== 'lion-walk') l.play('lion-walk'); if (l.tm <= 0) { l.state = Math.random() < 0.6 ? 'roar' : 'pounce'; l.tm = 45; l.setVelocityX(0); if (l.state === 'roar') { l.play('lion-roar'); sfx('roar'); } } }
    else if (l.state === 'roar') { l.setVelocityX(0); if (l.tm <= 0) { l.state = 'charge'; l.dir = toP; l.tm = 110; l.play('lion-run'); } }
    else if (l.state === 'charge') { l.setVelocityX(l.dir * 230); if (l.body.blocked.left || l.body.blocked.right || l.tm <= 0) { l.state = 'stun'; l.tm = 70; l.setVelocityX(0); l.play('lion-walk'); l.anims.pause(); this.cam.shake(200, 0.01); } }
    else if (l.state === 'pounce') { if (l.tm === 44) { l.dir = toP; l.setVelocity(toP * 170, -330); l.play('lion-run'); } if (l.tm < 30 && l.body.blocked.down) { l.state = 'prowl'; l.tm = 70 + Math.random() * 40; l.setVelocityX(0); } }
    else if (l.state === 'stun') { if (l.tm % 10 === 0) this.sparkle(l.x, l.body.top - 4, 0xf6dc8c); if (l.tm <= 0) { l.anims.resume(); l.state = 'prowl'; l.tm = 80; } }
    l.setFlipX(l.dir < 0);
  }
  lionDown() {
    const l = this.lion; l.body.enable = false; l.anims.stop(); sfx('win');
    this.tweens.add({ targets: l, alpha: 0, duration: 1200, delay: 300 });
    $('boss').classList.add('hidden'); this.wall.destroy();
    const f = this.physics.add.staticImage(l.x, this.lionAt.y - 26, 'feather', 0).setDepth(6);
    this.tweens.add({ targets: f, y: f.y - 6, yoyo: true, repeat: -1, duration: 800, ease: 'Sine.easeInOut' });
    this.physics.add.overlap(this.player, f, () => this.win(f));
    this.cam.startFollow(this.player, true, 0.12, 0.12);
  }
  win(f) {
    if (this.done) return; this.done = true; playing = false; music(false); sfx('fire'); f.destroy();
    const s = Math.round((this.time.now - this.t0) / 1000);
    $('winMsg').textContent = `Rostam gathered ${this.coinCount} dinars and won a feather of the Simurgh in ${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}. The Burning Desert of the second labour awaits.`;
    setTimeout(() => $('s-win').classList.remove('hidden'), 600);
  }
  update(time, delta) {
    const k = delta / 16.67, p = this.player, b = p.body;
    this.sky.tilePositionX = this.cam.scrollX * 0.05; this.rocks.tilePositionX = this.cam.scrollX * 0.18;
    this.hills.tilePositionX = this.cam.scrollX * 0.4; this.reeds.tilePositionX = this.cam.scrollX * 0.7;
    if (!playing || this.done) { if (this.done && this.hp <= 0) p.setVelocityX(0); return; }
    this.inv = Math.max(0, this.inv - k); p.setAlpha(this.inv > 0 && Math.floor(this.inv / 5) % 2 ? 0.35 : 1);
    const dirX = (keys.right ? 1 : 0) - (keys.left ? 1 : 0), ground = b.blocked.down;
    if (dirX) this.face = dirX;
    const tv = dirX * 125; b.velocity.x += (tv - b.velocity.x) * (ground ? 0.3 : 0.15);
    this.coyote = ground ? 6 : this.coyote - 1;
    if (pressed.jump) this.buf = 6; pressed.jump = false;
    if (this.buf-- > 0 && this.coyote > 0) { p.setVelocityY(-335); this.coyote = 0; this.buf = 0; sfx('jump'); }
    if (!keys.jump && b.velocity.y < -120) p.setVelocityY(b.velocity.y * 0.85);
    this.cool -= k;
    if (pressed.attack && this.cool <= 0) { this.atk = 16; this.cool = 22; sfx('swing'); p.play('rostam-attack', true); this.hitDone = new Set(); }
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
    for (const a of this.altars) if (!a.lit && p.x > a.x) { a.lit = true; a.play('fire-burn'); this.respawn = { x: a.x, y: a.y }; sfx('fire'); this.sparkle(a.x, a.y - 20, 0xff8a2a); }
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
  audio(); ['s-title', 's-win', 's-dead'].forEach(id => $(id).classList.add('hidden'));
  $('touch').classList.toggle('hidden', !touch); $('boss').classList.add('hidden');
  const sc = game.scene.getScene('play');
  if (sc.done || sc.started) sc.scene.restart();
  sc.started = true; playing = true; music(true);
}
game = new Phaser.Game({
  type: Phaser.AUTO, parent: 'game', width: W, height: H, pixelArt: true, backgroundColor: '#14286b',
  scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
  physics: { default: 'arcade', arcade: { gravity: { y: 900 }, debug: location.hash === '#physics' } },
  scene: [Play]
});
$('playBtn').onclick = begin; $('againBtn').onclick = begin; $('retryBtn').onclick = begin;
$('muteBtn').onclick = () => { audio(); setMuted(!A.muted); };
setMuted(A.muted);
if (location.hash === '#debug') window.__sh = { game, scene: () => game.scene.getScene('play'), keys, pressed };
})();
