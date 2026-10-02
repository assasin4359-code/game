/* ---------- campaign screens: world map, growth, boss card, quest banner, level up, transitions ---------- */
let wipeT = 0, mapIdx = 0, growIdx = 0, saveToastT = 0, growFlash = 0, mapDeny = 0;
function goScene(s) { setScene(s); wipeT = 16; }
function goMap(saved) {
  // any promotion scene not seen yet (a carried-over save) plays first, one class at a time
  if ((save.cls | 0) > (save.promoShown | 0)) { startPromote(true); return; }
  SND.chargeStop(); SND.musicStop(); SND.musicStart('calm');
  mode = 'fight'; paused = false; pmenu = null; bgMix = 0; slowmo = 0; timeStop = 0;
  mapIdx = Math.max(0, STAGES.findIndex(s => stageOpen(s) && !save.clear[s.id]));
  if (saved) saveToastT = 110;
  goScene('map');
}
/* black wedge that slides off to the right, trailing a red edge */
function drawWipe() {
  const k = wipeT / 16, x = (1 - k) * (W + 140) - 70;
  ctx.fillStyle = C.K; ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(W + 90, 0); ctx.lineTo(W + 90, H); ctx.lineTo(x - 70, H); ctx.closePath(); ctx.fill();
  ctx.fillStyle = C.R; ctx.beginPath(); ctx.moveTo(x - 6, 0); ctx.lineTo(x, 0); ctx.lineTo(x - 70, H); ctx.lineTo(x - 76, H); ctx.closePath(); ctx.fill();
}

