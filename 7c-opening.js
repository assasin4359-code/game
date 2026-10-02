/* ---------- opening cutscene ----------
   the Earth at peace -> the sky tears open and black chains bind the planet -> the three strongest fight back ->
   the Chain Sovereign descends, breaks them and chains their minds (their eyes turn red) -> a thread of the chains'
   power spills over and falls into the chain graveyard; the links coil up out of the crater, a heart starts to beat
   inside them and they knot into the shape of a man beside a greatsword -> the chains burst off him, he opens his
   eyes and remembers nothing, not even who he is -> but he looks up at the chained sky, takes up the sword and
   resolves to save the world. then stage 1. */
const OPEN = {rift: 240, chains: 300, belt: 380, three: 540, sovereign: 840, birth: 1140, impact: 1174, form: 1260, wake: 1400, open: 1430, stand: 1450,
  look: 1560, up: 1630, grab: 1690, title: 1770, end: 1930};
// a line starting with " is the hero's own voice; OPEN_BIG is his last, spoken big in the middle of the screen
const OPEN_BIG = '이 세상을, 구하겠다.';
const OPEN_LINES = [[40, '그날, 하늘이 갈라졌다.'], [300, '틈새에서 쏟아진 검은 사슬이 지구를 옭아맸다.'], [560, '세상에서 가장 강한 세 사람이 사슬에 맞섰다.'],
  [860, '그러나 사슬의 군주는 그들을 힘으로 꺾고,'], [1000, '그 마음마저 사슬로 묶어 버렸다.'], [1150, '...그때, 넘쳐흐른 사슬의 힘 한 줄기가 땅에 떨어졌다.'],
  [1270, '그 힘은 엉기고 뭉쳐, 한 사람의 모습이 되었다.'], [1460, '"...여긴, 어디지."'], [1510, '"나는... 누구지?"'], [1570, '"아무것도 기억나지 않는다."'],
  [1630, '"하지만... 이 힘이 있다면."'], [1700, OPEN_BIG]];
