/* ---------- the Master of Chains' rendering: the hero's own figure made cruel, his violet flame and hazards, the
   three backdrops (black void -> chains wound round it -> the Earth), the story card, the chain-cutting scene and
   the execution ---------- */
// the chains wound round the void: a dim violet so the attacks in front stay readable
const BG_CHAIN = '#4a145e';
/* the hero's look, turned: the same headband, blades, cape and halo, but in the chains' violet and black, a red
   outline and red eyes, and chains hanging from his wrists. the greatsword is exactly the hero's */
function originLook(o) {
  return Object.assign({band: {color: C.P, n: 5}, masterBlades: {n: 5, edge: C.R}, cape: {color: C.P, tatter: true, len: 1.9},
    godHalo: {ring: C.P, blade: C.R, tip: C.K}, eyes: C.R, wristChains: C.P, outline: C.R}, o);
}
const ORIGIN_SWORD = {len: SWORD_LEN, color: C.K, edge: C.W};
/* a run of small links along a list of points */
function linkPath(pts, col, s = 1) {
  ctx.strokeStyle = col; ctx.lineWidth = Math.max(1, 1.2 * s);
  let k = 0, acc = 0;
  for (let i = 1; i < pts.length; i++) {
    const a = pts[i - 1], b = pts[i], L = Math.hypot(b[0] - a[0], b[1] - a[1]); if (L < 0.01) continue;
    const ux = (b[0] - a[0]) / L, uy = (b[1] - a[1]) / L, ang = Math.atan2(uy, ux);
    for (let d = (5 * s - acc) % (5 * s); d < L; d += 5 * s, k++) {
      const x = a[0] + ux * d, y = a[1] + uy * d;
      ctx.beginPath();
      if (k % 2 === 0) ctx.ellipse(x, y, 2.6 * s, 1.5 * s, ang, 0, TAU); else { ctx.moveTo(x - ux * 2.4 * s, y - uy * 2.4 * s); ctx.lineTo(x + ux * 2.4 * s, y + uy * 2.4 * s); }
      ctx.stroke();
    }
    acc = (acc + L) % (5 * s);
  }
}
/* the head, once it is off: the black disc with its red outline, the violet band and a dead red slit for an eye */
function drawSeveredHead(H, sc = 1) {
  ctx.save(); ctx.translate(H.x, H.y); ctx.rotate(H.r);
  ctx.fillStyle = C.R; disc(0, 0, 5.6 * sc);
  ctx.fillStyle = C.K; disc(0, 0, 4.4 * sc);
  ctx.strokeStyle = C.P; ctx.lineWidth = 1.3 * sc; ctx.lineCap = 'butt'; poly([[-4.4 * sc, -1.2 * sc], [4.4 * sc, -1.2 * sc]]); ctx.lineCap = 'round';
  ctx.lineWidth = 1.2 * sc; poly([[-3 * sc, -1 * sc], [-7 * sc, 0.5 * sc], [-9.5 * sc, 2.5 * sc]]);
  ctx.fillStyle = C.R; ctx.fillRect(Math.round(1 * sc), Math.round(0.2 * sc), Math.max(1, Math.round(2.4 * sc)), 1);
  ctx.restore();
}
/* 천검 소환's sigil at his back: a violet ring of runes turning */
function drawOriginSigil(b) {
  const cx = b.x - b.face * 4, cy = b.y - 34, k = Math.min(1, (90 - b.sigT) / 10, b.sigT / 12), r = 30 * k, a0 = globalT * 0.05;
  if (r < 1) return;
  ctx.strokeStyle = C.P; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.ellipse(cx, cy, r, r * 0.9, 0, 0, TAU); ctx.stroke();
  ctx.lineWidth = 1; ctx.beginPath(); ctx.ellipse(cx, cy, r * 0.72, r * 0.65, 0, 0, TAU); ctx.stroke();
  for (let i = 0; i < 8; i++) { const a = a0 + i * TAU / 8; poly([[cx + Math.cos(a) * r * 0.72, cy + Math.sin(a) * r * 0.65], [cx + Math.cos(a) * r, cy + Math.sin(a) * r * 0.9]]); }
  ctx.strokeStyle = C.W; for (let i = 0; i < 3; i++) { const a = -a0 * 1.4 + i * TAU / 3; poly([[cx + Math.cos(a) * r * 0.72, cy + Math.sin(a) * r * 0.65], [cx + Math.cos(a + 2.1) * r * 0.72, cy + Math.sin(a + 2.1) * r * 0.65]]); }
}
/* a jagged tear in the sky that 천붕검's swords come out of */
function skyRift(x, y, open, dir) {
  if (open <= 0) return;
  const w = 20 * open, h = 5 * open, a = -dir * 0.5, c = Math.cos(a), s = Math.sin(a), pt = (u, v) => [x + c * u - s * v, y + s * u + c * v];
  const shape = (e) => { ctx.beginPath(); [[-w - e, 0], [-w * 0.5, -h - e], [0, -h * 0.6 - e], [w * 0.5, -h - e], [w + e, 0], [w * 0.5, h + e], [0, h * 0.6 + e], [-w * 0.5, h + e]].forEach((q, i) => { const p = pt(q[0], q[1]); i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]); }); ctx.closePath(); ctx.fill(); };
  ctx.fillStyle = C.P; shape(2); ctx.fillStyle = C.K; shape(0);
}
function skySword(f) {
  const x0 = f.x - f.dir * 110, y0 = 36, L = f.big ? 64 : 40, dx = f.x - x0, dy = FLOOR - y0, dl = Math.hypot(dx, dy), ux = dx / dl, uy = dy / dl;
  return {x0, y0, L, ux, uy};
}
/* the warnings go under everything else of his */
function drawOriginWarnings(b, pulse) {
  const p = player;
  if (b.state === 'pierce' && b.fired !== -1 && !b.dashing && b.pTo != null) {
    ctx.globalAlpha = 0.7; ctx.strokeStyle = pulse ? C.P : C.R; ctx.lineWidth = 1; ctx.setLineDash([3, 3]); poly([[b.x, b.y - 20], [b.pTo, b.y - 20]]); ctx.setLineDash([]); ctx.globalAlpha = 1;
  }
  if (b.state === 'bloom') {
    const warn = Math.round(30 * (b.p3 ? 0.75 : b.phase === 2 ? 0.88 : 1));
    ctx.save(); ctx.beginPath(); ctx.rect(0, 0, W, FLOOR + 1); ctx.clip();
    ctx.strokeStyle = b.st < warn ? (pulse ? C.P : C.R) : C.P; ctx.lineWidth = 1; ctx.setLineDash([2, 3]);
    ctx.beginPath(); ctx.arc(b.x, b.y - 20, b.bR, 0, TAU); ctx.stroke(); ctx.setLineDash([]); ctx.restore();
  }
  for (const f of b.fx) {
    if (f.type === 'sky') {
      const open = Math.min(1, f.t / 8) * (f.t > f.warn + 10 ? Math.max(0, 1 - (f.t - f.warn - 10) / 10) : 1), S = skySword(f), r = f.big ? 34 : 20;
      skyRift(S.x0, S.y0, open, f.dir);
      if (f.t < f.warn) { ctx.strokeStyle = (globalT >> 2) & 1 ? C.P : C.R; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.ellipse(f.x, FLOOR - 1, r, 4, 0, 0, TAU); ctx.stroke(); if (f.big && pulse) text('!', f.x, FLOOR - 30, {sc: 2, color: C.P, outline: C.W, align: 'center'}); }
    } else if (f.type === 'cutmark' && f.t < f.warn) {
      const k = f.t / f.warn, c = Math.cos(f.ang) * f.r * 1.3 * k, s = Math.sin(f.ang) * f.r * 1.3 * k;
      ctx.strokeStyle = (globalT >> 1) & 1 ? C.P : C.W; ctx.lineWidth = 1; poly([[f.x - c, f.y - s], [f.x + c, f.y + s]]);
    } else if (f.type === 'blade' && f.state === 'form' && f.t > f.fire - 14) {
      ctx.globalAlpha = 0.6; ctx.strokeStyle = pulse ? C.P : C.R; ctx.lineWidth = 1; ctx.setLineDash([2, 3]);
      poly([[f.x, f.y], [f.x + Math.cos(f.ang) * 150, f.y + Math.sin(f.ang) * 150]]); ctx.setLineDash([]); ctx.globalAlpha = 1;
    }
  }
  if (b.state === 'ult') {
    // his 일검무귀: the line of the cut to come flickers across the world; then the cut itself; then a hairline
    const t = b.st, y = b.ultY;
    ctx.lineCap = 'butt';
    if (t >= OU.cut - 36 && t < OU.cut) { ctx.globalAlpha = 0.4 + 0.4 * ((t >> 2) & 1); ctx.strokeStyle = C.P; ctx.lineWidth = 1; poly([[0, y], [W, y]]); ctx.globalAlpha = 1; }
    else if (t >= OU.cut && t < OU.cut + 4) { ctx.strokeStyle = C.K; ctx.lineWidth = 6; poly([[0, y], [W, y]]); ctx.strokeStyle = C.P; ctx.lineWidth = 4; poly([[0, y], [W, y]]); ctx.strokeStyle = C.W; ctx.lineWidth = 1.5; poly([[0, y], [W, y]]); }
    else if (t >= OU.cut + 4 && t < OU.blast) { ctx.strokeStyle = (t & 4) ? C.W : C.P; ctx.lineWidth = 1; poly([[0, y], [W, y]]); }
    ctx.lineCap = 'round';
  }
}
/* the sword-waves, the summoned greatswords, the sky swords, the path of 섬광일섬 and the torn line of 일검무귀 */
function drawOriginFx(b) {
  for (const f of b.fx) {
    switch (f.type) {
      case 'wave': {
        const d = Math.sign(f.vx), h = f.hh + 3, x = f.x, y = f.y;
        const cres = (e, bul, back) => { ctx.beginPath(); ctx.moveTo(x - d * 2, y - h - e); ctx.quadraticCurveTo(x + d * (bul + e), y, x - d * 2, y + h + e); ctx.quadraticCurveTo(x + d * back, y, x - d * 2, y - h - e); ctx.fill(); };
        ctx.fillStyle = C.K; cres(1.5, 9, 1); ctx.fillStyle = C.P; cres(0, 8, 2); ctx.fillStyle = C.W; cres(-2, 6, 3);
        break;
      }
      case 'blade': {
        const c = Math.cos(f.ang), s = Math.sin(f.ang);
        if (f.state === 'fly' && f.trail.length > 1) { ctx.strokeStyle = C.P; ctx.lineWidth = 2; poly(f.trail.concat([[f.x, f.y]])); }
        const L = 18 * (f.state === 'form' ? f.grow : 1);
        if (L > 1) drawRimSword(f.x - c * L * 0.4, f.y - s * L * 0.4, c, s, L, c >= 0 ? 1 : -1, 0.6, C.K, C.P);
        if (f.state === 'stuck' && b.bDet > 0 && (globalT & 2)) { ctx.fillStyle = C.W; disc(f.x, f.y, 2); }
        break;
      }
      case 'sky': {
        if (f.t < f.warn - 8) break;
        const S = skySword(f), u = clamp((f.t - (f.warn - 8)) / 8, 0, 1), ex = lerp(S.x0, f.x, u), ey = lerp(S.y0, FLOOR, u) + (u >= 1 ? 6 : 0);
        ctx.globalAlpha = f.t > f.warn + 18 ? Math.max(0, 1 - (f.t - f.warn - 18) / 12) : 1;
        if (u < 1) { ctx.strokeStyle = C.P; ctx.lineWidth = 1.5; poly([[ex - S.ux * S.L * 2.2, ey - S.uy * S.L * 2.2], [ex - S.ux * S.L, ey - S.uy * S.L]]); }
        drawRimSword(ex - S.ux * S.L, ey - S.uy * S.L, S.ux, S.uy, S.L, S.ux >= 0 ? 1 : -1, f.big ? 1.5 : 1, C.K, C.P);
        ctx.globalAlpha = 1;
        break;
      }
      case 'streak': {
        const k = 1 - f.t / 12; if (k <= 0) break;
        ctx.lineCap = 'butt';
        ctx.strokeStyle = C.K; ctx.lineWidth = 8 * k + 1; poly([[f.x0, f.y], [f.x1, f.y]]);
        ctx.strokeStyle = C.P; ctx.lineWidth = 6 * k + 0.5; poly([[f.x0, f.y], [f.x1, f.y]]);
        ctx.strokeStyle = C.W; ctx.lineWidth = 2 * k + 0.5; poly([[f.x0, f.y], [f.x1, f.y]]);
        ctx.lineCap = 'round';
        break;
      }
      case 'rip': {
        const k = 1 - f.t / 26; if (k <= 0) break;
        ctx.lineCap = 'butt';
        ctx.strokeStyle = C.K; ctx.lineWidth = 18 * k + 2; poly([[-10, f.y], [W + 10, f.y]]);
        ctx.strokeStyle = C.P; ctx.lineWidth = 14 * k + 1; poly([[-10, f.y], [W + 10, f.y]]);
        ctx.strokeStyle = C.W; ctx.lineWidth = 4 * k + 0.5; poly([[-10, f.y], [W + 10, f.y]]);
        ctx.lineCap = 'round';
        break;
      }
    }
  }
}
// how long each move keeps its "!" over his head
const ORIGIN_EXCL = {combo: 0, pierce: 16, blades: 10, fury: 12, peak: 14, rise: 5, flash: 16, bloom: 20, sky: 12};
function drawOrigin() {
  const b = boss, pulse = (globalT >> 2) & 1;
  drawOriginWarnings(b, pulse);
  if (b.alpha <= 0) return;
  ctx.globalAlpha = b.alpha;
  if (b.sigT > 0) drawOriginSigil(b);
  for (const a of b.barcs) drawSlashArc(a);
  for (const a of b.arcs) { a.cx = b.x + a.ox; a.cy = b.y + a.oy; drawFlameArc(a); }
  let col = C.K, out = C.R;
  if (b.flash > 0 && (b.flash & 2)) col = C.W;
  else if (b.p3 && (globalT & 8)) out = C.W;
  const q = bossPose(b), face = q.flip ? -b.face : b.face, dead = b.state === 'dead';
  const tremble = dead && b.lookUp && !b.headless && !b.hushed ? Math.round(rnd(-0.7, 0.7)) :b.p3 && !dead && b.state !== 'stun' ? Math.round(rnd(-0.6, 0.6)) : 0;
  // his 일검무귀 drinks the blade blood red and longer, like the hero's
  const k = b.state === 'ult' && b.igPh ? clamp(b.st / OU.cut, 0, 1) : 0;
  const sword = dead ? null : k > 0 ? {len: originSwordLen(b), w: 1 + 0.5 * k, color: '#' + hex2(110 * k) + '00' + hex2(12 * k), edge: k > 0.3 ? C.R : C.W} : Object.assign({}, ORIGIN_SWORD, {color: col});
  // beaten, his greatsword stands in the floor beside him
  if (dead) drawGreatsword(b.x - b.face * 20, FLOOR - 36, -b.face * 0.12, 0.99, SWORD_LEN, b.face, 1, C.K, C.W);
  const P = drawFigure(b.x + tremble, b.y, face, q, originLook({color: col, outline: out, t: b.animT, sword, headless: b.headless}));
  ctx.globalAlpha = b.alpha;
  if (b.head) {
    // in the slow motion the head leaves a short smear of itself
    b.head.trail.forEach((q, i) => { ctx.globalAlpha = b.alpha * 0.15 * (i + 1); drawSeveredHead({x: q[0], y: q[1], r: q[2]}); });
    ctx.globalAlpha = b.alpha; drawSeveredHead(b.head);
  }
  ctx.globalAlpha = 1;
  if (b.state === 'stun') for (let i = 0; i < 3; i++) { const a = b.animT * 0.12 + i * TAU / 3; starShape(P.head[0] + Math.cos(a) * 11, P.head[1] - 12 + Math.sin(a) * 3); }
  const ex = ORIGIN_EXCL[b.state];
  if (ex != null && (b.state === 'combo' ? b.cT >= 0 && b.cstep === 0 : b.st < ex) && pulse) text('!', P.head[0], P.head[1] - 26, {sc: 2, color: C.P, outline: C.W, align: 'center'});
  drawOriginFx(b);
}

