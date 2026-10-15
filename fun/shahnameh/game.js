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
  'jackal-run': 'jackal-run.png', 'div-hop': 'div-hop.png',
  // Khan II
  'scorpion-crawl': 'k2/scorpion-crawl.png', 'vulture-fly': 'k2/vulture-fly.png', 'ram-walk': 'k2/ram-walk.png', 'rostam-drink': 'rostam-drink.png',
  // Khan III
  'dragon-move': 'k3/dragon-move.png', 'dragon-fire': 'k3/dragon-fire.png', 'rakhsh-gallop': 'k3/rakhsh-gallop.png', 'rakhsh-rear': 'k3/rakhsh-rear.png', 'bat-fly': 'k3/bat-fly.png',
  // Khan IV
  'serpent': 'k4/serpent.png', 'hag-cast': 'k4/hag-cast.png', 'beauty-idle': 'k4/beauty-idle.png',
  // Khan V
  'spearman-walk': 'k5/spearman-walk.png', 'spearman-thrust': 'k5/spearman-thrust.png', 'olad-walk': 'k5/olad-walk.png', 'olad-slash': 'k5/olad-slash.png', 'olad-kneel': 'k5/olad-kneel.png',
  // Khan VI
  'divwarrior-walk': 'k6/divwarrior-walk.png', 'divwarrior-smash': 'k6/divwarrior-smash.png', 'arzhang-walk': 'k6/arzhang-walk.png', 'arzhang-smash': 'k6/arzhang-smash.png',
  // Khan VII
  'whitediv-walk': 'k7/whitediv-walk.png', 'whitediv-smash': 'k7/whitediv-smash.png', 'whitediv-throw': 'k7/whitediv-throw.png', 'kavus-sight': 'k7/kavus-sight.png'
};
const FPS = { 'rostam-idle': 5, 'rostam-run': 12, 'rostam-jump': 6, 'rostam-attack': 15, 'rostam-hurt': 6, 'lion-walk': 9, 'lion-run': 14, 'lion-roar': 6, 'jackal-run': 12, 'div-hop': 8, 'coin-spin': 8, 'fire-burn': 10,
  'scorpion-crawl': 10, 'vulture-fly': 10, 'ram-walk': 8, 'rostam-drink': 6,
  'dragon-move': 7, 'dragon-fire': 9, 'rakhsh-gallop': 12, 'rakhsh-rear': 9, 'bat-fly': 14,
  'serpent': 8, 'hag-cast': 10, 'beauty-idle': 4,
  'spearman-walk': 10, 'spearman-thrust': 12, 'olad-walk': 10, 'olad-slash': 14, 'olad-kneel': 6,
  'divwarrior-walk': 8, 'divwarrior-smash': 10, 'arzhang-walk': 7, 'arzhang-smash': 9,
  'whitediv-walk': 6, 'whitediv-smash': 11, 'whitediv-throw': 10, 'kavus-sight': 4 };
// on-screen frame height in game pixels; equal to the PixelLab frame size so sprites draw 1:1
const SIZE = { rostam: 80, lion: 100, jackal: 58, div: 64, scorpion: 72, vulture: 72, ram: 64, dragon: 136, rakhsh: 104, bat: 72, serpent: 72, hag: 72, beauty: 64, spearman: 80, olad: 72, divwarrior: 104, arzhang: 136, whitediv: 136 };
const BODY = { rostam: [0.2, 0.55], lion: [0.48, 0.3], jackal: [0.48, 0.31], div: [0.34, 0.52], scorpion: [0.5, 0.28], vulture: [0.42, 0.26], ram: [0.5, 0.5],
  dragon: [0.46, 0.42], rakhsh: [0.5, 0.5], bat: [0.36, 0.22], serpent: [0.4, 0.4], hag: [0.4, 0.62], beauty: [0.34, 0.8], spearman: [0.2, 0.68], olad: [0.26, 0.76], divwarrior: [0.3, 0.62], arzhang: [0.3, 0.7], whitediv: [0.4, 0.58] };
const V = 15;   // bump to bust caches when assets change

// PixelLab VFX strips in ./assets/fx: frame size, frame count, fps, and the effect's origin as a fraction of the frame
const FX = {
  hit: { w: 67, h: 49, n: 8, fps: 16, ox: 0.493, oy: 0.469 }, swing: { w: 61, h: 57, n: 9, fps: 30, ox: 0.443, oy: 0.596 },
  dust: { w: 53, h: 29, n: 8, fps: 16, ox: 0.491, oy: 0.448 }, pickup: { w: 43, h: 49, n: 10, fps: 18, ox: 0.488, oy: 0.653 },
  poof: { w: 56, h: 45, n: 10, fps: 14, ox: 0.536, oy: 0.6 }, heal: { w: 36, h: 60, n: 12, fps: 14, ox: 0.5, oy: 0.7 },
  stun: { w: 39, h: 23, n: 12, fps: 12, ox: 0.487, oy: 0.652, loop: true }, fire: { w: 27, h: 27, n: 12, fps: 12, ox: 0.481, oy: 0.815, loop: true },
  fireflies: { w: 172, h: 141, n: 16, fps: 8, ox: 0.483, oy: 0.418, loop: true }, glow: { w: 53, h: 79, n: 12, fps: 10, ox: 0.491, oy: 0.506, loop: true },
  liondust: { w: 79, h: 70, n: 16, fps: 14, ox: 0.43, oy: 0.957 },
  splash: { w: 70, h: 56, n: 10, fps: 14, ox: 0.5, oy: 0.5 }, beam: { w: 72, h: 122, n: 12, fps: 12, ox: 0.5, oy: 0.869 },
  breath: { w: 128, h: 59, n: 8, fps: 12, ox: 0.07, oy: 0.492, loop: true }, orb: { w: 54, h: 25, n: 8, fps: 12, ox: 0.759, oy: 0.48, loop: true },
  bolt: { w: 136, h: 216, n: 9, fps: 14, ox: 0.5, oy: 0.829 }
};
// provisions on the road to Mazandaran; 'lamb' is a roast leg that restores a heart
const FOOD = ['lamb', 'pomegranate', 'naan', 'grapes'];
// Khan II props, 27px cells: water skin, water jug, dates, flask
const PROPS = ['skin', 'jug', 'dates', 'flask'];

