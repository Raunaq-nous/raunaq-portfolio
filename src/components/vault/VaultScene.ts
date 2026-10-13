import * as THREE from 'three';
import type { VaultBuild } from '@/data/aiBuilds';
import type { AtlasNode } from '@/data/atlas';
import { videoSlots } from '@/data/assets';
import { asset } from '@/lib/asset';
import { MemoryLayer } from '../atlas/MemoryLayer';

/*
 * The AI builds vault, built like the Memory Palace and lit like the tesseract in Interstellar.
 * Every build has its own deep room: warm shelf strata run along its walls, floor and ceiling,
 * with shafts of light and dust in the air. Inside:
 *   back wall   the interface capture, lifted from 2D into 3D the palace way
 *               (depth map, photo, lift, orbit), in natural colour
 *   left wall   the codebase graph: interface, application, data, AI and delivery
 *   right wall  three video screens: walkthrough, product launch, demo
 */

export type VaultView = 'overview' | 'interface' | 'architecture' | 'media';

export interface StackGraph {
  source: string;
  layers: { id: string; label: string }[];
  nodes: { id: string; label: string; layer: string; role: string }[];
  edges: { s: string; t: string; label?: string }[];
  features: string[];
}

export interface VaultCallbacks {
  onHover: (index: number | null) => void;
  onEnter: (index: number | null) => void;
  onView: (view: VaultView) => void;
  onGraph: (index: number, graph: StackGraph | null) => void;
  onStage?: (stage: number) => void;
}

const RW = 11; // room width
const RH = 8; // room height
const RD = 20; // room depth, from the open front (z = 0) back into the vault
const PX = 13.5;
const PY = 10;

const WARM = [
  new THREE.Color(0.86, 0.62, 0.32),
  new THREE.Color(0.45, 0.3, 0.17),
  new THREE.Color(0.95, 0.88, 0.72),
  new THREE.Color(0.3, 0.21, 0.13),
  new THREE.Color(0.45, 0.58, 0.72),
  new THREE.Color(0.7, 0.45, 0.24),
];

const rng = (seed: number) => {
  let s = seed >>> 0;
  return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
};

interface Room {
  build: VaultBuild;
  index: number;
  c: THREE.Vector3; // centre of the room's front opening
  hit: THREE.Mesh;
  ids: string[]; // moment ids, one per capture (or the spec sheet)
  shot: number;
  graph?: THREE.Group;
  graphNodes: { id: string; label: string; pos: THREE.Vector3; code: string; section: number }[];
  graphSections: { label: string; pos: THREE.Vector3; end: THREE.Vector3 }[];
  media?: THREE.Group;
  screens: { label: string; status: string; pos: THREE.Vector3; video?: HTMLVideoElement }[];
  glow: number;
}

export class VaultScene {
  private renderer: THREE.WebGLRenderer;
  private scene = new THREE.Scene();
  private camera = new THREE.PerspectiveCamera(42, 1, 0.1, 400);
  private rooms: Room[] = [];
  private memory!: MemoryLayer;
  private anchors = new Map<string, { origin: [number, number, number]; forward: [number, number, number] }>();
  private raycaster = new THREE.Raycaster();
  private ndc = new THREE.Vector2();
  private pointer = { x: 0, y: 0, nx: 0, ny: 0, inside: false };
  private hover: number | null = null;
  private entered: number | null = null;
  private view: VaultView = 'overview';
  private stageNow = 0;
  private camPos = new THREE.Vector3();
  private camTarget = new THREE.Vector3();
  private tween: { from: THREE.Vector3; to: THREE.Vector3; tFrom: THREE.Vector3; tTo: THREE.Vector3; t: number; dur: number } | null = null;
  private timers: number[] = [];
  private time = 0;
  private last = 0;
  private raf = 0;
  private width = 1;
  private height = 1;
  private visible = true;
  private io: IntersectionObserver;
  private dustMat!: THREE.ShaderMaterial;
  private shaftMat!: THREE.ShaderMaterial;
  private strataMat!: THREE.ShaderMaterial;
  private labels: HTMLDivElement[] = [];
  private graphLabels: HTMLDivElement[] = [];
  private mediaLabels: HTMLDivElement[] = [];
  private tagEls: HTMLDivElement[] = [];
  private tagSvg: SVGSVGElement;
  private overviewTarget = new THREE.Vector3();
  private overviewPos = new THREE.Vector3();
  private tmp = new THREE.Vector3();
  private disposed = false;

