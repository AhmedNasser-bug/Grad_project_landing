# Handoff Report — Challenger M0 Visual Engines Stress-Test

**Role:** `teamwork_preview_challenger` (Empirical Challenger / Critic / Specialist)  
**Target Files:**
- `dashboard/src/lib/canvas/FluidShaderEngine.ts`
- `dashboard/src/lib/canvas/CadWireframeEngine.ts`  
**Working Directory:** `D:/Study/Programming/Projects/Grad_project_landing/.agents/challenger_m0_1/`  
**Handoff Type:** Hard Handoff (Task Complete)  

---

## 1. Observation

Direct code inspection of the visual engine implementations revealed the following exact lines and behaviors:

1. **Undisposed Geometry in `CadWireframeEngine.ts` (`lines 60-61, 191-202`)**:
   - `const geom = new THREE.CylinderGeometry(1.8, 1.8, 8, 24, 8, true);`
   - `const wireframeGeom = new THREE.WireframeGeometry(geom);`
   - `destroy()` calls `this.wireframeMesh.geometry.dispose()`, which disposes `wireframeGeom` ONLY.
   - `geom` (`THREE.CylinderGeometry`) is created as an unreferenced local variable in constructor, so `geom.dispose()` is NEVER called.

2. **Missing WebGL Context Loss Handlers in `CadWireframeEngine.ts` (`entire file`)**:
   - `CadWireframeEngine.ts` initializes `THREE.WebGLRenderer` but attaches zero event listeners for `webglcontextlost` or `webglcontextrestored`.
   - `PROJECT.md` Interface Contract explicitly mandates: *"WebGL shader canvas handle with webglcontextlost and webglcontextrestored event listeners (WAF REL-04)."*

3. **Zombie Re-activation in `FluidShaderEngine.ts` (`lines 193-203`)**:
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
   `handleContextRestored` lacks `if (this.isDestroyed) return;`, allowing context restoration events to re-initialize WebGL programs and restart render loops on destroyed engine instances.

4. **Shader Handle Leak on Compile Error in `FluidShaderEngine.ts` (`lines 101-104`)**:
   ```typescript
   const vs = this.compileShader(this.gl.VERTEX_SHADER, vertexShaderSource);
   const fs = this.compileShader(this.gl.FRAGMENT_SHADER, fragmentShaderSource);

   if (!vs || !fs) return false;
   ```
   If `vs` compiles but `fs` fails, `initWebGL()` returns `false` without calling `gl.deleteShader(vs)`. Because `vs` was not attached to `this.program`, `destroy()` cannot find or delete it.

---

## 2. Logic Chain

1. **Step 1 (Geometry Memory Leak Trace)**: Observation 1 shows `geom` (`CylinderGeometry`) is instantiated in `CadWireframeEngine`'s constructor and passed to `WireframeGeometry`. `WireframeGeometry` creates its own attributes, but `geom` retains internal typed array buffers. Because `geom` is not saved on `this` or disposed in `destroy()`, every instance destruction leaves `geom` undisposed in GPU memory. This violates WAF `COST-01` (Explicit Resource Disposal).
2. **Step 2 (Context Loss Resilience Deficit)**: Observation 2 shows `CadWireframeEngine` has zero listeners for `webglcontextlost` or `webglcontextrestored`. When WebGL context is lost, `renderer.render()` in `requestAnimationFrame` continues invoking GPU draw calls on a lost context, spamming error logs, preventing browser default context recovery (`e.preventDefault()` absent), and violating WAF `REL-04` and `PROJECT.md` contracts.
3. **Step 3 (Zombie Engine Resurrect Pattern)**: Observation 3 shows `FluidShaderEngine`'s `handleContextRestored` handler does not check `this.isDestroyed`. If a component unmounts while WebGL context is lost, and the browser subsequently restores context, `handleContextRestored` runs `initWebGL()`, leaking GPU buffers and re-triggering callbacks on a destroyed engine instance.
4. **Step 4 (Partial Shader Leak)**: Observation 4 demonstrates that a failed fragment shader compilation leaves an orphaned vertex shader allocated in WebGL memory.

---

## 3. Caveats

- Functional rendering in normal conditions (without WebGL context loss or repeated component unmounting) operates visually as expected.
- Remediation code for all 4 issues has been fully designed and documented in `analysis.md`.

---

## 4. Conclusion

Milestone 0 visual engines (`FluidShaderEngine.ts` and `CadWireframeEngine.ts`) contain 2 critical WAF non-conformances (undisposed geometry memory leak and missing WebGL context loss handling) and 2 edge-case lifecycle bugs. Changes must be requested before merging or proceeding to downstream card integrations.

---

## 5. Verification Method

1. **Inspect Analysis Report**:
   - `D:/Study/Programming/Projects/Grad_project_landing/.agents/challenger_m0_1/analysis.md`
2. **Inspect Engine Files**:
   - `dashboard/src/lib/canvas/CadWireframeEngine.ts`: Confirm missing `geom.dispose()` and absent `webglcontextlost` listeners.
   - `dashboard/src/lib/canvas/FluidShaderEngine.ts`: Confirm missing `this.isDestroyed` check in `handleContextRestored`.
3. **Invalidation Condition**:
   - If `CadWireframeEngine.ts` is updated to store and dispose `geom` and implement `webglcontextlost`/`webglcontextrestored` listeners, and `FluidShaderEngine.ts` is updated to check `this.isDestroyed` in `handleContextRestored` and clean up `vs` on compile error, the verdict flips to `APPROVE`.

---

Verdict: REQUEST_CHANGES
