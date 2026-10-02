// in-page helpers for the trailer capture (injected after the game scripts)
window.__D = (() => {
  const held = new Set();
  let want = new Set(), taps = [];
  function setKeys(hold, tap) {
    for (const k of held) if (!hold.has(k)) { release(k); held.delete(k); }
    for (const k of hold) if (!held.has(k)) { press(k); held.add(k); }
    for (const k of tap) { if (held.has(k)) { release(k); held.delete(k); } press(k); setTimeoutish.push(k); }
  }
  const setTimeoutish = [];
  function flushTaps() { while (setTimeoutish.length) { const k = setTimeoutish.pop(); if (!held.has(k)) release(k); } }
  function setup(key, o = {}) {
    save = Object.assign(freshSave(), {lv: 999, cls: o.cls ?? 3, promoShown: o.cls ?? 3, tut: true, opened: true, clear: {1: 1, 2: 1, 3: 1, 4: 1}, souls: ['bow', 'gun', 'sword', 'chain'],
      loadout: o.loadout || ['blade', 'fury', 'peak', 'rain', 'flash'], ult: o.ult || 'god'});
    stage = STAGES.find(s => s.key === key);
    resetGame(); mode = 'fight'; boss.hidden = false;
    setScene('fight'); battleScene = 'fight'; fightT = o.fightT ?? 1500; bossIdle(o.idle ?? 40);
    if (o.phase2) { boss.phase = 2; bgMix = 1; for (const pl of platforms) { pl.grow = 1; pl.on = true; } }
    if (o.px != null) player.x = o.px;
    if (o.bx != null) boss.x = o.bx;
    flushTaps(); for (const k of [...held]) { release(k); held.delete(k); }
  }
  // a simple fighter: close the distance, chain the five-hit combo, sprinkle in dashes, jumps and the scripted skills
  function auto(i, plan = {}) {
    flushTaps();
    const p = player, tg = scene === 'mini' ? (mobs.find(m => m.hp > 0) || boss) : boss;
    if (plan.god !== false) { p.inv = Math.max(p.inv, 5000); p.hp = p.maxHp; }
    const hold = new Set(), tap = [];
    const act = plan.acts && plan.acts[i];
    const dx = tg.x - p.x, dist = Math.abs(dx), dirKey = dx > 0 ? 'right' : 'left';
    const near = plan.near ?? 44;
    if (plan.just && !act && p.state === 'normal' && p.dashCd <= 0 && threatNear(p)) { tap.push('dash'); setKeys(hold, tap); return; }
    if (act) {
      for (const a of [].concat(act)) {
        if (a === 'face') hold.add(dirKey);
        else if (a.startsWith('+')) hold.add(a.slice(1));
        else tap.push(a);
      }
    } else if (!plan.idle) {
      if (dist > near + 30 && (i % 50) === 7 && plan.dash !== false) { hold.add(dirKey); tap.push('dash'); }
      else if (dist > near) hold.add(dirKey);
      else { if (Math.sign(dx) !== p.face) hold.add(dirKey); if (i % (plan.atkEvery || 6) === 0) tap.push('attack'); }
    }
    if (plan.holds && plan.holds(i)) for (const k of plan.holds(i)) hold.add(k);
    setKeys(hold, tap);
  }
  return {setup, auto, setKeys, flushTaps};
})();
