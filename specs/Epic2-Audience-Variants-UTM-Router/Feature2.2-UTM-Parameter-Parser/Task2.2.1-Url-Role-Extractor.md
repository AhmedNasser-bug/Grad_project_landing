# Task2.2.1-Url-Role-Extractor

- **Epic:** `Epic2-Audience-Variants-UTM-Router`
- **Feature:** `Feature2.2-UTM-Parameter-Parser`
- **Assigned Skill Suite:** `/gstack`, `/waf-reliability`, `/teamwork-preview`

## Required Skills to Invoke / Download / Search
- /gstack
- /waf-reliability
- /teamwork-preview

## Pre-flight Search Strategy & Audit
> **Mandatory Action:** Search URLSearchParams state handling.

## Context & Clinical Objective
Extract utm_role (patient|nurse|clinician) from URL search parameters on page load.

## Acceptance Criteria (Gherkin Format)
- `Given` the component is initialized in the Spec-Driven framework
- `When` the discovery phase or visual component is executed
- `Then` execute the action adhering to Swiss Minimalist design standards, EPIC 0 reusable modules, and GSAP ScrollTrigger timelines.
- `And` verify WAF security (`SEC-01..04`), reliability (`REL-01..06`), and performance metrics.

## Design System Tokens Applied
- **Canvas:** `--color-bg` (#FFFFFF) / `--bg-dark` (#060D1A)
- **Card Format:** Screen-Wide Parallax Card (100vw x 100vh)
- **Borders:** Razor-thin 1px solid (`#E2E8F0` / `#004AC6`)
- **Typography:** `Inter` (body) + `JetBrains Mono` (clinical telemetry metrics)
- **Reusable Assets:** Import from `Epic0-Reusable-Design-System-Visual-Assets`

## Verification Protocol
1. Execute `npm run build` to confirm static type safety.
2. Verify visual appearance against Swiss Medical Minimalist design specifications.
3. Test using `/teamwork-preview` for autonomous subagent delegation.