  constructor(private container: HTMLElement, private overlay: HTMLElement, private builds: VaultBuild[], private cb: VaultCallbacks, private reduced: boolean, private lowPower: boolean) {
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, lowPower ? 1.5 : 2));
    this.renderer.setClearColor(0x000000, 0);
    container.appendChild(this.renderer.domElement);
    const dom = this.renderer.domElement;
    dom.style.display = 'block';
    dom.style.touchAction = 'pan-y';
    this.tagSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    this.tagSvg.setAttribute('class', 'atlas-momentsvg');
    overlay.appendChild(this.tagSvg);
    for (let i = 0; i < 6; i++) {
      const el = document.createElement('div');
      el.className = 'atlas-tag';
      overlay.appendChild(el);
      this.tagEls.push(el);
    }
    this.layout();
    this.buildTesseract();
    this.buildMoments();
    this.resize();
    this.camera.position.copy(this.overviewPos);
    this.camPos.copy(this.overviewPos);
    this.camTarget.copy(this.overviewTarget);
    this.camera.lookAt(this.camTarget);
    dom.addEventListener('pointermove', this.onMove);
    dom.addEventListener('pointerleave', this.onLeave);
    dom.addEventListener('click', this.onClick);
    window.addEventListener('resize', this.resize);
    this.io = new IntersectionObserver(([e]) => (this.visible = e.isIntersecting));
    this.io.observe(container);
    this.loop(0);
  }

  // ---------------------------------------------------------------- layout

  private layout() {
    const work = this.builds.map((b, i) => ({ b, i })).filter((x) => x.b.wing === 'work');
    const fun = this.builds.map((b, i) => ({ b, i })).filter((x) => x.b.wing === 'fun');
    const narrow = this.container.getBoundingClientRect().width < 760;
    const place = (list: { b: VaultBuild; i: number }[], x0: number, y0: number, cols: number) =>
      list.forEach(({ b, i }, k) => this.addRoom(b, i, new THREE.Vector3(x0 + (k % cols) * PX, y0 - Math.floor(k / cols) * PY, 0)));
    if (narrow) {
      // A tower of three columns on phones, the fun wing below a gap.
      place(work, 0, PY * 2, 3);
      place(fun, 0, PY * 2 - Math.ceil(work.length / 3) * PY - 3, 3);
    } else {
      place(work, 0, PY, 4);
      place(fun, 4 * PX + 5, PY, 1);
    }
    this.rooms.sort((a, b) => a.index - b.index);
    const xs = this.rooms.map((r) => r.c.x);
    const ys = this.rooms.map((r) => r.c.y);
    this.overviewTarget.set((Math.min(...xs) + Math.max(...xs)) / 2, (Math.min(...ys) + Math.max(...ys)) / 2, -6);
  }

  private addRoom(build: VaultBuild, index: number, c: THREE.Vector3) {
    const hit = new THREE.Mesh(new THREE.BoxGeometry(RW, RH, RD), new THREE.MeshBasicMaterial({ visible: false }));
    hit.position.set(c.x, c.y, -RD / 2);
    hit.userData.index = index;
    this.scene.add(hit);
    const n = Math.max(1, build.shots.length);
    const ids = Array.from({ length: n }, (_, k) => `vault:${build.project.slug}:${k}`);
    ids.forEach((id) => this.anchors.set(id, { origin: [c.x, c.y + 0.2, 1.6], forward: [0, 0, -1] }));
    this.rooms.push({ build, index, c, hit, ids, shot: 0, graphNodes: [], graphSections: [], screens: [], glow: 0 });
    const el = document.createElement('div');
    el.className = 'vault-label';
    el.innerHTML = `<b>${build.code}</b><span> ${build.project.name}</span>`;
    this.overlay.appendChild(el);
    this.labels[index] = el;
  }

  /** The tesseract: shelf strata on every surface of every room, light shafts, warm dust. */
  private buildTesseract() {
    const r = rng(9);
    const pos: number[] = [];
    const col: number[] = [];
    const line = (ax: number, ay: number, az: number, bx: number, by: number, bz: number, cc: THREE.Color, k: number) => {
      pos.push(ax, ay, az, bx, by, bz);
      col.push(cc.r * k, cc.g * k, cc.b * k, cc.r * k * 0.35, cc.g * k * 0.35, cc.b * k * 0.35);
    };
    // Extra empty rooms above and below continue the lattice past the builds.
    const cells = [...this.rooms.map((x) => x.c)];
    const xs = [...new Set(this.rooms.map((x) => x.c.x))];
    const ys = this.rooms.map((x) => x.c.y);
    xs.forEach((x) => [Math.max(...ys) + PY, Math.min(...ys) - PY].forEach((y) => cells.push(new THREE.Vector3(x, y, 0))));
    cells.forEach((c, ci) => {
      const real = ci < this.rooms.length;
      const dim = real ? 1 : 0.4;
      const per = this.lowPower ? 16 : 30;
      // Strata running into depth on the four surfaces.
      for (let s = 0; s < 4; s++) {
        for (let k = 0; k < per; k++) {
          const u = r();
          const cc = WARM[Math.floor(r() * WARM.length)];
          const z0 = -r() * 3;
          const z1 = -RD + r() * 4;
          const b = (0.25 + r() * 0.75) * dim;
          if (s === 0) line(c.x - RW / 2, c.y - RH / 2 + u * RH, z0, c.x - RW / 2, c.y - RH / 2 + u * RH, z1, cc, b);
          if (s === 1) line(c.x + RW / 2, c.y - RH / 2 + u * RH, z0, c.x + RW / 2, c.y - RH / 2 + u * RH, z1, cc, b);
          if (s === 2) line(c.x - RW / 2 + u * RW, c.y - RH / 2, z0, c.x - RW / 2 + u * RW, c.y - RH / 2, z1, cc, b);
          if (s === 3) line(c.x - RW / 2 + u * RW, c.y + RH / 2, z0, c.x - RW / 2 + u * RW, c.y + RH / 2, z1, cc, b);
        }
        // Shelf dividers: short spines across the surface at intervals.
        for (let z = -2; z > -RD; z -= 2.5 + r() * 1.5) {
          const cc = WARM[Math.floor(r() * WARM.length)];
          const b = (0.2 + r() * 0.4) * dim;
          if (s === 0) line(c.x - RW / 2, c.y - RH / 2, z, c.x - RW / 2, c.y + RH / 2, z, cc, b);
          if (s === 1) line(c.x + RW / 2, c.y - RH / 2, z, c.x + RW / 2, c.y + RH / 2, z, cc, b);
          if (s === 2) line(c.x - RW / 2, c.y - RH / 2, z, c.x + RW / 2, c.y - RH / 2, z, cc, b);
          if (s === 3) line(c.x - RW / 2, c.y + RH / 2, z, c.x + RW / 2, c.y + RH / 2, z, cc, b);
        }
      }
      // The opening and the back of the room.
      const cream = WARM[2];
      [0, -RD].forEach((z, zi) => {
        const k = (zi === 0 ? 0.9 : 0.35) * dim;
        line(c.x - RW / 2, c.y - RH / 2, z, c.x + RW / 2, c.y - RH / 2, z, cream, k);
        line(c.x - RW / 2, c.y + RH / 2, z, c.x + RW / 2, c.y + RH / 2, z, cream, k);
        line(c.x - RW / 2, c.y - RH / 2, z, c.x - RW / 2, c.y + RH / 2, z, cream, k);
        line(c.x + RW / 2, c.y - RH / 2, z, c.x + RW / 2, c.y + RH / 2, z, cream, k);
      });
    });
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    geo.setAttribute('aCol', new THREE.Float32BufferAttribute(col, 3));
    this.strataMat = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: { uDim: { value: 1 } },
      vertexShader: `attribute vec3 aCol; varying vec3 vC; void main(){ vC = aCol; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
      fragmentShader: `uniform float uDim; varying vec3 vC; void main(){ gl_FragColor = vec4(vC * uDim, 1.0); }`,
    });
    this.scene.add(new THREE.LineSegments(geo, this.strataMat));

    // Light shafts: long bright beams falling through each room, and dust caught in them.
    const sp: number[] = [];
    const ss: number[] = [];
    const dp: number[] = [];
    const ds: number[] = [];
    this.rooms.forEach((room) => {
      const c = room.c;
      for (let k = 0; k < 4; k++) {
        const x0 = c.x - RW / 2 + r() * RW;
        const x1 = x0 + (r() - 0.5) * 3;
        const z0 = -2 - r() * 6;
        const z1 = z0 - 6 - r() * 8;
        for (let w = 0; w < 8; w++) {
          const o = (w - 4) * 0.06;
          sp.push(x0 + o, c.y + RH / 2, z0, x1 + o, c.y - RH / 2, z1);
          ss.push(r(), r());
        }
      }
      for (let i = 0; i < (this.lowPower ? 140 : 320); i++) {
        dp.push(c.x + (r() - 0.5) * RW, c.y + (r() - 0.5) * RH, -r() * RD);
        ds.push(r());
      }
    });
    const sg = new THREE.BufferGeometry();
    sg.setAttribute('position', new THREE.Float32BufferAttribute(sp, 3));
    sg.setAttribute('aSeed', new THREE.Float32BufferAttribute(ss, 1));
    this.shaftMat = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: { uTime: { value: 0 }, uDim: { value: 1 } },
      vertexShader: `attribute float aSeed; uniform float uTime; varying float vA; void main(){ vA = (0.05 + 0.06 * sin(uTime * 0.6 + aSeed * 20.0)); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
      fragmentShader: `uniform float uDim; varying float vA; void main(){ gl_FragColor = vec4(vec3(1.0, 0.86, 0.6) * vA * uDim, 1.0); }`,
    });
    this.scene.add(new THREE.LineSegments(sg, this.shaftMat));
    const dg = new THREE.BufferGeometry();
    dg.setAttribute('position', new THREE.Float32BufferAttribute(dp, 3));
    dg.setAttribute('aSeed', new THREE.Float32BufferAttribute(ds, 1));
    this.dustMat = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: { uTime: { value: 0 }, uPx: { value: this.renderer.getPixelRatio() } },
      vertexShader: `attribute float aSeed; uniform float uTime; uniform float uPx; varying float vA;
        void main(){ vec3 p = position; p.y += sin(uTime * 0.3 + aSeed * 30.0) * 0.4; p.x += cos(uTime * 0.2 + aSeed * 17.0) * 0.3;
        vA = 0.25 + 0.5 * fract(aSeed * 13.7); vec4 mv = modelViewMatrix * vec4(p,1.0); gl_PointSize = clamp(40.0 * uPx / -mv.z, 1.0, 3.5); gl_Position = projectionMatrix * mv; }`,
      fragmentShader: `varying float vA; void main(){ float d = length(gl_PointCoord - 0.5); if (d > 0.5) discard; gl_FragColor = vec4(vec3(1.0, 0.85, 0.6) * vA * smoothstep(0.5, 0.0, d), 1.0); }`,
    });
    this.scene.add(new THREE.Points(dg, this.dustMat));
  }

  /** One palace moment per capture, standing at each room's opening and looking in. */
  private buildMoments() {
    const nodes: AtlasNode[] = [];
    this.rooms.forEach((room) => {
      const b = room.build;
      const p = b.project;
      room.ids.forEach((id, k) => {
        const s = b.shots[k];
        nodes.push({
          id,
          code: b.code,
          cluster: 'builds',
          kind: 'project',
          title: p.name,
          summary: p.punchline,
          position: [room.c.x, room.c.y, -8],
          memory: s
            ? { id, role: '', src: s.src, alt: s.alt, year: 0, width: s.width, height: s.height }
            : {
                id,
                role: '',
                src: '',
                alt: `${p.name} spec sheet`,
                year: 0,
                width: 960,
                height: 600,
                sheet: { name: p.name, code: b.code, rows: [['Build', p.name], ['Category', p.category], ['Type', p.type === 'PLATFORM' ? 'Platform' : 'Tool'], ['Stack', p.tags.slice(0, 3).join(' / ')]] },
              },
        });
      });
    });
    this.memory = new MemoryLayer(this.scene, nodes, this.renderer.getPixelRatio(), this.lowPower, {
      anchorOf: (id) => this.anchors.get(id),
      colour: 0.9,
      lazy: true,
      cols: this.lowPower ? 150 : 240,
    });
    const primaries = this.rooms.map((r) => r.ids[0]);
    this.memory.setVisible(new Set(primaries));
    this.memory.preload(primaries);
  }

  // ---------------------------------------------------------------- codebase on the left wall

  private async loadGraph(r: Room) {
    if (r.graph) return;
    let g: StackGraph | null = null;
    try {
      const res = await fetch(asset(`/media/projects/${r.build.project.slug}/stack.json`));
      if (res.ok) g = (await res.json()) as StackGraph;
    } catch {
      g = null;
    }
    this.cb.onGraph(r.index, g);
    if (!g || this.disposed || this.entered !== r.index) return;
    const group = new THREE.Group();
    const layers = g.layers.filter((l) => g!.nodes.some((n) => n.layer === l.id));
    const x = r.c.x - RW / 2 + 0.08;
    const z0 = -3.5;
    const span = 12;
    const secW = span / layers.length;
    const top = r.c.y + RH / 2 - 1.1;
    const bottom = r.c.y - RH / 2 + 0.6;
    const seg: number[] = [];
    const segC: number[] = [];
    const pts: number[] = [];
    const ptC: number[] = [];
    const amber = WARM[0];
    const cream = WARM[2];
    const steel = WARM[4];
    r.graphNodes = [];
    r.graphSections = [];
    layers.forEach((L, li) => {
      const za = z0 - li * secW - 0.1;
      const zb = za - secW + 0.2;
      const a = [
        [za, bottom],
        [zb, bottom],
        [zb, top + 0.5],
        [za, top + 0.5],
      ];
      for (let e = 0; e < 4; e++) {
        seg.push(x, a[e][1], a[e][0], x, a[(e + 1) % 4][1], a[(e + 1) % 4][0]);
        segC.push(amber.r * 0.6, amber.g * 0.6, amber.b * 0.6, amber.r * 0.6, amber.g * 0.6, amber.b * 0.6);
      }
      r.graphSections.push({ label: `${String(li + 1).padStart(2, '0')} / ${L.label.toUpperCase()}`, pos: new THREE.Vector3(x, top + 0.45, za - 0.1), end: new THREE.Vector3(x, top + 0.45, zb + 0.1) });
      const ns = g!.nodes.filter((n) => n.layer === L.id);
      const step = Math.min(0.7, (top - bottom - 0.2) / Math.max(1, ns.length));
      ns.forEach((n, k) => {
        const p = new THREE.Vector3(x + 0.05, top - 0.15 - k * step, za - 0.35);
        r.graphNodes.push({ id: n.id, label: n.label, pos: p, code: `${li + 1}.${String(k + 1).padStart(2, '0')}`, section: li });
        const cc = n.role === 'model' || L.id === 'ai' ? cream : li % 2 ? steel : amber;
        for (let i = 0; i < 90; i++) {
          const u = Math.random() * 2 - 1;
          const t = Math.random() * Math.PI * 2;
          const s = Math.sqrt(1 - u * u);
          const rad = 0.11 * Math.cbrt(Math.random());
          pts.push(p.x + Math.abs(s * Math.cos(t)) * rad, p.y + u * rad, p.z + s * Math.sin(t) * rad);
          ptC.push(cc.r, cc.g, cc.b);
        }
      });
    });
    g.edges.forEach((e) => {
      const A = r.graphNodes.find((n) => n.id === e.s)?.pos;
      const B = r.graphNodes.find((n) => n.id === e.t)?.pos;
      if (!A || !B) return;
      const mid = A.clone().add(B).multiplyScalar(0.5);
      mid.x += 0.6 + A.distanceTo(B) * 0.12;
      for (let i = 0; i <= 34; i++) {
        const t = i / 34;
        const u = 1 - t;
        pts.push(u * u * A.x + 2 * u * t * mid.x + t * t * B.x, u * u * A.y + 2 * u * t * mid.y + t * t * B.y, u * u * A.z + 2 * u * t * mid.z + t * t * B.z);
        ptC.push(cream.r * 0.6, cream.g * 0.6, cream.b * 0.6);
      }
    });
    const lg = new THREE.BufferGeometry();
    lg.setAttribute('position', new THREE.Float32BufferAttribute(seg, 3));
    lg.setAttribute('aCol', new THREE.Float32BufferAttribute(segC, 3));
    const fade = { value: 0 };
    const lineMat = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: { uFade: fade },
      vertexShader: `attribute vec3 aCol; varying vec3 vC; void main(){ vC = aCol; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
      fragmentShader: `uniform float uFade; varying vec3 vC; void main(){ gl_FragColor = vec4(vC * uFade, 1.0); }`,
    });
    group.add(new THREE.LineSegments(lg, lineMat));
    const pg = new THREE.BufferGeometry();
    pg.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3));
    pg.setAttribute('aCol', new THREE.Float32BufferAttribute(ptC, 3));
    const pm = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: { uFade: fade, uPx: { value: this.renderer.getPixelRatio() } },
      vertexShader: `attribute vec3 aCol; uniform float uPx; varying vec3 vC; void main(){ vC = aCol; vec4 mv = modelViewMatrix * vec4(position,1.0); gl_PointSize = clamp(24.0 * uPx / -mv.z, 1.0, 4.0); gl_Position = projectionMatrix * mv; }`,
      fragmentShader: `uniform float uFade; varying vec3 vC; void main(){ float d = length(gl_PointCoord - 0.5); if (d > 0.5) discard; gl_FragColor = vec4(vC * uFade * smoothstep(0.5, 0.05, d), 1.0); }`,
    });
    group.add(new THREE.Points(pg, pm));
    group.userData.fade = fade;
    this.scene.add(group);
    r.graph = group;
    this.graphLabels.forEach((el) => el.remove());
    this.graphLabels = [
      ...r.graphSections.map((s) => {
        const el = document.createElement('div');
        el.className = 'vault-gsec';
        el.textContent = s.label;
        this.overlay.appendChild(el);
        return el;
      }),
      ...r.graphNodes.map((n) => {
        const el = document.createElement('div');
        el.className = 'vault-gnode';
        el.innerHTML = `<b>${n.code}</b> `;
        el.appendChild(document.createTextNode(n.label));
        this.overlay.appendChild(el);
        return el;
      }),
    ];
  }

  // ---------------------------------------------------------------- videos on the right wall

  private buildMedia(r: Room) {
    if (r.media) return;
    const group = new THREE.Group();
    const x = r.c.x + RW / 2 - 0.08;
    const sw = 3.6;
    const sh = 2.3;
    const seg: number[] = [];
    const noise: number[] = [];
    const seeds: number[] = [];
    r.screens = [];
    videoSlots.forEach((slot, k) => {
      // Seen from inside facing the right wall, -z is to the left: V1 sits furthest back.
      const zc = -13.3 + k * 4.4;
      const yc = r.c.y + 0.3;
      const c = [
        [zc + sw / 2, yc - sh / 2],
        [zc - sw / 2, yc - sh / 2],
        [zc - sw / 2, yc + sh / 2],
        [zc + sw / 2, yc + sh / 2],
      ];
      for (let e = 0; e < 4; e++) seg.push(x, c[e][1], c[e][0], x, c[(e + 1) % 4][1], c[(e + 1) % 4][0]);
      const src = r.build.videos[slot.id];
      let video: HTMLVideoElement | undefined;
      if (src) {
        video = document.createElement('video');
        video.src = asset(src);
        video.muted = true;
        video.loop = true;
        video.playsInline = true;
        video.crossOrigin = 'anonymous';
        video.play().catch(() => undefined);
        const tex = new THREE.VideoTexture(video);
        tex.colorSpace = THREE.SRGBColorSpace;
        const plane = new THREE.Mesh(new THREE.PlaneGeometry(sw - 0.1, sh - 0.1), new THREE.MeshBasicMaterial({ map: tex, transparent: true, opacity: 0.95 }));
        plane.position.set(x - 0.01, yc, zc);
        plane.rotation.y = -Math.PI / 2;
        group.add(plane);
      } else {
        for (let i = 0; i < 2600; i++) {
          noise.push(x - 0.01, yc + (Math.random() - 0.5) * (sh - 0.12), zc + (Math.random() - 0.5) * (sw - 0.12));
          seeds.push(Math.random());
        }
      }
      // Label anchored at the top-left corner as seen from inside the room.
      r.screens.push({ label: `V${k + 1} / ${slot.label.toUpperCase()}`, status: src ? 'PLAYING / MUTED' : 'AWAITING FILE', pos: new THREE.Vector3(x, yc + sh / 2 + 0.2, zc - sw / 2), video });
    });
    const lg = new THREE.BufferGeometry();
    lg.setAttribute('position', new THREE.Float32BufferAttribute(seg, 3));
    const lineMat = new THREE.LineBasicMaterial({ color: 0xf2e3c4, transparent: true, opacity: 0, depthWrite: false });
    group.add(new THREE.LineSegments(lg, lineMat));
    const ng = new THREE.BufferGeometry();
    ng.setAttribute('position', new THREE.Float32BufferAttribute(noise.length ? noise : [0, 0, 0], 3));
    ng.setAttribute('aSeed', new THREE.Float32BufferAttribute(seeds.length ? seeds : [0], 1));
    const nm = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: { uTime: { value: 0 }, uFade: { value: 0 }, uPx: { value: this.renderer.getPixelRatio() } },
      vertexShader: `attribute float aSeed; uniform float uTime; uniform float uFade; uniform float uPx; varying float vA;
        void main(){ float f = fract(sin(aSeed * 91.7 + floor(uTime * 14.0) * 12.9) * 4375.5); vA = uFade * f * 0.65;
        vec4 mv = modelViewMatrix * vec4(position,1.0); gl_PointSize = clamp(22.0 * uPx / -mv.z, 1.0, 3.0); gl_Position = projectionMatrix * mv; }`,
      fragmentShader: `varying float vA; void main(){ gl_FragColor = vec4(vec3(0.95, 0.88, 0.75) * vA, 1.0); }`,
    });
    group.add(new THREE.Points(ng, nm));
    group.userData.noise = nm;
    group.userData.line = lineMat;
    this.scene.add(group);
    r.media = group;
    this.mediaLabels.forEach((el) => el.remove());
    this.mediaLabels = r.screens.map((sc) => {
      const el = document.createElement('div');
      el.className = 'vault-gsec';
      el.innerHTML = `${sc.label}<br><span style="opacity:.55">${sc.status}</span>`;
      this.overlay.appendChild(el);
      return el;
    });
  }

  private clearRoom(r: Room) {
    this.graphLabels.forEach((el) => el.remove());
    this.graphLabels = [];
    this.mediaLabels.forEach((el) => el.remove());
    this.mediaLabels = [];
    [r.graph, r.media].forEach((g) => {
      if (!g) return;
      this.scene.remove(g);
      g.traverse((x) => {
        const m = x as THREE.Mesh;
        m.geometry?.dispose();
        const mat = m.material as THREE.MeshBasicMaterial | undefined;
        mat?.map?.dispose();
        mat?.dispose?.();
      });
    });
    r.screens.forEach((sc) => sc.video?.pause());
    r.graph = undefined;
    r.media = undefined;
  }

  // ---------------------------------------------------------------- navigation

  private flyTo(pos: THREE.Vector3, target: THREE.Vector3, dur = 1400) {
    if (this.reduced) dur = 0;
    this.tween = { from: this.camPos.clone(), to: pos.clone(), tFrom: this.camTarget.clone(), tTo: target.clone(), t: 0, dur: Math.max(1, dur) };
  }

  private clearTimers() {
    this.timers.forEach((t) => window.clearTimeout(t));
    this.timers = [];
  }

  showWing(wing: 'all' | 'work' | 'fun') {
    this.exit(false);
    if (wing === 'all') return this.flyTo(this.overviewPos, this.overviewTarget);
    const list = this.rooms.filter((r) => r.build.wing === wing);
    const xs = list.map((r) => r.c.x);
    const cx = (Math.min(...xs) + Math.max(...xs)) / 2;
    const span = Math.max(...xs) - Math.min(...xs) + RW + 4;
    const ys = list.map((r) => r.c.y);
    const cy = (Math.min(...ys) + Math.max(...ys)) / 2;
    const vspan = Math.max(...ys) - Math.min(...ys) + RH + 4;
    const fov = (42 * Math.PI) / 180;
    const dist = Math.max(span / (2 * Math.tan(fov / 2) * this.camera.aspect), vspan / (2 * Math.tan(fov / 2)));
    this.flyTo(new THREE.Vector3(cx, cy, dist), new THREE.Vector3(cx, cy, -6));
  }

  /** Walk into a room and play its capture the palace way. */
  enter(index: number) {
    const r = this.rooms[index];
    if (!r) return;
    const prev = this.entered !== null ? this.rooms[this.entered] : null;
    if (prev && prev !== r) this.clearRoom(prev);
    this.entered = index;
    this.memory.preload(r.ids);
    this.loadGraph(r);
    this.buildMedia(r);
    this.playShot(r, r.shot);
    this.cb.onEnter(index);
  }

  private playShot(r: Room, shot: number) {
    this.clearTimers();
    r.shot = shot;
    const id = r.ids[shot];
    // Inside a room, only its own capture shows; neighbours would bleed through the walls.
    this.memory.setVisible(new Set([id]));
    this.view = 'interface';
    this.cb.onView('interface');
    const v = this.memory.view(id);
    if (!v) return;
    const sheet = !r.build.shots[shot];
    const T = sheet ? [0, -1, 700, 1500, 3000] : [0, 1400, 2600, 3600, 5400];
    const step = (ms: number, fn: () => void) => ms >= 0 && this.timers.push(window.setTimeout(fn, this.reduced ? 0 : ms));
    step(T[0], () => {
      this.memory.stage(id, 0);
      this.stageNow = 0;
      const back = 4.5 + Math.max(0, v.planeH / v.planeW - 0.62) * 14;
      const o = this.width > 900 ? -2.2 : 0;
      this.flyTo(v.origin.clone().addScaledVector(v.forward, -back).add(new THREE.Vector3(o, 0.2, 0)), v.centre.clone().add(new THREE.Vector3(o, 0, 0)), 1500);
      this.cb.onStage?.(0);
    });
    step(T[1], () => {
      this.memory.stage(id, 1);
      this.stageNow = 1;
      this.cb.onStage?.(1);
    });
    step(T[2], () => {
      this.memory.stage(id, 2);
      this.stageNow = 2;
      this.cb.onStage?.(2);
    });
    step(T[3], () => {
      this.memory.stage(id, 3);
      this.stageNow = 3;
      this.cb.onStage?.(3);
      // Step sideways so the depth reveals itself.
      const pos = v.origin.clone().addScaledVector(v.forward, -3).add(new THREE.Vector3(3.8, 1.4, 0));
      this.flyTo(pos, v.centre.clone().addScaledVector(v.forward, 3).add(new THREE.Vector3(-0.8, 0, 0)), 2600);
    });
    step(T[4], () => {
      this.memory.stage(id, 4);
      this.stageNow = 4;
      this.cb.onStage?.(4);
    });
  }

  setView(v: VaultView) {
    const r = this.entered !== null ? this.rooms[this.entered] : null;
    if (!r) return;
    if (v === 'interface') return this.playShot(r, r.shot);
    this.clearTimers();
    this.view = v;
    const c = r.c;
    // The lifted capture fills the room; put it away while facing a side wall.
    this.memory.stage(null, 0);
    this.memory.setVisible(new Set());
    if (v === 'architecture') {
      // From inside, near the right wall, looking at the left wall.
      const o = this.width > 900 ? 2.2 : 0;
      this.flyTo(new THREE.Vector3(c.x + RW / 2 - 0.6, c.y + 0.2, -9.5 + o * 0.4), new THREE.Vector3(c.x - RW / 2, c.y, -9.5 + o), 1700);
    } else {
      const o = this.width > 900 ? 3.4 : 0;
      this.flyTo(new THREE.Vector3(c.x - RW / 2 + 0.4, c.y + 0.3, -8.9 - o * 0.4), new THREE.Vector3(c.x + RW / 2, c.y + 0.2, -8.9 - o), 1700);
    }
    this.cb.onView(v);
  }

  setShot(k: number) {
    const r = this.entered !== null ? this.rooms[this.entered] : null;
    if (!r) return;
    this.playShot(r, ((k % r.ids.length) + r.ids.length) % r.ids.length);
  }

  exit(fly = true) {
    if (this.entered === null) return;
    const r = this.rooms[this.entered];
    this.clearTimers();
    this.clearRoom(r);
    this.entered = null;
    this.view = 'overview';
    this.memory.stage(null, 0);
    this.memory.setVisible(new Set(this.rooms.map((o) => o.ids[o.shot])));
    if (fly) this.flyTo(this.overviewPos, this.overviewTarget);
    this.cb.onEnter(null);
    this.cb.onView('overview');
  }

  get current() {
    return this.entered;
  }

  // ---------------------------------------------------------------- input

  private onMove = (e: PointerEvent) => {
    const r = this.renderer.domElement.getBoundingClientRect();
    this.pointer = { x: e.clientX - r.left, y: e.clientY - r.top, nx: ((e.clientX - r.left) / r.width) * 2 - 1, ny: -((e.clientY - r.top) / r.height) * 2 + 1, inside: true };
  };

  private onLeave = () => {
    this.pointer.inside = false;
    if (this.hover !== null) {
      this.hover = null;
      this.cb.onHover(null);
    }
  };

  private onClick = (e: MouseEvent) => {
    if (this.entered !== null) return;
    const r = this.renderer.domElement.getBoundingClientRect();
    this.pointer = { x: e.clientX - r.left, y: e.clientY - r.top, nx: ((e.clientX - r.left) / r.width) * 2 - 1, ny: -((e.clientY - r.top) / r.height) * 2 + 1, inside: true };
    const h = this.pick();
    if (h !== null) this.enter(h);
  };

  private pick() {
    this.ndc.set(this.pointer.nx, this.pointer.ny);
    this.raycaster.setFromCamera(this.ndc, this.camera);
    const hits = this.raycaster.intersectObjects(this.rooms.map((r) => r.hit));
    return hits.length ? (hits[0].object.userData.index as number) : null;
  }

  private resize = () => {
    const r = this.container.getBoundingClientRect();
    this.width = Math.max(1, r.width);
    this.height = Math.max(1, r.height);
    this.renderer.setSize(this.width, this.height, false);
    this.renderer.domElement.style.width = `${this.width}px`;
    this.renderer.domElement.style.height = `${this.height}px`;
    this.camera.aspect = this.width / this.height;
    const xs = this.rooms.map((x) => x.c.x);
    const span = Math.max(...xs) - Math.min(...xs) + RW + 3;
    const ys = this.rooms.map((x) => x.c.y);
    const vspan = Math.max(...ys) - Math.min(...ys) + RH + 2;
    const fov = (42 * Math.PI) / 180;
    const dist = Math.max(span / (2 * Math.tan(fov / 2) * this.camera.aspect), vspan / (2 * Math.tan(fov / 2)));
    this.overviewPos.set(this.overviewTarget.x, this.overviewTarget.y + 1, dist - 2);
    this.camera.updateProjectionMatrix();
  };

  // ---------------------------------------------------------------- loop

  private loop = (now: number) => {
    this.raf = requestAnimationFrame(this.loop);
    if (!this.visible) return;
    const dt = Math.min(0.05, (now - this.last) / 1000 || 0.016);
    this.last = now;
    this.time += dt;
    if (this.tween) {
      const tw = this.tween;
      tw.t = Math.min(1, tw.t + (dt * 1000) / tw.dur);
      const e = tw.t < 0.5 ? 4 * tw.t ** 3 : 1 - (-2 * tw.t + 2) ** 3 / 2;
      this.camPos.lerpVectors(tw.from, tw.to, e);
      this.camTarget.lerpVectors(tw.tFrom, tw.tTo, e);
      if (tw.t >= 1) this.tween = null;
    }
    const par = this.reduced ? 0 : this.entered !== null ? 0.3 : 2;
    const px = this.pointer.inside ? this.pointer.nx : 0;
    const py = this.pointer.inside ? this.pointer.ny : 0;
    this.camera.position.set(this.camPos.x + px * par, this.camPos.y + py * par * 0.6, this.camPos.z);
    this.camera.lookAt(this.camTarget);

    if (this.pointer.inside && this.entered === null && !this.tween) {
      const h = this.pick();
      if (h !== this.hover) {
        this.hover = h;
        this.cb.onHover(h);
        this.renderer.domElement.style.cursor = h !== null ? 'pointer' : 'default';
      }
    }
    const k = this.reduced ? 1 : Math.min(1, dt * 2.2);
    const inRoom = this.entered !== null;
    this.strataMat.uniforms.uDim.value += ((inRoom ? 0.6 : 1) - this.strataMat.uniforms.uDim.value) * k;
    this.shaftMat.uniforms.uTime.value = this.time;
    this.dustMat.uniforms.uTime.value = this.time;
    this.rooms.forEach((r) => {
      if (r.graph) {
        const f = r.graph.userData.fade as { value: number };
        f.value += ((this.view === 'architecture' ? 1 : 0.15) - f.value) * k;
      }
      if (r.media) {
        const nm = r.media.userData.noise as THREE.ShaderMaterial;
        nm.uniforms.uFade.value += ((this.view === 'media' ? 1 : 0.15) - nm.uniforms.uFade.value) * k;
        nm.uniforms.uTime.value = this.time;
        (r.media.userData.line as THREE.LineBasicMaterial).opacity = 0.7 * nm.uniforms.uFade.value;
      }
    });
    const focal = this.height / (2 * Math.tan(((this.camera.fov * Math.PI) / 180) / 2));
    this.memory.update(dt, 1, this.reduced, focal, this.time);
    this.renderer.render(this.scene, this.camera);
    this.drawLabels();
  };

  private toScreen(p: THREE.Vector3) {
    this.tmp.copy(p).project(this.camera);
    return { x: (this.tmp.x * 0.5 + 0.5) * this.width, y: (-this.tmp.y * 0.5 + 0.5) * this.height, ok: this.tmp.z < 1 && Math.abs(this.tmp.x) < 1.15 && Math.abs(this.tmp.y) < 1.15 };
  }

  private drawLabels() {
    const inRoom = this.entered !== null;
    this.rooms.forEach((r) => {
      const el = this.labels[r.index];
      const s = this.toScreen(new THREE.Vector3(r.c.x - RW / 2, r.c.y + RH / 2, 0));
      const show = s.ok && !inRoom;
      el.style.display = show ? 'block' : 'none';
      if (show) {
        el.style.transform = `translate3d(${Math.round(s.x + 4)}px, ${Math.round(s.y - 16)}px, 0)`;
        el.classList.toggle('is-on', r.index === this.hover);
      }
    });
    const r = inRoom ? this.rooms[this.entered!] : null;
    const settled = !this.tween || this.tween.t > 0.75;
    // Codebase labels.
    let gi = 0;
    const showGraph = !!r && this.view === 'architecture' && settled;
    if (r) {
      const widths = r.graphSections.map((sec) => Math.abs(this.toScreen(sec.end).x - this.toScreen(sec.pos).x));
      r.graphSections.forEach((sec) => {
        const el = this.graphLabels[gi++];
        if (!el) return;
        const s = this.toScreen(sec.pos);
        el.style.display = showGraph && s.ok ? 'block' : 'none';
        if (showGraph) el.style.transform = `translate3d(${Math.round(s.x)}px, ${Math.round(s.y)}px, 0)`;
      });
      r.graphNodes.forEach((n) => {
        const el = this.graphLabels[gi++];
        if (!el) return;
        const s = this.toScreen(n.pos);
        el.style.display = showGraph && s.ok ? 'block' : 'none';
        if (showGraph) {
          el.style.maxWidth = `${Math.max(70, Math.round(widths[n.section] - 26))}px`;
          el.style.transform = `translate3d(${Math.round(s.x + 10)}px, ${Math.round(s.y - 6)}px, 0)`;
        }
      });
      const showMedia = this.view === 'media' && settled;
      r.screens.forEach((sc, i) => {
        const el = this.mediaLabels[i];
        if (!el) return;
        const s = this.toScreen(sc.pos);
        el.style.display = showMedia && s.ok ? 'block' : 'none';
        if (showMedia) el.style.transform = `translate3d(${Math.round(s.x)}px, ${Math.round(s.y - 24)}px, 0)`;
      });
    }
    // Coordinate tags on the lifted capture, as in the palace.
    const tags = r && this.view === 'interface' && this.stageNow >= 3 ? this.memory.tagsOf(r.ids[r.shot]) : [];
    const pts = tags.map((t) => ({ ...this.toScreen(t.pos), index: t.index }));
    let svg = '';
    this.tagEls.forEach((el, i) => {
      const p = pts[i];
      if (!p || !p.ok) {
        el.style.display = 'none';
        return;
      }
      el.style.display = 'block';
      el.textContent = String(p.index).padStart(6, '0');
      el.style.transform = `translate3d(${Math.round(p.x)}px, ${Math.round(p.y)}px, 0)`;
    });
    const vis = pts.filter((p) => p.ok);
    for (let i = 1; i < vis.length; i++) svg += `<line x1="${vis[i - 1].x.toFixed(1)}" y1="${vis[i - 1].y.toFixed(1)}" x2="${vis[i].x.toFixed(1)}" y2="${vis[i].y.toFixed(1)}"/>`;
    this.tagSvg.innerHTML = svg;
  }

  dispose() {
    this.disposed = true;
    this.clearTimers();
    cancelAnimationFrame(this.raf);
    this.io.disconnect();
    const dom = this.renderer.domElement;
    dom.removeEventListener('pointermove', this.onMove);
    dom.removeEventListener('pointerleave', this.onLeave);
    dom.removeEventListener('click', this.onClick);
    window.removeEventListener('resize', this.resize);
    this.rooms.forEach((r) => r.screens.forEach((sc) => sc.video?.pause()));
    this.memory.dispose();
    this.scene.traverse((o) => {
      const any = o as THREE.Mesh;
      any.geometry?.dispose();
      const mat = any.material as THREE.Material | THREE.Material[] | undefined;
      if (Array.isArray(mat)) mat.forEach((x) => x.dispose());
      else mat?.dispose();
    });
    this.renderer.dispose();
    [...this.labels, ...this.graphLabels, ...this.mediaLabels, ...this.tagEls].forEach((el) => el.remove());
    this.tagSvg.remove();
    dom.remove();
  }
}
