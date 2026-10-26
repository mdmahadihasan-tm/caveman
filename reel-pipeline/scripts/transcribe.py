#!/usr/bin/env python3
"""Word-level transcription with faster-whisper -> transcript/transcript.json.

Drives ALL captions, pop-ups and SFX timing downstream. Output schema:
{
  "duration": float,
  "language": str,
  "words": [{"i": int, "word": str, "start": float, "end": float, "prob": float}],
  "segments": [{"start": float, "end": float, "text": str}]
}
"""
import json
import sys
from pathlib import Path

from faster_whisper import WhisperModel

AUDIO = sys.argv[1] if len(sys.argv) > 1 else "audio/voice16k.wav"
OUT = sys.argv[2] if len(sys.argv) > 2 else "transcript/transcript.json"
MODEL = sys.argv[3] if len(sys.argv) > 3 else "small.en"

print(f"[transcribe] loading model {MODEL} ...", flush=True)
model = WhisperModel(MODEL, device="cpu", compute_type="int8")

print(f"[transcribe] transcribing {AUDIO} ...", flush=True)
segments, info = model.transcribe(
    AUDIO,
    language="en",
    word_timestamps=True,
    vad_filter=False,          # keep natural timing; we do our own gap analysis
    beam_size=5,
    condition_on_previous_text=True,
)

words = []
segs = []
i = 0
for seg in segments:
    segs.append({"start": round(seg.start, 3), "end": round(seg.end, 3), "text": seg.text.strip()})
    for w in (seg.words or []):
        tok = w.word.strip()
        if not tok:
            continue
        words.append({
            "i": i,
            "word": tok,
            "start": round(w.start, 3),
            "end": round(w.end, 3),
            "prob": round(w.probability, 3),
        })
        i += 1

duration = words[-1]["end"] if words else info.duration
data = {
    "duration": round(info.duration, 3),
    "speech_end": round(duration, 3),
    "language": info.language,
    "words": words,
    "segments": segs,
}
Path(OUT).parent.mkdir(parents=True, exist_ok=True)
Path(OUT).write_text(json.dumps(data, indent=2))
print(f"[transcribe] {len(words)} words, {len(segs)} segments -> {OUT}", flush=True)
