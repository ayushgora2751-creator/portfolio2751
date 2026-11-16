# Technical Survey & Architectural Specification: Continuous Swarm Cursor Flocking (R1) & Native Web Audio Synthesizer (R3)

**Author**: `explorer_survey_cursor_audio`  
**Working Directory**: `c:\Users\Ayush\OneDrive\Documents\swarm\.agents\teamwork\explorer_survey_cursor_audio\`  
**Date**: 2026-11-04  
**Target Project**: Ayush Gora Developer Portfolio (`frontend/`)

---

## 1. Observation

Direct code examination of the existing workspace in `c:\Users\Ayush\OneDrive\Documents\swarm\` revealed the following:

### 1.1 Project Structure & Build Pipeline
- `frontend/package.json` (lines 1-38):
  ```json
  "dependencies": {
    "@react-three/drei": "^9.102.6",
    "@react-three/fiber": "^8.16.1",
    "axios": "^1.6.8",
    "canvas-confetti": "^1.9.2",
    "clsx": "^2.1.0",
    "framer-motion": "^11.1.7",
    "gsap": "^3.12.5",
    "lenis": "^1.1.20",
    "lucide-react": "^0.368.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "tailwind-merge": "^2.2.2",
    "three": "^0.163.0"
  }
  ```
  The production build executes cleanly via `npm run build` (`vite build`), completing in ~14.95 seconds with zero compilation or bundling errors:
  ```text
  dist/index.html                      2.25 kB │ gzip:   1.01 kB
  dist/assets/index-DgNAbjSN.css      33.41 kB │ gzip:   6.25 kB
  dist/assets/animation-aU-GG2-B.js   20.00 kB │ gzip:   5.78 kB
  dist/assets/icons-D7vGhLp6.js       26.41 kB │ gzip:   7.02 kB
  dist/assets/index-ByhyIrsg.js      152.47 kB │ gzip:  48.45 kB
  dist/assets/three-DOHYQVan.js      934.55 kB │ gzip: 258.87 kB
  ✓ built in 14.95s
  ```

### 1.2 Existing Cursor Implementation (`frontend/src/animations/SwarmCursor.jsx`)
Direct observation of `SwarmCursor.jsx` (lines 1-415):
- **Cursor Configurations** (lines 19-28):
  8 agents configured across 3 tiers (0, 1, 2) with fixed speeds ($0.045, -0.04, 0.032, -0.035$, etc.) and radii ranging from 45px to 125px.
- **Canvas Sizing** (lines 47-48 & 88-89):
  ```javascript
  let width = (canvas.width = window.innerWidth);
  let height = (canvas.height = window.innerHeight);
  ```
  *Defect observed*: The canvas does not account for `window.devicePixelRatio` (DPR). On Retina / High-DPI screens ($1.5\times$, $2\times$, $3\times$), canvas text badges and SVG paths appear fuzzy and blurred.
- **Frame Rate Dependency** (lines 176-177 & 256):
  ```javascript
  time += 0.02;
  // ...
  c.orbitAngle += c.speed;
  ```
  *Defect observed*: The progression is not normalized by $\Delta t$. On high-refresh monitors (120Hz, 144Hz, 240Hz), cursors orbit $2\times$ to $4\times$ faster than on standard 60Hz displays.
- **Velocity Lag Snapping** (lines 276-277):
  ```javascript
  const velocityLagX = -mouse.vx * 15 * (c.mass * 0.8);
  const velocityLagY = -mouse.vy * 15 * (c.mass * 0.8);
  ```
  *Defect observed*: When the mouse comes to a sudden halt, `mouse.vx` drops to 0 instantly, causing `destX` to jump abruptly back to the unlagged orbit position unless spring damping catches up.
- **Rotational Heading Disconnect** (lines 312-314 vs lines 334-335):
  ```javascript
  const targetAngle = speed > 0.4 ? Math.atan2(c.vy, c.vx) + Math.PI / 4 : 0;
  c.angle += (targetAngle - c.angle) * 0.15;
  // ...
  const tilt = Math.max(-0.35, Math.min(0.35, c.vx * 0.05));
  ctx.rotate(tilt); // c.angle was computed but discarded; only tilt is used
  ```
- **Screen Boundary Clipping**:
  When the mouse is moved near screen edges ($x < 50$ or $y < 50$), outer orbit tiers ($r = 125\text{px}$) push cursors and badges completely off-screen or cause them to clip at viewport boundaries.

### 1.3 Existing Web Audio Implementation (`frontend/src/services/soundEffects.js`)
Direct observation of `soundEffects.js` (lines 1-125):
- **Missing Master Gain Node** (lines 55, 78, 113):
  ```javascript
  osc.connect(gain);
  gain.connect(this.ctx.destination);
  ```
  *Defect observed*: Oscillators connect directly to `this.ctx.destination`. There is no intermediate `MasterGainNode`. When `toggleMute()` is triggered, active ringing chimes cannot be silenced immediately.
- **Autoplay Handling & State Management** (lines 11-13 & 27-38):
  `this.isMuted = true` is defaulted, but mute preference is not persisted in `localStorage`.
- **Missing Sound Profiles**:
  The current implementation only contains `playDraftBlip`, `playChime`, `playCompletionHarmonics`, and `playClickImpulse`. It lacks:
  1. Ambient velocity-responsive cursor hum/drone.
  2. Magnetic box-placement snap clicks.
  3. Harmonic multi-frequency chime chords.

---

## 2. Logic Chain

From the observations above, we establish the step-by-step engineering design and mathematical formulation required to satisfy R1 and R3.

### 2.1 Flocking & Continuous Orbital Dynamics Around Mouse Cursor (R1)

#### 2.1.1 Continuous Rotation Independence
To guarantee that cursors rotate continuously without freezing, jumping, or disappearing when the mouse stops:
1. **Time-Based Angular Evolution**:
   Let the angle $\theta_i$ of agent $i$ evolve based on elapsed delta time $\Delta t_{\text{norm}} = \frac{t - t_{\text{prev}}}{16.667\text{ms}}$:
   $$\theta_i(t + \Delta t) = \theta_i(t) + \omega_i \cdot \Delta t_{\text{norm}}$$
   Because $\frac{d\theta_i}{dt} = \omega_i$ is governed strictly by the internal animation clock, $\omega_i \neq 0$ regardless of mouse velocity $\vec{v}_m$.
   **When the mouse is completely stationary ($\vec{v}_m = 0$)**:
   The orbit center is $(X_m, Y_m)$, and each cursor smoothly travels its circular path $R_i \cdot (\cos \theta_i, \sin \theta_i)$.
2. **Harmonic Breathing in Idle State**:
   To prevent mechanical rigidity when the user hovers in one place, modulate the idle radius with a soft harmonic respiration wave:
   $$R_i(t) = R_{0, i} + A_i \cdot \sin(2\pi f_i t + \phi_i)$$
   where $A_i \approx 3.0\text{px}$, $f_i \approx 0.4\text{Hz}$ (period ~2.5s). This gives the swarm an organic, alive presence.

#### 2.1.2 Dynamic Trailing & Contraction During Mouse Motion
When the user moves the mouse with velocity $\vec{v}_m = (v_x, v_y)$ and speed $S = \|\vec{v}_m\|$:
1. **Cohesion Contraction**:
   At high travel speeds, outer orbits contract inwards to prevent cursors from lagging too far behind:
   $$R_{\text{eff}, i} = R_i \cdot \left(1.0 - 0.35 \cdot \min\left(\frac{S}{6.0}, 1.0\right)\right)$$
2. **Damped Inertial Lag**:
   Instead of setting instantaneous lag $\vec{L} = -\vec{v}_m \cdot k$, maintain a smoothed lag state vector $\vec{L}_i$ integrated with exponential smoothing:
   $$\vec{L}_i(t) = \text{lerp}(\vec{L}_i(t - \Delta t), -\vec{v}_m \cdot k_{\text{lag}} \cdot m_i, 0.15)$$
   This guarantees that when the mouse stops moving instantly, $\vec{L}_i$ gently decays back to $(0,0)$ without snapping or visual popping.
3. **Orbital Target Coordinates**:
   $$\begin{aligned}
   x_{\text{target}, i} &= X_m + R_{\text{eff}, i} \cdot \cos(\theta_i) + L_{x, i} \\
   y_{\text{target}, i} &= Y_m + R_{\text{eff}, i} \cdot \sin(\theta_i) + L_{y, i}
   \end{aligned}$$

#### 2.1.3 Multi-Tier Architecture & Counter-Rotation
To simulate a multi-agent collaborative environment (reminiscent of Dhvanil Patel and Joel Califa), configure 8 unique agents across 3 concentric orbital tiers:
- **Tier 0 (Inner Core, $R \approx 42 - 50\text{px}$)**:
  - Agent 0: "Ayush (Lead)" — `#3b82f6` (Royal Blue), $\omega = +0.038\text{ rad/frame}$ (Clockwise)
  - Agent 1: "DevOps" — `#06b6d4` (Cyan), $\omega = -0.042\text{ rad/frame}$ (Counter-Clockwise)
