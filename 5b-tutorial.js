/* ---------- first-chapter tutorial ----------
   the first time through chapter 1, the mini stage walks the player through the controls one step at a time:
   move, jump, dash in an empty field, then the first wave arrives for attacking, just dodging, skills and the special.
   every step also moves on by itself after a while, so nobody gets stuck */
const TUT = [
  {title: '이동', sub: 'A / D 로 좌우로 움직여 보자', keys: ['A', 'D'], wait: 900},
  {title: '점프', sub: 'W 로 점프 · 공중에서 한 번 더 누르면 2단 점프', keys: ['W'], wait: 900},
  {title: '대시', sub: 'K 로 대시 · 대시하는 순간에는 무적이다', keys: ['K'], wait: 900},
  {title: '공격', sub: 'J 로 벌레를 베어라 · 연타하면 5연타 콤보', keys: ['J'], wait: 2400},
  {title: '저스트 회피', sub: '벌레가 달려들기 직전(!)에 K · 시간이 느려진다', keys: ['K'], wait: 1500},
  {title: '스킬', sub: 'L 천검 · I 검기 · O 검산 중 두 가지를 써 보자', keys: ['L', 'I', 'O'], wait: 1500},
  {title: '필살기', sub: 'SP가 가득 찼다! U 를 길게 눌러 필살기', keys: ['U'], wait: 1200},
];
const tutActive = () => stage.key === 'bow' && !save.tut && mode === 'fight';
function startTutorial() { tut = {i: 0, t: 0, ok: 0, moved: 0, lastX: player.x, jumped: false, used: {}}; }
function finishTutorial(early) {
  tut = null; save.tut = true; writeSave();
  if (!early) { bigText = {s: '튜토리얼 완료', t: 0, dur: 80, color: C.Y}; SND.sfx.jingle(); }
}
function tutStepDone(T, p) {
  switch (T.i) {
    case 0: return T.moved > 90;
    case 1: return p.jumps === 2 || (T.jumped && p.onGround && T.t > 60);
    case 2: return p.state === 'dash';
    case 3: return stats.kills >= 2;
    case 4: return stats.justs >= 1;
    case 5: return Object.keys(T.used).length >= 2;
    case 6: return stats.specials >= 1;
  }
  return true;
}
function updTutorial() {
  const T = tut, p = player;
  T.t++;
  T.moved += Math.abs(p.x - T.lastX); T.lastX = p.x;
  if (p.jumps >= 1) T.jumped = true;
  if (p.state === 'fury') T.used.fury = 1; if (p.state === 'plant') T.used.peak = 1; if (sigil) T.used.blade = 1;
  if (T.ok > 0) {
    if (--T.ok > 0) return;
    T.i++; T.t = 0;
    if (T.i === 3) startWave(0);
    if (T.i === 6) { p.sp = 100; SND.sfx.powerup(); }
    if (T.i >= TUT.length) finishTutorial(false);
    return;
  }
  if (tutStepDone(T, p) || T.t > TUT[T.i].wait) {
    T.ok = 40; SND.sfx.select();
    floatText(T.t > TUT[T.i].wait && !tutStepDone(T, p) ? '다음으로' : '좋아!', p.x, p.y - 56, C.Y, 2, 40, C.K);
  }
}
function keyCap(k, x, y) {
  const w = Math.max(13, text(k, 0, -99) + 6);
  ctx.fillStyle = C.W; ctx.fillRect(x, y, w, 13); ctx.fillStyle = C.K; ctx.fillRect(x + 1, y + 11, w - 2, 1);
  text(k, x + w / 2, y + 3, {color: C.K, align: 'center'});
  return w;
}
function drawTutorial() {
  const T = tut, s = TUT[T.i]; if (!s) return;
  // right of the hero's status block, under the wave counter
  const w = 316, h = 38, x = 118, y = Math.round(lerp(-h, 42, easeOut(clamp(T.t / 10, 0, 1))));
  ctx.fillStyle = C.K; ctx.fillRect(x, y, w, h); ctx.strokeStyle = T.ok ? C.Y : C.W; ctx.lineWidth = 1; ctx.strokeRect(x + 1.5, y + 1.5, w - 3, h - 3);
  ctx.fillStyle = C.R; ctx.fillRect(x + 1, y + 1, 4, h - 2);
  text('튜토리얼 ' + (T.i + 1) + '/' + TUT.length, x + 12, y + 6, {color: C.G3});
  text(s.title, x + 90, y + 4, {sc: 2, color: T.ok ? C.Y : C.W});
  let kx = x + w - 12;
  for (let i = s.keys.length - 1; i >= 0; i--) { const kw = Math.max(13, text(s.keys[i], 0, -99) + 6); kx -= kw; keyCap(s.keys[i], kx, y + 5); kx -= 4; }
  text(s.sub, x + 12, y + 22, {color: C.W});
  if (T.ok) {
    // check mark
    ctx.strokeStyle = C.G2; ctx.lineWidth = 3; ctx.lineCap = 'round'; poly([[x + w - 40, y + 26], [x + w - 34, y + 32], [x + w - 22, y + 18]]);
  }
  // on the just-dodge lesson, mark every minion that is about to strike
  if (T.i === 4 && !T.ok) for (const m of mobs) if (m.hp > 0 && m.state === 'wind' && ((globalT >> 2) & 1)) text('!', m.x, m.y - 34 * m.s - (MOB[m.type].fly ? 0 : 6), {sc: 2, color: C.R, outline: C.W, align: 'center'});
}
