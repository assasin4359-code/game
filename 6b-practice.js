/* ---------- training ground: a sunny meadow with straw dummies ---------- */
function softCloud(g, cx, cy, s, rng) {
  const cs = [];
  for (let i = 0; i < 5; i++) cs.push([cx + (i - 2) * 16 * s + (rng() - 0.5) * 8, cy + (rng() - 0.5) * 8 * s - (2 - Math.abs(i - 2)) * 5 * s, (10 + rng() * 9) * s]);
  g.fillStyle = '#c4c4c4'; for (const [x, y, r] of cs) { g.beginPath(); g.arc(x, y, r + 1, 0, TAU); g.fill(); }
  g.fillStyle = C.W; for (const [x, y, r] of cs) { g.beginPath(); g.arc(x, y, r, 0, TAU); g.fill(); }
}
function hill(g, color, base, amp, freq, rng) {
  const ph = rng() * 10;
  g.fillStyle = color; g.beginPath(); g.moveTo(0, H);
  for (let x = 0; x <= W; x += 4) g.lineTo(x, base + Math.sin(x * freq + ph) * amp + Math.sin(x * freq * 2.7 + ph) * amp * 0.3);
  g.lineTo(W, H); g.closePath(); g.fill();
}
function paintMeadow(g, rng) {
  const sky = g.createLinearGradient(0, 0, 0, 200);
  sky.addColorStop(0, '#ffffff'); sky.addColorStop(0.65, '#f3fbf5'); sky.addColorStop(1, '#d4f0dd');
  g.fillStyle = sky; g.fillRect(0, 0, W, H);
  const sx = 262, sy = 42;
  g.strokeStyle = '#ffe98a'; g.lineWidth = 2;
  for (let i = 0; i < 12; i++) { const a = i / 12 * TAU; g.beginPath(); g.moveTo(sx + Math.cos(a) * 24, sy + Math.sin(a) * 24); g.lineTo(sx + Math.cos(a) * 33, sy + Math.sin(a) * 33); g.stroke(); }
  g.fillStyle = '#fff4b8'; g.beginPath(); g.arc(sx, sy, 21, 0, TAU); g.fill();
  g.fillStyle = C.Y; g.beginPath(); g.arc(sx, sy, 15, 0, TAU); g.fill();
  for (const [x, y, s] of [[90, 46, 1], [176, 26, 0.75], [338, 84, 0.7], [476, 100, 0.8], [22, 112, 0.6], [196, 98, 0.55]]) softCloud(g, x, y, s, rng);
  hill(g, '#cdefd9', 150, 16, 0.013, rng);
  hill(g, C.G3, 174, 12, 0.021, rng);
  hill(g, '#72c792', 196, 8, 0.03, rng);
  g.fillStyle = '#b3e5c2'; g.fillRect(0, 206, W, FLOOR - 206);
  for (let i = 0; i < 90; i++) { g.fillStyle = [C.R, C.Y, C.W, C.P][i % 4]; g.fillRect(Math.round(rng() * W), Math.round(208 + rng() * (FLOOR - 212)), 1, 1); }
  // tree on the left
  g.fillStyle = C.K; g.fillRect(38, 128, 9, FLOOR - 128); g.fillStyle = '#3c3c3c'; g.fillRect(40, 130, 5, FLOOR - 132);
  for (const [x, y, r] of [[42, 132, 24], [20, 146, 15], [64, 146, 17], [44, 110, 17], [28, 124, 13], [60, 122, 13]]) leafCluster(g, x, y, r, rng);
  // wooden fence
  g.fillStyle = C.K;
  for (let x = 92; x < W; x += 26) g.fillRect(x, FLOOR - 21, 3, 21);
  g.fillRect(88, FLOOR - 17, W - 88, 2); g.fillRect(88, FLOOR - 9, W - 88, 2);
  // signboard (the label is drawn live so it uses the Hangul renderer)
  g.fillStyle = C.K; g.fillRect(138, 214, 3, FLOOR - 214); g.fillRect(115, 194, 50, 22);
  g.fillStyle = '#e9d58a'; g.fillRect(116, 195, 48, 20);
  // grass floor
  g.fillStyle = C.G1; g.fillRect(0, FLOOR, W, H - FLOOR);
  g.fillStyle = C.G2; g.fillRect(0, FLOOR, W, 2);
  for (let x = 0; x < W; x += 3 + rng() * 4) { const h = 2 + rng() * 4; g.beginPath(); g.moveTo(x - 1.5, FLOOR + 1); g.lineTo(x + rng() * 2 - 1, FLOOR - h); g.lineTo(x + 1.5, FLOOR + 1); g.fill(); }
  g.fillStyle = C.G3; for (let i = 0; i < 40; i++) g.fillRect(Math.round(rng() * W), Math.round(FLOOR + 6 + rng() * (H - FLOOR - 8)), 1, 1);
}
const bgP = mk();
paintMeadow(bgP.getContext('2d'), seeded(31));
function drawSign() { text('연습장', 140, 200, {color: C.K, align: 'center'}); }

