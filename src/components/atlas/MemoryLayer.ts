import * as THREE from 'three';
import { momentAnchor, MOMENT_DEPTH, type AtlasNode } from '@/data/atlas';
import { asset } from '@/lib/asset';

/*
 * Moments: 2D photos lifted into 3D, left where they happened.
 *
 * Each photo is treated as if it were taken by a camera standing at `origin`, looking along
 * `forward`. Every pixel is pushed out along its own ray to an estimated depth, so from the
 * origin the point cloud reproduces the photo exactly, and any other viewpoint reveals depth.
 * A sparse surround extends the scene past the frame edges, like the room around the photo.
 *
 * A moment plays in stages, driven by `stage` (0..4):
 *   0 point cloud at rest in the world
 *   1 depth map on the photo plane (colour)
 *   2 the photo itself
 *   3 the photo lifts into 3D (points travel from the plane out to their depth)
 *   4 lifted, full colour, viewed in 3D
 */

const FOV_H = (52 * Math.PI) / 180;

const VERT = `
attribute vec3 aDir;
attribute float aZ;
attribute vec3 aCol;
attribute float aDepth;
attribute float aSur;
attribute float aSeed;
uniform vec3 uOrigin;
uniform float uLift;
uniform float uPlane;
uniform float uDepthView;
uniform float uColour;
uniform float uFade;
uniform float uSpacing;
uniform float uFocal;
uniform float uActive;
uniform float uDim;
uniform float uTime;
varying vec3 vCol;
varying float vAlpha;

vec3 turbo(float x) {
  x = clamp(x, 0.0, 1.0);
  vec3 c = vec3(0.1357 + x * (4.5974 - x * (42.3277 - x * (130.5887 - x * (150.5666 - x * 58.1375)))),
                0.0914 + x * (2.1856 + x * (4.8052 - x * (14.0195 - x * (4.2109 + x * 2.7747)))),
                0.1067 + x * (12.5925 - x * (60.1097 - x * (109.0745 - x * (88.5066 - x * 26.8183)))));
  return clamp(c, 0.0, 1.0);
}

void main() {
  float lift = smoothstep(0.0, 1.0, uLift);
  float z = mix(uPlane, aZ, lift);
  vec3 p = uOrigin + aDir * z;
  p += (aSeed - 0.5) * 0.04 * lift * vec3(sin(uTime + aSeed * 40.0), cos(uTime * 0.8 + aSeed * 30.0), 0.0);
  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  float dist = max(0.3, -mv.z);
  float l = dot(aCol, vec3(0.299, 0.587, 0.114));
  vec3 grey = vec3(0.55 + l * 0.45);
  vec3 col = mix(grey, aCol, uColour);
  col = mix(col, turbo(1.0 - aDepth), uDepthView * (1.0 - aSur));
  // Surround points are the reconstructed room: white, sparse, only once lifted.
  col = mix(col, vec3(0.86), aSur);
  float surVis = aSur > 0.5 ? lift * 0.85 : 1.0;
  vCol = col;
  vAlpha = uFade * surVis * mix(0.55, 1.0, uActive) * mix(1.0, 0.12, uDim) * clamp(1.6 - dist / 200.0, 0.0, 1.0);
  float world = uSpacing * z;
  gl_PointSize = clamp(world * uFocal / dist * (aSur > 0.5 ? 0.75 : 1.05), 1.0, 9.0);
  gl_Position = projectionMatrix * mv;
}`;

const FRAG = `
varying vec3 vCol;
varying float vAlpha;
void main() {
  vec2 pc = gl_PointCoord - 0.5;
  if (max(abs(pc.x), abs(pc.y)) > 0.5) discard;
  gl_FragColor = vec4(vCol, vAlpha);
}`;

const PLANE_VERT = `
varying vec2 vUv;
void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`;

const PLANE_FRAG = `
uniform sampler2D uPhoto;
uniform sampler2D uDepth;
uniform float uMix;
uniform float uOpacity;
varying vec2 vUv;
void main() {
  vec3 a = texture2D(uDepth, vUv).rgb;
  vec3 b = texture2D(uPhoto, vUv).rgb;
  gl_FragColor = vec4(mix(a, b, uMix), uOpacity);
}`;

