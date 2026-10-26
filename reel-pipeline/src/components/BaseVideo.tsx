import { OffthreadVideo, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { camera } from '../zoom';
import { videoLift } from '../scenes';
import { W, H } from '../theme';

export const BaseVideo: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const cam = camera(t);
  const lift = videoLift(t);
  return (
    <div style={{ position: 'absolute', width: W, height: H, overflow: 'hidden' }}>
      <OffthreadVideo
        src={staticFile('base.mp4')}
        style={{
          width: W,
          height: H,
          objectFit: 'cover',
          transform: `translateY(${lift}px) scale(${cam.scale})`,
          transformOrigin: `${cam.fx * 100}% ${cam.fy * 100}%`,
        }}
        // base.mp4 has no audio; final audio is the single mix track
        muted
      />
    </div>
  );
};