// which labour is being played, and how far the player has come (saved)
const LABOURS = 7;
let cur = Math.min(LABOURS, Math.max(1, +(store.get('sh-cur') || 1)));
const unlocked = () => Math.min(LABOURS, Math.max(1, +(store.get('sh-unlocked') || 1)));
const ROMAN = ['', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII'];

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

// Khan II: the burning desert. 'w' water skin  'O' well (checkpoint, refills water)  's' scorpion  'v' vulture  'R' the ram's trigger  'S' the spring
function map2() {
  const C = 168, g = Array.from({ length: ROWS }, () => Array(C).fill('.'));
  const ground = (a, b, top) => { for (let c = a; c <= b; c++) for (let r = top; r < ROWS; r++) g[r][c] = '#'; };
  const put = (c, r, ch) => { g[r][c] = ch; };
  const row = (a, b, r, ch) => { for (let c = a; c <= b; c++) g[r][c] = ch; };
  const pit = (a, b) => { ground(a, b, 16); row(a, b, 15, '^'); };
  ground(0, 18, 14); ground(19, 25, 13); ground(26, 30, 12); ground(31, 35, 13); pit(36, 39); ground(40, 52, 14);
  row(43, 46, 10, '='); ground(53, 59, 13); ground(60, 64, 14); pit(65, 70); row(66, 69, 11, '=');
  ground(71, 85, 14); ground(76, 79, 11); ground(86, 91, 13); ground(92, 97, 12); pit(98, 103); row(99, 102, 10, '=');
  ground(104, 113, 14); ground(114, 118, 13); ground(119, 167, 14); ground(124, 127, 13); ground(141, 144, 13);
  put(3, 13, 'P');
  [[23, 11], [44, 9], [100, 9], [116, 11], [132, 12]].forEach(([c, r]) => put(c, r, 'w'));
  [[9, 12], [11, 11], [13, 12], [28, 10], [29, 10], [47, 12], [57, 11], [74, 12], [77, 9], [78, 9], [89, 11], [94, 10], [109, 12], [121, 12], [138, 12]].forEach(([c, r]) => put(c, r, 'c'));
  put(15, 13, 'j'); put(31, 12, 's'); put(48, 13, 's'); put(38, 7, 'v'); put(62, 13, 'j'); put(68, 6, 'v'); put(81, 13, 's');
  put(90, 12, 's'); put(101, 6, 'v'); put(110, 13, 's'); put(125, 12, 's'); put(130, 7, 'v'); put(136, 13, 's'); put(146, 13, 's');
  put(57, 12, 'O'); put(107, 13, 'O');
  put(128, 13, 'R'); put(158, 13, 'S');
  return g;
}

// Khan III: the dragon's night. 'b' bat  'm' marsh light  'K' where Rakhsh stands  'D' the dragon's lair
function map3() {
  const C = 156, g = Array.from({ length: ROWS }, () => Array(C).fill('.'));
  const ground = (a, b, top) => { for (let c = a; c <= b; c++) for (let r = top; r < ROWS; r++) g[r][c] = '#'; };
  const put = (c, r, ch) => { g[r][c] = ch; };
  const row = (a, b, r, ch) => { for (let c = a; c <= b; c++) g[r][c] = ch; };
  const pit = (a, b) => { ground(a, b, 16); row(a, b, 15, '^'); };
  ground(0, 16, 14); ground(17, 21, 12); ground(22, 26, 13); pit(27, 31); row(28, 30, 10, '='); ground(32, 44, 14);
  ground(45, 49, 12); ground(50, 56, 14); pit(57, 63); row(58, 59, 11, '='); row(61, 62, 9, '='); ground(64, 76, 14);
  ground(77, 80, 11); ground(81, 92, 14); pit(93, 97); row(94, 96, 10, '='); ground(98, 155, 14); ground(104, 107, 12);
  put(3, 13, 'P');
  [[8, 12], [19, 10], [29, 8], [38, 12], [47, 10], [61, 7], [70, 12], [79, 9], [86, 12], [95, 8], [102, 12]].forEach(([c, r]) => put(c, r, 'c'));
  put(13, 13, 'j'); put(24, 7, 'b'); put(36, 13, 'j'); put(53, 8, 'b'); put(60, 6, 'b'); put(68, 13, 'j'); put(74, 8, 'b');
  put(85, 13, 'j'); put(95, 6, 'b'); put(101, 7, 'b');
  [[11, 11], [33, 10], [52, 9], [66, 10], [88, 9], [109, 10]].forEach(([c, r]) => put(c, r, 'm'));
  put(42, 13, 'F'); put(84, 13, 'F');
  put(117, 13, 'K'); put(146, 13, 'D');
  return g;
}

// Khan IV: the witch's garden. 'n' serpent  'l' lantern  'T' the feast  'W' the witch
function map4() {
  const C = 150, g = Array.from({ length: ROWS }, () => Array(C).fill('.'));
  const ground = (a, b, top) => { for (let c = a; c <= b; c++) for (let r = top; r < ROWS; r++) g[r][c] = '#'; };
  const put = (c, r, ch) => { g[r][c] = ch; };
  const row = (a, b, r, ch) => { for (let c = a; c <= b; c++) g[r][c] = ch; };
  const pit = (a, b) => { ground(a, b, 16); row(a, b, 15, '^'); };
  ground(0, 20, 14); row(8, 12, 10, '='); ground(21, 24, 12); ground(25, 34, 14); pit(35, 39); row(36, 38, 11, '=');
  ground(40, 52, 14); row(44, 47, 10, '='); ground(53, 57, 12); ground(58, 66, 14); pit(67, 72); row(68, 69, 10, '='); row(71, 72, 9, '=');
  ground(73, 86, 14); ground(80, 83, 12); pit(87, 90); ground(91, 149, 14); row(96, 100, 10, '=');
  put(3, 13, 'P');
  [[10, 9], [11, 9], [22, 10], [30, 12], [37, 10], [45, 9], [46, 9], [55, 10], [62, 12], [69, 9], [72, 8], [81, 10], [94, 12], [98, 9]].forEach(([c, r]) => put(c, r, 'c'));
  put(16, 13, 'n'); put(29, 13, 'n'); put(38, 7, 'b'); put(50, 13, 'n'); put(63, 13, 'n'); put(70, 6, 'b'); put(77, 13, 'n'); put(85, 13, 'n'); put(95, 7, 'b'); put(104, 13, 'n');
  [[6, 11], [18, 11], [31, 11], [43, 11], [60, 11], [76, 11], [92, 11], [108, 11], [116, 11], [132, 11], [146, 11]].forEach(([c, r]) => put(c, r, 'l'));
  put(48, 13, 'F'); put(92, 13, 'F');
  put(120, 13, 'T'); put(128, 13, 'W');
  return g;
}

// Khan V: the green land of Mazandaran. 'q' spearman  'O' Olad
function map5() {
  const C = 150, g = Array.from({ length: ROWS }, () => Array(C).fill('.'));
  const ground = (a, b, top) => { for (let c = a; c <= b; c++) for (let r = top; r < ROWS; r++) g[r][c] = '#'; };
  const put = (c, r, ch) => { g[r][c] = ch; };
  const row = (a, b, r, ch) => { for (let c = a; c <= b; c++) g[r][c] = ch; };
  const pit = (a, b) => { ground(a, b, 16); row(a, b, 15, '^'); };
  ground(0, 22, 14); ground(23, 27, 13); ground(28, 31, 12); ground(32, 44, 14); pit(45, 49); row(46, 48, 10, '=');
  ground(50, 62, 14); row(54, 58, 10, '='); ground(63, 66, 12); ground(67, 78, 14); pit(79, 84); row(80, 81, 11, '='); row(83, 84, 9, '=');
  ground(85, 98, 14); ground(92, 95, 12); ground(99, 149, 14); row(102, 106, 10, '=');
  put(3, 13, 'P');
  [[9, 12], [10, 12], [25, 11], [30, 10], [40, 12], [47, 9], [56, 9], [57, 9], [65, 10], [73, 12], [84, 8], [90, 12], [94, 10], [104, 9]].forEach(([c, r]) => put(c, r, 'c'));
  put(14, 13, 'q'); put(36, 13, 'q'); put(42, 13, 'j'); put(60, 13, 'q'); put(71, 13, 'q'); put(76, 13, 'j'); put(88, 13, 'q'); put(97, 13, 'q'); put(108, 13, 'q');
  put(52, 13, 'F'); put(100, 13, 'F');
  put(130, 13, 'O');
  return g;
}

// Khan VI: the camp of Arzhang Div. 'w' Div warrior  'h' the horde's killing ground  'B' bonfire  'A' Arzhang
function map6() {
  const C = 160, g = Array.from({ length: ROWS }, () => Array(C).fill('.'));
  const ground = (a, b, top) => { for (let c = a; c <= b; c++) for (let r = top; r < ROWS; r++) g[r][c] = '#'; };
  const put = (c, r, ch) => { g[r][c] = ch; };
  const row = (a, b, r, ch) => { for (let c = a; c <= b; c++) g[r][c] = ch; };
  const pit = (a, b) => { ground(a, b, 16); row(a, b, 15, '^'); };
  ground(0, 20, 14); ground(21, 24, 12); ground(25, 36, 14); pit(37, 41); row(38, 40, 10, '='); ground(42, 54, 14);
  ground(55, 88, 14); row(62, 66, 10, '='); row(76, 80, 10, '=');
  ground(89, 92, 12); pit(93, 98); row(94, 95, 10, '='); row(97, 98, 9, '='); ground(99, 159, 14); ground(105, 108, 12);
  put(3, 13, 'P');
  [[9, 12], [22, 10], [23, 10], [32, 12], [39, 8], [48, 12], [64, 9], [78, 9], [90, 10], [97, 7], [104, 12]].forEach(([c, r]) => put(c, r, 'c'));
  put(15, 13, 'd'); put(30, 13, 'w'); put(46, 13, 'd'); put(52, 13, 'w'); put(96, 6, 'b'); put(102, 13, 'w'); put(110, 13, 'd');
  [[6, 13], [27, 13], [50, 13], [58, 13], [86, 13], [101, 13], [118, 13], [140, 13]].forEach(([c, r]) => put(c, r, 'B'));
  put(44, 13, 'F'); put(100, 13, 'F');
  put(72, 13, 'h'); put(140, 13, 'A');
  return g;
}

// Khan VII: the seven mountains and the White Div's cave. Columns from CAVE7 on are inside the cave.
// 'k' Kay Kavus in chains  'X' the White Div
const CAVE7 = 120;
// the row a thing can stand on in a map column (or the nearest column that has ground): for fires and hearts
function topAt(map, c) {
  const solid = ch => ch === '#' || ch === '=';
  for (const dc of [0, 1, -1, 2, -2, 3, -3]) { const k = c + dc; for (let r = 1; r < map.length; r++) if (map[r][k] && solid(map[r][k]) && !solid(map[r - 1][k])) return r; }
  return null;
}
function map7() {
  const C = 200, g = Array.from({ length: ROWS }, () => Array(C).fill('.'));
  const ground = (a, b, top) => { for (let c = a; c <= b; c++) for (let r = top; r < ROWS; r++) g[r][c] = '#'; };
  const put = (c, r, ch) => { g[r][c] = ch; };
  const row = (a, b, r, ch) => { for (let c = a; c <= b; c++) g[r][c] = ch; };
  const pit = (a, b) => { ground(a, b, 16); row(a, b, 15, '^'); };
  ground(0, 18, 14); ground(19, 22, 12); ground(23, 26, 10); ground(27, 34, 13); pit(35, 40); row(36, 37, 10, '='); row(39, 40, 9, '=');
  ground(41, 52, 13); ground(53, 56, 11); ground(57, 66, 14); pit(67, 71); row(68, 70, 11, '='); ground(72, 84, 13); ground(85, 88, 11);
  ground(89, 98, 14); pit(99, 104); row(100, 101, 10, '='); row(103, 104, 9, '='); ground(105, 199, 14); ground(110, 113, 12);
  ground(126, 129, 12); pit(133, 136); row(134, 135, 11, '=');
  put(3, 13, 'P');
  [[10, 12], [24, 8], [25, 8], [31, 11], [38, 8], [47, 11], [55, 9], [62, 12], [69, 9], [79, 11], [87, 9], [94, 12], [102, 7], [116, 12], [128, 10], [140, 12]].forEach(([c, r]) => put(c, r, 'c'));
  put(14, 13, 'd'); put(30, 12, 'w'); put(37, 7, 'b'); put(48, 12, 'd'); put(61, 13, 'w'); put(70, 7, 'b'); put(78, 12, 'w'); put(92, 13, 'd'); put(101, 6, 'b');
  put(108, 13, 'w'); put(124, 8, 'b'); put(131, 8, 'b'); put(139, 13, 'w');
  put(44, 12, 'F'); put(96, 13, 'F'); put(143, 13, 'F');
  put(176, 13, 'X'); put(193, 13, 'k');
  return g;
}

/* ----------------------------- foes ----------------------------- */
// walking foes turn at walls and at the edge of a drop or thorns
function patrol(s, f, speed) {
  const ahead = s.layer.getTileAtWorldXY(f.x + f.dir * 12, f.body.bottom + 4);
  if (f.body.blocked.left || f.body.blocked.right || (f.body.blocked.down && (!ahead || ahead.index % 4 === 3))) f.dir *= -1;
  f.setVelocityX(f.dir * speed); f.setFlipX(f.dir < 0);
}
const FOES = {
  jackal: { tex: 'jackal-run', hp: 1, init: (s, f) => f.setVelocityX(-55), tick: (s, f) => patrol(s, f, 55) },
  div: {
    tex: 'div-hop', hp: 2,
    tick(s, f, k, p) {
      f.hopT -= k; f.dir = Math.sign(p.x - f.x) || 1; f.setFlipX(f.dir < 0);
      if (f.body.blocked.down) { f.setVelocityX(0); if (f.hopT <= 0 && Math.abs(p.x - f.x) < 200) { f.setVelocity(f.dir * 70, -230); f.hopT = 70; } }
    }
  },
  // scorpions creep, then scuttle at Rostam when he comes close on the same level
  scorpion: {
    tex: 'scorpion-crawl', hp: 2,
    tick(s, f, k, p) {
      const near = Math.abs(p.x - f.x) < 130 && Math.abs(p.body.bottom - f.body.bottom) < 24;
      if (near && f.body.blocked.down) { const d = Math.sign(p.x - f.x) || 1; const ahead = s.layer.getTileAtWorldXY(f.x + d * 12, f.body.bottom + 4); if (ahead && ahead.index % 4 !== 3) { f.dir = d; f.setVelocityX(d * 78); f.setFlipX(d < 0); f.anims.timeScale = 1.8; return; } }
      f.anims.timeScale = 1; patrol(s, f, 28);
    }
  },
  // Div warriors stomp about and smash their clubs into the ground when Rostam comes close
  divwarrior: {
    tex: 'divwarrior-walk', hp: 3,
    tick(s, f, k, p) {
      f.cool = (f.cool || 0) - k;
      if (f.smash) { f.setVelocityX(0); return; }
      const d = p.x - f.x;
      if (f.cool <= 0 && Math.abs(d) < 90 && Math.abs(p.body.bottom - f.body.bottom) < 30 && f.body.blocked.down) {
        f.smash = true; f.dir = Math.sign(d) || 1; f.setFlipX(f.dir < 0); f.setVelocityX(0); f.play('divwarrior-smash');
        s.time.delayedCall(420, () => { if (!f.active || !f.body.enable) return; s.hazard(f.dir > 0 ? f.x + 8 : f.x - 48, f.body.top + 20, 40, 30, 160); s.fx('dust', f.x + f.dir * 30, f.body.bottom, { depth: 8 }); s.cam.shake(120, 0.006); sfx('hit'); });
        f.once('animationcomplete', () => { if (!f.active) return; f.smash = false; f.cool = 90; f.play('divwarrior-walk'); });
        return;
      }
      if (Math.abs(d) < 200 && f.body.blocked.down) { f.dir = Math.sign(d) || 1; f.setVelocityX(f.dir * 38); f.setFlipX(f.dir < 0); } else patrol(s, f, 26);
    }
  },
  // Olad's spearmen march, and thrust when Rostam comes within reach
  spearman: {
    tex: 'spearman-walk', hp: 2,
    tick(s, f, k, p) {
      f.cool = (f.cool || 0) - k;
      if (f.thrust) { f.setVelocityX(0); return; }
      const d = p.x - f.x;
      if (f.cool <= 0 && Math.abs(d) < 84 && Math.abs(p.body.bottom - f.body.bottom) < 24) {
        f.thrust = true; f.dir = Math.sign(d) || 1; f.setFlipX(f.dir < 0); f.setVelocityX(0); f.play('spearman-thrust'); sfx('swing');
        s.time.delayedCall(180, () => { if (f.active && f.body.enable) s.hazard(f.dir > 0 ? f.x + 6 : f.x - 50, f.body.top + 12, 44, 12, 160); });
        f.once('animationcomplete', () => { if (!f.active) return; f.thrust = false; f.cool = 70; f.play('spearman-walk'); });
        return;
      }
      patrol(s, f, 34);
    }
  },
  serpent: {
    tex: 'serpent', hp: 2,
    tick(s, f, k, p) {
      const d = p.x - f.x; f.setFlipX(d < 0); f.cool = (f.cool || 0) - k;
      if (f.cool <= 0 && Math.abs(d) < 70 && Math.abs(p.body.bottom - f.body.bottom) < 30 && f.body.blocked.down) { f.setVelocity(Math.sign(d) * 150, -120); f.cool = 90; sfx('swing'); }
      else if (f.body.blocked.down) f.setVelocityX(0);
    }
  },
  // vultures circle over their patch of sky, then fold their wings and dive at Rostam; bats do the same, faster
  vulture: flyer('vulture-fly', { range: 70, dive: 220, rest: 120, offY: 22 }),
  bat: flyer('bat-fly', { range: 46, dive: 270, rest: 70, offY: 24, speed: 0.022 })
};
function flyer(tex, { range, dive, rest, offY, speed = 0.012 }) {
  return {
    tex, hp: 1,
    init(s, f) { f.body.setAllowGravity(false); f.body.setOffset(f.body.offset.x, offY); f.t = Math.random() * 6; f.state = 'circle'; f.cool = 60 + Math.random() * 60; },
    tick(s, f, k, p) {
      f.t += speed * k; f.cool -= k;
      if (f.state === 'circle') {
        const tx = f.home.x + Math.sin(f.t) * range, ty = f.home.y + Math.sin(f.t * 2) * 10;
        f.setVelocity((tx - f.x) * 2.2, (ty - f.y) * 2.2); f.setFlipX(Math.cos(f.t) < 0);
        if (f.cool <= 0 && Math.abs(p.x - f.x) < 170 && p.y > f.y) {
          f.state = 'dive'; f.tm = 46; const a = Math.atan2(p.y - 6 - f.y, p.x - f.x);
          f.setVelocity(Math.cos(a) * dive, Math.sin(a) * dive); f.setFlipX(Math.cos(a) < 0); f.anims.timeScale = 0.4; sfx('swing');
        }
      } else if (f.state === 'dive') { if ((f.tm -= k) <= 0 || f.body.blocked.down) { f.state = 'rise'; f.anims.timeScale = 1.4; } }
      else { f.setVelocity((f.home.x - f.x) * 1.5, (f.home.y - f.y) * 1.8); if (Math.abs(f.y - f.home.y) < 8) { f.state = 'circle'; f.cool = rest + Math.random() * 80; f.anims.timeScale = 1; f.t = Math.asin(Phaser.Math.Clamp((f.x - f.home.x) / range, -1, 1)); } }
    }
  };
}

/* --------------------------- labours --------------------------- */
// Each labour: its map, its backdrop and how the backdrop scrolls, what 'c' becomes, extra map
// characters, and hooks that run on create and every frame. Shared systems live in the scene.
const LEVELS = {
  1: {
    hud: 'Khan I &middot; The Lion', winTitle: 'The lion is slain', name: 'The Lion of the Reeds', fa: 'شیرِ نیستان', tiles: 'tiles-1', map: buildMap,
    load(L, q) {
      L.image('tiles-1', 'assets/tiles.png' + q);
      L.image('bg-far', 'assets/bg/far.png' + q); L.image('bg-ruins', 'assets/bg/ruins.png' + q);
      L.image('altar', 'assets/altar.png' + q); L.image('feather', 'assets/feather.png' + q);
    },
    backdrop(s) {
      // the moonlit range with Damavand gives way to the ruined fire temple as Rostam nears the reeds
      s.far = s.add.image(0, 0, 'bg-far').setOrigin(0).setScrollFactor(0);
      s.ruins = s.add.image(0, 0, 'bg-ruins').setOrigin(0).setScrollFactor(0).setAlpha(0);
      s.mist = s.add.tileSprite(0, 0, W, H, 'bg-mist').setOrigin(0).setScrollFactor(0);
      s.hills = s.add.tileSprite(0, 0, W, H, 'bg-hills').setOrigin(0).setScrollFactor(0);
      s.reeds = s.add.tileSprite(0, 0, W, H, 'bg-reeds').setOrigin(0).setScrollFactor(0);
      s.fgReeds = s.add.tileSprite(0, 6, W, H, 'fg-reeds').setOrigin(0).setScrollFactor(0).setDepth(12).setAlpha(0.92);
      s.add.image(0, 0, 'vignette').setOrigin(0).setScrollFactor(0).setDepth(13);
    },
    scroll(s, sx, time) {
      s.far.x = s.ruins.x = -Math.round(sx * 0.05);
      const ra = Phaser.Math.Clamp((sx - 760) / 520, 0, 1);
      s.ruins.setAlpha(ra); s.hills.setAlpha(1 - ra * 0.75);
      s.mist.tilePositionX = Math.round(sx * 0.25 + time * 0.004); s.hills.tilePositionX = Math.round(sx * 0.4);
      s.reeds.tilePositionX = Math.round(sx * 0.7); s.fgReeds.tilePositionX = Math.round(sx * 1.25);
    },
    // roast lamb on the high perches, fruit and bread everywhere else
    food: (c, r, n) => (c === 44 && r === 8) || (c === 80 && r === 5) ? 'lamb' : FOOD[1 + (n % 3)],
    create(s) {
      for (const fx of [14, 37, 58, 76, 98, 118]) s.add.sprite(fx * TS, 160, 'fx-fireflies').play({ key: 'fx-fireflies', startFrame: fx % 16 }).setDepth(11).setAlpha(0.9);
      hint(`Cross the reeds. <b>Strike</b> with ${touch ? 'the mace button' : '<b>X</b>'}, or land on foes from above. <b>Walk past a fire altar</b> to light it: you rise there if you fall.`);
    },
    fires: [82], hearts: [80],                       // a last fire and a heart before the lion's den
    update(s, k, time, p) { if (!s.bossOn && p.x > 88 * TS) s.startBoss(); },
    win: 'With the lion of the reeds slain, Rostam takes up a feather of the Simurgh. Ahead lies the waterless desert of the second labour.',
    tips: ['The lion charges in a straight line. Step aside, or leap over it, and strike while it is dazed.',
      'Land on a foe from above to strike it twice as hard.', 'Roast lamb restores a heart. Look for it on the high ledges.',
      'Light the fire altars: if Rostam falls, he returns to the last sacred fire.', 'The blue Divs hop toward you. Strike as they land.']
  },
  2: {
    hud: 'Khan II &middot; The Desert', winTitle: 'Water in the wilderness', name: 'The Burning Desert', fa: 'بیابانِ بی‌آب', tiles: 'tiles-2', map: map2,
    load(L, q) {
      L.image('tiles-2', 'assets/k2/tiles.png' + q); L.image('k2-far', 'assets/k2/far.png' + q); L.image('k2-oasis', 'assets/k2/oasis.png' + q);
      L.image('well', 'assets/k2/well.png' + q);
    },
    backdrop(s) {
      // the far desert is drawn in 2px bands so each band can waver: heat shimmer above the dunes
      const t = s.textures.get('k2-far');
      if (!t.has('band0')) for (let y = 0; y < H; y += 2) t.add('band' + y, 0, 0, y, W, 2);
      s.bands = [];
      for (let y = 0; y < H; y += 2) s.bands.push(s.add.image(0, y, 'k2-far', 'band' + y).setOrigin(0).setScrollFactor(0));
      s.oasis = s.add.image(0, 0, 'k2-oasis').setOrigin(0).setScrollFactor(0).setAlpha(0);
      s.dunes = s.add.tileSprite(0, 0, W, H, 'bg-dunes').setOrigin(0).setScrollFactor(0);
      s.haze = s.add.rectangle(0, 0, W, H, 0xb87038, 0).setOrigin(0).setScrollFactor(0).setDepth(12);
      s.veil = s.add.tileSprite(0, 0, W, H, 'sand-veil').setOrigin(0).setScrollFactor(0).setDepth(12).setAlpha(0);
      s.add.image(0, 0, 'vignette-warm').setOrigin(0).setScrollFactor(0).setDepth(13);
      s.storm = s.add.particles(0, 0, 'sand', { x: { min: W, max: W + 40 }, y: { min: 0, max: H }, speedX: { min: -420, max: -260 }, speedY: { min: -20, max: 30 }, lifespan: 2200, quantity: 4, frequency: 30, scale: { min: 1, max: 2 }, alpha: { start: 0.95, end: 0.4 }, emitting: false }).setScrollFactor(0).setDepth(12);
    },
    scroll(s, sx, time) {
      const oa = Phaser.Math.Clamp((sx - 2050) / 300, 0, 1);
      for (let i = 0; i < s.bands.length; i++) {
        const y = i * 2, amp = y > 110 && y < 230 ? 1.6 * (1 - oa) : 0;          // the air over the sand wavers; the oasis is still
        s.bands[i].x = Math.round(Math.sin(time * 0.004 + y * 0.21) * amp);
      }
      s.oasis.setAlpha(oa);
      s.dunes.tilePositionX = Math.round(sx * 0.35);
    },
    // two roast lambs on the high perches heal; dates and fruit everywhere else
    food: (c, r, n) => (c === 77 && r === 9) || (c === 94 && r === 10) ? 'lamb' : n % 4 === 3 ? 'dates' : FOOD[1 + (n % 3)],
    hearts: [110, 142],                              // one before the sandstorm, one where the storm parts
    parse(s, ch, x, y) {
      if (ch === 'w') s.pickup(x, y - 6, 'props', 0, 'skin');
      else if (ch === 's') s.spawnFoe('scorpion', x, y);
      else if (ch === 'v') s.spawnFoe('vulture', x, y);
      else if (ch === 'O') { const a = s.add.image(x, y, 'well').setOrigin(0.5, 1).setDepth(2); a.onLight = () => s.drinkAt(a); s.altars.push(a); }
      else if (ch === 'R') s.ramAt = { x, y };
      else if (ch === 'S') {
        s.springAt = { x, y };
        const pool = s.add.image(x + 26, y + 3, 'pool').setOrigin(0.5, 1).setDepth(3);
        s.tweens.add({ targets: pool, alpha: 0.85, yoyo: true, repeat: -1, duration: 900, ease: 'Sine.easeInOut' });
      }
    },
    create(s) {
      s.water = 100; s.thirstT = 0; s.stormOn = 0; s.prayed = false;
      $('waterPill').classList.remove('hidden'); s.renderWater();
      hint('Your <b>water</b> (blue bar, top right) drains in the heat. <b>Walk past a well</b> to drink your fill; water skins give a sip. If it runs dry you lose hearts.');
    },
    update(s, k, time, p, b) {
      if (s.done) return;
      // the storm rises after the second well and parts when the ram appears
      const storm = p.x > 112 * TS && !s.prayed ? Math.min(1, (p.x - 112 * TS) / (10 * TS)) : 0;
      s.stormOn += (storm - s.stormOn) * 0.05;
      s.storm.emitting = s.stormOn > 0.08; s.storm.frequency = 40 - s.stormOn * 30; s.haze.setAlpha(s.stormOn * 0.55);
      s.veil.setAlpha(s.stormOn * 0.9); s.veil.tilePositionX += 9 * k; s.veil.tilePositionY = Math.round(Math.sin(time * 0.002) * 6);
      if (s.stormOn > 0.1 && !s.frozen) b.velocity.x -= 9 * s.stormOn * k;          // the wind pushes back
      if (s.stormOn > 0.3 && !s.prayed) hint('A <b>sandstorm</b>! The wind pushes you back and water drains twice as fast. <b>Keep pressing on</b>.');
      // thirst: water drains in the heat, twice as fast in the storm
      if (!s.frozen) s.water = Math.max(0, s.water - k * (0.045 + s.stormOn * 0.045));
      if (s.water <= 0) { s.thirstT += k; if (s.thirstT > 150) { s.thirstT = 0; s.hurt(p.x, true); toast('Rostam is dying of thirst. Find water!'); } }
      s.renderWater();
      if (!s.prayed && s.ramAt && p.x > s.ramAt.x) s.prayForWater();
      if (s.ram) s.ramGuide(k);
      if (s.springAt && !s.drank && p.x > s.springAt.x - 6 && b.blocked.down) s.reachSpring();
    },
    win: 'Rostam drinks from the spring the ram revealed and gives thanks. Refreshed, he rides on toward the dragon of the third labour.',
    tips: ['Water drains in the heat. Water skins refill a little; the wells refill it all.', 'Vultures circle, then dive. Strike them as they swoop low.',
      'Scorpions take two blows. Jump on them, or strike twice.', 'In the sandstorm the wind pushes you back. Keep moving forward.', 'If your water runs dry you lose a heart every few seconds.']
  },
  3: {
    hud: 'Khan III &middot; The Dragon', winTitle: 'The dragon is slain', name: 'The Dragon of the Night', fa: 'اژدها', bossName: 'The Dragon', tiles: 'tiles-3', map: map3,
    load(L, q) { L.image('tiles-3', 'assets/k3/tiles.png' + q); L.image('k3-far', 'assets/k3/far.png' + q); L.image('altar', 'assets/altar.png' + q); },
    backdrop(s) {
      s.add.image(0, 0, 'k3-far').setOrigin(0).setScrollFactor(0);
      s.mist = s.add.tileSprite(0, 0, W, H, 'bg-mist').setOrigin(0).setScrollFactor(0).setTint(0x9a8ab0);
      s.hills = s.add.tileSprite(0, 0, W, H, 'bg-hills').setOrigin(0).setScrollFactor(0).setTint(0x8a7aa0);
      s.fgReeds = s.add.tileSprite(0, 6, W, H, 'fg-reeds').setOrigin(0).setScrollFactor(0).setDepth(12);
    },
    scroll(s, sx, time) { s.mist.tilePositionX = Math.round(sx * 0.25 + time * 0.003); s.hills.tilePositionX = Math.round(sx * 0.4); s.fgReeds.tilePositionX = Math.round(sx * 1.25); },
    food: (c, r, n) => (c === 61 && r === 7) || (c === 95 && r === 8) ? 'lamb' : FOOD[1 + (n % 3)],
    parse(s, ch, x, y) {
      if (ch === 'b') s.spawnFoe('bat', x, y);
      else if (ch === 'm') {                                  // a will-o'-the-wisp over the bog: a little light in the dark
        const w = s.add.image(x, y, 'glow').setScale(0.35).setTint(0x9aff9a).setBlendMode(Phaser.BlendModes.ADD).setDepth(10);
        s.tweens.add({ targets: w, y: y - 8, alpha: 0.55, yoyo: true, repeat: -1, duration: 1300 + (x % 7) * 120, ease: 'Sine.easeInOut' });
        s.wisps.push(w);
      }
      else if (ch === 'K') s.rakhshAt = { x, y };
      else if (ch === 'D') s.dragonAt = { x, y };
    },
    create(s) {
      s.darkness(0.9, 0x04040c);
      for (const w of s.wisps) s.light(w, 0.7, 0.08);
      for (const a of s.altars) { a.ember = s.add.image(a.x, a.y - 22, 'glow').setScale(0.4).setBlendMode(Phaser.BlendModes.ADD).setDepth(3); s.light(a.ember, 0.6, 0.1); }
      toast('Night falls. Rostam rides on in the dark; the light of his torch is all he has.');
      hint('Night. Your torch is your only light. <b>Walk past fire altars</b> to light them: you rise at the last one if you fall.');
    },
    fires: [107], hearts: [105],
    update(s, k, time, p) { if (!s.bossOn && p.x > 113 * TS) s.startDragon(); },
    win: 'With Rakhsh at his side Rostam slays the dragon that ruled the night. At dawn he rides on, and the road leads into a garden where a feast is laid.',
    tips: ['The dragon hides in the dark. Wait for Rakhsh to rear and neigh: then it shows itself.', 'Strike the dragon while it is revealed, and jump its fire.',
      'Fire altars and marsh lights push back the dark.', 'Bats dive at you. Swing as they swoop.', 'Two roast lambs wait on the high ledges.']
  },
  4: {
    hud: 'Khan IV &middot; The Witch', winTitle: 'The witch unmasked', name: 'The Enchanted Garden', fa: 'زنِ جادو', bossName: 'The Witch', bossFa: 'زنِ جادو', tiles: 'tiles-4', map: map4,
    load(L, q) { L.image('tiles-4', 'assets/k4/tiles.png' + q); L.image('k4-far', 'assets/k4/far.png' + q); L.image('altar', 'assets/altar.png' + q); },
    backdrop(s) {
      s.add.image(0, 0, 'k4-far').setOrigin(0).setScrollFactor(0);
      s.mist = s.add.tileSprite(0, 0, W, H, 'bg-mist').setOrigin(0).setScrollFactor(0).setTint(0xb0a0d0);
      s.add.image(0, 0, 'vignette').setOrigin(0).setScrollFactor(0).setDepth(13);
    },
    scroll(s, sx, time) { s.mist.tilePositionX = Math.round(sx * 0.25 + time * 0.003); },
    food: (c, r, n) => (c === 72 && r === 8) || (c === 98 && r === 9) ? 'lamb' : FOOD[1 + (n % 3)],
    parse(s, ch, x, y) {
      if (ch === 'n') s.spawnFoe('serpent', x, y);
      else if (ch === 'b') s.spawnFoe('bat', x, y);
      else if (ch === 'l') {                                   // a hanging lantern in the cypresses
        const g = s.add.image(x, y, 'glow').setScale(0.45).setTint(0xffc070).setBlendMode(Phaser.BlendModes.ADD).setDepth(2);
        s.tweens.add({ targets: g, alpha: 0.7, yoyo: true, repeat: -1, duration: 900 + (x % 5) * 140, ease: 'Sine.easeInOut' });
        s.wisps.push(g);
      }
      else if (ch === 'T') s.feastAt = { x, y };
      else if (ch === 'W') s.witchAt = { x, y };
    },
    create(s) {
      s.darkness(0.6, 0x0a0820);
      for (const w of s.wisps) s.light(w, 0.8, 0.06);
      for (const a of s.altars) s.light(a, 0.6);
      hint('A moonlit garden. <b>Serpents strike when they rear up</b>: hit them first, or jump over them.');
      // the feast: a carpet laid with bread, fruit and roast lamb
      const f = s.feastAt; s.add.rectangle(f.x, f.y - 2, 92, 5, 0x8a1a2a).setDepth(2).setStrokeStyle(1, 0xe8c25a);
      [['food', 1, -34], ['food', 2, -14], ['food', 0, 8], ['food', 3, 28], ['props', 1, 44]].forEach(([t, fr, dx]) => s.add.image(f.x + dx, f.y - 4, t, fr).setOrigin(0.5, 1).setDepth(2));
      const glow = s.add.image(f.x, f.y - 20, 'glow').setScale(1.2).setTint(0xffd08a).setBlendMode(Phaser.BlendModes.ADD).setDepth(1); s.light(glow, 1.4, 0.05);
    },
    fires: [107], hearts: [105],
    update(s, k, time, p) {
      if (!s.bossOn && p.x > 114 * TS) s.startWitch();
      if (s.witch && !s.unmasked && Math.abs(p.x - s.witch.x) < 95 && s.atk > 14) s.unmask();
    },
    win: 'The witch is struck down and her garden withers to thorns. Rostam rides on into the green land of Mazandaran, where the warden Olad keeps watch.',
    tips: ['At the feast, stand near the lady and strike to speak the name of God.', 'The witch hurls curses. Jump them, and strike when she lands.',
      'Serpents sway, then strike. Hit them as they rear.', 'Lanterns and fire altars keep the garden lit.', 'Roast lamb waits on the high balconies.']
  },
  5: {
    hud: 'Khan V &middot; Olad', winTitle: 'Olad yields', name: 'The Green Land', fa: 'اولاد', bossName: 'Olad, Warden of the Marches', bossFa: 'اولاد', tiles: 'tiles-5', map: map5,
    load(L, q) { L.image('tiles-5', 'assets/k5/tiles.png' + q); L.image('k5-far', 'assets/k5/far.png' + q); L.image('altar', 'assets/altar.png' + q); },
    backdrop(s) {
      s.add.image(0, 0, 'k5-far').setOrigin(0).setScrollFactor(0);
      s.fgReeds = s.add.tileSprite(0, 10, W, H, 'fg-reeds').setOrigin(0).setScrollFactor(0).setDepth(12).setTint(0x2a5a20).setAlpha(0.9);
    },
    scroll(s, sx) { s.fgReeds.tilePositionX = Math.round(sx * 1.25); },
    food: (c, r, n) => (c === 84 && r === 8) || (c === 104 && r === 9) ? 'lamb' : FOOD[1 + (n % 3)],
    parse(s, ch, x, y) { if (ch === 'q') s.spawnFoe('spearman', x, y); else if (ch === 'O') s.oladAt = { x, y }; },
    create(s) { toast('Morning in Mazandaran. The fields are green, and the warden Olad keeps watch with his men.'); hint('Spearmen have a long reach. <b>Close in right after they thrust</b>.'); },
    fires: [107], hearts: [105],
    update(s, k, time, p) { if (!s.bossOn && p.x > 114 * TS) s.startOlad(); },
    win: 'Rostam lassos Olad and spares his life. Olad swears to guide him to the camp of Arzhang Div and to the White Div\'s cave, and he is promised the throne of Mazandaran.',
    tips: ['Olad catches frontal blows on his shield. Strike just after he swings, or jump over him and hit from behind.', 'Spearmen have a long reach. Close in after their thrust.',
      'Land on a foe from above to strike twice as hard.', 'Fire altars mark where you return if you fall.']
  },
  6: {
    hud: 'Khan VI &middot; Arzhang Div', winTitle: 'Arzhang has fallen', name: 'The Camp of the Divs', fa: 'اَرژنگِ دیو', bossName: 'Arzhang Div', tiles: 'tiles-6', map: map6,
    load(L, q) { L.image('tiles-6', 'assets/k6/tiles.png' + q); L.image('k6-far', 'assets/k6/far.png' + q); L.image('altar', 'assets/altar.png' + q); },
    backdrop(s) {
      s.add.image(0, 0, 'k6-far').setOrigin(0).setScrollFactor(0);
      s.smoke = s.add.tileSprite(0, 0, W, H, 'bg-mist').setOrigin(0).setScrollFactor(0).setTint(0x6a3020);
      s.add.image(0, 0, 'vignette-warm').setOrigin(0).setScrollFactor(0).setDepth(13);
      s.embers = s.add.particles(0, 0, 'sand', { x: { min: 0, max: W }, y: H + 4, speedY: { min: -60, max: -25 }, speedX: { min: -10, max: 10 }, lifespan: 4500, frequency: 90, tint: [0xff8a2a, 0xffd060, 0xe8501a], alpha: { start: 1, end: 0 } }).setScrollFactor(0).setDepth(11);
    },
    scroll(s, sx, time) { s.smoke.tilePositionX = Math.round(sx * 0.3 + time * 0.006); },
    food: (c, r, n) => (c === 39 && r === 8) || (c === 97 && r === 7) ? 'lamb' : FOOD[1 + (n % 3)],
    parse(s, ch, x, y) {
      if (ch === 'w') s.spawnFoe('divwarrior', x, y);
      else if (ch === 'b') s.spawnFoe('bat', x, y);
      else if (ch === 'B') { const f = s.fx('fire', x, y + 1, { depth: 2 }); const g = s.add.image(x, y - 16, 'glow').setScale(1.3).setBlendMode(Phaser.BlendModes.ADD).setDepth(1); s.wisps.push(g); }
      else if (ch === 'h') s.hordeAt = { x, y };
      else if (ch === 'A') s.arzhangAt = { x, y };
    },
    create(s) {
      s.darkness(0.45, 0x1a0606); for (const w of s.wisps) s.light(w, 1.1, 0.08); for (const a of s.altars) s.light(a, 0.6);
      toast('Olad leads you by night to the war camp of Arzhang Div. Drums beat among the fires.');
      hint('The Div camp. Div warriors\' clubs send <b>shockwaves along the ground: jump them</b>, then strike.');
    },
    fires: [118], hearts: [90, 116],                 // one past the horde's gates, one at the last fire
    resume(s) { if (s.start.x > s.hordeAt.x) s.hordeDone = true; },   // rising past the horde: it stays beaten
    update(s, k, time, p) {
      if (!s.hordeDone && !s.horde && p.x > s.hordeAt.x - 2 * TS) s.startHorde();
      if (s.horde) s.hordeTick();
      if (!s.bossOn && p.x > 124 * TS) s.startArzhang();
    },
    win: 'Rostam tears Arzhang from the field and the Div host scatters into the night. Now only the White Div remains, in his cave beyond the seven mountains.',
    tips: ['When the drums sound, the horde comes in waves. Keep moving and strike as they land.', 'Jump over the shockwaves from a Div warrior\'s club.',
      'Arzhang\'s axe splits the ground both ways. Leap the wave, then strike.', 'Blue Divs hop at you; Div warriors take three blows.']
  },
  7: {
    hud: 'Khan VII &middot; The White Div', winTitle: 'The Seven Labours are done', name: 'The White Div', fa: 'دیوِ سپید', tiles: 'tiles-7', map: map7,
    tileShift: c => c >= CAVE7 ? 4 : 0,
    load(L, q) { L.image('tiles-7', 'assets/k7/tiles.png' + q); L.image('k7-far', 'assets/k7/far.png' + q); L.image('k7-cave', 'assets/k7/cave.png' + q); L.image('altar', 'assets/altar.png' + q); },
    backdrop(s) {
      s.add.image(0, 0, 'k7-far').setOrigin(0).setScrollFactor(0);
      s.cave = s.add.image(0, 0, 'k7-cave').setOrigin(0).setScrollFactor(0).setAlpha(0);
      s.mist = s.add.tileSprite(0, 0, W, H, 'bg-mist').setOrigin(0).setScrollFactor(0).setTint(0xc8d8ff);
      s.snow = s.add.particles(0, 0, 'flake', { x: { min: -40, max: W + 40 }, y: -4, speedY: { min: 40, max: 90 }, speedX: { min: -50, max: -15 }, lifespan: 5000, frequency: 40, alpha: { start: 0.9, end: 0.4 } }).setScrollFactor(0).setDepth(11);
      s.add.image(0, 0, 'vignette').setOrigin(0).setScrollFactor(0).setDepth(13);
    },
    scroll(s, sx, time) {
      const ca = Phaser.Math.Clamp((sx - (CAVE7 - 32) * TS) / (16 * TS), 0, 1);
      s.cave.setAlpha(ca); s.mist.setAlpha(1 - ca); s.snow.emitting = ca < 0.5; s.mist.tilePositionX = Math.round(sx * 0.3 + time * 0.01);
      if (s.dark) s.darkA = 0.15 + ca * 0.65;
    },
    food: (c, r, n) => (c === 24 && r === 8) || (c === 102 && r === 7) || (c === 128 && r === 10) ? 'lamb' : FOOD[1 + (n % 3)],
    parse(s, ch, x, y) {
      if (ch === 'w') s.spawnFoe('divwarrior', x, y); else if (ch === 'b') s.spawnFoe('bat', x, y);
      else if (ch === 'X') s.whiteAt = { x, y };
      else if (ch === 'k') { const k = s.kavus = s.add.sprite(x, y + 1, 'kavus-sight', 0).setOrigin(0.5, 0.97).setDepth(3); s.add.image(x, y - 26, 'glow').setScale(0.6).setTint(0x8ab0ff).setBlendMode(Phaser.BlendModes.ADD).setDepth(2); }
    },
    create(s) {
      s.darkness(0.15, 0x060a18); for (const a of s.altars) s.light(a, 0.7); s.light(s.kavus, 0.8);
      s.boltT = 120; toast('Beyond the seven mountains the White Div waits in his cave. A storm breaks over the peaks.');
      hint('Lightning strikes <b>where the ground glows</b>: keep moving.');
    },
    hearts: [100, 140],                              // one after the lightning, one at the cave's last fire
    update(s, k, time, p) {
      // lightning on the mountain path: a glow marks the ground, then the bolt falls
      if (p.x < (CAVE7 - 4) * TS && !s.frozen) {
        s.boltT -= k;
        if (s.boltT <= 0) { s.boltT = 110 + Math.random() * 70; s.lightning(p.x + Phaser.Math.Between(-60, 140)); }
      }
      if (!s.bossOn && p.x > 148 * TS) s.startWhiteDiv();
      if (s.whiteDown && !s.ended && p.x > s.kavus.x - 46 && p.body.blocked.down) s.freeKing();
    },
    win: 'The blood of the White Div\'s heart restores the sight of Kay Kavus and all his warriors. The king is free, and Rostam, son of Zal, has completed the Seven Labours.',
    tips: ['Lightning strikes where the ground glows. Keep moving.', 'The White Div\'s slam sends a wave both ways. Jump it.', 'Boulders arc through the air. Watch where they will fall.',
      'Fire altars mark where you return if you fall.', 'Three roast lambs hide on the high ledges.']
  }
};

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
  // Khan II: rolling dunes in the late sun, a warm vignette, and a grain of blowing sand
  layer('bg-dunes', 512, H, (x, w) => {
    const dune = (base, amp, k, ph, col, lit) => {
      const yAt = i => Math.round(base + Math.sin(i / w * Math.PI * 2 * k + ph) * amp + Math.sin(i / w * Math.PI * 2 * (k * 2 + 1) + ph) * amp * 0.3);
      x.fillStyle = col; x.beginPath(); x.moveTo(0, H); for (let i = 0; i <= w; i += 2) x.lineTo(i, yAt(i)); x.lineTo(w, H); x.closePath(); x.fill();
      x.fillStyle = lit; for (let i = 0; i < w; i++) { const y0 = yAt(i), y1 = yAt(i + 1); if (y1 < y0 || i % 3 === 0) x.fillRect(i, y0, 1, 2); }
    };
    dune(196, 10, 2, 0.4, '#c2702e', '#f0b060'); dune(214, 8, 3, 1.9, '#9a4a20', '#d8883a');
  });
  layer('vignette-warm', W, H, x => {
    const g = x.createRadialGradient(W / 2, H * 0.5, H * 0.38, W / 2, H * 0.5, W * 0.65);
    g.addColorStop(0, 'rgba(60,20,0,0)'); g.addColorStop(1, 'rgba(60,20,0,0.45)'); x.fillStyle = g; x.fillRect(0, 0, W, H);
  });
  layer('lightmask', 128, 128, x => {                      // a soft round hole cut in the darkness
    const g = x.createRadialGradient(64, 64, 0, 64, 64, 64); g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(0.55, 'rgba(255,255,255,0.85)'); g.addColorStop(1, 'rgba(255,255,255,0)');
    x.fillStyle = g; x.fillRect(0, 0, 128, 128);
  });
  layer('boulder', 14, 12, x => {
    x.fillStyle = '#1a1428'; x.beginPath(); x.ellipse(7, 6, 7, 6, 0, 0, 7); x.fill();
    x.fillStyle = '#7a7890'; x.beginPath(); x.ellipse(7, 6, 6, 5, 0, 0, 7); x.fill();
    x.fillStyle = '#a8a6c0'; x.fillRect(4, 3, 3, 2); x.fillStyle = '#4a4860'; x.fillRect(8, 8, 3, 2);
  });
  layer('pool', 72, 14, x => {                             // the spring's pool, sunk into the sand
    x.fillStyle = '#5a3418'; x.beginPath(); x.ellipse(36, 7, 36, 7, 0, 0, 7); x.fill();
    x.fillStyle = '#a8703a'; x.beginPath(); x.ellipse(36, 6, 34, 6, 0, 0, 7); x.fill();
    x.fillStyle = '#1f6f9a'; x.beginPath(); x.ellipse(36, 7, 30, 5, 0, 0, 7); x.fill();
    x.fillStyle = '#2fa8b5'; x.beginPath(); x.ellipse(36, 6, 27, 3.5, 0, 0, 7); x.fill();
    x.fillStyle = '#bff0f0'; for (const [gx, gy, gw] of [[18, 5, 6], [40, 4, 9], [30, 8, 4], [52, 7, 5]]) x.fillRect(gx, gy, gw, 1);
  });
  layer('flake', 2, 2, x => { x.fillStyle = '#ffffff'; x.fillRect(0, 0, 2, 2); x.fillStyle = '#c8d8ff'; x.fillRect(1, 1, 1, 1); });
  layer('sand', 4, 2, x => { x.fillStyle = '#f0c27a'; x.fillRect(0, 0, 4, 1); x.fillStyle = '#c88a48'; x.fillRect(1, 1, 2, 1); });
  layer('sand-veil', 512, H, (x, w) => {                    // streaks of blown sand for the storm
    for (let i = 0; i < 520; i++) {
      const y = Math.round(hash(i * 1.7) * H), len = 14 + Math.round(hash(i * 2.3) * 60), a = 0.18 + hash(i * 3.1) * 0.4;
      wrap(w, o => { x.fillStyle = `rgba(232,176,104,${a.toFixed(2)})`; x.fillRect(Math.round(o + hash(i) * w), y, len, 1 + (i % 4 === 0 ? 1 : 0)); });
    }
  });
  layer('glow', 64, 64, x => {                             // soft warm light pool for fires
    const g = x.createRadialGradient(32, 32, 0, 32, 32, 32); g.addColorStop(0, 'rgba(255,170,80,0.55)'); g.addColorStop(1, 'rgba(255,120,40,0)');
    x.fillStyle = g; x.fillRect(0, 0, 64, 64);
  });
}

