# Technical Specification Mining Report: Milestone 0 (Epic 0)

**Project:** Integrated Hemodialysis Digitization & Clinical Decision Support Framework (Pharos University Graduation Project Landing Page & Proposal Portal)  
**Milestone:** Milestone 0 (Epic 0: Reusable Design System Visual Assets & Primitives)  
**Author:** `teamwork_preview_spec_miner`  
**Date:** 2026-08-05  
**Working Directory:** `D:/Study/Programming/Projects/Grad_project_landing/.agents/explorer_m0_r1_2/`  

---

## 1. Executive Summary & Architecture Context

Milestone 0 establishes the foundational, reusable visual assets and layout primitives for the Pharos University Graduation Project Landing Page Monorepo. Per the critical architecture update, the landing page is structured as an **Astro v5 monorepo** isolated inside the `dashboard/` subdirectory (with root `package.json` proxy scripts delegating execution commands like `npm run dev`, `npm run build`, and `npm run preview`).

All reusable visual assets, engines, and components defined in Epic 0 reside inside `dashboard/src/components/` and `dashboard/src/lib/`:
- `dashboard/src/components/gsap/` (Text split & ScrollTrigger parallax wrappers)
- `dashboard/src/components/canvas/` (WebGL fluid shader, Three.js CAD wireframe, Hyperframes scrubber)
- `dashboard/src/components/primitives/` (Swiss Minimalist card shells)
- `dashboard/src/lib/canvas/` (GLSL shaders, Three.js scene graphs, video scrub math)

---

## 2. Features Discovered

| # | Category | Feature | Description | Inputs | Outputs | Error Behavior | Discovered Via |
|---|----------|---------|-------------|--------|---------|----------------|----------------|
| 1 | GSAP Animation | GSAP Text Split Utilities | Headline SplitText reveal & typography morph utilities for giant headlines (`clamp(2.8rem, 5vw, 5.5rem)`) | Text string, element ref, stagger delay, ease function | Animated character/word DOM spans | Graceful fallback to un-split plain text with CSS opacity transition | Task0.1.1 (`specs/Epic0-Reusable-Design-System-Visual-Assets/Feature0.1-GSAP-Animation-Library/Task0.1.1-GSAP-Text-Split-Effects.md`) |
| 2 | GSAP Animation | ScrollTrigger Parallax Card Wrapper | Standardized 100vw x 100vh sticky card wrapper container with GSAP ScrollTrigger timeline bindings | Card children, watermark index, pin setting, scrub lag | Pinned viewport card with depth parallax stacking | Disables pinning on `prefers-reduced-motion: reduce`, falling back to vertical scrolling | Task0.1.2 (`specs/Epic0-Reusable-Design-System-Visual-Assets/Feature0.1-GSAP-Animation-Library/Task0.1.2-GSAP-ScrollTrigger-Parallax-Wrapper.md`) |
| 3 | WebGL Engine | Dialysate Fluid Shader Canvas | Full-bleed WebGL fluid dynamics background GLSL shader representing dialysate clearance | Canvas dimensions, `u_time`, `u_resolution`, `u_clearanceRate` | Real-time WebGL fluid wave canvas (`>= 60 FPS`) | Intercepts `webglcontextlost`, logs warning, displays 2D fallback badge, restores via `webglcontextrestored` (`REL-04`) | Task0.2.1 (`specs/Epic0-Reusable-Design-System-Visual-Assets/Feature0.2-WebGL-ThreeJS-Vignette-Engine/Task0.2.1-Fluid-Shader-Canvas-Module.md`) |
| 4 | Three.js Engine | Three.js CAD Wireframe Cylinder | Interactive 3D hollow-fiber dialyzer membrane cylinder model with animated particle exchange stream | Canvas element, cylinder parameters (r: 1.8, h: 8.0, seg: 24, speed: 0.006) | 3D LineSegments mesh scene with particle stream | Fallback to static 2D SVG vector representation on WebGL context failure | Task0.2.2 (`specs/Epic0-Reusable-Design-System-Visual-Assets/Feature0.2-WebGL-ThreeJS-Vignette-Engine/Task0.2.2-ThreeJS-CAD-Wireframe-Module.md`) |
| 5 | Video Scrubber | Hyperframes Video Frame Scrubber | Scroll-driven HTML5 canvas video frame scrubber for London & Seoul outbreak playback | Scroll offset progress (0.0 to 1.0), frame array / video source | Rendered canvas video frame corresponding to scroll offset | Enforces 5000ms load timeout (`REL-01`), falling back to pre-rendered static poster image | Task0.3.1 (`specs/Epic0-Reusable-Design-System-Visual-Assets/Feature0.3-Hyperframes-Video-Scrub-Engine/Task0.3.1-Video-Canvas-Scroll-Scrubber.md`) |
| 6 | Swiss Primitives | Screen-Wide Parallax Card Shell | Layout primitive with 1px razor border (`#E2E8F0` / `#004AC6`) and JetBrains Mono watermark indices | Section index (`00` to `08`), background theme (`light`/`dark`), slot content | Rendered 100vw x 100vh Swiss card container | Degrades to plain styled div container on CSS variable failure | Task0.4.1 (`specs/Epic0-Reusable-Design-System-Visual-Assets/Feature0.4-Swiss-Minimalist-Card-Primitives/Task0.4.1-Screen-Wide-Parallax-Card-Shell.md`) |

