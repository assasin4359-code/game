/* ---------- hidden boss: the Master of Chains (사슬의 주인) ----------
   the one who bound the world in chains and calls himself a god - and the hero's original. the hero was never meant
   to exist: a perfect copy that came out of the chains by accident, when he poured too much of his own power into
   them. so: the same face, the same greatsword, the same arts - only crueller.
   phase 1 (the black void): the hero's own kit turned on him - the five-cut combo, phantom pierce, 천검 소환,
     검기 오연참, 검산, and a rising cut for anyone who jumps over him.
   phase 2 (60%: the chains wind round the void): the Blade God's arts as well - 섬광일섬, 백화난무, 천붕검 - and once,
     at 35%, his own 일검무귀: one level cut across the whole world that lands 0.7 s later (be in the air, or dash).
   phase 3 (15%: the hero cuts every chain and the void falls away to the Earth): frenzy, barely a breath between
     moves - but his guard is gone and he takes heavy damage. */
const ORIGIN = {p2: 0.6, p3: 0.15, p3dmg: 1.2, ultAt: 0.35};
// his flame is the chains' violet, white-hot at the head (the hero's is red)
const ORIGIN_FLAME = {rim: C.K, body: C.P, core: C.W, s1: C.P, s2: C.R};
const ORIGIN_SLASH = {shell: C.K, body: C.P, spine: C.W};
const BLADE_ORIGIN = {light: C.P, dark: C.K, ridge: C.W};
// his 일검무귀: the level cut, the silence after it, the guard's click, then the world tears along it
const OU = {cut: 100, flick: 112, turn: 120, click: 134, blast: 142, end: 196, dmg: 60};
const originLethal = b => b.hitOn || b.dashing;
function originReset(b) {
  Object.assign(b, {fx: [], barcs: [], arcs: [], bDet: -1, riseCd: 0, sigT: 0, cstep: 0, ast: 0, cT: -1, hitMask: 0, fk: -1, fkT: 0, bR: 92, bFin: -1,
    igPh: null, igYaw: -2.15, ultY: FLOOR - 22, cutX: 0, headless: false, head: null});
}
function pickOriginAttack(b, adx) {
  const P2 = b.phase === 2;
  const t = [['combo', adx < 130 ? 2.4 : 1.3], ['pierce', 1.3], ['blades', 1.2], ['fury', 1.3], ['peak', 1.1]];
  if (P2) t.push(['flash', 1.4], ['bloom', adx < 110 ? 1.7 : 0.9], ['sky', 1.3]);
  const opts = t.filter(e => e[0] !== b.lastAtk);
  let r = Math.random() * opts.reduce((s, e) => s + e[1], 0);
  for (const [n, w] of opts) if ((r -= w) <= 0) return n;
  return opts[0][0];
}
const originRest = b => b.p3 ? 14 : b.phase === 2 ? 30 : 44;
const faceHero = b => { b.face = player.x >= b.x ? 1 : -1; };
// a box given relative to the facing (as the hero's ATTACKS boxes are)
const faceBox = (b, r) => b.face > 0 ? [b.x + r[0], b.y + r[1], b.x + r[2], b.y + r[3]] : [b.x - r[2], b.y + r[1], b.x - r[0], b.y + r[3]];
const heroBox = () => [player.x - 5, player.y - 34, player.x + 5, player.y];
function originArcs(b, A, w) {
  const n = b.arcs.length;
  spawnComboArc(b, A, w);
  for (let i = n; i < b.arcs.length; i++) b.arcs[i].pal = ORIGIN_FLAME;
}
/* a crescent sword-wave along the floor (or at head height) */
function originWave(b, dir, y, hh, spd) {
  b.fx.push({type: 'wave', x: b.x + dir * 16, y, vx: dir * spd, hh, t: 0});
  addP({kind: 'ring', x: b.x + dir * 16, y, r0: 2, rMax: 14, life: 8, color: C.P, size: 2});
}
function updateOrigin() {
  const b = boss, p = player;
  b.st++; b.animT++;
  if (b.flash > 0) b.flash--;
  if (b.hurtT > 0) b.hurtT--;
  if (b.riseCd > 0) b.riseCd--;
  if (b.sigT > 0) b.sigT--;
  b.breakMeter = Math.max(0, b.breakMeter - 1500);
  if (b.breakCd > 0) b.breakCd--;
  for (const a of b.arcs) { a.t++; if (a.spark && a.t === 2) arcSparks(b, a); }
  if (b.arcs.length) b.arcs = b.arcs.filter(a => a.t < a.life);
  const dx = p.x - b.x, adx = Math.abs(dx), P2 = b.phase === 2, fast = b.p3 ? 0.75 : P2 ? 0.88 : 1;
  b.hitOn = false; b.dashing = false;
  switch (b.state) {
    case 'idle': {
      faceHero(b);
      let want = 0;
      if (adx < 70) want = -b.face; else if (adx > 170) want = b.face;
      if ((b.x < 40 && want < 0) || (b.x > W - 40 && want > 0)) want = 0;
      b.vx = lerp(b.vx, want * (b.p3 ? 2 : 1.5), 0.15);
      b.walkPh += Math.abs(b.vx) * 0.13;
      if (b.onGround) b.next--;
      if (b.p3) b.next = Math.min(b.next, 14);
      // anyone jumping over him meets the rising cut
      if (b.onGround && !p.onGround && adx < 44 && p.y < b.y - 30 && b.riseCd <= 0 && inCombat()) { bossAttack('rise'); break; }
      if (b.next > 0 || !b.onGround) break;
      bossAttack(pickOriginAttack(b, adx));
      break;
    }
    case 'combo': {
      // the hero's own five cuts, the same moves and timings (ATTACKS 1-5), after a shadow step in to arm's reach
      if (b.st === 1) { faceHero(b); b.cT = -1; b.cstep = 0; SND.sfx.dash(); }
      if (b.cT < 0) {
        faceHero(b);
        if (adx > 46 && b.st < 26) { b.vx = b.face * 6.5; if (b.st % 2 === 0) addBossAfter(b); }
        else { b.vx *= 0.4; b.cT = b.st; SND.sfx.warn(); glint(b.x + b.face * 12, b.y - 30, 7); }
        break;
      }
      const tele = Math.round(12 * fast);
      if (b.cstep === 0) {
        b.vx *= 0.7;
        if (b.st - b.cT >= tele) { b.cstep = 1; b.ast = 0; b.hitMask = 0; b.landed = false; comboStep(b); }
        break;
      }
      const A = ATTACKS[b.cstep], prev = b.ast;
      b.ast += (A.slam && !b.landed && b.ast >= A.fallAt) ? 0 : (b.p3 ? 1.25 : 1);
      if (A.slam) {
        if (prev < 4 && b.ast >= 4) {
          b.vy = -5.2; b.onGround = false; b.vx = b.face * 2; dust(b.x, b.y, 8); SND.sfx.whoosh();
          b.arcs.push({ox: 0, oy: -18, rx: 24, ry: 24, rot: 0, a0: -Math.PI / 2, span: b.face > 0 ? 5.4 : -5.4, w: 6, k: 1, t: 0, sweep: 8, life: 14, seed: rnd(1, 99), curl: 0.4, pal: ORIGIN_FLAME});
        }
        if (b.ast >= A.fallAt && !b.landed) {
          if (b.onGround) { b.landed = true; b.ast = A.landSt; originSlam(b); }
          else { b.vy = 7.5; b.vx *= 0.9; if (globalT % 2 === 0) addBossAfter(b); }
        }
        if (b.landed) b.vx *= 0.7;
        if (!b.landed && b.ast >= 6) b.hitOn = true;
        if (b.landed && b.ast >= A.dur) { bossIdle(originRest(b)); break; }
      } else {
        if (b.onGround) { b.vx *= 0.75; if (b.ast < attackEnd(A)) b.vx += b.face * (A.lunge || 0.5) * 0.5; }
        const w = curWindow(A, b.ast);
        if (w >= 0) {
          b.hitOn = true;
          if (!(b.hitMask & (1 << w))) {
            b.hitMask |= 1 << w; originArcs(b, A, w);
            SND.sfx.slash();
          }
          if (!(b.hitMask & (1 << (w + 4))) && overlap(faceBox(b, A.box), heroBox()) && tryHurt(A.id === 4 ? 10 : 13, b.face * 4, -3)) b.hitMask |= 1 << (w + 4);
        }
        // the next cut follows a beat after this one ends (none at all in the frenzy)
        if (b.ast >= attackEnd(A) + (b.p3 ? 0 : P2 ? 2 : 3)) { b.cstep++; b.ast = 0; b.hitMask = 0; b.landed = false; faceHero(b); comboStep(b); }
      }
      break;
    }
    case 'pierce': {
      // phantom pierce: a crouch, a glint - and he is through you and out the other side
      const tele = Math.round(24 * fast);
      if (b.st === 1) { faceHero(b); b.vx = 0; b.fired = 0; SND.sfx.warn(); }
      if (b.st < tele) {
        b.vx *= 0.7;
        if (b.st < tele - 8) { faceHero(b); b.pTo = clamp(p.x + b.face * 90, 20, W - 20); }
        if (b.st === tele - 8) glint(b.x + b.face * 16, b.y - 22, 7);
      } else if (b.fired !== -1) {
        if (b.st === tele) { SND.sfx.pierce(); dust(b.x, b.y, 6); }
        b.dashing = true; b.vx = b.face * 11;
        if (b.st % 2 === 0) addBossAfter(b);
        if (overlap(bossBox(), heroBox())) tryHurt(16, b.face * 4.5, -3.6);
        if ((b.face > 0 ? b.x >= b.pTo : b.x <= b.pTo) || b.x <= 15 || b.x >= W - 15 || b.st > tele + 40) {
          b.vx = 0; b.fired = -1; b.pEnd = b.st;
          // from phase 2 a sword wave is thrown back the way he came
          if (P2) originWave(b, -b.face, FLOOR - 14, 12, 6.4);
          b.face = -b.face;
        }
      }
      if (b.fired === -1) { b.vx *= 0.7; if (b.st > b.pEnd + 22 * fast) { b.fired = 0; bossIdle(originRest(b)); } }
      break;
    }
    case 'blades': {
      // 천검 소환: a violet sigil, a fan of greatswords over his head, each loosed at you in turn; the ones in the floor
      // go off together once the last has landed
      const n = P2 ? 7 : 5;
      if (b.st === 1) { faceHero(b); b.vx = 0; b.sigT = 90; SND.sfx.warn(); SND.sfx.cyclone(); }
      b.vx *= 0.7;
      if (b.st >= 8 && b.st < 8 + n * 4 && (b.st - 8) % 4 === 0) {
        const i = (b.st - 8) / 4, a = -Math.PI / 2 + (i - (n - 1) / 2) * (P2 ? 0.3 : 0.4);
        const x = b.x + Math.cos(a) * 44, y = b.y - 34 + Math.sin(a) * 40;
        // loosed one after another, 7 frames apart, once the whole fan has formed
        b.fx.push({type: 'blade', i, x, y, ang: Math.atan2(p.y - 17 - y, p.x - x), state: 'form', t: 0, fire: n * 4 + 12 + i * 3, grow: 0, trail: []});
        addP({kind: 'ring', x, y, r0: 1, rMax: 10, life: 8, color: C.P, size: 2}); SND.sfx.beep();
      }
      if (b.st >= 20 + n * 4 + (n - 1) * 7 + 12) bossIdle(originRest(b));
      break;
    }
    case 'fury': {
      // 검기 오연참: five cuts on the spot, each throwing a crescent - low, low, high, low, and a big one
      const gap = Math.round(11 * fast), t0 = Math.round(16 * fast), k = b.st - t0;
      if (b.st === 1) { faceHero(b); b.vx = 0; b.fk = -1; SND.sfx.warn(); }
      b.vx *= 0.7;
      if (k >= 0 && k % gap === 0 && k / gap < 5) {
        const i = k / gap; faceHero(b);
        originWave(b, b.face, i === 2 ? FLOOR - 52 : FLOOR - 14, i === 4 ? 17 : 12, i === 4 ? 7.4 : 6.2);
        originArcs(b, ATTACKS[i % 2 ? 2 : 1], 0);
        b.fk = i; b.fkT = b.st; SND.sfx.slash();
      }
      if (b.st >= t0 + 5 * gap + 22) bossIdle(originRest(b));
      break;
    }
    case 'peak': {
      // 검산: the blade driven into the floor, and a ridge of greatswords bursts up along it (both ways from phase 2)
      const plant = Math.round(20 * fast);
      if (b.st === 1) { faceHero(b); b.vx = 0; SND.sfx.warn(); }
      b.vx *= 0.7;
      if (b.st === plant) {
        shake(5); SND.sfx.impact(); dust(b.x + b.face * 12, FLOOR, 12);
        for (const d of P2 ? [b.face, -b.face] : [b.face]) for (let i = 0; i < 12; i++) {
          const x = b.x + d * (26 + i * 22); if (x < 8 || x > W - 8) break;
          spikes.push({x, t: -i * 3, warn: 16, act: 24, h: 46, grow: 0, sword: true, pal: BLADE_ORIGIN});
        }
      }
      if (b.st >= plant + 52) bossIdle(originRest(b));
      break;
    }
    case 'rise': {
      // 승룡검 against anyone above him
      if (b.st === 1) { faceHero(b); b.vx = 0; b.riseCd = 150; SND.sfx.warn(); }
      if (b.st < 6) b.vx *= 0.7;
      if (b.st === 6) { b.vy = -7.6; b.vx = b.face * 1.5; b.onGround = false; SND.sfx.whoosh(); dust(b.x, b.y, 8); originArcs(b, {arc: 'rise'}, 0); }
      if (b.st >= 6 && b.st < 20) {
        b.hitOn = true;
        if (b.st % 3 === 0) addP({kind: 'line', x: b.x + rnd(-8, 8) + b.face * 10, y: b.y - rnd(0, 40), vx: 0, vy: -6, life: 8, color: b.st % 2 ? C.P : C.W, size: 1.5, len: 3});
        if (overlap(faceBox(b, [-12, -80, 34, 4]), heroBox())) tryHurt(15, b.face * 2, -5);
      }
      if (b.st > 8 && b.onGround) bossIdle(b.p3 ? 12 : 26);
      break;
    }
    case 'flash': {
      // 섬광일섬: the stance, a glint - through you faster than the eye - and a moment later a star of cuts opens
      // where he passed you
      const tele = Math.round(28 * fast);
      if (b.st === 1) { faceHero(b); b.vx = 0; SND.sfx.warn(); }
      b.vx *= 0.7;
      if (b.st < tele - 6) { faceHero(b); b.fTo = clamp(p.x + b.face * 74, 20, W - 20); b.fPX = p.x; }
      if (b.st === tele - 10) glint(b.x + b.face * 6, b.y - 26, 8);
      if (b.st === tele) {
        const x0 = b.x; b.x = b.fTo;
        b.fx.push({type: 'streak', x0, x1: b.x, y: b.y - 20, t: 0});
        SND.sfx.iai(); flash = {a: 0.2, color: C.W}; shake(4);
        const lo = Math.min(x0, b.x), hi = Math.max(x0, b.x);
        if (p.x > lo - 6 && p.x < hi + 6 && p.y > FLOOR - 52) { b.hitOn = true; tryHurt(14, b.face * 3, -3); }
        [0.35, -0.7, 1.25, -1.45].forEach((ang, i) => b.fx.push({type: 'cutmark', x: b.fPX + rnd(-6, 6), y: FLOOR - 24 + rnd(-8, 6), ang, r: 40, t: 0, warn: 18 + i * 3}));
      }
      if (b.st === tele + 20) faceHero(b);
      if (b.st >= tele + 40) bossIdle(originRest(b));
      break;
    }
    case 'bloom': {
      // 백화난무: a dotted ring gives warning, then a storm of crescents round him - stay out of it
      const warn = Math.round(30 * fast), dur = 60, R = b.bR;
      if (b.st === 1) { faceHero(b); b.vx = 0; b.bFin = -1; SND.sfx.warn(); }
      b.vx *= 0.7;
      const cx = b.x, cy = b.y - 20, inR = r => Math.hypot(p.x - cx, p.y - 17 - cy) < r;
      if (b.st >= warn && b.st < warn + dur) {
        if (b.st === warn) { SND.sfx.whoosh(); SND.sfx.cyclone(); }
        if ((b.st - warn) % 5 === 0) { for (let k = 0; k < 3; k++) bloomArc(b, false); SND.sfx.slash(); }
        if ((b.st - warn) % 10 === 0) { b.hitOn = true; if (inCombat() && inR(R)) tryHurt(10, Math.sign(p.x - cx || 1) * 3.5, -3); }
      }
      if (b.st === warn + dur) {
        b.bFin = b.st; SND.sfx.boom(); SND.sfx.slash(); shake(8); zoomPunch = 0.7;
        for (let k = 0; k < 7; k++) bloomArc(b, true);
        for (let k = 0; k < 30; k++) { const a = rnd(TAU), d = rnd(20, 150), s = rnd(1.5, 4.5); addP({kind: 'shard', x: cx + Math.cos(a) * d, y: cy + Math.sin(a) * d * 0.4, vx: Math.cos(a) * s, vy: Math.sin(a) * s * 0.5, drag: 0.92, life: ri(18, 34), size: rnd(1.6, 3.6), ang: rnd(TAU), spin: 0.2, blue: k % 2 === 0}); }
        if (inCombat() && inR(R + 20)) tryHurt(16, Math.sign(p.x - cx || 1) * 4.5, -4.5);
      }
      if (b.st >= warn + dur + 26) bossIdle(originRest(b));
      break;
    }
    case 'sky': {
      // 천붕검: rifts open in the sky over marked spots near you, and greatswords plunge slantwise out of them;
      // the last one is twice the size and falls right where you stand
      const n = b.p3 ? 7 : 5, every = Math.round(11 * fast), k = b.st - 14;
      if (b.st === 1) { faceHero(b); b.vx = 0; SND.sfx.warn(); }
      b.vx *= 0.7;
      if (k >= 0 && k % every === 0 && k / every < n) {
        const i = k / every, last = i === n - 1;
        b.fx.push({type: 'sky', x: clamp(last ? p.x : p.x + rnd(-80, 80), 20, W - 20), dir: Math.random() < 0.5 ? 1 : -1, t: 0, warn: last ? 46 : 38, big: last});
        SND.sfx.chain();
      }
      if (b.st >= 14 + n * every + 34) bossIdle(originRest(b));
      break;
    }
    case 'ult': updOriginUlt(b, p); break;
    case 'stun':
      b.vx *= 0.85;
      if (b.st >= b.stunDur) bossIdle(24);
      break;
    default: b.vx *= 0.8;
  }
  bossPhysics();
  updOriginFx(b);
}
/* the start of each cut of his combo: the same lunge, dash and hop as the hero's */
function comboStep(b) {
  const A = ATTACKS[b.cstep];
  if (A.dash && b.onGround) { b.vx = b.face * A.dash * 0.8; dust(b.x, b.y, 4); }
  if (A.hop && b.onGround) { b.vy = A.hop; b.onGround = false; }
  if (A.id === 5 || A.spin) SND.sfx.whoosh();
}
/* the grand slam's landing: one great cut down into the floor, a shock both ways */
function originSlam(b) {
  const f = b.face;
  shake(6); SND.sfx.impact(); dust(b.x + f * 14, b.y, 16);
  b.arcs.push({ox: f * 4, oy: -24, rx: 52, ry: 44, rot: 0, a0: f > 0 ? -2.3 : Math.PI + 2.3, span: f > 0 ? 2.8 : -2.8, w: 12, k: 1, t: 0, life: 13, seed: rnd(1, 99), spark: true, pal: ORIGIN_FLAME});
  addP({kind: 'ring', x: b.x + f * 14, y: b.y, r0: 4, rMax: 40, life: 14, color: C.P, size: 3});
  if (overlap(faceBox(b, [-26, -36, 58, 4]), heroBox())) tryHurt(18, f * 5, -4.5);
  if (b.phase === 2) for (const d of [1, -1]) originWave(b, d, FLOOR - 10, 9, 5.6);
}
/* 백화난무's crescents: long thin slashes on tilted flattened orbits about him */
function bloomArc(b, big) {
  b.barcs.push({cx: b.x + rnd(-10, 10), cy: b.y - 20 + rnd(-8, 6), rx: big ? rnd(120, 160) : rnd(70, 105), ry: big ? rnd(26, 44) : rnd(18, 34),
    rot: rnd(-0.5, 0.5), a0: rnd(TAU), span: rnd(2.2, 3.0) * (Math.random() < 0.5 ? 1 : -1), w: big ? rnd(8, 11) : rnd(5, 7), t: 0, life: big ? 22 : 15, pal: ORIGIN_SLASH});
}
/* his 일검무귀, in the fight: everything around is drawn into the blade; one level cut across the whole world at
   waist height; nothing for 0.7 s while he turns his back; then it lands - whoever is standing in the band is cut
   through. jumping clear of it (or a dash) is the only answer. afterwards he is wide open */