/* ---------- backdrops ---------- */
/* chains wound round the void in phase 2: each grows from its end across the screen (prog 0..1), and a coil of
   links winds tighter in each corner. cut chains (during the cutscene) split at the cut and fall apart */
function spiralLinks(g, cx, cy, r0, r1, a0, turns, prog, col) {
  const total = turns * TAU, n = Math.floor(total * (r0 + r1) / 2 / 7 * prog);
  g.strokeStyle = col; g.lineWidth = 1.6;
  for (let i = 0; i < n; i++) {
    const u = i / Math.max(1, total * (r0 + r1) / 2 / 7), a = a0 + u * total, r = lerp(r0, r1, u), x = cx + Math.cos(a) * r, y = cy + Math.sin(a) * r;
    g.beginPath();
    if (i % 2 === 0) g.ellipse(x, y, 4, 2.3, a + Math.PI / 2, 0, TAU); else { const tx = -Math.sin(a), ty = Math.cos(a); g.moveTo(x - tx * 3.4, y - ty * 3.4); g.lineTo(x + tx * 3.4, y + ty * 3.4); }
    g.stroke();
  }
}
function originChainsTo(g, mix, cut) {
  ORIGIN_CHAINS.forEach((c, i) => {
    const pr = clamp(mix * 1.5 - i * 0.05, 0, 1); if (pr <= 0) return;
    const cr = cut && cut[i];
    if (cr) {
      const age = sceneT - cr.t0; if (age > 44) return;
      g.globalAlpha = Math.max(0, 1 - age / 44);
      const cx = lerp(c[0], c[2], cr.u), cy = lerp(c[1], c[3], cr.u), fall = age * age * 0.05, drift = age * 0.9, dx = Math.sign(c[2] - c[0]) || 1;
      thickChain(g, c[0] - dx * drift, c[1] + fall, cx - dx * (drift + 4), cy + fall, BG_CHAIN, 1.15);
      thickChain(g, cx + dx * (drift + 4), cy + fall * 1.2, c[2] + dx * drift, c[3] + fall * 1.2, BG_CHAIN, 1.15);
      g.globalAlpha = 1;
      return;
    }
    const ex = lerp(c[0], c[2], pr), ey = lerp(c[1], c[3], pr);
    thickChain(g, c[0], c[1], ex, ey, BG_CHAIN, 1.15);
    if (pr < 1) { g.fillStyle = C.W; g.beginPath(); g.arc(ex, ey, 2.5, 0, TAU); g.fill(); }
  });
  const cp = clamp(mix * 1.6 - 0.4, 0, 1);
  if (cp > 0 && !(cut && cut.all)) for (const [cx, cy, a0] of [[0, 0, 0.3], [W, 0, 1.9], [0, H, -1.2], [W, H, 3.6]]) spiralLinks(g, cx, cy, 86, 18, a0, 2.2, cp, BG_CHAIN);
}
const bgOriginChains = mk(), bgOriginEarth = mk();
originChainsTo(bgOriginChains.getContext('2d'), 1, null);
/* the Earth, free of its prison, filling the sky behind the last struggle */
function paintOriginEarth(g, rng) {
  g.fillStyle = C.K; g.fillRect(0, 0, W, H);
  for (let i = 0; i < 170; i++) { g.fillStyle = rng() < 0.8 ? C.W : [C.Y, C.B, C.R][i % 3]; g.fillRect(Math.round(rng() * W), Math.round(rng() * H), 1, 1); }
  const cx = 240, cy = 122, r = 90;
  g.fillStyle = '#10205e'; g.beginPath(); g.arc(cx, cy, r + 9, 0, TAU); g.fill();
  g.save(); g.beginPath(); g.arc(cx, cy, r, 0, TAU); g.clip();
  g.fillStyle = C.B; g.fillRect(cx - r, cy - r, r * 2, r * 2);
  for (const [lx, ly, n] of [[-40, -30, 9], [30, 10, 11], [-20, 50, 6], [50, -50, 5]]) for (let i = 0; i < n; i++) {
    const x = cx + lx + (rng() - 0.5) * 50, y = cy + ly + (rng() - 0.5) * 34;
    g.fillStyle = C.G1; g.beginPath(); g.ellipse(x, y, 8 + rng() * 14, 5 + rng() * 9, rng() * 3, 0, TAU); g.fill();
    g.fillStyle = C.G2; g.beginPath(); g.ellipse(x - 2, y - 2, 4 + rng() * 6, 2 + rng() * 4, rng() * 3, 0, TAU); g.fill();
  }
  for (let i = 0; i < 60; i++) { g.fillStyle = C.W; g.beginPath(); g.ellipse(cx + (rng() - 0.5) * r * 2, cy + (rng() - 0.5) * r * 2, 4 + rng() * 16, 1 + rng() * 2.2, rng() * 0.4 - 0.2, 0, TAU); g.fill(); }
  // the night side
  g.globalAlpha = 0.55; g.fillStyle = C.K; g.beginPath(); g.arc(cx + 46, cy + 30, r * 1.05, 0, TAU); g.fill(); g.globalAlpha = 1;
  g.restore();
  g.strokeStyle = '#8fa0e6'; g.lineWidth = 4; g.beginPath(); g.arc(cx, cy, r - 2, 0, TAU); g.stroke();
  g.strokeStyle = C.W; g.lineWidth = 1.5; g.beginPath(); g.arc(cx, cy, r, 0, TAU); g.stroke();
  g.strokeStyle = C.Y; g.lineWidth = 2; g.beginPath(); g.arc(cx, cy, r + 3, 3.3, 4.7); g.stroke();
  // what is left of the belt of chains: broken runs across the front of the planet
  for (let a = 0.15, k = 0; a < Math.PI - 0.15; a += 0.06, k++) {
    if (k % 10 < 4) continue;
    const x = cx + Math.cos(a) * (r + 30), y = cy + 14 + Math.sin(a) * 22;
    g.save(); g.translate(x, y); g.rotate(a + Math.PI / 2 + 0.2);
    g.strokeStyle = VIOLET; g.lineWidth = 1.6; g.beginPath(); if (k % 2) g.ellipse(0, 0, 4, 2.3, 0, 0, TAU); else { g.moveTo(-3.4, 0); g.lineTo(3.4, 0); } g.stroke();
    g.restore();
  }
  // the floor: shattered black glass of the old void
  g.fillStyle = C.K; g.fillRect(0, FLOOR, W, H - FLOOR);
  g.fillStyle = C.W; g.fillRect(0, FLOOR, W, 1);
  g.strokeStyle = C.P; g.lineWidth = 1;
  for (let i = 0; i < 12; i++) { let x = rng() * W, y = FLOOR + 3 + rng() * 20; g.beginPath(); g.moveTo(x, y); for (let j = 0; j < 3; j++) { x += (rng() - 0.5) * 24; y += (rng() - 0.5) * 6; g.lineTo(x, y); } g.stroke(); }
  for (let i = 0; i < 30; i++) { g.fillStyle = rng() < 0.5 ? C.P : C.W; g.fillRect(Math.round(rng() * W), Math.round(FLOOR + 4 + rng() * (H - FLOOR - 6)), 1, 1); }
}
paintOriginEarth(bgOriginEarth.getContext('2d'), seeded(505));
function drawOriginBg(mix) {
  const b = boss;
  if (b.p3) {
    ctx.drawImage(bgOriginEarth, 0, 0);
    // the void cracks and falls away in pieces
    if (o3 && o3.pieces) for (const q of o3.pieces) {
      if (q.y > H + 60) continue;
      ctx.save(); ctx.translate(q.x, q.y); ctx.rotate(q.r);
      ctx.beginPath(); q.pts.forEach((p, i) => i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])); ctx.closePath();
      ctx.fillStyle = C.K; ctx.fill(); ctx.strokeStyle = sceneT - O3.shatter > q.delay ? C.P : C.W; ctx.lineWidth = 1; ctx.stroke();
      ctx.restore();
    }
    return;
  }
  ctx.fillStyle = C.K; ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = C.W; ctx.fillRect(0, FLOOR, W, 1);
  if (mix <= 0) return;
  if (mix >= 1 && !o3) { ctx.drawImage(bgOriginChains, 0, 0); return; }
  const cut = o3 ? {all: o3.final >= 0} : null;
  if (o3) for (const c of o3.cuts) cut[c.i] = c;
  originChainsTo(ctx, mix, cut);
}

