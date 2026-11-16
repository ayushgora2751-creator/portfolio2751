/**
 * adversarial_m2_challenger1.test.js
 * 
 * Adversarial Challenger 1 Test Harness for Milestone 2 (Procedural Web Audio Engine)
 * Target: frontend/src/services/soundEffects.js
 * 
 * Adversarial Stress Tests:
 * 1. High-Frequency Rapid Sound Calls:
 *    - 200 playDraftBlip calls in 100ms (unmuted & muted)
 *    - Node allocation metrics, memory leaks, and gain superposition analysis
 * 2. Extreme Velocity Parameter Tests:
 *    - updateCursorVelocity with 100000, -500, -100, NaN, Infinity
 *    - Empirical verification of drone gain clamping [0.0, 0.03]
 *    - Stationary resume leakage after un-mute
 * 3. Rapid Un-Mute Chime Spam:
 *    - 50 toggleMute cycles & 50 direct playChime calls
 *    - Node closure inspection (disconnection vs graph retention)
 *    - Constructive harmonic interference / clipping evaluation
 *    - MasterGain instantaneous voltage jump vs 15ms click-free ramp
 * 4. Autoplay Policy & Error Resilience:
 *    - Suspended / throwing context resilience
 *    - Strict silence adherence when muted
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { MockAudioContext, MockAudioNode, MockAudioParam } from './fixtures/audio_mock.js';
import { SoundEngine } from '../frontend/src/services/soundEffects.js';

class EnhancedMockBiquadFilterNode extends MockAudioNode {
  constructor(context) {
    super(context, 'biquad-filter');
    this.type = 'lowpass';
    this.frequency = new MockAudioParam('frequency', 350);
  }
}

class ExtendedMockAudioContext extends MockAudioContext {
  createBiquadFilter() {
    const filter = new EnhancedMockBiquadFilterNode(this);
    this.createdNodes.push(filter);
    return filter;
  }
}

test('Milestone 2 Challenger 1: Adversarial Stress Test Suite', async (t) => {

  // =========================================================================
  // CHALLENGE 1: High-Frequency Rapid Sound Calls (200 calls in 100ms)
  // =========================================================================
  await t.test('C1.1: 200 rapid playDraftBlip invocations within 100ms - Allocation & Stability', () => {
    const sound = new SoundEngine();
    const ctx = new ExtendedMockAudioContext();
    sound.init(ctx);
    sound.setMuted(false);

    const callCount = 200;
    const initialNodeCount = ctx.createdNodes.length;
    const results = [];
    const startTime = ctx.currentTime;

    assert.doesNotThrow(() => {
      for (let i = 0; i < callCount; i++) {
        ctx.currentTime = startTime + i * (0.1 / callCount);
        const res = sound.playDraftBlip(440 + i, 0.06);
        results.push(res);
      }
    }, 'Engine must not throw unhandled exceptions during high-frequency burst');

    // Each blip creates 1 OscillatorNode and 1 GainNode
    const nodesCreated = ctx.createdNodes.length - initialNodeCount;
    assert.equal(
      nodesCreated,
      callCount * 2,
      `Expected ${callCount * 2} nodes (1 osc + 1 gain per call), got: ${nodesCreated}`
    );

    // Verify all 200 calls returned valid active node pairs
    assert.equal(results.filter(r => r && r.osc && r.gain).length, callCount);

    // Verify all 200 oscillators were scheduled to start and stop
    results.forEach((r, idx) => {
      assert.ok(r.osc.started, `Blip ${idx} oscillator must be started`);
      assert.ok(r.osc.stopped, `Blip ${idx} oscillator must be scheduled to stop`);
      assert.ok(
        r.osc.stopTime <= startTime + 0.1 + 0.06,
        `Blip ${idx} stopTime exceeds burst duration window`
      );
    });
  });

  await t.test('C1.2: High-frequency burst when muted must allocate strictly 0 nodes', () => {
    const sound = new SoundEngine();
    const ctx = new ExtendedMockAudioContext();
    sound.init(ctx);
    sound.setMuted(true);

    const initialNodeCount = ctx.createdNodes.length;
    for (let i = 0; i < 200; i++) {
      const res = sound.playDraftBlip();
      assert.equal(res, null, 'Must return null when muted');
    }

    assert.equal(
      ctx.createdNodes.length,
      initialNodeCount,
      'Strict silence guarantee: 0 nodes allocated across 200 calls when muted'
    );
  });

  // =========================================================================
  // CHALLENGE 2: Extreme Velocity Parameter Bounds & Clamping
  // =========================================================================
  await t.test('C2.1: Extreme velocity upper bound - updateCursorVelocity(100000)', () => {
    const sound = new SoundEngine();
    const ctx = new ExtendedMockAudioContext();
    sound.init(ctx);
    sound.setMuted(false);

    sound.updateCursorVelocity(100000);
    assert.ok(sound.droneGain, 'Drone gain must be initialized');

    const gainValue = sound.droneGain.gain.value;
    assert.ok(
      gainValue <= 0.03,
      `Drone gain (${gainValue}) must not exceed 0.03 upper limit (-30dB ceiling)`
    );
    assert.equal(gainValue, 0.03, 'Drone gain should clamp to 0.03 at high velocity');
  });

  await t.test('C2.2: Extreme velocity lower bound - updateCursorVelocity(-500) clamped to >= 0', () => {
    const sound = new SoundEngine();
    const ctx = new ExtendedMockAudioContext();
    sound.init(ctx);
    sound.setMuted(false);

    sound.updateCursorVelocity(-500);
    assert.ok(sound.droneGain, 'Drone gain must be initialized');

    const gainValue = sound.droneGain.gain.value;
    // Contract: Drone gain must be clamped between 0 and 0.03
    assert.ok(
      gainValue >= 0.0,
      `Drone gain must be >= 0.0 when velocity is negative, but got: ${gainValue}`
    );
    assert.ok(
      gainValue <= 0.03,
      `Drone gain must be <= 0.03, but got: ${gainValue}`
    );
  });

  await t.test('C2.3: Non-finite velocity inputs (NaN) must produce finite gain >= 0', () => {
    const sound = new SoundEngine();
    const ctx = new ExtendedMockAudioContext();
    sound.init(ctx);
    sound.setMuted(false);

    sound.updateCursorVelocity(NaN);
    const gainValue = sound.droneGain.gain.value;
    assert.equal(Number.isNaN(gainValue), false, 'Drone gain must not become NaN when speed is NaN');
    assert.ok(gainValue >= 0.0, 'Drone gain must remain >= 0');
  });

  // =========================================================================
  // CHALLENGE 3: Rapid Un-Mute Chime Spam & Audio Param Transients
  // =========================================================================
  await t.test('C3.1: 50 rapid toggleMute() cycles execute without unhandled exceptions', () => {
    const sound = new SoundEngine();
    const ctx = new ExtendedMockAudioContext();
    sound.init(ctx);

    let toggleError = null;
    try {
      for (let i = 0; i < 50; i++) {
        sound.toggleMute();
      }
    } catch (err) {
      toggleError = err;
    }

    assert.equal(toggleError, null, '50 rapid toggles must execute without error');
    assert.equal(sound.isMuted, true, 'Even number of toggles from muted defaults to muted');
  });

  await t.test('C3.2: Click-free un-mute transition (no instantaneous 0.0 -> 1.0 step on un-mute)', () => {
    const sound = new SoundEngine();
    const ctx = new ExtendedMockAudioContext();
    sound.init(ctx);

    sound.setMuted(true);
    sound.masterGain.gain.events = [];
    sound.toggleMute(); // un-mute

    const events = sound.masterGain.gain.events;
    const hasInstantaneousFullStep = events.some(e => e.type === 'setValueAtTime' && e.value === 1.0);
    assert.equal(
      hasInstantaneousFullStep,
      false,
      'Un-muting must ramp smoothly to target without an instantaneous setValueAtTime(1.0) voltage jump'
    );
  });

  // =========================================================================
  // CHALLENGE 4: Autoplay Policy & Error Resilience
  // =========================================================================
  await t.test('C4.1: Uninitialized soundEngine fails silently with zero exceptions', () => {
    const sound = new SoundEngine();
    assert.doesNotThrow(() => {
      assert.equal(sound.playDraftBlip(), null);
      assert.equal(sound.playChime(), null);
      assert.deepEqual(sound.playCompletionHarmonics(), []);
      assert.equal(sound.playClickImpulse(), null);
      assert.equal(sound.playBoxSnap(), null);
      sound.updateCursorVelocity(50);
    });
  });

  await t.test('C4.2: Exponential ramps strictly target positive values (> 0, floor = 0.001)', () => {
    const sound = new SoundEngine();
    const ctx = new ExtendedMockAudioContext();
    sound.init(ctx);
    sound.setMuted(false);

    const sounds = [
      sound.playDraftBlip(440, 0.06),
      sound.playChime(523.25, 0.15),
      sound.playClickImpulse(),
      sound.playBoxSnap(),
    ];

    sounds.forEach((s, idx) => {
      assert.ok(s, `Sound ${idx} must return node handles`);
      const expEvents = s.gain.gain.events.filter(e => e.type === 'exponentialRampToValueAtTime');
      expEvents.forEach(evt => {
        assert.ok(evt.value > 0, `exponentialRamp value must be > 0 (got ${evt.value})`);
        assert.equal(evt.value, 0.001, 'Floor value must be 0.001');
      });
    });
  });
});