/* ---------- world map: the chained Earth ---------- */
const GLOBE = {x: 330, y: 146, r: 100};
function paintMapBg(g, rng) {
  g.fillStyle = C.K; g.fillRect(0, 0, W, H);
  for (let i = 0; i < 120; i++) { g.fillStyle = rng() < 0.8 ? C.W : [C.Y, C.R, C.B][i % 3]; g.fillRect(Math.round(rng() * W), Math.round(rng() * H), 1, 1); }
  const {x: cx, y: cy, r} = GLOBE;
  const ring = (rx, ry, rot, a0, a1, col, s) => {
    for (let a = a0; a < a1; a += 0.09) {
      const cr = Math.cos(rot), sr = Math.sin(rot), ex = Math.cos(a) * rx, ey = Math.sin(a) * ry, tx = -Math.sin(a) * rx, ty = Math.cos(a) * ry;
      const px = cx + ex * cr - ey * sr, py = cy + ex * sr + ey * cr;
      g.save(); g.translate(px, py); g.rotate(Math.atan2(tx * sr + ty * cr, tx * cr - ty * sr)); g.strokeStyle = col; g.lineWidth = 1.6 * s;
      g.beginPath(); if (Math.round(a / 0.09) % 2) g.ellipse(0, 0, 4 * s, 2.2 * s, 0, 0, TAU); else { g.moveTo(-3.5 * s, 0); g.lineTo(3.5 * s, 0); } g.stroke(); g.restore();
    }
  };
  const belts = [[128, 34, -0.42], [124, 30, 0.35], [132, 22, 0.05]];
  for (const [rx, ry, rot] of belts) ring(rx, ry, rot, Math.PI, TAU, '#5a5a5a', 1);
  // the planet
  g.save(); g.beginPath(); g.arc(cx, cy, r, 0, TAU); g.clip();
  const sea = g.createRadialGradient(cx - 30, cy - 36, 10, cx, cy, r);
  sea.addColorStop(0, '#4a6ae0'); sea.addColorStop(0.7, C.B); sea.addColorStop(1, '#10205e');
  g.fillStyle = sea; g.fillRect(cx - r, cy - r, r * 2, r * 2);
  const land = (x, y, s) => { g.fillStyle = C.G1; g.beginPath(); for (let i = 0; i < 14; i++) { const a = i / 14 * TAU, rr = s * (0.7 + rng() * 0.5); g.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr * 0.8); } g.fill(); g.fillStyle = C.G2; g.beginPath(); g.arc(x - s * 0.2, y - s * 0.2, s * 0.5, 0, TAU); g.fill(); };
  for (const [x, y, s] of [[300, 96, 26], [342, 122, 18], [262, 150, 22], [372, 176, 28], [320, 206, 18], [404, 120, 14], [284, 186, 12]]) land(x, y, s);
  g.fillStyle = C.Y; g.globalAlpha = 0.9; for (const [x, y, s] of [[300, 100, 8], [372, 180, 9]]) { g.beginPath(); g.ellipse(x, y, s, s * 0.5, 0.3, 0, TAU); g.fill(); } g.globalAlpha = 1;
  for (let i = 0; i < 26; i++) { g.fillStyle = C.W; g.beginPath(); g.ellipse(cx - r + rng() * r * 2, cy - r + rng() * r * 2, 6 + rng() * 16, 1.5 + rng() * 2.5, rng() * 0.4 - 0.2, 0, TAU); g.fill(); }
  const shade = g.createLinearGradient(cx - r, 0, cx + r, 0); shade.addColorStop(0.6, 'rgba(0,0,0,0)'); shade.addColorStop(1, 'rgba(0,0,0,0.65)');
  g.fillStyle = shade; g.fillRect(cx - r, cy - r, r * 2, r * 2);
  g.restore();
  g.strokeStyle = '#8fa0e6'; g.lineWidth = 4; g.beginPath(); g.arc(cx, cy, r - 2, 0, TAU); g.stroke();
  g.strokeStyle = C.W; g.lineWidth = 1.2; g.beginPath(); g.arc(cx, cy, r, 0, TAU); g.stroke();
  for (const [rx, ry, rot] of belts) ring(rx, ry, rot, 0, Math.PI, C.W, 1.1);
}
const mapBg = mk();
paintMapBg(mapBg.getContext('2d'), seeded(91));
function lockIcon(x, y) {
  ctx.fillStyle = C.K; ctx.fillRect(x - 5, y - 2, 11, 9); ctx.fillStyle = '#9a9a9a'; ctx.fillRect(x - 4, y - 1, 9, 7);
  ctx.strokeStyle = '#9a9a9a'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(x + 0.5, y - 2, 3, Math.PI, 0); ctx.stroke();
  ctx.fillStyle = C.K; ctx.fillRect(x, y + 1, 2, 3);
}
function brokenChain(x, y) {
  ctx.strokeStyle = C.W; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.ellipse(x - 5, y + 1, 3.5, 2, -0.5, 0.4, TAU - 0.4); ctx.stroke();
  ctx.beginPath(); ctx.ellipse(x + 5, y - 1, 3.5, 2, -0.5, Math.PI + 0.4, Math.PI + TAU - 0.4); ctx.stroke();
  ctx.fillStyle = C.Y; ctx.fillRect(Math.round(x) - 1, Math.round(y) - 3, 2, 2); ctx.fillRect(Math.round(x) + 1, Math.round(y) + 2, 2, 2);
}
function updMap() {
  if (saveToastT > 0) saveToastT--;
  if (mapDeny > 0) mapDeny--;
  const vis = mapStages(), ns = vis.length, n = ns + 3;
  if (pressed.jump) { mapIdx = (mapIdx + n - 1) % n; SND.sfx.tick(); }
  if (pressed.down) { mapIdx = (mapIdx + 1) % n; SND.sfx.tick(); }
  if (pressed.pause) { SND.sfx.select(); goTitle(); return; }
  if (!confirmP()) return;
  if (mapIdx < ns) {
    const s = vis[mapIdx];
    if (!stageOpen(s)) { SND.sfx.deny(); mapDeny = 20; return; }
    SND.sfx.select(); startStage(s);
  } else if (mapIdx === ns) { SND.sfx.select(); growIdx = 0; goScene('growth'); }
  else if (mapIdx === ns + 1) { SND.sfx.select(); startSkills('map'); }
  else { SND.sfx.select(); goTitle(); }
}
function drawMap() {
  const t = globalT;
  ctx.drawImage(mapBg, 0, 0);
  // region nodes on the globe
  const vis = mapStages(), ns = vis.length;
  vis.forEach((s, i) => {
    const [x, y] = s.map, sel = i === mapIdx, open = stageOpen(s), done = !!save.clear[s.id];
    if (sel) { ctx.strokeStyle = C.R; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(x, y, 12 + Math.sin(t * 0.15) * 2, 0, TAU); ctx.stroke(); }
    if (s.hidden && !done) {
      // the hidden heart of the prison: a violet knot of chains with a question mark, pulsing
      const r = 11 + Math.sin(t * 0.1) * 2;
      ctx.fillStyle = C.K; disc(x, y, r + 3); ctx.strokeStyle = VIOLET; ctx.lineWidth = 2;
      for (let k = 0; k < 8; k++) { const a = t * 0.02 + k * TAU / 8; ctx.beginPath(); ctx.ellipse(x + Math.cos(a) * r, y + Math.sin(a) * r, 3, 1.8, a + Math.PI / 2, 0, TAU); ctx.stroke(); }
      text('?', x + 1, y - 3, {color: (t >> 3) & 1 ? C.W : C.R, align: 'center'});
    } else if (done) { ctx.fillStyle = C.K; disc(x, y, 8); brokenChain(x, y); }
    else if (open) { ctx.fillStyle = C.K; disc(x, y, 7); ctx.fillStyle = (t >> 3) & 1 ? C.R : C.Y; disc(x, y, 5); text('!', x + 1, y - 3, {color: C.K, align: 'center'}); }
    else { ctx.fillStyle = C.K; disc(x, y, 8); lockIcon(x, y - 1); }
    if (sel || done || open) {
      const lx = x + 13, al = 'left';
      text(s.region, lx, y - 4, {color: sel ? C.Y : C.W, outline: C.K, align: al});
      if (done && save.best[s.id]) text(save.best[s.id].rank, lx, y + 5, {color: C.Y, outline: C.K, align: al});
    }
  });
  // left panel
  ctx.globalAlpha = 0.85; ctx.fillStyle = C.K; ctx.fillRect(0, 0, 214, H); ctx.globalAlpha = 1;
  ctx.fillStyle = C.R; ctx.fillRect(214, 0, 1, H);
  text('월드 맵', 10, 8, {sc: 3, color: C.W});
  text('사슬의 지구', 92, 16, {color: C.G3});
  text('LV.' + save.lv, 10, 36, {color: C.W}); text('/999', 52, 36, {color: C.R});
  text('골드 ' + fmt(save.gold), 204, 36, {color: C.Y, align: 'right'});
  ctx.fillStyle = '#3a3a3a'; ctx.fillRect(10, 48, 194, 2); ctx.fillStyle = C.G2; ctx.fillRect(10, 48, Math.round(194 * Math.min(1, save.exp / expNeed(save.lv))), 2);
  const rows = vis.map(s => s).concat([{menu: '성장 (능력 강화)'}, {menu: '스킬 (장착 · 해제)'}, {menu: '타이틀로'}]), rs = ns > 4 ? 15 : 17;
  rows.forEach((s, i) => {
    const y = i < ns ? 58 + i * rs : 58 + ns * rs + 5 + (i - ns) * 15, sel = i === mapIdx;
    if (sel) { ctx.strokeStyle = mapDeny > 0 && (mapDeny & 4) ? C.R : C.Y; ctx.lineWidth = 1; ctx.strokeRect(4.5, y - 3.5, 205, 16); menuArrow(8, y + 4); }
    if (s.menu) { text(s.menu, 20, y, {color: sel ? C.Y : C.W}); return; }
    const open = stageOpen(s), done = !!save.clear[s.id], col = !open ? C.B : sel ? C.Y : C.W;
    text(s.region, 20, y, {color: s.hidden ? C.W : open ? (done ? C.G3 : C.R) : C.B});
    text(s.sealed ? '봉인된 지역' : s.hidden ? (done ? '사슬의 심장' : '지구의 중심') : s.area, 64, y, {color: col});
    if (done && save.best[s.id]) text(save.best[s.id].rank, 204, y, {color: C.Y, align: 'right'});
    else if (!open) lockIcon(198, y + 2);
    else if (!done && (t >> 4) & 1) text(s.hidden ? '???' : 'NEW', 204, y, {color: C.R, align: 'right'});
  });
  ctx.fillStyle = C.R; ctx.fillRect(10, 58 + ns * rs, 194, 1);
  // info box
  const bx = 6, by = 181, bw = 202, bh = 82;
  ctx.fillStyle = C.K; ctx.fillRect(bx, by, bw, bh); ctx.strokeStyle = C.W; ctx.lineWidth = 1; ctx.strokeRect(bx + 1.5, by + 1.5, bw - 3, bh - 3);
  const L = (s, i, c) => text(s, bx + 8, by + 7 + i * 14.5, {color: c || C.W});
  if (mapIdx < ns) {
    const s = vis[mapIdx], open = stageOpen(s), best = save.best[s.id];
    L(s.chap + '  ·  ' + s.area, 0, s.sealed ? C.B : C.Y);
    if (s.sealed) { L('사슬에 봉인된 지역.', 1); L('다음 챕터에서 해방됩니다.', 2, C.G3); L('보스 LV.' + s.lv + '  ·  ???', 3, C.R); }
    else if (s.hidden) {
      L('보스  ' + s.boss, 1, C.W);
      L('보스 LV.???   권장 LV.' + s.rec, 2, save.lv < s.rec ? C.R : C.G3);
      L(best ? '최고 평가 ' + best.rank + '  ·  ' + String(Math.floor(best.time / 60)).padStart(2, '0') + ':' + String(Math.floor(best.time % 60)).padStart(2, '0') : '모든 사슬이 시작된 곳', 3, C.W);
      L('3페이즈 · 히든 보스', 4, C.R);
    } else {
      L('보스  ' + s.boss, 1);
      L('보스 LV.' + s.lv + '   권장 LV.' + s.rec, 2, save.lv < s.rec ? C.R : C.G3);
      L(best ? '최고 평가 ' + best.rank + '  ·  ' + String(Math.floor(best.time / 60)).padStart(2, '0') + ':' + String(Math.floor(best.time % 60)).padStart(2, '0') : open ? '아직 해방하지 못한 사슬' : '이전 지역을 먼저 해방하세요', 3, open ? C.W : C.R);
      L((hasSoul(s.soul) ? '획득한 혼: ' : '첫 클리어 보상: ') + SOULS[s.soul].name, 4, s.col === C.Y ? C.Y : C.G3);
    }
  } else if (mapIdx === ns) {
    L('성장', 0, C.Y); L('모은 골드로 능력과 스킬을', 1); L('강화합니다.', 2);
    L('보유 골드 ' + fmt(save.gold), 4, C.Y);
  } else if (mapIdx === ns + 1) {
    L('스킬', 0, C.Y); L('스킬 슬롯에 넣을 기술을 고른다.', 1); L('잠긴 스킬과 해금 조건도 확인.', 2);
    L('슬롯 ' + save.loadout.slice(0, slotCount()).filter(Boolean).length + ' / ' + slotCount() + '  ·  ' + heroClass().name, 4, C.G3);
  } else { L('타이틀 화면으로 돌아갑니다.', 0); L('진행 상황은 자동으로', 2, C.G3); L('저장됩니다.', 3, C.G3); }
  text('W/S 선택 · J 결정 · Esc 타이틀', 474, 258, {color: C.W, align: 'right'});
  if (saveToastT > 0) {
    ctx.globalAlpha = Math.min(1, saveToastT / 20);
    ctx.fillStyle = C.K; ctx.fillRect(292, 8, 180, 26); ctx.strokeStyle = C.W; ctx.strokeRect(293.5, 9.5, 177, 23);
    for (let i = 0; i < 8; i++) { const a = t * 0.2 + i * TAU / 8; ctx.fillStyle = i === 0 ? C.R : '#7a7a7a'; ctx.fillRect(Math.round(307 + Math.cos(a) * 6), Math.round(21 + Math.sin(a) * 6), 2, 2); }
    text(saveToastT > 40 ? '게임 데이터 저장 중...' : '저장 완료', 322, 15, {color: C.W});
    ctx.globalAlpha = 1;
  }
}