/* ---------- the story card before the hidden fight ---------- */
const ORIGIN_STORY = ['지구의 중심. 모든 사슬이 시작되는 곳.', '사슬의 군주가 "주인"이라 부르던 자가 그곳에 있다.', '스스로를 신이라 부르며, 세상을 사슬로 묶은 자.', '...그리고 그 기척은, 어딘가 익숙했다.'];
const OI = {line0: 16, step: 84, reveal: 372, end: 480};
function updOriginIntro() {
  const t = sceneT;
  ORIGIN_STORY.forEach((s, i) => { const t0 = OI.line0 + i * OI.step; if (t > t0 && t < t0 + s.length * 2 && t % 4 === 0) SND.sfx.text(); if (t === t0) SND.sfx.chain(); });
  if (t === OI.reveal) { SND.sfx.boom(); SND.sfx.brk(); flash = {a: 1, color: C.W}; shake(8); }
  decayFx();
  if (t >= OI.end) setScene('entrance');
  else if (t > 24 && confirmP()) { if (t < OI.reveal) setScene('intro', OI.reveal - 1); else setScene('entrance'); }
}
function drawOriginIntro(t) {
  ctx.fillStyle = C.K; ctx.fillRect(0, 0, W, H);
  const k = clamp(t / OI.reveal, 0, 1);
  ctx.globalAlpha = t < OI.reveal ? 0.55 : 1; originChainsTo(ctx, k * 0.95 + (t >= OI.reveal ? 1 : 0), null); ctx.globalAlpha = 1;
  if (t < OI.reveal) {
    ORIGIN_STORY.forEach((s, i) => { const n = Math.floor((t - OI.line0 - i * OI.step) / 2); if (n > 0) text(s.slice(0, n), 240, 70 + i * 30, {sc: 2, color: i === 3 ? C.R : C.W, align: 'center'}); });
  } else {
    const u = easeOut(clamp((t - OI.reveal) / 20, 0, 1)), j = t - OI.reveal < 16 ? rnd(-2, 2) : 0;
    ctx.globalAlpha = 0.8; ctx.fillStyle = C.K; ctx.fillRect(0, 60, W, 120); ctx.globalAlpha = 1;
    text('???', 240 + j, lerp(40, 70, u), {sc: 8, color: C.W, outline: C.P, ow: 2, align: 'center'});
    if (t > OI.reveal + 18) {
      const v = easeOut(clamp((t - OI.reveal - 18) / 16, 0, 1));
      ctx.fillStyle = C.P; ctx.fillRect(Math.round(240 - 160 * v), 132, Math.round(320 * v), 2);
      text('히든 보스  ·  사슬의 주인', 240, 140, {sc: 2, color: C.W, align: 'center'});
      ktext('MASTER OF CHAINS', 240, 160, {sc: 'serif', color: C.P, outline: C.W, align: 'center'});
    }
  }
  if (t > 24 && t < OI.end - 20 && ((t >> 5) & 1)) text('ENTER 건너뛰기', 474, 258, {color: C.W, align: 'right'});
}

