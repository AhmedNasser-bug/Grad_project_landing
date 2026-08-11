# Empirical Stress-Test & Vulnerability Analysis: Milestone 0 Routing & Media Utilities

**Target Files:**
- `dashboard/src/lib/routing/UTMRouter.ts`
- `dashboard/src/lib/gsap/HyperframesScrubber.ts`

**Evaluator:** `teamwork_preview_challenger` (Empirical Challenger / Critic)  
**Date:** 2026-08-05  

---

## Executive Summary

An empirical stress-test suite was constructed and executed against `UTMRouter.ts` and `HyperframesScrubber.ts` to evaluate fallback behaviors, query parameter extraction, invalid string handling, network timeout compliance, and state synchronization.

While both modules demonstrate high baseline code quality and adhere to WAF REL-01 5000ms fetch timeout requirements, empirical testing uncovered **5 confirmed edge cases and state synchronization glitches** that require remediation before production deployment.

---

## 1. Empirical Test Results

### 1.1 UTMRouter.ts Test Suite (`test_utm_router.ts`)

| Category | Test Case | Status | Observation / Detail |
|---|---|---|---|
| **SSR Fallback** | `window` is `undefined` | **PASS** | Detects non-browser context, initializes `currentRole` to `'clinician'`, `parseRoleFromUrl()` returns `null` without throwing. |
| **URL Parsing (SSR)** | `parseRoleFromUrl(urlString)` | **PASS** | Parses relative (`/test?utm_role=patient`) and absolute (`http://domain/page?utm_persona=nurse`) URLs correctly. |
| **LocalStorage Exception** | `localStorage` throws `SecurityError` | **PASS** | Caught inside `try...catch` block in `initRole()` & `persistRole()`, logs warning, falls back to `DEFAULT_ROLE`. |
| **Corrupted LocalStorage** | `localStorage` contains invalid string | **PASS** | Rejects `'hacker_role'`, defaults to `'clinician'`. |
| **Invalid String Handling** | `?utm_role=ADMIN`, numeric, symbols | **PASS** | Rejects invalid role strings (`ADMIN`, `12345`), normalizes mixed-case (`NURSE` -> `nurse`), trims whitespace. |
| **Parameter Precedence** | Invalid `utm_role` + valid `utm_persona` | **FAIL (Edge Case 1)** | `?utm_role=invalid&utm_persona=nurse` evaluates `roleParam` to `'invalid'` and returns `null` instead of checking `utm_persona`. |
| **Subscriber Bus Error Boundary** | Error in `subscribe()` initial callback | **FAIL (Edge Case 2)** | `listener(this.currentRole)` inside `subscribe()` is NOT wrapped in `try...catch`; throwing subscriber crashes caller. |
| **PopState Navigation Sync** | Browser BACK to URL without params (`/`) | **FAIL (Edge Case 3)** | `handlePopState()` ignores `null` returns from `parseRoleFromUrl()`, leaving `UTMRouter` stuck on previous persona. |

### 1.2 HyperframesScrubber.ts Test Suite (`test_hyperframes_scrubber.ts`)

| Category | Test Case | Status | Observation / Detail |
|---|---|---|---|
| **WAF REL-01 Timeout** | Video load exceeds 5000ms limit | **PASS** | `loadVideoWithTimeout` triggers `reject()` after 5000ms, calls `activateFallback()`, sets `isFallbackMode = true`, and invokes `onFallback()`. |
| **Poster Fallback** | Video load fails + poster present | **PASS** | Successfully switches rendering canvas to `posterImage`. |
| **Canvas Minimal Fallback** | Video load fails + poster missing | **PASS** | Renders Swiss minimal canvas text fallback (`HYPERFRAMES VIDEO SCRUBBER // PROGRESS: XX%`). |
| **Scroll Bounds** | Progress `< 0.0` or `> 1.0` | **PASS** | Clamps progress bounds to `[0.0, 1.0]`. |
| **Invalid Progress (`NaN`)** | `setScrollProgress(NaN)` | **FAIL (Edge Case 4)** | Clamping `NaN` results in `NaN`, which poisons `targetProgress` and sets `video.currentTime = NaN` outside `try...catch`, crashing the rendering loop. |
| **Lifecycle Race Condition** | `destroy()` called during video fetch | **FAIL (Edge Case 5)** | Pending `initMedia()` promise resolves/rejects after destruction and fires `onReady()` / `onFallback()` callbacks on destroyed instance. |

---

## 2. Detailed Findings & Root Cause Analysis

### Finding 1 (UTMRouter): Invalid `utm_role` Blocks Valid `utm_persona` Fallback
- **Location:** `dashboard/src/lib/routing/UTMRouter.ts:44-50`
- **Code:**
  ```typescript
  const roleParam = searchParams.get('utm_role') || searchParams.get('utm_persona');
  if (roleParam) {
    const normalized = roleParam.toLowerCase().trim() as PersonaRole;
    if (ALLOWED_ROLES.includes(normalized)) {
      return normalized;
    }
  }
  ```