- **Tier 1 (Middle Ring, $R \approx 72 - 88\text{px}$)**:
  - Agent 2: "Three.js" — `#8b5cf6` (Purple), $\omega = +0.028\text{ rad/frame}$ (Clockwise)
  - Agent 3: "Django REST" — `#10b981` (Emerald), $\omega = -0.032\text{ rad/frame}$ (Counter-Clockwise)
  - Agent 4: "Reviewer" — `#ec4899` (Pink), $\omega = +0.025\text{ rad/frame}$ (Clockwise)
- **Tier 2 (Outer Ring, $R \approx 112 - 128\text{px}$)**:
  - Agent 5: "UI/UX" — `#f43f5e` (Rose), $\omega = -0.020\text{ rad/frame}$ (Counter-Clockwise)
  - Agent 6: "Architect" — `#f59e0b` (Amber), $\omega = +0.018\text{ rad/frame}$ (Clockwise)
  - Agent 7: "Docker" — `#0ea5e9` (Sky Blue), $\omega = -0.016\text{ rad/frame}$ (Counter-Clockwise)

Alternating clockwise and counter-clockwise directions across tiers produces a layered, gyro-stabilized orbit that feels deep and three-dimensional.

#### 2.1.4 Physics Integration & Anti-Collision Separation
For each agent $i$:
1. **Spring-Damper Force**:
   $$\begin{aligned}
   a_{x, \text{spring}} &= (x_{\text{target}, i} - x_i) \cdot k_{\text{stiffness}} \\
   a_{y, \text{spring}} &= (y_{\text{target}, i} - y_i) \cdot k_{\text{stiffness}}
   \end{aligned}$$
   where $k_{\text{stiffness}} \approx 0.08 - (\text{tier} \times 0.012)$, giving outer tiers slightly more inertial elasticity.
