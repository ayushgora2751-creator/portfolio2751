# Technical Report & Physics Formulation: Continuous Swarm Cursor Flocking & Orbital Dynamics (Milestone 1)

**Agent**: `explorer_m1_orbital_physics`  
**Role**: Orbital Physics & Continuous Rotation Explorer  
**Working Directory**: `c:\Users\Ayush\OneDrive\Documents\swarm\.agents\teamwork\explorer_m1_orbital_physics\`  
**Target Component**: `frontend/src/animations/SwarmCursor.jsx`  
**Date**: 2026-11-04  
**Milestone**: Milestone 1 — Swarm Cursor Orbit & Flocking Engine  

---

## 1. Observation

Direct code examination of `frontend/src/animations/SwarmCursor.jsx` (lines 1–415) and system requirements in `ORIGINAL_REQUEST.md` and `PROJECT.md` revealed the following concrete observations:

### 1.1 Frame-Rate Dependent Orbital Progression (Missing $\Delta t$ Normalization)
In `frontend/src/animations/SwarmCursor.jsx`:
- Line 177:
  ```javascript
  time += 0.02;
  ```
- Line 256:
  ```javascript
  c.orbitAngle += c.speed;
  ```
**Observed Problem**: The angular update $\Delta \theta = \text{c.speed}$ runs once per `requestAnimationFrame`. On a standard 60 Hz display, each agent rotates $\approx 60 \cdot \omega_i$ radians per second. However, on a 120 Hz display (Apple ProMotion, modern gaming monitors), agents rotate at $120 \cdot \omega_i$ radians per second ($2\times$ faster), and on 240 Hz displays at $240 \cdot \omega_i$ ($4\times$ faster). If the browser frame rate fluctuates or stutters under system load, orbital speeds jump erratically.

### 1.2 Mouse Velocity Freeze on Stationary Halt & Instantaneous Inertia Snapping
In `frontend/src/animations/SwarmCursor.jsx`:
- Lines 96–101:
  ```javascript
  mouse.vx = (e.clientX - mouse.targetX) / dt;
  mouse.vy = (e.clientY - mouse.targetY) / dt;
  mouse.speed = Math.sqrt(mouse.vx * mouse.vx + mouse.vy * mouse.vy);
  mouse.targetX = e.clientX;
  mouse.targetY = e.clientY;
  ```
- Lines 276–277:
  ```javascript
  const velocityLagX = -mouse.vx * 15 * (c.mass * 0.8);
  const velocityLagY = -mouse.vy * 15 * (c.mass * 0.8);
  ```
**Observed Problem**: Mouse velocity is computed exclusively within the `pointermove` event handler. When the user stops moving the physical mouse, `pointermove` events cease firing entirely. Consequently, `mouse.vx`, `mouse.vy`, and `mouse.speed` retain their last non-zero movement vector indefinitely unless decaying in `render()`. Moreover, because `velocityLagX` and `velocityLagY` directly scale `-mouse.vx * 15`, any abrupt stop creates a discontinuous destination jump $\Delta \vec{X}_{\text{dest}} = -\vec{L}$, causing cursors to visually snap or pop into an unlagged orbit.

### 1.3 Stationary Idle State Lacks Organic Respiration
In `frontend/src/animations/SwarmCursor.jsx`:
- Lines 280–284:
  ```javascript
  const speedFactor = Math.min(currentMouseSpeed / 5, 1);
  const dynamicRadius = c.radius * (1 - speedFactor * 0.35);

  destX = mouse.x + Math.cos(c.orbitAngle) * dynamicRadius + velocityLagX;
  destY = mouse.y + Math.sin(c.orbitAngle) * dynamicRadius + velocityLagY;
  ```
**Observed Problem**: When `currentMouseSpeed == 0`, `dynamicRadius` collapses to a static constant $c.\text{radius}$. Cursors trace rigid concentric circles with zero expansion/contraction. The swarm appears mechanically locked rather than alive.

### 1.4 Inadequate Boids Separation Hull & Badge Collisions
In `frontend/src/animations/SwarmCursor.jsx`:
- Lines 295–305:
  ```javascript
  cursors.forEach((other, oIdx) => {
    if (idx === oIdx) return;
    const dx = c.x - other.x;
    const dy = c.y - other.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < 36 && dist > 0) {
      const push = (36 - dist) / 36 * 0.5;
      c.vx += (dx / dist) * push;
      c.vy += (dy / dist) * push;
    }
  });
  ```
- Lines 357–364:
  ```javascript
  const labelText = c.name;
  ctx.font = '10px Inter, system-ui, sans-serif';
  const textWidth = ctx.measureText(labelText).width;
  const badgeWidth = textWidth + 18; // 60px to 80px total width
  const badgeHeight = 18;
  const badgeX = 13;
  const badgeY = 12;
  ```
**Observed Problem**: Each cursor badge extends $13\text{px} \dots (13 + 60\dots 80)\text{px}$ to the right and $12\text{px} \dots 30\text{px}$ downward. A spherical repulsion radius of $36\text{px}$ with a weak linear spring multiplier ($0.5$) is insufficient. Whenever agents on concentric tiers cross orbits, their rectangular badges overlap, flicker, and occlude one another. Additionally, if two cursors ever share identical coordinates ($dist = 0$), no separation is applied, risking an unresolved singularity.

### 1.5 Missing DevicePixelRatio (DPR) Scaling & Viewport Boundary Clipping
In `frontend/src/animations/SwarmCursor.jsx`:
- Lines 47–48 & 88–89:
  ```javascript
  let width = (canvas.width = window.innerWidth);
  let height = (canvas.height = window.innerHeight);
  ```
**Observed Problem**: On Retina and 4K displays with DPR $1.5\times$ to $2\times$, the canvas buffer is stretched, causing text badges and 1.5px SVG cursor strokes to appear fuzzy. Furthermore, moving the cursor to the edges of the screen pushes outer tier cursors ($R = 125\text{px}$) and badges ($80\text{px}$) outside the visible viewport with zero restoring force.

---

## 2. Logic Chain

From the observations above, we deduce the exact mathematical algorithms and physical formulations required to satisfy Milestone 1.

### 2.1 Algorithm 1: Delta-Time Normalized Angular Evolution & Continuous Rotation

#### 2.1.1 Step-by-Step Reasoning
From Observation 1.1, orbital progression must be invariant to display refresh rate ($60\text{Hz}, 120\text{Hz}, 144\text{Hz}, 240\text{Hz}$) and must run continuously on an internal animation clock independent of mouse motion $\vec{v}_m$.

#### 2.1.2 Mathematical Formulation
Let $t_k$ denote `performance.now()` at render frame $k$.
Define the elapsed frame interval:
$$\Delta t_k = t_k - t_{k-1}$$
To protect against background tab throttling (where $\Delta t$ can exceed thousands of milliseconds upon tab reactivation) and micro-stutters:
$$\Delta t_{\text{clamped}} = \min(\max(\Delta t_k, 1.0), 64.0) \text{ ms}$$
Normalize to the reference $60\text{ FPS}$ frame duration ($T_{\text{ref}} = 1000 / 60 \approx 16.6667\text{ ms}$):
$$\Delta t_{\text{norm}} = \frac{\Delta t_{\text{clamped}}}{16.6667}$$
The independent angular phase $\theta_i$ for each agent $i$ evolves as:
$$\theta_i(t + \Delta t) = \left(\theta_i(t) + \omega_i \cdot \Delta t_{\text{norm}}\right) \pmod{2\pi}$$
where $\omega_i$ is the configured angular speed in radians per $60\text{ FPS}$ frame.
The angular velocity in physical real time is:
$$\frac{d\theta_i}{dt} = \frac{\omega_i \cdot (\Delta t / 16.6667)}{\Delta t / 1000} = \omega_i \cdot 60 \text{ rad/s} = \text{constant}$$
**Zero-Speed Invariance**: When the user's mouse is stationary ($\vec{v}_m = \vec{0}$), $\omega_i \neq 0$ is unaffected. The cursors continue orbiting steadily around the mouse coordinates with zero stutter, freeze, or speed jump.

#### 2.1.3 Multi-Tier Concentric Gyro-Stabilization
We assign 8 agents across 3 concentric tiers with alternating directions to produce a gyro-stabilized, non-dizzying orbit:
- **Tier 0 (Inner Core, 2 agents)**:
  - Agent 0 ("Ayush"): $R_0 = 46\text{px}$, $\omega_0 = +0.038\text{ rad/frame}$ (Clockwise, period $\approx 2.75\text{s}$)
  - Agent 1 ("DevOps"): $R_1 = 54\text{px}$, $\omega_1 = -0.040\text{ rad/frame}$ (Counter-Clockwise, period $\approx 2.62\text{s}$)
- **Tier 1 (Middle Ring, 3 agents)**:
  - Agent 2 ("Three.js"): $R_2 = 78\text{px}$, $\omega_2 = +0.028\text{ rad/frame}$ (Clockwise, period $\approx 3.74\text{s}$)
  - Agent 3 ("Django"): $R_3 = 88\text{px}$, $\omega_3 = -0.030\text{ rad/frame}$ (Counter-Clockwise, period $\approx 3.49\text{s}$)
  - Agent 4 ("Reviewer"): $R_4 = 96\text{px}$, $\omega_4 = +0.026\text{ rad/frame}$ (Clockwise, period $\approx 4.03\text{s}$)
- **Tier 2 (Outer Ring, 3 agents)**:
  - Agent 5 ("UI/UX"): $R_5 = 114\text{px}$, $\omega_5 = -0.020\text{ rad/frame}$ (Counter-Clockwise, period $\approx 5.24\text{s}$)
  - Agent 6 ("Architect"): $R_6 = 124\text{px}$, $\omega_6 = +0.018\text{ rad/frame}$ (Clockwise, period $\approx 5.82\text{s}$)
  - Agent 7 ("Docker"): $R_7 = 134\text{px}$, $\omega_7 = -0.016\text{ rad/frame}$ (Counter-Clockwise, period $\approx 6.54\text{s}$)

---

### 2.2 Algorithm 2: Harmonic Breathing Sinusoidal Respiration in Idle State

#### 2.2.1 Step-by-Step Reasoning
From Observation 1.3, static orbits feel robotic. An organic swarm features undulating breathing during stationary hover, which dynamically compresses when moving at speed.

#### 2.2.2 Mathematical Formulation
Let $t_{\text{sec}}$ be cumulative elapsed simulation time:
$$t_{\text{sec}} = \sum \frac{\Delta t_{\text{clamped}}}{1000}$$
Define the idle respiration wave for agent $i$:
$$R_{\text{breath}, i}(t) = A_i \cdot \sin(2\pi f_i t_{\text{sec}} + \phi_i)$$
Parameters:
- Amplitude: $A_i = 3.5\text{px} + 0.6 \times \text{tier}_i$ (ranging from $3.5\text{px}$ in Tier 0 to $4.7\text{px}$ in Tier 2, $\approx 5\%$ modulation).
- Respiration Frequency: $f_i \approx 0.38\text{ Hz}$ (respiration period $\approx 2.63\text{s}$). Differentiated slightly per agent to create traveling waves:
  $$f_i = 0.38 + 0.04 \cdot (-1)^i \cdot \frac{i}{N} \text{ Hz}$$
- Phase Offset:
  $$\phi_i = \left(\frac{2\pi \cdot i}{N}\right) + \text{tier}_i \cdot \frac{\pi}{3}$$
  This distributes phase peaks across the circle, preventing monolithic breathing.

#### 2.2.3 Aerodynamic Speed Contraction
When the mouse moves at speed $S_m = \|\vec{v}_m\|$, the swarm contracts into a streamlined teardrop formation:
$$\sigma(S_m) = \min\left(\frac{S_m}{6.0}, 1.0\right) \in [0, 1]$$
The dynamic radius $R_{\text{eff}, i}$ combines respiration and contraction:
$$R_{\text{eff}, i}(t, S_m) = \left(R_{0, i} + R_{\text{breath}, i}(t) \cdot (1.0 - 0.70 \cdot \sigma(S_m))\right) \cdot (1.0 - 0.30 \cdot \sigma(S_m))$$
**Properties**:
- When $S_m = 0$ (idle): $\sigma = 0 \implies R_{\text{eff}, i} = R_{0, i} + R_{\text{breath}, i}(t)$ (100% harmonic breathing).
- When $S_m \ge 6.0$ (fast sweep): breathing modulation is smoothly suppressed by $70\%$, and radius contracts by $30\%$ for sleek flight aerodynamics.
- Continuity: Because $\sigma(S_m)$ is continuous in $C^0$, radius transitions without discontinuities.

---

### 2.3 Algorithm 3: Smoothed Velocity Inertia Lag Vector

#### 2.3.1 Step-by-Step Reasoning
From Observation 1.2, computing velocity solely inside `pointermove` leaves the velocity frozen on halts, and applying instantaneous lag $-v_m \cdot k$ causes a sudden destination snap when the mouse stops moving.
To eliminate popping, we must:
1. Track frame-to-frame mouse motion continuously in `render()`.
2. Maintain an integrated, exponentially smoothed lag vector $\vec{L}_i(t)$ per agent.

#### 2.3.2 Frame-to-Frame Mouse Tracking
Let $\vec{P}_{\text{target}}$ be the raw coordinate updated by `pointermove`.
In each render frame:
$$\alpha_{\text{mouse}} = 1.0 - (1.0 - 0.32)^{\Delta t_{\text{norm}}}$$
$$\vec{P}_m(t + \Delta t) = \vec{P}_m(t) + \left(\vec{P}_{\text{target}} - \vec{P}_m(t)\right) \cdot \alpha_{\text{mouse}}$$
The true frame-to-frame velocity is:
$$\vec{v}_m(t) = \frac{\vec{P}_m(t) - \vec{P}_m(t - \Delta t)}{\Delta t_{\text{norm}}}$$
When the user halts the physical mouse, $\vec{P}_{\text{target}}$ becomes stationary. Over subsequent frames, $\vec{P}_m(t)$ smoothly converges to $\vec{P}_{\text{target}}$, causing $\vec{v}_m(t) \to \vec{0}$ smoothly without discrete step jumps.

#### 2.3.3 Exponential Inertial Lag Filter
Each agent $i$ maintains state vector $\vec{L}_i = (L_{x, i}, L_{y, i})$.
Define instantaneous desired lag based on mass $m_i = 1.0 + \text{tier}_i \times 0.25$:
$$\vec{L}_{\text{target}, i} = -\vec{v}_m(t) \cdot k_{\text{lag}} \cdot m_i \quad (k_{\text{lag}} = 14.0)$$
Update $\vec{L}_i$ via frame-rate independent exponential smoothing:
$$\alpha_{\text{lag}} = 1.0 - (1.0 - 0.15)^{\Delta t_{\text{norm}}}$$
$$\vec{L}_i(t + \Delta t) = \vec{L}_i(t) + \left(\vec{L}_{\text{target}, i}(t) - \vec{L}_i(t)\right) \cdot \alpha_{\text{lag}}$$
Target destination becomes:
$$\begin{aligned}
x_{\text{dest}, i} &= P_{m, x} + R_{\text{eff}, i} \cdot \cos(\theta_i) + L_{x, i} \\
y_{\text{dest}, i} &= P_{m, y} + R_{\text{eff}, i} \cdot \sin(\theta_i) + L_{y, i}
\end{aligned}$$
When the mouse stops abruptly, $\vec{L}_i(t)$ relaxes smoothly back to $(0, 0)$ over $\approx 250\text{ms}$. Cursors settle into orbit with fluid hydrodynamic deceleration—completely eliminating snapping.

---

### 2.4 Algorithm 4: Non-Linear Quadratic Boids Separation Force

#### 2.4.1 Step-by-Step Reasoning
From Observation 1.4, badges are rectangular ($18\text{px} \times 60\text{px}\dots 80\text{px}$), and linear repulsion under $36\text{px}$ is too weak to prevent collisions. A non-linear quadratic potential with an enlarged safety hull ($D_{\text{min}} = 42\text{px}$) and singularity protection is required.

#### 2.4.2 Mathematical Formulation
For each pair of agents $(i, j)$ with $j \neq i$:
Let displacement vector be $\vec{D}_{ij} = \vec{P}_i - \vec{P}_j$ and distance $d_{ij} = \|\vec{D}_{ij}\|$.
Set minimum separation distance:
$$D_{\text{min}} = 42.0 \text{ px}$$
If $d_{ij} < D_{\text{min}}$ and $d_{ij} > 0.0001$:
Define normalized penetration depth:
$$\eta_{ij} = \frac{D_{\text{min}} - d_{ij}}{D_{\text{min}}} \in (0, 1]$$
Apply a quadratic soft-core repulsion force:
$$F_{\text{mag}}(\eta_{ij}) = k_{\text{repel}} \cdot \left(\eta_{ij} + 0.5 \cdot \eta_{ij}^2\right) \quad \text{where } k_{\text{repel}} = 1.25$$
The unit direction vector is:
$$\hat{u}_{ij} = \frac{\vec{D}_{ij}}{d_{ij}} = \left(\frac{x_i - x_j}{d_{ij}}, \frac{y_i - y_j}{d_{ij}}\right)$$
Total mutual separation acceleration on agent $i$:
$$\vec{F}_{\text{sep}, i} = \sum_{j \neq i, d_{ij} < D_{\text{min}}} F_{\text{mag}}(\eta_{ij}) \cdot \hat{u}_{ij}$$

#### 2.4.3 Singularity Protection
If $d_{ij} \le 0.0001$ (exact overlap):
$$\vec{F}_{\text{sep}, i} = 0.8 \cdot \left(\cos\left(\frac{2\pi i}{N}\right), \sin\left(\frac{2\pi i}{N}\right)\right)$$
This breaks symmetry immediately and prevents `NaN` division.

#### 2.4.4 Complete Physical Integration
Combining spring attraction, damping, and separation:
$$\begin{aligned}
\vec{a}_{\text{spring}, i} &= (\vec{P}_{\text{dest}, i} - \vec{P}_i) \cdot k_{\text{stiffness}, i} \\
k_{\text{damp}, \text{eff}} &= (k_{\text{damping}})^{\Delta t_{\text{norm}}} \quad (k_{\text{damping}} = 0.82) \\
\vec{v}_i(t + \Delta t) &= \left(\vec{v}_i(t) + \vec{a}_{\text{spring}, i} \cdot \Delta t_{\text{norm}}\right) \cdot k_{\text{damp}, \text{eff}} + \vec{F}_{\text{sep}, i} \cdot \Delta t_{\text{norm}} \\
\vec{P}_i(t + \Delta t) &= \vec{P}_i(t) + \vec{v}_i(t + \Delta t) \cdot \Delta t_{\text{norm}}
\end{aligned}$$

---

### 2.5 Complementary Formulations

#### 2.5.1 High-DPI Canvas Scaling
From Observation 1.5, canvas dimensions must scale with `window.devicePixelRatio`:
```javascript
const dpr = Math.min(window.devicePixelRatio || 1, 2);
canvas.width = Math.floor(window.innerWidth * dpr);
canvas.height = Math.floor(window.innerHeight * dpr);
canvas.style.width = `${window.innerWidth}px`;
canvas.style.height = `${window.innerHeight}px`;
ctx.scale(dpr, dpr);
```
Scaling caps at $2.0$ to preserve GPU fill-rate efficiency on $3\times$ mobile/desktop displays.

#### 2.5.2 Soft Viewport Boundary Deflection
To prevent badges from clipping off-screen when the mouse is at screen edges:
Define safety margins:
$$M_{\text{left}} = 20\text{px}, \quad M_{\text{top}} = 20\text{px}, \quad M_{\text{right}} = 95\text{px}, \quad M_{\text{bottom}} = 35\text{px}$$
If destination coordinates cross bounds:
$$\begin{aligned}
\text{if } x_{\text{dest}} < M_{\text{left}}: &\quad x_{\text{dest}} \mathrel{+}= (M_{\text{left}} - x_{\text{dest}}) \cdot 0.35 \\
\text{if } x_{\text{dest}} > W - M_{\text{right}}: &\quad x_{\text{dest}} \mathrel{+}= (W - M_{\text{right}} - x_{\text{dest}}) \cdot 0.35 \\
\text{if } y_{\text{dest}} < M_{\text{top}}: &\quad y_{\text{dest}} \mathrel{+}= (M_{\text{top}} - y_{\text{dest}}) \cdot 0.35 \\
\text{if } y_{\text{dest}} > H - M_{\text{bottom}}: &\quad y_{\text{dest}} \mathrel{+}= (H - M_{\text{bottom}} - y_{\text{dest}}) \cdot 0.35
\end{aligned}$$

#### 2.5.3 Dynamic Aerodynamic Banking Tilt
Instead of discarding computed angles, tilt the cursor into its horizontal velocity:
$$\theta_{\text{target}} = \text{clamp}(v_{x, i} \cdot 0.045, -0.35, +0.35) \text{ rad}$$
$$\theta_{\text{tilt}, i} = \text{lerp}\left(\theta_{\text{tilt}, i}, \theta_{\text{target}}, 1.0 - (1.0 - 0.20)^{\Delta t_{\text{norm}}}\right)$$
Applying `ctx.rotate(c.tilt)` gives responsive, banking flight behavior.

#### 2.5.4 Audio Velocity Modulation Hook
To fulfill the M1 $\leftrightarrow$ M2 contract specified in `PROJECT.md` line 76:
```javascript
if (sound && typeof sound.updateCursorVelocity === 'function') {
  sound.updateCursorVelocity(mouse.speed);
}
```

---

## 3. Caveats & Assumptions

1. **Pointer Device Capability**:
   Mobile touchscreens do not support continuous hover or `pointermove` coordinates without active dragging. The component correctly maintains its guard (`pointer: coarse` or `window.innerWidth < 768`) to bypass initialization on touchscreens.
2. **Accessibility Constraints**:
   Users with `prefers-reduced-motion: reduce` are respected: the component returns immediately without starting the canvas animation loop.
3. **Background Tab Throttling**:
   Browsers throttle `requestAnimationFrame` when tabs lose focus. Clamping $\Delta t$ to $[1.0, 64.0]\text{ms}$ protects all differential equations from explosive integration spikes when switching back to the tab.
4. **Implementation Scope Discipline**:
   As an exploration agent, this document provides the analytical and mathematical specification. A complete proposed drop-in replacement file has been authored and saved to:
   `c:\Users\Ayush\OneDrive\Documents\swarm\.agents\teamwork\explorer_m1_orbital_physics\proposed_SwarmCursor.jsx`.

---

## 4. Conclusion

1. **Continuous Rotation (R1)** is guaranteed by advancing $\theta_i$ through an independent, delta-time normalized clock ($\Delta t_{\text{norm}} = \Delta t_{\text{clamped}} / 16.6667$). Orbit speed is mathematically invariant to monitor refresh rate ($60\text{Hz} - 240\text{Hz}$) and remains active when the mouse is stationary ($\vec{v}_m = 0$).
2. **Harmonic Respiration** gives the swarm an organic, lifelike presence during idle hover via $R_{\text{breath}, i}(t) = A_i \sin(2\pi f_i t + \phi_i)$, which smoothly attenuates during high-speed mouse sweeps.
3. **Smoothed Velocity Inertia Lag** eliminates sudden destination snapping on halts by integrating an exponentially smoothed lag vector $\vec{L}_i(t)$ with continuous frame-to-frame velocity derivation.
4. **Boids Mutual Separation** prevents badge overlap and visual collisions through a quadratic soft-core potential over an expanded $42\text{px}$ hull, complete with singularity protection.
5. **High-DPI Scaling & Soft Margin Deflection** ensure crisp Retina graphics and prevent badges from clipping at viewport edges.

---

## 5. Verification Method

To independently verify this specification and the proposed implementation:

### 5.1 Static Verification & Code Review
Inspect `frontend/src/animations/SwarmCursor.jsx` against `proposed_SwarmCursor.jsx` in this folder:
- Verify delta-time normalization in `render`:
  `const dtNorm = dt / 16.6667; c.orbitAngle = (c.orbitAngle + c.speed * dtNorm) % (Math.PI * 2);`
- Verify persistent lag state integration:
  `c.lagX += (targetLagX - c.lagX) * lagAlpha;`
- Verify quadratic separation:
  `const push = (penetration + 0.5 * penetration * penetration) * 1.25;`
- Verify High-DPI scaling:
  `canvas.width = Math.floor(width * dpr); ctx.scale(dpr, dpr);`

### 5.2 Dynamic Browser Behavioral Verification
1. **Stationary Rotation Verification**:
   - Move cursor to screen center and hold completely still for 30 seconds.
   - *Pass criteria*: All 8 cursors continue rotating smoothly around the cursor center; none freeze or stop.
2. **Idle Breathing Verification**:
   - Observe orbital radii while stationary.
   - *Pass criteria*: The orbit expands and contracts gently with a period of $\approx 2.6$ seconds, creating an undulating organic wave.
3. **Sudden Halt Snap Verification**:
   - Sweep mouse rapidly across the screen and abruptly halt.
   - *Pass criteria*: Cursors trail behind the cursor during motion, then decelerate smoothly and glide back into orbit with zero popping or snapping.
4. **Collision & Badge Separation Verification**:
   - Observe cursors as inner and middle orbits cross.
   - *Pass criteria*: When two cursors approach within $42\text{px}$, the quadratic separation force smoothly deflects them, preventing badge text overlapping.
5. **Screen Margin Deflection Verification**:
   - Move mouse cursor to $(0, 0)$ (top-left) and $(W, H)$ (bottom-right).
   - *Pass criteria*: Restoring forces keep cursors and badges fully visible within the viewport bounds.
6. **High-Refresh Monitor Consistency**:
   - Test on 60 Hz and 120/144 Hz displays.
   - *Pass criteria*: Angular orbit revolutions take identical wall-clock duration ($\approx 2.7\text{s}$ for inner tier) across all refresh rates.

### 5.3 Invalidation Conditions
This specification is invalidated if:
- Orbital rotation stops when mouse speed is 0.
- Cursors jump discontinuously upon abrupt mouse halting.
- Name badges overlap and obscure text during orbit intersections.
- Canvas text appears pixelated or blurred on Retina/High-DPI displays.
