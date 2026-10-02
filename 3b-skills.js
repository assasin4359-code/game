/* ---------- class skills: three for each promotion ----------
   Blade Master (the sword mastered - fast and dazzling): 섬광일섬, 백화난무, 비연삼단
   Blade Lord (the swords commanded): 천검군림, 검옥, 천붕검 (id 'march')
   Blade God (the hero become the sword): 무형검, 검역, 천지검명
   cooldowns live in p.cd; lasting effects (delayed cuts, buffs, prisons, the marching wall, the field, the resonance)
   in their own objects on the player, updated every frame by updClassSkills and drawn by 6g-render-skills */
const NEW_CD = {flash: 300, bloom: 420, swallow: 480, reign: 780, prison: 600, march: 780, formless: 780, domain: 720, resonance: 720};
const FLASH = {stance: 8, dash: 3, hold: 16, cuts: [0.35, -0.7, 1.25, -1.45], cstep: 4, dmg: 40000, cdmg: 18000, fin: 30000};
const BLOOM = {dur: 60, max: 96, every: 6, r: 130, dmg: 9000, fin: 50000, finR: 170};
const SWALLOW = {pass: 6, gap: 3, dmg: 22000, line: 18000, fin: 60000};
const REIGN = {dur: 360, n: 18, dmg: 22000, speed: 13};
const PRISON = {form: 16, hold: 22, n: 8, dmg: 18000, fin: 50000};
// 천붕검 (id 'march'): six greatswords and a last, greater one down from a rift in the sky
const MARCH = {first: 12, every: 7, fall: 10, n: 6, dmg: 22000, fin: 60000, stay: 26, from: 128};
const FORMLESS = {dur: 300, mult: 1.2};
const DOMAIN = {dur: 240, r: 88, every: 8, dmg: 9000};
const RESO = {drop: 14, ring: 26, burst0: 34, step: 2, r: 44, dmg: 22000, max: 24, own: 8};
const liveTarget = p => { const tg = nearestTarget(p.x, p.y); return tg && targets().includes(tg) ? tg : null; };
// what the class skills' traits change (see TRAITS)
const hasTrait = (id, k) => traitOf(id) === k;
const flashCuts = () => hasTrait('flash', 'B') ? [0.35, -0.7, 1.25, -1.45, 0.02, 1.6] : FLASH.cuts;
const flashEnd = () => FLASH.stance + FLASH.dash + FLASH.hold + flashCuts().length * FLASH.cstep;
function classSkill(p, id) {
  if ((p.cd[id] || 0) > 0) return false;
  const ok = {flash: startFlash, bloom: startBloom, swallow: startSwallow, reign: startReign, prison: startPrison, march: startMarch,
    formless: startFormless, domain: startDomain, resonance: startResonance}[id](p);
  if (ok) p.cd[id] = NEW_CD[id];
  return ok;
}
function startCast(p, dur, pose) { p.state = 'cast'; p.st = 0; p.castDur = dur; p.castPose = pose; p.vx = 0; p.flipT = 0; }
// a huge crescent of a cut flashing open at (x, y)
const bigCut = (x, y, ang, r, c1, c2) => addP({kind: 'bigcut', x, y, ang, r, c1, c2, life: 12});

/* 섬광일섬: a drawing stance and a glint; through the enemy faster than the eye to its far side; stillness - then four
   great cuts burst open across it in a star, and a shock runs the whole length of the path */
function startFlash(p) {
  const tg = liveTarget(p); if (tg) p.face = tg.x >= p.x ? 1 : -1;
  let x1 = tg ? clamp(tg.x + p.face * 76, 14, W - 14) : clamp(p.x + p.face * 200, 14, W - 14);
  if (Math.abs(x1 - p.x) < 60) x1 = clamp(p.x + p.face * 180, 14, W - 14);
  p.state = 'flash'; p.st = 0; p.inv = Math.max(p.inv, 40); p.vx = 0; p.vy = 0; p.flipT = 0; p.flSet = new Set();
  p.flashFx = {x0: p.x, x1, y: p.y, face: p.face, t: 0, tg, cx: tg ? tg.x : (p.x + x1) / 2, cy: tg ? tg.y - 22 : p.y - 22};
  SND.sfx.sheath(); floatText('섬광일섬', p.x, p.y - 58, C.R, 2, 40, C.W);
  return true;
}
function updFlash(p) {
  const F = p.flashFx; p.st++; p.vy = 0; p.vx = 0;
  if (!F) { p.state = 'normal'; return; }
  if (p.st === 4) { glint(p.x + p.face * 6, p.y - 16, 10); SND.sfx.beep(); }
  const d0 = FLASH.stance, d1 = d0 + FLASH.dash;
  if (p.st === d0 + 1) { SND.sfx.iai(); inkFlash = 3; shake(5); }
  if (p.st > d0 && p.st <= d1) {
    const x = lerp(F.x0, F.x1, (p.st - d0) / FLASH.dash); p.x = x; addAfter(p, C.R);
    hitIn([Math.min(F.x0, x) - 8, F.y - 44, Math.max(F.x0, x) + 8, F.y + 4], 'fl', FLASH.dmg, {stop: 2, sp: 3, crit: 0.4}, 0, p.flSet);
    for (let k = 0; k < 5; k++) addP({kind: 'line', x: x - p.face * rnd(0, 60), y: F.y - rnd(2, 44), vx: -p.face * rnd(10, 18), vy: 0, life: 7, color: k % 2 ? C.W : C.R, size: 1, len: 3});
  }
  // 특성 왕복: once the star has burst, back through it the same way
  const r0 = flashEnd() + 2, back = hasTrait('flash', 'A');
  if (back && p.st > r0 && p.st <= r0 + FLASH.dash) {
    if (p.st === r0 + 1) { p.face = -F.face; p.flSet2 = new Set(); p.inv = Math.max(p.inv, 14); SND.sfx.iai(); inkFlash = 2; shake(4); }
    const x = lerp(F.x1, F.x0, (p.st - r0) / FLASH.dash); p.x = x; addAfter(p, C.R);
    hitIn([Math.min(F.x1, x) - 8, F.y - 44, Math.max(F.x1, x) + 8, F.y + 4], 'flb', FLASH.dmg * 0.6, {stop: 2, sp: 2, crit: 0.4}, 0, p.flSet2);
    for (let k = 0; k < 5; k++) addP({kind: 'line', x: x + F.face * rnd(0, 60), y: F.y - rnd(2, 44), vx: F.face * rnd(10, 18), vy: 0, life: 7, color: k % 2 ? C.W : C.R, size: 1, len: 3});
  }
  if (p.st >= flashEnd() + 8 + (back ? 22 : 0)) p.state = 'normal';
}

