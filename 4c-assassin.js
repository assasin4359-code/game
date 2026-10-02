/* ---------- boss 3: Moonlight Assassin ----------
   a straw-hatted duelist who fights at sword's length: an instant draw that crosses the field and leaves a
   cut hanging in the air, crescent blade waves at two heights, cross cuts that lock onto you, blink-dashes
   through you, a still-mirror stance that punishes careless swings, and a dive from the moon. phase 2
   dual-wields and adds a whirlwind and shadow clones. every swing has a coiled windup, a snap and a held
   follow-through, with a smear that traces the real path of the blade. */
function pickSwordAttack() {
  const P2 = boss.phase === 2;
  const table = P2
    ? [['iai', 1.8], ['crescent', 1.5], ['cross', 1.3], ['flurry', 1.2], ['counter', 0.8], ['plunge', 1.1], ['tornado', 1.3], ['clones', 1.4]]
    : [['iai', 2.2], ['crescent', 1.8], ['cross', 1.4], ['flurry', 1.3], ['counter', 1.0], ['plunge', 1.2]];
  const opts = table.filter(e => e[0] !== boss.lastAtk);
  let r = Math.random() * opts.reduce((s, e) => s + e[1], 0);
  for (const [n, w] of opts) if ((r -= w) <= 0) return n;
  return opts[0][0];
}
const swordLethal = b => b.dashing || b.hitOn || b.diving;
/* cuts: a line (or segment) that hangs in the air as a thin warning, then snaps into a real slash */
function addCut(x, y, ang, o = {}) { const c = Object.assign({x, y, ang, len: Infinity, t: 0, warn: 30, w: 7, dmg: 16}, o); cuts.push(c); return c; }
function cutDist(c, x, y) {
  const dx = Math.cos(c.ang), dy = Math.sin(c.ang), rx = x - c.x, ry = y - c.y, along = rx * dx + ry * dy;
  if (Math.abs(along) > c.len / 2) return Infinity;
  return Math.abs(rx * dy - ry * dx);
}
function updateCuts() {
  const p = player;
  for (let i = cuts.length - 1; i >= 0; i--) {
    const c = cuts[i]; c.t++;
    if (c.t === c.warn) {
      if (c.style === 'chain') SND.sfx.chain(); else SND.sfx.iai();
      shake(c.big || c.final ? 5 : 3);
      // the Sovereign's stolen Heaven-Splitter shoves the whole picture apart along the cut
      if (c.style === 'slice') { splitFx.push({x: c.x, y: c.y, ang: c.ang, t: 0, big: !!c.final}); if (c.final) { flash = {a: 0.7, color: C.W}; shake(12); SND.sfx.boom(); } }
      const L = Math.min(c.len, 520);
      for (let k = 0; k < (c.big ? 10 : 6); k++) { const u = rnd(-0.5, 0.5) * L; addP({kind: 'line', x: c.x + Math.cos(c.ang) * u, y: c.y + Math.sin(c.ang) * u, vx: rnd(-1.5, 1.5), vy: rnd(-1.5, 1.5), life: 10, color: k % 2 ? C.B : C.W, size: 1, len: 2}); }
    }
    if (c.t >= c.warn && c.t <= c.warn + 3 && inCombat() && cutDist(c, p.x, p.y - 17) < c.w + 5) tryHurt(c.dmg, Math.sign(p.x - c.x || 1) * 3, -3.5);
    if (c.t > c.warn + 16) cuts.splice(i, 1);
  }
}
function wisp(x, y) {
  for (let i = 0; i < 12; i++) { const a = rnd(TAU), s = rnd(0.5, 2.5); addP({kind: 'leaf', x: x + rnd(-6, 6), y: y - rnd(4, 40), vx: Math.cos(a) * s, vy: Math.sin(a) * s - 0.5, drag: 0.92, life: ri(16, 30), color: i % 3 ? C.W : C.B}); }
}
function speedLines(y, dir, n = 8) { for (let i = 0; i < n; i++) addP({kind: 'line', x: rnd(0, W), y: y + rnd(-26, 26), vx: -dir * rnd(14, 22), vy: 0, life: 6, color: i % 3 ? C.W : C.B, size: 1, len: 4}); }
/* the assassin's projectiles live in arrows[]: crescent blade waves and floor whirlwinds (unparryable) */
function updateSwordShot(a) {
  const p = player;
  if (a.kind === 'crescent') {
    a.x += a.vx;
    if (a.age % 2 === 0) addP({kind: 'line', x: a.x - Math.sign(a.vx) * 8, y: a.y + rnd(-a.hh, a.hh) * 0.8, vx: -a.vx * 0.4, vy: 0, life: 8, color: Math.random() < 0.5 ? C.B : C.W, size: 1, len: 3});
    if (a.age % 3 === 0) addP({kind: 'shard', x: a.x, y: a.y + rnd(-a.hh, a.hh), vx: -a.vx * 0.2, vy: rnd(-1, 1), drag: 0.9, life: 14, size: rnd(1.5, 3), ang: rnd(TAU), spin: 0.2, blue: true});
    if (inCombat() && Math.abs(p.x - a.x) < 10 && p.y - 34 < a.y + a.hh && p.y > a.y - a.hh) tryHurt(a.dmg, Math.sign(a.vx) * 3.5, -3);
    return a.x < -50 || a.x > W + 50;
  }
  a.vx = lerp(a.vx, Math.sign(p.x - a.x || 1) * 1.7, 0.02); a.x = clamp(a.x + a.vx, 10, W - 10);
  if (a.age % 3 === 0) addP({kind: 'leaf', x: a.x + rnd(-10, 10), y: FLOOR - rnd(0, 44), vx: rnd(-2, 2), vy: -rnd(0.5, 2), life: 16, color: Math.random() < 0.5 ? C.W : C.B});
  if (inCombat() && Math.abs(p.x - a.x) < 14 && p.y > FLOOR - 44) tryHurt(a.dmg, Math.sign(p.x - a.x || 1) * 4, -4.5);
  return --a.life <= 0;
}
/* hitting the still-mirror stance: blocked, and the assassin reappears behind you */
function assassinParry(x, y) {
  const b = boss;
  sparks(x, y); SND.sfx.parry(); floatText('간파!', b.x, b.y - 54, C.B, 2, 45, C.W);
  addP({kind: 'ring', x: b.x, y: b.y - 20, r0: 6, rMax: 34, life: 12, color: C.B, size: 2});
  b.state = 'counterhit'; b.st = 0; b.sheathed = false;
  hitstop = Math.max(hitstop, 6);
}
function dashSweep(x0, x1, y, dmg, dir) {
  const p = player;
  if (inCombat() && p.x > Math.min(x0, x1) - 8 && p.x < Math.max(x0, x1) + 8 && p.y > y - 6 && p.y - 34 < y + 6) tryHurt(dmg, dir * 5, -3.5);
}
/* world-space [base, tip] of each drawn katana, from the current pose (for the blade smear) */
function assassinBlades(b) {
  const q = assassinPose(b), J = solve(q), X = figXform(b.x, b.y, b.face, q, 1), out = [];
  for (const [h, e, len] of b.phase === 2 ? [['handF', 'elbF', 30], ['handB', 'elbB', 26]] : [['handF', 'elbF', 30]]) {
    const hp = X.T(J[h]), ep = X.T(J[e]), dx = hp[0] - ep[0], dy = hp[1] - ep[1], L = Math.hypot(dx, dy) || 1;
    out.push([[hp[0] + dx / L * 4, hp[1] + dy / L * 4], [hp[0] + dx / L * len, hp[1] + dy / L * len]]);
  }
  return out;
}
function bladeTip(b) { const L = assassinBlades(b)[0]; return L[1]; }

