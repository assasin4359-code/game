/* ---------- game state ---------- */
let scene = 'title', sceneT = 0, globalT = 0, fightT = 0, muteMsgT = 0, paused = false, queueClear = false, holdInput = false;
let player, boss, arrows, blades, spikes, markers, beams, particles, texts, afterimages, items, platforms, lockon, bigText, waves, peaks, slashWaves, delayed, pshots, blasts, cuts;
let hitstop = 0, shakeAmt = 0, zoomPunch = 0, flash = {a: 0, color: C.W}, bgMix = 0, combo, stats, results = null, dlg = null, storm = [];
// just dodge: enemies run at a third of the speed while slowmo counts down
let slowmo = 0, slowMax = 1, justGhost = null;
// 특성 시간 정지: while it counts down the enemies do not move at all
let timeStop = 0, timeStopMax = 1;
/* one step of the enemies' clock: nothing during a time stop, every third frame in slow motion */
function worldTick() {
  if (timeStop > 0) { if (--timeStop === 0) { SND.sfx.clickD(); SND.sfx.whoosh(); flash = {a: 0.4, color: C.W}; } return false; }
  const tick = slowmo <= 0 || slowmo % 3 === 0;
  if (slowmo > 0) slowmo--;
  return tick;
}
// inkFlash: a few frames of photographic negative, for the assassin's draws
let inkFlash = 0;
// splitFx: screen splits along a cut line (the Sovereign's stolen ultimate)
let splitFx = [];
// mini stage minions and the current wave
let mobs = [], wave = null, mobSeq = 0;
// battleScene is the fight a special / revive / continue returns to ('fight' or 'mini')
let battleScene = 'fight';
// the first chapter's tutorial, while it runs
let tut = null;
// mode: 'fight' (boss) or 'practice' (training ground with dummies)
let mode = 'fight', dummies = [], pstat = {total: 0, log: [], hits: 0}, pmenu = null, specialTarget = null, sigil = null;
const popt = {infSp: false, noCd: false, archer: true, air: true};
const SWORD_LEN = 38;

function resetGame() {
  const hp = Math.round(stage.hp * DIFF[settings.diff].hp), mh = maxHpNow();
  player = { x: 110, y: FLOOR, vx: 0, vy: 0, face: 1, onGround: true, jumps: 0, airDash: true, airAtk: 0, coyote: 0, state: 'normal', st: 0,
    atk: null, hitSet: new Set(), parried: false, landed: false, atkBuf: 0, jumpBuf: 0, lastStep: 0, comboStepT: 0, dashDir: 1, dashCd: 0, pierceT: 0, inv: 0,
    hp: mh, maxHp: mh, sp: upgLv('sp') >= 2 ? 40 : 0, drainCd: 0, bladeCd: 0, furyCd: 0, peakCd: 0, peakMax: 420, furyN: 0, peakDone: false, chargeT: 0, animT: 0, runPh: 0, adren: 0, adrenUsed: false,
    evaded: false, dropT: 0, onPlatform: false, jumping: false, stormSa: 1, trail: [], landT: 0, flipT: 0, fallV: 0,
    justDone: false, justCd: 0, counter: 0, soulShot: false, soulIai: 0,
    riseCd: 0, rainCd: 0, rain: null,
    arcs: [], arcMask: 0, cd: {}, flashFx: null, bloom: null, sw: null, reign: null, prison: null, march: null, formless: null, domain: null, reso: null };
  boss = { id: 'boss', kind: stage.key, x: 372, y: FLOOR, vx: 0, vy: 0, face: -1, hp, maxHp: hp, lagHp: hp, phase: 1, state: 'script', st: 0, next: 90,
    aim: Math.PI, flash: 0, hurtT: 0, breakMeter: 0, onGround: true, closeT: 0, animT: 0, walkPh: 0, releaseT: 0, lastAtk: '', fired: 0,
    spin: 0, spinDir: 1, alpha: 1, vineMode: 'wave', drawing: false, stunDur: 150, summon: false, fly: false, kneel: false, queue: null,
    ultDone: false, breakCd: 0, spinA: 0, shots: 1, fromX: 0, tx: 0, galeTo: 0,
    aim2: Math.PI, launcher: false, gold: 0, reticle: null, lines: [], roll: 0,
    sheathed: false, stance: false, dashing: false, hitOn: false, diving: false, clones: [], mark: null, safe: null, swing: 0,
    trailOn: false, ktrail: [], ktrail2: [], swingDir: 1, xs: -1 };
  arrows = []; blades = []; spikes = []; markers = []; beams = []; particles = []; texts = []; afterimages = []; items = []; waves = []; peaks = []; slashWaves = []; delayed = [];
  pshots = []; blasts = []; cuts = [];
  lockon = null; bigText = null; storm = []; sigil = null; slowmo = 0; timeStop = 0; justGhost = null; inkFlash = 0; splitFx = [];
  platforms = [{x1: 62, x2: 162, y: 188, on: false, grow: 0}, {x1: 318, x2: 418, y: 188, on: false, grow: 0}, {x1: 196, x2: 284, y: 140, on: false, grow: 0}];
  hitstop = 0; shakeAmt = 0; zoomPunch = 0; flash = {a: 0, color: C.W}; bgMix = 0; paused = false; fightT = 0;
  combo = {n: 0, t: 0, pop: 0};
  stats = {time: 0, dmgTaken: 0, maxCombo: 0, continues: 0, specials: 0, justs: 0, kills: 0};
  mobs = []; wave = null; battleScene = 'fight'; boss.hidden = false; boss.freed = false; tut = null;
  Object.assign(boss, {mimic: null, p3: false, rings: []});
  if (boss.kind === 'origin') originReset(boss);
}
resetGame();
function setScene(s, t0 = 0) { scene = s; sceneT = t0; }
function shake(n) { if (settings.shake) shakeAmt = Math.max(shakeAmt, reduceMotion ? n * 0.3 : n); }
function clearHazards() {
  arrows.length = 0; spikes.length = 0; markers.length = 0; beams.length = 0; blades.length = 0; waves.length = 0; peaks.length = 0; slashWaves.length = 0; delayed.length = 0;
  pshots.length = 0; blasts.length = 0; cuts.length = 0; lockon = null; sigil = null; slowmo = 0; timeStop = 0;
  boss.reticle = null; boss.lines = []; boss.clones = []; boss.mark = null; boss.safe = null; boss.rings = [];
  if (boss.fx) { boss.fx.length = 0; boss.barcs.length = 0; boss.bDet = -1; }
}
/* adrenaline rush: revive boost that also upgrades every attack and skill */
function triggerAdrenaline(revive) {
  const p = player;
  p.adren = adrenMax(); p.inv = Math.max(p.inv, 90); p.state = 'normal'; p.vx = 0;
  if (revive) { p.adrenUsed = true; p.hp = Math.round(p.maxHp * (upgLv('adren') >= 2 ? 0.5 : 0.3)); }
  flash = {a: 0.7, color: C.R}; shake(6); SND.sfx.powerup();
  bigText = {s: '아드레날린 러시', t: 0, dur: 80, color: C.R};
  for (let i = 0; i < 24; i++) { const a = i / 24 * TAU; addP({x: p.x, y: p.y - 18, vx: Math.cos(a) * 3, vy: Math.sin(a) * 3, life: 22, color: C.R, size: 2}); }
}

/* ---------- particles & floating text ---------- */
function addP(o) { const q = Object.assign({x: 0, y: 0, vx: 0, vy: 0, g: 0, life: 30, color: C.K, size: 1, kind: 'px', drag: 1}, o); q.max = q.life; particles.push(q); }
function dust(x, y, n) { for (let i = 0; i < n; i++) addP({x: x + rnd(-6, 6), y: y - 1, vx: rnd(-1.6, 1.6), vy: -rnd(0.2, 1.4), g: 0.05, life: ri(12, 24), color: i % 3 ? '#8a8a8a' : C.K, size: i % 2 ? 2 : 1, drag: 0.94}); }
function sparks(x, y) { for (let i = 0; i < 6; i++) { const a = rnd(TAU); addP({kind: 'line', x, y, vx: Math.cos(a) * 3, vy: Math.sin(a) * 3, life: 8, color: C.K, size: 1, len: 1.5, drag: 0.85}); } }
function leafBurst(x, y, n = 14) { for (let i = 0; i < n; i++) { const a = rnd(TAU), s = rnd(1, 3.5); addP({kind: 'leaf', x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, drag: 0.92, life: ri(20, 36), color: i % 2 ? C.G2 : C.G1}); } }
function cutFx(x, y, ang) { addP({kind: 'cut', x, y, ang, life: 10, len: 54}); }
function glint(x, y, s = 6) { addP({kind: 'glint', x, y, life: 12, size: s}); }
function slashMark(x, y, ang, r = 26) { addP({kind: 'slashmark', x, y, ang, r, life: 12}); }
function floatText(s, x, y, color, sc = 1, life = 45, outline = C.W) { texts.push({s, x, y, vy: -0.7, life, max: life, color, sc, outline}); }
function addAfter(p, color) { const q = playerPose(p); afterimages.push({pose: q, x: p.x, y: p.y, face: q.flip ? -p.face : p.face, life: 12, max: 12, color: color || (p.adren > 0 ? C.R : C.K)}); }
function addBossAfter(b) { const q = bossPose(b); afterimages.push({pose: q, x: b.x, y: b.y, face: q.flip ? -b.face : b.face, life: 12, max: 12, color: b.kind === 'gun' ? C.Y : C.G2, boss: bkind(b)}); }
function updateParticles() {
  for (let i = particles.length - 1; i >= 0; i--) {
    const q = particles[i];
    q.x += q.vx; q.y += q.vy; q.vy += q.g; q.vx *= q.drag; q.vy *= q.drag;
    if (q.kind === 'leaf') q.vx += Math.sin((q.life + i) * 0.1) * 0.05;
    if (q.kind === 'fly') { q.vx = clamp(q.vx + rnd(-0.07, 0.07), -0.6, 0.6); q.vy = clamp(q.vy + rnd(-0.07, 0.07), -0.4, 0.4); if (q.y > FLOOR - 8) q.vy = -0.3; }
    if (q.bounce && q.y > FLOOR) { q.y = FLOOR; q.vy *= -0.4; q.vx *= 0.6; }
    if (--q.life <= 0) particles.splice(i, 1);
  }
}
function updateTexts() { for (let i = texts.length - 1; i >= 0; i--) { const t = texts[i]; t.y += t.vy; t.vy *= 0.93; if (--t.life <= 0) texts.splice(i, 1); } }
function updateAfterimages() { for (let i = afterimages.length - 1; i >= 0; i--) if (--afterimages[i].life <= 0) afterimages.splice(i, 1); }
function decayFx() {
  shakeAmt *= 0.86; if (shakeAmt < 0.3) shakeAmt = 0;
  zoomPunch *= 0.82; if (zoomPunch < 0.02) zoomPunch = 0;
  flash.a = Math.max(0, flash.a - 0.05);
  if (inkFlash > 0) inkFlash--;
  for (let i = splitFx.length - 1; i >= 0; i--) if (++splitFx[i].t > (splitFx[i].big ? 34 : 8)) splitFx.splice(i, 1);
  if (bigText && ++bigText.t > bigText.dur) bigText = null;
  if (combo.t > 0 && --combo.t === 0) combo.n = 0;
  if (combo.pop > 0) combo.pop--;
  if (boss.lagHp > boss.hp) boss.lagHp = Math.max(boss.hp, boss.lagHp - boss.maxHp * 0.003); else boss.lagHp = boss.hp;
}