/* 백화난무: a whirling storm of great sweeping cuts that reach far all round, a blizzard of petals thrown off them;
   held, it goes on; it ends with one full circle of a cut that sweeps the whole field */
function startBloom(p) {
  // 특성 질주 난무: 20% longer (and the hero can run while it whirls)
  p.state = 'bloom'; p.st = 0; p.flipT = 0; p.bloom = {arcs: [], end: Math.round(BLOOM.dur * (hasTrait('bloom', 'A') ? 1.2 : 1)), fin: -1, slot: save.loadout.indexOf('bloom')};
  SND.sfx.whoosh(); SND.sfx.cyclone(); floatText('백화난무', p.x, p.y - 58, C.R, 2, 40, C.W);
  return true;
}
function updBloom(p) {
  const B = p.bloom; p.st++; if (!p.onGround) p.vy = Math.min(p.vy, 0.6);
  if (hasTrait('bloom', 'A') && p.st < B.end) { const dir = (keys.right ? 1 : 0) - (keys.left ? 1 : 0); p.vx = lerp(p.vx, dir * 2.1, 0.25); } else p.vx *= 0.8;
  if (B.slot >= 0 && keys['slot' + B.slot] && p.st > B.end - 6 && B.end < BLOOM.max) B.end += 2;
  const cx = p.x, cy = p.y - 20;
  // one slash: a long, thin crescent sweeping round a wide flattened orbit about the hero, tilted, pointed at both ends
  const arc = (big) => B.arcs.push({cx: cx + rnd(-10, 10), cy: cy + rnd(-8, 6), rx: big ? rnd(170, 220) : rnd(90, 140), ry: big ? rnd(30, 52) : rnd(20, 40),
    rot: rnd(-0.5, 0.5), a0: rnd(TAU), span: rnd(2.2, 3.0) * (Math.random() < 0.5 ? 1 : -1), w: big ? rnd(9, 12) : rnd(5.5, 8), t: 0, life: big ? 22 : 15});
  const shards = (n, spread) => { for (let k = 0; k < n; k++) { const b = rnd(TAU), d = rnd(20, spread), s = rnd(1.5, 4.5); addP({kind: 'shard', x: cx + Math.cos(b) * d, y: cy + Math.sin(b) * d * 0.4, vx: Math.cos(b) * s, vy: Math.sin(b) * s * 0.5, drag: 0.92, life: ri(18, 34), size: rnd(1.6, 3.6), ang: rnd(TAU), spin: rnd(-0.3, 0.3)}); } };
  if (p.st < B.end && p.st % BLOOM.every === 0) {
    arc(false); arc(false); arc(false); if (Math.random() < 0.5) arc(false);
    for (const tg of targets()) if (Math.hypot(tg.x - cx, tg.y - 22 - cy) < BLOOM.r) { dealDamage(BLOOM.dmg, tg.x + rnd(-8, 8), tg.y - 22 + rnd(-12, 12), {quiet: true, stop: 0, sp: 1, crit: 0.25}, tg); cutFx(tg.x, tg.y - 22, rnd(-0.5, 0.5)); }
    shards(6, 130);
    parryIn([cx - BLOOM.r, cy - BLOOM.r * 0.7, cx + BLOOM.r, cy + BLOOM.r * 0.7]);
    SND.sfx.slash(); if (p.st % 12 === 0) SND.sfx.whoosh();
  }
  // the finish: six great slashes cross at once over the whole field, and it all bursts into shards
  // (특성 만개: and once more, wider, a moment later)
  const second = hasTrait('bloom', 'B');
  if (p.st === B.end || (second && p.st === B.end + 18)) {
    const again = p.st > B.end, r = BLOOM.finR + (again ? 40 : 0);
    B.fin = p.st; SND.sfx.whoosh(); SND.sfx.slash(); SND.sfx.boom(); shake(again ? 12 : 10); zoomPunch = 0.8; flash = {a: 0.12, color: C.R};
    for (let k = 0; k < (again ? 9 : 7); k++) arc(true);
    for (const tg of targets()) if (Math.hypot(tg.x - cx, tg.y - 22 - cy) < r + 20) dealDamage(BLOOM.fin * (again ? 0.8 : 1), tg.x, tg.y - 26, {stop: 6, sp: 4, crit: 0.4, big: true}, tg);
    shards(again ? 60 : 46, again ? 240 : 200);
    parryIn([cx - r, cy - r, cx + r, cy + r]);
  }
  if (p.st >= B.end + (second ? 34 : 16)) p.state = 'normal';
}

/* 비연삼단: an X cut through the enemy and a third pass straight through it; each pass leaves its line hanging in the
   air; then down from high above - and on the landing every line bursts at once */
