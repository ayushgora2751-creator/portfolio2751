# Task Assignment: Full Implementation & Build of Next.js 14 Scrollytelling Portfolio

## MANDATORY INTEGRITY WARNING
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

## Objective
Implement all requirements (R1, R2, R3, R4) in Next.js 14 App Router with TypeScript and Tailwind CSS at `c:\Users\Ayush\OneDrive\Documents\swarm` and verify production build.

## Detailed Steps
1. **Asset Pipeline**:
   - Ensure directory `public/sequence/` exists.
   - Copy all 192 frames from `c:\Users\Ayush\OneDrive\Documents\swarm\ezgif-split\` into `public/sequence/`.
   - Ensure filenames: `frame_000_delay-0.042s.png` to `frame_191_delay-0.042s.png`.

2. **Package & Configurations**:
   - Update `package.json` with scripts: `"dev": "next dev"`, `"build": "next build"`, `"start": "next start"`, `"lint": "next lint"`, `"test": "node tests/run_e2e.js"`.
   - Ensure dependencies and devDependencies: `next@^14.2`, `react@^18.2`, `react-dom@^18.2`, `framer-motion@^11`, `lucide-react@^0.368`, `clsx`, `tailwind-merge`, `typescript`, `@types/react`, `@types/react-dom`, `@types/node`, `tailwindcss`, `postcss`, `autoprefixer`, `eslint`, `eslint-config-next`.
   - Note: If node_modules or packages exist in `frontend/node_modules/`, leverage npm or symlinks/copies if needed, or run `npm install`.
   - Create `tsconfig.json` (Next.js TypeScript config with path alias `"@/*": ["./src/*"]`).
   - Create `next.config.mjs`.
   - Create `postcss.config.js`.
   - Create `tailwind.config.ts` (configured with `theme.extend.colors.background: "#121212"`, content: `["./src/**/*.{js,ts,jsx,tsx}"]`).

3. **Core Source Files**:
   - `src/app/globals.css`:
     - `@tailwind base; @tailwind components; @tailwind utilities;`
     - `:root { --background: #121212; --foreground: #f8fafc; }`
     - `html, body { background-color: #121212; color: #f8fafc; }`
     - `.glass-card { background: rgba(255, 255, 255, 0.03); backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px); border: 1px solid rgba(255, 255, 255, 0.1); }`
   - `src/app/layout.tsx`:
     - RootLayout with Inter/system sans-serif, title: "Ayush Gora | Creative Developer & Software Engineer", dark background.
   - `src/components/ScrollyCanvas.tsx`:
     - Outer wrapper: `<div className="relative h-[500vh] bg-background">`
     - Sticky viewport: `<div className="sticky top-0 h-screen w-full overflow-hidden flex items-center justify-center">`
     - HTML5 Canvas: `<canvas ref={canvasRef} className="absolute inset-0 z-0 w-full h-full block" />` (STRICTLY 0 `<video>` elements)
     - Overlay wrapper: `<div className="absolute inset-0 z-10 pointer-events-none flex flex-col justify-between p-6 md:p-12">`
     - Framer Motion `useScroll({ target: containerRef, offset: ["start start", "end end"] })`
     - Canvas `object-fit: cover` rendering with DPR clamped to 2.0.
     - Frame preloading of all 192 frames with nearest-frame fallback during scrubbing to guarantee 0 flicker.
     - `ctx.fillStyle = '#121212'; ctx.fillRect(0, 0, width, height)` before each draw to ensure seamless blending.
   - `src/components/Overlay.tsx`:
     - Layered text sections mapped to scroll milestones:
       - 0%: Centered `"AYUSH GORA"` and `"Creative Developer."`
       - 30%: Left-aligned `"I build digital experiences."`
       - 60%: Right-aligned `"Bridging design and engineering."`
       - Near 100%: `"FEATURED WORK BELOW"`
   - `src/components/Projects.tsx`:
     - Mounted with `id="work"` and subtle top border (`border-t border-white/10`).
     - Renders all 5 verified projects:
       1. "Bingo Multiplayer Game" (`id: "bingo-multiplayer"`, category: "Full Stack & Real-Time", tech: ["React", "Node.js", "WebSockets", "Canvas 2D", "Tailwind CSS"], GitHub URL, live URL).
       2. "SamajSeva Community Portal" (`id: "samajseva"`, category: "Social Impact & Platform", tech: ["Python", "Django", "PostgreSQL", "REST API", "Tailwind CSS"], GitHub URL, live URL).
       3. "Multiplayer 3D Portfolio" (`id: "3d-portfolio"`, category: "Creative Dev & WebGL", tech: ["React", "Three.js", "WebGL", "Framer Motion", "Django REST"], GitHub URL, live URL).
       4. "MSJ Engineering Industrial Suite" (`id: "msj-engineering"`, category: "Industrial & Enterprise Web", tech: ["React", "TypeScript", "Django REST", "Docker", "Tailwind CSS"], GitHub URL, live URL).
       5. "JAP Interior Architectural Studio" (`id: "jap-interior"`, category: "Commercial Showcase & UX", tech: ["React", "Framer Motion", "Tailwind CSS", "Vite", "Headless CMS"], GitHub URL, live URL).
     - Each card uses `.glass-card`, subtle borders, cyan hover glow, Lucide icons, `target="_blank" rel="noopener noreferrer"`.
   - `src/app/page.tsx`:
     - Composes `<ScrollyCanvas />` and `<Projects />`.

4. **Build & Test Verification**:
   - Run `npm run build` and ensure clean compile with 0 TypeScript/ESLint errors.
   - Run `node tests/run_e2e.js` and verify all tests pass.

## Output
Write your handoff report to: `c:\Users\Ayush\OneDrive\Documents\swarm\.agents\teamwork\teamwork_worker_m1_2\handoff.md`.
Send a completion message when finished.


## 2026-11-04T16:59:15Z
Received guidance from orchestrator (6dde6503-351a-49c2-869b-58855c518e51):
1. Do NOT set BypassSandbox: true on run_command calls. Run inside default sandbox (BypassSandbox: false).
2. Update scrollytelling/src/components/Projects.tsx to include the exact 5 verified projects from ORIGINAL_REQUEST.md:
   - Bingo Multiplayer (id: "bingo-multiplayer", title: "Bingo Multiplayer Game")
   - SamajSeva (id: "samajseva", title: "SamajSeva Community Portal")
   - 3D Portfolio (id: "3d-portfolio", title: "Multiplayer 3D Portfolio")
   - MSJ Engineering (id: "msj-engineering", title: "MSJ Engineering Industrial Suite")
   - JAP Interior (id: "jap-interior", title: "JAP Interior Architectural Studio")
3. Ensure root package.json supports "build" (e.g. "build": "npm --prefix scrollytelling run build") and "test": "node tests/run_e2e.js".
4. Apply fixes, run build and tests, and complete handoff.md.
