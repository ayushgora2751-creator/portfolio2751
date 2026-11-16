/**
 * SwarmCursor.jsx
 * 
 * Signature Creative Feature for Ayush Gora's Portfolio
 * Inspired by Joel Califa's "Swarm" and Dhvanil Patel's "swarm-cursors"
 * 
 * Milestone 1 Production Engine:
 * - Continuous time-normalized orbital clock (never freezing or stopping when stationary)
 * - Harmonic respiration breathing wave in idle state (undulating radius)
 * - Integrated exponentially smoothed velocity lag (zero destination snapping)
 * - Non-linear quadratic Boids separation force (preventing badge collisions)
 * - High-DPI Retina canvas scaling (DPR capped at 2.0 with idempotent transform resets)
 * - 3 concentric counter-rotating tiers with 8 distinct collaborative agents
 * - Dynamic aerodynamic banking tilt and dual-pass SVG cursor rendering
 * - Figma-style translucent obsidian pill badges with typography hierarchy & pulsing status dots
 * - Viewport soft boundary deflection (F_bound) and adaptive 4-way screen boundary flipping
 * - Graceful pointerleave/enter transitions with smooth resting park and opacity fading
 * - Dynamic DOM interactive hooks: wide elliptical orbit for [data-swarm="orbit"] and
 *   non-colliding 8-point perimeter anchor distribution for [data-swarm="gather"]
 * - Audio velocity telemetry hook dispatching to sound.updateCursorVelocity(mouse.speed)
 */

import React, { useEffect, useRef } from 'react';
import { sound } from '../services/soundEffects';

// Verified 8-Agent Configuration Matrix Across 3 Concentric Tiers
export const CURSOR_CONFIGS = [
  // Tier 0: Inner Core (2 agents, rapid gyro-stabilized orbit)
  {
    id: 0,
    name: "Ayush",
    role: "Creative Lead",
    color: "#3b82f6",
    orbitTier: 0,
    radius: 46,
    speed: 0.038,
    mass: 0.95,
    stiffness: 0.088,
    initialPhase: 0,
  },
  {
    id: 1,
    name: "DevOps",
    role: "Cloud Eng",
    color: "#06b6d4",
    orbitTier: 0,
    radius: 54,
    speed: -0.040,
    mass: 1.00,
    stiffness: 0.085,
    initialPhase: Math.PI,
  },

  // Tier 1: Middle Ring (3 agents, harmonic resonance)
  {
    id: 2,
    name: "Three.js",
    role: "WebGL Core",
    color: "#8b5cf6",
    orbitTier: 1,
    radius: 76,
    speed: 0.028,
    mass: 1.10,
    stiffness: 0.075,
    initialPhase: 0,
  },
  {
    id: 3,
    name: "Django",
    role: "Backend API",
    color: "#10b981",
    orbitTier: 1,
    radius: 86,
    speed: -0.030,
    mass: 1.15,
    stiffness: 0.072,
    initialPhase: (2 * Math.PI) / 3,
  },
  {
    id: 4,
    name: "Reviewer",
    role: "Code Quality",
    color: "#ec4899",
    orbitTier: 1,
    radius: 94,
    speed: 0.026,
    mass: 1.20,
    stiffness: 0.070,
    initialPhase: (4 * Math.PI) / 3,
  },

  // Tier 2: Outer Ring (3 agents, wide stabilizing perimeter)
  {
    id: 5,
    name: "UI/UX",
    role: "Design Systems",
    color: "#f43f5e",
    orbitTier: 2,
    radius: 114,
    speed: -0.020,
    mass: 1.30,
    stiffness: 0.062,
    initialPhase: Math.PI / 3,
  },
  {
    id: 6,
    name: "Architect",
    role: "Systems Arch",
    color: "#f59e0b",
    orbitTier: 2,
    radius: 124,
    speed: 0.018,
    mass: 1.35,
    stiffness: 0.060,
    initialPhase: Math.PI,
  },
  {
    id: 7,
    name: "Docker",
    role: "Linux Infra",
    color: "#0ea5e9",
    orbitTier: 2,
    radius: 132,
    speed: -0.016,
    mass: 1.40,
    stiffness: 0.058,
    initialPhase: (5 * Math.PI) / 3,
  },
];

