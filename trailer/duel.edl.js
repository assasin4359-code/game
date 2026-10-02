// 결투 — 이름 없는 검사 vs 래피드 파이어 보우마스터. a one-minute choreographed short played out on the game's own
// engine: every boss attack is called on a set frame, the hero is driven by scripted keys and the autopilot
// (director.js), and the camera, letterbox, subtitles and impact frames are laid on top (rt.js 'duel' shots).
// the music is cut from Karl Casey's "Deadly Force" (115 bpm) so that the story beats sit on its bars.
window.__EDL = (() => {
  const segs = [], cues = [];
  let f = 0;
  const add = (s) => { s.f0 = f; segs.push(s); for (const [rel, ...c] of (s.cues || [])) cues.push([f + rel, ...c]); f += s.len; return s; };
  const to = (frame, s) => { s.len = Math.round(frame) - f; return add(s); };

  /* ---------- the score: three blocks of the track, then silence, then its outro ---------- */
  const BAR = 240 / 115, DROP = 33.440, songT = k => DROP + (k - 16) * BAR, BF = BAR * 60;
  const P0 = 10;                                   // the short opens on bar 10 of the intro
  const A = k => (k - P0) * BF;                    // bars 10-24: intro, build, drop, the first big phrase
  const B = k => A(24) + (k - 84) * BF;            // bars 84-96: the breakdown's tail, then the last big phrase
  const SIL = 169;                                 // silence after the final cut, until the chain on his mind breaks
  const O = k => B(96) + SIL + (k - 104) * BF;     // bars 104-108: the outro
  const music = [
    {src: songT(P0), dur: songT(16) - songT(P0), at: 0, gain: 0.55, fadeIn: 2},
    {src: songT(16), dur: songT(24) - songT(16) + 0.015, at: A(16) / 60},
    {src: songT(84), dur: songT(96) - songT(84) + 0.35, at: A(24) / 60, fadeIn: 0.015, fadeOut: 0.3},
    {src: songT(104), at: O(104) / 60, fadeIn: 0.05, fadeOut: 3, tail: 0.6},
  ];

  /* ---------- helpers ---------- */
  const LB = 96;                                    // letterbox at 1080p
  const shot = o => Object.assign({shot: 'duel', cont: true, noHUD: true, lb: LB}, o);
  // the boss only moves when the script says so: no attacks of his own, no reflex kicks
  const leash = () => { if (boss.state === 'idle') { boss.next = 1e9; boss.closeT = 0; } };
  const hold = (sc, t) => () => { if (scene === sc && sceneT > t) sceneT = t; };
  const all = (...fs) => li => { for (const fn of fs) if (fn) fn(li); };
  // impact frames on the beats of the action
  let lastSlow = 0;
  const kicks = () => { if (slowmo > 0 && lastSlow <= 0) __T.kick(3); lastSlow = slowmo; };
  const FIGHT = {near: 40, just: true, deflect: true, hop: true, atkEvery: 6};
  // captions drawn straight onto the output, with the game's own type
  const cap = (og, s, o) => {
    const r = kRender(s, o.sc ?? 2, o.color || C.W, o.outline === undefined ? C.K : o.outline), S = o.S || 3;
    og.globalAlpha = o.a ?? 1;
    og.drawImage(r.cv, Math.round(o.x - (o.align === 'left' ? 0 : r.w * S / 2) - r.pad * S), Math.round(o.y - r.pad * S), r.cv.width * S, r.cv.height * S);
    og.globalAlpha = 1;
  };
  const fadeA = (i, a, b, d = 12) => clamp(Math.min((i - a) / d, (b - i) / d), 0, 1);

  /* ================= PROLOGUE (bars 10-16): the graveyard, the descent, the standoff ================= */
  // P1: the chained sky, then down to the ground as the hero drops out of it
  to(A(11.5), shot({cont: false, key: 'bow', opt: {cls: 0, loadout: ['blade', 'fury', 'peak', null, null], idle: 1e9, px: 110, bx: 372},
    init: () => { save.tut = true; boss.hidden = true; boss.state = 'script'; particles.length = 0; setScene('entrance', -96); },
    each: all(hold('entrance', 88), () => { if (scene === 'entrance' && sceneT >= 88) { setScene('fight'); fightT = 1500; } }),
    cam: {on: [240, 52], to: [180, 168], z: [2.4, 1.15], k: 1, ease: 'inout'}, snap: false, fadeIn: 40,
    over: (og, i, W, H) => { const a = fadeA(i, 30, 150, 18); if (a) { cap(og, '제1장', {x: W / 2, y: 150, sc: 2, a, S: 4}); cap(og, '사슬의 묘지', {x: W / 2, y: 215, sc: 4, a, S: 4}); } }}));
  // P2: he comes down from the sky in a gale of leaves
  to(A(13), shot({enter: () => startArrival(),
    each: () => { if (scene === 'arrival' && sceneT >= 104) { setScene('fight'); fightT = 1500; bossIdle(1e9); } leash(); },
    cam: {on: 'boss', z: 2, dy: -14, k: 0.08}}));
  // P3-P4: the exchange, in close-up
  to(A(14), shot({each: leash, cam: {on: 'boss', z: 3, dy: -4, k: 0.2},
    subs: [{who: 'boss', text: '...사슬에 묶이지 않은 자라니. 넌 누구냐.', at: 6, dur: 116, speed: 1.6}]}));
  to(A(15), shot({each: leash, cam: {on: 'hero', z: 3, dy: -4, k: 0.2},
    subs: [{who: 'hero', text: '나도 모른다. 하지만 그 사슬, 끊겠다.', at: 6, dur: 116, speed: 1.6}]}));
  // P5: the bow comes up. the lock-on tracks him for 70 frames, holds for 24 - the track's silent break - and fires on the drop
  const LOCK = 70 + 24, lockAt = Math.round(A(16)) - LOCK + 1;
  to(A(16) - 24, shot({each: leash, acts: {[lockAt - f]: () => bossAttack('lock')},
    cam: {on: 'mid', z: 1.5, k: 0.1},
    subs: [{who: 'boss', text: '사슬을 거스르는 자는 모두 꿰뚫는다!', at: 0, dur: 84, speed: 1.3}]}));
  to(A(16), shot({cam: {on: 'hero', z: [2.6, 3.2], dy: -2, k: 0.3, ease: 'in'}, snap: false}));

  /* ================= PHASE ONE (bars 16-24): a new angle on every bar or so ================= */
  // (HP never shows; the floor only keeps the game from switching phase on its own mid-combo)
  const fight = (k, o) => to(A(k), shot(Object.assign({plan: FIGHT, hpFloor: 0.9, each: all(leash, kicks)}, o)));
  // the drop: the beam, and he slips through it
  fight(17, {impact: [[0, 2, true]], cam: {on: 'mid', z: 1.25, k: 0.08}});
  // rapid fire: every arrow knocked out of the air on his way in
  fight(18, {acts: {[2]: () => bossAttack('rapid')}, cam: {on: 'hero', z: 1.75, dx: 30, k: 0.12}});
  // a leaf-step away, then the earth splitter skimming the floor - over it
  fight(19.5, {enter: () => { if (boss.x < 120 || boss.x > 380) boss.x = clamp(player.x + 150, 120, 380); },
    acts: {[2]: () => { boss.queue = 'groundshot'; bossAttack('windstep'); boss.lastAtk = 'groundshot'; }}, cam: {on: 'mid', z: 1.75, dy: 8, k: 0.1}});
  // the arrow cyclone; a hundred summoned blades answer it
  fight(21.5, {acts: {[2]: () => bossAttack('spiral'), [60]: 'slot0'}, cam: {on: 'mid', z: 1.25, dy: -26, k: 0.08}});
  // the gale dash - a just dodge, time slows
  fight(22.5, {enter: () => { boss.x = clamp(boss.x, 150, 340); player.x = boss.x < 240 ? boss.x + 150 : boss.x - 150; },
    acts: {[2]: () => bossAttack('gale')}, cam: {on: 'mid', z: 1.5, k: 0.1}});
  // break: he is open - 검기 오연참, 검산, the five-hit combo
  fight(24, {enter: () => { boss.x = 300; player.x = 236; player.face = 1; boss.vx = 0; stunBoss(300); __T.kick(2, true); },
    acts: {[18]: 'slot1', [96]: 'slot2'}, plan: Object.assign({}, FIGHT, {near: 34, atkEvery: 5}), cam: {on: 'boss', z: 2, dx: -24, k: 0.15}});

  /* ================= AWAKENING (bars 84-88, the breakdown) ================= */
  to(B(85), shot({enter: () => { boss.hp = boss.maxHp * 0.5; startPhase2(); boss.kneel = true; boss.x = 320; player.x = 170; player.face = 1; boss.face = -1; },
    each: hold('phase2', 30), cam: {on: 'boss', z: 2.5, dy: -2, k: 0.15},
    subs: [{who: 'boss', text: '...크윽. 화살이 닿질 않아. 격이 다르다는 건가.', at: 10, dur: 112, speed: 1.6}]}));
  to(B(86), shot({enter: () => { boss.kneel = false; boss.summon = true; }, each: hold('phase2', 30),
    cam: {on: 'boss', z: 2.5, dy: -8, k: 0.15},
    subs: [{who: 'boss', text: '깨어나라, 태고의 숲이여. 이 자를 삼켜라!', at: 4, dur: 120, speed: 1.4}]}));
  // the forest rises: the game's own 100-frame awakening, stretched across the last two bars of the breakdown
  const wake = Math.round(B(88)) - Math.round(B(86));
  to(B(88), shot({enter: () => { setScene('phase2b'); SND.sfx.rumble(); }, slow: wake / 100,
    cam: {on: [240, 178], to: [240, 140], z: [1.6, 1], k: 1}, snap: false}));

  /* ================= THE LAST PHRASE (bars 88-96) ================= */
  const c0 = Math.round(B(88)), ct = (k, fr = 0) => Math.round(B(k)) - c0 + fr;
  // the duel resumes on the downbeat: homing arrows chase him; 검산 and a scatter shot; the blades again
  to(B(89.5), shot({plan: FIGHT, hpFloor: 0.7, each: all(leash, kicks), acts: {[2]: () => bossAttack('homing'), [110]: 'slot2'},
    cam: {on: 'mid', z: 1.25, k: 0.1}}));
  to(B(91), shot({plan: FIGHT, hpFloor: 0.7, each: all(leash, kicks), enter: () => { if (boss.x > 380 || boss.x < 100) boss.x = clamp(player.x + 140, 120, 360); },
    acts: {[4]: () => bossAttack('split'), [70]: 'slot0', [120]: 'slot1'}, cam: {on: 'hero', z: 1.75, dx: 26, k: 0.12}}));
  // 보스 필살기: 신록의 심판
  to(B(91) + 84, shot({enter: () => { boss.hp = boss.maxHp * 0.24; boss.state = 'idle'; boss.onGround = true; startBossUlt(); }, cam: {on: [240, 135], z: 1, k: 1}}));
  // the rain of arrows (ult 0-120)...
  to(B(91) + 84 + 120, shot({each: kicks, cam: {on: [240, 130], z: 1, k: 1}}));
  // ...a jump cut to the flood of thorns: two jumps carry him over it, and the bowmaster lands open
  const u0 = f;
  to(B(94), shot({skip: 110, each: all(leash, kicks),
    acts: {[312 - 230 - 8]: 'jump', [312 - 230 + 10]: 'jump'},
    cam: {on: 'hero', z: 1.25, dy: -20, k: 0.08}}));
  // 빈틈 - the sword is charged (70 frames) and 천지 가르기 runs so that its last cut (frame 178) lands on bar 96
  const SPLIT = 178, sp0 = Math.round(B(96)) - SPLIT;
  to(sp0, shot({enter: () => { player.sp = 100; boss.hp = boss.maxHp * 0.01; player.x = clamp(boss.x - 110, 60, 420); player.y = FLOOR; player.vy = 0; player.onGround = true; player.onPlatform = false; player.face = 1; player.vx = 0; },
    each: () => { leash(); if (scene === 'fight') __D.keys(['+special']); },
    render: () => {
      const p = player, bx = Math.round(p.x - 30), by = Math.round(p.y - 62), fr = ctx.fillRect, tx = text;
      ctx.fillRect = function (x, y, w, h) { if (p.state === 'charge' && (h === 13 || h === 15) && y >= by - 1 && y <= by && x >= bx - 1 && x <= bx) return; return fr.call(this, x, y, w, h); };
      text = (str, ...a) => p.state === 'charge' && (str === '충전 중' || /^\d+%$/.test(str)) ? 0 : tx(str, ...a);
      try { render(); } finally { ctx.fillRect = fr; text = tx; }
    },
    cam: {on: 'hero', z: [2, 2.8], dy: -6, k: 0.2}, snap: false}));
  to(B(96), shot({enter: () => { if (scene !== 'special') startSpecial(); }, cam: {on: [240, 135], z: 1, k: 1}}));

  /* ================= SILENCE: the split, his fall ================= */
  to(B(96) + SIL, shot({impact: [[0, 4]], each: hold('victory', 99), cam: {on: 'boss', z: 1.5, k: 0.06}}));

  /* ================= THE OUTRO (bars 104-108): the chain on his mind breaks ================= */
  to(O(105), shot({enter: () => { if (scene !== 'victory') startVictory(); setScene('victory', 99); }, each: hold('victory', 140),
    cam: {on: 'boss', z: 2.5, dy: -6, k: 0.2}}));
  to(O(106.6), shot({each: hold('victory', 140), cam: {on: 'mid', z: 2, k: 0.1},
    subs: [{who: 'boss', text: '...머리가 맑아졌다. 사슬 소리가 멎었어.', at: 4, dur: 92, speed: 1.5},
      {who: 'boss', text: '내 활의 혼을 가져가라.', at: 100, dur: 96, speed: 1.6}]}));
  // (the loot, the jingle and the results screen stay out of it)
  to(O(108) + 110, shot({enter: () => setScene('victory2'), each: () => { items.length = 0; if (scene === 'victory2') { if (sceneT === 39) sceneT = 40; if (sceneT > 180) sceneT = 180; } },
    cam: {on: 'hero', to: [240, 140], z: [1.9, 1.1], k: 1}, snap: false, fadeOut: 50,
    over: (og, i, W, H) => {
      const a = fadeA(i, 170, 400, 20);
      if (!a) return;
      cap(og, '제1장  ·  사슬의 묘지', {x: W / 2, y: 330, sc: 2, a});
      cap(og, '보우마스터, 해방', {x: W / 2, y: 380, sc: 4, a, color: C.G3});
      cap(og, 'MUSIC: KARL CASEY - WHITE BAT AUDIO', {x: W / 2, y: H - 70, sc: 1, a, S: 2});
    }}));

  music[music.length - 1].dur = f / 60 - music[music.length - 1].at;
  // snap: whole output pixels per game pixel (zooms are held per shot; only the five glides above run free)
  return {segs, cues, music, total: f, out: [1920, 1080], snap: true};
})();
