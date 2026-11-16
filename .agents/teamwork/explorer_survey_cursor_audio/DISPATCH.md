# Task Assignment: Swarm Flocking & Web Audio Architecture Survey

**Agent**: explorer_survey_cursor_audio
**Role**: Swarm Flocking & Web Audio Architecture Survey
**Working Directory**: c:\Users\Ayush\OneDrive\Documents\swarm\.agents\teamwork\explorer_survey_cursor_audio\
**Input Document**: c:\Users\Ayush\OneDrive\Documents\swarm\.agents\teamwork\ORIGINAL_REQUEST.md

## Objective
Investigate and design technical specifications and algorithms for:
1. Continuous Swarm Cursor Orbit and Rotation around the user's cursor (R1).
2. Synthesizer / Ambient Audio engine using the native Web Audio API (R3).

## Required Investigation Scope
1. **Flocking & Orbit/Rotation Dynamics (R1)**:
   - Mathematics and physics of orbit + flocking: angular velocity, orbit radii, offset phases, lerp/spring easing towards user cursor target (X, Y).
   - Stationary vs moving state handling: ensure cursors continue orbiting steadily around mouse cursor coordinates even when the mouse stops moving (zero velocity of user cursor must NOT halt swarm orbits).
   - Anti-jitter and edge collision handling (viewport boundaries).
   - Cursor visual representations: SVG pointer icons with user names/labels (e.g., "Alice", "Bob", "Charlie", "Design Bot", etc.), color-coded badges, custom cursor coordinates.
   - Performance: RequestAnimationFrame loop, canvas vs DOM elements considerations, memory allocation.

2. **Procedural Synthesizer & Web Audio Engine (R3)**:
   - Self-contained procedural Web Audio implementation (no external audio assets or audio files required).
   - Audio architecture: AudioContext, Master GainNode (mute control), OscillatorNodes, BiquadFilterNodes, envelopes (attack, decay, sustain, release).
   - Sound palette:
     * Gentle cursor movement/orbit hum or subtle clicks.
     * Construction sounds: wireframe drafting sweep/chirp, box placement thud/snap, section lock-in chime.
     * Intro completion / crescendo synth chord.
   - User interaction policy: handling browser autoplay policy (AudioContext resume on first user gesture or during intro).
   - Mute state management: persistent mute toggle, absolute silence when muted, accessible UI button design.

3. **Constraints & Anti-Cheat**:
   - Must be original algorithms (Boids/orbital flocking principles implemented from first principles, procedural synth nodes from first principles).

## Output
Write your comprehensive survey report to `c:\Users\Ayush\OneDrive\Documents\swarm\.agents\teamwork\explorer_survey_cursor_audio\handoff.md`.
Also maintain `progress.md` with timestamps.
When complete, notify orchestrator via `send_message`.


## 2026-11-04T15:11:16Z
[Message from 12ac508b-861f-4a78-8ce6-32adb45366b7]
You are explorer_survey_cursor_audio, a read-only exploration agent.
Your working directory is: c:\Users\Ayush\OneDrive\Documents\swarm\.agents\teamwork\explorer_survey_cursor_audio\
Your task assignment is detailed in: c:\Users\Ayush\OneDrive\Documents\swarm\.agents\teamwork\explorer_survey_cursor_audio\DISPATCH.md
Also read the authoritative user request: c:\Users\Ayush\OneDrive\Documents\swarm\.agents\teamwork\ORIGINAL_REQUEST.md

Investigate technical algorithms and specifications for:
1. Continuous Swarm Cursor Orbit and Rotation (R1):
   - Flocking & orbital mechanics around the active mouse cursor.
   - Maintaining continuous smooth rotation during BOTH mouse movement AND stationary idle states (no freeze, no jump, no disappearing).
   - Multi-cursor simulation (names/avatars/colors, radius variations, individual angular offsets, lerp easing).
   - Coordinate tracking and window resize/boundary management.
2. Native Web Audio API Synthesizer (R3):
   - Procedural sound generation without external audio files.
   - Master gain node for instant global mute/unmute.
   - AudioContext handling with browser autoplay policy (unlock on gesture / intro).
   - Synthesis profiles for cursor movement/ambient hum, drafting/drawing chirps, box placement clicks, section lock chimes, and completion fanfare.

Write your complete findings and architectural design into:
c:\Users\Ayush\OneDrive\Documents\swarm\.agents\teamwork\explorer_survey_cursor_audio\handoff.md
Maintain progress.md in your working directory.
When finished, send a message to the orchestrator (conversation ID: 12ac508b-861f-4a78-8ce6-32adb45366b7) notifying that your handoff is ready.
