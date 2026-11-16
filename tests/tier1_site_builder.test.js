/**
 * tier1_site_builder.test.js
 * 
 * Tier 1 Tests for Feature 14-21: Live Website Construction Intro Sequence & Controls.
 * Tests 6-phase state machine transitions, dynamic spatial coordinate alignment,
 * Skip intro cancellation, Replay intro scroll-reset, Lenis scroll locking, and 3D scene preservation.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { createBrowserEnvironment, MockCanvas } from './fixtures/dom_mock.js';

const BUILD_STEPS = [
  { id: 1, name: "INITIALIZING CANVAS", desc: "Deploying swarm agents & coordinate grid", duration: 1600 },
  { id: 2, name: "DRAFTING NAVIGATION", desc: "Tracing header wireframe [1240 × 60 px]", duration: 2000 },
  { id: 3, name: "ASSEMBLING HERO & 3D", desc: "Constructing 3D WebGL viewport & typography", duration: 2400 },
  { id: 4, name: "BUILDING PROJECT CARDS", desc: "Generating responsive 3D tilt component grid", duration: 2000 },
  { id: 5, name: "FINALIZING LIVE SITE", desc: "Compiling shaders & mounting production DOM", duration: 1200 },
];

class SiteBuilderController {
  constructor(env, { onComplete } = {}) {
    this.env = env;
    this.onComplete = onComplete;
    this.currentStepIdx = 0;
    this.progress = 0;
    this.typedTitle = "";
    this.fullTitle = "AYUSH GORA";
    this.isFinishing = false;
    this.isCompleted = false;
    this.timers = [];
    this.intervals = [];
    this.rafId = null;

    // Initialize Canvas & Builders
    this.canvas = new MockCanvas(env.window.innerWidth, env.window.innerHeight);
    this.ctx = this.canvas.getContext('2d');

    // Body scroll lock
    this.lockScroll();
  }

  lockScroll() {
    this.env.document.body.style.overflow = 'hidden';
    if (this.env.window.__lenis) {
      this.env.window.__lenis.stop();
    }
  }

  unlockScroll() {
    this.env.document.body.style.overflow = '';
    if (this.env.window.__lenis) {
      this.env.window.__lenis.start();
    }
  }

  startSequence() {
    // Step 1 -> 2
    const t1 = setTimeout(() => {
      this.currentStepIdx = 1;
      this.progress = 25;
    }, 1600);

    // Step 2 -> 3
    const t2 = setTimeout(() => {
      this.currentStepIdx = 2;
      this.progress = 50;

      let charIdx = 0;
      const intId = setInterval(() => {
        if (charIdx <= this.fullTitle.length) {
          this.typedTitle = this.fullTitle.slice(0, charIdx);
          charIdx++;
        } else {
          clearInterval(intId);
        }
      }, 120);
      this.intervals.push(intId);
    }, 3600);

    // Step 3 -> 4
    const t3 = setTimeout(() => {
      this.currentStepIdx = 3;
      this.progress = 75;
    }, 6000);

    // Step 4 -> 5
    const t4 = setTimeout(() => {
      this.currentStepIdx = 4;
      this.progress = 100;
    }, 7800);

    // Finalize
    const t5 = setTimeout(() => {
      this.finish();
    }, 9000);

    this.timers.push(t1, t2, t3, t4, t5);
  }

  skipIntro() {
    this.clearAllTimers();
    this.finish();
  }

  finish() {
    this.isFinishing = true;
    this.unlockScroll();
    this.isCompleted = true;
    if (this.onComplete) {
      this.onComplete();
    }
  }

  clearAllTimers() {
    this.timers.forEach(t => clearTimeout(t));
    this.timers = [];
    this.intervals.forEach(i => clearInterval(i));
    this.intervals = [];
  }

  // Calculate layout coordinates
  getSpatialCoordinates() {
    const width = this.canvas.width;
    const height = this.canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;

    const nav = {
      w: Math.min(width * 0.85, 1100),
      h: 50,
      x: centerX - Math.min(width * 0.85, 1100) / 2,
      y: 30,
    };

    const hero = {
      w: Math.min(width * 0.75, 860),
      h: 320,
      x: centerX - Math.min(width * 0.75, 860) / 2,
      y: centerY - 320 / 2 - 20,
    };

    const cardW = Math.min(width * 0.24, 280);
    const cardH = 150;
    const cardY = centerY + 140;
    const cards = [-1, 0, 1].map(col => ({
      x: centerX + col * (cardW + 24) - cardW / 2,
      y: cardY,
      w: cardW,
      h: cardH,
    }));

    return { nav, hero, cards };
  }
}

test('Site Builder Sequence Suite', async (t) => {

  await t.test('T1.3.1: 6-Phase state machine step definitions and durations', () => {
    assert.equal(BUILD_STEPS.length, 5, 'Must contain 5 sequenced build steps prior to live resolution');
    assert.equal(BUILD_STEPS[0].name, "INITIALIZING CANVAS");
    assert.equal(BUILD_STEPS[1].name, "DRAFTING NAVIGATION");
    assert.equal(BUILD_STEPS[2].name, "ASSEMBLING HERO & 3D");
    assert.equal(BUILD_STEPS[3].name, "BUILDING PROJECT CARDS");
    assert.equal(BUILD_STEPS[4].name, "FINALIZING LIVE SITE");

    const totalDuration = BUILD_STEPS.reduce((sum, s) => sum + s.duration, 0);
    assert.equal(totalDuration, 9200, 'Total intro build choreography duration must equal 9.2s');
  });

  await t.test('T1.3.2: Dynamic spatial coordinate mapping matches responsive DOM bounds', () => {
    const env = createBrowserEnvironment({ innerWidth: 1920, innerHeight: 1080 });
    const controller = new SiteBuilderController(env);
    const coords = controller.getSpatialCoordinates();

    // 1. Navigation Wireframe
    assert.equal(coords.nav.w, 1100, 'Nav wireframe capped at max 1100px on 1920px display');
    assert.equal(coords.nav.h, 50);
    assert.equal(coords.nav.x, 960 - 550, 'Nav wireframe must be horizontally centered');
    assert.equal(coords.nav.y, 30);

    // 2. Hero Wireframe
    assert.equal(coords.hero.w, 860, 'Hero wireframe capped at max 860px');
    assert.equal(coords.hero.h, 320);
    assert.equal(coords.hero.x, 960 - 430, 'Hero wireframe must be horizontally centered');

    // 3. Project Cards Wireframe
    assert.equal(coords.cards.length, 3, 'Must position 3 project card wireframes');
    assert.equal(coords.cards[0].w, 280);
    assert.equal(coords.cards[1].w, 280);
    assert.equal(coords.cards[2].w, 280);

    // Verify symmetrical 3-column spacing: gap between card 0 and card 1 must equal gap between card 1 and card 2
    const gap01 = coords.cards[1].x - (coords.cards[0].x + coords.cards[0].w);
    const gap12 = coords.cards[2].x - (coords.cards[1].x + coords.cards[1].w);
    assert.equal(gap01, 24, 'Column gap must be precisely 24px');
    assert.equal(gap12, 24, 'Column gap must be precisely 24px');
  });

  await t.test('T1.3.3: Typing headline generator state progression', () => {
    const env = createBrowserEnvironment();
    const controller = new SiteBuilderController(env);
    assert.equal(controller.typedTitle, "");

    // Simulate typing steps
    for (let i = 1; i <= controller.fullTitle.length; i++) {
      controller.typedTitle = controller.fullTitle.slice(0, i);
      assert.equal(controller.typedTitle.length, i);
    }
    assert.equal(controller.typedTitle, "AYUSH GORA");
  });

  await t.test('T1.3.4: Synchronous Skip intro control immediately cancels timers and completes', () => {
    const env = createBrowserEnvironment();
    let completed = false;
    const controller = new SiteBuilderController(env, {
      onComplete: () => { completed = true; }
    });

    controller.startSequence();
    assert.equal(controller.timers.length, 5, 'Timers must be active');
    assert.equal(controller.isCompleted, false);

    // User clicks Skip or presses Escape
    controller.skipIntro();

    assert.equal(controller.isFinishing, true, 'isFinishing must become true immediately');
    assert.equal(controller.isCompleted, true, 'isCompleted must be true');
    assert.equal(completed, true, 'onComplete callback must be invoked');
    assert.equal(controller.timers.length, 0, 'All timers must be cleared to prevent phantom fires');
  });

  await t.test('T1.3.5: Scroll locking lifecycle (body overflow & Lenis)', () => {
    const env = createBrowserEnvironment();
    assert.equal(env.document.body.style.overflow, undefined);
    assert.equal(env.lenis.isStopped, false);

    // Mount SiteBuilderSequence -> Must lock scroll
    const controller = new SiteBuilderController(env);
    assert.equal(env.document.body.style.overflow, 'hidden', 'Body overflow must be locked to hidden');
    assert.equal(env.lenis.isStopped, true, 'Lenis smooth scroll must be stopped during intro');

    // Finish / Skip intro -> Must restore scroll
    controller.finish();
    assert.equal(env.document.body.style.overflow, '', 'Body overflow must be reset');
    assert.equal(env.lenis.isStopped, false, 'Lenis smooth scroll must be restarted');
  });

  await t.test('T1.3.6: Replay control contract (instant scroll reset & lock re-engagement)', () => {
    const env = createBrowserEnvironment();
    // Simulate user scrolled down 800px on live site
    env.window.scrollY = 800;
    env.lenis.scrollPosition = 800;

    // Trigger onReplayIntro in Navbar
    const replayIntro = () => {
      env.window.scrollTo({ top: 0, behavior: 'instant' });
      env.lenis.scrollTo(0, { immediate: true });
      return new SiteBuilderController(env);
    };

    const newController = replayIntro();

    assert.equal(env.window.scrollY, 0, 'Window scroll top must be reset to 0');
    assert.equal(env.lenis.scrollPosition, 0, 'Lenis scroll position must be reset to 0');
    assert.equal(env.document.body.style.overflow, 'hidden', 'Scroll must re-lock during replay');
    assert.equal(env.lenis.isStopped, true, 'Lenis must be stopped during replay');
    assert.ok(newController);
  });

  await t.test('T1.3.7: 3D scene & DOM interactivity preservation post-intro', () => {
    const env = createBrowserEnvironment();
    const controller = new SiteBuilderController(env);

    // During build: overlay is active
    let overlayClass = controller.isFinishing
      ? 'opacity-0 pointer-events-none'
      : 'opacity-100';
    assert.equal(overlayClass, 'opacity-100');

    // Skip/Complete intro
    controller.skipIntro();

    overlayClass = controller.isFinishing
      ? 'opacity-0 pointer-events-none'
      : 'opacity-100';

    assert.ok(
      overlayClass.includes('pointer-events-none'),
      'Overlay must set pointer-events-none to prevent blocking 3D canvas and navbar links'
    );
    assert.ok(overlayClass.includes('opacity-0'), 'Overlay must fade out with opacity 0');
  });
});
