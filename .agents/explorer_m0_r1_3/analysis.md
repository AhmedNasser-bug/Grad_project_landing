# Epic 0 Modularization Analysis Report — Reusable Design System Visual Assets & Primitives

**Author**: `teamwork_preview_explorer`  
**Milestone**: M0 (Epic 0: Reusable Design System Visual Assets & Primitives)  
**Target Architecture**: Next.js 15 / Astro v5 Monorepo (`dashboard/src/lib/` & `src/lib/`)  
**Date**: 2026-08-05  

---

## Executive Summary

This report presents a comprehensive technical breakdown and modularization plan for transitioning the static prototype implemented in `index.html` into a modular, production-ready TypeScript/JavaScript visual engine architecture under `src/lib/`. 

The static `index.html` contains high-fidelity visual primitives including a custom **WebGL GLSL fluid backdrop shader**, a **Three.js wireframe CAD cylinder model**, a **GSAP ScrollTrigger full-viewport card stack**, and a **Swiss Medical Minimalist design system** ("Clinical Vitality"). Converting these inline logic blocks into modularized libraries ensures full reusability across Astro/React components, robust WAF compliance (context loss recovery, lifecycle memory bounds), and strict type safety.

---

## 1. Audit & Extraction of Existing Static Implementation (`index.html`)

### 1.1 Inline CSS Variables & Design System Tokens

Located at lines 23–40 of `index.html`:

```css
:root {
    --bg-canvas: #FFFFFF;
    --bg-muted: #F8FAFC;
    --bg-dark: #060D1A;
    --border-grid: #E2E8F0;
    --border-dark: #1E293B;
    --border-active: #004AC6;
    --text-primary: #0B1C30;
    --text-muted: #64748B;
    --text-light: #94A3B8;
    --accent-blue: #004AC6;
    --accent-container: #2563EB;
    --accent-teal: #006B5F;
    --accent-emerald: #10B981;
    --accent-critical: #EF4444;
    --font-sans: 'Inter', -apple-system, sans-serif;
    --font-mono: 'JetBrains Mono', monospace;
}
```

* **Observation**: The design system relies on Swiss Medical Minimalist principles: clean medical white canvas (`#FFFFFF`), dark slate canvas (`#060D1A`), high-contrast primary typography (`#0B1C30`), medical container blue (`#2563EB` / `#004AC6`), success emerald (`#10B981`), and critical incident alert red (`#EF4444`).
* **Modularization Requirement**: Export as TypeScript token objects for programmatic canvas/shader access, as well as a standalone CSS theme stylesheet / Tailwind v4 `@theme` block.

---

### 1.2 WebGL Fluid Dynamics Backdrop Shader

Located at lines 853–904 of `index.html`:

* **Canvas Selector**: `#fluid-bg-canvas`
* **Vertex Shader (`vs`)**:
  ```glsl
  attribute vec2 position;
  void main() {
      gl_Position = vec4(position, 0.0, 1.0);
  }
  ```
* **Fragment Shader (`fs`)**:
  ```glsl
  precision mediump float;
  uniform vec2 u_resolution;
  uniform float u_time;
  void main() {
      vec2 st = gl_FragCoord.xy / u_resolution.xy;
      float color = sin(st.x * 8.0 + u_time * 0.4) * 0.04 + cos(st.y * 8.0 + u_time * 0.3) * 0.04;
      vec3 col = mix(vec3(0.98, 0.98, 1.0), vec3(0.92, 0.95, 1.0), st.y + color);
      gl_FragColor = vec4(col, 1.0);
  }
  ```
* **Geometry**: Full-screen quad rendered via two triangles (`Float32Array([-1,-1, 1,-1, -1,1, -1,1, 1,-1, 1,1])`).
* **Limitations in Static Implementation**:
  - No `webglcontextlost` / `webglcontextrestored` event handling (violates WAF `REL-04`).
  - No destroy/cleanup logic for stopping `requestAnimationFrame` when unmounting.
  - Hardcoded DOM ID query (`document.getElementById('fluid-bg-canvas')`).

---

### 1.3 Three.js Fresenius 4008S CAD Cylinder Model

Located at lines 906–935 of `index.html`:

* **Container Selector**: `#three-cad-container`
* **Camera Setup**: `PerspectiveCamera(45, aspect, 0.1, 1000)` at `z = 10`.
* **Renderer**: `WebGLRenderer({ alpha: true, antialias: true })`.
* **Geometry**: `THREE.CylinderGeometry(1.8, 1.8, 8, 24, 8, true)` wrapped inside `THREE.WireframeGeometry`.
* **Material**: `THREE.LineBasicMaterial({ color: 0x2563EB, opacity: 0.7, transparent: true })`.
* **Mesh**: `THREE.LineSegments(wireframeGeom, mat)` rotated at `z = Math.PI / 4`.
* **Animation Loop**: Rotates geometry along Y-axis (`rotation.y += 0.006`) continuously.
* **Limitations in Static Implementation**:
  - No resize listener to update camera aspect ratio and renderer size when container dimensions change.
  - No disposal of geometries, materials, or WebGL renderer (violates WAF `COST-01`).
  - No fallback handling for WebGL context loss.

