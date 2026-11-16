/**
 * SwarmCursor.jsx (Proposed Implementation for Milestone 1)
 * 
 * Signature Creative Feature for Ayush Gora's Portfolio
 * Inspired by Joel Califa's "Swarm" and Dhvanil Patel's "swarm-cursors"
 * 
 * Milestone 1 Enhancements:
 * 1. Delta-time normalized rotation clock ensuring continuous orbit regardless of mouse speed.
 * 2. Harmonic breathing sinusoidal wave during stationary idle state.
 * 3. Smoothed inertia lag vector preventing snapping on sudden mouse halt.
 * 4. Boids mutual separation force preventing badge collisions.
 * 5. DevicePixelRatio High-DPI canvas scaling for crisp Retina rendering.
 * 6. Soft viewport boundary deflection keeping cursors and badges in view.
 * 7. Velocity-responsive audio hook integration (sound.updateCursorVelocity).
 */

import React, { useEffect, useRef } from 'react';
import { sound } from '../services/soundEffects';

const CURSOR_CONFIGS = [
  // Tier 0: Inner Core (2 agents, fast gyro-stabilized orbit)
  { name: "Ayush", role: "Creative Lead", color: "#3b82f6", bg: "rgba(59, 130, 246, 0.2)", orbitTier: 0, radius: 46, speed: 0.038 },
  { name: "DevOps", role: "Cloud Eng", color: "#06b6d4", bg: "rgba(6, 182, 212, 0.2)", orbitTier: 0, radius: 54, speed: -0.040 },
  // Tier 1: Middle Ring (3 agents, harmonic resonance)
  { name: "Three.js", role: "WebGL Core", color: "#8b5cf6", bg: "rgba(139, 92, 246, 0.2)", orbitTier: 1, radius: 78, speed: 0.028 },
  { name: "Django", role: "Backend API", color: "#10b981", bg: "rgba(16, 185, 129, 0.2)", orbitTier: 1, radius: 88, speed: -0.030 },
  { name: "Reviewer", role: "Code Quality", color: "#ec4899", bg: "rgba(236, 72, 153, 0.2)", orbitTier: 1, radius: 96, speed: 0.026 },
  // Tier 2: Outer Ring (3 agents, wide stabilizing perimeter)
  { name: "UI/UX", role: "Designer", color: "#f43f5e", bg: "rgba(244, 63, 94, 0.2)", orbitTier: 2, radius: 114, speed: -0.020 },
  { name: "Architect", role: "Systems", color: "#f59e0b", bg: "rgba(245, 158, 11, 0.2)", orbitTier: 2, radius: 124, speed: 0.018 },
  { name: "Docker", role: "Linux Infra", color: "#0ea5e9", bg: "rgba(14, 165, 233, 0.2)", orbitTier: 2, radius: 134, speed: -0.016 },
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

    // High-DPI (Retina) scaling setup
    let dpr = Math.min(window.devicePixelRatio || 1, 2);
    let width = window.innerWidth;
    let height = window.innerHeight;

    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.scale(dpr, dpr);

    // Mouse & State tracking
    const mouse = {
      x: width / 2,
      y: height / 2,
      targetX: width / 2,
      targetY: height / 2,
      vx: 0,
      vy: 0,
      speed: 0,
      isDown: false,
      hoverMode: 'orbit_cursor', // 'orbit_cursor' (default) | 'orbit_element' | 'gather'
      hoverBox: null,
      isOffscreen: false,
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
        orbitAngle: angle,
        tilt: 0,
        mass: 1.0 + (cfg.orbitTier * 0.25),
        stiffness: 0.09 - (cfg.orbitTier * 0.015),
        damping: 0.82,
        // Smoothed inertia lag vector state
        lagX: 0,
        lagY: 0,
        // Harmonic breathing parameters
        breathPhase: (idx * (Math.PI * 2 / CURSOR_CONFIGS.length)) + (cfg.orbitTier * (Math.PI / 3)),
        breathFreq: 0.38 + 0.04 * (idx % 2 === 0 ? 1 : -1) * (idx / CURSOR_CONFIGS.length),
        breathAmp: 3.5 + cfg.orbitTier * 0.6,
      };
    });

    // Particle Trail Buffer
    const particles = [];
    const maxParticles = 140;

    const handleResize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.scale(dpr, dpr);
    };

    const handlePointerMove = (e) => {
      mouse.targetX = e.clientX;
      mouse.targetY = e.clientY;
      mouse.isOffscreen = false;

      // Inspect hover target
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

    const handlePointerLeave = () => {
      mouse.isOffscreen = true;
    };

    const handleMouseDown = () => {
      mouse.isDown = true;
      if (sound && typeof sound.playClickImpulse === 'function') {
        sound.playClickImpulse();
      }

      // Scatter impulse: explosive burst from cursor center
      cursors.forEach((c) => {
        const dx = c.x - mouse.x;
        const dy = c.y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        const impulse = 16 + Math.random() * 10;
        c.vx += (dx / dist) * impulse;
        c.vy += (dy / dist) * impulse;

        for (let i = 0; i < 5; i++) {
          if (particles.length < maxParticles) {
            particles.push({
              x: c.x,
              y: c.y,
              vx: (Math.random() - 0.5) * 8,
              vy: (Math.random() - 0.5) * 8,
              color: c.color,
              size: 2 + Math.random() * 2.5,
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
    document.addEventListener('pointerleave', handlePointerLeave);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);

    let animationFrameId;
    let lastTime = performance.now();
    let elapsedSec = 0;

    const render = (now) => {
      // 1. Delta-time normalized timing calculation
      const rawDt = now - lastTime;
      lastTime = now;
      // Clamp dt between 1ms and 64ms to prevent tab-switching jumps
      const dt = Math.max(1.0, Math.min(rawDt, 64.0));
      const dtNorm = dt / 16.6667; // Normalized to 60 FPS reference
      elapsedSec += dt / 1000.0;

      ctx.clearRect(0, 0, width, height);

      // 2. Smooth mouse position interpolation & velocity calculation
      const prevMouseX = mouse.x;
      const prevMouseY = mouse.y;

      const mouseLerpFactor = 1.0 - Math.pow(1.0 - 0.32, dtNorm);
      mouse.x += (mouse.targetX - mouse.x) * mouseLerpFactor;
      mouse.y += (mouse.targetY - mouse.y) * mouseLerpFactor;

      mouse.vx = (mouse.x - prevMouseX) / dtNorm;
      mouse.vy = (mouse.y - prevMouseY) / dtNorm;
      mouse.speed = Math.sqrt(mouse.vx * mouse.vx + mouse.vy * mouse.vy);

      // Audio velocity feedback (M1 <-> M2 interface)
      if (sound && typeof sound.updateCursorVelocity === 'function') {
        sound.updateCursorVelocity(mouse.speed);
      }

      // 3. Draw Gather Blueprint Frame if in 'gather' mode
      if (mouse.hoverMode === 'gather' && mouse.hoverBox) {
        const hb = mouse.hoverBox;
        ctx.save();
        ctx.strokeStyle = 'rgba(59, 130, 246, 0.4)';
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 4]);
        ctx.strokeRect(hb.x - 4, hb.y - 4, hb.width + 8, hb.height + 8);

        // Corner crosshairs
        ctx.strokeStyle = '#06b6d4';
        ctx.setLineDash([]);
        const cs = 7;
        ctx.beginPath();
        ctx.moveTo(hb.x - 8, hb.y - 4); ctx.lineTo(hb.x - 8 + cs, hb.y - 4);
        ctx.moveTo(hb.x - 4, hb.y - 8); ctx.lineTo(hb.x - 4, hb.y - 8 + cs);
        ctx.moveTo(hb.x + hb.width + 8 - cs, hb.y + hb.height + 4); ctx.lineTo(hb.x + hb.width + 8, hb.y + hb.height + 4);
        ctx.moveTo(hb.x + hb.width + 4, hb.y + hb.height + 8 - cs); ctx.lineTo(hb.x + hb.width + 4, hb.y + hb.height + 8);
        ctx.stroke();

        // Dimensions badge
        ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
        ctx.fillRect(hb.x + hb.width / 2 - 32, hb.y - 20, 64, 16);
        ctx.fillStyle = '#67e8f9';
        ctx.font = '9px JetBrains Mono, monospace';
        ctx.textAlign = 'center';
        ctx.fillText(`${Math.round(hb.width)} × ${Math.round(hb.height)} px`, hb.x + hb.width / 2, hb.y - 8);
        ctx.restore();
      }

      // 4. Draw Subtle Orbit Guide Rings when stationary near cursor
      if (mouse.hoverMode === 'orbit_cursor' && mouse.speed < 1.5) {
        ctx.save();
        ctx.strokeStyle = 'rgba(59, 130, 246, 0.08)';
        ctx.lineWidth = 1;
        ctx.setLineDash([2, 6]);
        [50, 84, 124].forEach(r => {
          ctx.beginPath();
          ctx.arc(mouse.x, mouse.y, r, 0, Math.PI * 2);
          ctx.stroke();
        });
        ctx.restore();
      }

      // 5. Update & Draw Particle Trails
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
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 6;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // 6. Update Cursor Physics & Continuous Orbital Rotation
      cursors.forEach((c, idx) => {
        // Algorithm 1: Continuous delta-time normalized angular rotation
        c.orbitAngle = (c.orbitAngle + c.speed * dtNorm) % (Math.PI * 2);

        let destX, destY;

        if (mouse.hoverMode === 'orbit_element' && mouse.hoverBox) {
          const elemRadius = c.radius * 1.5;
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
          // Algorithm 2: Harmonic breathing oscillation in idle state
          // R_breath = A * sin(2 * PI * f * t + phi)
          const breathOffset = c.breathAmp * Math.sin(2 * Math.PI * c.breathFreq * elapsedSec + c.breathPhase);

          // Aerodynamic speed contraction: contract radius at higher velocities
          const speedRatio = Math.min(mouse.speed / 6.0, 1.0);
          const dynamicRadius = (c.radius + breathOffset * (1.0 - 0.7 * speedRatio)) * (1.0 - speedRatio * 0.30);

          // Algorithm 3: Smoothed inertia lag vector preventing snapping on sudden halt
          const targetLagX = -mouse.vx * 14.0 * c.mass;
          const targetLagY = -mouse.vy * 14.0 * c.mass;

          const lagAlpha = 1.0 - Math.pow(1.0 - 0.15, dtNorm);
          c.lagX += (targetLagX - c.lagX) * lagAlpha;
          c.lagY += (targetLagY - c.lagY) * lagAlpha;

          destX = mouse.x + Math.cos(c.orbitAngle) * dynamicRadius + c.lagX;
          destY = mouse.y + Math.sin(c.orbitAngle) * dynamicRadius + c.lagY;
        }

        // Soft Viewport Boundary Deflection
        const padLeft = 20;
        const padTop = 20;
        const padRight = 95; // room for name badge width
        const padBottom = 35; // room for badge height

        if (destX < padLeft) destX += (padLeft - destX) * 0.35;
        if (destX > width - padRight) destX += (width - padRight - destX) * 0.35;
        if (destY < padTop) destY += (padTop - destY) * 0.35;
        if (destY > height - padBottom) destY += (height - padBottom - destY) * 0.35;

        // Spring acceleration towards dynamic destination
        const ax = (destX - c.x) * c.stiffness;
        const ay = (destY - c.y) * c.stiffness;

        const effectiveDamping = Math.pow(c.damping, dtNorm);
        c.vx = (c.vx + ax * dtNorm) * effectiveDamping;
        c.vy = (c.vy + ay * dtNorm) * effectiveDamping;

        // Algorithm 4: Boids mutual separation force preventing badge collisions
        const minSep = 42.0; // Minimal center-to-center separation hull
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
            // Quadratic soft-core repulsion force
            const push = (penetration + 0.5 * penetration * penetration) * 1.25;
            sepX += (dx / dist) * push;
            sepY += (dy / dist) * push;
          } else if (distSq <= 0.0001) {
            // Singularity guard if exact overlap occurs
            const defaultAngle = (idx / cursors.length) * Math.PI * 2;
            sepX += Math.cos(defaultAngle) * 0.8;
            sepY += Math.sin(defaultAngle) * 0.8;
          }
        }

        c.vx += sepX * dtNorm;
        c.vy += sepY * dtNorm;

        c.x += c.vx * dtNorm;
        c.y += c.vy * dtNorm;

        // Dynamic banking tilt into motion direction
        const targetTilt = Math.max(-0.35, Math.min(0.35, c.vx * 0.045));
        const tiltLerp = 1.0 - Math.pow(1.0 - 0.20, dtNorm);
        c.tilt += (targetTilt - c.tilt) * tiltLerp;

        // Particle trail sparks during high velocity movements
        const agentSpeed = Math.sqrt(c.vx * c.vx + c.vy * c.vy);
        if (agentSpeed > 1.8 && particles.length < maxParticles && Math.random() > 0.45) {
          particles.push({
            x: c.x,
            y: c.y,
            vx: -c.vx * 0.2 + (Math.random() - 0.5) * 0.7,
            vy: -c.vy * 0.2 + (Math.random() - 0.5) * 0.7,
            color: c.color,
            size: 1.5 + Math.random() * 1.5,
            alpha: 0.8,
            decay: 0.03,
          });
        }

        // Render Cursor Agent
        ctx.save();
        ctx.translate(c.x, c.y);
        ctx.rotate(c.tilt);

        // 1. Sleek SVG Cursor Arrow
        ctx.fillStyle = c.color;
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.5;
        ctx.shadowColor = c.color;
        ctx.shadowBlur = 9;

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

        // 2. Modern Multiplayer Name Badge
        const labelText = c.name;
        ctx.font = '10px Inter, system-ui, sans-serif';
        const textWidth = ctx.measureText(labelText).width;
        const badgeWidth = textWidth + 18;
        const badgeHeight = 18;
        const badgeX = 13;
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

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('pointermove', handlePointerMove);
      document.removeEventListener('pointerleave', handlePointerLeave);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
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