2. **Boids Separation Force**:
   For any pair of agents $(i, j)$ where distance $d_{ij} < D_{\text{min}} = 38\text{px}$:
   $$\vec{F}_{\text{sep}, i} = \sum_{j \neq i, d_{ij} < D_{\text{min}}} \frac{D_{\text{min}} - d_{ij}}{D_{\text{min}}} \cdot \frac{\vec{P}_i - \vec{P}_j}{d_{ij}} \cdot k_{\text{repel}}$$
   where $k_{\text{repel}} \approx 0.8$. This prevents name badges from overlapping or flickering when orbits cross.
3. **Velocity & Position Update**:
   $$\begin{aligned}
   v_{x, i} &= (v_{x, i} + a_{x, \text{spring}} + F_{x, \text{sep}}) \cdot k_{\text{damping}} \\
   v_{y, i} &= (v_{y, i} + a_{y, \text{spring}} + F_{y, \text{sep}}) \cdot k_{\text{damping}} \\
   x_i &= x_i + v_{x, i} \cdot \Delta t_{\text{norm}} \\
   y_i &= y_i + v_{y, i} \cdot \Delta t_{\text{norm}}
   \end{aligned}$$
   with $k_{\text{damping}} \approx 0.82$.

#### 2.1.5 Viewport Boundary Soft-Clamping & High-DPI Scaling
1. **High-DPI Canvas Scaling**:
   ```javascript
   const dpr = Math.min(window.devicePixelRatio || 1, 2);
   canvas.width = window.innerWidth * dpr;
   canvas.height = window.innerHeight * dpr;
   canvas.style.width = `${window.innerWidth}px`;
   canvas.style.height = `${window.innerHeight}px`;
   ctx.scale(dpr, dpr);
   ```
   This eliminates all rasterization artifacts on high-DPI displays while capping at $2\times$ to prevent GPU fill-rate waste on $3\times$ screens.
