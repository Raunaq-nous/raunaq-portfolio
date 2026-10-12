import * as THREE from 'three';
import { brainLinks, brainNodes, brainRegions, type BrainNode } from '@/data/brain';

/*
 * The hero brain. A point-cloud cortex (two hemispheres with gyri and sulci, a cerebellum),
 * knowledge nodes placed in regions on each hemisphere, neuron-like fibres between real links,
 * dendrite bursts at each region hub and faint callosal fibres across the midline.
 * Seen from above and behind, so the left hemisphere is on the left of the screen.
 */

export interface BrainCallbacks {
  onHover: (id: string | null) => void;
  onPick: (id: string | null) => void;
}

export interface ScreenNode {
  id: string;
  x: number;
  y: number;
  /** 0 (back) .. 1 (front), for label fading. */
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

// Gyri: wavy ridges warped by low-frequency noise, so the folds read as worm-like bands.
// Returns ~1 on a gyrus (ridge) and ~0 in a sulcus (groove).
function fold(x: number, y: number, z: number) {
  const w1 = 0.22 * Math.sin(5.3 * x + 3.1 * y) + 0.14 * Math.sin(9.7 * x - 4.3 * z + 1.7) + 0.08 * Math.sin(13 * y + 7 * z);
  const w2 = 0.2 * Math.sin(4.1 * z + 2.7 * y + 0.6) + 0.12 * Math.sin(8.3 * y - 6.1 * x);
  const a = Math.sin(19 * (z + w1));
  const b = Math.sin(17 * (x * 0.8 + y * 0.6 + w2));
  const m = 0.5 + 0.5 * Math.sin(3.3 * x + 2.2 * z + 1.1); // which band dominates where
  return Math.pow(0.5 + 0.5 * (a * m + b * (1 - m)), 1.8);
}

/**
 * A point on one hemisphere's surface for a unit direction, before folding. In `d`, x > 0 points
 * away from the midline (lateral) and x < 0 toward it (medial); -z is the front of the brain.
 */
function cortex(side: number, d: THREE.Vector3, out: THREE.Vector3) {
  const lateral = d.x;
  // Seen from above: narrow at the front, widest over the parietal lobe, tapering at the back.
  const zf = d.z; // -1 front, +1 back
  const rx = 0.6 * (0.86 + 0.18 * Math.exp(-((zf - 0.25) ** 2) / 0.35)) * (zf > 0.7 ? 1 - (zf - 0.7) * 0.6 : 1);
  const ry = 0.62;
  const rz = zf < 0 ? 1.12 : 1.02;
  out.set(lateral * rx, d.y * ry, d.z * rz);
  if (lateral < 0) out.x *= 0.16; // flat medial wall
  if (d.y < -0.2) out.y = -0.2 * ry + (d.y + 0.2) * ry * 0.5; // flatter base
  // Temporal lobe: bulges low and to the side.
  const temporal = Math.max(0, 1 - Math.hypot((d.z + 0.1) / 0.45, (d.y + 0.45) / 0.35)) * Math.max(0, lateral);
  out.x += temporal * 0.1;
  out.y -= temporal * 0.07;
  // Medial wall sits just off the midline, leaving a dark longitudinal fissure.
  out.x = side * (out.x + 0.15);
  return out;
}

export class BrainScene {
  private renderer: THREE.WebGLRenderer;
  private scene = new THREE.Scene();
  private camera: THREE.PerspectiveCamera;
  private group = new THREE.Group();
  private nodeMat!: THREE.ShaderMaterial;
  private nodeState!: Float32Array;
  private nodeStateAttr!: THREE.BufferAttribute;
  private fibreMat!: THREE.LineBasicMaterial;
  private linkGeo!: THREE.BufferGeometry;
  private linkAlpha!: Float32Array;
  private linkAlphaAttr!: THREE.BufferAttribute;
  private linkRanges: { a: string; b: string; start: number; count: number; fact: boolean }[] = [];
  private positions = new Map<string, THREE.Vector3>();
  private regionHubs = new Map<string, THREE.Vector3>();
  private raf = 0;
  private time = 0;
  private last = 0;
  private width = 1;
  private height = 1;
  private yaw = 0;
  private pitch = 0;
  private dragging = false;
  private dragFrom = { x: 0, y: 0, yaw: 0, pitch: 0 };
  private moved = false;
  private pointer = { x: -1, y: -1, inside: false };
  private hover: string | null = null;
  private pinned: string | null = null;
  private region: string | null = null;
  private visible = true;
  private tmp = new THREE.Vector3();
  screen: ScreenNode[] = [];
  regionScreen = new Map<string, { x: number; y: number; visible: boolean }>();
  onFrame?: () => void;

