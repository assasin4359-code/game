/* ---------- stick figures ----------
   Limb angles: 0 = straight down, positive = toward facing direction, PI = straight up.
   yaw (optional) swings the sword around the body for horizontal cuts; the blade is
   foreshortened as it passes toward/away from the camera. rot spins the whole body around
   height piv (0 = feet, -16 = hip). */
function makePose(o) { return Object.assign({hx: 0, hy: -16, lean: 0, ht: 0, l1: -0.2, l2: 0, r1: 0.2, r2: -0.05, bu: -0.3, bf: -0.2, fu: 0.5, ff: 0.5, sa: 1.05, rot: 0, piv: 0, yaw: null}, o); }
function lerpPose(a, b, t) { const o = {}; for (const k in a) o[k] = typeof a[k] === 'number' && typeof b[k] === 'number' ? lerp(a[k], b[k], t) : (t < 0.5 ? a[k] : b[k]); return o; }
function solve(q) {
  const s = Math.sin, c = Math.cos, hip = [q.hx, q.hy];
  const neck = [hip[0] + s(q.lean) * 12, hip[1] - c(q.lean) * 12];
  const head = [neck[0] + s(q.lean + q.ht) * 5, neck[1] - c(q.lean + q.ht) * 5];
  const sh = [neck[0] * 0.85 + hip[0] * 0.15, neck[1] * 0.85 + hip[1] * 0.15];
  const kneeB = [hip[0] + s(q.l1) * 8, hip[1] + c(q.l1) * 8], footB = [kneeB[0] + s(q.l1 + q.l2) * 8, kneeB[1] + c(q.l1 + q.l2) * 8];
  const kneeF = [hip[0] + s(q.r1) * 8, hip[1] + c(q.r1) * 8], footF = [kneeF[0] + s(q.r1 + q.r2) * 8, kneeF[1] + c(q.r1 + q.r2) * 8];
  const elbB = [sh[0] + s(q.bu) * 7, sh[1] + c(q.bu) * 7], handB = [elbB[0] + s(q.bu + q.bf) * 7, elbB[1] + c(q.bu + q.bf) * 7];
  const elbF = [sh[0] + s(q.fu) * 7, sh[1] + c(q.fu) * 7], handF = [elbF[0] + s(q.fu + q.ff) * 7, elbF[1] + c(q.fu + q.ff) * 7];
  return { hip, neck, head, sh, kneeB, footB, kneeF, footF, elbB, handB, elbF, handF };
}
const worldToLimb = (theta, face) => Math.atan2(Math.cos(theta) * face, Math.sin(theta));
function figXform(x, y, face, q, sc) {
  const rot = q.rot || 0, cr = Math.cos(rot), sr = Math.sin(rot), pv = q.piv || 0;
  return {
    T: v => { const lx = v[0], ly = v[1] - pv; return [x + (lx * cr - ly * sr) * face * sc, y + (lx * sr + ly * cr + pv) * sc]; },
    D: (vx, vy) => [(vx * cr - vy * sr) * face, vx * sr + vy * cr],
  };
}
function swordGeom(x, y, face, q, len, sc = 1) {
  const J = solve(q), X = figXform(x, y, face, q, sc), h = X.T(J.handF);
  let lx, ly, k = 1;
  if (q.yaw != null) { lx = Math.sin(q.yaw); ly = 0.24 * Math.cos(q.yaw) + 0.08; k = Math.hypot(lx, ly); lx /= k; ly /= k; }
  else { lx = Math.sin(q.sa); ly = Math.cos(q.sa); }
  return {h, d: X.D(lx, ly), L: len * k * sc, k};
}
/* world-space [base, tip] of the held sword, used for smear trails */
function swordLine(x, y, face, q, len) {
  const g = swordGeom(x, y, face, q, len);
  return [[g.h[0] + g.d[0] * 5, g.h[1] + g.d[1] * 5], [g.h[0] + g.d[0] * (g.L + 3), g.h[1] + g.d[1] * (g.L + 3)]];
}

/* simple straight blade: summoned blades, icons, loot */
function drawBlade(hx, hy, dx, dy, len, w, color, edge, sc = 1) {
  const nx = -dy, ny = dx;
  ctx.fillStyle = color; ctx.beginPath();
  ctx.moveTo(hx + nx * w * 0.45, hy + ny * w * 0.45);
  ctx.lineTo(hx + dx * len * 0.8 + nx * w * 0.6, hy + dy * len * 0.8 + ny * w * 0.6);
  ctx.lineTo(hx + dx * len, hy + dy * len);
  ctx.lineTo(hx + dx * len * 0.86 - nx * w * 0.45, hy + dy * len * 0.86 - ny * w * 0.45);
  ctx.lineTo(hx - nx * w * 0.45, hy - ny * w * 0.45);
  ctx.closePath(); ctx.fill();
  ctx.lineCap = 'round'; ctx.strokeStyle = color; ctx.lineWidth = 2 * sc;
  poly([[hx + nx * w, hy + ny * w], [hx - nx * w, hy - ny * w]]);
  poly([[hx, hy], [hx - dx * 5 * sc, hy - dy * 5 * sc]]);
  if (edge) { ctx.strokeStyle = edge; ctx.lineWidth = Math.max(1, sc * 0.9); poly([[hx + dx * 3 * sc + nx * w * 0.1, hy + dy * 3 * sc + ny * w * 0.1], [hx + dx * len * 0.78 + nx * w * 0.15, hy + dy * len * 0.78 + ny * w * 0.15]]); }
}
/* the Blade Summoner's greatsword: broad straight blade with a chisel tip and a bright edge line,
   a ring guard around the upper hand, a two-hand grip and a curled pommel */
