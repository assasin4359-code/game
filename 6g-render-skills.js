/* ---------- class skills: effects in the world, the wings and aura on the hero, and their icons ---------- */
// a thick line of light: a black rim, a colour, a white core
function lightLine(a, b, w, col) {
  ctx.lineCap = 'round';
  ctx.strokeStyle = C.K; ctx.lineWidth = w + 2; poly([a, b]);
  ctx.strokeStyle = col; ctx.lineWidth = w; poly([a, b]);
  ctx.strokeStyle = C.W; ctx.lineWidth = Math.max(1, w * 0.35); poly([a, b]);
}
function drawClassSkillFx() {
  const p = player; if (!p) return;
  // 섬광일섬: the streak the dash leaves, and the shock running along it at the end
  const F = p.flashFx;
  if (F) {
    const d0 = FLASH.stance, age = F.t - d0, y = F.y - 20;
    if (age > 0 && F.fin == null) { const k = Math.max(0.25, 1 - age / 30), x = age <= FLASH.dash ? lerp(F.x0, F.x1, age / FLASH.dash) : F.x1; lightLine([F.x0, y], [x, y], 7 * k, C.R); }
    if (F.fin != null) { const k = 1 - (F.t - F.fin) / 18; if (k > 0) { ctx.globalAlpha = k; lightLine([F.x0 - F.face * 20, y], [F.x1 + F.face * 20, y], 14 * k + 1, C.R); ctx.globalAlpha = 1; } }
  }
  // 백화난무: long thin crescents of slashes crossing on wide flattened orbits round the hero (black and red)
  const Bm = p.bloom;
  if (Bm && Bm.arcs.length) for (const a of Bm.arcs) drawSlashArc(a);
  // 비연삼단: the lines of the passes hanging in the air, bursting all together on the landing
  const S = p.state === 'swallow' ? p.sw : null;
  if (S) for (const L of S.lines) {
    if (S.burst < 0) { const fl = (globalT >> 1) & 1; lightLine(L.a, L.b, fl ? 4 : 3, C.R); }
    else { const k = 1 - (p.st - S.burst) / 14; if (k > 0) { ctx.globalAlpha = k; lightLine(L.a, L.b, 12 * k + 2, (p.st & 2) ? C.W : C.R); ctx.globalAlpha = 1; } }
  }
  // 천검군림: the blades flying from the wings, cutting through and fading out
  if (p.reign) for (const s of p.reign.shots) {
    const a = s.fade ? Math.max(0, 1 - s.fade / 8) : 1;
    ctx.globalAlpha = a;
    if (s.trail.length > 1) { ctx.strokeStyle = C.R; ctx.lineWidth = 2; poly(s.trail.concat([[s.x, s.y]])); }
    const dx = Math.cos(s.ang), dy = Math.sin(s.ang);
    drawRimSword(s.x - dx * 16, s.y - dy * 16, dx, dy, 18, 1, 0.55, s.fade ? C.W : C.K, C.R);
    ctx.globalAlpha = 1;
  }
  // 검옥: the ring of blades round the enemy
  const P = p.prison;
  if (P) {
    const shown = Math.min(PRISON.n, Math.ceil(P.t / 2)), drive = PRISON.form + (P.hold || PRISON.hold), shakeJ = P.t > PRISON.form && P.t < drive ? rnd(-0.8, 0.8) : 0;
    if (P.t < drive + 6) {
      ctx.strokeStyle = (globalT & 4) ? C.R : C.K; ctx.lineWidth = 1; ctx.setLineDash([3, 3]); ctx.beginPath(); ctx.ellipse(P.cx, P.cy, P.r + 6, (P.r + 6) * 0.9, 0, 0, TAU); ctx.stroke(); ctx.setLineDash([]);
      for (let i = 0; i < shown; i++) {
        const a = i / PRISON.n * TAU + P.t * 0.01, x = P.cx + Math.cos(a) * (P.r + 14) + shakeJ, y = P.cy + Math.sin(a) * (P.r + 14) * 0.9;
        drawRimSword(x, y, -Math.cos(a), -Math.sin(a) * 0.9, 18, 1, 0.55, C.K, C.R);
      }
    }
  }
  // 천붕검: rifts torn in the sky, marks on the ground, greatswords plunging slantwise and standing where they struck
  const M = p.march;
  if (M) for (const s of M.swords) {
    if (s.gone) continue;
    const t = M.t, rel = t - s.t0, big = s.big, L = s.huge ? 200 : big ? 116 : s.small ? 48 : 66, sc = s.huge ? 4 : big ? 2.3 : s.small ? 1 : 1.4;
    // the rift it comes out of
    if (rel > -9 && rel < 8) {
      const open = rel < 0 ? (rel + 9) / 9 : 1 - rel / 8, w = (big ? 34 : 20) * open;
      ctx.strokeStyle = C.K; ctx.lineWidth = 4 * open + 1; poly([[s.sx - w, s.sy - 3], [s.sx - w * 0.3, s.sy + 2], [s.sx + w * 0.2, s.sy - 2], [s.sx + w, s.sy + 3]]);
      ctx.strokeStyle = C.R; ctx.lineWidth = 2 * open + 0.5; poly([[s.sx - w, s.sy - 3], [s.sx - w * 0.3, s.sy + 2], [s.sx + w * 0.2, s.sy - 2], [s.sx + w, s.sy + 3]]);
    }
    // the mark where it will land
    if (rel > -9 && !s.hit) {
      const on = (globalT >> 1) & 1, r = s.huge ? 52 : big ? 30 : s.small ? 10 : 14;
      ctx.strokeStyle = on ? C.R : C.K; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.ellipse(s.tx, FLOOR - 1, r, r * 0.2, 0, 0, TAU); ctx.stroke();
      ctx.fillStyle = ctx.strokeStyle; ctx.beginPath(); ctx.moveTo(s.tx - 4, FLOOR - 12); ctx.lineTo(s.tx + 4, FLOOR - 12); ctx.lineTo(s.tx, FLOOR - 5); ctx.fill();
    }
    if (rel < 0) continue;
    // the blade itself, point first, with the streak of its fall behind it
    const q = marchSword(s, t), hx = q.x - q.dx * L, hy = q.y - q.dy * L;
    if (!s.hit) for (let k = 1; k <= 3; k++) { ctx.globalAlpha = 0.5 - k * 0.12; ctx.strokeStyle = k % 2 ? C.R : C.W; ctx.lineWidth = big ? 4 : 2; poly([[hx - q.dx * k * 14, hy - q.dy * k * 14], [hx - q.dx * (k * 14 + 26), hy - q.dy * (k * 14 + 26)]]); ctx.globalAlpha = 1; }
    const shake = s.hit && t - s.hitT < 6 ? rnd(-1.5, 1.5) : 0;
    drawGreatsword(hx + shake, hy, q.dx, q.dy, L, M.face, sc, C.K, C.R);
    if (s.hit && t - s.hitT < 10) { ctx.strokeStyle = C.K; ctx.lineWidth = 1.5; for (const d of [-1, 1]) poly([[s.tx, FLOOR], [s.tx + d * 10, FLOOR + 2], [s.tx + d * (big ? 28 : 18), FLOOR + 1]]); }
  }
  // 검역: the field of blades round the hero
  const D = p.domain;
  if (D) {
    const dur = D.dur || DOMAIN.dur, cx = p.x, cy = p.y - 20, r = (D.r || DOMAIN.r) * Math.min(1, D.t / 8), fade = D.t > dur - 20 ? (dur - D.t) / 20 : 1;
    ctx.globalAlpha = 0.12 * fade; ctx.fillStyle = C.W; disc(cx, cy, r); ctx.globalAlpha = fade;
    ctx.strokeStyle = C.W; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(cx, cy, r, 0, TAU); ctx.stroke();
    ctx.strokeStyle = C.R;
    for (let i = 0; i < 36; i++) { const a = D.a + i * TAU / 36, l = i % 3 ? 4 : 8; poly([[cx + Math.cos(a) * r, cy + Math.sin(a) * r], [cx + Math.cos(a) * (r - l), cy + Math.sin(a) * (r - l)]]); }
    const rng = seeded(D.t >> 1);
    for (let i = 0; i < 4; i++) { const a = rng() * TAU, d = rng() * r * 0.9, x = cx + Math.cos(a) * d, y = cy + Math.sin(a) * d, b = rng() * TAU, l = 6 + rng() * 10; ctx.strokeStyle = i % 2 ? C.W : C.R; ctx.lineWidth = 1; poly([[x - Math.cos(b) * l, y - Math.sin(b) * l], [x + Math.cos(b) * l, y + Math.sin(b) * l]]); }
    ctx.globalAlpha = 1;
  }
  // 천지검명: the blades coming down, then every blade glowing and trembling until it bursts
  const R = p.reso;
  if (R) {
    for (const f of R.fall) if (!R.swords || R.t < RESO.ring) drawRimSword(f.x, f.y - 20, 0, 1, 20, 1, 0.6, C.K, C.W);
    if (R.swords) for (const s of R.swords) {
      if (s.done) continue;
      const j = rnd(-1, 1), on = (globalT >> 1) & 1;
      ctx.strokeStyle = on ? C.W : C.R; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(s.x + j, s.y, 6 + ((R.t + s.x) % 6), 0, TAU); ctx.stroke();
      if (!s.blade) drawRimSword(s.x + j, s.y - 8, 0, 1, 18, 1, 0.6, C.K, on ? C.W : C.R);
    }
  }
}
/* one slash of 백화난무: a crescent along a tilted flattened ellipse, sharp at both ends and fullest in the middle.
   it sweeps open along its path in three frames, then thins away; black shell, red body, a thin black spine */
