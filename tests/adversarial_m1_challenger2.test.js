/**
 * adversarial_m1_challenger2.test.js
 * 
 * Adversarial Challenger 2 Test Harness for Milestone 1 (SwarmCursor.jsx)
 * 
 * Stress-tests SwarmCursor against extreme edge cases & physical boundaries:
 * 1. Corner Entrapment: Cursor held at all 4 corners (0,0), (W,0), (0,H), (W,H).
 *    Empirically verifies all 8 cursors and their Figma badges/arrows never clip off-screen.
 * 2. Collision Singularity: All 8 cursors initialized at identical coordinates (500, 500).
 *    Empirically verifies singularity deflection without NaN, Infinity, or coordinate explosion.
 * 3. Rapid Pointerleave/Pointerenter Lifecycle: Rapid alternating exits and distant entries.
 *    Empirically verifies velocity stability, lack of discontinuous teleportation, and bounded kinetics.
 */

import test from 'node:test';
import assert from 'node:assert/strict';

// Exact configurations from SwarmCursor.jsx
const CURSOR_CONFIGS = [
  { id: 0, name: "Ayush", role: "Creative Lead", color: "#3b82f6", orbitTier: 0, radius: 46, speed: 0.038, mass: 0.95, stiffness: 0.088, initialPhase: 0 },
  { id: 1, name: "DevOps", role: "Cloud Eng", color: "#06b6d4", orbitTier: 0, radius: 54, speed: -0.040, mass: 1.00, stiffness: 0.085, initialPhase: Math.PI },
  { id: 2, name: "Three.js", role: "WebGL Core", color: "#8b5cf6", orbitTier: 1, radius: 76, speed: 0.028, mass: 1.10, stiffness: 0.075, initialPhase: 0 },
  { id: 3, name: "Django", role: "Backend API", color: "#10b981", orbitTier: 1, radius: 86, speed: -0.030, mass: 1.15, stiffness: 0.072, initialPhase: (2 * Math.PI) / 3 },
  { id: 4, name: "Reviewer", role: "Code Quality", color: "#ec4899", orbitTier: 1, radius: 94, speed: 0.026, mass: 1.20, stiffness: 0.070, initialPhase: (4 * Math.PI) / 3 },
  { id: 5, name: "UI/UX", role: "Design Systems", color: "#f43f5e", orbitTier: 2, radius: 114, speed: -0.020, mass: 1.30, stiffness: 0.062, initialPhase: Math.PI / 3 },
  { id: 6, name: "Architect", role: "Systems Arch", color: "#f59e0b", orbitTier: 2, radius: 124, speed: 0.018, mass: 1.35, stiffness: 0.060, initialPhase: Math.PI },
  { id: 7, name: "Docker", role: "Linux Infra", color: "#0ea5e9", orbitTier: 2, radius: 132, speed: -0.016, mass: 1.40, stiffness: 0.058, initialPhase: (5 * Math.PI) / 3 },
];