interface Moment {
  node: AtlasNode;
  origin: THREE.Vector3;
  forward: THREE.Vector3;
  centre: THREE.Vector3;
  right: THREE.Vector3;
  up: THREE.Vector3;
  planeW: number;
  planeH: number;
  points?: THREE.Points;
  mat?: THREE.ShaderMaterial;
  plane?: THREE.Mesh;
  planeMat?: THREE.ShaderMaterial;
  frame?: THREE.LineSegments;
  ready: boolean;
  // animated values
  lift: number;
  depthView: number;
  colour: number;
  planeOpacity: number;
  planeMix: number;
  active: number;
  dim: number;
  // targets
  t: { lift: number; depthView: number; colour: number; planeOpacity: number; planeMix: number; active: number; dim: number };
}

function blur(src: Float32Array, w: number, h: number, r: number) {
  const tmp = new Float32Array(src.length);
  const out = new Float32Array(src.length);
  for (let y = 0; y < h; y++) {
    let acc = 0;
    for (let k = -r; k <= r; k++) acc += src[y * w + Math.min(w - 1, Math.max(0, k))];
    for (let x = 0; x < w; x++) {
      tmp[y * w + x] = acc / (2 * r + 1);
      acc += src[y * w + Math.min(w - 1, x + r + 1)] - src[y * w + Math.max(0, x - r)];
    }
  }
  for (let x = 0; x < w; x++) {
    let acc = 0;
    for (let k = -r; k <= r; k++) acc += tmp[Math.min(h - 1, Math.max(0, k)) * w + x];
    for (let y = 0; y < h; y++) {
      out[y * w + x] = acc / (2 * r + 1);
      acc += tmp[Math.min(h - 1, y + r + 1) * w + x] - tmp[Math.max(0, y - r) * w + x];
    }
  }
  return out;
}

/** 0..1 nearness (1 = near) estimated from the image itself. Heuristic, not a learned model. */
function estimateDepth(lum: Float32Array, w: number, h: number): Float32Array {
  const coarse = blur(lum, w, h, Math.max(3, Math.round(w / 28)));
  const fine = blur(lum, w, h, 1);
  const detail = new Float32Array(lum.length);
  for (let i = 0; i < lum.length; i++) detail[i] = Math.abs(fine[i] - coarse[i]);
  const det = blur(detail, w, h, Math.max(2, Math.round(w / 40)));
  let maxD = 1e-4;
  for (let i = 0; i < det.length; i++) maxD = Math.max(maxD, det[i]);
  const raw = new Float32Array(lum.length);
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++) {
      const i = y * w + x;
      const down = y / (h - 1); // rows are top-down here: lower in frame = nearer
      const centre = 1 - Math.min(1, Math.abs(x / (w - 1) - 0.5) * 1.7);
      raw[i] = 0.45 * down + 0.3 * (det[i] / maxD) + 0.15 * centre + 0.1 * (1 - coarse[i]);
    }
  const sm = blur(raw, w, h, Math.max(2, Math.round(w / 60)));
  let lo = Infinity;
  let hi = -Infinity;
  for (let i = 0; i < sm.length; i++) {
    lo = Math.min(lo, sm[i]);
    hi = Math.max(hi, sm[i]);
  }
  for (let i = 0; i < sm.length; i++) sm[i] = (sm[i] - lo) / Math.max(1e-4, hi - lo);
  return sm;
}

function turboRGB(x: number): [number, number, number] {
  x = Math.min(1, Math.max(0, x));
  const r = 0.1357 + x * (4.5974 - x * (42.3277 - x * (130.5887 - x * (150.5666 - x * 58.1375))));
  const g = 0.0914 + x * (2.1856 + x * (4.8052 - x * (14.0195 - x * (4.2109 + x * 2.7747))));
  const b = 0.1067 + x * (12.5925 - x * (60.1097 - x * (109.0745 - x * (88.5066 - x * 26.8183))));
  return [Math.min(1, Math.max(0, r)), Math.min(1, Math.max(0, g)), Math.min(1, Math.max(0, b))];
}

export class MemoryLayer {
  private items: Moment[] = [];
  private disposed = false;