---

## 3. Edge Cases

| # | Feature | Input | Observed Behavior |
|---|---------|-------|-------------------|
| 1 | WebGL Fluid Shader | Browser GPU memory pressure or driver crash trigger | `webglcontextlost` fires on canvas element. Handler calls `e.preventDefault()`, pauses `requestAnimationFrame` loop, logs structured warning (`[WebGL] Context lost`), and presents fallback badge `"WebGL Context Resetting..."`. Upon `webglcontextrestored`, rebinds GLSL uniforms (`u_time`, `u_resolution`, `u_clearanceRate`) and resumes 60+ FPS loop (`REL-04`). |
| 2 | GSAP ScrollTrigger Parallax | Client system with `prefers-reduced-motion: reduce` enabled | GSAP ScrollTrigger query bypasses `pin: true` and opacity transforms, allowing cards to layout as standard un-pinned block cards with native vertical scrolling. |
| 3 | Three.js CAD Cylinder | Canvas component unmount or hot-module reload | `dispose()` method explicitly called on `CylinderGeometry`, `LineBasicMaterial`, particle `BufferGeometry`, and `WebGLRenderer` to free GPU memory buffers and prevent memory leaks (`COST-01`). |
| 4 | Hyperframes Video Scrubber | Network delay or 404 response on video frames (> 5000ms) | Fetch operation triggers `REL-01` 5000ms timeout threshold, logs warning, and switches canvas rendering to static fallback SVG keyframe poster image. |
| 5 | SplitText Reveal Utility | Headline text containing dynamic HTML tags or RTL Arabic text | Utility sanitizes input string, preserves text nodes while wrapping individual characters in `<span class="inline-block char">`, and applies `dir="auto"` alignment. |

---

## 4. Exact Technical Contracts Deep-Dive

### 4.1 GSAP Text Split & ScrollTrigger Parallax Card Wrapper API

#### Module Paths:
- `dashboard/src/components/gsap/TextSplit.tsx`
- `dashboard/src/components/gsap/ParallaxCardShell.tsx`

#### 1. TextSplit API Interface
```typescript
export interface TextSplitProps {
  text: string;
  as?: 'h1' | 'h2' | 'h3' | 'p' | 'span';
  className?: string;
  staggerDelay?: number; // Default: 0.02s
  duration?: number;     // Default: 1.0s
  ease?: string;         // Default: 'power3.out'
  scrollTrigger?: {
    trigger?: string | HTMLElement;
    start?: string;      // Default: 'top 80%'
    end?: string;        // Default: 'bottom 20%'
    toggleActions?: string; // Default: 'play none none reverse'
  };
}

export function splitTextReveal(
  element: HTMLElement,
  options?: Partial<TextSplitProps>
): gsap.core.Timeline;
```

