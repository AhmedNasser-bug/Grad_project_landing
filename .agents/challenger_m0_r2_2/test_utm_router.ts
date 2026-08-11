/**
 * Empirical Stress Test Suite for UTMRouter & Design Tokens
 * Location: D:\Study\Programming\Projects\Grad_project_landing\.agents\challenger_m0_r2_2\test_utm_router.ts
 */

import { UTMRouter, ALLOWED_ROLES, DEFAULT_ROLE, STORAGE_KEY } from '../../../dashboard/src/lib/routing/UTMRouter';
import { clinicalVitalityTokens, getCssVariableObject, getCssRootVariablesString } from '../../../dashboard/src/lib/tokens/clinicalVitalityTokens';

let passedTests = 0;
let failedTests = 0;

function assert(condition: boolean, testName: string, detail?: string) {
  if (condition) {
    console.log(`[PASS] ${testName}`);
    passedTests++;
  } else {
    console.error(`[FAIL] ${testName}${detail ? ' - ' + detail : ''}`);
    failedTests++;
  }
}

console.log('=== UTMRouter & UI Primitives Empirical Stress Test ===\n');

// --- TEST GROUP 1: UTMRouter.parseRoleFromUrl Static Method ---
console.log('--- TEST GROUP 1: URL Query Parameter Parsing ---');

assert(
  UTMRouter.parseRoleFromUrl('http://localhost/?utm_role=patient') === 'patient',
  'parseRoleFromUrl parses valid utm_role=patient'
);

assert(
  UTMRouter.parseRoleFromUrl('http://localhost/?utm_role=NURSE') === 'nurse',
  'parseRoleFromUrl normalizes uppercase utm_role=NURSE'
);

assert(
  UTMRouter.parseRoleFromUrl('http://localhost/?utm_role= clinician ') === 'clinician',
  'parseRoleFromUrl trims whitespace in utm_role'
);

assert(
  UTMRouter.parseRoleFromUrl('http://localhost/?utm_persona=nurse') === 'nurse',
  'parseRoleFromUrl parses valid utm_persona=nurse'
);

assert(
  UTMRouter.parseRoleFromUrl('http://localhost/?utm_role=invalid&utm_persona=patient') === 'patient',
  'parseRoleFromUrl falls back to utm_persona when utm_role is invalid'
);

assert(
  UTMRouter.parseRoleFromUrl('http://localhost/?utm_role=invalid&utm_persona=invalid') === null,
  'parseRoleFromUrl returns null when both utm_role and utm_persona are invalid'
);

assert(
  UTMRouter.parseRoleFromUrl('http://localhost/?foo=bar') === null,
  'parseRoleFromUrl returns null when no UTM parameters are present'
);

assert(
  UTMRouter.parseRoleFromUrl('invalid-url-string') === null,
  'parseRoleFromUrl catches malformed URL without throwing exception'
);

// --- TEST GROUP 2: SSR Mode (window is undefined) ---
console.log('\n--- TEST GROUP 2: SSR Mode Resilience (No DOM / Window) ---');

const ssrRouter = new UTMRouter();
assert(
  ssrRouter.getRole() === DEFAULT_ROLE,
  `SSR Router initializes with DEFAULT_ROLE ('${DEFAULT_ROLE}')`
);

let ssrCallbackFired = false;
const unbindSsr = ssrRouter.subscribe((role) => {
  ssrCallbackFired = true;
  assert(role === DEFAULT_ROLE, 'SSR Subscribe fires immediately with current role');
});
assert(ssrCallbackFired, 'SSR Subscribe callback executed');
unbindSsr();

// Calling setRole in SSR should not throw
let ssrSetRoleSuccess = false;
try {
  ssrRouter.setRole('nurse', false);
  assert(ssrRouter.getRole() === 'nurse', 'SSR setRole updates internal role state');
  ssrSetRoleSuccess = true;
} catch (e) {
  assert(false, 'SSR setRole threw exception', String(e));
}

// --- TEST GROUP 3: Simulated Browser Environment ---
console.log('\n--- TEST GROUP 3: Simulated Browser Environment & LocalStorage ---');

// Mock browser globals
class MockLocalStorage {
  private store: Record<string, string> = {};
  public getItem(key: string): string | null {
    return this.store[key] || null;
  }
  public setItem(key: string, value: string): void {
    this.store[key] = value;
  }
  public removeItem(key: string): void {
    delete this.store[key];
  }
  public clear(): void {
    this.store = {};
  }
}

const mockStorage = new MockLocalStorage();
const mockListeners: Record<string, Function[]> = {};

const mockWindow: any = {
  location: {
    href: 'http://localhost/?utm_role=nurse',
    search: '?utm_role=nurse',
  },
  localStorage: mockStorage,
  addEventListener: (event: string, fn: Function) => {
    mockListeners[event] = mockListeners[event] || [];
    mockListeners[event].push(fn);
  },
  history: {
    pushState: (state: any, title: string, url: string) => {
      mockWindow.location.href = url;
      mockWindow.location.search = url.includes('?') ? '?' + url.split('?')[1] : '';
    },
  },
};

(global as any).window = mockWindow;
(global as any).localStorage = mockStorage;

