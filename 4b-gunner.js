/* ---------- boss 2: Bullet Hell Shooter ----------
   a hooded gunslinger who keeps to mid range and fills the air with lead: laser-sighted bursts, a shotgun
   blast, bullet rings from the air, rockets that can be cut back at him, bouncing grenades and a golden beam.
   phase 2 goes dual-wield and adds a spinning gun kata. every attack is readable and can be jumped,
   out-walked or just-dodged. */
const gAim = (b, x, y) => Math.atan2(y - (b.y - 26), x - (b.x + b.face * 2));
function gunOrigin(b, ang) { return [b.x + b.face * 2 + Math.cos(ang) * 21, b.y - 26 + Math.sin(ang) * 21]; }
function gunShoot(b, ang, spd, kind = 'bullet', dmg = 9, o = {}) {
  const [x, y] = gunOrigin(b, ang);
  const a = newArrow(x, y, Math.cos(ang) * spd, Math.sin(ang) * spd, kind, dmg);
  b.releaseT = 4;
  if (!o.silent) SND.sfx[kind === 'pellet' ? 'shotgun' : 'gun']();
  if (!o.noFx) {
    addP({kind: 'muzzle', x, y, ang, life: 4, size: kind === 'pellet' ? 1.6 : 1});
    addP({x: b.x - b.face * 2, y: b.y - 27, vx: -b.face * rnd(0.6, 1.6), vy: -rnd(1.6, 2.6), g: 0.2, life: 40, color: C.Y, size: 1, bounce: true});
  }
  return a;
}
function pickGunAttack() {
  const P2 = boss.phase === 2;
  const table = P2
    ? [['burst', 1.7], ['shotgun', 1.2], ['ring', 1.4], ['rocket', 1.3], ['grenade', 1.1], ['golden', 1.3], ['kata', 1.5]]
    : [['burst', 2.3], ['shotgun', 1.4], ['ring', 1.2], ['rocket', 1.3], ['grenade', 1.2], ['golden', 1.0]];
  const opts = table.filter(e => e[0] !== boss.lastAtk);
  let r = Math.random() * opts.reduce((s, e) => s + e[1], 0);
  for (const [n, w] of opts) if ((r -= w) <= 0) return n;
  return opts[0][0];
}
const gunLethal = b => b.state === 'whip' && b.st >= 12 && b.st <= 20;
const GOLD_LOW = FLOOR - 14, GOLD_HIGH = FLOOR - 60;
function fireGold(b, y) {
  beams.push({x: b.x + b.face * 16, y, ang: b.face > 0 ? 0 : Math.PI, t: 0, gold: true, w: 11, dur: 9, dmg: 20});
  b.lines = []; b.releaseT = 10; b.vx = -b.face * 3;
  shake(7); flash = {a: 0.3, color: C.Y}; SND.sfx.beam(); SND.sfx.gold();
  for (let i = 0; i < 10; i++) addP({kind: 'line', x: b.x + b.face * 20, y, vx: b.face * rnd(2, 6), vy: rnd(-2, 2), life: 10, color: C.Y, size: 1, len: 3});
}

