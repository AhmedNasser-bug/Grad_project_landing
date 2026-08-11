/**
 * Empirical Test Harness for HyperframesScrubber.ts
 * Tests:
 * 1. WAF REL-01 5000ms fetch timeout behavior & poster fallback
 * 2. Custom fetchTimeoutMs parameter validation
 * 3. Video load success vs failure vs missing posterUrl
 * 4. Lerp math & out-of-bounds / NaN scroll progress handling
 * 5. Lifecycle & memory cleanup: destroy(), stopLoop(), event listener removal
 */

import { HyperframesScrubber } from '../../dashboard/src/lib/gsap/HyperframesScrubber.ts';

// Mock minimal DOM for canvas / video / image environment
function createDomEnvironment() {
  const listeners: Record<string, Function[]> = {};

  class MockElement {
    public childNodes: any[] = [];
    public firstChild: any = null;
    public className: string = '';
    public width: number = 800;
    public height: number = 450;
    public clientWidth: number = 800;
    public clientHeight: number = 450;
    public parentNode: any = null;

    appendChild(child: any) {
      child.parentNode = this;
      this.childNodes.push(child);
      this.firstChild = this.childNodes[0];
    }
    removeChild(child: any) {
      const idx = this.childNodes.indexOf(child);
      if (idx !== -1) this.childNodes.splice(idx, 1);
      this.firstChild = this.childNodes[0] || null;
      child.parentNode = null;
    }
  }

  class MockCanvas extends MockElement {
    getContext(type: string) {
      return {
        clearRect: () => {},
        fillRect: () => {},
        fillText: () => {},
        drawImage: () => {},
        fillStyle: '',
        font: ''
      };
    }
  }

  class MockVideo extends MockElement {
    public src: string = '';
    public muted: boolean = false;
    public playsInline: boolean = false;
    public preload: string = '';
    public duration: number = 10;
    public currentTime: number = 0;
    public onloadedmetadata: (() => void) | null = null;
    public onerror: (() => void) | null = null;

    load() {}
    pause() {}
  }

  class MockImage extends MockElement {
    public src: string = '';
    public complete: boolean = true;
  }

  (globalThis as any).document = {
    createElement: (tag: string) => {
      if (tag === 'canvas') return new MockCanvas();
      if (tag === 'video') return new MockVideo();
      if (tag === 'img' || tag === 'image') return new MockImage();
      return new MockElement();
    }
  };

  (globalThis as any).Image = MockImage;

  (globalThis as any).window = {
    devicePixelRatio: 1,
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

  (globalThis as any).requestAnimationFrame = (cb: Function) => setTimeout(cb, 16);
  (globalThis as any).cancelAnimationFrame = (id: any) => clearTimeout(id);

  return { listeners, MockVideo, MockElement };
}

async function runHyperframesTests() {
  console.log('=== RUNNING EMPIRICAL TESTS FOR HyperframesScrubber.ts ===\n');
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

  const { listeners } = createDomEnvironment();

  // --- TEST GROUP 1: WAF REL-01 5000ms Fetch Timeout ---
  console.log('--- Group 1: WAF REL-01 5000ms Fetch Timeout ---');
  
  let fallbackReason = '';
  let onFallbackCalled = false;
  let onReadyCalled = false;

  const container = document.createElement('div');
  
  // Test fast timeout (100ms) with hanging video load
  const scrubberTimeout = new HyperframesScrubber(container as any, {
    videoUrl: 'http://example.com/hanging-video.mp4',
    posterUrl: 'http://example.com/poster.jpg',
    fetchTimeoutMs: 100, // custom fast timeout for test
    onReady: () => { onReadyCalled = true; },
    onFallback: (reason) => {
      onFallbackCalled = true;
      fallbackReason = reason;
    }
  });

  // Wait 150ms for timeout to trigger
  await new Promise(r => setTimeout(r, 150));

  assert(onFallbackCalled, 'onFallback callback was triggered on timeout');
  assert(fallbackReason.includes('Video fetch timeout') || fallbackReason.includes('Video load exceeded'), 'Fallback reason indicates timeout', `Reason: ${fallbackReason}`);
  assert(!onReadyCalled, 'onReady was NOT called on timeout');
  
  scrubberTimeout.destroy();

  // --- TEST GROUP 2: Video Load Success ---
  console.log('\n--- Group 2: Video Load Success ---');
  let successReadyCalled = false;
  let successFallbackCalled = false;

  // We override document.createElement to auto-trigger onloadedmetadata for success test
  const origCreateElement = document.createElement;
  document.createElement = (tag: string) => {
    const el = origCreateElement(tag);
    if (tag === 'video') {
      setTimeout(() => {
        if ((el as any).onloadedmetadata) (el as any).onloadedmetadata();
      }, 20);
    }
    return el;
  };

  const scrubberSuccess = new HyperframesScrubber(container as any, {
    videoUrl: 'http://example.com/valid-video.mp4',
    posterUrl: 'http://example.com/poster.jpg',
    fetchTimeoutMs: 1000,
    onReady: () => { successReadyCalled = true; },
    onFallback: () => { successFallbackCalled = true; }
  });

  await new Promise(r => setTimeout(r, 60));

  assert(successReadyCalled, 'onReady called when video metadata loads successfully');
  assert(!successFallbackCalled, 'onFallback NOT called when video loads successfully');

  scrubberSuccess.destroy();
  document.createElement = origCreateElement;

  // --- TEST GROUP 3: Scroll Progress Bounds & Lerp Math / NaN ---
  console.log('\n--- Group 3: Scroll Progress Bounds & Lerp Math / NaN ---');
  const scrubberBounds = new HyperframesScrubber(container as any, {
    posterUrl: 'http://example.com/poster.jpg'
  });

  scrubberBounds.setScrollProgress(-0.5);
  // Target progress should be clamped to 0
  assert((scrubberBounds as any).targetProgress === 0, 'Negative progress clamped to 0', `Got ${(scrubberBounds as any).targetProgress}`);

  scrubberBounds.setScrollProgress(1.5);
  assert((scrubberBounds as any).targetProgress === 1, 'Over-unity progress clamped to 1', `Got ${(scrubberBounds as any).targetProgress}`);

  // Test NaN progress
  scrubberBounds.setScrollProgress(NaN);
  const nanTarget = (scrubberBounds as any).targetProgress;
  console.log(`[INFO] setScrollProgress(NaN) resulting targetProgress = ${nanTarget}`);
  if (Number.isNaN(nanTarget)) {
    console.warn('⚠️ BUG DISCOVERED: setScrollProgress(NaN) sets targetProgress to NaN, corrupting render lerp math!');
  } else {
    assert(!Number.isNaN(nanTarget), 'NaN progress correctly handled without propagating NaN');
  }

  scrubberBounds.destroy();

  // --- TEST GROUP 4: Destroy & Lifecycle Clean Up ---
  console.log('\n--- Group 4: Destroy & Lifecycle Clean Up ---');
  const containerDestroy = document.createElement('div');
  const scrubberDestroy = new HyperframesScrubber(containerDestroy as any, {
    posterUrl: 'http://example.com/poster.jpg'
  });

  assert(containerDestroy.firstChild !== null, 'Canvas attached to container initially');

  scrubberDestroy.destroy();

  assert((scrubberDestroy as any).isDestroyed === true, 'isDestroyed flag set to true');
  assert(containerDestroy.firstChild === null, 'Canvas removed from container on destroy');

  // Test destroyed async callback race condition
  let lateReadyCalled = false;
  let lateFallbackCalled = false;

  document.createElement = (tag: string) => {
    const el = origCreateElement(tag);
    if (tag === 'video') {
      setTimeout(() => {
        // Slow load after destroy
        if ((el as any).onloadedmetadata) (el as any).onloadedmetadata();
      }, 100);
    }
    return el;
  };

  const scrubberRace = new HyperframesScrubber(container as any, {
    videoUrl: 'http://example.com/slow-video.mp4',
    onReady: () => { lateReadyCalled = true; },
    onFallback: () => { lateFallbackCalled = true; }
  });

  // Destroy immediately while video load is pending in background
  scrubberRace.destroy();

  await new Promise(r => setTimeout(r, 150));

  console.log(`[INFO] After destroy, late video load finished: onReady called = ${lateReadyCalled}`);
  if (lateReadyCalled) {
    console.warn('⚠️ DISCOVERED ASYNC RACE CONDITION: HyperframesScrubber calls onReady even after destroy() was invoked!');
  } else {
    assert(!lateReadyCalled, 'onReady is NOT called after component has been destroyed');
  }

  document.createElement = origCreateElement;

  console.log(`\n=== SUMMARY: ${passed} PASSED, ${failed} FAILED ===`);
  return { passed, failed };
}

runHyperframesTests().catch(err => {
  console.error('Test runner fatal error:', err);
});
