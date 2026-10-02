/* ---------- mini stage: the Sovereign's chain-bound minions ----------
   before each boss the hero fights three waves of them in the boss's own region.
   crawler: a shadow beast that stalks and lunges. bat: circles overhead and swoops.
   reaper: blinks behind you and swings a crimson scythe. crystal: an ice eye that fires shard volleys.
   knight: a shielded soldier - frontal sword hits glance off; hit it from behind, pierce it, or punish its thrust. */
const MOB = {
  crawler: {hp: 170000, bw: 13, bh: 18, dmg: 8, gold: 40},
  bat: {hp: 90000, bw: 9, bh: 8, dmg: 6, gold: 30, fly: true},
  reaper: {hp: 250000, bw: 9, bh: 34, dmg: 10, gold: 60},
  crystal: {hp: 340000, bw: 15, bh: 32, dmg: 8, gold: 70},
  knight: {hp: 400000, bw: 10, bh: 34, dmg: 11, gold: 80},
};
const WAVES = {
  bow: [[['crawler', 3]], [['crawler', 3], ['bat', 2]], [['crawler', 3], ['crawler', 1, {big: true}], ['bat', 1]]],
  gun: [[['reaper', 2], ['crawler', 2]], [['reaper', 3], ['bat', 2]], [['reaper', 2], ['crawler', 2], ['crawler', 1, {big: true}]]],
  sword: [[['crawler', 3], ['crystal', 1]], [['crystal', 2], ['bat', 3]], [['crystal', 2], ['crawler', 3], ['reaper', 1]]],
  chain: [[['knight', 2], ['crawler', 2]], [['knight', 2], ['reaper', 2]], [['knight', 2], ['knight', 1, {big: true}], ['bat', 2]]],
};
const liveMobs = () => mobs.filter(m => m.hp > 0 && m.state !== 'spawn');
function mobBox(m) {
  const d = MOB[m.type], s = m.s;
  return d.fly ? [m.x - d.bw * s, m.y - d.bh * s, m.x + d.bw * s, m.y + d.bh * s] : [m.x - d.bw * s, m.y - d.bh * s, m.x + d.bw * s, m.y];
}
const setMob = (m, st) => { m.state = st; m.st = 0; };
function spawnMob(type, x, o = {}) {
  const d = MOB[type], big = !!o.big, s = big ? 1.6 : 1, hp = d.hp * (big ? 3 : 1) * DIFF[settings.diff].hp;
  const y = d.fly ? rnd(110, 150) : type === 'reaper' ? FLOOR - 3 : FLOOR;
  const m = {mob: true, id: 'm' + (mobSeq++), type, x, y, baseY: y, vx: 0, vy: 0, face: x < player.x ? 1 : -1, hp, maxHp: hp,
    state: 'spawn', st: 0, flash: 0, hurt: 0, cd: rnd(40, 90), s, big, t: ri(0, 100), alpha: 0, dead: 0, blockT: 0};
  mobs.push(m);
  addP({kind: 'ring', x, y: y - 14 * s, r0: 4, rMax: 26 * s, life: 18, color: C.R, size: 2});
  for (let i = 0; i < 8; i++) { const a = rnd(TAU); addP({kind: 'line', x: x + Math.cos(a) * 20, y: y - 14 * s + Math.sin(a) * 16, vx: -Math.cos(a) * 2, vy: -Math.sin(a) * 2, life: 10, color: i % 2 ? C.R : C.K, size: 1, len: 2}); }
  return m;
}
function startWave(i) {
  const list = WAVES[stage.key][i];
  wave = {i, n: WAVES[stage.key].length, t: 0, queue: [], clearT: -1, done: false, doneT: 0};
  let k = 0;
  for (const [type, n, o] of list) for (let j = 0; j < n; j++, k++) {
    const side = k % 2 ? 1 : -1;
    const x = type === 'crystal' ? clamp(player.x + side * rnd(120, 170), 40, W - 40) : side > 0 ? rnd(W - 70, W - 24) : rnd(24, 70);
    wave.queue.push({type, x, o: o || {}, at: 20 + k * 14});
  }
  bigText = {s: 'WAVE ' + (i + 1) + ' / ' + wave.n, t: 0, dur: 60, color: C.R};
  SND.sfx.warn();
}
function killMob(m) {
  stats.kills++; SND.sfx.brk(); shake(m.big ? 6 : 3);
  for (let i = 0; i < (m.big ? 16 : 9); i++) addP({kind: 'shard', x: m.x + rnd(-8, 8), y: m.y - 12 * m.s + rnd(-8, 8), vx: rnd(-3, 3), vy: -rnd(1, 4), drag: 0.94, life: ri(18, 32), size: rnd(2, 4.5), ang: rnd(TAU), spin: rnd(-0.3, 0.3), blue: m.type === 'crystal'});
  addP({kind: 'ring', x: m.x, y: m.y - 12 * m.s, r0: 4, rMax: 24 * m.s, life: 12, color: C.K, size: 2});
  const coins = m.big ? 4 : m.type === 'bat' ? 1 : 2;
  for (let i = 0; i < coins; i++) items.push({x: m.x, y: m.y - 16, vx: rnd(-2, 2), vy: rnd(-4.5, -2), kind: 'coin', t: 0});
}
/* damage from the hero; the knight's shield turns aside frontal sword hits */
function mobTakeHit(m, dmg, o) {
  const p = player;
  if (m.type === 'knight' && o.melee && !o.pierce && m.state !== 'rest' && Math.sign(p.x - m.x) === m.face && p.y > m.y - 40) {
    dmg = Math.round(dmg * 0.15);
    if (m.blockT <= 0) { floatText('막힘', m.x + m.face * 12, m.y - 44, C.W, 1, 30, C.K); SND.sfx.parry(); m.blockT = 12; }
    sparks(m.x + m.face * 12, m.y - 22);
  } else if (!m.big && m.type !== 'crystal' && m.type !== 'bat') { m.hurt = 12; m.vx = Math.sign(m.x - p.x || 1) * 3; if (m.state === 'wind' || m.state === 'swing' || m.state === 'thrust') setMob(m, 'move'); }
  m.hp = Math.max(0, m.hp - dmg); m.flash = 8;
  if (m.hp <= 0) killMob(m);
  return dmg;
}
function mobHits(m, box, dmg, kx, ky) { if (inCombat() && overlap(box, [player.x - 5, player.y - 34, player.x + 5, player.y])) tryHurt(dmg, kx, ky); }