/* ---------- player ----------
   wins: frame windows that can each land one hit. flat: horizontal cut (yaw sweep).
   slam: leaps, then falls and hits on landing. arc: the shape of the crescent of light each swing throws round the
   hero (see spawnComboArc). the ground combo is five quick hits: a cut, a backhand, a rising cut, a spinning cut,
   and the grand slam */
const ATTACKS = {
  1: {id: 1, dur: 13, wins: [[2, 5]], flat: true, yaw0: -2.0, yaw1: 1.9, mult: 1, box: [-6, -46, 58, 2], lunge: 1.4, dash: 3.6, cut: 0.12, arc: 'fwd'},
  2: {id: 2, dur: 13, wins: [[2, 5]], flat: true, yaw0: 1.9, yaw1: -2.0, mult: 1, box: [-20, -46, 56, 2], lunge: 1.2, dash: 2.4, cut: -0.12, arc: 'back'},
  3: {id: 3, dur: 15, wins: [[2, 6]], a0: 0.2, a1: 3.4, ground: true, mult: 1.1, box: [-10, -78, 50, 4], lunge: 1.2, dash: 2.6, cut: -1.1, arc: 'rise'},
  4: {id: 4, dur: 18, wins: [[2, 5], [6, 10]], flat: true, spin: true, yaw0: 1.7, yaw1: 1.7 + TAU, mult: 0.75, box: [-38, -44, 58, 2], lunge: 1.4, dash: 3.0, hop: -2.2, cut: -0.12, arc: 'spin'},
  5: {id: 5, dur: 40, wins: [[6, 13]], a0: 3.3, a1: 3.3, mult: 0.9, box: [-32, -70, 42, 6], slam: true, flip: true, fallAt: 14, landSt: 26, slamMult: 2.2, cut: 1.9},
  air: {id: 'air', dur: 16, wins: [[2, 8]], flat: true, yaw0: -1.9, yaw1: 1.85, mult: 0.9, box: [-26, -48, 48, 10], cut: 0.1},
  air2: {id: 'air2', dur: 16, wins: [[2, 8]], a0: 4.1, a1: 0.3, mult: 0.95, box: [-24, -56, 44, 12], cut: 2.2},
  plunge: {id: 'plunge', dur: 40, wins: [], a0: 0.05, a1: 0.05, mult: 1, box: [-20, -40, 20, 10], slam: true, fallAt: 4, landSt: 26, slamMult: 1.6},
  pierce: {id: 'pierce', dur: 24, wins: [[1, 13]], a0: 1.57, a1: 1.57, mult: 1.6, box: [-12, -34, 34, 0], crit: 0.4, cut: 0},
  // Blade Master, S+J on the ground: 승룡검 - a leaping uppercut that carries the hero into the air
  rising: {id: 'rising', dur: 28, wins: [[2, 7], [8, 13]], a0: 0.3, a1: 3.5, mult: 1.15, box: [-12, -92, 40, 6], cut: -1.4},
};
function attackBox(p) { const b = p.atk.box; return p.face > 0 ? [p.x + b[0], p.y + b[1], p.x + b[2], p.y + b[3]] : [p.x - b[2], p.y + b[1], p.x - b[0], p.y + b[3]]; }
const attackEnd = A => A.wins.length ? A.wins[A.wins.length - 1][1] : A.landSt;
const bossBox = () => [boss.x - 10, boss.y - 42, boss.x + 10, boss.y + 2];
const bossHittable = () => scene === 'fight' && boss.hp > 0 && boss.alpha > 0.5 && boss.state !== 'dead' && boss.state !== 'script';
// hit targets: the boss in a fight, the minions in a mini stage, the dummies in the training ground
const inCombat = () => scene === 'fight' || scene === 'practice' || scene === 'mini';
function targets() { return scene === 'practice' ? dummies : scene === 'mini' ? liveMobs() : (bossHittable() ? [boss] : []); }
const dummyBox = d => [d.x - 10, d.y - 46, d.x + 10, d.y + 2];
const tBox = t => t === boss ? bossBox() : t.mob ? mobBox(t) : dummyBox(t);
function nearestTarget(x, y) {
  let best = null, bd = Infinity;
  for (const t of (mode === 'practice' ? dummies : battleScene === 'mini' ? liveMobs() : [boss])) { const d = Math.hypot(t.x - x, t.y - 22 - y); if (d < bd) { bd = d; best = t; } }
  return best;
}
function hitIn(box, key, base, o, cutAng, set = player.hitSet) {
  const hits = [];
  for (const t of targets()) {
    const k = key + ':' + t.id;
    if (set.has(k) || !overlap(box, tBox(t))) continue;
    set.add(k); hits.push(t);
    dealDamage(base, t.x + rnd(-6, 6), t.y - 24 + rnd(-8, 8), o, t);
    cutFx(t.x, t.y - 22, cutAng != null ? cutAng : rnd(-1.2, 1.2));
  }
  return hits.length ? hits : null;
}
function curWindow(A, st) { for (let i = 0; i < A.wins.length; i++) if (st >= A.wins[i][0] && st <= A.wins[i][1] + 1) return i; return -1; }
const winU = (w, st) => st < w[0] ? 0 : st < w[1] ? easeOut((st - w[0]) / (w[1] - w[0])) : 1;

