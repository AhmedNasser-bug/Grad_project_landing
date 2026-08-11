# Handoff Report: Epic 0 Reusable Design System Visual Assets & Primitives

**From**: `teamwork_preview_explorer` (Milestone 0 / Epic 0)  
**To**: `parent` (`d329869e-5bfb-4b74-b6e6-998ce5bf7c4b`) / Implementer Agents  
**Working Directory**: `D:/Study/Programming/Projects/Grad_project_landing/.agents/explorer_m0_r1_3/`  
**Analysis File**: `D:/Study/Programming/Projects/Grad_project_landing/.agents/explorer_m0_r1_3/analysis.md`  
**Handoff Type**: Hard Handoff (Task Complete)  

---

## 1. Observation

Direct code examination of `D:/Study/Programming/Projects/Grad_project_landing/index.html` revealed the following exact lines and inline visual primitives:

1. **CSS Variables & Design System Tokens (`index.html:23-40`)**:
   ```css
   :root {
       --bg-canvas: #FFFFFF;
       --bg-muted: #F8FAFC;
       --bg-dark: #060D1A;
       --border-grid: #E2E8F0;
       --border-dark: #1E293B;
       --border-active: #004AC6;
       --text-primary: #0B1C30;
       --text-muted: #64748B;
       --text-light: #94A3B8;
       --accent-blue: #004AC6;
       --accent-container: #2563EB;
       --accent-teal: #006B5F;
       --accent-emerald: #10B981;
       --accent-critical: #EF4444;
       --font-sans: 'Inter', -apple-system, sans-serif;
       --font-mono: 'JetBrains Mono', monospace;
   }
   ```

2. **WebGL Fluid Dynamics Fragment Shader (`index.html:865-875`)**:
   ```glsl
   precision mediump float;
   uniform vec2 u_resolution;
   uniform float u_time;
   void main() {
       vec2 st = gl_FragCoord.xy / u_resolution.xy;
       float color = sin(st.x * 8.0 + u_time * 0.4) * 0.04 + cos(st.y * 8.0 + u_time * 0.3) * 0.04;
       vec3 col = mix(vec3(0.98, 0.98, 1.0), vec3(0.92, 0.95, 1.0), st.y + color);
       gl_FragColor = vec4(col, 1.0);
   }
   ```
   *Rendered onto canvas `#fluid-bg-canvas` via a full-bleed quad (`index.html:889`).*

3. **Three.js Fresenius 4008S CAD Wireframe Cylinder Model (`index.html:906-935`)**:
   ```js
   const geom = new THREE.CylinderGeometry(1.8, 1.8, 8, 24, 8, true);
   const wireframeGeom = new THREE.WireframeGeometry(geom);
   const mat = new THREE.LineBasicMaterial({ color: 0x2563EB, opacity: 0.7, transparent: true });
   wireframeMesh = new THREE.LineSegments(wireframeGeom, mat);
   wireframeMesh.rotation.z = Math.PI / 4;
   scene.add(wireframeMesh);
   ```

4. **GSAP ScrollTrigger Parallax Cards (`index.html:938-951` & `index.html:189-209`)**:
   *CSS*: `.screen-wide-card { min-height: 100vh; width: 100vw; position: sticky; top: 0; }`  
   *JS*: `gsap.fromTo(card.children, { opacity: 0.4, y: 40 }, { opacity: 1, y: 0, scrollTrigger: { trigger: card, start: "top 80%", end: "top 20%", scrub: 0.5 } });`

5. **UTM Persona Switcher State (`index.html:954-980`)**:
   Defines `personaData` dictionary for roles `clinician`, `nurse`, and `patient`, dynamically replacing `.giant-eyebrow`, `.giant-headline`, and `.giant-body` inner text.

6. **Monorepo Architecture Notice (`ORIGINAL_REQUEST.md:94-96`)**:
   The landing page is an Astro v5 monorepo isolated in `dashboard/` with root `package.json` proxy execution scripts. Target path for visual libraries is `dashboard/src/lib/` (mirrored at root `src/lib/`).

---

## 2. Logic Chain

