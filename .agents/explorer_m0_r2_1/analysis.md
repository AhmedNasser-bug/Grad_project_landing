# Forensic Audit Failure & Remediation Analysis Report — Milestone 0 Iteration 2

**Role:** `teamwork_preview_explorer`  
**Target:** Forensic Audit Failure Remediation for Milestone 0 & Epic 1 Foundation  
**Working Directory:** `D:/Study/Programming/Projects/Grad_project_landing/.agents/explorer_m0_r2_1/`  
**Integrity Mode:** `development` (per `ORIGINAL_REQUEST.md`)  
**Date:** 2026-08-05  

---

## 1. Executive Summary

A comprehensive read-only investigation was conducted following the Forensic Audit Failure of Milestone 0 Iteration 1 (`auditor_m0_1`). 

### Core Findings:
1. **Source Authenticity & WAF Compliance:** The 12 core source code files written by `worker_m0_r1` in `dashboard/src/` (`FluidShaderEngine.ts`, `CadWireframeEngine.ts`, `ParallaxCardScrollTrigger.ts`, `TextSplitUtil.ts`, `HyperframesScrubber.ts`, `UTMRouter.ts`, `SwissCardPrimitive.astro`, `SwissCardPrimitive.tsx`, `clinicalVitalityTokens.ts`, `astro.config.mjs`, `package.json` proxy, `dashboard/package.json`) are **100% genuine and authentic**. They comply with WAF guardrails:
   - **SEC-01 (Zero Secrets):** No hardcoded credentials or API keys.
   - **REL-01 (Fetch Timeout):** `HyperframesScrubber.ts` implements a 5000ms fetch timeout guard.
   - **REL-04 (WebGL Context Recovery):** `FluidShaderEngine.ts` implements `webglcontextlost` and `webglcontextrestored` event handlers.
   - **COST-01 (Resource Cleanup):** GPU and DOM resources feature `.destroy()` teardown routines.

2. **Primary Audit Failure:** The empirical build command `npm run build --prefix dashboard` failed with exit code 1 due to `Cannot find module '@astrojs/react'`. `worker_m0_r1` updated `dashboard/package.json` and `dashboard/astro.config.mjs`, but failed to execute `npm install --prefix dashboard` to install the packages into `dashboard/node_modules/`.

3. **Reviewer 1 & 2 Request Changes:**
   - **Dependency Compatibility:** `dashboard/package.json` specifies `@astrojs/tailwind ^6.0.0` alongside `tailwindcss ^4.0.0` and `astro ^5.0.0`. In Astro v5 with Tailwind CSS v4, peer dependency resolution or Vite plugin configuration (`@tailwindcss/vite`) must be verified to prevent `ERESOLVE` installation conflicts during `npm install`.
   - **Inline Unmanaged Script in `index.astro`:** `dashboard/src/pages/index.astro` lines 388–462 currently contain an inline unmanaged raw `<script is:inline>` block with raw WebGL GLSL and unmanaged GSAP calls, bypassing `FluidShaderEngine.ts` and `CadWireframeEngine.ts`. This must be updated to import and initialize the modular engine classes with proper `.destroy()` lifecycle management.

---

## 2. Evidence Chain & Detailed Breakdown

### Evidence 1: Build Failure Log (`auditor_m0_1/handoff.md:28-38`)
```
> dashboard@0.0.1 build
> astro build

[astro] Unable to load your Astro config

Cannot find module '@astrojs/react' imported from 'D:/Study/Programming/Projects/Grad_project_landing/dashboard/astro.config.mjs'
  Location:
    D:\Study\Programming\Projects\Grad_project_landing\dashboard\node_modules\vite\dist\node\chunks\node.js:34179:32
```
- **Observation:** `@astrojs/react` is listed in `dashboard/package.json:15`, but is missing from `dashboard/node_modules/@astrojs/`.
- **Inference:** `npm install` was not executed in `dashboard/` after updating `dashboard/package.json`.