function updateGunner() {
  const b = boss, p = player, P2 = b.phase === 2;
  b.st++; b.animT++;
  if (b.flash > 0) b.flash--;
  if (b.hurtT > 0) b.hurtT--;
  if (b.releaseT > 0) b.releaseT--;
  b.breakMeter = Math.max(0, b.breakMeter - 1500);
  if (b.breakCd > 0) b.breakCd--;
  const dx = p.x - b.x, adx = Math.abs(dx), tx = p.x, ty = p.y - 17;
  b.drawing = false; b.sight = 0;
  switch (b.state) {
    case 'idle': {
      b.face = dx >= 0 ? 1 : -1;
      const ideal = P2 ? 180 : 165;
      let want = 0;
      if (adx < ideal - 50) want = -b.face; else if (adx > ideal + 60) want = b.face;
      if ((b.x < 40 && want < 0) || (b.x > W - 40 && want > 0)) want = 0;
      b.vx = lerp(b.vx, want * (P2 ? 1.7 : 1.4), 0.15);
      b.walkPh += Math.abs(b.vx) * 0.16;
      b.aim = gAim(b, tx, ty);
      if (adx < 50 && p.y > b.y - 60) b.closeT++; else b.closeT = Math.max(0, b.closeT - 2);
      if (b.onGround) b.next--;
      if (b.closeT > (P2 ? 28 : 40) && b.onGround) bossAttack(b.x < 80 || b.x > W - 80 || Math.random() < 0.5 ? 'roll' : 'whip');
      else if (b.next <= 0) bossAttack(pickGunAttack());
      break;
    }
    case 'burst': {
      // laser-sighted three-round bursts: the sight tracks, then locks and blinks right before the shots
      const tele = P2 ? 22 : 30, per = tele + 18, n = P2 ? 3 : 2, k = Math.floor((b.st - 1) / per), rel = (b.st - 1) - k * per;
      b.vx *= 0.7; b.drawing = true;
      if (k < n) {
        if (rel < tele - 8) { b.aim = gAim(b, tx + p.vx * (P2 ? 6 : 0), ty); b.face = Math.cos(b.aim) >= 0 ? 1 : -1; }
        if (rel === 0) SND.sfx.beep();
        if (rel === tele - 8) SND.sfx.warn();
        b.sight = rel < tele - 8 ? 1 : rel < tele ? 2 : 0;
        if (rel === tele || rel === tele + 5 || rel === tele + 10) {
          gunShoot(b, b.aim, P2 ? 8.2 : 7.4);
          if (P2) gunShoot(b, b.aim + (rel === tele + 5 ? 0.09 : -0.09), 8.2, 'bullet', 9, {silent: true});
        }
      }
      if (b.st >= n * per + 8) bossIdle();
      break;
    }
    case 'shotgun': {
      const tele = P2 ? 20 : 26, shots = P2 ? [tele, tele + 26] : [tele], last = shots[shots.length - 1];
      b.vx *= 0.78; b.drawing = true;
      if (b.st === 1) { b.face = dx >= 0 ? 1 : -1; b.vx = b.face * 2.6; SND.sfx.pump(); }
      const nextShot = shots.find(s => s >= b.st);
      if (nextShot != null && nextShot - b.st > 5) { b.aim = gAim(b, tx, ty); b.face = Math.cos(b.aim) >= 0 ? 1 : -1; }
      if (nextShot != null && nextShot - b.st < 12) b.sight = 3;
      if (shots.includes(b.st)) {
        const n = P2 ? 9 : 7;
        for (let i = 0; i < n; i++) gunShoot(b, b.aim + (i / (n - 1) - 0.5) * 0.9 + rnd(-0.03, 0.03), rnd(4.6, 5.8), 'pellet', 8, {silent: i > 0, noFx: i > 0});
        b.vx = -b.face * 3; b.releaseT = 8; shake(3);
        if (b.st !== last) SND.sfx.pump();
      }
      if (b.st >= last + 26) bossIdle();
      break;
    }
    case 'ring': {
      // rise and hover, spraying rings of slow orbs; each ring is offset half a step so the safe gaps alternate
      const riseT = 22, waves = P2 ? 5 : 3, gap = P2 ? 18 : 24, k = b.st - riseT - 14;
      if (b.st === 1) { b.vy = -7; b.vx = (clamp(p.x + (p.x < W / 2 ? 110 : -110), 70, W - 70) - b.x) / riseT; b.onGround = false; SND.sfx.jump(); b.spinA = rnd(TAU); }
      if (b.st === riseT) { b.fly = true; b.vx = 0; b.vy = 0; SND.sfx.warn(); }
      if (b.fly) {
        b.vy = 0; b.vx *= 0.9;
        if (k >= 0 && k % gap === 0 && k / gap < waves) {
          const n = P2 ? 20 : 16, w = k / gap, off = w % 2 ? Math.PI / n : 0, sp = P2 ? 2.5 : 2.2;
          for (let i = 0; i < n; i++) { const a = b.spinA + off + i * TAU / n; newArrow(b.x + Math.cos(a) * 8, b.y - 24 + Math.sin(a) * 8, Math.cos(a) * sp, Math.sin(a) * sp, 'orb', 9); }
          if (w % 2 === 1) gunShoot(b, gAim(b, tx, ty), 5.2, 'bullet', 9, {silent: true});
          addP({kind: 'ring', x: b.x, y: b.y - 24, r0: 6, rMax: 26, life: 10, color: C.Y, size: 2});
          SND.sfx.gun(); b.releaseT = 4;
        }
        b.aim = b.spinA + b.st * 0.25; b.aim2 = b.aim + Math.PI;
        if (k >= waves * gap + 10) b.fly = false;
      }
      b.drawing = b.fly;
      if (b.st > riseT + 4 && !b.fly && b.onGround) bossIdle(P2 ? 30 : 44);
      break;
    }
    case 'rocket': {
      // shoulder launcher: a reticle tracks you, locks, and the rocket detonates exactly there - cut it to send it back
      const tele = P2 ? 30 : 38, times = P2 ? [tele, tele + 24, tele + 48] : [tele], last = times[times.length - 1];
      b.vx *= 0.7; b.launcher = true;
      const next = times.find(s => s >= b.st);
      if (next != null) {
        if (!b.reticle) b.reticle = {x: p.x, y: clamp(p.y - 14, 60, FLOOR - 12), lock: false};
        if (b.st < next - 10) { b.reticle.x = lerp(b.reticle.x, p.x, 0.25); b.reticle.y = lerp(b.reticle.y, clamp(p.y - 14, 60, FLOOR - 12), 0.25); b.reticle.lock = false; }
        else if (!b.reticle.lock) { b.reticle.lock = true; SND.sfx.beep(); }
      } else b.reticle = null;
      const sx = b.x + b.face * 1.5, sy = b.y - 29, tg = b.reticle || {x: p.x, y: p.y - 14};
      b.aim = Math.atan2(tg.y - sy, tg.x - sx); b.face = Math.cos(b.aim) >= 0 ? 1 : -1;
      if (b.st === 1) SND.sfx.warn();
      if (times.includes(b.st)) {
        const x = sx + Math.cos(b.aim) * 16, y = sy + Math.sin(b.aim) * 16;
        const a = newArrow(x, y, Math.cos(b.aim) * 3.2, Math.sin(b.aim) * 3.2, 'rocket', 16);
        a.tx = b.reticle.x; a.ty = b.reticle.y; a.range = Math.hypot(a.tx - x, a.ty - y); a.dist = 0;
        SND.sfx.rocket(); b.vx = -b.face * 2.2; shake(2); b.releaseT = 8;
        for (let i = 0; i < 5; i++) addP({kind: 'smoke', x: sx - Math.cos(b.aim) * 14, y: sy - Math.sin(b.aim) * 14, vx: -Math.cos(b.aim) * rnd(0.5, 2), vy: -rnd(0.2, 1), life: ri(16, 26), size: rnd(3, 6)});
      }
      if (b.st >= last + 30) bossIdle();
      break;
    }
    case 'grenade': {
      const times = P2 ? [16, 36] : [18], last = times[times.length - 1];
      b.vx *= 0.75;
      if (b.st === 1) b.face = dx >= 0 ? 1 : -1;
      if (times.includes(b.st)) {
        for (let i = 0; i < 3; i++) {
          const gx = clamp(p.x + (i - 1) * 46 + rnd(-8, 8), 16, W - 16), T = 54 + i * 2;
          const a = newArrow(b.x + b.face * 6, b.y - 34, (gx - b.x - b.face * 6) / T, -5.4, 'grenade', 14);
          a.fuse = 76 + i * 8; a.spin = rnd(TAU);
        }
        SND.sfx.whoosh(); b.releaseT = 6;
      }
      if (b.st >= last + 30) bossIdle();
      break;
    }
    case 'golden': {
      // golden gun: a floor-skimming beam (jump it); phase 2 follows with a hovering head-height one (stay down)
      const tele = P2 ? 40 : 50;
      b.vx *= 0.7; b.gold = 1; b.drawing = true;
      if (b.st === 1) { b.face = dx >= 0 ? 1 : -1; b.lines = [{y: GOLD_LOW}]; SND.sfx.gold(); SND.sfx.warn(); }
      b.aim = b.face > 0 ? 0 : Math.PI;
      b.kneel = b.st <= tele + 6;
      if (b.st < tele && b.st % 2 === 0) { const a = rnd(TAU), [mx, my] = gunOrigin(b, b.aim); addP({x: mx + Math.cos(a) * 20, y: my + Math.sin(a) * 20, vx: -Math.cos(a) * 1.6, vy: -Math.sin(a) * 1.6, life: 12, color: C.Y, size: 2}); }
      if (b.st === tele) fireGold(b, GOLD_LOW);
      if (P2) {
        if (b.st === tele + 10) { b.fly = true; b.lines = [{y: GOLD_HIGH}]; SND.sfx.gold(); SND.sfx.warn(); }
        if (b.fly) { b.vy = (FLOOR - 34 - b.y) * 0.2; b.vx = 0; }
        if (b.st === tele + 36) { fireGold(b, GOLD_HIGH); b.fly = false; }
        if (b.st >= tele + 62) bossIdle();
      } else if (b.st >= tele + 36) bossIdle();
      break;
    }
    case 'kata': {
      // gun kata: stands and spins, two streams of bullets sweeping round like the hands of a clock
      const tele = 22, dur = 84, k = b.st - tele;
      b.vx *= 0.8; b.drawing = true;
      if (b.st === 1) { SND.sfx.warn(); b.spinA = gAim(b, tx, ty) + Math.PI * 0.5; b.spinDir = Math.random() < 0.5 ? 1 : -1; }
      if (k >= 0 && k < dur && k % 4 === 0) {
        for (const off of [0, Math.PI]) { const a = b.spinA + off; newArrow(b.x + Math.cos(a) * 12, b.y - 24 + Math.sin(a) * 12, Math.cos(a) * 3.1, Math.sin(a) * 3.1, 'bullet', 8); }
        b.spinA += 0.23 * b.spinDir; b.releaseT = 2;
        if (k % 8 === 0) SND.sfx.gun();
      }
      b.aim = b.spinA; b.aim2 = b.spinA + Math.PI; b.face = Math.cos(b.spinA) >= 0 ? 1 : -1;
      if (b.st >= tele + dur + 16) bossIdle(26);
      break;
    }
    case 'whip': {
      b.vx *= 0.7;
      if (b.st === 1) { b.face = dx >= 0 ? 1 : -1; SND.sfx.warn(); }
      if (b.st === 14) { SND.sfx.slash(); b.vx = b.face * 3; }
      if (b.st >= 14 && b.st <= 20) {
        const r = b.face > 0 ? [b.x - 4, b.y - 42, b.x + 34, b.y + 2] : [b.x - 34, b.y - 42, b.x + 4, b.y + 2];
        if (overlap(r, [p.x - 5, p.y - 34, p.x + 5, p.y])) tryHurt(13, b.face * 5.5, -3.6);
      }
      if (b.st > 22) { b.drawing = true; b.aim = gAim(b, tx, ty); b.face = Math.cos(b.aim) >= 0 ? 1 : -1; }
      if (b.st === 28) gunShoot(b, b.aim, 7.6);
      if (b.st >= 44) bossIdle(24);
      break;
    }
    case 'roll': {
      if (b.st === 1) {
        let d = -Math.sign(dx) || -b.face;
        if ((b.x < 90 && d < 0) || (b.x > W - 90 && d > 0)) d = -d;
        b.rollDir = d; SND.sfx.dash(); dust(b.x, b.y, 6);
      }
      if (b.st <= 18) { b.vx = b.rollDir * 5.2 * (1 - b.st / 26); b.roll = b.st / 18; if (b.st % 3 === 0) addBossAfter(b); }
      else { b.roll = 0; b.vx *= 0.7; b.face = dx >= 0 ? 1 : -1; b.drawing = true; b.aim = gAim(b, tx, ty); }
      if (b.st === 24 || b.st === 30 || (P2 && b.st === 36)) gunShoot(b, b.aim + rnd(-0.04, 0.04), 7.4);
      if (b.st >= 50) bossIdle(24);
      break;
    }
    case 'ult': updateGunUlt(b, p); break;
    case 'stun':
      b.vx *= 0.85;
      if (b.st >= b.stunDur) bossIdle(24);
      break;
    default: b.vx *= 0.8;
  }
  bossPhysics();
}

