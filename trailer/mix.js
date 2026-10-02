// final mix: the game's own sound (out/sound.wav) under the music track, laid out as the edit lists it
// (MUSIC = path to the track; the track itself is not kept in this repo). writes the finished trailer
const fs = require('fs'), { spawnSync } = require('child_process');
const [video, sound, dst] = [process.argv[2] || 'out/video.mp4', process.argv[3] || 'out/sound.wav', process.argv[4] || 'trailer.mp4'];
const { music = [] } = JSON.parse(fs.readFileSync('out/sound.json', 'utf8'));
const MUSIC = process.env.MUSIC, SFX = process.env.SFX_GAIN || '0.75', MUS = process.env.MUSIC_GAIN || '0.8';
const args = ['-v', 'error', '-y', '-i', video, '-i', sound];
let graph;
if (MUSIC && fs.existsSync(MUSIC) && music.length) {
  args.push('-i', MUSIC);
  const XF = 0.015;   // each splice is a 15 ms crossfade, so the beat never stutters
  const parts = music.map((m, i) => {
    const last = i === music.length - 1, dur = m.dur + (last ? 0 : XF), ms = Math.round(m.at * 1000);
    const fin = m.fadeIn || (i ? XF : 0.01), fout = m.fadeOut || XF, fst = dur - fout - (m.tail || 0);
    return `[2:a]aresample=48000,atrim=start=${m.src.toFixed(4)}:duration=${dur.toFixed(4)},asetpts=PTS-STARTPTS,` +
      `afade=t=in:d=${fin},afade=t=out:st=${fst.toFixed(4)}:d=${fout},volume=${m.gain || 1},` +
      `adelay=delays=${ms}:all=1[m${i}]`;
  });
  graph = parts.join(';') + ';' + music.map((_, i) => `[m${i}]`).join('') + `amix=inputs=${music.length}:normalize=0:duration=longest,volume=${MUS}[mus];` +
    `[1:a]volume=${SFX}[sfx];[sfx][mus]amix=inputs=2:normalize=0:duration=longest,loudnorm=I=-14[a]`;
} else {
  console.log('no MUSIC track given: mixing the game sound alone');
  graph = `[1:a]loudnorm=I=-15[a]`;
}
// two-pass loudnorm in linear mode: one gain for the whole trailer, so the quiet intro stays quiet and the drop
// still lands (single-pass loudnorm rides the gain and flattens exactly that contrast)
const LN = 'I=-14:TP=-1.5:LRA=20';
const measure = spawnSync('ffmpeg', [...args.map(a => a === 'error' ? 'info' : a), '-filter_complex', graph.replace(/loudnorm=[^\[]*\[a\]/, `loudnorm=${LN}:print_format=json[a]`),
  '-map', '[a]', '-f', 'null', '-'], { encoding: 'utf8' });
const m = JSON.parse(measure.stderr.slice(measure.stderr.lastIndexOf('{')));
const linear = `loudnorm=${LN}:linear=true:measured_I=${m.input_i}:measured_TP=${m.input_tp}:measured_LRA=${m.input_lra}:measured_thresh=${m.input_thresh}:offset=${m.target_offset}`;
graph = graph.replace(/loudnorm=[^\[]*\[a\]/, linear + ',aresample=48000[a]');
args.push('-filter_complex', graph, '-map', '0:v', '-map', '[a]', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k', '-ar', '48000', '-shortest', '-movflags', '+faststart', dst);
const r = spawnSync('ffmpeg', args, { stdio: 'inherit' });
console.log('mixed: input', m.input_i, 'LUFS, LRA', m.input_lra);
process.exit(r.status);
