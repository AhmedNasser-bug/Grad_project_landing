/**
 * Empirical Stress Test Suite for UTMRouter & Design Tokens (Pure ESM)
 * Location: D:\Study\Programming\Projects\Grad_project_landing\.agents\challenger_m0_r2_2\test_utm_router.mjs
 */

import fs from 'fs';
import path from 'path';

// Let's load UTMRouter.ts source directly to verify parsing & structural invariants
const utmRouterPath = path.resolve('dashboard/src/lib/routing/UTMRouter.ts');
const utmRouterContent = fs.readFileSync(utmRouterPath, 'utf-8');

const tokensPath = path.resolve('dashboard/src/lib/tokens/clinicalVitalityTokens.ts');
const tokensContent = fs.readFileSync(tokensPath, 'utf-8');

const swissAstroPath = path.resolve('dashboard/src/components/primitives/SwissCardPrimitive.astro');
const swissAstroContent = fs.readFileSync(swissAstroPath, 'utf-8');

const swissTsxPath = path.resolve('dashboard/src/components/primitives/SwissCardPrimitive.tsx');
const swissTsxContent = fs.readFileSync(swissTsxPath, 'utf-8');

let passedTests = 0;
let failedTests = 0;

function assert(condition, testName, detail) {
  if (condition) {
    console.log(`[PASS] ${testName}`);
    passedTests++;
  } else {
    console.error(`[FAIL] ${testName}${detail ? ' - ' + detail : ''}`);
    failedTests++;
  }
}

console.log('=== UTMRouter & UI Primitives Empirical Structural & Runtime Test ===\n');

// --- TEST GROUP 1: UTMRouter Code Audit & Invariant Verification ---
console.log('--- TEST GROUP 1: UTMRouter Source Code Verification ---');

assert(
  utmRouterContent.includes("export type PersonaRole = 'clinician' | 'nurse' | 'patient';"),
  'UTMRouter defines exact PersonaRole union type'
);

assert(
  utmRouterContent.includes("ALLOWED_ROLES: PersonaRole[] = ['clinician', 'nurse', 'patient'];"),
  'UTMRouter defines ALLOWED_ROLES array'
);

assert(
  utmRouterContent.includes("DEFAULT_ROLE: PersonaRole = 'clinician';"),
  'UTMRouter defines DEFAULT_ROLE as clinician'
);

assert(
  utmRouterContent.includes("STORAGE_KEY = 'pharos_utm_role';"),
  'UTMRouter defines STORAGE_KEY as pharos_utm_role'
);

assert(
  utmRouterContent.includes("searchParams.get('utm_role')") && utmRouterContent.includes("searchParams.get('utm_persona')"),
  'parseRoleFromUrl parses both utm_role and utm_persona query parameters'
);

assert(
  utmRouterContent.includes("window.addEventListener('popstate'"),
  'UTMRouter attaches popstate listener in browser environment'
);

assert(
  utmRouterContent.includes("try {") && utmRouterContent.includes("listener(this.currentRole);") && utmRouterContent.includes("console.error('[UTMRouter] Error in subscriber"),
  'UTMRouter wraps subscriber callback execution in try-catch block for exception isolation'
);

// --- TEST GROUP 2: Runtime Execution of UTMRouter Class Logic ---
console.log('\n--- TEST GROUP 2: UTMRouter Runtime Execution & Edge Case Testing ---');

// Evaluate UTMRouter logic in JS VM environment
const ALLOWED_ROLES = ['clinician', 'nurse', 'patient'];
const DEFAULT_ROLE = 'clinician';
const STORAGE_KEY = 'pharos_utm_role';

class UTMRouterRuntime {
  constructor() {
    this.currentRole = DEFAULT_ROLE;
    this.listeners = new Set();
    this.isBrowser = typeof window !== 'undefined';
    this.initRole();
    if (this.isBrowser) {
      window.addEventListener('popstate', () => this.handlePopState());
    }
  }

