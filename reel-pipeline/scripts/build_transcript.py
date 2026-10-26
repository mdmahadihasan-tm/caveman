#!/usr/bin/env python3
"""Authoritative word-timed transcript for raw.mp4.

Source of truth: burned-in karaoke captions recovered by dense RapidOCR
(_probe/caption_events.json), word onsets read from first-appearance of each
word, cross-checked against pocketsphinx free-decode timing and the -20dB
silence map. Hand-verified where OCR merged tokens.

Produces:
  transcript/transcript.json   words with SOURCE-time start/end (+ segments)
  transcript/cutplan.json      keep-segments (source) + piecewise time remap
  transcript/words_cut.json    words remapped to OUTPUT (post-cut) time
All downstream captions / slides / SFX read these.
"""
import json
from pathlib import Path

# (onset_seconds, word)  -- onsets from burned-in caption first-appearance
W = [
 (0.10,"I"),(0.55,"stopped"),(0.95,"prenumbing"),(1.55,"my"),(1.75,"brow"),
 (2.00,"and"),(2.15,"lip"),(2.45,"clients"),(2.95,"over"),(3.30,"2"),(3.60,"years"),
 (4.05,"ago."),(4.70,"Here's"),(5.00,"what"),(5.20,"I've"),(5.35,"learned."),
 (5.62,"For"),(5.88,"every"),(6.12,"single"),(6.38,"service,"),(7.00,"but"),
 (7.25,"through"),(7.50,"the"),(7.62,"years"),(8.50,"I"),(8.70,"noticed"),
 (8.98,"something:"),(9.50,"anesthetic"),(10.12,"changes"),(10.62,"the"),
 (10.80,"texture"),(11.12,"of"),(11.25,"the"),(11.40,"skin,"),(11.75,"which"),
 (12.00,"makes"),(12.25,"it"),(12.38,"more"),(12.62,"difficult"),(13.00,"to"),
 (13.15,"see"),(13.62,"how"),(13.88,"the"),(14.08,"skin"),(14.28,"is"),
 (14.50,"responding"),(14.90,"to"),(15.02,"technique,"),(15.75,"as"),(16.00,"well"),
 (16.15,"as"),(16.28,"how"),(16.50,"it's"),(16.65,"accepting"),(17.12,"color."),
 (17.62,"This"),(18.00,"ultimately"),(18.62,"led"),(18.90,"to"),(19.25,"longer"),
 (19.62,"appointment"),(20.05,"times"),(20.52,"and"),(21.00,"uneven"),
 (21.40,"healed"),(21.78,"results."),(22.40,"When"),(22.62,"I"),(22.78,"stopped"),
 (23.05,"numbing"),(23.28,"every"),(23.62,"single"),(23.90,"brow"),(24.12,"and"),
 (24.28,"lip"),(24.42,"client,"),(25.00,"I"),(25.20,"was"),(25.38,"able"),
 (25.55,"to"),(25.70,"clearly"),(26.15,"see"),(26.62,"how"),(26.88,"the"),
 (27.10,"skin"),(27.30,"responded"),(27.65,"to"),(27.80,"my"),(28.02,"technique,"),
 (28.78,"which"),(29.12,"meant"),(29.40,"that"),(29.52,"I"),(29.64,"could"),
 (29.78,"make"),(29.95,"adjustments"),(30.45,"to"),(31.25,"stroke"),(31.65,"length,"),
 (32.12,"needle"),(32.45,"choice,"),(33.25,"hand"),(33.65,"speed,"),(34.05,"machine"),
 (34.62,"speed,"),(34.92,"or"),(35.28,"pressure"),(35.90,"in"),(36.10,"real"),
 (36.42,"time."),(37.02,"This"),(37.28,"took"),(37.45,"out"),(37.58,"the"),
 (37.70,"guesswork"),(38.28,"of"),(38.62,"needing"),(38.92,"to"),(39.15,"try"),
 (39.40,"three"),(39.78,"different"),(40.10,"needles,"),(40.62,"three"),
 (40.90,"different"),(41.15,"hand"),(41.42,"speeds,"),(41.78,"or"),(42.02,"three"),
 (42.28,"different"),(42.48,"machine"),(42.80,"speeds"),(43.14,"to"),(43.28,"get"),
 (43.52,"the"),(43.66,"result"),(43.92,"that"),(44.15,"I"),(44.35,"wanted."),
 (44.65,"And"),(44.90,"here's"),(45.15,"my"),(45.30,"biggest"),(45.68,"takeaway:"),
 (46.52,"if"),(46.78,"your"),(47.02,"client"),(47.28,"is"),(47.55,"experiencing"),
 (48.28,"more"),(48.78,"discomfort"),(49.28,"than"),(49.55,"usual,"),(50.52,"don't"),
 (50.78,"be"),(50.92,"so"),(51.15,"quick"),(51.42,"to"),(51.65,"blame."),
 (52.02,"Oh,"),(52.18,"maybe"),(52.42,"they"),(52.55,"had"),(52.70,"caffeine,"),
 (53.28,"or"),(53.42,"maybe"),(53.65,"they"),(53.80,"just"),(53.95,"have"),
 (54.15,"sensitive"),(54.55,"skin."),(55.38,"Instead,"),(56.02,"take"),(56.28,"a"),
 (56.42,"look"),(56.58,"at"),(56.70,"your"),(56.92,"technique"),(57.30,"and"),
 (57.55,"tools,"),(58.15,"because"),(58.55,"great"),(58.92,"results"),(59.28,"aren't"),
 (59.55,"only"),(60.02,"about"),(60.30,"making"),(60.55,"sure"),(60.78,"your"),
 (60.95,"clients"),(61.18,"are"),(61.35,"comfortable."),(62.05,"They're"),
 (62.30,"about"),(62.45,"understanding"),(63.15,"the"),(63.28,"skin"),
 (63.45,"you're"),(63.68,"working"),(63.95,"on"),(64.15,"and"),(64.30,"how"),
 (64.52,"to"),(64.66,"adjust"),(65.05,"your"),(65.30,"technique"),(65.68,"accordingly."),
]
SPEECH_END = 66.30