/* ---------- growth: spend gold on stats and skills ---------- */
function growIcon(kind, x, y) {
  ctx.fillStyle = C.W; ctx.fillRect(x - 1, y - 1, 20, 20);
  ctx.fillStyle = kind === 'just' ? C.B : kind === 'gold' ? C.K : C.R; ctx.fillRect(x, y, 18, 18);
  if (kind === 'def') {
    // a shield
    ctx.fillStyle = C.W; ctx.beginPath(); ctx.moveTo(x + 3, y + 3); ctx.lineTo(x + 15, y + 3); ctx.lineTo(x + 15, y + 9); ctx.quadraticCurveTo(x + 15, y + 14, x + 9, y + 16); ctx.quadraticCurveTo(x + 3, y + 14, x + 3, y + 9); ctx.closePath(); ctx.fill();
    ctx.fillStyle = C.K; ctx.beginPath(); ctx.moveTo(x + 5, y + 5); ctx.lineTo(x + 13, y + 5); ctx.lineTo(x + 13, y + 9); ctx.quadraticCurveTo(x + 13, y + 12.5, x + 9, y + 14); ctx.quadraticCurveTo(x + 5, y + 12.5, x + 5, y + 9); ctx.closePath(); ctx.fill();
    ctx.fillStyle = C.R; ctx.fillRect(x + 8, y + 6, 2, 6);
  } else if (kind === 'crit') {
    // a burst star with a slash through it
    ctx.fillStyle = C.Y; ctx.beginPath(); for (let i = 0; i < 16; i++) { const a = i / 16 * TAU, r = i % 2 ? 3 : 8; ctx.lineTo(x + 9 + Math.cos(a) * r, y + 9 + Math.sin(a) * r); } ctx.closePath(); ctx.fill();
    ctx.strokeStyle = C.K; ctx.lineWidth = 2; poly([[x + 3, y + 15], [x + 15, y + 3]]); ctx.strokeStyle = C.W; ctx.lineWidth = 1; poly([[x + 3, y + 15], [x + 15, y + 3]]);
  } else if (kind === 'drain') {
    // a heart with a drop falling into it
    ctx.fillStyle = C.K; disc(x + 6.5, y + 9, 3.2); disc(x + 11.5, y + 9, 3.2); ctx.beginPath(); ctx.moveTo(x + 3.4, y + 10.5); ctx.lineTo(x + 9, y + 16); ctx.lineTo(x + 14.6, y + 10.5); ctx.fill();
    ctx.fillStyle = C.W; ctx.beginPath(); ctx.moveTo(x + 9, y + 1); ctx.quadraticCurveTo(x + 12, y + 6, x + 9, y + 7); ctx.quadraticCurveTo(x + 6, y + 6, x + 9, y + 1); ctx.fill();
    ctx.fillStyle = C.G2; ctx.fillRect(x + 8, y + 10, 2, 4); ctx.fillRect(x + 7, y + 11, 4, 2);
  } else if (kind === 'adren') {
    // flames rising round a figure getting back up
    ctx.fillStyle = C.Y; for (let i = 0; i < 4; i++) { const fx = x + 3 + i * 4; ctx.beginPath(); ctx.moveTo(fx - 2, y + 17); ctx.lineTo(fx, y + 4 + (i % 2) * 5); ctx.lineTo(fx + 2, y + 17); ctx.fill(); }
    ctx.fillStyle = C.K; disc(x + 9, y + 7, 2.6); ctx.beginPath(); ctx.moveTo(x + 5, y + 17); ctx.quadraticCurveTo(x + 9, y + 7, x + 13, y + 17); ctx.fill();
  } else if (kind === 'gold') {
    // a stack of coins
    for (let i = 0; i < 3; i++) { ctx.fillStyle = C.Y; ctx.beginPath(); ctx.ellipse(x + 9, y + 14 - i * 4, 6, 2.5, 0, 0, TAU); ctx.fill(); ctx.strokeStyle = C.K; ctx.lineWidth = 1; ctx.stroke(); }
    ctx.fillStyle = C.W; ctx.fillRect(x + 7, y + 5, 2, 1);
  } else if (kind === 'atk') { drawBlade(x + 4, y + 15, 0.55, -0.83, 13, 4, C.K, C.W); ctx.fillStyle = C.Y; ctx.fillRect(x + 11, y + 3, 5, 1); ctx.fillRect(x + 13, y + 1, 1, 5); }
  else if (kind === 'hp') { ctx.fillStyle = C.K; disc(x + 6.5, y + 7, 3.6); disc(x + 11.5, y + 7, 3.6); ctx.beginPath(); ctx.moveTo(x + 3, y + 8.5); ctx.lineTo(x + 9, y + 15); ctx.lineTo(x + 15, y + 8.5); ctx.fill(); ctx.fillStyle = C.W; ctx.fillRect(x + 5, y + 5, 2, 2); }
  else if (kind === 'just') { ctx.strokeStyle = C.W; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(x + 9, y + 9, 6, 0, TAU); ctx.stroke(); poly([[x + 9, y + 9], [x + 9, y + 5]]); poly([[x + 9, y + 9], [x + 12, y + 10]]); ctx.fillStyle = C.K; ctx.fillRect(x + 2, y + 2, 3, 1); ctx.fillRect(x + 13, y + 15, 3, 1); }
  else drawIcon(kind, x, y);
}
function updGrowth() {
  if (growFlash > 0) growFlash--;
  if (mapDeny > 0) mapDeny--;
  updateTexts();
  const n = UPGRADES.length + 1;
  if (pressed.jump) { growIdx = (growIdx + n - 1) % n; SND.sfx.tick(); }
  if (pressed.down) { growIdx = (growIdx + 1) % n; SND.sfx.tick(); }
  if (pressed.pause) { SND.sfx.select(); goMap(); return; }
  if (!confirmP()) return;
  if (growIdx === UPGRADES.length) { SND.sfx.select(); goMap(); return; }
  const u = UPGRADES[growIdx], lv = upgLv(u.k);
  if (lv >= u.max) { SND.sfx.deny(); return; }
  if (save.gold < u.cost[lv]) { SND.sfx.deny(); mapDeny = 20; floatText('골드가 부족합니다', 364, 132, C.R, 1, 50, C.K); return; }
  save.gold -= u.cost[lv]; save.upg[u.k] = lv + 1; writeSave();
  SND.sfx.buy(); growFlash = 18;
  floatText('강화 완료!  LV.' + (lv + 1), 364, 132, C.Y, 2, 50, C.K);
}
function drawGrowth() {
  const t = globalT;
  drawStarfield(t);
  ctx.globalAlpha = 0.7; ctx.fillStyle = C.K; ctx.fillRect(0, 0, W, H); ctx.globalAlpha = 1;
  ctx.fillStyle = C.R; ctx.beginPath(); ctx.moveTo(0, 30); ctx.lineTo(W, 12); ctx.lineTo(W, 16); ctx.lineTo(0, 34); ctx.fill();
  text('성장', 12, 6, {sc: 4, color: C.W});
  text('골드로 능력과 스킬을 강화한다', 88, 16, {color: C.G3});
  text('골드 ' + fmt(save.gold), 470, 6, {sc: 2, color: C.Y, align: 'right'});
  // list: eight rows at a time, scrolling with the selection
  const rows = UPGRADES.concat([{back: true}]), VIS = 8, top = clamp(growIdx - 3, 0, Math.max(0, rows.length - VIS));
  if (top > 0) { ctx.fillStyle = C.Y; ctx.beginPath(); ctx.moveTo(127, 36); ctx.lineTo(133, 36); ctx.lineTo(130, 32); ctx.fill(); }
  if (top + VIS < rows.length) { ctx.fillStyle = C.Y; ctx.beginPath(); ctx.moveTo(127, 245); ctx.lineTo(133, 245); ctx.lineTo(130, 249); ctx.fill(); }
  rows.forEach((u, i) => {
    if (i < top || i >= top + VIS) return;
    const y = 44 + (i - top) * 25, sel = i === growIdx;
    if (sel) {
      if (growFlash > 0 && (growFlash & 2)) { ctx.fillStyle = C.Y; ctx.fillRect(8, y - 3, 238, 23); }
      ctx.strokeStyle = mapDeny > 0 && (mapDeny & 4) ? C.R : C.Y; ctx.lineWidth = 1; ctx.strokeRect(8.5, y - 3.5, 238, 23); menuArrow(12, y + 8);
    }
    if (u.back) { text('월드 맵으로', 26, y + 3, {color: sel ? C.Y : C.W}); return; }
    const lv = upgLv(u.k), flashOn = sel && growFlash > 0 && (growFlash & 2);
    growIcon(u.icon, 24, y);
    text(u.name, 48, y + 4, {color: flashOn ? C.K : sel ? C.Y : C.W});
    for (let k = 0; k < u.max; k++) { ctx.fillStyle = k < lv ? C.Y : '#4a4a4a'; ctx.fillRect(136 + k * 9, y + 5, 7, 7); }
    text(lv >= u.max ? '최대' : fmt(u.cost[lv]), 240, y + 4, {color: lv >= u.max ? C.G3 : save.gold >= u.cost[lv] ? C.Y : C.R, align: 'right'});
  });
  // detail panel
  const px = 256, py = 40, pw = 216, ph = 150;
  ctx.fillStyle = C.K; ctx.fillRect(px, py, pw, ph); ctx.strokeStyle = C.W; ctx.lineWidth = 1; ctx.strokeRect(px + 1.5, py + 1.5, pw - 3, ph - 3);
  if (growIdx < UPGRADES.length) {
    const u = UPGRADES[growIdx], lv = upgLv(u.k);
    growIcon(u.icon, px + 10, py + 10);
    text(u.name, px + 36, py + 10, {sc: 2, color: C.W});
    u.desc.forEach((d, k) => {
      const y = py + 40 + k * 16, got = k < lv, next = k === lv;
      text((got ? '■ ' : '□ ') + 'LV.' + (k + 1) + '  ' + d, px + 10, y, {color: got ? C.G3 : next ? C.Y : C.B});
    });
    const y = py + ph - 26;
    if (lv >= u.max) text('모든 단계를 강화했다', px + 10, y, {color: C.G3});
    else { text('다음 강화  ' + fmt(u.cost[lv]) + ' 골드', px + 10, y, {color: save.gold >= u.cost[lv] ? C.Y : C.R}); text('J 강화', px + pw - 10, y, {color: C.W, align: 'right'}); }
  } else { text('월드 맵으로 돌아갑니다.', px + 10, py + 12, {color: C.W}); }
  // current stats + souls
  const sy = 200;
  ctx.fillStyle = C.K; ctx.fillRect(px, sy - 6, pw, 70); ctx.strokeStyle = C.W; ctx.strokeRect(px + 0.5, sy - 5.5, pw - 1, 69);
  text('현재 능력', px + 8, sy, {color: C.R}); text(heroClass().name + ' LV.' + save.lv, px + pw - 8, sy, {color: isMaster() ? C.Y : C.W, align: 'right'});
  text('공격력 ' + fmt(atkPower()) + '   최대 HP ' + maxHpNow(), px + 8, sy + 13, {color: C.W});
  text('보스의 혼', px + 8, sy + 29, {color: C.R});
  text('치명 ' + Math.round((0.18 + critBonus()) * 100) + '%' + (upgLv('def') ? ' · 받는 피해 -' + upgLv('def') * 8 + '%' : ''), px + pw - 8, sy + 29, {color: C.G3, align: 'right'});
  if (!save.souls.length) text('없음 · 보스를 처음 쓰러뜨리면 얻는다', px + 8, sy + 42, {color: C.B});
  save.souls.forEach((k, i) => { soulEmblem(k, px + 12 + i * 52, sy + 47, 0.4); text(SOULS[k].name.replace('의 혼', ''), px + 22 + i * 52, sy + 42, {color: {gun: C.Y, sword: C.W, chain: C.R}[k] || C.G3}); });
  drawTexts();
  text('W/S 선택 · J 강화 · Esc 월드 맵', 12, 258, {color: C.W});
}

