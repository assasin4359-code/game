/* ---------- stage 4 (final) backgrounds ----------
   phase 1: the hall of the chained gate - white marble pillars, arched windows onto a red sky and moon,
   a swirling crimson portal bound by chains, a black floor split by red cracks.
   phase 2: orbit above the chained Earth - the title's planet from up close, its belt of links below,
   violet chains streaming off into space, and one giant chain span to fight on. */
function paintGateHall(g, rng) {
  g.fillStyle = C.W; g.fillRect(0, 0, W, H);
  // arched windows onto the red outside
  for (const x of [90, 390]) {
    g.fillStyle = C.R; g.beginPath(); g.moveTo(x - 30, 190); g.lineTo(x - 30, 70); g.arc(x, 70, 30, Math.PI, 0); g.lineTo(x + 30, 190); g.closePath(); g.fill();
    g.fillStyle = '#f08a92'; g.fillRect(x - 30, 150, 60, 40);
    g.fillStyle = C.W; g.beginPath(); g.arc(x + 8, 78, 9, 0, TAU); g.fill(); g.fillStyle = C.R; g.beginPath(); g.arc(x + 12, 75, 8, 0, TAU); g.fill();
    g.strokeStyle = C.K; g.lineWidth = 3; g.beginPath(); g.moveTo(x - 30, 190); g.lineTo(x - 30, 70); g.arc(x, 70, 30, Math.PI, 0); g.lineTo(x + 30, 190); g.stroke();
    g.lineWidth = 1.5; g.beginPath(); g.moveTo(x, 40); g.lineTo(x, 190); g.moveTo(x - 30, 120); g.lineTo(x + 30, 120); g.stroke();
    crossShape(g, x - 14, 158, 6, 0.1, C.K, 2, 18);
  }
  // pillars with dithered shading
  for (const x of [22, 158, 322, 458]) {
    g.fillStyle = '#d0d0d0'; g.fillRect(x - 12, 20, 24, FLOOR - 20);
    g.fillStyle = '#9a9a9a'; g.fillRect(x + 4, 20, 8, FLOOR - 20);
    g.fillStyle = C.K; g.fillRect(x - 13, 20, 2, FLOOR - 20); g.fillRect(x + 11, 20, 2, FLOOR - 20); g.fillRect(x - 17, 16, 34, 6); g.fillRect(x - 17, FLOOR - 12, 34, 6);
  }
  // vault ribs across the ceiling
  g.strokeStyle = C.K; g.lineWidth = 2;
  for (const [a, b] of [[22, 158], [158, 322], [322, 458]]) { g.beginPath(); g.moveTo(a, 22); g.quadraticCurveTo((a + b) / 2, -30, b, 22); g.stroke(); }
  // the crimson gate
  const cx = 240, cy = 118;
  g.fillStyle = C.K; g.beginPath(); g.arc(cx, cy, 64, 0, TAU); g.fill();
  for (let r = 58; r > 4; r -= 6) { g.strokeStyle = r % 12 ? C.R : '#5a0008'; g.lineWidth = 4; g.beginPath(); g.arc(cx, cy, r, rng() * TAU, rng() * TAU + 4.4); g.stroke(); }
  g.fillStyle = C.K; g.beginPath(); g.arc(cx, cy, 8, 0, TAU); g.fill();
  g.strokeStyle = C.W; g.lineWidth = 1.5; g.beginPath(); g.arc(cx, cy, 64, 0, TAU); g.stroke();
  for (let a = 0; a < TAU; a += TAU / 16) { g.fillStyle = C.K; g.save(); g.translate(cx + Math.cos(a) * 68, cy + Math.sin(a) * 68); g.rotate(a); g.fillRect(-4, -3, 8, 6); g.restore(); }
  // chains binding the gate and hanging through the hall
  heavyChain(g, 120, 0, 360, 230, C.K, 1.1); heavyChain(g, 360, 0, 120, 230, C.K, 1.1);
  heavyChain(g, 0, 60, 200, 110, C.K, 0.8); heavyChain(g, W, 50, 280, 120, C.K, 0.8);
  heavyChain(g, 60, 0, 70, 150, C.K, 0.7); heavyChain(g, 420, 0, 410, 160, C.K, 0.7);
  // steps up to the gate
  g.fillStyle = '#b4b4b4'; g.fillRect(170, 196, 140, 8); g.fillStyle = '#d8d8d8'; g.fillRect(186, 188, 108, 8);
  g.fillStyle = C.K; g.fillRect(170, 196, 140, 1); g.fillRect(186, 188, 108, 1);
  // floor: pale marble flags split by red cracks (so the black fighters stand out), black thorny roots
  // creeping in from the edges, and the abyss below
  g.fillStyle = C.W; g.fillRect(0, 204, W, FLOOR - 204);
  g.fillStyle = '#b4b4b4'; for (let x = 0; x < W; x += 32) g.fillRect(x, 205, 1, FLOOR - 205); g.fillRect(0, 222, W, 1);
  g.fillStyle = C.K; g.fillRect(0, 203, W, 2);
  g.strokeStyle = C.R; g.lineWidth = 1;
  for (let i = 0; i < 10; i++) { let x = rng() * W, y = 208 + rng() * 26; g.beginPath(); g.moveTo(x, y); for (let k = 0; k < 4; k++) { x += (rng() - 0.5) * 28; y += (rng() - 0.5) * 8; g.lineTo(x, y); } g.stroke(); }
  g.strokeStyle = C.K; g.lineWidth = 2;
  for (const [x0, d] of [[0, 1], [W, -1]]) for (let i = 0; i < 4; i++) { g.beginPath(); g.moveTo(x0, 208 + i * 8); g.quadraticCurveTo(x0 + d * (16 + i * 6), 200 + i * 9, x0 + d * (30 + i * 10), 214 + i * 6); g.stroke(); }
  g.fillStyle = C.K; g.fillRect(0, FLOOR, W, H - FLOOR);
  g.fillStyle = C.R; g.fillRect(0, FLOOR, W, 2);
  for (let i = 0; i < 40; i++) { g.fillStyle = rng() < 0.5 ? C.R : C.W; g.fillRect(Math.round(rng() * W), Math.round(FLOOR + 5 + rng() * (H - FLOOR - 7)), 1, 1); }
}
function paintOrbit(g, rng) {
  g.fillStyle = C.K; g.fillRect(0, 0, W, H);
  for (let i = 0; i < 140; i++) { g.fillStyle = rng() < 0.8 ? C.W : [C.Y, C.R, C.B][i % 3]; g.fillRect(Math.round(rng() * W), Math.round(rng() * H), 1, 1); }
  // violet chains streaming off into space
  thickChain(g, -10, 40, 500, 150, VIOLET, 1.1); thickChain(g, -10, 130, 500, 20, VIOLET, 0.9);
  // the planet from close above
  const pcx = 240, pcy = 470, pr = 280;
  g.save(); g.beginPath(); g.arc(pcx, pcy, pr, 0, TAU); g.clip();
  g.fillStyle = C.B; g.fillRect(0, 180, W, 100);
  for (let i = 0; i < 30; i++) { g.fillStyle = C.G1; g.beginPath(); g.ellipse(rng() * W, 206 + rng() * 60, 14 + rng() * 30, 5 + rng() * 8, rng() * 0.3, 0, TAU); g.fill(); }
  for (let i = 0; i < 70; i++) { g.fillStyle = C.W; g.beginPath(); g.ellipse(rng() * W, 200 + rng() * 70, 5 + rng() * 18, 1 + rng() * 2.5, rng() * 0.3 - 0.15, 0, TAU); g.fill(); }
  g.restore();
  g.strokeStyle = '#8fa0e6'; g.lineWidth = 5; g.beginPath(); g.arc(pcx, pcy, pr - 3, 0, TAU); g.stroke();
  g.strokeStyle = C.W; g.lineWidth = 1.5; g.beginPath(); g.arc(pcx, pcy, pr, 0, TAU); g.stroke();
  // the giant chain span the fight stands on
  g.fillStyle = C.K; g.fillRect(0, FLOOR - 2, W, H - FLOOR + 2);
  for (let x = -20, k = 0; x < W + 30; x += 30, k++) {
    g.strokeStyle = C.W; g.lineWidth = 2;
    g.beginPath(); if (k % 2 === 0) g.ellipse(x, FLOOR + 6, 20, 9, 0, 0, TAU); else g.rect(x - 16, FLOOR + 2, 32, 8); g.stroke();
    g.strokeStyle = VIOLET; g.lineWidth = 1; g.beginPath(); if (k % 2 === 0) g.ellipse(x, FLOOR + 6, 17, 6.5, 0, 0, TAU); else g.rect(x - 13, FLOOR + 4, 26, 4); g.stroke();
  }
  g.fillStyle = C.W; g.fillRect(0, FLOOR - 2, W, 2);
}
const bgGate = mk(), bgOrbit = mk();
paintGateHall(bgGate.getContext('2d'), seeded(113));
paintOrbit(bgOrbit.getContext('2d'), seeded(131));
