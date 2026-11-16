# Task Assignment: Milestone 1 — Interaction & Viewport Boundaries Explorer

**Agent**: explorer_m1_interaction_boundaries
**Role**: Interaction & Viewport Boundaries Explorer
**Working Directory**: c:\Users\Ayush\OneDrive\Documents\swarm\.agents\teamwork\explorer_m1_interaction_boundaries\
**Target Component**: `frontend/src/animations/SwarmCursor.jsx`
**Input Documents**:
- `c:\Users\Ayush\OneDrive\Documents\swarm\.agents\teamwork\ORIGINAL_REQUEST.md`
- `c:\Users\Ayush\OneDrive\Documents\swarm\.agents\teamwork\PROJECT.md`
- `c:\Users\Ayush\OneDrive\Documents\swarm\.agents\teamwork\explorer_survey_cursor_audio\handoff.md`

## Objective
Provide exact specifications and implementation recommendations for pointer tracking, viewport soft boundaries, pointerleave graceful handling, and DOM interactive attribute integration (`[data-swarm="orbit"]`, `[data-swarm="gather"]`) in `frontend/src/animations/SwarmCursor.jsx`.

## Scope to Investigate & Formulate
1. **Viewport Soft Boundary Deflection**:
   - Soft restoring force $F_{\text{bound}}$ preventing cursors and badges from clipping off-screen when mouse is near edges ($x < 24$px, $x > W - 110$px, $y < 20$px, $y > H - 30$px).
2. **Pointerleave & Pointerenter Graceful Behavior**:
   - When pointer leaves the window, cursors smoothly glide to center or maintain orbital hover at boundary with reduced opacity, instantly resuming when pointer returns.
3. **DOM Interactive Hooks Integration**:
   - Responding to `[data-swarm="orbit"]` (expanding orbits around titles/cards) and `[data-swarm="gather"]` (gathering tightly around buttons on hover).
4. **Velocity Telemetry Hook**:
   - Hooking mouse velocity into `sound.updateCursorVelocity(mouse.speed)` for audio coupling.

## Output
Write your findings and recommendations to `c:\Users\Ayush\OneDrive\Documents\swarm\.agents\teamwork\explorer_m1_interaction_boundaries\handoff.md`.
Maintain `progress.md` with timestamps.
When finished, send message to orchestrator (`12ac508b-861f-4a78-8ce6-32adb45366b7`).


## 2026-11-04T15:23:13Z
You are explorer_m1_interaction_boundaries, an exploration agent for Milestone 1.
Your working directory is: c:\Users\Ayush\OneDrive\Documents\swarm\.agents\teamwork\explorer_m1_interaction_boundaries\
Read your task assignment: c:\Users\Ayush\OneDrive\Documents\swarm\.agents\teamwork\explorer_m1_interaction_boundaries\DISPATCH.md
Read the authoritative request: c:\Users\Ayush\OneDrive\Documents\swarm\.agents\teamwork\ORIGINAL_REQUEST.md
Read the project scope: c:\Users\Ayush\OneDrive\Documents\swarm\.agents\teamwork\PROJECT.md
Read the prior survey: c:\Users\Ayush\OneDrive\Documents\swarm\.agents\teamwork\explorer_survey_cursor_audio\handoff.md

Formulate exact interaction and viewport boundary handling for SwarmCursor.jsx:
1. Viewport soft boundary deflection preventing cursors and badges from clipping off-screen.
2. Pointerleave/pointerenter graceful handling (smooth park/restore without abrupt popping).
3. Seamless integration with `[data-swarm="orbit"]` and `[data-swarm="gather"]` interactive DOM targets.
4. Velocity hook dispatching to `sound.updateCursorVelocity(mouse.speed)`.

Write your complete recommendations to c:\Users\Ayush\OneDrive\Documents\swarm\.agents\teamwork\explorer_m1_interaction_boundaries\handoff.md.
Maintain progress.md in your working directory.
When finished, send a message to orchestrator (conversation ID: 12ac508b-861f-4a78-8ce6-32adb45366b7).
