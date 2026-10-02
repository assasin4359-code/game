'use strict';
const W = 480, H = 270, FLOOR = 240, GRAV = 0.28, TAU = Math.PI * 2;
const view = document.getElementById('screen');
const vctx = view.getContext('2d');
const work = document.createElement('canvas'); work.width = W; work.height = H;
const ctx = work.getContext('2d', { willReadFrequently: true });
const reduceMotion = !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);

/* ---------- math ---------- */
const rnd = (a = 1, b) => b === undefined ? Math.random() * a : a + Math.random() * (b - a);
const ri = (a, b) => Math.floor(rnd(a, b + 1));
const clamp = (v, a, b) => v < a ? a : v > b ? b : v;
const lerp = (a, b, t) => a + (b - a) * t;
const easeOut = t => 1 - (1 - t) * (1 - t);
const angDiff = (a, b) => { let d = a - b; while (d > Math.PI) d -= TAU; while (d < -Math.PI) d += TAU; return d; };
const fmt = n => Math.round(n).toLocaleString('en-US');
const overlap = (a, b) => a[0] < b[2] && a[2] > b[0] && a[1] < b[3] && a[3] > b[1];
function seeded(a) { return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
function mk(w = W, h = H) { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; }

/* ---------- palette + ordered dither post-process ----------
   Everything is drawn freely in full color, then every frame is snapped to an
   8-color palette with a 4x4 Bayer matrix, which gives the 1-bit dithered look. */
const PAL = [[255,255,255],[0,0,0],[228,20,36],[10,92,40],[46,158,82],[156,226,180],[255,222,40],[110,30,150],[36,64,200]];
const C = { W:'#ffffff', K:'#000000', R:'#e41424', G1:'#0a5c28', G2:'#2e9e52', G3:'#9ce2b4', Y:'#ffde28', P:'#6e1e96', B:'#2440c8' };
const PAL32 = new Uint32Array(PAL.length);
PAL.forEach(([r, g, b], i) => { PAL32[i] = ((255 << 24) | (b << 16) | (g << 8) | r) >>> 0; });
const BAYER = new Uint8Array([0,8,2,10,12,4,14,6,3,11,1,9,15,7,13,5]);
const LUT = new Uint32Array(32768);
(function buildLUT() {
  const n = PAL.length, pairs = [];
  for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) {
    const a = PAL[i], c = PAL[j], dx = c[0] - a[0], dy = c[1] - a[1], dz = c[2] - a[2];
    pairs.push([i, j, a[0], a[1], a[2], dx, dy, dz, dx * dx + dy * dy + dz * dz]);
  }
  for (let r = 0; r < 32; r++) for (let g = 0; g < 32; g++) for (let b = 0; b < 32; b++) {
    const R = (r << 3) | (r >> 2), G = (g << 3) | (g >> 2), B = (b << 3) | (b >> 2);
    let best = Infinity, bi = 0, bj = 0, bt = 0;
    for (let k = 0; k < pairs.length; k++) {
      const q = pairs[k];
      let t = ((R - q[2]) * q[5] + (G - q[3]) * q[6] + (B - q[4]) * q[7]) / q[8];
      t = t < 0 ? 0 : t > 1 ? 1 : t;
      const ex = q[2] + q[5] * t - R, ey = q[3] + q[6] * t - G, ez = q[4] + q[7] * t - B;
      const d = ex * ex + ey * ey + ez * ez;
      if (d < best) { best = d; bi = q[0]; bj = q[1]; bt = t; }
    }
    let tq = Math.round(bt * 16);
    if (tq <= 1) tq = 0; else if (tq >= 15) tq = 16;
    LUT[(r << 10) | (g << 5) | b] = bi | (bj << 4) | (tq << 8);
  }
})();
const outImg = vctx.createImageData(W, H), out32 = new Uint32Array(outImg.data.buffer);
function present() {
  const src = ctx.getImageData(0, 0, W, H).data;
  for (let y = 0, i = 0, p = 0; y < H; y++) {
    const by = (y & 3) << 2;
    for (let x = 0; x < W; x++, i++, p += 4) {
      const e = LUT[((src[p] >> 3) << 10) | ((src[p + 1] >> 3) << 5) | (src[p + 2] >> 3)];
      out32[i] = PAL32[((e >> 8) > BAYER[by | (x & 3)]) ? (e >> 4) & 15 : e & 15];
    }
  }
  vctx.putImageData(outImg, 0, 0);
}

