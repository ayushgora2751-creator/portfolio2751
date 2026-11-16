/**
 * Standalone Adversarial Verification & Stress-Test Harness for SwarmCursor.jsx
 * 
 * Verifies:
 * 1. Monotonic continuous orbit progression when stationary (mouse.speed = 0)
 * 2. Sudden halt from high velocity (vx = 2000px/s) - checking for discontinuous snapping
 * 3. Framerate invariance across 15, 60, 120, 240 FPS simulation ticks
 * 4. Singularity edge-case (distance = 0) and extreme velocity bounding
 */

export const CURSOR_CONFIGS = [
  { id: 0, name: "Ayush", role: "Creative Lead", color: "#3b82f6", orbitTier: 0, radius: 46, speed: 0.038, mass: 0.95, stiffness: 0.088, initialPhase: 0 },
  { id: 1, name: "DevOps", role: "Cloud Eng", color: "#06b6d4", orbitTier: 0, radius: 54, speed: -0.040, mass: 1.00, stiffness: 0.085, initialPhase: Math.PI },
  { id: 2, name: "Three.js", role: "WebGL Core", color: "#8b5cf6", orbitTier: 1, radius: 76, speed: 0.028, mass: 1.10, stiffness: 0.075, initialPhase: 0 },
  { id: 3, name: "Django", role: "Backend API", color: "#10b981", orbitTier: 1, radius: 86, speed: -0.030, mass: 1.15, stiffness: 0.072, initialPhase: (2 * Math.PI) / 3 },
  { id: 4, name: "Reviewer", role: "Code Quality", color: "#ec4899", orbitTier: 1, radius: 94, speed: 0.026, mass: 1.20, stiffness: 0.070, initialPhase: (4 * Math.PI) / 3 },
  { id: 5, name: "UI/UX", role: "Design Systems", color: "#f43f5e", orbitTier: 2, radius: 114, speed: -0.020, mass: 1.30, stiffness: 0.062, initialPhase: Math.PI / 3 },
  { id: 6, name: "Architect", role: "Systems Arch", color: "#f59e0b", orbitTier: 2, radius: 124, speed: 0.018, mass: 1.35, stiffness: 0.060, initialPhase: Math.PI },
  { id: 7, name: "Docker", role: "Linux Infra", color: "#0ea5e9", orbitTier: 2, radius: 132, speed: -0.016, mass: 1.40, stiffness: 0.058, initialPhase: (5 * Math.PI) / 3 },
];

