# Project Management Documentation & Framework Guide
*Extracted & Adapted from ProjectManager.com Standards for the Pharos University Graduation Project*

## Project Title
**Integrated Hemodialysis Digitization & Clinical Decision Support Framework (Web Portal)**

---

## 1. Project Management Document Suite Overview

Based on ProjectManager.com's standard software and engineering project management methodology, software projects require 7 core governance documents across the Software Development Life Cycle (SDLC):

| # | Document Name | Purpose & Primary Function | Project Tailoring for Hemodialysis Portal |
|---|---|---|---|
| **1** | **Project Charter** | Authorizes project, sets vision & scope | Establishes Pharos University Grad Project scope, clinical trust goals, and tech stack boundaries |
| **2** | **Software Development Plan (SDP)** | Outlines engineering execution & sprint plan | Defines Next.js 15, Three.js WebGL, p5.js, Tailwind v4, and component lifecycle |
| **3** | **Work Breakdown Structure (WBS)** | Hierarchical decomposition of work | Decomposes project into 7 Epics (`UTMRouter`, Canvas, Outbreak Simulators, CPOE Gate, ML Matrix, Blog, Payment Gate) |
| **4** | **Risk Management Plan & Matrix** | Identifies, categorizes & mitigates risks | Evaluates WebGL frame drops, clinical alert edge cases, and WAF security compliance |
| **5** | **RACI / Stakeholder Matrix** | Defines roles and responsibilities | Maps Clinician, Nurse, Patient, Student Lead, and Academic Evaluator roles |
| **6** | **Quality Assurance & Test Plan** | Establishes QA standards and E2E gates | Playwright E2E visual testing, WAF 5-Pillar audit checklist |
| **7** | **Release & Deployment Checklist** | Verifies production readiness | Vercel / Next.js production build checks, env schema validation |

---

## 2. Document 1: Project Charter

### 2.1 Executive Summary & Purpose
The objective of this project is to build a visual-first proposal web portal demonstrating an advanced **Integrated Hemodialysis Digitization & Clinical Decision Support Framework**. The platform communicates technical and clinical authority to medical professionals, academic reviewers, and investors.

### 2.2 Key Stakeholders & Persona Alignment
* **Clinician / Physician**: Focuses on CPOE order safety (enoxaparin CrCl dosing gate) and IDH machine learning model performance (AUROC metrics).
* **Hemodialysis Nurse**: Focuses on real-time biometric bed allocation queues and machine turnaround timers.
* **Patient**: Focuses on accessible education regarding dialysis membrane filtration and outbreak safety (Hard Water & Chloramine prevention).
* **Academic Evaluator**: Reviews academic credentials, system architecture, and clinical simulation fidelity.

### 2.3 Tech Stack & Constraints
* **Frontend Core**: Next.js 15 (App Router), React 19, TypeScript.
* **Styling**: Tailwind CSS v4, Clinical Light Mode theme (`Clinical Vitality` design system).
* **Graphics & Telemetry**: Three.js WebGL particle stream, p5.js ECG/BP generative canvas.
* **Testing**: Playwright E2E tests across Chromium, Firefox, and WebKit viewports.

---

## 3. Document 2: Software Development Plan (SDP) & Architecture

### 3.1 Iterative SDLC Method
Adopting a **Hybrid Wagile Model** (Predictive high-level WBS + Agile sprint execution per Epic):

```
Sprint 1: Core Architecture & Stitch Design Tokens (Epic 1)
Sprint 2: UTMRouter & Dynamic Persona Switching (Epic 2)
Sprint 3: WebGL 3D Membrane & p5.js Telemetry Canvas (Epic 3)
Sprint 4: Outbreak Incident Storyboards & Simulators (Epic 4)
Sprint 5: CPOE Security Gate & Bed Allocation Queue (Epic 4/5)
Sprint 6: ML Performance Scorecard & Academic Blog (Epic 5/6)
Sprint 7: Partnership/Payment Gate & E2E Playwright QA (Epic 7)
```

---

## 4. Document 3: Work Breakdown Structure (WBS)