function startSwallow(p) {
  const tg = liveTarget(p); if (!tg) return false;
  const f = tg.x >= p.x ? 1 : -1, c = [tg.x, tg.y - 20], cl = q => [clamp(q[0], 10, W - 10), clamp(q[1], 34, FLOOR)];
  const legs = [[cl([c[0] - f * 62, c[1] + 22]), cl([c[0] + f * 62, c[1] - 46])], [cl([c[0] - f * 62, c[1] - 46]), cl([c[0] + f * 62, c[1] + 22])], [cl([c[0] + f * 72, c[1]]), cl([c[0] - f * 72, c[1]])]];
  // 특성 오연: a second X back the other way - five passes
  if (hasTrait('swallow', 'A')) legs.push([cl([c[0] - f * 56, c[1] - 52]), cl([c[0] + f * 56, c[1] + 16])], [cl([c[0] - f * 56, c[1] + 16]), cl([c[0] + f * 56, c[1] - 52])]);
  p.state = 'swallow'; p.st = 0; p.vx = 0; p.vy = 0; p.flipT = 0; p.inv = Math.max(p.inv, 80); p.swSet = new Set();
  p.sw = {tg, legs, topY: Math.max(40, tg.y - 104), x: tg.x, lines: [], burst: -1};
  addAfter(p, C.R); SND.sfx.jump(); floatText('비연삼단', p.x, p.y - 58, C.R, 2, 40, C.W);
  return true;
}
function updSwallow(p) {
  const S = p.sw; p.st++; p.vx = 0; p.vy = 0;
  const per = SWALLOW.pass + SWALLOW.gap, k = Math.floor((p.st - 1) / per), rel = (p.st - 1) % per, nl = S.legs.length;
  if (k < nl) {
    const [a, b] = S.legs[k];
    if (rel < SWALLOW.pass) {
      const u = (rel + 1) / SWALLOW.pass; p.x = lerp(a[0], b[0], u); p.y = lerp(a[1], b[1], u) + 20; p.face = b[0] >= a[0] ? 1 : -1;
      addAfter(p, C.R); addAfter(p, C.W);
      hitIn([Math.min(a[0], b[0]) - 6, Math.min(a[1], b[1]) - 10, Math.max(a[0], b[0]) + 6, Math.max(a[1], b[1]) + 10], 'sw' + k, SWALLOW.dmg, {stop: 2, sp: 2, crit: 0.3}, Math.atan2(b[1] - a[1], b[0] - a[0]), p.swSet);
      if (rel === 0) { SND.sfx.slash(); SND.sfx.whoosh(); shake(3); zoomPunch = Math.max(zoomPunch, 0.4); }
      if (rel === SWALLOW.pass - 1) S.lines.push({a, b, t0: p.st});
    } else if (k < nl - 1) { const n = S.legs[k + 1][0]; p.x = n[0]; p.y = n[1] + 20; }
  }
  const top = nl * per + 1, fall = top + 6, hit = fall + 5;
  if (p.st === top) { p.x = clamp(S.x, 10, W - 10); p.y = S.topY; SND.sfx.whoosh(); glint(p.x + p.face * 4, p.y - 44, 10); }
  if (p.st > fall && p.st <= hit) { p.y = lerp(S.topY, FLOOR, (p.st - fall) / (hit - fall)); addAfter(p, C.R); }
  if (p.st === hit) {
    // the landing: the dive splits its column, and every line left in the air bursts together
    p.y = FLOOR; S.burst = p.st; S.lines.push({a: [p.x, S.topY - 10], b: [p.x, FLOOR], t0: p.st});
    shake(12); zoomPunch = 1; flash = {a: 0.45, color: C.W}; SND.sfx.impact(); SND.sfx.boom(); SND.sfx.brk(); dust(p.x, FLOOR, 18);
    hitIn([p.x - 34, S.topY - 20, p.x + 34, FLOOR + 4], 'swfin', SWALLOW.fin * (hasTrait('swallow', 'B') ? 1.3 : 1), {stop: 8, sp: 4, crit: 0.5, big: true}, Math.PI / 2, p.swSet);
    // 특성 낙뢰: the landing throws up a sword mountain to both sides
    if (hasTrait('swallow', 'B')) { const o = p.adren > 0 ? {h: 54, dh: 4, step: 2, extra: {red: true, sc: 1.8, w: 12, dmg: 30000}} : {h: 42, dh: 4, step: 2, extra: {dmg: 22000}}; peakLine(p.x + 26, 1, 6, 22, o); peakLine(p.x - 26, -1, 6, 22, o); }
    for (const L of S.lines) {
      for (let i = 0; i < 8; i++) { const u = rnd(); shardBurst(lerp(L.a[0], L.b[0], u), lerp(L.a[1], L.b[1], u), 2, 4); }
      if (targets().includes(S.tg)) dealDamage(SWALLOW.line, S.tg.x + rnd(-8, 8), S.tg.y - 24 + rnd(-10, 10), {quiet: true, stop: 1, sp: 1, crit: 0.3}, S.tg);
    }
    addP({kind: 'ring', x: p.x, y: FLOOR, r0: 4, rMax: 64, life: 16, color: C.R, size: 3});
    for (const d of [1, -1]) waves.push({x: p.x + d * 18, y: FLOOR, dir: d, t: 0, hitSet: new Set()});
  }
  if (p.st >= hit + 16) { p.state = 'normal'; p.inv = Math.max(p.inv, 16); }
}

/* 천검군림: wings of eighteen blades open at the hero's back; for six seconds every swing sends one flying - it cuts
   through the enemy and vanishes */
