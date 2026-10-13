import * as THREE from 'three';
import { brainLinks, brainNodes, brainRegions, type BrainNode } from '@/data/brain';

/*
 * The hero brain: a clean point cloud seen from above, the front at the top, so both
 * hemispheres sit side by side. Left hemisphere (light blue): logic and work. Right hemisphere
 * (gold): curiosity and craft. Points only: the cortex, its folds, and the knowledge nodes.
 * Depth comes from size and fade with distance; links appear only for the node in focus.
 */

export interface BrainCallbacks {
  onPick: (id: string | null) => void;
}

export interface ScreenPoint {
  x: number;
  y: number;
  visible: boolean;
}

const rng = (seed: number) => {
  let s = seed >>> 0;
  return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
};

export const BLUE = new THREE.Color(0.62, 0.78, 0.92);
export const GOLD = new THREE.Color(0.95, 0.76, 0.46);

// Gyri: ~1 on a ridge, ~0 in a groove.
function fold(x: number, y: number, z: number) {
  const w1 = 0.22 * Math.sin(5.3 * x + 3.1 * y) + 0.14 * Math.sin(9.7 * x - 4.3 * z + 1.7);
  const w2 = 0.2 * Math.sin(4.1 * z + 2.7 * y + 0.6) + 0.12 * Math.sin(8.3 * y - 6.1 * x);
  const a = Math.sin(17 * (z + w1));
  const b = Math.sin(15 * (x * 0.8 + y * 0.6 + w2));
  const m = 0.5 + 0.5 * Math.sin(3.3 * x + 2.2 * z + 1.1);
  return Math.pow(0.5 + 0.5 * (a * m + b * (1 - m)), 1.6);
}

/** A point on one hemisphere's surface for a unit direction (x > 0 lateral, -z front, +y up). */
function cortex(side: number, d: THREE.Vector3, out: THREE.Vector3) {
  const lateral = d.x;
  const zf = d.z;
  const rx = 0.68 * (0.84 + 0.2 * Math.exp(-((zf - 0.25) ** 2) / 0.35)) * (zf > 0.7 ? 1 - (zf - 0.7) * 0.5 : 1) * (zf < -0.75 ? 1 - (-zf - 0.75) * 0.6 : 1);
  const ry = 0.62;
  const rz = zf < 0 ? 1.12 : 1.02;
  out.set(lateral * rx, d.y * ry, d.z * rz);
  if (lateral < 0) out.x *= 0.16;
  if (d.y < -0.2) out.y = -0.2 * ry + (d.y + 0.2) * ry * 0.5;
  out.x = side * (out.x + 0.1);
  return out;
}

export class BrainScene {
  private renderer: THREE.WebGLRenderer;
  private scene = new THREE.Scene();
  private camera = new THREE.PerspectiveCamera(34, 1, 0.1, 50);
  private group = new THREE.Group();
  private cortexMat!: THREE.ShaderMaterial;
  private nodeMat!: THREE.ShaderMaterial;
  private nodeState!: Float32Array;
  private nodeAttr!: THREE.BufferAttribute;
  private links!: THREE.LineSegments;
  private positions = new Map<string, THREE.Vector3>();
  private hubs = new Map<string, THREE.Vector3>();
  private raf = 0;
  private time = 0;
  private last = 0;
  private width = 1;
  private height = 1;
  private yaw = 0;
  private pitch = 0;
  private drag: { x: number; y: number; yaw: number; pitch: number; moved: boolean } | null = null;
  private visible = true;
  private io: IntersectionObserver;
  private tmp = new THREE.Vector3();
  private focusId: string | null = null;
  private region: string | null = null;
  nodeScreen = new Map<string, ScreenPoint>();
  hubScreen = new Map<string, ScreenPoint>();
  onFrame?: () => void;

