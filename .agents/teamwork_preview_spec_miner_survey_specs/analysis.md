# Specification Mining & Comprehensive Feature Survey Report

**Project:** Integrated Hemodialysis Digitization & Clinical Decision Support Framework (Pharos University Graduation Project Landing Page & Proposal Portal)  
**Author:** `teamwork_preview_spec_miner`  
**Date:** 2026-08-05  
**Working Directory:** `D:/Study/Programming/Projects/Grad_project_landing/.agents/teamwork_preview_spec_miner_survey_specs/`  
**Specification Source:** `specs/` (Epics 0 through 8), `ORIGINAL_REQUEST.md`, `AGENTS.md`, and project context rules.

---

## 1. Executive Summary & Overview

This specification survey maps the entire physical directive tree in `specs/` (Epics 0 through 8), cross-referencing requirements from `ORIGINAL_REQUEST.md` (versions 2026-08-04 and 2026-08-05) and operational mandates from `AGENTS.md` and `PROJECT.md`.

The primary project objective is to deliver a **high-trust, visual-first proposal presentation web portal and research hub** for the **Pharos University Hemodialysis Digitization Graduation Project (AY 2026/2027)** under project advisor **Dr. Mohamed Abdou (Office of the Dean)**.

### Architectural Core Pillars
1. **Screen-Wide Parallax Scrolltelling Landing Page (`index.html`)**: 100vw x 100vh full-viewport sticky parallax cards with giant responsive typography (`clamp(2.8rem, 5vw, 5.5rem)`), WebGL dialysate clearance fluid backdrop, Three.js CAD wireframe cylinder model, sticky UTM persona router (`?utm_role=patient|nurse|clinician`), MedGemma AI prescription interceptor, and Stripe grant checkout modal.
2. **Dedicated MDX Research Blog Engine (`/blog` and `/blog/[slug]`)**: Clean reading layout for field survey articles (London & Seoul outbreak audit writeups), strictly isolated from main landing scrolltelling.
3. **EPIC 0 Component Foundation**: Modular visual asset library containing GSAP text split/morph utilities, WebGL fluid shaders, Three.js wireframe CAD modules, Hyperframes video frame scroll scrub engines, and Swiss Minimalist card primitives.
4. **Mandatory Discovery Phase per Epic**: Every Epic initiates with an internet grounding research and interactive interview task before implementation code is committed.
5. **Stitch UI Mockup Enclosures (Epic 8)**: Integration of high-fidelity UI mockups from Stitch project `503366360860058565` (Clinical Vitality design system) for bedside nursing, CPOE alerts, and patient telemetry.

---

## 2. Global Design System Tokens & WAF Protocols

### 2.1 Design System Tokens ("Clinical Vitality" + Swiss Minimalist)
- **Canvas / Surface Background:** `--color-bg` (`#FFFFFF` Medical White Surface) / `--bg-dark` (`#060D1A` Deep Slate Shader Base) / `--bg-tint` (`#F8F9FF`)
- **Primary Accent Blue:** `--color-primary` (`#004AC6`)
- **Typography Colors:** `--color-text-primary` (`#0B1C30` Deep Slate Typography), `--color-text-secondary` (`#475569` Slate Muted)
- **Status & Alerts:** `--color-success` (`#10B981` Medical Green), `--color-danger` (`#EF4444` Critical Alert Red)
- **Card Format:** Screen-Wide Parallax Card Shell (`100vw x 100vh` sticky viewport cards)
- **Borders:** Razor-thin 1px solid (`#E2E8F0` Light Neutral / `#004AC6` Highlight)
- **Typography Pairings:** `Inter` (UI Body & Headers) + `JetBrains Mono` (Clinical Telemetry, Lab Values, Watermark Indices)

### 2.2 Microsoft Well-Architected Framework (WAF) Directives
- **Security (`SEC-01` to `SEC-04`)**:
  - `SEC-01`: Zero hardcoded credentials; require `.env` configuration.
  - `SEC-02`: Parameterized DB queries; no string concatenation.
  - `SEC-03`: Enforce secure protocols (`https://`, `wss://`).
  - `SEC-04`: Resource locks (`CanNotDelete`) on critical state stores.
