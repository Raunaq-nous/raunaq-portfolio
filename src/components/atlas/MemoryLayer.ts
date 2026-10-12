import * as THREE from 'three';
import type { AtlasNode } from '@/data/atlas';
import { asset } from '@/lib/asset';

/*
 * Memories: 2D photos lifted into 3D, left where they happened.
 *
 * Each photo is sampled into a grid of points. Depth is estimated in the browser from the image
 * itself (smoothed luminance, local structure and a vertical prior), so any new photo works
 * without a build step. A memory moves through three states as `lift` goes 0 -> 1:
 *   flat photo -> depth map (points shaded by depth) -> point cloud (points pushed out by depth).
 */

const VERT = `
attribute vec2 aUv;
attribute float aLum;
attribute float aDepth;
attribute float aSeed;
uniform float uLift;
uniform float uDepthAmount;
uniform float uPixel;
uniform float uTime;
uniform float uFade;
uniform vec2 uSize;
uniform float uSpacing;
uniform float uFocal;
varying float vShade;
varying float vAlpha;
void main() {
  float lift = smoothstep(0.0, 1.0, uLift);
  vec3 p = vec3((aUv.x - 0.5) * uSize.x, (aUv.y - 0.5) * uSize.y, 0.0);
  float push = aDepth * uDepthAmount * lift;
  p.z += push + (aSeed - 0.5) * 0.15 * lift;
  p.xy *= 1.0 + push * 0.012;
  p.x += sin(uTime * 0.6 + aSeed * 6.28) * 0.02 * lift;
  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  // Mid-transition the points read as a depth map, then return to the photo's own tones.
  float depthView = pow(sin(3.14159 * clamp(uLift, 0.0, 1.0)), 2.0);
  vShade = mix(aLum, 0.15 + aDepth * 0.85, depthView * 0.85);
  float dist = max(0.5, -mv.z);
  // Thin out near-white background as it lifts so the content, not the paper, comes forward.
  float bg = smoothstep(0.82, 0.97, aLum) * step(0.22, aSeed) * lift;
  vAlpha = uFade * (0.45 + 0.55 * lift) * (1.0 - bg) * clamp(1.6 - dist / 190.0, 0.0, 1.0);
  gl_PointSize = clamp(uSpacing * uFocal / dist * (0.95 - 0.35 * lift), 1.0, 4.0 * uPixel);
  gl_Position = projectionMatrix * mv;
}`;

const FRAG = `
varying float vShade;
varying float vAlpha;
void main() {
  vec2 pc = gl_PointCoord - 0.5;
  if (max(abs(pc.x), abs(pc.y)) > 0.45) discard;
  gl_FragColor = vec4(vec3(vShade), vAlpha);
}`;

const PLANE_FRAG = `
uniform sampler2D uMap;
uniform float uOpacity;
varying vec2 vUv;
void main() {
  vec3 c = texture2D(uMap, vUv).rgb;
  float l = dot(c, vec3(0.299, 0.587, 0.114));
  gl_FragColor = vec4(vec3(l), uOpacity);
}`;

const PLANE_VERT = `
varying vec2 vUv;
void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`;

interface MemoryItem {
  node: AtlasNode;
  group: THREE.Group;
  points?: THREE.Points;
  pointsMat?: THREE.ShaderMaterial;
  plane?: THREE.Mesh;
  planeMat?: THREE.ShaderMaterial;
  frame?: THREE.LineSegments;
  lift: number;
  target: number;
  ready: boolean;
}

export const MEMORY_HEIGHT = 5.2;

