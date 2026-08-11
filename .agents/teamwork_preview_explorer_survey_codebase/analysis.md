# Codebase Survey & Gap Analysis Report

**Project**: Pharos University Integrated Hemodialysis Digitization & Clinical Decision Support Framework Landing Page & Research Hub  
**Location**: `D:/Study/Programming/Projects/Grad_project_landing`  
**Explorer Agent**: `teamwork_preview_explorer_survey_codebase`  
**Date**: 2026-08-05  

---

## 1. Executive Summary

A comprehensive survey of `D:/Study/Programming/Projects/Grad_project_landing` was conducted to assess existing code assets, project structure, framework configuration, build tools, and fulfillment of user requirements R1-R5 and physical directives in `specs/` (Epics 0-8).

**Core Finding**: The codebase currently consists of:
1. Two high-fidelity static HTML mockups (`index.html` and `blog.html`) utilizing CDN scripts for Three.js, p5.js, GSAP, and FontAwesome.
2. A partial Astro setup in `dashboard/` containing a bare starter template (`index.astro`).
3. An empty `src/` directory tree (subdirectories `app/` and `components/` exist but contain zero files).
4. A complete physical specification tree in `specs/` (Epics 0 through 8) containing 25 task specification markdown files.
5. System architecture diagrams in `docs/architecture/DEPENDENCY_GRAPH.md` and SDLC governance documentation in `docs/project_management/PROJECT_MANAGEMENT_FRAMEWORK.md`.
6. Missing root `package.json` manifest, missing Next.js 15 / React 19 App Router setup, missing interactive simulation components, and missing E2E Playwright test suite.

---

## 2. Codebase Inventory & Directory Structure

```
D:/Study/Programming/Projects/Grad_project_landing/
├── index.html                      # 45.7 KB static HTML (987 lines) - 9 full-screen parallax cards, WebGL background, Three.js CAD wireframe, inline CSS/JS
├── blog.html                       # 7.6 KB static HTML (184 lines) - Field survey report (London & Seoul outbreak writeup)
├── dashboard/                      # Astro project subdirectory
│   ├── package.json                # Astro 7.1.6 configuration (node >=22.12.0)
│   ├── astro.config.mjs            # Default Astro config
│   ├── tsconfig.json               # TypeScript config extending astro/tsconfigs/strict
│   ├── src/pages/index.astro       # Starter page (<h1>Astro</h1>)
│   └── public/                     # Favicon assets
├── docs/                           # Architecture & PM documentation
│   ├── architecture/
│   │   └── DEPENDENCY_GRAPH.md     # 9-Epic system topology & Mermaid dependency graph
│   └── project_management/
│       └── PROJECT_MANAGEMENT_FRAMEWORK.md  # 7-document SDLC governance suite
├── specs/                          # 9 Epics / 25 Task Markdown files
│   ├── Epic0-Reusable-Design-System-Visual-Assets/ (6 tasks)
│   ├── Epic1-Core-Architecture-Swiss-Minimalist/ (3 tasks)
│   ├── Epic2-Audience-Variants-UTM-Router/ (3 tasks)
│   ├── Epic3-Visual-Core-WebGL-Fluid-GSAP/ (2 tasks)
│   ├── Epic4-Cinematic-Hyperframes-Incident-Storyboards/ (2 tasks)
│   ├── Epic5-Dedicated-MDX-Blog-Visual-Timeline/ (3 tasks)
│   ├── Epic6-Academic-Trust-Team-Showcase/ (2 tasks)
│   ├── Epic7-Partnership-Sponsorship-Payment-Gate/ (2 tasks)
│   └── Epic8-Stitch-UI-Mockup-Integration/ (2 tasks)
└── src/                            # Empty directory structure
    ├── app/                        # Empty
    └── components/                 # Empty subfolders (blog, canvas, contact, hero, routing, sections, simulators, sponsors, team, trust)
```

---

## 3. Detailed Assessment vs Requirements (R1-R5)