/* horizontal cut pose: the blade sweeps around the body (yaw); the spin variant turns the body round */
function flatPose(yaw, low, spin) {
  const flip = spin && Math.sin(yaw) < -0.25, ly = flip ? -yaw : yaw;
  const fu = Math.atan2(Math.sin(ly), 0.55 * Math.cos(ly) + 0.35);
  return makePose({hy: low ? -13 : -14.5, lean: low ? 0.4 : 0.3, ht: -0.1, l1: -0.8, l2: -0.2, r1: 0.85, r2: -0.7, bu: -fu * 0.6 - 0.5, bf: 0.7, fu, ff: 0.15, yaw: ly, flip, sa: 0});
}
// airborne keyframes keep the standing grip: sword held low, trailing behind
const JUMP_UP = {hy: -18, lean: 0.14, ht: -0.1, l1: -0.3, l2: -0.2, r1: 0.55, r2: -1.1, bu: -2.0, bf: 0.5, fu: 0.4, ff: -0.3, sa: -1.45};
const JUMP_TOP = {hy: -18, lean: 0.25, ht: 0.05, l1: 0.55, l2: -1.8, r1: 1.05, r2: -1.75, bu: -1.4, bf: 0.8, fu: 0.5, ff: -0.35, sa: -1.35};
const JUMP_FALL = {hy: -17.5, lean: 0.1, ht: 0.1, l1: -0.3, l2: -0.35, r1: 0.45, r2: -0.6, bu: -1.9, bf: 0.4, fu: 0.6, ff: -0.35, sa: -1.15};
function playerPose(p) {
  const t = p.animT;
  switch (p.state) {
    case 'attack': {
      const A = p.atk, st = p.st;
      if (A.id === 'pierce') {
        if (st < 2) return makePose({hy: -12, lean: 0.6, l1: -1.0, l2: 0.1, r1: 0.9, r2: -0.9, bu: -1.6, bf: 0.4, fu: 0.7, ff: 1.0, sa: 1.6});
        return makePose({hy: -12, lean: 1.02, ht: -0.1, l1: -1.45, l2: 0.3, r1: 1.0, r2: -0.3, bu: -2.3, bf: 0.3, fu: 1.62, ff: 0, sa: 1.6});
      }
      if (A.id === 'plunge') {
        if (!p.landed) return makePose({hy: -18, lean: 0.05, l1: 0.7, l2: -1.8, r1: 1.1, r2: -1.9, bu: -0.3, bf: 0.2, fu: 0.1, ff: 0, sa: 0.05});
        return makePose({hy: -9, lean: 0.55, l1: 0.2, l2: -1.8, r1: 1.2, r2: -1.9, bu: -1.8, bf: 0.3, fu: 0.7, ff: 0, sa: 0.6});
      }
      if (A.flat) {
        const w = A.wins, yaw = A.spin ? lerp(A.yaw0, A.yaw1, st < w[0][0] ? 0 : Math.min(1, (st - w[0][0]) / (w[1][1] - w[0][0]))) : lerp(A.yaw0, A.yaw1, winU(w[0], st));
        const q = flatPose(yaw, !!A.spin, A.spin);
        if (A.id === 'air') Object.assign(q, {hy: -17, l1: 0.6, l2: -1.6, r1: 1.0, r2: -1.4});
        return q;
      }
      if (A.id === 5) {
        // crouch -> leap into a forward somersault, the raised sword wheeling with the body -> smash
        if (st < 4) return makePose({hy: -10, lean: 0.35, l1: 0.2, l2: -1.7, r1: 1.1, r2: -1.9, fu: 3.0, ff: 0.15, sa: 3.5});
        if (!p.landed && st < A.fallAt) { const u = clamp((st - 4) / (A.fallAt - 4), 0, 1), e = u * u * (3 - 2 * u); return makePose({hy: -17, lean: 0.3, l1: 0.8, l2: -2.0, r1: 1.2, r2: -2.1, fu: 2.9, ff: 0.1, sa: 3.2, rot: e * TAU, piv: -18}); }
        if (!p.landed) return makePose({hy: -17, lean: 0.1, l1: -0.2, l2: -0.5, r1: 0.5, r2: -0.6, fu: 3.1, ff: 0.1, sa: 3.4});
        return makePose({hy: -10, lean: 0.62, l1: -0.9, l2: -0.6, r1: 1.2, r2: -1.6, fu: 0.85, ff: 0.1, sa: 0.72});
      }
      const u = winU(A.wins[0], st), sa = lerp(A.a0, A.a1, u), fu = sa - 0.25 * Math.sign(A.a1 - A.a0);
      // the rising cut of the ground combo keeps its feet planted in a lunge; the air cuts tuck the legs
      if (A.ground) return makePose({hy: -13.5, lean: lerp(0.5, -0.1, u), l1: -0.9, l2: 0.2, r1: 0.95, r2: -0.8, bu: -1.6, bf: 0.4, fu, ff: 0.1, sa});
      return makePose({hy: -17, lean: 0.25, l1: 0.6, l2: -1.6, r1: 1.0, r2: -1.4, bu: -2.0, bf: 0.4, fu, ff: 0.1, sa});
    }
    case 'fury': {
      const k = Math.min((p.furyMax || 5) - 1, Math.floor(p.st / 7)), u = easeOut(clamp((p.st - k * 7) / 5, 0, 1));
      if (k % 2 === 0) { const q = flatPose(lerp(-1.9, 1.85, u), false, false); if (!p.onGround) Object.assign(q, {hy: -17, l1: 0.5, l2: -1.5, r1: 0.9, r2: -1.3}); return q; }
      const sa = lerp(3.9, 0.6, u);
      return makePose({hy: p.onGround ? -14 : -17, lean: 0.35, l1: -0.8, l2: -0.1, r1: 0.85, r2: -0.6, bu: -1.4, bf: 0.4, fu: sa - 0.25, ff: 0.1, sa});
    }
    case 'plant': {
      if (p.st < 10) { const u = p.st / 10; return makePose({hy: -16 - u * 2, lean: -0.1, ht: -0.2, l1: -0.3, l2: -0.2, r1: 0.4, r2: -0.3, bu: 2.8, bf: 0.1, fu: 2.9, ff: 0.1, sa: Math.PI}); }
      return makePose({hy: -9, lean: 0.7, ht: 0.3, l1: 0.2, l2: -1.8, r1: 1.2, r2: -1.9, bu: 0.9, bf: 0.2, fu: 1.0, ff: -0.4, sa: 0.05});
    }
    // dash: low shadow sprint, sword dragged behind (the pierce thrusts it forward instead)
    case 'dash': return makePose({hy: -11, lean: 0.72, ht: -0.25, l1: -1.2, l2: 0.1, r1: 0.75, r2: -1.3, bu: -1.3, bf: 0.7, fu: 0.1, ff: -0.25, sa: -1.5});
    case 'hurt': return makePose({hy: -15, lean: -0.5, ht: -0.3, l1: 0.4, l2: -0.4, r1: 0.7, r2: -0.3, bu: 2.6, bf: 0.3, fu: 2.0, ff: 0.4, sa: -2.4});
    case 'charge': { const j = Math.sin(t * 0.9) * 0.05; return makePose({hy: -9, lean: 0.15 + j, l1: 0.2, l2: -1.7, r1: 1.2, r2: -2.0, bu: 2.8, bf: 0.1, fu: 2.95, ff: 0.05, sa: Math.PI}); }
    case 'dead': return makePose({rot: -1.5, l1: -0.1, l2: 0, r1: 0.15, r2: 0, bu: 1.6, bf: 0.2, fu: -1.4, ff: 0.3, sa: 1.3});
    case 'storm': return makePose({hy: -14, lean: 0.4, l1: -0.8, r1: 0.9, r2: -0.6, bu: -1.4, bf: 0.4, fu: p.stormSa - 0.2, ff: 0.1, sa: p.stormSa});
    // 일검무귀: a deep, still stance with the blade drawn back level behind him, then the one level cut, held
    // after it: a flick of the blade to throw off the blood, then, back turned, the blade rested over the shoulder
    case 'ilgeom':
      if (p.igPh === 'flick') return makePose({hy: -13, lean: 0.45, ht: 0.1, l1: -1.0, l2: 0.2, r1: 1.0, r2: -0.9, bu: -1.2, bf: 0.4, fu: 0.9, ff: 0.1, sa: 0.55});
      if (p.igPh === 'back') return makePose({hy: -16.2, lean: -0.04, ht: 0.08, l1: -0.22, r1: 0.28, r2: -0.1, bu: -0.25, bf: 0.45, fu: 0.5, ff: 2.2, sa: -2.45});
      return Object.assign(flatPose(p.igYaw, true, false), {hy: -11.5, lean: 0.5, l1: -1.15, l2: 0.25, r1: 1.05, r2: -0.95});
    case 'rain': return makePose({hy: -16, lean: -0.1, ht: -0.25, l1: -0.4, r1: 0.4, fu: 3.0, ff: 0.05, bu: 2.8, bf: 0.2, sa: Math.PI - 0.1});
    case 'flash': case 'bloom': case 'swallow': case 'cast': return classSkillPose(p);
  }
  if (!p.onGround) {
    if (p.flipT > 0) { const u = 1 - p.flipT / 18; return makePose({hy: -17, lean: 0.4, l1: 0.9, l2: -2.0, r1: 1.2, r2: -2.1, bu: 1.2, bf: 0.8, fu: 0.6, ff: -0.4, sa: -1.3, rot: u * TAU, piv: -16}); }
    const v = p.vy;
    if (v < 1.5) return makePose(lerpPose(JUMP_UP, JUMP_TOP, clamp((v + 3.5) / 5, 0, 1)));
    return makePose(lerpPose(JUMP_TOP, JUMP_FALL, clamp((v - 1.5) / 2.5, 0, 1)));
  }
  if (p.landT > 0 && Math.abs(p.vx) < 1.2) {
    const k = p.landT / 8;
    return makePose(lerpPose({hy: -15.2, lean: 0.14, l1: -0.38, l2: -0.12, r1: 0.42, r2: -0.28, bu: -0.3, bf: -0.5, fu: 0.55, ff: -0.35, sa: -1.25},
      {hy: -11.5, lean: 0.4, ht: 0.2, l1: 0.5, l2: -1.4, r1: 1.0, r2: -1.6, bu: -1.3, bf: 0.4, fu: 1.1, ff: -0.2, sa: -1.1}, k));
  }
  if (Math.abs(p.vx) > 0.4) {
    const ph = p.runPh, c = Math.cos(ph), s = Math.sin(ph), sp = Math.min(1, Math.abs(p.vx) / 2.4);
    const leg = f => [0.1 + 0.95 * Math.sin(f) * sp, -(0.3 + 1.6 * Math.max(0, Math.cos(f))) * (0.4 + 0.6 * sp)];
    const [r1, r2] = leg(ph), [l1, l2] = leg(ph + Math.PI);
    return makePose({hy: -14.6 - Math.abs(c) * 1.6 * sp, lean: 0.35 + 0.2 * sp, ht: -0.12 + Math.abs(s) * 0.05, l1, l2, r1, r2,
      bu: -s * 1.1 * sp - 0.2, bf: 1.3, fu: -0.35 + s * 0.12, ff: 0.5, sa: -1.38 + Math.sin(ph * 2) * 0.07});
  }
  const b = Math.sin(t * 0.06), b2 = Math.sin(t * 0.023);
  return makePose({hy: -15.2 + b * 0.5, lean: 0.14 + b * 0.02, ht: 0.05 + b2 * 0.06, l1: -0.38, l2: -0.12, r1: 0.42, r2: -0.28,
    bu: -0.25 + b * 0.05, bf: -0.5, fu: 0.55 + b * 0.03, ff: -0.35, sa: -1.25 + b * 0.02});
}

function startAttack(dir, K) {
  const p = player; p.atkBuf = 0;
  if (dir) p.face = dir;
  let A;
  if (p.state === 'dash' || p.pierceT > 0) { A = ATTACKS.pierce; p.pierceT = 0; p.pierceN = 1; p.inv = Math.max(p.inv, 16); p.onGround && (p.vy = 0); }
  // 특성 연속 관통: at the end of a pierce J turns round toward the enemy and pierces again, up to three in a row
  else if (traitOf('pierce') === 'A' && p.state === 'attack' && p.atk.id === 'pierce' && (p.pierceN || 1) < 3) {
    const tg = nearestTarget(p.x, p.y);
    p.face = tg && targets().includes(tg) ? (tg.x >= p.x ? 1 : -1) : -p.face;
    A = ATTACKS.pierce; p.pierceN = (p.pierceN || 1) + 1; p.inv = Math.max(p.inv, 16);
    addP({kind: 'ring', x: p.x, y: p.y - 20, r0: 3, rMax: 18, life: 8, color: C.W, size: 2});
  }
  else if (p.onGround && K && K.down && isMaster() && p.riseCd <= 0) {
    A = ATTACKS.rising; p.riseCd = 80; p.vy = -7.4; p.vx = p.face * 1.5; p.onGround = false; p.jumping = false; p.airAtk = 1;
    dust(p.x, p.y, 8); floatText('승룡검', p.x, p.y - 58, C.R, 1, 30, C.W);
  }
  else if (p.state === 'attack' && typeof p.lastStep === 'number' && p.lastStep < 5) A = ATTACKS[p.lastStep + 1];
  else if (!p.onGround) {
    if (K && K.down) A = ATTACKS.plunge;
    else { if (p.airAtk >= 3) return false; A = [ATTACKS.air, ATTACKS.air2, ATTACKS.plunge][p.airAtk]; }
    p.airAtk++;
    if (A !== ATTACKS.plunge) p.vy = Math.min(p.vy, -1.6);
  } else A = ATTACKS[p.comboStepT > 0 && typeof p.lastStep === 'number' && p.lastStep < 5 ? p.lastStep + 1 : 1];
  // 천검군림: every swing sends a blade from the wings
  if (p.reign) reignLaunch(p);
  p.atk = A; p.lastStep = A.id; p.state = 'attack'; p.st = 0; p.hitSet = new Set(); p.parried = false; p.landed = false; p.flipT = 0; p.waveMask = 0; p.arcMask = 0; p.soulShot = false;
  if (A.dash && p.onGround) { p.vx = p.face * A.dash; dust(p.x, p.y, 5); }
  if (A.hop && p.onGround) { p.vy = A.hop; p.onGround = false; p.jumping = false; }
  if (A.id === 'pierce') { SND.sfx.pierce(); addP({kind: 'ring', x: p.x + p.face * 10, y: p.y - 20, r0: 2, rMax: 16, life: 8, color: C.R, size: 2}); }
  else if (A.id === 5 || A.id === 'plunge' || A.spin || A.id === 'rising') SND.sfx.whoosh(); else SND.sfx.slash();
  return true;
}
/* fire a slotted skill if it is ready */
function useSkill(p, id) {
  switch (id) {
    case 'fury': if (p.furyCd <= 0) { startFury(); return true; } break;
    case 'peak': if (p.peakCd <= 0) { startPeak(); return true; } break;
    case 'blade': if (p.bladeCd <= 0) { summonBlades(); return true; } break;
    case 'rain': if (p.rainCd <= 0 && !p.rain) { startRain(p); return true; } break;
    default: if (NEW_CD[id]) return classSkill(p, id);
  }
  return false;
}
/* how far along each skill's cooldown is (1 = just used, 0 = ready), for the HUD and the skill screen */
function skillCd(p, id) {
  switch (id) {
    case 'blade': return p.bladeCd / 200;
    case 'fury': return p.furyCd / 150;
    case 'peak': return p.peakCd / (p.peakMax || 420);
    case 'rain': return p.rain ? 1 : p.rainCd / RAIN.cd;
  }
  if (NEW_CD[id]) return (p.cd[id] || 0) / NEW_CD[id];
  return 0;
}
/* ; : 만검우 (Blade Lord) - the sword points at the sky, a sigil opens over the enemy and a rain of blades pours down
   across it; each one sticks in the ground where it lands, and at the end they all burst together */