function drawGreatsword(hx, hy, dx, dy, L, face, sc, color, edge) {
  const nx = dy * face, ny = -dx * face, w = 3.7 * sc, b0 = 3.2 * sc;
  const P = (u, off) => [hx + dx * (b0 + u) + nx * off, hy + dy * (b0 + u) + ny * off];
  const cut = Math.min(L * 0.3, w * 1.7);
  ctx.fillStyle = color; ctx.beginPath();
  const q = [P(0, w), P(L - cut, w), P(L, -w * 0.8), P(L - 1.5 * sc, -w), P(0, -w)];
  ctx.moveTo(q[0][0], q[0][1]); for (const p of q) ctx.lineTo(p[0], p[1]); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = color; ctx.lineCap = 'round';
  ctx.lineWidth = 2.4 * sc; poly([[hx + dx * 2.6 * sc + nx * (w + 1.6 * sc), hy + dy * 2.6 * sc + ny * (w + 1.6 * sc)], [hx + dx * 2.6 * sc - nx * (w + 1.6 * sc), hy + dy * 2.6 * sc - ny * (w + 1.6 * sc)]]);
  ctx.lineWidth = 2.1 * sc; poly([[hx + dx * sc, hy + dy * sc], [hx - dx * 8 * sc, hy - dy * 8 * sc]]);
  ctx.lineWidth = 1.7 * sc; ctx.beginPath(); ctx.arc(hx, hy, 3.6 * sc, 0, TAU); ctx.stroke();
  const pc = [hx - dx * 9.5 * sc, hy - dy * 9.5 * sc];
  ctx.lineWidth = 1.3 * sc; ctx.beginPath(); ctx.arc(pc[0] + nx * 1.4 * sc, pc[1] + ny * 1.4 * sc, 1.8 * sc, 0, TAU * 0.8); ctx.stroke();
  if (edge && L > 6) { ctx.strokeStyle = edge; ctx.lineWidth = Math.max(1, 0.8 * sc); poly([P(1.5 * sc, -w + 1.2 * sc), P(L - 2.5 * sc, -w + 1.2 * sc)]); }
}
/* a blade bursting out of the ground (the crimson Sword Mountain): long and narrow, a two-tone diamond
   cross-section split by a bright ridge, a pair of barbs near the root and a needle point. pal: {light, dark, ridge} */
const BLADE_ADREN = {light: C.R, dark: C.K, ridge: C.W};
const BLADE_SOV = {light: C.R, dark: C.K, ridge: '#f5b5ba'};
function drawGroundBlade(x, gy, L, tilt, hw, pal) {
  const dx = Math.sin(tilt), dy = -Math.cos(tilt), nx = -dy, ny = dx;
  const P = (u, off) => [x + dx * L * u + nx * off, gy + dy * L * u + ny * off];
  const bar = Math.min(3.5, hw * 0.55);
  const right = [P(0, hw), P(0.17, hw), P(0.215, hw + bar), P(0.25, hw * 0.9), P(0.62, hw * 0.8)];
  const left = [P(0.62, -hw * 0.8), P(0.37, -hw * 0.88), P(0.335, -hw - bar), P(0.29, -hw), P(0, -hw)];
  const tip = P(1, 0), root = P(0, 0);
  const path = pts => { ctx.beginPath(); pts.forEach((p, i) => i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])); ctx.closePath(); };
  ctx.lineJoin = 'miter'; ctx.miterLimit = 8;
  path(right.concat([tip], left)); ctx.strokeStyle = C.K; ctx.lineWidth = 2.6; ctx.stroke();
  // lit half and shadowed half meet along the ridge
  ctx.fillStyle = pal.light; path([root].concat(right, [tip])); ctx.fill();
  ctx.fillStyle = pal.dark; path([tip].concat(left, [root])); ctx.fill();
  ctx.lineJoin = 'round';
  ctx.strokeStyle = pal.ridge; ctx.lineWidth = 1; poly([P(0.03, 0), P(0.96, 0)]);
  // a bright edge catching the light up to the point
  ctx.strokeStyle = C.W; poly([P(0.66, hw * 0.62), P(0.95, hw * 0.08)]);
}
/* two-bone IK: elbow and hand for an arm of lengths l1+l2 reaching (tx,ty); the elbow hangs low */
function reach(ax, ay, tx, ty, l1, l2) {
  let dx = tx - ax, dy = ty - ay, D = Math.hypot(dx, dy) || 0.001;
  const mx = (l1 + l2) * 0.999;
  if (D > mx) { tx = ax + dx / D * mx; ty = ay + dy / D * mx; dx = tx - ax; dy = ty - ay; D = mx; }
  const a = (l1 * l1 - l2 * l2 + D * D) / (2 * D), h = Math.sqrt(Math.max(0, l1 * l1 - a * a));
  const cx = ax + dx * a / D, cy = ay + dy * a / D, px = -dy / D, py = dx / D;
  const e1 = [cx + px * h, cy + py * h], e2 = [cx - px * h, cy - py * h];
  return [e1[1] > e2[1] ? e1 : e2, [tx, ty]];
}
function drawBow(hx, hy, dx, dy, strPt, sc, color, arrow, outline) {
  const nx = -dy, ny = dx, R = 11 * sc, bx = hx - dx * 4 * sc, by = hy - dy * 4 * sc;
  const t1 = [bx + nx * R, by + ny * R], t2 = [bx - nx * R, by - ny * R], cp = [hx + dx * 7 * sc, hy + dy * 7 * sc], sp = strPt || [bx, by];
  if (arrow && strPt) {
    const tip = [hx + dx * 9 * sc, hy + dy * 9 * sc];
    ctx.strokeStyle = C.K; ctx.lineWidth = 1.3 * sc; poly([sp, tip]);
    ctx.fillStyle = C.K; ctx.beginPath(); ctx.moveTo(tip[0] + dx * 2 * sc, tip[1] + dy * 2 * sc); ctx.lineTo(tip[0] + nx * 2 * sc, tip[1] + ny * 2 * sc); ctx.lineTo(tip[0] - nx * 2 * sc, tip[1] - ny * 2 * sc); ctx.fill();
  }
  ctx.strokeStyle = C.K; ctx.lineWidth = Math.max(1, sc * 0.8); poly([t1, sp, t2]);
  ctx.beginPath(); ctx.moveTo(t1[0], t1[1]); ctx.quadraticCurveTo(cp[0], cp[1], t2[0], t2[1]);
  if (outline) { ctx.strokeStyle = outline; ctx.lineWidth = 4 * sc; ctx.stroke(); }
  ctx.strokeStyle = color; ctx.lineWidth = 2.2 * sc; ctx.stroke();
}
function drawSwoosh(cx, cy, face, a0, a1, rOut, thick, color) {
  const N = 16; ctx.fillStyle = color; ctx.beginPath();
  for (let i = 0; i <= N; i++) { const a = a0 + (a1 - a0) * i / N; ctx.lineTo(cx + Math.sin(a) * face * rOut, cy + Math.cos(a) * rOut); }
  for (let i = N; i >= 0; i--) { const u = i / N, a = a0 + (a1 - a0) * u, r = rOut - thick * Math.sin(Math.PI * u) * (0.35 + 0.65 * u); ctx.lineTo(cx + Math.sin(a) * face * r, cy + Math.cos(a) * r); }
  ctx.closePath(); ctx.fill();
}
/* flat elliptical smear for horizontal cuts, matching the foreshortened blade path */
function drawFlatSwoosh(cx, cy, face, y0, y1, rx, thick, color) {
  const N = 18, pt = (yaw, r) => [cx + Math.sin(yaw) * rx * r * face, cy + (0.24 * Math.cos(yaw) + 0.08) * rx * r];
  ctx.fillStyle = color; ctx.beginPath();
  for (let i = 0; i <= N; i++) { const p = pt(y0 + (y1 - y0) * i / N, 1); ctx.lineTo(p[0], p[1]); }
  for (let i = N; i >= 0; i--) { const u = i / N, p = pt(y0 + (y1 - y0) * u, 1 - thick * Math.sin(Math.PI * u) * (0.35 + 0.65 * u)); ctx.lineTo(p[0], p[1]); }
  ctx.closePath(); ctx.fill();
}
/* the Bowmaster's scarf: tapered tails that curl into hooks, swaying */
function scarfPath(x0, y0, face, sc, len, a0, bend, curl) {
  const pts = [[x0, y0]], n = 16, step = len / n; let lx = 0, ly = 0, a = a0;
  for (let i = 1; i <= n; i++) { const u = i / n; a += bend + (u > 0.55 ? curl * (u - 0.55) * 4.5 : 0); lx += Math.cos(a) * step; ly += Math.sin(a) * step; pts.push([x0 + lx * face * sc, y0 + ly * sc]); }
  return pts;
}
function drawTaper(pts, w0, w1) { for (let i = 1; i < pts.length; i++) { ctx.lineWidth = lerp(w0, w1, i / (pts.length - 1)); poly([pts[i - 1], pts[i]]); } }
/* the Bowmaster's scarf: a thick muffler wound high over the lower face (just under the eyes), its wide tails
   streaming out behind from the back of the wrap. a ripple runs down each tail; standing they hang low and sway,
   moving they stream out flat; where a tail twists it narrows and shows its darker underside.
   s.wind: the wearer's speed. 'tails' is drawn behind the body, 'collar' (the wrap) in front of the head */
