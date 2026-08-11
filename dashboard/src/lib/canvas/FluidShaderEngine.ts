/**
 * FluidShaderEngine.ts
 * WebGL Fluid Dynamics GLSL Shader Engine representing Dialysate Clearance
 * Adheres to WAF REL-04 (WebGL Context Loss Recovery) & COST-01 (GPU Resource Clean-up)
 */

export interface FluidShaderOptions {
  clearanceRate?: number; // 0.0 to 1.0
  targetFps?: number; // default 60
  onContextLost?: () => void;
  onContextRestored?: () => void;
}

export class FluidShaderEngine {
  private canvas: HTMLCanvasElement;
  private gl: WebGLRenderingContext | null = null;
  private program: WebGLProgram | null = null;
  private positionBuffer: WebGLBuffer | null = null;
  private animationFrameId: number | null = null;
  private startTime: number = Date.now();
  private isDestroyed: boolean = false;
  private isContextLost: boolean = false;
  private clearanceRate: number = 0.85;

  private uTimeLoc: WebGLUniformLocation | null = null;
  private uResolutionLoc: WebGLUniformLocation | null = null;
  private uClearanceRateLoc: WebGLUniformLocation | null = null;
  private aPositionLoc: number = -1;

  private boundHandleContextLost: (e: Event) => void;
  private boundHandleContextRestored: (e: Event) => void;
  private boundHandleResize: () => void;

  private options: FluidShaderOptions;

  constructor(canvas: HTMLCanvasElement, options: FluidShaderOptions = {}) {
    this.canvas = canvas;
    this.options = options;
    this.clearanceRate = options.clearanceRate ?? 0.85;

    this.boundHandleContextLost = this.handleContextLost.bind(this);
    this.boundHandleContextRestored = this.handleContextRestored.bind(this);
    this.boundHandleResize = this.handleResize.bind(this);

    this.initWebGL();
    this.addEventListeners();
    this.startRenderLoop();
  }

