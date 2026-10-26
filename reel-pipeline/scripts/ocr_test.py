#!/usr/bin/env python3
import sys, cv2, numpy as np
from rapidocr_onnxruntime import RapidOCR
ocr = RapidOCR()
for f in sys.argv[1:]:
    img = cv2.imread(f)
    H, W = img.shape[:2]
    # lower band where burned-in captions live
    roi = img[int(0.52*H):int(0.88*H), :]
    res, _ = ocr(roi)
    toks = []
    if res:
        for box, txt, score in res:
            toks.append("'%s'(%s)" % (txt, score))
    print(f"{f}  H={H} W={W}  ->  {' | '.join(toks) if toks else '(none)'}")