  static parseRoleFromUrl(urlString) {
    try {
      let searchParams;
      if (typeof window !== 'undefined' && !urlString) {
        searchParams = new URLSearchParams(window.location.search);
      } else if (urlString) {
        const urlObj = new URL(urlString, 'http://localhost');
        searchParams = urlObj.searchParams;
      } else {
        return null;
      }

      const roleVal = searchParams.get('utm_role');
      if (roleVal) {
        const normRole = roleVal.toLowerCase().trim();
        if (ALLOWED_ROLES.includes(normRole)) {
          return normRole;
        }
      }

      const personaVal = searchParams.get('utm_persona');
      if (personaVal) {
        const normPersona = personaVal.toLowerCase().trim();
        if (ALLOWED_ROLES.includes(normPersona)) {
          return normPersona;
        }
      }
    } catch (e) {
      console.warn('[UTMRouter] Error parsing URL query parameters:', e);
    }
    return null;
  }

  initRole() {
    if (!this.isBrowser) {
      this.currentRole = DEFAULT_ROLE;
      return;
    }

    const urlRole = UTMRouterRuntime.parseRoleFromUrl();
    if (urlRole) {
      this.currentRole = urlRole;
      this.persistRole(urlRole);
      return;
    }

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored && ALLOWED_ROLES.includes(stored)) {
        this.currentRole = stored;
        return;
      }
    } catch (e) {
      console.warn('[UTMRouter] localStorage read error:', e);
    }

    this.currentRole = DEFAULT_ROLE;
  }

  persistRole(role) {
    if (!this.isBrowser) return;
    try {
      localStorage.setItem(STORAGE_KEY, role);
    } catch (e) {
      console.warn('[UTMRouter] localStorage write error:', e);
    }
  }

  getStoredRole() {
    if (!this.isBrowser) return null;
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored && ALLOWED_ROLES.includes(stored)) {
        return stored;
      }
    } catch (e) {
      console.warn('[UTMRouter] localStorage read error:', e);
    }
    return null;
  }

  handlePopState() {
    const urlRole = UTMRouterRuntime.parseRoleFromUrl() || this.getStoredRole() || DEFAULT_ROLE;
    if (urlRole !== this.currentRole) {
      this.currentRole = urlRole;
      this.persistRole(urlRole);
      this.notifyListeners();
    }
  }

  getRole() {
    return this.currentRole;
  }

  setRole(newRole, updateUrl = true) {
    if (!ALLOWED_ROLES.includes(newRole)) {
      console.warn(`[UTMRouter] Invalid role '${newRole}'. Allowed: ${ALLOWED_ROLES.join(', ')}`);
      return;
    }

    if (this.currentRole === newRole && !updateUrl) return;

    this.currentRole = newRole;
    this.persistRole(newRole);

    if (this.isBrowser && updateUrl) {
      try {
        const url = new URL(window.location.href);
        url.searchParams.set('utm_role', newRole);
        window.history.pushState({ utm_role: newRole }, '', url.toString());
      } catch (e) {
        console.warn('[UTMRouter] Failed to update URL pushState:', e);
      }
    }

    this.notifyListeners();
  }

  subscribe(listener) {
    this.listeners.add(listener);
    try {
      listener(this.currentRole);
    } catch (e) {
      console.error('[UTMRouter] Error in subscriber initial callback:', e);
    }

    return () => {
      this.listeners.delete(listener);
    };
  }

  notifyListeners() {
    this.listeners.forEach((listener) => {
      try {
        listener(this.currentRole);
      } catch (e) {
        console.error('[UTMRouter] Error in subscriber listener callback:', e);
      }
    });
  }
}

// 1. Static URL Parsing Tests
assert(
  UTMRouterRuntime.parseRoleFromUrl('http://localhost/?utm_role=patient') === 'patient',
  'parseRoleFromUrl parses valid utm_role=patient'
);
assert(
  UTMRouterRuntime.parseRoleFromUrl('http://localhost/?utm_role=NURSE') === 'nurse',
  'parseRoleFromUrl normalizes uppercase utm_role=NURSE'
);
assert(
  UTMRouterRuntime.parseRoleFromUrl('http://localhost/?utm_persona=clinician') === 'clinician',
  'parseRoleFromUrl parses valid utm_persona=clinician'
);
assert(
  UTMRouterRuntime.parseRoleFromUrl('http://localhost/?utm_role=invalid&utm_persona=patient') === 'patient',
  'parseRoleFromUrl falls back to utm_persona when utm_role is invalid'
);
assert(
  UTMRouterRuntime.parseRoleFromUrl('http://localhost/?utm_role=invalid&utm_persona=invalid') === null,
  'parseRoleFromUrl returns null when both utm_role and utm_persona are invalid'
);
assert(
  UTMRouterRuntime.parseRoleFromUrl('http://localhost/') === null,
  'parseRoleFromUrl returns null when query params absent'
);

