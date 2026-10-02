#!/usr/bin/env bash
# builds trailer/blade-summoner-trailer.mp4 from the game itself:
#   debug build of the game -> headless Chromium plays the edit (edl.js) frame by frame -> 1080p60 video
#   every sound call is logged per frame and replayed through the game's own synth offline -> soundtrack
# needs: node + playwright (with Chromium), ffmpeg, python3, curl
# music: MUSIC=/path/to/deadly-force.(mp3|mp4|wav) trailer/make.sh  (the track is not kept in the repo)
set -euo pipefail
here=$(cd "$(dirname "$0")" && pwd); root=$(dirname "$here"); b="$here/.build"; port=${PORT:-8765}
mkdir -p "$b/fonts" "$b/out"

# the game's web fonts, kept locally so the capture does not depend on the network mid-run
if [ ! -f "$b/fonts/local.css" ]; then
  curl -sS "https://fonts.googleapis.com/css2?family=Cinzel:wght@600&family=Do+Hyeon&family=Nanum+Gothic+Coding:wght@400;700&display=swap" -o "$b/fonts/g.css"
  grep -o 'https://[^)]*' "$b/fonts/g.css" | while read -r u; do (cd "$b/fonts" && curl -sS -O "$u"); done
  sed -E 's#https://fonts.gstatic.com/s/[^/]+/v[0-9]+/##' "$b/fonts/g.css" > "$b/fonts/local.css"
fi

# a debug build: the shipped index.html has the /*DEBUG*/ hooks (window.__bs, __freeze) stripped
{ echo '<!doctype html><meta charset="utf-8">'; echo '<link rel="stylesheet" href="fonts/local.css">'
  grep -v 'fonts.googleapis\|fonts.gstatic' "$root/shell.html"; echo '<script>'
  for f in $(cd "$root" && LC_ALL=C ls [0-9]*.js); do cat "$root/$f"; done; echo '</script>'; } > "$b/game-dev.html"

cd "$b"
python3 -m http.server "$port" --bind 127.0.0.1 >/dev/null 2>&1 & srv=$!
trap 'kill $srv 2>/dev/null' EXIT
for _ in $(seq 50); do curl -s -o /dev/null "http://127.0.0.1:$port/game-dev.html" && break; sleep 0.1; done

# EDL picks the edit (edl.js: the trailer, duel.edl.js: the duel short); NAME the output file
edl=${EDL:-edl.js}; name=${NAME:-blade-summoner-trailer}
EDL=$edl OUT=out/video-$name.mp4 SOUND=out/sound-$name.json PORT=$port node "$here/capture.js" full
PORT=$port node "$here/audio.js" out/sound-$name.json out/sound-$name.wav
SOUND=out/sound-$name.json node "$here/mix.js" out/video-$name.mp4 out/sound-$name.wav "$here/$name.mp4"
echo "wrote $here/$name.mp4"