function updOriginUlt(b, p) {
  const t = b.st, f0 = b.face;
  b.vx = 0;
  if (t === 1) {
    faceHero(b); b.igPh = 'flat'; b.igYaw = -2.15; b.ultY = FLOOR - 22; b.cutX = b.x;
    SND.muffle(1, 0.25); SND.chargeStart(); SND.sfx.cyclone();
    bigText = {s: '일검무귀', t: 0, dur: 70, color: C.W, outline: C.P, sc: 4};
  }
  if (t < OU.cut) {
    SND.chargeSet(t / OU.cut * 0.6);
    // streaks of violet and white pour into the blade from all round
    const q = bossPose(b), g = swordGeom(b.x, b.y, b.face, q, originSwordLen(b)), mx = g.h[0] + g.d[0] * g.L * 0.6, my = g.h[1] + g.d[1] * g.L * 0.6;
    for (let i = 0; i < 2; i++) { const a = rnd(TAU), r = rnd(60, 190), x = mx + Math.cos(a) * r, y = my + Math.sin(a) * r * 0.7, n = ri(12, 20); addP({kind: 'line', x, y, vx: (mx - x) / n, vy: (my - y) / n, life: n, color: i ? C.P : C.W, size: 1, len: 2.5}); }
    if (t === OU.cut - 36) { SND.sfx.warn(); floatText('!', b.x, b.y - 60, C.P, 3, 40, C.W); }
  }
  if (t === OU.cut) { SND.chargeStop(); SND.muffle(2, 0.04); SND.sfx.edge(); flash = {a: 0.5, color: C.W}; shake(5); b.cutX = b.x; b.x = clamp(b.x + f0 * 10, 14, W - 14); }
  if (t >= OU.cut) b.igYaw = lerp(-2.15, 1.95, clamp((t - OU.cut + 1) / 3, 0, 1));
  if (t === OU.flick) b.igPh = 'flick';
  if (t === OU.turn) { b.igPh = 'back'; b.face = -b.face; }
  if (t === OU.click) SND.sfx.clickD();
  if (t === OU.blast) {
    SND.muffle(0, 0.02); SND.sfx.boom(); SND.sfx.explode(); SND.sfx.impact();
    flash = {a: 0.8, color: C.W}; shake(14); zoomPunch = 1;
    b.fx.push({type: 'rip', t: 0, y: b.ultY, x0: b.cutX});
    // cut through unless the feet are above the line
    if (inCombat() && p.y - 34 < b.ultY + 6 && p.y > b.ultY - 2) tryHurt(OU.dmg, Math.sign(p.x - b.cutX || 1) * 6, -5);
  }
  if (t >= OU.end) {
    SND.muffle(0); b.igPh = null;
    b.state = 'idle'; stunBoss(120, true); bigText = {s: '빈틈!', t: 0, dur: 70, color: C.Y}; SND.sfx.brk();
  }
}
const originSwordLen = b => b.state === 'ult' && b.igPh ? SWORD_LEN * (1 + clamp(b.st / OU.cut, 0, 1) * 0.6) : SWORD_LEN;
/* everything he has put into the world: sword-waves, flying and lodged greatswords, the sky swords, the star cuts */
function updOriginFx(b) {
  const p = player;
  for (const a of b.barcs) a.t++;
  if (b.barcs.length) b.barcs = b.barcs.filter(a => a.t < a.life);
  for (let i = b.fx.length - 1; i >= 0; i--) {
    const f = b.fx[i]; f.t++;
    let done = false;
    switch (f.type) {
      case 'wave':
        f.x += f.vx;
        if (f.t % 2 === 0) addP({kind: 'line', x: f.x - Math.sign(f.vx) * 8, y: f.y + rnd(-f.hh, f.hh) * 0.8, vx: -f.vx * 0.4, vy: 0, life: 8, color: Math.random() < 0.5 ? C.P : C.W, size: 1, len: 3});
        if (inCombat() && !f.hit && Math.abs(p.x - f.x) < 10 && p.y - 34 < f.y + f.hh && p.y > f.y - f.hh && tryHurt(13, Math.sign(f.vx) * 3.5, -3)) f.hit = true;
        done = f.x < -40 || f.x > W + 40;
        break;
      case 'blade':
        if (f.state === 'form') {
          f.grow = Math.min(1, f.t / 6);
          f.y += Math.sin(f.t * 0.25 + f.i) * 0.25;
          if (f.t < f.fire - 10) f.ang += angDiff(Math.atan2(p.y - 17 - f.y, p.x - f.x), f.ang) * 0.2;
          if (f.t >= f.fire) { f.state = 'fly'; f.vx = Math.cos(f.ang) * 9; f.vy = Math.sin(f.ang) * 9; SND.sfx.bladeFire(); addP({kind: 'ring', x: f.x, y: f.y, r0: 2, rMax: 12, life: 8, color: C.P, size: 2}); }
        } else if (f.state === 'fly') {
          f.trail.push([f.x, f.y]); if (f.trail.length > 6) f.trail.shift();
          f.x += f.vx; f.y += f.vy;
          const tx = f.x + Math.cos(f.ang) * 10, ty = f.y + Math.sin(f.ang) * 10;
          if (inCombat() && (hitsPlayer(tx, ty, 3) || hitsPlayer(f.x, f.y, 3)) && tryHurt(12, Math.sign(f.vx || 1) * 3, -2.5)) { shardBurst(f.x, f.y, 5); done = true; break; }
          if (ty >= FLOOR) { f.y = FLOOR - Math.sin(f.ang) * 10; f.state = 'stuck'; f.t = 0; f.trail = []; dust(tx, FLOOR, 4); SND.sfx.land(); }
          else if (f.x < -30 || f.x > W + 30 || f.y < -40 || f.t > 200) done = true;
        }
        break;
      case 'cutmark':
        if (f.t === f.warn) {
          addP({kind: 'bigcut', x: f.x, y: f.y, ang: f.ang, r: f.r, c1: C.P, c2: C.W, life: 12});
          SND.sfx.slash(); shake(3);
          const c = Math.cos(f.ang), s = Math.sin(f.ang), rx = p.x - f.x, ry = p.y - 17 - f.y, al = clamp(rx * c + ry * s, -f.r * 1.2, f.r * 1.2);
          if (inCombat() && Math.hypot(rx - c * al, ry - s * al) < 16) tryHurt(12, Math.sign(rx || 1) * 3, -3);
        }
        done = f.t > f.warn + 4;
        break;
      case 'sky':
        if (f.t === f.warn - 8) SND.sfx.whoosh();
        if (f.t === f.warn) {
          const r = f.big ? 34 : 20;
          shake(f.big ? 9 : 5); SND.sfx.impact(); if (f.big) SND.sfx.boom(); dust(f.x, FLOOR, f.big ? 18 : 10);
          addP({kind: 'ring', x: f.x, y: FLOOR, r0: 4, rMax: f.big ? 64 : 36, life: 14, color: C.P, size: 3});
          if (inCombat() && Math.abs(p.x - f.x) < r + 5 && p.y > FLOOR - 60) tryHurt(f.big ? 18 : 14, Math.sign(p.x - f.x || 1) * 4.5, -4.5);
        }
        done = f.t > f.warn + 30;
        break;
      case 'rip': {
        // the cut detonates along its whole length, racing out both ways from where he stood
        const ci = f.t - 1;
        if (ci < 12) for (const d of [-1, 1]) {
          const x = lerp(f.x0 + d * 16, d > 0 ? W + 10 : -10, ci / 11), y = f.y + rnd(-5, 5);
          addP({kind: 'ring', x, y, r0: 4, rMax: 30, life: 12, color: ci % 2 ? C.P : C.W, size: 2});
          for (let k = 0; k < 2; k++) addP({x, y, vx: d * rnd(1, 5), vy: rnd(-4, 1), g: 0.18, life: ri(14, 26), color: k ? C.P : C.W, size: 2, bounce: true});
        }
        if (ci % 3 === 0 && ci < 12) SND.sfx.explode();
        done = f.t > 30;
        break;
      }
      default: done = f.t > 12;
    }
    if (done) b.fx.splice(i, 1);
  }
  // 천검: once the last summoned blade has come down, the ones in the floor go off together
  const lodged = b.fx.filter(f => f.type === 'blade' && f.state === 'stuck');
  if (lodged.length && !b.fx.some(f => f.type === 'blade' && f.state !== 'stuck') && b.bDet < 0) b.bDet = 16;
  if (b.bDet > 0 && --b.bDet === 0) {
    b.bDet = -1;
    for (const f of lodged) {
      addP({kind: 'ring', x: f.x, y: f.y, r0: 3, rMax: 26, life: 14, color: C.P, size: 3}); shardBurst(f.x, f.y, 6, 3.5);
      if (inCombat() && Math.hypot(p.x - f.x, p.y - 17 - f.y) < 26) tryHurt(12, Math.sign(p.x - f.x || 1) * 3, -3);
    }
    b.fx = b.fx.filter(f => !lodged.includes(f));
    flash = {a: 0.3, color: C.P}; shake(6); SND.sfx.impact(); SND.sfx.brk();
  }
}
/* the just dodge reads his hazards too (the moment each one strikes) */
function originThreat(cx, cy) {
  const b = boss;
  for (const f of b.fx) {
    if (f.type === 'wave' && Math.abs(f.x - cx) < 20 && Math.abs(f.y - cy) < f.hh + 20) return true;
    if (f.type === 'blade' && f.state === 'fly' && Math.hypot(f.x - cx, f.y - cy) < 24) return true;
    if (f.type === 'cutmark' && Math.abs(f.t - f.warn) <= 3 && Math.hypot(f.x - cx, f.y - cy) < f.r) return true;
    if (f.type === 'sky' && Math.abs(f.t - f.warn) <= 3 && Math.abs(f.x - cx) < (f.big ? 44 : 30)) return true;
  }
  if (b.fx.some(f => f.type === 'blade' && f.state === 'stuck') && b.bDet > 0 && b.bDet <= 3) return true;
  if (b.state === 'ult' && Math.abs(b.st - OU.blast) <= 3 && Math.abs(cy - b.ultY) < 34) return true;
  if (b.state === 'bloom' && b.hitOn && Math.hypot(b.x - cx, b.y - 20 - cy) < b.bR + 12) return true;
  return false;
}
/* his poses are the hero's own: a stand-in 'player' is fed the matching state and playerPose does the rest */
function originPose(b) {
  const g = b.ghost || (b.ghost = {});
  Object.assign(g, {state: 'normal', st: 0, atk: null, landed: b.landed, animT: b.animT, onGround: b.onGround, vx: b.vx, vy: b.vy, runPh: b.walkPh,
    flipT: 0, landT: 0, furyMax: 5, bloom: null, castPose: null, igPh: b.igPh, igYaw: b.igYaw, stormSa: 1});
  const fast = b.p3 ? 0.75 : b.phase === 2 ? 0.88 : 1;
  const set = (state, st, atk) => { g.state = state; g.st = st; g.atk = atk || null; };
  switch (b.state) {
    case 'combo':
      if (b.cT < 0) set('dash', 0);
      else if (b.cstep === 0) set('attack', 0, ATTACKS[1]);
      else set('attack', b.ast, ATTACKS[b.cstep]);
      break;
    case 'pierce': if (b.dashing) set('attack', 5, ATTACKS.pierce); else if (b.fired !== -1) set('attack', 0, ATTACKS.pierce); break;
    case 'blades': g.castPose = 'command'; set('cast', b.st); break;
    case 'sky': g.castPose = 'raise'; set('cast', b.st); break;
    case 'fury': set('fury', b.fk < 0 ? 0 : b.fk * 7 + Math.min(6, b.st - b.fkT)); break;
    case 'peak': { const plant = Math.round(20 * fast); set('plant', b.st < plant ? b.st / plant * 10 : 10 + b.st - plant); break; }
    case 'rise': if (b.st < 6) set('attack', 0, ATTACKS.pierce); else if (!b.onGround || b.st < 10) set('attack', b.st - 6, ATTACKS.rising); break;
    case 'flash': { const tele = Math.round(28 * fast); set('flash', b.st < tele ? 4 : b.st < tele + 4 ? 9 : 14); break; }
    case 'bloom': { const warn = Math.round(30 * fast); if (b.st < warn) set('attack', 0, ATTACKS[1]); else { g.bloom = {fin: b.bFin}; set('bloom', b.st); } break; }
    case 'ult': if (b.igPh) set('ilgeom', 0); break;
    case 'stun': { const s = Math.sin(b.animT * 0.1) * 0.08; return makePose({hy: -13, lean: 0.65 + s, ht: 0.6, l1: -0.1, l2: -0.8, r1: 0.5, r2: -0.9, fu: 0.15, ff: 0.1, bu: -0.1, bf: 0.1, sa: 0.3}); }
    case 'dead': {
      if (b.st < 30 && !b.kneelHold) return makePose({hy: -15, lean: -0.45, ht: -0.3, l1: -0.3, r1: 0.4, fu: 2.2, ff: 0.3, bu: -2.4, bf: 0.3, sa: 2.4});
      const kn = {hy: -9, lean: 0.4, ht: b.lookUp ? -0.35 : 0.5, l1: 0.2, l2: -1.8, r1: 1.3, r2: -1.3, fu: 0.3, ff: 0.1, bu: -0.2, bf: 0.1, sa: 0.2};
      if (b.topple) return makePose(Object.assign(kn, {rot: Math.min(1.35, b.topple * 0.06)}));
      return makePose(kn);
    }
  }
  return playerPose(g);
}

