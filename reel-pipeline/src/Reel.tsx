import { AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { C, H, sec } from './theme';
import { SCENES, sceneAt } from './scenes';
import { BaseVideo } from './components/BaseVideo';
import { Captions } from './components/Captions';
import { ProgressBar, LowerThird, BottomCover, GrainVignette } from './components/Motion';
import { Hook } from './components/Hook';
import {
  SkinSlide, HealedSlide, IconsSlide, ThreeSlide, ProTipSlide, CaffeineSlide, ToolsSlide, CtaSlide,
} from './components/Slides';

const slideWin = (slide: string) => {
  const sc = SCENES.find((x) => x.slide === slide)!;
  return { start: sc.s, end: sc.e };
};

export const Reel: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const sc = sceneAt(t);
  const showCaps = sc.layout === 'full' && sc.caps;

  return (
    <AbsoluteFill style={{ background: C.ink }}>
      <BaseVideo />

      {/* always-on cover: hides the burned-in caption band in every layout */}
      <BottomCover />

      <GrainVignette />

      {/* animated slides (self-gating by time) */}
      <SkinSlide {...slideWin('skin')} />
      <HealedSlide {...slideWin('healed')} />
      <IconsSlide {...slideWin('icons')} />
      <ThreeSlide {...slideWin('three')} />
      <ProTipSlide {...slideWin('protip')} />
      <CaffeineSlide {...slideWin('caffeine')} />
      <ToolsSlide {...slideWin('tools')} />
      <CtaSlide {...slideWin('cta')} />

      {/* hook (0..3.6s) */}
      <Sequence from={0} durationInFrames={sec(3.7)} name="Hook">
        <Hook />
      </Sequence>

      {/* word-by-word captions in the clean zone during full-layout beats */}
      {showCaps && <Captions centerY={Math.round(H * 0.645)} size={66} maxWidth={780} />}

      {/* lower third name card */}
      <Sequence from={sec(3.95)} durationInFrames={sec(3.0)} name="LowerThird">
        <LowerThird />
      </Sequence>

      <ProgressBar />

      <Audio src={staticFile('audio/mix.wav')} />
    </AbsoluteFill>
  );
};