- **Reliability (`REL-01` to `REL-06`)**:
  - `REL-01`: Mandatory HTTP request timeout (strictly 5000ms threshold).
  - `REL-02`: No bare `except:` or `catch(e) {}`; explicit error taxonomy.
  - `REL-03`: Bounded retries with exponential backoff and circuit breakers.
  - `REL-04`: Graceful WebGL context loss recovery (`webglcontextlost` handling).
  - `REL-05`: Duplicate detection and DLQ handling on message streams.
  - `REL-06`: Connection pool isolation between frontend telemetry and backend APIs.
- **Operational Excellence (`OPS-01` to `OPS-04`)**:
  - `OPS-01`: Structured JSON logging; no raw `console.log()` in production.
  - `OPS-02`: Startup environment validation.
  - `OPS-03`: 5-step safe decommissioning lifecycle.
  - `OPS-04`: Complete isolation of PoC code from production modules.
- **Performance Efficiency (`PERF-01` to `PERF-02`)**:
  - `PERF-01`: Flattened O(N) loops; no nested O(N^3) iteration.
  - `PERF-02`: Non-blocking async I/O; WebGL canvas renders at strictly `>= 60 FPS`.
- **Cost Optimization (`COST-01`)**:
  - `COST-01`: Explicit cleanup of WebGL contexts, animation loops, and timers.

### 2.3 Spec-Driven Development Directive Protocol (`SPEC-DIR-01`)
1. Mandatory EPIC 0 foundation for shared visual primitives.
2. Mandatory Discovery Phase (Feature X.1) for every Epic.
3. Explicit skill inventory per task.
4. Pre-flight audit strategy prior to implementation.
5. Strict token enforcement and Gherkin-formatted acceptance criteria.

---

## 3. Features Discovered (Master Matrix)

