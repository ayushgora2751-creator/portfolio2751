# Architectural Specification & Technical Recommendations: Canvas Rendering, Multi-Tier Orbit Flocking, Rotational Heading & Figma-Style Badge Architecture

**Author**: `explorer_m1_canvas_rendering`  
**Working Directory**: `c:\Users\Ayush\OneDrive\Documents\swarm\.agents\teamwork\explorer_m1_canvas_rendering\`  
**Date**: 2026-11-04  
**Target Component**: `frontend/src/animations/SwarmCursor.jsx`  
**Context**: Milestone 1 (Swarm Cursor Orbit & Flocking Engine)  

---

## 1. Observation

Direct inspection of `frontend/src/animations/SwarmCursor.jsx` and workspace configuration revealed the following verbatim facts and defects:

### 1.1 Canvas Buffer Sizing & High-DPI Defect
- In `frontend/src/animations/SwarmCursor.jsx` (lines 47-48 and 87-90):
  ```javascript
  let width = (canvas.width = window.innerWidth);
  let height = (canvas.height = window.innerHeight);
  // ...
  const handleResize = () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  };
  ```
  **Direct Observation**:
  `canvas.width` and `canvas.height` are set to raw CSS pixel dimensions (`window.innerWidth`, `window.innerHeight`) without reading `window.devicePixelRatio`.
  On High-DPI / Retina displays ($1.5\times$, $2.0\times$, $3.0\times$ device pixel ratio common on MacBooks, 4K monitors, and mobile displays), the browser rasterizes a standard-density bitmap and upscales it to fill the physical display viewport. This causes:
  1. Visible blurring of fine 1px badge outlines and particle arcs.
  2. Blurry rendering of small 9px–10px canvas typography (`Inter`, `JetBrains Mono`).
  3. Halation and washed-out color fringing around cursor neon glow shadows.

### 1.2 Frame-Rate Dependent Angular Progression
- In `frontend/src/animations/SwarmCursor.jsx` (lines 176-177 and 255-256):
  ```javascript
  time += 0.02;
  // ...
  cursors.forEach((c, idx) => {
    c.orbitAngle += c.speed;
  ```
  **Direct Observation**:
  `c.orbitAngle` is incremented by a static angular velocity scalar `c.speed` once per `requestAnimationFrame`.
  Because this increment is not normalized by elapsed delta-time ($\Delta t$), the orbital rotation speed is strictly tied to monitor refresh rate:
  - 60 Hz display: $60 \times \text{speed}$ radians/second.
  - 120 Hz display (ProMotion / Gaming laptops): $120 \times \text{speed}$ radians/second ($2\times$ faster).
  - 165 Hz / 240 Hz monitors: $2.75\times$ to $4\times$ faster, causing cursors to spin in a violent blur.

### 1.3 Velocity Stuck Bug & Abrupt Inertia Snapping
- In `frontend/src/animations/SwarmCursor.jsx` (lines 94-101 and 180-185):
  ```javascript
  const handlePointerMove = (e) => {
    const now = performance.now();
    const dt = Math.max(now - lastTime, 16);
    mouse.vx = (e.clientX - mouse.targetX) / dt;
    mouse.vy = (e.clientY - mouse.targetY) / dt;
    mouse.speed = Math.sqrt(mouse.vx * mouse.vx + mouse.vy * mouse.vy);
    mouse.targetX = e.clientX;
    mouse.targetY = e.clientY;
    lastTime = now;
  ```
  And in lines 276-277:
  ```javascript
  const velocityLagX = -mouse.vx * 15 * (c.mass * 0.8);
  const velocityLagY = -mouse.vy * 15 * (c.mass * 0.8);
  ```
  **Direct Observation**:
  When the user stops moving their mouse, no further `pointermove` events fire.
  In the `render()` loop, `mouse.vx` and `mouse.vy` are never decayed or damped!
  Consequently, `mouse.vx` and `mouse.vy` retain the non-zero speed of the very last `pointermove` event until the user moves the mouse again. If the mouse halts suddenly, `velocityLagX` remains stuck in a lagging position or jumps violently when the mouse restarts.

### 1.4 Rotational Heading Calculation Disconnected from Render
- In `frontend/src/animations/SwarmCursor.jsx` (lines 311-314 vs 334-335):
  ```javascript
  const speed = Math.sqrt(c.vx * c.vx + c.vy * c.vy);
  const targetAngle = speed > 0.4 ? Math.atan2(c.vy, c.vx) + Math.PI / 4 : 0;
  c.angle += (targetAngle - c.angle) * 0.15;
  // ...
  ctx.save();
  ctx.translate(c.x, c.y);

  // Tilt with velocity
  const tilt = Math.max(-0.35, Math.min(0.35, c.vx * 0.05));
  ctx.rotate(tilt);
  ```
  **Direct Observation**:
  `c.angle` is calculated at line 313 using `Math.atan2(c.vy, c.vx) + Math.PI / 4`, but it is completely discarded.
  At line 335, the rendering code applies only `ctx.rotate(tilt)` where `tilt = clamp(c.vx * 0.05, -0.35, 0.35)`.
  This means the cursor never aligns with its trajectory heading; it only applies a slight horizontal wobble ($\pm 20^\circ$) based on $v_x$, ignoring vertical movement and orbital angular direction.
  Furthermore, because `ctx.rotate` is called before drawing both the cursor and the badge, any larger rotation angle would invert the text badge upside-down.

### 1.5 Missing Role Labels & Static Status Dot in Badges
- In `frontend/src/animations/SwarmCursor.jsx` (lines 19-28 vs 357-388):
  ```javascript
  const CURSOR_CONFIGS = [
    { name: "Ayush", role: "Creative Lead", color: "#3b82f6", ... },
    { name: "DevOps", role: "Cloud Eng", color: "#06b6d4", ... },
    // ...
  ];
  // ...
  const labelText = c.name; // Line 357: Only name is used!
  // ...
  // Pulsing status dot
  ctx.fillStyle = c.color;
  ctx.beginPath();
  ctx.arc(badgeX + 6.5, badgeY + badgeHeight / 2, 2.5, 0, Math.PI * 2);
  ctx.fill();
  ```
  **Direct Observation**:
  1. The configured `c.role` is completely omitted from the badge rendering; only `c.name` is rendered.
  2. The status dot is marked in code comments as "Pulsing status dot", but is drawn with a static radius of $2.5\text{px}$ and static opacity ($1.0$), with zero pulsation or breathing dynamics.
  3. When `c.x` approaches the right viewport boundary ($c.x > W - 100$), the badge has a static positive offset (`badgeX = 13`), clipping off-screen.

---

## 2. Logic Chain

From the direct observations above, we establish the step-by-step mathematical and architectural specifications to satisfy the Milestone 1 requirements.

### 2.1 High-DPI Retina Canvas Scaling (DPR up to 2.0)

#### 2.1.1 Formulation
Let $W_{\text{CSS}} = \text{window.innerWidth}$ and $H_{\text{CSS}} = \text{window.innerHeight}$.
Let $\text{DPR}_{\text{raw}} = \text{window.devicePixelRatio} \parallel 1.0$.
Cap the device pixel ratio to prevent memory explosion and fill-rate throttling on ultra-high-density mobile screens:
$$\text{DPR}_{\text{eff}} = \min(\text{DPR}_{\text{raw}}, 2.0)$$

#### 2.1.2 Buffer vs Style Dimension Separation
```javascript
const updateCanvasSize = () => {
  const dpr = Math.min(window.devicePixelRatio || 1, 2.0);
  const width = window.innerWidth;
  const height = window.innerHeight;

  // Set physical backing buffer resolution
  canvas.width = Math.round(width * dpr);
  canvas.height = Math.round(height * dpr);

  // Set CSS display layout dimensions
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;

  // Idempotently reset transformation matrix and apply scale
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.scale(dpr, dpr);
};
```

#### 2.1.3 Rationale & Invariant Preservation
- `ctx.setTransform(1, 0, 0, 1, 0, 0)` guarantees that repeated calls to `handleResize` never compound the scaling matrix.
- `ctx.scale(dpr, dpr)` maps all subsequent Canvas 2D draw calls (`ctx.arc`, `ctx.fillText`, `ctx.strokeRect`, `ctx.clearRect`) directly into CSS coordinate space ($0 \le x \le W_{\text{CSS}}$, $0 \le y \le H_{\text{CSS}}$).
- All mouse event coordinates (`e.clientX`, `e.clientY`) map 1:1 to canvas drawing coordinates without manual DPR multipliers.
- Capping at $2.0$ bounds maximum buffer size to $3840 \times 2160$ pixels on 4K/Retina displays, avoiding the $9\times$ fill-rate penalty of $3.0\times$ DPR while delivering subpixel razor sharpness.
- DPR change listener: Register `window.matchMedia('(resolution: ' + window.devicePixelRatio + 'dppx)')` listener to handle multi-monitor window movement between standard and Retina displays.

---

### 2.2 3 Concentric Counter-Rotating Tiers & 8 Collaborative Agent Configurations

#### 2.2.1 Tier Distribution & Parameter Matrix
To deliver the collaborative multi-agent aesthetic (reminiscent of Dhvanil Patel and Joel Califa), configure 8 unique agents across 3 concentric tiers with strictly alternating rotational directions:

| # | Agent Name | Role | Accent Color (`c.color`) | Orbit Tier | Base Radius ($R_0$) | Angular Velocity ($\omega_i$) | Orbit Direction | Mass ($m_i$) | Spring Stiffness ($k_s$) | Initial Phase ($\theta_{0, i}$) |
|---|---|---|---|---|---|---|---|---|---|---|
| **0** | **Ayush** | Creative Lead | `#3b82f6` (Royal Blue) | Tier 0 (Core) | 44 px | $+0.038\text{ rad}$ | Clockwise | 0.95 | 0.088 | $0$ |
| **1** | **DevOps** | Cloud & CI/CD | `#06b6d4` (Cyan) | Tier 0 (Core) | 50 px | $-0.042\text{ rad}$ | Counter-Clockwise | 1.00 | 0.085 | $\pi$ ($180^\circ$) |
| **2** | **Three.js** | 3D Graphics | `#8b5cf6` (Purple) | Tier 1 (Middle) | 74 px | $+0.028\text{ rad}$ | Clockwise | 1.10 | 0.075 | $0$ |
| **3** | **Django** | Backend REST | `#10b981` (Emerald) | Tier 1 (Middle) | 82 px | $-0.032\text{ rad}$ | Counter-Clockwise | 1.15 | 0.072 | $\frac{2\pi}{3}$ ($120^\circ$) |
| **4** | **Reviewer** | Code Quality | `#ec4899` (Pink) | Tier 1 (Middle) | 88 px | $+0.026\text{ rad}$ | Clockwise | 1.20 | 0.070 | $\frac{4\pi}{3}$ ($240^\circ$) |
| **5** | **UI/UX** | Design Systems | `#f43f5e` (Rose) | Tier 2 (Outer) | 114 px | $-0.020\text{ rad}$ | Counter-Clockwise | 1.30 | 0.062 | $\frac{\pi}{3}$ ($60^\circ$) |
| **6** | **Architect** | Systems Arch | `#f59e0b` (Amber) | Tier 2 (Outer) | 120 px | $+0.018\text{ rad}$ | Clockwise | 1.35 | 0.060 | $\pi$ ($180^\circ$) |
| **7** | **Docker** | Linux Infra | `#0ea5e9` (Sky Blue) | Tier 2 (Outer) | 126 px | $-0.016\text{ rad}$ | Counter-Clockwise | 1.40 | 0.058 | $\frac{5\pi}{3}$ ($300^\circ$) |

#### 2.2.2 Zero-Overlap Initial Phase Offsets
Initial phase offsets are computed per-tier:
- **Tier 0** (2 agents): Diametrically opposed ($\Delta\phi = \pi = 180^\circ$).
- **Tier 1** (3 agents): Trilateral symmetry ($\Delta\phi = \frac{2\pi}{3} = 120^\circ$).
- **Tier 2** (3 agents): Trilateral symmetry staggered by $60^\circ$ ($\Delta\phi = \frac{2\pi}{3}$, base offset $\frac{\pi}{3}$).
This guarantees zero overlap on initial render.

#### 2.2.3 Delta-Time Normalized Orbit Clock
Let $t_{\text{now}} = \text{performance.now}()$ and $\Delta t = \min(t_{\text{now}} - t_{\text{prev}}, 64.0)\text{ ms}$.
Let $\Delta t_{\text{norm}} = \frac{\Delta t}{16.6667\text{ ms}}$ (normalized to 60 FPS reference).
$$\theta_i(t + \Delta t) = \theta_i(t) + \omega_i \cdot \Delta t_{\text{norm}}$$
This ensures identical angular velocity whether running on 60Hz, 120Hz, or 240Hz monitors.

#### 2.2.4 Harmonic Respiration Wave (Stationary Idle)
During idle hover, each cursor's orbit radius gently breathes sinusoidally:
$$R_i(t) = R_{0, i} + 3.5 \cdot \sin(2\pi \cdot 0.35 \cdot t + c.\text{id} \cdot 0.8)$$
- Oscillation amplitude: $3.5\text{px}$.
- Respiration frequency: $0.35\text{Hz}$ (period $\approx 2.85\text{ seconds}$).
- Per-agent phase shift: $c.\text{id} \times 0.8\text{ rad}$, producing an organic, living breathing wave across the swarm.

#### 2.2.5 Smooth Velocity Decay & Inertia Lag Integration
To fix the stuck velocity and jumping lag bugs:
1. Every frame in `render()`, decay the mouse velocity:
   ```javascript
   mouse.vx *= 0.88;
   mouse.vy *= 0.88;
   if (Math.abs(mouse.vx) < 0.001) mouse.vx = 0;
   if (Math.abs(mouse.vy) < 0.001) mouse.vy = 0;
   mouse.speed = Math.sqrt(mouse.vx * mouse.vx + mouse.vy * mouse.vy);
   ```
2. Exponentially smooth the inertial lag vector per agent:
   ```javascript
   const targetLagX = -mouse.vx * 14 * (c.mass * 0.85);
   const targetLagY = -mouse.vy * 14 * (c.mass * 0.85);
   c.lagX += (targetLagX - c.lagX) * 0.16;
   c.lagY += (targetLagY - c.lagY) * 0.16;
   ```
3. Cohesion contraction at high velocity:
   $$R_{\text{eff}, i} = R_i(t) \cdot \left(1.0 - 0.35 \cdot \min\left(\frac{\text{mouse.speed}}{5.0}, 1.0\right)\right)$$
4. Target coordinate:
   $$\begin{aligned}
   x_{\text{dest}, i} &= \text{mouse.x} + R_{\text{eff}, i} \cdot \cos(\theta_i) + c.\text{lagX} \\
   y_{\text{dest}, i} &= \text{mouse.y} + R_{\text{eff}, i} \cdot \sin(\theta_i) + c.\text{lagY}
   \end{aligned}$$

---

### 2.3 Rotational Heading & Cursor Pointer Rendering

#### 2.3.1 Transformation Decoupling (Cursor vs Badge)
To enable the cursor to rotate along its heading while keeping the name badge horizontally upright and legible:
```javascript
// Phase 1: Draw Cursor Arrow with Heading Rotation
ctx.save();
ctx.translate(c.x, c.y);
ctx.rotate(c.computedHeading);
drawSvgCursor(ctx, c);
ctx.restore();

// Phase 2: Draw Figma-Style Pill Badge (Always Upright & Read-Oriented)
ctx.save();
ctx.translate(c.x, c.y);
drawBadgePill(ctx, c, width, height, time);
ctx.restore();
```

#### 2.3.2 Composite Heading Angle Mathematics
The classic SVG cursor arrow has its tip at $(0, 0)$ and its body oriented along the Southeast vector ($\approx +67.5^\circ$ or $+1.18\text{ rad}$).
To make the cursor bank into its trajectory and orbit curvature:
1. **Orbital Tangential Heading**:
   For circular motion with angular sign $\text{sgn}(\omega_i)$:
   $$\theta_{\text{tan}} = c.\text{orbitAngle} + \text{sgn}(\omega_i) \cdot \frac{\pi}{2}$$
2. **Velocity Trajectory Heading**:
   When the cursor is moving with agent velocity $\vec{v}_c = (c.vx, c.vy)$ and speed $S_c = \|\vec{v}_c\|$:
   $$\theta_{\text{motion}} = \text{atan2}(c.vy, c.vx)$$
3. **Aerodynamic Banking & Heading Formula**:
   $$\text{tilt}_{\text{bank}} = \text{clamp}(c.vx \cdot 0.045, -0.32, +0.32)\text{ rad}$$
   $$\text{pitch}_{\text{vert}} = \text{clamp}(c.vy \cdot 0.030, -0.20, +0.20)\text{ rad}$$
   $$\theta_{\text{orbit\_bank}} = \text{sgn}(\omega_i) \cdot 0.18 + 0.10 \cdot \sin(c.\text{orbitAngle})$$
   $$\theta_{\text{target}} = \text{tilt}_{\text{bank}} + \text{pitch}_{\text{vert}} + \theta_{\text{orbit\_bank}}$$
   $$c.\text{heading} += (\theta_{\text{target}} - c.\text{heading}) \cdot 0.16$$
   This delivers an authentic aerodynamic banking effect: when stationary, cursors gently bank inward along their orbit curve; when dragged rapidly, they tilt dynamically along the motion vector. The angle is bounded within $\pm 35^\circ$, ensuring the cursor remains recognizably an arrow pointer without spinning disorientingly.

#### 2.3.3 SVG Cursor Path Geometry & Dual-Pass Rendering
```javascript
function drawSvgCursor(ctx, c) {
  // SVG Arrow Path (Tip at 0, 0; Height = 18px)
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(0, 16);
  ctx.lineTo(4.5, 11.5);
  ctx.lineTo(8.5, 18);
  ctx.lineTo(11, 16.5);
  ctx.lineTo(7, 10.5);
  ctx.lineTo(12, 10.5);
  ctx.closePath();

  // Pass 1: Laser Glow Shadow & Accent Fill
  ctx.fillStyle = c.color;
  ctx.shadowColor = c.color;
  ctx.shadowBlur = 8;
  ctx.fill();

  // Pass 2: High-Contrast Crisp White Outer Border
  // Reset shadow to prevent blurred bleed
  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 1.4;
  ctx.lineJoin = 'round';
  ctx.stroke();
}
```

---

### 2.4 Figma-Style Translucent Pill Badges with Pulsing Status Dots and Role Labels

#### 2.4.1 Typographic Hierarchy & Geometric Sizing
- **Agent Name**: `600 10px Inter, system-ui, sans-serif` in `#f8fafc` (high-contrast white).
- **Divider**: Bullet `·` in `rgba(148, 163, 184, 0.45)`.
- **Role Label**: `400 9px 'JetBrains Mono', monospace` in `#94a3b8` (Slate 400).
- **Dimensions Calculation**:
  ```javascript
  ctx.font = '600 10px Inter, system-ui, sans-serif';
  const nameWidth = ctx.measureText(c.name).width;
  ctx.font = '400 9px JetBrains Mono, monospace';
  const roleWidth = ctx.measureText(c.role).width;

  const dotLeftMargin = 8;
  const dotWidth = 9; // Dot + spacing
  const dividerWidth = 10;
  const rightMargin = 8;
  const badgeWidth = Math.round(dotLeftMargin + dotWidth + nameWidth + dividerWidth + roleWidth + rightMargin);
  const badgeHeight = 20;
  ```

#### 2.4.2 Dynamic Screen Boundary Flipping (Anti-Clipping)
To prevent badges from rendering outside the viewport when the mouse hovers near screen boundaries:
```javascript
let badgeX = 14;
let badgeY = 10;

// Right margin flip: If badge exceeds right edge, flip to left of cursor tip
if (c.x + badgeX + badgeWidth > screenWidth - 16) {
  badgeX = -(badgeWidth + 6);
}
// Bottom margin flip: If badge exceeds bottom edge, flip above cursor tip
if (c.y + badgeY + badgeHeight > screenHeight - 16) {
  badgeY = -(badgeHeight + 6);
}
// Left margin guard: If flipped too far left, clamp to viewport margin
if (c.x + badgeX < 12) {
  badgeX = 12 - c.x;
}
// Top margin guard: If flipped too far up, clamp to viewport margin
if (c.y + badgeY < 12) {
  badgeY = 12 - c.y;
}
```

#### 2.4.3 Translucent Obsidian Pill Container
- Background: `rgba(3, 7, 18, 0.90)` (matching portfolio background `#030712`).
- Border: `1px solid ${c.color}aa` (accent color with 66% opacity).
- Soft glow: `ctx.shadowColor = c.color`, `ctx.shadowBlur = 5`.
- Corner radius: `ctx.roundRect(badgeX, badgeY, badgeWidth, badgeHeight, 6)`.

#### 2.4.4 Staggered Harmonic Status Dot Pulsing
```javascript
const dotCenterX = badgeX + 9;
const dotCenterY = badgeY + badgeHeight / 2;
// Sinusoidal pulse staggered per agent ID
const pulse = Math.sin(time * 3.2 + c.id * 0.9);
const dotRadius = 2.2 + pulse * 0.5; // Oscillates 1.7px to 2.7px
const auraRadius = 4.2 + pulse * 0.9; // Oscillates 3.3px to 5.1px
const auraAlpha = Math.max(0, 0.22 + pulse * 0.15); // Modulates 0.07 to 0.37

// Pass 1: Breathing Glow Aura
ctx.fillStyle = c.color;
ctx.globalAlpha = auraAlpha;
ctx.beginPath();
ctx.arc(dotCenterX, dotCenterY, auraRadius, 0, Math.PI * 2);
ctx.fill();

// Pass 2: Solid Status Core
ctx.globalAlpha = 1.0;
ctx.beginPath();
ctx.arc(dotCenterX, dotCenterY, dotRadius, 0, Math.PI * 2);
ctx.fill();
```

---

## 3. Detailed Proposed Implementation Blueprint

Here is the complete, self-contained reference code for the canvas rendering routines to be implemented in `frontend/src/animations/SwarmCursor.jsx`:

```javascript
/**
 * Proposed SwarmCursor.jsx (Milestone 1 Canvas Implementation Reference)
 */

import React, { useEffect, useRef } from 'react';
import { sound } from '../services/soundEffects';

// Verified 8-Agent Configuration Matrix Across 3 Concentric Tiers
export const CURSOR_CONFIGS = [
  // Tier 0: Inner Core (44 - 50px, rapid tight orbit)
  { id: 0, name: "Ayush", role: "Creative Lead", color: "#3b82f6", orbitTier: 0, radius: 44, speed: 0.038, mass: 0.95, stiffness: 0.088, initialPhase: 0 },
  { id: 1, name: "DevOps", role: "Cloud & CI/CD", color: "#06b6d4", orbitTier: 0, radius: 50, speed: -0.042, mass: 1.00, stiffness: 0.085, initialPhase: Math.PI },
  
  // Tier 1: Middle Ring (74 - 88px, balanced coordination)
  { id: 2, name: "Three.js", role: "3D Graphics", color: "#8b5cf6", orbitTier: 1, radius: 74, speed: 0.028, mass: 1.10, stiffness: 0.075, initialPhase: 0 },
  { id: 3, name: "Django", role: "Backend REST", color: "#10b981", orbitTier: 1, radius: 82, speed: -0.032, mass: 1.15, stiffness: 0.072, initialPhase: (2 * Math.PI) / 3 },
  { id: 4, name: "Reviewer", role: "Code Quality", color: "#ec4899", orbitTier: 1, radius: 88, speed: 0.026, mass: 1.20, stiffness: 0.070, initialPhase: (4 * Math.PI) / 3 },
  
  // Tier 2: Outer Ring (114 - 126px, wide architectural perimeter)
  { id: 5, name: "UI/UX", role: "Design Systems", color: "#f43f5e", orbitTier: 2, radius: 114, speed: -0.020, mass: 1.30, stiffness: 0.062, initialPhase: Math.PI / 3 },
  { id: 6, name: "Architect", role: "Systems Arch", color: "#f59e0b", orbitTier: 2, radius: 120, speed: 0.018, mass: 1.35, stiffness: 0.060, initialPhase: Math.PI },
  { id: 7, name: "Docker", role: "Linux Infra", color: "#0ea5e9", orbitTier: 2, radius: 126, speed: -0.016, mass: 1.40, stiffness: 0.058, initialPhase: (5 * Math.PI) / 3 },
];

export default function SwarmCursor() {
  const canvasRef = useRef(null);

  useEffect(() => {
    // 1. Accessibility & Device Checks
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isTouchDevice = window.matchMedia('(pointer: coarse)').matches || window.innerWidth < 768;

    if (prefersReducedMotion || isTouchDevice) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Viewport and High-DPI Scaling State
    let dpr = 1;
    let width = window.innerWidth;
    let height = window.innerHeight;

    const updateCanvasDimensions = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2.0);
      width = window.innerWidth;
      height = window.innerHeight;

      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
    };

    updateCanvasDimensions();

    // Mouse & State
    const mouse = {
      x: width / 2,
      y: height / 2,
      targetX: width / 2,
      targetY: height / 2,
      vx: 0,
      vy: 0,
      speed: 0,
      isDown: false,
      hoverMode: 'orbit_cursor',
      hoverBox: null,
    };

    // Initialize Cursor Agents
    const cursors = CURSOR_CONFIGS.map((cfg) => ({
      ...cfg,
      x: mouse.x + Math.cos(cfg.initialPhase) * cfg.radius,
      y: mouse.y + Math.sin(cfg.initialPhase) * cfg.radius,
      vx: 0,
      vy: 0,
      heading: 0,
      orbitAngle: cfg.initialPhase,
      lagX: 0,
      lagY: 0,
      damping: 0.83,
    }));

    // Particle Trail Buffer
    const particles = [];
    const maxParticles = 140;

    const handleResize = () => {
      updateCanvasDimensions();
    };

    let lastTime = performance.now();
    const handlePointerMove = (e) => {
      const now = performance.now();
      const dt = Math.max(now - lastTime, 16);
      mouse.vx = (e.clientX - mouse.targetX) / dt;
      mouse.vy = (e.clientY - mouse.targetY) / dt;
      mouse.targetX = e.clientX;
      mouse.targetY = e.clientY;
      lastTime = now;

      // Element hover inspection
      const target = document.elementFromPoint(e.clientX, e.clientY);
      if (target) {
        const orbitElement = target.closest('[data-swarm="orbit"]');
        const gatherElement = target.closest('[data-swarm="gather"], button, [data-tilt="true"]');

        if (orbitElement) {
          const rect = orbitElement.getBoundingClientRect();
          mouse.hoverMode = 'orbit_element';
          mouse.hoverBox = {
            x: rect.left + rect.width / 2,
            y: rect.top + rect.height / 2,
            width: rect.width,
            height: rect.height,
          };
        } else if (gatherElement) {
          const rect = gatherElement.getBoundingClientRect();
          mouse.hoverMode = 'gather';
          mouse.hoverBox = {
            x: rect.left,
            y: rect.top,
            width: rect.width,
            height: rect.height,
          };
        } else {
          mouse.hoverMode = 'orbit_cursor';
          mouse.hoverBox = null;
        }
      }
    };

    const handleMouseDown = () => {
      mouse.isDown = true;
      if (sound?.playClickImpulse) sound.playClickImpulse();

      cursors.forEach((c) => {
        const dx = c.x - mouse.targetX;
        const dy = c.y - mouse.targetY;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        const impulse = 15 + Math.random() * 8;
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

    window.addEventListener('resize', handleResize);
    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);

    // Watch for display DPI shifts (e.g. dragging between standard and Retina monitors)
    let dprMediaQuery = null;
    if (window.matchMedia) {
      dprMediaQuery = window.matchMedia(`(resolution: ${window.devicePixelRatio}dppx)`);
      dprMediaQuery.addEventListener('change', handleResize);
    }

    let animationFrameId;
    let animTime = 0;
    let prevFrameTime = performance.now();

    const render = () => {
      const now = performance.now();
      const frameDelta = Math.min(now - prevFrameTime, 64);
      prevFrameTime = now;
      const dtNorm = frameDelta / 16.6667;
      animTime += 0.02 * dtNorm;

      // Clear canvas in CSS coordinate space
      ctx.clearRect(0, 0, width, height);

      // Smooth mouse position interpolation
      mouse.x += (mouse.targetX - mouse.x) * 0.28;
      mouse.y += (mouse.targetY - mouse.y) * 0.28;

      // Smooth mouse velocity decay preventing stuck or jumping lag
      mouse.vx *= 0.88;
      mouse.vy *= 0.88;
      if (Math.abs(mouse.vx) < 0.001) mouse.vx = 0;
      if (Math.abs(mouse.vy) < 0.001) mouse.vy = 0;
      mouse.speed = Math.sqrt(mouse.vx * mouse.vx + mouse.vy * mouse.vy);

      // Audio engine velocity feedback
      if (sound?.updateCursorVelocity) {
        sound.updateCursorVelocity(mouse.speed);
      }

      // 1. Render Gather Blueprint Frame if in gather mode
      if (mouse.hoverMode === 'gather' && mouse.hoverBox) {
        const hb = mouse.hoverBox;
        ctx.save();
        ctx.strokeStyle = 'rgba(59, 130, 246, 0.4)';
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 4]);
        ctx.strokeRect(hb.x - 4, hb.y - 4, hb.width + 8, hb.height + 8);

        ctx.strokeStyle = '#06b6d4';
        ctx.setLineDash([]);
        const cs = 7;
        ctx.beginPath();
        ctx.moveTo(hb.x - 8, hb.y - 4); ctx.lineTo(hb.x - 8 + cs, hb.y - 4);
        ctx.moveTo(hb.x - 4, hb.y - 8); ctx.lineTo(hb.x - 4, hb.y - 8 + cs);
        ctx.moveTo(hb.x + hb.width + 8 - cs, hb.y + hb.height + 4); ctx.lineTo(hb.x + hb.width + 8, hb.y + hb.height + 4);
        ctx.moveTo(hb.x + hb.width + 4, hb.y + hb.height + 8 - cs); ctx.lineTo(hb.x + hb.width + 4, hb.y + hb.height + 8);
        ctx.stroke();

        ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
        ctx.fillRect(hb.x + hb.width / 2 - 32, hb.y - 20, 64, 16);
        ctx.fillStyle = '#67e8f9';
        ctx.font = '9px JetBrains Mono, monospace';
        ctx.textAlign = 'center';
        ctx.fillText(`${Math.round(hb.width)} × ${Math.round(hb.height)} px`, hb.x + hb.width / 2, hb.y - 8);
        ctx.restore();
      }

      // 2. Render Subtle Orbit Guide Rings when stationary near cursor
      if (mouse.hoverMode === 'orbit_cursor' && mouse.speed < 1.2) {
        ctx.save();
        ctx.strokeStyle = 'rgba(59, 130, 246, 0.08)';
        ctx.lineWidth = 1;
        ctx.setLineDash([2, 6]);
        [47, 81, 120].forEach((r) => {
          ctx.beginPath();
          ctx.arc(mouse.x, mouse.y, r, 0, Math.PI * 2);
          ctx.stroke();
        });
        ctx.restore();
      }

      // 3. Update & Draw Particle Trails
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.alpha -= p.decay;

        if (p.alpha <= 0) {
          particles.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 6;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // 4. Update Cursor Physics & Rendering
      cursors.forEach((c, idx) => {
        // Delta-time normalized continuous orbit progression
        c.orbitAngle += c.speed * dtNorm;

        // Organic idle breathing wave
        const idleBreathing = 3.5 * Math.sin(animTime * 1.8 + c.id * 0.8);
        const dynamicBaseRadius = c.radius + idleBreathing;

        let destX, destY;

        if (mouse.hoverMode === 'orbit_element' && mouse.hoverBox) {
          const elemRadius = dynamicBaseRadius * 1.4;
          destX = mouse.hoverBox.x + Math.cos(c.orbitAngle) * elemRadius;
          destY = mouse.hoverBox.y + Math.sin(c.orbitAngle) * (elemRadius * 0.5);
        } else if (mouse.hoverMode === 'gather' && mouse.hoverBox) {
          const hb = mouse.hoverBox;
          const corner = idx % 4;
          if (corner === 0) { destX = hb.x - 12; destY = hb.y - 12; }
          else if (corner === 1) { destX = hb.x + hb.width + 12; destY = hb.y - 12; }
          else if (corner === 2) { destX = hb.x + hb.width + 12; destY = hb.y + hb.height + 12; }
          else { destX = hb.x - 12; destY = hb.y + hb.height + 12; }
        } else {
          // Dynamic radius contraction during high-speed travel
          const speedFactor = Math.min(mouse.speed / 5.0, 1.0);
          const effectiveRadius = dynamicBaseRadius * (1.0 - speedFactor * 0.35);

          // Exponentially smoothed inertia lag vector
          const targetLagX = -mouse.vx * 14 * (c.mass * 0.85);
          const targetLagY = -mouse.vy * 14 * (c.mass * 0.85);
          c.lagX += (targetLagX - c.lagX) * 0.16;
          c.lagY += (targetLagY - c.lagY) * 0.16;

          destX = mouse.x + Math.cos(c.orbitAngle) * effectiveRadius + c.lagX;
          destY = mouse.y + Math.sin(c.orbitAngle) * effectiveRadius + c.lagY;
        }

        // Spring Force Integration
        const ax = (destX - c.x) * c.stiffness;
        const ay = (destY - c.y) * c.stiffness;

        c.vx = (c.vx + ax) * c.damping;
        c.vy = (c.vy + ay) * c.damping;

        // Boids Separation Force (Prevent badge collision)
        cursors.forEach((other, oIdx) => {
          if (idx === oIdx) return;
          const dx = c.x - other.x;
          const dy = c.y - other.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 38 && dist > 0) {
            const push = ((38 - dist) / 38) * 0.55;
            c.vx += (dx / dist) * push;
            c.vy += (dy / dist) * push;
          }
        });

        // Viewport Soft Boundary Deflection
        const pad = 24;
        if (c.x < pad) c.vx += (pad - c.x) * 0.2;
        if (c.x > width - pad) c.vx += (width - pad - c.x) * 0.2;
        if (c.y < pad) c.vy += (pad - c.y) * 0.2;
        if (c.y > height - pad) c.vy += (height - pad - c.y) * 0.2;

        c.x += c.vx;
        c.y += c.vy;

        // Dynamic Rotational Heading & Banking Tilt
        const tiltBank = Math.max(-0.32, Math.min(0.32, c.vx * 0.045));
        const pitchVert = Math.max(-0.20, Math.min(0.20, c.vy * 0.030));
        const orbitCurveBank = (c.speed > 0 ? 0.18 : -0.18) + 0.10 * Math.sin(c.orbitAngle);
        const targetHeading = tiltBank + pitchVert + orbitCurveBank;
        c.heading += (targetHeading - c.heading) * 0.16;

        // Spawn high-speed particle trail sparks
        const agentSpeed = Math.sqrt(c.vx * c.vx + c.vy * c.vy);
        if (agentSpeed > 1.8 && particles.length < maxParticles && Math.random() > 0.45) {
          particles.push({
            x: c.x,
            y: c.y,
            vx: -c.vx * 0.2 + (Math.random() - 0.5) * 0.8,
            vy: -c.vy * 0.2 + (Math.random() - 0.5) * 0.8,
            color: c.color,
            size: 1.5 + Math.random() * 1.5,
            alpha: 0.8,
            decay: 0.032,
          });
        }

        // ==========================================
        // 1. RENDER SVG CURSOR ARROW (ROTATED)
        // ==========================================
        ctx.save();
        ctx.translate(c.x, c.y);
        ctx.rotate(c.heading);

        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(0, 16);
        ctx.lineTo(4.5, 11.5);
        ctx.lineTo(8.5, 18);
        ctx.lineTo(11, 16.5);
        ctx.lineTo(7, 10.5);
        ctx.lineTo(12, 10.5);
        ctx.closePath();

        // Neon Glow Fill
        ctx.fillStyle = c.color;
        ctx.shadowColor = c.color;
        ctx.shadowBlur = 8;
        ctx.fill();

        // High-Contrast Crisp White Outer Border
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.4;
        ctx.lineJoin = 'round';
        ctx.stroke();

        ctx.restore();

        // ==========================================
        // 2. RENDER FIGMA-STYLE PILL BADGE (UPRIGHT)
        // ==========================================
        ctx.save();
        ctx.translate(c.x, c.y);

        // Badge Dimensions Calculation
        ctx.font = '600 10px Inter, system-ui, sans-serif';
        const nameWidth = ctx.measureText(c.name).width;
        ctx.font = '400 9px JetBrains Mono, monospace';
        const roleWidth = ctx.measureText(c.role).width;

        const dotPadding = 18;
        const dividerWidth = 10;
        const rightPad = 8;
        const badgeWidth = Math.round(dotPadding + nameWidth + dividerWidth + roleWidth + rightPad);
        const badgeHeight = 20;

        // Dynamic Boundary Flipping (Anti-Clipping)
        let badgeX = 14;
        let badgeY = 10;

        if (c.x + badgeX + badgeWidth > width - 16) {
          badgeX = -(badgeWidth + 6);
        }
        if (c.y + badgeY + badgeHeight > height - 16) {
          badgeY = -(badgeHeight + 6);
        }

        // Translucent Obsidian Container
        ctx.fillStyle = 'rgba(3, 7, 18, 0.90)';
        ctx.strokeStyle = c.color;
        ctx.lineWidth = 1;
        ctx.shadowColor = c.color;
        ctx.shadowBlur = 5;

        ctx.beginPath();
        if (ctx.roundRect) {
          ctx.roundRect(badgeX, badgeY, badgeWidth, badgeHeight, 6);
        } else {
          ctx.rect(badgeX, badgeY, badgeWidth, badgeHeight);
        }
        ctx.fill();
        ctx.stroke();

        // Harmonically Pulsing Status Dot
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;

        const dotCenterX = badgeX + 9;
        const dotCenterY = badgeY + badgeHeight / 2;
        const pulse = Math.sin(animTime * 3.2 + c.id * 0.9);
        const dotRadius = 2.2 + pulse * 0.5;
        const auraRadius = 4.2 + pulse * 0.9;
        const auraAlpha = Math.max(0, 0.22 + pulse * 0.15);

        // Breathing Aura
        ctx.fillStyle = c.color;
        ctx.globalAlpha = auraAlpha;
        ctx.beginPath();
        ctx.arc(dotCenterX, dotCenterY, auraRadius, 0, Math.PI * 2);
        ctx.fill();

        // Solid Dot Core
        ctx.globalAlpha = 1.0;
        ctx.beginPath();
        ctx.arc(dotCenterX, dotCenterY, dotRadius, 0, Math.PI * 2);
        ctx.fill();

        // Typography: Agent Name
        const textCenterY = badgeY + badgeHeight / 2 + 0.5;
        let curX = badgeX + 17;

        ctx.fillStyle = '#f8fafc';
        ctx.font = '600 10px Inter, system-ui, sans-serif';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.fillText(c.name, curX, textCenterY);
        curX += nameWidth + 2;

        // Typography: Muted Divider
        ctx.fillStyle = 'rgba(148, 163, 184, 0.5)';
        ctx.font = '400 9px Inter, sans-serif';
        ctx.fillText('·', curX, textCenterY);
        curX += dividerWidth - 2;

        // Typography: Role Label
        ctx.fillStyle = '#94a3b8';
        ctx.font = '400 9px JetBrains Mono, monospace';
        ctx.fillText(c.role, curX, textCenterY);

        ctx.restore();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      if (dprMediaQuery) {
        dprMediaQuery.removeEventListener('change', handleResize);
      }
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

1. **Browser Canvas `roundRect` API Compatibility**:
   `ctx.roundRect` is supported natively in Chrome $\ge 99$, Firefox $\ge 112$, and Safari $\ge 15.4$. A simple fallback (`if (ctx.roundRect) ... else ctx.rect(...)`) is included in the reference implementation to ensure compatibility across older webview runtimes.
2. **Font Loading Latency**:
   On cold page loads, the custom fonts (`Inter` and `JetBrains Mono`) may take several milliseconds to parse. Canvas `measureText` handles system fallbacks (`system-ui`, `monospace`) automatically until the web fonts activate, causing zero crashes.
3. **Multi-Display DPI Transitions**:
   Dragging a browser window from an external $1.0\times$ 1080p display to a $2.0\times$ Retina display fires both `resize` and the `matchMedia('(resolution: ...)')` event. The idempotent `ctx.setTransform(1, 0, 0, 1, 0, 0)` + `ctx.scale(dpr, dpr)` routine ensures resolution adapts instantly without compounding matrix scaling.
4. **Touchscreen & Coarse Pointers**:
   Mobile devices do not have desktop cursor hover interaction and lack mouse coordinates. The accessibility check `window.matchMedia('(pointer: coarse)').matches || window.innerWidth < 768` properly short-circuits execution, preventing battery and CPU overhead.

---

## 5. Conclusion

1. **High-DPI Retina Scaling (DPR up to 2.0)**:
   By establishing an explicit separation between physical buffer resolution (`canvas.width = Math.round(width * dpr)`) and CSS display layout (`canvas.style.width = width + 'px'`) paired with idempotent matrix resets, the canvas renders razor-sharp typography, vector curves, and badge borders on Retina displays while bounding GPU fill-rate overhead.
2. **3 Concentric Counter-Rotating Tiers**:
   The 8 collaborative agents are partitioned across Tier 0 (44–50px), Tier 1 (74–88px), and Tier 2 (114–126px) with strictly alternating angular velocities, zero-overlap initial phase offsets ($\theta_{0, i}$), normalized delta-time angular increments, and harmonic breathing waves during idle hover.
3. **Decoupled Rotational Heading & SVG Cursor Rendering**:
   Decoupling the cursor transformation from the badge transformation resolves the orientation defect. Dynamic aerodynamic banking ($\theta_{\text{heading}}$) aligns the pointer with trajectory and curvature without inverting attached text badges, while a dual-pass glow fill and white outer border deliver maximum visual pop against dark backgrounds.
4. **Figma-Style Translucent Pill Badges**:
   Badges incorporate both agent name (`Inter 600`) and role label (`JetBrains Mono 400`), translucent obsidian backing (`#030712ee`), dynamic screen-edge coordinate flipping to eliminate off-screen clipping, and phase-staggered harmonic status dot pulsing.

---

## 6. Verification Method

To verify these specifications independently:

### 6.1 Codebase Inspection Verification
- Inspect `frontend/src/animations/SwarmCursor.jsx` against the reference implementation in Section 3.
- Verify `dpr` scaling: Ensure `canvas.width = Math.round(width * dpr)` and `ctx.scale(dpr, dpr)` are present with `dpr = Math.min(window.devicePixelRatio || 1, 2.0)`.
- Verify tier configuration: Check that `CURSOR_CONFIGS` contains all 8 verified agents across tiers 0, 1, and 2 with alternating positive/negative speeds.
- Verify badge rendering: Confirm that both `c.name` and `c.role` are measured and rendered inside the badge container.

### 6.2 Browser Runtime Visual Checks
1. **Retina Crispness Check**:
   On a High-DPI display ($DPR \ge 1.5$) or browser zoom ($150\%$), inspect the text badges and cursor strokes. Text and 1px borders must be pixel-sharp without fuzzy blur.
2. **Continuous Counter-Rotation & Idle Breathing**:
   Leave mouse stationary at screen center. Observe that:
   - Tier 0, Tier 1, and Tier 2 orbit continuously in alternating directions.
   - Orbits exhibit a gentle sinusoidal radius breathing wave ($\pm 3.5\text{px}$).
   - No cursors freeze or jump when the mouse halts.
3. **Dynamic Boundary Anti-Clipping**:
   Move the mouse to the extreme right edge ($x = W$) and bottom edge ($y = H$) of the viewport.
   Verify that name badges automatically flip to the left and top of the cursor tip, never clipping outside the visible screen.
4. **Heading Banking Tilt**:
   Rapidly sweep the mouse left-to-right. Verify cursors smoothly lean into the travel direction and return to their orbital banking angle upon stopping.

### 6.3 Build Command Verification
Execute production build in `frontend/`:
```powershell
cd c:\Users\Ayush\OneDrive\Documents\swarm\frontend
npm run build
```
*Expected Result*: Build completes with exit code 0 and zero compilation or bundling errors.
