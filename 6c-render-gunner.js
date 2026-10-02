/* ---------- Bullet Hell Shooter rendering: telegraphs, the gunner, bullets, ordnance, blasts, soul shots ---------- */
function gunnerLook(o) { return Object.assign({hood: {color: C.Y, star: C.R}, cape: {color: C.Y, star: C.R}}, o); }
function gunnerGuns(b) {
  if (b.launcher || b.state === 'grenade' || (b.state === 'dead' && b.st > 40) || (b.state === 'roll' && b.roll > 0)) return [];
  if (b.state === 'golden') return [{hand: 'F', aim: b.aim, color: C.Y, trim: C.W, big: true}];
  const aimF = b.drawing ? b.aim : null, aimB = b.drawing ? (b.aim2 != null ? b.aim2 : b.aim) : null, gc = b.gold ? C.Y : C.K, trim = b.gold ? C.W : C.Y;
  const dual = b.phase === 2 || b.state === 'ring' || b.state === 'ult';
  return dual ? [{hand: 'F', aim: aimF, color: gc, trim}, {hand: 'B', aim: aimB, color: gc, trim}] : [{hand: 'F', aim: aimF, color: gc, trim}];
}
function drawGunTelegraphs(b) {
  const pulse = (globalT >> 2) & 1;
  if (b.sight === 1 || b.sight === 2) {
    const [mx, my] = gunOrigin(b, b.aim), ex = mx + Math.cos(b.aim) * 600, ey = my + Math.sin(b.aim) * 600;
    if (b.sight === 1) { ctx.globalAlpha = 0.85; ctx.strokeStyle = C.R; ctx.lineWidth = 1; ctx.setLineDash([3, 3]); poly([[mx, my], [ex, ey]]); ctx.setLineDash([]); ctx.globalAlpha = 1; }
    else { ctx.strokeStyle = C.R; ctx.lineWidth = (globalT & 2) ? 2.5 : 1.2; poly([[mx, my], [ex, ey]]); ctx.fillStyle = (globalT & 2) ? C.Y : C.R; disc(mx, my, 2.5); }
  }
  if (b.sight === 3) {
    const [mx, my] = gunOrigin(b, b.aim);
    ctx.globalAlpha = pulse ? 0.4 : 0.25; ctx.fillStyle = C.R;
    ctx.beginPath(); ctx.moveTo(mx, my); ctx.arc(mx, my, 96, b.aim - 0.45, b.aim + 0.45); ctx.closePath(); ctx.fill(); ctx.globalAlpha = 1;
  }
  if (b.reticle) {
    const r = b.reticle, col = r.lock ? (pulse ? C.R : C.Y) : C.R;
    ctx.globalAlpha = 0.5; ctx.strokeStyle = C.R; ctx.lineWidth = 1; ctx.setLineDash([1, 3]); poly([[b.x + b.face * 14, b.y - 30], [r.x, r.y]]); ctx.setLineDash([]); ctx.globalAlpha = 1;
    ctx.strokeStyle = col; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(r.x, r.y, 11, 0, TAU); ctx.stroke();
    poly([[r.x - 17, r.y], [r.x - 6, r.y]]); poly([[r.x + 6, r.y], [r.x + 17, r.y]]); poly([[r.x, r.y - 17], [r.x, r.y - 6]]); poly([[r.x, r.y + 6], [r.x, r.y + 17]]);
    if (r.lock) { ctx.lineWidth = 1; ctx.setLineDash([2, 3]); ctx.beginPath(); ctx.arc(r.x, r.y, 34, 0, TAU); ctx.stroke(); ctx.setLineDash([]); }
  }
  for (const L of b.lines) {
    const x0 = b.x + b.face * 16, x1 = b.face > 0 ? W : 0;
    ctx.strokeStyle = pulse ? C.Y : C.R; ctx.lineWidth = 2; ctx.setLineDash([6, 4]); poly([[x0, L.y], [x1, L.y]]); ctx.setLineDash([]);
    ctx.fillStyle = ctx.strokeStyle;
    for (let x = x0 + b.face * 26; b.face > 0 ? x < x1 : x > x1; x += b.face * 44) { ctx.beginPath(); ctx.moveTo(x, L.y - 6); ctx.lineTo(x + b.face * 6, L.y); ctx.lineTo(x, L.y + 6); ctx.fill(); }
  }
  for (const a of arrows) if (a.kind === 'grenade' && !a.friendly && a.fuse < 40) {
    ctx.strokeStyle = (globalT & 4) ? C.R : C.Y; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.ellipse(a.x, FLOOR - 1, 30, 5, 0, 0, TAU); ctx.stroke();
  }
}
function drawGunner() {
  const b = boss;
  drawGunTelegraphs(b);
  if (b.alpha <= 0) return;
  let col = C.K, out = C.W;
  if (b.flash > 0 && (b.flash & 2)) { col = C.W; out = C.R; }
  ctx.globalAlpha = b.alpha;
  const P = drawFigure(b.x, b.y, b.face, bossPose(b), gunnerLook({color: col, outline: out, eyes: b.freed ? null : C.R, t: b.animT, guns: gunnerGuns(b),
    cape: {color: C.Y, star: C.R, trail: Math.min(4, Math.abs(b.vx)) * 0.6}, launcher: b.launcher ? {aim: b.aim, loaded: b.releaseT <= 0} : null}));
  ctx.globalAlpha = 1;
  if (b.state === 'whip' && b.st >= 14 && b.st < 22) { ctx.globalAlpha = 1 - (b.st - 14) / 8; drawSwoosh(P.sh[0], P.sh[1], b.face, -2.4, 1.9, 34, 10, C.Y); ctx.globalAlpha = 1; }
  if (b.gold && b.state === 'golden' && b.releaseT <= 0) { const [mx, my] = gunOrigin(b, b.aim); ctx.fillStyle = (globalT & 2) ? C.W : C.Y; disc(mx, my, 2 + ((globalT >> 1) % 3)); }
  if (b.state === 'stun') for (let i = 0; i < 3; i++) { const a = b.animT * 0.12 + i * TAU / 3; starShape(P.head[0] + Math.cos(a) * 9, P.head[1] - 8 + Math.sin(a) * 3); }
  const excl = (b.state === 'burst' && b.st < 10) || (b.state === 'shotgun' && b.st < 14) || (b.state === 'whip' && b.st < 14) || (b.state === 'golden' && b.st < 18)
    || (b.state === 'kata' && b.st < 22) || (b.state === 'rocket' && b.st < 18) || (b.state === 'ring' && b.st > 18 && b.st < 34) || (b.state === 'grenade' && b.st < 14);
  if (excl && ((globalT >> 2) & 1)) text('!', P.head[0], P.head[1] - 22, {sc: 2, color: C.R, outline: C.K, align: 'center'});
}
function drawShot(a) {
  const x = a.x, y = a.y;
  if (a.kind === 'spark') {
    // sparks: a violet ember with a short white streak
    if (a.trail.length > 1) { ctx.strokeStyle = C.W; ctx.lineWidth = 1; poly(a.trail.concat([[x, y]])); }
    ctx.fillStyle = C.W; disc(x, y, 3.4); ctx.fillStyle = C.P; disc(x, y, 2.4); ctx.fillStyle = C.W; ctx.fillRect(Math.round(x) - 1, Math.round(y) - 1, 2, 2);
    return;
  }
  if (a.kind === 'orb') { ctx.fillStyle = C.W; disc(x, y, 4.2); ctx.fillStyle = C.K; disc(x, y, 3.1); ctx.fillStyle = C.Y; disc(x, y, 1.5); return; }
  if (a.kind === 'pellet') { ctx.fillStyle = C.W; disc(x, y, 3.4); ctx.fillStyle = C.K; disc(x, y, 2.5); ctx.fillStyle = C.Y; disc(x, y, 1.1); return; }
  if (a.kind === 'bullet') {
    // red tracer streak, then a black-rimmed gold slug: reads on the white street, the sky and the dark towers
    const sp = Math.hypot(a.vx, a.vy) || 1, dx = a.vx / sp, dy = a.vy / sp;
    ctx.lineCap = 'round';
    ctx.strokeStyle = C.R; ctx.lineWidth = 1.5; poly([[x - dx * 16, y - dy * 16], [x - dx * 4, y - dy * 4]]);
    ctx.strokeStyle = C.W; ctx.lineWidth = 5.4; poly([[x - dx * 5, y - dy * 5], [x + dx * 2, y + dy * 2]]);
    ctx.strokeStyle = C.K; ctx.lineWidth = 3.8; poly([[x - dx * 5, y - dy * 5], [x + dx * 2, y + dy * 2]]);
    ctx.strokeStyle = C.Y; ctx.lineWidth = 1.6; poly([[x - dx * 4, y - dy * 4], [x + dx, y + dy]]);
    return;
  }
  if (a.kind === 'rocket') {
    ctx.save(); ctx.translate(x, y); ctx.rotate(Math.atan2(a.vy, a.vx));
    ctx.fillStyle = (globalT & 2) ? C.Y : C.R; ctx.beginPath(); ctx.moveTo(-8, -2.5); ctx.lineTo(-15 - (globalT % 3) * 2, 0); ctx.lineTo(-8, 2.5); ctx.fill();
    ctx.fillStyle = C.W; ctx.fillRect(-10, -4, 13, 8);
    ctx.fillStyle = C.K; ctx.fillRect(-9, -3, 11, 6); ctx.fillRect(-10, -5, 3, 10);
    ctx.fillStyle = a.friendly ? C.B : C.R; ctx.beginPath(); ctx.moveTo(2, -3.5); ctx.lineTo(8, 0); ctx.lineTo(2, 3.5); ctx.fill();
    ctx.fillStyle = C.Y; ctx.fillRect(-6, -1, 6, 1);
    ctx.restore();
    return;
  }
  // grenade
  ctx.fillStyle = C.W; disc(x, y, 4.4); ctx.fillStyle = C.K; disc(x, y, 3.6);
  ctx.fillStyle = a.friendly ? C.B : C.G1; disc(x, y, 2.4);
  const cx = x + Math.cos(a.spin) * 3, cy = y + Math.sin(a.spin) * 3; ctx.fillStyle = C.K; ctx.fillRect(Math.round(cx) - 1, Math.round(cy) - 1, 3, 3);
  if (a.fuse < 30 && (a.fuse & 4)) { ctx.fillStyle = C.R; disc(x, y, 2.2); }
}
function starburst(x, y, r, n, col, rot) {
  ctx.fillStyle = col; ctx.beginPath();
  for (let i = 0; i < n * 2; i++) { const a = rot + i * Math.PI / n, rr = i % 2 ? r * 0.58 : r; ctx.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); }
  ctx.closePath(); ctx.fill();
}
function drawBlasts() {
  for (const bl of blasts) {
    if (bl.t < 3) { ctx.fillStyle = C.W; disc(bl.x, bl.y, bl.r * 1.1); ctx.fillStyle = C.K; ctx.lineWidth = 2; ctx.strokeStyle = C.K; ctx.beginPath(); ctx.arc(bl.x, bl.y, bl.r * 1.1, 0, TAU); ctx.stroke(); continue; }
    const u = bl.t / 22, r = bl.r * (0.55 + easeOut(Math.min(1, bl.t / 6)) * 0.6) * (1 - Math.max(0, u - 0.6) * 1.6);
    if (r <= 1) continue;
    starburst(bl.x, bl.y, r * 1.22, 9, C.K, bl.t * 0.08);
    starburst(bl.x, bl.y, r, 9, bl.friendly ? C.B : C.R, bl.t * 0.08);
    ctx.fillStyle = C.Y; disc(bl.x, bl.y, r * 0.6);
    if (bl.t < 12) { ctx.fillStyle = C.W; disc(bl.x, bl.y, r * 0.3); }
  }
}
function drawPShots() {
  for (const s of pshots) {
    const col = s.kind === 'gold' ? C.Y : C.G2, light = s.kind === 'gold' ? C.W : C.G3;
    if (s.t < 0) { ctx.fillStyle = light; disc(s.x, s.y, 2); continue; }
    if (s.trail.length > 1) {
      const pts = s.trail.concat([[s.x, s.y]]);
      ctx.lineCap = 'round'; ctx.strokeStyle = col;
      for (let i = 1; i < pts.length; i++) { ctx.lineWidth = 0.5 + 3 * i / pts.length; poly([pts[i - 1], pts[i]]); }
    }
    const sp = Math.hypot(s.vx, s.vy) || 1, dx = s.vx / sp, dy = s.vy / sp;
    if (s.kind === 'spirit') {
      ctx.strokeStyle = light; ctx.lineWidth = 1.5; poly([[s.x - dx * 10, s.y - dy * 10], [s.x, s.y]]);
      ctx.fillStyle = C.K; ctx.beginPath(); ctx.moveTo(s.x + dx * 4, s.y + dy * 4); ctx.lineTo(s.x - dx * 2 - dy * 3, s.y - dy * 2 + dx * 3); ctx.lineTo(s.x - dx * 2 + dy * 3, s.y - dy * 2 - dx * 3); ctx.fill();
      ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(s.x + dx * 3, s.y + dy * 3); ctx.lineTo(s.x - dx - dy * 2, s.y - dy + dx * 2); ctx.lineTo(s.x - dx + dy * 2, s.y - dy - dx * 2); ctx.fill();
    } else {
      ctx.strokeStyle = C.K; ctx.lineWidth = 3; poly([[s.x - dx * 3, s.y - dy * 3], [s.x + dx * 2, s.y + dy * 2]]);
      ctx.strokeStyle = C.Y; ctx.lineWidth = 1.5; poly([[s.x - dx * 2, s.y - dy * 2], [s.x + dx, s.y + dy]]);
    }
  }
}
/* boss card / banner skill icons for the gunner */
function gunIcon(i, x, y) {
  ctx.fillStyle = C.K; ctx.fillRect(x - 1, y - 1, 22, 22); ctx.fillStyle = C.Y; ctx.fillRect(x, y, 20, 20);
  ctx.strokeStyle = C.K; ctx.fillStyle = C.K; ctx.lineWidth = 1.5; ctx.lineCap = 'round';
  const cx = x + 10, cy = y + 10;
  if (i === 0) { drawPistol(x + 4, y + 11, 1, 0, 1.3, C.K); for (let k = 0; k < 3; k++) ctx.fillRect(x + 15, y + 4 + k * 5, 3, 2); }
  else if (i === 1) { for (let k = -2; k <= 2; k++) { const a = k * 0.22; ctx.fillRect(Math.round(cx - 4 + Math.cos(a) * 9), Math.round(cy + Math.sin(a) * 9), 2, 2); } drawPistol(x + 3, y + 10, 1, 0, 1.1, C.K); }
  else if (i === 2) { for (let k = 0; k < 8; k++) { const a = k / 8 * TAU; disc(cx + Math.cos(a) * 6.5, cy + Math.sin(a) * 6.5, 1.4); } disc(cx, cy, 2); }
  else if (i === 3) { ctx.save(); ctx.translate(cx, cy); ctx.rotate(-0.6); ctx.fillRect(-7, -2.5, 11, 5); ctx.fillStyle = C.R; ctx.beginPath(); ctx.moveTo(4, -3); ctx.lineTo(9, 0); ctx.lineTo(4, 3); ctx.fill(); ctx.restore(); }
  else { starPts(cx, cy, 7, C.K); starPts(cx, cy, 3.5, C.W); }
}