2. **Boundary Padding & Soft Deflection**:
   Define screen margin padding $P = 24\text{px}$ (and $P_{\text{right}} = 100\text{px}$ to accommodate text badges).
   If $x_i < P$, apply soft restoring force $F_{\text{bound}, x} = (P - x_i) \times 0.25$.
   If $x_i > W - P_{\text{right}}$, apply $F_{\text{bound}, x} = (W - P_{\text{right}} - x_i) \times 0.25$.
   Apply identical bounds for $y$ ($P_{\text{top}} = 20\text{px}$, $P_{\text{bottom}} = 30\text{px}$).
3. **Pointerleave State**:
   When the user's mouse leaves the document window (`document.addEventListener('pointerleave')`), do NOT destroy or hide the cursors. Instead, smoothly lerp $(X_m, Y_m)$ towards $(W/2, H/2)$ or maintain orbit at the last known exit point with a dimmed alpha ($0.5$). When the pointer re-enters, lerp immediately back.

---

### 2.2 Procedural Web Audio Engine Architecture (R3)

#### 2.2.1 Audio Graph Hierarchy
The procedural audio synthesizer must be structured as follows:

```
┌────────────────────────────────────────────────────────┐
│ Procedural Sound Voices                                │
│                                                        │
│ [Drafting Oscillator] ──> [Voice Gain] ─┐             │
│ [Snap Click Generator] ─> [Voice Gain] ─┤             │
│ [Chime Oscillators] ────> [Voice Gain] ─┼─> [Master] ─┼─> [ctx.destination]
│ [Harmonic Fanfare] ─────> [Voice Gain] ─┤   [Filter]  │
│ [Ambient Hum Drone] ────> [Voice Gain] ─┘             │
└────────────────────────────────────────────────────────┘
                                               ▲
                                               │
                                     [Master Gain Node]
                                    (Global Mute / Vol)
```

1. **Master Gain Node**:
   All synthesized voice nodes connect directly into `this.masterGain`, which connects to `this.ctx.destination`.
   - **Muting**: `this.masterGain.gain.setTargetAtTime(0, this.ctx.currentTime, 0.015);`
   - **Unmuting**: `this.masterGain.gain.setTargetAtTime(0.40, this.ctx.currentTime, 0.015);`
   The 15ms exponential time constant prevents DC offset clicks when toggling audio on/off.
2. **Master Filter (BiquadFilterNode)**:
   A global gentle high-shelf / low-pass filter ($12\text{kHz}$) warms the sound and prevents piercing digital harshness.

#### 2.2.2 Autoplay Unlock Protocol
1. Modern browsers block audio until an explicit user interaction occurs.
2. The `SoundEngine` class initializes lazily:
   ```javascript
   init() {
     if (!this.ctx && typeof window !== 'undefined') {
       const AudioContextClass = window.AudioContext || window.webkitAudioContext;
       if (AudioContextClass) {
         this.ctx = new AudioContextClass();
         this.masterGain = this.ctx.createGain();
         this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : 0.4, this.ctx.currentTime);
         this.masterGain.connect(this.ctx.destination);
       }
     }
   }
   ```
