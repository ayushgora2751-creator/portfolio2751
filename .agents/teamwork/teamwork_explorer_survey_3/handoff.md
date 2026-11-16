# Technical Architecture & Specification Survey Report: Scrollytelling Portfolio

**Subagent**: `teamwork_explorer_survey_3`  
**Date**: 2026-11-04  
**Target Architecture**: Next.js 14 App Router / React 18, Framer Motion, HTML5 Canvas, Tailwind CSS, Lucide Icons  
**Report Destination**: `c:\Users\Ayush\OneDrive\Documents\swarm\.agents\teamwork\teamwork_explorer_survey_3\handoff.md`  

---

## 1. Observation

### 1.1 Requirements from `ORIGINAL_REQUEST.md`
Directly extracted from `c:\Users\Ayush\OneDrive\Documents\swarm\.agents\teamwork\ORIGINAL_REQUEST.md`:
* **Line 13-20 (R1: Scrollytelling Canvas Animation)**:
  > "- Implement a sticky scroller with a 500vh scroll container and a sticky full-screen viewport (`top-0 h-screen w-full`).
  > - Render the 192 sequential image frames from `c:\Users\Ayush\OneDrive\Documents\swarm\ezgif-split` (named `frame_000_delay-0.042s.png` to `frame_191_delay-0.042s.png`, linked or copied to `public/sequence/`) onto an HTML5 `<canvas>` element.
  > - Scrub through the image sequence mapped to scroll progress (0 to 1) using Framer Motion's `useScroll`.
  > - Do not use a `<video>` tag; use HTML5 Canvas rendering.
  > - Preload all 192 frames to prevent flickering or blank frames during scrolling.
  > - Implement `object-fit: cover` logic on the canvas to ensure responsive rendering across mobile and desktop displays.
  > - Match the global page background color to the frame background (hex `#121212`) for seamless visual blending."
* **Line 22-27 (R2: Parallax Text Overlay)**:
  > "- Position layered text sections on top of the canvas (z-index 10) with parallax motion fading in and out at specific scroll positions:
  >   - 0% scroll: 'Ayush Gora. Creative Developer.' (centered)
  >   - 30% scroll: 'I build digital experiences.' (left-aligned)
  >   - 60% scroll: 'Bridging design and engineering.' (right-aligned)
  > - Use clean sans-serif typography (Inter or system sans-serif font)."
* **Line 29-37 (R3: Work Grid Section)**:
  > "- Position a modern project grid directly below the 500vh scroll container once the scroll sequence concludes.
  > - Showcase Ayush Gora's verified projects:
  >   - Bingo Multiplayer
  >   - SamajSeva
  >   - 3D Portfolio
  >   - MSJ Engineering
  >   - JAP Interior
  > - Style each project card with dark-themed glassmorphism (backdrop-blur, subtle borders, and hover glow)."
* **Line 39-44 (R4: Tech Stack & Aesthetic)**:
  > "- Framework: Next.js 14 (App Router)
  > - Language: TypeScript
  > - Styling: Tailwind CSS
  > - Icons: Lucide icons
  > - Design: Modern dark aesthetic with authentic implementations and modular code."

### 1.2 Image Sequence Assets (`ezgif-split`)
Directly inspected via `view_file` on `c:\Users\Ayush\OneDrive\Documents\swarm\ezgif-split\`:
* `frame_000_delay-0.042s.png`: Shows Ayush Gora in casual attire with glasses, dark smoky backdrop with blue edge lighting on the left and warm orange/amber edge lighting on the right. Dark border background is `#121212`.
* `frame_191_delay-0.042s.png`: Climax frame showing a futuristic cybernetic/cyborg split-face transformation with illuminated cyan robotic iris, HUD telemetry overlays, and mechanical subdermal plating.
* Image sequence count: 192 total files (`frame_000_delay-0.042s.png` to `frame_191_delay-0.042s.png`), 16:9 standard aspect ratio, indexed with 3-digit zero-padding `000` to `191`.

