/**
 * CadWireframeEngine.ts
 * Three.js 3D CAD Wireframe Cylinder Model representing Dialyzer Hollow-Fiber Membrane Filter
 * Adheres to WAF COST-01 (Explicit Resource Disposal & Memory Leak Prevention)
 */

import * as THREE from 'three';

export interface CadWireframeOptions {
  particleCount?: number;
  rotationSpeed?: number;
  wireframeColor?: number;
  particleColor?: number;
}

export class CadWireframeEngine {
  private container: HTMLElement;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private wireframeMesh: THREE.LineSegments | null = null;
  private particleSystem: THREE.Points | null = null;
  private particlePositions: Float32Array;
  private particleSpeeds: Float32Array;
  private animationFrameId: number | null = null;
  private resizeObserver: ResizeObserver | null = null;
  private isDestroyed: boolean = false;
  private baseGeometry: THREE.CylinderGeometry | null = null;

  private boundHandleContextLost: (e: Event) => void;
  private boundHandleContextRestored: (e: Event) => void;

  private rotationSpeed: number;
  private particleCount: number;

  constructor(container: HTMLElement, options: CadWireframeOptions = {}) {
    this.container = container;
    this.particleCount = options.particleCount ?? 500;
    this.rotationSpeed = options.rotationSpeed ?? 0.006;
    const wireframeColor = options.wireframeColor ?? 0x2563eb;
    const particleColor = options.particleColor ?? 0x004ac6;

    this.scene = new THREE.Scene();

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;
    this.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    this.camera.position.set(0, 0, 14);

    this.renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
    });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    this.boundHandleContextLost = (e: Event) => {
      e.preventDefault();
      this.stopRenderLoop();
    };
    this.boundHandleContextRestored = () => {
      if (!this.isDestroyed) {
        this.startRenderLoop();
      }
    };
    this.renderer.domElement.addEventListener('webglcontextlost', this.boundHandleContextLost, false);
    this.renderer.domElement.addEventListener('webglcontextrestored', this.boundHandleContextRestored, false);

    while (container.firstChild) {
      container.removeChild(container.firstChild);
    }
    container.appendChild(this.renderer.domElement);

    // 1. Create CAD Wireframe Cylinder Geometry (Fresenius 4008S Dialyzer Model)
    this.baseGeometry = new THREE.CylinderGeometry(1.8, 1.8, 8, 24, 8, true);
    const wireframeGeom = new THREE.WireframeGeometry(this.baseGeometry);
    const mat = new THREE.LineBasicMaterial({
      color: wireframeColor,
      opacity: 0.7,
      transparent: true,
      linewidth: 1,
    });
    this.wireframeMesh = new THREE.LineSegments(wireframeGeom, mat);
    this.wireframeMesh.rotation.z = Math.PI / 4;
    this.scene.add(this.wireframeMesh);

    // 2. Create 500 Hollow-Fiber Dialysate Particle Stream
    const particleGeom = new THREE.BufferGeometry();
    this.particlePositions = new Float32Array(this.particleCount * 3);
    this.particleSpeeds = new Float32Array(this.particleCount);

    const radius = 1.6;
    const halfHeight = 3.8;

    for (let i = 0; i < this.particleCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const r = Math.random() * radius;
      const x = Math.cos(angle) * r;
      const y = (Math.random() - 0.5) * 2 * halfHeight;
      const z = Math.sin(angle) * r;

      this.particlePositions[i * 3] = x;
      this.particlePositions[i * 3 + 1] = y;
      this.particlePositions[i * 3 + 2] = z;
      this.particleSpeeds[i] = 0.02 + Math.random() * 0.04;
    }

    particleGeom.setAttribute(
      'position',
      new THREE.BufferAttribute(this.particlePositions, 3)
    );

    const particleMat = new THREE.PointsMaterial({
      color: particleColor,
      size: 0.08,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
    });

    this.particleSystem = new THREE.Points(particleGeom, particleMat);
    this.wireframeMesh.add(this.particleSystem);

    // Setup ResizeObserver for responsive canvas updates
    this.setupResizeObserver();
    this.startRenderLoop();
  }

  private setupResizeObserver(): void {
    if (typeof ResizeObserver !== 'undefined') {
      this.resizeObserver = new ResizeObserver(() => {
        this.handleResize();
      });
      this.resizeObserver.observe(this.container);
    }
  }

  private handleResize(): void {
    if (this.isDestroyed || !this.container) return;
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;

    if (width > 0 && height > 0) {
      this.camera.aspect = width / height;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(width, height);
    }
  }

  private render = (): void => {
    if (this.isDestroyed) return;

    if (this.wireframeMesh) {
      this.wireframeMesh.rotation.y += this.rotationSpeed;
    }

    // Update 500 dialysate particles moving through hollow fibers
    if (this.particleSystem && this.particlePositions) {
      const positions = this.particleSystem.geometry.attributes.position.array as Float32Array;
      const halfHeight = 3.8;

      for (let i = 0; i < this.particleCount; i++) {
        let y = positions[i * 3 + 1];
        y += this.particleSpeeds[i];

        if (y > halfHeight) {
          y = -halfHeight;
        }

        positions[i * 3 + 1] = y;
      }

      this.particleSystem.geometry.attributes.position.needsUpdate = true;
    }

    this.renderer.render(this.scene, this.camera);
    this.animationFrameId = requestAnimationFrame(this.render);
  };

  public startRenderLoop(): void {
    if (this.animationFrameId === null && !this.isDestroyed) {
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
   * WAF COST-01 Resource Disposal
   * Completely disposes Three.js geometries, materials, textures, cancels animation frames, and disconnects ResizeObserver.
   */
  public destroy(): void {
    this.isDestroyed = true;
    this.stopRenderLoop();

    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
      this.resizeObserver = null;
    }

    if (this.wireframeMesh) {
      this.scene.remove(this.wireframeMesh);
      if (this.wireframeMesh.geometry) {
        this.wireframeMesh.geometry.dispose();
      }
      if (Array.isArray(this.wireframeMesh.material)) {
        this.wireframeMesh.material.forEach((mat) => mat.dispose());
      } else if (this.wireframeMesh.material) {
        this.wireframeMesh.material.dispose();
      }
      this.wireframeMesh = null;
    }

    if (this.particleSystem) {
      if (this.particleSystem.geometry) {
        this.particleSystem.geometry.dispose();
      }
      if (this.particleSystem.material) {
        if (Array.isArray(this.particleSystem.material)) {
          this.particleSystem.material.forEach((mat) => mat.dispose());
        } else {
          this.particleSystem.material.dispose();
        }
      }
      this.particleSystem = null;
    }

    if (this.baseGeometry) {
      this.baseGeometry.dispose();
      this.baseGeometry = null;
    }

    if (this.renderer && this.renderer.domElement) {
      this.renderer.domElement.removeEventListener('webglcontextlost', this.boundHandleContextLost);
      this.renderer.domElement.removeEventListener('webglcontextrestored', this.boundHandleContextRestored);
    }

    this.renderer.dispose();
    if (this.renderer.domElement && this.renderer.domElement.parentNode) {
      this.renderer.domElement.parentNode.removeChild(this.renderer.domElement);
    }
  }
}