- **Root Cause:** If `utm_role` is present but invalid (e.g. `?utm_role=bad_role&utm_persona=nurse`), `searchParams.get('utm_role')` returns `'bad_role'` (truthy string). The `||` operator short-circuits and never evaluates `searchParams.get('utm_persona')`. Line 47 checks `ALLOWED_ROLES.includes('bad_role')` which is `false`, returning `null`.
- **Impact:** Legitimate users arriving via secondary `utm_persona` links are assigned default role if an unexpected `utm_role` query param exists.
- **Recommended Remediation:** Evaluate `utm_role` first; if invalid, check `utm_persona`:
  ```typescript
  const rawRole = searchParams.get('utm_role');
  if (rawRole) {
    const normalized = rawRole.toLowerCase().trim() as PersonaRole;
    if (ALLOWED_ROLES.includes(normalized)) return normalized;
  }
  const rawPersona = searchParams.get('utm_persona');
  if (rawPersona) {
    const normalized = rawPersona.toLowerCase().trim() as PersonaRole;
    if (ALLOWED_ROLES.includes(normalized)) return normalized;
  }
  ```

---

### Finding 2 (UTMRouter): Unhandled Exception in `subscribe()` Initial Invocation
- **Location:** `dashboard/src/lib/routing/UTMRouter.ts:141-149`
- **Code:**
  ```typescript
  public subscribe(listener: RoleChangeListener): () => void {
    this.listeners.add(listener);
    // Notify immediately with current role
    listener(this.currentRole);
    return () => { this.listeners.delete(listener); };
  }
  ```
- **Root Cause:** Unlike `notifyListeners()`, line 144 does not wrap `listener(this.currentRole)` in `try...catch`.
- **Impact:** If a subscriber component throws during its initial setup, `subscribe()` throws an unhandled error and aborts execution, leaving the listener registered in `this.listeners`.
- **Recommended Remediation:** Wrap the initial invocation in `try...catch`:
  ```typescript
  try {
    listener(this.currentRole);
  } catch (e) {
    console.error('[UTMRouter] Error in initial subscriber listener callback:', e);
  }
  ```

---

### Finding 3 (UTMRouter): PopState Desynchronization on Root Path (`/`)
- **Location:** `dashboard/src/lib/routing/UTMRouter.ts:95-102`
- **Code:**
  ```typescript
  private handlePopState(): void {
    const urlRole = UTMRouter.parseRoleFromUrl();
    if (urlRole && urlRole !== this.currentRole) {
      this.currentRole = urlRole;
      this.persistRole(urlRole);
      this.notifyListeners();
    }
  }
  ```
- **Root Cause:** When user navigates from `/?utm_role=patient` back to `/` using browser Back button, `parseRoleFromUrl()` returns `null`. Line 97 evaluates `if (urlRole && ...)` to `false`.
- **Impact:** `UTMRouter` state remains stuck on `'patient'` even though the browser address bar shows `/` (which should resolve to localStorage or `DEFAULT_ROLE`).
- **Recommended Remediation:** Re-evaluate `initRole()` or parse role with fallback on `popstate`:
  ```typescript
  private handlePopState(): void {
    const urlRole = UTMRouter.parseRoleFromUrl();
    const targetRole = urlRole || this.getStoredRole() || DEFAULT_ROLE;
    if (targetRole !== this.currentRole) {
      this.currentRole = targetRole;
      this.persistRole(targetRole);
      this.notifyListeners();
    }
  }
  ```

---

### Finding 4 (HyperframesScrubber): Uncaught Exception on `setScrollProgress(NaN)`
- **Location:** `dashboard/src/lib/gsap/HyperframesScrubber.ts:152-176`
- **Code:**
  ```typescript
  public setScrollProgress(progress: number): void {
    this.targetProgress = Math.max(0, Math.min(1, progress));
  }
  ...
  const targetTime = this.currentProgress * this.video.duration;
  if (Math.abs(this.video.currentTime - targetTime) > 0.03) {
    this.video.currentTime = targetTime; // Line 169
  }
  ```
- **Root Cause:** `Math.max(0, Math.min(1, NaN))` evaluates to `NaN`. In `render()`, `targetTime` becomes `NaN`. Assigning `this.video.currentTime = NaN` is outside the `try...catch` block (line 169) and throws an uncaught `TypeError` in browser engines.
- **Impact:** Invalid scroll progress calculations (e.g. dividing by zero scroll distance) crash the continuous requestAnimationFrame render loop.
- **Recommended Remediation:** Guard against `NaN` in `setScrollProgress` and move seek inside `try...catch`:
  ```typescript
  public setScrollProgress(progress: number): void {
    if (typeof progress !== 'number' || Number.isNaN(progress)) return;
    this.targetProgress = Math.max(0, Math.min(1, progress));
  }
  ```

---

### Finding 5 (HyperframesScrubber): Async Callback Race Condition on Destroyed Instance
- **Location:** `dashboard/src/lib/gsap/HyperframesScrubber.ts:75-96`
- **Code:**
  ```typescript
  await this.loadVideoWithTimeout(videoUrl, this.fetchTimeoutMs);
  this.isUsingVideo = true;
  if (options.onReady) options.onReady();
  ```
- **Root Cause:** `initMedia()` is asynchronous. If `destroy()` is called while video fetch is pending, `isDestroyed` becomes `true`. Once the promise settles, execution continues without checking `this.isDestroyed`.
- **Impact:** Callbacks (`onReady` / `onFallback`) fire on unmounted React/Astro components, potentially causing memory leaks or state errors.
- **Recommended Remediation:** Check `this.isDestroyed` after `await`:
  ```typescript
  if (this.isDestroyed) return;
  ```

---

## 3. Conclusion & Recommendations

The implementation of `UTMRouter.ts` and `HyperframesScrubber.ts` demonstrates strong architectural alignment with WAF REL-01 principles. However, the 5 identified edge cases represent realistic runtime failure points during user navigation and media scrubbing.

Remediation of these 5 findings will elevate the reliability of Milestone 0 primitives to full production standards.
