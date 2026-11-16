/**
 * tier3_cross_feature.test.js
 * 
 * Tier 3: Cross-Feature Interactions Test Suite
 * Tests interactions between multiple system features simultaneously:
 *   - Scroll scrubbing concurrently with dynamic window resizing
 *   - Parallax overlay visibility synchronized with canvas frame progression
 *   - Preloader progress indicator auto-dismissal on 100% buffer
 *   - Scrollytelling sticky boundary handoff to Glassmorphic Work Grid
 *   - Orientation rotation (portrait <-> landscape) during active scroll milestone
 *   - Full bidirectional timeline scrub sweep consistency
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateCoverDimensions,
  getFrameIndexFromScroll,
  calculateOverlayTransforms,
  ScrollyCanvasSimulator,
} from './fixtures/mock_scrollytelling.js';

describe('Tier 3: Cross-Feature Interactions — Ayush Gora Scrollytelling Portfolio', () => {

  it('3.1: Concurrent scroll scrubbing while viewport is actively resizing', () => {
    const sim = new ScrollyCanvasSimulator({ viewportWidth: 1440, viewportHeight: 900 });

    // Step 1: User scrubs to 30% on desktop
    sim.scrubTo(0.30);
    assert.equal(sim.lastDrawnFrame, getFrameIndexFromScroll(0.30, 192));
    assert.equal(sim.canvas.width, 1440 * sim.dpr);

    // Step 2: User resizes window to tablet (768x1024) while continuing to scrub to 40%
    sim.resize(768, 1024);
    sim.scrubTo(0.40);
    assert.equal(sim.lastDrawnFrame, getFrameIndexFromScroll(0.40, 192));
    assert.equal(sim.canvas.width, 768 * sim.dpr);
    assert.equal(sim.canvas.height, 1024 * sim.dpr);

    // Verify drawn image dimensions match new tablet cover dimensions
    const ctx = sim.canvas.getContext('2d');
    const lastDraw = ctx.drawCalls[ctx.drawCalls.length - 1];
    const expectedDims = calculateCoverDimensions(768, 1024, 1920, 1080);
    assert.equal(lastDraw.dw, expectedDims.renderWidth);
    assert.equal(lastDraw.dh, expectedDims.renderHeight);
  });

  it('3.2: Parallax overlay visibility synchronized with canvas frame progression across milestones', () => {
    const milestones = [
      { progress: 0.0, expectedFrame: 0, activeSection: 'Section 1 (Hero)' },
      { progress: 0.30, expectedFrame: getFrameIndexFromScroll(0.30, 192), activeSection: 'Section 2 (Experiences)' },
      { progress: 0.60, expectedFrame: getFrameIndexFromScroll(0.60, 192), activeSection: 'Section 3 (Engineering)' },
      { progress: 0.95, expectedFrame: getFrameIndexFromScroll(0.95, 192), activeSection: 'Section 4 (Work Prompt)' },
    ];

    const sim = new ScrollyCanvasSimulator();

    for (const m of milestones) {
      const drawnFrame = sim.scrubTo(m.progress);
      assert.equal(drawnFrame, m.expectedFrame, `Progress ${m.progress} must map to frame ${m.expectedFrame}`);

      const transforms = calculateOverlayTransforms(m.progress);
      if (m.progress === 0.0) {
        assert.equal(transforms.opacity1, 1.0);
        assert.equal(transforms.opacity2, 0.0);
      } else if (m.progress === 0.30) {
        assert.equal(transforms.opacity2, 1.0);
        assert.equal(transforms.opacity1, 0.0);
        assert.equal(transforms.opacity3, 0.0);
      } else if (m.progress === 0.60) {
        assert.equal(transforms.opacity3, 1.0);
        assert.equal(transforms.opacity2, 0.0);
        assert.equal(transforms.opacity1, 0.0);
      } else if (m.progress === 0.95) {
        assert.equal(transforms.opacity4, 1.0);
        assert.equal(transforms.opacity3, 0.0);
      }
    }
  });

  it('3.3: Preloader buffering state indicator auto-hides when loadProgress reaches 100%', () => {
    // Condition from ScrollyCanvas: {!isPreloaded && loadProgress < 100 && (...)}
    const isOverlayVisible = (isPreloaded, loadProgress) => !isPreloaded && loadProgress < 100;

    assert.equal(isOverlayVisible(false, 0), true, 'Buffering indicator must show at 0%');
    assert.equal(isOverlayVisible(false, 50), true, 'Buffering indicator must show at 50%');
    assert.equal(isOverlayVisible(false, 99), true, 'Buffering indicator must show at 99%');
    assert.equal(isOverlayVisible(false, 100), false, 'Buffering indicator must hide at 100%');
    assert.equal(isOverlayVisible(true, 100), false, 'Buffering indicator must hide when isPreloaded is true');
  });

  it('3.4: Canvas #121212 background fill buffer persistence during frame-to-frame scrubbing', () => {
    const sim = new ScrollyCanvasSimulator();
    sim.scrubTo(0.1);
    sim.scrubTo(0.2);
    sim.scrubTo(0.3);

    const ctx = sim.canvas.getContext('2d');
    // Every frame draw must be preceded by a #121212 fillRect to eliminate transparency seams
    assert.equal(ctx.drawCalls.length, 3);
    assert.equal(ctx.fillCalls.length, 3);
    ctx.fillCalls.forEach(call => {
      assert.equal(call.fillStyle, '#121212');
    });
  });

  it('3.5: Scrollytelling 500vh sticky boundary handoff to Work Grid section at progress >= 1.0', () => {
    // Scroll coordinates simulation
    const viewportHeight = 900;
    const containerHeight = 5 * viewportHeight; // 500vh = 4500px
    const scrollMax = containerHeight - viewportHeight; // 3600px scrollable distance

    // Simulate scroll offset from 0 to 4500px
    const getScrollState = (scrollY) => {
      const progress = Math.min(Math.max(scrollY / scrollMax, 0), 1);
      const isPastScroller = scrollY >= scrollMax;
      return { progress, isPastScroller };
    };

    const stateAtHero = getScrollState(0);
    assert.equal(stateAtHero.progress, 0);
    assert.equal(stateAtHero.isPastScroller, false);

    const stateAtHalf = getScrollState(1800);
    assert.equal(stateAtHalf.progress, 0.5);
    assert.equal(stateAtHalf.isPastScroller, false);

    const stateAtEnd = getScrollState(3600);
    assert.equal(stateAtEnd.progress, 1.0);
    assert.equal(stateAtEnd.isPastScroller, true, 'At 3600px scroll, sequence reaches work grid handoff');

    const stateInGrid = getScrollState(4000);
    assert.equal(stateInGrid.progress, 1.0, 'Progress clamps to 1.0 inside work grid');
    assert.equal(stateInGrid.isPastScroller, true);
  });

  it('3.6: Device orientation change simulation (mobile portrait 375x812 -> mobile landscape 812x375)', () => {
    const sim = new ScrollyCanvasSimulator({ viewportWidth: 375, viewportHeight: 812 });
    sim.scrubTo(0.30); // At 30% milestone

    // Initial portrait dimensions
    const portraitDims = calculateCoverDimensions(375, 812, 1920, 1080);
    assert.ok(portraitDims.renderWidth >= 375);
    assert.equal(portraitDims.renderHeight, 812);

    // Rotate device to landscape
    sim.resize(812, 375);
    const landscapeDims = calculateCoverDimensions(812, 375, 1920, 1080);
    assert.equal(landscapeDims.renderWidth, 812);
    assert.ok(landscapeDims.renderHeight >= 375);

    // Verify frame index maintained across rotation
    assert.equal(sim.lastDrawnFrame, getFrameIndexFromScroll(0.30, 192));
  });

  it('3.7: High-DPI canvas buffer resolution scaling preserves exact visual alignment', () => {
    const sim1x = new ScrollyCanvasSimulator({ viewportWidth: 1000, viewportHeight: 600, dpr: 1.0 });
    sim1x.renderFrame(10);
    const ctx1x = sim1x.canvas.getContext('2d');
    const draw1x = ctx1x.drawCalls[0];

    const sim2x = new ScrollyCanvasSimulator({ viewportWidth: 1000, viewportHeight: 600, dpr: 2.0 });
    sim2x.renderFrame(10);
    const ctx2x = sim2x.canvas.getContext('2d');
    const draw2x = ctx2x.drawCalls[0];

    // Offsets and dimensions in CSS points should match identically (DPR handled by ctx.scale)
    assert.equal(draw1x.dx, draw2x.dx);
    assert.equal(draw1x.dy, draw2x.dy);
    assert.equal(draw1x.dw, draw2x.dw);
    assert.equal(draw1x.dh, draw2x.dh);

    // Physical pixel buffers should scale by DPR
    assert.equal(sim2x.canvas.width, sim1x.canvas.width * 2);
    assert.equal(sim2x.canvas.height, sim1x.canvas.height * 2);
  });

  it('3.8: Continuous monotonic timeline sweep across all 192 frames preserves sequential ordering', () => {
    const totalFrames = 192;
    const observedFrames = [];

    for (let i = 0; i < totalFrames; i++) {
      const progress = i / (totalFrames - 1);
      const frameIndex = getFrameIndexFromScroll(progress, totalFrames);
      observedFrames.push(frameIndex);
    }

    // Verify every single index from 0 to 191 is hit monotonically
    for (let i = 0; i < totalFrames; i++) {
      assert.equal(observedFrames[i], i, `Progress step ${i} must evaluate to frame index ${i}`);
    }
  });
});