export function createSwarmSimulation(width = 1920, height = 1080, customInit = null) {
  const P_LEFT = 24;
  const P_RIGHT = 110;
  const P_TOP = 20;
  const P_BOTTOM = 32;
  const K_BOUND = 0.24;

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

  let cursors = CURSOR_CONFIGS.map((cfg, idx) => ({
    ...cfg,
    x: mouse.x + Math.cos(cfg.initialPhase) * cfg.radius,
    y: mouse.y + Math.sin(cfg.initialPhase) * cfg.radius,
    vx: 0,
    vy: 0,
    heading: 0,
    orbitAngle: cfg.initialPhase,
    damping: 0.83,
    lagX: 0,
    lagY: 0,
    breathPhase: cfg.initialPhase + cfg.orbitTier * (Math.PI / 3),
    breathFreq: 0.38 + 0.04 * (idx % 2 === 0 ? 1 : -1) * (idx / CURSOR_CONFIGS.length),
    breathAmp: 3.5 + cfg.orbitTier * 0.6,
  }));

  if (customInit) {
    cursors = customInit(cursors, mouse);
  }

  let elapsedSec = 0;
  const audioCalls = [];
  const soundMock = {
    updateCursorVelocity(s) {
      audioCalls.push(s);
    }
  };

  function step(dtMs = 16.6667) {
    const dt = Math.max(1.0, Math.min(dtMs, 64.0));
    const dtNorm = dt / 16.6667;
    elapsedSec += dt / 1000.0;

    // Mouse ease
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

    // Audio velocity update
    if (mouse.isInside) {
      soundMock.updateCursorVelocity(mouse.speed);
    } else {
      soundMock.updateCursorVelocity(0);
    }

    // Display Opacity
    const targetOpacity = mouse.isInside ? 1.0 : 0.40;
    mouse.displayOpacity += (targetOpacity - mouse.displayOpacity) * (1.0 - Math.pow(1.0 - 0.06, dtNorm));

    // Update cursors
    cursors.forEach((c, idx) => {
      c.orbitAngle = (c.orbitAngle + c.speed * dtNorm) % (Math.PI * 2);

      let destX, destY;
      if (mouse.hoverMode === 'orbit_element' && mouse.hoverBox) {
        const hb = mouse.hoverBox;
        const semiMajor = hb.width / 2 + 28 + c.orbitTier * 16;
        const semiMinor = hb.height / 2 + 20 + c.orbitTier * 12;
        destX = hb.centerX + Math.cos(c.orbitAngle) * semiMajor;
        destY = hb.centerY + Math.sin(c.orbitAngle) * semiMinor;
      } else if (mouse.hoverMode === 'gather' && mouse.hoverBox) {
        const hb = mouse.hoverBox;
        switch (idx) {
          case 0: destX = hb.left - 8; destY = hb.top - 8; break;
          case 1: destX = hb.centerX; destY = hb.top - 10; break;
          case 2: destX = hb.left + hb.width + 8; destY = hb.top - 8; break;
          case 3: destX = hb.left + hb.width + 10; destY = hb.centerY; break;
          case 4: destX = hb.left + hb.width + 8; destY = hb.top + hb.height + 8; break;
          case 5: destX = hb.centerX; destY = hb.top + hb.height + 10; break;
          case 6: destX = hb.left - 8; destY = hb.top + hb.height + 8; break;
          case 7:
          default: destX = hb.left - 10; destY = hb.centerY; break;
        }
      } else {
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

      const tiltBank = Math.max(-0.35, Math.min(0.35, c.vx * 0.045));
      const pitchVert = Math.max(-0.20, Math.min(0.20, c.vy * 0.030));
      const orbitCurveBank = (c.speed > 0 ? 0.16 : -0.16) + 0.08 * Math.sin(c.orbitAngle);
      const targetHeading = tiltBank + pitchVert + orbitCurveBank;
      const headingLerp = 1.0 - Math.pow(1.0 - 0.18, dtNorm);
      c.heading += (targetHeading - c.heading) * headingLerp;
    });

    return { mouse, cursors, elapsedSec, audioCalls };
  }

  function getRenderBounds(cursor) {
    const arrowVerts = [
      [0, 0], [0, 16], [4.5, 11.5], [8.5, 18], [11, 16.5], [7, 10.5], [12, 10.5]
    ];
    const cosH = Math.cos(cursor.heading);
    const sinH = Math.sin(cursor.heading);
    let minArrowX = Infinity, maxArrowX = -Infinity;
    let minArrowY = Infinity, maxArrowY = -Infinity;

    for (const [vx, vy] of arrowVerts) {
      const rx = cursor.x + vx * cosH - vy * sinH;
      const ry = cursor.y + vx * sinH + vy * cosH;
      if (rx < minArrowX) minArrowX = rx;
      if (rx > maxArrowX) maxArrowX = rx;
      if (ry < minArrowY) minArrowY = ry;
      if (ry > maxArrowY) maxArrowY = ry;
    }

    const nameWidth = cursor.name.length * 6.5;
    const roleWidth = cursor.role.length * 5.5;
    const dotPadding = 18;
    const dividerWidth = 10;
    const rightPad = 8;
    const badgeWidth = Math.round(dotPadding + nameWidth + dividerWidth + roleWidth + rightPad);
    const badgeHeight = 20;

    let badgeX = 14;
    let badgeY = 10;
    if (cursor.x + badgeX + badgeWidth > width - 16) {
      badgeX = -(badgeWidth + 6);
    }
    if (cursor.y + badgeY + badgeHeight > height - 16) {
      badgeY = -(badgeHeight + 6);
    }
    if (cursor.x + badgeX < 12) {
      badgeX = 12 - cursor.x;
    }
    if (cursor.y + badgeY < 12) {
      badgeY = 12 - cursor.y;
    }

    const badgeBounds = {
      left: cursor.x + badgeX,
      top: cursor.y + badgeY,
      right: cursor.x + badgeX + badgeWidth,
      bottom: cursor.y + badgeY + badgeHeight,
      width: badgeWidth,
      height: badgeHeight,
    };

    return {
      arrow: { minX: minArrowX, maxX: maxArrowX, minY: minArrowY, maxY: maxArrowY },
      badge: badgeBounds,
    };
  }

  function pointerLeave() {
    mouse.isInside = false;
    mouse.targetX = Math.max(160, Math.min(width - 160, mouse.x));
    mouse.targetY = Math.max(120, Math.min(height - 120, mouse.y));
  }

  function pointerEnter(clientX, clientY) {
    mouse.isInside = true;
    mouse.targetX = clientX;
    mouse.targetY = clientY;
    mouse.vx = 0;
    mouse.vy = 0;
    mouse.speed = 0;
  }

  return { mouse, cursors, step, getRenderBounds, pointerLeave, pointerEnter, audioCalls };
}

test('Challenger 2 Adversarial Stress Suite', async (t) => {

  // =========================================================================
  // CHALLENGE 1: CORNER ENTRAPMENT VERIFICATION
  // =========================================================================
  await t.test('Challenge 1: Corner entrapment — (0, 0), (W, 0), (0, H), (W, H)', () => {
    const W = 1920;
    const H = 1080;
    const corners = [
      { name: 'Top-Left (0, 0)', x: 0, y: 0 },
      { name: 'Top-Right (W, 0)', x: W, y: 0 },
      { name: 'Bottom-Left (0, H)', x: 0, y: H },
      { name: 'Bottom-Right (W, H)', x: W, y: H },
    ];

    for (const corner of corners) {
      const sim = createSwarmSimulation(W, H);
      sim.mouse.x = corner.x;
      sim.mouse.y = corner.y;
      sim.mouse.targetX = corner.x;
      sim.mouse.targetY = corner.y;

      sim.cursors.forEach((c) => {
        c.x = Math.max(12, Math.min(W - 110, corner.x));
        c.y = Math.max(12, Math.min(H - 32, corner.y));
        c.vx = 0;
        c.vy = 0;
      });

      for (let frame = 0; frame < 180; frame++) {
        sim.step(16.6667);

        for (const c of sim.cursors) {
          assert.ok(Number.isFinite(c.x), `Corner ${corner.name} produced non-finite X: ${c.x}`);
          assert.ok(Number.isFinite(c.y), `Corner ${corner.name} produced non-finite Y: ${c.y}`);
          assert.ok(Number.isFinite(c.vx), `Corner ${corner.name} produced non-finite vx: ${c.vx}`);
          assert.ok(Number.isFinite(c.vy), `Corner ${corner.name} produced non-finite vy: ${c.vy}`);

          assert.ok(c.x >= 12, `Cursor tip ${c.name} breached left boundary: ${c.x} < 12 at ${corner.name}`);
          assert.ok(c.x <= W - 20, `Cursor tip ${c.name} breached right boundary: ${c.x} > ${W - 20} at ${corner.name}`);
          assert.ok(c.y >= 12, `Cursor tip ${c.name} breached top boundary: ${c.y} < 12 at ${corner.name}`);
          assert.ok(c.y <= H - 20, `Cursor tip ${c.name} breached bottom boundary: ${c.y} > ${H - 20} at ${corner.name}`);

          const { arrow, badge } = sim.getRenderBounds(c);

          assert.ok(arrow.minX >= -1.0, `Arrow ${c.name} clipped left edge at ${corner.name}: minX = ${arrow.minX}`);
          assert.ok(arrow.maxX <= W + 1.0, `Arrow ${c.name} clipped right edge at ${corner.name}: maxX = ${arrow.maxX}`);
          assert.ok(arrow.minY >= -1.0, `Arrow ${c.name} clipped top edge at ${corner.name}: minY = ${arrow.minY}`);
          assert.ok(arrow.maxY <= H + 1.0, `Arrow ${c.name} clipped bottom edge at ${corner.name}: maxY = ${arrow.maxY}`);

          assert.ok(badge.left >= 0, `Badge ${c.name} clipped left edge at ${corner.name}: left = ${badge.left}`);
          assert.ok(badge.right <= W + 1.0, `Badge ${c.name} clipped right edge at ${corner.name}: right = ${badge.right}`);
          assert.ok(badge.top >= 0, `Badge ${c.name} clipped top edge at ${corner.name}: top = ${badge.top}`);
          assert.ok(badge.bottom <= H + 1.0, `Badge ${c.name} clipped bottom edge at ${corner.name}: bottom = ${badge.bottom}`);
        }
      }
    }
  });

  // =========================================================================
  // CHALLENGE 2: COLLISION SINGULARITY STRESS
  // =========================================================================
  await t.test('Challenge 2: Collision singularity stress — all 8 cursors at (500, 500)', () => {
    const W = 1920;
    const H = 1080;
    const sim = createSwarmSimulation(W, H, (cursors, mouse) => {
      mouse.x = 500.0;
      mouse.y = 500.0;
      mouse.targetX = 500.0;
      mouse.targetY = 500.0;
      return cursors.map(c => ({
        ...c,
        x: 500.0000000,
        y: 500.0000000,
        vx: 0,
        vy: 0,
        heading: 0,
        lagX: 0,
        lagY: 0,
      }));
    });

    for (let i = 0; i < sim.cursors.length; i++) {
      for (let j = i + 1; j < sim.cursors.length; j++) {
        const dx = sim.cursors[i].x - sim.cursors[j].x;
        const dy = sim.cursors[i].y - sim.cursors[j].y;
        assert.equal(dx * dx + dy * dy, 0, 'Must be exact singularity initially');
      }
    }

    sim.step(16.6667);

    const postStepDistances = [];
    sim.cursors.forEach((c, idx) => {
      assert.ok(Number.isFinite(c.x), `Cursor ${c.name} has non-finite X after singularity break: ${c.x}`);
      assert.ok(Number.isFinite(c.y), `Cursor ${c.name} has non-finite Y after singularity break: ${c.y}`);
      assert.ok(Number.isFinite(c.vx), `Cursor ${c.name} has non-finite vx after singularity break: ${c.vx}`);
      assert.ok(Number.isFinite(c.vy), `Cursor ${c.name} has non-finite vy after singularity break: ${c.vy}`);

      for (let j = idx + 1; j < sim.cursors.length; j++) {
        const other = sim.cursors[j];
        const dist = Math.hypot(c.x - other.x, c.y - other.y);
        postStepDistances.push(dist);
      }
    });

    const minDistStep1 = Math.min(...postStepDistances);
    assert.ok(minDistStep1 > 0.05, `Singularity break failed to separate cursors: minDist = ${minDistStep1}`);

    const angles = sim.cursors.map(c => Math.atan2(c.vy, c.vx));
    const uniqueAngleSectors = new Set(angles.map(a => Math.round((a * 180) / Math.PI / 45)));
    assert.ok(uniqueAngleSectors.size >= 4, `Deflection directions must disperse radially into multiple sectors (found ${uniqueAngleSectors.size})`);

    for (let f = 0; f < 300; f++) {
      sim.step(16.6667);
      for (const c of sim.cursors) {
        assert.ok(!Number.isNaN(c.x) && !Number.isNaN(c.y), `NaN emerged at frame ${f}`);
        assert.ok(!Number.isNaN(c.vx) && !Number.isNaN(c.vy), `NaN velocity at frame ${f}`);
        assert.ok(Math.abs(c.x) < 5000, `Coordinate X exploded to ${c.x}`);
        assert.ok(Math.abs(c.y) < 5000, `Coordinate Y exploded to ${c.y}`);
      }
    }

    sim.cursors.forEach(c => {
      const distFromCenter = Math.hypot(c.x - sim.mouse.x, c.y - sim.mouse.y);
      assert.ok(distFromCenter >= c.radius * 0.7 && distFromCenter <= c.radius * 1.6,
        `Cursor ${c.name} failed to reach stable orbit: dist = ${distFromCenter}, radius = ${c.radius}`);
    });
  });

  // =========================================================================
  // CHALLENGE 3: RAPID POINTERLEAVE / POINTERENTER LIFECYCLE STRESS
  // =========================================================================
  await t.test('Challenge 3: Pointer lifecycle stress — rapid exits and distant entries', () => {
    const W = 1920;
    const H = 1080;
    const sim = createSwarmSimulation(W, H);

    for (let f = 0; f < 60; f++) sim.step();

    const entryTargets = [
      { x: 50, y: 50 },
      { x: W - 100, y: H - 80 },
      { x: W - 100, y: 50 },
      { x: 50, y: H - 80 },
      { x: W / 2, y: H / 2 },
    ];

    let maxObservedCursorSpeed = 0;
    let maxObservedMouseSpeed = 0;

    for (let cycle = 0; cycle < 25; cycle++) {
      sim.pointerLeave();
      assert.equal(sim.mouse.isInside, false, 'Mouse must be outside on pointerLeave');

      sim.step(16.6667);
      sim.step(16.6667);

      assert.ok(sim.mouse.displayOpacity < 1.0, `Display opacity should decay when outside: ${sim.mouse.displayOpacity}`);

      const target = entryTargets[cycle % entryTargets.length];
      sim.pointerEnter(target.x, target.y);
      assert.equal(sim.mouse.isInside, true, 'Mouse must be inside on pointerEnter');
      assert.equal(sim.mouse.vx, 0, 'Mouse vx must be reset to 0 on pointerEnter');
      assert.equal(sim.mouse.vy, 0, 'Mouse vy must be reset to 0 on pointerEnter');

      for (let post = 0; post < 12; post++) {
        sim.step(16.6667);

        maxObservedMouseSpeed = Math.max(maxObservedMouseSpeed, sim.mouse.speed);

        sim.cursors.forEach(c => {
          const speed = Math.hypot(c.vx, c.vy);
          maxObservedCursorSpeed = Math.max(maxObservedCursorSpeed, speed);

          assert.ok(Number.isFinite(c.x), `Non-finite c.x on cycle ${cycle}`);
          assert.ok(Number.isFinite(c.y), `Non-finite c.y on cycle ${cycle}`);
          assert.ok(Number.isFinite(c.vx), `Non-finite c.vx on cycle ${cycle}`);
          assert.ok(Number.isFinite(c.vy), `Non-finite c.vy on cycle ${cycle}`);

          assert.ok(c.x >= 12 && c.x <= W - 20, `Cursor ${c.name} X escaped viewport: ${c.x}`);
          assert.ok(c.y >= 12 && c.y <= H - 20, `Cursor ${c.name} Y escaped viewport: ${c.y}`);
        });
      }
    }

    // Velocity stays bounded under maximum physical transit limits (< 200 px/frame) and never explodes to infinity
    assert.ok(maxObservedCursorSpeed < 200, `Cursor velocity exploded to ${maxObservedCursorSpeed} px/frame!`);
    assert.ok(maxObservedMouseSpeed < 250, `Mouse velocity calculation exploded to ${maxObservedMouseSpeed}`);

    assert.ok(sim.audioCalls.length > 50, 'Audio telemetry must be dispatched continually');
    for (const val of sim.audioCalls) {
      assert.ok(Number.isFinite(val), `Audio received non-finite speed: ${val}`);
      assert.ok(val >= 0, `Audio received negative speed: ${val}`);
    }
  });

  // =========================================================================
  // ADDITIONAL ADVERSARIAL STRESS: FRAME TIME DRIFT & EXTREME DELTA T
  // =========================================================================
  await t.test('Adversarial: Extreme frame delta time clamping (1ms, 64ms, 500ms tab sleep)', () => {
    const W = 1920;
    const H = 1080;
    const sim = createSwarmSimulation(W, H);

    for (let i = 0; i < 50; i++) {
      sim.step(1.0);
    }
    sim.cursors.forEach(c => {
      assert.ok(Number.isFinite(c.x) && Number.isFinite(c.y));
    });

    sim.step(500.0);
    sim.cursors.forEach(c => {
      assert.ok(Number.isFinite(c.x) && Number.isFinite(c.y));
      const speed = Math.hypot(c.vx, c.vy);
      assert.ok(speed < 50, `Speed exploded after tab sleep: ${speed}`);
    });
  });
});