/* ---------- 5x7 bitmap font ---------- */
const FONT_SRC = {
  'A':'01110 10001 10001 11111 10001 10001 10001','B':'11110 10001 10001 11110 10001 10001 11110',
  'C':'01110 10001 10000 10000 10000 10001 01110','D':'11100 10010 10001 10001 10001 10010 11100',
  'E':'11111 10000 10000 11110 10000 10000 11111','F':'11111 10000 10000 11110 10000 10000 10000',
  'G':'01110 10001 10000 10111 10001 10001 01111','H':'10001 10001 10001 11111 10001 10001 10001',
  'I':'01110 00100 00100 00100 00100 00100 01110','J':'00111 00010 00010 00010 00010 10010 01100',
  'K':'10001 10010 10100 11000 10100 10010 10001','L':'10000 10000 10000 10000 10000 10000 11111',
  'M':'10001 11011 10101 10101 10001 10001 10001','N':'10001 10001 11001 10101 10011 10001 10001',
  'O':'01110 10001 10001 10001 10001 10001 01110','P':'11110 10001 10001 11110 10000 10000 10000',
  'Q':'01110 10001 10001 10001 10101 10010 01101','R':'11110 10001 10001 11110 10100 10010 10001',
  'S':'01111 10000 10000 01110 00001 00001 11110','T':'11111 00100 00100 00100 00100 00100 00100',
  'U':'10001 10001 10001 10001 10001 10001 01110','V':'10001 10001 10001 10001 10001 01010 00100',
  'W':'10001 10001 10001 10101 10101 10101 01010','X':'10001 10001 01010 00100 01010 10001 10001',
  'Y':'10001 10001 10001 01010 00100 00100 00100','Z':'11111 00001 00010 00100 01000 10000 11111',
  '0':'01110 10001 10011 10101 11001 10001 01110','1':'00100 01100 00100 00100 00100 00100 01110',
  '2':'01110 10001 00001 00010 00100 01000 11111','3':'11111 00010 00100 00010 00001 10001 01110',
  '4':'00010 00110 01010 10010 11111 00010 00010','5':'11111 10000 11110 00001 00001 10001 01110',
  '6':'00110 01000 10000 11110 10001 10001 01110','7':'11111 00001 00010 00100 01000 01000 01000',
  '8':'01110 10001 10001 01110 10001 10001 01110','9':'01110 10001 10001 01111 00001 00010 01100',
  '.':'00000 00000 00000 00000 00000 01100 01100',',':'00000 00000 00000 00000 01100 00100 01000',
  '!':'00100 00100 00100 00100 00100 00000 00100','?':'01110 10001 00001 00010 00100 00000 00100',
  ':':'00000 01100 01100 00000 01100 01100 00000','/':'00001 00001 00010 00100 01000 10000 10000',
  '-':'00000 00000 00000 11111 00000 00000 00000','+':'00000 00100 00100 11111 00100 00100 00000',
  '%':'11000 11001 00010 00100 01000 10011 00011',"'":'00100 00100 01000 00000 00000 00000 00000',
  '(':'00010 00100 01000 01000 01000 00100 00010',')':'01000 00100 00010 00010 00010 00100 01000',
  '>':'01000 00100 00010 00001 00010 00100 01000','<':'00010 00100 01000 10000 01000 00100 00010',
  '=':'00000 00000 11111 00000 11111 00000 00000','[':'01110 01000 01000 01000 01000 01000 01110',
  ']':'01110 00010 00010 00010 00010 00010 01110','*':'00000 10101 01110 11111 01110 10101 00000',
  ';':'00000 01100 01100 00000 01100 00100 01000',
  ' ':'00000 00000 00000 00000 00000 00000 00000',
};
const GLYPH = {};
for (const k in FONT_SRC) GLYPH[k] = FONT_SRC[k].split(' ').map(s => parseInt(s, 2));
function rawText(s, x, y, sc, italic) {
  for (let i = 0; i < s.length; i++) {
    const g = GLYPH[s[i]] || GLYPH[' '], gx = x + i * 6 * sc;
    for (let r = 0; r < 7; r++) {
      const row = g[r]; if (!row) continue;
      const ix = italic ? Math.round((6 - r) * sc * 0.4) : 0;
      let c = 0;
      while (c < 5) {
        if (row & (16 >> c)) { let e = c; while (e < 5 && (row & (16 >> e))) e++; ctx.fillRect(gx + c * sc + ix, y + r * sc, (e - c) * sc, sc); c = e; }
        else c++;
      }
    }
  }
}
/* Hangul: rendered with a real font, then alpha-thresholded into a hard 1-bit mask so it
   matches the bitmap look. Cached per string/size/color. */