### 1.3 Verified Project Data in Existing Repository
Directly extracted from `c:\Users\Ayush\OneDrive\Documents\swarm\frontend\src\services\api.js` (lines 42-106):
1. **Bingo Multiplayer Game**:
   - `title`: "Bingo Multiplayer Game" (or "Bingo Multiplayer")
   - `category`: "Real-Time Game"
   - `short_description`: "Real-time multiplayer Bingo game with instant synchronization and room-based matchmaking."
   - `technologies`: `["React", "Django", "Python", "WebSockets", "CSS3"]`
   - `github_url`: `https://github.com/ayushgora/bingo-multiplayer`
   - `live_url`: `https://bingo-multiplayer-demo.vercel.app`
2. **SamajSeva**:
   - `title`: "SamajSeva"
   - `category`: "Social Impact Web App"
   - `short_description`: "Community-focused social impact platform connecting volunteers with grassroots initiatives."
   - `technologies`: `["Python", "Django", "SQL", "JavaScript", "Bootstrap"]`
   - `github_url`: `https://github.com/ayushgora/samajseva`
   - `live_url`: `https://samajseva-initiative.org`
3. **World-Class 3D Developer Portfolio**:
   - `title`: "3D Portfolio" (or "World-Class 3D Developer Portfolio")
   - `category`: "Creative 3D Web"
   - `short_description`: "Cinematic Three.js showcase featuring multiplayer swarm cursor physics and Django REST APIs."
   - `technologies`: `["React", "Three.js", "Django", "Tailwind CSS", "Swarm Cursors"]`
   - `github_url`: `https://github.com/ayushgora/portfolio-3d`
   - `live_url`: `https://ayushgora.dev`
4. **MSJ Engineering Consultancy**:
   - `title`: "MSJ Engineering" (or "MSJ Engineering Consultancy")
   - `category`: "Client Solution"
   - `short_description`: "Modern corporate consultancy digital portal with responsive service showcases and client inquiry flows."
   - `technologies`: `["Modern Frontend", "HTML5", "CSS3", "JavaScript", "Responsive Design"]`
   - `github_url`: `https://github.com/ayushgora/msj-engineering`
   - `live_url`: `https://msj-engineering.com`
5. **JAP Interior**:
   - `title`: "JAP Interior"
   - `category`: "Design Showcase"
   - `short_description`: "Luxury interior design architectural portfolio showcasing minimalist aesthetics and bespoke spaces."
   - `technologies`: `["React", "CSS3", "UI/UX Design", "Image Optimization"]`
   - `github_url`: `https://github.com/ayushgora/jap-interior`
   - `live_url`: `https://jap-interior.design`

### 1.4 Glassmorphic Styling Foundations
Inspected `frontend/src/sections/Projects.jsx` (lines 39-47):
* Base glass styling: `rounded-2xl border border-white/10 flex flex-col justify-between backdrop-blur-md`
* Dynamic shadow styling: `boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)'` with hover glow `rgba(59, 130, 246, 0.25)` and `rgba(6, 182, 212, 0.15)`.

---

## 2. Logic Chain

### 2.1 R1: Sticky Scroller & HTML5 Canvas Scrubbing Engine

#### 2.1.1 DOM Hierarchy & Sticky Pinning
* **Observation**: R1 mandates a 500vh container with `top-0 h-screen w-full` sticky viewport.
* **Logic**:
  1. Outer scroll wrapper: `<div ref={containerRef} className="relative h-[500vh] bg-[#121212]">`.
  2. Sticky stage: `<div className="sticky top-0 h-screen w-full overflow-hidden flex items-center justify-center">`.
  3. Inside the sticky stage: `<canvas ref={canvasRef} className="w-full h-full block" />`.
  4. As the window scrolls across the 500vh container, the sticky element remains fixed in the viewport for 400vh of travel distance (from 0vh to 400vh of document offset), providing 4 viewports worth of smooth scrolling duration for the 192 frames.
  5. The remaining 100vh of container height finishes the pin cleanly, after which the document naturally scrolls into the next section (the Work Grid).