/* BULLET HELL: hovering at the top of the screen, four spiralling arms of orbs with aimed volleys,
   then the last shot - a lock-on and a golden beam. ends in a long stun */
function updateGunUlt(b, p) {
  const t = b.st;
  if (t === 1) { b.x = 240; b.y = 94; b.fly = true; b.vx = 0; b.vy = 0; b.gold = 1; SND.sfx.cyclone(); shardBurst(b.x, b.y - 20, 10); }
  b.fly = t < 392; b.vx = 0; if (b.fly) b.vy = 0;
  b.drawing = true; b.face = p.x >= b.x ? 1 : -1;
  if (t >= 30 && t < 240) {
    if (t % 5 === 0) {
      for (let a = 0; a < 4; a++) { const ang = b.spinA + a * TAU / 4; newArrow(b.x + Math.cos(ang) * 10, b.y - 24 + Math.sin(ang) * 10, Math.cos(ang) * 2.1, Math.sin(ang) * 2.1, 'orb', 9); }
      b.spinA += 0.17; b.releaseT = 2;
      if (t % 15 === 0) SND.sfx.gun();
    }
    if (t % 48 === 0) { const a0 = gAim(b, p.x, p.y - 17); for (const o of [-0.12, 0, 0.12]) gunShoot(b, a0 + o, 5.4, 'bullet', 9, {silent: o !== 0}); }
    b.aim = b.spinA; b.aim2 = b.spinA + Math.PI;
  }
  if (t === 250) { bigText = {s: '최후의 한 발', t: 0, dur: 70, color: C.Y}; lockon = {x: p.x, y: p.y - 17, r: 26, state: 'track'}; SND.sfx.warn(); SND.sfx.gold(); }
  if (lockon && t > 250 && t <= 330) {
    if (t < 310) { lockon.x = lerp(lockon.x, p.x, 0.18); lockon.y = lerp(lockon.y, p.y - 17, 0.18); lockon.r = lerp(26, 9, (t - 250) / 60); if (t % 10 === 0) SND.sfx.beep(); }
    if (t === 310) { lockon.state = 'locked'; SND.sfx.warn(); }
    b.aim = gAim(b, lockon.x, lockon.y); b.aim2 = b.aim; b.face = Math.cos(b.aim) >= 0 ? 1 : -1;
    if (t === 330) {
      const [x, y] = gunOrigin(b, b.aim);
      beams.push({x, y, ang: b.aim, t: 0, gold: true, w: 16, dur: 10, dmg: 26});
      lockon = null; b.releaseT = 10; shake(10); flash = {a: 0.5, color: C.Y}; SND.sfx.beam(); SND.sfx.explode();
    }
  }
  if (t > 392 && b.onGround) { b.state = 'idle'; stunBoss(170, true); bigText = {s: '빈틈!', t: 0, dur: 70, color: C.Y}; SND.sfx.brk(); }
}

