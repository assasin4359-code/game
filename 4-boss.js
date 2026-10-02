/* ---------- boss: Rapid Fire Bowmaster ---------- */
const bowPos = b => [b.x + b.face * 9, b.y - 25];
function aimAt(b, tx, ty) { const [x, y] = bowPos(b); return Math.atan2(ty - y, tx - x); }
function newArrow(x, y, vx, vy, kind = 'arrow', dmg = 10) { const a = {x, y, vx, vy, kind, dmg, age: 0, stuck: 0, trail: []}; arrows.push(a); return a; }
function fireArrow(b, ang, spd, kind = 'arrow', silent = false) {
  const [x, y] = bowPos(b);
  newArrow(x + Math.cos(ang) * 10, y + Math.sin(ang) * 10, Math.cos(ang) * spd, Math.sin(ang) * spd, kind);
  b.releaseT = 5;
  if (!silent) SND.sfx.arrow();
}
function fan(b, n, spread, spd) { for (let i = 0; i < n; i++) fireArrow(b, b.aim + (i / (n - 1) - 0.5) * 2 * spread, spd, 'arrow', i > 0); }
function rainXs(n, px) {
  const xs = [clamp(px + rnd(-6, 6), 12, W - 12)];
  for (let tries = 0; xs.length < n && tries < 300; tries++) { const x = rnd(14, W - 14); if (xs.every(v => Math.abs(v - x) >= 30)) xs.push(x); }
  return xs;
}
function pickAttack() {
  const P2 = boss.phase === 2;
  const table = P2
    ? [['rapid', 1.6], ['rain', 1.2], ['lock', 1.3], ['leap', 1.1], ['homing', 1.6], ['vines', 1.8], ['spiral', 1.4], ['groundshot', 1.3], ['split', 1.3], ['gale', 1.4]]
    : [['rapid', 2.4], ['rain', 1.6], ['lock', 1.6], ['leap', 1.4], ['spiral', 1.2], ['groundshot', 1.4], ['split', 1.2], ['gale', 1.3]];
  const opts = table.filter(e => e[0] !== boss.lastAtk);
  let r = Math.random() * opts.reduce((s, e) => s + e[1], 0);
  for (const [n, w] of opts) if ((r -= w) <= 0) return n;
  return opts[0][0];
}
function bossAttack(name) { boss.state = name; boss.st = 0; boss.lastAtk = name; boss.closeT = 0; }
// whose moves the boss is using right now (b.mimic: another boss's, if one ever borrows them)
const bkind = b => b.mimic || b.kind;
function calmBoss(b) {
  b.drawing = false; b.spin = 0; b.fly = false; b.kneel = false; b.alpha = 1; b.launcher = false; b.gold = 0; b.reticle = null; b.lines = []; b.roll = 0;
  b.sheathed = false; b.stance = false; b.dashing = false; b.hitOn = false; b.diving = false; b.clones = []; b.mark = null; b.safe = null; b.swing = 0;
  b.lashSeq = null; b.sig = null; b.spokeL = 0; b.spokesLive = false; b.slashAt = null; b.mimic = null;
}
function bossIdle(delay) {
  const b = boss;
  b.state = 'idle'; b.st = 0; calmBoss(b);
  b.next = (delay != null ? delay : (b.phase === 2 ? rnd(26, 48) : rnd(42, 72))) * DIFF[settings.diff].tempo;
}
function stunBoss(dur = 150, silent = false) {
  const b = boss;
  if (b.hp <= 0 || b.state === 'dead' || b.state === 'script' || b.state === 'ult') return;
  if (b.state === 'lock' || lockon) lockon = null;
  b.state = 'stun'; b.st = 0; b.stunDur = dur; b.breakMeter = 0; b.breakCd = dur + 360; calmBoss(b); b.queue = null;
  if (!silent) { bigText = {s: '브레이크!', t: 0, dur: 60, color: C.Y}; SND.sfx.brk(); }
}
/* the boss's own body is a weapon right now (dash kick, sweep, pistol whip): used by the just-dodge check */
function bossLethal() {
  const b = boss;
  const k = bkind(b);
  if (k === 'gun') return gunLethal(b);
  if (k === 'sword') return swordLethal(b);
  if (k === 'chain') return chainLethal(b);
  if (k === 'origin') return originLethal(b);
  return (b.state === 'gale' && b.st > galeTele(b.phase === 2) && b.fired !== -1) || (b.state === 'sweep' && b.st >= 16 && b.st <= 25);
}
function stepX() {
  const p = player, room = s => s > 0 ? W - 30 - p.x : p.x - 30;
  let side = room(1) > room(-1) ? 1 : -1;
  if (Math.random() < 0.3 && room(-side) > 110) side = -side;
  return clamp(p.x + side * rnd(110, 170), 30, W - 30);
}
function bossPhysics() {
  const b = boss;
  if (!b.fly) b.vy += GRAV;
  b.x += b.vx; b.y += b.vy;
  if (b.y >= FLOOR) { if (!b.onGround && b.vy > 2) dust(b.x, FLOOR, 6); b.y = FLOOR; b.vy = 0; b.onGround = true; } else b.onGround = false;
  if (b.x < 14) { b.x = 14; if (b.vx < 0) b.vx = 0; } else if (b.x > W - 14) { b.x = W - 14; if (b.vx > 0) b.vx = 0; }
}
function galeTele(P2) { return P2 ? 22 : 30; }
function groundTimes(P2) { const t = P2 ? 30 : 38; return P2 ? [t, t + 30] : [t]; }