function makeDummies() {
  const d = (id, kind, x, y) => ({id, kind, x, y, baseY: y, rot: 0, rotV: 0, flash: 0, t: ri(0, 100), shootT: 150});
  dummies = [d('d0', 'basic', 230, FLOOR), d('d1', 'basic', 300, FLOOR)];
  if (popt.air) dummies.push(d('d2', 'air', 366, 168));
  if (popt.archer) dummies.push(d('d3', 'archer', 436, FLOOR));
}
function updateDummies() {
  for (const d of dummies) {
    d.t++;
    d.rotV += -d.rot * 0.09; d.rotV *= 0.88; d.rot = clamp(d.rot + d.rotV, -0.9, 0.9);
    if (d.flash > 0) d.flash--;
    if (d.kind === 'air') d.y = d.baseY + Math.sin(d.t * 0.04) * 6;
    if (d.kind === 'archer' && scene === 'practice') {
      if (timeStop > 0 || (slowmo > 0 && slowmo % 3 !== 0)) continue;
      if (--d.shootT === 30) SND.sfx.warn();
      if (d.shootT <= 0) {
        d.shootT = popt.rapid ? 70 : 170;
        const sx = d.x - 14, sy = d.y - 30, a = Math.atan2(player.y - 17 - sy, player.x - sx), sp = popt.rapid ? 5 : 3.6;
        newArrow(sx + Math.cos(a) * 6, sy + Math.sin(a) * 6, Math.cos(a) * sp, Math.sin(a) * sp, 'arrow', 6);
        SND.sfx.arrow();
      }
    }
  }
}
function drawDummy(d, sil) {
  const hit = !sil && d.flash > 0 && (d.flash & 2), ink = C.K;
  const body = sil ? C.K : hit ? C.W : '#f0dc8c', straw = sil ? C.K : C.Y, accent = sil ? C.K : C.R;
  if (!sil) { ctx.globalAlpha = 0.35; ctx.fillStyle = C.K; ctx.beginPath(); ctx.ellipse(d.x, FLOOR + 1, d.kind === 'air' ? 6 : 11, 2.5, 0, 0, TAU); ctx.fill(); ctx.globalAlpha = 1; }
  ctx.save(); ctx.translate(Math.round(d.x), Math.round(d.y)); ctx.rotate(d.rot * 0.7);
  ctx.lineCap = 'round';
  if (d.kind === 'air') {
    ctx.strokeStyle = ink; ctx.lineWidth = 1; poly([[0, -52], [6, -70]]);
    ctx.fillStyle = ink; ctx.beginPath(); ctx.arc(7, -79, 9.5, 0, TAU); ctx.fill();
    ctx.fillStyle = accent; ctx.beginPath(); ctx.arc(7, -79, 8.5, 0, TAU); ctx.fill();
    if (!sil) { ctx.fillStyle = C.W; ctx.fillRect(3, -85, 2, 3); }
  } else { ctx.strokeStyle = ink; ctx.lineWidth = 4; poly([[0, 3], [0, -16]]); }
  ctx.strokeStyle = ink; ctx.lineWidth = 3; poly([[-15, -30], [15, -30]]);
  ctx.strokeStyle = straw; ctx.lineWidth = 1;
  for (const s of [-1, 1]) for (let k = -1; k <= 1; k++) poly([[s * 15, -30], [s * 19, -30 + k * 3]]);
  ctx.fillStyle = ink; ctx.beginPath(); ctx.ellipse(0, -25, 10, 13, 0, 0, TAU); ctx.fill();
  ctx.fillStyle = body; ctx.beginPath(); ctx.ellipse(0, -25, 9, 12, 0, 0, TAU); ctx.fill();
  ctx.fillStyle = ink; ctx.fillRect(-9, -20, 18, 2);
  if (!sil) {
    ctx.fillStyle = accent; ctx.beginPath(); ctx.arc(0, -29, 4.5, 0, TAU); ctx.fill();
    ctx.fillStyle = body; ctx.beginPath(); ctx.arc(0, -29, 3, 0, TAU); ctx.fill();
    ctx.fillStyle = accent; ctx.fillRect(-1, -30, 2, 2);
  }
  ctx.strokeStyle = straw; ctx.lineWidth = 1;
  for (let k = -3; k <= 3; k += 2) poly([[k * 2, -14], [k * 2.6, d.kind === 'air' ? -5 : -10]]);
  ctx.fillStyle = ink; ctx.beginPath(); ctx.arc(0, -44, 8, 0, TAU); ctx.fill();
  ctx.fillStyle = body; ctx.beginPath(); ctx.arc(0, -44, 7, 0, TAU); ctx.fill();
  if (!sil) {
    ctx.strokeStyle = ink; ctx.lineWidth = 1;
    for (const ex of [-3, 3]) { poly([[ex - 1.5, -47.5], [ex + 1.5, -44.5]]); poly([[ex + 1.5, -47.5], [ex - 1.5, -44.5]]); }
    poly([[-3, -40.5], [3, -40.5]]); for (let k = -2; k <= 2; k += 2) poly([[k, -41.5], [k, -39.5]]);
    ctx.strokeStyle = C.Y; for (let k = -2; k <= 2; k++) poly([[k * 2, -51], [k * 3, -55 - Math.abs(k)]]);
    if (d.kind === 'archer') {
      ctx.fillStyle = C.G2; ctx.fillRect(-7, -49, 14, 2);
      ctx.strokeStyle = C.G2; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(-10, -30, 9, Math.PI - 1.2, Math.PI + 1.2); ctx.stroke();
      ctx.strokeStyle = ink; ctx.lineWidth = 1; poly([[-13.3, -38.4], [-13.3, -21.6]]);
    }
  }
  ctx.restore();
  if (!sil && d.kind === 'archer' && d.shootT < 36 && ((globalT >> 2) & 1)) text('!', d.x, d.y - 76, {sc: 2, color: C.R, outline: C.K, align: 'center'});
}

