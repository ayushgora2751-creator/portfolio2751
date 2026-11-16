# Task Assignment: Milestone 1 — Next.js 14 Infrastructure & Asset Pipeline

## Mandatory Warning
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

## Objective
Establish the foundation for the Next.js 14 App Router portfolio project at `c:\Users\Ayush\OneDrive\Documents\swarm` and set up the 192-frame asset pipeline.

## Specific Tasks
1. **Root `package.json`**:
   - Install/configure dependencies: `next@^14.2`, `react@^18.2`, `react-dom@^18.2`, `framer-motion@^11`, `lucide-react@^0.368`, `clsx`, `tailwind-merge`.
   - Install/configure devDependencies: `typescript`, `@types/react`, `@types/react-dom`, `@types/node`, `tailwindcss`, `postcss`, `autoprefixer`, `eslint`, `eslint-config-next`.
   - Configure scripts:
     `"dev": "next dev"`,
     `"build": "next build"`,
     `"lint": "next lint"`.
2. **Configuration Files**:
   - Create `tsconfig.json` with strict mode, Next.js plugin, and path alias `"@/*": ["./src/*"]`.
   - Create `next.config.mjs` (clean Next.js config).
   - Create `tailwind.config.ts` (configured for `./src/**/*.{ts,tsx}` with dark theme palette, `#121212`, cyan accents).
   - Create `postcss.config.js`.
3. **Asset Pipeline**:
   - Ensure directory `public/sequence/` exists.
   - Copy all 192 frames from `c:\Users\Ayush\OneDrive\Documents\swarm\ezgif-split\` (`frame_000_delay-0.042s.png` through `frame_191_delay-0.042s.png`) into `public/sequence/`.
   - Verify all 192 files are copied intact with exact original names.
4. **Initial Application Shell**:
   - Create `src/app/globals.css` with Tailwind directives and `#121212` body background.
   - Create `src/app/layout.tsx` (RootLayout with Inter/system font, title "Ayush Gora | Creative Developer").
   - Create `src/app/page.tsx` (minimal clean home page shell).
5. **Build Verification**:
   - Execute `npm install` (or verify node_modules) and `npm run build`.
   - Ensure the build succeeds cleanly with 0 TypeScript and 0 ESLint errors.

## Input Artifacts
- `c:\Users\Ayush\OneDrive\Documents\swarm\.agents\teamwork\ORIGINAL_REQUEST.md`
- `c:\Users\Ayush\OneDrive\Documents\swarm\.agents\teamwork\orchestrator\PROJECT.md`
- `c:\Users\Ayush\OneDrive\Documents\swarm\.agents\teamwork\teamwork_explorer_survey_1\handoff.md`
- `c:\Users\Ayush\OneDrive\Documents\swarm\.agents\teamwork\teamwork_explorer_survey_2\handoff.md`

## Output
Write your handoff report to: `c:\Users\Ayush\OneDrive\Documents\swarm\.agents\teamwork\teamwork_worker_m1\handoff.md`.
Include build commands run, terminal output, and verification results.
Send a completion message when finished.

## 2026-11-04T16:27:00Z
You are teamwork_worker_m1.
Your working directory is: c:\Users\Ayush\OneDrive\Documents\swarm\.agents\teamwork\teamwork_worker_m1
Read your task instructions in: c:\Users\Ayush\OneDrive\Documents\swarm\.agents\teamwork\teamwork_worker_m1\DISPATCH.md
Read the user requirements in: c:\Users\Ayush\OneDrive\Documents\swarm\.agents\teamwork\ORIGINAL_REQUEST.md
Read the project architecture in: c:\Users\Ayush\OneDrive\Documents\swarm\.agents\teamwork\orchestrator\PROJECT.md
Read survey reports:
- c:\Users\Ayush\OneDrive\Documents\swarm\.agents\teamwork\teamwork_explorer_survey_1\handoff.md
- c:\Users\Ayush\OneDrive\Documents\swarm\.agents\teamwork\teamwork_explorer_survey_2\handoff.md

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Implement Milestone 1:
1. Root package.json with Next.js 14, TypeScript, Tailwind, Lucide, Framer Motion.
2. tsconfig.json, next.config.mjs, tailwind.config.ts, postcss.config.js.
3. Copy all 192 frames from ezgif-split/ to public/sequence/.
4. Initial clean App Router shell (src/app/layout.tsx, globals.css with #121212 background, src/app/page.tsx).
5. Run build verification (npm run build) and ensure 0 errors.

Write your handoff report to: c:\Users\Ayush\OneDrive\Documents\swarm\.agents\teamwork\teamwork_worker_m1\handoff.md
Send a completion message when finished.
