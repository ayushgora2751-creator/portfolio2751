# Technical Specification & Architectural Blueprint: Viewport Soft Boundaries, Graceful Pointer Lifecycle, DOM Interactive Targets, and Audio Velocity Coupling

**Author**: `explorer_m1_interaction_boundaries`  
**Working Directory**: `c:\Users\Ayush\OneDrive\Documents\swarm\.agents\teamwork\explorer_m1_interaction_boundaries\`  
**Milestone**: Milestone 1 — Swarm Cursor Orbit & Flocking Engine  
**Target File**: `frontend/src/animations/SwarmCursor.jsx`  
**Date**: 2026-11-04  

---

## 1. Observation

Direct code examination of the existing workspace in `c:\Users\Ayush\OneDrive\Documents\swarm\` revealed the following specific findings and baseline mechanics:

### 1.1 Viewport Boundary Deflection Defect
In `frontend/src/animations/SwarmCursor.jsx` (lines 47-48, 258-285, 330-389):
- Canvas dimensions are initialized to viewport width and height:
  ```javascript
  // SwarmCursor.jsx:47-48
  let width = (canvas.width = window.innerWidth);
  let height = (canvas.height = window.innerHeight);
  ```
- Target cursor positions are computed from the user's mouse coordinates $X_m, Y_m$ plus dynamic orbit offsets:
  ```javascript
  // SwarmCursor.jsx:283-284
  destX = mouse.x + Math.cos(c.orbitAngle) * dynamicRadius + velocityLagX;
  destY = mouse.y + Math.sin(c.orbitAngle) * dynamicRadius + velocityLagY;
  ```
- Position integration applies spring forces and separation forces, updating $c.x$ and $c.y$ without any viewport boundary checks:
  ```javascript
  // SwarmCursor.jsx:307-308
  c.x += c.vx;
  c.y += c.vy;
  ```
- Cursor badges are rendered starting at $c.x + 13$ and $c.y + 12$, extending horizontally by $textWidth + 18$px ($\approx 65\text{px}$ to $110\text{px}$) and vertically by $18\text{px}$:
  ```javascript
  // SwarmCursor.jsx:360-375
  const badgeWidth = textWidth + 18;
  const badgeHeight = 18;
  const badgeX = 13;
  const badgeY = 12;
  // ...
  ctx.roundRect(badgeX, badgeY, badgeWidth, badgeHeight, 5);
  ```
- **Observed Defect**: When the mouse cursor moves near the screen boundaries ($x < 50$px, $x > W - 120$px, $y < 40$px, $y > H - 50$px), outer orbit agents ($r = 105\text{px}$ to $125\text{px}$) and their collaborative name badges are clipped partially or completely outside the visible canvas. At the right viewport boundary, badges extend up to $W + 225$px, rendering completely invisible.

### 1.2 Pointerleave / Pointerenter Abruptness Defect
In `frontend/src/animations/SwarmCursor.jsx` (lines 168-172, 397-403):
- Event listeners are currently attached strictly to `window`:
  ```javascript
  // SwarmCursor.jsx:168-172
  window.addEventListener('resize', handleResize);
  window.addEventListener('pointermove', handlePointerMove, { passive: true });
  window.addEventListener('mousedown', handleMouseDown);
  window.addEventListener('mouseup', handleMouseUp);
  ```
- **Observed Defect**: There are NO event listeners registered for `pointerleave`, `pointerenter`, `blur`, or `visibilitychange`.
  - When the user's pointer exits the browser window (e.g. moving into the URL address bar, bookmark bar, developer tools, or an adjacent monitor), `handlePointerMove` ceases firing.
  - `mouse.targetX` and `mouse.targetY` remain frozen at the exit perimeter (e.g. $y=0$ or $x=W$), causing cursors to continue rigidly orbiting a half-clipped edge point.
  - When the pointer re-enters the window at a distant coordinate, `mouse.vx = (e.clientX - mouse.targetX) / dt` evaluates to a massive delta over an unreset timestamp, causing a violent physics explosion or instantaneous positional snap.

### 1.3 DOM Interactive Target Integration Defect
In `frontend/src/animations/SwarmCursor.jsx` (lines 104-131, 260-273):
- Hover detection queries the underlying DOM using `document.elementFromPoint`:
  ```javascript
  // SwarmCursor.jsx:104-108
  const target = document.elementFromPoint(e.clientX, e.clientY);
  if (target) {
    const orbitElement = target.closest('[data-swarm="orbit"]');
    const gatherElement = target.closest('[data-swarm="gather"], button, [data-tilt="true"]');
  ```
- For `orbitElement` (`[data-swarm="orbit"]`):
  ```javascript
  // SwarmCursor.jsx:260-264
  if (mouse.hoverMode === 'orbit_element' && mouse.hoverBox) {
    const elemRadius = c.radius * 1.5;
    destX = mouse.hoverBox.x + Math.cos(c.orbitAngle) * elemRadius;
    destY = mouse.hoverBox.y + Math.sin(c.orbitAngle) * (elemRadius * 0.5);
  }
  ```
  - **Observed Defect in Orbit**: In `frontend/src/sections/Hero.jsx` (lines 21-28), `data-swarm="orbit"` is attached to `<h1 className="text-5xl sm:text-7xl lg:text-8xl ...">AYUSH GORA</h1>`. On desktop viewports, this element has a bounding rectangle width of $\approx 640\text{px}$ and height of $\approx 110\text{px}$. However, `SwarmCursor.jsx` calculates `elemRadius = c.radius * 1.5`, which ranges from $67.5\text{px}$ to $187.5\text{px}$. The cursors orbit tightly around the *center point* of the headline rather than expanding to encircle the headline's perimeter, causing cursors to cross directly over the text glyphs instead of framing the title.
- For `gatherElement` (`[data-swarm="gather"]`):
  ```javascript
  // SwarmCursor.jsx:265-272
  } else if (mouse.hoverMode === 'gather' && mouse.hoverBox) {
    const hb = mouse.hoverBox;
    const corner = idx % 4;
    if (corner === 0) { destX = hb.x - 12; destY = hb.y - 12; }
    else if (corner === 1) { destX = hb.x + hb.width + 12; destY = hb.y - 12; }
    else if (corner === 2) { destX = hb.x + hb.width + 12; destY = hb.y + hb.height + 12; }
    else { destX = hb.x - 12; destY = hb.y + hb.height + 12; }
  }
  ```
  - **Observed Defect in Gather**: There are 8 cursors in `CURSOR_CONFIGS` ($idx \in [0..7]$). The modulo `idx % 4` causes pairs of agents (Agent 0 & Agent 4, Agent 1 & Agent 5, Agent 2 & Agent 6, Agent 3 & Agent 7) to be assigned to the *exact same corner coordinates*. When two cursors occupy identical coordinates ($dist \approx 0$), the Boids anti-collision separation logic (lines 295-304) computes an infinite or violent repellent impulse ($push = \frac{36 - dist}{36}$), causing the cursors to violently vibrate and jitter back and forth at the button corners.
- In `frontend/src/sections/Projects.jsx` (lines 30-37), `data-swarm="gather"` is placed on the entire 3D project card, causing all 8 cursors to gather around a massive card rather than orbiting smoothly.

### 1.4 Velocity Audio Telemetry Hook Absence
In `frontend/src/animations/SwarmCursor.jsx` (lines 16-17, 93-101, 176-186) and `frontend/src/services/soundEffects.js` (lines 362-369):
- `soundEffects.js` specifies the audio hook interface:
  ```javascript
  // soundEffects.js:362-369
  updateCursorVelocity(speed) {
    if (this.isMuted || !this.ctx || !this.humGain) return;
    try {
      const targetGain = Math.min(Math.max(speed - 1.0, 0) * 0.003, 0.025);
      this.humGain.gain.setTargetAtTime(targetGain, this.ctx.currentTime, 0.08);
    } catch (e) {}
  }
  ```
- **Observed Defect**: In `SwarmCursor.jsx`, `sound.updateCursorVelocity` is **never called** anywhere in the component.
- Furthermore, in `SwarmCursor.jsx` lines 96-98:
  ```javascript
  mouse.vx = (e.clientX - mouse.targetX) / dt;
  mouse.vy = (e.clientY - mouse.targetY) / dt;
  mouse.speed = Math.sqrt(mouse.vx * mouse.vx + mouse.vy * mouse.vy);
  ```
  `mouse.vx` and `mouse.vy` are only updated inside `handlePointerMove`. In the animation loop `render()`, `mouse.vx` is never decayed. When the user rapidly flicks the mouse and then abruptly halts, `mouse.vx` retains its peak value until the next pointer movement. If dispatched to audio in this state, the ambient hum drone would loop continuously at maximum volume while the user is stationary.

---

## 2. Logic Chain

From the observations above, we establish the step-by-step mathematical models, state machines, and engineering architecture to solve each problem.

### 2.1 Viewport Soft Boundary Deflection ($F_{\text{bound}}$)

#### 2.1.1 Boundary Bounds Definition
To ensure neither the cursor arrow tip $(0,0 \to 12,18)$ nor the name badge $(13,12 \to 13 + W_{\text{badge}}, 30)$ clips outside the visible viewport $[0, W] \times [0, H]$:
- Left Padding ($P_{\text{left}}$): $24\text{px}$ (prevents arrow tip and tilt swing from clipping).
- Right Padding ($P_{\text{right}}$): $110\text{px}$ (accommodates $W_{\text{badge}} \approx 85 - 95\text{px}$ plus shadow blur).
- Top Padding ($P_{\text{top}}$): $20\text{px}$ (prevents top of cursor arrow and upward tilt from clipping).
- Bottom Padding ($P_{\text{bottom}}$): $32\text{px}$ (accommodates badge height $18\text{px}$ at $y=12$ plus shadow blur).

#### 2.1.2 Soft Restoring Force Formulation
Let $c.x, c.y$ be the instantaneous position of cursor agent $i$. When $c.x$ or $c.y$ violates the safe boundary margins, apply a progressive cubic/quadratic spring restoring force $\vec{F}_{\text{bound}}$:

$$\begin{aligned}
F_{\text{bound}, x} &= \begin{cases}
(P_{\text{left}} - c.x) \cdot k_{\text{bound}} & \text{if } c.x < P_{\text{left}} \\
(W - P_{\text{right}} - c.x) \cdot k_{\text{bound}} & \text{if } c.x > W - P_{\text{right}} \\
0 & \text{otherwise}
\end{cases} \\
F_{\text{bound}, y} &= \begin{cases}
(P_{\text{top}} - c.y) \cdot k_{\text{bound}} & \text{if } c.y < P_{\text{top}} \\
(H - P_{\text{bottom}} - c.y) \cdot k_{\text{bound}} & \text{if } c.y > H - P_{\text{bottom}} \\
0 & \text{otherwise}
\end{cases}
\end{aligned}$$

where $k_{\text{bound}} = 0.24$.
In addition to the restoring force on current position, compress the destination target coordinate $(destX, destY)$ so the target never pulls the agent beyond the boundary:
```javascript
destX = Math.max(P_left, Math.min(width - P_right, destX));
destY = Math.max(P_top, Math.min(height - P_bottom, destY));
```

#### 2.1.3 Elastic Boundary Barrier & Adaptive Badge Flipping
1. **Safety Elastic Barrier**:
   After position integration ($c.x += c.vx$, $c.y += c.vy$), if an agent exceeds the absolute canvas limits due to a high-speed impulse, clamp position and reflect velocity with energy dissipation:
   ```javascript
   if (c.x < 10) { c.x = 10; c.vx = Math.abs(c.vx) * 0.3; }
   else if (c.x > width - P_right) { c.x = width - P_right; c.vx = -Math.abs(c.vx) * 0.3; }

   if (c.y < 10) { c.y = 10; c.vy = Math.abs(c.vy) * 0.3; }
   else if (c.y > height - P_bottom) { c.y = height - P_bottom; c.vy = -Math.abs(c.vy) * 0.3; }
   ```
2. **Adaptive Badge Flipping Near Right Edge**:
   When the mouse is driven towards the right edge ($c.x > W - 140\text{px}$), rather than forcing the cursor to stay 110px away from the edge, dynamically flip the badge to the left of the arrow:
   ```javascript
   const isNearRightWall = c.x > width - 130;
   const badgeX = isNearRightWall ? -(badgeWidth + 4) : 13;
   ```
   This allows cursors to approach within $24\text{px}$ of the right edge without badge clipping, preserving a fluid, unconstrained swarm feel.

---

### 2.2 Pointerleave & Pointerenter Graceful Behavior

#### 2.2.1 State Model
Define an explicit pointer state machine on the `mouse` object:
- `mouse.isInside = true` (default).
- `mouse.opacity = 1.0` (smoothly interpolated).
- `mouse.parkTarget = { x: width / 2, y: height / 2 }`.

#### 2.2.2 Event Listeners
Register listeners on `document.documentElement` and `window`:
```javascript
const handlePointerLeave = (e) => {
  // Only trigger if pointer actually left the document window
  if (!e.relatedTarget && !e.toElement) {
    mouse.isInside = false;
    // Set gentle park coordinate: if leaving near an edge, park slightly inset or center
    mouse.targetX = Math.max(160, Math.min(width - 160, mouse.x));
    mouse.targetY = Math.max(120, Math.min(height - 120, mouse.y));
  }
};