/* ---------- the chain-cutting cutscene between phase 2 and 3 (drawn over the world) ---------- */
function drawOrigin3() {
  const t = sceneT;
  drawWorld();
  if (!o3) return;
  for (const c of o3.cuts) { const age = t - c.t0; if (age < 10) cutLine(c.cx, c.cy, c.ang, 1 - age / 10); }
  if (o3.final >= 0 && t < O3.shatter) {
    const age = t - o3.final, open = easeOut(Math.min(1, age / 6));
    sliceScreen(W / 2, H / 2 - 4, 0, open * 20, open * 12);
    ctx.lineCap = 'butt'; ctx.globalAlpha = 0.7; ctx.strokeStyle = C.P; ctx.lineWidth = 14 * open; poly([[0, H / 2 - 4], [W, H / 2 - 4]]);
    ctx.globalAlpha = 1; ctx.strokeStyle = C.W; ctx.lineWidth = 2; poly([[0, H / 2 - 4], [W, H / 2 - 4]]); ctx.lineCap = 'round';
  }
  // letterbox with the two lines in it: his cry, then the hero's answer
  if (t < O3.final) {
    const bh = Math.round(clamp(t / 10, 0, 1) * 24);
    ctx.fillStyle = C.K; ctx.fillRect(0, 0, W, bh); ctx.fillRect(0, H - bh, W, bh);
    ctx.fillStyle = C.P; ctx.fillRect(0, bh, W, 1); ctx.fillRect(0, H - bh - 1, W, 1);
    const say = (s, t0, col, who) => { const n = Math.floor((t - t0) * 1.2); if (n > 0) { text(who, 12, H - 19, {color: col}); text(s.slice(0, n), 240, H - 19, {color: C.W, align: 'center'}); } };
    if (t >= 6 && t < 50) say('안 돼... 내 사슬을, 모조품 따위가!', 6, C.P, stage.boss);
    else if (t >= 52) say('이 사슬은... 여기서 끝이다!', 52, C.R, heroClass().name);
  }
  drawBigText();
}