/* ---------------------------- audio ---------------------------- */
// The music is recorded: four Pixabay tracks (free to use, no credit needed) that crossfade as the game
// moves between the menus, the road, the darker labours and the bosses. The sound effects are synthesised:
// a santur and a tar from a plucked-string model and a daf frame drum, in a small hall of reverb.
const A = { ctx: null, master: null, muted: store.get('sh-muted') === '1', bufs: {}, tracks: {}, cur: null, want: false };
function audio() {
  if (!A.ctx) {
    const C = window.AudioContext || window.webkitAudioContext; if (!C) return null;
    const c = A.ctx = new C();
    const comp = c.createDynamicsCompressor(); comp.threshold.value = -16; comp.ratio.value = 3; comp.connect(c.destination);
    A.master = c.createGain(); A.master.gain.value = A.muted ? 0 : 0.8; A.master.connect(comp);
    A.verb = c.createConvolver(); A.verb.buffer = hall(c, 2.8); const wet = c.createGain(); wet.gain.value = 0.42; A.verb.connect(wet).connect(A.master);
    A.music = c.createGain(); A.music.gain.value = 0.7; A.music.connect(A.master);
    A.fx = c.createGain(); A.fx.gain.value = 0.85; A.fx.connect(A.master);
    setInterval(pickTrack, 300);
    const fs = c.createGain(); fs.gain.value = 0.2; A.fx.connect(fs).connect(A.verb);
    A.noise = c.createBuffer(1, c.sampleRate, c.sampleRate); const nd = A.noise.getChannelData(0); for (let i = 0; i < nd.length; i++) nd[i] = Math.random() * 2 - 1;
  }
  if (A.ctx.state === 'suspended') A.ctx.resume(); return A.ctx;
}
// a hall: stereo noise falling away, darker as it fades
function hall(c, sec) {
  const n = Math.floor(c.sampleRate * sec), b = c.createBuffer(2, n, c.sampleRate);
  for (let ch = 0; ch < 2; ch++) { const d = b.getChannelData(ch); let lp = 0; for (let i = 0; i < n; i++) { const k = i / n; lp += ((Math.random() * 2 - 1) - lp) * (0.9 - 0.75 * k); d[i] = lp * Math.pow(1 - k, 3); } }
  return b;
}
// a struck or plucked string (Karplus-Strong), rendered once per pitch and kept
function string(f, kind) {
  const key = kind + Math.round(f * 4); if (A.bufs[key]) return A.bufs[key];
  const c = A.ctx, sr = c.sampleRate, N = Math.max(2, Math.round(sr / f + 0.5)), santur = kind === 'santur';
  const len = Math.floor(sr * (santur ? 2.6 : 1.7)), b = c.createBuffer(1, len, sr), d = b.getChannelData(0), ring = new Float32Array(N);
  let lp = 0; const soft = santur ? 0.15 : 0.62;                  // a bright hammer for the santur, a softer plectrum for the tar
  for (let i = 0; i < N; i++) { lp += ((Math.random() * 2 - 1) - lp) * (1 - soft); ring[i] = lp; }
  const loss = santur ? 0.99996 : 0.9998;
  for (let i = 0, j = 0; i < len; i++) { const x = ring[j], y = ring[(j + 1) % N]; ring[j] = loss * 0.5 * (x + y); d[i] = x; j = (j + 1) % N; }
  b.f0 = sr / (N - 0.5); return A.bufs[key] = b;                   // averaging forward shortens the loop by half a sample
}
function voice(src, g, pan, out) {
  const c = A.ctx;
  if (pan && c.createStereoPanner) { const p = c.createStereoPanner(); p.pan.value = pan; src.connect(g).connect(p).connect(out); } else src.connect(g).connect(out);
}
function pluck(f, t, { kind = 'santur', vol = 0.2, pan = 0, out = A.music, bend = 0 } = {}) {
  const c = A.ctx, b = string(f, kind), courses = kind === 'santur' ? [1, 1.0028] : [1]; t = Math.max(t, c.currentTime);
  for (const k of courses) {
    const s = c.createBufferSource(), g = c.createGain(), r = f * k / b.f0;
    s.buffer = b; s.playbackRate.setValueAtTime(r, t); if (bend) s.playbackRate.linearRampToValueAtTime(r * bend, t + 0.35);
    g.gain.value = vol / courses.length; voice(s, g, pan + (k > 1 ? 0.15 : 0), out); s.start(t); s.stop(t + b.duration / r);
  }
}
function noise(t, d, { type = 'bandpass', f = 1000, to = 0, q = 1, vol = 0.1, out = A.fx } = {}) {
  const c = A.ctx, s = c.createBufferSource(), fl = c.createBiquadFilter(), g = c.createGain();
  s.buffer = A.noise; s.loop = true; fl.type = type; fl.frequency.setValueAtTime(f, t); if (to) fl.frequency.exponentialRampToValueAtTime(to, t + d); fl.Q.value = q;
  g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 0.005); g.gain.exponentialRampToValueAtTime(0.0001, t + d);
  s.connect(fl).connect(g).connect(out); s.start(t, Math.random() * 0.5); s.stop(t + d + 0.05);
}
function tone(f, d, { type = 'triangle', vol = 0.15, to = 0, t, out = A.fx } = {}) {
  const c = A.ctx; if (!c) return; t = t ?? c.currentTime;
  const o = c.createOscillator(), g = c.createGain(); o.type = type; o.frequency.setValueAtTime(f, t); if (to) o.frequency.exponentialRampToValueAtTime(to, t + d);
  g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 0.008); g.gain.exponentialRampToValueAtTime(0.0001, t + d);
  o.connect(g).connect(out); o.start(t); o.stop(t + d + 0.02);
}
// the daf: a deep 'dum' in the centre of the skin, a dry 'tak' at the rim, and the rattle of its rings
function daf(t, k, vol = 1, out = A.music) {
  if (k === 'D' || k === 'd') { const v = (k === 'D' ? 0.5 : 0.28) * vol; tone(105, 0.42, { type: 'sine', vol: v, to: 52, t, out }); noise(t, 0.09, { type: 'lowpass', f: 380, vol: v * 0.5, out }); noise(t + 0.01, 0.3, { type: 'highpass', f: 6500, vol: 0.035 * vol, out }); }
  if (k === 't') { noise(t, 0.07, { f: 1900, q: 1.4, vol: 0.2 * vol, out }); noise(t, 0.22, { type: 'highpass', f: 7000, vol: 0.06 * vol, out }); }
  if (k === 'j') noise(t, 0.28, { type: 'highpass', f: 7500, vol: 0.05 * vol, out });
}
// dastgah: the cents of each step; the koron steps sit a quarter tone flat. The effects are tuned to these.
const MODES = { shur: [0, 150, 300, 500, 700, 800, 1000], mahur: [0, 200, 400, 500, 700, 900, 1100] };
function pitch(S, deg) { const m = MODES[S.mode], o = Math.floor(deg / 7), i = ((deg % 7) + 7) % 7; return S.root * 2 ** (o + m[i] / 1200); }
const KEY = { mode: 'shur', root: 293.66 };
// the recorded music: one track for the menus, one for the road, a darker one for the dragon's night and the
// White Div's cave, and an epic one for every boss
const TRACK_VOL = { menu: 1, road: 0.62, dark: 0.5, boss: 0.48 }, DARK = new Set([3, 7]);   // the volumes even out the tracks' own loudness
function track(name) {
  let t = A.tracks[name]; if (t) return t;
  const el = new Audio(`assets/music/${name}.m4a?v=${V}`); el.loop = true; el.preload = 'auto';
  // through a gain node, so it can fade (iOS ignores an audio element's own volume)
  const g = A.ctx.createGain(); g.gain.value = 0; A.ctx.createMediaElementSource(el).connect(g).connect(A.music);
  return A.tracks[name] = { el, g };
}
function setTrack(name) {
  if (A.cur === name) return;
  const now = A.ctx.currentTime;
  if (A.cur) { const o = A.tracks[A.cur]; o.g.gain.cancelScheduledValues(now); o.g.gain.setTargetAtTime(0, now, 0.4); clearTimeout(o.stop); o.stop = setTimeout(() => o.el.pause(), 2200); }
  A.cur = name; if (!name) return;
  const t = track(name); clearTimeout(t.stop);
  if (name === 'boss' && t.el.paused) t.el.currentTime = 0;         // every boss fight starts the battle theme from its opening
  t.g.gain.cancelScheduledValues(now); t.g.gain.setTargetAtTime(TRACK_VOL[name], now, 0.6); t.el.play().catch(() => {});
}
// which track fits this moment
function pickTrack() {
  if (!A.ctx) return;
  if (A.muted || document.hidden) return setTrack(null);
  if (!A.want) return setTrack('menu');
  const sc = game?.scene.getScene('play'), boss = sc && sc.bossOn && !sc.done && sc.boss?.active && sc.boss.hp > 0;
  setTrack(boss ? 'boss' : DARK.has(cur) ? 'dark' : 'road');
}
const music = on => { A.want = on; if (audio()) pickTrack(); };
const sfx = (k) => { if (!A.ctx || A.muted) return; const t = A.ctx.currentTime, S = KEY; ({
  jump: () => noise(t, 0.12, { f: 500, to: 1400, q: 2, vol: 0.06 }),
  coin: () => { pluck(pitch(S, 7), t, { vol: 0.22, out: A.fx }); pluck(pitch(S, 9), t + 0.07, { vol: 0.2, out: A.fx }); },
  swing: () => noise(t, 0.16, { f: 700, to: 2600, q: 1.2, vol: 0.14 }),
  hit: () => { daf(t, 'D', 1.5, A.fx); noise(t, 0.05, { f: 2600, q: 0.8, vol: 0.12 }); },
  hurt: () => { pluck(pitch(S, 2) / 2, t, { kind: 'tar', vol: 0.4, bend: 0.75, out: A.fx }); noise(t, 0.2, { type: 'lowpass', f: 900, vol: 0.15 }); },
  neigh: () => { tone(520, 0.5, { type: 'triangle', vol: 0.07, to: 880 }); tone(700, 0.35, { type: 'triangle', vol: 0.04, to: 400, t: t + 0.25 }); noise(t, 0.6, { f: 1500, q: 4, vol: 0.04 }); },
  roar: () => { noise(t, 0.9, { type: 'lowpass', f: 700, to: 160, vol: 0.32 }); tone(85, 0.8, { type: 'sawtooth', vol: 0.06, to: 50 }); daf(t, 'D', 1.2, A.fx); },
  fire: () => [0, 2, 4, 7].forEach((d, i) => pluck(pitch(S, d + 5), t + i * 0.06, { vol: 0.16, out: A.fx })),
  win: () => { const W = { ...S, mode: 'mahur' }; [0, 2, 4, 5, 7, 9, 11, 14].forEach((d, i) => pluck(pitch(W, d), t + i * 0.11, { vol: 0.2, out: A.fx })); daf(t, 'D', 1.2, A.fx); daf(t + 0.88, 'D', 1.2, A.fx); }
})[k]?.(); };
function setMuted(m) {
  A.muted = m; store.set('sh-muted', m ? '1' : '0'); if (A.master) A.master.gain.value = m ? 0 : 0.8;
  $('muteIco').setAttribute('d', m ? 'M4 9v6h4l5 4V5L8 9z M17 9l5 6 M22 9l-5 6' : 'M4 9v6h4l5 4V5L8 9z M16 9a4 4 0 0 1 0 6 M19 6a8 8 0 0 1 0 12');
  music(!m && game && game.scene.isActive('play') && playing);
}

