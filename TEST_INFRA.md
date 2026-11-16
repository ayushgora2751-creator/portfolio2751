# TEST_INFRA.md — 3D Swarm Portfolio Test Infrastructure

## Overview & Test Philosophy
This document specifies the end-to-end automated testing architecture and test infrastructure for the **3D Developer Portfolio Swarm Enhancements**, in accordance with the Project Pattern.

The test suite employs an **opaque-box, contract-driven, and requirement-traceable** methodology. Expected outputs and behavior specifications are derived authoritatively from:
1. `ORIGINAL_REQUEST.md` (Requirements R1 through R4, Acceptance Criteria)
2. `PROJECT.md` (Feature Inventory 1–28, Interface Contracts, Milestones M1–M5)

Every test case exercises observable logic, state transitions, mathematical kinematics, Web Audio node scheduling, coordinate projections, or lifecycle contracts. Facade tests that pass vacuously without asserting real logic are strictly prohibited.

---

## Test Architecture: The 4-Tier Pattern

```
+-----------------------------------------------------------------------+
|                TIER 4: Real-World User Scenarios                      |
|  - First-time visitor walkthrough   - Impatient skip-to-content       |
|  - Sound enthusiast interaction     - Navigation & build replay       |
+-----------------------------------------------------------------------+
                                    ▲
+-----------------------------------------------------------------------+
|                TIER 3: Cross-Feature Combinations                     |
|  - Intro build + mute toggle        - Skip intro + immediate orbit    |
|  - Page scroll + replay intro       - Hover elements during orbit     |
+-----------------------------------------------------------------------+
                                    ▲
+-----------------------------------------------------------------------+
|                TIER 2: Boundary & Corner Cases                        |
|  - Zero velocity & sudden stop      - High-velocity flick (>1000px/s) |
|  - Viewport corner entrapment       - Rapid mute toggle spam (50x)    |
|  - 0ms Skip button abort            - Dynamic viewport resize         |
+-----------------------------------------------------------------------+
                                    ▲
+-----------------------------------------------------------------------+
|                TIER 1: Primary Feature Coverage                       |
|  - Cursor Orbit & Flocking Kinematics (Boids, multi-tier, breathing)  |
|  - Procedural Web Audio Engine (MasterGain, synthesis profiles, mute) |
|  - Construction State Machine (6-phase flow, coordinates, Skip/Replay)|
|  - Visual Styling & Badges (Blueprint grid, 8-pt handles, guides)     |
+-----------------------------------------------------------------------+
```

---

## Tier Breakdown & Test Specifications

### Tier 1: Core Feature Coverage (>=5 Tests per Core Feature)

#### 1. Continuous Cursor Orbit & Flocking (`tests/tier1_cursor_orbit.test.js`)
- **T1.1.1 — Continuous Stationary Orbit Progression**: Swarm cursors evolve their orbit angle continuously on each animation frame when the user mouse is stationary (`speed = 0`). Orbit angle progresses strictly monotonically (`orbitAngle[t+1] > orbitAngle[t]`).
- **T1.1.2 — Multi-Tier Concentric Radii & Counter-Rotation**: Validates 8 cursor agents distributed across 3 distinct tiers (Tiers 0, 1, 2) with alternating clockwise (`speed > 0`) and counter-clockwise (`speed < 0`) angular velocities.
- **T1.1.3 — Zero-Velocity Orbit Stability**: When mouse velocity abruptly transitions to zero, cursors smoothly maintain their circular orbit without coordinate collapse, NaN, or infinite values.
- **T1.1.4 — Velocity Lag & Drag Vector**: When mouse moves with velocity `(vx, vy)`, the effective orbital center displaces backwards along the negative velocity vector (`-vx * lagFactor`, `-vy * lagFactor`), and radius dynamically contracts.
- **T1.1.5 — Boids Separation Force**: When two cursor agents approach within the minimum separation distance (`dist < 36px`), a repulsive spring force repels them apart.
- **T1.1.6 — Boundary Soft Deflection**: Swarm cursor agents near viewport boundaries `(0, 0, width, height)` experience restoring inward deflection, preventing clipping.
- **T1.1.7 — High-DPI Canvas Scaling Integrity**: Canvas resolution scales with `devicePixelRatio` while retaining accurate unscaled coordinate mapping.
- **T1.1.8 — Accessibility & Reduced-Motion Suppression**: When `prefers-reduced-motion: reduce` or touch device (`pointer: coarse`) is detected, cursor animation loop terminates gracefully without DOM errors.