3. A global gesture listener registers on `window`:
   ```javascript
   const unlockAudio = () => {
     if (this.ctx && this.ctx.state === 'suspended') {
       this.ctx.resume().catch(() => {});
     }
     ['pointerdown', 'keydown', 'touchstart'].forEach(e => 
       window.removeEventListener(e, unlockAudio)
     );
   };
   ['pointerdown', 'keydown', 'touchstart'].forEach(e => 
     window.addEventListener(e, unlockAudio, { passive: true, once: true })
   );
   ```
4. **Mute Preference Storage**:
   Persist state to `localStorage.getItem('swarm_portfolio_muted')`. Default to `false` (or `true` if user prefers silence).

#### 2.2.3 Procedural Sound Synthesis Profiles

| Profile Name | Trigger Event | Audio Nodes & Waveform | Frequency & Envelope Parameters |
|---|---|---|---|
| **1. Ambient Cursor Hum** | Cursor motion speed $> 1.5\text{px/frame}$ | Dual Sine Oscillators through Low-pass filter ($350\text{Hz}$) | $110\text{Hz}$ fundamental + $165\text{Hz}$ fifth. Gain modulates with cursor speed: $G = \text{clamp}(S \times 0.004, 0, 0.035)$. Soft continuous drone. |
| **2. Drafting Chirp** | Intro wireframe drawing, typing letters | Triangle Oscillator with exponential pitch sweep | $480\text{Hz} \to 820\text{Hz}$ over $45\text{ms}$. Attack: $3\text{ms}$, Decay: $42\text{ms}$. Crisp, delicate stylus feedback. |
| **3. Box Snap Click** | Wireframe box placement, layout lock | Percussive Sine + Transient Burst | Pitch drop $980\text{Hz} \to 90\text{Hz}$ in $20\text{ms}$. Attack: $1\text{ms}$, Decay: $25\text{ms}$. Satisfying magnetic haptic snap. |
| **4. Section Lock Chime** | Intro milestone complete, card hover | Dual Sine Oscillators (Major 3rd / 5th) | $659.25\text{Hz}$ ($E_5$) + $987.77\text{Hz}$ ($B_5$). Attack: $8\text{ms}$, Exponential Decay: $380\text{ms}$. Resonant acoustic glass tone. |
| **5. Completion Fanfare** | Intro finish, Skip button triggered | Arpeggiated 5-note Major 9th Chord | Notes: $C_5 (523.25\text{Hz})$, $E_5 (659.25\text{Hz})$, $G_5 (783.99\text{Hz})$, $B_5 (987.77\text{Hz})$, $D_6 (1174.66\text{Hz})$. Cascaded delays: $75\text{ms}$ spacing, $650\text{ms}$ decay, detuned chorus $\pm 4\text{cents}$. |

---

## 3. Detailed Proposed Implementation Blueprints

### 3.1 Proposed Sound Engine Architecture (`frontend/src/services/soundEffects.js`)