/* ---------------------------- input ---------------------------- */
const keys = { left: false, right: false, jump: false, attack: false }, pressed = { jump: false, attack: false };
const KEYMAP = { ArrowLeft: 'left', a: 'left', A: 'left', ArrowRight: 'right', d: 'right', D: 'right', ArrowUp: 'jump', w: 'jump', W: 'jump', ' ': 'jump', z: 'jump', Z: 'jump', x: 'attack', X: 'attack', j: 'attack', J: 'attack', k: 'attack', K: 'attack' };
const press = (k, down) => { if (down && !keys[k] && k in pressed) pressed[k] = true; keys[k] = down; };
addEventListener('keydown', e => {
  if (!$('s-map').classList.contains('hidden')) { if (e.key === 'Escape') closeMap(); return; }
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
    L.spritesheet('props', 'assets/k2/props.png' + q, { frameWidth: 27, frameHeight: 27 });
    L.image('heart-pick', 'assets/ui/heart.png' + q);
    this.lv = LEVELS[cur]; this.lv.load(L, q);
  }
  create() {
    // the scene object is reused from labour to labour: forget whatever the last one left behind
    for (const k of ['dark', 'lights', 'lamp', 'wall', 'stars', 'pose', 'swingFx', 'witch', 'unmasked', 'olad', 'rakhsh', 'dragonSeen', 'horde', 'hordeDone',
      'gates', 'drums', 'whiteDown', 'ended', 'prayed', 'drank', 'toldImmune', 'kavus']) delete this[k];
    // turn loaded strips into square frames; anything missing falls back to placeholder art
    for (const [k, f] of Object.entries(ART)) if (f && this.textures.exists(k)) {
      const t = this.textures.get(k), img = t.getSourceImage(), fh = img.height, n = Math.max(1, Math.round(img.width / fh));
      for (let i = 0; i < n; i++) t.add(i, 0, i * fh, 0, fh, fh);
    }
    makeTextures(this);
    for (const k of Object.keys(FPS)) {
      const t = this.textures.get(k), n = t.frameTotal - 1;
      if (!this.anims.exists(k)) this.anims.create({ key: k, frames: this.anims.generateFrameNumbers(k, { start: 0, end: Math.max(0, n - 1) }), frameRate: FPS[k], repeat: /attack|hurt|roar|jump|thrust|slash|kneel|smash|throw|fire|rear|sight/.test(k) ? 0 : -1 });
    }
    const lv = this.lv, map = lv.map(), C = map[0].length;
    $('lbl').innerHTML = lv.hud; $('waterPill').classList.add('hidden'); $('bossName').textContent = lv.bossName || lv.name;
    this.levelW = C * TS;
    for (const [k, f] of Object.entries(FX)) if (!this.anims.exists('fx-' + k)) this.anims.create({ key: 'fx-' + k, frames: this.anims.generateFrameNumbers('fx-' + k, { start: 0, end: f.n - 1 }), frameRate: f.fps, repeat: f.loop ? -1 : 0 });
    lv.backdrop(this);
    const data = map.map((row, r) => row.map((ch, c) => { const t = ch === '#' ? (r > 0 && map[r - 1][c] === '#' ? 1 : 0) : ch === '=' ? 2 : ch === '^' ? 3 : -1; return t < 0 ? t : t + (lv.tileShift?.(c) || 0); }));
    const tm = this.make.tilemap({ data, tileWidth: TS, tileHeight: TS });
    const ts = tm.addTilesetImage(lv.tiles, lv.tiles, TS, TS, 0, 0);
    this.layer = tm.createLayer(0, ts, 0, 0);
    this.layer.setCollision([0, 1, 2, 4, 5, 6]);
    this.layer.forEachTile(t => { if (t.index % 4 === 2) t.setCollision(false, false, true, false); });
    this.physics.world.setBounds(0, 0, this.levelW, ROWS * TS + 200);
    this.physics.world.checkCollision.down = false;

    this.coins = this.physics.add.staticGroup(); this.wisps = [];
    this.foes = this.physics.add.group();
    this.altars = [];
    map.forEach((row, r) => row.forEach((ch, c) => {
      const x = c * TS + TS / 2, y = r * TS + TS;
      if (ch === 'c') {
        const kind = lv.food(c, r, this.coins.getLength());
        if (kind === 'dates') this.pickup(x, y - 6, 'props', 2, kind); else this.pickup(x, y - 6, 'food', FOOD.indexOf(kind), kind);
      }
      else if (ch === 'P') this.start = { x, y };
      else if (ch === 'j') this.spawnFoe('jackal', x, y);
      else if (ch === 'd') this.spawnFoe('div', x, y);
      else if (ch === 'F') { const a = this.add.image(x, y, 'altar').setOrigin(0.5, 1).setDepth(2); a.lit = false; this.altars.push(a); }
      else if (ch === 'L') this.lionAt = { x, y };
      else if (lv.parse) lv.parse(this, ch, x, y, c, r);
    }));
    // the labour's own extra fires (one before every boss) and hearts, set on the ground of their column
    for (const c of lv.fires || []) { const r = topAt(map, c); if (r != null) { const a = this.add.image(c * TS + TS / 2, r * TS, 'altar').setOrigin(0.5, 1).setDepth(2); a.lit = false; this.altars.push(a); } }
    this.altars.sort((a, b) => a.x - b.x);
    for (const c of lv.hearts || []) { const r = topAt(map, c); if (r != null) this.heart(c * TS + TS / 2, r * TS - 12); }
    // rising again after a fall: start at the last fire lit, with what was gathered on the way
    const R = this.resuming && resumeAt?.n === cur ? resumeAt : null; this.resuming = false;
    if (R && this.altars[R.i]) { const a = this.altars[R.i]; this.start = { x: a.x, y: a.y }; for (const b of this.altars.slice(0, R.i + 1)) this.kindle(b, true); }
    this.respawn = { ...this.start };
    this.player = this.physics.add.sprite(this.start.x, this.start.y - 30, 'rostam-idle', 0);
    this.fit(this.player, 'rostam');
    this.player.setDepth(5);
    this.physics.add.collider(this.player, this.layer);
    this.physics.add.collider(this.foes, this.layer);
    this.physics.add.overlap(this.player, this.coins, (pl, c) => this.eat(c));
    this.lion = null; this.boss = null; this.frozen = false; this.ram = null;
    this.cam = this.cameras.main;
    this.cam.setBounds(0, 0, this.levelW, ROWS * TS);
    this.cam.startFollow(this.player, true, 0.12, 0.12);
    this.cam.setRoundPixels(true);
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) { this.cam.shake = () => this.cam; this.cam.flash = () => this.cam; }
    this.hp = 5; this.coinCount = 0; this.kills = 0; this.wasGround = true; this.face = 1; this.inv = 0; this.atk = 0; this.cool = 0; this.coyote = 0; this.buf = 0; this.bossOn = false; this.done = false; this.t0 = this.time.now;
    if (R) {
      this.coinCount = R.coins || 0; this.kills = R.kills || 0; this.t0 -= R.t || 0;
      for (const c of this.coins.getChildren().slice()) if (c.x < this.start.x) { c.glow?.destroy(); c.destroy(); }
      for (const f of this.foes.getChildren().slice()) if (Math.abs(f.x - this.start.x) < 8 * TS) f.destroy();   // a safe place to rise
      this.inv = 120;
    }
    this.renderHearts(); $('coins').textContent = this.coinCount; hint(null);
    this.parts = this.add.particles(0, 0, 'coin-spin', { frame: 0, speed: { min: 30, max: 90 }, lifespan: 450, scale: { start: 0.8, end: 0 }, gravityY: 120, emitting: false }).setDepth(9);
    this.shots = this.physics.add.group({ allowGravity: false }); this.hazards = [];
    this.physics.add.collider(this.shots, this.layer, sh => sh.destroy());
    this.physics.add.overlap(this.player, this.shots, (pl, sh) => { if (!sh.active) return; this.hurt(sh.x); this.fx('hit', sh.x, sh.y, { depth: 10 }); sh.destroy(); });
    lv.create?.(this);
    if (R) { lv.resume?.(this); toast(R.well ? 'Rostam rises again beside the well.' : 'Rostam rises again beside the sacred fire.'); }
  }
  // a heart: one more life, glowing so it can be found even in the dark
  heart(x, y) {
    const h = this.pickup(x, y, 'heart-pick', 0, 'heart'); h.setScale(2); h.body.setSize(24, 24); h.setDepth(4);
    h.glow = this.add.image(x, y, 'glow').setScale(0.5).setTint(0xff5a6a).setBlendMode(Phaser.BlendModes.ADD).setDepth(3);
    this.tweens.add({ targets: h.glow, alpha: 0.45, scale: 0.6, yoyo: true, repeat: -1, duration: 700, ease: 'Sine.easeInOut' });
    this.light(h, 0.5, 0.1); return h;
  }
  // light a fire altar (or drink at a well): the checkpoint
  kindle(a, quiet = false) {
    a.lit = true; this.respawn = { x: a.x, y: a.y };
    if (a.onLight) { if (!quiet) a.onLight(); return; }
    const g = this.add.image(a.x, a.y - 22, 'glow').setDepth(1).setScale(2).setBlendMode(Phaser.BlendModes.ADD);
    this.tweens.add({ targets: g, alpha: 0.6, yoyo: true, repeat: -1, duration: 700, ease: 'Sine.easeInOut' });
    if (quiet) return;
    sfx('fire'); this.fx('fire', a.x, a.y - 20, { depth: 3 }); this.fx('pickup', a.x, a.y - 18);
    toast('The sacred fire is lit. If Rostam falls, he will rise again here.');
  }
  pickup(x, y, tex, frame, kind) {
    const f = this.coins.create(x, y, tex, frame); f.kind = kind; f.body.setSize(16, 16);
    this.tweens.add({ targets: f, y: f.y - 3, yoyo: true, repeat: -1, duration: 900 + (Math.round(x) % 5) * 90, ease: 'Sine.easeInOut' });
    return f;
  }
  fit(s, kind) {
    const fh = s.frame.height, sc = SIZE[kind] / fh, [bw, bh] = BODY[kind];
    s.setScale(sc); s.body.setSize(fh * bw, fh * bh); s.body.setOffset((fh - fh * bw) / 2, fh - fh * bh - fh * 0.03);
  }
  spawnFoe(kind, x, y) {
    const F = FOES[kind], f = this.foes.create(x, y - 20, F.tex, 0);
    this.fit(f, kind); f.kind = kind; f.hp = F.hp; f.dir = -1; f.hopT = Math.random() * 60; f.home = { x, y: y - 20 };
    f.play(F.tex); F.init?.(this, f);
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
    if (c.kind === 'heart') {
      c.glow?.destroy(); c.destroy(); this.fx('heal', this.player.x, this.player.body.bottom - 4, { depth: 6 }); sfx('fire');
      if (this.hp < 5) { this.hp++; this.renderHearts(); toast('A heart! Rostam\'s strength returns.'); } else toast('A heart, but Rostam is already whole.');
      return;
    }
    const heal = c.kind === 'lamb' && this.hp < 5;
    if (c.kind === 'skin') { c.destroy(); this.water = Math.min(100, this.water + 30); this.renderWater(); sfx('coin'); this.fx('splash', c.x, c.y + 4); toast('A water skin! Rostam drinks.'); return; }
    c.destroy(); this.coinCount++; $('coins').textContent = this.coinCount; sfx('coin');
    this.fx('pickup', c.x, c.y + 6);
    if (c.kind === 'lamb') { if (heal) { this.hp++; this.renderHearts(); } this.fx('heal', this.player.x, this.player.body.bottom - 4, { depth: 6 }); sfx('fire'); }
  }
  sparkle(x, y, tint) { this.parts.setParticleTint(tint); this.parts.explode(8, x, y); }
  renderHearts() { $('hearts').innerHTML = Array.from({ length: 5 }, (_, i) => `<img src="assets/ui/heart${i < this.hp ? '' : '-off'}.png?v=${V}" alt="">`).join(''); $('hearts').setAttribute('aria-label', this.hp + ' of 5 hearts'); }
  hurt(fromX, thirst = false) {
    if ((this.inv > 0 && !thirst) || this.done || this.frozen) return;   // no harm during a cutscene
    this.hp--; this.renderHearts(); this.inv = thirst ? 30 : 90; sfx('hurt'); this.cam.shake(160, 0.008); this.cam.flash(120, 180, 40, 60);
    if (!thirst) this.player.setVelocity((this.player.x < fromX ? -1 : 1) * 160, -220);
    if (this.hp <= 0) {
      this.done = true; playing = false; music(false); document.body.classList.remove('playing'); this.player.setTint(0x777777); hint(null);
      const t = this.lv.tips; $('deadTip').textContent = t[Math.floor(Math.random() * t.length)];
      const cp = resumeAt?.n === cur;
      if (cp) Object.assign(resumeAt, { coins: this.coinCount, kills: this.kills, t: this.time.now - this.t0 });
      $('retryBtn').textContent = cp ? (resumeAt.well ? 'Rise at the well' : 'Rise at the sacred fire') : 'Try again'; $('freshBtn').classList.toggle('hidden', !cp);
      setTimeout(() => { if (!playing && this.done) $('s-dead').classList.remove('hidden'); }, 900);
    }
  }
  strikeBox() { const p = this.player; return new Phaser.Geom.Rectangle(this.face > 0 ? p.body.right - 4 : p.body.left - 30, p.body.top - 6, 34, p.body.height + 8); }
  damage(f, n = 1) {
    if (f.immune?.()) { this.fx('dust', f.x, f.body.center.y, { depth: 10 }); if (!this.toldImmune) { this.toldImmune = true; toast(f.immuneMsg || 'Your blow passes through shadow.'); } return; }
    f.hp -= n; f.setTintFill(0xffffff); this.time.delayedCall(80, () => f.active && f.clearTint());
    const hx = Phaser.Math.Clamp(this.face > 0 ? f.body.left + 6 : f.body.right - 6, f.body.left, f.body.right);
    this.fx('hit', hx, f.body.center.y - 4, { depth: 10 }); sfx('hit'); this.cam.shake(80, 0.004);
    this.hitStop(f === this.boss ? 70 : 45);
    if (f === this.boss && !f.gaveHeart && f.hp > 0 && f.hp <= f.max / 2 && this.hp < 5) {
      f.gaveHeart = true; const x = this.player.x + (this.player.x < this.cam.scrollX + W / 2 ? 60 : -60), r = this.groundAt(x);
      if (r != null) { this.fx('beam', x, r * TS + 1, { depth: 4 }); this.heart(x, r * TS - 12); toast('A heart shines in the arena. Take it!'); }
    }
    if (f.hp <= 0) {
      if (f === this.boss) return f.onDown();
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
    this.boss = l; l.onDown = () => this.lionDown(); l.ai = () => this.lionAI();
    this.physics.add.collider(l, this.layer); this.physics.add.collider(l, this.wall);
    sfx('roar'); this.roarRings(l);
    $('boss').classList.remove('hidden'); this.bossBar(); banner();
    hint('The lion roars, then charges. <b>Jump over the charge</b>: if it runs into the rocks it is dazed, so <b>strike it then</b>.');
  }
  bossBar() { $('bossHp').style.width = (this.boss.hp / this.boss.max * 100) + '%'; }
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
    const sync = () => f.body && f.refreshBody();
    this.tweens.add({ targets: [f, glow], y: fy, duration: 1600, ease: 'Sine.easeOut', onUpdate: sync, onComplete: () => {
      if (f.active) this.tweens.add({ targets: [f, glow], y: fy - 5, yoyo: true, repeat: -1, duration: 900, ease: 'Sine.easeInOut', onUpdate: sync });
    } });
    f.glow = glow;
    this.physics.add.overlap(this.player, f, () => this.win(f));
    this.cam.startFollow(this.player, true, 0.12, 0.12);
  }
  win(f) {
    if (this.done) return; this.done = true; playing = false; music(false); sfx('fire'); document.body.classList.remove('playing'); hint(null); resumeAt = null;
    this.tweens.killTweensOf([f, f.glow].filter(Boolean)); f.destroy();
    const s = Math.round((this.time.now - this.t0) / 1000);
    $('winMsg').textContent = this.lv.win;
    $('winKick').textContent = `The ${['', 'first', 'second', 'third', 'fourth', 'fifth', 'sixth', 'seventh'][cur]} labour is done`;
    $('winTitle').textContent = this.lv.winTitle || 'The labour is done';
    if (cur < LABOURS) store.set('sh-unlocked', Math.max(unlocked(), cur + 1));
    $('nextBtn').classList.toggle('hidden', cur >= LABOURS || !LEVELS[cur + 1]);
    $('winStats').innerHTML = `<div><b>${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}</b>time</div><div><b>${this.coinCount}</b>provisions</div><div><b>${this.kills}</b>foes</div><div><b>${this.hp}</b>hearts</div>`;
    const bk = cur === 1 ? 'sh-best' : 'sh-best-' + cur, best = +(store.get(bk) || 0); if (!best || s < best) store.set(bk, s);
    $('winBest').textContent = !best || s < best ? 'A new best time!' : `Best time ${Math.floor(best / 60)}:${String(best % 60).padStart(2, '0')}`;
    setTimeout(() => $('s-win').classList.remove('hidden'), 600);
  }
  update(time, delta) {
    const k = delta / 16.67, p = this.player, b = p.body;
    this.lv.scroll(this, this.cam.scrollX, time);
    if (!playing || this.done) { if (this.done && this.hp <= 0) p.setVelocityX(0); return; }
    this.inv = Math.max(0, this.inv - k); p.setAlpha(this.inv > 0 && Math.floor(this.inv / 5) % 2 ? 0.35 : 1);
    if (this.frozen) { pressed.jump = pressed.attack = false; }
    const dirX = this.frozen ? 0 : (keys.right ? 1 : 0) - (keys.left ? 1 : 0), ground = b.blocked.down;
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
        const targets = [...this.foes.getChildren(), ...(this.boss && this.boss.active && this.boss.hp > 0 ? [this.boss] : [])];
        for (const f of targets) if (f.body.enable && !this.hitDone.has(f) && Phaser.Geom.Intersects.RectangleToRectangle(box, f.body)) { this.hitDone.add(f); this.damage(f); f.setVelocity(this.face * (f === this.boss ? 60 : 140), f.kind === 'vulture' ? -60 : -120); }
      }
    }
    // thorns and pits
    const tile = this.layer.getTileAtWorldXY(p.x, b.bottom - 2);
    if (tile && tile.index % 4 === 3) { this.hurt(tile.pixelX + 8); p.setVelocityY(-300); }
    if (p.y > ROWS * TS + 60) { this.inv = 0; this.hurt(p.x); if (this.hp > 0) { p.setPosition(this.respawn.x, this.respawn.y - 30); p.setVelocity(0); this.inv = 80; } }
    // animation
    const anim = this.pose || (this.atk > 0 ? 'rostam-attack' : this.inv > 70 ? 'rostam-hurt' : !ground ? 'rostam-jump' : Math.abs(b.velocity.x) > 15 ? 'rostam-run' : 'rostam-idle');
    if (p.anims.currentAnim?.key !== anim && !(anim === 'rostam-attack' && p.anims.isPlaying)) p.play(anim);
    if (anim === 'rostam-jump') p.setFrame(b.velocity.y < 0 ? 0 : 1);
    p.setFlipX(this.face < 0);
    this.cam.setFollowOffset(-this.face * 30, 0);
    // foes
    for (const f of this.foes.getChildren()) {
      if (!f.body.enable) continue;
      FOES[f.kind].tick(this, f, k, p);
      if (Phaser.Geom.Intersects.RectangleToRectangle(b, f.body)) {
        if (b.velocity.y > 60 && b.bottom - f.body.top < 12) { this.damage(f, 2); p.setVelocityY(keys.jump ? -330 : -230); }
        else this.hurt(f.x);
      }
    }
    // checkpoint
    for (const a of this.altars) if (!a.lit && p.x > a.x) { this.kindle(a); resumeAt = { n: cur, i: this.altars.indexOf(a), well: !!a.onLight }; }
    this.lv.update?.(this, k, time, p, b);
    // projectiles expire; hazard zones (fire breath, shockwaves) hurt while they last
    for (const sh of this.shots.getChildren()) if (time > sh.die) sh.destroy(); else if (sh.spin) sh.angle += sh.spin * k;
    this.hazards = this.hazards.filter(z => { if (z.move) z.r.x += z.move * k; if (Phaser.Geom.Intersects.RectangleToRectangle(b, z.r)) this.hurt(z.r.centerX); return time < z.until; });
    this.drawDark();
    // boss
    const B = this.boss;
    if (B && B.active && B.hp > 0) {
      B.ai(); this.bossBar();
      if (!B.immune?.() && Phaser.Geom.Intersects.RectangleToRectangle(b, B.body)) {
        if (b.velocity.y > 60 && b.bottom - B.body.top < 14) { this.damage(B); p.setVelocityY(-320); }
        else this.hurt(B.x);
      }
    }
  }
  /* ---- shared by the later labours: darkness, projectiles, hazards, arenas and big bosses ---- */
  // darkness: a dark layer over the world with soft holes of light around Rostam and every lamp
  darkness(alpha = 0.86, tint = 0x05060f) {
    this.dark = this.add.renderTexture(0, 0, W, H).setOrigin(0).setScrollFactor(0).setDepth(11);
    this.darkA = alpha; this.darkTint = tint; this.lights ||= [];
    this.lamp = this.make.image({ key: 'lightmask', add: false });
    this.light(this.player, 1.5);
  }
  light(obj, scale = 1, flicker = 0) { (this.lights ||= []).push({ obj, scale, flicker }); }
  drawDark() {
    const d = this.dark; if (!d) return;
    d.clear(); d.fill(this.darkTint, this.darkA);
    const t = this.time.now;
    for (const l of this.lights) {
      if (!l.obj.active || !l.obj.visible || l.obj.alpha < 0.25) continue;          // a lamp that has faded gives no light
      const s = l.scale * Math.min(1, l.obj.alpha * 1.3) * (1 + (l.flicker ? Math.sin(t * 0.013 + l.obj.x) * l.flicker : 0));
      this.lamp.setScale(s); d.erase(this.lamp, Math.round(l.obj.x - this.cam.scrollX), Math.round(l.obj.y - this.cam.scrollY));
    }
  }
  shoot(x, y, vx, vy, key, { frame, gravity = 0, life = 3000, spin = 0, tint } = {}) {
    const sh = this.shots.create(x, y, key, frame).setDepth(9);
    sh.body.setAllowGravity(!!gravity); if (gravity) sh.body.setGravityY(gravity - 900);
    sh.setVelocity(vx, vy); sh.die = this.time.now + life; sh.spin = spin; if (tint) sh.setTint(tint);
    sh.body.setSize(sh.width * 0.7, sh.height * 0.7);
    return sh;
  }
  // a rectangle that hurts Rostam for a while, optionally sliding along the ground
  hazard(x, y, w, h, ms, move = 0) { this.hazards.push({ r: new Phaser.Geom.Rectangle(x, y, w, h), until: this.time.now + ms, move }); }
  // a shockwave that races along the ground both ways from a slam
  shockwave(x, y) {
    for (const d of [-1, 1]) {
      this.hazard(x - 8, y - 14, 16, 14, 650, d * 4.2);
      for (let i = 0; i < 4; i++) this.time.delayedCall(i * 130, () => this.fx('dust', x + d * (20 + i * 34), y, { flip: d < 0, depth: 8 }));
    }
    this.cam.shake(260, 0.012); sfx('hit');
  }
  // lock the camera on an arena, raise the boss bar and the title card
  arena(x0, boss, max) {
    this.bossOn = true;
    this.cam.stopFollow(); this.tweens.add({ targets: this.cam, scrollX: Math.min(this.levelW - W, x0), duration: 700, ease: 'Sine.easeInOut' });
    this.wall = this.add.rectangle(x0 - 4, 0, 8, ROWS * TS, 0, 0).setOrigin(0.5, 0); this.physics.add.existing(this.wall, true);
    this.physics.add.collider(this.player, this.wall);
    boss.hp = boss.max = max; this.boss = boss;
    this.physics.add.collider(boss, this.layer); this.physics.add.collider(boss, this.wall);
    $('boss').classList.remove('hidden'); this.bossBar(); banner();
  }
  // a big boss falls: flash, smoke and light, then the labour is won
  bossFall(B, then) {
    this.drums?.remove();
    B.body.enable = false; B.anims.stop(); sfx('win'); this.cam.flash(400, 255, 240, 200); this.hitStop(120);
    $('boss').classList.add('hidden'); this.wall?.destroy(); this.hazards = []; this.shots.clear(true, true);
    for (let i = 0; i < 4; i++) this.time.delayedCall(i * 180, () => this.fx('poof', B.x + Phaser.Math.Between(-30, 30), B.body.bottom - Phaser.Math.Between(10, 50), { depth: 10 }));
    this.tweens.add({ targets: B, alpha: 0, y: B.y + 6, duration: 1400, delay: 400 });
    this.cam.startFollow(this.player, true, 0.12, 0.12);
    this.time.delayedCall(1900, () => then ? then() : this.win({ destroy() {} }));
  }
  /* ---- Khan III: Rakhsh and the dragon that hides in the dark ---- */
  startDragon() {
    const r = this.rakhsh = this.physics.add.sprite(this.rakhshAt.x - 220, this.rakhshAt.y - 40, 'rakhsh-gallop', 0).setDepth(4);
    this.fit(r, 'rakhsh'); this.physics.add.collider(r, this.layer); r.play('rakhsh-gallop'); r.setVelocityX(180);
    this.light(r, 1.1); sfx('neigh');
    const d = this.physics.add.sprite(this.dragonAt.x, this.dragonAt.y - 60, 'dragon-move', 0).setDepth(4).setFlipX(true).setAlpha(0.05);
    this.fit(d, 'dragon'); d.play('dragon-move'); d.state = 'lurk'; d.tm = 170; d.dir = -1;
    this.light(d, 2.4, 0.04);                                         // when it shows itself, it can be seen
    d.immune = () => d.alpha < 0.5; d.immuneMsg = 'Your mace passes through shadow. Wait for Rakhsh to warn you!';
    d.ai = () => this.dragonAI(); d.onDown = () => this.bossFall(d);
    this.arena(112 * TS, d, 12);
    toast('Rakhsh gallops up beside you, snorting. Something vast stirs in the dark...');
    hint('Rakhsh can sense the dragon. <b>When he rears and neighs, the dragon shows itself: strike it then.</b> While it hides, your blows pass through. Jump its fire.');
  }
  dragonAI() {
    const d = this.boss, p = this.player, r = this.rakhsh; d.tm--;
    if (r.body.velocity.x > 0 && r.x >= this.rakhshAt.x) { r.setVelocityX(0); r.anims.stop(); r.setFrame(0); }
    const toP = Math.sign(p.x - d.x) || -1; d.dir = toP; d.setFlipX(toP < 0);
    const seen = d.hp <= d.max / 2;                                   // once wounded, God lets Rostam see it
    if (seen && !this.dragonSeen) { this.dragonSeen = true; this.tweens.killTweensOf(d); d.setAlpha(1); banner('خدا', 'The dragon can hide no more'); hint('The dragon can hide no more. <b>Strike it whenever you can</b>, and jump its fire.'); }
    if (d.state === 'lurk') {
      d.setVelocityX(toP * (seen ? 45 : 28));
      if (d.tm <= 0) {
        // Rakhsh rears and neighs: the dragon is revealed
        r.play('rakhsh-rear'); r.once('animationcomplete', () => { r.anims.stop(); r.setFrame(0); }); sfx('neigh');
        this.tweens.add({ targets: d, alpha: 1, duration: 280 }); this.cam.flash(160, 255, 200, 140); sfx('roar');
        d.state = 'reveal'; d.tm = seen ? 18 : 30; d.setVelocityX(0);
      }
    } else if (d.state === 'reveal') {
      if (d.tm <= 0) {
        if (Math.abs(p.x - d.x) < 150 || Math.random() < 0.55) { d.state = 'breath'; d.tm = 75; d.play('dragon-fire'); d.fired = false; }
        else { d.state = 'lunge'; d.tm = 42; d.setVelocityX(toP * 250); }
      }
    } else if (d.state === 'breath') {
      d.setVelocityX(0);
      if (!d.fired && d.tm < 50) {
        d.fired = true; const dir = d.flipX ? -1 : 1, mx = d.x + dir * 46, my = d.body.top + 8;
        const f = this.fx('breath', mx, my, { flip: dir < 0, depth: 9 }); this.light(f, 1.4, 0.15);
        this.hazard(dir > 0 ? mx : mx - 120, my - 22, 120, 44, 950); sfx('roar'); this.cam.shake(500, 0.006);
        this.time.delayedCall(950, () => f.destroy());
      }
      if (d.tm <= 0) { d.play('dragon-move'); d.state = 'exposed'; d.tm = seen ? 50 : 85; }
    } else if (d.state === 'lunge') {
      if (d.tm <= 0 || d.body.blocked.left || d.body.blocked.right) { d.setVelocityX(0); d.state = 'exposed'; d.tm = seen ? 50 : 85; this.cam.shake(200, 0.01); }
    } else if (d.state === 'exposed') {
      d.setVelocityX(0);
      if (d.tm <= 0) { d.state = 'lurk'; d.tm = (seen ? 80 : 150) + Math.random() * 60; if (!seen) this.tweens.add({ targets: d, alpha: 0.05, duration: 600 }); }
    }
  }
  /* ---- Khan IV: the feast, the name of God, and the witch ---- */
  startWitch() {
    const w = this.witch = this.physics.add.sprite(this.witchAt.x, this.witchAt.y - 40, 'beauty-idle', 0).setDepth(4).setFlipX(true);
    this.fit(w, 'beauty'); w.play('beauty-idle'); w.immune = () => !this.unmasked || w.alpha < 0.5; w.immuneMsg = 'She only smiles. Speak the name of God: stand near her and strike.';
    w.ai = () => this.witchAI(); w.onDown = () => this.bossFall(w);
    this.arena(112 * TS, w, 10); $('bossName').textContent = 'The Lady of the Garden';
    this.light(w, 1.2); banner('ضیافت', 'The Feast');
    toast('A lovely woman steps from the pavilion and offers you a cup of wine. Stand near her and strike to give thanks in the name of God.');
    hint('The lady offers you wine. <b>Stand close to her and strike</b> to give thanks in the name of God, and see what she really is.');
  }
  unmask() {
    // at the name of God her true face shows
    const w = this.witch; this.unmasked = true; this.frozen = true; this.player.setVelocity(0);
    banner('به نامِ یزدان', 'In the name of God'); this.cam.flash(500, 255, 255, 255); sfx('roar');
    for (let i = 0; i < 3; i++) this.time.delayedCall(i * 120, () => this.fx('poof', w.x + (i - 1) * 16, w.body.bottom - 20, { depth: 10 }));
    this.time.delayedCall(450, () => {
      w.setTexture('hag-cast', 0); this.fit(w, 'hag'); w.play('hag-cast'); w.body.setAllowGravity(false); w.setVelocity(0);
      w.baseY = w.y - 20; w.state = 'float'; w.tm = 60; w.tx = w.x; $('bossName').textContent = 'The Witch';
      toast('The beauty withers into a hideous witch! She shrieks a curse.');
      hint('A witch! <b>Dodge her green curses</b>. She vanishes and reappears: <b>strike her when she is solid</b>.');
    });
    this.time.delayedCall(1300, () => { this.frozen = false; });
  }
  witchAI() {
    const w = this.witch, p = this.player; if (!this.unmasked || w.state === undefined) return;
    w.tm--; const toP = Math.sign(p.x - w.x) || -1; w.setFlipX(toP < 0);
    const hurt = w.hp <= w.max / 2;
    if (hurt && !w.summoned) { w.summoned = true; for (const dx of [-120, 120]) { const x = Phaser.Math.Clamp(w.x + dx, 113 * TS, this.levelW - 30); this.fx('poof', x, 13 * TS); this.spawnFoe('serpent', x, 14 * TS); } toast('The witch calls serpents from the roses!'); }
    const y = w.baseY + Math.sin(this.time.now * 0.004) * 8;
    if (w.state === 'float') {
      w.setVelocity((w.tx - w.x) * 1.6, (y - w.y) * 3);
      if (w.tm <= 0) { w.state = 'cast'; w.tm = 40; w.play('hag-cast'); w.cast = false; }
    } else if (w.state === 'cast') {
      w.setVelocity(0, (y - w.y) * 3);
      if (!w.cast && w.tm < 18) {
        w.cast = true; const n = hurt ? 3 : 1;
        for (let i = 0; i < n; i++) {
          const a = Math.atan2(p.y - 8 - w.y, p.x - w.x) + (i - (n - 1) / 2) * 0.28;
          const sh = this.shoot(w.x + toP * 18, w.y - 6, Math.cos(a) * 150, Math.sin(a) * 150, 'fx-orb', { life: 3200 });
          sh.play('fx-orb'); sh.setRotation(a); this.light(sh, 0.5);
        }
        sfx('swing');
      }
      if (w.tm <= 0) {
        if (Math.random() < 0.45) { w.state = 'blink'; w.tm = 26; this.fx('poof', w.x, w.y + 10, { depth: 10 }); w.setAlpha(0); w.body.enable = false; }
        else { w.state = 'float'; w.tm = hurt ? 45 : 70; w.tx = Phaser.Math.Clamp(p.x + (Math.random() < 0.5 ? -1 : 1) * 110, 114 * TS, this.levelW - 40); }
      }
    } else if (w.state === 'blink') {
      if (w.tm <= 0) {
        const x = p.x < this.cam.scrollX + W / 2 ? this.cam.scrollX + W - 70 : this.cam.scrollX + 70;
        w.setPosition(x, w.baseY); w.body.enable = true; this.fx('poof', x, w.y + 10, { depth: 10 });
        this.tweens.add({ targets: w, alpha: 1, duration: 200 }); w.state = 'float'; w.tm = 30; w.tx = x;
      }
    }
  }
  /* ---- Khan V: a duel with Olad, and Rostam's lasso ---- */
  startOlad() {
    const o = this.physics.add.sprite(this.oladAt.x, this.oladAt.y - 40, 'olad-walk', 0).setDepth(4).setFlipX(true);
    this.fit(o, 'olad'); o.play('olad-walk'); o.state = 'walk'; o.tm = 60; o.dir = -1;
    // his shield turns frontal blows while he guards
    o.immune = () => o.state === 'guard' && Math.sign(this.player.x - o.x) === o.dir; o.immuneMsg = 'Olad catches your blow on his shield! Strike after he swings, or from behind.';
    o.ai = () => this.oladAI(); o.onDown = () => this.oladYields();
    this.arena(112 * TS, o, 10); this.olad = o;
    toast('Olad rides out to meet you, sword drawn: "Who are you, to cross the marches of Mazandaran?"');
    hint('Olad\'s <b>shield blocks blows from the front</b>. Strike <b>just after his sword swing</b>, or jump over him and hit his back.');
  }
  oladAI() {
    const o = this.olad, p = this.player; o.tm--; const d = p.x - o.x;
    if (o.state !== 'slash') { o.dir = Math.sign(d) || -1; o.setFlipX(o.dir < 0); }
    if (o.state === 'walk') {
      o.setVelocityX(o.dir * 70); if (o.anims.currentAnim?.key !== 'olad-walk') o.play('olad-walk');
      if (Math.abs(d) < 70 || o.tm <= 0) { o.state = 'slash'; o.tm = 30; o.setVelocityX(o.dir * 40); o.play('olad-slash'); sfx('swing'); o.hit = false; }
    } else if (o.state === 'slash') {
      if (!o.hit && o.tm < 20) { o.hit = true; this.hazard(o.dir > 0 ? o.x + 4 : o.x - 46, o.body.top + 4, 42, 30, 140); }
      if (o.tm <= 0) { o.state = 'guard'; o.tm = 55 + Math.random() * 30; o.setVelocityX(0); o.anims.stop(); o.setFrame(0); }
    } else if (o.state === 'guard') {
      o.setVelocityX(0); if (o.tm <= 0) { o.state = 'walk'; o.tm = 90; if (Math.random() < 0.4) o.setVelocity(-o.dir * 150, -200); }
    }
  }
  oladYields() {
    // Olad is not slain: he kneels, Rostam's lasso binds him, and he becomes the guide
    const o = this.olad, p = this.player; o.state = 'down'; o.setVelocity(0); o.body.enable = false; o.play('olad-kneel');
    $('boss').classList.add('hidden'); this.wall?.destroy(); this.frozen = true; p.setVelocityX(0); sfx('win');
    const rope = this.add.graphics().setDepth(8); let t = 0;
    const draw = () => {
      t = Math.min(1, t + 0.05); rope.clear(); rope.lineStyle(2, 0xc8a060, 1);
      const x0 = p.x + this.face * 10, y0 = p.y - 10, x1 = Phaser.Math.Linear(x0, o.x, t), y1 = Phaser.Math.Linear(y0, o.y - 4, t) - Math.sin(t * Math.PI) * 30;
      rope.beginPath(); rope.moveTo(x0, y0); rope.lineTo((x0 + x1) / 2, Math.min(y0, y1) - 12); rope.lineTo(x1, y1); rope.strokePath();
      if (t >= 1) rope.strokeEllipse(o.x, o.y - 4, 30, 14);
    };
    this.time.addEvent({ delay: 16, repeat: 40, callback: draw });
    banner('کمند', "Rostam's Lasso");
    this.time.delayedCall(1200, () => toast('Olad yields: "Spare me, and I will lead you to Arzhang Div and to the White Div\'s cave."'));
    this.time.delayedCall(3400, () => this.win({ destroy() {} }));
  }
  /* ---- Khan VI: the horde, and Arzhang Div ---- */
  startHorde() {
    // gates of fire close behind and before Rostam while the Divs come in waves
    this.horde = { wave: 0, live: [] }; const x = this.hordeAt.x;
    this.gates = [x - 13 * TS, x + 13 * TS].map(gx => {
      const r = this.add.rectangle(gx, 0, 10, ROWS * TS, 0, 0).setOrigin(0.5, 0); this.physics.add.existing(r, true); this.physics.add.collider(this.player, r);
      const f = this.fx('fire', gx, 14 * TS, { depth: 6 }); const g = this.add.image(gx, 13 * TS, 'glow').setScale(1.4).setBlendMode(Phaser.BlendModes.ADD).setDepth(5); this.light(g, 1.2, 0.1);
      return { r, f, g };
    });
    banner('سپاهِ دیوان', 'The Horde of the Divs'); hint('The gates are shut! <b>Survive three waves of Divs</b>. Keep moving, and strike as they land.'); this.drums = this.time.addEvent({ delay: 420, loop: true, callback: () => tone(70, 0.25, { type: 'sine', vol: 0.22, to: 40 }) });
    this.time.delayedCall(900, () => this.hordeWave());
  }
  hordeWave() {
    const h = this.horde, x = this.hordeAt.x, waves = [['d', 'd', 'w'], ['w', 'd', 'w', 'd'], ['w', 'w', 'd', 'd', 'w']];
    const list = waves[h.wave]; h.wave++; toast(`Wave ${h.wave} of 3: the Divs pour in!`);
    list.forEach((k, i) => this.time.delayedCall(i * 420, () => {
      const side = i % 2 ? 1 : -1, sx = x + side * 10 * TS;
      this.fx('poof', sx, 13 * TS + 8, { depth: 10 });
      h.live.push(this.spawnFoe(k === 'w' ? 'divwarrior' : 'div', sx, 14 * TS));
    }));
    h.spawning = this.time.now + list.length * 420 + 200;
  }
  hordeTick() {
    const h = this.horde; if (this.time.now < h.spawning) return;
    if (h.live.every(f => !f.active || !f.body.enable)) {
      if (h.wave < 3) { h.live = []; this.hordeWave(); return; }
      // the last wave is broken: the gates of fire die down
      this.horde = null; this.hordeDone = true; this.drums.remove(); sfx('win'); hint('The gates open. <b>Arzhang waits ahead</b>: light the last fire before you face him.');
      for (const g of this.gates) { g.r.destroy(); g.f.destroy(); this.tweens.add({ targets: g.g, alpha: 0, duration: 600 }); }
      toast('The horde is broken! The way to Arzhang lies open.');
    }
  }
  startArzhang() {
    const a = this.physics.add.sprite(this.arzhangAt.x, this.arzhangAt.y - 60, 'arzhang-walk', 0).setDepth(4).setFlipX(true);
    this.fit(a, 'arzhang'); a.play('arzhang-walk'); a.state = 'walk'; a.tm = 80; a.dir = -1;
    a.ai = () => this.arzhangAI(); a.onDown = () => this.bossFall(a);
    this.arena(124 * TS, a, 14); this.light(a, 2); sfx('roar'); this.cam.shake(500, 0.008);
    this.drums = this.time.addEvent({ delay: 500, loop: true, callback: () => tone(62, 0.3, { type: 'sine', vol: 0.2, to: 38 }) });
    toast('Arzhang Div rises from his throne of bones: "Who dares walk into my camp?"');
    hint('Arzhang\'s axe <b>splits the ground both ways: jump the wave</b>, then <b>strike him before he lifts it again</b>.');
  }
  arzhangAI() {
    const a = this.boss, p = this.player; a.tm--; const d = p.x - a.x, hurt = a.hp <= a.max / 2;
    if (a.state !== 'smash' && a.state !== 'charge') { a.dir = Math.sign(d) || -1; a.setFlipX(a.dir < 0); }
    if (hurt && !a.summoned) { a.summoned = true; for (const dx of [-140, 140]) { const x = Phaser.Math.Clamp(a.x + dx, 125 * TS, this.levelW - 30); this.fx('poof', x, 13 * TS + 8); this.spawnFoe('div', x, 14 * TS); } toast('Arzhang roars for his Divs!'); }
    if (a.state === 'walk') {
      a.setVelocityX(a.dir * (hurt ? 60 : 42)); if (a.anims.currentAnim?.key !== 'arzhang-walk') a.play('arzhang-walk');
      if (Math.abs(d) < 110 || a.tm <= 0) {
        if (Math.abs(d) > 150 && Math.random() < 0.5) { a.state = 'charge'; a.tm = 50; a.setVelocityX(a.dir * 210); sfx('roar'); }
        else { a.state = 'smash'; a.tm = 46; a.setVelocityX(0); a.play('arzhang-smash'); a.hit = false; }
      }
    } else if (a.state === 'smash') {
      if (!a.hit && a.tm < 22) { a.hit = true; const x = a.x + a.dir * 44; this.hazard(a.dir > 0 ? a.x + 10 : a.x - 70, a.body.top + 10, 60, 50, 180); this.shockwave(x, a.body.bottom); if (hurt) this.time.delayedCall(350, () => a.active && this.shockwave(x, a.body.bottom)); }
      if (a.tm <= 0) { a.state = 'walk'; a.tm = hurt ? 60 : 90; }
    } else if (a.state === 'charge') {
      if (a.tm <= 0 || a.body.blocked.left || a.body.blocked.right) { a.setVelocityX(0); a.state = 'walk'; a.tm = 70; this.cam.shake(220, 0.01); }
    }
  }
  /* ---- Khan VII: lightning on the mountain, the White Div, and the king set free ---- */
  lightning(x) {
    const t = this.groundAt(x); if (t === null) return;
    const y = t * TS, mark = this.add.image(x, y - 2, 'glow').setScale(0.7, 0.25).setTint(0x8ab0ff).setBlendMode(Phaser.BlendModes.ADD).setDepth(5);
    this.tweens.add({ targets: mark, alpha: 0.3, yoyo: true, repeat: 3, duration: 110 });
    this.time.delayedCall(720, () => {
      mark.destroy(); if (this.done) return;
      this.fx('bolt', x, y + 2, { depth: 10 }); this.hazard(x - 12, y - 64, 24, 64, 220); this.cam.flash(120, 200, 220, 255);
      tone(110, 0.6, { type: 'sawtooth', vol: 0.12, to: 40 });
    });
  }
  groundAt(x) { for (let r = 2; r < ROWS; r++) { const t = this.layer.getTileAtWorldXY(x, r * TS + 2); if (t && t.collides) return r; } return null; }
  startWhiteDiv() {
    const w = this.physics.add.sprite(this.whiteAt.x, this.whiteAt.y - 60, 'whitediv-walk', 0).setDepth(4).setFlipX(true);
    this.fit(w, 'whitediv'); w.play('whitediv-walk'); w.state = 'walk'; w.tm = 90; w.dir = -1;
    w.ai = () => this.whiteAI(); w.onDown = () => this.bossFall(w, () => this.whiteFallen());
    this.arena(146 * TS, w, 18); this.light(w, 2.4); sfx('roar'); this.cam.shake(700, 0.01);
    toast('The White Div rises from the dark like a mountain of snow: "So, the son of Zal comes at last."');
    hint('<b>Jump the shockwave of his slam</b>, then strike. When he lifts a boulder, <b>move away from where it will land</b>.');
  }
  whiteAI() {
    const w = this.boss, p = this.player; w.tm--; const d = p.x - w.x, mad = w.hp <= w.max / 2;
    if (mad && !w.mad) { w.mad = true; w.setTint(0xffd0d0); sfx('roar'); this.cam.shake(600, 0.012); banner('خشمِ دیو', 'The White Div rages'); }
    if (w.state === 'walk') { w.dir = Math.sign(d) || -1; w.setFlipX(w.dir < 0); }
    if (w.state === 'walk') {
      w.setVelocityX(w.dir * (mad ? 58 : 36)); if (w.anims.currentAnim?.key !== 'whitediv-walk') w.play('whitediv-walk');
      if (w.tm <= 0 || Math.abs(d) < 90) {
        w.setVelocityX(0);
        if (Math.abs(d) > 130 && Math.random() < 0.6) { w.state = 'throw'; w.tm = 50; w.play('whitediv-throw'); w.hit = false; }
        else { w.state = 'slam'; w.tm = 52; w.play('whitediv-smash'); w.hit = false; }
      }
    } else if (w.state === 'slam') {
      if (!w.hit && w.tm < 12) {
        w.hit = true; const x = w.x + w.dir * 40;
        this.hazard(w.dir > 0 ? w.x + 10 : w.x - 66, w.body.top + 10, 56, 60, 180); this.shockwave(x, w.body.bottom);
        if (mad) this.time.delayedCall(380, () => w.active && w.hp > 0 && this.shockwave(x, w.body.bottom));
      }
      if (w.tm <= 0) { w.state = 'walk'; w.tm = mad ? 55 : 85; }
    } else if (w.state === 'throw') {
      if (!w.hit && w.tm < 24) {
        w.hit = true; const n = mad ? 2 : 1;
        for (let i = 0; i < n; i++) {
          const tx = p.x + (i ? 50 * -w.dir : 0), t = 0.9 + i * 0.15, vx = (tx - w.x) / t, vy = -(0.5 * 700 * t);
          this.shoot(w.x + w.dir * 30, w.body.top + 10, vx, vy, 'boulder', { gravity: 700, spin: 8, life: 2500 });
        }
        sfx('swing');
      }
      if (w.tm <= 0) { w.state = 'walk'; w.tm = mad ? 55 : 85; }
    }
  }
  whiteFallen() {
    this.whiteDown = true; this.boss = null;
    toast('The White Div is slain. Rostam takes the blood of its heart and goes to find the king.');
    hint('<b>Walk to Kay Kavus</b>, chained at the back of the cave.');
  }
  freeKing() {
    // the blood of the White Div's heart opens the king's eyes
    this.ended = true; this.frozen = true; const p = this.player, k = this.kavus; p.setVelocityX(0); this.face = 1;
    this.pose = 'rostam-drink'; p.play('rostam-drink');
    this.time.delayedCall(900, () => {
      this.fx('beam', k.x, k.y + 1, { depth: 6 }); this.cam.flash(700, 255, 250, 220); sfx('win');
      k.play('kavus-sight'); this.light(k, 2.2);
      banner('کاووس شاه', 'The king sees again');
    });
    this.time.delayedCall(2600, () => toast('"Rostam!" cries Kay Kavus. "My eyes are opened, and Iran is saved."'));
    this.time.delayedCall(4800, () => this.win({ destroy() {} }));
  }
  /* ---- Khan II: thirst, wells, the ram and the spring ---- */
  renderWater() { const w = Math.round(this.water); $('water').style.width = w + '%'; $('waterPill').classList.toggle('low', w < 25); }
  drinkAt(a) {
    this.water = 100; this.renderWater(); sfx('coin'); this.fx('splash', a.x, a.y - 14);
    this.fx('pickup', a.x, a.y - 20); toast('Rostam drinks deep from the well and fills his skins. He will return here if he falls.');
  }
  prayForWater() {
    // the storm and the thirst bring Rostam to his knees; he prays, and a ram appears in a shaft of light
    this.prayed = true; this.frozen = true; this.pose = 'rostam-drink';
    this.player.setVelocityX(0); this.player.play({ key: 'rostam-drink', frameRate: 4 }); this.time.delayedCall(700, () => this.player.anims.pause());
    toast('Rostam falls to his knees and prays: "O Lord, You alone can save me now."');
    const x = this.ramAt.x + 7 * TS, y = this.ramAt.y;
    this.time.delayedCall(1600, () => {
      this.fx('beam', x, y + 1, { depth: 4 }); sfx('fire'); this.cam.flash(400, 255, 236, 180);
      this.banish(x - 12 * TS, this.levelW);   // the creatures of the waste flee from the light
      const r = this.ram = this.physics.add.sprite(x, y - 30, 'ram-walk', 0).setAlpha(0).setDepth(4);
      this.fit(r, 'ram'); this.physics.add.collider(r, this.layer);
      this.tweens.add({ targets: r, alpha: 1, duration: 700 });
      r.glow = this.add.image(x, y - 22, 'glow').setScale(1.4).setBlendMode(Phaser.BlendModes.ADD).setDepth(3).setTint(0xfff0b0);
    });
    this.time.delayedCall(3600, () => {
      this.player.anims.resume(); this.pose = null; this.frozen = false;
      toast('A ram, glowing like the dawn. It turns, and waits. Follow it.');
      hint('<b>Follow the glowing ram</b>: it leads you to a spring. Step into the water to drink.');
    });
  }
  ramGuide(k) {
    const r = this.ram, p = this.player, d = r.x - p.x, end = this.springAt.x + 4 * TS;
    // it keeps a little ahead of Rostam, hurrying if he presses on, and turns to wait if he falls far behind
    const vx = r.x >= end || d > 150 ? 0 : Phaser.Math.Clamp((p.x + 70 - r.x) * 2.2, 0, 150);
    r.setVelocityX(vx); r.setFlipX(d > 150);
    if (vx > 8 && r.body.blocked.right && r.body.blocked.down) r.setVelocityY(-260);   // hop up the dune steps
    if (vx > 8) { if (r.anims.currentAnim?.key !== 'ram-walk' || !r.anims.isPlaying) r.play('ram-walk'); r.anims.timeScale = Math.max(0.8, vx / 62); }
    else { r.anims.stop(); r.setFrame(0); }
    r.glow.setPosition(r.x, r.y + 2);
  }
  // foes in a stretch of the level vanish in smoke
  banish(x0, x1) {
    for (const f of this.foes.getChildren()) if (f.body.enable && f.x > x0 && f.x < x1) {
      f.body.enable = false; this.fx('poof', f.x, f.body.bottom - 14, { depth: 10 });
      this.tweens.add({ targets: f, alpha: 0, duration: 250, onComplete: () => f.destroy() });
    }
  }
  reachSpring() {
    this.drank = true; this.frozen = true; const p = this.player; p.setVelocityX(0); this.banish(p.x - 10 * TS, this.levelW);
    this.pose = 'rostam-drink'; p.play('rostam-drink'); sfx('coin');
    this.time.delayedCall(700, () => { this.fx('splash', p.x + this.face * 18, p.body.bottom - 2, { depth: 6 }); this.water = 100; this.renderWater(); });
    if (this.ram) this.tweens.add({ targets: [this.ram, this.ram.glow], alpha: 0, delay: 600, duration: 1400 });
    this.time.delayedCall(2400, () => this.win({ destroy() {} }));
  }
}

