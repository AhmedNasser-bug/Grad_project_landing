# Orchestrator Context

## Project Summary
- Project: Pharos University Hemodialysis Digitization Graduation Project (AY 2026/2027)
- Advisor: Dr. Mohamed Abdou (Office of the Dean)
- Location: D:/Study/Programming/Projects/Grad_project_landing
- Core Objectives:
  - R1: Parallax scrolltelling landing page (`index.html`) with WebGL fluid shader backdrop (>= 60 FPS), Three.js CAD wireframe cylinder model, sticky persona router (`?utm_role=patient|nurse|clinician`), MedGemma AI alerts, Stripe grant checkout modal.
  - R2: Dedicated research blog engine (`blog.html` & `/blog/[slug]`) for field survey articles (London & Seoul outbreak audit writeups), strictly isolated from main page scrolltelling.
  - R3: EPIC 0 Reusable Visual Component Library in `specs/Epic0-Reusable-Design-System-Visual-Assets/`.
  - R4: Mandatory discovery phase grounding per Epic (web search/file review + user interviews).
  - R5: Stitch UI Mockup Integration in `specs/Epic8-Stitch-UI-Mockup-Integration/` from project 503366360860058565 (Clinical Vitality design system).
  - WAF Compliance: SEC-01 (zero secrets), REL-01 (timeouts <= 5000ms), REL-04 (WebGL context loss recovery).

## Key Files & Directories
- `.agents/ORIGINAL_REQUEST.md`: Verbatim user requirements
- `.agents/orchestrator/`: Working directory for Project Orchestrator
- `specs/`: Specifications for Epics 0 through 8
- `index.html`: Main landing page
- `blog.html`: Research blog page
- `src/`: Source code directory
