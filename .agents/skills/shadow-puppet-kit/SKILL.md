---
name: shadow-puppet-kit
description: "Create, build, and animate browser-rendered Shadow Puppet Theatre videos (16:9 explainer and 9:16 vertical reels) with code-drawn lace-cut puppets, backlit cloth screen simulation, Web Audio synthesized soundscapes, and synchronized voiceover."
argument-hint: "[audio_path] [script] [action]"
license: MIT
metadata:
  author: Grow With AST
  version: "1.0.0"
---

# Shadow Puppet Theatre Kit (S9 · Grow With AST)

A complete framework for authoring, previewing, and rendering browser-based **Shadow Puppet Theatre** animations. Puppets are black lace-cut silhouettes on control rods pressed against a lamp-lit cloth screen, drawn entirely with HTML5 Canvas 2D and driven by synthesized Web Audio API soundscapes locked to speech word times.

---

## 1. Aesthetic & Technical Principles

- **Visual Medium:**
  - **Lamp Light:** Radial amber/orange gradient behind a woven cloth texture (`weave()`) with subtle per-frame flame flicker (`NZ.n2()`).
  - **Color Gels:** Punch-outs revealing colored translucent gels (Red `rgb(240,60,46)`, Gold `rgb(255,214,96)`, Sky `rgb(140,200,230)`) composited with `multiply`.
  - **Puppet Cut-Work:** Solid black silhouettes (`INK = 'rgb(20,8,4)'`) cut from "hide/card" using `destination-out` circular punches (`dot`), teardrop slots (`tear`), and rivet pivot pins (`pin`).
  - **Depth of Field:** Puppets held close to the screen have crisp edges (`filter: blur(0.7px)`); puppets held further back blur softly (`filter: blur(1.4px)` to `7px`).
  - **Control Rods:** Thin articulated sticks extending from joints downward beyond the bottom edge of the frame.
  - **Atmosphere:** 12 fps stepped film grain (`grainTile()`), light blooming through screen weave (`screen` composite), and vignette.
- **Sound Medium:**
  - **Zero Audio Samples:** 100% procedurally synthesized Web Audio nodes.
  - **Sound Palette:** Gamelan struck bronze (`gam`), deep resonant gongs (`gong`), dry wooden rod taps (`tap`), hide/paper rustles (`hide`), sliding rods (`slide`), wing flaps (`flap`), reedy calls (`caw`), and warm lamp swells (`swell`).
  - **Tight Audio-Visual Lock:** All visual movements and sound hits trigger off exact word timestamps (`WT`) with a standard visual lead (`LEAD = 0.1s`).

---

## 2. Directory Layout

The kit expects a three-folder video project structure:

```
my_video/
  05_Audio/
    voice_polished.mp3        <- Voiceover file (baked into HTML player as base64)
  06_Edit/
    shadow_puppet/             <- The kit files live here
      lib/
        harness.js             <- Canvas layers, seeded noise, easing, math
        sound.js               <- Web Audio synthesizer engine
      src/
        ref.js                 <- Drawing primitives, puppet helpers, stage furniture
        story.js               <- Word timings (WT), beats, custom puppets, scenes
        sound_score.js         <- Sound cues synced to WT
        storyboard_runner.js   <- Keyframe panels (PANELS) and storyboard renderer
        vertical.js            <- 9:16 layout, top banner, animated word captions (CAPS)
        player.js              <- Interactive 16:9 canvas player with scrubbing & audio sync
        vertical_runner.js     <- 9:16 frame runner
      build.py                 <- Bundles src/ + lib/ into standalone zero-dependency HTML
      render.mjs               <- Puppeteer + ffmpeg frame-by-frame MP4 / WAV exporter
      player_shell.html        <- 16:9 player container
      storyboard_shell.html    <- Storyboard grid container
      vertical_shell.html      <- 9:16 vertical render container
  07_Export/                   <- Rendered MP4s and effects.wav output destination
```

---

## 3. Workflow Guide

### Step 1: Initialize Project & Audio
1. Place the voiceover file at `my_video/05_Audio/voice_polished.mp3`.
2. Extract or copy the shadow puppet kit into `my_video/06_Edit/shadow_puppet/`.
3. Ensure directory `my_video/07_Export/` exists.

### Step 2: Establish Word Timings (`WT`) and Beats
In `src/story.js`:
- Transcribe the audio and map key visual hit words to precise seconds:
  ```javascript
  const WT = {
    start: 0.0,
    trigger1: 2.85,
    action: 6.20,
    climax: 30.25,
    end: 59.29,
  };
  const DURATION = 60.5; // End of audio + ~1.0s hold
  const LEAD = 0.1;      // Visuals precede audio by 0.1s
  const at = (k) => WT[k] - LEAD;
  ```
- Define `SC` (scene change timestamps, aligned with speaker pauses).
- Define `BEATS` array with beat numbers, time ranges, voiceover lines, and on-screen summary cards.

### Step 3: Draw Puppets & Props (`src/story.js` & `src/ref.js`)
Use the established canvas helpers:
- `dot(ctx, x, y, radius)`: Punch circular hole.
- `tear(ctx, x, y, length, width, angle)`: Punch or draw ornamental teardrop.
- `pin(ctx, x, y, radius)`: Draw a mechanical rivet pivot pin with punched ring.
- `cut(ctx, () => { ... })`: Context wrapper executing commands under `destination-out`.
- `pup(st, { blur: 0, alpha: 1 }, (p, g, rods) => { ... })`: Draw puppet `p` (silhouette), `g` (color gels), and append control rods `rods.push([...wpt(p, x, y), rodWidth])`.

### Step 4: Author the Sound Score (`src/sound_score.js`)
Trigger sound events synchronized with speech:
- `tap(at('word'), 400, 0.5)` for rod clicks or footsteps.
- `gam(at('word'), 'A4', 0.8)` for tonal emphasis, brass, or reveals.
- `gong(at('word'), 1.0)` for pivotal twists and dramatic drops.
- `hide(at('word'), duration, gain)` for cloth, parchment, or banner slides.
- `flaps(t0, t1, step, gain)` for winged creatures or rapid motion.

### Step 5: Set Up 9:16 Captions (`src/vertical.js`)
Define `CAPS` pairs `[timestamp, "caption string with *highlight*"]`:
```javascript
const CAPS = [
  [0.01, 'Aapne kabhi'],
  [0.97, '*pareshan* kiya hai?'],
  [2.85, '*saalon* yaad rakhega…'],
];
```
In 9:16 reels, the 16:9 stage is preserved uncropped at 1080x608 with the dark leather/cloth theatrical surround and animated bouncing captions below.

### Step 6: Build Standalone HTML Pages
Run the inliner script using Python:
```powershell
python build.py storyboard   # Generates storyboard.html
python build.py player       # Generates crow_shadow_play.html (with voice baked in)
python build.py vertical     # Generates crow_shadow_play_9x16.html (9:16 reel)
```

### Step 7: Storyboard & Quality Review
1. Open `storyboard.html` in any browser to verify all key visual beats and timing notes.
2. Open `crow_shadow_play.html` to scrub through the interactive player with synchronized audio and sound effects.

### Step 8: Render to Video
Export pristine 30 fps MP4 video and 16-bit stereo WAV sound:
```powershell
# 16:9 Landscape Video
node render.mjs render

# 9:16 Vertical Reel Video
$env:VERTICAL="1"; node render.mjs render
```
*(Requires Node.js, `puppeteer-core`, Google Chrome, and `ffmpeg` in system PATH).*