let resumeAt = null;           // the last fire lit in this labour: { n, i, well, coins, kills, t }
function begin(n = cur, rise = false) {
  audio(); ['s-title', 's-win', 's-dead', 's-pause', 's-map'].forEach(id => $(id).classList.add('hidden'));
  $('touch').classList.toggle('hidden', !touch); $('boss').classList.add('hidden');
  const sc = game.scene.getScene('play');
  if (!sc.player) { sc.events.once('create', () => begin(n, rise)); return; }     // still loading: start once it is ready
  if (!rise || resumeAt?.n !== n) resumeAt = null; sc.resuming = !!resumeAt;
  if (paused) { paused = false; game.scene.resume('play'); }
  const changed = n !== cur; cur = n; store.set('sh-cur', n);
  if (sc.done || sc.started || changed) { $('toast').classList.remove('on'); hint(null); sc.scene.restart(); }   // a fresh scene brings its own hint
  sc.started = true; playing = true; music(true); document.body.classList.add('playing');
}
// the road of seven labours: pick any labour you have reached
const NAMES = ['', ['The Lion', 'یکم'], ['The Desert', 'دوم'], ['The Dragon', 'سوم'], ['The Witch', 'چهارم'], ['Olad', 'پنجم'], ['Arzhang Div', 'ششم'], ['The White Div', 'هفتم']];
const BLURB = ['', 'Among the reeds a great lion stirs in the dark.', 'A waterless desert under a burning sun. Find water, or die of thirst.',
  'Night, a cave mouth, and a dragon that only Rakhsh can see.', 'A feast in a garden, and a beautiful hostess who is not what she seems.',
  'A green land guarded by the warden Olad and his men.', 'The war camp of the Div chieftain Arzhang.', 'Seven mountains, a cave as dark as night, and the White Div.'];