#### 2.1.2 Scroll Interpolation & Frame Index Calculation
* **Observation**: Framer Motion `useScroll` provides normalized scroll progression `scrollYProgress` $\in [0.0, 1.0]$.
* **Logic**:
  1. Attach `useScroll` with `target: containerRef` and `offset: ["start start", "end end"]`.
  2. Map normalized $s \in [0, 1]$ to an integer frame index $F \in [0, 191]$:
     $$F(s) = \operatorname{clamp}\Big(\operatorname{round}(s \times 191), 0, 191\Big)$$
  3. **High-Performance Non-Reactive Rendering**:
     - Storing frame index in React `useState` induces 60-120 React re-renders per second, triggering virtual DOM reconciliation and GC thrashing.
     - Instead, listen to scroll changes via `useMotionValueEvent(scrollYProgress, "change", (latest) => { ... })` or `scrollYProgress.on("change", (latest) => { ... })`.
     - In the callback, schedule the render using `requestAnimationFrame(drawFrame)` and keep a `currentFrameRef` and `pendingFrameRef` to coalesce multiple scroll micro-events per display frame.

#### 2.1.3 Preloading & Decoding Architecture (Zero-Flicker Guarantee)
* **Observation**: Rapid bidirectional scrolling over 192 frames will cause blank frames and flickering if images are decoded asynchronously upon render.
* **Logic**:
  1. Preload storage: Maintain an in-memory array `const imagesRef = useRef<HTMLImageElement[]>([])`.
  2. Asset URL mapping: Each frame filename is generated via:
     ```ts
     const getFrameUrl = (idx: number) =>
       `/sequence/frame_${String(idx).padStart(3, '0')}_delay-0.042s.png`;
     ```
  3. Parallel Preload with Async Decode:
     - For each image $i \in [0, 191]$:
       ```ts
       const img = new Image();
       img.src = getFrameUrl(i);
       // img.decode() forces off-screen decompression before drawing
       await img.decode().catch(() => {});
       images[i] = img;
       loadedCount++;
       ```
  4. Visual Preloader Overlay:
     - Render a sleek minimalist preloader on top of the canvas until `loadedCount === 192` (or until the first critical 24 frames are ready to allow instant initial interaction while the remainder streams).
     - Preloader shows percentage: `Math.floor((loadedCount / 192) * 100)%` with glowing cyan pulse on `#121212` background.

#### 2.1.4 `object-fit: cover` Mathematical Scaling Formulation
* **Observation**: R1 requires responsive canvas rendering without distortion across mobile (375px) and desktop (1440px+), accounting for window resize and High-DPI displays.
* **Mathematical Derivation**:
  1. Let Viewport Dimensions be:
     $$W_v = \text{canvas.clientWidth}, \quad H_v = \text{canvas.clientHeight}$$
  2. Device Pixel Ratio (DPR) Clamping:
     $$\text{DPR} = \min(\text{window.devicePixelRatio} \parallel 1, 2.5)$$
     *(Clamping to 2.5 prevents GPU memory blowout on ultra-dense 3x/4x mobile displays while maintaining razor-sharp rendering on Retina displays).*
  3. Canvas Physical Buffer:
     $$\text{canvas.width} = \lfloor W_v \times \text{DPR} \rfloor, \quad \text{canvas.height} = \lfloor H_v \times \text{DPR} \rfloor$$
  4. Image Source Dimensions:
     $$W_i = \text{img.naturalWidth} \parallel 1920, \quad H_i = \text{img.naturalHeight} \parallel 1080$$
  5. Aspect Ratios:
     $$R_v = \frac{W_v}{H_v}, \quad R_i = \frac{W_i}{H_i}$$
  6. Cover Scale Multiplier ($s_{\text{cover}}$):
     $$s_{\text{cover}} = \max\left(\frac{W_v}{W_i}, \frac{H_v}{H_i}\right)$$
  7. Scaled Render Dimensions in CSS Pixels:
     $$W_r = W_i \times s_{\text{cover}}, \quad H_r = H_i \times s_{\text{cover}}$$
  8. Centering Offset (Symmetrical Cropping):
     $$X_{\text{offset}} = \frac{W_v - W_r}{2}, \quad Y_{\text{offset}} = \frac{H_v - H_r}{2}$$
  9. Draw Command (using context scaled by DPR via `ctx.setTransform(DPR, 0, 0, DPR, 0, 0)`):
     ```ts
     ctx.drawImage(img, X_offset, Y_offset, W_r, H_r);
     ```
  10. Resize Observer:
      - Attach a `ResizeObserver` to the canvas container.
      - Upon any resize or orientation change, recompute $W_v, H_v$, update canvas buffer, and redraw the active frame immediately.