// heartbeats inside the coil of chains (frames after OPEN.birth)
const OPEN_BEATS = [130, 170, 205, 232, 252], GRAVE_DY = -24;
/* the Earth seen whole from space; chain rings wrap around it */
const OE = {x: 240, y: 318, r: 178};
const openEarth = mk();
(g => {
  const rng = seeded(5);
  g.fillStyle = C.K; g.fillRect(0, 0, W, H);
  for (let i = 0; i < 150; i++) { g.fillStyle = rng() < 0.8 ? C.W : [C.Y, C.R, C.B][i % 3]; g.fillRect(Math.round(rng() * W), Math.round(rng() * 200), 1, 1); }
  g.save(); g.beginPath(); g.arc(OE.x, OE.y, OE.r, 0, TAU); g.clip();
  g.fillStyle = C.B; g.fillRect(0, 0, W, H);
  for (let i = 0; i < 30; i++) { g.fillStyle = '#10205e'; g.beginPath(); g.ellipse(40 + rng() * 400, 130 + rng() * 140, 14 + rng() * 34, 5 + rng() * 12, rng() * 0.6 - 0.3, 0, TAU); g.fill(); }
  for (let i = 0; i < 70; i++) { g.fillStyle = rng() < 0.6 ? C.W : '#8fa0e6'; g.beginPath(); g.ellipse(40 + rng() * 400, 130 + rng() * 140, 5 + rng() * 20, 1 + rng() * 3, rng() * 0.4 - 0.2, 0, TAU); g.fill(); }
  const sh = g.createRadialGradient(OE.x - 70, OE.y - 150, 20, OE.x, OE.y, OE.r * 1.25);
  sh.addColorStop(0, 'rgba(5,5,5,0)'); sh.addColorStop(0.55, 'rgba(5,5,5,0.1)'); sh.addColorStop(1, 'rgba(5,5,5,0.85)');
  g.fillStyle = sh; g.fillRect(0, 0, W, H);
  g.restore();
  g.strokeStyle = '#8fa0e6'; g.lineWidth = 5; g.beginPath(); g.arc(OE.x, OE.y, OE.r + 2, 0, TAU); g.stroke();
  g.strokeStyle = C.W; g.lineWidth = 1.5; g.beginPath(); g.arc(OE.x, OE.y, OE.r + 4, 3.3, 6.1); g.stroke();
})(openEarth.getContext('2d'));
/* the night graveyard: black sky, a red horizon glow, a red moon, silhouettes of crosses on the hill */
const openGrave = mk();
(g => {
  const rng = seeded(31);
  g.fillStyle = C.K; g.fillRect(0, 0, W, H);
  const hz = g.createLinearGradient(0, 90, 0, 205);
  hz.addColorStop(0, 'rgba(120,0,16,0)'); hz.addColorStop(1, 'rgba(120,0,16,1)');
  g.fillStyle = hz; g.fillRect(0, 90, W, 120);
  for (let i = 0; i < 60; i++) { g.fillStyle = C.W; g.fillRect(Math.round(rng() * W), Math.round(rng() * 110), 1, 1); }
  g.fillStyle = C.R; g.beginPath(); g.arc(372, 62, 30, 0, TAU); g.fill();
  g.fillStyle = '#a00c18'; for (const [x, y, r] of [[362, 54, 6], [382, 70, 4], [376, 50, 3], [360, 74, 3]]) { g.beginPath(); g.arc(x, y, r, 0, TAU); g.fill(); }
  // clouds drifting across the moon
  g.fillStyle = C.K; for (const [x, y, w] of [[330, 58, 40], [352, 76, 56], [396, 48, 30]]) g.fillRect(x, y, w, 2);
  // the hill and its crosses, in silhouette
  g.beginPath(); g.moveTo(0, H);
  for (let x = 0; x <= W; x += 4) g.lineTo(x, 196 + Math.sin(x * 0.03) * 5 + Math.sin(x * 0.11 + 1.3) * 2 + rng() * 1.5);
  g.lineTo(W, H); g.closePath(); g.fill();
  for (let i = 0; i < 10; i++) crossShape(g, 14 + i * 50 + rng() * 18, 180 - rng() * 6, 4 + rng() * 3, rng() * 0.5 - 0.25, C.K, 2);
  crossShape(g, 40, 176, 14, -0.2, C.K, 4, 60); tombstone(g, 76, 206, 12, 20);
  crossShape(g, 440, 170, 16, 0.26, C.K, 4, 64); tombstone(g, 410, 206, 10, 16);
  // dead tree
  g.strokeStyle = C.K; g.lineCap = 'round';
  for (const [w, pts] of [[5, [[118, 206], [114, 160], [122, 126]]], [3, [[115, 170], [96, 146], [88, 140]]], [2, [[119, 146], [138, 128], [150, 126]]], [2, [[122, 130], [116, 112]]]]) { g.lineWidth = w; g.beginPath(); pts.forEach((p, i) => i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1])); g.stroke(); }
  // the ground: white grass tips along the floor line
  g.fillStyle = C.W; for (let x = 0; x < W; x += 3 + rng() * 6) g.fillRect(Math.round(x), FLOOR - Math.round(rng() * 2), 1, 1);
})(openGrave.getContext('2d'));
// chain rings: two latitudes and one tilted great circle
const OE_RINGS = [{cy: 158, rx: 88, ry: 16, rot: 0}, {cy: 194, rx: 136, ry: 26, rot: 0}, {cy: 300, rx: 198, ry: 64, rot: -0.32}];
function drawEarthRing(R, u, j) {
  const n = Math.round((R.rx + R.ry) * Math.PI / 7), shown = Math.floor(n * u), cr = Math.cos(R.rot), sr = Math.sin(R.rot);
  let head = null;
  for (let k = 0; k < shown; k++) {
    const th = Math.PI * 0.5 + (k / n) * TAU * (j % 2 ? -1 : 1), ex = Math.cos(th) * R.rx, ey = Math.sin(th) * R.ry;
    const x = OE.x + ex * cr - ey * sr, y = R.cy + ex * sr + ey * cr;
    // the back half disappears behind the planet
    if (Math.sin(th) < 0 && Math.hypot(x - OE.x, y - OE.y) < OE.r) continue;
    const tx = -Math.sin(th) * R.rx, ty = Math.cos(th) * R.ry, a = Math.atan2(tx * sr + ty * cr, tx * cr - ty * sr);
    ctx.save(); ctx.translate(x, y); ctx.rotate(a);
    ctx.fillStyle = C.K; ctx.strokeStyle = C.R; ctx.lineWidth = 1.3; ctx.beginPath();
    if (k % 2 === 0) ctx.ellipse(0, 0, 5.4, 3.2, 0, 0, TAU); else ctx.rect(-4, -1.3, 8, 2.6);
    ctx.fill(); ctx.stroke(); ctx.restore();
    head = [x, y];
  }
  if (head && u < 1 && (globalT & 2)) { ctx.fillStyle = C.W; disc(head[0], head[1], 3); }
}
let openingReplay = false;
function startOpening(replay) { openingReplay = !!replay; particles.length = 0; SND.musicStop(); goScene('opening'); }
function finishOpening() {
  if (openingReplay) { goTitle(); return; }
  save.opened = true; writeSave(); startStage(STAGES[0]);
}
function updOpening() {
  const t = sceneT;
  if (t === OPEN.rift) { SND.sfx.rumble(); SND.sfx.boom(); }
  if (t > OPEN.chains && t < OPEN.belt + 80 && t % 12 === 0) SND.sfx.chain();
  const st = t - OPEN.sovereign;
  if (st === 10) { SND.sfx.special(); SND.sfx.rumble(); }
  if (st > 40 && st < SOV.hit && st % 7 === 0) SND.sfx.reflect();
  if (st === SOV.hit) { SND.sfx.chain(); SND.sfx.chain(); flash = {a: 0.4, color: C.R}; }
  if (st === SOV.bound) { SND.sfx.impact(); SND.sfx.chain(); }
  if (st === SOV.glow || st === SOV.glow + 16) SND.sfx.heart();
  if (st === SOV.turn) {
    SND.sfx.brk(); SND.sfx.boom();
    // the binding chains shatter as the brainwashing takes hold
    for (const [x] of SOV_HEROES) for (let i = 0; i < 8; i++) { const g = rnd(0.2, 0.9); addP({kind: 'shard', x: lerp(240, x, g), y: lerp(sovY(st) - 30, 196, g), vx: rnd(-2.5, 2.5), vy: rnd(-3, 1), drag: 0.94, life: ri(18, 30), size: rnd(2, 4), ang: rnd(TAU), spin: rnd(-0.3, 0.3)}); }
  }
  if (t >= OPEN.three && t < OPEN.sovereign) {
    // each hero's strike lands on the chain lunging at them: sounds, and the links bursting apart
    for (let i = 0; i < 3; i++) {
      const pc = panelChain(i, t - OPEN.three); if (!pc) continue;
      if (pc.c === pc.fire) SND.sfx[['arrow', 'gun', 'iai'][i]]();
      if (pc.c === PAN.hit) {
        SND.sfx.brk(); if (i === 2) SND.sfx.slash();
        addP({kind: 'ring', x: pc.hx, y: pc.hy, r0: 3, rMax: 18, life: 10, color: C.W, size: 2});
        for (let k = 0; k < 7; k++) { const a = rnd(TAU), s = rnd(1, 3.5); addP({kind: 'shard', x: pc.hx, y: pc.hy, vx: Math.cos(a) * s, vy: Math.sin(a) * s - 1, drag: 0.93, g: 0.12, life: ri(16, 28), size: rnd(2, 3.5), ang: a, spin: rnd(-0.3, 0.3)}); }
        if (i === 2) addP({kind: 'slashmark', x: pc.hx, y: pc.hy, ang: pc.a + Math.PI / 2, r: 22, life: 12});
      }
    }
  }
  // the birth: the thread of power lands, a heart beats in the coil, the chains burst off, he takes up the sword
  const by = FLOOR + GRAVE_DY;
  if (t === OPEN.birth + 4) SND.sfx.whoosh();
  if (t === OPEN.impact) {
    SND.sfx.boom(); SND.sfx.impact(); flash = {a: 0.6, color: C.W};
    addP({kind: 'ring', x: 250, y: by - 2, r0: 4, rMax: 60, life: 18, color: C.P, size: 3});
    for (let i = 0; i < 24; i++) addP({x: 250 + rnd(-10, 10), y: by - 2, vx: rnd(-3, 3), vy: -rnd(1.5, 5), g: 0.2, life: ri(20, 36), color: i % 3 ? C.K : C.P, size: 2, bounce: true});
  }
  if (t > OPEN.impact && t < OPEN.wake && t % 14 === 0) SND.sfx.chain();
  for (const h of OPEN_BEATS) if (t === OPEN.birth + h) { SND.sfx.heart(); addP({kind: 'ring', x: 250, y: by - 24, r0: 4, rMax: 34, life: 14, color: C.P, size: 2}); }
  if (t === OPEN.wake) {
    SND.sfx.brk(); SND.sfx.chain(); flash = {a: 0.7, color: C.W};
    for (let i = 0; i < 30; i++) { const a = rnd(TAU), s = rnd(1.5, 4.5); addP({kind: 'shard', x: 250 + Math.cos(a) * 10, y: by - 22 + Math.sin(a) * 16, vx: Math.cos(a) * s, vy: Math.sin(a) * s - 1, drag: 0.94, life: ri(24, 44), size: rnd(2, 4), ang: a, spin: 0.25, blue: i % 2 === 0}); }
  }
  if (t === OPEN.open) SND.sfx.beep();
  if (t === OPEN.grab + 24) { SND.sfx.slash(); SND.sfx.powerup(); flash = {a: 0.5, color: C.W}; addP({kind: 'ring', x: 256, y: by - 40, r0: 6, rMax: 60, life: 18, color: C.R, size: 3}); }
  if (t === OPEN.title) { SND.sfx.special(); SND.sfx.fanfare(); }
  for (const [s, line] of OPEN_LINES) if (t > s && t < s + line.length * 2 && (t - s) % 4 === 0) SND.sfx.text();
  updateParticles(); decayFx();
  if (t > 30 && t < OPEN.title && confirmP()) setScene('opening', OPEN.title);
  else if (t >= OPEN.end || (t > OPEN.title + 50 && confirmP())) finishOpening();
}
/* a jagged tear across the sky, glowing red at the edges */
function drawRift(cx, cy, u, t) {
  if (u <= 0) return;
  const rng = seeded(21), w = 230 * u, pts = [];
  for (let i = 0; i <= 14; i++) pts.push([cx - w + (2 * w) * i / 14, cy + (rng() - 0.5) * 14 * u]);
  const hgt = i => (i === 0 || i === 14 ? 0 : (4 + rng() * 10) * u * (1 + Math.sin(t * 0.2 + i) * 0.15));
  const top = pts.map((p, i) => [p[0], p[1] - hgt(i)]), bot = pts.map((p, i) => [p[0], p[1] + hgt(i)]);
  const poly2 = (a, b, grow) => { ctx.beginPath(); a.forEach((p, i) => i ? ctx.lineTo(p[0], p[1] - grow) : ctx.moveTo(p[0], p[1] - grow)); for (let i = b.length - 1; i >= 0; i--) ctx.lineTo(b[i][0], b[i][1] + grow); ctx.closePath(); ctx.fill(); };
  ctx.fillStyle = C.R; poly2(top, bot, 3); ctx.fillStyle = C.K; poly2(top, bot, 0);
  ctx.strokeStyle = C.W; ctx.lineWidth = 1; for (let i = 2; i < 13; i += 3) poly([[pts[i][0], pts[i][1]], [pts[i][0] + rnd(-6, 6), pts[i][1] + rnd(-3, 3)]]);
}
function drawOpeningBand(t) {
  let cur = null;
  for (let i = 0; i < OPEN_LINES.length; i++) { const [s, line] = OPEN_LINES[i], next = OPEN_LINES[i + 1] ? OPEN_LINES[i + 1][0] : OPEN.title; if (t >= s && t < next) cur = [s, line]; }
  if (!cur) return;
  const [s, line] = cur, n = Math.floor((t - s) / 2);
  // his resolve: big red letters in the middle of the screen
  if (line === OPEN_BIG) { if (t - s > 8) text(line.slice(0, Math.floor((t - s - 8) / 4)), 240, 72, {sc: 4, color: C.R, outline: C.K, align: 'center'}); return; }
  // his own voice (a line in quotes) is lighter than the narration
  text(line.slice(0, n), 240, 245, {color: line[0] === '"' ? C.G3 : C.W, align: 'center'});
}
function drawOpening(t) {
  ctx.save();
  if (t >= OPEN.rift && t < OPEN.three) { const j = t < OPEN.belt + 110 ? 1.5 : 0.5; ctx.translate(Math.round(rnd(-j, j)), Math.round(rnd(-j, j))); }
  if (t < OPEN.three) {
    // the Earth, then the tear in the sky and the chains that bind it
    // slow push-in on the planet
    const z = 1 + 0.04 * clamp(t / OPEN.three, 0, 1);
    ctx.translate(240, 200); ctx.scale(z, z); ctx.translate(-240, -200);
    ctx.drawImage(openEarth, 0, 0);
    for (const s of twinkles) { const k = Math.sin(t * s.sp + s.ph); if (k > 0.3 && s.y < 120) { ctx.fillStyle = s.c; ctx.fillRect(Math.round(s.x) - 1, Math.round(s.y), 3, 1); ctx.fillRect(Math.round(s.x), Math.round(s.y) - 1, 1, 3); } }
    if (t >= OPEN.rift) {
      const u = clamp((t - OPEN.rift) / 50, 0, 1);
      ctx.globalAlpha = 0.28 * u; ctx.fillStyle = C.R; ctx.fillRect(-4, -4, W + 8, H + 8); ctx.globalAlpha = 1;
      drawRift(240, 34, u, t);
    }
    if (t >= OPEN.chains) {
      const u = clamp((t - OPEN.chains) / 70, 0, 1);
      for (let i = 0; i < 6; i++) {
        const a = 3.75 + i * 0.38, ex = OE.x + Math.cos(a) * (OE.r - 2), ey = OE.y + Math.sin(a) * (OE.r - 2), k = clamp(u * 1.5 - i * 0.1, 0, 1);
        if (k > 0) { const sx = 240 + (i - 2.5) * 16; chainSeg(sx, 36, lerp(sx, ex, k), lerp(36, ey, k), 0.9); if (k < 1) { ctx.fillStyle = C.W; disc(lerp(sx, ex, k), lerp(36, ey, k), 3); } }
      }
    }
    if (t >= OPEN.belt) OE_RINGS.forEach((R, j) => drawEarthRing(R, clamp((t - OPEN.belt - j * 26) / 90, 0, 1), j));
  } else if (t < OPEN.sovereign) drawThreePanels(t - OPEN.three);
  else if (t < OPEN.birth) drawSovereignFall(t - OPEN.sovereign);
  else drawBirthScene(t);
  ctx.restore();
  drawParticles();
  if (flash.a > 0) { ctx.globalAlpha = Math.min(1, flash.a); ctx.fillStyle = flash.color; ctx.fillRect(0, 0, W, H); ctx.globalAlpha = 1; }
  // letterbox: the narration sits in the bottom bar
  ctx.fillStyle = C.K; ctx.fillRect(0, 236, W, H - 236);
  if (t < OPEN.title) drawOpeningBand(t);
  if (t >= OPEN.title) {
    // title card over the risen hero
    const u = clamp((t - OPEN.title) / 30, 0, 1);
    text('이름 없는 검사', lerp(W + 160, 240, easeOut(u)), 46, {sc: 5, italic: true, color: C.W, outline: C.R, align: 'center'});
    if (t > OPEN.title + 20) { ktext('BLADE SUMMONER', 240, 96, {sc: 'serif', color: C.W, outline: C.K, align: 'center'}); }
    if (t > OPEN.title + 40) text(STAGES[0].chap + '  ' + STAGES[0].area, 240, 245, {color: C.W, align: 'center'});
    if (t > OPEN.title + 60 && ((t >> 4) & 1)) text('ENTER', 470, 258, {color: C.Y, align: 'right'});
  } else if (t > 30 && ((t >> 5) & 1)) text('ENTER 건너뛰기', 470, 258, {color: C.W, align: 'right'});
}
/* the three strongest, each in their own panel: a chain lunges at them again and again, and each time their strike
   meets it - the arrow shatters it, the bullets burst it, the draw cuts its head off */
