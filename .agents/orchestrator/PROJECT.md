# Project: Pharos University Hemodialysis Digitization Graduation Project (AY 2026/2027)

## Architecture
- Monorepo structure with root script proxies (`package.json`) delegating execution to `dashboard/` (Astro 7.1.6, React 19, TypeScript, Tailwind CSS v4, Three.js, GSAP, p5.js, MDX).
- Data Flow: URL UTM Parameter Extraction -> UTMRouter State -> Dynamic UI Persona Presentation (Patient, Nurse, Clinician) -> Interactive Outbreak/Bed Queue/CPOE Simulators -> Telemetry & Verification.
- Design System: Clinical Light Mode (`#FFFFFF` canvas, `#F8F9FF` background tint, `#004AC6` primary blue, `#0B1C30` slate typography, `#10B981` success, `#EF4444` critical alert) derived from Stitch Project `503366360860058565` ("Clinical Vitality").

## Feature Inventory
| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| 1 | Task0.1.1 & Task0.1.2 GSAP Animation Library | Text split reveal utilities & 100vw x 100vh sticky parallax card ScrollTrigger wrappers | M0 | specs/Epic0 |
| 2 | Task0.2.1 & Task0.2.2 WebGL & Three.js Engines | Full-bleed dialysate fluid GLSL shader & CAD wireframe cylinder model with context loss recovery | M0 | specs/Epic0 |
| 3 | Task0.3.1 & Task0.4.1 Hyperframes & Swiss Primitives | Video scroll scrubber engine & Swiss Minimalist card UI primitives | M0 | specs/Epic0 |
| 4 | Task1.1.1 - 1.3.1 Root Package & Astro Workspace | Root package.json proxy scripts, Astro 7 monorepo configuration, Swiss grid tokens | M1 | specs/Epic1 |
| 5 | Task2.1.1 - 2.3.1 UTM Router & Persona Switcher | Dynamic URL role parameter parser (?utm_role= / ?utm_persona=), localStorage sync, GSAP Morph pill toggle | M2 | specs/Epic2 |
| 6 | Task3.1.1 & 3.2.1 Hero Parallax Card (Card 00) | 100vw x 100vh Hero card, WebGL fluid shader backdrop, clamp typography | M3 | specs/Epic3 |
| 7 | Task4.1.1 & 4.2.1 Outbreak Storyboard Cards (Cards 01-05) | Hard Water, Chloramine, Cobe Recall outbreak simulators with interactive sliders & storyboards | M4 | specs/Epic4 |
| 8 | Task5.1.1 - 5.3.1 Research Blog Engine & Timeline Card | Dynamic MDX reader (/blog/[slug]), blog.html, visual milestone ledger card (Card 06) | M5 | specs/Epic5 |
| 9 | Task6.1.1 & 6.2.1 Academic Trust Card (Card 07) | Dr. Mohamed Abdou Pharos University Dean team grid card & academic credentials | M6 | specs/Epic6 |
| 10 | Task7.1.1 & 7.2.1 Grant Checkout Modal Card (Card 08) | Stripe grant checkout modal card, sponsorship tiers, WAF SEC-01 zero secrets check | M7 | specs/Epic7 |
| 11 | Task8.1.1 & 8.2.1 Stitch UI Mockup Integration | 16 Stitch screen mockup enclosures (Bedside Nursing, MedGemma CPOE, Patient Vitals) | M8 | specs/Epic8 |

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| M0 | Epic 0: Reusable Visual Assets & Primitives | GSAP, WebGL fluid shader, Three.js CAD, Hyperframes, Swiss card primitives | none | DONE |
| M1 | Epic 1: Core Architecture & Root Workspace | Root package.json proxy scripts, Astro 7 setup, layout & CSS grid tokens | M0 | DONE |
| M2 | Epic 2: Dynamic UTM Router & Persona Switcher | UTMRouter, query param extractor, localStorage sync, persona navbar | M1 | PLANNED |
| M3 | Epic 3: Hero Parallax Card (Card 00) | Hero card layout, WebGL background integration, responsive clamp typography | M0, M2 | PLANNED |
| M4 | Epic 4: Cinematic Outbreak Storyboard Cards | Hard Water, Chloramine, Cobe Recall interactive simulators & cards | M0, M3 | PLANNED |
| M5 | Epic 5: Research Blog Engine & Timeline Card | blog.html, /blog/[slug] MDX engine, milestone ledger card (Card 06) | M1 | PLANNED |
| M6 | Epic 6: Academic Trust & Team Showcase | Pharos Dean team grid, advisor showcase, academic credentials (Card 07) | M1 | PLANNED |
| M7 | Epic 7: Grant Checkout Modal Card | Stripe grant checkout modal (Card 08), zero secrets compliance | M1 | PLANNED |
| M8 | Epic 8: Stitch UI Mockup Integration | Stitch project 503366360860058565 screen enclosures | M0, M1 | PLANNED |

## Interface Contracts
### UTMRouter ↔ Persona Presentation
- Export `UTMRouter` module in `src/lib/routing/UTMRouter.ts`
- Roles: `'patient' | 'nurse' | 'clinician'`
- Persistence: `localStorage.getItem('pharos_utm_role')`
- URL sync: `?utm_role=patient|nurse|clinician` & `?utm_persona=`

### WebGL Fluid Shader & Three.js CAD ↔ Card Backdrop
- WebGL shader canvas handle with `webglcontextlost` and `webglcontextrestored` event listeners (WAF `REL-04`).
- Target FPS: `>= 60 FPS`.

### MedGemma CPOE Interceptor ↔ Order Check
- Intercept physician orders, cross-reference eGFR, block unadjusted enoxaparin for CrCl < 10 mL/min with guideline modal warning.

## Code Layout
- `package.json` (root): Root execution proxy delegating `npm run dev`, `npm run build`, `npm run preview` to `dashboard/` (`--prefix dashboard/` or nested script execution).
- `dashboard/`: Dedicated Astro v5 monorepo subdirectory
  - `dashboard/package.json`: Dependencies (`astro`, `react`, `three`, `gsap`, `p5`, `tailwindcss`, `@astrojs/mdx`, etc.)
  - `dashboard/astro.config.mjs`: Astro v5 configuration with React & Tailwind integration
  - `dashboard/src/pages/`: Astro pages (`index.astro`, `blog/index.astro`, `blog/[slug].astro`)
  - `dashboard/src/layouts/`: Astro layouts (`Layout.astro`, `BlogLayout.astro`)
  - `dashboard/src/components/`: Astro & React UI components
    - `dashboard/src/components/canvas/`: WebGL fluid shader & Three.js CAD wireframe
    - `dashboard/src/components/gsap/`: Text split & ScrollTrigger parallax card wrappers
    - `dashboard/src/components/routing/`: UTMRouter & persona toggle navbar
    - `dashboard/src/components/simulators/`: Outbreak simulators, MedGemma CPOE, Bed Queue, IDH ML matrix
    - `dashboard/src/components/stitch/`: Stitch UI mockup enclosures
  - `dashboard/src/lib/`: Core utilities and engine modules (`UTMRouter.ts`, fluid shaders, Three.js scenes)
