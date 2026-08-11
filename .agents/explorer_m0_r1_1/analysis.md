# Discovery Phase Analysis Report: Epic 0 Reusable Visual Assets & Primitives

**Author**: `teamwork_preview_explorer`  
**Milestone**: Milestone 0 (Epic 0: Reusable Design System Visual Assets & Primitives)  
**Target Codebase Directory**: `D:/Study/Programming/Projects/Grad_project_landing/dashboard/src/`  
**Date**: 2026-08-05  

---

## 1. Executive Summary & Architectural Context

The landing page portal for the **Pharos University Hemodialysis Digitization & Clinical Decision Support Framework** is architected as an **Astro v5 monorepo** located within the `dashboard/` subdirectory of the project workspace. Execution is driven via root `package.json` proxy scripts (`npm run dev --prefix dashboard`, `npm run build --prefix dashboard`).

The primary objective of **Epic 0** is to establish a foundational, reusable visual component engine before full feature card assembly occurs in subsequent milestones (M1–M8). This analysis presents the Discovery Phase research, technical design patterns, WAF compliance mechanisms, and concrete code blueprints across five primary visual primitives and one design primitive shell.

---

## 2. Component Pattern & Grounding Research Analysis

### Feature 0.1: GSAP Animation Library & Text Split Utilities

#### Task 0.1.1: GSAP Text Split & Morph Utilities (`dashboard/src/lib/gsap/textSplit.ts`)
- **Clinical & Visual Objective**: Render headline typography (`clamp(2.8rem, 5vw, 5.5rem)`) with staggered character/word entry reveals and persona-driven morph transitions when switching between `clinician`, `nurse`, and `patient` UTM parameters.
- **Pattern Formulation**:
  - Since standard GSAP SplitText is a paid commercial plugin, we engineer an open-source DOM splitter utility `splitTextToSpans(element: HTMLElement, mode: 'chars' | 'words' | 'lines')`.
  - Wrapping tokens into `<span class="split-char inline-block opacity-0 translate-y-4">` enables hardware-accelerated CSS transforms.
  - GSAP Staggered Reveal: `gsap.fromTo(spans, { opacity: 0, y: 30, rotateX: -30 }, { opacity: 1, y: 0, rotateX: 0, duration: 0.7, stagger: 0.025, ease: "power3.out" })`.
  - Persona Morphing: `morphHeadlineText(element: HTMLElement, newText: string)` animates current split spans out (`y: -20, opacity: 0`), updates DOM text content, re-splits, and animates new spans in (`y: 20 -> 0, opacity: 0 -> 1`).
- **WAF Compliance**: Checks element presence before execution; calls `gsap.killTweensOf(spans)` before DOM teardown to prevent memory leaks (`COST-01`).

#### Task 0.1.2: GSAP ScrollTrigger Sticky Parallax Card Wrappers (`dashboard/src/lib/gsap/parallaxWrapper.ts`)
- **Clinical & Visual Objective**: Create 100vw x 100vh full-viewport sticky card stacking with smooth depth scaling, blur interpolation, and parallax content movement as users scroll through cards `00` to `08`.
- **Pattern Formulation**:
  - CSS Foundation: Sections formatted with `position: sticky; top: 0; min-height: 100vh; width: 100vw; overflow: hidden;`.
  - GSAP ScrollTrigger Binding:
    ```typescript
    import { gsap } from 'gsap';
    import { ScrollTrigger } from 'gsap/ScrollTrigger';

    gsap.registerPlugin(ScrollTrigger);

    export function initParallaxStack(cards: HTMLElement[]): () => void {
      const triggers: ScrollTrigger[] = [];

      cards.forEach((card, i) => {
        const nextCard = cards[i + 1];
        if (nextCard) {
          const st = ScrollTrigger.create({
            trigger: nextCard,
            start: "top bottom",
            end: "top top",
            scrub: true,
            onUpdate: (self) => {
              const progress = self.progress;
              const scale = 1 - progress * 0.08;
              const opacity = 1 - progress * 0.5;
              const blur = progress * 6;
              gsap.set(card, {
                scale,
                opacity,
                filter: `blur(${blur}px)`,
                transformOrigin: "center center"
              });
            }
          });
          triggers.push(st);
        }
      });

      return () => {
        triggers.forEach((st) => st.kill());
      };
    }
    ```