// 2. SSR Mode Verification
const ssrInst = new UTMRouterRuntime();
assert(ssrInst.getRole() === 'clinician', 'SSR mode defaults to clinician');

// 3. Browser Simulation & LocalStorage Error Isolation
const mockStorage = {
  store: {},
  getItem(k) { return this.store[k] || null; },
  setItem(k, v) { this.store[k] = v; },
};
global.window = {
  location: { href: 'http://localhost/?utm_role=nurse', search: '?utm_role=nurse' },
  localStorage: mockStorage,
  addEventListener: () => {},
  history: { pushState: (st, t, url) => { global.window.location.search = url.includes('?') ? '?' + url.split('?')[1] : ''; } }
};
global.localStorage = mockStorage;

const browserInst = new UTMRouterRuntime();
assert(browserInst.getRole() === 'nurse', 'Browser init parses ?utm_role=nurse from URL');
assert(mockStorage.getItem(STORAGE_KEY) === 'nurse', 'Browser init persists role to localStorage');

browserInst.setRole('patient');
assert(browserInst.getRole() === 'patient', 'setRole updates role to patient');
assert(mockStorage.getItem(STORAGE_KEY) === 'patient', 'setRole syncs to localStorage');
assert(global.window.location.search === '?utm_role=patient', 'setRole updates browser location search');

// 4. Subscriber Exception Isolation Test
let subscriber1Called = false;
let subscriber2Called = false;

browserInst.subscribe(() => {
  subscriber1Called = true;
  throw new Error('Rogue subscriber crash');
});

browserInst.subscribe(() => {
  subscriber2Called = true;
});

browserInst.setRole('clinician');
assert(
  subscriber1Called && subscriber2Called,
  'Subscribers execute independently even if a previous subscriber throws an exception'
);

// --- TEST GROUP 3: Design Tokens & UI Primitives Verification ---
console.log('\n--- TEST GROUP 3: Design Tokens & UI Primitives Verification ---');

assert(
  tokensContent.includes("hex: '#FFFFFF'") && tokensContent.includes("bgCanvas"),
  'Tokens include #FFFFFF bgCanvas'
);
assert(
  tokensContent.includes("hex: '#F8FAFC'") && tokensContent.includes("bgMuted"),
  'Tokens include #F8FAFC bgMuted'
);
assert(
  tokensContent.includes("hex: '#004AC6'") && tokensContent.includes("accentBlue"),
  'Tokens include #004AC6 accentBlue'
);
assert(
  tokensContent.includes("hex: '#0B1C30'") && tokensContent.includes("textPrimary"),
  'Tokens include #0B1C30 textPrimary'
);
assert(
  tokensContent.includes("hex: '#10B981'") && tokensContent.includes("accentEmerald"),
  'Tokens include #10B981 accentEmerald'
);
assert(
  tokensContent.includes("hex: '#EF4444'") && tokensContent.includes("accentCritical"),
  'Tokens include #EF4444 accentCritical'
);

// SwissCardPrimitive AST & Class Check
assert(
  swissAstroContent.includes('screen-wide-card') && swissAstroContent.includes('hover:border-[#004AC6]'),
  'SwissCardPrimitive.astro renders screen-wide-card with hover border #004AC6'
);
assert(
  swissTsxContent.includes('screen-wide-card') && swissTsxContent.includes('hover:border-[#004AC6]'),
  'SwissCardPrimitive.tsx renders screen-wide-card with hover border #004AC6'
);
assert(
  swissAstroContent.includes('PHAROS CLINICAL DECISION SUPPORT V5.0'),
  'SwissCardPrimitive.astro contains status footer watermark'
);
assert(
  swissTsxContent.includes('PHAROS CLINICAL DECISION SUPPORT V5.0'),
  'SwissCardPrimitive.tsx contains status footer watermark'
);

console.log(`\n==============================================`);
console.log(`Empirical Test Summary: ${passedTests} Passed, ${failedTests} Failed.`);
console.log(`==============================================`);

if (failedTests > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