const RAIN = {cast: 16, start: 14, pour: 56, burst: 84, cd: 720, w: 64};
function startRain(p) {
  const tg = nearestTarget(p.x, p.y);
  p.state = 'rain'; p.st = 0; p.rainCd = RAIN.cd; p.vx = 0; p.flipT = 0;
  // 특성 폭우: a narrow rain, twice as thick
  p.rain = {x: clamp(tg && targets().includes(tg) ? tg.x : p.x + p.face * 110, 40, W - 40), t: 0, blades: [], hit: {}, w: traitOf('rain') === 'A' ? 30 : RAIN.w, dense: traitOf('rain') === 'A'};
  SND.sfx.blade(); SND.sfx.special(); floatText('만검우', p.x, p.y - 58, C.R, 2, 40, C.W);
  addP({kind: 'ring', x: p.x + p.face * 4, y: p.y - 56, r0: 2, rMax: 24, life: 12, color: C.R, size: 2});
}
function updateRain(p) {
  const R = p.rain; if (!R) return;
  R.t++;
  // the sigil drifts after its target while the blades fall
  const tg = nearestTarget(R.x, FLOOR - 20);
  if (tg && targets().includes(tg) && R.t < RAIN.start + RAIN.pour) R.x = lerp(R.x, clamp(tg.x, 40, W - 40), 0.04);
  if (R.t >= RAIN.start && R.t < RAIN.start + RAIN.pour && (R.dense || R.t % 2 === 0)) {
    R.blades.push({x: R.x + rnd(-R.w, R.w), y: 30, vy: rnd(9, 12), stuck: 0, id: R.t});
    if (R.t % 8 === 0) SND.sfx.bladeFire();
  }
  for (const b of R.blades) {
    if (b.stuck) continue;
    b.y += b.vy;
    if (inCombat()) for (const t of targets()) {
      const k = b.id + ':' + t.id;
      if (R.hit[k] || !overlap([b.x - 4, b.y - 16, b.x + 4, b.y + 2], tBox(t))) continue;
      R.hit[k] = 1; dealDamage(R.dense ? 4000 : 9000, b.x, b.y, {quiet: true, stop: 1, sp: 1, crit: 0.2}, t);
    }
    if (b.y >= FLOOR + 4) { b.y = FLOOR + 4; b.stuck = 1; if (Math.random() < 0.4) dust(b.x, FLOOR, 2); }
  }
  // 특성 연쇄 폭발: the planted blades go off one by one, from the hero's side outward
  if (R.t === RAIN.burst && traitOf('rain') === 'B') {
    R.chain = R.blades.filter(b => b.stuck).sort((a, b) => Math.abs(a.x - p.x) - Math.abs(b.x - p.x));
    R.chain.forEach((b, i) => { b.at = RAIN.burst + Math.floor(i * 0.8); });
    SND.sfx.brk();
  }
  if (R.chain) {
    let left = 0;
    for (const b of R.chain) {
      if (b.gone) continue;
      if (R.t < b.at) { left++; continue; }
      b.gone = true;
      addP({kind: 'ring', x: b.x, y: FLOOR - 8, r0: 2, rMax: 20, life: 10, color: C.R, size: 2}); shardBurst(b.x, FLOOR - 10, 3, 3.5);
      if (inCombat()) for (const t of targets()) if (Math.abs(t.x - b.x) < 22 && t.y > FLOOR - 120) dealDamage(7000, t.x + rnd(-6, 6), t.y - 24 + rnd(-10, 10), {quiet: true, stop: 1, sp: 1, crit: 0.3}, t);
      if ((b.at - RAIN.burst) % 3 === 0) { SND.sfx.explode(); shake(3); }
    }
    if (!left) p.rain = null;
    return;
  }
  if (R.t === RAIN.burst) {
    // every planted blade bursts: one heavy hit to everything in the rain's width
    flash = {a: 0.35, color: C.R}; shake(7); SND.sfx.impact(); SND.sfx.brk();
    for (const b of R.blades) if (b.stuck && Math.random() < 0.5) shardBurst(b.x, FLOOR - 10, 3, 3.5);
    addP({kind: 'ring', x: R.x, y: FLOOR - 10, r0: 10, rMax: R.w + 30, life: 16, color: C.R, size: 3});
    if (inCombat()) for (const t of targets()) if (Math.abs(t.x - R.x) < R.w + 18 && t.y > FLOOR - 120) dealDamage(60000, t.x, t.y - 24, {stop: 6, sp: 3, big: true, crit: 0.4}, t);
    p.rain = null;
  }
}
function startDash(dir) {
  const p = player;
  p.dashDir = dir || p.face; p.face = p.dashDir;
  p.state = 'dash'; p.st = 0; p.dashCd = upgLv('dash') >= 1 ? 24 : 34; p.inv = Math.max(p.inv, 14); p.evaded = false; p.flipT = 0; p.hitSet = new Set(); p.justDone = false;
  if (!p.onGround) p.airDash = false;
  SND.sfx.dash(); dust(p.x, p.y, 4);
}
/* I: 검기 오연참 - five slashes, each releasing a crescent sword wave */
function startFury() {
  const p = player;
  p.state = 'fury'; p.st = 0; p.furyN = 0; p.furyCd = 150; p.flipT = 0; p.furyMax = (p.adren > 0 ? 7 : 5) + (upgLv('fury') >= 2 ? 2 : 0);
  SND.sfx.whoosh(); floatText({5: '검기 오연참', 7: '검기 칠연참', 9: '검기 구연참'}[p.furyMax], p.x, p.y - 52, C.R, 1, 36, C.W);
}
/* crescent sword wave; sizes grow during adrenaline rush and with the growth upgrade */
function spawnSlashWave(p, o) {
  const sz = (p.adren > 0 ? 1.25 : 1) * (upgLv('fury') >= 1 ? 1.25 : 1);
  slashWaves.push({x: p.x + p.face * 16, y: p.y - (o.yo || 22), dir: p.face, t: 0, tilt: o.tilt || 0, hh: o.hh * sz, dmg: o.dmg * sz,
    spd: o.spd || 7.6, hitSet: new Set(), ret: !!o.ret, cross: !!o.cross});
}
function furyWave(p, k) {
  const big = k === p.furyMax - 1, tf = traitOf('fury');
  // 특성 십자: the last one is a giant X of two crossed crescents / 회귀: every wave comes back
  if (big && tf === 'B') {
    spawnSlashWave(p, {hh: 56, dmg: 46000, tilt: 0, yo: 24, spd: 9, cross: true});
    SND.sfx.slash(); SND.sfx.whoosh(); SND.sfx.boom(); shake(6); zoomPunch = 0.7; flash = {a: 0.2, color: C.R};
  } else {
    spawnSlashWave(p, {hh: big ? 44 : 30, dmg: big ? 26000 : 14000, tilt: k % 2 ? 0.25 : -0.12, yo: k % 2 ? 26 : 20, spd: big ? 8.2 : 7.6, ret: tf === 'A'});
    SND.sfx.slash(); if (big) { SND.sfx.whoosh(); shake(3); }
  }
  p.vx -= p.face * 0.5;
}
/* O: 검산 - plant the sword; greatswords burst out of the ground in a line ahead */
function startPeak() {
  const p = player;
  p.peakMax = upgLv('peak') >= 2 ? 290 : 420;
  p.state = 'plant'; p.st = 0; p.peakCd = p.peakMax; p.peakDone = false; p.flipT = 0;
  SND.sfx.blade(); floatText('검산', p.x, p.y - 54, C.R, 2, 40, C.W);
}
function summonBlades() {
  // L: 천검 소환 - a crimson sigil opens behind the hero, blades flash in as a fan, fly out one by one,
  // lodge in the enemy, and all burst together once the last one lands
  const p = player, ad = p.adren > 0, n = (ad ? 8 : 6) + (upgLv('blade') >= 1 ? 2 : 0);
  p.bladeCd = 200;
  sigil = {x: p.x - p.face * 4, y: p.y - 46, face: p.face, t: 0, n, red: ad, det: -1};
  SND.sfx.blade(); floatText('천검 소환', p.x, p.y - 62, C.R, 1, 36, C.W);
  // 특성 대검: one giant greatsword instead, hanging over the enemy's head, then dropped on it
  if (traitOf('blade') === 'B') {
    const tg = nearestTarget(p.x, p.y), x = tg ? tg.x : p.x + p.face * 90;
    blades.push({giant: true, state: 'giant', x, y: 36, vx: 0, vy: 0, ang: Math.PI / 2, t: 0, trail: [], red: ad, grow: 0, n, tg});
    addP({kind: 'ring', x: sigil.x, y: sigil.y, r0: 4, rMax: 36, life: 16, color: C.R, size: 2});
    return;
  }
  for (let i = 0; i < n; i++) {
    const a = -Math.PI / 2 + (i - (n - 1) / 2) * (Math.PI * 0.95 / (n - 1));
    blades.push({x: sigil.x + Math.cos(a) * 34, y: sigil.y + Math.sin(a) * 28, vx: 0, vy: 0, ang: a, t: 0, appear: 3 + i * 2, delay: 20 + i * 3, state: 'form', trail: [], red: ad, grow: 0});
  }
  addP({kind: 'ring', x: sigil.x, y: sigil.y, r0: 4, rMax: 36, life: 16, color: C.R, size: 2});
}
function dealDamage(base, x, y, o = {}, t = boss) {
  const p = player, b = boss, isBoss = t === boss;
  // the assassin's still-mirror stance turns any hit into a counterattack
  if (isBoss && bkind(b) === 'sword' && b.state === 'counter' && scene === 'fight') { assassinParry(x, y); return; }
  let dmg = base * rnd(0.88, 1.12) * atkMult();
  // the first hit after a just dodge is a counter: guaranteed critical, heavier, with its own impact
  const counter = p.counter > 0 && !o.quiet;
  if (counter) p.counter = 0;
  // (치명 단련 adds to every chance that can go either way; a set 0 or 1 stays as it is)
  const cc = o.crit != null ? o.crit : 0.18, crit = counter || Math.random() < (cc > 0 && cc < 1 ? cc + critBonus() : cc);
  if (crit) dmg *= critMult();
  // 투지: a critical hit gives back a little blood
  if (crit && upgLv('drain') && p.drainCd <= 0 && p.hp > 0 && p.hp < p.maxHp && inCombat()) {
    const h = upgLv('drain') >= 2 ? 2 : 1; p.hp = Math.min(p.maxHp, p.hp + h); p.drainCd = 20;
    floatText('+' + h, p.x, p.y - 42, C.G2, 1, 30, C.K);
  }
  if (counter) dmg *= 1.8;
  if (p.adren > 0) dmg *= 2;
  if (slowmo > 0 || timeStop > 0) dmg *= 1.25;
  if (isBoss && b.state === 'stun') dmg *= 1.3;
  // the original's last struggle: his guard is gone
  if (isBoss && b.p3) dmg *= ORIGIN.p3dmg;
  dmg = Math.round(dmg);
  if (counter) {
    SND.sfx.counter(); zoomPunch = 1; flash = {a: 0.3, color: C.W};
    floatText('반격!', x, y - 34, C.W, 3, 50, C.B);
    addP({kind: 'ring', x, y, r0: 4, rMax: 40, life: 14, color: C.B, size: 3});
    o = Object.assign({}, o, {stop: 10, big: true});
  }
  const dir = Math.sign(t.x - p.x) || 1;
  if (isBoss) {
    b.hp = Math.max(0, b.hp - dmg); b.flash = 8; b.hurtT = 10; if (b.breakCd <= 0 && b.state !== 'stun') b.breakMeter += dmg;
    // no burst skips one of the original's phases, nor his 일검무귀
    if (b.kind === 'origin' && !b.p3) b.hp = Math.max(b.hp, b.maxHp * (b.phase === 1 ? 0.55 : b.ultDone ? 0.1 : 0.3));
  }
  else if (t.mob) dmg = mobTakeHit(t, dmg, o);
  else {
    t.flash = 8; t.rotV += dir * Math.min(0.32, 0.05 + dmg / 450000);
    pstat.total += dmg; pstat.hits++; pstat.log.push([globalT, dmg]);
    for (let i = 0; i < 7; i++) addP({x, y, vx: rnd(-2, 2) + dir, vy: rnd(-2.5, 0), g: 0.12, life: ri(20, 34), color: i % 3 ? C.Y : C.K, size: 1, bounce: true});
  }
  combo.n++; combo.t = 150; combo.pop = 6; stats.maxCombo = Math.max(stats.maxCombo, combo.n);
  p.sp = Math.min(100, p.sp + ((o.sp != null ? o.sp : 3) + (crit && o.sp !== 0 ? 2 : 0)) * spMult());
  if (settings.dmgNum) {
    const tx = x + rnd(-8, 8), ty = y + rnd(-6, 6);
    if (crit && !o.quiet && !counter) floatText('치명타!', tx, ty - (o.big ? 26 : 16), C.R, 1, 45, C.W);
    floatText(String(dmg), tx, ty, C.R, o.big ? 3 : crit ? 2 : 1, 48, C.K);
  }
  hitstop = Math.max(hitstop, o.stop != null ? o.stop : crit ? 6 : 3);
  shake(crit ? 4 : 2); SND.sfx.hit(crit);
  for (let i = 0; i < (crit ? 16 : 9); i++) addP({x, y, vx: rnd(-2.5, 2.5) + dir * 1.5, vy: rnd(-3, 1), g: 0.15, life: ri(16, 30), color: isBoss ? C.R : '#8a8a8a', size: Math.random() < 0.3 ? 2 : 1, bounce: true});
  for (let i = 0; i < 3; i++) { const a = rnd(TAU); addP({kind: 'line', x, y, vx: Math.cos(a) * 5, vy: Math.sin(a) * 5, life: 7, color: C.K, size: 2, len: 2, drag: 0.8}); }
  addP({kind: 'ring', x, y, r0: 3, rMax: crit ? 22 : 14, life: 10, color: C.K, size: 2});
  if (isBoss && b.breakMeter >= 1100000 && b.state !== 'stun' && scene === 'fight') stunBoss(120);
}
function parryIn(r) {
  const p = player;
  for (let i = arrows.length - 1; i >= 0; i--) {
    const a = arrows[i];
    if (a.stuck || a.kind === 'visual' || a.kind === 'giant' || a.kind === 'crescent' || a.kind === 'tornado' || a.friendly) continue;
    if (a.x >= r[0] - 3 && a.x <= r[2] + 3 && a.y >= r[1] - 3 && a.y <= r[3] + 3) {
      if (a.kind === 'rocket' || a.kind === 'grenade') { reflectShot(a); continue; }
      arrows.splice(i, 1); sparks(a.x, a.y); p.sp = Math.min(100, p.sp + 4);
      if (!p.parried) { p.parried = true; SND.sfx.parry(); floatText('튕겨내기', a.x, a.y - 8, C.K); }
    }
  }
}
/* a cut rocket turns round and flies back at the shooter; a cut grenade is batted away */
function reflectShot(a) {
  a.friendly = true; a.age = 0;
  if (a.kind === 'rocket') { const ang = Math.atan2(boss.y - 24 - a.y, boss.x - a.x); a.vx = Math.cos(ang) * 8; a.vy = Math.sin(ang) * 8; }
  else { a.vx = player.face * 4.6; a.vy = -3.6; a.fuse = Math.max(a.fuse || 0, 34); }
  SND.sfx.reflect(); sparks(a.x, a.y); hitstop = Math.max(hitstop, 4); player.sp = Math.min(100, player.sp + 6);
  floatText('반사!', a.x, a.y - 12, C.Y, 2, 40, C.K);
}
function meleeCheck(w) {
  const p = player, A = p.atk, r = attackBox(p), base = A.cut != null ? A.cut : rnd(-1.2, 1.2), ang = p.face > 0 ? base : Math.PI - base;
  // growth: 연격 단련 raises every basic swing, 대시 단련 the phantom pierce
  const up = A.id === 'pierce' ? (upgLv('dash') >= 2 ? 1.5 : 1) : comboMult() * (typeof A.id === 'number' && A.id < 5 && traitOf('combo') === 'A' ? 0.9 : 1);
  let hits = hitIn(r, 'w' + w, 30000 * A.mult * up, {crit: A.crit, melee: true, pierce: A.id === 'pierce'}, ang);
  // 무형검: the swing lands on every enemy on the field, however far
  if (p.formless) for (const t of targets()) {
    const k = 'w' + w + ':' + t.id; if (p.hitSet.has(k)) continue;
    p.hitSet.add(k); formlessStrike(p, t, 30000 * A.mult, {crit: A.crit, melee: true}, ang); (hits = hits || []).push(t);
  }
  if (hits && scene === 'fight' && boss.onGround && boss.state === 'idle') boss.vx += p.face * 0.8;
  // adrenaline: the phantom pierce leaves a cut that bursts a moment later
  if (hits && A.id === 'pierce' && p.adren > 0) for (const t of hits) delayed.push({t, time: 14});
  // soul of the gunner: a landed pierce is chased by five golden bullets
  if (hits && A.id === 'pierce' && hasSoul('gun') && !p.soulShot) {
    p.soulShot = true; SND.sfx.gun();
    for (let i = 0; i < 5; i++) pshots.push({kind: 'gold', x: p.x - p.face * 14, y: p.y - 14 - i * 5, vx: -p.face * 1.5, vy: -1.6 + i * 0.8, t: -i * 3, trail: [], dmg: 11000});
  }
  parryIn(r);
}
/* a line of greatswords bursting from the floor; red ones are the adrenaline version */
function peakLine(x0, dir, n, gap, o) {
  for (let i = 0; i < n; i++) {
    const x = x0 + dir * i * gap; if (x < 6 || x > W - 6) break;
    peaks.push(Object.assign({x, t: -i * (o.step || 4), h: (o.h || 40) + i * (o.dh || 2.5), tilt: (i % 2 ? 1 : -1) * (o.tilt || 0.12), w: 8, dmg: 20000, stay: 18, hitSet: new Set(), grow: 0}, o.extra || {}));
  }
}
/* the whips of red flame the ground combo throws round the hero (drawn by drawFlameArc):
   each follows the path of its swing along a flattened ellipse; the main one sheds sparks as its head arrives */
