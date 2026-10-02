/* ---------- scene flow ---------- */
/* story: when the Master of Chains bound the world, he poured too much of his own power into the chains, and out of
   them - by accident - came a perfect copy of himself: the hero. he remembers nothing, not even who he is, but
   there is goodness in him, and he sets out to save the world with the power he woke with. the three strongest,
   their minds chained by the Chain Sovereign, serve the Master; each of them feels at once that this one is on
   another level, and the Sovereign feels his master's own power in him. at the centre of the Earth the two meet,
   and see the same face. 'freed' is spoken after each win, once the chain lets go */
const LINES = {
  bow: {
    intro: [
      {who: 'boss', text: '...사슬에 묶이지 않고 걸어 다니는 자라니. 넌 누구냐.'},
      {who: 'hero', text: '나도 모른다. 하지만 이 사슬은 끊어야 한다는 것만은 안다.'},
      {who: 'boss', text: '...이 기척, 예사롭지 않군. 이 녀석, 강하다.'},
      {who: 'boss', text: '그래도 주인의 명이다. 사슬을 거스르는 자는 모두 꿰뚫는다!'},
    ],
    p2: [
      {who: 'boss', text: '...크윽. 화살이 닿질 않아. 격이 다르다는 건가.'},
      {who: 'boss', text: '깨어나라, 태고의 숲이여. 이 자를 삼켜라!'},
    ],
    freed: [
      {who: 'boss', text: '...머리가 맑아졌다. 사슬 소리가 멎었어.'},
      {who: 'boss', text: '이름도 기억 못 하는 자에게 졌군. 사슬에 묶인 활로는 애초에 상대가 안 됐어.'},
      {who: 'boss', text: '내 활의 혼을 가져가라. 사슬의 군주를, 반드시 꿰뚫어 다오.'},
    ],
  },
  gun: {
    intro: [
      {who: 'boss', text: '...라멘 국물이 식었군. 보우마스터를 쓰러뜨린 게 너냐?'},
      {who: 'hero', text: '그래. 네 사슬도 끊으러 왔다.'},
      {who: 'boss', text: '...농담이 아니네. 서 있는 것만 봐도 알겠어. 급이 달라.'},
      {who: 'boss', text: '그래도 탄창은 가득 찼다. 총알 비 속에 누워라!'},
    ],
    p2: [
      {who: 'boss', text: '뭐야 이 녀석... 총알이 전부 베여 나간다고?'},
      {who: 'boss', text: '좋아, 진짜 지옥을 보여 주지. 총알 지옥의 처형장이다!'},
    ],
    freed: [
      {who: 'boss', text: '...으, 머리야. 내가 사슬 편에 서서 방아쇠를 당기고 있었다고?'},
      {who: 'boss', text: '너, 대체 정체가 뭐야. 강해도 너무 강하잖아.'},
      {who: 'boss', text: '내 총알, 같이 데려가. 그 군주 녀석 머리에 한 방 먹여 주라고.'},
    ],
  },
  sword: {
    intro: [
      {who: 'boss', text: '...바람이 멎었군. 사슬이 속삭인다. 너를 베라고.'},
      {who: 'boss', text: '둘을 쓰러뜨린 검... 보기만 해도 알겠다. 격이 다르다.'},
      {who: 'hero', text: '그렇다면 비켜라. 너와 싸울 이유는 없다.'},
      {who: 'boss', text: '나는 검으로만 대답한다. 한 번 뽑으면, 한 번에 끝난다.'},
    ],
    p2: [
      {who: 'boss', text: '...나의 발도를 보고도 서 있는 자는 처음이군. 역시, 강하다.'},
      {who: 'boss', text: '좋다. 두 자루를 모두 뽑겠다. 달 아래에서 끝을 보자.'},
    ],
    freed: [
      {who: 'boss', text: '...달이, 다시 보이는군. 사슬에 먹힌 검은 검이 아니었다.'},
      {who: 'boss', text: '너의 검에는 이상한 기척이 있다. 사슬과 닮았는데... 따뜻하군.'},
      {who: 'boss', text: '내 발도를 너에게 맡기겠다. 남은 것은 사슬의 군주뿐이다.'},
    ],
  },
  chain: {
    intro: [
      {who: 'boss', text: '...세 강자를 모두 되찾았는가.'},
      {who: 'boss', text: '...잠깐. 너에게서 느껴지는 이 힘은... 주인의 힘이다.'},
      {who: 'boss', text: '이 녀석은 다르다. 너는 대체 무엇이냐.'},
      {who: 'hero', text: '나도 그걸 알고 싶다. 하지만 먼저, 이 사슬부터 끊겠다.'},
      {who: 'boss', text: '주인의 힘을 가졌다 해도 용서는 없다. 사슬째 부숴 주마!'},
    ],
    p2: [
      {who: 'boss', text: '...역시 그분의 힘인가. 좋다, 이 별 위에서 결판을 내자.'},
      {who: 'boss', text: '보아라, 네가 지키려던 세계를. 이 사슬 위에서 떨어져라!'},
    ],
    freed: [
      {who: 'boss', text: '...이럴 수가. 주인의 힘을 가진 자가... 나의 사슬을...'},
      {who: 'boss', text: '기억해 두어라... 사슬의 주인께서는... 지구의 중심에서... 기다리신다...'},
    ],
  },
  // the hidden one at the centre of the Earth: the Master of Chains - and the hero's original
  origin: {
    intro: [
      {who: 'hero', text: '뭐야... 나랑 똑같이 생겼잖아?'},
      {who: 'boss', text: '...뭐냐, 너는. 어째서 내 얼굴을 하고 있지?'},
      {who: 'boss', text: '어떤 놈이 내 부하들을 전부 쓰러뜨렸나 했더니... 그게 나였다니...'},
      {who: 'boss', text: '...이건 내 실수다. 사슬을 벼릴 때, 나의 힘을 너무 과하게 썼어...'},
      {who: 'hero', text: '......'},
      {who: 'boss', text: '세상에 나는 한 명이다. 너는 죽어야겠다.'},
      {who: 'hero', text: '지금 무슨 상황인지는 모르겠지만... 너 때문에 지구가 이렇게 됐다면, 내가 널 처단하겠다.'},
    ],
    p2: [
      {who: 'boss', text: '...내 기술을 그대로 쓰는군. 모조품 주제에.'},
      {who: 'hero', text: '흉내 낸 적 없다. 이건 처음부터 내 검이다.'},
      {who: 'boss', text: '웃기지 마라! 그 힘은 전부 내 것이다!'},
    ],
    freed: [
      {who: 'boss', text: '강하다... 나보다 강하다니, 이건 불가능해!!'},
      {who: 'boss', text: '이게 진짜일 리 없다... 젠장! 난 망할 신이라고!!'},
      {who: 'boss', text: '내가 널 창조했다! 넌 내 모조품에 불과해!!'},
      {who: 'hero', text: '난 평화로운 세상을 원한다.'},
      {who: 'hero', text: '비록 너와 똑같이 생겼지만, 난 너와 다른 존재다.'},
      {who: 'hero', text: '그러니... 내가 세상을 구하겠다.'},
    ],
  },
};
const stageMusic = p2 => ({gun: p2 ? 'gun2' : 'gun', sword: p2 ? 'sword2' : 'sword', chain: p2 ? 'chain2' : 'chain', origin: p2 ? 'chain2' : 'chain'})[stage.key] || (p2 ? 'intense' : 'fight');
const STAGE_FX = {
  bow: {flash: C.G3, p2: {s: '숲이 깨어난다', color: C.G2}},
  gun: {flash: C.Y, p2: {s: '총알 지옥의 처형장', color: C.Y}},
  sword: {flash: C.W, p2: {s: '달 아래의 결투', color: C.B, outline: C.W}},
  chain: {flash: C.R, p2: {s: '사슬의 궤도', color: C.W, outline: C.R}},
  origin: {flash: C.P, p2: {s: '사슬의 감옥', color: C.W, outline: C.P}},
};
function stepLite() {
  // a beaten boss holds its kneel (the dead pose falls over after ~80 frames) while it speaks
  player.animT++; boss.animT++; if (boss.state !== 'dead' || boss.st < 70) boss.st++;
  if (boss.releaseT > 0) boss.releaseT--;
  if (boss.flash > 0) boss.flash--;
  boss.vx *= 0.8; bossPhysics();
  updateParticles(); updateTexts(); updateAfterimages(); decayFx();
}
function ambient() {
  if (stage.key === 'origin') {
    // the void: a few violet motes rising; out by the Earth, flecks of broken links drifting past
    if (boss.p3) { if (globalT % 8 === 0) addP({x: W + 4, y: rnd(20, 230), vx: -rnd(0.5, 1.4), vy: rnd(-0.1, 0.1), life: 500, color: Math.random() < 0.5 ? C.P : C.W, size: Math.random() < 0.3 ? 2 : 1}); }
    else if (globalT % (bgMix > 0.5 ? 5 : 9) === 0) addP({x: rnd(W), y: FLOOR, vx: rnd(-0.2, 0.2), vy: -rnd(0.3, 0.8), life: 300, color: Math.random() < 0.7 ? C.P : C.W, size: 1});
    return;
  }
  if (stage.key === 'chain') {
    // red ash rising through the hall; out in orbit, violet flecks of broken links drift past
    if (bgMix > 0.5) { if (globalT % 9 === 0) addP({x: W + 4, y: rnd(20, 220), vx: -rnd(0.4, 1.2), vy: rnd(-0.1, 0.1), life: 500, color: Math.random() < 0.5 ? VIOLET : C.W, size: Math.random() < 0.3 ? 2 : 1}); }
    else if (globalT % 6 === 0) addP({x: rnd(W), y: FLOOR, vx: rnd(-0.3, 0.3), vy: -rnd(0.3, 0.9), life: 260, color: Math.random() < 0.7 ? C.R : C.K, size: Math.random() < 0.3 ? 2 : 1});
    return;
  }
  if (stage.key === 'sword') {
    // snow drifting through the park; on the ridge, moonlit petals blown sideways
    if (bgMix > 0.5) { if (globalT % 10 === 0) addP({kind: 'leaf', x: W + 4, y: rnd(40, 230), vx: -rnd(0.8, 1.6), vy: rnd(-0.2, 0.3), life: 420, color: Math.random() < 0.7 ? C.W : C.B, size: 2}); }
    else if (globalT % 7 === 0) addP({x: rnd(W), y: -2, vx: rnd(-0.3, 0.1), vy: rnd(0.4, 0.8), life: 420, color: C.W, size: Math.random() < 0.3 ? 2 : 1});
    return;
  }
  if (stage.key === 'gun') {
    if (bgMix > 0.5) { if (globalT % 9 === 0) addP({x: rnd(W), y: FLOOR - 4, vx: rnd(-0.3, 0.3), vy: -rnd(0.3, 0.8), life: 200, color: Math.random() < 0.6 ? C.R : C.Y, size: 1}); }
    else if (globalT % 26 === 0) addP({kind: 'leaf', x: -4, y: rnd(150, 230), vx: rnd(0.8, 1.6), vy: rnd(-0.2, 0.2), life: 420, color: '#f4efe2', size: 2});
    return;
  }
  if (globalT % 12 === 0) addP(bgMix > 0.5
    ? {kind: 'leaf', x: rnd(W), y: -4, vx: rnd(-0.4, 0.4), vy: rnd(0.4, 0.8), life: 360, color: Math.random() < 0.5 ? C.G2 : C.G1, size: 2}
    : {x: rnd(W), y: -2, vx: rnd(-0.2, 0.2), vy: rnd(0.3, 0.6), life: 420, color: C.K});
}
/* enemies and their shots only advance every third frame while a just dodge's slow motion runs */
function stepWorld() {
  updatePlayer();
  if (scene !== 'fight') return;
  const tick = worldTick();
  if (tick) { updateBoss(); updateArrows(); updateSpikes(); updateMarkers(); updateBeams(); updateBlasts(); updateCuts(); }
  updateBlades(); updateWaves(); updatePeaks(); updatePShots();
  updateParticles(); updateTexts(); updateAfterimages(); decayFx();
  if (justGhost && ++justGhost.t > 30) justGhost = null;
  ambient();
}
function startDialogue(lines, onEnd) { dlg = {lines, i: 0, n: 0, onEnd}; setScene('dialogue'); }
function updDialogue() {
  const L = dlg.lines[dlg.i];
  if (dlg.n < L.text.length) {
    const prev = dlg.n | 0;
    dlg.n = Math.min(L.text.length, dlg.n + 1.2);
    if ((dlg.n | 0) !== prev && prev % 2 === 0 && L.text[prev] !== ' ') SND.sfx.text();
    if (confirmP()) dlg.n = L.text.length;
  } else if (confirmP()) {
    dlg.i++; dlg.n = 0;
    if (dlg.i >= dlg.lines.length) { const cb = dlg.onEnd; dlg = null; cb(); return; }
  }
  updatePlayer(); stepLite();
}
/* campaign entry: map -> loading -> region card -> entrance -> mini stage (3 waves) -> the boss arrives ->
   dialogue -> boss card -> fight */