| # | Category | Feature | Description | Inputs | Outputs | Error Behavior | Discovered Via |
|---|----------|---------|-------------|--------|---------|----------------|----------------|
| 1 | Visual Engine | GSAP Text Split & Morph Utilities | SplitText reveal animations for giant screen headlines (`clamp(2.8rem, 5vw, 5.5rem)`) | Text strings, trigger scroll elements | Split DOM elements, animated character spans | Fallback to un-split plain text if GSAP fails | Task0.1.1 |
| 2 | Visual Engine | GSAP ScrollTrigger Parallax Wrapper | Standardized 100vw x 100vh sticky card stacking & parallax pinning container | Child DOM components, scroll position | Pinning timeline, smooth scroll transforms | Disable pinning on reduced-motion or low-spec devices | Task0.1.2 |
| 3 | Visual Engine | Full-Bleed WebGL Fluid Shader Canvas | Dialysate clearance fluid dynamic GLSL shader running in background | Mouse movement, time uniform, scroll velocity | Rendered WebGL canvas (`>= 60 FPS`) | Graceful WebGL context loss recovery badge (`REL-04`) | Task0.2.1 |
| 4 | Visual Engine | Three.js CAD Wireframe Cylinder | Interactive 3D dialysate filter hollow-fiber cylinder model with particle flow | Mouse/drag events, particle count | 3D LineSegments mesh scene | Fallback to 2D SVG canvas preview | Task0.2.2 |
| 5 | Visual Engine | Hyperframes Video Frame Scrubber | Scroll-driven HTML5 canvas video frame scrubber for incident playback | Scroll offset, pre-rendered frame array | Drawn video frame on 2D canvas | Poster image display if frame load fails | Task0.3.1 |
| 6 | Visual Engine | Swiss Minimalist Card Shell Primitives | Card wrapper with 1px razor border (`#E2E8F0`), 100vw x 100vh layout, monospace watermark indices | Section index (e.g. `00`, `01`), card content | Styled React/Astro card enclosure | Render basic bordered div on style failure | Task0.4.1 |
| 7 | Core Architecture | Architecture Grounding & Interview | Discovery phase research on Astro v5 monorepo setup and user interview | User responses (`ask_question`), Web search | Architecture decision record (ADR) | Re-prompt user if requirements are ambiguous | Task1.1.1 |
| 8 | Core Architecture | Astro Subdirectory Monorepo Isolation | Astro v5 app setup inside `dashboard/` subfolder with root execution scripts | NPM commands (`npm run dev`, `build`) | Root proxy script execution (`--prefix dashboard/`) | Fail build with descriptive config error message | Task1.2.1 |
| 9 | Core Architecture | Stitch Swiss Minimalist CSS Tokens | Injection of CSS variables (`--color-bg`, `--color-primary`, razor borders) into Tailwind v4 | Stitch design system tokens | Global CSS stylesheet and Tailwind theme | Fallback to default neutral color system | Task1.3.1 |
| 10 | Persona Routing | Audience Routing Grounding & Interview | Research on persona UX patterns for patients, nurses, and clinicians | Persona target profiles, user input | Persona UX spec mapping | Default to `clinician` view on missing input | Task2.1.1 |
| 11 | Persona Routing | UTM Parameter Extract Engine | Client/server URL search param parser for `?utm_role=patient|nurse|clinician` | URL location string, localStorage | Persona state (`patient`, `nurse`, `clinician`) | Fallback to `clinician` persona if URL invalid | Task2.2.1 |
| 12 | Persona Routing | Sticky GSAP Morph Pill Switcher | Persistent floating pill bar for switching personas with FLIP morph animation | User click event, active persona state | Animated pill button transition, layout toggle | Static tab switch without animation on mobile | Task2.3.1 |
| 13 | Visual Core | Visual Research & Generative Grounding | Research on WebGL dialysate clearance shaders and generative art options | Generative art algorithms, user feedback | Visual aesthetic spec sheet | Fallback to CSS gradient backdrop | Task3.1.1 |
| 14 | Visual Core | Full Viewport Hero Card (Card 00) | Screen-wide hero section showcasing main graduation project title & WebGL shader | Persona state, scroll position | Hero card UI with animated typography | Render static high-res graphic on WebGL failure | Task3.2.1 |
| 15 | Incident Storyboards | Outbreak Storyboard Research | Research on London & Seoul outbreak timeline telemetry visual design | Incident data (chloramine, hard water) | Storyboard timeline wireframe | Display tabular incident summary | Task4.1.1 |
| 16 | Incident Storyboards | Outbreak Interactive Frame Scrub Cards | Interactive cards scrubbing London chloramine outbreak and Seoul water syndrome | Scroll position, frame scrubber input | Rendered video frame sequence & lab telemetry | Display static keyframe sequence | Task4.2.1 |
| 17 | MDX Blog Engine | Blog UX Grounding & Layout Research | Research on medical publication reading UX and MDX collection structure | MDX frontmatter schemas, article drafts | MDX blog layout design | Render standard HTML article template | Task5.1.1 |
| 18 | MDX Blog Engine | Dedicated MDX Blog Engine (`/blog`) | Astro v5 Content Collections route `/blog` and `/blog/[slug]` for field surveys | `.mdx` content files in `src/content/blog/` | Static, SEO-optimized HTML article pages | 404 error page with link back to landing page | Task5.2.1 |
| 19 | Visual Timeline | Visual Milestone Ledger Card (Card 06) | Screen-wide timeline card detailing project milestones, deliverables, and dates | Milestone JSON array | Interactive visual milestone card | Static list of project milestones | Task5.3.1 |
| 20 | Academic Trust | Academic Trust Research & Seal Design | Research on university dean seal & accreditation layout standards | Pharos Univ seal SVG, Dean office metadata | Academic trust design specification | Render text-only academic affiliation | Task6.1.1 |
| 21 | Academic Trust | Pharos University Dean Team Card (Card 07) | Screen-wide grid displaying team credentials, Dr. Mohamed Abdou endorsement, student specs | Team member profile cards, Dean badge | Visual team showcase card | Simplified single-column team list | Task6.2.1 |
| 22 | Payment Gate | Research Grant Checkout UX Grounding | Research on Stripe grant sponsorship checkout flow and tier options | Sponsorship tier amounts ($100, $500, $2500) | Payment modal UX blueprint | Default to direct email contact link | Task7.1.1 |
| 23 | Payment Gate | Stripe Grant Checkout Modal Card (Card 08) | Screen-wide sponsorship matrix card triggering Stripe test checkout modal | User tier click, Stripe API keys (`.env`) | Modal dialog with Stripe elements checkout | Display test mode warning banner on API error | Task7.2.1 |
| 24 | Mockup Integration | Stitch Screen Selection Interview | Discovery phase selection of 16 screens from Stitch project `503366360860058565` | Stitch project screens inventory | Screen mapping matrix for bedside UI | Fallback to screenshots of Stitch UI | Task8.1.1 |
| 25 | Mockup Integration | Interactive UI Mockup Embed Panel | Interactive HTML/CSS container embedding Stitch screens for bedside vitals & CPOE | Selected screen ID, user interaction | Live embedded responsive UI panel | Static image embed fallback | Task8.2.1 |