#### 2. Procedural Web Audio Synthesizer Engine (`tests/tier1_audio_engine.test.js`)
- **T1.2.1 — MasterGain Audio Graph Topology**: Validates that all synthesis nodes route through a centralized `MasterGainNode` before terminating at `AudioContext.destination`.
- **T1.2.2 — Mute / Unmute State Machine**: Default starts muted (`isMuted: true`). Invoking `toggleMute()` toggles state, persists setting, and triggers an un-mute harmonic chime (523.25 Hz).
- **T1.2.3 — Drafting Chirp Synthesis Profile**: `playDraftBlip(frequency, duration)` creates a triangle wave oscillator, executes an upward exponential frequency ramp (`f * 1.5`), and decays gain to `0.001`.
- **T1.2.4 — Section Milestone Chime Profile**: `playChime(frequency, duration, type)` constructs a sine oscillator with exponential decay envelope over the specified duration.
- **T1.2.5 — Arpeggiated Completion Fanfare Profile**: `playCompletionHarmonics()` schedules an arpeggiated 4-note chord (`[523.25, 659.25, 783.99, 1046.50]` Hz / C5, E5, G5, C6) staggered at 120ms intervals.
- **T1.2.6 — Click Impulse & Box Snap Profile**: `playClickImpulse()` sweeps down from 800 Hz to 120 Hz over 80ms with gain envelope starting at 0.12.
- **T1.2.7 — Click-Free Audio Transitions**: Verifies all gain decay ramps target `0.001` (exponential) rather than `0.0`, preventing AudioParam mathematical exceptions and speaker DC pops.
- **T1.2.8 — Strict Silence in Muted State**: When `isMuted === true`, calling audio synthesis methods produces 0 node creations and 0 scheduled sound events.
- **T1.2.9 — Autoplay Policy Recovery**: When `AudioContext.state === 'suspended'`, user interaction calls `ctx.resume()` to restore audio graph operation.

#### 3. Live Construction Intro Sequence & Controls (`tests/tier1_site_builder.test.js`)
- **T1.3.1 — 6-Phase State Machine Transitions**: Intro sequences through:
  `BLANK_CANVAS` -> `DRAWING_WIREFRAMES` -> `DRAGGING_LAYOUT_BOXES` -> `ASSEMBLING_SECTIONS` -> `RESOLVING_TO_LIVE_SITE` -> `INTERACTIVE_LIVE`.
- **T1.3.2 — Spatial Coordinate Alignment**: Wireframe layout bounds match real target components (Navbar: `1240 × 50px`, Hero Viewport: `860 × 320px`, 3x Project Cards: `280 × 150px`).
- **T1.3.3 — Animated Headline Typing Engine**: Characters of `"AYUSH GORA"` increment sequentially with synchronized drafting blips.
- **T1.3.4 — Synchronous Skip Intro Action**: Calling `skipIntro()` or pressing `Escape` immediately aborts all timers, triggers completion harmonics, sets finishing state, and unlocks DOM.
- **T1.3.5 — Body Scroll Locking Lifecycle**: Setting `isBuilding = true` sets `document.body.style.overflow = 'hidden'` and stops Lenis. Finishing intro restores `document.body.style.overflow = ''` and restarts Lenis.
- **T1.3.6 — Replay Control Scroll & State Reset**: Triggering `onReplayIntro` instantly resets window scroll to `(0, 0)` (`behavior: 'instant'`), halts Lenis scroll, and re-mounts the builder sequence.
- **T1.3.7 — Post-Intro Interactivity Preservation**: When intro concludes or skips, overlay opacity transitions to 0, `pointer-events: none` is set, and 3D Canvas / links / modals become fully clickable.

#### 4. Visual Styling, Badges & Overlays (`tests/tier1_visual_styling.test.js`)
- **T1.4.1 — Dual-Tier Blueprint Grid Spacing**: Validates grid step calculation for minor (20px/40px) and major (80px) coordinate grid intersections across varying canvas widths and heights.
- **T1.4.2 — 8-Point Bounding Box Transform Handles**: Accurately computes coordinates for all 8 bounding handles (`NW`, `N`, `NE`, `E`, `SE`, `S`, `SW`, `W`) on dragged layout boxes.
- **T1.4.3 — Figma-Style Cursor Badge Layout**: Calculates pill width from text measurements, status indicator offset, and role tags (`Creative Lead`, `Cloud Eng`, `WebGL Core`, `Backend API`, `Designer`).
- **T1.4.4 — Smart Alignment Guide Rays**: Detects horizontal/vertical alignment between adjacent boxes and projects snap lines with distance badge callouts (`GAP: 24px`).
- **T1.4.5 — Architectural Measurement Ruler Ticks**: Generates periodic minor (10px) and major (50px) tick marks with numerical coordinates along top and left rulers.

---

