/* ---------- world rendering ---------- */
function drawPlayer() {
  const p = player;
  if (p.state === 'ride') {
    drawGreatsword(p.x - 24, p.y + 2, 0.97, 0.22, 42, 1, 1.1, C.K, C.W);
    drawFigure(p.x, p.y, 1, makePose({hy: -9, lean: 0.55, l1: 0.1, l2: -1.6, r1: 1.1, r2: -1.9, bu: -1.9, bf: 0.3, fu: 1.1, ff: -0.3}), heroLook({t: p.animT}));
    return;
  }
  const q = playerPose(p), col = p.adren > 0 ? C.R : C.K, face = q.flip ? -p.face : p.face;
  drawTrail(p, col);
  if (p.state === 'attack' && p.atk.flat && !p.atk.arc && curWindow(p.atk, p.st) >= 0) {
    const A = p.atk, w = A.wins, u = A.spin ? clamp((p.st - w[0][0]) / (w[1][1] - w[0][0]), 0, 1) : winU(w[0], p.st), yaw = lerp(A.yaw0, A.yaw1, u);
    ctx.globalAlpha = 0.75; drawFlatSwoosh(p.x + p.face * 3, p.y + (A.id === 2 ? -17 : -21), p.face, Math.max(A.yaw0, yaw - 2.6), yaw, SWORD_LEN + 6, 0.3, col); ctx.globalAlpha = 1;
  }
  if (p.state === 'fury' && p.st - Math.floor(p.st / 7) * 7 < 5 && Math.floor(p.st / 7) % 2 === 0) {
    const yaw = lerp(-1.9, 1.85, easeOut(clamp((p.st - Math.floor(p.st / 7) * 7) / 5, 0, 1)));
    ctx.globalAlpha = 0.7; drawFlatSwoosh(p.x + p.face * 3, p.y - 21, p.face, Math.max(-1.9, yaw - 2.4), yaw, SWORD_LEN + 6, 0.3, col); ctx.globalAlpha = 1;
  }
  const ghost = p.inv > 0 && p.inv < 900 && p.state !== 'dash' && p.state !== 'flash' && p.state !== 'swallow' && !(p.state === 'attack' && p.atk.id === 'pierce') && (scene === 'fight' || scene === 'mini') && ((globalT >> 1) & 1);
  if (p.state === 'dash') {
    // shadow step: grey speed lines, the body itself goes half transparent
    ctx.fillStyle = '#8a8a8a';
    for (let k = 0; k < 5; k++) {
      const len = 16 + (k * 13) % 22, y = p.y - 5 - ((k * 9 + p.st * 3) % 30), x = p.x - p.dashDir * (10 + k * 5) - (p.dashDir > 0 ? len : 0);
      ctx.fillRect(Math.round(x), Math.round(y), len, 1);
    }
    ctx.globalAlpha = 0.55;
  }
  if (ghost) ctx.globalAlpha = 0.45;
  const edge = p.state === 'charge' ? C.Y : p.counter > 0 && (globalT & 4) ? C.B : C.W;
  if (p.state === 'attack' && p.atk.id === 'rising' && p.st >= 2 && p.st < 14) {
    // the rising dragon: a tall crimson crescent from the ground up over the head, drawn behind the body
    const sx = p.x + p.face * 2, sy = p.y - 24, ga = ctx.globalAlpha;
    ctx.globalAlpha = ga * (p.st < 8 ? 0.85 : 0.85 * (1 - (p.st - 8) / 6)); drawSwoosh(sx, sy, p.face, 0.15, Math.min(3.5, q.sa), 56, 18, C.R);
    drawSwoosh(sx, sy, p.face, 0.4, Math.min(3.3, q.sa - 0.1), 50, 5, C.W); ctx.globalAlpha = ga;
  }
  // the ground combo's crescents follow the hero, behind the body so the swing stays readable
  if (p.arcs.length) { const ga = ctx.globalAlpha; ctx.globalAlpha = 1; for (const a of p.arcs) { a.cx = p.x + a.ox; a.cy = p.y + a.oy; drawFlameArc(a); } ctx.globalAlpha = ga; }
  // 천검군림's wings and 무형검's aura sit behind the body
  drawReignWings(p); drawFormlessAura(p);
  // 일검무귀 overrides the blade (longer, blood red) and, once they are drawn into it, hides the halo and back blades;
  // under 무형검 the blade is light itself
  const blade = p.igSword || (p.formless ? {len: SWORD_LEN, color: C.W, edge: C.Y} : {len: SWORD_LEN, color: col, edge});
  const P = drawFigure(p.x, p.y, face, q, heroLook(Object.assign({color: col, outline: C.W, t: p.animT, sword: blade}, p.igHide ? {masterBlades: null, godHalo: null} : {})));
  ctx.globalAlpha = 1;
  if (p.state === 'attack') {
    const A = p.atk;
    // (the grand slam's somersault and landing are flame arcs in p.arcs; the plunge keeps its swoosh)
    if (A.id === 'plunge' && p.landed && p.st < A.landSt + 7) {
      ctx.globalAlpha = 1 - (p.st - A.landSt) / 7;
      drawSwoosh(P.sh[0], P.sh[1], p.face, -0.9, 0.9, 54, 18, col);
      ctx.globalAlpha = 1;
    }
    if (A.id === 'pierce' && p.st >= 2 && p.st < 14) {
      // thrust: a crimson wake behind and a lance of light shooting past the tip
      const g = swordGeom(p.x, p.y, face, q, SWORD_LEN), tx = g.h[0] + g.d[0] * (g.L + 3), ty = g.h[1] + g.d[1] * (g.L + 3), f = p.face, k = 1 - (p.st - 2) / 12;
      ctx.globalAlpha = 0.35 + 0.4 * k; ctx.fillStyle = C.R; ctx.beginPath();
      ctx.moveTo(tx, ty - 5); ctx.lineTo(tx + f * 4, ty); ctx.lineTo(tx, ty + 5); ctx.lineTo(p.x - f * 70, ty + 1); ctx.lineTo(p.x - f * 70, ty - 1); ctx.closePath(); ctx.fill();
      ctx.globalAlpha = 1; ctx.lineCap = 'butt';
      ctx.strokeStyle = C.K; ctx.lineWidth = 4 * k + 1; poly([[tx, ty], [tx + f * 40 * k, ty]]);
      ctx.strokeStyle = C.R; ctx.lineWidth = 3 * k + 0.5; poly([[tx, ty], [tx + f * 44 * k, ty]]);
      ctx.strokeStyle = C.W; ctx.lineWidth = 1; poly([[tx, ty], [tx + f * 30 * k, ty]]);
      ctx.lineCap = 'round';
      ctx.fillStyle = C.W; ctx.fillRect(Math.round(tx) - 1, Math.round(ty) - 1, 3, 3);
    }
  }
  if (p.state === 'fury' && Math.floor(p.st / 7) % 2 === 1 && p.st - Math.floor(p.st / 7) * 7 < 6) { ctx.globalAlpha = 0.85; drawSwoosh(P.sh[0], P.sh[1], p.face, 3.9, q.sa, 46, 13, col); ctx.globalAlpha = 1; }
  if (p.state === 'plant' && p.st >= 10 && p.st < 18) { ctx.globalAlpha = 1 - (p.st - 10) / 8; ctx.strokeStyle = col; ctx.lineWidth = 2; for (let k = 0; k < 5; k++) { const a = -Math.PI / 2 + (k - 2) * 0.35; poly([[p.x + p.face * 12 + Math.cos(a) * 8, p.y + Math.sin(a) * 8], [p.x + p.face * 12 + Math.cos(a) * 20, p.y + Math.sin(a) * 20]]); } ctx.globalAlpha = 1; }
  if (p.state === 'charge') {
    const pct = Math.min(100, Math.floor(p.chargeT / 70 * 100)), bx = Math.round(p.x - 30), by = Math.round(p.y - 62);
    text(pct + '%', p.x, by - 9, {align: 'center', outline: C.W});
    ctx.fillStyle = C.K; ctx.fillRect(bx - 1, by - 1, 62, 15);
    ctx.fillStyle = C.W; ctx.fillRect(bx, by, 60, 13);
    ctx.fillStyle = C.Y; ctx.fillRect(bx, by, Math.round(60 * pct / 100), 13);
    text('충전 중', p.x, by + 3, {align: 'center'});
  }
}
/* 만검우: the sigil in the sky, the falling blades with their streaks, the planted ones trembling before the burst */
function drawRain() {
  const R = player && player.rain; if (!R) return;
  const open = easeOut(clamp(R.t / 12, 0, 1)), rx = ((R.w || RAIN.w) + 14) * open, a0 = R.t * 0.05, fade = R.t > RAIN.start + RAIN.pour ? 0.5 : 1;
  ctx.globalAlpha = fade; ctx.strokeStyle = C.R; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.ellipse(R.x, 26, rx, rx * 0.16, 0, 0, TAU); ctx.stroke();
  ctx.lineWidth = 1; ctx.beginPath(); ctx.ellipse(R.x, 26, rx * 0.7, rx * 0.11, 0, 0, TAU); ctx.stroke();
  for (let k = 0; k < 14; k++) { const a = a0 + k * TAU / 14; poly([[R.x + Math.cos(a) * rx * 0.7, 26 + Math.sin(a) * rx * 0.11], [R.x + Math.cos(a) * rx, 26 + Math.sin(a) * rx * 0.16]]); }
  ctx.globalAlpha = 1;
  const shaking = R.t > RAIN.burst - 14;
  for (const b of R.blades) {
    if (b.gone) continue;
    if (!b.stuck) { ctx.strokeStyle = C.R; ctx.lineWidth = 1; poly([[b.x, b.y - 30], [b.x, b.y - 16]]); drawRimSword(b.x, b.y - 17, 0, 1, 16, 1, 0.6, C.K, C.R); }
    else { const j = shaking ? rnd(-1, 1) : 0; drawRimSword(b.x + j, b.y - 17, 0, 1, 16, 1, 0.6, C.K, shaking && (globalT & 2) ? C.W : C.R); }
  }
}
function drawTrail(p, col) {
  const tr = p.trail; if (tr.length < 2) return;
  ctx.fillStyle = col;
  for (let i = 1; i < tr.length; i++) {
    const a = tr[i - 1], b = tr[i];
    ctx.globalAlpha = (i / tr.length) * 0.8;
    ctx.beginPath(); ctx.moveTo(a[0][0], a[0][1]); ctx.lineTo(a[1][0], a[1][1]); ctx.lineTo(b[1][0], b[1][1]); ctx.lineTo(b[0][0], b[0][1]); ctx.closePath(); ctx.fill();
  }
  ctx.globalAlpha = 1;
  ctx.strokeStyle = C.W; ctx.lineWidth = 1; ctx.lineCap = 'round';
  poly(tr.slice(-4).map(s => s[1]));
}
function drawTelegraphs() {
  const b = boss, P2 = b.phase === 2, pulse = (globalT >> 2) & 1;
  ctx.setLineDash([4, 3]); ctx.lineWidth = 2;
  if (b.state === 'groundshot') {
    const next = groundTimes(P2).find(t => t > b.st);
    if (next != null && next - b.st < 40) { ctx.strokeStyle = pulse ? C.G2 : C.R; poly([[b.x + b.face * 14, FLOOR - 7], [b.face > 0 ? W : 0, FLOOR - 7]]); }
  }
  if (b.state === 'gale' && b.st < galeTele(P2)) {
    ctx.strokeStyle = pulse ? C.G2 : C.R; poly([[b.x, FLOOR - 18], [b.galeTo, FLOOR - 18]]);
    ctx.setLineDash([]); ctx.fillStyle = ctx.strokeStyle;
    for (let x = b.x + b.face * 30; b.face > 0 ? x < b.galeTo : x > b.galeTo; x += b.face * 40) { ctx.beginPath(); ctx.moveTo(x, FLOOR - 24); ctx.lineTo(x + b.face * 6, FLOOR - 18); ctx.lineTo(x, FLOOR - 12); ctx.fill(); }
  }
  ctx.setLineDash([]);
  for (const a of arrows) if (a.kind === 'split') {
    ctx.strokeStyle = (globalT & 4) ? C.G2 : C.R; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.ellipse(a.x, FLOOR - 1, 16, 3, 0, 0, TAU); ctx.stroke();
  }
}
function drawBoss() {
  const b = boss;
  if (b.kind === 'gun') { drawGunner(); return; }
  if (b.kind === 'sword') { drawAssassin(); return; }
  if (b.kind === 'chain') { drawSovereign(); return; }
  if (b.kind === 'origin') { drawOrigin(); return; }
  drawTelegraphs();
  if (b.alpha <= 0) return;
  let col = C.K, out = C.W;
  if (b.flash > 0 && (b.flash & 2)) { col = C.W; out = C.R; }
  ctx.globalAlpha = b.alpha;
  const bow =(b.state === 'dead' && b.st > 40) ? null : {aim: b.drawing ? b.aim : null, drawn: b.drawing && b.releaseT <= 0, arrow: b.drawing && b.releaseT <= 0, color: col};
  const P = drawFigure(b.x, b.y, b.face, bossPose(b), {color: col, outline: out, eyes: b.freed ? null : C.R, scarf: {color: C.G2, n: b.phase === 2 || b.summon ? 3 : 2, wind: b.onGround ? b.vx : Math.max(Math.abs(b.vx), 1.5)}, quiver: true,
    holdArrow: !b.drawing && (b.state === 'idle' || b.state === 'script' || b.state === 'windstep'), t: b.animT, bow});
  ctx.globalAlpha = 1;
  if (b.state === 'sweep' && b.st >= 18 && b.st < 28) { ctx.globalAlpha = 1 - (b.st - 18) / 10; drawSwoosh(P.sh[0], P.sh[1], b.face, -2.2, 1.8, 40, 12, C.G2); ctx.globalAlpha = 1; }
  if (b.state === 'stun') for (let i = 0; i < 3; i++) { const a = b.animT * 0.12 + i * TAU / 3; starShape(P.head[0] + Math.cos(a) * 9, P.head[1] - 8 + Math.sin(a) * 3); }
  const excl = (b.state === 'rapid' && b.st < (b.phase === 2 ? 20 : 28)) || (b.state === 'sweep' && b.st < 18) || (b.state === 'vines' && b.st < 18) || (b.state === 'lock' && lockon && lockon.state === 'locked')
    || (b.state === 'gale' && b.st < galeTele(b.phase === 2)) || (b.state === 'groundshot' && b.st < groundTimes(b.phase === 2)[0]) || (b.state === 'spiral' && b.st < 44);
  if (excl && ((globalT >> 2) & 1)) text('!', P.head[0], P.head[1] - 22, {sc: 2, color: C.R, outline: C.K, align: 'center'});
}
function drawArrows() {
  for (const a of arrows) {
    if (BULLETS.has(a.kind) || a.kind === 'rocket' || a.kind === 'grenade') { drawShot(a); continue; }
    if (a.kind === 'crescent' || a.kind === 'tornado') { drawSwordShot(a); continue; }
    if (a.kind === 'eblade') { drawEBlade(a); continue; }
    if (a.kind === 'ice') { drawIce(a); continue; }
    if (a.kind === 'giant') {
      const d = Math.sign(a.vx), tail = [a.x - d * 34, a.y], tip = [a.x, a.y];
      ctx.lineCap = 'round';
      ctx.strokeStyle = C.K; ctx.lineWidth = 6; poly([tail, tip]);
      ctx.strokeStyle = C.G2; ctx.lineWidth = 3.5; poly([tail, tip]);
      ctx.strokeStyle = C.W; ctx.lineWidth = 1; poly([[a.x - d * 30, a.y], [a.x - d * 6, a.y]]);
      ctx.fillStyle = C.K; ctx.beginPath(); ctx.moveTo(a.x + d * 7, a.y); ctx.lineTo(a.x - d * 3, a.y - 6); ctx.lineTo(a.x - d * 3, a.y + 6); ctx.fill();
      ctx.fillStyle = C.G2; for (const s of [-1, 1]) { ctx.beginPath(); ctx.moveTo(a.x - d * 26, a.y); ctx.lineTo(a.x - d * 36, a.y + s * 7); ctx.lineTo(a.x - d * 32, a.y); ctx.fill(); }
      continue;
    }
    const sp = Math.hypot(a.vx, a.vy) || 1, dx = a.vx / sp, dy = a.vy / sp, len = a.kind === 'homing' ? 10 : 13, tx = a.x - dx * len, ty = a.y - dy * len;
    if (a.kind === 'split') { ctx.strokeStyle = (globalT & 4) ? C.G2 : C.R; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(a.x, a.y, 6, 0, TAU); ctx.stroke(); }
    if (a.stuck && a.stuck < 15) ctx.globalAlpha = a.stuck / 15;
    if (a.kind === 'homing' && a.trail.length > 1) { ctx.strokeStyle = C.G3; ctx.lineWidth = 2; poly(a.trail); }
    ctx.lineCap = 'round';
    ctx.strokeStyle = C.W; ctx.lineWidth = 3; poly([[tx, ty], [a.x, a.y]]);
    ctx.strokeStyle = a.kind === 'homing' ? C.G1 : C.K; ctx.lineWidth = 1.4; poly([[tx, ty], [a.x, a.y]]);
    ctx.fillStyle = C.K; ctx.beginPath(); ctx.moveTo(a.x + dx * 2, a.y + dy * 2); ctx.lineTo(a.x - dx * 3 - dy * 2, a.y - dy * 3 + dx * 2); ctx.lineTo(a.x - dx * 3 + dy * 2, a.y - dy * 3 - dx * 2); ctx.fill();
    ctx.strokeStyle = C.G2; ctx.lineWidth = 1.2;
    poly([[tx, ty], [tx - dx * 3 - dy * 2.5, ty - dy * 3 + dx * 2.5]]); poly([[tx, ty], [tx - dx * 3 + dy * 2.5, ty - dy * 3 - dx * 2.5]]);
    ctx.globalAlpha = 1;
  }
}
function drawSigil() {
  // crimson summoning circle: two rings, rotating rune ticks, a hexagram
  const s = sigil; if (!s) return;
  const open = easeOut(Math.min(1, s.t / 10)), fade = s.t > 60 ? Math.max(0.35, 1 - (s.t - 60) / 40) : 1, r = 26 * open, a0 = s.t * 0.06;
  ctx.save(); ctx.translate(Math.round(s.x), Math.round(s.y));
  ctx.globalAlpha = 0.3 * fade; ctx.fillStyle = C.R; ctx.beginPath(); ctx.ellipse(0, 0, r, r * 0.92, 0, 0, TAU); ctx.fill();
  ctx.globalAlpha = fade; ctx.lineWidth = 1.5; ctx.strokeStyle = C.R;
  ctx.beginPath(); ctx.arc(0, 0, r, 0, TAU); ctx.stroke();
  ctx.lineWidth = 1; ctx.strokeStyle = C.K; ctx.beginPath(); ctx.arc(0, 0, r * 0.74, 0, TAU); ctx.stroke();
  for (let k = 0; k < 12; k++) { const a = a0 + k * TAU / 12, l = k % 3 ? 3 : 6; poly([[Math.cos(a) * r, Math.sin(a) * r], [Math.cos(a) * (r + l), Math.sin(a) * (r + l)]]); }
  ctx.strokeStyle = C.R;
  for (const off of [0, Math.PI]) { ctx.beginPath(); for (let k = 0; k <= 3; k++) { const a = -a0 * 1.5 + off + k * TAU / 3; const px = Math.cos(a) * r * 0.72, py = Math.sin(a) * r * 0.72; k ? ctx.lineTo(px, py) : ctx.moveTo(px, py); } ctx.stroke(); }
  ctx.fillStyle = C.W; ctx.fillRect(-1, -1, 3, 3);
  ctx.restore(); ctx.globalAlpha = 1;
}
function drawBlades() {
  drawSigil();
  for (const d of blades) {
    if (d.giant) {
      // 특성 대검: a giant greatsword, point down, over the enemy's head - then in the floor
      const L = 76 * (d.state === 'giant' ? d.grow : 1); if (L < 2) continue;
      ctx.globalAlpha = d.state === 'planted' ? Math.max(0, 1 - Math.max(0, d.t - 26) / 14) : 1;
      if (d.state === 'giant' && d.t > 24 && (globalT & 2)) { ctx.strokeStyle = C.R; ctx.lineWidth = 1; ctx.setLineDash([3, 3]); poly([[d.x, d.y + L], [d.x, FLOOR]]); ctx.setLineDash([]); }
      if (d.state === 'drop') { ctx.strokeStyle = C.R; ctx.lineWidth = 2; for (const o of [-8, 0, 8]) poly([[d.x + o, d.y - 30], [d.x + o, d.y + L * 0.6]]); }
      drawRimSword(d.x, d.y, 0, 1, L, 1, 2.2, d.red ? C.R : C.K, d.red ? C.W : C.R);
      ctx.globalAlpha = 1;
      continue;
    }
    const dx = Math.cos(d.ang), dy = Math.sin(d.ang), body = d.red ? C.R : C.K, edge = d.red ? C.W : C.R;
    let len = 24;
    if (d.state === 'form') { len = 24 * d.grow; if (len < 1) continue; }
    if (d.state === 'fly' && d.trail.length > 1) {
      // long crimson streak behind the flying blade
      const pts = d.trail.concat([[d.x, d.y]]);
      ctx.lineCap = 'round'; ctx.strokeStyle = C.R;
      for (let i = 1; i < pts.length; i++) { ctx.lineWidth = 0.5 + 3.5 * i / pts.length; poly([pts[i - 1], pts[i]]); }
      ctx.strokeStyle = C.W; ctx.lineWidth = 1; poly(pts.slice(-3));
    }
    if (d.state === 'ground') ctx.globalAlpha = Math.max(0, 1 - d.t / 50);
    let jx = 0, jy = 0;
    if (d.state === 'embed' && sigil && sigil.det > 0) { jx = rnd(-1, 1); jy = rnd(-1, 1); }
    const tipX = d.x + jx, tipY = d.y + jy;
    drawGreatsword(tipX - dx * (len + 1.8), tipY - dy * (len + 1.8), dx, dy, len, 1, 0.55, body, edge);
    if (d.state === 'form' && d.t - d.appear < 4) { ctx.strokeStyle = C.W; ctx.lineWidth = 1; poly([[tipX - dx * len, tipY - dy * len], [tipX, tipY]]); }
    if (d.state === 'embed' || d.state === 'dance') { ctx.fillStyle = (globalT & 2) ? C.R : C.W; ctx.fillRect(Math.round(tipX) - 1, Math.round(tipY) - 1, 3, 3); }
    ctx.globalAlpha = 1;
  }
}
function drawWaves() {
  for (const w of waves) {
    const k = Math.max(0.2, 1 - w.t / 40), d = w.dir, x = w.x, y = w.y;
    ctx.globalAlpha = w.t > 26 ? 1 - (w.t - 26) / 9 : 1;
    ctx.fillStyle = C.K; ctx.beginPath();
    ctx.moveTo(x - d * 8, y); ctx.quadraticCurveTo(x + d * 12, y - 14 * k, x - d * 4, y - 32 * k); ctx.quadraticCurveTo(x + d * 3, y - 14 * k, x - d * 8, y); ctx.fill();
    ctx.strokeStyle = C.W; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x - d * 5, y - 3); ctx.quadraticCurveTo(x + d * 8, y - 14 * k, x - d * 3, y - 27 * k); ctx.stroke();
    ctx.globalAlpha = 1;
  }
}
function drawPeaks() {
  for (const k of peaks) {
    if (k.t < 0) continue;
    const L = k.h * k.grow; if (L < 2) continue;
    const dx = Math.sin(k.tilt), dy = -Math.cos(k.tilt), f = k.tilt >= 0 ? 1 : -1;
    if (k.red) {
      // crimson blade: flashes white as it tears out of the ground, red speed lines while it rises, a split in the floor
      const hw = (k.w || 16) * 0.4, x = k.x;
      if (k.t < 8) { ctx.strokeStyle = C.R; ctx.lineWidth = 1; for (const s of [-1, 1]) poly([[x + s * (hw + 4), FLOOR - L * 0.2], [x + s * (hw + 4), FLOOR - L * 1.1]]); }
      drawGroundBlade(x, FLOOR + 4, L + 4, k.tilt * 0.8, hw, k.t <= 2 ? {light: C.W, dark: C.W, ridge: C.R} : BLADE_ADREN);
      ctx.strokeStyle = C.R; ctx.lineWidth = 1;
      for (const s of [-1, 1]) poly([[x + s * (hw + 2), FLOOR], [x + s * (hw + 9), FLOOR + 3], [x + s * (hw + 15), FLOOR + 2]]);
      ctx.fillStyle = C.K; ctx.beginPath(); ctx.moveTo(x - hw - 7, FLOOR + 1); ctx.lineTo(x - hw - 2, FLOOR - 4); ctx.lineTo(x - hw * 0.4, FLOOR - 1); ctx.lineTo(x + hw * 0.5, FLOOR - 1);
      ctx.lineTo(x + hw + 3, FLOOR - 5); ctx.lineTo(x + hw + 8, FLOOR + 1); ctx.closePath(); ctx.fill();
    } else {
      drawGreatsword(k.x - dx * 10, FLOOR + 10, dx, dy, L, f, 1.25, C.K, C.W);
      ctx.fillStyle = C.K; ctx.fillRect(Math.round(k.x - 9), FLOOR - 1, 18, 3);
    }
  }
}
function drawSlashWaves() {
  // crimson crescent: red halo and trailing strands, red body, near-black core, bright streaks along the arc
  for (const s of slashWaves) {
    const life = s.ret ? 60 : 46, hh = s.hh, d = s.dir, k = s.t > life - 12 ? Math.max(0, 1 - (s.t - life + 12) / 12) : 1, bul = hh * 1.15;
    const cres = (ox, h, b, th) => { ctx.beginPath(); ctx.moveTo(ox - d * 6, -h); ctx.quadraticCurveTo(ox + d * b, 0, ox - d * 6, h); ctx.quadraticCurveTo(ox + d * b * th, 0, ox - d * 6, -h); ctx.fill(); };
    const arc = (ox, h, b) => { ctx.beginPath(); ctx.moveTo(ox - d * 6, -h); ctx.quadraticCurveTo(ox + d * b, 0, ox - d * 6, h); ctx.stroke(); };
    // 특성 십자: two crescents crossed into an X (the second pass of the loop)
    for (const rot of s.cross ? [0.62, -0.62] : [s.tilt * d]) {
    ctx.save(); ctx.translate(Math.round(s.x), Math.round(s.y)); ctx.rotate(rot);
    ctx.strokeStyle = C.R; ctx.lineWidth = 1; ctx.globalAlpha = 0.65 * k;
    for (let j = 0; j < 4; j++) arc(-d * (8 + j * 7), hh * (1.06 - j * 0.1), bul * (0.35 + j * 0.13));
    ctx.fillStyle = C.R; ctx.globalAlpha = 0.35 * k; cres(d * 2, hh * 1.12, bul * 1.2, 0.05);
    ctx.globalAlpha = k; cres(0, hh, bul, 0.2);
    ctx.fillStyle = C.K; cres(-d * 3, hh * 0.8, bul * 0.8, 0.42);
    ctx.fillStyle = '#5a0008'; cres(-d * 5, hh * 0.55, bul * 0.6, 0.5);
    ctx.strokeStyle = C.R; arc(-d * 2, hh * 0.72, bul * 0.66); arc(-d * 4, hh * 0.52, bul * 0.48);
    ctx.strokeStyle = C.W; ctx.lineWidth = hh > 34 ? 1.6 : 1; arc(0, hh * 0.9, bul * 0.92);
    const ax = Math.round(d * (bul * 0.5 - 3));
    ctx.fillStyle = C.W; ctx.fillRect(ax - 1, -1, 3, 3); ctx.fillRect(ax - 3, 0, 7, 1);
    ctx.restore(); ctx.globalAlpha = 1;
    }
  }
}
function drawSpikes() {
  for (const s of spikes) {
    if (s.t < 0) continue;
    if (s.sword) { drawSwordSpike(s); continue; }
    if (s.t < s.warn) {
      const j = (globalT & 2) ? 1 : 0;
      ctx.globalAlpha = 0.55; ctx.fillStyle = C.G3; ctx.beginPath(); ctx.ellipse(s.x, FLOOR, 10, 3, 0, 0, TAU); ctx.fill(); ctx.globalAlpha = 1;
      ctx.fillStyle = C.G2;
      for (let k = -1; k <= 1; k++) { ctx.beginPath(); ctx.moveTo(s.x + k * 5 - 2 + j, FLOOR); ctx.lineTo(s.x + k * 5 + j, FLOOR - 4 - (k === 0 ? 2 : 0)); ctx.lineTo(s.x + k * 5 + 2 + j, FLOOR); ctx.fill(); }
      continue;
    }
    const h = s.h * s.grow; if (h < 1) continue;
    const top = FLOOR - h;
    ctx.fillStyle = C.K; ctx.beginPath(); ctx.moveTo(s.x - 8, FLOOR + 1); ctx.quadraticCurveTo(s.x - 4, top + h * 0.4, s.x, top - 1); ctx.quadraticCurveTo(s.x + 4, top + h * 0.4, s.x + 8, FLOOR + 1); ctx.fill();
    ctx.fillStyle = C.G1; ctx.beginPath(); ctx.moveTo(s.x - 6.5, FLOOR); ctx.quadraticCurveTo(s.x - 3, top + h * 0.4, s.x, top + 1); ctx.quadraticCurveTo(s.x + 3, top + h * 0.4, s.x + 6.5, FLOOR); ctx.fill();
    ctx.strokeStyle = C.G2; ctx.lineWidth = 1; poly([[s.x - 1.5, FLOOR], [s.x - 0.5, top + h * 0.3]]);
    ctx.fillStyle = C.K;
    for (let k = 1; k <= 3; k++) { const yy = FLOOR - h * k / 4, side = k % 2 ? 1 : -1, wx = 4.5 * (1 - k / 4) + 1.5; ctx.beginPath(); ctx.moveTo(s.x + side * wx, yy); ctx.lineTo(s.x + side * (wx + 4), yy - 3); ctx.lineTo(s.x + side * wx, yy - 2.5); ctx.fill(); }
  }
}
function drawMarkers() {
  for (const m of markers) {
    if (m.t < 0 || m.t > 50) continue;
    ctx.globalAlpha = 0.5 * Math.min(1, m.t / 12); ctx.strokeStyle = C.G2; ctx.lineWidth = 1;
    ctx.setLineDash([2, 3]); poly([[m.x, 16], [m.x, FLOOR]]); ctx.setLineDash([]);
    ctx.globalAlpha = 1; ctx.fillStyle = (globalT & 4) ? C.G2 : C.R;
    ctx.beginPath(); ctx.moveTo(m.x - 4, FLOOR - 7); ctx.lineTo(m.x + 4, FLOOR - 7); ctx.lineTo(m.x, FLOOR - 2); ctx.fill();
  }
}
function drawBeams() {
  for (const bm of beams) {
    const life = (bm.dur || 7) + 13, k = 1 - bm.t / life; if (k <= 0) continue;
    const e = [bm.x + Math.cos(bm.ang) * 800, bm.y + Math.sin(bm.ang) * 800], o = [bm.x, bm.y], s = (bm.w || 10) / 10;
    ctx.lineCap = 'round';
    ctx.strokeStyle = C.K; ctx.lineWidth = (12 * k + 3) * s; poly([o, e]);
    ctx.strokeStyle = bm.gold ? C.Y : C.G2; ctx.lineWidth = (10 * k + 2) * s; poly([o, e]);
    ctx.strokeStyle = C.W; ctx.lineWidth = (3 * k + 1) * s; poly([o, e]);
    if (bm.gold && bm.t < 6) { ctx.fillStyle = C.W; disc(bm.x, bm.y, 9 * s * k + 2); ctx.fillStyle = C.Y; disc(bm.x, bm.y, 6 * s * k); }
  }
}
function drawLockon() {
  if (!lockon) return;
  const gun = bkind(boss) === 'gun', c1 = gun ? C.Y : C.G2, c2 = gun ? C.Y : C.G3;
  const L = lockon, col = L.state === 'locked' ? ((globalT & 4) ? C.R : c1) : c1, [bx, by] = gun ? gunOrigin(boss, boss.aim) : bowPos(boss);
  ctx.globalAlpha = 0.6; ctx.strokeStyle = gun ? C.R : C.G2; ctx.lineWidth = 1; ctx.setLineDash([1, 3]); poly([[bx, by], [L.x, L.y]]); ctx.setLineDash([]);
  ctx.globalAlpha = 0.35; ctx.fillStyle = c2; disc(L.x, L.y, L.r); ctx.globalAlpha = 1;
  ctx.strokeStyle = col; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(L.x, L.y, L.r, 0, TAU); ctx.stroke();
  const a0 = globalT * 0.08;
  for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.arc(L.x, L.y, L.r + 4, a0 + i * Math.PI / 2, a0 + i * Math.PI / 2 + 0.8); ctx.stroke(); }
  poly([[L.x - L.r - 6, L.y], [L.x - L.r + 3, L.y]]); poly([[L.x + L.r - 3, L.y], [L.x + L.r + 6, L.y]]);
  poly([[L.x, L.y - L.r - 6], [L.x, L.y - L.r + 3]]); poly([[L.x, L.y + L.r - 3], [L.x, L.y + L.r + 6]]);
}
function drawPlatforms() {
  for (const pl of platforms) {
    if (pl.grow <= 0) continue;
    const cx = (pl.x1 + pl.x2) / 2, hw = (pl.x2 - pl.x1) / 2 * pl.grow;
    if (stage.key === 'chain' || stage.key === 'origin') {
      // a single giant chain link floating on its side
      ctx.lineWidth = 5; ctx.strokeStyle = C.K; ctx.beginPath(); ctx.ellipse(cx, pl.y + 5, hw, 6, 0, 0, TAU); ctx.stroke();
      ctx.lineWidth = 2; ctx.strokeStyle = C.W; ctx.beginPath(); ctx.ellipse(cx, pl.y + 5, hw, 6, 0, 0, TAU); ctx.stroke();
      ctx.lineWidth = 1; ctx.strokeStyle = VIOLET; ctx.beginPath(); ctx.ellipse(cx, pl.y + 5, Math.max(0.5, hw - 4), 3.5, 0, 0, TAU); ctx.stroke();
      if (hw > 6) { ctx.fillStyle = C.W; ctx.fillRect(Math.round(cx - hw + 6), pl.y, Math.round(hw * 2 - 12), 1); }
      continue;
    }
    if (stage.key === 'sword') {
      // snow-capped stone ledge hanging from a chain
      ctx.strokeStyle = C.K; ctx.lineWidth = 1.5; for (let y = 0; y < pl.y - 4; y += 6) { ctx.beginPath(); ctx.ellipse(cx - hw * 0.5, y + 3, 1.6, 2.6, 0, 0, TAU); ctx.stroke(); }
      ctx.fillStyle = C.K; ctx.beginPath(); ctx.moveTo(cx - hw - 1, pl.y + 1);
      for (let i = 0; i <= 8; i++) { const u = i / 8; ctx.lineTo(cx - hw + u * hw * 2, pl.y + 3 + Math.sin(u * Math.PI) * 12 + ((i * 5) % 3)); }
      ctx.lineTo(cx + hw + 1, pl.y + 1); ctx.closePath(); ctx.fill();
      ctx.fillStyle = C.W; ctx.beginPath(); ctx.ellipse(cx, pl.y + 1.5, hw, 3.2, 0, 0, TAU); ctx.fill();
      ctx.fillStyle = C.B; ctx.fillRect(Math.round(cx - hw * 0.7), pl.y + 5, Math.round(hw * 1.2), 1);
      continue;
    }
    if (stage.key === 'gun') {
      // floating gold rock on a chain
      ctx.strokeStyle = C.K; ctx.lineWidth = 1.5; for (let y = 0; y < pl.y - 4; y += 6) { ctx.beginPath(); ctx.ellipse(cx + hw * 0.5, y + 3, 1.6, 2.6, 0, 0, TAU); ctx.stroke(); }
      ctx.fillStyle = C.K; ctx.beginPath(); ctx.moveTo(cx - hw - 1.5, pl.y + 1);
      for (let i = 0; i <= 8; i++) { const u = i / 8; ctx.lineTo(cx - hw + u * hw * 2, pl.y + 4 + Math.sin(u * Math.PI) * 13 + ((i * 7) % 3)); }
      ctx.lineTo(cx + hw + 1.5, pl.y + 1); ctx.closePath(); ctx.fill();
      ctx.fillStyle = C.Y; ctx.beginPath(); ctx.ellipse(cx, pl.y + 2, hw, 3.6, 0, 0, TAU); ctx.fill();
      ctx.fillStyle = '#b89a10'; ctx.fillRect(Math.round(cx - hw * 0.6), pl.y + 3, Math.round(hw * 1.1), 1);
      ctx.fillStyle = C.K; for (let x = cx - hw + 8; x < cx + hw - 6; x += 17) ctx.fillRect(Math.round(x), pl.y + 12, 2, 5 + ((x | 0) % 4));
      continue;
    }
    ctx.strokeStyle = C.G1; ctx.lineWidth = 2; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(cx + hw * 0.7, pl.y); ctx.quadraticCurveTo(cx + hw * 0.9 + 10, pl.y * 0.5, cx + hw * 0.4, 0); ctx.stroke();
    ctx.fillStyle = C.K; ctx.beginPath(); ctx.ellipse(cx, pl.y + 3, hw + 1.5, 5, 0, 0, TAU); ctx.fill();
    ctx.fillStyle = C.G1; ctx.beginPath(); ctx.ellipse(cx, pl.y + 3, hw, 3.8, 0, 0, TAU); ctx.fill();
    ctx.fillStyle = C.G2; ctx.fillRect(Math.round(cx - hw + 4), pl.y, Math.round(hw * 2 - 8), 1);
    ctx.fillStyle = C.G2;
    for (let x = cx - hw + 6; x < cx + hw - 4; x += 13) { ctx.beginPath(); ctx.ellipse(x, pl.y + 8, 2.5, 4, 0.3, 0, TAU); ctx.fill(); }
  }
}
function drawItems() {
  for (const it of items) {
    const x = Math.round(it.x), y = Math.round(it.y);
    if (it.kind === 'coin') { ctx.fillStyle = C.K; disc(x, y, 3.5); ctx.fillStyle = C.Y; disc(x, y, 2.5); }
    else if (it.kind === 'potion') { ctx.fillStyle = C.K; ctx.fillRect(x - 3, y - 2, 7, 6); ctx.fillRect(x - 1, y - 5, 3, 3); ctx.fillStyle = C.R; ctx.fillRect(x - 2, y - 1, 5, 4); }
    else if (it.kind === 'arrow') { ctx.strokeStyle = C.K; ctx.lineWidth = 1.5; poly([[x - 5, y + 3], [x + 5, y - 3]]); ctx.fillStyle = C.G2; ctx.fillRect(x - 6, y + 2, 3, 3); }
    else drawBlade(x - 5, y + 3, 0.8, -0.6, 12, 3, C.K, C.W);
  }
}
function drawParticles() {
  for (const q of particles) {
    const k = q.life / q.max;
    switch (q.kind) {
      case 'px': ctx.fillStyle = q.color; ctx.fillRect(Math.round(q.x), Math.round(q.y), q.size, q.size); break;
      case 'line': ctx.strokeStyle = q.color; ctx.lineWidth = q.size; poly([[q.x, q.y], [q.x - q.vx * (q.len || 2), q.y - q.vy * (q.len || 2)]]); break;
      case 'ring': ctx.strokeStyle = q.color; ctx.lineWidth = Math.max(0.6, q.size * k); ctx.beginPath(); ctx.arc(q.x, q.y, q.r0 + (1 - k) * q.rMax, 0, TAU); ctx.stroke(); break;
      case 'leaf': ctx.fillStyle = q.color; ctx.beginPath(); ctx.ellipse(q.x, q.y, 2.2, 1.1, q.life * 0.15, 0, TAU); ctx.fill(); break;
      case 'shard': {
        const a = q.ang + (q.max - q.life) * (q.spin || 0), s = q.size * (0.45 + 0.55 * k), ca = Math.cos(a), sa = Math.sin(a);
        const pt = (fx, fy, m) => [q.x + (fx * ca - fy * sa) * m, q.y + (fx * sa + fy * ca) * m];
        const dia = m => { const a1 = pt(s * 1.7, 0, m), a2 = pt(0, s * 0.65, m), a3 = pt(-s, 0, m), a4 = pt(0, -s * 0.65, m); ctx.beginPath(); ctx.moveTo(a1[0], a1[1]); ctx.lineTo(a2[0], a2[1]); ctx.lineTo(a3[0], a3[1]); ctx.lineTo(a4[0], a4[1]); ctx.fill(); };
        ctx.fillStyle = q.gold ? C.Y : q.blue ? C.B : C.R; dia(1);
        if (s > 2.2) { ctx.fillStyle = q.gold || q.blue ? C.W : C.K; dia(0.45); }
        break;
      }
      case 'glint': {
        // a four-point star flaring on a blade just before it moves
        const s = q.size * Math.sin(Math.PI * (1 - k)) + 1, star = r => { ctx.beginPath(); ctx.moveTo(q.x, q.y - r); ctx.lineTo(q.x + r * 0.22, q.y - r * 0.22); ctx.lineTo(q.x + r, q.y); ctx.lineTo(q.x + r * 0.22, q.y + r * 0.22); ctx.lineTo(q.x, q.y + r); ctx.lineTo(q.x - r * 0.22, q.y + r * 0.22); ctx.lineTo(q.x - r, q.y); ctx.lineTo(q.x - r * 0.22, q.y - r * 0.22); ctx.closePath(); ctx.fill(); };
        ctx.fillStyle = q.rim || C.B; star(s * 1.35 + 1); ctx.fillStyle = C.W; star(s); break;
      }
      case 'slashmark': {
        // a crescent flash of a cut hanging in the air, widening as it fades
        const r = q.r * (0.75 + 0.35 * (1 - k)), cres = (h, bul, th) => { ctx.beginPath(); ctx.moveTo(0, -h); ctx.quadraticCurveTo(bul, 0, 0, h); ctx.quadraticCurveTo(bul * th, 0, 0, -h); ctx.fill(); };
        ctx.save(); ctx.translate(q.x, q.y); ctx.rotate(q.ang); ctx.globalAlpha = Math.min(1, k * 1.6);
        ctx.fillStyle = C.K; cres(r + 1.5, r * 0.62 + 2, 0.35); ctx.fillStyle = C.W; cres(r, r * 0.6, 0.4); ctx.fillStyle = C.B; cres(r * 0.7, r * 0.34, 0.5);
        ctx.restore(); ctx.globalAlpha = 1; break;
      }
      case 'fly': {
        const f = (q.life >> 2) & 1 ? 1 : 3, x = Math.round(q.x), y = Math.round(q.y);
        ctx.fillStyle = C.K; ctx.fillRect(x, y - 1, 1, 3);
        ctx.fillStyle = q.color; ctx.fillRect(x - f, y - 1, f, 2); ctx.fillRect(x + 1, y - 1, f, 2); break;
      }
      case 'cut': {
        const L = q.len * (0.55 + 0.45 * (1 - k)), dx = Math.cos(q.ang) * L, dy = Math.sin(q.ang) * L;
        ctx.lineCap = 'butt';
        ctx.strokeStyle = C.K; ctx.lineWidth = 4 * k + 0.5; poly([[q.x - dx, q.y - dy], [q.x + dx, q.y + dy]]);
        ctx.strokeStyle = C.W; ctx.lineWidth = 1.5 * k; poly([[q.x - dx * 0.9, q.y - dy * 0.9], [q.x + dx * 0.9, q.y + dy * 0.9]]);
        ctx.lineCap = 'round'; break;
      }
      case 'bolt': {
        const pts = [[q.x, q.y - 6]]; for (let i = 1; i <= 3; i++) pts.push([q.x + rnd(-3, 3), q.y - 6 + i * 4]);
        ctx.lineWidth = 3; ctx.strokeStyle = C.K; poly(pts); ctx.lineWidth = 1.3; ctx.strokeStyle = C.Y; poly(pts); break;
      }
      case 'muzzle': {
        // muzzle flash: a spiky star stretched along the barrel
        const c = Math.cos(q.ang), s = Math.sin(q.ang), m = q.size * (0.6 + k * 0.6), pt = (f, n) => [q.x + c * f - s * n, q.y + s * f + c * n];
        const star = r => { ctx.beginPath(); const P = [pt(9 * r, 0), pt(2 * r, 2 * r), pt(3 * r, 5 * r), pt(-1 * r, 2 * r), pt(-3 * r, 0), pt(-1 * r, -2 * r), pt(3 * r, -5 * r), pt(2 * r, -2 * r)]; P.forEach((p, i) => i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])); ctx.closePath(); ctx.fill(); };
        ctx.fillStyle = C.K; star(m * 1.25); ctx.fillStyle = C.Y; star(m); ctx.fillStyle = C.W; star(m * 0.45); break;
      }
      case 'bigcut': {
        // a huge crescent of a cut flashing open on the spot (섬광일섬's star, 무형검's swings, 천검군림's blades):
        // it snaps wide in two frames, a thin line runs through it, then it thins away
        const u = 1 - k, open = Math.min(1, u * 5), r = q.r * (0.7 + 0.3 * open), c = Math.cos(q.ang), s = Math.sin(q.ang);
        const cres = (h, bul, th) => { ctx.beginPath(); ctx.moveTo(-h, 0); ctx.quadraticCurveTo(0, -bul, h, 0); ctx.quadraticCurveTo(0, -bul * th, -h, 0); ctx.fill(); };
        ctx.save(); ctx.translate(q.x, q.y); ctx.rotate(q.ang); ctx.globalAlpha = Math.min(1, k * 1.8);
        ctx.fillStyle = C.K; cres(r + 2, r * 0.5 * open + 2, 0.2);
        ctx.fillStyle = q.c1; cres(r, r * 0.46 * open, 0.25);
        ctx.fillStyle = q.c2; cres(r * 0.8, r * 0.26 * open, 0.4);
        ctx.restore();
        ctx.globalAlpha = Math.min(1, k * 2); ctx.strokeStyle = q.c2; ctx.lineWidth = 1; poly([[q.x - c * r * 1.3, q.y - s * r * 1.3], [q.x + c * r * 1.3, q.y + s * r * 1.3]]);
        ctx.globalAlpha = 1; break;
      }
      case 'iai': {
        const L = q.len * (0.7 + 0.3 * k);
        ctx.lineCap = 'butt';
        ctx.strokeStyle = C.K; ctx.lineWidth = 5 * k + 1; poly([[q.x - L, q.y], [q.x + L, q.y]]);
        ctx.strokeStyle = C.B; ctx.lineWidth = 3.5 * k + 0.5; poly([[q.x - L, q.y], [q.x + L, q.y]]);
        ctx.strokeStyle = C.W; ctx.lineWidth = 1.5 * k + 0.3; poly([[q.x - L, q.y], [q.x + L, q.y]]);
        ctx.lineCap = 'round'; break;
      }
      case 'smoke': {
        const r = q.size * (1.4 - k * 0.6);
        ctx.globalAlpha = Math.min(1, k * 1.6) * 0.85; ctx.fillStyle = k > 0.6 ? '#6a6a6a' : '#b4b4b4'; disc(q.x, q.y, r); ctx.globalAlpha = 1; break;
      }
    }
  }
}
function drawTexts() {
  for (const t of texts) {
    ctx.globalAlpha = Math.min(1, t.life / 14);
    text(t.s, t.x, t.y, {sc: t.sc, color: t.color, outline: t.outline, align: 'center'});
  }
  ctx.globalAlpha = 1;
}
function drawAfterimages() {
  for (const a of afterimages) {
    ctx.globalAlpha = a.life / a.max * 0.5;
    if (a.boss === 'gun') drawFigure(a.x, a.y, a.face, a.pose, {color: C.Y, cape: {color: '#ffe98a'}, hood: {color: '#ffe98a'}});
    else if (a.boss === 'sword') drawFigure(a.x, a.y, a.face, a.pose, {color: C.B, kasa: {color: C.B}, hair: {color: '#8fa0e6'}});
    else if (a.boss === 'chain') drawFigure(a.x, a.y, a.face, a.pose, {color: C.R, cape: {color: '#f08a92', tatter: true, len: 2.1}});
    else if (a.boss === 'origin') drawFigure(a.x, a.y, a.face, a.pose, {color: C.P, band: {color: C.P, n: 5}, cape: {color: '#d8b8e8', tatter: true, len: 1.9}, sword: {len: SWORD_LEN, color: C.P}});
    else if (a.boss) drawFigure(a.x, a.y, a.face, a.pose, {color: C.G2, scarf: {color: C.G3, n: 2}});
    else drawFigure(a.x, a.y, a.face, a.pose, {color: a.color, sword: {len: SWORD_LEN, color: a.color}});
  }
  ctx.globalAlpha = 1;
}
/* 특성 잔상 반격: the blue afterimage of the hero, lunging in and cutting */
function drawGhostCut(G) {
  const sw = G.swing != null && G.t - G.swing < 5, u = sw ? (G.t - G.swing) / 4 : 0;
  const q = sw ? flatPose(lerp(-2.0, 1.9, u), false, false) : G.t < 11 ? makePose({hy: -11, lean: 0.72, ht: -0.25, l1: -1.2, l2: 0.1, r1: 0.75, r2: -1.3, bu: -1.3, bf: 0.7, fu: 0.1, ff: -0.25, sa: -1.5}) : flatPose(1.9, false, false);
  ctx.globalAlpha = Math.max(0, Math.min(0.75, (32 - G.t) / 8));
  drawFigure(G.x, G.y, G.face, q, {color: C.B, outline: C.W, band: true, t: globalT, sword: {len: SWORD_LEN, color: C.B, edge: C.W}});
  ctx.globalAlpha = 1;
}
function drawWorld() {
  ctx.save();
  if (zoomPunch > 0 && !reduceMotion) { const z = 1 + zoomPunch * 0.035, cx = clamp(player.x, 120, W - 120), cy = player.y - 30; ctx.translate(cx, cy); ctx.scale(z, z); ctx.translate(-cx, -cy); }
  if (shakeAmt) ctx.translate(Math.round((Math.random() * 2 - 1) * shakeAmt), Math.round((Math.random() * 2 - 1) * shakeAmt));
  if (mode === 'practice') { ctx.drawImage(bgP, 0, 0); drawSign(); }
  else drawStageBg(bgMix);
  drawPlatforms(); drawMarkers(); drawPeaks();
  drawAfterimages();
  if (justGhost) { ctx.globalAlpha = 0.6 * (1 - justGhost.t / 30); drawFigure(justGhost.x, justGhost.y, justGhost.face, justGhost.pose, {color: C.B, sword: {len: SWORD_LEN, color: C.B}}); ctx.globalAlpha = 1; }
  if (mode === 'practice') for (const d of dummies) drawDummy(d);
  else { if (mobs.length) drawMobs(); if (!boss.hidden) drawBoss(); }
  drawPlayer();
  if (player.ghostCut) drawGhostCut(player.ghostCut);
  drawSpikes(); drawWaves(); drawSlashWaves(); drawArrows(); drawBlades(); drawRain(); drawClassSkillFx(); drawBeams(); drawCuts(); drawBlasts(); drawPShots();
  drawItems(); drawParticles(); drawLockon(); drawTexts();
  // slow motion: the world goes cold and blue, the hero stays sharp on top
  if (slowmo > 0) {
    const k = Math.min(1, slowmo / 14, (slowMax - slowmo + 1) / 5);
    ctx.globalAlpha = 0.3 * k; ctx.fillStyle = C.B; ctx.fillRect(-30, -30, W + 60, H + 60); ctx.globalAlpha = 1;
    drawPlayer(); drawPShots();
  }
  // 특성 시간 정지: the stopped world turns negative; the hero and his own blades go on in colour
  if (timeStop > 0) {
    ctx.globalCompositeOperation = 'difference'; ctx.fillStyle = C.W; ctx.fillRect(-30, -30, W + 60, H + 60); ctx.globalCompositeOperation = 'source-over';
    drawPeaks(); drawWaves(); drawSlashWaves(); drawBlades(); drawPlayer(); if (player.ghostCut) drawGhostCut(player.ghostCut); drawPShots();
  }
  ctx.restore();
  if (slowmo > 0 || timeStop > 0) {
    const ts = timeStop > 0, k = ts ? Math.min(1, timeStop / 8, (timeStopMax - timeStop + 1) / 4) : Math.min(1, slowmo / 14, (slowMax - slowmo + 1) / 5), bh = Math.round((ts ? 14 : 9) * k);
    ctx.fillStyle = C.K; ctx.fillRect(0, 0, W, bh); ctx.fillRect(0, H - bh, W, bh);
    ctx.fillStyle = ts ? C.W : C.B; ctx.fillRect(0, bh, W, 1); ctx.fillRect(0, H - bh - 1, W, 1);
  }
  if (flash.a > 0) { ctx.globalAlpha = Math.min(1, flash.a); ctx.fillStyle = flash.color; ctx.fillRect(0, 0, W, H); ctx.globalAlpha = 1; }
  // screen splits: the picture is shoved apart along each fresh cut, then seals
  for (const s of splitFx) {
    if (s.big) { const open = s.t < 8 ? easeOut(s.t / 8) : Math.max(0, (34 - s.t) / 26); if (open > 0) sliceScreen(s.x, s.y, s.ang, open * 22, open * 14); }
    else { const k = 1 - s.t / 8; if (k > 0) sliceScreen(s.x, s.y, s.ang, k * 6, k * 1.5); }
  }
  // photographic negative for a couple of frames: the world inverts at the instant of a draw
  if (inkFlash > 0) { ctx.globalCompositeOperation = 'difference'; ctx.fillStyle = C.W; ctx.fillRect(0, 0, W, H); ctx.globalCompositeOperation = 'source-over'; }
}
const STAGE_BG = {bow: () => [bg1, bg2], gun: () => [bgCity, bgExec], sword: () => [bgPark, bgMoon], chain: () => [bgGate, bgOrbit]};
function drawStageBg(mix) {
  drawStageBgBase(mix);
  // 일검무귀: where its shards were torn out, the world shows black for a moment
  if (scene === 'special' && storm.ig && storm.ig.chips) {
    const k = Math.max(0, 1 - (sceneT - IG.blast) / 60);
    if (k > 0) { ctx.globalAlpha = k; ctx.fillStyle = C.K; for (const c of storm.ig.chips) ctx.fillRect(c.sx, c.sy, c.w, c.h); ctx.globalAlpha = 1; }
  }
}
function drawStageBgBase(mix) {
  if (stage.key === 'origin') { drawOriginBg(mix); return; }
  const [a, b] = STAGE_BG[stage.key]();
  ctx.drawImage(a, 0, 0);
  if (mix > 0) { const top = Math.round(H * (1 - mix)); if (top < H) ctx.drawImage(b, 0, top, W, H - top, 0, top, W, H - top); }
  if (stage.key === 'gun' && H * (1 - mix) > 150) text('라멘', 225, 136, {color: C.W, align: 'center'});
  // the assassin's ultimate bleaches the world in moonlight
  if (stage.key === 'sword' && boss.state === 'ult' && scene === 'fight') { ctx.globalAlpha = 0.45; ctx.fillStyle = C.W; ctx.fillRect(0, 0, W, H); ctx.globalAlpha = 1; }
}