---

## 4. Epic-by-Epic Breakdown & Task Specifications

### Epic 0: Reusable Design System & Visual Assets
- **Feature 0.1: GSAP Animation Library**
  - `Task0.1.1`: GSAP Text Split Effects (`/gstack`, `/frontend-design`, `/web-artifacts-builder`, `/teamwork-preview`). Pre-flight search: GSAP SplitText reveal. Clinical objective: Build ready-to-use headline typography morph utilities.
  - `Task0.1.2`: GSAP ScrollTrigger Parallax Wrapper (`/frontend-design`, `/web-artifacts-builder`, `/teamwork-preview`). Pre-flight search: GSAP ScrollTrigger sticky card stacking. Clinical objective: Standardized 100vw x 100vh card wrapper module.
- **Feature 0.2: WebGL / Three.js Vignette Engine**
  - `Task0.2.1`: Fluid Shader Canvas Module (`/algorithmic-art`, `/canvas-design`, `/waf-performance-efficiency`, `/teamwork-preview`). Pre-flight search: WebGL fluid GLSL shaders & GPU memory cleanup. Clinical objective: Dialysate clearance fluid background shader.
  - `Task0.2.2`: Three.js CAD Wireframe Module (`/algorithmic-art`, `/canvas-design`, `/teamwork-preview`). Pre-flight search: Three.js LineSegments CAD cylinder. Clinical objective: 3D hollow-fiber dialyzer membrane visualizer.
- **Feature 0.3: Hyperframes Video Scrub Engine**
  - `Task0.3.1`: Video Canvas Scroll Scrubber (`/frontend-design`, `/waf-performance-efficiency`, `/teamwork-preview`). Pre-flight search: HTML5 canvas scroll-scrubbing algorithms. Clinical objective: Frame scrubber for London/Seoul outbreak case studies.
- **Feature 0.4: Swiss Minimalist Card Primitives**
  - `Task0.4.1`: Screen-Wide Parallax Card Shell (`/frontend-design`, `/brand-guidelines`, `/teamwork-preview`). Pre-flight search: Swiss typography layout primitives & razor borders. Clinical objective: 1px razor-thin border cards with JetBrains Mono watermark indices.

### Epic 1: Core Architecture & Swiss Minimalist
- **Feature 1.1: Discovery Phase Architecture Research**
  - `Task1.1.1`: Internet Grounding Architecture Interview (`/gstack`, `/spec`, `/devex-review`, `/teamwork-preview`). Conduct user interview (`ask_question`) & search Astro v5 monorepo best practices.