const PAN = {period: 46, hit: 16, slide: 24, sc: 2.1, fy: 200};
function panelChain(i, tt) {
  const u = tt - i * 18 - PAN.slide; if (u < 0) return null;
  const k = Math.floor(u / PAN.period), c = u % PAN.period, x0 = i * 160, fy = PAN.fy;
  let heroX, ox, oy, ty, near, fire;
  if (i === 0) { heroX = x0 + 56; ox = x0 + 160; oy = k % 2 ? 28 : 86; ty = fy - 40; near = 66; fire = PAN.hit - 5; }
  else if (i === 1) { const s = k % 2 ? -1 : 1; heroX = x0 + 80; ox = s > 0 ? x0 + 160 : x0; oy = 46 + (k % 3) * 24; ty = fy - 42; near = 76; fire = PAN.hit - 3; }
  else { heroX = x0 + 54; ox = x0 + 160; oy = k % 2 ? fy - 72 : fy - 42; ty = fy - 38; near = 30; fire = PAN.hit - 2; }
  const tx = heroX, dist = Math.hypot(tx - ox, ty - oy), a = Math.atan2(ty - oy, tx - ox), reach = 1 - near / dist;
  const e = c < PAN.hit ? easeOut(c / PAN.hit) * reach : c < PAN.hit + 10 ? reach * (1 - (c - PAN.hit) / 10) : 0;
  return {k, c, x0, heroX, fy, ox, oy, a, dist, reach, e, fire, hx: ox + Math.cos(a) * dist * reach, hy: oy + Math.sin(a) * dist * reach};
}
function chainHead(x, y, a) {
  const c = Math.cos(a), s = Math.sin(a), pt = (f, n) => [x + c * f - s * n, y + s * f + c * n];
  ctx.fillStyle = C.K; ctx.beginPath(); for (const p of [pt(8, 0), pt(-3, 5.5), pt(-1, 0), pt(-3, -5.5)]) ctx.lineTo(p[0], p[1]); ctx.closePath(); ctx.fill();
  ctx.fillStyle = C.R; ctx.beginPath(); for (const p of [pt(6, 0), pt(-1.5, 3.5), pt(0, 0), pt(-1.5, -3.5)]) ctx.lineTo(p[0], p[1]); ctx.closePath(); ctx.fill();
}
function drawThreePanels(tt) {
  const pan = [
    {bg: '#0a3a1c', stripe: C.G1, name: '보우마스터', col: C.G2},
    {bg: '#2a0004', stripe: '#4a0008', name: '불릿 헬 슈터', col: C.Y},
    {bg: '#10205e', stripe: '#16307a', name: '월광 어쌔신', col: C.W},
  ];
  ctx.fillStyle = C.K; ctx.fillRect(0, 0, W, H);
  pan.forEach((pn, i) => {
    const x0 = i * 160, rise = Math.max(0, 1 - (tt - i * 18) / 24), oy = Math.round(easeOut(1 - rise) * 0 + rise * 280);
    if (tt < i * 18) return;
    ctx.save(); ctx.beginPath(); ctx.rect(x0 + 2, 0, 156, H); ctx.clip(); ctx.translate(0, oy);
    ctx.fillStyle = pn.bg; ctx.fillRect(x0, 0, 160, H);
    ctx.fillStyle = pn.stripe; for (let k = -2; k < 8; k++) { ctx.beginPath(); ctx.moveTo(x0 + k * 30, H); ctx.lineTo(x0 + k * 30 + 10, H); ctx.lineTo(x0 + k * 30 + 110, 0); ctx.lineTo(x0 + k * 30 + 100, 0); ctx.fill(); }
    const cx = x0 + 80, fy = PAN.fy, sc = PAN.sc, pc = panelChain(i, tt);
    // the ground they stand on
    ctx.fillStyle = C.K; ctx.fillRect(x0, fy, 160, H - fy); ctx.fillStyle = pn.col; ctx.fillRect(x0, fy, 160, 1);
    const heroX = pc ? pc.heroX : [x0 + 56, x0 + 80, x0 + 54][i], c = pc ? pc.c : -1, hit = PAN.hit;
    // the chain: lunging with its barbed head, then snapping back from the broken end
    if (pc && pc.e > 0) {
      const ex = pc.ox + Math.cos(pc.a) * pc.dist * pc.e, ey = pc.oy + Math.sin(pc.a) * pc.dist * pc.e;
      chainSeg(pc.ox, pc.oy, ex, ey, 0.8);
      if (c < hit) chainHead(ex, ey, pc.a);
    }
    // the assassin's severed chain head tumbling to the ground
    if (pc && i === 2 && c >= hit && c < hit + 22) {
      const f = c - hit, x = pc.hx + f * 0.6, y = Math.min(fy - 4, pc.hy + f * f * 0.12), r = pc.a + f * 0.25;
      chainSeg(x - Math.cos(r) * 16, y - Math.sin(r) * 16, x, y, 0.8); chainHead(x, y, r);
    }
    const aim = pc ? Math.atan2(pc.hy - (fy - 25 * sc), pc.hx - heroX) : -0.5;
    if (i === 0) {
      // bowmaster: draw, loose, the arrow meets the chain head; nock the next
      const loosed = pc && c >= pc.fire && c < pc.fire + 14, aL = worldToLimb(aim, 1);
      const P = drawFigure(heroX, fy, 1, makePose({hy: -16, lean: -0.1, l1: -0.55, r1: 0.5, r2: -0.1, fu: aL, ff: 0, bu: aL - Math.PI, bf: loosed ? 1.5 : 2.67}),
        {sc, color: C.K, outline: C.W, scarf: {color: C.G2, n: 2, wind: 1.2}, quiver: true, t: globalT, bow: {aim, drawn: !loosed, arrow: !loosed, color: C.K}});
      if (pc && c >= pc.fire && c < hit) {
        const s0 = [P.handF[0] + Math.cos(aim) * 18, P.handF[1] + Math.sin(aim) * 18], u = (c - pc.fire + 1) / (hit - pc.fire), ax = lerp(s0[0], pc.hx, u), ay = lerp(s0[1], pc.hy, u);
        ctx.strokeStyle = C.G3; ctx.lineWidth = 2; poly([[lerp(s0[0], pc.hx, Math.max(0, u - 0.5)), lerp(s0[1], pc.hy, Math.max(0, u - 0.5))], [ax, ay]]);
        ctx.strokeStyle = C.W; ctx.lineWidth = 1; poly([[ax - Math.cos(aim) * 10, ay - Math.sin(aim) * 10], [ax, ay]]);
      }
    } else if (i === 1) {
      // gunslinger: both pistols on the chain, a double shot, tracers, the kick
      // recoil tips the muzzles upward for a few frames after the shot
      const face = pc && pc.ox < heroX ? -1 : 1, ga = aim + (pc && c >= pc.fire && c < pc.fire + 5 ? -0.22 * face : 0), aL = worldToLimb(ga, face);
      const P = drawFigure(heroX, fy, face, makePose({hy: -15.8, lean: -0.06, l1: -0.5, r1: 0.45, r2: -0.1, fu: aL, ff: 0, bu: aL - 0.12, bf: 0}),
        gunnerLook({sc, color: C.K, outline: C.W, t: globalT, guns: [{hand: 'F', aim: ga, color: C.K, trim: C.Y}, {hand: 'B', aim: ga + 0.04 * face, color: C.K, trim: C.Y}]}));
      if (pc && c >= pc.fire && c <= hit) {
        for (const h of [P.handF, P.handB]) {
          const mx = h[0] + Math.cos(aim) * 16, my = h[1] + Math.sin(aim) * 16;
          if (c < pc.fire + 3) { ctx.save(); ctx.translate(mx, my); ctx.rotate(aim); ctx.fillStyle = C.K; ctx.beginPath(); ctx.moveTo(14, 0); ctx.lineTo(0, 6); ctx.lineTo(3, 0); ctx.lineTo(0, -6); ctx.fill(); ctx.fillStyle = C.Y; ctx.beginPath(); ctx.moveTo(11, 0); ctx.lineTo(1, 4); ctx.lineTo(3, 0); ctx.lineTo(1, -4); ctx.fill(); ctx.restore(); }
          const u = (c - pc.fire + 1) / (hit - pc.fire + 1);
          ctx.strokeStyle = C.Y; ctx.lineWidth = 1.5; poly([[lerp(mx, pc.hx, Math.max(0, u - 0.4)), lerp(my, pc.hy, Math.max(0, u - 0.4))], [lerp(mx, pc.hx, u), lerp(my, pc.hy, u)]]);
        }
      }
    } else {
      // swordsman: crouched with the blade sheathed, a glint - the draw - held follow-through - back in the scabbard
      const drawnNow = pc && c >= pc.fire && c < PAN.period - 8, sheathU = pc && c >= PAN.period - 8 ? (c - (PAN.period - 8)) / 8 : 0;
      const q = drawnNow ? {hy: -11, lean: 0.62, ht: 0.05, l1: -1.15, l2: 0.35, r1: 1.05, r2: -1.1, fu: lerp(0.9, 1.62, clamp((c - pc.fire) / 2, 0, 1)), ff: -0.05, bu: -1.55, bf: 0.2}
        : sheathU > 0 ? {hy: lerp(-11, -10, sheathU), lean: 0.62, ht: 0.15, l1: lerp(-1.15, 0.1, sheathU), l2: lerp(0.35, -1.7, sheathU), r1: lerp(1.05, 1.25, sheathU), r2: -1.4, fu: lerp(1.62, 0.1, sheathU), ff: lerp(0, 1.5, sheathU), bu: -0.3, bf: 1.0}
        : {hy: -10, lean: 0.62, ht: 0.25, l1: 0.1, l2: -1.7, r1: 1.25, r2: -1.6, fu: 0.1, ff: 1.5, bu: -0.2, bf: 1.3};
      const P = drawFigure(heroX, fy, 1, makePose(q), assassinLook({sc, color: C.K, outline: C.W, t: globalT, katanas: drawnNow ? [{hand: 'F', len: 30}] : []}));
      if (pc && c === pc.fire - 6) { ctx.fillStyle = C.W; for (const [w, h] of [[9, 1], [1, 9]]) ctx.fillRect(Math.round(P.hip[0] + 10 - w / 2), Math.round(P.hip[1] - 2 - h / 2), w, h); }
      if (pc && c >= pc.fire && c < pc.fire + 7) {
        ctx.globalAlpha = c < pc.fire + 3 ? 0.95 : 0.95 * (1 - (c - pc.fire - 3) / 4);
        drawSwoosh(P.sh[0], P.sh[1], 1, 0.7, 1.85, 62, 16, C.W); ctx.globalAlpha = 1;
      }
      if (pc && c >= hit && c < hit + 4) { const k = 1 - (c - hit) / 4; ctx.lineCap = 'butt'; ctx.strokeStyle = C.K; ctx.lineWidth = 5 * k + 1; poly([[heroX + 10, pc.hy], [x0 + 160, pc.hy]]); ctx.strokeStyle = C.B; ctx.lineWidth = 3.5 * k + 0.5; poly([[heroX + 10, pc.hy], [x0 + 160, pc.hy]]); ctx.strokeStyle = C.W; ctx.lineWidth = 1.5 * k + 0.3; poly([[heroX + 10, pc.hy], [x0 + 160, pc.hy]]); ctx.lineCap = 'round'; }
    }
    ctx.restore();
    text(pn.name, cx, fy + 10 + oy, {sc: 2, color: pn.col, outline: C.K, align: 'center'});
  });
  ctx.fillStyle = C.K; ctx.fillRect(158, 0, 4, H); ctx.fillRect(318, 0, 4, H);
}
/* the Chain Sovereign descends from the tear. the three fire on it to no effect; chains leap from its hands,
   force them to their knees and wind into their minds - their eyes turn red and they rise as its servants */
