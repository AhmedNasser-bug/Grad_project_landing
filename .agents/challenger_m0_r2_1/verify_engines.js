import * as THREE from '../../dashboard/node_modules/three/build/three.module.js';

// Mock DOM elements and WebGL Context
class MockElement {
  constructor() {
    this.children = [];
    this.listeners = {};
    this.clientWidth = 800;
    this.clientHeight = 600;
    this.parentNode = {
      removeChild: (child) => {
        const idx = this.children.indexOf(child);
        if (idx >= 0) this.children.splice(idx, 1);
      }
    };
  }

  appendChild(child) {
    child.parentNode = this;
    this.children.push(child);
  }

  removeChild(child) {
    const idx = this.children.indexOf(child);
    if (idx >= 0) this.children.splice(idx, 1);
  }

  get firstChild() {
    return this.children[0] || null;
  }

  addEventListener(event, fn, options) {
    if (!this.listeners[event]) this.listeners[event] = [];
    this.listeners[event].push(fn);
  }

  removeEventListener(event, fn) {
    if (!this.listeners[event]) return;
    this.listeners[event] = this.listeners[event].filter(l => l !== fn);
  }

  dispatchEvent(eventObj) {
    const type = typeof eventObj === 'string' ? eventObj : eventObj.type;
    const fns = this.listeners[type] || [];
    fns.forEach(fn => fn(eventObj));
  }
}

class MockWebGLContext {
  constructor() {
    this.VERTEX_SHADER = 35633;
    this.FRAGMENT_SHADER = 35632;
    this.COMPILE_STATUS = 35713;
    this.LINK_STATUS = 35714;
    this.ARRAY_BUFFER = 34962;
    this.STATIC_DRAW = 35044;
    this.TRIANGLES = 4;

    this.createdShaders = [];
    this.deletedShaders = [];
    this.createdBuffers = [];
    this.deletedBuffers = [];
    this.createdPrograms = [];
    this.deletedPrograms = [];
    
    this.shaderCompileFail = false;
    this.fragmentCompileFail = false;
    this.programLinkFail = false;
  }

  isContextLost() {
    return false;
  }

  createShader(type) {
    const shader = { id: Math.random(), type };
    this.createdShaders.push(shader);
    return shader;
  }

  shaderSource(shader, source) {}

  compileShader(shader) {}

  getShaderParameter(shader, param) {
    if (param === this.COMPILE_STATUS) {
      if (this.shaderCompileFail) return false;
      if (this.fragmentCompileFail && shader.type === this.FRAGMENT_SHADER) return false;
      return true;
    }
    return true;
  }

  getShaderInfoLog(shader) {
    return 'Mock Shader Error';
  }

  deleteShader(shader) {
    this.deletedShaders.push(shader);
  }

  createProgram() {
    const prog = { id: Math.random(), attached: [] };
    this.createdPrograms.push(prog);
    return prog;
  }

  attachShader(prog, shader) {
    prog.attached.push(shader);
  }

  detachShader(prog, shader) {
    prog.attached = prog.attached.filter(s => s !== shader);
  }

  linkProgram(prog) {}

  getProgramParameter(prog, param) {
    if (param === this.LINK_STATUS) {
      return !this.programLinkFail;
    }
    return true;
  }

  getProgramInfoLog(prog) {
    return 'Mock Link Error';
  }

  getAttachedShaders(prog) {
    return prog.attached.slice();
  }

  deleteProgram(prog) {
    this.deletedPrograms.push(prog);
  }

  useProgram(prog) {}
  getUniformLocation(prog, name) { return { name }; }
  getAttribLocation(prog, name) { return 0; }

  createBuffer() {
    const buf = { id: Math.random() };
    this.createdBuffers.push(buf);
    return buf;
  }

  bindBuffer(target, buf) {}
  bufferData(target, data, usage) {}
  enableVertexAttribArray(loc) {}
  vertexAttribPointer(loc, size, type, norm, stride, offset) {}
  viewport(x, y, w, h) {}
  uniform1f(loc, val) {}
  uniform2f(loc, v1, v2) {}
  drawArrays(mode, first, count) {}
}

class MockCanvas extends MockElement {
  constructor() {
    super();
    this.width = 800;
    this.height = 600;
    this.mockGl = new MockWebGLContext();
  }

  getContext(type, opts) {
    if (type === 'webgl' || type === 'experimental-webgl') {
      return this.mockGl;
    }
    return null;
  }
}

// Global setup for Node environment
global.window = {
  innerWidth: 1024,
  innerHeight: 768,
  devicePixelRatio: 1,
  addEventListener: () => {},
  removeEventListener: () => {},
};
global.document = {
  createElement: (tag) => {
    if (tag === 'canvas') return new MockCanvas();
    return new MockElement();
  }
};
global.requestAnimationFrame = (cb) => setTimeout(cb, 16);
global.cancelAnimationFrame = (id) => clearTimeout(id);

console.log('Environment setup complete. Testing imported classes...');