- **Feature 1.2: Astro Monorepo Setup**
  - `Task1.2.1`: Subdirectory Isolation & Proxy Scripts (`/gstack`, `/waf-operational-excellence`, `/teamwork-preview`). Configure Astro in `dashboard/` subfolder with root script delegation.
- **Feature 1.3: Stitch Swiss Minimalist Tokens**
  - `Task1.3.1`: Razor-Thin Border CSS Grid (`/frontend-design`, `/brand-guidelines`, `/teamwork-preview`). Implement CSS variables (#FFFFFF surface, #E2E8F0 borders, #0B1C30 typography).

### Epic 2: Audience Variants & UTM Router
- **Feature 2.1: Discovery Phase Audience Research**
  - `Task2.1.1`: Persona Routing Grounding Interview (`/spec`, `/frontend-design`, `/teamwork-preview`). Research persona UX patterns and interview user.
- **Feature 2.2: UTM Parameter Parser**
  - `Task2.2.1`: URL Role Extractor (`/gstack`, `/waf-reliability`, `/teamwork-preview`). Parse `?utm_role=patient|nurse|clinician` using URLSearchParams.
- **Feature 2.3: Sticky Persona Switcher**
  - `Task2.3.1`: GSAP Morph Pill Toggle (`/frontend-design`, `/design-review`, `/teamwork-preview`). Build floating pill toggle with GSAP Flip animation.

### Epic 3: Visual Core & WebGL Fluid GSAP
- **Feature 3.1: Discovery Phase Visual Research**
  - `Task3.1.1`: Generative Art Grounding Interview (`/algorithmic-art`, `/canvas-design`, `/teamwork-preview`). Research WebGL clearance shaders and interview user.
- **Feature 3.2: Screen-Wide Parallax Hero Card**
  - `Task3.2.1`: Full Viewport Hero Card Setup (`/frontend-design`, `/web-artifacts-builder`, `/teamwork-preview`). Construct Card 00 with full-bleed WebGL fluid backdrop.

### Epic 4: Cinematic Hyperframes Incident Storyboards
- **Feature 4.1: Discovery Phase Incident Story Research**
  - `Task4.1.1`: Outbreak Scrub Grounding Interview (`/canvas-design`, `/design-shotgun`, `/teamwork-preview`). Research London & Seoul outbreak visual storyboards.
- **Feature 4.2: London & Seoul Outbreak Storyboards**
  - `Task4.2.1`: Screen-Wide Outbreak Scrub Cards (`/frontend-design`, `/waf-performance-efficiency`, `/teamwork-preview`). Implement scroll-scrub cards for chloramine & hard water incidents.

### Epic 5: Dedicated MDX Blog & Visual Timeline
- **Feature 5.1: Discovery Phase Blog Research**
  - `Task5.1.1`: Blog UX Grounding Interview (`/doc-coauthoring`, `/seo-optimization`, `/teamwork-preview`). Research medical publication reading UX.
- **Feature 5.2: Dedicated Blog Subpage Engine**
  - `Task5.2.1`: Clean MDX Post Reader (`/gstack`, `/seo-optimization`, `/teamwork-preview`). Setup `/blog` and `/blog/[slug]` Content Collections routes.
- **Feature 5.3: Visual Milestone Timeline**
  - `Task5.3.1`: Screen-Wide Milestone Ledger Card (`/canvas-design`, `/diagram`, `/teamwork-preview`). Construct Card 06 milestone timeline.

### Epic 6: Academic Trust & Team Showcase
- **Feature 6.1: Discovery Phase Trust Showcase Research**
  - `Task6.1.1`: Academic Trust Grounding Interview (`/brand-guidelines`, `/stakeholder-brief-generator`, `/teamwork-preview`). Research university seal & endorsement presentation.
- **Feature 6.2: Screen-Wide Team Credentials Card**
  - `Task6.2.1`: Pharos Univ Dean Team Grid Card (`/frontend-design`, `/canvas-design`, `/teamwork-preview`). Construct Card 07 team grid with Dean Dr. Mohamed Abdou accreditation.

### Epic 7: Partnership, Sponsorship & Payment Gate
- **Feature 7.1: Discovery Phase Funding Gate Research**
  - `Task7.1.1`: Checkout UX Grounding Interview (`/web-artifacts-builder`, `/waf-security`, `/teamwork-preview`). Research research grant checkout flows.
- **Feature 7.2: Screen-Wide Sponsorship Matrix Card**
  - `Task7.2.1`: Stripe Grant Checkout Modal Card (`/waf-security`, `/waf-reliability`, `/teamwork-preview`). Construct Card 08 sponsorship matrix with Stripe checkout modal.

### Epic 8: Stitch UI Mockup Integration
- **Feature 8.1: Discovery Phase Mockup Research**
  - `Task8.1.1`: Stitch Screen Selection Interview (`/gstack`, `/frontend-design`, `/teamwork-preview`). Research Stitch project `503366360860058565` screens.
- **Feature 8.2: Stitch UI Enclosure Components**
  - `Task8.2.1`: Interactive Mockup Embed Panel (`/frontend-design`, `/web-artifacts-builder`, `/teamwork-preview`). Construct embedded responsive mockup containers using Clinical Vitality tokens.

---

## 5. Observed Edge Cases & Handling

| # | Feature | Input | Observed & Specified Behavior |
|---|---------|-------|-------------------------------|
| 1 | WebGL Shader | WebGL Context Loss / Driver Crash | Event listener intercepts `webglcontextlost`, logs warning, displays fallback 2D canvas badge, and calls `e.preventDefault()` to allow auto-restoration (`REL-04`). |
| 2 | UTM Router | Invalid or Missing `?utm_role` query param | Extractor defaults gracefully to `clinician` role and stores preference in `localStorage.setItem('utm_role', 'clinician')`. |
| 3 | Hyperframes Scrubber | Video asset load latency or network timeout | Scrubber displays pre-rendered SVG/canvas keyframe image with loading indicator; HTTP timeout enforced at 5000ms (`REL-01`). |
| 4 | MedGemma CPOE Alert | Renal Impairment Enoxaparin Order (CrCl < 10 mL/min) | CPOE interceptor halts order execution, opens high-priority red alert modal (`#EF4444`), and requires physician acknowledgment before override. |
| 5 | Stripe Grant Modal | Missing API Key / Invalid Secret Key in `.env` | Modal displays developer test mode notice without crashing application, adhering to `SEC-01` secret validation. |
| 6 | Subdirectory Monorepo | Executing `npm run dev` from workspace root | Root `package.json` delegates script execution to `dashboard/` subdirectory (`npm --prefix dashboard run dev`) without root toolchain collision. |
| 7 | Reduced Motion UX | User prefers reduced motion (`prefers-reduced-motion: reduce`) | GSAP ScrollTrigger parallax pinning disables sticky animation and presents standard vertical scrollable cards. |

---

## 6. Verification Protocols & Quality Gates

Each task specification enforces a 3-step verification protocol:
1. **Static Build Verification:** Execute `npm run build` inside `dashboard/` (or via root proxy) to verify TypeScript compilation and zero linter warnings.
2. **Visual & Design System Compliance:** Audit visual appearance against Swiss Medical Minimalist tokens (`#FFFFFF` background, 1px `#E2E8F0` razor borders, `Inter` + `JetBrains Mono` typography).
3. **Subagent Delegation Test:** Validate execution via `/teamwork-preview` for subagent handoffs and Playwright E2E visual regression suite.

---

## 7. Conclusion & Next Steps

All 25 specification task files across Epics 0 through 8 have been surveyed, categorized, and documented. The physical directives in `specs/` provide complete spec-driven coverage for building the Pharos University Hemodialysis Graduation Project Landing Page and Research Portal.

Implementation teams can immediately consume these specifications following the EPIC 0 asset foundation and mandatory per-Epic discovery phase protocol.
