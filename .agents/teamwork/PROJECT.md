# Project: Swarm Portfolio Enhancements

## Architecture
The project is a React 18 + Vite SPA located in `frontend/` with Three.js (React Three Fiber) rendering and Tailwind CSS.
The architecture comprises four core interactive layers:
1. **Flocking Swarm Cursor Engine** (`frontend/src/animations/SwarmCursor.jsx`):
   - Delta-time normalized multi-tier orbital flocking around mouse cursor coordinates.
   - Decoupled continuous angular rotation during both motion and stationary idle states.
   - Harmonic breathing wave in idle, smoothed inertia lag, Boids collision separation, High-DPI canvas scaling, and soft boundary deflection.
2. **Procedural Web Audio Engine** (`frontend/src/services/soundEffects.js`):
   - Zero-asset Web Audio API synthesizer with `MasterGainNode` for instant global muting without DC pop.
   - Autoplay unlocking on first user interaction with localStorage persistence.
   - 5 procedural synthesis profiles: ambient cursor hum (velocity-responsive), drafting chirps, box placement snap clicks, section lock harmonic chimes, and completion fanfare.
3. **Live Website Construction Intro Sequence & Controls** (`frontend/src/animations/SiteBuilderSequence.jsx`):
   - Deterministic 6-phase state machine (`BLANK_CANVAS` -> `DRAWING_WIREFRAMES` -> `DRAGGING_LAYOUT_BOXES` -> `ASSEMBLING_SECTIONS` -> `RESOLVING_TO_LIVE_SITE` -> `INTERACTIVE_LIVE`).
   - Pixel-perfect spatial coordinate mapping matching live DOM elements (`Navbar`, `Hero`, `Projects`).
   - Animated wireframe path tracing, layout box dragging with 8-point transform handles, and smart alignment guides.
   - Robust Skip control: instantaneous timer abort, immediate `cancelAnimationFrame`, instant scroll unlock, zero residual blocking.
   - Robust Replay control: instant scroll reset to `(0, 0)`, Lenis scroll locking, and guaranteed unmount cleanup.
   - Full preservation of 3D WebGL scene (`Scene3D.jsx`), links, and modal interactivity post-intro.
4. **Visual Polish & Aesthetic Styling**:
   - Dual-tier blueprint grid (20px/80px), architectural measurement rulers with coordinate tick marks and dynamic cursor projection lines.
   - Smart alignment guide rays (magenta/cyan) with distance callouts (`GAP: 24px`).
   - Figma-style collaborative cursor badges with role tags, action tags (`Drafting`, `Dragging`, `Snapping`, `Verified`), and fluid spring transition animations.

---

## Feature Inventory
| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| 1 | Continuous Cursor Orbit | Swarm cursors continuously orbit around user cursor coordinates on mousemove and stationary idle | M1 | ORIGINAL_REQUEST §R1 |
| 2 | Time-Normalized Angular Progression | Orbit angle evolves via independent delta-time clock decoupled from mouse velocity | M1 | Survey (cursor_audio) |
| 3 | Idle Respiration Wave | Sinusoidal harmonic breathing of orbit radius during stationary hover | M1 | Survey (cursor_audio) |
| 4 | Smoothed Inertia Lag | Exponentially smoothed velocity lag preventing abrupt snapping when mouse stops | M1 | Survey (cursor_audio) |
| 5 | Multi-Tier Counter-Rotation | 8 unique cursors across 3 concentric tiers with alternating clockwise/counter-clockwise orbits | M1 | Survey (cursor_audio) |
| 6 | High-DPI Canvas Scaling | DevicePixelRatio (DPR) scaled rendering for crisp rendering on Retina/High-DPI displays | M1 | Survey (cursor_audio) |
| 7 | Soft Viewport Boundary Deflection | Soft restoring force preventing cursors and badges from clipping outside viewport | M1 | Survey (cursor_audio) |
| 8 | MasterGain Web Audio Architecture | Native Web Audio API with MasterGainNode for instant click-free global mute/unmute | M2 | ORIGINAL_REQUEST §R3 |
| 9 | Autoplay Unlock & Preference Storage | AudioContext unlocks on first user gesture with localStorage persistence | M2 | Survey (cursor_audio) |
| 10 | Velocity-Responsive Ambient Hum | Dual-sine ambient drone whose gain modulates with cursor speed | M2 | ORIGINAL_REQUEST §R3 |
| 11 | Drafting & Snap Synthesis Profiles | Procedural drafting chirp sweeps and magnetic box snap click sounds | M2 | ORIGINAL_REQUEST §R3 |
| 12 | Section Chime & Completion Fanfare | Harmonic section lock chimes and arpeggiated Major 9th completion fanfare chord | M2 | ORIGINAL_REQUEST §R3 |
| 13 | Global Mute UI Controls | Accessible mute toggle buttons in Navbar and Intro overlay | M2 | ORIGINAL_REQUEST §R3 |
| 14 | 6-Phase Construction State Machine | Explicit state machine transitions from blank canvas to live site | M3 | ORIGINAL_REQUEST §R2 |
| 15 | Dynamic Spatial Coordinate Mapping | Pixel-accurate layout coordinates aligning canvas wireframes with live DOM components | M3 | Survey (intro_visuals) |
| 16 | Animated Wireframe Tracing | Advancing dashed stroke paths and corner registration crosshairs | M3 | ORIGINAL_REQUEST §R2 |
| 17 | Autonomous Box Dragging & Layout Snap | Builder cursors drag 3 project card bounding boxes into a symmetrical 3-column grid | M3 | ORIGINAL_REQUEST §R2 |
| 18 | Smooth Resolution into Live DOM | Morphing transition where live DOM scales up from 0.98 to 1.0 with blur dissolve | M3 | ORIGINAL_REQUEST §R2 |
| 19 | Synchronous Skip Intro Control | Immediate timer cancellation, animation abort, scroll unlock, and instant live display | M3 | ORIGINAL_REQUEST §R2 |
| 20 | Scroll-Locked Replay Intro Control | Replay build button resets scroll to (0, 0), locks Lenis scroll, and cleanly replays | M3 | ORIGINAL_REQUEST §R2 |
| 21 | Interactivity & 3D Scene Preservation | 100% functional preservation of 3D canvas, navigation, buttons, and card tilts | M3 | ORIGINAL_REQUEST §R2 |
| 22 | Dual-Tier Blueprint Grid Overlay | 20px minor and 80px major blueprint grid with coordinate crosshairs | M4 | ORIGINAL_REQUEST §R4 |
| 23 | Architectural Measurement Rulers | Top and Left translucent rulers with tick marks, coordinates, and cursor projection guides | M4 | ORIGINAL_REQUEST §R4 |
| 24 | Smart Alignment Guides | Magenta/cyan snap lines with gap callout indicators (GAP: 24px) | M4 | ORIGINAL_REQUEST §R4 |
| 25 | Collaborative Design Tool Badges | Figma-style colored cursors with role tags, action tags, and 8 transform handles | M4 | ORIGINAL_REQUEST §R4 |
| 26 | Fluid Transition Dynamics | Harmonic spring physics for cursor trajectories and smooth opacity blends | M4 | ORIGINAL_REQUEST §R4 |
| 27 | Full E2E Test Suite Execution | Automated verification across Tiers 1-4 with exit code 0 | M5 | ORIGINAL_REQUEST §Acceptance Criteria |
| 28 | Adversarial Verification Hardening | White-box stress testing of edge cases, rapid clicks, resize, and autoplay policies | M5 | Project Pattern Tier 5 |

