/**
 * dom_mock.js
 * 
 * High-fidelity mock of browser DOM, Canvas2D, and window environments.
 * Records rendering calls, handles event dispatching, and mocks Lenis scroll controllers.
 */

export class MockCanvasRenderingContext2D {
  constructor(canvas) {
    this.canvas = canvas;
    this.drawCalls = [];
    this.stateStack = [];
    this.strokeStyle = '#000000';
    this.fillStyle = '#000000';
    this.lineWidth = 1;
    this.lineDash = [];
    this.shadowColor = 'transparent';
    this.shadowBlur = 0;
    this.globalAlpha = 1.0;
    this.font = '10px sans-serif';
    this.textAlign = 'left';
    this.textBaseline = 'alphabetic';
    this.transformMatrix = { a: 1, b: 0, c: 0, d: 1, e: 0, f: 0 };
  }

  clearRect(x, y, w, h) {
    this.drawCalls.push({ type: 'clearRect', x, y, w, h });
  }

  fillRect(x, y, w, h) {
    this.drawCalls.push({ type: 'fillRect', x, y, w, h, fillStyle: this.fillStyle, alpha: this.globalAlpha });
  }

  strokeRect(x, y, w, h) {
    this.drawCalls.push({
      type: 'strokeRect',
      x, y, w, h,
      strokeStyle: this.strokeStyle,
      lineWidth: this.lineWidth,
      lineDash: [...this.lineDash],
      alpha: this.globalAlpha
    });
  }

  beginPath() {
    this.drawCalls.push({ type: 'beginPath' });
  }

  closePath() {
    this.drawCalls.push({ type: 'closePath' });
  }

  moveTo(x, y) {
    this.drawCalls.push({ type: 'moveTo', x, y });
  }

  lineTo(x, y) {
    this.drawCalls.push({ type: 'lineTo', x, y });
  }

  arc(x, y, radius, startAngle, endAngle, counterclockwise = false) {
    this.drawCalls.push({ type: 'arc', x, y, radius, startAngle, endAngle, counterclockwise });
  }

  roundRect(x, y, w, h, radii) {
    this.drawCalls.push({ type: 'roundRect', x, y, w, h, radii });
  }

  stroke() {
    this.drawCalls.push({ type: 'stroke', strokeStyle: this.strokeStyle, lineWidth: this.lineWidth });
  }

  fill() {
    this.drawCalls.push({ type: 'fill', fillStyle: this.fillStyle });
  }

  fillText(text, x, y, maxWidth) {
    this.drawCalls.push({ type: 'fillText', text, x, y, maxWidth, font: this.font, fillStyle: this.fillStyle });
  }

  measureText(text) {
    return { width: (text || '').length * 7.5 };
  }

  setLineDash(segments) {
    this.lineDash = [...segments];
    this.drawCalls.push({ type: 'setLineDash', segments: [...segments] });
  }

  save() {
    this.stateStack.push({
      strokeStyle: this.strokeStyle,
      fillStyle: this.fillStyle,
      lineWidth: this.lineWidth,
      lineDash: [...this.lineDash],
      shadowColor: this.shadowColor,
      shadowBlur: this.shadowBlur,
      globalAlpha: this.globalAlpha,
      font: this.font,
      textAlign: this.textAlign,
      textBaseline: this.textBaseline,
      transformMatrix: { ...this.transformMatrix },
    });
    this.drawCalls.push({ type: 'save' });
  }

  restore() {
    if (this.stateStack.length > 0) {
      const state = this.stateStack.pop();
      Object.assign(this, state);
    }
    this.drawCalls.push({ type: 'restore' });
  }

  translate(x, y) {
    this.drawCalls.push({ type: 'translate', x, y });
  }

  rotate(angle) {
    this.drawCalls.push({ type: 'rotate', angle });
  }

  scale(sx, sy) {
    this.drawCalls.push({ type: 'scale', sx, sy });
  }

  resetCalls() {
    this.drawCalls = [];
  }
}

export class MockCanvas {
  constructor(width = 1920, height = 1080) {
    this.width = width;
    this.height = height;
    this.style = {};
    this.context = new MockCanvasRenderingContext2D(this);
  }

  getContext(type) {
    if (type === '2d') return this.context;
    return null;
  }
}

export class MockElement {
  constructor(tagName = 'div', id = '', className = '') {
    this.tagName = tagName.toUpperCase();
    this.id = id;
    this.className = className;
    this.style = {};
    this.dataset = {};
    this.classList = {
      _classes: new Set(className ? className.split(' ') : []),
      add(cls) { this._classes.add(cls); },
      remove(cls) { this._classes.delete(cls); },
      contains(cls) { return this._classes.has(cls); },
      toggle(cls) {
        if (this._classes.has(cls)) this._classes.delete(cls);
        else this._classes.add(cls);
      }
    };
    this.rect = { left: 0, top: 0, right: 100, bottom: 50, width: 100, height: 50 };
  }