/* rockets fly to the locked reticle and blow up there (or on you); cut ones home back on the boss.
   grenades bounce along the street and explode when the fuse runs out. returns true when spent */
function updateOrdnance(a) {
  if (a.kind === 'rocket') {
    const sp = Math.min(a.friendly ? 9 : 7.5, Math.hypot(a.vx, a.vy) + 0.14);
    let ang = Math.atan2(a.vy, a.vx);
    if (a.friendly && bossHittable()) ang += clamp(angDiff(Math.atan2(boss.y - 24 - a.y, boss.x - a.x), ang), -0.2, 0.2);
    a.vx = Math.cos(ang) * sp; a.vy = Math.sin(ang) * sp;
    a.x += a.vx; a.y += a.vy; a.dist = (a.dist || 0) + sp;
    if (a.age % 2 === 0) addP({kind: 'smoke', x: a.x - a.vx * 1.5, y: a.y - a.vy * 1.5, vx: rnd(-0.3, 0.3), vy: -rnd(0.1, 0.5), life: ri(14, 22), size: rnd(2, 4)});
    addP({x: a.x - a.vx, y: a.y - a.vy, vx: -a.vx * 0.2 + rnd(-0.5, 0.5), vy: -a.vy * 0.2 + rnd(-0.5, 0.5), life: 6, color: Math.random() < 0.5 ? C.Y : C.R, size: 2});
    if (a.friendly) {
      if (bossHittable() && overlap([a.x - 4, a.y - 4, a.x + 4, a.y + 4], bossBox())) {
        addBlast(a.x, a.y, 34, 0, true);
        dealDamage(90000, a.x, a.y, {stop: 8, sp: 6, big: true}, boss);
        return true;
      }
    } else if (inCombat() && hitsPlayer(a.x, a.y, 4)) { addBlast(a.x, a.y, 34, a.dmg, false); return true; }
    if ((!a.friendly && a.dist >= a.range) || a.y >= FLOOR - 2) { addBlast(a.x, Math.min(a.y, FLOOR - 4), 34, a.dmg, a.friendly); return true; }
    return a.x < -40 || a.x > W + 40 || a.y < -80 || a.age > 240;
  }
  // grenade
  a.vy += 0.22; a.x += a.vx; a.y += a.vy; a.spin += a.vx * 0.2;
  if (a.y >= FLOOR - 3) { a.y = FLOOR - 3; if (a.vy > 1) { a.vy *= -0.45; SND.sfx.tick(); } else a.vy = 0; a.vx *= 0.75; }
  if ((a.x < 8 && a.vx < 0) || (a.x > W - 8 && a.vx > 0)) a.vx *= -0.6;
  if (--a.fuse <= 0) { addBlast(a.x, a.y - 4, 30, a.dmg, a.friendly); return true; }
  return false;
}
function addBlast(x, y, r, dmg, friendly) {
  blasts.push({x, y, r, dmg, friendly, t: 0, hit: false});
  SND.sfx.explode(); shake(friendly ? 7 : 5); zoomPunch = Math.max(zoomPunch, 0.4);
  for (let i = 0; i < 8; i++) addP({kind: 'smoke', x: x + rnd(-r, r) * 0.5, y: y + rnd(-r, r) * 0.4, vx: rnd(-0.8, 0.8), vy: -rnd(0.3, 1.2), life: ri(24, 40), size: rnd(4, 8)});
  for (let i = 0; i < 12; i++) { const a = rnd(TAU), s = rnd(2, 5); addP({x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s - 1, g: 0.15, life: ri(14, 26), color: i % 3 ? C.Y : C.R, size: 2, bounce: true}); }
}
function updateBlasts() {
  const p = player;
  for (let i = blasts.length - 1; i >= 0; i--) {
    const bl = blasts[i]; bl.t++;
    if (bl.t <= 6) {
      if (bl.friendly) {
        if (!bl.hit && bossHittable() && Math.hypot(boss.x - bl.x, boss.y - 22 - bl.y) < bl.r + 12 && bl.dmg !== 0) { bl.hit = true; dealDamage(60000, boss.x, boss.y - 24, {stop: 6, sp: 4, big: true}, boss); }
      } else if (inCombat() && Math.hypot(p.x - bl.x, p.y - 17 - bl.y) < bl.r + 6) tryHurt(bl.dmg, Math.sign(p.x - bl.x || 1) * 4, -4);
    }
    if (bl.t > 22) blasts.splice(i, 1);
  }
}

