/**
 * run_tests.ts
 * Empirical Test Suite for UTMRouter & HyperframesScrubber Defect Verification
 * Milestone 0 Iteration 2 (Challenger M0 R2 Instance 2)
 */

import { UTMRouter, ALLOWED_ROLES, DEFAULT_ROLE, STORAGE_KEY } from '../../dashboard/src/lib/routing/UTMRouter.ts';
import { HyperframesScrubber } from '../../dashboard/src/lib/gsap/HyperframesScrubber.ts';

let passCount = 0;
let failCount = 0;
const testResults: { name: string; status: 'PASS' | 'FAIL'; error?: string } = [];

function assert(condition: boolean, testName: string, detail?: string) {
  if (condition) {
    passCount++;
    console.log(`✓ PASS: ${testName}`);
  } else {
    failCount++;
    const err = detail ? `Assertion failed: ${detail}` : `Assertion failed`;
    console.error(`✗ FAIL: ${testName} - ${err}`);
  }
}

// ---------------------------------------------------------------------------
// Setup Mock Browser Environment for DOM testing
// ---------------------------------------------------------------------------
function setupMockBrowser() {
  const localStorageStore: Record<string, string> = {};
  
  const mockLocalStorage = {
    getItem: (key: string) => localStorageStore[key] || null,
    setItem: (key: string, val: string) => { localStorageStore[key] = String(val); },
    removeItem: (key: string) => { delete localStorageStore[key]; },
    clear: () => { for (const k in localStorageStore) delete localStorageStore[k]; }
  };

  const listeners: Record<string, Function[]> = {};

  const mockWindow = {
    location: {
      href: 'http://localhost/',
      search: '',
    },
    history: {
      pushState: (state: any, title: string, url: string) => {
        mockWindow.location.href = url;
        const parsedUrl = new URL(url, 'http://localhost');
        mockWindow.location.search = parsedUrl.search;
      }
    },
    addEventListener: (event: string, cb: Function) => {
      if (!listeners[event]) listeners[event] = [];
      listeners[event].push(cb);
    },
    removeEventListener: (event: string, cb: Function) => {
      if (listeners[event]) {
        listeners[event] = listeners[event].filter(fn => fn !== cb);
      }
    },
    dispatchEvent: (event: string) => {
      if (listeners[event]) {
        listeners[event].forEach(cb => cb({}));
      }
    },
    devicePixelRatio: 1,
    localStorage: mockLocalStorage,
  };

  (global as any).window = mockWindow;
  (global as any).localStorage = mockLocalStorage;
  (global as any).document = {
    createElement: (tag: string) => {
      if (tag === 'canvas') {
        return {
          getContext: () => ({
            clearRect: () => {},
            drawImage: () => {},
            fillRect: () => {},
            fillText: () => {},
          }),
          width: 800,
          height: 450,
          style: {},
          className: '',
          parentNode: null as any,
        };
      }
      if (tag === 'video') {
        const videoObj: any = {
          src: '',
          muted: false,
          playsInline: false,
          preload: '',
          duration: 10,
          currentTime: 0,
          load: () => {},
          pause: () => {},
        };
        return videoObj;
      }
      return {
        src: '',
        complete: true,
      };
    }
  };
  (global as any).Image = function() {
    return { src: '', complete: true };
  };
  (global as any).requestAnimationFrame = (cb: Function) => setTimeout(cb, 16);
  (global as any).cancelAnimationFrame = (id: any) => clearTimeout(id);

  return { mockWindow, mockLocalStorage, listeners };
}