/* ---------- HUD ---------- */
function drawIcon(kind, x, y) {
  ctx.lineCap = 'round';
  if (kind === 'slash') { ctx.strokeStyle = C.W; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(x + 6, y + 12, 9, -1.3, 0.2); ctx.stroke(); drawBlade(x + 4, y + 14, 0.7, -0.7, 13, 3, C.K, C.W); }
  else if (kind === 'dash') {
    ctx.strokeStyle = C.W; ctx.lineWidth = 1; for (let i = 0; i < 3; i++) poly([[x + 2, y + 5 + i * 4], [x + 7, y + 5 + i * 4]]);
    ctx.strokeStyle = C.K; ctx.lineWidth = 2; poly([[x + 8, y + 4], [x + 12, y + 9], [x + 8, y + 14]]); poly([[x + 12, y + 4], [x + 16, y + 9], [x + 12, y + 14]]);
  } else if (kind === 'blades') { for (let i = -1; i <= 1; i++) drawBlade(x + 9 + i * 3, y + 16, Math.sin(i * 0.45), -Math.cos(i * 0.45), 12, 3, C.K, C.W); }
  else if (kind === 'fury') {
    ctx.fillStyle = C.K;
    for (let k = 0; k < 3; k++) { const cx = x + 4 + k * 5; ctx.beginPath(); ctx.moveTo(cx - 2, y + 3); ctx.quadraticCurveTo(cx + 5, y + 9, cx - 2, y + 15); ctx.quadraticCurveTo(cx + 1, y + 9, cx - 2, y + 3); ctx.fill(); }
    ctx.strokeStyle = C.W; ctx.lineWidth = 1; poly([[x + 2, y + 9], [x + 5, y + 9]]);
  } else if (kind === 'peak') {
    ctx.fillStyle = C.K; ctx.fillRect(x + 1, y + 15, 16, 2);
    drawBlade(x + 5, y + 15, -0.2, -0.98, 10, 3, C.K, C.W); drawBlade(x + 9, y + 15, 0, -1, 13, 4, C.K, C.W); drawBlade(x + 13, y + 15, 0.2, -0.98, 10, 3, C.K, C.W);
  } else if (kind === 'rain') {
    ctx.fillStyle = C.K; ctx.fillRect(x + 2, y + 2, 14, 2);
    for (const [ox, oy] of [[4, 6], [9, 9], [14, 5]]) drawBlade(x + ox, y + oy, 0, 1, 8, 2, C.K, C.W);
  } else if (kind === 'god') {
    // 일검무귀: a blood-red greatsword and the one hairline cut
    drawBlade(x + 2, y + 16, 0.72, -0.7, 17, 5, '#6e000c', C.R);
    ctx.fillStyle = C.W; ctx.fillRect(x, y + 8, 18, 1);
  } else if (kind === 'slot') {
    ctx.strokeStyle = C.W; ctx.lineWidth = 1; ctx.setLineDash([2, 2]); ctx.strokeRect(x + 2.5, y + 2.5, 13, 13); ctx.setLineDash([]);
    ctx.fillStyle = C.Y; ctx.fillRect(x + 8, y + 5, 2, 8); ctx.fillRect(x + 5, y + 8, 8, 2);
  } else if (kind === 'cape') {
    ctx.fillStyle = C.K; ctx.beginPath(); ctx.moveTo(x + 6, y + 3); ctx.lineTo(x + 12, y + 3); ctx.lineTo(x + 16, y + 16); ctx.lineTo(x + 12, y + 13); ctx.lineTo(x + 9, y + 17); ctx.lineTo(x + 6, y + 13); ctx.lineTo(x + 2, y + 16); ctx.closePath(); ctx.fill();
    ctx.fillStyle = C.W; ctx.fillRect(x + 6, y + 3, 6, 1);
  } else if (kind === 'halo') {
    ctx.strokeStyle = C.Y; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(x + 9, y + 9, 5, 0, TAU); ctx.stroke();
    for (let i = 0; i < 8; i++) { const a = i / 8 * TAU; poly([[x + 9 + Math.cos(a) * 6, y + 9 + Math.sin(a) * 6], [x + 9 + Math.cos(a) * 9, y + 9 + Math.sin(a) * 9]]); }
  } else if (CLASS_ICONS[kind]) CLASS_ICONS[kind](x, y);
  else if (kind === 'rising') {
    ctx.fillStyle = C.W; ctx.beginPath(); ctx.moveTo(x + 4, y + 17); ctx.quadraticCurveTo(x + 18, y + 10, x + 8, y + 1); ctx.quadraticCurveTo(x + 13, y + 10, x + 4, y + 17); ctx.fill();
    drawBlade(x + 8, y + 16, 0.15, -0.99, 12, 3, C.K, C.W);
  } else {
    ctx.strokeStyle = C.W; ctx.lineWidth = 1;
    for (let i = 0; i < 8; i++) { const a = i / 8 * TAU; poly([[x + 9 + Math.cos(a) * 3, y + 9 + Math.sin(a) * 3], [x + 9 + Math.cos(a) * 8, y + 9 + Math.sin(a) * 8]]); }
    ctx.fillStyle = C.K; disc(x + 9, y + 9, 4); ctx.fillStyle = C.Y; disc(x + 9, y + 9, 3);
  }
}
function drawHUD() {
  const p = player, b = boss;
  if (mode !== 'practice' && battleScene === 'mini' && !wave) {
    // the tutorial's empty field before the first wave
  } else if (mode !== 'practice' && battleScene === 'mini' && wave) {
    // mini stage: wave counter and the minions left
    const left = mobs.filter(m => m.hp > 0).length + wave.queue.length, total = WAVES[stage.key][wave.i].reduce((s, e) => s + e[1], 0);
    text('WAVE ' + (wave.i + 1) + '/' + wave.n, 474, 4, {sc: 2, color: C.R, outline: C.W, align: 'right'});
    text('사슬의 하수인  ' + left + ' / ' + total, 474, 21, {color: C.K, outline: C.W, align: 'right'});
    ctx.fillStyle = C.K; ctx.fillRect(373, 33, 102, 4); ctx.fillStyle = C.R; ctx.fillRect(374, 34, Math.round(100 * left / Math.max(1, total)), 2);
  } else if (mode !== 'practice') {
    const bx0 = 120, bw = 352;
    ctx.fillStyle = C.K; ctx.fillRect(bx0 - 1, 3, bw + 2, 6);
    ctx.fillStyle = C.W; ctx.fillRect(bx0, 4, Math.round(bw * b.lagHp / b.maxHp), 4);
    ctx.fillStyle = C.R; ctx.fillRect(bx0, 4, Math.round(bw * b.hp / b.maxHp), 4);
    // phase marks: half-way, or the original's 60% and 15%
    ctx.fillStyle = C.K; for (const f of b.kind === 'origin' ? [ORIGIN.p2, ORIGIN.p3] : [0.5]) ctx.fillRect(Math.round(bx0 + bw * f), 3, 1, 6);
    const bossName = stage.boss;
    text(bossName, bx0 + bw, 12, {align: 'right', outline: C.W});
    text('LV.' + stage.lv, bx0 + bw - kWidth(bossName) - 6, 12, {align: 'right', color: C.R, outline: C.W});
    const tag = b.p3 ? '발악' : b.phase === 2 ? '각성' : null;
    if (tag) text(tag, bx0 + bw - kWidth(bossName) - 48, 12, {align: 'right', color: b.p3 ? C.R : stage.col === C.Y ? C.R : stage.col, outline: C.W});
  }

  text('LV.' + save.lv, 6, 4, {sc: 2, outline: C.W});
  text('/999', 78, 11, {color: C.R, outline: C.W});
  ctx.fillStyle = C.K; ctx.fillRect(6, 21, 78, 11); ctx.fillStyle = C.W; ctx.fillRect(7, 22, 76, 9);
  text('HP', 8, 23, {color: C.R});
  ctx.fillStyle = (p.hp <= p.maxHp * 0.3 && (globalT & 8)) ? C.K : C.R; ctx.fillRect(21, 23, Math.round(61 * p.hp / p.maxHp), 7);
  text(heroClass().name, 6, 37, {color: isMaster() ? C.R : C.K, outline: C.W});
  text('SP', 6, 50, {outline: C.W});
  ctx.fillStyle = C.K; ctx.fillRect(20, 50, 64, 7); ctx.fillStyle = C.W; ctx.fillRect(21, 51, 62, 5);
  ctx.fillStyle = p.sp >= 100 && (globalT & 8) ? C.R : C.Y; ctx.fillRect(21, 51, Math.round(62 * p.sp / 100), 5);
  if (p.sp >= 100) text('필살기 준비! U 길게', 90, 50, {color: C.R, outline: C.W});
  let by = 64;
  if (slowmo > 0 || timeStop > 0) {
    const ts = timeStop > 0;
    text(ts ? '시간 정지' : '시간 감속', 6, by, {color: ts ? C.K : C.B, outline: C.W});
    ctx.fillStyle = C.K; ctx.fillRect(6, by + 11, 78, 3); ctx.fillStyle = ts ? C.W : C.B; ctx.fillRect(7, by + 12, Math.round(76 * (ts ? timeStop / timeStopMax : slowmo / slowMax)), 1);
    if (p.counter > 0 && (globalT & 8)) text('반격 준비', 90, by, {color: C.R, outline: C.W});
    by += 18;
  }
  if (p.adren > 0) {
    text('아드레날린 러시', 6, by, {color: C.R, outline: C.W});
    ctx.fillStyle = C.R; ctx.fillRect(6, by + 11, Math.round(88 * Math.min(1, p.adren / adrenMax())), 2);
    by += 17;
    for (const s of ['모든 공격 · 스킬 강화', '공격력 · 공격 속도 증가', '이동 속도 증가']) {
      ctx.fillStyle = C.G2; ctx.fillRect(8, by + 1, 1, 6); ctx.fillRect(7, by + 2, 3, 1); ctx.fillRect(6, by + 3, 5, 1);
      text(s, 14, by, {outline: C.W}); by += 12;
    }
  }
  if (combo.n >= 2) {
    const sc = combo.pop > 3 ? 4 : 3, cy = by + 4;
    const w = text(String(combo.n), 6, cy, {sc, color: C.R, outline: C.K});
    const cw = text('콤보', 12 + w, cy + sc * 7 - 13, {sc: 2, italic: true, color: C.K, outline: C.W});
    ctx.fillStyle = C.K; ctx.fillRect(6, cy + sc * 7 + 3, w + cw + 12, 1);
  }
  // J, K, the equipped skill slots (their keys and what they hold), then the special
  const slots = [['J', 'slash', 0], ['K', 'dash', p.dashCd / (upgLv('dash') >= 1 ? 24 : 34)]];
  for (let i = 0; i < slotCount(); i++) { const id = save.loadout[i]; slots.push([SLOT_KEYS[i], id ? SKILLS[id].icon : null, id ? skillCd(p, id) : 0, id]); }
  slots.push(['U', useGodUlt() ? 'god' : 'special', 1 - p.sp / 100]);
  slots.forEach(([key, icon, cd, id], i) => {
    const x = 8 + i * 23, y = 247, master = id && SKILLS[id].cls >= 1;
    ctx.fillStyle = master ? C.Y : C.W; ctx.fillRect(x - 1, y - 1, 20, 20);
    ctx.fillStyle = icon ? C.R : C.K; ctx.fillRect(x, y, 18, 18);
    if (icon) drawIcon(icon, x, y); else { ctx.strokeStyle = '#6a6a6a'; ctx.lineWidth = 1; ctx.setLineDash([2, 2]); ctx.strokeRect(x + 2.5, y + 2.5, 13, 13); ctx.setLineDash([]); }
    if (cd > 0) { ctx.globalAlpha = 0.6; ctx.fillStyle = C.K; ctx.fillRect(x, y, 18, Math.round(18 * Math.min(1, cd))); ctx.globalAlpha = 1; }
    if ((key === 'U' && p.sp >= 100 || id === 'reign' && p.reign || id === 'formless' && p.formless || id === 'domain' && p.domain) && (globalT & 8)) { ctx.strokeStyle = C.Y; ctx.lineWidth = 1; ctx.strokeRect(x - 1.5, y - 1.5, 21, 21); }
    text(key, x + 15, y + 12, {color: C.Y, outline: C.K});
  });
  if (((scene === 'fight' || scene === 'mini') && fightT < 1440) || scene === 'practice') {
    const tips = ['공격 직전에 K: 저스트 회피', 'J 5연타: 그랜드 슬램', '대시 중 J: 팬텀 피어스', '공중에서 S+J: 메테오 플런지', 'SP가 차면 U를 길게', '스킬 장착은 월드 맵 · 스킬 창에서']
      .concat(save.loadout.slice(0, slotCount()).map((id, i) => id ? SLOT_KEYS[i] + ' ' + SKILLS[id].name : null).filter(Boolean))
      .concat(isMaster() ? ['땅에서 S+J: 승룡검'] : []).concat(useGodUlt() ? ['U 필살기: 일검무귀 (HP 20% 소모)'] : []);
    const extra = scene === 'practice' ? [] : {gun: ['로켓은 베어서 되돌려 보낼 수 있다'], sword: ['발도의 선이 깜박이면 점프!', '명경지수 자세에는 손대지 말 것'],
      chain: ['빼앗긴 천검은 베어서 떨어뜨릴 수 있다', '바닥 사슬은 점프, 머리 높이 사슬은 그대로'],
      origin: ['그는 너와 같은 기술을 쓴다', '일검무귀: 터지는 순간 점프!', '백화난무: 점선 원 밖으로!', '천붕검: 바닥 표식을 피하라']}[stage.key] || [];
    const list = extra.concat(tips);
    if (!tut) text(list[Math.floor(fightT / 240) % list.length], (scene === 'practice' ? 250 : 262) + slotCount() * 12, 255, {color: C.W, align: 'center'});
  }
  if (mode === 'practice') text('P 연습 설정', 474, 255, {align: 'right', color: C.Y});
  else text('크레딧 ' + Math.max(0, 1 - stats.continues), 474, 255, {align: 'right', color: C.W});
  if (scene === 'fight' && mode !== 'practice' && fightT < 150) drawQuest(fightT);
  if (scene === 'mini' && fightT < 150 && !tut) drawQuest(fightT, '사슬의 하수인을 소탕하라');
  if (tut && (scene === 'mini' || scene === 'special')) drawTutorial();
}
function drawBigText() {
  if (!bigText) return;
  const bt = bigText, sc = bt.sc || 3;
  const inU = Math.min(1, bt.t / 10), outU = Math.max(0, (bt.t - (bt.dur - 12)) / 12);
  const x = 240 + (1 - easeOut(inU)) * 320 - outU * outU * 320, y = 92;
  ctx.fillStyle = C.K; ctx.fillRect(0, y - 6, W, 1); ctx.fillRect(0, y + 26, W, 1);
  text(bt.s, x, y, {sc, italic: true, color: bt.color || C.R, outline: bt.outline || C.K, align: 'center'});
}
