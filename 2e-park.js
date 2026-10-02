/* ---------- stage 3 backgrounds ----------
   phase 1: a moonlit park - navy sky, a full moon behind a cloud streak, pine ridges, park trees,
   street lamps and benches, a cold mist over the snowy path. phase 2: a duel on a snowy ridge
   in front of a giant moon, so every fighter becomes a sharp silhouette. */
function moonDisc(g, x, y, r, rng) {
  g.fillStyle = '#8fa0e6'; g.beginPath(); g.arc(x, y, r + 3, 0, TAU); g.fill();
  g.fillStyle = C.W; g.beginPath(); g.arc(x, y, r, 0, TAU); g.fill();
  g.fillStyle = '#c8d2f4';
  for (let i = 0; i < Math.round(r / 5); i++) { const a = rng() * TAU, d = rng() * r * 0.7; g.beginPath(); g.ellipse(x + Math.cos(a) * d, y + Math.sin(a) * d, r * (0.08 + rng() * 0.12), r * (0.06 + rng() * 0.08), rng(), 0, TAU); g.fill(); }
}
function pineRow(g, y0, h, col, rng, step = 9) {
  g.fillStyle = col;
  for (let x = -6; x < W + 10; x += step + rng() * step) { const hh = h * (0.6 + rng() * 0.6); g.beginPath(); g.moveTo(x - 5, y0); g.lineTo(x, y0 - hh); g.lineTo(x + 5, y0); g.fill(); }
  g.fillRect(0, y0, W, 40);
}
function parkTree(g, x, base, s, rng) {
  g.fillStyle = C.K;
  g.beginPath(); g.moveTo(x - 6 * s, base); g.quadraticCurveTo(x - 2 * s, base - 50 * s, x - 10 * s, base - 90 * s); g.lineTo(x + 2 * s, base - 88 * s); g.quadraticCurveTo(x + 4 * s, base - 50 * s, x + 7 * s, base); g.fill();
  g.strokeStyle = C.K; g.lineWidth = 3 * s;
  for (const [a, l] of [[-0.9, 34], [0.8, 30], [-0.4, 26]]) { g.beginPath(); g.moveTo(x - 3 * s, base - 60 * s); g.lineTo(x - 3 * s + Math.sin(a) * l * s, base - 60 * s - Math.cos(a) * l * s); g.stroke(); }
  g.strokeStyle = '#2440c8'; g.lineWidth = 1; g.beginPath(); g.moveTo(x + 3 * s, base - 4); g.quadraticCurveTo(x + 2 * s, base - 50 * s, x - 1 * s, base - 84 * s); g.stroke();
  for (let i = 0; i < 9; i++) {
    const cx = x + (rng() - 0.5) * 70 * s, cy = base - 90 * s - rng() * 34 * s, r = (12 + rng() * 12) * s;
    g.fillStyle = '#0a2436'; g.beginPath(); g.arc(cx, cy, r + 2, 0, TAU); g.fill();
    g.fillStyle = '#0f4a5e'; g.beginPath(); g.arc(cx, cy, r, 0, TAU); g.fill();
    g.fillStyle = '#2a6a8a'; g.beginPath(); g.arc(cx - r * 0.3, cy - r * 0.35, r * 0.45, 0, TAU); g.fill();
  }
}
function streetLamp(g, x, top) {
  const halo = g.createRadialGradient(x, top, 2, x, top, 22);
  halo.addColorStop(0, 'rgba(255,240,170,0.9)'); halo.addColorStop(1, 'rgba(255,240,170,0)');
  g.fillStyle = halo; g.beginPath(); g.arc(x, top, 22, 0, TAU); g.fill();
  g.fillStyle = C.K; g.fillRect(x - 1.5, top + 4, 3, FLOOR - top - 4); g.fillRect(x - 4, FLOOR - 6, 8, 6);
  g.fillRect(x - 5, top - 6, 10, 3); g.beginPath(); g.moveTo(x - 6, top + 5); g.lineTo(x + 6, top + 5); g.lineTo(x + 3, top + 9); g.lineTo(x - 3, top + 9); g.fill();
  g.fillStyle = C.Y; g.beginPath(); g.arc(x, top, 4.5, 0, TAU); g.fill(); g.fillStyle = C.W; g.fillRect(x - 1, top - 2, 2, 2);
}
function bench(g, x) {
  g.fillStyle = C.K; g.fillRect(x, FLOOR - 12, 40, 3); g.fillRect(x, FLOOR - 22, 40, 3); g.fillRect(x + 3, FLOOR - 22, 2, 22); g.fillRect(x + 35, FLOOR - 22, 2, 22);
  g.fillStyle = '#2440c8'; g.fillRect(x + 1, FLOOR - 13, 38, 1);
}
function paintMoonPark(g, rng) {
  const sky = g.createLinearGradient(0, 0, 0, 180);
  sky.addColorStop(0, '#000000'); sky.addColorStop(0.5, '#10205e'); sky.addColorStop(1, '#2440c8');
  g.fillStyle = sky; g.fillRect(0, 0, W, H);
  for (let i = 0; i < 70; i++) { g.fillStyle = C.W; g.fillRect(Math.round(rng() * W), Math.round(rng() * 110), 1, 1); }
  for (const [x, y] of [[40, 20], [150, 44], [330, 16], [430, 52], [210, 70]]) { g.fillStyle = C.W; g.fillRect(x - 2, y, 5, 1); g.fillRect(x, y - 2, 1, 5); }
  moonDisc(g, 246, 56, 32, rng);
  g.fillStyle = '#10205e'; g.fillRect(196, 60, 110, 5); g.fillRect(226, 66, 60, 3); g.fillStyle = '#2a3a90'; g.fillRect(200, 59, 90, 1);
  // ridges and pines
  g.fillStyle = '#16307a'; g.beginPath(); g.moveTo(0, 150);
  for (let x = 0; x <= W; x += 8) g.lineTo(x, 118 + Math.sin(x * 0.018) * 16 + Math.sin(x * 0.07) * 5);
  g.lineTo(W, 170); g.lineTo(0, 170); g.closePath(); g.fill();
  pineRow(g, 162, 22, '#0a1640', rng);
  // hanging chains
  heavyChain(g, 20, -4, 70, 170, C.K, 0.8); heavyChain(g, 400, -4, 340, 160, C.K, 0.8); heavyChain(g, 480, 30, 300, -4, C.K, 0.7);
  // park: trees, lamps, benches, a boulder
  parkTree(g, 58, 216, 1.1, rng); parkTree(g, 420, 214, 1.2, rng); parkTree(g, 300, 206, 0.8, rng);
  g.fillStyle = '#6a7aa0'; g.beginPath(); g.ellipse(176, 214, 34, 22, 0, Math.PI, TAU); g.fill();
  g.fillStyle = '#9aa8cc'; g.beginPath(); g.ellipse(170, 206, 18, 9, -0.2, 0, TAU); g.fill();
  g.strokeStyle = C.K; g.lineWidth = 1.5; g.beginPath(); g.ellipse(176, 214, 34, 22, 0, Math.PI, TAU); g.stroke();
  // cold mist that lifts the fighters off the dark park
  const mist = g.createLinearGradient(0, 168, 0, FLOOR);
  mist.addColorStop(0, 'rgba(143,160,230,0)'); mist.addColorStop(1, 'rgba(160,176,236,0.62)');
  g.fillStyle = mist; g.fillRect(0, 168, W, FLOOR - 168);
  streetLamp(g, 116, 170); streetLamp(g, 368, 172);
  bench(g, 212); bench(g, 262);
  g.fillStyle = C.K; g.fillRect(320, FLOOR - 16, 12, 16); g.fillRect(318, FLOOR - 18, 16, 3);
  // snowy path, dark ground below
  g.fillStyle = C.W; g.fillRect(0, FLOOR - 3, W, 5);
  g.fillStyle = C.K; g.fillRect(0, FLOOR + 2, W, H - FLOOR);
  g.fillStyle = '#2440c8'; g.fillRect(0, FLOOR + 2, W, 1);
  for (let i = 0; i < 60; i++) { g.fillStyle = rng() < 0.5 ? C.W : '#2440c8'; g.fillRect(Math.round(rng() * W), Math.round(FLOOR + 5 + rng() * (H - FLOOR - 7)), 1, 1); }
}
function paintMoonDuel(g, rng) {
  const sky = g.createLinearGradient(0, 0, 0, 200);
  sky.addColorStop(0, '#000000'); sky.addColorStop(1, '#10205e');
  g.fillStyle = sky; g.fillRect(0, 0, W, H);
  for (let i = 0; i < 90; i++) { g.fillStyle = C.W; g.fillRect(Math.round(rng() * W), Math.round(rng() * 200), 1, 1); }
  moonDisc(g, 240, 150, 100, rng);
  heavyChain(g, 60, -4, 420, 250, C.K, 1.1); heavyChain(g, 440, -4, 90, 240, C.K, 1);
  // snowy ridge with pine silhouettes at the edges
  g.fillStyle = C.K;
  for (const [x0, dir] of [[0, 1], [W, -1]]) {
    g.beginPath(); g.moveTo(x0, FLOOR); g.lineTo(x0, 150);
    for (let i = 0; i <= 8; i++) g.lineTo(x0 + dir * i * 12, 150 + i * 10 + rng() * 6);
    g.lineTo(x0 + dir * 110, FLOOR); g.closePath(); g.fill();
  }
  for (const x of [14, 34, 452, 470]) { g.beginPath(); g.moveTo(x - 9, 170); g.lineTo(x, 118 + rng() * 10); g.lineTo(x + 9, 170); g.fill(); }
  g.fillStyle = C.W; g.fillRect(0, FLOOR - 4, W, 6);
  g.fillStyle = C.K; g.fillRect(0, FLOOR + 2, W, H - FLOOR);
  for (let x = 0; x < W; x += 14 + rng() * 20) { g.fillStyle = C.W; g.beginPath(); g.ellipse(x, FLOOR - 3, 6 + rng() * 8, 2.5, 0, Math.PI, TAU); g.fill(); }
  g.fillStyle = '#2440c8'; for (let i = 0; i < 40; i++) g.fillRect(Math.round(rng() * W), Math.round(FLOOR + 5 + rng() * (H - FLOOR - 7)), 1, 1);
}
const bgPark = mk(), bgMoon = mk();
paintMoonPark(bgPark.getContext('2d'), seeded(83));
paintMoonDuel(bgMoon.getContext('2d'), seeded(97));
