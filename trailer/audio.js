// renders the trailer's sound offline with the game's own synth: every logged sound call is replayed at its
// trailer frame through an OfflineAudioContext that the game believes is its live AudioContext
const { launch, URL } = require('./lib');
const fs = require('fs');
const src = process.argv[2] || 'out/sound.json', dst = process.argv[3] || 'out/sound.wav';
(async () => {
  const data = JSON.parse(fs.readFileSync(src, 'utf8'));
  const SR = 48000, dur = data.total / 60 + 2;
  const browser = await launch();
  const page = await browser.newPage();
  page.on('pageerror', e => console.log('pageerror:', e.message));
  page.on('console', m => { if (m.type() === 'error' || m.text().startsWith('[aud]')) console.log(m.text()); });
  await page.addInitScript(([SR, dur]) => {
    const real = new OfflineAudioContext(2, Math.ceil(SR * dur), SR);
    const A = window.__AUD = { real, t: 0, timers: [] };
    // everything (the game's mix and the trailer score) goes through one gentle bus compressor
    A.bus = real.createGain(); A.comp = real.createDynamicsCompressor();
    A.comp.threshold.value = -14; A.comp.ratio.value = 3; A.comp.attack.value = 0.004; A.comp.release.value = 0.2; A.comp.knee.value = 8;
    A.bus.connect(A.comp); A.comp.connect(real.destination);
    // a source started or stopped with no time means "now": on the trailer clock that is A.t, not the
    // offline context's own 0 (the charge hum calls start() bare and would otherwise drone from the first frame)
    const timed = n => {
      const s0 = n.start.bind(n), s1 = n.stop.bind(n);
      n.start = (w, ...r) => s0(w === undefined ? A.t : w, ...r);
      n.stop = w => s1(w === undefined ? A.t : w);
      return n;
    };
    const proxy = new Proxy(real, { get(t, k) {
      if (k === 'currentTime') return A.t;
      if (k === 'createOscillator' || k === 'createBufferSource' || k === 'createConstantSource') return (...a) => timed(t[k](...a));
      if (k === 'state') return 'running';
      if (k === 'resume') return () => Promise.resolve();
      if (k === 'destination') return A.bus;
      const v = Reflect.get(t, k); return typeof v === 'function' ? v.bind(t) : v;
    } });
    window.AudioContext = window.webkitAudioContext = function () { return proxy; };
    // the music sequencer runs on a 30 ms interval: hand it to the trailer clock instead
    const si = window.setInterval, ci = window.clearInterval;
    window.setInterval = (fn, ms, ...a) => { if (ms === 30) { A.timers.push(fn); return 900000 + A.timers.length - 1; } return si(fn, ms, ...a); };
    window.clearInterval = id => { if (id >= 900000) { A.timers[id - 900000] = null; return; } ci(id); };
    try { localStorage.removeItem('bladesummoner_muted'); } catch (e) {}
  }, [SR, dur]);
  await page.goto(URL);
  await page.evaluate(() => { window.__freeze = true; });
  console.log('scheduling...');
  const t0 = Date.now();
  const info = await page.evaluate((data) => {
    const A = window.__AUD, ac = A.real;
    SND.unlock();
    // the game mixes its music well under the effects; a trailer wants it up front
    SND.setVolumes(0.9, 5);
    /* ---- trailer score: a drone and a riser, built from the same raw waveforms as the game ---- */
    const mtof = m => 440 * Math.pow(2, (m - 69) / 12);
    let drone = null;
    const noiseBuf = ac.createBuffer(1, ac.sampleRate * 2, ac.sampleRate);
    { const d = noiseBuf.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; }
    function droneSet(T, o) {
      const fade = Math.max(0.03, o.fade || 0.5);
      if (drone) { const g = drone.g; g.gain.cancelScheduledValues(T); g.gain.setValueAtTime(g.gain.value || drone.gain, T); g.gain.setTargetAtTime(0.0001, T, fade / 4); for (const n of drone.osc) n.stop(T + fade * 2 + 0.1); drone = null; }
      if (!o.on) return;
      const g = ac.createGain(), lp = ac.createBiquadFilter(), lfo = ac.createOscillator(), lg = ac.createGain();
      lp.type = 'lowpass'; lp.frequency.value = 360; lp.Q.value = 1;
      lfo.frequency.value = 0.18; lg.gain.value = 160; lfo.connect(lg); lg.connect(lp.frequency);
      const gain = o.gain * 0.1; g.gain.setValueAtTime(0.0001, T); g.gain.linearRampToValueAtTime(gain, T + fade);
      const osc = [];
      for (const [type, f, v] of [['sawtooth', mtof(o.note), 0.5], ['sawtooth', mtof(o.note) * 1.004, 0.5], ['sawtooth', mtof(o.note + 7), 0.28], ['square', mtof(o.note - 12), 0.35], ['sine', mtof(o.note - 12), 0.9]]) {
        const n = ac.createOscillator(), ng = ac.createGain(); n.type = type; n.frequency.value = f; ng.gain.value = v;
        n.connect(ng); ng.connect(lp); n.start(T); osc.push(n);
      }
      lfo.start(T); osc.push(lfo);
      lp.connect(g); g.connect(A.bus);
      drone = {g, osc, gain};
    }
    function riser(T, o) {
      const d = o.dur || 1, src = ac.createBufferSource(), bp = ac.createBiquadFilter(), g = ac.createGain();
      src.buffer = noiseBuf; src.loop = true; bp.type = 'bandpass'; bp.Q.value = 1.2;
      bp.frequency.setValueAtTime(300, T); bp.frequency.exponentialRampToValueAtTime(7000, T + d);
      g.gain.setValueAtTime(0.0001, T); g.gain.exponentialRampToValueAtTime(0.5, T + d);
      src.connect(bp); bp.connect(g); g.connect(A.bus); src.start(T); src.stop(T + d);
      const o2 = ac.createOscillator(), g2 = ac.createGain(); o2.type = 'sawtooth';
      o2.frequency.setValueAtTime(90, T); o2.frequency.exponentialRampToValueAtTime(900, T + d);
      g2.gain.setValueAtTime(0.0001, T); g2.gain.exponentialRampToValueAtTime(0.12, T + d);
      o2.connect(g2); g2.connect(A.bus); o2.start(T); o2.stop(T + d);
    }
    /* ---- the replay ---- */
    const ev = [];
    data.cues.forEach((c, i) => ev.push({f: c[0], o: 0, i, cue: c.slice(1)}));
    data.log.forEach((l, i) => ev.push({f: l[0], o: 1, i, tag: l[1], args: l[2]}));
    // every cut resets the held charge hum and the muffle, so nothing leaks across shots
    data.segs.forEach((s, i) => ev.push({f: s[2], o: -1, i, reset: true}));
    ev.sort((a, b) => a.f - b.f || a.o - b.o || a.i - b.i);
    let k = 0, n = 0;
    for (let f = 0; f <= data.total + 60; f++) {
      A.t = f / 60;
      while (k < ev.length && ev[k].f <= f) {
        const e = ev[k++]; n++;
        if (e.reset) { SND.chargeStop(); SND.muffle(0, 0.01); continue; }
        if (e.cue) {
          const [type, a] = e.cue;
          if (type === 'music') { A.t = f / 60 - 0.06; SND.musicStart(a); A.t = f / 60; }
          else if (type === 'musicStop') SND.musicStop();
          else if (type === 'sfx') SND.sfx[a]();
          else if (type === 'drone') droneSet(A.t, a);
          else if (type === 'riser') riser(A.t, a);
          continue;
        }
        if (e.tag.startsWith('sfx.')) SND.sfx[e.tag.slice(4)](...e.args); else SND[e.tag](...e.args);
      }
      for (const fn of A.timers) if (fn) fn();
    }
    return {events: n};
  }, data);
  console.log('scheduled', info.events, 'events in', ((Date.now() - t0) / 1000).toFixed(1) + 's; rendering...');
  const t1 = Date.now();
  const nChunks = await page.evaluate(async () => {
    const buf = await window.__AUD.real.startRendering();
    const L = buf.getChannelData(0), R = buf.getChannelData(1), n = L.length;
    let peak = 0; for (let i = 0; i < n; i++) peak = Math.max(peak, Math.abs(L[i]), Math.abs(R[i]));
    const g = peak > 0.98 ? 0.98 / peak : 1;
    const pcm = new Int16Array(n * 2);
    for (let i = 0; i < n; i++) { pcm[i * 2] = Math.max(-1, Math.min(1, L[i] * g)) * 32767; pcm[i * 2 + 1] = Math.max(-1, Math.min(1, R[i] * g)) * 32767; }
    window.__pcm = new Uint8Array(pcm.buffer); window.__peak = peak;
    return Math.ceil(window.__pcm.length / (3 << 20));
  });
  console.log('rendered in', ((Date.now() - t1) / 1000).toFixed(1) + 's', 'peak', await page.evaluate(() => window.__peak));
  const parts = [];
  for (let c = 0; c < nChunks; c++) {
    const b64 = await page.evaluate(c => { const a = window.__pcm.subarray(c * (3 << 20), (c + 1) * (3 << 20)); let s = ''; for (let i = 0; i < a.length; i += 0x8000) s += String.fromCharCode.apply(null, a.subarray(i, i + 0x8000)); return btoa(s); }, c);
    parts.push(Buffer.from(b64, 'base64'));
  }
  const pcm = Buffer.concat(parts), hdr = Buffer.alloc(44);
  hdr.write('RIFF', 0); hdr.writeUInt32LE(36 + pcm.length, 4); hdr.write('WAVE', 8); hdr.write('fmt ', 12); hdr.writeUInt32LE(16, 16);
  hdr.writeUInt16LE(1, 20); hdr.writeUInt16LE(2, 22); hdr.writeUInt32LE(SR, 24); hdr.writeUInt32LE(SR * 4, 28); hdr.writeUInt16LE(4, 32); hdr.writeUInt16LE(16, 34);
  hdr.write('data', 36); hdr.writeUInt32LE(pcm.length, 40);
  fs.writeFileSync(dst, Buffer.concat([hdr, pcm]));
  console.log('wrote', dst, (pcm.length / 1e6).toFixed(1) + 'MB');
  await browser.close();
})();
