import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { MemoryLayer } from './MemoryLayer';
import {
  galleryCenter,
  galleryRows,
  clusters,
  edges,
  nodes,
  timeline,
  towerPos,
  xForYear,
  STREET_HALF_WIDTH,
  STREET_LENGTH,
  type ClusterId,
} from '@/data/atlas';

/*
 * Imperative Three.js engine for the point-cloud Knowledge Atlas.
 * React owns the interface; this class owns the scene, the camera and the screen-space
 * annotations that must be positioned every frame.
 */

export interface EngineCallbacks {
  onHover: (h: { node: string | null; x: number; y: number }) => void;
  onPickNode: (id: string) => void;
  onPickEmpty: () => void;
}

export interface EngineOptions {
  reduced: boolean;
  lowPower: boolean;
  assemble: boolean;
}

const PAPER = new THREE.Color('#F1F0EC');
const SEGMENTS: ClusterId[] = ['experience', 'engagements', 'builds', 'industries', 'research', 'visual'];
const SEG_INDEX = Object.fromEntries(SEGMENTS.map((s, i) => [s, i])) as Record<ClusterId, number>;
const STREET_SEG = 6;
const OWNER_INDEX = Object.fromEntries(timeline.map((b, i) => [b.id, i])) as Record<string, number>;

const OVERVIEW_TARGET = new THREE.Vector3(4, 5, 0);
const OVERVIEW_POS = new THREE.Vector3(-30, 40, 74);
// Portrait screens look down the street so it recedes vertically.
const OVERVIEW_POS_PORTRAIT = new THREE.Vector3(-78, 56, 30);

const PARTICLE_VERT = `
attribute vec3 aStart;
attribute float aSize;
attribute float aAlpha;
attribute float aSeg;
attribute float aOwner;
attribute float aDelay;
attribute float aSeed;
attribute float aRatio;
uniform float uTime;
uniform float uAssemble;
uniform float uPixel;
uniform float uDrift;
uniform float uSeg[7];
uniform float uOwner;
uniform float uHoverOwner;
varying float vAlpha;
varying float vRatio;
void main() {
  float t = clamp(uAssemble * 1.7 - aDelay, 0.0, 1.0);
  t = t * t * (3.0 - 2.0 * t);
  vec3 p = mix(aStart, position, t);
  float flick = aSeg > 5.5 ? 0.0 : 1.0;
  p += uDrift * 0.06 * flick * vec3(sin(uTime * 0.7 + aSeed * 6.28), cos(uTime * 0.5 + aSeed * 4.1), sin(uTime * 0.6 + aSeed * 9.3));
  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  float seg = uSeg[int(aSeg + 0.5)];
  float own = 1.0;
  if (aOwner > -0.5) {
    if (uOwner > -0.5) own = abs(aOwner - uOwner) < 0.5 ? 1.9 : 0.32;
    if (abs(aOwner - uHoverOwner) < 0.5) own = max(own, 1.6);
  }
  float dist = max(0.5, -mv.z);
  vAlpha = aAlpha * seg * own * (0.25 + 0.75 * t) * clamp(1.6 - dist / 190.0, 0.0, 1.0) * smoothstep(0.8, 5.0, dist);
  vRatio = aRatio;
  gl_PointSize = clamp(aSize * uPixel * (62.0 / dist), 1.0, 5.0 * uPixel);
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
attribute float aKind;
uniform float uPixel;
uniform float uAssemble;
varying float vState;
varying float vFade;
void main() {
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  float dist = max(0.5, -mv.z);
  vState = aState;
  vFade = smoothstep(0.55, 1.0, uAssemble) * clamp(1.6 - dist / 150.0, 0.15, 1.0);
  float s = aState > 1.5 ? 22.0 : aState > 0.5 ? 13.0 : aState < -0.5 ? 5.0 : 8.0;
  if (aKind > 0.5) s *= 1.35;
  gl_PointSize = s * uPixel * clamp(34.0 / dist, 0.5, 1.5);
  gl_Position = projectionMatrix * mv;
}`;

