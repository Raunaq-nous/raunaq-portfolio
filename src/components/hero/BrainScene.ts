import * as THREE from 'three';
import { brainLinks, brainNodes, brainRegions, type BrainNode } from '@/data/brain';

/*
 * The hero brain, in the palette of a neural scan: a blue and violet point-cloud cortex whose
 * gyri glow cyan at the rims, red and orange fibres running through it, and white-cyan neuron
 * bursts. Every knowledge node is a neuron on the cortex; real links between them are the
 * bright fibres. Seen from the side and turning slowly, so each hemisphere comes round in turn:
 * left (logic and work), then right (curiosity and craft). Drag to turn it yourself.
 */

export interface BrainCallbacks {
  onHover: (id: string | null) => void;
  onPick: (id: string | null) => void;
}

export interface ScreenNode {
  id: string;
  x: number;
  y: number;
  /** 0 (far side) .. 1 (facing the camera), for label fading. */
  front: number;
  visible: boolean;
}

const rng = (seed: number) => {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
};

const C = {
  blue: new THREE.Color(0.2, 0.32, 1.0),
  indigo: new THREE.Color(0.32, 0.26, 0.95),
  violet: new THREE.Color(0.62, 0.36, 1.0),
  cyan: new THREE.Color(0.42, 0.88, 1.0),
  white: new THREE.Color(0.92, 0.96, 1.0),
  magenta: new THREE.Color(0.92, 0.36, 0.95),
  red: new THREE.Color(1.0, 0.27, 0.22),
  orange: new THREE.Color(1.0, 0.6, 0.22),
};

// Gyri: wavy ridges warped by low-frequency noise. ~1 on a gyrus, ~0 in a sulcus.
function fold(x: number, y: number, z: number) {
  const w1 = 0.22 * Math.sin(5.3 * x + 3.1 * y) + 0.14 * Math.sin(9.7 * x - 4.3 * z + 1.7) + 0.08 * Math.sin(13 * y + 7 * z);
  const w2 = 0.2 * Math.sin(4.1 * z + 2.7 * y + 0.6) + 0.12 * Math.sin(8.3 * y - 6.1 * x);
  const a = Math.sin(17 * (z + w1));
  const b = Math.sin(15 * (y * 0.9 + x * 0.4 + w2));
  const m = 0.5 + 0.5 * Math.sin(3.3 * x + 2.2 * z + 1.1);
  return Math.pow(0.5 + 0.5 * (a * m + b * (1 - m)), 1.6);
}

/**
 * A point on one hemisphere's surface for a unit direction. In `d`, x > 0 points away from the
 * midline (lateral); -z is the front of the brain; +y is up.
 */
function cortex(side: number, d: THREE.Vector3, out: THREE.Vector3) {
  const lateral = d.x;
  const zf = d.z;
  // Profile: tall rounded frontal and parietal lobes, the occipital tapering to the back.
  const rx = 0.56 * (0.86 + 0.18 * Math.exp(-((zf - 0.2) ** 2) / 0.4));
  const ry = 0.84 * (zf > 0.5 ? 1 - (zf - 0.5) * 0.6 : 1) * (zf < -0.6 ? 1 - (-zf - 0.6) * 0.35 : 1);
  const rz = zf < 0 ? 1.12 : 1.04;
  out.set(lateral * rx, d.y * ry, d.z * rz);
  if (lateral < 0) out.x *= 0.16; // flat medial wall
  if (d.y < -0.3) out.y = -0.3 * ry + (d.y + 0.3) * ry * 0.6; // flatter base
  // Temporal lobe: bulges low, forward and to the side.
  const temporal = Math.max(0, 1 - Math.hypot((d.z + 0.1) / 0.5, (d.y + 0.5) / 0.32)) * Math.max(0, lateral + 0.3);
  out.x += temporal * 0.12;
  out.y -= temporal * 0.14;
  out.x = side * (out.x + 0.14);
  return out;
}