const SCARF_DARK = {[C.G2]: C.G1, [C.G3]: C.G2};
function drawScarf(P, face, t, sc, s, part) {
  const hx = P.head[0], hy = P.head[1], dark = SCARF_DARK[s.color] || s.color, rim = C.K, f = face;
  ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  if (part === 'collar') {
    // the wrap: its top edge under the eyes, bowing down across the face, a rounded front, the lower edge round the chin
    const wrap = () => {
      ctx.beginPath(); ctx.moveTo(hx - f * 5.4 * sc, hy + 0.3 * sc);
      ctx.quadraticCurveTo(hx, hy + 1.9 * sc, hx + f * 4.9 * sc, hy + 0.6 * sc);
      ctx.quadraticCurveTo(hx + f * 6.4 * sc, hy + 2.8 * sc, hx + f * 4.3 * sc, hy + 4.9 * sc);
      ctx.quadraticCurveTo(hx, hy + 6.6 * sc, hx - f * 4.9 * sc, hy + 4.6 * sc);
      ctx.closePath();
    };
    ctx.strokeStyle = rim; ctx.lineWidth = Math.max(1, 1.1 * sc); wrap(); ctx.stroke();
    ctx.fillStyle = s.color; wrap(); ctx.fill();
    // the lower turn of the wrap in shadow, and a fold line across it
    ctx.save(); wrap(); ctx.clip();
    ctx.fillStyle = dark; ctx.beginPath(); ctx.moveTo(hx - f * 6 * sc, hy + 3.9 * sc); ctx.quadraticCurveTo(hx, hy + 5.2 * sc, hx + f * 6.5 * sc, hy + 3.6 * sc); ctx.lineTo(hx + f * 6.5 * sc, hy + 8 * sc); ctx.lineTo(hx - f * 6 * sc, hy + 8 * sc); ctx.fill();
    ctx.strokeStyle = dark; ctx.lineWidth = Math.max(1, 0.7 * sc); ctx.beginPath(); ctx.moveTo(hx - f * 4.6 * sc, hy + 2.5 * sc); ctx.quadraticCurveTo(hx, hy + 3.8 * sc, hx + f * 3.2 * sc, hy + 2.6 * sc); ctx.stroke();
    ctx.restore();
    return;
  }
  // a breeze always stirs it a little; the tails leave from the back of the wrap
  const kx = hx - f * 4.2 * sc, ky = hy + 2.9 * sc, wind = clamp(0.3 + Math.abs(s.wind || 0) / 3, 0, 1);
  const tails = [[30, 0.55, 0], [25, 0.9, 2.1], [21, 1.2, 4.0]].slice(0, Math.min(3, s.n || 2));
  for (const [len0, droop, ph] of tails) {
    const N = 12, step = len0 * sc * (1 + wind * 0.2) / N, pts = [], spd = 0.13 + wind * 0.12;
    let x = kx, y = ky;
    for (let j = 0; j <= N; j++) {
      const u = j / N;
      pts.push([x, y]);
      // angle below the horizontal, pointing backwards: gravity bends it further down the length, wind lifts it flat
      const wave = Math.sin(t * spd - u * 4.4 + ph) * (0.16 + 0.34 * u) * (0.7 + wind * 0.5);
      const ang = droop * (1 - wind * 0.7) + u * 0.45 * (1 - wind * 0.8) + wave;
      x -= face * Math.cos(ang) * step; y += Math.sin(ang) * step;
    }
    // a wide band, the same thickness as the wrap where it leaves it, easing thinner toward the end
    const wAt = j => sc * (2.4 - 0.8 * j / N) * (Math.cos(t * spd - j / N * 4.4 + ph) < -0.55 ? 0.7 : 1);
    const nrm = j => { const a = pts[Math.max(0, j - 1)], b = pts[Math.min(N, j + 1)], dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy) || 1; return [-dy / L, dx / L]; };
    const L = [], R = [];
    for (let j = 0; j <= N; j++) { const [ax, ay] = nrm(j), w = wAt(j); L.push([pts[j][0] + ax * w, pts[j][1] + ay * w]); R.push([pts[j][0] - ax * w, pts[j][1] - ay * w]); }
    // the end is cut on a slant
    const e = pts[N], d = pts[N - 1], ux = (e[0] - d[0]) / step, uy = (e[1] - d[1]) / step;
    const tipL = [L[N][0] + ux * 2.6 * sc, L[N][1] + uy * 2.6 * sc];
    const shape = () => { ctx.beginPath(); L.forEach((p, j) => j ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])); ctx.lineTo(tipL[0], tipL[1]); for (let j = N; j >= 0; j--) ctx.lineTo(R[j][0], R[j][1]); ctx.closePath(); };
    ctx.strokeStyle = rim; ctx.lineWidth = Math.max(1, 1.2 * sc); shape(); ctx.stroke();
    ctx.fillStyle = s.color; shape(); ctx.fill();
    // the underside where the ribbon turns over
    ctx.fillStyle = dark;
    for (let j = 0; j < N; j++) if (Math.cos(t * spd - (j + 0.5) / N * 4.4 + ph) < -0.55) { ctx.beginPath(); ctx.moveTo(L[j][0], L[j][1]); ctx.lineTo(L[j + 1][0], L[j + 1][1]); ctx.lineTo(R[j + 1][0], R[j + 1][1]); ctx.lineTo(R[j][0], R[j][1]); ctx.closePath(); ctx.fill(); }
  }
}
/* the Bullet Hell Shooter's gear: a pointed hood with a star, a long coat-cape, pistols and a rocket launcher */
function drawHood(P, face, sc, h, t) {
  const hx = P.head[0], hy = P.head[1], f = face * sc, sw = Math.sin(t * 0.08) * 0.6 * sc;
  ctx.fillStyle = h.color; ctx.beginPath();
  ctx.moveTo(hx + 4.9 * f, hy - 1.2 * sc);
  ctx.quadraticCurveTo(hx + 1.5 * f, hy - 7.4 * sc, hx - 3.6 * f, hy - 5.4 * sc);
  ctx.quadraticCurveTo(hx - 7.6 * f, hy - 4.2 * sc + sw, hx - 9.8 * f, hy + 0.6 * sc + sw);
  ctx.quadraticCurveTo(hx - 6.8 * f, hy + 1.6 * sc, hx - 4.4 * f, hy + 5.2 * sc);
  ctx.lineTo(hx - 0.6 * f, hy + 5.6 * sc);
  ctx.quadraticCurveTo(hx - 1.6 * f, hy - 0.8 * sc, hx + 4.9 * f, hy - 1.2 * sc);
  ctx.closePath(); ctx.fill();
  ctx.strokeStyle = C.K; ctx.lineWidth = Math.max(1, 0.7 * sc); ctx.stroke();
  if (h.star) starPts(hx - 4.2 * f, hy - 0.6 * sc, 1.9 * sc, h.star);
}
function starPts(x, y, r, col) {
  ctx.fillStyle = col; ctx.beginPath();
  for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r * 0.45 : r; ctx.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); }
  ctx.closePath(); ctx.fill();
}
function drawCape(P, face, sc, c, t, trail) {
  const n = P.neck, hp = P.hip, tx = hp[0] - n[0], ty = hp[1] - n[1], L = Math.hypot(tx, ty) || 1, ux = tx / L, uy = ty / L;
  const nbx = -uy * face, nby = ux * face, front = [], back = [];
  const len = c.len || 1.85;
  for (let i = 0; i <= 8; i++) {
    const s = i / 8 * len, fl = Math.sin(t * 0.18 - s * 3) * s * 1.3 * sc, tr = (trail || 0) * s * s * 2.2, jag = c.tatter && i > 4 ? (i % 2 ? -2.6 : 1.4) * sc : 0;
    const bx = n[0] + ux * L * s, by = n[1] + uy * L * s + Math.max(0, s - 1) * 2 * sc;
    front.push([bx + nbx * 0.8 * sc, by + nby * 0.8 * sc]);
    back.push([bx + nbx * ((2.5 + s * 5.2) * sc + jag) - face * tr + fl * nbx, by + nby * ((2.5 + s * 5.2) * sc + jag) + fl * 0.5 + (c.tatter && i === 8 ? 3 * sc : 0)]);
  }
  ctx.fillStyle = c.color; ctx.beginPath();
  front.forEach((p, i) => i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]));
  for (let i = back.length - 1; i >= 0; i--) ctx.lineTo(back[i][0], back[i][1]);
  ctx.closePath(); ctx.fill();
  ctx.strokeStyle = C.K; ctx.lineWidth = Math.max(1, 0.7 * sc); ctx.stroke();
  if (c.star) { const m = back[4], f0 = front[4]; starPts((m[0] + f0[0]) / 2, (m[1] + f0[1]) / 2, 2.2 * sc, c.star); }
}
function drawPistol(hx, hy, dx, dy, sc, color, trim, big) {
  const nx = -dy, ny = dx, s = ny >= 0 ? 1 : -1, L = (big ? 11 : 7.5) * sc;
  ctx.lineCap = 'butt'; ctx.strokeStyle = color;
  ctx.lineWidth = (big ? 3.8 : 3) * sc; poly([[hx - dx * 1.5 * sc, hy - dy * 1.5 * sc], [hx + dx * L, hy + dy * L]]);
  ctx.lineWidth = 1.9 * sc; poly([[hx - dx * 0.6 * sc, hy - dy * 0.6 * sc], [hx - dx * 2 * sc + nx * s * 4.2 * sc, hy - dy * 2 * sc + ny * s * 4.2 * sc]]);
  if (trim) { ctx.strokeStyle = trim; ctx.lineWidth = Math.max(1, 0.7 * sc); poly([[hx + dx * sc - nx * s * 0.5 * sc, hy + dy * sc - ny * s * 0.5 * sc], [hx + dx * (L - 1.5 * sc) - nx * s * 0.5 * sc, hy + dy * (L - 1.5 * sc) - ny * s * 0.5 * sc]]); }
  ctx.lineCap = 'round';
}
function drawLauncher(sx, sy, dx, dy, sc, loaded) {
  const a = [sx - dx * 11 * sc, sy - dy * 11 * sc], b = [sx + dx * 15 * sc, sy + dy * 15 * sc];
  ctx.lineCap = 'butt';
  ctx.strokeStyle = C.K; ctx.lineWidth = 6.5 * sc; poly([a, b]);
  ctx.strokeStyle = C.Y; ctx.lineWidth = 4.2 * sc; poly([[a[0] + dx * sc, a[1] + dy * sc], [b[0] - dx * sc, b[1] - dy * sc]]);
  ctx.strokeStyle = C.K; ctx.lineWidth = 1.2 * sc;
  for (const u of [-6, 4]) { const c = [sx + dx * u * sc, sy + dy * u * sc]; poly([[c[0] - dy * 3.2 * sc, c[1] + dx * 3.2 * sc], [c[0] + dy * 3.2 * sc, c[1] - dx * 3.2 * sc]]); }
  if (loaded) { ctx.fillStyle = C.R; disc(b[0] + dx * 1.5 * sc, b[1] + dy * 1.5 * sc, 2.6 * sc); }
  ctx.lineCap = 'round';
}
/* the Moonlight Assassin's gear: a wide conical straw hat, long white hair, a katana and its scabbard */
function drawKasa(P, face, sc, k) {
  const hx = P.head[0], hy = P.head[1], vx = hx - P.neck[0], vy = hy - P.neck[1], L = Math.hypot(vx, vy) || 1, ux = vx / L, uy = vy / L, px = -uy, py = ux;
  const c = [hx + ux * 2.4 * sc, hy + uy * 2.4 * sc], ap = [c[0] + ux * 6.5 * sc, c[1] + uy * 6.5 * sc];
  const b1 = [c[0] + px * 12.5 * sc - ux * 1.2 * sc, c[1] + py * 12.5 * sc - uy * 1.2 * sc], b2 = [c[0] - px * 12.5 * sc - ux * 1.2 * sc, c[1] - py * 12.5 * sc - uy * 1.2 * sc];
  ctx.fillStyle = k.color; ctx.beginPath(); ctx.moveTo(b1[0], b1[1]); ctx.lineTo(ap[0], ap[1]); ctx.lineTo(b2[0], b2[1]);
  ctx.quadraticCurveTo(c[0] - ux * 1.5 * sc, c[1] - uy * 1.5 * sc, b1[0], b1[1]); ctx.closePath(); ctx.fill();
  if (k.band) { ctx.strokeStyle = k.band; ctx.lineWidth = Math.max(1, 0.8 * sc); poly([[c[0] + px * 6 * sc + ux * 2 * sc, c[1] + py * 6 * sc + uy * 2 * sc], [c[0] - px * 6 * sc + ux * 2 * sc, c[1] - py * 6 * sc + uy * 2 * sc]]); }
}
/* long hair falling from under the hat down the back: three locks that overlap into one mass (outlines first, then
   fills, so they merge) and part only toward their tips; each swells, tapers and sways on its own phase, and they
   stream back together with h.wind (speed). a blue tie at the nape, fine strand lines at portrait size */