/* ---------- the chain-cutting cutscene between phase 2 and 3 ----------
   he cries out; the hero leaps and cuts each chain wound round the void, one after another; one last stroke across
   the whole screen; the black void cracks and falls away in pieces, and the Earth is behind it */
// the chains that wind round the void in phase 2: [x0, y0, x1, y1]
const ORIGIN_CHAINS = [[-20, 30, 500, 128], [-20, 196, 500, 58], [58, -10, 182, 282], [424, -10, 296, 282], [-20, 104, 500, 214],
  [214, -10, 262, 282], [-20, 160, 300, -10], [500, 176, 166, -10], [-20, 62, 500, 240], [500, 18, -10, 176]];
const O3 = {leap: 40, cut0: 56, cutStep: 7, final: 132, shatter: 146, end: 216};
let o3 = null;
function startOrigin3() {
  setScene('origin3'); queueClear = true;
  const b = boss, p = player;
  calmBoss(b); b.state = 'script'; b.vx = 0; b.vy = 0; b.queue = null; b.hp = Math.max(b.hp, 1); b.igPh = null; b.arcs = [];
  b.x = clamp(b.x, 60, W - 60); b.y = FLOOR; b.onGround = true; b.face = p.x >= b.x ? 1 : -1;
  SND.chargeStop(); SND.muffle(0); if (p.state === 'charge') p.state = 'normal'; SND.musicStop();
  p.specX = p.x; p.specY = p.onGround ? p.y : FLOOR; p.specFace = p.face; p.inv = 999;
  flash = {a: 0.8, color: C.W}; shake(8); SND.sfx.boom(); bigText = null;
  o3 = {cuts: [], final: -1, pieces: null};
}
function makeVoidPieces() {
  const out = [], cw = 60, ch = 54;
  for (let gy = 0; gy < 5; gy++) for (let gx = 0; gx < 8; gx++) {
    const x0 = gx * cw, y0 = gy * ch, j = () => rnd(-8, 8);
    const c = [[x0 + j(), y0 + j()], [x0 + cw + j(), y0 + j()], [x0 + cw + j(), y0 + ch + j()], [x0 + j(), y0 + ch + j()]];
    for (const tri of [[c[0], c[1], c[2]], [c[0], c[2], c[3]]]) {
      const mx = (tri[0][0] + tri[1][0] + tri[2][0]) / 3, my = (tri[0][1] + tri[1][1] + tri[2][1]) / 3;
      out.push({pts: tri.map(q => [q[0] - mx, q[1] - my]), x: mx, y: my, vx: (mx - 240) * 0.025 + rnd(-0.8, 0.8), vy: rnd(-2.5, 0.5), r: 0, vr: rnd(-0.07, 0.07), delay: Math.hypot(mx - 240, my - 135) / 14});
    }
  }
  return out;
}
function updOrigin3() {
  const t = sceneT, p = player, b = boss;
  b.animT++;
  if (t === O3.leap) { p.state = 'storm'; p.stormSa = Math.PI; SND.sfx.whoosh(); }
  for (let i = 0; i < ORIGIN_CHAINS.length; i++) if (t === O3.cut0 + i * O3.cutStep) {
    const c = ORIGIN_CHAINS[i], u = rnd(0.3, 0.7), cx = lerp(c[0], c[2], u), cy = lerp(c[1], c[3], u), ang = Math.atan2(c[3] - c[1], c[2] - c[0]) + Math.PI / 2 + rnd(-0.3, 0.3);
    o3.cuts.push({i, u, cx, cy, ang, t0: t});
    p.x = clamp(cx + rnd(-30, 30), 12, W - 12); p.y = clamp(cy + 20, 70, FLOOR); p.face = Math.random() < 0.5 ? 1 : -1; p.stormSa = rnd(-1, 4);
    for (let k = 0; k < 12; k++) { const v = rnd(); addP({kind: 'shard', x: lerp(c[0], c[2], v), y: lerp(c[1], c[3], v), vx: rnd(-2, 2), vy: rnd(-2, 1), g: 0.1, drag: 0.96, life: ri(20, 40), size: rnd(2, 4), ang: rnd(TAU), spin: rnd(-0.3, 0.3), blue: k % 2 === 0}); }
    SND.sfx.slash(); SND.sfx.chain(); shake(4);
  }
  if (t === O3.final) { p.x = W / 2; p.y = FLOOR; p.face = p.specFace; p.stormSa = 0.7; o3.final = t; flash = {a: 1, color: C.W}; shake(12); SND.sfx.boom(); SND.sfx.special(); }
  if (t === O3.shatter) { o3.pieces = makeVoidPieces(); SND.sfx.brk(); SND.sfx.rumble(); b.p3 = true; }
  if (o3.pieces) for (const q of o3.pieces) { if (t - O3.shatter < q.delay) continue; q.x += q.vx; q.y += q.vy; q.vy += 0.22; q.r += q.vr; }
  if (t === O3.end - 30) { SND.sfx.special(); floatText('발악', b.x, b.y - 64, C.R, 3, 60, C.W); }
  updateParticles(); updateTexts(); decayFx();
  if (t >= O3.end) {
    o3 = null;
    p.x = p.specX; p.y = p.specY; p.face = p.specFace; p.state = 'normal'; p.inv = 60; p.vx = 0; p.vy = 0;
    bossIdle(24); setScene('fight'); SND.musicStart(stageMusic(true));
    bigText = {s: '마지막 발악', t: 0, dur: 90, color: C.R, outline: C.W}; flash = {a: 0.6, color: C.R};
  }
}

