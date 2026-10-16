/* Shahnameh: The Seven Labours of Rostam. Khan I, the Lion of the Reeds.
   Built on Phaser 3. Placeholder pixel art is generated in code; drop PixelLab
   sprite strips into ./assets and list them in ART below to replace it. */
(() => {
'use strict';
const $ = id => document.getElementById(id);
const store = { get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }, set(k, v) { try { localStorage.setItem(k, v); } catch (e) {} } };
// what the provisions are for. Every one goes into Rostam's purse, kept from labour to labour and spent at the fire
// altars on lasting gifts; every one also feeds his Farr (divine glory), which when full can be unleashed; and eight
// in one labour feed Rakhsh well enough that he rides into that labour's boss fight
const UPGRADES = [
  { id: 'heart', name: 'Heart of Zal', fa: 'دلِ زال', desc: 'One more heart, for good.', costs: [25, 40] },
  { id: 'wings', name: 'Wings of the Simurgh', fa: 'پرِ سیمرغ', desc: 'A higher super jump.', costs: [15] },
  { id: 'reach', name: 'Arm of Rostam', fa: 'بازوی رستم', desc: 'The mace reaches further.', costs: [20] },
  { id: 'mace', name: 'Mace of Sam', fa: 'گرزِ سام', desc: 'A heavier mace: double damage to foes, and more to bosses.', costs: [40] }
];
const purse = () => +(store.get('sh-purse') || 0), setPurse = n => store.set('sh-purse', n);
const upg = () => { try { return JSON.parse(store.get('sh-upg') || '{}'); } catch (e) { return {}; } }, setUpg = u => store.set('sh-upg', JSON.stringify(u));
const FED = 8;                                                   // provisions in one labour that feed Rakhsh

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
  'ride-gallop': 'k3/ride-gallop.png', 'ride-strike': 'k3/ride-strike.png', 'ride-rear': 'k3/ride-rear.png',
  'scorpion-crawl': 'k2/scorpion-crawl.png', 'scorpion-sting': 'k2/scorpion-sting.png', 'vulture-fly': 'k2/vulture-fly.png', 'ram-walk': 'k2/ram-walk.png', 'rostam-drink': 'rostam-drink.png',
  // Khan III
  'dragon-move': 'k3/dragon-move.png', 'dragon-fire': 'k3/dragon-fire.png', 'rakhsh-gallop': 'k3/rakhsh-gallop.png', 'rakhsh-rear': 'k3/rakhsh-rear.png', 'bat-fly': 'k3/bat-fly.png',
  // Khan IV
  'serpent': 'k4/serpent.png', 'serpent-strike': 'k4/serpent-strike.png', 'hag-cast': 'k4/hag-cast.png', 'beauty-idle': 'k4/beauty-idle.png',
  // Khan V
  'spearman-walk': 'k5/spearman-walk.png', 'spearman-thrust': 'k5/spearman-thrust.png', 'olad-walk': 'k5/olad-walk.png', 'olad-slash': 'k5/olad-slash.png', 'olad-kneel': 'k5/olad-kneel.png',
  // Khan VI
  'divwarrior-walk': 'k6/divwarrior-walk.png', 'divwarrior-smash': 'k6/divwarrior-smash.png', 'arzhang-walk': 'k6/arzhang-walk.png', 'arzhang-smash': 'k6/arzhang-smash.png', 'arzhang-die': 'k6/arzhang-die.png',
  // Khan VII
  'whitediv-walk': 'k7/whitediv-walk.png', 'whitediv-smash': 'k7/whitediv-smash.png', 'whitediv-throw': 'k7/whitediv-throw.png', 'whitediv-die': 'k7/whitediv-die.png', 'kavus-sight': 'k7/kavus-sight.png'
};
const FPS = { 'rostam-idle': 5, 'rostam-run': 14, 'rostam-jump': 6, 'rostam-attack': 24, 'rostam-hurt': 10, 'lion-walk': 9, 'lion-run': 14, 'lion-roar': 6, 'jackal-run': 12, 'div-hop': 8, 'coin-spin': 8, 'fire-burn': 10,
  'scorpion-crawl': 10, 'vulture-fly': 10, 'ram-walk': 8, 'rostam-drink': 6, 'ride-gallop': 12, 'ride-strike': 18, 'ride-rear': 11,
  'dragon-move': 7, 'dragon-fire': 9, 'rakhsh-gallop': 12, 'rakhsh-rear': 9, 'bat-fly': 14,
  'serpent': 8, 'hag-cast': 10, 'beauty-idle': 4,
  'spearman-walk': 10, 'spearman-thrust': 12, 'olad-walk': 10, 'olad-slash': 14, 'olad-kneel': 8,
  'divwarrior-walk': 8, 'divwarrior-smash': 13, 'arzhang-walk': 7, 'arzhang-smash': 9,
  'whitediv-walk': 6, 'whitediv-smash': 11, 'whitediv-throw': 10, 'whitediv-die': 7, 'arzhang-die': 7, 'serpent-strike': 16, 'scorpion-sting': 16, 'kavus-sight': 5 };
// on-screen frame height in game pixels; equal to the PixelLab frame size so sprites draw 1:1
const SIZE = { rider: 124, rostam: 112, lion: 148, jackal: 108, div: 108, scorpion: 86, vulture: 92, ram: 86, dragon: 136, rakhsh: 104, bat: 108, serpent: 92, hag: 108, beauty: 108, spearman: 140, olad: 112, divwarrior: 100, arzhang: 136, whitediv: 136 };
const BODY = { rider: [0.3, 0.5], rostam: [0.143, 0.393], lion: [0.5, 0.36], jackal: [0.3, 0.22], div: [0.22, 0.34], scorpion: [0.4, 0.22], vulture: [0.33, 0.2], ram: [0.4, 0.4],
  dragon: [0.46, 0.42], rakhsh: [0.5, 0.5], bat: [0.32, 0.24], serpent: [0.31, 0.31], hag: [0.27, 0.42], beauty: [0.2, 0.47], spearman: [0.115, 0.386], olad: [0.17, 0.49], divwarrior: [0.31, 0.64], arzhang: [0.3, 0.7], whitediv: [0.4, 0.58] };
const V = 53;
const ZOOM = 2;                                                   // canvas pixels per world pixel   // bump to bust caches when assets change