| Requirement | Description | Status | Evidence / Analysis |
| :--- | :--- | :--- | :--- |
| **R1. Next.js 15 / Astro Web Portal & Design System** | App Router web application with Clinical Light Mode theme (`#FFFFFF`, `#F8FAFC`, `#004AC6`, `#0B1C30`, `#10B981`, `#EF4444`). | **Partial (HTML Mockup Only)** | `index.html` defines Clinical Light Mode CSS variables and 9 parallax cards. However, `src/app/` is empty, root `package.json` is missing, and no Next.js 15 or production Astro component architecture is implemented. |
| **R2. Dynamic UTM Persona Router (`UTMRouter`)** | Client & server-side UTM parameter router (`?utm_persona=patient\|nurse\|clinician`), `localStorage` persistence, sticky header bar switching without reload. | **Static Mockup Only** | `index.html` has inline JS button clicks (`setPersona()`) modifying static text. Does not parse URL query parameters, persist state, or provide dynamic component swapping across Next.js/Astro routes. |
| **R3. WebGL 3D Canvas & p5.js Visual Engine & Outbreak Simulators** | Three.js particle clearance canvas (`DialysisMembrane3D.tsx`), p5.js ECG stream (`VitalStreamP5.tsx`), and simulators for Hard Water, Chloramine Hemolysis, and Cobe Blood Line Recall. | **Basic Canvas Mockup Only** | `index.html` features a simple 2D GLSL background shader and a basic Three.js wireframe cylinder. Interactive components (`DialysisMembrane3D.tsx`, `VitalStreamP5.tsx`) and all 3 outbreak simulators are completely missing. |
| **R4. MedGemma CPOE Gate & Bed Queue Engine & IDH ML Matrix** | MedGemma CPOE interceptor (blocking unadjusted enoxaparin when CrCl < 10 mL/min), Biometric Bed Allocation Queue (4-hr timer, audio chime), IDH ML Scorecard (RNN 0.94 AUROC, XGBoost, CatBoost, Bi-LSTM). | **Static Text Display Only** | `index.html` Card 04 displays static text for MedGemma alerts and IDH metrics. Interactive logic, form interceptors, countdown timers, Web Audio API chime synthesis, and dynamic metric scorecards are missing. |
| **R5. Dedicated MDX Blog Engine & Milestone Ledger** | Dedicated reading experience for field survey articles (`blog.html` / `/blog/[slug]`), strictly isolated from main page scrolltelling, visual milestone ledger. | **Static HTML Page Only** | `blog.html` exists as a static HTML page writeup. Dynamic MDX subpage engine (`/blog/[slug]`), MDX renderer, and automated milestone timeline integration are missing. |

---

## 4. Assessment of Epics 0 through 8 (`specs/`)