function updateBoss() {
  if (boss.kind === 'gun') { updateGunner(); return; }
  if (boss.kind === 'sword') { updateAssassin(); return; }
  if (boss.kind === 'chain') { updateSovereign(); return; }
  if (boss.kind === 'origin') { updateOrigin(); return; }
  updateBowmaster();
}
function updateBowmaster() {
  const b = boss, p = player, P2 = b.phase === 2;
  b.st++; b.animT++;
  if (b.flash > 0) b.flash--;
  if (b.hurtT > 0) b.hurtT--;
  if (b.releaseT > 0) b.releaseT--;
  b.breakMeter = Math.max(0, b.breakMeter - 1500);
  if (b.breakCd > 0) b.breakCd--;
  const dx = p.x - b.x, adx = Math.abs(dx), tgtX = p.x, tgtY = p.y - 17;
  b.drawing = false;
  switch (b.state) {
    case 'idle': {
      b.face = dx >= 0 ? 1 : -1;
      const ideal = P2 ? 165 : 145;
      let want = 0;
      if (adx < ideal - 45) want = -b.face; else if (adx > ideal + 55) want = b.face;
      if ((b.x < 36 && want < 0) || (b.x > W - 36 && want > 0)) want = 0;
      b.vx = lerp(b.vx, want * (P2 ? 1.5 : 1.25), 0.15);
      b.walkPh += Math.abs(b.vx) * 0.16;
      if (adx < 52 && p.y > b.y - 60) b.closeT++; else b.closeT = Math.max(0, b.closeT - 2);
      if (b.onGround) b.next--;
      if (b.closeT > (P2 ? 32 : 44) && b.onGround) {
        const r = Math.random();
        bossAttack(b.x < 70 || b.x > W - 70 || r < 0.33 ? 'sweep' : r < 0.66 ? 'backflip' : 'windstep');
      } else if (b.next <= 0) {
        const atk = pickAttack();
        if (Math.random() < (P2 ? 0.4 : 0.28) && ['rapid', 'lock', 'split', 'groundshot', 'gale'].includes(atk)) { b.queue = atk; bossAttack('windstep'); b.lastAtk = atk; }
        else bossAttack(atk);
      }
      break;
    }
    case 'windstep': {
      if (b.st === 1) { b.fromX = b.x; b.tx = stepX(); leafBurst(b.x, b.y - 20); SND.sfx.dash(); b.alpha = 0; b.vx = 0; }
      if (b.st <= 8) { const x = lerp(b.fromX, b.tx, b.st / 8); for (let k = 0; k < 3; k++) addP({kind: 'line', x: x + rnd(-6, 6), y: b.y - rnd(4, 38), vx: Math.sign(b.tx - b.fromX) * 5, vy: 0, life: 8, color: C.G2, size: 1, len: 2}); }
      if (b.st === 8) { b.x = b.tx; b.alpha = 1; leafBurst(b.x, b.y - 20); b.face = p.x >= b.x ? 1 : -1; }
      if (b.st >= 14) { const q = b.queue; b.queue = null; if (q) bossAttack(q); else bossIdle(P2 ? 14 : 24); }
      break;
    }
    case 'rapid': {
      const tele = P2 ? 20 : 28, n = P2 ? 9 : 6, iv = P2 ? 5 : 7, k = b.st - tele;
      b.vx *= 0.7; b.drawing = true;
      b.aim = aimAt(b, tgtX + (P2 ? p.vx * 7 : 0), tgtY); b.face = Math.cos(b.aim) >= 0 ? 1 : -1;
      if (b.st === 1) SND.sfx.warn();
      if (k >= 0 && k % iv === 0 && k / iv < n) fireArrow(b, b.aim + rnd(-0.06, 0.06), P2 ? 6.6 : 6);
      if (k >= n * iv + 14) bossIdle();
      break;
    }
    case 'rain': {
      b.vx *= 0.7; b.face = dx >= 0 ? 1 : -1;
      b.drawing = b.st < 26; b.aim = -Math.PI / 2 + b.face * 0.22;
      if (b.st === 10 || b.st === 15 || b.st === 20) fireArrow(b, b.aim + rnd(-0.05, 0.05), 9, 'visual');
      if (b.st === 24) { rainXs(P2 ? 14 : 10, p.x).forEach((x, i) => markers.push({x, t: -i * 3})); SND.sfx.warn(); }
      if (b.st >= 44) bossIdle(P2 ? 40 : 60);
      break;
    }
    case 'lock': {
      const track = P2 ? 56 : 70, hold = P2 ? 18 : 24;
      b.vx *= 0.7; b.drawing = true;
      if (b.st === 1) lockon = {x: p.x, y: p.y - 17, r: 24, state: 'track'};
      if (lockon) {
        if (b.st < track) {
          lockon.x = lerp(lockon.x, p.x, 0.2); lockon.y = lerp(lockon.y, p.y - 17, 0.2); lockon.r = lerp(24, 9, b.st / track);
          if (b.st % 10 === 0) SND.sfx.beep();
        } else if (b.st === track) { lockon.state = 'locked'; SND.sfx.warn(); }
        b.face = lockon.x >= b.x ? 1 : -1; b.aim = aimAt(b, lockon.x, lockon.y);
      }
      if (b.st === track + hold) {
        const [x, y] = bowPos(b);
        beams.push({x, y, ang: b.aim, t: 0});
        lockon = null; b.releaseT = 8; shake(6); SND.sfx.beam(); flash = {a: 0.35, color: C.G3};
      }
      if (b.st >= track + hold + 26) bossIdle();
      break;
    }
    case 'leap': {
      if (b.st === 1) {
        const tx = b.x > W / 2 ? rnd(60, 150) : rnd(W - 150, W - 60);
        b.vy = -7; b.vx = (tx - b.x) / 50; b.onGround = false; b.fired = 0; SND.sfx.jump(); dust(b.x, b.y, 6);
      }
      b.face = dx >= 0 ? 1 : -1; b.aim = aimAt(b, tgtX, tgtY); b.drawing = !b.onGround;
      if (b.fired === 0 && b.vy >= -0.6 && b.st > 2) { fan(b, P2 ? 7 : 5, 0.34, 5.6); b.fired = 1; }
      if (P2 && b.fired === 1 && b.vy >= 3.2) { fan(b, 5, 0.24, 6); b.fired = 2; }
      if (b.st > 6 && b.onGround) { b.vx = 0; bossIdle(P2 ? 26 : 44); }
      break;
    }
    case 'backflip': {
      if (b.st === 1) {
        let d = -b.face; if ((b.x < 60 && d < 0) || (b.x > W - 60 && d > 0)) d = -d;
        b.vy = -5.2; b.vx = d * 3.6; b.onGround = false; b.spinDir = d;
      }
      b.spin = (b.spinDir === b.face ? 1 : -1) * b.st * 0.17;
      if (b.st === 16) { b.aim = aimAt(b, tgtX, tgtY); fireArrow(b, b.aim, 6.4); }
      if (b.st > 4 && b.onGround) { b.spin = 0; b.vx = 0; bossIdle(18); }
      break;
    }
    case 'sweep': {
      b.vx *= 0.7;
      if (b.st === 1) { b.face = dx >= 0 ? 1 : -1; SND.sfx.warn(); }
      if (b.st === 18) { SND.sfx.slash(); b.vx = b.face * 2.5; }
      if (b.st >= 18 && b.st <= 25) {
        const r = b.face > 0 ? [b.x - 4, b.y - 44, b.x + 38, b.y + 2] : [b.x - 38, b.y - 44, b.x + 4, b.y + 2];
        if (overlap(r, [p.x - 5, p.y - 34, p.x + 5, p.y])) tryHurt(14, b.face * 5, -3.4);
      }
      if (b.st >= 42) bossIdle(26);
      break;
    }
    case 'homing': {
      b.vx *= 0.7; b.face = dx >= 0 ? 1 : -1; b.drawing = b.st < 36; b.aim = -Math.PI / 2 + b.face * 0.75;
      if (b.st === 14 || b.st === 22 || b.st === 30) {
        const a = b.aim + rnd(-0.35, 0.35), [x, y] = bowPos(b);
        newArrow(x, y, Math.cos(a) * 4.4, Math.sin(a) * 4.4, 'homing', 8);
        b.releaseT = 4; SND.sfx.arrow();
      }
      if (b.st >= 46) bossIdle(34);
      break;
    }
    case 'vines': {
      b.vx *= 0.7; b.face = dx >= 0 ? 1 : -1;
      if (b.st === 1) { b.vineMode = Math.random() < 0.5 ? 'wave' : 'field'; SND.sfx.warn(); }
      if (b.st === 18) {
        SND.sfx.vine(); shake(3); dust(b.x + b.face * 8, FLOOR, 10);
        if (b.vineMode === 'wave') {
          for (let i = 0; i < 16; i++) { const x = b.x + b.face * (26 + i * 20); if (x < 6 || x > W - 6) break; spikes.push({x, t: -i * 5, warn: 14, act: 22, h: 34, grow: 0}); }
        } else {
          for (const o of [0, -46, 46, -92, 92]) { const x = p.x + o + (o ? rnd(-6, 6) : 0); if (x > 6 && x < W - 6) spikes.push({x, t: 0, warn: 42, act: 26, h: 48, grow: 0}); }
        }
      }
      if (b.st >= 52) bossIdle(34);
      break;
    }
    case 'spiral': {
      // ARROW CYCLONE: rise, hover, and spin out slow arrows in rotating arms
      const arms = P2 ? 3 : 2, riseT = 26, tele = 18, dur = P2 ? 96 : 80, k = b.st - riseT - tele;
      if (b.st === 1) { b.vy = -7.4; b.vx = (clamp(p.x + (p.x < W / 2 ? 100 : -100), 70, W - 70) - b.x) / riseT; b.onGround = false; SND.sfx.jump(); b.spinA = rnd(TAU); b.spinDir = Math.random() < 0.5 ? 1 : -1; }
      if (b.st === riseT) { b.fly = true; b.vx = 0; b.vy = 0; SND.sfx.cyclone(); }
      if (b.fly) {
        b.vy = 0; b.vx *= 0.9;
        if (b.st % 3 === 0) addP({kind: 'ring', x: b.x, y: b.y - 22, r0: 6, rMax: 20, life: 10, color: C.G2, size: 1});
        if (k >= 0 && k < dur && k % 7 === 0) {
          for (let a = 0; a < arms; a++) { const ang = b.spinA + a * TAU / arms; newArrow(b.x + Math.cos(ang) * 8, b.y - 22 + Math.sin(ang) * 8, Math.cos(ang) * 2.7, Math.sin(ang) * 2.7, 'arrow', 9); }
          b.spinA += 0.3 * b.spinDir; b.releaseT = 3;
          if (k % 14 === 0) SND.sfx.arrow();
        }
        if (k >= dur + 8) b.fly = false;
      }
      b.drawing = b.fly; b.aim = b.spinA; b.face = Math.cos(b.spinA) >= 0 ? 1 : -1;
      if (b.st > riseT + 4 && !b.fly && b.onGround) bossIdle(P2 ? 30 : 44);
      break;
    }
    case 'groundshot': {
      // EARTH SPLITTER: kneel and fire a huge arrow that skims the floor -> jump over it
      const times = groundTimes(P2);
      b.vx *= 0.7;
      if (b.st === 1) { b.face = dx >= 0 ? 1 : -1; SND.sfx.warn(); }
      b.kneel = true; b.drawing = true; b.aim = b.face > 0 ? 0 : Math.PI;
      if (times.includes(b.st)) { newArrow(b.x + b.face * 16, FLOOR - 7, b.face * 9, 0, 'giant', 16); b.releaseT = 6; shake(3); SND.sfx.beam(); }
      if (b.st >= times[times.length - 1] + 20) bossIdle();
      break;
    }
    case 'split': {
      // SCATTER SHOT: lob an arrow that bursts into a falling fan above the player
      b.vx *= 0.7; b.face = dx >= 0 ? 1 : -1; b.drawing = b.st < 26; b.aim = -Math.PI / 2 + b.face * 0.55;
      if (b.st === 20 || (P2 && b.st === 34)) {
        const [x, y] = bowPos(b), lead = b.st === 20 ? 0 : p.vx * 30, T = 38;
        const a = newArrow(x, y, (clamp(p.x + lead, 20, W - 20) - x) / (T * 1.1), -6.1, 'split', 9);
        a.n = P2 ? 7 : 5; b.releaseT = 5; SND.sfx.arrow();
      }
      if (b.st >= (P2 ? 60 : 48)) bossIdle();
      break;
    }
    case 'gale': {
      // GALE DASH: crouch, then a flying kick across the arena -> jump or dash through
      const tele = galeTele(P2);
      if (b.st === 1) { b.face = dx >= 0 ? 1 : -1; b.galeTo = b.face > 0 ? W - 26 : 26; b.fired = 0; SND.sfx.warn(); }
      if (b.st < tele) { b.vx *= 0.7; b.kneel = true; }
      if (b.st === tele) { b.kneel = false; b.vx = b.face * 10; SND.sfx.dash(); dust(b.x, b.y, 8); }
      if (b.st > tele && b.fired !== -1) {
        b.vx = b.face * 10;
        if (b.st % 2 === 0) addBossAfter(b);
        if (overlap(bossBox(), [p.x - 5, p.y - 34, p.x + 5, p.y])) tryHurt(14, b.face * 4, -3.6);
        if (Math.abs(b.x - b.galeTo) < 14 || b.x <= 15 || b.x >= W - 15 || b.st > tele + 60) {
          b.vx = 0; b.fired = -1; b.face = -b.face;
          if (P2) { b.aim = aimAt(b, tgtX, tgtY); fan(b, 3, 0.18, 6); }
        }
      }
      if (b.fired === -1) { b.vx *= 0.7; if (b.st > tele + 70 || b.onGround) { b.fired = 0; bossIdle(P2 ? 26 : 40); } }
      break;
    }
    case 'ult': updateUlt(b, p); break;
    case 'stun':
      b.vx *= 0.85;
      if (b.st >= b.stunDur) bossIdle(24);
      break;
    default: b.vx *= 0.8;
  }
  bossPhysics();
}

