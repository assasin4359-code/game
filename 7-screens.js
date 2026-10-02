/* ---------- full-screen cards & overlays ---------- */
/* ---------- title: starfield, the hero's greatsword bound in violet chains, and a chained blue planet ---------- */
/* free: after the final chapter the chains are broken - torn stubs, the padlock sprung, a golden edge on the blade;
   the belt has gaps. clean: the Earth before the chains came (opening cutscene) - no sword, no chains, no belt.
   pure: after the true ending - the sword stands free of every link and the Earth has no belt left at all */
function paintTitleBg(g, rng, free, clean, pure) {
  g.fillStyle = C.K; g.fillRect(0, 0, W, H);
  for (let i = 0; i < 110; i++) { g.fillStyle = rng() < 0.75 ? C.W : [C.Y, C.R, C.B, C.G2][i % 4]; g.fillRect(Math.round(rng() * W), Math.round(rng() * 210), 1, 1); }
  if (clean) { paintPlanet(g, rng, false); return; }
  paintTitleSword(g, free, pure);
  paintPlanet(g, rng, !pure, free);
  if (pure) { g.strokeStyle = C.Y; g.lineWidth = 1; g.beginPath(); g.arc(PLANET.x, PLANET.y, PLANET.r + 3, 3.9, 5.5); g.stroke(); }
}
/* points along the title sword (s: from the pommel toward the tip, o: across the blade) */
const TSWORD = {p0: [72, 16], p1: [46, 262]};
function tswordPt(s, o) {
  const {p0, p1} = TSWORD, L = Math.hypot(p1[0] - p0[0], p1[1] - p0[1]), dx = (p1[0] - p0[0]) / L, dy = (p1[1] - p0[1]) / L;
  return [p0[0] + dx * s - dy * o, p0[1] + dy * s + dx * o];
}
/* the Blade Summoner's greatsword standing on the left of the title, point down: pommel ring, wrapped two-hand grip,
   ring guard and cross bar, a broad blade with a chisel tip. violet chains wind round the blade, a padlock seals it,
   and three chains stream off from it across the sky */