function startStage(s) { stage = s; resetGame(); mode = 'fight'; bgMix = 0; boss.hidden = true; SND.musicStop(); goScene('loading'); }
function beginFight() {
  setScene('fight'); battleScene = 'fight'; fightT = 0; bossIdle(90);
  SND.musicStart(stageMusic(false));
}
function updEntrance() {
  const t = sceneT, p = player;
  if (t === 1) { p.state = 'ride'; p.x = -30; p.y = 30; p.face = 1; }
  if (t <= 60) {
    const u = t / 60;
    p.x = lerp(-30, 110, easeOut(u)); p.y = lerp(30, FLOOR, u * u);
    if (t % 2 === 0) addP({kind: 'line', x: p.x - 20, y: p.y + rnd(-10, 6), vx: -6, vy: -1.5, life: 8, color: C.K, size: 1, len: 2});
  }
  if (t === 60) { p.state = 'normal'; p.x = 110; p.y = FLOOR; p.vx = 0; p.vy = 0; shake(6); dust(p.x, p.y, 16); SND.sfx.land(); flash = {a: 0.3, color: C.W}; }
  if (t > 60) updatePlayer();
  stepLite();
  // the hidden fight has no minions: he comes straight down
  if (t >= 90 || (t > 62 && confirmP())) { if (stage.noMini) startArrival(); else startMini(); }
}
/* ---------- mini stage: three waves of chain-bound minions in the boss's region ---------- */
function startMini() {
  setScene('mini'); battleScene = 'mini'; fightT = 0; mobs = [];
  // the first time through chapter 1 the tutorial holds the first wave back until the basics are done
  if (tutActive()) startTutorial(); else startWave(0);
  SND.musicStart(stageMusic(false));
}
function updMini() {
  if (pressed.pause) paused = !paused;
  if (paused) { if (pressed.dash) { paused = false; SND.sfx.select(); goMap(); } return; }
  fightT++; stats.time++;
  if (hitstop > 0) { hitstop--; shakeAmt *= 0.9; holdInput = true; return; }
  updatePlayer();
  if (scene !== 'mini') return;
  const tick = worldTick();
  if (tick) { updateMobs(); updateArrows(); }
  updateBlades(); updateWaves(); updatePeaks(); updatePShots(); updateItems();
  updateParticles(); updateTexts(); updateAfterimages(); decayFx();
  if (justGhost && ++justGhost.t > 30) justGhost = null;
  ambient();
  if (tut) updTutorial();
  if (!wave) return;
  if (!wave.done && wave.queue.length === 0 && mobs.every(m => m.hp <= 0)) {
    if (wave.clearT < 0) wave.clearT = 0;
    if (++wave.clearT === 50) {
      if (wave.i + 1 < wave.n) startWave(wave.i + 1);
      else { wave.done = true; bigText = {s: '소탕 완료', t: 0, dur: 80, color: C.Y}; SND.sfx.jingle(); }
    }
  }
  if (wave.done && ++wave.doneT > 120) startArrival();
}
/* the boss makes its entrance once the minions are gone */
function startArrival() {
  if (tut) finishTutorial(true);
  battleScene = 'fight'; mobs = []; arrows.length = 0; setScene('arrival'); SND.musicStop();
  const b = boss; b.hidden = false; b.state = 'script'; b.x = 372; b.face = -1; b.alpha = 1; b.vx = 0;
  if (stage.key === 'sword') { b.y = FLOOR; b.alpha = 0; } else { b.y = -60; b.vy = 2; b.onGround = false; }
}
function updArrival() {
  const t = sceneT, b = boss, key = stage.key;
  if (key === 'sword') {
    if (t === 20) { b.alpha = 1; wisp(b.x, b.y); SND.sfx.iai(); inkFlash = 3; slashMark(b.x, b.y - 22, 0.4, 34); }
  } else if (t < 60 && !b.onGround) {
    const col = {bow: C.G2, gun: C.Y, chain: C.R, origin: C.P}[key] || C.K;
    if (t % 2 === 0) addP({kind: key === 'bow' ? 'leaf' : 'px', x: b.x + rnd(-10, 10), y: b.y - rnd(0, 40), vx: rnd(-1, 1), vy: -rnd(0, 1), life: 20, color: col, size: 2});
    if ((key === 'chain' || key === 'origin') && t % 3 === 0) addP({kind: 'line', x: b.x + rnd(-12, 12), y: 0, vx: 0, vy: 9, life: 10, color: col, size: 1, len: 3});
  }
  if (b.onGround && !b.landedIn && key !== 'sword') { b.landedIn = true; shake(7); dust(b.x, b.y, 18); SND.sfx.land(); SND.sfx.impact(); flash = {a: 0.3, color: C.W}; }
  if (t === 70) { floatText('!', b.x, b.y - 58, C.R, 3, 50, C.W); SND.sfx.warn(); }
  // the original and his copy: both of them start at the same face
  if (key === 'origin' && t === 76) { floatText('!', player.x, player.y - 58, C.R, 3, 50, C.W); SND.sfx.warn(); }
  updatePlayer(); stepLite();
  if (t >= 110 || (t > 70 && confirmP())) startDialogue(LINES[key].intro, () => goScene('bosscard'));
}
function updFight() {
  if (pressed.pause) paused = !paused;
  if (paused) { if (pressed.dash) { paused = false; SND.sfx.select(); goMap(); } return; }
  fightT++; stats.time++;
  if (hitstop > 0) { hitstop--; shakeAmt *= 0.9; holdInput = true; return; }
  stepWorld();
  if (scene !== 'fight') return;
  if (boss.hp <= 0) startVictory();
  else if (boss.kind === 'origin') {
    // three phases: the hero's own kit, the Blade God's arts too (60%) with his 일검무귀 at 35%, and the last
    // struggle (15%) after the chains are cut
    if (boss.phase === 1 && boss.hp <= boss.maxHp * ORIGIN.p2) startPhase2();
    else if (boss.phase === 2 && !boss.p3 && boss.hp <= boss.maxHp * ORIGIN.p3) startOrigin3();
    else if (boss.phase === 2 && !boss.p3 && !boss.ultDone && boss.hp <= boss.maxHp * ORIGIN.ultAt && boss.state === 'idle' && boss.onGround) startBossUlt();
  }
  else if (boss.phase === 1 && boss.hp <= boss.maxHp * 0.5) startPhase2();
  else if (boss.phase === 2 && !boss.ultDone && boss.hp <= boss.maxHp * 0.25 && boss.state === 'idle' && boss.onGround) startBossUlt();
}
function startBossUlt() {
  boss.ultDone = true; boss.vx = 0; boss.drawing = true;
  SND.chargeStop(); if (player.state === 'charge') player.state = 'normal';
  setScene('bossbanner'); queueClear = true; SND.sfx.special();
}
function updBossBanner() {
  updateParticles(); updateTexts();
  if (sceneT >= 84) { setScene('fight'); bossAttack('ult'); flash = {a: 0.8, color: STAGE_FX[stage.key].flash}; shake(6); player.inv = Math.max(player.inv, 30); }
}
function startPhase2() {
  setScene('phase2'); queueClear = true;
  boss.state = 'script'; boss.vx = 0; calmBoss(boss); boss.queue = null;
  SND.chargeStop(); if (player.state === 'charge') player.state = 'normal';
  shake(8); flash = {a: 0.8, color: C.W}; SND.sfx.boom(); SND.musicStop();
}
function updPhase2() {
  updatePlayer(); stepLite();
  if (sceneT >= 40) startDialogue(LINES[stage.key].p2, () => { setScene('phase2b'); boss.summon = true; SND.sfx.rumble(); });
}
function updPhase2b() {
  const t = sceneT, key = stage.key, fx = STAGE_FX[key];
  bgMix = Math.min(1, t / 100);
  shakeAmt = Math.max(shakeAmt, reduceMotion ? 0.6 : 2);
  if (key === 'gun') {
    if (t % 3 === 0) addP({x: rnd(W), y: FLOOR, vx: rnd(-1, 1), vy: -rnd(1, 3), g: 0.05, life: 60, color: Math.random() < 0.5 ? C.Y : C.R, size: 2});
  } else if (key === 'sword') {
    if (t % 2 === 0) addP({kind: 'leaf', x: rnd(W), y: FLOOR - rnd(0, 20), vx: rnd(-1, 1), vy: -rnd(1, 3), drag: 0.97, life: 70, color: Math.random() < 0.6 ? C.W : C.B, size: 2});
  } else if (key === 'chain') {
    if (t % 2 === 0) addP({kind: 'shard', x: rnd(W), y: rnd(0, FLOOR), vx: rnd(-2, 2), vy: -rnd(0.5, 2), drag: 0.97, life: 40, size: rnd(2, 4), ang: rnd(TAU), spin: 0.2});
  } else if (key === 'origin') {
    // the chains wind round the void: links rattle loose as they tighten
    if (t % 2 === 0) addP({kind: 'line', x: rnd(W), y: rnd(0, FLOOR), vx: rnd(-3, 3), vy: rnd(-3, 3), life: 12, color: Math.random() < 0.6 ? C.P : C.W, size: 1, len: 2});
    if (t % 25 === 0) SND.sfx.chain();
  } else {
    if (t % 3 === 0) addP({kind: 'leaf', x: rnd(W), y: -4, vx: rnd(-1, 1), vy: rnd(1, 2), life: 140, color: Math.random() < 0.5 ? C.G2 : C.G1, size: 2});
    if (t % 4 === 0) addP({x: rnd(W), y: FLOOR, vx: rnd(-1, 1), vy: -rnd(1, 3), g: 0.12, life: 24, color: C.G1, size: 2});
  }
  for (const pl of platforms) pl.grow = clamp((t - 70) / 25, 0, 1);
  updatePlayer(); stepLite();
  if (t >= 100) {
    for (const pl of platforms) { pl.grow = 1; pl.on = true; }
    bgMix = 1; boss.phase = 2; boss.summon = false; bossIdle(70);
    setScene('fight'); SND.musicStart(stageMusic(true));
    bigText = Object.assign({t: 0, dur: 100}, fx.p2);
    flash = {a: 0.6, color: fx.flash};
  }
}
/* U: 천지 가르기 - full-screen cuts that hit every enemy, then one last cut that splits the screen in half */
const SP = {cutStart: 74, cutEnd: 152, windUp: 160, finalAt: 178, splitEnd: 228, end: 246};
// the flame of his swings on the blood-red stage: white, red-hot at the head
const STORM_FLAME = {rim: C.K, body: C.W, core: C.R, s1: C.W, s2: C.K};
function specialTargets() { return mode === 'practice' ? dummies : battleScene === 'mini' ? mobs.filter(m => m.hp > 0) : (boss.hp > 0 ? [boss] : []); }
function startSpecial() {
  const p = player;
  p.sp = 0; stats.specials++; p.inv = 999; storm = []; storm.final = null;
  p.specX = p.x; p.specY = p.y; p.specFace = p.face;
  // in an adrenaline rush it becomes 일검무귀 · 혈 (blood): see updIlgeom
  storm.ig = useGodUlt() ? {qi: [], chips: null, kv: 0, face: p.face, blood: p.adren > 0} : null;
  setScene('special'); queueClear = true; SND.sfx.special();
}
function updSpecial() {
  if (storm.ig) { updIlgeom(); return; }
  const t = sceneT, p = player, every = p.adren > 0 ? 3 : 4;
  // the hero stands his ground right where he called it and swings, back and forth, faster than the eye; the cuts
  // open all over the screen while he stays put (he used to blink to each cut - too restless)
  if (t === 70) { flash = {a: 0.9, color: C.W}; SND.sfx.boom(); p.state = 'storm'; p.x = p.specX; p.y = p.specY; p.face = p.specFace; p.stormSa = 3.7; p.arcs = []; p.swing = {from: 3.7, to: 3.7, t0: t}; }
  if (t >= SP.cutStart && t < SP.cutEnd && (t - SP.cutStart) % every === 0) {
    const ang = rnd(-1.3, 1.3), cx = rnd(70, W - 70), cy = rnd(70, 200), k = storm.length;
    storm.push({ang, cx, cy, t0: t});
    // forward and back by turns, a little different every time; each swing throws a white flame round him
    p.swing = {from: p.stormSa, to: k % 2 ? rnd(3.3, 4.0) : rnd(0.1, 0.7), t0: t};
    const n = p.arcs.length; spawnComboArc(p, {arc: ['fwd', 'back', 'rise', 'spin'][k % 4]}, k % 2);
    for (let i = n; i < p.arcs.length; i++) p.arcs[i].pal = STORM_FLAME;
    for (const tg of specialTargets()) dealDamage(26000, tg.x + rnd(-10, 10), tg.y - 22 + rnd(-14, 14), {stop: 0, sp: 0, quiet: true}, tg);
    shake(3); SND.sfx.slash();
  }
  if (p.swing && t < SP.windUp) p.stormSa = lerp(p.swing.from, p.swing.to, Math.min(1, (t - p.swing.t0) / 2));
  for (const a of p.arcs) a.t++;
  if (p.arcs.length) p.arcs = p.arcs.filter(a => a.t < a.life);
  if (t === SP.windUp) { p.x = p.specX; p.y = p.specY; p.face = p.specFace; p.stormSa = Math.PI + 0.4; p.swing = null; SND.chargeStart(); }
  if (t > SP.windUp && t < SP.finalAt) SND.chargeSet((t - SP.windUp) / (SP.finalAt - SP.windUp));
  if (t === SP.finalAt) {
    SND.chargeStop();
    p.stormSa = 0.7; flash = {a: 1, color: C.W}; shake(12); SND.sfx.boom(); SND.sfx.special();
    storm.final = {ang: rnd(-0.2, 0.2), t0: t};
    for (const tg of specialTargets()) dealDamage(220000 * (hasSoul('chain') ? 2 : 1), tg.x, tg.y - 30, {stop: 0, sp: 0, crit: 1, big: true}, tg);
  }
  hitstop = 0;
  if (mode === 'practice') updateDummies();
  updateParticles(); updateTexts(); decayFx();
  if (t >= SP.end) {
    p.x = p.specX; p.y = p.specY; p.face = p.specFace; p.vx = 0; p.vy = 0;
    p.state = 'normal'; p.inv = 50;
    if (mode === 'practice') setScene('practice');
    else if (battleScene === 'mini') setScene('mini');
    else { setScene('fight'); stunBoss(hasSoul('chain') ? 200 : 110, true); }
  }
}
/* U for a Blade God: 일검무귀 (one sword, no return). every drop of SP and a fifth of the hero's own blood; the world's
   sound goes dull; every spark, light and sword-wave around the hero is drawn into the greatsword, which darkens to
   blood red; half a second of dead silence; one level cut - and nothing happens. 0.7 seconds later the enemy,
   shards of the world behind it, the dust and the afterimages are all hurled the same way at once.
   일검무귀 · 혈, in an adrenaline rush: it takes half the rush that is left instead of blood; under the muffle only the
   hero's heartbeat is heard, growing louder, and in the silence it beats twice and stops; the world turns blood red
   with the hero a white figure and the blade white-hot; the one cut runs edge to edge; at the blast the picture
   itself slips apart along the cut, and the enemy is driven all the way into the edge of the screen for a second hit */