/* ---------- boss card: "LV.450 ARCHER" style introduction before the fight ---------- */
function drawBossCard(t) {
  const s = stage, gun = s.key === 'gun', sw = s.key === 'sword', ch = s.key === 'chain';
  ctx.fillStyle = C.W; ctx.fillRect(0, 0, W, H);
  // halftone band and a giant black crescent behind the boss
  for (let y = 0; y < H; y += 4) for (let x = (y >> 2) % 2 * 2; x < W; x += 4) if ((x + y) % 8 === 0 && x > 200) { ctx.fillStyle = '#b4b4b4'; ctx.fillRect(x, y, 1, 1); }
  const cr = lerp(0.6, 0, easeOut(Math.min(1, t / 24)));
  ctx.save(); ctx.translate(318, 132); ctx.rotate(cr);
  ctx.fillStyle = C.K; ctx.beginPath(); ctx.arc(0, 0, 118, 0, TAU); ctx.fill();
  ctx.fillStyle = C.W; ctx.beginPath(); ctx.arc(34, -26, 108, 0, TAU); ctx.fill();
  ctx.restore();
  const fx = lerp(W + 140, 372, easeOut(clamp(t / 22, 0, 1)));
  if (gun) drawFigure(fx, 300, -1, makePose({hy: -16, lean: -0.12, ht: 0.1, l1: -0.5, r1: 0.45, fu: 1.62, ff: 0, bu: -0.55, bf: 2.0}),
    gunnerLook({sc: 5, color: C.K, outline: C.W, t: globalT, guns: [{hand: 'F', aim: Math.PI + 0.12, color: C.K, trim: C.Y, big: true}]}));
  else if (sw) drawFigure(fx, 300, -1, makePose({hy: -16, lean: 0.06, ht: 0.22, l1: -0.3, r1: 0.3, fu: 0.9, ff: 0.35, bu: -0.5, bf: 0.6}),
    assassinLook({sc: 5, color: C.K, outline: C.W, t: globalT, katanas: [{hand: 'F', len: 30}]}));
  else if (ch) drawFigure(fx, 318, -1, makePose({hy: -16.8, lean: -0.06, ht: -0.08, l1: -0.14, r1: 0.18, fu: 0.55, ff: 0.2, bu: 1.3, bf: 0.9}), sovLook({sc: 4.6, outline: C.W, t: globalT}));
  else if (s.key === 'origin') drawFigure(fx, 300, -1, makePose({hy: -16, lean: 0.1, l1: -0.3, r1: 0.3, fu: 0.5, ff: 0.55, bu: -0.35, bf: -0.35, sa: 1.05}), originLook({sc: 5, outline: C.W, t: globalT, sword: ORIGIN_SWORD}));
  else { const aL = worldToLimb(Math.PI + 0.2, -1); drawFigure(fx, 300, -1, makePose({hy: -16, lean: -0.1, l1: -0.55, r1: 0.5, r2: -0.1, fu: aL, ff: 0, bu: aL - Math.PI, bf: 2.67}),
    {sc: 5, color: C.K, outline: C.W, scarf: {color: C.G2, n: 2, wind: 1.5}, quiver: true, t: globalT, bow: {aim: Math.PI + 0.2, drawn: true, arrow: true, color: C.K}}); }
  const nx = lerp(-360, 16, easeOut(clamp((t - 6) / 18, 0, 1)));
  ctx.fillStyle = C.W; ctx.fillRect(Math.round(nx) - 8, 12, 380, 90);
  text('LV.' + s.lv, nx, 18, {sc: 3, color: C.R, outline: C.K});
  text('/999', nx + 110, 30, {color: C.K});
  text(s.en, nx, 46, {sc: 3, italic: true, color: C.K, outline: C.W});
  ctx.fillStyle = C.K; ctx.fillRect(Math.round(nx), 72, 300, 2); ctx.fillStyle = s.col; ctx.fillRect(Math.round(nx), 74, 300, 2);
  text(s.boss, nx, 82, {sc: 2, color: C.K, outline: C.W});
  if (t > 26) {
    const u = easeOut(clamp((t - 26) / 14, 0, 1));
    text('SKILLS', 16, 190, {color: C.K});
    for (let i = 0; i < 5; i++) { const x = 16 + i * 27, y = lerp(250, 202, clamp(u * 1.4 - i * 0.1, 0, 1)); if (gun) gunIcon(i, x, y); else if (sw) swordIcon(i, x, y); else if (ch) chainIcon(i, x, y); else if (s.key === 'origin') originIcon(i, x, y); else archerIcon(i, x, y); }
  }
  ctx.fillStyle = C.K; ctx.fillRect(0, 0, W, 8); ctx.fillRect(0, H - 22, W, 22);
  text(s.chap + '  ·  ' + s.area, 12, H - 16, {color: C.W});
  if (t > 34 && ((t >> 4) & 1)) text('ENTER 전투 시작', 468, H - 16, {color: C.Y, align: 'right'});
}

