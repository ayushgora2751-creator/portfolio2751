# Task Assignment: Milestone 2 — Procedural Web Audio Engine & Mute Controls

**Agent**: worker_m2_sound_engine
**Role**: Web Audio Synthesizer & Frontend Worker
**Working Directory**: c:\Users\Ayush\OneDrive\Documents\swarm\.agents\teamwork\worker_m2_sound_engine\
**Exclusive Write Ownership**:
- `frontend/src/services/soundEffects.js`
- `frontend/src/components/Navbar.jsx`
**Input Documents**:
- `c:\Users\Ayush\OneDrive\Documents\swarm\.agents\teamwork\ORIGINAL_REQUEST.md` (R3)
- `c:\Users\Ayush\OneDrive\Documents\swarm\.agents\teamwork\PROJECT.md` (Features 8–13)
- `c:\Users\Ayush\OneDrive\Documents\swarm\.agents\teamwork\explorer_survey_cursor_audio\handoff.md`
- `c:\Users\Ayush\OneDrive\Documents\swarm\TEST_INFRA.md`

## Objectives
Implement the complete, procedural Web Audio API engine in `frontend/src/services/soundEffects.js` and integrate persistent mute controls in `frontend/src/components/Navbar.jsx`:

1. **MasterGainNode Audio Architecture**:
   - Centralized `MasterGainNode` connected to `AudioContext.destination`.
   - All voice nodes (oscillators/gain) connect to `this.masterGain`.
   - Click-free muting/unmuting via 15ms exponential parameter target ramps (`setTargetAtTime`), targeting 0 when muted, 0.35 when unmuted.
   - Guaranteed strict silence when muted: synthesis methods must produce zero scheduled sound output when `this.isMuted === true`.
2. **Autoplay Policy & State Persistence**:
   - Lazy `AudioContext` instantiation and gesture-based auto-unlock (`pointerdown`, `keydown`, `touchstart`).
   - Read and persist user preference in `localStorage.getItem('swarm_portfolio_muted')`. Default to `true` (muted for first visit) or `false` based on preference.
3. **Five Procedural Synthesis Profiles** (Zero external audio assets/files):
   - `updateCursorVelocity(speed)`: Modulate dual-sine ambient hum drone (110Hz + 165Hz through low-pass filter at 320Hz) based on pointer speed ($G = \text{clamp}(S \times 0.003, 0, 0.025)$).
   - `playDraftBlip(frequency, duration)`: Triangle wave oscillator with exponential pitch sweep ($f \to 1.6f$) and decay to $0.0001$.
   - `playBoxSnap()`: Percussive sine transient drop ($950\text{Hz} \to 80\text{Hz}$) in 35ms.
   - `playChime(frequency, duration, type)`: Harmonic dual-sine/triangle resonant chime with exponential decay.
   - `playCompletionHarmonics()`: Arpeggiated C Major 9th chord (`[523.25, 659.25, 783.99, 987.77, 1174.66]` Hz) with staggered 75ms delays.
   - `playClickImpulse()`: Triangle impulse sweeping from 800Hz to 140Hz in 70ms.
4. **Navbar & UI Mute Controls**:
   - In `frontend/src/components/Navbar.jsx`, ensure mute toggle button reflects current `sound.isMuted` state, toggles via `sound.toggleMute()`, and stays synchronized across desktop and mobile headers.
5. **Testing & Verification**:
   - Run `node tests/tier1_audio_engine.test.js` and verify 9/9 tests pass with exit code 0.
   - Run `npm --prefix frontend run build` and verify clean build with exit code 0.

## MANDATORY INTEGRITY WARNING
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

## Output
Write your handoff report to `c:\Users\Ayush\OneDrive\Documents\swarm\.agents\teamwork\worker_m2_sound_engine\handoff.md`.
Maintain `progress.md`. Notify orchestrator via `send_message`.


## 2026-11-04T15:59:21Z
You are worker_m2_sound_engine, a specialized Web Audio and frontend implementation worker.
Your working directory is: c:\Users\Ayush\OneDrive\Documents\swarm\.agents\teamwork\worker_m2_sound_engine\
Your task assignment is in: c:\Users\Ayush\OneDrive\Documents\swarm\.agents\teamwork\worker_m2_sound_engine\DISPATCH.md
Read the authoritative user request: c:\Users\Ayush\OneDrive\Documents\swarm\.agents\teamwork\ORIGINAL_REQUEST.md
Read the project scope: c:\Users\Ayush\OneDrive\Documents\swarm\.agents\teamwork\PROJECT.md
Read the survey handoff: c:\Users\Ayush\OneDrive\Documents\swarm\.agents\teamwork\explorer_survey_cursor_audio\handoff.md
Read the test specifications: c:\Users\Ayush\OneDrive\Documents\swarm\TEST_INFRA.md

Your exclusive write targets:
- `frontend/src/services/soundEffects.js`
- `frontend/src/components/Navbar.jsx`

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Tasks:
1. Implement the complete procedural Web Audio synthesizer engine in `frontend/src/services/soundEffects.js`:
   - MasterGainNode audio topology routing all sound nodes to this.masterGain before ctx.destination.
   - Click-free muting/unmuting with 15ms exponential parameter target ramps (0 when muted, 0.35 when unmuted).
   - Autoplay policy unlocking on first user gesture (pointerdown, keydown, touchstart).
   - State persistence with localStorage ('swarm_portfolio_muted').
   - Procedural synthesis profiles:
     * updateCursorVelocity(speed): modulates dual-sine low-pass filtered ambient hum drone (110Hz + 165Hz, low-pass 320Hz).
     * playDraftBlip(freq, duration): triangle wave upward frequency sweep.
     * playBoxSnap(): percussive downward transient snap click.
     * playChime(freq, duration, type): harmonic resonant chime.
     * playCompletionHarmonics(): arpeggiated C Major 9th chord (523.25, 659.25, 783.99, 987.77, 1174.66 Hz).
     * playClickImpulse(): triangle impulse.
   - Strict silence guarantee when muted.
2. In `frontend/src/components/Navbar.jsx`, wire the mute toggle button so it accurately initializes from `sound.isMuted`, updates on click via `sound.toggleMute()`, and updates the volume icon and tooltip text.
3. Verify test pass: run `node tests/tier1_audio_engine.test.js` and verify exit code 0.
4. Verify build: run `npm --prefix frontend run build` and verify exit code 0.
5. Write your complete handoff report to `c:\Users\Ayush\OneDrive\Documents\swarm\.agents\teamwork\worker_m2_sound_engine\handoff.md`.
Maintain progress.md in your working directory.
When finished, send a message to orchestrator (conversation ID: 12ac508b-861f-4a78-8ce6-32adb45366b7).