function startReign(p) {
  if (p.reign) return false;
  // 특성 쌍익: 24 blades, two to a swing
  p.reign = {t: 0, left: hasTrait('reign', 'A') ? 24 : REIGN.n, cool: 0, shots: []};
  SND.sfx.blade(); SND.sfx.special(); floatText('천검군림', p.x, p.y - 62, C.R, 2, 40, C.W);
  addP({kind: 'ring', x: p.x - p.face * 6, y: p.y - 30, r0: 6, rMax: 44, life: 16, color: C.R, size: 2});
  return true;
}
function reignWing(p, i) {
  const row = i % 2, j = Math.floor(i / 2), a = -Math.PI / 2 - p.face * (0.25 + j * 0.17), r = row ? 34 : 22;
  return {x: p.x - p.face * 4 + Math.cos(a) * r, y: p.y - 30 + Math.sin(a) * r * 0.9, a};
}
function reignLaunch(p) {
  const R = p.reign; if (!R || R.cool > 0 || R.left <= 0) return;
  R.cool = 4;
  for (let n = hasTrait('reign', 'A') ? 2 : 1; n > 0 && R.left > 0; n--) {
    R.left--;
    const w = reignWing(p, R.left), tg = liveTarget(p), tx = tg ? tg.x : p.x + p.face * 200, ty = (tg ? tg.y - 22 : p.y - 22) + (n === 2 ? -10 : 0), ang = Math.atan2(ty - w.y, tx - w.x);
    R.shots.push({x: w.x, y: w.y, ang, vx: Math.cos(ang) * REIGN.speed, vy: Math.sin(ang) * REIGN.speed, t: 0, hit: new Set(), fade: 0, trail: []});
  }
  SND.sfx.bladeFire();
}
function updReignShots(R) {
  for (const s of R.shots) {
    s.t++;
    if (s.fade) { s.fade++; s.x += s.vx * 0.5; s.y += s.vy * 0.5; continue; }
    s.trail.push([s.x, s.y]); if (s.trail.length > 6) s.trail.shift();
    s.x += s.vx; s.y += s.vy;
    for (const tg of targets()) if (!s.hit.has(tg) && overlap([s.x - 6, s.y - 6, s.x + 6, s.y + 6], tBox(tg))) {
      // it cuts clean through...
      s.hit.add(tg); dealDamage(REIGN.dmg * (s.back ? 0.5 : 1), tg.x, tg.y - 22, {quiet: true, stop: 2, sp: 2, crit: 0.25}, tg);
      bigCut(tg.x, tg.y - 22, s.ang + Math.PI / 2, 22, C.R, C.W); SND.sfx.slash();
    }
    // ...and a little way past it, it is gone (특성 귀환검: unless it turns back once to cut again)
    if (s.hit.size && s.t > 14 && hasTrait('reign', 'B') && !s.back) { s.back = true; s.t = 0; s.vx = -s.vx; s.vy = -s.vy; s.ang += Math.PI; s.hit = new Set(); s.trail = []; SND.sfx.whoosh(); continue; }
    if (s.hit.size ? s.t > 14 : s.t > 22) s.fade = 1;
    if (s.x < -30 || s.x > W + 30 || s.y < -30 || s.y > FLOOR + 10) s.fade = 1;
    if (s.fade === 1) for (let k = 0; k < 4; k++) addP({x: s.x, y: s.y, vx: rnd(-1.5, 1.5), vy: rnd(-1.5, 1.5), life: 10, color: k % 2 ? C.W : C.R, size: 1});
  }
  R.shots = R.shots.filter(s => s.fade < 8);
}

/* 검옥: blades close a ring round the enemy, hold it, and all drive in at once */
function startPrison(p) {
  const tg = liveTarget(p); if (!tg) return false;
  p.face = tg.x >= p.x ? 1 : -1;
  startCast(p, 16, 'point');
  // 특성 영겁의 감옥: held three times as long, stabbed all the while
  p.prison = {tg, t: 0, cx: tg.x, cy: tg.y - 22, r: 48, hold: hasTrait('prison', 'A') ? PRISON.hold * 3 : PRISON.hold};
  SND.sfx.blade(); floatText('검옥', p.x, p.y - 58, C.R, 2, 40, C.W);
  return true;
}
function updPrison(p) {
  const P = p.prison; if (!P) return;
  P.t++;
  const t = P.t, tg = P.tg, alive = targets().includes(tg), hold = P.hold || PRISON.hold;
  if (alive && t <= PRISON.form + hold) { P.cx = lerp(P.cx, tg.x, 0.3); P.cy = lerp(P.cy, tg.y - 22, 0.3); }
  if (t <= PRISON.form && t % 2 === 0) SND.sfx.bladeFire();
  if (t === PRISON.form) {
    // bound: the enemy is held a moment inside the ring
    SND.sfx.chain(); shake(3);
    if (alive && tg === boss) stunBoss(hold > PRISON.hold ? 100 : 50, true);
    floatText('속박', P.cx, P.cy - 40, C.R, 1, 36, C.W);
  }
  if (t > PRISON.form && t < PRISON.form + hold) {
    P.r = lerp(48, 40, (t - PRISON.form) / hold);
    // 영겁의 감옥: one of the ring's blades darts in every 9 frames
    if (hold > PRISON.hold && (t - PRISON.form) % 9 === 0 && alive) { const a = rnd(TAU); dealDamage(5000, P.cx + Math.cos(a) * 8, P.cy + Math.sin(a) * 8, {quiet: true, stop: 0, sp: 1, crit: 0.2}, tg); cutFx(P.cx, P.cy, a + Math.PI / 2); SND.sfx.bladeFire(); }
  }
  const drive = PRISON.form + hold;
  if (t >= drive && t < drive + 4) P.r = lerp(40, 6, (t - drive + 1) / 4);
  if (t === drive + 3 && alive) {
    for (let i = 0; i < PRISON.n; i++) dealDamage(PRISON.dmg, P.cx + rnd(-6, 6), P.cy + rnd(-10, 10), {quiet: i > 0, stop: 1, sp: 1, crit: 0.25}, tg);
    SND.sfx.slash(); SND.sfx.impact();
  }
  if (t === drive + 7) {
    flash = {a: 0.3, color: C.R}; shake(7); SND.sfx.brk();
    // 특성 폭검옥: the ring bursts outward - a heavier blow on everything round it
    if (hasTrait('prison', 'B')) {
      shake(11); zoomPunch = 1; SND.sfx.boom(); SND.sfx.explode();
      for (const t2 of targets()) if (Math.hypot(t2.x - P.cx, t2.y - 22 - P.cy) < 80) dealDamage(PRISON.fin * 1.6, t2.x, t2.y - 24, {stop: 7, sp: 3, crit: 0.4, big: true}, t2);
      for (let i = 0; i < PRISON.n; i++) { const a = i / PRISON.n * TAU; addP({kind: 'line', x: P.cx, y: P.cy, vx: Math.cos(a) * 9, vy: Math.sin(a) * 9, drag: 0.88, life: 14, color: C.R, size: 2, len: 3}); }
      addP({kind: 'ring', x: P.cx, y: P.cy, r0: 6, rMax: 90, life: 16, color: C.R, size: 3}); shardBurst(P.cx, P.cy, 24, 6);
    } else if (targets().includes(tg)) dealDamage(PRISON.fin, P.cx, P.cy, {stop: 6, sp: 3, crit: 0.4, big: true}, tg);
    addP({kind: 'ring', x: P.cx, y: P.cy, r0: 4, rMax: 50, life: 14, color: C.R, size: 3}); shardBurst(P.cx, P.cy, 12, 4.5);
  }
  if (t >= drive + 20) p.prison = null;
}