/** Estimates a 0..1 depth field (1 = near) from image pixels. Heuristic, not a learned model. */
function estimateDepth(lum: Float32Array, w: number, h: number): Float32Array {
  const blur = (src: Float32Array, r: number) => {
    const tmp = new Float32Array(src.length);
    const out = new Float32Array(src.length);
    for (let y = 0; y < h; y++)
      for (let x = 0; x < w; x++) {
        let a = 0;
        let n = 0;
        for (let k = -r; k <= r; k++) {
          const xx = Math.min(w - 1, Math.max(0, x + k));
          a += src[y * w + xx];
          n++;
        }
        tmp[y * w + x] = a / n;
      }
    for (let y = 0; y < h; y++)
      for (let x = 0; x < w; x++) {
        let a = 0;
        let n = 0;
        for (let k = -r; k <= r; k++) {
          const yy = Math.min(h - 1, Math.max(0, y + k));
          a += tmp[yy * w + x];
          n++;
        }
        out[y * w + x] = a / n;
      }
    return out;
  };
  const coarse = blur(lum, 6);
  const fine = blur(lum, 1);
  // Local structure: textured and contrasting regions tend to be subjects in front.
  const detail = new Float32Array(lum.length);
  for (let i = 0; i < lum.length; i++) detail[i] = Math.abs(fine[i] - coarse[i]);
  const detailB = blur(detail, 4);
  let maxD = 1e-4;
  detailB.forEach((v) => (maxD = Math.max(maxD, v)));
  const depth = new Float32Array(lum.length);
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++) {
      const i = y * w + x;
      const v = 1 - y / (h - 1); // texture rows run bottom-up
      const vertical = 1 - v; // lower in the frame is nearer
      const centre = 1 - Math.min(1, Math.abs(x / (w - 1) - 0.5) * 1.6);
      const d = 0.4 * vertical + 0.35 * (detailB[i] / maxD) + 0.15 * centre + 0.1 * (1 - coarse[i]);
      depth[i] = d;
    }
  const sm = blur(depth, 2);
  let lo = Infinity;
  let hi = -Infinity;
  sm.forEach((v) => {
    lo = Math.min(lo, v);
    hi = Math.max(hi, v);
  });
  for (let i = 0; i < sm.length; i++) sm[i] = (sm[i] - lo) / Math.max(1e-4, hi - lo);
  return sm;
}

export class MemoryLayer {
  private items: MemoryItem[] = [];
  private pixel: number;
  private lowPower: boolean;
  private disposed = false;

  constructor(private scene: THREE.Scene, nodes: AtlasNode[], pixel: number, lowPower: boolean) {
    this.pixel = pixel;
    this.lowPower = lowPower;
    nodes
      .filter((n) => n.memory)
      .forEach((n) => {
        const group = new THREE.Group();
        group.position.set(...n.position);
        // Face the street (the X axis): photos on the -Z side look towards +Z and vice versa.
        group.rotation.y = n.position[2] > 0 ? Math.PI : 0;
        scene.add(group);
        const item: MemoryItem = { node: n, group, lift: 0, target: 0, ready: false };
        this.items.push(item);
        this.load(item);
      });
  }

