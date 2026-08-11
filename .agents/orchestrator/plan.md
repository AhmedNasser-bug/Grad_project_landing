# Orchestrator Plan — Pharos University Hemodialysis Digitization

## Objective
Deliver a high-trust, production-ready landing page (`index.html`), research blog engine (`blog.html` & `/blog/[slug]`), and complete spec tree implementation (Epics 0-8) for Pharos University Graduation Project (AY 2026/2027), under Dr. Mohamed Abdou.

## Execution Strategy

### Phase 0: Survey & Spec Mining
- Dispatch Explorers & Spec Miners to map existing files, specifications in `specs/`, UI assets, components, dependencies, and requirement gaps.
- Synthesize findings into `PROJECT.md` (Feature Inventory, Architecture, Code Layout, Milestones).

### Phase 1: Milestone Decomposition & Track Setup
- Milestone 0: Epic 0 — Reusable Design System Visual Assets & Foundation (`specs/Epic0-Reusable-Design-System-Visual-Assets/`)
- Milestone 1: Epic 1 — Core Architecture Swiss Minimalist (`specs/Epic1-Core-Architecture-Swiss-Minimalist/`)
- Milestone 2: Epic 2 — Audience Variants UTM Router (`specs/Epic2-Audience-Variants-UTM-Router/`)
- Milestone 3: Epic 3 — Visual Core WebGL Fluid & GSAP (`specs/Epic3-Visual-Core-WebGL-Fluid-GSAP/`)
- Milestone 4: Epic 4 — Cinematic Hyperframes Incident Storyboards (`specs/Epic4-Cinematic-Hyperframes-Incident-Storyboards/`)
- Milestone 5: Epic 5 — Dedicated MDX Blog & Visual Timeline (`specs/Epic5-Dedicated-MDX-Blog-Visual-Timeline/`)
- Milestone 6: Epic 6 — Academic Trust & Team Showcase (`specs/Epic6-Academic-Trust-Team-Showcase/`)
- Milestone 7: Epic 7 — Partnership & Sponsorship Payment Gate (`specs/Epic7-Partnership-Sponsorship-Payment-Gate/`)
- Milestone 8: Epic 8 — Stitch UI Mockup Integration (`specs/Epic8-Stitch-UI-Mockup-Integration/`)

### Phase 2: Parallel Dual Track Execution
- Implementation Track: For each milestone:
  1. Discovery Phase Grounding & User Interview requirement check (R4 mandate)
  2. Explorer -> Worker -> Reviewer -> Challenger -> Forensic Auditor cycle
  3. Gate verification & `GATE_STATUS.md` recording
- E2E Testing Track: Create and maintain test cases across viewports & tiers, publishing `TEST_READY.md`.

### Phase 3: Final Verification & Sentinel Handoff
- Run full test suite, audit WAF compliance (SEC-01, REL-01, REL-04), verify 100% completion of acceptance criteria, send completion message to Sentinel.
