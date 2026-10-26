#!/usr/bin/env python3
"""Quick pocketsphinx free-decode to gauge transcript quality + word timing."""
import sys
from pocketsphinx import Decoder
import wave

WAV = sys.argv[1] if len(sys.argv) > 1 else "audio/voice16k.wav"

d = Decoder(samprate=16000)
d.start_utt()
w = wave.open(WAV, "rb")
d.process_raw(w.readframes(w.getnframes()), full_utt=True)
d.end_utt()

words = []
for s in d.seg():
    if s.word in ("<s>", "</s>", "<sil>", "[NOISE]", "(NULL)"):
        continue
    words.append((s.word, s.start_frame / 100.0, s.end_frame / 100.0))

print("TEXT:", " ".join(x[0] for x in words))
print("NWORDS:", len(words))
for x in words[:25]:
    print(f"  {x[1]:6.2f}-{x[2]:6.2f}  {x[0]}")