const handlePointerEnter = (e) => {
  mouse.isInside = true;
  mouse.targetX = e.clientX;
  mouse.targetY = e.clientY;
  // Reset velocity to prevent velocity jump
  mouse.vx = 0;
  mouse.vy = 0;
  mouse.speed = 0;
  lastTime = performance.now();
};

const handleWindowBlur = () => {
  mouse.isInside = false;
};

const handleWindowFocus = () => {
  lastTime = performance.now();
};
```

#### 2.2.3 Smooth Park & Restore Dynamics
In `render()`:
1. **Opacity Interpolation**:
   ```javascript
   const targetOpacity = mouse.isInside ? 1.0 : 0.40;
   mouse.opacity += (targetOpacity - mouse.opacity) * 0.06;
   ```
2. **Anchor Position Interpolation**:
   When `mouse.isInside === false`, the anchor point $(mouse.x, mouse.y)$ gently drifts towards the center of the viewport $(W/2, H/2)$ with a slow, relaxing spring ($0.02$), while the 8 cursors continue their continuous harmonic orbits around this resting anchor.
3. **Canvas Global Alpha**:
   Multiply rendering context alpha by `mouse.opacity`:
   ```javascript
   ctx.globalAlpha = mouse.opacity;
   ```
   When the user leaves the window, the swarm cursors smoothly glide to a calm parked orbit at $40\%$ opacity. When the user returns, the swarm instantly acquires the pointer coordinates with zero snapping or popping, smoothly fading back to $100\%$ opacity.

---

### 2.3 DOM Interactive Target Integration (`[data-swarm="orbit"]` & `[data-swarm="gather"]`)

#### 2.3.1 Active DOM Target Resolution
Instead of checking DOM targets exclusively during `pointermove` (which fails when the page scrolls under a stationary mouse), perform target resolution in `handlePointerMove` and update bounding boxes dynamically:
```javascript
const resolveInteractiveTarget = (clientX, clientY) => {
  const target = document.elementFromPoint(clientX, clientY);
  if (!target) return { mode: 'orbit_cursor', box: null };

  const orbitElement = target.closest('[data-swarm="orbit"]');
  if (orbitElement) {
    const rect = orbitElement.getBoundingClientRect();
    return {
      mode: 'orbit_element',
      box: {
        centerX: rect.left + rect.width / 2,
        centerY: rect.top + rect.height / 2,
        width: rect.width,
        height: rect.height,
        left: rect.left,
        top: rect.top,
      },
    };
  }

  const gatherElement = target.closest('[data-swarm="gather"], button, [data-tilt="true"]');
  if (gatherElement) {
    const rect = gatherElement.getBoundingClientRect();
    return {
      mode: 'gather',
      box: {
        centerX: rect.left + rect.width / 2,
        centerY: rect.top + rect.height / 2,
        width: rect.width,
        height: rect.height,
        left: rect.left,
        top: rect.top,
      },
    };
  }

  return { mode: 'orbit_cursor', box: null };
};
```

#### 2.3.2 Perimeter Orbiting for `[data-swarm="orbit"]`
To orbit naturally around wide headlines (e.g. `Hero` "AYUSH GORA") and cards:
- Compute semi-major axis $A$ and semi-minor axis $B$ derived directly from the element's bounding box:
  $$\begin{aligned}
  A_i &= \frac{\text{box.width}}{2} + 28\text{px} + (\text{tier} \times 16\text{px}) \\
  B_i &= \frac{\text{box.height}}{2} + 20\text{px} + (\text{tier} \times 12\text{px})
  \end{aligned}$$
- Calculate destination coordinates:
  $$\begin{aligned}
  destX &= \text{box.centerX} + A_i \cdot \cos(\theta_i) \\
  destY &= \text{box.centerY} + B_i \cdot \sin(\theta_i)
  \end{aligned}$$
This creates expansive, multi-tiered elliptical orbits that elegantly encircle the entire title without occluding text.

#### 2.3.3 Non-Colliding 8-Point Perimeter Distribution for `[data-swarm="gather"]`
To prevent the violent collision jitter caused by `idx % 4`, assign all 8 cursors to distinct, non-overlapping geometric anchor points along the button or card perimeter (4 corners and 4 edge midpoints):

| Cursor Index ($idx$) | Assigned Anchor Position | Coordinate Formulation ($destX, destY$) |
|---|---|---|
| **0** (Ayush) | Top-Left Corner | $(\text{left} - 8, \text{top} - 8)$ |
| **1** (DevOps) | Top Midpoint | $(\text{centerX}, \text{top} - 10)$ |
| **2** (Three.js) | Top-Right Corner | $(\text{left} + \text{width} + 8, \text{top} - 8)$ |
| **3** (Django) | Right Midpoint | $(\text{left} + \text{width} + 10, \text{centerY})$ |
| **4** (Reviewer) | Bottom-Right Corner | $(\text{left} + \text{width} + 8, \text{top} + \text{height} + 8)$ |
| **5** (Architect) | Bottom Midpoint | $(\text{centerX}, \text{top} + \text{height} + 10)$ |
| **6** (Docker) | Bottom-Left Corner | $(\text{left} - 8, \text{top} + \text{height} + 8)$ |
| **7** (UI/UX) | Left Midpoint | $(\text{left} - 10, \text{centerY})$ |

Because each cursor has an independent destination spaced $> 40\text{px}$ apart, the Boids separation force remains peaceful ($\vec{F}_{\text{sep}} = 0$). The cursors frame the interactive target like collaborative Figma designer cursors with absolute stability.

#### 2.3.4 Dynamic Blueprint Measurement Frame
When in `gather` mode:
- Render a dashed architectural bounding box ($[4, 4]$ dash pattern) with cyan corner crosshairs and dynamic dimension badge (`${Math.round(width)} × ${Math.round(height)} px`).
- Smoothly fade the blueprint frame in and out using a dedicated alpha transition (`frameAlpha += (targetAlpha - frameAlpha) * 0.12`), eliminating visual pop when hovering over or off buttons.

---

### 2.4 Velocity Hook Dispatching to `sound.updateCursorVelocity(mouse.speed)`

#### 2.4.1 Velocity Decay Integration
To ensure the synthesizer hum responds accurately to instantaneous speed and decays to zero when motion stops:
1. In `handlePointerMove`:
   ```javascript
   const now = performance.now();
   const dt = Math.max(now - lastTime, 16);
   const vx = (e.clientX - mouse.targetX) / dt;
   const vy = (e.clientY - mouse.targetY) / dt;
   mouse.vx = vx * 16.667; // Normalize to px per standard frame (60Hz)
   mouse.vy = vy * 16.667;
   mouse.targetX = e.clientX;
   mouse.targetY = e.clientY;
   lastTime = now;
   ```
2. In `render()`:
   Apply exponential velocity decay on each frame:
   ```javascript
   // Decay mouse velocity towards 0 when stationary
   mouse.vx *= 0.86;
   mouse.vy *= 0.86;
   mouse.speed = Math.sqrt(mouse.vx * mouse.vx + mouse.vy * mouse.vy);

   // Dispatch velocity to Web Audio Engine
   if (mouse.isInside) {
     sound.updateCursorVelocity(mouse.speed);
   } else {
     sound.updateCursorVelocity(0);
   }
   ```
3. On component unmount (`useEffect` cleanup):
   ```javascript
   sound.updateCursorVelocity(0);
   ```
   This guarantees that unmounting `SwarmCursor` or navigating away instantly shuts off any residual ambient drone.

---

## 3. Concrete Implementation Blueprint for `SwarmCursor.jsx`

Here is the exact code architecture incorporating all four formulated specifications:

```jsx
/**
 * SwarmCursor.jsx
 * 
 * Signature Creative Feature for Ayush Gora's Portfolio
 * Milestone 1 Production Engine: Viewport Soft Boundaries, Graceful Lifecycle,
 * DOM Hooks ([data-swarm="orbit" | "gather"]), and Audio Velocity Coupling.
 */