async function runAllTests() {
  console.log("=================================================================");
  console.log(" EMPIRICAL VERIFICATION SUITE: UTMRouter & HyperframesScrubber");
  console.log("=================================================================\n");

  // =========================================================================
  // DEFECT 1: UTMRouter.ts invalid utm_role fallback to utm_persona
  // =========================================================================
  console.log("--- Test Suite 1: UTMRouter.ts invalid utm_role fallback ---");

  // Case 1.1: Valid utm_role
  const role1 = UTMRouter.parseRoleFromUrl('http://localhost/?utm_role=patient');
  assert(role1 === 'patient', 'parseRoleFromUrl should parse valid utm_role=patient', `got ${role1}`);

  // Case 1.2: Invalid utm_role with valid utm_persona -> MUST fallback to utm_persona
  const role2 = UTMRouter.parseRoleFromUrl('http://localhost/?utm_role=invalid_role&utm_persona=nurse');
  assert(role2 === 'nurse', 'parseRoleFromUrl should fallback to utm_persona when utm_role is invalid', `got ${role2}`);

  // Case 1.3: Invalid utm_role without utm_persona -> MUST return null
  const role3 = UTMRouter.parseRoleFromUrl('http://localhost/?utm_role=bogus_role');
  assert(role3 === null, 'parseRoleFromUrl should return null when utm_role is invalid and no utm_persona', `got ${role3}`);

  // Case 1.4: Uppercase and whitespace handling
  const role4 = UTMRouter.parseRoleFromUrl('http://localhost/?utm_role=%20PATIENT%20');
  assert(role4 === 'patient', 'parseRoleFromUrl should normalize uppercase/trimmed utm_role', `got ${role4}`);

  // Case 1.5: Valid utm_persona without utm_role
  const role5 = UTMRouter.parseRoleFromUrl('http://localhost/?utm_persona=clinician');
  assert(role5 === 'clinician', 'parseRoleFromUrl should parse valid utm_persona', `got ${role5}`);

  // Case 1.6: Both invalid
  const role6 = UTMRouter.parseRoleFromUrl('http://localhost/?utm_role=foo&utm_persona=bar');
  assert(role6 === null, 'parseRoleFromUrl should return null when both utm_role and utm_persona are invalid', `got ${role6}`);


  // =========================================================================
  // DEFECT 2: UTMRouter.ts subscribe() exception isolation
  // =========================================================================
  console.log("\n--- Test Suite 2: UTMRouter.ts subscribe() exception isolation ---");

  setupMockBrowser();
  const router = new UTMRouter();

  let initialErrCaught = false;
  let unbindFn: (() => void) | null = null;

  // Case 2.1: Throwing in initial callback during subscribe()
  try {
    unbindFn = router.subscribe((role) => {
      throw new Error('Explosive subscriber callback during init');
    });
    initialErrCaught = false;
  } catch (err) {
    initialErrCaught = true;
  }

  assert(!initialErrCaught, 'subscribe() must catch and isolate exceptions thrown by listener on init');
  assert(typeof unbindFn === 'function', 'subscribe() must return a valid unbind function even if listener threw error on init');

  // Case 2.2: Exception in one listener does NOT block other listeners in notifyListeners()
  let listenerBCount = 0;
  let listenerBReceivedRole = '';

  const faultyListener = (role: string) => {
    throw new Error('Faulty listener failed on setRole update');
  };

  const workingListener = (role: string) => {
    listenerBCount++;
    listenerBReceivedRole = role;
  };

  router.subscribe(faultyListener);
  const unbindWorking = router.subscribe(workingListener);

  // Trigger role update
  router.setRole('nurse');

  assert(listenerBCount > 0, 'working listener must still be invoked despite faulty listener throwing error');
  assert(listenerBReceivedRole === 'nurse', 'working listener received correct updated role', `got ${listenerBReceivedRole}`);

  // Unbind test
  unbindWorking();
  const countBefore = listenerBCount;
  router.setRole('patient');
  assert(listenerBCount === countBefore, 'unbound listener is no longer called');


  // =========================================================================
  // DEFECT 3: UTMRouter.ts popstate root fallback
  // =========================================================================
  console.log("\n--- Test Suite 3: UTMRouter.ts popstate root fallback ---");

  const { mockWindow, mockLocalStorage } = setupMockBrowser();

  // 1. Set URL to patient
  mockWindow.location.href = 'http://localhost/?utm_role=patient';
  mockWindow.location.search = '?utm_role=patient';

  const popstateRouter = new UTMRouter();
  assert(popstateRouter.getRole() === 'patient', 'popstateRouter initialized from URL as patient');

  // Verify localStorage has patient
  assert(mockLocalStorage.getItem(STORAGE_KEY) === 'patient', 'stored patient in localStorage');

  // 2. Change URL to root without query params: http://localhost/
  mockWindow.location.href = 'http://localhost/';
  mockWindow.location.search = '';

  // Simulate popstate event (e.g. user hits back button to root page)
  mockWindow.dispatchEvent('popstate');

  // Because root URL has no query params, parseRoleFromUrl returns null.
  // handlePopState should fallback to stored role ('patient') instead of resetting to default
  assert(popstateRouter.getRole() === 'patient', 'popstate on root URL should fallback to stored role', `got ${popstateRouter.getRole()}`);

  // 3. If stored role is cleared, popstate on root URL should fallback to DEFAULT_ROLE ('clinician')
  mockLocalStorage.clear();
  // Force router currentRole to something else first to test transition
  (popstateRouter as any).currentRole = 'nurse';
  mockWindow.dispatchEvent('popstate');
  assert(popstateRouter.getRole() === DEFAULT_ROLE, 'popstate on root URL without stored role should fallback to DEFAULT_ROLE', `got ${popstateRouter.getRole()}`);


  // =========================================================================
  // DEFECT 4: HyperframesScrubber.ts NaN progress guard & range clamping
  // =========================================================================
  console.log("\n--- Test Suite 4: HyperframesScrubber.ts NaN progress & range clamping ---");

  const containerMock = {
    clientWidth: 800,
    clientHeight: 450,
    firstChild: null,
    appendChild: () => {},
    removeChild: () => {},
  } as any;

  const scrubber = new HyperframesScrubber(containerMock);

  // Case 4.1: NaN input
  scrubber.setScrollProgress(NaN);
  assert((scrubber as any).targetProgress === 0, 'setScrollProgress(NaN) sets targetProgress to 0', `got ${(scrubber as any).targetProgress}`);

  // Case 4.2: Negative progress (-0.5)
  scrubber.setScrollProgress(-0.5);
  assert((scrubber as any).targetProgress === 0, 'setScrollProgress(-0.5) clamps targetProgress to 0', `got ${(scrubber as any).targetProgress}`);

  // Case 4.3: Overflow progress (1.75)
  scrubber.setScrollProgress(1.75);
  assert((scrubber as any).targetProgress === 1, 'setScrollProgress(1.75) clamps targetProgress to 1', `got ${(scrubber as any).targetProgress}`);

  // Case 4.4: Infinity
  scrubber.setScrollProgress(Infinity);
  assert((scrubber as any).targetProgress === 1, 'setScrollProgress(Infinity) clamps targetProgress to 1', `got ${(scrubber as any).targetProgress}`);

  // Case 4.5: -Infinity
  scrubber.setScrollProgress(-Infinity);
  assert((scrubber as any).targetProgress === 0, 'setScrollProgress(-Infinity) clamps targetProgress to 0', `got ${(scrubber as any).targetProgress}`);

  // Case 4.6: Valid progress in range (0.65)
  scrubber.setScrollProgress(0.65);
  assert((scrubber as any).targetProgress === 0.65, 'setScrollProgress(0.65) sets targetProgress to 0.65', `got ${(scrubber as any).targetProgress}`);

  scrubber.destroy();


  // =========================================================================
  // DEFECT 5: HyperframesScrubber.ts async isDestroyed guard
  // =========================================================================
  console.log("\n--- Test Suite 5: HyperframesScrubber.ts async isDestroyed guard ---");

  let onReadyFired = false;
  let onFallbackFired = false;

  const asyncContainerMock = {
    clientWidth: 800,
    clientHeight: 450,
    firstChild: null,
    appendChild: () => {},
    removeChild: () => {},
  } as any;

  // Mock loadVideoWithTimeout delay
  const slowScrubber = new HyperframesScrubber(asyncContainerMock, {
    videoUrl: 'http://example.com/slow_video.mp4',
    fetchTimeoutMs: 100,
    onReady: () => { onReadyFired = true; },
    onFallback: () => { onFallbackFired = true; },
  });

  // Destroy immediately while load is in flight
  slowScrubber.destroy();
  assert((slowScrubber as any).isDestroyed === true, 'instance marked as isDestroyed');

  // Wait for fetch timeout or pending promise resolution
  await new Promise(resolve => setTimeout(resolve, 200));

  assert(!onReadyFired, 'onReady callback MUST NOT fire if instance was destroyed');
  assert(!onFallbackFired, 'onFallback callback MUST NOT fire if instance was destroyed');

  console.log("\n=================================================================");
  console.log(` SUMMARY: ${passCount} PASSED, ${failCount} FAILED out of ${passCount + failCount} tests.`);
  console.log("=================================================================\n");

  if (failCount > 0) {
    process.exit(1);
  }
}

runAllTests().catch(err => {
  console.error("Test execution fatal error:", err);
  process.exit(1);
});
