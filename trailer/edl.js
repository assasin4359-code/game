// the edit: every shot of the trailer, in order, at 60 fps. functions are fine here (this runs in the page)
window.__EDL = (() => {
  const segs = [], cues = [];
  let f = 0;
  const add = (s) => { s.f0 = f; segs.push(s); for (const [rel, ...c] of (s.cues || [])) cues.push([f + rel, ...c]); f += s.len; return s; };
  const at = () => f;
  // music grid: 'chain' runs at 150 bpm = exactly 6 frames a sixteenth, 'chain2' at 170 bpm
  const HB150 = 48, HB170 = 8 * 60 * 60 / 170 / 4;
  let hbBase = 0, hbCount = 0;
  const hb170 = (n) => { const a = Math.round(hbCount * HB170), b = Math.round((hbCount + n) * HB170); hbCount += n; return b - a; };

  // a boss standing still for a skill showcase
  const skillShot = (skill, key, len, o = {}) => ({shot: 'fight', key, len, z: o.z || 1.5, px: o.px ?? 200, bx: o.bx ?? 290, warm: o.warm ?? 4,
    opt: {cls: 3, phase2: o.phase2 !== false, idle: 400, loadout: [skill, null, null, null, null]},
    plan: Object.assign({acts: {[o.castAt ?? 2]: o.castKey || 'slot0'}, near: 40, dash: false, idle: !!o.idle}, o.plan || {}),
    each: o.each, hpFloor: 0.55, camOn: o.camOn, camY: o.camY, cues: o.cues});

  /* ---------- A. cold open: the game's own opening, cut down ---------- */
  add({shot: 'opening', from: 110, len: 190, fadeIn: 50, cues: [[0, 'drone', {on: 1, note: 28, gain: 0.16, fade: 3.5}]]});
  add({shot: 'opening', from: 330, len: 150});
  add({shot: 'opening', from: 590, len: 150});
  add({shot: 'opening', from: 870, len: 200, cues: [[0, 'drone', {on: 1, note: 24, gain: 0.2, fade: 1.5}]]});
  add({shot: 'opening', from: 1150, len: 120, cues: [[0, 'drone', {on: 1, note: 28, gain: 0.12, fade: 1}]]});
  add({shot: 'opening', from: 1330, len: 110});
  add({shot: 'opening', from: 1688, len: 80, cues: [[0, 'drone', {on: 1, note: 31, gain: 0.22, fade: 1.2}], [79, 'drone', {on: 0, fade: 0.05}]]});

  /* ---------- B. title ---------- */
  add({shot: 'black', len: 30, cues: [[0, 'riser', {dur: 0.5}]]});
  add({shot: 'title', len: 170, hit: 8, cues: [[8, 'sfx', 'iai'], [8, 'sfx', 'boom'], [8, 'sfx', 'impact'], [8, 'drone', {on: 1, note: 24, gain: 0.14, fade: 0.05}], [150, 'drone', {on: 0, fade: 0.3}]]});

  /* ---------- C. the four bosses (music: the Chain Sovereign's theme, 150 bpm) ---------- */
  const M0 = at();
  cues.push([M0, 'music', 'chain']);
  add({shot: 'scene', key: 'bow', len: 96, z: 1.5, opt: {cls: 0, loadout: ['blade', 'fury', 'peak', null, null]}, auto: true, plan: {near: 40},
    enter: () => { player.x = 150; startMini(); }, warm: 130, hpFloor: 0.6});
  add({shot: 'card', len: 48, lines: ['네 개의 사슬.'], sc: 5, rule: true, cues: [[0, 'sfx', 'impact'], [0, 'sfx', 'chain']]});
  add({shot: 'scene', scene: 'bosscard', key: 'bow', from: 14, len: 48, cues: [[0, 'sfx', 'whoosh'], [6, 'sfx', 'impact']]});
  add({shot: 'fight', key: 'bow', len: 96, z: 1.5, px: 150, bx: 330, warm: 20, opt: {cls: 1, loadout: ['blade', 'fury', 'peak', 'flash', null]},
    plan: {acts: {30: 'slot0', 70: 'slot1'}, just: true}, hpFloor: 0.55});
  add({shot: 'scene', scene: 'bosscard', key: 'gun', from: 14, len: 48, cues: [[0, 'sfx', 'whoosh'], [6, 'sfx', 'impact']]});
  add({shot: 'fight', key: 'gun', len: 96, z: 1.5, px: 160, bx: 330, warm: 40, opt: {cls: 1, loadout: ['fury', 'blade', 'peak', 'bloom', null]},
    plan: {acts: {44: 'slot0'}, just: true}, hpFloor: 0.55});
  add({shot: 'scene', scene: 'bosscard', key: 'sword', from: 14, len: 48, cues: [[0, 'sfx', 'whoosh'], [6, 'sfx', 'impact']]});
  add({shot: 'fight', key: 'sword', len: 96, z: 1.5, px: 160, bx: 320, warm: 30, opt: {cls: 2, loadout: ['rain', 'blade', 'peak', 'swallow', null]},
    plan: {acts: {20: 'slot0', 64: 'slot3'}, just: true}, hpFloor: 0.55});
  add({shot: 'scene', scene: 'bosscard', key: 'chain', from: 14, len: 48, cues: [[0, 'sfx', 'whoosh'], [6, 'sfx', 'impact']]});
  add({shot: 'fight', key: 'chain', len: 96, z: 1.5, px: 160, bx: 320, warm: 30, opt: {cls: 2, loadout: ['prison', 'march', 'peak', 'reign', null]},
    plan: {acts: {10: 'slot0', 56: 'slot1'}, just: true}, hpFloor: 0.55});
  add({shot: 'card', len: 48, lines: ['모든 사슬을, 끊어라.'], sc: 5, rule: true, cues: [[0, 'sfx', 'impact'], [0, 'sfx', 'brk']]});

  /* ---------- D. growth: Summoner -> Master -> Lord -> God ---------- */
  const promo = (c, from, len = HB150) => ({shot: 'scene', len, key: 'bow', opt: {cls: c}, enter: () => { save.promoShown = c - 1; startPromote(true); }, warm: from});
  add(promo(1, 112));
  add(skillShot('flash', 'chain', HB150, {z: 2, px: 170, bx: 300, castAt: 4}));
  add(promo(2, 112));
  add(skillShot('march', 'sword', HB150, {z: 1, castAt: 2}));
  add(promo(3, 112));
  add(promo(3, 170));
  add(skillShot('domain', 'chain', HB150, {z: 1.5, castAt: 2, plan: {acts: {2: 'slot0'}, near: 40, atkEvery: 4}}));
  add(skillShot('formless', 'origin', HB150, {z: 1.5, castAt: 2, plan: {acts: {2: 'slot0'}, near: 120, atkEvery: 5}}));

  /* ---------- E. everything at once (music: the same theme, 170 bpm) ---------- */
  const E0 = at();
  cues.push([E0, 'musicStop'], [E0, 'music', 'chain2']);
  add({shot: 'scene', key: 'gun', len: hb170(4), opt: {cls: 3, phase2: true}, pre: () => { boss.hp = boss.maxHp * 0.2; }, enter: () => startBossUlt(),
    auto: true, plan: {just: true, near: 60}, z: 1});
  add(skillShot('blade', 'chain', hb170(1), {castAt: 2}));
  add(skillShot('fury', 'sword', hb170(1), {castAt: 2}));
  add(skillShot('peak', 'gun', hb170(1), {castAt: 2, px: 150}));
  add(skillShot('rain', 'bow', hb170(1), {castAt: 2}));
  add(skillShot('bloom', 'chain', hb170(1), {castAt: 2, plan: {holds: i => i > 2 && i < 40 ? ['slot0'] : null}}));
  add(skillShot('swallow', 'sword', hb170(1), {castAt: 2}));
  add(skillShot('reign', 'origin', hb170(1), {castAt: 2, plan: {acts: {2: 'slot0'}, near: 40, atkEvery: 5}}));
  add(skillShot('prison', 'chain', hb170(1), {castAt: 2}));
  add({shot: 'scene', key: 'chain', len: hb170(6), opt: {cls: 3, phase2: true, ult: 'storm'}, enter: () => { player.x = 200; boss.x = 300; startSpecial(); }, z: 1,
    cues: [[178, 'musicStop'], [178, 'sfx', 'boom']]});

  /* ---------- F. the hidden one ---------- */
  add({shot: 'black', len: 40, cues: [[0, 'drone', {on: 1, note: 24, gain: 0.12, fade: 2.5}]]});
  add({shot: 'card', len: 210, sc: 4, type: 3, typeDelay: 6, lines: ['네 개의 사슬이 모두 끊어진 날,', '지구의 중심에서, 그가 깨어난다.'], colors: [C.W, C.P],
    cues: [[30, 'sfx', 'heart'], [90, 'sfx', 'heart'], [150, 'sfx', 'heart'], [190, 'sfx', 'heart']]});
  add({shot: 'scene', scene: 'intro', key: 'origin', from: 340, len: 140});
  add({shot: 'fight', key: 'origin', len: 120, z: 1.5, px: 160, bx: 320, warm: 60, opt: {cls: 3, loadout: ['flash', 'swallow', 'bloom', 'march', 'domain']},
    plan: {acts: {30: 'slot0', 80: 'slot1'}, just: true}, hpFloor: 0.7, cues: [[0, 'drone', {on: 1, note: 26, gain: 0.16, fade: 0.5}]]});
  add({shot: 'scene', key: 'origin', len: 290, opt: {cls: 3, phase2: true, ult: 'god'}, enter: () => { player.x = 180; boss.x = 320; startSpecial(); }, z: 1,
    cues: [[0, 'drone', {on: 0, fade: 2}]]});

  /* ---------- G. end card + the game's own last word ---------- */
  add({shot: 'title', len: 330, hit: 6, tag: '이 세상을, 구하겠다.', tagAt: 60, foot: '블레이드 서머너  ·  브라우저에서 바로 플레이', footAt: 110, fadeOut: 40,
    cues: [[6, 'sfx', 'iai'], [6, 'sfx', 'boom'], [6, 'sfx', 'chime'], [6, 'music', 'calm'], [66, 'sfx', 'impact'], [300, 'musicStop']]});
  add({shot: 'black', len: 36});
  add({shot: 'scene', key: 'bow', len: 200, enter: () => { trueEnd = false; setScene('ending', END.fin - 6); particles.length = 0; }, opt: {},
    cues: [[6 + 40, 'sfx', 'tick'], [6 + 50, 'sfx', 'tick'], [6 + 60, 'sfx', 'tick'], [6 + 70, 'sfx', 'tick'], [6 + 92, 'sfx', 'brk'], [6 + 92, 'sfx', 'boom'], [6 + 120, 'sfx', 'chain']]});

  return {segs, cues, total: f, M0, E0};
})();