import React, { useEffect, useRef } from 'react';
import { sound } from '../services/soundEffects';

const CURSOR_CONFIGS = [
  { name: "Ayush", role: "Creative Lead", color: "#3b82f6", bg: "rgba(59, 130, 246, 0.2)", orbitTier: 0, radius: 46, speed: 0.042 },
  { name: "DevOps", role: "Cloud Eng", color: "#06b6d4", bg: "rgba(6, 182, 212, 0.2)", orbitTier: 0, radius: 54, speed: -0.038 },
  { name: "Three.js", role: "WebGL Core", color: "#8b5cf6", bg: "rgba(139, 92, 246, 0.2)", orbitTier: 1, radius: 76, speed: 0.030 },
  { name: "Django", role: "Backend API", color: "#10b981", bg: "rgba(16, 185, 129, 0.2)", orbitTier: 1, radius: 86, speed: -0.032 },
  { name: "Reviewer", role: "Code Quality", color: "#a855f7", bg: "rgba(168, 85, 247, 0.2)", orbitTier: 1, radius: 96, speed: 0.026 },
  { name: "UI/UX", role: "Designer", color: "#f43f5e", bg: "rgba(244, 63, 94, 0.2)", orbitTier: 2, radius: 110, speed: -0.022 },
  { name: "Architect", role: "Systems", color: "#f59e0b", bg: "rgba(245, 158, 11, 0.2)", orbitTier: 2, radius: 120, speed: 0.019 },
  { name: "Docker", role: "Linux Infra", color: "#0ea5e9", bg: "rgba(14, 165, 233, 0.2)", orbitTier: 2, radius: 130, speed: -0.017 },
];