function drawSlashArc(a) {
  const grow = Math.min(1, (a.t + 1) / 3), thin = a.t < 3 ? 1 : Math.max(0, 1 - (a.t - 3) / (a.life - 3));
  if (thin <= 0) return;
  // k: how much of the width survives across the flat side of the ellipse (defaults to its own squash)
  const N = 24, c = Math.cos(a.rot), s = Math.sin(a.rot), k = a.k || a.ry / a.rx, pt = (th, dr) => {
    const x = Math.cos(th) * (a.rx + dr), y = Math.sin(th) * (a.ry + dr * k);
    return [a.cx + x * c - y * s, a.cy + x * s + y * c];
  };
  const shape = (wm) => {
    const outer = [], inner = [];
    for (let i = 0; i <= N; i++) {
      const u = i / N * grow, th = a.a0 + a.span * u, w = a.w * wm * thin * Math.pow(Math.sin(Math.PI * Math.min(1, u / Math.max(0.01, grow))), 0.9);
      outer.push(pt(th, w)); inner.push(pt(th, -w * 0.35));
    }
    ctx.beginPath(); outer.forEach((q, i) => i ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1])); for (let i = N; i >= 0; i--) ctx.lineTo(inner[i][0], inner[i][1]); ctx.closePath(); ctx.fill();
  };
  const pal = a.pal || {};
  ctx.fillStyle = pal.shell || C.K; shape(1.5);
  ctx.fillStyle = pal.body || C.R; shape(1);
  ctx.strokeStyle = pal.spine || C.K; ctx.lineWidth = 1; ctx.beginPath();
  for (let i = 3; i <= N - 3; i++) { const th = a.a0 + a.span * (i / N) * grow, q = pt(th, a.w * 0.25 * thin); i > 3 ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1]); }
  ctx.stroke();
}
/* the ground combo's slash: a whip of red flame - a thin dark tail, a white-hot head and feathered streaks.
   the head sweeps out in 3 frames, then the tail snaps up after it and the whole thing burns away */