function paintTitleSword(g, free, pure) {
  const P = tswordPt;
  const shape = pts => { g.beginPath(); pts.forEach((p, i) => i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1])); g.closePath(); };
  const edge = free || pure ? C.Y : C.W;
  // the chains streaming away across the sky start on the blade (behind it)
  const ce = free ? 0.45 : 1, from = [P(92, 0), P(132, 0), P(176, 0)], ends = [[500, -6], [500, 60], [500, 178]];
  if (!pure) from.forEach((f, i) => thickChain(g, f[0], f[1], f[0] + (ends[i][0] - f[0]) * ce, f[1] + (ends[i][1] - f[1]) * ce, VIOLET, [1.05, 1, 0.9][i]));
  g.lineJoin = 'round';
  // blade: white rim, black body, a dark fuller and the bright cutting edge
  const blade = [P(50, -12), P(226, -12), P(244, 12), P(50, 12)];
  shape(blade); g.strokeStyle = C.W; g.lineWidth = 3; g.stroke(); g.fillStyle = C.K; g.fill();
  g.strokeStyle = '#4a4a4a'; g.lineWidth = 2; g.beginPath(); g.moveTo(...P(56, -1)); g.lineTo(...P(210, -1)); g.stroke();
  g.strokeStyle = edge; g.lineWidth = 1.5; g.beginPath(); g.moveTo(...P(54, 8.5)); g.lineTo(...P(238, 8.5)); g.stroke();
  // cross bar and the ring guard
  shape([P(42, -21), P(42, 21), P(49, 21), P(49, -21)]); g.strokeStyle = C.W; g.lineWidth = 2.5; g.stroke(); g.fillStyle = C.K; g.fill();
  g.beginPath(); g.arc(...P(38, 0), 9, 0, TAU); g.strokeStyle = C.W; g.lineWidth = 6.5; g.stroke(); g.strokeStyle = C.K; g.lineWidth = 3.5; g.stroke();
  // grip, wrapped in crimson, and the pommel ring
  shape([P(8, -4), P(30, -4), P(30, 4), P(8, 4)]); g.strokeStyle = C.W; g.lineWidth = 2.5; g.stroke(); g.fillStyle = C.K; g.fill();
  g.strokeStyle = C.R; g.lineWidth = 1.5; for (let s = 10; s < 30; s += 4) { g.beginPath(); g.moveTo(...P(s, -4)); g.lineTo(...P(s + 3, 4)); g.stroke(); }
  g.beginPath(); g.arc(...P(4, 0), 5, 0, TAU); g.strokeStyle = C.W; g.lineWidth = 4.5; g.stroke(); g.strokeStyle = C.K; g.lineWidth = 2; g.stroke();
  if (pure) return;
  // chains wound round the blade: each wrap is a slanted run of links across it (broken wraps once free)
  for (const [i, s] of [[0, 72], [1, 112], [2, 152], [3, 194]].filter(([i]) => !free || i % 2 === 0)) {
    const a = P(s - 7, -17), b = P(s + 7, 17);
    thickChain(g, a[0], a[1], free ? (a[0] + b[0]) / 2 : b[0], free ? (a[1] + b[1]) / 2 : b[1], VIOLET, 1.1);
    if (!free) { const c = P(s + 7, 17), d2 = P(s + 13, -17); g.globalAlpha = 0.5; thickChain(g, c[0], c[1], d2[0], d2[1], VIOLET, 0.9); g.globalAlpha = 1; }
  }
  // the padlock that seals it (sprung open once free)
  const [lx, ly] = P(132, 0);
  g.save(); g.translate(lx, ly); if (free) g.rotate(0.5);
  g.strokeStyle = VIOLET; g.lineWidth = 3; g.beginPath(); g.arc(0, free ? -9 : -6, 6, Math.PI, 0); g.stroke();
  g.fillStyle = VIOLET; g.fillRect(-9, -6, 18, 15); g.strokeStyle = C.K; g.lineWidth = 1; g.strokeRect(-8.5, -5.5, 17, 14);
  g.fillStyle = C.R; g.beginPath(); g.arc(0, 0, 2.5, 0, TAU); g.fill(); g.fillRect(-1, 1, 2, 5);
  g.restore();
}
/* planet: blue surface with cloud bands, bright rim, and (belt) a belt of heavy chain links */
const PLANET = {x: 250, y: 520, r: 320};
function beltLink(g, k, a) {
  const r = PLANET.r - 22, x = PLANET.x + Math.cos(a) * r, y = PLANET.y + Math.sin(a) * r;
  g.save(); g.translate(x, y); g.rotate(a + Math.PI / 2);
  g.fillStyle = C.K; g.strokeStyle = C.W; g.lineWidth = 1.4;
  g.beginPath(); if (k % 2 === 0) g.ellipse(0, 0, 8, 4.6, 0, 0, TAU); else g.rect(-6, -1.8, 12, 3.6);
  g.fill(); g.stroke(); g.restore();
}
function paintPlanet(g, rng, belt, free) {
  const pcx = PLANET.x, pcy = PLANET.y, pr = PLANET.r;
  g.save(); g.beginPath(); g.arc(pcx, pcy, pr, 0, TAU); g.clip();
  g.fillStyle = C.B; g.fillRect(0, 180, W, 100);
  for (let i = 0; i < 40; i++) { g.fillStyle = '#10205e'; g.beginPath(); g.ellipse(rng() * W, 210 + rng() * 70, 10 + rng() * 26, 3 + rng() * 5, rng() * 0.3 - 0.15, 0, TAU); g.fill(); }
  for (let i = 0; i < 90; i++) { g.fillStyle = rng() < 0.55 ? C.W : '#8fa0e6'; g.beginPath(); g.ellipse(rng() * W, 204 + rng() * 70, 4 + rng() * 18, 1 + rng() * 2.5, rng() * 0.3 - 0.15, 0, TAU); g.fill(); }
  g.restore();
  g.strokeStyle = '#8fa0e6'; g.lineWidth = 5; g.beginPath(); g.arc(pcx, pcy, pr - 3, 0, TAU); g.stroke();
  g.strokeStyle = C.W; g.lineWidth = 1.5; g.beginPath(); g.arc(pcx, pcy, pr, 0, TAU); g.stroke();
  if (!belt) return;
  for (let a = 3.98, k = 0; a < 5.46; a += 0.042, k++) {
    if (free && k % 9 < 3) continue;
    beltLink(g, k, a + (free && k % 9 === 8 ? 0.012 : 0));
  }
  if (free) { g.strokeStyle = C.Y; g.lineWidth = 1; g.beginPath(); g.arc(pcx, pcy, pr + 3, 3.9, 5.5); g.stroke(); }
}
const titleBg = mk(), titleBgFree = mk(), titleBgClean = mk(), titleBgPure = mk();
paintTitleBg(titleBg.getContext('2d'), seeded(77));
paintTitleBg(titleBgFree.getContext('2d'), seeded(77), true);
paintTitleBg(titleBgClean.getContext('2d'), seeded(77), false, true);
paintTitleBg(titleBgPure.getContext('2d'), seeded(77), true, false, true);
const twinkles = Array.from({length: 18}, (_, i) => ({x: rnd(W), y: rnd(8, 196), c: [C.W, C.Y, C.W, C.B, C.R][i % 5], ph: rnd(TAU), sp: rnd(0.04, 0.09)}));
function drawStarfield(t, free = !!save.clear[4], pure = !!save.clear[5]) {
  ctx.drawImage(pure ? titleBgPure : free ? titleBgFree : titleBg, 0, 0);
  for (const s of twinkles) {
    const k = Math.sin(t * s.sp + s.ph), x = Math.round(s.x), y = Math.round(s.y), l = k > 0.6 ? 3 : k > 0 ? 2 : 1;
    ctx.fillStyle = s.c; ctx.fillRect(x - l, y, l * 2 + 1, 1); ctx.fillRect(x, y - l, 1, l * 2 + 1);
  }
}
function drawTitle() {
  const t = sceneT;
  drawStarfield(globalT);
  // serif title with a slashed O, like the OVERPOWER logo
  const name = 'BLADE SUMMONER', tw = kWidth(name, 'serif'), left = 240 - tw / 2;
  ktext(name, 240, 26, {sc: 'serif', color: C.W, align: 'center'});
  const ox = left + kWidth('BLADE SUMM', 'serif') + kWidth('O', 'serif') / 2;
  ctx.strokeStyle = C.W; ctx.lineWidth = 1.8; ctx.lineCap = 'butt'; poly([[ox + 10, 14], [ox - 7, 63]]); ctx.lineCap = 'round';
  ctx.fillStyle = C.W; ctx.fillRect(Math.round(left - 6), 60, Math.round(tw + 12), 1);
  text(save.clear[5] ? '블레이드 서머너  -  무너진 감옥' : save.clear[4] ? '블레이드 서머너  -  모든 사슬 해방' : '블레이드 서머너  -  사슬의 연대기', 240, 66, {color: save.clear[4] ? C.Y : C.W, align: 'center'});
  ctx.fillStyle = C.R; ctx.fillRect(204, 86, 72, 1); ctx.fillRect(200, 86, 1, 1); ctx.fillRect(198, 86, 1, 1); ctx.fillRect(279, 86, 1, 1); ctx.fillRect(281, 86, 1, 1);
  MENU.forEach(([label], i) => {
    const y = 94 + i * 17, sel = i === menuIdx;
    text(label, 240, y, {sc: 2, color: sel ? C.Y : C.W, align: 'center'});
    if (sel) { const w = kWidth(label, 2) / 2 + 14 + ((t >> 3) & 1); menuArrow(240 - w - 6, y + 7, 1); menuArrow(240 + w + 6, y + 7, -1); }
  });
  text(menuDesc(menuIdx), 240, 164, {color: C.G3, align: 'center'});
  text('W/S 선택 · J/Enter 결정', 240, 180, {color: C.W, align: 'center'});
  text('크레딧 1', 474, 6, {color: C.W, align: 'right'});
}
function drawLoading() {
  ctx.fillStyle = C.K; ctx.fillRect(0, 0, W, H);
  text('로딩 중' + '.'.repeat(1 + ((sceneT >> 3) % 3)), 214, 170, {color: C.W});
  ctx.fillStyle = C.R; ctx.fillRect(214, 181, Math.round(Math.min(1, sceneT / 56) * 56), 2);
}
/* region card, like the chapter openers of the reference: the stage behind, a huge compass word, the area name */
function drawIntro() {
  const t = sceneT, s = stage;
  if (s.key === 'origin') { drawOriginIntro(t); return; }
  drawStageBg(0);
  ctx.globalAlpha = 0.4; ctx.fillStyle = C.K; ctx.fillRect(0, 0, W, H); ctx.globalAlpha = 1;
  const sw = Math.sin(t * 0.03) * 5;
  heavyChain(ctx, -10, -10, 150 + sw, 280, C.K, 1.3); heavyChain(ctx, 490, -10, 340 - sw, 280, C.K, 1.3);
  const tx = lerp(W + 280, 240, easeOut(clamp((t - 4) / 22, 0, 1)));
  text(s.region, tx, 58, {sc: 8, color: C.W, outline: C.K, ow: 2, align: 'center'});
  const u = easeOut(clamp((t - 22) / 18, 0, 1));
  ctx.fillStyle = C.K; ctx.fillRect(Math.round(240 - 170 * u), 124, Math.round(340 * u), 20);
  ctx.fillStyle = s.col; ctx.fillRect(Math.round(240 - 170 * u), 123, Math.round(340 * u), 1); ctx.fillRect(Math.round(240 - 170 * u), 144, Math.round(340 * u), 1);
  if (t > 30) text(s.chap + '  ·  ' + s.area, 240, 127, {sc: 2, color: C.W, align: 'center'});
  if (t > 44) text('STAGE 0' + s.id + '   BOSS LV.' + s.lv, 240, 152, {color: C.W, outline: C.K, align: 'center'});
}
function drawDialogue() {
  if (!dlg) return;
  const L = dlg.lines[dlg.i], isBoss = L.who === 'boss', gun = stage.key === 'gun', sw = stage.key === 'sword', ch = stage.key === 'chain', og = stage.key === 'origin';
  const DC = {bow: {panel: '#d8f2e0', stripe: C.G3, name: C.G2, text: C.G3}, gun: {panel: '#fff4b8', stripe: '#ffde28', name: C.Y, text: '#ffe98a'},
    sword: {panel: '#c8d2f4', stripe: '#8fa0e6', name: C.W, text: C.W, line: C.B}, chain: {panel: '#f5b5ba', stripe: '#f08a92', name: C.R, text: C.W, line: C.R},
    origin: {panel: '#d8b8e8', stripe: '#b88ad0', name: C.W, text: C.W, line: C.P}}[stage.key];
  // portrait panel: opaque so the busy stage behind never muddies the dither; diagonal speed stripes
  const pxl = isBoss ? 0 : W - 200, pcol = isBoss ? DC.panel : '#fbd9dc';
  ctx.fillStyle = pcol; ctx.fillRect(pxl, 50, 200, 142);
  ctx.save(); ctx.beginPath(); ctx.rect(pxl, 50, 200, 142); ctx.clip();
  ctx.fillStyle = isBoss ? DC.stripe : '#f5b5ba';
  for (let x = -150; x < 220; x += 26) { ctx.beginPath(); ctx.moveTo(pxl + x, 192); ctx.lineTo(pxl + x + 10, 192); ctx.lineTo(pxl + x + 152, 50); ctx.lineTo(pxl + x + 142, 50); ctx.fill(); }
  ctx.restore();
  ctx.fillStyle = C.K; ctx.fillRect(pxl, 49, 200, 1); ctx.fillRect(isBoss ? 199 : W - 200, 50, 1, 142);
  // brainwashed bosses glare with red eyes until the chain on their mind is broken
  const ey = boss.freed ? null : C.R;
  if (isBoss && gun) drawFigure(96, 250, 1, makePose({hy: -16, lean: -0.08, ht: 0.12, l1: -0.3, r1: 0.3, fu: 2.3, ff: 0.75, bu: -0.55, bf: 2.0}),
    gunnerLook({sc: 3.2, t: globalT, eyes: ey, guns: [{hand: 'F', aim: -1.3, color: C.K, trim: C.Y}]}));
  else if (isBoss && sw) drawFigure(96, 250, 1, makePose({hy: -16, lean: 0.06, ht: 0.22, l1: -0.3, r1: 0.3, fu: 0.9, ff: 0.35, bu: -0.5, bf: 0.6}),
    assassinLook({sc: 3.2, t: globalT, eyes: ey, katanas: [{hand: 'F', len: 30}]}));
  else if (isBoss && ch) drawFigure(96, 262, 1, makePose({hy: -16.8, lean: -0.06, ht: -0.08, l1: -0.14, r1: 0.18, fu: 0.55, ff: 0.2, bu: 1.3, bf: 0.9}), sovLook({sc: 3, t: globalT}));
  // the original: the hero's own portrait, mirrored and made cruel (on his knees once beaten)
  else if (isBoss && og) drawFigure(96, 250, 1, makePose(boss.state === 'dead' ? {hy: -12, lean: 0.35, ht: 0.35, l1: 0.2, l2: -1.8, r1: 1.3, r2: -1.3, fu: 0.4, ff: 0.2, bu: -0.3, bf: 0.2, sa: 0.3}
    : {hy: -16, lean: 0.1, l1: -0.3, r1: 0.3, fu: 0.5, ff: 0.55, bu: -0.35, bf: -0.35, sa: 1.05}),
    originLook({sc: 3.2, outline: C.W, t: globalT, sword: boss.state === 'dead' ? null : ORIGIN_SWORD}));
  else if (isBoss) drawFigure(96, 250, 1, makePose({hy: -16, lean: -0.05, ht: 0.1, l1: -0.3, r1: 0.3, fu: 1.3, ff: 0.5, bu: -0.3, bf: 0.6}),
    {sc: 3.2, eyes: ey, scarf: {color: C.G2, n: 2, wind: 1}, quiver: true, holdArrow: true, t: globalT, bow: {aim: null, drawn: false, color: C.K}});
  else drawFigure(W - 96, 250, -1, makePose({hy: -16, lean: 0.1, l1: -0.3, r1: 0.3, fu: 0.5, ff: 0.55, bu: -0.35, bf: -0.35, sa: 1.05}),
    heroLook({sc: 3.2, color: player.adren > 0 ? C.R : C.K, t: globalT, sword: {len: SWORD_LEN, color: player.adren > 0 ? C.R : C.K, edge: C.W}}));
  const bx = 8, by = 192, bw = W - 16, bh = 72;
  ctx.fillStyle = C.K; ctx.fillRect(bx, by, bw, bh);
  ctx.fillStyle = isBoss ? DC.line || DC.name : C.R; ctx.fillRect(bx, by + 20, bw, 1); ctx.fillRect(bx, by + bh - 4, bw, 1);
  text(isBoss ? stage.boss : heroClass().name, bx + 6, by + 4, {sc: 2, italic: true, color: isBoss ? DC.name : C.R});
  let remain = Math.floor(dlg.n);
  wrapPx(L.text, bw - 20).forEach((ln, i) => { if (remain <= 0) return; text(ln.slice(0, remain), bx + 8, by + 28 + i * 14, {color: isBoss ? DC.text : C.W}); remain -= ln.length + 1; });
  if (dlg.n >= L.text.length && ((globalT >> 4) & 1)) { ctx.fillStyle = C.W; ctx.beginPath(); ctx.moveTo(bx + bw - 14, by + bh - 13); ctx.lineTo(bx + bw - 6, by + bh - 13); ctx.lineTo(bx + bw - 10, by + bh - 8); ctx.fill(); }
}
function banner(y, h, label, sc) {
  ctx.fillStyle = C.K; ctx.fillRect(0, y - 6, W, 4);
  ctx.fillStyle = C.Y; ctx.fillRect(0, y, W, h);
  ctx.fillStyle = C.W; for (let x = -40; x < W + 40; x += 22) { ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + 8, y); ctx.lineTo(x + 8 - h * 0.6, y + h); ctx.lineTo(x - h * 0.6, y + h); ctx.fill(); }
  ctx.fillStyle = C.R; ctx.fillRect(0, y + h, W, 1);
  text(label, 240, y + Math.round((h - sc * 7) / 2), {sc, color: C.R, outline: C.K, align: 'center'});
}
function drawPassiveCard(t) {
  ctx.fillStyle = '#f4a3aa'; ctx.fillRect(0, 0, W, H);
  ctx.globalAlpha = 0.45;
  drawFigure(392, 262, -1, makePose({hy: -16, lean: 0.05, l1: -0.45, r1: 0.45, r2: -0.1, bu: -0.6, bf: -0.4, fu: 2.75, ff: 0.15, sa: 3.1}), {sc: 3, color: C.R, band: true, t: globalT, sword: {len: SWORD_LEN, color: C.R}});
  ctx.globalAlpha = 1;
  banner(16, 28, '히든 패시브 해금', 3);
  ctx.fillStyle = C.K; ctx.fillRect(38, 56, 40, 40); ctx.fillStyle = C.R; ctx.fillRect(40, 58, 36, 36);
  ctx.fillStyle = C.Y; for (let i = 0; i < 5; i++) { const fx = 44 + i * 7; ctx.beginPath(); ctx.moveTo(fx - 3, 92); ctx.lineTo(fx, 66 + (i % 2) * 8 + Math.sin(globalT * 0.3 + i) * 2); ctx.lineTo(fx + 3, 92); ctx.fill(); }
  ctx.fillStyle = C.K; disc(58, 72, 5); ctx.beginPath(); ctx.moveTo(48, 94); ctx.quadraticCurveTo(58, 72, 68, 94); ctx.fill();
  text('LV.1', 86, 58);
  text('아드레날린 러시', 86, 70, {sc: 4});
  ctx.fillStyle = C.K; ctx.fillRect(38, 100, 250, 1);
  [['X2', '공격'], ['X2', '속도'], ['UP', '스킬'], ['+30%', 'HP']].forEach(([v, l], i) => {
    const x = 318 + i * 40;
    text(v, x, 58, {align: 'center'});
    ctx.fillStyle = C.G2; ctx.fillRect(x - 1, 70, 3, 10); ctx.beginPath(); ctx.moveTo(x - 4, 72); ctx.lineTo(x + 0.5, 66); ctx.lineTo(x + 5, 72); ctx.fill();
    text(l, x, 86, {align: 'center'});
  });
  ['체력이 0이 되어도 몸이 쓰러지기를 거부한다.', '체력 30%로 다시 일어서고, 잠시 동안 모든 공격과', '스킬이 강화되며 공격력과 속도가 크게 오른다.']
    .forEach((s, i) => text(s, 240, 118 + i * 16, {align: 'center', outline: C.W}));
  if (t > 80 && ((t >> 4) & 1)) text('ENTER를 눌러 계속', 240, 208, {color: C.R, outline: C.W, align: 'center'});
  ctx.fillStyle = C.K; ctx.fillRect(0, 232, W, 38);
}
function drawSpecialBanner(t) {
  ctx.fillStyle = C.K; ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = C.W; ctx.fillRect(0, 36, W, 198);
  for (let i = 0; i < 12; i++) { ctx.fillStyle = i % 2 ? '#f5b5ba' : C.W; ctx.fillRect(0, 118 + i * 9, W, 5); }
  ctx.fillStyle = C.K; ctx.fillRect(0, 42, W, 3); ctx.fillRect(0, 105, W, 3);
  ctx.fillStyle = C.R; ctx.fillRect(0, 48, W, 55);
  ctx.strokeStyle = C.W; ctx.lineWidth = 1;
  for (let i = 0; i < 14; i++) { const y = 50 + ((i * 37 + t * 7) % 50), x = W - ((i * 97 + t * 26) % (W + 120)); poly([[x, y], [x + 60, y]]); }
  text('필살기  천지 가르기', W + 20 - t * 11, 57, {sc: 6, italic: true, color: C.W, outline: C.K});
  const px = lerp(-80, 150, easeOut(Math.min(1, t / 18)));
  // close-up: the hero simply stands, sword raised in both hands (no swing)
  const br = Math.sin(t * 0.12) * 0.03;
  drawFigure(px - 40, 300, 1, makePose({hy: -15, lean: 0.12 + br, ht: -0.1, l1: -0.45, r1: 0.5, r2: -0.2, fu: 2.75, ff: 0.2, sa: 3.75}),
    heroLook({sc: 3.6, color: player.adren > 0 ? C.R : C.K, t: globalT, sword: {len: SWORD_LEN, color: player.adren > 0 ? C.R : C.K, edge: C.Y}}));
  ctx.fillStyle = C.K; ctx.fillRect(0, 0, W, 36); ctx.fillRect(0, 234, W, 36);
}
function drawBossBanner(t) {
  const gun = stage.key === 'gun', sw = stage.key === 'sword', ch = stage.key === 'chain', og = stage.key === 'origin';
  const band = gun ? '#8a0a14' : sw ? '#10205e' : ch || og ? C.K : C.G1, stripe = gun ? '#ffe98a' : sw ? '#8fa0e6' : ch ? '#f08a92' : og ? '#b88ad0' : C.G3;
  ctx.fillStyle = C.K; ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = C.W; ctx.fillRect(0, 36, W, 198);
  for (let i = 0; i < 12; i++) { ctx.fillStyle = i % 2 ? stripe : C.W; ctx.fillRect(0, 118 + i * 9, W, 5); }
  ctx.fillStyle = C.K; ctx.fillRect(0, 42, W, 3); ctx.fillRect(0, 105, W, 3);
  ctx.fillStyle = band; ctx.fillRect(0, 48, W, 55);
  ctx.strokeStyle = stripe; ctx.lineWidth = 1;
  for (let i = 0; i < 14; i++) { const y = 50 + ((i * 37 + t * 7) % 50), x = ((i * 97 + t * 26) % (W + 120)) - 60; poly([[x, y], [x + 60, y]]); }
  text('보스 필살기', -300 + t * 11, 57, {sc: 6, italic: true, color: C.W, outline: band});
  const px = lerp(W + 80, 330, easeOut(Math.min(1, t / 18)));
  if (gun) drawFigure(px, 300, -1, makePose({hy: -16, lean: -0.1, l1: -0.55, r1: 0.5, fu: 1.52, ff: 0, bu: 1.25, bf: 0.35}),
    gunnerLook({sc: 3.6, t: globalT, guns: [{hand: 'F', aim: Math.PI + 0.06, color: C.Y, trim: C.W, big: true}]}));
  else if (sw) {
    // iai stance, then the draw: the blade flashes out and a cut splits the band
    const drawn = t > 50;
    drawFigure(px, 286, -1, makePose(drawn ? {hy: -12.5, lean: 0.45, ht: 0.1, l1: -0.9, l2: 0.3, r1: 0.9, r2: -0.9, fu: 1.57, ff: 0, bu: -1.3, bf: 0.3} : {hy: -10, lean: 0.62, ht: 0.25, l1: 0.1, l2: -1.7, r1: 1.25, r2: -1.6, fu: 0.1, ff: 1.5, bu: -0.2, bf: 1.3}),
      assassinLook({sc: 3.6, t: globalT, katanas: drawn ? [{hand: 'F', len: 30}] : []}));
    if (drawn && t < 70) { const k = 1 - (t - 50) / 20; ctx.lineCap = 'butt'; ctx.strokeStyle = C.K; ctx.lineWidth = 10 * k + 1; poly([[0, 150], [W, 150]]); ctx.strokeStyle = C.W; ctx.lineWidth = 6 * k + 0.5; poly([[0, 150], [W, 150]]); ctx.lineCap = 'round'; }
  } else if (og) {
    // the original in the hero's own 일검무귀 stance, the blade drawn back level; at 50 the band is cut through
    const cut = t > 50;
    drawFigure(px, 286, -1, IG_STANCE(cut ? 1.95 : -2.15), originLook({sc: 3.6, outline: C.W, t: globalT, sword: {len: SWORD_LEN, color: '#6e000c', edge: C.P}}));
    if (cut && t < 70) { const k = 1 - (t - 50) / 20; ctx.lineCap = 'butt'; ctx.strokeStyle = C.K; ctx.lineWidth = 12 * k + 1; poly([[0, 150], [W, 150]]); ctx.strokeStyle = C.P; ctx.lineWidth = 8 * k + 1; poly([[0, 150], [W, 150]]); ctx.strokeStyle = C.W; ctx.lineWidth = 3 * k + 0.5; poly([[0, 150], [W, 150]]); ctx.lineCap = 'round'; }
  } else if (ch) {
    // the stolen greatsword raised high; at the cut the band itself splits
    drawFigure(px, 296, -1, makePose({hy: -16.5, lean: -0.1, ht: -0.25, l1: -0.3, r1: 0.3, fu: 3.0, ff: 0.05, bu: 2.7, bf: 0.2}), sovLook({sc: 3.4, t: globalT}));
    if (t > 50 && t < 70) { const k = 1 - (t - 50) / 20; ctx.lineCap = 'butt'; ctx.strokeStyle = C.K; ctx.lineWidth = 12 * k + 1; poly([[0, 170], [W, 120]]); ctx.strokeStyle = C.R; ctx.lineWidth = 8 * k + 1; poly([[0, 170], [W, 120]]); ctx.strokeStyle = C.W; ctx.lineWidth = 3 * k + 0.5; poly([[0, 170], [W, 120]]); ctx.lineCap = 'round'; }
  }
  else drawFigure(px, 300, -1, makePose({hy: -16, lean: -0.1, l1: -0.55, r1: 0.5, fu: 1.45, ff: 0, bu: 1.45 - Math.PI, bf: t > 50 ? 1.5 : 2.67}),
    {sc: 3.6, scarf: {color: C.G2, n: 3, wind: 2.4}, quiver: true, t: globalT, bow: {aim: Math.PI + 0.1, drawn: t <= 50, arrow: t <= 50, color: C.K}});
  if (gun && t > 50 && t < 60) { ctx.fillStyle = C.Y; disc(px - 58, 256, 14); ctx.fillStyle = C.W; disc(px - 58, 256, 7); }
  if (t > 30) text(stage.ult, 40, 196, {sc: 5, italic: true, color: gun ? C.Y : sw ? C.B : ch ? C.R : og ? C.P : C.G1, outline: gun ? C.K : C.W});
  ctx.fillStyle = C.K; ctx.fillRect(0, 0, W, 36); ctx.fillRect(0, 234, W, 36);
}
const snap = mk(), sctx = snap.getContext('2d');
/* redraw the current frame as two halves shoved apart along a cut line */
function sliceScreen(cx, cy, ang, slide, gap) {
  sctx.clearRect(0, 0, W, H); sctx.drawImage(work, 0, 0);
  const ux = Math.cos(ang), uy = Math.sin(ang), nx = -uy, ny = ux, F = 900;
  ctx.fillStyle = C.K; ctx.fillRect(0, 0, W, H);
  for (const s of [1, -1]) {
    ctx.save(); ctx.beginPath();
    ctx.moveTo(cx - ux * F, cy - uy * F); ctx.lineTo(cx + ux * F, cy + uy * F);
    ctx.lineTo(cx + ux * F + nx * F * s, cy + uy * F + ny * F * s); ctx.lineTo(cx - ux * F + nx * F * s, cy - uy * F + ny * F * s);
    ctx.closePath(); ctx.clip();
    ctx.drawImage(snap, Math.round(ux * slide * s + nx * gap * s), Math.round(uy * slide * s + ny * gap * s));
    ctx.restore();
  }
}
function cutLine(cx, cy, ang, k) {
  const dx = Math.cos(ang) * 900, dy = Math.sin(ang) * 900, a = [cx - dx, cy - dy], b = [cx + dx, cy + dy];
  ctx.lineCap = 'butt';
  ctx.strokeStyle = C.K; ctx.lineWidth = 7 * k + 1.5; poly([a, b]);
  ctx.strokeStyle = C.R; ctx.lineWidth = 5 * k + 1; poly([a, b]);
  ctx.strokeStyle = C.W; ctx.lineWidth = 2.5 * k + 0.5; poly([a, b]);
  ctx.lineCap = 'round';
}
/* the special's blood-red stage: every enemy a black silhouette (or white, for an impact frame) */
function drawTargetSilhouettes(col = C.K) {
  for (const tg of specialTargets()) {
    if (tg === boss && boss.kind === 'gun') drawFigure(boss.x, boss.y, boss.face, bossPose(boss), {color: col, hood: {color: col}, cape: {color: col}, t: boss.animT});
    else if (tg === boss && boss.kind === 'sword') drawFigure(boss.x, boss.y, boss.face, bossPose(boss), {color: col, kasa: {color: col}, hair: {color: col}, t: boss.animT});
    else if (tg === boss && boss.kind === 'chain') drawFigure(boss.x, boss.y, boss.face, bossPose(boss), {color: col, cape: {color: col, tatter: true, len: 2.1}, crown: col, t: boss.animT});
    else if (tg === boss && boss.kind === 'origin') { const q = bossPose(boss); drawFigure(boss.x, boss.y, q.flip ? -boss.face : boss.face, q, {color: col, band: true, cape: {color: col, tatter: true, len: 1.9}, t: boss.animT, sword: {len: SWORD_LEN, color: col}}); }
    else if (tg === boss) drawFigure(boss.x, boss.y, boss.face, bossPose(boss), {color: col, scarf: {color: col, n: 2}, quiver: true, t: boss.animT});
    else if (tg.mob) { const m = tg; drawFigure(m.x, m.y, m.face || 1, makePose({hy: -15, lean: 0.1, l1: -0.3, r1: 0.3, fu: 0.4, ff: 0.3, bu: -0.3, bf: 0.4}), {color: col, sc: m.s || 1, t: globalT}); }
    else drawDummy(tg, true);
  }
}
function drawSpecial() {
  const t = sceneT;
  if (storm.ig) { drawIlgeom(t); return; }
  if (t < 70) { drawSpecialBanner(t); return; }
  const p = player, F = storm.final;
  drawWorld();
  if (t < SP.finalAt) {
    // blood-red stage: enemies become black silhouettes, the hero a white one
    ctx.globalAlpha = 0.45; ctx.fillStyle = C.K; ctx.fillRect(0, 0, W, H);
    ctx.globalAlpha = 0.55; ctx.fillStyle = C.R; ctx.fillRect(0, 0, W, H); ctx.globalAlpha = 1;
    drawTargetSilhouettes();
    for (const a of p.arcs) { a.cx = p.x + a.ox; a.cy = p.y + a.oy; drawFlameArc(a); }
    drawFigure(p.x, p.y, p.face, playerPose(p), {color: C.W, band: true, t: p.animT, sword: {len: SWORD_LEN, color: C.W, edge: C.R}});
    ctx.strokeStyle = C.R; ctx.lineWidth = 1;
    for (const s of storm) if (t - s.t0 >= 10) { const dx = Math.cos(s.ang) * 900, dy = Math.sin(s.ang) * 900; poly([[s.cx - dx, s.cy - dy], [s.cx + dx, s.cy + dy]]); }
    for (const s of storm) { const age = t - s.t0; if (age < 6) sliceScreen(s.cx, s.cy, s.ang, (1 - age / 6) * 7, (1 - age / 6) * 1.5); }
    for (const s of storm) { const age = t - s.t0; if (age < 10) cutLine(s.cx, s.cy, s.ang, 1 - age / 10); }
    drawTexts();
    if (t >= SP.windUp) {
      const k = (t - SP.windUp) / (SP.finalAt - SP.windUp);
      ctx.globalAlpha = 0.3 + k * 0.6; ctx.strokeStyle = C.W; ctx.lineWidth = 1; poly([[0, H / 2 - 4], [W, H / 2 - 4]]); ctx.globalAlpha = 1;
    }
  } else if (F) {
    // the last cut: the whole screen splits in two, then seals back
    const age = t - F.t0, open = age < 16 ? easeOut(age / 16) : t < SP.splitEnd - 16 ? 1 : Math.max(0, (SP.splitEnd - t) / 16);
    const cx = F.cx != null ? F.cx : W / 2, cy = F.cy != null ? F.cy : H / 2 - 4;
    if (open > 0) {
      sliceScreen(cx, cy, F.ang, open * 26, open * 20);
      const dx = Math.cos(F.ang) * 900, dy = Math.sin(F.ang) * 900;
      ctx.lineCap = 'butt';
      ctx.globalAlpha = 0.7; ctx.strokeStyle = C.R; ctx.lineWidth = 16 * open; poly([[cx - dx, cy - dy], [cx + dx, cy + dy]]);
      ctx.globalAlpha = 1; ctx.lineWidth = 6 * open; poly([[cx - dx, cy - dy], [cx + dx, cy + dy]]);
      ctx.strokeStyle = C.W; ctx.lineWidth = 1.5; poly([[cx - dx, cy - dy], [cx + dx, cy + dy]]);
      ctx.lineCap = 'round';
      for (let i = 0; i < 3; i++) { const u = rnd(-1, 1); addP({x: cx + Math.cos(F.ang) * u * 240, y: cy + Math.sin(F.ang) * u * 240, vx: rnd(-1, 1), vy: rnd(-1.5, 1.5), life: 14, color: Math.random() < 0.5 ? C.R : C.W, size: 2}); }
    }
    if (age < 8) cutLine(cx, cy, F.ang, 1 - age / 8);
  }
  drawHUD();
}
/* 일검무귀's card: black, a blood-dark band with the name, the hero low in his stance with the blade drawn back.
   혈 (in a rush): the band burns red, 혈 is stamped after the name, and the hero is the rush's red */
