/* ---------- stage 2 backgrounds ----------
   phase 1: a sunset street - red to gold sky, a skyline with lit windows, chains hanging over the road,
   a ramen shop and a traffic light. phase 2: the execution grounds - black starry sky, a red moon,
   red ridges with crosses, white haze and floating gold rocks. */
function heavyChain(g, x0, y0, x1, y1, color, s = 1) {
  const dx = x1 - x0, dy = y1 - y0, L = Math.hypot(dx, dy), ux = dx / L, uy = dy / L, a = Math.atan2(uy, ux);
  for (let d = 0, k = 0; d < L; d += 8 * s, k++) {
    const x = x0 + ux * d, y = y0 + uy * d;
    g.beginPath();
    if (k % 2 === 0) { g.ellipse(x, y, 5 * s, 3 * s, a, 0, TAU); g.strokeStyle = color; g.lineWidth = 2 * s; g.stroke(); }
    else { g.fillStyle = color; g.save(); g.translate(x, y); g.rotate(a); g.fillRect(-4.5 * s, -1.3 * s, 9 * s, 2.6 * s); g.restore(); }
  }
}
function building(g, x, top, w, base, col, win, rng, lit = 0.45) {
  g.fillStyle = col; g.fillRect(x, top, w, base - top);
  if (!win) return;
  for (let yy = top + 5; yy < base - 6; yy += 7) for (let xx = x + 3; xx < x + w - 4; xx += 6) {
    if (rng() < lit) { g.fillStyle = win; g.fillRect(xx, yy, 3, 4); }
  }
}
function paintSunsetCity(g, rng) {
  const sky = g.createLinearGradient(0, 0, 0, 206);
  sky.addColorStop(0, '#e41424'); sky.addColorStop(0.42, '#f07a2c'); sky.addColorStop(0.78, '#ffde28'); sky.addColorStop(1, '#fff2a8');
  g.fillStyle = sky; g.fillRect(0, 0, W, H);
  // setting sun
  g.fillStyle = '#fff6c8'; g.beginPath(); g.arc(318, 150, 40, 0, TAU); g.fill();
  g.fillStyle = C.W; g.beginPath(); g.arc(318, 150, 32, 0, TAU); g.fill();
  // thin dark cloud streaks
  g.fillStyle = '#b01020';
  for (const [x, y, w] of [[20, 40, 90], [150, 26, 70], [300, 58, 120], [410, 34, 60], [90, 84, 60]]) { g.fillRect(x, y, w, 2); g.fillRect(x + 12, y + 3, w * 0.6, 1); }
  // far skyline in dark red, near skyline in black with gold windows
  for (let x = -6; x < W; x += 16 + rng() * 18) building(g, x, 120 + rng() * 50, 14 + rng() * 16, 206, '#8a0a14', '#f07a2c', rng, 0.25);
  g.fillStyle = '#8a0a14'; g.fillRect(170, 92, 3, 30); g.fillRect(166, 104, 11, 2);
  const near = [[0, 70, 44], [44, 112, 30], [74, 96, 26], [364, 104, 34], [398, 64, 46], [444, 90, 40]];
  for (const [x, top, w] of near) building(g, x, top, w, 206, C.K, C.Y, rng, 0.38);
  g.fillStyle = C.K; g.fillRect(412, 46, 16, 18); g.fillRect(410, 44, 20, 3); g.fillRect(414, 64, 2, 8); g.fillRect(424, 64, 2, 8);
  // chains strung across the sky and dangling down to the street
  heavyChain(g, 0, 18, 180, 150, C.K, 0.8); heavyChain(g, 140, -4, 110, 206, C.K, 0.9);
  heavyChain(g, 480, 10, 300, 130, C.K, 0.8); heavyChain(g, 356, -4, 390, 206, C.K, 0.9);
  heavyChain(g, 230, -4, 250, 96, C.K, 0.7);
  // ramen shop facade between the skylines, with a sign board (its label is drawn live)
  g.fillStyle = C.K; g.fillRect(222, 128, 2, 6); g.fillRect(190, 132, 70, 17);
  g.fillStyle = C.R; g.fillRect(192, 134, 66, 13);
  g.fillStyle = C.W; g.fillRect(150, 150, 150, 56);
  g.fillStyle = C.K; g.fillRect(148, 148, 154, 3); g.fillRect(150, 150, 2, 56); g.fillRect(298, 150, 2, 56);
  for (let i = 0; i < 10; i++) { g.fillStyle = i % 2 ? C.W : C.R; g.beginPath(); g.moveTo(152 + i * 15, 151); g.lineTo(167 + i * 15, 151); g.lineTo(167 + i * 15, 164); g.quadraticCurveTo(159.5 + i * 15, 170, 152 + i * 15, 164); g.fill(); }
  g.fillStyle = C.K; g.fillRect(161, 175, 60, 1); g.fillRect(231, 175, 60, 1); g.fillRect(161, 175, 1, 31); g.fillRect(220, 175, 1, 31); g.fillRect(231, 175, 1, 31); g.fillRect(290, 175, 1, 31);
  g.fillStyle = C.K; g.fillRect(190, 176, 2, 30); g.fillRect(260, 176, 2, 30);
  g.fillStyle = C.B; for (const x0 of [164, 234, 194, 264]) { g.beginPath(); g.moveTo(x0, 204); g.lineTo(x0 + 3, 204); g.lineTo(x0 + 17, 178); g.lineTo(x0 + 14, 178); g.fill(); }
  // bowl logo on the glass
  g.fillStyle = C.R; g.beginPath(); g.arc(275, 188, 7, 0, Math.PI); g.fill(); g.fillRect(268, 187, 14, 2);
  g.strokeStyle = C.K; g.lineWidth = 1; g.beginPath(); g.moveTo(272, 186); g.lineTo(278, 178); g.moveTo(275, 186); g.lineTo(281, 179); g.stroke();
  // sidewalk: kept plain white so the black fighters read cleanly against it
  g.fillStyle = C.W; g.fillRect(0, 206, W, FLOOR - 206);
  g.fillStyle = '#b4b4b4'; for (let x = 0; x < W; x += 24) g.fillRect(x, 207, 1, FLOOR - 207);
  g.fillRect(0, 223, W, 1);
  g.fillStyle = C.K; g.fillRect(0, 205, W, 2);
  // traffic light
  g.fillStyle = C.K; g.fillRect(430, 112, 4, FLOOR - 112); g.fillRect(372, 112, 62, 4);
  g.fillRect(376, 116, 30, 12);
  for (const [i, c] of [[0, C.R], [1, C.Y], [2, C.G2]]) { g.fillStyle = i === 0 ? c : '#3a3a3a'; g.beginPath(); g.arc(382 + i * 9, 122, 3, 0, TAU); g.fill(); }
  // bus stop sign + trash can
  g.fillStyle = C.K; g.fillRect(40, 176, 3, FLOOR - 176); g.beginPath(); g.arc(41.5, 172, 9, 0, TAU); g.fill();
  g.fillStyle = C.W; g.beginPath(); g.arc(41.5, 172, 7, 0, TAU); g.fill();
  g.fillStyle = C.B; g.fillRect(37, 168, 9, 6); g.fillStyle = C.K; g.fillRect(38, 174, 2, 2); g.fillRect(43, 174, 2, 2);
  g.fillStyle = C.K; g.fillRect(318, 220, 16, 20); g.fillStyle = C.G2; g.fillRect(319, 221, 14, 18); g.fillStyle = C.K; g.fillRect(317, 218, 18, 3);
  // road
  g.fillStyle = C.K; g.fillRect(0, FLOOR, W, H - FLOOR);
  g.fillStyle = C.Y; g.fillRect(0, FLOOR + 3, W, 1);
  g.fillStyle = C.W; for (let x = 8; x < W; x += 44) g.fillRect(x, 256, 22, 2);
  for (let i = 0; i < 50; i++) g.fillRect(Math.round(rng() * W), Math.round(FLOOR + 6 + rng() * (H - FLOOR - 8)), 1, 1);
}
/* floating gold rock with drips and a dangling chain */
function goldRock(g, cx, cy, w, h, rng) {
  g.fillStyle = C.K; g.beginPath(); g.moveTo(cx - w, cy);
  for (let i = 0; i <= 8; i++) { const u = i / 8; g.lineTo(cx - w + u * w * 2, cy + h * (0.6 + Math.sin(u * Math.PI) * 0.9) + rng() * 4); }
  g.lineTo(cx + w, cy); g.closePath(); g.fill();
  g.fillStyle = C.Y; g.beginPath(); g.ellipse(cx, cy, w, h * 0.45, 0, 0, TAU); g.fill();
  g.fillStyle = '#b89a10'; g.fillRect(Math.round(cx - w * 0.6), Math.round(cy - 1), Math.round(w * 1.1), 1);
  g.fillStyle = C.K; for (let i = 0; i < 5; i++) { const x = cx - w * 0.7 + rng() * w * 1.4; g.fillRect(Math.round(x), Math.round(cy + h * 0.8), 2, Math.round(4 + rng() * 8)); }
}
function paintExecution(g, rng) {
  g.fillStyle = C.W; g.fillRect(0, 0, W, H);
  g.fillStyle = C.K; g.fillRect(0, 0, W, 44);
  for (let i = 0; i < 40; i++) { g.fillStyle = C.W; g.fillRect(Math.round(rng() * W), Math.round(rng() * 40), 1, 1); }
  for (const [x, y] of [[40, 12], [300, 20], [446, 8], [190, 30]]) { g.fillStyle = C.W; g.fillRect(x - 2, y, 5, 1); g.fillRect(x, y - 2, 1, 5); }
  // red haze band with ridges
  const band = g.createLinearGradient(0, 40, 0, 130);
  band.addColorStop(0, '#e41424'); band.addColorStop(0.55, '#f08a92'); band.addColorStop(1, '#ffffff');
  g.fillStyle = band; g.fillRect(0, 40, W, 90);
  g.fillStyle = C.R; g.beginPath(); g.moveTo(0, 100);
  for (let x = 0; x <= W; x += 8) g.lineTo(x, 84 + Math.sin(x * 0.03) * 10 + Math.sin(x * 0.11) * 4 + rng() * 3);
  g.lineTo(W, 108); g.lineTo(0, 108); g.closePath(); g.fill();
  // red moon
  g.fillStyle = C.R; g.beginPath(); g.arc(104, 44, 20, 0, TAU); g.fill();
  g.fillStyle = '#a00c18'; for (const [x, y, r] of [[98, 38, 4], [112, 50, 3], [102, 54, 2]]) { g.beginPath(); g.arc(x, y, r, 0, TAU); g.fill(); }
  // crosses on the ridge
  for (const [x, y, s] of [[340, 78, 9], [360, 86, 5], [24, 88, 6], [230, 92, 4]]) crossShape(g, x, y - s * 2, s, 0, C.R, Math.max(2, s * 0.4), s * 2.6);
  // floating gold rocks in the distance
  for (const [x, y, w] of [[420, 138, 22], [60, 150, 16], [250, 128, 12]]) { goldRock(g, x, y, w, 8, rng); heavyChain(g, x + w * 0.4, y + 10, x + w * 0.5, y + 60, C.K, 0.5); }
  // ground: a red crust with black thorny roots underneath
  g.fillStyle = C.R; g.fillRect(0, FLOOR - 6, W, 8);
  g.fillStyle = C.K; g.fillRect(0, FLOOR + 2, W, H - FLOOR);
  g.strokeStyle = C.K; g.lineWidth = 2;
  for (let x = 0; x < W; x += 18 + rng() * 14) { g.beginPath(); g.moveTo(x, FLOOR - 6); g.quadraticCurveTo(x + 6, FLOOR - 16 - rng() * 10, x + 14 + rng() * 6, FLOOR - 12 - rng() * 12); g.stroke(); }
  g.fillStyle = C.R; for (let i = 0; i < 30; i++) g.fillRect(Math.round(rng() * W), Math.round(FLOOR + 8 + rng() * (H - FLOOR - 10)), 2, 1);
}
const bgCity = mk(), bgExec = mk();
paintSunsetCity(bgCity.getContext('2d'), seeded(41));
paintExecution(bgExec.getContext('2d'), seeded(59));
