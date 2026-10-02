/* ---------- final boss: the Chain Sovereign ----------
   the one who bound the Earth and took the Blade Summoner's power. it fights with chains - lashes along the
   floor or at head height, a prison of chains fired from the edges of the screen - and with the hero's own
   stolen skills in crimson: Thousand Blades, the Sword Mountain, sword waves and the Grand Slam.
   phase 2 moves to orbit above the chained Earth and adds falling chains and a turning wheel of chains.
   its ultimate is the hero's own Heaven-Splitter, turned back on him. */
function pickChainAttack() {
  const P2 = boss.phase === 2;
  const table = P2
    ? [['lash', 1.3], ['prison', 1.3], ['blades', 1.3], ['mountain', 1.2], ['waves', 1.2], ['slam', 1.0], ['meteor', 1.3], ['orbit', 1.1]]
    : [['lash', 1.7], ['prison', 1.4], ['blades', 1.4], ['mountain', 1.3], ['waves', 1.3], ['slam', 1.1]];
  const opts = table.filter(e => e[0] !== boss.lastAtk);
  let r = Math.random() * opts.reduce((s, e) => s + e[1], 0);
  for (const [n, w] of opts) if ((r -= w) <= 0) return n;
  return opts[0][0];
}
const chainLethal = b => b.hitOn || b.diving;
/* a chain fired from (ox,oy) along ang: it hangs as a dotted red line, then shoots out and bites */
function addChain(ox, oy, ang, L, o = {}) { return addCut(ox + Math.cos(ang) * L / 2, oy + Math.sin(ang) * L / 2, ang, Object.assign({len: L, style: 'chain', ox, oy, w: 6, dmg: 14}, o)); }
/* world-space [base, tip] of the crimson greatsword, from the current pose (for its smear) */
function sovereignBlade(b) {
  const q = sovereignPose(b), J = solve(q), X = figXform(b.x, b.y, b.face, q, 1), hp = X.T(J.handF), ep = X.T(J.elbF);
  const dx = hp[0] - ep[0], dy = hp[1] - ep[1], L = Math.hypot(dx, dy) || 1;
  return [[hp[0] + dx / L * 6, hp[1] + dy / L * 6], [hp[0] + dx / L * 46, hp[1] + dy / L * 46]];
}
/* stolen Thousand Blades live in arrows[] as 'eblade': they form in a fan, turn to face you, and fire one by one */
function updateSovShot(a) {
  const p = player;
  if (a.form > 0) {
    a.form--; a.grow = Math.min(1, (a.grow || 0) + 0.2);
    a.ang += angDiff(Math.atan2(p.y - 17 - a.y, p.x - a.x), a.ang) * 0.2; a.y += Math.sin(a.age * 0.25) * 0.2;
    if (a.form === 0) { a.vx = Math.cos(a.ang) * 7.5; a.vy = Math.sin(a.ang) * 7.5; SND.sfx.bladeFire(); addP({kind: 'ring', x: a.x, y: a.y, r0: 2, rMax: 12, life: 8, color: C.R, size: 2}); }
    return false;
  }
  a.trail.push([a.x, a.y]); if (a.trail.length > 7) a.trail.shift();
  a.x += a.vx; a.y += a.vy;
  if (inCombat() && hitsPlayer(a.x, a.y, 4) && tryHurt(a.dmg, Math.sign(a.vx || 1) * 3, -2.5)) { sparks(a.x, a.y); return true; }
  if (a.y >= FLOOR) { a.y = FLOOR + 1; a.stuck = 40; dust(a.x, FLOOR, 3); return false; }
  return a.x < -40 || a.x > W + 40 || a.y < -80;
}

