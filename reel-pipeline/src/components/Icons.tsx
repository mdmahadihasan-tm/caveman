// Minimal line icons drawn in code (no emoji fonts). stroke = currentColor.
type P = { size?: number; color?: string; sw?: number };
const base = (size = 72, color = 'currentColor') => ({
  width: size,
  height: size,
  viewBox: '0 0 48 48',
  fill: 'none',
  stroke: color,
  strokeWidth: 3,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
});

export const IconCheck: React.FC<P> = ({ size, color, sw = 4 }) => (
  <svg {...base(size, color)} strokeWidth={sw}>
    <path d="M10 25 L20 35 L39 13" />
  </svg>
);
export const IconNeedle: React.FC<P> = ({ size, color }) => (
  <svg {...base(size, color)}>
    <path d="M8 40 L34 14" />
    <path d="M30 10 L38 18 L34 22 L26 14 Z" />
    <path d="M8 40 L12 38" />
  </svg>
);
export const IconHand: React.FC<P> = ({ size, color }) => (
  <svg {...base(size, color)}>
    <path d="M18 28 V14 a3 3 0 0 1 6 0 V26" />
    <path d="M24 26 V12 a3 3 0 0 1 6 0 V26" />
    <path d="M30 26 V16 a3 3 0 0 1 6 0 V30 a10 10 0 0 1-10 10 h-4 a8 8 0 0 1-7-5 l-4-8 a3 3 0 0 1 5-3 l3 4" />
    <path d="M38 12 l5-3 M40 18 l6 0" />
  </svg>
);
export const IconMachine: React.FC<P> = ({ size, color }) => (
  <svg {...base(size, color)}>
    <rect x="20" y="6" width="8" height="26" rx="4" />
    <path d="M24 32 L24 40" />
    <path d="M24 44 l-2 0 M24 44 l2 0" />
    <path d="M8 14 q4 4 0 8 M40 14 q-4 4 0 8" />
  </svg>
);
export const IconPressure: React.FC<P> = ({ size, color }) => (
  <svg {...base(size, color)}>
    <path d="M24 6 V26" />
    <path d="M16 18 L24 26 L32 18" />
    <path d="M10 36 h28" />
    <path d="M12 42 h24" />
  </svg>
);
export const IconBulb: React.FC<P> = ({ size, color }) => (
  <svg {...base(size, color)}>
    <path d="M24 6 a13 13 0 0 1 8 23 c-2 2-3 3-3 6 h-10 c0-3-1-4-3-6 a13 13 0 0 1 8-23 Z" />
    <path d="M19 41 h10 M21 45 h6" />
  </svg>
);
export const IconCoffee: React.FC<P> = ({ size, color }) => (
  <svg {...base(size, color)}>
    <path d="M10 20 h24 v8 a10 10 0 0 1-10 10 h-4 a10 10 0 0 1-10-10 Z" />
    <path d="M34 22 h4 a5 5 0 0 1 0 10 h-4" />
    <path d="M16 8 q-2 3 0 6 M24 8 q-2 3 0 6" />
  </svg>
);
export const IconFlower: React.FC<P> = ({ size, color }) => (
  <svg {...base(size, color)}>
    <circle cx="24" cy="24" r="5" />
    <path d="M24 19 q-7-8 0-14 q7 6 0 14" />
    <path d="M24 29 q-7 8 0 14 q7-6 0-14" />
    <path d="M19 24 q-8-7-14 0 q6 7 14 0" />
    <path d="M29 24 q8-7 14 0 q-6 7-14 0" />
  </svg>
);
export const IconArrowUp: React.FC<P> = ({ size, color }) => (
  <svg {...base(size, color)}>
    <path d="M24 40 V10" />
    <path d="M12 22 L24 10 L36 22" />
  </svg>
);