export function createSimulationInstance(width = 1920, height = 1080) {
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
    hoverMode: 'orbit_cursor',
    hoverBox: null,
  };

  const cursors = CURSOR_CONFIGS.map((cfg, idx) => ({
    ...cfg,
    x: mouse.x + Math.cos(cfg.initialPhase) * cfg.radius,
    y: mouse.y + Math.sin(cfg.initialPhase) * cfg.radius,
    vx: 0,
    vy: 0,
    heading: 0,
    orbitAngle: cfg.initialPhase,
    unwrappedAngle: cfg.initialPhase,
    damping: 0.83,
    lagX: 0,
    lagY: 0,
    breathPhase: cfg.initialPhase + cfg.orbitTier * (Math.PI / 3),
    breathFreq: 0.38 + 0.04 * (idx % 2 === 0 ? 1 : -1) * (idx / CURSOR_CONFIGS.length),
    breathAmp: 3.5 + cfg.orbitTier * 0.6,
  }));

  const P_LEFT = 24;
  const P_RIGHT = 110;
  const P_TOP = 20;
  const P_BOTTOM = 32;
  const K_BOUND = 0.24;

  let elapsedSec = 0;

  function step(rawDt) {
    const dt = Math.max(1.0, Math.min(rawDt, 64.0));
    const dtNorm = dt / 16.6667;
    elapsedSec += dt / 1000.0;

    const prevMouseX = mouse.x;
    const prevMouseY = mouse.y;

    const mouseEase = mouse.isInside
      ? 1.0 - Math.pow(1.0 - 0.28, dtNorm)
      : 0.03 * dtNorm;

    mouse.x += (mouse.targetX - mouse.x) * mouseEase;
    mouse.y += (mouse.targetY - mouse.y) * mouseEase;

    const frameVx = (mouse.x - prevMouseX) / dtNorm;
    const frameVy = (mouse.y - prevMouseY) / dtNorm;

    const velDecay = Math.pow(0.85, dtNorm);
    mouse.vx = mouse.vx * velDecay + frameVx * (1.0 - velDecay);
    mouse.vy = mouse.vy * velDecay + frameVy * (1.0 - velDecay);
    if (Math.abs(mouse.vx) < 0.001) mouse.vx = 0;
    if (Math.abs(mouse.vy) < 0.001) mouse.vy = 0;
    mouse.speed = Math.sqrt(mouse.vx * mouse.vx + mouse.vy * mouse.vy);

    // Cursors simulation
    cursors.forEach((c, idx) => {
      const prevAngle = c.orbitAngle;
      c.orbitAngle = (c.orbitAngle + c.speed * dtNorm) % (Math.PI * 2);
      c.unwrappedAngle += c.speed * dtNorm;

      let destX, destY;
      if (mouse.hoverMode === 'orbit_cursor') {
        const breathOffset = c.breathAmp * Math.sin(2 * Math.PI * c.breathFreq * elapsedSec + c.breathPhase);
        const speedRatio = Math.min(mouse.speed / 6.0, 1.0);
        const dynamicRadius = (c.radius + breathOffset * (1.0 - 0.70 * speedRatio)) * (1.0 - speedRatio * 0.30);

        const targetLagX = -mouse.vx * 14.0 * (c.mass * 0.85);
        const targetLagY = -mouse.vy * 14.0 * (c.mass * 0.85);
        const lagAlpha = 1.0 - Math.pow(1.0 - 0.16, dtNorm);
        c.lagX += (targetLagX - c.lagX) * lagAlpha;
        c.lagY += (targetLagY - c.lagY) * lagAlpha;

        destX = mouse.x + Math.cos(c.orbitAngle) * dynamicRadius + c.lagX;
        destY = mouse.y + Math.sin(c.orbitAngle) * dynamicRadius + c.lagY;
      }

      destX = Math.max(P_LEFT, Math.min(width - P_RIGHT, destX));
      destY = Math.max(P_TOP, Math.min(height - P_BOTTOM, destY));

      const ax = (destX - c.x) * c.stiffness;
      const ay = (destY - c.y) * c.stiffness;

      let boundFx = 0;
      let boundFy = 0;
      if (c.x < P_LEFT) boundFx = (P_LEFT - c.x) * K_BOUND;
      else if (c.x > width - P_RIGHT) boundFx = (width - P_RIGHT - c.x) * K_BOUND;

      if (c.y < P_TOP) boundFy = (P_TOP - c.y) * K_BOUND;
      else if (c.y > height - P_BOTTOM) boundFy = (height - P_BOTTOM - c.y) * K_BOUND;

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
          const push = (penetration + 0.5 * penetration * penetration) * 1.25;
          sepX += (dx / dist) * push;
          sepY += (dy / dist) * push;
        } else if (distSq <= 0.0001) {
          const defaultAngle = (idx / cursors.length) * Math.PI * 2;
          sepX += Math.cos(defaultAngle) * 0.8;
          sepY += Math.sin(defaultAngle) * 0.8;
        }
      }

      const effectiveDamping = Math.pow(c.damping, dtNorm);
      c.vx = (c.vx + (ax + boundFx + sepX) * dtNorm) * effectiveDamping;
      c.vy = (c.vy + (ay + boundFy + sepY) * dtNorm) * effectiveDamping;

      c.x += c.vx * dtNorm;
      c.y += c.vy * dtNorm;

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
    });

    return { mouse, cursors, dtNorm, elapsedSec };
  }

  return { mouse, cursors, step };
}