/* 천붕검: the sword raised to the sky tears a rift in it; greatswords plunge out of it slantwise one after another,
   each marked on the ground a moment before, each landing with a crash on and around the enemy - and the last,
   twice their size, comes down on the enemy itself. they stand where they struck, then shatter */
function startMarch(p) {
  const tg = liveTarget(p); if (tg) p.face = tg.x >= p.x ? 1 : -1;
  startCast(p, 22, 'raise');
  const f = p.face, cx = clamp(tg ? tg.x : p.x + f * 130, 30, W - 30), offs = [-46, 38, -18, 62, 14, -70];
  let swords;
  if (hasTrait('march', 'B')) {
    // 특성 천붕: every sword become one - a single colossal greatsword down on the enemy
    swords = [{tx: cx, t0: MARCH.first + 22, big: true, huge: true}];
  } else if (hasTrait('march', 'A')) {
    // 특성 유성우: twelve lesser swords in quick succession, then the great one
    swords = Array.from({length: 12}, (_, i) => ({tx: clamp(cx + rnd(-60, 60), 12, W - 12), t0: MARCH.first + i * 4, big: false, small: true}));
    swords.push({tx: cx, t0: MARCH.first + 12 * 4 + 8, big: true});
  } else {
    swords = offs.map((o, i) => ({tx: clamp(cx + o, 12, W - 12), t0: MARCH.first + i * MARCH.every, big: false}));
    swords.push({tx: cx, t0: MARCH.first + MARCH.n * MARCH.every + 8, big: true});
  }
  for (const s of swords) { s.sx = s.tx - f * MARCH.from * (s.huge ? 1.5 : s.big ? 1.2 : 1); s.sy = s.huge ? -30 : s.big ? 8 : 26; s.hit = false; }
  p.march = {t: 0, face: f, tg, swords};
  SND.sfx.special(); SND.sfx.rumble(); floatText('천붕검', p.x, p.y - 58, C.R, 2, 40, C.W);
  return true;
}
// where a falling sword is: its tip, and its unit direction (tip first, slantwise)
function marchSword(s, t) {
  const L = Math.hypot(s.tx - s.sx, FLOOR + 6 - s.sy), dx = (s.tx - s.sx) / L, dy = (FLOOR + 6 - s.sy) / L;
  const u = clamp((t - s.t0) / MARCH.fall, 0, 1), e = u * u;
  return {x: lerp(s.sx, s.tx + dx * 6, e), y: lerp(s.sy, FLOOR + 6, e), dx, dy, u};
}
function updMarch(p) {
  const M = p.march; if (!M) return;
  M.t++;
  let live = false;
  for (const s of M.swords) {
    const t = M.t;
    if (t === s.t0 - 8) SND.sfx.warn();
    if (t === s.t0) SND.sfx.whoosh();
    if (t === s.t0 + MARCH.fall) {
      // the strike: the floor splits, everything round it is hurled up
      s.hit = true; s.hitT = t;
      const r = s.huge ? 90 : s.big ? 60 : s.small ? 22 : 28, dmg = s.huge ? 150000 : s.big ? MARCH.fin : s.small ? 16000 : MARCH.dmg;
      shake(s.huge ? 16 : s.big ? 12 : 5); zoomPunch = Math.max(zoomPunch, s.big ? 1 : 0.4); SND.sfx.impact(); if (s.big) { SND.sfx.boom(); SND.sfx.brk(); flash = {a: 0.35, color: C.R}; }
      dust(s.tx, FLOOR, s.huge ? 36 : s.big ? 24 : 10);
      addP({kind: 'ring', x: s.tx, y: FLOOR, r0: 4, rMax: s.huge ? 130 : s.big ? 80 : 36, life: s.big ? 18 : 12, color: C.R, size: s.big ? 3 : 2});
      if (s.huge) for (const d of [1, -1]) waves.push({x: s.tx + d * 40, y: FLOOR, dir: d, t: 0, hitSet: new Set()});
      for (let k = 0; k < (s.big ? 16 : 6); k++) addP({x: s.tx + rnd(-8, 8), y: FLOOR - 2, vx: rnd(-4, 4), vy: -rnd(2, 6), g: 0.25, life: ri(16, 30), color: k % 3 ? C.K : C.R, size: 2, bounce: true});
      if (inCombat()) for (const tg of targets()) if (Math.abs(tg.x - s.tx) < r && tg.y > FLOOR - 110) dealDamage(dmg, tg.x, tg.y - 26, {stop: s.big ? 7 : 3, sp: 2, crit: s.big ? 0.5 : 0.3, big: s.big, quiet: !s.big}, tg);
      if (s.big) for (const d of [1, -1]) waves.push({x: s.tx + d * 20, y: FLOOR, dir: d, t: 0, hitSet: new Set()});
    }
    if (s.hit && t === s.hitT + MARCH.stay + (s.huge ? 24 : s.big ? 10 : 0)) { shardBurst(s.tx, FLOOR - 20, s.big ? 12 : 5, 4); SND.sfx.bladeFire(); s.gone = true; }
    if (!s.gone) live = true;
  }
  if (!live) p.march = null;
}

