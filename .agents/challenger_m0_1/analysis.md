# Empirical & Static Challenge Analysis Report — M0 Visual Engines

**Target Engine Files:**
- `dashboard/src/lib/canvas/FluidShaderEngine.ts`
- `dashboard/src/lib/canvas/CadWireframeEngine.ts`

**Reviewer Role:** `teamwork_preview_challenger` (Empirical Challenger / Critic / Specialist)  
**Date:** 2026-08-05  

---

## 1. Executive Summary

Empirical and static code analysis was conducted on the Milestone 0 visual engines (`FluidShaderEngine.ts` and `CadWireframeEngine.ts`). While both engines implement high-quality visual shaders and 3D wireframe cylinder rendering, **critical memory leaks, missing WebGL context loss handlers, and lifecycle edge-case bugs were discovered**.

Specifically:
1. `CadWireframeEngine.ts` fails to dispose of the underlying `THREE.CylinderGeometry` (`geom`) upon `destroy()`, causing GPU memory accumulation across component mount/unmount cycles (violating WAF `COST-01`).
2. `CadWireframeEngine.ts` lacks all WebGL context loss handling (`webglcontextlost` and `webglcontextrestored`), leaving the 3D CAD engine vulnerable to tab crashes and unhandled error loops (violating WAF `REL-04` and `PROJECT.md` interface contracts).
3. `FluidShaderEngine.ts` contains a zombie re-initialization flaw in `handleContextRestored` where context restoration ignores `this.isDestroyed`, reviving GPU programs and render loops on destroyed engine instances.
4. `FluidShaderEngine.ts` leaks compiled vertex shaders if fragment shader compilation fails during initialization.

---

## 2. Detailed Findings & Challenge Scenarios

### Finding 1: `CadWireframeEngine.ts` Undisposed Geometry Memory Leak (WAF COST-01 Violation)
- **Location**: `CadWireframeEngine.ts` (Lines 60-61, 191-202)
- **Code Snippet**:
  ```typescript
  // Constructor:
  const geom = new THREE.CylinderGeometry(1.8, 1.8, 8, 24, 8, true);
  const wireframeGeom = new THREE.WireframeGeometry(geom);
  this.wireframeMesh = new THREE.LineSegments(wireframeGeom, mat);
  ```
- **Disposal in `destroy()`**:
  ```typescript
  if (this.wireframeMesh) {
    this.scene.remove(this.wireframeMesh);
    if (this.wireframeMesh.geometry) {
      this.wireframeMesh.geometry.dispose(); // Disposes wireframeGeom ONLY!
    }
    ...
  }
  ```
- **Analysis**: `new THREE.WireframeGeometry(geom)` constructs a new geometry object based on `geom`. Calling `wireframeGeom.dispose()` disposes `wireframeGeom` buffers, but `geom` (`CylinderGeometry`) remains in memory undisposed because it was never stored as a property or disposed.
- **Blast Radius**: High. Every time the CAD canvas unmounts, an orphaned `CylinderGeometry` buffer remains in Three.js geometry memory.

### Finding 2: `CadWireframeEngine.ts` Missing WebGL Context Loss Recovery (WAF REL-04 Violation)
- **Location**: `CadWireframeEngine.ts` (Entire File)
- **Analysis**: `CadWireframeEngine.ts` initializes a `THREE.WebGLRenderer`, but registers zero event listeners for `webglcontextlost` or `webglcontextrestored`.
- **Failure Scenario**:
  - When GPU context is lost (e.g. system sleep, driver reset, mobile app backgrounding), `renderer.render(this.scene, this.camera)` continues executing in `requestAnimationFrame`, spamming console errors and wasting CPU.
  - Without `e.preventDefault()`, the browser will not restore the WebGL context automatically.
  - If restored, Three.js material shader programs are invalidated, leaving a black/broken canvas.
- **Contract Violation**: `PROJECT.md` Interface Contract explicitly mandates: *"WebGL shader canvas handle with webglcontextlost and webglcontextrestored event listeners (WAF REL-04)."*

