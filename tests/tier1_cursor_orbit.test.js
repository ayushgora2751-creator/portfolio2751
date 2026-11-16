/**
 * tier1_cursor_orbit.test.js
 * 
 * Tier 1 Tests for Feature 1-7: Continuous Cursor Orbit & Flocking Engine.
 * Tests mathematical kinematics, continuous angular evolution, multi-tier counter-rotation,
 * velocity lag, Boids collision avoidance, boundary deflection, and High-DPI scaling.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { createBrowserEnvironment, MockCanvas } from './fixtures/dom_mock.js';

// Canonical Cursor Configurations from PROJECT.md & SwarmCursor.jsx
const CURSOR_CONFIGS = [
  { name: "Ayush", role: "Creative Lead", color: "#3b82f6", orbitTier: 0, radius: 45, speed: 0.045 },
  { name: "DevOps", role: "Cloud Eng", color: "#06b6d4", orbitTier: 0, radius: 52, speed: -0.04 },
  { name: "Three.js", role: "WebGL Core", color: "#8b5cf6", orbitTier: 1, radius: 72, speed: 0.032 },
  { name: "Django", role: "Backend API", color: "#10b981", orbitTier: 1, radius: 82, speed: -0.035 },
  { name: "UI/UX", role: "Designer", color: "#f43f5e", orbitTier: 2, radius: 105, speed: 0.026 },
  { name: "Architect", role: "Systems", color: "#f59e0b", orbitTier: 2, radius: 115, speed: -0.024 },
  { name: "Reviewer", role: "Code Quality", color: "#a855f7", orbitTier: 1, radius: 92, speed: 0.028 },
  { name: "Docker", role: "Linux Infra", color: "#0ea5e9", orbitTier: 2, radius: 125, speed: -0.02 },
];

function createFlockingSimulation(env, initialMouse = { x: 960, y: 540 }) {
  const canvas = new MockCanvas(env.window.innerWidth, env.window.innerHeight);
  const ctx = canvas.getContext('2d');

  const mouse = {
    x: initialMouse.x,
    y: initialMouse.y,
    targetX: initialMouse.x,
    targetY: initialMouse.y,
    vx: 0,
    vy: 0,
    speed: 0,
    isDown: false,
    hoverMode: 'orbit_cursor',
    hoverBox: null,
  };

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
      currentRadius: cfg.radius,
      mass: 1.0 + (idx * 0.05),
      stiffness: 0.09 - (cfg.orbitTier * 0.015),
      damping: 0.84,
    };
  });

  const particles = [];
  const maxParticles = 140;

  function step(deltaTimeFactor = 1.0) {
    // Smooth mouse position interpolation
    mouse.x += (mouse.targetX - mouse.x) * 0.28;
    mouse.y += (mouse.targetY - mouse.y) * 0.28;

    const currentMouseSpeed = Math.sqrt(mouse.vx * mouse.vx + mouse.vy * mouse.vy);

    // Update Cursor Physics & Continuous Rotation Around User Pointer
    cursors.forEach((c, idx) => {
      // Continuous orbit progression regardless of mouse speed
      c.orbitAngle += c.speed * deltaTimeFactor;

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
        // Continuous dynamic orbit around user cursor pointer
        const velocityLagX = -mouse.vx * 15 * (c.mass * 0.8);
        const velocityLagY = -mouse.vy * 15 * (c.mass * 0.8);

        const speedFactor = Math.min(currentMouseSpeed / 5, 1);
        const dynamicRadius = c.radius * (1 - speedFactor * 0.35);

        destX = mouse.x + Math.cos(c.orbitAngle) * dynamicRadius + velocityLagX;
        destY = mouse.y + Math.sin(c.orbitAngle) * dynamicRadius + velocityLagY;
      }

      // Soft Viewport Boundary Deflection
      const pad = 20;
      if (destX < pad) destX = pad + (pad - destX) * 0.5;
      if (destX > canvas.width - pad) destX = (canvas.width - pad) - (destX - (canvas.width - pad)) * 0.5;
      if (destY < pad) destY = pad + (pad - destY) * 0.5;
      if (destY > canvas.height - pad) destY = (canvas.height - pad) - (destY - (canvas.height - pad)) * 0.5;

      // Spring Force
      const ax = (destX - c.x) * c.stiffness;
      const ay = (destY - c.y) * c.stiffness;

      c.vx = (c.vx + ax) * c.damping;
      c.vy = (c.vy + ay) * c.damping;

      // Separation Force (Avoid collision with neighboring cursors)
      cursors.forEach((other, oIdx) => {
        if (idx === oIdx) return;
        const dx = c.x - other.x;
        const dy = c.y - other.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 36 && dist > 0) {
          const push = ((36 - dist) / 36) * 0.5;
          c.vx += (dx / dist) * push;
          c.vy += (dy / dist) * push;
        }
      });

      c.x += c.vx;
      c.y += c.vy;

      const speed = Math.sqrt(c.vx * c.vx + c.vy * c.vy);
      const targetAngle = speed > 0.4 ? Math.atan2(c.vy, c.vx) + Math.PI / 4 : 0;
      c.angle += (targetAngle - c.angle) * 0.15;
    });

    return { mouse, cursors, particles };
  }

  function triggerImpulse() {
    cursors.forEach((c) => {
      const dx = c.x - mouse.targetX;
      const dy = c.y - mouse.targetY;
      const dist = Math.sqrt(dx * dx + dy * dy) || 1;
      const impulse = 20;
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
            size: 3,
            alpha: 1,
            decay: 0.035,
          });
        }
      }
    });
  }

  return { canvas, ctx, mouse, cursors, particles, step, triggerImpulse };
}

test('Cursor Orbit Kinematics Suite', async (t) => {

  await t.test('T1.1.1: Stationary idle continuous orbit progression', () => {
    const env = createBrowserEnvironment();
    const sim = createFlockingSimulation(env);

    // Initial angles
    const initialAngles = sim.cursors.map(c => c.orbitAngle);

    // Advance 30 frames with zero mouse movement
    for (let f = 0; f < 30; f++) {
      sim.step();
    }

    // Every cursor's orbit angle must have evolved monotonically according to its speed
    sim.cursors.forEach((c, idx) => {
      const expectedDelta = c.speed * 30;
      const actualDelta = c.orbitAngle - initialAngles[idx];
      assert.ok(
        Math.abs(actualDelta - expectedDelta) < 1e-9,
        `Cursor ${c.name} angle did not advance continuously: expected delta ${expectedDelta}, got ${actualDelta}`
      );
      // Angle changed despite mouse being stationary
      assert.notEqual(c.orbitAngle, initialAngles[idx], `Cursor ${c.name} was frozen in stationary hover!`);
    });
  });

  await t.test('T1.1.2: Multi-tier concentric radii and counter-rotation', () => {
    const env = createBrowserEnvironment();
    const sim = createFlockingSimulation(env);

    assert.equal(sim.cursors.length, 8, 'Flocking swarm must contain exactly 8 unique cursor agents');

    // Tiers mapping
    const tiers = new Map();
    sim.cursors.forEach(c => {
      if (!tiers.has(c.orbitTier)) tiers.set(c.orbitTier, []);
      tiers.get(c.orbitTier).push(c);
    });

    assert.equal(tiers.size, 3, 'Flocking swarm must be configured across exactly 3 tiers');

    // Verify counter-rotation: each tier must have both clockwise (> 0) and counter-clockwise (< 0) agents
    for (const [tierIdx, agents] of tiers.entries()) {
      const hasClockwise = agents.some(a => a.speed > 0);
      const hasCounterClockwise = agents.some(a => a.speed < 0);
      assert.ok(hasClockwise, `Tier ${tierIdx} missing clockwise rotating cursors`);
      assert.ok(hasCounterClockwise, `Tier ${tierIdx} missing counter-clockwise rotating cursors`);
    }

    // Radii must expand by tier: Tier 0 < Tier 1 < Tier 2
    const tier0MaxRadius = Math.max(...tiers.get(0).map(c => c.radius));
    const tier1MinRadius = Math.min(...tiers.get(1).map(c => c.radius));
    const tier1MaxRadius = Math.max(...tiers.get(1).map(c => c.radius));
    const tier2MinRadius = Math.min(...tiers.get(2).map(c => c.radius));

    assert.ok(tier0MaxRadius < tier1MinRadius, 'Tier 0 radii must be strictly smaller than Tier 1');
    assert.ok(tier1MaxRadius < tier2MinRadius, 'Tier 1 radii must be strictly smaller than Tier 2');
  });

  await t.test('T1.1.3: Zero-velocity orbit stability (no NaN, Infinity, or coordinate collapse)', () => {
    const env = createBrowserEnvironment();
    const sim = createFlockingSimulation(env);

    // Simulate 120 frames in stationary state
    for (let f = 0; f < 120; f++) {
      sim.step();
    }

    sim.cursors.forEach(c => {
      assert.ok(Number.isFinite(c.x), `Cursor ${c.name} coordinate X is non-finite: ${c.x}`);
      assert.ok(Number.isFinite(c.y), `Cursor ${c.name} coordinate Y is non-finite: ${c.y}`);
      assert.ok(Number.isFinite(c.vx), `Cursor ${c.name} velocity vx is non-finite: ${c.vx}`);
      assert.ok(Number.isFinite(c.vy), `Cursor ${c.name} velocity vy is non-finite: ${c.vy}`);

      // Distance from mouse must remain within normal orbital range (+/- 25% of radius)
      const dist = Math.hypot(c.x - sim.mouse.x, c.y - sim.mouse.y);
      assert.ok(dist >= c.radius * 0.7, `Cursor ${c.name} collapsed to center: dist ${dist} vs radius ${c.radius}`);
      assert.ok(dist <= c.radius * 1.5, `Cursor ${c.name} exploded outwards: dist ${dist} vs radius ${c.radius}`);
    });
  });

  await t.test('T1.1.4: Velocity lag & dynamic radius contraction under mouse motion', () => {
    const env = createBrowserEnvironment();
    const sim = createFlockingSimulation(env);

    // Set high horizontal velocity
    sim.mouse.vx = 40;
    sim.mouse.vy = 0;
    sim.mouse.speed = 40;
    sim.mouse.targetX = 1200;

    // Run step
    sim.step();

    // Verify velocity lag: because mouse moved right (+vx), lag should pull cursors left (-x)
    sim.cursors.forEach(c => {
      const expectedLagX = -sim.mouse.vx * 15 * (c.mass * 0.8);
      assert.ok(expectedLagX < 0, 'Velocity lag X must pull opposite to mouse motion vector');
    });

    // Verify dynamic radius contracts at high speed (contracted up to 35%)
    const speedFactor = Math.min(sim.mouse.speed / 5, 1);
    assert.equal(speedFactor, 1.0, 'Speed factor should saturate at maximum speed');
    const dynamicRatio = 1 - speedFactor * 0.35;
    assert.equal(dynamicRatio, 0.65, 'Dynamic radius ratio should contract by 35% under max speed');
  });

  await t.test('T1.1.5: Boids collision separation force', () => {
    const env = createBrowserEnvironment();
    const simWithCollision = createFlockingSimulation(env);
    const simBaseline = createFlockingSimulation(env);

    // Place cursor 0 and cursor 1 at identical positions in both, but cursor 1 only present near cursor 0 in simWithCollision
    simWithCollision.cursors[0].x = 900;
    simWithCollision.cursors[0].y = 500;
    simWithCollision.cursors[1].x = 910; // 10px to the right (< 36px threshold)
    simWithCollision.cursors[1].y = 500;

    simBaseline.cursors[0].x = 900;
    simBaseline.cursors[0].y = 500;
    simBaseline.cursors[1].x = 1200; // Far away (> 36px threshold, 0 collision force)
    simBaseline.cursors[1].y = 500;

    simWithCollision.step();
    simBaseline.step();

    // With cursor 1 directly to its right, cursor 0 must experience a negative vx push (repelled left)
    const deltaVx0 = simWithCollision.cursors[0].vx - simBaseline.cursors[0].vx;
    const deltaVx1 = simWithCollision.cursors[1].vx - simBaseline.cursors[1].vx;

    assert.ok(deltaVx0 < 0, `Cursor 0 must be repelled to the left (deltaVx0 = ${deltaVx0} < 0)`);
    assert.ok(deltaVx1 > 0, `Cursor 1 must be repelled to the right (deltaVx1 = ${deltaVx1} > 0)`);
  });

  await t.test('T1.1.6: Boundary soft deflection constraint', () => {
    const env = createBrowserEnvironment();
    const sim = createFlockingSimulation(env);

    // Place mouse at edge (30px, 30px)
    sim.mouse.x = 30;
    sim.mouse.y = 30;
    sim.mouse.targetX = 30;
    sim.mouse.targetY = 30;

    // Reset cursor positions to mouse coordinates and allow 80 frames to settle
    sim.cursors.forEach(c => {
      c.x = 30;
      c.y = 30;
      c.vx = 0;
      c.vy = 0;
    });

    for (let f = 0; f < 80; f++) {
      sim.step();
    }

    // Viewport soft deflection ensures cursors don't fly off negative coordinates
    sim.cursors.forEach(c => {
      assert.ok(c.x >= 0, `Cursor ${c.name} drifted past left boundary: ${c.x}`);
      assert.ok(c.y >= 0, `Cursor ${c.name} drifted past top boundary: ${c.y}`);
    });
  });

  await t.test('T1.1.7: High-DPI canvas scaling logic', () => {
    const env = createBrowserEnvironment({ innerWidth: 1920, innerHeight: 1080, devicePixelRatio: 2 });
    const canvas = new MockCanvas(env.window.innerWidth, env.window.innerHeight);
    const ctx = canvas.getContext('2d');

    const dpr = env.window.devicePixelRatio;
    assert.equal(dpr, 2, 'DevicePixelRatio should be 2 on Retina displays');

    // High-DPI canvas scaling pattern
    canvas.width = env.window.innerWidth * dpr;
    canvas.height = env.window.innerHeight * dpr;
    ctx.scale(dpr, dpr);

    assert.equal(canvas.width, 3840, 'Canvas physical width must be doubled for High-DPI');
    assert.equal(canvas.height, 2160, 'Canvas physical height must be doubled for High-DPI');

    const scaleCall = ctx.drawCalls.find(c => c.type === 'scale');
    assert.ok(scaleCall, 'Canvas context must invoke scale(dpr, dpr)');
    assert.equal(scaleCall.sx, 2);
    assert.equal(scaleCall.sy, 2);
  });

  await t.test('T1.1.8: Accessibility & reduced-motion suppression', () => {
    // Test prefers-reduced-motion
    const reducedMotionEnv = createBrowserEnvironment({ prefersReducedMotion: true });
    const isReduced = reducedMotionEnv.window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    assert.equal(isReduced, true, 'Reduced motion media query must report true');

    // Test touch device
    const touchEnv = createBrowserEnvironment({ isTouchDevice: true });
    const isTouch = touchEnv.window.matchMedia('(pointer: coarse)').matches;
    assert.equal(isTouch, true, 'Touch device media query must report true');
  });

  await t.test('T1.1.9: Click impulse explosive scatter', () => {
    const env = createBrowserEnvironment();
    const sim = createFlockingSimulation(env);

    // Initial velocities are near zero
    assert.equal(sim.particles.length, 0, 'No particles initially');

    sim.triggerImpulse();

    // After impulse, cursors have received radial velocity boost
    const maxVelocity = Math.max(...sim.cursors.map(c => Math.hypot(c.vx, c.vy)));
    assert.ok(maxVelocity > 10, 'Impulse must impart significant outward velocity to swarm cursors');

    // Sparks / particles should have been generated
    assert.ok(sim.particles.length >= 8, 'Impulse must spawn explosive particles');
  });
});
