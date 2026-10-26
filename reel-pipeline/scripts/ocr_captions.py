#!/usr/bin/env python3
"""Dense OCR of burned-in caption band -> caption events with timing.

Reads frames extracted at FPS from the lower caption band, OCRs each, collapses
consecutive identical reads into caption 'events' (phrase + start/end).
Output: _probe/caption_events.json
"""
import os, re, json, glob, sys
import cv2
from rapidocr_onnxruntime import RapidOCR

FPS = 8.0
FRAMEDIR = "_probe/capframes"
OUT = "_probe/caption_events.json"

ocr = RapidOCR()

def norm(s):
    s = s.upper()
    s = re.sub(r"[^A-Z0-9&'.? ]", " ", s)
    s = re.sub(r"\s+", " ", s).strip()
    return s

frames = sorted(glob.glob(os.path.join(FRAMEDIR, "*.jpg")))
reads = []
for idx, f in enumerate(frames):
    t = idx / FPS
    img = cv2.imread(f)
    res, _ = ocr(img)
    lines = []
    if res:
        # sort by vertical then horizontal to preserve reading order
        items = sorted(res, key=lambda r: (round((r[0][0][1]+r[0][2][1])/2/40), r[0][0][0]))
        for box, txt, score in items:
            if score is None or float(score) < 0.45:
                continue
            lines.append(txt)
    reads.append((round(t, 3), norm(" ".join(lines))))

# collapse consecutive identical
events = []
for t, txt in reads:
    if not txt:
        # blank: close current run
        if events and events[-1]["_open"]:
            events[-1]["_open"] = False
        continue
    if events and events[-1]["text"] == txt and events[-1]["_open"]:
        events[-1]["end"] = round(t + 1.0/FPS, 3)
    else:
        if events:
            events[-1]["_open"] = False
        events.append({"text": txt, "start": round(t, 3), "end": round(t + 1.0/FPS, 3), "_open": True})

for e in events:
    e.pop("_open", None)

# merge micro-events (OCR flicker) shorter than 0.2s into neighbors if same text appears adjacent
json.dump({"fps": FPS, "events": events}, open(OUT, "w"), indent=2)
print(f"{len(frames)} frames -> {len(events)} caption events")
for e in events:
    print(f"  {e['start']:6.2f}-{e['end']:6.2f}  {e['text']}")