/* after the cut, while nothing happens: the camera pulls back, the hero flicks the blood off (flick), turns his back
   with the blade on his shoulder (turn), the guard clicks (click) - and behind him the cut detonates end to end */
const IG = {start: 56, absorb: 62, dark: 132, still: 136, cut: 166, flick: 178, turn: 185, click: 200, blast: 208, end: 282, dmg: 660000, wall: 0.3,
  main: 0.4, each: 0.025, fin: 0.15, finAt: 41};
// after the blast the cut keeps landing on the enemy - 파, 파, 파, 파파파파 - faster and faster, then one heavy 박 at finAt
// (frames after the blast; the blast takes main, the 18 hits each, the last one fin: the whole of IG.dmg between them)
const IG_RUSH = (() => { const r = []; let o = 3; for (let i = 0; i < 18; i++) { r.push(o); o += i < 5 ? 3 : i < 11 ? 2 : 1; } return r; })();
function igRushHit(tg, fin, B, mul, f) {
  const big = tg === boss, cy = tg.y - (big ? 30 : 18);
  if (fin) {
    bigCut(tg.x, cy, 0.8, 54, C.R, C.W); bigCut(tg.x, cy, -0.8, 54, C.R, C.W); bigCut(tg.x, cy, 0, 64, B ? C.W : C.R, B ? C.R : C.W);
    dealDamage(IG.dmg * IG.fin * mul, clamp(tg.x - f * 20, 70, W - 70), cy - (big ? 74 : 40), {stop: 0, sp: 0, crit: 1, big: true}, tg);
    flash = {a: 0.5, color: C.W}; shake(12); zoomPunch = 1; SND.sfx.boom(); SND.sfx.explode();
    addP({kind: 'ring', x: tg.x, y: cy, r0: 6, rMax: 64, life: 16, color: B ? C.W : C.R, size: 3});
    for (let i = 0; i < 22; i++) { const a = rnd(TAU), s = rnd(3, 10); addP({kind: 'line', x: tg.x, y: cy, vx: Math.cos(a) * s, vy: Math.sin(a) * s, drag: 0.88, life: ri(8, 15), color: i % 3 ? C.R : C.W, size: 1.5, len: 2}); }
    if (tg === boss) boss.hurtT = 30;
    return;
  }
  // (kept on screen even when the enemy has been hurled against the edge)
  const sp = big ? 1 : 0.6, hx = clamp(tg.x + rnd(-15, 15) * sp, 22, W - 22), hy = cy + rnd(-20, 16) * sp;
  bigCut(hx, hy, rnd(TAU), rnd(28, 42) * (big ? 1 : 0.7), C.R, C.W);
  addP({kind: 'muzzle', x: hx, y: hy, ang: rnd(TAU), size: rnd(1.1, 1.6), life: 5});
  addP({kind: 'ring', x: hx, y: hy, r0: 3, rMax: 20, life: 7, color: B ? C.W : C.R, size: 2});
  for (let i = 0; i < 4; i++) addP({kind: 'line', x: hx, y: hy, vx: f * rnd(3, 8), vy: rnd(-3, 3), drag: 0.85, life: ri(6, 10), color: i % 2 ? C.W : C.R, size: 1, len: 2});
  // every one a critical, but counted as small numbers (x2.5 by hand) so the burst reads as a stream, not a pile
  // (they pop over its head, leaving the cuts on the body in view)
  dealDamage(IG.dmg * IG.each * 2.5 * mul, hx, cy - (big ? 42 : 26), {stop: 0, sp: 0, crit: 0, quiet: true}, tg);
}
// the camera: pushes in on the hero while the blade drinks, holds through the silence, snaps back out after the cut
function igZoom(t) {
  if (t < IG.absorb || t >= IG.cut + 10) return 1;
  if (t < IG.dark) { const u = (t - IG.absorb) / (IG.dark - IG.absorb); return 1 + 0.6 * u * u * (3 - 2 * u); }
  if (t < IG.cut + 2) return 1.6;
  return 1 + 0.6 * (1 - easeOut((t - IG.cut - 2) / 8));
}
const hex2 = v => Math.round(clamp(v, 0, 255)).toString(16).padStart(2, '0');
// the point in the middle of the blade everything is drawn into
function igSwordMid(p) {
  const q = playerPose(p), g = swordGeom(p.x, p.y, p.face, q, (p.igSword && p.igSword.len) || SWORD_LEN);
  return [g.h[0] + g.d[0] * g.L * 0.6, g.h[1] + g.d[1] * g.L * 0.6];
}
// the stage picture the torn-off shards are cut from (null: the void, which breaks into plain black shards)
function igBgSource() {
  if (mode === 'practice') return bgP;
  if (stage.key === 'origin') return boss.p3 ? bgOriginEarth : null;
  const pair = STAGE_BG[stage.key](); return bgMix > 0.5 ? pair[1] : pair[0];
}
function updIlgeom() {
  const t = sceneT, p = player, ig = storm.ig, mul = hasSoul('chain') ? 2 : 1, tgs = specialTargets(), B = ig.blood;
  if (t === IG.start) {
    const tg = tgs[0]; ig.face = tg ? (tg.x >= p.x ? 1 : -1) : p.face;
    p.face = ig.face; p.state = 'ilgeom'; p.igPh = 'flat'; p.igYaw = -2.15; p.vx = 0; p.vy = 0; if (!p.onGround) p.y = FLOOR;
    ig.fx = p.x; ig.fy = p.y - 30;
    if (B) {
      // 혈: the price is half the rush that is left, not blood
      p.adren = Math.floor(p.adren / 2);
      floatText('아드레날린 -50%', p.x, p.y - 46, C.W, 2, 60, C.R);
      for (let i = 0; i < 16; i++) { const a = i / 16 * TAU; addP({x: p.x, y: p.y - 18, vx: Math.cos(a) * 2.5, vy: Math.sin(a) * 2.5, life: 18, color: C.R, size: 2}); }
      SND.sfx.heartD(0.35);
    } else {
      // the price: a fifth of his own blood
      const cost = Math.round(p.maxHp * 0.2); p.hp = Math.max(1, p.hp - cost);
      floatText('HP -' + cost, p.x, p.y - 46, C.R, 2, 60, C.K);
      for (let i = 0; i < 14; i++) addP({x: p.x, y: p.y - 18, vx: rnd(-2, 2), vy: rnd(-3, 0), g: 0.15, life: ri(16, 28), color: C.R, size: 2, bounce: true});
      SND.sfx.heart();
    }
    SND.muffle(1, 0.25);
  }
  // 혈: under the muffle, the heartbeat alone, louder each time; in the silence two more beats, then nothing
  if (B && t > IG.absorb && t < IG.dark && (t - IG.absorb) % 30 === 0) SND.sfx.heartD(0.35 + 0.65 * (t - IG.absorb) / (IG.dark - IG.absorb));
  if (B && (t === IG.still + 2 || t === IG.still + 17)) SND.sfx.heartD(1);
  if (t >= IG.start) {
    // the blade takes it all in: longer, and darker red with every breath of it (혈: red, then white-hot)
    const k = t < IG.blast + 40 ? clamp((t - IG.absorb) / (IG.dark - IG.absorb), 0, 1) : clamp(1 - (t - IG.blast - 40) / 30, 0, 1);
    // ...and grows to twice its length, broader too
    const len = SWORD_LEN * (1 + k), w = 1 + 0.5 * k;
    p.igSword = B ? {len, w, color: k > 0.6 ? C.W : k > 0.2 ? C.R : C.K, edge: k > 0.6 ? C.R : C.W}
      : {len, w, color: '#' + hex2(110 * k) + '00' + hex2(12 * k), edge: k > 0.3 ? C.R : C.W};
  }
  const sm = t >= IG.start ? igSwordMid(p) : [p.x, p.y - 20];
  // 혈: heat rising off the blade like flame, from the moment it starts to drink until the cut
  if (B && t >= IG.absorb && t < IG.cut) {
    const q = playerPose(p), g = swordGeom(p.x, p.y, p.face, q, p.igSword.len);
    for (let i = 0; i < 2; i++) { const u = rnd(0.2, 1); addP({x: g.h[0] + g.d[0] * g.L * u + rnd(-2, 2), y: g.h[1] + g.d[1] * g.L * u, vx: rnd(-0.3, 0.3), vy: -rnd(0.6, 1.6), life: ri(10, 20), color: Math.random() < 0.6 ? C.W : C.Y, size: Math.random() < 0.3 ? 2 : 1, ig: true}); }
  }
  if (t === IG.absorb) { SND.chargeStart(); SND.sfx.cyclone(); }
  if (t >= IG.absorb && t < IG.dark) {
    const k = (t - IG.absorb) / (IG.dark - IG.absorb);
    SND.chargeSet(k * 0.6);
    // streaks of light, dark red and white, pouring in from all round (on the blood-red world, black and white)
    for (let i = 0; i < 3; i++) {
      const a = rnd(TAU), r = rnd(70, 230), x = sm[0] + Math.cos(a) * r, y = sm[1] + Math.sin(a) * r * 0.7, n = ri(14, 24);
      addP({kind: 'line', x, y, vx: (sm[0] - x) / n, vy: (sm[1] - y) / n, life: n, color: (B ? [C.W, C.K, C.W, C.K] : [C.R, C.W, C.R, '#6e000c'])[i + (t & 1)], size: 1, len: 2.5, ig: true});
    }
    // whatever was already flying about is swallowed too
    for (const q of particles) if (!q.ig) { q.x += (sm[0] - q.x) * 0.12; q.y += (sm[1] - q.y) * 0.12; q.vx *= 0.8; q.vy *= 0.8; if (Math.hypot(sm[0] - q.x, sm[1] - q.y) < 6) q.life = Math.min(q.life, 1); }
    // sword-waves wheeling in from the dark (the last ones are swallowed before it turns red)
    if ((t - IG.absorb) % 7 === 0 && t < IG.dark - 24) ig.qi.push({a: rnd(TAU), r: rnd(150, 210), spin: Math.random() < 0.5 ? 1 : -1});
    // the halo and the blades at his back come apart into it
    if ((save.cls | 0) >= 1 && t % 3 === 0) { const x = p.x - p.face * rnd(0, 10), y = p.y - rnd(36, 50), n = 12; addP({x, y, vx: (sm[0] - x) / n, vy: (sm[1] - y) / n, life: n, color: (save.cls | 0) >= 3 ? C.Y : C.R, size: 2, ig: true}); }
  }
  for (const q of ig.qi) { q.r *= 0.91; q.a += 0.09 * q.spin; if (q.r < 10) { q.done = true; addP({kind: 'ring', x: sm[0], y: sm[1], r0: 2, rMax: 12, life: 4, color: C.R, size: 2, ig: true}); } }
  ig.qi = ig.qi.filter(q => !q.done);
  if (t === IG.dark) {
    // it is blood red now; the hero's own lights are gone into it
    SND.chargeStop(); if (!B) SND.sfx.heart(); p.igHide = true; flash = {a: 0.3, color: B ? C.W : C.R};
  }
  if (t === IG.still) SND.muffle(2, 0.04);
  if (t === IG.cut) {
    // one level cut
    addAfter(p, C.R); SND.sfx.edge();
    ig.cutY = p.y - 22; ig.cutT = t; ig.cutX = p.x; p.x = clamp(p.x + ig.face * 10, 12, W - 12);
  }
  if (t >= IG.cut) p.igYaw = lerp(-2.15, 1.95, clamp((t - IG.cut + 1) / 3, 0, 1));
  if (t === IG.flick) {
    // a flick of the blade: the blood flies off it
    p.igPh = 'flick';
    const q = playerPose(p), g = swordGeom(p.x, p.y, p.face, q, p.igSword.len);
    for (let i = 0; i < 14; i++) { const u = rnd(0.3, 1); addP({x: g.h[0] + g.d[0] * g.L * u, y: g.h[1] + g.d[1] * g.L * u, vx: ig.face * rnd(1.5, 4.5), vy: rnd(0.5, 2.5), g: 0.2, life: ri(18, 30), color: B ? C.W : C.R, size: 2, bounce: true}); }
  }
  // back turned on it, the blade on his shoulder; then the guard clicks, cutting through the silence
  if (t === IG.turn) { p.igPh = 'back'; p.face = -ig.face; }
  if (t === IG.click) { SND.sfx.clickD(); const q = playerPose(p), g = swordGeom(p.x, p.y, p.face, q, p.igSword.len); glint(g.h[0] + g.d[0] * 4, g.h[1] + g.d[1] * 4, 7); }
  if (t === IG.blast) {
    // ...and now it lands, all of it, all one way
    const f = ig.face;
    SND.muffle(0, 0.02); SND.sfx.boom(); SND.sfx.explode(); SND.sfx.impact(); SND.sfx.slash();
    flash = {a: 0.8, color: C.W}; shake(16); zoomPunch = 1; inkFlash = 2;
    // 혈 drives the enemy all the way to the edge of the screen (it arrives still moving, and hits it)
    const tg0 = tgs.find(q => q === boss || q.mob), dist = tg0 ? (f > 0 ? W - 14 - tg0.x : tg0.x - 14) : 0;
    ig.decay = B ? 0.9 : 0.87; ig.kv = f * (B ? Math.max(20, (dist + 40) * 0.1) : 15);
    // shards of the world torn out along the cut (혈: along all of it)
    ig.src = igBgSource(); ig.chips = [];
    const xs = B ? [0, W] : f > 0 ? [ig.cutX + 20, W] : [0, ig.cutX - 20];
    for (let x = xs[0]; x < xs[1]; x += 15) for (let k = 0; k < 4; k++) {
      const w = ri(10, 22), h = ri(9, 18), sx = Math.round(x + rnd(-4, 4)), sy = Math.round(ig.cutY - 46 + k * 20 + rnd(-6, 6));
      ig.chips.push({sx, sy, w, h, x: sx + w / 2, y: sy + h / 2, vx: f * rnd(7, 19), vy: rnd(-3.5, 1.5), r: 0, vr: rnd(-0.35, 0.35)});
    }
    // dust thrown the same way, long streaks of wind, and everything already in the air
    for (let i = 0; i < 36; i++) addP({kind: 'smoke', x: rnd(0, W), y: ig.cutY + rnd(-40, 60), vx: f * rnd(4, 13), vy: rnd(-1, 0.5), drag: 0.93, life: ri(24, 44), size: rnd(4, 9)});
    for (let i = 0; i < 40; i++) addP({kind: 'line', x: rnd(0, W), y: ig.cutY + rnd(-90, 60), vx: f * rnd(14, 26), vy: 0, drag: 0.9, life: ri(8, 16), color: i % 3 ? C.W : C.R, size: 1, len: 3});
    for (const q of particles) q.vx += f * rnd(6, 12);
    // the cut detonates along its whole length, racing out from the hero (both ways for 혈)
    ig.chain = B ? [-1, 1] : [f];
    for (const tg of tgs) {
      dealDamage(IG.dmg * IG.main * mul, tg.x, tg.y - 30, {stop: 0, sp: 0, crit: 1, big: true}, tg);
      for (let i = 0; i < 18; i++) addP({x: tg.x, y: tg.y - 22, vx: f * rnd(3, 11), vy: rnd(-3, 2), g: 0.12, life: ri(18, 34), color: i % 3 ? C.R : C.K, size: 2, bounce: true});
    }
    if (tgs.includes(boss)) boss.hurtT = 40;
  }
  if (t > IG.blast) {
    // the enemy is hurled along the cut, leaving a trail of afterimages
    for (const tg of tgs) {
      if (tg === boss || tg.mob) {
        const nx = tg.x + ig.kv; tg.x = clamp(nx, 14, W - 14);
        if (tg === boss && Math.abs(ig.kv) > 1.5 && t % 2 === 0) addBossAfter(boss);
        // 혈: slammed into the edge of the screen - a second hit, the "wall" cracks
        if (B && !ig.wall && nx !== tg.x && Math.abs(ig.kv) > 1) {
          ig.wall = {x: tg.x + ig.face * 12, y: tg.y - 24, t};
          dealDamage(IG.dmg * IG.wall * mul, tg.x - ig.face * 60, tg.y - 50, {stop: 0, sp: 0, crit: 1, big: true}, tg);
          shake(12); flash = {a: 0.4, color: C.R}; SND.sfx.impact(); SND.sfx.brk(); SND.sfx.boom();
          for (let i = 0; i < 16; i++) addP({x: ig.wall.x, y: ig.wall.y + rnd(-20, 20), vx: -ig.face * rnd(1, 5), vy: rnd(-3, 2), g: 0.15, life: ri(16, 30), color: i % 2 ? C.K : C.W, size: 2, bounce: true});
          addP({kind: 'ring', x: ig.wall.x, y: ig.wall.y, r0: 4, rMax: 50, life: 14, color: C.R, size: 3});
        }
      }
      else if (t === IG.blast + 1) tg.rotV += ig.face * 0.5;
    }
    if (ig.wall) ig.kv = 0; else ig.kv *= ig.decay;
    const ci = t - IG.blast - 1;
    if (ig.chain && ci < 12) for (const d of ig.chain) {
      const x0 = ig.cutX + d * 16, x1 = d > 0 ? W + 10 : -10, x = lerp(x0, x1, ci / 11), y = ig.cutY + rnd(-5, 5);
      blasts.push({x, y, r: rnd(20, 32), dmg: 0, friendly: false, t: 0, hit: true});
      addP({kind: 'ring', x, y, r0: 4, rMax: 34, life: 12, color: B ? C.W : C.R, size: 2});
      for (let k = 0; k < 3; k++) addP({x, y, vx: d * rnd(1, 5) + rnd(-1, 1), vy: rnd(-4, 1), g: 0.18, life: ri(14, 26), color: k % 2 ? C.Y : C.R, size: 2, bounce: true});
      if (ci % 3 === 0) { SND.sfx.explode(); shake(8); }
    }
    for (const bl of blasts) bl.t++;
    for (let i = blasts.length - 1; i >= 0; i--) if (blasts[i].t > 22) blasts.splice(i, 1);
    for (const c of ig.chips) { c.x += c.vx; c.y += c.vy; c.vy += 0.15; c.vx *= 0.985; c.r += c.vr; }
    if (t < IG.blast + 20 && t % 2 === 0) addP({kind: 'smoke', x: ig.face > 0 ? rnd(0, 80) : W - rnd(0, 80), y: ig.cutY + rnd(-20, 40), vx: ig.face * rnd(6, 12), vy: rnd(-0.5, 0.3), drag: 0.94, life: ri(20, 34), size: rnd(3, 7)});
    // ...and the cut keeps landing on it
    const rb = t - IG.blast;
    if (IG_RUSH.includes(rb)) for (const tg of tgs) igRushHit(tg, false, B, mul, ig.face);
    if (rb === IG.finAt) for (const tg of tgs) igRushHit(tg, true, B, mul, ig.face);
  }
  hitstop = 0;
  if (mode === 'practice') updateDummies();
  // through the silence and the cut itself, nothing moves at all
  if (!(t >= IG.still && t < IG.cut + 3)) { updateParticles(); updateTexts(); updateAfterimages(); }
  decayFx();
  if (t >= IG.end) {
    SND.muffle(0); SND.chargeStop(); blasts.length = 0;
    p.state = 'normal'; p.inv = 50; p.vx = 0; p.vy = 0; p.face = ig.face; p.igSword = null; p.igHide = false; p.igPh = null;
    if (mode === 'practice') setScene('practice');
    else if (battleScene === 'mini') setScene('mini');
    else { setScene('fight'); stunBoss((hasSoul('chain') ? 200 : 110) + (B ? 90 : 0), true); }
  }
}
function startPassive() { setScene('passive'); queueClear = true; SND.muffle(0); SND.sfx.death(); flash = {a: 0.6, color: C.R}; player.state = 'hurt'; }
function updPassive() {
  updateParticles(); updateTexts(); decayFx();
  if ((sceneT > 80 && confirmP()) || sceneT > 480) { setScene(battleScene); triggerAdrenaline(true); player.inv = 120; }
}
function startDeath() {
  setScene('continue'); queueClear = true; SND.muffle(0);
  const p = player; p.state = 'dead'; p.vy = -3; p.vx = -p.face * 1.5; p.adren = 0;
  boss.state = 'script'; calmBoss(boss); boss.queue = null;
  SND.musicStop(); SND.sfx.death();
}
function updContinue() {
  const t = sceneT;
  updatePlayer(); stepLite();
  if (t < 70) return;
  const k = t - 70, n = 9 - Math.floor(k / 60);
  if (k % 60 === 0 && n >= 0) SND.sfx.tick();
  if (n < 0) { setScene('gameover'); return; }
  if (confirmP()) {
    const p = player;
    stats.continues++;
    p.hp = p.maxHp; p.adrenUsed = false; p.state = 'normal'; p.inv = 150; p.sp = Math.max(p.sp, 50); p.vx = 0;
    if (battleScene === 'mini') setScene('mini'); else { bossIdle(90); setScene('fight'); }
    SND.musicStart(stageMusic(boss.phase === 2));
    flash = {a: 0.6, color: C.W}; bigText = {s: '다시 한 번!', t: 0, dur: 60, color: C.R};
  }
}
const RANKS = ['S+', 'S', 'A+', 'A', 'B+', 'B', 'C+', 'C'];
/* victory: rate the run, pay out gold and EXP, level up, grant the boss's soul on a first clear, and save */
function startVictory() {
  setScene('victory'); queueClear = true;
  const b = boss; b.state = 'dead'; b.st = 0; b.vx = 0; b.hp = 0; calmBoss(b); b.igPh = null;
  SND.chargeStop(); SND.muffle(0); if (player.state === 'charge') player.state = 'normal';
  flash = {a: 1, color: C.W}; shake(10); SND.musicStop(); SND.sfx.boom();
  const secs = stats.time / 60;
  const score = 100 - stats.dmgTaken * 0.25 - Math.max(0, secs - 150) * 0.25 + Math.min(30, stats.maxCombo * 0.4) + Math.min(10, stats.justs * 2) - stats.continues * 25 - (player.adrenUsed ? 8 : 0);
  const s = Math.max(0, Math.round(score));
  const rating = score >= 100 ? 'S+' : score >= 92 ? 'S' : score >= 84 ? 'A+' : score >= 76 ? 'A' : score >= 66 ? 'B+' : score >= 56 ? 'B' : score >= 45 ? 'C+' : 'C';
  const first = !save.clear[stage.id], mult = stage.reward * (first ? 1 : 0.6);
  const exp = Math.round((150000000 + s * 650000 + stats.maxCombo * 123457 + stats.kills * 1500000 + ri(0, 99999)) * mult);
  const gold = Math.round((2400 + stats.maxCombo * 35 + s * 18 + stats.kills * 45) * mult * goldMult());
  const lv0 = save.lv, hp0 = maxHpNow(), atk0 = atkPower();
  // a first clear pours in enough EXP to jump straight to the chapter's level; replays level up the slow way
  if (first) { save.lv = Math.max(save.lv, stage.lvTo); save.exp = 0; }
  else { save.exp += exp; while (save.lv < 999 && save.exp >= expNeed(save.lv)) { save.exp -= expNeed(save.lv); save.lv++; } }
  const hp1 = maxHpNow(), atk1 = atkPower();
  // the level jump can carry the hero up a class: Master at 300, Lord at 400, God at 500
  let promote = null;
  const nc = classForLv(save.lv);
  if (nc > (save.cls | 0)) { save.cls = nc; fixLoadout(true); promote = {cls: nc, hp0: hp1, hp1: maxHpNow(), atk0: atk1, atk1: atkPower()}; }
  save.gold += gold; save.clear[stage.id] = true;
  const best = save.best[stage.id] || {};
  const newRank = !best.rank || RANKS.indexOf(rating) < RANKS.indexOf(best.rank), newTime = !best.time || secs < best.time;
  save.best[stage.id] = {rank: newRank ? rating : best.rank, time: newTime ? secs : best.time};
  let soul = null;
  if (stage.soul && !hasSoul(stage.soul)) { save.souls.push(stage.soul); soul = stage.soul; }
  writeSave();
  const mmss = v => String(Math.floor(v / 60)).padStart(2, '0') + ':' + String(Math.floor(v % 60)).padStart(2, '0');
  results = {rating, time: mmss(secs), maxCombo: stats.maxCombo, dmg: stats.dmgTaken, cont: stats.continues, justs: stats.justs, kills: stats.kills, gold, exp, first, soul,
    lv0, lv1: save.lv, hp0, hp1, atk0, atk1, promote, newRank: newRank && !first, newTime: newTime && !first};
}
/* victory, part 1: the boss kneels, the chain on its mind shatters, and it speaks freely (the Sovereign just breaks) */
function updVictory() {
  const t = sceneT, b = boss;
  if (t < 40) { decayFx(); return; }
  updatePlayer();
  if (b.st < 70) b.st++;
  b.animT++; bossPhysics();
  updateParticles(); updateTexts(); updateAfterimages(); updateItems(); decayFx();
  if (t === 100) {
    b.freed = true; SND.sfx.brk(); SND.sfx.chain(); flash = {a: 0.5, color: C.W}; shake(5);
    for (let i = 0; i < 26; i++) { const a = rnd(TAU), s = rnd(1.5, 4.5); addP({kind: 'shard', x: b.x, y: b.y - 22, vx: Math.cos(a) * s, vy: Math.sin(a) * s - 1, drag: 0.95, life: ri(24, 44), size: rnd(2, 4.5), ang: a, spin: 0.25}); }
    for (let i = 0; i < 8; i++) { const a = i / 8 * TAU; addP({kind: 'line', x: b.x + Math.cos(a) * 10, y: b.y - 22 + Math.sin(a) * 10, vx: Math.cos(a) * 5, vy: Math.sin(a) * 5, life: 12, color: C.R, size: 2, len: 3}); }
    floatText(stage.hidden ? '패배' : stage.final ? '사슬 붕괴' : '세뇌 해제', b.x, b.y - 62, C.W, 2, 70, stage.hidden ? C.P : C.R);
  }
  // the original does not fade away with the others: after his last words comes the cut
  if (t === 150) startDialogue(LINES[stage.key].freed, () => { if (b.kind === 'origin') startExecute(); else setScene('victory2'); });
}
/* victory, part 2: freed allies fade away in their colours (their power stays with you); then the loot and results */
function updVictory2() {
  const t = sceneT, b = boss;
  updatePlayer(); b.animT++; bossPhysics();
  updateParticles(); updateTexts(); updateAfterimages(); updateItems(); decayFx();
  {
    b.alpha = Math.max(0, 1 - t / 70);
    if (t % 2 === 0 && b.alpha > 0) for (let i = 0; i < 2; i++) {
      if (b.kind === 'gun') addP({x: b.x + rnd(-10, 10), y: b.y - rnd(0, 36), vx: rnd(-1, 1), vy: -rnd(0.3, 1.2), life: 50, color: Math.random() < 0.5 ? C.Y : C.R, size: 2});
      else if (b.kind === 'sword') addP({kind: 'leaf', x: b.x + rnd(-10, 10), y: b.y - rnd(0, 36), vx: rnd(-1, 1), vy: -rnd(0.3, 1.2), life: 50, color: Math.random() < 0.6 ? C.W : C.B, size: 2});
      else if (b.kind === 'chain') addP({kind: 'shard', x: b.x + rnd(-10, 10), y: b.y - rnd(0, 40), vx: rnd(-1.5, 1.5), vy: -rnd(0.5, 1.8), drag: 0.96, life: 40, size: rnd(2, 4), ang: rnd(TAU), spin: 0.2});
      else if (b.kind === 'origin') addP({x: b.x + rnd(-14, 14), y: b.y - rnd(0, 20), vx: rnd(-0.8, 0.8), vy: -rnd(0.4, 1.4), life: 60, color: Math.random() < 0.6 ? C.P : C.K, size: 2});
      else addP({kind: 'leaf', x: b.x + rnd(-10, 10), y: b.y - rnd(0, 36), vx: rnd(-1, 1), vy: -rnd(0.3, 1.2), life: 50, color: Math.random() < 0.5 ? C.G2 : C.G1, size: 2});
    }
  }
  if (t === 20) for (const kind of ['coin','coin','coin','coin','coin','coin','coin','potion','arrow','sword']) items.push({x: b.x, y: b.y - 20, vx: rnd(-2.6, 2.6), vy: rnd(-5.5, -2.5), kind, t: 0});
  if (t === 40) SND.sfx.jingle();
  if (t >= 190) goScene('results');
}
const RES_N = 10, RES_ROW = i => 24 + i * 15;
function updResults() {
  const t = sceneT;
  for (let i = 0; i < RES_N; i++) if (t === RES_ROW(i)) SND.sfx.tick();
  if (t > RES_ROW(8) && t < RES_ROW(8) + 60 && t % 3 === 0) SND.sfx.text();
  if (t === RES_ROW(RES_N) + 40) SND.sfx.powerup();
  if (t > RES_ROW(RES_N) + 50 && confirmP()) { SND.sfx.select(); if (results.lv1 > results.lv0) goScene('levelup'); else afterLevelUp(); }
}
function afterLevelUp() { if (results.promote) startPromote(false); else afterPromote(); }
function afterPromote() { if (results.soul) goScene('unlock'); else afterUnlock(); }
/* after the final chapter's first clear comes the ending; otherwise "to be continued" when the next region is still sealed */
function afterUnlock() {
  const nx = STAGES.find(s => s.id === stage.id + 1);
  trueEnd = !!stage.hidden;
  if (results.first && (stage.final || stage.hidden)) { SND.musicStop(); goScene('ending'); }
  else if (results.first && (!nx || nx.sealed)) goScene('tbc');
  else goMap(true);
}
/* ending: the last chain around the Earth cracks and shatters, a few lines, the credits, THE END */
const END = {crack: 60, shatter: 160, text: 200, credits: 560, fin: 1260};
const END_LINES = ['지구를 묶던 마지막 사슬이 끊어졌다.', '마음을 되찾은 세 강자가, 이름 없는 검사 곁에 선다.', '...그러나 사슬의 주인은, 아직 지구의 중심에 있다.'];
// the true ending, after the original: the prison itself is gone
const TRUE_LINES = ['스스로를 신이라 부르던 자의 감옥이, 마침내 무너졌다.', '그의 모조품으로 태어난 검사는, 그와 다른 길을 골랐다.', '이름 없는 검사는 검을 거두고, 자유로운 하늘을 올려다본다.'];
let trueEnd = false;
const endLines = () => trueEnd ? TRUE_LINES : END_LINES;
function updEnding() {
  const t = sceneT;
  if (t === END.crack) SND.sfx.rumble();
  if (t > END.crack && t < END.shatter && t % 14 === 0) SND.sfx.brk();
  if (t === END.shatter) {
    SND.sfx.boom(); SND.sfx.special(); flash = {a: 1, color: C.W};
    for (let i = 0; i < 70; i++) { const a = 3.9 + rnd(1.6), r = 298, x = 250 + Math.cos(a) * r, y = 520 + Math.sin(a) * r; addP({kind: 'shard', x, y, vx: Math.cos(a) * rnd(1, 4) + rnd(-1, 1), vy: Math.sin(a) * rnd(1, 4) - rnd(0, 2), drag: 0.97, life: ri(40, 90), size: rnd(2, 5), ang: rnd(TAU), spin: rnd(-0.3, 0.3), blue: i % 3 === 0}); }
    // the true ending: the last links on the sword burst off it too (violet: red and blue shards)
    if (trueEnd) {
      for (let i = 0; i < 40; i++) { const [x, y] = tswordPt(rnd(64, 200), rnd(-18, 18)); addP({kind: 'shard', x, y, vx: rnd(-1, 3.5), vy: rnd(-3, 1), drag: 0.97, life: ri(40, 80), size: rnd(2, 4.5), ang: rnd(TAU), spin: rnd(-0.3, 0.3), blue: i % 2 === 0}); }
      for (const s of [92, 132, 176]) for (let i = 0; i < 8; i++) { const [x0, y0] = tswordPt(s, 0), u = rnd(0, 0.45); addP({kind: 'shard', x: lerp(x0, 500, u), y: lerp(y0, [-6, 60, 178][[92, 132, 176].indexOf(s)], u), vx: rnd(-1, 2), vy: rnd(-2, 1.5), drag: 0.97, life: ri(40, 80), size: rnd(2, 4), ang: rnd(TAU), spin: 0.25, blue: i % 2 === 1}); }
    }
  }
  if (t === END.shatter + 40) { SND.musicStart('calm'); SND.sfx.jingle(); }
  if (t > END.text && t < END.credits && t % 4 === 0) SND.sfx.text();
  // after the Sovereign: no credits yet (they roll only after the original) - straight from the lines to
  // THE END.... and the question mark (see drawEnding)
  if (!trueEnd) {
    if (t === END.credits + 40) setScene('ending', END.fin);
    const k = t - END.fin;
    if (k >= 50 && k < 90 && (k - 50) % 10 === 0) SND.sfx.tick();
    if (k === 92) { SND.musicStop(); SND.sfx.boom(); SND.sfx.chain(); SND.sfx.warn(); flash = {a: 0.4, color: C.P}; }
  }
  updateParticles(); decayFx();
  if (t > END.fin + (trueEnd ? 40 : 140) && confirmP()) { SND.sfx.select(); SND.musicStop(); goTitle(); }
  else if (t > END.text + 60 && t < END.fin && confirmP()) setScene('ending', END.fin);
}