  constructor(private scene: THREE.Scene, nodes: AtlasNode[], private pixel: number, private lowPower: boolean) {
    nodes
      .filter((n) => n.memory && momentAnchor(n.id))
      .forEach((n) => {
        const a = momentAnchor(n.id)!;
        const origin = new THREE.Vector3(...a.origin);
        const forward = new THREE.Vector3(...a.forward).normalize();
        const right = new THREE.Vector3().crossVectors(forward, new THREE.Vector3(0, 1, 0)).normalize();
        const up = new THREE.Vector3().crossVectors(right, forward).normalize();
        const m = n.memory!;
        const planeW = 2 * MOMENT_DEPTH * Math.tan(FOV_H / 2);
        const planeH = planeW * (m.height / m.width);
        const it: Moment = {
          node: n,
          origin,
          forward,
          right,
          up,
          centre: origin.clone().add(forward.clone().multiplyScalar(MOMENT_DEPTH)),
          planeW,
          planeH,
          ready: false,
          lift: 1,
          depthView: 0,
          colour: 0,
          planeOpacity: 0,
          planeMix: 1,
          active: 0,
          dim: 0,
          t: { lift: 1, depthView: 0, colour: 0, planeOpacity: 0, planeMix: 1, active: 0, dim: 0 },
        };
        this.items.push(it);
        this.load(it);
      });
  }

  /** Where the camera stands to see the photo exactly, and where it looks. */
  view(id: string) {
    const it = this.items.find((x) => x.node.id === id);
    if (!it) return null;
    return { origin: it.origin.clone(), centre: it.centre.clone(), forward: it.forward.clone(), right: it.right.clone(), up: it.up.clone(), planeW: it.planeW, planeH: it.planeH };
  }

  has(id: string) {
    return this.items.some((x) => x.node.id === id);
  }