function updateSovereign() {
  const b = boss, p = player, P2 = b.phase === 2;
  b.st++; b.animT++;
  if (b.flash > 0) b.flash--;
  if (b.hurtT > 0) b.hurtT--;
  if (b.releaseT > 0) b.releaseT--;
  b.breakMeter = Math.max(0, b.breakMeter - 1500);
  if (b.breakCd > 0) b.breakCd--;
  if (b.sig) b.sig.t++;
  const dx = p.x - b.x, adx = Math.abs(dx);
  b.hitOn = false; b.diving = false; b.trailOn = false; b.drawing = false;
  if (b.animT % 4 === 0 && b.alpha > 0) addP({x: b.x + rnd(-10, 10), y: b.y - rnd(0, 40), vx: rnd(-0.3, 0.3), vy: -rnd(0.4, 1.2), life: 20, color: Math.random() < 0.7 ? C.R : C.K, size: 1});
  switch (b.state) {
    case 'idle': {
      b.face = dx >= 0 ? 1 : -1;
      const ideal = P2 ? 150 : 140;
      let want = 0;
      if (adx < ideal - 45) want = -b.face; else if (adx > ideal + 55) want = b.face;
      if ((b.x < 40 && want < 0) || (b.x > W - 40 && want > 0)) want = 0;
      b.vx = lerp(b.vx, want * (P2 ? 1.6 : 1.3), 0.12);
      if (adx < 50 && p.y > b.y - 60) b.closeT++; else b.closeT = Math.max(0, b.closeT - 2);
      if (b.onGround) b.next--;
      if (b.closeT > (P2 ? 26 : 36) && b.onGround) bossAttack(Math.random() < 0.5 ? 'lash' : 'slam');
      else if (b.next <= 0) bossAttack(pickChainAttack());
      break;
    }
    case 'lash': {
      // chains cracked along the floor (jump) or at head height (stay down); phase 2 cracks both in turn
      const tele = P2 ? 20 : 26, per = tele + 22, seq = b.lashSeq || (b.lashSeq = P2 ? (Math.random() < 0.5 ? [0, 1] : [1, 0]) : [Math.random() < 0.6 ? 0 : 1]);
      const k = Math.floor((b.st - 1) / per), rel = (b.st - 1) - k * per;
      b.vx *= 0.7;
      if (k >= seq.length) { b.lashSeq = null; bossIdle(); break; }
      if (rel === 0) {
        b.face = dx >= 0 ? 1 : -1; b.lashHigh = seq[k] === 1; SND.sfx.warn();
        const y = b.lashHigh ? FLOOR - 54 : FLOOR - 10;
        addChain(b.x + b.face * 8, y, b.face > 0 ? 0 : Math.PI, 230, {warn: tele, dmg: 14});
      }
      b.swing = rel < tele ? 0 : clamp((rel - tele) / 4, 0, 1);
      if (rel === tele) { SND.sfx.whoosh(); b.vx = b.face * 1.5; }
      break;
    }
    case 'prison': {
      // chains shot in from the edges of the world, all converging on where you stood
      const n = P2 ? 7 : 5;
      b.vx *= 0.7; b.drawing = true;
      if (b.st === 1) {
        SND.sfx.warn(); b.face = dx >= 0 ? 1 : -1;
        const tx = p.x, ty = p.y - 17;
        for (let i = 0; i < n; i++) {
          const side = i % 3, e = side === 0 ? [0, rnd(70, 220)] : side === 1 ? [W, rnd(70, 220)] : [rnd(40, W - 40), 0];
          const ang = Math.atan2(ty - e[1], tx - e[0]), L = Math.hypot(tx - e[0], ty - e[1]) + 90;
          addChain(e[0], e[1], ang, L, {warn: 34 + i * 5, dmg: 14});
        }
      }
      if (b.st >= 34 + n * 5 + 24) bossIdle();
      break;
    }
    case 'blades': {
      // the stolen Thousand Blades: a crimson sigil, a fan of blades, fired at you one after another (they can be cut down)
      const n = P2 ? 8 : 6;
      b.vx *= 0.7;
      if (b.st === 1) { b.face = dx >= 0 ? 1 : -1; b.sig = {x: b.x - b.face * 4, y: b.y - 54, t: 0}; SND.sfx.blade(); floatText('천검 소환', b.x, b.y - 66, C.R, 1, 40, C.W); }
      if (b.st === 6) for (let i = 0; i < n; i++) {
        const a = -Math.PI / 2 + (i - (n - 1) / 2) * (Math.PI * 0.95 / (n - 1));
        const s = newArrow(b.sig.x + Math.cos(a) * 36, b.sig.y + Math.sin(a) * 28, 0, 0, 'eblade', 12);
        s.form = 22 + i * 7; s.ang = a; s.grow = 0;
      }
      if (b.st >= 6 + 22 + n * 7 + 26) { b.sig = null; bossIdle(); }
      break;
    }
    case 'mountain': {
      // the stolen Sword Mountain: the crimson greatsword is planted and a line of swords bursts toward you
      b.vx *= 0.7;
      if (b.st === 1) { b.face = dx >= 0 ? 1 : -1; SND.sfx.blade(); }
      if (b.st === 14) {
        shake(6); SND.sfx.impact(); dust(b.x + b.face * 10, FLOOR, 14);
        addP({kind: 'ring', x: b.x + b.face * 10, y: FLOOR, r0: 3, rMax: 30, life: 12, color: C.R, size: 2});
        for (const d of P2 ? [b.face, -b.face] : [b.face]) for (let i = 0; i < 13; i++) {
          const x = b.x + d * (30 + i * 24); if (x < 8 || x > W - 8) break;
          spikes.push({x, t: -i * 4, warn: 18, act: 20, h: 42 + i * 1.5, grow: 0, sword: true});
        }
      }
      if (b.st >= 80) bossIdle();
      break;
    }
    case 'waves': {
      // the stolen sword waves: crimson crescents, alternating low and high
      const tele = 18, n = P2 ? 5 : 3, gap = 13;
      b.vx *= 0.8;
      if (b.st === 1) { b.face = dx >= 0 ? 1 : -1; SND.sfx.warn(); }
      const k = Math.floor((b.st - tele) / gap), rel = b.st - tele - k * gap;
      b.swing = b.st < tele ? 0 : clamp(rel / 3, 0, 1); b.waveK = Math.max(0, k);
      if (b.st >= tele && k < n) {
        b.trailOn = rel <= 4;
        if (rel === 2) {
          const hi = k % 2 === 1, a = newArrow(b.x + b.face * 20, hi ? FLOOR - 60 : FLOOR - 20, b.face * 6.2, 0, 'crescent', 13);
          a.hh = hi ? 14 : 20; a.red = true; SND.sfx.slash(); slashMark(b.x + b.face * 18, hi ? FLOOR - 56 : FLOOR - 22, hi ? -0.5 : 0.5, 26);
        }
      }
      if (b.st >= tele + n * gap + 14) bossIdle();
      break;
    }
    case 'slam': {
      // the stolen Grand Slam: a leap, the greatsword raised, and a crash that throws waves both ways
      if (b.st === 1) { b.face = dx >= 0 ? 1 : -1; b.landed = false; SND.sfx.warn(); }
      if (b.st < 12) b.vx *= 0.7;
      if (b.st === 12) { b.vy = -7.6; b.vx = (clamp(p.x, 30, W - 30) - b.x) / 54; b.onGround = false; SND.sfx.whoosh(); dust(b.x, b.y, 8); }
      if (b.st > 12 && !b.onGround && b.vy > 0) { b.diving = true; b.trailOn = true; if (inCombat() && Math.abs(p.x - b.x) < 16 && p.y > b.y - 50 && p.y - 34 < b.y) tryHurt(16, Math.sign(p.x - b.x || 1) * 4, -4); }
      if (b.st > 14 && b.onGround && !b.landed) {
        b.landed = true; b.landT = b.st; b.vx = 0;
        shake(9); zoomPunch = 0.8; SND.sfx.impact(); SND.sfx.boom(); dust(b.x, FLOOR, 20); flash = {a: 0.25, color: C.R};
        addP({kind: 'ring', x: b.x, y: FLOOR, r0: 4, rMax: 56, life: 16, color: C.R, size: 3});
        for (const d of [1, -1]) { const a = newArrow(b.x + d * 18, FLOOR - 10, d * 5.4, 0, 'crescent', 13); a.hh = 11; a.red = true; }
        if (P2) for (const o of [-56, -30, 30, 56]) { const x = b.x + o; if (x > 8 && x < W - 8) spikes.push({x, t: -Math.abs(o) / 10, warn: 6, act: 16, h: 38, grow: 0, sword: true}); }
        if (inCombat() && Math.abs(p.x - b.x) < 36 && p.y > FLOOR - 40) tryHurt(18, Math.sign(p.x - b.x || 1) * 5, -4.5);
      }
      if (b.landed && b.st > b.landT + 30) bossIdle(P2 ? 22 : 34);
      if (b.st > 160) bossIdle();
      break;
    }
    case 'meteor': {
      // chains crashing down from the sky onto marked columns
      b.vx *= 0.7; b.drawing = true;
      if (b.st === 1) {
        SND.sfx.warn();
        rainXs(6, p.x).forEach((x, i) => addChain(x, -10, Math.PI / 2, FLOOR + 14, {warn: 30 + i * 6, dmg: 14}));
      }
      if (b.st >= 30 + 36 + 24) bossIdle();
      break;
    }
    case 'orbit': {
      // rises to the middle of the sky and turns a wheel of three chains; a stolen blade now and then keeps you honest
      const grow0 = 20, live0 = 50, dur = 170;
      if (b.st === 1) { b.fly = true; b.vx = 0; b.vy = 0; b.spokeA = rnd(TAU); b.spokeDir = Math.random() < 0.5 ? 1 : -1; b.spokeL = 0; SND.sfx.warn(); SND.sfx.cyclone(); }
      if (b.fly) { b.x = lerp(b.x, 240, 0.08); b.y = lerp(b.y, FLOOR - 110, 0.08); b.vy = 0; b.vx = 0; }
      b.spokeL = b.st < grow0 ? 0 : b.st < live0 ? (b.st - grow0) / (live0 - grow0) * 190 : b.st < live0 + dur ? 190 : Math.max(0, 190 - (b.st - live0 - dur) * 12);
      b.spokesLive = b.st >= live0 && b.st < live0 + dur;
      if (b.st >= grow0) b.spokeA += (b.st < live0 ? 0.01 : 0.022) * b.spokeDir;
      if (b.spokesLive && inCombat()) for (let k = 0; k < 3; k++) {
        const a = b.spokeA + k * TAU / 3, px = b.x, py = b.y - 24;
        if (cutDist({x: px + Math.cos(a) * b.spokeL / 2, y: py + Math.sin(a) * b.spokeL / 2, ang: a, len: b.spokeL}, p.x, p.y - 17) < 11) tryHurt(14, Math.sign(p.x - px || 1) * 4, -4);
      }
      if (b.spokesLive && (b.st - live0) % 44 === 20) { const s = newArrow(b.x, b.y - 30, 0, 0, 'eblade', 12); s.form = 16; s.ang = Math.atan2(p.y - 17 - b.y, p.x - b.x); s.grow = 0; }
      if (b.st === live0 + dur + 16) { b.fly = false; b.vy = 1; }
      if (b.st > live0 + dur + 16 && b.onGround) bossIdle(30);
      if (b.st > live0 + dur + 120) { b.fly = false; bossIdle(30); }
      break;
    }
    case 'ult': updateChainUlt(b, p); break;
    case 'stun':
      b.vx *= 0.85;
      if (b.st >= b.stunDur) bossIdle(24);
      break;
    default: b.vx *= 0.8;
  }
  bossPhysics();
  if (b.trailOn && b.alpha > 0) { b.ktrail.push(sovereignBlade(b)); if (b.ktrail.length > 7) b.ktrail.shift(); }
  else if (b.ktrail.length) b.ktrail.shift();
}