const IG_STANCE = yaw => Object.assign(flatPose(yaw, true, false), {hy: -11.5, lean: 0.5, l1: -1.15, l2: 0.25, r1: 1.05, r2: -0.95});
function drawIlgeomBanner(t, B) {
  ctx.fillStyle = C.K; ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = B ? '#8a0a14' : '#3a0006'; ctx.fillRect(0, 48, W, 55);
  ctx.fillStyle = B ? C.W : C.R; ctx.fillRect(0, 46, W, 1); ctx.fillRect(0, 104, W, 1);
  ctx.strokeStyle = B ? C.R : '#6e000c'; ctx.lineWidth = 1;
  for (let i = 0; i < 10; i++) { const y = 52 + ((i * 37) % 46), x = W - ((i * 97 + t * (B ? 16 : 9)) % (W + 120)); poly([[x, y], [x + 70, y]]); }
  const u = easeOut(Math.min(1, t / 14));
  text('필살기', lerp(W + 40, B ? 170 : 196, u), 70, {sc: 2, color: B ? C.W : C.R});
  text('일검무귀', lerp(W + 60, B ? 226 : 252, u), 55, {sc: 6, italic: true, color: C.W, outline: C.R});
  if (B && t > 10) { const s = t < 16 ? 1 + (16 - t) * 0.15 : 1; text('혈', 400 + (t < 16 ? rnd(-2, 2) : 0), 55 - (s - 1) * 10, {sc: 6, color: C.R, outline: C.W}); }
  if (t > 16) text('이 검이 닿는 곳이 끝이다', B ? 226 : 252, 112, {color: C.R});
  const px = lerp(-80, 130, easeOut(Math.min(1, t / 18))), col = B ? C.R : C.K;
  drawFigure(px, 246, 1, IG_STANCE(-2.15), heroLook({sc: 3.6, color: col, outline: C.W, t: globalT, sword: B ? {len: SWORD_LEN, color: C.W, edge: C.R} : {len: SWORD_LEN, color: '#6e000c', edge: C.R}}));
  if (B && t % 2 === 0) for (let i = 0; i < 3; i++) { ctx.fillStyle = Math.random() < 0.5 ? C.R : C.W; ctx.fillRect(Math.round(px - 40 - rnd(0, 110)), Math.round(170 + rnd(0, 60)), 2, 2); }
  ctx.fillStyle = C.K; ctx.fillRect(0, 0, W, 36); ctx.fillRect(0, 234, W, 36);
}
/* 일검무귀 in the world: the camera pushes in while the world sinks into the dark (혈: into blood red, enemies as
   silhouettes) and sword-waves wheel into the growing blade; in the silence, a close-up of the hero's eye cuts across
   the screen; the cut is two impact frames and a flash of a line; the camera snaps back, a hairline hangs in the air
   while the hero flicks the blood off and turns his back - and then the cut detonates end to end and tears the world */
