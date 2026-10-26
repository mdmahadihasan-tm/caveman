#!/usr/bin/env bash
# Quality check for the final render.
set -e
cd "$(dirname "$0")/.."
F=${1:-output/final.mp4}
echo "== $F =="
ffprobe -v error -show_entries format=duration -show_entries stream=codec_type,codec_name,width,height,r_frame_rate -of default=nw=1 "$F"
echo "-- true peak / loudness --"
ffmpeg -v error -i "$F" -af "loudnorm=print_format=summary" -f null /dev/null 2>&1 | grep -E "Input (Integrated|True Peak|LRA)" || true
echo "-- sample peak (must be < -1.0 dB) --"
ffmpeg -i "$F" -af volumedetect -f null /dev/null 2>/tmp/qc_vd.txt 2>&1 || true
grep -E "max_volume|mean_volume" /tmp/qc_vd.txt || true