function updateMobs() {
  const p = player;
  if (wave) {
    wave.t++;
    for (let i = wave.queue.length - 1; i >= 0; i--) { const q = wave.queue[i]; if (wave.t >= q.at) { spawnMob(q.type, q.x, q.o); wave.queue.splice(i, 1); } }
  }
  for (let i = mobs.length - 1; i >= 0; i--) {
    const m = mobs[i], d = MOB[m.type];
    m.st++; m.t++;
    if (m.flash > 0) m.flash--;
    if (m.blockT > 0) m.blockT--;
    if (m.hp <= 0) { if (++m.dead > 20) mobs.splice(i, 1); continue; }
    if (m.state === 'spawn') { m.alpha = Math.min(1, m.st / 18); if (m.st > 22) setMob(m, 'move'); continue; }
    m.alpha = m.state === 'blink' ? (m.st < 8 ? 0 : 1) : 1;
    if (m.hurt > 0) { m.hurt--; m.vx *= 0.8; m.x = clamp(m.x + m.vx, 12, W - 12); continue; }
    const dx = p.x - m.x, adx = Math.abs(dx), dmg = Math.round(d.dmg * (m.big ? 1.4 : 1)), fb = () => m.face > 0 ? [m.x - 4, m.y - 40 * m.s, m.x + 46 * m.s, m.y + 2] : [m.x - 46 * m.s, m.y - 40 * m.s, m.x + 4, m.y + 2];
    switch (m.type) {
      case 'crawler':
        if (m.state === 'move') { m.face = Math.sign(dx) || m.face; m.vx = lerp(m.vx, m.face * (m.big ? 1.1 : 1.5), 0.1); if (--m.cd <= 0 && adx < (m.big ? 96 : 72)) setMob(m, 'wind'); }
        else if (m.state === 'wind') { m.vx *= 0.8; if (m.st >= (m.big ? 26 : 20)) { setMob(m, 'lunge'); m.vx = m.face * (m.big ? 6.2 : 5.4); SND.sfx.dash(); } }
        else if (m.state === 'lunge') { mobHits(m, mobBox(m), dmg, m.face * 4, -3); if (m.st >= 12) setMob(m, 'rest'); }
        else if (m.state === 'rest') { m.vx *= 0.85; if (m.st >= 28) { setMob(m, 'move'); m.cd = rnd(40, 90); } }
        m.x = clamp(m.x + m.vx, 12, W - 12);
        break;
      case 'bat':
        if (m.state === 'move' || m.state === 'wind') {
          const tx = p.x + Math.sin(m.t * 0.02 + m.id.length) * 90;
          m.vx = lerp(m.vx, clamp((tx - m.x) * 0.02, -1.6, 1.6), 0.1); m.x = clamp(m.x + m.vx, 12, W - 12); m.y = m.baseY + Math.sin(m.t * 0.08) * 8;
          m.face = Math.sign(dx) || m.face;
          if (m.state === 'move' && --m.cd <= 0) { setMob(m, 'wind'); SND.sfx.beep(); }
          if (m.state === 'wind' && m.st >= 18) { setMob(m, 'dive'); const a = Math.atan2(p.y - 18 - m.y, dx); m.vx = Math.cos(a) * 5; m.vy = Math.sin(a) * 5; }
        } else if (m.state === 'dive') {
          m.x = clamp(m.x + m.vx, 12, W - 12); m.y += m.vy; mobHits(m, mobBox(m), dmg, Math.sign(m.vx) * 3, -2.5);
          if (m.st >= 26 || m.y >= FLOOR - 8) { setMob(m, 'rise'); m.vy = Math.min(m.vy, 0); }
        } else if (m.state === 'rise') {
          m.vy = lerp(m.vy, -2.2, 0.12); m.y += m.vy; m.vx *= 0.95; m.x = clamp(m.x + m.vx, 12, W - 12);
          if (m.y <= m.baseY) { m.y = m.baseY; m.vy = 0; setMob(m, 'move'); m.cd = rnd(90, 150); }
        }
        break;
      case 'reaper':
        m.y = m.baseY + Math.sin(m.t * 0.07) * 2;
        if (m.state === 'move') { m.face = Math.sign(dx) || m.face; m.vx = lerp(m.vx, m.face * 1.0, 0.08); m.x = clamp(m.x + m.vx, 12, W - 12); if (--m.cd <= 0 && adx < 120) setMob(m, 'blink'); }
        else if (m.state === 'blink') {
          if (m.st === 1) wisp(m.x, m.y);
          if (m.st === 8) { m.x = clamp(p.x - p.face * 34, 16, W - 16); m.face = Math.sign(p.x - m.x) || 1; wisp(m.x, m.y); }
          if (m.st >= 10) setMob(m, 'wind');
        } else if (m.state === 'wind') { m.vx = 0; if (m.st === 6) glint(m.x + m.face * 14, m.y - 40, 6); if (m.st >= 22) { setMob(m, 'swing'); SND.sfx.slash(); } }
        else if (m.state === 'swing') { mobHits(m, fb(), dmg, m.face * 5, -3.5); if (m.st >= 8) setMob(m, 'rest'); }
        else if (m.state === 'rest') { if (m.st >= 34) { setMob(m, 'move'); m.cd = rnd(50, 100); } }
        break;
      case 'crystal':
        m.face = Math.sign(dx) || m.face;
        if (m.state === 'move' && --m.cd <= 0) setMob(m, 'wind');
        else if (m.state === 'wind' && m.st >= 30) {
          const a0 = Math.atan2(p.y - 17 - (m.y - 22), dx);
          for (const o of [-0.2, 0, 0.2]) newArrow(m.x + Math.cos(a0 + o) * 12, m.y - 22 + Math.sin(a0 + o) * 12, Math.cos(a0 + o) * 4.4, Math.sin(a0 + o) * 4.4, 'ice', 8);
          SND.sfx.bladeFire(); setMob(m, 'move'); m.cd = rnd(90, 130);
        }
        break;
      case 'knight':
        if (m.state === 'move') { m.face = Math.sign(dx) || m.face; m.vx = lerp(m.vx, m.face * (m.big ? 0.7 : 0.85), 0.08); if (--m.cd <= 0 && adx < 54 * m.s) setMob(m, 'wind'); }
        else if (m.state === 'wind') { m.vx *= 0.7; if (m.st === 8) glint(m.x + m.face * 16, m.y - 24 * m.s, 6); if (m.st >= 20) { setMob(m, 'thrust'); m.vx = m.face * 3; SND.sfx.pierce(); } }
        else if (m.state === 'thrust') { mobHits(m, fb(), dmg, m.face * 5, -3); if (m.st >= 8) setMob(m, 'rest'); }
        else if (m.state === 'rest') { m.vx *= 0.8; if (m.st >= 32) { setMob(m, 'move'); m.cd = rnd(30, 70); } }
        m.x = clamp(m.x + m.vx, 12, W - 12);
        break;
    }
    // touching a crawler or knight on the move stings a little
    if ((m.type === 'crawler' || m.type === 'knight') && m.state === 'move' && m.t % 20 === 0) mobHits(m, mobBox(m), 4, Math.sign(p.x - m.x || 1) * 3, -2);
  }
}