function spawnComboArc(p, A, w) {
  const f = p.face, big = p.adren > 0 ? 1.2 : 1;
  const add = (o) => p.arcs.push(Object.assign({ox: f * 6, oy: -22, t: 0, life: 11, k: 0.8, seed: rnd(1, 99)}, o.w > 5 ? {spark: true} : {life: 9}, o));
  switch (A.arc) {
    case 'fwd':   // round the front of the body, from behind to ahead
      add({rx: 52 * big, ry: 24, rot: f * 0.25, a0: f > 0 ? Math.PI : 0, span: f > 0 ? -3.3 : 3.3, w: 8 * big, oy: -27});
      add({rx: 64 * big, ry: 30, rot: f * 0.35, a0: f > 0 ? Math.PI - 0.3 : 0.3, span: f > 0 ? -2.7 : 2.7, w: 3.5 * big, oy: -27});
      break;
    case 'back':  // the backhand, over the top from ahead to behind
      add({rx: 50 * big, ry: 26, rot: -f * 0.3, a0: f > 0 ? 0.1 : Math.PI - 0.1, span: f > 0 ? -3.3 : 3.3, w: 8 * big});
      add({rx: 62 * big, ry: 32, rot: -f * 0.4, a0: f > 0 ? 0.3 : Math.PI - 0.3, span: f > 0 ? -2.6 : 2.6, w: 3.5 * big});
      break;
    case 'rise':  // from low in front, rising up over the shoulder
      add({rx: 48 * big, ry: 20, rot: f * 1.05, a0: f > 0 ? 0 : Math.PI, span: f > 0 ? -3.3 : 3.3, w: 8.5 * big, oy: -34});
      add({rx: 60 * big, ry: 27, rot: f * 0.9, a0: f > 0 ? 0.2 : Math.PI - 0.2, span: f > 0 ? -2.6 : 2.6, w: 3.5 * big, oy: -34});
      break;
    case 'spin':  // the spinning cut: the front half, then the back half - a full circle
      add(w === 0 ? {rx: 60 * big, ry: 18, rot: f * 0.1, a0: f > 0 ? Math.PI : 0, span: f > 0 ? -3.3 : 3.3, w: 9 * big}
        : {rx: 60 * big, ry: 18, rot: f * 0.1, a0: f > 0 ? 0 : Math.PI, span: f > 0 ? -3.3 : 3.3, w: 9 * big});
      break;
  }
}
/* sparks thrown off a flame arc: a spray along the path at the head, embers shed along the body */
function arcSparks(p, a) {
  const c = Math.cos(a.rot), s = Math.sin(a.rot), dir = Math.sign(a.span), cx = p.x + a.ox, cy = p.y + a.oy;
  const at = (u, dr) => {
    const th = a.a0 + a.span * u, sc = 1 - 0.3 * (1 - u), x = Math.cos(th) * (a.rx * sc + dr), y = Math.sin(th) * (a.ry * sc + dr * a.k);
    const tx = -Math.sin(th) * a.rx * dir, ty = Math.cos(th) * a.ry * dir, tl = Math.hypot(tx, ty) || 1;
    return {x: cx + x * c - y * s, y: cy + x * s + y * c, tx: (tx * c - ty * s) / tl, ty: (tx * s + ty * c) / tl};
  };
  for (let i = 0; i < 9; i++) {
    const q = at(rnd(0.8, 1), a.w * rnd(-0.3, 1)), v = rnd(2.5, 6), sp = rnd(-0.5, 0.5);
    addP({kind: 'line', x: q.x, y: q.y, vx: (q.tx + -q.ty * sp) * v, vy: (q.ty + q.tx * sp) * v, drag: 0.86, life: ri(7, 13), color: i % 3 ? (a.pal ? a.pal.body : C.R) : C.W, size: 1, len: 1.6});
  }
  for (let i = 0; i < 5; i++) {
    const q = at(rnd(0.3, 0.85), a.w * rnd(0.3, 1.2)), v = rnd(0.8, 2);
    addP({x: q.x, y: q.y, vx: q.tx * v + rnd(-0.4, 0.4), vy: q.ty * v - rnd(0.2, 0.8), g: 0.04, drag: 0.93, life: ri(10, 18), color: i % 2 ? (a.pal ? a.pal.body : C.R) : a.pal ? C.W : C.K, size: rnd(1, 2)});
  }
}
/* 특성 폭쇄: the end of the phantom pierce bursts - a ring of sword light round the point of the thrust */
function pierceBlast(p) {
  const x = p.x + p.face * 26, y = p.y - 18, r = 42;
  shake(6); zoomPunch = 0.6; SND.sfx.explode(); SND.sfx.slash();
  addP({kind: 'ring', x, y, r0: 4, rMax: r + 6, life: 14, color: C.R, size: 3});
  addP({kind: 'ring', x, y, r0: 2, rMax: r * 0.6, life: 10, color: C.W, size: 2});
  bigCut(x, y, rnd(-0.3, 0.3), 30, C.R, C.W); bigCut(x, y, Math.PI / 2 + rnd(-0.3, 0.3), 26, C.R, C.W);
  for (let i = 0; i < 16; i++) { const a = rnd(TAU), s = rnd(2, 6); addP({kind: 'line', x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, drag: 0.86, life: ri(8, 14), color: i % 3 ? C.R : C.W, size: 1, len: 2}); }
  hitIn([x - r, y - r, x + r, y + r], 'pblast', 32000 * (upgLv('dash') >= 2 ? 1.5 : 1), {stop: 4, sp: 2, crit: 0.3}, rnd(-1, 1));
}
function slamImpact(p, mult, plunge) {
  shake(6); zoomPunch = 1; flash = {a: 0.22, color: C.W}; SND.sfx.impact();
  // the grand slam's flame: one big cut from over the back, over the top, down into the ground in front - the finish of the combo
  if (!plunge) { const f = p.face; p.arcs.push({ox: f * 4, oy: -24, rx: 52, ry: 44, rot: 0, a0: f > 0 ? -2.3 : Math.PI + 2.3, span: f > 0 ? 2.8 : -2.8, w: 12, k: 1, t: 0, life: 13, seed: rnd(1, 99), spark: true}); }
  dust(p.x + p.face * 14, p.y, 18);
  for (let i = 0; i < 10; i++) addP({x: p.x + p.face * 16 + rnd(-10, 10), y: p.y - 2, vx: rnd(-2.5, 2.5), vy: -rnd(1.5, 4), g: 0.2, life: ri(18, 30), color: C.K, size: 2, bounce: true});
  addP({kind: 'ring', x: p.x + p.face * 14, y: p.y, r0: 4, rMax: 40, life: 14, color: C.K, size: 3});
  const box = p.face > 0 ? [p.x - 26, p.y - 36, p.x + 58, p.y + 4] : [p.x - 58, p.y - 36, p.x + 26, p.y + 4];
  hitIn(box, 'slam', 30000 * mult * (!plunge && upgLv('combo') >= 3 ? 1.5 : 1), {stop: 7}, Math.PI / 2);
  if (p.formless) for (const t of targets()) if (!p.hitSet.has('slam:' + t.id)) { p.hitSet.add('slam:' + t.id); formlessStrike(p, t, 30000 * mult, {stop: 7}, Math.PI / 2); }
  parryIn(box);
  if (plunge) {
    // air S+J: the dive plants the sword and a sword mountain bursts out to both sides
    const ad = p.adren > 0, o = ad ? {h: 50, dh: 4, step: 3, extra: {red: true, sc: 1.8, w: 12, dmg: 26000}} : {h: 36, dh: 3, step: 3, extra: {dmg: 18000}};
    const n = upgLv('peak') >= 1 ? 7 : 5;
    peakLine(p.x + 24, 1, n, 20, o); peakLine(p.x - 24, -1, n, 20, o);
    return;
  }
  waves.push({x: p.x + p.face * 22, y: p.y, dir: p.face, t: 0, hitSet: new Set()});
  if (p.adren > 0) {
    waves.push({x: p.x - p.face * 22, y: p.y, dir: -p.face, t: 0, hitSet: new Set()});
    for (let i = 0; i < 3; i++) { const x = p.x + p.face * (30 + i * 20); if (x > 6 && x < W - 6) peaks.push({x, t: -2 - i * 3, h: 34 + i * 3, tilt: (i % 2 ? 1 : -1) * 0.14, hitSet: new Set(), grow: 0}); }
  }
}
/* ---------- just dodge ----------
   dash into an attack in the first frames of the dash: enemies slow to a third of their speed for a while,
   and the next hit becomes a counter. detected by actual contact, or by a threat passing right by the body
   (fast bullets can skip over the hurtbox between frames) */