1. **Step 1 (Observation -> Reusability Requirement)**: The inline JavaScript in `index.html` relies on global window scope, raw DOM ID queries (`document.getElementById`), and inline `<script>` tags. In an Astro v5 / React 19 monorepo environment (`dashboard/`), these cannot be reused directly across routes or SSR pages.
2. **Step 2 (Observation -> WAF & Lifecycle Gaps)**:
   - The WebGL fluid shader lacks `webglcontextlost` and `webglcontextrestored` listeners, risking silent blank canvas states if WebGL context is lost (violating WAF `REL-04`).
   - The Three.js CAD cylinder engine lacks `dispose()` calls and `cancelAnimationFrame` cleanup, creating memory leaks when components unmount (violating WAF `COST-01`).
3. **Step 3 (Reasoning -> Modularization Target)**:
   - Extract tokens to `dashboard/src/lib/tokens/clinicalVitalityTokens.ts` (and `src/lib/tokens/clinicalVitalityTokens.ts`).
   - Wrap WebGL fluid shader into `FluidShaderEngine` class in `dashboard/src/lib/canvas/FluidShaderEngine.ts` with context loss event listeners and `.destroy()` cleanup.
   - Wrap Three.js CAD model into `CadWireframeEngine` class in `dashboard/src/lib/canvas/CadWireframeEngine.ts` with automatic container `ResizeObserver`, geometry/material disposal, and `.destroy()` method.
   - Encapsulate GSAP ScrollTrigger card stack into `initParallaxCards()` in `dashboard/src/lib/gsap/ParallaxCardScrollTrigger.ts` returning a cleanup unbind function.
   - Build `UTMRouter` in `dashboard/src/lib/routing/UTMRouter.ts` providing URL parameter parsing (`?utm_role=`/`?utm_persona=`), `localStorage` persistence (`pharos_utm_role`), and subscriber state callbacks.

---

## 3. Caveats

* **Animation Libraries Dependency**: GSAP ScrollTrigger and Three.js are external npm dependencies. In the static prototype they were loaded via CDN scripts (`cdnjs.cloudflare.com`). In the Astro monorepo (`dashboard/package.json`), `three` and `gsap` must be properly imported as ES modules (`import * as THREE from 'three'`, `import { gsap } from 'gsap'`, `import { ScrollTrigger } from 'gsap/ScrollTrigger'`).
* **p5.js Integration**: p5.js canvas streams (referenced in R3 for telemetry streams) will require dynamic canvas binding in browser-only contexts (`client:only="react"` or `client:only="astro"`) to avoid SSR window reference errors.

---

## 4. Conclusion

The visual primitives in `index.html` provide high quality visual foundations, but require encapsulation into typed ES modules located under `dashboard/src/lib/` (and `src/lib/`).

The recommended modularization map is:
1. `dashboard/src/lib/tokens/clinicalVitalityTokens.ts` (Design tokens & Clinical Light Mode palette)
2. `dashboard/src/lib/canvas/FluidShaderEngine.ts` (WebGL fluid dynamics backdrop engine + REL-04 context loss resilience)
3. `dashboard/src/lib/canvas/CadWireframeEngine.ts` (Three.js 3D wireframe CAD cylinder engine + COST-01 memory cleanup)
4. `dashboard/src/lib/gsap/ParallaxCardScrollTrigger.ts` (100vw x 100vh sticky parallax card controller)
5. `dashboard/src/lib/gsap/TextSplitUtil.ts` (GSAP text split reveal utilities)
6. `dashboard/src/lib/gsap/HyperframesScrubber.ts` (Video scroll scrubber engine)
7. `dashboard/src/lib/routing/UTMRouter.ts` (UTM persona router with URL & localStorage sync)
8. `dashboard/src/lib/primitives/SwissCardPrimitive.tsx` (Reusable Swiss card container shell)

Full details are provided in `D:/Study/Programming/Projects/Grad_project_landing/.agents/explorer_m0_r1_3/analysis.md`.

---

## 5. Verification Method

To independently verify the analysis and modularization blueprint:

1. **Inspect Analysis Report**:
   ```powershell
   Get-Content -Path "D:\Study\Programming\Projects\Grad_project_landing\.agents\explorer_m0_r1_3\analysis.md"
   ```
2. **Verify Static Extraction against Source**:
   Compare GLSL shader source (`index.html:865-875`) and Three.js CAD cylinder initialization (`index.html:906-935`) against the class contracts in `analysis.md`.
3. **Verify Target Paths**:
   Confirm target monorepo paths exist or are planned under `dashboard/src/lib/` and `src/lib/`.
