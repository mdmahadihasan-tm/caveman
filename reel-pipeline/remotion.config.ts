import { Config } from '@remotion/cli/config';

Config.setVideoImageFormat('jpeg');
Config.setOverwriteOutput(true);
Config.setConcurrency(4);
// Use the pre-installed Chromium (no download through the egress proxy).
Config.setBrowserExecutable(
  process.env.REMOTION_BROWSER ||
    '/opt/pw-browsers/chromium-1243/chrome-linux64/chrome'
);
Config.setChromiumOpenGlRenderer('angle');