#### 2. ParallaxCardShell API Interface & ScrollTrigger Bindings
```typescript
export interface ParallaxCardShellProps {
  id: string;            // e.g., 'card-hero', 'card-outbreak-01'
  index: string;         // Watermark index e.g., '00', '01'
  title?: string;
  bgVariant?: 'light' | 'dark'; // '#FFFFFF' or '#060D1A'
  pin?: boolean;         // Default: true (100vw x 100vh pinned)
  scrub?: boolean | number; // Default: 1 (smooth scrub)
  children: React.ReactNode;
  className?: string;
}
```

#### ScrollTrigger Bindings Contract:
- `trigger`: `#${id}` wrapper element
- `start`: `'top top'`
- `end`: `'+=100%'` (pins for 100vh scroll distance)
- `pin`: `true`
- `pinSpacing`: `false` (enables card-stacking depth effect)
- `scrub`: `1`

---

### 4.2 WebGL Fluid Shader GLSL Uniforms & Event Listeners

#### Module Paths:
- `dashboard/src/components/canvas/FluidShaderCanvas.tsx`
- `dashboard/src/lib/canvas/fluidShader.ts`

#### 1. GLSL Uniforms Contract
```glsl
// Fragment Shader Uniform Declarations
uniform float u_time;          // Elapsed time in seconds (continuous float)
uniform vec2  u_resolution;    // Canvas width & height in physical pixels
uniform float u_clearanceRate; // Dynamic dialysate clearance rate (0.0 to 1.0)
uniform vec3  u_primaryColor;  // #004AC6 clinical primary blue (0.0, 0.29, 0.776)
uniform vec3  u_bgColor;       // #FFFFFF (light) or #060D1A (dark)
```

#### 2. Canvas Event Listeners & WAF `REL-04` Contract
```typescript
export interface WebGLFluidShaderOptions {
  canvas: HTMLCanvasElement;
  clearanceRate?: number; // Initial clearance rate (0.0 - 1.0)
  targetFPS?: number;     // Default: 60
}

// Event Listeners:
canvas.addEventListener('webglcontextlost', (event: Event) => {
  event.preventDefault(); // MANDATORY: allows context restoration
  cancelAnimationFrame(animationFrameId);
  console.warn('[WAF REL-04] WebGL Context Lost. Pausing render loop.');
  setCanvasState('CONTEXT_LOST');
});

canvas.addEventListener('webglcontextrestored', () => {
  console.info('[WAF REL-04] WebGL Context Restored. Re-initializing GLSL program.');
  initShadersAndBuffers();
  rebindUniforms();
  setCanvasState('ACTIVE');
  startRenderLoop();
});
```

---

### 4.3 Three.js CAD Cylinder Geometry Parameters & Logic

#### Module Paths:
- `dashboard/src/components/canvas/CADWireframeCylinder.tsx`
- `dashboard/src/lib/canvas/cadCylinder.ts`

#### 1. Geometry & Scene Parameters
- `radius`: `1.8` units
- `height`: `8.0` units
- `radialSegments`: `24` segments
- `rotationSpeed`: `0.006` radians per frame
- `wireframeColor`: `#004AC6` (Clinical Blue)
- `particleCount`: `500` dialysate exchange particles

