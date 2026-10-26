export type Layout = 'hook' | 'full' | 'split' | 'overlay' | 'cta';
export type Scene = {
  s: number;
  e: number;
  layout: Layout;
  slide?: 'skin' | 'healed' | 'icons' | 'three' | 'protip' | 'caffeine' | 'tools' | 'cta';
  caps?: boolean; // show centered word-by-word captions in clean zone
};

export const SCENES: Scene[] = [
  { s: 0.0, e: 3.6, layout: 'hook' },
  { s: 3.6, e: 4.84, layout: 'full', caps: true },
  { s: 4.84, e: 7.1, layout: 'full', caps: true },
  { s: 7.1, e: 14.59, layout: 'split', slide: 'skin', caps: true },
  { s: 14.59, e: 18.57, layout: 'split', slide: 'healed', caps: true },
  { s: 18.57, e: 25.0, layout: 'full', caps: true },
  { s: 25.0, e: 30.42, layout: 'split', slide: 'icons', caps: true },
  { s: 30.42, e: 36.74, layout: 'overlay', slide: 'three' },
  { s: 36.74, e: 39.0, layout: 'overlay', slide: 'protip' },
  { s: 39.0, e: 45.17, layout: 'overlay', slide: 'caffeine' },
  { s: 45.17, e: 47.37, layout: 'overlay', slide: 'tools' },
  { s: 47.37, e: 51.3, layout: 'full', caps: true },
  { s: 51.3, e: 55.0, layout: 'cta', slide: 'cta' },
];

export function sceneAt(t: number): Scene {
  for (const sc of SCENES) if (t >= sc.s && t < sc.e) return sc;
  return SCENES[SCENES.length - 1];
}

// smoothed "lift" (px) that raises the subject for split layouts
export function videoLift(t: number): number {
  const target = (tt: number) => {
    const sc = sceneAt(tt);
    return sc.layout === 'split' ? -150 : sc.layout === 'cta' ? -40 : 0;
  };
  // simple temporal smoothing over +-0.4s
  let acc = 0,
    n = 0;
  for (let d = -0.4; d <= 0.4; d += 0.1) {
    acc += target(Math.max(0, t + d));
    n++;
  }
  return acc / n;
}
