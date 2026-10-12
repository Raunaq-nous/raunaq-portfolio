import * as THREE from 'three';
import type { VaultBuild } from '@/data/aiBuilds';
import { asset } from '@/lib/asset';
import { drawIndustrySheet } from '@/lib/industrySheet';
import { estimateDepth, sheetDepth, shading } from '../atlas/MemoryLayer';

/*
 * The AI builds vault. A tesseract of rooms: every build is a wireframe room whose front holds a
 * point cloud of its interface (or its spec sheet), with echo frames receding behind it like the
 * library in Interstellar. Enter a room and the interface lifts into depth; step further in and
 * the build's architecture stands at the back wall as clusters of points, one section per layer:
 * interface, application, data, AI, delivery.
 */

export type VaultView = 'overview' | 'interface' | 'architecture';

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
}

const W = 6;
const H = 4;
const D = 8;
const PITCH_X = 7.2;
const PITCH_Y = 5.2;

const CLOUD_VERT = `
attribute float aZ;
attribute float aLum;
attribute float aShade;
attribute float aSeed;
uniform float uLift;
uniform float uFade;
uniform float uActive;
uniform float uPx;
uniform float uSize;
uniform float uTime;
varying vec3 vCol;
varying float vA;
void main() {
  float lift = smoothstep(0.0, 1.0, uLift);
  vec3 p = position;
  p.z -= aZ * (0.35 + 0.65 * lift);
  p.xy += (aSeed - 0.5) * 0.01 * vec2(sin(uTime + aSeed * 30.0), cos(uTime * 0.8 + aSeed * 20.0)) * lift;
  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  float tone = mix(0.05, 0.97, pow(aLum, 0.9));
  float lit = tone * mix(1.0, aShade, lift) * mix(1.0, 0.65, aZ / 2.2 * lift);
  vCol = lit * mix(vec3(0.8, 0.86, 1.0), vec3(1.0), smoothstep(0.15, 0.85, lit));
  vA = uFade * mix(0.45, 1.0, uActive);
  gl_PointSize = clamp(uSize * uPx / -mv.z, 1.0, 6.0);
  gl_Position = projectionMatrix * mv;
}`;

const CLOUD_FRAG = `
varying vec3 vCol;
varying float vA;
void main() {
  float d = length(gl_PointCoord - 0.5);
  if (d > 0.5) discard;
  gl_FragColor = vec4(vCol, vA * smoothstep(0.5, 0.15, d));
}`;

interface Room {
  build: VaultBuild;
  index: number;
  centre: THREE.Vector3;
  frame: THREE.LineSegments;
  hit: THREE.Mesh;
  cloud?: THREE.Points;
  cloudMat?: THREE.ShaderMaterial;
  cloudCols: number;
  shot: number;
  graph?: THREE.Group;
  graphNodes: { id: string; label: string; layer: string; pos: THREE.Vector3; code: string; section: number }[];
  graphSections: { label: string; pos: THREE.Vector3; right: THREE.Vector3 }[];
  lift: number;
  liftT: number;
  active: number;
  fade: number;
  fadeT: number;
}

export class VaultScene {
  private renderer: THREE.WebGLRenderer;
  private scene = new THREE.Scene();
  private camera = new THREE.PerspectiveCamera(40, 1, 0.1, 200);
  private rooms: Room[] = [];
  private raycaster = new THREE.Raycaster();
  private ndc = new THREE.Vector2();
  private pointer = { x: 0, y: 0, nx: 0, ny: 0, inside: false };
  private hover: number | null = null;
  private entered: number | null = null;
  private view: VaultView = 'overview';
  private camPos = new THREE.Vector3();
  private camTarget = new THREE.Vector3();
  private tween: { from: THREE.Vector3; to: THREE.Vector3; tFrom: THREE.Vector3; tTo: THREE.Vector3; t: number; dur: number } | null = null;
  private time = 0;
  private last = 0;
  private raf = 0;
  private width = 1;
  private height = 1;
  private visible = true;
  private io: IntersectionObserver;
  private tiles!: THREE.Points;
  private tilesMat!: THREE.ShaderMaterial;
  private labels: HTMLDivElement[] = [];
  private graphLabels: HTMLDivElement[] = [];
  private autoArch = 0;
  private overviewTarget = new THREE.Vector3();
  private overviewPos = new THREE.Vector3();
  private tmp = new THREE.Vector3();

