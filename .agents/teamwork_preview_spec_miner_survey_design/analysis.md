# Design System & Stitch UI Mockup Integration Analysis

**Agent:** `teamwork_preview_spec_miner_survey_design`  
**Date:** 2026-08-05  
**Target Specs:** `specs/Epic0-Reusable-Design-System-Visual-Assets/` & `specs/Epic8-Stitch-UI-Mockup-Integration/`  
**Authoritative Reference:** Stitch Project `503366360860058565` ("Clinical Vitality" Design System) & `ORIGINAL_REQUEST.md`

---

## Executive Summary
This document compiles the specification survey for the **Integrated Hemodialysis Digitization & Clinical Decision Support Framework** (Pharos University Graduation Project AY 2026/2027 under Dr. Mohamed Abdou, Office of the Dean). It extracts all technical parameters, design system tokens, WebGL GLSL shader definitions, Three.js 3D CAD geometry specifications, GSAP ScrollTrigger animation timelines, and Stitch UI mockup enclosure requirements across **Epic 0** and **Epic 8**.

---

## 1. Authoritative Design System Specification & Stitch Integration

### 1.1 Stitch Project Identification
- **Stitch Project ID:** `503366360860058565`
- **Design System Name:** `Clinical Vitality`
- **Screen Inventory:** 16 complete clinical screens designed for point-of-care hemodialysis workflows.
- **Design Philosophy:** Swiss Medical Minimalist — ultra-high contrast, razor-thin 1px grid borders, screen-wide 100vw x 100vh cards, monospace telemetry watermarks, zero fluff, and instant clinical readability.

### 1.2 CSS Color Variable Tokens
| Variable Name | Hex Code | Purpose / Context |
|---|---|---|
| `--color-bg` / `--bg-canvas` | `#FFFFFF` | Primary Medical White Canvas Surface |
| `--bg-muted` / `--color-tint` | `#F8F9FF` | Background Tint / Soft Blue Tint for active cards & panels |
| `--bg-dark` | `#060D1A` / `#040914` | Deep Slate Charcoal for dark-mode sticky parallax cards |
| `--text-primary` / `--color-slate` | `#0B1C30` | Deep Slate Primary Typography |
| `--accent-blue` / `--border-active` | `#004AC6` | Primary Clinical Accent Blue & Active Grid Borders |
| `--accent-container` | `#2563EB` | Interactive Container / Button / Highlight Blue |
| `--accent-emerald` / `--color-emerald` | `#10B981` | Medical Success Status & Telemetry Normal Range |
| `--accent-critical` / `--color-critical` | `#EF4444` | Critical Clinical Alert Red & Outbreak Banner Accent |
| `--border-grid` | `#E2E8F0` | Razor-thin 1px Solid Light Grid Border |
| `--border-dark` | `#1E293B` | Razor-thin 1px Solid Dark Grid Border |
| `--text-muted` | `#64748B` | Secondary Body & Caption Text |
| `--text-light` | `#94A3B8` | Dark-Theme Body & Subtitle Text |

### 1.3 Typography Standards
- **Primary Body & UI Font:** `Inter` (sans-serif; weights: 300 Light, 400 Regular, 500 Medium, 600 SemiBold, 700 Bold, 800 ExtraBold, 900 Black).
- **Telemetry & Monospace Font:** `JetBrains Mono` (monospace; weights: 400 Regular, 500 Medium, 700 Bold, 800 ExtraBold).
- **Giant Headline Fluid Typography:** `clamp(2.8rem, 5vw, 5.5rem)`, line-height `1.02`, letter-spacing `-0.04em`, font-weight `900`.
- **Giant Monospace Eyebrow Tags:** `13px` monospace, letter-spacing `0.15em`, uppercase, paired with a `24px x 2px` left accent bar.
- **Monospace Watermark Index Numbers:** `clamp(120px, 20vw, 320px)` at font-weight `900`, opacity `0.03` (`rgba(11, 28, 48, 0.03)` light / `rgba(255, 255, 255, 0.03)` dark).

---

## 2. Epic 0: Reusable Design System & Visual Asset Specifications

### 2.1 Feature 0.1 — GSAP Animation Library
- **Task 0.1.1: GSAP Text Split & Reveal Effects (`Task0.1.1-GSAP-Text-Split-Effects.md`)**
  - Utility for splitting giant headlines into characters/words/lines for staggered reveal animations on scroll enter.
  - Typography morph animation when switching UTM persona roles (`clinician`, `nurse`, `patient`).
