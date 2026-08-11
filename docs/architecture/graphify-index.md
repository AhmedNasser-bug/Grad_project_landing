# Architecture Diagrams & Graphify Index

> Master index of living architecture diagrams for the Pharos Hemodialysis Digitization Portal.
> Last updated: 2026-08-11.

## Living Architecture Diagrams

1. 🗺 **[System Topology (C4 Architecture)](file:///d:/Study/Programming/Projects/Grad_project_landing/docs/architecture/system-topology.md)**
   - Top-down architecture map of Astro subfolder monorepo (`dashboard/`), Canvas engines, GSAP animation layer, and Vercel edge deployment.
2. 🔗 **[Component Dependency Graph](file:///d:/Study/Programming/Projects/Grad_project_landing/docs/architecture/dependency-graph.md)**
   - Adjacency list of all module imports, hub nodes (`global.css`, `Layout.astro`, `clinicalVitalityTokens.ts`, `UTMRouter.ts`), and vestigial cleanup targets.
3. 🔄 **[Data Flow Diagram](file:///d:/Study/Programming/Projects/Grad_project_landing/docs/architecture/data-flow.md)**
   - Client-side persona state mutations, query parameter routing, and non-blocking WebGL render telemetry loop.
4. ⚙️ **[State Machine Diagram](file:///d:/Study/Programming/Projects/Grad_project_landing/docs/architecture/state-machines.md)**
   - Finite automaton models for `UTMRouter` persona states and WebGL resource lifecycle teardown (`WAF COST-01`).
5. 🎬 **[Sequence Flows Diagram](file:///d:/Study/Programming/Projects/Grad_project_landing/docs/architecture/sequence-flows.md)**
   - Step-by-step sequence diagrams for page hydration, persona tab switching, and clean unmount events.

---

## Graphify Gate Report

```
GRAPHIFY GATE REPORT
====================
✓ System Topology:       Generated (14 nodes, 18 edges)
✓ Dependency Graph:      Generated (0 circular deps, 4 hub nodes, 1 vestigial root folder)
✓ State Machines:        Generated (2 finite state machines)
✓ Data Flow:             Generated (3 inputs, 4 data transformations, 2 render sinks)
✓ Sequence Flows:        Generated (5 actors, 12 sequence steps)

⚠ RISK & REFACTOR AREAS IDENTIFIED:
  1. Vestigial Root Folder: Empty root `src/` directory leftover from legacy setup needs removal to enforce clean subfolder monorepo isolation (`dashboard/`).
  2. Canvas Resource Teardown: Ensure WebGL rendering loops in `CadWireframeEngine.ts` and `FluidShaderEngine.ts` consistently register teardown listeners on Astro page transitions.
  3. GSAP ScrollTrigger Cleanup: Audit `HyperframesScrubber.ts` and `ParallaxCardScrollTrigger.ts` for explicit `.kill()` handling on DOM element removal.
  4. Design System Compliance: Verify `global.css` CSS variables (`Clinical Vitality`) are applied universally across all 6 pages without inline style overrides.

🔒 CLEARED TO IMPLEMENT: YES
```