function updateAssassin() {
  const b = boss, p = player, P2 = b.phase === 2;
  b.st++; b.animT++;
  if (b.flash > 0) b.flash--;
  if (b.hurtT > 0) b.hurtT--;
  if (b.releaseT > 0) b.releaseT--;
  b.breakMeter = Math.max(0, b.breakMeter - 1500);
  if (b.breakCd > 0) b.breakCd--;
  const dx = p.x - b.x, adx = Math.abs(dx);
  b.dashing = false; b.hitOn = false; b.diving = false; b.stance = false; b.trailOn = false;
  switch (b.state) {
    case 'idle': {
      b.face = dx >= 0 ? 1 : -1; b.sheathed = false;
      const ideal = P2 ? 110 : 125;
      let want = 0;
      if (adx < ideal - 40) want = -b.face; else if (adx > ideal + 50) want = b.face;
      if ((b.x < 36 && want < 0) || (b.x > W - 36 && want > 0)) want = 0;
      b.vx = lerp(b.vx, want * (P2 ? 2.2 : 1.8), 0.18);
      b.walkPh += Math.abs(b.vx) * 0.16;
      if (adx < 46 && p.y > b.y - 60) b.closeT++; else b.closeT = Math.max(0, b.closeT - 2);
      if (b.onGround) b.next--;
      if (b.closeT > (P2 ? 24 : 34) && b.onGround) { const r = Math.random(); bossAttack(r < 0.45 ? 'flurry' : r < 0.7 ? 'counter' : 'blink'); }
      else if (b.next <= 0) {
        const atk = pickSwordAttack();
        if (Math.random() < 0.3 && atk !== 'counter' && atk !== 'clones') { b.queue = atk; bossAttack('blink'); b.lastAtk = atk; }
        else bossAttack(atk);
      }
      break;
    }
    case 'blink': {
      if (b.st === 1) { b.fromX = b.x; b.tx = stepX(); wisp(b.x, b.y); SND.sfx.dash(); b.alpha = 0; b.vx = 0; }
      if (b.st === 7) { b.x = b.tx; b.alpha = 1; wisp(b.x, b.y); b.face = p.x >= b.x ? 1 : -1; }
      if (b.st >= 12) { const q = b.queue; b.queue = null; if (q) bossAttack(q); else bossIdle(P2 ? 12 : 20); }
      break;
    }
    case 'iai': {
      // stance, glint -> a negative-flash draw across the field -> held follow-through -> the blade clicks home
      // and the cut left hanging in the air snaps on the same beat
      const tele = P2 ? 30 : 40, per = tele + 44, reps = P2 ? 2 : 1, k = Math.floor((b.st - 1) / per), rel = (b.st - 1) - k * per;
      b.vx *= 0.7;
      if (k >= reps) { bossIdle(P2 ? 20 : 30); break; }
      if (rel === 0) { b.face = dx >= 0 ? 1 : -1; b.iaiY = FLOOR - 18; b.lines = [{y: b.iaiY}]; b.sheathed = true; SND.sfx.warn(); SND.sfx.sheath(); }
      if (rel < tele) {
        b.stance = true; b.sheathed = true;
        if (rel % 3 === 0) { const a = rnd(TAU); addP({x: b.x + Math.cos(a) * 26, y: b.y - 18 + Math.sin(a) * 22, vx: -Math.cos(a) * 1.4, vy: -Math.sin(a) * 1.4, life: 16, color: rel % 6 ? C.B : C.W, size: 2}); }
        if (rel === tele - 10) { glint(b.x + b.face * 7, b.y - 16, 9); SND.sfx.beep(); }
      }
      if (rel === tele) {
        b.fromX = b.x; b.tx = clamp(p.x + b.face * 80, 20, W - 20);
        if (Math.abs(b.tx - b.fromX) < 100) b.tx = clamp(b.fromX + b.face * 220, 20, W - 20);
        b.lines = []; b.sheathed = false; SND.sfx.iai(); inkFlash = 4; speedLines(b.iaiY, b.face, 12);
      }
      if (rel >= tele && rel < tele + 4) {
        const x0 = b.x, x1 = lerp(b.fromX, b.tx, (rel - tele + 1) / 4);
        b.x = x1; b.dashing = true; b.trailOn = true; addBossAfter(b);
        dashSweep(x0, x1, b.iaiY, 16, b.face);
      }
      if (rel === tele + 4) { addCut((b.fromX + b.tx) / 2, b.iaiY, 0, {len: Math.abs(b.tx - b.fromX) + 30, warn: 12, w: 7, dmg: 14}); b.vx = b.face * 2; }
      b.drawn = rel >= tele && rel < tele + 12;
      b.sheathing = rel >= tele + 12 && rel < tele + 17;
      if (rel === tele + 16) { SND.sfx.sheath(); glint(b.x + b.face * 6, b.y - 16, 5); }
      break;
    }
    case 'crescent': {
      // coiled windup -> snap swing (downward for a low wave, rising for a high one) -> held follow-through.
      // phase 2 ends with a somersault slash that throws a huge wave
      const tele = P2 ? 18 : 24, gap = P2 ? 22 : 28, heights = P2 ? [FLOOR - 20, FLOOR - 62, FLOOR - 20] : [FLOOR - 20, FLOOR - 62];
      b.vx *= 0.82;
      const k = Math.floor((b.st - tele) / gap), rel = b.st - tele - k * gap, hiOf = i => heights[i] < FLOOR - 40;
      if (b.st === 1) { b.face = dx >= 0 ? 1 : -1; SND.sfx.warn(); }
      if (b.st < tele) { b.swing = 0; b.swingDir = hiOf(0) ? -1 : 1; b.flip = false; if (b.st === tele - 8) { const t0 = bladeTip(b); glint(t0[0], t0[1], 8); SND.sfx.beep(); } }
      else if (k < heights.length) {
        const flip = P2 && k === heights.length - 1;
        b.flip = flip; b.swingDir = hiOf(k) ? -1 : 1;
        b.swing = clamp(rel / (flip ? 9 : 3), 0, 1);
        b.trailOn = rel <= (flip ? 10 : 4);
        if (rel === 0) { b.vx = b.face * (flip ? 2.4 : 3.6); SND.sfx.whoosh(); if (flip) { b.vy = -4.6; b.onGround = false; } }
        if (rel === (flip ? 6 : 2)) {
          const y = heights[k], a = newArrow(b.x + b.face * 18, y, b.face * (P2 ? 6.4 : 5.4), 0, 'crescent', flip ? 16 : 14);
          a.hh = hiOf(k) ? 14 : flip ? 26 : 20; SND.sfx.slash(); b.releaseT = 6;
          slashMark(b.x + b.face * 16, y, hiOf(k) ? -0.5 : 0.5, flip ? 34 : 26);
        }
        if (!flip && k + 1 < heights.length && rel > gap - 9) { b.swing = 0; b.swingDir = hiOf(k + 1) ? -1 : 1; b.flip = P2 && k + 1 === heights.length - 1; }
      }
      if (b.st >= tele + heights.length * gap + 6) bossIdle();
      break;
    }
    case 'cross': {
      // an X-shaped reticle chases you; on the lock the assassin hops and cuts an X in the air, and the X snaps over you
      const n = P2 ? 3 : 1, per = 26, track = 18;
      b.vx *= 0.75; b.drawing = true;
      if (b.st === 1) { b.face = dx >= 0 ? 1 : -1; SND.sfx.warn(); b.xs = -1; }
      const k = Math.floor((b.st - 1) / per), rel = (b.st - 1) - k * per;
      if (k < n) {
        if (rel === 0) b.mark = {x: p.x, y: p.y - 18};
        if (b.mark && rel < track) { b.mark.x = lerp(b.mark.x, p.x, 0.3); b.mark.y = lerp(b.mark.y, p.y - 18, 0.3); }
        if (rel === track - 6) { const t0 = bladeTip(b); glint(t0[0], t0[1], 7); }
        if (b.mark && rel === track) {
          for (const a of [Math.PI / 4, -Math.PI / 4]) addCut(b.mark.x, b.mark.y, a, {len: 70, warn: 16, w: 7, dmg: 14});
          b.mark = null; b.xs = 0; SND.sfx.whoosh(); b.releaseT = 6;
          if (b.onGround) { b.vy = -3.6; b.onGround = false; }
        }
      }
      if (b.xs >= 0) {
        b.xs++;
        b.trailOn = (b.xs >= 1 && b.xs <= 4) || (b.xs >= 7 && b.xs <= 10);
        if (b.xs === 3 || b.xs === 9) { SND.sfx.slash(); slashMark(b.x + b.face * 18, b.y - 24, b.xs === 3 ? 0.8 : -0.8, 24); }
        if (b.xs > 16) b.xs = -1;
      }
      if (b.st >= n * per + 40) bossIdle();
      break;
    }
    case 'flurry': {
      // wandering moon: blink-dashes through you from side to side, each pass leaving a slash in the air,
      // then a rising cut where you stand
      const n = P2 ? 6 : 4, tele = 18, per = P2 ? 11 : 13, y = FLOOR - 20, end = tele + n * per;
      b.vx *= 0.6;
      if (b.st === 1) { b.face = dx >= 0 ? 1 : -1; SND.sfx.warn(); }
      if (b.st === tele - 8) { const t0 = bladeTip(b); glint(t0[0], t0[1], 8); SND.sfx.beep(); }
      const k = Math.floor((b.st - tele) / per), rel = b.st - tele - k * per;
      if (b.st >= tele && k < n) {
        b.flurryK = k;
        if (rel === 0) {
          b.fromX = b.x; const side = b.x < p.x ? 1 : -1;
          b.tx = clamp(p.x + side * 64, 16, W - 16);
          if (Math.abs(b.tx - b.fromX) < 40) b.tx = clamp(p.x - side * 64, 16, W - 16);
          b.face = Math.sign(b.tx - b.fromX) || b.face; SND.sfx.slash(); speedLines(y, b.face, 5);
        }
        if (rel < 3) { const x0 = b.x; b.x = lerp(b.fromX, b.tx, (rel + 1) / 3); b.dashing = true; b.trailOn = true; addBossAfter(b); dashSweep(x0, b.x, y, 9, b.face); }
        if (rel === 3) slashMark((b.fromX + b.tx) / 2, y - 4 + rnd(-8, 8), rnd(-1, 1), 28);
        b.swing = rel < 3 ? (rel + 1) / 3 : 1;
      }
      if (b.st === end) { b.face = dx >= 0 ? 1 : -1; b.swing = 0; }
      if (b.st > end && b.st <= end + 6) b.swing = (b.st - end) / 6;
      if (b.st === end + 6) { addCut(p.x, FLOOR - 36, Math.PI / 2, {len: 96, warn: 10, w: 7, dmg: 14}); SND.sfx.whoosh(); }
      if (b.st >= end + 2 && b.st <= end + 8) b.trailOn = true;
      if (b.st >= end + 30) bossIdle(26);
      break;
    }
    case 'counter': {
      b.vx *= 0.7; b.sheathed = true;
      if (b.st === 1) { b.face = dx >= 0 ? 1 : -1; SND.sfx.sheath(); floatText('명경지수', b.x, b.y - 56, C.B, 1, 60, C.W); }
      if (b.st % 8 === 0) addP({kind: 'ring', x: b.x, y: b.y - 20, r0: 10, rMax: 24, life: 12, color: C.B, size: 1});
      if (b.st >= (P2 ? 64 : 76)) bossIdle(16);
      break;
    }
    case 'counterhit': {
      // reappears behind you, a glint, and one wide flash of a cut
      b.vx = 0;
      if (b.st === 1) { wisp(b.x, b.y); b.x = clamp(p.x - p.face * 30, 16, W - 16); b.face = p.x >= b.x ? 1 : -1; wisp(b.x, b.y); b.alpha = 1; SND.sfx.warn(); flash = {a: 0.25, color: C.B}; }
      if (b.st === 6) { const t0 = bladeTip(b); glint(t0[0], t0[1], 9); SND.sfx.beep(); }
      b.swing = b.st < 12 ? 0 : clamp((b.st - 12) / 3, 0, 1);
      b.trailOn = b.st >= 12 && b.st <= 16;
      if (b.st >= 12 && b.st <= 18) {
        b.hitOn = true;
        const r = b.face > 0 ? [b.x - 6, b.y - 46, b.x + 40, b.y + 2] : [b.x - 40, b.y - 46, b.x + 6, b.y + 2];
        if (overlap(r, [p.x - 5, p.y - 34, p.x + 5, p.y])) tryHurt(18, b.face * 6, -4);
      }
      if (b.st === 12) { SND.sfx.iai(); inkFlash = 3; slashMark(b.x + b.face * 22, b.y - 22, 0.2 * b.face, 34); }
      if (b.st >= 36) bossIdle(24);
      break;
    }
    case 'plunge': {
      // leap toward the moon, hang for a heartbeat above you, dive blade-first, plant it and send low waves both ways
      const hoverEnd = P2 ? 36 : 44;
      if (b.st === 1) { b.vy = -8.2; b.vx = (clamp(p.x, 30, W - 30) - b.x) / 26; b.onGround = false; b.landed = false; SND.sfx.jump(); b.dropX = p.x; }
      if (b.st < hoverEnd) b.dropX = lerp(b.dropX, clamp(p.x, 20, W - 20), b.st < 26 ? 0.2 : 0.12);
      if (b.st === 26) { b.fly = true; b.vx = 0; b.vy = 0; SND.sfx.warn(); }
      if (b.st === hoverEnd - 8) { const t0 = bladeTip(b); glint(t0[0], t0[1], 9); }
      if (b.fly) { b.vy = 0; b.x = lerp(b.x, b.dropX, 0.3); }
      if (b.st === hoverEnd) { b.fly = false; b.vy = 12; b.x = b.dropX; SND.sfx.whoosh(); }
      if (b.st > hoverEnd && !b.onGround && !b.landed) {
        b.diving = true; b.trailOn = true;
        if (inCombat() && Math.abs(p.x - b.x) < 12 && p.y > b.y - 44 && p.y - 34 < b.y) tryHurt(16, Math.sign(p.x - b.x || 1) * 4, -4);
      }
      if (b.st > hoverEnd && b.onGround && !b.landed) {
        b.landed = true; b.landT = b.st; shake(8); SND.sfx.impact(); SND.sfx.iai(); dust(b.x, b.y, 16); flash = {a: 0.25, color: C.W}; inkFlash = 2;
        addP({kind: 'ring', x: b.x, y: FLOOR, r0: 4, rMax: 50, life: 16, color: C.B, size: 3});
        for (let i = 0; i < 10; i++) { const d = i % 2 ? 1 : -1; addP({kind: 'line', x: b.x, y: FLOOR - 1, vx: d * rnd(3, 7), vy: -rnd(0, 1.2), life: 10, color: i % 3 ? C.W : C.B, size: 1, len: 3}); }
        for (const d of [1, -1]) { const a = newArrow(b.x + d * 16, FLOOR - 10, d * 5, 0, 'crescent', 12); a.hh = 10; }
        if (inCombat() && Math.abs(p.x - b.x) < 30 && p.y > FLOOR - 40) tryHurt(16, Math.sign(p.x - b.x || 1) * 5, -4);
      }
      if (b.landed && b.st > b.landT + 32) bossIdle(P2 ? 24 : 36);
      if (b.st > 180) bossIdle();
      break;
    }
    case 'tornado': {
      b.vx *= 0.7;
      if (b.st === 1) { SND.sfx.warn(); b.face = dx >= 0 ? 1 : -1; }
      if (b.st < 24) { b.trailOn = true; if (b.st % 3 === 0) b.face = -b.face; }
      if (b.st === 24) {
        for (const d of [1, -1]) { const a = newArrow(b.x + d * 22, FLOOR - 22, d * 1.4, 0, 'tornado', 10); a.life = 170; }
        SND.sfx.cyclone(); b.face = dx >= 0 ? 1 : -1; slashMark(b.x, b.y - 20, 0, 30);
      }
      if (b.st >= 46) bossIdle(30);
      break;
    }
    case 'clones': {
      // two shadows take the edges and draw across in turn - one low (jump it), one high (stay down) - then the real one
      if (b.st === 1) {
        const lowFirst = Math.random() < 0.5;
        b.clones = [{x: 20, from: 20, to: W - 20, dir: 1, y: lowFirst ? FLOOR - 18 : FLOOR - 52, t0: 44}, {x: W - 20, from: W - 20, to: 20, dir: -1, y: lowFirst ? FLOOR - 52 : FLOOR - 18, t0: 84}];
        SND.sfx.warn(); b.face = dx >= 0 ? 1 : -1; for (const c of b.clones) wisp(c.x, FLOOR);
      }
      b.vx *= 0.7;
      for (const c of b.clones) {
        const rel = b.st - c.t0;
        if (rel === -10) glint(c.x + c.dir * 7, c.y + 2, 7);
        if (rel >= 0 && rel < 5) { const x0 = c.x; c.x = lerp(c.from, c.to, (rel + 1) / 5); c.dash = true; dashSweep(x0, c.x, c.y, 14, c.dir); }
        else c.dash = false;
        if (rel === 0) { SND.sfx.iai(); inkFlash = 3; speedLines(c.y, c.dir, 10); }
        if (rel === 5) { addCut(W / 2, c.y, 0, {len: W, warn: 10, w: 7, dmg: 12}); c.done = true; wisp(c.x, c.y + 18); }
      }
      b.clones = b.clones.filter(c => !(c.done && b.st - c.t0 > 8));
      if (b.st >= 110) { b.clones = []; bossAttack('iai'); }
      break;
    }
    case 'ult': updateSwordUlt(b, p); break;
    case 'stun':
      b.vx *= 0.85;
      if (b.st >= b.stunDur) bossIdle(24);
      break;
    default: b.vx *= 0.8;
  }
  bossPhysics();
  // blade smears: remember where the blades were for the last frames of a swing
  if (b.trailOn && b.alpha > 0) {
    const L = assassinBlades(b);
    b.ktrail.push(L[0]); if (b.ktrail.length > 7) b.ktrail.shift();
    if (L[1]) { b.ktrail2.push(L[1]); if (b.ktrail2.length > 7) b.ktrail2.shift(); }
  } else { if (b.ktrail.length) b.ktrail.shift(); if (b.ktrail2.length) b.ktrail2.shift(); }
}

