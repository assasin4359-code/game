/* ---------- class promotion: Summoner -> Master -> Lord -> God ----------
   darkness; a sigil opens under the hero and twelve blades are summoned one by one into a ring that spins
   faster and faster; they plunge into the hero; a white burst and a pillar of light; the hero stands in the new
   look; the class title; what the new rank brings. crimson for Master and Lord, gold for God */
const PRO = {ring: 20, conv: 110, burst: 132, title: 172, slide: 212, panel: 228, prompt: 280};
const PRO_CLASS = {
  1: {col: C.R, line: '잠들어 있던 힘이 깨어난다', head: '새로운 스킬 · 스킬 창에서 장착', skills: [
    ['', 'flash', '섬광일섬 · 백화난무', '빠르고 화려한 마스터의 검술'],
    ['', 'swallow', '비연삼단', '적을 가르고 하늘에서 내리찍는다'],
    ['S+J', 'rising', '승룡검', '땅에서 솟구치며 올려 베는 대공기'],
    ['+1', 'slot', '스킬 슬롯 4칸', '장착할 수 있는 스킬이 하나 늘어난다']]},
  2: {col: C.R, line: '모든 검이 새로운 주인 앞에 무릎 꿇는다', head: '새로운 힘 · 스킬 창에서 장착', skills: [
    ['', 'rain', '만검우 · 천검군림', '검의 비와 검의 날개'],
    ['', 'march', '검옥 · 천붕검', '검으로 가두고, 하늘에서 검을 내리꽂는다'],
    ['', 'cape', '크림슨 망토', '로드의 증표 · 등 뒤의 검 5자루']]},
  3: {col: C.Y, line: '검의 끝에 닿은 자, 신의 경지에 오른다', head: '새로운 힘', skills: [
    ['U', 'god', '일검무귀', '모든 기운을 모아 단 한 번 벤다'],
    ['', 'formless', '무형검 · 검역 · 천지검명', '검 그 자체가 된 신의 기술'],
    ['', 'halo', '검의 후광', '황금 검륜 · 금빛으로 물드는 검'],
    ['+1', 'slot', '스킬 슬롯 5칸', '장착할 수 있는 스킬이 하나 늘어난다']]},
};
let promo = null;
function startPromote(fromMap) {
  const r = results && results.promote, c = !fromMap && r ? r.cls : Math.min(save.cls | 0, (save.promoShown | 0) + 1);
  // a promotion replayed from the world map shows that rank's step at the current level
  const base = atkPower() / heroClass().atk, hpBase = maxHpNow() - heroClass().hp;
  const st = !fromMap && r ? r : {atk0: Math.round(base * CLASSES[c - 1].atk), atk1: Math.round(base * CLASSES[c].atk), hp0: hpBase + CLASSES[c - 1].hp, hp1: hpBase + CLASSES[c].hp};
  promo = {fromMap, c, st};
  particles.length = 0; SND.musicStop(); goScene('promote');
}
function finishPromote() {
  SND.chargeStop(); save.promoShown = Math.max(save.promoShown | 0, promo.c); writeSave();
  const fromMap = promo.fromMap; promo = null;
  if (fromMap) goMap(); else afterPromote();
}
const promoHeroX = t => t < PRO.slide ? 240 : lerp(240, 112, easeOut(clamp((t - PRO.slide) / 16, 0, 1)));
function promoRing(t) {
  // radius and spin of the summoned ring
  const r = t < PRO.conv ? 74 : 74 * (1 - Math.pow(clamp((t - PRO.conv) / (PRO.burst - PRO.conv), 0, 1), 2));
  const spin = (t - PRO.ring) * 0.02 + Math.pow(Math.max(0, t - PRO.ring) / 60, 2) * 1.2;
  return {r, spin};
}
function updPromote() {
  const t = sceneT, hx = promoHeroX(t), fy = 214, col = (PRO_CLASS[promo && promo.c] || PRO_CLASS[1]).col;
  if (t === PRO.ring) { SND.sfx.rumble(); SND.chargeStart(); }
  if (t > PRO.ring && t < PRO.burst) SND.chargeSet((t - PRO.ring) / (PRO.burst - PRO.ring));
  if (t >= PRO.ring && t < PRO.ring + 12 * 6 && (t - PRO.ring) % 6 === 0) { SND.sfx.blade(); const {r, spin} = promoRing(t), a = (t - PRO.ring) / 6 / 12 * TAU + spin; addP({kind: 'ring', x: hx + Math.cos(a) * r, y: fy - 36 + Math.sin(a) * r * 0.35, r0: 2, rMax: 12, life: 8, color: C.W, size: 2}); }
  if (t === PRO.conv) SND.sfx.whoosh();
  if (t > PRO.ring && t < PRO.burst) { if (t % 2 === 0) { const a = rnd(TAU), d = rnd(60, 120); addP({x: hx + Math.cos(a) * d, y: fy - 36 + Math.sin(a) * d * 0.5, vx: -Math.cos(a) * 3, vy: -Math.sin(a) * 1.5, life: 18, color: Math.random() < 0.5 ? C.R : C.W, size: 2}); } shakeAmt = Math.max(shakeAmt, (t - PRO.ring) / (PRO.burst - PRO.ring) * 2.5); }
  if (t === PRO.burst) {
    SND.chargeStop(); SND.sfx.boom(); SND.sfx.special(); SND.sfx.impact(); flash = {a: 1, color: C.W}; shake(12);
    for (let i = 0; i < 4; i++) addP({kind: 'ring', x: hx, y: fy - 30, r0: 6 + i * 10, rMax: 150, life: 22 + i * 6, color: i % 2 ? col : C.W, size: 3});
    for (let i = 0; i < 30; i++) { const a = rnd(TAU), s = rnd(2, 6); addP({kind: 'shard', x: hx, y: fy - 30, vx: Math.cos(a) * s, vy: Math.sin(a) * s - 1, drag: 0.94, life: ri(24, 44), size: rnd(2, 5), ang: a, spin: rnd(-0.3, 0.3)}); }
  }
  if (t === PRO.title) { SND.sfx.fanfare(); SND.sfx.impact(); shake(5); }
  if (t === PRO.panel) SND.sfx.powerup();
  // after the burst, a crimson aura rises off the new Blade Master
  if (t > PRO.burst && t % 3 === 0) addP({x: hx + rnd(-14, 14), y: fy - rnd(0, 60), vx: rnd(-0.3, 0.3), vy: -rnd(0.6, 1.6), life: 30, color: Math.random() < 0.6 ? col : C.W, size: Math.random() < 0.3 ? 2 : 1});
  updateParticles(); decayFx();
  if (t > PRO.prompt && confirmP()) { SND.sfx.select(); finishPromote(); }
  else if (t > 30 && t < PRO.burst - 2 && confirmP()) setScene('promote', PRO.burst - 1);
}
function drawPromote(t) {
  const hx = promoHeroX(t), fy = 214, master = t >= PRO.burst, P = promo || {c: 1, st: {hp0: 0, hp1: 0, atk0: 0, atk1: 0}}, K = PRO_CLASS[P.c] || PRO_CLASS[1], col = K.col;
  ctx.fillStyle = C.K; ctx.fillRect(0, 0, W, H);
  ctx.save();
  if (shakeAmt) ctx.translate(Math.round(rnd(-1, 1) * shakeAmt), Math.round(rnd(-1, 1) * shakeAmt));
  // the sigil on the ground
  if (t >= PRO.ring) {
    const g = easeOut(clamp((t - PRO.ring) / 30, 0, 1)), rx = 96 * g, ry = 16 * g, a0 = t * 0.03, fade = master ? Math.max(0.3, 1 - (t - PRO.burst) / 60) : 1;
    ctx.globalAlpha = fade; ctx.strokeStyle = col; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.ellipse(hx, fy + 1, rx, ry, 0, 0, TAU); ctx.stroke();
    ctx.beginPath(); ctx.ellipse(hx, fy + 1, rx * 0.72, ry * 0.72, 0, 0, TAU); ctx.stroke();
    for (let k = 0; k < 16; k++) { const a = a0 + k * TAU / 16; poly([[hx + Math.cos(a) * rx * 0.72, fy + 1 + Math.sin(a) * ry * 0.72], [hx + Math.cos(a) * rx, fy + 1 + Math.sin(a) * ry]]); }
    ctx.globalAlpha = 1;
  }
  // the pillar of light at the burst
  if (master && t < PRO.burst + 50) {
    const k = 1 - (t - PRO.burst) / 50, pw = 70 * k + 6;
    ctx.fillStyle = col; ctx.fillRect(hx - pw, 0, pw * 2, fy); ctx.fillStyle = C.W; ctx.fillRect(hx - pw * 0.6, 0, pw * 1.2, fy);
  }
  // the ring of summoned blades: the far half behind the hero, the near half in front
  const ringOn = t >= PRO.ring && t < PRO.burst, {r, spin} = promoRing(t);
  const ring = front => {
    if (!ringOn) return;
    for (let i = 0; i < 12; i++) {
      if (t < PRO.ring + i * 6) continue;
      const a = i / 12 * TAU + spin, s = Math.sin(a);
      if ((s >= 0) !== front) continue;
      const x = hx + Math.cos(a) * r, y = fy - 36 + s * r * 0.35, fresh = t - (PRO.ring + i * 6) < 4;
      drawRimSword(x, y - 18, 0, 1, 30, 1, 0.8, fresh ? C.W : C.K, col);
    }
  };
  ring(false);
  const q = master ? {hy: -16, lean: -0.08, ht: -0.2, l1: -0.4, r1: 0.4, fu: 2.55, ff: 0.35, bu: 2.3, bf: 0.4, sa: Math.PI - 0.35}
    : {hy: -12, lean: 0.2, ht: 0.25, l1: 0.1, l2: -1.4, r1: 1.0, r2: -1.6, bu: 0.9, bf: 0.3, fu: 1.0, ff: -0.3, sa: 0.1};
  drawFigure(hx, fy, 1, makePose(q), heroLook({sc: 2.4, color: C.K, outline: master ? col : C.W, t: globalT, sword: {len: SWORD_LEN, color: C.K, edge: master ? col : C.W}}, master ? P.c : P.c - 1));
  ring(true);
  ctx.fillStyle = C.K; ctx.fillRect(0, fy + 20, W, H);
  ctx.restore();
  drawParticles();
  if (flash.a > 0) { ctx.globalAlpha = Math.min(1, flash.a); ctx.fillStyle = flash.color; ctx.fillRect(0, 0, W, H); ctx.globalAlpha = 1; }
  // words
  if (!master) {
    const s = 'LV.' + CLASSES[P.c].lv + ' 도달  ·  ' + K.line, n = Math.floor(Math.max(0, t - 4) / 2);
    text(s.slice(0, n), 240, 18, {color: C.W, align: 'center'});
  }
  if (t >= PRO.title) {
    const u = easeOut(clamp((t - PRO.title) / 10, 0, 1)), cx = t < PRO.slide ? 240 : lerp(240, 330, easeOut(clamp((t - PRO.slide) / 16, 0, 1)));
    text('클래스 승급', cx, 10, {color: col, align: 'center'});
    ktext(CLASSES[P.c].en, lerp(cx + 300, cx, u), 24, {sc: 'serif', color: C.W, outline: col === C.Y ? C.R : col, align: 'center'});
    if (t > PRO.title + 12) text(CLASSES[P.c - 1].name + '   >   ' + CLASSES[P.c].name, cx, 64, {color: C.Y, align: 'center'});
  }
  if (t >= PRO.panel) {
    const x = Math.round(lerp(W + 10, 204, easeOut(clamp((t - PRO.panel) / 12, 0, 1)))), y = 80, w = 266;
    ctx.fillStyle = C.K; ctx.fillRect(x, y, w, 162); ctx.strokeStyle = col; ctx.lineWidth = 1; ctx.strokeRect(x + 1.5, y + 1.5, w - 3, 159);
    text('공격력', x + 10, y + 8, {color: C.R}); text(fmt(P.st.atk0) + '  >  ' + fmt(P.st.atk1), x + 60, y + 8, {color: C.W}); text('+' + Math.round((P.st.atk1 / Math.max(1, P.st.atk0) - 1) * 100) + '%', x + w - 10, y + 8, {color: C.Y, align: 'right'});
    text('최대 HP', x + 10, y + 22, {color: C.R}); text(P.st.hp0 + '  >  ' + P.st.hp1, x + 60, y + 22, {color: C.W}); text('+' + (P.st.hp1 - P.st.hp0), x + w - 10, y + 22, {color: C.Y, align: 'right'});
    ctx.fillStyle = col; ctx.fillRect(x + 8, y + 37, w - 16, 1);
    text(K.head, x + 10, y + 42, {color: C.Y});
    K.skills.forEach(([key, icon, name, desc], i) => {
      if (t < PRO.panel + 10 + i * 8) return;
      const yy = y + 56 + i * 26;
      ctx.fillStyle = C.Y; ctx.fillRect(x + 9, yy - 1, 20, 20); ctx.fillStyle = C.R; ctx.fillRect(x + 10, yy, 18, 18); drawIcon(icon, x + 10, yy);
      text(key, x + 36, yy, {color: C.Y}); text(name, x + 36 + text(key, 0, -99) + 6, yy, {color: C.W});
      text(desc, x + 36, yy + 12, {color: C.G3});
    });
  }
  if (t > PRO.prompt && ((t >> 4) & 1)) text('ENTER를 눌러 계속', 240, 257, {color: C.W, align: 'center'});
  else if (!master && t > 30 && ((t >> 5) & 1)) text('ENTER 건너뛰기', 470, 258, {color: C.W, align: 'right'});
}