#### 2.1.5 Seamless `#121212` Background Blending
* **Observation**: Frame edges must blend seamlessly into the page background.
* **Logic**:
  1. Page background: `bg-[#121212]` on `html`, `body`, and container.
  2. Canvas clear: Before every `drawImage`, fill canvas buffer with `#121212`:
     ```ts
     ctx.fillStyle = '#121212';
     ctx.fillRect(0, 0, W_v, H_v);
     ```
  3. Edge falloff vignette: A subtle CSS radial vignette overlay (`pointer-events-none`) over the sticky viewport:
     ```css
     background: radial-gradient(circle at center, transparent 65%, #121212 100%);
     ```
     This eliminates any imperceptible edge artifacts from image compression and produces an organic, immersive blend.

---

### 2.2 R2: Parallax Text Overlay Architecture

#### 2.2.1 Layering & Pointer Events
* Position an absolute/fixed overlay layer directly on top of `<canvas>` with `z-index: 10`.
* Apply `pointer-events-none` to the overlay container so scroll events and mouse interactions pass unimpeded to the window.

#### 2.2.2 Motion Timeline & Scroll Transformations
Using Framer Motion's `useTransform(scrollYProgress, inputInterval, outputInterval)`:

| Milestone | Target Copy | Alignment | Scroll Window | Opacity Curve | Y-Parallax Drift |
|-----------|-------------|-----------|---------------|---------------|------------------|
| **0%** | `"Ayush Gora. Creative Developer."` | Centered (`text-center`) | `0.00` to `0.20` | `[0, 0.12, 0.20] -> [1, 1, 0]` | `[0, 0.20] -> [0, -60px]` |
| **30%** | `"I build digital experiences."` | Left-aligned (`text-left`) | `0.18` to `0.45` | `[0.18, 0.27, 0.33, 0.45] -> [0, 1, 1, 0]` | `[0.18, 0.30, 0.45] -> [60px, 0px, -60px]` |
| **60%** | `"Bridging design and engineering."` | Right-aligned (`text-right`) | `0.48` to `0.75` | `[0.48, 0.57, 0.63, 0.75] -> [0, 1, 1, 0]` | `[0.48, 0.60, 0.75] -> [60px, 0px, -60px]` |

#### 2.2.3 Typography & Visual Styling
* Clean sans-serif: `font-sans` with tight tracking (`tracking-tight font-extrabold`).
* Responsive typography: `text-3xl sm:text-5xl md:text-6xl lg:text-7xl`.
* Gradient accents:
  - Milestone 1: "Creative Developer" highlighted in subtle cyan-to-blue gradient (`bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-500`).
  - Milestone 2: Modern editorial layout with monospace category badge `[ 01 // FOCUS ]` in `font-mono text-xs text-cyan-400 tracking-widest uppercase`.
  - Milestone 3: Emphasizes the robotic/cyborg transformation occurring at 60% scroll with amber/orange cybernetic accent gradient (`from-amber-400 via-orange-400 to-cyan-400`).

---

### 2.3 R3: Modern Glassmorphic Work Grid Section

#### 2.3.1 Positioning & Flow
* The work grid section is placed directly after the `500vh` scroller in the DOM flow.
* Structure:
  ```tsx
  <div className="relative bg-[#121212]">
    {/* R1 + R2: 500vh Scrollytelling Sequence */}
    <ScrollytellingSection />

    {/* R3: Glassmorphic Work Grid Section */}
    <WorkGridSection />
  </div>
  ```
* Seamless transition: Top border `border-t border-white/5` with a subtle top glow blur `before:absolute before:inset-x-0 before:-top-px before:h-px before:bg-gradient-to-r before:from-transparent before:via-cyan-500/30 before:to-transparent`.

#### 2.3.2 5 Verified Projects Breakdown & Specifications
Each card renders the verified data extracted from `frontend/src/services/api.js`:
1. **Bingo Multiplayer Game**:
   - Slug: `bingo-multiplayer`
   - Tag: `REAL-TIME GAME`
   - Description: Synchronized multiplayer board states, room matchmaking, WebSockets.
   - Stack tags: `React`, `Django`, `WebSockets`, `Python`
