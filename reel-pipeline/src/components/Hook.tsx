import { useCurrentFrame, useVideoConfig, interpolate, spring } from 'remotion';
import { C, F, H, easeOutCubic } from '../theme';
import brand from '../../brand.config';

export const Hook: React.FC = () => {
  const frame = useCurrentFrame(); // local to hook sequence
  const { fps } = useVideoConfig();

  const rise = spring({ frame, fps, config: { damping: 20, mass: 0.9 } });
  const headY = interpolate(rise, [0, 1], [48, 0]);
  const headOp = interpolate(frame, [0, 10], [0, 1], { extrapolateRight: 'clamp' });
  const chip = spring({ frame: frame - 12, fps, config: { damping: 12, mass: 0.6 } });
  const subOp = interpolate(frame, [20, 32], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      {/* bottom brand band (solid) — covers the burned-in intro captions */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: H * 0.49,
          bottom: 0,
          background: `linear-gradient(to bottom, rgba(20,12,9,0) 0%, ${C.ink} 95px, ${C.ink} 100%)`,
        }}
      />

      {/* hook content stacked in the band, BELOW her face */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: H * 0.525,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 26,
          padding: '0 60px',
        }}
      >
        {/* headline */}
        <div
          style={{
            transform: `translateY(${headY}px)`,
            opacity: headOp,
            textAlign: 'center',
            fontFamily: F.cap,
            fontWeight: 800,
            fontSize: 84,
            lineHeight: 1.0,
            color: '#fff',
            letterSpacing: '-1.5px',
            textTransform: 'uppercase',
            textShadow: '0 6px 24px rgba(0,0,0,0.45)',
          }}
        >
          I STOPPED
          <br />
          <span style={{ color: C.caramel }}>NUMBING</span>
          <br />
          MY CLIENTS
        </div>

        {/* 2 YEARS chip */}
        <div
          style={{
            transform: `scale(${0.6 + 0.4 * easeOutCubic(Math.min(1, chip))})`,
            opacity: Math.min(1, chip),
            padding: '10px 30px',
            borderRadius: 999,
            background: `linear-gradient(90deg, ${C.accent}, ${C.caramel})`,
            fontFamily: F.cap,
            fontWeight: 800,
            fontSize: 50,
            color: C.ink,
            letterSpacing: 1,
            boxShadow: `0 10px 30px rgba(185,119,76,0.5)`,
          }}
        >
          {brand.hook.accentChip}
        </div>

        {/* sub */}
        <div
          style={{
            fontFamily: F.slide,
            fontWeight: 600,
            fontSize: 42,
            color: '#fff',
            opacity: subOp,
            letterSpacing: 0.5,
          }}
        >
          {brand.hook.sub}
        </div>
      </div>
    </div>
  );
};