- **Task 0.1.2: GSAP ScrollTrigger Parallax Wrapper (`Task0.1.2-GSAP-ScrollTrigger-Parallax-Wrapper.md`)**
  - Standardized 100vw x 100vh screen-wide card wrapper component.
  - Sticky stacking configuration (`position: sticky; top: 0;`).
  - Timeline bindings: `trigger: card`, `start: "top 80%"`, `end: "top 20%"`, `scrub: 0.5`.
  - Child elements opacity & Y-axis translation transition (`fromTo(card.children, { opacity: 0.4, y: 40 }, { opacity: 1, y: 0 })`).

### 2.2 Feature 0.2 — WebGL & Three.js Vignette Engine
- **Task 0.2.1: Fluid Shader Canvas Module (`Task0.2.1-Fluid-Shader-Canvas-Module.md`)**
  - Full-bleed background canvas (`#fluid-bg-canvas`, `position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; z-index: 0; pointer-events: none; opacity: 0.85;`).
  - GLSL Fragment Shader rendering dialysate clearance fluid motion:
    - Uniforms: `u_resolution` (`vec2`), `u_time` (`float`).
    - Color calculation: `sin(st.x * 8.0 + u_time * 0.4) * 0.04 + cos(st.y * 8.0 + u_time * 0.3) * 0.04`.
    - Color blend: `mix(vec3(0.98, 0.98, 1.0), vec3(0.92, 0.95, 1.0), st.y + color)`.
  - Performance requirement: strictly `>= 60 FPS`.
  - Context loss & memory recovery per WAF `REL-04`: clean up GL program/buffers on unmount, implement listeners for `webglcontextlost` and `webglcontextrestored`.
- **Task 0.2.2: Three.js CAD Wireframe Cylinder Module (`Task0.2.2-ThreeJS-CAD-Wireframe-Module.md`)**
  - 3D CAD visualization of Fresenius 4008S dialyzer cylinder geometry inside `#three-cad-container`.
  - Geometry: `THREE.CylinderGeometry(1.8, 1.8, 8, 24, 8, true)`.
  - Line representation: `THREE.WireframeGeometry` wrapped in `THREE.LineSegments`.
  - Material: `THREE.LineBasicMaterial({ color: 0x2563EB, opacity: 0.7, transparent: true })`.
  - Rotation angle: Z-axis tilt `Math.PI / 4`, continuous Y-axis rotation loop (`rotation.y += 0.006`).
  - Particle flow: Particle stream animation passing through the cylinder membrane.

### 2.3 Feature 0.3 — Hyperframes Video Scrub Engine
- **Task 0.3.1: Video Canvas Scroll Scrubber (`Task0.3.1-Video-Canvas-Scroll-Scrubber.md`)**
  - HTML5 Video element bound to canvas frame rendering.
  - Scroll-driven frame scrubber synchronizing `video.currentTime` with GSAP ScrollTrigger progress.
  - Fallback mechanism: displaying Three.js CAD wireframe module when video source is unavailable or loading.

### 2.4 Feature 0.4 — Swiss Minimalist Card Primitives
- **Task 0.4.1: Screen-Wide Parallax Card Shell (`Task0.4.1-Screen-Wide-Parallax-Card-Shell.md`)**
  - Screen-wide 100vw x 100vh cards with 1px razor-thin solid grid borders (`#E2E8F0` light mode, `#1E293B` dark mode).
  - Monospace watermark numbers (`00`, `01`, `02`, ..., `08`) anchored top-right.
  - Inner layout split grids (`hero-layout-grid`: `1.2fr 1fr`, `priority-split-layout`: `1.1fr 1fr`).

---

## 3. Epic 8: Stitch UI Mockup Integration Specifications

### 3.1 Feature 8.1 — Discovery Phase Mockup Research
- **Task 8.1.1: Stitch Screen Selection Interview (`Task8.1.1-Stitch-Screen-Selection-Interview.md`)**
  - Surveying all 16 screen mockups from Stitch Project `503366360860058565`.
  - Selecting and categorizing core screens for three primary clinical user personas: Bedside Nursing, Clinical Decision Support (CDS), and Patient Vitals Telemetry.

### 3.2 Feature 8.2 — Stitch UI Enclosure Components
- **Task 8.2.1: Interactive Mockup Embed Panel (`Task8.2.1-Interactive-Mockup-Embed-Panel.md`)**
  - Responsive HTML/CSS UI mockup enclosures using Stitch Clinical Vitality design tokens.
  - Detailed requirements per clinical suite:

#### A. Bedside Nursing Suite Mockup
- **Biometric Bed Allocation Queue:** Shift validation, fingerprint scanner authorization, bed vacancy grid management.
- **Machine Countdown Timer:** 4-hour dialysis session countdown timer with visual completion progress.
- **1-Tap Incident Logging:** Quick bedside logging for access alerts, blood line kinks, or patient discomfort.
- **Automated Medication Timing Reminders:** Scheduled alerts for heparin bolus and saline flushes.

