# Requirements: Ayush Gora — 3D Developer Portfolio

## v1 Requirements

### Architecture & Setup (ARCH)
- **ARCH-01**: Project structured into clean `frontend/` and `backend/` directories with root documentation.
- **ARCH-02**: Vite-powered React frontend configured with Tailwind CSS, Lucide React, and essential libraries.
- **ARCH-03**: Django backend configured with Django REST Framework, CORS headers, and SQLite/Postgres settings.
- **ARCH-04**: Unified environment variable templates (`.env.example`) and local startup scripts provided.

### Django Backend (BACK)
- **BACK-01**: Django app `profile_app` providing endpoints for personal bio, education, and social links (`GET /api/profile/`, `GET /api/education/`).
- **BACK-02**: Django app `projects` providing endpoints for project listings and details (`GET /api/projects/`, `GET /api/projects/{id}/`).
- **BACK-03**: Django app `skills` providing categorized technical competencies (`GET /api/skills/`).
- **BACK-04**: Django app `contact` handling submissions (`POST /api/contact/`) with input validation, sanitization, and rate-limiting.
- **BACK-05**: Django app `analytics` providing visit/interaction metrics (`GET /api/achievements/`, `POST /api/analytics/track/`).
- **BACK-06**: Comprehensive Django Admin dashboard with custom ModelAdmins for managing all portfolio content.
- **BACK-07**: Seed data script or initial fixtures populating all real projects, skills, education, and bio info.

### Swarm Cursor Engine (SWARM)
- **SWARM-01**: Custom React Swarm Cursor engine (`SwarmCursor.jsx`) implementing organic flocking physics (boids algorithm: separation, alignment, cohesion).
- **SWARM-02**: Multiplayer-style cursor representations with designer names/roles, vibrant colors, and SVG cursor graphics.
- **SWARM-03**: Dynamic particle trails responding to mouse velocity and acceleration.
- **SWARM-04**: Interactive behaviors: orbiting around hero heading, gathering near active buttons, scattering on click.
- **SWARM-05**: 60fps performance optimization using `requestAnimationFrame`, canvas rendering, and zero redundant React renders.
- **SWARM-06**: Accessibility support: automatically disabled on touch/mobile devices and when `prefers-reduced-motion` is active.

### 3D WebGL & Hero Experience (HERO)
- **HERO-01**: Full-screen Three.js / React Three Fiber canvas with cinematic camera controls and dark futuristic aesthetic.
- **HERO-02**: Interactive floating 3D tech artifacts (dodecahedron / torus / crystalline wireframes) with mouse parallax.
- **HERO-03**: Atmospheric ambient particles / starfield with soft cyan, electric blue, and purple lighting.
- **HERO-04**: Hero typography: "AYUSH GORA", "Creative Developer | Cloud & DevOps Enthusiast", and inspirational quote.
- **HERO-05**: Call-to-action buttons ("EXPLORE MY WORK" with smooth scroll, "DOWNLOAD RESUME" modal/download).

### About Me & Education (ABOUT)
- **ABOUT-01**: Engaging profile presentation with real bio details and replaceable avatar placeholder.
- **ABOUT-02**: Interactive timeline highlighting B.Tech in CSE at GNA University, Phagwara (2025–2029).
- **ABOUT-03**: Cloud and DevOps career objective highlight with glassmorphic cards and subtle gradient borders.

### Skills Visualization (SKILL)
- **SKILL-01**: Interactive 3D/animated skill cards grouped by Frontend, Backend, Cloud & DevOps, and Tools.
- **SKILL-02**: Real technologies represented: HTML/CSS, React, Python, Django, SQL, AWS (EC2, S3, IAM, Lambda), Docker, Linux, Git.
- **SKILL-03**: Interactive hover highlights and orbit motions without misleading arbitrary percentage scores.

### Project Showcase (PROJ)
- **PROJ-01**: Interactive 3D project cards for all 5 verified projects (Bingo Multiplayer, SamajSeva, Developer Portfolio, MSJ Engineering Consultancy, JAP Interior).
- **PROJ-02**: 3D hover-tilt effect with dynamic lighting, smooth image zoom, and technology tag chips.
- **PROJ-03**: Live demo and GitHub repository buttons with verified/placeholder link indicators.
- **PROJ-04**: Real-time integration with Django backend API (`/api/projects/`) with responsive loading skeletons.

