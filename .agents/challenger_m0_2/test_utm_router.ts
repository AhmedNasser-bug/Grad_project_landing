/**
 * Empirical Test Harness for UTMRouter.ts
 * Tests:
 * 1. Fallback when window / localStorage is missing (SSR/Node)
 * 2. Missing or throwing localStorage in browser environment
 * 3. Invalid persona string handling
 * 4. Query param extraction & precedence (utm_role vs utm_persona, relative URLs)
 * 5. State synchronization, subscriber bus, popstate edge cases
 */

import { UTMRouter, ALLOWED_ROLES, DEFAULT_ROLE, STORAGE_KEY } from '../../dashboard/src/lib/routing/UTMRouter.ts';

async function runUTMRouterTests() {
  console.log('=== RUNNING EMPIRICAL TESTS FOR UTMRouter.ts ===\n');
  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string, detail?: string) {
    if (condition) {
      console.log(`[PASS] ${testName}`);
      passed++;
    } else {
      console.error(`[FAIL] ${testName} - ${detail || 'Assertion failed'}`);
      failed++;
    }
  }

  // --- TEST GROUP 1: SSR / Non-Browser Environment ---
  console.log('--- Group 1: SSR / Non-Browser Environment ---');
  try {
    const router = new UTMRouter();
    assert(router.getRole() === 'clinician', 'SSR default role is clinician', `Got ${router.getRole()}`);
    assert(UTMRouter.parseRoleFromUrl() === null, 'parseRoleFromUrl() returns null when window is undefined');
    
    // Testing parseRoleFromUrl with explicit relative/absolute URLs in SSR
    assert(UTMRouter.parseRoleFromUrl('/test?utm_role=patient') === 'patient', 'parseRoleFromUrl relative URL with utm_role');
    assert(UTMRouter.parseRoleFromUrl('http://pharos.edu/page?utm_persona=nurse') === 'nurse', 'parseRoleFromUrl absolute URL with utm_persona');
    assert(UTMRouter.parseRoleFromUrl('http://pharos.edu/page?utm_role=INVALID') === null, 'parseRoleFromUrl with invalid role returns null');
  } catch (e: any) {
    assert(false, 'SSR Environment Instantiation', e.message);
  }

  // --- TEST GROUP 2: Simulated Browser Environment with mock Window & LocalStorage ---
  console.log('\n--- Group 2: Simulated Browser Environment ---');
  
  // Create simulated window object
  const mockLocalStorage: Record<string, string> = {};
  const listeners: Record<string, Function[]> = {};

  (globalThis as any).window = {
    location: {
      href: 'http://localhost/test?utm_role=nurse',
      search: '?utm_role=nurse',
    },
    history: {
      pushState: (state: any, title: string, url: string) => {
        (globalThis as any).window.location.href = url;
        const searchIdx = url.indexOf('?');
        (globalThis as any).window.location.search = searchIdx !== -1 ? url.substring(searchIdx) : '';
      }
    },
    addEventListener: (event: string, fn: Function) => {
      listeners[event] = listeners[event] || [];
      listeners[event].push(fn);
    },
    removeEventListener: (event: string, fn: Function) => {
      if (listeners[event]) {
        listeners[event] = listeners[event].filter(f => f !== fn);
      }
    }
  };

  (globalThis as any).localStorage = {
    getItem: (key: string) => mockLocalStorage[key] || null,
    setItem: (key: string, val: string) => { mockLocalStorage[key] = val; },
    removeItem: (key: string) => { delete mockLocalStorage[key]; }
  };

  // Test URL priority during init
  try {
    const browserRouter = new UTMRouter();
    assert(browserRouter.getRole() === 'nurse', 'Browser init reads utm_role=nurse from URL', `Got ${browserRouter.getRole()}`);
    assert(mockLocalStorage[STORAGE_KEY] === 'nurse', 'Browser init persists role to localStorage', `Stored: ${mockLocalStorage[STORAGE_KEY]}`);
  } catch (e: any) {
    assert(false, 'Browser init with URL parameter', e.message);
  }

  // Test localStorage fallback when URL has no params
  console.log('\n--- Group 3: LocalStorage Fallback & Invalid Storage Handling ---');
  (globalThis as any).window.location.search = '';
  mockLocalStorage[STORAGE_KEY] = 'patient';

  try {
    const fallbackRouter = new UTMRouter();
    assert(fallbackRouter.getRole() === 'patient', 'Browser init falls back to stored role patient', `Got ${fallbackRouter.getRole()}`);
  } catch (e: any) {
    assert(false, 'LocalStorage fallback test', e.message);
  }

  // Test corrupted / invalid localStorage value
  mockLocalStorage[STORAGE_KEY] = 'hacker_role';
  try {
    const invalidStorageRouter = new UTMRouter();
    assert(invalidStorageRouter.getRole() === 'clinician', 'Browser init rejects invalid stored role hacker_role and uses DEFAULT_ROLE', `Got ${invalidStorageRouter.getRole()}`);
  } catch (e: any) {
    assert(false, 'Invalid stored role handling', e.message);
  }

  // Test localStorage throwing SecurityError / Access Error
  (globalThis as any).localStorage = {
    getItem: () => { throw new Error('SecurityError: Access is denied'); },
    setItem: () => { throw new Error('SecurityError: Access is denied'); }
  };
  try {
    const throwingStorageRouter = new UTMRouter();
    assert(throwingStorageRouter.getRole() === 'clinician', 'Handles throwing localStorage gracefully', `Got ${throwingStorageRouter.getRole()}`);
  } catch (e: any) {
    assert(false, 'Throwing localStorage handling', e.message);
  }

  // Restore working localStorage mock
  (globalThis as any).localStorage = {
    getItem: (key: string) => mockLocalStorage[key] || null,
    setItem: (key: string, val: string) => { mockLocalStorage[key] = val; },
    removeItem: (key: string) => { delete mockLocalStorage[key]; }
  };

  // --- TEST GROUP 4: Invalid Persona String Handling & Case Normalization ---
  console.log('\n--- Group 4: Invalid Persona String Handling & Normalization ---');
  assert(UTMRouter.parseRoleFromUrl('http://localhost/?utm_role=ADMIN') === null, 'Rejects invalid role ADMIN');
  assert(UTMRouter.parseRoleFromUrl('http://localhost/?utm_role=NURSE') === 'nurse', 'Normalizes upper-case NURSE to nurse');
  assert(UTMRouter.parseRoleFromUrl('http://localhost/?utm_role=%20patient%20') === 'patient', 'Trims whitespace in role');
  assert(UTMRouter.parseRoleFromUrl('http://localhost/?utm_role=12345') === null, 'Rejects numeric role string');

  // --- TEST GROUP 5: Query Parameter Extraction Precedence & Edge Cases ---
  console.log('\n--- Group 5: Precedence & Edge Cases ---');
  // utm_role vs utm_persona
  assert(UTMRouter.parseRoleFromUrl('http://localhost/?utm_persona=nurse') === 'nurse', 'Supports utm_persona parameter');
  
  // Edge Case: Invalid utm_role + valid utm_persona
  const precedenceResult = UTMRouter.parseRoleFromUrl('http://localhost/?utm_role=invalid&utm_persona=nurse');
  console.log(`[INFO] Precedence test (invalid utm_role & valid utm_persona): parsed = ${precedenceResult}`);
  if (precedenceResult === null) {
    console.warn('⚠️ EDGE CASE DISCOVERED: When utm_role is invalid ("invalid"), parseRoleFromUrl does NOT fall back to check utm_persona!');
  }

  // Edge Case: Empty utm_role string
  const emptyRoleResult = UTMRouter.parseRoleFromUrl('http://localhost/?utm_role=&utm_persona=patient');
  assert(emptyRoleResult === 'patient', 'Empty utm_role string falls back to utm_persona', `Got ${emptyRoleResult}`);

  // --- TEST GROUP 6: State Synchronization & Event Bus ---
  console.log('\n--- Group 6: State Synchronization & Event Bus ---');
  (globalThis as any).window.location.search = '';
  delete mockLocalStorage[STORAGE_KEY];

  const syncRouter = new UTMRouter();
  let subCalls: string[] = [];
  
  const unbind = syncRouter.subscribe((role) => {
    subCalls.push(role);
  });

  assert(subCalls.length === 1 && subCalls[0] === 'clinician', 'Subscriber receives immediate initial callback', `Calls: ${subCalls.join(',')}`);

  syncRouter.setRole('patient');
  assert(subCalls.length === 2 && subCalls[1] === 'patient', 'Subscriber receives updated role on setRole', `Calls: ${subCalls.join(',')}`);
  assert((globalThis as any).window.location.href.includes('utm_role=patient'), 'setRole updates window URL query parameter');
  assert(mockLocalStorage[STORAGE_KEY] === 'patient', 'setRole updates localStorage');

  unbind();
  syncRouter.setRole('nurse');
  assert(subCalls.length === 2, 'Unbound subscriber receives no further updates');

  // Listener exception robustness during setRole vs initial subscribe
  console.log('\nTesting listener exception during setRole vs subscribe...');
  let secondSubCalled = false;
  
  // Test subscribe when listener throws during initial callback
  try {
    syncRouter.subscribe(() => { throw new Error('Faulty initial listener'); });
    console.warn('⚠️ DISCOVERED: subscribe() did not throw on faulty listener!');
  } catch (e: any) {
    console.warn(`⚠️ UNHANDLED EXCEPTION IN subscribe(): Initial callback error is uncaught in subscribe(): ${e.message}`);
  }

  // Add listener that throws during setRole notification
  const faultyListener = (r: string) => {
    if (r === 'clinician') throw new Error('Faulty listener during setRole');
  };
  syncRouter.subscribe(faultyListener);
  syncRouter.subscribe(() => { secondSubCalled = true; });

  try {
    syncRouter.setRole('clinician');
    assert(secondSubCalled, 'Error in listener callback during setRole does NOT break subsequent listeners in notifyListeners');
  } catch (e: any) {
    assert(false, 'Listener error boundary in notifyListeners', e.message);
  }

  // --- TEST GROUP 7: PopState Navigation Sync Glitch ---
  console.log('\n--- Group 7: PopState Navigation Sync ---');
  (globalThis as any).window.location.href = 'http://localhost/?utm_role=patient';
  (globalThis as any).window.location.search = '?utm_role=patient';
  const popRouter = new UTMRouter();
  assert(popRouter.getRole() === 'patient', 'Router starts at patient');

  // Simulate user pressing browser BACK button to return to root URL '/' with NO search params
  (globalThis as any).window.location.href = 'http://localhost/';
  (globalThis as any).window.location.search = '';

  // Trigger popstate handler registered on window
  if (listeners['popstate']) {
    listeners['popstate'].forEach(fn => fn());
  }

  console.log(`[INFO] After popping state back to '/', popRouter.getRole() = '${popRouter.getRole()}'`);
  if (popRouter.getRole() === 'patient') {
    console.warn('⚠️ POPSTATE GLITCH DISCOVERED: When user pops state to a URL without query params (http://localhost/), UTMRouter stays stuck on old role "patient" instead of syncing!');
  } else {
    assert(popRouter.getRole() !== 'patient', 'Router synced role on popstate back to URL without query params');
  }

  // Clean up global window mock
  delete (globalThis as any).window;
  delete (globalThis as any).localStorage;

  console.log(`\n=== SUMMARY: ${passed} PASSED, ${failed} FAILED ===`);
  return { passed, failed };
}

runUTMRouterTests().catch(err => {
  console.error('Test runner fatal error:', err);
});