function drawHair(P, face, sc, h, t) {
  const wind = Math.min(1.5, h.wind || 0), rx = P.head[0] - face * 2.6 * sc, ry = P.head[1] + 0.6 * sc;
  const LOCKS = [[26, 1.9, 1.1, 0], [21, 2.15, 0.9, 1.7], [18, 1.65, 0.85, 3.1]];
  const locks = LOCKS.map(([len, a0, wm, ph], i) => {
    const sway = Math.sin(t * 0.07 + ph);
    const pts = scarfPath(rx - face * i * 0.5 * sc, ry + i * 0.4 * sc, face, sc, len * (1 - wind * 0.08), a0 + wind * 0.5 + sway * 0.08, 0.012 + wind * 0.012, 0.06 + sway * 0.05), N = pts.length - 1;
    const wAt = j => { const u = j / N; return sc * wm * (2.6 + 2.4 * Math.sin(Math.PI * Math.min(1, u * 1.2)) - 2.5 * u); };
    const nrm = j => { const a = pts[Math.max(0, j - 1)], b = pts[Math.min(N, j + 1)], dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy) || 1; return [-dy / L, dx / L]; };
    const Lf = [], R = [];
    for (let j = 0; j <= N; j++) { const [ax, ay] = nrm(j), w = Math.max(0.2 * sc, wAt(j) / 2); Lf.push([pts[j][0] + ax * w, pts[j][1] + ay * w]); R.push([pts[j][0] - ax * w, pts[j][1] - ay * w]); }
    const e = pts[N], d = [e[0] - pts[N - 1][0], e[1] - pts[N - 1][1]], dl = Math.hypot(d[0], d[1]) || 1, tipP = [e[0] + d[0] / dl * 2.4 * sc, e[1] + d[1] / dl * 2.4 * sc];
    const shape = () => { ctx.beginPath(); Lf.forEach((p, k) => k ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])); ctx.lineTo(tipP[0], tipP[1]); for (let j = N; j >= 0; j--) ctx.lineTo(R[j][0], R[j][1]); ctx.closePath(); };
    return {pts, N, nrm, wAt, shape};
  });
  ctx.lineJoin = 'round';
  ctx.strokeStyle = C.K; ctx.lineWidth = Math.max(1.4, 1.6 * sc);
  for (const l of locks) { l.shape(); ctx.stroke(); }
  ctx.fillStyle = h.color;
  for (const l of locks) { l.shape(); ctx.fill(); }
  if (sc >= 1.5) {
    // a strand line down each lock, and the parting between them near the tips
    ctx.strokeStyle = '#9a9a9a'; ctx.lineWidth = Math.max(1, 0.45 * sc);
    for (const l of locks) { ctx.beginPath(); for (let j = 4; j <= l.N - 2; j++) { const [ax, ay] = l.nrm(j), w = l.wAt(j) * 0.12, x = l.pts[j][0] + ax * w, y = l.pts[j][1] + ay * w; j > 4 ? ctx.lineTo(x, y) : ctx.moveTo(x, y); } ctx.stroke(); }
  }
  const tie = locks[0].pts[2];
  ctx.fillStyle = C.K; disc(tie[0], tie[1], 1.6 * sc); ctx.fillStyle = C.B; disc(tie[0], tie[1], 1.05 * sc);
}
/* a katana: gently curved blade (edge on the outer curve) with an angled kissaki, a blue temper line along the edge,
   a gold habaki collar, an oval guard seen edge-on, and a black wrapped grip with a capped end.
   col recolours the blade (shadow clones); edge the temper line */
