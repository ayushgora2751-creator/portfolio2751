# Task Assignment: E2E Testing Track — Test Suite & Infrastructure

**Agent**: test_writer_e2e
**Role**: E2E Test Writer & Test Infrastructure Architect
**Working Directory**: c:\Users\Ayush\OneDrive\Documents\swarm\.agents\teamwork\test_writer_e2e\
**Input Documents**:
- `c:\Users\Ayush\OneDrive\Documents\swarm\.agents\teamwork\ORIGINAL_REQUEST.md`
- `c:\Users\Ayush\OneDrive\Documents\swarm\.agents\teamwork\PROJECT.md`

## Objectives
1. Author `TEST_INFRA.md` at project root `c:\Users\Ayush\OneDrive\Documents\swarm\TEST_INFRA.md` according to the template in the Project Pattern:
   - Test Philosophy: Opaque-box, requirement-driven, derived from ORIGINAL_REQUEST.md and PROJECT.md Feature Inventory.
   - 4-Tier Test Architecture:
     * Tier 1: Feature Coverage (>=5 tests per feature for core features).
     * Tier 2: Boundary & Corner Cases (limits, zero velocity, sudden stop, fast flick, screen edges, zero-interaction load, mute/unmute rapid toggle, autoplay constraints).
     * Tier 3: Cross-Feature Combinations (e.g. intro playing + mute toggle, skip intro + immediate mouse orbit, replay intro after page scroll + 3D scene tilt, mobile resize + orbit suppression).
     * Tier 4: Real-World Application Scenarios (first-time visitor walkthrough, fast-scroller skip-to-projects, interactive 3D exploration, replay sequence after navigation).
2. Create executable test suites and test runner in `c:\Users\Ayush\OneDrive\Documents\swarm\tests\` or `frontend/tests/`:
   - Self-contained, runnable via `node` or `npm test` or a standalone runner script.
   - Evaluates pure logic, state machines, Web Audio node routing contracts, coordinate mappings, and DOM/canvas contracts.
   - Include test fixtures, assertions, and clear exit codes (0 for pass, 1 for fail).
3. Upon completing test suite infrastructure and authoring tests, generate:
   `c:\Users\Ayush\OneDrive\Documents\swarm\TEST_READY.md` containing the runner command and coverage checklist.

## Output
Write `TEST_INFRA.md` and `TEST_READY.md`, author the test scripts in `tests/`, and write your handoff report to `c:\Users\Ayush\OneDrive\Documents\swarm\.agents\teamwork\test_writer_e2e\handoff.md`.
Maintain `progress.md` in your working directory.
When finished, notify orchestrator via `send_message`.

## 2026-11-04T15:22:12Z
You are test_writer_e2e, a specialized test authoring and infrastructure subagent.
Your working directory is: c:\Users\Ayush\OneDrive\Documents\swarm\.agents\teamwork\test_writer_e2e\
Your task assignment is in: c:\Users\Ayush\OneDrive\Documents\swarm\.agents\teamwork\test_writer_e2e\DISPATCH.md
Read the authoritative user request: c:\Users\Ayush\OneDrive\Documents\swarm\.agents\teamwork\ORIGINAL_REQUEST.md
Read the master project scope: c:\Users\Ayush\OneDrive\Documents\swarm\.agents\teamwork\PROJECT.md

Build the comprehensive E2E Testing suite for the 3D developer portfolio swarm enhancements:
1. Author c:\Users\Ayush\OneDrive\Documents\swarm\TEST_INFRA.md following the Project Pattern (Tier 1 Feature Coverage, Tier 2 Boundaries, Tier 3 Cross-feature combinations, Tier 4 Real-world scenarios).
2. Author runnable, automated test scripts in `tests/` covering:
   - Continuous cursor orbit & rotation logic (stationary + moving, angular evolution, zero velocity stability, High-DPI scaling, boundary deflection).
   - Web Audio synthesizer engine (MasterGain routing, mute/unmute state machine, sound profiles, click-free transitions).
   - Live website construction intro sequence (6-phase state machine, dynamic spatial coordinates, skip immediately bypasses, replay resets scroll to (0,0) and locks body, 3D scene / navigation preservation).
   - Visual styling & badges (blueprint grid geometry, design badges, transform handles).
3. Ensure tests run with standard node (`node tests/...`) or `npm test` and output clean pass/fail summaries with exit code 0 on success.
4. When test cases and infrastructure are complete and verified runnable, publish c:\Users\Ayush\OneDrive\Documents\swarm\TEST_READY.md.
5. Write your complete handoff report to:
   c:\Users\Ayush\OneDrive\Documents\swarm\.agents\teamwork\test_writer_e2e\handoff.md
Maintain progress.md in your working directory.
When finished, send a message to orchestrator (conversation ID: 12ac508b-861f-4a78-8ce6-32adb45366b7).