function gunnerPose(b) {
  const t = b.animT, br = Math.sin(t * 0.07), P2 = b.phase === 2;
  const aimL = worldToLimb(b.aim, b.face), aim2L = worldToLimb(b.aim2 != null ? b.aim2 : b.aim, b.face);
  const kick = b.releaseT > 2 ? 0.24 * (aimL >= 0 ? 1 : -1) : 0;
  const idle = () => makePose({hy: -15.6 + br * 0.4, lean: 0.06 + br * 0.02 - (b.hurtT > 0 ? 0.25 : 0), ht: 0.05, l1: -0.32, l2: -0.05, r1: 0.36, r2: -0.18,
    fu: 0.45 + br * 0.04, ff: 0.5, bu: P2 ? 0.2 : -0.55, bf: P2 ? 0.6 : 2.0});
  const aim = o => makePose(Object.assign({hy: -15.8, lean: -0.06, l1: -0.5, l2: 0, r1: 0.45, r2: -0.1, fu: aimL + kick, ff: 0,
    bu: P2 ? aim2L + kick * 0.6 : -0.55, bf: P2 ? 0 : 2.0}, o));
  const air = {hy: -17, l1: 0.5, l2: -1.5, r1: 1.0, r2: -1.4};
  switch (b.state) {
    case 'idle':
      if (Math.abs(b.vx) > 0.3) {
        const ph = b.walkPh, back = Math.sign(b.vx) !== b.face, leg = f => [0.05 + 0.6 * Math.sin(f), -(0.2 + 1.0 * Math.max(0, Math.cos(f)))];
        const [r1, r2] = leg(ph), [l1, l2] = leg(ph + Math.PI);
        return makePose({hy: -15.4 - Math.abs(Math.cos(ph)) * 0.9, lean: back ? -0.1 : 0.12, ht: 0.05, l1, l2, r1, r2,
          fu: 0.5 + Math.sin(ph) * 0.1, ff: 0.5, bu: P2 ? 0.2 - Math.sin(ph) * 0.3 : -0.55, bf: P2 ? 0.6 : 2.0});
      }
      return idle();
    case 'burst': case 'shotgun': case 'kata': case 'roll': case 'whip':
      if (b.state === 'roll' && b.roll > 0) return makePose({hy: -9, lean: 0.9, ht: 0.4, l1: 0.3, l2: -2.2, r1: 1.2, r2: -2.2, fu: 1.4, ff: 1.6, bu: 1.0, bf: 1.6, rot: b.roll * TAU * b.rollDir * b.face, piv: -9});
      if (b.state === 'whip' && b.st <= 22) {
        const u = b.st < 14 ? 0 : easeOut(Math.min(1, (b.st - 14) / 5));
        return makePose({hy: -15, lean: lerp(-0.2, 0.45, u), l1: -0.6, r1: 0.6, r2: -0.3, fu: lerp(-2.6, 1.9, u), ff: 0.2, bu: lerp(0.5, -1.2, u), bf: 0.4});
      }
      return b.onGround ? aim() : aim(air);
    case 'ring': return b.onGround && !b.fly ? (b.st < 3 ? idle() : aim(air)) : aim(Object.assign({}, air, {fu: aimL, bu: aim2L, bf: 0}));
    case 'ult': return b.fly ? aim(Object.assign({}, air, P2 ? {} : {bu: aim2L, bf: 0})) : idle();
    case 'golden':
      if (b.kneel) return aim({hy: -9, lean: 0.25, l1: 0.2, l2: -1.8, r1: 1.3, r2: -1.3, bu: aimL - 0.2, bf: 0.3});
      return b.fly ? aim(Object.assign({}, air, {bu: aimL - 0.2, bf: 0.3})) : aim({bu: aimL - 0.2, bf: 0.3});
    case 'rocket': return makePose({hy: -15.6, lean: -0.08, l1: -0.5, r1: 0.45, r2: -0.1, fu: aimL - 0.35, ff: -0.9, bu: aimL - 1.2, bf: 1.3});
    case 'grenade': {
      const times = P2 ? [16, 36] : [18], tt = times.find(v => v >= b.st - 6) || times[times.length - 1], u = clamp((b.st - (tt - 10)) / 10, 0, 1);
      return makePose({hy: -15.6, lean: lerp(-0.15, 0.3, u), l1: -0.5, r1: 0.5, r2: -0.1, fu: lerp(-2.6, 1.7, u), ff: lerp(0.3, 0.1, u), bu: lerp(0.8, -0.6, u), bf: 0.6});
    }
    case 'stun': { const s = Math.sin(t * 0.1) * 0.08; return makePose({hy: -13, lean: 0.65 + s, ht: 0.6, l1: -0.1, l2: -0.8, r1: 0.5, r2: -0.9, fu: 0.15, ff: 0.1, bu: -0.1, bf: 0.1}); }
    case 'dead': {
      if (b.st < 30) return makePose({hy: -15, lean: -0.45, ht: -0.3, l1: -0.3, r1: 0.4, fu: 2.2, ff: 0.3, bu: -2.4, bf: 0.3});
      const kn = {hy: -9, lean: 0.4, ht: 0.5, l1: 0.2, l2: -1.8, r1: 1.3, r2: -1.3, fu: 0.3, ff: 0.1, bu: -0.2, bf: 0.1};
      return makePose(b.st < 80 ? kn : Object.assign(kn, {rot: Math.min(1.35, (b.st - 80) * 0.06)}));
    }
    case 'script': return b.summon ? makePose({hy: -17, lean: -0.2, ht: -0.3, l1: -0.4, r1: 0.4, fu: 2.9, ff: 0.1, bu: 2.6, bf: 0.3}) : idle();
    default: return b.drawing ? aim() : idle();
  }
}