function drawIlgeom(t) {
  const ig = storm.ig, p = player, f = ig.face, B = ig.blood;
  if (t < IG.start) { drawIlgeomBanner(t, B); return; }
  const z = igZoom(t), fx = ig.fx != null ? ig.fx : p.x, fy = ig.fy != null ? ig.fy : p.y - 30;
  ctx.save();
  if (z > 1.001) {
    // push in on the hero and drift him toward the middle (a little behind it, room in front of the blade),
    // never so far that the camera looks past the edge of the stage
    const zk = (z - 1) / 0.6;
    const sx = clamp(lerp(fx, W * (0.5 - 0.1 * f), zk), W - (W - fx) * z, fx * z), sy = clamp(lerp(fy, H * 0.6, zk), H - (H - fy) * z, fy * z);
    ctx.translate(sx, sy); ctx.scale(z, z); ctx.translate(-fx, -fy);
  }
  drawWorld();
  // impact frames: for two frames the whole picture inverts into flat silhouettes and one huge crescent of the cut
  if (t === IG.cut || t === IG.cut + 1) {
    const bg = t === IG.cut ? C.W : C.K, fg = t === IG.cut ? C.K : C.W, y = p.y - 22, x0 = p.x - f * 30, x1 = f > 0 ? W + 40 : -40, mid = (x0 + x1) / 2;
    ctx.fillStyle = bg; ctx.fillRect(-W, -H, W * 3, H * 3);
    drawTargetSilhouettes(fg);
    drawFigure(p.x, p.y, p.face, playerPose(p), {color: fg, band: true, t: p.animT, sword: {len: p.igSword.len, w: p.igSword.w, color: fg}});
    ctx.fillStyle = fg; ctx.beginPath(); ctx.moveTo(x0, y + 6); ctx.quadraticCurveTo(mid, y - 46, x1, y - 4); ctx.quadraticCurveTo(mid, y - 14, x0, y + 6); ctx.fill();
    ctx.restore();
    return;
  }
  // the world sinks almost to black while the blade drinks it in (half-dark would dither into a noisy checker);
  // at the blast its light comes straight back
  const dk = t < IG.absorb ? 0.3 * (t - IG.start) / (IG.absorb - IG.start) : t < IG.blast ? Math.min(0.88, 0.3 + (t - IG.absorb) / 40 * 0.58) : 0;
  if (dk > 0) {
    if (B) {
      const k = dk / 0.88;
      ctx.globalAlpha = 0.45 * k; ctx.fillStyle = C.K; ctx.fillRect(-W, -H, W * 3, H * 3);
      ctx.globalAlpha = 0.55 * k; ctx.fillStyle = C.R; ctx.fillRect(-W, -H, W * 3, H * 3); ctx.globalAlpha = 1;
      if (k > 0.5) drawTargetSilhouettes();
    } else { ctx.globalAlpha = dk; ctx.fillStyle = C.K; ctx.fillRect(-W, -H, W * 3, H * 3); ctx.globalAlpha = 1; }
  }
  const sm = igSwordMid(p);
  for (const q of ig.qi) {
    const x = sm[0] + Math.cos(q.a) * q.r, y = sm[1] + Math.sin(q.a) * q.r * 0.7, s = 0.4 + q.r / 200;
    const cres = (h, bul, th) => { ctx.beginPath(); ctx.moveTo(0, -h); ctx.quadraticCurveTo(bul, 0, 0, h); ctx.quadraticCurveTo(bul * th, 0, 0, -h); ctx.fill(); };
    ctx.save(); ctx.translate(x, y); ctx.rotate(q.a + Math.PI / 2 * q.spin);
    ctx.fillStyle = B ? C.K : C.R; cres(14 * s, 9 * s, 0.3); ctx.fillStyle = C.W; cres(9 * s, 5 * s, 0.5);
    ctx.restore();
  }
  if (B && dk > 0.44) drawFigure(p.x, p.y, p.face, playerPose(p), heroLook({color: C.W, outline: C.K, t: p.animT, sword: p.igSword, masterBlades: null, godHalo: null}));
  else drawPlayer();
  if (ig.cutT) {
    const age = t - ig.cutT, y = ig.cutY, x0 = B ? -10 : ig.cutX + f * 8, x1 = B ? W + 10 : f > 0 ? W + 10 : -10;
    if (age < 6) { ctx.globalAlpha = 1 - age / 6; drawFlatSwoosh(ig.cutX + f * 3, y + 1, f, -2.15, 1.95, (p.igSword ? p.igSword.len : SWORD_LEN) + 8, 0.3, B ? C.W : C.R); ctx.globalAlpha = 1; }
    ctx.lineCap = 'butt';
    if (age < 4) { ctx.strokeStyle = B ? C.K : C.R; ctx.lineWidth = 6; poly([[x0, y], [x1, y]]); ctx.strokeStyle = C.W; ctx.lineWidth = 3; poly([[x0, y], [x1, y]]); }
    else if (t < IG.blast) { ctx.strokeStyle = B ? ((t & 4) ? C.W : C.K) : (t & 4) ? C.R : '#6e000c'; ctx.lineWidth = 1; poly([[x0, y], [x1, y]]); }
    else {
      const b = t - IG.blast;
      if (B && b < 24) { const open = b < 5 ? easeOut(b / 5) : Math.max(0, (24 - b) / 19); if (open > 0) sliceScreen(W / 2, y, 0, open * 18, open * 5); }
      if (b < 26) { const k = 1 - b / 26; ctx.strokeStyle = C.K; ctx.lineWidth = 18 * k + 2; poly([[x0, y], [x1, y]]); ctx.strokeStyle = C.R; ctx.lineWidth = 14 * k + 1; poly([[x0, y], [x1, y]]); ctx.strokeStyle = C.W; ctx.lineWidth = 4 * k + 0.5; poly([[x0, y], [x1, y]]); }
    }
    ctx.lineCap = 'round';
  }
  if (ig.chips) for (const c of ig.chips) {
    if (c.x < -30 || c.x > W + 30 || c.y > H + 30) continue;
    ctx.save(); ctx.translate(c.x, c.y); ctx.rotate(c.r);
    if (ig.src) { ctx.drawImage(ig.src, c.sx, c.sy, c.w, c.h, -c.w / 2, -c.h / 2, c.w, c.h); ctx.strokeStyle = C.K; }
    else { ctx.fillStyle = C.K; ctx.fillRect(-c.w / 2, -c.h / 2, c.w, c.h); ctx.strokeStyle = C.W; }
    ctx.lineWidth = 1; ctx.strokeRect(-c.w / 2 + 0.5, -c.h / 2 + 0.5, c.w - 1, c.h - 1);
    ctx.restore();
  }
  if (ig.wall) {
    const w = ig.wall, a = Math.max(0, 1 - (t - w.t) / 70), rng = seeded(29);
    if (a > 0) {
      ctx.globalAlpha = a;
      for (let i = 0; i < 9; i++) {
        let x = w.x, y = w.y; const ang = Math.PI * (f > 0 ? 1 : 0) + (i - 4) * 0.33;
        ctx.beginPath(); ctx.moveTo(x, y);
        for (let j = 0; j < 4; j++) { const l = 8 + rng() * 16; x += Math.cos(ang + (rng() - 0.5) * 0.7) * l; y += Math.sin(ang + (rng() - 0.5) * 0.7) * l; ctx.lineTo(x, y); }
        ctx.strokeStyle = C.K; ctx.lineWidth = 3; ctx.stroke(); ctx.strokeStyle = i % 2 ? C.W : C.R; ctx.lineWidth = 1.2; ctx.stroke();
      }
      ctx.fillStyle = C.W; disc(w.x, w.y, 3 * a + 1);
      ctx.globalAlpha = 1;
    }
  }
  drawParticles(); drawTexts();
  ctx.restore();
  drawHUD();
  if (t >= IG.still && t < IG.cut) drawIgEye(t, f, B);
}
/* the close-up in the silence: a band across the screen, inside the hero's head - the headband and one eye, its
   red iris flaring on the second heartbeat */