  private async load(it: Moment) {
    const m = it.node.memory!;
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
    const cols = this.lowPower ? 110 : 200;
    const rows = Math.max(10, Math.round(cols / aspect));
    const c = document.createElement('canvas');
    c.width = cols;
    c.height = rows;
    const ctx = c.getContext('2d', { willReadFrequently: true })!;
    ctx.drawImage(img, 0, 0, cols, rows);
    const data = ctx.getImageData(0, 0, cols, rows).data;
    const lum = new Float32Array(cols * rows);
    for (let i = 0; i < cols * rows; i++) lum[i] = (0.299 * data[i * 4] + 0.587 * data[i * 4 + 1] + 0.114 * data[i * 4 + 2]) / 255;
    const depth = estimateDepth(lum, cols, rows);
    // Screens and documents are flat: many near-white or uniform pixels mean shallow relief.
    let bright = 0;
    for (let i = 0; i < lum.length; i++) if (lum[i] > 0.86) bright++;
    const flat = bright / lum.length > 0.3;
    const relief = flat ? 0.28 : 1;

    const tanH = Math.tan(FOV_H / 2);
    const tanV = tanH / aspect;
    const near = MOMENT_DEPTH * (1 - 0.3 * relief);
    const far = MOMENT_DEPTH * (1 + 1.6 * relief);
    const dirs: number[] = [];
    const zs: number[] = [];
    const cols3: number[] = [];
    const depths: number[] = [];
    const sur: number[] = [];
    const seeds: number[] = [];
    const ray = (u: number, v: number) => {
      // u, v in [0, 1] across the frame (v top-down); rays pass through the photo plane.
      const d = it.forward
        .clone()
        .addScaledVector(it.right, (u - 0.5) * 2 * tanH)
        .addScaledVector(it.up, (0.5 - v) * 2 * tanV);
      // Normalise so that z is distance along forward: position = origin + d * z.
      return d;
    };
    for (let y = 0; y < rows; y++)
      for (let x = 0; x < cols; x++) {
        const i = y * cols + x;
        const d = ray((x + 0.5) / cols, (y + 0.5) / rows);
        dirs.push(d.x, d.y, d.z);
        zs.push(far - depth[i] * (far - near));
        cols3.push(data[i * 4] / 255, data[i * 4 + 1] / 255, data[i * 4 + 2] / 255);
        depths.push(depth[i]);
        sur.push(0);
        seeds.push(Math.random());
      }
    // Surround: the room beyond the frame. Sample edge pixels outward, sparse, mostly far.
    const surround = this.lowPower ? 4000 : 12000;
    for (let k = 0; k < surround; k++) {
      let u = -0.7 + Math.random() * 2.4;
      let v = -0.6 + Math.random() * 2.2;
      if (u > 0 && u < 1 && v > 0 && v < 1) {
        if (Math.random() < 0.5) u = u < 0.5 ? -Math.random() * 0.7 : 1 + Math.random() * 0.7;
        else v = v < 0.5 ? -Math.random() * 0.6 : 1 + Math.random() * 0.6;
      }
      const ex = Math.min(cols - 1, Math.max(0, Math.round(Math.min(1, Math.max(0, u)) * (cols - 1))));
      const ey = Math.min(rows - 1, Math.max(0, Math.round(Math.min(1, Math.max(0, v)) * (rows - 1))));
      const ed = depth[ey * cols + ex];
      const out = Math.max(Math.max(0, -u), Math.max(0, u - 1), Math.max(0, -v), Math.max(0, v - 1));
      // Floor and walls: points below the frame stay near, points to the sides recede.
      const z = far - ed * (far - near) * Math.max(0.2, 1 - out) + out * MOMENT_DEPTH * (v > 1 ? -0.4 : 0.8);
      const d = ray(u, v);
      dirs.push(d.x, d.y, d.z);
      zs.push(Math.max(near * 0.6, z + (Math.random() - 0.5) * 1.5));
      cols3.push(0.85, 0.85, 0.85);
      depths.push(ed);
      sur.push(1);
      seeds.push(Math.random());
    }

    const geo = new THREE.BufferGeometry();
    const count = zs.length;
    geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(count * 3), 3));
    geo.setAttribute('aDir', new THREE.Float32BufferAttribute(dirs, 3));
    geo.setAttribute('aZ', new THREE.Float32BufferAttribute(zs, 1));
    geo.setAttribute('aCol', new THREE.Float32BufferAttribute(cols3, 3));
    geo.setAttribute('aDepth', new THREE.Float32BufferAttribute(depths, 1));
    geo.setAttribute('aSur', new THREE.Float32BufferAttribute(sur, 1));
    geo.setAttribute('aSeed', new THREE.Float32BufferAttribute(seeds, 1));
    geo.boundingSphere = new THREE.Sphere(it.centre.clone(), far * 2);
    const mat = new THREE.ShaderMaterial({
      vertexShader: VERT,
      fragmentShader: FRAG,
      transparent: true,
      depthWrite: false,
      uniforms: {
        uOrigin: { value: it.origin },
        uLift: { value: 1 },
        uPlane: { value: MOMENT_DEPTH },
        uDepthView: { value: 0 },
        uColour: { value: 0 },
        uFade: { value: 0 },
        uSpacing: { value: (2 * tanH) / cols },
        uFocal: { value: 900 },
        uActive: { value: 0 },
        uDim: { value: 0 },
        uTime: { value: 0 },
      },
    });
    const pts = new THREE.Points(geo, mat);
    pts.frustumCulled = false;
    pts.renderOrder = 3;
    this.scene.add(pts);

    // Photo plane with a matching depth-map texture, for the depth and photo stages.
    const dc = document.createElement('canvas');
    dc.width = cols;
    dc.height = rows;
    const dctx = dc.getContext('2d')!;
    const dimg = dctx.createImageData(cols, rows);
    for (let i = 0; i < cols * rows; i++) {
      const [r, g, b] = turboRGB(1 - depth[i]);
      dimg.data[i * 4] = r * 255;
      dimg.data[i * 4 + 1] = g * 255;
      dimg.data[i * 4 + 2] = b * 255;
      dimg.data[i * 4 + 3] = 255;
    }
    dctx.putImageData(dimg, 0, 0);
    const depthTex = new THREE.CanvasTexture(dc);
    depthTex.colorSpace = THREE.SRGBColorSpace;
    depthTex.minFilter = THREE.LinearFilter;
    const photoTex = new THREE.Texture(img);
    photoTex.colorSpace = THREE.SRGBColorSpace;
    photoTex.needsUpdate = true;
    const planeMat = new THREE.ShaderMaterial({
      vertexShader: PLANE_VERT,
      fragmentShader: PLANE_FRAG,
      transparent: true,
      depthWrite: false,
      side: THREE.DoubleSide,
      uniforms: { uPhoto: { value: photoTex }, uDepth: { value: depthTex }, uMix: { value: 1 }, uOpacity: { value: 0 } },
    });
    const plane = new THREE.Mesh(new THREE.PlaneGeometry(it.planeW, it.planeH), planeMat);
    plane.position.copy(it.centre);
    plane.lookAt(it.origin);
    plane.renderOrder = 4;
    this.scene.add(plane);

    const frame = new THREE.LineSegments(
      new THREE.EdgesGeometry(new THREE.PlaneGeometry(it.planeW + 0.15, it.planeH + 0.15)),
      new THREE.LineBasicMaterial({ color: 0xf1f0ec, transparent: true, opacity: 0, depthWrite: false }),
    );
    frame.position.copy(it.centre);
    frame.lookAt(it.origin);
    this.scene.add(frame);

    Object.assign(it, { points: pts, mat, plane, planeMat, frame, ready: true });
  }

  /** Puts one moment on stage (0..4); every other moment returns to rest. `null` rests them all. */
  stage(id: string | null, stage: number) {
    this.items.forEach((it) => {
      const on = it.node.id === id;
      const s = on ? stage : 0;
      it.t.active = on ? 1 : 0;
      it.t.dim = id && !on ? 1 : 0;
      it.t.lift = s === 1 || s === 2 ? 0 : 1;
      it.t.depthView = s === 1 ? 1 : 0;
      it.t.planeOpacity = s === 1 || s === 2 ? 1 : 0;
      it.t.planeMix = s === 1 ? 0 : 1;
      it.t.colour = on && s >= 2 ? 1 : 0;
      if (on && s === 1) {
        it.planeMix = 0;
        it.lift = 0;
      }
    });
  }

  /** Highlights moments without playing them (role in focus, hover). */
  setLifted(ids: Set<string>) {
    this.items.forEach((it) => {
      if (it.t.planeOpacity > 0 || it.t.lift < 1) return;
      it.t.active = ids.has(it.node.id) ? 0.6 : 0;
    });
  }

  update(dt: number, assemble: number, reduced: boolean, focal: number, time: number) {
    const k = reduced ? 1 : Math.min(1, dt * 2.4);
    const kl = reduced ? 1 : Math.min(1, dt * 1.3);
    const fade = Math.max(0, (assemble - 0.6) / 0.4);
    this.items.forEach((it) => {
      if (!it.ready) return;
      it.lift += (it.t.lift - it.lift) * (it.t.lift > it.lift ? kl : k * 2);
      it.depthView += (it.t.depthView - it.depthView) * k;
      it.colour += (it.t.colour - it.colour) * k;
      it.planeOpacity += (it.t.planeOpacity - it.planeOpacity) * Math.min(1, k * 3);
      it.planeMix += (it.t.planeMix - it.planeMix) * Math.min(1, k * 2.5);
      it.active += (it.t.active - it.active) * k;
      it.dim += (it.t.dim - it.dim) * k;
      const u = it.mat!.uniforms;
      u.uLift.value = it.lift;
      u.uDepthView.value = it.depthView;
      u.uColour.value = it.colour;
      u.uFade.value = fade * (1 - it.planeOpacity);
      u.uFocal.value = focal;
      u.uActive.value = it.active;
      u.uDim.value = it.dim;
      u.uTime.value = time;
      it.planeMat!.uniforms.uOpacity.value = fade * it.planeOpacity;
      it.planeMat!.uniforms.uMix.value = it.planeMix;
      (it.frame!.material as THREE.LineBasicMaterial).opacity = fade * (0.12 + 0.5 * it.active) * (1 - it.lift * 0.6);
    });
  }

  dispose() {
    this.disposed = true;
    this.items.forEach((it) => {
      it.points?.geometry.dispose();
      it.mat?.dispose();
      it.plane?.geometry.dispose();
      (it.planeMat?.uniforms.uPhoto.value as THREE.Texture | undefined)?.dispose();
      (it.planeMat?.uniforms.uDepth.value as THREE.Texture | undefined)?.dispose();
      it.planeMat?.dispose();
      it.frame?.geometry.dispose();
      (it.frame?.material as THREE.Material | undefined)?.dispose();
      if (it.points) this.scene.remove(it.points);
      if (it.plane) this.scene.remove(it.plane);
      if (it.frame) this.scene.remove(it.frame);
    });
  }
}