function startPractice() {
  resetGame(); mode = 'practice'; pstat = {total: 0, log: [], hits: 0}; pmenu = null; makeDummies();
  player.x = 80; fightT = 0; goScene('practice');
  SND.musicStop(); SND.musicStart('calm');
  bigText = {s: '연습장', t: 0, dur: 70, color: C.G2};
}
function goTitle() { SND.musicStop(); SND.chargeStop(); mode = 'fight'; paused = false; pmenu = null; bgMix = 0; goScene('title'); }
function updPractice() {
  if (pmenu) { updPracticeMenu(); return; }
  if (pressed.pause) { pmenu = {i: 0}; SND.sfx.select(); SND.chargeStop(); if (player.state === 'charge') player.state = 'normal'; return; }
  fightT++;
  if (hitstop > 0) { hitstop--; shakeAmt *= 0.9; holdInput = true; return; }
  const p = player;
  if (popt.infSp) p.sp = 100;
  if (popt.noCd) { p.bladeCd = 0; p.furyCd = 0; p.peakCd = 0; }
  if (p.hp < p.maxHp && p.inv <= 0) p.hp = Math.min(p.maxHp, p.hp + 0.25);
  updatePlayer();
  if (scene !== 'practice') return;
  const tick = worldTick();
  updateDummies(); if (tick) updateArrows();
  updateBlades(); updateWaves(); updatePeaks(); updatePShots();
  updateParticles(); updateTexts(); updateAfterimages(); decayFx();
  if (justGhost && ++justGhost.t > 30) justGhost = null;
  if (globalT % 45 === 0 && particles.filter(q => q.kind === 'fly').length < 6)
    addP({kind: 'fly', x: rnd(80, W - 20), y: rnd(140, 220), vx: rnd(-0.4, 0.4), vy: rnd(-0.2, 0.2), life: 600, color: Math.random() < 0.5 ? C.Y : C.R});
  while (pstat.log.length && pstat.log[0][0] < globalT - 180) pstat.log.shift();
}
function pmItems() {
  const onoff = v => v ? '켜짐' : '꺼짐';
  return [
    {label: 'SP 무한', val: onoff(popt.infSp), fn: () => { popt.infSp = !popt.infSp; }},
    {label: '쿨타임 없음', val: onoff(popt.noCd), fn: () => { popt.noCd = !popt.noCd; }},
    {label: '공중 허수아비', val: onoff(popt.air), fn: () => { popt.air = !popt.air; makeDummies(); }},
    {label: '궁수 허수아비', val: onoff(popt.archer), fn: () => { popt.archer = !popt.archer; makeDummies(); arrows.length = 0; }},
    {label: '저스트 회피 연습', val: onoff(popt.rapid), fn: () => { popt.rapid = !popt.rapid; if (popt.rapid && !popt.archer) { popt.archer = true; makeDummies(); } }},
    {label: '스킬 장착 · 해제', act: true, fn: () => { startSkills('practice'); }},
    {label: '아드레날린 러시 발동', act: true, fn: () => { pmenu = null; triggerAdrenaline(false); }},
    {label: '기록 초기화', act: true, fn: () => { pstat = {total: 0, log: [], hits: 0}; stats.maxCombo = 0; combo.n = 0; combo.t = 0; pmenu = null; floatText('기록 초기화', 240, 120, C.G2, 2, 50); }},
    {label: '계속하기', act: true, fn: () => { pmenu = null; }},
    {label: '메인 메뉴로', act: true, fn: () => { goTitle(); }},
  ];
}
function updPracticeMenu() {
  const items = pmItems(), n = items.length;
  if (pressed.jump) { pmenu.i = (pmenu.i + n - 1) % n; SND.sfx.tick(); }
  if (pressed.down) { pmenu.i = (pmenu.i + 1) % n; SND.sfx.tick(); }
  const it = items[pmenu.i];
  if (confirmP() || (!it.act && (pressed.left || pressed.right))) { it.fn(); SND.sfx.select(); }
  else if (pressed.pause) pmenu = null;
}
function menuArrow(x, y, dir = 1) { ctx.fillStyle = C.R; ctx.beginPath(); ctx.moveTo(x, y - 4); ctx.lineTo(x + dir * 6, y); ctx.lineTo(x, y + 4); ctx.fill(); }
function drawPracticePanel() {
  const x = 330, y = 4, w = 146, h = 60;
  ctx.fillStyle = C.K; ctx.fillRect(x, y, w, h);
  ctx.strokeStyle = C.W; ctx.lineWidth = 1; ctx.strokeRect(x + 1.5, y + 1.5, w - 3, h - 3);
  text('연습장 기록', x + 8, y + 6, {color: C.G3});
  const dps = Math.round(pstat.log.reduce((s, e) => s + e[1], 0) / 3);
  [['총 피해', fmt(pstat.total)], ['DPS', fmt(dps)], ['최대 콤보', String(stats.maxCombo)]].forEach(([l, v], i) => {
    text(l, x + 8, y + 20 + i * 13, {color: C.W});
    text(v, x + w - 8, y + 20 + i * 13, {color: C.Y, align: 'right'});
  });
}
function drawPracticeMenu() {
  ctx.globalAlpha = 0.6; ctx.fillStyle = C.K; ctx.fillRect(0, 0, W, H); ctx.globalAlpha = 1;
  const items = pmItems(), x = 130, y = 36, w = 220, h = 44 + items.length * 18;
  ctx.fillStyle = C.K; ctx.fillRect(x, y, w, h);
  ctx.strokeStyle = C.W; ctx.lineWidth = 1; ctx.strokeRect(x + 2.5, y + 2.5, w - 5, h - 5);
  text('연습 설정', 240, y + 9, {sc: 2, color: C.G3, align: 'center'});
  items.forEach((it, i) => {
    const yy = y + 36 + i * 18, sel = i === pmenu.i;
    if (sel) menuArrow(x + 12, yy + 3);
    text(it.label, x + 24, yy, {color: sel ? C.Y : C.W});
    if (it.val) text(it.val, x + w - 16, yy, {color: it.val === '켜짐' ? C.G3 : C.W, align: 'right'});
  });
  text('W/S 선택 · A/D 또는 J 변경 · P 닫기', 240, y + h + 8, {color: C.W, align: 'center'});
}