/* HEAVEN-SPLITTER, stolen: rising in front of the gate of the world, the Sovereign cuts the screen again and
   again - telegraphed lines that snap and shove the world apart - and ends with one split across the floor */
function updateChainUlt(b, p) {
  const t = b.st;
  if (t === 1) { b.x = 240; b.fly = true; b.vx = 0; b.vy = 0; SND.sfx.special(); flash = {a: 0.6, color: C.R}; }
  if (t < 250) { b.fly = true; b.vx = 0; b.vy = 0; b.y = lerp(b.y, FLOOR - 120, 0.08); }
  b.face = p.x >= b.x ? 1 : -1;
  if (t >= 20 && t < 200 && (t - 20) % 11 === 0) {
    const onYou = Math.random() < 0.5, px = onYou ? p.x : rnd(40, W - 40), py = onYou ? p.y - 17 : rnd(100, FLOOR - 10);
    addCut(px, py, rnd(-1.3, 1.3), {warn: 30, w: 6, dmg: 16, style: 'slice'});
    b.swing = 0; b.slashAt = t; SND.sfx.beep();
  }
  if (b.slashAt != null && t - b.slashAt <= 4) { b.swing = (t - b.slashAt) / 4; b.trailOn = true; }
  if (t === 214) { bigText = {s: '천지 가르기', t: 0, dur: 70, color: C.W, outline: C.R}; SND.chargeStart(); }
  if (t > 214 && t < 264) SND.chargeSet((t - 214) / 50);
  if (t === 214) addCut(W / 2, FLOOR - 18, rnd(-0.06, 0.06), {warn: 50, w: 9, dmg: 22, style: 'slice', final: true});
  if (t === 264) { SND.chargeStop(); b.swing = 0; b.slashAt = t; }
  if (t === 270) { b.fly = false; b.vy = 2; }
  if (t > 300 && b.onGround) { b.state = 'idle'; stunBoss(170, true); bigText = {s: '빈틈!', t: 0, dur: 70, color: C.Y}; SND.sfx.brk(); }
}

