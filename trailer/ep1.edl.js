// 「길 좀 묻자」 - a one-minute short on the game's art, keyframed by hand (anim.js): no game logic runs.
// a man with no memory walks through the chain graveyard; the Rapid Fire Bowmaster takes it personally.
// music: the game's own synthesized themes (training ground -> the bowmaster's fight -> its intense variation).
window.__EDL = (() => {
  const segs = [], cues = [];
  let f = 0;
  const add = s => { s.f0 = f; segs.push(s); for (const [rel, ...c] of (s.cues || [])) cues.push([f + Math.round(rel), ...c]); f += s.len; return s; };
  const A = __A, HE = A.hero, BW = A.bow;
  const LB = 96;
  const shot = (len, frame, o = {}) => add(Object.assign({shot: 'anim', len: Math.round(len), frame, lb: LB, smoothFade: true}, o));
  const G = {ph: 0, hx: 100, blades: [], leaf: null};

  /* ---------- helpers ---------- */
  const sg = (i, a, b) => clamp((i - a) / (b - a), 0, 1), sm = u => u * u * (3 - 2 * u), eo = u => 1 - (1 - u) * (1 - u), L = lerp;
  const BEAT = 3600 / 152, BEAT2 = 3600 / 172, bt = k => Math.round(k * BEAT), bt2 = k => Math.round(k * BEAT2);
  const legs = (ph, sp) => {
    const leg = a => [0.1 + 0.95 * Math.sin(a) * sp, -(0.3 + 1.6 * Math.max(0, Math.cos(a))) * (0.4 + 0.6 * sp)];
    const [r1, r2] = leg(ph), [l1, l2] = leg(ph + Math.PI);
    return {l1, l2, r1, r2, hy: -15.2 - Math.abs(Math.cos(ph)) * sp};
  };
  // the hero: greatsword resting on the shoulder
  const CARRY = {lean: 0.1, ht: 0.05, bu: -0.25, bf: 0.45, fu: 0.3, ff: 1.9, sa: -2.0};
  // in a fight he walks with the blade low behind him (the game's own run carriage)
  const LOW = {lean: 0.16, ht: 0, bf: 1.3, fu: -0.35, ff: 0.5, sa: -1.38};
  const STAND = {hy: -16, l1: -0.22, l2: 0, r1: 0.28, r2: -0.1};
  const IDLE = {hy: -15.2, lean: 0.14, ht: 0.05, l1: -0.38, l2: -0.12, r1: 0.42, r2: -0.28, bu: -0.25, bf: -0.5, fu: 0.55, ff: -0.35, sa: -1.25};
  const breath = (t, k = 1) => { const b = Math.sin(t * 0.06) * k, b2 = Math.sin(t * 0.023) * k; return {b, b2}; };
  const qStand = o => { const {b, b2} = breath(player.animT); return makePose(Object.assign({}, IDLE, {hy: -15.2 + b * 0.5, lean: 0.14 + b * 0.02, ht: 0.05 + b2 * 0.06, bu: -0.25 + b * 0.05, fu: 0.55 + b * 0.03, sa: -1.25 + b * 0.02}, o)); };
  const breathe = q => { const {b} = breath(boss.animT); q.hy += b * 0.45; q.lean += b * 0.02; return q; };
  const STRIDE = 4.2;   // ground covered per radian of the walk cycle at this stride
  const wph = x => x / STRIDE;
  const qWalk = (ph, o) => makePose(Object.assign({}, CARRY, legs(ph, 0.45), {bu: -0.25 - Math.sin(ph) * 0.3}, o));
  const qWalkLow = (ph, o) => makePose(Object.assign({}, LOW, legs(ph, 0.5), {bu: -Math.sin(ph) * 0.5 - 0.2}, o));
  const qGuard = o => makePose(Object.assign({hy: -14.5, lean: 0.12, l1: -0.45, l2: 0.1, r1: 0.55, r2: -0.3, fu: 1.35, ff: 1.45, bu: 1.2, bf: 1.5, sa: Math.PI}, o));
  const qCharge = t => makePose({hy: -9, lean: 0.15 + Math.sin(t * 0.9) * 0.05, l1: 0.2, l2: -1.7, r1: 1.2, r2: -2.0, bu: 2.8, bf: 0.1, fu: 2.95, ff: 0.05, sa: Math.PI});
  const qCrouch = o => makePose(Object.assign({hy: -10, lean: 0.6, l1: -0.9, l2: -0.6, r1: 1.2, r2: -1.7, bu: -1.4, bf: 0.4, fu: 0.4, ff: 0.2, sa: -1.6}, o));
  const qFollow = o => makePose(Object.assign({hy: -11, lean: 0.75, ht: -0.1, l1: -1.3, l2: 0.15, r1: 0.95, r2: -1.2, bu: -1.7, bf: 0.4, fu: 1.5, ff: 0.1, sa: 1.75}, o));
  const qLean = u => makePose(lerpPose(Object.assign({}, IDLE),
    {hy: -11.5, lean: -1.05, ht: -0.25, l1: 0.95, l2: -1.9, r1: 1.35, r2: -1.6, bu: 2.3, bf: 0.6, fu: -1.1, ff: 0.4, sa: -2.0}, u));
  // the bowmaster
  const qKneel = o => breathe(makePose(Object.assign({hy: -9, lean: 0.4, ht: 0.5, l1: 0.2, l2: -1.8, r1: 1.3, r2: -1.3, fu: 0.3, ff: 0.1, bu: -0.2, bf: 0.1}, o)));
  const qSit = o => breathe(makePose(Object.assign({hy: -4, lean: -0.12, ht: 0.3, l1: 2.0, l2: -1.9, r1: 2.3, r2: -2.05, fu: 1.45, ff: 0.5, bu: -0.7, bf: 0.3}, o)));
  const qBlock = o => makePose(Object.assign({hy: -17, lean: -0.3, ht: -0.1, l1: 0.6, l2: -1.5, r1: 1.0, r2: -1.4, fu: 2.5, ff: 0.5, bu: 2.7, bf: -0.4}, o));
  const qLanded = o => makePose(Object.assign({hy: -12, lean: 0.45, ht: 0.1, l1: -1.0, l2: 0.2, r1: 0.9, r2: -1.2, fu: 1.4, ff: 0.1, bu: -1.6, bf: 0.4}, o));
  const qPalm = o => breathe(makePose(Object.assign({hy: -15.6, lean: 0.12, ht: 0.55, l1: -0.3, l2: -0.08, r1: 0.34, r2: -0.2, fu: 0.6, ff: 0.4, bu: 2.75, bf: 1.6}, o)));
  const jt = (a, pose, name) => { const q = pose(a), J = solve(q), X = figXform(a.x, a.y, a.face, q, 1); return X.T(J[name]); };
  const hHead = () => jt(player, playerPose, 'head'), bHead = () => jt(boss, bossPose, 'head');
  const at = (a, b, sp) => { const dx = b[0] - a[0], dy = b[1] - a[1], d = Math.hypot(dx, dy) || 1; return [dx / d * sp, dy / d * sp, d / sp]; };
  // an arrow drawn like the game's, at any size
  const bigArrow = (x, y, ang, s) => {
    ctx.save(); ctx.translate(x, y); ctx.rotate(ang); ctx.scale(s, s); ctx.lineCap = 'round';
    ctx.strokeStyle = C.W; ctx.lineWidth = 3; poly([[-14, 0], [0, 0]]);
    ctx.strokeStyle = C.K; ctx.lineWidth = 1.4; poly([[-14, 0], [0, 0]]);
    ctx.fillStyle = C.K; ctx.beginPath(); ctx.moveTo(2.5, 0); ctx.lineTo(-3, -2.4); ctx.lineTo(-3, 2.4); ctx.fill();
    ctx.strokeStyle = C.G2; ctx.lineWidth = 1.2; poly([[-14, 0], [-17, -2.5]]); poly([[-14, 0], [-17, 2.5]]);
    ctx.restore();
  };
  // captions drawn on the 1080p frame with the game's own type
  const cap = (og, s, o) => {
    const r = kRender(s, o.sc ?? 2, o.color || C.W, o.outline === undefined ? C.K : o.outline), S = o.S || 3;
    og.globalAlpha = o.a ?? 1;
    og.drawImage(r.cv, Math.round(o.x - (o.align === 'left' ? 0 : r.w * S / 2) - r.pad * S), Math.round(o.y - r.pad * S), r.cv.width * S, r.cv.height * S);
    og.globalAlpha = 1;
  };
  const bgLines = (col, line, cx = 240, cy = 135, o = {}) => () => { A.fill(col); A.speedLines(cx, cy, Object.assign({color: line}, o)); };
  const bgPlain = col => () => A.fill(col);
  const leafIdle = () => { if (globalT % 9 === 0) addP({kind: 'leaf', x: rnd(-20, W), y: rnd(10, 60), vx: rnd(0.1, 0.6), vy: rnd(0.3, 0.7), life: 260, color: Math.random() < 0.5 ? C.G2 : C.G1, size: 2}); };
  const smoke = (x, y, n) => { for (let k = 0; k < n; k++) addP({x: x + rnd(-28, 28), y: y - rnd(0, 52), vx: rnd(-0.7, 0.7), vy: -rnd(0.05, 0.5), drag: 0.975, life: ri(90, 150), color: Math.random() < 0.6 ? '#8a8a8a' : Math.random() < 0.6 ? C.W : '#4a4a4a', size: ri(3, 7)}); };
  const sparks = (x, y, n, cols = [C.W, C.Y]) => { for (let k = 0; k < n; k++) addP({x, y, vx: rnd(-3, 3), vy: rnd(-3.5, 1), g: 0.15, life: ri(10, 18), color: cols[k % cols.length], size: 2}); };
  const shards = (x, y, n) => { for (let k = 0; k < n; k++) { const a = rnd(TAU), s = rnd(1.5, 4.5); addP({kind: 'shard', x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s - 1, drag: 0.95, life: ri(24, 44), size: rnd(2, 4.5), ang: a, spin: 0.25}); } };

  /* ================= COLD OPEN: a stroll through the graveyard, to the training-ground theme ================= */
  shot(150, i => {
    BW.idle(405, -1);
    G.hx = -24 + Math.max(0, i - 8) * 0.8;
    HE.pose(G.hx, FLOOR, 1, qWalk(wph(G.hx)));
    leafIdle(); A.tick();
    A.render({cam: {x: L(228, 262, sm(i / 149)), y: 150, z: L(1.12, 1.3, sm(i / 149))}});
  }, {init: () => { A.init(); G.ph = 0; }, fadeIn: 40, cues: [[0, 'music', 'calm']],
    over: (og, i, OW, OH) => { const a = clamp(Math.min((i - 40) / 20, (146 - i) / 16), 0, 1); if (a > 0) { og.globalAlpha = 0.72 * a; og.fillStyle = '#000'; og.fillRect(0, 700, 760, 210); og.globalAlpha = a; og.fillStyle = C.R; og.fillRect(0, 700, Math.round(760 * a), 4); og.globalAlpha = 1; cap(og, '제1화', {x: 110, y: 735, sc: 2, a, align: 'left', S: 3}); cap(og, '사슬의 묘지', {x: 110, y: 790, sc: 4, a, align: 'left', S: 3}); } }});

  // over the shoulder: the bowmaster, huge and black in the foreground; the walker, small, far away
  shot(110, i => {
    boss.hidden = true; BW.idle(405, -1);
    G.hx += 0.8; HE.pose(G.hx, FLOOR, 1, qWalk(wph(G.hx)));
    leafIdle(); A.tick();
    A.render({cam: {x: 190, y: 180, z: 1.3}, screen: () => {
      const q = bossPose(boss);
      A.fig('bow', 408, 322, -1, q, 4.6, {color: C.K, outline: C.K, eyes: C.R, scarf: {color: C.G1, n: 2, wind: 1.8}});
    }});
    boss.hidden = false;
  });
  // the eye
  shot(54, i => {
    BW.idle(405, -1); A.tick();
    const h = bHead();
    A.render({cam: {x: h[0] - 2, y: h[1] + 1, z: 9}, bg: bgLines(C.G1, C.K, 240, 135, {n: 50, r0: 110, every: 99})});
    if (i === 22) { A.star(h[0] - 3, h[1] - 1, 4, 10); __T.sfx('reflect'); }
  }, {cues: []});
  // the draw, and the shot
  shot(70, i => {
    BW.aim(405, FLOOR, -1, Math.PI + 0.03, i >= 48);
    if (i === 48) { const [x, y] = BW.bowPt(); G.arrow = A.arrow(x - 10, y, -14, 0); A.twang(x, y); shakeAmt = 3; __T.sfx('arrow'); __T.sfx('whoosh'); }
    A.tick();
    const h = bHead(), k = i >= 48 ? eo(sg(i, 48, 56)) : 0;
    A.render({cam: {x: h[0] - 14, y: h[1] + 14, z: 3.1 + 0.4 * k, r: -0.1, sx: 270}});
  });
  // following the arrow
  shot(40, i => {
    boss.hidden = true; A.hideHero = true;
    if (i === 0) { arrows.length = 0; G.arrow = A.arrow(330, 200, -14, 0); __T.sfx('whoosh'); }
    A.tick();
    const a = G.arrow;
    A.render({cam: {x: a.x - 6, y: a.y, z: 4.4}, bg: () => { A.fill(C.W); A.streaks(0, {color: '#8a8a8a', n: 40, speed: -30, seed: 3}); A.streaks(0, {color: C.K, n: 14, speed: -42, seed: 9}); }});
    boss.hidden = false; A.hideHero = false;
  });
  // the arrow: without looking, without breaking stride, he tips the blade on his shoulder into its path - tink
  const CF = 26;
  shot(130, i => {
    if (i === 0) arrows.length = 0;
    const frozen = i >= CF && i < CF + 8;
    if (!frozen) G.hx += 0.75;
    // the blade tips forward to meet it, then settles back; afterwards a glance up, nothing more
    const tip = sm(sg(i, CF - 7, CF - 1)) * (1 - sm(sg(i, CF + 10, CF + 22))), look = sm(sg(i, 60, 70)) * (1 - sm(sg(i, 84, 96)));
    const q = (x, k) => qWalk(wph(x), {sa: -2.0 - 0.55 * k, fu: 0.3 + 0.25 * k, ht: 0.05 - 0.25 * look});
    HE.pose(G.hx, FLOOR, 1, q(G.hx, tip));
    BW.idle(405, -1);
    if (i === 0) {
      // aim at the middle of the blade as it will be on the frame of contact
      const x = G.hx + CF * 0.75, [b0, b1] = swordLine(x, FLOOR, 1, q(x, 1), SWORD_LEN), hit = [L(b0[0], b1[0], 0.3), L(b0[1], b1[1], 0.3)];
      G.hit = hit; G.arrow = A.arrow(hit[0] + 14 * CF, hit[1], -14, 0);
    }
    if (i === CF) {
      const a = G.arrow, [x, y] = G.hit;
      a.x = x; a.y = y; a.vx = -2.4; a.vy = -6.8; a.g = 0.3; a.stick = true;
      __T.kick(2); A.star(x, y, 14, 8); sparks(x, y, 10); shakeAmt = 2; __T.sfx('reflect'); __T.sfx('parry');
    }
    leafIdle(); A.tick(frozen ? 0 : 1);
    A.render({cam: {x: G.hx + 34, y: 202, z: 2.4, sx: 205}});
  }, {cues: [[CF, 'musicStop']]});
  // the bowmaster: ?
  shot(64, i => {
    BW.idle(405, -1); leafIdle(); A.tick();
    const h = bHead();
    A.render({cam: {x: h[0] + 4, y: h[1] + 16, z: L(3.2, 3.6, sm(i / 63))}, world: () => {
      if (i >= 8) A.emote('?', h[0] + 1, h[1] - 8, i - 8, 0.45);
      if (i >= 30) A.emote('sweat', h[0] - 8, h[1] - 2, i - 30, 0.5);
    }});
  }, {cues: [[8, 'sfx', 'text']]});

  /* ================= THE EXCHANGE ================= */
  shot(150, i => {
    HE.pose(235, FLOOR, 1, qStand()); BW.idle(405, -1); A.tick();
    const z = L(3.6, 4.3, sm(i / 149)), hh = hHead(), bh = bHead();
    A.panels([
      {cam: {x: hh[0] + 3, y: hh[1] + 9, z, sx: 118, sy: 140}, bg: bgLines(C.W, C.K, 118, 128, {n: 60, r0: 62})},
      {cam: {x: bh[0] - 3, y: bh[1] + 9, z, sx: 360, sy: 140}, bg: bgLines(C.G3, C.G1, 360, 128, {n: 60, r0: 62})},
    ], [[[0, 0], [264, 0], [216, H], [0, H]], [[264, 0], [W, 0], [W, H], [216, H]]]);
  }, {subs: [{who: 'boss', text: '사슬을 거스르는 자는, 모두 꿰뚫는다!', at: 8, dur: 136, speed: 1.4}], cues: [[0, 'sfx', 'chain']]});
  shot(120, i => {
    HE.pose(235, FLOOR, 1, qStand({ht: 0.05 + 0.12 * sm(sg(i, 60, 76))})); BW.idle(405, -1); A.tick();
    const hh = hHead();
    A.render({cam: {x: hh[0] + 2, y: hh[1] + 13, z: L(4.1, 4.6, sm(i / 119))}, bg: bgPlain(C.W)});
  }, {subs: [{who: 'hero', text: '...그래서. 여기가 어디냐?', at: 10, dur: 104, speed: 1.8}]});
  shot(80, i => {
    BW.idle(405, -1); A.tick(); shakeAmt = Math.max(shakeAmt, 2.5);
    if (i === 70) flash = {a: 1, color: C.W};
    const h = bHead();
    A.render({cam: {x: h[0], y: h[1] + 6, z: L(4.6, 5.6, eo(i / 79)), r: L(0.02, 0.08, i / 79)}, bg: bgLines(C.R, C.K, 240, 120, {n: 90, r0: 46}),
      world: () => A.emote('anger', h[0] + 7, h[1] - 7, i, 0.5)});
  }, {subs: [{who: 'boss', text: '......꿰뚫어 주마!!!', at: 4, dur: 66, speed: 1.2}], cues: [[2, 'sfx', 'warn']]});

  /* ================= ROUND ONE (the bowmaster's theme, 152 bpm: one cut or one blow per beat) ================= */
  // rapid fire: every arrow knocked out of the air, on the beat, without slowing down
  const arr = [1, 2, 3, 4, 5, 6, 7].map(k => bt(k));
  shot(bt(8), i => {
    const hx = 170 + i * 0.6; G.hx = hx;
    let atk = null; arr.forEach((fa, k) => { if (i >= fa - 3 && i < fa + 10) atk = {id: k % 2 ? 2 : 1, st: i - (fa - 3)}; });
    if (atk) HE.attack(atk.id, atk.st, hx, 1); else HE.pose(hx, FLOOR, 1, qWalkLow(wph(hx) * 0.9));
    const k = arr.findIndex(fa => i === fa - bt(1) + (fa === arr[0] ? 0 : 0));
    const spawnK = [0, 1, 2, 3, 4, 5, 6].find(k => i === bt(k));
    let last = -99; for (let k = 0; k < 7; k++) if (i >= bt(k)) last = bt(k);
    const tgt = [170 + arr[Math.min(6, Math.max(0, [0, 1, 2, 3, 4, 5, 6].filter(k => i >= bt(k)).length - 1))] * 0.6 + 12, FLOOR - 22];
    BW.aim(410, FLOOR, -1, Math.atan2(tgt[1] - 215, tgt[0] - 401), i - last < 7 && i < bt(7));
    if (spawnK != null && spawnK < 7) {
      const fa = arr[spawnK], tx = 170 + fa * 0.6 + 12, ty = FLOOR - 22, sx = 391, sy = 215;
      A.arrow(sx, sy, (tx - sx) / (fa - i), (ty - sy) / (fa - i)); A.twang(sx + 8, sy); __T.sfx('arrow');
    }
    const hit = arr.indexOf(i);
    if (hit >= 0) {
      for (const a of arrows) if (!a.hit && Math.abs(a.x - (hx + 12)) < 8) {
        a.hit = true; a.vx = rnd(1.5, 3.5); a.vy = -rnd(6, 8); a.g = 0.32; a.spin = 0.3; a.stick = true;
        A.star(a.x, a.y, 13, 7); sparks(a.x, a.y, 6); slashMark(a.x, a.y, rnd(-0.5, 0.5), 18); shakeAmt = 2;
        __T.sfx(hit % 2 ? 'reflect' : 'parry');
      }
    }
    leafIdle(); A.tick();
    A.render({cam: {x: (hx + 405) / 2, y: 205, z: 1.5, r: 0.035}, world: () => { if (i > bt(7) + 4) { const h = bHead(); A.emote('anger', h[0] + 7, h[1] - 9, i - bt(7), 0.7); } }});
  }, {cues: [[0, 'musicStop'], [0, 'music', 'fight']]});
  // he leaps into the sky; the camera tilts up after him
  shot(bt(2), i => {
    HE.pose(G.hx, FLOOR, 1, qStand({ht: -0.3 * sm(sg(i, 10, 24))}));
    if (i < 8) BW.set({x: 410, y: FLOOR, face: -1, state: 'gale', kneel: true, drawing: false, st: 999, pose: null, onGround: true, alpha: 1});
    else { const u = eo(sg(i, 8, 36)), x = L(410, 382, u), y = L(FLOOR, 95, u); BW.aim(x, y, -1, Math.atan2(FLOOR - 30 - (y - 25), G.hx - x), false, 'leap'); }
    if (i === 8) { boss.kneel = false; leafBurst(410, 228, 20); dust(410, FLOOR, 10); __T.sfx('jump'); __T.sfx('whoosh'); }
    if (i > 30 && i % 5 === 0) addP({kind: 'ring', x: boss.x, y: boss.y - 22, r0: 6, rMax: 22, life: 10, color: C.G2, size: 1});
    A.tick();
    const u = sm(i / 46);
    A.render({cam: {x: L(330, 356, u), y: L(198, 140, u), z: 1.65, r: L(0, -0.14, u)}});
  });
  // a stream of arrows, and he climbs it: one arrow underfoot per beat
  const BP = [382 - 9, 95 - 25], P = [[0, FLOOR], [302, 206], [324, 174], [346, 142], [364, 116]];
  shot(bt(4), (i, st) => {
    if (i === 0) { P[0][0] = G.hx; arrows.length = 0; G.stepA = []; st.steps = [1, 2, 3].map(k => { const tip = [P[k][0] - 2, P[k][1] + 2], [vx, vy, T0] = at(BP, tip, 6.5); return {k, vx, vy, s: bt(k) - T0}; }); }
    const j = Math.min(3, [1, 2, 3].filter(k => i >= bt(k)).length), a0 = bt(j), a1 = bt(j + 1), u = (i - a0) / (a1 - a0);
    const x = L(P[j][0], P[j + 1][0], u), y = L(P[j][1], P[j + 1][1], u) - 16 * Math.sin(Math.PI * u);
    const vy = (L(P[j][1], P[j + 1][1], u + 0.05) - 16 * Math.sin(Math.PI * (u + 0.05))) - y;
    if (i === a0) { player.flipT = j === 3 ? 18 : 0; addP({kind: 'ring', x: P[j][0], y: P[j][1], r0: 3, rMax: 14, life: 9, color: C.W, size: 2}); dust(P[j][0], P[j][1], j ? 3 : 8); __T.sfx('jump'); }
    HE.air(x, y, vy * 6, {flip: player.flipT});
    for (const s of st.steps) if (i === Math.max(0, Math.ceil(s.s))) { const n = bt(s.k) - i; G.stepA.push({x: P[s.k][0] + 12 - s.vx * n, y: P[s.k][1] + 3 - s.vy * n, vx: s.vx, vy: s.vy}); }
    for (const a of G.stepA) { a.x += a.vx; a.y += a.vy; }
    if (i % 6 === 3 && i < bt(3.4)) { const [vx, vy] = at(BP, [x - rnd(18, 34), y - rnd(-14, 10)], 7.5); A.arrow(BP[0] - 6, BP[1], vx, vy); if (i % 12 === 3) __T.sfx('arrow'); }
    BW.aim(382, 95, -1, Math.atan2(y - 20 - BP[1], x - BP[0]), i % 6 < 3, 'leap');
    if (i % 5 === 0) addP({kind: 'ring', x: 382, y: 73, r0: 6, rMax: 22, life: 10, color: C.G2, size: 1});
    A.tick();
    A.render({cam: {x: L(P[j][0], P[j + 1][0], u) + 16, y: L(P[j][1], P[j + 1][1], u) - 26, z: 2.6, r: -0.16}, world: () => { for (const a of G.stepA) bigArrow(a.x, a.y, Math.atan2(a.vy, a.vx), 2.2); },
      screen: () => A.streaks(-0.75, {color: '#8a8a8a', n: 16, speed: 22, seed: 13})});
  });
  // the clash, on a page of speed lines
  shot(bt(2), i => {
    arrows.length = 0;
    const freeze = i >= 5 && i < 20, push = Math.max(0, i - 20);
    HE.attack('air2', Math.min(16, i * 1.8), 350 - push * 1.6, 1, 114 + push * 0.8);
    BW.pose(380 + push * 1.6, 100 - push * 0.4, -1, qBlock()); BW.set({state: 'leap', drawing: true, aim: -2.2, releaseT: 5, st: 999, onGround: false});
    if (i === 5) { __T.kick(3); A.star(366, 92, 30, 12); shakeAmt = 9; flash = {a: 0.5, color: C.W}; sparks(366, 92, 16); __T.sfx('hit', true); __T.sfx('parry'); __T.sfx('impact'); }
    A.tick(freeze ? 0.04 : 1);
    const z = i < 5 ? 2.9 : L(3.0, 3.6, eo(sg(i, 5, 20))) - 0.9 * sm(sg(i, 20, 46));
    A.render({cam: {x: 366, y: 100, z, r: 0.1}, bg: bgLines(C.W, C.K, 240, 128, {n: 80, r0: 40})});
  });
  // flung apart: he somersaults down, the bowmaster backflips away and lands kneeling
  shot(bt(3), i => {
    const u = sg(i, 0, 44);
    if (i < 44) HE.air(L(338, 230, u), 125 - 60 * u + 175 * u * u, 4, {flip: i === 0 ? 18 : player.flipT});
    else { player.landT = Math.max(0, 8 - (i - 44)); Object.assign(player, {x: 230, y: FLOOR, face: 1, state: 'normal', vx: 0, onGround: true, pose: player.landT ? null : qStand()}); }
    if (i === 44) { dust(230, FLOOR, 10); __T.sfx('land'); }
    const v = sg(i, 0, 40);
    if (i < 40) BW.flip(L(392, 420, v), L(100, FLOOR, v * v), -1, L(0, -TAU, eo(v)));
    else BW.aim(420, FLOOR, -1, Math.PI, false, 'groundshot');
    if (i === 40) { leafBurst(420, 228, 12); dust(420, FLOOR, 8); __T.sfx('land'); }
    A.tick();
    const k = sm(i / 70);
    A.render({cam: {x: L(360, 325, k), y: L(150, 200, k), z: L(1.45, 1.6, k), r: L(0.07, 0, k)}});
  });
  // the earth splitter skims the ground; he goes over it, slowly
  shot(bt(4), (i, st) => {
    if (i === 0) { st.gt = 0; arrows.length = 0; }
    const ts = st.gt >= 16 && st.gt < 30 ? 0.3 : 1, g = st.gt;
    BW.aim(420, FLOOR, -1, Math.PI, g >= 4 && g < 14, 'groundshot');
    if (g >= 4 && g - ts < 4) { A.arrow(404, FLOOR - 7, -9, 0, {kind: 'giant'}); shakeAmt = 4; dust(410, FLOOR, 10); __T.sfx('beam'); }
    const tj = g - 12;
    if (tj < 0) HE.pose(230, FLOOR, 1, qStand());
    else if (tj < 40) { if (tj - ts < 0) { player.flipT = 18; dust(230, FLOOR, 6); __T.sfx('jump'); } HE.air(230 + tj * 0.6, FLOOR - (5.6 * tj - 0.14 * tj * tj), 5.6 - 0.28 * tj, {flip: player.flipT}); }
    else { if (tj - ts < 40) { dust(254, FLOOR, 8); __T.sfx('land'); } player.landT = Math.max(0, 8 - (tj - 40)); Object.assign(player, {x: 254, y: FLOOR, state: 'normal', vx: 0, onGround: true, pose: player.landT > 0 ? null : qStand()}); }
    A.tick(ts); st.gt += ts;
    const slow = st.gt >= 16 && st.gt < 30;
    A.render({cam: {x: 300, y: 212, z: 2.05}, tint: slow ? [C.B, 0.22] : null, world: () => { if (g > 4 && g < 16) { const h = hHead(); A.emote('!', h[0], h[1] - 10, g - 4, 0.6); } }});
  });
  // a dash, a thrust - into a burst of leaves; and the arrowhead is already at the back of his head
  shot(bt(4), (i, st) => {
    if (i === 0) arrows.length = 0;
    let hx;
    if (i < 14) { hx = 254 + i * 4.4; HE.dash(hx, 1); if (i % 2 === 0) addAfter(player, '#9a9a9a'); if (i === 0) __T.sfx('dash'); }
    else if (i < 30) { hx = 315 + (i - 14) * 5.6; HE.attack('pierce', i - 14, hx, 1); if (i === 14) __T.sfx('pierce'); }
    else { hx = 405 + 8 * eo(sg(i, 30, 40)); if (i < 40 && i % 2 === 0) dust(hx, FLOOR, 2); HE.pose(hx, FLOOR, i >= 44 && i < 50 ? -1 : 1, qStand()); }
    G.hx = hx;
    if (i < 22) BW.set({x: 420, y: FLOOR, face: -1, state: i < 8 ? 'gale' : 'idle', kneel: i < 8, drawing: false, st: 999, pose: null, onGround: true, alpha: 1});
    else if (i < 56) boss.alpha = 0;
    if (i === 22) { leafBurst(420, 220, 26); __T.sfx('dash'); }
    if (i >= 56) { const bx = 413 - 44; BW.aim(bx, FLOOR, 1, Math.atan2(hHead()[1] + 2 - 215, hx - (bx + 9)), false); boss.alpha = 1; if (i === 56) { leafBurst(bx, 220, 16); __T.sfx('dash'); } }
    if (i === 62) __T.sfx('warn');
    A.tick();
    const k = sm(sg(i, 26, 40));
    A.render({cam: {x: L(hx + 30, 395, k), y: L(206, 205, k), z: L(2.2, 2.6, k), r: L(0.05, 0, k)},
      screen: () => { if (i < 30) A.streaks(0, {color: '#8a8a8a', n: 22, speed: 26, seed: 5}); },
      world: () => { const h = hHead(); if (i >= 44 && i < 56) A.emote('?', h[0], h[1] - 8, i - 44, 0.5); if (i >= 62) A.emote('!', h[0], h[1] - 8, i - 62, 0.5); }});
  });
  // slow motion: he leans back under it - then the world speeds up again
  shot(bt(4), (i, st) => {
    if (i === 0) { st.gt = 0; const [x, y] = [369 + 9, 215], h = hHead(); G.arrow = A.arrow(x + 8, y, 9, (h[1] + 3 - y) / ((h[0] - x) / 9)); __T.sfx('just'); }
    const resume = i >= 66, ts = resume ? 1 : 0.07, g = st.gt;
    if (!resume) { HE.pose(G.hx, FLOOR, -1, qLean(sm(clamp(g / 1.6, 0, 1)))); }
    else {
      const k = i - 66;
      if (k < 18) HE.attack(4, k, G.hx - k * 1.2, -1); else HE.pose(G.hx - 21, FLOOR, -1, qStand());
      if (k === 0) flash = {a: 0.6, color: C.W};
      if (k === 4) { __T.kick(2, true); A.star(boss.x + 6, 205, 22, 9); sparks(boss.x, 205, 12, [C.R, C.W]); shakeAmt = 8; __T.sfx('counter'); __T.sfx('hit', true); }
    }
    if (i < 70) BW.aim(369, FLOOR, 1, 0, true);
    else { const v = sg(i, 70, 94); BW.flip(L(369, 96, v), FLOOR - 70 * Math.sin(Math.PI * v), 1, L(0, -TAU * 1.5, v)); if (i === 94) { dust(96, FLOOR, 14); shakeAmt = 6; __T.sfx('land'); } }
    A.tick(ts); st.gt += ts;
    const mid = [(G.hx + 369) / 2, 206];
    A.render(resume ? {cam: {x: L(mid[0], 240, sm(sg(i, 70, 94))), y: L(200, 170, sm(sg(i, 70, 94))), z: L(2.2, 1.15, sm(sg(i, 66, 94)))}}
      : {cam: {x: mid[0], y: mid[1], z: 3.9, r: L(-0.04, 0.13, sm(i / 66))}, tint: [C.B, 0.25]});
  }, {cues: [[70, 'musicStop']]});

  /* ================= LOCK-ON (silence) ================= */
  shot(150, i => {
    HE.pose(370, FLOOR, -1, qStand());
    if (i < 20) BW.set({x: 96, y: FLOOR, face: 1, state: 'gale', kneel: true, drawing: false, st: 999, pose: null, onGround: true, alpha: 1});
    else { const h = hHead(); BW.aim(96, FLOOR, 1, Math.atan2(h[1] - 215, h[0] - 105)); }
    if (i >= 24) { const h = hHead(), k = sg(i, 24, 140); lockon = {x: h[0] + rnd(-1, 1) * (1 - k) * 3, y: h[1] + rnd(-1, 1) * (1 - k) * 3, r: L(24, 8, k), state: i >= 110 ? 'locked' : 'track'}; }
    const every = i < 60 ? 14 : i < 110 ? 8 : 4;
    if (i >= 24 && i % every === 0) __T.sfx('beep');
    if (i === 110) __T.sfx('warn');
    A.tick();
    const h = hHead(), b = bHead();
    if (i < 60) A.render({cam: {x: 236, y: 180, z: 1.3, r: -0.03}});
    else if (i < 110) A.render({cam: {x: h[0], y: h[1] + 12, z: 4.2}, world: () => { if (i >= 78) A.emote('...', h[0], h[1] - 12, i - 78, 0.4); }});
    else { A.render({cam: {x: b[0] + 2, y: b[1] + 1, z: 8}, bg: bgLines(C.K, C.G1, 240, 135, {n: 40, r0: 100})}); }
    if (i === 124) { A.star(b[0] + 2, b[1] - 1, 4, 10); __T.sfx('reflect'); }
  });
  // the beam
  shot(80, i => {
    const h = [370, FLOOR - 30];
    HE.pose(370, FLOOR, -1, qGuard());
    BW.aim(96, FLOOR, 1, Math.atan2(h[1] - 215, h[0] - 105), i >= 3);
    if (i === 3) {
      lockon = null; const [x, y] = BW.bowPt();
      beams.push({x, y, ang: Math.atan2(h[1] - y, h[0] - x), t: 0, w: 26, dur: 22});
      flash = {a: 1, color: C.W}; shakeAmt = 12; __T.kick(3); __T.sfx('beam'); __T.sfx('boom'); __T.sfx('explode');
    }
    if (i >= 5 && i < 40) smoke(370, FLOOR, 9);
    A.tick();
    A.render({cam: {x: 240, y: 170, z: 1.15}});
  });
  // the smoke clears: he has not moved. the beam went round him. a leaf comes down
  const scorch = () => { ctx.strokeStyle = '#2a2a2a'; ctx.lineWidth = 3; ctx.lineCap = 'round'; poly([[386, 214], [W + 10, 196]]); poly([[386, 222], [W + 10, 240]]); ctx.strokeStyle = C.K; ctx.lineWidth = 1; poly([[386, 214], [W + 10, 196]]); poly([[386, 222], [W + 10, 240]]); };
  shot(160, i => {
    HE.pose(370, FLOOR, -1, qGuard()); BW.aim(96, FLOOR, 1, -0.07, true);
    if (i < 30) smoke(370, FLOOR, 2);
    A.tick();
    const h = hHead();
    // the leaf: drifts down and settles on his head
    const u = sg(i, 46, 100), lx = h[0] - 18 + 18 * u + 7 * Math.sin(u * 9), ly = L(h[1] - 70, h[1] - 6, u);
    const leaf = () => { if (i < 46) return; ctx.fillStyle = C.K; ctx.beginPath(); ctx.ellipse(lx, ly, 3.4, 1.8, 0.4 + 0.5 * Math.sin(u * 9), 0, TAU); ctx.fill(); ctx.fillStyle = C.G2; ctx.beginPath(); ctx.ellipse(lx, ly, 2.4, 1, 0.4 + 0.5 * Math.sin(u * 9), 0, TAU); ctx.fill(); };
    if (i < 110) A.render({cam: {x: L(372, 366, sm(i / 110)), y: 202, z: L(1.8, 2.4, sm(i / 110))}, world: () => { scorch(); leaf(); }});
    else { const b = bHead(); A.render({cam: {x: b[0] + 2, y: b[1] + 14, z: 3.5}, world: () => { A.emote('sweat', b[0] - 8, b[1] - 3, i - 110, 0.5); A.emote('...', b[0] + 1, b[1] - 12, i - 110, 0.4); }}); }
  }, {subs: [{who: 'boss', text: '...말도 안 돼.', at: 24, dur: 60, speed: 1.8}, {who: 'boss', text: '저걸... 베었다고?', at: 112, dur: 46, speed: 1.6}]});

  /* ================= ROUND TWO (the theme's intense variation, 172 bpm) ================= */
  // the forest is called
  shot(bt2(4), i => {
    HE.pose(370, FLOOR, -1, qStand({ht: -0.15}));
    boss.phase = 2; BW.set({x: 96, y: FLOOR, face: 1, state: 'script', summon: true, drawing: false, st: 999, pose: null, onGround: true, alpha: 1});
    if (i % 6 === 0) addP({kind: 'ring', x: 96, y: 216, r0: 8, rMax: 46, life: 14, color: C.G2, size: 2});
    if (i % 2 === 0) addP({kind: 'leaf', x: 96 + rnd(-40, 40), y: FLOOR - rnd(0, 6), vx: rnd(-1, 1), vy: -rnd(1.5, 3.5), drag: 0.98, life: 60, color: Math.random() < 0.5 ? C.G2 : C.G1, size: 2});
    bgMix = 0.12 * sm(sg(i, 40, 83));
    A.tick();
    A.render({cam: {x: 104, y: 200, z: 2.9, r: -0.12}});
  }, {subs: [{who: 'boss', text: '깨어나라, 태고의 숲이여!!', at: 4, dur: 76, speed: 1.2}], cues: [[0, 'music', 'intense'], [0, 'sfx', 'cyclone'], [42, 'sfx', 'rumble']]});
  shot(bt2(4), i => {
    HE.pose(370, FLOOR, -1, qStand({ht: -0.3}));
    bgMix = L(0.12, 1, sm(sg(i, 0, 66)));
    for (const pl of platforms) { pl.grow = sm(sg(i, 30, 66)); pl.on = pl.grow >= 1; }
    shakeAmt = Math.max(shakeAmt, i < 66 ? 2 : 0);
    const v = sg(i, 8, 70);
    if (i < 70) { boss.summon = false; BW.aim(L(96, 240, eo(v)), L(FLOOR, 140, eo(v)) - 40 * Math.sin(Math.PI * v), 1, -Math.PI / 2, false, 'leap'); }
    else { BW.idle(240, 1); boss.y = 140; }
    if (i === 70) { leafBurst(240, 128, 14); __T.sfx('land'); __T.sfx('boom'); shakeAmt = 6; }
    if (i % 3 === 0) addP({kind: 'leaf', x: rnd(W), y: FLOOR, vx: rnd(-1, 1), vy: -rnd(1, 3), g: 0.05, life: 60, color: Math.random() < 0.5 ? C.G2 : C.G1, size: 2});
    A.tick();
    A.render({cam: {x: 240, y: 135, z: 1}});
  });
  // arrows rain from the sky; a hundred red blades go up to meet them
  shot(bt2(8), (i, st) => {
    if (i === 0) { arrows.length = 0; G.blades = []; st.n = 0; }
    Object.assign(player, {x: 372, y: FLOOR, face: -1, state: 'rain', pose: null, onGround: true, vx: 0, rain: null});
    const beat = Math.floor(i / BEAT2), onBeat = i === bt2(beat);
    BW.aim(240, 140, 1, -Math.PI / 2 + 0.18 * Math.sin(i * 0.2), (i - bt2(beat)) < 6 && beat < 6);
    if (onBeat && beat < 6) { const [x, y] = BW.bowPt(); A.arrow(x, y - 8, rnd(-1, 1), -12); __T.sfx('arrow'); addP({kind: 'ring', x, y, r0: 4, rMax: 18, life: 8, color: C.G2, size: 1}); }
    if (i >= bt2(2) && i < bt2(7.3) && i % 4 === 0) for (let k = 0; k < 2; k++) {
      const a = A.arrow(rnd(30, 450), -10 - rnd(0, 20), rnd(-0.6, 0.6), 7.5, {stick: true, rain: true});
      if (Math.random() < 0.85) {
        const T0 = i + 6, T1 = T0 + 10, tx = a.x + a.vx * (T1 - i), ty = a.y + a.vy * (T1 - i), sx = player.x + (st.n++ % 2 ? -22 : 22), sy = player.y - 60;
        G.blades.push({x: sx, y: sy, vx: (tx - sx) / 10, vy: (ty - sy) / 10, t0: T0, t1: T1, arrow: a, live: false});
      }
    }
    let snd = false;
    for (let k = G.blades.length - 1; k >= 0; k--) {
      const b = G.blades[k];
      if (i === b.t0) b.live = true;
      if (i === b.t1) {
        G.blades.splice(k, 1); const ai = arrows.indexOf(b.arrow);
        if (ai >= 0) arrows.splice(ai, 1);
        A.star(b.x, b.y, 10, 6); sparks(b.x, b.y, 5, [C.R, C.W]);
        if (!snd) { __T.sfx(k % 3 ? 'parry' : 'bladeFire'); snd = true; }
      } else if (b.live) { b.x += b.vx; b.y += b.vy; }
    }
    if (i % 8 === 0 && i >= bt2(2)) __T.sfx('whoosh');
    A.tick();
    const world = () => {
      // the two summoning circles over his head
      for (const s of [-1, 1]) {
        const cx = player.x + s * 22, cy = player.y - 62, a0 = i * 0.08 * s;
        ctx.strokeStyle = C.K; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(cx, cy, 10, 0, TAU); ctx.stroke();
        ctx.strokeStyle = C.R; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(cx, cy, 10, 0, TAU); ctx.stroke(); ctx.beginPath(); ctx.arc(cx, cy, 6, 0, TAU); ctx.stroke();
        for (let k = 0; k < 6; k++) { const a = a0 + k * TAU / 6; poly([[cx + Math.cos(a) * 6, cy + Math.sin(a) * 6], [cx + Math.cos(a) * 12, cy + Math.sin(a) * 12]]); }
      }
      for (const b of G.blades) if (b.live) { const sp = Math.hypot(b.vx, b.vy) || 1, dx = b.vx / sp, dy = b.vy / sp; drawGreatsword(b.x - dx * 16, b.y - dy * 16, dx, dy, 16, 1, 0.65, C.R, C.W); }
    };
    if (i < bt2(2)) A.render({cam: {x: 240, y: 112, z: 2.3, r: 0.1}, world});
    else if (i < bt2(6)) A.render({cam: {x: 280, y: 140, z: 1.2, r: -0.05}, world});
    else A.render({cam: {x: 352, y: 186, z: 2.5, r: 0.12}, world});
  });
  // both of them gather everything they have: a split page
  shot(bt2(4), i => {
    HE.pose(372, FLOOR, -1, qCharge(i)); BW.aim(240, 140, 1, 0.55, false);
    if (i % 2 === 0) addP({kind: 'bolt', x: 372 + rnd(-14, 14), y: FLOOR - rnd(4, 44), life: 5, color: C.Y});
    if (i % 6 === 0) { const [x, y] = BW.bowPt(); addP({kind: 'ring', x, y, r0: 6, rMax: 26, life: 12, color: C.G2, size: 2}); }
    if (i === 0) SND.chargeStart(); SND.chargeSet(i / 83); if (i === 83) SND.chargeStop();
    A.tick();
    const z = L(2.9, 3.5, sm(i / 83)), bp = BW.bowPt();
    const glow = () => { const [x, y] = bp, d = [Math.cos(0.55), Math.sin(0.55)]; ctx.lineCap = 'round'; ctx.strokeStyle = C.K; ctx.lineWidth = 6; poly([[x - d[0] * 10, y - d[1] * 10], [x + d[0] * 22, y + d[1] * 22]]); ctx.strokeStyle = C.G2; ctx.lineWidth = 4; poly([[x - d[0] * 10, y - d[1] * 10], [x + d[0] * 22, y + d[1] * 22]]); ctx.strokeStyle = C.W; ctx.lineWidth = 1.5; poly([[x - d[0] * 8, y - d[1] * 8], [x + d[0] * 20, y + d[1] * 20]]); };
    A.panels([
      {cam: {x: boss.x + 6, y: boss.y - 26, z, sx: 120, sy: 140}, bg: bgLines(C.K, C.G2, 120, 135, {n: 70, r0: 70}), world: glow},
      {cam: {x: player.x - 2, y: player.y - 24, z, sx: 362, sy: 145}, bg: bgLines(C.K, C.R, 362, 135, {n: 70, r0: 70})},
    ], [[[0, 0], [250, 0], [222, H], [0, H]], [[250, 0], [W, 0], [W, H], [222, H]]]);
  }, {cues: [[0, 'sfx', 'cyclone'], [bt2(2), 'sfx', 'cyclone']]});
  // the pass: they set themselves (close, close), launch, cross on the beat - the world stops - and slide apart
  const XB = bt2(3);
  shot(96, i => {
    let hx = 340, bx = 140;
    if (i === 0) arrows.length = 0;
    const kneelB = () => BW.set({x: bx, y: FLOOR, face: 1, state: 'gale', kneel: true, drawing: false, st: 999, pose: null, onGround: true, vx: 0});
    if (i < 50) {
      HE.pose(hx, FLOOR, -1, qCrouch({lean: 0.6 + 0.03 * Math.sin(i * 0.25)})); kneelB();
      if (i % 5 === 0) { addP({x: hx + rnd(-8, 8), y: FLOOR - 1, vx: rnd(-0.6, 0.6), vy: -rnd(0.2, 0.8), g: 0.03, life: 18, color: '#8a8a8a', size: 2}); addP({x: bx + rnd(-8, 8), y: FLOOR - 1, vx: rnd(-0.6, 0.6), vy: -rnd(0.2, 0.8), g: 0.03, life: 18, color: '#8a8a8a', size: 2}); }
      if (i === 40) { dust(hx, FLOOR, 10); dust(bx, FLOOR, 10); __T.sfx('dash'); __T.sfx('whoosh'); }
    } else if (i < XB) {
      const u = (i - 50) / (XB - 50); hx = L(340, 236, u); bx = L(140, 244, u);
      HE.dash(hx, -1); addAfter(player, '#9a9a9a');
      BW.set({x: bx, y: FLOOR - 6, face: 1, state: 'gale', kneel: false, fired: 0, st: 999, pose: null, onGround: false, vx: 10}); addBossAfter(boss);
    } else if (i < XB + 8) {
      hx = 236; bx = 244; HE.pose(hx, FLOOR, -1, qFollow()); BW.set({x: bx, y: FLOOR - 6, face: 1, state: 'gale', kneel: false, fired: 0, st: 999, pose: null, onGround: false, vx: 10});
    } else {
      const u = eo(sg(i, XB + 8, XB + 24)); hx = L(236, 120, u); bx = L(244, 360, u);
      if (u < 1 && i % 2 === 0) { dust(hx, FLOOR, 1); dust(bx, FLOOR, 1); }
      HE.pose(hx, FLOOR, -1, qFollow()); BW.pose(bx, FLOOR, 1, qLanded()); BW.set({state: 'leap', drawing: true, aim: 0.05, releaseT: 5, st: 999});
    }
    if (i === XB) { flash = {a: 0.9, color: C.W}; __T.kick(4); A.cut(30, 216, 450, 204, 34); A.star(240, 212, 30, 10); shakeAmt = 10; __T.sfx('iai'); __T.sfx('slash'); __T.sfx('boom'); __T.sfx('impact'); }
    A.tick(i >= XB && i < XB + 8 ? 0 : 1);
    if (i < 20) { const h = hHead(); A.render({cam: {x: h[0] - 4, y: h[1] + 8, z: L(4.2, 4.8, i / 19)}, bg: bgLines(C.W, C.R, 250, 130, {n: 70, r0: 80})}); }
    else if (i < 40) { const h = bHead(); A.render({cam: {x: h[0] + 4, y: h[1] + 8, z: L(4.2, 4.8, (i - 20) / 19)}, bg: bgLines(C.G3, C.G1, 230, 130, {n: 70, r0: 80})}); }
    else A.render({cam: {x: 240, y: 180, z: i >= XB && i < XB + 8 ? L(1.3, 1.55, (i - XB) / 7) : 1.3}, screen: () => { if (i >= 50 && i < XB + 8) A.streaks(0, {color: '#8a8a8a', n: 30, speed: i < XB ? 40 : 0, seed: 7}); }});
  }, {cues: [[XB, 'musicStop']]});

  /* ================= SILENCE: the chain on his mind breaks ================= */
  shot(110, (i, st) => {
    HE.pose(120, FLOOR, -1, qFollow());
    if (i < 88) { BW.pose(360, FLOOR, 1, qLanded()); BW.set({state: 'leap', drawing: true, aim: 0.05, releaseT: 5, st: 999}); }
    else { BW.pose(360, FLOOR, 1, qLanded()); BW.set({state: 'dead', st: 999, drawing: false}); }
    if (i === 0) addP({kind: 'leaf', x: 236, y: 30, vx: 0.15, vy: 0.55, life: 400, color: C.G2, size: 2});
    if (i === 84) { const [x, y] = BW.bowPt(); A.cut(x - 10, y - 12, x + 8, y + 12, 14); __T.sfx('brk'); }
    if (i === 88) { const [x, y] = BW.bowPt(); for (let k = 0; k < 7; k++) addP({kind: 'line', x: x + rnd(-6, 6), y: y + rnd(-10, 10), vx: rnd(-1.5, 1.5), vy: rnd(-2, 0), g: 0.2, life: 40, color: C.K, size: 1.5, len: 4}); }
    A.tick(0.6);
    if (i < 70) A.render({cam: {x: 240, y: 186, z: 1.45, r: 0.04}});
    else { const [x, y] = BW.bowPt(); A.render({cam: {x, y, z: 6.5}}); }
  });
  shot(130, i => {
    HE.pose(120, FLOOR, i < 76 ? -1 : 1, i < 76 ? qFollow() : qStand());
    const h = bHead();
    if (i < 18) { BW.pose(360, FLOOR, 1, qLanded()); shakeAmt = 1.5; }
    else BW.pose(360, FLOOR, 1, makePose(lerpPose(qLanded(), qKneel(), sm(sg(i, 18, 48)))));
    BW.set({state: 'dead', st: 999, drawing: false});
    if (i === 16) {
      boss.freed = true; flash = {a: 0.5, color: C.W}; shakeAmt = 5; __T.sfx('brk'); __T.sfx('chain');
      shards(h[0], h[1], 26);
      for (let k = 0; k < 8; k++) { const a = k / 8 * TAU; addP({kind: 'line', x: h[0] + Math.cos(a) * 8, y: h[1] + Math.sin(a) * 8, vx: Math.cos(a) * 5, vy: Math.sin(a) * 5, life: 12, color: C.R, size: 2, len: 3}); }
      floatText('세뇌 해제', h[0], h[1] - 26, C.W, 2, 80, C.R);
    }
    A.tick();
    const k = sm(sg(i, 54, 120));
    A.render({cam: {x: L(h[0] - 4, 240, k), y: L(h[1] + 12, 190, k), z: L(3, 1.5, k)}});
  });

  /* ================= EPILOGUE (the training-ground theme again) ================= */
  shot(165, i => {
    HE.pose(256, FLOOR, 1, qStand()); BW.pose(300, FLOOR, -1, qSit()); BW.set({state: 'idle', freed: true, drawing: false, st: 999, vx: 0});
    leafIdle(); A.tick();
    A.render({cam: {x: 278, y: 206, z: 2.5}});
  }, {subs: [{who: 'boss', text: '...머리가 맑아졌다. 고맙다, 이름 모를 검사여.', at: 10, dur: 148, speed: 1.6}], cues: [[0, 'music', 'calm']]});
  shot(110, i => {
    HE.pose(256, FLOOR, 1, qStand()); BW.pose(300, FLOOR, -1, qSit()); A.tick();
    const h = hHead();
    A.render({cam: {x: h[0] + 2, y: h[1] + 13, z: L(4.1, 4.6, sm(i / 109))}, bg: bgPlain(C.W)});
  }, {subs: [{who: 'hero', text: '...그래서. 여기 어디냐고.', at: 8, dur: 98, speed: 1.8}]});
  shot(260, (i, st) => {
    // he stands, points the way, and the man walks off the other way
    const stand = sm(sg(i, 0, 22));
    let hx = 256, hface = 1, hq = qStand({ht: 0.05 + 0.3 * Math.sin(Math.PI * sg(i, 96, 110))});
    if (i >= 112 && i < 160) { hx = 256 - (i - 112) * 1.0; hface = -1; hq = qWalk(wph(-hx)); }
    else if (i >= 160 && i < 172) { hx = 208; hface = -1; }
    else if (i >= 172) { hx = 208 + (i - 172) * 1.6; hface = 1; hq = qWalk(wph(hx)); }
    HE.pose(hx, FLOOR, hface, hq);
    if (i < 30) BW.pose(300, FLOOR, -1, makePose(lerpPose(qSit(), bowPose(Object.assign({}, boss, {state: 'idle', vx: 0})), stand)));
    else if (i < 130) { BW.aim(300, FLOOR, 1, -0.05, true); }
    else if (i < 190) BW.pose(300, FLOOR, -1, bowPose(Object.assign({}, boss, {state: 'idle', vx: 0})));
    else BW.pose(300, FLOOR, i > 228 ? 1 : -1, qPalm());
    if (i >= 30 && i < 130) BW.set({pose: null}); else BW.set({state: 'idle', drawing: false, st: 999});
    leafIdle(); A.tick();
    const b = bHead(), h = hHead();
    A.render({cam: {x: L(270, 290, sm(sg(i, 170, 250))), y: 196, z: 1.9}, world: () => {
      if (i >= 22 && i < 64) A.emote('sweat', b[0] - 8, b[1] - 3, i - 22, 0.5);
      if (i >= 136 && i < 196) A.emote('anger', b[0] + 7, b[1] - 9, i - 136, 1);
      if (i >= 160 && i < 176) A.emote('!', h[0], h[1] - 9, i - 160, 0.8);
    }});
  }, {subs: [{who: 'boss', text: '...사슬의 묘지다. 마을은 저쪽이고.', at: 32, dur: 76, speed: 1.6},
    {who: 'boss', text: '......반대쪽이다.', at: 136, dur: 56, speed: 2}]});

  /* ================= END CARD ================= */
  shot(250, i => {
    A.hideHero = true; boss.hidden = true;
    if (i === 0) { particles.length = 0; arrows.length = 0; beams.length = 0; A.fx.length = 0; for (const pl of platforms) pl.grow = 0; }
    A.render({cam: {x: 240, y: 135, z: 1}, bg: () => {
      A.fill(C.K);
      const a = sg(i, 4, 24);
      ctx.globalAlpha = a;
      text('블레이드 서머너  ·  단편 제1화', 240, 62, {color: C.W, align: 'center'});
      text('길 좀 묻자', 240, 84, {sc: 6, color: C.W, align: 'center'});
      const w = Math.round(150 * eo(sg(i, 10, 40))); ctx.fillStyle = C.R; ctx.fillRect(240 - w, 136, w * 2, 1);
      text('보우마스터  VS  이름 없는 검사', 240, 146, {sc: 2, color: C.G3, align: 'center'});
      ctx.globalAlpha = 1;
      // and off he goes, the right way at last
      ctx.fillStyle = '#4a4a4a'; ctx.fillRect(0, 214, W, 1);
      const x = -20 + i * 0.8;
      drawFigure(x, 214, 1, qWalk(x / (STRIDE * 0.8)), A.heroLook({color: C.W, outline: C.K, sword: {len: SWORD_LEN, color: C.W, edge: C.K}, sc: 0.8}));
    }});
  }, {fadeOut: 50, lb: 0, cues: [[230, 'musicStop']]});

  return {segs, cues, music: [], total: f, out: [1920, 1080], snap: true};
})();
