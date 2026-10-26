import { useCurrentFrame, useVideoConfig, staticFile, interpolate, spring, Img } from 'remotion';
import { C, F, W, H, easeOutCubic } from '../theme';
import { camera } from '../zoom';
import brand from '../../brand.config';
import manifest from '../../public/masks/manifest.json';

const MFPS = (manifest as any).fps as number;
const MCOUNT = (manifest as any).count as number;

export const Hook: React.FC = () => {
  const frame = useCurrentFrame(); // local to hook sequence
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const cam = camera(t);

  const rise = spring({ frame, fps, config: { damping: 20, mass: 0.9 } });
  const headY = interpolate(rise, [0, 1], [60, 0]);
  const headOp = interpolate(frame, [0, 10], [0, 1], { extrapolateRight: 'clamp' });

  // person cutout frame index (mask seq @ MFPS)
  const mi = Math.min(MCOUNT - 1, Math.max(0, Math.round((frame / fps) * MFPS)));
  const maskSrc = staticFile(`masks/fg_${String(mi).padStart(4, '0')}.png`);

  const chip = spring({ frame: frame - 8, fps, config: { damping: 12, mass: 0.6 } });

  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      {/* darken background so the behind-subject headline reads (person cutout
          re-brightens her on top); also dims the burned-in intro text */}
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(12,7,5,0.5)' }} />
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(85% 55% at 50% 40%, rgba(0,0,0,0.5), rgba(0,0,0,0) 70%)',
        }}
      />

      {/* headline BEHIND subject (wide so sides emerge beside her head) */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: H * 0.13,
          textAlign: 'center',
          transform: `translateY(${headY}px)`,
          opacity: headOp,
        }}
      >
        <div
          style={{
            fontFamily: F.cap,
            fontWeight: 800,
            fontSize: 140,
            lineHeight: 0.96,
            color: '#fff',
            letterSpacing: '-3px',
            textShadow: '0 8px 30px rgba(0,0,0,0.6)',
            textTransform: 'uppercase',
          }}
        >
          I STOPPED
          <br />
          <span style={{ color: C.caramel }}>NUMBING</span>
          <br />
          MY CLIENTS
        </div>
      </div>

      {/* person cutout ON TOP of headline -> text appears behind her */}
      <Img
        src={maskSrc}
        style={{
          position: 'absolute',
          width: W,
          height: H,
          objectFit: 'cover',
          transform: `scale(${cam.scale})`,
          transformOrigin: `${cam.fx * 100}% ${cam.fy * 100}%`,
        }}
      />

      {/* bottom brand band (front) — SOLID over burned-in intro captions */}
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
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: H * 0.1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 22,
        }}
      >
        <div
          style={{
            transform: `scale(${0.6 + 0.4 * easeOutCubic(Math.min(1, chip))})`,
            opacity: Math.min(1, chip),
            padding: '12px 34px',
            borderRadius: 999,
            background: `linear-gradient(90deg, ${C.accent}, ${C.caramel})`,
            fontFamily: F.cap,
            fontWeight: 800,
            fontSize: 58,
            color: C.ink,
            letterSpacing: 1,
            boxShadow: `0 10px 30px rgba(185,119,76,0.5)`,
          }}
        >
          {brand.hook.accentChip}
        </div>
        <div
          style={{
            fontFamily: F.slide,
            fontWeight: 600,
            fontSize: 46,
            color: '#fff',
            opacity: interpolate(frame, [14, 26], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }),
            letterSpacing: 0.5,
          }}
        >
          {brand.hook.sub}
        </div>
      </div>
    </div>
  );
};
