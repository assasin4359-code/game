/* ---------- skill screen: put active skills into the skill slots ----------
   every skill is listed - active skills (slotted), the two specials, and the techniques that are always at hand.
   locked ones show what unlocks them. J equips / unequips, A/D moves an equipped skill along the slots; when every
   slot is full, equipping asks which slot to replace. opened from the world map and from the practice menu */
let skIdx = 1, skPage = 0, skFrom = 'map', skPick = null, skFlash = 0, skDeny = 0;
// the trait view of the selected ability (U), and a short message under it
let skTrait = null, skMsg = null;
// which trait set a row carries: the three slotted basics by id, the techniques by position
const rowTrait = r => r.kind === 'skill' ? (TRAITS[r.id] ? r.id : null) : r.kind === 'tech' ? ['combo', 'just', 'pierce'][r.i] || null : null;
/* two pages: 1 - the basic skills, the Master's and the techniques; 2 - the Lord's, the God's and the specials */
const SK_PAGES = [
  [{head: '기본 스킬  ·  슬롯에 장착해서 사용'}, 'blade', 'fury', 'peak', {head: '블레이드 마스터  ·  검을 완전히 익힌 자'}, 'flash', 'bloom', 'swallow', {head: '고유 기술  ·  언제나 사용 가능'}, 'tech'],
  [{head: '블레이드 로드  ·  검을 지배하는 자'}, 'rain', 'reign', 'prison', 'march', {head: '블레이드 갓  ·  검 그 자체'}, 'formless', 'domain', 'resonance', {head: '필살기  ·  SP 100%에서 U 길게'}, 'ult'],
];
function skillRows(page = skPage) {
  const rows = [];
  for (const e of SK_PAGES[page]) {
    if (e === 'tech') TECHS.forEach((tc, i) => rows.push({kind: 'tech', i}));
    else if (e === 'ult') rows.push({kind: 'ult', id: 'storm'}, {kind: 'ult', id: 'god'});
    else if (typeof e === 'string') rows.push({kind: 'skill', id: e});
    else rows.push(e);
  }
  return rows;
}
function startSkills(from) {
  skFrom = from; skPick = null; skFlash = 0; skDeny = 0; skTrait = null; skMsg = null;
  const rows = skillRows(); if (!rows[skIdx] || rows[skIdx].head) skIdx = 1;
  goScene('skills');
}
function skTurn(d, last) { skPage = (skPage + d + SK_PAGES.length) % SK_PAGES.length; const rows = skillRows(); skIdx = last ? rows.length - 1 : 1; while (rows[skIdx].head) skIdx += last ? -1 : 1; SND.sfx.tick(); }
function leaveSkills() {
  writeSave();
  if (skFrom === 'practice') { pmenu = null; goScene('practice'); } else if (skFrom === 'title') goTitle(); else goMap();
}
const rowUnlocked = r => r.kind === 'skill' ? skillUnlocked(r.id) : r.kind === 'ult' ? ULTS[r.id].cls <= (save.cls | 0) : TECHS[r.i].cls <= (save.cls | 0);
const rowCls = r => r.kind === 'skill' ? SKILLS[r.id].cls : r.kind === 'ult' ? ULTS[r.id].cls : TECHS[r.i].cls;
function updSkills() {
  if (skFlash > 0) skFlash--;
  if (skDeny > 0) skDeny--;
  if (skMsg && ++skMsg.t > 90) skMsg = null;
  const rows = skillRows(), n = slotCount(), L = save.loadout;
  if (skTrait) {
    // the trait view: W/S picks A or B; J buys it (and wears it), wears it, or takes it off
    const T = skTrait, id = T.id, k = T.sel ? 'B' : 'A';
    if (pressed.jump || pressed.down) { T.sel = 1 - T.sel; SND.sfx.tick(); return; }
    if (pressed.dash || pressed.pause || pressed.special) { skTrait = null; SND.sfx.select(); return; }
    if (!confirmP()) return;
    save.trait = save.trait || {}; save.traitOwn = save.traitOwn || {};
    if (!traitOwned(id, k)) {
      const cost = traitCost(id);
      if (save.gold < cost) { SND.sfx.deny(); skDeny = 20; skMsg = {s: '골드가 부족합니다', t: 0, bad: true}; return; }
      save.gold -= cost; save.traitOwn[id + k] = true; save.trait[id] = k;
      SND.sfx.buy(); skFlash = 18; skMsg = {s: TRAITS[id][k].name + ' 획득 · 장착했다', t: 0};
    } else if (traitOf(id) === k) { save.trait[id] = null; SND.sfx.select(); skMsg = {s: '특성을 해제했다', t: 0}; }
    else { save.trait[id] = k; SND.sfx.buy(); skFlash = 12; skMsg = {s: TRAITS[id][k].name + ' 장착', t: 0}; }
    writeSave();
    return;
  }
  if (skPick) {
    // choosing which full slot the new skill replaces
    if (pressed.left) { skPick.slot = (skPick.slot + n - 1) % n; SND.sfx.tick(); }
    if (pressed.right) { skPick.slot = (skPick.slot + 1) % n; SND.sfx.tick(); }
    if (pressed.dash || pressed.pause) { skPick = null; SND.sfx.select(); return; }
    if (confirmP()) { L[skPick.slot] = skPick.id; skPick = null; SND.sfx.buy(); skFlash = 16; writeSave(); }
    return;
  }
  // W/S walk the list (and roll over onto the other page); Q/E turn the page
  const step = d => {
    let i = skIdx;
    do { i += d; if (i < 0 || i >= rows.length) { skTurn(d, d < 0); return; } } while (rows[i].head);
    skIdx = i; SND.sfx.tick();
  };
  if (pressed.jump) { step(-1); return; }
  if (pressed.down) { step(1); return; }
  if (pressed.slot1) { skTurn(-1); return; }
  if (pressed.slot2) { skTurn(1); return; }
  if (pressed.pause || pressed.dash) { SND.sfx.select(); leaveSkills(); return; }
  const r = rows[skIdx];
  // U opens the traits of the selected ability
  if (pressed.special) {
    const tid = rowTrait(r);
    if (tid && rowUnlocked(r)) { skTrait = {id: tid, sel: traitOf(tid) === 'B' ? 1 : 0}; skMsg = null; SND.sfx.select(); }
    else { SND.sfx.deny(); skDeny = 20; skMsg = {s: tid ? '해금한 뒤에 고를 수 있다' : '이 능력에는 아직 특성이 없다', t: 0, bad: true}; }
    return;
  }
  if (r.kind === 'skill') {
    const k = L.indexOf(r.id);
    // move an equipped skill along the slots
    if (k >= 0 && k < n && (pressed.left || pressed.right)) {
      const to = (k + (pressed.left ? n - 1 : 1)) % n; [L[k], L[to]] = [L[to], L[k]]; SND.sfx.tick(); skFlash = 10; writeSave(); return;
    }
    if (!confirmP()) return;
    if (!skillUnlocked(r.id)) { SND.sfx.deny(); skDeny = 20; return; }
    if (k >= 0 && k < n) { L[k] = null; SND.sfx.select(); writeSave(); return; }
    const free = L.findIndex((v, i) => !v && i < n);
    if (free >= 0) { L[free] = r.id; SND.sfx.buy(); skFlash = 16; writeSave(); }
    else skPick = {id: r.id, slot: 0};
  } else if (r.kind === 'ult' && confirmP()) {
    if (!rowUnlocked(r)) { SND.sfx.deny(); skDeny = 20; return; }
    save.ult = r.id; SND.sfx.buy(); skFlash = 16; writeSave();
  } else if (confirmP()) SND.sfx.tick();
}
function slotBox(i, x, y) {
  const n = slotCount(), id = save.loadout[i], open = i < n, pick = skPick && skPick.slot === i;
  ctx.fillStyle = pick ? C.Y : open ? C.W : '#4a4a4a'; ctx.fillRect(x - 1, y - 1, 24, 24);
  ctx.fillStyle = open && id ? C.R : C.K; ctx.fillRect(x, y, 22, 22);
  if (!open) lockIcon(x + 11, y + 9);
  else if (id) drawIcon(SKILLS[id].icon, x + 2, y + 2);
  else { ctx.strokeStyle = '#6a6a6a'; ctx.lineWidth = 1; ctx.setLineDash([2, 2]); ctx.strokeRect(x + 3.5, y + 3.5, 15, 15); ctx.setLineDash([]); }
  text(SLOT_KEYS[i], x + 11, y + 26, {color: open ? C.Y : '#6a6a6a', align: 'center'});
  if (pick && ((globalT >> 2) & 1)) { ctx.fillStyle = C.Y; ctx.beginPath(); ctx.moveTo(x + 6, y + 36); ctx.lineTo(x + 16, y + 36); ctx.lineTo(x + 11, y + 31); ctx.fill(); }
}
function drawSkills() {
  const t = globalT, rows = skillRows(), n = slotCount(), L = save.loadout;
  drawStarfield(t);
  ctx.globalAlpha = 0.72; ctx.fillStyle = C.K; ctx.fillRect(0, 0, W, H); ctx.globalAlpha = 1;
  // an opaque backing for the list so the stars never speckle the text
  ctx.fillStyle = C.K; ctx.fillRect(4, 36, 242, 212);
  ctx.fillStyle = C.R; ctx.beginPath(); ctx.moveTo(0, 32); ctx.lineTo(74, 30); ctx.lineTo(74, 33); ctx.lineTo(0, 35); ctx.fill();
  text('스킬', 12, 6, {sc: 4, color: C.W});
  text(heroClass().name + '  ·  슬롯 ' + n + '칸', 80, 10, {color: C.G3});
  // the page tabs
  SK_PAGES.forEach((pg, i) => {
    const x = 80 + i * 50, on = i === skPage;
    ctx.fillStyle = on ? C.R : C.K; ctx.fillRect(x, 22, 46, 12);
    if (!on) { ctx.strokeStyle = C.W; ctx.lineWidth = 1; ctx.strokeRect(x + 0.5, 22.5, 45, 11); }
    text((i + 1) + ' 페이지', x + 23, 23, {color: on ? C.W : C.G3, align: 'center'});
  });
  text('Q/E', 184, 24, {color: C.Y});
  // the slot bar
  for (let i = 0; i < 5; i++) slotBox(i, 262 + i * 42, 6);
  // the list
  let y = 40;
  rows.forEach((r, i) => {
    if (r.head) { text(r.head, 10, y + 1, {color: C.R}); y += 13; return; }
    const sel = i === skIdx && !skPick, un = rowUnlocked(r);
    if (sel) { ctx.strokeStyle = skDeny > 0 && (skDeny & 4) ? C.R : C.Y; ctx.lineWidth = 1; ctx.strokeRect(6.5, y - 2.5, 236, 13); menuArrow(10, y + 4); }
    const name = r.kind === 'skill' ? SKILLS[r.id].name : r.kind === 'ult' ? ULTS[r.id].name : TECHS[r.i].name;
    text(name, 20, y, {color: !un ? C.B : sel ? C.Y : C.W});
    // the trait worn, as a small A / B tag
    const tid = rowTrait(r), tk = tid && traitOf(tid);
    if (tk && un) { const tx = r.kind === 'tech' ? 170 : 190; ctx.fillStyle = C.P; ctx.fillRect(tx, y - 1, 13, 11); text(tk, tx + 7, y, {color: C.W, align: 'center'}); }
    if (!un) { lockIcon(234, y + 2); text(CLASSES[rowCls(r)].name.replace('블레이드 ', ''), 224, y, {color: C.B, align: 'right'}); }
    else if (r.kind === 'skill') {
      const k = L.indexOf(r.id);
      if (k >= 0 && k < n) { ctx.fillStyle = C.Y; ctx.fillRect(224, y - 1, 13, 11); text(SLOT_KEYS[k], 230, y, {color: C.K, align: 'center'}); }
      else text('미장착', 238, y, {color: C.G3, align: 'right'});
    } else if (r.kind === 'ult') { if ((r.id === 'god') === useGodUlt()) text('사용 중', 238, y, {color: C.Y, align: 'right'}); }
    else text(TECHS[r.i].key, 238, y, {color: C.G3, align: 'right'});
    y += 13;
  });
  // details of the selected row
  const r = rows[skIdx], px = 256, py = 50, pw = 216, ph = 190, un = rowUnlocked(r);
  ctx.fillStyle = C.K; ctx.fillRect(px, py, pw, ph); ctx.strokeStyle = skFlash > 0 && (skFlash & 2) ? C.Y : C.W; ctx.lineWidth = 1; ctx.strokeRect(px + 1.5, py + 1.5, pw - 3, ph - 3);
  const def = r.kind === 'skill' ? SKILLS[r.id] : r.kind === 'ult' ? ULTS[r.id] : TECHS[r.i];
  ctx.fillStyle = un ? C.W : '#4a4a4a'; ctx.fillRect(px + 9, py + 9, 20, 20); ctx.fillStyle = un ? C.R : C.K; ctx.fillRect(px + 10, py + 10, 18, 18);
  if (un) drawIcon(def.icon, px + 10, py + 10); else lockIcon(px + 19, py + 17);
  text(def.name, px + 36, py + 10, {sc: 2, color: un ? C.W : C.B});
  const cls = CLASSES[def.cls], req = def.cls ? '해금: ' + cls.name + ' (LV.' + cls.lv + ')' : '처음부터 사용 가능';
  text(req, px + 10, py + 36, {color: un ? C.G3 : C.R});
  let info = '';
  if (r.kind === 'skill') { const k = L.indexOf(r.id); info = '재사용 ' + Math.round(def.cd / 60) + '초  ·  ' + (!un ? '잠김' : k >= 0 && k < n ? '슬롯 ' + (k + 1) + ' [' + SLOT_KEYS[k] + '] 장착 중' : '장착되지 않음'); }
  else if (r.kind === 'ult') info = !un ? '잠김' : (r.id === 'storm' ? !useGodUlt() : useGodUlt()) ? '지금 사용하는 필살기' : '선택하면 이 필살기를 쓴다';
  else info = '조작: ' + def.key;
  text(info, px + 10, py + 50, {color: C.Y});
  ctx.fillStyle = C.R; ctx.fillRect(px + 8, py + 65, pw - 16, 1);
  wrapPx(def.desc.join(' '), pw - 20).forEach((s, i) => text(s, px + 10, py + 72 + i * 14, {color: C.W}));
  // the trait this ability wears (U opens them)
  const tid = rowTrait(r);
  if (tid && un) {
    const tk = traitOf(tid);
    ctx.fillStyle = C.P; ctx.fillRect(px + 8, py + ph - 38, pw - 16, 1);
    text('특성', px + 10, py + ph - 34, {color: C.P});
    text(tk ? tk + '  ' + TRAITS[tid][tk].name + '  장착 중' : '없음  ·  U로 특성을 고른다', px + 40, py + ph - 34, {color: tk ? C.W : C.G3});
  }
  let hint = '';
  if (skPick) hint = 'A/D 교체할 슬롯 · J 결정 · K 취소';
  else if (!un) hint = CLASSES[def.cls].name + '가 되면 해금된다';
  else if (r.kind === 'skill') hint = (L.indexOf(r.id) >= 0 && L.indexOf(r.id) < n ? 'J 해제 · A/D 슬롯 이동' : 'J 장착') + (tid ? ' · U 특성' : '');
  else if (r.kind === 'ult') hint = isGod() ? 'J 이 필살기로 설정' : '블레이드 갓이 되면 고를 수 있다';
  else hint = tid ? '언제나 쓸 수 있다 · U 특성' : '슬롯 없이 언제나 쓸 수 있다';
  if (skMsg) text(skMsg.s, px + 10, py + ph - 20, {color: skMsg.bad ? C.R : C.Y});
  else text(hint, px + 10, py + ph - 20, {color: skPick ? C.Y : C.G3});
  if (skPick) { ctx.globalAlpha = 0.85; ctx.fillStyle = C.K; ctx.fillRect(px, py + 108, pw, 40); ctx.globalAlpha = 1; text(SKILLS[skPick.id].name + ' → 슬롯 ' + (skPick.slot + 1) + ' [' + SLOT_KEYS[skPick.slot] + ']', px + pw / 2, py + 114, {color: C.W, align: 'center'}); const old = L[skPick.slot]; text(old ? SKILLS[old].name + '을(를) 대신한다' : '빈 슬롯', px + pw / 2, py + 130, {color: C.G3, align: 'center'}); }
  if (skTrait) drawTraitPanel(px, py, pw, ph);
  text(skTrait ? 'W/S 특성 선택 · J 구매/장착/해제 · U/K 돌아가기' : 'W/S 선택 · Q/E 페이지 · J 장착/해제 · A/D 슬롯 이동 · U 특성 · Esc 돌아가기', 12, 258, {color: C.W});
}
/* the trait view: the two traits of the ability side by side (well, stacked), what each does, and what it costs */
function drawTraitPanel(px, py, pw, ph) {
  const T = skTrait, id = T.id, def = TRAITS[id], cost = traitCost(id), wear = traitOf(id);
  ctx.fillStyle = C.K; ctx.fillRect(px, py, pw, ph);
  ctx.strokeStyle = skFlash > 0 && (skFlash & 2) ? C.Y : C.P; ctx.lineWidth = 1; ctx.strokeRect(px + 1.5, py + 1.5, pw - 3, ph - 3);
  const row = rowOfTrait(id);
  text((row ? row : '') + '  특성', px + 10, py + 8, {sc: 2, color: C.W});
  text('골드 ' + fmt(save.gold), px + pw - 10, py + 12, {color: C.Y, align: 'right'});
  ['A', 'B'].forEach((k, i) => {
    const t = def[k], y = py + 32 + i * 64, sel = T.sel === i, own = traitOwned(id, k), on = wear === k;
    ctx.fillStyle = C.K; ctx.fillRect(px + 7, y, pw - 14, 60);
    ctx.strokeStyle = sel ? C.Y : on ? C.P : '#5a5a5a'; ctx.lineWidth = 1; ctx.strokeRect(px + 7.5, y + 0.5, pw - 15, 59);
    if (sel) { ctx.strokeRect(px + 9.5, y + 2.5, pw - 19, 55); menuArrow(px + 4, y + 30); }
    ctx.fillStyle = on ? C.P : own ? C.W : '#5a5a5a'; ctx.fillRect(px + 11, y + 4, 13, 12); text(k, px + 17.5, y + 5, {color: on ? C.W : C.K, align: 'center'});
    text(t.name, px + 30, y + 4, {color: sel ? C.Y : C.W});
    text(on ? '장착 중' : own ? '보유' : fmt(cost) + ' 골드', px + pw - 12, y + 4, {color: on ? C.P : own ? C.G3 : save.gold >= cost ? C.Y : C.R, align: 'right'});
    t.desc.forEach((s, j) => text(s, px + 12, y + 20 + j * 12, {color: C.G3}));
  });
  const T2 = def[T.sel ? 'B' : 'A'], k2 = T.sel ? 'B' : 'A';
  const act = !traitOwned(id, k2) ? 'J 구매하고 장착' : wear === k2 ? 'J 해제' : 'J 장착';
  if (skMsg) text(skMsg.s, px + 10, py + ph - 20, {color: skMsg.bad ? C.R : C.Y});
  else text(act + '  ·  ' + T2.name, px + 10, py + ph - 20, {color: C.G3});
}
// the name of the ability a trait set belongs to, for the header
function rowOfTrait(id) { return {combo: '5연타', just: '저스트 회피', pierce: '팬텀 피어스'}[id] || (SKILLS[id] ? SKILLS[id].name : ''); }
