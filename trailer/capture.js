// drives the edit frame by frame; writes the video (or a preview contact sheet) and the sound log
const { boot } = require('./lib');
const fs = require('fs'), { spawn } = require('child_process');
const mode = process.argv[2] || 'preview';          // preview | full
const every = mode === 'preview' ? +(process.argv[3] || 12) : 0;
const only = process.argv[4] ? process.argv[4].split(',').map(Number) : null;
(async () => {
  const { browser, page, ev } = await boot();
  for (const f of ['director.js', 'rt.js', 'edl.js']) await page.addScriptTag({ path: __dirname + '/' + f });
  const info = await ev(() => ({ n: __EDL.segs.length, total: __EDL.total, segs: __EDL.segs.map(s => [s.shot, s.key || s.scene || '', s.f0, s.len]) }));
  console.log('segments', info.n, 'frames', info.total, (info.total / 60).toFixed(1) + 's');
  let ff = null;
  if (mode === 'full') {
    ff = spawn('ffmpeg', ['-v', 'error', '-y', '-f', 'image2pipe', '-c:v', 'png', '-framerate', '60', '-i', '-',
      '-vf', 'scale=1920:1080:flags=neighbor', '-c:v', 'libx264', '-preset', 'medium', '-crf', process.env.CRF || '20', '-tune', 'animation', '-pix_fmt', 'yuv420p', 'out/video.mp4'], { stdio: ['pipe', 'inherit', 'inherit'] });
  } else { fs.rmSync('prev', { recursive: true, force: true }); fs.mkdirSync('prev'); }
  const write = buf => new Promise(r => ff.stdin.write(buf) ? r() : ff.stdin.once('drain', r));
  const t0 = Date.now();
  for (let k = 0; k < info.n; k++) {
    if (only && !only.includes(k)) continue;
    await ev(k => __T.begin(__EDL.segs[k]), k);
    const len = info.segs[k][3];
    for (let i = 0; i < len; i += 20) {
      const res = await ev(([i, every]) => __T.frames(i, 20, 'image/png', every), [i, every]);
      for (let j = 0; j < res.length; j++) {
        if (!res[j]) continue;
        const buf = Buffer.from(res[j].split(',')[1], 'base64');
        if (ff) await write(buf);
        else fs.writeFileSync(`prev/${String(k).padStart(2, '0')}_${String(info.segs[k][2] + i + j).padStart(5, '0')}.png`, buf);
      }
    }
    process.stdout.write(`seg ${k} ${info.segs[k].join(' ')} (${((Date.now() - t0) / 1000).toFixed(0)}s)\n`);
  }
  const log = await ev(() => __T.takeLog());
  const cues = await ev(() => __EDL.cues);
  const music = await ev(() => __EDL.music || []);
  fs.mkdirSync('out', { recursive: true });
  if (!only) fs.writeFileSync(mode === 'full' ? 'out/sound.json' : 'out/sound-preview.json', JSON.stringify({ total: info.total, segs: info.segs, log, cues, music }));
  if (ff) { ff.stdin.end(); await new Promise(r => ff.on('close', r)); }
  await browser.close();
})();