function update() {
  globalT++; sceneT++;
  if (wipeT > 0) wipeT--;
  if (pressed.mute) { SND.toggleMute(); muteMsgT = 70; }
  if (muteMsgT > 0) muteMsgT--;
  switch (scene) {
    case 'title': updTitle(); break;
    case 'settings': updSettings(); break;
    case 'map': updMap(); break;
    case 'growth': updGrowth(); break;
    case 'practice': updPractice(); break;
    case 'loading': if (sceneT >= 64) goScene('intro'); break;
    case 'intro': if (stage.key === 'origin') updOriginIntro(); else if (sceneT >= 170 || (sceneT > 24 && confirmP())) setScene('entrance'); break;
    case 'entrance': updEntrance(); break;
    case 'mini': updMini(); break;
    case 'arrival': updArrival(); break;
    case 'victory2': updVictory2(); break;
    case 'opening': updOpening(); break;
    case 'dialogue': updDialogue(); break;
    case 'bosscard': if (sceneT >= 170 || (sceneT > 34 && confirmP())) { goScene('fight'); beginFight(); } break;
    case 'fight': updFight(); break;
    case 'phase2': updPhase2(); break;
    case 'phase2b': updPhase2b(); break;
    case 'origin3': updOrigin3(); break;
    case 'execute': updExecute(); break;
    case 'special': updSpecial(); break;
    case 'bossbanner': updBossBanner(); break;
    case 'passive': updPassive(); break;
    case 'continue': updContinue(); break;
    case 'gameover': if (sceneT > 60 && confirmP()) { SND.sfx.select(); goMap(); } break;
    case 'victory': updVictory(); break;
    case 'results': updResults(); break;
    case 'levelup': updLevelUp(); break;
    case 'promote': updPromote(); break;
    case 'skills': updSkills(); break;
    case 'unlock': if (sceneT > 40 && confirmP()) { SND.sfx.select(); afterUnlock(); } break;
    case 'tbc': if (sceneT > 90 && confirmP()) { SND.sfx.select(); goMap(true); } break;
    case 'ending': updEnding(); break;
  }
  if (queueClear) { clearHazards(); queueClear = false; }
  // presses made during hit-stop are kept until the world moves again, so combos never drop inputs
  pressed.pause = false; pressed.mute = false;
  if (!holdInput) for (const k in pressed) pressed[k] = false;
  holdInput = false;
}