  constructor(private container: HTMLElement, private cb: BrainCallbacks, private reduced: boolean) {
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.renderer.setClearColor(0x000000, 0);
    container.appendChild(this.renderer.domElement);
    this.renderer.domElement.style.display = 'block';
    this.renderer.domElement.style.touchAction = 'pan-y';
    this.camera = new THREE.PerspectiveCamera(34, 1, 0.1, 50);
    this.camera.position.set(0, 3.7, 1.9);
    this.camera.lookAt(0, -0.1, 0.05);
    this.scene.add(this.group);
    this.buildCortex();
    this.placeNodes();
    this.buildFibres();
    this.buildNodes();
    this.resize();
    const dom = this.renderer.domElement;
    dom.addEventListener('pointerdown', this.onDown);
    window.addEventListener('pointermove', this.onMove);
    window.addEventListener('pointerup', this.onUp);
    dom.addEventListener('pointerleave', this.onLeave);
    window.addEventListener('resize', this.resize);
    this.io = new IntersectionObserver(([e]) => (this.visible = e.isIntersecting));
    this.io.observe(container);
    this.loop(0);
  }
  private io: IntersectionObserver;

  // ---------------------------------------------------------------- build

  private buildCortex() {
    const r = rng(11);
    const pos: number[] = [];
    const shade: number[] = [];
    const nrm: number[] = [];
    const d = new THREE.Vector3();
    const p = new THREE.Vector3();
    const q = new THREE.Vector3();
    const N = 46000;
    for (const side of [-1, 1]) {
      for (let i = 0; i < N / 2; i++) {
        // Uniform direction; mirrored so x>0 is lateral for both hemispheres.
        const u = r() * 2 - 1;
        const t = r() * Math.PI * 2;
        const s = Math.sqrt(1 - u * u);
        d.set(s * Math.cos(t), u, s * Math.sin(t));
        if (d.y < -0.55 && r() < 0.7) continue; // the underside is barely seen
        cortex(side, d, p);
        const f = fold(p.x * 1.5, p.y * 1.5, p.z * 1.5);
        // Sulci sink in, gyri stand proud.
        const c = new THREE.Vector3(side * 0.42, -0.05, 0);
        q.copy(p).sub(c).normalize();
        p.addScaledVector(q, (f - 0.5) * 0.035);
        const medial = d.x < 0 ? 0.18 : 1;
        pos.push(p.x, p.y, p.z);
        nrm.push(q.x, q.y, q.z);
        shade.push((0.06 + 0.94 * f) * medial);
      }
    }
    // Cerebellum: small, finely striped, tucked under the back.
    for (let i = 0; i < 3800; i++) {
      const u = r() * 2 - 1;
      const t = r() * Math.PI * 2;
      const s = Math.sqrt(1 - u * u);
      const x = s * Math.cos(t) * 0.5;
      const y = u * 0.2 - 0.42;
      const z = s * Math.sin(t) * 0.3 + 0.82;
      const stripe = 0.5 + 0.5 * Math.sin(y * 90);
      pos.push(x, y, z);
      nrm.push(x, y + 0.42, z - 0.82);
      shade.push(0.1 + 0.4 * stripe);
    }
    // Interior dust.
    for (let i = 0; i < 2600; i++) {
      pos.push((r() - 0.5) * 1.3, (r() - 0.6) * 0.9, (r() - 0.5) * 1.8);
      nrm.push(0, 1, 0);
      shade.push(0.04 + r() * 0.08);
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    geo.setAttribute('aShade', new THREE.Float32BufferAttribute(shade, 1));
    geo.setAttribute('aNormal', new THREE.Float32BufferAttribute(nrm, 3));
    const mat = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: { uPx: { value: this.renderer.getPixelRatio() }, uTime: { value: 0 } },
      vertexShader: `
        attribute float aShade;
        attribute vec3 aNormal;
        uniform float uPx;
        uniform float uTime;
        varying float vA;
        void main() {
          vec4 mv = modelViewMatrix * vec4(position, 1.0);
          vec3 n = normalize(normalMatrix * aNormal);
          vec3 v = normalize(-mv.xyz);
          float facing = dot(n, v);
          // Rim light at the silhouette, soft key light from above, back faces nearly gone.
          float rim = pow(1.0 - abs(facing), 2.5);
          float key = clamp(dot(n, normalize(vec3(-0.35, 0.4, 0.85))), 0.0, 1.0);
          float back = smoothstep(-0.35, 0.15, facing);
          float flick = 0.92 + 0.08 * sin(uTime * 2.0 + position.x * 40.0 + position.z * 31.0);
          vA = (aShade * (0.25 + 0.75 * key) * back + rim * 0.5 * aShade + rim * 0.1) * flick;
          gl_PointSize = (1.0 + aShade * 1.2 + rim * 0.8) * uPx;
          gl_Position = projectionMatrix * mv;
        }`,
      fragmentShader: `
        varying float vA;
        void main() {
          float d = length(gl_PointCoord - 0.5);
          if (d > 0.5) discard;
          gl_FragColor = vec4(vec3(0.93), vA * 0.62 * smoothstep(0.5, 0.1, d));
        }`,
    });
    this.cortexMat = mat;
    this.group.add(new THREE.Points(geo, mat));
  }
  private cortexMat!: THREE.ShaderMaterial;