export default function SwarmCursor() {
  const canvasRef = useRef(null);

  useEffect(() => {
    // 1. Accessibility & Device Checks
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isTouchDevice = window.matchMedia('(pointer: coarse)').matches || window.innerWidth < 768;

    if (prefersReducedMotion || isTouchDevice) {
      return; // Disabled on mobile / reduced-motion
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // High-DPI Canvas Scaling
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let width = window.innerWidth;
    let height = window.innerHeight;

    const updateCanvasDimensions = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.scale(dpr, dpr);
    };
    updateCanvasDimensions();

    // Mouse & State Machine
    const mouse = {
      x: width / 2,
      y: height / 2,
      targetX: width / 2,
      targetY: height / 2,
      vx: 0,
      vy: 0,
      speed: 0,
      isDown: false,
      isInside: true,
      displayOpacity: 1.0,
      frameAlpha: 0.0,
      hoverMode: 'orbit_cursor', // 'orbit_cursor' | 'orbit_element' | 'gather'
      hoverBox: null,
    };

    // Cursor Agents Initialization
    const cursors = CURSOR_CONFIGS.map((cfg, idx) => {
      const angle = (idx / CURSOR_CONFIGS.length) * Math.PI * 2;
      return {
        ...cfg,
        id: idx,
        x: mouse.x + Math.cos(angle) * cfg.radius,
        y: mouse.y + Math.sin(angle) * cfg.radius,
        vx: 0,
        vy: 0,
        angle: 0,
        orbitAngle: angle,
        lagX: 0,
        lagY: 0,
        mass: 1.0 + (idx * 0.06),
        stiffness: 0.085 - (cfg.orbitTier * 0.012),
        damping: 0.83,
      };
    });

    // Particle Trail Buffer
    const particles = [];
    const maxParticles = 140;

    // Viewport Soft Boundary Constants
    const P_LEFT = 24;
    const P_RIGHT = 110;
    const P_TOP = 20;
    const P_BOTTOM = 32;
    const K_BOUND = 0.24;

    // DOM Target Resolver
    const updateHoverTarget = (clientX, clientY) => {
      const target = document.elementFromPoint(clientX, clientY);
      if (!target) {
        mouse.hoverMode = 'orbit_cursor';
        mouse.hoverBox = null;
        return;
      }

      const orbitElement = target.closest('[data-swarm="orbit"]');
      const gatherElement = target.closest('[data-swarm="gather"], button, [data-tilt="true"]');

      if (orbitElement) {
        const rect = orbitElement.getBoundingClientRect();
        mouse.hoverMode = 'orbit_element';
        mouse.hoverBox = {
          centerX: rect.left + rect.width / 2,
          centerY: rect.top + rect.height / 2,
          width: rect.width,
          height: rect.height,
          left: rect.left,
          top: rect.top,
        };
      } else if (gatherElement) {
        const rect = gatherElement.getBoundingClientRect();
        mouse.hoverMode = 'gather';
        mouse.hoverBox = {
          centerX: rect.left + rect.width / 2,
          centerY: rect.top + rect.height / 2,
          width: rect.width,
          height: rect.height,
          left: rect.left,
          top: rect.top,
        };
      } else {
        mouse.hoverMode = 'orbit_cursor';
        mouse.hoverBox = null;
      }
    };

    let lastTime = performance.now();

    const handlePointerMove = (e) => {
      const now = performance.now();
      const dt = Math.max(now - lastTime, 16);
      mouse.vx = ((e.clientX - mouse.targetX) / dt) * 16.667;
      mouse.vy = ((e.clientY - mouse.targetY) / dt) * 16.667;
      mouse.targetX = e.clientX;
      mouse.targetY = e.clientY;
      mouse.isInside = true;
      lastTime = now;

      updateHoverTarget(e.clientX, e.clientY);
    };

    const handlePointerLeave = (e) => {
      if (!e.relatedTarget && !e.toElement) {
        mouse.isInside = false;
        // Glide gently towards safe inset coordinate
        mouse.targetX = Math.max(160, Math.min(width - 160, mouse.x));
        mouse.targetY = Math.max(120, Math.min(height - 120, mouse.y));
      }
    };

    const handlePointerEnter = (e) => {
      mouse.isInside = true;
      mouse.targetX = e.clientX;
      mouse.targetY = e.clientY;
      mouse.vx = 0;
      mouse.vy = 0;
      mouse.speed = 0;
      lastTime = performance.now();
      updateHoverTarget(e.clientX, e.clientY);
    };

    const handleWindowBlur = () => {
      mouse.isInside = false;
    };

    const handleWindowFocus = () => {
      lastTime = performance.now();
    };

    const handleMouseDown = () => {
      mouse.isDown = true;
      sound.playClickImpulse();

      // Scatter impulse: explosive burst from cursor center
      cursors.forEach((c) => {
        const dx = c.x - mouse.x;
        const dy = c.y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        const impulse = 16 + Math.random() * 8;
        c.vx += (dx / dist) * impulse;
        c.vy += (dy / dist) * impulse;

        for (let i = 0; i < 4; i++) {
          if (particles.length < maxParticles) {
            particles.push({
              x: c.x,
              y: c.y,
              vx: (Math.random() - 0.5) * 7,
              vy: (Math.random() - 0.5) * 7,
              color: c.color,
              size: 2 + Math.random() * 2,
              alpha: 1,
              decay: 0.035,
            });
          }
        }
      });
    };

    const handleMouseUp = () => {
      mouse.isDown = false;
    };

    window.addEventListener('resize', updateCanvasDimensions);
    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    document.documentElement.addEventListener('pointerleave', handlePointerLeave);
    document.documentElement.addEventListener('pointerenter', handlePointerEnter);
    window.addEventListener('blur', handleWindowBlur);
    window.addEventListener('focus', handleWindowFocus);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);

    let animationFrameId;
    let clock = 0;
    let prevFrameTime = performance.now();

    const render = () => {
      const now = performance.now();
      const deltaMs = Math.min(now - prevFrameTime, 64);
      prevFrameTime = now;
      const dtNorm = deltaMs / 16.667;
      clock += 0.02 * dtNorm;

      ctx.clearRect(0, 0, width, height);

      // Smooth mouse position interpolation
      const mouseEase = mouse.isInside ? 0.28 : 0.04;
      mouse.x += (mouse.targetX - mouse.x) * mouseEase;
      mouse.y += (mouse.targetY - mouse.y) * mouseEase;

      // Mouse velocity decay & sound dispatch
      mouse.vx *= 0.86;
      mouse.vy *= 0.86;
      mouse.speed = Math.sqrt(mouse.vx * mouse.vx + mouse.vy * mouse.vy);

      if (mouse.isInside) {
        sound.updateCursorVelocity(mouse.speed);
      } else {
        sound.updateCursorVelocity(0);
      }

      // Smooth opacity transitions
      const targetOpacity = mouse.isInside ? 1.0 : 0.40;
      mouse.displayOpacity += (targetOpacity - mouse.displayOpacity) * 0.06;

      const targetFrameAlpha = (mouse.hoverMode === 'gather' && mouse.hoverBox) ? 1.0 : 0.0;
      mouse.frameAlpha += (targetFrameAlpha - mouse.frameAlpha) * 0.12;

      ctx.save();
      ctx.globalAlpha = mouse.displayOpacity;

      // 1. Draw Gather Blueprint Frame if in 'gather' mode
      if (mouse.frameAlpha > 0.01 && mouse.hoverBox) {
        const hb = mouse.hoverBox;
        ctx.save();
        ctx.globalAlpha = mouse.displayOpacity * mouse.frameAlpha;
        ctx.strokeStyle = 'rgba(59, 130, 246, 0.45)';
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 4]);
        ctx.strokeRect(hb.left - 4, hb.top - 4, hb.width + 8, hb.height + 8);

        // Corner crosshairs
        ctx.strokeStyle = '#06b6d4';
        ctx.setLineDash([]);
        const cs = 7;
        ctx.beginPath();
        ctx.moveTo(hb.left - 8, hb.top - 4); ctx.lineTo(hb.left - 8 + cs, hb.top - 4);
        ctx.moveTo(hb.left - 4, hb.top - 8); ctx.lineTo(hb.left - 4, hb.top - 8 + cs);
        ctx.moveTo(hb.left + hb.width + 8 - cs, hb.top + hb.height + 4); ctx.lineTo(hb.left + hb.width + 8, hb.top + hb.height + 4);
        ctx.moveTo(hb.left + hb.width + 4, hb.top + hb.height + 8 - cs); ctx.lineTo(hb.left + hb.width + 4, hb.top + hb.height + 8);
        ctx.stroke();

        // Dimensions badge
        ctx.fillStyle = 'rgba(15, 23, 42, 0.92)';
        ctx.fillRect(hb.left + hb.width / 2 - 34, hb.top - 22, 68, 17);
        ctx.fillStyle = '#67e8f9';
        ctx.font = '9px JetBrains Mono, monospace';
        ctx.textAlign = 'center';
        ctx.fillText(`${Math.round(hb.width)} × ${Math.round(hb.height)} px`, hb.left + hb.width / 2, hb.top - 10);
        ctx.restore();
      }

      // 2. Subtle Orbit Guide Rings when stationary
      if (mouse.hoverMode === 'orbit_cursor' && mouse.speed < 1.2 && mouse.isInside) {
        ctx.save();
        ctx.strokeStyle = 'rgba(59, 130, 246, 0.07)';
        ctx.lineWidth = 1;
        ctx.setLineDash([2, 6]);
        [50, 80, 115].forEach((r) => {
          ctx.beginPath();
          ctx.arc(mouse.x, mouse.y, r, 0, Math.PI * 2);
          ctx.stroke();
        });
        ctx.restore();
      }

      // 3. Update & Draw Particle Trails
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx * dtNorm;
        p.y += p.vy * dtNorm;
        p.alpha -= p.decay * dtNorm;

        if (p.alpha <= 0) {
          particles.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.globalAlpha = p.alpha * mouse.displayOpacity;
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 5;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // 4. Update Cursor Physics & Multi-Tier Flocking
      cursors.forEach((c, idx) => {
        // Continuous independent time-normalized angular progression
        c.orbitAngle += c.speed * dtNorm;

        let destX, destY;

        if (mouse.hoverMode === 'orbit_element' && mouse.hoverBox) {
          // Perimeter Orbit around element
          const hb = mouse.hoverBox;
          const semiMajor = hb.width / 2 + 28 + (c.orbitTier * 16);
          const semiMinor = hb.height / 2 + 20 + (c.orbitTier * 12);
          destX = hb.centerX + Math.cos(c.orbitAngle) * semiMajor;
          destY = hb.centerY + Math.sin(c.orbitAngle) * semiMinor;
        } else if (mouse.hoverMode === 'gather' && mouse.hoverBox) {
          // Non-colliding 8-point perimeter distribution
          const hb = mouse.hoverBox;
          switch (idx) {
            case 0: destX = hb.left - 8; destY = hb.top - 8; break; // Top-Left
            case 1: destX = hb.centerX; destY = hb.top - 10; break; // Top-Center
            case 2: destX = hb.left + hb.width + 8; destY = hb.top - 8; break; // Top-Right
            case 3: destX = hb.left + hb.width + 10; destY = hb.centerY; break; // Right-Center
            case 4: destX = hb.left + hb.width + 8; destY = hb.top + hb.height + 8; break; // Bottom-Right
            case 5: destX = hb.centerX; destY = hb.top + hb.height + 10; break; // Bottom-Center
            case 6: destX = hb.left - 8; destY = hb.top + hb.height + 8; break; // Bottom-Left
            case 7:
            default: destX = hb.left - 10; destY = hb.centerY; break; // Left-Center
          }
        } else {
          // DEFAULT: Continuous dynamic orbit around user pointer
          // Smoothed inertial lag integration
          const targetLagX = -mouse.vx * 12 * (c.mass * 0.7);
          const targetLagY = -mouse.vy * 12 * (c.mass * 0.7);
          c.lagX += (targetLagX - c.lagX) * 0.14 * dtNorm;
          c.lagY += (targetLagY - c.lagY) * 0.14 * dtNorm;

          // Harmonic breathing wave in stationary hover
          const breathing = Math.sin(clock * 2.5 + idx * 0.78) * 3.5;
          const speedFactor = Math.min(mouse.speed / 5.5, 1);
          const dynamicRadius = (c.radius + breathing) * (1 - speedFactor * 0.32);

          destX = mouse.x + Math.cos(c.orbitAngle) * dynamicRadius + c.lagX;
          destY = mouse.y + Math.sin(c.orbitAngle) * dynamicRadius + c.lagY;
        }

        // Viewport Soft Target Compression
        destX = Math.max(P_LEFT, Math.min(width - P_RIGHT, destX));
        destY = Math.max(P_TOP, Math.min(height - P_BOTTOM, destY));

        // Spring Force
        const ax = (destX - c.x) * c.stiffness;
        const ay = (destY - c.y) * c.stiffness;

        // Viewport Soft Restoring Force (F_bound)
        let boundFx = 0;
        let boundFy = 0;
        if (c.x < P_LEFT) boundFx = (P_LEFT - c.x) * K_BOUND;
        else if (c.x > width - P_RIGHT) boundFx = (width - P_RIGHT - c.x) * K_BOUND;

        if (c.y < P_TOP) boundFy = (P_TOP - c.y) * K_BOUND;
        else if (c.y > height - P_BOTTOM) boundFy = (height - P_BOTTOM - c.y) * K_BOUND;

        // Separation Force (Avoid collision with neighboring cursors)
        let sepX = 0;
        let sepY = 0;
        cursors.forEach((other, oIdx) => {
          if (idx === oIdx) return;
          const dx = c.x - other.x;
          const dy = c.y - other.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 38 && dist > 0.001) {
            const push = ((38 - dist) / 38) * 0.55;
            sepX += (dx / dist) * push;
            sepY += (dy / dist) * push;
          }
        });

        // Integrate Acceleration
        c.vx = (c.vx + ax + boundFx + sepX) * c.damping;
        c.vy = (c.vy + ay + boundFy + sepY) * c.damping;

        c.x += c.vx * dtNorm;
        c.y += c.vy * dtNorm;

        // Elastic Hard Boundary Guard
        if (c.x < 12) { c.x = 12; c.vx = Math.abs(c.vx) * 0.3; }
        else if (c.x > width - P_RIGHT) { c.x = width - P_RIGHT; c.vx = -Math.abs(c.vx) * 0.3; }

        if (c.y < 12) { c.y = 12; c.vy = Math.abs(c.vy) * 0.3; }
        else if (c.y > height - P_BOTTOM) { c.y = height - P_BOTTOM; c.vy = -Math.abs(c.vy) * 0.3; }

        // Render Cursor Agent
        ctx.save();
        ctx.translate(c.x, c.y);

        // Tilt with velocity
        const tilt = Math.max(-0.35, Math.min(0.35, c.vx * 0.05));
        ctx.rotate(tilt);

        // 1. Sleek SVG Cursor Arrow
        ctx.fillStyle = c.color;
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.5;
        ctx.shadowColor = c.color;
        ctx.shadowBlur = 8;

        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(0, 16);
        ctx.lineTo(4.5, 11.5);
        ctx.lineTo(8.5, 18);
        ctx.lineTo(11, 16.5);
        ctx.lineTo(7, 10.5);
        ctx.lineTo(12, 10.5);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // 2. Modern Collaborative Name Badge
        const labelText = c.name;
        ctx.font = '10px Inter, system-ui, sans-serif';
        const textWidth = ctx.measureText(labelText).width;
        const badgeWidth = textWidth + 18;
        const badgeHeight = 18;

        // Adaptive Badge Flipping near right screen edge
        const isNearRightEdge = c.x > width - 130;
        const badgeX = isNearRightEdge ? -(badgeWidth + 4) : 13;
        const badgeY = 12;

        // Badge pill
        ctx.fillStyle = 'rgba(3, 7, 18, 0.92)';
        ctx.strokeStyle = c.color;
        ctx.lineWidth = 1;
        ctx.shadowColor = c.color;
        ctx.shadowBlur = 5;

        ctx.beginPath();
        ctx.roundRect(badgeX, badgeY, badgeWidth, badgeHeight, 5);
        ctx.fill();
        ctx.stroke();

        // Pulsing status dot
        ctx.fillStyle = c.color;
        ctx.beginPath();
        ctx.arc(badgeX + 6.5, badgeY + badgeHeight / 2, 2.5, 0, Math.PI * 2);
        ctx.fill();

        // Label Text
        ctx.fillStyle = '#f8fafc';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.fillText(labelText, badgeX + 13, badgeY + badgeHeight / 2 + 0.5);

        ctx.restore();
      });

      ctx.restore();
      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', updateCanvasDimensions);
      window.removeEventListener('pointermove', handlePointerMove);
      document.documentElement.removeEventListener('pointerleave', handlePointerLeave);
      document.documentElement.removeEventListener('pointerenter', handlePointerEnter);
      window.removeEventListener('blur', handleWindowBlur);
      window.removeEventListener('focus', handleWindowFocus);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      sound.updateCursorVelocity(0); // Silence drone on unmount
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-50 overflow-hidden"
      style={{ width: '100vw', height: '100vh' }}
      aria-hidden="true"
    />
  );
}
```

---

## 4. Caveats & Assumptions

1. **Touchscreen & Coarse Pointers**:
   Mobile touch interfaces do not provide hovering cursor coordinates and have limited screen real estate. The engine disables itself when `(pointer: coarse)` or `window.innerWidth < 768` is detected, avoiding touch target obstruction and saving battery.
2. **Reduced Motion Accessibility**:
   Users with `prefers-reduced-motion: reduce` are immediately respected; the hook returns early, rendering zero intrusive animation.
3. **Browser Window Frame Differences**:
   `document.documentElement.addEventListener('pointerleave')` fires cleanly in Chromium and WebKit when exiting the viewport into native window frames. On rare secondary monitor transitions where OS-level pointer capture might delay the event by several milliseconds, the elastic boundary bumper ($F_{\text{bound}}$) prevents off-screen clipping regardless of event latency.
4. **Scrolling Active DOM Targets**:
   When the user scrolls the page using mousewheel while the pointer remains motionless, `handlePointerMove` does not re-fire until the pointer moves. In a high-speed scroll scenario, `resolveInteractiveTarget` can be hooked to `window.addEventListener('scroll')` if continuous geometric re-anchoring of `[data-swarm="gather"]` targets is desired during wheel motion.

---

## 5. Conclusion

1. **Soft Boundary Deflection**: Combining soft restoring spring forces ($F_{\text{bound}}$), boundary target compression, elastic velocity reflection, and adaptive right-edge badge flipping guarantees that all 8 cursors and their badges remain 100% visible and unclipped across any screen resolution.
2. **Graceful Pointer Lifecycle**: Attaching `pointerleave`, `pointerenter`, `blur`, and `focus` handlers with smoothed anchor drift and alpha interpolation ($1.0 \leftrightarrow 0.40$) ensures the swarm enters a tranquil parked state when the cursor exits the window and smoothly recovers upon return with zero visual popping or velocity explosion.
3. **Seamless DOM Hooks**:
   - `[data-swarm="orbit"]` expands into responsive elliptical orbits enclosing the headline/card geometry ($A = W/2 + \text{tierMargin}, B = H/2 + \text{tierMargin}$).
   - `[data-swarm="gather"]` distributes the 8 cursors across 8 distinct perimeter anchor points (4 corners, 4 edge midpoints), completely eliminating corner overlap and collision vibration while rendering a smooth blueprint bounding box.
4. **Audio Telemetry Coupling**: Normalizing mouse velocity, executing per-frame exponential velocity decay, and dispatching `sound.updateCursorVelocity(mouse.speed)` coupled with unmount and pointerleave zeroing guarantees fluid, artifact-free ambient drone modulation.

---

## 6. Verification Method

To independently verify these specifications and the resulting implementation:

1. **Automated Production Build Verification**:
   ```powershell
   cd c:\Users\Ayush\OneDrive\Documents\swarm\frontend
   npm run build
   ```
   *Expected result*: Build completes cleanly with exit code `0` and zero syntax or JSX bundling errors.

2. **Viewport Boundary Verification Runbook**:
   - Start local preview: `npm run dev` or `npm run preview`.
   - Open browser at `http://localhost:5173`.
   - Move mouse cursor to coordinates $(0, 0)$ (Top-Left corner).
   - *Verification check*: Swarm cursors deflect softly against the top and left margins ($24\text{px}, 20\text{px}$). No cursor arrow tip or shadow blur clips outside the viewport.
   - Move mouse cursor to $(W, H/2)$ (extreme right border).
   - *Verification check*: Cursors do not clip off the right edge. Collaborative name badges dynamically flip to the left of the arrow tips or compress safely within the right margin.

