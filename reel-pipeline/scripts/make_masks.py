#!/usr/bin/env python3
"""Offline person matte for the HOOK text-behind-subject effect.
Haar face detection seeds GrabCut on each base.mp4 hook frame; mask is
feathered + temporally smoothed; writes RGBA person-cutout PNGs to public/masks/.
No downloaded models (OpenCV Haar cascade + GrabCut only)."""
import cv2, numpy as np, os, json, sys
os.makedirs("public/masks", exist_ok=True)

HOOK_END = float(sys.argv[1]) if len(sys.argv)>1 else 4.0
FPS = int(sys.argv[2]) if len(sys.argv)>2 else 30
PREVIEW = "--preview" in sys.argv
CW, CH = 720, 1280   # cutout resolution (overlaid scaled to 1080x1920)

cap = cv2.VideoCapture("public/base.mp4")
srcfps = cap.get(cv2.CAP_PROP_FPS)

def matte(bgr_full, prev_rect):
    Hf, Wf = bgr_full.shape[:2]
    bgr = cv2.resize(bgr_full, (Wf//2, Hf//2))   # grabcut at half-res for speed
    H, W = bgr.shape[:2]
    # Stable centered talking-head framing -> fixed head/torso seed with a
    # mask-based GrabCut: sure-FG core column, probable elsewhere, sure-BG borders.
    mask = np.full((H,W), cv2.GC_PR_BGD, np.uint8)
    # probable foreground: wide head+torso region
    gx, gx2 = int(W*0.14), int(W*0.86)
    gy, gy2 = int(H*0.07), int(H*0.99)
    mask[gy:gy2, gx:gx2] = cv2.GC_PR_FGD
    # sure foreground core: face + neck + chest centerline
    cx = int(W*0.47)
    mask[int(H*0.16):int(H*0.52), int(cx-W*0.17):int(cx+W*0.17)] = cv2.GC_FGD   # face/hair
    mask[int(H*0.52):int(H*0.95), int(cx-W*0.22):int(cx+W*0.22)] = cv2.GC_FGD   # torso
    # sure background: top corners + far side columns
    mask[0:int(H*0.10), :] = cv2.GC_BGD
    mask[:, 0:int(W*0.05)] = cv2.GC_BGD
    mask[:, int(W*0.95):] = cv2.GC_BGD
    bgd = np.zeros((1,65), np.float64); fgd = np.zeros((1,65), np.float64)
    try:
        cv2.grabCut(bgr, mask, None, bgd, fgd, 5, cv2.GC_INIT_WITH_MASK)
    except Exception:
        pass
    m = np.where((mask==cv2.GC_FGD)|(mask==cv2.GC_PR_FGD),255,0).astype(np.uint8)
    # keep largest connected component
    n,lab,stats,_ = cv2.connectedComponentsWithStats(m,8)
    if n>1:
        big = 1+np.argmax(stats[1:,cv2.CC_STAT_AREA])
        m = np.where(lab==big,255,0).astype(np.uint8)
    m = cv2.morphologyEx(m, cv2.MORPH_CLOSE, np.ones((9,9),np.uint8))
    m = cv2.morphologyEx(m, cv2.MORPH_OPEN, np.ones((5,5),np.uint8))
    return cv2.resize(m, (Wf, Hf))   # back to full res

n_frames = int(HOOK_END*FPS)
prev_rect=None; ema=None; manifest=[]
for i in range(n_frames):
    t = i/FPS
    cap.set(cv2.CAP_PROP_POS_MSEC, t*1000)
    ok, frame = cap.read()
    if not ok: break
    m = matte(frame, prev_rect)
    mf = m.astype(np.float32)
    ema = mf if ema is None else 0.6*mf+0.4*ema       # temporal smooth
    ms = ema.astype(np.uint8)
    ms = cv2.GaussianBlur(ms,(0,0),4.0)               # feather edges
    # build RGBA cutout at CW x CH
    fr = cv2.resize(frame,(CW,CH)); al = cv2.resize(ms,(CW,CH))
    rgba = cv2.cvtColor(fr, cv2.COLOR_BGR2BGRA); rgba[:,:,3]=al
    outp = f"public/masks/fg_{i:04d}.png"
    cv2.imwrite(outp, rgba)
    manifest.append(outp)
    if PREVIEW and i in (0, n_frames//2, n_frames-1):
        cv2.imwrite(f"_probe/matte_{i:04d}.png", np.hstack([cv2.resize(frame,(CW//2,CH//2)),
                    cv2.cvtColor(cv2.resize(ms,(CW//2,CH//2)),cv2.COLOR_GRAY2BGR)]))
cap.release()
json.dump({"fps":FPS,"count":len(manifest),"w":CW,"h":CH,"hook_end":HOOK_END},
          open("public/masks/manifest.json","w"))
print(f"wrote {len(manifest)} hook mattes @ {FPS}fps ({HOOK_END}s)")