/* 무형검: the arm itself becomes the blade - for five seconds every swing reaches the enemy wherever it stands */
function startFormless(p) {
  if (p.formless) return false;
  // 특성 무한검: eight seconds instead of five
  p.formless = {t: 0, dur: hasTrait('formless', 'A') ? 480 : FORMLESS.dur};
  SND.sfx.special(); SND.sfx.iai(); flash = {a: 0.25, color: C.Y}; floatText('무형검', p.x, p.y - 62, C.Y, 2, 44, C.K);
  for (let i = 0; i < 20; i++) { const a = i / 20 * TAU; addP({x: p.x, y: p.y - 22, vx: Math.cos(a) * 3, vy: Math.sin(a) * 3, life: 18, color: i % 2 ? C.Y : C.W, size: 2}); }
  addP({kind: 'ring', x: p.x, y: p.y - 22, r0: 4, rMax: 40, life: 14, color: C.Y, size: 2});
  return true;
}
// a formless swing: the cut simply opens on the target itself, with a golden ghost of the swing beside it
function formlessStrike(p, tg, base, o, ang) {
  const q = playerPose(p);
  dealDamage(base * FORMLESS.mult, tg.x + rnd(-6, 6), tg.y - 24 + rnd(-8, 8), o, tg);
  bigCut(tg.x, tg.y - 22, ang, 26, C.Y, C.W);
  const side = tg.x >= p.x ? -1 : 1;
  afterimages.push({pose: q, x: clamp(tg.x + side * 16, 8, W - 8), y: tg.y, face: -side, life: 10, max: 10, color: C.Y});
}

/* 검역: the space round the hero becomes the blade - enemies inside are cut over and over, shots inside are cut down */
function startDomain(p) {
  if (p.domain) return false;
  // 특성 확장: half as wide again and a quarter longer, each cut a little lighter
  const wide = hasTrait('domain', 'A');
  p.domain = {t: 0, a: 0, r: wide ? 132 : DOMAIN.r, dur: wide ? 300 : DOMAIN.dur, dmg: wide ? 7500 : DOMAIN.dmg};
  SND.sfx.cyclone(); SND.sfx.special(); floatText('검역', p.x, p.y - 62, C.W, 2, 40, C.R);
  addP({kind: 'ring', x: p.x, y: p.y - 20, r0: 10, rMax: DOMAIN.r, life: 14, color: C.W, size: 2});
  return true;
}
function updDomain(p) {
  const D = p.domain; if (!D) return;
  D.t++; D.a += 0.05;
  const cx = p.x, cy = p.y - 20;
  const R = D.r || DOMAIN.r;
  if (inCombat()) {
    if (D.t % DOMAIN.every === 0) for (const tg of targets()) if (Math.hypot(tg.x - cx, tg.y - 22 - cy) < R + 10) {
      dealDamage(D.dmg || DOMAIN.dmg, tg.x + rnd(-8, 8), tg.y - 22 + rnd(-14, 14), {quiet: true, stop: 0, sp: 1, crit: 0.2}, tg);
      cutFx(tg.x + rnd(-6, 6), tg.y - 22 + rnd(-10, 10), rnd(TAU)); if (D.t % (DOMAIN.every * 2) === 0) SND.sfx.slash();
    }
    // every shot that crosses into it is cut down (rockets and grenades are batted back)
    // (특성 반격역: and each one cut is sent straight back at the enemy as a blade of light)
    for (let i = arrows.length - 1; i >= 0; i--) {
      const a = arrows[i];
      if (a.stuck || a.kind === 'visual' || a.friendly || Math.hypot(a.x - cx, a.y - cy) > R) continue;
      if (a.kind === 'rocket' || a.kind === 'grenade') { reflectShot(a); continue; }
      arrows.splice(i, 1); sparks(a.x, a.y); addP({kind: 'cut', x: a.x, y: a.y, ang: rnd(TAU), life: 8, len: 14});
      if (hasTrait('domain', 'B') && pshots.length < 40) { const sp = Math.hypot(a.vx, a.vy) || 4; pshots.push({kind: 'gold', x: a.x, y: a.y, vx: -a.vx / sp * 4, vy: -a.vy / sp * 4, t: 0, trail: [], dmg: 9000}); }
    }
  }
  if (D.t >= (D.dur || DOMAIN.dur)) { p.domain = null; addP({kind: 'ring', x: cx, y: cy, r0: R, rMax: 20, life: 10, color: C.W, size: 1}); }
}

/* 천지검명: eight blades are driven in round the enemy; then every blade of the hero's on the field rings in answer
   and bursts, rippling out from him - the more blades, the heavier it lands */