/* ---------- drawing ---------- */
function drawMobs() {
  for (const m of mobs) {
    if (m.alpha <= 0) continue;
    const s = m.s, hit = m.flash > 0 && (m.flash & 2), col = hit ? C.W : C.K, rim = hit ? C.R : C.W;
    ctx.globalAlpha = m.hp <= 0 ? Math.max(0, 1 - m.dead / 20) : m.alpha;
    ctx.save(); ctx.translate(Math.round(m.x), Math.round(m.y)); ctx.scale(m.face * s, s);
    ctx.lineCap = 'round';
    if (m.type === 'crawler') {
      const w = m.state === 'wind' ? Math.sin(m.st * 1.3) * 1 : 0, lg = Math.sin(m.t * 0.35) * 3;
      ctx.strokeStyle = rim; ctx.lineWidth = 4; for (const [x0, ph] of [[-8, 0], [-3, 1], [3, 0], [8, 1]]) poly([[x0, -9], [x0 + (ph ? lg : -lg) + 2, -3], [x0 + (ph ? lg : -lg) + 4, 0]]);
      ctx.strokeStyle = col; ctx.lineWidth = 2; for (const [x0, ph] of [[-8, 0], [-3, 1], [3, 0], [8, 1]]) poly([[x0, -9], [x0 + (ph ? lg : -lg) + 2, -3], [x0 + (ph ? lg : -lg) + 4, 0]]);
      ctx.fillStyle = C.R; for (const [x0, ph] of [[-8, 0], [-3, 1], [3, 0], [8, 1]]) ctx.fillRect(x0 + (ph ? lg : -lg) + 3, -1, 3, 2);
      ctx.fillStyle = rim; ctx.beginPath(); ctx.ellipse(w, -11, 13.5, 8.5, 0, 0, TAU); ctx.fill();
      ctx.fillStyle = col; ctx.beginPath(); ctx.ellipse(w, -11, 12, 7.2, 0, 0, TAU); ctx.fill();
      ctx.fillStyle = col; for (const hx of [4, 9]) { ctx.beginPath(); ctx.moveTo(hx - 2, -16); ctx.quadraticCurveTo(hx + 1, -24, hx + 5, -25); ctx.lineTo(hx + 1, -16); ctx.fill(); }
      ctx.fillStyle = C.R; for (const hx of [4, 9]) ctx.fillRect(hx + 3, -25, 2, 2);
      ctx.fillStyle = m.state === 'wind' && (m.st & 2) ? C.W : C.R; ctx.fillRect(8, -13, 2, 2); ctx.fillRect(12, -13, 2, 2);
    } else if (m.type === 'bat') {
      const f = Math.sin(m.t * 0.45) * (m.state === 'dive' ? 0.3 : 1);
      for (const sd of [1, -1]) {
        ctx.fillStyle = rim; ctx.beginPath(); ctx.moveTo(0, -1); ctx.lineTo(sd * 13, -6 - f * 6); ctx.lineTo(sd * 9, 2); ctx.lineTo(sd * 4, 3); ctx.closePath(); ctx.fill();
        ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(0, -1); ctx.lineTo(sd * 12, -5 - f * 6); ctx.lineTo(sd * 8, 1); ctx.lineTo(sd * 4, 2); ctx.closePath(); ctx.fill();
        ctx.strokeStyle = C.R; ctx.lineWidth = 1; poly([[sd * 12, -5 - f * 6], [sd * 8, 1]]);
      }
      ctx.fillStyle = rim; disc(0, 0, 5.5); ctx.fillStyle = col; disc(0, 0, 4.5);
      ctx.fillStyle = m.state === 'wind' ? C.W : C.R; ctx.fillRect(1, -2, 2, 2); ctx.fillRect(-2, -2, 2, 2);
    } else if (m.type === 'reaper') {
      const up = m.state === 'wind' ? 1 : 0, sw = m.state === 'swing' ? Math.min(1, m.st / 4) : 0;
      // scythe behind/over the shoulder, swinging round on the attack
      const sa = lerp(up ? -2.4 : -1.2, 1.2, sw), hx = 6, hy = -24, tx = hx + Math.cos(sa - Math.PI / 2) * 30, ty = hy + Math.sin(sa - Math.PI / 2) * 30;
      ctx.strokeStyle = rim; ctx.lineWidth = 3.5; poly([[hx - (tx - hx) * 0.2, hy - (ty - hy) * 0.2], [tx, ty]]);
      ctx.strokeStyle = C.K; ctx.lineWidth = 2; poly([[hx - (tx - hx) * 0.2, hy - (ty - hy) * 0.2], [tx, ty]]);
      ctx.save(); ctx.translate(tx, ty); ctx.rotate(sa); ctx.fillStyle = C.K; ctx.beginPath(); ctx.moveTo(0, 0); ctx.quadraticCurveTo(16, -4, 22, 8); ctx.quadraticCurveTo(12, 0, 0, 3); ctx.fill();
      ctx.fillStyle = C.R; ctx.beginPath(); ctx.moveTo(1, 1); ctx.quadraticCurveTo(14, -2, 20, 7); ctx.quadraticCurveTo(12, 1.5, 1, 2.5); ctx.fill(); ctx.restore();
      ctx.fillStyle = rim; ctx.beginPath(); ctx.moveTo(-1, -40); ctx.quadraticCurveTo(10, -38, 9, -24); ctx.lineTo(13, 0); ctx.lineTo(-13, 0); ctx.lineTo(-9, -24); ctx.quadraticCurveTo(-11, -38, -1, -40); ctx.fill();
      ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(-1, -39); ctx.quadraticCurveTo(9, -37, 8, -24); ctx.lineTo(12, -1); ctx.lineTo(-12, -1); ctx.lineTo(-8, -24); ctx.quadraticCurveTo(-10, -37, -1, -39); ctx.fill();
      ctx.fillStyle = C.R; ctx.fillRect(3, -32, 2, 2); ctx.fillRect(6, -32, 2, 2);
      if (sw > 0 && sw < 1) { ctx.globalAlpha *= 0.8; drawSwoosh(4, -24, 1, -2.2, 1.9, 34, 11, C.R); }
    } else if (m.type === 'crystal') {
      const glow = m.state === 'wind' ? m.st / 30 : 0;
      if (glow) { ctx.fillStyle = C.B; ctx.globalAlpha *= 0.4 + glow * 0.4; disc(0, -20, 16 + glow * 6); ctx.globalAlpha = m.alpha; }
      for (const [x0, h, w] of [[-10, 22, 7], [9, 26, 8], [-3, 34, 9], [4, 18, 6]]) {
        ctx.fillStyle = rim === C.R ? C.R : C.B; ctx.beginPath(); ctx.moveTo(x0 - w - 1, 1); ctx.lineTo(x0, -h - 2); ctx.lineTo(x0 + w + 1, 1); ctx.fill();
        ctx.fillStyle = hit ? C.W : '#c8d2f4'; ctx.beginPath(); ctx.moveTo(x0 - w, 0); ctx.lineTo(x0, -h); ctx.lineTo(x0 + w, 0); ctx.fill();
        ctx.fillStyle = C.W; ctx.beginPath(); ctx.moveTo(x0 - w * 0.2, -2); ctx.lineTo(x0, -h + 3); ctx.lineTo(x0 + w * 0.5, -2); ctx.fill();
      }
      ctx.fillStyle = C.K; ctx.beginPath(); ctx.ellipse(-1, -16, 6, 4, 0, 0, TAU); ctx.fill();
      ctx.fillStyle = C.R; disc(0, -16, 2.2);
    }
    ctx.restore(); ctx.globalAlpha = m.hp <= 0 ? Math.max(0, 1 - m.dead / 20) : m.alpha;
    if (m.type === 'knight') {
      // an armoured stick soldier: plumed helm, round shield on the front arm, a short sword
      const thr = m.state === 'thrust' ? Math.min(1, m.st / 3) : 0, wind = m.state === 'wind';
      const q = makePose({hy: -16, lean: wind ? -0.15 : 0.1 + thr * 0.3, l1: -0.4, r1: 0.45, r2: -0.2, fu: wind ? 0.2 : 1.0 + thr * 0.5, ff: wind ? 0.4 : 0.1, bu: wind ? -1.4 : lerp(-0.4, 1.4, thr), bf: wind ? 1.2 : 0.1});
      const P = drawFigure(m.x, m.y, m.face, q, {sc: s, color: col, outline: rim, t: m.t});
      ctx.fillStyle = C.Y; ctx.beginPath(); ctx.moveTo(P.head[0] - m.face * 2 * s, P.head[1] - 4 * s); ctx.quadraticCurveTo(P.head[0] - m.face * 9 * s, P.head[1] - 11 * s, P.head[0] - m.face * 12 * s, P.head[1] - 3 * s); ctx.lineTo(P.head[0], P.head[1] - 3 * s); ctx.fill();
      ctx.fillStyle = C.W; ctx.fillRect(Math.round(P.head[0] - 4 * s), Math.round(P.head[1] - 1 * s), Math.round(8 * s), Math.max(1, Math.round(1.2 * s)));
      const sx = P.handF[0] + m.face * 2 * s, sy = P.handF[1];
      ctx.fillStyle = C.K; disc(sx, sy, 8 * s); ctx.fillStyle = m.state === 'rest' ? '#9a9a9a' : C.W; disc(sx, sy, 6.8 * s);
      ctx.fillStyle = C.R; ctx.fillRect(Math.round(sx - 1 * s), Math.round(sy - 5 * s), Math.max(1, Math.round(2 * s)), Math.round(10 * s)); ctx.fillRect(Math.round(sx - 4 * s), Math.round(sy - 1.5 * s), Math.round(8 * s), Math.max(1, Math.round(2 * s)));
      const vx = P.handB[0] - P.elbB[0], vy = P.handB[1] - P.elbB[1], L = Math.hypot(vx, vy) || 1;
      drawBlade(P.handB[0], P.handB[1], vx / L, vy / L, 20 * s, 3 * s, C.K, C.W, s);
    }
    ctx.globalAlpha = 1;
    // health bar once hurt
    if (m.hp > 0 && m.hp < m.maxHp && m.state !== 'spawn') {
      const b = mobBox(m), w = Math.max(18, (b[2] - b[0]) * 0.9), x = Math.round(m.x - w / 2), y = Math.round(b[1] - 7);
      ctx.fillStyle = C.K; ctx.fillRect(x - 1, y - 1, Math.round(w) + 2, 4); ctx.fillStyle = C.R; ctx.fillRect(x, y, Math.round(w * m.hp / m.maxHp), 2);
    }
  }
}
function drawIce(a) {
  const ang = Math.atan2(a.vy, a.vx), c = Math.cos(ang), s = Math.sin(ang);
  ctx.save(); ctx.translate(a.x, a.y); ctx.rotate(ang);
  ctx.fillStyle = C.K; ctx.beginPath(); ctx.moveTo(7, 0); ctx.lineTo(-2, -3.5); ctx.lineTo(-7, 0); ctx.lineTo(-2, 3.5); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#c8d2f4'; ctx.beginPath(); ctx.moveTo(5.5, 0); ctx.lineTo(-2, -2.3); ctx.lineTo(-5.5, 0); ctx.lineTo(-2, 2.3); ctx.closePath(); ctx.fill();
  ctx.fillStyle = C.W; ctx.fillRect(0, -1, 3, 1);
  ctx.restore();
  if (a.age % 3 === 0) addP({x: a.x - c * 6, y: a.y - s * 6, vx: rnd(-0.3, 0.3), vy: rnd(-0.3, 0.3), life: 8, color: C.B, size: 1});
}
