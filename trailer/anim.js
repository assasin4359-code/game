// keyframed animation on the game's art: no game logic runs. a shot sets the hero's and the bowmaster's fields by
// hand every frame (position, state, pose), spawns its own arrows and effects, and draws through the game's own
// renderer under a free camera (pan, zoom, roll) - then the usual 8-colour dither. injected after rt.js.
window.__A = (() => {
  const A = {fx: [], ts: 1, acc: 0};

  /* ---- the game's renderers, with a hand on the controls ---- */
  const _pp = playerPose, _bp = bossPose, _dp = drawPlayer, _bg = drawStageBg;
  const rawPlayer = p => p.pose || _pp(p), rawBoss = b => b.pose || _bp(b);   // a set pose wins over the state machine's
  playerPose = p => (A.on && p._disp) || rawPlayer(p);
  bossPose = b => (A.on && b._disp) || rawBoss(b);
  // (attacks, dashes and flips keep their own snap; everything else eases out of a sudden change of pose)
  const JUMP = {hx: 3, hy: 3, lean: 0.25, ht: 0.25, l1: 0.4, l2: 0.4, r1: 0.4, r2: 0.4, bu: 0.4, bf: 0.4, fu: 0.4, ff: 0.4, sa: 0.45};
  function settle(a, tgt, free) {
    const prev = a._tgt, off = a._off || (a._off = {});
    a._tgt = tgt;
    if (!prev || !free) { a._off = {}; a._disp = tgt; return; }
    const d = Object.assign({}, tgt);
    for (const k in JUMP) {
      if (typeof tgt[k] !== 'number' || typeof prev[k] !== 'number') { off[k] = 0; continue; }
      const step = tgt[k] - prev[k];
      if (Math.abs(step) > JUMP[k]) off[k] = (off[k] || 0) - step;
      off[k] = (off[k] || 0) * 0.7; if (Math.abs(off[k]) < 1e-3) off[k] = 0;
      d[k] = tgt[k] + off[k];
    }
    a._disp = d;
  }
  A.resetPoses = () => { for (const a of [player, boss]) { a._tgt = null; a._off = {}; a._disp = null; } };
  drawPlayer = () => { if (!A.hideHero) _dp(); };
  let bgFn = null;
  drawStageBg = mix => { if (bgFn) bgFn(mix); else _bg(mix); };

  A.init = (o = {}) => {
    save = Object.assign(freshSave(), {lv: 400, cls: o.cls ?? 0, promoShown: 3, tut: true, opened: true});
    stage = STAGES[0]; resetGame(); mode = 'fight'; setScene('fight'); fightT = 1e6;
    settings.dmgNum = false; settings.shake = true;
    Object.assign(boss, {state: 'idle', hidden: false, next: 1e9, x: 380, y: FLOOR, face: -1, onGround: true, freed: false, pose: null});
    Object.assign(player, {x: 100, y: FLOOR, face: 1, onGround: true, pose: null});
    bgMix = o.bgMix || 0;
    for (const pl of platforms) { pl.grow = o.platforms ? 1 : 0; pl.on = !!o.platforms; }
    A.fx = []; A.hideHero = false; A.ts = 1; A.acc = 0; A.resetPoses();
  };

  /* ---- the hero ---- */
  const HR = A.hero = {
    idle(x, face = player.face) { Object.assign(player, {x, y: FLOOR, face, state: 'normal', vx: 0, vy: 0, onGround: true, pose: null, landT: 0, flipT: 0}); },
    run(x, face, speed = 2.4) {
      const p = player, before = Math.floor(p.runPh / Math.PI);
      Object.assign(p, {x, y: FLOOR, face, state: 'normal', vx: face * speed, vy: 0, onGround: true, pose: null, landT: 0, flipT: 0});
      p.runPh += speed * 0.13 * A.ts;
      if (Math.floor(p.runPh / Math.PI) !== before && speed > 1) addP({x: p.x - face * 3, y: p.y - 1, vx: -face * rnd(0.3, 0.9), vy: -rnd(0.2, 0.7), g: 0.03, life: 12, color: '#8a8a8a', size: 2, drag: 0.93});
    },
    air(x, y, vy, o = {}) { Object.assign(player, {x, y, vy, state: 'normal', onGround: false, pose: null, flipT: o.flip || 0, vx: o.vx || 0}); },
    attack(id, st, x = player.x, face = player.face, y = FLOOR) {
      const p = player, At = ATTACKS[id], prev = p.state === 'attack' && p.atk === At ? p.st : -1;
      Object.assign(p, {x, y, face, state: 'attack', atk: At, st, onGround: y >= FLOOR, pose: null});
      if (At.arc) At.wins.forEach((w, k) => { if (prev < w[0] && st >= w[0]) spawnComboArc(p, At, k); });
    },
    dash(x, face) { Object.assign(player, {x, y: FLOOR, face, dashDir: face, state: 'dash', st: (player.st || 0) + 1, onGround: true, pose: null}); },
    pose(x, y, face, q) { Object.assign(player, {x, y, face, state: 'normal', onGround: y >= FLOOR, pose: q}); },
    hand() { const p = player, q = playerPose(p), J = solve(q), X = figXform(p.x, p.y, p.face, q, 1); return X.T(J.handF); },
  };
  /* ---- the bowmaster ---- */
  const BW = A.bow = {
    idle(x, face = boss.face, vx = 0) {
      const b = boss; Object.assign(b, {x, y: FLOOR, face, state: 'idle', st: 999, vx, onGround: true, drawing: false, pose: null, kneel: false, fly: false});
      b.walkPh += Math.abs(vx) * 0.16 * A.ts;
    },
    // the bow up and aimed (released: the string hand thrown back just after a shot)
    aim(x, y, face, aim, released = false, st = 'rapid') {
      Object.assign(boss, {x, y, face, state: st, st: 999, drawing: true, aim, releaseT: released ? 5 : 0, onGround: y >= FLOOR, pose: null, kneel: false});
    },
    flip(x, y, face, spin) { Object.assign(boss, {x, y, face, state: 'backflip', st: 999, spin, onGround: false, drawing: false, pose: null}); },
    set(o) { Object.assign(boss, o); },
    pose(x, y, face, q) { Object.assign(boss, {x, y, face, pose: q, onGround: y >= FLOOR}); },
    bowPt() { return bowPos(boss); },
  };

  /* ---- arrows, by hand ---- */
  A.twang = (x, y) => { addP({kind: 'ring', x, y, r0: 2, rMax: 12, life: 7, color: C.W, size: 1.5}); for (const s of [-1, 1]) addP({kind: 'line', x, y: y + s * 3, vx: -Math.sign(boss.face) * 1.5, vy: s * 1.2, life: 6, color: C.W, size: 1, len: 3}); };
  A.arrow = (x, y, vx, vy, o = {}) => { const a = Object.assign({x, y, vx, vy, kind: 'arrow', dmg: 0, age: 0, stuck: 0, trail: [], g: 0}, o); arrows.push(a); return a; };
  function moveArrows(k) {
    for (let i = arrows.length - 1; i >= 0; i--) {
      const a = arrows[i];
      if (a.held) continue;
      if (a.stuck) { if (--a.stuck <= 0) arrows.splice(i, 1); continue; }
      a.x += a.vx * k; a.y += a.vy * k; a.vy += a.g * k; a.age += k;
      if (a.spin) { const s = Math.hypot(a.vx, a.vy), ang = Math.atan2(a.vy, a.vx) + a.spin * k; a.vx = Math.cos(ang) * s; a.vy = Math.sin(ang) * s; }
      if (a.stick && a.y >= FLOOR + 2) { a.y = FLOOR + 2; a.stuck = 240; dust(a.x, FLOOR, 2); }
      if (a.x < -80 || a.x > W + 80 || a.y < -120 || a.y > H + 40) arrows.splice(i, 1);
    }
  }

  /* ---- effects drawn in the world: crescents, impact stars, chain-mind shards ---- */
  A.swoosh = (x, y, face, a0, a1, r, th, col = C.K, life = 8) => A.fx.push({k: 'sw', x, y, face, a0, a1, r, th, col, life, max: life});
  A.star = (x, y, r = 22, life = 8, col = C.W) => A.fx.push({k: 'star', x, y, r, life, max: life, col});
  A.cut = (x0, y0, x1, y1, life = 14, col = C.R) => A.fx.push({k: 'cut', x0, y0, x1, y1, life, max: life, col});
  function drawFx() {
    for (const f of A.fx) {
      const k = f.life / f.max;
      if (f.k === 'sw') { ctx.globalAlpha = Math.min(1, k * 1.4); drawSwoosh(f.x, f.y, f.face, f.a0, f.a1, f.r, f.th * (0.4 + 0.6 * k), f.col); ctx.globalAlpha = 1; }
      if (f.k === 'star') {
        const r = f.r * (1.3 - 0.5 * k), w = r * 0.22;
        const pts = []; for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4 + 0.3, rr = i % 2 ? w : r; pts.push([f.x + Math.cos(a) * rr, f.y + Math.sin(a) * rr]); }
        ctx.fillStyle = C.K; ctx.beginPath(); pts.forEach(([x, y], i) => { const dx = x - f.x, dy = y - f.y; i ? ctx.lineTo(f.x + dx * 1.25, f.y + dy * 1.25) : ctx.moveTo(f.x + dx * 1.25, f.y + dy * 1.25); }); ctx.fill();
        ctx.fillStyle = f.col; ctx.beginPath(); pts.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)); ctx.fill();
      }
      if (f.k === 'cut') {
        const u = 1 - k, e = Math.min(1, u * 4);
        ctx.lineCap = 'butt';
        ctx.strokeStyle = C.K; ctx.lineWidth = 5 * k + 1; poly([[f.x0, f.y0], [lerp(f.x0, f.x1, e), lerp(f.y0, f.y1, e)]]);
        ctx.strokeStyle = f.col; ctx.lineWidth = 3 * k + 0.5; poly([[f.x0, f.y0], [lerp(f.x0, f.x1, e), lerp(f.y0, f.y1, e)]]);
        ctx.strokeStyle = C.W; ctx.lineWidth = 1; poly([[f.x0, f.y0], [lerp(f.x0, f.x1, e), lerp(f.y0, f.y1, e)]]);
        ctx.lineCap = 'round';
      }
    }
  }

  /* ---- the clock: cosmetics only (particles, afterimages, fx), with a time scale for slow motion ---- */
  A.tick = (ts = 1) => {
    A.ts = ts; A.acc += ts; A.on = true;
    const free = a => a.state === 'normal' || a.state === 'idle' || a.state === 'script' || a.state === 'leap' || a.state === 'rapid' || a.state === 'groundshot' || a.state === 'dead' || (!!a.pose && a.state !== 'backflip');
    if (ts > 0) { settle(player, rawPlayer(player), free(player) && !player.flipT); settle(boss, rawBoss(boss), free(boss)); }
    globalT++;
    moveArrows(ts);
    for (const bm of beams) bm.t += ts;
    for (let i = beams.length - 1; i >= 0; i--) if (beams[i].t > 40) beams.splice(i, 1);
    while (A.acc >= 1) {
      A.acc -= 1;
      player.animT++; boss.animT++;
      const p = player;
      for (const a of p.arcs) { a.t++; if (a.spark && a.t === 2) arcSparks(p, a); }
      if (p.arcs.length) p.arcs = p.arcs.filter(a => a.t < a.life);
      const At = p.atk, swinging = p.state === 'fury' || (p.state === 'attack' && At && !At.arc && At.id !== 5 && (curWindow(At, p.st) >= 0 || At.id === 'air2' && p.st < 12));
      if (swinging) { const q = playerPose(p); p.trail.push(swordLine(p.x, p.y, q.flip ? -p.face : p.face, q, SWORD_LEN)); if (p.trail.length > 7) p.trail.shift(); }
      else if (p.trail.length) p.trail.shift();
      updateParticles(); updateTexts(); updateAfterimages(); decayFx();
      for (let i = A.fx.length - 1; i >= 0; i--) if (--A.fx[i].life <= 0) A.fx.splice(i, 1);
      if (player.flipT > 0) player.flipT--;
    }
  };

  /* ---- the camera: c = {x, y, z, r, sx, sy} - world point (x, y) lands on screen (sx, sy), zoomed and rolled.
     on the stage backdrop the view is kept inside the world (zoomed in just enough to hide the corners) ---- */
  function fit(c, keep) {
    const o = {x: c.x ?? 240, y: c.y ?? 135, z: c.z ?? 1, r: c.r || 0, sx: c.sx ?? W / 2, sy: c.sy ?? H / 2};
    if (!keep) return o;
    const corners = () => {
      const cr = Math.cos(-o.r), sr = Math.sin(-o.r), out = [];
      for (const [px, py] of [[0, 0], [W, 0], [0, H], [W, H]]) { const dx = (px - o.sx) / o.z, dy = (py - o.sy) / o.z; out.push([o.x + dx * cr - dy * sr, o.y + dx * sr + dy * cr]); }
      return out;
    };
    for (let k = 0; k < 4; k++) {
      const cs = corners(), x0 = Math.min(...cs.map(v => v[0])), x1 = Math.max(...cs.map(v => v[0])), y0 = Math.min(...cs.map(v => v[1])), y1 = Math.max(...cs.map(v => v[1]));
      const over = Math.max((x1 - x0) / W, (y1 - y0) / H);
      if (over > 1) { o.z *= over * 1.002; continue; }
      if (x0 < 0) o.x -= x0; else if (x1 > W) o.x -= x1 - W;
      if (y0 < 0) o.y -= y0; else if (y1 > H) o.y -= y1 - H;
    }
    return o;
  }
  // v = {cam, bg (fn: screen-space backdrop instead of the stage), world (fn: extra drawing in world space),
  //      screen (fn: drawing on top in screen space), tint: [colour, alpha]}
  A.render = (v = {}) => {
    ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1;
    ctx.fillStyle = C.K; ctx.fillRect(0, 0, W, H);
    const c = fit(v.cam || {}, !v.bg);
    A.view = c;
    ctx.save();
    ctx.translate(c.sx, c.sy); ctx.rotate(c.r); ctx.scale(c.z, c.z); ctx.translate(-c.x, -c.y);
    ctx.imageSmoothingEnabled = false;
    bgFn = v.bg ? () => { ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); v.bg(c); ctx.restore(); } : null;
    drawWorld();
    bgFn = null;
    drawFx();
    if (v.world) v.world(c);
    ctx.restore();
    if (v.tint) { ctx.globalAlpha = v.tint[1]; ctx.fillStyle = v.tint[0]; ctx.fillRect(0, 0, W, H); ctx.globalAlpha = 1; }
    if (v.screen) v.screen(c);
  };
  // world point -> screen point under the last camera
  A.toScreen = (x, y, c = A.view) => { const dx = (x - c.x) * c.z, dy = (y - c.y) * c.z, cr = Math.cos(c.r), sr = Math.sin(c.r); return [c.sx + dx * cr - dy * sr, c.sy + dx * sr + dy * cr]; };

  /* ---- comic panels: each view rendered and dithered on its own, then cut into polygons with a gutter ---- */
  const pcs = [mk(), mk(), mk()];
  A.panels = (views, polys, gutter = 3) => {
    views.forEach((v, k) => { A.render(v); present(); pcs[k].getContext('2d').drawImage(view, 0, 0); });
    ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1;
    ctx.fillStyle = C.W; ctx.fillRect(0, 0, W, H);
    polys.forEach((pg, k) => {
      ctx.save(); ctx.beginPath(); pg.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)); ctx.closePath(); ctx.clip();
      ctx.drawImage(pcs[k], 0, 0); ctx.restore();
      ctx.strokeStyle = C.K; ctx.lineWidth = 2; ctx.beginPath(); pg.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)); ctx.closePath(); ctx.stroke();
    });
    // white gutters over the seams
    ctx.strokeStyle = C.W; ctx.lineWidth = gutter;
    for (const pg of polys) for (let i = 0; i < pg.length; i++) {
      const a = pg[i], b = pg[(i + 1) % pg.length];
      const edge = (a[0] <= 0 && b[0] <= 0) || (a[0] >= W && b[0] >= W) || (a[1] <= 0 && b[1] <= 0) || (a[1] >= H && b[1] >= H);
      if (!edge) poly([a, b]);
    }
    polys.forEach(pg => { ctx.strokeStyle = C.K; ctx.lineWidth = 1; ctx.beginPath(); pg.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)); ctx.closePath(); ctx.stroke(); });
  };

  /* ---- screen-space backdrops and overlays ---- */
  // concentration lines (집중선): radial strokes closing in on a point
  A.speedLines = (cx, cy, o = {}) => {
    const n = o.n || 70, r0 = o.r0 || 70, seed = Math.floor(globalT / (o.every || 2)), rng = seeded(seed * 7 + 3);
    ctx.fillStyle = o.color || C.K;
    for (let i = 0; i < n; i++) {
      const a = rng() * TAU, w = (o.w || 0.02) * (0.4 + rng()), r1 = r0 + rng() * (o.jit || 50), R = 600;
      ctx.beginPath();
      ctx.moveTo(cx + Math.cos(a) * r1, cy + Math.sin(a) * r1);
      ctx.lineTo(cx + Math.cos(a - w) * R, cy + Math.sin(a - w) * R);
      ctx.lineTo(cx + Math.cos(a + w) * R, cy + Math.sin(a + w) * R);
      ctx.fill();
    }
  };
  // motion streaks (흐름선) along a direction, scrolling
  A.streaks = (ang, o = {}) => {
    const n = o.n || 40, rng = seeded(o.seed || 11), sp = o.speed || 14, c = Math.cos(ang), s = Math.sin(ang);
    ctx.save(); ctx.translate(W / 2, H / 2); ctx.rotate(ang);
    ctx.fillStyle = o.color || C.K;
    for (let i = 0; i < n; i++) {
      const len = 30 + rng() * 120, y = (rng() - 0.5) * H * 1.6, x0 = ((rng() * 1400 - globalT * sp * (0.6 + rng() * 0.8)) % 1400 + 1400) % 1400 - 700;
      ctx.fillRect(Math.round(x0), Math.round(y), Math.round(len), rng() < 0.3 ? 2 : 1);
    }
    ctx.restore();
  };
  A.fill = col => { ctx.fillStyle = col; ctx.fillRect(0, 0, W, H); };
  // the game's stage backdrop smeared sideways (a whip pan)
  A.smear = (mix, dx) => { for (let k = 0; k < 4; k++) { ctx.globalAlpha = k ? 0.35 : 1; _bg(mix); ctx.translate(dx / 4, 0); } ctx.globalAlpha = 1; };

  /* ---- big figures in screen space (over-the-shoulder foregrounds, inserts) ---- */
  A.heroLook = (o = {}) => heroLook(Object.assign({color: C.K, outline: C.W, t: player.animT, sword: {len: SWORD_LEN, color: C.K, edge: C.W}}, o));
  A.bowLook = (o = {}) => Object.assign({color: C.K, outline: C.W, eyes: boss.freed ? null : C.R, scarf: {color: C.G2, n: 2, wind: 1.6}, quiver: true, t: boss.animT,
    bow: {aim: null, drawn: false, arrow: false, color: C.K}}, o);
  A.fig = (who, x, y, face, q, sc, o = {}) => drawFigure(x, y, face, q, (who === 'hero' ? A.heroLook : A.bowLook)(Object.assign({sc}, o)));

  /* ---- manga marks, in world space ---- */
  A.emote = (kind, x, y, t = 99, sc = 1) => {
    const pop = t < 6 ? 1 + (6 - t) * 0.15 : 1;
    if (kind === '!' || kind === '?') { text(kind, x, y - 10 * sc * pop, {sc: Math.max(1, Math.round(3 * sc * pop)), color: kind === '!' ? C.R : C.W, outline: C.K, ow: 1, align: 'center'}); return; }
    if (kind === '...') { const n = Math.min(3, 1 + Math.floor(t / 10)), r = Math.max(1, 1.6 * sc); ctx.fillStyle = C.K; for (let k = 0; k < n; k++) disc(x + (k - 1) * r * 3.2, y, r); return; }
    if (kind === 'anger') {
      // the manga vein: four curved strokes round an empty centre, throbbing
      const s = 5 * sc * (1 + 0.15 * Math.sin(t * 0.6));
      ctx.lineCap = 'round';
      for (const [lw, col] of [[3.2 * sc, C.K], [1.8 * sc, C.R]]) {
        ctx.strokeStyle = col; ctx.lineWidth = lw;
        for (let i = 0; i < 4; i++) {
          const a = i * Math.PI / 2 + Math.PI / 4, ox = x + Math.cos(a) * s, oy = y + Math.sin(a) * s;
          ctx.beginPath(); ctx.arc(ox, oy, s * 0.75, a + Math.PI - 0.9, a + Math.PI + 0.9); ctx.stroke();
        }
      }
      return;
    }
    if (kind === 'sweat') {
      const yy = y + Math.min(6, t * 0.15) * sc, r = 2.2 * sc;
      ctx.fillStyle = C.K; ctx.beginPath(); ctx.moveTo(x, yy - r * 2.8); ctx.quadraticCurveTo(x + r * 1.6, yy, x, yy + r * 1.1); ctx.quadraticCurveTo(x - r * 1.6, yy, x, yy - r * 2.8); ctx.fill();
      ctx.fillStyle = C.B; ctx.beginPath(); ctx.moveTo(x, yy - r * 2.2); ctx.quadraticCurveTo(x + r * 1.1, yy, x, yy + r * 0.6); ctx.quadraticCurveTo(x - r * 1.1, yy, x, yy - r * 2.2); ctx.fill();
      ctx.fillStyle = C.W; ctx.fillRect(Math.round(x - r * 0.4), Math.round(yy - r * 0.6), Math.max(1, Math.round(r * 0.5)), Math.max(1, Math.round(r * 0.5)));
    }
  };

  /* ---- the shot type ---- */
  __T.SHOTS.anim = {
    setup(s) { if (s.init) s.init(); s.st = {}; A.resetPoses(); player.trail = []; },
    step(i, s) { s.frame(i, s.st); },
  };
  return A;
})();