| Epic | Scope & Directives | Current Implementation Status | Missing Elements |
| :--- | :--- | :--- | :--- |
| **Epic 0** | Reusable Design System & Visual Assets (GSAP animation library, WebGL shader vignette, Three.js CAD model, Hyperframes video scrubber, Parallax card shell). | Specifications written (6 tasks). `index.html` contains raw prototype code. | Modular TSX/JS modules in `src/lib/` or `specs/Epic0-...` reusable asset directory. |
| **Epic 1** | Core Architecture & Swiss Minimalist (Discovery research, Astro monorepo setup, Stitch design tokens). | Specifications written (3 tasks). `dashboard/` created with bare Astro setup. | Root proxy execution scripts, full Astro monorepo wiring, and CSS design token integration. |
| **Epic 2** | Audience Variants & UTM Router (Discovery research, URL role extractor, GSAP morph pill toggle). | Specifications written (3 tasks). `index.html` has basic pill HTML/CSS. | `UTMRouter` component, URL query param parsing (`?utm_role=`), state persistence. |
| **Epic 3** | Visual Core WebGL Fluid & Hero Card (Discovery research, Full viewport hero setup). | Specifications written (2 tasks). `index.html` Card 00 exists. | Production WebGL dialysate clearance fluid shader at $\ge 60$ FPS, modular hero component. |
| **Epic 4** | Cinematic Hyperframes Incident Storyboards (Discovery research, Outbreak scrub cards). | Specifications written (2 tasks). `index.html` Card 05 exists. | Hyperframes scroll-driven video scrubber and interactive London/Seoul outbreak scrub cards. |
| **Epic 5** | Dedicated MDX Blog & Visual Timeline (Discovery research, Clean MDX post reader, Visual milestone ledger). | Specifications written (3 tasks). `blog.html` exists. | Dynamic MDX routing engine, MDX layout isolation, interactive milestone ledger card. |
| **Epic 6** | Academic Trust & Team Showcase (Discovery research, Pharos University Dean & Team grid card). | Specifications written (2 tasks). `index.html` Card 07 exists. | Dynamic team showcase component with CGPA badges and academic accreditation metadata. |
| **Epic 7** | Partnership & Sponsorship Payment Gate (Discovery research, Stripe grant checkout modal card). | Specifications written (2 tasks). `index.html` Card 08 & grant modal exist. | Stripe payment gate integration, interactive tier selection, form validation logic. |
| **Epic 8** | Stitch UI Mockup Integration (Discovery research, Interactive mockup embed panel for Stitch project 503366360860058565). | Specifications written (2 tasks). | Enclosure components embedding 16 high-fidelity Stitch clinical screens (bedside nursing, CDS, vitals). |

---

## 5. Build Setup, Dependencies & Verification Mechanisms

### 5.1 Package Dependencies
- **Current Root State**: Root `package.json` is missing. `node_modules` exists with legacy/installed packages, but no declared dependency manifest exists for the workspace root.
- **Subdirectory State**: `dashboard/package.json` declares `"astro": "^7.1.6"` under `"engines": { "node": ">=22.12.0" }`.

### 5.2 Build & Execution Scripts
- `npm run build` at root currently fails due to missing root `package.json`.
- `npm run dev --prefix dashboard` runs the Astro dev server for `dashboard/`.
- Root proxy scripts (`npm run dev`, `npm run build`, `npm run preview` delegating to `dashboard/` or main app) must be established as per Task 1.2.1.

### 5.3 Verification Mechanisms
- **Static File Inspection**: Local HTML rendering of `index.html` and `blog.html`.
- **Astro Build Check**: `npm run build --prefix dashboard` (builds starter Astro template).
- **Testing**: Playwright test framework (`@playwright/test`) is currently uninstalled and unconfigured. E2E test files do not exist.

---

## 6. Actionable Recommendations for Implementation Phase

1. **Establish Root `package.json` & Proxy Execution**:
   - Create root `package.json` with scripts delegating execution commands to subdirectories or managing monorepo dependencies.
   - Install required dependencies: `astro`, `react`, `react-dom`, `@astrojs/react`, `tailwindcss`, `gsap`, `three`, `@types/three`, `p5`, `lucide-react`, and `@playwright/test`.

2. **Implement EPIC 0 Reusable Assets**:
   - Build modular reusable components for GSAP ScrollTrigger parallax shells, WebGL fluid shaders, Three.js CAD wireframe cylinders, and video scrubbing engines.

3. **Fulfill Interactive Components & Outbreak Simulators**:
   - Implement `UTMRouter` with URL query param extraction and `localStorage` persistence.
   - Build interactive simulators for Hard Water Syndrome, Chloramine Hemolysis, and Cobe Blood Line Recall.
   - Build `MedGemma` CPOE Interceptor, Biometric Bed Queue with Web Audio API, and IDH ML Matrix scorecard.

4. **Integrate Stitch Project UI Mockups (Epic 8)**:
   - Create enclosure components for high-fidelity clinical screens from Stitch project `503366360860058565`.

5. **Establish Playwright E2E Suite**:
   - Configure Playwright E2E visual regression and functional tests across Chromium, Firefox, and WebKit viewports.
