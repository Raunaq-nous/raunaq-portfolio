import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { clusters, edges, nodes, type AtlasNode, type ClusterId } from '@/data/atlas';

/*
 * Imperative Three.js engine for the Knowledge Atlas.
 * React owns the interface; this class owns the scene, the camera and the
 * screen-space annotations that must be positioned every frame.
 */

export interface EngineCallbacks {
  onHover: (h: { cluster: ClusterId | null; node: string | null }) => void;
  onPickCluster: (id: ClusterId) => void;
  onPickNode: (id: string) => void;
  onPickEmpty: () => void;
}

export interface EngineOptions {
  reduced: boolean;
  lowPower: boolean;
  assemble: boolean;
}

const PAPER = new THREE.Color('#F1F0EC');
const CLUSTER_INDEX: Record<ClusterId, number> = { projects: 0, code: 1, ideas: 2, visual: 3 };
const OVERVIEW_TARGET = new THREE.Vector3(0, 1, 2);
const OVERVIEW_POS = new THREE.Vector3(4, 13, 56);

const PARTICLE_VERT = `
attribute vec3 aStart;
attribute float aSize;
attribute float aAlpha;
attribute float aCluster;
attribute float aDelay;
attribute float aSeed;
attribute float aRatio;
uniform float uTime;
uniform float uAssemble;
uniform float uPixel;
uniform float uDrift;
uniform float uDim;
uniform vec4 uFocus;
uniform vec4 uActive;
varying float vAlpha;
varying float vRatio;
float pick(vec4 v, float i) { return i < 0.5 ? v.x : i < 1.5 ? v.y : i < 2.5 ? v.z : i < 3.5 ? v.w : 0.0; }
void main() {
  float t = clamp(uAssemble * 1.7 - aDelay, 0.0, 1.0);
  t = t * t * (3.0 - 2.0 * t);
  vec3 p = mix(aStart, position, t);
  p += uDrift * 0.22 * vec3(sin(uTime * 0.31 + aSeed * 6.28), cos(uTime * 0.23 + aSeed * 4.1), sin(uTime * 0.19 + aSeed * 9.3));
  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  float focus = pick(uFocus, aCluster);
  float act = pick(uActive, aCluster);
  float recede = aCluster > 3.5 ? mix(1.0, 0.5, uDim) : mix(1.0, mix(0.2, 1.0, act), uDim);
  float dist = max(0.5, -mv.z);
  vAlpha = aAlpha * (0.6 + focus * 0.9) * recede * (0.25 + 0.75 * t) * clamp(1.6 - dist / 170.0, 0.0, 1.0) * smoothstep(1.5, 9.0, dist);
  vRatio = aRatio;
  gl_PointSize = clamp(aSize * uPixel * (1.0 + focus * 0.5) * (58.0 / dist), 1.0, 6.0 * uPixel);
  gl_Position = projectionMatrix * mv;
}`;

const PARTICLE_FRAG = `
uniform vec3 uColor;
varying float vAlpha;
varying float vRatio;
void main() {
  vec2 pc = gl_PointCoord - 0.5;
  if (abs(pc.y) > 0.5 * vRatio) discard;
  gl_FragColor = vec4(uColor, vAlpha);
}`;

const NODE_VERT = `
attribute float aState;
uniform float uPixel;
uniform float uAssemble;
varying float vState;
varying float vFade;
void main() {
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  float dist = max(0.5, -mv.z);
  vState = aState;
  vFade = smoothstep(0.55, 1.0, uAssemble) * clamp(1.6 - dist / 110.0, 0.15, 1.0);
  float s = aState > 1.5 ? 22.0 : aState > 0.5 ? 13.0 : aState < -0.5 ? 6.0 : 9.0;
  gl_PointSize = s * uPixel * clamp(30.0 / dist, 0.55, 1.6);
  gl_Position = projectionMatrix * mv;
}`;

const NODE_FRAG = `
uniform vec3 uColor;
varying float vState;
varying float vFade;
void main() {
  vec2 pc = abs(gl_PointCoord - 0.5);
  float m = max(pc.x, pc.y);
  float a;
  if (vState > 1.5) {
    // Selected: outlined square with a solid core.
    a = (m > 0.42 ? 1.0 : 0.0) + (m < 0.14 ? 1.0 : 0.0);
  } else {
    a = m < 0.32 ? 1.0 : 0.0;
  }
  float level = vState > 1.5 ? 1.0 : vState > 0.5 ? 0.95 : vState < -0.5 ? 0.16 : 0.7;
  if (a < 0.5) discard;
  gl_FragColor = vec4(uColor, level * vFade);
}`;

const EDGE_VERT = `
attribute float aAlpha;
uniform float uAssemble;
varying float vAlpha;
void main() {
  vAlpha = aAlpha * smoothstep(0.7, 1.0, uAssemble);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}`;

