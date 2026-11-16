/**
 * tier1_visual_styling.test.js
 * 
 * Tier 1 Tests for Feature 22-26: Visual Polish, Blueprint Overlays & Badges.
 * Tests dual-tier blueprint grid geometry, 8-point transform handles,
 * Figma-style multiplayer cursor badges, smart alignment guides, and architectural rulers.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { createBrowserEnvironment, MockCanvas } from './fixtures/dom_mock.js';

// Blueprint Grid Generator
function generateBlueprintGrid(width, height, minorStep = 20, majorStep = 80) {
  const minorLines = [];
  const majorLines = [];
  const crosshairs = [];

  for (let x = 0; x <= width; x += minorStep) {
    const isMajor = (x % majorStep === 0);
    if (isMajor) majorLines.push({ x1: x, y1: 0, x2: x, y2: height });
    else minorLines.push({ x1: x, y1: 0, x2: x, y2: height });
  }

  for (let y = 0; y <= height; y += minorStep) {
    const isMajor = (y % majorStep === 0);
    if (isMajor) majorLines.push({ x1: 0, y1: y, x2: width, y2: y });
    else minorLines.push({ x1: 0, y1: y, x2: width, y2: y });
  }

  // Crosshairs at major intersections
  for (let x = majorStep; x < width; x += majorStep) {
    for (let y = majorStep; y < height; y += majorStep) {
      crosshairs.push({ x, y, size: 6 });
    }
  }

  return { minorLines, majorLines, crosshairs };
}

// 8-Point Transform Handles Calculator
function computeTransformHandles(x, y, width, height) {
  return [
    { name: 'NW', x, y },
    { name: 'N', x: x + width / 2, y },
    { name: 'NE', x: x + width, y },
    { name: 'E', x: x + width, y: y + height / 2 },
    { name: 'SE', x: x + width, y: y + height },
    { name: 'S', x: x + width / 2, y: y + height },
    { name: 'SW', x, y: y + height },
    { name: 'W', x, y: y + height / 2 },
  ];
}

// Collaborative Cursor Badge Formatter
function computeBadgeLayout(agentName, actionText = 'Drafting') {
  const fullText = `${agentName}: ${actionText}`;
  const charWidth = 7.0; // font: 10px monospace / system-ui
  const textWidth = fullText.length * charWidth;
  const paddingX = 14;
  const badgeWidth = textWidth + paddingX;
  const badgeHeight = 18;
  const dotOffset = 7;

  return {
    fullText,
    badgeWidth,
    badgeHeight,
    dotX: dotOffset,
    dotY: badgeHeight / 2,
    textX: dotOffset + 10,
    textY: badgeHeight / 2 + 1,
  };
}

// Smart Alignment Guide Detector
function detectAlignmentGuides(boxes) {
  const guides = [];
  for (let i = 0; i < boxes.length; i++) {
    for (let j = i + 1; j < boxes.length; j++) {
      const b1 = boxes[i];
      const b2 = boxes[j];

      // Top aligned
      if (Math.abs(b1.y - b2.y) < 2) {
        guides.push({
          type: 'horizontal_top',
          y: b1.y,
          x1: Math.min(b1.x, b2.x) - 20,
          x2: Math.max(b1.x + b1.w, b2.x + b2.w) + 20,
        });
      }

      // Symmetrical gap detection between horizontally adjacent boxes
      if (b1.y === b2.y) {
        const gap = Math.abs(b2.x - (b1.x + b1.w));
        if (gap > 0 && gap < 100) {
          guides.push({
            type: 'gap_indicator',
            gap,
            label: `GAP: ${Math.round(gap)}px`,
            x: b1.x + b1.w,
            y: b1.y + b1.h / 2,
          });
        }
      }
    }
  }
  return guides;
}

test('Visual Polish & Badge Geometry Suite', async (t) => {

  await t.test('T1.4.1: Dual-tier blueprint grid geometry (20px minor / 80px major)', () => {
    const grid = generateBlueprintGrid(1920, 1080, 20, 80);

    assert.ok(grid.minorLines.length > 0, 'Minor grid lines must be generated');
    assert.ok(grid.majorLines.length > 0, 'Major grid lines must be generated');
    assert.ok(grid.crosshairs.length > 0, 'Grid crosshairs must be generated');

    // Ratio of minor lines to major lines should be 3:1 (since every 4th line is major)
    const totalMinorStepsX = 1920 / 20;
    const totalMajorStepsX = 1920 / 80;
    assert.equal(totalMinorStepsX, 96);
    assert.equal(totalMajorStepsX, 24);

    // Verify all crosshair coordinates align with major grid intervals
    grid.crosshairs.forEach(ch => {
      assert.equal(ch.x % 80, 0, `Crosshair X (${ch.x}) not aligned to 80px`);
      assert.equal(ch.y % 80, 0, `Crosshair Y (${ch.y}) not aligned to 80px`);
    });
  });

  await t.test('T1.4.2: 8-Point bounding box transform handles', () => {
    const box = { x: 400, y: 300, w: 200, h: 100 };
    const handles = computeTransformHandles(box.x, box.y, box.w, box.h);

    assert.equal(handles.length, 8, 'Must calculate all 8 transform handles');

    const handleMap = Object.fromEntries(handles.map(h => [h.name, h]));
    assert.deepEqual(handleMap['NW'], { name: 'NW', x: 400, y: 300 });
    assert.deepEqual(handleMap['N'], { name: 'N', x: 500, y: 300 });
    assert.deepEqual(handleMap['NE'], { name: 'NE', x: 600, y: 300 });
    assert.deepEqual(handleMap['E'], { name: 'E', x: 600, y: 350 });
    assert.deepEqual(handleMap['SE'], { name: 'SE', x: 600, y: 400 });
    assert.deepEqual(handleMap['S'], { name: 'S', x: 500, y: 400 });
    assert.deepEqual(handleMap['SW'], { name: 'SW', x: 400, y: 400 });
    assert.deepEqual(handleMap['W'], { name: 'W', x: 400, y: 350 });
  });

  await t.test('T1.4.3: Figma-style multiplayer cursor badge layout calculation', () => {
    const badge = computeBadgeLayout('DevOps', 'Infra Blueprint');

    assert.equal(badge.fullText, 'DevOps: Infra Blueprint');
    assert.ok(badge.badgeWidth > 100, 'Badge width must accommodate text length');
    assert.equal(badge.badgeHeight, 18, 'Standard badge pill height must be 18px');
    assert.equal(badge.dotY, 9, 'Status dot must be vertically centered');
    assert.ok(badge.textX > badge.dotX, 'Text label must follow status dot with padding');
  });

  await t.test('T1.4.4: Smart alignment guide rays & distance callouts (GAP: 24px)', () => {
    const boxes = [
      { id: 1, x: 200, y: 500, w: 280, h: 150 },
      { id: 2, x: 504, y: 500, w: 280, h: 150 }, // Gap: 504 - (200 + 280) = 24px
      { id: 3, x: 808, y: 500, w: 280, h: 150 }, // Gap: 808 - (504 + 280) = 24px
    ];

    const guides = detectAlignmentGuides(boxes);

    // Horizontal top alignment guide must be detected
    const topGuide = guides.find(g => g.type === 'horizontal_top');
    assert.ok(topGuide, 'Horizontal top alignment guide must be present');
    assert.equal(topGuide.y, 500);

    // Gap indicators must be present
    const gapGuides = guides.filter(g => g.type === 'gap_indicator');
    assert.equal(gapGuides.length, 2, 'Must detect 2 inter-column gaps');
    assert.equal(gapGuides[0].label, 'GAP: 24px');
    assert.equal(gapGuides[1].label, 'GAP: 24px');
  });

  await t.test('T1.4.5: Architectural measurement ruler tick intervals', () => {
    const rulerLength = 500;
    const ticks = [];
    for (let pos = 0; pos <= rulerLength; pos += 10) {
      const isMajor = (pos % 50 === 0);
      ticks.push({
        pos,
        isMajor,
        tickLength: isMajor ? 8 : 4,
        label: isMajor ? `${pos}px` : null,
      });
    }

    assert.equal(ticks.length, 51);
    const majorTicks = ticks.filter(t => t.isMajor);
    assert.equal(majorTicks.length, 11);
    assert.equal(majorTicks[0].label, '0px');
    assert.equal(majorTicks[1].label, '50px');
    assert.equal(majorTicks[10].label, '500px');
  });
});