function drawIgEye(t, f, B) {
  const t0 = IG.still, t1 = IG.cut, y0 = 70, h = 76, ey = y0 + 46;
  const u = t < t0 + 6 ? easeOut((t - t0) / 6) : t > t1 - 5 ? 1 + (t - (t1 - 5)) / 5 : 1, off = (u - 1) * W * 1.1;
  ctx.save(); ctx.beginPath(); ctx.rect(0, y0, W, h); ctx.clip();
  ctx.translate(Math.round(off), 0);
  if (f < 0) { ctx.translate(W, 0); ctx.scale(-1, 1); }
  ctx.fillStyle = B ? '#3a0006' : C.K; ctx.fillRect(-20, y0, W + 40, h);
  // the edge of the face, the headband and its knot streaming back
  ctx.strokeStyle = C.W; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(250, y0 + 260, 245, -1.2, -0.28); ctx.stroke();
  ctx.fillStyle = (save.cls | 0) >= 3 ? C.Y : C.R; ctx.beginPath(); ctx.moveTo(-20, y0 + 8); ctx.lineTo(470, y0 + 22); ctx.lineTo(470, y0 + 32); ctx.lineTo(-20, y0 + 20); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = (save.cls | 0) >= 3 ? C.Y : C.R; ctx.lineWidth = 3;
  for (let i = 0; i < 2; i++) { ctx.beginPath(); ctx.moveTo(60, y0 + 16); ctx.quadraticCurveTo(30, y0 + 30 + i * 16, -10, y0 + 24 + i * 22 + Math.sin(t * 0.3 + i) * 3); ctx.stroke(); }
  // the eye: a sharp almond of white, the iris, a slit pupil, a glint
  ctx.fillStyle = C.W; ctx.beginPath(); ctx.moveTo(250, ey + 2); ctx.quadraticCurveTo(330, ey - 22, 410, ey - 8); ctx.quadraticCurveTo(334, ey + 10, 250, ey + 2); ctx.fill();
  ctx.strokeStyle = C.W; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(262, ey - 16); ctx.quadraticCurveTo(334, ey - 34, 404, ey - 20); ctx.stroke();
  const flare = t - (t0 + 17), ic = B ? C.W : C.R;
  ctx.fillStyle = ic; disc(346, ey - 6, 8);
  ctx.fillStyle = C.K; ctx.fillRect(345, ey - 13, 2, 14);
  ctx.fillStyle = C.W; ctx.fillRect(341, ey - 11, 2, 2);
  if (flare >= 0 && flare < 10) {
    // the flare: a ring bursting off the iris and a streak of light along the band
    const k = flare / 10;
    ctx.strokeStyle = ic; ctx.lineWidth = 2 * (1 - k) + 0.5; ctx.beginPath(); ctx.arc(346, ey - 6, 10 + k * 40, 0, TAU); ctx.stroke();
    ctx.globalAlpha = 1 - k; ctx.fillStyle = ic; ctx.fillRect(346 - 200 * (1 - k * 0.5), ey - 7, 400 * (1 - k * 0.5), 2); ctx.globalAlpha = 1;
  }
  ctx.restore();
  ctx.fillStyle = C.W; ctx.fillRect(0, y0, Math.round(W * Math.min(1, u)), 1); ctx.fillRect(0, y0 + h - 1, Math.round(W * Math.min(1, u)), 1);
}
function drawContinueOverlay() {
  const t = sceneT; if (t < 70) return;
  ctx.globalAlpha = 0.75; ctx.fillStyle = C.K; ctx.fillRect(0, 0, W, H); ctx.globalAlpha = 1;
  text('컨티뉴?', 240, 62, {sc: 5, color: C.W, align: 'center'});
  text(String(Math.max(0, 9 - Math.floor((t - 70) / 60))), 240, 104, {sc: 6, color: C.R, outline: C.W, align: 'center'});
  if ((t >> 4) & 1) text('ENTER를 눌러 이어하기', 240, 170, {color: C.Y, align: 'center'});
}
function drawGameOver() {
  ctx.fillStyle = C.K; ctx.fillRect(0, 0, W, H);
  text('게임 오버', 240, 96, {sc: 6, color: C.R, align: 'center'});
  if (sceneT > 60 && ((sceneT >> 4) & 1)) text('ENTER를 눌러 타이틀로', 240, 160, {color: C.W, align: 'center'});
}
function rewardIcon(kind, x, y) {
  if (kind === 'potion') { ctx.fillStyle = C.W; ctx.fillRect(x - 3, y - 2, 7, 7); ctx.fillRect(x - 1, y - 5, 3, 3); ctx.fillStyle = C.R; ctx.fillRect(x - 2, y - 1, 5, 5); }
  else if (kind === 'arrow') { ctx.strokeStyle = C.W; ctx.lineWidth = 1.5; poly([[x - 5, y + 4], [x + 5, y - 4]]); ctx.fillStyle = C.G3; ctx.fillRect(x - 6, y + 3, 3, 3); }
  else if (kind === 'target') { ctx.strokeStyle = C.W; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(x, y, 5, 0, TAU); ctx.stroke(); poly([[x - 7, y], [x + 7, y]]); poly([[x, y - 7], [x, y + 7]]); }
  else drawBlade(x - 7, y + 5, 0.8, -0.6, 17, 4, C.W, C.K);
}
function drawResults() {
  const t = sceneT, r = results;
  ctx.fillStyle = '#b4b4b4'; ctx.fillRect(0, 0, W, H);
  chain(ctx, 0, 40, 200, 270, C.K); chain(ctx, 480, 20, 300, 270, C.K); chain(ctx, 0, 200, 90, 60, C.K);
  ctx.fillStyle = C.K; ctx.fillRect(0, 0, W, 12); ctx.fillRect(0, H - 12, W, 12);
  ctx.fillRect(0, 22, W, 22); ctx.fillStyle = C.R; ctx.fillRect(0, 22, W, 1); ctx.fillRect(0, 43, W, 1);
  text('스테이지 클리어', 240, 23, {sc: 3, color: C.Y, outline: C.R, align: 'center'});
  const px = 100, py = 50, pw = 280, ph = 180;
  ctx.fillStyle = C.K; ctx.fillRect(px, py, pw, ph);
  ctx.strokeStyle = C.R; ctx.lineWidth = 1; ctx.strokeRect(px + 0.5, py + 0.5, pw - 1, ph - 1);
  ctx.strokeStyle = C.W; ctx.strokeRect(px + 2.5, py + 2.5, pw - 5, ph - 5);
  const expU = clamp((t - RES_ROW(8)) / 60, 0, 1);
  const rows = [['평가', r.rating], ['클리어 시간', r.time], ['최대 콤보', r.maxCombo], ['저스트 회피', r.justs], ['처치한 적', r.kills || 0], ['받은 피해', r.dmg], ['컨티뉴', r.cont],
    ['골드', '+' + fmt(r.gold)], ['경험치', '+' + fmt(r.exp * expU)], ['퀘스트 보상', null]];
  rows.forEach(([label, val], i) => {
    if (t < RES_ROW(i)) return;
    const y = py + 9 + i * 16.6;
    text(label, px + 12, y, {color: C.R});
    if (i === 0) {
      text(val, px + pw - 12, y - 4, {sc: 2, color: C.Y, align: 'right'});
      if (r.first) text('첫 클리어 보너스', px + pw - 44, y, {color: C.G3, align: 'right'});
      else if (r.newRank) text('최고 평가 갱신!', px + pw - 44, y, {color: C.Y, align: 'right'});
    } else if (val != null) {
      text(String(val), px + pw - 12, y, {color: C.W, align: 'right'});
      if (i === 1 && r.newTime) text('신기록', px + pw - 60, y, {color: C.Y, align: 'right'});
    } else ['potion', 'arrow', 'target', 'sword'].forEach((k, j) => rewardIcon(k, px + pw - 20 - j * 20, y + 3));
  });
  if (t > RES_ROW(RES_N) + 20) {
    // EXP gauge toward the next level
    const k = save.exp / expNeed(save.lv), y = py + ph + 8;
    text('LV.' + save.lv, px, y, {color: C.K});
    ctx.fillStyle = C.K; ctx.fillRect(px + 44, y + 1, pw - 44, 7); ctx.fillStyle = C.W; ctx.fillRect(px + 45, y + 2, pw - 46, 5);
    ctx.fillStyle = C.G2; ctx.fillRect(px + 45, y + 2, Math.round((pw - 46) * Math.min(1, k)), 5);
    if (r.lv1 > r.lv0) text('레벨 업!', px + pw, y - 12, {color: C.R, outline: C.W, align: 'right'});
  }
  if (t > RES_ROW(RES_N) + 50 && ((t >> 4) & 1)) text('ENTER를 눌러 계속', 240, 257, {color: C.W, align: 'center'});
}
function archerIcon(i, x, y) {
  ctx.fillStyle = C.K; ctx.fillRect(x - 1, y - 1, 22, 22); ctx.fillStyle = C.R; ctx.fillRect(x, y, 20, 20);
  ctx.strokeStyle = C.K; ctx.fillStyle = C.K; ctx.lineWidth = 1.5; ctx.lineCap = 'round';
  const cx = x + 10, cy = y + 10;
  if (i === 0) { ctx.beginPath(); ctx.arc(cx, cy, 6, 0, TAU); ctx.stroke(); disc(cx, cy, 2); }
  else if (i === 1) for (let k = -1; k <= 1; k++) { poly([[cx + k * 5, cy - 7], [cx + k * 5, cy + 5]]); ctx.beginPath(); ctx.moveTo(cx + k * 5 - 2, cy + 3); ctx.lineTo(cx + k * 5, cy + 7); ctx.lineTo(cx + k * 5 + 2, cy + 3); ctx.fill(); }
  else if (i === 2) { ctx.beginPath(); ctx.moveTo(cx, cy - 8); ctx.lineTo(cx + 7, cy + 4); ctx.lineTo(cx - 7, cy + 4); ctx.fill(); ctx.fillRect(cx - 1, cy + 4, 3, 4); }
  else if (i === 3) { ctx.beginPath(); ctx.arc(cx - 6, cy, 8, -1.1, 1.1); ctx.stroke(); ctx.lineWidth = 1; poly([[cx - 2, cy - 7], [cx - 2, cy + 7]]); }
  else if (i === 4) { poly([[cx - 7, cy - 7], [cx + 7, cy + 7]]); poly([[cx + 7, cy - 7], [cx - 7, cy + 7]]); }
  else for (let k = -1; k <= 1; k++) poly([[cx - 6 + k * 3, cy + 6 - k * 3], [cx + 5 + k * 3, cy - 5 - k * 3]]);
}
/* soul card: the defeated boss's power becomes the hero's */
function soulEmblem(kind, ex, ey, s = 1) {
  if (kind === 'chain') {
    ctx.fillStyle = C.K; disc(ex, ey, 13 * s); ctx.fillStyle = C.R; disc(ex, ey, 11 * s);
    ctx.strokeStyle = C.K; ctx.lineWidth = 2 * s;
    ctx.beginPath(); ctx.ellipse(ex - 3.5 * s, ey, 4.5 * s, 3 * s, 0, 0, TAU); ctx.stroke(); ctx.beginPath(); ctx.ellipse(ex + 3.5 * s, ey, 4.5 * s, 3 * s, 0, 0, TAU); ctx.stroke();
    ctx.fillStyle = C.W; ctx.fillRect(Math.round(ex - 1 * s), Math.round(ey - 6 * s), Math.max(1, Math.round(2 * s)), Math.max(1, Math.round(3 * s)));
    return;
  }
  if (kind === 'sword') {
    ctx.fillStyle = C.K; disc(ex, ey, 13 * s); ctx.fillStyle = C.B; disc(ex, ey, 11 * s);
    ctx.fillStyle = C.W; disc(ex - 2 * s, ey - 1 * s, 7 * s); ctx.fillStyle = C.B; disc(ex + 1.5 * s, ey - 3 * s, 6 * s);
    ctx.strokeStyle = C.K; ctx.lineWidth = 2.6 * s; poly([[ex - 9 * s, ey + 9 * s], [ex + 9 * s, ey - 9 * s]]);
    ctx.strokeStyle = C.W; ctx.lineWidth = 1.2 * s; poly([[ex - 5 * s, ey + 5 * s], [ex + 9 * s, ey - 9 * s]]);
    return;
  }
  if (kind === 'gun') {
    ctx.fillStyle = C.K; disc(ex, ey, 13 * s); ctx.fillStyle = C.Y; disc(ex, ey, 11 * s);
    starPts(ex, ey, 9 * s, C.R); ctx.fillStyle = C.K; disc(ex, ey, 2 * s);
    return;
  }
  ctx.fillStyle = C.K; for (const d of [-1, 1]) { ctx.beginPath(); ctx.moveTo(ex + d * 5 * s, ey); ctx.quadraticCurveTo(ex + d * 16 * s, ey - 10 * s, ex + d * 22 * s, ey - 4 * s); ctx.quadraticCurveTo(ex + d * 14 * s, ey + 2 * s, ex + d * 5 * s, ey + 5 * s); ctx.fill(); }
  ctx.fillStyle = C.G2; ctx.fillRect(ex - 4 * s, ey - 2 * s, 8 * s, 7 * s); ctx.strokeStyle = C.G2; ctx.lineWidth = 1.5 * s; ctx.beginPath(); ctx.arc(ex, ey - 3 * s, 3 * s, Math.PI, 0); ctx.stroke();
}
function drawUnlock() {
  const t = sceneT, kind = results.soul, so = SOULS[kind], gun = kind === 'gun';
  ctx.fillStyle = C.W; ctx.fillRect(0, 0, W, H);
  ctx.globalAlpha = 0.25;
  if (gun) drawFigure(440, 262, -1, makePose({hy: -16, lean: -0.1, l1: -0.55, r1: 0.5, fu: 1.52, ff: 0, bu: -0.55, bf: 2.0}), gunnerLook({sc: 3, color: C.Y, t: globalT, guns: [{hand: 'F', aim: Math.PI, color: C.Y}]}));
  else if (kind === 'sword') drawFigure(440, 262, -1, makePose({hy: -16, lean: 0.06, ht: 0.22, l1: -0.3, r1: 0.3, fu: 0.9, ff: 0.35, bu: -0.5, bf: 0.6}), assassinLook({sc: 3, color: C.B, kasa: {color: C.B}, hair: {color: '#8fa0e6'}, t: globalT, katanas: [{hand: 'F', len: 30, color: '#8fa0e6'}]}));
  else if (kind === 'chain') drawFigure(440, 262, -1, makePose({hy: -16.8, lean: -0.06, l1: -0.14, r1: 0.18, fu: 0.55, ff: 0.2, bu: 1.3, bf: 0.9}), sovLook({sc: 3, color: C.R, cape: {color: '#f08a92', tatter: true, len: 2.1}, halo: {color: '#f08a92'}, gsword: {color: '#f08a92', edge: C.R, len: 40}, t: globalT}));
  else drawFigure(440, 262, -1, makePose({hy: -16, lean: -0.1, l1: -0.55, r1: 0.5, fu: 1.5, ff: 0, bu: 1.5 - Math.PI, bf: 2.67}), {sc: 3, color: C.G2, t: globalT, bow: {aim: Math.PI, drawn: true, arrow: true, color: C.G2}});
  ctx.globalAlpha = 1;
  // freed allies entrust their power; the Sovereign's is torn from it
  banner(14, 28, kind === 'chain' ? '군주의 혼 탈환' : '동료의 힘을 이어받았다', 3);
  const glow = 20 + Math.sin(t * 0.1) * 3;
  ctx.globalAlpha = 0.3; ctx.fillStyle = so.col; disc(240, 66, glow); ctx.globalAlpha = 1;
  soulEmblem(kind, 240, 64, 1.2);
  text(so.name, 240, 84, {sc: 4, align: 'center', outline: C.W});
  text(kind === 'chain' ? '사슬의 군주에게서 빼앗긴 힘을 되찾았다' : '해방된 ' + stage.boss + '가 맡긴 힘', 240, 112, {color: C.R, align: 'center', outline: C.W});
  ctx.fillStyle = C.K; ctx.fillRect(140, 126, 200, 1);
  so.desc.forEach((s, i) => text(s, 240, 134 + i * 15, {align: 'center', outline: C.W}));
  text('혼의 힘은 전투 중 자동으로 발동한다 · 월드 맵의 성장 화면에서 확인', 240, 176, {color: C.R, align: 'center', outline: C.W});
  if (t > 40 && ((t >> 4) & 1)) text('ENTER를 눌러 계속', 240, 212, {color: C.R, outline: C.W, align: 'center'});
  ctx.fillStyle = C.K; ctx.fillRect(0, 234, W, 36);
}
function drawTBC() {
  ctx.fillStyle = C.K; ctx.fillRect(0, 0, W, H);
  const nx = STAGES.find(s => s.sealed);
  ctx.globalAlpha = 0.5; drawStarfield(globalT); ctx.globalAlpha = 1;
  ctx.globalAlpha = 0.6; ctx.fillStyle = C.K; ctx.fillRect(0, 0, W, H); ctx.globalAlpha = 1;
  const s = '다음 편에 계속', n = Math.min(s.length, Math.floor(sceneT / 6));
  text(s.slice(0, n), 28, 170, {sc: 4, color: C.W});
  if (sceneT > 60 && nx) text('NEXT  ' + nx.region + '  ·  ' + nx.chap + ' ' + nx.area, 28, 204, {color: C.B, outline: C.W});
  if (sceneT > 80) text('해방한 사슬 ' + clearedCount() + ' / ' + MAIN_STAGES.length + '  ·  플레이해 주셔서 감사합니다', 28, 222, {color: C.G3});
  if (sceneT > 90 && ((sceneT >> 4) & 1)) text('ENTER를 눌러 월드 맵으로', 452, 250, {color: C.W, align: 'right'});
}
/* ---------- ending ---------- */
const CREDITS = [['BLADE SUMMONER', 'serif'], ['사슬의 연대기'], null, ['보스', 'h'], ['래피드 파이어 보우마스터'], ['불릿 헬 슈터'], ['월광 어쌔신'], ['사슬의 군주'], null,
  ['영감', 'h'], ['OVERPOWER - Kevin Do Animation'], null, ['만든 이', 'h'], ['Claude  &  당신'], null, null, ['플레이해 주셔서 감사합니다', 2]];