#### B. Clinical Decision Support (CDS) & MedGemma Suite Mockup
- **MedGemma CPOE Interceptor:**
  - Real-time order interception modal.
  - eGFR cross-referencing (e.g. eGFR `14 mL/min/1.73m²`).
  - Automatic blocking of unadjusted enoxaparin orders when CrCl `< 10 mL/min` with explicit guideline warnings.
- **IDH Early Warning Machine Learning Matrix Scorecard:**
  - Model benchmarking scorecard:
    - **RNN Model:** `0.94 AUROC` (15–75 min advance warning).
    - **XGBoost Model:** `0.936 AUROC`.
    - **CatBoost Model:** `0.845 - 0.880 ROC-AUC`.
    - **Bi-LSTM Model:** `74.81% sensitivity`.

#### C. Patient Vitals Logging & Telemetry Suite Mockup
- **Continuous IoT Telemetry Stream:** Real-time stream of blood pressure, ultrafiltration rate, dialysate conductivity (`14.1 mS/cm`), and pH.
- **p5.js Telemetry Canvas:** Live generative ECG waveforms and BP trend lines (`VitalStreamP5.tsx`).
- **Clinical Outbreak Alert Badges & Simulators:**
  - *Hard Water Syndrome:* Resin breakthrough, calcium jump (`2.43 -> 3.92 mmol/L`), mid-dialysis BP spike (`156/87 -> 158/80 mmHg`).
  - *Chloramine Oxidant Hemolysis:* Guro Hospital Seoul outbreak parameters (`>0.6 mg/L chloramine`, Heinz body positive anemia, transfusion requirement spike `1.2 -> 3.9 units`).
  - *Cobe Blood Line Recall:* Computer vision detection of pink serum and narrowed blood line aperture shear stress.
- **Patient Transparency Portal:** Direct session vital visibility for patient dignity and independent verification.

---

## Features Discovered

| # | Category | Feature | Description | Inputs | Outputs | Error Behavior | Discovered Via |
|---|----------|---------|-------------|--------|---------|----------------|----------------|
| 1 | Design System | Stitch Clinical Vitality Tokens | Color palette (`#FFFFFF`, `#F8F9FF`, `#004AC6`, `#0B1C30`, `#10B981`, `#EF4444`), typography (`Inter`, `JetBrains Mono`), 1px grid borders | CSS variables / Tailwind tokens | Rendered UI matching Stitch project `503366360860058565` | Fallback to default browser fonts/colors | `ORIGINAL_REQUEST.md`, `specs/Epic0`, `specs/Epic8` |
| 2 | Visual / GSAP | GSAP Text Split & Morph | Headlines split into chars/words with staggered reveal & persona morphing | String text, scroll triggers | Animated typography reveals | Render static text if GSAP fails | `Task0.1.1-GSAP-Text-Split-Effects.md` |
| 3 | Visual / GSAP | Sticky Parallax Card Shell | 100vw x 100vh cards stacked with GSAP ScrollTrigger timeline bindings | Scroll position, card elements | Pinning, opacity & Y-translation | Fall to standard block scroll | `Task0.1.2-GSAP-ScrollTrigger-Parallax-Wrapper.md` |
| 4 | Visual / WebGL | WebGL Dialysate Fluid Shader | Full-bleed background WebGL canvas simulating dialysate fluid motion | `u_resolution`, `u_time` uniforms | Fluid animated background at >= 60 FPS | Context loss handler (REL-04) / fallback gradient | `Task0.2.1-Fluid-Shader-Canvas-Module.md` |
| 5 | Visual / 3D CAD | Three.js Wireframe Dialyzer | 3D CAD cylinder model with particle flow & Y-axis rotation | Container dims, time tick | Rotating wireframe cylinder scene | Render fallback CAD metadata panel | `Task0.2.2-ThreeJS-CAD-Wireframe-Module.md` |
| 6 | Visual / Video | Hyperframes Video Scrubber | HTML5 video frame rendering synchronized with scroll position | Scroll position, video source | Canvas scrubbed video frames | Fallback to Three.js CAD wireframe | `Task0.3.1-Video-Canvas-Scroll-Scrubber.md` |
| 7 | Card Primitives | Swiss Minimalist Card Shell | 100vw x 100vh card layout with 1px razor border & watermark index | Card content, index number | Styled sticky card viewport | Standard div container fallback | `Task0.4.1-Screen-Wide-Parallax-Card-Shell.md` |
| 8 | Mockup / Research | Stitch Screen Discovery | Survey of 16 clinical screens from Stitch Project `503366360860058565` | Stitch project screens | Screen taxonomy for 3 personas | Re-prompt discovery interview | `Task8.1.1-Stitch-Screen-Selection-Interview.md` |
| 9 | Mockup / Nursing | Bedside Nursing Enclosure | Biometric queue, 4-hr countdown timer, 1-tap incident log | Nurse touch/biometric input | Shift queue & medication alerts | Display authentication error modal | `Task8.2.1-Interactive-Mockup-Embed-Panel.md` |
| 10 | Mockup / CDS | MedGemma CPOE Interceptor | Intercepts CPOE orders, checks eGFR, blocks unadjusted enoxaparin | Physician order, eGFR value | Warning alert modal, order block | Block order by default if eGFR missing | `Task8.2.1-Interactive-Mockup-Embed-Panel.md` & `ORIGINAL_REQUEST.md` |
| 11 | Mockup / CDS | IDH ML Predictor Scorecard | Comparative scorecard for IDH prediction (RNN AUROC 0.94, etc.) | Patient telemetry stream | IDH early warning risk score | Highlight missing sensor telemetry | `Task8.2.1-Interactive-Mockup-Embed-Panel.md` & `ORIGINAL_REQUEST.md` |
| 12 | Mockup / Telemetry | Patient Vitals Telemetry | Real-time IoT sensor stream & p5.js ECG/BP telemetry visualization | Bedside sensor data | Live telemetry stream & graphs | Show disconnected sensor warning | `Task8.2.1-Interactive-Mockup-Embed-Panel.md` & `ORIGINAL_REQUEST.md` |
| 13 | Mockup / Outbreak | Clinical Outbreak Simulator | Interactive simulators for Hard Water, Chloramine, & Cobe recall | Outbreak slider parameters | Updated lab values & alert badges | Trigger red alert banner | `ORIGINAL_REQUEST.md` |
| 14 | Navigation / Routing | Sticky Persona Switcher | URL query parameter parser (?utm_persona=patient\|nurse\|clinician) | URL query string or tab click | Updated hero tagline & card view | Default to 'clinician' persona | `ORIGINAL_REQUEST.md` & `index.html` |

