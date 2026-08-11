# Original User Request

## 2026-08-04T00:48:56Z

<USER_REQUEST>
Build a visual-first proposal presentation web portal for the Integrated Hemodialysis Digitization & Clinical Decision Support Framework (Pharos University Graduation Project Proposal).

Working directory: d:/Study/Programming/Projects/Grad_project_landing
Integrity mode: development

## Requirements

### R1. Next.js 15 Web Portal Foundation & Clinical Light Mode Design System
Build a responsive Next.js 15 App Router web application with React 19, TypeScript, and Tailwind CSS v4. Enforce the Clinical Light Mode theme (#FFFFFF medical white surface, #F8F9FF background tint, #004AC6 primary blue, #0B1C30 deep slate typography, #10B981 success medical, #EF4444 critical alert) derived from Stitch Project projects/503366360860058565 (Clinical Vitality design system).

### R2. Dynamic UTM Persona Routing Matrix (UTMRouter)
Implement client-side & server-side UTM parameter routing (?utm_persona=patient|nurse|clinician). The portal must automatically detect the persona from URL parameters, persist the choice in localStorage, and update the UI layout without page reloads while providing a persistent sticky header bar for manual persona switching.

### R3. WebGL 3D Canvas & p5.js Interactive Visual Engine
Integrate interactive Three.js 3D dialysate filtration particle exchange canvas (DialysisMembrane3D.tsx) and p5.js generative ECG/BP telemetry streams (VitalStreamP5.tsx). Include real-life clinical outbreak interactive simulators for:
- Hard Water Syndrome: Resin breakthrough, calcium jump (2.43 -> 3.92 mmol/L), mid-dialysis BP spike (156/87 -> 158/80).
- Chloramine Oxidant Hemolysis: Guro Hospital Seoul outbreak (>0.6 mg/L chloramine, Heinz body positive anemia, transfusion spike 1.2 -> 3.9 units).
- Cobe Blood Line Recall: Computer vision detection of pink serum and narrowed blood line aperture shear stress.

### R4. MedGemma CPOE Clinical Security Gate & Biometric Bed Queue Engine
Implement interactive simulation components for:
- MedGemma CPOE Interceptor: Intercepting physician orders, cross-referencing eGFR, and blocking unadjusted enoxaparin (CrCl < 10 mL/min) with guideline warnings.
- Biometric Bed Allocation Queue: Shift validation, 4-hour machine countdown timer, bed vacancy management, and audio chime synthesis.
- Intradialytic Hypotension (IDH) ML Matrix: Comparative scorecard showcasing RNN (0.94 AUROC), XGBoost (0.936 AUROC), CatBoost (0.845-0.880 ROC-AUC), and Bi-LSTM (74.81% sensitivity).

### R5. Spec Tree Directives Execution (spec_tree/ Epics 1-7)
Execute tasks according to the physical directives in spec_tree/ (Epics 1-7). Verify all components using Playwright E2E visual regression and functional tests.

## Acceptance Criteria

### Web Application & UI Quality
- [ ] Clean build via npm run build or Vite without TypeScript or linter errors.
- [ ] Clinical Light Mode CSS variables and Tailwind classes match Stitch project projects/503366360860058565.
- [ ] UTMRouter correctly toggles Patient, Nurse, and Clinician views upon URL query parameter changes or header tab clicks.

### Interactive Canvas & Simulation
- [ ] Three.js 3D membrane filtration canvas renders glowing particle stream at >= 50 FPS.
- [ ] MedGemma CPOE interceptor correctly blocks unadjusted enoxaparin orders when CrCl < 10 mL/min and displays guideline alert modal.
- [ ] Hard Water and Chloramine outbreak sliders correctly update physiological parameters and alert badges.

### E2E Test Verification
- [ ] Playwright E2E tests pass across Chrome, Firefox, and Safari viewports.
</USER_REQUEST>

## 2026-08-05T19:19:17Z

<USER_REQUEST>
Build a high-trust, production-ready digital landing page and research hub for the Pharos University Hemodialysis Digitization Graduation Project (AY 2026/2027), under project advisor Dr. Mohamed Abdou (Office of the Dean).

Working directory: D:/Study/Programming/Projects/Grad_project_landing
Integrity mode: development

## Requirements

### R1. Screen-Wide Parallax Scrolltelling Landing Page (index.html)
Build a high-trust, responsive visual landing page featuring 100vw x 100vh full-viewport sticky parallax cards with giant typography (clamp(2.8rem, 5vw, 5.5rem)), WebGL dialysate clearance fluid shader backdrop, Three.js CAD wireframe cylinder model, sticky persona router (?utm_role=patient|nurse|clinician), MedGemma AI prescription check alerts, and Stripe grant checkout modal.

### R2. Dedicated Research Blog Engine (blog.html & /blog/[slug])
Build a clean, high-readability MDX reading experience for field survey articles (London & Seoul outbreak audit writeups), strictly isolated from main page scrolltelling.

### R3. EPIC 0 Foundation & Reusable Visual Component Library
Create reusable GSAP text split/morph utilities, WebGL shader modules, Three.js wireframe CAD components, and screen-wide parallax card shells under specs/Epic0-Reusable-Design-System-Visual-Assets/.

### R4. Mandatory Discovery Phase Grounding per Epic
Every Epic MUST execute internet grounding research (search_web/view_file) and interactive user interviews (ask_question) to finalize visual design before implementation code is written.

### R5. Stitch UI Mockup Integration (specs/Epic8-Stitch-UI-Mockup-Integration/)
Embed high-fidelity UI mockup enclosures from Stitch project 503366360860058565 (Clinical Vitality design system) for bedside nursing, clinical decision support, and patient vitals logging.

## Acceptance Criteria

### Visual & Interactive Parallax Engine
- [ ] Main page sections render as 100vw x 100vh screen-wide sticky parallax cards.
- [ ] Full-bleed WebGL fluid shader runs smoothly at strictly >= 60 FPS.
- [ ] Sticky persona switcher updates hero taglines and headlines seamlessly.

### Dedicated MDX Blog
- [ ] /blog sub-route loads clean MDX article layout with zero layout shifts.

### WAF Audit & Reliability Compliance
- [ ] Zero hardcoded credentials (SEC-01), 5000ms HTTP timeouts (REL-01), graceful WebGL context loss recovery (REL-04).

### Verification Protocol
1. Run static build verification via npm run build or local file verification.
2. Audit WAF security and performance scores.
</USER_REQUEST>

## 2026-08-05T16:21:13Z

CRITICAL UPDATE: The landing page architecture is an Astro v5 monorepo isolated in the `dashboard/` subdirectory (with root package.json proxy execution scripts), NOT a raw single-file HTML page. All pages, layouts, and components must be implemented as Astro v5 components inside `dashboard/src/` (e.g. `dashboard/src/pages/index.astro`, `dashboard/src/pages/blog/index.astro`, `dashboard/src/layouts/Layout.astro`).

## 2026-08-11T04:53:10Z

Please resume execution on the 9-Epic task specifications under specs/. Remember that all implementations are for the Astro v5 monorepo located in dashboard/ (e.g. dashboard/src/pages/index.astro, dashboard/src/layouts/Layout.astro, dashboard/src/pages/blog/index.astro). Proceed with task execution.