```javascript
/**
 * soundEffects.js
 * High-performance, zero-asset procedural Web Audio API engine.
 */

class SoundEngine {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.humOsc1 = null;
    this.humOsc2 = null;
    this.humGain = null;
    
    // Read persisted preference or default to unmuted (false)
    const saved = typeof window !== 'undefined' ? localStorage.getItem('swarm_portfolio_muted') : null;
    this.isMuted = saved !== null ? saved === 'true' : true; // default muted for clean first impression
  }

  init() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      this.ctx = new AudioCtx();

      // Master Gain Node for global control
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : 0.35, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);

      // Setup continuous ambient hum drone
      this.setupAmbientHum();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  toggleMute() {
    this.init();
    this.isMuted = !this.isMuted;
    if (typeof window !== 'undefined') {
      localStorage.setItem('swarm_portfolio_muted', String(this.isMuted));
    }

    if (this.masterGain && this.ctx) {
      const target = this.isMuted ? 0 : 0.35;
      this.masterGain.gain.setTargetAtTime(target, this.ctx.currentTime, 0.015);
    }

    if (!this.isMuted) {
      this.playChime(659.25, 0.25, 'sine');
    }
    return this.isMuted;
  }

  setMuted(muted) {
    this.init();
    this.isMuted = muted;
    if (this.masterGain && this.ctx) {
      const target = this.isMuted ? 0 : 0.35;
      this.masterGain.gain.setTargetAtTime(target, this.ctx.currentTime, 0.015);
    }
  }

  setupAmbientHum() {
    if (!this.ctx || !this.masterGain) return;
    try {
      this.humOsc1 = this.ctx.createOscillator();
      this.humOsc2 = this.ctx.createOscillator();
      this.humGain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(320, this.ctx.currentTime);

      this.humOsc1.type = 'sine';
      this.humOsc1.frequency.setValueAtTime(110, this.ctx.currentTime); // A2

      this.humOsc2.type = 'sine';
      this.humOsc2.frequency.setValueAtTime(165, this.ctx.currentTime); // E3

      this.humGain.gain.setValueAtTime(0, this.ctx.currentTime);

      this.humOsc1.connect(this.humGain);
      this.humOsc2.connect(this.humGain);
      this.humGain.connect(filter);
      filter.connect(this.masterGain);

      this.humOsc1.start();
      this.humOsc2.start();
    } catch (e) {
      // AudioContext policy
    }
  }

  // Modulate ambient drone based on cursor velocity
  updateCursorVelocity(speed) {
    if (this.isMuted || !this.ctx || !this.humGain) return;
    try {
      const targetGain = Math.min(Math.max(speed - 1.0, 0) * 0.003, 0.025);
      this.humGain.gain.setTargetAtTime(targetGain, this.ctx.currentTime, 0.08);
    } catch (e) {}
  }

  // 1. Drafting sweep / typewriter blip
  playDraftBlip(frequency = 520, duration = 0.05) {
    if (this.isMuted || !this.ctx || !this.masterGain) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(frequency, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(frequency * 1.6, this.ctx.currentTime + duration);

      gain.gain.setValueAtTime(0.06, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch (e) {}
  }

  // 2. Magnetic box placement snap click
  playBoxSnap() {
    if (this.isMuted || !this.ctx || !this.masterGain) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(950, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(80, this.ctx.currentTime + 0.035);

      gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.035);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.035);
    } catch (e) {}
  }

  // 3. Section lock harmonic chime
  playChime(freq = 659.25, duration = 0.4, type = 'sine') {
    if (this.isMuted || !this.ctx || !this.masterGain) return;
    try {
      const now = this.ctx.currentTime;
      [freq, freq * 1.5].forEach((f, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = type;
        osc.frequency.setValueAtTime(f, now);

        const initialVol = idx === 0 ? 0.09 : 0.04;
        gain.gain.setValueAtTime(initialVol, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.start(now);
        osc.stop(now + duration);
      });
    } catch (e) {}
  }

  // 4. Grand completion fanfare (C Maj9 Arpeggio)
  playCompletionHarmonics() {
    if (this.isMuted || !this.ctx || !this.masterGain) return;
    const notes = [523.25, 659.25, 783.99, 987.77, 1174.66]; // C5, E5, G5, B5, D6
    notes.forEach((freq, idx) => {
      setTimeout(() => {
        this.playChime(freq, 0.65, 'sine');
      }, idx * 75);
    });
  }

  // 5. Click impulse
  playClickImpulse() {
    if (this.isMuted || !this.ctx || !this.masterGain) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(800, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(140, this.ctx.currentTime + 0.07);

      gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.07);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.07);
    } catch (e) {}
  }
}

export const sound = new SoundEngine();
```

---

### 3.2 Proposed Swarm Cursor Architecture (`frontend/src/animations/SwarmCursor.jsx`)