/* VERDANT JUDGMENT: boss ultimate at 25% HP (phase 2). Gap rain x3, then a floor-wide thorn flood
   that only the platforms (or staying airborne) escape. Ends in a long stun. */
function ultGaps(px) {
  const g1 = clamp(px + rnd(-90, 90), 34, W - 34);
  let g2 = rnd(34, W - 34), tries = 0;
  while (Math.abs(g2 - g1) < 130 && tries++ < 50) g2 = rnd(34, W - 34);
  return [g1, g2];
}
function updateUlt(b, p) {
  const t = b.st;
  if (t === 1) { leafBurst(b.x, b.y - 20); b.x = 240; b.y = 86; b.fly = true; b.vx = 0; b.vy = 0; leafBurst(b.x, b.y - 20, 20); SND.sfx.cyclone(); }
  b.fly = t < 392; b.vy = b.fly ? 0 : b.vy; b.vx = 0;
  b.drawing = true; b.aim = aimAt(b, p.x, p.y - 17); b.face = p.x >= b.x ? 1 : -1;
  if (t % 4 === 0 && b.fly) addP({kind: 'ring', x: b.x, y: b.y - 22, r0: 8, rMax: 26, life: 12, color: C.G2, size: 1});
  for (const wt of [30, 100, 170]) if (t === wt) {
    const gaps = ultGaps(p.x); let n = 0;
    for (let x = 12; x < W - 6; x += 15) if (gaps.every(g => Math.abs(x - g) > 24)) markers.push({x: x + rnd(-2, 2), t: -((n++) % 3) * 2});
    SND.sfx.warn(); b.releaseT = 6;
  }
  if (t === 240) {
    bigText = {s: '가시 범람', t: 0, dur: 70, color: C.G2};
    for (let x = 8; x < W; x += 16) spikes.push({x, t: 0, warn: 72, act: 52, h: 46, grow: 0});
    SND.sfx.rumble();
  }
  if (t >= 240 && t < 312 && t % 3 === 0) addP({x: rnd(W), y: FLOOR, vx: 0, vy: -rnd(0.5, 2), g: 0.02, life: 26, color: C.G2, size: 2});
  if (t > 392 && b.onGround) { b.state = 'idle'; stunBoss(170, true); bigText = {s: '빈틈!', t: 0, dur: 70, color: C.Y}; SND.sfx.brk(); }
}