function drawEnding(t) {
  const shattered = t >= END.shatter;
  ctx.save();
  if (t > END.crack && t < END.shatter) { const j = (t - END.crack) / 40; ctx.translate(Math.round(rnd(-1, 1) * j), Math.round(rnd(-1, 1) * j)); }
  // the true ending starts from the broken chains of the first ending and ends with none left at all
  if (trueEnd) drawStarfield(globalT, true, shattered); else drawStarfield(globalT, shattered, false);
  if (t > END.crack && !shattered) {
    // red fractures crawl along the belt of chains (and, in the true ending, along the stubs on the sword)
    const k = (t - END.crack) / (END.shatter - END.crack), rng = seeded(3);
    ctx.strokeStyle = C.R; ctx.lineWidth = 1.5;
    const crack = (x, y, sx, sy) => { ctx.beginPath(); ctx.moveTo(x, y); for (let j = 0; j < 4; j++) { x += (rng() - 0.5) * sx; y += (rng() - 0.5) * sy; ctx.lineTo(x, y); } ctx.stroke(); };
    for (let i = 0; i < Math.floor(k * 16); i++) { const a = 3.98 + rng() * 1.48; crack(250 + Math.cos(a) * 298, 520 + Math.sin(a) * 298, 16, 10); }
    if (trueEnd) for (let i = 0; i < Math.floor(k * 10); i++) { const [x, y] = tswordPt([72, 132, 152, 176, 194][i % 5] + rng() * 10, rng() * 30 - 12); crack(x, y, 10, 12); }
    if ((t >> 2) & 1) { ctx.globalAlpha = 0.18 * k; ctx.fillStyle = C.R; ctx.fillRect(-4, -4, W + 8, H + 8); ctx.globalAlpha = 1; }
  }
  ctx.restore();
  drawParticles();
  if (shattered) {
    // the hero on the rim of the freed world, sword raised
    ctx.globalAlpha = clamp((t - END.shatter - 30) / 60, 0, 1);
    drawFigure(250, 216, 1, makePose({hy: -16, lean: -0.08, ht: -0.2, l1: -0.4, r1: 0.4, fu: 2.55, ff: 0.35, bu: 2.3, bf: 0.4, sa: Math.PI - 0.35}),
      heroLook({sc: 1.4, color: C.K, outline: C.W, t: globalT, sword: {len: SWORD_LEN, color: C.K, edge: C.Y}}));
    ctx.globalAlpha = 1;
  }
  if (t >= END.text && t < END.credits + 40) {
    const a = t > END.credits ? Math.max(0, 1 - (t - END.credits) / 40) : 1;
    ctx.globalAlpha = 0.6 * a; ctx.fillStyle = C.K; ctx.fillRect(0, 58, W, 66); ctx.globalAlpha = a;
    let chars = Math.floor((t - END.text) / 2);
    endLines().forEach((s, i) => { if (chars > 0) text(s.slice(0, chars), 240, 66 + i * 18, {color: i === 2 ? (trueEnd ? C.Y : C.R) : C.W, align: 'center'}); chars -= s.length + 10; });
    ctx.globalAlpha = 1;
  }
  // the credits roll only in the true ending, after the original
  if (trueEnd && t >= END.credits && t < END.fin) {
    ctx.globalAlpha = Math.min(0.72, (t - END.credits) / 60); ctx.fillStyle = C.K; ctx.fillRect(0, 0, W, H); ctx.globalAlpha = 1;
    let y = H + 10 - (t - END.credits) * 0.9;
    for (const c of CREDITS.slice(0, 8).concat([['사슬의 주인']], CREDITS.slice(8))) {
      if (!c) { y += 16; continue; }
      const [s, kind] = c;
      if (y > -40 && y < H + 10) {
        if (kind === 'serif') ktext(s, 240, y, {sc: 'serif', color: C.W, align: 'center'});
        else if (kind === 'h') text(s, 240, y, {color: C.R, align: 'center'});
        else text(s, 240, y, {sc: kind === 2 ? 2 : 1, color: kind === 2 ? C.Y : C.W, align: 'center'});
      }
      y += kind === 'serif' ? 40 : kind === 2 ? 26 : 16;
    }
  }
  if (t >= END.fin) {
    ctx.globalAlpha = 0.72; ctx.fillStyle = C.K; ctx.fillRect(0, 0, W, H); ctx.globalAlpha = 1;
    if (trueEnd) text('TRUE END', 240, 96, {sc: 6, color: C.W, outline: C.P, ow: 1, align: 'center'});
    else {
      // THE END - then the dots creep in one by one, and a question mark slams down in violet: it is not over
      // (widths measured off screen with the same renderer, so the pieces line up)
      const k = t - END.fin, o = {sc: 6, color: C.W, outline: C.R, ow: 1}, wEnd = text('THE END', 0, -200, o), wDot = text('.', 0, -200, o), wQ = text('?', 0, -200, o);
      const x0 = Math.round(240 - (wEnd + wDot * 4 + wQ) / 2), dots = clamp(Math.floor((k - 40) / 10), 0, 4), q = k >= 92;
      text('THE END', x0, 96, o);
      for (let i = 0; i < dots; i++) text('.', x0 + wEnd + wDot * i, 96, o);
      if (q) { const s = k < 100 ? 1 + (100 - k) * 0.08 : 1, j = k < 104 ? rnd(-2, 2) : 0; text('?', x0 + wEnd + wDot * 4 + j - (s - 1) * wQ / 2, 96 - (s - 1) * 20, {sc: Math.round(6 * s), color: C.P, outline: C.W, ow: 1}); }
      if (q && k > 120) { ctx.fillStyle = C.K; ctx.fillRect(120, 192, 240, 16); ctx.fillStyle = C.P; ctx.fillRect(120, 192, 240, 1); ctx.fillRect(120, 207, 240, 1); text('지구의 중심에, 아직 무언가가 남아 있다', 240, 196, {color: C.W, align: 'center'}); }
    }
    text(trueEnd ? '세상의 감옥이 무너졌다' : '모든 사슬이 해방되었다', 240, 148, {sc: 2, color: C.Y, align: 'center'});
    if (t > END.fin + (trueEnd ? 40 : 140) && ((t >> 4) & 1)) text('ENTER를 눌러 타이틀로', 240, 220, {color: C.W, align: 'center'});
  } else if (t > END.text + 60 && ((t >> 5) & 1)) text('ENTER 건너뛰기', 474, 258, {color: C.W, align: 'right'});
}
function drawPause() {
  ctx.globalAlpha = 0.6; ctx.fillStyle = C.K; ctx.fillRect(0, 0, W, H); ctx.globalAlpha = 1;
  ctx.fillStyle = C.K; ctx.fillRect(70, 8, 340, 254);
  ctx.strokeStyle = C.W; ctx.lineWidth = 1; ctx.strokeRect(72.5, 10.5, 335, 249);
  text('일시정지', 240, 14, {sc: 3, color: C.W, align: 'center'});
  drawControlsList(46);
  text('P 계속하기  ·  K 포기하고 월드 맵으로', 240, 244, {color: C.Y, align: 'center'});
}

