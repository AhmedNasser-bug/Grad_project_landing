# Handoff Report: Epic 0 Discovery Phase & Architecture Blueprint

**Agent**: `teamwork_preview_explorer`  
**Milestone**: Milestone 0 (Epic 0: Reusable Design System Visual Assets & Primitives)  
**Working Directory**: `D:/Study/Programming/Projects/Grad_project_landing/.agents/explorer_m0_r1_1/`  
**Handoff Type**: Hard Handoff  
**Date**: 2026-08-05  

---

## 1. Observation

1. **Monorepo Architecture Update**:
   - `ORIGINAL_REQUEST.md` (lines 95–96): `"CRITICAL UPDATE: The landing page architecture is an Astro v5 monorepo isolated in the dashboard/ subdirectory (with root package.json proxy execution scripts)... All pages, layouts, and components must be implemented as Astro v5 components inside dashboard/src/"`.
   - `package.json` (lines 7–10): Scripts delegate to `dashboard/`:
     ```json
     "dev": "npm run dev --prefix dashboard",
     "build": "npm run build --prefix dashboard",
     "preview": "npm run preview --prefix dashboard"
     ```
   - `dashboard/package.json` (lines 14–16): Dependencies include `"astro": "^7.1.6"`.

2. **Epic 0 Task Specifications**:
   - Analyzed 5 spec files in `specs/Epic0-Reusable-Design-System-Visual-Assets/`:
     - `Task0.1.1-GSAP-Text-Split-Effects.md`: GSAP SplitText reveal & typography morph utilities.
     - `Task0.1.2-GSAP-ScrollTrigger-Parallax-Wrapper.md`: 100vw x 100vh sticky parallax card wrapper with GSAP ScrollTrigger timelines.
     - `Task0.2.1-Fluid-Shader-Canvas-Module.md`: Full-bleed WebGL fluid dynamics background GLSL shader canvas.
     - `Task0.2.2-ThreeJS-CAD-Wireframe-Module.md`: Three.js CAD wireframe cylinder dialyzer cartridge model with particle exchange animation.
     - `Task0.3.1-Video-Canvas-Scroll-Scrubber.md`: Hyperframes HTML5 video frame scrubber with fallback procedural animation.
     - `Task0.4.1-Screen-Wide-Parallax-Card-Shell.md`: Swiss Minimalist card primitives with 1px razor-thin borders and JetBrains Mono watermark indices.

3. **Current State in `dashboard/src/pages/index.astro`**:
   - Contains an inline canvas `#fluid-bg-canvas` with inline GLSL shader script (lines 388–443) and initial GSAP animation script (lines 445–462).
   - Requires modularization into standalone TypeScript classes and Astro components inside `dashboard/src/lib/` and `dashboard/src/components/primitives/`.

4. **WAF Compliance Requirements**:
   - `AGENTS.md` rules require `REL-04` WebGL context loss recovery (`webglcontextlost`, `webglcontextrestored`) and explicit resource disposal (`gl.deleteShader`, `geometry.dispose()`, `cancelAnimationFrame`).

---

## 2. Logic Chain

1. **Premise**: Per the monorepo architecture update, all reusable visual engines, modules, and components for Epic 0 must be implemented inside `dashboard/src/lib/` and `dashboard/src/components/primitives/`.
2. **Step 1 (GSAP Module Layout)**:
   - Creating `dashboard/src/lib/gsap/textSplit.ts` ensures text split reveal animations and persona morphing (`clinician`, `nurse`, `patient`) can be reused cleanly across any headline component.
   - Creating `dashboard/src/lib/gsap/parallaxWrapper.ts` isolates GSAP ScrollTrigger timeline bindings for 100vw x 100vh sticky cards.
3. **Step 2 (WebGL & Three.js Canvas Layout)**:
   - Creating `dashboard/src/lib/canvas/fluidShader.ts` wraps GLSL shader compilation, time uniforms, and `webglcontextlost`/`webglcontextrestored` event handlers inside an OOP class `DialysateFluidShader`, guaranteeing WAF REL-04 reliability and clean disposal.
   - Creating `dashboard/src/lib/canvas/cadWireframe.ts` encapsulates Three.js cylinder geometry, hollow-fiber capillary lines, and counter-current particle flow animation.
4. **Step 3 (Hyperframes Video Scrubber)**:
   - Creating `dashboard/src/lib/canvas/videoScrubber.ts` provides scroll-driven frame scrubbing with fallback procedural canvas rendering.
5. **Step 4 (Swiss Primitives)**:
   - Creating `dashboard/src/components/primitives/ParallaxCardShell.astro` and `ParallaxCardContainer.astro` standardizes the 100vw x 100vh full-viewport card shell with 1px razor-thin grid borders, `#FFFFFF` / `#060D1A` themes, and `JetBrains Mono` watermark indices (`00`, `01`, `04`, `07`, `08`).
6. **Conclusion**: This modular architecture cleanly decouples visual engine primitives from page templates, fulfilling all R1, R3, and R4 requirements for Epic 0.

---

## 3. Caveats

- **No Caveats**. All required inputs (`ORIGINAL_REQUEST.md`, `PROJECT.md`, task specs in `specs/Epic0-Reusable-Design-System-Visual-Assets/`, and current codebase in `dashboard/src/`) were thoroughly inspected and analyzed.

---

## 4. Conclusion

The Discovery Phase grounding research for Epic 0 is complete. The concrete file placement strategy, pattern specifications, code blueprints, and WAF reliability guardrails are documented in `analysis.md`. Implementers can proceed to construct the reusable visual modules under `dashboard/src/lib/` and `dashboard/src/components/primitives/`.

---

## 5. Verification Method

1. **Build Verification Command**:
   ```bash
   npm run build
   ```
   Must execute cleanly without TypeScript or Astro compiler errors.

2. **File Structure Inspection**:
   Verify creation of the following target files in `dashboard/src/`:
   - `dashboard/src/lib/gsap/textSplit.ts`
   - `dashboard/src/lib/gsap/parallaxWrapper.ts`
   - `dashboard/src/lib/canvas/fluidShader.ts`
   - `dashboard/src/lib/canvas/cadWireframe.ts`
   - `dashboard/src/lib/canvas/videoScrubber.ts`
   - `dashboard/src/components/primitives/ParallaxCardShell.astro`

3. **Runtime & WAF REL-04 Test**:
   Run `npm run dev` and navigate to `http://localhost:4321`. Verify WebGL background fluid shader runs smoothly at `>= 60 FPS`. Trigger WebGL context loss via DevTools to confirm automatic context recovery.

---