const hash01 = (s, j) => { const x = Math.sin(s * 12.9898 + j * 78.233) * 43758.5453; return x - Math.floor(x); };
function drawFlameArc(a) {
  const T = a.t, L = a.life, S = a.sweep || 3, sw = Math.min(1, (T + 1) / S), hu = 1 - (1 - sw) * (1 - sw);
  const tu = T < S - 1 ? 0 : Math.min(0.96, Math.pow((T - S + 1) / (L - S + 1), 0.75)) * hu;
  const fade = T < S ? 1 : 1 - 0.55 * (T - S) / (L - S), W = a.w * fade;
  if (hu - tu < 0.02) return;
  // curl: the tail spirals inward, so the swing reads as a whip rather than a plate
  const c = Math.cos(a.rot), s = Math.sin(a.rot), k = a.k || a.ry / a.rx, curl = a.curl === undefined ? 0.3 : a.curl, N = 28;
  const pt = (u, dr) => {
    const th = a.a0 + a.span * u, sc = 1 - curl * (1 - u), x = Math.cos(th) * (a.rx * sc + dr), y = Math.sin(th) * (a.ry * sc + dr * k);
    return [a.cx + x * c - y * s, a.cy + x * s + y * c];
  };
  const uAt = v => tu + (hu - tu) * v;
  // thin at the tail, fullest just behind the head, then a blunt burning head
  const prof = v => Math.pow(v, 1.4) * (1 - 0.6 * Math.pow(Math.max(0, (v - 0.8) / 0.2), 2)) * 1.3;
  const band = (v0, fo, fi, pad) => {
    const outer = [], inner = [];
    for (let i = 0; i <= N; i++) { const v = v0 + (1 - v0) * i / N, w = W * prof(v); outer.push(pt(uAt(v), w * fo + pad)); inner.push(pt(uAt(v), -w * fi - pad)); }
    ctx.beginPath(); outer.forEach((q, i) => i ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1])); for (let i = N; i >= 0; i--) ctx.lineTo(inner[i][0], inner[i][1]); ctx.closePath(); ctx.fill();
  };
  const strand = (d, v0, v1, col, lw) => {
    ctx.strokeStyle = col; ctx.lineWidth = lw; ctx.beginPath();
    for (let i = 0; i <= 12; i++) { const q = pt(uAt(v0 + (v1 - v0) * i / 12), d); i ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1]); }
    ctx.stroke();
  };
  ctx.lineCap = 'round';
  // a thin scorched rim on the outer edge only, the red flame, then the white-hot core that cools off first
  // (a.pal recolours it: the original's flame is violet)
  const pal = a.pal || {};
  ctx.fillStyle = pal.rim || C.K; band(0, 1.16, 0.4, 0.6);
  ctx.fillStyle = pal.body || C.R; band(0, 1, 0.4, 0);
  const hot = T < S ? 1 : Math.max(0, 1 - (T - S) / (L * 0.45));
  if (hot > 0) { ctx.fillStyle = pal.core || C.W; band(0.3, 0.72 * hot, 0.02, 0); strand(W * 0.4, 0.1, 0.99, pal.core || C.W, 1); }
  // streaks along the swing: where the body thins out toward the tail they come loose as feathers
  const seed = a.seed || 1;
  for (let j = 0; j < 6; j++) {
    const e = j / 5, d = (-0.85 + 2 * e) * W, v0 = hash01(seed, j) * 0.45, v1 = 0.7 + hash01(seed, j + 9) * 0.25;
    strand(d, v0, v1, e > 0.9 ? pal.s2 || C.K : pal.s1 || C.R, 1);
  }
  ctx.lineCap = 'butt';
}
/* 천검군림: the wings of blades at the hero's back (only the ones still to fly, and only while it lasts) */
function drawReignWings(p) {
  const R = p.reign; if (!R || R.t >= REIGN.dur) return;
  const open = Math.min(1, R.t / 10), fade = R.t > REIGN.dur - 30 && (globalT & 2) ? 0.5 : 1;
  ctx.globalAlpha = fade;
  for (let i = 0; i < R.left; i++) {
    const w = reignWing(p, i), cx = p.x - p.face * 4, cy = p.y - 30, x = lerp(cx, w.x, open), y = lerp(cy, w.y, open);
    drawRimSword(x - Math.cos(w.a) * 6, y - Math.sin(w.a) * 6, Math.cos(w.a), Math.sin(w.a), 14, p.face, 0.5, C.K, C.R);
  }
  ctx.globalAlpha = 1;
}
/* 무형검: a golden shimmer about the hero while the arm is the blade */
function drawFormlessAura(p) {
  const M = p.formless; if (!M) return;
  const pulse = 0.5 + 0.5 * Math.sin(M.t * 0.3), fade = M.t > (M.dur || FORMLESS.dur) - 40 && (globalT & 4) ? 0.4 : 1;
  ctx.globalAlpha = (0.25 + 0.2 * pulse) * fade; ctx.fillStyle = C.Y; ctx.beginPath(); ctx.ellipse(p.x, p.y - 20, 16 + pulse * 3, 24 + pulse * 3, 0, 0, TAU); ctx.fill();
  ctx.globalAlpha = fade; ctx.strokeStyle = C.Y; ctx.lineWidth = 1; ctx.beginPath(); ctx.ellipse(p.x, p.y - 20, 19 + pulse * 3, 27 + pulse * 3, 0, 0, TAU); ctx.stroke();
  ctx.globalAlpha = 1;
}
/* skill icons (18x18 at x, y) */
const CLASS_ICONS = {
  flash(x, y) { ctx.fillStyle = C.W; ctx.fillRect(x + 1, y + 9, 16, 1); ctx.strokeStyle = C.W; ctx.lineWidth = 1; for (const a of [0.35, -0.7, 1.25]) poly([[x + 12 - Math.cos(a) * 5, y + 9 - Math.sin(a) * 5], [x + 12 + Math.cos(a) * 5, y + 9 + Math.sin(a) * 5]]); ctx.fillStyle = C.K; ctx.fillRect(x + 2, y + 5, 2, 8); },
  bloom(x, y) { for (let i = 0; i < 6; i++) { const a = i / 6 * TAU; ctx.fillStyle = i % 2 ? C.W : C.K; ctx.beginPath(); ctx.ellipse(x + 9 + Math.cos(a) * 5, y + 9 + Math.sin(a) * 5, 3.2, 1.6, a, 0, TAU); ctx.fill(); } ctx.strokeStyle = C.W; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(x + 9, y + 9, 8, 0, TAU); ctx.stroke(); },
  swallow(x, y) { ctx.strokeStyle = C.W; ctx.lineWidth = 1.5; poly([[x + 2, y + 13], [x + 14, y + 3]]); poly([[x + 2, y + 3], [x + 14, y + 13]]); poly([[x + 1, y + 8], [x + 15, y + 8]]); ctx.fillStyle = C.K; ctx.beginPath(); ctx.moveTo(x + 13, y + 11); ctx.lineTo(x + 17, y + 11); ctx.lineTo(x + 15, y + 17); ctx.fill(); },
  reign(x, y) { for (let i = 0; i < 5; i++) { const a = -Math.PI / 2 - 0.9 + i * 0.45; drawBlade(x + 9 + Math.cos(a) * 3, y + 15 + Math.sin(a) * 3, Math.cos(a), Math.sin(a), 11, 3, C.K, C.W); } },
  prison(x, y) { ctx.strokeStyle = C.W; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(x + 9, y + 9, 3, 0, TAU); ctx.stroke(); for (let i = 0; i < 8; i++) { const a = i / 8 * TAU; drawBlade(x + 9 + Math.cos(a) * 9, y + 9 + Math.sin(a) * 9, -Math.cos(a), -Math.sin(a), 5, 2, C.K, C.W); } },
  march(x, y) { ctx.fillStyle = C.K; ctx.fillRect(x, y + 16, 18, 2); ctx.strokeStyle = C.W; ctx.lineWidth = 1; poly([[x + 1, y + 2], [x + 6, y + 3]]); for (const [ox, oy] of [[4, 2], [10, 5]]) drawBlade(x + ox, y + oy, 0.55, 0.83, 14, 4, C.K, C.W); },
  formless(x, y) { ctx.fillStyle = C.Y; ctx.beginPath(); ctx.moveTo(x + 4, y + 3); ctx.quadraticCurveTo(x + 17, y + 9, x + 4, y + 15); ctx.quadraticCurveTo(x + 11, y + 9, x + 4, y + 3); ctx.fill(); ctx.fillStyle = C.W; ctx.fillRect(x + 1, y + 8, 5, 2); ctx.fillStyle = C.K; ctx.fillRect(x + 12, y + 7, 5, 5); },
  domain(x, y) { ctx.strokeStyle = C.W; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(x + 9, y + 9, 7, 0, TAU); ctx.stroke(); ctx.strokeStyle = C.K; for (let i = 0; i < 8; i++) { const a = i / 8 * TAU + 0.2; poly([[x + 9 + Math.cos(a) * 7, y + 9 + Math.sin(a) * 7], [x + 9 + Math.cos(a) * 4, y + 9 + Math.sin(a) * 4]]); } ctx.strokeStyle = C.W; poly([[x + 6, y + 12], [x + 12, y + 6]]); },
  reso(x, y) { drawBlade(x + 9, y + 16, 0, -1, 13, 3, C.K, C.W); ctx.strokeStyle = C.W; ctx.lineWidth = 1; for (const r of [5, 8]) { ctx.beginPath(); ctx.arc(x + 9, y + 9, r, -0.7, 0.7); ctx.stroke(); ctx.beginPath(); ctx.arc(x + 9, y + 9, r, Math.PI - 0.7, Math.PI + 0.7); ctx.stroke(); } },
};