/* ---------- render dispatch ---------- */
const hudScenes = new Set(['fight', 'phase2', 'phase2b', 'passive', 'mini']);
function render() {
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1;
  switch (scene) {
    case 'title': drawTitle(); break;
    case 'map': drawMap(); break;
    case 'growth': drawGrowth(); break;
    case 'bosscard': drawBossCard(sceneT); break;
    case 'levelup': drawLevelUp(sceneT); break;
    case 'ending': drawEnding(sceneT); break;
    case 'opening': drawOpening(sceneT); break;
    case 'promote': drawPromote(sceneT); break;
    case 'skills': drawSkills(); break;
    case 'loading': drawLoading(); break;
    case 'intro': drawIntro(); break;
    case 'special': drawSpecial(); break;
    case 'origin3': drawOrigin3(); break;
    case 'execute': drawExecute(); break;
    case 'bossbanner': drawBossBanner(sceneT); break;
    case 'settings': drawSettings(); break;
    case 'practice':
      drawWorld(); drawHUD(); drawPracticePanel(); drawBigText();
      if (pmenu) drawPracticeMenu();
      break;
    case 'results': drawResults(); break;
    case 'unlock': drawUnlock(); break;
    case 'tbc': drawTBC(); break;
    case 'gameover': drawGameOver(); break;
    case 'passive':
      drawWorld(); drawHUD();
      if (sceneT < 40) { ctx.globalAlpha = sceneT / 40 * 0.6; ctx.fillStyle = C.R; ctx.fillRect(0, 0, W, H); ctx.globalAlpha = 1; }
      else { ctx.save(); ctx.translate(0, Math.round((1 - easeOut(Math.min(1, (sceneT - 40) / 18))) * -H)); drawPassiveCard(sceneT); ctx.restore(); }
      break;
    default:
      drawWorld();
      if (hudScenes.has(scene) || (scene === 'continue' && sceneT < 70) || (scene === 'victory' && sceneT < 110)) drawHUD();
      drawBigText();
      if (scene === 'dialogue') drawDialogue();
      if (scene === 'continue') drawContinueOverlay();
      if (paused && (scene === 'fight' || scene === 'mini')) drawPause();
  }
  if (wipeT > 0) drawWipe();
  if (muteMsgT > 0) text(SND.isMuted() ? '소리 끔' : '소리 켬', 240, 22, {color: C.Y, outline: C.K, align: 'center'});
}

