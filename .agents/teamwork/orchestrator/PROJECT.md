# Project: Ayush Gora Scrollytelling Portfolio

## Architecture
- **Framework**: Next.js 14 (App Router), TypeScript, Tailwind CSS, Framer Motion, Lucide Icons.
- **Visual Foundation**: Global `#121212` background, dark glassmorphism (`backdrop-blur-xl`, subtle borders, cyan glow).
- **Core Engine**: HTML5 `<canvas>` rendering 192 frames (`frame_000_delay-0.042s.png` to `frame_191_delay-0.042s.png`) from `public/sequence/`, driven by Framer Motion `useScroll` across a `500vh` sticky container. Strictly ZERO `<video>` elements.
- **Parallax System**: Non-interactive (`pointer-events-none`) text layers with `z-index: 10` mapped to scroll milestones at 0% (centered), 30% (left), and 60% (right).
- **Work Grid**: Modern CSS grid mounted directly below the 500vh scroller, displaying 5 verified projects: Bingo Multiplayer, SamajSeva, 3D Portfolio, MSJ Engineering, JAP Interior.

## Feature Inventory
| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| F1 | Next.js 14 + TS Setup | App Router, TypeScript, Tailwind, Lucide, Framer Motion dependencies & configuration | M1 | R4, survey |
| F2 | Asset Sequence Pipeline | 192 frames copied to `public/sequence/frame_000_delay-0.042s.png` through `frame_191_delay-0.042s.png` | M1 | R1, survey |
| F3 | Preloader & Image Cache | In-memory `HTMLImageElement` cache, `img.decode()`, staged progressive loading & nearest-frame fallback | M2 | R1, survey |
| F4 | Sticky Canvas Scroller | 500vh scroll wrapper, sticky `top-0 h-screen w-full` viewport, Framer Motion `useScroll` scrubbing, 0 `<video>` elements | M2 | R1, survey |
| F5 | Responsive Cover Scaling | Mathematical `object-fit: cover` canvas math, DPR clamping (<=2.5), dynamic ResizeObserver | M2 | R1, survey |
| F6 | Seamless #121212 Blending | Page background, canvas buffer fill, and radial gradient falloff vignette matching `#121212` | M2 | R1, survey |
| F7 | Parallax Overlay 0% | Centered "Ayush Gora. Creative Developer." at 0% scroll, fade in/out [0, 0.20], upward drift | M3 | R2, survey |
| F8 | Parallax Overlay 30% | Left-aligned "I build digital experiences." at 30% scroll, fade in/out [0.18, 0.45] | M3 | R2, survey |
| F9 | Parallax Overlay 60% | Right-aligned "Bridging design and engineering." at 60% scroll, fade in/out [0.48, 0.75] | M3 | R2, survey |
| F10 | Work Grid Container | Section mounted directly below 500vh container, responsive layout, subtle top border highlight | M4 | R3, survey |
| F11 | 5 Verified Projects Data | Bingo Multiplayer, SamajSeva, 3D Portfolio, MSJ Engineering, JAP Interior with accurate metadata | M4 | R3, survey |
| F12 | Glassmorphic Card Styling | `backdrop-blur-xl`, `bg-white/[0.03]`, `border-white/10`, cyan hover glow, 3D lift transitions | M4 | R3, survey |
| F13 | Build & Verification Gate | Clean `npm run build` pass, 0 TS/ESLint errors, 100% E2E test pass, forensic audit CLEAN | M5 | Acceptance criteria |

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| M1 | Next.js 14 Infrastructure & Asset Pipeline | F1, F2: Package setup, TS, Tailwind, Lucide, Framer Motion, copy 192 frames to `public/sequence/` | none | IN_PROGRESS |
| M2 | Scrollytelling Canvas Animation Engine | F3, F4, F5, F6: 500vh sticky scroller, HTML5 Canvas, preloader, cover math, #121212 blend | M1 | PLANNED |
| M3 | Parallax Text Overlay System | F7, F8, F9: 0%, 30%, 60% parallax milestones, Framer Motion transforms, typography | M1, M2 | PLANNED |
| M4 | Glassmorphic Work Grid & Verified Projects | F10, F11, F12: 5 verified projects, glassmorphic cards, hover glow, responsive grid | M1 | PLANNED |
| M5 | Final Milestone: 100% E2E Test Suite & Hardening | F13: Full integration, run test suite Tiers 1-4, adversarial coverage hardening Tier 5 | M1, M2, M3, M4 | PLANNED |

## Interface Contracts
### Preloader ↔ Canvas Renderer
- `useImageSequencePreloader(frameCount: number, basePath: string)`
  - Returns: `{ images: HTMLImageElement[], loadedCount: number, isLoaded: boolean, progress: number }`
  - Invariant: `images[i]` is decoded HTMLImageElement or null if pending. Fallback draws closest valid index.

### Canvas Math ↔ Renderer
- `calculateCoverDimensions(viewportWidth: number, viewportHeight: number, imageWidth: number, imageHeight: number)`
  - Returns: `{ renderWidth: number, renderHeight: number, offsetX: number, offsetY: number }`
  - Invariant: `renderWidth >= viewportWidth` and `renderHeight >= viewportHeight`.

### Scroll Progress ↔ Frame Index
- `getFrameIndexFromScroll(progress: number, totalFrames: number = 192)`
  - Returns: integer in `[0, totalFrames - 1]` computed via `Math.min(Math.max(Math.round(progress * (totalFrames - 1)), 0), totalFrames - 1)`.

### Project Data Contract
- Interface `Project`:
  - `id`: string
  - `title`: string
  - `category`: string
  - `short_description`: string
  - `technologies`: string[]
  - `github_url`: string
  - `live_url`: string

## Code Layout
```
c:\Users\Ayush\OneDrive\Documents\swarm\
├── package.json
├── tsconfig.json
├── next.config.mjs
├── tailwind.config.ts
├── postcss.config.js
├── public/
│   └── sequence/
│       ├── frame_000_delay-0.042s.png
│       └── ... (192 frames)
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── globals.css
│   ├── components/
│   │   ├── scrollytelling/
│   │   │   ├── ScrollytellingContainer.tsx
│   │   │   ├── CanvasSequenceRenderer.tsx
│   │   │   ├── ParallaxOverlayText.tsx
│   │   │   └── SequencePreloader.tsx
│   │   └── work-grid/
│   │       ├── WorkGridSection.tsx
│   │       └── ProjectCard.tsx
│   ├── data/
│   │   └── projects.ts
│   ├── lib/
│   │   └── canvas-math.ts
│   └── types/
│       └── index.ts
└── tests/
    ├── e2e_runner.js
    ├── tier1_feature_coverage.test.js
    ├── tier2_boundary_corner.test.js
    ├── tier3_cross_feature.test.js
    └── tier4_real_world.test.js
```