  private initWebGL(): boolean {
    this.gl = this.canvas.getContext('webgl', {
      alpha: false,
      depth: false,
      stencil: false,
      antialias: true,
      powerPreference: 'high-performance',
      preserveDrawingBuffer: false,
    });

    if (!this.gl) {
      console.warn('[FluidShaderEngine] WebGL context not available');
      return false;
    }

    const vertexShaderSource = `
      attribute vec2 a_position;
      void main() {
        gl_Position = vec4(a_position, 0.0, 1.0);
      }
    `;

    const fragmentShaderSource = `
      precision mediump float;
      uniform vec2 u_resolution;
      uniform float u_time;
      uniform float u_clearanceRate;

      void main() {
        vec2 st = gl_FragCoord.xy / u_resolution.xy;
        float rateFactor = clamp(u_clearanceRate, 0.1, 1.0);
        
        // Fluid dialysate clearance wave dynamics
        float wave1 = sin(st.x * 10.0 + u_time * 0.4 * rateFactor) * 0.05;
        float wave2 = cos(st.y * 12.0 + u_time * 0.3 * rateFactor) * 0.05;
        float wave3 = sin((st.x + st.y) * 8.0 + u_time * 0.5) * 0.03;
        
        float combinedWave = wave1 + wave2 + wave3;
        
        // Color gradient from medical white/slate (#F8FAFC) to dialysate blue (#004AC6 / #E0E7FF)
        vec3 baseWhite = vec3(0.97, 0.98, 1.0);
        vec3 dialysateBlue = vec3(0.85, 0.91, 1.0);
        vec3 activeClearanceTeal = vec3(0.0, 0.42, 0.78);
        
        vec3 col = mix(baseWhite, dialysateBlue, st.y + combinedWave);
        col = mix(col, activeClearanceTeal * 0.15, combinedWave * rateFactor + 0.02);
        
        gl_FragColor = vec4(col, 1.0);
      }
    `;

    const vs = this.compileShader(this.gl.VERTEX_SHADER, vertexShaderSource);
    const fs = this.compileShader(this.gl.FRAGMENT_SHADER, fragmentShaderSource);

    if (!vs || !fs) {
      if (vs && this.gl) this.gl.deleteShader(vs);
      if (fs && this.gl) this.gl.deleteShader(fs);
      return false;
    }

    this.program = this.gl.createProgram();
    if (!this.program) return false;

    this.gl.attachShader(this.program, vs);
    this.gl.attachShader(this.program, fs);
    this.gl.linkProgram(this.program);

    if (!this.gl.getProgramParameter(this.program, this.gl.LINK_STATUS)) {
      console.error('[FluidShaderEngine] Program link error:', this.gl.getProgramInfoLog(this.program));
      return false;
    }

    this.gl.useProgram(this.program);

    this.uTimeLoc = this.gl.getUniformLocation(this.program, 'u_time');
    this.uResolutionLoc = this.gl.getUniformLocation(this.program, 'u_resolution');
    this.uClearanceRateLoc = this.gl.getUniformLocation(this.program, 'u_clearanceRate');
    this.aPositionLoc = this.gl.getAttribLocation(this.program, 'a_position');

    // Create full-bleed screen quad buffer [-1, -1] to [1, 1]
    const positions = new Float32Array([
      -1, -1,
       1, -1,
      -1,  1,
      -1,  1,
       1, -1,
       1,  1,
    ]);

    this.positionBuffer = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.positionBuffer);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, positions, this.gl.STATIC_DRAW);

    this.gl.enableVertexAttribArray(this.aPositionLoc);
    this.gl.vertexAttribPointer(this.aPositionLoc, 2, this.gl.FLOAT, false, 0, 0);

    this.handleResize();
    return true;
  }

  private compileShader(type: number, source: string): WebGLShader | null {
    if (!this.gl) return null;
    const shader = this.gl.createShader(type);
    if (!shader) return null;
    this.gl.shaderSource(shader, source);
    this.gl.compileShader(shader);
    if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
      console.error('[FluidShaderEngine] Shader compile error:', this.gl.getShaderInfoLog(shader));
      this.gl.deleteShader(shader);
      return null;
    }
    return shader;
  }

  private addEventListeners(): void {
    this.canvas.addEventListener('webglcontextlost', this.boundHandleContextLost, false);
    this.canvas.addEventListener('webglcontextrestored', this.boundHandleContextRestored, false);
    window.addEventListener('resize', this.boundHandleResize, { passive: true });
  }

  private removeEventListeners(): void {
    this.canvas.removeEventListener('webglcontextlost', this.boundHandleContextLost);
    this.canvas.removeEventListener('webglcontextrestored', this.boundHandleContextRestored);
    window.removeEventListener('resize', this.boundHandleResize);
  }

  /**
   * WAF REL-04 Event Listener: webglcontextlost
   * Prevents default browser crash behavior, pauses render loop, and sets loss flag.
   */
  private handleContextLost(e: Event): void {
    e.preventDefault();
    this.isContextLost = true;
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    console.warn('[FluidShaderEngine] WebGL context lost (WAF REL-04 intercepted). Pausing loop.');
    if (this.options.onContextLost) {
      this.options.onContextLost();
    }
  }

  /**
   * WAF REL-04 Event Listener: webglcontextrestored
   * Re-initializes buffers and shaders, binds uniforms, and resumes loop at >= 60 FPS.
   */
  private handleContextRestored(e: Event): void {
    if (this.isDestroyed) return;
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

  private handleResize(): void {
    if (!this.gl || this.isContextLost || !this.program) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const width = this.canvas.clientWidth * dpr || window.innerWidth * dpr;
    const height = this.canvas.clientHeight * dpr || window.innerHeight * dpr;

    if (this.canvas.width !== width || this.canvas.height !== height) {
      this.canvas.width = width;
      this.canvas.height = height;
      this.gl.viewport(0, 0, width, height);
    }
  }

  public setClearanceRate(rate: number): void {
    this.clearanceRate = Math.max(0, Math.min(1, rate));
  }

  private render = (): void => {
    if (this.isDestroyed || this.isContextLost || !this.gl || !this.program) return;

    const elapsedTime = (Date.now() - this.startTime) / 1000.0;

    this.gl.useProgram(this.program);
    if (this.uTimeLoc) {
      this.gl.uniform1f(this.uTimeLoc, elapsedTime);
    }
    if (this.uResolutionLoc) {
      this.gl.uniform2f(this.uResolutionLoc, this.canvas.width, this.canvas.height);
    }
    if (this.uClearanceRateLoc) {
      this.gl.uniform1f(this.uClearanceRateLoc, this.clearanceRate);
    }

    this.gl.drawArrays(this.gl.TRIANGLES, 0, 6);

    this.animationFrameId = requestAnimationFrame(this.render);
  };

  public startRenderLoop(): void {
    if (this.animationFrameId === null && !this.isDestroyed && !this.isContextLost) {
      this.animationFrameId = requestAnimationFrame(this.render);
    }
  }

  public stopRenderLoop(): void {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  /**
   * WAF COST-01 Resource Clean-up: Completely tears down WebGL buffers, program, shaders, and listeners.
   */
  public destroy(): void {
    this.isDestroyed = true;
    this.stopRenderLoop();
    this.removeEventListeners();

    if (this.gl && !this.gl.isContextLost()) {
      if (this.positionBuffer) {
        this.gl.deleteBuffer(this.positionBuffer);
        this.positionBuffer = null;
      }
      if (this.program) {
        const shaders = this.gl.getAttachedShaders(this.program);
        if (shaders) {
          shaders.forEach((shader) => {
            if (this.gl && this.program) {
              this.gl.detachShader(this.program, shader);
              this.gl.deleteShader(shader);
            }
          });
        }
        this.gl.deleteProgram(this.program);
        this.program = null;
      }
    }
    this.gl = null;
  }
}
