/* Shahnameh: The Seven Labours of Rostam. Khan I, the Lion of the Reeds.
   Built on Phaser 3. Placeholder pixel art is generated in code; drop PixelLab
   sprite strips into ./assets and list them in ART below to replace it. */
(() => {
'use strict';
const $ = id => document.getElementById(id);
const trackGame = (name, params) => { try { window.shahnamehTrack?.(name, params); } catch (_) { /* Analytics must never interrupt play. */ } };
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
  'rostam-idle': 'rostam-idle.png', 'rostam-run': 'rostam-run.png', 'rostam-jump': 'rostam-jump.png', 'rostam-attack': 'rostam-attack.png', 'rostam-hurt': 'rostam-hurt.png', 'rostam-dodge': 'rostam-dodge.png', 'rostam-heavy': 'rostam-heavy.png',
  'lion-walk': 'lion-walk.png', 'lion-run': 'lion-run.png', 'lion-roar': 'lion-roar.png', 'lion-die': 'lion-die.png', 'simurgh-fly': 'simurgh-fly.png',
  'jackal-run': 'jackal-run.png', 'div-hop': 'div-hop.png',
  // Khan II
  'ride-gallop': 'k3/ride-gallop.png', 'ride-strike': 'k3/ride-strike.png', 'ride-rear': 'k3/ride-rear.png',
  'queen-walk': 'k2/queen-walk.png', 'queen-sting': 'k2/queen-sting.png', 'queen-spit': 'k2/queen-spit.png', 'queen-die': 'k2/queen-die.png', 'scorpion-crawl': 'k2/scorpion-crawl.png', 'scorpion-sting': 'k2/scorpion-sting.png', 'vulture-fly': 'k2/vulture-fly.png', 'ram-walk': 'k2/ram-walk.png', 'rostam-drink': 'rostam-drink.png', 'rostam-fall': 'rostam-fall.png', 'rostam-victory': 'rostam-victory.png', 'rostam-anoint': 'rostam-anoint.png',
  // Khan III
  'dragon-move': 'k3/dragon-move.png', 'dragon-fire': 'k3/dragon-fire.png', 'dragon-die': 'k3/dragon-die.png', 'rakhsh-gallop': 'k3/rakhsh-gallop.png', 'rakhsh-rear': 'k3/rakhsh-rear.png', 'bat-fly': 'k3/bat-fly.png',
  // Khan IV
  'serpent': 'k4/serpent.png', 'serpent-strike': 'k4/serpent-strike.png', 'hag-cast': 'k4/hag-cast.png', 'hag-die': 'k4/hag-die.png', 'beauty-idle': 'k4/beauty-idle.png',
  // Khan V
  'spearman-walk': 'k5/spearman-walk.png', 'spearman-thrust': 'k5/spearman-thrust.png', 'olad-walk': 'k5/olad-walk.png', 'olad-slash': 'k5/olad-slash.png', 'olad-kneel': 'k5/olad-kneel.png',
  // Khan VI
  'divwarrior-walk': 'k6/divwarrior-walk.png', 'divwarrior-smash': 'k6/divwarrior-smash.png', 'arzhang-walk': 'k6/arzhang-walk.png', 'arzhang-smash': 'k6/arzhang-smash.png', 'arzhang-die': 'k6/arzhang-die.png',
  'firediv-walk': 'k6/firediv-walk.png', 'firediv-throw': 'k6/firediv-throw.png', 'ghul-crawl': 'k6/ghul-crawl.png', 'ghul-leap': 'k6/ghul-leap.png',
  // Khan VII
  'whitediv-walk': 'k7/whitediv-walk.png', 'whitediv-smash': 'k7/whitediv-smash.png', 'whitediv-throw': 'k7/whitediv-throw.png', 'whitediv-die': 'k7/whitediv-die.png', 'kavus-sight': 'k7/kavus-sight.png'
};
const FPS = { 'queen-walk': 10, 'queen-sting': 14, 'queen-spit': 12, 'queen-die': 7, 'rostam-dodge': 22, 'rostam-heavy': 14, 'simurgh-fly': 9, 'lion-die': 6, 'dragon-die': 6, 'hag-die': 6, 'rostam-idle': 5, 'rostam-run': 14, 'rostam-jump': 6, 'rostam-attack': 24, 'rostam-hurt': 10, 'lion-walk': 9, 'lion-run': 14, 'lion-roar': 6, 'jackal-run': 12, 'div-hop': 8, 'coin-spin': 8, 'fire-burn': 10,
  'scorpion-crawl': 10, 'vulture-fly': 10, 'ram-walk': 8, 'rostam-drink': 6, 'rostam-fall': 7, 'rostam-victory': 8, 'rostam-anoint': 6, 'ride-gallop': 12, 'ride-strike': 18, 'ride-rear': 11,
  'dragon-move': 7, 'dragon-fire': 9, 'rakhsh-gallop': 12, 'rakhsh-rear': 9, 'bat-fly': 14,
  'serpent': 8, 'hag-cast': 10, 'beauty-idle': 4,
  'spearman-walk': 10, 'spearman-thrust': 12, 'olad-walk': 10, 'olad-slash': 14, 'olad-kneel': 8,
  'divwarrior-walk': 8, 'divwarrior-smash': 13, 'arzhang-walk': 7, 'arzhang-smash': 9,
  'whitediv-walk': 6, 'whitediv-smash': 11, 'whitediv-throw': 10, 'whitediv-die': 7, 'arzhang-die': 7, 'firediv-walk': 9, 'firediv-throw': 14, 'ghul-crawl': 14, 'ghul-leap': 14, 'serpent-strike': 16, 'scorpion-sting': 16, 'kavus-sight': 6 };
// on-screen frame height in game pixels; equal to the PixelLab frame size so sprites draw 1:1
const SIZE = { queen: 150, rider: 124, rostam: 112, lion: 148, jackal: 108, div: 108, scorpion: 86, vulture: 92, ram: 86, dragon: 136, rakhsh: 104, bat: 108, serpent: 92, hag: 108, beauty: 108, spearman: 140, olad: 112, divwarrior: 100, arzhang: 136, whitediv: 204, firediv: 104, ghul: 100 };
const BODY = { queen: [0.62, 0.42], rider: [0.3, 0.5], rostam: [0.143, 0.393], lion: [0.5, 0.36], jackal: [0.3, 0.22], div: [0.22, 0.34], scorpion: [0.4, 0.22], vulture: [0.33, 0.2], ram: [0.4, 0.4],
  dragon: [0.46, 0.42], rakhsh: [0.5, 0.5], bat: [0.32, 0.24], serpent: [0.31, 0.31], hag: [0.27, 0.42], beauty: [0.2, 0.47], spearman: [0.115, 0.386], olad: [0.17, 0.49], divwarrior: [0.31, 0.64], arzhang: [0.3, 0.7], whitediv: [0.2667, 0.3867], firediv: [0.2, 0.6], ghul: [0.5, 0.36] };
const V = 92;
const REVISED_STORY_ART = new Set(['khan1-intro', 'khan4-intro', 'khan4-outro', 'khan5-intro', 'khan5-outro', 'khan7-intro', 'end2']);
const storyArt = key => `assets/cine/${key}${REVISED_STORY_ART.has(key) ? '-v2' : ''}.png?v=${V}`;
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
  bolt: { w: 136, h: 216, n: 9, fps: 14, ox: 0.5, oy: 0.829 },
  // made in PixelLab's effects workbench: a heavy impact, a ground shockwave, a boss's death blast, the finisher's arc, venom,
  // the Simurgh's sigil, a boss's rage, smoke, and the beacon over an arena heart
  impact: { w: 44, h: 44, n: 4, fps: 16, ox: 0.477, oy: 0.523 }, shock: { w: 104, h: 20, n: 7, fps: 14, ox: 0.481, oy: 0.6 }, blast: { w: 72, h: 79, n: 10, fps: 14, ox: 0.5, oy: 0.456 }, arc: { w: 73, h: 64, n: 5, fps: 14, ox: 0.466, oy: 0.641 }, venom: { w: 24, h: 23, n: 8, fps: 12, ox: 0.5, oy: 0.478, loop: true }, sigil: { w: 122, h: 57, n: 12, fps: 12, ox: 0.5, oy: 0.667, loop: true }, rage: { w: 84, h: 106, n: 8, fps: 12, ox: 0.5, oy: 0.915, loop: true }, smoke: { w: 41, h: 39, n: 8, fps: 12, ox: 0.512, oy: 0.462 }, beacon: { w: 68, h: 87, n: 12, fps: 12, ox: 0.5, oy: 0.897, loop: true }
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
  row(61, 63, 11, '='); row(66, 68, 10, '='); row(74, 77, 10, '='); row(79, 82, 7, '=');   // the marsh ledges are reed rafts that sink
  // the high road over the marsh: up from the first raft, along the reed tops, down onto the temple's high perch. The
  // fire's clearing (48 to 59) stays open ground, so the pack can always reach Rostam there.
  row(64, 65, 7, '='); row(68, 69, 5, '='); row(72, 73, 4, '=');
  for (const c of [37, 41]) { put(c, 12, '#'); put(c, 13, '#'); }
  put(3, 13, 'P');
  [[8, 12], [10, 11], [12, 12], [22, 11], [23, 10], [24, 11], [43, 9], [44, 8], [45, 9], [62, 9], [67, 8], [75, 8], [76, 8], [80, 5], [81, 5],
    [64, 6], [65, 6], [68, 4], [69, 4], [72, 3]].forEach(([c, r]) => put(c, r, 'c'));
  // One jackal teaches the lunge, a pair tests it, the Div comes alone, then a jackal and a Div together.
  put(16, 13, 'j'); put(30, 13, 'j'); put(34, 13, 'j'); put(45, 11, 'd'); put(74, 13, 'd'); put(79, 13, 'j');
  put(27, 13, 'F'); put(52, 13, 'F'); put(110, 12, 'L');
  // the lion's arena (86 to 116): one short ledge on the left, three tiles in from the wall and high enough to walk
  // beneath, to leap onto from its charge. The lion keeps out of mace reach of it (KEEP1): a charge stops at that line
  row(89, 92, 10, '=');
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
  // 'a' is a scorpion buried in the sand: a mound and a stir of grains, until Rostam comes near
  put(15, 13, 'j'); put(33, 12, 's'); put(48, 13, 'a'); put(38, 7, 'v'); put(62, 13, 'j'); put(68, 6, 'v'); put(81, 13, 'a'); put(84, 13, 'a');
  put(90, 12, 's'); put(101, 6, 'v'); put(115, 12, 'a'); put(120, 7, 'v'); // one storm encounter, then a clear path for the ram and bells
  put(57, 12, 'O'); put(107, 13, 'O');
  row(141, 144, 10, '=');                                  // the Scorpion Queen's arena (138 to 168): one short ledge on the left (KEEP2)
  for (const [a, b] of PLINTHS) ground(a, b, 12);          // the water and wind towers stand on plinths, which sink when she rises
  put(128, 13, 'R'); put(164, 13, 'S');                    // the ram's four bell towers stand at TOWER_AT
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
  put(88, 13, 'j'); put(95, 6, 'b'); // leave the fire at 84 and the final approach clear
  [[11, 11], [26, 10], [58, 8], [70, 10]].forEach(([c, r]) => put(c, r, 'm'));          // marsh lights, never beside an altar
  put(42, 13, 'F'); put(84, 13, 'F');
  put(117, 13, 'K'); put(146, 13, 'D');
  row(115, 118, 10, '=');                                  // the dragon's arena (112 to 142): one short ledge on the left (KEEP3)
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
  put(16, 13, 'n'); put(29, 13, 'n'); put(38, 7, 'b'); put(42, 13, 'n'); put(63, 13, 'n'); put(70, 6, 'b'); put(77, 13, 'n'); put(99, 13, 'n'); put(96, 7, 'b');   // serpents lie in the open, never in a pocket Rostam would have to drop into
  [[6, 11], [28, 11], [64, 11], [78, 11], [132, 11], [146, 11]].forEach(([c, r]) => put(c, r, 'l'));   // lanterns, never beside an altar
  put(48, 13, 'F'); put(92, 13, 'F');
  put(120, 13, 'T'); put(128, 13, 'W');
  row(115, 118, 10, '=');                                  // the garden arena (112 to 142): one short balcony on the left
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
  ground(50, 62, 14); row(54, 58, 9, '='); ground(63, 66, 12); ground(67, 78, 14); pit(79, 84); row(80, 81, 11, '='); row(83, 84, 9, '=');
  ground(85, 98, 14); ground(92, 95, 12); ground(99, 149, 14); row(102, 106, 9, '=');
  put(3, 13, 'P');
  [[9, 12], [10, 12], [25, 11], [30, 10], [40, 12], [47, 9], [56, 8], [57, 8], [65, 10], [73, 12], [84, 8], [90, 12], [94, 10], [104, 8]].forEach(([c, r]) => put(c, r, 'c'));
  put(14, 13, 'q'); put(36, 13, 'q'); put(42, 13, 'j'); put(60, 13, 'q'); put(71, 13, 'q'); put(76, 13, 'j'); put(88, 13, 'q'); put(99, 13, 'q');   // the last spearman patrols clear of Olad's arena platform
  put(24, 12, 'F'); put(52, 13, 'F');
  put(130, 13, 'O');
  row(115, 118, 10, '=');                                  // Olad's arena (112 to 142): one short ledge on the left (KEEP5)
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
  // Arzhang's arena (124 to 154): one platform, in the left corner, to leap onto when his axe splits the whole floor.
  // He keeps out of mace reach of it (KEEP6), so it is a refuge, never a perch to strike him from
  row(127, 130, 10, '=');
  put(3, 13, 'P');
  [[9, 8], [16, 7], [22, 10], [23, 10], [32, 12], [39, 8], [48, 12], [90, 10], [97, 7], [104, 12]].forEach(([c, r]) => put(c, r, 'c'));
  put(15, 13, 'd'); put(30, 13, 'w'); put(49, 13, 'd'); put(53, 13, 'w'); put(112, 13, 'w');
  // war fires, kept well apart from each other and from the altars (44, 100, 118)
  [[12, 13], [28, 13], [67, 13], [134, 13]].forEach(([c, r]) => put(c, r, 'B'));
  put(44, 13, 'F'); put(100, 13, 'F');
  put(72, 13, 'h'); put(140, 13, 'A');
  return g;
}

// Khan VII: the seven mountains and the White Div's cave. Columns from CAVE7 on are inside the cave.
// 'k' Kay Kavus in chains  'X' the White Div
const CAVE7 = 120;
// the column a great Div's feet never pass toward his arena's corner platform: six tiles beyond its edge, well out of reach of the mace
// the ram's four bell towers: the drawn tower's scale, where its arch's beam sits (fraction of its height from the top),
// the bell's scale; and each tower's element, colour and bell note (Hz)
const TOWER = { scale: 0.8, bell: [0.16, 0.132, 0.125, 0.181], foot: [1, 1, 1, 0.896], bellScale: 0.45 };
const ELEMENTS = [{ name: 'earth', tint: 0xe8b060, note: 392 }, { name: 'water', tint: 0x6ad8ff, note: 523 }, { name: 'fire', tint: 0xff7a2a, note: 659 }, { name: 'wind', tint: 0xe8f4ff, note: 784 }];
const PLINTHS = [[150, 152], [160, 162]], TOWER_AT = [146, 151, 156, 161];   // Khan II: the four bell towers, two of them raised
const KEEP2 = 150, KEEP1 = 99, KEEP3 = 126, KEEP5 = 125, KEEP6 = 137, KEEP7 = 159;
// the row a thing can stand on in a map column (or the nearest column that has ground): for fires and hearts
function topAt(map, c, groundOnly = false) {
  const solid = ch => ch === '#' || (!groundOnly && ch === '=');
  for (const dc of [0, 1, -1, 2, -2, 3, -3]) { const k = c + dc; for (let r = 1; r < map.length; r++) if (map[r][k] && solid(map[r][k]) && !solid(map[r - 1][k])) return r; }
  return null;
}
function map7() {
  const C = 200, g = Array.from({ length: ROWS }, () => Array(C).fill('.'));
  const ground = (a, b, top) => { for (let c = a; c <= b; c++) for (let r = top; r < ROWS; r++) g[r][c] = '#'; };
  const put = (c, r, ch) => { g[r][c] = ch; };
  const row = (a, b, r, ch) => { for (let c = a; c <= b; c++) g[r][c] = ch; };
  const pit = (a, b) => { for (let c = a; c <= b; c++) for (let r = 0; r < 16; r++) g[r][c] = '.'; ground(a, b, 16); row(a, b, 15, '^'); };
  ground(0, 18, 14); ground(19, 22, 12); ground(23, 26, 10); ground(27, 34, 13); pit(35, 40); row(36, 37, 10, '='); row(39, 40, 9, '=');
  ground(41, 52, 13); ground(53, 56, 11); ground(57, 66, 14); pit(67, 71); row(68, 70, 11, '='); ground(72, 84, 13); ground(85, 88, 11);
  ground(89, 98, 14); pit(99, 104); row(100, 101, 10, '='); row(103, 104, 9, '='); ground(105, 199, 14); ground(110, 113, 12);
  ground(126, 129, 12); pit(133, 136); row(134, 135, 11, '=');   // laid after the floor: pit() digs it out
  // the White Div's arena (146 to 176): one short ice ledge on the left, safe from his slam. He keeps out of mace
  // reach of it (KEEP7)
  row(149, 152, 10, '=');
  put(3, 13, 'P');
  [[10, 12], [24, 8], [25, 8], [31, 11], [38, 8], [47, 11], [55, 9], [62, 12], [69, 9], [79, 11], [87, 9], [94, 12], [102, 7], [116, 12], [128, 10], [140, 12]].forEach(([c, r]) => put(c, r, 'c'));
  put(14, 13, 'd'); put(30, 12, 'w'); put(37, 7, 'b'); put(49, 12, 'd'); put(61, 13, 'w'); put(70, 7, 'b'); put(78, 12, 'w'); put(91, 13, 'd'); put(101, 6, 'b');
  put(116, 13, 'w'); put(124, 8, 'b'); put(139, 13, 'w');
  put(44, 12, 'F'); put(96, 13, 'F'); put(143, 13, 'F');
  put(176, 13, 'X'); put(193, 13, 'k');
  return g;
}

// Map encounters stop before rest areas and story triggers. Bounds are tile edges,
// shared by deliberate pairs, and do not apply to boss summons or horde waves.
const ENCOUNTERS = {
  2: [[15,11,19],[33,31,36],[48,42,53],[38,34,43],[62,60,65],[68,65,72],[81,80,86],[84,80,86],[90,86,92],[101,98,104],[115,114,119],[120,119,125]],
  3: [[13,9,17],[24,22,32],[36,33,40],[53,49,57],[60,57,65],[68,64,74],[74,71,80],[88,87,93],[95,93,101]],
  4: [[16,12,20],[29,25,35],[38,35,40],[42,40,46],[63,58,67],[70,67,73],[77,74,80],[99,96,104],[96,94,104]],
  5: [[14,10,22],[36,33,45],[42,33,45],[60,56,63],[71,68,79],[76,68,79],[88,85,92],[99,96,104]],
  6: [[15,11,20],[30,26,37],[49,48,57],[53,48,57],[112,109,116]],
  7: [[14,10,19],[30,27,35],[37,35,41],[49,48,53],[61,57,67],[70,67,72],[78,74,85],[91,89,94],[101,99,105],[116,114,118],[124,121,131],[139,137,142]]
};
function setupEncounters(s) {
  for (const f of s.foes.getChildren()) {
    const area = ENCOUNTERS[cur]?.find(([c]) => Math.abs(f.home.x / TS - (c + 0.5)) < 0.1);
    if (area) { f.roam = area.slice(1).map(c => c * TS); f.encounter = true; }
  }
  s.routeBeat = -1;
}
const nearRest = (s, x) => s.altars.some(a => Math.abs(a.x - x) < 3 * TS);
const canHunt = (s, f, p) => !f.encounter || (!nearRest(s, p.x) && p.x >= f.roam[0] && p.x <= f.roam[1]);
// Limit the next physics step instead of snapping sprites or moving an attack tell.
function containFoe(f, k) {
  if (!f.roam) return;
  const b = f.body, dt = Math.min(k, 2) / 60, vx = b.velocity.x;
  if (vx < 0 && b.left + vx * dt < f.roam[0]) f.setVelocityX(Math.max(vx, Math.min(Math.abs(vx), (f.roam[0] - b.left) / dt)));
  if (vx > 0 && b.right + vx * dt > f.roam[1]) f.setVelocityX(Math.min(vx, Math.max(-Math.abs(vx), (f.roam[1] - b.right) / dt)));
}
const ROUTE_CUES = {
  2: [[26,'<b>Scorpions ahead.</b> Bait the sting, step back, then strike.'],[53,'<b>A well ahead.</b> Refill your water before the next crossing.'],[65,'<b>Watch the sky.</b> A golden flash warns of a vulture dive. Keep a landing clear.'],[104,'<b>The second well.</b> Drink before entering the storm.']],
  3: [[19,'<b>Bats in the dark.</b> A golden flash warns of a dive. Swing as they swoop low.'],[39,'<b>A fire ahead.</b> Rest before riding into the broken ground.'],[56,'<b>Thorns below.</b> Take the high ledges; jump again in the air.'],[81,'<b>Light the fire.</b> A jackal and a bat guard the final crossing.'],[103,'<b>The last fire.</b> Gather strength. Rakhsh senses something ahead.']],
  4: [[25,'<b>A serpent waits.</b> Its raised head warns of a lunge. Step back, then strike.'],[45,'<b>The garden fire.</b> Rest before crossing the thorn beds.'],[66,'<b>Thorns and wings.</b> Watch the bat before committing to a jump.'],[91,'<b>Light the fire.</b> A serpent and a bat share the next clearing.'],[105,'<b>The final fire.</b> The feast waits beyond the quiet path.']],
  5: [[21,'<b>A fire on the rise.</b> Light it before entering the spear patrol.'],[32,'<b>Two different threats.</b> Draw the jackal away from the spearman, then punish a missed thrust.'],[50,'<b>Rest at the fire.</b> The high provisions offer another route.'],[67,'<b>A mixed patrol.</b> Keep moving between the jackal and the spear; leave space to retreat.'],[85,'<b>Across the thorns.</b> Two separate spear posts guard the last stretch.'],[105,'<b>The last fire.</b> Prepare to meet the warden.']],
  6: [[25,'<b>A Div warrior.</b> Bait the club, jump the blow, then strike its slow-turning back.'],[42,'<b>Light the fire.</b> A hopping Div and a warrior guard the camp entrance.'],[89,'<b>The gates are behind you.</b> Take the high crossing to the next fire.'],[109,'<b>One last guard.</b> Bait its club before reaching the final fire.'],[117,'<b>The last fire.</b> Gather strength before Arzhang.']],
  7: [[27,'<b>A mountain guard.</b> Give its club room, then strike from behind.'],[41,'<b>A sheltered fire.</b> Rest here; lightning avoids the sacred fires.'],[57,'<b>Broken mountain paths.</b> Fight on solid ground before taking the next jump.'],[89,'<b>The next fire is near.</b> Draw the blue Div away from the crossing.'],[114,'<b>The cave mouth.</b> Pass the guard before following the bat into the dark.'],[132,'<b>A final thorn crossing.</b> Land first, then face the last guard.'],[142,'<b>The final fire.</b> The White Div waits beyond the darkness.']]
};
function routeCue(s, p) {
  if (s.bossOn || s.horde || s.frozen || s.done || (cur === 2 && p.x >= 112 * TS)) return;
  const cues = ROUTE_CUES[cur]; if (!cues) return;
  let beat = -1; for (let i = 0; i < cues.length; i++) if (p.x >= cues[i][0] * TS) beat = i;
  if (beat > s.routeBeat) { s.routeBeat = beat; hint(cues[beat][1]); }
}

// Optional Simurgh trails: high routes with three sparks, a generous timer, and
// no penalty for failing. Main-story triggers never depend on these challenges.
const TRIALS = {
  1: { name: 'Reeds of Gold', at: 35, seconds: 16, points: [[38.5,10],[44.5,6.5],[58.5,10]] },
  2: { name: 'Above the Sands', at: 41, seconds: 18, points: [[44.5,9],[57.5,10],[69.5,10]] },
  3: { name: 'Rakhsh in the Night', at: 50, seconds: 20, points: [[58.5,10],[79.5,9],[95.5,8]] },
  4: { name: 'Lantern Dance', at: 40, seconds: 24, points: [[46.5,7],[72.5,8],[98.5,8]] },
  5: { name: 'Wind over the Marches', at: 56, seconds: 22, points: [[56.5,8],[84.5,8],[104.5,8]] },
  6: { name: 'Above the War Fires', at: 6, seconds: 20, points: [[9.5,8],[22.5,10],[39.5,8]] },
  7: { name: 'Light in the Cave', at: 105, seconds: 20, points: [[111.5,11],[128.5,10],[135.5,10]] }
};
const trialRecords = () => { try { const r = JSON.parse(store.get('sh-trials') || '{}'); return r && typeof r === 'object' && !Array.isArray(r) ? r : {}; } catch { return {}; } };

/* ----------------------------- foes ----------------------------- */
// walking foes turn at walls and at the edge of a drop or thorns
// another ground foe just ahead in this direction: they keep their distance rather than stand inside each other
// bosses stand only on solid ground: the jump-through ledges are Rostam's, so a boss never lands on one or catches on its edge
const onFloor = (b, t) => t.index % 4 !== 2;
const FOE_GAP = 8;
const groundFoe = f => f.active && f.body?.enable && f.body.allowGravity;
const foeBusy = f => f.staggerUntil > f.scene.time.now || f.smash || f.cast || f.sting || f.thrust || f.leap || f.js === 'crouch' || f.dw > 0 ||
  (f.anims.isPlaying && /strike|smash|thrust|sting|throw|leap/.test(f.anims.currentAnim?.key || ''));
const attackRole = f => ['bat', 'vulture', 'firediv'].includes(f.kind) ? 'ranged' : 'melee';
function reserveAttack(s, f) {
  const role = attackRole(f), nearby = s.foes.getChildren().filter(o => o !== f && o.active && o.body.enable && attackRole(o) === role && Math.abs(o.x - f.x) < 125);
  if (nearby.some(o => foeBusy(o) || ['warn', 'dive'].includes(o.state) || s.time.now - (o.attackAt ?? -Infinity) < 360)) return false;
  f.attackAt = s.time.now; f.attackId = (f.attackId || 0) + 1; return true;
}
function crowded(s, f, dir) {
  return s.foes.getChildren().some(o => {
    if (o === f || !groundFoe(o) || Math.abs(o.body.bottom - f.body.bottom) > 20) return false;
    const dx = o.body.center.x - f.body.center.x;
    const side = Math.sign(dx) || (o.spaceId > f.spaceId ? 1 : -1);
    return side === dir && Math.abs(dx) < (o.body.width + f.body.width) / 2 + FOE_GAP + 2;
  });
}
// the horde of Arzhang's camp: six small waves rather than three big ones. d blue Div, w Div warrior, f Fire Div, g Ghul
const HORDE = [['d', 'g'], ['w', 'f'], ['g', 'd', 'g'], ['w', 'f'], ['f', 'g', 'd'], ['w', 'f', 'g']];
// Test the destination's leading edge and support before moving a grounded body.
function foeStepFree(s, f, dx) {
  const b = f.body, x = dx > 0 ? b.right + dx : b.left + dx;
  if (x < 0 || x >= s.levelW || (f.roam && (x < f.roam[0] || x > f.roam[1]))) return false;
  for (const y of [b.top + 2, b.center.y, b.bottom - 2]) {
    if (s.layer.getTileAtWorldXY(x, y)?.collides) return false;
  }
  if (b.blocked.down) {
    const floor = s.layer.getTileAtWorldXY(x, b.bottom + 3);
    if (!floor?.collides || floor.index % 4 === 3) return false;
  }
  return true;
}
function slideFoe(s, f, dx) {
  let moved = 0;
  while (Math.abs(dx - moved) > 0.01) {
    const step = Math.sign(dx) * Math.min(1, Math.abs(dx - moved));
    if (!foeStepFree(s, f, step)) break;
    // Preserve the physics step's delta: postUpdate must not apply this correction twice.
    f.x += step; f.body.position.x += step; f.body.prev.x += step; f.body.prevFrame.x += step; f.body.updateCenter();
    moved += step;
  }
  return moved;
}
function yieldFoe(s, f, k) {
  if (!groundFoe(f) || !f.body.blocked.down || foeBusy(f)) { f.crowdWait = 0; f.yieldT = 0; return; }
  if (f.yieldT > 0) {
    f.yieldT -= k;
    if (foeStepFree(s, f, f.yieldDir * 2)) { f.setVelocityX(f.yieldDir * 32); f.setFlipX(f.yieldDir < 0); return; }
    f.yieldT = 0;
  }
  const dir = Math.sign(f.body.velocity.x);
  if (!dir || !crowded(s, f, dir)) { f.crowdWait = 0; return; }
  f.crowdWait = (f.crowdWait || 0) + k; f.setVelocityX(0);
  if (f.crowdWait > 18 && foeStepFree(s, f, -dir * 2)) {
    f.crowdWait = 0; f.yieldDir = -dir; f.yieldT = 24 + f.spaceId % 3 * 8;
    f.setVelocityX(-dir * 32); f.setFlipX(dir > 0);
  }
}
// Resolve full body overlap, including exact-center spawns and mixed-size packs.
// A committed attack or airborne leap keeps its path; a grounded neighbour yields.
function separate(s, k = 1) {
  const fs = s.foes.getChildren().filter(groundFoe), cap = 3 * Math.min(k, 2);
  for (let pass = 0; pass < 2; pass++) for (let i = 0; i < fs.length; i++) for (let j = i + 1; j < fs.length; j++) {
    const a = fs[i], b = fs[j], dx = b.body.center.x - a.body.center.x;
    const need = (a.body.width + b.body.width) / 2 + FOE_GAP;
    if (Math.abs(dx) >= need || Math.abs(a.body.bottom - b.body.bottom) > 20) continue;
    const dir = Math.sign(dx) || (b.spaceId > a.spaceId ? 1 : -1), overlap = need - Math.abs(dx);
    const canA = a.body.blocked.down && !foeBusy(a), canB = b.body.blocked.down && !foeBusy(b);
    const pushedA = canA ? Math.abs(slideFoe(s, a, -dir * Math.min(cap, overlap / 2))) : 0;
    const pushedB = canB ? Math.abs(slideFoe(s, b, dir * Math.min(cap * 2, overlap - pushedA))) : 0;
    if (canA && pushedB < overlap - pushedA) slideFoe(s, a, -dir * Math.min(cap, overlap - pushedA - pushedB));
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
function hopVelocity(f, vx, flight) {
  if (!f.roam) return vx;
  const half = f.body.width / 2 + 2;
  const target = Phaser.Math.Clamp(f.x + vx * flight, f.roam[0] + half, f.roam[1] - half);
  return Phaser.Math.Clamp((target - f.x) / flight, -Math.abs(vx), Math.abs(vx));
}
function patrol(s, f, speed) {
  const bound = f.roam && ((f.dir < 0 && f.body.left - speed / 30 <= f.roam[0]) || (f.dir > 0 && f.body.right + speed / 30 >= f.roam[1]));
  const ahead = s.layer.getTileAtWorldXY(f.x + f.dir * 12, f.body.bottom + 4);
  const wall = f.dir < 0 ? f.body.blocked.left : f.body.blocked.right;
  if (bound || wall || (f.body.blocked.down && (!ahead || ahead.index % 4 === 3))) f.dir *= -1;
  f.setVelocityX(f.dir * speed); f.setFlipX(f.dir < 0);
}
// The jackal hunts in the open. It closes to striking distance and keeps it, then stops, edges back and drops its head
// with a glint in its eyes before it lunges along a line it cannot change. After the lunge it stands panting, open to the
// mace. Out of reach it paces its ground as before.
function jackalHunt(s, f, k, p) {
  f.jt = (f.jt || 0) - k;
  if (f.js === 'lunge' && !f.leap) { f.js = 'recover'; f.jt = 40; }   // a heavy blow broke the lunge
  if (f.js !== 'crouch' && f.glint) { f.glint.destroy(); f.glint = null; f.setAngle(0); }
  if (f.js === 'crouch') {
    f.setVelocityX(foeStepFree(s, f, -f.dir * 2) ? -f.dir * 16 : 0);
    f.glint?.setPosition(f.x + f.dir * f.displayWidth * 0.3, f.body.top + 4);
    if (f.jt <= 0) {
      f.js = 'lunge'; f.jt = 40; f.leap = true; f.bit = false; f.setAngle(0); f.anims.resume(); f.anims.timeScale = 1.7;
      f.setVelocity(hopVelocity(f, f.dir * 215, 0.34), -150); s.fx('dust', f.x - f.dir * 10, f.body.bottom, { flip: f.dir < 0, depth: 6 });
    }
    return;
  }
  if (f.js === 'lunge') {
    if (f.jt < 30 && f.body.blocked.down) { f.leap = false; f.js = 'recover'; f.jt = 46; f.setVelocityX(0); f.anims.timeScale = 0.5; s.fx('dust', f.x, f.body.bottom, { depth: 6 }); }
    else if (f.jt < -40) { f.leap = false; f.js = 'recover'; f.jt = 30; }
    return;
  }
  if (f.js === 'recover') { f.setVelocityX(0); if (f.jt <= 0) { f.js = 'stalk'; f.anims.timeScale = 1; f.jt = 24 + Math.random() * 36; } return; }
  f.anims.timeScale = 1;
  if (!canHunt(s, f, p) || above(f, p) || !f.body.blocked.down) { if (f.body.blocked.down) pace(s, f, 55); return; }
  const dx = p.x - f.x, near = Math.abs(dx), level = Math.abs(p.body.bottom - f.body.bottom) < 24;
  f.dir = Math.sign(dx) || f.dir; f.setFlipX(f.dir < 0);
  if (level && near > 30 && near < 100 && f.jt <= 0 && reserveAttack(s, f)) {
    f.js = 'crouch'; f.jt = s.mounted ? 24 : cur === 1 ? 34 : 28;   // the first labour gives the longest look at the tell f.setVelocityX(0); f.anims.pause(); f.setFrame(0); f.setAngle(f.dir * 10);
    f.glint = s.add.image(f.x, f.body.top, 'glow').setTint(0xffcf6a).setScale(0.13).setBlendMode(Phaser.BlendModes.ADD).setDepth(f.depth + 0.1);
    s.tweens.add({ targets: f.glint, scale: 0.2, alpha: 0.5, yoyo: true, repeat: -1, duration: 90 });
    return;
  }
  // keep striking distance rather than running into the mace: close in from afar, give ground when crowded
  const want = near > 78 ? f.dir : near < 42 ? -f.dir : 0, v = want * (near > 140 ? 90 : 62);
  const free = v && foeStepFree(s, f, Math.sign(v) * 3) && !crowded(s, f, Math.sign(v));
  f.setVelocityX(free ? v : 0); f.anims.timeScale = free ? 1 : 0.35;
}
// A scorpion buried in the sand shows only a low mound and, now and then, a stir of grains. When Rostam comes near the
// mound shudders for half a second, then the scorpion bursts out beside him with its sting already raised. Under the
// sand it can neither hurt nor be hurt (the Simurgh's light still finds it).
function bury(s, f) {
  f.buried = true; f.setAlpha(0); f.harmless = () => f.buried; f.immune = () => f.buried; f.immuneMsg = 'It is under the sand. Wait for it to rise.';
  f.mound = s.add.ellipse(f.x, f.body.bottom - 1, 24, 7, 0xd9a35c, 0.9).setStrokeStyle(1, 0xf3cf8a, 0.8).setDepth(3);
  f.once('destroy', () => f.mound?.destroy()); f.mt = Math.random() * 60;
}
function buriedTick(s, f, k, p) {
  f.setVelocityX(0); f.mound?.setPosition(f.x, f.body.bottom - 1); f.mt -= k;
  if (f.mt <= 0 && !f.stir) { f.mt = 80 + Math.random() * 70; s.fx('dust', f.x, f.body.bottom, { depth: 3 }).setScale(0.45).setAlpha(0.7); }
  const near = canHunt(s, f, p) && Math.abs(p.x - f.x) < 72 && Math.abs(p.body.bottom - f.body.bottom) < 30;
  if (near && !f.stir) unearth(s, f, 30);
  if (f.stir && (f.stir -= k) <= 0) {
    f.buried = false; f.stir = 0; f.setAlpha(1); f.mound?.destroy(); f.mound = null; f.cool = 6; sfx('rock'); s.cam.shake(120, 0.004);
    s.fx('poof', f.x, f.body.bottom - 6, { depth: 8 }); s.fx('dust', f.x - 12, f.body.bottom, { depth: 8, flip: true }); s.fx('dust', f.x + 12, f.body.bottom, { depth: 8 });
    f.dir = Math.sign(p.x - f.x) || 1; f.setFlipX(f.dir < 0); f.setVelocityY(-150);
  }
}
function unearth(s, f, frames) {
  if (!f.buried || f.stir) return; f.stir = frames;
  s.tweens.add({ targets: f.mound, scaleX: 1.35, scaleY: 1.8, yoyo: true, repeat: 2, duration: 85 });
  s.fx('dust', f.x, f.body.bottom, { depth: 3 }).setScale(0.7);
}
const FOES = {
  jackal: { tex: 'jackal-run', hp: 1, init: (s, f) => { f.setVelocityX(-55); f.once('destroy', () => f.glint?.destroy()); f.harmless = () => f.js === 'recover' || (f.js === 'lunge' && f.bit); }, tick: (s, f, k, p) => jackalHunt(s, f, k, p) },
  div: {
    tex: 'div-hop', hp: 2,
    tick(s, f, k, p) {
      f.hopT -= k; if (!f.body.blocked.down) return;
      if (canHunt(s, f, p) && above(f, p)) { if (f.dw > 0) { f.dw = 0; f.setAngle(0); f.anims.resume(); } f.setVelocityX(0); if (f.hopT <= 0) { const post = postOf(s, f); f.dir = Math.abs(f.x - post) > TS ? Math.sign(post - f.x) : (Math.random() < 0.5 ? -1 : 1); f.setFlipX(f.dir < 0); f.setVelocity(hopVelocity(f, crowded(s, f, f.dir) ? 0 : f.dir * 50, 0.48), -200); f.hopT = 80 + Math.random() * 40; } return; }
      f.dir = Math.sign(p.x - f.x) || 1; f.setFlipX(f.dir < 0); f.setVelocityX(0);
      if (f.dw > 0) {                                                // the wind-up: it sinks on its haunches, then springs
        f.dw -= k; f.anims.pause(); f.setFrame(0); f.setAngle(Math.sin(s.time.now * 0.09) * 3);
        if (f.dw <= 0) { f.dw = 0; f.setAngle(0); f.anims.resume(); f.setVelocity(hopVelocity(f, crowded(s, f, f.dir) ? 0 : f.dir * 70, 0.55), -230); f.hopT = 70; s.fx('dust', f.x, f.body.bottom, { depth: 6 }); }
        return;
      }
      if (canHunt(s, f, p) && f.hopT <= 0 && Math.abs(p.x - f.x) < 200 && reserveAttack(s, f)) f.dw = 15;
    }
  },
  // scorpions creep, then scuttle at Rostam when he comes close on the same level, and lash out with the sting
  scorpion: {
    tex: 'scorpion-crawl', hp: 2,
    tick(s, f, k, p) {
      if (f.buried) { buriedTick(s, f, k, p); return; }
      f.cool = (f.cool || 0) - k;
      if (f.sting) { f.setVelocityX(0); return; }
      const dx = p.x - f.x;
      if (canHunt(s, f, p) && f.cool <= 0 && Math.abs(dx) < 46 && Math.abs(p.body.bottom - f.body.bottom) < 24 && f.body.blocked.down && reserveAttack(s, f)) {
        const attackId = f.attackId; f.sting = true; f.cool = 80; f.dir = Math.sign(dx) || 1; f.setFlipX(f.dir < 0); f.setVelocityX(0); f.anims.timeScale = 1; f.play('scorpion-sting');
        s.time.delayedCall(250, () => { if (f.active && f.body.enable && f.attackId === attackId) { s.hazard(f.dir > 0 ? f.body.right - 4 : f.body.left - 26, f.body.top - 14, 30, f.body.height + 14, 140); sfx('swing'); } });
        f.once('animationcomplete', () => { if (f.active) { f.sting = false; f.play('scorpion-crawl'); } });
        return;
      }
      const near  = canHunt(s, f, p) && Math.abs(p.x - f.x) < 130 && Math.abs(p.body.bottom - f.body.bottom) < 24;
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
      if (canHunt(s, f, p) && f.cool <= 0 && Math.abs(d) < 90 && Math.abs(p.body.bottom - f.body.bottom) < 30 && f.body.blocked.down && reserveAttack(s, f)) {
        const attackId = f.attackId; f.smash = true; f.setVelocityX(0); f.play('divwarrior-smash');
        s.time.delayedCall(420, () => { if (!f.active || !f.body.enable || f.attackId !== attackId) return; s.hazard(f.dir > 0 ? f.x + 8 : f.x - 48, f.body.top + 20, 40, 30, 160); s.fx('dust', f.x + f.dir * 30, f.body.bottom, { depth: 8 }); s.cam.shake(120, 0.006); sfx('hit'); });
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
      if (canHunt(s, f, p) && f.cool <= 0 && Math.abs(d) < 84 && Math.abs(p.body.bottom - f.body.bottom) < 24 && reserveAttack(s, f)) {
        const attackId = f.attackId; f.thrust = true; f.dir = Math.sign(d) || 1; f.setFlipX(f.dir < 0); f.setVelocityX(0); f.play('spearman-thrust'); sfx('swing');
        s.time.delayedCall(180, () => { if (f.active && f.body.enable && f.attackId === attackId) s.hazard(f.dir > 0 ? f.x + 6 : f.x - 50, f.body.top + 12, 44, 12, 160); });
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
      if (canHunt(s, f, p) && f.cool <= 0 && Math.abs(d) < 80 && Math.abs(p.body.bottom - f.body.bottom) < 30 && f.body.blocked.down && reserveAttack(s, f)) {
        // it rears back, then lunges with its jaws wide
        const attackId = f.attackId; const dir = Math.sign(d) || 1; f.cool = 100; f.setVelocityX(0); f.play('serpent-strike');
        s.time.delayedCall(230, () => { if (f.active && f.body.enable && f.attackId === attackId) { f.setVelocity(hopVelocity(f, dir * 190, 0.32), -110); sfx('swing');
          s.time.delayedCall(90, () => f.active && f.body.enable && f.attackId === attackId && s.hazard(dir > 0 ? f.body.right - 6 : f.body.left - 46, f.body.top - 10, 52, f.body.height + 14, 160)); } });   // the jaws snap shut a full lunge ahead
        f.once('animationcomplete', () => f.active && f.play('serpent'));
      } else if (f.body.blocked.down) f.setVelocityX(0);
    }
  },
  // Fire Divs keep a throwing distance, backing off when Rostam closes in, and lob fireballs at him in an arc
  firediv: {
    tex: 'firediv-walk', hp: 2,
    tick(s, f, k, p) {
      f.cool = (f.cool ?? 70) - k;
      if (f.cast) { f.setVelocityX(0); return; }
      if (above(f, p)) { pace(s, f, 30); return; }
      const d = p.x - f.x, ad = Math.abs(d), face = Math.sign(d) || f.dir;
      if (canHunt(s, f, p) && f.cool <= 0 && ad > 50 && ad < 270 && f.body.blocked.down && reserveAttack(s, f)) {
        const attackId = f.attackId; f.cast = true; f.dir = face; f.setFlipX(face < 0); f.setVelocityX(0); f.play('firediv-throw');
        s.time.delayedCall(330, () => {
          if (!f.active || !f.body.enable || f.attackId !== attackId) return; const t = 0.85, y0 = f.body.top + 8;
          const b = s.shoot(f.x + face * 14, y0, (p.x - f.x) / t, -(0.5 * 700 * t) + (p.body.center.y - y0) / t, 'fireball', { gravity: 700, life: 2200, spin: 6 }); s.light(b, 0.5, 0.2); sfx('fire');
        });
        f.once('animationcomplete', () => { if (!f.active) return; f.cast = false; f.cool = 120 + Math.random() * 50; f.play('firediv-walk'); });
        return;
      }
      if (ad > 115 && ad < 195) { f.setVelocityX(0); f.anims.pause(); }
      else { f.anims.resume(); f.dir = ad <= 115 ? -face : face; patrol(s, f, 40); }
      f.setFlipX(face < 0);
    }
  },
  // Ghuls scuttle on all fours and pounce when Rostam comes close
  ghul: {
    tex: 'ghul-crawl', hp: 2,
    tick(s, f, k, p) {
      f.cool = (f.cool ?? 40) - k;
      if (f.leap) { if (f.body.blocked.down && (f.leapT -= k) <= 0) { f.leap = false; f.cool = 80; f.play('ghul-crawl'); } return; }
      if (above(f, p)) { pace(s, f, 40); return; }
      const d = p.x - f.x, face = Math.sign(d) || f.dir;
      if (canHunt(s, f, p) && f.cool <= 0 && Math.abs(d) < 120 && Math.abs(p.body.bottom - f.body.bottom) < 30 && f.body.blocked.down && reserveAttack(s, f)) {
        f.leap = true; f.leapT = 12; f.dir = face; f.setFlipX(face < 0); f.play('ghul-leap'); f.setVelocity(hopVelocity(f, face * 200, 0.6), -250); sfx('swing');
        return;
      }
      if (Math.abs(d) < 240) f.dir = face;
      patrol(s, f, Math.abs(d) < 240 ? 72 : 36);
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
        const tx = f.roam ? Phaser.Math.Clamp(f.home.x + Math.sin(f.t) * range, f.roam[0] + f.body.width / 2 + 1, f.roam[1] - f.body.width / 2 - 1) : f.home.x + Math.sin(f.t) * range, ty = f.home.y + Math.sin(f.t * 2) * 10;
        f.setVelocity((tx - f.x) * 2.2, (ty - f.y) * 2.2); f.setFlipX(Math.cos(f.t) < 0);
        if (canHunt(s, f, p) && f.cool <= 0 && Math.abs(p.x - f.x) < 170 && p.y > f.y && reserveAttack(s, f)) {
          f.state = 'warn'; f.tm = 18; f.aim = { x: p.body.center.x, y: p.body.center.y };
          f.setVelocity(0); f.setTint(0xffd27a); f.anims.timeScale = 0.4;
        }
      } else if (f.state === 'warn') {
        f.setVelocity(0); if ((f.tm -= k) <= 0) { const a = Math.atan2(f.aim.y - f.body.center.y, f.aim.x - f.body.center.x); f.clearTint(); f.state = 'dive'; f.tm = 46; f.setVelocity(Math.cos(a) * dive, Math.sin(a) * dive); f.setFlipX(Math.cos(a) < 0); sfx('swing'); }
      } else if (f.state === 'dive') { if ((f.tm -= k) <= 0 || f.body.blocked.down) { f.state = 'rise'; f.anims.timeScale = 1.4; } }
      else { f.setVelocity((f.home.x - f.x) * 1.5, (f.home.y - f.y) * 1.8); if (Math.abs(f.y - f.home.y) < 8) { f.state = 'circle'; f.cool = rest + Math.random() * 80; f.anims.timeScale = 1; f.t = Math.asin(Phaser.Math.Clamp((f.x - f.home.x) / range, -1, 1)); } }
    }
  };
}

/* --------------------------- labours --------------------------- */
// Each labour: its map, its backdrop and how the backdrop scrolls, what 'c' becomes, extra map
// characters, and hooks that run on create and every frame. Shared systems live in the scene.
// Khan I: the fire in the middle of the reeds draws the lion's pack. Burning reeds close the clearing on both sides and
// three small waves come at Rostam: jackals, then a Div with them, then the pack's leader. J is that leader, larger and
// three blows to kill.
const SIEGE1 = [['j', 'j'], ['j', 'd', 'j'], ['d', 'J', 'j']];
function reedSiege(s) {
  const L = 48 * TS, R = 60 * TS;
  // the burning reeds hold Rostam and the pack inside by position, not by a physics wall he could climb by jumping into it
  const wall = (x, floor) => {
    // a tapering column of flame, each tongue on its own beat so the reeds seem to burn rather than stack
    const flames = [[0, 0, 1.5], [-5, 13, 1.3], [5, 24, 1.15], [-3, 36, 1], [3, 47, 0.85], [0, 57, 0.65]].map(([dx, up, sc], i) => {
      const f = s.fx('fire', x + dx, floor - up, { depth: 7 - i * 0.01 }).setScale(sc).setAlpha(0);
      f.anims.setProgress(Math.random()); f.anims.timeScale = 0.8 + Math.random() * 0.5;
      s.tweens.add({ targets: f, alpha: 1 - i * 0.08, delay: i * 60, duration: 220 }); return f;
    });
    const glow = s.add.image(x, floor - 40, 'glow').setScale(1.6, 2.6).setTint(0xff8a3a).setBlendMode(Phaser.BlendModes.ADD).setDepth(6).setAlpha(0.7);
    s.fx('dust', x, floor, { depth: 8 }); return { flames, glow };
  };
  s.siege = { wave: 0, live: [], L, R, next: s.time.now + 1300, walls: [wall(L, 12 * TS), wall(R, 14 * TS)] };
  sfx('fire'); sfx('roar'); s.cam.shake(300, 0.008);
  banner('آتشِ نیستان', 'Hold the fire');
  hint(`The pack closes on the fire! When a jackal <b>drops its head</b>, ${touch ? 'dodge' : keyHTML('dodge') + ' dodge'} or jump the lunge, then strike while it pants.`);
}
function reedSiegeTick(s) {
  const g = s.siege; if (!g) return;
  const b = s.player.body;
  if (b.left < g.L + 4) { b.x += g.L + 4 - b.left; if (b.velocity.x < 0) b.velocity.x = 0; }
  if (b.right > g.R - 4) { b.x -= b.right - (g.R - 4); if (b.velocity.x > 0) b.velocity.x = 0; }
  if (s.time.now < g.next) return;
  if (g.live.some(f => f.active && f.body.enable)) return;
  if (g.wave < SIEGE1.length) {
    const list = SIEGE1[g.wave++]; g.live = []; g.next = s.time.now + list.length * 380 + 900;
    toast(g.wave === SIEGE1.length ? 'The pack leader comes for the fire!' : `The pack comes: ${g.wave} of ${SIEGE1.length}`);
    list.forEach((k, i) => s.time.delayedCall(i * 380, () => {
      if (s.siege !== g || s.done) return;
      const side = i % 2 ? 1 : -1, edge = side < 0 ? g.L + 26 : g.R - 26;
      const x = Math.abs(s.player.x - edge) < 50 ? edge - side * 70 : edge, y = (s.groundAt(x) ?? 14) * TS;
      const mark = s.add.ellipse(x, y - 2, 30, 7, 0xffb84d, 0.45).setStrokeStyle(1, 0xffe7a2).setDepth(7);
      s.tweens.add({ targets: mark, alpha: 0.15, yoyo: true, repeat: 2, duration: 80 });
      s.time.delayedCall(480, () => {
        mark.destroy(); if (s.siege !== g || s.done) return;
        s.fx('dust', x, y, { depth: 8 }); s.fx('poof', x, y - 8, { depth: 9 });
        const f = s.spawnFoe(k === 'd' ? 'div' : 'jackal', x, y);
        if (k === 'J') { f.hp = 3; f.setScale(f.scaleX * 1.22); f.setTint(0xd9a46a); f.y = y - 1 - 0.47 * f.displayHeight; f.body.reset(x, f.y); f.leader = true; }
        f.roam = [g.L + 6, g.R - 6]; f.dir = -side; f.setFlipX(f.dir < 0); f.jt = 30 + i * 20; g.live.push(f);
      });
    }));
    return;
  }
  // the pack is broken: the burning reeds die down, and from the far reeds the lion answers
  s.siege = null; s.siegeDone = true;
  for (const w of g.walls) { w.flames.forEach((f, i) => s.tweens.add({ targets: f, alpha: 0, delay: i * 60, duration: 300, onComplete: () => f.destroy() })); s.tweens.add({ targets: w.glow, alpha: 0, duration: 500, onComplete: () => w.glow.destroy() }); }
  sfx('win'); s.gainFarr(30); banner('آتشِ نیستان', 'The fire holds'); hint(null);
  const a = s.altars.find(a => Math.abs(a.x / TS - 52.5) < 1), drop = s.pickup(a.x + 18, a.y - 8, 'food', 0, 'lamb');
  s.fx('pickup', drop.x, drop.y); toast('The pack scatters. Roast lamb lies by the fire.');
  s.time.delayedCall(1500, () => { if (s.done) return; sfx('roar'); s.cam.shake(700, 0.006); toast('Far off in the reeds, the lion answers.'); });
}
// Khan II: the sandstorm rolls loose rocks along the ground with the wind. A plume of dust at the edge of sight comes
// first, then the rock tumbles in, bouncing. Jump it, dodge through it, or smash it with the mace.
function stormRocks(s, k) {
  const p = s.player;
  s.rockT = (s.rockT ?? 80) - k;
  if (s.rockT <= 0 && s.stormOn > 0.45 && !s.prayed && !s.bossOn && !s.frozen && p.x < (s.ramAt?.x ?? Infinity) - 2 * TS) {
    s.rockT = 115 + Math.random() * 70;
    const x0 = s.cam.scrollX + W + 14, plume = s.fx('dust', x0 - 22, s.bossFloorAt(x0 - 22), { depth: 8, flip: true }); plume.setScale(1.5); sfx('rock');
    s.time.delayedCall(520, () => {
      if (s.done || s.prayed || s.bossOn) return;
      const r = s.add.image(x0, s.bossFloorAt(x0) - 10, 'boulder').setDepth(6).setScale(2).setTint(0xd8b48a);
      r.vx = -(185 + Math.random() * 55); r.t = 0; (s.rocks ||= []).push(r);
    });
  }
  const smash = r => { s.fx('dust', r.x, r.y + 6, { depth: 8 }); s.fx('hit', r.x, r.y, { depth: 9 }); sfx('rock'); r.destroy(); };
  s.rocks = (s.rocks || []).filter(r => {
    if (!r.active) return false;
    if (s.frozen) return true;
    r.t += k; r.x += r.vx * k / 60; r.angle -= 8 * k;
    const floor = s.bossFloorAt(r.x), hop = Math.abs(Math.sin(r.t * 0.085)); r.y = floor - 11 - hop * 20;
    if (hop < 0.12 && !r.landed) { r.landed = true; s.fx('dust', r.x + 6, floor, { depth: 7 }).setScale(0.8); } else if (hop > 0.3) r.landed = false;   // a puff each time it strikes the ground
    const box = new Phaser.Geom.Rectangle(r.x - 11, r.y - 11, 22, 22);
    if (s.atk > 3 && s.atk < 12 && Phaser.Geom.Intersects.RectangleToRectangle(s.strikeBox(), box)) { smash(r); s.combatWord('Smashed'); s.gainFarr(3); return false; }
    if (Phaser.Geom.Intersects.RectangleToRectangle(p.body, box)) { s.hurt(r.x); if (!(s.dodgeT > 0)) { smash(r); return false; } }
    if (r.x < s.cam.scrollX - 40 || s.prayed || s.bossOn) { r.destroy(); return false; }
    return true;
  });
}
const LEVELS = {
  1: {
    epithet: 'It hunts the reeds by night, and nothing that comes there leaves', hud: 'Khan I &middot; The Lion', winTitle: 'The lion is slain', name: 'The Lion of the Reeds', fa: 'شیرِ نیستان', tiles: 'tiles-1', map: buildMap,
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
      s.khan1Beat = 0;
      for (const f of s.foes.getChildren()) {
        const c = f.home.x / TS;
        f.roam = (c < 22 ? [11, 21] : c < 40 ? [29.5, 36.5] : c < 48 ? [42, 47.5] : f.kind === 'div' ? [70, 79] : [71, 81]).map(x => x * TS);
      }
      hint(`Night in the reeds. <b>Strike</b> with ${touch ? 'the mace button' : keyHTML('attack')}, or <b>jump onto a foe</b>.`);
    },
    kindled(s, a) { if (Math.abs(a.x / TS - 52.5) < 1 && !rush && s.player.x < 59 * TS) { reedSiege(s); return true; } },
    // the storm over each boss fight: veil and cloud colours, the sun or moon behind it, lightning colour and pace, and its weather
    sky: { veil: 0x3a0a06, cloud: 0xa8401c, glow: 0xff7a2a, sun: [0.76, 0.34], bolt: 0xffd0a0, every: [260, 420], edge: 0x6a1004, fx: 'dust', paint: 'bg/storm.png' },
    fires: [82], hearts: [85],                       // a last fire and a heart before the lion's den
    update(s, k, time, p) {
      if (s.bossOn) return;
      reedSiegeTick(s);
      if (p.x > 88 * TS) { s.startBoss(); return; }
      if (!p.body.blocked.down && s.airJumps === 0) s.didDouble = true;
      // a few words only where something new is asked of Rostam; the reeds and the fires speak for themselves
      const beat = p.x < 17 * TS ? 0 : p.x < 25 * TS ? 1 : p.x < 60 * TS ? 2 : 3;
      if (beat <= s.khan1Beat) return;
      s.khan1Beat = beat;
      if (beat === 1 && !s.didDouble) hint('<b>A gap ahead.</b> Jump, then <b>jump again in the air</b>.');
      else if (beat === 3) hint('<b>The rafts sink under you.</b> Keep moving, or take the high road over the reeds.');
      else hint(null);
    },
    win: 'With the lion of the reeds slain, Rostam takes up a feather of the Simurgh. Ahead lies the waterless desert of the second labour.',
    tips: ['A jackal drops its head before it lunges. Dodge or jump the lunge, then strike while it pants.', 'At half strength the lion meets Rakhsh. Lure the lion into his charge.', 'The lion\'s hide turns your blows. Leap its charge so it runs into the rocks, then strike while it is dazed and the stars circle its head.',
      'Land on a foe from above to strike it twice as hard.', 'Roast lamb restores a heart. Look for it on the high ledges.',
      'Light the fire altars: if Rostam falls, he returns to the last sacred fire.', 'The blue Divs hop toward you. Strike as they land.',
      'Every provision fills your golden Farr. When it is full, press F (or tap the Farr) to call on the Simurgh: her light strikes every foe on screen.',
      'Provisions are kept in your purse from labour to labour. Stand at a lit fire and press Down (or tap Offer) to trade them for lasting gifts.',
      'Gather eight provisions in one labour and Rakhsh is well fed: he gallops in to kick the boss once.']
  },
  2: {
    hud: 'Khan II &middot; The Desert', winTitle: 'Water in the wilderness', name: 'The Burning Desert', fa: 'بیابانِ بی‌آب', bossName: 'The Scorpion Queen', bossFa: 'ملکهٔ کژدم', tiles: 'tiles-2', map: map2,
    load(L, q) {
      L.image('tiles-2', 'assets/k2/tiles.png' + q); L.image('k2-far', 'assets/k2/far.png' + q); L.image('k2-oasis', 'assets/k2/oasis.png' + q);
      L.image('well', 'assets/k2/well.png' + q); L.image('bell', 'assets/k2/bell.png' + q);
      for (let i = 0; i < 4; i++) L.image('tower-' + i, `assets/k2/tower-${i}.png${q}`);
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
    epithet: 'She guards the only water in the waste, and nothing that drinks there lives',
    sky: { veil: 0x3a1806, cloud: 0xc07a34, glow: 0xffb040, sun: [0.74, 0.3], bolt: 0xffe0a0, every: [240, 380], edge: 0x5a2804, fx: 'dust', paint: 'k2/storm.png' },
    hearts: [110, 142],                              // one before the sandstorm, one where the storm parts
    parse(s, ch, x, y) {
      if (ch === 'w') s.pickup(x, y - 6, 'props', 0, 'skin');
      else if (ch === 's') s.spawnFoe('scorpion', x, y);
      else if (ch === 'a') bury(s, s.spawnFoe('scorpion', x, y));
      else if (ch === 'v') s.spawnFoe('vulture', x, y);
      else if (ch === 'O') { const a = s.add.image(x, y, 'well').setOrigin(0.5, 1).setDepth(2); a.onLight = () => s.drinkAt(a); s.altars.push(a); }
      else if (ch === 'R') s.ramAt = { x, y };
      else if (ch === 'S') {
        s.springAt = { x, y };
        s.pool = s.add.image(x + 26, y + 3, 'pool').setOrigin(0.5, 1).setDepth(3).setAlpha(0);   // dry until the ram's riddle is solved
      }
    },
    create(s) {
      s.water = 100; s.thirstT = 0; s.stormOn = 0; s.stormHinted = false; s.prayed = false;
      $('waterPill').classList.remove('hidden'); s.renderWater();
      // the ram's riddle: four towers of the elements, earth, water, fire and wind, each with a bell in its arch
      s.ramStand = 164.5 * TS;   // the ram watches from the back, by the dry rock
      s.layer.forEachTile(t => { if (t.y < 14 && PLINTHS.some(([a, b]) => t.x >= a && t.x <= b)) t.plinth = true; });
      s.stones = TOWER_AT.map((c, i) => {
        const x = c * TS + TS / 2, r = s.groundAt(x), tall = s.textures.exists('tower-' + i);
        const st = s.add.image(x, r * TS + 2, tall ? 'tower-' + i : 'stone-' + i).setOrigin(0.5, tall ? TOWER.foot[i] : 1).setDepth(2).setScale(tall ? TOWER.scale : 1);
        const top = st.y - st.displayHeight * st.originY, by = tall ? top + st.displayHeight * TOWER.bell[i] : top - 4;
        st.bell = s.add.image(x, by, 'bell').setOrigin(0.5, 0.06).setDepth(2.1).setScale(TOWER.bellScale);
        st.glow = s.add.image(x, by + 8, 'glow').setScale(1.2).setBlendMode(Phaser.BlendModes.ADD).setDepth(3).setAlpha(0);
        st.aura = s.add.image(x, st.y - st.displayHeight * 0.45, 'glow').setScale(1.4, 2.6).setBlendMode(Phaser.BlendModes.ADD).setDepth(1.9).setAlpha(0).setTint(ELEMENTS[i].tint);
        st.el = i; st.footY = r * TS; return st;
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
      if (s.stormOn > 0.3 && !s.prayed && !s.stormHinted) { s.stormHinted = true; hint('A <b>sandstorm</b>! The wind pushes you back, water drains twice as fast, and it rolls <b>rocks</b> at you: jump them or smash them.'); }
      stormRocks(s, k);
      // thirst: water drains in the heat, twice as fast in the storm
      if (!s.frozen && !s.prayed && !s.bossOn) s.water = Math.max(0, s.water - k * (0.045 + s.stormOn * 0.045) * (gentle() ? 0.6 : legend() ? 1.3 : 1));
      if (s.water <= 0) { s.thirstT += k; if (s.thirstT > 150) { s.thirstT = 0; s.hurt(p.x, true); toast('Rostam is dying of thirst. Find water!'); } }
      s.renderWater();
      if (!s.prayed && s.ramAt && p.x > s.ramAt.x) s.prayForWater();
      if (s.ram) s.ramGuide(k);
      if (s.ram && !s.puzzle && p.x > 143 * TS && s.ram.x >= s.ramStand - 10) s.startStones();
      if (s.springOpen && !s.drank && p.x > s.springAt.x - 6 && b.blocked.down) s.reachSpring();
    },
    win: 'Rostam drinks from the spring the ram revealed and gives thanks. Refreshed, he rides on toward the dragon of the third labour.',
    tips: ['Mounds in the sand hide scorpions. When one shudders, step back: it bursts out with its sting raised.', 'In the sandstorm, jump the rolling rocks or smash them with your mace.', 'Water drains in the heat. Water skins refill a little; the wells refill it all.', 'Vultures circle, then dive. Strike them as they swoop low.',
      'Scorpions take two blows, and lash out with their sting up close. Jump on them, or strike twice and step back.', 'In the sandstorm the wind pushes you back. Keep moving forward.', 'At the bell towers, watch the order the ram rings them, then stand at each tower and press Down (or tap Ring) in that order.', 'If your water runs dry you lose a heart every few seconds.']
  },
  3: {
    epithet: 'No lion or elephant dares cross the plain where it sleeps', hud: 'Khan III &middot; The Dragon', winTitle: 'The dragon is slain', name: 'The Dragon of the Night', fa: 'اژدها', bossName: 'The Dragon', tiles: 'tiles-3', map: map3, mounted: true,
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
    sky: { veil: 0x12062a, cloud: 0x5a3090, glow: 0x6aff9a, sun: [0.7, 0.22], bolt: 0xc8a0ff, every: [110, 200], edge: 0x20063a, fx: 'ash', paint: 'k3/storm.png' },
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
    sky: { veil: 0x1a0828, cloud: 0x6a3090, glow: 0x9aff60, sun: [0.66, 0.26], bolt: 0xa8ff90, every: [170, 290], edge: 0x1a3a08, fx: 'spores', paint: 'k4/storm.png' },
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
    epithet: 'Young lord of the green marches, and their sword', hud: 'Khan V &middot; Olad', winTitle: 'Olad yields', name: 'The Green Land', fa: 'اولاد', bossName: 'Olad, Warden of the Marches', bossFa: 'اولاد', tiles: 'tiles-5', map: map5,
    load(L, q) { L.image('tiles-5', 'assets/k5/tiles.png' + q); L.image('k5-far', 'assets/k5/far.png' + q); L.image('altar', 'assets/altar.png' + q); },
    backdrop(s) {
      s.add.image(0, 0, 'k5-far').setOrigin(0).setScrollFactor(0);
      s.fgReeds = s.add.tileSprite(0, 10, W, H, 'fg-reeds').setOrigin(0).setScrollFactor(0).setDepth(12).setTint(0x2a5a20).setAlpha(0.9);
    },
    scroll(s, sx) { s.fgReeds.tilePositionX = Math.round(sx * 1.25); },
    food: (c, r, n) => (c === 84 && r === 8) || (c === 104 && r === 9) ? 'lamb' : FOOD[1 + (n % 3)],
    parse(s, ch, x, y) { if (ch === 'q') s.spawnFoe('spearman', x, y); else if (ch === 'O') s.oladAt = { x, y }; },
    create(s) { toast('Morning in Mazandaran. The fields are green, and the warden Olad keeps watch with his men.'); hint('Spearmen have a long reach. <b>Close in right after they thrust</b>.'); },
    sky: { veil: 0x0e161e, cloud: 0x5a6a7c, glow: 0xffe0a0, sun: [0.8, 0.2], bolt: 0xe8f0ff, every: [130, 230], edge: 0x0a1018, fx: 'rain', dim: 0.4, paint: 'k5/storm.png' },
    fires: [107], hearts: [105],
    update(s, k, time, p) { if (!s.bossOn && p.x > 114 * TS) s.startOlad(); },
    win: 'Rostam lassos Olad and spares his life. Olad swears to guide him to the camp of Arzhang Div and to the White Div\'s cave, and he is promised the throne of Mazandaran.',
    tips: ['Olad\'s shield blocks blows from the front. Step back when he flashes, then strike while he glows. His back is always open.', 'In every boss fight, the boss bar flashes Strike now! when your blow will land.', 'Spearmen have a long reach. Close in after their thrust.',
      'Land on a foe from above to strike twice as hard.', 'Fire altars mark where you return if you fall.']
  },
  6: {
    epithet: 'Chieftain of the Div host, who breaks men with his axe', hud: 'Khan VI &middot; Arzhang Div', winTitle: 'Arzhang has fallen', name: 'The Camp of the Divs', fa: 'اَرژنگِ دیو', bossName: 'Arzhang Div', tiles: 'tiles-6', map: map6,
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
    sky: { veil: 0x2a0402, cloud: 0x9a200c, glow: 0xff3a0a, sun: [0.72, 0.28], bolt: 0xff7050, every: [140, 250], edge: 0x5a0402, fx: 'embers', paint: 'k6/storm.png' },
    fires: [118], hearts: [72, 90, 116],             // one on the arena's high platform, one past the gates, one at the last fire
    regrow: [72],                            // the platform hearts come back once Rostam has left the platform for 2 s
    resume(s) { if (s.start.x > s.hordeAt.x) s.hordeDone = true; },   // rising past the horde: it stays beaten
    update(s, k, time, p) {
      if (!s.hordeDone && !s.horde && p.x > s.hordeAt.x - 2 * TS) s.startHorde();
      if (s.horde) s.hordeTick();
      if (!s.bossOn && p.x > 124 * TS) s.startArzhang();
    },
    win: 'Rostam tears Arzhang from the field and the Div host scatters into the night. Now only the White Div remains, in his cave beyond the seven mountains.',
    tips: ['When Arzhang stamps and flushes red, he charges. Leap onto a platform; if he hits the wall, strike him while he is dazed.', 'Arzhang\'s red glow shows where his axe will strike: the floor, or the platforms. Be where it is not, then strike him while he rests.', 'When the drums sound, the gates shut. Jump twice to reach the high platforms; Divs cannot follow you up there.', 'A Div warrior turns slowly. Drop behind him and strike his back before he faces you.', 'Fire Divs lob fireballs from afar: close in right after a throw.', 'Ghuls pounce when you are close: jump the leap, then strike as they land.', 'A heart waits on the high platform of the horde\'s arena, and grows back.', 'Jump over the shockwaves from a Div warrior\'s club.',
      'Blue Divs hop at you; Div warriors take three blows.']
  },
  7: {
    epithet: 'Master of Mazandaran, who blinded a king and all his army', hud: 'Khan VII &middot; The White Div', winTitle: 'The Seven Labours are done', name: 'The White Div', fa: 'دیوِ سپید', tiles: 'tiles-7', map: map7,
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
      else if (ch === 'k') { const k = s.kavus = s.add.sprite(x, y + 1, 'kavus-sight', 0).setOrigin(0.5, 0.955).setScale(0.5).setDepth(3); if (s.textures.exists('cage')) s.cage = s.add.image(x, y + 1, 'cage').setOrigin(0.5, 1).setDepth(3.5); s.add.image(x, y - 26, 'glow').setScale(0.6).setTint(0x8ab0ff).setBlendMode(Phaser.BlendModes.ADD).setDepth(2); }
    },
    create(s) {
      s.darkness(0.15, 0x060a18); for (const a of s.altars) s.light(a, 0.7); s.light(s.kavus, 0.8);
      s.boltT = 120; toast('Beyond the seven mountains the White Div waits in his cave. A storm breaks over the peaks.');
      hint('Lightning strikes <b>where the ground glows</b>: keep moving.');
    },
    sky: { veil: 0x061428, cloud: 0x6a9ad8, glow: 0x8ad8ff, sun: [0.7, 0.26], bolt: 0xa8ecff, every: [150, 280], edge: 0x08204a, fx: 'blizzard', cave: true, paint: 'k7/storm.png' },   // his arena is deep in the cave: no open sky
    fires: [119], hearts: [100, 140],                              // one after the lightning, one at the cave's last fire
    update(s, k, time, p) {
      // lightning on the mountain path: a glow marks the ground, then the bolt falls
      if (p.x < (CAVE7 - 4) * TS && !s.frozen) {
        s.boltT -= k;
        if (s.boltT <= 0) { s.boltT = 110 + Math.random() * 70; const x = p.x + Phaser.Math.Between(-60, 140); if (!nearRest(s, p.x) && !nearRest(s, x)) s.lightning(x); }
      }
      if (!s.bossOn && p.x > 148 * TS) s.startWhiteDiv();
      if (s.whiteDown && !s.ended && p.x > s.kavus.x - 46 && p.body.blocked.down) s.freeKing();
    },
    win: 'The blood of the White Div\'s heart restores the sight of Kay Kavus and all his warriors. The king is free, and Rostam, son of Zal, has completed the Seven Labours.',
    tips: ['Lightning strikes where the ground glows. Keep moving.', 'When the floor glows blue, the White Div is about to slam: jump onto the ice ledge in the corner.', 'After his slam his club is stuck in the ice. Drop down and strike him then.', 'Stay on the ledge too long and he roars: where a light shines on the ice, an icicle falls a second later. Move!', 'When a great Div stamps and flushes red, he charges along the red streak. Leap onto a ledge; if he hits the wall, strike him while he is dazed.',
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
  layer('knife', 22, 7, x => {
    x.fillStyle = '#d8dce0'; x.fillRect(7, 2, 11, 3); x.fillRect(18, 3, 4, 1);
    x.fillStyle = '#ffffff'; x.fillRect(8, 2, 10, 1); x.fillStyle = '#70482d'; x.fillRect(0, 2, 6, 3);
    x.fillStyle = '#d4ad58'; x.fillRect(6, 0, 2, 7);
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
  layer('fireball', 12, 12, x => {                         // a Fire Div's ball of flame
    const g = x.createRadialGradient(6, 6, 0, 6, 6, 6); g.addColorStop(0, '#fff6c0'); g.addColorStop(0.35, '#ffb030'); g.addColorStop(0.75, '#e0401a'); g.addColorStop(1, 'rgba(120,20,0,0)');
    x.fillStyle = g; x.fillRect(0, 0, 12, 12);
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
  // the boss storm: a rolling bank of cloud (white, tinted per labour), a sunburst of rays, a rain streak, a white vignette to tint
  layer('stormcloud', 512, 150, (x, w) => {
    const puff = (px, py, r, col) => wrap(w, o => { x.fillStyle = col; x.beginPath(); x.arc(px + o, py, r, 0, 7); x.fill(); });
    x.filter = 'blur(5px)';                                 // soft billows, not discs (ignored where canvas filters are missing)
    for (let i = 0; i < 160; i++) puff(hash(i) * w, 22 + hash(i + 170) * 70, 12 + hash(i + 340) * 24, `rgba(120,120,128,${0.14 + hash(i + 510) * 0.16})`);
    for (let i = 0; i < 46; i++) puff(hash(i + 300) * w, 18 + hash(i + 370) * 58, 6 + hash(i + 440) * 14, 'rgba(255,255,255,0.22)');   // lit crowns of the billows
    x.filter = 'none'; x.globalCompositeOperation = 'destination-in';
    const g = x.createLinearGradient(0, 0, 0, 150); g.addColorStop(0, 'rgba(0,0,0,1)'); g.addColorStop(0.6, 'rgba(0,0,0,0.9)'); g.addColorStop(1, 'rgba(0,0,0,0)');
    x.fillStyle = g; x.fillRect(0, 0, w, 150); x.globalCompositeOperation = 'source-over';
  });
  layer('rays', 256, 256, x => {
    x.fillStyle = 'rgba(255,255,255,0.55)';
    for (let i = 0; i < 18; i++) { const a = i / 18 * Math.PI * 2, d = 0.05 + hash(i + 900) * 0.07; x.beginPath(); x.moveTo(128, 128); x.lineTo(128 + Math.cos(a - d) * 140, 128 + Math.sin(a - d) * 140); x.lineTo(128 + Math.cos(a + d) * 140, 128 + Math.sin(a + d) * 140); x.closePath(); x.fill(); }
    x.globalCompositeOperation = 'destination-in';
    const g = x.createRadialGradient(128, 128, 8, 128, 128, 128); g.addColorStop(0, 'rgba(0,0,0,1)'); g.addColorStop(1, 'rgba(0,0,0,0)');
    x.fillStyle = g; x.fillRect(0, 0, 256, 256); x.globalCompositeOperation = 'source-over';
  });
  layer('stormveil', W, H, x => {                         // the storm sky: deep at the zenith, thinning toward the horizon
    const g = x.createLinearGradient(0, 0, 0, H); g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(0.55, 'rgba(255,255,255,0.6)'); g.addColorStop(1, 'rgba(255,255,255,0.25)');
    x.fillStyle = g; x.fillRect(0, 0, W, H);
  });
  layer('horizon', W, H, x => {                           // a burning band low in the sky, under the clouds
    const g = x.createLinearGradient(0, 0, 0, H); g.addColorStop(0.3, 'rgba(255,255,255,0)'); g.addColorStop(0.66, 'rgba(255,255,255,1)'); g.addColorStop(0.9, 'rgba(255,255,255,0)');
    x.fillStyle = g; x.fillRect(0, 0, W, H);
  });
  layer('streak', 1, 7, x => { x.fillStyle = 'rgba(220,232,255,0.9)'; x.fillRect(0, 0, 1, 7); });
  layer('vignette-white', W, H, x => {
    const g = x.createRadialGradient(W / 2, H * 0.5, H * 0.3, W / 2, H * 0.5, W * 0.6);
    g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(1, 'rgba(255,255,255,0.75)'); x.fillStyle = g; x.fillRect(0, 0, W, H);
  });
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
const A = { ctx: null, master: null, muted: store.get('sh-muted') === '1', bufs: {}, tracks: {}, cur: null, want: false, failed: false, background: document.hidden || !document.hasFocus() };
function audio() {
  if (!A.ctx) {
    const C = window.AudioContext || window.webkitAudioContext; if (!C) return null;
    const c = A.ctx = new C();
    const comp = c.createDynamicsCompressor(); comp.threshold.value = -16; comp.ratio.value = 3; comp.connect(c.destination);
    A.master = c.createGain(); A.master.gain.value = A.muted || A.background ? 0 : 0.8; A.master.connect(comp);
    A.verb = c.createConvolver(); A.verb.buffer = hall(c, 2.8); const wet = c.createGain(); wet.gain.value = 0.42; A.verb.connect(wet).connect(A.master);
    A.music = c.createGain(); A.music.gain.value = 0.7; A.music.connect(A.master);
    A.fx = c.createGain(); A.fx.gain.value = 0.85; A.fx.connect(A.master); setTimeout(applySettings);
    setInterval(pickTrack, 300);
    loadSamples();
    const fs = c.createGain(); fs.gain.value = 0.2; A.fx.connect(fs).connect(A.verb);
    A.noise = c.createBuffer(1, c.sampleRate, c.sampleRate); const nd = A.noise.getChannelData(0); for (let i = 0; i < nd.length; i++) nd[i] = Math.random() * 2 - 1;
  }
  if (A.ctx.state === 'suspended' && !A.muted && !A.background && !A.failed) A.ctx.resume().catch(() => {}); return A.ctx;
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
  if (A.muted || A.background || A.failed) return setTrack(null);
  if (!A.want) return setTrack('menu');
  const sc = game?.scene.getScene('play'), boss = sc && sc.bossOn && !sc.done && sc.boss?.active && sc.boss.hp > 0;
  setTrack(boss ? 'boss' : DARK.has(cur) ? 'dark' : 'road');
}
const music = on => { A.want = on; if (audio()) { if (on && !A.muted) track('boss'); pickTrack(); } };   // the battle theme loads early, ready for the boss
// recorded effects (Pixabay, free to use, no credit needed), trimmed and levelled; [file, volume]
const SAMPLE = { swing: ['swing', 0.32], hit: ['hit', 0.4], hurt: ['hurt', 0.45], jump: ['jump', 0.22], coin: ['pickup', 0.32],
  fire: ['fire', 0.4], roar: ['roar', 0.45], neigh: ['neigh', 0.45], win: ['win', 0.5], drum: ['drum', 0.3],
  thunder: ['thunder', 0.55], rock: ['rock', 0.45], clang: ['clang', 0.32], shatter: ['shatter', 0.4] };   // CC0 effects from OpenGameArt's '100 CC0 SFX #2'
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
// a struck bronze bell: a stack of inharmonic partials, each fading at its own pace, with a bright strike on top
function bell(f) {
  if (!A.ctx || A.muted) return; const t = A.ctx.currentTime;
  for (const [m, v, d] of [[0.5, 0.05, 3.2], [1, 0.1, 2.6], [1.19, 0.05, 1.8], [1.56, 0.04, 1.4], [2, 0.05, 1.6], [2.74, 0.025, 0.9], [3.76, 0.015, 0.6]]) {
    const o = A.ctx.createOscillator(), g = A.ctx.createGain(); o.type = 'sine'; o.frequency.value = f * m;
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(v, t + 0.005); g.gain.exponentialRampToValueAtTime(0.0001, t + d);
    o.connect(g).connect(A.fx); o.start(t); o.stop(t + d + 0.05);
  }
}
// thunder: a sharp crack, then a long low roll that dies away; louder the nearer the strike
function thunder(near = 0.5) {
  if (!A.ctx || A.muted) return; const t = A.ctx.currentTime;
  if (A.samples?.thunder) { const [, v] = SAMPLE.thunder; SAMPLE.thunder[1] = v * (0.5 + near); A.last.thunder = 0; sample('thunder'); SAMPLE.thunder[1] = v; return; }   // a recorded thunderclap
  noise(t, 0.16, { type: 'highpass', f: 1800, q: 0.7, vol: 0.06 * near });
  noise(t + 0.04, 2.6, { type: 'lowpass', f: 480, to: 80, q: 0.8, vol: 0.2 * (0.5 + near) });
  noise(t + 0.45, 1.9, { type: 'lowpass', f: 220, to: 55, q: 1, vol: 0.13 });
}
// the Simurgh's cry: a high, rising call that falls away, with the rush of her wings under it
function cry() {
  if (!A.ctx || A.muted) return; const t = A.ctx.currentTime;
  tone(1180, 0.5, { type: 'sine', vol: 0.05, to: 1580, t }); tone(1585, 0.9, { type: 'sine', vol: 0.04, to: 960, t: t + 0.38 });
  tone(790, 1.1, { type: 'triangle', vol: 0.02, to: 640, t: t + 0.4 }); noise(t, 1.4, { type: 'bandpass', f: 900, to: 300, q: 0.6, vol: 0.05 });
}
function setMuted(m) {
  A.muted = m; store.set('sh-muted', m ? '1' : '0'); if (A.master) A.master.gain.value = m || A.background ? 0 : 0.8; if (m) hush(true);
  if (typeof storyReading !== 'undefined') refreshStoryListen();
  $('muteIco').setAttribute('d', m ? 'M4 9v6h4l5 4V5L8 9z M17 9l5 6 M22 9l-5 6' : 'M4 9v6h4l5 4V5L8 9z M16 9a4 4 0 0 1 0 6 M19 6a8 8 0 0 1 0 12');
  if ($('journeySound')) { $('journeySound').textContent = m ? 'Sound off' : 'Sound on'; $('journeySound').setAttribute('aria-pressed', String(!m)); }
  music(!m && game && game.scene.isActive('play') && playing);
}

/* ---------------------------- input ---------------------------- */
const keys = { left: false, right: false, jump: false, attack: false, dodge: false, farr: false, offer: false }, pressed = { jump: false, attack: false, dodge: false, farr: false, offer: false };
// settings, kept in the browser: volumes, screen shake, flashes, and the keys for each action (two per action)
const KEY_DEF = { left: ['ArrowLeft', 'a'], right: ['ArrowRight', 'd'], jump: ['ArrowUp', ' '], attack: ['x', 'j'], dodge: ['Shift', 'c'], farr: ['f', ''], offer: ['ArrowDown', 's'] };
const ACTIONS = [['left', 'Move left'], ['right', 'Move right'], ['jump', 'Jump (twice for a super jump)'], ['attack', 'Strike (hold for a heavy blow)'], ['dodge', 'Dodge roll'], ['farr', 'Call the Simurgh (Farr)'], ['offer', 'Offer at a fire']];
const SET = (() => { let s = {}; try { s = JSON.parse(store.get('sh-set') || '{}'); } catch (e) {} return { music: 70, fx: 85, shake: true, flash: true, ...s, voice: s.voice > 0 ? s.voice : 90, narrator: typeof s.narrator === 'boolean' ? s.narrator : s.voice !== 0, keys: JSON.parse(JSON.stringify({ ...KEY_DEF, ...(s.keys || {}) })) }; })();
const saveSet = () => store.set('sh-set', JSON.stringify(SET));
const keyName = k => ({ ' ': 'Space', ArrowLeft: '\u2190', ArrowRight: '\u2192', ArrowUp: '\u2191', ArrowDown: '\u2193', Shift: 'Shift', Control: 'Ctrl', Enter: 'Enter' })[k] || (k.length === 1 ? k.toUpperCase() : k);
const keyLabel = action => SET.keys[action].filter(Boolean).map(keyName).join(' / ') || 'Unbound';
const escapeHTML = text => String(text).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const controlText = text => String(text).replace(/\bpress (Down|F|X)\b/gi, (_, key) => 'press ' + keyLabel({ down: 'offer', f: 'farr', x: 'attack' }[key.toLowerCase()]));
const keyHTML = action => `<kbd data-action-key="${action}">${escapeHTML(keyLabel(action))}</kbd>`;
function refreshControlLabels(root = document) {
  root.querySelectorAll('[data-action-key]').forEach(el => { el.textContent = keyLabel(el.dataset.actionKey); });
  if (root === document) document.querySelectorAll('template').forEach(t => refreshControlLabels(t.content));
}
let KEYMAP = {};
function buildKeys() { KEYMAP = {}; for (const [a, ks] of Object.entries(SET.keys)) for (const k of ks) if (k) KEYMAP[k.length === 1 ? k.toLowerCase() : k] = a; refreshControlLabels(); }
buildKeys();
const keyOf = e => e.key.length === 1 ? e.key.toLowerCase() : e.key;
const clearInput = () => { for (const k in keys) keys[k] = false; for (const k in pressed) pressed[k] = false; const sc = typeof game !== 'undefined' && game?.scene?.getScene('play'); if (sc) { sc.buf = sc.attackBuf = sc.dodgeBuf = sc.chargeT = 0; sc.chargeFull = false; sc.chargeGlow?.destroy(); sc.chargeGlow = null; if (sc.pose === 'rostam-heavy' && !sc.heavyGo) sc.pose = null; } };
const gameplayInput = () => playing && !paused && !cine && !document.querySelector('.ov:not(.hidden)');
const press = (k, down) => { if (down && !gameplayInput()) return; if (down && !keys[k] && k in pressed) pressed[k] = true; keys[k] = down; };
addEventListener('keydown', e => {
  if (rebind) { e.preventDefault(); finishRebind(e.key === 'Escape' ? null : e.key); return; }
  if (e.key === 'm' || e.key === 'M') { e.preventDefault(); setMuted(!A.muted); return; }
  if (cine) {
    if (e.key === 'Tab') {
      const controls = [...$('s-cine').querySelectorAll('button:not(:disabled)')].filter(el => el.offsetParent);
      const i = controls.indexOf(document.activeElement), next = e.shiftKey ? i - 1 : i + 1;
      if (i < 0 || next < 0 || next >= controls.length) { e.preventDefault(); controls[e.shiftKey ? controls.length - 1 : 0]?.focus(); }
    } else if (e.key === 'Escape') { e.preventDefault(); cineEnd(); }
    else if ([' ', 'Enter'].includes(e.key) && e.target.closest?.('button')) { /* Native button activation respects Skip. */ }
    else if ([' ', 'Enter', 'ArrowRight', 'x', 'X'].includes(e.key)) { e.preventDefault(); cineNext(); }
    return;
  }
  if (!$('s-set').classList.contains('hidden')) { if (e.key === 'Escape') closeSettings(); return; }
  if (!$('s-clips').classList.contains('hidden')) { if (e.key === 'Escape') closeClips(); return; }
  if (!$('s-map').classList.contains('hidden')) { if (e.key === 'Escape') { const options = $('s-map').querySelector('details[open]'); if (options) options.open = false; else if (mapFrom) closeMap(); } return; }
  if (!$('s-help').classList.contains('hidden')) { if (e.key === 'Escape') closeHelp(); return; }
  if (!$('s-temple').classList.contains('hidden')) { if (e.key === 'Escape' || e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') closeTemple(); return; }
  if (!$('s-guide').classList.contains('hidden')) {             // the Book of Foes: page through it
    if (e.key === 'ArrowRight') showGuide(gpg + 1); else if (e.key === 'ArrowLeft') showGuide(gpg - 1); else if (e.key === 'Escape') closeGuide();
    return;
  }
  if (!$('s-story').classList.contains('hidden')) {             // the tale is open: page through it
    if (e.key === 'ArrowRight') turn(1); else if (e.key === 'ArrowLeft') turn(-1); else if (e.key === 'Escape') closeStory();
    return;
  }
  if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', ' '].includes(e.key) && !e.target.closest?.('button, summary, a, input, select, textarea, #mapScroll')) e.preventDefault();
  if (e.key === 'Escape' || e.key === 'p' || e.key === 'P') { if (playing || paused) setPaused(!paused); return; }
  if (!gameplayInput() && (paused || document.querySelector('.ov:not(.hidden)'))) return;
  if (e.key === 'Enter' && !playing && !paused && e.target.tagName !== 'BUTTON') return begin();
  const k = KEYMAP[keyOf(e)]; if (k) press(k, true);
});
addEventListener('keyup', e => { const k = KEYMAP[keyOf(e)]; if (k) press(k, false); });
document.querySelectorAll('.tb').forEach(b => {
  const k = b.dataset.k;
  b.addEventListener('pointerdown', e => { e.preventDefault(); if (!gameplayInput()) return; audio(); b.setPointerCapture?.(e.pointerId); b.classList.add('on'); press(k, true); });
  const off = e => { e.preventDefault(); b.classList.remove('on'); press(k, false); };
  ['pointerup', 'pointercancel', 'lostpointercapture'].forEach(ev => b.addEventListener(ev, off));
});
addEventListener('blur', clearInput);

/* ---------------------------- scene ---------------------------- */
let game = null, playing = false;
const touch = matchMedia('(pointer:coarse)').matches || 'ontouchstart' in window;

class Play extends Phaser.Scene {
  constructor() { super('play'); }
  essentialLoadError(file) { if (file.key === this.lv?.tiles) window.showGameLoadError?.(); }
  preload() {
    const L = this.load, q = '?v=' + V;
    L.off('loaderror', this.essentialLoadError, this);
    L.on('loaderror', this.essentialLoadError, this);
    for (const [k, f] of Object.entries(ART)) if (f) L.image(k, 'assets/' + f + q);
    for (const [k, f] of Object.entries(FX)) L.spritesheet('fx-' + k, `assets/fx/${k}.png${q}`, { frameWidth: f.w, frameHeight: f.h });
    L.spritesheet('food', 'assets/food.png' + q, { frameWidth: 27, frameHeight: 27 });
    L.spritesheet('props', 'assets/k2/props.png' + q, { frameWidth: 27, frameHeight: 27 });
    L.image('heart-pick', 'assets/ui/heart.png' + q);
    this.lv = LEVELS[cur]; this.lv.load(L, q);
    if (this.lv.sky?.paint) L.image('storm-' + cur, 'assets/' + this.lv.sky.paint + q);
    L.image('decor-' + cur, `assets/decor/${cur}.png${q}`);
    if (cur === 7) L.image('cage', `assets/k7/cage.png${q}`);   // Kay Kavus's cage, which Rostam breaks open                       // the labour's ground litter, 32 px frames in a row   // the arena repainted for the boss fight
  }
  create() {
    // the scene object is reused from labour to labour: forget whatever the last one left behind
    for (const k of ['dark', 'lights', 'lamp', 'wall', 'wallR', 'stars', 'pose', 'swingFx', 'witch', 'unmasked', 'olad', 'rakhsh', 'dragonSeen', 'horde', 'hordeDone',
      'gates', 'hordeBat', 'toldRock', 'toldFarr', 'toldOffer', 'atAltar', 'bossT', 'maceHit', 'toldIce', 'chargeWarn', 'toldCharge', 'shards', 'shardG', 'mark', 'markGlow', 'markOpen', 'bossHeart', 'bossHeartT', 'floorWarn', 'highWarn', 'regrow', 'drums', 'sky', 'flashA', 'intro', 'fgReeds', 'mound', 'swirl', 'qx', 'puddles', 'combo', 'comboT', 'heavy', 'heavyGo', 'chargeT', 'chargeFull', 'chargeGlow', 'dodgeT', 'dodgeCd', 'dodgeDir', 'whiteDown', 'ended', 'mounted', 'prayed', 'drank', 'toldImmune', 'toldDeflect', 'toldVenom', 'cage', 'kavus', 'stones', 'puzzle', 'springOpen', 'pool', 'victory', 'attackBuf', 'dodgeBuf', 'counterT', 'counterStrike', 'dodgeRewarded', 'trial', 'nearTrial', 'journey', 'siege', 'siegeDone', 'ally', 'phase2', 'streak', 'didDouble', 'rocks', 'rockT']) delete this[k];
    // turn loaded strips into square frames; anything missing falls back to placeholder art
    for (const k of ['decor-' + cur]) if (this.textures.exists(k) && this.textures.get(k).frameTotal < 3) { const t = this.textures.get(k), h = t.getSourceImage().height; for (let i = 0; i < Math.round(t.getSourceImage().width / h); i++) t.add(i, 0, i * h, 0, h, h); }
    for (const [k, f] of Object.entries(ART)) if (f && this.textures.exists(k)) {
      const t = this.textures.get(k), img = t.getSourceImage(), fh = img.height, n = Math.max(1, Math.round(img.width / fh));
      for (let i = 0; i < n; i++) t.add(i, 0, i * fh, 0, fh, fh);
    }
    makeTextures(this);
    for (const k of Object.keys(FPS)) {
      const t = this.textures.get(k), n = t.frameTotal - 1;
      if (!this.anims.exists(k)) this.anims.create({ key: k, frames: this.anims.generateFrameNumbers(k, { start: 0, end: Math.max(0, n - 1) }), frameRate: FPS[k], repeat: /attack|hurt|roar|jump|thrust|slash|kneel|smash|throw|fire|rear|sight|strike|sting|die|leap|heavy|dodge|fall|victory|anoint/.test(k) ? 0 : -1 });
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
    // the ground darkens with depth below its surface, each tile a shade apart, so the earth has body rather than a pattern
    const rnd = (a, b) => { const v = Math.sin(a * 127.1 + b * 311.7) * 43758.5453; return v - Math.floor(v); };
    this.layer.forEachTile(t => {
      if (t.index < 0 || t.index % 4 > 1) return;
      let d = 0; for (let r = t.y - 1; r >= 0 && map[r][t.x] === '#'; r--) d++;
      const v = Math.max(0.5, 1 - d * 0.085) * (0.93 + rnd(t.x, t.y) * 0.07), c = Math.round(255 * v);
      t.tint = (c << 16) | (c << 8) | Math.min(255, Math.round(c * 1.04));
    });
    // and its surface is dressed: grasses, stones and the rest of the labour's own litter, a few in front of Rostam's feet
    if (this.textures.exists('decor-' + cur)) {
      const dt = this.textures.get('decor-' + cur), n = dt.frameTotal - 1;
      for (let c = 0; c < map[0].length; c++) for (let r = 1; r < map.length; r++) {
        if (map[r][c] !== '#' || map[r - 1][c] !== '.' || rnd(c, r) > 0.5 || (cur === 2 && r < 14 && PLINTHS.some(([a, b]) => c >= a && c <= b))) continue;
        const front = rnd(c + 7, r) < 0.18, d = this.add.image(c * TS + 8 + (rnd(c, r + 3) - 0.5) * 8, r * TS + 1, 'decor-' + cur, Math.floor(rnd(c + 3, r) * n))
          .setOrigin(0.5, 1).setScale(front ? 0.8 : 0.66 + rnd(c, r + 5) * 0.16).setDepth(front ? 6 : 1).setFlipX(rnd(c, r + 9) < 0.5);
        if (front) d.setAlpha(0.95);
      }
      // the foreground: large dark shapes of the same litter slide past at the bottom of the view, nearer than the road
      if (!this.fgReeds) for (let x = 60; x < this.levelW * 1.3 + W; x += 120 + rnd(x, 1) * 140) {
        const f = this.add.image(x, H + 26, 'decor-' + cur, Math.floor(rnd(x, 2) * n)).setOrigin(0.5, 1).setScale(1.6 + rnd(x, 3) * 0.6)
          .setScrollFactor(1.3, 1).setDepth(12).setTint(0x07060c).setAlpha(0.92).setFlipX(rnd(x, 4) < 0.5);
      }
    }
    this.physics.world.setBounds(0, 0, this.levelW, ROWS * TS + 200);
    this.physics.world.checkCollision.down = false;

    this.coins = this.physics.add.staticGroup(); this.wisps = [];
    this.foes = this.physics.add.group();
    this.altars = [];
    // three Simurgh feathers hide in each labour: the highest provision in each third of the road becomes a feather
    const spots = []; map.forEach((row, r) => row.forEach((ch, c) => { if (ch === 'c' && lv.food(c, r, 0) !== 'lamb') spots.push([c, r]); }));
    this.featherAt = new Map(); const third = map[0].length / 3;
    const ledges = []; map.forEach((row, r) => row.forEach((ch, c) => { if (ch === '=' && r > 1 && map[r - 1][c] === '.' && map[r - 1][c - 1] === '.' && map[r - 1][c + 1] === '.') ledges.push([c, r - 1]); }));
    for (let k = 0; k < 3; k++) {
      const inK = ([c]) => c >= k * third && c < (k + 1) * third, high = (a, b) => a[1] - b[1] || b[0] - a[0];
      const pool = spots.filter(inK).sort(high), alt = ledges.filter(inK).sort(high);   // a high provision, or failing that a high ledge
      const at = pool[0] || alt[0]; if (at) this.featherAt.set(at[0] + ',' + at[1], k);
    }
    for (const [key, k] of this.featherAt) { const [c, r] = key.split(',').map(Number); if (map[r][c] !== 'c') this.hiddenFeather(c * TS + TS / 2, r * TS + TS - 10, k); }
    map.forEach((row, r) => row.forEach((ch, c) => {
      const x = c * TS + TS / 2, y = r * TS + TS;
      if (ch === 'c' && this.featherAt.has(c + ',' + r)) this.hiddenFeather(x, y - 10, this.featherAt.get(c + ',' + r));
      else if (ch === 'c') {
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
    for (const c of lv.fires || []) { const r = topAt(map, c, true); if (r != null) { const a = this.add.image(c * TS + TS / 2, r * TS, 'altar').setOrigin(0.5, 1).setDepth(2); a.lit = false; this.altars.push(a); } }
    this.altars.sort((a, b) => a.x - b.x);
    this.regrow = [];
    for (const c of lv.hearts || []) { const r = topAt(map, c); if (r != null) { const h = this.heart(c * TS + TS / 2, r * TS - 12); h.regrow = lv.regrow?.includes(c); } }
    // rising again after a fall: start at the last fire lit, with what was gathered on the way
    const R = this.resuming && resumeAt?.n === cur ? resumeAt : null; this.resuming = false;
    if (!R && !rush) { voiceBuf('khan' + cur)?.catch(() => {}); this.time.delayedCall(1100, () => playing && sayIntro(cur)); }
    if (rush) { const c = RUSH_AT[cur], r = this.groundAt(c * TS + 8) ?? 14; this.start = { x: c * TS + 8, y: r * TS }; for (const f of [...this.foes.getChildren()]) f.destroy(); }   // the rush begins at the arena's door
    if (R && this.altars[R.i]) { const a = this.altars[R.i]; this.start = { x: a.x, y: a.y }; for (const b of this.altars.slice(0, R.i + 1)) this.kindle(b, true);
      for (const f of [...this.foes.getChildren()]) if (Math.abs(f.x - a.x) < 7 * TS) f.destroy(); }   // no foe waits where Rostam rises
    this.respawn = { ...this.start };
    this.mounted = !!lv.mounted && this.textures.exists('ride-gallop');
    this.player = this.physics.add.sprite(this.start.x, this.start.y - 30, this.mounted ? 'ride-gallop' : 'rostam-idle', 0);
    this.fit(this.player, this.mounted ? 'rider' : 'rostam');
    this.player.setY(this.start.y - 1 - 0.47 * this.player.displayHeight); this.player.body.reset(this.player.x, this.player.y);   // feet on the floor, however tall the rider
    this.player.setDepth(5);
    this.physics.add.collider(this.player, this.layer);
    this.physics.add.collider(this.foes, this.layer, null, (f, t) => f.body.allowGravity || t.index % 4 !== 2);   // fliers pass through the thin ledges
    this.physics.add.overlap(this.player, this.coins, (pl, c) => this.eat(c));
    this.lion = null; this.boss = null; this.frozen = false; this.ram = null;
    this.cam = this.cameras.main;
    if (!this.cam.rawShake) {                                         // the comfort switches in the settings
      const cam = this.cam; cam.rawShake = cam.shake; cam.rawFlash = cam.flash;
      cam.shake = function (d, i, ...a) { return SET.shake ? cam.rawShake(d, i, ...a) : cam; };
      cam.flash = function (d, r, g, b, ...a) { return SET.flash ? cam.rawFlash(d, r, g, b, ...a) : cam; };
    }
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
    this.maxHp = 5 + (upg().heart || 0) + (gentle() ? 2 : legend() ? -2 : 0) + (Object.keys(feathers()).length >= 21 ? 1 : 0); this.hp = this.maxHp; this.farr = +(store.get('sh-farr') || 0); this.rakhshFed = false; this.rakhshRode = false; this.coinCount = 0; this.kills = 0; this.wasGround = true; this.face = 1; this.inv = 0; this.atk = 0; this.cool = 0; this.coyote = 0; this.buf = 0; this.bossOn = false; this.done = false; this.t0 = this.time.now;
    if (R) {
      this.coinCount = R.coins || 0; this.kills = R.kills || 0; this.t0 -= R.t || 0;
      for (const c of this.coins.getChildren().slice()) if (c.x < this.start.x) { c.glow?.destroy(); c.destroy(); }
      for (const f of this.foes.getChildren().slice()) if (Math.abs(f.x - this.start.x) < 8 * TS) f.destroy();   // a safe place to rise
      this.inv = 120;
    }
    if (this.coinCount >= FED && cur !== 3) this.rakhshFed = true;
    this.renderHearts(); $('coins').textContent = purse(); this.renderFarr(); hint(null); this.streak = 0; this.renderStreak();
    this.parts = this.add.particles(0, 0, 'coin-spin', { frame: 0, speed: { min: 30, max: 90 }, lifespan: 450, scale: { start: 0.8, end: 0 }, gravityY: 120, emitting: false }).setDepth(9);
    this.shots = this.physics.add.group({ allowGravity: false }); this.hazards = [];
    this.physics.add.collider(this.shots, this.layer, sh => sh.destroy());
    this.physics.add.overlap(this.player, this.shots, (pl, sh) => { if (!sh.active || sh.back) return; this.hurt(sh.x); this.fx('hit', sh.x, sh.y, { depth: 10 }); sh.destroy(); });
    lv.create?.(this);
    setupEncounters(this);
    this.setupTrial();
    if (!window.ShahnamehJourney) throw new Error('The journey encounters could not load.');
    if (!rush) this.journey = window.ShahnamehJourney.create(this, cur, { hint, toast, banner, sfx, unearth, TS, W, H });
    if (rush) this.rushSetup();
    if (R) { lv.resume?.(this); toast(R.well ? 'Rostam rises again beside the well.' : 'Rostam rises again beside the sacred fire.'); }
  }
  // a heart: one more life, glowing so it can be found even in the dark
  heart(x, y) {
    const h = this.pickup(x, y, 'heart-pick', 0, 'heart'); h.setScale(2); h.body.setSize(24, 24); h.setDepth(4);
    this.tweens.add({ targets: h, y: y - 3, yoyo: true, repeat: -1, duration: 900, ease: 'Sine.easeInOut' });   // a gentle bob, nothing more
    this.light(h, 0.5, 0.1); return h;
  }
  combatWord(text, color = '#ffe7a2') {
    const p = this.player, word = this.add.text(p.x, p.body.top - 12, text, { fontFamily: 'Georgia, serif', fontSize: '10px', color, stroke: '#181125', strokeThickness: 3, resolution: 4 }).setOrigin(0.5, 1).setDepth(14);
    this.tweens.add({ targets: word, y: word.y - 18, alpha: 0, delay: 250, duration: 650, onComplete: () => word.destroy() });
  }
  setupTrial() {
    if (rush) return;
    const cfg = TRIALS[cur], x = (cfg.at + 0.5) * TS, y = this.groundAt(x) * TS;
    const glow = this.add.image(x, y - 27, 'glow').setScale(0.55).setTint(0xffdc87).setAlpha(0.65).setBlendMode(Phaser.BlendModes.ADD).setDepth(3);
    const marker = this.add.image(x, y - 27, 'feather').setScale(0.2).setTint(0xffdf8d).setDepth(4);
    this.tweens.add({ targets: [marker, glow], y: y - 32, yoyo: true, repeat: -1, duration: 1000, ease: 'Sine.easeInOut' });
    const label = this.add.text(x, y - 80, 'Simurgh trial', { fontFamily: 'Georgia, serif', fontSize: '9px', color: '#ffe5a0', stroke: '#181125', strokeThickness: 3, resolution: 4 }).setOrigin(0.5, 1).setDepth(10);
    const ribbonFrame = this.add.rectangle(W / 2, 39, 180, 16, 0x181125, 0.95).setStrokeStyle(1, 0xcaa65e).setScrollFactor(0).setDepth(13).setVisible(false);
    const ribbon = this.add.text(W / 2, 39, '', { fontFamily: 'Georgia, serif', fontSize: '9px', color: '#ffe5a0', padding: { x: 6, y: 2 }, resolution: 4 }).setOrigin(0.5).setScrollFactor(0).setDepth(14).setVisible(false);
    this.trial = { cfg, x, y, marker, glow, label, ribbon, ribbonFrame, state: 'ready', sparks: [], count: 0, best: trialRecords()[cur]?.best || 0 };
  }
  startTrial() {
    const t = this.trial; if (!t || !['ready', 'complete'].includes(t.state) || this.frozen || this.bossOn) return;
    t.state = 'running'; t.count = 0; t.layoutAt = 0; t.started = this.time.now; t.until = t.started + t.cfg.seconds * 1000;
    t.marker.setAlpha(0.3); t.label.setVisible(false);
    t.sparks = t.cfg.points.map(([c, r]) => {
      const x = c * TS, y = r * TS, spark = this.coins.create(x, y, 'coin-spin', 0).play('coin-spin');
      spark.kind = 'trial'; spark.setDepth(8); spark.body.setSize(12, 12);
      spark.glow = this.add.image(x, y, 'glow').setScale(0.35).setTint(0xffdf8d).setBlendMode(Phaser.BlendModes.ADD).setDepth(7);
      return spark;
    });
    toast(`${t.cfg.name}: gather three golden sparks without taking a hit. Optional — your journey continues either way.`);
  }
  finishTrial(success, reason = '') {
    const t = this.trial; if (!t || t.state !== 'running') return;
    for (const c of t.sparks) { c.glow?.destroy(); if (c.active) c.destroy(); }
    t.sparks = []; t.ribbon.setVisible(false); t.ribbonFrame.setVisible(false); t.state = success ? 'complete' : 'ready'; t.marker.setAlpha(success ? 0.65 : 1); t.label.setText(success ? 'Trial complete' : 'Simurgh trial').setVisible(true);
    if (!success) { if (reason) toast(reason); return; }
    t.completed = true; t.elapsed = Math.max(1, Math.round(this.time.now - t.started));
    const records = trialRecords(), previous = records[cur], first = !previous?.best;
    records[cur] = { best: Math.min(previous?.best || Infinity, t.elapsed) }; t.best = records[cur].best; store.set('sh-trials', JSON.stringify(records));
    if (first) { this.coinCount += 3; setPurse(purse() + 3); $('coins').textContent = purse(); this.gainFarr(30); if (this.coinCount >= FED && cur !== 3) this.rakhshFed = true; }
    if (cur === 2) { this.water = Math.min(100, this.water + 30); this.renderWater(); }
    this.sparkle(this.player.x, this.player.body.center.y, 0xffdf8d); this.combatWord('Trial complete'); sfx('coin');
    toast(`${t.cfg.name} — ${(t.elapsed / 1000).toFixed(1)}s.${first ? ' Three provisions and golden Farr earned!' : t.elapsed < previous.best ? ' A new personal best!' : ' Trail mastered again.'}`);
  }
  tickTrial() {
    const t = this.trial; if (!t) return;
    if (t.state === 'running') {
      if (this.bossOn || this.horde || this.done || this.player.x > (t.cfg.points.at(-1)[0] + 6) * TS || this.player.x < t.x - 6 * TS) { this.finishTrial(false); return; }
      if (this.time.now >= t.until) { this.finishTrial(false, 'The sparks fade — try again at the feather.'); return; }
      t.ribbon.setText(`${t.cfg.name}  ·  ${t.count}/3  ·  ${Math.ceil((t.until - this.time.now) / 1000)}s`).setVisible(true);
      // Keep the trial strip below DOM hints even when the canvas is letterboxed.
      if (!t.layoutAt || this.time.now >= t.layoutAt) {
        const rect = this.game.canvas.getBoundingClientRect(), scale = Math.max(0.1, rect.width / W);
        t.ribbon.setFontSize(Math.max(9, 12 / scale));
        const h = Math.max(16, t.ribbon.height + 2), top = Math.max(rect.top + 8, $('hud').getBoundingClientRect().bottom + 8, $('hint').getBoundingClientRect().bottom + 8);
        const y = Phaser.Math.Clamp((top - rect.top) / scale + h / 2, h / 2, H - 24);
        t.ribbon.setY(y); t.ribbonFrame.setY(y); t.layoutAt = this.time.now + 250;
      }
      t.ribbonFrame.setSize(t.ribbon.width + 8, Math.max(16, t.ribbon.height + 2)).setVisible(true);
    }
  }
  // light a fire altar (or drink at a well): the checkpoint
  kindle(a, quiet = false) {
    a.lit = true; this.respawn = { x: a.x, y: a.y };
    if (a.onLight) { if (!quiet) a.onLight(); return; }
    const g = this.add.image(a.x, a.y - 22, 'glow').setDepth(1).setScale(2).setBlendMode(Phaser.BlendModes.ADD);
    this.tweens.add({ targets: g, alpha: 0.6, yoyo: true, repeat: -1, duration: 700, ease: 'Sine.easeInOut' });
    if (quiet) return;
    sfx('fire'); this.fx('fire', a.x, a.y - 20, { depth: 3 }); this.fx('pickup', a.x, a.y - 18);
    if (this.lv.kindled?.(this, a)) return;
    toast('The sacred fire is lit. If Rostam falls, he will rise again here.');
  }
  // a hidden Simurgh feather: glowing and turning slowly; one already found is only a faint shimmer
  hiddenFeather(x, y, k) {
    const id = cur + ':' + k, found = !!feathers()[id];
    const glow = this.add.image(x, y, 'glow').setTint(0x9affe0).setBlendMode(Phaser.BlendModes.ADD).setScale(0.75).setDepth(2).setAlpha(found ? 0.15 : 0.7);
    if (found) { const f = this.add.image(x, y, 'feather').setScale(0.36).setAlpha(0.28).setDepth(3); this.tweens.add({ targets: [f, glow], y: y - 3, yoyo: true, repeat: -1, duration: 1100, ease: 'Sine.easeInOut' }); return; }
    const f = this.coins.create(x, y, 'feather'); f.kind = 'sfeather'; f.fid = id; f.glow = glow; f.setScale(0.36).setDepth(3); f.body.setSize(40, 70);
    this.tweens.add({ targets: [f, glow], y: y - 4, yoyo: true, repeat: -1, duration: 1100, ease: 'Sine.easeInOut' });
    this.tweens.add({ targets: f, angle: { from: -10, to: 10 }, yoyo: true, repeat: -1, duration: 1700, ease: 'Sine.easeInOut' });
    this.tweens.add({ targets: glow, alpha: 0.35, yoyo: true, repeat: -1, duration: 800 });
    f.spark = this.add.particles(0, 0, 'flake', { x: { min: x - 8, max: x + 8 }, y: { min: y - 14, max: y + 6 }, speedY: { min: -18, max: -6 }, lifespan: 900, frequency: 160, scale: { start: 1.1, end: 0 }, tint: [0x9affe0, 0xffe08a], blendMode: 'ADD' }).setDepth(3);
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
    this.fit(f, kind); f.kind = kind; f.spaceId = this.foeSerial = (this.foeSerial || 0) + 1; f.hp = F.hp; f.dir = -1; f.hopT = Math.random() * 60; f.home = { x, y: y - 20 };
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
    if (c.kind === 'trial') {
      const t = this.trial; if (!t || t.state !== 'running') { c.glow?.destroy(); c.destroy(); return; }
      if (this.time.now >= t.until) { this.finishTrial(false, 'The sparks fade — try again at the feather.'); return; }
      c.glow?.destroy(); c.destroy(); t.count++; this.fx('pickup', this.player.x, this.player.body.center.y); sfx('coin');
      if (t.count === 3) this.finishTrial(true); return;
    }
    if (c.kind === 'sfeather') {
      const F = feathers(); F[c.fid] = 1; store.set('sh-feathers', JSON.stringify(F));
      c.spark?.destroy(); this.tweens.killTweensOf([c, c.glow]); c.body.enable = false;
      this.tweens.add({ targets: [c, c.glow], y: c.y - 30, alpha: 0, scale: 0.8, duration: 700, ease: 'Cubic.easeOut', onComplete: () => { c.glow?.destroy(); c.destroy(); } });
      this.fx('pickup', c.x, c.y); this.fx('heal', this.player.x, this.player.body.bottom - 4, { depth: 6 }); cry(); this.gainFarr(25);
      const here = [0, 1, 2].filter(k => F[cur + ':' + k]).length, all = Object.keys(F).length;
      if (all >= 21) { banner('سیمرغ', 'The Simurgh\'s Blessing'); toast('All twenty-one feathers! The Simurgh blesses Rostam: one more heart, for ever.'); this.maxHp++; this.hp++; this.renderHearts(); }
      else toast(`A Simurgh feather! ${here} of 3 in this labour, ${all} of 21 in all.`);
      return;
    }
    if (c.kind === 'heart') {
      if (c.regrow) this.regrow.push({ x: c.x, y: c.y, away: 0 });
      c.glow?.destroy(); c.beacon?.destroy(); c.destroy(); this.fx('heal', this.player.x, this.player.body.bottom - 4, { depth: 6 }); sfx('fire');
      if (this.hp < this.maxHp) { this.hp++; this.renderHearts(); toast('A heart! Rostam\'s strength returns.'); } else toast('A heart, but Rostam is already whole.');
      return;
    }
    const heal = c.kind === 'lamb' && this.hp < this.maxHp;
    if (c.kind === 'skin') { c.destroy(); this.water = Math.min(100, this.water + 30); this.renderWater(); sfx('coin'); this.fx('splash', c.x, c.y + 4); toast('A water skin! Rostam drinks.'); return; }
    c.destroy(); this.gather(1); sfx('coin');
    this.gainFarr(c.kind === 'lamb' ? 25 : 12.5);
    this.fx('pickup', c.x, c.y + 6);
    if (c.kind === 'lamb') { if (heal) { this.hp++; this.renderHearts(); } this.fx('heal', this.player.x, this.player.body.bottom - 4, { depth: 6 }); sfx('fire'); }
  }
  sparkle(x, y, tint) { this.parts.setParticleTint(tint); this.parts.explode(8, x, y); }
  renderHearts() { $('hearts').innerHTML = Array.from({ length: this.maxHp }, (_, i) => `<img src="assets/ui/heart${i < this.hp ? '' : '-off'}.png?v=${V}" alt="">`).join(''); $('hearts').setAttribute('aria-label', `${this.hp} of ${this.maxHp} hearts`); }
  // the Farr: a golden bar that fills as Rostam gathers provisions and slays foes
  gather(n) {
    const was = this.coinCount; this.coinCount += n; setPurse(purse() + n); $('coins').textContent = purse();
    if (was < FED && this.coinCount >= FED && cur !== 3 && !this.rakhshFed) { this.rakhshFed = true; toast(cur === 1 ? 'Rakhsh is well fed! He will charge more often when he joins the fight.' : 'Rakhsh is well fed! He will gallop to your aid when you face the boss.'); }
  }
  // the unbroken run: every blow that lands without Rostam being hurt in between adds to it, and every fifth pays out
  streakHit() {
    const n = ++this.streak; this.renderStreak(true);
    if (n % 5) return;
    if (n === 10 && this.hp < this.maxHp) { this.hp++; this.renderHearts(); this.fx('heal', this.player.x, this.player.body.bottom - 4, { depth: 6 }); this.combatWord(`Unbroken ×${n}: a heart`, '#ffd0d8'); }
    else { this.gather(n >= 15 ? 3 : 2); this.combatWord(`Unbroken ×${n}: +${n >= 15 ? 3 : 2} provisions`); }
    this.gainFarr(n >= 15 ? 15 : 8); sfx('coin'); this.sparkle(this.player.x, this.player.body.top, 0xffe08a);
  }
  renderStreak(bump) {
    const el = $('streakPill'); if (!el) return;
    el.classList.toggle('hidden', !(this.streak >= 2)); $('streak').textContent = this.streak;
    if (bump) { el.classList.remove('bump'); void el.offsetWidth; el.classList.add('bump'); }
  }
  gainFarr(n) {
    const was = this.farr >= 100; this.farr = Math.min(100, this.farr + n); store.set('sh-farr', this.farr); this.renderFarr();
    if (!was && this.farr >= 100) { sfx('fire'); toast(`Your Farr is full! Press ${keyLabel('farr')}, or tap the golden Farr, to call on the Simurgh.`); }
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
  hurt(fromX, thirst = false, cause = 'attack') {
    if ((this.inv > 0 && !thirst) || this.done || this.frozen) return;
    if (this.dodgeT > 0 && !thirst) {
      if (cause === 'attack' && this.dodgeT > 9 && !this.dodgeRewarded) {
        this.dodgeRewarded = true; this.counterT = 48; this.gainFarr(6);
        this.sparkle(this.player.x, this.player.body.center.y, 0x8fe8ff); this.combatWord('Perfect dodge', '#b7f3ff');
      }
      return;
    }
    if (this.trial?.state === 'running') this.finishTrial(false, 'Hit taken — try again at the feather.');   // no harm during a cutscene or a dodge
    if (this.streak >= 5) this.combatWord(`Run broken at ${this.streak}`, '#ffb0a0');
    this.streak = 0; this.renderStreak();
    this.hp--; this.renderHearts(); this.inv = thirst ? 30 : gentle() ? 130 : legend() ? 70 : 90; sfx('hurt'); this.cam.shake(160, 0.008); this.cam.flash(120, 180, 40, 60);
    if (!thirst) this.player.setVelocity((this.player.x < fromX ? -1 : 1) * 160, -220);
    if (this.hp <= 0) {
      this.done = true; playing = false; music(false); document.body.classList.remove('playing'); hint(null);
      if (this.anims.exists('rostam-fall') && !this.mounted) { this.pose = 'rostam-fall'; this.player.anims.stop(); this.player.play('rostam-fall'); this.tweens.addCounter({ from: 255, to: 150, duration: 900, onUpdate: tw => { const c = Math.round(tw.getValue()); this.player.setTint((c << 16) | (c << 8) | c); } }); } else this.player.setTint(0x777777);
      const t = this.lv.tips; $('deadTip').textContent = controlText((!this.bossOn && this.journey?.getTip()) || t[Math.floor(Math.random() * t.length)]);
      const cp = resumeAt?.n === cur;
      if (cp) Object.assign(resumeAt, { coins: this.coinCount, kills: this.kills, t: this.time.now - this.t0 });
      $('retryBtn').textContent = rush ? 'Start the rush again' : cp ? (resumeAt.well ? 'Rise at the well' : 'Rise at the sacred fire') : 'Try again'; $('freshBtn').classList.toggle('hidden', !cp || !!rush);
      setTimeout(() => { if (!playing && this.done) $('s-dead').classList.remove('hidden'); }, 900);
      setTimeout(() => say('fall' + (1 + Math.floor(Math.random() * 3)), { sub: false }), 1000);   // "Rise, son of Zal"
    }
  }
  // the charged blow comes down: a long reach, triple force, and the ground itself shakes and throws up dust both ways
  heavyBlow() {
    const p = this.player; this.heavyGo = true; this.heavy = 'heavy'; this.pose = 'rostam-heavy';
    p.anims.stop(); p.play({ key: 'rostam-heavy', startFrame: 3 }); sfx('swing');
    this.time.delayedCall(150, () => {
      this.atk = 11; this.hitDone = new Set(); this.cool = 26;
      const y = p.body.bottom; this.cam.shake(260, 0.014); sfx('hit'); this.hitStop(60);
      for (const d of [-1, 1]) for (let i = 0; i < 3; i++) this.time.delayedCall(i * 60, () => this.fx('dust', p.x + this.face * 30 + d * (12 + i * 22), y, { flip: d < 0, depth: 8 }));
      this.fx('shock', p.x + this.face * 30, y + 1, { depth: 8 });
    });
    p.once('animationcomplete', () => { this.heavyGo = false; if (this.pose === 'rostam-heavy') this.pose = null; this.heavy = null; });
  }
  strikeBox(extra = 0) { const p = this.player, r = (this.mounted ? 48 : 34) + (upg().reach ? 12 : 0) + extra; return new Phaser.Geom.Rectangle(this.face > 0 ? p.body.right - 4 : p.body.left - r + 4, p.body.top - 22, r, p.body.height + 24); }   // the blade arcs over his head too
  damage(f, n = 1, force = false) {
    if (!f.active || !f.body.enable || f.hp <= 0) return false;
    if (f.immune?.() && !force) { this.fx('dust', f.x, f.body.center.y, { depth: 10 }); sfx('clang'); if (!this.toldImmune) { this.toldImmune = true; toast(f.immuneMsg || 'Your blow passes through shadow.'); } return false; }
    if (f === this.boss && !force && this.time.now < (f.hitReadyAt || 0)) return false;
    if (f === this.boss) f.hitReadyAt = this.time.now + (gentle() ? 240 : 320);
    f.hp -= n; if (!force) this.streakHit();
    if (f !== this.boss && f.hp > 0 && f.body.allowGravity && !force && (this.heavy || this.counterStrike)) {
      f.attackId = (f.attackId || 0) + 1; f.staggerUntil = this.time.now + 420;
      f.smash = f.cast = f.sting = f.thrust = f.leap = false; f.cool = Math.max(f.cool || 0, 45);
      f.removeAllListeners('animationcomplete'); f.play(FOES[f.kind].tex, true);
      f.staggerFx?.destroy(); f.staggerFx = this.fx('stun', f.x, f.body.top - 4, { depth: 8 }).setScale(0.55);
    }
    f.setTintFill(0xffffff); this.time.delayedCall(80, () => f.active && f.clearTint());
    const hx = Phaser.Math.Clamp(this.face > 0 ? f.body.left + 6 : f.body.right - 6, f.body.left, f.body.right);
    this.fx('hit', hx, f.body.center.y - 4, { depth: 10 }); sfx('hit'); this.cam.shake(80, 0.004);
    if (f === this.boss || this.heavy) this.fx('impact', hx, f.body.center.y - 4, { depth: 10 });
    this.hitStop(f === this.boss ? 70 : 45);
    if (f === this.boss && !legend() && !f.gaveHeart && f.hp > 0 && f.hp <= f.max / 2 && this.hp < this.maxHp) {
      f.gaveHeart = true; const x = this.player.x + (this.player.x < this.cam.scrollX + W / 2 ? 60 : -60), r = this.groundAt(x);
      if (r != null) { this.heart(x, r * TS - 12); toast('A heart appears in the arena. Take it!'); }
    }
    if (f.hp <= 0) {
      if (f === this.boss) { f.onDown(); return true; }
      this.kills++; f.staggerFx?.destroy(); f.staggerFx = null; f.body.enable = false; this.slay(f); this.gainFarr(4);
    }
    return true;
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
  // a boss's death, in four beats: the killing blow freezes the world in a white flash; the storm's own lightning strikes
  // the boss (a cold flash in the White Div's cave) and light cracks out of it; it plays its death, slowed, and crashes
  // down with a shockwave of dust; then it lies where it fell, dark and smoking, while the sky clears. Returns the ms
  // until it is down.
  bossDeath(B) {
    B.body.enable = false; B.anims.stop(); this.hideMark(); B.rageFx?.destroy(); B.rageFx = null; this.chargeWarn?.destroy(); this.stars?.destroy(); this.stars = null;
    B.clearTint(); B.setAlpha(1); this.tweens.killTweensOf(B);
    this.hitStop(320); this.cam.flash(260, 255, 255, 255); this.cam.shake(260, 0.02); sfx('hit'); sfx('roar');
    const S = this.lv.sky || {}, glow = S.glow ?? 0xffd890, cy = () => B.body.center.y;
    // the killing light: a bolt from the storm, or a burst of cold light under the cave's roof
    this.time.delayedCall(330, () => {
      if (!B.active) return;
      if (!S.cave) {
        const g = this.add.graphics().setDepth(10).setBlendMode(Phaser.BlendModes.ADD); let x = B.x + Phaser.Math.Between(-20, 20), y = this.cam.scrollY - 8;
        const pts = [[x, y]]; while (y < cy()) { x += Phaser.Math.Between(-10, 10); y += Phaser.Math.Between(8, 16); pts.push([x, Math.min(y, cy())]); }
        for (const [lw, c, al] of [[7, S.bolt ?? 0xfff0c0, 0.35], [2.5, 0xffffff, 1]]) { g.lineStyle(lw, c, al); g.beginPath(); g.moveTo(...pts[0]); pts.forEach(q => g.lineTo(...q)); g.strokePath(); }
        this.tweens.add({ targets: g, alpha: 0, duration: 420, ease: 'Expo.easeIn', onComplete: () => g.destroy() });
      }
      this.cam.flash(200, 255, 245, 220); this.flashA = 0.5; thunder(1); this.fx('blast', B.x, cy(), { depth: 10 }).setScale(1.3);
      const rays = this.add.image(B.x, cy(), 'rays').setTint(glow).setBlendMode(Phaser.BlendModes.ADD).setDepth(3).setScale(0.2).setAlpha(0.95);
      this.tweens.add({ targets: rays, scale: 1.6, angle: 40, duration: 1500, ease: 'Cubic.easeOut' });
      this.tweens.add({ targets: rays, alpha: 0, delay: 1100, duration: 900, onComplete: () => rays.destroy() });
      for (let i = 0; i < 8; i++) this.time.delayedCall(i * 110, () => B.active && this.fx('hit', B.x + Phaser.Math.Between(-30, 30), B.body.top + Phaser.Math.Between(4, B.body.height - 4), { depth: 10 }));
    });
    // the death itself: its own animation, played slow, or a stagger for a foe without one
    const die = B.texture.key.split('-')[0] + '-die', has = this.anims.exists(die);
    const fall = 600 + (has ? 1500 : 700);
    this.time.delayedCall(600, () => {
      if (!B.active) return;
      if (has) { B.play({ key: die, frameRate: 6 }); B.setTint(0xffd0c0); }
      if (!B.body.allowGravity) {               // a flier sinks to the ground as she dies
        const floor = (this.groundAt(B.x) ?? 14) * TS; this.tweens.add({ targets: B, y: floor - B.displayHeight * (0.97 - B.originY), duration: 1300, ease: 'Quad.easeIn' });
      }
    });
    this.time.delayedCall(fall, () => {
      if (!B.active) return; this.calmSky(); sfx('win'); sfx('drum');
      const floor = (this.groundAt(B.x) ?? 14) * TS;
      this.cam.shake(600, 0.024); this.cam.flash(380, 255, 236, 190);
      // the crash: a ring of dust and a shockwave of light along the ground
      for (const d of [-1, 1]) for (let i = 0; i < 4; i++) this.time.delayedCall(i * 70, () => this.fx('dust', B.x + d * (18 + i * 30), floor, { flip: d < 0, depth: 8 }));
      this.fx('shock', B.x, floor + 1, { depth: 9 }).setScale(1.8);
      if (B.texture.key === 'queen-die') this.tweens.add({ targets: B, scaleY: B.scaleY * 0.84, y: B.y + B.displayHeight * 0.08, duration: 420, ease: 'Bounce.easeOut' });   // her legs give way
      if (B.texture.key === 'dragon-die') {                            // the dragon's great body slumps and thunders down
        this.tweens.add({ targets: B, angle: (B.flipX ? 1 : -1) * 14, y: B.y + B.displayHeight * 0.08, duration: 520, ease: 'Bounce.easeOut' });
      }
      this.slain(B, has);
    });
    return fall;
  }
  slain(B, fell) {
    B.setDepth(3);
    const floor = (this.groundAt(B.x) ?? 14) * TS, dir = B.flipX ? -1 : 1;
    if (!fell) {
      // a foe with no death of its own falls to the ground and stays there
      const lie = floor - B.displayHeight * 0.18;
      this.tweens.add({ targets: B, angle: -dir * 82, y: lie, duration: 700, ease: 'Bounce.easeOut', onComplete: () => { this.cam.shake(200, 0.01); this.fx('dust', B.x, floor, { depth: 8 }); } });
    }
    this.tweens.addCounter({ from: 0, to: 1, duration: 1400, onUpdate: tw => { const v = tw.getValue(); B.setTint(Phaser.Display.Color.GetColor(255 - v * 120, 255 - v * 140, 255 - v * 130)); } });
    const smoke = this.add.particles(0, 0, 'flake', { x: { min: B.x - 30, max: B.x + 30 }, y: { min: floor - 34, max: floor - 6 }, speedY: { min: -40, max: -12 }, speedX: { min: -8, max: 8 },
      lifespan: 1600, frequency: 70, scale: { start: 1.5, end: 0 }, alpha: { start: 0.85, end: 0 }, tint: [0xffb060, 0xff7030, 0x806050], blendMode: 'ADD' }).setDepth(4);
    this.time.delayedCall(6000, () => { smoke.stop(); this.time.delayedCall(1600, () => smoke.destroy()); });
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
    this.bossOn = true; this.stormSky();
    const x0 = 86 * TS;
    this.cam.stopFollow(); this.tweens.add({ targets: this.cam, scrollX: Math.min(this.levelW - W, x0), duration: 700, ease: 'Sine.easeInOut' });
    this.arenaWalls(x0);
    const l = this.lion = this.physics.add.sprite(this.lionAt.x, this.lionAt.y - 40, 'lion-walk', 0);
    this.fit(l, 'lion'); this.placeBoss(l); l.hp = l.max = gentle() ? 6 : legend() ? 11 : 8; l.state = 'roar'; l.tm = 70; l.dir = -1; l.setFlipX(true); l.play('lion-roar'); l.setDepth(4);
    this.boss = l; l.keep = 91; l.onDown = () => this.lionDown(); l.ai = () => this.lionAI();
    l.calm = () => ['stun', 'recover'].includes(l.state); l.contact = () => ['charge', 'pounce'].includes(l.state);
    l.immune = () => !l.calm(); l.immuneMsg = 'The lion\'s hide turns your blow. Jump its charge so it runs into the rocks, then strike while it is dazed.';
    this.physics.add.collider(l, this.layer, null, onFloor); this.physics.add.collider(l, [this.wall, this.wallR]);
    sfx('roar'); this.roarRings(l);
    $('boss').classList.remove('hidden'); this.bossBar(); this.bossIntro(l);
    hint('<b>Roar:</b> it will charge, leap it so it hits the rocks. <b>Gold crouch:</b> a pounce. <b>Orange paw:</b> a swipe. Strike while the stars circle its head.');
  }
  // Keep frame-authored patterns in real time, independent of render/update frequency.
  bossStep() { return this.bossDelta ?? 1; }
  bossFloorAt(x) {
    for (let r = 2; r < ROWS; r++) { const t = this.layer.getTileAtWorldXY(x, r * TS + 2); if (t?.collides && t.index % 4 !== 2) return r * TS; }
    return 14 * TS;
  }
  placeBoss(b) {
    const y = this.bossFloorAt(b.x) - 1 - 0.47 * b.displayHeight;
    b.body.reset(b.x, y); b.setVelocity(0);
  }
  // At most two consecutive repeats; distance/height may still favour the same move.
  bossChoice(b, preferred, alternative) {
    const move = b.lastMove === preferred && b.moveRepeats >= 2 ? alternative : preferred;
    b.moveRepeats = b.lastMove === move ? b.moveRepeats + 1 : 1; b.lastMove = move; return move;
  }
  bossRead(b) {
    const p = this.player, now = this.time.now;
    const m = b.brain ||= { x: p.x, at: now, anchor: p.x, camp: 0, air: 0, pressure: 0, vx: 0, recent: [], ready: {} };
    m.x ??= p.x; m.at ??= now; m.anchor ??= p.x; m.camp ??= 0; m.air ??= 0; m.pressure ??= 0; m.vx ??= 0;
    const dt = this.intro || this.frozen ? 0 : Math.min(100, Math.max(0, now - m.at)), moving = Math.abs(p.x - m.anchor) > 28;
    if (dt > 0) {
      const vx = Phaser.Math.Clamp((p.x - m.x) * 1000 / dt, -180, 180);
      m.vx += (vx - m.vx) * Math.min(1, dt / 180);
      m.air += ((p.body.blocked.down ? 0 : 1) - m.air) * Math.min(1, dt / 1800);
      m.pressure += ((this.atk > 0 && Math.abs(p.x - b.x) < 110 ? 1 : 0) - m.pressure) * Math.min(1, dt / 1200);
      m.camp = moving ? 0 : m.camp + dt; if (moving) m.anchor = p.x;
    }
    m.x = p.x; m.at = now;
    return { distance: Math.abs(p.x - b.x), dx: p.x - b.x, vx: m.vx, air: m.air,
      pressure: m.pressure, camp: m.camp, ledge: p.body.bottom < 13 * TS,
      targetX: Phaser.Math.Clamp(p.x + m.vx * 0.35, this.wall?.x + 30 || p.x - 80, this.wallR?.x - 30 || p.x + 80) };
  }
  // Weighted, context-sensitive choices with short memory and per-move cooldowns.
  // The player can read the chosen move's tell; the boss cannot change its mind during the attack.
  bossTactic(b, choices) {
    const m = b.brain ||= { recent: [], ready: {} }, now = this.time.now;
    let pool = choices.filter(c => c.weight > 0 && (m.ready[c.move] || 0) <= now);
    if (!pool.length) return null;
    const last = m.recent.slice(-2);
    if (pool.length > 1 && last.length === 2 && last[0] === last[1]) pool = pool.filter(c => c.move !== last[0]);
    const weighted = pool.map(c => ({ ...c, score: c.weight * (last[last.length - 1] === c.move ? 0.28 : last.includes(c.move) ? 0.65 : 1) }));
    let roll = Math.random() * weighted.reduce((n, c) => n + c.score, 0), chosen = weighted[weighted.length - 1];
    for (const c of weighted) { roll -= c.score; if (roll <= 0) { chosen = c; break; } }
    m.recent.push(chosen.move); if (m.recent.length > 6) m.recent.shift();
    m.ready[chosen.move] = now + (chosen.cooldown || 0); return chosen.move;
  }
  bossAim(b, text) {
    const read = this.bossRead(b); b.aimX = read.targetX; b.aimLedge = read.ledge; b.aimY = this.player.body.center.y;
    b.dir = Math.sign(b.aimX - b.x) || b.dir || -1; b.intent = text; return read;
  }
  bossBar() { $('bossHp').style.width = (this.boss.hp / this.boss.max * 100) + '%'; }
  // when a blow will land the boss bar says so; over the boss itself only the dazed stars show
  bossMark(B, time) {
    const open = !this.frozen && (B.open ? B.open() : !B.immune?.());
    if (open !== this.markOpen) {
      this.markOpen = open;
      if (open) this.toldImmune = false;
      $('boss').classList.toggle('open', open);
    }
    const preparing = !['walk', 'prowl', 'lurk', 'float', 'guard', 'rest', 'stun', 'recover', 'stuck', 'dazed', 'exposed', 'surfaced'].includes(B.state);
    const label = preparing && B.intent ? B.intent : open ? 'Strike now!' : '';
    if ($('bossState').textContent !== label) $('bossState').textContent = label;
    $('bossState').classList.toggle('warning', !!(preparing && B.intent));
    this.cornerHeart(B.x, time);
    // a well-fed Rakhsh gallops in once: twelve seconds into the fight, or sooner if Rostam is hard pressed
    this.bossT = (this.bossT || 0) + this.bossStep();
    if (this.rakhshFed && cur !== 1 && !this.rakhshRode && !this.mounted && !this.frozen && B.hp > 0 && B.body.enable && B.alpha > 0.5 && (B.kickable?.() ?? true) && (this.bossT > 720 || this.hp <= 2)) this.rakhshRides(B);
  }
  rakhshRides(B) {
    // he always comes in from the left edge at a gallop, rears and kicks the boss, then gallops on and away off the right
    this.rakhshRode = true; const y = 14 * TS + 3, x0 = this.cam.scrollX - 60;
    const r = this.add.sprite(x0, y, 'rakhsh-gallop', 0).setOrigin(0.5, 0.97).setDepth(5).play('rakhsh-gallop');
    sfx('neigh'); toast('Rakhsh gallops to your aid!'); banner('رخش', 'Rakhsh');
    const dust = this.time.addEvent({ delay: 120, loop: true, callback: () => r.active && this.fx('dust', r.x - 26, y - 2, { depth: 6 }) });
    const reach = Math.max(x0 + 40, B.x - 56);
    this.tweens.add({ targets: r, x: reach, duration: Math.abs(reach - r.x) / 0.34, ease: 'Linear', onComplete: () => {
      if (!B.active) { dust.remove(); r.destroy(); return; }
      r.play('rakhsh-rear'); sfx('neigh'); this.cam.shake(260, 0.012);
      this.time.delayedCall(260, () => { if (B.active && B.hp > 0 && B.body.enable) { this.fx('hit', B.x - 20, B.body.center.y, { depth: 10 }); this.damage(B, 2, true); } });
      r.once('animationcomplete', () => { r.play('rakhsh-gallop');
        this.tweens.add({ targets: r, x: this.cam.scrollX + W + 90, duration: 1500, onComplete: () => { dust.remove(); r.destroy(); } }); });
    } });
  }
  // now and then a heart glows in the corner of the arena farthest from the danger (a ledge if there is one), for 10 s
  cornerHeart(fromX, time) {
    if (legend()) return;   // on the legend's road no heart is given in the arena
    this.bossHeartT = (this.bossHeartT ?? 480) - this.bossStep();
    if (this.bossHeart?.active && time > this.bossHeart.dieAt) { this.bossHeart.glow?.destroy(); this.bossHeart.beacon?.destroy(); this.bossHeart.destroy(); }
    if (this.bossHeartT <= 0) {
      this.bossHeartT = 900;
      if (!this.bossHeart?.active) {
        // the highest standing place near the corner farthest from the boss: a ledge if there is one
        const cx = this.cam.scrollX, side = fromX > cx + W / 2 ? 1 : -1; let x = side > 0 ? cx + 24 : cx + W - 24, r = this.groundAt(x);
        for (let i = 0; i < 9; i++) { const xx = x + side * i * TS, rr = this.groundAt(xx); if (rr != null && rr < r) { x = Math.floor(xx / TS) * TS + TS / 2; r = rr; } }
        if (r != null) { const h = this.bossHeart = this.heart(x, r * TS - 12); h.dieAt = time + 10000; toast('A heart appears in the corner. Grab it!'); }
      }
    }
  }
  hideMark() { this.mark?.destroy(); this.markGlow?.destroy(); this.mark = this.markGlow = null; this.markOpen = undefined; if (this.bossHeart?.active) { this.bossHeart.glow?.destroy(); this.bossHeart.destroy(); } }
  lionAI() {
    const l = this.lion, p = this.player; if (!l?.active || l.hp <= 0) return;
    const read = this.bossRead(l), mad = l.hp <= l.max / 2, toP = Math.sign(p.x - l.x) || l.dir;
    l.tm -= this.bossStep();
    if (mad && !l.mad && ['prowl', 'stun', 'recover'].includes(l.state)) { l.mad = true; this.lionMeetsRakhsh(l); return; }   // never in the middle of an attack
    if (this.ally) this.allyTick(l);
    if (l.state === 'prowl') {
      // Give ground under melee pressure, close on a retreat, and intercept habitual jumps.
      const left = l.keep * TS, right = this.wallR.x - 45;
      // Make room before attacking out of a corner, rather than cycling into the wall.
      if (!l.regroup && ((l.x < left + 12 && toP < 0) || (l.x > right - 12 && toP > 0))) {
        l.regroup = l.x < left + 12 ? left + 85 : right - 85;
        l.tm = Math.max(l.tm, 45);
      }
      if (l.regroup && Math.abs(l.regroup - l.x) < 10) { l.regroup = null; l.tm = Math.max(l.tm, 30); }
      const retreatRoom = toP < 0 ? right - l.x : l.x - left;
      const backing = read.distance < 85 && read.pressure > 0.2 && retreatRoom > 70;
      l.dir = l.regroup ? Math.sign(l.regroup - l.x) : backing ? -toP : toP;
      l.setVelocityX(l.dir * (mad ? 98 : 82));
      if (l.regroup && (l.body.blocked.left || l.body.blocked.right)) l.regroup = null;
      if (l.anims.currentAnim?.key !== 'lion-walk' || !l.anims.isPlaying) l.play('lion-walk');
      if (l.tm <= 0 && !l.regroup) {
        const groundedTarget = !read.ledge && Math.abs(p.body.bottom - l.body.bottom) < 45;
        const retreatRoom = toP < 0 ? right - l.x : l.x - left;
        const move = this.bossTactic(l, [
          { move: 'roar', weight: read.ledge ? 0 : read.distance > 130 ? 3 : 0.45 },
          { move: 'crouch', weight: 1.2 + read.air * 3 + (read.ledge || read.camp > 2200 ? 3 : 0), cooldown: 1400 },
          { move: 'pawReady', weight: groundedTarget && read.distance < 100 ? 4 : 0, cooldown: 1700 },
          { move: 'circle', weight: retreatRoom > 90 ? (mad ? 1.5 + read.pressure * 2 : 0.6) : 0, cooldown: 4000 },
          { move: 'quake', weight: mad && groundedTarget ? 1.6 : 0, cooldown: 5200 }
        ]);
        if (!move) { l.tm = 8; return; }
        this.bossAim(l, { roar: 'Roar: a charge is coming', crouch: 'Low crouch: a hunting leap', pawReady: 'Raised paw: step clear', circle: 'The lion circles you', quake: 'It rears: jump the shockwave' }[move]);
        l.state = move; l.tm = move === 'roar' ? 44 : move === 'circle' ? 30 : move === 'quake' ? 50 : 36; l.setVelocityX(0); l.anims.stop(); l.setFrame(0);
        if (move === 'roar') { l.play('lion-roar'); sfx('roar'); this.roarRings(l); }
        else if (move === 'quake') { l.play('lion-roar'); l.setTint(0xffe2a8); l.quaked = false; }
        else if (move === 'circle') l.play('lion-walk');
      }
    } else if (l.state === 'roar') {
      l.setVelocityX(0); if (l.tm <= 0) { l.state = 'charge'; l.tm = 100; l.play('lion-run'); }
    } else if (l.state === 'quake') {
      // the wounded lion rears and brings its forepaws down: a shockwave runs along the ground both ways
      l.setVelocityX(0); l.y += Math.sin(this.time.now * 0.08) * 0.3;
      if (!l.quaked && l.tm <= 14) { l.quaked = true; l.clearTint(); this.shockwave(l.x, l.body.bottom); sfx('roar'); }
      if (l.tm <= 0) this.lionOpening(l, 'recover', 44);
    } else if (l.state === 'charge') {
      l.setVelocityX(l.dir * (mad ? 265 : 235));
      if ((l.dir < 0 ? l.body.blocked.left || l.hitKeep : l.body.blocked.right) || l.tm <= 0) this.lionOpening(l, 'stun', 86);
    } else if (l.state === 'circle') {
      l.setVelocityX(-l.dir * 70);
      if (l.tm <= 0) { const swipe = !read.ledge && Math.abs(p.body.bottom - l.body.bottom) < 45 && read.distance < 90; this.bossAim(l, swipe ? 'Raised paw: step clear' : 'Low crouch: a hunting leap'); l.state = swipe ? 'pawReady' : 'crouch'; l.tm = 38; l.setVelocityX(0); }
    } else if (l.state === 'crouch') {
      l.setVelocityX(0); l.setTint(0xffdc9a);
      if (l.tm <= 0) {
        l.clearTint(); l.state = 'pounce'; l.tm = 55;
        const vx = Phaser.Math.Clamp(((l.aimX ?? p.x) - l.x) / 0.65, -240, 240);
        l.dir = Math.sign(vx) || l.dir; l.setVelocity(vx, l.aimLedge ? -390 : -330); l.play('lion-run');
      }
    } else if (l.state === 'pounce') {
      if ((l.tm < 30 && l.body.blocked.down) || l.tm < -35) this.lionOpening(l, 'recover', 55);
    } else if (l.state === 'pawReady') {
      l.setVelocityX(0); l.setTint(0xffad70);
      if (l.tm <= 0) { l.clearTint(); l.state = 'paw'; l.tm = 24; l.pawed = false; this.fx('swing', l.x + l.dir * 38, l.body.center.y, { flip: l.dir < 0 }); }
    } else if (l.state === 'paw') {
      if (!l.pawed && l.tm < 16) { l.pawed = true; this.hazard(l.dir > 0 ? l.x + 15 : l.x - 88, l.body.bottom - 48, 73, 48, 150); sfx('swing'); }
      if (l.tm <= 0) this.lionOpening(l, 'recover', 58);
    } else if (l.calm()) {
      l.setVelocityX(0); this.stars?.setPosition(Math.round(l.x), Math.round(l.body.top - 6));
      if (l.tm <= 0) { l.clearTint(); l.anims.resume(); this.stars?.destroy(); this.stars = null; l.state = 'prowl'; l.tm = (mad ? 28 : 45) + Math.random() * 30; }
    }
    l.setFlipX(l.dir < 0);
  }
  // The legend's turn: at half strength the lion meets Rakhsh. He gallops in and stays. Every few seconds he rears and
  // charges the length of the arena, and a lion caught in his path is thrown down, dazed: lure it into the charge.
  lionMeetsRakhsh(l) {
    this.phase2 = true; this.intro = true; this.frozen = true; this.player.setVelocityX(0);
    l.setVelocityX(0); l.clearTint(); l.play('lion-roar'); sfx('roar'); this.roarRings(l); this.cam.shake(500, 0.01);
    const y = 14 * TS + 2, post = this.cam.scrollX + 4 * TS;
    const r = this.ally = this.add.sprite(this.cam.scrollX - 70, y, 'rakhsh-gallop', 0).setOrigin(0.5, 0.97).setDepth(4.5).setScale(SIZE.rakhsh / 229).play('rakhsh-gallop');
    r.post = post; r.state = 'enter'; r.next = 0;
    this.time.delayedCall(600, () => { sfx('neigh'); banner('رخش', 'Rakhsh comes to fight'); });
    const dust = this.time.addEvent({ delay: 110, loop: true, callback: () => r.active && r.state !== 'post' && r.state !== 'rear' && this.fx('dust', r.x - (r.flipX ? -26 : 26), y - 1, { depth: 6, flip: r.flipX }) });
    r.once('destroy', () => dust.remove());
    this.tweens.add({ targets: r, x: post, duration: 1100, ease: 'Sine.easeOut', onComplete: () => {
      if (!r.active) return; r.state = 'post'; r.anims.stop(); r.setFrame(0); r.next = this.time.now + 1800;
      this.intro = false; if (!this.done) this.frozen = false;
      l.state = 'prowl'; l.tm = 50;
      hint('<b>Rakhsh fights at your side!</b> When he rears, lure the lion into his charge, then strike it while it is down.');
    } });
  }
  allyTick(l) {
    const r = this.ally; if (!r?.active || this.intro) return;
    const now = this.time.now, y = 14 * TS + 2, left = this.cam.scrollX + 4 * TS, right = left + W * 0.55;   // his charge spans the left of the arena: the lion must be drawn into it
    const fighting = this.player.body.blocked.down && this.player.body.bottom > 13 * TS;   // he charges for a Rostam who fights on the ground, not one waiting on the ledge
    if (r.state === 'post' && now >= r.next && fighting && !l.calm() && l.state !== 'pounce' && l.body.blocked.down) {
      r.state = 'rear'; r.setFlipX(false); r.play('rakhsh-rear'); sfx('neigh'); this.cam.shake(160, 0.006);
      r.once('animationcomplete', () => { if (!r.active || r.state !== 'rear') return; r.state = 'charge'; r.hit = false; r.play('rakhsh-gallop'); });
    } else if (r.state === 'charge') {
      r.x += 5.6 * this.bossStep();
      if (!r.hit && l.hp > 0 && l.body.enable && Math.abs(l.x - r.x) < 38 && l.body.bottom > y - 30) {
        r.hit = true; this.fx('impact', l.x - 10, l.body.center.y, { depth: 10 }); this.fx('hit', l.x, l.body.center.y, { depth: 10 });
        this.cam.shake(320, 0.014); sfx('hit'); this.hitStop(90); this.combatWord('Rakhsh!', '#ffe0a0');
        this.damage(l, 1, true); if (l.hp > 0) { l.dir = -1; l.setFlipX(true); this.lionOpening(l, 'stun', 120); }
      }
      if (r.x >= right) { r.state = 'return'; r.setFlipX(true); }
    } else if (r.state === 'return') {
      r.x -= 3 * this.bossStep();
      if (r.x <= left) { r.x = left; r.state = 'post'; r.setFlipX(false); r.anims.stop(); r.setFrame(0); r.next = now + (this.rakhshFed ? 4200 : 6200); }
    }
  }
  lionOpening(l, state, frames) {
    l.state = state; l.tm = frames; l.intent = ''; l.setVelocityX(0); l.play('lion-walk'); l.anims.pause(); l.setTint(0xffd8a0);
    this.stars?.destroy(); this.stars = this.fx('stun', l.x, l.body.top - 6, { depth: 10, follow: l });
    this.fx('dust', l.x, l.body.bottom, { depth: 8 });
  }
  lionDown() {
    const l = this.lion; this.stars?.destroy(); this.stars = null; const at = this.bossDeath(l);
    const r = this.ally; if (r?.active) { r.state = 'leave'; this.time.delayedCall(at + 400, () => { if (!r.active) return; r.setFlipX(false); r.play('rakhsh-gallop'); this.tweens.add({ targets: r, x: r.x + 60, duration: 600, onComplete: () => { r.anims.stop(); r.setFrame(0); } }); }); }
    $('boss').classList.add('hidden'); this.wall.destroy(); this.wallR?.destroy();
    this.time.delayedCall(at + 900, () => this.reward(l.x));
    this.cam.startFollow(this.player, true, 0.12, 0.12, W / 2, H / 2);
  }
  // the end of every boss fight: the foe lies where it fell, and the Simurgh's feather drifts down beside it;
  // Rostam walks to it to end the labour
  reward(nearX) {
    // the Simurgh answers: she sweeps across the clearing sky, a feather slips from her tail, and it drifts down, swaying,
    // onto a ring of light beyond the fallen foe. Rostam walks to it to end the labour.
    const cx = this.cam.scrollX, cy = this.cam.scrollY, away = this.player.x < nearX ? 1 : -1;
    let fx = nearX + away * 50; if (fx < cx + 30 || fx > cx + W - 30) fx = nearX - away * 70; fx = Phaser.Math.Clamp(fx, cx + 30, cx + W - 30);
    const fy = this.bossFloorAt(fx) - 22, from = away > 0 ? -1 : 1;           // she flies in from behind Rostam; the feather settles on the ground, never on a ledge
    const x0 = from < 0 ? cx - 180 : cx + W + 180, x1 = from < 0 ? cx + W + 180 : cx - 180, dur = 3600;
    const bird = this.add.sprite(x0, cy + 70, this.textures.exists('simurgh-fly') ? 'simurgh-fly' : 'feather', 0).setDepth(2.5).setScale(1.05).setFlipX(from > 0);
    if (this.anims.exists('simurgh-fly')) bird.play({ key: 'simurgh-fly', repeat: -1 });
    const trail = this.add.particles(0, 0, 'flake', { follow: bird, followOffset: { x: -from * 50, y: 10 }, speedX: { min: -20, max: 20 }, speedY: { min: 10, max: 40 }, lifespan: 1400, frequency: 25,
      scale: { start: 1.6, end: 0 }, alpha: { start: 1, end: 0 }, tint: [0xffe08a, 0x7affe0, 0xffb040], blendMode: 'ADD' }).setDepth(2.6);
    this.tweens.add({ targets: bird, x: x1, duration: dur, ease: 'Sine.easeInOut', onUpdate: () => { const t = (bird.x - x0) / (x1 - x0); bird.y = cy + 70 - Math.sin(t * Math.PI) * 26; },
      onComplete: () => { bird.destroy(); trail.stop(); this.time.delayedCall(1500, () => trail.destroy()); } });
    this.time.delayedCall(400, cry);
    toast('The Simurgh answers! A feather falls from her wings.');
    // the feather slips free as she passes over the place it will land
    const tDrop = Phaser.Math.Clamp((fx - x0) / (x1 - x0), 0.1, 0.9) * dur;
    this.time.delayedCall(tDrop, () => {
      if (this.done) return;
      const f = this.physics.add.staticImage(fx, cy + 70, 'feather').setDepth(6).setScale(0.62); this.light(f, 1.1, 0.1);
      const spark = this.add.particles(0, 0, 'flake', { follow: f, speedY: { min: -14, max: 14 }, speedX: { min: -14, max: 14 }, lifespan: 900, frequency: 45, scale: { start: 1.3, end: 0 }, alpha: { start: 1, end: 0 }, tint: [0xffe08a, 0x7affe0], blendMode: 'ADD' }).setDepth(5);
      f.spark = spark; const sync = () => f.body && f.refreshBody();
      // it falls like a leaf: swaying side to side, tilting with each swing
      this.tweens.addCounter({ from: 0, to: 1, duration: 2600, ease: 'Sine.easeIn', onUpdate: tw => {
        const v = tw.getValue(); if (!f.active) return; f.y = Phaser.Math.Linear(cy + 70, fy, v); f.x = fx + Math.sin(v * Math.PI * 3) * 22 * (1 - v); f.angle = Math.cos(v * Math.PI * 3) * 28 * (1 - v); sync();
      }, onComplete: () => {
        if (!f.active) return; f.x = fx; f.angle = 0; sync();
        // a ring of light opens on the ground where it lands, and a beam rises from it
        // a soft pool of light on the ground, rings of light rippling out from it, and a column of light over it
        const sig = this.fx('sigil', fx, fy + 22, { depth: 2 }).setScale(0.75).setAlpha(0), ring = null;   // the Simurgh's eight-pointed star turns on the ground
        this.tweens.add({ targets: sig, alpha: 0.95, scale: 0.85, duration: 600, ease: 'Back.easeOut' });
        const col = this.add.image(fx, fy + 21, 'glow').setOrigin(0.5, 1).setTint(0xfff0c0).setBlendMode(Phaser.BlendModes.ADD).setDepth(2).setScale(0.35, 2.4).setAlpha(0);
        this.tweens.add({ targets: col, alpha: 0.4, duration: 600, yoyo: true, hold: 300, repeat: -1, repeatDelay: 200 });
        f.glow = sig; f.ring = ring; f.col = col; this.fx('beam', fx, fy + 22, { depth: 4 }); sfx('coin');
        this.tweens.add({ targets: f, y: fy - 5, yoyo: true, repeat: -1, duration: 900, ease: 'Sine.easeInOut', onUpdate: sync });
        this.physics.add.overlap(this.player, f, () => this.takeFeather(f));
        hint('Victory! <b>Take the Simurgh\'s glowing feather</b> to end the labour.');
      } });
    });
  }
  // the feather spirals up around Rostam in a ring of light, and the labour is done
  takeFeather(f) {
    if (this.done || f.taken) return; f.taken = true; f.body.enable = false; this.tweens.killTweensOf(f);
    const p = this.player; this.frozen = true; p.setVelocityX(0); sfx('fire');
    if (this.anims.exists('rostam-victory') && !this.mounted) { this.pose = 'rostam-victory'; p.anims.stop(); p.play('rostam-victory'); }
    f.spark?.stop(); this.tweens.killTweensOf([f.ring, f.col].filter(Boolean)); this.tweens.add({ targets: [f.glow, f.ring, f.col].filter(Boolean), alpha: 0, duration: 400 });
    this.tweens.addCounter({ from: 0, to: 1, duration: 900, ease: 'Sine.easeIn', onUpdate: tw => { const v = tw.getValue(); f.x = p.x + Math.cos(v * Math.PI * 4) * 26 * (1 - v); f.y = p.body.center.y - v * 30 + Math.sin(v * Math.PI * 4) * 8; f.angle = v * 540; f.setScale(0.62 * (1 - v * 0.6)); },
      onComplete: () => { this.cam.flash(500, 255, 240, 200); const r = this.add.image(p.x, p.body.center.y, 'rays').setTint(0xffe08a).setBlendMode(Phaser.BlendModes.ADD).setDepth(10).setScale(0.2);
        this.tweens.add({ targets: r, scale: 2.2, alpha: 0, angle: 90, duration: 900, ease: 'Cubic.easeOut', onComplete: () => r.destroy() });
        cry(); this.win(f); } });
  }
  recordVictory() {
    if (this.victory) return this.victory;
    const seconds = Math.max(1, Math.round((this.time.now - this.t0) / 1000));
    const healthy = this.hp >= Math.ceil(this.maxHp / 2), F = feathers();
    const allFeathers = [0, 1, 2].every(k => F[cur + ':' + k]), stars = 1 + Number(healthy) + Number(allFeathers);
    const S = starsOf(); S[cur] = Math.max(S[cur] || 0, stars); store.set('sh-stars', JSON.stringify(S));
    if (legend()) { const L = legendsOf(); L[cur] = 1; store.set('sh-legend', JSON.stringify(L)); }
    if (cur < LABOURS) store.set('sh-unlocked', Math.max(unlocked(), cur + 1));
    const bk = cur === 1 ? 'sh-best' : 'sh-best-' + cur, previousBest = +(store.get(bk) || 0);
    if (!previousBest || seconds < previousBest) store.set(bk, seconds);
    trackGame('level_end', { level_name: String(cur), success: true, duration_seconds: seconds, stars });
    return this.victory = { seconds, stars, healthy, allFeathers, previousBest, legend: legend(), hp: this.hp, coins: this.coinCount, kills: this.kills };
  }
  win(f) {
    if (this.done) return; this.done = true; playing = false; music(false); sfx('fire'); document.body.classList.remove('playing'); hint(null); resumeAt = null;
    this.tweens.killTweensOf([f, f.glow, f.ring, f.col].filter(Boolean)); f.spark?.destroy(); f.glow?.destroy?.(); f.ring?.destroy?.(); f.col?.destroy?.(); f.destroy();
    if (rush) { this.rushNext(); return; }
    const result = this.recordVictory(), { seconds: s, stars, healthy, allFeathers, previousBest: best } = result;
    const reward = stars === 3 ? 'A perfect labour: heart to spare and every feather found' :
      healthy ? 'Done with heart to spare' : allFeathers ? 'Every feather found' : 'Labour done';
    const missing = [!healthy && 'keep half your hearts', !allFeathers && 'find all three feathers'].filter(Boolean);
    const advice = missing.join(' and ');
    $('winStars').innerHTML = [0, 1, 2].map(i => `<i class="${i < stars ? 'on' : ''}" style="animation-delay:${0.7 + i * 0.35}s">\u2605</i>`).join('') +
      `<small>${reward}${missing.length ? '. ' + advice[0].toUpperCase() + advice.slice(1) + ' for a perfect labour.' : ''}${result.legend ? ' On the legend\u2019s road!' : ''}</small>`;
    $('winMsg').textContent = this.lv.win;
    $('winKick').textContent = `The ${['', 'first', 'second', 'third', 'fourth', 'fifth', 'sixth', 'seventh'][cur]} labour is done`;
    $('winTitle').textContent = this.lv.winTitle || 'The labour is done';
    $('nextBtn').classList.toggle('hidden', cur >= LABOURS || !LEVELS[cur + 1]);
    $('winStats').innerHTML = `<div><b>${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}</b>time</div><div><b>${result.coins}</b>provisions</div><div><b>${result.kills}</b>foes</div><div><b>${result.hp}</b>hearts</div>`;
    $('winBest').textContent = !best || s < best ? 'A new best time!' : `Best time ${Math.floor(best / 60)}:${String(best % 60).padStart(2, '0')}`;
    if (this.trial?.completed) $('winBest').textContent += ` · Simurgh trial ${(this.trial.elapsed / 1000).toFixed(1)}s`;
    const labour = cur, showWin = () => {
      music(false); $('s-win').classList.remove('hidden');
      (labour < LABOURS ? $('nextBtn') : $('againBtn')).focus();
      if (labour < LABOURS) say('win' + labour, { sub: false });
    };
    // The seventh labour already closes with the king's restoration, the ending paintings and the credits.
    setTimeout(() => labour < LABOURS && location.hash !== '#selftest' ? cinema('outro' + labour, showWin) : showWin(), 600);
  }
  update(time, delta) {
    const k = delta / 16.67, p = this.player, b = p.body;
    this.lv.scroll(this, this.cam.scrollX, time); this.drawShards(delta); this.tickSky(delta / 16.67, time);
    if (!playing || this.done) { if (this.done && this.hp <= 0) p.setVelocityX(0); return; }
    this.inv = Math.max(0, this.inv - k); p.setAlpha(this.inv > 0 && Math.floor(this.inv / 5) % 2 ? 0.35 : 1);
    if (this.frozen) { pressed.jump = pressed.attack = false; this.buf = this.attackBuf = this.dodgeBuf = 0; }
    const dirX = this.frozen ? 0 : (keys.right ? 1 : 0) - (keys.left ? 1 : 0), ground = b.blocked.down;
    if (dirX) this.face = dirX;
    const tv = dirX * (this.mounted ? 165 : 125); b.velocity.x += (tv - b.velocity.x) * (1 - Math.pow(ground ? 0.7 : 0.85, k));   // Rakhsh outruns any man
    this.coyote = ground ? 6 : Math.max(0, this.coyote - k);
    if (pressed.jump) this.buf = 6; pressed.jump = false;
    if (ground) this.airJumps = 1;
    if (this.buf > 0 && this.coyote > 0) { p.setVelocityY(-335); this.coyote = 0; this.buf = 0; sfx('jump'); this.fx('dust', p.x, b.bottom, { depth: 6 }); }
    // the super jump: once in the air, jump again for a higher leap, in a burst of gold
    else if (this.buf > 0 && this.coyote <= 0 && this.airJumps > 0) {
      this.airJumps = 0; this.buf = 0; p.setVelocityY(upg().wings ? -460 : -400); sfx('jump'); sfx('swing');
      this.sparkle(p.x, b.bottom, 0xf6dc8c); this.fx('dust', p.x, b.bottom + 2, { depth: 6 });
    }
    this.buf = Math.max(0, this.buf - k);
    if (ground && !this.wasGround && this.fallV > 200) this.fx('dust', p.x, b.bottom, { depth: 6 });
    this.wasGround = ground; this.fallV = b.velocity.y;
    if (!keys.jump && b.velocity.y < -120) p.setVelocityY(b.velocity.y * Math.pow(0.85, k));
    this.cool -= k;
    this.counterT = Math.max(0, (this.counterT || 0) - k);
    this.attackBuf = pressed.attack && !this.frozen ? 7 : Math.max(0, (this.attackBuf || 0) - k);
    if (this.attackBuf > 0 && this.cool <= 0 && !(this.dodgeT > 0) && !this.frozen) {
      this.attackBuf = 0; this.counterStrike = this.counterT > 0; this.counterT = 0;
      // three quick blows make a combo: the third is a hard overhead finisher
      this.combo = this.comboT > 0 && !this.mounted ? (this.combo || 0) + 1 : 1; this.comboT = 46;
      this.heavy = this.combo >= 3 ? 'finish' : null; if (this.heavy) this.combo = 0;
      this.atk = this.heavy ? 18 : 16; this.cool = this.mounted ? 26 : this.heavy ? 30 : 22; sfx('swing'); this.hitDone = new Set();
      if (this.heavy) { this.pose = 'rostam-heavy'; p.anims.stop(); p.play({ key: 'rostam-heavy', startFrame: 4, frameRate: 26 }); p.once('animationcomplete', () => { if (this.pose === 'rostam-heavy') this.pose = null; }); }
      else { if (this.pose === 'rostam-heavy') this.pose = null; p.play(this.mounted ? 'ride-strike' : 'rostam-attack', true); }
      this.swingFx = this.heavy ? this.fx('arc', p.x + this.face * 12, p.y - 10, { flip: this.face < 0, depth: 7 }) : this.fx('swing', p.x + this.face * 6, p.y - 2, { flip: this.face < 0, depth: 6 });
      this.chargeT = 0;
    }
    this.comboT = (this.comboT || 0) - k;
    // the heavy blow: keep holding the strike after a swing and the mace gathers light; let go to bring it down
    if (keys.attack && !this.mounted && ground && this.atk <= 0 && !(this.dodgeT > 0) && !this.frozen && this.anims.exists('rostam-heavy')) {
      this.chargeT = (this.chargeT || 0) + k;
      if (this.chargeT > 8 && this.pose !== 'rostam-heavy') { this.pose = 'rostam-heavy'; p.play('rostam-heavy', true); p.anims.pause(); p.setFrame(3); b.velocity.x *= 0.4; }
      if (this.pose === 'rostam-heavy' && !this.heavyGo) { b.velocity.x *= 0.85; p.setFrame(3); }
      if (this.chargeT > 8) {
        const full = this.chargeT >= 34; this.chargeGlow ||= this.add.image(0, 0, 'glow').setBlendMode(Phaser.BlendModes.ADD).setDepth(6);
        this.chargeGlow.setPosition(p.x - this.face * 14, p.y - 30).setScale((full ? 0.9 : 0.3 + this.chargeT / 60) + Math.sin(time * 0.03) * 0.08).setTint(full ? 0xffe28a : 0xffb060).setAlpha(full ? 1 : 0.7);
        if (full && !this.chargeFull) { this.chargeFull = true; sfx('coin'); this.fx('pickup', p.x - this.face * 14, p.y - 30, { depth: 7 }); }
      }
    } else if (this.chargeT > 0 && !keys.attack) {
      if (this.chargeFull && ground && !this.frozen) this.heavyBlow();
      else if (this.pose === 'rostam-heavy' && !this.heavyGo) this.pose = null;
      this.chargeT = 0; this.chargeFull = false; this.chargeGlow?.destroy(); this.chargeGlow = null;
    }
    // the dodge: a low, fast dash that no blow can catch, with a short breath after it
    this.dodgeCd = (this.dodgeCd || 0) - k;
    this.dodgeBuf = pressed.dodge && !this.frozen ? 7 : Math.max(0, (this.dodgeBuf || 0) - k);
    pressed.dodge = false;
    if (this.dodgeBuf > 0) {
      if (this.dodgeCd <= 0 && !this.mounted && !this.frozen && this.anims.exists('rostam-dodge')) {
        this.dodgeBuf = 0; this.dodgeRewarded = false; this.dodgeT = 15; this.dodgeCd = 38; this.dodgeDir = dirX || this.face; this.face = this.dodgeDir; this.atk = 0; this.chargeT = 0; this.chargeGlow?.destroy(); this.chargeGlow = null;
        this.pose = 'rostam-dodge'; p.play('rostam-dodge', true); sfx('jump'); this.fx('dust', p.x - this.dodgeDir * 10, b.bottom, { flip: this.dodgeDir > 0, depth: 6 });
      } }
    if (this.dodgeT > 0) {
      this.dodgeT -= k; b.velocity.x = this.dodgeDir * 330 * Math.max(0.35, this.dodgeT / 15);
      if (Math.floor(this.dodgeT) % 3 === 0) {                     // ghosts of Rostam left along the dash
        const g = this.add.image(p.x, p.y, p.texture.key, p.frame.name).setScale(p.scaleX, p.scaleY).setFlipX(p.flipX).setOrigin(p.originX, p.originY).setDepth(4).setTint(0x8fd8ff).setAlpha(0.5).setBlendMode(Phaser.BlendModes.ADD);
        this.tweens.add({ targets: g, alpha: 0, duration: 260, onComplete: () => g.destroy() });
      }
      if (this.dodgeT <= 0 && this.pose === 'rostam-dodge') this.pose = null;
    }
    if (this.swingFx?.active) this.swingFx.setPosition(Math.round(p.x + this.face * 6), Math.round(p.y - 2));
    pressed.attack = false;
    if (pressed.farr) { pressed.farr = false; this.farrBlast(); }
    // standing by a lit fire altar, Rostam may make an offering of provisions at the Fire Temple
    const altar = ground && !this.bossOn ? this.altars.find(a => a.lit && !a.onLight && Math.abs(a.x - p.x) < 30) : null;
    if (altar !== this.atAltar) {
      this.atAltar = altar; $('offerBtn').classList.toggle('hidden', !altar); if (altar) $('offerBtn').innerHTML = '&#128293; Offer';
      if (altar && !this.toldOffer && purse() >= Math.min(...UPGRADES.map(u => u.costs[upg()[u.id] || 0] ?? Infinity))) { this.toldOffer = true; hint(`You stand at a sacred fire. Press ${keyHTML('offer')} or tap <b>Offer</b> to trade provisions for lasting gifts.`); }
    }
    // at a bell tower during the ram's riddle, Down (or the Ring button) rings its bell
    const P = this.puzzle, bellAt = P && !P.done && !P.showing && !this.frozen && b.blocked.down ? this.stones.findIndex(st => Math.abs(p.x - st.x) < 22 && Math.abs(b.bottom - st.footY) < 6) : -1;
    if (bellAt !== (this.nearBell ?? -1)) {
      this.nearBell = bellAt; this.ringTip?.destroy(); this.ringTip = null;
      if (bellAt >= 0) { const st = this.stones[bellAt]; this.ringTip = this.add.text(st.x, st.footY - st.displayHeight - 8, touch ? 'Tap Ring' : keyLabel('offer') + ' Ring', { fontFamily: 'EB Garamond, serif', fontSize: '11px', color: '#ffe8a8', stroke: '#2a1408', strokeThickness: 3, resolution: 4 }).setOrigin(0.5, 1).setDepth(11);
        this.tweens.add({ targets: this.ringTip, y: this.ringTip.y - 3, yoyo: true, repeat: -1, duration: 500, ease: 'Sine.easeInOut' }); }
      if (!this.atAltar) { $('offerBtn').classList.toggle('hidden', bellAt < 0); $('offerBtn').innerHTML = '&#128276; Ring'; }
    }
    const trial = this.trial;
    this.nearTrial = ['ready', 'complete'].includes(trial?.state) && !this.bossOn && !this.frozen && ground && Math.abs(p.x - trial.x) < 26 && Math.abs(b.bottom - trial.y) < 12;
    if (trial && ['ready', 'complete'].includes(trial.state)) { const best = trial.best; trial.label.setText(this.nearTrial ? (touch ? 'Tap Trial' : keyLabel('offer') + (best ? ' Retry trial' : ' Begin trial')) : best ? 'Simurgh trial · ' + (best / 1000).toFixed(1) + 's' : 'Simurgh trial'); }
    if (!this.atAltar && bellAt < 0) { $('offerBtn').classList.toggle('hidden', !this.nearTrial); if (this.nearTrial) $('offerBtn').textContent = 'Trial'; }
    $('offerBtn').setAttribute('aria-label', this.atAltar ? 'Make an offering at the sacred fire' : bellAt >= 0 ? 'Ring the bell' : this.nearTrial ? 'Begin the optional Simurgh trial' : 'Interact');
    if (pressed.offer) { pressed.offer = false; if (this.nearBell >= 0) this.ringBell(this.nearBell); else if (this.atAltar) openTemple(); else if (this.nearTrial) this.startTrial(); }
    this.tickTrial();
    if (this.atk > 0) {
      this.atk -= k;
      if (this.atk < 12 && this.atk > 3) {
        const box = this.strikeBox(this.heavy ? 22 : 0);
        const targets = [...this.foes.getChildren(), ...(this.boss && this.boss.active && this.boss.hp > 0 ? [this.boss] : [])];
        // the Mace of Sam: double against foes, and every other blow on a boss lands twice as hard
        const mace = upg().mace, base = (this.heavy === 'heavy' ? 3 : this.heavy ? 2 : 1) + (this.counterStrike ? 1 : 0), hit = f => (!mace ? 1 : f !== this.boss ? 2 : (this.maceHit = !this.maceHit) ? 2 : 1) * base;
        for (const f of targets) if (f.body.enable && !this.hitDone.has(f) && Phaser.Geom.Intersects.RectangleToRectangle(box, f.body)) { this.hitDone.add(f); const landed = this.damage(f, hit(f)); if (landed && f.hp > 0 && f.body.enable && !f.calm?.()) f.body.allowGravity ? f.setVelocity(this.face * (f === this.boss ? 60 : 140), f.kind === 'vulture' ? -60 : -120) : f === this.boss ? f.setVelocityX(this.face * 60) : f.setVelocity(this.face * 140, -60); }
        for (const sh of this.shots.getChildren()) if (sh.curse && !sh.back && Phaser.Geom.Intersects.RectangleToRectangle(box, sh.getBounds())) this.deflect(sh);
      }
    }
    if (this.atk <= 0) this.counterStrike = false;
    // the ends of the world, arena walls and horde gates hold Rostam by position: pressed into a thin physics wall
    // while jumping, the separation lifts him a little every frame until he climbs over it
    const lo = Math.max(2, this.wall?.active ? this.wall.x + 4 : -Infinity, ...(this.gates || []).filter(g => g.r.active && g.r.x < p.x).map(g => g.r.x + 6));
    const hi = Math.min(this.levelW - 2, this.wallR?.active ? this.wallR.x - 4 : Infinity, ...(this.gates || []).filter(g => g.r.active && g.r.x > p.x).map(g => g.r.x - 6));
    if (b.left < lo) { b.x += lo - b.left; if (b.velocity.x < 0) b.velocity.x = 0; }
    if (b.right > hi) { b.x -= b.right - hi; if (b.velocity.x > 0) b.velocity.x = 0; }
    // thorns and pits
    const tile = this.layer.getTileAtWorldXY(p.x, b.bottom - 2);
    if (tile && tile.index % 4 === 3) { this.hurt(tile.pixelX + 8, false, 'terrain'); p.setVelocityY(-300); }
    if (p.y > ROWS * TS + 60) { this.inv = 0; this.hurt(p.x, false, 'terrain'); if (this.hp > 0) { p.setPosition(this.respawn.x, this.respawn.y - 4 - 0.47 * p.displayHeight); p.setVelocity(0); this.inv = 80; } }
    // animation
    const M = this.mounted, swinging = p.anims.isPlaying && /attack|strike/.test(p.anims.currentAnim?.key || '');
    const anim = this.pose || (this.atk > 0 || (M && swinging) ? (M ? 'ride-strike' : 'rostam-attack') : M ? 'ride-gallop' : this.inv > 70 ? 'rostam-hurt' : !ground ? 'rostam-jump' : Math.abs(b.velocity.x) > 15 ? 'rostam-run' : 'rostam-idle');
    if (p.anims.currentAnim?.key !== anim && !(/attack|strike/.test(anim) && p.anims.isPlaying)) p.play(anim);
    if (anim === 'ride-gallop') { if (ground && Math.abs(b.velocity.x) > 15) p.anims.resume(); else { p.anims.pause(); if (!ground) p.setFrame(2); } }
    if (anim === 'rostam-jump') p.setFrame(b.velocity.y < 0 ? 0 : 1);
    p.setFlipX(this.face < 0);
    this.cam.setFollowOffset(W / 2 - this.face * 30, H / 2);
    // Resolve crowding before foes commit to new attack tells.
    separate(this, k);
    // foes
    for (const f of this.foes.getChildren()) {
      if (!f.body.enable) continue;
      if (f.staggerUntil > time) { if (f.body.blocked.down) f.setVelocityX(0); }
      else { f.staggerUntil = 0; f.staggerFx?.destroy(); f.staggerFx = null; FOES[f.kind].tick(this, f, k, p); }
      f.staggerFx?.setPosition(f.x, f.body.top - 4);
      yieldFoe(this, f, k);
      containFoe(f, k);
      if (f.body.allowGravity && f.body.blocked.down && !f.smash && !f.cast && !f.sting && !f.thrust) {
        const pinned = (f.body.blocked.left || f.body.blocked.right) && Math.abs(f.x - (f.wx ?? 0)) < 0.3;
        f.pinT = pinned ? (f.pinT || 0) + k : 0; f.wx = f.x;
        if (f.pinT > 45) { f.pinT = 0; f.dir = f.body.blocked.left ? 1 : -1; f.setFlipX(f.dir < 0); f.bored = 80; slideFoe(this, f, f.dir * 2); }
      }
      if (Phaser.Geom.Intersects.RectangleToRectangle(b, f.body)) {
        if (b.velocity.y > 60 && b.bottom - f.body.top < 12) { this.damage(f, 2); p.setVelocityY(keys.jump ? -330 : -230); }
        else { if (!f.harmless?.()) this.hurt(f.x); if (f.js === 'lunge') f.bit = true; }   // a lunge bites once: dodged through, it is spent
      }
    }
    // checkpoint
    for (const a of this.altars) if (!a.lit && p.x > a.x) { this.kindle(a); resumeAt = { n: cur, i: this.altars.indexOf(a), well: !!a.onLight }; }
    // a taken platform heart grows back once Rostam has been away from it for 2 s
    this.regrow = this.regrow.filter(h => {
      const near = Math.abs(p.x - h.x) < 3 * TS && Math.abs(b.bottom - (h.y + 12)) < 10;
      h.away = near ? 0 : h.away + delta; if (h.away < 2000) return true;
      this.fx('heal', h.x, h.y + 12, { depth: 6 }); this.heart(h.x, h.y).regrow = true; return false;
    });
    routeCue(this, p);
    this.lv.update?.(this, k, time, p, b);
    this.journey?.tick(time, delta);
    // projectiles expire; hazard zones (fire breath, shockwaves) hurt while they last
    for (const sh of this.shots.getChildren()) if (time > sh.die) sh.destroy(); else if (sh.spin) sh.angle += sh.spin * k;
    this.hazards = this.hazards.filter(z => { if (time >= z.until) return false; if (z.move) z.r.x += z.move * k; if (Phaser.Geom.Intersects.RectangleToRectangle(b, z.r)) this.hurt(z.r.centerX); return time < z.until; });
    this.drawDark();
    // a curse turned back strikes the one who cast it
    for (const sh of this.shots.getChildren()) if (sh.back && this.boss?.active && this.boss.hp > 0 && this.boss.body.enable && Phaser.Geom.Intersects.RectangleToRectangle(sh.getBounds(), this.boss.body)) { sh.destroy(); this.boss.onBack ? this.boss.onBack() : this.damage(this.boss); }
    // boss
    const B = this.boss;
    this.bossDelta = delta / (1000 / 60);
    if (B && B.active && B.hp > 0) {
      if (B.body.enable && B.body.allowGravity && B.body.top > ROWS * TS + 60) this.placeBoss(B);
      this.bossRead(B);
      if (this.intro) { B.setVelocityX?.(0); if (B.anims?.isPlaying && B.anims.currentAnim?.key?.endsWith('walk')) { B.anims.stop(); B.setFrame(0); } } else B.ai();
      if (B.faceRostam && B.body.enable) B.setFlipX(B.dir < 0);   // keep the artwork aligned with the committed attack
      this.bossBar(); this.bossMark(B, time);
      // below half strength a boss burns with rage: red fire flickers up behind it
      if (B.lines?.rage && B.hp > 0 && B.hp <= B.max / 2) say(B.lines.rage, { once: true });
      if (!B.rageFx && B.hp <= B.max / 2 && B.body.enable) { B.rageFx = this.fx('rage', B.x, B.body.bottom, { depth: B.depth - 0.05 }).setAlpha(0).setScale(Math.max(1.2, B.displayHeight / 88)); this.tweens.add({ targets: B.rageFx, alpha: 0.78, duration: 800 }); }
      B.rageFx?.setPosition(Math.round(B.x), Math.round(B.body.bottom)).setVisible(B.body.enable && B.alpha > 0.5 && !B.sinking);
      // a boss never comes within mace reach of its arena's corner ledge: that ledge is a refuge, not a perch to strike from
      B.hitKeep = false;
      if (B.keep && B.body.enable && B.x < B.keep * TS) { B.x = B.keep * TS; if (B.body.velocity.x < 0) B.setVelocityX(0); B.hitKeep = true; }
      // as a boss recovers from an opening it shrugs Rostam off for a moment rather than hurting him where he stands
      const calm = !!B.calm?.(); if (B.wasCalm && !calm) B.grace = 45; B.wasCalm = calm; B.grace = (B.grace || 0) - this.bossStep();
      // touching a boss hurts unless it is reeling (or still hidden, or not yet unmasked); landing on an open one is a blow
      if (B.alpha > 0.5 && !B.noMark?.() && Phaser.Geom.Intersects.RectangleToRectangle(b, B.body)) {
        if (!B.immune?.() && b.velocity.y > 60 && b.bottom - B.body.top < 14) { this.damage(B); p.setVelocityY(-320); }
        else if ((B.contact ? B.contact() : !B.calm?.()) && B.grace <= 0 && (!(b.blocked.down && b.bottom < 13 * TS) || (B === this.lion && B.state === 'pounce'))) this.hurt(B.x);   // ground charges pass beneath a refuge; a warned hunting leap can reach it
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
    d.clear(); d.fill(this.darkTint, Math.max(0, this.darkA - (this.flashA || 0)));   // a flash of lightning lifts the dark a moment
    const t = this.time.now;
    for (const l of this.lights) {
      if (!l.obj.active || !l.obj.visible || l.obj.alpha < 0.25) continue;          // a lamp that has faded gives no light
      const s = l.scale * Math.min(1, l.obj.alpha * 1.3) * (1 + (l.flicker ? Math.sin(t * 0.013 + l.obj.x) * l.flicker : 0));
      this.lamp.setScale(s); d.erase(this.lamp, Math.round(l.obj.x - this.cam.scrollX), Math.round(l.obj.y - this.cam.scrollY));
    }
  }
  // the boss storm: when a boss appears the sky over the arena turns. A veil and a rolling cloud bank darken the far painting,
  // a sun or moon burns through behind them, lightning forks across the sky (and lifts the dark), the weather thickens and the
  // edges of the screen pulse like a heartbeat. All of it sits behind the world, just above the far painting.
  stormSky() {
    const S = this.lv.sky; if (!S || this.sky) return;
    const list = this.children.list;
    let at = 0; list.forEach((o, i) => { if (o.type === 'Image' && o.scrollFactorX === 0 && o.depth === 0 && o.width >= W) at = i + 1; });
    const put = o => { o.setScrollFactor(0); this.children.moveTo(o, Math.min(at++, list.length - 1)); return o; };
    const [sx, sy] = S.sun;
    const sky = this.sky = { S, v: 0, calm: false, boltT: 90, time: 0, mids: list.filter(o => o.type === 'TileSprite' && o.scrollFactorX === 0 && o.depth === 0) };
    for (const m of sky.mids) m.tint0 = m.tintTopLeft;
    sky.under = at > 0 ? list[at - 1] : null;                                     // the far painting it repaints
    if (this.textures.exists('storm-' + cur)) sky.paint = put(this.add.image(0, 0, 'storm-' + cur).setOrigin(0).setAlpha(0));
    sky.veil = put(this.add.image(0, 0, 'stormveil').setOrigin(0).setTint(S.veil).setAlpha(0));
    sky.horizon = put(this.add.image(0, 0, 'horizon').setOrigin(0).setTint(S.glow).setBlendMode(Phaser.BlendModes.ADD).setAlpha(0));
    sky.rays = put(this.add.image(W * sx, H * sy, 'rays').setTint(S.glow).setBlendMode(Phaser.BlendModes.ADD).setScale(1.5).setAlpha(0));
    sky.sun = put(this.add.image(W * sx, H * sy, 'glow').setTint(S.glow).setBlendMode(Phaser.BlendModes.ADD).setScale(2.2).setAlpha(0));
    sky.back = put(this.add.tileSprite(0, -18, W, 150, 'stormcloud').setOrigin(0).setTint(S.cloud).setAlpha(0));
    sky.bolts = put(this.add.graphics().setBlendMode(Phaser.BlendModes.ADD));
    sky.front = put(this.add.tileSprite(0, -34, W, 150, 'stormcloud').setOrigin(0).setTint(S.cloud).setAlpha(0).setFlipX(true));
    sky.flash = put(this.add.rectangle(0, 0, W, H, S.bolt).setOrigin(0).setBlendMode(Phaser.BlendModes.ADD).setAlpha(0));
    sky.edge = this.add.image(0, 0, 'vignette-white').setOrigin(0).setScrollFactor(0).setDepth(13).setTint(S.edge).setAlpha(0);
    const P = {
      dust: ['sand', { x: { min: W, max: W + 30 }, y: { min: H * 0.3, max: H }, speedX: { min: -260, max: -140 }, speedY: { min: -30, max: 10 }, lifespan: 2600, frequency: 22, scale: { min: 1, max: 2.5 }, alpha: { start: 0.7, end: 0 }, tint: [0xd8a060, 0xa86a3a] }],
      ash: ['flake', { x: { min: -20, max: W + 60 }, y: -4, speedY: { min: 20, max: 55 }, speedX: { min: -40, max: -10 }, lifespan: 6000, frequency: 45, alpha: { start: 0.8, end: 0.2 }, tint: [0x8a8098, 0x5a5068, 0xb07aff] }],
      spores: ['flake', { x: { min: 0, max: W }, y: H + 4, speedY: { min: -45, max: -15 }, speedX: { min: -14, max: 14 }, lifespan: 6500, frequency: 70, scale: { min: 0.8, max: 1.8 }, alpha: { start: 1, end: 0 }, tint: [0xa0ff70, 0xd8a0ff, 0x70ffc0], blendMode: 'ADD' }],
      rain: ['streak', { x: { min: -40, max: W + 120 }, y: -8, speedY: { min: 520, max: 640 }, speedX: { min: -150, max: -110 }, rotate: 14, lifespan: 650, frequency: 6, quantity: 2, alpha: { start: 0.55, end: 0.3 } }],
      embers: ['sand', { x: { min: 0, max: W }, y: H + 4, speedY: { min: -120, max: -50 }, speedX: { min: -30, max: 30 }, lifespan: 3600, frequency: 30, scale: { min: 0.8, max: 1.6 }, alpha: { start: 1, end: 0 }, tint: [0xff8a2a, 0xffd060, 0xff3a10], blendMode: 'ADD' }],
      blizzard: ['flake', { x: { min: W - 40, max: W + 80 }, y: { min: -20, max: H }, speedX: { min: -300, max: -170 }, speedY: { min: 30, max: 110 }, lifespan: 3200, frequency: 10, scale: { min: 0.8, max: 1.8 }, alpha: { start: 0.95, end: 0.3 } }]
    }[S.fx];
    if (P) sky.weather = this.add.particles(0, 0, P[0], P[1]).setScrollFactor(0).setDepth(11);
    this.tweens.add({ targets: sky, v: 1, duration: 1800, ease: 'Sine.easeInOut' });
    this.time.delayedCall(500, () => this.skyBolt());                 // the storm breaks with the boss
  }
  skyBolt() {
    const sky = this.sky; if (!sky || this.done) return;
    const S = sky.S, g = sky.bolts, x0 = Phaser.Math.Between(W * 0.12, W * 0.88), y1 = H * Phaser.Math.FloatBetween(0.38, 0.62);
    const fork = (x, y, len, w) => {
      const pts = [[x, y]];
      while (y < len) { x += Phaser.Math.Between(-11, 11); y += Phaser.Math.Between(7, 15); pts.push([x, y]); if (w > 1.5 && Math.random() < 0.14) fork(x, y, y + Phaser.Math.Between(20, 50), w * 0.5); }
      for (const [lw, c, a] of [[w * 3, S.bolt, 0.35], [w, 0xffffff, 1]]) { g.lineStyle(lw, c, a); g.beginPath(); g.moveTo(pts[0][0], pts[0][1]); for (const p of pts) g.lineTo(p[0], p[1]); g.strokePath(); }
    };
    g.clear(); if (!S.cave) fork(x0, -4, y1, 2.2);                    // in the cave the storm is only a cold flash through the ice
    g.setAlpha(1); if (SET.flash) { sky.flash.setAlpha(0.32 * sky.v); this.flashA = 0.4 * sky.v; }
    this.tweens.add({ targets: g, alpha: { from: 1, to: 0 }, duration: 380, ease: 'Expo.easeIn' });
    this.tweens.add({ targets: sky.flash, alpha: 0, duration: 260, delay: 60 });
    this.time.delayedCall(90, () => { if (this.sky && SET.flash) sky.flash.setAlpha(0.18 * sky.v); this.tweens.add({ targets: sky.flash, alpha: 0, duration: 200 }); });   // the second flicker
    this.time.delayedCall(Phaser.Math.Between(250, 700), () => thunder(0.35));      // thunder rolls in after
  }
  tickSky(k, time) {
    const sky = this.sky; if (!sky) return;
    const S = sky.S, v = sky.v, beat = Math.pow(Math.max(0, Math.sin(time * 0.0042)), 12);    // a heartbeat in the vignette
    if (sky.paint) { sky.paint.setAlpha(Math.min(1, v * 1.15)); if (sky.under) sky.paint.x = sky.under.x; }
    sky.veil.setAlpha((sky.paint ? 0.3 : 0.82) * v); sky.horizon.setAlpha((0.32 + Math.sin(time * 0.0017) * 0.06) * v * (S.dim ?? 1)); sky.back.setAlpha(0.9 * v); sky.front.setAlpha(0.75 * v);
    const burn = sky.calm ? Math.max(0, (v - 0.2) / 0.8) : v;          // the sun and its rays go out as the storm clears
    sky.sun.setAlpha((0.75 + Math.sin(time * 0.002) * 0.15) * burn * (S.dim ?? 1)); sky.rays.setAlpha(0.55 * burn * (S.dim ?? 1));
    sky.rays.angle += 0.04 * k; sky.rays.setScale(1.45 + Math.sin(time * 0.0013) * 0.08);
    sky.back.tilePositionX += 0.35 * k; sky.front.tilePositionX += 0.8 * k;
    if (S.cave) { sky.rays.setAlpha(0); sky.sun.setAlpha(0); sky.back.setAlpha(0); sky.front.setAlpha(0); }
    sky.edge.setAlpha((0.45 + beat * 0.35) * v);
    const dim = 1 - 0.32 * v; for (const m of sky.mids) m.setTint(Phaser.Display.Color.GetColor(((m.tint0 >> 16) & 255) * dim, ((m.tint0 >> 8) & 255) * dim, (m.tint0 & 255) * dim));
    if (this.flashA) this.flashA = Math.max(0, this.flashA - 0.03 * k);
    if (!sky.calm && !this.frozen && (sky.boltT -= k) <= 0) { sky.boltT = Phaser.Math.Between(...S.every); this.skyBolt(); }
  }
  // the boss is beaten: the storm breaks up and the sky clears, leaving a little of its colour
  calmSky() {
    const sky = this.sky; if (!sky || sky.calm) return;
    sky.calm = true; sky.weather?.stop();
    this.tweens.add({ targets: sky, v: 0.2, duration: 4500, ease: 'Sine.easeInOut' });
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
    this.fx('shock', x, y + 1, { depth: 8 }).setScale(1.3);
    for (const d of [-1, 1]) {
      this.hazard(x - 8, y - 14, 16, 14, 650, d * 4.2);
      for (let i = 0; i < 4; i++) this.time.delayedCall(i * 130, () => this.fx('dust', x + d * (20 + i * 34), y, { flip: d < 0, depth: 8 }));
    }
    this.cam.shake(260, 0.012); sfx('hit');
  }
  // a boss's entrance: the film bars close in, the world darkens but for a light on the boss, it roars, and its name is
  // written large. Rostam and the boss hold still for those two seconds. (The witch hides her face until unmasked.)
  bossIntro(B) {
    const lv = this.lv;
    if (!lv.epithet || this.resuming) { banner(); return; }
    this.intro = true; this.frozen = true; this.player.setVelocityX(0); B.setVelocityX?.(0);
    $('cine').classList.add('on'); document.body.classList.add('cine');
    const shade = this.add.renderTexture(0, 0, W, H).setOrigin(0).setScrollFactor(0).setDepth(11.5).setAlpha(0);
    const spot = this.make.image({ key: 'lightmask', add: false }).setScale(2.4);
    const draw = () => { if (!shade.active) return; shade.clear(); shade.fill(0x000000, 0.62); spot.setScale(2.2 + Math.sin(this.time.now * 0.01) * 0.06); shade.erase(spot, Math.round(B.x - this.cam.scrollX), Math.round(B.body.center.y - this.cam.scrollY)); };
    this.events.on('update', draw); this.events.once('shutdown', () => { this.events.off('update', draw); $('cine').classList.remove('on'); document.body.classList.remove('cine'); });
    this.tweens.add({ targets: shade, alpha: 1, duration: 450 });
    const a0 = B.alpha;                                               // a foe hiding in the dark shows itself for its entrance
    if (a0 < 0.5) { this.tweens.add({ targets: B, alpha: 1, delay: 420, duration: 250 }); this.time.delayedCall(2200, () => B.active && B.state === 'lurk' && this.tweens.add({ targets: B, alpha: a0, duration: 500 })); }
    this.time.delayedCall(500, () => { sfx('roar'); this.cam.shake(520, 0.012); banner(undefined, undefined, lv.epithet); });
    if (B.lines?.intro) this.time.delayedCall(1100, () => say(B.lines.intro, { once: true }));
    this.time.delayedCall(2500, () => {
      $('cine').classList.remove('on'); document.body.classList.remove('cine');
      this.tweens.add({ targets: shade, alpha: 0, duration: 400, onComplete: () => { this.events.off('update', draw); shade.destroy(); } });
      this.intro = false; if (!this.done) this.frozen = false;
    });
  }
  // invisible walls at both edges of the locked screen, so Rostam and the boss stay in view
  arenaWalls(x0) {
    const left = Math.min(this.levelW - W, x0), wall = x => { const w = this.add.rectangle(x, -400, 8, ROWS * TS + 400, 0, 0).setOrigin(0.5, 0); this.physics.add.existing(w, true); return w; };   // Rostam is held by position in update(), the boss by this body
    this.wall = wall(Math.max(x0, left + 6) - 4); this.wallR = wall(left + W - 2);
    const pb = this.player.body, dx = this.wall.x + 6 - pb.left; if (dx > 0) pb.reset(this.player.x + dx, this.player.y);   // a wall closing on Rostam would push him out of the arena
  }
  // lock the camera on an arena, raise the boss bar and the title card
  arena(x0, boss, max) {
    this.bossOn = true;
    this.cam.stopFollow(); this.tweens.add({ targets: this.cam, scrollX: Math.min(this.levelW - W, x0), duration: 700, ease: 'Sine.easeInOut' });
    this.arenaWalls(x0);
    if (boss.body.allowGravity) this.placeBoss(boss);
    boss.hp = boss.max = gentle() ? Math.ceil(max * 0.7) : legend() ? Math.ceil(max * 1.35) : max; this.boss = boss;
    this.physics.add.collider(boss, this.layer, null, onFloor); this.physics.add.collider(boss, [this.wall, this.wallR]);
    $('boss').classList.remove('hidden'); this.bossBar(); this.stormSky(); this.bossIntro(boss);
  }
  // a big boss falls: flash, smoke and light, then the labour is won
  bossFall(B, then) {
    this.drums?.remove();
    const at = this.bossDeath(B); this.chargeWarn?.destroy(); this.stars?.destroy(); this.stars = null;
    $('boss').classList.add('hidden'); this.wall?.destroy(); this.wallR?.destroy(); this.hazards = []; this.shots.clear(true, true);
    this.time.delayedCall(at + 200, () => this.cam.startFollow(this.player, true, 0.12, 0.12, W / 2, H / 2));
    this.time.delayedCall(at + 900, () => then ? then() : this.reward(B.x));
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
    d.calm = () => d.state === 'exposed'; d.open = d.calm;
    d.immune = () => d.alpha < 0.5; d.immuneMsg = 'Your mace passes through shadow. Wait for Rakhsh to warn you!';
    d.keep = KEEP3; d.ai = () => this.dragonAI(); d.onDown = () => this.bossFall(d);
    this.arena(112 * TS, d, 12);
    toast(this.mounted ? 'Rakhsh snorts and tosses his head beneath you. Something vast stirs in the dark...' : 'Rakhsh gallops up beside you, snorting. Something vast stirs in the dark...');
    hint('Rakhsh can sense the dragon. <b>When he rears and neighs, the dragon shows itself: strike it then.</b> While it hides, your blows pass through. Jump its fire.');
  }
  dragonPlan(d) {
    const read = this.bossRead(d), move = this.bossTactic(d, [
      { move: 'breath', weight: read.distance < 155 ? 3 : 0.3 },
      { move: 'lunge', weight: read.ledge || read.air > 0.45 ? 0.6 : read.distance > 90 ? 3 : 1, cooldown: 2000 },
      { move: 'embers', weight: read.ledge || read.camp > 2000 || read.distance > 180 ? 4 : 1.2, cooldown: 3300 }
    ]);
    this.bossAim(d, { breath: 'Glowing throat: flame breath', lunge: 'Coiled body: a straight lunge', embers: 'Burning jaws: fireballs' }[move]);
    return move;
  }
  dragonAI() {
    const d = this.boss, p = this.player, r = this.rakhsh; d.tm -= this.bossStep();
    if (r && r.body.velocity.x > 0 && r.x >= this.rakhshAt.x) { r.setVelocityX(0); r.anims.stop(); r.setFrame(0); }
    const toP = Math.sign(p.x - d.x) || -1; if (d.state === 'lurk') d.dir = toP; d.setFlipX(d.dir < 0);
    const seen = d.hp <= d.max / 2;                                   // once wounded, God lets Rostam see it
    if (seen && !this.dragonSeen) { this.dragonSeen = true; this.tweens.killTweensOf(d); d.setAlpha(1); banner('خدا', 'The dragon can hide no more'); hint('The dragon can hide no more. <b>Strike it whenever you can</b>, and jump its fire. Its <b>golden flash warns of a follow-up lunge</b>.'); }
    if (d.state === 'lurk') {
      // Reposition out of a boundary before stalking; do not walk against the keep line.
      const left = d.keep * TS, right = this.wallR.x - 45;
      if (!d.regroup && ((d.x < left + 10 && toP < 0) || (d.x > right - 10 && toP > 0))) d.regroup = d.x < left + 10 ? left + 65 : right - 65;
      if (d.regroup && Math.abs(d.regroup - d.x) < 8) d.regroup = null;
      d.setVelocityX(d.regroup ? Math.sign(d.regroup - d.x) * (seen ? 72 : 58) : Math.abs(p.x - d.x) > 70 ? toP * (seen ? 62 : 46) : 0);
      if (d.tm <= 0) {
        // Rakhsh rears and neighs: the dragon is revealed
        if (r) { r.play('rakhsh-rear'); r.once('animationcomplete', () => { r.anims.stop(); r.setFrame(0); }); } else this.rear(); sfx('neigh');
        this.tweens.add({ targets: d, alpha: 1, duration: 280 }); this.cam.flash(160, 255, 200, 140); sfx('roar');
        d.nextMove = this.dragonPlan(d); d.state = 'reveal'; d.tm = seen ? 36 : 42; d.setVelocityX(0);
      }
    } else if (d.state === 'reveal') {
      if (d.tm <= 0) {
        const move = d.nextMove || this.dragonPlan(d); d.nextMove = null;
        if (move === 'embers') { d.state = 'embers'; d.tm = 74; d.fired = false; d.play('dragon-fire'); }
        else if (move === 'breath') { d.intent = 'Flame breath'; d.state = 'breath'; d.tm = 75; d.play('dragon-fire'); d.fired = false; }
        else { d.intent = 'The dragon lunges'; d.state = 'lunge'; d.tm = 42; d.setVelocityX(d.dir * 250); }
      }
    } else if (d.state === 'embers') {
      d.setVelocityX(0); d.setTint(0xffb060);
      if (!d.fired && d.tm < 36) {
        d.fired = true; d.clearTint();
        const x = d.x + d.dir * 46, y = d.body.top + 14, angle = Math.atan2((d.aimY ?? p.y) - y, d.aimX - x);
        for (let i = 0; i < (seen ? 3 : 2); i++) {
          const a = angle + (i - (seen ? 1 : 0.5)) * 0.24;
          const sh = this.shoot(x, y, Math.cos(a) * 150, Math.sin(a) * 150, 'fx-orb', { life: 1800 }); sh.play('fx-orb'); sh.setTint(0xff8738); this.light(sh, 0.6);
        }
        sfx('fire');
      }
      if (d.tm <= 0) { d.clearTint(); d.play('dragon-move'); d.state = 'exposed'; d.tm = 66; d.intent = ''; }
    } else if (d.state === 'breath') {
      d.setVelocityX(0);
      if (!d.fired && d.tm < 50) {
        d.fired = true; const dir = d.flipX ? -1 : 1, mx = d.x + dir * 46, my = d.body.top + 8;
        const f = this.fx('breath', mx, my, { flip: dir < 0, depth: 9 }); this.light(f, 1.4, 0.15);
        d.breathUntil = this.time.now + 950; this.hazard(dir > 0 ? mx : mx - 120, my - 22, 120, 44, 950); sfx('roar'); this.cam.shake(500, 0.006);
        this.time.delayedCall(950, () => f.destroy());
      }
      if (d.tm <= 0 && this.time.now >= (d.breathUntil || 0)) { d.play('dragon-move'); if (seen && this.bossTactic(d, [{ move: 'follow', weight: this.bossRead(d).distance > 80 ? 2 : 0.8 }, { move: 'recover', weight: 1 }]) === 'follow') { this.bossAim(d, 'Golden flash: follow-up lunge'); d.state = 'coil'; d.tm = 36; d.anims.stop(); d.setFrame(0); d.setTint(0xffdc9a); } else { d.state = 'exposed'; d.tm = 85; } }
    } else if (d.state === 'coil') {
      d.setVelocityX(0); if (d.tm <= 0) { d.clearTint(); d.state = 'lunge'; d.tm = 36; d.play('dragon-move'); d.setVelocityX(d.dir * 250); }
    } else if (d.state === 'lunge') {
      if (d.tm <= 0 || (d.dir < 0 ? d.body.blocked.left || d.hitKeep : d.body.blocked.right)) { d.setVelocityX(0); d.state = 'exposed'; d.tm = seen ? 50 : 85; this.cam.shake(200, 0.01); }
    } else if (d.state === 'exposed') {
      d.setVelocityX(0);
      if (d.tm <= 0) { d.state = 'lurk'; d.tm = (seen ? 55 : 95) + Math.random() * 30; if (!seen) this.tweens.add({ targets: d, alpha: 0.05, duration: 600 }); }
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
    w.calm = () => w.state === 'reel'; w.open = w.calm;
    w.onBack = () => {
      this.damage(w, 1, true); if (w.hp <= 0) return;
      w.state = 'reel'; w.tm = 70; w.intent = ''; w.setVelocity(0); w.setTint(0xffdfa0); w.anims.stop();
      this.stars?.destroy(); this.stars = this.fx('stun', w.x, w.body.top - 4, { depth: 10, follow: w });
      hint('Her curse rebounds! <b>She is dazed: close in and strike.</b>');
    };
    w.lines = { intro: 'witch1' }; w.ai = () => this.witchAI(); w.onDown = () => this.bossFall(w);
    this.arena(112 * TS, w, 10); $('bossName').textContent = 'The Lady of the Garden';
    this.light(w, 1.2); banner('ضیافت', 'The Feast');
    toast('A lovely woman steps from the pavilion and offers you a cup of wine. Stand near her and strike to give thanks in the name of God.');
    hint('The lady offers you wine. <b>Stand close to her and strike</b> to give thanks in the name of God, and see what she really is.');
  }
  unmask() {
    // at the name of God her true face shows
    const w = this.witch; this.unmasked = true; this.frozen = true; this.player.setVelocity(0);
    banner('به نامِ یزدان', 'In the name of God'); this.cam.flash(500, 255, 255, 255); sfx('roar'); this.time.delayedCall(700, () => say('witch2'));
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
    w.tm -= this.bossStep(); const toP = Math.sign(p.x - w.x) || -1; if (w.state === 'float') w.dir = toP; w.setFlipX((w.dir || toP) < 0);
    const hurt = w.hp <= w.max / 2;
    if (hurt && !w.summoned && w.state === 'float') { w.summoned = true; w.tm = Math.max(w.tm, 90); for (const dx of [-120, 120]) { const x = Phaser.Math.Clamp(w.x + dx, 113 * TS, this.levelW - 30); this.fx('poof', x, 13 * TS); this.spawnFoe('serpent', x, 14 * TS); } toast('The witch calls serpents from the roses!'); }
    const y = w.baseY + Math.sin(this.time.now * 0.004) * 8;
    if (w.state === 'float') {
      const target = Number.isFinite(w.tx) ? Phaser.Math.Clamp(w.tx, this.wall.x + 55, this.wallR.x - 55) : w.x;
      w.setVelocity(Phaser.Math.Clamp((target - w.x) * 1.6, -110, 110), (y - w.y) * 3);
      if (w.tm <= 0) {
        const read = this.bossRead(w), move = this.bossTactic(w, [
          { move: 'aimed', weight: read.camp > 1800 ? 4 : 2 },
          { move: 'fan', weight: read.air > 0.35 ? 3 : 1.3, cooldown: 1600 },
          { move: 'escape', weight: read.distance < 100 || read.pressure > 0.2 ? 5 : 0.6, cooldown: 5000 }
        ]);
        this.bossAim(w, move === 'escape' ? 'Gathering mist: she will vanish' : move === 'fan' ? 'Spread curse: find the gap' : 'Aimed curse: move, or strike it back');
        w.castMove = move; w.state = move === 'escape' ? 'vanish' : 'cast'; w.tm = move === 'escape' ? 32 : 46; w.play('hag-cast'); w.cast = false;
      }
    } else if (w.state === 'cast') {
      w.setVelocity(0, (y - w.y) * 3);
      if (!w.cast && w.tm < 18) {
        w.cast = true; const n = w.castMove === 'fan' ? 3 : hurt ? 2 : 1;
        for (let i = 0; i < n; i++) {
          const a = Math.atan2((w.aimY ?? p.y) - 8 - w.y, (w.aimX ?? p.x) - w.x) + (i - (n - 1) / 2) * (w.castMove === 'fan' ? 0.4 : 0.18);
          const sh = this.shoot(w.x + (w.dir || toP) * 18, w.y - 6, Math.cos(a) * 125, Math.sin(a) * 125, 'fx-orb', { life: 3600 });
          sh.play('fx-orb'); sh.setRotation(a); this.light(sh, 0.5); sh.curse = true;      // a curse: the mace can turn it back
        }
        sfx('swing');
      }
      if (w.tm <= 0) {
        w.state = 'float'; w.intent = ''; w.tm = (hurt ? 45 : 65) + Math.random() * 25;
        w.tx = Phaser.Math.Clamp(p.x + (Math.random() < 0.5 ? -1 : 1) * 125, this.wall.x + 55, this.wallR.x - 55);
      }
    } else if (w.state === 'reel') {
      w.setVelocity(0); this.stars?.setPosition(w.x, w.body.top - 4);
      if (w.tm <= 0) { w.clearTint(); this.stars?.destroy(); this.stars = null; w.state = 'float'; w.tm = 54; w.tx = Phaser.Math.Clamp(p.x + (p.x < w.x ? 120 : -120), this.wall.x + 55, this.wallR.x - 55); }
    } else if (w.state === 'vanish') {
      w.setVelocity(0); w.setTint(0xd8a0ff);
      if (w.tm <= 0) { w.clearTint(); w.state = 'blink'; w.tm = 30; this.fx('poof', w.x, w.y + 10, { depth: 10 }); w.setAlpha(0); w.body.enable = false; }
    } else if (w.state === 'blink') {
      if (w.tm <= 0) {
        const L = this.wall.x + 55, R = this.wallR.x - 55, spots = [L, (L + R) / 2, R];
        const candidates = spots.filter(x => Math.abs(x - p.x) > 105 && Math.abs(x - w.x) > 60);
        const x = candidates[Math.floor(Math.random() * candidates.length)] ?? spots.sort((a, b) => Math.abs(b - p.x) - Math.abs(a - p.x))[0];
        w.body.reset(x, w.baseY); w.body.enable = true; this.fx('poof', x, w.y + 10, { depth: 10 });
        this.tweens.add({ targets: w, alpha: 1, duration: 200 }); w.state = 'float'; w.tm = 54; w.tx = x;
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
    o.onBack = () => { this.damage(o, 1, true); if (o.hp > 0) { o.state = 'open'; o.tm = 75; o.intent = ''; o.anims.stop(); o.setVelocityX(0); o.setTint(0xffd0a0); } };
    o.keep = KEEP5; o.lines = { intro: 'olad1' }; o.ai = () => this.oladAI(); o.onDown = () => this.oladYields();
    this.arena(112 * TS, o, 9); this.olad = o;
    toast('Olad rides out to meet you, sword drawn: "Who are you, to cross the marches of Mazandaran?"');
    hint('Olad may <b>slash, thrust or throw a knife</b>; the boss bar warns which. Strike a knife to parry it. His <b>shield blocks you from the front</b>. When he <b>flashes, step back</b> from his sword; then he glows and lowers his guard: <b>strike!</b> Or <b>jump twice</b> over him and hit his back. Strike when the <b>gold arrow</b> shows.');
  }
  oladAI() {
    const o = this.olad, p = this.player; o.tm -= this.bossStep(); const d = p.x - o.x;
    if (o.state === 'walk' || o.state === 'guard') { o.dir = Math.sign(d) || -1; o.setFlipX(o.dir < 0); }
    if (o.state === 'walk') {
      const left = o.keep * TS, right = this.wallR.x - 45;
      if (!o.regroup && ((o.x < left + 12 && o.dir < 0) || (o.x > right - 12 && o.dir > 0))) o.regroup = o.x < left + 12 ? left + 70 : right - 70;
      if (o.regroup && Math.abs(o.regroup - o.x) < 8) { o.regroup = null; o.tm = Math.max(o.tm, 24); }
      o.setVelocityX((o.regroup ? Math.sign(o.regroup - o.x) : o.dir) * 78);
      if (o.anims.currentAnim?.key !== 'olad-walk' || !o.anims.isPlaying) o.play('olad-walk');
      if (!o.regroup && (Math.abs(d) < 70 || o.tm <= 0)) { const read = this.bossRead(o), retreatRoom = o.dir < 0 ? right - o.x : o.x - left; o.attackMove = this.bossTactic(o, [
        { move: 'slash', weight: read.ledge ? 0 : read.distance < 95 ? 3 : 0.5 },
        { move: 'knife', weight: read.ledge || read.camp > 2200 ? 5 : read.distance > 150 ? 2 : 0, cooldown: 3500 },
        { move: 'thrust', weight: read.ledge ? 0 : read.distance > 90 ? 4 : 1.1, cooldown: 2200 },
        { move: 'retreat', weight: retreatRoom > 80 ? (read.ledge ? 2 : read.pressure > 0.2 ? 4 : 0.5) : 0, cooldown: 4000 }
      ]);
      if (!o.attackMove) { o.tm = 24; return; }
      this.bossAim(o, o.attackMove === 'knife' ? 'Knife drawn: dodge or parry' : o.attackMove === 'thrust' ? 'Sword levelled: a long thrust' : o.attackMove === 'retreat' ? 'Olad gives ground' : 'Sword raised: watch the swing');
      o.comboLeft = o.hp <= o.max / 2 && Math.random() < 0.65 ? 1 : 0; o.state = o.attackMove === 'knife' ? 'knifeReady' : o.attackMove === 'retreat' ? 'retreat' : 'ready'; o.tm = o.attackMove === 'knife' ? 48 : o.attackMove === 'thrust' ? 42 : 34; o.setVelocityX(0); o.anims.stop(); o.setFrame(0); }
    } else if (o.state === 'knifeReady') {
      o.setVelocityX(0); o.setTint(0xb8e8ff);
      if (o.tm <= 0) { o.clearTint(); o.state = 'knife'; o.tm = 35; o.play('olad-slash');
        const x = o.x + o.dir * 18, y = o.body.top + 14, a = Math.atan2(o.aimY - y, o.aimX - x);
        const sh = this.shoot(x, y, Math.cos(a) * 180, Math.sin(a) * 180, 'knife', { life: 2400 }); sh.setRotation(a); sh.curse = true; sfx('swing');
      }
    } else if (o.state === 'knife') {
      o.setVelocityX(0); if (o.tm <= 0) { o.state = 'open'; o.tm = 65; o.intent = ''; o.setTint(0xffd0a0); }
    } else if (o.state === 'retreat') {
      o.setVelocityX(-o.dir * 105); if (o.tm <= 0 || (o.dir > 0 ? o.body.blocked.left : o.body.blocked.right)) { const ledge = this.bossRead(o).ledge; o.state = ledge ? 'knifeReady' : 'ready'; o.tm = ledge ? 48 : 40; o.attackMove = ledge ? 'knife' : 'thrust'; this.bossAim(o, ledge ? 'Knife drawn: dodge or parry' : 'Sword levelled: a long thrust'); o.setVelocityX(0); }
    } else if (o.state === 'ready') {
      // he draws back his sword, flashing: a moment to step out of reach
      o.setVelocityX(0); o.setTintFill(Math.floor(o.tm / 4) % 2 ? 0xffffff : 0xffe0a0); if (o.tm % 8 < 4) o.clearTint();
      if (o.tm <= 0) { o.clearTint(); o.state = 'slash'; o.tm = 30; o.setVelocityX(o.dir * (o.attackMove === 'thrust' ? 110 : 40)); o.play('olad-slash'); sfx('swing'); o.hit = false; }
    } else if (o.state === 'slash') {
      if (!o.hit && o.tm < 20) { o.hit = true; const reach = o.attackMove === 'thrust' ? 68 : 42; this.hazard(o.dir > 0 ? o.x + 4 : o.x - reach - 4, o.body.top + 4, reach, 30, 140); }
      // after the swing his sword hangs low and he is open for a moment
      if (o.tm <= 0 && o.comboLeft > 0) { o.comboLeft--; o.attackMove = 'slash'; o.intent = 'Second swing: keep clear'; o.state = 'ready'; o.tm = 36; o.setVelocityX(0); o.anims.stop(); o.setFrame(0); hint('Olad draws back for a <b>second swing</b>. Keep clear, then strike!'); }
      else if (o.tm <= 0) { o.state = 'open'; o.tm = 84; o.intent = ''; o.setVelocityX(0); o.anims.stop(); o.setFrame(0); o.setTint(0xffd0a0); hint('Olad\'s guard is down: <b>strike now!</b>'); }
    } else if (o.state === 'open') {
      o.setVelocityX(0); if (o.tm <= 0) { o.clearTint(); o.state = 'guard'; o.tm = 30 + Math.random() * 20;
        hint('Shield up again. When he <b>flashes, step back</b>, then <b>strike while he glows</b>, or leap over him and hit his back.'); }
    } else if (o.state === 'guard') {
      o.setVelocityX(0); if (o.tm <= 0) { o.state = 'walk'; o.tm = 90; const room = o.dir < 0 ? this.wallR.x - o.x : o.x - o.keep * TS; if (room > 90 && Math.random() < 0.25) o.setVelocity(-o.dir * 120, -170); }
    }
  }
  oladYields() {
    // Olad is not slain: he kneels, Rostam's lasso binds him, and he becomes the guide
    this.calmSky();
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
    this.time.delayedCall(1200, () => { toast('Olad yields: "Spare me, and I will lead you to Arzhang Div and to the White Div\'s cave."'); say('olad2'); });
    this.time.delayedCall(3400, () => { this.frozen = false; rope.clear().lineStyle(2, 0xc8a060, 1).strokeEllipse(o.x, o.y - 4, 30, 14); this.reward(o.x); });
  }
  /* ---- Khan VI: the horde, and Arzhang Div ---- */
  startHorde() {
    // gates of fire close behind and before Rostam while the Divs come in waves
    this.horde = { wave: 0, live: [] }; const x = this.hordeAt.x;
    this.gates = [x - 13 * TS, x + 13 * TS].map((gx, i) => {
      const r = this.add.rectangle(gx, -400, 12, ROWS * TS + 400, 0, 0).setOrigin(0.5, 0); this.physics.add.existing(r, true); this.physics.add.collider(this.foes, r);
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
    banner('سپاهِ دیوان', 'The Horde of the Divs'); hint('The gates are shut! <b>Defeat six waves of Divs</b>. <b>Jump twice</b> to reach the high platform, drop behind a Div to strike, then leap back up.'); this.drums = this.time.addEvent({ delay: 420, loop: true, callback: () => sfx('drum') });
    this.time.delayedCall(900, () => this.hordeWave());
  }
  hordeWave() {
    const h = this.horde, x = this.hordeAt.x, list = HORDE[h.wave]; h.wave++;
    toast(`Wave ${h.wave} of ${HORDE.length}: ${h.wave === 1 ? 'the Divs pour in!' : h.wave === HORDE.length ? 'the last of them!' : 'more come!'}`);
    list.forEach((k, i) => this.time.delayedCall(i * 420, () => {
      const side = i % 2 ? 1 : -1, sx = x + side * 10 * TS;
      const spawnX = Math.abs(this.player.x - sx) < 44 ? Phaser.Math.Clamp(sx + (this.player.x >= sx ? -52 : 52), x - 11 * TS, x + 11 * TS) : sx;
      const mark = this.add.ellipse(spawnX, 14 * TS - 2, 34, 8, 0xffb84d, 0.45).setStrokeStyle(1, 0xffe7a2).setDepth(7);
      this.tweens.add({ targets: mark, alpha: 0.15, yoyo: true, repeat: 2, duration: 75 });
      this.time.delayedCall(450, () => {
      mark.destroy(); if (this.horde !== h || this.done) return;
      this.fx('poof', spawnX, 13 * TS + 8, { depth: 10 });
      const f = this.spawnFoe({ w: 'divwarrior', f: 'firediv', g: 'ghul' }[k] || 'div', spawnX, 14 * TS); f.dir = -side; f.setFlipX(f.dir < 0);
      f.post = x + (i - (list.length - 1) / 2) * 4 * TS;          // spread out across the arena
      h.live.push(f);
      });
    }));
    h.spawning = this.time.now + list.length * 420 + 650;
  }
  hordeTick() {
    const h = this.horde;
    if (this.time.now < h.spawning) return;
    if (h.live.every(f => !f.active || !f.body.enable)) {
      if (h.wave < HORDE.length) { h.live = []; this.hordeWave(); return; }
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
    this.fit(a, 'arzhang'); a.play('arzhang-walk'); a.state = 'walk'; a.tm = 90; a.dir = -1; a.keep = KEEP6;
    // his hide turns every blow until he rests on his axe after his strikes: that is the opening
    a.immune = () => a.state !== 'rest' && a.state !== 'dazed'; a.calm = () => !a.immune(); a.contact = () => a.state === 'charge';
    a.immuneMsg = 'Arzhang shrugs off the blow. Dodge his two strikes, then hit him while he rests on his axe.';
    a.faceRostam = true; a.lines = { intro: 'arzhang1', rage: 'arzhang2' }; a.ai = () => this.arzhangAI(); a.onDown = () => { a.stompWarn?.destroy(); this.floorWarn?.destroy(); this.highWarn?.destroy(); this.chargeWarn?.destroy(); this.stars?.destroy(); this.stars = null; this.bossFall(a); };
    this.arena(124 * TS, a, 12); this.light(a, 2); sfx('roar'); this.cam.shake(500, 0.008);
    // red glows warn where the axe will fall: along the floor, or across the platforms
    const glow = (y, h) => this.add.rectangle(124 * TS, y, 30 * TS, h, 0xff3010, 1).setOrigin(0, 0.5).setBlendMode(Phaser.BlendModes.ADD).setAlpha(0).setDepth(3);
    this.floorWarn = glow(14 * TS - 10, 20); this.highWarn = glow(9.6 * TS, 3.2 * TS);   // the high band ends above a standing man's head
    this.drums = this.time.addEvent({ delay: 500, loop: true, callback: () => sfx('drum') });
    toast('Arzhang Div rises from his throne of bones: "Who dares walk into my camp?"');
    hint('Watch the red glow. <b>Floor glows: leap onto a platform.</b> <b>Platforms glow: drop to the ground.</b> Count his <b>two or three axe blows</b>, or jump his close stomp. When he rests: <b>strike!</b>.');
  }
  // he roams the middle, then strikes twice (a floor split, a sweep across the platforms, or both), then rests
  arzhangAI() {
    const a = this.boss, p = this.player; a.tm -= this.bossStep(); const hurt = a.hp <= a.max / 2;
    const up = p.body.bottom < 13 * TS;                                       // Rostam is up on a platform
    if (this.charge(a, 'arzhang-walk')) return;
    if (a.state === 'walk') {
      if (a.tm > 20 && this.tryCharge(a)) return;
      // he stalks Rostam to axe's reach (never near the platform) and plants his feet there
      if (this.stalk(a, p, 80, KEEP6, 151, hurt ? 64 : 52, 'arzhang-walk') || (a.x < KEEP6 * TS + 12 && p.x < a.x) || (a.x > 151 * TS - 12 && p.x > a.x)) a.tm = Math.min(a.tm, hurt ? 14 : 24);
      if (a.tm <= 0) {
        const read = this.bossRead(a), choice = this.bossTactic(a, [
          { move: 'combo', weight: 3 }, { move: 'stomp', weight: read.distance < 100 && !read.ledge ? 3 + read.pressure * 3 : 0, cooldown: 3400 }
        ]);
        if (choice === 'stomp') { this.bossAim(a, 'Axe held low: jump the close shockwave'); a.state = 'stompReady'; a.tm = 46; a.stompX = a.x; a.stompWarn?.destroy(); a.stompWarn = this.add.rectangle(a.stompX - 82, 14 * TS - 12, 164, 24, 0xff9a45, 0.3).setOrigin(0, 0.5).setDepth(3); a.setVelocityX(0); a.anims.stop(); a.setTint(0xffb070); return; }
        // the first blow goes where Rostam is; the second often the other way, so he must switch
        const first = this.bossTactic(a, [{ move: 'sweep', weight: up || read.air > 0.45 ? 4 : 1 }, { move: 'split', weight: up ? 1 : 4 }]), other = first === 'sweep' ? 'split' : 'sweep';
        const preferred = Math.random() < (hurt ? 0.75 : 0.6) ? other : first; const follow = this.bossChoice(a, preferred, preferred === first ? other : first); a.combo = hurt && Math.random() < 0.35 ? [first, follow, follow === 'split' ? 'sweep' : 'split'] : [first, follow]; a.intent = a.combo.length === 3 ? 'Three axe blows: watch each red band' : 'Two axe blows: watch each red band'; this.windUp(a, first === 'split' ? Math.max(hurt ? 70 : 80, this.reachT(127, 131)) : hurt ? 70 : 80);   // time to reach the platform
      }
    } else if (a.state === 'stompReady') {
      a.setVelocityX(0); a.stompWarn?.setAlpha(0.18 + 0.3 * Math.abs(Math.sin(a.tm * 0.25))); if (a.tm <= 0) { a.stompWarn?.destroy(); a.stompWarn = null; a.clearTint(); this.hazard((a.stompX ?? a.x) - 82, 14 * TS - 25, 164, 25, 200); this.fx('shock', a.x, 14 * TS, { depth: 8 }); a.state = 'stomp'; a.tm = 18; sfx('hit'); }
    } else if (a.state === 'stomp') {
      if (a.tm <= 0) { a.state = 'rest'; a.tm = 80; a.intent = ''; a.setTint(0xffc0a0); this.stars = this.fx('stun', a.x, a.body.top - 4, { depth: 10, follow: a }); }
    } else if (a.state === 'raise') {
      const w = a.combo[0] === 'split' ? this.floorWarn : this.highWarn; w.setAlpha(0.18 + 0.32 * Math.abs(Math.sin(a.tm * 0.25)));
      if (a.tm <= 0) { a.state = 'smash'; a.tm = a.combo[0] === 'split' ? 34 : 30; a.combo[0] === 'split' ? this.splitFloor(a) : this.sweepHigh(a); a.combo.shift(); }
    } else if (a.state === 'smash') {
      if (a.tm <= 0) {
        if (a.combo.length) this.windUp(a, a.combo[0] === 'split' ? Math.max(hurt ? 52 : 60, this.reachT(127, 131)) : hurt ? 52 : 60);   // the second blow comes quicker
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
      b.setVelocityX(0); Math.floor(b.tm / 5) % 2 ? b.setTint(0xff7060) : b.clearTint();
      this.chargeWarn?.setAlpha(0.2 + 0.35 * Math.abs(Math.sin(b.tm * 0.3)));
      if (b.tm <= 0) { b.clearTint(); b.state = 'charge'; b.tm = 90; b.play(walk); b.anims.timeScale = 2.6; this.chargeWarn?.destroy(); this.chargeWarn = null; sfx('roar'); this.cam.shake(200, 0.006); }
      return true;
    }
    if (b.state === 'charge') {
      b.setVelocityX(b.dir * 270); if (b.tm % 6 === 0) this.fx('dust', b.x - b.dir * 20, b.body.bottom, { flip: b.dir < 0, depth: 8 });
      // toward the corner platform he digs in his heels short of it: no daze there, and he turns on Rostam at once
      if (b.keep && b.dir < 0 && b.x <= b.keep * TS) {
        b.x = b.keep * TS; b.setVelocityX(0); b.anims.timeScale = 1; b.state = 'walk'; b.tm = 12; b.chargeCd = 300; b.throwCd = 0; this.ledgeT = 80;
        this.fx('dust', b.x - 24, b.body.bottom, { flip: true, depth: 8 }); this.cam.shake(160, 0.006); return true;
      }
      if (b.dir < 0 ? b.body.blocked.left : b.body.blocked.right) {
        // into the wall: the cave shakes and he reels
        b.setVelocityX(0); b.anims.timeScale = 1; b.anims.stop(); b.setFrame(0); b.state = 'dazed'; b.tm = 110; b.setTint(0xffe0a0);
        this.cam.shake(450, 0.018); sfx('hit'); sfx('drum'); this.fx('dust', b.x + b.dir * 30, b.body.bottom, { depth: 8 });
        this.stars = this.fx('stun', b.x, b.body.top - 4, { depth: 10, follow: b }); hint('He crashed into the wall and is <b>dazed: strike him now!</b>');
      } else if (b.tm <= 0) { b.setVelocityX(0); b.anims.timeScale = 1; b.state = 'walk'; b.tm = 70; b.chargeCd = 360; }
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
    const p = this.player, d = p.x - b.x; b.chargeCd = (b.chargeCd ?? 240) - this.bossStep();
    if (b.chargeCd > 0 || Math.abs(d) < 100 || p.body.bottom < 13 * TS) return false;
    if (this.bossTactic(b, [{ move: 'charge', weight: Math.abs(d) > 170 ? 3 : 1.2, cooldown: 5000 }, { move: 'advance', weight: 2 }]) !== 'charge') { b.chargeCd = 75; return false; }
    b.intent = 'Red path: a committed charge'; b.state = 'brace'; b.tm = 46; b.dir = Math.sign(d); b.setFlipX(b.dir < 0); b.anims.stop(); b.setFrame(0); sfx('roar');
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
  reachT(c0, c1) { const x = this.player.x, d = x < c0 * TS ? c0 * TS - x : x > c1 * TS ? x - c1 * TS : 0; return d / 2.1 + 52; }   // the run there, and a double jump up
  windUp(a, tm) { a.intent = (a.combo[0] === 'split' ? 'Ground split: climb or jump' : 'High sweep: drop to the floor') + ` · ${a.combo.length} blow${a.combo.length > 1 ? 's' : ''} left`; a.state = 'raise'; a.tm = tm; a.setVelocityX(0); a.play('arzhang-smash'); a.anims.pause(); a.setFrame(1); sfx('roar'); }
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
  iceStrike(x, owner = this.boss) {
    const alive = () => !this.done && this.boss === owner && owner?.active && owner.hp > 0 && owner.body.enable;
    if (!alive()) return;
    const r = this.groundAt(x); if (r == null) return; const y = r * TS;
    // drawn above the cave's darkness, so the warning is never hidden
    const mark = this.add.image(x, y - 2, 'glow').setScale(0.7, 0.3).setTint(0xbfe8ff).setBlendMode(Phaser.BlendModes.ADD).setDepth(12);
    const beam = this.add.rectangle(x, this.cam.scrollY, 18, y - this.cam.scrollY, 0xd8f2ff, 0.5).setOrigin(0.5, 0).setBlendMode(Phaser.BlendModes.ADD).setDepth(12);
    this.tweens.add({ targets: [mark, beam], alpha: 0.35, yoyo: true, repeat: 4, duration: 110 });
    this.time.delayedCall(1000, () => {
      mark.destroy(); beam.destroy(); if (!alive()) return;
      const ic = this.add.image(x, this.cam.scrollY - 20, 'icicle').setOrigin(0.5, 1).setDepth(12).setScale(1.4);
      this.tweens.add({ targets: ic, y: y + 4, duration: 140, ease: 'Quad.easeIn', onComplete: () => {
        if (!alive()) { ic.destroy(); return; }
        this.hazard(x - 12, y - 46, 24, 46, 200); this.cam.shake(140, 0.008); sfx('shatter'); this.shatter(ic, { step: 1, power: 0.6 }); ic.destroy();
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
      thunder(0.8);
    });
  }
  groundAt(x) { for (let r = 2; r < ROWS; r++) { const t = this.layer.getTileAtWorldXY(x, r * TS + 2); if (t && t.collides) return r; } return null; }
  startWhiteDiv() {
    const w = this.physics.add.sprite(Math.min(this.whiteAt.x, 171 * TS), this.whiteAt.y - 60, 'whitediv-walk', 0).setDepth(4).setFlipX(true);
    this.fit(w, 'whitediv'); w.play('whitediv-walk'); w.state = 'walk'; w.tm = 120; w.dir = -1; w.throwCd = 90; w.keep = KEEP7;
    // his hide of snow turns every blow, until his club is caught fast in the ice after a slam
    w.immune = () => !['stuck', 'dazed', 'spent'].includes(w.state); w.calm = () => !w.immune(); w.contact = () => w.state === 'charge';   // his blows hurt, not his hide
    w.immuneMsg = 'The blow glances off his hide of snow. Strike while his club is stuck, after a charge crashes, or while he recovers from calling ice.';
    w.faceRostam = true; w.lines = { intro: 'white1', rage: 'white2' }; w.ai = () => this.whiteAI(); w.onDown = () => { say('white3'); this.floorWarn?.destroy(); this.chargeWarn?.destroy(); this.stars?.destroy(); this.stars = null; this.bossFall(w, () => this.whiteFallen()); };
    this.arena(146 * TS, w, 12); this.light(w, 2.4); sfx('roar'); this.cam.shake(700, 0.01); this.ledgeT = 0;
    // a blue glow along the floor warns of the slam
    this.floorWarn = this.add.rectangle(146 * TS, 14 * TS - 10, 30 * TS, 20, 0x80c8ff, 1).setOrigin(0, 0.5).setBlendMode(Phaser.BlendModes.ADD).setAlpha(0).setDepth(3);
    toast('The White Div rises from the dark like a mountain of snow: "So, the son of Zal comes at last."');
    hint('When <b>the floor glows blue</b> he is about to slam: <b>jump onto the ice ledge in the corner</b>. Then his club is <b>stuck in the ice: drop down and strike!</b>');
  }
  // one clear loop: he stalks Rostam, raises his club (the floor glows), slams the whole floor of the cave, and his club
  // sticks in the ice: the opening. The ledges are safe from the slam, but stay on one too long and he hurls a boulder
  whiteAI() {
    const w = this.boss, p = this.player; w.tm -= this.bossStep(); const mad = w.hp <= w.max / 2;
    if (mad && !w.mad) { w.mad = true; w.setTint(0xffd0d0); sfx('roar'); this.cam.shake(600, 0.012); banner('خشمِ دیو', 'The White Div rages'); }
    const up = p.body.bottom < 13 * TS && p.body.blocked.down; this.ledgeT = up ? this.ledgeT + this.bossStep() : 0;
    if (this.charge(w, 'whitediv-walk')) return;
    if (w.state === 'walk') {
      this.stalk(w, p, 62, KEEP7, 173, mad ? 62 : 46, 'whitediv-walk');
      if ((w.x < KEEP7 * TS + 12 && p.x < w.x) || (w.x > 173 * TS - 12 && p.x > w.x)) w.tm = Math.min(w.tm, 35);
      w.throwCd -= this.bossStep();
      if (w.tm > 20 && this.tryCharge(w)) return;
      const read = this.bossRead(w);
      let move = null;
      if ((w.tm <= 0 || (w.throwCd <= 0 && (up || read.distance > 150)))) {
        move = this.bossTactic(w, [{ move: 'slam', weight: up ? 1 : 3 }, { move: 'frost', weight: up || read.camp > 2000 ? 4 : mad ? 1.5 : 0.6, cooldown: 4500 }, { move: 'rock', weight: read.distance > 120 ? 3 : 0.7, cooldown: 3000 }]);
        this.bossAim(w, move === 'frost' ? 'Eyes to the roof: marked ice will fall' : move === 'rock' ? (mad ? 'Two boulders: keep moving after the first' : 'Boulder raised: move from the target') : 'Blue floor: climb or leap');
      }
      if (move === 'frost') {
        // he roars at the roof and the ice comes down on the ledge: two marks, a moment apart
        w.setVelocityX(0); w.state = 'roar'; w.tm = 120; w.throwCd = mad ? 120 : 170; sfx('roar'); this.cam.shake(300, 0.008);
        w.frostUntil = this.time.now + 1800;
        const target = w.aimX; this.iceStrike(target, w); const shift = Math.abs(read.vx) > 20 ? Math.sign(read.vx) * 64 : -w.dir * 64; const second = Phaser.Math.Clamp(target + shift, this.wall.x + 25, this.wallR.x - 25); this.time.delayedCall(450, () => this.iceStrike(second, w));
        if (!this.toldIce) { this.toldIce = true; toast('He roars at the roof! Where the light shines, ice will fall. Move!'); }
      } else if (move === 'rock') { w.setVelocityX(0); w.state = 'throw'; w.tm = 50; w.play('whitediv-throw'); w.hit = false; }
      else if (move === 'slam') { w.state = 'raise'; w.tm = Math.max(mad ? 50 : 64, this.reachT(149, 153)); w.setVelocityX(0); w.play('whitediv-smash'); w.anims.pause(); w.setFrame(5); sfx('roar'); }   // the club swung back over his shoulder
    } else if (w.state === 'raise') {
      w.setVelocityX(0); this.floorWarn.setAlpha(0.15 + 0.35 * Math.abs(Math.sin(w.tm * 0.25)));
      if (w.tm <= 0) { w.state = 'slam'; w.tm = 46; w.anims.resume(); w.hit = false; }
    } else if (w.state === 'slam') {
      if (!w.hit && w.tm < 36) {
        // the whole floor of the cave shakes: only the ledges and the air are safe
        w.hit = true; const y = 14 * TS; this.floorWarn.setAlpha(0.9); this.tweens.add({ targets: this.floorWarn, alpha: 0, duration: 400 });
        this.hazard(146 * TS, y - 22, 30 * TS, 22, 520); this.groundIce(146, 176, w.x); this.fx('shock', w.x + w.dir * 40, y + 1, { depth: 8 }).setScale(1.6);
        this.cam.shake(380, 0.016); sfx('hit');
      }
      if (w.tm <= 0) {
        // the club bites deep into the ice: the opening
        w.state = 'stuck'; w.tm = mad ? 135 : 165; w.anims.stop(); w.setFrame(7); w.setTint(0xbfe0ff);
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
          const tx = (w.aimX ?? p.x) + (i ? 64 * -w.dir : 0), t = 0.9 + i * 0.15, vx = (tx - w.x - w.dir * 30) / t, vy = -(0.5 * 700 * t) + ((w.aimY ?? p.y) - w.body.top - 10) / t;
          this.shoot(w.x + w.dir * 30, w.body.top + 10, vx, vy, 'boulder', { gravity: 700, spin: 8, life: 2500 });
        }
        sfx('swing'); if (!this.toldRock) { this.toldRock = true; toast('He hurls a boulder at your ledge. Jump clear!'); }
      }
      if (w.tm <= 0) { w.state = 'walk'; w.tm = 55 + Math.random() * 30; w.throwCd = mad ? 110 : 160; }
    } else if (w.state === 'roar') {
      w.setVelocityX(0);
      if (w.tm <= 0 && this.time.now >= (w.frostUntil || 0)) {
        w.state = 'spent'; w.tm = mad ? 85 : 105; w.intent = ''; w.anims.stop(); w.setTint(0xbfe0ff);
        this.stars?.destroy(); this.stars = this.fx('stun', w.x, w.body.top - 4, { depth: 10, follow: w });
        hint('The ice has fallen. <b>He is spent: close in and strike!</b>');
      }
    } else if (w.state === 'spent') {
      w.setVelocityX(0); this.stars?.setPosition(w.x, w.body.top - 4);
      if (w.tm <= 0) { mad ? w.setTint(0xffd0d0) : w.clearTint(); this.stars?.destroy(); this.stars = null; w.state = 'walk'; w.tm = 80; w.throwCd = Math.max(w.throwCd, 70); w.play('whitediv-walk'); }
    }
  }
  whiteFallen() {
    if (rush) { this.boss = null; this.time.delayedCall(1600, () => this.rushNext()); return; }
    this.whiteDown = true; this.boss = null;
    toast('The White Div is slain. Rostam takes the blood of its heart and goes to find the king.');
    hint('<b>Walk to Kay Kavus</b>, chained at the back of the cave.');
  }
  // the boss rush: the labour's own business is done already (the riddle solved, the horde beaten, the water drunk)
  rushSetup() {
    this.hordeDone = true; this.prayed = true; this.water = 100; hint(null);
    if (rush.hp != null) { this.hp = Math.min(this.maxHp, rush.hp + 1); this.renderHearts(); }
    banner(ROMAN[cur] + ' / VII', 'Boss rush'); toast(`Boss rush: foe ${cur} of 7. ${fmtTime(rushElapsed())}`);
    if (cur === 2) { this.puzzle = { done: true }; this.time.delayedCall(900, () => this.startQueen()); }
  }
  rushNext() {
    rush.splits.push(rushElapsed()); rush.hp = this.hp;
    if (cur < LABOURS) { this.done = true; this.time.delayedCall(1200, () => { rush.n = cur + 1; begin(cur + 1, false, true); }); return; }
    // all seven are fallen: the time, and the best ever
    this.done = true; playing = false; music(false); document.body.classList.remove('playing');
    const ms = rushElapsed(), best = +(store.get('sh-rush') || 0), nb = !best || ms < best; if (nb) store.set('sh-rush', Math.round(ms));
    $('winKick').textContent = 'Seven foes, one after another'; $('winTitle').textContent = 'The boss rush is done';
    $('winMsg').textContent = 'The lion, the Scorpion Queen, the dragon, the witch, Olad, Arzhang and the White Div have all fallen before Rostam.';
    $('winStars').innerHTML = ''; $('nextBtn').classList.add('hidden');
    $('winStats').innerHTML = `<div><b>${fmtTime(ms)}</b>time</div><div><b>${this.hp}</b>hearts left</div>`;
    $('winBest').textContent = nb ? 'A new best time!' : `Best time ${fmtTime(best)}`;
    rush = null; setTimeout(() => $('s-win').classList.remove('hidden'), 600);
  }
  freeKing() {
    // Rostam smashes the cage the Divs built around the king; the bars fly apart and the blind king turns toward the
    // sound. Rostam lets a drop of the White Div's heart-blood fall on his eyes; his chains burst, light pours down, and
    // he rises with his arms open. Rostam raises his mace, the king speaks, and after a breath the tale is told to its end
    this.ended = true; this.frozen = true; const p = this.player, k = this.kavus; p.setVelocityX(0); this.face = k.x >= p.x ? 1 : -1; p.setFlipX(this.face < 0); hint(null);
    const cage = this.cage, T0 = cage?.active ? 1500 : 0;
    if (cage?.active) {
      this.pose = 'rostam-heavy'; p.anims.stop(); p.play({ key: 'rostam-heavy', startFrame: 3 }); sfx('swing');
      this.time.delayedCall(260, () => {
        sfx('clang'); sfx('hit'); this.time.delayedCall(90, () => sfx('clang')); this.cam.shake(320, 0.014); this.hitStop(80);
        this.fx('impact', cage.x - this.face * 20, cage.y - cage.displayHeight * 0.45, { depth: 10 }).setScale(1.5);
        this.shatter(cage, { step: 2, power: 1.2 }); cage.destroy(); this.cage = null;
        for (let i = 0; i < 4; i++) this.fx('dust', k.x + (i - 1.5) * 18, k.y, { depth: 8 });
      });
      this.time.delayedCall(800, () => { k.setFlipX(k.x > p.x); this.pose = null; p.anims.stop(); p.play('rostam-idle'); });   // the king turns to him
    } else k.setFlipX(k.x > p.x);
    const anoint = this.anims.exists('rostam-anoint');
    this.time.delayedCall(T0, () => { this.pose = anoint ? 'rostam-anoint' : 'rostam-drink'; p.anims.stop(); p.play(this.pose); sfx('swing'); });
    const eye = () => ({ x: k.x - 3 * (k.flipX ? 1 : -1), y: k.y - k.displayHeight * 0.8 }), hand = () => ({ x: p.x + this.face * 24, y: p.y + 4 });
    this.time.delayedCall(T0 + 700, () => {
      const h = hand(), e = eye(), drop = this.add.circle(h.x, h.y, 2, 0xb0101a).setDepth(9).setStrokeStyle(1, 0x400008);
      this.tweens.add({ targets: drop, x: e.x, y: e.y, duration: 520, ease: 'Quad.easeIn', onComplete: () => {
        drop.destroy(); sfx('coin');
        const g = this.add.image(e.x, e.y, 'glow').setTint(0xffe0a0).setBlendMode(Phaser.BlendModes.ADD).setDepth(9).setScale(0.1);
        this.tweens.add({ targets: g, scale: 1.1, alpha: { from: 1, to: 0 }, duration: 900, ease: 'Cubic.easeOut', onComplete: () => g.destroy() });
      } });
    });
    this.time.delayedCall(T0 + 1700, () => {
      this.cam.flash(700, 255, 250, 220); this.cam.shake(300, 0.008); sfx('win');
      const bits = this.add.particles(k.x, k.y - 30, 'flake', { speed: { min: 80, max: 180 }, angle: { min: 200, max: 340 }, gravity: 600, lifespan: 900, quantity: 18, emitting: false, scale: { min: 1, max: 2 }, tint: [0x8a8f9a, 0xc8ccd6, 0x5a5f6a] }).setDepth(9);
      bits.explode(18); this.time.delayedCall(1200, () => bits.destroy()); sfx('clang'); this.time.delayedCall(120, () => sfx('clang'));
      this.fx('beam', k.x, k.y + 1, { depth: 6 });
      this.recordVictory();   // Save the rescued king before the ending or credits can be interrupted.
      k.play('kavus-sight'); this.light(k, 2.2);
      banner('کاووس شاه', 'The king sees again');
    });
    // the king speaks; two seconds after his last word the tale goes on in pictures
    let told = false; const tell = () => { if (told) return; told = true; this.time.delayedCall(2000, () => cinema('ending', () => this.win({ destroy() {} }))); };
    this.time.delayedCall(T0 + 2900, () => {
      if (this.anims.exists('rostam-victory')) { this.pose = 'rostam-victory'; p.anims.stop(); p.play('rostam-victory'); }
      toast('"Rostam!" cries Kay Kavus. "My eyes are opened, and Iran is saved."');
      if (!say('kavus1', { then: tell })) this.time.delayedCall(3200, tell);
    });
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
      this.fit(r, 'ram'); this.physics.add.collider(r, this.layer, null, o => !o.back);   // among the towers it walks behind their plinths
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
    const r = this.ram, p = this.player, d = r.x - p.x, end = this.ramStand;   // past the four towers, where it can watch them
    // it keeps a little ahead of Rostam, hurrying if he presses on, and turns to wait if he falls far behind
    // once it reaches the towers it walks steadily past them to its post on their far side, Rostam or no
    const vx = r.x >= end ? 0 : r.x > 138 * TS ? 66 : d > 150 ? 0 : Phaser.Math.Clamp((p.x + 70 - r.x) * 2.2, 0, 150);
    r.setVelocityX(vx); r.setFlipX(d > 150 || r.x >= end - 6);                     // at its post it turns to face the towers
    if (vx > 8 && r.body.blocked.right && r.body.blocked.down) r.setVelocityY(-260);   // hop up the dune steps
    if (vx > 8) { if (r.anims.currentAnim?.key !== 'ram-walk' || !r.anims.isPlaying) r.play('ram-walk'); r.anims.timeScale = Math.max(0.8, vx / 62); }
    else { r.anims.stop(); r.setFrame(0); }
    r.glow.setPosition(r.x, r.y + 2);
    // among the towers it steps back into the background, smaller and in shadow, so the towers and Rostam stand out
    if (!r.back && r.x > 145 * TS && r.body.blocked.down) { r.back = true; r.body.setAllowGravity(false); r.setVelocityY(0); r.setDepth(1.5); r.glow.setDepth(1.4); this.tweens.add({ targets: r.glow, alpha: 0.5, duration: 900 }); r.setTint(0xd0c0a8); }
  }
  // the mace meets a curse and sends it back where it came from, faster
  deflect(sh) {
    const B = this.boss, target = sh.journeyTarget?.active ? sh.journeyTarget : B, a = target?.active ? Math.atan2((target === B ? target.y - 8 : target.y - 45) - sh.y, target.x - sh.x) : (this.face > 0 ? 0 : Math.PI);
    sh.back = true; sh.body.setAllowGravity(false); sh.setVelocity(Math.cos(a) * 280, Math.sin(a) * 280); sh.setRotation(a); sh.setTint(0xffe08a); sh.die = this.time.now + 2500;
    this.fx('hit', sh.x, sh.y, { depth: 10 }); sfx('hit'); this.hitStop(40);
    if (!this.toldDeflect) { this.toldDeflect = true; toast(cur === 2 ? 'Your mace knocks the venom back at the Queen!' : cur === 5 ? 'Your mace sends Olad\'s knife back at him!' : 'Your mace turns the curse back on the witch!'); }
  }
  // the ram's riddle: it taps the standing stones in an order; strike them in the same order and the rock gives water
  startStones() {
    this.puzzle = { seq: [2, 0, 3, 1], at: 0, showing: false, done: false };
    toast('The ram stops beside four old towers of the elements, earth, water, fire and wind, and stamps...');
    hint('The ram will ring the <b>four bells</b> in an order. <b>Watch and listen.</b>'); this.ram?.setFlipX(true);
    this.time.delayedCall(1000, () => this.showStones());
  }
  showStones() {
    const P = this.puzzle; if (!P || P.done) return;
    P.showing = true; P.at = 0; this.frozen = true; this.player.setVelocityX(0);
    // the camera draws back to frame all four towers and the ram watching them
    this.cam.stopFollow(); this.tweens.add({ targets: this.cam, scrollX: Math.min(this.levelW - W, 152 * TS - W / 2 + 56), duration: 700, ease: 'Sine.easeInOut' });
    // the ram stamps, and a bell answers
    P.seq.forEach((i, k) => this.time.delayedCall(k * 1100, () => {
      if (this.ram) { this.ram.setFlipX(true); this.tweens.add({ targets: this.ram, y: this.ram.y - 7, yoyo: true, duration: 110 }); this.fx('dust', this.ram.x - 8, this.ram.body.bottom, { depth: 6 }); }
      this.time.delayedCall(220, () => this.lightStone(i));
    }));
    this.time.delayedCall(P.seq.length * 1100 + 500, () => {
      P.showing = false; this.frozen = false; this.cam.startFollow(this.player, true, 0.12, 0.12, W / 2, H / 2);
      hint(`Now ring the bells <b>in the same order</b>: stand at a tower and press ${keyHTML('offer')} (or tap <b>Ring</b>). Two of them stand on plinths: jump up.`);
    });
  }
  // a bell rings: it swings on its beam and slowly settles, its tower trembles and glows, a ring of sound spreads from the
  // arch, and the tower's element bursts out: dust and pebbles, a fountain, a burst of flame, or a whirl of wind.
  // A wrong blow only clanks: a short dull swing and a red flash.
  lightStone(i, tint = 0x8fe0ff) {
    const st = this.stones[i], E = ELEMENTS[i], ok = tint === 0x8fe0ff, b = st.bell;
    this.tweens.killTweensOf([st.glow, st.aura, b]);
    const amp = ok ? 34 : 9, dur = ok ? 2400 : 600;
    this.tweens.addCounter({ from: 0, to: 1, duration: dur, onUpdate: tw => { const v = tw.getValue(); b.angle = amp * Math.sin(v * Math.PI * (ok ? 7 : 3)) * Math.pow(1 - v, 1.6); } });
    this.tweens.add({ targets: st, x: st.x + 1, yoyo: true, repeat: 3, duration: 40 });
    st.glow.setTint(ok ? E.tint : 0xff4a3a).setAlpha(1); this.tweens.add({ targets: st.glow, alpha: 0, delay: 250, duration: 900 });
    if (!ok) { tone(150, 0.25, { type: 'square', vol: 0.05, to: 110 }); return; }
    st.aura.setAlpha(0.45); this.tweens.add({ targets: st.aura, alpha: 0, delay: 300, duration: 1400 });
    bell(E.note); sfx('stone' + i);
    for (let k = 0; k < 2; k++) {
      const ring = this.add.ellipse(b.x, b.y + 10, 14, 14).setStrokeStyle(1.5, E.tint, 0.9).setDepth(9);
      this.tweens.add({ targets: ring, scale: 5, alpha: 0, delay: k * 220, duration: 1000, ease: 'Cubic.easeOut', onComplete: () => ring.destroy() });
    }
    const base = st.y - 4, P = {
      earth: { key: 'sand', x: { min: st.x - 18, max: st.x + 18 }, y: base, speedY: { min: -150, max: -60 }, speedX: { min: -70, max: 70 }, gravityY: 400, lifespan: 1100, quantity: 22, scale: { min: 1, max: 2 }, tint: [0xa86a3a, 0xd8a060, 0x7a5a2a] },
      water: { key: 'flake', x: { min: st.x - 6, max: st.x + 6 }, y: base - 6, speedY: { min: -230, max: -150 }, speedX: { min: -40, max: 40 }, gravityY: 520, lifespan: 1100, quantity: 26, scale: { min: 1, max: 1.8 }, tint: [0x8fe0ff, 0x2fa8b5, 0xffffff] },
      fire: { key: 'sand', x: { min: st.x - 10, max: st.x + 10 }, y: base - 4, speedY: { min: -150, max: -70 }, speedX: { min: -24, max: 24 }, lifespan: 1300, quantity: 26, scale: { start: 2, end: 0 }, tint: [0xff8a2a, 0xffd060, 0xff3a10], blendMode: 'ADD' },
      wind: { key: 'streak', x: { min: st.x - 30, max: st.x - 10 }, y: { min: st.y - st.displayHeight * 0.8, max: st.y - 8 }, speedX: { min: 160, max: 260 }, speedY: { min: -30, max: 30 }, rotate: 90, lifespan: 700, quantity: 18, alpha: { start: 0.9, end: 0 }, tint: [0xe8f4ff, 0xbfe0ff] }
    }[E.name];
    const em = this.add.particles(0, 0, P.key, { ...P, key: undefined, emitting: false }).setDepth(8); em.explode(P.quantity); this.time.delayedCall(1600, () => em.destroy());
  }
  // Rostam pulls the bell rope: a short tug of his arm, and the bell answers
  ringBell(i) {
    const p = this.player; this.face = this.stones[i].x >= p.x ? 1 : -1; p.setFlipX(this.face < 0);
    this.tweens.add({ targets: p, y: p.y + 2, yoyo: true, duration: 90 }); this.strikeStone(i);
  }
  strikeStone(i) {
    const P = this.puzzle; if (!P || P.done || P.showing) return;
    if (P.seq[P.at] === i) { this.lightStone(i); if (++P.at === P.seq.length) this.openSpring(); return; }
    P.at = 0; this.stones.forEach((_, k) => this.lightStone(k, 0xff5a5a)); sfx('hit'); this.cam.shake(150, 0.006);
    toast('The bells fall silent. The ram stamps again: watch and listen.');
    this.time.delayedCall(1200, () => this.showStones());
  }
  openSpring() {
    this.puzzle.done = true; this.water = 100; this.renderWater(); sfx('win');
    this.stones.forEach((_, k) => this.time.delayedCall(k * 160, () => this.lightStone(k)));   // all four bells ring together
    const x = this.springAt.x + 26, y = this.springAt.y;
    this.cam.flash(350, 200, 240, 255); this.fx('beam', x, y + 1, { depth: 4 });
    for (let k = 0; k < 4; k++) this.time.delayedCall(k * 220, () => this.fx('splash', x + (k - 1.5) * 14, y + 1, { depth: 6 }));
    this.tweens.add({ targets: this.pool, alpha: 1, duration: 900, onComplete: () => this.tweens.add({ targets: this.pool, alpha: 0.85, yoyo: true, repeat: -1, duration: 900, ease: 'Sine.easeInOut' }) });
    toast('The four bells ring together, and water bursts from the rock!');
    if (this.textures.exists('queen-walk')) this.time.delayedCall(1800, () => this.startQueen());   // ...and something stirs beneath the sand
    else { this.springOpen = true; hint('<b>Walk into the spring</b> to drink.'); }
  }
  // the Scorpion Queen bursts from the sand to guard the spring. One clear loop: she patrols the arena from side to side;
  // whoever stands in front of her gets the sting (the stinger glows green first), which sprays venom and then sticks in the
  // sand: the opening. At the end of some passes she burrows, a trail of sand runs under the arena, the sand swirls at the
  // far side and she bursts out there, dazed for a moment: the second opening. Stand on the corner ledge and she spits.
  startQueen() {
    const x = 160 * TS, y = 14 * TS;
    this.cam.shake(900, 0.012); sfx('roar'); for (let i = 0; i < 6; i++) this.time.delayedCall(i * 120, () => this.fx('dust', x + Phaser.Math.Between(-40, 40), y, { depth: 8 }));
    const q = this.physics.add.sprite(x, y - 60, 'queen-walk', 0).setDepth(4).setFlipX(true);
    this.fit(q, 'queen'); q.dir = -1; q.keep = KEEP2; q.state = 'emerge'; q.tm = 60; q.passes = 0; q.nextDive = 2; q.stingCd = 40; q.spitCd = 120;
    q.body.setAllowGravity(false); q.y = y - q.displayHeight * (0.97 - q.originY); q.groundY = q.y; this.sink(q, false, 900);
    q.immune = () => q.state !== 'stuck' && q.state !== 'surfaced'; q.calm = () => !q.immune(); q.contact = () => q.state === 'walk' || q.state === 'turn';
    q.immuneMsg = 'Her armour turns the blow. Let her sting miss: when it sticks in the sand, strike!';
    q.lines = { intro: 'queen1', rage: 'queen2' };
    // her own venom, knocked back by the mace, stuns her: an opening as good as a stuck sting
    q.onBack = () => { if (q.state === 'under' || !q.body.enable) return; this.damage(q, 1, true); if (q.hp <= 0) return;
      q.state = 'stuck'; q.tm = 110; q.setVelocityX(0); q.anims.stop(); q.setTexture('queen-sting', 5); q.setTint(0xb8ff90); this.stars?.destroy(); this.stars = this.fx('stun', q.x, q.body.top - 4, { depth: 10, follow: q });
      if (!this.toldVenom) { this.toldVenom = true; toast('Her own venom stuns her! Strike while she reels.'); } }; q.kickable = () => ['walk', 'turn', 'aim', 'sting', 'spit'].includes(q.state) && !q.sinking; q.ai = () => this.queenAI(); q.onDown = () => { q.brood?.forEach(f => { if (f.active) { this.fx('poof', f.x, f.body.bottom - 6, { depth: 9 }); f.destroy(); } }); this.stars?.destroy(); this.stars = null; this.mound?.destroy(); this.swirl?.destroy(); this.puddles?.forEach(o => o.destroy()); this.bossFall(q, () => this.queenFallen()); };
    this.arena(138 * TS, q, 12); this.light(q, 1.6); this.recede();
    hint('The <b>Scorpion Queen</b> patrols the sand. When her <b>stinger glows green, step back</b>: when it <b>sticks in the sand, strike!</b> Jump over her as she passes.');
  }
  // as the Queen rises the riddle is done with: the plinths sink into the sand, and the towers, their bells and the ram
  // fall back into shadow, so nothing in the arena competes with her
  recede() {
    this.ringTip?.destroy(); this.ringTip = null; this.nearBell = -1;
    const sunk = [];
    this.layer.forEachTile(t => { if (t.plinth && t.index >= 0) sunk.push(t); });
    sunk.forEach(t => { this.fx('dust', t.pixelX + 8, t.pixelY + 16, { depth: 8 }); this.layer.removeTileAt(t.x, t.y); }); sfx('rock'); this.time.delayedCall(250, () => sfx('rock'));
    const dim = [], shade = (o, v) => o && dim.push([o, v]);
    this.stones.forEach(st => {
      const raised = 14 * TS - st.footY;
      if (raised > 0) this.tweens.add({ targets: [st, st.bell, st.glow, st.aura], y: '+=' + raised, duration: 900, ease: 'Quad.easeIn' });
      shade(st, 0.36); shade(st.bell, 0.36); st.glow.setAlpha(0); st.aura.setAlpha(0); this.tweens.add({ targets: [st, st.bell], alpha: 0.85, duration: 1200 });
    });
    if (this.ram) { shade(this.ram, 0.3); this.tweens.add({ targets: this.ram.glow, alpha: 0, duration: 900 }); }
    this.tweens.addCounter({ from: 255, to: 0, duration: 1200, onUpdate: tw => { const v = tw.getValue(); dim.forEach(([o, to]) => { const c = Math.round(255 * to + v * (1 - to)); o.setTint((c << 16) | (c << 8) | Math.min(255, c + 18)); }); } });
  }
  // the Queen sinks into the sand or rises out of it: the part of her below the ground line is cut away as she moves
  sink(q, down, ms) {
    const fh = q.frame.height, sc = q.scaleY, depth = fh * 0.97 * sc; q.sinking = true;
    this.tweens.addCounter({ from: down ? 0 : 1, to: down ? 1 : 0, duration: ms, ease: down ? 'Quad.easeIn' : 'Back.easeOut', onUpdate: tw => {
      const v = Math.max(0, tw.getValue()); q.y = q.groundY + v * depth; q.setCrop(0, 0, q.frame.width, Math.max(0, fh * 0.97 - v * depth / sc));
    }, onComplete: () => { q.sinking = false; if (!down) { q.y = q.groundY; q.setCrop(); } } });
    for (let i = 0; i < 4; i++) this.time.delayedCall(i * (ms / 4), () => this.fx('dust', q.x + Phaser.Math.Between(-40, 40), q.groundY + q.displayHeight * (0.97 - q.originY), { depth: 8 }));
  }
  // a drop of venom that lands as a small green puddle, which burns for a moment and dries up
  venom(x, y, vx, vy, big = false) {
    const g = 700, sh = this.shoot(x, y, vx, vy, 'fx-venom', { gravity: g, life: 2600 }); sh.play('fx-venom'); sh.setScale(big ? 0.85 : 0.6); sh.curse = true;   // the mace can knock it back
    // where it comes down: solve for the floor under its path
    let t = 0.05, px = x, py = y, r = null;
    for (; t < 2.5; t += 0.02) { px = x + vx * t; py = y + vy * t + 0.5 * g * t * t; r = this.groundAt(px); if (r != null && vy + g * t > 0 && py >= r * TS) break; }
    if (r == null) return;
    this.time.delayedCall(t * 1000, () => {
      if (!this.boss || this.boss.hp <= 0) return;
      if (!sh.active || sh.back) return; sh.destroy();
      const fy = r * TS, w = big ? 28 : 20, pd = this.add.ellipse(px, fy - 1, w, 6, 0x3fae22, 0.95).setStrokeStyle(1, 0xd8ff8a, 1).setDepth(7);
      this.puddles = (this.puddles || []).filter(o => o.active); this.puddles.push(pd); this.fx('dust', px, fy, { depth: 8 });
      this.hazard(px - w / 2 + 2, fy - 7, w - 4, 7, 1300);
      this.tweens.add({ targets: pd, scaleY: 1.25, yoyo: true, repeat: 3, duration: 130 });   // it bubbles
      this.tweens.add({ targets: pd, alpha: 0, scaleX: 0.5, delay: 1000, duration: 400, onComplete: () => pd.destroy() });
    });
  }
  queenAI() {
    const q = this.boss, p = this.player; const read = this.bossRead(q); q.think = (q.think || 0) - this.bossStep(); q.diveAge = (q.diveAge || 0) + this.bossStep(); q.tm -= this.bossStep(); q.stingCd -= this.bossStep(); q.spitCd -= this.bossStep(); const d = p.x - q.x, mad = q.hp <= q.max / 2;
    const L = KEEP2 * TS + 4, R = 165 * TS, floorY = 14 * TS, onLedge = p.body.bottom < 12.5 * TS;
    // at half strength she calls her brood: a young scorpion burrows into the arena floor, on the far side from Rostam,
    // and rises when he comes near (on the gentle road she is too weak to call it)
    if (mad && !q.brood && !q.sinking) {
      q.brood = [];
      for (const t of gentle() ? [] : [p.x < (L + R) / 2 ? 0.8 : 0.2]) {
        const x = L + (R - L) * t; banner('ملکهٔ کژدم', 'The Queen calls her brood'); sfx('rock'); this.cam.shake(320, 0.006);
        const f = this.spawnFoe('scorpion', x, floorY); f.setScale(f.scaleX * 0.75); f.y = floorY - 1 - 0.47 * f.displayHeight; f.body.reset(x, f.y);
        f.hp = 1; f.roam = [L + 8, R - 8]; f.setTint(0xe0b080); bury(this, f); this.fx('dust', x, floorY, { depth: 8 }); q.brood.push(f);
      }
    }
    // she belongs to the sand: pinned to the ground unless she is sinking into it or rising out of it
    q.body.setVelocityY(0); if (!q.sinking) q.y = q.groundY;
    q.setFlipX(q.dir < 0);
    if (q.state === 'emerge') { q.setVelocityX(0); if (q.tm <= 0) { q.state = 'walk'; q.play('queen-walk'); } }
    else if (q.state === 'walk') {
      q.setVelocityX(q.dir * (mad ? 80 : 60)); if (q.anims.currentAnim?.key !== 'queen-walk' || !q.anims.isPlaying) q.play('queen-walk');
      const ahead = d * q.dir, close = ahead > 10 && ahead < 124 && !onLedge;
      q.rearT = ahead < -55 ? (q.rearT || 0) + this.bossStep() : 0;
      // Do not patrol an entire arena with Rostam following harmlessly behind.
      if (q.rearT > 36) {
        q.state = 'turn'; q.tm = 26; q.turnDir = Math.sign(d) || -q.dir;
        q.rearT = 0; q.intent = 'The Queen turns: move around her'; q.setVelocityX(0); q.anims.stop(); return;
      }
      let move = null;
      if (q.think <= 0) {
        move = this.bossTactic(q, [{ move: 'patrol', weight: 1 }, { move: 'sting', weight: close && q.stingCd <= 0 ? 4 : 0 }, { move: 'spit', weight: q.spitCd <= 0 && (onLedge || Math.abs(d) > 140) ? 3 + (read.camp > 2000 ? 2 : 0) : 0 }, { move: 'dive', weight: q.diveAge > 360 ? 1 + read.pressure * 3 : 0, cooldown: 6500 }]); q.think = 30 + Math.random() * 24;
      }
      if (q.diveAge >= (mad ? 600 : 780) || move === 'dive') { q.diveAge = 0; q.state = 'dive'; q.tm = 44; q.setVelocityX(0); q.anims.stop(); this.sink(q, true, 700); sfx('hit'); }
      else if (move === 'sting') { q.intent = 'Green stinger: step back'; q.state = 'aim'; q.tm = mad ? 34 : 40; q.setVelocityX(0); q.anims.stop(); q.setTexture('queen-sting', 0); sfx('roar'); }
      else if (move === 'spit') { this.bossAim(q, 'Venom raised: leave the target'); q.state = 'spit'; q.tm = 44; q.setVelocityX(0); q.dir = Math.sign(d) || q.dir; q.play('queen-spit'); q.spat = false; }
      else if ((q.dir < 0 && (q.x <= L || q.hitKeep)) || (q.dir > 0 && q.x >= R)) {
        // the end of a pass: turn back, or every few passes go under the sand and come out at the far side
        q.setVelocityX(0); q.passes++;
        if (q.passes >= q.nextDive) { q.passes = 0; q.diveAge = 0; q.nextDive = mad ? 1 : 2 + (Math.random() < 0.5 ? 1 : 0); q.state = 'dive'; q.tm = 44; q.anims.stop(); this.sink(q, true, 700); sfx('hit'); }
        else { q.state = 'turn'; q.tm = 18; q.anims.stop(); }
      }
    } else if (q.state === 'turn') {
      q.setVelocityX(0); if (q.tm <= 0) { q.dir = q.turnDir || (q.x < (L + R) / 2 ? 1 : -1); q.turnDir = null; q.intent = ''; q.state = 'walk'; }
    } else if (q.state === 'aim') {
      // the stinger glows green: the strike is coming
      q.setVelocityX(0); Math.floor(q.tm / 4) % 2 ? q.setTint(0x9aff6a) : q.clearTint();
      if (q.tm <= 0) { q.clearTint(); q.state = 'sting'; q.tm = 26; q.play('queen-sting'); q.hit = false; }
    } else if (q.state === 'sting') {
      q.setVelocityX(0);
      if (!q.hit && q.tm < 16) {
        q.hit = true; const hx = q.x + q.dir * 54; this.hazard(hx - 28, q.body.bottom - 46, 56, 46, 180); this.fx('dust', hx, q.body.bottom, { depth: 8 }); this.cam.shake(180, 0.01); sfx('hit');
        // a spray of venom flies off the stinger as it strikes
        for (let i = 0; i < (mad ? 3 : 2); i++) this.venom(hx, q.body.top + 6, q.dir * (70 + i * 55 + Math.random() * 20), -170 - Math.random() * 60);
      }
      if (q.tm <= 0) {   // the stinger is driven into the sand: the opening
        q.state = 'stuck'; q.tm = mad ? 100 : 125; q.anims.stop(); q.setFrame(5); q.setTint(0xffd0a0);
        this.stars = this.fx('stun', q.x, q.body.top - 4, { depth: 10, follow: q }); hint('Her sting is <b>stuck in the sand: strike now!</b>');
      }
    } else if (q.state === 'stuck') {
      q.setVelocityX(0); this.stars?.setPosition(Math.round(q.x), Math.round(q.body.top - 4));
      if (q.tm <= 0) { q.clearTint(); this.stars?.destroy(); this.stars = null; q.state = 'walk'; q.stingCd = mad ? 40 : 60; q.play('queen-walk'); }
    } else if (q.state === 'spit') {
      q.setVelocityX(0);
      if (!q.spat && q.tm < 26) { q.spat = true; sfx('fire');
        const count = mad ? 3 : 2;
        for (let i = 0; i < count; i++) { const tx = (q.aimX ?? p.x) + (i - (count - 1) / 2) * 44, t = 0.85 + i * 0.12, vx = (tx - q.x - q.dir * 40) / t, vy = -(0.5 * 700 * t) + ((q.aimY ?? p.y) - q.body.top - 10) / t;
          this.venom(q.x + q.dir * 40, q.body.top + 10, vx, vy, true); } }
      if (q.tm <= 0) { q.state = 'walk'; q.spitCd = mad ? 120 : 160; q.dir = q.x < (L + R) / 2 ? 1 : -1; }
    } else if (q.state === 'dive') {
      q.setVelocityX(0);
      if (q.tm <= 0) {   // under the sand: a trail of sand runs across the arena to the far side
        q.state = 'under'; q.underAge = 0; q.setAlpha(0); q.body.enable = false;
        q.goal = q.x < (L + R) / 2 ? R - 10 : L + 10;
        if ((mad || read.camp > 1800) && !onLedge) q.goal = Phaser.Math.Clamp(read.targetX, L + 10, R - 10);   // enraged, she may come up right under Rostam
        this.mound = this.add.particles(0, 0, 'sand', { x: 0, y: 0, speedX: { min: -50, max: 50 }, speedY: { min: -90, max: -30 }, gravityY: 300, lifespan: 600, frequency: 25, scale: { min: 1, max: 2 } }).setDepth(8);
      }
    } else if (q.state === 'under') {
      q.underAge = (q.underAge || 0) + this.bossStep();
      if (q.underAge > 240 || !Number.isFinite(q.goal)) q.goal = Phaser.Math.Clamp(q.x, L + 10, R - 10);
      if (!this.swirl?.active) {
        const step = (mad ? 4.4 : 3.4) * this.bossStep(); q.x += Phaser.Math.Clamp(q.goal - q.x, -step, step); this.mound?.setPosition(q.x, floorY);
        if (Math.abs(q.goal - q.x) < 1) {   // she has arrived: the sand swirls where she will rise
          this.mound?.destroy(); q.tm = mad ? 34 : 46;
          this.swirl = this.add.ellipse(q.x, floorY - 2, 70, 12).setStrokeStyle(2, 0xffd890, 1).setDepth(8);
          this.tweens.add({ targets: this.swirl, scaleX: 0.6, scaleY: 0.6, alpha: 0.4, yoyo: true, repeat: -1, duration: 160 });
        }
      } else if (q.tm <= 0) {
        this.swirl.destroy(); this.swirl = null;
        q.state = 'surfacing'; q.tm = 18; q.setAlpha(1); q.body.enable = true; q.setTexture('queen-walk', 0); this.sink(q, false, 260);
        q.dir = q.x < (L + R) / 2 ? 1 : -1;
        this.hazard(q.x - 36, floorY - 60, 72, 60, 260); this.cam.shake(420, 0.016); sfx('hit'); sfx('roar');
        for (let i = 0; i < 6; i++) this.fx('dust', q.x + (i - 2.5) * 16, floorY, { depth: 8 });
      }
    } else if (q.state === 'surfacing') {
      q.setVelocityX(0); if (q.tm <= 0) { q.state = 'surfaced'; q.tm = mad ? 50 : 64; this.stars?.destroy(); this.stars = this.fx('stun', q.x, q.body.top - 4, { depth: 10, follow: q }); }
    } else if (q.state === 'surfaced') {
      q.setVelocityX(0); this.stars?.setPosition(Math.round(q.x), Math.round(q.body.top - 4));
      if (q.tm <= 0) { this.stars?.destroy(); this.stars = null; q.state = 'walk'; q.stingCd = 30; q.play('queen-walk'); }
    }
  }
  queenFallen() {
    this.springOpen = true; this.boss = null;
    toast('The Scorpion Queen is slain. The spring runs clear.'); hint('<b>Walk into the spring</b> to drink.');
  }
  // foes in a stretch of the level vanish in smoke
  banish(x0, x1) {
    for (const f of this.foes.getChildren()) if (f.body.enable && f.x > x0 && f.x < x1) {
      f.body.enable = false; this.fx('smoke', f.x, f.body.bottom - 16, { depth: 10 });
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
function begin(n = cur, rise = false, keepRush = false, afterStory = false) {
  // A fresh journey gets its illustrated opening; a checkpoint retry and the boss rush go straight back to play.
  if (!rise && !keepRush && !afterStory && CINE['intro' + n]) {
    if (!keepRush) rush = null;
    cinema('intro' + n, () => begin(n, rise, keepRush, true));
    return;
  }
  if (!keepRush) rush = null;
  audio(); ['s-title', 's-win', 's-dead', 's-pause', 's-map'].forEach(id => $(id).classList.add('hidden'));
  $('touch').classList.toggle('hidden', !touch); $('boss').classList.add('hidden');
  const sc = game.scene.getScene('play');
  if (!sc.player) { sc.events.once('create', () => begin(n, rise, keepRush, true)); return; }     // still loading: start once it is ready
  if (!rise || resumeAt?.n !== n) resumeAt = null; sc.resuming = !!resumeAt;
  paused = false; if (game.scene.isPaused('play')) game.scene.resume('play');
  const changed = n !== cur; cur = n; store.set('sh-cur', n);
  if (sc.done || sc.started || changed) { $('toast').classList.remove('on'); hint(null); sc.scene.restart(); }   // a fresh scene brings its own hint
  trackGame('level_start', { level_name: String(n), checkpoint_retry: !!rise, mode: keepRush ? 'boss_rush' : 'story' });
  sc.started = true; playing = true; music(true); document.body.classList.add('playing');
}
// the road of seven labours: pick any labour you have reached
const fmtTime = ms => { const s = Math.round(ms / 1000); return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`; };
const NAMES = ['', ['The Lion', 'یکم'], ['The Desert', 'دوم'], ['The Dragon', 'سوم'], ['The Witch', 'چهارم'], ['Olad', 'پنجم'], ['Arzhang Div', 'ششم'], ['The White Div', 'هفتم']];
const BLURB = ['', 'Among the reeds a great lion stirs in the dark.', 'Climb to shelter or brave the moving sand.', 'Ride through the dragon’s hunting ground and its marked fire.', 'A garden whose living bridges bloom and vanish.', 'Ride after Olad through his guarded marches and turn his knives back.', 'Silence the war drums and scatter the Div host.', 'Cross crumbling ledges and shatter the cave’s ice seal.'];
let pick = cur, mapFrom = null;
// the Book of Foes: a leaf for each labour, with its great foe (an animated miniature), its tale and how to beat it
const GUIDE = [
  { k: 1, fa: 'شیرِ نیستان', name: 'The Lion of the Reeds', art: ['lion-roar', 8, 148],
    tale: 'Rostam lay down to sleep among the reeds while Rakhsh grazed. In the night a great lion crept out of the thicket. In the old tale faithful Rakhsh trampled it; here Rostam must stand against it himself.',
    how: ['The lion <b>roars before charging</b>, glows <b>gold before pouncing</b> and <b>orange before a paw swipe</b>. Its hide turns blows during attacks.', 'It watches repeated jumps, retreats from pressure and can <b>pounce onto your ledge</b>. Keep changing your spacing.', 'Dodge the committed attack, then <b>strike while the stars circle its head</b>. A missed pounce or swipe also leaves an opening. Hold Strike for a <b>heavy blow</b>.'],
    more: [['jackal-run', 8, 108, 'Jackal', 'Stalks you, drops its head, then lunges. Dodge or jump it, and strike while it pants. One blow.'], ['div-hop', 8, 108, 'Blue Div', 'Hops toward you. Strike as it lands.']] },
  { k: 2, fa: 'ملکهٔ کژدم', name: 'The Scorpion Queen', art: ['k2/queen-sting', 9, 150],
    tale: 'Beyond the reeds lay a desert where no bird flew. A ram led the dying Rostam to a hidden spring, and when its four bells rang the water burst from the rock; but the Queen of the scorpions had made that water her own.',
    how: ['She <b>patrols</b> the sand from side to side, and her armour turns every blow. <b>Jump over her</b> as she passes.', 'If you stand in her path her <b>stinger glows green</b>: <b>step back</b>. The sting sprays <b>venom</b> that burns where it lands, then <b>sticks in the sand</b>: <b>strike now</b>.', 'At the end of a pass she may <b>burrow</b>: a trail of sand runs under the arena and the <b>sand swirls</b> where she will rise. Keep clear, then strike while she is dazed.', 'Hide on the corner ledge and she <b>spits venom</b> at it. Your water does not drain while you fight her.'],
    more: [['k2/scorpion-crawl', 8, 108, 'Scorpion', 'Two blows, or jump on it. Mind the sting. Some lie buried: a mound in the sand shudders, then one bursts out.'], ['k2/vulture-fly', 8, 108, 'Vulture', 'Circles, then dives. Strike it as it swoops low.'], ['k2/ram-walk', 8, 108, 'The Ram', `Follow it to the four bell towers. Stand at each one and press ${keyHTML('offer')} (or tap Ring) in the order it shows you.`]] },
  { k: 3, fa: 'اژدها', name: 'The Dragon', art: ['k3/dragon-fire', 8, 136],
    tale: 'A dragon eighty cubits long ruled the night. Twice Rakhsh woke Rostam to warn him, and twice the dragon vanished into the dark. The third time God let Rostam see it, and with Rakhsh biting its neck he struck off its head.',
    how: ['You ride <b>Rakhsh</b>: faster, with a longer reach from the saddle.', 'The dragon <b>hides in the dark</b>; while hidden, blows pass through it.', 'When <b>Rakhsh rears and neighs</b> it is revealed. Read the warning: it can breathe flame, lunge or spit a spread of fireballs. Keep moving after it aims.', 'Wounded, it stays visible and may <b>flash gold before a follow-up lunge</b>. It still leaves a recovery window.'],
    more: [['k3/bat-fly', 8, 108, 'Bat', 'Darts down at you. Swing as it swoops, even over your head.']] },
  { k: 4, fa: 'زنِ جادو', name: 'The Witch', art: ['k4/hag-cast', 8, 108],
    tale: 'In a green garden Rostam found wine, a lute and a feast. A beautiful woman came to share it, but when he spoke the name of God her face turned black. She was a witch, and the feast was a trap.',
    how: ['At the feast, <b>stand by the lady and strike</b> to speak the name of God.', 'Unmasked, she flies and hurls <b>green curses</b>: <b>strike them to send them back</b> at her, or jump them.', '<b>Strike her when she is solid</b>. A reflected curse dazes her: close in and strike. Purple mist warns that she will vanish; she leaves time to react after reappearing. She changes her curses if you stay still or keep jumping. Hurt, she calls up serpents.'],
    more: [['k4/serpent', 8, 108, 'Serpent', 'Sways, then lunges. Hit it as it rears.'], ['k3/bat-fly', 8, 108, 'Bat', 'Strike it as it swoops.']] },
  { k: 5, fa: 'اولاد', name: 'Olad the Warden', art: ['k5/olad-slash', 6, 112],
    tale: 'In Mazandaran the warden Olad rode out with his men against the stranger. Rostam beat them, caught Olad with his lasso, and spared his life on one condition: that he show him the way to the Divs.',
    how: ['His <b>shield blocks every blow from the front</b>.', 'When he <b>flashes, step back</b> from his sword. Then he <b>glows</b>: <b>strike!</b>', 'Or <b>jump twice</b> over him: <b>his back is always open</b>. He commits to the direction of his swing.', 'He can retreat, thrust farther, or flash blue before <b>throwing a knife</b>. Dodge it or strike it back at him. Wounded, he may warn of a second sword swing before lowering his guard.'],
    more: [['k5/spearman-thrust', 6, 140, 'Spearman', 'Long reach. Close in right after his thrust.']] },
  { k: 6, fa: 'ارژنگِ دیو', name: 'Arzhang Div', art: ['k6/arzhang-smash', 5, 136],
    tale: 'Arzhang was a chieftain of the Divs, camped with his horde before the mountains. Rostam rode into the camp at dawn with Olad as his guide, roared his name, and struck Arzhang\'s head from his shoulders.',
    how: ['He stalks you, then raises his axe for <b>two or, when wounded, three blows</b>. A <b>red glow</b> shows where each will land.', '<b>Floor glows: leap onto a platform.</b> <b>Platforms glow: drop to the ground.</b>', 'Wait for the sequence to end: <b>he rests on his axe, then strike</b>. At close range his low axe stance warns of a stomp: jump its short shockwave.', 'If he <b>stamps and flushes red</b>, he will <b>charge</b>: leap onto a ledge. If he hits the wall he is <b>dazed: strike!</b>'],
    more: [['k6/divwarrior-smash', 8, 148, 'Div warrior', 'Turns slowly. Drop behind him and strike his back; jump his shockwave.'],
      ['k6/firediv-throw', 9, 112, 'Fire Div', 'Keeps its distance and lobs fireballs. Run in after a throw, or jump the flame.'],
      ['k6/ghul-leap', 9, 112, 'Ghul', 'Scuttles on all fours and pounces. Jump its leap, then strike as it lands.'],
      ['k3/bat-fly', 8, 108, 'Bat', 'Pesters you on the high platform. Swing up at it.']] },
  { k: 7, fa: 'دیوِ سپید', name: 'The White Div', art: ['k7/whitediv-smash', 9, 204],
    tale: 'The White Div held King Kay Kavus captive in a cave as dark as night, beyond seven mountains. Only the blood of its heart could give the blinded king back his sight. Rostam fought it until the cave ran with blood and sweat.',
    how: ['When <b>the floor glows blue</b> he raises his club: <b>jump onto the ice ledge</b>.', 'His slam shakes the whole floor, and his <b>club sticks in the ice</b>: <b>drop down and strike!</b>', 'Linger on the ledge and he roars: where <b>a light shines</b>, an <b>icicle falls</b> a second later. Move clear of both marks, then <b>strike while he is spent</b>!', 'If he <b>stamps and flushes red</b>, he will <b>charge</b>: leap onto a ledge. If he hits the wall he is <b>dazed: strike!</b>'],
    more: [['k6/divwarrior-smash', 8, 148, 'Div warrior', 'Three blows. Strike his back while he turns.'], ['k3/bat-fly', 8, 108, 'Bat', 'Swing up at it as it swoops.']] },
  { k: 0, tab: '\u2726', kick: 'Rostam\'s allies', fa: 'یاران', name: 'Rakhsh and the Simurgh', art: ['simurgh-fly', 9, 150],
    tale: 'Rostam never rides alone. Rakhsh, the rose-red horse no other rider could tame, carries him and fights beside him; and the Simurgh, the wise great bird who raised his father Zal, answers when a feather of hers is burned.',
    how: ['Gather <b>eight provisions</b> in a labour and <b>Rakhsh</b> is well fed: he gallops in to kick the boss once.', `Every provision fills your <b>Farr</b>. When it is full, press ${keyHTML('farr')} (or tap Farr) and the Simurgh's light strikes every foe on screen.`, 'Three <b>Simurgh feathers</b> hide in every labour, on its highest perches. Find all twenty-one for <b>the Simurgh\'s blessing</b>: one more heart, for ever.', `Rostam's own arts: <b>dodge</b> (${keyHTML('dodge')}), a <b>heavy blow</b> (hold Strike after a swing), and a <b>three-blow combo</b>.`],
    more: [['k3/rakhsh-gallop', 8, 104, 'Rakhsh', 'Carries Rostam through the third labour, and rears to warn of the dragon.'], ['simurgh-fly', 9, 150, 'The Simurgh', 'Drops a feather after every victory. Take it to end the labour.']] }
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
  $('gtabs').innerHTML = GUIDE.map((x, j) => `<button class="${j === gpg ? 'sel' : ''}" data-g="${j}" aria-label="${x.kick || 'Khan ' + ROMAN[x.k]}: ${x.name}">${x.tab || ROMAN[x.k]}</button>`).join('');
  $('gtabs').querySelectorAll('button').forEach(b => b.onclick = () => showGuide(+b.dataset.g));
  $('gleaf').innerHTML = `<div class="gcard"><div class="gport k${g.k}">${mini(g.art, 180)}</div>
    <div class="gtext"><div class="fa">${g.fa}</div><h2>${g.name}</h2><p class="kick">${g.kick || `Khan ${ROMAN[g.k]} &middot; ${NAMES[g.k][0]}`}</p><p class="gtale">${g.tale}</p></div></div>
    <div class="ghow"><h3>${g.k ? 'How to beat it' : 'How they help'} ${g.k ? '<span class="gkey"><i class="kz"></i>stars: dazed, strike now</span>' : ''}</h3><ol>${g.how.map(h => `<li>${h}</li>`).join('')}</ol></div>
    <h3 class="galso">${g.k ? 'Also on this road' : 'Who they are'}</h3><div class="gmore">${g.more.map(([src, n, h, name, tip]) => `<div>${mini([src, n, h], 64)}<p><b>${name}</b>${tip}</p></div>`).join('')}</div>`;
  refreshControlLabels($('gleaf')); $('gleaf').scrollTop = 0; animateMinis();
}
function openGuide(n) {
  if (playing) setPaused(true);
  guideFrom = document.querySelector('.ov:not(.hidden):not(#s-guide)'); guideFrom?.classList.add('hidden');
  $('s-guide').classList.remove('hidden'); showGuide(Math.max(0, GUIDE.findIndex(g => g.k === n))); $('gNext').focus();
}
function closeGuide() { $('s-guide').classList.add('hidden'); if (guideFrom) { guideFrom.classList.remove('hidden'); guideFrom.querySelector('.btn')?.focus(); } else openMap(false); }
// where each labour sits on the night map (percent of its width and height): river reeds, desert, the dragon's hills, garden, castle, Div camp, cave
const MAP_AT = [null, [12.5, 51], [25, 56], [40, 40], [49, 57], [61.5, 42], [76.5, 52], [92.5, 48]];
// the gentle road: two more hearts, a longer breath after each wound, bosses with less life, and slower thirst
const gentle = () => store.get('sh-diff') === 'gentle', legend = () => store.get('sh-diff') === 'legend';   // the three roads: gentle, the hero's, the legend's
const feathers = () => { try { return JSON.parse(store.get('sh-feathers') || '{}'); } catch (e) { return {}; } };
// stars for a labour: one for finishing it, one for finishing with half your hearts or more, one for all three of its
// feathers; the best ever is kept, and a labour finished on the legend's road is marked
const starsOf = () => { try { return JSON.parse(store.get('sh-stars') || '{}'); } catch (e) { return {}; } };
const legendsOf = () => { try { return JSON.parse(store.get('sh-legend') || '{}'); } catch (e) { return {}; } };
const bestOf = n => +(store.get(n === 1 ? 'sh-best' : 'sh-best-' + n) || 0);
function renderMap() {
  const u = unlocked(), F = feathers(), road = $('road'), opening = $('s-map').classList.contains('hidden');
  road.querySelectorAll(':scope > :not(.road-fx)').forEach(e => e.remove());   // the living map layer stays between renders
  road.insertAdjacentHTML('beforeend', NAMES.slice(1).map(([name], i) => {
      const n = i + 1, open = n <= u && LEVELS[n], done = !!bestOf(n) || n < u, [x, y] = MAP_AT[n];
      const fc = [0, 1, 2].filter(k => F[n + ':' + k]).length, st = starsOf()[n] || 0, lg = legendsOf()[n], best = bestOf(n);
      const tip = open ? `${st ? `<i class="${lg ? 'lg' : ''}">${'\u2605'.repeat(st)}${'\u2606'.repeat(3 - st)}</i>` : done ? '' : 'The road lies open<br>'}Simurgh feathers ${fc} / 3${best ? `<br>Best time ${fmtTime(best * 1000)}` : ''}` : `Win Khan ${ROMAN[n - 1]} to open this road`;
      return `<li style="left:${x}%;top:${y}%"><button data-n="${n}" class="${n === pick ? 'sel' : ''} ${done ? 'done' : ''} ${open && !done ? 'next' : ''}" ${open ? '' : 'disabled'} aria-current="${n === pick ? 'step' : 'false'}" aria-label="Labour ${n}: ${name}${open ? '' : ' (locked)'}, ${fc} of 3 feathers${st ? `, ${st} of 3 stars` : ''}${best ? `, best time ${fmtTime(best * 1000)}` : ''}">${ROMAN[n]}</button><span class="pin-label" aria-hidden="true">${name}</span>${open && st ? `<span class="st${lg ? ' lg' : ''}" aria-hidden="true">${'\u2605'.repeat(st)}${'\u2606'.repeat(3 - st)}</span>` : ''}${open ? `<span class="fc${fc === 3 ? ' all' : ''}" aria-hidden="true">${'<i></i>'.repeat(fc)}${'<i class="no"></i>'.repeat(3 - fc)}</span>` : ''}<span class="pin-tip${x < 20 ? ' at-l' : x > 80 ? ' at-r' : ''}" aria-hidden="true"><b>Khan ${ROMAN[n]} &middot; ${name}</b>${tip}</span></li>`;
    }).join(''));
  $('road').querySelectorAll('button').forEach(b => {
    b.onclick = () => { pick = +b.dataset.n; renderMap(); $('road').querySelector(`[data-n="${pick}"]`)?.focus({ preventScroll: true }); };
    b.onkeydown = e => { if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(e.key)) return; e.preventDefault(); e.stopPropagation(); pick = e.key === 'Home' ? 1 : e.key === 'End' ? Math.min(u, LABOURS) : Phaser.Math.Clamp(pick + (e.key === 'ArrowRight' ? 1 : -1), 1, Math.min(u, LABOURS)); renderMap(); $('road').querySelector(`[data-n="${pick}"]`)?.focus({ preventScroll: true }); };
  });
  const ready = !!LEVELS[pick] && pick <= u, best = bestOf(pick);
  const found = [0, 1, 2].filter(k => F[pick + ':' + k]).length;
  $('journeyTitle').textContent = NAMES[pick][0];
  $('journeyChapter').textContent = `Khan ${ROMAN[pick]}`;
  $('journeyStatus').textContent = best ? 'A road already travelled' : pick === 1 ? 'The journey begins' : 'The next chapter awaits';
  const art = $('journeyArt'), artPath = storyArt(`khan${pick}-intro`);
  cardArt(art, artPath); art.alt = `${NAMES[pick][0]}: ${BLURB[pick]}`;
  $('mapInfo').innerHTML = `${BLURB[pick]}<span class="ftot">Simurgh feathers <b>${found} / 3</b>${best ? `<br>Best time <b>${fmtTime(best * 1000)}</b>` : ''}${Object.keys(F).length >= 21 ? '<br>The Simurgh blesses you.' : ''}</span>`;
  $('rideBtn').textContent = best ? 'Replay labour' : pick === 1 ? 'Begin journey' : 'Continue journey';
  requestAnimationFrame(revealMapSelection);
  $('rushBtn').classList.toggle('hidden', !bestOf(LABOURS)); const rb = +(store.get('sh-rush') || 0); $('rushBtn').innerHTML = `Boss rush${rb ? ` <small>${fmtTime(rb)}</small>` : ''}`;
  $('rideBtn').disabled = !ready; $('mapTale').disabled = !document.getElementById('tale-' + pick);
  try { mapSync(u, opening); } catch (_) { /* The living map is decoration and must never block the menu. */ }
}
function revealMapSelection() {
  if ($('s-map').classList.contains('hidden')) return;
  const pin = $('road').querySelector(`[data-n="${pick}"]`), viewport = $('mapScroll');
  if (!pin) return; const box = pin.getBoundingClientRect(), view = viewport.getBoundingClientRect();
  if (box.left < view.left + 35 || box.right > view.right - 35) viewport.scrollTo({ left: viewport.scrollLeft + box.left - view.left - view.width / 2 + box.width / 2, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
}
addEventListener('resize', () => requestAnimationFrame(revealMapSelection));
// The painted road on assets/ui/map-night.png, traced from the artwork (percent of the map). ROAD_PATH[0] rides in from
// the river bank to the first labour and ROAD_PATH[k] runs from labour k to labour k + 1, up the dragon's trail and in
// through the garden gate, so Rostam keeps to the road and the travelled stretch glows where it is painted.
const ROAD_PATH = [[[4.36,51.04],[5.67,50.9],[6.25,51.27],[7.7,51.3],[9.45,50.79],[11.34,52.08],[12.05,51.96],[12.5,51.04]],[[12.5,51.04],[14.83,51.01],[16.57,49.6],[17.59,49.25],[22.67,49.25],[23.84,50.03],[25.53,53.12],[25.71,54.43],[25.0,55.99]],[[25.0,55.99],[25.58,54.46],[26.16,54.29],[26.97,55.73],[27.6,58.59],[27.6,62.76],[25.65,66.67],[25.44,68.75],[25.73,69.76],[26.74,70.8],[30.09,70.8],[32.12,68.61],[33.72,68.11],[36.56,63.02],[36.61,61.72],[35.66,58.07],[35.63,56.77],[36.41,54.69],[36.32,53.65],[36.61,52.84],[36.7,50.0],[37.5,48.53],[39.08,46.76],[39.45,45.84],[39.03,44.01],[38.1,42.45],[38.01,41.7],[38.52,41.0],[39.97,40.1]],[[39.97,40.1],[38.66,40.49],[38.01,41.67],[38.01,42.16],[38.9,43.75],[39.46,46.09],[38.37,47.17],[37.57,48.47],[37.43,51.56],[36.36,53.65],[36.35,54.95],[35.63,56.77],[35.77,59.11],[36.61,61.98],[36.56,63.02],[33.76,68.2],[38.23,68.32],[39.24,69.3],[41.13,72.79],[44.48,74.97],[45.78,75.26],[49.13,75.14],[50.01,73.44],[49.86,72.4],[49.84,62.76],[48.63,60.15],[48.29,57.82],[48.55,57.23],[48.98,57.03]],[[48.98,57.03],[48.55,57.23],[48.29,57.82],[48.63,60.15],[49.64,62.27],[49.84,63.54],[49.87,72.66],[50.87,74.74],[52.62,76.04],[59.3,76.04],[59.74,75.75],[62.16,71.35],[63.08,67.45],[63.06,61.46],[61.68,58.07],[61.06,55.73],[61.11,52.86],[62.05,51.04],[62.21,50.26],[62.19,44.53],[61.85,42.71],[61.48,41.93]],[[61.48,41.93],[62.01,43.75],[62.13,45.57],[63.81,48.61],[64.39,49.19],[66.13,49.51],[68.6,50.64],[70.93,52.96],[72.97,56.39],[73.55,56.22],[75.74,52.28],[76.45,52.08]],[[76.45,52.08],[75.87,52.03],[75.15,52.9],[73.18,56.51],[73.13,67.45],[75.15,71.32],[76.6,72.53],[77.47,72.91],[80.23,72.88],[81.68,70.57],[82.35,69.01],[83.16,63.8],[85.9,59.15],[86.77,58.65],[87.79,57.29],[91.12,51.04],[91.44,49.74],[92.44,47.92]]];
// lights painted on the same map, in its own pixels: castle windows and garden lamps [x, y, w, h], camp fires
// [x, y, strength], its brightest stars [x, y, size], and faint stars added to the empty sky
const MAP_PX = [688, 384];
const MAP_LIGHTS = {
  windows: [[404, 76, 1, 5], [444, 76, 1, 5], [415, 94, 3, 6], [424, 94, 1, 6], [431, 94, 3, 6], [444, 95, 2, 3], [376, 108, 2, 3], [399, 127, 2, 4], [448, 127, 1, 4]],
  lamps: [[356, 201, 2, 3], [330, 203, 3, 4], [356, 206, 3, 1], [383, 209, 2, 4], [307, 210, 2, 1], [331, 234, 2, 8], [355, 234, 3, 8], [328, 249, 3, 3], [358, 250, 3, 2],
    [330, 300, 5, 3], [354, 300, 4, 3], [343, 349, 2, 2], [389, 358, 2, 5], [342, 359, 3, 4]],
  fires: [[526, 196, 1], [531, 248, 0.5], [521, 318, 0.5]],
  stars: [[643, 4, 1], [636, 22, 1], [111, 25, 2], [533, 28, 1], [655, 48, 1], [681, 55, 1], [605, 60, 1]],
  faint: [[124, 12], [148, 19], [169, 7], [175, 32], [208, 30], [246, 17], [286, 10], [312, 26], [339, 5], [385, 15], [408, 3],
    [426, 18], [451, 12], [466, 28], [483, 13], [515, 25], [548, 7], [579, 21], [605, 7], [626, 24], [648, 4], [667, 26]]
};
const stillMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
// The living map: the road travelled so far glows, mist hangs over the lands not yet reached, Rostam rides to the chosen
// labour and the painted fires, lamps, stars and snow stir. All of it sits on one aria-hidden layer under the pins, and
// its loop runs only while the map is on screen.
const MF = { layer: null, geo: null, ctx: null, to: 1, u: 1, r: null, face: 1, ride: null, glow: null, prog: 0, fresh: 0, want: null, run: 0, last: 0, life: 0, parts: [], flies: null, trail: -1 };
function mapLayer(road) {
  if (MF.layer?.isConnected) return;
  const li = document.createElement('li'); li.className = 'road-fx'; li.setAttribute('aria-hidden', 'true');
  li.innerHTML = `<div class="road-mist"></div><svg class="road-trail"><path class="trail-halo"/><path class="trail-core"/><path class="trail-spark"/></svg>` +
    `<canvas class="road-life" width="${MAP_PX[0]}" height="${MAP_PX[1]}"></canvas><i class="road-rider"><b></b></i>`;
  road.prepend(li); MF.layer = li; MF.ctx = li.querySelector('canvas').getContext('2d'); MF.geo = null; MF.r = null;
  if (window.ResizeObserver) new ResizeObserver(() => { MF.geo = null; mapKick(); }).observe(road);
}
// the road in screen pixels, with the distance along it to every labour's pin
function mapGeom() {
  if (MF.geo) return MF.geo;
  const road = $('road'), w = road.clientWidth, h = road.clientHeight; if (!w || !h) return null;
  const pts = [], stops = [0]; let len = 0;
  ROAD_PATH.forEach((seg, k) => {
    seg.forEach(([x, y], i) => {
      if (k && !i) return;
      const p = [x * w / 100, y * h / 100], q = pts[pts.length - 1];
      if (q) len += Math.hypot(p[0] - q[0], p[1] - q[1]);
      pts.push([p[0], p[1], len]);
    });
    stops.push(len);
  });
  const fit = Math.min(h * 0.15, w * 0.085), size = Math.round(Phaser.Math.Clamp(fit, 46, 76));
  MF.layer.querySelector('.road-rider').classList.toggle('cramped', fit < 40);   // on a map too small for him the pins come first
  MF.layer.querySelector('svg').setAttribute('viewBox', `0 0 ${w} ${h}`); MF.layer.style.setProperty('--rs', size + 'px');
  MF.trail = -1; return (MF.geo = { w, h, pts, stops, size, rest: [] });
}
function roadAt(g, d) {
  const P = g.pts; d = Phaser.Math.Clamp(d, 0, P[P.length - 1][2]);
  let i = 1; while (i < P.length - 1 && P[i][2] < d) i++;
  const a = P[i - 1], b = P[i], t = (d - a[2]) / ((b[2] - a[2]) || 1);
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, b[0] - a[0]];
}
// positions are kept in labours (2.5 is halfway from the second pin to the third), so a resize never loses the rider
const roadDist = (g, r) => { const k = Phaser.Math.Clamp(Math.floor(r), 0, LABOURS - 1); return g.stops[k] + (g.stops[k + 1] - g.stops[k]) * (r - k); };
function roadR(g, d) {
  for (let k = 0; k < LABOURS; k++) if (d <= g.stops[k + 1]) return k + (d - g.stops[k]) / ((g.stops[k + 1] - g.stops[k]) || 1);
  return LABOURS;
}
// Rostam waits on the road short of a labour's pin, at the nearest spot where he hides no pin and no name
function restR(g, n) {
  if (g.rest[n] != null) return g.rest[n];
  const s = g.size, end = g.stops[n], far = end - (end - g.stops[n - 1]) * 0.85;
  const hit = (a, b) => a[0] < b[2] && b[0] < a[2] && a[1] < b[3] && b[1] < a[3];
  const keep = MAP_AT.slice(1).flatMap(([x, y]) => { const px = x * g.w / 100, py = y * g.h / 100; return [[px - 28, py - 40, px + 28, py + 28], [px - 50, py + 38, px + 50, py + 64]]; });   // pins with their stars, and their labels
  const clear = d => { const [x, y] = roadAt(g, d), me = [x - s * 0.28, y - s * 0.8, x + s * 0.28, y]; return keep.every(k => !hit(me, k)); };
  let d = end - s * 0.4; while (d > far && !clear(d)) d -= 3;
  if (d <= far) d = end - Math.min(s * 0.75, (end - g.stops[n - 1]) * 0.6);   // no clear spot on a short road: wait just short of the pin
  return (g.rest[n] = roadR(g, d));
}
const mistAt = n => n >= LABOURS ? 100 : (MAP_AT[n][0] + MAP_AT[n + 1][0]) / 2 - 2;
// called by renderMap: a newly opened map shows any road won since it was last seen, a new choice sends Rostam riding
function mapSync(u, opening) {
  mapLayer($('road'));
  let seen = +(store.get('sh-map-seen') || 0);
  if (!seen || seen > u) { seen = u; store.set('sh-map-seen', u); }   // a new save, or progress cleared: nothing to reveal
  MF.u = u; MF.to = pick;
  if (opening || MF.r == null) MF.want = { seen };
  else if (!MF.ride || MF.ride.n !== pick) MF.ride = { r0: MF.r, n: pick, t0: performance.now(), dur: null };
  mapKick();
}
function mapKick() { if (!MF.run) MF.run = requestAnimationFrame(mapTick); }
document.addEventListener('visibilitychange', () => { if (!document.hidden) mapKick(); });
function mapTick(now) {
  MF.run = 0;
  if ($('s-map').classList.contains('hidden') || document.hidden || !MF.layer) { MF.last = 0; return; }   // resumes when the map is opened again
  const g = mapGeom(); if (!g) return;   // not laid out yet: the resize observer calls again once it is
  const calm = stillMotion(), dt = MF.last ? Math.min(0.05, (now - MF.last) / 1000) : 0; MF.last = now;
  if (MF.want) {
    const { seen } = MF.want, reveal = !calm && seen < MF.u; MF.want = null;
    if (seen < MF.u) store.set('sh-map-seen', MF.u);
    MF.glow = reveal ? { p0: seen, p1: MF.u, t0: now + 350, dur: 1500 } : null; MF.prog = reveal ? seen : MF.u;
    MF.fresh = reveal ? MF.u : 0;
    MF.r = restR(g, reveal ? seen : MF.to); MF.face = Math.sign(roadAt(g, roadDist(g, MF.r) + 1)[2]) || 1;
    MF.ride = reveal && MF.to !== seen ? { r0: MF.r, n: MF.to, t0: now + 2050, dur: null } : null;
    MF.layer.querySelector('.road-rider').classList.add('on'); mapEdges();
    // on a phone the focused Begin button scrolls into view; start from the map's heading instead whenever both fit
    const sm = $('s-map'), top = sm.querySelector('.journey-map-heading').getBoundingClientRect().top - 12;
    if (innerWidth <= 760 && top < 0 && $('rideBtn').getBoundingClientRect().bottom - top <= innerHeight - 8) sm.scrollTop += top;
  }
  // the light runs along the newly won road, then the new labour's pin wakes
  if (MF.glow) {
    const k = Phaser.Math.Clamp((now - MF.glow.t0) / MF.glow.dur, 0, 1);
    MF.prog = MF.glow.p0 + (MF.glow.p1 - MF.glow.p0) * (k < 0.5 ? 2 * k * k : 1 - (-2 * k + 2) ** 2 / 2);
    if (k >= 1) {
      MF.glow = null; MF.prog = MF.u;
      const pin = $('road').querySelector(`[data-n="${MF.fresh}"]`); MF.fresh = 0;
      if (pin) { pin.classList.add('fresh'); setTimeout(() => pin.classList.remove('fresh'), 2300); }
    }
  } else MF.prog = MF.u;
  // the ride: eased along the road at a steady pace, facing the way he goes
  let r = restR(g, MF.to), moving = false;
  if (MF.ride) {
    const R = MF.ride, a = roadDist(g, R.r0), b = roadDist(g, restR(g, R.n));
    if (R.dur == null) R.dur = calm ? 0 : Phaser.Math.Clamp(Math.abs(b - a) / 0.42, 320, 2400);
    const k = R.dur ? (now - R.t0) / R.dur : 1;
    if (k >= 1) MF.ride = null;
    else {
      const e = Math.max(0, k), d = a + (b - a) * (e < 0.5 ? 2 * e * e : 1 - (-2 * e + 2) ** 2 / 2);
      r = roadR(g, d); moving = k > 0;
      const dx = roadAt(g, d + Math.sign(b - a))[0] - roadAt(g, d)[0]; if (moving && Math.abs(dx) > 0.05) MF.face = dx > 0 ? 1 : -1;
    }
  }
  if (!moving && !MF.ride) { const d = roadDist(g, r), dx = roadAt(g, d + 2)[0] - roadAt(g, d)[0]; if (Math.abs(dx) > 0.3) MF.face = dx > 0 ? 1 : -1; }
  MF.r = r;
  const [x, y] = roadAt(g, roadDist(g, r)), rider = MF.layer.querySelector('.road-rider');
  rider.style.transform = `translate(${x.toFixed(1)}px,${y.toFixed(1)}px) translate(-50%,-94%) scaleX(${MF.face})`;
  rider.classList.toggle('gallop', moving);
  // the travelled road and the mist beyond it
  const pd = roadDist(g, MF.prog);
  if (Math.abs(pd - MF.trail) > 0.5) {
    let s = ''; for (const p of g.pts) { if (p[2] > pd) break; s += (s ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1); }
    const e = roadAt(g, pd); s += pd > 0 ? 'L' + e[0].toFixed(1) + ' ' + e[1].toFixed(1) : '';
    for (const p of MF.layer.querySelectorAll('.road-trail path')) p.setAttribute('d', s);
    MF.trail = pd;
  }
  const k = Math.floor(MF.prog), f = MF.prog - k;
  MF.layer.querySelector('.road-mist').style.transform = `translateX(${(mistAt(k) + (mistAt(Math.min(LABOURS, k + 1)) - mistAt(k)) * f).toFixed(2)}%)`;
  if (calm) MF.ctx.clearRect(0, 0, MAP_PX[0], MAP_PX[1]);
  else if (now - MF.life > 33) { mapLife((now - (MF.life || now)) / 1000, now / 1000); MF.life = now; }
  if (!calm || MF.ride || MF.glow) mapKick();
}
// the painted world stirring, drawn in the map's own pixels: embers over the Div camp, snow on the White Div's peaks,
// fireflies in the reeds, guttering windows and lamps, and twinkling stars
function mapLife(dt, t) {
  const c = MF.ctx, L = MAP_LIGHTS, P = MF.parts, rnd = (a, b) => a + Math.random() * (b - a);
  dt = Math.min(dt, 0.1); c.clearRect(0, 0, MAP_PX[0], MAP_PX[1]);
  for (const [fx, fy, k] of L.fires) if (Math.random() < dt * 12 * k) P.push({ k: 0, x: fx + rnd(-3, 3), y: fy - 2, vx: rnd(-2, 2), vy: -rnd(9, 20), age: 0, max: rnd(1.4, 3), w: rnd(0, 6.3) });
  if (P.filter(p => p.k === 1).length < 42 && Math.random() < dt * 16) P.push({ k: 1, x: rnd(570, 700), y: -2, vx: -rnd(1, 4), vy: rnd(6, 12), age: 0, max: 60, w: rnd(0, 6.3) });
  MF.flies ||= Array.from({ length: 10 }, () => ({ x: rnd(14, 84), y: rnd(190, 360), w: rnd(0, 6.3), s: rnd(0.4, 0.9) }));
  c.globalCompositeOperation = 'lighter';
  const glow = (x, y, r, col, a) => { const gr = c.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, `rgba(${col},${a.toFixed(3)})`); gr.addColorStop(1, `rgba(${col},0)`); c.fillStyle = gr; c.fillRect(x - r, y - r, 2 * r, 2 * r); };
  L.windows.concat(L.lamps).forEach(([x, y, w, h], i) => {
    const f = 0.55 + 0.45 * Math.sin(t * (1.1 + (i % 5) * 0.31) + i * 2.1) * Math.sin(t * 0.63 + i);
    glow(x + w / 2, y + h / 2, 4 + Math.max(w, h) / 2, '255,176,80', 0.16 + f * 0.2);
  });
  for (const [x, y, k] of L.fires) { const f = 0.75 + 0.25 * Math.sin(t * 8.3 + x) * Math.sin(t * 5.1 + y); glow(x, y, 16 * k + 6, '255,128,48', 0.3 * k * f + 0.06); }
  for (const [x, y, s] of L.stars) {
    const f = Math.sin(t * 1.7 + x * 0.37) ** 8;
    if (f > 0.2) { c.fillStyle = `rgba(214,224,255,${(0.45 * f).toFixed(3)})`; c.fillRect(x - 1, y + (s - 1) / 2, s + 2, 1); c.fillRect(x + (s - 1) / 2, y - 1, 1, s + 2); }
  }
  for (const [x, y] of L.faint) { const f = 0.5 + 0.5 * Math.sin(t * (0.6 + (x % 7) * 0.13) + y); c.fillStyle = `rgba(200,212,255,${(0.08 + 0.42 * f * f).toFixed(3)})`; c.fillRect(x, y, 1, 1); }
  for (const fl of MF.flies) {
    fl.w += dt * fl.s; fl.x += Math.cos(fl.w * 1.3) * dt * 4; fl.y += Math.sin(fl.w) * dt * 3;
    const a = Math.max(0, Math.sin(fl.w * 2.2)) ** 2;
    if (a > 0.02) { glow(fl.x, fl.y, 3.5, '200,255,120', 0.35 * a); c.fillStyle = `rgba(236,255,170,${(0.9 * a).toFixed(3)})`; c.fillRect(Math.round(fl.x), Math.round(fl.y), 1, 1); }
  }
  c.globalCompositeOperation = 'source-over';
  for (let i = P.length - 1; i >= 0; i--) {
    const p = P[i]; p.age += dt; p.w += dt * 2;
    p.x += (p.vx + Math.sin(p.w) * (p.k ? 3 : 5)) * dt; p.y += p.vy * dt;
    if (p.age > p.max || p.y > MAP_PX[1] || (p.k && p.x < 540)) { P.splice(i, 1); continue; }
    const life = p.age / p.max;
    c.fillStyle = p.k ? 'rgba(236,246,255,.78)' : life < 0.3 ? `rgba(255,236,160,${(1 - life).toFixed(3)})` : `rgba(255,${Math.round(170 - life * 90)},60,${(1 - life).toFixed(3)})`;
    c.fillRect(Math.round(p.x), Math.round(p.y), 1, 1);
  }
}
// soft edges on the journey map whenever more of it lies off to either side
function mapEdges() {
  const v = $('mapScroll'), max = v.scrollWidth - v.clientWidth;
  v.parentNode.classList.toggle('more-l', v.scrollLeft > 4); v.parentNode.classList.toggle('more-r', v.scrollLeft < max - 4);
}
$('mapScroll').addEventListener('scroll', mapEdges, { passive: true }); addEventListener('resize', mapEdges);
// the chapter painting crossfades: the old one stays until the new one is ready, so the card never goes blank
function cardArt(art, src) {
  if (art.getAttribute('src') === src) return;
  const box = art.parentNode;
  if (!box.querySelector('.journey-art-old:not(.out)') && art.complete && art.naturalWidth) {
    const old = art.cloneNode(); old.removeAttribute('id'); old.removeAttribute('fetchpriority'); old.alt = ''; old.className = 'journey-art-old'; art.after(old);
  }
  box.classList.toggle('loading', !box.querySelector('.journey-art-old:not(.out)'));
  art.src = src;
  const shown = () => {
    if (art.getAttribute('src') !== src) return;
    box.classList.remove('loading');
    for (const o of box.querySelectorAll('.journey-art-old:not(.out)')) { o.classList.add('out'); setTimeout(() => o.remove(), 400); }
  };
  if (art.decode) art.decode().then(shown, shown);
  else { art.addEventListener('load', shown, { once: true }); art.addEventListener('error', shown, { once: true }); }
}
// on a phone the four menu links fold into one Menu button
$('journeyMenu').onclick = () => { const open = $('journeyMenu').getAttribute('aria-expanded') !== 'true'; $('journeyMenu').setAttribute('aria-expanded', String(open)); $('journeyMenu').parentNode.classList.toggle('open', open); };
$('journeyMenu').parentNode.addEventListener('click', e => { if (e.target.closest('.journey-nav-link:not(#journeyMenu)')) { $('journeyMenu').setAttribute('aria-expanded', 'false'); $('journeyMenu').parentNode.classList.remove('open'); } });
function openMap(e) {
  if (e !== false) music(A.want);                                  // a click: the menu theme may begin
  if (playing) setPaused(true);
  mapFrom = document.querySelector('.ov:not(.hidden):not(#s-map)'); mapFrom?.classList.add('hidden');
  $('s-map').classList.toggle('home', !mapFrom); $('mapClose').classList.toggle('hidden', !mapFrom);   // the map is also the home screen
  pick = Math.min(unlocked(), LABOURS); if (!LEVELS[pick]) pick = cur;
  renderMap(); renderDiff(); $('s-map').classList.remove('hidden'); $('rideBtn').focus(); if (!mapFrom) embers();
}
// embers and sparks rising over the home screen's panorama; the loop runs only while the home map is on screen
let embRun = false;
function embers() {
  if (embRun) return; const c = $('emb'), x = c.getContext('2d'); embRun = true; const P = [];
  const fit = () => { c.width = innerWidth; c.height = innerHeight; };
  fit(); addEventListener('resize', fit);
  const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const step = () => {
    const m = $('s-map'); if (m.classList.contains('hidden') || !m.classList.contains('home')) { embRun = false; removeEventListener('resize', fit); return; }
    x.clearRect(0, 0, c.width, c.height);
    if (!still && P.length < 90 && Math.random() < 0.5) P.push({ x: Math.random() * c.width, y: c.height + 8, v: 0.4 + Math.random() * 1.1, w: Math.random() * 6.28, s: 1 + Math.random() * 2.2, h: Math.random() < 0.8 ? 30 : 48, life: 1 });
    for (let i = P.length - 1; i >= 0; i--) {
      const p = P[i]; p.y -= p.v; p.w += 0.03; p.x += Math.sin(p.w) * 0.45; p.life -= 0.0022;
      if (p.y < -10 || p.life <= 0) { P.splice(i, 1); continue; }
      const a = Math.min(1, p.life * 1.6) * (0.55 + Math.sin(p.w * 3) * 0.25);
      x.fillStyle = `hsla(${p.h},100%,${60 + p.s * 6}%,${a})`; x.fillRect(Math.round(p.x), Math.round(p.y), Math.ceil(p.s), Math.ceil(p.s));
      x.fillStyle = `hsla(${p.h},100%,60%,${a * 0.18})`; x.fillRect(Math.round(p.x) - 2, Math.round(p.y) - 2, Math.ceil(p.s) + 4, Math.ceil(p.s) + 4);
    }
    requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}
// the road's difficulty, chosen on the home map: the gentle road (more hearts, weaker bosses) or the hero's road
function renderDiff() { const d = store.get('sh-diff') || 'hero'; $('journeyDifficulty').textContent = { gentle: 'Gentle road', hero: "Hero's road", legend: "Legend's road" }[d] || "Hero's road"; document.querySelectorAll('[data-diff]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.diff === d))); }
document.querySelectorAll('[data-diff]').forEach(b => b.onclick = () => { store.set('sh-diff', b.dataset.diff); renderDiff(); sfx('coin'); });
function closeMap() { $('s-map').classList.add('hidden'); if (mapFrom) { mapFrom.classList.remove('hidden'); mapFrom.querySelector('.btn')?.focus(); } else openMap(false); }
document.querySelectorAll('[data-map]').forEach(b => b.onclick = openMap);
$('journeySound').onclick = () => $('muteBtn').click();
$('mapClose').onclick = closeMap; $('rideBtn').onclick = () => { if (pick === 1 && !store.get('sh-prologue')) { store.set('sh-prologue', '1'); cinema('opening', () => begin(1)); } else begin(pick); };
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
$('offerBtn').onclick = () => { if (!playing) return; const s = game.scene.getScene('play'); if (s?.nearBell >= 0) s.ringBell(s.nearBell); else if (s?.atAltar) openTemple(); else if (s?.nearTrial) s.startTrial(); };
$('farrBtn').onclick = () => { const sc = game.scene.getScene('play'); if (playing && sc?.farr >= 100) sc.farrBlast(); };
// The tale in pictures: the prologue, a painting before and after each labour, and the final ending and credits.
const CINE = {
  intro1: [["khan1-intro", "شیر نیستان", "After a long day on the road to Mazandaran, Rostam slept among the reeds. Rakhsh grazed nearby, but in the darkness a lion watched. While the hero dreamed, his faithful horse stood guard."]],
  outro1: [["khan1-outro", "شیر نیستان", "The lion of the reeds lay defeated. Rostam rested a hand on faithful Rakhsh, his companion through the night. Together they turned toward the desert, where a fiercer thirst awaited."]],
  intro2: [["khan2-intro", "بیابان بی‌آب", "The sun burned over an endless waste. Rostam and Rakhsh pressed on without water, until strength began to leave them. The hero who had faced armies now bowed his head and prayed for a spring."]],
  outro2: [["khan2-outro", "بیابان بی‌آب", "The Scorpion Queen was defeated, and the hidden spring ran clear. Rostam drank, let Rakhsh drink, and gave thanks for the ram that had shown the way. Beyond the water, night and another labour awaited."]],
  intro3: [["khan3-intro", "نبرد با اژدها", "When darkness fell, Rostam lay down to rest. A terrible dragon came out of the night. Rakhsh stamped and cried to wake him, but each time the hero rose, the creature vanished into shadow."]],
  outro3: [["khan3-outro", "نبرد با اژدها", "At last Rostam saw the dragon. With Rakhsh beside him, he fought the monster and overcame it. Once more, courage alone had not been enough: the watchful horse had helped carry the hero through."]],
  intro4: [["khan4-intro", "زن جادوگر", "In a green garden, Rostam found a feast and a beautiful woman offering wine. After hunger and hardship, the welcome seemed a blessing. Yet beneath the sweetness lay an enchantment."]],
  outro4: [["khan4-outro", "زن جادوگر", "When Rostam spoke the name of God, the disguise broke and the sorceress stood revealed. He overcame her enchantment and left the false garden behind. The road led deeper into Mazandaran."]],
  intro5: [["khan5-intro", "اولاد", "Beyond the wilderness lay fields guarded by Olad and his men. Rostam’s passage brought a challenge, and the warden rode out to confront the stranger. The road to the captive king would not open peacefully."]],
  outro5: [["khan5-outro", "اولاد", "Rostam defeated Olad and took him captive. In return for his life, Olad promised to show the way to the demons and their strongholds. Mercy had won the hero a guide for the trials ahead."]],
  intro6: [["khan6-intro", "ارژنگ دیو", "Olad led Rostam to the camp of Arzhang, a mighty demon chief. Fires glowed between the tents, and warriors gathered beneath dark banners. Beyond this camp lay the captive king and the final terror."]],
  outro6: [["khan6-outro", "ارژنگ دیو", "Arzhang fell, and the demon host scattered. Rostam’s road opened at last toward Kay Kavus. But the king’s sight could be restored only after the White Div was overcome; the greatest labour remained."]],
  intro7: [["khan7-intro", "دیو سپید", "Beyond the mountains waited a cavern filled with darkness. Inside lay the White Div, whose sorcery had blinded Kay Kavus and his army. Rostam entered alone, knowing that the king’s hope rested on this final battle."]],
  opening: [
    ['open1', 'شاهنامه', 'Listen… and I will tell you a tale from the Book of Kings. Long ago, Kay Kavus sat on the throne of Iran: a king as proud as he was easily flattered. One night a minstrel came to his court and sang of Mazandaran. Of gardens that never fade. Of air sweet with roses. Of treasure without end. The king listened, and he wanted it all. But the minstrel… was a Div in disguise.'],
    ['open2', 'دیوِ سپید', 'Deaf to the counsel of his wisest men, the king marched north. And in a single night, the White Div rose. He called down a storm of sorcery, of hail and darkness and stone. When at last it lifted, Kay Kavus and all his army were blind. And the Divs led them away in chains.'],
    ['open3', 'زابلستان', 'Only one messenger escaped. Through the dark he rode, without rest, without sleep, all the way to Zabulistan… to old Zal, and to his son Rostam: the mightiest hero Iran had ever known.'],
    ['open4', 'دو راه', '"Two roads lead to Mazandaran," said Zal. "The long road is safe, and takes six months. The short road takes but two weeks… yet it passes through seven terrors. And no man who has walked it has ever come back."'],
    ['open5', 'رستم و رخش', 'Rostam would not wait six months. He put on his coat of tiger skin, took up his ox-headed mace, and saddled Rakhsh: the fiery red horse no other rider could tame. "Two weeks," he said. "The king has waited long enough."'],
    ['open6', 'هفت خوان', 'At dawn they rode out together, the hero and his horse. Seven labours lay between Rostam and his king. And this… is where your journey begins.']
  ],
  ending: [
    ['khan7-outro', 'پایانِ هفت‌خان', 'The cavern fell silent. Seven labours lay behind Rostam; the king\'s sight remained to be restored.'],
    ['end1', 'خونِ دلِ دیو', 'And so the White Div fell. Rostam took the blood of the demon\'s heart and touched it to the eyes of the king. And light came flooding back: to Kay Kavus, and to every one of his warriors.'],
    ['end2', 'آزادی', 'Out of the dark, the army of Iran walked into the morning, and Rostam rode at its head. High above them the Simurgh turned in the sun, watching over the son of the child she had once raised.'],
    ['end3', 'جهان‌پهلوان', 'In the hall of kings, Kay Kavus honoured Rostam before the whole court, and old Zal wept with pride. Seven labours. Seven terrors. And the hero had overcome them all. Here ends the tale… but the Book of Kings has many more.']
  ]
};
const CREDITS = `<header class="credit-heading"><p class="credit-eyebrow">A journey through Ferdowsi’s Shahnameh</p><div class="fa" lang="fa">هفت خوانِ رستم</div><h2>The Seven Labours of Rostam</h2><p class="credit-thanks">Thank you for playing.</p></header>
  <section class="credit-cast" aria-label="Legendary heroes">
    <figure><img src="assets/ui/cast-sohrab.png?v=${V}" alt="Sohrab with his sword and shield" width="1020" height="1542"><figcaption>Sohrab</figcaption></figure>
    <figure><img class="credit-hero" src="assets/ui/title-rostam.png?v=${V}" alt="Rostam in his tiger-skin coat" width="360" height="300"><figcaption>Rostam</figcaption></figure>
    <figure><img src="assets/ui/cast-arash.png?v=${V}" alt="Arash the Archer with his bow and arrow" width="1020" height="1542"><figcaption>Arash the Archer</figcaption></figure>
  </section>
  <div class="credit-details"><section><h3>Created by</h3><p>Arash Nassirpour</p><h3>Inspired by</h3><p>Ferdowsi’s <em>Shahnameh</em><br>The Book of Kings, c. 1010 CE</p></section>
  <section><h3>Music &amp; sound</h3><p>Pixabay · alex-morgan<br>“Battle Boss Fight Game Music”<br>OpenGameArt · “100 CC0 SFX #2”</p></section>
  <section><h3>Voices</h3><p>ElevenLabs</p><h3>Game engine</h3><p>Phaser 3</p></section></div>
  <footer class="credit-footer">The road waits for the next hero.</footer>`;
let cine = null;
// the boss rush: the seven foes one after another, from each arena's door; hearts carry over, one restored between
let rush = null;
const RUSH_AT = { 1: 84, 2: 150, 3: 110, 4: 111, 5: 111, 6: 121, 7: 145 };
function rushElapsed() { return performance.now() - rush.t0 - rush.pausedMs - (rush.pauseAt == null ? 0 : performance.now() - rush.pauseAt); }
function startRush() { rush = { n: 1, t0: performance.now(), pausedMs: 0, pauseAt: null, hp: null, splits: [] }; begin(1, false, true); }
// the narrator: recorded readings, one file per picture in assets/voice (open1.mp3 ... end3.mp3). A picture is read
// aloud only if its name is in VOICED, so a missing recording never leaves a gap; the music sinks beneath the voice
const VOICED = new Set(['open1', 'open2', 'open3', 'open4', 'open5', 'open6', 'end1', 'end2', 'end3', 'khan1', 'khan2', 'khan3', 'khan4', 'khan5', 'khan6', 'khan7', 'win1', 'win2', 'win3', 'win4', 'win5', 'win6', 'fall1', 'fall2', 'fall3', 'queen1', 'queen2', 'witch1', 'witch2', 'olad1', 'olad2', 'arzhang1', 'arzhang2', 'white1', 'white2', 'white3', 'kavus1', 'khan1-intro', 'khan1-outro', 'khan2-intro', 'khan2-outro', 'khan3-intro', 'khan3-outro', 'khan4-intro', 'khan4-outro', 'khan5-intro', 'khan5-outro', 'khan6-intro', 'khan6-outro', 'khan7-intro', 'tale-1-1', 'tale-1-2', 'tale-1-3', 'tale-1-4', 'tale-1-5', 'tale-3-1', 'tale-3-2', 'tale-4-1', 'tale-4-2', 'tale-5-1', 'tale-5-2', 'tale-6-1', 'tale-6-2', 'tale-7-1', 'tale-7-2', 'tale-2-1', 'tale-2-2']);
// the narrator's line as each labour begins, shown as a subtitle while he speaks
const KHAN_LINES = {"khan1": "The first labour. Rostam lay down to sleep among the reeds, while Rakhsh grazed nearby… and in the thicket, a lion was watching.", "khan2": "The second labour: the burning desert. No water. No shade. Not a single bird in the sky… only the sand, and whatever waits beneath it.", "khan3": "The third labour. Night fell, and out of the dark came a dragon eighty cubits long: a beast that only Rakhsh could see.", "khan4": "The fourth labour. In a green garden a feast was laid, and a beautiful lady poured the wine. But in Mazandaran… beauty is rarely what it seems.", "khan5": "The fifth labour. Rostam rode into the lands of Olad: a warden who did not take kindly to strangers.", "khan6": "The sixth labour. At the gates of Mazandaran stood Arzhang, chief of the Divs, with an army of demons at his back.", "khan7": "The seventh labour. Beyond seven mountains, in a cave as dark as night… the White Div was waiting."};
let sayId = 0, voiceEl = null;
const narratorEnabled = () => SET.narrator && SET.voice > 0;
function refreshNarratorControls() {
  const on = narratorEnabled();
  $('setNarrator').setAttribute('aria-checked', String(on));
  $('setVoice').disabled = !on;
  $('setVoiceV').textContent = on ? SET.voice + '%' : 'Off';
  $('cineNarrator').textContent = on ? 'Narrator on' : 'Narrator off';
  $('cineNarrator').setAttribute('aria-pressed', String(on));
  refreshStoryListen();
}
function setNarrator(on, readScene = false) {
  SET.narrator = on; if (on && !SET.voice) SET.voice = 90;
  if (!on) { hush(true); $('sub').classList.remove('on'); storyReading = false; }
  saveSet(); refreshNarratorControls();
  // Only the explicit scene button starts the current reading. Settings never previews speech.
  if (on && readScene && !A.muted && cine && !cine.credits) cineShow(cine.i);
}
$('setNarrator').onclick = () => setNarrator(!narratorEnabled());
$('cineNarrator').onclick = () => setNarrator(!narratorEnabled(), true);
// the readings play through the game's own sound engine (unlocked by the first click, so no browser blocks them),
// each decoded once and kept
const voiceBufs = {};
function voiceBuf(key) {
  if (!audio() || !VOICED.has(key)) return null;
  return voiceBufs[key] ||= fetch(`assets/voice/${key}.mp3?v=${V}`).then(r => r.arrayBuffer()).then(b => new Promise((ok, no) => A.ctx.decodeAudioData(b, ok, no))).catch(e => { delete voiceBufs[key]; throw e; });
}
function hush(finish = false) {
  sayId++; const h = voiceEl; voiceEl = null;
  if (h?.src) { h.src.onended = null; try { h.src.stop(); } catch (e) {} }
  if (A.music) A.music.gain.value = 0.7 * SET.music / 70;
  if (finish) h?.then?.();
}
function narrate(key, then) {
  if (!VOICED.has(key) || A.muted || !narratorEnabled() || !audio()) return false;
  hush(); const id = sayId, h = voiceEl = { duration: 0, t0: 0, then };
  if (!A.vox) { A.vox = A.ctx.createGain(); A.vox.connect(A.master); }
  A.vox.gain.value = 1.15 * SET.voice / 100;
  if (A.music) A.music.gain.value = 0.7 * SET.music / 70 * 0.3;   // the music sinks beneath the voice
  const end = () => { if (id !== sayId) return; voiceEl = null; if (A.music) A.music.gain.value = 0.7 * SET.music / 70; then?.(); };
  voiceBuf(key).then(buf => {
    if (id !== sayId || A.muted || !narratorEnabled()) return;
    const src = A.ctx.createBufferSource(); src.buffer = buf; src.connect(A.vox); src.onended = end; src.start();
    h.src = src; h.duration = buf.duration; h.t0 = A.ctx.currentTime * 1000;
  }).catch(end);
  return h;
}
// what the foes and the king say aloud, shown as a subtitle with the speaker's name
const LINES = {"queen1": ["The Scorpion Queen", "Thirsty, little man? Then come… and drink."], "queen2": ["The Scorpion Queen", "My children… will feast on your bones!"], "witch1": ["The Lady of the Garden", "Sit, brave traveller. Eat… drink… and rest awhile."], "witch2": ["The Witch", "You see me now, do you? Then see your death!"], "olad1": ["Olad", "Who are you, to cross the marches of Mazandaran?"], "olad2": ["Olad", "Enough! Spare me… and I will lead you to the White Div."], "arzhang1": ["Arzhang Div", "Who dares walk into my camp? I will grind your bones for my supper!"], "arzhang2": ["Arzhang Div", "You will pay for every drop of my blood!"], "white1": ["The White Div", "So… the son of Zal comes at last."], "white2": ["The White Div", "I have broken kings, little hero. I will break you."], "white3": ["The White Div", "No… this cannot be…"], "kavus1": ["Kay Kavus", "Rostam! My eyes… my eyes are opened! Iran is saved!"]};
// a spoken line, with its words as a subtitle; once only = never again this visit (an entrance, a labour's opening)
const said = new Set();
function say(k, { once = false, sub = true, then } = {}) {
  if (once && said.has(k)) return false; said.add(k);
  const el = $('sub'), L = LINES[k], text = L ? `<b>${L[0]}:</b> \u201c${L[1]}\u201d` : KHAN_LINES[k];
  // the speaker's face beside the words: the storyteller for the narrator's lines
  const who = { queen: 'queen', witch1: 'beauty', witch2: 'hag', olad: 'olad', arzhang: 'arzhang', white: 'white', kavus: 'kavus' }, face = who[k] || who[k.replace(/\d+$/, '')] || 'narrator';
  const a = narrate(k, () => { el.classList.remove('on'); then?.(); });
  if (a && sub && text) { el.innerHTML = `<img src="assets/ui/port/${face}.png?v=${V}" alt=""><span>${text}</span>`; el.classList.add('on'); $('toast').classList.remove('on'); } else el.classList.remove('on');   // the spoken words replace the written note
  return !!a;
}
// as a labour begins (the first time this visit) the narrator sets the scene
function sayIntro(n) { say('khan' + n, { once: true }); }
function cineAdvanceAfter(ms) {
  const c = cine; if (!c) return;
  clearTimeout(c.auto); c.autoRemaining = null; c.autoDue = Date.now() + ms;
  if (A.background) { c.auto = 0; c.autoRemaining = ms; return; }
  c.auto = setTimeout(() => { if (cine === c) { c.auto = 0; cineNext(); } }, ms);
}
function cinema(name, done, start = 0, panels = null) {
  const P = panels || CINE[name]; if (!P) { done?.(); return; }
  const ov = $('s-cine'), imgs = ov.querySelectorAll('.cimg');
  const wasPlaying = playing, sceneActive = game?.scene.isActive('play');
  if (sceneActive) game.scene.pause('play');
  playing = false; hush(); $('sub').classList.remove('on');
  for (const k in keys) keys[k] = false;
  for (const k in pressed) pressed[k] = false;
  cine = { P, i: start - 1, done, typing: 0, auto: 0, name, wasPlaying, sceneActive,
    from: document.querySelector('.ov:not(.hidden):not(#s-cine)') };
  cine.from?.classList.add('hidden'); $('credits').classList.add('hidden'); $('cineSkip').textContent = 'Skip ›';
  ov.querySelector('.cdots').innerHTML = P.map((_, k) => `<i title="Picture ${k + 1}" data-k="${k}"></i>`).join('');
  imgs.forEach(im => im.classList.remove('on'));
  ov.classList.remove('hidden'); refreshNarratorControls(); music(true); P.forEach(([img]) => voiceBuf(img)?.catch(() => {})); cineNext(); $('cineNext').focus();
}
function cineShow(i) {
  const c = cine, [img, fa, text] = c.P[i], ov = $('s-cine'), imgs = ov.querySelectorAll('.cimg'), im = imgs[i % 2], old = imgs[(i + 1) % 2];
  // each painting drifts its own way: slowly in, across, or out
  const moves = [['1.06', '1.16', '-1%', '1%', '0', '-1%'], ['1.16', '1.06', '1%', '-1%', '0', '0'], ['1.1', '1.18', '1.5%', '-1.5%', '1%', '0']][i % 3];
  im.src = storyArt(img);
  im.style.cssText = `--s0:${moves[0]};--s1:${moves[1]};--x0:${moves[2]};--x1:${moves[3]};--y0:${moves[4]};--y1:${moves[5]};--d:14s`;
  im.classList.remove('on'); void im.offsetWidth; im.classList.add('on'); old.classList.remove('on');
  ov.querySelectorAll('.cdots i').forEach((d, k) => d.classList.toggle('on', k === i));
  const cap = ov.querySelector('.ccap'); cap.classList.remove('done'); cap.querySelector('.fa').textContent = fa; const p = cap.querySelector('p'); p.textContent = '';
  // the narration types out, a few letters at a time; the next picture follows on its own after a reading pause
  clearInterval(c.typing); clearTimeout(c.auto); c.autoRemaining = null; let n = 0;
  // with the narrator on, the words appear at his pace and the next picture waits for him to finish
  const panel = i, a = narrate(img, () => { if (cine === c && c.i === panel) { c.speaking = false; if (!c.typing) cineAdvanceAfter(1400); } });
  c.speaking = !!a;
  c.typing = setInterval(() => {
    if (A.background) return;
    n = c.speaking ? (a.duration ? Math.floor(text.length * (A.ctx.currentTime * 1000 - a.t0) / (a.duration * 900)) : 0) : n + 2;
    p.textContent = text.slice(0, n);
    if (n >= text.length) { clearInterval(c.typing); c.typing = 0; p.textContent = text; cap.classList.add('done'); if (!c.speaking) cineAdvanceAfter(2600 + text.length * 32); }
  }, 28);
}
function cineNext() {
  const c = cine; if (!c) return;
  if (c.typing) { clearInterval(c.typing); c.typing = 0; const cap = $('s-cine').querySelector('.ccap'); cap.querySelector('p').textContent = c.P[c.i][2]; cap.classList.add('done'); clearTimeout(c.auto); if (!c.speaking) cineAdvanceAfter(2600 + c.P[c.i][2].length * 32); return; }
  if (c.credits) return cineEnd();
  if (++c.i >= c.P.length) return (c.name === 'ending' || c.name === 'all' && c.P.at(-1)[0] === 'end3') ? rollCredits() : cineEnd();
  cineShow(c.i); sfx('swing');
}
function rollCredits() {
  const c = cine; clearTimeout(c.auto); c.auto = 0; c.autoRemaining = null; c.credits = true; hush();
  const r = $('roll'); r.innerHTML = CREDITS;
  const cast = r.querySelector('.credit-cast'), heroes = [...cast.children];
  for (let i = heroes.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [heroes[i], heroes[j]] = [heroes[j], heroes[i]]; }
  cast.append(...heroes); $('credits').classList.remove('hidden'); $('credits').scrollTop = 0;
  $('cineSkip').textContent = 'Finish ›'; $('cineSkip').focus({ preventScroll: true });
  // Keep this short gallery still and readable; Finish remains available throughout.
  r.style.removeProperty('--roll-duration'); r.style.animation = 'none';
}
function cineEnd() {
  const c = cine; if (!c) return; hush(); cine = null; clearInterval(c.typing); clearTimeout(c.auto);
  $('s-cine').classList.add('hidden'); $('credits').classList.add('hidden');
  if (c.from && !c.done) c.from.classList.remove('hidden');
  if (!c.done && c.sceneActive) { game.scene.resume('play'); playing = c.wasPlaying; }
  c.done?.();
}
$('cineNext').onclick = cineNext; $('cineSkip').onclick = cineEnd;
// the dots above a picture jump straight to that picture
$('s-cine').querySelector('.cdots').onclick = e => { const k = +e.target.dataset?.k, c = cine; if (!c || isNaN(k) || c.credits) return; hush(); clearInterval(c.typing); c.typing = 0; clearTimeout(c.auto); c.i = k; cineShow(k); };
// the tale in pictures: every picture of the prologue and the ending, to watch from wherever the player likes. The
// ending stays sealed until the White Div has fallen
const CLIP_NAMES = { open1: 'The minstrel at court', open2: 'The White Div’s storm', open3: 'The messenger', open4: 'Two roads', open5: 'Rostam and Rakhsh', open6: 'Riding out',
  'khan7-outro': 'The White Div — The labour completed',
  end1: 'The king sees again', end2: 'The army set free', end3: 'The hero of the world',
  "khan1-intro": "The Lion of the Reeds — The road ahead",
  "khan1-outro": "The Lion of the Reeds — The labour completed",
  "khan2-intro": "The Burning Desert — The road ahead",
  "khan2-outro": "The Burning Desert — The labour completed",
  "khan3-intro": "The Dragon’s Night — The road ahead",
  "khan3-outro": "The Dragon’s Night — The labour completed",
  "khan4-intro": "The Enchanted Feast — The road ahead",
  "khan4-outro": "The Enchanted Feast — The labour completed",
  "khan5-intro": "Olad, Warden of the Marches — The road ahead",
  "khan5-outro": "Olad, Warden of the Marches — The labour completed",
  "khan6-intro": "The Camp of Arzhang — The road ahead",
  "khan6-outro": "The Camp of Arzhang — The labour completed",
  "khan7-intro": "The White Div — The road ahead",
};
function openClips() {
  const groups = [{ name: 'opening', title: 'The Prologue', locked: false }];
  for (let n = 1; n <= LABOURS; n++) {
    groups.push({ name: 'intro' + n, title: 'Khan ' + ROMAN[n] + ': ' + NAMES[n][0], locked: n > unlocked() });
    if (n < LABOURS) groups.push({ name: 'outro' + n, title: 'After Khan ' + ROMAN[n], locked: !bestOf(n) });
  }
  groups.push({ name: 'ending', title: 'The Ending', locked: !bestOf(LABOURS) });
  const playlist = groups.filter(g => !g.locked).flatMap(g => CINE[g.name]);
  $('clipList').innerHTML = groups.map(({ name, title, locked }) => `<h3>${title}</h3><div class="clips">${CINE[name].map(([img], k) =>
    `<button class="clip${locked ? ' locked' : ''}" ${locked ? 'aria-disabled="true" title="Complete this part of the journey to unlock"' : `data-play="${name}" data-k="${k}"`} aria-label="${CLIP_NAMES[img]}${locked ? ', locked' : ''}"><img src="${storyArt(img)}" alt="" loading="lazy"><span><b>${k + 1}</b>${locked ? 'Complete this part of the journey to see it' : CLIP_NAMES[img]}</span></button>`).join('')}</div>`).join('');
  $('clipsSummary').textContent = `${playlist.length} unlocked scenes · Watch your story in order`;
  $('clipsPlayAll').onclick = () => {
    store.set('sh-prologue', '1'); $('s-clips').classList.add('hidden');
    cinema('all', openClips, 0, playlist);
  };
  $('clipList').querySelectorAll('[data-play]').forEach(b => b.onclick = () => { store.set('sh-prologue', '1'); $('s-clips').classList.add('hidden'); cinema(b.dataset.play, openClips, +(b.dataset.k || 0)); });
  document.querySelectorAll('.ov:not(.hidden)').forEach(o => o.id !== 's-clips' && o.classList.add('hidden'));
  $('s-clips').classList.remove('hidden'); $('clipsPlayAll').focus();
}
const closeClips = () => { $('s-clips').classList.add('hidden'); openMap(false); };
$('prologueBtn').onclick = openClips; $('clipClose').onclick = closeClips; $('clipDone').onclick = closeClips;
// settings: a page of the manuscript with the volumes, the comfort switches and the keys
let setFrom = null, rebind = null;
function applySettings() {
  if (A.music) A.music.gain.value = 0.7 * SET.music / 70; if (A.fx) A.fx.gain.value = 0.85 * SET.fx / 85;
  document.body.classList.toggle('calm', !SET.flash);
}
function renderSettings() {
  $('setMusic').value = SET.music; $('setFx').value = SET.fx; $('setMusicV').textContent = SET.music + '%'; $('setFxV').textContent = SET.fx + '%'; $('setVoice').closest('label').hidden = !VOICED.size; $('setVoice').value = SET.voice; $('setVoiceV').textContent = SET.voice ? SET.voice + '%' : 'Off';
  refreshNarratorControls();
  $('setShake').setAttribute('aria-checked', String(SET.shake)); $('setFlash').setAttribute('aria-checked', String(!SET.flash));
  $('keyList').innerHTML = ACTIONS.map(([a, label]) => `<li><span>${label}</span>${[0, 1].map(i => `<button class="kb${rebind?.a === a && rebind.i === i ? ' wait' : ''}" data-a="${a}" data-i="${i}" aria-label="${label}, key ${i + 1}: ${SET.keys[a][i] ? keyName(SET.keys[a][i]) : 'none'}">${rebind?.a === a && rebind.i === i ? 'Press a key\u2026' : SET.keys[a][i] ? keyName(SET.keys[a][i]) : '\u2014'}</button>`).join('')}</li>`).join('');
  $('keyList').querySelectorAll('.kb').forEach(b => b.onclick = () => { rebind = { a: b.dataset.a, i: +b.dataset.i }; renderSettings(); $('keyList').querySelector('.kb.wait')?.focus(); });
  const pad = [...(navigator.getGamepads?.() || [])].find(Boolean);
  $('padInfo').innerHTML = pad ? `<b>Gamepad connected.</b> Stick or D-pad move &middot; <b>A</b> jump &middot; <b>X</b> strike (hold for heavy) &middot; <b>B</b> dodge &middot; <b>Y</b> Farr &middot; <b>Start</b> menu` : 'Connect a gamepad and press any button: it works in play and in every menu.';
}
function finishRebind(k) {
  const r = rebind; rebind = null; if (!r) return;
  if (k !== null) {
    for (const ks of Object.values(SET.keys)) for (let i = 0; i < ks.length; i++) if (ks[i] && ks[i].toLowerCase() === k.toLowerCase()) ks[i] = '';   // a key does one thing only
    SET.keys[r.a][r.i] = k; saveSet(); buildKeys();
  }
  renderSettings(); $('keyList').querySelector(`[data-a="${r.a}"][data-i="${r.i}"]`)?.focus();
}
function openSettings() {
  if (playing) setPaused(true); setFrom = document.querySelector('.ov:not(.hidden):not(#s-set)'); setFrom?.classList.add('hidden');
  renderSettings(); $('s-set').classList.remove('hidden'); $('setDone').focus();
}
function closeSettings() { rebind = null; $('s-set').classList.add('hidden'); if (setFrom) { setFrom.classList.remove('hidden'); setFrom.querySelector('.btn')?.focus(); } else openMap(false); }
document.querySelectorAll('[data-settings]').forEach(b => b.onclick = openSettings); $('setDone').onclick = closeSettings; $('setClose').onclick = closeSettings;
$('setMusic').oninput = e => { SET.music = +e.target.value; $('setMusicV').textContent = SET.music + '%'; applySettings(); saveSet(); };
$('setFx').oninput = e => { SET.fx = +e.target.value; $('setFxV').textContent = SET.fx + '%'; applySettings(); saveSet(); };
$('setFx').onchange = () => sfx('coin');
$('setVoice').oninput = e => {
  SET.voice = +e.target.value;
  if (!SET.voice) { SET.narrator = false; hush(true); }
  if (A.vox) A.vox.gain.value = narratorEnabled() ? 1.15 * SET.voice / 100 : 0;
  refreshNarratorControls(); saveSet();
};
$('setShake').onclick = () => { SET.shake = !SET.shake; saveSet(); renderSettings(); };
$('setFlash').onclick = () => { SET.flash = !SET.flash; saveSet(); applySettings(); renderSettings(); };
$('keyReset').onclick = () => { SET.keys = JSON.parse(JSON.stringify(KEY_DEF)); saveSet(); buildKeys(); renderSettings(); };
applySettings();
// gamepads: play with the stick or D-pad and the face buttons; in a menu the D-pad moves between buttons, A presses, B goes back
const PAD = { 0: 'jump', 2: 'attack', 1: 'dodge', 3: 'farr', 13: 'offer' }, padWas = {};
let padAxis = 0, padNav = 0;
function padPoll() {
  const pad = [...(navigator.getGamepads?.() || [])].find(Boolean);
  if (pad) {
    const b = i => !!pad.buttons[i]?.pressed, was = i => !!padWas[i], edge = i => b(i) && !was(i);
    const menu = document.querySelector('.ov:not(.hidden)');
    if (menu) {
      // menus: move focus among the visible buttons and controls, press with A, back with B
      const items = [...menu.querySelectorAll('button:not(:disabled), a[href], summary, input[type=range]')].filter(e => e.offsetParent);
      const i = items.indexOf(document.activeElement), ax = pad.axes[1] || 0, ay = pad.axes[0] || 0;
      const dir = b(12) || ax < -0.6 || b(14) || ay < -0.6 ? -1 : b(13) || ax > 0.6 || b(15) || ay > 0.6 ? 1 : 0;
      if (dir && Date.now() > padNav) { padNav = Date.now() + 180; const el = document.activeElement;
        if (el?.type === 'range' && (b(14) || b(15) || Math.abs(ay) > 0.6)) { el.value = +el.value + dir * 5; el.dispatchEvent(new Event('input')); }
        else items[(i + dir + items.length) % items.length]?.focus(); }
      if (!dir) padNav = 0;
      if (edge(0)) document.activeElement?.click?.();
      if (edge(1)) dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
      if (edge(9) && menu.id === 's-pause' && paused) setPaused(false);
      for (const a of Object.values(PAD)) if (keys[a]) press(a, false); if (keys.left) press('left', false); if (keys.right) press('right', false);
    } else {
      for (const [i, a] of Object.entries(PAD)) if (b(i) !== was(i)) press(a, b(i));
      const x = (pad.axes[0] || 0), l = b(14) || x < -0.4, r = b(15) || x > 0.4;
      if (l !== keys.left && (l || padAxis & 1)) press('left', l); if (r !== keys.right && (r || padAxis & 2)) press('right', r);
      padAxis = (l ? 1 : 0) | (r ? 2 : 0);
      if (edge(9) && (playing || paused)) setPaused(!paused);
    }
    pad.buttons.forEach((x, i) => padWas[i] = x.pressed);
  }
  requestAnimationFrame(padPoll);
}
addEventListener('gamepadconnected', () => { toast('Gamepad connected. Press Start for the menu.'); if (!$('s-set').classList.contains('hidden')) renderSettings(); });
requestAnimationFrame(padPoll);
// how to play: a page of the manuscript, opened from the home map and the menu
let helpFrom = null;
function openHelp() { refreshControlLabels(); if (playing) setPaused(true); helpFrom = document.querySelector('.ov:not(.hidden):not(#s-help)'); helpFrom?.classList.add('hidden'); $('s-help').classList.remove('hidden'); $('helpDone').focus(); }
function closeHelp() { $('s-help').classList.add('hidden'); if (helpFrom) { helpFrom.classList.remove('hidden'); helpFrom.querySelector('.btn')?.focus(); } else openMap(false); }
document.querySelectorAll('[data-help]').forEach(b => b.onclick = openHelp); $('helpDone').onclick = closeHelp; $('helpClose').onclick = closeHelp;
document.querySelectorAll('[data-guide]').forEach(b => b.onclick = () => openGuide($('s-map').classList.contains('hidden') ? cur : pick));
$('gPrev').onclick = () => showGuide(gpg - 1); $('gNext').onclick = () => showGuide(gpg + 1); $('guideClose').onclick = closeGuide;
$('nextBtn').onclick = () => begin(cur + 1);
$('rushBtn').onclick = startRush;
let paused = false;
function setPaused(on) {
  if (on === paused) return;
  if (on && !cine) { hush(true); $('sub').classList.remove('on'); }
  paused = on; playing = !on;
  clearInput();
  if (rush) { if (on && rush.pauseAt == null) rush.pauseAt = performance.now();
    else if (!on && rush.pauseAt != null) { rush.pausedMs += performance.now() - rush.pauseAt; rush.pauseAt = null; } }
  if (on) game.scene.pause('play'); else game.scene.resume('play');
  $('s-pause').classList.toggle('hidden', !on); music(!on);
  if (on) $('resumeBtn').focus();
}
// a short line at the bottom of the screen
let toastT = 0;
// a standing line under the HUD: what to do right now. It changes as the labour unfolds.
function hint(html) {
  const h = $('hint'); if (!html) { h.classList.add('hidden'); h.dataset.t = ''; return; }
  if (h.dataset.t === html) return; h.dataset.t = html; h.innerHTML = html; refreshControlLabels(h);
  h.classList.remove('hidden', 'new', 'dim'); void h.offsetWidth; h.classList.add('new');
  clearTimeout(hint.t); hint.t = setTimeout(() => h.classList.add('dim'), 7000);
}
function toast(msg) { if ($('sub').classList.contains('on')) return; const t = $('toast'); t.textContent = controlText(msg); t.classList.add('on'); clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('on'), 3200); }
function banner(fa, name, ep = '') {
  const lv = LEVELS[cur], b = $('banner');
  b.querySelector('.fa').textContent = fa || lv.bossFa || lv.fa; b.querySelector('h2').textContent = name || lv.bossName || lv.name;
  b.querySelector('.ep').textContent = ep; b.classList.toggle('grand', !!ep);
  b.classList.remove('on'); void b.offsetWidth; b.classList.add('on');
}
// the tale, paged like a manuscript
let pages = [], pg = 0, storyFrom = null, storyReading = false;
function refreshStoryListen() {
  const b = $('storyListen'), available = VOICED.has(pages[pg]?.dataset.voice);
  b.disabled = !available || A.muted || !narratorEnabled();
  b.textContent = storyReading ? 'Stop reading' : A.muted ? 'Sound is muted' : !narratorEnabled() ? 'Narrator is off' : 'Listen to this page';
  b.setAttribute('aria-pressed', String(storyReading));
}
function stopStoryReading() { if (storyReading) hush(); storyReading = false; refreshStoryListen(); }
$('storyListen').onclick = () => {
  if (storyReading) { stopStoryReading(); return; }
  const key = pages[pg]?.dataset.voice;
  if (!key || A.muted || !narratorEnabled()) return;
  storyReading = !!narrate(key, () => { storyReading = false; refreshStoryListen(); }); refreshStoryListen();
};
function showPage(i) {
  stopStoryReading();
  pg = Phaser.Math.Clamp(i, 0, pages.length - 1);
  $('leaf').replaceChildren(pages[pg].cloneNode(true)); $('leaf').scrollTop = 0;
  $('dots').innerHTML = pages.map((_, k) => `<i class="${k === pg ? 'on' : ''}"></i>`).join('');
  refreshStoryListen();
  $('prevPg').disabled = pg === 0; $('nextPg').textContent = pg === pages.length - 1 ? 'Close' : 'Next \u2192';
}
const turn = d => (pg === pages.length - 1 && d > 0 ? closeStory() : showPage(pg + d));
function openStory(i = 0, n = cur) {
  music(A.want);
  if (playing) setPaused(true);
  $('s-story').setAttribute('aria-label', 'The tale of ' + NAMES[n][0]);
  pages = [...(document.getElementById('tale-' + n) || $('tale-1')).content.querySelectorAll('article')];
  storyFrom = document.querySelector('.ov:not(.hidden):not(#s-story)');
  storyFrom?.classList.add('hidden'); $('s-story').classList.remove('hidden'); showPage(i); $('nextPg').focus();
}
function closeStory() { stopStoryReading(); $('s-story').classList.add('hidden'); if (storyFrom) { storyFrom.classList.remove('hidden'); storyFrom.querySelector('.btn')?.focus(); } else openMap(false); }
document.querySelectorAll('[data-story]').forEach(b => b.onclick = () => openStory(+b.dataset.story || 0, cur));
$('prevPg').onclick = () => turn(-1); $('nextPg').onclick = () => turn(1); $('storyClose').onclick = closeStory;
$('pauseBtn').onclick = () => setPaused(true); $('resumeBtn').onclick = () => setPaused(false);
$('restartBtn').onclick = () => { const sc = game.scene.getScene('play'); sc.done = true; begin(); };
function syncBackgroundAudio() {
  const background = document.hidden || !document.hasFocus();
  if (background === A.background) return;
  A.background = background; document.body.classList.toggle('backgrounded', background);
  if (background) {
    clearInput();
    if (playing) setPaused(true);
    if (cine?.auto) { cine.autoRemaining = Math.max(0, cine.autoDue - Date.now()); clearTimeout(cine.auto); cine.auto = 0; }
    if (A.master) A.master.gain.value = 0;
    for (const t of Object.values(A.tracks)) { clearTimeout(t.stop); t.el.pause(); }
    A.cur = null;
    if (A.ctx?.state === 'running') A.ctx.suspend().catch(() => {});
  } else {
    if (A.master) A.master.gain.value = A.muted ? 0 : 0.8;
    if (!A.muted) { audio(); pickTrack(); }
    if (cine?.autoRemaining != null) cineAdvanceAfter(cine.autoRemaining);
  }
}
addEventListener('blur', syncBackgroundAudio);
addEventListener('focus', syncBackgroundAudio);
document.addEventListener('visibilitychange', syncBackgroundAudio);
document.addEventListener('game-load-error', () => {
  clearInput(); playing = false; A.failed = true; game?.scene.pause('play');
  if (A.master) A.master.gain.value = 0;
  for (const t of Object.values(A.tracks)) { clearTimeout(t.stop); t.el.pause(); }
  A.cur = null; if (A.ctx?.state === 'running') A.ctx.suspend().catch(() => {});
});
game = new Phaser.Game({
  type: Phaser.AUTO, parent: 'game', width: W * ZOOM, height: H * ZOOM, pixelArt: true, backgroundColor: '#06060c',
  scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
  physics: { default: 'arcade', arcade: { gravity: { y: 900 }, debug: location.hash === '#physics' } },
  scene: [Play]
});
$('playBtn').onclick = () => (unlocked() > 1 ? openMap() : begin(1)); $('againBtn').onclick = () => $('winTitle').textContent === 'The boss rush is done' ? startRush() : begin(); $('retryBtn').onclick = () => rush ? startRush() : begin(cur, true); $('freshBtn').onclick = () => begin();
$('muteBtn').onclick = () => { audio(); setMuted(!A.muted); };
setMuted(A.muted); document.body.classList.toggle('backgrounded', A.background);
openMap(false);                                                   // the game opens on the road of the seven labours
// the self-test (open the game with #selftest): every labour is loaded and played through on a fast, silent clock, and a
// report lists what passed and what failed: errors, checkpoints, stuck foes, each boss beaten through to its victory
if (location.hash === '#selftest') (async () => {
  const W8 = ms => new Promise(r => setTimeout(r, ms)), sc = () => game.scene.getScene('play');
  // Phaser 3.80 tweens normally use Date.now(), independently of game.step's clock.
  // Give both clocks the same simulated frame delta here, and restore normal timing afterwards.
  const tweenClocks = new Map();
  let T = performance.now() + 1e6; const step = k => {
    const manager = sc()?.tweens;
    if (manager && !tweenClocks.has(manager)) { tweenClocks.set(manager, manager.getDelta); manager.getDelta = () => 16.67; }
    for (let i = 0; i < k; i++) { T += 16.67; game.step(T, 16.67); }
  };
  const errs = []; addEventListener('error', e => errs.push(`${e.message} (line ${e.lineno})`));
  const saved = Object.fromEntries(Object.keys(localStorage).filter(k => k.startsWith('sh-')).map(k => [k, localStorage.getItem(k)]));   // put back afterwards
  try {
  while (!game.isBooted || !game.renderer) await W8(50);
  A.muted = true; game.loop.sleep();
  const box = document.createElement('div'); box.style.cssText = 'position:fixed;inset:20px;z-index:99;overflow:auto;padding:18px 22px;background:rgba(8,10,24,.96);color:#f6ead0;font:14px/1.5 Inter,sans-serif;border:2px solid #e8c25a;border-radius:12px;white-space:pre-wrap';
  document.body.append(box); const lines = ['The Seven Labours: self-test\n']; let fails = 0;
  const say = (ok, msg) => { if (!ok) fails++; lines.push(`${ok ? '✔' : '✘'} ${msg}`); box.textContent = lines.join('\n'); };
  for (let i = 0; i < 40 && !sc()?.player; i++) { step(2); await W8(30); }
  const load = async n => { begin(n, false, false, true); for (let i = 0; i < 300; i++) { step(3); await W8(15); const s = sc(); if (s?.player?.anims && s.lv === LEVELS[n] && s.foes) break; } step(20); return sc(); };
  for (let n = 1; n <= LABOURS; n++) {
    const e0 = errs.length; let s = await load(n); s.hp = s.maxHp = 99; s.water = 100;
    const L = s.layer, tile = (x, y) => { const t = L.getTileAtWorldXY(x, y); return t && t.index >= 0 ? t : null; };
    const badFire = s.altars.filter(a => { const t = tile(a.x, a.y + 3); return !t || !(t.collides || t.index % 4 === 2) || t.index % 4 === 2; });
    say(!badFire.length, `Khan ${ROMAN[n]}: ${s.altars.length} checkpoints on solid ground${badFire.length ? ` (${badFire.length} not)` : ''}`);
    s.frozen = true; step(300);
    const stuck = s.foes.getChildren().filter(f => { if (!f.active || !f.body.enable || !f.body.allowGravity) return false; const b = f.body; if (f.y > 20 * TS) return true;
      for (let x = b.left + 3; x <= b.right - 3; x += 6) for (let y = b.top + 3; y <= b.bottom - 4; y += 6) { const t = tile(x, y); if (t && (t.collides || t.index % 4 === 2)) return true; } return false; });
    say(!stuck.length, `Khan ${ROMAN[n]}: no foe stuck in the ground or a platform${stuck.length ? ` (${stuck.map(f => f.kind + '@' + Math.round(f.x / TS)).join(', ')})` : ''}`);
    // every foe on its own: Rostam stands beside it on open ground, and it must reach him and land a blow within seven
    // seconds, without sticking in the ground (a foe with no open ground near it, such as a bird over a pit, is skipped)
    { const top = x => { for (let r = 2; r < 17; r++) { const t = tile(x, r * TS + 2); if (t && t.collides) return r; } return 99; };
      const open = (x, r) => [1, 2, 3, 4, 5, 6].every(k => !tile(x, (r - k) * TS + 4));
      let hits = 0; s.hurt = function () { hits++; this.inv = 0; };
      const all = s.foes.getChildren().slice(), failed = []; let tested = 0, skipped = 0;
      for (const f of all) { if (!f.active || !f.body.enable) continue;
        all.forEach(o => { if (o !== f && o.active) { o.body.enable = false; o.setVisible(false); } });
        const fly = !f.body.allowGravity, hx = f.home?.x ?? f.x, fr = fly ? null : Math.round(f.body.bottom / TS);
        let px = null; for (const d of fly ? [-50, 50, -80, 80] : [-56, 56, -72, 72, -40, 40, -24, 24]) { const x = hx + d; if (f.roam && (x < f.roam[0] + 8 || x > f.roam[1] - 8)) continue; const r = top(x); if (r === 99 || !open(x, r)) continue;
          if (!fly) { if (r !== fr) continue; let ok = true; for (let xx = Math.min(x, hx); xx <= Math.max(x, hx); xx += 8) if (top(xx) !== fr) ok = false; if (!ok) continue; } px = x; break; }
        if (px == null) skipped++;
        else { tested++; const r = top(px); s.player.body.reset(px, r * TS - 1 - 0.47 * s.player.displayHeight); s.player.setVelocity(0); hits = 0; if (f.state === 'rise') f.state = 'circle'; f.cool = 0;
          let ok = false; for (let t = 0; t < 420 && f.active; t++) { step(1); s.water = 100; s.player.setVelocityX(0); if (hits) { ok = true; break; } if (t % 90 === 0) await W8(1); }
          const b = f.body; let inGround = false; if (f.active && !fly) for (let x = b.left + 3; x <= b.right - 3; x += 6) for (let y = b.top + 3; y <= b.bottom - 4; y += 6) { const t = tile(x, y); if (t && (t.collides || t.index % 4 === 2)) inGround = true; }
          if (!ok || inGround) failed.push(`${f.kind}@${Math.round(hx / TS)}${ok ? '' : ' never struck'}${inGround ? ' stuck in the ground' : ''}`); }
        all.forEach(o => { if (o.active) { o.body.enable = true; o.setVisible(true); } }); }
      delete s.hurt; say(!failed.length, `Khan ${ROMAN[n]}: ${tested} foes each reach Rostam and strike${skipped ? ` (${skipped} with no open ground beside them, skipped)` : ''}${failed.length ? ': ' + failed.join(', ') : ''}`); }
    // the boss: walk into the arena, wait for it, strike it down, and see the labour through
    s.frozen = false; const ax = n === 1 ? 89 : RUSH_AT[n] + 3, r = s.groundAt(ax * TS + 8) ?? 14; s.player.body.reset(ax * TS + 8, r * TS - 1 - 0.47 * s.player.displayHeight);
    if (n === 2) { s.prayed = true; s.puzzle = { done: true }; s.startQueen(); }
    for (let i = 0; i < 120 && !(s.boss && s.boss.hp > 0 && !s.intro && s.boss.body.enable); i++) { step(10); await W8(5); }
    const B = s.boss; say(!!B, `Khan ${ROMAN[n]}: the boss appears${B ? ` (${B.texture.key.split('-')[0]})` : ''}`);
    if (B) {
      B.hp = 1; s.damage(B, 1, true); let done = false;
      for (let i = 0; i < 160 && !done; i++) { step(10); await W8(5); s.hp = 99;
        const f = s.children.list.find(o => o.texture?.key === 'feather' && o.kind !== 'sfeather' && o.spark && o.glow && !o.taken); if (f && !f.taken) s.takeFeather(f);
        if (n === 2 && s.springOpen && !s.drank) s.reachSpring();
        if (n === LABOURS && s.whiteDown && !s.ended) s.freeKing();
        done = s.done || !$('s-cine').classList.contains('hidden'); }
      if (!$('s-cine').classList.contains('hidden')) cineEnd();
      say(done, `Khan ${ROMAN[n]}: the boss falls and the labour ends`);
    }
    say(errs.length === e0, `Khan ${ROMAN[n]}: no script errors${errs.length > e0 ? ': ' + errs.slice(e0).join('; ') : ''}`);
  }
  // every recording, effect and painting the game asks for is really there
  const urls = [...[...VOICED].map(k => `assets/voice/${k}.mp3`), ...Object.keys(FX).map(k => `assets/fx/${k}.png`), ...Object.values(CINE).flat().map(([img]) => storyArt(img)), ...Object.values(SAMPLE).map(([f]) => `assets/sfx/${f}.m4a`)];
  const missing = []; await Promise.all([...new Set(urls)].map(u => fetch(u, { method: 'HEAD' }).then(r => r.ok || missing.push(u)).catch(() => missing.push(u))));
  say(!missing.length, `${new Set(urls).size} sound and picture files load${missing.length ? `; missing: ${missing.join(', ')}` : ''}`);

  lines.push(`\n${fails ? `${fails} check(s) FAILED` : 'All checks passed.'}  Your progress was not changed: reload without #selftest to play.`); box.textContent = lines.join('\n');
  } finally {
    for (const [manager, getDelta] of tweenClocks) manager.getDelta = getDelta;
    Object.keys(localStorage).filter(k => k.startsWith('sh-')).forEach(k => localStorage.removeItem(k));
    Object.entries(saved).forEach(([k, v]) => localStorage.setItem(k, v));
  }
})();
if (location.hash === '#debug') window.__sh = { game, scene: () => game.scene.getScene('play'), keys, pressed, setPaused, openStory, begin, openMap, LEVELS, FOES, snd: { A, audio, sfx, pickTrack }, cinema, SET, VOICED, rushTime: () => rush ? rushElapsed() : null };
})();