const fibreShader = {
  vertexShader: `attribute vec3 aCol; attribute float aAlpha; varying vec3 vC; varying float vA;
    void main(){ vC = aCol; vA = aAlpha; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
  fragmentShader: `varying vec3 vC; varying float vA; void main(){ gl_FragColor = vec4(vC * vA, vA); }`,
};

export class BrainScene {
  private renderer: THREE.WebGLRenderer;
  private scene = new THREE.Scene();
  private camera: THREE.PerspectiveCamera;
  private group = new THREE.Group();
  private cortexMat!: THREE.ShaderMaterial;
  private nodeMat!: THREE.ShaderMaterial;
  private nodeState!: Float32Array;
  private nodeStateAttr!: THREE.BufferAttribute;
  private linkAlpha!: Float32Array;
  private linkBase!: Float32Array;
  private linkAlphaAttr!: THREE.BufferAttribute;
  private linkRanges: { a: string; b: string; start: number; count: number; fact: boolean }[] = [];
  private dendriteMat!: THREE.ShaderMaterial;
  private positions = new Map<string, THREE.Vector3>();
  private regionHubs = new Map<string, THREE.Vector3>();
  private raf = 0;
  private time = 0;
  private last = 0;
  private width = 1;
  private height = 1;
  private spin = 0;
  private yaw = 0;
  private pitch = 0;
  private dragging = false;
  private dragFrom = { x: 0, y: 0, yaw: 0, pitch: 0 };
  private moved = false;
  private pointer = { x: -1, y: -1, inside: false };
  private hover: string | null = null;
  private pinned: string | null = null;
  private visible = true;
  private idleFor = 0;
  private tmp = new THREE.Vector3();
  private io: IntersectionObserver;
  screen: ScreenNode[] = [];
  /** Which hemisphere faces the camera now: -1 left, 1 right. */
  facing: -1 | 1 = -1;
  onFrame?: () => void;

  constructor(private container: HTMLElement, private cb: BrainCallbacks, private reduced: boolean, private lowPower: boolean) {
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, lowPower ? 1.5 : 2));
    this.renderer.setClearColor(0x000000, 0);
    container.appendChild(this.renderer.domElement);
    const dom = this.renderer.domElement;
    dom.style.display = 'block';
    dom.style.touchAction = 'pan-y';
    this.camera = new THREE.PerspectiveCamera(32, 1, 0.1, 50);
    this.scene.add(this.group);
    this.buildCortex();
    this.placeNodes();
    this.buildFibres();
    this.buildNodes();
    this.buildDust();
    this.resize();
    dom.addEventListener('pointerdown', this.onDown);
    window.addEventListener('pointermove', this.onMove);
    window.addEventListener('pointerup', this.onUp);
    dom.addEventListener('pointerleave', this.onLeave);
    window.addEventListener('resize', this.resize);
    this.io = new IntersectionObserver(([e]) => (this.visible = e.isIntersecting));
    this.io.observe(container);
    this.loop(0);
  }

  // ---------------------------------------------------------------- build

  private buildCortex() {
    const r = rng(11);
    const pos: number[] = [];
    const col: number[] = [];
    const nrm: number[] = [];
    const sz: number[] = [];
    const d = new THREE.Vector3();
    const p = new THREE.Vector3();
    const q = new THREE.Vector3();
    const c = new THREE.Color();
    const N = this.lowPower ? 70000 : 140000; // candidates; most land on gyri
    for (const side of [-1, 1]) {
      for (let i = 0; i < N / 2; i++) {
        const u = r() * 2 - 1;
        const t = r() * Math.PI * 2;
        const s = Math.sqrt(1 - u * u);
        d.set(s * Math.cos(t), u, s * Math.sin(t));
        cortex(side, d, p);
        const f = fold(p.x * 1.5, p.y * 1.5, p.z * 1.5);
        // Keep mostly ridge points so the gyri read as glowing folds and the sulci stay dark.
        if (r() > 0.06 + 0.94 * f * f) continue;
        q.set(p.x - side * 0.4, p.y + 0.05, p.z).normalize();
        p.addScaledVector(q, (f - 0.5) * 0.04);
        pos.push(p.x, p.y, p.z);
        nrm.push(q.x, q.y, q.z);
        // Blue to violet across the cortex; ridges glow toward cyan and white.
        c.copy(C.blue).lerp(C.violet, 0.5 + 0.5 * Math.sin(p.z * 2.2 + p.y * 3.1 + side));
        c.lerp(C.cyan, Math.pow(f, 4) * 0.7);
        const k = (0.25 + 0.75 * f) * (d.x < 0 ? 0.2 : 1);
        col.push(c.r * k, c.g * k, c.b * k);
        sz.push(1.0 + f * 1.3);
      }
    }
    // Cerebellum, finely striped, tucked under the back; and the brain stem.
    for (let i = 0; i < (this.lowPower ? 3000 : 5500); i++) {
      const u = r() * 2 - 1;
      const t = r() * Math.PI * 2;
      const s = Math.sqrt(1 - u * u);
      const x = s * Math.cos(t) * 0.46;
      const y = u * 0.22 - 0.5;
      const z = s * Math.sin(t) * 0.32 + 0.78;
      const stripe = Math.pow(0.5 + 0.5 * Math.sin(y * 80 + z * 10), 2);
      pos.push(x, y, z);
      nrm.push(x, y + 0.5, z - 0.78);
      c.copy(C.indigo).lerp(C.cyan, stripe * 0.6);
      const k = 0.15 + 0.6 * stripe;
      col.push(c.r * k, c.g * k, c.b * k);
      sz.push(0.8);
    }
    for (let i = 0; i < 2200; i++) {
      const t = r();
      const a = r() * Math.PI * 2;
      const rad = 0.13 * (1 - t * 0.3);
      pos.push(Math.cos(a) * rad, -0.42 - t * 0.55, 0.32 + t * 0.12 + Math.sin(a) * rad);
      nrm.push(Math.cos(a), 0, Math.sin(a));
      col.push(C.indigo.r * 0.35, C.indigo.g * 0.35, C.indigo.b * 0.35);
      sz.push(0.7);
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    geo.setAttribute('aCol', new THREE.Float32BufferAttribute(col, 3));
    geo.setAttribute('aNormal', new THREE.Float32BufferAttribute(nrm, 3));
    geo.setAttribute('aSize', new THREE.Float32BufferAttribute(sz, 1));
    this.cortexMat = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: { uPx: { value: this.renderer.getPixelRatio() }, uTime: { value: 0 } },
      vertexShader: `
        attribute vec3 aCol;
        attribute vec3 aNormal;
        attribute float aSize;
        uniform float uPx;
        uniform float uTime;
        varying vec3 vC;
        void main() {
          vec4 mv = modelViewMatrix * vec4(position, 1.0);
          vec3 n = normalize(normalMatrix * aNormal);
          float facing = dot(n, normalize(-mv.xyz));
          float rim = pow(1.0 - abs(facing), 2.2);
          float back = smoothstep(-0.5, 0.2, facing);
          float flick = 0.9 + 0.1 * sin(uTime * 1.7 + position.x * 37.0 + position.z * 29.0);
          vec3 rimCol = vec3(0.45, 0.8, 1.0);
          vC = (aCol * (0.35 + 0.65 * back) + rimCol * rim * 0.32) * flick;
          gl_PointSize = (aSize + rim * 1.1) * uPx;
          gl_Position = projectionMatrix * mv;
        }`,
      fragmentShader: `
        varying vec3 vC;
        void main() {
          float d = length(gl_PointCoord - 0.5);
          if (d > 0.5) discard;
          gl_FragColor = vec4(vC * smoothstep(0.5, 0.05, d) * 0.85, 1.0);
        }`,
    });
    this.group.add(new THREE.Points(geo, this.cortexMat));
  }

  /** Regions laid over each hemisphere's lateral surface; nodes cluster around them. */
  private placeNodes() {
    const r = rng(29);
    const d = new THREE.Vector3();
    const p = new THREE.Vector3();
    (['left', 'right'] as const).forEach((side) => {
      const sign = side === 'left' ? -1 : 1;
      const regs = brainRegions.filter((x) => x.side === side);
      const cols = Math.ceil(regs.length / 2);
      regs.forEach((reg, i) => {
        // A grid over the lateral surface: front to back, upper and lower bands.
        const col = i % cols;
        const row = Math.floor(i / cols);
        const z = -0.8 + (cols === 1 ? 0.5 : col / (cols - 1)) * 1.45;
        const y = row === 0 ? 0.55 : 0.0;
        d.set(0.85, y, z).normalize();
        const hub = new THREE.Vector3();
        cortex(sign, d, hub);
        this.regionHubs.set(reg.id, hub.clone());
        const ns = brainNodes.filter((n) => n.region === reg.id);
        const spread = 0.14 + Math.min(0.2, ns.length * 0.005);
        ns.forEach((n) => {
          const q = new THREE.Vector3(Math.abs(d.x + (r() - 0.5) * spread), d.y + (r() - 0.5) * spread * 2.6, d.z + (r() - 0.5) * spread * 2.8).normalize();
          cortex(sign, q, p);
          this.positions.set(n.id, p.clone().multiplyScalar(1.005));
        });
      });
    });
  }

  private curve(a: THREE.Vector3, b: THREE.Vector3, bow: number, steps: number, out: number[], jitter = 0, r?: () => number) {
    const mid = a.clone().add(b).multiplyScalar(0.5).multiplyScalar(bow);
    let px = a.x;
    let py = a.y;
    let pz = a.z;
    for (let i = 1; i <= steps; i++) {
      const t = i / steps;
      const u = 1 - t;
      const j = jitter && r ? (r() - 0.5) * jitter * Math.sin(t * Math.PI) : 0;
      const x = u * u * a.x + 2 * u * t * mid.x + t * t * b.x + j;
      const y = u * u * a.y + 2 * u * t * mid.y + t * t * b.y + j;
      const z = u * u * a.z + 2 * u * t * mid.z + t * t * b.z - j;
      out.push(px, py, pz, x, y, z);
      px = x;
      py = y;
      pz = z;
    }
  }

  private buildFibres() {
    const r = rng(53);
    // Real links: bright fibres that light up when a node is in focus.
    const pos: number[] = [];
    const col: number[] = [];
    brainLinks.forEach((l) => {
      const A = this.positions.get(l.a);
      const B = this.positions.get(l.b);
      if (!A || !B) return;
      const start = pos.length / 3;
      const cross = Math.sign(A.x) !== Math.sign(B.x);
      this.curve(A, B, cross ? 0.3 : 0.86, cross ? 22 : 12, pos, 0.025, r);
      const n = pos.length / 3 - start;
      const left = A.x < 0;
      const cc = l.kind === 'family' ? C.red : left ? C.cyan : C.orange;
      for (let i = 0; i < n; i++) col.push(cc.r, cc.g, cc.b);
      this.linkRanges.push({ a: l.a, b: l.b, start, count: n, fact: l.kind === 'fact' });
    });
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    geo.setAttribute('aCol', new THREE.Float32BufferAttribute(col, 3));
    this.linkAlpha = new Float32Array(pos.length / 3);
    this.linkBase = new Float32Array(pos.length / 3);
    this.linkAlphaAttr = new THREE.BufferAttribute(this.linkAlpha, 1);
    geo.setAttribute('aAlpha', this.linkAlphaAttr);
    this.group.add(new THREE.LineSegments(geo, new THREE.ShaderMaterial({ ...fibreShader, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending })));
    this.refreshLinks();

    // The neural mess: random-walk dendrites in red, orange, cyan and violet, and bursts at
    // every knowledge node, the way neurons fan out.
    const dp: number[] = [];
    const dc: number[] = [];
    const palette = [C.red, C.orange, C.cyan, C.violet, C.magenta, C.red, C.cyan];
    const d = new THREE.Vector3();
    const p0 = new THREE.Vector3();
    const walks = this.lowPower ? 120 : 230;
    for (let k = 0; k < walks; k++) {
      const side = r() < 0.5 ? -1 : 1;
      d.set(0.3 + r() * 0.7, r() * 2 - 1, r() * 2 - 1).normalize();
      cortex(side, d, p0);
      p0.multiplyScalar(0.7 + r() * 0.28);
      const cc = palette[Math.floor(r() * palette.length)];
      const dir = new THREE.Vector3(r() - 0.5, r() - 0.5, r() - 0.5).normalize();
      const len = 4 + Math.floor(r() * 9);
      const p = p0.clone();
      for (let s = 0; s < len; s++) {
        dir.add(new THREE.Vector3(r() - 0.5, r() - 0.5, r() - 0.5).multiplyScalar(0.6)).normalize();
        const q = p.clone().addScaledVector(dir, 0.025 + r() * 0.035);
        dp.push(p.x, p.y, p.z, q.x, q.y, q.z);
        const a = 0.18 + 0.4 * (1 - s / len);
        dc.push(cc.r * a, cc.g * a, cc.b * a, cc.r * a, cc.g * a, cc.b * a);
        p.copy(q);
      }
    }
    brainNodes.forEach((n) => {
      const P = this.positions.get(n.id)!;
      const cc = n.side === 'left' ? (r() < 0.6 ? C.white : C.cyan) : r() < 0.5 ? C.orange : C.magenta;
      const spikes = 5 + Math.floor(r() * 5);
      for (let s = 0; s < spikes; s++) {
        const dir = new THREE.Vector3(r() - 0.5, r() - 0.5, r() - 0.5).normalize();
        const q = P.clone().addScaledVector(dir, 0.03 + r() * 0.06);
        dp.push(P.x, P.y, P.z, q.x, q.y, q.z);
        dc.push(cc.r * 0.9, cc.g * 0.9, cc.b * 0.9, cc.r * 0.1, cc.g * 0.1, cc.b * 0.1);
      }
    });
    const dgeo = new THREE.BufferGeometry();
    dgeo.setAttribute('position', new THREE.Float32BufferAttribute(dp, 3));
    dgeo.setAttribute('aCol', new THREE.Float32BufferAttribute(dc, 3));
    dgeo.setAttribute('aAlpha', new THREE.Float32BufferAttribute(new Float32Array(dp.length / 3).fill(1), 1));
    this.dendriteMat = new THREE.ShaderMaterial({ ...fibreShader, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending });
    this.group.add(new THREE.LineSegments(dgeo, this.dendriteMat));
  }

  private buildNodes() {
    const pos: number[] = [];
    const col: number[] = [];
    brainNodes.forEach((n) => {
      const p = this.positions.get(n.id)!;
      pos.push(p.x, p.y, p.z);
      const c = n.side === 'left' ? C.cyan : C.orange;
      col.push(c.r, c.g, c.b);
    });
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    geo.setAttribute('aCol', new THREE.Float32BufferAttribute(col, 3));
    this.nodeState = new Float32Array(brainNodes.length).fill(0.5);
    this.nodeStateAttr = new THREE.BufferAttribute(this.nodeState, 1);
    geo.setAttribute('aState', this.nodeStateAttr);
    this.nodeMat = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: { uPx: { value: this.renderer.getPixelRatio() }, uTime: { value: 0 } },
      vertexShader: `
        attribute float aState;
        attribute vec3 aCol;
        uniform float uPx;
        uniform float uTime;
        varying float vS;
        varying vec3 vC;
        void main() {
          vS = aState;
          vC = aCol;
          vec4 mv = modelViewMatrix * vec4(position, 1.0);
          float pulse = aState > 0.9 ? 1.0 + 0.3 * sin(uTime * 5.0) : 1.0 + 0.08 * sin(uTime * 2.0 + position.y * 20.0);
          gl_PointSize = (7.0 + aState * 16.0) * pulse * uPx;
          gl_Position = projectionMatrix * mv;
        }`,
      fragmentShader: `
        varying float vS;
        varying vec3 vC;
        void main() {
          float d = length(gl_PointCoord - 0.5);
          float core = smoothstep(0.12, 0.0, d);
          float halo = smoothstep(0.5, 0.0, d) * 0.45;
          float a = (core + halo) * (0.35 + 0.65 * vS);
          if (a < 0.01) discard;
          gl_FragColor = vec4(mix(vC, vec3(1.0), core) * a, a);
        }`,
    });
    const pts = new THREE.Points(geo, this.nodeMat);
    pts.renderOrder = 3;
    this.group.add(pts);
  }

  /** Sparks drifting around the brain, like the reference's dust of signals. */
  private buildDust() {
    const r = rng(77);
    const pos: number[] = [];
    const col: number[] = [];
    const palette = [C.cyan, C.violet, C.red, C.orange, C.white];
    for (let i = 0; i < (this.lowPower ? 900 : 1800); i++) {
      const a = r() * Math.PI * 2;
      const b = Math.acos(r() * 2 - 1);
      const rad = 0.9 + Math.pow(r(), 2) * 1.2;
      pos.push(Math.sin(b) * Math.cos(a) * rad * 0.9, Math.cos(b) * rad * 0.7, Math.sin(b) * Math.sin(a) * rad * 1.2);
      const c = palette[Math.floor(r() * palette.length)];
      const k = 0.2 + r() * 0.5;
      col.push(c.r * k, c.g * k, c.b * k);
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    geo.setAttribute('aCol', new THREE.Float32BufferAttribute(col, 3));
    const mat = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: { uPx: { value: this.renderer.getPixelRatio() } },
      vertexShader: `attribute vec3 aCol; uniform float uPx; varying vec3 vC; void main(){ vC = aCol; gl_PointSize = 1.6 * uPx; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
      fragmentShader: `varying vec3 vC; void main(){ float d = length(gl_PointCoord - 0.5); if (d > 0.5) discard; gl_FragColor = vec4(vC, 1.0); }`,
    });
    this.group.add(new THREE.Points(geo, mat));
  }

  // ---------------------------------------------------------------- state

  private refreshLinks() {
    const id = this.pinned ?? this.hover;
    const set = new Set<string>();
    if (id) {
      set.add(id);
      brainLinks.forEach((l) => (l.a === id ? set.add(l.b) : l.b === id ? set.add(l.a) : null));
    }
    this.linkRanges.forEach((L) => {
      let a = L.fact ? 0.2 : 0.12;
      if (id) a = L.a === id || L.b === id ? 1 : a * 0.3;
      for (let i = 0; i < L.count; i++) this.linkAlpha[L.start + i] = a;
    });
    this.linkAlphaAttr.needsUpdate = true;
    if (this.nodeState) {
      brainNodes.forEach((n, i) => {
        this.nodeState[i] = id ? (n.id === id ? 1 : set.has(n.id) ? 0.8 : 0.3) : 0.5;
      });
      this.nodeStateAttr.needsUpdate = true;
    }
  }

  setPinned(id: string | null) {
    this.pinned = id;
    this.refreshLinks();
  }

  get focus() {
    return this.pinned ?? this.hover;
  }

  coords(id: string) {
    return this.positions.get(id) ?? null;
  }

  // ---------------------------------------------------------------- input

  private onDown = (e: PointerEvent) => {
    this.dragging = true;
    this.moved = false;
    this.dragFrom = { x: e.clientX, y: e.clientY, yaw: this.yaw, pitch: this.pitch };
  };

  private onMove = (e: PointerEvent) => {
    const r = this.container.getBoundingClientRect();
    this.pointer = { x: e.clientX - r.left, y: e.clientY - r.top, inside: e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom };
    if (this.dragging) {
      const dx = e.clientX - this.dragFrom.x;
      const dy = e.clientY - this.dragFrom.y;
      if (Math.hypot(dx, dy) > 4) this.moved = true;
      this.yaw = this.dragFrom.yaw + dx * 0.008;
      this.pitch = Math.max(-0.7, Math.min(0.7, this.dragFrom.pitch + dy * 0.005));
      this.idleFor = 0;
    }
  };

  private onUp = () => {
    if (this.dragging && !this.moved && this.pointer.inside) {
      const h = this.hit();
      this.pinned = h && h !== this.pinned ? h : null;
      this.cb.onPick(this.pinned);
      this.refreshLinks();
    }
    this.dragging = false;
  };

  private onLeave = () => {
    this.pointer.inside = false;
  };

  private hit() {
    let best: string | null = null;
    let bd = 18;
    this.screen.forEach((s) => {
      if (!s.visible || s.front < 0.35) return;
      const d = Math.hypot(s.x - this.pointer.x, s.y - this.pointer.y);
      if (d < bd) {
        bd = d;
        best = s.id;
      }
    });
    return best;
  }

  private resize = () => {
    const r = this.container.getBoundingClientRect();
    this.width = Math.max(1, r.width);
    this.height = Math.max(1, r.height);
    this.renderer.setSize(this.width, this.height, false);
    this.renderer.domElement.style.width = `${this.width}px`;
    this.renderer.domElement.style.height = `${this.height}px`;
    this.camera.aspect = this.width / this.height;
    // Side view; further back on narrow screens so the whole brain fits.
    // Fit about 2.7 units of brain across the frame.
    const dist = Math.max(5, 2.7 / (0.573 * this.camera.aspect));
    this.camera.position.set(0, 0.25, dist);
    this.camera.lookAt(0, -0.08, 0);
    this.camera.updateProjectionMatrix();
  };

  // ---------------------------------------------------------------- loop

  private loop = (now: number) => {
    this.raf = requestAnimationFrame(this.loop);
    if (!this.visible) return;
    const dt = Math.min(0.05, (now - this.last) / 1000 || 0.016);
    this.last = now;
    this.time += dt;
    this.idleFor += dt;
    // Turn slowly unless the visitor is holding or reading a node.
    if (!this.reduced && !this.dragging && !this.focus) this.spin += dt * 0.16;
    if (!this.dragging && this.idleFor > 3) this.pitch *= 1 - dt * 0.6;
    // The brain's length runs along z; turning it 90 degrees shows a hemisphere side-on.
    const yaw = Math.PI / 2 + this.spin + this.yaw;
    this.group.rotation.set(this.pitch * 0.6 + 0.12, yaw, 0);
    this.facing = Math.sin(yaw) > 0 ? -1 : 1;
    this.cortexMat.uniforms.uTime.value = this.time;
    this.nodeMat.uniforms.uTime.value = this.time;

    if (this.pointer.inside && !this.dragging) {
      const h = this.hit();
      if (h !== this.hover) {
        this.hover = h;
        this.cb.onHover(h);
        this.refreshLinks();
        this.renderer.domElement.style.cursor = h ? 'pointer' : 'grab';
      }
    } else if (this.hover && !this.pointer.inside) {
      this.hover = null;
      this.cb.onHover(null);
      this.refreshLinks();
    }

    this.renderer.render(this.scene, this.camera);
    this.project();
    this.onFrame?.();
  };

  private project() {
    this.group.updateMatrixWorld();
    const m = this.group.matrixWorld;
    const cam = this.camera.position;
    const centre = new THREE.Vector3().applyMatrix4(m);
    this.screen = brainNodes.map((n) => {
      const p = this.tmp.copy(this.positions.get(n.id)!).applyMatrix4(m);
      // Facing: how much the node sits on the camera's side of the brain.
      const toCam = cam.clone().sub(centre).normalize();
      const out = p.clone().sub(centre).normalize();
      const front = Math.max(0, Math.min(1, out.dot(toCam) * 1.6 + 0.2));
      p.project(this.camera);
      return { id: n.id, x: (p.x * 0.5 + 0.5) * this.width, y: (-p.y * 0.5 + 0.5) * this.height, front, visible: p.z < 1 };
    });
  }

  get rotation() {
    return { yaw: this.group.rotation.y, pitch: this.group.rotation.x };
  }

  dispose() {
    cancelAnimationFrame(this.raf);
    this.io.disconnect();
    const dom = this.renderer.domElement;
    dom.removeEventListener('pointerdown', this.onDown);
    window.removeEventListener('pointermove', this.onMove);
    window.removeEventListener('pointerup', this.onUp);
    dom.removeEventListener('pointerleave', this.onLeave);
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