function bossPose(b) {
  const k = bkind(b);
  if (k === 'gun') return gunnerPose(b);
  if (k === 'sword') return assassinPose(b);
  if (k === 'chain') return sovereignPose(b);
  if (k === 'origin') return originPose(b);
  return bowPose(b);
}
function bowPose(b) {
  const t = b.animT, br = Math.sin(t * 0.06);
  const br2 = Math.sin(t * 0.025);
  const idle = () => makePose({hy: -15.6 + br * 0.45, lean: 0.03 + br * 0.02 + (b.hurtT > 0 ? -0.25 : 0), ht: 0.08 + br2 * 0.06, l1: -0.3, l2: -0.08, r1: 0.34, r2: -0.2,
    fu: 0.85 + br * 0.04, ff: 0.55, bu: -0.2 + br2 * 0.05, bf: 0.65});
  const aimL = worldToLimb(b.aim, b.face);
  const draw = o => makePose(Object.assign({hy: -16, lean: -0.1, l1: -0.55, l2: 0, r1: 0.5, r2: -0.1, fu: aimL, ff: 0, bu: aimL - Math.PI, bf: b.releaseT > 0 ? 1.5 : 2.67}, o));
  const air = {hy: -17, l1: 0.5, l2: -1.5, r1: 1.0, r2: -1.4};
  const kneel = {hy: -9, lean: 0.25, l1: 0.2, l2: -1.8, r1: 1.3, r2: -1.3};
  switch (b.state) {
    case 'idle':
      if (Math.abs(b.vx) > 0.3) {
        const ph = b.walkPh, back = Math.sign(b.vx) !== b.face, leg = f => [0.05 + 0.6 * Math.sin(f), -(0.2 + 1.0 * Math.max(0, Math.cos(f)))];
        const [r1, r2] = leg(ph), [l1, l2] = leg(ph + Math.PI);
        return makePose({hy: -15.4 - Math.abs(Math.cos(ph)) * 0.9, lean: back ? -0.1 : 0.15, ht: 0.05, l1, l2, r1, r2,
          fu: 0.9 + Math.sin(ph) * 0.08, ff: 0.5, bu: -0.3 - Math.sin(ph) * 0.35, bf: 0.7});
      }
      return idle();
    case 'leap': case 'spiral': case 'ult': return b.onGround ? (b.drawing ? draw() : idle()) : draw(air);
    case 'groundshot': return draw(kneel);
    case 'gale':
      if (b.kneel) return makePose(Object.assign({}, kneel, {lean: 0.5, fu: 0.9, ff: 0.3, bu: -1.6, bf: 0.4}));
      if (b.fired === -1) return idle();
      return makePose({hy: -18, lean: -0.35, l1: -0.9, l2: -1.4, r1: 1.55, r2: 0, fu: -1.2, ff: 0.3, bu: -2.0, bf: 0.3});
    case 'backflip': return makePose(Object.assign({}, air, {rot: b.spin, fu: 1.4, ff: 0.3, bu: -1.6, bf: 0.4, lean: 0.2}));
    case 'sweep': { const u = b.st < 18 ? 0 : easeOut(Math.min(1, (b.st - 18) / 6)); return makePose({hy: -15, lean: lerp(-0.2, 0.4, u), l1: -0.6, r1: 0.6, r2: -0.3, fu: lerp(-2.5, 1.7, u), ff: 0.1, bu: lerp(0.6, -1.2, u), bf: 0.4}); }
    case 'vines':
      if (b.st < 18) return makePose({hy: -16, lean: -0.15, l1: -0.3, r1: 0.35, fu: 2.9, ff: 0.1, bu: 2.7, bf: 0.2});
      return makePose({hy: -12, lean: 0.5, l1: -0.7, l2: -0.4, r1: 0.9, r2: -0.9, fu: 0.45, ff: 0.1, bu: -0.8, bf: 0.3});
    case 'stun': { const s = Math.sin(t * 0.1) * 0.08; return makePose({hy: -13, lean: 0.65 + s, ht: 0.6, l1: -0.1, l2: -0.8, r1: 0.5, r2: -0.9, fu: 0.15, ff: 0.1, bu: -0.1, bf: 0.1}); }
    case 'dead': {
      if (b.st < 30) return makePose({hy: -15, lean: -0.45, ht: -0.3, l1: -0.3, r1: 0.4, fu: 2.2, ff: 0.3, bu: -2.4, bf: 0.3});
      const kn = {hy: -9, lean: 0.4, ht: 0.5, l1: 0.2, l2: -1.8, r1: 1.3, r2: -1.3, fu: 0.3, ff: 0.1, bu: -0.2, bf: 0.1};
      return makePose(b.st < 80 ? kn : Object.assign(kn, {rot: Math.min(1.35, (b.st - 80) * 0.06)}));
    }
    case 'script': return b.summon ? makePose({hy: -17, lean: -0.2, ht: -0.3, l1: -0.4, r1: 0.4, fu: 2.6, ff: 0.2, bu: 2.9, bf: 0.2}) : idle();
    default: return b.drawing ? draw() : idle();
  }
}