const NODE_FRAG = `
uniform vec3 uColor;
varying float vState;
varying float vFade;
void main() {
  vec2 pc = abs(gl_PointCoord - 0.5);
  float m = max(pc.x, pc.y);
  float a = vState > 1.5 ? ((m > 0.42 ? 1.0 : 0.0) + (m < 0.14 ? 1.0 : 0.0)) : (m < 0.32 ? 1.0 : 0.0);
  float level = vState > 1.5 ? 1.0 : vState > 0.5 ? 0.95 : vState < -0.5 ? 0.14 : 0.7;
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

const fmt = (v: number) => `${v < 0 ? '-' : '+'}${Math.abs(v).toFixed(1).padStart(4, '0')}`;

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
  private towerBoxes = new Map<string, { mesh: THREE.LineSegments; box: THREE.Box3 }>();
  private dropLine!: THREE.Line;
  private memoryLayer!: MemoryLayer;

  private assemble = 0;
  private segLevels = new Float32Array(7).fill(1);
  private segTarget = new Float32Array(7).fill(1);
  private ownerActive = -1;
  private ownerHover = -1;

  private activeExp: string | null = null;
  private selected: string | null = null;
  private hoverNode: string | null = null;
  private focusSegs: Set<ClusterId> = new Set();
  private tween: Tween | null = null;

  private pointer = { x: -1, y: -1, inside: false };
  private down = { x: 0, y: 0, t: 0, active: false };
  private width = 1;
  private height = 1;

  private nodeScreen: Float32Array;
  private nodeVisible: Uint8Array;
  private towerScreen = new Map<string, { minX: number; minY: number; maxX: number; maxY: number; z: number; ok: boolean }>();

  private nodeLabels: LabelEl[] = [];
  private yearLabels: { el: HTMLDivElement; pos: THREE.Vector3 }[] = [];
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
    this.scene.fog = new THREE.Fog(0x090909, 90, 260);

    this.camera = new THREE.PerspectiveCamera(46, 1, 0.1, 500);
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
    this.controls.panSpeed = 0.7;
    this.controls.minDistance = 3;
    this.controls.maxDistance = 170;
    this.controls.maxPolarAngle = Math.PI / 2 - 0.02;
    this.controls.update();

    this.nodeScreen = new Float32Array(nodes.length * 3);
    this.nodeVisible = new Uint8Array(nodes.length);

    this.buildParticles();
    this.buildNodes();
    this.buildEdges();
    this.buildTowerBoxes();
    this.buildDropLine();
    this.memoryLayer = new MemoryLayer(this.scene, nodes, this.renderer.getPixelRatio(), opts.lowPower);

    this.bboxEl = this.makeEl('atlas-bbox');
    this.bboxLabel = document.createElement('span');
    this.bboxLabel.className = 'atlas-bbox-label';
    this.bboxEl.appendChild(this.bboxLabel);
    this.selTag = this.makeEl('atlas-seltag');
    nodes.forEach((n) => {
      const el = this.makeEl(n.kind === 'experience' ? 'atlas-explabel' : 'atlas-nlabel');
      el.innerHTML =
        n.kind === 'experience'
          ? `<span class="e-code">${n.code} / ${n.year}</span><span class="e-name">${escapeHtml(n.title)}</span><span class="e-meta">${escapeHtml(n.meta ?? '')}</span>`
          : `<span class="n-code">${n.code}</span>${escapeHtml(n.title)}`;
      this.nodeLabels.push({ el, w: 0, h: 0 });
    });
    for (let y = 2013; y <= 2026; y++) {
      const el = this.makeEl('atlas-year');
      el.textContent = String(y);
      this.yearLabels.push({ el, pos: new THREE.Vector3(xForYear(y), 0, STREET_HALF_WIDTH + 0.8) });
    }

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
    const k = this.opts.lowPower ? 0.38 : 1;
    const P: number[] = [];
    const S: number[] = [];
    const size: number[] = [];
    const alpha: number[] = [];
    const seg: number[] = [];
    const owner: number[] = [];
    const ratio: number[] = [];

    const push = (x: number, y: number, z: number, sg: number, ow: number, sz: number, a: number, rt = 1) => {
      P.push(x, y, z);
      // Start as a flat sheet of fragments in front of the camera: the page that dissolved.
      S.push((r() - 0.5) * 130, (r() - 0.5) * 70 + 20, 60 + r() * 20);
      size.push(sz);
      alpha.push(a);
      seg.push(sg);
      owner.push(ow);
      ratio.push(rt);
    };

    // Street: road, lane line, curbs, year ticks, wider ground.
    const x0 = -STREET_LENGTH / 2 - 14;
    const x1 = STREET_LENGTH / 2 + 22;
    const W = STREET_HALF_WIDTH;
    const road = Math.round(26000 * k);
    for (let i = 0; i < road; i++) {
      const x = x0 + r() * (x1 - x0);
      const z = (r() * 2 - 1) * W;
      const lane = Math.abs(z) < 0.12 && Math.floor(x / 1.6) % 2 === 0;
      push(x, r() * 0.05, z, STREET_SEG, -1, lane ? 1.6 : 0.9 + r() * 0.6, lane ? 0.55 : 0.06 + r() * 0.12);
    }
    const curb = Math.round(5000 * k);
    for (let i = 0; i < curb; i++) {
      const x = x0 + r() * (x1 - x0);
      const side = r() < 0.5 ? -1 : 1;
      push(x, r() * 0.25, side * (W + r() * 0.15), STREET_SEG, -1, 1.2, 0.35 + r() * 0.2);
    }
    for (let y = 2013; y <= 2026; y++) {
      const x = xForYear(y);
      for (let i = 0; i < Math.round(160 * k); i++) push(x + (r() - 0.5) * 0.08, 0.02, (r() * 2 - 1) * W, STREET_SEG, -1, 1.3, 0.45);
    }
    const ground = Math.round(16000 * k);
    for (let i = 0; i < ground; i++) {
      const x = x0 + r() * (x1 - x0);
      const z = (r() < 0.5 ? -1 : 1) * (W + 0.5 + Math.pow(r(), 0.8) * 32);
      push(x, 0, z, STREET_SEG, -1, 0.8, 0.04 + r() * 0.07);
    }

    // Towers: one per role, box surfaces with a window grid, plus engagement floor slabs.
    timeline.forEach((b) => {
      const t = towerPos.get(b.id)!;
      const ow = OWNER_INDEX[b.id];
      const n = Math.round((t.w * t.h + t.d * t.h) * 9 * k);
      for (let i = 0; i < n; i++) {
        const face = r();
        let x: number;
        let z: number;
        const y = r() * t.h;
        if (face < 0.62) {
          x = t.x + (r() - 0.5) * t.w;
          z = t.z + (r() < 0.5 ? -1 : 1) * (t.d / 2);
        } else {
          x = t.x + (r() < 0.5 ? -1 : 1) * (t.w / 2);
          z = t.z + (r() - 0.5) * t.d;
        }
        const gx = Math.abs(((x - t.x) / 0.9) % 1);
        const gy = Math.abs((y / 1.1) % 1);
        const win = gx < 0.55 && gy > 0.25 && gy < 0.7;
        push(x, y, z, 0, ow, win ? 1.5 : 0.9, win ? 0.5 + r() * 0.35 : 0.12 + r() * 0.12, win && r() < 0.4 ? 0.45 : 1);
      }
      // Vertical edges
      for (let i = 0; i < Math.round(t.h * 40 * k); i++) {
        const cx = (r() < 0.5 ? -1 : 1) * (t.w / 2);
        const cz = (r() < 0.5 ? -1 : 1) * (t.d / 2);
        push(t.x + cx, r() * t.h, t.z + cz, 0, ow, 1.3, 0.6);
      }
      // Roof
      for (let i = 0; i < Math.round(t.w * t.d * 14 * k); i++) push(t.x + (r() - 0.5) * t.w, t.h, t.z + (r() - 0.5) * t.d, 0, ow, 1.0, 0.3);
    });
    nodes
      .filter((nd) => nd.kind === 'engagement' && nd.owner)
      .forEach((nd) => {
        const t = towerPos.get(nd.owner!)!;
        const ow = OWNER_INDEX[nd.owner!];
        for (let i = 0; i < Math.round(520 * k); i++) {
          push(t.x + (r() - 0.5) * t.w, nd.position[1] + gauss(r) * 0.05, t.z + (r() - 0.5) * t.d, 1, ow, 1.1, 0.3 + r() * 0.3);
        }
      });

    // Builds: small blocks on pedestals.
    nodes
      .filter((nd) => nd.kind === 'project')
      .forEach((nd, j) => {
        const [x, , z] = nd.position;
        const h = 1.6 + (j % 3) * 0.9;
        const ow = nd.owner ? OWNER_INDEX[nd.owner] : -1;
        for (let i = 0; i < Math.round(700 * k); i++) {
          const f = r();
          const px = x + (f < 0.5 ? (r() - 0.5) * 2 : (r() < 0.5 ? -1 : 1));
          const pz = z + (f < 0.5 ? (r() < 0.5 ? -1 : 1) : (r() - 0.5) * 2);
          push(px, r() * h, pz, 2, ow, 1.1, 0.2 + r() * 0.3);
        }
        for (let i = 0; i < Math.round(220 * k); i++) push(x + (r() - 0.5) * 3, 0.03, z + (r() - 0.5) * 3, 2, ow, 0.9, 0.18);
      });

    // Industries: haze above the street.
    nodes
      .filter((nd) => nd.kind === 'industry')
      .forEach((nd) => {
        const [x, y, z] = nd.position;
        for (let i = 0; i < Math.round(480 * k); i++) push(x + gauss(r) * 1.8, y + gauss(r) * 0.9, z + gauss(r) * 1.8, 3, -1, 1.1 + r(), 0.12 + r() * 0.25);
      });

    // Research: papers orbit like small satellites, ideas as puffs.
    nodes
      .filter((nd) => nd.cluster === 'research')
      .forEach((nd) => {
        const [x, y, z] = nd.position;
        const ow = nd.owner ? OWNER_INDEX[nd.owner] : -1;
        if (nd.kind === 'paper' && nd.memory) {
          // The photo itself represents this paper.
        } else if (nd.kind === 'paper') {
          for (let i = 0; i < Math.round(360 * k); i++) {
            const a = r() * Math.PI * 2;
            const rr = 1.5 + gauss(r) * 0.05;
            push(x + Math.cos(a) * rr, y + Math.sin(a) * rr * 0.35, z + Math.sin(a) * rr, 4, ow, 1.1, 0.35);
          }
        } else {
          for (let i = 0; i < Math.round(260 * k); i++) push(x + gauss(r) * 0.9, y + gauss(r) * 0.9, z + gauss(r) * 0.9, 4, -1, 1.1, 0.18 + r() * 0.3);
        }
      });

    // Visual archive: a small lattice.
    nodes
      .filter((nd) => nd.cluster === 'visual')
      .forEach((nd) => {
        const [x, y, z] = nd.position;
        for (let i = 0; i < Math.round(180 * k); i++) push(x + Math.round(gauss(r) * 2) * 0.4, y + Math.round(gauss(r) * 2) * 0.4, z + Math.round(gauss(r) * 2) * 0.4, 5, -1, 1.4, 0.3);
      });

    // Sky dust
    for (let i = 0; i < Math.round(5000 * k); i++) {
      push(x0 + r() * (x1 - x0), 4 + r() * 50, (r() * 2 - 1) * 60, STREET_SEG, -1, 0.7, 0.04 + r() * 0.08);
    }

    const count = P.length / 3;
    const delay = new Float32Array(count).map(() => r() * 0.7);
    const seed = new Float32Array(count).map(() => r());
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(P, 3));
    geo.setAttribute('aStart', new THREE.Float32BufferAttribute(S, 3));
    geo.setAttribute('aSize', new THREE.Float32BufferAttribute(size, 1));
    geo.setAttribute('aAlpha', new THREE.Float32BufferAttribute(alpha, 1));
    geo.setAttribute('aSeg', new THREE.Float32BufferAttribute(seg, 1));
    geo.setAttribute('aOwner', new THREE.Float32BufferAttribute(owner, 1));
    geo.setAttribute('aRatio', new THREE.Float32BufferAttribute(ratio, 1));
    geo.setAttribute('aDelay', new THREE.BufferAttribute(delay, 1));
    geo.setAttribute('aSeed', new THREE.BufferAttribute(seed, 1));
    geo.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 300);

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
        uSeg: { value: this.segLevels },
        uOwner: { value: -1 },
        uHoverOwner: { value: -1 },
        uColor: { value: PAPER },
      },
    });
    this.scene.add(new THREE.Points(geo, this.particleMat));
  }

  private buildNodes() {
    const pos = new Float32Array(nodes.length * 3);
    const kind = new Float32Array(nodes.length);
    nodes.forEach((n, i) => {
      pos.set(n.position, i * 3);
      kind[i] = n.kind === 'experience' ? 1 : 0;
    });
    this.nodeStates = new Float32Array(nodes.length);
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geo.setAttribute('aKind', new THREE.BufferAttribute(kind, 1));
    this.nodeStateAttr = new THREE.BufferAttribute(this.nodeStates, 1);
    geo.setAttribute('aState', this.nodeStateAttr);
    this.nodeMat = new THREE.ShaderMaterial({
      vertexShader: NODE_VERT,
      fragmentShader: NODE_FRAG,
      transparent: true,
      depthWrite: false,
      uniforms: { uPixel: { value: this.renderer.getPixelRatio() }, uAssemble: { value: 0 }, uColor: { value: PAPER } },
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

  private buildTowerBoxes() {
    timeline.forEach((b) => {
      const t = towerPos.get(b.id)!;
      const box = new THREE.Box3(new THREE.Vector3(t.x - t.w / 2, 0, t.z - t.d / 2), new THREE.Vector3(t.x + t.w / 2, t.h + 2.5, t.z + t.d / 2));
      const size = box.getSize(new THREE.Vector3()).addScalar(0.6);
      const mesh = new THREE.LineSegments(
        new THREE.EdgesGeometry(new THREE.BoxGeometry(size.x, size.y, size.z)),
        new THREE.LineBasicMaterial({ color: PAPER, transparent: true, opacity: 0, depthWrite: false }),
      );
      box.getCenter(mesh.position);
      this.scene.add(mesh);
      this.towerBoxes.set(b.id, { mesh, box });
    });
  }

  private buildDropLine() {
    const dg = new THREE.BufferGeometry();
    dg.setAttribute('position', new THREE.Float32BufferAttribute([0, 0, 0, 0, 0, 0], 3));
    this.dropLine = new THREE.Line(dg, new THREE.LineDashedMaterial({ color: PAPER, dashSize: 0.4, gapSize: 0.4, transparent: true, opacity: 0.45 }));
    this.dropLine.visible = false;
    this.scene.add(this.dropLine);
  }

  // ------------------------------------------------------------------- state

  private related(id: string | null) {
    const out = new Set<string>();
    if (!id) return out;
    edges.forEach((e) => {
      if (e.from === id) out.add(e.to);
      if (e.to === id) out.add(e.from);
    });
    return out;
  }

  private refreshStates() {
    const pivot = this.selected ?? this.hoverNode;
    const rel = this.related(pivot);
    const owner = this.activeExp?.replace('exp:', '') ?? null;
    nodes.forEach((n, i) => {
      let s = 0;
      if (n.id === this.selected || n.id === this.hoverNode) s = 2;
      else if (rel.has(n.id)) s = 1;
      else if (owner && n.owner === owner) s = 1;
      else if (this.focusSegs.size && !this.inSeg(n)) s = -1;
      else if (owner && n.kind !== 'experience') s = -1;
      this.nodeStates[i] = s;
    });
    this.nodeStateAttr.needsUpdate = true;

    const byId = new Map(nodes.map((n) => [n.id, n]));
    edges.forEach((e, i) => {
      const a = byId.get(e.from)!;
      const b = byId.get(e.to)!;
      let v = e.kind === 'sector' ? 0.035 : e.kind === 'illustrative' ? 0.04 : 0.07;
      if (this.focusSegs.size && (this.inSeg(a) || this.inSeg(b))) v = 0.22;
      if (owner && (a.owner === owner || b.owner === owner || e.from === `exp:${owner}`)) v = 0.4;
      if (pivot && (e.from === pivot || e.to === pivot)) v = 0.9;
      this.edgeAlpha[i * 2] = v;
      this.edgeAlpha[i * 2 + 1] = v;
    });
    this.edgeAlphaAttr.needsUpdate = true;

    SEGMENTS.forEach((s, i) => {
      this.segTarget[i] = this.focusSegs.size ? (this.focusSegs.has(s) ? 1.5 : 0.18) : 1;
    });
    this.segTarget[STREET_SEG] = this.focusSegs.size ? 0.6 : 1;
    this.ownerActive = owner ? OWNER_INDEX[owner] : -1;

    const lifted = new Set<string>();
    nodes.forEach((n) => {
      if (!n.memory) return;
      if (n.id === this.selected || n.id === this.hoverNode) lifted.add(n.id);
      else if (owner && n.owner === owner) lifted.add(n.id);
      else if (this.focusSegs.has('memories')) lifted.add(n.id);
    });
    this.memoryLayer?.setLifted(lifted);
  }

  /** Frame the photo gallery of a role. Returns false when the role has no memories. */
  focusMemories(expId: string, duration = 1500) {
    const role = expId.replace('exp:', '');
    const c = galleryCenter(role);
    if (!c) return false;
    this.activeExp = expId;
    this.selected = expId;
    this.refreshStates();
    const target = new THREE.Vector3(...c);
    const side = Math.sign(c[2]);
    const back = 22 + Math.max(0, galleryRows(role) - 1) * 9;
    this.flyTo(new THREE.Vector3(c[0] - 4, c[1] + 1.5, c[2] - side * back), target, duration);
    return true;
  }

  private inSeg(n: { cluster: ClusterId; memory?: unknown }) {
    return this.focusSegs.has(n.cluster) || (!!n.memory && this.focusSegs.has('memories'));
  }

  /** Highlight one or more segments; an empty set shows everything. */
  setSegments(segs: ClusterId[]) {
    this.focusSegs = new Set(segs);
    this.refreshStates();
  }

  /** Focus a role. `view` 'overview' frames the tower; 'street' stands in the street before it. */
  focusExperience(expId: string | null, view: 'overview' | 'street' = 'overview', duration = 1300) {
    this.activeExp = expId;
    this.selected = expId;
    this.refreshStates();
    this.updateDrop();
    if (!expId) {
      this.flyTo(this.overviewPos(), OVERVIEW_TARGET.clone(), duration);
      return;
    }
    const t = towerPos.get(expId.replace('exp:', ''))!;
    const target = new THREE.Vector3(t.x, t.h * 0.5, t.z * 0.6);
    if (view === 'street') {
      // Stand on the far side of the street, a little behind in time, looking at the tower.
      this.flyTo(new THREE.Vector3(t.x - 20, 4.5, -Math.sign(t.z) * 9), new THREE.Vector3(t.x, t.h * 0.45, t.z), duration);
    } else {
      const dir = new THREE.Vector3(-0.35, 0.35, -Math.sign(t.z) * 1).normalize();
      this.flyTo(target.clone().add(dir.multiplyScalar(t.h * 1.4 + 14)), target, duration);
    }
  }

  selectNode(id: string | null, fly = true) {
    const n = id ? nodes.find((x) => x.id === id) : null;
    if (n?.kind === 'experience') return this.focusExperience(n.id, 'overview');
    this.selected = id;
    if (n && n.owner) this.activeExp = `exp:${n.owner}`;
    else if (n) this.activeExp = null;
    this.refreshStates();
    this.updateDrop();
    if (n && fly) {
      const target = new THREE.Vector3(...n.position);
      const dir = this.camera.position.clone().sub(this.controls.target).normalize();
      this.flyTo(target.clone().add(dir.multiplyScalar(13)), target, 1100);
    }
  }

  resetView() {
    this.activeExp = null;
    this.selected = null;
    this.refreshStates();
    this.updateDrop();
    this.flyTo(this.overviewPos(), OVERVIEW_TARGET.clone(), 1300);
  }

  private updateDrop() {
    const n = this.selected ? nodes.find((x) => x.id === this.selected) : null;
    if (!n) {
      this.dropLine.visible = false;
      return;
    }
    const p = this.dropLine.geometry.getAttribute('position') as THREE.BufferAttribute;
    p.setXYZ(0, ...n.position);
    p.setXYZ(1, n.position[0], 0, n.position[2]);
    p.needsUpdate = true;
    this.dropLine.computeLineDistances();
    this.dropLine.visible = true;
  }

  private flyTo(pos: THREE.Vector3, target: THREE.Vector3, duration: number) {
    if (this.opts.reduced) {
      this.camera.position.copy(pos);
      this.controls.target.copy(target);
      this.controls.update();
      return;
    }
    this.tween = { fromPos: this.camera.position.clone(), fromTarget: this.controls.target.clone(), toPos: pos, toTarget: target, start: performance.now(), duration };
  }

  private cancelTween = () => {
    this.tween = null;
  };

  // --------------------------------------------------------------- pointer

  private onPointerMove = (e: PointerEvent) => {
    const r = this.renderer.domElement.getBoundingClientRect();
    this.pointer.x = e.clientX - r.left;
    this.pointer.y = e.clientY - r.top;
    this.pointer.inside = e.pointerType !== 'touch';
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
    if (Math.hypot(e.clientX - this.down.x, e.clientY - this.down.y) > 6 || performance.now() - this.down.t > 700) return;
    const r = this.renderer.domElement.getBoundingClientRect();
    const hit = this.hitTest(e.clientX - r.left, e.clientY - r.top, e.pointerType === 'touch' ? 28 : 15);
    if (hit) this.cb.onPickNode(hit);
    else this.cb.onPickEmpty();
  };

  private hitTest(x: number, y: number, radius: number): string | null {
    let best = -1;
    let bestD = radius;
    nodes.forEach((n, i) => {
      if (!this.nodeVisible[i] || this.nodeStates[i] < 0) return;
      const d = Math.hypot(this.nodeScreen[i * 3] - x, this.nodeScreen[i * 3 + 1] - y);
      if (d < bestD) {
        bestD = d;
        best = i;
      }
    });
    if (best >= 0) return nodes[best].id;
    // Towers: anywhere inside a role's projected bounding box.
    let tBest: string | null = null;
    let tz = Infinity;
    this.towerScreen.forEach((s, id) => {
      if (s.ok && x >= s.minX && x <= s.maxX && y >= s.minY && y <= s.maxY && s.z < tz) {
        tz = s.z;
        tBest = `exp:${id}`;
      }
    });
    return tBest;
  }

  // --------------------------------------------------------------- loop

  private overviewPos() {
    const aspect = this.width / this.height;
    if (aspect < 1) return OVERVIEW_POS_PORTRAIT.clone();
    return OVERVIEW_POS.clone();
  }

  private resize = () => {
    const r = this.container.getBoundingClientRect();
    this.width = Math.max(1, r.width);
    this.height = Math.max(1, r.height);
    this.camera.aspect = this.width / this.height;
    this.camera.fov = this.camera.aspect < 1 ? 60 : 46;
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
    if (this.assemble < 1) this.assemble = Math.min(1, this.assemble + dt / 1.8);

    if (this.tween) {
      const t = Math.min(1, (now - this.tween.start) / this.tween.duration);
      const e = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
      this.camera.position.lerpVectors(this.tween.fromPos, this.tween.toPos, e);
      this.controls.target.lerpVectors(this.tween.fromTarget, this.tween.toTarget, e);
      if (t >= 1) this.tween = null;
    }
    this.controls.update();
    this.project();
    this.updateHover();

    const k = Math.min(1, dt * 5);
    for (let i = 0; i < 7; i++) this.segLevels[i] += (this.segTarget[i] - this.segLevels[i]) * k;
    const focal = (this.height * this.renderer.getPixelRatio()) / 2 / Math.tan((this.camera.fov * Math.PI) / 360);
    this.memoryLayer.update(dt, this.assemble, this.opts.reduced, focal);
    const u = this.particleMat.uniforms;
    u.uOwner.value = this.ownerActive;
    u.uHoverOwner.value = this.ownerHover;
    u.uTime.value += this.opts.reduced ? 0 : dt;
    u.uAssemble.value = this.assemble;
    this.nodeMat.uniforms.uAssemble.value = this.assemble;
    this.edgeMat.uniforms.uAssemble.value = this.assemble;

    const owner = this.activeExp?.replace('exp:', '');
    const hoverOwner = this.hoverNode?.startsWith('exp:') ? this.hoverNode.slice(4) : null;
    this.towerBoxes.forEach(({ mesh }, id) => {
      const m = mesh.material as THREE.LineBasicMaterial;
      const target = id === owner ? 0.45 : id === hoverOwner ? 0.3 : 0;
      m.opacity += (target - m.opacity) * k;
      mesh.visible = m.opacity > 0.01;
    });

    this.renderer.render(this.scene, this.camera);
    this.updateOverlay();
  };

  private project() {
    const v = this.tmp;
    nodes.forEach((n, i) => {
      v.set(...n.position).project(this.camera);
      this.nodeVisible[i] = v.z < 1 && v.z > -1 && Math.abs(v.x) < 1.1 && Math.abs(v.y) < 1.1 ? 1 : 0;
      this.nodeScreen[i * 3] = (v.x * 0.5 + 0.5) * this.width;
      this.nodeScreen[i * 3 + 1] = (-v.y * 0.5 + 0.5) * this.height;
      this.nodeScreen[i * 3 + 2] = v.z;
    });
    this.towerBoxes.forEach(({ box }, id) => {
      let minX = Infinity;
      let minY = Infinity;
      let maxX = -Infinity;
      let maxY = -Infinity;
      let ok = true;
      let z = 0;
      for (let c = 0; c < 8; c++) {
        v.set(c & 1 ? box.max.x : box.min.x, c & 2 ? box.max.y : box.min.y, c & 4 ? box.max.z : box.min.z).project(this.camera);
        if (v.z > 1 || v.z < -1) ok = false;
        z += v.z / 8;
        const x = (v.x * 0.5 + 0.5) * this.width;
        const y = (-v.y * 0.5 + 0.5) * this.height;
        minX = Math.min(minX, x);
        minY = Math.min(minY, y);
        maxX = Math.max(maxX, x);
        maxY = Math.max(maxY, y);
      }
      this.towerScreen.set(id, { minX, minY, maxX, maxY, z, ok });
    });
  }

  private updateHover() {
    let h: string | null = null;
    if (this.pointer.inside && !this.tween) h = this.hitTest(this.pointer.x, this.pointer.y, 15);
    if (h !== this.hoverNode) {
      this.hoverNode = h;
      const n = h ? nodes.find((x) => x.id === h) : null;
      this.ownerHover = n?.kind === 'experience' ? OWNER_INDEX[n.owner!] : n?.owner ? OWNER_INDEX[n.owner] : -1;
      this.refreshStates();
      this.renderer.domElement.style.cursor = h ? 'pointer' : 'grab';
    }
    this.cb.onHover({ node: this.hoverNode, x: this.pointer.x, y: this.pointer.y });
  }

  private updateOverlay() {
    const show = this.assemble > 0.85;
    this.overlay.style.opacity = show ? '1' : '0';

    // Screen-space box around the hovered role
    const hoverOwner = this.hoverNode?.startsWith('exp:') ? this.hoverNode.slice(4) : null;
    const s = hoverOwner ? this.towerScreen.get(hoverOwner) : null;
    if (s && s.ok) {
      const n = nodes.find((x) => x.id === `exp:${hoverOwner}`)!;
      this.bboxEl.style.opacity = '1';
      this.bboxEl.style.transform = `translate3d(${Math.round(s.minX)}px, ${Math.round(s.minY)}px, 0)`;
      this.bboxEl.style.width = `${Math.round(s.maxX - s.minX)}px`;
      this.bboxEl.style.height = `${Math.round(s.maxY - s.minY)}px`;
      this.bboxLabel.textContent = `${n.code} / ${n.title.toUpperCase()} / X ${fmt(n.position[0])} Z ${fmt(n.position[2])}`;
    } else this.bboxEl.style.opacity = '0';

    // Labels with greedy overlap avoidance. Roles always label; others when relevant.
    const placed: [number, number, number, number][] = [];
    const pivot = this.selected ?? this.hoverNode;
    const rel = this.related(pivot);
    const owner = this.activeExp?.replace('exp:', '') ?? null;
    const order = nodes
      .map((n, i) => {
        let pr = 4;
        if (n.id === this.selected || n.id === this.hoverNode) pr = 0;
        else if (n.kind === 'experience') pr = 1;
        else if (rel.has(n.id)) pr = 2;
        else if (owner && n.owner === owner) pr = 3;
        else if (this.inSeg(n)) pr = 3;
        return { n, i, pr };
      })
      .sort((a, b) => a.pr - b.pr || this.nodeScreen[a.i * 3 + 2] - this.nodeScreen[b.i * 3 + 2]);
    for (const { n, i, pr } of order) {
      const L = this.nodeLabels[i];
      if (!show || !this.nodeVisible[i] || pr > 3) {
        L.el.style.display = 'none';
        continue;
      }
      L.el.style.display = 'block';
      if (!L.w) {
        L.w = L.el.offsetWidth;
        L.h = L.el.offsetHeight;
      }
      const x = Math.min(this.nodeScreen[i * 3] + 10, this.width - L.w - 8);
      const y = this.nodeScreen[i * 3 + 1] - L.h / 2;
      const rect: [number, number, number, number] = [x, y, x + L.w, y + L.h];
      if (pr >= 2 && placed.some((p) => !(rect[2] < p[0] || rect[0] > p[2] || rect[3] < p[1] || rect[1] > p[3]))) {
        L.el.style.display = 'none';
        continue;
      }
      placed.push(rect);
      L.el.style.transform = `translate3d(${Math.round(x)}px, ${Math.round(y)}px, 0)`;
      L.el.classList.toggle('is-strong', pr === 0 || (n.kind === 'experience' && n.owner === owner));
      L.el.classList.toggle('is-dim', n.kind === 'experience' && !!owner && n.owner !== owner && pr !== 0);
      L.el.classList.toggle('is-related', pr === 2);
    }

    // Selected node coordinate tag
    const si = this.selected ? nodes.findIndex((n) => n.id === this.selected) : -1;
    if (si >= 0 && this.nodeVisible[si]) {
      const n = nodes[si];
      this.selTag.style.display = 'block';
      this.selTag.style.transform = `translate3d(${Math.round(this.nodeScreen[si * 3] + 10)}px, ${Math.round(this.nodeScreen[si * 3 + 1] + (n.kind === 'experience' ? 40 : 10))}px, 0)`;
      this.selTag.textContent = `X ${fmt(n.position[0])} / Y ${fmt(n.position[1])} / Z ${fmt(n.position[2])}`;
    } else this.selTag.style.display = 'none';

    // Year markers along the street
    this.yearLabels.forEach(({ el, pos }) => {
      this.tmp.copy(pos).project(this.camera);
      if (this.tmp.z > 1 || !show || Math.abs(this.tmp.x) > 1.05) {
        el.style.display = 'none';
        return;
      }
      el.style.display = 'block';
      el.style.transform = `translate3d(${Math.round((this.tmp.x * 0.5 + 0.5) * this.width - 14)}px, ${Math.round((-this.tmp.y * 0.5 + 0.5) * this.height + 4)}px, 0)`;
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
    this.memoryLayer.dispose();
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
}

export { clusters, SEG_INDEX };

function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);
}