/* MOONLIT THOUSAND CUTS: from in front of the moon, three volleys of hanging cuts with one safe pocket each,
   then one last draw across the floor. ends in a long stun */
function updateSwordUlt(b, p) {
  const t = b.st;
  if (t === 1) { wisp(b.x, b.y); b.x = 240; b.y = 92; b.fly = true; b.vx = 0; b.vy = 0; SND.sfx.cyclone(); wisp(b.x, b.y); }
  if (t < 250) { b.fly = true; b.vx = 0; b.vy = 0; }
  b.face = p.x >= b.x ? 1 : -1;
  for (const r0 of [30, 112, 194]) {
    if (t === r0) {
      const sx = clamp(p.x + rnd(-80, 80), 40, W - 40), sy = FLOOR - 17, n = r0 === 194 ? 8 : 6;
      let made = 0, tries = 0;
      while (made < n && tries++ < 300) {
        const ang = rnd(-1.2, 1.2) + (Math.random() < 0.35 ? Math.PI / 2 : 0), cx = rnd(30, W - 30), cy = rnd(110, FLOOR - 8);
        if (cutDist({x: cx, y: cy, ang, len: Infinity}, sx, sy) < 30 || cutDist({x: cx, y: cy, ang, len: Infinity}, sx, sy - 16) < 30) continue;
        addCut(cx, cy, ang, {warn: 46, w: 6, dmg: 16, big: true}); made++;
      }
      b.safe = {x: sx, t0: t}; SND.sfx.warn(); b.releaseT = 6;
    }
    // the assassin slashes in the air as each volley is laid down
    if (t >= r0 && t < r0 + 12) { b.swing = (t - r0) / 12; b.trailOn = true; b.swingDir = ((r0 / 82) | 0) % 2 ? -1 : 1; }
    if (t === r0 + 46) { inkFlash = 3; }
  }
  if (b.safe && t - b.safe.t0 > 60) b.safe = null;
  if (t === 250) {
    bigText = {s: '최후의 일섬', t: 0, dur: 70, color: C.W, outline: C.B};
    wisp(b.x, b.y); b.fly = false; b.x = p.x < W / 2 ? W - 24 : 24; b.y = FLOOR; b.vy = 0; b.face = b.x < W / 2 ? 1 : -1; wisp(b.x, b.y);
    b.lines = [{y: FLOOR - 18}]; b.fromX = b.x; SND.sfx.sheath();
  }
  if (t > 250 && t < 294) { b.stance = true; b.sheathed = true; if (t === 284) glint(b.x + b.face * 7, b.y - 16, 10); }
  if (t === 294) { b.lines = []; b.sheathed = false; b.tx = b.face > 0 ? W - 24 : 24; SND.sfx.iai(); inkFlash = 6; speedLines(FLOOR - 18, b.face, 14); }
  if (t >= 294 && t < 298) { const x0 = b.x; b.x = lerp(b.fromX, b.tx, (t - 293) / 4); b.dashing = true; b.trailOn = true; addBossAfter(b); dashSweep(x0, b.x, FLOOR - 18, 18, b.face); }
  if (t === 298) addCut(W / 2, FLOOR - 18, 0, {len: W, warn: 10, w: 8, dmg: 16, big: true});
  b.drawn = t >= 294 && t < 306;
  if (t === 308) SND.sfx.sheath();
  if (t > 330 && b.onGround) { b.state = 'idle'; stunBoss(170, true); bigText = {s: '빈틈!', t: 0, dur: 70, color: C.Y}; SND.sfx.brk(); }
}