---

### 1.4 GSAP ScrollTrigger Screen-Wide Sticky Parallax Stack

Located at lines 937–951 of `index.html` & CSS lines 183–209:

* **CSS Sticky Card Mechanics**:
  - Container `.parallax-wrapper` holds stacked `.screen-wide-card` elements.
  - Each `.screen-wide-card` is styled with `min-height: 100vh; width: 100vw; position: sticky; top: 0;`.
  - Cards stack on top of each other as the user scrolls, creating a tactile depth effect.
* **GSAP Animation Logic**:
  ```js
  gsap.registerPlugin(ScrollTrigger);
  document.querySelectorAll('.screen-wide-card').forEach((card, i) => {
      gsap.fromTo(card.children, 
          { opacity: 0.4, y: 40 },
          {
              opacity: 1, y: 0,
              scrollTrigger: {
                  trigger: card,
                  start: "top 80%",
                  end: "top 20%",
                  scrub: 0.5
              }
          }
      );
  });
  ```
* **Limitations in Static Implementation**:
  - Hardcoded DOM query without scoping or React/Astro ref attachment.
  - Missing text splitting/morphing capabilities for giant headlines (`clamp(2.8rem, 5vw, 5.5rem)`).

---

### 1.5 Persona Switcher & State Management

Located at lines 488–492 & 953–980 of `index.html`:

* **Supported Personas**: `'clinician' | 'nurse' | 'patient'`.
* **State Updates**: Swaps `.giant-eyebrow`, `.giant-headline`, and `.giant-body` contents dynamically.
* **Limitations in Static Implementation**:
  - Does not parse URL query parameters (`?utm_role=` or `?utm_persona=`).
  - Does not persist selection to `localStorage`.
  - Purely relies on inline global function `setPersona(role)`.

---

## 2. Modular Architecture Plan (`src/lib/`)

To transform these inline components into clean, encapsulated primitives, we will organize `src/lib/` (and `dashboard/src/lib/`) into modular directories:

```
src/lib/
├── tokens/
│   └── clinicalVitalityTokens.ts     # Design tokens & color constants
├── canvas/
│   ├── FluidShaderEngine.ts          # WebGL fluid dynamics backdrop engine
│   └── CadWireframeEngine.ts         # Three.js 3D CAD dialyzer cylinder engine
├── gsap/
│   ├── ParallaxCardScrollTrigger.ts  # 100vw x 100vh sticky parallax card controller
│   ├── TextSplitUtil.ts              # GSAP text split & reveal utilities
│   └── HyperframesScrubber.ts        # Video scroll scrubbing engine
├── routing/
│   └── UTMRouter.ts                  # Persona state management & URL/localStorage sync
├── primitives/
│   ├── SwissCardPrimitive.tsx        # Reusable Swiss card container primitive
│   └── ModalPrimitive.tsx            # Reusable Swiss modal container primitive
```

---

### Module Breakdown & Technical Contracts

#### Module 1: `src/lib/tokens/clinicalVitalityTokens.ts`
* **Purpose**: Single source of truth for color palette, fonts, and layout breakpoints.
* **Interface**:
  ```typescript
  export const CLINICAL_TOKENS = {
    colors: {
      bgCanvas: '#FFFFFF',
      bgMuted: '#F8FAFC',
      bgDark: '#060D1A',
      borderGrid: '#E2E8F0',
      borderDark: '#1E293B',
      borderActive: '#004AC6',
      textPrimary: '#0B1C30',
      textMuted: '#64748B',
      textLight: '#94A3B8',
      accentBlue: '#004AC6',
      accentContainer: '#2563EB',
      accentTeal: '#006B5F',
      accentEmerald: '#10B981',
      accentCritical: '#EF4444',
    },
    fonts: {
      sans: "'Inter', -apple-system, sans-serif",
      mono: "'JetBrains Mono', monospace",
    }
  } as const;
  ```

---

#### Module 2: `src/lib/canvas/FluidShaderEngine.ts`
* **Purpose**: Encapsulate WebGL fluid shader rendering with full lifecycle hooks and context loss recovery.
* **Class Definition**:
  ```typescript
  export interface FluidShaderOptions {
    canvas: HTMLCanvasElement;
    speed?: number;
    opacity?: number;
  }

  export class FluidShaderEngine {
    private canvas: HTMLCanvasElement;
    private gl: WebGLRenderingContext | null = null;
    private animFrameId: number | null = null;
    private isContextLost = false;

    constructor(options: FluidShaderOptions) { ... }
    public init(): void { ... }
    private setupShaders(): void { ... }
    private bindEvents(): void { ... }
    private handleContextLost(e: Event): void { e.preventDefault(); this.isContextLost = true; }
    private handleContextRestored(): void { this.isContextLost = false; this.init(); }
    public render(time: number): void { ... }
    public destroy(): void {
      if (this.animFrameId) cancelAnimationFrame(this.animFrameId);
    }
  }
  ```

---