function beamDist(bm, x, y) { const dx = Math.cos(bm.ang), dy = Math.sin(bm.ang), rx = x - bm.x, ry = y - bm.y; return rx * dx + ry * dy > 0 ? Math.abs(rx * dy - ry * dx) : Infinity; }
function threatNear(p) {
  const cx = p.x, cy = p.y - 17;
  for (const a of arrows) {
    if (a.stuck || a.kind === 'visual' || a.friendly) continue;
    const rx = a.kind === 'giant' ? 30 : a.kind === 'rocket' ? 22 : 16, ry = 22;
    for (let k = 0; k <= 2; k++) { const x = a.x - a.vx * k * 0.5, y = a.y - a.vy * k * 0.5; if (Math.abs(x - cx) < rx && Math.abs(y - cy) < ry) return true; }
  }
  for (const bm of beams) if (bm.t <= 8 && beamDist(bm, cx, cy) < (bm.w || 10) + 14) return true;
  for (const bl of blasts) if (!bl.friendly && bl.t <= 6 && Math.hypot(bl.x - cx, bl.y - cy) < bl.r + 12) return true;
  for (const c of cuts) if (c.t >= c.warn - 3 && c.t <= c.warn + 3 && cutDist(c, cx, cy) < c.w + 14) return true;
  for (const s of spikes) if (s.t >= s.warn && s.grow > 0.3 && Math.abs(s.x - p.x) < 18 && p.y > FLOOR - s.h - 8) return true;
  if (scene === 'fight' && boss.kind === 'origin' && originThreat(cx, cy)) return true;
  if (scene === 'mini') for (const m of mobs) if (m.hp > 0 && (m.state === 'lunge' || m.state === 'swing' || m.state === 'thrust' || m.state === 'dive') && Math.abs(m.x - p.x) < 34 && Math.abs(m.y - p.y) < 46) return true;
  return scene === 'fight' && bossLethal() && Math.abs(boss.x - p.x) < 36 && Math.abs(boss.y - p.y) < 40;
}
const canJust = p => !p.justDone && p.st <= justWin() && slowmo <= 0 && p.justCd <= 0 && inCombat();
function justDodge() {
  const p = player;
  p.justDone = true; p.dashCd = 0; p.inv = Math.max(p.inv, 20);
  const tj = traitOf('just');
  // 특성 시간 정지: the world stops dead instead of slowing
  if (tj === 'B') { timeStop = timeStopMax = upgLv('just') >= 2 ? 72 : 48; slowmo = 0; p.justCd = timeStop + 45; p.counter = timeStop + 30; SND.sfx.clickD(); }
  else { slowmo = slowMax = slowDur(); p.justCd = slowmo + 45; p.counter = slowmo + 30; }
  // 특성 잔상 반격: the afterimage left behind flies at the enemy and cuts three times
  if (tj === 'A') p.ghostCut = {t: 0, x: p.x, y: p.y, face: p.face, x0: p.x, y0: p.y};
  p.sp = Math.min(100, p.sp + 18 * spMult()); stats.justs++;
  hitstop = Math.max(hitstop, 4); flash = {a: 0.55, color: C.W}; shake(3); zoomPunch = 0.6; SND.sfx.just();
  bigText = {s: '저스트 회피', t: 0, dur: 56, color: C.W, outline: C.B, sc: 3};
  justGhost = {x: p.x, y: p.y, face: p.face, pose: playerPose(p), t: 0};
  addP({kind: 'ring', x: p.x, y: p.y - 17, r0: 4, rMax: 64, life: 22, color: C.B, size: 3});
  addP({kind: 'ring', x: p.x, y: p.y - 17, r0: 2, rMax: 34, life: 14, color: C.W, size: 2});
  for (let i = 0; i < 12; i++) { const a = i / 12 * TAU; addP({kind: 'line', x: p.x + Math.cos(a) * 12, y: p.y - 17 + Math.sin(a) * 12, vx: Math.cos(a) * 4, vy: Math.sin(a) * 4, life: 10, color: C.B, size: 1, len: 3, drag: 0.85}); }
  // soul of the bowmaster: four spirit arrows answer the dodge
  if (hasSoul('bow')) for (let i = 0; i < 4; i++) { const a = -Math.PI / 2 + (i - 1.5) * 0.55; pshots.push({kind: 'spirit', x: p.x, y: p.y - 28, vx: Math.cos(a) * 3.2, vy: Math.sin(a) * 3.2, t: -i * 4, trail: [], dmg: 15000}); }
  // soul of the swordsman: a moment later, blink behind the enemy with a drawing cut
  if (hasSoul('sword')) p.soulIai = 8;
}
function soulIai() {
  const p = player, tg = nearestTarget(p.x, p.y);
  if (!tg || !targets().includes(tg) || p.state === 'dead') return;
  const side = tg === boss ? -boss.face : (p.x < tg.x ? 1 : -1), x0 = p.x, x1 = clamp(tg.x + side * 30, 12, W - 12);
  p.x = x1; p.face = tg.x >= p.x ? 1 : -1; p.vx = 0;
  addP({kind: 'iai', x: (x0 + x1) / 2, y: p.y - 20, len: Math.abs(x1 - x0) / 2 + 14, life: 14});
  dealDamage(60000, tg.x, tg.y - 24, {quiet: true, crit: 0.5, stop: 8, big: true}, tg);
  cutFx(tg.x, tg.y - 22, 0.05); SND.sfx.iai(); addAfter(p, C.B);
}
/* 특성 잔상 반격: the blue afterimage lunges from where the dodge happened to the enemy's side and cuts three times */
const GHOST_HITS = [11, 16, 21];
function updGhostCut(p) {
  const G = p.ghostCut; G.t++;
  if (!G.tg || !targets().includes(G.tg)) G.tg = nearestTarget(G.x0, G.y0);
  const tg = G.tg;
  if (!tg || !targets().includes(tg) || G.t > 32) { p.ghostCut = null; return; }
  const u = clamp((G.t - 3) / 7, 0, 1), e = u * u * (3 - 2 * u), side = G.x0 <= tg.x ? -1 : 1;
  G.x = lerp(G.x0, tg.x + side * 18, e); G.y = lerp(G.y0, tg.y, e); G.face = tg.x >= G.x ? 1 : -1;
  if (G.t === 4) SND.sfx.dash();
  const k = GHOST_HITS.indexOf(G.t);
  if (k >= 0) {
    dealDamage(22000, tg.x + rnd(-6, 6), tg.y - 24 + rnd(-8, 8), {quiet: true, crit: 0.3, stop: 2, sp: 1}, tg);
    bigCut(tg.x, tg.y - 24, [0.3, -0.5, 1.4][k], 30, C.B, C.W); SND.sfx.slash(); G.swing = G.t;
  }
}
/* player projectiles from souls: they curve onto the nearest enemy */
function updatePShots() {
  for (let i = pshots.length - 1; i >= 0; i--) {
    const s = pshots[i];
    if (++s.t < 0) continue;
    const tg = nearestTarget(s.x, s.y), top = s.kind === 'gold' ? 9 : 7.5;
    if (tg) {
      const cur = Math.atan2(s.vy, s.vx), nc = cur + clamp(angDiff(Math.atan2(tg.y - 22 - s.y, tg.x - s.x), cur), -0.18, 0.18), sp = Math.min(top, Math.hypot(s.vx, s.vy) + 0.45);
      s.vx = Math.cos(nc) * sp; s.vy = Math.sin(nc) * sp;
    }
    s.trail.push([s.x, s.y]); if (s.trail.length > 8) s.trail.shift();
    s.x += s.vx; s.y += s.vy;
    const hit = targets().find(t => overlap([s.x - 3, s.y - 3, s.x + 3, s.y + 3], tBox(t)));
    if (hit) {
      dealDamage(s.dmg, s.x, s.y, {sp: 1, stop: 1, quiet: true, crit: 0.3}, hit);
      addP({kind: 'ring', x: s.x, y: s.y, r0: 2, rMax: 14, life: 9, color: s.kind === 'gold' ? C.Y : C.G2, size: 2});
      pshots.splice(i, 1); continue;
    }
    if (s.t > 130 || s.x < -30 || s.x > W + 30 || s.y < -50 || s.y > FLOOR + 6) pshots.splice(i, 1);
  }
}
function hurtPlayer(dmg, kx, ky) {
  const p = player;
  if (p.inv > 0 || p.state === 'dead' || !inCombat()) return false;
  if (p.state === 'charge') SND.chargeStop();
  const practice = scene === 'practice';
  // growth: 방어 단련 takes the edge off every hit
  if (!practice) { dmg = Math.max(1, Math.round(dmg * DIFF[settings.diff].dmg * hurtMult())); stats.dmgTaken += dmg; }
  p.hp = Math.max(practice ? 1 : 0, p.hp - dmg);
  p.state = 'hurt'; p.st = 0; p.vx = kx; p.vy = ky; p.inv = 60; p.onGround = false; p.jumping = false; p.flipT = 0;
  combo.n = 0; combo.t = 0;
  shake(5); hitstop = 5; flash = {a: 0.35, color: C.R}; SND.sfx.hurt();
  for (let i = 0; i < 10; i++) addP({x: p.x, y: p.y - 18, vx: rnd(-2.5, 2.5), vy: rnd(-3, 0), g: 0.15, life: ri(14, 26), color: C.K, bounce: true});
  if (p.hp <= 0) { if (!p.adrenUsed) startPassive(); else startDeath(); }
  return true;
}
function tryHurt(dmg, kx, ky) {
  const p = player;
  if (p.state === 'dash' || (p.state === 'attack' && p.atk.id === 'pierce' && p.inv > 0)) {
    if (p.state === 'dash' && canJust(p)) { justDodge(); return false; }
    if (!p.evaded && !p.justDone && inCombat()) { p.evaded = true; p.sp = Math.min(100, p.sp + 6); floatText('회피', p.x, p.y - 44, C.G2); SND.sfx.parry(); }
    return false;
  }
  return hurtPlayer(dmg, kx, ky);
}
const hitsPlayer = (x, y, r) => x > player.x - 5 - r && x < player.x + 5 + r && y > player.y - 34 - r && y < player.y + r;

