/**
 * tier4_real_world.test.js
 * 
 * Tier 4: Real-World User Scenarios Test Suite
 * Simulates complete end-to-end user journeys through the Scrollytelling Portfolio:
 *   - Scenario A: First-Time Desktop Visitor (full linear scroll journey & project review)
 *   - Scenario B: Fast Mobile Visitor (aggressive fling scroll, partial buffer fallback)
 *   - Scenario C: Interactive Bidirectional Scrubbing Explorer (cybernetic transition examination)
 *   - Scenario D: Multi-Device Breakpoint Transformer (matrix of screen aspect ratios)
 *   - Scenario E: Dark Aesthetic & Forensic Verification Gate (zero video tags, #121212 purity)
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {
  calculateCoverDimensions,
  getFrameIndexFromScroll,
  calculateOverlayTransforms,
  VERIFIED_PROJECTS_SPEC,
  ScrollyCanvasSimulator,
  WORKSPACE_ROOT,
} from './fixtures/mock_scrollytelling.js';

function findComponentPath(relativePath) {
  const candidates = [
    path.join(WORKSPACE_ROOT, 'scrollytelling', relativePath),
    path.join(WORKSPACE_ROOT, relativePath),
  ];
  for (const c of candidates) {
    if (fs.existsSync(c)) return c;
  }
  return candidates[0];
}

describe('Tier 4: Real-World User Scenarios — Ayush Gora Scrollytelling Portfolio', () => {

  // =========================================================================
  // Scenario A: First-Time Desktop Visitor (Linear Scrollytelling Journey)
  // =========================================================================
  it('4.1: Scenario A — Complete First-Time Desktop Journey (1440x900)', () => {
    const sim = new ScrollyCanvasSimulator({ viewportWidth: 1440, viewportHeight: 900 });

    // 1. Initial Page Load (0% scroll)
    sim.renderFrame(0);
    assert.equal(sim.lastDrawnFrame, 0, 'Initial load must paint frame 0');
    const heroTransforms = calculateOverlayTransforms(0);
    assert.equal(heroTransforms.opacity1, 1.0, 'Hero overlay must be fully visible');

    // 2. Smooth Scroll down to 30% milestone
    const scrollSteps = [0.05, 0.10, 0.15, 0.20, 0.25, 0.30];
    for (const step of scrollSteps) {
      sim.scrubTo(step);
    }
    assert.equal(sim.lastDrawnFrame, getFrameIndexFromScroll(0.30, 192));
    const missionTransforms = calculateOverlayTransforms(0.30);
    assert.equal(missionTransforms.opacity2, 1.0, 'Mission overlay must be fully visible at 30%');
    assert.equal(missionTransforms.opacity1, 0.0, 'Hero overlay must be faded out');

    // 3. Smooth Scroll down to 60% milestone
    sim.scrubTo(0.45);
    sim.scrubTo(0.60);
    assert.equal(sim.lastDrawnFrame, getFrameIndexFromScroll(0.60, 192));
    const engineeringTransforms = calculateOverlayTransforms(0.60);
    assert.equal(engineeringTransforms.opacity3, 1.0, 'Engineering overlay must be fully visible at 60%');
    assert.equal(engineeringTransforms.opacity2, 0.0);

    // 4. Arrive at End of Scrollytelling (100% scroll)
    sim.scrubTo(1.0);
    assert.equal(sim.lastDrawnFrame, 191, 'Must reach final cybernetic frame 191 at 100%');
    const endTransforms = calculateOverlayTransforms(1.0);
    assert.equal(endTransforms.opacity4, 1.0, 'Featured work indicator must be active');

    // 5. Inspect Work Grid Projects
    const projectsFile = findComponentPath('src/components/Projects.tsx');
    const content = fs.readFileSync(projectsFile, 'utf8');
    VERIFIED_PROJECTS_SPEC.forEach(p => {
      assert.ok(content.includes(p.title), `Visitor must encounter project ${p.title}`);
      assert.ok(content.includes(p.category), `Visitor must view category ${p.category}`);
      assert.ok(content.includes(p.githubUrl), `Visitor must find GitHub link ${p.githubUrl}`);
    });
  });

  // =========================================================================
  // Scenario B: Fast Mobile Visitor (Aggressive Fling & Partial Buffer Fallback)
  // =========================================================================
  it('4.2: Scenario B — Fast Mobile Visitor on iPhone (375x812, DPR 2.0)', () => {
    const sim = new ScrollyCanvasSimulator({ viewportWidth: 375, viewportHeight: 812, dpr: 2.0 });

    // Initial render
    sim.renderFrame(0);
    assert.equal(sim.canvas.width, 750, 'Mobile canvas width must be 375 * 2 = 750px');
    assert.equal(sim.canvas.height, 1624, 'Mobile canvas height must be 812 * 2 = 1624px');

    // Simulating aggressive fling scroll: user scrolls rapidly to 50% while frames 80-120 are still downloading
    for (let f = 80; f <= 120; f++) {
      sim.images[f].complete = false;
      sim.images[f].naturalWidth = 0;
    }

    // Fling scrub to 50% (maps to frame 95)
    sim.scrubTo(0.50);
    // Nearest valid drawn frame must be maintained (frame 0) without crash or white flicker
    assert.ok(sim.lastDrawnFrame >= 0, 'Must have rendered a valid fallback frame');
    assert.notEqual(sim.lastDrawnFrame, -1);

    // Mobile cover scaling check: image must fill full mobile height with centered horizontal crop
    const dims = calculateCoverDimensions(375, 812, 1920, 1080);
    assert.equal(dims.renderHeight, 812);
    assert.ok(dims.renderWidth >= 375);
    assert.equal(dims.offsetX, (375 - dims.renderWidth) / 2);
  });

  // =========================================================================
  // Scenario C: Interactive Bidirectional Scrubbing Explorer
  // =========================================================================
  it('4.3: Scenario C — Interactive Bidirectional Scrubbing Explorer', () => {
    const sim = new ScrollyCanvasSimulator();

    // 1. User scrolls to frame 120 (cybernetic face transformation)
    const progressAt120 = 120 / 191;
    sim.scrubTo(progressAt120);
    assert.equal(sim.lastDrawnFrame, 120);

    // 2. User reverses scroll back to frame 30 (natural human face)
    const progressAt30 = 30 / 191;
    sim.scrubTo(progressAt30);
    assert.equal(sim.lastDrawnFrame, 30);

    // 3. User repeatedly scrubs forward and backward across 60% threshold
    const oscillationSteps = [0.58, 0.62, 0.59, 0.61, 0.57, 0.63, 0.60];
    for (const step of oscillationSteps) {
      sim.scrubTo(step);
      const expected = getFrameIndexFromScroll(step, 192);
      assert.equal(sim.lastDrawnFrame, expected);
    }

    // Verify canvas context history recorded all draws cleanly
    const ctx = sim.canvas.getContext('2d');
    assert.ok(ctx.drawCalls.length >= 9, 'All scrub steps must have recorded 2D draw calls');
  });

  // =========================================================================
  // Scenario D: Multi-Device Breakpoint Transformer
  // =========================================================================
  it('4.4: Scenario D — Responsive Multi-Device Breakpoint Matrix Journey', () => {
    const devices = [
      { name: 'Mobile Portrait (iPhone SE)', w: 375, h: 667, dpr: 2.0 },
      { name: 'Large Mobile (iPhone 14 Pro Max)', w: 430, h: 932, dpr: 3.0 },
      { name: 'Tablet Portrait (iPad 10th Gen)', w: 820, h: 1180, dpr: 2.0 },
      { name: 'Tablet Landscape (iPad Pro)', w: 1366, h: 1024, dpr: 2.0 },
      { name: 'Laptop Standard (MacBook Air)', w: 1440, h: 900, dpr: 2.0 },
      { name: 'Desktop Full HD (1080p)', w: 1920, h: 1080, dpr: 1.0 },
      { name: 'Ultrawide Gaming Display', w: 3440, h: 1440, dpr: 1.0 },
    ];

    for (const dev of devices) {
      const sim = new ScrollyCanvasSimulator({
        viewportWidth: dev.w,
        viewportHeight: dev.h,
        dpr: dev.dpr,
      });

      sim.renderFrame(95);

      const dims = calculateCoverDimensions(dev.w, dev.h, 1920, 1080);
      assert.ok(
        dims.renderWidth >= dev.w - 0.01,
        `${dev.name}: renderWidth (${dims.renderWidth}) must completely cover viewport width (${dev.w})`
      );
      assert.ok(
        dims.renderHeight >= dev.h - 0.01,
        `${dev.name}: renderHeight (${dims.renderHeight}) must completely cover viewport height (${dev.h})`
      );

      // DPR clamped to <= 2.0
      const effectiveDpr = Math.min(dev.dpr, 2.0);
      assert.equal(sim.canvas.width, dev.w * effectiveDpr);
      assert.equal(sim.canvas.height, dev.h * effectiveDpr);
    }
  });

  // =========================================================================
  // Scenario E: Dark Aesthetic & Forensic Verification Gate
  // =========================================================================
  it('4.5: Scenario E — Aesthetic & Forensic Verification Gate (#121212, zero video, security)', () => {
    const srcDir = findComponentPath('src');

    // 1. Zero <video> tags verification across all component files
    function checkNoVideo(dir) {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory() && entry.name !== 'node_modules' && entry.name !== '.next') {
          checkNoVideo(full);
        } else if (/\.(tsx|ts|jsx|js)$/.test(entry.name)) {
          const content = fs.readFileSync(full, 'utf8');
          assert.ok(!/<video/i.test(content), `Found forbidden <video> tag in ${full}`);
        }
      }
    }
    checkNoVideo(srcDir);

    // 2. Strict #121212 hex background consistency
    const globalsCss = findComponentPath('src/app/globals.css');
    const cssText = fs.readFileSync(globalsCss, 'utf8');
    assert.ok(cssText.includes('#121212'), 'globals.css must contain #121212 background');

    // 3. Security: All target="_blank" links must feature rel="noopener noreferrer"
    const projectsFile = findComponentPath('src/components/Projects.tsx');
    const projectsText = fs.readFileSync(projectsFile, 'utf8');
    const targetBlankMatches = projectsText.match(/target="_blank"/g) || [];
    const relMatches = projectsText.match(/rel="noopener noreferrer"/g) || [];
    assert.ok(targetBlankMatches.length > 0, 'Must have external links with target="_blank"');
    assert.equal(
      targetBlankMatches.length,
      relMatches.length,
      'Every target="_blank" link must include rel="noopener noreferrer" for security'
    );
  });
});