const EDGE_FRAG = `
uniform vec3 uColor;
varying float vAlpha;
void main() { gl_FragColor = vec4(uColor, vAlpha); }`;

function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

function gauss(r: () => number) {
  return Math.sqrt(-2 * Math.log(Math.max(1e-6, r()))) * Math.cos(2 * Math.PI * r());
}

interface Tween {
  fromPos: THREE.Vector3;
  fromTarget: THREE.Vector3;
  toPos: THREE.Vector3;
  toTarget: THREE.Vector3;
  start: number;
  duration: number;
}

interface LabelEl {
  el: HTMLDivElement;
  w: number;
  h: number;
}

export class AtlasEngine {
  private container: HTMLElement;
  private overlay: HTMLElement;
  private cb: EngineCallbacks;
  private opts: EngineOptions;

  private renderer: THREE.WebGLRenderer;
  private scene = new THREE.Scene();
  private camera: THREE.PerspectiveCamera;
  private controls: OrbitControls;
  private clock = new THREE.Clock();
  private raf = 0;
  private disposed = false;

  private particleMat!: THREE.ShaderMaterial;
  private nodeMat!: THREE.ShaderMaterial;
  private edgeMat!: THREE.ShaderMaterial;
  private nodeStates!: Float32Array;
  private nodeStateAttr!: THREE.BufferAttribute;
  private edgeAlpha!: Float32Array;
  private edgeAlphaAttr!: THREE.BufferAttribute;
  private boxes: THREE.LineSegments[] = [];
  private boxBounds: THREE.Box3[] = [];
  private dropLine!: THREE.Line;

  private assemble = 0;
  private focus = new THREE.Vector4();
  private focusTarget = new THREE.Vector4();
  private activeVec = new THREE.Vector4();
  private dim = 0;

  private activeCluster: ClusterId | null = null;
  private selected: string | null = null;
  private hoverCluster: ClusterId | null = null;
  private hoverNode: string | null = null;
  private tween: Tween | null = null;

  private pointer = { x: -1, y: -1, inside: false };
  private down = { x: 0, y: 0, t: 0, active: false };
  private width = 1;
  private height = 1;

  private nodeScreen: Float32Array;
  private nodeVisible: Uint8Array;
  private clusterScreen: { x: number; y: number; r: number; z: number }[] = [];

  private clusterLabels: LabelEl[] = [];
  private nodeLabels: LabelEl[] = [];
  private axisLabels: { el: HTMLDivElement; pos: THREE.Vector3 }[] = [];
  private bboxEl: HTMLDivElement;
  private bboxLabel: HTMLSpanElement;
  private selTag: HTMLDivElement;
  private camReadout: HTMLElement | null;

  private tmp = new THREE.Vector3();