function drawKatana(hx, hy, dx, dy, L, sc, face, col, edge) {
  const nx = -dy * face, ny = dx * face, bow = L * 0.07, b0 = 2.8 * sc;
  const base = [hx + dx * b0, hy + dy * b0], tip = [hx + dx * L, hy + dy * L], mid = [hx + dx * (b0 + (L - b0) * 0.55) + nx * bow, hy + dy * (b0 + (L - b0) * 0.55) + ny * bow];
  const N = 12, c = [], n = [];
  for (let i = 0; i <= N; i++) {
    const u = i / N, a = 1 - u;
    c.push([a * a * base[0] + 2 * a * u * mid[0] + u * u * tip[0], a * a * base[1] + 2 * a * u * mid[1] + u * u * tip[1]]);
    const tx = 2 * a * (mid[0] - base[0]) + 2 * u * (tip[0] - mid[0]), ty = 2 * a * (mid[1] - base[1]) + 2 * u * (tip[1] - mid[1]), tl = Math.hypot(tx, ty) || 1;
    // unit normal toward the outer (edge) side of the curve
    let ox = -ty / tl, oy = tx / tl; if (ox * nx + oy * ny < 0) { ox = -ox; oy = -oy; } n.push([ox, oy]);
  }
  // half-widths: spine side stays straight into the point, the edge side sweeps up to meet it (the kissaki)
  const hw = u => lerp(1.05, 0.8, u) * sc;
  const spine = u => u < 0.9 ? hw(u) : hw(u) * (1 - (u - 0.9) / 0.1);
  const edgeW = u => u < 0.84 ? hw(u) : hw(u) * Math.pow(Math.max(0, 1 - (u - 0.84) / 0.16), 0.6);
  const poly2 = (o, fS, fE) => {
    ctx.beginPath();
    for (let i = 0; i <= N; i++) { const u = i / N, s = fS(u) + o; ctx[i ? 'lineTo' : 'moveTo'](c[i][0] - n[i][0] * s, c[i][1] - n[i][1] * s); }
    ctx.lineTo(tip[0] + (tip[0] - c[N - 1][0]) * 0.1 * o, tip[1] + (tip[1] - c[N - 1][1]) * 0.1 * o);
    for (let i = N; i >= 0; i--) { const u = i / N, s = fE(u) + o; ctx.lineTo(c[i][0] + n[i][0] * s, c[i][1] + n[i][1] * s); }
    ctx.closePath(); ctx.fill();
  };
  ctx.fillStyle = C.K; poly2(Math.max(0.9, 0.9 * sc), spine, edgeW);
  ctx.fillStyle = col || C.W; poly2(0, spine, edgeW);
  // the temper line: the edge third of the blade in blue, wavy (hamon) at portrait size
  ctx.fillStyle = edge || (col ? col : C.B);
  if (!col || edge) {
    ctx.beginPath();
    for (let i = 0; i <= N; i++) { const u = i / N, wav = sc >= 2 ? Math.sin(u * 22) * 0.18 * sc : 0, s = -edgeW(u) * 0.25 + wav; ctx[i ? 'lineTo' : 'moveTo'](c[i][0] + n[i][0] * s, c[i][1] + n[i][1] * s); }
    for (let i = N; i >= 0; i--) { const u = i / N, s = edgeW(u); ctx.lineTo(c[i][0] + n[i][0] * s, c[i][1] + n[i][1] * s); }
    ctx.closePath(); ctx.fill();
  }
  // a glint of light running down the flat near the spine
  if (sc >= 2) { ctx.strokeStyle = C.W; ctx.lineWidth = 0.5 * sc; ctx.beginPath(); for (let i = 2; i <= N - 3; i++) { const s = -hw(i / N) * 0.55; ctx[i > 2 ? 'lineTo' : 'moveTo'](c[i][0] + n[i][0] * s, c[i][1] + n[i][1] * s); } ctx.stroke(); }
  // grip: black, wrapped, with a capped end
  const g0 = [hx - dx * 7.5 * sc, hy - dy * 7.5 * sc], g1 = [hx + dx * 1.2 * sc, hy + dy * 1.2 * sc];
  ctx.lineCap = 'butt'; ctx.strokeStyle = C.K; ctx.lineWidth = 2.6 * sc; poly([g0, g1]);
  if (sc >= 1.5) { ctx.fillStyle = C.W; for (let s = 1.2; s < 7.5; s += 1.6) { const x = hx - dx * s * sc, y = hy - dy * s * sc; ctx.fillRect(Math.round(x - 0.4 * sc), Math.round(y - 0.4 * sc), Math.max(1, Math.round(0.8 * sc)), Math.max(1, Math.round(0.8 * sc))); } }
  ctx.fillStyle = C.K; disc(g0[0], g0[1], 1.6 * sc); if (sc >= 1.5) { ctx.fillStyle = C.B; disc(g0[0], g0[1], 0.8 * sc); }
  ctx.lineCap = 'round';
  // habaki (gold collar) and the guard, an oval seen edge-on across the blade
  const ang = Math.atan2(dy, dx), gx = hx + dx * 1.9 * sc, gy = hy + dy * 1.9 * sc;
  ctx.fillStyle = C.Y; ctx.beginPath(); ctx.ellipse(hx + dx * 3.1 * sc, hy + dy * 3.1 * sc, 0.9 * sc, 1.35 * sc, ang, 0, TAU); ctx.fill();
  ctx.fillStyle = C.K; ctx.beginPath(); ctx.ellipse(gx, gy, 1.3 * sc, 3.3 * sc, ang, 0, TAU); ctx.fill();
  if (sc >= 1.5) { ctx.fillStyle = C.B; ctx.beginPath(); ctx.ellipse(gx, gy, 0.6 * sc, 2.3 * sc, ang, 0, TAU); ctx.fill(); }
}
function drawSheath(P, face, sc) {
  const h = P.hip, a = [h[0] + face * 5 * sc, h[1] - 1.5 * sc], b = [h[0] - face * 17 * sc, h[1] + 4 * sc];
  ctx.lineCap = 'round'; ctx.strokeStyle = C.K; ctx.lineWidth = 3 * sc; poly([a, b]);
  ctx.strokeStyle = C.B; ctx.lineWidth = 1 * sc; poly([[a[0] - face * 2 * sc, a[1] + 0.3 * sc], [b[0] + face * 2 * sc, b[1] - 0.3 * sc]]);
  ctx.strokeStyle = C.K; ctx.lineWidth = 2.3 * sc; poly([a, [a[0] + face * 6 * sc, a[1] - 2.5 * sc]]);
}
/* the Chain Sovereign's gear: a slowly turning halo of chain links, a spiked crown, red eyes,
   chains dangling from the wrists, and the stolen greatsword in crimson */