const KFONT_SMALL = '"Nanum Gothic Coding", "Malgun Gothic", "Apple SD Gothic Neo", sans-serif';
const KFONT_BIG = '"Do Hyeon", "Black Han Sans", "Malgun Gothic", "Apple SD Gothic Neo", sans-serif';
const kcache = new Map(), kmeas = document.createElement('canvas').getContext('2d');
function kfont(sc) {
  if (sc === 'serif') return {font: '600 30px "Cinzel", "Trajan Pro", "Times New Roman", serif', px: 30};
  if (sc <= 1) return {font: '400 11px ' + KFONT_SMALL, px: 11};
  if (sc === 2) return {font: '700 14px ' + KFONT_SMALL, px: 14};
  const px = [20, 26, 32, 40][Math.min(6, sc) - 3];
  return {font: px + 'px ' + KFONT_BIG, px};
}
function kWidth(s, sc = 1) { kmeas.font = kfont(sc).font; return Math.ceil(kmeas.measureText(s).width); }
const hexRGB = h => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
function kRender(s, sc, color, outline, italic) {
  const key = s + '\u0001' + sc + color + (outline || '') + (italic ? 'i' : '');
  let r = kcache.get(key); if (r) return r;
  const f = kfont(sc), pad = 3, tw = kWidth(s, sc);
  const w = tw + pad * 2 + (italic ? Math.ceil(f.px * 0.3) : 0), h = Math.ceil(f.px * 1.35) + pad * 2;
  const cv = mk(w, h), g = cv.getContext('2d', { willReadFrequently: true });
  g.font = f.font; g.textBaseline = 'top'; g.fillStyle = '#fff';
  if (italic) g.setTransform(1, 0, -0.22, 1, f.px * 0.28, 0);
  g.fillText(s, pad, pad);
  g.setTransform(1, 0, 0, 1, 0, 0);
  const d = g.getImageData(0, 0, w, h).data, mask = new Uint8Array(w * h), th = sc <= 1 ? 100 : 118;
  for (let i = 0; i < w * h; i++) mask[i] = d[i * 4 + 3] > th ? 1 : 0;
  const out = g.createImageData(w, h), o = out.data, cc = hexRGB(color), oc = outline ? hexRGB(outline) : null;
  const put = (i, c) => { o[i * 4] = c[0]; o[i * 4 + 1] = c[1]; o[i * 4 + 2] = c[2]; o[i * 4 + 3] = 255; };
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const i = y * w + x;
    if (mask[i]) { put(i, cc); continue; }
    if (!oc) continue;
    let near = false;
    for (let dy = -1; dy <= 1 && !near; dy++) for (let dx = -1; dx <= 1; dx++) {
      const xx = x + dx, yy = y + dy;
      if (xx >= 0 && yy >= 0 && xx < w && yy < h && mask[yy * w + xx]) { near = true; break; }
    }
    if (near) put(i, oc);
  }
  g.clearRect(0, 0, w, h); g.putImageData(out, 0, 0);
  r = {cv, w: tw, pad};
  if (kcache.size > 700) kcache.clear();
  kcache.set(key, r);
  return r;
}
function ktext(s, x, y, o) {
  const sc = o.sc || 1, r = kRender(s, sc, o.color || C.K, o.outline, o.italic);
  if (o.align === 'center') x -= Math.floor(r.w / 2); else if (o.align === 'right') x -= r.w;
  ctx.drawImage(r.cv, Math.round(x) - r.pad, Math.round(y) - r.pad - (sc <= 1 ? 2 : 1));
  return r.w;
}
function wrapPx(s, maxW, sc = 1) {
  const out = []; let line = '';
  for (const w of s.split(' ')) { const t = line ? line + ' ' + w : w; if (line && kWidth(t, sc) > maxW) { out.push(line); line = w; } else line = t; }
  if (line) out.push(line);
  return out;
}
if (document.fonts && document.fonts.load) {
  Promise.all(['400 11px "Nanum Gothic Coding"', '700 14px "Nanum Gothic Coding"', '20px "Do Hyeon"', '600 30px "Cinzel"'].map(f => document.fonts.load(f, '가나다ABC')))
    .then(() => kcache.clear()).catch(() => {});
}
function text(s, x, y, o = {}) {
  s = String(s);
  if (/[^\x00-\x7f]/.test(s)) return ktext(s, x, y, o);
  s = s.toUpperCase();
  const sc = o.sc || 1, w = s.length * 6 * sc - sc;
  if (o.align === 'center') x -= Math.floor(w / 2); else if (o.align === 'right') x -= w;
  x = Math.round(x); y = Math.round(y);
  const it = !!o.italic;
  if (o.outline) {
    ctx.fillStyle = o.outline;
    const ow = o.ow || 1;
    for (let dy = -ow; dy <= ow; dy++) for (let dx = -ow; dx <= ow; dx++) if (dx || dy) rawText(s, x + dx, y + dy, sc, it);
  }
  ctx.fillStyle = o.color || C.K;
  rawText(s, x, y, sc, it);
  return w;
}
function wrapText(s, max) {
  const out = []; let line = '';
  for (const w of s.split(' ')) { if ((line + ' ' + w).trim().length > max) { out.push(line); line = w; } else line = (line + ' ' + w).trim(); }
  if (line) out.push(line);
  return out;
}

/* ---------- input ---------- */
const keys = Object.create(null), pressed = Object.create(null), NOKEYS = Object.freeze({});
const KEYMAP = {
  ArrowLeft:'left', KeyA:'left', ArrowRight:'right', KeyD:'right', ArrowUp:'jump', KeyW:'jump', Space:'jump',
  ArrowDown:'down', KeyS:'down', KeyJ:'attack', KeyZ:'attack', KeyK:'dash', KeyX:'dash', ShiftLeft:'dash', ShiftRight:'dash',
  // skill slots 1-5 (what each holds is set in the skill screen); C / Q / E mirror the first three for the left hand
  KeyL:'slot0', KeyC:'slot0', KeyI:'slot1', KeyQ:'slot1', KeyO:'slot2', KeyE:'slot2', KeyH:'slot3', KeyN:'slot4', KeyU:'special', KeyV:'special', Enter:'start', NumpadEnter:'start', KeyM:'mute', KeyP:'pause', Escape:'pause',
};
function press(a) { if (!keys[a]) pressed[a] = true; keys[a] = true; }
function release(a) { keys[a] = false; }
addEventListener('keydown', e => { const a = KEYMAP[e.code]; if (!a) return; e.preventDefault(); SND.unlock(); if (!e.repeat) press(a); });
addEventListener('keyup', e => { const a = KEYMAP[e.code]; if (!a) return; e.preventDefault(); release(a); });
addEventListener('blur', () => { for (const k in keys) keys[k] = false; });
const confirmP = () => !!(pressed.start || pressed.attack);

/* ---------- settings (saved per browser) ---------- */
const DIFF = [
  {name: '쉬움', dmg: 0.6, hp: 0.75, tempo: 1.3, desc: '받는 피해 -40% · 보스 체력 -25% · 보스 공격 간격 넓음'},
  {name: '보통', dmg: 1, hp: 1, tempo: 1, desc: '기본 난이도'},
  {name: '어려움', dmg: 1.4, hp: 1.2, tempo: 0.8, desc: '받는 피해 +40% · 보스 체력 +20% · 보스 공격 간격 좁음'},
];
const settings = {diff: 1, sfx: 8, mus: 7, shake: true, dmgNum: true};
try { Object.assign(settings, JSON.parse(localStorage.getItem('bladesummoner_settings') || '{}')); } catch (e) {}
settings.diff = clamp(settings.diff | 0, 0, 2);
function saveSettings() { try { localStorage.setItem('bladesummoner_settings', JSON.stringify(settings)); } catch (e) {} }

