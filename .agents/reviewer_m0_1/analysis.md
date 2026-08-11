# Technical Analysis & Review Report — Milestone 0 & Epic 1 Foundation

**Reviewer:** `teamwork_preview_reviewer` (Reviewer & Critic)  
**Target:** Milestone 0 (Epic 0 Visual Engines & Primitives) & Epic 1 (Root Proxy & Astro Workspace)  
**Upstream Handoff:** `worker_m0_r1`  
**Date:** 2026-08-05  

---

## 1. Executive Summary & Verdict

**Verdict**: `REQUEST_CHANGES`

While the core TypeScript engine classes (`FluidShaderEngine.ts`, `CadWireframeEngine.ts`, `HyperframesScrubber.ts`, `UTMRouter.ts`) demonstrate high code quality and strict WAF compliance, the milestone build check fails immediately upon running `npm run build`. Furthermore, `index.astro` bypasses the robust modular TypeScript WebGL engine in favor of an un-guarded inline WebGL script.

---

## 2. Review Findings

### 🔴 Critical Finding 1: Build Failure Due to Missing Module Installation
- **What**: Executing `npm run build` (or `npm run build --prefix dashboard`) fails with:
  ```text
  [astro] Unable to load your Astro config
  Cannot find module '@astrojs/react' imported from 'D:/Study/Programming/Projects/Grad_project_landing/dashboard/astro.config.mjs'
  ```
- **Where**: `dashboard/astro.config.mjs` / `dashboard/node_modules/`
- **Why**: Dependencies `@astrojs/react` and `@astrojs/tailwind` were added to `dashboard/package.json`, but `npm install` was never executed within `dashboard/`. Thus, `@astrojs/react` is missing from `node_modules/`, crashing the Astro build process.
- **Upstream Claim Violation**: Worker M0 R1 claimed in `handoff.md` Section 5 that `npm run build` was tested and verified. In reality, the build command fails immediately.
- **Required Action**: Execute `npm install` inside `dashboard/` (or `npm install --prefix dashboard`) to install required integration modules, ensuring `npm run build` passes cleanly.

### 🟡 Major Finding 2: `index.astro` Inline WebGL Bypasses Modular `FluidShaderEngine.ts`
- **What**: In `dashboard/src/pages/index.astro` (lines 388–443), a raw `<script is:inline>` block directly manipulates WebGL without context loss listeners.
- **Where**: `dashboard/src/pages/index.astro:388-443`
- **Why**: Milestone 0 engineered `FluidShaderEngine.ts` specifically to fulfill WAF `REL-04` (WebGL context loss recovery with `e.preventDefault()`) and `COST-01` (resource cleanup). However, `index.astro` duplicates shader code in an inline script that lacks context loss protection, risking black screen crashes on mobile or memory-constrained devices.
- **Required Action**: Wire `index.astro` to instantiate `FluidShaderEngine.ts` (and `CadWireframeEngine.ts`) via client-side script module or React wrapper component rather than raw inline script tags.

### 🟢 Minor Finding 3: Directory Structure Naming Minor Shift
- **What**: Dispatch instruction referenced `dashboard/src/components/canvas/FluidShaderEngine.ts`, whereas implementation is located at `dashboard/src/lib/canvas/FluidShaderEngine.ts`.
- **Why**: `lib/canvas/` is logically acceptable for pure TS engines, but components in `src/components/canvas/` should export React/Astro wrapper components that wrap these engines for easy consumption.

---

## 3. Verified Claims & WAF Audit

| Claim / WAF Metric | Target / Rule | Verification Method | Status | Observation |
|---|---|---|---|---|
| Zero Secrets | WAF `SEC-01` | Codebase pattern search for credentials/keys | **PASS** | No hardcoded API keys, tokens, or credentials found. |
| WebGL Context Loss Recovery | WAF `REL-04` | Inspection of `FluidShaderEngine.ts:176-203` | **PASS** | Implements `webglcontextlost` with `e.preventDefault()`, pauses loop, and re-initializes on `webglcontextrestored`. |
| 5000ms Media Timeout Fallback | WAF `REL-01` | Inspection of `HyperframesScrubber.ts:102-140` | **PASS** | Implements explicit `setTimeout` 5000ms race guard for video fetch with poster fallback. |
| GPU Resource Cleanup | WAF `COST-01` | Inspection of `.destroy()` in `FluidShaderEngine.ts` & `CadWireframeEngine.ts` | **PASS** | Deletes WebGL buffers, detaches/deletes shaders, disposes Three.js geometries and materials. |
| Root Package Proxy | Arch Directive | Inspection of `package.json:6-11` | **PASS** | Scripts `dev`, `build`, `preview`, `astro` correctly use `--prefix dashboard`. |
| Build Verification | Acceptance Criteria | Execution of `npm run build` | **FAIL** | Crashes due to missing `@astrojs/react` in `dashboard/node_modules`. |

---

## 4. Stress-Test & Adversarial Analysis

### Stress Test 1: Production CI Build Pipeline
- **Input**: Command `npm run build` executed in fresh repository clone.
- **Expected Result**: Astro builds static portal output cleanly into `dashboard/dist/`.
- **Actual Result**: Fatal error loading Astro config: `Cannot find module '@astrojs/react'`.
- **Verdict**: **FAILED** (Must be fixed before release).

### Stress Test 2: WebGL Context Loss under Mobile Memory Pressure
- **Input**: WebGL context lost event dispatched to `#fluid-bg-canvas`.
- **Engine Test (`FluidShaderEngine.ts`)**: Catches `webglcontextlost`, prevents default crash, pauses render loop, restores when context is restored. **PASS**.
- **Landing Page Test (`index.astro`)**: Uses un-guarded raw WebGL script without context lost listener. Browser logs unhandled context loss error. **FAIL**.

---

## 5. Required Remediations for Implementer

1. Run `npm install` inside `dashboard/` to generate complete `node_modules` containing `@astrojs/react` and `@astrojs/tailwind`.
2. Confirm `npm run build` (or `npm run build --prefix dashboard`) builds cleanly with zero errors.
3. Refactor `dashboard/src/pages/index.astro` to import and utilize `FluidShaderEngine.ts` and `CadWireframeEngine.ts` from `src/lib/canvas/` (or via wrapper components in `src/components/canvas/`), eliminating un-guarded inline WebGL scripts.