function startResonance(p) {
  const tg = liveTarget(p);
  startCast(p, 18, 'raise');
  const cx = clamp(tg ? tg.x : p.x + p.face * 110, 30, W - 30);
  p.reso = {t: 0, cx, fall: Array.from({length: RESO.own}, (_, i) => ({x: clamp(cx + (i - (RESO.own - 1) / 2) * 13, 8, W - 8), y: -30 - i * 12})), swords: null};
  SND.sfx.blade(); floatText('천지검명', p.x, p.y - 58, C.W, 2, 40, C.R);
  return true;
}
function resonanceSwords(p, R) {
  const out = R.fall.map(f => ({x: f.x, y: FLOOR - 12}));
  for (const d of blades) if (d.state === 'embed' || d.state === 'ground' || d.state === 'fly') out.push({x: d.x, y: d.y, blade: d});
  for (const k of peaks) if (k.t >= 0 && k.grow > 0.2) out.push({x: k.x, y: FLOOR - k.h * k.grow * 0.5});
  if (p.rain) for (const b of p.rain.blades) if (b.stuck) out.push({x: b.x, y: b.y - 10});
  if (p.march) for (const s of p.march.swords) if (s.hit && !s.gone) out.push({x: s.tx, y: FLOOR - 20});
  if (p.reign) { for (let i = 0; i < p.reign.left; i++) { const w = reignWing(p, i); out.push({x: w.x, y: w.y}); } for (const s of p.reign.shots) out.push({x: s.x, y: s.y}); }
  if (p.prison) for (let i = 0; i < PRISON.n; i++) { const a = i / PRISON.n * TAU; out.push({x: p.prison.cx + Math.cos(a) * p.prison.r, y: p.prison.cy + Math.sin(a) * p.prison.r}); }
  out.sort((a, b) => Math.hypot(a.x - p.x, a.y - p.y) - Math.hypot(b.x - p.x, b.y - p.y));
  // 특성 공명 증폭: up to 32 blades answer
  return out.slice(0, hasTrait('resonance', 'A') ? 32 : RESO.max).map((s, i) => Object.assign(s, {at: RESO.burst0 + i * RESO.step, done: false}));
}
function updResonance(p) {
  const R = p.reso; if (!R) return;
  R.t++;
  for (const f of R.fall) if (f.y < FLOOR - 12) { f.y = Math.min(FLOOR - 12, f.y + 14); if (f.y >= FLOOR - 12) { dust(f.x, FLOOR, 3); SND.sfx.bladeFire(); } }
  if (R.t === RESO.ring) {
    // the ring: a chime, and a wave of it spreading from the hero over the whole field
    R.swords = resonanceSwords(p, R);
    SND.sfx.iai(); SND.sfx.chime(); flash = {a: 0.2, color: C.W};
    for (let i = 0; i < 3; i++) addP({kind: 'ring', x: p.x, y: p.y - 22, r0: 6 + i * 10, rMax: 420, life: 26 + i * 4, color: i % 2 ? C.R : C.W, size: 2});
  }
  if (R.swords) {
    let left = 0;
    for (const s of R.swords) {
      if (s.done) continue;
      left++;
      if (R.t === s.at) {
        s.done = true;
        const amp = hasTrait('resonance', 'A'), rr = RESO.r * (amp ? 1.5 : 1);
        addP({kind: 'ring', x: s.x, y: s.y, r0: 3, rMax: amp ? 44 : 30, life: 12, color: C.R, size: 3}); shardBurst(s.x, s.y, amp ? 9 : 6, 4);
        for (let k = 0; k < 5; k++) addP({kind: 'line', x: s.x, y: s.y, vx: rnd(-4, 4), vy: rnd(-5, 1), life: 8, color: k % 2 ? C.W : C.R, size: 1, len: 3});
        if (inCombat()) for (const tg of targets()) if (Math.hypot(tg.x - s.x, tg.y - 22 - s.y) < rr + 12) dealDamage(RESO.dmg * (amp ? 1.3 : 1) * (s.echo ? 0.6 : 1), s.x, s.y, {quiet: true, stop: 1, sp: 1, crit: 0.25}, tg);
        if (s.blade) { const i = blades.indexOf(s.blade); if (i >= 0) blades.splice(i, 1); }
        if ((s.at - RESO.burst0) % 6 === 0) { SND.sfx.explode(); shake(4); }
      }
    }
    // 특성 재공명: when it has all gone off, the eight blades driven in ring once more and burst again
    if (!left && hasTrait('resonance', 'B') && !R.again) {
      R.again = true; R.ring2 = R.t + 12;
      R.swords = R.fall.map((f, i) => ({x: f.x, y: FLOOR - 12, at: R.t + 22 + i * 3, done: false, echo: true}));
      left = 1;
    }
    if (R.ring2 === R.t) { SND.sfx.chime(); SND.sfx.iai(); flash = {a: 0.2, color: C.W}; for (let i = 0; i < 2; i++) addP({kind: 'ring', x: R.cx, y: FLOOR - 20, r0: 6 + i * 10, rMax: 200, life: 22, color: i ? C.R : C.W, size: 2}); }
    if (!left) p.reso = null;
  }
}