### Experience & Achievements (EXP)
- **EXP-01**: Education, learning milestones, and developer journey sections rendered from Django backend.
- **EXP-02**: Achievements and certifications framework editable via Django admin.

### Contact Experience (CONT)
- **CONT-01**: Glassmorphism interactive contact form (Name, Email, Subject, Message).
- **CONT-02**: Form submission connected to `POST /api/contact/` with animated loading, success, and error feedback states.
- **CONT-03**: Verified social links: GitHub, LinkedIn, Email with animated magnetic hover effects.

### Animation System & Polish (ANIM)
- **ANIM-01**: GSAP / Framer Motion scroll reveals and smooth section entry transitions.
- **ANIM-02**: Lenis smooth-scrolling integration with zero jank.
- **ANIM-03**: Atmospheric futuristic preloader with progress indicator and cinematic intro reveal.

### Responsiveness & Performance (PERF)
- **PERF-01**: Full responsiveness verified across desktop (1920x1080), laptop (1366x768), tablet (768px), and mobile (375px).
- **PERF-02**: Three.js WebGL canvas performance scaling (pixel ratio clamping, geometry reuse, frame budget guards).
- **PERF-03**: Accessible markup with semantic tags, ARIA labels, keyboard focus states, and high contrast text.

### Testing, QA & Code Review (QA)
- **QA-01**: Django backend automated tests verifying all API endpoints, model logic, and contact form validation.
- **QA-02**: Frontend test and lint verification confirming zero console errors, clean builds, and responsive layout integrity.
- **QA-03**: Code Reviewer audit assessing architecture, security (CORS/CSRF/SQLi/XSS), performance, and code quality.

### Deployment & Delivery (DEP)
- **DEP-01**: Production-ready deployment configuration (Postgres settings, WhiteNoise for static files, Gunicorn/Uvicorn, Vercel/Render guides).
- **DEP-02**: Comprehensive `README.md` with Windows PowerShell local setup commands, API documentation, and architecture tour.

---

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| ARCH-01 | Phase 1 | Completed |
| ARCH-02 | Phase 1 | Completed |
| ARCH-03 | Phase 1 | Completed |
| ARCH-04 | Phase 1 | Completed |
| BACK-01 | Phase 2 | Completed |
| BACK-02 | Phase 2 | Completed |
| BACK-03 | Phase 2 | Completed |
| BACK-04 | Phase 2 | Completed |
| BACK-05 | Phase 2 | Completed |
| BACK-06 | Phase 2 | Completed |
| BACK-07 | Phase 2 | Completed |
| SWARM-01 | Phase 3 | Completed |
| SWARM-02 | Phase 3 | Completed |
| SWARM-03 | Phase 3 | Completed |
| SWARM-04 | Phase 3 | Completed |
| SWARM-05 | Phase 3 | Completed |
| SWARM-06 | Phase 3 | Completed |
| HERO-01 | Phase 4 | Completed |
| HERO-02 | Phase 4 | Completed |
| HERO-03 | Phase 4 | Completed |
| HERO-04 | Phase 4 | Completed |
| HERO-05 | Phase 4 | Completed |
| ABOUT-01 | Phase 5 | Completed |
| ABOUT-02 | Phase 5 | Completed |
| ABOUT-03 | Phase 5 | Completed |
| SKILL-01 | Phase 6 | Completed |
| SKILL-02 | Phase 6 | Completed |
| SKILL-03 | Phase 6 | Completed |
| PROJ-01 | Phase 7 | Completed |
| PROJ-02 | Phase 7 | Completed |
| PROJ-03 | Phase 7 | Completed |
| PROJ-04 | Phase 7 | Completed |
| EXP-01 | Phase 8 | Completed |
| EXP-02 | Phase 8 | Completed |
| CONT-01 | Phase 9 | Completed |
| CONT-02 | Phase 9 | Completed |
| CONT-03 | Phase 9 | Completed |
| ANIM-01 | Phase 10 | Completed |
| ANIM-02 | Phase 10 | Completed |
| ANIM-03 | Phase 10 | Completed |
| PERF-01 | Phase 11 | Completed |
| PERF-02 | Phase 11 | Completed |
| PERF-03 | Phase 11 | Completed |
| QA-01 | Phase 12 | Completed |
| QA-02 | Phase 12 | Completed |
| QA-03 | Phase 12 | Completed |
| DEP-01 | Phase 13 | Completed |
| DEP-02 | Phase 13 | Completed |