function drawHalo(P, sc, h, t) {
  const cx = P.head[0], cy = P.head[1] - 1 * sc, r = 11 * sc, n = 12, a0 = t * 0.02;
  ctx.lineWidth = Math.max(1, 1.4 * sc);
  for (let i = 0; i < n; i++) {
    const a = a0 + i * TAU / n, x = cx + Math.cos(a) * r, y = cy + Math.sin(a) * r * 0.9;
    ctx.save(); ctx.translate(x, y); ctx.rotate(a + Math.PI / 2);
    ctx.strokeStyle = h.color; ctx.beginPath();
    if (i % 2) ctx.ellipse(0, 0, 2.6 * sc, 1.4 * sc, 0, 0, TAU); else { ctx.moveTo(-2 * sc, 0); ctx.lineTo(2 * sc, 0); }
    ctx.stroke(); ctx.restore();
  }
}
function drawCrown(P, face, sc, col) {
  const hx = P.head[0], hy = P.head[1];
  ctx.fillStyle = col;
  for (const [ox, h] of [[-3.2, 4.5], [0, 6.5], [3.2, 4.5]]) { ctx.beginPath(); ctx.moveTo(hx + (ox - 1.6) * sc, hy - 3.2 * sc); ctx.lineTo(hx + ox * sc, hy - (3.2 + h) * sc); ctx.lineTo(hx + (ox + 1.6) * sc, hy - 3.2 * sc); ctx.fill(); }
}
function drawEyes(P, face, sc, col) {
  ctx.fillStyle = col;
  const hx = P.head[0] + face * 1.8 * sc, hy = P.head[1] - 0.6 * sc;
  ctx.fillRect(Math.round(hx - 0.5 * sc), Math.round(hy), Math.max(1, Math.round(1.4 * sc)), Math.max(1, Math.round(1.1 * sc)));
  ctx.fillRect(Math.round(hx + face * 2.1 * sc - 0.5 * sc), Math.round(hy), Math.max(1, Math.round(1.4 * sc)), Math.max(1, Math.round(1.1 * sc)));
}
function drawWristChains(P, sc, col, t) {
  ctx.strokeStyle = col; ctx.lineWidth = Math.max(1, 1.1 * sc);
  for (const [hand, ph] of [[P.handF, 0], [P.handB, 1.7]]) {
    let x = hand[0], y = hand[1];
    for (let k = 0; k < 5; k++) {
      const sw = Math.sin(t * 0.12 + ph + k * 0.6) * 0.5, nx = x + sw * 2.4 * sc, ny = y + 3.2 * sc;
      ctx.beginPath(); if (k % 2 === 0) ctx.ellipse((x + nx) / 2, (y + ny) / 2, 1.1 * sc, 2 * sc, sw * 0.4, 0, TAU); else { ctx.moveTo(x, y); ctx.lineTo(nx, ny); }
      ctx.stroke(); x = nx; y = ny;
    }
  }
}
function drawQuiver(P, face, sc) {
  const a = [P.neck[0] - face * 3.5 * sc, P.neck[1] + 1.5 * sc], b = [P.hip[0] - face * 5 * sc, P.hip[1] - 4 * sc];
  ctx.strokeStyle = C.K; ctx.lineCap = 'round'; ctx.lineWidth = 4.2 * sc; poly([a, b]);
  const dx = a[0] - b[0], dy = a[1] - b[1], L = Math.hypot(dx, dy) || 1, ux = dx / L, uy = dy / L, px = -uy, py = ux;
  ctx.lineWidth = Math.max(1, sc);
  for (let i = 0; i < 3; i++) {
    const s0 = [a[0] + (i - 1) * 1.8 * sc, a[1]], s1 = [s0[0] + ux * (9 + i) * sc, s0[1] + uy * (9 + i) * sc];
    poly([s0, s1]);
    for (const f of [-1, 1]) poly([[s1[0] - ux * 2 * sc, s1[1] - uy * 2 * sc], [s1[0] - ux * 5 * sc + px * f * 2.2 * sc, s1[1] - uy * 5 * sc + py * f * 2.2 * sc]]);
  }
}
function drawFigure(x, y, face, q, o = {}) {
  const sc = o.sc || 1, J = solve(q), X = figXform(x, y, face, q, sc);
  const P = {}; for (const k in J) P[k] = X.T(J[k]);
  const col = o.color || C.K, lw = 2.8 * sc, t = o.t || 0, hx = P.head[0], hy = P.head[1];
  ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  const sw = o.sword ? swordGeom(x, y, face, q, o.sword.len, sc) : null;
  if (sw) {
    // both hands on the grip: the back arm reaches for the lower half of the handle
    const g = 5 * sc * Math.max(0.45, sw.k), r = reach(P.sh[0], P.sh[1], sw.h[0] - sw.d[0] * g, sw.h[1] - sw.d[1] * g, 7 * sc, 7 * sc);
    P.elbB = r[0]; P.handB = r[1];
  }
  const limbs = [[P.sh, P.elbB, P.handB], [P.hip, P.kneeB, P.footB], [P.hip, P.neck], [P.hip, P.kneeF, P.footF], [P.sh, P.elbF, P.handF]];
  const behind = sw && q.yaw != null && Math.cos(q.yaw) < -0.15;
  const drawSw = () => drawGreatsword(sw.h[0], sw.h[1], sw.d[0], sw.d[1], sw.L, face, sc * (0.6 + 0.4 * sw.k) * (o.sword.w || 1), o.sword.color, o.sword.edge);
  const scarf = o.scarf ? (typeof o.scarf === 'string' ? {color: o.scarf, n: 2} : o.scarf) : null;
  if (scarf) drawScarf(P, face, t, sc, scarf, 'tails');
  if (o.halo) drawHalo(P, sc, o.halo, t);
  if (o.cape) drawCape(P, face, sc, o.cape, t, o.cape.trail);
  if (o.hair) drawHair(P, face, sc, o.hair, t);
  if (o.quiver) drawQuiver(P, face, sc);
  if (behind) drawSw();
  const gunDir = (g, hand, elb) => {
    if (g.aim != null) return [Math.cos(g.aim), Math.sin(g.aim)];
    const vx = hand[0] - elb[0], vy = hand[1] - elb[1], L = Math.hypot(vx, vy) || 1; return [vx / L, vy / L];
  };
  const drawGun = g => { const hand = g.hand === 'B' ? P.handB : P.handF, [dx, dy] = gunDir(g, hand, g.hand === 'B' ? P.elbB : P.elbF); drawPistol(hand[0], hand[1], dx, dy, sc, g.color || C.K, g.trim, g.big); };
  if (o.guns) for (const g of o.guns) if (g.hand === 'B') drawGun(g);
  const drawKat = k => { const hand = k.hand === 'B' ? P.handB : P.handF, [dx, dy] = gunDir(k, hand, k.hand === 'B' ? P.elbB : P.elbF); drawKatana(hand[0], hand[1], dx, dy, (k.len || 30) * sc, sc, face, k.color, k.edge); };
  if (o.katanas) for (const k of o.katanas) if (k.hand === 'B') drawKat(k);
  // headless: the head is off (the original's end) - nothing above the neck is drawn
  const head = !o.headless;
  if (o.godHalo && head) drawGodHalo(P, face, sc, t, o.godHalo);
  if (o.masterBlades) drawMasterBlades(P, face, sc, t, o.masterBlades);
  if (o.band && head) {
    // headband tails; the Blade Master's are long, crimson and fly out behind
    const bd = typeof o.band === 'object' ? o.band : {}, segs = bd.n || 3;
    ctx.strokeStyle = bd.color || col; ctx.lineWidth = (bd.color ? 1.6 : 1.2) * sc;
    for (let k = 0; k < 2; k++) {
      ctx.beginPath(); ctx.moveTo(hx - face * 3 * sc, hy - sc);
      for (let i = 1; i <= segs; i++) ctx.lineTo(hx - face * (3 + i * 3.2) * sc, hy + (-1 + i * (0.6 + k * 0.9) * (bd.color ? 0.55 : 1) + Math.sin(t * 0.3 - i - k) * i * 0.35) * sc);
      ctx.stroke();
    }
  }
  if (o.outline) {
    ctx.strokeStyle = o.outline; ctx.lineWidth = lw + 2.2 * sc; for (const l of limbs) poly(l);
    ctx.fillStyle = o.outline; if (head) disc(hx, hy, 5.6 * sc);
  }
  ctx.strokeStyle = col; ctx.lineWidth = lw; for (const l of limbs) poly(l);
  ctx.fillStyle = col; if (head) disc(hx, hy, 4.4 * sc);
  if (o.band && o.band.color && head) { ctx.strokeStyle = o.band.color; ctx.lineWidth = 1.3 * sc; ctx.lineCap = 'butt'; poly([[hx - 4.4 * sc, hy - 1.2 * sc], [hx + 4.4 * sc, hy - 1.2 * sc]]); ctx.lineCap = 'round'; }
  if (scarf) drawScarf(P, face, t, sc, scarf, 'collar');
  if (o.hood && head) drawHood(P, face, sc, o.hood, t);
  if (o.kasa && head) drawKasa(P, face, sc, o.kasa);
  if (o.crown && head) drawCrown(P, face, sc, o.crown);
  if (o.eyes && head) drawEyes(P, face, sc, o.eyes);
  if (o.sheath) drawSheath(P, face, sc);
  if (o.wristChains) drawWristChains(P, sc, o.wristChains, t);
  if (o.gsword) {
    const vx = P.handF[0] - P.elbF[0], vy = P.handF[1] - P.elbF[1], L = Math.hypot(vx, vy) || 1;
    drawGreatsword(P.handF[0], P.handF[1], vx / L, vy / L, (o.gsword.len || 40) * sc, face, sc * 1.05, o.gsword.color, o.gsword.edge);
  }
  if (o.guns) for (const g of o.guns) if (g.hand !== 'B') drawGun(g);
  if (o.katanas) for (const k of o.katanas) if (k.hand !== 'B') drawKat(k);
  if (o.launcher) { const a = o.launcher.aim; drawLauncher(P.sh[0], P.sh[1] - 2 * sc, Math.cos(a), Math.sin(a), sc, o.launcher.loaded); }
  if (o.holdArrow) {
    const ex = P.handB[0] - P.elbB[0], ey = P.handB[1] - P.elbB[1], L = Math.hypot(ex, ey) || 1, ux = ex / L, uy = ey / L;
    const tip = [P.handB[0] + ux * 9 * sc, P.handB[1] + uy * 9 * sc], tail = [P.handB[0] - ux * 7 * sc, P.handB[1] - uy * 7 * sc];
    ctx.strokeStyle = col; ctx.lineWidth = 1.2 * sc; poly([tail, tip]);
    ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(tip[0] + ux * 3 * sc, tip[1] + uy * 3 * sc); ctx.lineTo(tip[0] - uy * 2 * sc, tip[1] + ux * 2 * sc); ctx.lineTo(tip[0] + uy * 2 * sc, tip[1] - ux * 2 * sc); ctx.fill();
    for (const f of [-1, 1]) poly([tail, [tail[0] - ux * 3 * sc - uy * f * 2 * sc, tail[1] - uy * 3 * sc + ux * f * 2 * sc]]);
  }
  if (sw && !behind) drawSw();
  if (o.bow) {
    let dx, dy;
    if (o.bow.aim != null) { dx = Math.cos(o.bow.aim); dy = Math.sin(o.bow.aim); }
    else { const vx = P.handF[0] - P.elbF[0], vy = P.handF[1] - P.elbF[1], L = Math.hypot(vx, vy) || 1; dx = vx / L; dy = vy / L; }
    drawBow(P.handF[0], P.handF[1], dx, dy, o.bow.drawn ? P.handB : null, sc, o.bow.color || C.K, o.bow.arrow, o.outline);
  }
  return P;
}
/* the class mark: spectral blades hovering in a fan at the hero's back (3 for a Master, 5 for a Lord or God) */
function drawMasterBlades(P, face, sc, t, mb) {
  const n = mb.n || 3, bx = P.neck[0] - face * 4 * sc, by = P.neck[1] + 2 * sc, spread = n > 3 ? 0.34 : 0.45;
  for (let i = 0; i < n; i++) {
    const a = -Math.PI / 2 - face * (0.2 + i * spread), bob = Math.sin(t * 0.07 + i * 1.3) * 1.2 * sc, r = 6 * sc;
    drawRimSword(bx + Math.cos(a) * r, by + Math.sin(a) * r + bob, Math.cos(a), Math.sin(a), (n > 3 && i % 2 ? 11 : 13) * sc, face, 0.45 * sc, C.K, mb.edge || C.R);
  }
}
/* the Blade God's halo: a slowly turning ring of small golden blades behind the head, points outward
   (h may recolour it: {ring, blade, tip} - the original's is violet and red, and turns the other way) */