// PixelLab VFX strips in ./assets/fx: frame size, frame count, fps, and the effect's origin as a fraction of the frame
const FX = {
  hit: { w: 67, h: 49, n: 8, fps: 16, ox: 0.493, oy: 0.469 }, swing: { w: 61, h: 57, n: 9, fps: 30, ox: 0.443, oy: 0.596 },
  dust: { w: 53, h: 29, n: 8, fps: 16, ox: 0.491, oy: 0.448 }, pickup: { w: 43, h: 49, n: 10, fps: 18, ox: 0.488, oy: 0.653 },
  poof: { w: 56, h: 45, n: 10, fps: 14, ox: 0.536, oy: 0.6 }, heal: { w: 36, h: 60, n: 12, fps: 14, ox: 0.5, oy: 0.7 },
  stun: { w: 39, h: 23, n: 12, fps: 12, ox: 0.487, oy: 0.652, loop: true }, fire: { w: 27, h: 27, n: 12, fps: 12, ox: 0.481, oy: 0.815, loop: true },
  fireflies: { w: 172, h: 141, n: 16, fps: 8, ox: 0.483, oy: 0.418, loop: true }, glow: { w: 53, h: 79, n: 12, fps: 10, ox: 0.491, oy: 0.506, loop: true },
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
  // the lion's arena (86 to 116): a ledge at each side to leap onto from its charge
  row(88, 92, 11, '='); row(101, 105, 11, '=');
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
  [[11, 11], [26, 10], [58, 8], [70, 10]].forEach(([c, r]) => put(c, r, 'm'));          // marsh lights, never beside an altar
  put(42, 13, 'F'); put(84, 13, 'F');
  put(117, 13, 'K'); put(146, 13, 'D');
  row(114, 118, 11, '='); row(136, 140, 11, '=');          // the dragon's arena (112 to 142): a ledge at each side
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
  [[6, 11], [28, 11], [64, 11], [78, 11], [132, 11], [146, 11]].forEach(([c, r]) => put(c, r, 'l'));   // lanterns, never beside an altar
  put(48, 13, 'F'); put(92, 13, 'F');
  put(120, 13, 'T'); put(128, 13, 'W');
  row(113, 116, 11, '='); row(137, 141, 11, '=');          // the garden arena (112 to 142): a balcony at each side
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
  put(52, 13, 'F');
  put(130, 13, 'O');
  row(114, 118, 11, '='); row(136, 140, 11, '=');          // Olad's arena (112 to 142): a ledge at each side, to leap over him from
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
  // practice for the arena: a high platform at the very start, reached with the super jump, and a step up to arena height
  row(7, 11, 9, '='); row(14, 18, 8, '=');
  // the horde's arena (gates at 59 and 85): one wide jump-through platform in the middle, above even a Div warrior's head,
  // reached with the super jump; drop behind a Div to strike, then leap back up out of reach
  ground(55, 88, 14); row(68, 76, 9, '=');
  ground(89, 92, 12); pit(93, 98); row(94, 95, 10, '='); row(97, 98, 9, '='); ground(99, 159, 14); ground(105, 108, 12);
  // Arzhang's arena (124 to 154): one platform in the middle to leap onto when his axe splits the whole floor
  row(135, 143, 11, '=');
  put(3, 13, 'P');
  [[9, 8], [16, 7], [22, 10], [23, 10], [32, 12], [39, 8], [48, 12], [90, 10], [97, 7], [104, 12]].forEach(([c, r]) => put(c, r, 'c'));
  put(15, 13, 'd'); put(30, 13, 'w'); put(46, 13, 'd'); put(52, 13, 'w'); put(102, 13, 'w'); put(110, 13, 'd');
  // war fires, kept well apart from each other and from the altars (44, 100, 118)
  [[12, 13], [28, 13], [67, 13], [134, 13]].forEach(([c, r]) => put(c, r, 'B'));
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
  // the White Div's arena (146 to 176): one ice ledge in the middle, safe from his slam; one jump up
  row(157, 165, 11, '=');
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
// another ground foe just ahead in this direction: they keep their distance rather than stand inside each other
// bosses stand only on solid ground: the jump-through ledges are Rostam's, so a boss never lands on one or catches on its edge
const onFloor = (b, t) => t.index % 4 !== 2;
function crowded(s, f, dir) {
  for (const o of s.foes.getChildren()) if (o !== f && o.active && o.body.enable && o.body.allowGravity && Math.sign(o.x - f.x) === dir && Math.abs(o.x - f.x) < 36 && Math.abs(o.y - f.y) < 30) return true;
  return false;
}
// walkers never stand inside one another: any two that overlap are eased apart, each as far as the ground lets it go
function separate(s) {
  const fs = s.foes.getChildren().filter(f => f.active && f.body.enable && f.body.allowGravity);
  for (let i = 0; i < fs.length; i++) for (let j = i + 1; j < fs.length; j++) {
    const a = fs[i], b = fs[j], dx = b.x - a.x, need = (a.body.width + b.body.width) * 0.42;
    if (Math.abs(dx) >= need || Math.abs(a.body.bottom - b.body.bottom) > 20) continue;
    const push = Math.min(3, (need - Math.abs(dx)) / 2), dir = Math.sign(dx) || (i % 2 ? 1 : -1);
    const free = (f, d) => !(d > 0 ? f.body.blocked.right : f.body.blocked.left) && !s.layer.getTileAtWorldXY(f.x + d * (f.body.width / 2 + 2), f.body.bottom - 6)?.collides;
    if (free(a, -dir)) a.x -= dir * push; else if (free(b, dir)) b.x += dir * push;
    if (free(b, dir)) b.x += dir * push; else if (free(a, -dir)) a.x -= dir * push;
  }
}
// Rostam stands above this foe (up on a platform): out of reach
const above = (f, p) => p.body.bottom < f.body.top + 6;
// where a foe keeps watch when Rostam is out of reach: its own post, but never right beneath him
function postOf(s, f) {
  const post = f.post ?? f.home.x, px = s.player.x;
  return Math.abs(post - px) < 3 * TS ? px + (post < px ? -1 : 1) * 3 * TS : post;
}
// out of reach, a foe paces its own stretch of ground instead of crowding beneath him
function pace(s, f, speed, range = 2 * TS) {
  const post = postOf(s, f);
  if (Math.abs(f.x - post) > range) f.dir = Math.sign(post - f.x) || f.dir;
  if (crowded(s, f, f.dir)) {
    // someone is in the way: step back if there is room behind, otherwise wait
    if (!crowded(s, f, -f.dir) && !(f.dir > 0 ? f.body.blocked.left : f.body.blocked.right)) f.dir *= -1;
    else { f.setVelocityX(0); return; }
  }
  patrol(s, f, speed);
}
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
      f.hopT -= k; if (!f.body.blocked.down) return;
      if (above(f, p)) { f.setVelocityX(0); if (f.hopT <= 0) { const post = postOf(s, f); f.dir = Math.abs(f.x - post) > TS ? Math.sign(post - f.x) : (Math.random() < 0.5 ? -1 : 1); f.setFlipX(f.dir < 0); f.setVelocity(crowded(s, f, f.dir) ? 0 : f.dir * 50, -200); f.hopT = 80 + Math.random() * 40; } return; }
      f.dir = Math.sign(p.x - f.x) || 1; f.setFlipX(f.dir < 0); f.setVelocityX(0);
      if (f.hopT <= 0 && Math.abs(p.x - f.x) < 200) { f.setVelocity(crowded(s, f, f.dir) ? 0 : f.dir * 70, -230); f.hopT = 70; }
    }
  },
  // scorpions creep, then scuttle at Rostam when he comes close on the same level, and lash out with the sting
  scorpion: {
    tex: 'scorpion-crawl', hp: 2,
    tick(s, f, k, p) {
      f.cool = (f.cool || 0) - k;
      if (f.sting) { f.setVelocityX(0); return; }
      const dx = p.x - f.x;
      if (f.cool <= 0 && Math.abs(dx) < 46 && Math.abs(p.body.bottom - f.body.bottom) < 24 && f.body.blocked.down) {
        f.sting = true; f.cool = 80; f.dir = Math.sign(dx) || 1; f.setFlipX(f.dir < 0); f.setVelocityX(0); f.anims.timeScale = 1; f.play('scorpion-sting');
        s.time.delayedCall(250, () => { if (f.active && f.body.enable) { s.hazard(f.dir > 0 ? f.body.right - 4 : f.body.left - 26, f.body.top - 14, 30, f.body.height + 14, 140); sfx('swing'); } });
        f.once('animationcomplete', () => { if (f.active) { f.sting = false; f.play('scorpion-crawl'); } });
        return;
      }
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
      // having given up on a chase he cannot win, he stomps off the other way for a while
      if (f.bored > 0) { f.bored -= k; f.turnT = undefined; patrol(s, f, 30); return; }
      if (above(f, p)) { f.turnT = undefined; pace(s, f, 26); return; }
      const d = p.x - f.x, want = Math.sign(d) || f.dir;
      // a heavy brute: it takes him a moment to turn about, time enough to strike his back
      if (want !== f.dir) {
        f.setVelocityX(0); f.turnT = (f.turnT ?? 48) - k;
        if (f.turnT <= 0) { f.dir = want; f.setFlipX(f.dir < 0); f.turnT = undefined; f.cool = Math.max(f.cool, 20); }
        return;
      }
      f.turnT = undefined;
      if (f.cool <= 0 && Math.abs(d) < 90 && Math.abs(p.body.bottom - f.body.bottom) < 30 && f.body.blocked.down) {
        f.smash = true; f.setVelocityX(0); f.play('divwarrior-smash');
        s.time.delayedCall(420, () => { if (!f.active || !f.body.enable) return; s.hazard(f.dir > 0 ? f.x + 8 : f.x - 48, f.body.top + 20, 40, 30, 160); s.fx('dust', f.x + f.dir * 30, f.body.bottom, { depth: 8 }); s.cam.shake(120, 0.006); sfx('hit'); });
        f.once('animationcomplete', () => { if (!f.active) return; f.smash = false; f.cool = 90; f.play('divwarrior-walk'); });
        return;
      }
      if (Math.abs(d) < 200 && f.body.blocked.down) {
        const ahead = s.layer.getTileAtWorldXY(f.x + f.dir * 14, f.body.bottom + 4), edge = !ahead || ahead.index % 4 === 3;
        const go = !crowded(s, f, f.dir) && !edge; f.setVelocityX(go ? f.dir * 38 : 0);
        // pressed against a step, a gate or the edge of a drop, or Rostam is out of reach: after a second he turns away
        const stuck = edge || Math.abs(p.body.bottom - f.body.bottom) > 30 || (go && (f.body.blocked.left || f.body.blocked.right || Math.abs(f.x - (f.lastX ?? 0)) < 0.15));
        f.stuckT = stuck ? (f.stuckT || 0) + k : 0; f.lastX = f.x;
        if (f.stuckT > 60) { f.stuckT = 0; f.bored = 90 + Math.random() * 60; f.dir *= -1; f.setFlipX(f.dir < 0); }
      } else pace(s, f, 26);
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
      if (f.cool <= 0 && Math.abs(d) < 80 && Math.abs(p.body.bottom - f.body.bottom) < 30 && f.body.blocked.down) {
        // it rears back, then lunges with its jaws wide
        const dir = Math.sign(d) || 1; f.cool = 100; f.setVelocityX(0); f.play('serpent-strike');
        s.time.delayedCall(230, () => { if (f.active && f.body.enable) { f.setVelocity(dir * 160, -110); sfx('swing'); } });
        f.once('animationcomplete', () => f.active && f.play('serpent'));
      } else if (f.body.blocked.down) f.setVelocityX(0);
    }
  },
  // vultures circle over their patch of sky, then fold their wings and dive at Rostam; bats do the same, faster
  vulture: flyer('vulture-fly', { range: 70, dive: 220, rest: 120, offY: 60 }),     // offY: the art's centre in its frame
  bat: flyer('bat-fly', { range: 46, dive: 270, rest: 70, offY: 62, speed: 0.022 })
};
function flyer(tex, { range, dive, rest, offY, speed = 0.012 }) {
  return {
    tex, hp: 1,
    init(s, f) { f.body.setAllowGravity(false); f.body.setOffset(f.body.offset.x, offY - f.body.height / f.scaleY / 2); f.t = Math.random() * 6; f.state = 'circle'; f.cool = 60 + Math.random() * 60; },
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
      hint(`Cross the reeds. <b>Strike</b> with ${touch ? 'the mace button' : '<b>X</b>'}, or land on foes from above. <b>Jump again in mid-air</b> for a higher leap. <b>Walk past a fire altar</b> to light it: you rise there if you fall.`);
    },
    fires: [82], hearts: [80],                       // a last fire and a heart before the lion's den
    update(s, k, time, p) { if (!s.bossOn && p.x > 88 * TS) s.startBoss(); },
    win: 'With the lion of the reeds slain, Rostam takes up a feather of the Simurgh. Ahead lies the waterless desert of the second labour.',
    tips: ['The lion\'s hide turns your blows. Leap its charge so it runs into the rocks, then strike while it is dazed and the gold arrow shows.',
      'Land on a foe from above to strike it twice as hard.', 'Roast lamb restores a heart. Look for it on the high ledges.',
      'Light the fire altars: if Rostam falls, he returns to the last sacred fire.', 'The blue Divs hop toward you. Strike as they land.',
      'Every provision fills your golden Farr. When it is full, press F (or tap the Farr) to call on the Simurgh: her light strikes every foe on screen.',
      'Provisions are kept in your purse from labour to labour. Stand at a lit fire and press Down (or tap Offer) to trade them for lasting gifts.',
      'Gather eight provisions in one labour and Rakhsh is well fed: he gallops in to kick the boss once.']
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
        s.pool = s.add.image(x + 26, y + 3, 'pool').setOrigin(0.5, 1).setDepth(3).setAlpha(0);   // dry until the ram's riddle is solved
      }
    },
    create(s) {
      s.water = 100; s.thirstT = 0; s.stormOn = 0; s.prayed = false;
      $('waterPill').classList.remove('hidden'); s.renderWater();
      s.stones = [147, 150, 153, 156].map((c, i) => {
        const x = c * TS + TS / 2, r = s.groundAt(x), st = s.add.image(x, r * TS, 'stone-' + i).setOrigin(0.5, 1).setDepth(2);
        st.glow = s.add.image(x, r * TS - 13, 'glow').setScale(0.9).setBlendMode(Phaser.BlendModes.ADD).setDepth(3).setAlpha(0);
        return st;
      });
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
      if (!s.frozen && !s.prayed) s.water = Math.max(0, s.water - k * (0.045 + s.stormOn * 0.045));
      if (s.water <= 0) { s.thirstT += k; if (s.thirstT > 150) { s.thirstT = 0; s.hurt(p.x, true); toast('Rostam is dying of thirst. Find water!'); } }
      s.renderWater();
      if (!s.prayed && s.ramAt && p.x > s.ramAt.x) s.prayForWater();
      if (s.ram) s.ramGuide(k);
      if (s.ram && !s.puzzle && p.x > 144 * TS) s.startStones();
      if (s.springOpen && !s.drank && p.x > s.springAt.x - 6 && b.blocked.down) s.reachSpring();
    },
    win: 'Rostam drinks from the spring the ram revealed and gives thanks. Refreshed, he rides on toward the dragon of the third labour.',
    tips: ['Water drains in the heat. Water skins refill a little; the wells refill it all.', 'Vultures circle, then dive. Strike them as they swoop low.',
      'Scorpions take two blows, and lash out with their sting up close. Jump on them, or strike twice and step back.', 'In the sandstorm the wind pushes you back. Keep moving forward.', 'At the dry rock, watch the order the ram taps the stones, then strike them in that order.', 'If your water runs dry you lose a heart every few seconds.']
  },
  3: {
    hud: 'Khan III &middot; The Dragon', winTitle: 'The dragon is slain', name: 'The Dragon of the Night', fa: 'اژدها', bossName: 'The Dragon', tiles: 'tiles-3', map: map3, mounted: true,
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
      toast('Night falls. Rostam rides Rakhsh on into the dark; the light of his torch is all he has.');
      hint('You ride <b>Rakhsh</b> tonight: faster, with a longer reach from the saddle. <b>Ride past fire altars</b> to light them: you rise at the last one if you fall.');
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
    tips: ['At the feast, stand near the lady and strike to speak the name of God.', 'Strike the witch\'s curses with your mace to send them back at her.',
      'Serpents rear back, then lunge. Strike them as they rear, or step back from the lunge.', 'Lanterns and fire altars keep the garden lit.', 'Roast lamb waits on the high balconies.']
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
    tips: ['Olad\'s shield blocks blows from the front. Step back when he flashes, then strike while he glows. His back is always open.', 'In every boss fight, a gold arrow over the foe means strike now; a grey shield means your blow will not land.', 'Spearmen have a long reach. Close in after their thrust.',
      'Land on a foe from above to strike twice as hard.', 'Fire altars mark where you return if you fall.']
  },
  6: {
    hud: 'Khan VI &middot; Arzhang Div', winTitle: 'Arzhang has fallen', name: 'The Camp of the Divs', fa: 'اَرژنگِ دیو', bossName: 'Arzhang Div', tiles: 'tiles-6', map: map6,
    load(L, q) { L.image('tiles-6', 'assets/k6/tiles.png' + q); L.image('k6-far', 'assets/k6/far.png' + q); L.image('altar', 'assets/altar.png' + q); L.image('gate', 'assets/k6/gate.png' + q); },
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
      hint('The Div camp. <b>Jump, then jump again in mid-air</b> to reach high platforms like the one above you. Div warriors\' clubs send <b>shockwaves along the ground: jump them</b>.');
    },
    fires: [118], hearts: [72, 90, 116],             // one on the arena's high platform, one past the gates, one at the last fire
    regrow: [72],                            // the platform hearts come back once Rostam has left the platform for 2 s
    resume(s) { if (s.start.x > s.hordeAt.x) s.hordeDone = true; },   // rising past the horde: it stays beaten
    update(s, k, time, p) {
      if (!s.hordeDone && !s.horde && p.x > s.hordeAt.x - 2 * TS) s.startHorde();
      if (s.horde) s.hordeTick();
      if (!s.bossOn && p.x > 124 * TS) s.startArzhang();
    },
    win: 'Rostam tears Arzhang from the field and the Div host scatters into the night. Now only the White Div remains, in his cave beyond the seven mountains.',
    tips: ['When Arzhang stamps and flushes red, he charges. Leap onto a platform; if he hits the wall, strike him while he is dazed.', 'Arzhang\'s red glow shows where his axe will strike: the floor, or the platforms. Be where it is not, then strike him while he rests.', 'When the drums sound, the gates shut. Jump twice to reach the high platforms; Divs cannot follow you up there.', 'A Div warrior turns slowly. Drop behind him and strike his back before he faces you.', 'A heart waits on the high platform of the horde\'s arena, and grows back.', 'Jump over the shockwaves from a Div warrior\'s club.',
      'Blue Divs hop at you; Div warriors take three blows.']
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
    tips: ['Lightning strikes where the ground glows. Keep moving.', 'When the floor glows blue, the White Div is about to slam: jump onto the ice ledge.', 'After his slam his club is stuck in the ice. Drop down and strike him then.', 'Stay on the ledge too long and he roars: where a light shines on the ice, an icicle falls a second later. Move!', 'When a great Div stamps and flushes red, he charges along the red streak. Leap onto a ledge; if he hits the wall, strike him while he is dazed.',
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
  // over a boss's head: a gold arrow when a blow will land, a grey shield when it will not
  layer('mark-open', 13, 11, x => {
    x.fillStyle = '#2a1404'; x.beginPath(); x.moveTo(0, 0); x.lineTo(13, 0); x.lineTo(6.5, 11); x.closePath(); x.fill();
    x.fillStyle = '#f6c94a'; x.beginPath(); x.moveTo(2, 1.2); x.lineTo(11, 1.2); x.lineTo(6.5, 8.6); x.closePath(); x.fill();
    x.fillStyle = '#fff6c8'; x.fillRect(3, 1, 4, 1);
  });
  layer('mark-guard', 12, 14, x => {
    x.fillStyle = '#1a1428'; x.beginPath(); x.moveTo(0, 0); x.lineTo(12, 0); x.lineTo(12, 7); x.lineTo(6, 14); x.lineTo(0, 7); x.closePath(); x.fill();
    x.fillStyle = '#9aa4b8'; x.beginPath(); x.moveTo(1, 1); x.lineTo(11, 1); x.lineTo(11, 7); x.lineTo(6, 12.5); x.lineTo(1, 7); x.closePath(); x.fill();
    x.fillStyle = '#5a6478'; x.fillRect(5, 1, 2, 11); x.fillStyle = '#d8deea'; x.fillRect(2, 2, 2, 4);
  });
  layer('icicle', 8, 22, x => {                            // a spear of ice from the cave roof
    x.fillStyle = '#2a3a5a'; x.beginPath(); x.moveTo(0, 0); x.lineTo(8, 0); x.lineTo(4, 22); x.closePath(); x.fill();
    x.fillStyle = '#bfe0ff'; x.beginPath(); x.moveTo(1, 1); x.lineTo(7, 1); x.lineTo(4, 19); x.closePath(); x.fill();
    x.fillStyle = '#ffffff'; x.fillRect(2, 1, 2, 9);
  });
  layer('icespike', 12, 30, x => {                          // a shard of ice bursting from the floor
    x.fillStyle = '#1e2e50'; x.beginPath(); x.moveTo(0, 30); x.lineTo(5, 0); x.lineTo(12, 30); x.closePath(); x.fill();
    x.fillStyle = '#9fd0f5'; x.beginPath(); x.moveTo(2, 29); x.lineTo(5, 3); x.lineTo(10, 29); x.closePath(); x.fill();
    x.fillStyle = '#e8f6ff'; x.beginPath(); x.moveTo(4, 28); x.lineTo(5, 4); x.lineTo(6, 28); x.closePath(); x.fill();
  });
  layer('boulder', 14, 12, x => {
    x.fillStyle = '#1a1428'; x.beginPath(); x.ellipse(7, 6, 7, 6, 0, 0, 7); x.fill();
    x.fillStyle = '#7a7890'; x.beginPath(); x.ellipse(7, 6, 6, 5, 0, 0, 7); x.fill();
    x.fillStyle = '#a8a6c0'; x.fillRect(4, 3, 3, 2); x.fillStyle = '#4a4860'; x.fillRect(8, 8, 3, 2);
  });
  // the ram's four standing stones, each carved with its own sign: sun, moon, star, water
  for (let i = 0; i < 4; i++) layer('stone-' + i, 16, 26, x => {
    x.fillStyle = '#3a2410'; x.fillRect(2, 2, 12, 24); x.fillRect(3, 1, 10, 1);
    x.fillStyle = '#c89a5a'; x.fillRect(3, 2, 10, 23); x.fillStyle = '#e8c07a'; x.fillRect(3, 2, 3, 22); x.fillStyle = '#9a6a38'; x.fillRect(11, 3, 2, 22);
    x.fillStyle = '#5a3418';
    if (i === 0) { x.fillRect(6, 9, 4, 4); x.fillRect(7, 6, 2, 2); x.fillRect(7, 14, 2, 2); x.fillRect(4, 10, 1, 2); x.fillRect(11, 10, 1, 2); }
    if (i === 1) { x.fillRect(6, 7, 3, 1); x.fillRect(5, 8, 2, 6); x.fillRect(6, 14, 3, 1); x.fillRect(9, 8, 1, 1); x.fillRect(9, 13, 1, 1); }
    if (i === 2) { x.fillRect(7, 6, 2, 10); x.fillRect(4, 10, 8, 2); x.fillRect(6, 8, 1, 1); x.fillRect(9, 8, 1, 1); x.fillRect(6, 13, 1, 1); x.fillRect(9, 13, 1, 1); }
    if (i === 3) for (const y of [7, 11, 15]) { x.fillRect(4, y, 2, 1); x.fillRect(6, y - 1, 2, 1); x.fillRect(8, y, 2, 1); x.fillRect(10, y - 1, 2, 1); }
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
    loadSamples();
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
// White Div's cave, and an orchestral action theme for every boss ("Battle Boss Fight Game Music" by alex-morgan,
// Pixabay), cut to begin at full tilt without its slow opening. The volumes even out the tracks' own loudness.
const TRACK_VOL = { menu: 1, road: 0.62, dark: 0.5, boss: 0.25 }, DARK = new Set([3, 7]);
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
  if (name === 'boss' && t.el.paused && t.el.currentTime > 0) t.el.currentTime = 0;   // every boss fight starts the battle theme afresh
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
const music = on => { A.want = on; if (audio()) { if (on && !A.muted) track('boss'); pickTrack(); } };   // the battle theme loads early, ready for the boss
// recorded effects (Pixabay, free to use, no credit needed), trimmed and levelled; [file, volume]
const SAMPLE = { swing: ['swing', 0.32], hit: ['hit', 0.4], hurt: ['hurt', 0.45], jump: ['jump', 0.22], coin: ['pickup', 0.32],
  fire: ['fire', 0.4], roar: ['roar', 0.45], neigh: ['neigh', 0.45], win: ['win', 0.5], drum: ['drum', 0.3] };
function loadSamples() {
  A.samples = {}; A.last = {};
  for (const f of new Set(Object.values(SAMPLE).map(v => v[0])))
    fetch(`assets/sfx/${f}.m4a?v=${V}`).then(r => r.arrayBuffer()).then(b => A.ctx.decodeAudioData(b)).then(buf => { A.samples[f] = buf; }).catch(() => {});
}
// play a recorded effect, a little different each time so repeats never grate; false if it is not loaded yet
function sample(k) {
  const [f, vol] = SAMPLE[k] || [], buf = A.samples?.[f]; if (!buf) return false;
  const now = A.ctx.currentTime; if (now - (A.last[k] || 0) < 0.06) return true; A.last[k] = now;
  const src = A.ctx.createBufferSource(), g = A.ctx.createGain(); src.buffer = buf;
  src.playbackRate.value = k === 'win' ? 1 : 0.93 + Math.random() * 0.14;
  g.gain.value = vol * (0.88 + Math.random() * 0.12); src.connect(g).connect(A.fx); src.start(); return true;
}
const sfx = (k) => { if (!A.ctx || A.muted) return; if (sample(k)) return; const t = A.ctx.currentTime, S = KEY; ({
  drum: () => tone(62, 0.3, { type: 'sine', vol: 0.2, to: 38 }),
  jump: () => noise(t, 0.12, { f: 500, to: 1400, q: 2, vol: 0.06 }),
  coin: () => { pluck(pitch(S, 7), t, { vol: 0.22, out: A.fx }); pluck(pitch(S, 9), t + 0.07, { vol: 0.2, out: A.fx }); },
  swing: () => noise(t, 0.16, { f: 700, to: 2600, q: 1.2, vol: 0.14 }),
  hit: () => { daf(t, 'D', 1.5, A.fx); noise(t, 0.05, { f: 2600, q: 0.8, vol: 0.12 }); },
  hurt: () => { pluck(pitch(S, 2) / 2, t, { kind: 'tar', vol: 0.4, bend: 0.75, out: A.fx }); noise(t, 0.2, { type: 'lowpass', f: 900, vol: 0.15 }); },
  neigh: () => { tone(520, 0.5, { type: 'triangle', vol: 0.07, to: 880 }); tone(700, 0.35, { type: 'triangle', vol: 0.04, to: 400, t: t + 0.25 }); noise(t, 0.6, { f: 1500, q: 4, vol: 0.04 }); },
  roar: () => { noise(t, 0.9, { type: 'lowpass', f: 700, to: 160, vol: 0.32 }); tone(85, 0.8, { type: 'sawtooth', vol: 0.06, to: 50 }); daf(t, 'D', 1.2, A.fx); },
  fire: () => [0, 2, 4, 7].forEach((d, i) => pluck(pitch(S, d + 5), t + i * 0.06, { vol: 0.16, out: A.fx })),
  stone0: () => pluck(pitch(S, 7), t, { vol: 0.25, out: A.fx }), stone1: () => pluck(pitch(S, 9), t, { vol: 0.25, out: A.fx }),
  stone2: () => pluck(pitch(S, 11), t, { vol: 0.25, out: A.fx }), stone3: () => pluck(pitch(S, 14), t, { vol: 0.25, out: A.fx }),
  win: () => { const W = { ...S, mode: 'mahur' }; [0, 2, 4, 5, 7, 9, 11, 14].forEach((d, i) => pluck(pitch(W, d), t + i * 0.11, { vol: 0.2, out: A.fx })); daf(t, 'D', 1.2, A.fx); daf(t + 0.88, 'D', 1.2, A.fx); }
})[k]?.(); };
function setMuted(m) {
  A.muted = m; store.set('sh-muted', m ? '1' : '0'); if (A.master) A.master.gain.value = m ? 0 : 0.8;
  $('muteIco').setAttribute('d', m ? 'M4 9v6h4l5 4V5L8 9z M17 9l5 6 M22 9l-5 6' : 'M4 9v6h4l5 4V5L8 9z M16 9a4 4 0 0 1 0 6 M19 6a8 8 0 0 1 0 12');
  music(!m && game && game.scene.isActive('play') && playing);
}

/* ---------------------------- input ---------------------------- */
const keys = { left: false, right: false, jump: false, attack: false, farr: false, offer: false }, pressed = { jump: false, attack: false, farr: false, offer: false };
const KEYMAP = { ArrowLeft: 'left', a: 'left', A: 'left', ArrowRight: 'right', d: 'right', D: 'right', ArrowUp: 'jump', w: 'jump', W: 'jump', ' ': 'jump', z: 'jump', Z: 'jump', x: 'attack', X: 'attack', j: 'attack', J: 'attack', k: 'attack', K: 'attack', f: 'farr', F: 'farr', ArrowDown: 'offer', s: 'offer', S: 'offer' };
const press = (k, down) => { if (down && !keys[k] && k in pressed) pressed[k] = true; keys[k] = down; };
addEventListener('keydown', e => {
  if (!$('s-map').classList.contains('hidden')) { if (e.key === 'Escape') closeMap(); return; }
  if (!$('s-temple').classList.contains('hidden')) { if (e.key === 'Escape' || e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') closeTemple(); return; }
  if (!$('s-guide').classList.contains('hidden')) {             // the Book of Foes: page through it
    if (e.key === 'ArrowRight') showGuide(gpg + 1); else if (e.key === 'ArrowLeft') showGuide(gpg - 1); else if (e.key === 'Escape') closeGuide();
    return;
  }
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
    for (const k of ['dark', 'lights', 'lamp', 'wall', 'wallR', 'stars', 'pose', 'swingFx', 'witch', 'unmasked', 'olad', 'rakhsh', 'dragonSeen', 'horde', 'hordeDone',
      'gates', 'hordeBat', 'toldRock', 'toldFarr', 'toldOffer', 'atAltar', 'bossT', 'maceHit', 'toldIce', 'chargeWarn', 'toldCharge', 'shards', 'shardG', 'mark', 'markGlow', 'markOpen', 'bossHeart', 'bossHeartT', 'floorWarn', 'highWarn', 'regrow', 'drums', 'whiteDown', 'ended', 'mounted', 'prayed', 'drank', 'toldImmune', 'toldDeflect', 'kavus', 'stones', 'puzzle', 'springOpen', 'pool']) delete this[k];
    // turn loaded strips into square frames; anything missing falls back to placeholder art
    for (const [k, f] of Object.entries(ART)) if (f && this.textures.exists(k)) {
      const t = this.textures.get(k), img = t.getSourceImage(), fh = img.height, n = Math.max(1, Math.round(img.width / fh));
      for (let i = 0; i < n; i++) t.add(i, 0, i * fh, 0, fh, fh);
    }
    makeTextures(this);
    for (const k of Object.keys(FPS)) {
      const t = this.textures.get(k), n = t.frameTotal - 1;
      if (!this.anims.exists(k)) this.anims.create({ key: k, frames: this.anims.generateFrameNumbers(k, { start: 0, end: Math.max(0, n - 1) }), frameRate: FPS[k], repeat: /attack|hurt|roar|jump|thrust|slash|kneel|smash|throw|fire|rear|sight|strike|sting|die/.test(k) ? 0 : -1 });
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
    this.regrow = [];
    for (const c of lv.hearts || []) { const r = topAt(map, c); if (r != null) { const h = this.heart(c * TS + TS / 2, r * TS - 12); h.regrow = lv.regrow?.includes(c); } }
    // rising again after a fall: start at the last fire lit, with what was gathered on the way
    const R = this.resuming && resumeAt?.n === cur ? resumeAt : null; this.resuming = false;
    if (R && this.altars[R.i]) { const a = this.altars[R.i]; this.start = { x: a.x, y: a.y }; for (const b of this.altars.slice(0, R.i + 1)) this.kindle(b, true); }
    this.respawn = { ...this.start };
    this.mounted = !!lv.mounted && this.textures.exists('ride-gallop');
    this.player = this.physics.add.sprite(this.start.x, this.start.y - 30, this.mounted ? 'ride-gallop' : 'rostam-idle', 0);
    this.fit(this.player, this.mounted ? 'rider' : 'rostam');
    this.player.setY(this.start.y - 1 - 0.47 * this.player.displayHeight); this.player.body.reset(this.player.x, this.player.y);   // feet on the floor, however tall the rider
    this.player.setDepth(5);
    this.physics.add.collider(this.player, this.layer);
    this.physics.add.collider(this.foes, this.layer);
    this.physics.add.overlap(this.player, this.coins, (pl, c) => this.eat(c));
    this.lion = null; this.boss = null; this.frozen = false; this.ram = null;
    this.cam = this.cameras.main;
    // the canvas is drawn at twice the world's resolution so finer sprite art keeps its detail. The camera zooms from its
    // top-left corner, so scrollX stays the left edge of the view and screen-fixed layers keep their places; its follow
    // offset centres Rostam, and the bounds and tile culling are worked out for the zoomed view
    this.cam.setZoom(ZOOM).setOrigin(0, 0);
    this.cam.clampX = x => Phaser.Math.Clamp(x, 0, Math.max(0, this.levelW - W)); this.cam.clampY = y => Phaser.Math.Clamp(y, 0, Math.max(0, ROWS * TS - H));
    this.layer.setCullPadding(W / TS, H / TS);
    this.cam.setBounds(0, 0, this.levelW, ROWS * TS);
    this.cam.startFollow(this.player, true, 0.12, 0.12, W / 2, H / 2);
    this.cam.setRoundPixels(true);
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) { this.cam.shake = () => this.cam; this.cam.flash = () => this.cam; }
    this.maxHp = 5 + (upg().heart || 0); this.hp = this.maxHp; this.farr = +(store.get('sh-farr') || 0); this.rakhshFed = false; this.rakhshRode = false; this.coinCount = 0; this.kills = 0; this.wasGround = true; this.face = 1; this.inv = 0; this.atk = 0; this.cool = 0; this.coyote = 0; this.buf = 0; this.bossOn = false; this.done = false; this.t0 = this.time.now;
    if (R) {
      this.coinCount = R.coins || 0; this.kills = R.kills || 0; this.t0 -= R.t || 0;
      for (const c of this.coins.getChildren().slice()) if (c.x < this.start.x) { c.glow?.destroy(); c.destroy(); }
      for (const f of this.foes.getChildren().slice()) if (Math.abs(f.x - this.start.x) < 8 * TS) f.destroy();   // a safe place to rise
      this.inv = 120;
    }
    if (this.coinCount >= FED && cur !== 3) this.rakhshFed = true;
    this.renderHearts(); $('coins').textContent = purse(); this.renderFarr(); hint(null);
    this.parts = this.add.particles(0, 0, 'coin-spin', { frame: 0, speed: { min: 30, max: 90 }, lifespan: 450, scale: { start: 0.8, end: 0 }, gravityY: 120, emitting: false }).setDepth(9);
    this.shots = this.physics.add.group({ allowGravity: false }); this.hazards = [];
    this.physics.add.collider(this.shots, this.layer, sh => sh.destroy());
    this.physics.add.overlap(this.player, this.shots, (pl, sh) => { if (!sh.active || sh.back) return; this.hurt(sh.x); this.fx('hit', sh.x, sh.y, { depth: 10 }); sh.destroy(); });
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
    // walkers stand with their feet on the floor of their cell; set any deeper and a tall one sinks through the ground
    if (f.body.allowGravity) { f.y = y - 1 - 0.47 * f.displayHeight; f.body.reset(x, f.y); f.home.y = f.y; }
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
      if (c.regrow) this.regrow.push({ x: c.x, y: c.y, away: 0 });
      c.glow?.destroy(); c.destroy(); this.fx('heal', this.player.x, this.player.body.bottom - 4, { depth: 6 }); sfx('fire');
      if (this.hp < this.maxHp) { this.hp++; this.renderHearts(); toast('A heart! Rostam\'s strength returns.'); } else toast('A heart, but Rostam is already whole.');
      return;
    }
    const heal = c.kind === 'lamb' && this.hp < this.maxHp;
    if (c.kind === 'skin') { c.destroy(); this.water = Math.min(100, this.water + 30); this.renderWater(); sfx('coin'); this.fx('splash', c.x, c.y + 4); toast('A water skin! Rostam drinks.'); return; }
    c.destroy(); this.coinCount++; setPurse(purse() + 1); $('coins').textContent = purse(); sfx('coin');
    this.gainFarr(c.kind === 'lamb' ? 25 : 12.5);
    if (this.coinCount === FED && cur !== 3 && !this.rakhshFed) { this.rakhshFed = true; toast('Rakhsh is well fed! He will gallop to your aid when you face the boss.'); }
    this.fx('pickup', c.x, c.y + 6);
    if (c.kind === 'lamb') { if (heal) { this.hp++; this.renderHearts(); } this.fx('heal', this.player.x, this.player.body.bottom - 4, { depth: 6 }); sfx('fire'); }
  }
  sparkle(x, y, tint) { this.parts.setParticleTint(tint); this.parts.explode(8, x, y); }
  renderHearts() { $('hearts').innerHTML = Array.from({ length: this.maxHp }, (_, i) => `<img src="assets/ui/heart${i < this.hp ? '' : '-off'}.png?v=${V}" alt="">`).join(''); $('hearts').setAttribute('aria-label', `${this.hp} of ${this.maxHp} hearts`); }
  // the Farr: a golden bar that fills as Rostam gathers provisions and slays foes
  gainFarr(n) {
    const was = this.farr >= 100; this.farr = Math.min(100, this.farr + n); store.set('sh-farr', this.farr); this.renderFarr();
    if (!was && this.farr >= 100) { sfx('fire'); toast('Your Farr is full! Press F, or tap the golden Farr, to call on the Simurgh.'); }
  }
  renderFarr() { $('farrFill').style.width = this.farr + '%'; const full = this.farr >= 100; $('farrBtn').classList.toggle('full', full); document.querySelector('.tb.farr')?.classList.toggle('hidden', !full); }
  // the Simurgh's blast: a ring of golden light that strikes every foe on screen and wounds a boss through any guard
  farrBlast() {
    if (this.farr < 100 || this.frozen || this.done) return;
    const p = this.player, cx = this.cam.scrollX; this.farr = 0; store.set('sh-farr', 0); this.renderFarr();
    this.cam.flash(380, 255, 225, 140); this.cam.shake(400, 0.012); sfx('fire'); sfx('roar'); this.hitStop(120);
    const ring = this.add.image(p.x, p.body.center.y, 'glow').setTint(0xffd060).setBlendMode(Phaser.BlendModes.ADD).setDepth(12).setScale(0.4);
    this.tweens.add({ targets: ring, scale: 9, alpha: 0, duration: 700, ease: 'Cubic.easeOut', onComplete: () => ring.destroy() });
    this.sparkle(p.x, p.body.bottom, 0xf6dc8c); this.fx('beam', p.x, p.body.bottom, { depth: 12 });
    for (const f of this.foes.getChildren()) if (f.active && f.body.enable && f.x > cx - 10 && f.x < cx + W + 10) { this.fx('heal', f.x, f.body.bottom, { depth: 10 }); this.damage(f, 3, true); }
    const B = this.boss; if (B?.active && B.hp > 0 && B.body.enable) { this.fx('heal', B.x, B.body.bottom, { depth: 10 }); this.damage(B, 2, true); }
    if (!this.toldFarr) { this.toldFarr = true; toast('The Simurgh answers! Golden light strikes every foe around you.'); }
  }
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
  strikeBox() { const p = this.player, r = (this.mounted ? 48 : 34) + (upg().reach ? 12 : 0); return new Phaser.Geom.Rectangle(this.face > 0 ? p.body.right - 4 : p.body.left - r + 4, p.body.top - 22, r, p.body.height + 24); }   // the blade arcs over his head too
  damage(f, n = 1, force = false) {
    if (f.immune?.() && !force) { this.fx('dust', f.x, f.body.center.y, { depth: 10 }); if (!this.toldImmune) { this.toldImmune = true; toast(f.immuneMsg || 'Your blow passes through shadow.'); } return; }
    f.hp -= n; f.setTintFill(0xffffff); this.time.delayedCall(80, () => f.active && f.clearTint());
    const hx = Phaser.Math.Clamp(this.face > 0 ? f.body.left + 6 : f.body.right - 6, f.body.left, f.body.right);
    this.fx('hit', hx, f.body.center.y - 4, { depth: 10 }); sfx('hit'); this.cam.shake(80, 0.004);
    this.hitStop(f === this.boss ? 70 : 45);
    if (f === this.boss && !f.gaveHeart && f.hp > 0 && f.hp <= f.max / 2 && this.hp < this.maxHp) {
      f.gaveHeart = true; const x = this.player.x + (this.player.x < this.cam.scrollX + W / 2 ? 60 : -60), r = this.groundAt(x);
      if (r != null) { this.fx('beam', x, r * TS + 1, { depth: 4 }); this.heart(x, r * TS - 12); toast('A heart shines in the arena. Take it!'); }
    }
    if (f.hp <= 0) {
      if (f === this.boss) return f.onDown();
      this.kills++; f.body.enable = false; this.slay(f); this.gainFarr(4);
    }
  }
  // a tiny freeze on impact makes blows feel heavy
  // a slain foe flashes white, then bursts into its own pixels, which fly apart as embers and fade
  slay(f) {
    f.setTintFill(0xffffff); this.cam.shake(140, 0.007);
    this.time.delayedCall(90, () => { if (!f.active) return; this.shatter(f, { step: 2, power: 1 }); this.fx('hit', f.x, f.body.center.y, { depth: 10 }); f.destroy(); sfx('hit'); });
  }
  // break a sprite's current frame into pixels, each flying from where it was drawn
  shatter(o, { step = 2, power = 1 } = {}) {
    const fr = o.frame, cw = fr.cutWidth, ch = fr.cutHeight, c = document.createElement('canvas'); c.width = cw; c.height = ch;
    const x = c.getContext('2d'); x.drawImage(fr.source.image, fr.cutX, fr.cutY, cw, ch, 0, 0, cw, ch); const d = x.getImageData(0, 0, cw, ch).data;
    const sx = o.scaleX, sy = o.scaleY, ox = o.displayOriginX, oy = o.displayOriginY, cx = o.x, cy = o.y - (oy - ch / 2) * sy;
    this.shards ||= []; this.shardG ||= this.add.graphics().setDepth(9);
    for (let py = 0; py < ch; py += step) for (let px = 0; px < cw; px += step) {
      const i = (py * cw + px) * 4; if (d[i + 3] < 128) continue;
      const wx = o.x + (o.flipX ? -1 : 1) * (px - ox) * sx, wy = o.y + (py - oy) * sy, a = Math.atan2(wy - cy, wx - cx), sp = (40 + Math.random() * 120) * power;
      this.shards.push({ x: wx, y: wy, vx: Math.cos(a) * sp + (Math.random() - 0.5) * 40, vy: Math.sin(a) * sp - 60 * power - Math.random() * 60,
        c: (d[i] << 16) | (d[i + 1] << 8) | d[i + 2], s: Math.max(1, step * sx), t: 0, life: 500 + Math.random() * 700 * power, delay: (py / ch) * 160 * power });
    }
  }
  drawShards(delta) {
    if (!this.shards?.length) return;
    const g = this.shardG.clear(), dt = delta / 1000;
    this.shards = this.shards.filter(p => {
      p.t += delta; if (p.t < p.delay) { g.fillStyle(p.c, 1).fillRect(p.x, p.y, p.s, p.s); return true; }
      const u = (p.t - p.delay) / p.life; if (u >= 1) return false;
      p.vy += 260 * dt; p.vx *= 0.985; p.x += p.vx * dt; p.y += p.vy * dt;
      // the pixels burn as they fly: their own colour, then ember gold, then out
      const col = u < 0.35 ? p.c : Phaser.Display.Color.GetColor(255, 200 - u * 120, 80 - u * 70);
      g.fillStyle(col, 1 - u * u).fillRect(p.x, p.y, p.s, p.s); return true;
    });
  }
  // a boss's last moments: it reels under a run of flashes and blasts, then bursts apart in a blaze of light
  bossDeath(B) {
    B.body.enable = false; B.anims.stop(); this.hideMark(); this.hitStop(160); sfx('roar');
    // a Div with a death of its own staggers and falls before it breaks apart; the rest reel under flashes
    const die = B.texture.key.split('-')[0] + '-die', fall = this.anims.exists(die);
    const blow = () => { this.fx('hit', B.x + Phaser.Math.Between(-24, 24), B.body.top + Phaser.Math.Between(6, B.body.height - 6), { depth: 10 }); this.cam.shake(120, 0.01); sfx('hit'); };
    if (fall) { B.clearTint(); B.play(die); B.setTint(0xffb0a0); for (let i = 0; i < 4; i++) this.time.delayedCall(i * 260, () => B.active && blow()); }
    else for (let i = 0; i < 6; i++) this.time.delayedCall(i * 140, () => { if (!B.active) return; i % 2 ? B.setTintFill(0xffffff) : B.setTint(0xff6040); B.x += (i % 2 ? 3 : -3); blow(); });
    const at = fall ? 1650 : 880;
    this.time.delayedCall(at, () => {
      if (!B.active) return; this.shatter(B, { step: 2, power: 1.6 }); B.setVisible(false); sfx('win');
      this.cam.flash(450, 255, 240, 200); this.cam.shake(500, 0.02);
      const ring = this.add.image(B.x, B.body.center.y, 'glow').setTint(0xffe0a0).setBlendMode(Phaser.BlendModes.ADD).setDepth(10).setScale(0.3);
      this.tweens.add({ targets: ring, scale: 4, alpha: 0, duration: 900, ease: 'Cubic.easeOut', onComplete: () => ring.destroy() });
      B.clearTint();
      for (let i = 0; i < 5; i++) this.time.delayedCall(i * 120, () => this.fx('heal', B.x + Phaser.Math.Between(-36, 36), B.body.bottom - Phaser.Math.Between(0, 30), { depth: 10 }));
    });
    return at;
  }
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
    this.arenaWalls(x0);
    const l = this.lion = this.physics.add.sprite(this.lionAt.x, this.lionAt.y - 40, 'lion-walk', 0);
    this.fit(l, 'lion'); l.hp = 8; l.max = 8; l.state = 'roar'; l.tm = 70; l.dir = -1; l.setFlipX(true); l.play('lion-roar'); l.setDepth(4);
    this.boss = l; l.onDown = () => this.lionDown(); l.ai = () => this.lionAI();
    l.immune = () => l.state !== 'stun'; l.immuneMsg = 'The lion\'s hide turns your blow. Jump its charge so it runs into the rocks, then strike while it is dazed.';
    this.physics.add.collider(l, this.layer, null, onFloor); this.physics.add.collider(l, [this.wall, this.wallR]);
    sfx('roar'); this.roarRings(l);
    $('boss').classList.remove('hidden'); this.bossBar(); banner();
    hint('The lion roars, then charges. <b>Jump over the charge</b>: when it runs into the rocks it is dazed. <b>Strike while the gold arrow shows.</b>');
  }
  bossBar() { $('bossHp').style.width = (this.boss.hp / this.boss.max * 100) + '%'; }
  // one sign for every boss: a gold arrow and a golden glow when a blow from where Rostam stands will land, a grey shield when it will not
  bossMark(B, time) {
    const open = !this.frozen && (B.open ? B.open() : !B.immune?.());
    // the marker sits above the darkness layer
    if (!this.mark?.active) { this.mark = this.add.image(0, 0, 'mark-open').setDepth(12).setScale(1.6); this.markGlow = this.add.image(0, 0, 'glow').setTint(0xffc040).setBlendMode(Phaser.BlendModes.ADD).setDepth(3); }
    if (open !== this.markOpen) {
      this.markOpen = open;
      if (open) { this.tweens.add({ targets: this.mark, scale: { from: 3, to: 1.6 }, duration: 300, ease: 'Back.easeOut' }); this.toldImmune = false; }
      $('boss').classList.toggle('open', open); $('bossState').textContent = open ? 'Strike now!' : '';
    }
    const vis = B.alpha > 0.3 && B.visible && !B.noMark?.();
    this.mark.setVisible(vis && open).setPosition(Math.round(B.x), Math.round(B.body.top - 22 + (open ? Math.sin(time / 90) * 4 : 0)));
    this.markGlow.setVisible(open && vis).setPosition(B.body.center.x, B.body.center.y).setScale(B.body.width / 40, B.body.height / 40).setAlpha(0.55 + Math.sin(time / 110) * 0.2);
    this.cornerHeart(B.x, time);
    // a well-fed Rakhsh gallops in once: twelve seconds into the fight, or sooner if Rostam is hard pressed
    this.bossT = (this.bossT || 0) + 1;
    if (this.rakhshFed && !this.rakhshRode && !this.mounted && !this.frozen && B.hp > 0 && (this.bossT > 720 || this.hp <= 2)) this.rakhshRides(B);
  }
  rakhshRides(B) {
    this.rakhshRode = true; const y = 14 * TS + 3, x0 = this.cam.scrollX - 50, dir = B.x > this.player.x ? 1 : -1;
    const r = this.add.sprite(dir > 0 ? x0 : x0 + W + 100, y, 'rakhsh-gallop', 0).setOrigin(0.5, 0.97).setDepth(5).setFlipX(dir < 0).play('rakhsh-gallop');
    sfx('neigh'); toast('Rakhsh gallops to your aid!'); banner('رخش', 'Rakhsh');
    const reach = B.x - dir * 50;
    this.tweens.add({ targets: r, x: reach, duration: Math.abs(reach - r.x) / 0.32, ease: 'Linear', onComplete: () => {
      if (!B.active) { r.destroy(); return; }
      // he rears and kicks: the boss staggers, whatever its guard
      r.play('rakhsh-rear'); sfx('neigh'); this.cam.shake(260, 0.012);
      this.time.delayedCall(260, () => { if (B.active && B.hp > 0 && B.body.enable) { this.fx('hit', B.x - dir * 20, B.body.center.y, { depth: 10 }); this.damage(B, 2, true); } });
      r.once('animationcomplete', () => { r.setFlipX(dir > 0).play('rakhsh-gallop');
        this.tweens.add({ targets: r, x: dir > 0 ? this.cam.scrollX - 80 : this.cam.scrollX + W + 80, duration: 1400, onComplete: () => r.destroy() }); });
    } });
  }
  // now and then a heart glows in the corner of the arena farthest from the danger (a ledge if there is one), for 10 s
  cornerHeart(fromX, time) {
    this.bossHeartT = (this.bossHeartT ?? 480) - 1;
    if (this.bossHeart?.active && time > this.bossHeart.dieAt) { this.bossHeart.glow?.destroy(); this.bossHeart.destroy(); }
    if (this.bossHeartT <= 0) {
      this.bossHeartT = 900;
      if (!this.bossHeart?.active) {
        // the highest standing place near the corner farthest from the boss: a ledge if there is one
        const cx = this.cam.scrollX, side = fromX > cx + W / 2 ? 1 : -1; let x = side > 0 ? cx + 24 : cx + W - 24, r = this.groundAt(x);
        for (let i = 0; i < 9; i++) { const xx = x + side * i * TS, rr = this.groundAt(xx); if (rr != null && rr < r) { x = Math.floor(xx / TS) * TS + TS / 2; r = rr; } }
        if (r != null) { const h = this.bossHeart = this.heart(x, r * TS - 12); h.dieAt = time + 10000; this.fx('heal', x, r * TS, { depth: 6 }); toast('A heart glows in the corner. Grab it!'); }
      }
    }
  }
  hideMark() { this.mark?.destroy(); this.markGlow?.destroy(); this.mark = this.markGlow = null; this.markOpen = undefined; if (this.bossHeart?.active) { this.bossHeart.glow?.destroy(); this.bossHeart.destroy(); } }
  lionAI() {
    const l = this.lion, p = this.player; if (!l || !l.active || l.hp <= 0) return;
    l.tm--; const toP = Math.sign(p.x - l.x) || 1;
    if (l.state === 'prowl') { l.setVelocityX(toP * 45); l.dir = toP; if (l.anims.currentAnim?.key !== 'lion-walk') l.play('lion-walk'); if (l.tm <= 0) { l.state = Math.random() < 0.6 ? 'roar' : 'pounce'; l.tm = 45; l.setVelocityX(0); if (l.state === 'roar') { l.play('lion-roar'); sfx('roar'); this.roarRings(l); } } }
    else if (l.state === 'roar') { l.setVelocityX(0); if (l.tm <= 0) { l.state = 'charge'; l.dir = toP; l.tm = 110; l.play('lion-run'); } }
    else if (l.state === 'charge') { l.setVelocityX(l.dir * 230); if (l.body.blocked.left || l.body.blocked.right || l.tm <= 0) { l.state = 'stun'; l.tm = 110; l.setVelocityX(0); l.play('lion-walk'); l.anims.pause(); this.cam.shake(200, 0.01);
      this.fx('dust', l.x + l.dir * 30, l.body.bottom, { depth: 8 }); this.stars = this.fx('stun', l.x, l.body.top - 6, { depth: 10, follow: l }); } }
    else if (l.state === 'pounce') { if (l.tm === 44) { l.dir = toP; l.setVelocity(toP * 170, -330); l.play('lion-run'); } if (l.tm < 30 && l.body.blocked.down) { l.state = 'prowl'; l.tm = 70 + Math.random() * 40; l.setVelocityX(0); } }
    else if (l.state === 'stun') { if (this.stars) this.stars.setPosition(Math.round(l.x), Math.round(l.body.top - 6)); if (l.tm <= 0) { l.anims.resume(); l.state = 'prowl'; l.tm = 80; this.stars?.destroy(); this.stars = null; } }
    if (l.state === 'pounce' && l.tm < 30 && l.body.blocked.down && !l.landed) { l.landed = true; this.fx('dust', l.x, l.body.bottom, { depth: 8 }); }
    if (l.state !== 'pounce') l.landed = false;
    l.setFlipX(l.dir < 0);
  }
  lionDown() {
    const l = this.lion; this.stars?.destroy(); this.stars = null; this.bossDeath(l);
    $('boss').classList.add('hidden'); this.wall.destroy(); this.wallR?.destroy();
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
    this.cam.startFollow(this.player, true, 0.12, 0.12, W / 2, H / 2);
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
    this.lv.scroll(this, this.cam.scrollX, time); this.drawShards(delta);
    if (!playing || this.done) { if (this.done && this.hp <= 0) p.setVelocityX(0); return; }
    this.inv = Math.max(0, this.inv - k); p.setAlpha(this.inv > 0 && Math.floor(this.inv / 5) % 2 ? 0.35 : 1);
    if (this.frozen) { pressed.jump = pressed.attack = false; }
    const dirX = this.frozen ? 0 : (keys.right ? 1 : 0) - (keys.left ? 1 : 0), ground = b.blocked.down;
    if (dirX) this.face = dirX;
    const tv = dirX * (this.mounted ? 165 : 125); b.velocity.x += (tv - b.velocity.x) * (ground ? 0.3 : 0.15);   // Rakhsh outruns any man
    this.coyote = ground ? 6 : this.coyote - 1;
    if (pressed.jump) this.buf = 6; pressed.jump = false;
    if (ground) this.airJumps = 1;
    if (this.buf-- > 0 && this.coyote > 0) { p.setVelocityY(-335); this.coyote = 0; this.buf = 0; sfx('jump'); this.fx('dust', p.x, b.bottom, { depth: 6 }); }
    // the super jump: once in the air, jump again for a higher leap, in a burst of gold
    else if (this.buf > 0 && this.coyote <= 0 && this.airJumps > 0) {
      this.airJumps = 0; this.buf = 0; p.setVelocityY(upg().wings ? -460 : -400); sfx('jump'); sfx('swing');
      this.sparkle(p.x, b.bottom, 0xf6dc8c); this.fx('dust', p.x, b.bottom + 2, { depth: 6 });
    }
    if (ground && !this.wasGround && this.fallV > 200) this.fx('dust', p.x, b.bottom, { depth: 6 });
    this.wasGround = ground; this.fallV = b.velocity.y;
    if (!keys.jump && b.velocity.y < -120) p.setVelocityY(b.velocity.y * 0.85);
    this.cool -= k;
    if (pressed.attack && this.cool <= 0) {
      this.atk = 16; this.cool = this.mounted ? 26 : 22; sfx('swing'); p.play(this.mounted ? 'ride-strike' : 'rostam-attack', true); this.hitDone = new Set();
      this.swingFx = this.fx('swing', p.x + this.face * 6, p.y - 2, { flip: this.face < 0, depth: 6 });
    }
    if (this.swingFx?.active) this.swingFx.setPosition(Math.round(p.x + this.face * 6), Math.round(p.y - 2));
    pressed.attack = false;
    if (pressed.farr) { pressed.farr = false; this.farrBlast(); }
    // standing by a lit fire altar, Rostam may make an offering of provisions at the Fire Temple
    const altar = ground && !this.bossOn ? this.altars.find(a => a.lit && !a.onLight && Math.abs(a.x - p.x) < 30) : null;
    if (altar !== this.atAltar) {
      this.atAltar = altar; $('offerBtn').classList.toggle('hidden', !altar);
      if (altar && !this.toldOffer && purse() >= Math.min(...UPGRADES.map(u => u.costs[upg()[u.id] || 0] ?? Infinity))) { this.toldOffer = true; hint('You stand at a sacred fire. Press <b>↓</b> or tap <b>Offer</b> to trade provisions for lasting gifts.'); }
    }
    if (pressed.offer) { pressed.offer = false; if (this.atAltar) openTemple(); }
    if (this.atk > 0) {
      this.atk -= k;
      if (this.atk < 12 && this.atk > 3) {
        const box = this.strikeBox();
        const targets = [...this.foes.getChildren(), ...(this.boss && this.boss.active && this.boss.hp > 0 ? [this.boss] : [])];
        // the Mace of Sam: double against foes, and every other blow on a boss lands twice as hard
        const mace = upg().mace, hit = f => !mace ? 1 : f !== this.boss ? 2 : (this.maceHit = !this.maceHit) ? 2 : 1;
        for (const f of targets) if (f.body.enable && !this.hitDone.has(f) && Phaser.Geom.Intersects.RectangleToRectangle(box, f.body)) { this.hitDone.add(f); this.damage(f, hit(f)); if (!f.calm?.()) f.setVelocity(this.face * (f === this.boss ? 60 : 140), f.kind === 'vulture' ? -60 : -120); }
        for (const sh of this.shots.getChildren()) if (sh.curse && !sh.back && Phaser.Geom.Intersects.RectangleToRectangle(box, sh.getBounds())) this.deflect(sh);
        if (this.puzzle) this.stones.forEach((st, i) => { if (!this.hitDone.has(st) && Phaser.Geom.Intersects.RectangleToRectangle(box, st.getBounds())) { this.hitDone.add(st); this.strikeStone(i); } });
      }
    }
    // thorns and pits
    const tile = this.layer.getTileAtWorldXY(p.x, b.bottom - 2);
    if (tile && tile.index % 4 === 3) { this.hurt(tile.pixelX + 8); p.setVelocityY(-300); }
    if (p.y > ROWS * TS + 60) { this.inv = 0; this.hurt(p.x); if (this.hp > 0) { p.setPosition(this.respawn.x, this.respawn.y - 4 - 0.47 * p.displayHeight); p.setVelocity(0); this.inv = 80; } }
    // animation
    const M = this.mounted, swinging = p.anims.isPlaying && /attack|strike/.test(p.anims.currentAnim?.key || '');
    const anim = this.pose || (this.atk > 0 || (M && swinging) ? (M ? 'ride-strike' : 'rostam-attack') : M ? 'ride-gallop' : this.inv > 70 ? 'rostam-hurt' : !ground ? 'rostam-jump' : Math.abs(b.velocity.x) > 15 ? 'rostam-run' : 'rostam-idle');
    if (p.anims.currentAnim?.key !== anim && !(/attack|strike/.test(anim) && p.anims.isPlaying)) p.play(anim);
    if (anim === 'ride-gallop') { if (ground && Math.abs(b.velocity.x) > 15) p.anims.resume(); else { p.anims.pause(); if (!ground) p.setFrame(2); } }
    if (anim === 'rostam-jump') p.setFrame(b.velocity.y < 0 ? 0 : 1);
    p.setFlipX(this.face < 0);
    this.cam.setFollowOffset(W / 2 - this.face * 30, H / 2);
    // foes
    for (const f of this.foes.getChildren()) {
      if (!f.body.enable) continue;
      FOES[f.kind].tick(this, f, k, p);
      if (Phaser.Geom.Intersects.RectangleToRectangle(b, f.body)) {
        if (b.velocity.y > 60 && b.bottom - f.body.top < 12) { this.damage(f, 2); p.setVelocityY(keys.jump ? -330 : -230); }
        else this.hurt(f.x);
      }
    }
    separate(this);
    // checkpoint
    for (const a of this.altars) if (!a.lit && p.x > a.x) { this.kindle(a); resumeAt = { n: cur, i: this.altars.indexOf(a), well: !!a.onLight }; }
    // a taken platform heart grows back once Rostam has been away from it for 2 s
    this.regrow = this.regrow.filter(h => {
      const near = Math.abs(p.x - h.x) < 3 * TS && Math.abs(b.bottom - (h.y + 12)) < 10;
      h.away = near ? 0 : h.away + delta; if (h.away < 2000) return true;
      this.fx('heal', h.x, h.y + 12, { depth: 6 }); this.heart(h.x, h.y).regrow = true; return false;
    });
    this.lv.update?.(this, k, time, p, b);
    // projectiles expire; hazard zones (fire breath, shockwaves) hurt while they last
    for (const sh of this.shots.getChildren()) if (time > sh.die) sh.destroy(); else if (sh.spin) sh.angle += sh.spin * k;
    this.hazards = this.hazards.filter(z => { if (z.move) z.r.x += z.move * k; if (Phaser.Geom.Intersects.RectangleToRectangle(b, z.r)) this.hurt(z.r.centerX); return time < z.until; });
    this.drawDark();
    // a curse turned back strikes the one who cast it
    for (const sh of this.shots.getChildren()) if (sh.back && this.boss?.active && this.boss.hp > 0 && this.boss.body.enable && Phaser.Geom.Intersects.RectangleToRectangle(sh.getBounds(), this.boss.body)) { sh.destroy(); this.damage(this.boss); }
    // boss
    const B = this.boss;
    if (B && B.active && B.hp > 0) {
      B.ai(); this.bossBar(); this.bossMark(B, time);
      // as a boss recovers from an opening it shrugs Rostam off for a moment rather than hurting him where he stands
      const calm = !!B.calm?.(); if (B.wasCalm && !calm) B.grace = 45; B.wasCalm = calm; B.grace = (B.grace || 0) - 1;
      // touching a boss hurts unless it is reeling (or still hidden, or not yet unmasked); landing on an open one is a blow
      if (B.alpha > 0.5 && !B.noMark?.() && Phaser.Geom.Intersects.RectangleToRectangle(b, B.body)) {
        if (!B.immune?.() && b.velocity.y > 60 && b.bottom - B.body.top < 14) { this.damage(B); p.setVelocityY(-320); }
        else if ((B.contact ? B.contact() : !B.calm?.()) && B.grace <= 0 && !(b.blocked.down && b.bottom < 13 * TS)) this.hurt(B.x);   // up on a ledge, he passes beneath
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
  // invisible walls at both edges of the locked screen, so Rostam and the boss stay in view
  arenaWalls(x0) {
    const left = Math.min(this.levelW - W, x0), wall = x => { const w = this.add.rectangle(x, 0, 8, ROWS * TS, 0, 0).setOrigin(0.5, 0); this.physics.add.existing(w, true); this.physics.add.collider(this.player, w); return w; };
    this.wall = wall(Math.max(x0, left + 6) - 4); this.wallR = wall(left + W - 2);
  }
  // lock the camera on an arena, raise the boss bar and the title card
  arena(x0, boss, max) {
    this.bossOn = true;
    this.cam.stopFollow(); this.tweens.add({ targets: this.cam, scrollX: Math.min(this.levelW - W, x0), duration: 700, ease: 'Sine.easeInOut' });
    this.arenaWalls(x0);
    boss.hp = boss.max = max; this.boss = boss;
    this.physics.add.collider(boss, this.layer, null, onFloor); this.physics.add.collider(boss, [this.wall, this.wallR]);
    $('boss').classList.remove('hidden'); this.bossBar(); banner();
  }
  // a big boss falls: flash, smoke and light, then the labour is won
  bossFall(B, then) {
    this.drums?.remove();
    const at = this.bossDeath(B); this.chargeWarn?.destroy(); this.stars?.destroy(); this.stars = null;
    $('boss').classList.add('hidden'); this.wall?.destroy(); this.wallR?.destroy(); this.hazards = []; this.shots.clear(true, true);
    this.time.delayedCall(at + 200, () => this.cam.startFollow(this.player, true, 0.12, 0.12, W / 2, H / 2));
    this.time.delayedCall(at + 1700, () => then ? then() : this.win({ destroy() {} }));
  }
  /* ---- Khan III: Rakhsh and the dragon that hides in the dark ---- */
  startDragon() {
    if (!this.mounted) {
      const r = this.rakhsh = this.physics.add.sprite(this.rakhshAt.x - 220, this.rakhshAt.y - 40, 'rakhsh-gallop', 0).setDepth(4);
      this.fit(r, 'rakhsh'); this.physics.add.collider(r, this.layer); r.play('rakhsh-gallop'); r.setVelocityX(180);
      this.light(r, 1.1);
    }
    sfx('neigh');
    const d = this.physics.add.sprite(Math.min(this.dragonAt.x, 134 * TS), this.dragonAt.y - 60, 'dragon-move', 0).setDepth(4).setFlipX(true).setAlpha(0.05);
    this.fit(d, 'dragon'); d.play('dragon-move'); d.state = 'lurk'; d.tm = 170; d.dir = -1;
    this.light(d, 2.4, 0.04);                                         // when it shows itself, it can be seen
    d.immune = () => d.alpha < 0.5; d.immuneMsg = 'Your mace passes through shadow. Wait for Rakhsh to warn you!';
    d.ai = () => this.dragonAI(); d.onDown = () => this.bossFall(d);
    this.arena(112 * TS, d, 12);
    toast(this.mounted ? 'Rakhsh snorts and tosses his head beneath you. Something vast stirs in the dark...' : 'Rakhsh gallops up beside you, snorting. Something vast stirs in the dark...');
    hint('Rakhsh can sense the dragon. <b>When he rears and neighs, the dragon shows itself: strike it then.</b> While it hides, your blows pass through. Jump its fire.');
  }
  dragonAI() {
    const d = this.boss, p = this.player, r = this.rakhsh; d.tm--;
    if (r && r.body.velocity.x > 0 && r.x >= this.rakhshAt.x) { r.setVelocityX(0); r.anims.stop(); r.setFrame(0); }
    const toP = Math.sign(p.x - d.x) || -1; d.dir = toP; d.setFlipX(toP < 0);
    const seen = d.hp <= d.max / 2;                                   // once wounded, God lets Rostam see it
    if (seen && !this.dragonSeen) { this.dragonSeen = true; this.tweens.killTweensOf(d); d.setAlpha(1); banner('خدا', 'The dragon can hide no more'); hint('The dragon can hide no more. <b>Strike it whenever you can</b>, and jump its fire.'); }
    if (d.state === 'lurk') {
      d.setVelocityX(Math.abs(p.x - d.x) > 70 ? toP * (seen ? 62 : 46) : 0);   // it stalks Rostam through the dark
      if (d.tm <= 0) {
        // Rakhsh rears and neighs: the dragon is revealed
        if (r) { r.play('rakhsh-rear'); r.once('animationcomplete', () => { r.anims.stop(); r.setFrame(0); }); } else this.rear(); sfx('neigh');
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
  // Rakhsh rears beneath his rider: the warning that reveals the dragon
  rear() {
    const p = this.player; this.pose = 'ride-rear'; p.play('ride-rear', true);
    // the strip only lifts a little: tip the whole horse back on its haunches so the warning reads
    this.tweens.add({ targets: p, angle: -18 * this.face, duration: 260, yoyo: true, hold: 220, ease: 'Sine.easeOut', onComplete: () => p.setAngle(0) });
    p.once('animationcomplete', () => { if (this.pose === 'ride-rear') this.pose = null; });
  }
  /* ---- Khan IV: the feast, the name of God, and the witch ---- */
  startWitch() {
    const w = this.witch = this.physics.add.sprite(this.witchAt.x, this.witchAt.y - 40, 'beauty-idle', 0).setDepth(4).setFlipX(true);
    this.fit(w, 'beauty'); w.play('beauty-idle'); w.immune = () => !this.unmasked || w.alpha < 0.5; w.noMark = () => !this.unmasked; w.immuneMsg = 'She only smiles. Speak the name of God: stand near her and strike.';
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
      hint('A witch! <b>Strike her green curses</b> to send them back at her, or jump them. When she is solid, <b>strike her</b>.');
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
          const sh = this.shoot(w.x + toP * 18, w.y - 6, Math.cos(a) * 125, Math.sin(a) * 125, 'fx-orb', { life: 3600 });
          sh.play('fx-orb'); sh.setRotation(a); this.light(sh, 0.5); sh.curse = true;      // a curse: the mace can turn it back
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
    // his shield turns every blow from the front, except in the moment after his swing when his guard drops; his back is always open
    o.immune = () => o.state !== 'open' && Math.sign(this.player.x - o.x) === o.dir && this.player.body.bottom > o.body.top + 12;
    o.calm = () => o.state === 'open';
    o.immuneMsg = 'Olad catches your blow on his shield! Dodge his swing, then strike while he glows. Or leap over him and strike his back.';
    o.ai = () => this.oladAI(); o.onDown = () => this.oladYields();
    this.arena(112 * TS, o, 9); this.olad = o;
    toast('Olad rides out to meet you, sword drawn: "Who are you, to cross the marches of Mazandaran?"');
    hint('Olad\'s <b>shield blocks you from the front</b>. When he <b>flashes, step back</b> from his sword; then he glows and lowers his guard: <b>strike!</b> Or <b>jump twice</b> over him and hit his back. Strike when the <b>gold arrow</b> shows.');
  }
  oladAI() {
    const o = this.olad, p = this.player; o.tm--; const d = p.x - o.x;
    if (o.state !== 'slash') { o.dir = Math.sign(d) || -1; o.setFlipX(o.dir < 0); }
    if (o.state === 'walk') {
      o.setVelocityX(o.dir * 70); if (o.anims.currentAnim?.key !== 'olad-walk') o.play('olad-walk');
      if (Math.abs(d) < 70 || o.tm <= 0) { o.state = 'ready'; o.tm = 26; o.setVelocityX(0); o.anims.stop(); o.setFrame(0); }
    } else if (o.state === 'ready') {
      // he draws back his sword, flashing: a moment to step out of reach
      o.setVelocityX(0); o.setTintFill(Math.floor(o.tm / 4) % 2 ? 0xffffff : 0xffe0a0); if (o.tm % 8 < 4) o.clearTint();
      if (o.tm <= 0) { o.clearTint(); o.state = 'slash'; o.tm = 30; o.setVelocityX(o.dir * 40); o.play('olad-slash'); sfx('swing'); o.hit = false; }
    } else if (o.state === 'slash') {
      if (!o.hit && o.tm < 20) { o.hit = true; this.hazard(o.dir > 0 ? o.x + 4 : o.x - 46, o.body.top + 4, 42, 30, 140); }
      // after the swing his sword hangs low and he is open for a moment
      if (o.tm <= 0) { o.state = 'open'; o.tm = 84; o.setVelocityX(0); o.anims.stop(); o.setFrame(0); o.setTint(0xffd0a0); hint('Olad\'s guard is down: <b>strike now!</b>'); }
    } else if (o.state === 'open') {
      o.setVelocityX(0); if (o.tm <= 0) { o.clearTint(); o.state = 'guard'; o.tm = 30 + Math.random() * 20;
        hint('Shield up again. When he <b>flashes, step back</b>, then <b>strike while he glows</b>, or leap over him and hit his back.'); }
    } else if (o.state === 'guard') {
      o.setVelocityX(0); if (o.tm <= 0) { o.state = 'walk'; o.tm = 90; if (Math.random() < 0.4) o.setVelocity(-o.dir * 150, -200); }
    }
  }
  oladYields() {
    // Olad is not slain: he kneels, Rostam's lasso binds him, and he becomes the guide
    const o = this.olad, p = this.player; o.state = 'down'; o.setVelocity(0); o.body.enable = false; o.play('olad-kneel'); this.hideMark();
    $('boss').classList.add('hidden'); this.wall?.destroy(); this.wallR?.destroy(); this.frozen = true; p.setVelocityX(0); sfx('win');
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
    this.gates = [x - 13 * TS, x + 13 * TS].map((gx, i) => {
      const r = this.add.rectangle(gx, 0, 12, ROWS * TS, 0, 0).setOrigin(0.5, 0); this.physics.add.existing(r, true); this.physics.add.collider(this.player, r); this.physics.add.collider(this.foes, r);
      // the gate drops from above and slams into the ground, shaking the camp
      const im = this.add.image(gx, -10, 'gate').setOrigin(0.5, 1).setDepth(6);
      this.tweens.add({ targets: im, y: 14 * TS + 2, duration: 380, delay: i * 160, ease: 'Bounce.easeOut', onStart: () => sfx('swing'),
        onComplete: () => { sfx('drum'); this.cam.shake(220, 0.01); this.fx('dust', gx - 10, 14 * TS, { flip: true, depth: 8 }); this.fx('dust', gx + 10, 14 * TS, { depth: 8 }); } });
      const g = this.add.image(gx, 13 * TS, 'glow').setScale(1.2).setTint(0xff8040).setBlendMode(Phaser.BlendModes.ADD).setDepth(5); this.light(g, 1.1, 0.1);
      return { r, im, g };
    });
    // the camera settles on the arena, so both gates are in view while it lasts
    this.cam.stopFollow(); this.tweens.add({ targets: this.cam, scrollX: Phaser.Math.Clamp(x - W / 2, 0, this.levelW - W), duration: 600, ease: 'Sine.easeInOut' });
    // one bat circles high over the platforms, to harry Rostam up there
    this.hordeBat = this.spawnFoe('bat', x, 4 * TS);
    banner('سپاهِ دیوان', 'The Horde of the Divs'); hint('The gates are shut! <b>Survive three waves of Divs</b>. <b>Jump twice</b> to reach the high platform, drop behind a Div to strike, then leap back up.'); this.drums = this.time.addEvent({ delay: 420, loop: true, callback: () => sfx('drum') });
    this.time.delayedCall(900, () => this.hordeWave());
  }
  hordeWave() {
    const h = this.horde, x = this.hordeAt.x, waves = [['d', 'd', 'w'], ['w', 'd', 'w', 'd'], ['w', 'w', 'd', 'd', 'w']];
    const list = waves[h.wave]; h.wave++; toast(`Wave ${h.wave} of 3: the Divs pour in!`);
    list.forEach((k, i) => this.time.delayedCall(i * 420, () => {
      const side = i % 2 ? 1 : -1, sx = x + side * 10 * TS;
      this.fx('poof', sx, 13 * TS + 8, { depth: 10 });
      const f = this.spawnFoe(k === 'w' ? 'divwarrior' : 'div', sx, 14 * TS); f.dir = -side; f.setFlipX(f.dir < 0);
      f.post = x + (i - (list.length - 1) / 2) * 4 * TS;          // spread out across the arena
      h.live.push(f);
    }));
    h.spawning = this.time.now + list.length * 420 + 200;
  }
  hordeTick() {
    const h = this.horde;
    if (this.time.now < h.spawning) return;
    if (h.live.every(f => !f.active || !f.body.enable)) {
      if (h.wave < 3) { h.live = []; this.hordeWave(); return; }
      // the last wave is broken: the gates of fire die down
      this.horde = null; this.hordeDone = true; this.drums.remove(); sfx('win'); hint('The gates open. <b>Arzhang waits ahead</b>: light the last fire before you face him.');
      // only the way on opens: the gate behind stays shut
      { const g = this.gates[1]; g.r.destroy(); this.tweens.add({ targets: g.im, y: -20, duration: 900, ease: 'Sine.easeIn' }); this.tweens.add({ targets: g.g, alpha: 0, duration: 600 }); }
      if (this.hordeBat?.active && this.hordeBat.body.enable) this.banish(this.hordeBat.x - 4, this.hordeBat.x + 4);
      this.cam.startFollow(this.player, true, 0.12, 0.12, W / 2, H / 2);
      toast('The horde is broken! The way to Arzhang lies open.');
    }
  }
  startArzhang() {
    const a = this.physics.add.sprite(this.arzhangAt.x, this.arzhangAt.y - 60, 'arzhang-walk', 0).setDepth(4).setFlipX(true);
    this.fit(a, 'arzhang'); a.play('arzhang-walk'); a.state = 'walk'; a.tm = 90; a.dir = -1;
    // his hide turns every blow until he rests on his axe after his strikes: that is the opening
    a.immune = () => a.state !== 'rest' && a.state !== 'dazed'; a.calm = () => !a.immune(); a.contact = () => a.state === 'charge';
    a.immuneMsg = 'Arzhang shrugs off the blow. Dodge his two strikes, then hit him while he rests on his axe.';
    a.ai = () => this.arzhangAI(); a.onDown = () => { this.floorWarn?.destroy(); this.highWarn?.destroy(); this.chargeWarn?.destroy(); this.stars?.destroy(); this.stars = null; this.bossFall(a); };
    this.arena(124 * TS, a, 12); this.light(a, 2); sfx('roar'); this.cam.shake(500, 0.008);
    // red glows warn where the axe will fall: along the floor, or across the platforms
    const glow = (y, h) => this.add.rectangle(124 * TS, y, 30 * TS, h, 0xff3010, 1).setOrigin(0, 0.5).setBlendMode(Phaser.BlendModes.ADD).setAlpha(0).setDepth(3);
    this.floorWarn = glow(14 * TS - 10, 20); this.highWarn = glow(9.6 * TS, 3.2 * TS);   // the high band ends above a standing man's head
    this.drums = this.time.addEvent({ delay: 500, loop: true, callback: () => sfx('drum') });
    toast('Arzhang Div rises from his throne of bones: "Who dares walk into my camp?"');
    hint('Watch the red glow. <b>Floor glows: leap onto a platform.</b> <b>Platforms glow: drop to the ground.</b> After two blows he rests on his axe: <b>strike him then</b>.');
  }
  // he roams the middle, then strikes twice (a floor split, a sweep across the platforms, or both), then rests
  arzhangAI() {
    const a = this.boss, p = this.player; a.tm--; const hurt = a.hp <= a.max / 2;
    const up = p.body.bottom < 13 * TS;                                       // Rostam is up on a platform
    if (this.charge(a, 'arzhang-walk')) return;
    if (a.state === 'walk') {
      if (a.tm > 20 && this.tryCharge(a)) return;
      // he stalks Rostam to axe's reach (never under a platform) and plants his feet there
      if (this.stalk(a, p, 80, 127, 151, hurt ? 64 : 52, 'arzhang-walk', [133.5, 144.5])) a.tm = Math.min(a.tm, hurt ? 14 : 24);
      if (a.tm <= 0) {
        // the first blow goes where Rostam is; the second often the other way, so he must switch
        const first = up ? 'sweep' : 'split', other = first === 'sweep' ? 'split' : 'sweep';
        a.combo = [first, Math.random() < (hurt ? 0.75 : 0.6) ? other : first]; this.windUp(a, first === 'split' ? Math.max(hurt ? 70 : 80, this.reachT(135, 144)) : hurt ? 70 : 80);   // time to reach the platform
      }
    } else if (a.state === 'raise') {
      const w = a.combo[0] === 'split' ? this.floorWarn : this.highWarn; w.setAlpha(0.18 + 0.32 * Math.abs(Math.sin(a.tm * 0.25)));
      if (a.tm <= 0) { a.state = 'smash'; a.tm = 30; a.combo[0] === 'split' ? this.splitFloor(a) : this.sweepHigh(a); a.combo.shift(); }
    } else if (a.state === 'smash') {
      if (a.tm <= 0) {
        if (a.combo.length) this.windUp(a, a.combo[0] === 'split' ? Math.max(hurt ? 52 : 60, this.reachT(135, 144)) : hurt ? 52 : 60);   // the second blow comes quicker
        else { a.state = 'rest'; a.tm = hurt ? 120 : 140; a.anims.stop(); a.setFrame(4); a.setTint(0xffc0a0); a.setVelocityX(0);
          this.stars = this.fx('stun', a.x, a.body.top - 4, { depth: 10, follow: a }); hint('Arzhang <b>rests on his axe: strike him now!</b>'); }
      }
    } else if (a.state === 'rest') {
      a.setVelocityX(0); if (this.stars) this.stars.setPosition(Math.round(a.x), Math.round(a.body.top - 4));
      if (a.tm <= 0) { a.clearTint(); this.stars?.destroy(); this.stars = null; a.state = 'walk'; a.tm = 130 + Math.random() * 40; a.play('arzhang-walk');
        hint('Watch the red glow. <b>Floor glows: leap onto a platform.</b> <b>Platforms glow: drop to the ground.</b>'); }
    }
  }
  // the charge, shared by the great Divs: he plants his feet and flushes red while a red streak marks his path, then
  // rushes. If he runs into the arena wall he is dazed: the opening. Returns true while the charge owns the boss.
  charge(b, walk) {
    const p = this.player;
    if (b.state === 'brace') {
      b.setVelocityX(0); Math.floor(b.tm / 5) % 2 ? b.setTint(0xff7060) : b.clearTint(); b.x += Math.floor(b.tm / 3) % 2 ? 1 : -1;
      this.chargeWarn?.setAlpha(0.2 + 0.35 * Math.abs(Math.sin(b.tm * 0.3)));
      if (b.tm <= 0) { b.clearTint(); b.state = 'charge'; b.tm = 90; b.play(walk); b.anims.timeScale = 2.6; this.chargeWarn?.destroy(); this.chargeWarn = null; sfx('roar'); this.cam.shake(200, 0.006); }
      return true;
    }
    if (b.state === 'charge') {
      b.setVelocityX(b.dir * 270); if (b.tm % 6 === 0) this.fx('dust', b.x - b.dir * 20, b.body.bottom, { flip: b.dir < 0, depth: 8 });
      if (b.body.blocked.left || b.body.blocked.right) {
        // into the wall: the cave shakes and he reels
        b.setVelocityX(0); b.anims.timeScale = 1; b.anims.stop(); b.setFrame(0); b.state = 'dazed'; b.tm = 110; b.setTint(0xffe0a0);
        this.cam.shake(450, 0.018); sfx('hit'); sfx('drum'); this.fx('dust', b.x + b.dir * 30, b.body.bottom, { depth: 8 });
        this.stars = this.fx('stun', b.x, b.body.top - 4, { depth: 10, follow: b }); hint('He crashed into the wall and is <b>dazed: strike him now!</b>');
      } else if (b.tm <= 0) { b.anims.timeScale = 1; b.state = 'walk'; b.tm = 70; b.chargeCd = 360; }
      return true;
    }
    if (b.state === 'dazed') {
      b.setVelocityX(0); if (this.stars) this.stars.setPosition(Math.round(b.x), Math.round(b.body.top - 4));
      if (b.tm <= 0) { b.mad ? b.setTint(0xffd0d0) : b.clearTint(); this.stars?.destroy(); this.stars = null; b.state = 'walk'; b.tm = 90; b.chargeCd = 420; b.play(walk); }
      return true;
    }
    return false;
  }
  // he may charge when Rostam stands on the floor at a distance and the cave lies open between them
  tryCharge(b) {
    const p = this.player, d = p.x - b.x; b.chargeCd = (b.chargeCd ?? 240) - 1;
    if (b.chargeCd > 0 || Math.abs(d) < 100 || p.body.bottom < 13 * TS) return false;
    b.state = 'brace'; b.tm = 46; b.dir = Math.sign(d); b.setFlipX(b.dir < 0); b.anims.stop(); b.setFrame(0); sfx('roar');
    const x0 = b.x + b.dir * 30, x1 = b.dir > 0 ? this.cam.scrollX + W : this.cam.scrollX;
    this.chargeWarn = this.add.rectangle(Math.min(x0, x1), 14 * TS - 14, Math.abs(x1 - x0), 28, 0xff3010, 1).setOrigin(0, 0.5).setBlendMode(Phaser.BlendModes.ADD).setAlpha(0).setDepth(3);
    if (!this.toldCharge) { this.toldCharge = true; hint('He is about to <b>charge</b> along the red streak: <b>leap onto a ledge</b> and let him pass beneath. If he hits the wall he is dazed: <b>strike!</b>'); }
    return true;
  }
  // a boss closes on Rostam to `reach` px, kept between columns c0..c1, and stands still once there; true when in reach
  stalk(b, p, reach, c0, c1, speed, walk, avoid) {
    const side = Math.sign(b.x - p.x) || -b.dir; let goal = Phaser.Math.Clamp(p.x + side * reach, c0 * TS, c1 * TS);
    // never stand beneath the platform: stop at its nearer edge instead
    if (avoid && goal > avoid[0] * TS && goal < avoid[1] * TS) goal = Math.abs(b.x - avoid[0] * TS) < Math.abs(b.x - avoid[1] * TS) ? avoid[0] * TS : avoid[1] * TS;
    const d = goal - b.x;
    b.dir = Math.sign(p.x - b.x) || b.dir; b.setFlipX(b.dir < 0);
    if (Math.abs(d) > 10) { b.setVelocityX(Math.sign(d) * speed); if (b.anims.currentAnim?.key !== walk || !b.anims.isPlaying) b.play(walk); }
    else { b.setVelocityX(0); if (b.anims.isPlaying) { b.anims.stop(); b.setFrame(0); } }
    return Math.abs(d) <= 10 && Math.abs(p.x - b.x) < reach + 30;
  }
  // frames Rostam needs to run to the platform between columns c0..c1 and leap onto it, with a little to spare
  reachT(c0, c1) { const x = this.player.x, d = x < c0 * TS ? c0 * TS - x : x > c1 * TS ? x - c1 * TS : 0; return d / 2.1 + 40; }
  windUp(a, tm) { a.state = 'raise'; a.tm = tm; a.setVelocityX(0); a.play('arzhang-smash'); a.anims.pause(); a.setFrame(1); sfx('roar'); }
  // the floor split: a shockwave across the whole floor of the arena; only the platforms and the air are safe
  splitFloor(a) {
    a.anims.resume(); this.floorWarn.setAlpha(0.9); this.tweens.add({ targets: this.floorWarn, alpha: 0, duration: 400 });
    const y = 14 * TS; this.hazard(124 * TS, y - 22, 30 * TS, 22, 520);
    this.groundFire(124, 154, a.x); this.cam.shake(380, 0.016); sfx('hit'); sfx('drum'); sfx('fire');
  }
  // the sweep: the axe whirls across the arena at the height of the platforms; only the ground is safe
  sweepHigh(a) {
    a.anims.resume(); this.highWarn.setAlpha(0.6); this.tweens.add({ targets: this.highWarn, alpha: 0, duration: 400 });
    this.hazard(124 * TS, 8 * TS, 30 * TS, 3.2 * TS, 260);
    const streak = this.add.rectangle(a.x, 9.8 * TS, 20, 6, 0xfff0d0, 1).setBlendMode(Phaser.BlendModes.ADD).setDepth(9);
    this.tweens.add({ targets: streak, displayWidth: 30 * TS, alpha: 0, duration: 380, ease: 'Cubic.easeOut', onComplete: () => streak.destroy() });
    this.cam.shake(260, 0.01); sfx('swing'); sfx('swing');
  }
  // fire runs along the floor from where the axe struck, flames rising and dying away
  groundFire(c0, c1, fromX) {
    const y = 14 * TS;
    for (let c = c0 + 0.5; c < c1; c += 1.5) this.time.delayedCall(Math.abs(c * TS - fromX) * 0.5, () => {
      const f = this.fx('fire', c * TS + Phaser.Math.Between(-3, 3), y + 1, { depth: 8 }).setScale(1.4, 1.2 + Math.random() * 0.6); this.light(f, 0.5, 0.2);
      this.tweens.add({ targets: f, alpha: 0, scaleY: 0.4, delay: 380, duration: 260, onComplete: () => f.destroy() });
    });
  }
  // spikes of ice burst up out of the cave floor from where the club struck, then sink and shatter
  groundIce(c0, c1, fromX) {
    const y = 14 * TS;
    for (let c = c0 + 0.5; c < c1; c += 1.25) this.time.delayedCall(Math.abs(c * TS - fromX) * 0.5, () => {
      const sp = this.add.image(c * TS + Phaser.Math.Between(-3, 3), y + 2, 'icespike').setOrigin(0.5, 1).setDepth(8).setScale(1, 0).setFlipX(Math.random() < 0.5);
      const h = 0.7 + Math.random() * 0.6;
      this.tweens.add({ targets: sp, scaleY: h, duration: 90, ease: 'Back.easeOut', onComplete: () =>
        this.tweens.add({ targets: sp, scaleY: 0, alpha: 0.4, delay: 330, duration: 200, onComplete: () => sp.destroy() }) });
    });
  }
  // on the ice ledge: a pale light marks the spot, and a second later an icicle spears down from the roof
  iceStrike(x) {
    const r = this.groundAt(x); if (r == null) return; const y = r * TS;
    // drawn above the cave's darkness, so the warning is never hidden
    const mark = this.add.image(x, y - 2, 'glow').setScale(0.7, 0.3).setTint(0xbfe8ff).setBlendMode(Phaser.BlendModes.ADD).setDepth(12);
    const beam = this.add.rectangle(x, this.cam.scrollY, 18, y - this.cam.scrollY, 0xd8f2ff, 0.5).setOrigin(0.5, 0).setBlendMode(Phaser.BlendModes.ADD).setDepth(12);
    this.tweens.add({ targets: [mark, beam], alpha: 0.35, yoyo: true, repeat: 4, duration: 110 });
    this.time.delayedCall(1000, () => {
      mark.destroy(); beam.destroy(); if (this.done) return;
      const ic = this.add.image(x, this.cam.scrollY - 20, 'icicle').setOrigin(0.5, 1).setDepth(12).setScale(1.4);
      this.tweens.add({ targets: ic, y: y + 4, duration: 140, ease: 'Quad.easeIn', onComplete: () => {
        this.hazard(x - 12, y - 46, 24, 46, 200); this.cam.shake(140, 0.008); sfx('hit'); this.shatter(ic, { step: 1, power: 0.6 }); ic.destroy();
      } });
    });
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
    const w = this.physics.add.sprite(Math.min(this.whiteAt.x, 171 * TS), this.whiteAt.y - 60, 'whitediv-walk', 0).setDepth(4).setFlipX(true);
    this.fit(w, 'whitediv'); w.play('whitediv-walk'); w.state = 'walk'; w.tm = 120; w.dir = -1; w.throwCd = 90;
    // his hide of snow turns every blow, until his club is caught fast in the ice after a slam
    w.immune = () => w.state !== 'stuck' && w.state !== 'dazed'; w.calm = () => !w.immune(); w.contact = () => w.state === 'charge';   // his blows hurt, not his hide
    w.immuneMsg = 'The blow glances off his hide of snow. Strike while his club is stuck in the ice, or when he is dazed after a charge.';
    w.ai = () => this.whiteAI(); w.onDown = () => { this.floorWarn?.destroy(); this.chargeWarn?.destroy(); this.stars?.destroy(); this.stars = null; this.bossFall(w, () => this.whiteFallen()); };
    this.arena(146 * TS, w, 12); this.light(w, 2.4); sfx('roar'); this.cam.shake(700, 0.01); this.ledgeT = 0;
    // a blue glow along the floor warns of the slam
    this.floorWarn = this.add.rectangle(146 * TS, 14 * TS - 10, 30 * TS, 20, 0x80c8ff, 1).setOrigin(0, 0.5).setBlendMode(Phaser.BlendModes.ADD).setAlpha(0).setDepth(3);
    toast('The White Div rises from the dark like a mountain of snow: "So, the son of Zal comes at last."');
    hint('When <b>the floor glows blue</b> he is about to slam: <b>jump onto the ice ledge</b>. Then his club is <b>stuck in the ice: drop down and strike!</b>');
  }
  // one clear loop: he stalks Rostam, raises his club (the floor glows), slams the whole floor of the cave, and his club
  // sticks in the ice: the opening. The ledges are safe from the slam, but stay on one too long and he hurls a boulder
  whiteAI() {
    const w = this.boss, p = this.player; w.tm--; const mad = w.hp <= w.max / 2;
    if (mad && !w.mad) { w.mad = true; w.setTint(0xffd0d0); sfx('roar'); this.cam.shake(600, 0.012); banner('خشمِ دیو', 'The White Div rages'); }
    const up = p.body.bottom < 13 * TS && p.body.blocked.down; this.ledgeT = up ? this.ledgeT + 1 : 0;
    if (this.charge(w, 'whitediv-walk')) return;
    if (w.state === 'walk') {
      this.stalk(w, p, 62, 149, 173, mad ? 62 : 46, 'whitediv-walk', [155.5, 166.5]); w.throwCd--;
      if (w.tm > 20 && this.tryCharge(w)) return;
      if (up && this.ledgeT > 80 && w.throwCd <= 0) {
        // he roars at the roof and the ice comes down on the ledge: two marks, a moment apart
        w.setVelocityX(0); w.state = 'roar'; w.tm = 60; w.throwCd = mad ? 120 : 170; sfx('roar'); this.cam.shake(300, 0.008);
        this.iceStrike(p.x); this.time.delayedCall(450, () => this.iceStrike(p.x + (p.x < 161 * TS ? 40 : -40)));
        if (!this.toldIce) { this.toldIce = true; toast('He roars at the roof! Where the light shines, ice will fall. Move!'); }
      } else if (!up && w.throwCd <= 0 && Math.abs(p.x - w.x) > 150) { w.setVelocityX(0); w.state = 'throw'; w.tm = 50; w.play('whitediv-throw'); w.hit = false; }
      else if (w.tm <= 0) { w.state = 'raise'; w.tm = Math.max(mad ? 50 : 64, this.reachT(157, 166)); w.setVelocityX(0); w.play('whitediv-smash'); w.anims.pause(); w.setFrame(5); sfx('roar'); }   // the club swung back over his shoulder
    } else if (w.state === 'raise') {
      w.setVelocityX(0); this.floorWarn.setAlpha(0.15 + 0.35 * Math.abs(Math.sin(w.tm * 0.25)));
      if (w.tm <= 0) { w.state = 'slam'; w.tm = 34; w.anims.resume(); w.hit = false; }
    } else if (w.state === 'slam') {
      if (!w.hit && w.tm < 24) {
        // the whole floor of the cave shakes: only the ledges and the air are safe
        w.hit = true; const y = 14 * TS; this.floorWarn.setAlpha(0.9); this.tweens.add({ targets: this.floorWarn, alpha: 0, duration: 400 });
        this.hazard(146 * TS, y - 22, 30 * TS, 22, 520); this.groundIce(146, 176, w.x);
        this.cam.shake(380, 0.016); sfx('hit');
      }
      if (w.tm <= 0) {
        // the club bites deep into the ice: the opening
        w.state = 'stuck'; w.tm = mad ? 120 : 150; w.anims.stop(); w.setFrame(7); w.setTint(0xbfe0ff);
        this.stars = this.fx('stun', w.x, w.body.top - 4, { depth: 10, follow: w }); hint('His club is <b>stuck in the ice: drop down and strike him now!</b>');
      }
    } else if (w.state === 'stuck') {
      if (this.stars) this.stars.setPosition(Math.round(w.x), Math.round(w.body.top - 4));
      if (w.tm <= 0) { w.mad ? w.setTint(0xffd0d0) : w.clearTint(); this.stars?.destroy(); this.stars = null; w.state = 'walk'; w.tm = (mad ? 100 : 140) + Math.random() * 40;
        this.fx('dust', w.x + w.dir * 40, w.body.bottom, { depth: 8 }); hint('He pulls his club free. When <b>the floor glows blue</b>, get onto the <b>ice ledge</b>.'); }
    } else if (w.state === 'throw') {
      w.setVelocityX(0);
      if (!w.hit && w.tm < 24) {
        w.hit = true; const n = mad ? 2 : 1;
        for (let i = 0; i < n; i++) {
          const tx = p.x + (i ? 40 * -w.dir : 0), t = 0.9 + i * 0.15, vx = (tx - w.x) / t, vy = -(0.5 * 700 * t) + (p.y - w.body.top) / t;
          this.shoot(w.x + w.dir * 30, w.body.top + 10, vx, vy, 'boulder', { gravity: 700, spin: 8, life: 2500 });
        }
        sfx('swing'); if (!this.toldRock) { this.toldRock = true; toast('He hurls a boulder at your ledge. Jump clear!'); }
      }
      if (w.tm <= 0) { w.state = 'walk'; w.throwCd = mad ? 110 : 160; }
    } else if (w.state === 'roar') {
      w.setVelocityX(0); if (w.tm <= 0) w.state = 'walk';
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
      hint('<b>Follow the glowing ram</b>: it knows where the water is.');
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
  // the mace meets a curse and sends it back where it came from, faster
  deflect(sh) {
    const B = this.boss, a = B?.active ? Math.atan2(B.y - 8 - sh.y, B.x - sh.x) : (this.face > 0 ? 0 : Math.PI);
    sh.back = true; sh.setVelocity(Math.cos(a) * 280, Math.sin(a) * 280); sh.setRotation(a); sh.setTint(0xffe08a); sh.die = this.time.now + 2500;
    this.fx('hit', sh.x, sh.y, { depth: 10 }); sfx('hit'); this.hitStop(40);
    if (!this.toldDeflect) { this.toldDeflect = true; toast('Your mace turns the curse back on the witch!'); }
  }
  // the ram's riddle: it taps the standing stones in an order; strike them in the same order and the rock gives water
  startStones() {
    this.puzzle = { seq: [2, 0, 3, 1], at: 0, showing: false, done: false };
    toast('The ram stops at a dry rock and stamps. Four old stones stand in the sand...');
    hint('The ram will tap the <b>four stones</b> in an order. <b>Watch closely.</b>');
    this.time.delayedCall(1000, () => this.showStones());
  }
  showStones() {
    const P = this.puzzle; if (!P || P.done) return;
    P.showing = true; P.at = 0; this.frozen = true; this.player.setVelocityX(0);
    P.seq.forEach((i, k) => this.time.delayedCall(k * 800, () => { this.lightStone(i); if (this.ram) this.ram.setFlipX(this.stones[i].x < this.ram.x); }));
    this.time.delayedCall(P.seq.length * 800 + 300, () => {
      P.showing = false; this.frozen = false;
      hint('Now <b>strike the stones in the same order</b> the ram showed you: sun, moon, star or water.');
    });
  }
  lightStone(i, tint = 0x8fe0ff) {
    const st = this.stones[i]; this.tweens.killTweensOf(st.glow);
    st.glow.setTint(tint).setAlpha(1); this.tweens.add({ targets: st.glow, alpha: 0, delay: 300, duration: 400 });
    if (tint === 0x8fe0ff) sfx('stone' + i);
  }
  strikeStone(i) {
    const P = this.puzzle; if (!P || P.done || P.showing) return;
    if (P.seq[P.at] === i) { this.lightStone(i); if (++P.at === P.seq.length) this.openSpring(); return; }
    P.at = 0; this.stones.forEach((_, k) => this.lightStone(k, 0xff5a5a)); sfx('hit'); this.cam.shake(150, 0.006);
    toast('The stones grow dark. The ram stamps again: watch closely.');
    this.time.delayedCall(1200, () => this.showStones());
  }
  openSpring() {
    this.puzzle.done = true; this.springOpen = true; sfx('win');
    const x = this.springAt.x + 26, y = this.springAt.y;
    this.cam.flash(350, 200, 240, 255); this.fx('beam', x, y + 1, { depth: 4 });
    for (let k = 0; k < 4; k++) this.time.delayedCall(k * 220, () => this.fx('splash', x + (k - 1.5) * 14, y + 1, { depth: 6 }));
    this.tweens.add({ targets: this.pool, alpha: 1, duration: 900, onComplete: () => this.tweens.add({ targets: this.pool, alpha: 0.85, yoyo: true, repeat: -1, duration: 900, ease: 'Sine.easeInOut' }) });
    toast('The stones ring together, and water bursts from the rock!');
    hint('<b>Walk into the spring</b> to drink.');
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
// the Book of Foes: a leaf for each labour, with its great foe (an animated miniature), its tale and how to beat it
const GUIDE = [
  { k: 1, fa: 'شیرِ نیستان', name: 'The Lion of the Reeds', art: ['lion-roar', 8, 148],
    tale: 'Rostam lay down to sleep among the reeds while Rakhsh grazed. In the night a great lion crept out of the thicket. In the old tale faithful Rakhsh trampled it; here Rostam must stand against it himself.',
    how: ['It <b>roars</b>, then <b>charges</b> in a straight line. Its hide turns your blows.', '<b>Jump over the charge</b> so it runs into the rocks: it is <b>dazed</b>, and a <b>gold arrow</b> shows over it.', '<b>Strike while the arrow shows</b>, or land on it from above for a double blow.'],
    more: [['jackal-run', 8, 108, 'Jackal', 'Runs straight at you. One blow.'], ['div-hop', 8, 108, 'Blue Div', 'Hops toward you. Strike as it lands.']] },
  { k: 2, fa: 'بیابانِ بی‌آب', name: 'The Waterless Desert', art: ['k2/scorpion-crawl', 8, 108],
    tale: 'Beyond the reeds lay a desert where no bird flew. Rostam and Rakhsh grew faint with thirst, until a ram came walking out of the heat and led them to a hidden spring.',
    how: ['Your <b>water drains</b> in the heat: skins refill a little, <b>wells refill it all</b>.', '<b>Scorpions</b> scuttle at you when you are close: <b>two blows</b>, or jump on them.', 'At the spring, <b>watch the ram tap the stones</b>, then strike them in the same order.'],
    more: [['k2/vulture-fly', 8, 108, 'Vulture', 'Circles, then dives. Strike it as it swoops low.'], ['k2/ram-walk', 8, 108, 'The Ram', 'A friend. Follow it to the water.']] },
  { k: 3, fa: 'اژدها', name: 'The Dragon', art: ['k3/dragon-fire', 8, 136],
    tale: 'A dragon eighty cubits long ruled the night. Twice Rakhsh woke Rostam to warn him, and twice the dragon vanished into the dark. The third time God let Rostam see it, and with Rakhsh biting its neck he struck off its head.',
    how: ['You ride <b>Rakhsh</b>: faster, with a longer reach from the saddle.', 'The dragon <b>hides in the dark</b>; while hidden, blows pass through it.', 'When <b>Rakhsh rears and neighs</b> it is revealed: <b>charge and strike</b>, and <b>jump its fire</b>.'],
    more: [['k3/bat-fly', 8, 108, 'Bat', 'Darts down at you. Swing as it swoops, even over your head.']] },
  { k: 4, fa: 'زنِ جادو', name: 'The Witch', art: ['k4/hag-cast', 8, 108],
    tale: 'In a green garden Rostam found wine, a lute and a feast. A beautiful woman came to share it, but when he spoke the name of God her face turned black. She was a witch, and the feast was a trap.',
    how: ['At the feast, <b>stand by the lady and strike</b> to speak the name of God.', 'Unmasked, she flies and hurls <b>green curses</b>: <b>strike them to send them back</b> at her, or jump them.', '<b>Strike her when she is solid</b>. Hurt, she calls up serpents.'],
    more: [['k4/serpent', 8, 108, 'Serpent', 'Sways, then lunges. Hit it as it rears.'], ['k3/bat-fly', 8, 108, 'Bat', 'Strike it as it swoops.']] },
  { k: 5, fa: 'اولاد', name: 'Olad the Warden', art: ['k5/olad-slash', 6, 112],
    tale: 'In Mazandaran the warden Olad rode out with his men against the stranger. Rostam beat them, caught Olad with his lasso, and spared his life on one condition: that he show him the way to the Divs.',
    how: ['His <b>shield blocks every blow from the front</b> (a grey shield over his head).', 'When he <b>flashes, step back</b> from his sword. Then he <b>glows</b> and the <b>gold arrow</b> shows: <b>strike!</b>', 'Or <b>jump twice</b> over him: <b>his back is always open</b>.'],
    more: [['k5/spearman-thrust', 6, 140, 'Spearman', 'Long reach. Close in right after his thrust.']] },
  { k: 6, fa: 'ارژنگِ دیو', name: 'Arzhang Div', art: ['k6/arzhang-smash', 5, 136],
    tale: 'Arzhang was a chieftain of the Divs, camped with his horde before the mountains. Rostam rode into the camp at dawn with Olad as his guide, roared his name, and struck Arzhang\'s head from his shoulders.',
    how: ['He stalks you, then raises his axe for <b>two blows</b>. A <b>red glow</b> shows where each will land.', '<b>Floor glows: leap onto a platform.</b> <b>Platforms glow: drop to the ground.</b>', 'After the second blow <b>he rests on his axe: strike him then</b>.', 'If he <b>stamps and flushes red</b>, he will <b>charge</b>: leap onto a ledge. If he hits the wall he is <b>dazed: strike!</b>'],
    more: [['k6/divwarrior-smash', 8, 148, 'Div warrior', 'Turns slowly. Drop behind him and strike his back; jump his shockwave.'], ['k3/bat-fly', 8, 108, 'Bat', 'Pesters you on the high platform. Swing up at it.']] },
  { k: 7, fa: 'دیوِ سپید', name: 'The White Div', art: ['k7/whitediv-smash', 9, 136],
    tale: 'The White Div held King Kay Kavus captive in a cave as dark as night, beyond seven mountains. Only the blood of its heart could give the blinded king back his sight. Rostam fought it until the cave ran with blood and sweat.',
    how: ['When <b>the floor glows blue</b> he raises his club: <b>jump onto the ice ledge</b>.', 'His slam shakes the whole floor, and his <b>club sticks in the ice</b>: <b>drop down and strike!</b>', 'Linger on the ledge and he roars: where <b>a light shines</b>, an <b>icicle falls</b> a second later. Move!', 'If he <b>stamps and flushes red</b>, he will <b>charge</b>: leap onto a ledge. If he hits the wall he is <b>dazed: strike!</b>'],
    more: [['k6/divwarrior-smash', 8, 148, 'Div warrior', 'Three blows. Strike his back while he turns.'], ['k3/bat-fly', 8, 108, 'Bat', 'Swing up at it as it swoops.']] }
];
let gpg = 0, guideFrom = null;
const mini = ([src, n, h], size, cls = '') => `<i class="spr ${cls}" style="--n:${n};--s:${size}px;--src:url(assets/${src}.png)" data-n="${n}" data-key="${src.split('/').pop()}"></i>`;
// the miniatures move at their in-game speed: walkers and fliers loop, attacks play once and then the foe waits a few seconds
let sprTimer = 0;
function animateMinis() {
  clearInterval(sprTimer);
  const els = [...$('gleaf').querySelectorAll('.spr')].map((el, i) => {
    const key = el.dataset.key, n = +el.dataset.n;
    return { el, n, fps: FPS[key] || 10, attack: /smash|slash|thrust|fire|cast|roar/.test(key), t0: performance.now() - i * 700, last: -1 };
  });
  const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const tick = () => {
    if ($('s-guide').classList.contains('hidden')) return clearInterval(sprTimer);
    const now = performance.now();
    for (const a of els) {
      const play = a.n / a.fps * 1000, cycle = a.attack ? play + 2600 : play, t = (now - a.t0) % cycle;
      const f = still || t >= play ? 0 : Math.floor(t / 1000 * a.fps) % a.n;
      if (f !== a.last) { a.last = f; a.el.style.backgroundPositionX = `calc(var(--s) * ${-f})`; }
    }
  };
  tick(); sprTimer = setInterval(tick, 25);
}
function showGuide(i) {
  gpg = (i + GUIDE.length) % GUIDE.length; const g = GUIDE[gpg];
  $('gtabs').innerHTML = GUIDE.map((x, j) => `<button class="${j === gpg ? 'sel' : ''}" data-g="${j}" aria-label="Khan ${ROMAN[x.k]}: ${x.name}">${ROMAN[x.k]}</button>`).join('');
  $('gtabs').querySelectorAll('button').forEach(b => b.onclick = () => showGuide(+b.dataset.g));
  $('gleaf').innerHTML = `<div class="gcard"><div class="gport k${g.k}">${mini(g.art, 180)}</div>
    <div class="gtext"><div class="fa">${g.fa}</div><h2>${g.name}</h2><p class="kick">Khan ${ROMAN[g.k]} &middot; ${NAMES[g.k][0]}</p><p class="gtale">${g.tale}</p></div></div>
    <div class="ghow"><h3>How to beat it <span class="gkey"><i class="ka"></i>strike now <i class="ks"></i>guarded</span></h3><ol>${g.how.map(h => `<li>${h}</li>`).join('')}</ol></div>
    <h3 class="galso">Also on this road</h3><div class="gmore">${g.more.map(([src, n, h, name, tip]) => `<div>${mini([src, n, h], 64)}<p><b>${name}</b>${tip}</p></div>`).join('')}</div>`;
  $('gleaf').scrollTop = 0; animateMinis();
}
function openGuide(n) {
  if (playing) setPaused(true);
  guideFrom = document.querySelector('.ov:not(.hidden):not(#s-guide)'); guideFrom?.classList.add('hidden');
  $('s-guide').classList.remove('hidden'); showGuide(Math.max(0, GUIDE.findIndex(g => g.k === n))); $('gNext').focus();
}
function closeGuide() { $('s-guide').classList.add('hidden'); if (guideFrom) { guideFrom.classList.remove('hidden'); guideFrom.querySelector('.btn')?.focus(); } else openMap(false); }
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
function openMap(e) {
  if (e !== false) music(A.want);                                  // a click: the menu theme may begin
  if (playing) setPaused(true);
  mapFrom = document.querySelector('.ov:not(.hidden):not(#s-map)'); mapFrom?.classList.add('hidden');
  $('s-map').classList.toggle('home', !mapFrom); $('mapClose').classList.toggle('hidden', !mapFrom);   // the map is also the home screen
  pick = Math.min(unlocked(), LABOURS); if (!LEVELS[pick]) pick = cur;
  renderMap(); $('s-map').classList.remove('hidden'); $('rideBtn').focus();
}
function closeMap() { $('s-map').classList.add('hidden'); if (mapFrom) mapFrom.classList.remove('hidden'); else openMap(false); }
document.querySelectorAll('[data-map]').forEach(b => b.onclick = openMap);
$('mapClose').onclick = closeMap; $('rideBtn').onclick = () => begin(pick);
$('mapTale').onclick = () => openStory(0, pick);
// the Fire Temple: provisions offered for lasting gifts. The game waits while Rostam stands at the fire.
function renderTemple() {
  const u = upg(), have = purse(); $('purseN').textContent = have;
  $('gifts').innerHTML = UPGRADES.map(g => {
    const lvl = u[g.id] || 0, cost = g.costs[lvl];
    return `<li><h3>${g.name}<span>${g.fa}</span></h3><p>${g.desc}${g.costs.length > 1 ? ` (${lvl} of ${g.costs.length})` : ''}</p>` +
      (cost == null ? '<span class="owned">Granted</span>' : `<button class="btn2" data-gift="${g.id}" ${have < cost ? 'disabled' : ''}>Offer ${cost}</button>`) + '</li>';
  }).join('');
  $('gifts').querySelectorAll('[data-gift]').forEach(b => b.onclick = () => {
    const u = upg(), g = UPGRADES.find(x => x.id === b.dataset.gift), lvl = u[g.id] || 0, cost = g.costs[lvl];
    if (cost == null || purse() < cost) return;
    setPurse(purse() - cost); u[g.id] = lvl + 1; setUpg(u); sfx('fire'); $('coins').textContent = purse();
    const sc = game.scene.getScene('play'); if (g.id === 'heart' && sc) { sc.maxHp++; sc.hp++; sc.renderHearts(); }
    renderTemple(); $('gifts').querySelector(`[data-gift="${g.id}"]`)?.focus();
  });
}
function openTemple() { setPaused(true); $('s-pause').classList.add('hidden'); renderTemple(); $('s-temple').classList.remove('hidden'); $('templeDone').focus(); }
function closeTemple() { $('s-temple').classList.add('hidden'); setPaused(false); }
$('templeDone').onclick = closeTemple; $('templeClose').onclick = closeTemple;
$('offerBtn').onclick = () => { if (playing) openTemple(); };
$('farrBtn').onclick = () => { const sc = game.scene.getScene('play'); if (playing && sc?.farr >= 100) sc.farrBlast(); };
document.querySelectorAll('[data-guide]').forEach(b => b.onclick = () => openGuide($('s-map').classList.contains('hidden') ? cur : pick));
$('gPrev').onclick = () => showGuide(gpg - 1); $('gNext').onclick = () => showGuide(gpg + 1); $('guideClose').onclick = closeGuide;
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
function closeStory() { $('s-story').classList.add('hidden'); if (storyFrom) { storyFrom.classList.remove('hidden'); storyFrom.querySelector('.btn')?.focus(); } else openMap(false); }
document.querySelectorAll('[data-story]').forEach(b => b.onclick = () => openStory(+b.dataset.story || 0, cur));
$('prevPg').onclick = () => turn(-1); $('nextPg').onclick = () => turn(1); $('storyClose').onclick = closeStory;
$('pauseBtn').onclick = () => setPaused(true); $('resumeBtn').onclick = () => setPaused(false);
$('restartBtn').onclick = () => { const sc = game.scene.getScene('play'); sc.done = true; begin(); };
addEventListener('blur', () => { if (playing) setPaused(true); });
game = new Phaser.Game({
  type: Phaser.AUTO, parent: 'game', width: W * ZOOM, height: H * ZOOM, pixelArt: true, backgroundColor: '#06060c',
  scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
  physics: { default: 'arcade', arcade: { gravity: { y: 900 }, debug: location.hash === '#physics' } },
  scene: [Play]
});
$('playBtn').onclick = () => (unlocked() > 1 ? openMap() : begin(1)); $('againBtn').onclick = () => begin(); $('retryBtn').onclick = () => begin(cur, true); $('freshBtn').onclick = () => begin();
$('muteBtn').onclick = () => { audio(); setMuted(!A.muted); };
setMuted(A.muted);
openMap(false);                                                   // the game opens on the road of the seven labours
if (location.hash === '#debug') window.__sh = { game, scene: () => game.scene.getScene('play'), keys, pressed, setPaused, openStory, begin, openMap, LEVELS, FOES, snd: { A, audio, sfx, pickTrack } };
})();