const SOV = {hit: 84, bound: 96, glow: 160, turn: 190};
const SOV_HEROES = [[104, 'bow'], [240, 'gun'], [376, 'sword']];
const sovY = tt => lerp(-30, 118, easeOut(clamp(tt / 80, 0, 1)));
function drawSovereignFall(tt) {
  ctx.fillStyle = C.K; ctx.fillRect(0, 0, W, H);
  const glow = ctx.createRadialGradient(240, 20, 10, 240, 20, 260);
  glow.addColorStop(0, 'rgba(228,20,36,0.9)'); glow.addColorStop(1, 'rgba(228,20,36,0)');
  ctx.fillStyle = glow; ctx.fillRect(0, 0, W, H);
  drawRift(240, 24, 1, globalT);
  ctx.fillStyle = '#5a0008'; ctx.fillRect(0, 226, W, H - 226); ctx.fillStyle = C.R; ctx.fillRect(0, 226, W, 1);
  const sy = sovY(tt), bound = tt >= SOV.bound, turned = tt >= SOV.turn, hx = 240, hy = sy - 30;
  // the chains from its hands to each of the three
  if (tt >= SOV.hit && !turned) for (const [x] of SOV_HEROES) { const g = clamp((tt - SOV.hit) / 12, 0, 1), ty = bound ? 196 : 190; chainSeg(hx + (x - hx) * 0.08, hy, lerp(hx, x, g), lerp(hy, ty, g), 0.8); }
  for (const [x, k] of SOV_HEROES) {
    const face = turned || x <= 240 ? 1 : -1, aim = Math.atan2(sy - 30 - 190, 240 - x);
    const kneel = bound && !turned, rising = turned && tt < SOV.turn + 24;
    let q;
    if (kneel) q = {hy: -9, lean: 0.55, ht: 0.55, l1: 0.2, l2: -1.8, r1: 1.3, r2: -1.3, fu: 0.25, ff: 0.1, bu: -0.25, bf: 0.1};
    else if (turned) q = {hy: rising ? -12 : -16, lean: rising ? 0.3 : 0.08, ht: 0.25, l1: -0.35, r1: 0.35, fu: 0.35, ff: 0.2, bu: -0.35, bf: 0.2};
    else if (k === 'sword') q = {hy: -15, lean: 0.2, l1: -0.6, r1: 0.6, fu: 2.4, ff: 0.3, bu: 2.1, bf: 0.4};
    else q = {hy: -16, lean: -0.15, l1: -0.5, r1: 0.45, fu: worldToLimb(aim, face), ff: 0, bu: k === 'bow' ? worldToLimb(aim, face) - Math.PI : worldToLimb(aim - 0.35, face), bf: k === 'bow' ? 2.67 : 0};
    const o = {sc: 1.6, color: C.K, outline: C.W, t: globalT, eyes: turned ? C.R : null};
    const wA = kneel || turned ? Math.PI / 2 - 0.3 : aim;
    if (k === 'bow') drawFigure(x, 226, face, makePose(q), Object.assign(o, {scarf: {color: C.G2, n: 2}, quiver: true, bow: {aim: kneel || turned ? null : wA, drawn: !kneel && !turned, arrow: !kneel && !turned, color: C.K}}));
    else if (k === 'gun') drawFigure(x, 226, face, makePose(q), gunnerLook(Object.assign(o, {guns: [{hand: 'F', aim: kneel || turned ? null : wA, color: C.K, trim: C.Y}, {hand: 'B', aim: kneel || turned ? null : wA - 0.35, color: C.K, trim: C.Y}]})));
    else drawFigure(x, 226, face, makePose(q), assassinLook(Object.assign(o, {katanas: [{hand: 'F', len: 30}]})));
    // the chains winding into their minds
    if (tt >= SOV.glow && !turned && ((tt >> 2) & 1)) { ctx.strokeStyle = C.R; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(x, 226 - 34, 9 + (tt % 8), 0, TAU); ctx.stroke(); }
  }
  const armsUp = tt >= SOV.hit - 10 && !turned;
  drawFigure(240, sy, 1, makePose({hy: -16.8, lean: -0.05, ht: -0.1, l1: -0.14, r1: 0.18, fu: armsUp ? 1.9 : 0.55, ff: 0.2, bu: armsUp ? -1.9 : 1.25, bf: 0.4}), sovLook({sc: 2.6, outline: C.W, t: globalT}));
  // shots from the three sparking harmlessly on the Sovereign
  if (tt > 40 && tt < SOV.hit && tt % 7 < 2) { const a = tt * 1.7; ctx.fillStyle = C.W; disc(240 + Math.cos(a) * 14, sy - 30 + Math.sin(a) * 18, 4); ctx.fillStyle = C.Y; disc(240 + Math.cos(a) * 14, sy - 30 + Math.sin(a) * 18, 2); }
  if (turned && tt < SOV.turn + 20) { ctx.globalAlpha = (SOV.turn + 20 - tt) / 20 * 0.6; ctx.fillStyle = C.R; ctx.fillRect(0, 0, W, H); ctx.globalAlpha = 1; }
}
/* the birth, in the chain graveyard under a chained sky: a thread of violet falls out of the sky and strikes the
   ground; links coil up out of the crater and tighten, a heart starts to beat inside them, and a man's shape and a
   greatsword knot together out of them; the chains burst off; his eyes open; he stands, looks at his own hand,
   looks around, looks up at the chains across the sky - and takes up the sword */
