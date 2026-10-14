/* Legends of Fantasia - a cartoon 2D platformer. All art is drawn in code. */
(() => {
'use strict';
const $ = id => document.getElementById(id);
const store = {
  get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
  set(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
};
const TAU = Math.PI * 2, PI = Math.PI;
const hash = n => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const lerp = (a, b, k) => a + (b - a) * k;
const easeOut = k => 1 - (1 - k) * (1 - k);
const easeInOut = k => k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;

/* =========================================================
   Heroes
   ========================================================= */
const HEROES = [
  { id: 'rex', name: 'Rexy', title: 'The cool T-Rex', desc: 'Breathes fireballs and is tough enough for four hearts.', spd: 4.1, jump: 13.1, hearts: 4, atk: 'fire', w: 44, h: 56, stats: [2, 2, 5], badge: 'Fan favourite' },
  { id: 'grug', name: 'Grug', title: 'Caveman crusher', desc: 'Swings a mighty club. Big smash, bigger grin.', spd: 4.6, jump: 13.3, hearts: 3, atk: 'club', range: 54, w: 30, h: 58, stats: [3, 3, 4] },
  { id: 'zahir', name: 'Zahir', title: 'Prince of the sands', desc: 'Quick with a scimitar and can jump twice in mid-air.', spd: 5.2, jump: 13.4, hearts: 3, atk: 'sword', range: 58, dbl: true, w: 28, h: 60, stats: [5, 5, 3] },
  { id: 'lyra', name: 'Lyra', title: 'Star sorceress', desc: 'Casts star bolts. Hold jump to float gently down.', spd: 4.5, jump: 13.1, hearts: 3, atk: 'magic', glide: true, w: 28, h: 56, stats: [3, 4, 3] }
];

/* =========================================================
   Level chunks (12 rows; ground = rows 10-11)
   P start  o gem  h heart  g walker  b flyer  C checkpoint  E exit
   # ground  = stone block  - one-way ledge  ^ spikes
   ========================================================= */
const T = 48, ROWS = 12, LH = ROWS * T;
const Gr = w => '#'.repeat(w);
const CH = {};
const chunk = (name, w, rows) => { CH[name] = { w, rows }; };
chunk('start', 16, { 9: '..P.........o.o.', 10: Gr(16), 11: Gr(16) });
chunk('flat', 12, { 6: '...o..o..o..', 9: '.......g....', 10: Gr(12), 11: Gr(12) });
chunk('gap', 12, { 7: '....ooo.....', 10: '####...#####', 11: '####...#####' });
chunk('hill', 14, { 5: '......ooo.....', 7: '.....#####....', 8: '...o.#####.o..', 9: '...#########..', 10: Gr(14), 11: Gr(14) });
chunk('float', 16, { 5: '.......ooo......', 6: '......-----.....', 8: '..---......---..', 10: '###..........###', 11: '###..........###' });
chunk('spikes', 14, { 7: '....o....o....', 9: '..g....^^...g.', 10: Gr(14), 11: Gr(14) });
chunk('bats', 14, { 4: '......b.......', 6: '..o.o.o.o.o...', 10: Gr(14), 11: Gr(14) });
chunk('tower', 16, { 2: '............o...', 5: '........=====...', 7: '....===.....b...', 9: '.=..........g...', 10: Gr(16), 11: Gr(16) });
chunk('pit', 15, { 6: '......ooo......', 8: '.....=====.....', 10: '###^^^^^^^^^###', 11: Gr(15) });
chunk('check', 12, { 7: '.......o.o..', 9: '...C........', 10: Gr(12), 11: Gr(12) });
chunk('batgap', 13, { 5: '......b......', 7: '.....ooo.....', 10: '#####...#####', 11: '#####...#####' });
chunk('ledges', 16, { 2: '..........ooo...', 3: '.........-----..', 5: '.....-----......', 7: '..-----.........', 9: '..........g.....', 10: Gr(16), 11: Gr(16) });
chunk('secret', 14, { 3: '........h.....', 4: '.......===....', 6: '....---.......', 8: '.---..........', 9: '...........g..', 10: Gr(14), 11: Gr(14) });
chunk('guards', 16, { 6: '.....o....o.....', 8: '....===..===....', 9: '..g.....g.....g.', 10: Gr(16), 11: Gr(16) });
chunk('exit', 16, { 9: '.....o.....E....', 10: Gr(16), 11: Gr(16) });

const LEVELS = [
  { name: 'Dino Valley', sub: 'Where the old volcano rumbles', foe: 1,
    chunks: ['start', 'flat', 'gap', 'hill', 'bats', 'spikes', 'check', 'float', 'tower', 'gap', 'guards', 'batgap', 'secret', 'exit'],
    th: { top: '#72d84e', topDark: '#3e9a2e', dirt: '#a8673a', stone: '#bfa584', spike: '#f1e8d2', plat: 'wood', slime: '#ff7b54', bat: '#9b6bd6' },
    music: { base: 261.63, scale: [0, 2, 4, 7, 9, 12, 14, 16], step: 0.16, wave: 'square' } },
  { name: 'Sands of Zarathan', sub: 'Flying carpets over the palace roofs', foe: 1.25,
    chunks: ['start', 'hill', 'spikes', 'gap', 'float', 'guards', 'bats', 'check', 'pit', 'tower', 'batgap', 'spikes', 'ledges', 'secret', 'exit'],
    th: { top: '#fbdc96', topDark: '#d9a85a', dirt: '#d99a5c', stone: '#f0cf93', spike: '#e8ecf4', plat: 'carpet', slime: '#c084fc', bat: '#6a3fa0' },
    music: { base: 293.66, scale: [0, 1, 4, 5, 7, 8, 10, 12], step: 0.18, wave: 'triangle' } },
  { name: 'The Crystal Spire', sub: 'A castle that floats among the stars', foe: 1.5,
    chunks: ['start', 'gap', 'float', 'pit', 'guards', 'tower', 'check', 'batgap', 'ledges', 'spikes', 'float', 'pit', 'secret', 'batgap', 'tower', 'exit'],
    th: { top: '#8af5e6', topDark: '#3fb8b0', dirt: '#5e4d92', stone: '#9d8fe4', spike: '#c8f6ff', plat: 'crystal', slime: '#4ade80', bat: '#ff6bcb' },
    music: { base: 220, scale: [0, 2, 3, 5, 7, 8, 10, 12], step: 0.2, wave: 'triangle' } }
];

/* =========================================================
   Canvas & painting helpers
   Every shape gets a cel-shaded gradient (light from the top-left)
   and parts are grouped so a whole limb shares one clean outline.
   ========================================================= */
const cv = $('game'), X0 = cv.getContext('2d');
let X = X0, LW = 2.3, FLIP = false;
const OL = '#2b1640';

const _sh = {};
function shade(h, a) {
  const k = h + a; if (_sh[k]) return _sh[k];
  const n = parseInt(h.slice(1), 16); let r = n >> 16 & 255, g = n >> 8 & 255, b = n & 255;
  if (a < 0) { r *= 1 + a * 1.05; g *= 1 + a * 1.25; b *= 1 + a * 0.55; }
  else { r += (255 - r) * a; g += (255 - g) * a; b += (255 - b) * a * 0.92; }
  const c = v => clamp(Math.round(v), 0, 255);
  return _sh[k] = '#' + ((1 << 24) + (c(r) << 16) + (c(g) << 8) + c(b)).toString(16).slice(1);
}
function paint(col, x0, y0, x1, y1) {
  if (FLIP) { const t = x0; x0 = x1; x1 = t; }
  const g = X.createLinearGradient(x0, y0, x1, y1);
  g.addColorStop(0, shade(col, 0.34)); g.addColorStop(0.3, col); g.addColorStop(0.56, col);
  g.addColorStop(0.62, shade(col, -0.18)); g.addColorStop(1, shade(col, -0.3));
  return g;
}
function vgrad(y0, y1, stops) { const g = X.createLinearGradient(0, y0, 0, y1); stops.forEach((c, i) => g.addColorStop(i / (stops.length - 1), c)); return g; }
const E = (x, y, rx, ry, col, rot = 0) => ({ p() { X.moveTo(x + rx * Math.cos(rot), y + rx * Math.sin(rot)); X.ellipse(x, y, rx, ry, rot, 0, TAU); }, col, bb: [x - rx, y - ry, x + rx, y + ry] });
function capPath(x1, y1, r1, x2, y2, r2) {
  const a = Math.atan2(y2 - y1, x2 - x1);
  X.moveTo(x1 + r1 * Math.cos(a + PI / 2), y1 + r1 * Math.sin(a + PI / 2));
  X.arc(x1, y1, r1, a + PI / 2, a + PI * 1.5); X.arc(x2, y2, r2, a - PI / 2, a + PI / 2); X.closePath();
}
const Cp = (x1, y1, r1, x2, y2, r2, col) => ({ p() { capPath(x1, y1, r1, x2, y2, r2); }, col, bb: [Math.min(x1 - r1, x2 - r2), Math.min(y1 - r1, y2 - r2), Math.max(x1 + r1, x2 + r2), Math.max(y1 + r1, y2 + r2)] });
const Cu = (fn, col, bb, flat) => ({ p: fn, col, bb, flat });
function group(parts, lw = LW) {
  X.lineJoin = 'round'; X.lineCap = 'round'; X.strokeStyle = OL; X.lineWidth = lw * 2;
  X.beginPath(); for (const q of parts) q.p(); X.stroke();
  for (const q of parts) { X.beginPath(); q.p(); X.fillStyle = q.flat ? q.col : paint(q.col, ...q.bb); X.fill(); }
}
function line(pts, col, w) { X.strokeStyle = col; X.lineWidth = w; X.lineCap = 'round'; X.lineJoin = 'round'; X.beginPath(); X.moveTo(pts[0], pts[1]); for (let i = 2; i < pts.length; i += 2) X.lineTo(pts[i], pts[i + 1]); X.stroke(); }
function qline(x0, y0, cx, cy, x1, y1, col, w) { X.strokeStyle = col; X.lineWidth = w; X.lineCap = 'round'; X.beginPath(); X.moveTo(x0, y0); X.quadraticCurveTo(cx, cy, x1, y1); X.stroke(); }
function glow(x, y, r, rgb, a) {
  X.save(); X.globalCompositeOperation = 'lighter';
  const g = X.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, `rgba(${rgb},${a})`); g.addColorStop(1, `rgba(${rgb},0)`);
  X.fillStyle = g; X.fillRect(x - r, y - r, r * 2, r * 2); X.restore();
}
function twinkle(x, y, r, a, rgb = '255,255,255') {
  X.save(); X.globalCompositeOperation = 'lighter'; X.fillStyle = `rgba(${rgb},${a})`;
  X.beginPath(); X.moveTo(x, y - r); X.quadraticCurveTo(x, y, x + r, y); X.quadraticCurveTo(x, y, x, y + r); X.quadraticCurveTo(x, y, x - r, y); X.quadraticCurveTo(x, y, x, y - r); X.fill(); X.restore();
}
function starPath(x, y, r, inner = 0.45, n = 5, rot = 0) {
  for (let i = 0; i < n * 2; i++) { const a = -PI / 2 + rot + i * PI / n, rad = i % 2 ? r * inner : r; i ? X.lineTo(x + Math.cos(a) * rad, y + Math.sin(a) * rad) : X.moveTo(x + Math.cos(a) * rad, y + Math.sin(a) * rad); }
  X.closePath();
}
function heartPath(x, y, s) {
  X.moveTo(x, y + s * 0.9);
  X.bezierCurveTo(x - s * 1.35, y, x - s * 0.95, y - s * 1.15, x, y - s * 0.42);
  X.bezierCurveTo(x + s * 0.95, y - s * 1.15, x + s * 1.35, y, x, y + s * 0.9);
}
function eye(x, y, r, look, blink, iris) {
  const ry = r * 1.18;
  X.lineWidth = LW * 0.75; X.strokeStyle = OL; X.lineCap = 'round';
  if (blink) { X.beginPath(); X.moveTo(x - r, y); X.quadraticCurveTo(x, y + r * 0.55, x + r, y); X.stroke(); return; }
  X.beginPath(); X.ellipse(x, y, r, ry, 0, 0, TAU); X.fillStyle = '#fff'; X.fill(); X.stroke();
  X.save(); X.beginPath(); X.ellipse(x, y, r, ry, 0, 0, TAU); X.clip();
  const ix = x + look * r * 0.36, iy = y + r * 0.08;
  X.fillStyle = iris; X.beginPath(); X.arc(ix, iy, r * 0.72, 0, TAU); X.fill();
  X.fillStyle = '#120818'; X.beginPath(); X.arc(ix + look * r * 0.08, iy, r * 0.4, 0, TAU); X.fill();
  X.fillStyle = '#fff'; X.beginPath(); X.arc(ix - r * 0.24, iy - r * 0.32, r * 0.24, 0, TAU); X.fill();
  X.fillStyle = 'rgba(70,30,100,.2)'; X.fillRect(x - r, y - ry, r * 2, ry * 0.55);
  X.restore();
}
const blinkAt = (t, seed) => ((t + seed) % 230) < 7;
function smear(cx, cy, r0, r1, a0, a1, rgb) {
  X.save();
  const g = X.createRadialGradient(cx, cy, r0, cx, cy, r1);
  g.addColorStop(0, `rgba(${rgb},0)`); g.addColorStop(0.6, `rgba(${rgb},.35)`); g.addColorStop(1, `rgba(${rgb},.75)`);
  X.beginPath(); X.arc(cx, cy, r1, a1, a0); X.arc(cx, cy, r0, a0, a1, true); X.closePath();
  X.fillStyle = g; X.fill(); X.restore();
}

/* =========================================================
   Rig & animation
   Angles: 0 = straight down, positive = towards facing direction.
   ========================================================= */
function legParts(hx, hy, th, kn, L1, L2, r, col) {
  const kx = hx + Math.sin(th) * L1, ky = hy + Math.cos(th) * L1, sa = th - kn;
  const fx = kx + Math.sin(sa) * L2, fy = ky + Math.cos(sa) * L2;
  return { parts: [Cp(hx, hy, r[0], kx, ky, r[1], col), Cp(kx, ky, r[1], fx, fy, r[2], col)], kx, ky, fx, fy, sa };
}
function armParts(sx, sy, sh, el, U1, U2, r, col) {
  const ex = sx + Math.sin(sh) * U1, ey = sy + Math.cos(sh) * U1, fa = sh + el;
  const hx = ex + Math.sin(fa) * U2, hy = ey + Math.cos(fa) * U2;
  return { parts: [Cp(sx, sy, r[0], ex, ey, r[1], col), Cp(ex, ey, r[1], hx, hy, r[2], col)], ex, ey, hx, hy, fa };
}
const POSE_KEYS = ['lean', 'tL', 'kL', 'tR', 'kR', 'sL', 'eL', 'sR', 'eR', 'head', 'hipOff', 'cast'];
function rawPose(a, H) {
  const P = { lean: 0, tL: 0.12, kL: 0.12, tR: -0.1, kR: 0.12, sL: 0.15, eL: 0.4, sR: -0.1, eR: 0.45, head: 0, hipOff: 0, cast: 0, swing: 0 };
  const t = a.t;
  if (a.hurt) {
    Object.assign(P, { lean: -0.38, sL: 2.5, eL: 0.4, sR: 2.9, eR: 0.3, tL: 0.55, kL: 0.9, tR: -0.25, kR: 0.4, head: -0.25 });
  } else if (a.air) {
    const up = clamp(-a.vy / 10, -1, 1);
    P.tL = 0.95; P.kL = 1.55; P.tR = -0.28 + (1 - up) * 0.22; P.kR = 0.5 + up * 0.25;
    if (up > 0) { P.sR = 2.6; P.eR = 0.35; P.sL = -0.8; P.eL = 0.6; P.head = -0.12; }
    else { P.sR = 1.8 + Math.sin(t * 0.5) * 0.25; P.eR = 0.5; P.sL = -1.4 + Math.sin(t * 0.5 + 1) * 0.25; P.eL = 0.6; P.head = 0.08; }
    P.lean = 0.06;
  } else if (a.spd > 0.08) {
    const f = a.phase, s = a.spd;
    P.tL = 0.85 * Math.sin(f) * s + 0.05; P.kL = 0.15 + 1.4 * Math.max(0, Math.cos(f)) * s;
    P.tR = 0.85 * Math.sin(f + PI) * s + 0.05; P.kR = 0.15 + 1.4 * Math.max(0, Math.cos(f + PI)) * s;
    P.sL = -0.95 * Math.sin(f) * s; P.eL = 0.9 + 0.35 * s;
    P.sR = -0.95 * Math.sin(f + PI) * s; P.eR = 0.9 + 0.35 * s;
    P.lean = 0.17 * s; P.head = -0.06 * s + Math.sin(2 * f) * 0.04; P.hipOff = -Math.cos(2 * f) * 1.3 * s;
  } else {
    const b = Math.sin(t * 0.05);
    P.sL = 0.14 + b * 0.04; P.sR = -0.08 - b * 0.04; P.head = b * 0.035; P.hipOff = b * 0.5;
  }
  if (a.atk >= 0 && H) {
    const k = a.atk;
    if (H.atk === 'club' || H.atk === 'sword') {
      const wind = 0.22, hit = 0.45;
      let ang;
      if (k < wind) ang = lerp(P.sR, 3.75, easeOut(k / wind));
      else if (k < hit) ang = lerp(3.75, 0.3, easeOut((k - wind) / (hit - wind)));
      else ang = lerp(0.3, 0.1, easeInOut((k - hit) / (1 - hit)));
      P.sR = ang; P.eR = k < wind ? 0.9 : 0.12;
      P.lean += k < wind ? -0.14 : k < hit ? 0.3 : 0.3 * (1 - (k - hit) / (1 - hit));
      P.swing = k > wind && k < hit + 0.08 ? 1 : 0;
    } else {
      const wind = 0.25;
      P.sR = k < wind ? lerp(P.sR, 0.5, k / wind) : 1.55; P.eR = k < wind ? 1.5 : 0.05;
      P.lean += k < wind ? -0.08 : 0.12 * (1 - k);
      P.cast = k < wind ? k / wind : Math.max(0, 1 - (k - wind) / 0.6);
    }
  }
  return P;
}
function blendPose(cur, tgt, k) {
  if (!cur) return { ...tgt };
  for (const key of POSE_KEYS) cur[key] += (tgt[key] - cur[key]) * k;
  cur.swing = tgt.swing;
  return cur;
}
function hipFor(P, a, L1, L2, ankle) {
  const ext = (a.air || a.hurt) ? (L1 + L2) * 0.93 : Math.max(Math.cos(P.tL) * L1 + Math.cos(P.tL - P.kL) * L2, Math.cos(P.tR) * L1 + Math.cos(P.tR - P.kR) * L2);
  return -(ext + ankle) + P.hipOff;
}

function drawHumanoid(c, P, a) {
  if (c.adjust) P = c.adjust({ ...P });
  const hipY = hipFor(P, a, c.L1, c.L2, c.ankle);
  X.save(); X.translate(0, hipY);
  const far = col => shade(col, -0.2);
  X.save(); X.rotate(P.lean);
  const fa = armParts(c.shX - 2, c.shY, P.sL, P.eL, c.U1, c.U2, c.armR, far(c.armCol));
  group([...fa.parts, E(fa.hx, fa.hy, c.hand, c.hand, far(c.skin))]);
  if (c.back) c.back(P, a);
  X.restore();
  const lf = legParts(-1.5, 0, P.tL, P.kL, c.L1, c.L2, c.legR, far(c.legCol));
  group([...lf.parts, ...c.foot(lf, far(c.footCol))]); if (c.legDetail) c.legDetail(lf, true);
  const ln = legParts(1.5, 0, P.tR, P.kR, c.L1, c.L2, c.legR, c.legCol);
  group([...ln.parts, ...c.foot(ln, c.footCol)]); if (c.legDetail) c.legDetail(ln, false);
  X.save(); X.rotate(P.lean);
  c.torso(P, a);
  X.save(); X.translate(c.headX, c.headY); X.rotate(P.head); c.head(P, a); X.restore();
  const na = armParts(c.shX, c.shY, P.sR, P.eR, c.U1, c.U2, c.armR, c.armCol);
  if (c.weapon) c.weapon(na, P, a);
  group([...na.parts, E(na.hx, na.hy, c.hand, c.hand, c.skin)]);
  if (c.weaponFront) c.weaponFront(na, P, a);
  X.restore();
  X.restore();
}

/* ---------- Grug, the caveman ---------- */
const GRUG = {
  L1: 11, L2: 11, legR: [6.2, 5, 4.2], U1: 9, U2: 9, armR: [5, 4.2, 3.6], ankle: 3, shX: 0, shY: -20, headX: 3, headY: -31, hand: 4.8,
  skin: '#f2a26e', legCol: '#f2a26e', footCol: '#f2a26e', armCol: '#f2a26e',
  foot: (l, col) => [E(l.fx + 3.5, l.fy + 0.5, 7.2, 3.8, col, -l.sa * 0.3)],
  torso(P, a) {
    const FUR = '#f7b23b';
    const path = () => {
      X.moveTo(-10, -21); X.bezierCurveTo(-15, -12, -15, -2, -12, 6);
      X.lineTo(-8, 3); X.lineTo(-5, 9); X.lineTo(-1, 4); X.lineTo(3, 9); X.lineTo(7, 4); X.lineTo(11, 8);
      X.bezierCurveTo(16, -1, 15, -15, 9, -22); X.bezierCurveTo(4, -26, -5, -26, -10, -21); X.closePath();
    };
    group([Cu(path, FUR, [-15, -26, 16, 9])]);
    X.save(); X.beginPath(); path(); X.clip();
    for (const [x, y, r] of [[-7, -13, 2.6], [3, -17, 2.3], [-2, -5, 2.8], [8, -8, 2.2], [-10, 1, 2], [10, -18, 2], [5, 2, 2.2]]) {
      X.strokeStyle = '#8a4a14'; X.lineWidth = 1.6; X.beginPath(); X.ellipse(x, y, r, r * 0.8, 0.3, 0.4, TAU - 0.6); X.stroke();
      X.fillStyle = '#c47a1e'; X.beginPath(); X.ellipse(x, y, r * 0.45, r * 0.35, 0, 0, TAU); X.fill();
    }
    X.restore();
    line([-9, -22, -2, -24, 7, -22], '#9a5a1a', 2.2);
  },
  head(P, a) {
    const SK = '#f2a26e', HAIR = '#ff6f2c', sw = a.sway * 3;
    group([Cu(() => {
      X.moveTo(-13, 4); X.lineTo(-20 - sw, -2); X.lineTo(-14, -6); X.lineTo(-21 - sw, -14); X.lineTo(-11, -13); X.lineTo(-13 - sw, -24);
      X.lineTo(-3, -15); X.lineTo(1 - sw * 0.6, -27); X.lineTo(6, -15); X.lineTo(14 - sw * 0.4, -22); X.lineTo(12, -10); X.lineTo(10, -6);
      X.quadraticCurveTo(0, -8, -13, 4); X.closePath();
    }, HAIR, [-21, -27, 14, 4])]);
    group([E(0, 0, 14, 13.5, SK), E(6, 6, 9, 7.5, SK)]);
    group([E(-5, 1.5, 3.4, 4.4, SK)]);
    qline(-6, 0, -4.5, 2, -5.5, 3.5, shade(SK, -0.3), 1.4);
    group([E(14.5, -0.5, 5, 4.4, SK)]);
    eye(8, -3.5, 3.6, 1, blinkAt(a.t, 13), '#4a2a14');
    qline(2.5, -9.5, 8, -12.5, 13.5, -9, '#5a2410', 3.4);
    X.beginPath(); X.moveTo(4, 6); X.quadraticCurveTo(9.5, 13, 15.5, 5.5); X.quadraticCurveTo(10, 8, 4, 6); X.closePath();
    X.fillStyle = '#6a1626'; X.fill(); X.lineWidth = LW * 0.8; X.strokeStyle = OL; X.stroke();
    X.fillStyle = '#fff'; X.fillRect(8, 6.6, 2.8, 2.6);
    X.fillStyle = 'rgba(255,120,120,.35)'; X.beginPath(); X.ellipse(4, 3, 3.5, 2, 0, 0, TAU); X.fill();
    group([Cu(() => {
      X.moveTo(-12, -5); X.lineTo(-9, -14); X.lineTo(-4, -9); X.lineTo(0, -17); X.lineTo(4, -9); X.lineTo(9, -14); X.lineTo(9.5, -7);
      X.quadraticCurveTo(0, -4, -12, -5); X.closePath();
    }, HAIR, [-12, -17, 10, -4])]);
    qline(-6, -9, -3, -12, 0, -14, shade(HAIR, -0.25), 1.3);
  },
  weapon(na, P) {
    const dir = na.fa + 0.35, ca = PI / 2 - dir;
    if (P.swing) smear(0, -20, 16, 44, ca, ca - 1.5, '255,250,230');
    X.save(); X.translate(na.hx, na.hy); X.rotate(ca);
    group([Cp(-5, 0, 2.6, 14, 0, 3.6, '#8b5428'), E(25, 0, 11.5, 9, '#ae6a2e')]);
    for (const [x, y] of [[21, -4], [28, 3], [30, -3]]) { X.fillStyle = '#7a4418'; X.beginPath(); X.ellipse(x, y, 2, 1.5, 0, 0, TAU); X.fill(); }
    qline(18, -5, 24, -8, 31, -5, 'rgba(255,230,190,.6)', 1.6);
    X.restore();
  }
};

/* ---------- Zahir, the prince ---------- */
const ZAHIR = {
  L1: 12.5, L2: 12, legR: [7.5, 6.2, 3.3], U1: 9.5, U2: 9, armR: [4.2, 3.6, 3], ankle: 3.5, shX: 0, shY: -21, headX: 2, headY: -32, hand: 3.8,
  skin: '#d99a6c', legCol: '#fff3e2', footCol: '#e9a83a', armCol: '#d99a6c',
  foot: (l, col) => [Cu(() => {
    X.moveTo(l.fx - 5, l.fy + 3); X.quadraticCurveTo(l.fx - 5, l.fy - 4, l.fx + 2, l.fy - 3);
    X.quadraticCurveTo(l.fx + 9, l.fy - 2, l.fx + 13, l.fy - 7); X.quadraticCurveTo(l.fx + 14, l.fy + 3, l.fx + 5, l.fy + 3); X.closePath();
  }, col, [l.fx - 5, l.fy - 7, l.fx + 14, l.fy + 3])],
  legDetail(l, far) {
    const x = l.kx + (l.fx - l.kx) * 0.8, y = l.ky + (l.fy - l.ky) * 0.8;
    group([E(x, y, 4.4, 2.6, far ? shade('#f4c430', -0.2) : '#f4c430', -l.sa + PI / 2)], LW * 0.7);
    qline(l.kx - 3, l.ky - 6, l.kx, l.ky - 2, l.kx - 1, l.ky + 3, 'rgba(160,120,90,.4)', 1.3);
  },
  back(P, a) {
    const sw = a.sway, SASH = '#e0384a';
    group([Cp(-8, 0, 3, -16 - sw * 6, 9 + sw * 2 + Math.sin(a.t * 0.2) * 1.5, 1.6, SASH), Cp(-8, 1, 2.6, -12 - sw * 4, 13 + Math.sin(a.t * 0.2 + 1), 1.4, SASH)]);
  },
  torso(P, a) {
    const SK = '#d99a6c', VEST = '#3b6fe0', GOLD = '#f4c430';
    group([Cu(() => { X.moveTo(-8, -22); X.quadraticCurveTo(-10, -10, -7, 0); X.lineTo(7, 0); X.quadraticCurveTo(9, -12, 8, -22); X.quadraticCurveTo(0, -25, -8, -22); X.closePath(); }, SK, [-10, -25, 9, 0])]);
    qline(3, -16, 6, -14, 7, -11, shade(SK, -0.22), 1.3);
    group([Cu(() => { X.moveTo(-9, -23); X.quadraticCurveTo(-1, -26, 3, -23); X.quadraticCurveTo(-1, -12, 1, -1); X.lineTo(-8, 1); X.quadraticCurveTo(-11, -10, -9, -23); X.closePath(); }, VEST, [-11, -26, 3, 1])]);
    group([Cu(() => { X.moveTo(5.5, -23); X.lineTo(8.5, -22); X.quadraticCurveTo(9.5, -12, 8, -2); X.lineTo(5, -2); X.quadraticCurveTo(6.5, -12, 5.5, -23); X.closePath(); }, VEST, [5, -23, 9.5, -2])]);
    qline(1.5, -22, -1.5, -12, 0, -2, GOLD, 1.6); qline(6.5, -21, 7.5, -12, 6.2, -3, GOLD, 1.4);
    group([Cu(() => X.roundRect(-10, -3, 20, 7, 3), '#e0384a', [-10, -3, 10, 4])]);
    line([-9, 0.5, 9, 0.5], 'rgba(255,200,120,.6)', 1.2);
  },
  head(P, a) {
    const SK = '#d99a6c', TUR = '#fff6e6', GOLD = '#f4c430', sw = a.sway;
    group([E(-7, 1, 6, 8, '#24130b')]);
    group([E(0, 0, 11.5, 11.5, SK), E(5, 5, 7, 5.5, SK)]);
    group([E(-4, 1.5, 2.8, 3.6, SK)]);
    X.strokeStyle = GOLD; X.lineWidth = 1.6; X.beginPath(); X.arc(-4, 6.5, 1.8, 0, TAU); X.stroke();
    group([E(11.6, 1.2, 2.7, 2.4, SK)]);
    eye(6.5, -0.5, 3.1, 1, blinkAt(a.t, 71), '#3a2010');
    qline(3, -5.5, 6.5, -7, 10, -5, '#2a160c', 2);
    qline(5, 6, 7.5, 7.8, 10, 5.5, OL, 1.6);
    group([E(0, -8.5, 13.5, 8.5, TUR), E(-2, -14, 10, 6.5, TUR), E(-4, -19, 5, 4, TUR)]);
    qline(-11, -8, 0, -3, 12, -9, shade(TUR, -0.18), 1.4); qline(-9, -13, -1, -9, 8, -14, shade(TUR, -0.18), 1.4);
    group([Cu(() => { X.moveTo(10, -11); X.bezierCurveTo(12 - sw * 2, -22, 4 - sw * 4, -30, -2 - sw * 6, -29); X.bezierCurveTo(4 - sw * 3, -24, 8 - sw, -18, 8, -11); X.closePath(); }, '#2fd1b8', [-4, -30, 12, -11])]);
    qline(9, -12, 7 - sw * 2, -20, 0 - sw * 5, -27, shade('#2fd1b8', -0.3), 1.1);
    group([E(11, -8, 3.6, 4.2, GOLD)], LW * 0.8);
    X.fillStyle = '#e0384a'; X.beginPath(); X.ellipse(11, -8, 2.1, 2.7, 0, 0, TAU); X.fill();
    X.fillStyle = 'rgba(255,255,255,.85)'; X.beginPath(); X.arc(10.3, -9, 0.9, 0, TAU); X.fill();
  },
  weapon(na, P) {
    const dir = na.fa + 0.2, ca = PI / 2 - dir;
    if (P.swing) smear(0, -21, 16, 50, ca, ca - 1.6, '190,240,255');
    X.save(); X.translate(na.hx, na.hy); X.rotate(ca);
    group([Cp(-7, 0, 2.2, 3, 0, 2.2, '#5a2f16'), E(-8.5, 0, 2.8, 2.8, '#f4c430')]);
    X.beginPath(); X.moveTo(4, -2.6); X.quadraticCurveTo(22, -5, 41, -15); X.quadraticCurveTo(30, -1, 4, 2.8); X.closePath();
    X.lineJoin = 'round'; X.lineWidth = LW * 2; X.strokeStyle = OL; X.stroke();
    X.fillStyle = vgrad(-9, 4, ['#ffffff', '#dbe6f3', '#8796b0']); X.fill();
    qline(6, -1.6, 22, -4, 38, -13, 'rgba(255,255,255,.95)', 1.1);
    group([Cu(() => X.roundRect(2, -6.5, 3.6, 13, 1.6), '#f4c430', [2, -6.5, 5.6, 6.5])], LW * 0.8);
    X.restore();
  }
};

/* ---------- Lyra, the sorceress ---------- */
const LYRA = {
  L1: 9.5, L2: 9.5, legR: [3.6, 3.1, 2.7], U1: 8.5, U2: 8, armR: [4.2, 3.4, 2.8], ankle: 3, shX: 0, shY: -20, headX: 2, headY: -31, hand: 3.4,
  skin: '#f6c9a6', legCol: '#3b2266', footCol: '#2a1745', armCol: '#7b4fd6',
  foot: (l, col) => [E(l.fx + 2.5, l.fy + 0.5, 5.6, 3.3, col, -l.sa * 0.3)],
  adjust(P) { const k = 1 - P.cast; P.sR = lerp(P.sR, Math.max(0.75, P.sR * 0.4 + 0.75), k); P.eR = lerp(P.eR, 0.25, k); return P; },
  back(P, a) {
    const sw = a.sway * 4, w = Math.sin(a.t * 0.14) * 2;
    group([Cu(() => {
      X.moveTo(-3, -23); X.bezierCurveTo(-13, -18, -17 - sw, -6, -20 - sw * 1.5, 6 + w);
      X.quadraticCurveTo(-15 - sw, 4 - w, -10 - sw * 0.6, 9 + w); X.quadraticCurveTo(-6, 4, -2, 6); X.lineTo(1, -20); X.closePath();
    }, '#4b2a9a', [-22, -23, 1, 9])]);
  },
  torso(P, a) {
    const ROBE = '#7b4fd6', GOLD = '#ffd166', sw = a.sway * 3, w = Math.sin(a.t * 0.12) * 1.4 * a.spd;
    const dress = () => {
      X.moveTo(-6, -22); X.quadraticCurveTo(-9, -8, -14 - sw, 12 + w); X.quadraticCurveTo(-7, 15, 0, 13 - w);
      X.quadraticCurveTo(7, 15, 14 - sw * 0.4, 12); X.quadraticCurveTo(8, -8, 6, -22); X.quadraticCurveTo(0, -24, -6, -22); X.closePath();
    };
    group([Cu(dress, ROBE, [-15, -24, 15, 15])]);
    X.save(); X.beginPath(); dress(); X.clip();
    X.strokeStyle = GOLD; X.lineWidth = 3.2; X.beginPath(); X.moveTo(-16 - sw, 10 + w); X.quadraticCurveTo(-7, 13, 0, 11 - w); X.quadraticCurveTo(7, 13, 16, 10); X.stroke();
    for (const [x, y] of [[-6, 2], [4, -3], [7, 6], [-2, 8], [-9, 7]]) { X.fillStyle = 'rgba(255,209,102,.85)'; X.beginPath(); starPath(x, y, 2, 0.45, 4); X.fill(); }
    X.restore();
    group([Cu(() => X.roundRect(-7, -23, 14, 12, 5), '#5a35a8', [-7, -23, 7, -11])]);
    group([Cu(() => X.roundRect(-8, -12, 16, 3.6, 1.8), GOLD, [-8, -12, 8, -8])], LW * 0.7);
    group([E(0, -22, 7, 2.6, '#fff4fb')], LW * 0.7);
  },
  head(P, a) {
    const SK = '#f6c9a6', HAIR = '#ff7eb6', HAT = '#3d2486', sw = a.sway;
    group([Cu(() => {
      X.moveTo(-9, -6); X.bezierCurveTo(-16 - sw * 3, 4, -15 - sw * 4, 16, -9 - sw * 5, 24);
      X.quadraticCurveTo(-4, 20, -2, 10); X.quadraticCurveTo(2, 4, 6, 2); X.lineTo(0, -10); X.closePath();
    }, HAIR, [-18, -10, 6, 24])]);
    qline(-10, 0, -12 - sw * 3, 10, -9 - sw * 4, 19, shade(HAIR, -0.22), 1.3);
    group([E(0, 0, 11, 11, SK), E(4, 4, 7, 5.5, SK)]);
    eye(6, 0, 3.8, 1, blinkAt(a.t, 151), '#7a3fe0');
    line([3.2, -4.6, 2, -6.2], OL, 1.4); line([5.6, -5.2, 5, -7], OL, 1.4);
    X.fillStyle = 'rgba(255,110,150,.45)'; X.beginPath(); X.ellipse(5, 5.5, 3, 1.7, 0, 0, TAU); X.fill();
    qline(7.5, 7, 9, 8.2, 10.5, 6.6, OL, 1.4);
    group([Cu(() => {
      X.moveTo(-11, -1); X.quadraticCurveTo(-10, -12, 2, -11); X.quadraticCurveTo(10, -10, 11, -3);
      X.quadraticCurveTo(7, -6, 5, -3); X.quadraticCurveTo(3, -7, -1, -4); X.quadraticCurveTo(-5, -7, -11, -1); X.closePath();
    }, HAIR, [-11, -12, 11, -1])]);
    group([Cu(() => {
      X.moveTo(-11, -10); X.bezierCurveTo(-8, -22, -6 - sw * 2, -34, -15 - sw * 6, -43);
      X.quadraticCurveTo(-1, -30, 11, -10); X.closePath();
    }, HAT, [-16, -43, 11, -10])]);
    line([-10, -12.5, 10, -12.5], '#ffd166', 2.6);
    group([E(-1, -9.5, 18, 4.6, HAT)]);
    X.beginPath(); starPath(-3, -22, 4.6); X.fillStyle = '#ffd166'; X.fill(); X.lineWidth = 1.2; X.strokeStyle = OL; X.stroke();
    twinkle(-15 - sw * 6, -43, 4 + Math.sin(a.t * 0.2) * 1.5, 0.9, '255,230,150');
  },
  weapon(na, P, a) {
    const dir = lerp(PI - 0.4, 1.8, P.cast), ca = PI / 2 - dir;
    X.save(); X.translate(na.hx, na.hy); X.rotate(ca);
    group([Cp(-16, 0, 2.2, 28, 0, 2.6, '#9a6a3a')]);
    X.strokeStyle = '#ffd166'; X.lineWidth = 2.4; X.beginPath(); X.arc(34, 0, 7, PI * 0.6, PI * 1.4, true); X.stroke();
    const pulse = 0.35 + P.cast * 0.65 + Math.sin(a.t * 0.12) * 0.1;
    glow(35, 0, 22 + pulse * 14, '120,240,255', 0.35 + pulse * 0.35);
    X.beginPath(); X.arc(35, 0, 5.5 + pulse * 1.5, 0, TAU);
    const g = X.createRadialGradient(33, -2, 0, 35, 0, 7); g.addColorStop(0, '#ffffff'); g.addColorStop(0.5, '#8ff7ff'); g.addColorStop(1, '#3a8ad8');
    X.fillStyle = g; X.fill(); X.lineWidth = 1.6; X.strokeStyle = OL; X.stroke();
    for (let k = 0; k < 3; k++) { const an = a.t * 0.08 + k * 2.1; twinkle(35 + Math.cos(an) * 11, Math.sin(an) * 11, 2.2, 0.8, '200,250,255'); }
    X.restore();
  }
};
const HUMANS = { grug: GRUG, zahir: ZAHIR, lyra: LYRA };

/* ---------- Rexy, the cool T-Rex ---------- */
function drawRex(P, a) {
  const G = '#4fc36a', BELLY = '#f4f6b4', PLATE = '#ff9a3c', far = shade(G, -0.2);
  const L1 = 12, L2 = 11.5;
  const hipY = hipFor({ ...P, tL: P.tL * 0.8, tR: P.tR * 0.8 }, a, L1, L2, 3);
  X.save(); X.translate(0, hipY);
  const lf = legParts(-4, 0, P.tL * 0.8, P.kL, L1, L2, [8, 5.5, 4], far);
  group([...lf.parts, E(lf.fx + 4, lf.fy + 0.5, 8, 3.8, far)]);
  X.save(); X.rotate(P.lean * 0.45 - 0.04);
  group([Cp(14, -16, 3.2, 19 + Math.sin(a.t * 0.2) * 1.5, -10, 2.6, far)]);
  let x = -14, y = -10, ang = PI * 0.97;
  const rad = [9.5, 7.8, 6.2, 4.6, 3, 1.6], tail = [];
  for (let i = 0; i < 5; i++) {
    ang += Math.sin(a.t * 0.11 - i * 0.7) * 0.07 * (i + 1) * 0.6 - a.sway * 0.06 - 0.05;
    const nx = x + Math.cos(ang) * 9, ny = y + Math.sin(ang) * 9;
    tail.push(Cp(x, y, rad[i], nx, ny, rad[i + 1], G)); x = nx; y = ny;
  }
  for (const [px, py, s, r] of [[-17, -19, 0.8, -0.5], [-9, -26, 1, -0.25], [0, -29, 1.05, 0], [9, -28, 0.95, 0.25], [15, -33, 0.75, 0.4]]) {
    X.save(); X.translate(px, py); X.rotate(r); X.scale(s, s);
    group([Cu(() => { X.moveTo(-6, 4); X.quadraticCurveTo(-4, -6, 0, -10); X.quadraticCurveTo(4, -6, 6, 4); X.closePath(); }, PLATE, [-6, -10, 6, 4])], LW / s);
    X.restore();
  }
  group([...tail, E(0, -12, 20.5, 16.5, G), Cp(9, -20, 9.5, 17, -31, 8.5, G)]);
  X.save(); X.beginPath(); X.ellipse(0, -12, 20.5, 16.5, 0, 0, TAU); X.clip();
  X.fillStyle = paint(BELLY, 0, -16, 16, 6); X.beginPath(); X.ellipse(9, -5, 13, 11.5, -0.3, 0, TAU); X.fill();
  for (let k = 0; k < 4; k++) qline(1 + k * 4, -14 + k * 2, 3 + k * 4, -8 + k * 2, 2 + k * 4, -1 + k * 2, shade(BELLY, -0.2), 1.2);
  X.restore();
  for (const [sx, sy] of [[-10, -18], [-4, -22], [-14, -10]]) { X.fillStyle = shade(G, -0.15); X.beginPath(); X.ellipse(sx, sy, 2.2, 1.6, 0.3, 0, TAU); X.fill(); }
  X.restore();
  const ln = legParts(1, 0, P.tR * 0.8, P.kR, L1, L2, [8.5, 5.8, 4.2], G);
  group([...ln.parts, E(ln.fx + 4, ln.fy + 0.5, 8.5, 4, G)]);
  for (let k = 0; k < 3; k++) { X.fillStyle = '#fffbe6'; X.beginPath(); X.moveTo(ln.fx + 8 + k * 2.5, ln.fy + 2); X.lineTo(ln.fx + 11 + k * 2.5, ln.fy + 4); X.lineTo(ln.fx + 8 + k * 2.5, ln.fy + 4); X.fill(); }
  X.save(); X.rotate(P.lean * 0.45 - 0.04);
  const open = a.atk >= 0 ? Math.sin(Math.min(1, a.atk * 1.7) * PI) * 0.55 : 0;
  X.save(); X.translate(19, -34); X.rotate(P.head * 0.6 - open * 0.25);
  X.save(); X.translate(-2, 4); X.rotate(open);
  X.fillStyle = '#7a1630'; X.beginPath(); X.ellipse(12, -1, 11, 4.5, 0, 0, TAU); X.fill();
  X.fillStyle = '#ff6b8b'; X.beginPath(); X.ellipse(10, 0, 6.5, 2.4, 0, 0, TAU); X.fill();
  group([Cu(() => { X.moveTo(-2, -1); X.quadraticCurveTo(10, 8, 25, 1); X.quadraticCurveTo(23, -2, 19, -1.5); X.lineTo(-2, -3); X.closePath(); }, G, [-2, -3, 25, 8])]);
  for (let k = 0; k < 4; k++) { X.fillStyle = '#fff'; X.beginPath(); X.moveTo(9 + k * 4, -1); X.lineTo(11 + k * 4, -4.5); X.lineTo(13 + k * 4, -1); X.fill(); }
  X.restore();
  group([E(7, -6, 13, 11, G), E(17, -3, 11.5, 8.5, G)]);
  group([E(10, -14.5, 7, 3.2, G)]);
  for (let k = 0; k < 5; k++) { X.fillStyle = '#fff'; X.beginPath(); X.moveTo(8 + k * 4.2, 4.6); X.lineTo(10 + k * 4.2, 8.4); X.lineTo(12 + k * 4.2, 4.6); X.fill(); X.lineWidth = 0.8; X.strokeStyle = 'rgba(43,22,64,.5)'; X.stroke(); }
  X.fillStyle = OL; X.beginPath(); X.ellipse(25, -6.5, 1.3, 0.9, 0.4, 0, TAU); X.fill();
  qline(5, 3, 7, 4.5, 9.5, 3.4, OL, 1.4);
  const lens = () => { X.moveTo(12, -13.5); X.lineTo(25.5, -12.5); X.quadraticCurveTo(25, -4, 21, -4); X.lineTo(15, -4); X.quadraticCurveTo(11.5, -4.5, 12, -13.5); X.closePath(); };
  const lens2 = () => { X.moveTo(3, -12); X.lineTo(9.5, -12.5); X.quadraticCurveTo(9.5, -5, 7, -5); X.quadraticCurveTo(3, -5, 3, -12); X.closePath(); };
  X.beginPath(); lens(); lens2(); X.lineWidth = LW * 2; X.strokeStyle = '#120a20'; X.lineJoin = 'round'; X.stroke();
  X.fillStyle = vgrad(-13, -4, ['#1b1040', '#5b3ab0', '#ff8fb3']); X.fill();
  X.save(); X.beginPath(); lens(); lens2(); X.clip();
  X.strokeStyle = 'rgba(255,255,255,.8)'; X.lineWidth = 2; X.beginPath(); X.moveTo(15, -4); X.lineTo(21, -14); X.moveTo(19, -4); X.lineTo(22.5, -10); X.stroke();
  X.restore();
  line([9.5, -11, 12, -11.5], '#120a20', 2.4); line([3, -10.5, -5, -9.5], '#120a20', 2);
  X.restore();
  group([Cp(15, -17, 3.4, 21 + Math.sin(a.t * 0.2 + 1) * 1.5, -11, 2.8, G)]);
  X.restore();
  X.restore();
}

function drawHero(id, a, pose) {
  const H = HEROES.find(h => h.id === id);
  const P = pose || rawPose(a, H);
  X.save(); X.scale(a.sx || 1, a.sy || 1);
  X.scale(id === 'rex' ? 0.86 : 0.87, id === 'rex' ? 0.86 : 0.87);
  if (id === 'rex') drawRex(P, a); else drawHumanoid(HUMANS[id], P, a);
  X.restore();
}

/* =========================================================
   Foes, pickups, props
   ========================================================= */
function drawSlime(e, t) {
  const col = L.th.slime, hop = Math.abs(Math.sin(e.ph));
  const w = 22 * (1.12 - 0.2 * hop), h = 21 * (0.82 + 0.32 * hop), lift = hop * 9;
  const cx = e.x + e.w / 2, gy = e.y + e.h;
  X.fillStyle = `rgba(30,10,50,${0.25 - hop * 0.12})`; X.beginPath(); X.ellipse(cx, gy + 1, w * (1 - hop * 0.3), 4, 0, 0, TAU); X.fill();
  X.save(); X.translate(cx, gy - lift);
  const body = () => { X.moveTo(-w, 0); X.bezierCurveTo(-w * 1.02, -h * 1.15, w * 1.02, -h * 1.15, w, 0); X.quadraticCurveTo(0, 4, -w, 0); X.closePath(); };
  X.beginPath(); body(); X.lineWidth = LW * 2; X.strokeStyle = OL; X.lineJoin = 'round'; X.stroke();
  const g = X.createRadialGradient(-w * 0.3, -h * 0.65, 2, 0, -h * 0.35, w * 1.3);
  g.addColorStop(0, shade(col, 0.45)); g.addColorStop(0.45, col); g.addColorStop(1, shade(col, -0.35));
  X.fillStyle = g; X.fill();
  X.fillStyle = 'rgba(255,255,255,.35)'; for (const [bx, by, br] of [[w * 0.45, -h * 0.25, 2.2], [w * 0.2, -h * 0.12, 1.4], [-w * 0.55, -h * 0.2, 1.6]]) { X.beginPath(); X.arc(bx, by, br, 0, TAU); X.fill(); }
  X.fillStyle = 'rgba(255,255,255,.75)'; X.beginPath(); X.ellipse(-w * 0.45, -h * 0.68, 4.5, 2.4, -0.6, 0, TAU); X.fill();
  X.beginPath(); X.arc(-w * 0.2, -h * 0.82, 1.4, 0, TAU); X.fill();
  const look = clamp((p ? p.x + p.w / 2 - cx : 0) / 60, -1, 1);
  eye(-6.5, -h * 0.55, 4.6, look, blinkAt(t, e.x | 0), '#2a1048'); eye(6.5, -h * 0.55, 4.6, look, blinkAt(t, e.x | 0), '#2a1048');
  line([-11, -h * 0.55 - 7.5, -3, -h * 0.55 - 4.5], OL, 2.4); line([11, -h * 0.55 - 7.5, 3, -h * 0.55 - 4.5], OL, 2.4);
  X.beginPath(); X.moveTo(-4, -h * 0.2); X.quadraticCurveTo(0, -h * 0.2 + 3, 4, -h * 0.2); X.lineWidth = 1.6; X.strokeStyle = OL; X.stroke();
  X.fillStyle = '#fff'; X.beginPath(); X.moveTo(1, -h * 0.2 + 0.8); X.lineTo(2.5, -h * 0.2 + 3.4); X.lineTo(3.4, -h * 0.2 + 0.4); X.fill();
  X.restore();
}
function drawBat(e, t) {
  const col = L.th.bat, f = Math.sin(t * 0.32 + e.ax), flap = f * Math.abs(f);
  X.save(); X.translate(e.x + e.w / 2, e.y + e.h / 2 + flap * 2);
  for (const s of [-1, 1]) {
    const wy = -flap * 13;
    const wing = () => {
      X.moveTo(s * 7, -4); X.lineTo(s * 19, -12 + wy * 0.7); X.lineTo(s * 34, -3 + wy);
      X.quadraticCurveTo(s * 31, 2 + wy * 0.5, s * 27, 6 + wy * 0.45); X.quadraticCurveTo(s * 23, 2 + wy * 0.3, s * 18, 5 + wy * 0.25);
      X.quadraticCurveTo(s * 13, 2, s * 8, 6); X.closePath();
    };
    X.beginPath(); wing(); X.lineWidth = LW * 2; X.strokeStyle = OL; X.lineJoin = 'round'; X.stroke();
    X.fillStyle = vgrad(-14 + wy, 8, [shade(col, 0.25), col, shade(col, -0.35)]); X.fill();
    line([s * 19, -12 + wy * 0.7, s * 27, 6 + wy * 0.45], shade(col, -0.4), 1.2); line([s * 19, -12 + wy * 0.7, s * 18, 5 + wy * 0.25], shade(col, -0.4), 1.2);
  }
  group([Cu(() => { X.moveTo(-8, -5); X.lineTo(-6, -17); X.lineTo(-1, -8); X.closePath(); }, col, [-8, -17, -1, -5]), Cu(() => { X.moveTo(8, -5); X.lineTo(6, -17); X.lineTo(1, -8); X.closePath(); }, col, [1, -17, 8, -5]), E(0, 0, 11, 10, col), E(0, 7, 6, 4, col)]);
  X.fillStyle = '#ff9ec7'; X.beginPath(); X.moveTo(-6.5, -7); X.lineTo(-5.6, -13); X.lineTo(-3, -8); X.fill(); X.beginPath(); X.moveTo(6.5, -7); X.lineTo(5.6, -13); X.lineTo(3, -8); X.fill();
  eye(-4, -1, 3.4, 0, false, '#ff3b5c'); eye(4, -1, 3.4, 0, false, '#ff3b5c');
  X.fillStyle = '#fff'; X.beginPath(); X.moveTo(-3, 4.5); X.lineTo(-1.8, 8); X.lineTo(-0.6, 4.5); X.fill(); X.beginPath(); X.moveTo(0.6, 4.5); X.lineTo(1.8, 8); X.lineTo(3, 4.5); X.fill();
  X.restore();
}
const GEMC = ['#43dcff', '#ff5fae', '#6dff8a', '#ffd23a', '#b48cff'];
function drawGem(x, y, i) {
  const col = GEMC[i % 5], s = Math.cos(frame * 0.05 + i * 0.7), b = Math.sin(frame * 0.07 + i) * 3;
  glow(x, y + b, 26, '255,255,255', 0.22);
  X.save(); X.translate(x, y + b); X.scale(0.3 + 0.7 * Math.abs(s), 1);
  const facets = [
    Cu(() => { X.moveTo(-11, -4); X.lineTo(-6, -12); X.lineTo(6, -12); X.lineTo(11, -4); X.closePath(); }, shade(col, 0.35), 0, true),
    Cu(() => { X.moveTo(-11, -4); X.lineTo(0, 13); X.lineTo(0, -4); X.closePath(); }, col, 0, true),
    Cu(() => { X.moveTo(0, -4); X.lineTo(11, -4); X.lineTo(0, 13); X.closePath(); }, shade(col, -0.28), 0, true),
    Cu(() => { X.moveTo(-6, -12); X.lineTo(6, -12); X.lineTo(3, -4); X.lineTo(-3, -4); X.closePath(); }, shade(col, 0.65), 0, true)
  ];
  group(facets, LW * 0.9);
  X.restore();
  const tw = (frame + i * 37) % 100;
  if (tw < 14) twinkle(x + 5, y + b - 9, 7 * Math.sin(tw / 14 * PI), 0.95);
}
function drawHeart(h) {
  const b = Math.sin(frame * 0.08) * 3, s = 1 + Math.sin(frame * 0.16) * 0.06;
  glow(h.x, h.y + b, 30, '255,90,130', 0.35);
  X.save(); X.translate(h.x, h.y + b); X.scale(s, s);
  X.beginPath(); heartPath(0, 0, 13); X.lineWidth = LW * 2; X.strokeStyle = OL; X.stroke();
  const g = X.createRadialGradient(-5, -6, 1, 0, 0, 17); g.addColorStop(0, '#ffc2d1'); g.addColorStop(0.45, '#ff4d6d'); g.addColorStop(1, '#b0183c');
  X.fillStyle = g; X.fill();
  X.fillStyle = 'rgba(255,255,255,.8)'; X.beginPath(); X.ellipse(-6, -5, 3.4, 2, -0.6, 0, TAU); X.fill();
  X.restore();
}
function drawLantern(c) {
  const x = c.x, y = c.y, on = c.on;
  group([Cu(() => X.roundRect(x - 7, y - 70, 14, 70, 3), L.th.stone, [x - 7, y - 70, x + 7, y]), Cu(() => X.roundRect(x - 11, y - 8, 22, 8, 3), shade(L.th.stone, -0.15), [x - 11, y - 8, x + 11, y])]);
  line([x - 3, y - 60, x - 3, y - 14], 'rgba(255,255,255,.25)', 2);
  const ly = y - 92;
  if (on) glow(x, ly, 70 + Math.sin(frame * 0.2) * 6, '255,200,100', 0.55);
  group([Cu(() => { X.moveTo(x - 13, ly - 12); X.lineTo(x + 13, ly - 12); X.lineTo(x + 9, ly - 20); X.lineTo(x - 9, ly - 20); X.closePath(); }, '#5a3a8a', [x - 13, ly - 20, x + 13, ly - 12]),
         Cu(() => X.roundRect(x - 10, ly - 12, 20, 26, 4), on ? '#ffe6a0' : '#8a84a8', [x - 10, ly - 12, x + 10, ly + 14]),
         Cu(() => X.roundRect(x - 12, ly + 13, 24, 6, 2), '#5a3a8a', [x - 12, ly + 13, x + 12, ly + 19])]);
  line([x, ly - 12, x, ly + 13], '#5a3a8a', 2); line([x - 10, ly, x + 10, ly], 'rgba(90,58,138,.6)', 1.4);
  if (on) {
    const fl = Math.sin(frame * 0.4) * 1.5;
    X.beginPath(); X.moveTo(x, ly - 9 - fl); X.quadraticCurveTo(x + 6, ly + 2, x, ly + 8); X.quadraticCurveTo(x - 6, ly + 2, x, ly - 9 - fl);
    const g = X.createRadialGradient(x, ly + 3, 0, x, ly + 1, 9); g.addColorStop(0, '#ffffff'); g.addColorStop(0.5, '#ffd166'); g.addColorStop(1, '#ff7a1a');
    X.fillStyle = g; X.fill();
  }
}
function drawPortal(ex) {
  const { x, y } = ex, t = frame;
  glow(x, y - 70, 120, '160,120,255', 0.35);
  X.save(); X.translate(x, y);
  X.save(); X.beginPath(); X.ellipse(0, -70, 32, 66, 0, 0, TAU); X.clip();
  const g = X.createRadialGradient(0, -70, 4, 0, -70, 70); g.addColorStop(0, '#ffffff'); g.addColorStop(0.25, '#b9f6ff'); g.addColorStop(0.6, '#8a5cff'); g.addColorStop(1, '#2a0f6a');
  X.fillStyle = g; X.fillRect(-40, -140, 80, 140);
  X.globalCompositeOperation = 'lighter';
  for (let k = 0; k < 7; k++) {
    X.strokeStyle = k % 2 ? 'rgba(255,140,220,.5)' : 'rgba(140,240,255,.55)'; X.lineWidth = 3 + (k % 3);
    X.beginPath(); X.ellipse(0, -70, 30 - k * 4, 64 - k * 8, 0, t * 0.04 * (k % 2 ? -1 : 1) + k, t * 0.04 * (k % 2 ? -1 : 1) + k + 2.2); X.stroke();
  }
  X.restore();
  const arch = () => { X.moveTo(-50, 0); X.lineTo(-50, -120); X.arc(0, -120, 50, PI, 0); X.lineTo(50, 0); X.lineTo(34, 0); X.lineTo(34, -120); X.arc(0, -120, 34, 0, PI, true); X.lineTo(-34, 0); X.closePath(); };
  group([Cu(arch, L.th.stone, [-50, -170, 50, 0])]);
  for (let k = 0; k < 5; k++) {
    const an = PI + (k + 0.5) * PI / 5, rx = Math.cos(an) * 42, ry = -120 + Math.sin(an) * 42;
    const a = 0.5 + 0.5 * Math.sin(t * 0.08 + k);
    X.fillStyle = `rgba(150,240,255,${0.5 + a * 0.5})`; X.beginPath(); starPath(rx, ry, 4, 0.5, 4, t * 0.02); X.fill();
  }
  for (const s of [-1, 1]) { glow(s * 42, -40, 16, '150,240,255', 0.5); X.fillStyle = '#c9f7ff'; X.beginPath(); X.ellipse(s * 42, -40, 2.5, 6, 0, 0, TAU); X.fill(); }
  for (let k = 0; k < 8; k++) {
    const ph = ((t * 0.012 + k / 8) % 1), an = k * 2.4 + t * 0.03, r = (1 - ph) * 80;
    twinkle(Math.cos(an) * r * 0.5, -70 + Math.sin(an) * r, 3 + ph * 2, ph);
  }
  X.restore();
}

/* =========================================================
   Tiles (pre-rendered into a sprite cache) and ledges
   ========================================================= */
let tileCache = {}, tileRes = 1;
const PAD = 16;
function sprite(key, fn) {
  let c = tileCache[key]; if (c) return c;
  c = document.createElement('canvas');
  const size = Math.ceil((T + PAD * 2) * tileRes); c.width = c.height = size;
  const prev = X; X = c.getContext('2d');
  X.setTransform(tileRes, 0, 0, tileRes, PAD * tileRes, PAD * tileRes); fn();
  X = prev; return tileCache[key] = c;
}
const blit = (c, x, y) => X.drawImage(c, x - PAD, y - PAD, T + PAD * 2, T + PAD * 2);

function groundTile(th, t, l, r, b, d, v, lvl) {
  const R = 12;
  X.beginPath(); X.roundRect(l ? 0 : -1, t ? 0 : -1, T + (l ? 0 : 1) + (r ? 0 : 1), T + (t ? 0 : 1) + (b ? 0 : 1), [t && l ? R : 0, t && r ? R : 0, b && r ? R : 0, b && l ? R : 0]);
  X.fillStyle = vgrad(0, T, [shade(th.dirt, -0.07 * d), shade(th.dirt, -0.07 * (d + 1))]); X.fill();
  X.save(); X.clip();
  for (let k = 0; k < 3; k++) {
    const hx = hash(v * 7 + k * 3 + d), hy = hash(v * 13 + k * 5 + d * 3), px = 7 + hx * 34, py = (t ? 20 : 6) + hy * (t ? 22 : 36), rx = 3.4 + hash(v + k * 9 + d) * 4.2, ry = rx * 0.68;
    X.fillStyle = shade(th.dirt, -0.3 - 0.06 * d); X.beginPath(); X.ellipse(px, py, rx, ry, 0, 0, TAU); X.fill();
    X.fillStyle = shade(th.dirt, -0.08 - 0.06 * d); X.beginPath(); X.ellipse(px - rx * 0.12, py - ry * 0.2, rx * 0.8, ry * 0.7, 0, 0, TAU); X.fill();
    X.fillStyle = 'rgba(255,255,255,.22)'; X.beginPath(); X.ellipse(px - rx * 0.35, py - ry * 0.35, rx * 0.35, ry * 0.25, 0, 0, TAU); X.fill();
  }
  const sy = (t ? 34 : 22) + hash(v * 3 + d) * 8;
  X.strokeStyle = shade(th.dirt, -0.14 - 0.06 * d); X.lineWidth = 2; X.beginPath(); X.moveTo(-2, sy); X.quadraticCurveTo(T / 2, sy + (hash(v + 9) - 0.5) * 10, T + 2, sy + 2); X.stroke();
  if (t) { const ao = vgrad(8, 28, ['rgba(40,10,50,.4)', 'rgba(40,10,50,0)']); X.fillStyle = ao; X.fillRect(-2, 8, T + 4, 22); }
  if (l) { const g = X.createLinearGradient(0, 0, 10, 0); g.addColorStop(0, 'rgba(255,255,255,.12)'); g.addColorStop(1, 'rgba(255,255,255,0)'); X.fillStyle = g; X.fillRect(0, 0, 10, T); }
  if (r) { const g = X.createLinearGradient(T, 0, T - 14, 0); g.addColorStop(0, 'rgba(30,0,50,.28)'); g.addColorStop(1, 'rgba(30,0,50,0)'); X.fillStyle = g; X.fillRect(T - 14, 0, 14, T); }
  X.restore();
  X.strokeStyle = OL; X.lineWidth = LW * 1.1; X.lineCap = 'round'; X.beginPath();
  if (l) { X.moveTo(0, t ? 10 : -1); X.lineTo(0, b ? T - R : T + 1); }
  if (r) { X.moveTo(T, t ? 10 : -1); X.lineTo(T, b ? T - R : T + 1); }
  if (b) { X.moveTo(l ? R : -1, T); X.lineTo(r ? T - R : T + 1, T); if (l) { X.moveTo(0, T - R); X.arc(R, T - R, R, PI, PI / 2, true); } if (r) { X.moveTo(T, T - R); X.arc(T - R, T - R, R, 0, PI / 2); } }
  X.stroke();
  if (t) lip(th, l, r, v, lvl);
}
function lip(th, l, r, v, lvl) {
  const x0 = l ? -5 : -1, x1 = r ? T + 5 : T + 1, top = -4, h = 15;
  const body = () => {
    X.moveTo(x0 + (l ? 7 : 0), top); X.lineTo(x1 - (r ? 7 : 0), top);
    if (r) { X.quadraticCurveTo(x1, top, x1, top + 7); X.quadraticCurveTo(x1, top + h, x1 - 6, top + h); } else X.lineTo(x1, top + h);
    for (let k = 4; k > 0; k--) X.quadraticCurveTo((k - 0.5) * 12, top + h + 6, Math.max((k - 1) * 12, x0 + (l ? 6 : 0)), top + h);
    if (l) { X.quadraticCurveTo(x0, top + h, x0, top + 7); X.quadraticCurveTo(x0, top, x0 + 7, top); } else X.lineTo(x0, top);
    X.closePath();
  };
  X.beginPath(); body(); X.fillStyle = vgrad(top, top + h + 6, [shade(th.top, 0.28), th.top, th.top, th.topDark]); X.fill();
  X.strokeStyle = shade(th.topDark, -0.3); X.lineWidth = 1.8; X.beginPath();
  X.moveTo(r ? x1 - 6 : x1, top + h);
  for (let k = 4; k > 0; k--) X.quadraticCurveTo((k - 0.5) * 12, top + h + 6, Math.max((k - 1) * 12, x0 + (l ? 6 : 0)), top + h);
  X.stroke();
  X.strokeStyle = OL; X.lineWidth = LW * 1.1; X.beginPath();
  X.moveTo(x0 + (l ? 7 : 0), top); X.lineTo(x1 - (r ? 7 : 0), top);
  if (r) { X.quadraticCurveTo(x1, top, x1, top + 7); X.quadraticCurveTo(x1, top + h, x1 - 6, top + h); }
  if (l) { X.moveTo(x0 + 7, top); X.quadraticCurveTo(x0, top, x0, top + 7); X.quadraticCurveTo(x0, top + h, x0 + 6, top + h); }
  X.stroke();
  X.strokeStyle = 'rgba(255,255,255,.5)'; X.lineWidth = 2; X.beginPath(); X.moveTo(x0 + (l ? 8 : 0), top + 3); X.lineTo(x1 - (r ? 8 : 0), top + 3); X.stroke();
  if (lvl === 0) {
    for (let k = 0; k < 6; k++) {
      const bx = 3 + k * 8 + hash(v * 5 + k) * 4, hgt = 5 + hash(v * 9 + k) * 7, lean = (hash(v * 3 + k) - 0.5) * 7;
      qline(bx, top + 1, bx + lean * 0.3, top - hgt * 0.6, bx + lean, top - hgt, k % 2 ? th.topDark : shade(th.top, 0.1), 2.2);
    }
    if (v === 3) {
      const fx = 24, fy = top - 7;
      line([fx, top, fx, fy], th.topDark, 1.6);
      for (let k = 0; k < 5; k++) { const a = k * TAU / 5; X.fillStyle = '#fff3fb'; X.beginPath(); X.ellipse(fx + Math.cos(a) * 3, fy + Math.sin(a) * 3, 2.4, 1.6, a, 0, TAU); X.fill(); }
      X.fillStyle = '#ffcf3a'; X.beginPath(); X.arc(fx, fy, 1.8, 0, TAU); X.fill();
    }
  } else if (lvl === 1) {
    for (let k = 0; k < 3; k++) qline(4 + k * 15, top + 8, 9 + k * 15, top + 6, 14 + k * 15, top + 8, shade(th.top, -0.12), 1.4);
  } else if (v % 2 === 0) {
    for (const [cx, hh, rot] of [[14 + v * 4, 12, -0.25], [20 + v * 4, 8, 0.3]]) {
      X.save(); X.translate(cx, top + 2); X.rotate(rot);
      group([Cu(() => { X.moveTo(-3, 0); X.lineTo(0, -hh); X.lineTo(3, 0); X.closePath(); }, '#bff8ff', [-3, -hh, 3, 0])], LW * 0.7);
      X.restore();
    }
  }
}
function stoneTile(th, v, lvl) {
  group([Cu(() => X.roundRect(1, 1, T - 2, T - 2, 8), th.stone, [0, 0, T, T])]);
  X.strokeStyle = shade(th.stone, -0.22); X.lineWidth = 1.8; X.beginPath();
  X.moveTo(6, T / 2); X.lineTo(T - 6, T / 2); X.moveTo(T / 2 + (v % 2 ? 6 : -6), 6); X.lineTo(T / 2 + (v % 2 ? 6 : -6), T / 2); X.moveTo(T / 3, T / 2); X.lineTo(T / 3, T - 6); X.stroke();
  X.strokeStyle = 'rgba(255,255,255,.45)'; X.lineWidth = 2.2; X.beginPath(); X.moveTo(7, T - 9); X.lineTo(7, 9); X.quadraticCurveTo(7, 6, 10, 6); X.lineTo(T - 10, 6); X.stroke();
  if (lvl === 0) { for (let k = 0; k < 3; k++) { X.fillStyle = k % 2 ? '#5fbf48' : '#4aa83c'; X.beginPath(); X.ellipse(8 + k * 7 + v * 3, 3, 5, 3.4, 0, 0, TAU); X.fill(); } }
  if (lvl === 2 && v === 1) { glow(T / 2, T * 0.72, 16, '120,240,255', 0.5); X.strokeStyle = '#bff8ff'; X.lineWidth = 1.8; X.beginPath(); X.moveTo(T / 2 - 5, T * 0.62); X.lineTo(T / 2, T * 0.82); X.lineTo(T / 2 + 5, T * 0.62); X.stroke(); }
}
function spikeTile(th) {
  group([Cu(() => X.roundRect(0, T - 8, T, 8, 2), '#4a2a3a', [0, T - 8, T, T])], LW * 0.8);
  for (let k = 0; k < 3; k++) {
    const x = 2 + k * 15;
    X.beginPath(); X.moveTo(x, T - 6); X.lineTo(x + 7.5, T * 0.38); X.lineTo(x + 15, T - 6); X.closePath();
    X.lineWidth = LW * 2; X.strokeStyle = OL; X.lineJoin = 'round'; X.stroke();
    X.fillStyle = shade(th.spike, -0.25); X.fill();
    X.fillStyle = shade(th.spike, 0.3); X.beginPath(); X.moveTo(x, T - 6); X.lineTo(x + 7.5, T * 0.38); X.lineTo(x + 7.5, T - 6); X.closePath(); X.fill();
  }
}
function ledge(th, c, r, x, y, n) {
  const W = n * T, x0 = x - 4, x1 = x + W + 4;
  if (th.plat === 'wood') {
    group([Cu(() => X.roundRect(x0, y, x1 - x0, 14, 6), '#cf8a48', [x0, y, x1, y + 14])]);
    for (let k = 0; k < n; k++) {
      const bx = x + k * T;
      if (k) line([bx, y + 2, bx, y + 12], 'rgba(110,55,20,.55)', 1.4);
      line([bx + 4, y + 5, bx + T - 6, y + 5], 'rgba(120,60,20,.35)', 1.3);
      X.fillStyle = '#6a3a1a'; X.beginPath(); X.arc(bx + 6, y + 8, 1.6, 0, TAU); X.arc(bx + T - 6, y + 8, 1.6, 0, TAU); X.fill();
    }
    line([x0 + 6, y + 2.5, x1 - 6, y + 2.5], 'rgba(255,230,190,.45)', 1.6);
    for (const vx of [x + 3, x + W - 3]) {
      const sw = Math.sin(frame * 0.04 + vx) * 2;
      qline(vx, y + 13, vx + sw, y + 24, vx - sw * 0.5, y + 34, '#3e9a2e', 2.2);
      for (const yy of [20, 28]) { X.fillStyle = '#5cc243'; X.beginPath(); X.ellipse(vx + sw * 0.6 + 3, y + yy, 3.4, 1.8, 0.5, 0, TAU); X.fill(); }
    }
  } else if (th.plat === 'carpet') {
    const wv = gx => Math.sin(gx * 0.06 + frame * 0.08) * 2.6;
    const path = () => {
      X.moveTo(x0, y + wv(x0)); for (let gx = x0 + 8; gx < x1; gx += 8) X.lineTo(gx, y + wv(gx));
      X.lineTo(x1, y + wv(x1)); X.lineTo(x1, y + 11 + wv(x1)); for (let gx = x1 - 8; gx > x0; gx -= 8) X.lineTo(gx, y + 11 + wv(gx)); X.lineTo(x0, y + 11 + wv(x0)); X.closePath();
    };
    group([Cu(path, '#c0243f', [x0, y - 3, x1, y + 14])]);
    X.save(); X.beginPath(); path(); X.clip();
    X.strokeStyle = '#ffd166'; X.lineWidth = 2; X.beginPath();
    for (let gx = x0; gx <= x1; gx += 6) X.lineTo(gx, y + 5.5 + wv(gx) + (((gx - x0) / 6) % 2 ? -2 : 2)); X.stroke();
    X.fillStyle = '#2fb3a5'; for (let gx = x0 + 10; gx < x1 - 4; gx += 16) { X.beginPath(); X.moveTo(gx, y + 2 + wv(gx)); X.lineTo(gx + 3, y + 5.5 + wv(gx)); X.lineTo(gx, y + 9 + wv(gx)); X.lineTo(gx - 3, y + 5.5 + wv(gx)); X.fill(); }
    X.restore();
    for (const [ex, dir] of [[x0, -1], [x1, 1]]) for (let k = 0; k < 3; k++) { const yy = y + 2 + k * 3.5 + wv(ex); line([ex, yy, ex + dir * 6, yy + 1 + Math.sin(frame * 0.2 + k) * 1.2], '#ffd166', 1.6); }
  } else {
    glow(x + W / 2, y + 10, 30 + W * 0.4, '120,220,255', 0.22);
    const icicles = [];
    for (let k = 0; k < n; k++) icicles.push(Cu(() => { const bx = x + k * T; X.moveTo(bx + 12, y + 10); X.lineTo(bx + 18, y + 24 + hash(c + k) * 8); X.lineTo(bx + 24, y + 10); X.closePath(); }, '#7fd0ff', [x + k * T + 12, y + 10, x + k * T + 24, y + 30]));
    group([...icicles, Cu(() => X.roundRect(x0, y, x1 - x0, 12, 6), '#9be7ff', [x0, y, x1, y + 12])]);
    line([x0 + 8, y + 3.5, x1 - 10, y + 3.5], 'rgba(255,255,255,.75)', 2);
    for (let k = 0; k < n; k++) if ((frame + k * 40 + c * 13) % 120 < 14) twinkle(x + k * T + 20, y + 3, 6 * Math.sin(((frame + k * 40 + c * 13) % 120) / 14 * PI), 0.9, '220,250,255');
  }
}

/* =========================================================
   Backgrounds (parallax, drawn in screen space)
   ========================================================= */
function ridge(cx, f, yfn, top, bot, y0, y1, edge = 'rgba(43,22,64,.35)') {
  X.beginPath(); X.moveTo(-10, VH + 10);
  for (let sx = -10; sx <= VW + 20; sx += 12) X.lineTo(sx, yfn(sx + cx * f));
  X.lineTo(VW + 20, VH + 10); X.closePath(); X.fillStyle = vgrad(y0, y1, [top, bot]); X.fill();
  if (edge) { X.lineWidth = 2.4; X.strokeStyle = edge; X.stroke(); }
}
function haze(gy, h, rgb, a) { X.fillStyle = vgrad(gy - h, gy, [`rgba(${rgb},0)`, `rgba(${rgb},${a})`]); X.fillRect(0, gy - h, VW, h); X.fillStyle = `rgba(${rgb},${a})`; X.fillRect(0, gy, VW, VH); }
function eachVisible(cx, f, spacing, fn) {
  const o = cx * f, i0 = Math.floor((o - 320) / spacing), i1 = Math.ceil((o + VW + 320) / spacing);
  for (let i = i0; i <= i1; i++) fn(i, i * spacing - o + hash(i) * spacing * 0.4);
}
function cloud(x, y, s) {
  X.save(); X.translate(x, y); X.scale(s, s);
  const bl = [[0, 0, 22], [22, -10, 19], [42, 0, 21], [-20, 5, 15], [60, 7, 13], [10, 8, 18], [32, 9, 17]];
  X.beginPath(); for (const [bx, by, br] of bl) { X.moveTo(bx + br, by); X.arc(bx, by, br, 0, TAU); }
  X.lineWidth = 5; X.strokeStyle = 'rgba(110,120,190,.22)'; X.stroke();
  X.fillStyle = vgrad(-30, 26, ['#ffffff', '#f1f7ff', '#cfdcf5']); X.fill();
  X.restore();
}
function frond(x, y, ang, len, col) {
  X.save(); X.translate(x, y); X.rotate(ang);
  X.beginPath(); X.moveTo(0, 0); X.bezierCurveTo(len * 0.3, -len * 0.22, len * 0.75, -len * 0.12, len, len * 0.2); X.bezierCurveTo(len * 0.7, len * 0.08, len * 0.3, len * 0.14, 0, 0); X.closePath();
  X.lineWidth = 2.6; X.strokeStyle = OL; X.lineJoin = 'round'; X.stroke(); X.fillStyle = paint(col, 0, -len * 0.2, len * 0.6, len * 0.25); X.fill();
  X.strokeStyle = shade(col, -0.3); X.lineWidth = 1.3; X.beginPath(); X.moveTo(3, 0); X.quadraticCurveTo(len * 0.5, -len * 0.08, len * 0.96, len * 0.18); X.stroke();
  for (let k = 1; k < 5; k++) { const px = len * k / 5.5; line([px, -len * 0.05 * (3 - k * 0.5), px + 4, len * 0.05], shade(col, -0.22), 1); }
  X.restore();
}
function palm(x, gy, h, lean, leaf, trunk, t, i) {
  const segs = 7; let px = x, py = gy;
  const pts = [];
  for (let k = 0; k <= segs; k++) { const q = k / segs; pts.push([x + lean * h * q * q, gy - h * q]); }
  for (let k = 0; k < segs; k++) {
    const [ax, ay] = pts[k], [bx, by] = pts[k + 1];
    group([Cp(ax, ay, 8 - k * 0.5, bx, by, 7.5 - k * 0.5, k % 2 ? trunk : shade(trunk, -0.1))], 1.4);
  }
  [px, py] = pts[segs];
  const sway = Math.sin(t * 0.02 + i) * 0.05;
  for (const [a, l] of [[-2.9, 50], [-2.4, 58], [-1.9, 46], [-0.2, 52], [-0.75, 58], [-1.3, 44], [-1.6, 40]]) frond(px, py, a + sway, l, leaf);
  for (let k = 0; k < 3; k++) group([E(px - 4 + k * 4, py + 4 + (k % 2) * 2, 4, 4, '#6b3e1c')], 1.2);
}
const BG = [
  function dino(cx, gy, t) {
    X.fillStyle = vgrad(0, gy, ['#4db4f2', '#8fd6ff', '#d6f2ff', '#fff2c8']); X.fillRect(0, 0, VW, VH);
    const sx = VW * 0.8, sy = gy - 400;
    glow(sx, sy, 200, '255,240,180', 0.5); X.fillStyle = '#fff8cf'; X.beginPath(); X.arc(sx, sy, 42, 0, TAU); X.fill();
    X.save(); X.globalCompositeOperation = 'lighter';
    for (let k = 0; k < 5; k++) { const a = 1.9 + k * 0.22 + Math.sin(t * 0.004 + k) * 0.03; X.fillStyle = 'rgba(255,250,210,.07)'; X.beginPath(); X.moveTo(sx, sy); X.lineTo(sx + Math.cos(a) * 1400, sy + Math.sin(a) * 1400); X.lineTo(sx + Math.cos(a + 0.07) * 1400, sy + Math.sin(a + 0.07) * 1400); X.fill(); }
    X.restore();
    for (let k = 0; k < 6; k++) { const w = VW + 600, x = ((hash(k) * w - cx * 0.03 - t * 0.12 * (0.5 + hash(k + 4))) % w + w) % w - 300; cloud(x, gy - 330 - hash(k + 2) * 150, 0.6 + hash(k + 7) * 0.6); }
    eachVisible(cx, 0.05, 1500, (i, x) => {
      const vol = () => { X.moveTo(x - 290, gy - 30); X.quadraticCurveTo(x - 120, gy - 200, x - 62, gy - 330); X.lineTo(x + 62, gy - 330); X.quadraticCurveTo(x + 120, gy - 200, x + 290, gy - 30); X.closePath(); };
      X.beginPath(); vol(); X.fillStyle = vgrad(gy - 330, gy - 30, ['#9b7468', '#7a5a62']); X.fill(); X.lineWidth = 2.5; X.strokeStyle = 'rgba(43,22,64,.4)'; X.stroke();
      X.save(); X.beginPath(); vol(); X.clip();
      X.fillStyle = 'rgba(255,255,255,.12)'; X.beginPath(); X.moveTo(x - 62, gy - 330); X.quadraticCurveTo(x - 120, gy - 200, x - 290, gy - 30); X.lineTo(x - 180, gy - 30); X.quadraticCurveTo(x - 80, gy - 200, x - 30, gy - 330); X.fill();
      X.restore();
      for (const [dx, len] of [[-20, 120], [25, 90]]) { X.strokeStyle = 'rgba(255,140,40,.9)'; X.lineWidth = 5; X.beginPath(); X.moveTo(x + dx, gy - 328); X.quadraticCurveTo(x + dx * 2.2, gy - 328 + len * 0.5, x + dx * 3, gy - 328 + len); X.stroke(); }
      glow(x, gy - 330, 90, '255,120,40', 0.55);
      X.fillStyle = '#ff8a2f'; X.beginPath(); X.ellipse(x, gy - 330, 62, 9, 0, 0, TAU); X.fill();
      for (let k = 0; k < 6; k++) {
        const q = ((t * 0.35 + k * 55) % 330) / 330, r = 16 + q * 46;
        X.fillStyle = `rgba(150,130,150,${0.5 * (1 - q)})`; X.beginPath(); X.arc(x + Math.sin(q * 5 + k) * 22 + q * 70, gy - 350 - q * 230, r, 0, TAU); X.fill();
        X.fillStyle = `rgba(255,255,255,${0.18 * (1 - q)})`; X.beginPath(); X.arc(x + Math.sin(q * 5 + k) * 22 + q * 70 - r * 0.3, gy - 350 - q * 230 - r * 0.3, r * 0.5, 0, TAU); X.fill();
      }
    });
    ridge(cx, 0.14, wx => gy - 160 - (Math.sin(wx * 0.005) * 50 + Math.sin(wx * 0.013) * 22), '#a6dcc2', '#7fbfa6', gy - 230, gy);
    haze(gy - 60, 160, '220,245,255', 0.35);
    ridge(cx, 0.3, wx => gy - 80 - (Math.sin(wx * 0.009) * 30 + Math.sin(wx * 0.021) * 14), '#7ccc72', '#4f9d58', gy - 130, gy);
    eachVisible(cx, 0.3, 90, (i, x) => { if (hash(i * 3) > 0.55) { const y = gy - 80 - (Math.sin((x + cx * 0.3) * 0.009) * 30 + Math.sin((x + cx * 0.3) * 0.021) * 14); group([E(x, y - 6, 12, 10, '#3f8f4a'), E(x + 9, y - 2, 9, 8, '#3f8f4a')], 1.2); } });
    haze(gy - 20, 90, '230,250,255', 0.22);
    eachVisible(cx, 0.55, 240, (i, x) => { if (hash(i + 11) > 0.25) palm(x, gy + 6, 120 + hash(i + 3) * 80, (hash(i + 5) - 0.5) * 0.5, '#3fa04c', '#8a5a32', t, i); });
    eachVisible(cx, 0.75, 130, (i, x) => { const s = 0.7 + hash(i + 2) * 0.6; group([E(x, gy + 4, 26 * s, 20 * s, '#2f7a3c'), E(x + 20 * s, gy + 8, 20 * s, 15 * s, '#2f7a3c'), E(x - 18 * s, gy + 9, 18 * s, 13 * s, '#2f7a3c')], 1.6); });
  },
  function desert(cx, gy, t) {
    X.fillStyle = vgrad(0, gy, ['#2c1d6b', '#8e3f8c', '#ff7e5f', '#ffcf8a']); X.fillRect(0, 0, VW, VH);
    const sx = VW * 0.5, sy = gy - 180;
    glow(sx, sy, 260, '255,200,120', 0.55);
    X.fillStyle = vgrad(sy - 90, sy + 90, ['#fff3c4', '#ffd27a', '#ff9a5a']); X.beginPath(); X.arc(sx, sy, 88, 0, TAU); X.fill();
    for (let k = 0; k < 4; k++) { X.fillStyle = 'rgba(255,140,110,.55)'; X.fillRect(sx - 90, sy + 18 + k * 16, 180, 3 + k * 2); }
    for (let k = 0; k < 4; k++) { const w = VW + 600, x = ((hash(k + 20) * w - cx * 0.03 - t * 0.08) % w + w) % w - 300; X.globalAlpha = 0.55; cloud(x, gy - 380 - hash(k) * 120, 0.5 + hash(k + 1) * 0.4); X.globalAlpha = 1; }
    ridge(cx, 0.06, wx => gy - 120 - Math.sin(wx * 0.003) * 40 - Math.sin(wx * 0.011) * 12, '#e9a77a', '#c97d6a', gy - 170, gy, 'rgba(90,30,60,.25)');
    ridge(cx, 0.12, wx => gy - 85 - Math.sin(wx * 0.006 + 1) * 30 - Math.sin(wx * 0.017) * 10, '#f2b97c', '#d9915e', gy - 120, gy, 'rgba(90,30,60,.25)');
    haze(gy - 40, 120, '255,190,140', 0.3);
    eachVisible(cx, 0.25, 240, (i, x) => {
      const w = 70 + hash(i) * 60, h = 40 + hash(i + 7) * 90, c = ['#e3a07a', '#d98f6a', '#efb48a'][i % 3 < 0 ? 0 : i % 3], top = gy - h - 40;
      group([Cu(() => X.roundRect(x - w / 2, top, w, h + 60, 4), c, [x - w / 2, top, x + w / 2, gy + 20])], 1.6);
      for (let k = 0; k < 2; k++) {
        const wx = x - w / 4 + k * w / 3, wy = top + 22;
        glow(wx + 5, wy + 8, 14, '255,200,100', 0.45);
        X.fillStyle = '#ffd98a'; X.beginPath(); X.roundRect(wx, wy, 10, 16, [5, 5, 0, 0]); X.fill();
      }
      if (hash(i + 2) > 0.35) {
        const r = w * 0.36, dc = ['#3aa6a0', '#d65a4a', '#e8b030', '#7a5cd6'][Math.floor(hash(i + 4) * 4)];
        group([Cu(() => { X.moveTo(x - r, top); X.bezierCurveTo(x - r, top - r * 1.3, x - r * 0.2, top - r * 1.2, x, top - r * 1.55); X.bezierCurveTo(x + r * 0.2, top - r * 1.2, x + r, top - r * 1.3, x + r, top); X.closePath(); }, dc, [x - r, top - r * 1.55, x + r, top])], 1.6);
        line([x, top - r * 1.55, x, top - r * 1.55 - 14], '#ffd166', 2.4);
      }
      if (hash(i + 5) > 0.65) {
        const mx = x + w / 2;
        group([Cu(() => X.roundRect(mx - 7, top - 110, 16, 150, 3), c, [mx - 7, top - 110, mx + 9, top + 40]), Cu(() => X.roundRect(mx - 11, top - 70, 24, 6, 2), shade(c, -0.15), [mx - 11, top - 70, mx + 13, top - 64]), E(mx + 1, top - 112, 12, 15, '#3aa6a0')], 1.6);
      }
    });
    haze(gy - 10, 80, '255,200,150', 0.25);
    eachVisible(cx, 0.5, 260, (i, x) => { if (hash(i + 9) > 0.45) palm(x, gy + 6, 110 + hash(i) * 60, (hash(i + 2) - 0.5) * 0.6, '#2f8a4a', '#8a5a32', t, i); });
  },
  function crystal(cx, gy, t) {
    X.fillStyle = vgrad(0, gy, ['#0b0626', '#22134f', '#4a2f8f', '#7a58c0']); X.fillRect(0, 0, VW, VH);
    for (let i = 0; i < 110; i++) {
      const w = VW + 400, x = ((hash(i) * w - cx * 0.02) % w + w) % w - 200, y = hash(i + 50) * (gy - 100), a = 0.35 + 0.65 * Math.abs(Math.sin(t * 0.03 + i));
      X.fillStyle = `rgba(255,255,255,${a})`; X.beginPath(); X.arc(x, y, hash(i + 9) * 1.5 + 0.4, 0, TAU); X.fill();
      if (hash(i + 3) > 0.92) twinkle(x, y, 5 * a, a);
    }
    X.save(); X.globalCompositeOperation = 'lighter';
    for (let b = 0; b < 2; b++) {
      X.beginPath();
      for (let sx = -20; sx <= VW + 20; sx += 20) { const y = gy - 380 + b * 60 + Math.sin(sx * 0.006 + t * 0.01 + b) * 40 + Math.sin(sx * 0.013 - t * 0.006) * 20; sx === -20 ? X.moveTo(sx, y) : X.lineTo(sx, y); }
      X.strokeStyle = b ? 'rgba(255,110,200,.12)' : 'rgba(110,255,210,.14)'; X.lineWidth = 50; X.stroke(); X.lineWidth = 18; X.stroke();
    }
    X.restore();
    const mx = VW * 0.78, my = gy - 380;
    glow(mx, my, 170, '255,240,200', 0.35);
    X.beginPath(); X.arc(mx, my, 54, 0, TAU); X.fillStyle = vgrad(my - 54, my + 54, ['#fffbe6', '#f3e6bd']); X.fill();
    for (const [dx, dy, r] of [[-18, -12, 9], [16, 14, 12], [10, -22, 5], [-14, 20, 6]]) { X.fillStyle = 'rgba(200,180,130,.45)'; X.beginPath(); X.arc(mx + dx, my + dy, r, 0, TAU); X.fill(); }
    eachVisible(cx, 0.08, 700, (i, x) => {
      const y = gy - 260 - hash(i) * 80 + Math.sin(t * 0.02 + i) * 6;
      group([Cu(() => { X.moveTo(x - 115, y); X.lineTo(x + 115, y); X.quadraticCurveTo(x + 70, y + 40, x + 30, y + 90); X.quadraticCurveTo(x - 20, y + 60, x - 115, y); X.closePath(); }, '#3a2a6a', [x - 115, y, x + 115, y + 90])], 1.6);
      for (const [dx, h] of [[-55, 70], [-15, 115], [30, 85], [68, 55]]) {
        group([Cu(() => X.roundRect(x + dx - 12, y - h, 24, h, 3), '#4a3a8a', [x + dx - 12, y - h, x + dx + 12, y]), Cu(() => { X.moveTo(x + dx - 16, y - h); X.lineTo(x + dx + 16, y - h); X.lineTo(x + dx, y - h - 32); X.closePath(); }, '#7a5cd6', [x + dx - 16, y - h - 32, x + dx + 16, y - h])], 1.4);
        glow(x + dx, y - h + 22, 14, '255,210,120', 0.6); X.fillStyle = '#ffd98a'; X.beginPath(); X.roundRect(x + dx - 3, y - h + 16, 6, 10, [3, 3, 0, 0]); X.fill();
      }
      for (const dx of [-40, 10, 45]) { X.fillStyle = '#8ff0ff'; X.beginPath(); X.moveTo(x + dx - 5, y + 30); X.lineTo(x + dx, y + 55 + hash(i + dx) * 20); X.lineTo(x + dx + 5, y + 30); X.fill(); }
    });
    haze(gy - 80, 200, '120,90,200', 0.25);
    eachVisible(cx, 0.28, 170, (i, x) => {
      const h = 90 + hash(i + 1) * 130, w = 28 + hash(i + 2) * 30;
      glow(x, gy - 10, w * 2, '140,120,255', 0.25);
      group([Cu(() => { X.moveTo(x - w, gy); X.lineTo(x - w * 0.3, gy - h * 0.8); X.lineTo(x, gy - h); X.lineTo(x + w, gy); X.closePath(); }, '#6c5ce7', [x - w, gy - h, x + w, gy])], 1.4);
      X.fillStyle = 'rgba(200,190,255,.4)'; X.beginPath(); X.moveTo(x, gy - h); X.lineTo(x + w, gy); X.lineTo(x + w * 0.25, gy); X.closePath(); X.fill();
    });
    haze(gy - 20, 80, '90,60,170', 0.3);
    eachVisible(cx, 0.5, 120, (i, x) => { const h = 70 + hash(i + 4) * 70; for (let k = 0; k < 3; k++) group([Cu(() => { X.moveTo(x - 28 + k * 6, gy + 6 - k * h / 3.2); X.lineTo(x, gy - h - k * 6); X.lineTo(x + 28 - k * 6, gy + 6 - k * h / 3.2); X.closePath(); }, '#2a1a5c', [x - 28, gy - h, x + 28, gy])], 1.2); });
  }
];
function ambient(gy, t) {
  X.save(); X.globalCompositeOperation = 'lighter';
  if (levelIdx === 0) {
    for (let i = 0; i < 14; i++) {
      const w = VW + 200, x = ((hash(i) * w * 3 - camX * 0.85 + Math.sin(t * 0.01 + i) * 40 + t * 0.3) % w + w) % w - 100;
      const y = gy - 30 - hash(i + 3) * 300 + Math.sin(t * 0.02 + i * 2) * 16, a = 0.25 + 0.3 * Math.abs(Math.sin(t * 0.04 + i));
      const g = X.createRadialGradient(x, y, 0, x, y, 5); g.addColorStop(0, `rgba(255,250,190,${a})`); g.addColorStop(1, 'rgba(255,250,190,0)');
      X.fillStyle = g; X.fillRect(x - 5, y - 5, 10, 10);
    }
  } else if (levelIdx === 1) {
    for (let i = 0; i < 30; i++) {
      const w = VW + 200, x = ((hash(i) * w * 3 - camX * 0.9 + t * 0.6) % w + w) % w - 100, y = gy - hash(i + 3) * 380 + Math.sin(t * 0.03 + i) * 10;
      X.fillStyle = `rgba(255,225,170,${0.25 + 0.3 * hash(i + 1)})`; X.beginPath(); X.arc(x, y, 1 + hash(i + 2) * 2, 0, TAU); X.fill();
    }
    X.globalCompositeOperation = 'source-over';
    for (let i = 0; i < 5; i++) {
      const w = VW + 300, x = ((hash(i + 40) * w * 4 - camX * 0.6) % w + w) % w - 150, y = gy - ((t * 0.35 + hash(i) * 700) % 700) + 40, sw = Math.sin(t * 0.03 + i) * 6;
      glow(x + sw, y, 30, '255,170,80', 0.5);
      group([Cu(() => X.roundRect(x + sw - 6, y - 8, 12, 15, 4), '#ff9a3c', [x - 6, y - 8, x + 6, y + 7])], 1.2);
    }
  } else {
    for (let i = 0; i < 34; i++) {
      const w = VW + 200, x = ((hash(i) * w * 3 - camX * 0.9) % w + w) % w - 100, q = ((t * 0.003 * (0.5 + hash(i + 5)) + hash(i + 7)) % 1), y = gy + 20 - q * 420;
      twinkle(x + Math.sin(t * 0.02 + i) * 8, y, 2 + hash(i + 2) * 4, Math.sin(q * PI) * 0.9, i % 2 ? '170,240,255' : '255,180,240');
    }
  }
  X.restore();
}

/* =========================================================
   Audio
   ========================================================= */
const A = { ctx: null, master: null, noise: null, muted: store.get('fq-muted') === '1', timer: null, step: 0, nextT: 0, mus: null };
function audio() {
  if (!A.ctx) {
    const C = window.AudioContext || window.webkitAudioContext; if (!C) return null;
    A.ctx = new C(); A.master = A.ctx.createGain(); A.master.gain.value = A.muted ? 0 : 0.55; A.master.connect(A.ctx.destination);
    const b = A.ctx.createBuffer(1, A.ctx.sampleRate * 0.4, A.ctx.sampleRate), d = b.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    A.noise = b;
  }
  if (A.ctx.state === 'suspended') A.ctx.resume();
  return A.ctx;
}
function tone(f, dur, { type = 'sine', vol = 0.2, to = 0, t } = {}) {
  const c = A.ctx; if (!c) return; t = t ?? c.currentTime;
  const o = c.createOscillator(), g = c.createGain();
  o.type = type; o.frequency.setValueAtTime(f, t); if (to) o.frequency.exponentialRampToValueAtTime(to, t + dur);
  g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g).connect(A.master); o.start(t); o.stop(t + dur + 0.02);
}
function noise(dur, { vol = 0.2, freq = 1000, type = 'highpass', t } = {}) {
  const c = A.ctx; if (!c) return; t = t ?? c.currentTime;
  const s = c.createBufferSource(), f = c.createBiquadFilter(), g = c.createGain();
  s.buffer = A.noise; f.type = type; f.frequency.value = freq;
  g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  s.connect(f).connect(g).connect(A.master); s.start(t); s.stop(t + dur);
}
const now = () => A.ctx ? A.ctx.currentTime : 0;
const SFX = {
  jump() { tone(300, 0.16, { type: 'square', vol: 0.05, to: 640 }); },
  jump2() { tone(500, 0.16, { type: 'square', vol: 0.05, to: 1000 }); },
  gem() { tone(1320, 0.09, { vol: 0.1 }); tone(1980, 0.15, { vol: 0.07, t: now() + 0.05 }); },
  stomp() { tone(220, 0.14, { type: 'square', vol: 0.08, to: 90 }); noise(0.08, { vol: 0.12, freq: 900, type: 'lowpass' }); },
  pop() { tone(700, 0.12, { type: 'triangle', vol: 0.1, to: 200 }); noise(0.1, { vol: 0.08, freq: 2000 }); },
  swing() { noise(0.18, { vol: 0.12, freq: 1400, type: 'bandpass' }); },
  fire() { noise(0.3, { vol: 0.16, freq: 600, type: 'lowpass' }); tone(180, 0.25, { type: 'sawtooth', vol: 0.05, to: 90 }); },
  magic() { [0, 4, 7].forEach((n, i) => tone(880 * 2 ** (n / 12), 0.14, { type: 'triangle', vol: 0.06, t: now() + i * 0.04 })); },
  hurt() { noise(0.3, { vol: 0.3, freq: 400, type: 'lowpass' }); tone(200, 0.3, { type: 'sawtooth', vol: 0.08, to: 70 }); },
  heart() { tone(660, 0.1, { vol: 0.1 }); tone(990, 0.2, { vol: 0.1, t: now() + 0.1 }); },
  check() { [0, 4, 7, 12].forEach((n, i) => tone(523 * 2 ** (n / 12), 0.2, { type: 'triangle', vol: 0.08, t: now() + i * 0.07 })); },
  win() { [0, 4, 7, 12, 7, 12, 16].forEach((n, i) => tone(392 * 2 ** (n / 12), 0.28, { type: 'square', vol: 0.05, t: now() + i * 0.11 })); },
  over() { [7, 5, 3, 0].forEach((n, i) => tone(330 * 2 ** (n / 12), 0.35, { type: 'triangle', vol: 0.1, t: now() + i * 0.18 })); }
};
const sfx = k => { if (A.ctx && !A.muted) SFX[k](); };
const MEL = [0, -1, 2, 1, 3, 2, 1, -1, 4, -1, 5, 4, 3, 2, 1, -1, 0, -1, 1, 2, 3, 4, 5, 6, 7, 6, 5, 4, 3, 2, 1, 0];
function musicTick() {
  const c = A.ctx, m = A.mus;
  while (A.nextT < c.currentTime + 0.25) {
    const i = A.step % 32, n = MEL[i], t = A.nextT, s = i % 8;
    if (n >= 0) tone(m.base * 2 ** (m.scale[n] / 12), m.step * 0.9, { type: m.wave, vol: m.wave === 'square' ? 0.025 : 0.045, t });
    if (i % 8 === 0) tone(m.base / 2, m.step * 4, { vol: 0.08, t });
    if (s === 0 || s === 5) tone(115, 0.16, { vol: 0.2, to: 55, t });
    if (s === 2 || s === 6) noise(0.05, { vol: 0.05, freq: 4200, t });
    A.step++; A.nextT += m.step;
  }
}
function startMusic(m) { A.mus = m || A.mus; if (A.muted || !A.mus || !audio()) return; clearInterval(A.timer); A.step = 0; A.nextT = A.ctx.currentTime + 0.05; A.timer = setInterval(musicTick, 60); }
function stopMusic() { clearInterval(A.timer); A.timer = null; }
function setMuted(m) {
  A.muted = m; store.set('fq-muted', m ? '1' : '0');
  if (A.master) A.master.gain.value = m ? 0 : 0.55;
  $('muteIco').setAttribute('d', m ? 'M4 9v6h4l5 4V5L8 9z M17 9l5 6 M22 9l-5 6' : 'M4 9v6h4l5 4V5L8 9z M16 9a4 4 0 0 1 0 6 M19 6a8 8 0 0 1 0 12');
  if (m) stopMusic(); else if (state === 'play') startMusic();
}

/* =========================================================
   World state
   ========================================================= */
let L = null, levelIdx = 0, heroIdx = clamp(+store.get('fq-hero') || 0, 0, HEROES.length - 1);
let unlocked = clamp(+store.get('fq-unlocked') || 0, 0, LEVELS.length - 1);
let state = 'title', frame = 0, camX = 0, camY = 0, shake = 0, freeze = 0, flash = 0;
let p = null, foes = [], gems = [], hearts = [], checks = [], shots = [], parts = [], exit = null, respawn = null;
let gemCount = 0, foesBopped = 0, levelFrames = 0, hp = 3;

function buildLevel(i) {
  const lv = LEVELS[i], grid = Array.from({ length: ROWS }, () => []), ents = [];
  let ox = 0;
  for (const name of lv.chunks) {
    const c = CH[name];
    for (let r = 0; r < ROWS; r++) {
      const s = (c.rows[r] || '').padEnd(c.w, '.').slice(0, c.w);
      for (let k = 0; k < c.w; k++) {
        let ch = s[k];
        if ('PohgbCE'.includes(ch)) { ents.push({ ch, x: (ox + k) * T, y: r * T }); ch = '.'; }
        grid[r].push(ch);
      }
    }
    ox += c.w;
  }
  tileCache = {};
  return { grid, cols: ox, ents, th: lv.th, bg: BG[i], idx: i };
}
const tileAt = (c, r) => (c < 0 || c >= L.cols) ? '#' : (r < 0 || r >= ROWS) ? '.' : L.grid[r][c];
const isSolid = ch => ch === '#' || ch === '=';

function startLevel(i) {
  levelIdx = i; L = buildLevel(i);
  const H = HEROES[heroIdx], foeSpd = LEVELS[i].foe;
  foes = []; gems = []; hearts = []; checks = []; shots = []; parts = []; exit = null;
  let start = { x: 120, y: 480 };
  for (const e of L.ents) {
    if (e.ch === 'P') start = { x: e.x + T / 2, y: e.y + T };
    else if (e.ch === 'o') gems.push({ x: e.x + T / 2, y: e.y + T / 2, got: false });
    else if (e.ch === 'h') hearts.push({ x: e.x + T / 2, y: e.y + T / 2, got: false });
    else if (e.ch === 'g') foes.push({ kind: 'walk', x: e.x + 4, y: e.y + T - 28, w: 40, h: 28, vx: -1.1 * foeSpd, vy: 0, ground: false, ph: hash(e.x) * 6 });
    else if (e.ch === 'b') foes.push({ kind: 'fly', ax: e.x + T / 2, ay: e.y + T / 2, x: e.x, y: e.y, w: 34, h: 24, vx: 0, t: hash(e.x) * 500, spd: foeSpd });
    else if (e.ch === 'C') checks.push({ x: e.x + T / 2, y: e.y + T, on: false });
    else if (e.ch === 'E') exit = { x: e.x + T / 2, y: e.y + T };
  }
  respawn = { ...start };
  hp = H.hearts; gemCount = 0; foesBopped = 0; levelFrames = 0; freeze = 0; flash = 0;
  p = { x: start.x - H.w / 2, y: start.y - H.h, w: H.w, h: H.h, vx: 0, vy: 0, ground: false, face: 1, coyote: 0, buf: 0, jumps: 0, atkF: -1, atkCd: 0, inv: 0, phase: 0, sx: 1, sy: 1, sway: 0, pose: null };
  camX = 0; shake = 0;
  renderHUD();
  $('lvlName').textContent = LEVELS[i].name;
  show(null); setPlaying(true);
  state = 'play';
  banner(`Realm ${i + 1}`, LEVELS[i].name);
  startMusic(LEVELS[i].music);
}

/* =========================================================
   Input
   ========================================================= */
const keys = { left: false, right: false, jump: false, attack: false };
const pressed = { jump: false, attack: false };
const KEYMAP = { ArrowLeft: 'left', a: 'left', A: 'left', ArrowRight: 'right', d: 'right', D: 'right', ArrowUp: 'jump', w: 'jump', W: 'jump', ' ': 'jump', z: 'jump', Z: 'jump', x: 'attack', X: 'attack', j: 'attack', J: 'attack', k: 'attack', K: 'attack', Shift: 'attack' };
function press(k, down) { if (down && !keys[k] && k in pressed) pressed[k] = true; keys[k] = down; }
addEventListener('keydown', e => {
  if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', ' '].includes(e.key)) e.preventDefault();
  if (state === 'play' && (e.key === 'p' || e.key === 'P' || e.key === 'Escape')) return pause();
  if (state === 'paused' && (e.key === 'p' || e.key === 'P' || e.key === 'Escape' || e.key === 'Enter')) return resume();
  if (e.key === 'm' || e.key === 'M') return setMuted(!A.muted);
  if (e.key === 'Enter' && state === 'title') return go('heroes');
  const k = KEYMAP[e.key]; if (k) press(k, true);
});
addEventListener('keyup', e => { const k = KEYMAP[e.key]; if (k) press(k, false); });
document.querySelectorAll('.tb').forEach(b => {
  const k = b.dataset.k;
  const on = e => { e.preventDefault(); audio(); b.setPointerCapture?.(e.pointerId); b.classList.add('on'); press(k, true); };
  const off = e => { e.preventDefault(); b.classList.remove('on'); press(k, false); };
  b.addEventListener('pointerdown', on); b.addEventListener('pointerup', off); b.addEventListener('pointercancel', off); b.addEventListener('lostpointercapture', off);
});
const DEBUG = location.hash === '#debug';
addEventListener('blur', () => { for (const k in keys) keys[k] = false; if (!DEBUG) pause(); });
document.addEventListener('visibilitychange', () => { if (document.hidden && !DEBUG) pause(); });

/* =========================================================
   Physics & game rules
   ========================================================= */
const GRAV = 0.7, MAXFALL = 15;
function moveX(o) {
  o.x += o.vx;
  const r0 = Math.floor(o.y / T), r1 = Math.floor((o.y + o.h - 0.01) / T);
  if (o.vx > 0) {
    const c = Math.floor((o.x + o.w - 0.01) / T);
    for (let r = r0; r <= r1; r++) if (isSolid(tileAt(c, r))) { o.x = c * T - o.w; o.vx = 0; return true; }
  } else if (o.vx < 0) {
    const c = Math.floor(o.x / T);
    for (let r = r0; r <= r1; r++) if (isSolid(tileAt(c, r))) { o.x = (c + 1) * T; o.vx = 0; return true; }
  }
  return false;
}
function moveY(o) {
  const prevBottom = o.y + o.h;
  o.y += o.vy; o.ground = false;
  const c0 = Math.floor(o.x / T), c1 = Math.floor((o.x + o.w - 0.01) / T);
  if (o.vy > 0) {
    const r = Math.floor((o.y + o.h - 0.01) / T);
    for (let c = c0; c <= c1; c++) {
      const ch = tileAt(c, r);
      if (isSolid(ch) || (ch === '-' && prevBottom <= r * T + 0.5)) { o.y = r * T - o.h; o.vy = 0; o.ground = true; return; }
    }
  } else if (o.vy < 0) {
    const r = Math.floor(o.y / T);
    for (let c = c0; c <= c1; c++) if (isSolid(tileAt(c, r))) { o.y = (r + 1) * T; o.vy = 0; return; }
  }
}
const overlap = (a, b) => a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
function groundBelow(x, y) {
  const c = Math.floor(x / T);
  for (let r = Math.max(0, Math.floor(y / T)); r < ROWS; r++) { const ch = tileAt(c, r); if (isSolid(ch) || ch === '-') return r * T; }
  return null;
}

function addPart(o) { parts.push(o); }
function sparks(x, y, rgb, n = 8, sp = 4) { for (let i = 0; i < n; i++) { const a = Math.random() * TAU, s = Math.random() * sp + 1; addPart({ k: 'spark', x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s - 1, life: 26 + Math.random() * 14, max: 40, r: 4 + Math.random() * 4, rgb, g: 0.08 }); } }
function puffs(x, y, n = 6, col = 'rgba(255,245,225,', sp = 1.6) { for (let i = 0; i < n; i++) addPart({ k: 'puff', x: x + (Math.random() - 0.5) * 18, y, vx: (Math.random() - 0.5) * sp * 2, vy: -Math.random() * 1.2, life: 22, max: 22, r: 4 + Math.random() * 4, col, g: -0.02 }); }
function ring(x, y, rgb, r = 26) { addPart({ k: 'ring', x, y, vx: 0, vy: 0, life: 18, max: 18, r, rgb, g: 0 }); }

function hurt(fromX) {
  if (p.inv > 0) return;
  hp--; renderHUD(); sfx('hurt'); shake = 14; p.inv = 100; freeze = 6; flash = 1;
  p.vy = -8; p.vx = (p.x + p.w / 2 < fromX ? -1 : 1) * 5;
  if (touchMode && navigator.vibrate && navigator.userActivation?.hasBeenActive) try { navigator.vibrate(100); } catch (e) {}
  if (hp <= 0) gameOver();
}
function killFoe(f, how) {
  f.dead = true; foesBopped++; freeze = 3;
  const cx = f.x + f.w / 2, cy = f.y + f.h / 2;
  puffs(cx, cy, 8, 'rgba(255,255,255,', 3); sparks(cx, cy, '255,220,120', 8, 4); ring(cx, cy, '255,255,255', 30);
  sfx(how === 'stomp' ? 'stomp' : 'pop');
}

function step() {
  frame++;
  if (state !== 'play') { if (state !== 'paused' && L) camX = (camX + 0.8) % Math.max(1, L.cols * T - VW); return; }
  if (freeze > 0) { freeze--; return; }
  levelFrames++;
  const H = HEROES[heroIdx];
  const dir = (keys.right ? 1 : 0) - (keys.left ? 1 : 0);
  if (dir && dir !== p.face) { p.face = dir; p.sx = 0.82; }
  const target = dir * H.spd;
  p.vx += (target - p.vx) * (p.ground ? 0.28 : 0.14);
  if (Math.abs(p.vx) < 0.05) p.vx = 0;
  if (pressed.jump) p.buf = 7;
  pressed.jump = false;
  p.coyote = p.ground ? 7 : p.coyote - 1;
  if (p.ground) p.jumps = H.dbl ? 1 : 0;
  if (p.buf > 0) {
    if (p.coyote > 0) { p.vy = -H.jump; p.coyote = 0; p.buf = 0; sfx('jump'); puffs(p.x + p.w / 2, p.y + p.h, 5); p.sy = 1.18; p.sx = 0.86; }
    else if (p.jumps > 0) { p.vy = -H.jump * 0.9; p.jumps--; p.buf = 0; sfx('jump2'); ring(p.x + p.w / 2, p.y + p.h, '180,250,255', 22); sparks(p.x + p.w / 2, p.y + p.h, '180,250,255', 6, 2.5); p.sy = 1.15; p.sx = 0.88; }
    else p.buf--;
  }
  if (!keys.jump && p.vy < -3) p.vy += GRAV * 1.3;
  p.vy = Math.min(p.vy + GRAV, MAXFALL);
  if (H.glide && keys.jump && p.vy > 1.6) { p.vy = 1.6; if (frame % 4 === 0) addPart({ k: 'spark', x: p.x + p.w / 2 + (Math.random() - 0.5) * 22, y: p.y + p.h, vx: 0, vy: 0.6, life: 26, max: 26, r: 3.5, rgb: '255,220,140', g: 0 }); }
  const wasAir = !p.ground, fallV = p.vy;
  moveX(p); moveY(p);
  if (p.ground && wasAir) { puffs(p.x + p.w / 2, p.y + p.h, fallV > 8 ? 8 : 4); p.sy = fallV > 8 ? 0.78 : 0.88; p.sx = fallV > 8 ? 1.2 : 1.1; }
  const prevPhase = p.phase;
  p.phase += Math.abs(p.vx) * 0.09;
  if (p.ground && Math.abs(p.vx) > 2 && Math.floor(prevPhase / PI) !== Math.floor(p.phase / PI)) puffs(p.x + p.w / 2 - p.face * 8, p.y + p.h, 2, 'rgba(255,245,225,', 0.8);
  p.sx += (1 - p.sx) * 0.22; p.sy += (1 - p.sy) * 0.22;
  p.sway += (clamp(p.vx * p.face / 5 - p.vy * 0.05, -1.3, 1.3) - p.sway) * 0.12;
  p.inv = Math.max(0, p.inv - 1);
  p.atkCd = Math.max(0, p.atkCd - 1);
  if (pressed.attack && p.atkCd <= 0) {
    p.atkF = 0; p.atkCd = H.atk === 'fire' || H.atk === 'magic' ? 26 : 22;
    if (H.atk === 'fire') { shots.push({ kind: 'fire', x: p.x + p.w / 2 + p.face * 40, y: p.y + 8, vx: p.face * 8.5 + p.vx * 0.5, life: 55, r: 11, t: 0 }); sfx('fire'); }
    else if (H.atk === 'magic') { shots.push({ kind: 'magic', x: p.x + p.w / 2 + p.face * 26, y: p.y - 4, vx: p.face * 10, life: 50, r: 10, t: 0 }); sfx('magic'); }
    else sfx('swing');
  }
  pressed.attack = false;
  if (p.atkF >= 0) { p.atkF++; if (p.atkF > 20) p.atkF = -1; }
  if ((H.atk === 'club' || H.atk === 'sword') && p.atkF >= 5 && p.atkF <= 12) {
    const box = { x: p.face > 0 ? p.x + p.w - 6 : p.x - H.range + 6, y: p.y - 14, w: H.range, h: p.h + 14 };
    for (const f of foes) if (!f.dead && overlap(box, f)) killFoe(f, 'hit');
  }
  {
    const c0 = Math.floor(p.x / T), c1 = Math.floor((p.x + p.w - 0.01) / T), r0 = Math.floor(p.y / T), r1 = Math.floor((p.y + p.h - 0.01) / T);
    for (let c = c0; c <= c1; c++) for (let r = r0; r <= r1; r++)
      if (tileAt(c, r) === '^' && overlap(p, { x: c * T + 8, y: r * T + T * 0.5, w: T - 16, h: T * 0.5 })) { hurt(c * T + T / 2); p.vy = -11; }
  }
  if (p.y > LH + 120) {
    p.inv = 0; hurt(p.x);
    if (hp > 0) { p.x = respawn.x - p.w / 2; p.y = respawn.y - p.h; p.vx = p.vy = 0; p.inv = 90; camX = clamp(p.x - VW * 0.4, 0, L.cols * T - VW); }
    if (state !== 'play') return;
  }
  for (const f of foes) {
    if (f.dead) continue;
    if (f.kind === 'walk') {
      f.ph += 0.13 * LEVELS[levelIdx].foe;
      f.vy = Math.min(f.vy + GRAV, MAXFALL);
      const v = f.vx;
      if (moveX(f)) f.vx = -v;
      moveY(f);
      if (f.ground) {
        const fc = f.vx > 0 ? Math.floor((f.x + f.w + 2) / T) : Math.floor((f.x - 2) / T);
        const br = Math.floor((f.y + f.h + 2) / T), mr = Math.floor((f.y + f.h - 4) / T);
        if (!isSolid(tileAt(fc, br)) || tileAt(fc, mr) === '^') f.vx = -f.vx;
      }
      if (f.y > LH + 200) f.dead = true;
    } else {
      f.t++;
      const nx = f.ax + Math.sin(f.t * 0.02 * f.spd) * 90;
      f.vx = nx - (f.x + f.w / 2); f.x = nx - f.w / 2;
      f.y = f.ay - f.h / 2 + Math.sin(f.t * 0.06) * 22;
    }
    if (overlap(p, f)) {
      if (p.vy > 1 && p.y + p.h - f.y < 20) { killFoe(f, 'stomp'); p.vy = keys.jump ? -13 : -9; p.jumps = H.dbl ? 1 : 0; p.sy = 1.2; p.sx = 0.85; }
      else hurt(f.x + f.w / 2);
    }
  }
  foes = foes.filter(f => !f.dead);
  for (const s of shots) {
    s.x += s.vx; s.life--; s.t++;
    if (s.kind === 'magic') s.y += Math.sin(s.t * 0.4) * 1.5;
    if (frame % 2 === 0) addPart(s.kind === 'fire'
      ? { k: 'ember', x: s.x - s.vx * 0.5, y: s.y + (Math.random() - 0.5) * 8, vx: -s.vx * 0.12, vy: -0.4 - Math.random(), life: 18, max: 18, r: 7 + Math.random() * 4, rgb: '255,150,50', g: -0.03 }
      : { k: 'spark', x: s.x, y: s.y, vx: -s.vx * 0.1, vy: (Math.random() - 0.5), life: 18, max: 18, r: 4, rgb: s.t % 4 ? '170,245,255' : '255,190,240', g: 0 });
    if (isSolid(tileAt(Math.floor(s.x / T), Math.floor(s.y / T)))) s.life = 0;
    for (const f of foes) if (!f.dead && overlap({ x: s.x - s.r, y: s.y - s.r, w: s.r * 2, h: s.r * 2 }, f)) { killFoe(f, 'shot'); s.life = 0; }
    if (s.life <= 0) { sparks(s.x, s.y, s.kind === 'fire' ? '255,170,60' : '170,245,255', 7, 3); ring(s.x, s.y, s.kind === 'fire' ? '255,170,60' : '170,245,255', 18); }
  }
  shots = shots.filter(s => s.life > 0);
  foes = foes.filter(f => !f.dead);
  const pc = { x: p.x - 6, y: p.y - 6, w: p.w + 12, h: p.h + 12 };
  gems.forEach((g, i) => {
    if (!g.got && overlap(pc, { x: g.x - 12, y: g.y - 12, w: 24, h: 24 })) {
      g.got = true; gemCount++; renderHUD(); sfx('gem');
      const c = GEMC[i % 5], n = parseInt(c.slice(1), 16), rgb = `${n >> 16 & 255},${n >> 8 & 255},${n & 255}`;
      sparks(g.x, g.y, rgb, 7, 3); ring(g.x, g.y, rgb, 22);
      $('gems').parentElement.animate([{ transform: 'scale(1.18)' }, { transform: 'scale(1)' }], 200);
    }
  });
  for (const h of hearts) if (!h.got && overlap(pc, { x: h.x - 14, y: h.y - 14, w: 28, h: 28 })) {
    h.got = true; hp = Math.min(H.hearts, hp + 1); renderHUD(); sfx('heart'); sparks(h.x, h.y, '255,90,130', 12, 3.5); ring(h.x, h.y, '255,120,150', 30);
  }
  for (const c of checks) if (!c.on && p.x + p.w / 2 > c.x) {
    c.on = true; respawn = { x: c.x, y: c.y }; sfx('check'); sparks(c.x, c.y - 92, '255,210,120', 16, 4); ring(c.x, c.y - 92, '255,220,150', 40); banner('Checkpoint', 'Saved!');
  }
  if (exit && Math.abs(p.x + p.w / 2 - exit.x) < 26 && p.y + p.h > exit.y - 100) levelComplete();
  const tx = p.x + p.w / 2 - VW * 0.42 + p.face * 50;
  camX += (tx - camX) * 0.1;
  camX = clamp(camX, 0, Math.max(0, L.cols * T - VW));
}
function stepParticles() {
  if (freeze > 0) return;
  for (const q of parts) { q.x += q.vx; q.y += q.vy; q.vy += q.g; q.vx *= 0.97; q.life--; }
  parts = parts.filter(q => q.life > 0);
  if (parts.length > 500) parts.splice(0, parts.length - 500);
}

/* =========================================================
   Rendering
   ========================================================= */
let VW = 960, VH = 576, SC = 1, DPR = 1, touchMode = false, padBottom = 0;
function resize() {
  DPR = Math.min(devicePixelRatio || 1, 2);
  const w = innerWidth, h = innerHeight;
  cv.width = Math.round(w * DPR); cv.height = Math.round(h * DPR);
  cv.style.width = w + 'px'; cv.style.height = h + 'px';
  touchMode = matchMedia('(pointer:coarse)').matches || 'ontouchstart' in window;
  padBottom = touchMode ? 130 : 0;
  SC = Math.min(h / (LH + padBottom), w / 600);
  VW = w / SC; VH = h / SC;
  tileRes = SC * DPR; tileCache = {};
  setPlaying(state === 'play' || state === 'paused');
}
addEventListener('resize', resize);

const solidDraw = (c, r) => { if (c < 0 || c >= L.cols) return true; if (r >= ROWS) return L.grid[ROWS - 1][c] === '#'; if (r < 0) return false; return isSolid(L.grid[r][c]); };
const groundAt = (c, r) => { if (c < 0 || c >= L.cols) return true; if (r >= ROWS) return L.grid[ROWS - 1][c] === '#'; if (r < 0) return false; return L.grid[r][c] === '#'; };
function drawTiles() {
  const th = L.th, lv = L.idx;
  const c0 = Math.max(0, Math.floor(camX / T) - 1), c1 = Math.min(L.cols - 1, Math.floor((camX + VW) / T) + 1);
  const r0 = Math.max(0, Math.floor(camY / T)), r1 = Math.ceil((camY + VH) / T);
  for (let c = c0; c <= c1; c++) for (let r = r0; r <= r1; r++) {
    const ch = r < ROWS ? L.grid[r][c] : (L.grid[ROWS - 1][c] === '#' ? '#' : '.');
    if (ch === '.') continue;
    const x = c * T, y = r * T, v = Math.floor(hash(c * 3.1 + r * 7.7) * 4);
    if (ch === '#') {
      const t = !groundAt(c, r - 1), l = !groundAt(c - 1, r), rr = !groundAt(c + 1, r), b = r < ROWS - 1 && !groundAt(c, r + 1);
      let d = 0; while (d < 3 && groundAt(c, r - d - 1)) d++;
      blit(sprite(`g${t | 0}${l | 0}${rr | 0}${b | 0}${d}${v}`, () => groundTile(th, t, l, rr, b, d, v, lv)), x, y);
    } else if (ch === '=') blit(sprite('s' + v, () => stoneTile(th, v, lv)), x, y);
    else if (ch === '^') blit(sprite('k', () => spikeTile(th)), x, y);
    else if (ch === '-' && (c === c0 || tileAt(c - 1, r) !== '-')) { let n = 1; while (tileAt(c + n, r) === '-') n++; let sx = c; while (sx > 0 && tileAt(sx - 1, r) === '-') sx--; ledge(th, sx, r, sx * T, y, n + (c - sx)); }
  }
}
function drawShadow(x, feetY, w) {
  const gy = groundBelow(x, feetY - 2); if (gy === null) return;
  const s = clamp(1 - (gy - feetY) / 220, 0.25, 1);
  X.fillStyle = `rgba(30,10,50,${0.3 * s})`; X.beginPath(); X.ellipse(x, gy + 1, w * 0.7 * s + 6, 5 * s, 0, 0, TAU); X.fill();
}
function drawParticles() {
  for (const q of parts) {
    const k = q.life / q.max;
    if (q.k === 'spark') twinkle(q.x, q.y, q.r * (0.4 + k * 0.6), k, q.rgb);
    else if (q.k === 'ember') glow(q.x, q.y, q.r * (0.5 + k), q.rgb, 0.8 * k);
    else if (q.k === 'ring') { X.strokeStyle = `rgba(${q.rgb},${k * 0.8})`; X.lineWidth = 3 * k + 0.5; X.beginPath(); X.arc(q.x, q.y, q.r * (1.2 - k * 0.8), 0, TAU); X.stroke(); }
    else { X.fillStyle = q.col + (k * 0.7) + ')'; X.beginPath(); X.arc(q.x, q.y, q.r * (1.6 - k * 0.6), 0, TAU); X.fill(); }
  }
}
function drawShot(s) {
  if (s.kind === 'fire') {
    glow(s.x, s.y, 30, '255,140,40', 0.7);
    X.save(); X.translate(s.x, s.y); X.scale(Math.sign(s.vx) || 1, 1);
    const fl = Math.sin(s.t * 0.8) * 2;
    X.beginPath(); X.moveTo(12, 0); X.quadraticCurveTo(8, -12 - fl, -8, -9); X.quadraticCurveTo(-24, -4 + fl, -28, 0); X.quadraticCurveTo(-24, 4 - fl, -8, 9); X.quadraticCurveTo(8, 12 + fl, 12, 0); X.closePath();
    const g = X.createRadialGradient(4, 0, 1, 0, 0, 22); g.addColorStop(0, '#ffffff'); g.addColorStop(0.3, '#fff0a0'); g.addColorStop(0.65, '#ff9a2a'); g.addColorStop(1, '#e8401a');
    X.fillStyle = g; X.fill(); X.lineWidth = 1.6; X.strokeStyle = 'rgba(160,30,10,.6)'; X.stroke();
    X.restore();
  } else {
    glow(s.x, s.y, 26, '150,240,255', 0.7);
    X.save(); X.translate(s.x, s.y); X.rotate(s.t * 0.25);
    X.beginPath(); starPath(0, 0, 10, 0.45); X.fillStyle = vgrad(-10, 10, ['#ffffff', '#bff8ff', '#7ad7ff']); X.fill(); X.lineWidth = 1.6; X.strokeStyle = OL; X.stroke();
    X.restore();
  }
}
function render() {
  X = X0;
  X.setTransform(SC * DPR, 0, 0, SC * DPR, 0, 0);
  if (!L) { X.fillStyle = '#1a0f3d'; X.fillRect(0, 0, VW, VH); return; }
  camY = LH + padBottom - VH;
  const gy = 10 * T - camY;
  const sx = shake > 0 ? (Math.random() - 0.5) * shake : 0, sy = shake > 0 ? (Math.random() - 0.5) * shake : 0;
  shake = Math.max(0, shake - 1);
  L.bg(camX, gy, frame);
  ambient(gy, frame);
  X.save(); X.translate(-Math.round(camX) + sx, -camY + sy);
  drawTiles();
  for (const c of checks) drawLantern(c);
  if (exit) drawPortal(exit);
  gems.forEach((g, i) => { if (!g.got) drawGem(g.x, g.y, i); });
  for (const h of hearts) if (!h.got) drawHeart(h);
  const inGame = state !== 'title' && state !== 'heroes' && state !== 'levels';
  if (inGame) {
    for (const f of foes) f.kind === 'walk' ? drawSlime(f, frame) : drawBat(f, frame);
    for (const s of shots) drawShot(s);
    if (p) {
      const H = HEROES[heroIdx];
      drawShadow(p.x + p.w / 2, p.y + p.h, p.w);
      if (p.inv === 0 || Math.floor(p.inv / 5) % 2 === 0 || state !== 'play') {
        const a = { phase: p.phase, spd: clamp(Math.abs(p.vx) / H.spd, 0, 1), air: !p.ground, vy: p.vy, atk: p.atkF >= 0 ? p.atkF / 20 : -1, t: frame, hurt: p.inv > 82 || state === 'over', sx: p.sx, sy: p.sy, sway: p.sway };
        const target = rawPose(a, H);
        p.pose = blendPose(p.pose, target, a.atk >= 0 ? 0.7 : 0.4);
        X.save(); X.translate(p.x + p.w / 2, p.y + p.h); X.scale(p.face, 1); FLIP = p.face < 0;
        drawHero(H.id, a, p.pose);
        FLIP = false; X.restore();
      }
    }
  }
  drawParticles();
  X.restore();
  const vg = X.createRadialGradient(VW / 2, VH / 2, Math.min(VW, VH) * 0.45, VW / 2, VH / 2, Math.max(VW, VH) * 0.75);
  vg.addColorStop(0, 'rgba(20,8,40,0)'); vg.addColorStop(1, 'rgba(20,8,40,.38)');
  X.fillStyle = vg; X.fillRect(0, 0, VW, VH);
  if (flash > 0) { X.fillStyle = `rgba(255,80,110,${flash * 0.35})`; X.fillRect(0, 0, VW, VH); flash = Math.max(0, flash - 0.08); }
}

/* =========================================================
   UI / screens
   ========================================================= */
const SCREENS = ['title', 'heroes', 'levels', 'pause', 'complete', 'over', 'win'];
function show(name) { for (const s of SCREENS) $('s-' + s).classList.toggle('hidden', s !== name); }
function setPlaying(on) {
  document.querySelectorAll('.ingame').forEach(e => e.classList.toggle('hidden', !on));
  $('lvlName').classList.toggle('hidden', !on);
  $('touch').classList.toggle('hidden', !(on && touchMode));
}
function go(name) {
  audio();
  if (name === 'heroes') renderHeroes();
  if (name === 'levels') renderLevels();
  if (state === 'play' || state === 'paused') stopMusic();
  state = name; show(name); setPlaying(false);
  if (!L) L = buildLevel(0);
}
function renderHUD() {
  const max = HEROES[heroIdx].hearts;
  $('hearts').innerHTML = Array.from({ length: max }, (_, i) => `<span class="${i < hp ? '' : 'off'}">&#9829;</span>`).join('');
  $('gems').textContent = gemCount;
}
function banner(small, big) {
  $('banSmall').textContent = small; $('banBig').textContent = big;
  const b = $('banner'); b.classList.remove('show'); void b.offsetWidth; b.classList.add('show');
}
function pause() { if (state !== 'play') return; state = 'paused'; show('pause'); stopMusic(); for (const k in keys) keys[k] = false; }
function resume() { if (state !== 'paused') return; state = 'play'; show(null); startMusic(); }
function gameOver() {
  state = 'over'; stopMusic(); sfx('over'); setPlaying(false);
  $('overMsg').textContent = `${HEROES[heroIdx].name} collected ${gemCount} gems in ${LEVELS[levelIdx].name}. One more go?`;
  setTimeout(() => { if (state === 'over') show('over'); }, 900);
}
function levelComplete() {
  state = 'complete'; stopMusic(); sfx('win'); setPlaying(false);
  sparks(exit.x, exit.y - 70, '255,220,140', 30, 6); ring(exit.x, exit.y - 70, '200,240,255', 80);
  const total = gems.length;
  const bestKey = 'fq-best-' + levelIdx, prev = +store.get(bestKey) || 0;
  if (gemCount > prev) store.set(bestKey, gemCount);
  if (levelIdx + 1 > unlocked && levelIdx + 1 < LEVELS.length) { unlocked = levelIdx + 1; store.set('fq-unlocked', unlocked); }
  const secs = Math.round(levelFrames / 60);
  $('cGems').textContent = `${gemCount}/${total}`;
  $('cFoes').textContent = foesBopped;
  $('cTime').textContent = `${Math.floor(secs / 60)}:${String(secs % 60).padStart(2, '0')}`;
  $('cTitle').textContent = gemCount === total ? 'Every gem found!' : 'Realm cleared!';
  const last = levelIdx === LEVELS.length - 1;
  setTimeout(() => {
    if (state !== 'complete') return;
    if (last) { $('winMsg').textContent = `${HEROES[heroIdx].name} conquered all three realms of Fantasia. Try another hero, or go back for every gem.`; show('win'); }
    else show('complete');
  }, 900);
}

let previews = [];
function renderHeroes() {
  const list = $('heroList'); list.innerHTML = '';
  previews = [];
  HEROES.forEach((h, i) => {
    const b = document.createElement('button');
    b.className = 'hero' + (i === heroIdx ? ' sel' : '');
    b.innerHTML = `${h.badge ? `<span class="badge">${h.badge}</span>` : ''}<canvas></canvas><h3>${h.name}</h3><div class="tt">${h.title}</div><p>${h.desc}</p>` +
      ['Speed', 'Jump', 'Power'].map((s, k) => `<div class="stat"><span>${s}</span><i>${[0, 1, 2, 3, 4].map(n => `<b class="${n < h.stats[k] ? 'on' : ''}"></b>`).join('')}</i></div>`).join('') +
      `<div class="stat"><span>Hearts</span><i style="color:#ff4d6d;font-size:13px;letter-spacing:2px">${'&#9829;'.repeat(h.hearts)}</i></div>`;
    b.onclick = () => { heroIdx = i; store.set('fq-hero', i); list.querySelectorAll('.hero').forEach((e, k) => e.classList.toggle('sel', k === i)); audio(); sfx('gem'); };
    b.ondblclick = () => go('levels');
    list.appendChild(b);
    previews.push({ cv: b.querySelector('canvas'), i, pose: null });
  });
}
function drawPreviews() {
  if (state !== 'heroes') return;
  for (const pv of previews) {
    const c = pv.cv, w = c.clientWidth, h = c.clientHeight; if (!w) continue;
    const d = Math.min(devicePixelRatio || 1, 2);
    if (c.width !== Math.round(w * d)) { c.width = Math.round(w * d); c.height = Math.round(h * d); }
    const ctx = c.getContext('2d'); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clearRect(0, 0, c.width, c.height);
    X = ctx;
    ctx.setTransform(d, 0, 0, d, 0, 0);
    ctx.fillStyle = 'rgba(20,8,40,.3)'; ctx.beginPath(); ctx.ellipse(w / 2, h * 0.86 + 1, 30, 5, 0, 0, TAU); ctx.fill();
    const sel = pv.i === heroIdx, H = HEROES[pv.i];
    const cyc = frame % 150;
    const a = { phase: frame * 0.28, spd: sel ? 1 : 0, air: false, vy: 0, atk: sel && cyc < 20 ? cyc / 20 : -1, t: frame + pv.i * 40, hurt: false, sx: 1, sy: 1, sway: sel ? 0.8 : 0 };
    pv.pose = blendPose(pv.pose, rawPose(a, H), a.atk >= 0 ? 0.7 : 0.4);
    ctx.setTransform(d * 1.18, 0, 0, d * 1.18, w * d / 2 - (H.id === 'rex' ? 4 * d : 0), h * d * 0.86);
    drawHero(H.id, a, pv.pose);
    X = X0;
  }
}
function renderLevels() {
  const list = $('lvlList'); list.innerHTML = '';
  LEVELS.forEach((lv, i) => {
    const b = document.createElement('button');
    const locked = i > unlocked, best = +store.get('fq-best-' + i) || 0;
    b.className = 'lvl l' + i; b.disabled = locked;
    b.innerHTML = `${locked ? '<span class="lock">Locked</span>' : best ? `<span class="lock">Best: ${best} gems</span>` : ''}<span class="n">Realm ${i + 1}</span><h3>${lv.name}</h3><p>${locked ? 'Clear the previous realm to unlock' : lv.sub}</p>`;
    b.onclick = () => startLevel(i);
    list.appendChild(b);
  });
}

$('startBtn').onclick = () => go('heroes');
$('toLevels').onclick = () => go('levels');
$('resumeBtn').onclick = resume;
$('pauseBtn').onclick = () => state === 'paused' ? resume() : pause();
$('retryBtn').onclick = () => startLevel(levelIdx);
$('nextBtn').onclick = () => startLevel(Math.min(levelIdx + 1, LEVELS.length - 1));
$('muteBtn').onclick = () => { audio(); setMuted(!A.muted); };
document.querySelectorAll('[data-go]').forEach(e => e.addEventListener('click', () => go(e.dataset.go)));

/* =========================================================
   Main loop (fixed 60 Hz simulation)
   ========================================================= */
let last = performance.now(), acc = 0;
function loop(t) {
  requestAnimationFrame(loop);
  acc += Math.min(100, t - last); last = t;
  while (acc >= 1000 / 60) {
    if (state !== 'paused') { step(); stepParticles(); }
    else frame++;
    pressed.jump = pressed.attack = false;
    acc -= 1000 / 60;
  }
  render(); drawPreviews();
}
if (DEBUG) window.__fq = { get p() { return p; }, get L() { return L; }, get state() { return state; }, get foes() { return foes; }, get exit() { return exit; }, start: startLevel, setHero(i) { heroIdx = i; }, bench(n) { const t0 = performance.now(); for (let i = 0; i < n; i++) { step(); render(); } return (performance.now() - t0) / n; },
  art(ctx, id, x, y, sc, a) { X = ctx; ctx.save(); ctx.translate(x, y); ctx.scale(sc, sc); const H = HEROES.find(h => h.id === id); drawHero(id, a, rawPose(a, H)); ctx.restore(); X = X0; },
  props(ctx, x, y, sc) { X = ctx; ctx.save(); ctx.translate(x, y); ctx.scale(sc, sc);
    drawSlime({ x: 0, y: 0, w: 40, h: 28, vx: 1, ph: 0.4 }, 50); drawBat({ x: 70, y: -10, w: 34, h: 24, ax: 0 }, 8);
    drawGem(160, 0, 0); drawGem(200, 0, 1); drawHeart({ x: 250, y: 0 }); drawLantern({ x: 320, y: 30, on: true }); drawPortal({ x: 430, y: 30 });
    ctx.restore(); X = X0; } };
L = buildLevel(0);
setMuted(A.muted); resize(); show('title');
requestAnimationFrame(loop);
})();