/* ---------- the execution (drawn over the world) ---------- */
// the camera closes in on the two of them as the hero walks up, and stays close to the end
function execView(t) {
  const b = boss, p = player, u = clamp((t - 6) / 40, 0, 1);
  let z = 1 + 1.3 * u * u * (3 - 2 * u);
  // the silence creeps the camera in; the cut punches it; it eases back once the sound returns
  z += 0.35 * easeOut(clamp((t - EX.hush) / (EX.cut - EX.hush), 0, 1)) * (t < EX.slowEnd ? 1 : Math.max(0, 1 - (t - EX.slowEnd) / 24));
  if (t >= EX.cut) z += 0.45 * Math.max(0, 1 - (t - EX.cut) / 14);
  const cx = (p.x + b.x) / 2, cy = FLOOR - 30;
  return {z, x0: clamp(cx - W / 2 / z, 0, W - W / z), y0: clamp(cy - H * 0.5 / z, 0, H - H / z)};
}
function drawExecute() {
  const t = sceneT, b = boss, p = player, v = execView(t);
  ctx.save(); ctx.scale(v.z, v.z); ctx.translate(-v.x0, -v.y0);
  drawExecuteWorld(t, b, p);
  ctx.restore();
  // the picture slips apart along the cut for a moment
  if (ex && ex.cutY != null && t >= EX.cut + 3 && t < EX.cut + 18) {
    const k = t - EX.cut - 3, open = k < 4 ? easeOut(k / 4) : Math.max(0, 1 - (k - 4) / 11);
    if (open > 0) sliceScreen(W / 2, (ex.cutY - v.y0) * v.z, 0, open * 16, open * 5);
  }
  drawExecuteBars(t);
}
function drawExecuteWorld(t, b, p) {
  if (t >= EX.cut && t <= EX.cut + 2) {
    // three impact frames: flat white, black, then blood red, the two of them in silhouette and the crescent of the cut
    const k = t - EX.cut, bg = [C.W, C.K, C.R][k], fg = [C.K, C.W, C.K][k], q = bossPose(b), J = solve(q), X = figXform(b.x, b.y, b.face, q, 1), nk = X.T(J.neck), y = nk[1] - 3;
    ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);
    drawFigure(b.x, b.y, b.face, q, {color: fg, band: true, cape: {color: fg, tatter: true, len: 1.9}, t: b.animT, headless: b.headless});
    if (b.head) { ctx.fillStyle = fg; disc(b.head.x, b.head.y, 5); }
    drawFigure(p.x, p.y, p.face, playerPose(p), {color: fg, band: true, t: p.animT, sword: {len: SWORD_LEN, color: fg}});
    const x0 = p.x, x1 = b.x - ex.side * 80, mid = (x0 + x1) / 2;
    ctx.fillStyle = fg; ctx.beginPath(); ctx.moveTo(x0, y + 4); ctx.quadraticCurveTo(mid, y - 26, x1, y - 2); ctx.quadraticCurveTo(mid, y - 8, x0, y + 4); ctx.fill();
    return;
  }
  drawWorld();
  // the line of the cut hangs in the air through the slow motion, then bursts when the sound comes back
  if (ex && ex.cutY != null) {
    const y = ex.cutY;
    ctx.lineCap = 'butt';
    if (t < EX.slowEnd) { ctx.strokeStyle = (t >> 2) & 1 ? C.R : C.W; ctx.lineWidth = 1; poly([[-10, y], [W + 10, y]]); }
    else if (t < EX.slowEnd + 22) {
      const k = 1 - (t - EX.slowEnd) / 22;
      ctx.strokeStyle = C.K; ctx.lineWidth = 12 * k + 1; poly([[-10, y], [W + 10, y]]);
      ctx.strokeStyle = C.R; ctx.lineWidth = 9 * k + 1; poly([[-10, y], [W + 10, y]]);
      ctx.strokeStyle = C.W; ctx.lineWidth = 3 * k + 0.5; poly([[-10, y], [W + 10, y]]);
    }
    ctx.lineCap = 'round';
  }
}
function drawExecuteBars(t) {
  // the letterbox closes in through the silence and opens again when the sound returns
  const tight = clamp((t - EX.hush) / 16, 0, 1) * (t < EX.slowEnd ? 1 : Math.max(0, 1 - (t - EX.slowEnd) / 12));
  const bh = Math.round(clamp(t / 12, 0, 1) * 26 + tight * 16);
  ctx.fillStyle = C.K; ctx.fillRect(0, 0, W, bh); ctx.fillRect(0, H - bh, W, bh);
  ctx.fillStyle = C.P; ctx.fillRect(0, bh, W, 1); ctx.fillRect(0, H - bh - 1, W, 1);
  // his last words (the trembling stops when everything goes quiet)
  if (t >= EX.say && t < EX.cut) {
    const s = '안 돼...', n = Math.floor((t - EX.say) / 5), j = t < EX.hush ? Math.round(rnd(-1, 1)) : 0;
    text(stage.boss, 12, H - 19, {color: C.P});
    text(s.slice(0, n), 240 + j, H - 19, {color: C.W, align: 'center'});
  }
  if (t > EX.topple + 20 && ((t >> 5) & 1)) text('ENTER', 470, 4, {color: C.W, align: 'right'});
}
/* boss card icons for him: the hero's own five - the combo, phantom pierce, 천검 소환, 검기 오연참, 검산 - in violet */
function originIcon(i, x, y) {
  ctx.fillStyle = C.W; ctx.fillRect(x - 1, y - 1, 22, 22); ctx.fillStyle = C.P; ctx.fillRect(x, y, 20, 20);
  drawIcon(['slash', 'dash', 'blades', 'fury', 'peak'][i], x + 1, y + 1);
}
