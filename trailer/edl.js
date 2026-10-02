// the edit: every shot of the trailer, in order, at 60 fps. functions are fine here (this runs in the page)
window.__EDL = (() => {
  const segs = [], cues = [];
  let f = 0;
  const add = (s) => { s.f0 = f; segs.push(s); for (const [rel, ...c] of (s.cues || [])) cues.push([f + rel, ...c]); f += s.len; return s; };
  const at = () => f;
  /* the music: Karl Casey - "Deadly Force" (White Bat Audio), 115 bpm. bar k of the track starts at
     SONG.drop + (k - 16) * SONG.bar seconds; bar 16 is the drop, bar 104 the outro. the trailer starts on bar 12
     and every cut below is placed on that grid (Fb(k) = trailer frame of song bar k) */
  const SONG = {bpm: 115, bar: 240 / 115, drop: 33.440, first: 12, splice: 32, outro: 104};
  const songT = k => SONG.drop + (k - 16) * SONG.bar;
  const Fb = k => Math.round((k - SONG.first) * SONG.bar * 60);
  const to = (k, s) => { s.len = Fb(k) - f; return add(s); };      // a shot that ends exactly on song bar k
  // gain: the intro sits low and swells so the drop lands harder; fadeOut: the outro is gone before the last heartbeat
  const music = [
    {src: songT(SONG.first), dur: songT(16) - songT(SONG.first), at: 0, gain: 0.5, fadeIn: 2},
    {src: songT(16), dur: songT(SONG.splice) - songT(16), at: (16 - SONG.first) * SONG.bar},
    // the end of the first big phrase (bar 31 is its fill) runs straight into the track's own outro
    {src: songT(SONG.outro), at: (SONG.splice - SONG.first) * SONG.bar, fadeOut: 2.4, tail: 0.4},
  ];

  // a boss standing still for a skill showcase
  const skillShot = (skill, key, o = {}) => ({shot: 'fight', key, z: o.z || 1.5, px: o.px ?? 200, bx: o.bx ?? 290, warm: o.warm ?? 4,
    opt: {cls: 3, phase2: o.phase2 !== false, idle: 400, loadout: [skill, null, null, null, null]},
    plan: Object.assign({acts: {[o.castAt ?? 2]: o.castKey || 'slot0'}, near: 40, dash: false, idle: !!o.idle}, o.plan || {}),
    hpFloor: 0.55, camOn: o.camOn, camY: o.camY, cues: o.cues});

  /* ---------- A. cold open over the intro and the build (bars 12-16): the game's own opening, cut down ---------- */
  add({shot: 'opening', from: 170, len: 100, fadeIn: 20});
  add({shot: 'opening', from: 335, len: 78});
  add({shot: 'opening', from: 615, len: 78});
  add({shot: 'opening', from: 955, len: 90});
  add({shot: 'opening', from: 1345, len: 68});
  // "이 세상을, 구하겠다." runs out where the track drops out for the break before the drop
  to(16 - 0.19, {shot: 'opening', from: 1700});

  /* ---------- B. the name lands on the drop ---------- */
  const pre = Fb(16) - f;
  to(17, {shot: 'title', hit: pre, cues: [[pre, 'sfx', 'iai'], [pre, 'sfx', 'impact']]});

  /* ---------- C. the four bosses, a cut every half bar (bars 17-22) ---------- */
  const card = (key, k) => to(k, {shot: 'scene', scene: 'bosscard', key, from: 14, cues: [[0, 'sfx', 'whoosh']]});
  const fight = (key, k, o) => to(k, Object.assign({shot: 'fight', key, z: 1.5, hpFloor: 0.55}, o));
  to(17.5, {shot: 'card', lines: ['네 개의 사슬.'], sc: 5, rule: true, cues: [[0, 'sfx', 'chain']]});
  card('bow', 18);
  fight('bow', 18.5, {px: 200, bx: 300, warm: 40, opt: {cls: 1, loadout: ['blade', 'fury', 'peak', 'flash', null]}, plan: {acts: {6: 'slot0'}, just: true}});
  card('gun', 19);
  fight('gun', 19.5, {px: 160, bx: 330, warm: 50, opt: {cls: 1, loadout: ['fury', 'blade', 'peak', 'bloom', null]}, plan: {acts: {6: 'slot0'}, just: true}});
  card('sword', 20);
  fight('sword', 20.5, {px: 200, bx: 300, warm: 30, opt: {cls: 2, loadout: ['rain', 'blade', 'peak', 'swallow', null]}, plan: {acts: {4: 'slot3'}, just: true}});
  card('chain', 21);
  fight('chain', 21.5, {px: 200, bx: 310, warm: 30, opt: {cls: 2, loadout: ['prison', 'march', 'peak', 'reign', null]}, plan: {acts: {2: 'slot1'}, just: true}});
  to(22, {shot: 'card', lines: ['모든 사슬을, 끊어라.'], sc: 5, rule: true, cues: [[0, 'sfx', 'brk']]});

  /* ---------- D. growth: Master -> Lord -> God (bars 22-25; the God's burst opens the second phrase) ---------- */
  const promo = (c, from, k) => to(k, {shot: 'scene', key: 'bow', opt: {cls: c}, enter: () => { save.promoShown = c - 1; startPromote(true); }, warm: from});
  promo(1, 112, 22.5);
  to(23, skillShot('flash', 'chain', {z: 2, px: 170, bx: 300, castAt: 4}));
  promo(2, 112, 23.5);
  to(24, skillShot('march', 'sword', {z: 1, castAt: 2}));
  promo(3, 112, 24.5);
  promo(3, 170, 25);

  /* ---------- E. everything at once (bars 25-31) ---------- */
  to(26.5, {shot: 'scene', key: 'gun', opt: {cls: 3, phase2: true}, pre: () => { boss.hp = boss.maxHp * 0.2; }, enter: () => startBossUlt(),
    auto: true, plan: {just: true, near: 60}, z: 1});
  to(27, skillShot('blade', 'chain', {castAt: 2}));
  to(27.5, skillShot('fury', 'sword', {castAt: 2}));
  to(28, skillShot('rain', 'bow', {castAt: 2}));
  to(28.5, skillShot('bloom', 'chain', {castAt: 2, plan: {holds: i => i > 2 && i < 40 ? ['slot0'] : null}}));
  to(29, skillShot('swallow', 'sword', {castAt: 2}));
  // 천지 가르기: its last cut, the one that splits the screen (178 frames in), falls on the downbeat of bar 31
  const SPLIT = 178;
  add(Object.assign(skillShot('prison', 'chain', {castAt: 2}), {len: Fb(31) - SPLIT - f}));
  // the Sovereign is down to his last sliver, so the split finishes him and his fall fills the fill bar
  const storm = {key: 'chain', opt: {cls: 3, phase2: true, ult: 'storm'}, pre: () => { boss.hp = boss.maxHp * 0.02; },
    enter: () => { player.x = 200; boss.x = 300; startSpecial(); }, z: 1};
  add(Object.assign({shot: 'scene', len: SPLIT}, storm));
  to(32 - 0.05, Object.assign({shot: 'scene', warm: SPLIT, cues: [[0, 'sfx', 'boom']]}, storm));

  /* ---------- G. end card on the outro, then the game's own last word ---------- */
  const hit = Fb(32) - f;
  to(34 - 0.05, {shot: 'title', hit, tag: '이 세상을, 구하겠다.', tagAt: 50, foot: '블레이드 서머너  ·  브라우저에서 바로 플레이', footAt: 70,
    credit: 'MUSIC: KARL CASEY - WHITE BAT AUDIO', fadeOut: 20, cues: [[hit, 'sfx', 'iai'], [hit, 'sfx', 'chime']]});
  // THE END. . . . ? / 지구의 중심에, 아직 무언가가 남아 있다 - the only hint of what waits below, with a heartbeat under it
  const e0 = Fb(34) - f;
  add({shot: 'scene', key: 'bow', len: Fb(36) + 50 - f, enter: () => { trueEnd = false; setScene('ending', END.fin - e0); particles.length = 0; }, opt: {},
    cues: [[e0 + 40, 'sfx', 'tick'], [e0 + 50, 'sfx', 'tick'], [e0 + 60, 'sfx', 'tick'], [e0 + 70, 'sfx', 'tick'], [e0 + 92, 'sfx', 'brk'], [e0 + 92, 'sfx', 'boom'],
      [e0 + 120, 'sfx', 'chain'], [e0 + 150, 'sfx', 'heart'], [e0 + 190, 'sfx', 'heart'], [e0 + 230, 'sfx', 'heart']]});

  music[music.length - 1].dur = f / 60 - music[music.length - 1].at;
  return {segs, cues, music, total: f};
})();