let pick = cur, mapFrom = null;
// where each labour sits on the painted map (percent of its width and height): reeds, desert, dark hills, garden, castle, camp, cave
const MAP_AT = [null, [11.7, 64], [27, 27], [40, 38], [40, 74], [55, 48], [84, 85], [93, 62]];
const bestOf = n => +(store.get(n === 1 ? 'sh-best' : 'sh-best-' + n) || 0);
function renderMap() {
  const u = unlocked();
  const path = MAP_AT.slice(1).map(([x, y]) => `${x},${y}`).join(' ');
  $('road').innerHTML = `<svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><polyline points="${path}" fill="none" stroke="#9a2a1c" stroke-width="2.5" stroke-dasharray="1 5" stroke-linecap="round" vector-effect="non-scaling-stroke"/></svg>` +
    NAMES.slice(1).map(([name], i) => {
      const n = i + 1, open = n <= u && LEVELS[n], done = n < u, [x, y] = MAP_AT[n];
      return `<li style="left:${x}%;top:${y}%"><button data-n="${n}" class="${n === pick ? 'sel' : ''} ${done ? 'done' : ''}" ${open ? '' : 'disabled'} aria-label="Labour ${n}: ${name}${open ? '' : ' (locked)'}">${ROMAN[n]}</button></li>`;
    }).join('');
  $('road').querySelectorAll('button').forEach(b => b.onclick = () => { pick = +b.dataset.n; renderMap(); });
  const ready = !!LEVELS[pick] && pick <= u, best = bestOf(pick);
  $('mapInfo').innerHTML = `<span class="pf">${NAMES[pick][1]}</span><em>Khan ${ROMAN[pick]}: ${NAMES[pick][0]}.</em> ${BLURB[pick]}${best ? ` <em>Best time ${Math.floor(best / 60)}:${String(best % 60).padStart(2, '0')}.</em>` : ''}${LEVELS[pick] ? '' : ' <br>This part of the road is still being built.'}`;
  $('rideBtn').disabled = !ready; $('mapTale').disabled = !document.getElementById('tale-' + pick);
}
function openMap() {
  music(A.want);                                                   // a click: the menu theme may begin
  if (playing) setPaused(true);
  mapFrom = document.querySelector('.ov:not(.hidden):not(#s-map)'); mapFrom?.classList.add('hidden');
  pick = Math.min(unlocked(), LABOURS); if (!LEVELS[pick]) pick = cur;
  renderMap(); $('s-map').classList.remove('hidden'); $('rideBtn').focus();
}
function closeMap() { $('s-map').classList.add('hidden'); (mapFrom || $('s-title')).classList.remove('hidden'); }
document.querySelectorAll('[data-map]').forEach(b => b.onclick = openMap);
$('mapClose').onclick = closeMap; $('rideBtn').onclick = () => begin(pick);
$('mapTale').onclick = () => openStory(0, pick);
$('nextBtn').onclick = () => begin(cur + 1);
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
// a standing line under the HUD: what to do right now. It changes as the labour unfolds.
function hint(html) {
  const h = $('hint'); if (!html) { h.classList.add('hidden'); h.dataset.t = ''; return; }
  if (h.dataset.t === html) return; h.dataset.t = html; h.innerHTML = html;
  h.classList.remove('hidden', 'new'); void h.offsetWidth; h.classList.add('new');
}
function toast(msg) { const t = $('toast'); t.textContent = msg; t.classList.add('on'); clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('on'), 3200); }
function banner(fa, name) {
  const lv = LEVELS[cur], b = $('banner');
  b.querySelector('.fa').textContent = fa || lv.bossFa || lv.fa; b.querySelector('h2').textContent = name || lv.bossName || lv.name;
  b.classList.remove('on'); void b.offsetWidth; b.classList.add('on');
}
// the tale, paged like a manuscript
let pages = [], pg = 0, storyFrom = null;
function showPage(i) {
  pg = Phaser.Math.Clamp(i, 0, pages.length - 1);
  $('leaf').replaceChildren(pages[pg].cloneNode(true)); $('leaf').scrollTop = 0;
  $('dots').innerHTML = pages.map((_, k) => `<i class="${k === pg ? 'on' : ''}"></i>`).join('');
  $('prevPg').disabled = pg === 0; $('nextPg').textContent = pg === pages.length - 1 ? 'Close' : 'Next \u2192';
}
const turn = d => (pg === pages.length - 1 && d > 0 ? closeStory() : showPage(pg + d));
function openStory(i = 0, n = cur) {
  music(A.want);
  if (playing) setPaused(true);
  pages = [...(document.getElementById('tale-' + n) || $('tale-1')).content.querySelectorAll('article')];
  storyFrom = document.querySelector('.ov:not(.hidden):not(#s-story)');
  storyFrom?.classList.add('hidden'); $('s-story').classList.remove('hidden'); showPage(i); $('nextPg').focus();
}
function closeStory() { $('s-story').classList.add('hidden'); (storyFrom || $('s-title')).classList.remove('hidden'); storyFrom?.querySelector('.btn')?.focus(); }
document.querySelectorAll('[data-story]').forEach(b => b.onclick = () => openStory(+b.dataset.story || 0, cur));
$('prevPg').onclick = () => turn(-1); $('nextPg').onclick = () => turn(1); $('storyClose').onclick = closeStory;
$('pauseBtn').onclick = () => setPaused(true); $('resumeBtn').onclick = () => setPaused(false);
$('restartBtn').onclick = () => { const sc = game.scene.getScene('play'); sc.done = true; begin(); };
addEventListener('blur', () => { if (playing) setPaused(true); });
game = new Phaser.Game({
  type: Phaser.AUTO, parent: 'game', width: W, height: H, pixelArt: true, backgroundColor: '#06060c',
  scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
  physics: { default: 'arcade', arcade: { gravity: { y: 900 }, debug: location.hash === '#physics' } },
  scene: [Play]
});
$('playBtn').onclick = () => (unlocked() > 1 ? openMap() : begin(1)); $('againBtn').onclick = () => begin(); $('retryBtn').onclick = () => begin(cur, true); $('freshBtn').onclick = () => begin();
$('muteBtn').onclick = () => { audio(); setMuted(!A.muted); };
setMuted(A.muted);
if (location.hash === '#debug') window.__sh = { game, scene: () => game.scene.getScene('play'), keys, pressed, setPaused, openStory, begin, openMap, LEVELS, FOES, snd: { A, audio, sfx, pickTrack } };
})();