/* ---------- boot ---------- */
const legend = document.getElementById('legend');
function fit() {
  const dpr = window.devicePixelRatio || 1;
  const lh = legend && getComputedStyle(legend).display !== 'none' ? legend.offsetHeight + 14 : 0;
  const aw = Math.max(120, window.innerWidth - 44), ah = Math.max(80, window.innerHeight - lh - 36);
  let s = Math.min(aw * dpr / W, ah * dpr / H);
  if (s >= 2) s = Math.floor(s);
  view.style.width = (W * s / dpr) + 'px'; view.style.height = (H * s / dpr) + 'px';
}
addEventListener('resize', fit); fit();

const touch = document.getElementById('touch');
if (window.matchMedia && matchMedia('(pointer: coarse)').matches) {
  touch.hidden = false;
  touch.querySelectorAll('.tb').forEach(el => {
    const k = el.dataset.k;
    const on = e => { e.preventDefault(); SND.unlock(); press(k); el.classList.add('on'); };
    const off = e => { e.preventDefault(); release(k); el.classList.remove('on'); };
    el.addEventListener('pointerdown', on); el.addEventListener('pointerup', off); el.addEventListener('pointercancel', off); el.addEventListener('pointerleave', off);
  });
}
view.addEventListener('pointerdown', () => { SND.unlock(); if (scene !== 'fight' && scene !== 'practice' && scene !== 'mini') { press('start'); setTimeout(() => release('start'), 60); } });

let last = performance.now(), acc = 0;
const STEP = 1000 / 60;
function frame(now) {
/*DEBUG*/if (window.__freeze) { last = now; requestAnimationFrame(frame); return; }
  acc += Math.min(100, now - last); last = now;
  while (acc >= STEP) { update(); acc -= STEP; }
  render(); present();
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
/*DEBUG*/window.__bs = { get player() { return player; }, get boss() { return boss; }, get scene() { return scene; }, get sceneT() { return sceneT; }, get arrows() { return arrows; }, get stats() { return stats; },
/*DEBUG*/  get save() { return save; }, set save(v) { save = v; }, get stage() { return stage; }, STAGES, startStage, goMap: (...a) => goMap(...a), startOpening: r => startOpening(r), startPromote: m => startPromote(m), get tut() { return tut; }, get mobs() { return mobs; }, get wave() { return wave; }, set results(v) { results = v; }, writeSave, get slowmo() { return slowmo; }, get results() { return results; }, get blasts() { return blasts; }, get pshots() { return pshots; },
/*DEBUG*/  bossAttack, setScene, lab: { drawFigure, makePose, playerPose, bossPose, gunnerPose, gunnerLook, assassinPose, assassinLook, sovereignPose, sovLook, drawSwoosh, drawFlatSwoosh, ctx, present, C, W, H, FLOOR, SWORD_LEN, ATTACKS }, get peaks() { return peaks; }, get waves() { return waves; }, get cuts() { return cuts; },
/*DEBUG*/  step(n, keyFn) { for (let i = 0; i < n; i++) { if (keyFn) keyFn(i, press, release); update(); } render(); present(); return scene + ' ' + sceneT; } };