### Finding 3: `FluidShaderEngine.ts` Zombie Re-activation on Restored Context
- **Location**: `FluidShaderEngine.ts` (Lines 193-203)
- **Code Snippet**:
  ```typescript
  private handleContextRestored(e: Event): void {
    console.info('[FluidShaderEngine] WebGL context restored (WAF REL-04). Re-initializing GPU resources.');
    this.isContextLost = false;
    const success = this.initWebGL();
    if (success) {
      this.startRenderLoop();
      if (this.options.onContextRestored) {
        this.options.onContextRestored();
      }
    }
  }
  ```
- **Analysis**: `handleContextRestored` fails to check `if (this.isDestroyed) return;`.
- **Failure Scenario**: If `destroy()` is called while context is lost (e.g., page navigation during context loss), `handleContextRestored` will still execute if triggered later by browser context restoration. It re-runs `initWebGL()`, allocating new WebGL programs and buffers on a destroyed engine instance.

### Finding 4: `FluidShaderEngine.ts` Shader Leak on Partial Shader Compilation Error
- **Location**: `FluidShaderEngine.ts` (Lines 101-104, 146-158)
- **Analysis**: In `initWebGL()`, `vs` is compiled first. If `fs` fails compilation (`!fs`), `initWebGL()` immediately returns `false`. However, `vs` was already created via `gl.createShader()`. Because `vs` was not attached to `this.program`, `destroy()` cannot discover or delete `vs`, resulting in a leaked GPU shader handle.

---

## 3. Recommended Remediation Code

### Remediation for `CadWireframeEngine.ts`:

1. Store `baseCylinderGeom` on `this` (or dispose it immediately after creating `WireframeGeometry`).
2. Add WebGL context loss listeners (`webglcontextlost`, `webglcontextrestored`) to `renderer.domElement`.

```typescript
// Fix 1: Store base geometry for disposal & Add Context Loss listeners
private baseCylinderGeom: THREE.CylinderGeometry | null = null;
private boundHandleContextLost: (e: Event) => void;
private boundHandleContextRestored: (e: Event) => void;

// In constructor:
this.baseCylinderGeom = new THREE.CylinderGeometry(1.8, 1.8, 8, 24, 8, true);
const wireframeGeom = new THREE.WireframeGeometry(this.baseCylinderGeom);

this.boundHandleContextLost = (e: Event) => {
  e.preventDefault();
  this.stopRenderLoop();
};
this.boundHandleContextRestored = () => {
  if (this.isDestroyed) return;
  this.startRenderLoop();
};

this.renderer.domElement.addEventListener('webglcontextlost', this.boundHandleContextLost, false);
this.renderer.domElement.addEventListener('webglcontextrestored', this.boundHandleContextRestored, false);

// In destroy():
if (this.baseCylinderGeom) {
  this.baseCylinderGeom.dispose();
  this.baseCylinderGeom = null;
}
if (this.renderer?.domElement) {
  this.renderer.domElement.removeEventListener('webglcontextlost', this.boundHandleContextLost);
  this.renderer.domElement.removeEventListener('webglcontextrestored', this.boundHandleContextRestored);
}
```

### Remediation for `FluidShaderEngine.ts`:

1. Add `if (this.isDestroyed) return;` at top of `handleContextRestored`.
2. Clean up `vs` if `fs` compilation fails in `initWebGL()`.

```typescript
// Fix 1 in handleContextRestored:
private handleContextRestored(e: Event): void {
  if (this.isDestroyed) return;
  ...
}

// Fix 2 in initWebGL:
const vs = this.compileShader(this.gl.VERTEX_SHADER, vertexShaderSource);
const fs = this.compileShader(this.gl.FRAGMENT_SHADER, fragmentShaderSource);

if (!vs || !fs) {
  if (vs && this.gl) this.gl.deleteShader(vs);
  if (fs && this.gl) this.gl.deleteShader(fs);
  return false;
}
```

---

## 4. Conclusion & Verdict

Because `CadWireframeEngine.ts` leaks GPU geometry memory and lacks mandatory WebGL context loss handling, and `FluidShaderEngine.ts` contains zombie restoration and shader leak bugs, Milestone 0 visual engines cannot be approved in their current state.

**Verdict: REQUEST_CHANGES**