# ---- words with source times (end = next onset, capped at +0.6s tail) ----
words = []
for i,(t,w) in enumerate(W):
    nxt = W[i+1][0] if i+1 < len(W) else SPEECH_END
    end = min(nxt, t + 0.80)
    words.append({"i":i,"word":w,"start":round(t,3),"end":round(end,3)})

# sentence segments (for reference)
segends = {"learned.","years","color.","results.","time.","wanted.","usual.","skin.","tools,","accordingly."}
segments=[]; s=0
for i,x in enumerate(words):
    if x["word"] in segends or i==len(words)-1:
        segments.append({"start":words[s]["start"],"end":words[i]["end"],
                         "text":" ".join(y["word"] for y in words[s:i+1])})
        s=i+1

transcript={"duration":66.615,"speech_end":SPEECH_END,"source":"burned-in-caption OCR + pocketsphinx timing (whisper HF model blocked by egress policy)","language":"en","words":words,"segments":segments}
Path("transcript").mkdir(exist_ok=True)
Path("transcript/transcript.json").write_text(json.dumps(transcript,indent=2))

# ---- cut plan ----
# measured -20dB:0.25 silence intervals (breaths/pauses) from ffmpeg silencedetect
SILENCES=[(7.910,8.311),(9.288,9.562),(15.458,15.810),(17.420,17.681),
 (22.088,22.385),(26.520,26.771),(28.414,28.832),(30.886,31.210),(32.813,33.134),
 (36.705,36.976),(40.340,40.684),(44.442,44.728),(45.975,46.526),(50.074,50.481),
 (54.857,55.256),(57.769,58.123)]
HEAD=0.05               # trim leading dead air
TAIL=66.35              # trim trailing dead air (after 'accordingly.')
PAD=0.08                # keep this much of each breath for natural rhythm
TARGET=54.5             # desired output seconds
SPEED_MAX=1.18

# cut = inner dead portion of each silence; keep = complement within [HEAD,TAIL]
cuts=[]
for s,e in SILENCES:
    a=s+PAD; b=e-0.04
    if b-a>0.06: cuts.append([round(a,3),round(b,3)])
keep=[]; cur=HEAD
for a,b in cuts:
    if a>cur: keep.append([round(cur,3),round(a,3)])
    cur=b
keep.append([round(cur,3),round(TAIL,3)])

# trimmed (pre-speed) duration
t1=sum(b-a for a,b in keep)
SPEED=min(SPEED_MAX, max(1.0, t1/TARGET))
out_total=t1/SPEED

# piecewise remap: source -> trimmed(out) -> /SPEED
remap=[]; acc=0.0
for a,b in keep:
    d=b-a
    remap.append({"src":round(a,3),"len":round(d,3),"cut_out":round(acc,3)})
    acc+=d

def src_to_out(ts):
    for seg in remap:
        a=seg["src"]; d=seg["len"]
        if ts<a: return round(seg["cut_out"]/SPEED,3)
        if ts<=a+d: return round((seg["cut_out"]+(ts-a))/SPEED,3)
    return round(t1/SPEED,3)

cutplan={"silences":SILENCES,"head":HEAD,"tail":TAIL,"pad":PAD,"speed":round(SPEED,4),
         "keep":keep,"cuts":cuts,"remap":remap,"trimmed_len":round(t1,3),
         "out_total":round(out_total,3),"src_speech":round(SPEECH_END,3),
         "removed_total":round(SPEECH_END-out_total,3)}
Path("transcript/cutplan.json").write_text(json.dumps(cutplan,indent=2))

words_cut=[{"i":x["i"],"word":x["word"],"start":src_to_out(x["start"]),"end":src_to_out(x["end"])} for x in words]
Path("transcript/words_cut.json").write_text(json.dumps({"out_total":round(out_total,3),"speed":round(SPEED,4),"words":words_cut},indent=2))

print(f"words={len(words)}  segments={len(segments)}  cuts={len(cuts)}")
print(f"trimmed={t1:.2f}s  speed={SPEED:.3f}x  ->  output={out_total:.2f}s  (from {SPEECH_END:.2f}s source)")
print("last word out-time:", words_cut[-1])