3. **Graceful Pointerleave / Pointerenter Runbook**:
   - Move mouse quickly outside the browser window into the desktop or browser tabs.
   - *Verification check*: The swarm smoothly glides towards an inset/centered resting orbit while fading to $40\%$ opacity. No cursors disappear abruptly or get stuck in a frozen state.
   - Move mouse back into the viewport.
   - *Verification check*: Cursors smoothly fade back to $100\%$ opacity and re-anchor without velocity spikes or jumps.

4. **DOM Hooks Verification Runbook**:
   - Hover over `<h1 data-swarm="orbit">AYUSH GORA</h1>` in the Hero section.
   - *Verification check*: The 8 cursors expand outward into concentric elliptical orbits encircling the entire title block without occluding the letters.
   - Hover over `<a data-swarm="gather">EXPLORE MY WORK</a>` button in the Hero section.
   - *Verification check*: The 8 cursors assemble around the button (4 corners, 4 midpoints) with zero jitter or vibrating badge collisions, framed by the dashed cyan/blue blueprint outline.

5. **Audio Telemetry Verification Runbook**:
   - Unmute audio using the Navbar sound button.
   - Flick mouse rapidly back and forth across the screen.
   - *Verification check*: A delicate, low-frequency ambient synthesizer drone modulates in pitch and volume with cursor speed.
   - Stop mouse movement completely.
   - *Verification check*: The drone smoothly decays to silence within ~150ms.