### Tier 2: Boundary & Corner Cases (`tests/tier2_boundary_corner.test.js`)
- **T2.1 — Zero-Interaction Load**: Site boots without any mousemove or touch event; cursors default to center coordinates and orbit peacefully without NaN or error.
- **T2.2 — High-Velocity Flick (>1000px/s)**: Simulating a violent mouse flick does not send cursors to infinity or invert the spring calculations.
- **T2.3 — Viewport Corner Entrapment**: Placing the cursor at `(0, 0)`, `(width, 0)`, `(0, height)`, or `(width, height)` deflects orbits cleanly without clipping offscreen.
- **T2.4 — Instantaneous Stop After High Speed**: Transitioning `mouse.speed` from 50px/frame to 0px/frame within 1 frame dampens smoothly across frames via spring stiffness.
- **T2.5 — Rapid Mute/Unmute Toggle Spam (50x)**: Rapidly toggling audio mute 50 times in 100ms executes cleanly with zero audio memory leaks, node buildup, or unhandled promise rejections.
- **T2.6 — 0ms Instant Skip**: Invoking skip within 1ms of intro mount cancels all initial timeouts and triggers clean resolution without dangling intervals.
- **T2.7 — Dynamic Viewport Resize During Flight**: Changing viewport dimensions mid-flight recalculates canvas buffers and reclamps builder targets.
- **T2.8 — Blocked AudioContext Support**: When `window.AudioContext` is unavailable or throws due to permissions, sound methods fail silently without throwing exceptions or breaking UI rendering.

---

### Tier 3: Cross-Feature Combinations (`tests/tier3_cross_feature.test.js`)
- **T3.1 — Intro Build Animation + Concurrent Audio Mute**: User mutes audio midway through Phase 2. Audio blips immediately silence while wireframe drawing and typing animation continue seamlessly.
- **T3.2 — Skip Intro + Immediate Fast Mouse Orbit**: User skips intro with ESC and instantly moves cursor across screen. Site immediately switches from intro canvas to active cursor flocking canvas.
- **T3.3 — Scrolled Page + Replay Intro Trigger**: User scrolls down 1200px to `#projects`, clicks "Replay Build" in Navbar. Window resets to (0, 0), scroll locks, intro starts Phase 1, and 3D background camera resets smoothly.
- **T3.4 — Hover Target Mode Switching**: Hovering between general background (`orbit_cursor`), nav link (`gather`), and project card (`orbit_element`) dynamically transitions cursor kinematics between orbit, card corner snap, and element perimeter orbit.
- **T3.5 — Click Impulse Scatter Under Mute vs Unmute**: Clicking mouse creates explosive particle scatter under both muted and unmuted conditions; synthesizer click impulse plays strictly when unmuted.
- **T3.6 — Browser Tab Blur / Visibility Change**: When document becomes hidden (`visibilitychange: hidden`), animation frame queue pauses without timer drift or desynchronized sequence steps.

---

### Tier 4: Real-World Application Scenarios (`tests/tier4_real_world_scenarios.test.js`)
- **T4.1 — Scenario A: First-Time Visitor Walkthrough**: Visitor opens portfolio -> watches full 5-step intro sequence -> hears milestone audio -> intro finishes with fanfare -> live site mounts -> visitor hovers projects and explores with orbiting cursors.
- **T4.2 — Scenario B: Impatient Developer Skip-to-Content**: Recruiter/visitor wants to see code immediately -> presses ESC 300ms into load -> intro is bypassed instantly -> body scroll unlocked -> visitor navigates to contact form.
- **T4.3 — Scenario C: Audio Enthusiast Workflow**: Visitor un-mutes in intro overlay -> listens to typing audio -> completes intro -> verifies navbar reflects unmuted state -> clicks interactive buttons with audible feedback.
- **T4.4 — Scenario D: Deep Exploration & Replay Sequence**: Visitor reads About, inspects 3D scene, scrolls to Experience, returns to top via "Replay Build", intro executes cleanly a second time, and resolves back to interactive site.
- **T4.5 — Scenario E: Mobile / Accessibility Constraint Mode**: Touch user or user with `prefers-reduced-motion` enabled visits portfolio -> heavy canvas flocking is disabled, allowing clean, battery-efficient, accessible portfolio navigation.

---

## Test Execution & Verification

### Running the Test Suite
The entire test suite is self-contained and runs using standard Node.js (v18+ / v20+ / v24+):

```bash
# Run all 4 tiers in unified runner
node tests/run_all.js

# Run individual test tiers
node tests/tier1_cursor_orbit.test.js
node tests/tier1_audio_engine.test.js
node tests/tier1_site_builder.test.js
node tests/tier1_visual_styling.test.js
node tests/tier2_boundary_corner.test.js
node tests/tier3_cross_feature.test.js
node tests/tier4_real_world_scenarios.test.js
```

### Exit Code Convention
- **Exit Code `0`**: All tests passed (100% success).
- **Exit Code `1`**: One or more assertions failed or unhandled exception occurred.
