#!/usr/bin/env python3
"""Procedural calm warm lo-fi bed (no downloaded audio) -> music/bed.wav.
If music/track.mp3 exists, build_mix.py uses that instead."""
import numpy as np, json, os
from scipy.io import wavfile
from scipy.signal import butter, sosfilt
SR=48000
os.makedirs("music", exist_ok=True)
cp=json.load(open("transcript/cutplan.json")); DUR=cp["out_total"]+0.3

def sos_lp(x,hz):
    return sosfilt(butter(4,hz/(SR/2),btype="low",output="sos"),x)
def sos_hp(x,hz):
    return sosfilt(butter(2,hz/(SR/2),btype="high",output="sos"),x)

rng=np.random.default_rng(11)
N=int(DUR*SR); t=np.arange(N)/SR

def note(freq,start,dur,amp,partials=((1,1.0),(2,0.35),(3,0.14)),atk=0.08,rel=0.5,vib=4.5,vibd=0.004):
    n=int(dur*SR); i0=int(start*SR)
    if i0>=N: return
    tt=np.arange(n)/SR
    e=np.ones(n)
    a=int(atk*SR); r=int(rel*SR)
    if a>0: e[:a]=np.linspace(0,1,a)
    if r>0: e[-r:]=np.linspace(1,0,r)*e[-r:]
    fm=freq*(1+vibd*np.sin(2*np.pi*vib*tt))
    ph=2*np.pi*np.cumsum(fm)/SR
    y=sum(a2*np.sin(k*ph) for k,a2 in partials)*e*amp
    j=min(N,i0+n); buf[i0:j]+=y[:j-i0]

buf=np.zeros(N)
# ---- chords: I - vi - IV - V in C (Cmaj7, Am7, Fmaj7, G7) ----
BPM=74; beat=60/BPM; bar=4*beat
def hz(m): return 440*2**((m-69)/12)
# midi notes
chords=[[60,64,67,71],[57,60,64,67],[53,57,60,64],[55,59,62,65]]
nbars=int(np.ceil(DUR/bar))+1
for b in range(nbars):
    ch=chords[b%4]; st=b*bar
    for k,mnote in enumerate(ch):
        note(hz(mnote-12 if k==0 else mnote), st, bar*1.02, 0.14 if k else 0.17,
             partials=((1,1.0),(2,0.28),(3,0.1),(4,0.05)), atk=0.22, rel=bar*0.5, vib=3.5)
    # soft bass root (octave below) plucked twice per bar
    for sub in (0, 2):
        note(hz(ch[0]-24), st+sub*beat, beat*1.6, 0.22,
             partials=((1,1.0),(2,0.2)), atk=0.01, rel=0.4, vib=0)

pads=sos_lp(buf,5200)*0.9

# ---- soft percussion ----
perc=np.zeros(N)
for b in range(nbars):
    st=b*bar
    for beatpos in (0,2):            # soft kick on 1 & 3
        i0=int((st+beatpos*beat)*SR)
        if i0<N:
            k=int(0.18*SR); tt=np.arange(k)/SR
            f=110*np.exp(-28*tt)+45
            kick=np.sin(2*np.pi*np.cumsum(f)/SR)*np.exp(-16*tt)*0.5
            j=min(N,i0+k); perc[i0:j]+=kick[:j-i0]
    for h in range(8):               # soft hats on 8ths (offbeat emphasis)
        i0=int((st+h*0.5*beat)*SR)
        if i0<N:
            k=int(0.06*SR); tt=np.arange(k)/SR
            amp=0.05 if h%2 else 0.03
            hat=sos_hp(rng.standard_normal(k),7000)*np.exp(-60*tt)*amp
            j=min(N,i0+k); perc[i0:j]+=hat[:j-i0]

# ---- vinyl crackle + air ----
crackle=np.zeros(N)
idx=rng.integers(0,N,size=int(DUR*55))
crackle[idx]=rng.standard_normal(len(idx))*0.06
crackle=sos_hp(crackle,2000)
hiss=sos_hp(rng.standard_normal(N),6000)*0.006

mix=pads + perc*0.8 + crackle*0.5 + hiss
# gentle master lowpass + fade
mix=sos_lp(mix,8000)
f=int(1.2*SR); mix[:f]*=np.linspace(0,1,f); mix[-f:]*=np.linspace(1,0,f)
mix=mix/(np.max(np.abs(mix))+1e-9)*0.5
st=np.stack([mix,np.roll(mix,120)],axis=1)   # tiny stereo widen
wavfile.write("music/bed.wav",SR,(st*32767).astype(np.int16))
print(f"music/bed.wav  {DUR:.1f}s  @{BPM}bpm  I-vi-IV-V lo-fi")
