import { Composition, continueRender, delayRender } from 'remotion';
import { useEffect, useState } from 'react';
import '@fontsource/montserrat/800.css';
import '@fontsource/montserrat/700.css';
import '@fontsource/poppins/600.css';
import '@fontsource/poppins/700.css';
import '@fontsource/poppins/500.css';
import { Reel } from './Reel';
import { FPS, W, H, DUR_S } from './theme';

const useFonts = () => {
  const [handle] = useState(() => delayRender('fonts'));
  useEffect(() => {
    const want = [
      '800 64px Montserrat',
      '700 48px Montserrat',
      '600 48px Poppins',
      '700 48px Poppins',
      '500 40px Poppins',
    ];
    Promise.all(want.map((f) => (document as any).fonts.load(f)))
      .then(() => (document as any).fonts.ready)
      .then(() => continueRender(handle))
      .catch(() => continueRender(handle));
  }, [handle]);
};

export const RemotionRoot: React.FC = () => {
  useFonts();
  return (
    <Composition
      id="reel"
      component={Reel}
      durationInFrames={Math.round(DUR_S * FPS)}
      fps={FPS}
      width={W}
      height={H}
    />
  );
};