  constructor(private container: HTMLElement, private cb: BrainCallbacks, private reduced: boolean, private lowPower: boolean) {
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, lowPower ? 1.5 : 2));
    this.renderer.setClearColor(0x000000, 0);
    container.appendChild(this.renderer.domElement);
    const dom = this.renderer.domElement;
    dom.style.display = 'block';
    dom.style.touchAction = 'pan-y';
    this.scene.add(this.group);
    this.buildCortex();
    this.placeNodes();
    this.buildNodes();
    this.links = new THREE.LineSegments(new THREE.BufferGeometry(), new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.55, depthWrite: false }));
    this.group.add(this.links);
    this.resize();
    dom.addEventListener('pointerdown', this.onDown);
    window.addEventListener('pointermove', this.onMove);
    window.addEventListener('pointerup', this.onUp);
    window.addEventListener('resize', this.resize);
    this.io = new IntersectionObserver(([e]) => (this.visible = e.isIntersecting));
    this.io.observe(container);
    this.loop(0);
  }

  private buildCortex() {
    const r = rng(11);
    const pos: number[] = [];
    const col: number[] = [];
    const d = new THREE.Vector3();
    const p = new THREE.Vector3();
    const q = new THREE.Vector3();
    const N = this.lowPower ? 60000 : 110000;
    for (const side of [-1, 1]) {
      const base = side < 0 ? BLUE : GOLD;
      for (let i = 0; i < N / 2; i++) {
        const u = r() * 2 - 1;
        const t = r() * Math.PI * 2;
        const s = Math.sqrt(1 - u * u);
        d.set(s * Math.cos(t), u, s * Math.sin(t));
        if (d.y < -0.4) continue; // the underside is never seen from above
        cortex(side, d, p);
        const f = fold(p.x * 1.5, p.y * 1.5, p.z * 1.5);
        if (r() > 0.1 + 0.9 * f * f) continue; // gather on the ridges
        q.set(p.x - side * 0.4, p.y + 0.05, p.z).normalize();
        p.addScaledVector(q, (f - 0.5) * 0.035);
        pos.push(p.x, p.y, p.z);
        const k = (0.22 + 0.78 * Math.pow(f, 1.5)) * (d.x < 0 ? 0.3 : 1);
        col.push(base.r * k, base.g * k, base.b * k);
      }
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    geo.setAttribute('aCol', new THREE.Float32BufferAttribute(col, 3));
    this.cortexMat = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      uniforms: { uPx: { value: this.renderer.getPixelRatio() }, uDim: { value: 1 } },
      vertexShader: `
        attribute vec3 aCol;
        uniform float uPx;
        uniform float uDim;
        varying vec3 vC;
        varying float vA;
        void main() {
          vec4 mv = modelViewMatrix * vec4(position, 1.0);
          // Depth: nearer points larger and brighter, farther ones fade into the dark.
          float depth = clamp((-mv.z - 3.0) / 1.9, 0.0, 1.0);
          vC = aCol;
          vA = (1.0 - depth * 0.7) * uDim;
          gl_PointSize = (2.6 - depth * 1.2) * uPx;
          gl_Position = projectionMatrix * mv;
        }`,
      fragmentShader: `
        varying vec3 vC;
        varying float vA;
        void main() {
          float d = length(gl_PointCoord - 0.5);
          if (d > 0.5) discard;
          gl_FragColor = vec4(vC, vA * smoothstep(0.5, 0.15, d));
        }`,
    });
    this.group.add(new THREE.Points(geo, this.cortexMat));
  }

  /** Regions in a grid over each hemisphere's upper surface; nodes cluster around them. */
  private placeNodes() {
    const r = rng(29);
    const p = new THREE.Vector3();
    (['left', 'right'] as const).forEach((side) => {
      const sign = side === 'left' ? -1 : 1;
      const regs = brainRegions.filter((x) => x.side === side);
      const rows = Math.ceil(regs.length / 2);
      regs.forEach((reg, i) => {
        const row = Math.floor(i / 2);
        const col = i % 2;
        const z = -0.78 + (rows === 1 ? 0.5 : row / (rows - 1)) * 1.5;
        const d = new THREE.Vector3(col === 0 ? 0.25 : 0.72, col === 0 ? 0.92 : 0.6, z).normalize();
        const hub = new THREE.Vector3();
        cortex(sign, d, hub);
        this.hubs.set(reg.id, hub);
        const ns = brainNodes.filter((n) => n.region === reg.id);
        const spread = 0.14 + Math.min(0.2, ns.length * 0.005);
        ns.forEach((n) => {
          const q = new THREE.Vector3(Math.abs(d.x + (r() - 0.5) * spread * 1.6), d.y + (r() - 0.5) * spread, d.z + (r() - 0.5) * spread * 2.2).normalize();
          cortex(sign, q, p);
          this.positions.set(n.id, p.clone().multiplyScalar(1.01));
        });
      });
    });
  }

  private buildNodes() {
    const pos: number[] = [];
    const col: number[] = [];
    brainNodes.forEach((n) => {
      const p = this.positions.get(n.id)!;
      pos.push(p.x, p.y, p.z);
      const c = n.side === 'left' ? BLUE : GOLD;
      col.push(c.r, c.g, c.b);
    });
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    geo.setAttribute('aCol', new THREE.Float32BufferAttribute(col, 3));
    this.nodeState = new Float32Array(brainNodes.length).fill(0.4);
    this.nodeAttr = new THREE.BufferAttribute(this.nodeState, 1);
    geo.setAttribute('aState', this.nodeAttr);
    this.nodeMat = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      uniforms: { uPx: { value: this.renderer.getPixelRatio() } },
      vertexShader: `
        attribute vec3 aCol;
        attribute float aState;
        uniform float uPx;
        varying vec3 vC;
        varying float vS;
        void main() {
          vC = aCol;
          vS = aState;
          gl_PointSize = (3.0 + aState * 9.0) * uPx;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }`,
      fragmentShader: `
        varying vec3 vC;
        varying float vS;
        void main() {
          float d = length(gl_PointCoord - 0.5);
          if (d > 0.5) discard;
          float ring = step(0.36, d) * step(d, 0.5) * step(0.85, vS);
          float core = smoothstep(0.3, 0.1, d);
          gl_FragColor = vec4(mix(vC, vec3(1.0), core * vS * 0.6), max(core, ring) * (0.4 + 0.6 * vS));
        }`,
    });
    const pts = new THREE.Points(geo, this.nodeMat);
    pts.renderOrder = 3;
    this.group.add(pts);
  }

  // ---------------------------------------------------------------- state

  private refresh() {
    const id = this.focusId;
    const near = new Set<string>();
    const seg: number[] = [];
    if (id) {
      brainLinks.forEach((l) => {
        if (l.a !== id && l.b !== id) return;
        const other = l.a === id ? l.b : l.a;
        near.add(other);
        const A = this.positions.get(id)!;
        const B = this.positions.get(other);
        if (!B) return;
        const mid = A.clone().add(B).multiplyScalar(0.5).multiplyScalar(0.8);
        let prev = A;
        for (let i = 1; i <= 16; i++) {
          const t = i / 16;
          const u = 1 - t;
          const p = new THREE.Vector3(u * u * A.x + 2 * u * t * mid.x + t * t * B.x, u * u * A.y + 2 * u * t * mid.y + t * t * B.y, u * u * A.z + 2 * u * t * mid.z + t * t * B.z);
          seg.push(prev.x, prev.y, prev.z, p.x, p.y, p.z);
          prev = p;
        }
      });
    }
    this.links.geometry.dispose();
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(seg, 3));
    this.links.geometry = g;
    brainNodes.forEach((n, i) => {
      let s = this.region ? (n.region === this.region ? 0.75 : 0.15) : 0.4;
      if (id) s = n.id === id ? 1 : near.has(n.id) ? 0.8 : 0.15;
      this.nodeState[i] = s;
    });
    this.nodeAttr.needsUpdate = true;
    this.cortexMat.uniforms.uDim.value = id || this.region ? 0.55 : 1;
  }

  setFocus(id: string | null) {
    this.focusId = id;
    this.refresh();
  }

  setRegion(id: string | null) {
    this.region = id;
    this.refresh();
  }

  coords(id: string) {
    return this.positions.get(id) ?? null;
  }

  // ---------------------------------------------------------------- input

  private onDown = (e: PointerEvent) => {
    this.drag = { x: e.clientX, y: e.clientY, yaw: this.yaw, pitch: this.pitch, moved: false };
  };

  private onMove = (e: PointerEvent) => {
    if (!this.drag) return;
    const dx = e.clientX - this.drag.x;
    const dy = e.clientY - this.drag.y;
    if (Math.hypot(dx, dy) > 6) this.drag.moved = true;
    if (this.drag.moved) {
      this.yaw = this.drag.yaw + dx * 0.006;
      this.pitch = Math.max(-0.5, Math.min(0.35, this.drag.pitch + dy * 0.004));
    }
  };

  private onUp = (e: PointerEvent) => {
    const d = this.drag;
    this.drag = null;
    if (!d || d.moved) return;
    // A tap or click on the canvas: pick the nearest node to where it landed.
    const rect = this.container.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    if (x < 0 || y < 0 || x > rect.width || y > rect.height) return;
    let best: string | null = null;
    let bd = 22;
    this.nodeScreen.forEach((s, id) => {
      if (!s.visible) return;
      const n = brainNodes.find((b) => b.id === id)!;
      if (this.region && n.region !== this.region) return;
      const dist = Math.hypot(s.x - x, s.y - y);
      if (dist < bd) {
        bd = dist;
        best = id;
      }
    });
    this.cb.onPick(best);
  };

  private resize = () => {
    const r = this.container.getBoundingClientRect();
    this.width = Math.max(1, r.width);
    this.height = Math.max(1, r.height);
    this.renderer.setSize(this.width, this.height, false);
    this.renderer.domElement.style.width = `${this.width}px`;
    this.renderer.domElement.style.height = `${this.height}px`;
    this.camera.aspect = this.width / this.height;
    // Fit both hemispheres: about 1.8 units wide and 2.4 long.
    const fit = Math.max(2.5 / 0.61, 2.0 / (0.61 * this.camera.aspect));
    this.camera.position.set(0, fit * 0.8, fit * 0.6);
    this.camera.lookAt(0, -0.05, 0.05);
    this.camera.updateProjectionMatrix();
  };

  // ---------------------------------------------------------------- loop

  private loop = (now: number) => {
    this.raf = requestAnimationFrame(this.loop);
    if (!this.visible) return;
    const dt = Math.min(0.05, (now - this.last) / 1000 || 0.016);
    this.last = now;
    this.time += dt;
    const sway = this.reduced || this.drag ? 0 : Math.sin(this.time * 0.15) * 0.22;
    this.group.rotation.set(this.pitch, this.yaw + sway, 0);
    this.renderer.render(this.scene, this.camera);
    this.group.updateMatrixWorld();
    const m = this.group.matrixWorld;
    const proj = (v: THREE.Vector3): ScreenPoint => {
      const p = this.tmp.copy(v).applyMatrix4(m).project(this.camera);
      return { x: (p.x * 0.5 + 0.5) * this.width, y: (-p.y * 0.5 + 0.5) * this.height, visible: p.z < 1 };
    };
    this.positions.forEach((v, id) => this.nodeScreen.set(id, proj(v)));
    this.hubs.forEach((v, id) => this.hubScreen.set(id, proj(v)));
    this.onFrame?.();
  };

  dispose() {
    cancelAnimationFrame(this.raf);
    this.io.disconnect();
    const dom = this.renderer.domElement;
    dom.removeEventListener('pointerdown', this.onDown);
    window.removeEventListener('pointermove', this.onMove);
    window.removeEventListener('pointerup', this.onUp);
    window.removeEventListener('resize', this.resize);
    this.scene.traverse((o) => {
      const any = o as THREE.Mesh;
      any.geometry?.dispose();
      const mat = any.material as THREE.Material | THREE.Material[] | undefined;
      if (Array.isArray(mat)) mat.forEach((x) => x.dispose());
      else mat?.dispose();
    });
    this.renderer.dispose();
    dom.remove();
  }
}

export type { BrainNode };
