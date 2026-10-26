# Reel Pipeline — studio-quality Instagram Reels (Remotion)

A reusable pipeline that turns one vertical talking-head clip into a polished
1080×1920 / 30 fps reel: auto transcription, breath-cut pacing, upscale + color
grade, word-by-word captions, animated slides (no b-roll), text-behind-subject
hook, motion graphics, and a fully procedural sound mix.

Built for Karilyn May (`@karilynmay.pmu`); reusable for any client.

---

## Reuse for a new client (the 2-file swap)

1. Drop the new footage at **`public/raw.mp4`**.
2. Edit **`brand.config.ts`** (name, handle, colors, fonts, hook text, CTA).
3. Run the pipeline:

```bash
npm run pipeline      # transcribe → plan → sfx → base → masks → music → mix
npm run preview       # output/preview.mp4  (fast, half-res)
npm run final         # output/final.mp4    (1080×1920, 30fps)
```

That re-renders the whole reel with the new branding. For a **different script**,
the transcript drives everything (`transcript/words_cut.json`); the slide anchor
times in `src/components/Slides.tsx` + `src/scenes.ts` are keyed to spoken
moments and should be re-pointed to the new content's keywords (see EDIT_PLAN.md
for how anchors map to words).

---

## How each piece works (plain language)

| Stage | Tool | What it does |
|-------|------|--------------|
| **Transcribe** | faster-whisper → *(fallback)* burned-in-caption OCR + pocketsphinx | word-level timestamps → `transcript/transcript.json`. Drives **all** captions, pop-ups and SFX timing. |
| **Plan / cut** | Python + FFmpeg silencedetect | finds breaths, removes dead air, adds a gentle global speed to hit 50–55 s → `transcript/cutplan.json`, `words_cut.json` |
| **Base video** | FFmpeg | cut → concat → 1.15× speed → 1080×1920 **lanczos** upscale → warm grade (exposure lift, warm skin, vignette, light sharpen) → `public/base.mp4` |
| **Person matte** | OpenCV GrabCut | offline silhouette for the **text-behind-subject** hook → `public/masks/` |
| **Voice** | FFmpeg | breath-cut, de-ess, gentle noise reduction, −14 LUFS → `audio/voice_proc.wav` |
| **Music** | Python (numpy) | procedural calm lo-fi bed (I–vi–IV–V), no downloaded audio → `music/bed.wav` |
| **SFX** | Python (numpy) | whoosh / pop / ding / riser / click / flash → `sfx/*.wav` |
| **Mix** | FFmpeg | voice priority + music **sidechain-ducked** under speech + subtle SFX → −14 LUFS, TP < −1 → `public/audio/mix.wav` |
| **Compose + render** | Remotion (React/TS) | captions, slides, motion graphics, hook; `output/final.mp4` |

### Burned-in captions
This footage already had burned-in yellow captions (lower-middle band). The
pipeline **detects and hides** them: every layout draws an opaque brand cover /
split-screen panel / blur card over that band, so new captions are never stacked
on the old ones. Config lives in `brand.config.ts > dirtyBand`.

### Add your own music
Drop `music/track.mp3` and re-run `npm run mix` — it's used instead of the
generated bed (still ducked under the voice).

---

## Requirements
- Node ≥ 18, Python ≥ 3.10 (`.venv` with faster-whisper / rapidocr / pocketsphinx /
  opencv / numpy / scipy — see `scripts/`), FFmpeg, a Chromium for Remotion.
- `remotion.config.ts` points Remotion at a preinstalled Chromium
  (`REMOTION_BROWSER` env overrides).

## Layout
```
brand.config.ts     client branding (single source of truth)
EDIT_PLAN.md         timestamped shot list
scripts/             python/ffmpeg stages
src/                 Remotion composition (Reel, scenes, slides, captions, motion)
transcript/          transcript + cut plan (generated)
public/              raw.mp4, base.mp4, masks/, audio/   (Remotion assets)
sfx/ music/          generated audio
output/              preview.mp4, final.mp4
```