/* ---------- quest banner at the start of a fight ---------- */
function drawQuest(t, goal) {
  const a = t < 8 ? t / 8 : t > 118 ? Math.max(0, 1 - (t - 118) / 30) : 1, y = 44, cx = 240;
  ctx.globalAlpha = a;
  for (const d of [-1, 1]) {
    ctx.fillStyle = C.W; ctx.strokeStyle = C.K; ctx.lineWidth = 1;
    for (let k = 0; k < 3; k++) { ctx.beginPath(); ctx.moveTo(cx + d * 9, y + 8 + k * 3); ctx.quadraticCurveTo(cx + d * (20 + k * 4), y - 4 + k * 5, cx + d * (30 - k * 3), y + 2 + k * 6); ctx.quadraticCurveTo(cx + d * (18 + k * 2), y + 8 + k * 4, cx + d * 9, y + 12 + k * 3); ctx.fill(); ctx.stroke(); }
  }
  ctx.fillStyle = C.K; ctx.fillRect(cx - 7, y, 14, 18); ctx.fillStyle = C.Y; ctx.fillRect(cx - 6, y + 1, 12, 16);
  ctx.fillStyle = C.K; ctx.fillRect(cx - 1, y + 3, 3, 8); ctx.fillRect(cx - 1, y + 13, 3, 2);
  text('퀘스트', cx, y + 22, {sc: 3, color: C.R, outline: C.W, align: 'center'});
  ctx.fillStyle = C.K; ctx.fillRect(cx - 100, y + 50, 200, 1);
  text(goal || (stage.hidden ? '사슬의 주인을 처단하라' : stage.final ? stage.boss + '를 쓰러뜨려라' : stage.boss + '를 사슬에서 해방하라'), cx, y + 54, {color: C.K, outline: C.W, align: 'center'});
  ctx.globalAlpha = 1;
}