function drawGodHalo(P, face, sc, t, h) {
  const c = typeof h === 'object' ? h : null, cx = P.head[0] - face * 2 * sc, cy = P.head[1] - 4 * sc, r = 9.5 * sc;
  ctx.strokeStyle = c ? c.ring : C.Y; ctx.lineWidth = Math.max(1, 0.8 * sc); ctx.beginPath(); ctx.arc(cx, cy, r, 0, TAU); ctx.stroke();
  for (let i = 0; i < 8; i++) {
    const a = (c ? -1 : 1) * t * 0.015 + i * TAU / 8, dx = Math.cos(a), dy = Math.sin(a);
    drawBlade(cx + dx * r, cy + dy * r, dx, dy, 6 * sc, 1.6 * sc, c ? c.blade : C.Y, c ? c.tip : C.W, sc * 0.5);
  }
}
/* a greatsword with a thin white rim, so it still reads against a dark background */
function drawRimSword(hx, hy, dx, dy, L, face, sc, color, edge) {
  const k = Math.max(0.6, sc * 0.9);
  drawGreatsword(hx - dx * k, hy - dy * k, dx, dy, L + k * 2, face, sc + 0.45, C.W, null);
  drawGreatsword(hx, hy, dx, dy, L, face, sc, color, edge);
}
/* the hero's look by class: Master - a long crimson headband and three hovering blades; Lord - a tattered crimson
   cape and five blades; God - the headband and blade edges turn gold and a halo of blades rises behind the head.
   cls may be passed as a number (or true/false for Master/Summoner) */
function heroLook(o, cls = save.cls | 0) {
  cls = cls === true ? 1 : cls === false ? 0 : cls;
  const look = {band: true};
  if (cls >= 1) Object.assign(look, {band: {color: cls >= 3 ? C.Y : C.R, n: 5}, masterBlades: {n: cls >= 2 ? 5 : 3, edge: cls >= 3 ? C.Y : C.R}});
  if (cls >= 2) look.cape = {color: C.R, tatter: true, len: 1.55};
  if (cls >= 3) look.godHalo = true;
  return Object.assign(look, o);
}
function starShape(x, y, col) {
  ctx.fillStyle = C.K; ctx.fillRect(Math.round(x) - 2, Math.round(y) - 1, 5, 3); ctx.fillRect(Math.round(x) - 1, Math.round(y) - 2, 3, 5);
  ctx.fillStyle = col || C.Y; ctx.fillRect(Math.round(x) - 1, Math.round(y), 3, 1); ctx.fillRect(Math.round(x), Math.round(y) - 1, 1, 3);
}