```
1. Pharos Hemodialysis Portal
   ├── 1.1 Core Architecture & Design System (Epic 1)
   │   ├── 1.1.1 Tailwind v4 Clinical Light Mode Theme setup
   │   └── 1.1.2 Reusable UI primitives (Buttons, Cards, Badges)
   ├── 1.2 Persona Navigation & Routing (Epic 2)
   │   ├── 1.2.1 UTMRouter query param handler (?utm_persona=)
   │   ├── 1.2.2 Persistent localStorage state sync
   │   └── 1.2.3 Sticky Header Navigation Switcher
   ├── 1.3 Interactive Visual Engine (Epic 3)
   │   ├── 1.3.1 Three.js 3D DialysisMembrane3D canvas (>= 50 FPS)
   │   └── 1.3.2 p5.js VitalStreamP5 real-time telemetry component
   ├── 1.4 Clinical Outbreak Simulators (Epic 4)
   │   ├── 1.4.1 Hard Water Syndrome simulator (Calcium jump & BP spike)
   │   ├── 1.4.2 Chloramine Oxidant Hemolysis simulator (Heinz body & transfusions)
   │   └── 1.4.3 Cobe Blood Line Recall simulator (Pink serum & aperture shear)
   ├── 1.5 Clinical Safety & Queue Engine (Epic 4/5)
   │   ├── 1.5.1 MedGemma CPOE Interceptor (CrCl < 10 mL/min enoxaparin alert)
   │   └── 1.5.2 Biometric Bed Allocation Queue (4-hr countdown & audio chime)
   ├── 1.6 Machine Learning Scorecard & Content (Epic 5/6)
   │   ├── 1.6.1 IDH ML Matrix (RNN, XGBoost, CatBoost, Bi-LSTM metrics)
   │   └── 1.6.2 MDX Milestone Roadmap & Team Showcase
   └── 1.7 QA, Security & Deployment (Epic 7)
       ├── 1.7.1 Playwright E2E visual regression tests
       └── 1.7.2 WAF 5-Pillar Security & Reliability verification
```

---

## 5. Document 4: Risk Management Plan & Matrix

| Risk ID | Risk Category | Risk Description | Likelihood | Impact | Mitigation Strategy |
|---|---|---|---|---|---|
| **RSK-01** | Performance | Three.js WebGL canvas drops frame rates below 30 FPS on low-tier GPUs | Medium | High | Implement adaptive particle count scaling and fallback 2D canvas |
| **RSK-02** | Security | Unsanitized inputs or exposed API parameters (`SEC-01`, `SEC-02`) | Low | Critical | Strict environment variable validation (`.env`) and query parameter sanitization |
| **RSK-03** | Clinical | CPOE interceptor fails to trigger on edge-case CrCl values | Low | Critical | Comprehensive unit tests for renal clearance boundary conditions ($< 10\text{ mL/min}$) |
| **RSK-04** | State | Persona routing mismatch between server render and client `localStorage` | Medium | Medium | Implement hydration-safe state synchronization in `UTMRouter` |
| **RSK-05** | Reliability | Web Audio API fails audio chime playback due to browser autoplay policies | High | Low | User-gesture initialization trigger for biometric queue chimes |

---

## 6. Document 5: RACI Matrix

| Task / Deliverable | Patient | Nurse | Clinician | Tech Lead | Evaluator |
|---|---|---|---|---|---|
| Persona Routing (`UTMRouter`) | **I** | **I** | **I** | **A/R** | **C** |
| 3D Membrane Visualizer | **C** | **I** | **I** | **A/R** | **I** |
| Outbreak Simulators | **I** | **C** | **C** | **A/R** | **A** |
| CPOE Enoxaparin Gate | **I** | **I** | **C** | **A/R** | **A** |
| Bed Queue Manager | **I** | **C** | **I** | **A/R** | **I** |
| E2E Test Suite Execution | **I** | **I** | **I** | **A/R** | **A** |

*Legend: **A** = Accountable, **R** = Responsible, **C** = Consulted, **I** = Informed*

---

## 7. Document 6: Quality Assurance & WAF Checklist

- [ ] **SEC-01**: Zero hardcoded secrets or sensitive keys in source files.
- [ ] **SEC-02**: Parameterized queries and clean input handling.
- [ ] **REL-01**: Request timeouts configured for external fetches.
- [ ] **OPS-01**: No unhandled console errors or raw print statements in production flows.
- [ ] **PERF-01**: WebGL particle render optimized to maintain $\ge 50$ FPS.
- [ ] **E2E Visual QA**: Playwright test suite passes across Chrome, Firefox, and Safari viewports.

---

## 8. Summary & Next Steps
This framework provides a complete project management suite derived from ProjectManager.com standards. All 7 documents align with the project's specification tree (`specs/`) and local WAF governance protocols (`.agents/AGENTS.md`).