/* ---------- level up: a golden pillar of light on the hero, the level counter racing up, the new stats counting in ---------- */
const LVU = {slam: 8, count0: 18, count1: 70, stats: 80, prompt: 118};
function lvuShown(t) { const r = results, u = clamp((t - LVU.count0) / (LVU.count1 - LVU.count0), 0, 1); return Math.round(lerp(r.lv0, r.lv1, 1 - Math.pow(1 - u, 3))); }
function updLevelUp() {
  const t = sceneT;
  if (t === 1) particles.length = 0;
  if (t === LVU.slam) { SND.sfx.impact(); SND.sfx.special(); shake(4); }
  if (t > LVU.count0 && t < LVU.count1 && t % 3 === 0 && lvuShown(t) !== lvuShown(t - 3)) SND.sfx.tick();
  if (t === LVU.count1) {
    SND.sfx.fanfare(); SND.sfx.boom(); flash = {a: 0.8, color: C.W}; shake(7);
    for (let i = 0; i < 3; i++) addP({kind: 'ring', x: 240, y: 86, r0: 10 + i * 8, rMax: 120, life: 20 + i * 6, color: i % 2 ? C.W : C.Y, size: 3});
    for (let i = 0; i < 24; i++) { const a = i / 24 * TAU; addP({kind: 'line', x: 240 + Math.cos(a) * 30, y: 86 + Math.sin(a) * 16, vx: Math.cos(a) * 5, vy: Math.sin(a) * 3, life: 14, color: C.Y, size: 2, len: 3, drag: 0.9}); }
  }
  if (t === LVU.stats || t === LVU.stats + 12) SND.sfx.powerup();
  // sparks streaming up the pillar, rings pulsing out from the hero's feet
  if (t % 2 === 0) addP({x: 240 + rnd(-24, 24), y: 250, vx: rnd(-0.3, 0.3), vy: -rnd(2, 4.5), life: ri(30, 60), color: Math.random() < 0.5 ? C.Y : C.W, size: Math.random() < 0.3 ? 2 : 1});
  if (t % 22 === 0) addP({kind: 'ring', x: 240, y: 246, r0: 8, rMax: 70, life: 22, color: C.Y, size: 2});
  updateParticles(); decayFx();
  if (t > LVU.prompt && confirmP()) { SND.sfx.select(); afterLevelUp(); }
  else if (t > 24 && t < LVU.count1 - 2 && confirmP()) setScene('levelup', LVU.count1 - 1);
}
function statPanel(x, y, w, label, a, b, u, note) {
  ctx.fillStyle = C.K; ctx.fillRect(x, y, w, 46); ctx.strokeStyle = C.Y; ctx.lineWidth = 1; ctx.strokeRect(x + 1.5, y + 1.5, w - 3, 43);
  ctx.fillStyle = C.Y; ctx.fillRect(x + 1, y + 1, 4, 44);
  text(label, x + 12, y + 6, {color: C.Y});
  text(fmt(a) + '  >', x + 12, y + 24, {color: C.W});
  text(fmt(Math.round(lerp(a, b, u))), x + w - 10, y + 22, {sc: 2, color: u >= 1 ? C.Y : C.W, align: 'right'});
  if (note && u >= 1) text(note, x + w - 10, y + 6, {color: C.R, align: 'right'});
}
function drawLevelUp(t) {
  const r = results, cx = 240, fy = 246;
  ctx.fillStyle = C.K; ctx.fillRect(0, 0, W, H);
  // dim golden rays turning behind everything
  for (let i = 0; i < 16; i++) { const a0 = i / 16 * TAU + t * 0.006; if (i % 2) continue; ctx.fillStyle = '#5a4a06'; ctx.beginPath(); ctx.moveTo(cx, fy - 40); ctx.arc(cx, fy - 40, 460, a0, a0 + TAU / 32); ctx.closePath(); ctx.fill(); }
  // the pillar of light
  const pw = 30 + Math.sin(t * 0.3) * 4, pil = ctx.createLinearGradient(cx - pw, 0, cx + pw, 0);
  pil.addColorStop(0, 'rgba(255,222,40,0)'); pil.addColorStop(0.3, 'rgba(255,222,40,0.85)'); pil.addColorStop(0.5, '#ffffff'); pil.addColorStop(0.7, 'rgba(255,222,40,0.85)'); pil.addColorStop(1, 'rgba(255,222,40,0)');
  ctx.fillStyle = pil; ctx.fillRect(cx - pw, 0, pw * 2, fy);
  ctx.fillStyle = C.Y; ctx.beginPath(); ctx.ellipse(cx, fy + 1, 60, 8, 0, 0, TAU); ctx.fill(); ctx.fillStyle = C.W; ctx.beginPath(); ctx.ellipse(cx, fy + 1, 30, 4, 0, 0, TAU); ctx.fill();
  ctx.fillStyle = C.K; ctx.fillRect(0, fy + 9, W, H - fy - 9);
  // the hero, sword raised into the light (still in the old class when a promotion is about to follow)
  drawFigure(cx, fy, 1, makePose({hy: -16, lean: -0.08, ht: -0.2, l1: -0.4, r1: 0.4, fu: 2.55, ff: 0.35, bu: 2.3, bf: 0.4, sa: Math.PI - 0.35}),
    heroLook({sc: 2.6, color: C.K, outline: C.W, t: globalT, sword: {len: SWORD_LEN, color: C.K, edge: C.Y}}, r.promote ? r.promote.cls - 1 : save.cls | 0));
  drawParticles();
  // LEVEL UP slams in
  if (t >= 2) {
    const u = clamp((t - 2) / (LVU.slam - 2), 0, 1), y = lerp(-40, 8, easeOut(u)) + (t < LVU.slam + 6 && t >= LVU.slam ? rnd(-2, 2) : 0);
    text('LEVEL UP', cx, y, {sc: 6, italic: true, color: t < LVU.slam + 6 ? C.W : C.Y, outline: C.R, ow: 2, align: 'center'});
  }
  // the level counter
  if (t >= LVU.count0 - 4) {
    const n = lvuShown(t), landed = t >= LVU.count1, s = landed && t < LVU.count1 + 8 ? 6 : 5;
    const lw = text('LV.', 0, -99, {sc: 3}), nw = String(n).length * 6 * s, x0 = cx - (lw + 6 + nw) / 2;
    text('LV.', x0, 74, {sc: 3, color: C.W, outline: C.K});
    text(String(n), x0 + lw + 6, 74 - (s - 5) * 4 - 12, {sc: s, color: landed ? C.Y : C.W, outline: C.R, ow: landed ? 2 : 1});
    if (landed) {
      const k = Math.min(1, (t - LVU.count1) / 14);
      text('+' + (r.lv1 - r.lv0), x0 + lw + 14 + nw, lerp(70, 58, k), {sc: 3, italic: true, color: C.R, outline: C.W, ow: 1});
      if (r.promote && ((t >> 4) & 1)) text('승급 조건 달성!', cx, 116, {sc: 2, color: C.R, outline: C.W, align: 'center'});
      else if (!r.promote) text(heroClass().name, cx, 118, {color: C.W, align: 'center'});
    }
  }
  // stats counting in from the sides
  if (t >= LVU.stats) {
    const u1 = clamp((t - LVU.stats) / 26, 0, 1), u2 = clamp((t - LVU.stats - 12) / 26, 0, 1);
    const sx = lerp(-160, 16, easeOut(clamp((t - LVU.stats) / 10, 0, 1))), sx2 = lerp(W + 10, W - 16 - 150, easeOut(clamp((t - LVU.stats - 12) / 10, 0, 1)));
    statPanel(sx, 150, 150, '공격력', r.atk0, r.atk1, u1, '+' + Math.round((r.atk1 / r.atk0 - 1) * 100) + '%');
    statPanel(sx2, 150, 150, '최대 HP', r.hp0, r.hp1, u2, '+' + (r.hp1 - r.hp0));
  }
  if (t > LVU.prompt && ((t >> 4) & 1)) text('ENTER를 눌러 계속', cx, 257, {color: C.W, align: 'center'});
}
