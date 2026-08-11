# Handoff Report — Milestone 2 (Epic 2: Dynamic UTM Router & Persona Switcher)

**Agent:** `explorer_m2_1` (`teamwork_preview_explorer`)  
**Target Milestone:** Milestone 2 (Epic 2: Dynamic UTM Router & Persona Switcher)  
**Date:** 2026-08-11T08:04:50Z  

---

## 1. Observation

### 1.1 Existing UTMRouter Class (`dashboard/src/lib/routing/UTMRouter.ts`)
- **File Location:** `dashboard/src/lib/routing/UTMRouter.ts` (189 lines)
- **Supported Roles:** `'clinician' | 'nurse' | 'patient'` (defined by `ALLOWED_ROLES: PersonaRole[]`, default role `DEFAULT_ROLE = 'clinician'`).
- **URL Parameter Extraction:** Lines 32–63 implement `UTMRouter.parseRoleFromUrl(urlString?)`:
  ```ts
  const roleVal = searchParams.get('utm_role');
  ...
  const personaVal = searchParams.get('utm_persona');
  ```
  It parses both `?utm_role=` and `?utm_persona=` (case-insensitive and trimmed).
- **LocalStorage Sync & Priority:** Lines 65–92 (`initRole()`):
  1. Priority 1: URL search params via `parseRoleFromUrl()`
  2. Priority 2: `localStorage.getItem('pharos_utm_role')`
  3. Priority 3: Fallback default `'clinician'`
- **Event Bus & State Mutation:** Lines 135–185:
  - `setRole(newRole, updateUrl = true)` updates `currentRole`, calls `localStorage.setItem('pharos_utm_role', role)`, updates URL query string via `window.history.pushState({ utm_role: newRole }, '', url.toString())`, and calls `notifyListeners()`.
  - `subscribe(listener: RoleChangeListener)` adds listener to `Set<RoleChangeListener>`, immediately invokes callback with current role, and returns an unbind function `() => listeners.delete(listener)`.
  - `popstate` window event handler updates role and notifies listeners on browser Back/Forward navigation.
- **SSR & WAF Compliance:** Uses `typeof window !== 'undefined'` checks and try-catch wrappers to isolate subscriber callback exceptions (WAF `REL-04`).

### 1.2 Design System Persona Tokens (`dashboard/src/lib/tokens/clinicalVitalityTokens.ts`)
- **File Location:** `dashboard/src/lib/tokens/clinicalVitalityTokens.ts` (Lines 170–194)
- **Persona Data Matrix:**
  ```ts
  personas: {
    clinician: {
      label: 'Clinician / Nephrologist',
      accentColor: '#004AC6',
      eyebrowText: 'CLINICAL DECISION SUPPORT // MEDGEMMA CPOE',
      headlineText: 'Zero-Latency MedGemma Interceptor & Outbreak Sentinel',
      bodyText: 'AI-guided eGFR dose guardrails, real-time intradialytic hypotension risk prediction, and continuous dialysate water quality surveillance.',
    },
    nurse: {
      label: 'Bedside Dialysis Nurse',
      accentColor: '#006B5F',
      eyebrowText: 'BEDSIDE WORKFLOW // BIOMETRIC QUEUE',
      headlineText: 'Automated 4-Hour Shift Queue & Telemetry Monitor',
      bodyText: 'Rapid QR patient check-in, real-time ultrafiltration progress tracking, and instant automated audio-visual clinical alarms.',
    },
    patient: {
      label: 'Hemodialysis Patient',
      accentColor: '#10B981',
      eyebrowText: 'PATIENT CARE HUB // TRANSPARENT HEALING',
      headlineText: 'Empowered Intradialytic Care & Real-Time Telemetry',
      bodyText: 'Transparent access to treatment progress, personalized fluid removal metrics, and direct bedside clinician communication.',
    },
  }
  ```

