/**
 * brand.config.ts — single source of truth for client branding.
 * ─────────────────────────────────────────────────────────────
 * To reuse this template for a new client:
 *   1. Replace public/raw.mp4 with the new footage.
 *   2. Edit the values in this file (name, handle, colors, fonts, hook).
 *   3. Re-run:  npm run pipeline     (transcribe → cut → sfx → base → render)
 *
 * Colors: this client supplied none, so we use a soft nude/beige/pink
 * palette with a warm-brown accent (brief default). Captions sit on dark
 * footage, so caption base is near-white with accent-colored keywords.
 */

export type Brand = typeof brand;

export const brand = {
  artist: 'Karilyn May',
  handle: '@karilynmay.pmu',
  role: 'PMU Artist',

  // ---- palette ----
  color: {
    // slide / card surfaces (warm nude system)
    cream: '#F5EBE1',
    beige: '#E9D7C7',
    blush: '#EAC2B2',
    pink: '#E3A892',
    // ink + accents
    ink: '#3A2A22', // deep espresso — text on light cards
    inkSoft: '#6B544A',
    accent: '#B9774C', // warm brown — primary accent
    accentDeep: '#8A5636', // darker brown for depth/strokes
    caramel: '#D9A066', // bright warm highlight that pops on dark video
    // caption system (over video)
    capBase: '#FFFFFF',
    capKey: '#D9A066', // keyword highlight (warm caramel, reads on dark)
    capShadow: 'rgba(0,0,0,0.55)',
    // utility
    good: '#6FA06B',
    strike: '#C0503B',
  },

  // keywords that get highlighted in accent color when spoken
  keywords: [
    'needle', 'needles', 'healed', 'skin', 'technique', 'color', 'pressure',
    'numbing', 'prenumbing', 'texture', 'speed', 'speeds', 'machine', 'tools',
    'adjustments', 'anesthetic', 'caffeine', 'sensitive',
  ],

  // ---- type ----
  font: {
    caption: 'Montserrat', // ExtraBold (800) for captions
    captionWeight: 800,
    slide: 'Poppins', // slides / cards
    slideWeight: 600,
    slideWeightBold: 700,
  },

  // ---- hook (0–3s) ----
  hook: {
    line1: 'I STOPPED NUMBING',
    line2: 'MY CLIENTS',
    sub: "here's what happened",
    accentChip: '2 YEARS',
  },

  // ---- CTA / ending ----
  cta: {
    save: 'Save this for your next client',
    follow: 'Follow @karilynmay.pmu for more PMU tips',
  },

  // Instagram safe zones (fraction of 1920 height / 1080 width kept clear)
  safe: { bottom: 0.20, right: 0.15, top: 0.08 },

  // burned-in caption band in the SOURCE footage that must stay covered
  // (fraction of frame height) — never place new captions above this cleanly
  dirtyBand: { top: 0.54, bottom: 0.82 },
} as const;

export default brand;