#### Module 3: `src/lib/canvas/CadWireframeEngine.ts`
* **Purpose**: Encapsulate Three.js 3D CAD wireframe cylinder model with automatic resize handling and resource disposal.
* **Class Definition**:
  ```typescript
  export interface CadEngineOptions {
    container: HTMLElement;
    color?: number;
    rotationSpeed?: number;
  }

  export class CadWireframeEngine {
    private container: HTMLElement;
    private scene: THREE.Scene | null = null;
    private camera: THREE.PerspectiveCamera | null = null;
    private renderer: THREE.WebGLRenderer | null = null;
    private wireframeMesh: THREE.LineSegments | null = null;
    private animFrameId: number | null = null;
    private resizeObserver: ResizeObserver | null = null;

    constructor(options: CadEngineOptions) { ... }
    public init(): void { ... }
    public resize(): void { ... }
    public animate(): void { ... }
    public destroy(): void {
      if (this.animFrameId) cancelAnimationFrame(this.animFrameId);
      if (this.resizeObserver) this.resizeObserver.disconnect();
      // Dispose geometry, material, renderer DOM element
    }
  }
  ```

---

#### Module 4: `src/lib/gsap/ParallaxCardScrollTrigger.ts`
* **Purpose**: Initialize GSAP ScrollTrigger animations for sticky parallax cards.
* **Function API**:
  ```typescript
  export interface ParallaxOptions {
    cardsSelector?: string;
    scrubSpeed?: number;
    startOffset?: string;
    endOffset?: string;
  }

  export function initParallaxCards(options?: ParallaxOptions): () => void {
    // Registers plugin, initializes timeline batching
    // Returns cleanup function calling ScrollTrigger.getAll().forEach(t => t.kill())
  }
  ```

---

#### Module 5: `src/lib/gsap/TextSplitUtil.ts`
* **Purpose**: Splitting headlines into characters/words for GSAP entrance and morph animations.
* **Function API**:
  ```typescript
  export function animateTextReveal(target: HTMLElement | string, delay?: number): void {
    // Spans words/chars and runs GSAP stagger animation
  }
  ```

---

#### Module 6: `src/lib/gsap/HyperframesScrubber.ts`
* **Purpose**: Scroll-bound HTML5 video / canvas frame scrubbing engine.
* **Class Definition**:
  ```typescript
  export class HyperframesScrubber {
    constructor(videoElement: HTMLVideoElement, triggerElement: HTMLElement) { ... }
    public init(): void { ... }
    public destroy(): void { ... }
  }
  ```

---

#### Module 7: `src/lib/routing/UTMRouter.ts`
* **Purpose**: Dynamic UTM persona extractor & state sync.
* **Class Definition**:
  ```typescript
  export type PersonaRole = 'clinician' | 'nurse' | 'patient';

  export class UTMRouter {
    private currentPersona: PersonaRole = 'clinician';
    private listeners: Array<(role: PersonaRole) => void> = [];

    public init(): PersonaRole {
      // 1. Check URL search params (?utm_role= || ?utm_persona=)
      // 2. Fall back to localStorage ('pharos_utm_role')
      // 3. Fall back to default ('clinician')
    }

    public setPersona(role: PersonaRole): void {
      // Update state, save to localStorage, push/replace state in URL, notify listeners
    }

    public subscribe(listener: (role: PersonaRole) => void): () => void { ... }
  }
  ```

---

## 3. WAF & Code Quality Compliance Mapping

| WAF Rule | Description | Implementation Strategy in `src/lib/` |
|---|---|---|
| **SEC-01** | Zero Hardcoded Credentials | No secrets embedded in canvas, GSAP, or UTMRouter modules. Configuration injected via props or env vars. |
| **REL-04** | WebGL Context Loss Handling | `FluidShaderEngine` and `CadWireframeEngine` listen to `webglcontextlost` (calling `preventDefault()`) and `webglcontextrestored` to re-initialize shaders without crashing the page. |
| **COST-01** | Resource Lifecycle & Tear Down | All canvas and GSAP modules expose explicit `.destroy()` / cleanup methods that disconnect ResizeObservers, cancel `requestAnimationFrame`, dispose THREE geometries/materials/renderers, and kill GSAP ScrollTriggers. |
| **Monorepo Proxy** | Astro v5 Isolation | Target files created in `dashboard/src/lib/` (and mirrored in `src/lib/`) for seamless Astro 7 monorepo compilation. |

---

## 4. Handoff & Implementation Sequence

1. **Step 1 (Milestone 0 - Implementers)**: Implement `clinicalVitalityTokens.ts` and token CSS styles.
2. **Step 2**: Implement `FluidShaderEngine.ts` and `CadWireframeEngine.ts` with context loss event handling.
3. **Step 3**: Implement `ParallaxCardScrollTrigger.ts`, `TextSplitUtil.ts`, and `HyperframesScrubber.ts`.
4. **Step 4**: Implement `UTMRouter.ts`.
5. **Step 5**: Integrate primitives into Astro/React components in `dashboard/src/components/` and `dashboard/src/pages/index.astro`.

---
*Report compiled by `teamwork_preview_explorer` (Milestone 0 / Epic 0)*
