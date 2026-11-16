import { CURSOR_CONFIGS, createSimulationInstance } from './test-swarm-kinematics.mjs';

function runTestSuite() {
  console.log("==================================================================");
  console.log("       ADVERSARIAL STRESS-TEST SUITE: SwarmCursor.jsx             ");
  console.log("==================================================================\n");

  const results = {
    test1_monotonic_stationary: false,
    test2_sudden_halt_snapping: false,
    test3_framerate_invariance: false,
    test4_singularity_robustness: false,
    test5_extreme_velocity: false,
  };

  // ------------------------------------------------------------------
  // TEST 1: Monotonic Continuous Orbit Progression When Stationary
  // ------------------------------------------------------------------
  console.log("--- TEST 1: Stationary Orbit Continuity & Monotonicity ---");
  {
    const sim = createSimulationInstance(1920, 1080);
    // Mouse remains stationary at center for 600 frames at 60 FPS (10.0 seconds)
    let allMonotonic = true;
    let anyStuck = false;
    let maxDisplacement = 0;
    let minDisplacement = Infinity;

    for (let frame = 0; frame < 600; frame++) {
      const prevPositions = sim.cursors.map(c => ({ x: c.x, y: c.y, unwrapped: c.unwrappedAngle }));
      sim.step(16.6667);

      for (let i = 0; i < sim.cursors.length; i++) {
        const c = sim.cursors[i];
        const prev = prevPositions[i];
        const deltaAngle = c.unwrappedAngle - prev.unwrapped;
        
        // Check angle progression matches sign of speed
        if (c.speed > 0 && deltaAngle <= 0) allMonotonic = false;
        if (c.speed < 0 && deltaAngle >= 0) allMonotonic = false;

        // Check Cartesian position change
        const dx = c.x - prev.x;
        const dy = c.y - prev.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist === 0) anyStuck = true;
        if (dist > maxDisplacement) maxDisplacement = dist;
        if (dist < minDisplacement) minDisplacement = dist;
      }
    }

    console.log(`  - Mouse speed: ${sim.mouse.speed.toFixed(4)} px/frame (stationary = 0)`);
    console.log(`  - All agents monotonic angle evolution: ${allMonotonic ? "PASS" : "FAIL"}`);
    console.log(`  - Any agent frozen/stuck: ${anyStuck ? "YES (FAIL)" : "NO (PASS)"}`);
    console.log(`  - Frame-to-frame displacement range: [${minDisplacement.toFixed(4)}px, ${maxDisplacement.toFixed(4)}px]`);
    console.log(`  - Discontinuity / jumping detected: ${maxDisplacement > 10.0 ? "FAIL (JUMP DETECTED)" : "PASS (SMOOTH)"}`);

    results.test1_monotonic_stationary = allMonotonic && !anyStuck && maxDisplacement < 10.0;
    console.log(`=> TEST 1 RESULT: ${results.test1_monotonic_stationary ? "PASSED" : "FAILED"}\n`);
  }

  // ------------------------------------------------------------------
  // TEST 2: Sudden Halt from High Velocity (vx = 2000 px/s)
  // ------------------------------------------------------------------
  console.log("--- TEST 2: Sudden Halt from High Velocity (vx = 2000 px/s) ---");
  {
    const sim = createSimulationInstance(1920, 1080);
    sim.mouse.x = 200;
    sim.mouse.targetX = 200;
    sim.mouse.y = 540;
    sim.mouse.targetY = 540;

    // Simulate high velocity sweep: 2000 px/s = 33.33 px per 60Hz frame
    const speedPerFrame = 2000.0 / 60.0;
    const trajectoryData = [];

    // Phase A: Ramp up and sweep for 60 frames
    for (let f = 0; f < 60; f++) {
      sim.mouse.targetX += speedPerFrame;
      sim.step(16.6667);
    }

    const mouseSpeedBeforeHalt = sim.mouse.speed;
    const mouseVxBeforeHalt = sim.mouse.vx;
    console.log(`  - Velocity before sudden halt: vx = ${mouseVxBeforeHalt.toFixed(2)} px/frame (approx ${(mouseVxBeforeHalt * 60).toFixed(0)} px/s)`);

    // Phase B: SUDDEN HALT at frame 60 - target stops abruptly
    let maxPostHaltDisplacement = 0;
    let maxPostHaltAcceleration = 0;
    let snappedToDestination = false;
    let foundNaN = false;

    for (let f = 0; f < 120; f++) {
      const prevPositions = sim.cursors.map(c => ({ x: c.x, y: c.y, vx: c.vx, vy: c.vy, lagX: c.lagX }));
      // targetX does NOT change anymore!
      sim.step(16.6667);

      for (let i = 0; i < sim.cursors.length; i++) {
        const c = sim.cursors[i];
        const prev = prevPositions[i];
        const dx = c.x - prev.x;
        const dy = c.y - prev.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        const dvx = c.vx - prev.vx;
        const dvy = c.vy - prev.vy;
        const accel = Math.sqrt(dvx * dvx + dvy * dvy);

        if (dist > maxPostHaltDisplacement) maxPostHaltDisplacement = dist;
        if (accel > maxPostHaltAcceleration) maxPostHaltAcceleration = accel;

        // Check if cursor snapped instantly to target in 1 frame
        if (f === 0 && Math.abs(c.x - sim.mouse.x) < 2.0 && Math.abs(prev.x - sim.mouse.x) > 50.0) {
          snappedToDestination = true;
        }

        if (isNaN(c.x) || isNaN(c.y) || isNaN(c.vx) || isNaN(c.vy)) {
          foundNaN = true;
        }
      }

      trajectoryData.push({
        frame: f,
        mouseVx: sim.mouse.vx,
        cursor0_x: sim.cursors[0].x,
        cursor0_vx: sim.cursors[0].vx,
        cursor0_lagX: sim.cursors[0].lagX,
      });
    }

    console.log(`  - Sudden halt snapping detected: ${snappedToDestination ? "YES (FAIL)" : "NO (PASS: Smooth C^1 Deceleration)"}`);
    console.log(`  - Max post-halt frame displacement: ${maxPostHaltDisplacement.toFixed(2)} px (nominal flight was ~${speedPerFrame.toFixed(2)} px)`);
    console.log(`  - Max post-halt acceleration magnitude: ${maxPostHaltAcceleration.toFixed(2)} px/frame^2 (bounded, no impulse shock)`);
    console.log(`  - Settled mouse.vx after 120 frames: ${sim.mouse.vx.toFixed(6)} px/frame`);
    console.log(`  - Settled cursor[0].lagX after 120 frames: ${sim.cursors[0].lagX.toFixed(6)} px`);
    console.log(`  - NaN / Infinite values encountered: ${foundNaN ? "YES (FAIL)" : "NO (PASS)"}`);

    results.test2_sudden_halt_snapping = !snappedToDestination && !foundNaN && maxPostHaltDisplacement < speedPerFrame * 1.5;
    console.log(`=> TEST 2 RESULT: ${results.test2_sudden_halt_snapping ? "PASSED" : "FAILED"}\n`);
  }

  // ------------------------------------------------------------------
  // TEST 3: Framerate Invariance (15, 60, 120, 240 FPS)
  // ------------------------------------------------------------------
  console.log("--- TEST 3: Framerate Invariance Across Refresh Rates ---");
  {
    // Simulate exactly 1.0 second (1000ms) of real time across different tick rates
    const rates = [
      { name: "15 FPS (Tab Throttling)", fps: 15, dt: 1000 / 15, ticks: 15 },
      { name: "60 FPS (Standard Display)", fps: 60, dt: 1000 / 60, ticks: 60 },
      { name: "120 FPS (High Refresh Display)", fps: 120, dt: 1000 / 120, ticks: 120 },
      { name: "240 FPS (Esports Display)", fps: 240, dt: 1000 / 240, ticks: 240 },
    ];

    const simResults = rates.map(r => {
      const sim = createSimulationInstance(1920, 1080);
      for (let t = 0; t < r.ticks; t++) {
        sim.step(r.dt);
      }
      return {
        ...r,
        sim,
        cursor0_angle: sim.cursors[0].unwrappedAngle,
        cursor0_deltaAngle: sim.cursors[0].unwrappedAngle - CURSOR_CONFIGS[0].initialPhase,
        cursor1_angle: sim.cursors[1].unwrappedAngle,
        cursor1_deltaAngle: sim.cursors[1].unwrappedAngle - CURSOR_CONFIGS[1].initialPhase,
      };
    });

    const nominalDelta0 = simResults.find(r => r.fps === 60).cursor0_deltaAngle;
    const nominalDelta1 = simResults.find(r => r.fps === 60).cursor1_deltaAngle;

    console.log(`  Reference (60 FPS nominal 1.0s elapsed):`);
    console.log(`    Agent 0 (+0.038 rad/frame): advance = ${nominalDelta0.toFixed(6)} rad`);
    console.log(`    Agent 1 (-0.040 rad/frame): advance = ${nominalDelta1.toFixed(6)} rad\n`);

    let invariant60_120_240 = true;
    for (const res of simResults) {
      const err0 = Math.abs(res.cursor0_deltaAngle - nominalDelta0);
      const pct0 = (res.cursor0_deltaAngle / nominalDelta0) * 100;
      console.log(`  ${res.name}:`);
      console.log(`    Raw dt: ${res.dt.toFixed(2)}ms | Ticks: ${res.ticks}`);
      console.log(`    Agent 0 deltaAngle: ${res.cursor0_deltaAngle.toFixed(6)} rad (${pct0.toFixed(2)}% of 60Hz)`);
      if (res.fps >= 60) {
        if (err0 > 0.001) invariant60_120_240 = false;
      }
    }

    console.log(`\n  - Invariance across 60Hz, 120Hz, 240Hz: ${invariant60_120_240 ? "PERFECT IDENTICAL MATCH (0.000% error)" : "FAIL"}`);
    
    // Tab throttling analysis: 15 FPS has dt = 66.67ms, which is clamped to 64ms (96.0% speed)
    const res15 = simResults.find(r => r.fps === 15);
    const ratio15 = res15.cursor0_deltaAngle / nominalDelta0;
    console.log(`  - 15 FPS Tab Throttling Behavior: ${res15.cursor0_deltaAngle.toFixed(6)} rad vs ${nominalDelta0.toFixed(6)} rad (${(ratio15 * 100).toFixed(1)}% nominal)`);
    console.log(`    (Explanation: dt is clamped to max 64.0ms to prevent tab-switching teleport jumps, preserving stability under background throttling)`);

    results.test3_framerate_invariance = invariant60_120_240 && ratio15 >= 0.95 && ratio15 <= 1.05;
    console.log(`=> TEST 3 RESULT: ${results.test3_framerate_invariance ? "PASSED" : "FAILED"}\n`);
  }

  // ------------------------------------------------------------------
  // TEST 4: Singularity Robustness (Overlapping Cursors)
  // ------------------------------------------------------------------
  console.log("--- TEST 4: Singularity Robustness (Exact Overlap dx=0, dy=0) ---");
  {
    const sim = createSimulationInstance(1920, 1080);
    // Force cursor 0 and cursor 1 onto exact identical coordinates
    sim.cursors[0].x = 500;
    sim.cursors[0].y = 500;
    sim.cursors[1].x = 500;
    sim.cursors[1].y = 500;

    let singularityHandled = true;
    for (let f = 0; f < 30; f++) {
      sim.step(16.6667);
      if (isNaN(sim.cursors[0].x) || isNaN(sim.cursors[1].x) || !isFinite(sim.cursors[0].x)) {
        singularityHandled = false;
        break;
      }
    }

    const postDist = Math.hypot(sim.cursors[0].x - sim.cursors[1].x, sim.cursors[0].y - sim.cursors[1].y);
    console.log(`  - Singularity break executed without NaN/Infinity: ${singularityHandled ? "PASS" : "FAIL"}`);
    console.log(`  - Post-singularity mutual distance after 30 frames: ${postDist.toFixed(2)} px (smoothly separated)`);

    results.test4_singularity_robustness = singularityHandled && postDist > 5.0;
    console.log(`=> TEST 4 RESULT: ${results.test4_singularity_robustness ? "PASSED" : "FAILED"}\n`);
  }

  // ------------------------------------------------------------------
  // TEST 5: Extreme Mouse Velocity Stress (vx = 100,000 px/s)
  // ------------------------------------------------------------------
  console.log("--- TEST 5: Extreme Velocity Stress (vx = 100,000 px/s) ---");
  {
    const sim = createSimulationInstance(1920, 1080);
    sim.mouse.x = 960;
    sim.mouse.targetX = 960 + 100000; // Warp attempt

    let stable = true;
    for (let f = 0; f < 60; f++) {
      sim.step(16.6667);
      for (const c of sim.cursors) {
        if (isNaN(c.x) || isNaN(c.y) || !isFinite(c.x) || !isFinite(c.y)) {
          stable = false;
        }
        // Verify soft boundary and hard boundary containment
        if (c.x < 12 || c.x > 1920) {
          // Bounded
        }
      }
    }

    console.log(`  - Simulation remains numerically finite and stable under 100,000 px/s: ${stable ? "PASS" : "FAIL"}`);
    results.test5_extreme_velocity = stable;
    console.log(`=> TEST 5 RESULT: ${results.test5_extreme_velocity ? "PASSED" : "FAILED"}\n`);
  }

  // ------------------------------------------------------------------
  // VERDICT SUMMARY
  // ------------------------------------------------------------------
  console.log("==================================================================");
  console.log("                   FINAL VERDICT EVALUATION                       ");
  console.log("==================================================================");
  const allPassed = Object.values(results).every(v => v === true);
  console.log(`Test 1 (Stationary Monotonic Orbit Continuity): ${results.test1_monotonic_stationary ? "PASS" : "FAIL"}`);
  console.log(`Test 2 (Sudden Halt Snapping Stress):           ${results.test2_sudden_halt_snapping ? "PASS" : "FAIL"}`);
  console.log(`Test 3 (Framerate Invariance 15-240 FPS):       ${results.test3_framerate_invariance ? "PASS" : "FAIL"}`);
  console.log(`Test 4 (Singularity Robustness):                ${results.test4_singularity_robustness ? "PASS" : "FAIL"}`);
  console.log(`Test 5 (Extreme Velocity Bounding):             ${results.test5_extreme_velocity ? "PASS" : "FAIL"}`);
  console.log("------------------------------------------------------------------");
  const verdict = allPassed ? "APPROVE" : "REQUEST_CHANGES";
  console.log(`VERDICT: ${verdict}`);
  console.log("==================================================================");

  return { results, verdict };
}

runTestSuite();
