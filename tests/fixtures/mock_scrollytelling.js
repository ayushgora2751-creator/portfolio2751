/**
 * mock_scrollytelling.js
 * 
 * High-fidelity test harness and domain model for Ayush Gora's
 * Scrollytelling Portfolio E2E opaque-box testing.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Root workspace directory
export const WORKSPACE_ROOT = path.resolve(__dirname, '..', '..');

/**
 * 1. Mathematical Object-Fit Cover Dimensions Calculation
 * Invariant: renderWidth >= viewportWidth AND renderHeight >= viewportHeight
 */
export function calculateCoverDimensions(viewportWidth, viewportHeight, imageWidth, imageHeight) {
  if (viewportWidth <= 0 || viewportHeight <= 0 || imageWidth <= 0 || imageHeight <= 0) {
    return { renderWidth: 0, renderHeight: 0, offsetX: 0, offsetY: 0 };
  }
  const imgRatio = imageWidth / imageHeight;
  const canvasRatio = viewportWidth / viewportHeight;
  let renderWidth = viewportWidth;
  let renderHeight = viewportHeight;
  let offsetX = 0;
  let offsetY = 0;

  if (canvasRatio > imgRatio) {
    // Screen is wider than image: stretch height
    renderHeight = viewportWidth / imgRatio;
    offsetY = (viewportHeight - renderHeight) / 2;
  } else {
    // Screen is taller than image: stretch width
    renderWidth = viewportHeight * imgRatio;
    offsetX = (viewportWidth - renderWidth) / 2;
  }

  return { renderWidth, renderHeight, offsetX, offsetY };
}

/**
 * 2. Scroll Progress to Frame Index Mapping
 * Invariant: returned index is an integer in [0, totalFrames - 1]
 */
export function getFrameIndexFromScroll(progress, totalFrames = 192) {
  if (typeof progress !== 'number' || isNaN(progress)) return 0;
  const clampedProgress = Math.min(Math.max(progress, 0), 1);
  return Math.min(Math.max(Math.floor(clampedProgress * (totalFrames - 1) + 1e-9), 0), totalFrames - 1);
}

/**
 * 3. Parallax Overlay Opacity & Transform Model
 * Maps scrollYProgress (0 to 1) to opacity of sections 1, 2, 3, 4
 */
export function calculateOverlayTransforms(progress) {
  const p = Math.min(Math.max(progress, 0), 1);

  // Section 1: (0% scroll) - Centered [0, 0.12, 0.22] -> [1, 1, 0]
  let opacity1 = 0;
  if (p <= 0.12) opacity1 = 1;
  else if (p <= 0.22) opacity1 = 1 - (p - 0.12) / (0.22 - 0.12);
  else opacity1 = 0;

  // Section 2: (30% scroll) - Left-aligned [0.22, 0.30, 0.38, 0.46] -> [0, 1, 1, 0]
  let opacity2 = 0;
  if (p < 0.22 || p > 0.46) opacity2 = 0;
  else if (p <= 0.30) opacity2 = (p - 0.22) / (0.30 - 0.22);
  else if (p <= 0.38) opacity2 = 1;
  else opacity2 = 1 - (p - 0.38) / (0.46 - 0.38);

  // Section 3: (60% scroll) - Right-aligned [0.52, 0.60, 0.68, 0.76] -> [0, 1, 1, 0]
  let opacity3 = 0;
  if (p < 0.52 || p > 0.76) opacity3 = 0;
  else if (p <= 0.60) opacity3 = (p - 0.52) / (0.60 - 0.52);
  else if (p <= 0.68) opacity3 = 1;
  else opacity3 = 1 - (p - 0.68) / (0.76 - 0.68);

  // Section 4: (85%-100% scroll) - Transition prompt [0.80, 0.88, 1.0] -> [0, 1, 1]
  let opacity4 = 0;
  if (p < 0.80) opacity4 = 0;
  else if (p <= 0.88) opacity4 = (p - 0.80) / (0.88 - 0.80);
  else opacity4 = 1;

  return { opacity1, opacity2, opacity3, opacity4 };
}

/**
 * 4. 5 Verified Projects Specification Data
 */
export const VERIFIED_PROJECTS_SPEC = [
  {
    id: "bingo-multiplayer",
    title: "Bingo Multiplayer Game",
    category: "Full Stack & Real-Time",
    tech: ["React", "Node.js", "WebSockets", "Canvas 2D", "Tailwind CSS"],
    githubUrl: "https://github.com/AyushGora/bingo-multiplayer",
  },
  {
    id: "samajseva",
    title: "SamajSeva Community Portal",
    category: "Social Impact & Platform",
    tech: ["Python", "Django", "PostgreSQL", "REST API", "Tailwind CSS"],
    githubUrl: "https://github.com/AyushGora/samajseva",
  },
  {
    id: "3d-portfolio",
    title: "Multiplayer 3D Portfolio",
    category: "Creative Dev & WebGL",
    tech: ["React", "Three.js", "WebGL", "Framer Motion", "Django REST"],
    githubUrl: "https://github.com/AyushGora/swarm",
  },
  {
    id: "msj-engineering",
    title: "MSJ Engineering Industrial Suite",
    category: "Industrial & Enterprise Web",
    tech: ["React", "TypeScript", "Django REST", "Docker", "Tailwind CSS"],
    githubUrl: "https://github.com/AyushGora/msj-engineering",
  },
  {
    id: "jap-interior",
    title: "JAP Interior Architectural Studio",
    category: "Commercial Showcase & UX",
    tech: ["React", "Framer Motion", "Tailwind CSS", "Vite", "Headless CMS"],
    githubUrl: "https://github.com/AyushGora/jap-interior",
  },
];

