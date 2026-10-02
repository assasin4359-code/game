/* ---------- drawing primitives ---------- */
function poly(pts) { ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]); ctx.stroke(); }
function disc(x, y, r) { ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill(); }

function chain(g, x0, y0, x1, y1, color) {
  const dx = x1 - x0, dy = y1 - y0, L = Math.hypot(dx, dy), ux = dx / L, uy = dy / L, a = Math.atan2(uy, ux);
  g.strokeStyle = color; g.lineWidth = 1;
  for (let s = 0, k = 0; s < L; s += 5, k++) {
    const x = x0 + ux * s, y = y0 + uy * s;
    g.beginPath();
    if (k % 2 === 0) g.ellipse(x, y, 3, 1.8, a, 0, TAU);
    else { g.moveTo(x - ux * 3, y - uy * 3); g.lineTo(x + ux * 3, y + uy * 3); }
    g.stroke();
  }
}
/* '#842a76' sits exactly between red and blue, so it dithers into the red/blue checker of the reference */
const VIOLET = '#842a76';
function thickChain(g, x0, y0, x1, y1, color, s = 1) {
  const dx = x1 - x0, dy = y1 - y0, L = Math.hypot(dx, dy), ux = dx / L, uy = dy / L, a = Math.atan2(uy, ux);
  g.strokeStyle = color; g.lineWidth = 1.6 * s;
  for (let d = 0, k = 0; d < L; d += 7 * s, k++) {
    const x = x0 + ux * d, y = y0 + uy * d;
    g.beginPath();
    if (k % 2 === 0) g.ellipse(x, y, 4.2 * s, 2.4 * s, a, 0, TAU);
    else { g.moveTo(x - ux * 3.5 * s, y - uy * 3.5 * s); g.lineTo(x + ux * 3.5 * s, y + uy * 3.5 * s); }
    g.stroke();
  }
}
function taperG(g, pts, w0, w1) { for (let i = 1; i < pts.length; i++) { g.lineWidth = lerp(w0, w1, i / (pts.length - 1)); g.beginPath(); g.moveTo(pts[i - 1][0], pts[i - 1][1]); g.lineTo(pts[i][0], pts[i][1]); g.stroke(); } }
function curve(x, y, ang, len, bend, n = 16) { const pts = [[x, y]]; for (let i = 0; i < n; i++) { x += Math.cos(ang) * len / n; y += Math.sin(ang) * len / n; ang += bend; pts.push([x, y]); } return pts; }
function inkBlob(g, x, y, r, rng) {
  const n = 16, rot = rng() * TAU;
  g.fillStyle = C.K; g.beginPath();
  for (let i = 0; i < n; i++) {
    const a = rot + i / n * TAU, rr = i % 4 === 0 ? r * (1.5 + rng() * 0.4) : r * (0.62 + rng() * 0.22);
    const px = x + Math.cos(a) * rr, py = y + Math.sin(a) * rr * 0.8;
    i ? g.lineTo(px, py) : g.moveTo(px, py);
  }
  g.closePath(); g.fill();
  g.fillStyle = C.W;
  for (let i = 0; i < Math.max(2, r / 5 | 0); i++) {
    const a = rng() * TAU, d = rng() * r * 0.5, sx = Math.round(x + Math.cos(a) * d), sy = Math.round(y + Math.sin(a) * d * 0.8);
    if (rng() < 0.4) { g.fillRect(sx - 1, sy, 3, 1); g.fillRect(sx, sy - 1, 1, 3); } else g.fillRect(sx, sy, 1, 1);
  }
}
function crescent(g, x, y, r, rng) {
  const s = Math.ceil(r * 2 + 4), t = mk(s, s), tg = t.getContext('2d'), c = r + 2, a = rng() * TAU;
  tg.fillStyle = '#9a9a9a'; tg.beginPath(); tg.arc(c, c, r, 0, TAU); tg.fill();
  tg.globalCompositeOperation = 'destination-out';
  tg.beginPath(); tg.arc(c + Math.cos(a) * r * 0.45, c + Math.sin(a) * r * 0.45, r * 0.85, 0, TAU); tg.fill();
  g.drawImage(t, Math.round(x - c), Math.round(y - c));
}
function cloud(g, cx, cy, rng, scale) {
  const cs = [], n = 4 + (rng() * 4 | 0);
  for (let i = 0; i < n; i++) cs.push([cx + (rng() - 0.5) * 70 * scale, cy + (rng() - 0.5) * 20 * scale - Math.abs(i - n / 2) * 2, (14 + rng() * 22) * scale]);
  g.fillStyle = '#767676'; for (const [x, y, r] of cs) { g.beginPath(); g.arc(x, y, r + 1, 0, TAU); g.fill(); }
  g.fillStyle = C.W; for (const [x, y, r] of cs) { g.beginPath(); g.arc(x, y, r, 0, TAU); g.fill(); }
  for (const [x, y, r] of cs) {
    if (rng() < 0.55) crescent(g, x + (rng() - 0.5) * r * 0.6, y + (rng() - 0.5) * r * 0.6, r * (0.35 + rng() * 0.25), rng);
    else { g.fillStyle = '#d2d2d2'; g.beginPath(); g.arc(x + (rng() - 0.5) * r * 0.5, y + (rng() - 0.5) * r * 0.5, r * 0.35, 0, TAU); g.fill(); }
  }
}
function crossShape(g, x, y, s, tilt, col, w, len) {
  g.save(); g.translate(x, y); g.rotate(tilt); g.fillStyle = col;
  g.fillRect(-w / 2, 0, w, len || s * 2.2); g.fillRect(-s * 0.7, s * 0.5, s * 1.4, w);
  g.restore();
}
function tombstone(g, x, base, w, h) {
  g.fillStyle = C.K; g.beginPath();
  g.moveTo(x - w / 2, base); g.lineTo(x - w / 2, base - h + w / 2); g.arc(x, base - h + w / 2, w / 2, Math.PI, 0); g.lineTo(x + w / 2, base); g.fill();
}
function paintSky(g, rng) {
  g.fillStyle = C.W; g.fillRect(0, 0, W, H);
  for (let x = -20; x < W + 40; x += 70 + rng() * 20) cloud(g, x, 62 + rng() * 18, rng, 0.9);
  for (let x = -30; x < W + 40; x += 64 + rng() * 24) cloud(g, x, 128 + rng() * 22, rng, 1);
  for (const c of [[84,0,6,190],[172,0,124,196],[262,0,300,196],[356,0,448,180],[440,0,480,70],[20,0,-10,80]]) chain(g, c[0], c[1], c[2], c[3], '#3c3c3c');
  for (const [x, y, r] of [[62,2,30],[236,12,19],[418,8,36],[150,58,10],[334,78,14],[458,118,15],[24,104,9],[290,40,7]]) inkBlob(g, x, y, r, rng);
}
function paintGraveyard(g, rng) {
  g.fillStyle = '#a0a0a0'; g.beginPath(); g.moveTo(0, 210);
  for (let x = 0; x <= W; x += 4) g.lineTo(x, 192 + Math.sin(x * 0.045) * 3 + Math.sin(x * 0.12 + 1.3) * 2 + rng() * 1.5);
  g.lineTo(W, 210); g.closePath(); g.fill();
  for (let i = 0; i < 9; i++) crossShape(g, 20 + i * 52 + rng() * 20, 186 - rng() * 4, 4 + rng() * 3, rng() * 0.4 - 0.2, '#a0a0a0', 2);
  g.fillStyle = '#d6d6d6'; g.fillRect(0, 210, W, 2);
  g.fillStyle = '#5a5a5a'; for (let x = 4; x < W; x += 7) g.fillRect(x, 214, 1, 2);
  g.fillStyle = C.K; g.fillRect(0, FLOOR, W, H - FLOOR);
  for (let x = 0; x < W; x += 2 + rng() * 5) { const h = Math.round(1 + rng() * 3); g.fillRect(Math.round(x), FLOOR - h, 1, h); }
  g.fillStyle = C.W; for (let i = 0; i < 60; i++) g.fillRect(Math.round(rng() * W), Math.round(FLOOR + 6 + rng() * (H - FLOOR - 8)), 1, 1);
  crossShape(g, 22, 198, 14, -0.22, C.K, 4, 46);
  tombstone(g, 50, FLOOR + 1, 12, 17);
  crossShape(g, 455, 192, 16, 0.28, C.K, 4, 52);
  tombstone(g, 426, FLOOR + 1, 10, 13);
  g.fillStyle = C.K; for (const fx of [78, 86, 392, 401, 408]) g.fillRect(fx, FLOOR - 9 - (fx % 5), 2, 12);
}
function bz(p, t) { const u = 1 - t; return [u*u*u*p[0][0] + 3*u*u*t*p[1][0] + 3*u*t*t*p[2][0] + t*t*t*p[3][0], u*u*u*p[0][1] + 3*u*u*t*p[1][1] + 3*u*t*t*p[2][1] + t*t*t*p[3][1]]; }
function trunk(g, pts, w0, w1) {
  for (const [col, k, off] of [[C.K, 1.08, 0], [C.G1, 1, 0], [C.G2, 0.28, -0.3], ['#6cc58d', 0.1, -0.38]]) {
    g.fillStyle = col;
    for (let t = 0; t <= 1; t += 0.004) { const [x, y] = bz(pts, t), w = lerp(w0, w1, t); g.beginPath(); g.arc(x + off * w, y, w / 2 * k, 0, TAU); g.fill(); }
  }
  g.strokeStyle = 'rgba(0,0,0,0.55)'; g.lineWidth = 1;
  for (let s = -2; s <= 2; s++) { g.beginPath(); for (let t = 0; t <= 1; t += 0.02) { const [x, y] = bz(pts, t), w = lerp(w0, w1, t); const px = x + s * w * 0.14 + Math.sin(t * 30 + s) * 1.5; t ? g.lineTo(px, y) : g.moveTo(px, y); } g.stroke(); }
}
function branch(g, x0, y0, x1, y1, w) {
  const pts = [[x0, y0], [lerp(x0, x1, 0.35), y0 - 18], [lerp(x0, x1, 0.7), y1 + 14], [x1, y1]];
  for (const [col, k, dy] of [[C.K, 1.15, 0], [C.G1, 1, 0], [C.G2, 0.35, -0.25]]) {
    g.fillStyle = col;
    for (let t = 0; t <= 1; t += 0.006) { const [x, y] = bz(pts, t), ww = lerp(w, w * 0.25, t); g.beginPath(); g.arc(x, y + dy * ww, ww / 2 * k, 0, TAU); g.fill(); }
  }
}
function leafCluster(g, x, y, r, rng) {
  g.fillStyle = '#063818'; g.beginPath(); g.arc(x, y, r + 1.5, 0, TAU); g.fill();
  g.fillStyle = C.G1; g.beginPath(); g.arc(x, y, r, 0, TAU); g.fill();
  g.fillStyle = C.G2; g.beginPath(); g.arc(x - r * 0.25, y - r * 0.3, r * 0.6, 0, TAU); g.fill();
  g.fillStyle = C.G3; for (let i = 0; i < r; i++) g.fillRect(Math.round(x + (rng() - 0.6) * r), Math.round(y + (rng() - 0.7) * r), 1, 1);
}
function vineLine(g, x0, y0, x1, y1, rng) {
  g.strokeStyle = C.G1; g.lineWidth = 2; g.beginPath(); g.moveTo(x0, y0);
  const cx = (x0 + x1) / 2 + (rng() - 0.5) * 30; g.quadraticCurveTo(cx, (y0 + y1) / 2, x1, y1); g.stroke();
  g.fillStyle = C.G2;
  for (let t = 0.15; t < 1; t += 0.14) { const x = lerp(lerp(x0, cx, t), lerp(cx, x1, t), t), y = lerp(y0, y1, t); g.beginPath(); g.ellipse(x + (t * 10 % 2 ? 3 : -3), y, 3, 1.6, 0.5, 0, TAU); g.fill(); }
}
function paintForest(g, rng) {
  g.fillStyle = '#cdeed8'; g.beginPath(); g.moveTo(0, 214);
  for (let x = 0; x <= W; x += 6) g.lineTo(x, 168 + Math.sin(x * 0.07) * 8 + Math.sin(x * 0.19) * 5 + rng() * 4);
  g.lineTo(W, 214); g.closePath(); g.fill();
  g.fillStyle = C.G3; g.fillRect(0, 202, W, 12);
  g.fillStyle = '#7fcf9c'; for (let x = 0; x < W; x += 3) g.fillRect(x, 200 + Math.round(rng() * 3), 2, 2);
  trunk(g, [[468, FLOOR + 6], [436, 170], [456, 90], [428, -12]], 66, 42);
  trunk(g, [[8, FLOOR + 6], [30, 160], [6, 70], [22, -12]], 40, 28);
  branch(g, 440, 58, 250, 30, 16);
  branch(g, 22, 96, 124, 84, 11);
  for (let i = 0; i < 16; i++) leafCluster(g, 240 + rng() * 240, rng() * 52, 9 + rng() * 14, rng);
  for (let i = 0; i < 8; i++) leafCluster(g, rng() * 140, 44 + rng() * 60, 7 + rng() * 10, rng);
  for (const vx of [150, 205, 262, 330, 385]) vineLine(g, vx, 0, vx + rng() * 20 - 10, 96 + rng() * 50, rng);
  g.fillStyle = C.G1; g.beginPath(); g.moveTo(0, H); g.lineTo(0, FLOOR);
  for (let x = 0; x <= W; x += 4) g.lineTo(x, FLOOR - 1 + Math.sin(x * 0.08) * 1.2);
  g.lineTo(W, H); g.closePath(); g.fill();
  g.fillStyle = C.G2; g.fillRect(0, FLOOR, W, 2);
  for (let x = 0; x < W; x += 3 + rng() * 4) { const h = 2 + rng() * 4; g.beginPath(); g.moveTo(x - 1.5, FLOOR + 1); g.lineTo(x + rng() * 2 - 1, FLOOR - h); g.lineTo(x + 1.5, FLOOR + 1); g.fill(); }
  g.fillStyle = C.G3; for (let i = 0; i < 50; i++) g.fillRect(Math.round(rng() * W), Math.round(FLOOR + 6 + rng() * (H - FLOOR - 8)), 1, 1);
}
const bg1 = mk(), bg2 = mk();
{
  const g1 = bg1.getContext('2d'), g2 = bg2.getContext('2d');
  paintSky(g1, seeded(7)); paintGraveyard(g1, seeded(11));
  paintSky(g2, seeded(7)); paintForest(g2, seeded(23));
}

