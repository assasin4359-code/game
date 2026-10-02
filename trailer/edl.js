// the edit: every shot of the trailer, in order, at 60 fps. functions are fine here (this runs in the page)
window.__EDL = (() => {
  const segs = [], cues = [];
  let f = 0;
  const add = (s) => { s.f0 = f; segs.push(s); for (const [rel, ...c] of (s.cues || [])) cues.push([f + rel, ...c]); f += s.len; return s; };
  const at = () => f;
  // music grid: 'chain' runs at 150 bpm = exactly 6 frames a sixteenth, 'chain2' at 170 bpm
  const HB150 = 48, HB170 = 8 * 60 * 60 / 170 / 4;
  let hbCount = 0;
  const hb170 = (n) => { const a = Math.round(hbCount * HB170), b = Math.round((hbCount + n) * HB170); hbCount += n; return b - a; };

  // a boss standing still for a skill showcase
  const skillShot = (skill, key, len, o = {}) => ({shot: 'fight', key, len, z: o.z || 1.5, px: o.px ?? 200, bx: o.bx ?? 290, warm: o.warm ?? 4,
    opt: {cls: 3, phase2: o.phase2 !== false, idle: 400, loadout: [skill, null, null, null, null]},
    plan: Object.assign({acts: {[o.castAt ?? 2]: o.castKey || 'slot0'}, near: 40, dash: false, idle: !!o.idle}, o.plan || {}),
    each: o.each, hpFloor: 0.55, camOn: o.camOn, camY: o.camY, cues: o.cues});

  /* ---------- A. cold open: the game's own opening, cut down ---------- */
  add({shot: 'opening', from: 160, len: 110, fadeIn: 30, cues: [[0, 'drone', {on: 1, note: 28, gain: 0.16, fade: 2.5}]]});
  add({shot: 'opening', from: 330, len: 90});
  add({shot: 'opening', from: 610, len: 90});
  add({shot: 'opening', from: 940, len: 120, cues: [[0, 'drone', {on: 1, note: 24, gain: 0.2, fade: 1}]]});
  add({shot: 'opening', from: 1330, len: 90, cues: [[0, 'drone', {on: 1, note: 28, gain: 0.12, fade: 0.8}]]});
  add({shot: 'opening', from: 1688, len: 80, cues: [[0, 'drone', {on: 1, note: 31, gain: 0.22, fade: 1}], [79, 'drone', {on: 0, fade: 0.05}]]});

  /* ---------- B. title ---------- */
  add({shot: 'black', len: 20, cues: [[0, 'riser', {dur: 0.33}]]});
  add({shot: 'title', len: 130, hit: 8, cues: [[8, 'sfx', 'iai'], [8, 'sfx', 'boom'], [8, 'sfx', 'impact'], [8, 'drone', {on: 1, note: 24, gain: 0.14, fade: 0.05}], [110, 'drone', {on: 0, fade: 0.3}]]});

  /* ---------- C. the four bosses (music: the Chain Sovereign's theme, 150 bpm; a cut every half bar) ---------- */
  const M0 = at();
  cues.push([M0, 'music', 'chain']);
  const card = (key) => ({shot: 'scene', scene: 'bosscard', key, from: 14, len: HB150, cues: [[0, 'sfx', 'whoosh'], [6, 'sfx', 'impact']]});
  add({shot: 'card', len: HB150, lines: ['네 개의 사슬.'], sc: 5, rule: true, cues: [[0, 'sfx', 'impact'], [0, 'sfx', 'chain']]});
  add(card('bow'));
  add({shot: 'fight', key: 'bow', len: HB150, z: 1.5, px: 200, bx: 300, warm: 40, opt: {cls: 1, loadout: ['blade', 'fury', 'peak', 'flash', null]},
    plan: {acts: {6: 'slot0'}, just: true}, hpFloor: 0.55});
  add(card('gun'));
  add({shot: 'fight', key: 'gun', len: HB150, z: 1.5, px: 160, bx: 330, warm: 50, opt: {cls: 1, loadout: ['fury', 'blade', 'peak', 'bloom', null]},
    plan: {acts: {6: 'slot0'}, just: true}, hpFloor: 0.55});
  add(card('sword'));
  add({shot: 'fight', key: 'sword', len: HB150, z: 1.5, px: 200, bx: 300, warm: 30, opt: {cls: 2, loadout: ['rain', 'blade', 'peak', 'swallow', null]},
    plan: {acts: {4: 'slot3'}, just: true}, hpFloor: 0.55});
  add(card('chain'));
  add({shot: 'fight', key: 'chain', len: HB150, z: 1.5, px: 200, bx: 310, warm: 30, opt: {cls: 2, loadout: ['prison', 'march', 'peak', 'reign', null]},
    plan: {acts: {2: 'slot1'}, just: true}, hpFloor: 0.55});
  add({shot: 'card', len: HB150, lines: ['모든 사슬을, 끊어라.'], sc: 5, rule: true, cues: [[0, 'sfx', 'impact'], [0, 'sfx', 'brk']]});

  /* ---------- D. growth: Summoner -> Master -> Lord -> God ---------- */
  const promo = (c, from, len = HB150) => ({shot: 'scene', len, key: 'bow', opt: {cls: c}, enter: () => { save.promoShown = c - 1; startPromote(true); }, warm: from});
  add(promo(1, 112));
  add(skillShot('flash', 'chain', HB150, {z: 2, px: 170, bx: 300, castAt: 4}));
  add(promo(2, 112));
  add(skillShot('march', 'sword', HB150, {z: 1, castAt: 2}));
  add(promo(3, 112));
  add(promo(3, 170));

  /* ---------- E. everything at once (music: the same theme, 170 bpm) ---------- */
  const E0 = at();
  cues.push([E0, 'musicStop'], [E0, 'music', 'chain2']);
  add({shot: 'scene', key: 'gun', len: hb170(4), opt: {cls: 3, phase2: true}, pre: () => { boss.hp = boss.maxHp * 0.2; }, enter: () => startBossUlt(),
    auto: true, plan: {just: true, near: 60}, z: 1});
  add(skillShot('blade', 'chain', hb170(1), {castAt: 2}));
  add(skillShot('fury', 'sword', hb170(1), {castAt: 2}));
  add(skillShot('rain', 'bow', hb170(1), {castAt: 2}));
  add(skillShot('bloom', 'chain', hb170(1), {castAt: 2, plan: {holds: i => i > 2 && i < 40 ? ['slot0'] : null}}));
  add(skillShot('swallow', 'sword', hb170(1), {castAt: 2}));
  add(skillShot('prison', 'chain', hb170(1), {castAt: 2}));
  // 천지 가르기: the music dies on the last cut that splits the screen
  add({shot: 'scene', key: 'chain', len: 232, opt: {cls: 3, phase2: true, ult: 'storm'}, enter: () => { player.x = 200; boss.x = 300; startSpecial(); }, z: 1,
    cues: [[178, 'musicStop'], [178, 'sfx', 'boom']]});
  // 일검무귀: the world goes silent, one cut
  add({shot: 'scene', key: 'chain', len: 285, opt: {cls: 3, phase2: true, ult: 'god'}, enter: () => { player.x = 180; boss.x = 320; startSpecial(); }, z: 1});

  /* ---------- G. end card, then the only hint of what waits at the centre of the Earth ---------- */
  add({shot: 'title', len: 240, hit: 6, tag: '이 세상을, 구하겠다.', tagAt: 50, foot: '블레이드 서머너  ·  브라우저에서 바로 플레이', footAt: 90, fadeOut: 30,
    cues: [[6, 'sfx', 'iai'], [6, 'sfx', 'boom'], [6, 'sfx', 'chime'], [6, 'music', 'calm'], [56, 'sfx', 'impact'], [225, 'musicStop']]});
  add({shot: 'black', len: 20});
  // the game's own normal-ending stinger: THE END. . . . ? / 지구의 중심에, 아직 무언가가 남아 있다 - and a heartbeat under it
  add({shot: 'scene', key: 'bow', len: 230, enter: () => { trueEnd = false; setScene('ending', END.fin - 6); particles.length = 0; }, opt: {},
    cues: [[6 + 40, 'sfx', 'tick'], [6 + 50, 'sfx', 'tick'], [6 + 60, 'sfx', 'tick'], [6 + 70, 'sfx', 'tick'], [6 + 92, 'sfx', 'brk'], [6 + 92, 'sfx', 'boom'],
      [6 + 120, 'sfx', 'chain'], [6 + 140, 'sfx', 'heart'], [6 + 175, 'sfx', 'heart'], [6 + 210, 'sfx', 'heart']]});

  return {segs, cues, total: f, M0, E0};
})();
