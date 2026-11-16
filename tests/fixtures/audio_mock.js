/**
 * audio_mock.js
 * 
 * High-fidelity mock of Web Audio API standard for automated node testing.
 * Implements AudioContext, GainNode, OscillatorNode, and AudioParam with
 * graph connection verification and Web Audio specification constraints.
 */

export class MockAudioParam {
  constructor(name, defaultValue = 0) {
    this.name = name;
    this.value = defaultValue;
    this.events = [];
  }

  setValueAtTime(value, startTime) {
    this.value = value;
    this.events.push({ type: 'setValueAtTime', value, startTime });
    return this;
  }

  exponentialRampToValueAtTime(value, endTime) {
    // Web Audio API Spec: exponentialRamp value must be strictly > 0 (prevents divide-by-zero / log(0))
    if (value <= 0) {
      throw new RangeError(
        `WebAudio Spec Error: exponentialRampToValueAtTime target value must be strictly positive (> 0), got: ${value}`
      );
    }
    this.value = value;
    this.events.push({ type: 'exponentialRampToValueAtTime', value, endTime });
    return this;
  }

  linearRampToValueAtTime(value, endTime) {
    this.value = value;
    this.events.push({ type: 'linearRampToValueAtTime', value, endTime });
    return this;
  }

  setTargetAtTime(target, startTime, timeConstant) {
    this.events.push({ type: 'setTargetAtTime', target, startTime, timeConstant });
    return this;
  }
}

export class MockAudioNode {
  constructor(context, type) {
    this.context = context;
    this.type = type;
    this.connections = [];
  }

  connect(destination) {
    this.connections.push(destination);
    return destination;
  }

  disconnect(destination) {
    if (destination) {
      const idx = this.connections.indexOf(destination);
      if (idx !== -1) this.connections.splice(idx, 1);
    } else {
      this.connections = [];
    }
  }
}

export class MockGainNode extends MockAudioNode {
  constructor(context) {
    super(context, 'gain');
    this.gain = new MockAudioParam('gain', 1.0);
  }
}

export class MockOscillatorNode extends MockAudioNode {
  constructor(context) {
    super(context, 'oscillator');
    this.type = 'sine';
    this.frequency = new MockAudioParam('frequency', 440);
    this.detune = new MockAudioParam('detune', 0);
    this.started = false;
    this.stopped = false;
    this.startTime = null;
    this.stopTime = null;
  }

  start(when = 0) {
    this.started = true;
    this.startTime = when;
  }

  stop(when = 0) {
    this.stopped = true;
    this.stopTime = when;
  }
}

export class MockAudioDestinationNode extends MockAudioNode {
  constructor(context) {
    super(context, 'destination');
    this.maxChannelCount = 2;
  }
}

export class MockAudioContext {
  constructor() {
    this.state = 'suspended'; // Standard browser autoplay policy initially suspends context
    this.currentTime = 0;
    this.sampleRate = 44100;
    this.destination = new MockAudioDestinationNode(this);
    this.createdNodes = [];
    this.masterGain = null;
  }

  resume() {
    this.state = 'running';
    return Promise.resolve();
  }

  suspend() {
    this.state = 'suspended';
    return Promise.resolve();
  }

  close() {
    this.state = 'closed';
    return Promise.resolve();
  }

  createGain() {
    const gain = new MockGainNode(this);
    this.createdNodes.push(gain);
    return gain;
  }

  createOscillator() {
    const osc = new MockOscillatorNode(this);
    this.createdNodes.push(osc);
    return osc;
  }

  advanceTime(seconds) {
    this.currentTime += seconds;
  }

  reset() {
    this.createdNodes = [];
    this.currentTime = 0;
    this.state = 'suspended';
  }
}
