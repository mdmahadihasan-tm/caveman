import { interpolate } from 'remotion';
import { easeInOutCubic } from './theme';

// camera keyframes in OUTPUT seconds: scale + focal point (fraction of frame)
type KF = { t: number; s: number; fx: number; fy: number };
const KFS: KF[] = [
  { t: 0.0, s: 1.15, fx: 0.47, fy: 0.34 }, // hook
  { t: 3.6, s: 1.185, fx: 0.47, fy: 0.34 }, // hook drift
  { t: 3.9, s: 1.12, fx: 0.47, fy: 0.34 },
  { t: 4.84, s: 1.035, fx: 0.47, fy: 0.36 }, // "for every single..."
  { t: 7.1, s: 1.15, fx: 0.47, fy: 0.29 }, // slide a (split, face up)
  { t: 14.6, s: 1.13, fx: 0.47, fy: 0.29 }, // slide c
  { t: 18.57, s: 1.1, fx: 0.47, fy: 0.34 }, // "when I stopped..."
  { t: 22.0, s: 1.17, fx: 0.47, fy: 0.33 }, // eased zoom "clearly see"
  { t: 25.0, s: 1.14, fx: 0.47, fy: 0.29 }, // slide d (split)
  { t: 30.42, s: 1.13, fx: 0.47, fy: 0.3 }, // slide e
  { t: 36.74, s: 1.05, fx: 0.47, fy: 0.34 }, // "takeaway"
  { t: 37.61, s: 1.17, fx: 0.47, fy: 0.33 }, // PRO TIP punch
  { t: 39.0, s: 1.1, fx: 0.47, fy: 0.33 },
  { t: 45.17, s: 1.08, fx: 0.47, fy: 0.34 }, // "instead"
  { t: 47.37, s: 1.11, fx: 0.47, fy: 0.35 },
  { t: 51.5, s: 1.15, fx: 0.47, fy: 0.34 }, // closing / CTA punch
  { t: 55.0, s: 1.15, fx: 0.47, fy: 0.34 }, // matches opening for loop
];

export function camera(sec: number) {
  let a = KFS[0],
    b = KFS[KFS.length - 1];
  for (let i = 0; i < KFS.length - 1; i++) {
    if (sec >= KFS[i].t && sec <= KFS[i + 1].t) {
      a = KFS[i];
      b = KFS[i + 1];
      break;
    }
  }
  const p = b.t === a.t ? 0 : easeInOutCubic((sec - a.t) / (b.t - a.t));
  const s = a.s + (b.s - a.s) * p + 0.012 * Math.sin(sec * 0.6); // gentle Ken Burns drift
  const fx = a.fx + (b.fx - a.fx) * p;
  const fy = a.fy + (b.fy - a.fy) * p + 0.004 * Math.sin(sec * 0.5);
  return { scale: s, fx, fy };
}
