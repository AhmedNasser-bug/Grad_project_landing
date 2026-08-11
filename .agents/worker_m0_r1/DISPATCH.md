## 2026-08-05T16:22:18Z
You are teamwork_preview_worker assigned to implement Milestone 0 (Epic 0: Reusable Design System Visual Assets & Primitives) and Epic 1 Foundation (Root Proxy package.json & Astro Workspace setup).
Your working directory is D:/Study/Programming/Projects/Grad_project_landing/.agents/worker_m0_r1/

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Instructions & Context:
1. Read ORIGINAL_REQUEST.md at D:/Study/Programming/Projects/Grad_project_landing/.agents/ORIGINAL_REQUEST.md.
2. Read PROJECT.md at D:/Study/Programming/Projects/Grad_project_landing/.agents/orchestrator/PROJECT.md.
3. Read handoff reports from Explorers:
   - D:/Study/Programming/Projects/Grad_project_landing/.agents/explorer_m0_r1_2/handoff.md
   - D:/Study/Programming/Projects/Grad_project_landing/.agents/explorer_m0_r1_3/handoff.md
4. Architecture Mandate: The landing page is an Astro v5 monorepo isolated in `dashboard/`. All files must be placed in `dashboard/src/` (and root proxy scripts in root `package.json`).

Tasks to Implement:
1. Create root `package.json` proxy scripts delegating `npm run dev`, `npm run build`, `npm run preview` to `--prefix dashboard`.
2. Configure `dashboard/package.json` with required dependencies: `astro`, `@astrojs/react`, `@astrojs/tailwind`, `react`, `react-dom`, `three`, `gsap`, `p5`, `tailwindcss`, `clsx`, `tailwind-merge`.
3. Create `dashboard/src/lib/tokens/clinicalVitalityTokens.ts`:
   - Export Clinical Light Mode design tokens (`#FFFFFF` surface, `#F8FAFC` background tint, `#004AC6` primary blue, `#0B1C30` slate typography, `#10B981` success, `#EF4444` critical alert).
4. Create `dashboard/src/lib/canvas/FluidShaderEngine.ts`:
   - WebGL fluid dynamics GLSL shader representing dialysate clearance (`u_time`, `u_resolution`, `u_clearanceRate`).
   - Include WAF `REL-04` event listeners for `webglcontextlost` (calling `e.preventDefault()`) and `webglcontextrestored` (re-initializing buffers/shaders and resuming loop at >= 60 FPS).
5. Create `dashboard/src/lib/canvas/CadWireframeEngine.ts`:
   - Three.js 3D CAD wireframe cylinder model with `THREE.CylinderGeometry(1.8, 1.8, 8, 24, 8, true)`, `WireframeGeometry`, `LineSegments`, `rotation.z = Math.PI / 4`, rotation speed `0.006` rad/frame, 500 hollow-fiber particles.
   - Include WAF `COST-01` resource disposal (`dispose()`, `cancelAnimationFrame`, `ResizeObserver.disconnect()`).
6. Create `dashboard/src/lib/gsap/ParallaxCardScrollTrigger.ts`:
   - 100vw x 100vh sticky parallax card controller with GSAP ScrollTrigger timeline bindings (`start: 'top top'`, `end: '+=100%'`, `pin: true`, `scrub: 1`).
7. Create `dashboard/src/lib/gsap/TextSplitUtil.ts`:
   - Headline reveal utility for `clamp(2.8rem, 5vw, 5.5rem)` typography.
8. Create `dashboard/src/lib/gsap/HyperframesScrubber.ts`:
   - Video scroll scrubber with WAF `REL-01` 5000ms fetch timeout fallback.
9. Create `dashboard/src/lib/routing/UTMRouter.ts`:
   - Client-side & server-side UTM parameter parser (`?utm_role=patient|nurse|clinician` and `?utm_persona=`), `localStorage` sync (`pharos_utm_role`), and subscriber state events.
10. Create `dashboard/src/components/primitives/SwissCardPrimitive.astro` / `.tsx`:
    - Swiss Minimalist card primitive with 1px razor borders (`#E2E8F0` / `#004AC6`) and JetBrains Mono watermark indices.

Verification:
- Run build command (`npm run build` or `npm --prefix dashboard run build`).
- Verify zero build or compilation errors.
- Document exact build commands and full command outputs in your handoff report.
- Write your handoff report to D:/Study/Programming/Projects/Grad_project_landing/.agents/worker_m0_r1/handoff.md and notify parent with the summary and path.
