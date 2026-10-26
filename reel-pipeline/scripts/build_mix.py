#!/usr/bin/env python3
"""Final audio mix -> public/audio/mix.wav.
voice (priority) + music bed (ducked under speech) + SFX bus (subtle).
Writes src/data/sfx_events.json for the composition. Targets ~-14 LUFS, TP<-1."""
import json, os, subprocess, numpy as np
from scipy.io import wavfile
SR=48000
os.makedirs("public/audio", exist_ok=True); os.makedirs("src/data", exist_ok=True)
cp=json.load(open("transcript/cutplan.json")); OUT=cp["out_total"]

# ---- curated SFX events (output seconds, name, gain) from edit plan anchors ----
EV=[("whoosh",0.00,1.0),("whoosh",7.10,0.85),
 ("pop",8.96,0.8),("pop",13.20,0.8),("pop",14.26,0.85),
 ("whoosh",14.59,0.8),("pop",17.85,0.8),("ding",18.45,0.6),("click",18.57,0.5),
 ("whoosh",25.00,0.9),("pop",26.47,0.85),("pop",27.27,0.85),("pop",27.97,0.85),("pop",29.04,0.9),
 ("whoosh",30.42,0.85),("pop",32.49,0.8),("pop",33.37,0.8),("pop",34.57,0.8),
 ("flash",35.30,0.65),("ding",35.85,0.85),
 ("riser",36.10,0.8),("flash",37.61,0.9),("ding",37.80,0.6),
 ("pop",43.08,0.8),("pop",44.34,0.8),
 ("ding",47.05,0.8),("click",47.40,0.5),("ding",51.80,0.65)]
json.dump({"events":[{"name":n,"t":round(t,3),"gain":g} for n,t,g in EV]},
          open("src/data/sfx_events.json","w"),indent=2)

# ---- build SFX bus ----
N=int((OUT+1.0)*SR); bus=np.zeros((N,2))
cache={}
for name,t,g in EV:
    if name not in cache:
        sr,d=wavfile.read(f"sfx/{name}.wav"); d=d.astype(np.float32)/32768
        if d.ndim==1: d=np.stack([d,d],1)
        cache[name]=d
    d=cache[name]*g*0.42        # master SFX gain (kept under voice)
    i0=int(t*SR); j=min(N,i0+len(d))
    bus[i0:j]+=d[:j-i0]
wavfile.write("public/audio/sfx_bus.wav",SR,(np.clip(bus,-1,1)*32767).astype(np.int16))

# ---- music: prefer user track.mp3, else procedural bed ----
music = "music/track.mp3" if os.path.exists("music/track.mp3") else "music/bed.wav"

# ---- ffmpeg mix: music ducked by voice sidechain; sum; loudnorm ----
fc=(
 "[1:a]aformat=sample_rates=48000:channel_layouts=stereo,volume=0.16[mus];"
 "[0:a]aformat=sample_rates=48000:channel_layouts=stereo[vox];"
 "[vox]asplit=2[vxmix][vxkey];"
 "[mus][vxkey]sidechaincompress=threshold=0.05:ratio=8:attack=6:release=320:makeup=1[musd];"
 "[2:a]aformat=sample_rates=48000:channel_layouts=stereo[sfx];"
 "[vxmix][musd][sfx]amix=inputs=3:duration=longest:normalize=0:weights=1 1 1[pre];"
 "[pre]loudnorm=I=-14:TP=-1.2:LRA=11,alimiter=limit=0.94:level=disabled[mix]"
)
cmd=["ffmpeg","-v","error","-stats","-i","audio/voice_proc.wav","-i",music,
     "-i","public/audio/sfx_bus.wav","-filter_complex",fc,"-map","[mix]",
     "-t",f"{OUT:.3f}","-ar","48000","-ac","2","public/audio/mix.wav","-y"]
print("music source:",music)
r=subprocess.run(cmd)
if r.returncode: raise SystemExit("mix failed")
# verify loudness/peak
subprocess.run(["ffmpeg","-v","error","-i","public/audio/mix.wav","-af","volumedetect","-f","null","/dev/null"])
print("public/audio/mix.wav written")
