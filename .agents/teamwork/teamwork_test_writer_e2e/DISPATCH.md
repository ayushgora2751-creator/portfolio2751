# Task Assignment: E2E Testing Suite (Tiers 1–4)

## Objective
Design and implement an opaque-box, requirement-driven E2E test suite for Ayush Gora's Scrollytelling Portfolio per `ORIGINAL_REQUEST.md` and `PROJECT.md § Feature Inventory`.

## Mandatory Guidelines
1. Requirement-driven: Derive strictly from `ORIGINAL_REQUEST.md` and user requirements. Do not depend on internal private functions.
2. Opaque-box testing: Verify user-visible behavior and DOM invariants:
   - Zero `<video>` tags anywhere in the project.
   - HTML5 `<canvas>` element present in sticky scroller container.
   - All 192 frames in `public/sequence/frame_000_delay-0.042s.png` through `frame_191_delay-0.042s.png`.
   - Responsive cover scaling calculations for mobile (375px) and desktop (1440px).
   - Parallax overlay text milestones at 0%, 30%, 60% with exact text copies and alignments.
   - All 5 verified projects (Bingo Multiplayer, SamajSeva, 3D Portfolio, MSJ Engineering, JAP Interior) rendered in work grid with glassmorphism.
   - Page background color `#121212`.
3. Systematic 4-tier structure:
   - Tier 1: Feature Coverage (>=5 test cases per feature area)
   - Tier 2: Boundary & Corner Cases (>=5 test cases per feature area)
   - Tier 3: Cross-Feature Interactions
   - Tier 4: Real-World User Scenarios (complete scrollytelling journey)
4. Create test runner script in `tests/run_e2e.js` that executes all tiers, outputs test counts and pass/fail summary, and exits with code 0 on success.
5. Create `TEST_INFRA.md` and `TEST_READY.md` documenting test commands and coverage checklist.

## Input Artifacts
- `c:\Users\Ayush\OneDrive\Documents\swarm\.agents\teamwork\ORIGINAL_REQUEST.md`
- `c:\Users\Ayush\OneDrive\Documents\swarm\.agents\teamwork\orchestrator\PROJECT.md`

## Output
Write code in `tests/`, `TEST_INFRA.md`, and `TEST_READY.md`.
Write your handoff report to: `c:\Users\Ayush\OneDrive\Documents\swarm\.agents\teamwork\teamwork_test_writer_e2e\handoff.md`.
Send a completion message when finished.


## 2026-11-04T16:27:00Z
Received dispatch message:
You are teamwork_test_writer_e2e.
Your working directory is: c:\Users\Ayush\OneDrive\Documents\swarm\.agents\teamwork\teamwork_test_writer_e2e
Read your task instructions in: c:\Users\Ayush\OneDrive\Documents\swarm\.agents\teamwork\teamwork_test_writer_e2e\DISPATCH.md
Read the user requirements in: c:\Users\Ayush\OneDrive\Documents\swarm\.agents\teamwork\ORIGINAL_REQUEST.md
Read the project specifications in: c:\Users\Ayush\OneDrive\Documents\swarm\.agents\teamwork\orchestrator\PROJECT.md

Build the comprehensive opaque-box E2E test suite covering Tiers 1-4 for the scrollytelling portfolio website.
Write the test suites in tests/, write TEST_INFRA.md, and create TEST_READY.md when complete.
Write your handoff report to: c:\Users\Ayush\OneDrive\Documents\swarm\.agents\teamwork\teamwork_test_writer_e2e\handoff.md
Send a completion message when finished.


## 2026-11-04T16:48:21Z
[Message from 6dde6503-351a-49c2-869b-58855c518e51]
**Context**: E2E Testing Suite
**Content**: Checking in on E2E test authoring progress. How are the Tiers 1-4 tests and TEST_READY.md coming along?
**Action**: Please update progress.md or send completion report when ready.
