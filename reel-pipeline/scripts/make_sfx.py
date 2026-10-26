#!/usr/bin/env python3
"""Procedural SFX generator — no downloaded audio. Writes 48k stereo WAV to sfx/."""
import numpy as np
from scipy.io import wavfile
from scipy.signal import butter, lfilter, sosfilt
from pathlib import Path

SR = 48000
Path("sfx").mkdir(exist_ok=True)

def env(n, a, d, s=0.0, sl=0.0, r=None):
    """simple AD(S)R-ish envelope over n samples (seconds given as fractions handled by caller)."""
    e = np.ones(n)
    ai = int(a*SR); di = int(d*SR)
    if ai>0: e[:ai] = np.linspace(0,1,ai)
    if di>0: e[ai:ai+di] = np.linspace(1,sl if s>0 else 1, di)
    return e

def norm(x, peak=0.9):
    x = x - np.mean(x)
    m = np.max(np.abs(x)) + 1e-9
    return (x/m)*peak

def save(name, mono, peak=0.9, pan=0.0):
    y = norm(mono, peak).astype(np.float32)
    l = y*np.cos((pan+1)*np.pi/4); r = y*np.sin((pan+1)*np.pi/4)
    st = np.stack([l,r],axis=1)
    # 5ms fade in/out to avoid clicks
    f=int(0.005*SR)
    st[:f]*=np.linspace(0,1,f)[:,None]; st[-f:]*=np.linspace(1,0,f)[:,None]
    wavfile.write(f"sfx/{name}.wav", SR, (st*32767).astype(np.int16))
    print(f"  sfx/{name}.wav  {len(mono)/SR:.3f}s")

def bp(x, lo, hi):
    sos = butter(4, [lo/(SR/2), hi/(SR/2)], btype="band", output="sos")
    return sosfilt(sos, x)
def lp(x, hz):
    sos = butter(4, hz/(SR/2), btype="low", output="sos"); return sosfilt(sos, x)
def hp(x, hz):
    sos = butter(4, hz/(SR/2), btype="high", output="sos"); return sosfilt(sos, x)

rng = np.random.default_rng(7)

# --- whoosh: filtered noise sweep (slide entries / transitions) ---
def whoosh(dur=0.55):
    n=int(dur*SR); t=np.linspace(0,dur,n)
    noise=rng.standard_normal(n)
    # sweep bandpass center up then down via time-varying filter approx: blend two bands by env
    center = 400 + 2600*np.sin(np.pi*t/dur)       # up-then-down
    # cheap time-varying: modulate by multiplying filtered noise with moving amplitude
    y = bp(noise, 300, 3500)
    amp = np.sin(np.pi*t/dur)**1.5
    y = y*amp
    # add airy high shelf tail
    y += 0.3*hp(noise,4000)*np.exp(-3*t)
    return y
save("whoosh", whoosh())

# --- pop: short pitch-drop tone (caption keywords, icons, checkmarks) ---
def pop(dur=0.13):
    n=int(dur*SR); t=np.linspace(0,dur,n)
    f = 900*np.exp(-9*t) + 240                      # drop 900->240
    ph = 2*np.pi*np.cumsum(f)/SR
    y = np.sin(ph)*np.exp(-16*t)
    y += 0.4*np.sin(2*ph)*np.exp(-22*t)
    return y
save("pop", pop(), peak=0.8)

# --- click: soft click (list items / progress) ---
def click(dur=0.05):
    n=int(dur*SR); t=np.linspace(0,dur,n)
    y = bp(rng.standard_normal(n), 1200, 5000)*np.exp(-60*t)
    y += 0.5*np.sin(2*np.pi*1600*t)*np.exp(-80*t)
    return y
save("click", click(), peak=0.6)

# --- ding / chime: decaying harmonics (PRO TIP, checklist completions) ---
def ding(dur=0.9):
    n=int(dur*SR); t=np.linspace(0,dur,n)
    base=932.3  # ~Bb5
    parts=[(1,1.0,5),(2.01,0.5,6),(3.0,0.28,8),(4.02,0.16,10),(5.4,0.09,12)]
    y=np.zeros(n)
    for mult,amp,dec in parts:
        y+=amp*np.sin(2*np.pi*base*mult*t)*np.exp(-dec*t)
    return y
save("ding", ding(), peak=0.8)

# --- riser: rising tone + noise ~1.5s (before "my biggest tip") ---
def riser(dur=1.5):
    n=int(dur*SR); t=np.linspace(0,dur,n)
    f = 180*np.exp(2.3*t/dur*np.log(6))             # 180 -> ~1080 exp rise
    ph=2*np.pi*np.cumsum(f)/SR
    tone=np.sin(ph)+0.4*np.sin(2*ph)
    nz = bp(rng.standard_normal(n), 500, 6000)
    sweepcut = 800 + 6000*(t/dur)
    nz = nz*(t/dur)**2
    y = 0.6*tone*(t/dur)**1.5 + 0.9*nz
    y *= (t/dur)**0.6                                # overall crescendo
    # subtle tremolo
    y *= 1+0.15*np.sin(2*np.pi*8*t)
    return y
save("riser", riser(), peak=0.85)

# --- flash: tight impact+airy for PRO TIP flash transition ---
def flash(dur=0.35):
    n=int(dur*SR); t=np.linspace(0,dur,n)
    imp = bp(rng.standard_normal(n), 200, 8000)*np.exp(-22*t)
    tone = np.sin(2*np.pi*660*t)*np.exp(-9*t)
    return imp*0.8+tone*0.5
save("flash", flash(), peak=0.8)

print("SFX done.")