### Evidence 2: Package Compatibility Check (`dashboard/package.json:14-26`)
```json
"dependencies": {
  "@astrojs/react": "^4.3.0",
  "@astrojs/tailwind": "^6.0.0",
  "astro": "^5.0.0",
  "clsx": "^2.1.1",
  "gsap": "^3.12.5",
  "p5": "^1.11.0",
  "react": "^19.0.0",
  "react-dom": "^19.0.0",
  "tailwind-merge": "^3.0.0",
  "tailwindcss": "^4.0.0",
  "three": "^0.170.0"
}
```
- **Observation:** `@astrojs/tailwind` v6.0.0 specifies peer dependency on `tailwindcss ^3.0.0`. Running `npm install` with `tailwindcss ^4.0.0` may cause ERESOLVE conflicts in standard npm resolution without proper version alignment or `@tailwindcss/vite` integration.
- **Inference:** `dashboard/package.json` should be aligned for clean installation without requiring force flags, or updated to use `@tailwindcss/vite` for Astro 5 / Tailwind 4.

### Evidence 3: Unmanaged Script in `dashboard/src/pages/index.astro:388-462`
```html
<script is:inline>
  // WebGL Fluid Background
  const canvas = document.getElementById('fluid-bg-canvas');
  if (canvas) {
    const gl = canvas.getContext('webgl');
    ...
  }
</script>
```
- **Observation:** `index.astro` duplicates GLSL shader setup in an inline unmanaged script tag rather than importing `FluidShaderEngine.ts` (`dashboard/src/lib/canvas/FluidShaderEngine.ts`) and `CadWireframeEngine.ts` (`dashboard/src/lib/canvas/CadWireframeEngine.ts`).
- **Inference:** This violates component encapsulation and WAF COST-01 / REL-04 cleanup rules because inline scripts lack context loss recovery and explicit `.destroy()` handlers on page teardown.

---

## 3. Step-by-Step Worker Remediation Strategy

The Worker (`worker_m0_r2`) must perform the following explicit actions:

### Step 1: Package Dependency Fix in `dashboard/package.json`
- Ensure `@astrojs/react`, `@astrojs/tailwind` (or `@tailwindcss/vite`), `three`, `gsap`, `p5`, `react`, `react-dom`, `tailwindcss` are harmonized.
- If using `@tailwindcss/vite` with Astro v5 & Tailwind CSS v4, update `dashboard/package.json` and `dashboard/astro.config.mjs` accordingly so `npm install --prefix dashboard` completes cleanly with exit code 0 and zero ERESOLVE errors.

### Step 2: Execute Dependency Installation
- Run:
  ```powershell
  npm install --prefix dashboard
  ```
- Verify `dashboard/node_modules/@astrojs/react` and `dashboard/node_modules/@astrojs/tailwind` (or `@tailwindcss/vite`) are installed on disk.

### Step 3: Refactor `dashboard/src/pages/index.astro`
- Replace the inline `<script is:inline>` block in `dashboard/src/pages/index.astro` with a client-side module script `<script>` that imports:
  ```typescript
  import { FluidShaderEngine } from '../lib/canvas/FluidShaderEngine';
  import { CadWireframeEngine } from '../lib/canvas/CadWireframeEngine';
  import { ParallaxCardScrollTrigger } from '../lib/gsap/ParallaxCardScrollTrigger';
  import { UTMRouter } from '../lib/routing/UTMRouter';
  ```
- Instantiate `FluidShaderEngine` on `#fluid-bg-canvas`, call `.init()`, and bind window unload / Astro page swap to `.destroy()`.
- Instantiate `CadWireframeEngine` if CAD canvas container is rendered, calling `.init()` and `.destroy()`.
- Bind `UTMRouter` persona switcher buttons (`[data-role]`) to `UTMRouter.setRole(...)` and subscribe to role changes.

### Step 4: Execute Build & Verify Zero Errors
- Run:
  ```powershell
  npm run build --prefix dashboard
  ```
- Confirm output:
  - Exit code: `0`
  - `dist/` bundle created cleanly.
  - Zero TypeScript or module resolution errors.

---

## 4. Verification Matrix for Auditor

| Verification Check | Target Command / Condition | Expected Result |
|--------------------|----------------------------|-----------------|
| Dependency Installation | `npm install --prefix dashboard` | Exit code 0, `dashboard/node_modules/@astrojs/react` present |
| Build Execution | `npm run build --prefix dashboard` | Exit code 0, `dist/` directory generated |
| Modular Canvas Engine | `dashboard/src/pages/index.astro` check | Imports `FluidShaderEngine.ts` & `CadWireframeEngine.ts`; no raw inline shader script |
| WAF Compliance | Source code audit | SEC-01 (0 secrets), REL-01 (timeout), REL-04 (WebGL context lost), COST-01 (.destroy()) |

