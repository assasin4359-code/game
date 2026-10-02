// trailer runtime: injected into the debug build after the game scripts
window.__T = (() => {
  const T = {f: 0, log: [], mute: false, hideUI: true};

  /* ---- audio: log every sound call with the trailer frame it happened on (replayed offline later) ---- */
  const logWrap = (obj, name, tag) => { obj[name] = (...a) => { if (!T.mute) T.log.push([T.f, tag, a]); }; };
  for (const k of Object.keys(SND.sfx)) logWrap(SND.sfx, k, 'sfx.' + k);
  for (const k of ['chargeStart', 'chargeSet', 'chargeStop', 'muffle']) logWrap(SND, k, k);
  // the trailer owns the music
  SND.musicStart = () => {}; SND.musicStop = () => {};
  T.sfx = (name, ...a) => T.log.push([T.f, 'sfx.' + name, a]);

  /* ---- hide prompts that make no sense in a trailer ---- */
  const _text = text;
  text = function (s, x, y, o) {
    // the skip prompts, the credit counter and the rotating control tips along the bottom of a fight
    if (T.hideUI && (/ENTER|건너뛰기|크레딧/.test(String(s)) || (y === 255 && o && o.align === 'center'))) return 0;
    return _text(s, x, y, o);
  };

  /* ---- big crisp text (alpha-thresholded like the game's own Hangul) ---- */
  const tcache = new Map();
  function ttext(s, x, y, o) {
    const key = [s, o.font, o.color, o.outline || '', o.ow || 0].join('|');
    let r = tcache.get(key);
    if (!r) {
      const g0 = mk(8, 8).getContext('2d'); g0.font = o.font;
      const tw = Math.ceil(g0.measureText(s).width), px = parseInt(o.font.match(/(\d+)px/)[1]), pad = 4 + (o.ow || 0);
      const w = tw + pad * 2, h = Math.ceil(px * 1.4) + pad * 2, cv = mk(w, h), g = cv.getContext('2d', {willReadFrequently: true});
      g.font = o.font; g.textBaseline = 'top'; g.fillStyle = '#fff'; g.fillText(s, pad, pad);
      const d = g.getImageData(0, 0, w, h).data, m = new Uint8Array(w * h);
      for (let i = 0; i < w * h; i++) m[i] = d[i * 4 + 3] > 118 ? 1 : 0;
      const out = g.createImageData(w, h), q = out.data, cc = hexRGB(o.color), oc = o.outline ? hexRGB(o.outline) : null, ow = o.ow || 1;
      for (let yy = 0; yy < h; yy++) for (let xx = 0; xx < w; xx++) {
        const i = yy * w + xx; let c = null;
        if (m[i]) c = cc;
        else if (oc) { outer: for (let dy = -ow; dy <= ow; dy++) for (let dx = -ow; dx <= ow; dx++) { const X = xx + dx, Y = yy + dy; if (X >= 0 && Y >= 0 && X < w && Y < h && m[Y * w + X]) { c = oc; break outer; } } }
        if (c) { q[i * 4] = c[0]; q[i * 4 + 1] = c[1]; q[i * 4 + 2] = c[2]; q[i * 4 + 3] = 255; }
      }
      g.clearRect(0, 0, w, h); g.putImageData(out, 0, 0);
      r = {cv, w: tw, pad}; tcache.set(key, r);
    }
    if (o.align === 'center') x -= Math.floor(r.w / 2); else if (o.align === 'right') x -= r.w;
    ctx.drawImage(r.cv, Math.round(x) - r.pad, Math.round(y) - r.pad);
    return r.w;
  }
  T.ttext = ttext;
  const SERIF = px => `600 ${px}px "Cinzel", serif`;

  /* ---- the logo: BLADE SUMMONER with the slashed O, as on the title screen ---- */
  function logo(cx, y, px, a = 1) {
    const name = 'BLADE SUMMONER', f = SERIF(px), g = mk(8, 8).getContext('2d'); g.font = f;
    const tw = g.measureText(name).width, left = cx - tw / 2;
    ttext(name, cx, y, {font: f, color: C.W, outline: C.K, align: 'center'});
    const ox = left + g.measureText('BLADE SUMM').width + g.measureText('O').width / 2, k = px / 30;
    ctx.strokeStyle = C.R; ctx.lineWidth = 2.2 * k; ctx.lineCap = 'butt';
    ctx.beginPath(); ctx.moveTo(ox + 10 * k, y - 4 * k); ctx.lineTo(ox - 7 * k, y + 44 * k); ctx.stroke(); ctx.lineCap = 'round';
    const lw = Math.round((tw + 12) * a);
    ctx.fillStyle = C.R; ctx.fillRect(Math.round(cx - lw / 2), Math.round(y + px * 1.25), lw, 1);
    return tw;
  }

  /* ---- shots ---- */
  const ff = (n, fn) => { T.mute = true; for (let i = 0; i < n; i++) { fn && fn(i - n); update(); } T.mute = false; };
  const cam = {x: 240, y: 135, z: 1};
  function follow(s, snap) {
    const p = player, b = s.camOn === 'player' ? p : boss;
    let tx = (p.x + b.x) / 2, ty = (p.y + b.y) / 2 - 24;
    if (s.camOn === 'player') { tx = p.x + p.face * 30; ty = p.y - 30; }
    if (s.camX != null) tx = s.camX; if (s.camY != null) ty = s.camY;
    const k = snap ? 1 : 0.1; cam.x = lerp(cam.x, tx, k); cam.y = lerp(cam.y, ty, k);
  }
  const SHOTS = {
    opening: {
      setup(s) { save.opened = true; startOpening(false); ff(s.from); wipeT = 0; },
      step() { update(); render(); },
    },
    card: {
      setup() {},
      step(i, s) {
        ctx.fillStyle = C.K; ctx.fillRect(0, 0, W, H);
        const lines = s.lines, n = lines.length, sc = s.sc || 4, gap = sc >= 4 ? 34 : 24;
        let chars = s.type ? Math.floor((i - (s.typeDelay || 0)) / s.type) : 1e9;
        lines.forEach((L, k) => {
          const y = Math.round(135 - (n * gap) / 2 + k * gap + (gap - 26) / 2), str = chars > 0 ? L.slice(0, chars) : '';
          if (s.type && chars > 0 && chars <= L.length && (i - (s.typeDelay || 0)) % s.type === 0 && L[chars - 1] !== ' ') T.sfx('text');
          const col = (s.colors && s.colors[k]) || C.W;
          if (str) text(str, 240, y, {sc, color: i < 3 && !s.type ? C.R : col, align: 'center'});
          chars -= L.length + (s.lineGap || 12);
        });
        if (s.rule) { const u = easeOut(clamp(i / 14, 0, 1)), w = Math.round(150 * u); ctx.fillStyle = C.R; ctx.fillRect(240 - w, Math.round(135 + (n * gap) / 2 + 8), w * 2, 1); }
      },
    },
    black: { setup() {}, step() { ctx.fillStyle = C.K; ctx.fillRect(0, 0, W, H); } },
    title: {
      setup() { particles.length = 0; },
      step(i, s) {
        globalT++;
        drawStarfield(globalT, false, false);
        const tag = !!s.tag, top = tag ? 40 : 56, bh = tag ? 150 : 118, ly = tag ? 58 : 74, px = s.px || 38;
        ctx.globalAlpha = 0.72; ctx.fillStyle = C.K; ctx.fillRect(0, top, W, bh); ctx.globalAlpha = 1;
        ctx.fillStyle = C.R; ctx.fillRect(0, top, W, 1); ctx.fillRect(0, top + bh - 1, W, 1);
        const hit = s.hit ?? 8;
        if (i < hit) {
          // the draw: a red line tears across the screen just before the name lands
          ctx.fillStyle = C.K; ctx.fillRect(0, 0, W, H);
          const u = easeOut(i / hit), w = Math.round(W * u);
          ctx.fillStyle = C.R; ctx.fillRect(Math.round(240 - w / 2), 134, w, 2);
          ctx.fillStyle = C.W; ctx.fillRect(Math.round(240 - w / 4), 134, Math.round(w / 2), 1);
          return;
        }
        const k = i - hit, j = k < 14 ? Math.round(rnd(-1, 1) * (14 - k) / 4) : 0;
        ctx.save(); ctx.translate(j, -j);
        logo(240, ly, px, easeOut(clamp(k / 30, 0, 1)));
        ctx.restore();
        const sy = Math.round(ly + px * 1.25 + 8);
        if (k > 26) { const n = Math.floor((k - 26) / 2); text('블레이드 서머너  ·  사슬의 연대기'.slice(0, n), 240, sy, {sc: 2, color: C.W, align: 'center'}); }
        if (tag && k > (s.tagAt || 70)) { const u = k - (s.tagAt || 70); text(s.tag, 240, sy + 30, {sc: 4, color: u < 4 ? C.W : C.R, align: 'center'}); }
        if (s.foot && k > (s.footAt || 110)) {
          const y0 = s.credit ? 234 : 244, hide = T.hideUI;
          ctx.fillStyle = C.K; ctx.fillRect(0, y0, W, H - y0); ctx.fillStyle = C.R; ctx.fillRect(0, y0, W, 1);
          T.hideUI = false;   // our own captions, not the game's prompts
          text(s.foot, 240, y0 + 6, {color: C.W, align: 'center'});
          if (s.credit) text(s.credit, 240, y0 + 22, {color: C.W, align: 'center'});
          T.hideUI = hide;
        }
        if (k < 24) { ctx.globalAlpha = Math.pow(1 - k / 24, 1.5); ctx.fillStyle = C.W; ctx.fillRect(0, 0, W, H); ctx.globalAlpha = 1; }
      },
    },
    fight: {
      setup(s) {
        __D.setup(s.key, Object.assign({px: s.px, bx: s.bx}, s.opt || {}));
        settings.dmgNum = !!s.dmgNum;
        if (s.pre) s.pre();
        ff(s.warm || 0, i => __D.auto(i, s.plan || {}));
        follow(s, true);
      },
      step(i, s) {
        const slow = s.slow || 1;
        if (i % slow === 0) {
          const li = i / slow;
          if (s.each) s.each(li);
          __D.auto(li, s.plan || {});
          if (s.hpFloor != null && boss.hp > 0) boss.hp = Math.max(boss.hp, boss.maxHp * s.hpFloor);
          update();
        }
        render(); follow(s);
      },
    },
    scene: {
      // any of the game's own cinematic scenes, entered at sceneT = from
      setup(s) {
        __D.setup(s.key || 'bow', s.opt || {});
        settings.dmgNum = !!s.dmgNum;
        if (s.pre) s.pre();
        if (s.enter) s.enter(); else setScene(s.scene, s.from || 0);
        ff(s.warm || 0, s.auto ? i => __D.auto(i, s.plan || {}) : null);
        wipeT = 0; follow(s, true);
      },
      step(i, s) {
        const slow = s.slow || 1;
        if (i % slow === 0) { if (s.auto) __D.auto(i / slow, s.plan || {}); if (s.hpFloor != null && boss.hp > 0) boss.hp = Math.max(boss.hp, boss.maxHp * s.hpFloor); update(); }
        render(); if (s.z > 1) follow(s);
      },
    },
  };

  /* ---- composition: game frame -> fades -> dither -> camera crop into a 960x540 frame ---- */
  const out = mk(960, 540), og = out.getContext('2d');
  og.imageSmoothingEnabled = false;
  function overlays(s, i) {
    let a = 0, col = C.K;
    if (s.fadeIn && i < s.fadeIn) a = 1 - i / s.fadeIn;
    if (s.fadeOut && i >= s.len - s.fadeOut) a = Math.max(a, (i - (s.len - s.fadeOut) + 1) / s.fadeOut);
    if (a > 0) { ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = Math.min(1, a); ctx.fillStyle = col; ctx.fillRect(0, 0, W, H); ctx.globalAlpha = 1; }
    if (s.flashIn && i < s.flashIn) { ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1 - i / s.flashIn; ctx.fillStyle = s.flashCol || C.W; ctx.fillRect(0, 0, W, H); ctx.globalAlpha = 1; }
  }
  function compose(s) {
    const z = s.z || 1, sw = W / z, sh = H / z;
    const cx = z > 1 ? cam.x : 240, cy = z > 1 ? cam.y : 135;
    const sx = Math.round(clamp(cx - sw / 2, 0, W - sw)), sy = Math.round(clamp(cy - sh / 2, 0, H - sh));
    og.drawImage(view, sx, sy, sw, sh, 0, 0, 960, 540);
    if (s.bars) { og.fillStyle = '#000'; og.fillRect(0, 0, 960, s.bars); og.fillRect(0, 540 - s.bars, 960, s.bars); }
  }
  let seg = null;
  T.begin = (s) => {
    seg = s; T.f = s.f0;
    T.hideUI = s.hideUI !== false;
    (SHOTS[s.shot]).setup(s);
  };
  T.frames = (i0, n, fmt, every) => {
    const res = [];
    for (let i = i0; i < Math.min(seg.len, i0 + n); i++) {
      T.f = seg.f0 + i;
      ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1;
      SHOTS[seg.shot].step(i, seg);
      if (every && (seg.f0 + i) % every) { res.push(null); continue; }
      overlays(seg, i);
      present();
      compose(seg);
      res.push(out.toDataURL(fmt || 'image/png'));
    }
    return res;
  };
  T.takeLog = () => { const l = T.log; T.log = []; return l; };
  return T;
})();