/**
 * 5. Mock Canvas 2D Rendering Context Recorder
 */
export class MockCanvasRenderingContext2D {
  constructor() {
    this.fillStyle = '#000000';
    this.drawCalls = [];
    this.fillCalls = [];
    this.scaleCalls = [];
    this.saves = 0;
    this.restores = 0;
  }

  save() {
    this.saves++;
  }

  restore() {
    this.restores++;
  }

  scale(sx, sy) {
    this.scaleCalls.push({ sx, sy });
  }

  fillRect(x, y, w, h) {
    this.fillCalls.push({ fillStyle: this.fillStyle, x, y, w, h });
  }

  drawImage(img, dx, dy, dw, dh) {
    this.drawCalls.push({
      imgSrc: img ? img.src : null,
      imgNaturalWidth: img ? img.naturalWidth : 0,
      imgNaturalHeight: img ? img.naturalHeight : 0,
      dx, dy, dw, dh
    });
  }

  clearHistory() {
    this.drawCalls = [];
    this.fillCalls = [];
    this.scaleCalls = [];
    this.saves = 0;
    this.restores = 0;
  }
}

/**
 * 6. Mock HTML5 Canvas Element
 */
export class MockCanvasElement {
  constructor(width = 1920, height = 1080) {
    this.width = width;
    this.height = height;
    this.ctx = new MockCanvasRenderingContext2D();
  }

  getContext(type) {
    if (type === '2d') return this.ctx;
    return null;
  }
}

/**
 * 7. Mock HTMLImageElement
 */
export class MockImage {
  constructor() {
    this._src = '';
    this.width = 1920;
    this.height = 1080;
    this.naturalWidth = 1920;
    this.naturalHeight = 1080;
    this.complete = false;
    this.onload = null;
    this.onerror = null;
  }

  get src() {
    return this._src;
  }

  set src(value) {
    this._src = value;
    // Simulate async decode completion
    process.nextTick(() => {
      this.complete = true;
      if (typeof this.onload === 'function') {
        this.onload();
      }
    });
  }
}

/**
 * 8. Mock ScrollyCanvas Simulation Runtime
 */
export class ScrollyCanvasSimulator {
  constructor(options = {}) {
    this.frameCount = options.frameCount || 192;
    this.viewportWidth = options.viewportWidth || 1440;
    this.viewportHeight = options.viewportHeight || 900;
    this.dpr = Math.min(options.dpr || 1, 2);
    this.images = [];
    this.lastDrawnFrame = -1;
    this.canvas = new MockCanvasElement(this.viewportWidth * this.dpr, this.viewportHeight * this.dpr);
    this.isPreloaded = false;
    this.loadProgress = 0;

    // Initialize mock image slots
    for (let i = 0; i < this.frameCount; i++) {
      const padded = String(i).padStart(3, '0');
      const img = new MockImage();
      img._src = `/sequence/frame_${padded}_delay-0.042s.png`;
      img.complete = true; // by default loaded
      this.images.push(img);
    }
  }

  renderFrame(frameIndex) {
    const ctx = this.canvas.getContext('2d');
    const safeIndex = Math.min(Math.max(0, frameIndex), this.frameCount - 1);

    let drawnIndex = safeIndex;
    let img = this.images[safeIndex];
    if (!img || !img.complete || img.naturalWidth === 0) {
      if (this.lastDrawnFrame >= 0 && this.images[this.lastDrawnFrame]) {
        img = this.images[this.lastDrawnFrame];
        drawnIndex = this.lastDrawnFrame;
      } else {
        return false; // nothing drawn yet
      }
    }

    const displayWidth = this.viewportWidth;
    const displayHeight = this.viewportHeight;
    const targetW = displayWidth * this.dpr;
    const targetH = displayHeight * this.dpr;

    if (this.canvas.width !== targetW || this.canvas.height !== targetH) {
      this.canvas.width = targetW;
      this.canvas.height = targetH;
    }

    ctx.save();
    ctx.scale(this.dpr, this.dpr);

    const { renderWidth, renderHeight, offsetX, offsetY } = calculateCoverDimensions(
      displayWidth,
      displayHeight,
      img.naturalWidth || img.width,
      img.naturalHeight || img.height
    );

    // Clear background to #121212
    ctx.fillStyle = '#121212';
    ctx.fillRect(0, 0, displayWidth, displayHeight);

    // Draw cover frame
    ctx.drawImage(img, offsetX, offsetY, renderWidth, renderHeight);
    ctx.restore();

    this.lastDrawnFrame = drawnIndex;
    return true;
  }

  scrubTo(progress) {
    const targetFrame = getFrameIndexFromScroll(progress, this.frameCount);
    if (targetFrame !== this.lastDrawnFrame) {
      this.renderFrame(targetFrame);
    }
    return targetFrame;
  }

  resize(w, h, dpr = this.dpr) {
    this.viewportWidth = w;
    this.viewportHeight = h;
    this.dpr = Math.min(dpr, 2);
    this.renderFrame(this.lastDrawnFrame >= 0 ? this.lastDrawnFrame : 0);
  }
}
