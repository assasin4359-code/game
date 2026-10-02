/* ---------- Moonlight Assassin rendering: telegraphs, clones, the assassin, cuts, crescents, whirlwinds ---------- */
function assassinLook(o) { return Object.assign({kasa: {color: C.K, band: C.B}, hair: {color: C.W}, sheath: true}, o); }
function assassinKatanas(b) {
  if (b.sheathed || b.stance || (b.state === 'dead' && b.st > 40) || b.state === 'counter') return [];
  return b.phase === 2 ? [{hand: 'F', len: 30}, {hand: 'B', len: 26}] : [{hand: 'F', len: 30}];
}
const CLONE_STANCE = {hy: -10, lean: 0.62, ht: 0.25, l1: 0.1, l2: -1.7, r1: 1.25, r2: -1.6, fu: 0.1, ff: 1.5, bu: -0.2, bf: 1.3};
const CLONE_DASH = {hy: -12.5, lean: 0.45, ht: 0.1, l1: -0.9, l2: 0.3, r1: 0.9, r2: -0.9, fu: 1.57, ff: 0, bu: -1.3, bf: 0.3};
function drawDrawLine(x0, dir, y, urgent) {
  const x1 = dir > 0 ? W : 0, on = urgent ? (globalT >> 1) & 1 : (globalT >> 2) & 1;
  ctx.strokeStyle = on ? C.W : C.B; ctx.lineWidth = 1.5; ctx.setLineDash([5, 4]); poly([[x0, y], [x1, y]]); ctx.setLineDash([]);
  ctx.fillStyle = ctx.strokeStyle;
  for (let x = x0 + dir * 24; dir > 0 ? x < x1 : x > x1; x += dir * 44) { ctx.beginPath(); ctx.moveTo(x, y - 5); ctx.lineTo(x + dir * 5, y); ctx.lineTo(x, y + 5); ctx.fill(); }
}
function drawAssassin() {
  const b = boss;
  drawAssassinTelegraphs(b);
  drawAssassinBody(b);
}
/* draw lines, the X mark, the plunge column, the safe pocket and the shadow clones */
function drawAssassinTelegraphs(b) {
  const pulse = (globalT >> 2) & 1;
  const tele = b.phase === 2 ? 30 : 40;
  for (const L of b.lines) drawDrawLine(b.x + b.face * 12, b.face, L.y, b.state === 'iai' ? (b.st - 1) % (tele + 44) > tele - 14 : b.st > 280);
  for (const c of b.clones) if (!c.done && b.st < c.t0) drawDrawLine(c.x + c.dir * 12, c.dir, c.y, c.t0 - b.st < 16);
  if (b.mark) {
    const m = b.mark, r = 13, a0 = globalT * 0.1;
    ctx.strokeStyle = pulse ? C.W : C.B; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.arc(m.x, m.y, r, 0, TAU); ctx.stroke();
    for (const a of [a0 + Math.PI / 4, a0 - Math.PI / 4]) poly([[m.x - Math.cos(a) * (r + 6), m.y - Math.sin(a) * (r + 6)], [m.x + Math.cos(a) * (r + 6), m.y + Math.sin(a) * (r + 6)]]);
  }
  if (b.state === 'plunge' && (b.fly || (!b.onGround && !b.landed && b.st < 44))) {
    ctx.strokeStyle = pulse ? C.W : C.B; ctx.lineWidth = 1; ctx.setLineDash([2, 3]); poly([[b.dropX, b.y], [b.dropX, FLOOR]]); ctx.setLineDash([]);
    ctx.lineWidth = 1.5; ctx.beginPath(); ctx.ellipse(b.dropX, FLOOR - 1, 30, 4, 0, 0, TAU); ctx.stroke();
  }
  if (b.safe) {
    // the one pocket every cut misses: a small crescent moon on the path
    const x = b.safe.x, y = FLOOR - 8;
    ctx.globalAlpha = 0.35 + 0.25 * pulse; ctx.fillStyle = C.B; ctx.beginPath(); ctx.ellipse(x, FLOOR - 1, 16, 4, 0, 0, TAU); ctx.fill(); ctx.globalAlpha = 1;
    ctx.fillStyle = C.W; disc(x, y, 5); ctx.fillStyle = C.B; disc(x + 2.5, y - 1.5, 4.2);
    text('안전', x, y - 20, {color: C.W, outline: C.B, align: 'center'});
  }
  for (const c of b.clones) {
    ctx.globalAlpha = c.dash ? 0.85 : 0.6;
    drawFigure(c.x, c.y + 18, c.dir, makePose(c.dash ? CLONE_DASH : CLONE_STANCE), assassinLook({color: C.B, outline: C.W, kasa: {color: C.B}, hair: {color: '#8fa0e6'}, sheath: !c.dash, katanas: c.dash ? [{hand: 'F', len: 30, color: '#8fa0e6'}] : [], t: globalT}));
    ctx.globalAlpha = 1;
  }
}
function drawAssassinBody(b) {
  if (b.alpha <= 0) return;
  let col = C.K, out = C.W;
  if (b.flash > 0 && (b.flash & 2)) { col = C.W; out = C.R; }
  if (b.state === 'counter' && ((globalT >> 2) & 1)) out = C.B;
  drawBladeSmear(b.ktrail2); drawBladeSmear(b.ktrail);
  ctx.globalAlpha = b.alpha;
  // the tail of hair streams back with speed, flat out in a dash or a dive
  const wind = b.dashing || b.diving ? 1.5 : Math.min(1.2, Math.abs(b.vx) / 2.5 + (b.onGround ? 0 : 0.4));
  const P = drawFigure(b.x, b.y, b.face, bossPose(b), assassinLook({color: col, outline: out, eyes: b.freed ? null : C.R, t: b.animT, katanas: assassinKatanas(b), hair: {color: C.W, wind}}));
  ctx.globalAlpha = 1;
  if (b.state === 'counter') { ctx.strokeStyle = C.B; ctx.lineWidth = 1; ctx.beginPath(); ctx.ellipse(b.x, b.y - 20, 18 + Math.sin(globalT * 0.2) * 2, 26, 0, 0, TAU); ctx.stroke(); }
  if (b.state === 'stun') for (let i = 0; i < 3; i++) { const a = b.animT * 0.12 + i * TAU / 3; starShape(P.head[0] + Math.cos(a) * 11, P.head[1] - 10 + Math.sin(a) * 3); }
  const excl = (b.state === 'crescent' && b.st < 14) || (b.state === 'flurry' && b.st < 14) || (b.state === 'counterhit' && b.st < 12) || (b.state === 'cross' && b.st < 10)
    || (b.state === 'tornado' && b.st < 24) || (b.state === 'clones' && b.st < 20);
  if (excl && ((globalT >> 2) & 1)) text('!', P.head[0], P.head[1] - 24, {sc: 2, color: C.B, outline: C.W, align: 'center'});
}
/* the smear a katana leaves: filled bands between the last few blade positions, a blue rim along the tip path */
const SMEAR_BLUE = {fill: C.W, fill2: '#c8d2f4', rim: C.B, core: C.W};
function drawBladeSmear(tr, pal = SMEAR_BLUE) {
  if (!tr || tr.length < 2) return;
  for (let i = 1; i < tr.length; i++) {
    const a = tr[i - 1], e = tr[i];
    ctx.globalAlpha = 0.35 + 0.6 * i / tr.length; ctx.fillStyle = i === tr.length - 1 ? pal.fill : pal.fill2;
    ctx.beginPath(); ctx.moveTo(a[0][0], a[0][1]); ctx.lineTo(a[1][0], a[1][1]); ctx.lineTo(e[1][0], e[1][1]); ctx.lineTo(e[0][0], e[0][1]); ctx.closePath(); ctx.fill();
  }
  ctx.globalAlpha = 1; ctx.lineCap = 'round';
  const tips = tr.map(s => s[1]);
  ctx.strokeStyle = C.K; ctx.lineWidth = 3.2; poly(tips);
  ctx.strokeStyle = pal.rim; ctx.lineWidth = 2; poly(tips);
  ctx.strokeStyle = pal.core; ctx.lineWidth = 0.8; poly(tips.slice(-3));
}
function drawCuts() {
  for (const c of cuts) {
    if (c.style) { drawStyledCut(c); continue; }
    const dx = Math.cos(c.ang), dy = Math.sin(c.ang), L = Math.min(c.len, 1100) / 2, a = [c.x - dx * L, c.y - dy * L], e = [c.x + dx * L, c.y + dy * L];
    ctx.lineCap = 'butt';
    if (c.t < c.warn) {
      const u = c.t / c.warn, on = u > 0.65 ? (globalT >> 1) & 1 : (globalT >> 3) & 1;
      ctx.globalAlpha = 0.55; ctx.strokeStyle = C.K; ctx.lineWidth = 3.5; poly([a, e]); ctx.globalAlpha = 1;
      ctx.strokeStyle = on ? C.W : C.B; ctx.lineWidth = u > 0.65 ? 1.5 : 1; poly([a, e]);
    } else {
      const k = Math.max(0, 1 - (c.t - c.warn) / 16), w = c.big ? 1.3 : 1;
      ctx.strokeStyle = C.K; ctx.lineWidth = (8 * k + 1) * w; poly([a, e]);
      ctx.strokeStyle = C.B; ctx.lineWidth = (6 * k + 0.5) * w; poly([a, e]);
      ctx.strokeStyle = C.W; ctx.lineWidth = (2.5 * k + 0.5) * w; poly([a, e]);
    }
    ctx.lineCap = 'round';
  }
}
function drawSwordShot(a) {
  if (a.kind === 'crescent') {
    const d = Math.sign(a.vx) || 1, hh = a.hh;
    const cres = (h, bul, th) => { ctx.beginPath(); ctx.moveTo(-d * 4, -h); ctx.quadraticCurveTo(d * bul, 0, -d * 4, h); ctx.quadraticCurveTo(d * bul * th, 0, -d * 4, -h); ctx.fill(); };
    // two fading ghosts trail the wave (crimson for the Sovereign's stolen sword waves)
    // (and violet ones, white-rimmed so they read on a black void)
    const v = a.violet, c1 = a.red ? C.R : v ? C.P : C.W, c2 = a.red ? C.K : v ? C.W : C.B;
    for (const [off, al] of [[2.6, 0.25], [1.3, 0.45]]) {
      ctx.save(); ctx.globalAlpha = al; ctx.translate(Math.round(a.x - a.vx * off), Math.round(a.y)); ctx.fillStyle = a.red ? C.R : v ? C.P : C.B; cres(hh * 0.95, hh * 1.1, 0.4); ctx.restore();
    }
    ctx.save(); ctx.translate(Math.round(a.x), Math.round(a.y));
    ctx.fillStyle = a.red || v ? C.W : C.K; cres(hh + 2, hh * 1.25 + 3, 0.3);
    ctx.fillStyle = c1; cres(hh, hh * 1.2, 0.35);
    ctx.fillStyle = c2; cres(hh * 0.7, hh * 0.75, 0.45);
    ctx.fillStyle = a.red ? C.R : v ? C.P : C.W; cres(hh * 0.45, hh * 0.5, 0.6);
    ctx.restore();
    ctx.globalAlpha = 1;
    return;
  }
  // whirlwind: stacked spinning rings that widen upward
  for (let k = 0; k < 6; k++) {
    const y = FLOOR - 4 - k * 8, rx = 6 + k * 2.4, ph = globalT * 0.45 + k * 0.8, x = a.x + Math.sin(ph * 0.7) * 2;
    ctx.strokeStyle = C.K; ctx.lineWidth = 3; ctx.beginPath(); ctx.ellipse(x, y, rx, 2.6, 0, ph % TAU, ph % TAU + 4.2); ctx.stroke();
    ctx.strokeStyle = k % 2 ? C.W : C.B; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.ellipse(x, y, rx, 2.6, 0, ph % TAU, ph % TAU + 4.2); ctx.stroke();
  }
}
/* boss card skill icons for the assassin */
function swordIcon(i, x, y) {
  ctx.fillStyle = C.K; ctx.fillRect(x - 1, y - 1, 22, 22); ctx.fillStyle = C.B; ctx.fillRect(x, y, 20, 20);
  ctx.lineCap = 'round'; const cx = x + 10, cy = y + 10;
  if (i === 0) { ctx.strokeStyle = C.W; ctx.lineWidth = 2; poly([[x + 2, cy + 3], [x + 18, cy + 3]]); ctx.fillStyle = C.K; disc(x + 6, cy - 3, 2); ctx.fillRect(x + 5, cy - 1, 3, 5); }
  else if (i === 1) { ctx.fillStyle = C.W; ctx.beginPath(); ctx.moveTo(cx - 3, y + 3); ctx.quadraticCurveTo(cx + 9, cy, cx - 3, y + 17); ctx.quadraticCurveTo(cx + 3, cy, cx - 3, y + 3); ctx.fill(); }
  else if (i === 2) { ctx.strokeStyle = C.W; ctx.lineWidth = 2; poly([[x + 4, y + 4], [x + 16, y + 16]]); poly([[x + 16, y + 4], [x + 4, y + 16]]); }
  else if (i === 3) { ctx.strokeStyle = C.W; ctx.lineWidth = 1.5; for (let k = 0; k < 3; k++) { ctx.beginPath(); ctx.arc(cx - 4 + k * 4, cy, 6, -1.1, 1.1); ctx.stroke(); } }
  else { ctx.fillStyle = C.W; disc(cx, y + 6, 4); ctx.fillStyle = C.B; disc(cx + 2, y + 5, 3.4); ctx.strokeStyle = C.W; ctx.lineWidth = 1.5; poly([[cx, y + 10], [cx, y + 18]]); }
}