// Instantiate Router with mocked browser
const browserRouter = new UTMRouter();
assert(
  browserRouter.getRole() === 'nurse',
  'Browser Router initializes from URL query param ?utm_role=nurse'
);
assert(
  mockStorage.getItem(STORAGE_KEY) === 'nurse',
  'Browser Router persists initialized role to localStorage'
);

// Test setRole with URL pushState
browserRouter.setRole('patient');
assert(
  browserRouter.getRole() === 'patient',
  'setRole updates role to patient'
);
assert(
  mockStorage.getItem(STORAGE_KEY) === 'patient',
  'setRole syncs with localStorage'
);
assert(
  mockWindow.location.search === '?utm_role=patient',
  'setRole updates window.location.search via history.pushState'
);

// Test invalid role in setRole
browserRouter.setRole('invalid_hacker_role' as any);
assert(
  browserRouter.getRole() === 'patient',
  'setRole ignores invalid role and maintains existing valid state'
);

// --- TEST GROUP 4: Subscriber Exception & Edge Case Isolation ---
console.log('\n--- TEST GROUP 4: Subscriber Exception Isolation & Popstate ---');

let goodSubscriberReceived: string | null = null;
const throwingSubscriber = () => {
  throw new Error('Simulated rogue subscriber error');
};
const goodSubscriber = (role: string) => {
  goodSubscriberReceived = role;
};

// Subscribe throwing subscriber
try {
  browserRouter.subscribe(throwingSubscriber);
  assert(true, 'subscribe handles throwing subscriber initial callback without crashing');
} catch (e) {
  assert(false, 'subscribe crashed on throwing subscriber');
}

// Subscribe good subscriber
browserRouter.subscribe(goodSubscriber);

// Trigger role change to check if good subscriber receives notification despite throwing subscriber
browserRouter.setRole('clinician');
assert(
  goodSubscriberReceived === 'clinician',
  'goodSubscriber received notification after setRole, proving exception isolation among subscribers'
);

// Test popstate handling
mockWindow.location.search = '?utm_role=nurse';
if (mockListeners['popstate']) {
  mockListeners['popstate'].forEach((fn) => fn());
}
assert(
  browserRouter.getRole() === 'nurse',
  'popstate event listener correctly triggers role update'
);

// --- TEST GROUP 5: Faulty LocalStorage (e.g. Disabled Cookies / QuotaExceededError) ---
console.log('\n--- TEST GROUP 5: Storage Exception Fault Tolerance ---');

const faultyStorage = {
  getItem: () => {
    throw new Error('SecurityError: Access is denied for localStorage');
  },
  setItem: () => {
    throw new Error('QuotaExceededError: Storage full');
  },
};

(global as any).localStorage = faultyStorage;
mockWindow.location.search = '';

let faultTolerantRouter: UTMRouter | null = null;
try {
  faultTolerantRouter = new UTMRouter();
  assert(
    faultTolerantRouter.getRole() === DEFAULT_ROLE,
    'Router handles throwing localStorage during init gracefully and defaults to clinician'
  );
} catch (e) {
  assert(false, 'Router initialization crashed on faulty localStorage', String(e));
}

if (faultTolerantRouter) {
  try {
    faultTolerantRouter.setRole('patient');
    assert(
      faultTolerantRouter.getRole() === 'patient',
      'Router setRole succeeds even when localStorage.setItem throws'
    );
  } catch (e) {
    assert(false, 'setRole crashed on faulty localStorage write', String(e));
  }
}

// Cleanup global mocks
delete (global as any).window;
delete (global as any).localStorage;

// --- TEST GROUP 6: Clinical Vitality Design Tokens Verification ---
console.log('\n--- TEST GROUP 6: Clinical Vitality Design Tokens Fidelity ---');

assert(
  clinicalVitalityTokens.colors.bgCanvas.hex === '#FFFFFF',
  'bgCanvas token matches #FFFFFF'
);
assert(
  clinicalVitalityTokens.colors.bgMuted.hex === '#F8FAFC',
  'bgMuted token matches #F8FAFC'
);
assert(
  clinicalVitalityTokens.colors.accentBlue.hex === '#004AC6',
  'accentBlue token matches #004AC6'
);
assert(
  clinicalVitalityTokens.colors.textPrimary.hex === '#0B1C30',
  'textPrimary token matches #0B1C30'
);
assert(
  clinicalVitalityTokens.colors.accentEmerald.hex === '#10B981',
  'accentEmerald token matches #10B981'
);
assert(
  clinicalVitalityTokens.colors.accentCritical.hex === '#EF4444',
  'accentCritical token matches #EF4444'
);

const cssVars = getCssVariableObject();
assert(
  cssVars['--bg-canvas'] === '#FFFFFF' && cssVars['--accent-blue'] === '#004AC6',
  'getCssVariableObject generates correct CSS variable map'
);

const cssRootStr = getCssRootVariablesString();
assert(
  cssRootStr.includes('--bg-canvas: #FFFFFF;') && cssRootStr.includes('--accent-blue: #004AC6;'),
  'getCssRootVariablesString produces valid :root CSS block'
);

console.log(`\n==============================================`);
console.log(`Empirical Test Summary: ${passedTests} Passed, ${failedTests} Failed.`);
console.log(`==============================================`);

if (failedTests > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