### 1.3 GSAP Text Morph Utility (`dashboard/src/lib/gsap/TextSplitUtil.ts`)
- **File Location:** `dashboard/src/lib/gsap/TextSplitUtil.ts` (147 lines)
- **Morphing Function:** Lines 117–145 implement `TextSplitUtil.morphHeadline(element, newText, options)`:
  - Fades out target element (`opacity: 0, y: -15`, `duration: 0.25s`).
  - Swaps `innerText` to `newText`.
  - Re-triggers staggered word/character split entrance reveal (`revealHeadline`).

### 1.4 Current Header & Page State (`dashboard/src/pages/index.astro`)
- **File Location:** `dashboard/src/pages/index.astro` (Lines 281–301)
- Currently contains static inline header HTML (`<header class="swiss-nav">`) with raw persona buttons:
  ```html
  <div class="swiss-persona-bar">
    <button class="swiss-persona-btn active" data-role="clinician">CLINICIAN</button>
    <button class="swiss-persona-btn" data-role="nurse">NURSE</button>
    <button class="swiss-persona-btn" data-role="patient">PATIENT</button>
  </div>
  ```
- **Component Gap:** Standalone component `dashboard/src/components/routing/PersonaToggleNavbar.astro` (or `.tsx`) does NOT exist yet.
- **Wiring Gap:** The `<script>` block in `index.astro` (lines 389–447) initializes WebGL fluid and Three.js CAD engines, but does NOT yet import `utmRouter` or attach event listeners to update `#persona-tag`, `#hero-headline`, and `#hero-statement`.

### 1.5 Build Verification Result
- **Command Executed:** `npm run build`
- **Output:**
  ```
  > hemodialysis-digitization-portal@1.0.0 build
  > npm run build --prefix dashboard
  > dashboard@0.0.1 build
  > astro build
  08:04:47 [build] 3 page(s) built in 7.97s
  08:04:47 [build] Complete!
  ```
  Clean build with zero errors.

---

## 2. Logic Chain

1. **UTMRouter Engine Core is Fully Built:** `UTMRouter.ts` provides complete URL parsing (`?utm_role=` / `?utm_persona=`), `localStorage` sync, history `pushState` update, and `subscribe()` event bus.
2. **Persona Copy and Tokens are Complete:** `clinicalVitalityTokens.ts` specifies the exact copy and colors for Clinician, Nurse, and Patient personas.
3. **Animation Utility is Ready:** `TextSplitUtil.morphHeadline` in `lib/gsap/TextSplitUtil.ts` provides smooth text morphing between persona transitions.
4. **Missing Modular Component & Page Integration:**
   - Standalone `PersonaToggleNavbar` component needs to be created under `dashboard/src/components/routing/PersonaToggleNavbar.astro` (or `.tsx`).
   - `dashboard/src/pages/index.astro` needs to incorporate `PersonaToggleNavbar` and subscribe hero card elements (`#persona-tag`, `#hero-headline`, `#hero-statement`) to `utmRouter` state changes using `TextSplitUtil.morphHeadline`.

---

## 3. Caveats

- `UTMRouter.ts` operates in browser mode (`typeof window !== 'undefined'`). In SSR during static generation, it returns `'clinician'` as default.
- No other caveats identified.

---

## 4. Conclusion

Milestone 2 core infrastructure (`UTMRouter.ts`, design system persona tokens, GSAP morph utilities) is 100% complete and functionally sound. The remaining tasks for `worker_m2_r1` are:
1. Document persona routing grounding matrix (Task 2.1.1).
2. Validate and polish `UTMRouter.ts` export contracts and SSR guards (Task 2.2.1).
3. Implement `dashboard/src/components/routing/PersonaToggleNavbar.astro` (or `.tsx`) and integrate it into `dashboard/src/pages/index.astro` with GSAP text morphing (Task 2.3.1).

---

## 5. Step-by-Step Execution Blueprint for `worker_m2_r1`