#### 2. Technical API Contract
```typescript
export interface CADCylinderConfig {
  radius: number;         // STRICT: 1.8
  height: number;         // STRICT: 8.0
  radialSegments: number; // STRICT: 24
  rotationSpeed: number;  // STRICT: 0.006 rad/frame
  particleCount?: number; // Default: 500
  color?: string;         // Default: '#004AC6'
}

export class CADCylinderScene {
  private geometry: THREE.CylinderGeometry;
  private wireframeGeometry: THREE.WireframeGeometry;
  private lineMesh: THREE.LineSegments;
  private particlesGeometry: THREE.BufferGeometry;
  private particlesMesh: THREE.Points;

  constructor(canvas: HTMLCanvasElement, config?: Partial<CADCylinderConfig>) {
    const r = config?.radius ?? 1.8;
    const h = config?.height ?? 8.0;
    const seg = config?.radialSegments ?? 24;
    const speed = config?.rotationSpeed ?? 0.006;

    this.geometry = new THREE.CylinderGeometry(r, r, h, seg);
    this.wireframeGeometry = new THREE.WireframeGeometry(this.geometry);
    const material = new THREE.LineBasicMaterial({
      color: new THREE.Color(config?.color ?? '#004AC6'),
      transparent: true,
      opacity: 0.8,
    });
    this.lineMesh = new THREE.LineSegments(this.wireframeGeometry, material);
    // ... animate Y-rotation by +0.006 rad/frame
  }

  public dispose(): void {
    this.geometry.dispose();
    this.wireframeGeometry.dispose();
    this.particlesGeometry.dispose();
    // Frees GPU resources per WAF COST-01
  }
}
```

---

### 4.4 Hyperframes Video Frame Scrubber Logic

#### Module Paths:
- `dashboard/src/components/canvas/HyperframesScrubber.tsx`
- `dashboard/src/lib/canvas/hyperframes.ts`

#### 1. Logic & Calculation Engine
- Scrubber maps scroll progress ($P \in [0.0, 1.0]$) to video time or pre-cached frame index:
  $$\text{targetTime} = P \times \text{video.duration}$$
  $$\text{frameIndex} = \lfloor P \times (\text{totalFrames} - 1) \rfloor$$
- Frame interpolation applies exponential smoothing ($0.1$ lerp factor):
  $$\text{currentFrame} \leftarrow \text{currentFrame} + (\text{targetFrame} - \text{currentFrame}) \times 0.1$$

#### 2. Technical API Contract
```typescript
export interface HyperframesScrubberProps {
  source: string;              // Video URL or frame directory pattern
  mode: 'video' | 'frames';    // HTML5 Video seek vs Canvas frame array
  frameCount?: number;         // Total frames if mode === 'frames'
  scrollTriggerId: string;     // Element triggering scroll progress
  fps?: number;                // Target FPS (default: 60)
  timeoutMs?: number;          // STRICT WAF REL-01: 5000ms
  fallbackPosterUrl?: string;  // Poster image on timeout/load error
}
```

---

## 5. Design System Tokens & WAF Guardrails Matrix

### 5.1 Clinical Vitality Design Tokens Applied
- **Surface / Canvas:** `#FFFFFF` (Clinical White) / `#F8F9FF` (Background Tint) / `#060D1A` (Shader Base)
- **Primary Brand Blue:** `#004AC6`
- **Slate Typography:** `#0B1C30` (Headers & Body), `#475569` (Muted Labels)
- **Alert Colors:** `#10B981` (Medical Success Green), `#EF4444` (Critical Alert Red)
- **Typography:** `Inter` (UI/Headlines) + `JetBrains Mono` (Telemetry values, watermark indices)

### 5.2 WAF Compliance Verification Matrix
- `SEC-01`: Zero hardcoded credentials. WebGL shader assets & Stripe keys read from `.env`.
- `REL-01`: 5000ms mandatory timeout on Hyperframes video asset fetching.
- `REL-04`: Graceful WebGL context loss recovery (`webglcontextlost` & `webglcontextrestored`).
- `PERF-02`: Non-blocking async render loops maintaining `>= 60 FPS`.
- `COST-01`: Explicit disposal of Three.js geometries, line materials, and animation frames on unmount.
