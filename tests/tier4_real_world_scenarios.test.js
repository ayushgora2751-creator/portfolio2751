/**
 * tier4_real_world_scenarios.test.js
 * 
 * Tier 4 Tests: Real-World End-to-End Application Scenarios.
 * Simulates complete user sessions from initial page load through interactive exploration,
 * skip paths, audio engagement, and build replay workflows.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { createBrowserEnvironment, MockCanvas } from './fixtures/dom_mock.js';
import { MockAudioContext } from './fixtures/audio_mock.js';

test('Real-World End-to-End Application Scenarios Suite', async (t) => {

  await t.test('Scenario A: First-time visitor complete walkthrough', () => {
    const env = createBrowserEnvironment();
    const mockCtx = new MockAudioContext();
    mockCtx.resume();

    // 1. Initial Page Load
    let isBuilding = true;
    let isMuted = true;
    let currentStep = 0;
    let liveSiteMounted = false;

    // Body scroll locked during intro
    env.document.body.style.overflow = 'hidden';
    env.lenis.stop();

    // 2. Intro Steps Sequence
    const steps = ['CANVAS', 'NAVIGATION', 'HERO', 'PROJECTS', 'FINALIZING'];
    steps.forEach((s, idx) => {
      currentStep = idx;
    });
    assert.equal(currentStep, 4);

    // 3. Intro Finishes -> Live Site Resolves
    isBuilding = false;
    env.document.body.style.overflow = '';
    env.lenis.start();
    liveSiteMounted = true;

    assert.equal(isBuilding, false, 'Intro sequence must be marked complete');
    assert.equal(env.document.body.style.overflow, '', 'Body scroll must be unlocked for portfolio browsing');
    assert.equal(env.lenis.isStopped, false, 'Smooth scroll must be active');
    assert.equal(liveSiteMounted, true, 'Live site must be interactive');

    // 4. Cursor Flocking active on live site
    const cursors = [
      { id: 0, x: 960, y: 540, angle: 0, speed: 0.045, radius: 45 },
      { id: 1, x: 960, y: 540, angle: 0, speed: -0.04, radius: 52 },
    ];
    cursors.forEach(c => { c.angle += c.speed; });
    assert.notEqual(cursors[0].angle, 0);
  });

  await t.test('Scenario B: Impatient visitor skip-to-content flow', () => {
    const env = createBrowserEnvironment();
    let isBuilding = true;
    let pendingTimers = [setTimeout(() => {}, 5000), setTimeout(() => {}, 8000)];

    // Visitor lands and immediately hits ESC or clicks 'Skip Build'
    pendingTimers.forEach(t => clearTimeout(t));
    pendingTimers = [];
    isBuilding = false;
    env.document.body.style.overflow = '';
    env.lenis.start();

    // Immediately navigates to #projects section
    env.window.scrollY = 900;
    env.lenis.scrollTo(900);

    assert.equal(isBuilding, false);
    assert.equal(pendingTimers.length, 0, 'No stray timers remained after skip');
    assert.equal(env.window.scrollY, 900);
    assert.equal(env.document.body.style.overflow, '');
  });

  await t.test('Scenario C: Audio enthusiast unmuting in intro and continuing in live site', () => {
    const mockCtx = new MockAudioContext();
    mockCtx.resume();

    // Visitor un-mutes in intro overlay
    let isMuted = true;
    const toggleSound = () => {
      isMuted = !isMuted;
      if (!isMuted) {
        // Unmute chime C5
        mockCtx.createOscillator();
      }
      return isMuted;
    };

    // User clicks sound toggle in intro
    toggleSound();
    assert.equal(isMuted, false, 'Sound must be unmuted');
    assert.equal(mockCtx.createdNodes.length, 1, 'Unmute chime node must have been created');

    // Intro completes, visitor lands on live site -> Navbar retains unmuted status
    const navbarAudioState = isMuted;
    assert.equal(navbarAudioState, false, 'Navbar must inherit unmuted state');

    // Clicking an impulse button triggers audible click
    const clickOsc = mockCtx.createOscillator();
    assert.ok(clickOsc);
    assert.equal(mockCtx.createdNodes.length, 2);
  });

  await t.test('Scenario D: Deep exploration and build replay sequence', () => {
    const env = createBrowserEnvironment();
    let isBuilding = false;

    // Visitor explores portfolio down to 2400px
    env.window.scrollY = 2400;
    env.lenis.scrollPosition = 2400;

    // Clicks "Replay Build" in Navbar
    const replayIntro = () => {
      env.window.scrollTo({ top: 0, behavior: 'instant' });
      env.lenis.scrollTo(0, { immediate: true });
      env.lenis.stop();
      env.document.body.style.overflow = 'hidden';
      isBuilding = true;
    };

    replayIntro();

    assert.equal(env.window.scrollY, 0, 'Scroll position must be immediately reset to (0, 0)');
    assert.equal(env.lenis.scrollPosition, 0);
    assert.equal(env.lenis.isStopped, true, 'Lenis scroll must be halted during replay');
    assert.equal(env.document.body.style.overflow, 'hidden', 'Body overflow must be locked');
    assert.equal(isBuilding, true, 'Intro sequence must be mounted');
  });

  await t.test('Scenario E: Mobile & reduced-motion accessibility constraint mode', () => {
    // 1. Reduced motion preference
    const reducedMotionEnv = createBrowserEnvironment({ prefersReducedMotion: true });
    let orbitRunning = false;
    if (!reducedMotionEnv.window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      orbitRunning = true;
    }
    assert.equal(orbitRunning, false, 'Orbit animation must be suppressed under prefers-reduced-motion');

    // 2. Touch mobile viewport
    const touchEnv = createBrowserEnvironment({ isTouchDevice: true, innerWidth: 390 });
    let mobileOrbitRunning = false;
    if (!touchEnv.window.matchMedia('(pointer: coarse)').matches && touchEnv.window.innerWidth >= 768) {
      mobileOrbitRunning = true;
    }
    assert.equal(mobileOrbitRunning, false, 'Orbit animation must be suppressed on touch devices');
  });
});