  getBoundingClientRect() {
    return { ...this.rect };
  }

  closest(selector) {
    if (selector.includes('data-swarm="orbit"') && this.dataset.swarm === 'orbit') return this;
    if (selector.includes('data-swarm="gather"') && this.dataset.swarm === 'gather') return this;
    if (selector.includes('button') && this.tagName === 'BUTTON') return this;
    if (selector.includes('data-tilt') && this.dataset.tilt === 'true') return this;
    return null;
  }
}

export class MockLenis {
  constructor() {
    this.isStopped = false;
    this.scrollPosition = 0;
    this.callHistory = [];
  }

  start() {
    this.isStopped = false;
    this.callHistory.push({ method: 'start' });
  }

  stop() {
    this.isStopped = true;
    this.callHistory.push({ method: 'stop' });
  }

  scrollTo(target, options = {}) {
    this.scrollPosition = typeof target === 'number' ? target : 0;
    this.callHistory.push({ method: 'scrollTo', target, options });
  }
}

export function createBrowserEnvironment(custom = {}) {
  const eventListeners = new Map();
  let nextRafId = 1;
  const rafCallbacks = new Map();

  const mockLenis = new MockLenis();

  const mockWindow = {
    innerWidth: custom.innerWidth || 1920,
    innerHeight: custom.innerHeight || 1080,
    devicePixelRatio: custom.devicePixelRatio || 1,
    scrollX: 0,
    scrollY: 0,
    __lenis: mockLenis,
    matchMedia: (query) => {
      const prefersReduced = custom.prefersReducedMotion && query.includes('prefers-reduced-motion: reduce');
      const isCoarse = custom.isTouchDevice && query.includes('pointer: coarse');
      return {
        matches: Boolean(prefersReduced || isCoarse),
        media: query,
        addListener: () => {},
        removeListener: () => {},
        addEventListener: () => {},
        removeEventListener: () => {},
      };
    },
    addEventListener: (type, listener) => {
      if (!eventListeners.has(type)) eventListeners.set(type, []);
      eventListeners.get(type).push(listener);
    },
    removeEventListener: (type, listener) => {
      if (eventListeners.has(type)) {
        const arr = eventListeners.get(type);
        const idx = arr.indexOf(listener);
        if (idx !== -1) arr.splice(idx, 1);
      }
    },
    dispatchEvent: (event) => {
      const arr = eventListeners.get(event.type) || [];
      for (const cb of arr) {
        cb(event);
      }
    },
    scrollTo: ({ top, left, behavior } = {}) => {
      if (typeof top === 'number') mockWindow.scrollY = top;
      if (typeof left === 'number') mockWindow.scrollX = left;
    },
    requestAnimationFrame: (cb) => {
      const id = nextRafId++;
      rafCallbacks.set(id, cb);
      return id;
    },
    cancelAnimationFrame: (id) => {
      rafCallbacks.delete(id);
    },
    _stepAnimationFrames: (timestamp = performance.now()) => {
      const current = Array.from(rafCallbacks.entries());
      rafCallbacks.clear();
      for (const [, cb] of current) {
        cb(timestamp);
      }
    },
    _getRafCount: () => rafCallbacks.size,
  };

  const body = new MockElement('body');
  const mockDocument = {
    body,
    addEventListener: mockWindow.addEventListener,
    removeEventListener: mockWindow.removeEventListener,
    dispatchEvent: mockWindow.dispatchEvent,
    createElement: (tag) => {
      if (tag === 'canvas') return new MockCanvas(mockWindow.innerWidth, mockWindow.innerHeight);
      return new MockElement(tag);
    },
    elementFromPoint: (x, y) => {
      if (custom.elementFromPoint) return custom.elementFromPoint(x, y);
      return null;
    },
  };

  return {
    window: mockWindow,
    document: mockDocument,
    lenis: mockLenis,
    triggerPointerMove: (clientX, clientY) => {
      mockWindow.dispatchEvent({ type: 'pointermove', clientX, clientY });
    },
    triggerMouseDown: () => {
      mockWindow.dispatchEvent({ type: 'mousedown' });
    },
    triggerMouseUp: () => {
      mockWindow.dispatchEvent({ type: 'mouseup' });
    },
    triggerKeyDown: (key) => {
      mockWindow.dispatchEvent({ type: 'keydown', key });
    },
    triggerResize: (newWidth, newHeight) => {
      mockWindow.innerWidth = newWidth;
      mockWindow.innerHeight = newHeight;
      mockWindow.dispatchEvent({ type: 'resize' });
    },
  };
}