### Step 1: Fulfill Task 2.1.1 (Persona Grounding & Research Matrix)
- Verify persona tokens in `dashboard/src/lib/tokens/clinicalVitalityTokens.ts`:
  - `clinician`: MedGemma AI decision support, eGFR warnings, IDH risk prediction.
  - `nurse`: Bedside IoT telemetry, 4-hour shift queue, 20 missing data days recovered.
  - `patient`: Transparent care metrics, fluid removal telemetry, treatment safety.
- Confirm Clinical Light Mode color tokens (`#FFFFFF`, `#F8F9FF`, `#004AC6`, `#0B1C30`, `#10B981`, `#EF4444`).

### Step 2: Fulfill Task 2.2.1 (UTM Router Verification & Export Polish)
- Inspect `dashboard/src/lib/routing/UTMRouter.ts`:
  - Confirm exported types: `PersonaRole` ('clinician' | 'nurse' | 'patient'), `ALLOWED_ROLES`, `DEFAULT_ROLE`, `STORAGE_KEY`, `UTMRouter`, `utmRouter`.
  - Ensure static method `UTMRouter.parseRoleFromUrl()` handles both `utm_role` and `utm_persona`.
  - Ensure `initRole()` reads URL parameters first, `localStorage` second, and defaults to `'clinician'`.
  - Ensure `setRole(role, true)` updates `localStorage`, `window.history.pushState`, and notifies all active subscribers.
  - Ensure WAF `REL-04` error boundary wrapping around listener callbacks.

### Step 3: Fulfill Task 2.3.1 (Persona Toggle Navbar Component & Page Integration)
- **Create Component File:** `dashboard/src/components/routing/PersonaToggleNavbar.astro` (or `.tsx` / `.astro`):
  - Sticky glassmorphic navbar (`position: fixed; top: 0; backdrop-filter: blur(12px)`).
  - Brand header seal ("ASTRO PORTAL"), title ("Hemodialysis Decision Support Framework"), and advisor ("Dr. Mohamed Abdou | Office of the Dean").
  - Persona button bar (`CLINICIAN`, `NURSE`, `PATIENT`).
  - Active button indicator state styling (`.active` class / `#2563EB` background).
  - Client-side script attaching click listeners to invoke `utmRouter.setRole(role)` and subscribing to `utmRouter.subscribe((role) => updateActiveButton(role))`.
- **Integrate into `dashboard/src/pages/index.astro`:**
  - Import `PersonaToggleNavbar` or mount the component in the header slot.
  - In the client-side `<script>` tag of `index.astro`:
    ```ts
    import { utmRouter } from '../lib/routing/UTMRouter';
    import { clinicalVitalityTokens } from '../lib/tokens/clinicalVitalityTokens';
    import { TextSplitUtil } from '../lib/gsap/TextSplitUtil';

    utmRouter.subscribe((role) => {
      const data = clinicalVitalityTokens.personas[role];
      if (!data) return;

      const tagEl = document.getElementById('persona-tag');
      const headlineEl = document.getElementById('hero-headline');
      const statementEl = document.getElementById('hero-statement');

      if (tagEl) tagEl.innerText = data.eyebrowText;
      if (headlineEl) TextSplitUtil.morphHeadline(headlineEl, data.headlineText);
      if (statementEl) statementEl.innerText = data.bodyText;
    });
    ```
- **Verification:**
  - Run `npm run build` from root to confirm clean static build.
  - Confirm zero TypeScript or Astro linter errors.

---

## 6. Verification Method

1. **Build Verification:**
   ```powershell
   npm run build
   ```
   Expect: Exits with code 0 and builds `dashboard/dist/`.
2. **File Structure Inspection:**
   Verify `dashboard/src/components/routing/PersonaToggleNavbar.astro` (or `.tsx`) exists.
3. **UTM Routing Logic Inspection:**
   Verify `dashboard/src/lib/routing/UTMRouter.ts` supports `?utm_role=` and `?utm_persona=`.