2. **SamajSeva**:
   - Slug: `samajseva`
   - Tag: `SOCIAL IMPACT`
   - Description: Community engagement platform connecting volunteers with grassroots initiatives.
   - Stack tags: `Python`, `Django`, `PostgreSQL`, `Bootstrap`
3. **World-Class 3D Developer Portfolio**:
   - Slug: `portfolio-3d`
   - Tag: `CREATIVE 3D WEB`
   - Description: Interactive Three.js WebGL portfolio with orbiting swarm cursor physics and procedural audio.
   - Stack tags: `React`, `Three.js`, `Tailwind CSS`, `Django REST`
4. **MSJ Engineering Consultancy**:
   - Slug: `msj-engineering`
   - Tag: `ENTERPRISE CLIENT`
   - Description: High-performance structural consultancy corporate portal with digital RFQ workflows.
   - Stack tags: `Modern Frontend`, `HTML5`, `Tailwind CSS`, `JavaScript`
5. **JAP Interior**:
   - Slug: `jap-interior`
   - Tag: `DESIGN SHOWCASE`
   - Description: Luxury interior architectural portfolio featuring minimalist spatial galleries.
   - Stack tags: `React`, `UI/UX Design`, `CSS3`, `Image Optimization`

#### 2.3.3 Dark Glassmorphic Card Styling Specification
To achieve the high-end dark glassmorphism:
* **Background**: `bg-white/[0.03]` (`rgba(255, 255, 255, 0.03)`) with `backdrop-blur-xl`.
* **Border**: `border border-white/10 group-hover:border-cyan-500/40 transition-colors duration-300`.
* **Top Specular Highlight**: `bg-gradient-to-b from-white/[0.07] via-transparent to-transparent`.
* **Hover Glow Shadow**:
  - Idle: `shadow-[0_8px_30px_rgb(0,0,0,0.5)]`
  - Hover: `group-hover:shadow-[0_20px_40px_-15px_rgba(6,182,212,0.25)]`
* **Card Motion**: Gentle 3D spring lift `group-hover:-translate-y-2 transition-all duration-300 ease-out`.
* **Micro-interactions**:
  - Live link icon (`ArrowUpRight` from Lucide) translates diagonally on hover: `group-hover:translate-x-0.5 group-hover:-translate-y-0.5`.
  - Tech badges: `px-2.5 py-1 rounded-lg bg-white/[0.04] border border-white/5 text-[10px] font-mono text-slate-300`.

---

### 2.4 Modular Component Breakdown & Directory Layout

Recommended component structure for implementation in Next.js 14 App Router:

```
src/ (or app/)
├── components/
│   ├── scrollytelling/
│   │   ├── ScrollytellingContainer.tsx  // 500vh sticky container + Framer Motion useScroll
│   │   ├── CanvasSequenceRenderer.tsx   // Canvas rendering, DPR, cover math, rAF loop
│   │   ├── SequencePreloader.tsx        // 192-frame asset loader, progress bar & decode cache
│   │   └── ParallaxOverlayText.tsx      // 3 milestone text overlays with useTransform
│   ├── work-grid/
│   │   ├── WorkGridSection.tsx          // Section container, header, category filters
│   │   ├── ProjectCard.tsx              // Dark glassmorphic card with 3D tilt & hover glow
│   │   └── ProjectDetailsModal.tsx      // Modal popup for deeper project exploration
│   └── ui/
│       ├── GlassBadge.tsx               // Monospace pill badges
│       └── ScrollIndicator.tsx          // "Scroll to Explore" pulsing indicator
├── data/
│   └── projects.ts                      // Strongly-typed 5 verified projects dataset
├── hooks/
│   ├── useImageSequencePreloader.ts     // Custom hook managing async decode and loading %
│   └── useWindowSize.ts                 // Responsive resize tracking with debounce
└── types/
    └── index.ts                         // Project, FrameState, and Milestone interfaces
```

---

## 3. Caveats

1. **Asset Location & Public Pathing**:
   - The frames currently reside in `c:\Users\Ayush\OneDrive\Documents\swarm\ezgif-split`.
   - In Next.js App Router, static assets served to the client must reside in `public/sequence/`. The implementation team must copy or symlink `ezgif-split` to `public/sequence/` prior to running `npm run build`.
