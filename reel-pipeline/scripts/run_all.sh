#!/usr/bin/env bash
# One-shot pipeline: transcript -> cut plan -> sfx -> base video -> masks ->
# music -> mix.  Then `npm run preview` / `npm run final` to render.
# Reuse: swap public/raw.mp4 + brand.config.ts, then run this.
set -e
cd "$(dirname "$0")/.."
. .venv/bin/activate

echo "==> 1/7 transcript (whisper if available, else keep committed transcript)"
python scripts/transcribe.py 2>/dev/null || echo "   whisper unavailable — using scripts/build_transcript.py source of truth"
python scripts/build_transcript.py

echo "==> 2/7 SFX"
python scripts/make_sfx.py

echo "==> 3/7 base video (cut + upscale + grade) and processed voice"
python scripts/build_base.py

echo "==> 4/7 person mattes (hook text-behind-subject)"
python scripts/make_masks.py 3.8 15

echo "==> 5/7 music bed"
python scripts/make_music.py

echo "==> 6/7 final audio mix"
cp -f transcript/words_cut.json transcript/cutplan.json src/data/ 2>/dev/null || true
python scripts/build_mix.py

echo "==> 7/7 done. Render with:  npm run preview   then   npm run final"