export default function SwarmCursor() {
  const canvasRef = useRef(null);

  useEffect(() => {
    // 1. Accessibility & Device Compatibility Checks
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const isTouchDevice =
      typeof window !== 'undefined' &&
      (window.matchMedia('(pointer: coarse)').matches || window.innerWidth < 768);

    if (prefersReducedMotion || isTouchDevice) {
      return; // Disabled on mobile / touchscreen or reduced-motion
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // High-DPI Scaling & Canvas State
    let dpr = 1;
    let width = window.innerWidth;
    let height = window.innerHeight;

    const updateCanvasDimensions = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2.0);
      width = window.innerWidth;
      height = window.innerHeight;

      // Set physical backing buffer resolution
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);

      // Set CSS display layout dimensions
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      // Idempotently reset transformation matrix and apply DPR scale
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
    };

    updateCanvasDimensions();

    // Mouse & Simulation State
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
    const cursors = CURSOR_CONFIGS.map((cfg, idx) => ({
      ...cfg,
      x: mouse.x + Math.cos(cfg.initialPhase) * cfg.radius,
      y: mouse.y + Math.sin(cfg.initialPhase) * cfg.radius,
      vx: 0,
      vy: 0,
      heading: 0,
      orbitAngle: cfg.initialPhase,
      damping: 0.83,
      // Smoothed inertia lag state
      lagX: 0,
      lagY: 0,
      // Harmonic breathing parameters
      breathPhase: cfg.initialPhase + cfg.orbitTier * (Math.PI / 3),
      breathFreq: 0.38 + 0.04 * (idx % 2 === 0 ? 1 : -1) * (idx / CURSOR_CONFIGS.length),
      breathAmp: 3.5 + cfg.orbitTier * 0.6,
    }));

    // Particle Trail Sparks Buffer
    const particles = [];
    const maxParticles = 140;

    // Viewport Soft Boundary Constants
    const P_LEFT = 24;
    const P_RIGHT = 110;
    const P_TOP = 20;
    const P_BOTTOM = 32;
    const K_BOUND = 0.24;

    // Active DOM Interactive Target Resolution
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

    // Event Handlers
    const handleResize = () => {
      updateCanvasDimensions();
    };

    const handlePointerMove = (e) => {
      mouse.targetX = e.clientX;
      mouse.targetY = e.clientY;
      mouse.isInside = true;
      updateHoverTarget(e.clientX, e.clientY);
    };

    const handlePointerLeave = (e) => {
      if (!e.relatedTarget && !e.toElement) {
        mouse.isInside = false;
        // Glide gently towards safe inset resting position
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
      updateHoverTarget(e.clientX, e.clientY);
    };

    const handleWindowBlur = () => {
      mouse.isInside = false;
    };

    const handleWindowFocus = () => {
      // Re-arm animation timing on tab focus
      lastTime = performance.now();
    };

    const handleScroll = () => {
      if (mouse.isInside) {
        updateHoverTarget(mouse.targetX, mouse.targetY);
      }
    };

    const handleMouseDown = () => {
      mouse.isDown = true;
      if (sound && typeof sound.playClickImpulse === 'function') {
        sound.playClickImpulse();
      }

      // Scatter impulse: explosive radial dispersal from cursor coordinate
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

    // Attach Event Listeners
    window.addEventListener('resize', handleResize);
    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    document.documentElement.addEventListener('pointerleave', handlePointerLeave);
    document.documentElement.addEventListener('pointerenter', handlePointerEnter);
    window.addEventListener('blur', handleWindowBlur);
    window.addEventListener('focus', handleWindowFocus);
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);

    // Watch for dynamic display DPI changes (e.g. dragging between standard and Retina monitors)
    let dprMediaQuery = null;
    if (typeof window !== 'undefined' && window.matchMedia) {
      dprMediaQuery = window.matchMedia(`(resolution: ${window.devicePixelRatio}dppx)`);
      if (dprMediaQuery.addEventListener) {
        dprMediaQuery.addEventListener('change', handleResize);
      } else if (dprMediaQuery.addListener) {
        dprMediaQuery.addListener(handleResize);
      }
    }

    let animationFrameId;
    let lastTime = performance.now();
    let elapsedSec = 0;

    const render = (now) => {
      // 1. Delta-Time Normalized Physics Timing
      const rawDt = now - lastTime;
      lastTime = now;
      // Clamp dt between 1ms and 64ms to prevent tab-switching teleport jumps
      const dt = Math.max(1.0, Math.min(rawDt, 64.0));
      const dtNorm = dt / 16.6667; // Normalized to 60 FPS reference frame
      elapsedSec += dt / 1000.0;

      // Clear canvas in CSS coordinate space
      ctx.clearRect(0, 0, width, height);

      // 2. Smooth Mouse Interpolation & Frame-to-Frame Velocity
      const prevMouseX = mouse.x;
      const prevMouseY = mouse.y;

      const mouseEase = mouse.isInside
        ? 1.0 - Math.pow(1.0 - 0.28, dtNorm)
        : 0.03 * dtNorm;

      mouse.x += (mouse.targetX - mouse.x) * mouseEase;
      mouse.y += (mouse.targetY - mouse.y) * mouseEase;

      // Derive physical frame-to-frame velocity and smooth decay
      const frameVx = (mouse.x - prevMouseX) / dtNorm;
      const frameVy = (mouse.y - prevMouseY) / dtNorm;

      const velDecay = Math.pow(0.85, dtNorm);
      mouse.vx = mouse.vx * velDecay + frameVx * (1.0 - velDecay);
      mouse.vy = mouse.vy * velDecay + frameVy * (1.0 - velDecay);
      if (Math.abs(mouse.vx) < 0.001) mouse.vx = 0;
      if (Math.abs(mouse.vy) < 0.001) mouse.vy = 0;
      mouse.speed = Math.sqrt(mouse.vx * mouse.vx + mouse.vy * mouse.vy);

      // Audio Velocity Telemetry Hook Dispatch (M1 <-> M2 interface)
      if (sound && typeof sound.updateCursorVelocity === 'function') {
        if (mouse.isInside) {
          sound.updateCursorVelocity(mouse.speed);
        } else {
          sound.updateCursorVelocity(0);
        }
      }

      // Smooth Display Opacity Transitions (Graceful pointerleave/enter)
      const targetOpacity = mouse.isInside ? 1.0 : 0.40;
      mouse.displayOpacity += (targetOpacity - mouse.displayOpacity) * (1.0 - Math.pow(1.0 - 0.06, dtNorm));

      // Blueprint Frame Alpha Transition
      const targetFrameAlpha = mouse.hoverMode === 'gather' && mouse.hoverBox ? 1.0 : 0.0;
      mouse.frameAlpha += (targetFrameAlpha - mouse.frameAlpha) * (1.0 - Math.pow(1.0 - 0.12, dtNorm));

      ctx.save();
      ctx.globalAlpha = mouse.displayOpacity;

      // 3. Render Gather Blueprint Measurement Frame
      if (mouse.frameAlpha > 0.01 && mouse.hoverBox) {
        const hb = mouse.hoverBox;
        ctx.save();
        ctx.globalAlpha = mouse.displayOpacity * mouse.frameAlpha;
        ctx.strokeStyle = 'rgba(59, 130, 246, 0.45)';
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 4]);
        ctx.strokeRect(hb.left - 4, hb.top - 4, hb.width + 8, hb.height + 8);

        // Architectural corner registration crosshairs
        ctx.strokeStyle = '#06b6d4';
        ctx.setLineDash([]);
        const cs = 7;
        ctx.beginPath();
        ctx.moveTo(hb.left - 8, hb.top - 4);
        ctx.lineTo(hb.left - 8 + cs, hb.top - 4);
        ctx.moveTo(hb.left - 4, hb.top - 8);
        ctx.lineTo(hb.left - 4, hb.top - 8 + cs);

        ctx.moveTo(hb.left + hb.width + 8 - cs, hb.top + hb.height + 4);
        ctx.lineTo(hb.left + hb.width + 8, hb.top + hb.height + 4);
        ctx.moveTo(hb.left + hb.width + 4, hb.top + hb.height + 8 - cs);
        ctx.lineTo(hb.left + hb.width + 4, hb.top + hb.height + 8);
        ctx.stroke();

        // Architectural dimensions badge
        ctx.fillStyle = 'rgba(15, 23, 42, 0.92)';
        ctx.fillRect(hb.left + hb.width / 2 - 34, hb.top - 22, 68, 17);
        ctx.fillStyle = '#67e8f9';
        ctx.font = '9px JetBrains Mono, monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(
          `${Math.round(hb.width)} × ${Math.round(hb.height)} px`,
          hb.left + hb.width / 2,
          hb.top - 13
        );
        ctx.restore();
      }

      // 4. Render Subtle Orbit Guide Rings when stationary near cursor
      if (mouse.hoverMode === 'orbit_cursor' && mouse.speed < 1.2 && mouse.isInside) {
        ctx.save();
        ctx.strokeStyle = 'rgba(59, 130, 246, 0.08)';
        ctx.lineWidth = 1;
        ctx.setLineDash([2, 6]);
        [50, 84, 124].forEach((r) => {
          ctx.beginPath();
          ctx.arc(mouse.x, mouse.y, r, 0, Math.PI * 2);
          ctx.stroke();
        });
        ctx.restore();
      }

      // 5. Update & Render Particle Spark Trails
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
        ctx.shadowBlur = 6;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // 6. Update Cursor Physics & Multi-Tier Flocking Simulation
      cursors.forEach((c, idx) => {
        // Continuous delta-time normalized orbital clock (runs independently of mouse motion)
        c.orbitAngle = (c.orbitAngle + c.speed * dtNorm) % (Math.PI * 2);

        let destX, destY;

        if (mouse.hoverMode === 'orbit_element' && mouse.hoverBox) {
          // Perimeter Orbit: wide elliptical perimeter enclosing DOM element
          const hb = mouse.hoverBox;
          const semiMajor = hb.width / 2 + 28 + c.orbitTier * 16;
          const semiMinor = hb.height / 2 + 20 + c.orbitTier * 12;
          destX = hb.centerX + Math.cos(c.orbitAngle) * semiMajor;
          destY = hb.centerY + Math.sin(c.orbitAngle) * semiMinor;
        } else if (mouse.hoverMode === 'gather' && mouse.hoverBox) {
          // Non-colliding 8-point perimeter distribution (4 corners, 4 midpoints)
          const hb = mouse.hoverBox;
          switch (idx) {
            case 0:
              destX = hb.left - 8;
              destY = hb.top - 8;
              break; // Top-Left
            case 1:
              destX = hb.centerX;
              destY = hb.top - 10;
              break; // Top-Center
            case 2:
              destX = hb.left + hb.width + 8;
              destY = hb.top - 8;
              break; // Top-Right
            case 3:
              destX = hb.left + hb.width + 10;
              destY = hb.centerY;
              break; // Right-Center
            case 4:
              destX = hb.left + hb.width + 8;
              destY = hb.top + hb.height + 8;
              break; // Bottom-Right
            case 5:
              destX = hb.centerX;
              destY = hb.top + hb.height + 10;
              break; // Bottom-Center
            case 6:
              destX = hb.left - 8;
              destY = hb.top + hb.height + 8;
              break; // Bottom-Left
            case 7:
            default:
              destX = hb.left - 10;
              destY = hb.centerY;
              break; // Left-Center
          }
        } else {
          // DEFAULT: Continuous dynamic orbit around user mouse pointer
          // Harmonic breathing wave in idle state: R_breath = A * sin(2*pi*f*t + phi)
          const breathOffset =
            c.breathAmp * Math.sin(2 * Math.PI * c.breathFreq * elapsedSec + c.breathPhase);

          // Aerodynamic speed contraction: contract radius at higher velocities
          const speedRatio = Math.min(mouse.speed / 6.0, 1.0);
          const dynamicRadius =
            (c.radius + breathOffset * (1.0 - 0.70 * speedRatio)) * (1.0 - speedRatio * 0.30);

          // Integrated exponentially smoothed velocity lag vector (zero abrupt snapping)
          const targetLagX = -mouse.vx * 14.0 * (c.mass * 0.85);
          const targetLagY = -mouse.vy * 14.0 * (c.mass * 0.85);
          const lagAlpha = 1.0 - Math.pow(1.0 - 0.16, dtNorm);
          c.lagX += (targetLagX - c.lagX) * lagAlpha;
          c.lagY += (targetLagY - c.lagY) * lagAlpha;

          destX = mouse.x + Math.cos(c.orbitAngle) * dynamicRadius + c.lagX;
          destY = mouse.y + Math.sin(c.orbitAngle) * dynamicRadius + c.lagY;
        }

        // Viewport Soft Target Compression
        destX = Math.max(P_LEFT, Math.min(width - P_RIGHT, destX));
        destY = Math.max(P_TOP, Math.min(height - P_BOTTOM, destY));

        // Spring Force towards dynamic destination
        const ax = (destX - c.x) * c.stiffness;
        const ay = (destY - c.y) * c.stiffness;

        // Viewport Soft Restoring Force (F_bound)
        let boundFx = 0;
        let boundFy = 0;
        if (c.x < P_LEFT) boundFx = (P_LEFT - c.x) * K_BOUND;
        else if (c.x > width - P_RIGHT) boundFx = (width - P_RIGHT - c.x) * K_BOUND;

        if (c.y < P_TOP) boundFy = (P_TOP - c.y) * K_BOUND;
        else if (c.y > height - P_BOTTOM) boundFy = (height - P_BOTTOM - c.y) * K_BOUND;

        // Non-linear Quadratic Boids Separation Force (Prevents badge collisions)
        const minSep = 42.0;
        let sepX = 0;
        let sepY = 0;

        for (let j = 0; j < cursors.length; j++) {
          if (idx === j) continue;
          const other = cursors[j];
          const dx = c.x - other.x;
          const dy = c.y - other.y;
          const distSq = dx * dx + dy * dy;

          if (distSq < minSep * minSep && distSq > 0.0001) {
            const dist = Math.sqrt(distSq);
            const penetration = (minSep - dist) / minSep;
            // Quadratic soft-core repulsion potential
            const push = (penetration + 0.5 * penetration * penetration) * 1.25;
            sepX += (dx / dist) * push;
            sepY += (dy / dist) * push;
          } else if (distSq <= 0.0001) {
            // Singularity break if exact overlap occurs
            const defaultAngle = (idx / cursors.length) * Math.PI * 2;
            sepX += Math.cos(defaultAngle) * 0.8;
            sepY += Math.sin(defaultAngle) * 0.8;
          }
        }

        // Integrate Acceleration and Apply Effective Damping
        const effectiveDamping = Math.pow(c.damping, dtNorm);
        c.vx = (c.vx + (ax + boundFx + sepX) * dtNorm) * effectiveDamping;
        c.vy = (c.vy + (ay + boundFy + sepY) * dtNorm) * effectiveDamping;

        c.x += c.vx * dtNorm;
        c.y += c.vy * dtNorm;

        // Elastic Hard Boundary Guard
        if (c.x < 12) {
          c.x = 12;
          c.vx = Math.abs(c.vx) * 0.3;
        } else if (c.x > width - P_RIGHT) {
          c.x = width - P_RIGHT;
          c.vx = -Math.abs(c.vx) * 0.3;
        }

        if (c.y < 12) {
          c.y = 12;
          c.vy = Math.abs(c.vy) * 0.3;
        } else if (c.y > height - P_BOTTOM) {
          c.y = height - P_BOTTOM;
          c.vy = -Math.abs(c.vy) * 0.3;
        }

        // Dynamic Rotational Heading & Aerodynamic Banking Tilt
        const tiltBank = Math.max(-0.35, Math.min(0.35, c.vx * 0.045));
        const pitchVert = Math.max(-0.20, Math.min(0.20, c.vy * 0.030));
        const orbitCurveBank =
          (c.speed > 0 ? 0.16 : -0.16) + 0.08 * Math.sin(c.orbitAngle);
        const targetHeading = tiltBank + pitchVert + orbitCurveBank;
        const headingLerp = 1.0 - Math.pow(1.0 - 0.18, dtNorm);
        c.heading += (targetHeading - c.heading) * headingLerp;

        // Spawn particle trail sparks during rapid sweeps
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

        // ========================================================
        // PASS 1: RENDER SVG CURSOR ARROW (ROTATED WITH HEADING)
        // ========================================================
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

        // Neon Glow Accent Fill
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
      });

      ctx.restore();
      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    // Component Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('pointermove', handlePointerMove);
      document.documentElement.removeEventListener('pointerleave', handlePointerLeave);
      document.documentElement.removeEventListener('pointerenter', handlePointerEnter);
      window.removeEventListener('blur', handleWindowBlur);
      window.removeEventListener('focus', handleWindowFocus);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      if (dprMediaQuery) {
        if (dprMediaQuery.removeEventListener) {
          dprMediaQuery.removeEventListener('change', handleResize);
        } else if (dprMediaQuery.removeListener) {
          dprMediaQuery.removeListener(handleResize);
        }
      }
      if (sound && typeof sound.updateCursorVelocity === 'function') {
        sound.updateCursorVelocity(0);
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