/* ---------- main menu & settings ---------- */
let menuIdx = 0, setIdx = 0, showControls = false, wipeConfirm = 0;
const MENU = [['모험'], ['연습장'], ['스킬'], ['설정']];
function menuDesc(i) {
  if (i === 0) return clearedCount() ? 'LV.' + save.lv + '  ·  해방한 사슬 ' + clearedCount() + ' / ' + MAIN_STAGES.length + '  ·  이어서 모험하기' : '사슬에 묶인 지구를 해방하는 모험을 시작합니다';
  return i === 1 ? '허수아비를 상대로 기술과 저스트 회피를 연습합니다' : i === 2 ? '스킬 슬롯에 넣을 기술을 고르고, 모든 스킬을 살펴봅니다' : '난이도, 소리, 화면 효과, 조작법, 진행 초기화';
}
function updTitle() {
  const n = MENU.length;
  if (pressed.jump) { SND.unlock(); menuIdx = (menuIdx + n - 1) % n; SND.sfx.tick(); }
  if (pressed.down) { SND.unlock(); menuIdx = (menuIdx + 1) % n; SND.sfx.tick(); }
  if (confirmP()) {
    SND.unlock(); SND.sfx.select();
    if (menuIdx === 0) { if (!save.opened && !clearedCount()) startOpening(false); else goMap(); }
    else if (menuIdx === 1) startPractice();
    else if (menuIdx === 2) startSkills('title');
    else { setIdx = 0; showControls = false; wipeConfirm = 0; goScene('settings'); }
  }
}
function setItems() {
  const onoff = v => v ? '켜짐' : '꺼짐';
  return [
    {label: '난이도', val: DIFF[settings.diff].name, desc: DIFF[settings.diff].desc, fn: d => { settings.diff = (settings.diff + d + 3) % 3; }},
    {label: '효과음', vol: 'sfx', desc: 'A / D로 음량을 조절합니다', fn: d => { settings.sfx = clamp(settings.sfx + d, 0, 10); }},
    {label: '음악', vol: 'mus', desc: 'A / D로 음량을 조절합니다', fn: d => { settings.mus = clamp(settings.mus + d, 0, 10); }},
    {label: '화면 흔들림', val: onoff(settings.shake), desc: '타격과 폭발 때 화면을 흔듭니다', fn: () => { settings.shake = !settings.shake; }},
    {label: '데미지 숫자', val: onoff(settings.dmgNum), desc: '적중할 때 피해량을 띄웁니다', fn: () => { settings.dmgNum = !settings.dmgNum; }},
    {label: '조작법 보기', act: true, desc: '모든 키 배치를 확인합니다', fn: () => { showControls = true; }},
    {label: '오프닝 다시 보기', act: true, desc: '사슬이 지구를 덮친 그날의 이야기를 다시 봅니다', fn: () => { startOpening(true); }},
    {label: '진행 초기화', act: true, val: wipeConfirm ? '정말?' : null, desc: wipeConfirm ? '한 번 더 누르면 레벨, 골드, 클리어 기록이 모두 지워집니다' : '저장된 모험 기록을 처음부터 다시 시작합니다',
      fn: () => { if (!wipeConfirm) { wipeConfirm = 1; return; } resetSave(); wipeConfirm = 0; SND.sfx.brk(); floatText('초기화 완료', 240, 200, C.R, 2, 60, C.W); }},
    {label: '돌아가기', act: true, desc: '메인 메뉴로 돌아갑니다', fn: () => { goScene('title'); }},
  ];
}
function updSettings() {
  updateTexts();
  if (showControls) { if (confirmP() || pressed.pause || pressed.dash) { showControls = false; SND.sfx.select(); } return; }
  const items = setItems(), n = items.length;
  if (pressed.jump) { setIdx = (setIdx + n - 1) % n; SND.sfx.tick(); wipeConfirm = 0; }
  if (pressed.down) { setIdx = (setIdx + 1) % n; SND.sfx.tick(); wipeConfirm = 0; }
  const it = items[setIdx], d = pressed.left ? -1 : pressed.right ? 1 : 0;
  if (it.act) { if (confirmP()) { SND.sfx.select(); it.fn(); } }
  else if (d || confirmP()) { it.fn(d || 1); saveSettings(); SND.setVolumes(settings.sfx / 10, settings.mus / 10); SND.sfx.tick(); }
  if (pressed.pause && scene === 'settings') goScene('title');
}
/* the controls, with whatever is in each skill slot right now */
function controlRows() {
  const rows = [['A / D', '이동'], ['W / Space', '점프 (2단 점프)'], ['S', '아래 (발판에서 내려오기)'], ['J', '공격 5연타 / 튕겨내기 / 로켓 반사'], ['K', '대시 (무적)'],
    ['공격 직전 K', '저스트 회피 (시간 감속 + 반격)'], ['K 중에 J', '팬텀 피어스 (관통 찌르기)'], ['공중에서 S+J', '메테오 플런지 (내려찍기)'], ['땅에서 S+J', '승룡검', 1]];
  for (let i = 0; i < 5; i++) { const id = save.loadout[i], shut = i >= slotCount(); rows.push([SLOT_KEYS[i] + (i < 3 ? ' / ' + 'CQE'[i] : ''), '슬롯 ' + (i + 1) + ': ' + (shut ? '잠김' : id ? SKILLS[id].name : '비어 있음'), shut ? 9 : 0]); }
  rows.push(['U 길게', (useGodUlt() ? '일검무귀' : '천지 가르기') + ' (SP 100%)'], ['P / Esc', '일시정지']);
  return rows;
}
function drawControlsList(y0) {
  controlRows().forEach(([k, d, need = 0], i) => {
    const y = y0 + i * 12, off = need > (save.cls | 0);
    text(k, 196, y, {color: 'LIOHN'.includes(k[0]) ? C.R : C.Y, align: 'right'}); text(d, 208, y, {color: off ? C.B : C.W});
  });
}
function drawSettings() {
  drawStarfield(globalT);
  ctx.globalAlpha = 0.6; ctx.fillStyle = C.K; ctx.fillRect(0, 0, W, H); ctx.globalAlpha = 1;
  if (showControls) {
    text('조작법', 240, 12, {sc: 4, color: C.W, align: 'center'});
    ctx.fillStyle = C.K; ctx.fillRect(60, 48, 360, 198);
    drawControlsList(52);
    text('J / Enter / Esc 로 돌아가기', 240, 250, {color: C.Y, align: 'center'});
    return;
  }
  text('설정', 240, 12, {sc: 5, color: C.W, align: 'center'});
  ctx.fillStyle = C.R; ctx.fillRect(140, 50, 200, 1);
  const items = setItems();
  drawTexts();
  items.forEach((it, i) => {
    const y = 58 + i * 17, sel = i === setIdx, col = sel ? C.Y : C.W;
    if (sel) menuArrow(98, y + 4);
    text(it.label, 112, y, {color: col});
    if (it.vol) {
      const v = settings[it.vol];
      for (let k = 0; k < 10; k++) { ctx.fillStyle = k < v ? col : '#4a4a4a'; ctx.fillRect(252 + k * 11, y, 8, 8); }
      text(String(v), 384, y, {color: col, align: 'right'});
    } else if (it.val) {
      text(it.val, 318, y, {color: col, align: 'center'});
      if (sel) { menuArrow(270, y + 4, -1); menuArrow(366, y + 4, 1); }
    }
  });
  text(items[setIdx].desc, 240, 214, {color: C.G3, align: 'center'});
  text('W/S 선택 · A/D 변경 · J 결정 · Esc 뒤로', 240, 244, {color: C.W, align: 'center'});
}
