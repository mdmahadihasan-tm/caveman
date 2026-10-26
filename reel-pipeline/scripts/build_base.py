#!/usr/bin/env python3
"""Build public/base.mp4 (graded, cut, sped, upscaled, no audio) and
audio/voice_proc.wav (cut+sped+cleaned voice @ -14 LUFS) from cutplan.json."""
import json, subprocess, sys
cp = json.load(open("transcript/cutplan.json"))
keep = cp["keep"]; SPEED = cp["speed"]
RAW = "public/raw.mp4"

# ---------- video ----------
vparts = "".join(f"[0:v]trim={a}:{b},setpts=PTS-STARTPTS[v{i}];" for i,(a,b) in enumerate(keep))
vcat = "".join(f"[v{i}]" for i in range(len(keep))) + f"concat=n={len(keep)}:v=1:a=0[vc];"
grade = (
    f"[vc]setpts=PTS/{SPEED},"
    "scale=1080:1920:flags=lanczos,"
    "eq=brightness=0.028:contrast=1.07:saturation=1.06:gamma=1.02,"
    "colorbalance=rm=0.04:bm=-0.04:rh=0.02:bh=-0.03:rs=0.02:bs=-0.02,"
    "vignette=angle=PI/4.6,"
    "unsharp=5:5:0.45:5:5:0.0,"
    "format=yuv420p[vout]"
)
vf = vparts + vcat + grade
cmd_v = ["ffmpeg","-v","error","-stats","-i",RAW,"-filter_complex",vf,
         "-map","[vout]","-r","30","-c:v","libx264","-crf","16","-preset","medium",
         "-pix_fmt","yuv420p","public/base.mp4","-y"]

# ---------- audio (voice) ----------
aparts = "".join(f"[0:a]atrim={a}:{b},asetpts=PTS-STARTPTS[a{i}];" for i,(a,b) in enumerate(keep))
acat = "".join(f"[a{i}]" for i in range(len(keep))) + f"concat=n={len(keep)}:v=0:a=1[ac];"
# atempo must be in [0.5,2]; SPEED ~1.15 ok
aproc = (
    f"[ac]atempo={SPEED:.4f},"
    "highpass=f=85,"
    "afftdn=nr=9:nf=-28,"           # gentle noise reduction
    "deesser=i=0.35:m=0.5:f=0.25,"  # light de-ess
    "acompressor=threshold=-18dB:ratio=2.2:attack=8:release=160:makeup=1.5,"
    "loudnorm=I=-14:TP=-1.5:LRA=11[aout]"
)
af = aparts + acat + aproc
cmd_a = ["ffmpeg","-v","error","-stats","-i",RAW,"-filter_complex",af,
         "-map","[aout]","-ar","48000","-ac","2","audio/voice_proc.wav","-y"]

for tag,cmd in (("VIDEO",cmd_v),("VOICE",cmd_a)):
    print(f"=== {tag} ===", flush=True)
    r = subprocess.run(cmd)
    if r.returncode!=0: sys.exit(f"{tag} ffmpeg failed")
print("base.mp4 + voice_proc.wav built.")
