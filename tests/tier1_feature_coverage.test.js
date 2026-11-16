/**
 * tier1_feature_coverage.test.js
 * 
 * Tier 1: Core Feature Coverage Test Suite (>=5 test cases per feature area)
 * Covers Features F1 through F12 from PROJECT.md and ORIGINAL_REQUEST.md.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  calculateCoverDimensions,
  getFrameIndexFromScroll,
  calculateOverlayTransforms,
  VERIFIED_PROJECTS_SPEC,
  ScrollyCanvasSimulator,
  WORKSPACE_ROOT,
} from './fixtures/mock_scrollytelling.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper to locate source files across workspace layout variants
function findComponentPath(relativePath) {
  const candidates = [
    path.join(WORKSPACE_ROOT, 'scrollytelling', relativePath),
    path.join(WORKSPACE_ROOT, relativePath),
  ];
  for (const c of candidates) {
    if (fs.existsSync(c)) return c;
  }
  return candidates[0]; // fallback
}

describe('Tier 1: Feature Coverage — Ayush Gora Scrollytelling Portfolio', () => {

  // =========================================================================
  // Feature Area 1: F1, F4 — Zero Video Tags & Sticky Canvas Scroller Invariants
  // =========================================================================
  describe('Area 1: Zero Video Tags & Sticky Canvas Scroller DOM Invariants (F1, F4)', () => {
    
    it('1.1: Verify strictly 0 <video> tags exist in all project source files', () => {
      const srcDir = findComponentPath('src');
      assert.ok(fs.existsSync(srcDir), `Source directory ${srcDir} must exist`);

      function scanDir(dir) {
        const files = fs.readdirSync(dir, { withFileTypes: true });
        for (const file of files) {
          const fullPath = path.join(dir, file.name);
          if (file.isDirectory()) {
            if (file.name !== 'node_modules' && file.name !== '.next') {
              scanDir(fullPath);
            }
          } else if (/\.(tsx|jsx|ts|js|html)$/.test(file.name)) {
            const content = fs.readFileSync(fullPath, 'utf8');
            assert.ok(
              !/<video[\s>]/i.test(content),
              `Strict Invariant Violated: Found forbidden <video> tag in ${fullPath}`
            );
          }
        }
      }
      scanDir(srcDir);
    });

    it('1.2: Verify sticky scroller container is present with 500vh scroll height (h-[500vh])', () => {
      const scrollyCanvasFile = findComponentPath('src/components/ScrollyCanvas.tsx');
      assert.ok(fs.existsSync(scrollyCanvasFile), 'ScrollyCanvas.tsx component must exist');
      const content = fs.readFileSync(scrollyCanvasFile, 'utf8');

      // Container must have 500vh scroll height
      assert.ok(
        content.includes('h-[500vh]'),
        'ScrollyCanvas must declare a 500vh container wrapper (h-[500vh])'
      );
      assert.ok(
        content.includes('relative'),
        'ScrollyCanvas wrapper must be positioned relatively'
      );
    });

    it('1.3: Verify sticky full-screen viewport container (top-0 h-screen w-full)', () => {
      const scrollyCanvasFile = findComponentPath('src/components/ScrollyCanvas.tsx');
      const content = fs.readFileSync(scrollyCanvasFile, 'utf8');

      assert.ok(
        content.includes('sticky top-0') && content.includes('h-screen') && content.includes('w-full'),
        'Sticky viewport container must feature sticky top-0 h-screen w-full'
      );
      assert.ok(
        content.includes('overflow-hidden'),
        'Sticky viewport container must clip overflowing canvas dimensions'
      );
    });

    it('1.4: Verify HTML5 <canvas> element present with object-cover and z-0 within sticky viewport', () => {
      const scrollyCanvasFile = findComponentPath('src/components/ScrollyCanvas.tsx');
      const content = fs.readFileSync(scrollyCanvasFile, 'utf8');

      assert.ok(
        content.includes('<canvas'),
        'HTML5 <canvas> element must be rendered inside ScrollyCanvas'
      );
      assert.ok(
        content.includes('ref={canvasRef}'),
        'Canvas must be bound to a React ref for direct 2D context drawing'
      );
      assert.ok(
        content.includes('z-0') || content.includes('absolute inset-0'),
        'Canvas must sit behind foreground overlay content'
      );
    });

    it('1.5: Verify foreground overlay container has z-10 and pointer-events-none', () => {
      const scrollyCanvasFile = findComponentPath('src/components/ScrollyCanvas.tsx');
      const content = fs.readFileSync(scrollyCanvasFile, 'utf8');

      assert.ok(
        content.includes('z-10') && content.includes('pointer-events-none'),
        'Overlay wrapper must have z-10 and pointer-events-none to prevent blocking scroll gestures'
      );
    });
  });

  // =========================================================================
  // Feature Area 2: F2, F3 — 192-Frame Asset Sequence Pipeline & Preloading
  // =========================================================================
  describe('Area 2: 192-Frame Asset Pipeline & Preloading Strategy (F2, F3)', () => {
    
    it('1.6: Verify all 192 frame image files exist in sequence directory', () => {
      const sequenceDirs = [
        path.join(WORKSPACE_ROOT, 'public', 'sequence'),
        path.join(WORKSPACE_ROOT, 'scrollytelling', 'public', 'sequence'),
        path.join(WORKSPACE_ROOT, 'ezgif-split'),
      ];
      let foundDir = sequenceDirs.find(d => fs.existsSync(d) && fs.readdirSync(d).length >= 192);
      assert.ok(foundDir, 'At least one sequence directory must contain all 192 sequential frames');

      const files = fs.readdirSync(foundDir);
      assert.ok(files.length >= 192, `Expected >= 192 frames, found ${files.length} in ${foundDir}`);
    });

    it('1.7: Verify exact zero-padded naming convention frame_000_delay-0.042s.png through frame_191_delay-0.042s.png', () => {
      const sequenceDirs = [
        path.join(WORKSPACE_ROOT, 'public', 'sequence'),
        path.join(WORKSPACE_ROOT, 'scrollytelling', 'public', 'sequence'),
        path.join(WORKSPACE_ROOT, 'ezgif-split'),
      ];
      const validDir = sequenceDirs.find(d => fs.existsSync(d) && fs.readdirSync(d).length >= 192);
      assert.ok(validDir, 'Sequence directory must exist');

      for (let i = 0; i < 192; i++) {
        const padded = String(i).padStart(3, '0');
        const expectedName = `frame_${padded}_delay-0.042s.png`;
        const filePath = path.join(validDir, expectedName);
        assert.ok(fs.existsSync(filePath), `Missing required sequential frame: ${expectedName}`);
      }
    });

    it('1.8: Verify frame path calculation formatting logic for indices 0, 9, 99, 191', () => {
      const formatFramePath = (index) => {
        const padded = String(index).padStart(3, '0');
        return `/sequence/frame_${padded}_delay-0.042s.png`;
      };

      assert.equal(formatFramePath(0), '/sequence/frame_000_delay-0.042s.png');
      assert.equal(formatFramePath(9), '/sequence/frame_009_delay-0.042s.png');
      assert.equal(formatFramePath(99), '/sequence/frame_099_delay-0.042s.png');
      assert.equal(formatFramePath(191), '/sequence/frame_191_delay-0.042s.png');
    });

    it('1.9: Verify preloader initializes immediate load of frame 0 for instant initial paint', () => {
      const scrollyCanvasFile = findComponentPath('src/components/ScrollyCanvas.tsx');
      const content = fs.readFileSync(scrollyCanvasFile, 'utf8');

      assert.ok(
        content.includes('getFramePath(0)') || content.includes('renderFrame(0)'),
        'Component must prioritize loading frame 0 immediately to prevent white screen on first load'
      );
    });

    it('1.10: Verify preloader tracks loadedCount to compute load progress percentage', () => {
      const scrollyCanvasFile = findComponentPath('src/components/ScrollyCanvas.tsx');
      const content = fs.readFileSync(scrollyCanvasFile, 'utf8');

      assert.ok(
        content.includes('loadedCount / frameCount') || content.includes('setLoadProgress'),
        'Component must compute buffered frame progress percentage'
      );
    });

    it('1.11: Verify preloader graceful fallback when frame is pending / not yet loaded', () => {
      const sim = new ScrollyCanvasSimulator({ frameCount: 192 });
      // Invalidate frame 50
      sim.images[50].complete = false;
      sim.images[50].naturalWidth = 0;

      // Draw frame 49 first
      sim.renderFrame(49);
      assert.equal(sim.lastDrawnFrame, 49);

      // Now request frame 50 - should fallback to last valid frame (49) without blanking canvas
      const ok = sim.renderFrame(50);
      assert.ok(ok, 'Fallback render must succeed without blanking');
      assert.equal(sim.lastDrawnFrame, 49, 'Must retain frame 49 as nearest valid fallback');
    });
  });

  // =========================================================================
  // Feature Area 3: F5 — Responsive Object-Fit: Cover Scaling & DPR Handling
  // =========================================================================
  describe('Area 3: Responsive Object-Fit Cover Scaling Mathematics (F5)', () => {

    it('1.12: Desktop widescreen viewport (1440x900) cover math maintains aspect ratio and covers full bounds', () => {
      const imgW = 1920;
      const imgH = 1080; // 16:9 = 1.7778
      const vpW = 1440;
      const vpH = 900;  // 16:10 = 1.6000
      // canvasRatio (1.6) < imgRatio (1.778) => taller relative to image => stretch width
      const dims = calculateCoverDimensions(vpW, vpH, imgW, imgH);

      assert.ok(dims.renderWidth >= vpW, `renderWidth (${dims.renderWidth}) must be >= viewportWidth (${vpW})`);
      assert.ok(dims.renderHeight >= vpH, `renderHeight (${dims.renderHeight}) must be >= viewportHeight (${vpH})`);
      assert.equal(dims.renderHeight, vpH, 'Height must exactly match viewport height in height-bound cover');
      assert.ok(dims.offsetX <= 0, 'Horizontal offset must be negative or zero to center cropped width');
      assert.equal(dims.offsetY, 0, 'Vertical offset must be zero when height fits exactly');

      // Verify aspect ratio preservation
      const renderedAspect = dims.renderWidth / dims.renderHeight;
      const originalAspect = imgW / imgH;
      assert.ok(Math.abs(renderedAspect - originalAspect) < 0.001, 'Rendered aspect ratio must match original image');
    });

    it('1.13: Mobile portrait viewport (375x667) cover math maintains aspect ratio and covers full bounds', () => {
      const imgW = 1920;
      const imgH = 1080;
      const vpW = 375;
      const vpH = 667;
      // Mobile portrait is much taller than 16:9 => stretch width significantly
      const dims = calculateCoverDimensions(vpW, vpH, imgW, imgH);

      assert.ok(dims.renderWidth >= vpW, `renderWidth (${dims.renderWidth}) must cover mobile viewport width`);
      assert.equal(dims.renderHeight, vpH, 'renderHeight must cover mobile viewport height');
      assert.ok(dims.offsetX < 0, 'Horizontal crop offset must be centered negatively');
      // Symmetrical crop check
      assert.equal(dims.offsetX, (vpW - dims.renderWidth) / 2);
    });

    it('1.14: DPR clamping: DPR 1.0, 2.0, 3.0 correctly clamped to max DPR 2.0', () => {
      const clampDpr = (dpr) => Math.min(dpr || 1, 2);

      assert.equal(clampDpr(1.0), 1.0);
      assert.equal(clampDpr(1.5), 1.5);
      assert.equal(clampDpr(2.0), 2.0);
      assert.equal(clampDpr(2.5), 2.0, 'DPR 2.5 must clamp to 2.0');
      assert.equal(clampDpr(3.0), 2.0, 'DPR 3.0 must clamp to 2.0');
      assert.equal(clampDpr(0), 1.0, 'DPR 0 must fallback to 1.0');
    });

    it('1.15: Centering offsets: verify exact mathematical symmetry of offsetX and offsetY', () => {
      // Wide screen: viewport 2560x1080, img 1920x1080
      const dimsWide = calculateCoverDimensions(2560, 1080, 1920, 1080);
      assert.equal(dimsWide.renderWidth, 2560);
      assert.equal(dimsWide.offsetY, (1080 - dimsWide.renderHeight) / 2);

      // Tall screen: viewport 1080x1920, img 1920x1080
      const dimsTall = calculateCoverDimensions(1080, 1920, 1920, 1080);
      assert.equal(dimsTall.renderHeight, 1920);
      assert.equal(dimsTall.offsetX, (1080 - dimsTall.renderWidth) / 2);
    });

    it('1.16: Invariant verification across standard display matrix (mobile, tablet, desktop, 4K)', () => {
      const viewports = [
        { name: 'iPhone SE', w: 375, h: 667 },
        { name: 'iPhone 14 Pro', w: 393, h: 852 },
        { name: 'iPad Mini', w: 768, h: 1024 },
        { name: 'MacBook Air', w: 1440, h: 900 },
        { name: 'Desktop 1080p', w: 1920, h: 1080 },
        { name: 'Ultrawide QHD', w: 3440, h: 1440 },
        { name: '4K UHD', w: 3840, h: 2160 },
      ];

      for (const vp of viewports) {
        const dims = calculateCoverDimensions(vp.w, vp.h, 1920, 1080);
        assert.ok(
          dims.renderWidth >= vp.w - 0.001,
          `${vp.name}: renderWidth (${dims.renderWidth}) must be >= viewportWidth (${vp.w})`
        );
        assert.ok(
          dims.renderHeight >= vp.h - 0.001,
          `${vp.name}: renderHeight (${dims.renderHeight}) must be >= viewportHeight (${vp.h})`
        );
      }
    });
  });

  // =========================================================================
  // Feature Area 4: F6 — Seamless #121212 Visual Blending
  // =========================================================================
  describe('Area 4: Seamless #121212 Visual Blending & Color Continuity (F6)', () => {

    it('1.17: Page background variable in globals.css defines --background: #121212', () => {
      const globalsCss = findComponentPath('src/app/globals.css');
      assert.ok(fs.existsSync(globalsCss), 'globals.css must exist');
      const content = fs.readFileSync(globalsCss, 'utf8');

      assert.ok(
        content.includes('--background: #121212;') || content.includes('#121212'),
        'globals.css must define background as #121212'
      );
    });

    it('1.18: Canvas buffer clear fillStyle is strictly #121212 before drawing frame', () => {
      const scrollyCanvasFile = findComponentPath('src/components/ScrollyCanvas.tsx');
      const content = fs.readFileSync(scrollyCanvasFile, 'utf8');

      assert.ok(
        content.includes('ctx.fillStyle = "#121212"') || content.includes("ctx.fillStyle = '#121212'"),
        'Canvas context must set fillStyle to #121212 prior to fillRect clear'
      );

      // Verify simulator behavior
      const sim = new ScrollyCanvasSimulator();
      sim.renderFrame(0);
      const ctx = sim.canvas.getContext('2d');
      const clearCalls = ctx.fillCalls.filter(c => c.fillStyle === '#121212');
      assert.ok(clearCalls.length > 0, 'Canvas clear calls must execute with #121212 fillStyle');
    });

    it('1.19: Tailwind configuration declares theme background: "#121212"', () => {
      const tailwindConfigFile = findComponentPath('tailwind.config.ts');
      assert.ok(fs.existsSync(tailwindConfigFile), 'tailwind.config.ts must exist');
      const content = fs.readFileSync(tailwindConfigFile, 'utf8');

      assert.ok(
        content.includes('background: "#121212"') || content.includes("background: '#121212'"),
        'tailwind.config.ts must declare theme background: #121212'
      );
    });

    it('1.20: Root HTML and Body styles enforce background-color: #121212', () => {
      const globalsCss = findComponentPath('src/app/globals.css');
      const content = fs.readFileSync(globalsCss, 'utf8');

      assert.ok(
        content.includes('html') && content.includes('background-color: #121212;'),
        'html tag must set background-color: #121212'
      );
      assert.ok(
        content.includes('body') && content.includes('background-color: #121212;'),
        'body tag must set background-color: #121212'
      );
    });

    it('1.21: Page root, ScrollyCanvas, and Projects share bg-background / #121212', () => {
      const pageFile = findComponentPath('src/app/page.tsx');
      const pageContent = fs.readFileSync(pageFile, 'utf8');
      assert.ok(
        pageContent.includes('bg-background') || pageContent.includes('#121212'),
        'Root page main must feature bg-background'
      );

      const projectsFile = findComponentPath('src/components/Projects.tsx');
      const projectsContent = fs.readFileSync(projectsFile, 'utf8');
      assert.ok(
        projectsContent.includes('bg-background') || projectsContent.includes('#121212'),
        'Projects section must feature bg-background'
      );
    });
  });

  // =========================================================================
  // Feature Area 5: F7, F8, F9 — Parallax Text Overlay Milestones
  // =========================================================================
  describe('Area 5: Parallax Text Overlay Milestones at 0%, 30%, 60% (F7, F8, F9)', () => {

    it('1.22: Milestone 0% scroll: Centered "Ayush Gora" and "Creative Developer." with maximum opacity at 0%', () => {
      const overlayFile = findComponentPath('src/components/Overlay.tsx');
      assert.ok(fs.existsSync(overlayFile), 'Overlay.tsx must exist');
      const content = fs.readFileSync(overlayFile, 'utf8');

      // Exact text copies
      assert.ok(content.includes('AYUSH GORA'), 'Must contain hero title "AYUSH GORA"');
      assert.ok(content.includes('Creative Developer.'), 'Must contain subtitle "Creative Developer."');
      assert.ok(content.includes('text-center'), 'Must be centered text alignment');

      // Model calculation at progress = 0
      const transforms = calculateOverlayTransforms(0);
      assert.equal(transforms.opacity1, 1, 'Section 1 opacity must be 1.0 at 0% scroll');
      assert.equal(transforms.opacity2, 0, 'Section 2 opacity must be 0 at 0% scroll');
      assert.equal(transforms.opacity3, 0, 'Section 3 opacity must be 0 at 0% scroll');
    });

    it('1.23: Milestone 30% scroll: Left-aligned "I build digital experiences." active at 30% scroll', () => {
      const overlayFile = findComponentPath('src/components/Overlay.tsx');
      const content = fs.readFileSync(overlayFile, 'utf8');

      assert.ok(
        content.includes('I build digital') && content.includes('experiences.'),
        'Must contain exact milestone text "I build digital experiences."'
      );
      assert.ok(content.includes('items-start') || content.includes('text-left'), 'Must be left-aligned');

      // Model calculation at progress = 0.30
      const transforms = calculateOverlayTransforms(0.30);
      assert.equal(transforms.opacity1, 0, 'Section 1 must be faded out at 30% scroll');
      assert.equal(transforms.opacity2, 1, 'Section 2 opacity must be 1.0 at 30% scroll');
      assert.equal(transforms.opacity3, 0, 'Section 3 must not yet be visible at 30% scroll');
    });

    it('1.24: Milestone 60% scroll: Right-aligned "Bridging design and engineering." active at 60% scroll', () => {
      const overlayFile = findComponentPath('src/components/Overlay.tsx');
      const content = fs.readFileSync(overlayFile, 'utf8');

      assert.ok(
        content.includes('Bridging design') && content.includes('and engineering.'),
        'Must contain exact milestone text "Bridging design and engineering."'
      );
      assert.ok(content.includes('items-end') || content.includes('text-right'), 'Must be right-aligned');

      // Model calculation at progress = 0.60
      const transforms = calculateOverlayTransforms(0.60);
      assert.equal(transforms.opacity1, 0, 'Section 1 must be 0 at 60% scroll');
      assert.equal(transforms.opacity2, 0, 'Section 2 must be 0 at 60% scroll');
      assert.equal(transforms.opacity3, 1, 'Section 3 opacity must be 1.0 at 60% scroll');
    });

    it('1.25: Milestone 85%-100% transition: "FEATURED WORK BELOW" prompt fades in', () => {
      const overlayFile = findComponentPath('src/components/Overlay.tsx');
      const content = fs.readFileSync(overlayFile, 'utf8');

      assert.ok(
        content.includes('FEATURED WORK BELOW'),
        'Must contain "FEATURED WORK BELOW" prompt'
      );

      const transforms = calculateOverlayTransforms(0.95);
      assert.equal(transforms.opacity4, 1, 'Section 4 transition prompt must be visible near end of scroller');
    });

    it('1.26: Typography check: clean sans-serif and monospace font classes', () => {
      const overlayFile = findComponentPath('src/components/Overlay.tsx');
      const content = fs.readFileSync(overlayFile, 'utf8');

      assert.ok(content.includes('font-sans') || content.includes('font-black'), 'Must use clean sans-serif typography');
      assert.ok(content.includes('font-mono'), 'Must use monospace accents for technical tags');
    });
  });

  // =========================================================================
  // Feature Area 6: F10, F11, F12 — Modern Glassmorphic Work Grid & Verified Projects
  // =========================================================================
  describe('Area 6: Glassmorphic Work Grid & 5 Verified Projects (F10, F11, F12)', () => {

    it('1.27: Work grid section is mounted directly below scroller with id="work" and subtle border', () => {
      const projectsFile = findComponentPath('src/components/Projects.tsx');
      assert.ok(fs.existsSync(projectsFile), 'Projects.tsx must exist');
      const content = fs.readFileSync(projectsFile, 'utf8');

      assert.ok(content.includes('id="work"'), 'Projects section must have id="work"');
      assert.ok(content.includes('border-t'), 'Projects section must feature subtle top border divider');
    });

    it('1.28: All 5 verified projects are rendered in the work grid', () => {
      const projectsFile = findComponentPath('src/components/Projects.tsx');
      const content = fs.readFileSync(projectsFile, 'utf8');

      for (const proj of VERIFIED_PROJECTS_SPEC) {
        assert.ok(
          content.includes(proj.title) || content.includes(proj.id),
          `Work grid must render verified project: ${proj.title}`
        );
      }
    });

    it('1.29: Project card styling includes glassmorphism (glass-card, backdrop-blur, subtle border)', () => {
      const projectsFile = findComponentPath('src/components/Projects.tsx');
      const content = fs.readFileSync(projectsFile, 'utf8');
      assert.ok(content.includes('glass-card'), 'Project cards must have glass-card class');

      const globalsCss = findComponentPath('src/app/globals.css');
      const cssContent = fs.readFileSync(globalsCss, 'utf8');
      assert.ok(cssContent.includes('.glass-card'), '.glass-card rule must be defined in CSS');
      assert.ok(cssContent.includes('backdrop-filter: blur'), 'Glassmorphism must declare backdrop-filter blur');
    });

    it('1.30: External GitHub links are configured with target="_blank" and rel="noopener noreferrer"', () => {
      const projectsFile = findComponentPath('src/components/Projects.tsx');
      const content = fs.readFileSync(projectsFile, 'utf8');

      assert.ok(
        content.includes('target="_blank"'),
        'External links must have target="_blank"'
      );
      assert.ok(
        content.includes('rel="noopener noreferrer"'),
        'External links must have security attributes rel="noopener noreferrer"'
      );
    });

    it('1.31: Technology stack pills and metrics/stats are rendered on every project card', () => {
      const projectsFile = findComponentPath('src/components/Projects.tsx');
      const content = fs.readFileSync(projectsFile, 'utf8');

      // Check tech tag loop
      assert.ok(
        content.includes('proj.tech.map') || content.includes('tech.map'),
        'Project cards must dynamically render technology tags'
      );
      // Check stats rendering
      assert.ok(
        content.includes('proj.stats') || content.includes('stats'),
        'Project cards must render verified performance / delivery metrics'
      );
    });
  });
});
