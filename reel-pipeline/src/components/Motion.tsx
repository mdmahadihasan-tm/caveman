import { useCurrentFrame, useVideoConfig, interpolate, spring } from 'remotion';
import { C, F, W, H, easeOutCubic } from '../theme';
import brand from '../../brand.config';

export const ProgressBar: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const p = frame / (durationInFrames - 1);
  return (
    <div style={{ position: 'absolute', top: 0, left: 0, width: W, height: 10 }}>
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.14)' }} />
      <div
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          height: '100%',
          width: `${p * 100}%`,
          background: `linear-gradient(90deg, ${C.accentDeep}, ${C.caramel})`,
          boxShadow: `0 0 12px ${C.caramel}`,
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: `calc(${p * 100}% - 7px)`,
          top: -2,
          width: 14,
          height: 14,
          borderRadius: 7,
          background: '#fff',
          boxShadow: `0 0 12px ${C.caramel}`,
        }}
      />
    </div>
  );
};

export const LowerThird: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const inP = spring({ frame, fps, config: { damping: 18, mass: 0.7 } });
  const out = interpolate(frame, [durationInFrames - 8, durationInFrames], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const x = interpolate(inP, [0, 1], [-520, 0]) + interpolate(out, [0, 1], [0, -520]);
  const op = interpolate(inP, [0, 1], [0, 1]) * (1 - out);
  return (
    <div
      style={{
        position: 'absolute',
        left: 56,
        top: H * 0.5,
        transform: `translateX(${x}px)`,
        opacity: op,
        display: 'flex',
        alignItems: 'center',
        gap: 16,
      }}
    >
      <div
        style={{
          width: 8,
          height: 64,
          borderRadius: 4,
          background: `linear-gradient(${C.caramel}, ${C.accentDeep})`,
        }}
      />
      <div
        style={{
          padding: '14px 26px',
          borderRadius: 18,
          background: 'rgba(28,18,13,0.72)',
          backdropFilter: 'blur(6px)',
          border: `1px solid rgba(217,160,102,0.35)`,
        }}
      >
        <div
          style={{
            fontFamily: F.slide,
            fontWeight: 700,
            fontSize: 44,
            color: '#fff',
            lineHeight: 1,
          }}
        >
          {brand.artist}
        </div>
        <div
          style={{
            fontFamily: F.slide,
            fontWeight: 500,
            fontSize: 28,
            color: C.caramel,
            letterSpacing: 2,
            marginTop: 6,
            textTransform: 'uppercase',
          }}
        >
          {brand.role}
        </div>
      </div>
    </div>
  );
};

// always-on bottom cover: guarantees the burned-in caption band (≈0.54–0.82H)
// is hidden in every layout, and gives caption contrast in full beats.
export const BottomCover: React.FC<{ op?: number }> = ({ op = 1 }) => (
  <div
    style={{
      position: 'absolute',
      left: 0,
      right: 0,
      top: H * 0.46,
      bottom: 0,
      opacity: op,
      background: `linear-gradient(to bottom,
        rgba(20,12,9,0) 0%,
        rgba(20,12,9,0.5) 14%,
        rgba(20,12,9,0.9) 26%,
        ${C.ink} 33%,
        ${C.ink} 100%)`,
      pointerEvents: 'none',
    }}
  />
);

// opaque brand panel for split layouts (face top / slide bottom)
export const PANEL_TOP = Math.round(H * 0.5);
export const SplitPanel: React.FC<{ children?: React.ReactNode; enter?: number }> = ({
  children,
  enter = 1,
}) => {
  const y = (1 - easeOutCubic(enter)) * (H - PANEL_TOP);
  return (
    <div
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        top: PANEL_TOP,
        height: H - PANEL_TOP,
        transform: `translateY(${y}px)`,
        background: `linear-gradient(to bottom, ${C.cream}, ${C.beige})`,
        borderTopLeftRadius: 44,
        borderTopRightRadius: 44,
        boxShadow: '0 -24px 60px rgba(0,0,0,0.45)',
        overflow: 'hidden',
      }}
    >
      {/* soft top sheen */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(120% 60% at 50% 0%, rgba(255,255,255,0.5), rgba(255,255,255,0) 60%)',
          pointerEvents: 'none',
        }}
      />
      {children}
    </div>
  );
};

export const GrainVignette: React.FC = () => (
  <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
    <div
      style={{
        position: 'absolute',
        inset: 0,
        background:
          'radial-gradient(130% 100% at 50% 42%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.28) 100%)',
      }}
    />
    <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.05 }}>
      <filter id="n">
        <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch" />
        <feColorMatrix type="saturate" values="0" />
      </filter>
      <rect width="100%" height="100%" filter="url(#n)" />
    </svg>
  </div>
);
