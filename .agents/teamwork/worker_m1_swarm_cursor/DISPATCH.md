# Task Assignment: Milestone 1 — Swarm Cursor Orbit & Flocking Engine Implementation

**Agent**: worker_m1_swarm_cursor
**Role**: Frontend Physics & Animation Worker
**Working Directory**: c:\Users\Ayush\OneDrive\Documents\swarm\.agents\teamwork\worker_m1_swarm_cursor\
**Exclusive Write Ownership**: `frontend/src/animations/SwarmCursor.jsx`
**Input Documents**:
- `c:\Users\Ayush\OneDrive\Documents\swarm\.agents\teamwork\ORIGINAL_REQUEST.md`
- `c:\Users\Ayush\OneDrive\Documents\swarm\.agents\teamwork\PROJECT.md`
- `c:\Users\Ayush\OneDrive\Documents\swarm\.agents\teamwork\explorer_m1_orbital_physics\handoff.md`
- `c:\Users\Ayush\OneDrive\Documents\swarm\.agents\teamwork\explorer_m1_canvas_rendering\handoff.md`
- `c:\Users\Ayush\OneDrive\Documents\swarm\.agents\teamwork\explorer_m1_interaction_boundaries\handoff.md`

## Objective
Implement Milestone 1 in `frontend/src/animations/SwarmCursor.jsx` by synthesizing the technical specifications and algorithms from the three M1 explorers.

## Core Implementation Requirements
1. **Continuous Orbit & Flocking Mechanics**:
   - Independent delta-time normalized orbital clock ($\theta_i(t + \Delta t) = \theta_i(t) + \omega_i \cdot \Delta t_{\text{norm}}$) ensuring continuous orbit rotation during BOTH mouse movement AND stationary idle states without freezing, jumping abruptly, or stopping.
   - Organic harmonic respiration breathing wave ($A \sin(2\pi f t + \phi)$) during stationary hover.
   - Integrated exponentially smoothed velocity lag vector ($\vec{L}_i$) preventing snapping when mouse halts.
   - Non-linear quadratic Boids separation force preventing cursor/badge overlaps.
2. **High-DPI Retina Canvas Rendering & Heading**:
   - DevicePixelRatio (DPR) scaled canvas buffer (capped at 2.0 with `ctx.setTransform(1,0,0,1,0,0); ctx.scale(dpr, dpr)`).
   - 3 concentric counter-rotating tiers with the 8 verified collaborative agent configurations (Ayush, DevOps, Three.js, Django, Reviewer, UI/UX, Architect, Docker).
   - Dynamic aerodynamic banking tilt ($\pm 32^\circ$) on SVG cursors with neon glow fill and crisp white stroke.
   - Figma-style translucent obsidian pill badges with typography hierarchy (`Inter 600` + `JetBrains Mono 400`), phase-staggered harmonic status dot pulsing, and dynamic viewport boundary flipping.
3. **Viewport Soft Boundaries & DOM Hooks**:
   - Viewport soft boundary deflection ($F_{\text{bound}}$) and elastic boundary guards keeping cursors and badges in bounds.
   - Graceful pointerleave/enter transitions with smooth resting drift and opacity fade ($1.0 \leftrightarrow 0.40$).
   - DOM interactive hooks: wide perimeter elliptical expansion for `[data-swarm="orbit"]` and non-colliding 8-point perimeter anchor distribution for `[data-swarm="gather"]`.
   - Audio velocity hook dispatching current speed to `sound.updateCursorVelocity(mouse.speed)` with exponential velocity decay in `render()`.
4. **Verification & Build**:
   - Run `npm --prefix frontend run build` and ensure exit code 0.
   - Confirm zero unhandled console errors or runtime syntax issues.

## MANDATORY INTEGRITY WARNING
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

## Output
Write your handoff report to `c:\Users\Ayush\OneDrive\Documents\swarm\.agents\teamwork\worker_m1_swarm_cursor\handoff.md` including exact build command output and layout verification.
Maintain `progress.md` with timestamps.

## 2026-11-04T15:29:45Z
Received dispatch from orchestrator 12ac508b-861f-4a78-8ce6-32adb45366b7:
Implement the complete, verified SwarmCursor.jsx with orbital physics, canvas rendering, interaction boundaries, DOM hooks, sound hook, and high-DPI scaling.
Verify build with `npm --prefix frontend run build`.