---

## Edge Cases

| # | Feature | Input | Observed Behavior |
|---|---------|-------|-------------------|
| 1 | WebGL Fluid Shader | Low-performance GPU or WebGL context loss | `webglcontextlost` event fires; shader pauses cleanly and attempts recovery on `webglcontextrestored`, avoiding memory leaks or crashes (REL-04). |
| 2 | Three.js CAD Model | Rapid window resizing | Canvas dimensions out of sync with container; fixed by adding `resize` event listener updating `camera.aspect = width / height` and `renderer.setSize(width, height)`. |
| 3 | GSAP Parallax Stacking | Fast vertical scrolling on mobile touchscreens | Pinning glitch or card flickering; mitigated by configuring `scrub: 0.5` smoothing and responsive CSS breakpoints (`@media (max-width: 1024px)`). |
| 4 | Sticky Persona Switcher | Invalid query parameter (e.g. `?utm_persona=unknown`) | Parser falls back safely to default `clinician` persona without crashing or blanking the hero section. |
| 5 | MedGemma CPOE Interceptor | Enoxaparin order with eGFR exactly at 10 mL/min threshold | Boundary condition evaluated strictly as `CrCl < 10 mL/min` block condition; displays guideline alert modal for unadjusted dosage. |
| 6 | Hyperframes Video Scrubber | Video asset file missing or slow network load | HTML5 video element fires error/stalled event; wrapper component seamlessly displays the fallback Three.js CAD wireframe model. |
| 7 | Outbreak Simulators | Extreme slider inputs (e.g. Chloramine > 1.2 mg/L) | Parameter values cap gracefully at physiological maximums while maintaining red alert badge state and displaying transfusion requirements. |
| 8 | Retina High-DPI Display | Device pixel ratio > 2.0 | Canvas elements appear blurry unless `renderer.setPixelRatio(window.devicePixelRatio)` and matching GL viewport sizing are applied. |

---

## Summary Conclusion
The survey of **Epic 0** and **Epic 8** specs, alongside `ORIGINAL_REQUEST.md` and existing prototypes (`index.html`, `blog.html`), demonstrates a complete, cohesive design specification. The **Clinical Vitality** design system (`503366360860058565`) provides exact color tokens, typography scales, card primitive shells, WebGL fluid shaders, Three.js CAD wireframes, GSAP scrolltelling timelines, and 3 clinical UI mockup suites (Bedside Nursing, MedGemma CDS, and Patient Vitals Telemetry).