---

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| M1 | Swarm Cursor Orbit & Flocking Engine | Continuous time-normalized orbit, harmonic breathing, smoothed velocity lag, 3 counter-rotating tiers, High-DPI scaling, soft boundary deflection (`frontend/src/animations/SwarmCursor.jsx`) | none | DONE |
| M2 | Procedural Web Audio Engine & Mute Controls | MasterGainNode architecture, autoplay unlock, 5 procedural synthesis profiles, and mute toggle synchronization (`frontend/src/services/soundEffects.js`, `frontend/src/components/Navbar.jsx`) | none | IN_PROGRESS |
| M3 | Live Website Construction Intro Sequence & Controls | 6-phase state machine, dynamic spatial coordinates, wireframe tracing, box dragging, DOM resolution, Skip & Replay controls, and Lenis/3D preservation (`SiteBuilderSequence.jsx`, `App.jsx`, `Navbar.jsx`) | M1, M2 | PLANNED |
| M4 | Blueprint Overlays & Design Tool Visual Polish | Dual-tier blueprint grid, measurement rulers with projection lines, smart alignment guides, Figma-style badges, transform handles, and spring easing (`SiteBuilderSequence.jsx`, `SwarmCursor.jsx`) | M3 | PLANNED |
| M5 | Full E2E Test Suite & Adversarial Verification | Execute 100% automated test suite (Tiers 1-4) and adversarial edge-case stress verification (Tier 5) | M1, M2, M3, M4 | PLANNED |

---

## Interface Contracts

### SwarmCursor ↔ soundEffects
- `sound.updateCursorVelocity(speed: number): void`
  - Called each animation frame in `SwarmCursor.jsx` with current `mouse.speed`.
  - When unmuted, modulates the ambient drone gain; silent when muted.

### SiteBuilderSequence ↔ soundEffects
- `sound.playDraftBlip(frequency?: number, duration?: number): void`
  - Triggers during wireframe tracing and headline typing.
- `sound.playBoxSnap(): void`
  - Triggers when layout boxes snap into grid alignment.
- `sound.playChime(frequency?: number, duration?: number, type?: string): void`
  - Triggers on section lock and milestone completion.
- `sound.playCompletionHarmonics(): void`
  - Triggers when sequence resolves to live site or when Skip is clicked.
- `sound.toggleMute(): boolean`
  - Toggles global mute state and returns current muted boolean.

### App ↔ SiteBuilderSequence
- `onComplete: () => void`
  - Callback invoked when intro finishes or is skipped. Sets `isBuilding = false`.
- Scroll State:
  - While `isBuilding === true`: `document.body.style.overflow = 'hidden'`, `window.__lenis?.stop()`.
  - On complete / skip / unmount: `document.body.style.overflow = ''`, `window.__lenis?.start()`.

### Navbar ↔ App (Replay Intro)
- `onReplayIntro: () => void`
  - Resets `window.scrollTo({ top: 0, behavior: 'instant' })` and `window.__lenis?.scrollTo(0, { immediate: true })`.
  - Sets `isBuilding = true`, cleanly re-mounting `SiteBuilderSequence`.

---

## Code Layout
- `frontend/src/animations/SwarmCursor.jsx`: Swarm cursors component and orbital flocking simulation.
- `frontend/src/animations/SiteBuilderSequence.jsx`: Live website construction intro overlay and controls.
- `frontend/src/services/soundEffects.js`: Native procedural Web Audio API synthesizer engine.
- `frontend/src/components/Navbar.jsx`: Navigation header containing audio mute toggle and replay intro trigger.
- `frontend/src/App.jsx`: Top-level composition, intro state lifecycle, and scroll management.
- `frontend/src/three/Scene3D.jsx`: 3D WebGL background scene (preserved without z-index or event conflict).