/* ---------- the end of the original: after his last words, one level cut - and his head comes off ----------
   the hero walks up to where he kneels and takes the same deep stance as for 일검무귀; he looks up and gets out
   "안 돼..."; then every sound dies (hush) and only two heartbeats are heard while the camera creeps in; the cut:
   three impact frames and the picture slips apart along it; the head goes up in slow motion (slow..slowEnd) with a
   red line hanging in the air - and then the sound slams back all at once and the line bursts; the body keels
   over; the hero flicks the blood off, turns his back, and the guard clicks */
const EX = {walk: 44, say: 58, hush: 92, beat: 100, cut: 114, slow: 118, slowEnd: 162, topple: 178, flick: 192, turn: 202, click: 218, end: 266};
let ex = null;
function startExecute() {
  setScene('execute'); queueClear = true;
  const b = boss, p = player;
  b.x = clamp(b.x, 70, W - 70);
  const side = p.x >= b.x ? 1 : -1;
  Object.assign(b, {state: 'dead', st: 70, kneelHold: true, lookUp: false, hushed: false, topple: 0, vx: 0, headless: false, head: null, alpha: 1, face: side});
  p.state = 'normal'; p.vx = 0; p.vy = 0; p.y = FLOOR; p.onGround = true; p.inv = 999; p.face = -side; p.igPh = null;
  ex = {x0: clamp(p.x, 20, W - 20), x1: b.x + side * 30, side};
  SND.musicStop(); SND.muffle(0);
}
function updExecute() {
  const t = sceneT, b = boss, p = player, E = ex;
  b.animT++; p.animT++;
  if (t <= EX.walk) {
    // he walks up to where the original kneels
    const nx = lerp(E.x0, E.x1, t / EX.walk);
    p.vx = Math.abs(E.x1 - E.x0) < 4 ? 0 : nx - p.x; p.x = nx; p.runPh += Math.abs(p.vx) * 0.13; p.face = -E.side;
  }
  if (t === EX.walk) { p.vx = 0; p.state = 'ilgeom'; p.igPh = 'flat'; p.igYaw = -2.15; SND.sfx.clickD(); }
  if (t === EX.say) { b.lookUp = true; SND.sfx.heart(); }
  if (t > EX.say && t < EX.say + 20 && t % 4 === 0) SND.sfx.text();
  // the hush: the world goes silent; his trembling stops; two heartbeats; a glint runs along the hero's blade
  if (t === EX.hush) { SND.muffle(2, 0.08); b.hushed = true; }
  if (t === EX.beat || t === EX.beat + 9) SND.sfx.heartD(1);
  if (t === EX.beat + 4) { const q = playerPose(p), g = swordGeom(p.x, p.y, p.face, q, SWORD_LEN); glint(g.h[0] + g.d[0] * g.L * 0.8, g.h[1] + g.d[1] * g.L * 0.8, 8); }
  if (t === EX.cut) SND.sfx.edge();
  if (t >= EX.cut) p.igYaw = lerp(-2.15, 1.95, clamp((t - EX.cut + 1) / 3, 0, 1));
  if (t === EX.cut + 2) {
    // 뎅강
    const q = bossPose(b), J = solve(q), X = figXform(b.x, b.y, b.face, q, 1), h = X.T(J.head), nk = X.T(J.neck);
    b.headless = true; b.head = {x: h[0], y: h[1], vx: -E.side * 2.4, vy: -5.2, r: 0, vr: -E.side * 0.3, rest: false, trail: []};
    b.neck = nk; E.cutY = nk[1] - 3;
    shake(10); zoomPunch = 1;
    addP({kind: 'bigcut', x: nk[0] - E.side * 8, y: nk[1] - 3, ang: -E.side * 0.08, r: 46, c1: C.R, c2: C.W, life: 18});
    for (let i = 0; i < 32; i++) addP({x: nk[0], y: nk[1] - 2, vx: -E.side * rnd(0.5, 4.5) + rnd(-1, 1), vy: -rnd(1.5, 6), g: 0.2, life: ri(24, 44), color: i % 4 ? C.R : C.K, size: Math.random() < 0.5 ? 2 : 1, bounce: true});
  }
  // the moment the slow motion ends every sound comes back at once, and the line of the cut bursts
  if (t === EX.slowEnd) {
    SND.muffle(0, 0.03); SND.sfx.boom(); SND.sfx.impact(); SND.sfx.brk(); SND.sfx.slash();
    shake(14); flash = {a: 0.35, color: C.R}; zoomPunch = 1;
    for (let i = 0; i < 26; i++) addP({x: b.neck[0], y: b.neck[1] - 2, vx: -E.side * rnd(0.5, 3) + rnd(-1.5, 1.5), vy: -rnd(2, 6.5), g: 0.2, life: ri(24, 40), color: i % 5 ? C.R : C.W, size: 2, bounce: true});
    for (let i = 0; i < 12; i++) addP({kind: 'line', x: b.neck[0] + rnd(-60, 60), y: E.cutY + rnd(-3, 3), vx: -E.side * rnd(4, 9), vy: 0, drag: 0.88, life: ri(8, 14), color: i % 2 ? C.R : C.W, size: 1, len: 3});
  }
  const slowK = t >= EX.slow && t < EX.slowEnd ? 0.25 : 1;
  // the spray from the neck
  if (b.headless && t < EX.slowEnd + 30 && t % (slowK < 1 ? 6 : 2) === 0) addP({x: b.neck[0], y: b.neck[1] - 1, vx: -E.side * rnd(0.3, 1.8), vy: -rnd(1, 3.2), g: 0.2, life: ri(12, 22), color: C.R, size: 1, bounce: true});
  const H = b.head;
  if (H && !H.rest) {
    if (slowK < 1) { H.trail.push([H.x, H.y, H.r]); if (H.trail.length > 5) H.trail.shift(); } else if (H.trail.length) H.trail.shift();
    H.vy += 0.25 * slowK; H.x += H.vx * slowK; H.y += H.vy * slowK; H.r += H.vr * slowK;
    if (H.y >= FLOOR - 4) {
      H.y = FLOOR - 4; H.vy *= -0.35; H.vx *= 0.6; H.vr *= 0.6;
      if (Math.abs(H.vy) < 0.9) { H.vy = 0; H.rest = true; }
      else { SND.sfx.land(); addP({x: H.x, y: FLOOR - 1, vx: rnd(-1, 1), vy: -rnd(0.5, 1.5), g: 0.2, life: 14, color: C.R, size: 1}); }
    }
    H.x = clamp(H.x, 6, W - 6);
  }
  if (t >= EX.topple) b.topple++;
  if (t === EX.topple + 18) { dust(b.x, FLOOR, 10); SND.sfx.land(); }
  if (t === EX.flick) {
    p.igPh = 'flick';
    const q = playerPose(p), g = swordGeom(p.x, p.y, p.face, q, SWORD_LEN);
    for (let i = 0; i < 12; i++) { const u = rnd(0.3, 1); addP({x: g.h[0] + g.d[0] * g.L * u, y: g.h[1] + g.d[1] * g.L * u, vx: p.face * rnd(1.5, 4), vy: rnd(0.5, 2.5), g: 0.2, life: ri(18, 30), color: C.R, size: 2, bounce: true}); }
  }
  if (t === EX.turn) { p.igPh = 'back'; p.face = E.side; }
  if (t === EX.click) { SND.sfx.clickD(); const q = playerPose(p), g = swordGeom(p.x, p.y, p.face, q, SWORD_LEN); glint(g.h[0] + g.d[0] * 4, g.h[1] + g.d[1] * 4, 7); }
  // in the slow motion the flying blood only moves every fourth frame
  if (slowK === 1 || t % 4 === 0) updateParticles();
  updateTexts(); decayFx();
  if (t >= EX.end || (t > EX.topple + 20 && confirmP())) {
    p.state = 'normal'; p.igPh = null; p.inv = 60; ex = null;
    setScene('victory2');
  }
}