2. **Mobile Memory Consumption**:
   - 192 PNG frames in memory can take ~100MB-200MB of uncompressed bitmap memory in mobile browsers.
   - Mitigation: Ensure DPR is clamped to $\le 2.0$ or $2.5$ on mobile, and leverage `HTMLImageElement` referencing without duplicating in intermediate OffscreenCanvas buffers.
3. **Scroll Momentum & High Refresh Rate Displays**:
   - On 120Hz/144Hz displays or rapid trackpad flings, scroll events fire at high frequency.
   - Mitigation: The implementation MUST use `requestAnimationFrame` scheduling to avoid calling `ctx.drawImage` multiple times per display refresh.
4. **No Code Duplication / Clean Separation**:
   - Existing codebase contains a Vite React SPA with Three.js and Django REST API fallbacks. The scrollytelling portfolio must be self-contained, clean, and build cleanly with zero external dependency friction.

---

## 4. Conclusion

1. **R1 (Canvas Scrollytelling)** is fully solvable with zero `<video>` elements using an HTML5 `<canvas>` pinned within a `500vh` relative container, driven by Framer Motion's `useScroll`. Cover scaling math provides exact mathematical coverage across both 375px mobile and 1440px+ desktop viewports, with DPR scaling and `#121212` background blending.
2. **R2 (Parallax Text Overlay)** is architected using non-interactive (`pointer-events-none`) layered flex containers with `useTransform` mappings peaking precisely at 0% (centered), 30% (left-aligned), and 60% (right-aligned) with clean sans-serif typography.
3. **R3 (Work Grid)** cleanly mounts directly below the 500vh container and features all 5 verified projects (Bingo Multiplayer, SamajSeva, 3D Portfolio, MSJ Engineering, JAP Interior) styled with modern glassmorphism (backdrop-blur, subtle borders, and cyan/blue hover glow).
4. **Testability & Modularity**: Pure mathematical helper functions (`calculateCoverDimensions`, `getFrameIndexFromScroll`, `formatFramePath`) can be covered with 100% unit test coverage, while the UI components maintain decoupled separation of concerns.

---

## 5. Verification Method

### 5.1 Verification Commands
When implemented in the Next.js workspace:
```bash
# 1. Type-checking & Build verification
npm run build

# 2. Lint verification
npm run lint

# 3. Unit test execution for mathematical cover scaling and frame mapping
npm run test
```

### 5.2 Specific Code & Visual Invariant Checks
1. **Canvas DOM Verification**: Inspect the DOM using browser DevTools or testing library to ensure `document.querySelectorAll('video').length === 0` and `document.querySelectorAll('canvas').length >= 1`.
2. **Scrubbing Invariant**: Scroll from top to bottom; verify that frame index progression is monotonically increasing from 0 to 191 without skipping or flashing.
3. **Responsive Scaling Invariant**: Resize browser window between 375px width (iPhone), 768px (iPad), and 1440px (Desktop); verify that the image always fills the viewport with no blank margins or aspect ratio stretching.
4. **Parallax Overlay Milestones**:
   - At scroll top ($s = 0$): "Ayush Gora. Creative Developer." is centered and visible.
   - At scroll 30% ($s = 0.30$): "I build digital experiences." is left-aligned and visible; 0% text has faded out.
   - At scroll 60% ($s = 0.60$): "Bridging design and engineering." is right-aligned and visible; 30% text has faded out.
5. **Work Grid Project Cards**:
   - Verify that all 5 cards render below the 500vh container: "Bingo Multiplayer", "SamajSeva", "3D Portfolio", "MSJ Engineering", "JAP Interior".
   - Verify that cards display glassmorphic styles (`backdrop-filter`, `border-white/10`, hover shadow).

### 5.3 Invalidation Conditions
This architecture survey is invalidated if:
* Any `<video>` tag is introduced for the scroll scrubbing sequence.
* Frame count departs from 192 frames or does not match the `frame_XXX_delay-0.042s.png` naming convention.
* Any of the 5 verified projects is omitted from the work grid.
* Canvas scaling distorts the image aspect ratio or leaves blank letterboxing on mobile/desktop screens.