  constructor(private container: HTMLElement, private overlay: HTMLElement, private builds: VaultBuild[], private cb: VaultCallbacks, private reduced: boolean, private lowPower: boolean) {
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, lowPower ? 1.5 : 2));
    this.renderer.setClearColor(0x000000, 0);
    container.appendChild(this.renderer.domElement);
    this.renderer.domElement.style.display = 'block';
    this.renderer.domElement.style.touchAction = 'pan-y';
    this.layout();
    this.buildTesseract();
    this.rooms.forEach((r) => this.loadCloud(r, 0, lowPower ? 80 : 120));
    this.resize();
    this.camera.position.copy(this.overviewPos);
    this.camPos.copy(this.overviewPos);
    this.camTarget.copy(this.overviewTarget);
    this.camera.lookAt(this.camTarget);
    const dom = this.renderer.domElement;
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
    const COLS = 4;
    const place = (list: { b: VaultBuild; i: number }[], x0: number, cols: number) =>
      list.forEach(({ b, i }, k) => {
        const c = k % cols;
        const row = Math.floor(k / cols);
        this.addRoom(b, i, new THREE.Vector3(x0 + c * PITCH_X, PITCH_Y - row * PITCH_Y, 0));
      });
    place(work, -18, COLS);
    place(fun, -18 + COLS * PITCH_X + 3.4, 1);
    this.rooms.sort((a, b) => a.index - b.index);
    const xs = this.rooms.map((r) => r.centre.x);
    const cx = (Math.min(...xs) + Math.max(...xs)) / 2;
    this.overviewTarget.set(cx, 0, 0);
    this.overviewPos.set(cx, 1.5, 36);
  }

  private addRoom(build: VaultBuild, index: number, centre: THREE.Vector3) {
    const box = new THREE.BoxGeometry(W, H, D);
    const frame = new THREE.LineSegments(new THREE.EdgesGeometry(box), new THREE.LineBasicMaterial({ color: 0xe8eaf0, transparent: true, opacity: 0.35, depthWrite: false }));
    frame.position.copy(centre);
    this.scene.add(frame);
    const hit = new THREE.Mesh(box, new THREE.MeshBasicMaterial({ visible: false }));
    hit.position.copy(centre);
    hit.userData.index = index;
    this.scene.add(hit);
    this.rooms.push({ build, index, centre, frame, hit, cloudCols: 0, shot: 0, graphNodes: [], graphSections: [], lift: 0, liftT: 0, active: 0, fade: 1, fadeT: 1 });
    const el = document.createElement('div');
    el.className = 'vault-label';
    el.innerHTML = `<b>${build.code}</b><span> ${build.project.name}</span>`;
    this.overlay.appendChild(el);
    this.labels[index] = el;
  }

  /** Echo frames receding behind every room, rails running into the distance, flickering tiles. */
  private buildTesseract() {
    const seg: number[] = [];
    const op: number[] = [];
    const push = (a: THREE.Vector3, b: THREE.Vector3, o: number) => {
      seg.push(a.x, a.y, a.z, b.x, b.y, b.z);
      op.push(o, o);
    };
    const corners = (c: THREE.Vector3, z: number) => [
      new THREE.Vector3(c.x - W / 2, c.y - H / 2, z),
      new THREE.Vector3(c.x + W / 2, c.y - H / 2, z),
      new THREE.Vector3(c.x + W / 2, c.y + H / 2, z),
      new THREE.Vector3(c.x - W / 2, c.y + H / 2, z),
    ];
    // Echoes: the same window, again and again, further back.
    const cells: THREE.Vector3[] = [];
    this.rooms.forEach((r) => cells.push(r.centre));
    const xs = this.rooms.map((r) => r.centre.x);
    const ys = this.rooms.map((r) => r.centre.y);
    // Empty cells above and below continue the lattice.
    [...new Set(xs)].forEach((x) => [Math.max(...ys) + PITCH_Y, Math.min(...ys) - PITCH_Y].forEach((y) => cells.push(new THREE.Vector3(x, y, 0))));
    cells.forEach((c, ci) => {
      const real = ci < this.rooms.length;
      for (let k = real ? 1 : 0; k <= 4; k++) {
        const z = -D / 2 - k * D;
        const q = corners(c, z);
        const o = (real ? 0.22 : 0.12) * Math.pow(0.6, k);
        for (let e = 0; e < 4; e++) push(q[e], q[(e + 1) % 4], o);
      }
      // Rails from the front corners into the distance.
      corners(c, D / 2).forEach((p) => push(p, new THREE.Vector3(p.x, p.y, -D / 2 - 5 * D), real ? 0.07 : 0.035));
    });
    // Long beams across the rows, like the tesseract's grid.
    [...new Set(ys), Math.max(...ys) + PITCH_Y, Math.min(...ys) - PITCH_Y].forEach((y) =>
      [y - H / 2 - 0.6, y + H / 2 + 0.6].forEach((yy) => push(new THREE.Vector3(Math.min(...xs) - 30, yy, D / 2), new THREE.Vector3(Math.max(...xs) + 30, yy, D / 2), 0.05)),
    );
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(seg, 3));
    geo.setAttribute('aOp', new THREE.Float32BufferAttribute(op, 1));
    const mat = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      vertexShader: `attribute float aOp; varying float vO; void main(){ vO = aOp; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
      fragmentShader: `varying float vO; void main(){ gl_FragColor = vec4(vec3(0.9, 0.92, 0.97), vO); }`,
    });
    this.scene.add(new THREE.LineSegments(geo, mat));

    // Data tiles: small rectangles of points in the echoes, flickering on and off.
    const r = (() => {
      let s = 7;
      return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
    })();
    const pos: number[] = [];
    const seed: number[] = [];
    for (let t = 0; t < 160; t++) {
      const c = cells[Math.floor(r() * cells.length)];
      const k = 1 + Math.floor(r() * 4);
      const z = -D / 2 - k * D + (r() - 0.5) * D;
      const x0 = c.x + (r() - 0.5) * W * 0.8;
      const y0 = c.y + (r() - 0.5) * H * 0.8;
      const w = 0.3 + r() * 1.2;
      const h = 0.15 + r() * 0.5;
      const sd = r();
      for (let i = 0; i < 26; i++) {
        pos.push(x0 + r() * w, y0 + r() * h, z);
        seed.push(sd);
      }
    }
    const tg = new THREE.BufferGeometry();
    tg.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    tg.setAttribute('aSeed', new THREE.Float32BufferAttribute(seed, 1));
    this.tilesMat = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      uniforms: { uTime: { value: 0 }, uPx: { value: this.renderer.getPixelRatio() } },
      vertexShader: `attribute float aSeed; uniform float uTime; uniform float uPx; varying float vA;
        void main(){ float on = step(0.55, fract(sin(floor(uTime * (0.6 + aSeed)) * 43.7 + aSeed * 91.0) * 437.5)); vA = on * (0.12 + aSeed * 0.25);
        vec4 mv = modelViewMatrix * vec4(position,1.0); gl_PointSize = clamp(60.0 * uPx / -mv.z, 1.0, 4.0); gl_Position = projectionMatrix * mv; }`,
      fragmentShader: `varying float vA; void main(){ gl_FragColor = vec4(vec3(0.92), vA); }`,
    });
    this.tiles = new THREE.Points(tg, this.tilesMat);
    this.scene.add(this.tiles);
  }

  // ---------------------------------------------------------------- clouds

  private async image(r: Room, shot: number): Promise<{ img: HTMLImageElement; sheet: boolean } | null> {
    const b = r.build;
    const img = new Image();
    img.crossOrigin = 'anonymous';
    const s = b.shots[shot];
    if (s) img.src = asset(s.src);
    else {
      const p = b.project;
      img.src = drawIndustrySheet(p.name, b.code, [['Build', p.name], ['Category', p.category], ['Type', p.type === 'PLATFORM' ? 'Platform' : 'Tool'], ['Stack', p.tags.slice(0, 3).join(' / ')]], 960, 600, p.category);
    }
    try {
      await img.decode();
      return { img, sheet: !s };
    } catch {
      return null;
    }
  }

  private async loadCloud(r: Room, shot: number, cols: number) {
    const got = await this.image(r, shot);
    if (!got || this.disposed) return;
    const { img, sheet } = got;
    const aspect = img.naturalWidth / img.naturalHeight;
    const rows = Math.max(8, Math.round(cols / aspect));
    const c = document.createElement('canvas');
    c.width = cols;
    c.height = rows;
    const ctx = c.getContext('2d', { willReadFrequently: true })!;
    ctx.drawImage(img, 0, 0, cols, rows);
    const data = ctx.getImageData(0, 0, cols, rows).data;
    const lum = new Float32Array(cols * rows);
    for (let i = 0; i < lum.length; i++) lum[i] = (0.299 * data[i * 4] + 0.587 * data[i * 4 + 1] + 0.114 * data[i * 4 + 2]) / 255;
    const depth = sheet ? sheetDepth(lum, cols, rows) : estimateDepth(lum, cols, rows);
    let bright = 0;
    for (let i = 0; i < lum.length; i++) if (lum[i] > 0.86) bright++;
    const relief = sheet ? 0.6 : bright / lum.length > 0.3 ? 0.35 : 1;
    const shade = shading(depth, cols, rows, relief);
    // Fit inside the room's front, a little in from the edges.
    let pw = W - 0.7;
    let ph = pw / aspect;
    if (ph > H - 0.5) {
      ph = H - 0.5;
      pw = ph * aspect;
    }
    let bg = 0;
    if (sheet) bg = Array.from(lum).sort((a, b) => a - b)[Math.floor(lum.length / 2)];
    const pos: number[] = [];
    const zs: number[] = [];
    const ls: number[] = [];
    const sh: number[] = [];
    const sd: number[] = [];
    for (let y = 0; y < rows; y++)
      for (let x = 0; x < cols; x++) {
        const i = y * cols + x;
        let l = lum[i];
        if (sheet) {
          const ink = Math.abs(l - bg) > 0.07;
          if (!ink && Math.random() > 0.14) continue;
          l = ink ? Math.min(1, 0.55 + Math.abs(l - bg) * 1.6) : 0.2;
        }
        pos.push(r.centre.x + ((x + 0.5) / cols - 0.5) * pw, r.centre.y + (0.5 - (y + 0.5) / rows) * ph, r.centre.z + D / 2 - 0.9);
        zs.push((1 - depth[i]) * 2.2 * relief);
        ls.push(l);
        sh.push(shade[i]);
        sd.push(Math.random());
      }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    geo.setAttribute('aZ', new THREE.Float32BufferAttribute(zs, 1));
    geo.setAttribute('aLum', new THREE.Float32BufferAttribute(ls, 1));
    geo.setAttribute('aShade', new THREE.Float32BufferAttribute(sh, 1));
    geo.setAttribute('aSeed', new THREE.Float32BufferAttribute(sd, 1));
    const mat = new THREE.ShaderMaterial({
      vertexShader: CLOUD_VERT,
      fragmentShader: CLOUD_FRAG,
      transparent: true,
      depthWrite: false,
      uniforms: {
        uLift: { value: r.lift },
        uFade: { value: 0 },
        uActive: { value: r.active },
        uPx: { value: this.renderer.getPixelRatio() },
        uSize: { value: (pw / cols) * 900 * 1.3 },
        uTime: { value: 0 },
      },
    });
    const pts = new THREE.Points(geo, mat);
    pts.frustumCulled = false;
    pts.renderOrder = 2;
    if (r.cloud) {
      this.scene.remove(r.cloud);
      r.cloud.geometry.dispose();
      r.cloudMat?.dispose();
    }
    this.scene.add(pts);
    r.cloud = pts;
    r.cloudMat = mat;
    r.cloudCols = cols;
    r.shot = shot;
  }

  // ---------------------------------------------------------------- architecture in the room

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
    if (!g || this.disposed) return;
    const group = new THREE.Group();
    const layers = g.layers.filter((l) => g!.nodes.some((n) => n.layer === l.id));
    const z = r.centre.z - D / 2 + 1.1;
    const width = W - 0.5;
    const secW = width / layers.length;
    const top = r.centre.y + H / 2 - 0.55;
    const bottom = r.centre.y - H / 2 + 0.25;
    const seg: number[] = [];
    const pts: number[] = [];
    const ptA: number[] = [];
    r.graphNodes = [];
    r.graphSections = [];
    layers.forEach((L, li) => {
      const x0 = r.centre.x - width / 2 + li * secW;
      // Section frame.
      const a = [new THREE.Vector3(x0 + 0.06, bottom, z), new THREE.Vector3(x0 + secW - 0.06, bottom, z), new THREE.Vector3(x0 + secW - 0.06, top + 0.35, z), new THREE.Vector3(x0 + 0.06, top + 0.35, z)];
      for (let e = 0; e < 4; e++) seg.push(a[e].x, a[e].y, a[e].z, a[(e + 1) % 4].x, a[(e + 1) % 4].y, a[(e + 1) % 4].z);
      r.graphSections.push({ label: `${String(li + 1).padStart(2, '0')} / ${L.label.toUpperCase()}`, pos: new THREE.Vector3(x0 + 0.12, top + 0.3, z), right: new THREE.Vector3(x0 + secW - 0.1, top + 0.3, z) });
      const ns = g!.nodes.filter((n) => n.layer === L.id);
      const step = Math.min(0.42, (top - bottom - 0.2) / Math.max(1, ns.length));
      ns.forEach((n, k) => {
        const p = new THREE.Vector3(x0 + 0.22, top - 0.12 - k * step, z + 0.05);
        r.graphNodes.push({ id: n.id, label: n.label, layer: L.id, pos: p, code: `${li + 1}.${String(k + 1).padStart(2, '0')}`, section: li });
        // A node is a small ball of points.
        for (let i = 0; i < 70; i++) {
          const u = Math.random() * 2 - 1;
          const t = Math.random() * Math.PI * 2;
          const s = Math.sqrt(1 - u * u);
          const rad = 0.06 * Math.cbrt(Math.random());
          pts.push(p.x + s * Math.cos(t) * rad, p.y + u * rad, p.z + s * Math.sin(t) * rad);
          ptA.push(0.9);
        }
      });
    });
    // Edges as dotted trails that bow forward out of the wall.
    g.edges.forEach((e) => {
      const A = r.graphNodes.find((n) => n.id === e.s)?.pos;
      const B = r.graphNodes.find((n) => n.id === e.t)?.pos;
      if (!A || !B) return;
      const mid = A.clone().add(B).multiplyScalar(0.5);
      mid.z += 0.35 + A.distanceTo(B) * 0.12;
      const N = 26;
      for (let i = 0; i <= N; i++) {
        const t = i / N;
        const u = 1 - t;
        pts.push(u * u * A.x + 2 * u * t * mid.x + t * t * B.x, u * u * A.y + 2 * u * t * mid.y + t * t * B.y, u * u * A.z + 2 * u * t * mid.z + t * t * B.z);
        ptA.push(0.6);
      }
    });
    const lg = new THREE.BufferGeometry();
    lg.setAttribute('position', new THREE.Float32BufferAttribute(seg, 3));
    group.add(new THREE.LineSegments(lg, new THREE.LineBasicMaterial({ color: 0xe8eaf0, transparent: true, opacity: 0.3, depthWrite: false })));
    const pg = new THREE.BufferGeometry();
    pg.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3));
    pg.setAttribute('aA', new THREE.Float32BufferAttribute(ptA, 1));
    const pm = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      uniforms: { uFade: { value: 0 }, uPx: { value: this.renderer.getPixelRatio() } },
      vertexShader: `attribute float aA; uniform float uFade; uniform float uPx; varying float vA; void main(){ vA = aA * uFade; vec4 mv = modelViewMatrix * vec4(position,1.0); gl_PointSize = clamp(9.0 * uPx / -mv.z, 1.0, 3.5); gl_Position = projectionMatrix * mv; }`,
      fragmentShader: `varying float vA; void main(){ float d = length(gl_PointCoord - 0.5); if (d > 0.5) discard; gl_FragColor = vec4(vec3(0.95), vA * smoothstep(0.5, 0.1, d)); }`,
    });
    group.add(new THREE.Points(pg, pm));
    group.userData.mat = pm;
    group.userData.lineMat = (group.children[0] as THREE.LineSegments).material;
    this.scene.add(group);
    r.graph = group;
    // Labels for this room's graph.
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

  // ---------------------------------------------------------------- navigation

  private flyTo(pos: THREE.Vector3, target: THREE.Vector3, dur = 1400) {
    if (this.reduced) dur = 0;
    this.tween = { from: this.camPos.clone(), to: pos.clone(), tFrom: this.camTarget.clone(), tTo: target.clone(), t: 0, dur: Math.max(1, dur) };
  }

  showWing(wing: 'all' | 'work' | 'fun') {
    this.exit(false);
    if (wing === 'all') return this.flyTo(this.overviewPos, this.overviewTarget);
    const list = this.rooms.filter((r) => r.build.wing === wing);
    const xs = list.map((r) => r.centre.x);
    const cx = (Math.min(...xs) + Math.max(...xs)) / 2;
    const span = Math.max(...xs) - Math.min(...xs) + W;
    const dist = Math.max(16, (span / (2 * Math.tan((20 * Math.PI) / 180) * this.camera.aspect)) * 1.1, 22);
    this.flyTo(new THREE.Vector3(cx, 1, dist), new THREE.Vector3(cx, 0, 0));
  }

  enter(index: number) {
    const r = this.rooms[index];
    if (!r) return;
    this.entered = index;
    this.rooms.forEach((o) => {
      o.liftT = o === r ? 1 : 0;
      o.fadeT = o === r ? 1 : 0.25;
    });
    if (r.cloudCols < 200) this.loadCloud(r, r.shot, this.lowPower ? 150 : 240);
    this.loadGraph(r);
    this.setView('interface');
    this.autoArch = this.reduced ? 0 : performance.now() + 4200;
    this.cb.onEnter(index);
  }

  setView(v: VaultView) {
    const r = this.entered !== null ? this.rooms[this.entered] : null;
    if (!r) return;
    this.view = v;
    this.autoArch = 0;
    const c = r.centre;
    if (v === 'interface') {
      r.fadeT = 1;
      // Offset left so the room clears the panel on the left of the frame.
      const o = this.width > 900 ? -1.6 : 0;
      this.flyTo(new THREE.Vector3(c.x + o + 0.4, c.y + 0.35, c.z + D / 2 + 5.4), new THREE.Vector3(c.x + o, c.y, c.z + D / 2 - 1.4));
    } else {
      r.fadeT = 0.06;
      const o = this.width > 900 ? -1.5 : 0;
      this.flyTo(new THREE.Vector3(c.x + o, c.y + 0.05, c.z + D / 2 + 0.6), new THREE.Vector3(c.x + o, c.y - 0.05, c.z - D / 2 + 1.1), 1700);
    }
    this.cb.onView(v);
  }

  setShot(k: number) {
    const r = this.entered !== null ? this.rooms[this.entered] : null;
    if (!r || !r.build.shots.length) return;
    const shot = ((k % r.build.shots.length) + r.build.shots.length) % r.build.shots.length;
    r.lift = 0;
    this.loadCloud(r, shot, this.lowPower ? 150 : 240);
    if (this.view !== 'interface') this.setView('interface');
  }

  exit(fly = true) {
    if (this.entered === null) return;
    this.entered = null;
    this.view = 'overview';
    this.autoArch = 0;
    this.rooms.forEach((o) => {
      o.liftT = 0;
      o.fadeT = 1;
    });
    this.graphLabels.forEach((el) => el.remove());
    this.graphLabels = [];
    this.rooms.forEach((o) => {
      if (o.graph) {
        this.scene.remove(o.graph);
        o.graph.traverse((x) => {
          (x as THREE.Points).geometry?.dispose();
          ((x as THREE.Points).material as THREE.Material | undefined)?.dispose?.();
        });
        o.graph = undefined;
      }
    });
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

  private onClick = () => {
    if (this.entered !== null) return;
    if (this.hover !== null) this.enter(this.hover);
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
    // Fit the whole lattice across the width.
    const xs = this.rooms.map((x) => x.centre.x);
    const span = Math.max(...xs) - Math.min(...xs) + W + 4;
    const dist = span / 2 / (Math.tan((20 * Math.PI) / 180) * this.camera.aspect);
    this.overviewPos.set(this.overviewTarget.x, 1.5, Math.max(30, dist));
    this.camera.updateProjectionMatrix();
  };

  // ---------------------------------------------------------------- loop

  private disposed = false;

  private loop = (now: number) => {
    this.raf = requestAnimationFrame(this.loop);
    if (!this.visible) return;
    const dt = Math.min(0.05, (now - this.last) / 1000 || 0.016);
    this.last = now;
    this.time += dt;
    if (this.autoArch && now > this.autoArch) this.setView('architecture');

    if (this.tween) {
      const tw = this.tween;
      tw.t = Math.min(1, tw.t + (dt * 1000) / tw.dur);
      const e = tw.t < 0.5 ? 4 * tw.t ** 3 : 1 - (-2 * tw.t + 2) ** 3 / 2;
      this.camPos.lerpVectors(tw.from, tw.to, e);
      this.camTarget.lerpVectors(tw.tFrom, tw.tTo, e);
      if (tw.t >= 1) this.tween = null;
    }
    // Gentle parallax from the pointer.
    const par = this.reduced ? 0 : this.entered !== null ? 0.25 : 1.2;
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
    this.rooms.forEach((r) => {
      const act = r.index === this.hover || r.index === this.entered ? 1 : 0;
      r.active += (act - r.active) * k;
      r.lift += (r.liftT - r.lift) * (this.reduced ? 1 : Math.min(1, dt * 1.1));
      r.fade += (r.fadeT - r.fade) * k;
      if (r.cloudMat) {
        const u = r.cloudMat.uniforms;
        u.uLift.value = r.lift;
        u.uFade.value = r.fade;
        u.uActive.value = r.active;
        u.uTime.value = this.time;
      }
      (r.frame.material as THREE.LineBasicMaterial).opacity = (0.22 + 0.5 * r.active) * (this.entered !== null && r.index !== this.entered ? 0.35 : 1);
      if (r.graph) {
        const m = r.graph.userData.mat as THREE.ShaderMaterial;
        const target = this.view === 'architecture' ? 1 : 0.18;
        m.uniforms.uFade.value += (target - m.uniforms.uFade.value) * k;
        (r.graph.userData.lineMat as THREE.LineBasicMaterial).opacity = 0.3 * m.uniforms.uFade.value;
      }
    });
    this.tilesMat.uniforms.uTime.value = this.time;
    this.renderer.render(this.scene, this.camera);
    this.drawLabels();
  };

  private toScreen(p: THREE.Vector3) {
    this.tmp.copy(p).project(this.camera);
    return { x: (this.tmp.x * 0.5 + 0.5) * this.width, y: (-this.tmp.y * 0.5 + 0.5) * this.height, ok: this.tmp.z < 1 && Math.abs(this.tmp.x) < 1.1 && Math.abs(this.tmp.y) < 1.1 };
  }

  private drawLabels() {
    const inRoom = this.entered !== null;
    this.rooms.forEach((r) => {
      const el = this.labels[r.index];
      const s = this.toScreen(new THREE.Vector3(r.centre.x - W / 2, r.centre.y + H / 2, r.centre.z + D / 2));
      const show = s.ok && !inRoom;
      el.style.display = show ? 'block' : 'none';
      if (show) {
        el.style.transform = `translate3d(${Math.round(s.x)}px, ${Math.round(s.y - 16)}px, 0)`;
        el.classList.toggle('is-on', r.index === this.hover || r.index === this.entered);
      }
    });
    const r = inRoom ? this.rooms[this.entered!] : null;
    const showGraph = !!r && this.view === 'architecture' && (!this.tween || this.tween.t > 0.75);
    let gi = 0;
    if (r) {
      const widths = r.graphSections.map((sec) => this.toScreen(sec.right).x - this.toScreen(sec.pos).x);
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
          el.style.maxWidth = `${Math.max(60, Math.round(widths[n.section] - 22))}px`;
          el.style.transform = `translate3d(${Math.round(s.x + 9)}px, ${Math.round(s.y - 6)}px, 0)`;
        }
      });
    }
  }

  dispose() {
    this.disposed = true;
    cancelAnimationFrame(this.raf);
    this.io.disconnect();
    const dom = this.renderer.domElement;
    dom.removeEventListener('pointermove', this.onMove);
    dom.removeEventListener('pointerleave', this.onLeave);
    dom.removeEventListener('click', this.onClick);
    window.removeEventListener('resize', this.resize);
    this.scene.traverse((o) => {
      const any = o as THREE.Mesh;
      any.geometry?.dispose();
      const mat = any.material as THREE.Material | THREE.Material[] | undefined;
      if (Array.isArray(mat)) mat.forEach((x) => x.dispose());
      else mat?.dispose();
    });
    this.renderer.dispose();
    this.labels.forEach((el) => el.remove());
    this.graphLabels.forEach((el) => el.remove());
    dom.remove();
  }
}