function updatePlayer() {
  const p = player, ctrl = scene === 'fight' || scene === 'victory' || scene === 'practice' || scene === 'mini';
  const K = ctrl ? keys : NOKEYS, PR = ctrl ? pressed : NOKEYS;
  // (특성 무아: while 무형검 lasts every cooldown runs down twice as fast)
  const ad = p.adren > 0, spd = ad ? 1.8 : 1, mv = ad ? 1.6 : 1, cdr = (ad ? 2 : 1) * (p.formless && traitOf('formless') === 'B' ? 2 : 1);
  p.animT++;
  if (ad) { p.adren--; if (globalT % 2 === 0) addP({x: p.x + rnd(-6, 6), y: p.y - rnd(0, 34), vy: -rnd(0.5, 1.4), life: 18, color: C.R, size: Math.random() < 0.3 ? 2 : 1}); }
  if (p.inv > 0) p.inv--;
  if (p.justCd > 0) p.justCd--;
  if (p.counter > 0) p.counter--;
  if (p.soulIai > 0 && --p.soulIai === 0 && inCombat()) soulIai();
  if (p.ghostCut) updGhostCut(p);
  if (p.dashCd > 0) p.dashCd--;
  if (p.drainCd > 0) p.drainCd--;
  if (p.pierceT > 0) p.pierceT--;
  if (p.bladeCd > 0) p.bladeCd -= cdr;
  if (p.furyCd > 0) p.furyCd -= cdr;
  if (p.peakCd > 0) p.peakCd -= cdr;
  if (p.riseCd > 0) p.riseCd--;
  if (p.rainCd > 0) p.rainCd -= cdr;
  if (p.atkBuf > 0) p.atkBuf--;
  if (p.jumpBuf > 0) p.jumpBuf--;
  if (p.comboStepT > 0) p.comboStepT--;
  if (p.dropT > 0) p.dropT--;
  if (p.landT > 0) p.landT--;
  if (p.flipT > 0) p.flipT--;
  if (PR.attack) p.atkBuf = 8;
  if (PR.jump) p.jumpBuf = 6;
  const dir = (K.right ? 1 : 0) - (K.left ? 1 : 0);
  const canDash = PR.dash && p.dashCd <= 0 && (p.onGround || p.airDash);
  // the skill in a pressed slot (slots beyond the class's count stay shut)
  const slotSkill = () => { for (let i = 0; i < slotCount(); i++) if (PR['slot' + i]) { const id = save.loadout[i]; if (id && skillUnlocked(id)) return id; } return null; };
  const trySkill = (only) => {
    const id = slotSkill(); if (!id || (only && !only.includes(id))) return false;
    return useSkill(p, id);
  };
  updateRain(p); updClassSkills(p);
  switch (p.state) {
    case 'flash': case 'bloom': case 'swallow': case 'cast': updClassSkillState(p); break;
    case 'normal': {
      const acc = (p.onGround ? 0.55 : 0.38) * mv;
      p.vx += clamp(dir * 2.4 * mv - p.vx, -acc, acc);
      if (dir) p.face = dir;
      if (Math.abs(p.vx) > 0.4 && p.onGround) {
        const before = Math.floor(p.runPh / Math.PI);
        p.runPh += Math.abs(p.vx) * 0.13;
        if (Math.floor(p.runPh / Math.PI) !== before) addP({x: p.x - p.face * 3, y: p.y - 1, vx: -p.face * rnd(0.3, 0.9), vy: -rnd(0.2, 0.7), g: 0.03, life: 12, color: '#8a8a8a', size: 2, drag: 0.93});
      }
      if (p.jumpBuf > 0) {
        if (p.onGround || p.coyote > 0) {
          if (K.down && p.onPlatform) { p.dropT = 14; p.y += 1; p.onGround = false; }
          else { p.vy = -5.6; p.jumps = 1; p.jumping = true; p.onGround = false; p.coyote = 0; p.landT = 0; SND.sfx.jump(); dust(p.x, p.y, 5); }
          p.jumpBuf = 0;
        } else if (p.jumps < 2) {
          p.vy = -5.1; p.jumps = 2; p.jumping = true; p.jumpBuf = 0; p.flipT = 18; SND.sfx.jump();
          addP({kind: 'ring', x: p.x, y: p.y, r0: 2, rMax: 12, life: 10, color: C.K, size: 1.5});
        }
      }
      if (canDash) startDash(dir);
      else if (p.atkBuf > 0) startAttack(dir, K);
      else if (trySkill()) {}
      else if (K.special && p.sp >= 100 && p.onGround) { p.state = 'charge'; p.st = 0; p.chargeT = 0; SND.chargeStart(); }
      break;
    }
    case 'attack': {
      const A = p.atk, prev = p.st, cut = typeof A.id === 'number' && A.id < 5, tc = traitOf('combo');
      // 특성 질풍: the first four cuts run 35% faster, trailing afterimages / 중검: 20% slower
      p.st += (A.slam && !p.landed && p.st >= A.fallAt) ? 0 : spd * (cut && tc === 'A' ? 1.35 : cut && tc === 'B' ? 0.85 : 1);
      if (cut && tc === 'A' && globalT % 2 === 0) addAfter(p, ad ? '#f08a92' : '#9a9a9a');
      if (A.id === 'pierce') {
        if (p.st < 12) { p.vx = p.face * 8.5 * (ad ? 1.2 : 1); p.vy = 0; addAfter(p, C.R); } else p.vx *= 0.8;
        // 특성 폭쇄: where the thrust ends, a blast of sword light
        if (prev < 12 && p.st >= 12 && traitOf('pierce') === 'B') pierceBlast(p);
      } else if (A.slam) {
        if (A.id === 5 && prev < 4 && p.st >= 4) {
          p.vy = -5.2; p.onGround = false; p.vx = p.face * 2; dust(p.x, p.y, 8); SND.sfx.whoosh();
          // a wheel of flame round the hips for the somersault
          p.arcs.push({ox: 0, oy: -18, rx: 24, ry: 24, rot: 0, a0: -Math.PI / 2, span: p.face > 0 ? 5.4 : -5.4, w: 6, k: 1, t: 0, sweep: 8, life: 14, seed: rnd(1, 99), curl: 0.4});
        }
        if (A.id === 'plunge' && p.st < A.fallAt) { p.vy = -1; p.vx *= 0.8; }
        if (p.st >= A.fallAt && !p.landed) {
          if (p.onGround) { p.landed = true; p.st = A.landSt; slamImpact(p, A.slamMult, A.id === 'plunge'); }
          else { p.vy = 7.5; p.vx *= 0.9; if (globalT % 2 === 0) addAfter(p); }
        }
        if (p.landed) p.vx *= 0.7;
      } else if (p.onGround) { p.vx *= 0.75; if (p.st < attackEnd(A)) p.vx += p.face * (A.lunge || 0.5) * 0.5 * mv; }
      else if (A.hop) { p.vx = p.vx * 0.9 + p.face * 0.25; }
      else { p.vx = (p.vx + dir * 0.25) * 0.94; p.vy = Math.min(p.vy, 1.3); }
      if (A.dash && p.st < 9 && globalT % 2 === 0) addAfter(p, ad ? '#f08a92' : '#9a9a9a');
      // the rising dragon: red streaks torn upward along the leap
      if (A.id === 'rising' && p.st < 14) { addP({kind: 'line', x: p.x + rnd(-8, 8) + p.face * 10, y: p.y - rnd(0, 40), vx: 0, vy: -6, life: 8, color: p.st % 2 ? C.R : C.W, size: 1.5, len: 3}); if (p.st % 3 === 0) addAfter(p, C.R); }
      const w = curWindow(A, p.st); if (w >= 0) meleeCheck(w);
      // each swing of the ground combo throws its crescent of light
      if (A.arc && w >= 0 && !(p.arcMask & (1 << w))) { p.arcMask |= 1 << w; spawnComboArc(p, A, w); }
      // adrenaline (and the trait 중검 on the ground combo): every regular swing also throws a sword wave
      const heavy = cut && tc === 'B';
      if ((ad || heavy) && w >= 0 && !(p.waveMask & (1 << w)) && !A.slam && A.id !== 'pierce') {
        p.waveMask |= 1 << w;
        spawnSlashWave(p, {hh: heavy ? 26 : 22, dmg: heavy ? 21000 : 11000, spd: 8.4, tilt: A.flat ? -0.1 : 0.3, yo: A.id === 2 ? 17 : 22});
      }
      if (p.st >= attackEnd(A) && !(A.slam && !p.landed)) {
        if (canDash) { startDash(dir); break; }
        if (p.atkBuf > 0 && startAttack(dir, K)) break;
        if (trySkill()) break;
        if (p.jumpBuf > 0 && p.onGround) { p.state = 'normal'; break; }
      }
      if (p.st >= A.dur) { p.state = 'normal'; p.comboStepT = 14; }
      break;
    }
    case 'fury': {
      p.st += spd; p.vx *= 0.8;
      if (!p.onGround) p.vy = Math.min(p.vy, 0.5);
      const k = Math.floor(p.st / 7);
      if (k < p.furyMax && p.furyN <= k && p.st - k * 7 >= 3) { furyWave(p, k); p.furyN = k + 1; }
      if (p.st > 21 && canDash) { startDash(dir); break; }
      if (p.st >= p.furyMax * 7 + 3) p.state = 'normal';
      break;
    }
    case 'plant': {
      p.st++; p.vx *= 0.7;
      if (!p.onGround) { p.vy = Math.max(p.vy, 5); p.st = Math.min(p.st, 10); }
      if (p.st >= 12 && !p.peakDone) {
        p.peakDone = true;
        shake(5); zoomPunch = 0.6; SND.sfx.impact(); dust(p.x + p.face * 10, p.y, 14);
        addP({kind: 'ring', x: p.x + p.face * 10, y: p.y, r0: 3, rMax: 26, life: 12, color: C.K, size: 2});
        // adrenaline: huge crimson greatswords erupt ahead instead of the regular line
        const more = upgLv('peak') >= 1, tp = traitOf('peak');
        // 특성 행진: the line does not stop until the edge of the screen / 검의 숲: the blades stay 3 s and keep cutting
        const march = tp === 'A' ? 40 : 0, forest = tp === 'B' ? {stay: 180, forest: true} : {};
        if (ad) { peakLine(p.x + p.face * 36, p.face, march || (more ? 12 : 9), 26, {h: 80, dh: march ? 1.5 : 4, step: 3, tilt: 0.08, extra: Object.assign({red: true, sc: 2.3, w: 16, dmg: 36000, stay: 24}, forest)}); shake(8); flash = {a: 0.3, color: C.R}; }
        else peakLine(p.x + p.face * 30, p.face, march || (more ? 14 : 10), 22, {dh: march ? 1 : 2.5, extra: forest});
      }
      if (p.st >= 34) p.state = 'normal';
      break;
    }
    case 'dash':
      p.st++; p.vx = p.dashDir * 7 * (ad ? 1.25 : 1); p.vy = 0;
      if (canJust(p) && threatNear(p)) justDodge();
      if (p.st % 3 === 0) addAfter(p, ad ? '#f08a92' : '#9a9a9a');
      if (p.onGround && p.st % 2 === 0) addP({x: p.x - p.dashDir * 6, y: p.y - 1, vx: -p.dashDir * rnd(0.5, 1.5), vy: -rnd(0.2, 0.8), g: 0.03, life: 14, color: '#8a8a8a', size: 2, drag: 0.92});
      if (ad) hitIn([p.x - 12, p.y - 36, p.x + 12, p.y], 'dash', 18000, {stop: 1, sp: 1}, 0);
      if (PR.attack) { startAttack(p.dashDir, K); break; }
      if (trySkill(['fury', 'flash', 'swallow'])) break;
      if (p.st >= 12) { p.state = 'normal'; p.vx = p.dashDir * 2.4 * mv; p.pierceT = 8; }
      break;
    case 'rain': p.st++; p.vx *= 0.7; if (p.st >= RAIN.cast) p.state = 'normal'; break;
    case 'hurt': p.st++; p.vx *= 0.9; if (p.st >= 18) p.state = 'normal'; break;
    case 'charge':
      p.vx *= 0.7; p.chargeT += ad ? 1.6 : 1; SND.chargeSet(p.chargeT / 70);
      if (globalT % 2 === 0) addP({kind: 'bolt', x: p.x + rnd(-14, 14), y: p.y - rnd(4, 44), life: 5, color: C.Y});
      if (!K.special) { p.state = 'normal'; SND.chargeStop(); break; }
      if (p.chargeT >= 70) { SND.chargeStop(); startSpecial(); return; }
      break;
    case 'dead': p.vx *= 0.92; break;
  }
  // sword smear trail
  const A = p.atk;
  // (the ground combo's swings draw their crescents instead of the blade smear)
  const swinging = p.state === 'fury' || (p.state === 'attack' && !A.arc && A.id !== 5 && (curWindow(A, p.st) >= 0 || (A.slam && p.st >= 5 && !p.landed)));
  for (const a of p.arcs) { a.t++; if (a.spark && a.t === 2) arcSparks(p, a); }
  if (p.arcs.length) p.arcs = p.arcs.filter(a => a.t < a.life);
  if (swinging) { const q = playerPose(p); p.trail.push(swordLine(p.x, p.y, q.flip ? -p.face : p.face, q, SWORD_LEN)); if (p.trail.length > 7) p.trail.shift(); }
  else if (p.trail.length) p.trail.shift();

  if (p.state !== 'dash' && p.state !== 'flash' && p.state !== 'swallow' && !(p.state === 'attack' && p.atk.id === 'pierce' && p.st < 12)) {
    if (p.jumping && !K.jump && p.vy < -1.5) p.vy += 0.35;
    p.vy = Math.min(p.state === 'attack' && p.atk.slam ? 8 : 7, p.vy + GRAV);
  }
  if (p.vy >= 0) p.jumping = false;
  const y0 = p.y, vy0 = p.vy;
  p.x += p.vx; p.y += p.vy;
  if (p.x < 8) { p.x = 8; p.vx = 0; } else if (p.x > W - 8) { p.x = W - 8; p.vx = 0; }
  const was = p.onGround;
  p.onGround = false; p.onPlatform = false;
  if (p.y >= FLOOR) { p.y = FLOOR; p.vy = 0; p.onGround = true; }
  else if (p.vy >= 0 && p.dropT <= 0) {
    for (const pl of platforms) if (pl.on && p.x > pl.x1 - 2 && p.x < pl.x2 + 2 && y0 <= pl.y && p.y >= pl.y) { p.y = pl.y; p.vy = 0; p.onGround = true; p.onPlatform = true; break; }
  }
  if (p.onGround) {
    if (!was && p.state !== 'dead') { dust(p.x, p.y, 4); if (vy0 > 3 && p.state === 'normal') p.landT = 8; }
    p.jumps = 0; p.airDash = true; p.airAtk = 0; p.coyote = 6; p.flipT = 0;
  } else if (p.coyote > 0) p.coyote--;
}

