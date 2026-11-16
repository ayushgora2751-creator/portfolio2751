Build a high-end "Scrollytelling" personal portfolio website for Ayush Gora, featuring a scroll-linked HTML5 Canvas animation scrubbing through a 192-frame image sequence, parallax overlay text, and a modern glassmorphic work grid showcasing verified projects.

Working directory: c:\Users\Ayush\OneDrive\Documents\swarm
Integrity mode: demo
The team must NOT: copy code from existing open-source projects for core logic, run external scripts or delegate execution to other tools

## Requirements

### R1. Scrollytelling Canvas Animation
- Implement a sticky scroller with a 500vh scroll container and a sticky full-screen viewport (`top-0 h-screen w-full`).
- Render the 192 sequential image frames from `c:\Users\Ayush\OneDrive\Documents\swarm\ezgif-split` (named `frame_000_delay-0.042s.png` to `frame_191_delay-0.042s.png`, linked or copied to `public/sequence/`) onto an HTML5 `<canvas>` element.
- Scrub through the image sequence mapped to scroll progress (0 to 1) using Framer Motion's `useScroll`.
- Do not use a `<video>` tag; use HTML5 Canvas rendering.
- Preload all 192 frames to prevent flickering or blank frames during scrolling.
- Implement `object-fit: cover` logic on the canvas to ensure responsive rendering across mobile and desktop displays.
- Match the global page background color to the frame background (hex `#121212`) for seamless visual blending.

### R2. Parallax Text Overlay
- Position layered text sections on top of the canvas (z-index 10) with parallax motion fading in and out at specific scroll positions:
  - 0% scroll: "Ayush Gora. Creative Developer." (centered)
  - 30% scroll: "I build digital experiences." (left-aligned)
  - 60% scroll: "Bridging design and engineering." (right-aligned)
- Use clean sans-serif typography (Inter or system sans-serif font).

### R3. Work Grid Section
- Position a modern project grid directly below the 500vh scroll container once the scroll sequence concludes.
- Showcase Ayush Gora's verified projects:
  - Bingo Multiplayer
  - SamajSeva
  - 3D Portfolio
  - MSJ Engineering
  - JAP Interior
- Style each project card with dark-themed glassmorphism (backdrop-blur, subtle borders, and hover glow).

### R4. Tech Stack & Aesthetic
- Framework: Next.js 14 (App Router)
- Language: TypeScript
- Styling: Tailwind CSS
- Icons: Lucide icons
- Design: Modern dark aesthetic with authentic implementations and modular code.

## Acceptance Criteria

### Build & Compilation
- [ ] Application compiles and builds cleanly with `npm run build` with zero TypeScript or ESLint errors.
- [ ] No `<video>` elements are used for the scrollytelling sequence; animation renders strictly via HTML5 `<canvas>`.
- [ ] All 192 sequential image frames are preloaded and scrub smoothly without flashing or blank frames during rapid bidirectional scrolling.

### Visual & Interactive Behavior
- [ ] Canvas renders with responsive cover scaling on both mobile (375px) and desktop (1440px) viewports without distortion.
- [ ] Background color `#121212` seamlessly blends with the sequence frame edges with no visible seams.
- [ ] Parallax overlay text sections fade in and out at the specified scroll milestones (0%, 30%, 60%) with appropriate alignment.
- [ ] Work grid displays glassmorphic project cards for all five specified projects (Bingo Multiplayer, SamajSeva, 3D Portfolio, MSJ Engineering, JAP Interior) below the scrollytelling container.

## Verification Resources
- Next.js production build (`npm run build`) and lint verification.
- Browser-based visual and interactive verification of scroll-linked scrubbing, parallax transitions, and responsive canvas sizing.