  private async load(item: MemoryItem) {
    const m = item.node.memory!;
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = asset(m.src);
    try {
      await img.decode();
    } catch {
      return;
    }
    if (this.disposed) return;
    const aspect = img.naturalWidth / img.naturalHeight;
    const H = MEMORY_HEIGHT;
    const W = H * aspect;

    // Sample the grid.
    const cols = this.lowPower ? 90 : 170;
    const rows = Math.max(8, Math.round(cols / aspect));
    const c = document.createElement('canvas');
    c.width = cols;
    c.height = rows;
    const ctx = c.getContext('2d', { willReadFrequently: true })!;
    ctx.drawImage(img, 0, 0, cols, rows);
    const data = ctx.getImageData(0, 0, cols, rows).data;
    const lum = new Float32Array(cols * rows);
    // Store rows bottom-up so v increases upwards.
    for (let y = 0; y < rows; y++)
      for (let x = 0; x < cols; x++) {
        const src = ((rows - 1 - y) * cols + x) * 4;
        lum[y * cols + x] = (0.299 * data[src] + 0.587 * data[src + 1] + 0.114 * data[src + 2]) / 255;
      }
    const depth = estimateDepth(lum, cols, rows);

    const n = cols * rows;
    const uv = new Float32Array(n * 2);
    const seed = new Float32Array(n);
    for (let y = 0; y < rows; y++)
      for (let x = 0; x < cols; x++) {
        const i = y * cols + x;
        uv[i * 2] = (x + 0.5) / cols;
        uv[i * 2 + 1] = (y + 0.5) / rows;
        seed[i] = Math.random();
      }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(n * 3), 3));
    geo.setAttribute('aUv', new THREE.BufferAttribute(uv, 2));
    geo.setAttribute('aLum', new THREE.BufferAttribute(lum, 1));
    geo.setAttribute('aDepth', new THREE.BufferAttribute(depth, 1));
    geo.setAttribute('aSeed', new THREE.BufferAttribute(seed, 1));
    geo.boundingSphere = new THREE.Sphere(new THREE.Vector3(), Math.max(W, H) * 2);
    const mat = new THREE.ShaderMaterial({
      vertexShader: VERT,
      fragmentShader: FRAG,
      transparent: true,
      depthWrite: false,
      uniforms: {
        uLift: { value: 0 },
        uDepthAmount: { value: H * 0.9 },
        uPixel: { value: this.pixel },
        uTime: { value: 0 },
        uFade: { value: 0 },
        uSize: { value: new THREE.Vector2(W, H) },
        uSpacing: { value: W / cols },
        uFocal: { value: 900 },
      },
    });
    const pts = new THREE.Points(geo, mat);
    pts.renderOrder = 3;
    item.group.add(pts);

    const tex = new THREE.Texture(img);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.needsUpdate = true;
    const planeMat = new THREE.ShaderMaterial({
      vertexShader: PLANE_VERT,
      fragmentShader: PLANE_FRAG,
      transparent: true,
      depthWrite: false,
      side: THREE.DoubleSide,
      uniforms: { uMap: { value: tex }, uOpacity: { value: 0 } },
    });
    const plane = new THREE.Mesh(new THREE.PlaneGeometry(W, H), planeMat);
    plane.renderOrder = 2;
    item.group.add(plane);

    const frame = new THREE.LineSegments(
      new THREE.EdgesGeometry(new THREE.PlaneGeometry(W + 0.3, H + 0.3)),
      new THREE.LineBasicMaterial({ color: 0xf1f0ec, transparent: true, opacity: 0.35, depthWrite: false }),
    );
    item.group.add(frame);

    Object.assign(item, { points: pts, pointsMat: mat, plane, planeMat, frame, ready: true });
  }

  /** Sets which memories should be lifted. */
  setLifted(ids: Set<string>) {
    this.items.forEach((it) => (it.target = ids.has(it.node.id) ? 1 : 0));
  }

  update(dt: number, assemble: number, reduced: boolean, focal = 900) {
    const speed = reduced ? 10 : 0.55;
    this.items.forEach((it) => {
      if (!it.ready) return;
      const d = it.target - it.lift;
      it.lift += Math.sign(d) * Math.min(Math.abs(d), dt * speed * (it.target > it.lift ? 1 : 1.6));
      const fade = Math.max(0, (assemble - 0.6) / 0.4);
      const u = it.pointsMat!.uniforms;
      u.uLift.value = it.lift;
      u.uTime.value += dt;
      u.uFade.value = fade;
      u.uFocal.value = focal;
      // The flat photo is visible at rest and dissolves into points as it lifts.
      it.planeMat!.uniforms.uOpacity.value = fade * Math.max(0, 1 - it.lift * 2.2) * 0.92;
      (it.frame!.material as THREE.LineBasicMaterial).opacity = fade * (0.18 + 0.3 * (1 - it.lift));
    });
  }

  dispose() {
    this.disposed = true;
    this.items.forEach((it) => {
      it.points?.geometry.dispose();
      it.pointsMat?.dispose();
      it.plane?.geometry.dispose();
      (it.planeMat?.uniforms.uMap.value as THREE.Texture | undefined)?.dispose();
      it.planeMat?.dispose();
      it.frame?.geometry.dispose();
      (it.frame?.material as THREE.Material | undefined)?.dispose();
      this.scene.remove(it.group);
    });
  }
}