const BIRTH = {
  kneel: {hy: -9, lean: 0.55, ht: 0.55, l1: 0.2, l2: -1.8, r1: 1.3, r2: -1.3, fu: 0.25, ff: 0.1, bu: -0.25, bf: 0.1},
  stand: {hy: -16, lean: 0.05, ht: 0.1, l1: -0.25, l2: -0.1, r1: 0.25, r2: -0.1, fu: 0.4, ff: 0.3, bu: -0.3, bf: 0.3},
  hand: {hy: -16, lean: 0.1, ht: 0.45, l1: -0.25, l2: -0.1, r1: 0.25, r2: -0.1, fu: 1.2, ff: 1.9, bu: -0.3, bf: 0.3},
  up: {hy: -16, lean: -0.05, ht: -0.45, l1: -0.25, l2: -0.1, r1: 0.25, r2: -0.1, fu: 0.4, ff: 0.3, bu: -0.3, bf: 0.3},
  reach: {hy: -13.5, lean: 0.45, ht: 0.15, l1: -0.4, l2: -0.2, r1: 0.5, r2: -0.3, fu: 1.1, ff: 0.2, bu: 0.9, bf: 0.2},
  grab: {hy: -16, lean: -0.08, ht: -0.2, l1: -0.4, r1: 0.4, fu: 2.55, ff: 0.35, bu: 2.3, bf: 0.4, sa: Math.PI - 0.35},
};
function birthPose(t) {
  const k = (a, b) => clamp((t - a) / (b - a), 0, 1), L = (a, b, u) => lerpPose(BIRTH[a], BIRTH[b], u * u * (3 - 2 * u));
  if (t < OPEN.stand) return BIRTH.kneel;
  if (t < OPEN.stand + 40) return L('kneel', 'stand', k(OPEN.stand, OPEN.stand + 40));
  if (t < OPEN.look) return L('stand', 'hand', k(OPEN.stand + 44, OPEN.stand + 56));
  if (t < OPEN.up) return L('hand', 'stand', k(OPEN.look, OPEN.look + 10));
  if (t < OPEN.grab) return L('stand', 'up', k(OPEN.up, OPEN.up + 14));
  if (t < OPEN.grab + 20) return L('up', 'reach', k(OPEN.grab, OPEN.grab + 12));
  return L('reach', 'grab', k(OPEN.grab + 20, OPEN.grab + 28));
}
function drawBirthScene(t) {
  // slow push-in on the crater (lifted above the letterbox bar)
  const z = 1 + 0.1 * clamp((t - OPEN.birth) / (OPEN.grab - OPEN.birth), 0, 1), cx = 250, sx = 272;
  ctx.translate(0, GRAVE_DY); ctx.translate(250, FLOOR - 30); ctx.scale(z, z); ctx.translate(-250, -(FLOOR - 30));
  ctx.drawImage(openGrave, 0, 0);
  // the chains across the sky: the belt round the world, seen from below
  for (const [y0, y1, sag] of [[34, 70, 120], [96, 18, 70]]) { const pts = []; for (let k = 0; k <= 24; k++) { const u = k / 24; pts.push([-10 + u * 500, lerp(y0, y1, u) + Math.sin(u * Math.PI) * (sag - (y0 + y1) / 2) * 0.6]); } linkPath(pts, '#4a145e', 1.1); }
  // the falling thread of power
  if (t < OPEN.impact) {
    const u = clamp((t - OPEN.birth) / (OPEN.impact - OPEN.birth), 0, 1), hx = lerp(320, cx, u), hy = lerp(-20, FLOOR, u * u);
    ctx.strokeStyle = C.P; ctx.lineWidth = 3; poly([[lerp(340, cx, Math.max(0, u - 0.4)), lerp(-20, FLOOR, Math.max(0, u - 0.4) ** 2)], [hx, hy]]);
    ctx.strokeStyle = C.W; ctx.lineWidth = 1; poly([[lerp(340, cx, Math.max(0, u - 0.2)), lerp(-20, FLOOR, Math.max(0, u - 0.2) ** 2)], [hx, hy]]);
    ctx.fillStyle = C.W; disc(hx, hy, 3);
    return;
  }
  const beat = OPEN_BEATS.some(h => t >= OPEN.birth + h && t < OPEN.birth + h + 6);
  // the crater, glowing violet until he wakes
  if (t < OPEN.wake + 30) { ctx.globalAlpha = t < OPEN.wake ? 1 : 1 - (t - OPEN.wake) / 30; ctx.strokeStyle = beat ? C.W : C.P; ctx.lineWidth = 2; ctx.beginPath(); ctx.ellipse(cx, FLOOR, 30, 5, 0, 0, TAU); ctx.stroke(); ctx.globalAlpha = 1; }
  const formU = clamp((t - OPEN.form) / (OPEN.wake - OPEN.form), 0, 1);
  // the man and the sword knotting together out of the chains
  if (t < OPEN.wake) {
    if (formU > 0) {
      ctx.globalAlpha = formU * 0.9;
      drawFigure(cx, FLOOR, 1, makePose(BIRTH.kneel), {sc: 1.6, color: beat ? C.W : C.P, band: true, t: globalT});
      drawGreatsword(sx, FLOOR - 54, 0.16, 0.99, 50, 1, 1.2, C.P, C.W);
      ctx.globalAlpha = 1;
    }
    // two helices of links coiling up out of the crater, tightening as the shape forms
    const h = 70 * clamp((t - OPEN.impact - 6) / 60, 0, 1), r = lerp(20, 13, formU);
    for (const ph of [0, Math.PI]) {
      const pts = []; for (let y = 0; y <= h; y += 2.5) { const a = t * 0.12 + y * 0.2 + ph; pts.push([cx + Math.cos(a) * r * (1 - y / 140), FLOOR - y]); }
      if (pts.length > 1) linkPath(pts, beat ? C.W : C.P, 0.9);
    }
    return;
  }
  // awake: the planted sword until he takes it up
  if (t < OPEN.grab + 20) drawGreatsword(sx, FLOOR - 54, 0.16, 0.99, 50, 1, 1.2, C.W, C.K);
  // he looks one way, then the other, before he looks up
  const face = t >= OPEN.look + 14 && t < OPEN.look + 44 ? -1 : 1, q = makePose(birthPose(t)), up = t >= OPEN.grab + 20;
  const P = drawFigure(cx, FLOOR, face, q, Object.assign({sc: 1.6, color: C.K, outline: C.W, band: true, t: globalT}, up ? {sword: {len: SWORD_LEN, color: C.K, edge: C.R}} : {}));
  // his eyes open
  if (t >= OPEN.open && t < OPEN.open + 14) { const k = 1 - (t - OPEN.open) / 14; ctx.fillStyle = C.W; const ex = P.head[0] + face * 3, ey = P.head[1] - 1; ctx.fillRect(Math.round(ex - 5 * k), Math.round(ey), Math.round(10 * k) + 1, 1); ctx.fillRect(Math.round(ex), Math.round(ey - 4 * k), 1, Math.round(8 * k) + 1); }
}