  /** Regions spread over each hemisphere's upper and lateral surface; nodes cluster around them. */
  private placeNodes() {
    const r = rng(29);
    const d = new THREE.Vector3();
    const p = new THREE.Vector3();
    (['left', 'right'] as const).forEach((side) => {
      const sign = side === 'left' ? -1 : 1;
      const regs = brainRegions.filter((x) => x.side === side);
      regs.forEach((reg, i) => {
        // Walk regions front to back along the hemisphere, alternating high and low.
        const t = regs.length === 1 ? 0.5 : i / (regs.length - 1);
        const z = -0.82 + t * 1.55;
        const high = i % 2 === 0;
        const az = high ? 0.35 : 0.85;
        const hub = new THREE.Vector3();
        d.set(Math.sin(az), high ? 0.78 : 0.25, z).normalize();
        cortex(sign, d, hub);
        hub.multiplyScalar(0.94);
        this.regionHubs.set(reg.id, hub);
        const ns = brainNodes.filter((n) => n.region === reg.id);
        const spread = 0.13 + Math.min(0.2, ns.length * 0.006);
        ns.forEach((n) => {
          const q = new THREE.Vector3(
            Math.abs(d.x + (r() - 0.5) * spread * 2.4),
            d.y + (r() - 0.5) * spread * 2.2,
            d.z + (r() - 0.5) * spread * 2.6,
          ).normalize();
          cortex(sign, q, p);
          this.positions.set(n.id, p.clone().multiplyScalar(0.985));
        });
      });
    });
  }

  private curve(a: THREE.Vector3, b: THREE.Vector3, bow: number, steps: number, out: number[]) {
    const mid = a.clone().add(b).multiplyScalar(0.5);
    const c = mid.multiplyScalar(bow);
    let px = a.x;
    let py = a.y;
    let pz = a.z;
    for (let i = 1; i <= steps; i++) {
      const t = i / steps;
      const u = 1 - t;
      const x = u * u * a.x + 2 * u * t * c.x + t * t * b.x;
      const y = u * u * a.y + 2 * u * t * c.y + t * t * b.y;
      const z = u * u * a.z + 2 * u * t * c.z + t * t * b.z;
      out.push(px, py, pz, x, y, z);
      px = x;
      py = y;
      pz = z;
    }
  }

