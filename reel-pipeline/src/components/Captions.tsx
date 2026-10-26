import { useCurrentFrame, useVideoConfig } from 'remotion';
import { C, F, isKeyword, easeOutCubic, W } from '../theme';
import { buildLines, activeLine, Line } from '../words';

const LINES = buildLines(3);

export const Captions: React.FC<{
  centerY: number; // px
  size?: number;
  plate?: boolean;
  maxWidth?: number;
}> = ({ centerY, size = 72, plate = true, maxWidth = 920 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const line: Line | null = activeLine(LINES, t);
  if (!line) return null;

  // show only words already started (build word-by-word); keep whole line once last word spoken
  const visible = line.words.filter((w) => t >= w.start - 0.02);
  if (!visible.length) return null;

  return (
    <div
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        top: centerY,
        transform: 'translateY(-50%)',
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '0 18px',
        padding: '0 80px',
        maxWidth,
        margin: '0 auto',
      }}
    >
      {plate && (
        <div
          style={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            transform: 'translate(-50%,-50%)',
            width: Math.min(maxWidth, W - 120),
            height: size * (visible.length > 3 ? 2.6 : 1.7),
            background: 'rgba(24,14,10,0.0)',
            borderRadius: 28,
            filter: 'blur(0px)',
            zIndex: -1,
          }}
        />
      )}
      {visible.map((w) => {
        const age = t - w.start;
        const pop = easeOutCubic(Math.min(1, age / 0.12));
        const scale = 0.9 + 0.1 * pop;
        const key = isKeyword(w.word);
        return (
          <span
            key={w.i}
            style={{
              fontFamily: F.cap,
              fontWeight: 800,
              fontSize: size,
              lineHeight: 1.05,
              color: key ? C.capKey : C.capBase,
              transform: `scale(${scale})`,
              opacity: 0.35 + 0.65 * pop,
              letterSpacing: '-0.5px',
              textTransform: 'uppercase',
              textShadow:
                '0 3px 10px rgba(0,0,0,0.55), 0 1px 2px rgba(0,0,0,0.7), 0 0 2px rgba(0,0,0,0.5)',
              WebkitTextStroke: key ? '0.5px rgba(80,40,20,0.25)' : undefined,
              display: 'inline-block',
            }}
          >
            {w.word.replace(/[,]$/, '')}
          </span>
        );
      })}
    </div>
  );
};
