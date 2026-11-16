# Architectural Survey & Implementation Plan: Intro Construction Sequence (R2) & Visual Polish (R4)

**Agent**: `explorer_survey_intro_visuals`  
**Working Directory**: `c:\Users\Ayush\OneDrive\Documents\swarm\.agents\teamwork\explorer_survey_intro_visuals\`  
**Target Project**: `c:\Users\Ayush\OneDrive\Documents\swarm\`  
**Authoritative Request**: `ORIGINAL_REQUEST.md` (R2: Live Website Construction Intro Sequence, R4: Visual Polish and Aesthetic Styling)  
**Date**: 2026-11-04  

---

## 1. Observation

### 1.1 Existing Codebase & Dependencies
- **Project Structure**: React 18 + Vite SPA in `frontend/`, Django REST Framework in `backend/` (`README.md:21-59`).
- **Dependencies (`frontend/package.json:11-25`)**:
  - `react`: `^18.2.0`, `react-dom`: `^18.2.0`
  - `@react-three/fiber`: `^8.16.1`, `@react-three/drei`: `^9.102.6`, `three`: `^0.163.0`
  - `framer-motion`: `^11.1.7`
  - `gsap`: `^3.12.5`
  - `lenis`: `^1.1.20`
  - `lucide-react`: `^0.368.0`
  - `tailwindcss`: `^3.4.3`
- **Build Verification**:
  - Executed command: `npm --prefix frontend run build`
  - Result: Exit code 0, 2153 modules transformed, production assets compiled in 14.55s.

### 1.2 Intro Sequence Analysis (`SiteBuilderSequence.jsx`)
- **Mounting in `App.jsx:57-61`**:
  ```jsx
  {isBuilding && (
    <SiteBuilderSequence
      onComplete={() => setIsBuilding(false)}
    />
  )}
  ```
- **Current Flow in `SiteBuilderSequence.jsx:24-119`**:
  - Uses static 5 steps in `BUILD_STEPS` with hardcoded `setTimeout` delays (1600ms, 3600ms, 6000ms, 7800ms, 9000ms).
  - Background overlay (`SiteBuilderSequence.jsx:311-315`): Fullscreen fixed overlay `fixed inset-0 z-50 flex flex-col justify-between bg-[#030712] transition-opacity duration-700`.
  - Wireframe drawing (`SiteBuilderSequence.jsx:164-234`): Canvas 2D draws dashed rectangles for Navigation, Hero, and Project Cards.
  - Builder agents (`SiteBuilderSequence.jsx:137-143`): 5 cursors (`Ayush`, `Three.js`, `Django`, `DevOps`, `UI/UX`) move to basic sine/cosine circular paths.
  - Sound triggers (`SiteBuilderSequence.jsx:64, 69, 75, 83, 93, 99, 105`): Web Audio API blips (`playDraftBlip`, `playChime`, `playCompletionHarmonics`).

### 1.3 Identified Limitations in Existing Implementation
1. **Lack of True Morphing / DOM Alignment**:
   - The wireframes drawn in `SiteBuilderSequence` currently sit on an opaque black screen that covers the real site. When the sequence finishes, the overlay simply fades out via CSS `opacity-0` after 600ms, revealing the already-rendered DOM.
   - The user does not witness the wireframe boxes physically dragging, resizing, snapping, and transforming directly into the live DOM components.
2. **Scroll State on Replay**:
   - In `Navbar.jsx:79-86` and `Navbar.jsx:144-153`, clicking `onReplayIntro` sets `isBuilding = true`.
   - If the user had scrolled down into `#projects` or `#contact` (`scrollY > 1500px`), setting `isBuilding = true` re-mounts the overlay at the current scroll position without resetting scroll to top. The intro draws at the viewport while the page body underneath remains scrolled down.
   - Furthermore, page scroll is not locked during the intro or replay; user wheeling or trackpad gestures can scroll the background DOM while the intro is playing.
3. **Skip Responsiveness & Teardown Cleanliness**:
   - In `SiteBuilderSequence.jsx:45-51`, `skipIntro()` sets `setIsFinishing(true)` and waits 500ms before calling `onComplete()`. During those 500ms, canvas `render()` continues running and timers can continue triggering.
   - If timers are not synchronously aborted on skip, race conditions can cause audio blips or state updates after unmount.
4. **Visual Polish Gaps (R4)**:
   - Blueprint overlay is currently just a basic 40px grid with `rgba(59, 130, 246, 0.05)`. Missing: dual-tier major/minor grid, top and left pixel measurement rulers, dynamic cursor coordinate projection lines, smart alignment guide rays (magenta/cyan snap lines), and corner transform handles on dragged components.
   - Design tool cursor badges currently show only `${agent.name}: Drafting`. Missing: collaborative design tool aesthetic (Figma/Miro style), state tags (`[DRAFTING]`, `[DRAGGING]`, `[SNAPPING]`), 8 bounding box resize handles on dragged components, and live coordinate/dimension badges.
5. **Cursor Layering Conflict**:
   - In `App.jsx`, both `<SiteBuilderSequence />` (line 58) and `<SwarmCursor />` (line 64) are active simultaneously. This means the 8 orbiting user swarm cursors are rendering at the same time as the 5 builder cursors, creating visual confusion during the intro sequence.

---

## 2. Logic Chain

1. **Premise 1 (Requirement R2)**: The live website construction sequence must show cursors starting on a blank canvas, drawing wireframes, dragging layout boxes, and assembling page sections into their final live DOM positions, resolving seamlessly into the functional live portfolio with robust Skip and Replay controls.
2. **Premise 2 (Requirement R4)**: Visual polish must include blueprint overlays (grid lines, measurement markers, rulers, smart guides), design tool cursor badges (Figma-style colored pointers, user labels, bounding box handles, coordinates), and fluid transitions (canvas springs, stroke-dash animations, DOM scale/blur morphing).
3. **Inference on State Machine**: A robust intro sequence cannot rely on scattered `setTimeout` calls. It requires an explicit 6-stage Deterministic Finite State Machine:
   `BLANK_CANVAS` (0-800ms) $\rightarrow$ `DRAWING_WIREFRAMES` (800-2600ms) $\rightarrow$ `DRAGGING_LAYOUT_BOXES` (2600-4800ms) $\rightarrow$ `ASSEMBLING_SECTIONS` (4800-6800ms) $\rightarrow$ `RESOLVING_TO_LIVE_SITE` (6800-7600ms) $\rightarrow$ `INTERACTIVE_LIVE` (7600ms+ or instant on Skip).
4. **Inference on Morphing & DOM Alignment**: To create the authentic illusion that cursors are constructing the live website:
   - The wireframe dimensions and positions in the canvas must match the live DOM bounding boxes (`header` at top, `hero` in center, `projects` 3-column grid).
   - In `RESOLVING_TO_LIVE_SITE`, the wireframe strokes pulse and dissolve as the pre-rendered live DOM underneath scales up from `0.98` to `1.0` with `opacity: 0 -> 1` and `backdrop-filter: blur(12px) -> blur(0px)`.
5. **Inference on Skip Teardown**:
   - Skip must be instantaneous (immediate cancel of all pending timeouts, immediate `cancelAnimationFrame`, immediate release of scroll lock, immediate transition to `INTERACTIVE_LIVE`).
   - Container must receive `pointer-events: none` immediately so user clicks are not blocked for a fraction of a second.
6. **Inference on Replay Robustness**:
   - Replay must reset scroll to `(0, 0)` instantly via both `window.scrollTo` and `lenis.scrollTo(0, { immediate: true })`.
   - Replay must lock scrolling via `lenis.stop()` and `document.body.style.overflow = 'hidden'`, with an unmount cleanup hook ensuring scroll is ALWAYS restored even if unmounted unexpectedly.
   - Cursors in `SwarmCursor.jsx` should be suspended or hidden while `isBuilding` is true, smoothly activating as `SiteBuilderSequence` completes.

---

## 3. Architectural Design & Implementation Specification

### 3.1 State Machine Specification

| State | Timeline | Visual Behavior | Cursor Actions | Audio Triggers |
|---|---|---|---|---|
| `BLANK_CANVAS` | `0ms – 800ms` | Deep obsidian background (`#030712`). Major (80px) and minor (20px) blueprint grid fades in. Top (X) and Left (Y) architectural rulers fade in with pixel tick marks. Center crosshair renders. | 6 design cursors spawn at canvas perimeter and glide inwards with spring ease to initial staging positions. | Soft sub-bass initialization hum + 320Hz draft blip. |
| `DRAWING_WIREFRAMES` | `800ms – 2600ms` | Cursors draw stroke wireframes using advancing dashed paths: Navigation Bar (`1100×60px`), Hero Viewport (`920×340px`). Corner registration crosshairs `+` stamped at vertices. | Cursor 1 (`Ayush - Lead`) traces Navigation. Cursor 2 (`Three.js`) & Cursor 5 (`UI/UX`) trace Hero viewport. Trailing spark particles emit from cursor tips. | Rapid drafting blips (440Hz – 550Hz triangle waves) synchronized with stroke drawing. |
| `DRAGGING_LAYOUT_BOXES` | `2600ms – 4800ms` | 3 Project Card wireframes originate from staging stack. Cursors grab cards. Bounding boxes illuminate with 8 transform handles. Smart alignment guides (magenta `#f43f5e`, cyan `#06b6d4`) project horizontally/vertically with gap callouts (`GAP: 24px`). Cards snap into a symmetrical 3-column grid. | Cursor 3 (`Django`), Cursor 4 (`DevOps`), Cursor 6 (`Architect`) drag cards with spring damping and subtle angular tilt (`tilt = vx * 0.02`). | Snapping click sound and harmonic chime on grid lock. |
| `ASSEMBLING_SECTIONS` | `4800ms – 6800ms` | Hero headline "AYUSH GORA" types out in glowing cyan typography. Three.js cursor spins a holographic rotating wireframe icosahedron inside the hero viewport. Project cards fill with mock skeleton lines. Status badges flip to `✓ VERIFIED`. | Cursors inspect components with localized circular radar pulses and green checkmark badges. Progress bar fills to 100%. | Typewriter synthesizer clicks (600Hz – 900Hz) + resonant chime at 880Hz. |
| `RESOLVING_TO_LIVE_SITE` | `6800ms – 7600ms` | Blueprint lines flash with a soft cyan bloom and dissolve. Underlying live DOM smoothly transitions from `scale(0.98), opacity(0)` to `scale(1.0), opacity(1)`. Canvas fades out cleanly. | Cursors disperse outward and prepare to transition into orbital user-flock mode. | 4-note ascending completion harmonic chord (C5 - E5 - G5 - C6). |
| `INTERACTIVE_LIVE` | `7600ms+` or on Skip | Canvas unmounted / destroyed. Body scroll unlocked. All pointer events restored. Swarm cursors orbit user pointer continuously. | Swarm cursors follow user mouse, orbit continuously when stationary, react to `data-swarm="orbit"` and `data-swarm="gather"`. | Normal user interaction click impulse sound on mousedown. |

---

### 3.2 Spatial Layout & Coordinate Mapping
To ensure pixel-perfect resolution into the live DOM:
```javascript
function getLayoutCoordinates(width, height) {
  const centerX = width / 2;
  const centerY = height / 2;

  // 1. Navigation Bar (matches Navbar.jsx)
  const navW = Math.min(width * 0.9, 1200);
  const navH = 56;
  const navX = centerX - navW / 2;
  const navY = 16;

  // 2. Hero Viewport (matches Hero.jsx)
  const heroW = Math.min(width * 0.85, 960);
  const heroH = 340;
  const heroX = centerX - heroW / 2;
  const heroY = 110;

  // 3. Project Cards 3-Column Grid (matches Projects.jsx)
  const isMobile = width < 768;
  const isTablet = width >= 768 && width < 1024;
  const cardCols = isMobile ? 1 : (isTablet ? 2 : 3);
  const cardGap = 24;
  const totalGridW = Math.min(width * 0.85, 1140);
  const cardW = (totalGridW - (cardCols - 1) * cardGap) / cardCols;
  const cardH = 200;
  const gridY = heroY + heroH + 40;

  const cardTargets = [];
  for (let col = 0; col < cardCols; col++) {
    const cardX = centerX - totalGridW / 2 + col * (cardW + cardGap);
    cardTargets.push({ x: cardX, y: gridY, width: cardW, height: cardH });
  }

  return { nav: { x: navX, y: navY, width: navW, height: navH },
           hero: { x: heroX, y: heroY, width: heroW, height: heroH },
           cards: cardTargets,
           centerX, centerY };
}
```

---

### 3.3 Visual Polish & Aesthetic Styling Specifications (R4)

#### A. Blueprint Overlays
1. **Dual-Tier Coordinate Grid**:
   - Major Grid: 80px cell size, stroke color `rgba(59, 130, 246, 0.08)`, 1px line width.
   - Minor Grid: 20px cell size, stroke color `rgba(59, 130, 246, 0.03)`, 0.5px line width.
   - Intersection Marks: `+` crosshair at every 80px intersection rendered with `rgba(6, 182, 212, 0.25)`.
2. **Architectural Measurement Rulers**:
   - **Top Ruler (Horizontal X-Axis)**: Height 20px, dark translucent glass strip (`rgba(3, 7, 18, 0.85)`).
     - Tick marks every 10px (height 4px, `rgba(148, 163, 184, 0.3)`).
     - Major tick marks every 50px (height 8px, `rgba(148, 163, 184, 0.6)`).
     - Monospace coordinate numbers every 100px (`0, 100, 200, 300... px`, font: `9px JetBrains Mono`, color: `rgba(148, 163, 184, 0.6)`).
   - **Left Ruler (Vertical Y-Axis)**: Width 20px, dark translucent glass strip with matching ticks and Y coordinate labels.
   - **Cursor Projection Guides**: Subtle dashed projection lines (`rgba(6, 182, 212, 0.4)`) shoot upwards and leftwards from the primary builder cursors to the rulers, displaying live X/Y coordinate ticks.
3. **Smart Alignment Guides**:
   - Rendered when cursors are dragging cards into alignment.
   - Magenta (`#f43f5e`, 1px dashed `[3, 3]`) line for horizontal baseline alignment.
   - Cyan (`#06b6d4`, 1px dashed `[3, 3]`) line for vertical edge alignment.
   - Equal spacing indicator: `<-- 24px -->` callout pill between adjacent project cards.
4. **Dimension Tooltips & Corner Crosshairs**:
   - 8px precision crosshairs `+` at all wireframe corners.
   - Dark glass dimension badge attached to box headers: `BOX: 1100 × 56 px · SNAP: OK`.

#### B. Collaborative Design Tool Cursor Badges (Figma-Style)
1. **Cursor Configuration Team**:
   - `Ayush`: `#3b82f6` (Blue) — Role: `Lead Architect`
   - `Three.js`: `#8b5cf6` (Purple) — Role: `WebGL Core`
   - `Django`: `#10b981` (Emerald) — Role: `API Engine`
   - `DevOps`: `#06b6d4` (Cyan) — Role: `Cloud Infra`
   - `UI/UX`: `#f43f5e` (Rose) — Role: `Design Spec`
   - `Architect`: `#f59e0b` (Amber) — Role: `System Sync`
2. **Pointer Rendering**:
   - High-contrast SVG cursor path (fill: agent color, stroke: `#ffffff`, 1.5px width).
   - Glow blur: `ctx.shadowColor = agent.color; ctx.shadowBlur = 8;`.
   - Motion tilt: rotates dynamically by velocity angle (`tilt = Math.max(-0.35, Math.min(0.35, vx * 0.06))`).
3. **Badge Anatomy**:
   - **Pill Container**: `rgba(3, 7, 18, 0.94)` background, 1px border matching agent color, 5px border-radius, drop shadow.
   - **Status Beacon**: 3px circular colored dot with CSS/canvas pulse.
   - **Text**: Monospace/Inter text format: `[Name] · [Current Action]`.
     - Actions: `Drafting`, `Dragging`, `Resizing`, `Snapping`, `Typing`, `Verified`.
   - **Live Coordinates**: Below badge, a micro-pill shows `(x: 480, y: 120)`.
4. **Bounding Box Transform Handles**:
   - When a cursor is "dragging" or "resizing" a card:
     - 8 square handles (6×6px, white fill, agent color stroke) positioned at NW, N, NE, E, SE, S, SW, W.
     - Thin elastic rubber-band line drawn between cursor tip and the dragged handle.

#### C. Fluid Transition Animations
- **Harmonic Spring Physics**: Cursor motion driven by damped spring dynamics:
  $$a_x = (x_{\text{target}} - x) \cdot k_{\text{stiffness}}$$
  $$v_x = (v_x + a_x) \cdot c_{\text{damping}}$$
  $$x = x + v_x$$
  (Parameters: $k_{\text{stiffness}} = 0.08$, $c_{\text{damping}} = 0.82$).
- **Advancing Stroke Paths**: Wireframe borders draw smoothly using animated stroke offsets rather than jumping into view.
- **Resolution Fade & Scale Spring**:
  - Live DOM container starts at `style={{ opacity: 0, transform: 'scale(0.98)', filter: 'blur(8px)' }}`.
  - In `RESOLVING_TO_LIVE_SITE`, live DOM transitions smoothly via:
    `transition: opacity 700ms cubic-bezier(0.16, 1, 0.3, 1), transform 700ms cubic-bezier(0.16, 1, 0.3, 1), filter 700ms ease-out`.
  - Canvas overlay fades out with `transition: opacity 500ms ease-out`.

---

### 3.4 Robust Skip & Replay Controls Specification

#### A. Skip Intro Control
- **Activation Mechanisms**:
  1. Click on prominent top-right button: `<button onClick={skipIntro}>Skip Intro [ESC] <FastForward /></button>`.
  2. Keyboard hotkey: `Escape` key or `Space` key.
- **Teardown Protocol**:
  ```javascript
  const skipIntro = () => {
    // 1. Instantly cancel all pending timeouts and intervals
    activeTimersRef.current.forEach(clearTimeout);
    activeIntervalsRef.current.forEach(clearInterval);
    activeTimersRef.current = [];

    // 2. Cancel animation frame loop
    if (rafRef.current) cancelAnimationFrame(rafRef.current);

    // 3. Immediately unlock scroll
    document.body.style.overflow = '';
    if (window.__lenis) window.__lenis.start();

    // 4. Play resolution sound
    sound.playCompletionHarmonics();

    // 5. Instantly mark finishing and notify parent
    setIsFinishing(true);
    if (onComplete) onComplete();
  };
  ```
- **Interactivity Guarantee**:
  - Intro container receives `pointer-events-none` immediately upon skip.
  - Intro overlay component unmounts from React tree (`isBuilding = false`).
  - No orphaned event listeners or background canvas calculations remain.

#### B. Replay Intro Control
- **Activation Mechanisms**:
  1. Desktop Navbar button: `<button onClick={onReplayIntro}>Replay Build <RotateCcw /></button>`.
  2. Mobile slide-down drawer button in `Navbar.jsx`.
- **Reset Protocol in `App.jsx`**:
  ```javascript
  const handleReplayIntro = () => {
    // 1. Immediately reset scroll position to top
    window.scrollTo({ top: 0, behavior: 'instant' });
    if (window.__lenis) {
      window.__lenis.scrollTo(0, { immediate: true });
      window.__lenis.stop(); // Lock scroll during sequence
    }
    document.body.style.overflow = 'hidden';

    // 2. Reset intro state and mount SiteBuilderSequence cleanly
    setReplayKey(prev => prev + 1);
    setIsBuilding(true);
  };
  ```
- **Cleanup Guarantee in `SiteBuilderSequence.jsx`**:
  ```javascript
  useEffect(() => {
    // Lock scroll on mount
    document.body.style.overflow = 'hidden';
    if (window.__lenis) window.__lenis.stop();

    return () => {
      // Guaranteed scroll restoration on ANY unmount
      document.body.style.overflow = '';
      if (window.__lenis) window.__lenis.start();
      activeTimersRef.current.forEach(clearTimeout);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);
  ```

---

### 3.5 Interactivity & 3D Scene Preservation Verification

We systematically verified how all interactive systems operate post-intro/skip:

1. **Three.js 3D WebGL Canvas (`Scene3D.jsx`)**:
   - `Scene3D` is rendered inside `Hero.jsx:9` with `className="absolute inset-0 w-full h-full pointer-events-none -z-10 overflow-hidden"`.
   - The React Three Fiber canvas listens to window pointer coordinates for parallax (`state.pointer.x`, `state.pointer.y`).
   - Because `Scene3D` has `pointer-events-none`, it never intercepts clicks intended for Hero buttons or navigation links.
   - Once `SiteBuilderSequence` unmounts, window pointer events pass directly through to R3F's `CameraRig` without interference.
2. **Swarm Cursor Engine (`SwarmCursor.jsx`)**:
   - Mounted at `App.jsx:64` with `className="fixed inset-0 pointer-events-none z-50 overflow-hidden"`.
   - When `isBuilding` is true, `SwarmCursor` should be hidden or paused (`if (isBuilding) return null;` or `opacity: 0`) to prevent visual conflict with intro builder cursors.
   - On intro completion or skip, `SwarmCursor` activates seamlessly, spawning cursors in continuous orbital rotation around the user's mouse pointer and snapping to `data-swarm="gather"` and `data-swarm="orbit"` elements.
3. **DOM Navigation & Modals**:
   - Navigation links (`#about`, `#skills`, `#projects`, `#experience`, `#contact`) smoothly scroll the page via Lenis.
   - Resume Modal (`ResumeModal.jsx`) opens on CTA clicks with zero z-index conflicts (`z-50` modal backdrop).
   - Project cards in `Projects.jsx` support interactive 3D mouse tilt (`rotateX`, `rotateY`) and modal inspection.

---

## 4. Caveats

1. **Browser Autoplay Policy for Audio**:
   - Modern browsers (Chrome, Safari, Edge) block unprompted Web Audio playback before the user interacts with the page (click or keypress).
   - `soundEffects.js` already sets `this.isMuted = true` by default and unlocks `AudioContext` on user click/toggle.
   - If the user has not clicked anything when page loads, initial blips are safely muted without throwing errors. Clicking "Unmute" or "Skip" immediately activates the synthesizer audio.
2. **Mobile and Touch Devices**:
   - On touch devices (`window.innerWidth < 768` or `pointer: coarse`), desktop cursor dragging is less meaningful.
   - Mobile devices should automatically execute an abbreviated or optimized construction sequence with simplified wireframes, or allow instant tap-to-skip.
3. **No External Libraries Required for Core Logic**:
   - All state machine transitions, canvas wireframe rendering, ruler ticks, smart guides, transform handles, and spring physics are 100% self-contained in standard HTML5 Canvas 2D and React state hooks, requiring zero external scripts or closed-source packages.

---

## 5. Conclusion & Actionable Implementation Plan

### 5.1 Architecture Summary
1. **State Machine**: Implement explicit 6-phase state transitions (`BLANK_CANVAS` $\rightarrow$ `DRAWING_WIREFRAMES` $\rightarrow$ `DRAGGING_LAYOUT_BOXES` $\rightarrow$ `ASSEMBLING_SECTIONS` $\rightarrow$ `RESOLVING_TO_LIVE_SITE` $\rightarrow$ `INTERACTIVE_LIVE`).
2. **Spatial Alignment**: Compute canvas wireframe bounding boxes dynamically from viewport dimensions to align identically with live `Navbar`, `Hero`, and `Projects` DOM elements.
3. **Visual Polish**:
   - Canvas-rendered dual-tier blueprint grid (20px/80px).
   - Architectural measurement rulers (top and left) with tick marks and dynamic cursor projection lines.
   - Smart alignment guides (magenta/cyan) with distance callouts when dragging cards.
   - Collaborative design tool cursor badges with role tags, action indicators, and 8-point transform handles.
4. **Controls**:
   - Skip Intro: Immediate abort of all timers/animation frames, instantaneous unmount/fade, instant scroll unlock.
   - Replay Intro: Reset scroll to `(0, 0)`, lock body scroll with Lenis, re-mount sequence cleanly.
5. **Cursor Integration**: Suppress `SwarmCursor` while `isBuilding` is true, then smoothly fade in the orbital cursor flock upon resolution.

---

## 6. Verification Method

To independently verify the implementation:

1. **Build Verification**:
   ```powershell
   npm --prefix frontend run build
   ```
   *Expected outcome*: Vite compiles production bundle with exit code 0 and zero TypeScript/syntax errors.

2. **Intro Sequence Verification**:
   - Load `http://localhost:5173/` in a desktop browser.
   - Verify initial blank canvas with dual-tier grid and rulers.
   - Verify cursors trace Navigation and Hero wireframes with blueprint dashed lines and corner crosshairs.
   - Verify project cards are dragged from staging into a 3-column grid with smart alignment guides.
   - Verify typography typing and rotating wireframe 3D preview.
   - Verify smooth morph/resolution into live functional portfolio.

3. **Skip Intro Verification**:
   - Reload page and immediately click "Skip Intro" or press `Escape` / `Space`.
   - Verify the intro sequence terminates immediately (<150ms).
   - Verify no stuck overlay or blocked mouse clicks; verify page scrolling is immediately enabled.

4. **Replay Intro Verification**:
   - Scroll down to `#projects` or `#contact`.
   - Click "Replay Build" in the navigation bar.
   - Verify page scroll immediately jumps to top `(0, 0)`.
   - Verify sequence replays cleanly from Phase 1 without glitching.

5. **Interactivity Audit**:
   - Verify Hero buttons ("Explore My Work", "Download Resume") click properly.
   - Verify Three.js 3D canvas tilts smoothly with mouse movement.
   - Verify project cards tilt on hover and modal details open.
   - Verify swarm cursors orbit continuously around user mouse both moving and stationary.