  private buildFibres() {
    const r = rng(53);
    // Link fibres: one curve per link, highlightable.
    const pos: number[] = [];
    brainLinks.forEach((l) => {
      const A = this.positions.get(l.a);
      const B = this.positions.get(l.b);
      if (!A || !B) return;
      const start = pos.length / 3;
      const cross = Math.sign(A.x) !== Math.sign(B.x);
      this.curve(A, B, cross ? 0.35 : 0.8, cross ? 16 : 8, pos);
      this.linkRanges.push({ a: l.a, b: l.b, start, count: pos.length / 3 - start, fact: l.kind === 'fact' });
    });
    this.linkGeo = new THREE.BufferGeometry();
    this.linkGeo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    this.linkAlpha = new Float32Array(pos.length / 3);
    this.linkAlphaAttr = new THREE.BufferAttribute(this.linkAlpha, 1);
    this.linkGeo.setAttribute('aAlpha', this.linkAlphaAttr);
    const linkMat = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      vertexShader: `attribute float aAlpha; varying float vA; void main(){ vA = aAlpha; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
      fragmentShader: `varying float vA; void main(){ gl_FragColor = vec4(vec3(0.95), vA); }`,
    });
    this.group.add(new THREE.LineSegments(this.linkGeo, linkMat));
    this.refreshLinks();

    // Dendrites: bursts of short branching strokes at each region hub, and across the midline.
    const den: number[] = [];
    this.regionHubs.forEach((hub) => {
      const branches = 16 + Math.floor(r() * 10);
      for (let b = 0; b < branches; b++) {
        const p = hub.clone();
        const dir = new THREE.Vector3(r() - 0.5, r() - 0.5, r() - 0.5).normalize();
        const len = 3 + Math.floor(r() * 5);
        for (let s = 0; s < len; s++) {
          dir.add(new THREE.Vector3(r() - 0.5, r() - 0.5, r() - 0.5).multiplyScalar(0.7)).normalize();
          const q = p.clone().addScaledVector(dir, 0.03 + r() * 0.03);
          den.push(p.x, p.y, p.z, q.x, q.y, q.z);
          p.copy(q);
        }
      }
    });
    const d = new THREE.Vector3();
    const A = new THREE.Vector3();
    const B = new THREE.Vector3();
    for (let k = 0; k < 70; k++) {
      d.set(0.2 + r() * 0.5, r() * 0.9, r() * 1.6 - 0.8).normalize();
      cortex(-1, d, A);
      d.set(0.2 + r() * 0.5, r() * 0.9, r() * 1.6 - 0.8).normalize();
      cortex(1, d, B);
      this.curve(A.multiplyScalar(0.96), B.multiplyScalar(0.96), 0.25, 14, den);
    }
    const dgeo = new THREE.BufferGeometry();
    dgeo.setAttribute('position', new THREE.Float32BufferAttribute(den, 3));
    this.fibreMat = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.1, depthWrite: false, blending: THREE.AdditiveBlending });
    this.group.add(new THREE.LineSegments(dgeo, this.fibreMat));
  }

  private buildNodes() {
    const pos: number[] = [];
    brainNodes.forEach((n) => {
      const p = this.positions.get(n.id)!;
      pos.push(p.x, p.y, p.z);
    });
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    this.nodeState = new Float32Array(brainNodes.length).fill(0.5);
    this.nodeStateAttr = new THREE.BufferAttribute(this.nodeState, 1);
    geo.setAttribute('aState', this.nodeStateAttr);
    this.nodeMat = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      uniforms: { uPx: { value: this.renderer.getPixelRatio() }, uTime: { value: 0 } },
      vertexShader: `
        attribute float aState;
        uniform float uPx;
        uniform float uTime;
        varying float vS;
        void main() {
          vS = aState;
          vec4 mv = modelViewMatrix * vec4(position, 1.0);
          float pulse = aState > 0.9 ? 1.0 + 0.25 * sin(uTime * 5.0) : 1.0;
          gl_PointSize = (3.0 + aState * 6.0) * pulse * uPx;
          gl_Position = projectionMatrix * mv;
        }`,
      fragmentShader: `
        varying float vS;
        void main() {
          vec2 c = gl_PointCoord - 0.5;
          float d = length(c);
          float ring = smoothstep(0.5, 0.42, d) * smoothstep(0.3, 0.38, d);
          float core = smoothstep(0.22, 0.0, d);
          float a = max(core, ring * step(0.7, vS));
          if (a < 0.02) discard;
          gl_FragColor = vec4(vec3(1.0), a * (0.35 + 0.65 * vS));
        }`,
    });
    const pts = new THREE.Points(geo, this.nodeMat);
    pts.renderOrder = 3;
    this.group.add(pts);
  }

  // ---------------------------------------------------------------- state

  private focusSet() {
    const id = this.pinned ?? this.hover;
    const set = new Set<string>();
    if (id) {
      set.add(id);
      brainLinks.forEach((l) => (l.a === id ? set.add(l.b) : l.b === id ? set.add(l.a) : null));
    }
    return { id, set };
  }

  private refreshLinks() {
    const { id, set } = this.focusSet();
    const reg = this.region;
    const regOf = (nid: string) => brainNodes.find((n) => n.id === nid)?.region;
    this.linkRanges.forEach((L) => {
      let a = L.fact ? 0.09 : 0.05;
      if (reg) a = regOf(L.a) === reg || regOf(L.b) === reg ? (L.fact ? 0.55 : 0.35) : a * 0.4;
      if (id) a = L.a === id || L.b === id ? 0.95 : a * 0.35;
      for (let i = 0; i < L.count; i++) this.linkAlpha[L.start + i] = a;
    });
    this.linkAlphaAttr.needsUpdate = true;
    if (this.nodeState) {
      brainNodes.forEach((n, i) => {
        let s = 0.45;
        if (reg) s = n.region === reg ? 0.75 : 0.25;
        if (id) s = n.id === id ? 1 : set.has(n.id) ? 0.8 : s * 0.6;
        this.nodeState[i] = s;
      });
      this.nodeStateAttr.needsUpdate = true;
    }
  }

  setRegion(id: string | null) {
    this.region = id;
    this.refreshLinks();
  }

  setPinned(id: string | null) {
    this.pinned = id;
    this.refreshLinks();
  }

  get focus() {
    return this.pinned ?? this.hover;
  }

  /** World position of a node, for the readout coordinates. */
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
      this.yaw = this.dragFrom.yaw + dx * 0.006;
      this.pitch = Math.max(-0.6, Math.min(0.5, this.dragFrom.pitch + dy * 0.004));
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
    let bd = 16;
    this.screen.forEach((s) => {
      if (!s.visible || s.front < 0.25) return;
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
    // Keep the whole brain in frame on narrow screens.
    this.camera.position.set(0, 3.7, 1.9).multiplyScalar(this.camera.aspect < 1 ? 1.4 : 1);
    this.camera.lookAt(0, -0.1, 0.05);
    this.camera.updateProjectionMatrix();
  };

  // ---------------------------------------------------------------- loop

  private loop = (now: number) => {
    this.raf = requestAnimationFrame(this.loop);
    if (!this.visible) return;
    const dt = Math.min(0.05, (now - this.last) / 1000 || 0.016);
    this.last = now;
    this.time += dt;
    const sway = this.reduced ? 0 : Math.sin(this.time * 0.11) * 0.38;
    const tilt = this.reduced ? 0 : Math.sin(this.time * 0.07 + 1) * 0.12;
    this.group.rotation.set(this.pitch + tilt, this.yaw + sway, 0);
    this.cortexMat.uniforms.uTime.value = this.time;
    this.nodeMat.uniforms.uTime.value = this.time;
    this.fibreMat.opacity = 0.08 + 0.03 * Math.sin(this.time * 0.9);

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
    const camZ = this.camera.position.clone();
    this.screen = brainNodes.map((n) => {
      const p = this.tmp.copy(this.positions.get(n.id)!).applyMatrix4(m);
      const dist = p.distanceTo(camZ);
      p.project(this.camera);
      return {
        id: n.id,
        x: (p.x * 0.5 + 0.5) * this.width,
        y: (-p.y * 0.5 + 0.5) * this.height,
        front: Math.max(0, Math.min(1, (4.75 - dist) / 1.1)),
        visible: p.z < 1,
      };
    });
    this.regionHubs.forEach((h, id) => {
      const p = this.tmp.copy(h).applyMatrix4(m).project(this.camera);
      this.regionScreen.set(id, { x: (p.x * 0.5 + 0.5) * this.width, y: (-p.y * 0.5 + 0.5) * this.height, visible: p.z < 1 });
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