/* poses: limb angles 0 = down, + = toward the facing side, PI = up */
function assassinPose(b) {
  const t = b.animT, br = Math.sin(t * 0.07), P2 = b.phase === 2;
  const low = {hy: -12.5, lean: 0.45, ht: 0.1, l1: -0.9, l2: 0.3, r1: 0.9, r2: -0.9};
  const stance = () => makePose({hy: -10, lean: 0.62, ht: 0.25, l1: 0.1, l2: -1.7, r1: 1.25, r2: -1.6, fu: 0.1, ff: 1.5, bu: -0.2, bf: 1.3});
  // after the draw: deep lunge, blade flung straight out, off hand thrown back
  const drawn = () => makePose({hy: -11, lean: 0.62, ht: 0.05, l1: -1.15, l2: 0.35, r1: 1.05, r2: -1.1, fu: 1.62, ff: -0.05, bu: -1.55, bf: 0.2});
  const sheathing = u => makePose({hy: lerp(-11, -14.6, u), lean: lerp(0.62, 0.2, u), ht: 0.1, l1: lerp(-1.15, -0.55, u), l2: 0.2, r1: lerp(1.05, 0.6, u), r2: -0.4, fu: lerp(1.62, 0.1, u), ff: lerp(0, 1.5, u), bu: -0.4, bf: 0.6});
  const idle = () => makePose({hy: -14.6 + br * 0.4, lean: 0.2 + br * 0.02 - (b.hurtT > 0 ? 0.25 : 0), ht: 0.08, l1: -0.55, l2: -0.05, r1: 0.6, r2: -0.35,
    fu: 0.75, ff: 0.35, bu: P2 ? 0.3 : -0.5, bf: P2 ? 0.5 : 0.6});
  // one big arc: down = from coiled high-behind through the front to low-behind; up = the reverse, rising
  const arc = (u, down, o = {}) => {
    const e = easeOut(u), f0 = down ? 3.7 : -0.7, f1 = down ? -0.5 : 3.1;
    return makePose(Object.assign({hy: lerp(-15, -12, e), lean: down ? lerp(-0.3, 0.72, e) : lerp(0.55, -0.25, e), ht: 0.1,
      l1: lerp(-0.25, -1.05, e), l2: 0.2, r1: lerp(0.35, 1.0, e), r2: -0.8, fu: lerp(f0, f1, e), ff: 0.05,
      bu: P2 ? lerp(f0 - 0.5, f1 - 0.7, e) : lerp(-0.4, -1.3, e), bf: P2 ? 0.05 : 0.3}, o));
  };
  switch (b.state) {
    case 'idle':
      if (Math.abs(b.vx) > 0.3) {
        const ph = b.walkPh, leg = f => [0.05 + 0.7 * Math.sin(f), -(0.2 + 1.1 * Math.max(0, Math.cos(f)))];
        const [r1, r2] = leg(ph), [l1, l2] = leg(ph + Math.PI);
        return makePose({hy: -14.4 - Math.abs(Math.cos(ph)) * 0.9, lean: Math.sign(b.vx) !== b.face ? 0 : 0.3, ht: 0.05, l1, l2, r1, r2, fu: 0.8, ff: 0.35, bu: P2 ? 0.3 : -0.5, bf: 0.5});
      }
      return idle();
    case 'iai':
      if (b.stance) return stance();
      if (b.dashing || b.drawn) return drawn();
      if (b.sheathing) return sheathing(clamp(((b.st - 1) % ((P2 ? 30 : 40) + 44) - (P2 ? 30 : 40) - 12) / 5, 0, 1));
      return idle();
    case 'crescent':
      if (b.flip && b.swing > 0) return makePose({hy: -16, lean: 0.35, l1: 0.6, l2: -1.8, r1: 1.1, r2: -1.9, fu: 1.62, ff: 0, bu: P2 ? -1.5 : -1.2, bf: 0.1, rot: easeOut(b.swing) * TAU, piv: -18});
      return arc(b.swing, b.swingDir !== -1);
    case 'cross': {
      if (b.xs >= 0) { const first = b.xs < 6, u = first ? clamp(b.xs / 3, 0, 1) : clamp((b.xs - 6) / 3, 0, 1); return arc(u, first, b.onGround ? {} : {l1: 0.5, l2: -1.5, r1: 1.0, r2: -1.4}); }
      return makePose({hy: -15, lean: -0.1, l1: -0.5, r1: 0.5, r2: -0.2, fu: 3.3, ff: 0.2, bu: P2 ? 3.0 : -0.5, bf: 0.3});
    }
    case 'flurry': {
      if (b.st < 18) return stance();
      const end = 18 + (P2 ? 6 : 4) * (P2 ? 11 : 13);
      if (b.st >= end) return arc(b.swing, false);
      if (b.dashing) return makePose(Object.assign({}, low, {hy: -11.5, lean: 0.7, fu: (b.flurryK | 0) % 2 ? 2.2 : 1.1, ff: 0, bu: -1.5, bf: 0.2}));
      return makePose({hy: -11, lean: 0.55, l1: -1.1, l2: 0.3, r1: 1.0, r2: -1.0, fu: (b.flurryK | 0) % 2 ? 2.5 : 0.7, ff: 0, bu: -1.4, bf: 0.2});
    }
    case 'counter': return makePose({hy: -15.8, lean: -0.04, ht: 0.12, l1: -0.3, r1: 0.35, r2: -0.1, fu: 0.1, ff: 1.55, bu: -0.25, bf: 0.25});
    case 'counterhit': return b.st < 12 ? makePose({hy: -13, lean: -0.15, l1: -0.6, r1: 0.7, r2: -0.6, fu: 3.6, ff: 0.2, bu: 3.3, bf: 0.2}) : arc(b.swing, true);
    case 'plunge':
      if (b.onGround && !b.landed) return makePose(Object.assign({}, low, {fu: 1.0, ff: 0.3}));
      if (b.onGround) return makePose({hy: -9, lean: 0.55, ht: 0.3, l1: 0.2, l2: -1.8, r1: 1.2, r2: -1.9, fu: 0.35, ff: -0.3, bu: 0.1, bf: 0.1});
      if (b.diving) return makePose({hy: -17, lean: 0.05, l1: 0.6, l2: -1.8, r1: 1.0, r2: -1.9, fu: 0.05, ff: 0, bu: -0.1, bf: 0});
      return makePose({hy: -17, lean: 0.2, l1: 0.5, l2: -1.6, r1: 1.0, r2: -1.5, fu: 2.9, ff: 0.1, bu: 2.7, bf: 0.2});
    case 'tornado': return makePose(Object.assign({}, low, {fu: 1.57, ff: 0, bu: -1.57, bf: 0}));
    case 'clones': return makePose({hy: -15.8, lean: 0, l1: -0.4, r1: 0.4, fu: 2.9, ff: 0.1, bu: 2.6, bf: 0.2});
    case 'ult':
      if (b.stance) return stance();
      if (b.dashing || b.drawn) return drawn();
      if (b.fly && b.trailOn) return arc(b.swing, b.swingDir !== -1, {l1: 0.3, l2: -1.2, r1: 0.8, r2: -1.2});
      return b.fly ? makePose({hy: -17, lean: 0, l1: 0.3, l2: -1.2, r1: 0.8, r2: -1.2, fu: 2.9, ff: 0.05, bu: 2.7, bf: 0.1}) : idle();
    case 'stun': { const s = Math.sin(t * 0.1) * 0.08; return makePose({hy: -13, lean: 0.65 + s, ht: 0.6, l1: -0.1, l2: -0.8, r1: 0.5, r2: -0.9, fu: 0.15, ff: 0.1, bu: -0.1, bf: 0.1}); }
    case 'dead': {
      if (b.st < 30) return makePose({hy: -15, lean: -0.45, ht: -0.3, l1: -0.3, r1: 0.4, fu: 2.2, ff: 0.3, bu: -2.4, bf: 0.3});
      const kn = {hy: -9, lean: 0.4, ht: 0.5, l1: 0.2, l2: -1.8, r1: 1.3, r2: -1.3, fu: 0.3, ff: 0.1, bu: -0.2, bf: 0.1};
      return makePose(b.st < 80 ? kn : Object.assign(kn, {rot: Math.min(1.35, (b.st - 80) * 0.06)}));
    }
    case 'script': return b.summon ? makePose({hy: -16.5, lean: -0.1, ht: -0.25, l1: -0.4, r1: 0.4, fu: 2.95, ff: 0.05, bu: 2.5, bf: 0.3}) : idle();
    default: return idle();
  }
}