Key enhancements to incorporate into `SwarmCursor.jsx`:
1. **DevicePixelRatio Canvas Scaling**: Support crisp $2\times$ rendering without sub-pixel blurring.
2. **Delta-Time Normalized Rotation**: $\Delta t_{\text{norm}} = (now - lastTime) / 16.667$ applied to all angular increments ($\Delta \theta = \omega_i \cdot \Delta t_{\text{norm}}$).
3. **Smoothed Velocity Lag Integration**: Exponential smoothing on $\vec{L}_i$ preventing snaps when mouse halts.
4. **Respiration Breathing Wave**: Continuous sinusoidal radius oscillation during stationary hover.
5. **Screen Margin Guard**: Restoring boundary deflection ensuring cursors and badges never clip outside the viewport.
6. **Velocity-Reactive Ambient Audio**: Hooking cursor speed into `sound.updateCursorVelocity(mouse.speed)`.

---

## 4. Caveats & Assumptions

1. **Touch / Mobile Devices**:
   Touchscreen devices do not emit continuous `pointermove` coordinates and have no concept of hovering. The swarm cursor must remain disabled on coarse pointer devices (`pointer: coarse` or `window.innerWidth < 768`) to save battery and prevent obstructing touch targets.
2. **Accessibility**:
   Users with `prefers-reduced-motion: reduce` must be respected: the canvas animation loop will terminate immediately, rendering zero intrusive motion.
3. **Audio Autoplay Edge Cases**:
   If a user visits the site without interacting, audio cannot play due to browser policy. The synthesizer handles this by initializing the `AudioContext` only on the first user interaction (or un-mute click), with graceful fallback `catch()` blocks around all audio node calls.
4. **Background Tab Throttling**:
   `requestAnimationFrame` is automatically paused or throttled to ~1 FPS by browsers when the browser tab is inactive. When the tab regains focus, `dt` must be clamped (`Math.min(dt, 64)`) to prevent a huge physics jump.

---

## 5. Conclusion

1. **R1 (Continuous Swarm Orbit & Rotation)** is technically achieved by driving orbital angular phase progression through an independent, delta-time normalized clock, completely decoupled from mouse velocity. By combining damped harmonic spring physics, mutual Boids separation, and smoothed inertia lag vectors, swarm cursors rotate continuously without freezing or jumping whether the mouse is moving rapidly, halted in place, or traversing screen boundaries.
2. **R3 (Native Web Audio Synthesizer)** is technically achieved through a dedicated `MasterGainNode` architecture, eliminating external assets while enabling instant global mute/unmute control. Five distinct synthesis profiles (ambient hum, drafting chirps, snap clicks, section chimes, completion fanfare) provide rich sonic feedback paired with UI animations, fully compliant with browser autoplay policies.
3. The existing project codebase (`ayush-gora-portfolio`) is verified healthy, building with Vite 5.4.21 in 14.95 seconds with zero compilation errors.

---

## 6. Verification Method

To independently verify these specifications:
1. **Compilation Check**:
   ```powershell
   cd c:\Users\Ayush\OneDrive\Documents\swarm\frontend
   npm run build
   ```
   *Expected result*: Build exits with code `0`, generating clean output in `dist/`.
2. **Stationary Motion Verification**:
   - Open browser preview (`npm run preview` or `npm run dev`).
   - Move mouse to center of screen and stop moving.
   - *Verification check*: All 8 cursors must continue orbiting in their concentric counter-rotating rings without stopping, freezing, or snapping.
3. **High-Speed Sweep Verification**:
   - Rapidly flick the mouse across the viewport.
   - *Verification check*: Cursors trail smoothly behind the pointer, contract slightly, and spring back into orbit upon stopping without disappearing or teleporting.
4. **Boundary Verification**:
   - Move mouse directly to the top-left ($x=0, y=0$) and bottom-right edges of the screen.
   - *Verification check*: Soft boundary deflection prevents cursors and name badges from clipping off-screen.
5. **Instant Mute & Audio Verification**:
   - Click the audio button in the top navigation bar.
   - *Verification check*: Sound unmutes smoothly with a chime. Re-clicking instantly silences all active sound nodes without audio pops.