/* ---------- player-made hazards: slam shockwaves, sword waves, sword mountain ---------- */
function updateWaves() {
  for (let i = waves.length - 1; i >= 0; i--) {
    const w = waves[i]; w.t++; w.x += w.dir * 6.5;
    const box = [w.x - 9, w.y - 28, w.x + 9, w.y];
    hitIn(box, 'wave', 22000, {sp: 2, stop: 2}, 0, w.hitSet);
    parryIn(box);
    if (w.t % 2 === 0) addP({x: w.x - w.dir * 6, y: w.y - 1, vx: -w.dir * rnd(0.5, 1.5), vy: -rnd(0.5, 2), g: 0.1, life: 14, color: C.K, size: 2});
    if (w.t > 34 || w.x < -10 || w.x > W + 10) waves.splice(i, 1);
  }
  for (let i = slashWaves.length - 1; i >= 0; i--) {
    const s = slashWaves[i]; s.t++;
    // 특성 회귀: out, a stop, and back the way it came - cutting again on the way back
    if (s.ret) {
      const turn = 22, k = clamp(Math.abs(s.t - turn) / 8, 0.1, 1);
      if (s.t === turn) { s.dir = -s.dir; s.hitSet = new Set(); SND.sfx.whoosh(); }
      s.x += s.dir * s.spd * k;
    } else s.x += s.dir * s.spd;
    const hh = s.hh, box = [s.x - (s.cross ? hh * 0.6 : 12), s.y - hh, s.x + (s.cross ? hh * 0.6 : 12), s.y + hh];
    hitIn(box, 'sw', s.dmg, {sp: 2, stop: 2}, Math.PI / 2 + s.tilt, s.hitSet);
    parryIn(box);
    // crimson shards peel off the arc and tumble away
    if (s.t % 2 === 0 || hh > 34) {
      const u = rnd(-1, 1), ax = s.x + s.dir * (1 - u * u) * hh * 0.45;
      addP({kind: 'shard', x: ax, y: s.y + u * hh, vx: s.dir * rnd(0.5, 3.5), vy: u * rnd(0.5, 2.2), drag: 0.93, life: ri(16, 28), size: rnd(1.8, hh > 34 ? 5 : 4), ang: rnd(TAU), spin: rnd(-0.3, 0.3)});
    }
    if (s.t % 3 === 0) addP({kind: 'line', x: s.x - s.dir * 10, y: s.y + rnd(-hh, hh) * 0.7, vx: -s.dir * 2.5, vy: 0, life: 7, color: C.R, size: 1, len: 3});
    if (s.t > (s.ret ? 60 : 46) || s.x < -hh - 20 || s.x > W + hh + 20) slashWaves.splice(i, 1);
  }
  for (let i = delayed.length - 1; i >= 0; i--) {
    const d = delayed[i];
    if (--d.time > 0) continue;
    delayed.splice(i, 1);
    const t = d.t;
    if (t === boss ? !bossHittable() : (scene !== 'practice' || !dummies.includes(t))) continue;
    cutFx(t.x, t.y - 22, 0.6); cutFx(t.x, t.y - 22, -0.6); SND.sfx.slash();
    dealDamage(45000, t.x, t.y - 24, {stop: 4, sp: 2}, t);
  }
}
function updatePeaks() {
  for (let i = peaks.length - 1; i >= 0; i--) {
    const k = peaks[i]; k.t++;
    if (k.t < 0) continue;
    const stay = k.stay || 18, w = k.w || 8;
    if (k.t === 1) {
      dust(k.x, FLOOR, 6); if (i % 2 === 0) SND.sfx.bladeFire();
      for (let j = 0; j < (k.red ? 8 : 4); j++) addP({x: k.x + rnd(-w, w), y: FLOOR - 2, vx: rnd(-2.5, 2.5), vy: -rnd(1.5, 4), g: 0.2, life: 22, color: k.red && j % 2 ? C.R : C.K, size: 2, bounce: true});
      if (k.red) { shake(3); for (let j = 0; j < 4; j++) addP({kind: 'shard', x: k.x, y: FLOOR - rnd(10, k.h), vx: rnd(-3, 3), vy: -rnd(1, 3), drag: 0.93, life: ri(18, 28), size: rnd(2.5, 4.5), ang: rnd(TAU), spin: rnd(-0.3, 0.3)}); }
    }
    if (k.red && k.t === 4 && i % 2 === 0) addP({kind: 'glint', x: k.x + Math.sin(k.tilt * 0.8) * k.h, y: FLOOR - k.h, life: 12, size: 6, rim: C.R});
    k.grow = k.t < 4 ? k.t / 4 : k.t > stay ? Math.max(0, 1 - (k.t - stay) / 6) : 1;
    // 특성 검의 숲: after the first cut, the standing blade cuts again every 24 frames, lighter
    if (k.forest && k.t > 4 && k.t < stay && k.t % 24 === 0) { k.hitSet = new Set(); k.tick = true; if (i % 3 === 0) addP({kind: 'glint', x: k.x + Math.sin(k.tilt) * k.h, y: FLOOR - k.h, life: 10, size: 4}); }
    const pdmg = k.tick ? (k.red ? 11000 : 6000) : k.dmg || 20000;
    if (k.grow > 0.5) hitIn([k.x - w, FLOOR - k.h * k.grow, k.x + w, FLOOR + 2], 'pk', pdmg, {sp: k.tick ? 1 : 2, stop: k.tick ? 0 : k.red ? 4 : 2, quiet: k.tick}, Math.PI / 2, k.hitSet);
    if (k.t > stay + 6) peaks.splice(i, 1);
  }
}