- **WAF Compliance**: Provides an explicit cleanup function returned from `initParallaxStack` to prevent dangling ScrollTrigger instances during client-side page navigation (`REL-06`, `COST-01`).

---

### Feature 0.2: WebGL & Three.js Vignette Engine

#### Task 0.2.1: Full-Bleed WebGL Dialysate Fluid Shader Canvas (`dashboard/src/lib/canvas/fluidShader.ts`)
- **Clinical & Visual Objective**: Render a dynamic 60+ FPS full-bleed background GLSL shader canvas simulating dialysate clearance fluid flow, ionic particulate exchange (calcium/urea diffusion), and subtle caustic wave refractions.
- **WAF REL-04 Context Loss Recovery Standard**:
  WebGL contexts on mobile devices or high-GPU load environments can experience context loss (`webglcontextlost`). The shader engine must register listeners, halt animation loops, prevent browser crashes, and seamlessly re-create shaders and buffers upon `webglcontextrestored`.
- **GLSL Shader Architecture**:
  - Vertex Shader: Pass normalized quad coordinates (`[-1, -1]` to `[1, 1]`).
  - Fragment Shader: Simulates fluid density field using sin/cos wave superposition and persona-aware color tinting (`u_persona`: Clinician deep blue `#004AC6`, Nurse cyan `#0284C7`, Patient serene emerald `#059669`).
- **GPU Cleanup Pattern**:
  ```typescript
  export class DialysateFluidShader {
    private canvas: HTMLCanvasElement;
    private gl: WebGLRenderingContext | null = null;
    private animId: number | null = null;

    constructor(canvas: HTMLCanvasElement) {
      this.canvas = canvas;
      this.init();
    }

    private init(): void {
      this.gl = this.canvas.getContext('webgl', { alpha: true, antialias: false, powerPreference: 'low-power' });
      if (!this.gl) return;

      this.canvas.addEventListener('webglcontextlost', this.onContextLost, false);
      this.canvas.addEventListener('webglcontextrestored', this.onContextRestored, false);
      
      this.setupShaders();
      this.startLoop();
    }

    private onContextLost = (e: Event): void => {
      e.preventDefault();
      if (this.animId !== null) cancelAnimationFrame(this.animId);
      console.warn('[WebGL] Context lost. Suspended fluid shader loop.');
    };

    private onContextRestored = (): void => {
      console.info('[WebGL] Context restored. Re-building shader pipeline.');
      this.init();
    };

    public dispose(): void {
      if (this.animId !== null) cancelAnimationFrame(this.animId);
      this.canvas.removeEventListener('webglcontextlost', this.onContextLost);
      this.canvas.removeEventListener('webglcontextrestored', this.onContextRestored);
      if (this.gl) {
        const loseCtx = this.gl.getExtension('WEBGL_lose_context');
        if (loseCtx) loseCtx.loseContext();
      }
    }
  }
  ```

#### Task 0.2.2: Three.js CAD Wireframe Cylinder Model (`dashboard/src/lib/canvas/cadWireframe.ts`)
- **Clinical & Visual Objective**: Render a transparent 3D dialyzer cartridge CAD wireframe model with inner hollow-fiber capillary tubes (`THREE.LineSegments`) and animated counter-current particle flows (red blood cells inside capillaries, blue dialysate in outer jacket).
- **Pattern Formulation**:
  - Outer Shell: `THREE.CylinderGeometry(2, 2, 8, 32, 8, true)` exported as `THREE.WireframeGeometry` or `THREE.LineSegments` with `#004AC6` primary blue line material.
  - Inner Capillaries: Loop generating 60–100 thin vertical cylinder lines inside the cartridge core.
  - Particle Exchange Animation: `THREE.Points` with custom buffer attributes moving downwards (blood flow) and upwards (dialysate fluid flow).
- **WAF Compliance**: Full disposal of geometry, material textures, materials, and renderer context on teardown (`geometry.dispose()`, `material.dispose()`, `renderer.dispose()`).

---

### Feature 0.3: Hyperframes Video Scrub Engine

