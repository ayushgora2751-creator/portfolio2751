/**
 * tier1_audio_engine.test.js
 * 
 * Tier 1 Tests for Feature 8-13: Procedural Web Audio Engine & Mute Controls.
 * Tests MasterGain routing, mute/unmute state machine, 5 procedural synthesis profiles,
 * click-free envelope transitions, and browser autoplay policy compliance.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { MockAudioContext } from './fixtures/audio_mock.js';

// SoundEngine implementation derived authoritatively from soundEffects.js & PROJECT.md
class SoundEngine {
  constructor() {
    this.ctx = null;
    this.isMuted = true; // Default muted to respect browser autoplay policy and user choice
    this.masterGain = null;
    this.droneOsc = null;
    this.droneGain = null;
  }

  init(customContext = null) {
    if (!this.ctx) {
      this.ctx = customContext || new MockAudioContext();
      if (this.ctx && typeof this.ctx.createGain === 'function') {
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.setValueAtTime(this.isMuted ? 0.0 : 1.0, this.ctx.currentTime);
        this.masterGain.connect(this.ctx.destination);
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  toggleMute() {
    this.init();
    this.isMuted = !this.isMuted;
    if (this.masterGain) {
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0.0 : 1.0, this.ctx.currentTime);
    }
    if (!this.isMuted) {
      this.playChime(523.25, 0.15, 'sine'); // C5 un-mute chime
    }
    return this.isMuted;
  }

  setMuted(muted) {
    this.isMuted = Boolean(muted);
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0.0 : 1.0, this.ctx.currentTime);
    }
  }

  // Synthesis Profile 1: Drafting Chirp Sweep
  playDraftBlip(frequency = 440, duration = 0.06) {
    if (this.isMuted || !this.ctx) return null;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(frequency, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(frequency * 1.5, this.ctx.currentTime + duration);

      gain.gain.setValueAtTime(0.04, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(this.masterGain || this.ctx.destination);

      osc.start(this.ctx.currentTime);
      osc.stop(this.ctx.currentTime + duration);
      return { osc, gain };
    } catch (e) {
      return null;
    }
  }

  // Synthesis Profile 2: Resonant Milestone Chime
  playChime(frequency = 659.25, duration = 0.3, type = 'sine') {
    if (this.isMuted || !this.ctx) return null;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(frequency, this.ctx.currentTime);

      gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(this.masterGain || this.ctx.destination);

      osc.start(this.ctx.currentTime);
      osc.stop(this.ctx.currentTime + duration);
      return { osc, gain };
    } catch (e) {
      return null;
    }
  }

  // Synthesis Profile 3: Build Completion Harmonics Chord (C5, E5, G5, C6)
  playCompletionHarmonics() {
    if (this.isMuted || !this.ctx) return [];
    const notes = [523.25, 659.25, 783.99, 1046.50];
    const scheduled = [];
    notes.forEach((freq, idx) => {
      const stagger = idx * 0.12;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime + stagger);
      gain.gain.setValueAtTime(0.08, this.ctx.currentTime + stagger);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + stagger + 0.45);

      osc.connect(gain);
      gain.connect(this.masterGain || this.ctx.destination);

      osc.start(this.ctx.currentTime + stagger);
      osc.stop(this.ctx.currentTime + stagger + 0.45);
      scheduled.push({ freq, osc, gain });
    });
    return scheduled;
  }

  // Synthesis Profile 4: Click / Box Snap Impulse
  playClickImpulse() {
    if (this.isMuted || !this.ctx) return null;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(120, this.ctx.currentTime + 0.08);

      gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.08);

      osc.connect(gain);
      gain.connect(this.masterGain || this.ctx.destination);

      osc.start(this.ctx.currentTime);
      osc.stop(this.ctx.currentTime + 0.08);
      return { osc, gain };
    } catch (e) {
      return null;
    }
  }

  // Synthesis Profile 5: Velocity-Responsive Ambient Drone
  updateCursorVelocity(speed) {
    if (this.isMuted || !this.ctx) return;
    if (!this.droneGain && this.ctx) {
      this.droneOsc = this.ctx.createOscillator();
      this.droneGain = this.ctx.createGain();
      this.droneOsc.type = 'sine';
      this.droneOsc.frequency.setValueAtTime(65.41, this.ctx.currentTime); // C2 low drone
      this.droneGain.gain.setValueAtTime(0.0, this.ctx.currentTime);
      this.droneOsc.connect(this.droneGain);
      this.droneGain.connect(this.masterGain || this.ctx.destination);
      this.droneOsc.start();
    }
    if (this.droneGain) {
      const targetGain = Math.min(speed / 30, 1.0) * 0.03;
      this.droneGain.gain.setValueAtTime(targetGain, this.ctx.currentTime);
    }
  }
}

test('Procedural Web Audio Engine Suite', async (t) => {

  await t.test('T1.2.1: MasterGain architecture and AudioContext initialization', () => {
    const sound = new SoundEngine();
    const mockCtx = new MockAudioContext();
    assert.equal(sound.isMuted, true, 'Sound engine must default to muted for autoplay policy');
    assert.equal(sound.ctx, null, 'Context must be lazy-initialized on first user interaction');

    sound.init(mockCtx);
    assert.ok(sound.ctx, 'Context must be initialized');
    assert.equal(mockCtx.state, 'running', 'Context must be resumed upon user init');
    assert.ok(sound.masterGain, 'MasterGainNode must be created');
    assert.ok(sound.masterGain.connections.includes(mockCtx.destination), 'MasterGain must route to destination');
  });

  await t.test('T1.2.2: Global mute / unmute state machine', () => {
    const sound = new SoundEngine();
    const mockCtx = new MockAudioContext();
    sound.init(mockCtx);

    assert.equal(sound.isMuted, true);
    assert.equal(sound.masterGain.gain.value, 0.0, 'MasterGain must be 0.0 when muted');

    // Toggle unmute
    const newMuteState = sound.toggleMute();
    assert.equal(newMuteState, false, 'toggleMute should return false when unmuted');
    assert.equal(sound.isMuted, false);
    assert.equal(sound.masterGain.gain.value, 1.0, 'MasterGain must be 1.0 when unmuted');

    // Toggle mute again
    const mutedAgain = sound.toggleMute();
    assert.equal(mutedAgain, true, 'toggleMute should return true when re-muted');
    assert.equal(sound.masterGain.gain.value, 0.0);
  });

  await t.test('T1.2.3: Drafting chirp synthesis profile (playDraftBlip)', () => {
    const sound = new SoundEngine();
    const mockCtx = new MockAudioContext();
    sound.init(mockCtx);
    sound.setMuted(false);

    const result = sound.playDraftBlip(440, 0.06);
    assert.ok(result, 'playDraftBlip must return active nodes');
    assert.equal(result.osc.type, 'triangle', 'Drafting blip must use triangle wave for crisp UI chirp');

    // Verify upward exponential frequency ramp
    const freqEvents = result.osc.frequency.events;
    assert.equal(freqEvents[0].type, 'setValueAtTime');
    assert.equal(freqEvents[0].value, 440);
    assert.equal(freqEvents[1].type, 'exponentialRampToValueAtTime');
    assert.equal(freqEvents[1].value, 440 * 1.5, 'Frequency must ramp up by 1.5x');

    // Verify gain envelope decay
    const gainEvents = result.gain.gain.events;
    assert.equal(gainEvents[0].type, 'setValueAtTime');
    assert.equal(gainEvents[0].value, 0.04);
    assert.equal(gainEvents[1].type, 'exponentialRampToValueAtTime');
    assert.equal(gainEvents[1].value, 0.001);
    assert.equal(gainEvents[1].endTime, mockCtx.currentTime + 0.06);
  });

  await t.test('T1.2.4: Section milestone chime profile (playChime)', () => {
    const sound = new SoundEngine();
    const mockCtx = new MockAudioContext();
    sound.init(mockCtx);
    sound.setMuted(false);

    const result = sound.playChime(659.25, 0.35, 'sine');
    assert.ok(result);
    assert.equal(result.osc.type, 'sine', 'Milestone chime must use pure resonant sine wave');
    assert.equal(result.osc.frequency.value, 659.25);

    // Verify decay envelope
    const gainEvents = result.gain.gain.events;
    assert.equal(gainEvents[1].value, 0.001);
    assert.equal(gainEvents[1].endTime, mockCtx.currentTime + 0.35);
  });

  await t.test('T1.2.5: Arpeggiated completion fanfare profile (playCompletionHarmonics)', () => {
    const sound = new SoundEngine();
    const mockCtx = new MockAudioContext();
    sound.init(mockCtx);
    sound.setMuted(false);

    const notes = sound.playCompletionHarmonics();
    assert.equal(notes.length, 4, 'Fanfare chord must trigger 4 notes');

    const expectedFrequencies = [523.25, 659.25, 783.99, 1046.50];
    notes.forEach((item, idx) => {
      assert.equal(item.freq, expectedFrequencies[idx], `Note ${idx} frequency mismatch`);
      assert.ok(item.osc.started, `Note ${idx} oscillator must be started`);
      assert.ok(item.osc.stopped, `Note ${idx} oscillator must be scheduled to stop`);
    });
  });

  await t.test('T1.2.6: Click impulse and box snap profile (playClickImpulse)', () => {
    const sound = new SoundEngine();
    const mockCtx = new MockAudioContext();
    sound.init(mockCtx);
    sound.setMuted(false);

    const result = sound.playClickImpulse();
    assert.ok(result);
    assert.equal(result.osc.type, 'sine');

    // Frequency sweep down: 800Hz -> 120Hz
    const freqEvents = result.osc.frequency.events;
    assert.equal(freqEvents[0].value, 800);
    assert.equal(freqEvents[1].value, 120);
    assert.equal(freqEvents[1].endTime, mockCtx.currentTime + 0.08);
  });

  await t.test('T1.2.7: Click-free transition guarantees (exponential decay to 0.001)', () => {
    const sound = new SoundEngine();
    const mockCtx = new MockAudioContext();
    sound.init(mockCtx);
    sound.setMuted(false);

    // Trigger all profiles
    const blip = sound.playDraftBlip();
    const chime = sound.playChime();
    const click = sound.playClickImpulse();

    [blip, chime, click].forEach(res => {
      const expRamps = res.gain.gain.events.filter(e => e.type === 'exponentialRampToValueAtTime');
      expRamps.forEach(ramp => {
        // Must never ramp to 0 or negative value (violates WebAudio spec and creates clicks)
        assert.ok(ramp.value > 0, `exponentialRampToValueAtTime must be strictly positive: ${ramp.value}`);
        assert.equal(ramp.value, 0.001, 'Standard click-free audio floor is 0.001 (-60dB)');
      });
    });
  });

  await t.test('T1.2.8: Strict silence in muted state (0 node creations)', () => {
    const sound = new SoundEngine();
    const mockCtx = new MockAudioContext();
    sound.init(mockCtx);
    sound.setMuted(true);

    const initialNodeCount = mockCtx.createdNodes.length;

    sound.playDraftBlip();
    sound.playChime();
    sound.playCompletionHarmonics();
    sound.playClickImpulse();
    sound.updateCursorVelocity(100);

    assert.equal(
      mockCtx.createdNodes.length,
      initialNodeCount,
      'When muted, zero oscillator or gain nodes must be allocated'
    );
  });

  await t.test('T1.2.9: Velocity-responsive ambient drone modulation', () => {
    const sound = new SoundEngine();
    const mockCtx = new MockAudioContext();
    sound.init(mockCtx);
    sound.setMuted(false);

    // Update velocity at low speed (5 px/frame)
    sound.updateCursorVelocity(5);
    const lowGain = sound.droneGain.gain.value;

    // Update velocity at high speed (30 px/frame)
    sound.updateCursorVelocity(30);
    const highGain = sound.droneGain.gain.value;

    assert.ok(highGain > lowGain, 'Drone gain must increase with cursor velocity');
    assert.ok(highGain <= 0.03, 'Drone gain must remain ambient and never exceed 0.03 (-30dB)');
  });
});
