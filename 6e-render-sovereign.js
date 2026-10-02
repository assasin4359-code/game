/* ---------- Chain Sovereign rendering: the figure, its sigil, the chain wheel, stolen blades, chains and slices ---------- */
function sovLook(o) {
  return Object.assign({cape: {color: '#5a0008', tatter: true, len: 2.1}, halo: {color: VIOLET}, crown: C.K, eyes: C.R, wristChains: C.K,
    gsword: {color: C.R, edge: C.K, len: 40}}, o);
}
function drawEnemySigil(s) {
  const open = easeOut(Math.min(1, s.t / 10)), r = 28 * open, a0 = s.t * 0.06;
  ctx.save(); ctx.translate(Math.round(s.x), Math.round(s.y));
  ctx.globalAlpha = 0.35; ctx.fillStyle = C.K; ctx.beginPath(); ctx.ellipse(0, 0, r, r * 0.92, 0, 0, TAU); ctx.fill(); ctx.globalAlpha = 1;
  ctx.lineWidth = 1.5; ctx.strokeStyle = C.R; ctx.beginPath(); ctx.arc(0, 0, r, 0, TAU); ctx.stroke();
  ctx.lineWidth = 1; ctx.strokeStyle = C.K; ctx.beginPath(); ctx.arc(0, 0, r * 0.74, 0, TAU); ctx.stroke();
  for (let k = 0; k < 12; k++) { const a = a0 + k * TAU / 12, l = k % 3 ? 3 : 6; poly([[Math.cos(a) * r, Math.sin(a) * r], [Math.cos(a) * (r + l), Math.sin(a) * (r + l)]]); }
  ctx.strokeStyle = C.R;
  for (const off of [0, Math.PI]) { ctx.beginPath(); for (let k = 0; k <= 3; k++) { const a = -a0 * 1.5 + off + k * TAU / 3; const px = Math.cos(a) * r * 0.72, py = Math.sin(a) * r * 0.72; k ? ctx.lineTo(px, py) : ctx.moveTo(px, py); } ctx.stroke(); }
  ctx.restore();
}
/* a chain drawn along a segment, links alternating, dark with a red glint */
/* red links with a black rim, so the Sovereign's chains never read as the hall's hanging black ones */
function chainSeg(x0, y0, x1, y1, s = 0.8, col = C.R) {
  const L = Math.hypot(x1 - x0, y1 - y0); if (L < 2) return;
  ctx.globalAlpha = 0.9; ctx.strokeStyle = C.K; ctx.lineWidth = 3.5 * s; ctx.lineCap = 'round'; poly([[x0, y0], [x1, y1]]); ctx.globalAlpha = 1;
  heavyChain(ctx, x0, y0, x1, y1, col, s);
  ctx.strokeStyle = C.W; ctx.lineWidth = 0.8; ctx.globalAlpha = 0.7; poly([[x0, y0], [x1, y1]]); ctx.globalAlpha = 1;
}
function drawSovereign() {
  const b = boss, pulse = (globalT >> 2) & 1;
  if (b.sig) drawEnemySigil(b.sig);
  if (b.state === 'orbit' && b.spokeL > 1) {
    const px = b.x, py = b.y - 24;
    for (let k = 0; k < 3; k++) {
      const a = b.spokeA + k * TAU / 3, ex = px + Math.cos(a) * b.spokeL, ey = py + Math.sin(a) * b.spokeL;
      if (b.spokesLive) chainSeg(px, py, ex, ey, 0.9);
      else { ctx.strokeStyle = pulse ? C.R : C.W; ctx.lineWidth = 1; ctx.setLineDash([3, 3]); poly([[px, py], [ex, ey]]); ctx.setLineDash([]); }
    }
    ctx.fillStyle = C.R; disc(px, py, 4); ctx.fillStyle = C.K; disc(px, py, 2);
  }
  if (b.state === 'slam' && !b.onGround && b.st > 12) { ctx.strokeStyle = pulse ? C.R : C.K; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.ellipse(b.x + b.vx * 6, FLOOR - 1, 36, 5, 0, 0, TAU); ctx.stroke(); }
  if (b.alpha <= 0) return;
  let col = C.K, out = C.W;
  if (b.flash > 0 && (b.flash & 2)) { col = C.W; out = C.R; }
  drawBladeSmear(b.ktrail, SMEAR_RED);
  ctx.globalAlpha = b.alpha;
  const P = drawFigure(b.x, b.y, b.face, bossPose(b), sovLook({color: col, outline: out, t: b.animT}));
  ctx.globalAlpha = 1;
  if (b.state === 'stun') for (let i = 0; i < 3; i++) { const a = b.animT * 0.12 + i * TAU / 3; starShape(P.head[0] + Math.cos(a) * 12, P.head[1] - 12 + Math.sin(a) * 3); }
  const excl = (b.state === 'lash' && ((b.st - 1) % ((b.phase === 2 ? 20 : 26) + 22)) < 12) || (b.state === 'slam' && b.st < 12) || (b.state === 'waves' && b.st < 14)
    || (b.state === 'mountain' && b.st < 12) || (b.state === 'prison' && b.st < 16) || (b.state === 'meteor' && b.st < 16);
  if (excl && pulse) text('!', P.head[0], P.head[1] - 26, {sc: 2, color: C.R, outline: C.W, align: 'center'});
}
const SMEAR_RED = {fill: C.R, fill2: '#f08a92', rim: C.K, core: C.W};
function drawEBlade(a) {
  const len = 26 * (a.grow != null ? a.grow : 1); if (len < 1) return;
  const ang = a.form > 0 ? a.ang : Math.atan2(a.vy, a.vx), dx = Math.cos(ang), dy = Math.sin(ang);
  if (!a.form && a.trail.length > 1) {
    const pts = a.trail.concat([[a.x, a.y]]);
    ctx.lineCap = 'round'; ctx.strokeStyle = C.R;
    for (let i = 1; i < pts.length; i++) { ctx.lineWidth = 0.5 + 3.5 * i / pts.length; poly([pts[i - 1], pts[i]]); }
  }
  if (a.stuck && a.stuck < 15) ctx.globalAlpha = a.stuck / 15;
  drawGreatsword(a.x - dx * (len + 1.8), a.y - dy * (len + 1.8), dx, dy, len + 1.5, 1, 0.62, C.K, null);
  drawGreatsword(a.x - dx * (len + 1.8), a.y - dy * (len + 1.8), dx, dy, len, 1, 0.55, C.R, C.K);
  if (a.form > 0 && a.form < 8 && (globalT & 2)) { ctx.fillStyle = C.W; ctx.fillRect(Math.round(a.x) - 1, Math.round(a.y) - 1, 3, 3); }
  ctx.globalAlpha = 1;
}
function drawSwordSpike(s) {
  if (s.t < s.warn) {
    ctx.fillStyle = (globalT & 4) ? (s.pal ? C.P : C.R) : s.pal ? C.W : C.K;
    ctx.beginPath(); ctx.moveTo(s.x - 5, FLOOR - 1); ctx.lineTo(s.x, FLOOR - 7); ctx.lineTo(s.x + 5, FLOOR - 1); ctx.fill();
    return;
  }
  const h = s.h * s.grow; if (h < 2) return;
  drawGroundBlade(s.x, FLOOR + 3, h + 3, 0, 5, s.pal || BLADE_SOV);
  ctx.fillStyle = C.K; ctx.beginPath(); ctx.moveTo(s.x - 11, FLOOR + 1); ctx.lineTo(s.x - 7, FLOOR - 3); ctx.lineTo(s.x, FLOOR - 1); ctx.lineTo(s.x + 7, FLOOR - 4); ctx.lineTo(s.x + 11, FLOOR + 1); ctx.closePath(); ctx.fill();
}
/* chain and slice styles for cuts (the assassin's plain cuts are drawn in drawCuts) */
function drawStyledCut(c) {
  const dx = Math.cos(c.ang), dy = Math.sin(c.ang), L = Math.min(c.len, 1100);
  if (c.style === 'chain') {
    const ox = c.ox, oy = c.oy, ex = ox + dx * L, ey = oy + dy * L;
    if (c.t < c.warn) {
      const u = c.t / c.warn, on = u > 0.65 ? (globalT >> 1) & 1 : (globalT >> 3) & 1;
      // violet chains warn in violet and white (they must read on a black void)
      const cc = c.col || C.R;
      ctx.strokeStyle = on ? cc : c.col ? C.W : C.K; ctx.lineWidth = 1; ctx.setLineDash([4, 3]); poly([[ox, oy], [ex, ey]]); ctx.setLineDash([]);
      ctx.fillStyle = cc; disc(ox, oy, 3);
      return;
    }
    const e = clamp((c.t - c.warn + 1) / 3, 0, 1), fade = c.t > c.warn + 10 ? Math.max(0, 1 - (c.t - c.warn - 10) / 6) : 1;
    ctx.globalAlpha = fade; chainSeg(ox, oy, ox + dx * L * e, oy + dy * L * e, 0.95, c.col || C.R); ctx.globalAlpha = 1;
    if (e < 1) { ctx.fillStyle = C.W; disc(ox + dx * L * e, oy + dy * L * e, 3); }
    return;
  }
  // slice: the stolen Heaven-Splitter - a red thread, then a white-hot cut
  const hl = L / 2, a = [c.x - dx * hl, c.y - dy * hl], e2 = [c.x + dx * hl, c.y + dy * hl];
  ctx.lineCap = 'butt';
  if (c.t < c.warn) {
    const u = c.t / c.warn, on = u > 0.65 ? (globalT >> 1) & 1 : (globalT >> 3) & 1;
    ctx.globalAlpha = 0.5; ctx.strokeStyle = C.K; ctx.lineWidth = c.final ? 5 : 3; poly([a, e2]); ctx.globalAlpha = 1;
    ctx.strokeStyle = on ? C.R : C.W; ctx.lineWidth = c.final ? 2 : 1; poly([a, e2]);
  } else {
    const k = Math.max(0, 1 - (c.t - c.warn) / 16), w = c.final ? 1.8 : 1;
    ctx.strokeStyle = C.K; ctx.lineWidth = (8 * k + 1) * w; poly([a, e2]);
    ctx.strokeStyle = C.R; ctx.lineWidth = (6 * k + 0.5) * w; poly([a, e2]);
    ctx.strokeStyle = C.W; ctx.lineWidth = (2.5 * k + 0.5) * w; poly([a, e2]);
  }
  ctx.lineCap = 'round';
}
/* boss card skill icons for the Sovereign */
function chainIcon(i, x, y) {
  ctx.fillStyle = C.K; ctx.fillRect(x - 1, y - 1, 22, 22); ctx.fillStyle = C.R; ctx.fillRect(x, y, 20, 20);
  ctx.strokeStyle = C.K; ctx.lineWidth = 1.5; ctx.lineCap = 'round'; const cx = x + 10, cy = y + 10;
  if (i === 0) { for (let k = 0; k < 4; k++) { ctx.beginPath(); if (k % 2) ctx.ellipse(x + 4 + k * 4, cy, 2.6, 1.6, 0, 0, TAU); else { ctx.moveTo(x + 2 + k * 4, cy); ctx.lineTo(x + 6 + k * 4, cy); } ctx.stroke(); } }
  else if (i === 1) { for (const [a, b] of [[[x + 2, y + 2], [cx, cy]], [[x + 18, y + 2], [cx, cy]], [[x + 2, y + 18], [cx, cy]], [[x + 18, y + 18], [cx, cy]]]) poly([a, b]); ctx.fillStyle = C.W; disc(cx, cy, 2); }
  else if (i === 2) { for (let k = -1; k <= 1; k++) drawBlade(cx + k * 4, y + 17, Math.sin(k * 0.4), -Math.cos(k * 0.4), 12, 3, C.K, C.W); }
  else if (i === 3) { ctx.fillStyle = C.K; ctx.fillRect(x + 2, y + 16, 16, 2); drawBlade(x + 6, y + 16, 0, -1, 9, 3, C.K, C.W); drawBlade(x + 11, y + 16, 0, -1, 12, 4, C.K, C.W); drawBlade(x + 16, y + 16, 0, -1, 8, 3, C.K, C.W); }
  else { ctx.strokeStyle = C.W; ctx.lineWidth = 2; poly([[x + 2, y + 15], [x + 18, y + 5]]); ctx.strokeStyle = C.K; ctx.lineWidth = 1; poly([[x + 2, y + 15], [x + 18, y + 5]]); }
}
