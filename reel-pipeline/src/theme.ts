import brand from '../brand.config';

export { brand };
export const FPS = 30;
export const W = 1080;
export const H = 1920;
export const DUR_S = (require('./data/words_cut.json') as any).out_total as number;

export const C = brand.color;
export const F = {
  cap: `'${brand.font.caption}', system-ui, sans-serif`,
  slide: `'${brand.font.slide}', system-ui, sans-serif`,
};

// Instagram safe zones (px)
export const SAFE = {
  top: Math.round(H * brand.safe.top),
  bottom: Math.round(H * brand.safe.bottom), // keep clear BELOW H-bottom
  right: Math.round(W * brand.safe.right),
};
// burned-in caption band that must stay covered (px)
export const DIRTY = {
  top: Math.round(H * brand.dirtyBand.top),
  bottom: Math.round(H * brand.dirtyBand.bottom),
};

export const sec = (s: number) => Math.round(s * FPS);

export const KEYWORDS = new Set(brand.keywords.map((k) => k.toLowerCase()));
export const isKeyword = (w: string) =>
  KEYWORDS.has(w.toLowerCase().replace(/[^a-z']/g, ''));

// easing
export const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
export const easeInOutCubic = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