/* the poses of the new player states */
function classSkillPose(p) {
  switch (p.state) {
    case 'flash': {
      const d0 = FLASH.stance, d1 = d0 + FLASH.dash;
      if (p.st <= d0) return makePose({hy: -10.5, lean: 0.6, ht: 0.2, l1: 0.1, l2: -1.7, r1: 1.2, r2: -1.6, bu: -0.3, bf: 1.2, fu: -0.2, ff: 1.2, sa: -1.9});
      if (p.st <= d1) return makePose({hy: -12, lean: 0.95, ht: -0.1, l1: -1.35, l2: 0.3, r1: 1.0, r2: -0.35, bu: -2.2, bf: 0.3, fu: 1.62, ff: 0, sa: 1.6});
      return makePose({hy: -12, lean: 0.5, ht: 0.05, l1: -1.1, l2: 0.3, r1: 1.0, r2: -1.0, bu: -1.6, bf: 0.3, fu: 1.9, ff: 0.1, sa: 2.1});
    }
    case 'bloom': {
      if (p.bloom && p.bloom.fin >= 0) return flatPose(1.95 + Math.min(1, (p.st - p.bloom.fin) / 5) * TAU, true, true);
      const q = flatPose((p.st * 0.9) % TAU, true, true);
      if (!p.onGround) Object.assign(q, {hy: -17, l1: 0.5, l2: -1.5, r1: 1.0, r2: -1.4});
      return q;
    }
    case 'swallow': {
      const per = SWALLOW.pass + SWALLOW.gap, top = (p.sw ? p.sw.legs.length : 3) * per + 1, hit = top + 11;
      if (p.st >= hit) return makePose({hy: -9, lean: 0.55, l1: 0.2, l2: -1.8, r1: 1.2, r2: -1.9, bu: -1.8, bf: 0.3, fu: 0.7, ff: 0, sa: 0.6});
      if (p.st > top + 6) return makePose({hy: -18, lean: 0.05, l1: 0.7, l2: -1.8, r1: 1.1, r2: -1.9, bu: -0.3, bf: 0.2, fu: 0.1, ff: 0, sa: 0.05});
      if (p.st >= top) return makePose({hy: -17, lean: -0.1, ht: -0.2, l1: 0.6, l2: -1.6, r1: 1.0, r2: -1.4, bu: 2.8, bf: 0.1, fu: 3.0, ff: 0.1, sa: Math.PI});
      return makePose({hy: -16, lean: 0.9, ht: -0.1, l1: 0.5, l2: -1.5, r1: 1.0, r2: -1.4, bu: -2.2, bf: 0.3, fu: 1.62, ff: 0, sa: 1.6});
    }
    case 'cast':
      if (p.castPose === 'raise') return makePose({hy: -16, lean: -0.1, ht: -0.25, l1: -0.4, r1: 0.4, fu: 3.0, ff: 0.05, bu: 2.8, bf: 0.2, sa: Math.PI - 0.1});
      if (p.castPose === 'command') return makePose({hy: -15.5, lean: 0.15, ht: -0.1, l1: -0.5, r1: 0.5, r2: -0.2, bu: -0.6, bf: 0.4, fu: 1.9, ff: 0.05, sa: 2.0});
      return makePose({hy: -15, lean: 0.25, l1: -0.6, r1: 0.6, r2: -0.2, bu: -0.8, bf: 0.4, fu: 1.55, ff: 0, sa: 1.55});
  }
  return makePose({});
}
/* every frame: the new player states, and the lasting effects */
function updClassSkillState(p) {
  switch (p.state) {
    case 'flash': updFlash(p); break;
    case 'bloom': updBloom(p); break;
    case 'swallow': updSwallow(p); break;
    case 'cast': p.st++; p.vx *= 0.7; if (p.st >= p.castDur) p.state = 'normal'; break;
  }
}
function updFlashCuts(p) {
  const F = p.flashFx; if (!F) return;
  F.t++;
  const tg = F.tg, alive = tg && targets().includes(tg);
  if (alive) { F.cx = tg.x; F.cy = tg.y - 22; }
  const c0 = FLASH.stance + FLASH.dash + FLASH.hold;
  // 특성 육성참: six cuts in the star / 왕복: two more cross it after the run back
  const cuts = flashCuts().concat(hasTrait('flash', 'A') ? [null, 0.9, -0.9] : []);
  cuts.forEach((ang, i) => {
    if (ang == null || F.t !== c0 + i * FLASH.cstep + (i >= flashCuts().length ? 6 : 0)) return;
    // the cuts open on it one after another, crossing in a star
    bigCut(F.cx, F.cy, ang, 40, C.R, C.W); addP({kind: 'cut', x: F.cx, y: F.cy, ang, life: 12, len: 60});
    if (alive) dealDamage(FLASH.cdmg, F.cx + rnd(-6, 6), F.cy + rnd(-8, 8), {quiet: i > 0, stop: 3, sp: 2, crit: 0.35}, tg);
    SND.sfx.slash(); SND.sfx.iai(); shake(4); inkFlash = i === 0 ? 2 : inkFlash;
  });
  const fin = flashEnd() - FLASH.stance - FLASH.dash - FLASH.hold + c0;
  if (F.t === fin) {
    // ...and the shock runs the whole length of the path
    F.fin = F.t; shake(8); zoomPunch = 0.7; SND.sfx.boom();
    hitIn([Math.min(F.x0, F.x1) - 10, F.y - 46, Math.max(F.x0, F.x1) + 10, F.y + 4], 'flfin', FLASH.fin * (hasTrait('flash', 'B') ? 1.3 : 1), {stop: 5, sp: 3, crit: 0.4, big: true}, 0, new Set());
    for (let i = 0; i < 16; i++) { const u = rnd(); addP({kind: 'line', x: lerp(F.x0, F.x1, u), y: F.y - 20 + rnd(-6, 6), vx: rnd(-2, 2), vy: rnd(-3, 3), life: 10, color: i % 2 ? C.W : C.R, size: 2, len: 3}); }
  }
  if (F.t > fin + (hasTrait('flash', 'A') ? 40 : 20)) p.flashFx = null;
}
function updClassSkills(p) {
  for (const k in p.cd) if (p.cd[k] > 0) p.cd[k] -= (p.adren > 0 ? 2 : 1) * (p.formless && hasTrait('formless', 'B') ? 2 : 1);
  updFlashCuts(p);
  // 백화난무's slashes play out even after the stance ends
  if (p.bloom) { for (const a of p.bloom.arcs) a.t++; p.bloom.arcs = p.bloom.arcs.filter(a => a.t < a.life); }
  const R = p.reign;
  if (R) { R.t++; if (R.cool > 0) R.cool--; updReignShots(R); if ((R.t >= REIGN.dur || R.left <= 0) && !R.shots.length) p.reign = null; }
  const M = p.formless;
  if (M) { M.t++; if (M.t % 3 === 0) addP({x: p.x + rnd(-8, 8), y: p.y - rnd(10, 40), vx: rnd(-0.3, 0.3), vy: -rnd(0.6, 1.4), life: 16, color: Math.random() < 0.5 ? C.Y : C.W, size: 1}); if (M.t >= (M.dur || FORMLESS.dur)) p.formless = null; }
  updPrison(p); updMarch(p); updDomain(p); updResonance(p);
}