/* poses: limb angles 0 = down, + = toward the facing side, PI = up */
function sovereignPose(b) {
  const t = b.animT, br = Math.sin(t * 0.05), P2 = b.phase === 2;
  const idle = () => makePose({hy: -16.8 + br * 0.6, lean: -0.05 - (b.hurtT > 0 ? 0.25 : 0), ht: -0.05, l1: -0.14, l2: 0.05, r1: 0.18, r2: -0.05,
    fu: 0.55 + br * 0.05, ff: 0.2, bu: 1.25, bf: 0.9});
  const cast = () => makePose({hy: -17, lean: -0.15, ht: -0.25, l1: -0.25, r1: 0.25, fu: 2.9, ff: 0.1, bu: 2.6, bf: 0.25});
  const arc = (u, down) => { const e = easeOut(u), f0 = down ? 3.6 : -0.6, f1 = down ? -0.4 : 3.0;
    return makePose({hy: lerp(-16, -13, e), lean: down ? lerp(-0.25, 0.6, e) : lerp(0.45, -0.2, e), l1: lerp(-0.3, -0.9, e), l2: 0.2, r1: lerp(0.35, 0.95, e), r2: -0.7, fu: lerp(f0, f1, e), ff: 0.05, bu: lerp(1.2, -1.2, e), bf: 0.4}); };
  switch (b.state) {
    case 'idle': return idle();
    case 'lash': return makePose({hy: -16, lean: lerp(-0.25, 0.35, easeOut(b.swing)), l1: -0.4, r1: 0.45, r2: -0.2, fu: 0.5, ff: 0.2, bu: lerp(-2.5, 1.6, easeOut(b.swing)), bf: 0.05});
    case 'prison': case 'meteor': return cast();
    case 'blades': return makePose({hy: -17, lean: -0.1, ht: -0.2, l1: -0.25, r1: 0.25, fu: 0.5, ff: 0.2, bu: 3.0, bf: 0.1});
    case 'mountain': return b.st < 12 ? makePose({hy: -16, lean: -0.1, l1: -0.3, r1: 0.3, fu: 3.0, ff: 0.05, bu: 2.7, bf: 0.2})
      : makePose({hy: -9, lean: 0.7, ht: 0.3, l1: 0.2, l2: -1.8, r1: 1.2, r2: -1.9, fu: 0.9, ff: -0.9, bu: 0.9, bf: 0.2});
    case 'waves': return b.st < 18 ? arc(0, true) : arc(b.swing, (b.waveK | 0) % 2 === 0);
    case 'slam':
      if (b.st < 12) return makePose({hy: -11, lean: 0.4, l1: 0.1, l2: -1.5, r1: 1.1, r2: -1.6, fu: 2.9, ff: 0.1, bu: 2.6, bf: 0.2});
      if (!b.landed) return b.vy < 0 ? makePose({hy: -17, lean: -0.2, l1: 0.5, l2: -1.6, r1: 1.0, r2: -1.5, fu: 3.3, ff: 0.1, bu: 3.0, bf: 0.2}) : arc(Math.min(1, b.vy / 5), true);
      return makePose({hy: -10, lean: 0.62, l1: -0.9, l2: -0.6, r1: 1.2, r2: -1.6, fu: 0.9, ff: 0.1, bu: 0.6, bf: 0.2});
    case 'orbit': return makePose({hy: -17, lean: 0, l1: 0.3, l2: -0.6, r1: 0.6, r2: -0.8, fu: 1.57, ff: 0, bu: -1.57, bf: 0});
    case 'ult': return b.trailOn ? arc(b.swing, (b.st >> 3) % 2 === 0) : b.fly ? cast() : idle();
    case 'stun': { const s = Math.sin(t * 0.1) * 0.08; return makePose({hy: -13, lean: 0.65 + s, ht: 0.6, l1: -0.1, l2: -0.8, r1: 0.5, r2: -0.9, fu: 0.15, ff: 0.1, bu: -0.1, bf: 0.1}); }
    case 'dead': {
      if (b.st < 30) return makePose({hy: -15, lean: -0.45, ht: -0.3, l1: -0.3, r1: 0.4, fu: 2.2, ff: 0.3, bu: -2.4, bf: 0.3});
      const kn = {hy: -9, lean: 0.4, ht: 0.5, l1: 0.2, l2: -1.8, r1: 1.3, r2: -1.3, fu: 0.3, ff: 0.1, bu: -0.2, bf: 0.1};
      return makePose(b.st < 80 ? kn : Object.assign(kn, {rot: Math.min(1.35, (b.st - 80) * 0.06)}));
    }
    case 'script': return b.summon ? cast() : idle();
    default: return idle();
  }
}