/* ---------- audio (all synthesized) ---------- */
const mtof = m => 440 * Math.pow(2, (m - 69) / 12);
const SND = (() => {
  // lp + duck sit between the master and the speakers, so the whole mix can be muffled or silenced (일검무귀);
  // direct skips them, for the one sound that must cut through the silence
  let ac = null, master = null, sfxBus = null, musBus = null, noiseBuf = null, muted = false, sfxVol = 1, musVol = 1, lp = null, duck = null, direct = null;
  function setVolumes(s, m) { sfxVol = s; musVol = m; if (sfxBus) sfxBus.gain.value = 0.6 * s; if (musBus) musBus.gain.value = 0.26 * m; }
  try { muted = localStorage.getItem('bladesummoner_muted') === '1'; } catch (e) {}
  function unlock() {
    if (ac) { if (ac.state === 'suspended') ac.resume(); return; }
    const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return;
    try { ac = new AC(); } catch (e) { return; }
    master = ac.createGain(); master.gain.value = muted ? 0 : 0.55;
    lp = ac.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 20000; lp.Q.value = 0.7;
    duck = ac.createGain(); duck.gain.value = 1;
    master.connect(lp); lp.connect(duck); duck.connect(ac.destination);
    direct = ac.createGain(); direct.gain.value = muted ? 0 : 0.55; direct.connect(ac.destination);
    sfxBus = ac.createGain(); sfxBus.gain.value = 0.6 * sfxVol; sfxBus.connect(master);
    musBus = ac.createGain(); musBus.gain.value = 0.26 * musVol; musBus.connect(master);
    noiseBuf = ac.createBuffer(1, ac.sampleRate, ac.sampleRate);
    const d = noiseBuf.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  }
  function tone(o) {
    if (!ac) return;
    const t = o.at != null ? o.at : ac.currentTime + (o.when || 0), dur = o.dur || 0.1, vol = o.vol != null ? o.vol : 0.2;
    const osc = ac.createOscillator(), g = ac.createGain();
    osc.type = o.type || 'square';
    osc.frequency.setValueAtTime(o.f, t);
    if (o.f2) osc.frequency.exponentialRampToValueAtTime(Math.max(20, o.f2), t + dur);
    g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(vol, t + 0.004); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    osc.connect(g); g.connect(o.bus || sfxBus); osc.start(t); osc.stop(t + dur + 0.03);
  }
  function noise(o) {
    if (!ac) return;
    const t = o.at != null ? o.at : ac.currentTime + (o.when || 0), dur = o.dur || 0.1, vol = o.vol != null ? o.vol : 0.2;
    const src = ac.createBufferSource(); src.buffer = noiseBuf; src.loop = true;
    const f = ac.createBiquadFilter(); f.type = o.ft || 'bandpass'; f.Q.value = o.q != null ? o.q : 1;
    f.frequency.setValueAtTime(o.f || 2000, t);
    if (o.f2) f.frequency.exponentialRampToValueAtTime(Math.max(30, o.f2), t + dur);
    const g = ac.createGain();
    g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(vol, t + 0.004); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    src.connect(f); f.connect(g); g.connect(o.bus || sfxBus); src.start(t, Math.random() * 0.5); src.stop(t + dur + 0.03);
  }
  const sfx = {
    slash() { noise({dur:0.09, vol:0.3, f:5200, f2:900, q:0.9}); tone({type:'square', f:820, f2:260, dur:0.07, vol:0.05}); },
    // hit: a heavy body thump, a wet burst that snaps shut, scattered splatter and a bone crunch
    hit(crit) {
      tone({type:'sine', f:crit ? 150 : 120, f2:36, dur:crit ? 0.24 : 0.16, vol:crit ? 0.6 : 0.48});
      noise({dur:crit ? 0.24 : 0.15, vol:crit ? 0.55 : 0.42, f:crit ? 3400 : 2600, f2:160, ft:'lowpass', q:0.9});
      tone({type:'square', f:crit ? 95 : 115, f2:48, dur:0.06, vol:0.14});
      for (let i = 0; i < (crit ? 5 : 3); i++) noise({dur:0.035, vol:crit ? 0.22 : 0.16, f:rnd(1400, 4200), q:3.5, when:0.018 + i * 0.022});
      if (crit) { tone({type:'sawtooth', f:70, f2:28, dur:0.32, vol:0.22, when:0.01}); noise({dur:0.3, vol:0.25, f:900, f2:120, ft:'lowpass', when:0.03}); }
    },
    arrow() { noise({dur:0.07, vol:0.1, f:6500, f2:2600, q:2.5}); tone({type:'triangle', f:1500, f2:620, dur:0.06, vol:0.05}); },
    jump() { tone({type:'square', f:320, f2:720, dur:0.09, vol:0.07}); },
    land() { noise({dur:0.18, vol:0.35, f:500, f2:80, ft:'lowpass'}); tone({type:'sine', f:110, f2:40, dur:0.2, vol:0.35}); },
    dash() { noise({dur:0.16, vol:0.22, f:700, f2:3200, q:0.8}); },
    hurt() { tone({type:'sawtooth', f:420, f2:70, dur:0.26, vol:0.18}); noise({dur:0.14, vol:0.25, f:700, ft:'lowpass'}); },
    parry() { tone({type:'square', f:1900, f2:1300, dur:0.08, vol:0.1}); tone({type:'triangle', f:2800, dur:0.14, vol:0.07, when:0.01}); },
    blade() { tone({type:'square', f:440, f2:1320, dur:0.16, vol:0.07}); tone({type:'triangle', f:660, f2:1980, dur:0.2, vol:0.05, when:0.05}); },
    bladeFire() { noise({dur:0.07, vol:0.12, f:4200, f2:1600, q:1.2}); },
    text() { tone({type:'square', f:900, dur:0.022, vol:0.035}); },
    select() { tone({type:'square', f:660, dur:0.06, vol:0.09}); tone({type:'square', f:990, dur:0.09, vol:0.09, when:0.06}); },
    warn() { tone({type:'square', f:1250, dur:0.05, vol:0.06}); tone({type:'square', f:1250, dur:0.05, vol:0.06, when:0.09}); },
    beep() { tone({type:'square', f:1600, dur:0.03, vol:0.04}); },
    beam() { noise({dur:0.4, vol:0.32, f:3200, f2:300, q:0.6}); tone({type:'sawtooth', f:1000, f2:90, dur:0.38, vol:0.1}); },
    vine() { noise({dur:0.22, vol:0.2, f:250, f2:1400, ft:'lowpass'}); },
    boom() { tone({type:'sine', f:130, f2:28, dur:0.7, vol:0.5}); noise({dur:0.6, vol:0.38, f:900, f2:90, ft:'lowpass'}); },
    brk() { tone({type:'square', f:200, f2:900, dur:0.18, vol:0.1}); noise({dur:0.25, vol:0.25, f:2000, f2:400}); },
    powerup() { for (let i = 0; i < 5; i++) tone({type:'square', f:330 * Math.pow(1.26, i), dur:0.12, vol:0.08, when:i * 0.06}); },
    special() { noise({dur:0.5, vol:0.3, f:300, f2:5000, q:0.7}); tone({type:'sawtooth', f:110, f2:880, dur:0.5, vol:0.1}); },
    tick() { tone({type:'square', f:520, dur:0.07, vol:0.08}); },
    death() { for (let i = 0; i < 4; i++) tone({type:'square', f:440 / Math.pow(1.19, i), dur:0.18, vol:0.08, when:i * 0.14}); },
    coin() { tone({type:'square', f:1320, dur:0.05, vol:0.06}); tone({type:'square', f:1760, dur:0.1, vol:0.06, when:0.05}); },
    rumble() { noise({dur:1.6, vol:0.3, f:180, f2:60, ft:'lowpass'}); },
    pierce() { tone({type:'square', f:2400, f2:700, dur:0.12, vol:0.08}); noise({dur:0.14, vol:0.28, f:6000, f2:1500, q:1.5}); tone({type:'sawtooth', f:180, f2:90, dur:0.1, vol:0.08}); },
    whoosh() { noise({dur:0.22, vol:0.3, f:400, f2:2600, q:0.6}); tone({type:'sawtooth', f:220, f2:70, dur:0.2, vol:0.06}); },
    impact() { tone({type:'sine', f:95, f2:28, dur:0.4, vol:0.5}); noise({dur:0.3, vol:0.35, f:800, f2:70, ft:'lowpass'}); tone({type:'square', f:160, f2:60, dur:0.12, vol:0.12}); },
    rise() { tone({type:'square', f:260, f2:1300, dur:0.18, vol:0.08}); noise({dur:0.2, vol:0.2, f:600, f2:4000, q:0.8}); },
    swordfall() { tone({type:'triangle', f:2200, f2:300, dur:0.3, vol:0.07}); },
    cyclone() { noise({dur:0.9, vol:0.18, f:300, f2:2400, q:1.5}); },
    jingle() { [72,76,79,84,79,84,88].forEach((m, i, a) => tone({type:'square', f:mtof(m), dur:i === a.length - 1 ? 0.5 : 0.12, vol:0.08, when:i * 0.11})); },
    // just dodge: a glassy chime, then the world winds down
    just() {
      tone({type:'triangle', f:2640, f2:1980, dur:0.22, vol:0.12}); tone({type:'sine', f:1320, dur:0.4, vol:0.1, when:0.02});
      tone({type:'sawtooth', f:320, f2:45, dur:0.7, vol:0.12, when:0.04}); noise({dur:0.5, vol:0.18, f:2400, f2:200, q:0.6, when:0.02});
    },
    counter() { noise({dur:0.14, vol:0.4, f:7000, f2:900, q:0.8}); tone({type:'square', f:1800, f2:300, dur:0.12, vol:0.1}); tone({type:'sine', f:90, f2:30, dur:0.35, vol:0.5}); },
    gun() { noise({dur:0.07, vol:0.3, f:3200, f2:500, q:0.7}); tone({type:'square', f:190, f2:55, dur:0.07, vol:0.12}); },
    shotgun() { noise({dur:0.22, vol:0.45, f:2200, f2:180, q:0.5}); tone({type:'sine', f:110, f2:35, dur:0.25, vol:0.4}); },
    pump() { tone({type:'square', f:420, dur:0.03, vol:0.06}); tone({type:'square', f:300, dur:0.04, vol:0.06, when:0.09}); },
    rocket() { noise({dur:0.45, vol:0.22, f:600, f2:2600, q:0.6}); tone({type:'sawtooth', f:140, f2:90, dur:0.4, vol:0.06}); },
    explode() { tone({type:'sine', f:120, f2:30, dur:0.5, vol:0.55}); noise({dur:0.45, vol:0.45, f:1800, f2:120, ft:'lowpass'}); noise({dur:0.12, vol:0.3, f:4000, q:0.8, when:0.01}); },
    reflect() { tone({type:'square', f:2600, f2:3400, dur:0.08, vol:0.1}); tone({type:'triangle', f:3900, dur:0.2, vol:0.07, when:0.03}); noise({dur:0.1, vol:0.2, f:6000, q:2}); },
    gold() { for (let i = 0; i < 6; i++) tone({type:'triangle', f:880 * Math.pow(1.19, i), dur:0.08, vol:0.05, when:i * 0.05}); },
    buy() { tone({type:'square', f:1320, dur:0.05, vol:0.07}); tone({type:'square', f:1760, dur:0.06, vol:0.07, when:0.05}); tone({type:'square', f:2640, dur:0.18, vol:0.06, when:0.11}); },
    deny() { tone({type:'square', f:160, dur:0.1, vol:0.1}); tone({type:'square', f:120, dur:0.14, vol:0.1, when:0.1}); },
    // the draw: a thin steel ring over a hiss that snaps shut
    iai() { noise({dur:0.12, vol:0.35, f:9000, f2:1800, q:1.2}); tone({type:'square', f:3200, f2:700, dur:0.07, vol:0.07}); tone({type:'sine', f:1760, dur:0.45, vol:0.06, when:0.03}); tone({type:'sine', f:2637, dur:0.3, vol:0.03, when:0.03}); },
    sheath() { tone({type:'square', f:2300, dur:0.02, vol:0.06}); tone({type:'square', f:1500, dur:0.03, vol:0.07, when:0.06}); },
    heart() { tone({type:'sine', f:72, f2:40, dur:0.16, vol:0.6}); tone({type:'sine', f:62, f2:34, dur:0.22, vol:0.45, when:0.2}); },
    // a chain snapping taut: rattling links over a low iron clank
    chain() { for (let i = 0; i < 4; i++) noise({dur:0.03, vol:0.2, f:rnd(2500, 4500), q:4, when:i * 0.025}); tone({type:'square', f:220, f2:110, dur:0.12, vol:0.12}); tone({type:'triangle', f:1400, dur:0.1, vol:0.05, when:0.04}); },
    // 일검무귀's cut: a thin steel ring heard through dead silence (bypasses the muffle)
    // 일검무귀 · 혈: the hero's heartbeat, the only thing still heard while the world is muffled and silenced
    heartD(k = 1) { const v = sfxVol * k; tone({type:'sine', f:70, f2:38, dur:0.18, vol:0.7 * v, bus:direct}); tone({type:'sine', f:60, f2:32, dur:0.24, vol:0.5 * v, when:0.19, bus:direct}); noise({dur:0.08, vol:0.12 * v, f:300, ft:'lowpass', bus:direct}); },
    // 천지검명: every blade on the field ringing at once
    chime() { for (const [f, w] of [[1760, 0], [2637, 0.04], [3520, 0.08], [1318, 0.02]]) tone({type:'sine', f, dur:1.1, vol:0.05, when:w}); tone({type:'triangle', f:880, dur:0.8, vol:0.04}); },
    // ...and the click of the guard as the hero, back turned, lowers the blade (also through the silence)
    clickD() { const v = sfxVol; tone({type:'square', f:2300, dur:0.02, vol:0.08 * v, bus:direct}); tone({type:'square', f:1500, dur:0.035, vol:0.09 * v, when:0.07, bus:direct}); tone({type:'sine', f:3100, dur:0.25, vol:0.03 * v, when:0.07, bus:direct}); },
    edge() { const v = sfxVol; tone({type:'sine', f:3520, dur:0.9, vol:0.05 * v, bus:direct}); tone({type:'triangle', f:1760, dur:0.6, vol:0.04 * v, bus:direct}); noise({dur:0.08, vol:0.14 * v, f:9000, f2:4000, q:1.5, bus:direct}); },
    fanfare() { [67,72,76,79,76,79,84].forEach((m, i, a) => { tone({type:'square', f:mtof(m), dur:i === a.length - 1 ? 0.7 : 0.1, vol:0.08, when:i * 0.09}); tone({type:'triangle', f:mtof(m - 12), dur:i === a.length - 1 ? 0.7 : 0.1, vol:0.06, when:i * 0.09}); }); },
  };
  let chargeOsc = null, chargeGain = null;
  function chargeStart() {
    if (!ac || chargeOsc) return;
    chargeOsc = ac.createOscillator(); chargeOsc.type = 'sawtooth'; chargeOsc.frequency.value = 110;
    const lp = ac.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 1400;
    chargeGain = ac.createGain(); chargeGain.gain.value = 0.05;
    chargeOsc.connect(lp); lp.connect(chargeGain); chargeGain.connect(sfxBus); chargeOsc.start();
  }
  function chargeSet(k) { if (chargeOsc) chargeOsc.frequency.setTargetAtTime(110 + k * 520, ac.currentTime, 0.03); }
  function chargeStop() { if (!chargeOsc) return; try { chargeGain.gain.setTargetAtTime(0.0001, ac.currentTime, 0.02); chargeOsc.stop(ac.currentTime + 0.12); } catch (e) {} chargeOsc = null; }
  /* k: 0 clear, 1 muffled (dull and quieter, as if under water), 2 dead silence */
  function muffle(k, tc = 0.12) {
    if (!ac || !lp) return;
    const t = ac.currentTime, f = k <= 0 ? 20000 : 20000 * Math.pow(350 / 20000, Math.min(1, k)), g = k >= 2 ? 0.0001 : 1 - Math.min(1, k) * 0.45;
    lp.frequency.cancelScheduledValues(t); lp.frequency.setTargetAtTime(f, t, tc);
    duck.gain.cancelScheduledValues(t); duck.gain.setTargetAtTime(g, t, tc);
  }

  /* music: Em - C - D - B loop; phase 2 adds a lead line, snare and tempo */
  const CHORDS = [[40,52,55,59],[36,48,52,55],[38,50,54,57],[35,47,51,54]];
  const LEAD = [76,0,0,0,79,0,76,0,83,0,81,0,79,0,78,0, 76,0,0,0,79,0,84,0,83,0,79,0,76,0,0,0,
                78,0,0,0,81,0,86,0,84,0,81,0,78,0,81,0, 83,0,81,0,78,0,75,0,71,0,75,0,78,0,83,0];
  let musOn = false, step = 0, nextT = 0, timer = null, intense = false, calm = false, gun = false, sword = false, chain = false;
  const spb = () => 60 / (calm ? 104 : gun ? (intense ? 178 : 160) : sword ? (intense ? 160 : 136) : chain ? (intense ? 170 : 150) : intense ? 172 : 152) / 4;
  /* final boss: Cm - Ab - Bb - G, an organ pad, pounding eighth-note bass and a dramatic lead with the leading tone */
  const CH_CHORDS = [[36,48,51,55],[32,44,48,51],[34,46,50,53],[31,43,47,50]];
  const CH_LEAD = [72,0,0,75,0,0,79,0,78,0,79,0,75,0,72,0, 68,0,0,72,0,0,75,0,80,0,79,0,75,0,72,0,
                   70,0,0,74,0,0,77,0,82,0,80,0,77,0,74,0, 71,0,74,0,77,0,79,0,83,0,0,0,79,0,74,71];
  function playChain(s, t) {
    const i = s % 16, ch = CH_CHORDS[Math.floor(s / 16) % 4], d = spb();
    if (i % 2 === 0) tone({type:'square', f:mtof(ch[0] + (i % 4 === 2 ? 12 : 0)), dur:d * 1.5, vol:0.14, at:t, bus:musBus});
    if (i % 8 === 0) for (const n of ch.slice(1)) tone({type:'sawtooth', f:mtof(n + 12), dur:d * 7.5, vol:0.028, at:t, bus:musBus});
    if (i % 4 === 0 || (intense && i === 10)) tone({type:'sine', f:140, f2:38, dur:0.14, vol:0.55, at:t, bus:musBus});
    if (i === 4 || i === 12) noise({dur:0.12, vol:0.26, f:1700, q:0.7, at:t, bus:musBus});
    if (intense || i % 2 === 0) noise({dur:0.025, vol:0.05, f:8500, ft:'highpass', at:t, bus:musBus});
    if (CH_LEAD[s]) { tone({type:'square', f:mtof(CH_LEAD[s]), dur:d * 1.9, vol:0.055, at:t, bus:musBus}); if (intense) tone({type:'triangle', f:mtof(CH_LEAD[s] + 12), dur:d * 1.9, vol:0.045, at:t, bus:musBus}); }
  }
  /* stage 3, moonlit park: Dm - Bb - C - A on a hirajoshi scale, koto plucks, taiko and a breathy lead */
  const SW_CHORDS = [[38,50,53,57],[34,46,50,53],[36,48,52,55],[33,45,49,52]];
  const SW_LEAD = [74,0,0,0,76,0,77,0,81,0,0,0,77,0,76,0, 70,0,0,0,74,0,77,0,76,0,74,0,70,0,0,0,
                   72,0,0,0,76,0,79,0,77,0,76,0,72,0,74,0, 69,0,0,0,73,0,76,0,81,0,0,0,76,0,0,0];
  function playSword(s, t) {
    const i = s % 16, ch = SW_CHORDS[Math.floor(s / 16) % 4], d = spb();
    if ([0, 6, 8, 11].includes(i) || (intense && i === 14)) tone({type:'sine', f:i === 0 ? 85 : 118, f2:38, dur:0.2, vol:0.52, at:t, bus:musBus});
    if (i === 0 || i === 8) tone({type:'square', f:mtof(ch[0]), dur:d * 6, vol:0.07, at:t, bus:musBus});
    if (i % 2 === 0) tone({type:'triangle', f:mtof(ch[[1,2,3,2,1,3,2,3][(i >> 1) % 8]] + 12), dur:d * 1.1, vol:0.075, at:t, bus:musBus});
    if (SW_LEAD[s]) tone({type:'sine', f:mtof(SW_LEAD[s] + (intense ? 12 : 0)), dur:d * 3, vol:intense ? 0.06 : 0.075, at:t, bus:musBus});
    if (intense && SW_LEAD[s]) tone({type:'triangle', f:mtof(SW_LEAD[s]), dur:d * 2, vol:0.05, at:t, bus:musBus});
    if (intense && i % 2 === 1) noise({dur:0.02, vol:0.05, f:7000, ft:'highpass', at:t, bus:musBus});
    if (i === 4 || i === 12) noise({dur:0.07, vol:intense ? 0.22 : 0.12, f:1500, q:0.8, at:t, bus:musBus});
  }
  /* stage 2, sunset street: Am - F - G - E, galloping surf bass and a western lead */
  const GUN_CHORDS = [[45,57,60,64],[41,53,57,60],[43,55,59,62],[40,52,56,59]];
  const GUN_LEAD = [69,0,72,0,76,0,74,72,0,0,69,0,71,72,0,0, 72,0,77,0,76,0,74,72,0,0,69,0,72,0,0,0,
                    71,0,74,0,79,0,77,76,0,0,74,0,72,71,0,0, 68,0,71,0,76,0,74,71,0,68,0,71,0,0,76,0];
  function playGun(s, t) {
    const i = s % 16, ch = GUN_CHORDS[Math.floor(s / 16) % 4], d = spb();
    if ([0, 3, 6, 8, 11, 14].includes(i)) tone({type:'square', f:mtof(ch[0] + (i === 6 || i === 14 ? 12 : 0)), dur:d * 1.4, vol:0.14, at:t, bus:musBus});
    if (i % 4 === 2) tone({type:'triangle', f:mtof(ch[1] + 12), dur:d * 0.8, vol:0.06, at:t, bus:musBus});
    if (i % 4 === 0) tone({type:'sine', f:150, f2:40, dur:0.12, vol:0.48, at:t, bus:musBus});
    if (i % 2 === 1) noise({dur:0.03, vol:0.07, f:9000, ft:'highpass', at:t, bus:musBus});
    if (i === 4 || i === 12) noise({dur:0.1, vol:intense ? 0.26 : 0.18, f:1900, q:0.7, at:t, bus:musBus});
    if (GUN_LEAD[s]) tone({type:'square', f:mtof(GUN_LEAD[s] + (intense ? 12 : 0)), dur:d * 1.7, vol:intense ? 0.05 : 0.06, at:t, bus:musBus});
    if (intense && GUN_LEAD[s]) tone({type:'triangle', f:mtof(GUN_LEAD[s]), dur:d * 1.7, vol:0.05, at:t, bus:musBus});
  }
  /* training ground: C - G - Am - F, soft triangle lead, no drums */
  const CALM_CHORDS = [[48,60,64,67],[43,55,59,62],[45,57,60,64],[41,53,57,60]];
  const CALM_LEAD = [72,0,76,0,79,0,0,0,76,0,74,0,72,0,0,0, 71,0,74,0,79,0,0,0,77,0,76,0,74,0,0,0,
                     72,0,76,0,81,0,0,0,79,0,76,0,74,0,0,0, 72,0,74,0,77,0,76,0,74,0,72,0,0,0,0,0];
  function playCalm(s, t) {
    const i = s % 16, ch = CALM_CHORDS[Math.floor(s / 16) % 4], d = spb();
    if (i % 8 === 0) tone({type:'triangle', f:mtof(ch[0]), dur:d * 7, vol:0.2, at:t, bus:musBus});
    if (i % 2 === 0) tone({type:'sine', f:mtof(ch[[1,2,3,2][(i >> 1) % 4]] + 12), dur:d * 1.6, vol:0.06, at:t, bus:musBus});
    if (CALM_LEAD[s]) tone({type:'triangle', f:mtof(CALM_LEAD[s]), dur:d * 2.6, vol:0.09, at:t, bus:musBus});
    if (i % 4 === 2) noise({dur:0.03, vol:0.03, f:9000, ft:'highpass', at:t, bus:musBus});
  }
  function playStep(s, t) {
    if (calm) { playCalm(s, t); return; }
    if (gun) { playGun(s, t); return; }
    if (sword) { playSword(s, t); return; }
    if (chain) { playChain(s, t); return; }
    const i = s % 16, ch = CHORDS[Math.floor(s / 16) % 4], d = spb();
    if (i % 2 === 0) tone({type:'square', f:mtof(i % 4 === 0 ? ch[0] : ch[0] + 12), dur:d * 1.6, vol:0.15, at:t, bus:musBus});
    const am = ch[[1,2,3,2][i % 4]] + 12;
    tone({type:intense ? 'square' : 'triangle', f:mtof(am), dur:d * 0.9, vol:intense ? 0.04 : 0.09, at:t, bus:musBus});
    if (i % 4 === 0) tone({type:'sine', f:150, f2:40, dur:0.12, vol:0.5, at:t, bus:musBus});
    if (i % 4 === 2) noise({dur:0.04, vol:0.12, f:8000, ft:'highpass', at:t, bus:musBus});
    if (intense) {
      if (i === 4 || i === 12) noise({dur:0.12, vol:0.25, f:1800, q:0.7, at:t, bus:musBus});
      if (LEAD[s]) tone({type:'square', f:mtof(LEAD[s]), dur:d * 1.8, vol:0.055, at:t, bus:musBus});
    }
  }
  function sched() {
    if (!ac || !musOn) return;
    if (nextT < ac.currentTime - 0.1) nextT = ac.currentTime + 0.05;
    while (nextT < ac.currentTime + 0.15) { playStep(step, nextT); nextT += spb(); step = (step + 1) % 64; }
  }
  function musicStart(style) {
    if (!ac) return;
    const st = style === true ? 'intense' : typeof style === 'string' ? style : 'fight';
    intense = st === 'intense' || st === 'gun2' || st === 'sword2' || st === 'chain2'; calm = st === 'calm'; gun = st === 'gun' || st === 'gun2'; sword = st === 'sword' || st === 'sword2'; chain = st === 'chain' || st === 'chain2';
    if (musOn) return; musOn = true; step = 0; nextT = ac.currentTime + 0.06; timer = setInterval(sched, 30); }
  function musicStop() { musOn = false; if (timer) { clearInterval(timer); timer = null; } }
  function toggleMute() {
    muted = !muted;
    try { localStorage.setItem('bladesummoner_muted', muted ? '1' : '0'); } catch (e) {}
    if (master) master.gain.value = muted ? 0 : 0.55;
    if (direct) direct.gain.value = muted ? 0 : 0.55;
    return muted;
  }
  return { unlock, sfx, chargeStart, chargeSet, chargeStop, muffle, musicStart, musicStop, toggleMute, setVolumes, isMuted: () => muted };
})();
SND.setVolumes(settings.sfx / 10, settings.mus / 10);
