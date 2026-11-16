/**
 * soundEffects.js
 * 
 * Browser-synthesized Web Audio API procedural sound engine.
 * Generates futuristic UI clicks, drafting sweeps, percussive snaps,
 * harmonic milestone chimes, and velocity-responsive ambient drone hum
 * with zero external audio assets, zero latency, and zero network dependency.
 */

export class SoundEngine {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.droneOsc = null;
    this.droneOsc2 = null;
    this.droneGain = null;

    // Read persisted preference or default to muted (true) for clean first impression & autoplay policy
    let saved = null;
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        saved = window.localStorage.getItem('swarm_portfolio_muted');
      } catch (e) {
        saved = null;
      }
    }
    this.isMuted = saved !== null ? saved === 'true' : true;
  }

  /**
   * Lazy-initialize AudioContext and MasterGain audio graph
   */
  init(customContext = null) {
    if (!this.ctx) {
      const AudioCtx =
        customContext ||
        (typeof window !== 'undefined'
          ? window.AudioContext || window.webkitAudioContext
          : null);
      if (AudioCtx) {
        try {
          this.ctx = customContext || new AudioCtx();
          if (this.ctx && typeof this.ctx.createGain === 'function') {
            this.masterGain = this.ctx.createGain();
            this.masterGain.gain.setValueAtTime(this.isMuted ? 0.0 : 1.0, this.ctx.currentTime);
            if (typeof this.masterGain.gain.setTargetAtTime === 'function') {
              this.masterGain.gain.setTargetAtTime(
                this.isMuted ? 0.0 : 0.35,
                this.ctx.currentTime,
                0.015
              );
            }
            this.masterGain.connect(this.ctx.destination);
          }
        } catch (e) {
          // Autoplay policy or unsupported audio context
        }
      }
    }

    if (this.ctx && this.ctx.state === 'suspended') {
      try {
        const resumePromise = this.ctx.resume();
        if (resumePromise && typeof resumePromise.catch === 'function') {
          resumePromise.catch(() => {});
        }
      } catch (e) {}
    }
  }

  /**
   * Toggle global mute state with 15ms click-free parameter ramp
   */
  toggleMute() {
    this.init();
    this.isMuted = !this.isMuted;

    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        window.localStorage.setItem('swarm_portfolio_muted', String(this.isMuted));
      } catch (e) {}
    }

    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0.0 : 1.0, this.ctx.currentTime);
      if (typeof this.masterGain.gain.setTargetAtTime === 'function') {
        this.masterGain.gain.setTargetAtTime(
          this.isMuted ? 0.0 : 0.35,
          this.ctx.currentTime,
          0.015
        );
      }
    }

    if (!this.isMuted) {
      this.playChime(523.25, 0.15, 'sine'); // C5 harmonic un-mute chime
    }

    if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function') {
      try {
        window.dispatchEvent(
          new CustomEvent('swarm_audio_mute_change', { detail: { isMuted: this.isMuted } })
        );
      } catch (e) {}
    }

    return this.isMuted;
  }

  /**
   * Explicitly set mute state
   */
  setMuted(muted) {
    this.isMuted = Boolean(muted);

    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        window.localStorage.setItem('swarm_portfolio_muted', String(this.isMuted));
      } catch (e) {}
    }

    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0.0 : 1.0, this.ctx.currentTime);
      if (typeof this.masterGain.gain.setTargetAtTime === 'function') {
        this.masterGain.gain.setTargetAtTime(
          this.isMuted ? 0.0 : 0.35,
          this.ctx.currentTime,
          0.015
        );
      }
    }

    if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function') {
      try {
        window.dispatchEvent(
          new CustomEvent('swarm_audio_mute_change', { detail: { isMuted: this.isMuted } })
        );
      } catch (e) {}
    }
  }

  /**
   * Synthesis Profile 1: Drafting Chirp Sweep
   * Triangle wave with upward exponential frequency ramp for stylus blueprint drawing
   */
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

  /**
   * Synthesis Profile 2: Resonant Milestone Chime
   * Pure sine wave with exponential decay envelope
   */
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

  /**
   * Synthesis Profile 3: Build Completion Harmonics Chord
   * Arpeggiated C Major chord (C5, E5, G5, C6) with staggered 120ms delays
   */
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

  /**
   * Synthesis Profile 4: Click / Box Snap Impulse
   * Fast downward frequency sweep from 800Hz to 120Hz over 80ms
   */
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

  /**
   * Percussive downward transient snap click for box placement & magnetic docking
   */
  playBoxSnap() {
    if (this.isMuted || !this.ctx) return null;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(950, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(80, this.ctx.currentTime + 0.035);

      gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.035);

      osc.connect(gain);
      gain.connect(this.masterGain || this.ctx.destination);

      osc.start(this.ctx.currentTime);
      osc.stop(this.ctx.currentTime + 0.035);
      return { osc, gain };
    } catch (e) {
      return null;
    }
  }

  /**
   * Synthesis Profile 5: Velocity-Responsive Ambient Drone
   * Modulates dual-sine drone (110Hz + 165Hz) based on cursor movement speed
   */
  updateCursorVelocity(speed) {
    if (this.isMuted || !this.ctx) return;
    if (!this.droneGain && this.ctx) {
      try {
        this.droneOsc = this.ctx.createOscillator();
        this.droneGain = this.ctx.createGain();
        this.droneOsc.type = 'sine';
        this.droneOsc.frequency.setValueAtTime(110, this.ctx.currentTime); // 110Hz A2
        this.droneGain.gain.setValueAtTime(0.0, this.ctx.currentTime);

        let targetDestination = this.masterGain || this.ctx.destination;
        if (typeof this.ctx.createBiquadFilter === 'function') {
          const filter = this.ctx.createBiquadFilter();
          filter.type = 'lowpass';
          filter.frequency.setValueAtTime(320, this.ctx.currentTime);
          this.droneGain.connect(filter);
          filter.connect(targetDestination);
        } else {
          this.droneGain.connect(targetDestination);
        }

        this.droneOsc.connect(this.droneGain);
        this.droneOsc.start();

        // Dual sine 165Hz fifth (E3)
        if (typeof this.ctx.createOscillator === 'function') {
          try {
            this.droneOsc2 = this.ctx.createOscillator();
            this.droneOsc2.type = 'sine';
            this.droneOsc2.frequency.setValueAtTime(165, this.ctx.currentTime);
            this.droneOsc2.connect(this.droneGain);
            this.droneOsc2.start();
          } catch (e) {}
        }
      } catch (e) {}
    }

    if (this.droneGain) {
      const targetGain = Math.min(speed / 30, 1.0) * 0.03;
      this.droneGain.gain.setValueAtTime(targetGain, this.ctx.currentTime);
    }
  }
}

export const sound = new SoundEngine();

// Browser autoplay policy unlocking on first user interaction gesture
if (typeof window !== 'undefined') {
  const unlockAudio = () => {
    if (sound.ctx && sound.ctx.state === 'suspended') {
      sound.ctx.resume().catch(() => {});
    }
    ['pointerdown', 'keydown', 'touchstart'].forEach((e) =>
      window.removeEventListener(e, unlockAudio)
    );
  };
  ['pointerdown', 'keydown', 'touchstart'].forEach((e) =>
    window.addEventListener(e, unlockAudio, { passive: true, once: true })
  );
}

export default sound;