/* ---------- projectiles & hazards ---------- */
const BULLETS = new Set(['bullet', 'pellet', 'orb', 'spark']);
function updateArrows() {
  const p = player;
  for (let i = arrows.length - 1; i >= 0; i--) {
    const a = arrows[i];
    if (!a) continue;
    a.age++;
    if (a.stuck > 0) { if (--a.stuck === 0) arrows.splice(i, 1); continue; }
    if (a.kind === 'rocket' || a.kind === 'grenade') { if (updateOrdnance(a)) arrows.splice(i, 1); continue; }
    if (a.kind === 'crescent' || a.kind === 'tornado') { if (updateSwordShot(a)) arrows.splice(i, 1); continue; }
    if (a.kind === 'eblade') { if (updateSovShot(a)) arrows.splice(i, 1); continue; }
    if (a.kind === 'pellet') { a.vx *= 0.985; a.vy *= 0.985; if (a.age > 75) { arrows.splice(i, 1); continue; } }
    // sparks arc up and fall
    if (a.kind === 'spark') { a.vy += 0.16; a.trail.push([a.x, a.y]); if (a.trail.length > 4) a.trail.shift(); }
    if (a.kind === 'homing') {
      if (a.age > 16 && a.age < 150) {
        const cur = Math.atan2(a.vy, a.vx), nc = cur + clamp(angDiff(Math.atan2(p.y - 17 - a.y, p.x - a.x), cur), -0.05, 0.05);
        const sp = Math.min(3.8, Math.hypot(a.vx, a.vy) + 0.05);
        a.vx = Math.cos(nc) * sp; a.vy = Math.sin(nc) * sp;
      }
      a.trail.push([a.x, a.y]); if (a.trail.length > 10) a.trail.shift();
      if (a.age > 240) { arrows.splice(i, 1); continue; }
    }
    if (a.kind === 'split') {
      a.vy += 0.16;
      if (a.vy >= 0.2) {
        for (let k = 0; k < a.n; k++) { const ang = Math.PI / 2 + (k - (a.n - 1) / 2) * 0.24; newArrow(a.x, a.y, Math.cos(ang) * 3.8, Math.sin(ang) * 3.8, 'arrow', 9); }
        addP({kind: 'ring', x: a.x, y: a.y, r0: 3, rMax: 18, life: 10, color: C.G2, size: 2}); SND.sfx.arrow();
        arrows.splice(i, 1); continue;
      }
    }
    if (a.kind === 'giant' && a.age % 2 === 0) addP({kind: 'line', x: a.x - Math.sign(a.vx) * 30, y: a.y + rnd(-6, 6), vx: -a.vx * 0.3, vy: 0, life: 8, color: C.G2, size: 1, len: 3});
    a.x += a.vx; a.y += a.vy;
    if (a.kind === 'visual') { if (a.y < -30) arrows.splice(i, 1); continue; }
    if (a.y >= FLOOR) {
      if (BULLETS.has(a.kind)) { addP({x: a.x, y: FLOOR - 1, vx: rnd(-1, 1), vy: -rnd(0.5, 1.5), g: 0.1, life: 10, color: C.Y, size: 1}); arrows.splice(i, 1); continue; }
      a.y = FLOOR + 1; a.stuck = 50; dust(a.x, FLOOR, 2); continue;
    }
    if (a.x < -40 || a.x > W + 40 || a.y < -80) { arrows.splice(i, 1); continue; }
    if (!inCombat()) continue;
    const hit = a.kind === 'giant' ? (hitsPlayer(a.x, a.y, 4) || hitsPlayer(a.x - Math.sign(a.vx) * 16, a.y, 4)) : hitsPlayer(a.x, a.y, a.kind === 'orb' ? 3.5 : 3);
    if (hit && tryHurt(a.dmg, Math.sign(a.vx || 1) * 2.5, -2.2)) { sparks(a.x, a.y); if (a.kind !== 'giant') arrows.splice(i, 1); }
  }
}
const targetAlive = t => t === boss ? bossHittable() : (scene === 'practice' && dummies.includes(t));
function shardBurst(x, y, n, spd = 3) { for (let k = 0; k < n; k++) { const a = rnd(TAU), s = rnd(1, spd); addP({kind: 'shard', x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, drag: 0.92, life: ri(16, 28), size: rnd(2, 4.5), ang: a, spin: rnd(-0.3, 0.3)}); } }
function updateBlades() {
  if (sigil) sigil.t++;
  for (let i = blades.length - 1; i >= 0; i--) {
    const d = blades[i];
    if (!d) continue;
    d.t++;
    if (d.giant) { if (updGiantBlade(d)) blades.splice(i, 1); continue; }
    if (d.state === 'dance') { if (updBladeDance(d)) blades.splice(i, 1); continue; }
    const tg = nearestTarget(d.x, d.y), SPD = d.red ? 11 : 10;
    if (d.state === 'form') {
      d.grow = clamp((d.t - d.appear) / 5, 0, 1);
      if (d.t === d.appear) { addP({kind: 'ring', x: d.x, y: d.y, r0: 1, rMax: 10, life: 8, color: C.W, size: 2}); SND.sfx.beep(); }
      d.y += Math.sin(d.t * 0.25 + i) * 0.25;
      if (tg && d.grow > 0) d.ang += angDiff(Math.atan2(tg.y - 22 - d.y, tg.x - d.x), d.ang) * 0.15 * d.grow;
      if (d.t >= d.delay) { d.state = 'fly'; d.vx = Math.cos(d.ang) * SPD; d.vy = Math.sin(d.ang) * SPD; SND.sfx.bladeFire(); addP({kind: 'ring', x: d.x, y: d.y, r0: 2, rMax: 12, life: 8, color: C.R, size: 2}); }
    } else if (d.state === 'fly') {
      if (tg && (tg !== boss || boss.hp > 0)) { const cur = Math.atan2(d.vy, d.vx), nc = cur + clamp(angDiff(Math.atan2(tg.y - 22 - d.y, tg.x - d.x), cur), -0.13, 0.13); d.vx = Math.cos(nc) * SPD; d.vy = Math.sin(nc) * SPD; d.ang = nc; }
      d.trail.push([d.x, d.y]); if (d.trail.length > 8) d.trail.shift();
      d.x += d.vx; d.y += d.vy;
      const hit = targets().find(t => { const r = tBox(t); return d.x > r[0] - 2 && d.x < r[2] + 2 && d.y > r[1] && d.y < r[3]; });
      if (hit) {
        dealDamage(d.dmg || 14000, d.x, d.y, {sp: 2, stop: 2, crit: 0.15}, hit);
        d.state = 'embed'; d.tg = hit; d.ox = d.x - hit.x; d.oy = d.y - hit.y; d.t = 0;
        cutFx(d.x, d.y, d.ang + Math.PI / 2); shardBurst(d.x, d.y, 4);
        continue;
      }
      if (d.y >= FLOOR) { d.y = FLOOR + 2; d.state = 'ground'; d.t = 0; dust(d.x, FLOOR, 4); }
      else if (d.x < -30 || d.x > W + 30 || d.y < -40 || d.t > 140) blades.splice(i, 1);
    } else if (d.state === 'embed') {
      d.x = d.tg.x + d.ox; d.y = d.tg.y + d.oy;
      if (d.trail.length) d.trail.shift();
      if (d.t > 90) blades.splice(i, 1);
    } else if (d.t > 50) blades.splice(i, 1);
  }
  // once every summoned blade has landed, the lodged ones detonate together
  if (sigil) {
    const pending = blades.some(b => b.state === 'form' || b.state === 'fly');
    if (sigil.det < 0 && !pending && sigil.t > 20) sigil.det = blades.some(b => b.state === 'embed') ? 12 : 0;
    if (sigil.det > 0 && --sigil.det === 0) {
      const red = sigil.red; let any = false;
      // 특성 검무: instead of bursting, every lodged blade pulls out and stabs three more times
      if (traitOf('blade') === 'A') {
        for (const d of blades) if (d.state === 'embed') { d.state = 'dance'; d.t = 0; d.left = 3; d.k = blades.indexOf(d); any = true; }
        if (any) { SND.sfx.blade(); shake(3); }
      } else {
        for (let i = blades.length - 1; i >= 0; i--) {
          const d = blades[i]; if (d.state !== 'embed') continue;
          any = true;
          addP({kind: 'ring', x: d.x, y: d.y, r0: 3, rMax: red ? 30 : 22, life: 14, color: C.R, size: 3});
          shardBurst(d.x, d.y, red ? 10 : 7, red ? 4.5 : 3.5);
          if (targetAlive(d.tg)) dealDamage((red ? 16000 : 10000) * (upgLv('blade') >= 2 ? 1.6 : 1), d.x, d.y, {sp: 1, stop: 1, quiet: true}, d.tg);
          blades.splice(i, 1);
        }
        if (any) { flash = {a: 0.35, color: C.R}; shake(6); zoomPunch = 0.7; SND.sfx.impact(); SND.sfx.brk(); }
      }
    }
    if (sigil.det === 0 && !pending) sigil = null;
  }
}
/* 특성 검무: a lodged blade pulls back out along its line and stabs in again - three times, staggered blade by blade */
function updBladeDance(d) {
  const tg = d.tg;
  if (!targetAlive(tg) || d.left <= 0) { shardBurst(d.x, d.y, 4, 3); return true; }
  const per = 12, ph = (d.t + d.k * 3) % per;
  // out over the first half of each beat, then driven back in
  d.pull = ph < 7 ? Math.sin(ph / 7 * Math.PI / 2) * 14 : Math.max(0, 14 * (1 - (ph - 7) / 2));
  d.x = tg.x + d.ox - Math.cos(d.ang) * d.pull; d.y = tg.y + d.oy - Math.sin(d.ang) * d.pull;
  if (ph === 9 && d.t > 2) {
    d.left--;
    dealDamage((d.red ? 7000 : 4500) * (upgLv('blade') >= 2 ? 1.6 : 1), tg.x + d.ox, tg.y + d.oy, {sp: 1, stop: 1, quiet: true, crit: 0.2}, tg);
    cutFx(tg.x + d.ox, tg.y + d.oy, d.ang + Math.PI / 2); shardBurst(tg.x + d.ox, tg.y + d.oy, 3, 3);
    if (d.k % 2 === 0) SND.sfx.slash();
  }
  return false;
}
/* 특성 대검: the giant greatsword forms high over the enemy, tracks it for a moment, drops, and bursts wide */
function updGiantBlade(d) {
  // it keeps to the enemy it was called down on (or, if that one is gone, whoever is nearest the hero)
  if (!d.tg || !targets().includes(d.tg)) d.tg = nearestTarget(player.x, player.y);
  const tg = d.tg, hang = 30, L = 76;
  if (d.state === 'giant') {
    d.grow = Math.min(1, d.t / 12);
    if (tg && d.t < hang - 6) d.x = lerp(d.x, tg.x, 0.2);
    if (d.t === 1) SND.sfx.blade();
    if (d.t === hang - 6) { SND.sfx.warn(); glint(d.x, d.y + L, 8); }
    if (d.t >= hang) { d.state = 'drop'; d.vy = 4; SND.sfx.whoosh(); }
    return false;
  }
  if (d.state === 'drop') {
    d.vy = Math.min(22, d.vy + 3); d.y += d.vy;
    if (d.t % 1 === 0) addAfterBlade(d);
    if (d.y + L >= FLOOR) {
      d.y = FLOOR - L + 8; d.state = 'planted'; d.t = 0;
      const x = d.x, r = 70, dmg = (d.red ? 190000 : 140000) * (upgLv('blade') >= 2 ? 1.3 : 1);
      shake(12); zoomPunch = 1; flash = {a: 0.25, color: C.R}; SND.sfx.boom(); SND.sfx.impact(); SND.sfx.brk();
      dust(x, FLOOR, 24);
      addP({kind: 'ring', x, y: FLOOR - 4, r0: 6, rMax: r + 20, life: 18, color: C.R, size: 3});
      addP({kind: 'ring', x, y: FLOOR - 4, r0: 4, rMax: r, life: 14, color: C.W, size: 2});
      for (let i = 0; i < 24; i++) { const a = -rnd(0.2, Math.PI - 0.2), s = rnd(2, 7); addP({kind: 'shard', x: x + rnd(-10, 10), y: FLOOR - 6, vx: Math.cos(a) * s, vy: Math.sin(a) * s, g: 0.15, drag: 0.95, life: ri(24, 44), size: rnd(2, 5), ang: rnd(TAU), spin: rnd(-0.3, 0.3)}); }
      for (const t of targets()) if (Math.abs(t.x - x) < r && t.y > FLOOR - 140) dealDamage(dmg, t.x, t.y - 26, {stop: 8, sp: 4, big: true, crit: 0.3}, t);
    }
    return false;
  }
  // planted: stands a moment, then fades
  return d.t > 40;
}
function addAfterBlade(d) { addP({kind: 'line', x: d.x + rnd(-10, 10), y: d.y + rnd(0, 60), vx: 0, vy: -3, life: 7, color: d.red ? C.W : C.R, size: 1, len: 3}); }
function updateSpikes() {
  const p = player;
  for (let i = spikes.length - 1; i >= 0; i--) {
    const s = spikes[i];
    if (!s) continue;
    s.t++;
    if (s.t < 0) continue;
    const pc = s.pal ? C.P : C.G1;
    if (s.t < s.warn) { if (s.t % 4 === 0 && (spikes.length < 12 || i % 3 === 0)) addP({x: s.x + rnd(-5, 5), y: FLOOR, vx: rnd(-0.6, 0.6), vy: -rnd(0.6, 1.8), g: 0.12, life: 18, color: Math.random() < 0.5 ? pc : C.K}); continue; }
    const at = s.t - s.warn;
    if (at === 0) { if (i % 4 === 0) SND.sfx.vine(); shake(1.5); for (let k = 0; k < 4; k++) addP({x: s.x, y: FLOOR, vx: rnd(-2, 2), vy: -rnd(1, 3), g: 0.15, life: 20, color: pc, size: 2}); }
    s.grow = at < 4 ? at / 4 : at > s.act - 6 ? Math.max(0, (s.act - at) / 6) : 1;
    if (inCombat() && s.grow > 0.5 && p.x > s.x - 12 && p.x < s.x + 12 && p.y > FLOOR - s.h * s.grow + 2) tryHurt(s.h > 40 && s.warn > 60 ? 18 : 14, Math.sign(p.x - s.x || 1) * 2, -4.2);
    if (at >= s.act) spikes.splice(i, 1);
  }
}
function updateMarkers() {
  for (let i = markers.length - 1; i >= 0; i--) {
    const m = markers[i]; m.t++;
    if (m.t === 20) newArrow(m.x, -14, 0, 8.5, 'rain', 10);
    if (m.t > 52) markers.splice(i, 1);
  }
}
function updateBeams() {
  for (let i = beams.length - 1; i >= 0; i--) {
    const bm = beams[i]; bm.t++;
    if (bm.t <= (bm.dur || 7) && inCombat() && beamDist(bm, player.x, player.y - 17) < (bm.w || 10)) tryHurt(bm.dmg || 22, Math.cos(bm.ang) * 4, -3);
    if (bm.t < 12 && bm.t % 2 === 0) { const d = rnd(40, 400); addP({kind: 'line', x: bm.x + Math.cos(bm.ang) * d, y: bm.y + Math.sin(bm.ang) * d, vx: rnd(-2, 2), vy: rnd(-2, 2), life: 8, color: bm.gold ? C.Y : C.G2, size: 1, len: 2}); }
    if (bm.t > (bm.dur || 7) + 13) beams.splice(i, 1);
  }
}
function updateItems() {
  const p = player;
  for (let i = items.length - 1; i >= 0; i--) {
    const it = items[i]; it.t++;
    if (it.t < 70) {
      it.vy += 0.25; it.x += it.vx; it.y += it.vy; it.vx *= 0.97;
      if (it.y >= FLOOR - 3) { it.y = FLOOR - 3; it.vy *= -0.45; it.vx *= 0.7; }
      it.x = clamp(it.x, 6, W - 6);
    } else {
      const dx = p.x - it.x, dy = p.y - 16 - it.y, d = Math.hypot(dx, dy) || 1, s = Math.min(9, (it.t - 70) * 0.25 + 1);
      it.x += dx / d * s; it.y += dy / d * s;
      if (d < 9) { items.splice(i, 1); SND.sfx.coin(); floatText(it.kind === 'coin' ? '+골드' : '+아이템', p.x, p.y - 44, it.kind === 'coin' ? C.Y : C.G2, 1, 40, C.K); }
    }
  }
}