#### Task 0.3.1: Video Canvas Scroll Scrubber (`dashboard/src/lib/canvas/videoScrubber.ts`)
- **Clinical & Visual Objective**: Implement a high-performance video scroll scrubber that syncs canvas frame rendering to page scroll progress for future clinical video demonstrations (e.g. blood line installation, air bubble trap assembly).
- **Pattern Formulation**:
  - Connects GSAP ScrollTrigger scroll position to target frame time (`video.currentTime = targetTime`).
  - Throttles video seek requests using `requestAnimationFrame` to avoid HTML5 media engine decoder lockup.
  - Fallback Mode: If video source fails or is absent, renders a procedural 2D canvas animation of a dialyzer pump roller with pulsating telemetry metrics (`P_art = -140 mmHg`, `Q_b = 350 mL/min`).
- **WAF Compliance**: Prevents memory leaks by revoking object URLs and detaching scroll listeners upon unmounting (`COST-01`).

---

### Feature 0.4: Swiss Minimalist Card Primitives

#### Task 0.4.1: Screen-Wide Parallax Card Shell (`dashboard/src/components/primitives/ParallaxCardShell.astro`)
- **Design System Tokens (Stitch Project 503366360860058565 - Clinical Vitality)**:
  - Background Canvas: Light `#FFFFFF` (`var(--bg-canvas)`), Dark `#060D1A` (`var(--bg-dark)`).
  - Borders: 1px razor-thin solid (`border-slate-200` light / `border-slate-800` dark).
  - Typography: `Inter` for headlines & copy, `JetBrains Mono` for watermark indices (`00`, `01`, `04`, `07`, `08`) and telemetry tags.
  - Watermark layout: Positioned absolute top-right with `user-select: none`, low opacity (`0.03`).
- **Component Interface**:
  ```astro
  ---
  interface Props {
    id: string;
    index: string;
    theme?: 'light' | 'dark';
    eyebrow?: string;
    headline?: string;
    class?: string;
  }

  const { id, index, theme = 'light', eyebrow, headline, class: className = '' } = Astro.props;
  ---

  <section id={id} class={`screen-wide-card ${theme === 'dark' ? 'dark-theme' : ''} ${className}`}>
    <div class="card-watermark">{index}</div>
    <div class="card-content-container">
      {eyebrow && <div class="giant-eyebrow">{eyebrow}</div>}
      {headline && <h2 class="giant-headline">{headline}</h2>}
      <slot />
    </div>
  </section>
  ```

---

## 3. Directory Layout & Module Structure

All reusable visual modules and primitives must be placed within `dashboard/src/` as follows:

```
dashboard/src/
├── components/
│   └── primitives/
│       ├── ParallaxCardShell.astro      # Swiss minimalist 100vw x 100vh card shell
│       └── ParallaxCardContainer.astro  # Sticky parallax scroll container wrapper
├── lib/
│   ├── canvas/
│   │   ├── fluidShader.ts               # WebGL GLSL dialysate clearance fluid shader + WAF REL-04 recovery
│   │   ├── cadWireframe.ts              # Three.js 3D dialyzer CAD wireframe model
│   │   └── videoScrubber.ts             # Hyperframes scroll-driven video scrubber + fallback
│   └── gsap/
│       ├── textSplit.ts                 # GSAP text split reveal & persona morph utilities
│       └── parallaxWrapper.ts           # GSAP ScrollTrigger card stack & scale timeline bindings
└── pages/
    └── index.astro                      # Astro main landing page importing Epic 0 primitives
```

---

## 4. Verification Protocol

1. **Type Safety & Build Verification**:
   Execute `npm run build` from the project root (which proxies to `dashboard/`). Verify zero TypeScript or Astro compiler errors.
2. **WebGL Context Loss Invalidation Test**:
   Simulate WebGL context loss in Chrome DevTools (`WEBGL_lose_context` extension or console `canvas.getContext('webgl').getExtension('WEBGL_lose_context').forceLoseContext()`) and verify graceful degradation and automatic restoration upon `forceRestoreContext()`.
3. **Performance Audit**:
   Verify full-bleed WebGL fluid shader maintains strictly `>= 60 FPS` on desktop viewports.

---