  constructor(container: HTMLElement, overlay: HTMLElement, camReadout: HTMLElement | null, cb: EngineCallbacks, opts: EngineOptions) {
    this.container = container;
    this.overlay = overlay;
    this.camReadout = camReadout;
    this.cb = cb;
    this.opts = opts;

    this.renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, opts.lowPower ? 1.5 : 1.75));
    this.renderer.setClearColor(0x090909, 1);
    container.appendChild(this.renderer.domElement);
    this.renderer.domElement.style.display = 'block';
    this.renderer.domElement.setAttribute('aria-hidden', 'true');

    this.camera = new THREE.PerspectiveCamera(48, 1, 0.1, 400);
    const cr = container.getBoundingClientRect();
    this.width = Math.max(1, cr.width);
    this.height = Math.max(1, cr.height);
    this.camera.position.copy(this.overviewPos());
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.target.copy(OVERVIEW_TARGET);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.08;
    this.controls.rotateSpeed = 0.5;
    this.controls.zoomSpeed = 0.7;
    this.controls.panSpeed = 0.6;
    this.controls.minDistance = 4;
    this.controls.maxDistance = 140;
    this.controls.minPolarAngle = 0.25;
    this.controls.maxPolarAngle = Math.PI - 0.35;
    this.controls.update();

    this.nodeScreen = new Float32Array(nodes.length * 3);
    this.nodeVisible = new Uint8Array(nodes.length);

    this.buildParticles();
    this.buildNodes();
    this.buildEdges();
    this.buildGridAndAxes();
    this.buildBoxes();

    // Screen-space annotation elements
    this.bboxEl = this.makeEl('atlas-bbox');
    this.bboxLabel = document.createElement('span');
    this.bboxLabel.className = 'atlas-bbox-label';
    this.bboxEl.appendChild(this.bboxLabel);
    this.selTag = this.makeEl('atlas-seltag');
    clusters.forEach((c) => {
      const el = this.makeEl('atlas-clabel');
      el.innerHTML = `<span class="c-code">${c.code}</span><span class="c-name">${c.label}</span><span class="c-pos">X ${c.center[0].toFixed(1)} / Y ${c.center[1].toFixed(1)} / Z ${c.center[2].toFixed(1)}</span>`;
      this.clusterLabels.push({ el, w: 0, h: 0 });
    });
    nodes.forEach((n) => {
      const el = this.makeEl('atlas-nlabel');
      el.innerHTML = `<span class="n-code">${n.code}</span>${escapeHtml(n.title)}`;
      this.nodeLabels.push({ el, w: 0, h: 0 });
    });
    (['X', 'Y', 'Z'] as const).forEach((a, i) => {
      const el = this.makeEl('atlas-axis');
      el.textContent = a;
      const pos = new THREE.Vector3(i === 0 ? 9 : 0, i === 1 ? 9 : 0, i === 2 ? 9 : 0).add(new THREE.Vector3(0, -20, 0));
      this.axisLabels.push({ el, pos });
    });

    this.assemble = opts.assemble && !opts.reduced ? 0 : 1;

    const dom = this.renderer.domElement;
    dom.addEventListener('pointermove', this.onPointerMove);
    dom.addEventListener('pointerleave', this.onPointerLeave);
    dom.addEventListener('pointerdown', this.onPointerDown);
    dom.addEventListener('pointerup', this.onPointerUp);
    this.controls.addEventListener('start', this.cancelTween);
    window.addEventListener('resize', this.resize);
    document.addEventListener('visibilitychange', this.onVisibility);

    this.resize();
    this.loop();
  }

  // ---------------------------------------------------------------- building

  private makeEl(cls: string) {
    const el = document.createElement('div');
    el.className = cls;
    this.overlay.appendChild(el);
    return el;
  }

  private buildParticles() {
    const r = rng(7);
    const scale = this.opts.lowPower ? 0.35 : 1;
    const perCluster = Math.round(950 * scale);
    const ambient = Math.round(2600 * scale);
    const total = perCluster * clusters.length + ambient;

    const pos = new Float32Array(total * 3);
    const start = new Float32Array(total * 3);
    const size = new Float32Array(total);
    const alpha = new Float32Array(total);
    const cl = new Float32Array(total);
    const delay = new Float32Array(total);
    const seed = new Float32Array(total);
    const ratio = new Float32Array(total);
    let k = 0;

    const push = (x: number, y: number, z: number, c: number, s: number, a: number) => {
      pos.set([x, y, z], k * 3);
      // Start as a flat sheet of fragments in front of the camera, like the page that dissolved.
      start.set([(r() - 0.5) * 90, (r() - 0.5) * 56 + 10, 38 + r() * 14], k * 3);
      size[k] = s;
      alpha[k] = a;
      cl[k] = c;
      delay[k] = r() * 0.7;
      seed[k] = r();
      ratio[k] = r() < 0.35 ? 0.3 + r() * 0.3 : 1;
      k++;
    };

    clusters.forEach((c, ci) => {
      const [cx, cy, cz] = c.center;
      const tilt = new THREE.Euler(r() * 0.9 - 0.45, r() * Math.PI, r() * 0.6 - 0.3);
      const v = new THREE.Vector3();
      for (let i = 0; i < perCluster; i++) {
        const kind = r();
        if (kind < 0.58) {
          // Volumetric cloud
          const sg = c.radius * 0.52;
          push(cx + gauss(r) * sg, cy + gauss(r) * sg * 0.62, cz + gauss(r) * sg, ci, 1.2 + r() * 1.6, 0.26 + r() * 0.4);
        } else if (kind < 0.84) {
          // Thin tilted layer
          const a = r() * Math.PI * 2;
          const rad = c.radius * (0.8 + Math.pow(r(), 0.6) * 0.9);
          v.set(Math.cos(a) * rad, gauss(r) * 0.12, Math.sin(a) * rad).applyEuler(tilt);
          push(cx + v.x, cy + v.y, cz + v.z, ci, 0.9 + r() * 1.0, 0.2 + r() * 0.3);
        } else {
          // Pixelated lattice fragment
          const g = 0.9;
          v.set(Math.round(gauss(r) * 2.2) * g, Math.round(gauss(r) * 1.2) * g, Math.round(gauss(r) * 2.2) * g).applyEuler(tilt);
          push(cx + v.x, cy + v.y, cz + v.z, ci, 1.6 + r() * 1.4, 0.38 + r() * 0.35);
        }
      }
    });
    for (let i = 0; i < ambient; i++) {
      const u = r() * 2 - 1;
      const th = r() * Math.PI * 2;
      const rad = 18 + Math.pow(r(), 0.7) * 60;
      const s = Math.sqrt(1 - u * u);
      push(Math.cos(th) * s * rad, u * rad * 0.55, Math.sin(th) * s * rad, 4, 0.6 + r() * 0.9, 0.08 + r() * 0.16);
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geo.setAttribute('aStart', new THREE.BufferAttribute(start, 3));
    geo.setAttribute('aSize', new THREE.BufferAttribute(size, 1));
    geo.setAttribute('aAlpha', new THREE.BufferAttribute(alpha, 1));
    geo.setAttribute('aCluster', new THREE.BufferAttribute(cl, 1));
    geo.setAttribute('aDelay', new THREE.BufferAttribute(delay, 1));
    geo.setAttribute('aSeed', new THREE.BufferAttribute(seed, 1));
    geo.setAttribute('aRatio', new THREE.BufferAttribute(ratio, 1));
    geo.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 200);

    this.particleMat = new THREE.ShaderMaterial({
      vertexShader: PARTICLE_VERT,
      fragmentShader: PARTICLE_FRAG,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: {
        uTime: { value: 0 },
        uAssemble: { value: 0 },
        uPixel: { value: this.renderer.getPixelRatio() },
        uDrift: { value: this.opts.reduced ? 0 : 1 },
        uDim: { value: 0 },
        uFocus: { value: this.focus },
        uActive: { value: this.activeVec },
        uColor: { value: PAPER },
      },
    });
    this.scene.add(new THREE.Points(geo, this.particleMat));
  }

  private buildNodes() {
    const pos = new Float32Array(nodes.length * 3);
    nodes.forEach((n, i) => pos.set(n.position, i * 3));
    this.nodeStates = new Float32Array(nodes.length);
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    this.nodeStateAttr = new THREE.BufferAttribute(this.nodeStates, 1);
    geo.setAttribute('aState', this.nodeStateAttr);
    this.nodeMat = new THREE.ShaderMaterial({
      vertexShader: NODE_VERT,
      fragmentShader: NODE_FRAG,
      transparent: true,
      depthWrite: false,
      uniforms: {
        uPixel: { value: this.renderer.getPixelRatio() },
        uAssemble: { value: 0 },
        uColor: { value: PAPER },
      },
    });
    const pts = new THREE.Points(geo, this.nodeMat);
    pts.renderOrder = 2;
    this.scene.add(pts);
  }

  private buildEdges() {
    const index = new Map(nodes.map((n, i) => [n.id, i]));
    const pos = new Float32Array(edges.length * 6);
    edges.forEach((e, i) => {
      pos.set(nodes[index.get(e.from)!].position, i * 6);
      pos.set(nodes[index.get(e.to)!].position, i * 6 + 3);
    });
    this.edgeAlpha = new Float32Array(edges.length * 2);
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    this.edgeAlphaAttr = new THREE.BufferAttribute(this.edgeAlpha, 1);
    geo.setAttribute('aAlpha', this.edgeAlphaAttr);
    this.edgeMat = new THREE.ShaderMaterial({
      vertexShader: EDGE_VERT,
      fragmentShader: EDGE_FRAG,
      transparent: true,
      depthWrite: false,
      uniforms: { uAssemble: { value: 0 }, uColor: { value: PAPER } },
    });
    this.scene.add(new THREE.LineSegments(geo, this.edgeMat));
    this.refreshStates();
  }

  private buildGridAndAxes() {
    // Sparse dotted floor grid
    const pts: number[] = [];
    for (let x = -64; x <= 64; x += 4) for (let z = -64; z <= 64; z += 4) pts.push(x, -20, z);
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3));
    const gm = new THREE.PointsMaterial({ color: PAPER, size: 1.4, sizeAttenuation: false, transparent: true, opacity: 0.16, depthWrite: false });
    this.scene.add(new THREE.Points(g, gm));

    // Axes with ticks, anchored on the grid
    const a: number[] = [];
    const o = new THREE.Vector3(0, -20, 0);
    const axis = (dx: number, dy: number, dz: number) => {
      a.push(o.x, o.y, o.z, o.x + dx * 8, o.y + dy * 8, o.z + dz * 8);
      for (let t = 2; t <= 8; t += 2) {
        const tx = o.x + dx * t;
        const ty = o.y + dy * t;
        const tz = o.z + dz * t;
        if (dy) a.push(tx - 0.25, ty, tz, tx + 0.25, ty, tz);
        else a.push(tx, ty + 0.25, tz, tx, ty - 0.25, tz);
      }
    };
    axis(1, 0, 0);
    axis(0, 1, 0);
    axis(0, 0, 1);
    const ag = new THREE.BufferGeometry();
    ag.setAttribute('position', new THREE.Float32BufferAttribute(a, 3));
    this.scene.add(new THREE.LineSegments(ag, new THREE.LineBasicMaterial({ color: PAPER, transparent: true, opacity: 0.32 })));

    // Positional drop line from the selected node to the floor
    const dg = new THREE.BufferGeometry();
    dg.setAttribute('position', new THREE.Float32BufferAttribute([0, 0, 0, 0, -20, 0], 3));
    this.dropLine = new THREE.Line(
      dg,
      new THREE.LineDashedMaterial({ color: PAPER, dashSize: 0.4, gapSize: 0.4, transparent: true, opacity: 0.4 }),
    );
    this.dropLine.visible = false;
    this.scene.add(this.dropLine);
  }

  private buildBoxes() {
    clusters.forEach((c) => {
      const box = new THREE.Box3();
      nodes.filter((n) => n.cluster === c.id).forEach((n) => box.expandByPoint(this.tmp.set(...n.position)));
      box.expandByScalar(1.6);
      this.boxBounds.push(box);
      const size = box.getSize(new THREE.Vector3());
      const geo = new THREE.EdgesGeometry(new THREE.BoxGeometry(size.x, size.y, size.z));
      const mat = new THREE.LineBasicMaterial({ color: PAPER, transparent: true, opacity: 0, depthWrite: false });
      const mesh = new THREE.LineSegments(geo, mat);
      box.getCenter(mesh.position);
      this.boxes.push(mesh);
      this.scene.add(mesh);
    });
  }

  // ------------------------------------------------------------------- state

  private refreshStates() {
    const sel = this.selected;
    const related = new Set<string>();
    if (sel) {
      edges.forEach((e) => {
        if (e.from === sel) related.add(e.to);
        if (e.to === sel) related.add(e.from);
      });
    }
    nodes.forEach((n, i) => {
      let s = 0;
      if (n.id === sel || n.id === this.hoverNode) s = 2;
      else if (related.has(n.id)) s = 1;
      else if (this.activeCluster && n.cluster !== this.activeCluster) s = -1;
      else if (this.hoverCluster && !this.activeCluster && n.cluster !== this.hoverCluster) s = -1;
      this.nodeStates[i] = s;
    });
    this.nodeStateAttr.needsUpdate = true;

    const byId = new Map(nodes.map((n) => [n.id, n]));
    edges.forEach((e, i) => {
      const a = byId.get(e.from)!;
      const b = byId.get(e.to)!;
      let v = e.kind === 'illustrative' ? 0.05 : 0.08;
      const focusC = this.activeCluster ?? this.hoverCluster;
      if (focusC && (a.cluster === focusC || b.cluster === focusC)) v = 0.26;
      if (this.activeCluster && a.cluster !== this.activeCluster && b.cluster !== this.activeCluster) v = 0.03;
      const pivot = sel ?? this.hoverNode;
      if (pivot && (e.from === pivot || e.to === pivot)) v = 0.85;
      this.edgeAlpha[i * 2] = v;
      this.edgeAlpha[i * 2 + 1] = v;
    });
    this.edgeAlphaAttr.needsUpdate = true;
  }

  enterCluster(id: ClusterId | null, fly = true) {
    this.activeCluster = id;
    if (!id) this.selected = null;
    this.activeVec.set(0, 0, 0, 0);
    if (id) this.activeVec.setComponent(CLUSTER_INDEX[id], 1);
    this.refreshStates();
    if (!fly) return;
    if (!id) {
      this.flyTo(this.overviewPos(), OVERVIEW_TARGET.clone(), 1300);
      return;
    }
    const c = clusters.find((x) => x.id === id)!;
    const target = new THREE.Vector3(...c.center);
    const dir = this.camera.position.clone().sub(this.controls.target).normalize();
    if (dir.lengthSq() < 0.1) dir.set(0, 0.3, 1).normalize();
    this.flyTo(target.clone().add(dir.multiplyScalar(c.radius * 2.4 + 7)), target, 1300);
  }

  selectNode(id: string | null, fly = true) {
    this.selected = id;
    const n = id ? nodes.find((x) => x.id === id) : null;
    if (n && this.activeCluster !== n.cluster) {
      this.activeCluster = n.cluster;
      this.activeVec.set(0, 0, 0, 0);
      this.activeVec.setComponent(CLUSTER_INDEX[n.cluster], 1);
    }
    this.refreshStates();
    if (n) {
      const p = this.dropLine.geometry.getAttribute('position') as THREE.BufferAttribute;
      p.setXYZ(0, ...n.position);
      p.setXYZ(1, n.position[0], -20, n.position[2]);
      p.needsUpdate = true;
      this.dropLine.computeLineDistances();
      this.dropLine.visible = true;
      if (fly) {
        const target = new THREE.Vector3(...n.position);
        const dir = this.camera.position.clone().sub(this.controls.target).normalize();
        this.flyTo(target.clone().add(dir.multiplyScalar(9)), target, 1100);
      }
    } else {
      this.dropLine.visible = false;
    }
  }

  resetView() {
    this.enterCluster(null);
  }

  private flyTo(pos: THREE.Vector3, target: THREE.Vector3, duration: number) {
    if (this.opts.reduced) {
      this.camera.position.copy(pos);
      this.controls.target.copy(target);
      this.controls.update();
      return;
    }
    this.tween = {
      fromPos: this.camera.position.clone(),
      fromTarget: this.controls.target.clone(),
      toPos: pos,
      toTarget: target,
      start: performance.now(),
      duration,
    };
  }

  private cancelTween = () => {
    this.tween = null;
  };

  // --------------------------------------------------------------- pointer

  private onPointerMove = (e: PointerEvent) => {
    const r = this.renderer.domElement.getBoundingClientRect();
    this.pointer.x = e.clientX - r.left;
    this.pointer.y = e.clientY - r.top;
    this.pointer.inside = true;
  };

  private onPointerLeave = () => {
    this.pointer.inside = false;
  };

  private onPointerDown = (e: PointerEvent) => {
    this.down = { x: e.clientX, y: e.clientY, t: performance.now(), active: true };
  };

  private onPointerUp = (e: PointerEvent) => {
    if (!this.down.active) return;
    this.down.active = false;
    const moved = Math.hypot(e.clientX - this.down.x, e.clientY - this.down.y);
    if (moved > 6 || performance.now() - this.down.t > 700) return;
    const r = this.renderer.domElement.getBoundingClientRect();
    this.pointer.x = e.clientX - r.left;
    this.pointer.y = e.clientY - r.top;
    this.pointer.inside = e.pointerType !== 'touch';
    const hit = this.hitTest(this.pointer.x, this.pointer.y, e.pointerType === 'touch' ? 28 : 16);
    if (hit.node) this.cb.onPickNode(hit.node);
    else if (hit.cluster) this.cb.onPickCluster(hit.cluster);
    else this.cb.onPickEmpty();
  };

  private hitTest(x: number, y: number, radius: number): { cluster: ClusterId | null; node: string | null } {
    let best = -1;
    let bestD = radius;
    const allowAllNodes = !!this.activeCluster;
    nodes.forEach((n, i) => {
      if (!this.nodeVisible[i]) return;
      if (!allowAllNodes && n.cluster !== this.hoverCluster) return;
      if (allowAllNodes && n.cluster !== this.activeCluster) return;
      const d = Math.hypot(this.nodeScreen[i * 3] - x, this.nodeScreen[i * 3 + 1] - y);
      if (d < bestD) {
        bestD = d;
        best = i;
      }
    });
    if (best >= 0 && (allowAllNodes || bestD < radius * 0.75)) return { node: nodes[best].id, cluster: nodes[best].cluster };

    let cBest: ClusterId | null = null;
    let cScore = Infinity;
    this.clusterScreen.forEach((s, i) => {
      if (s.z <= 0) return;
      const d = Math.hypot(s.x - x, s.y - y);
      if (d < Math.max(36, s.r) && d / Math.max(36, s.r) < cScore) {
        cScore = d / Math.max(36, s.r);
        cBest = clusters[i].id;
      }
    });
    if (cBest && cBest === this.activeCluster) return { node: null, cluster: null };
    return { node: null, cluster: cBest };
  }

  // --------------------------------------------------------------- loop

  /** Overview camera position, pulled back on portrait screens so every cluster stays in frame. */
  private overviewPos() {
    const aspect = this.width / this.height;
    const scale = aspect < 1 ? Math.min(1.9, 0.9 / aspect) : 1;
    const dir = OVERVIEW_POS.clone().sub(OVERVIEW_TARGET);
    return OVERVIEW_TARGET.clone().add(dir.multiplyScalar(scale));
  }

  private resize = () => {
    const r = this.container.getBoundingClientRect();
    this.width = Math.max(1, r.width);
    this.height = Math.max(1, r.height);
    this.camera.aspect = this.width / this.height;
    this.camera.fov = this.camera.aspect < 1 ? 58 : 48;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(this.width, this.height, false);
    this.renderer.domElement.style.width = `${this.width}px`;
    this.renderer.domElement.style.height = `${this.height}px`;
  };

  private onVisibility = () => {
    if (document.hidden) cancelAnimationFrame(this.raf);
    else {
      this.clock.getDelta();
      this.loop();
    }
  };

  private loop = () => {
    if (this.disposed) return;
    this.raf = requestAnimationFrame(this.loop);
    const dt = Math.min(0.05, this.clock.getDelta());
    const now = performance.now();

    if (this.assemble < 1) this.assemble = Math.min(1, this.assemble + dt / 1.6);

    if (this.tween) {
      const t = Math.min(1, (now - this.tween.start) / this.tween.duration);
      const e = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
      this.camera.position.lerpVectors(this.tween.fromPos, this.tween.toPos, e);
      this.controls.target.lerpVectors(this.tween.fromTarget, this.tween.toTarget, e);
      if (t >= 1) this.tween = null;
    }
    this.controls.update();

    this.projectAll();
    this.updateHover();

    // Ease focus and dim
    const k = Math.min(1, dt * 5);
    this.focusTarget.set(0, 0, 0, 0);
    if (this.hoverCluster) this.focusTarget.setComponent(CLUSTER_INDEX[this.hoverCluster], 1);
    if (this.activeCluster) this.focusTarget.setComponent(CLUSTER_INDEX[this.activeCluster], Math.max(0.7, this.focusTarget.getComponent(CLUSTER_INDEX[this.activeCluster])));
    this.focus.lerp(this.focusTarget, k);
    this.dim += ((this.activeCluster ? 1 : 0) - this.dim) * k;

    this.boxes.forEach((b, i) => {
      const id = clusters[i].id;
      const target = id === this.activeCluster ? 0.32 : id === this.hoverCluster ? 0.22 : 0;
      const m = b.material as THREE.LineBasicMaterial;
      m.opacity += (target - m.opacity) * k;
      b.visible = m.opacity > 0.01;
    });

    const u = this.particleMat.uniforms;
    u.uTime.value += this.opts.reduced ? 0 : dt;
    u.uAssemble.value = this.assemble;
    u.uDim.value = this.dim;
    this.nodeMat.uniforms.uAssemble.value = this.assemble;
    this.edgeMat.uniforms.uAssemble.value = this.assemble;

    this.renderer.render(this.scene, this.camera);
    this.updateOverlay();
  };

  private projectAll() {
    const w = this.width;
    const h = this.height;
    const v = this.tmp;
    const focal = h / 2 / Math.tan((this.camera.fov * Math.PI) / 360);
    nodes.forEach((n, i) => {
      v.set(...n.position).project(this.camera);
      const visible = v.z < 1 && v.z > -1 && Math.abs(v.x) < 1.1 && Math.abs(v.y) < 1.1;
      this.nodeVisible[i] = visible ? 1 : 0;
      this.nodeScreen[i * 3] = (v.x * 0.5 + 0.5) * w;
      this.nodeScreen[i * 3 + 1] = (-v.y * 0.5 + 0.5) * h;
      this.nodeScreen[i * 3 + 2] = v.z;
    });
    this.clusterScreen = clusters.map((c) => {
      v.set(...c.center);
      const dist = v.distanceTo(this.camera.position);
      v.project(this.camera);
      return { x: (v.x * 0.5 + 0.5) * w, y: (-v.y * 0.5 + 0.5) * h, r: (c.radius * focal) / Math.max(1, dist), z: v.z < 1 ? 1 : 0 };
    });
  }

  private updateHover() {
    let h: { cluster: ClusterId | null; node: string | null } = { cluster: null, node: null };
    if (this.pointer.inside && !this.tween) h = this.hitTest(this.pointer.x, this.pointer.y, 16);
    let hc = h.cluster;
    if (this.activeCluster && hc === this.activeCluster) hc = null;
    if (hc !== this.hoverCluster || h.node !== this.hoverNode) {
      this.hoverCluster = hc;
      this.hoverNode = h.node;
      this.refreshStates();
      this.cb.onHover({ cluster: hc, node: h.node });
      this.renderer.domElement.style.cursor = h.node || hc ? 'pointer' : 'grab';
    }
  }

  private updateOverlay() {
    const show = this.assemble > 0.85;
    this.overlay.style.opacity = show ? '1' : '0';

    // Cluster labels
    this.clusterScreen.forEach((s, i) => {
      const L = this.clusterLabels[i].el;
      const id = clusters[i].id;
      const isActive = id === this.activeCluster;
      const isHover = id === this.hoverCluster;
      L.style.display = s.z <= 0 ? 'none' : 'block';
      const lx = Math.min(s.x + Math.max(16, s.r * 0.7), this.width - 190);
      L.style.transform = `translate3d(${Math.round(lx)}px, ${Math.round(s.y - 8)}px, 0)`;
      L.classList.toggle('is-hover', isHover);
      L.classList.toggle('is-active', isActive);
      L.classList.toggle('is-dim', !!this.activeCluster && !isActive && !isHover);
    });

    // Screen-space bounding box for the hovered (or active) cluster
    const bIdx = this.hoverCluster ? CLUSTER_INDEX[this.hoverCluster] : -1;
    if (bIdx >= 0) {
      const box = this.boxBounds[bIdx];
      let minX = Infinity;
      let minY = Infinity;
      let maxX = -Infinity;
      let maxY = -Infinity;
      let ok = true;
      for (let c = 0; c < 8; c++) {
        this.tmp.set(c & 1 ? box.max.x : box.min.x, c & 2 ? box.max.y : box.min.y, c & 4 ? box.max.z : box.min.z).project(this.camera);
        if (this.tmp.z > 1) ok = false;
        const x = (this.tmp.x * 0.5 + 0.5) * this.width;
        const y = (-this.tmp.y * 0.5 + 0.5) * this.height;
        minX = Math.min(minX, x);
        minY = Math.min(minY, y);
        maxX = Math.max(maxX, x);
        maxY = Math.max(maxY, y);
      }
      if (ok) {
        const c = clusters[bIdx];
        this.bboxEl.style.opacity = '1';
        this.bboxEl.style.transform = `translate3d(${Math.round(minX)}px, ${Math.round(minY)}px, 0)`;
        this.bboxEl.style.width = `${Math.round(maxX - minX)}px`;
        this.bboxEl.style.height = `${Math.round(maxY - minY)}px`;
        this.bboxLabel.textContent = `${c.code} / ${c.label.toUpperCase()} / ${nodes.filter((n) => n.cluster === c.id).length} NODES`;
      } else this.bboxEl.style.opacity = '0';
    } else this.bboxEl.style.opacity = '0';

    // Node labels with greedy overlap avoidance
    const placed: [number, number, number, number][] = [];
    const sel = this.selected;
    const relatedIds = new Set<string>();
    if (sel) edges.forEach((e) => (e.from === sel ? relatedIds.add(e.to) : e.to === sel ? relatedIds.add(e.from) : null));
    const order = nodes
      .map((n, i) => ({ n, i, pr: n.id === sel ? 0 : n.id === this.hoverNode ? 1 : relatedIds.has(n.id) ? 2 : 3 }))
      .sort((a, b) => a.pr - b.pr || this.nodeScreen[a.i * 3 + 2] - this.nodeScreen[b.i * 3 + 2]);
    for (const { n, i, pr } of order) {
      const L = this.nodeLabels[i];
      const want =
        show &&
        this.nodeVisible[i] &&
        (pr < 3 || n.cluster === this.activeCluster || (!this.activeCluster && n.cluster === this.hoverCluster && pr < 3));
      if (!want) {
        L.el.style.display = 'none';
        continue;
      }
      L.el.style.display = 'block';
      if (!L.w) {
        L.w = L.el.offsetWidth;
        L.h = L.el.offsetHeight;
      }
      const x = this.nodeScreen[i * 3] + 10;
      const y = this.nodeScreen[i * 3 + 1] - L.h / 2;
      const rect: [number, number, number, number] = [x, y, x + L.w, y + L.h];
      const overlaps = placed.some((p) => !(rect[2] < p[0] || rect[0] > p[2] || rect[3] < p[1] || rect[1] > p[3]));
      if (overlaps && pr === 3) {
        L.el.style.display = 'none';
        continue;
      }
      placed.push(rect);
      L.el.style.transform = `translate3d(${Math.round(x)}px, ${Math.round(y)}px, 0)`;
      L.el.classList.toggle('is-strong', pr < 2);
      L.el.classList.toggle('is-related', pr === 2);
    }

    // Selected node coordinate tag
    if (sel) {
      const i = nodes.findIndex((n) => n.id === sel);
      const n = nodes[i];
      if (this.nodeVisible[i]) {
        this.selTag.style.display = 'block';
        this.selTag.style.transform = `translate3d(${Math.round(this.nodeScreen[i * 3] + 10)}px, ${Math.round(this.nodeScreen[i * 3 + 1] + 10)}px, 0)`;
        this.selTag.textContent = `X ${fmt(n.position[0])} / Y ${fmt(n.position[1])} / Z ${fmt(n.position[2])}`;
      } else this.selTag.style.display = 'none';
    } else this.selTag.style.display = 'none';

    // Axis labels
    this.axisLabels.forEach(({ el, pos }) => {
      this.tmp.copy(pos).project(this.camera);
      if (this.tmp.z > 1 || !show) {
        el.style.display = 'none';
        return;
      }
      el.style.display = 'block';
      el.style.transform = `translate3d(${Math.round((this.tmp.x * 0.5 + 0.5) * this.width + 4)}px, ${Math.round((-this.tmp.y * 0.5 + 0.5) * this.height - 6)}px, 0)`;
    });

    if (this.camReadout) {
      const p = this.camera.position;
      this.camReadout.textContent = `CAM X ${fmt(p.x)} / Y ${fmt(p.y)} / Z ${fmt(p.z)}`;
    }
  }

  dispose() {
    this.disposed = true;
    cancelAnimationFrame(this.raf);
    const dom = this.renderer.domElement;
    dom.removeEventListener('pointermove', this.onPointerMove);
    dom.removeEventListener('pointerleave', this.onPointerLeave);
    dom.removeEventListener('pointerdown', this.onPointerDown);
    dom.removeEventListener('pointerup', this.onPointerUp);
    this.controls.removeEventListener('start', this.cancelTween);
    window.removeEventListener('resize', this.resize);
    document.removeEventListener('visibilitychange', this.onVisibility);
    this.controls.dispose();
    this.scene.traverse((o) => {
      const m = o as THREE.Mesh;
      m.geometry?.dispose?.();
      const mat = m.material as THREE.Material | THREE.Material[] | undefined;
      if (Array.isArray(mat)) mat.forEach((x) => x.dispose());
      else mat?.dispose?.();
    });
    this.renderer.dispose();
    dom.remove();
    this.overlay.innerHTML = '';
  }

  static nodeById(id: string): AtlasNode | undefined {
    return nodes.find((n) => n.id === id);
  }
}

function fmt(v: number) {
  const s = Math.abs(v).toFixed(1).padStart(4, '0');
  return `${v < 0 ? '-' : '+'}${s}`;
}

function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);
}
