'use client';

import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import type { AtlasNode, ModelShape } from '@/data/atlas';

function buildObject(shape: ModelShape): THREE.Object3D {
  const group = new THREE.Group();
  const solid = new THREE.MeshStandardMaterial({ color: 0x9a9893, metalness: 0.35, roughness: 0.45, flatShading: true });
  const wire = new THREE.LineBasicMaterial({ color: 0xf1f0ec, transparent: true, opacity: 0.35 });

  if (shape === 'lattice') {
    const box = new THREE.BoxGeometry(0.34, 0.34, 0.34);
    const n = 5;
    const inst = new THREE.InstancedMesh(box, solid, n * n * n);
    const m = new THREE.Matrix4();
    let i = 0;
    for (let x = 0; x < n; x++)
      for (let y = 0; y < n; y++)
        for (let z = 0; z < n; z++) {
          const keep = (x + y + z) % 2 === 0 || x === 2 || z === 2;
          m.makeScale(keep ? 1 : 0.0001, keep ? 1 : 0.0001, keep ? 1 : 0.0001);
          m.setPosition((x - 2) * 0.55, (y - 2) * 0.55, (z - 2) * 0.55);
          inst.setMatrixAt(i++, m);
        }
    group.add(inst);
    group.add(new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(2.9, 2.9, 2.9)), wire));
    return group;
  }

  const geo = shape === 'torusknot' ? new THREE.TorusKnotGeometry(1, 0.32, 160, 18) : new THREE.IcosahedronGeometry(1.5, 1);
  group.add(new THREE.Mesh(geo, solid));
  group.add(new THREE.LineSegments(new THREE.EdgesGeometry(geo, 20), wire));
  return group;
}

const VIEWS: Record<string, [number, number, number]> = {
  Front: [0, 0, 6],
  Side: [6, 0, 0],
  Top: [0, 6, 0.01],
};

/** Minimal interactive object viewer for Visual Archive nodes. */
export default function ModelViewer({ node, onClose }: { node: AtlasNode; onClose: () => void }) {
  const mount = useRef<HTMLDivElement>(null);
  const api = useRef<{ setLight: (i: number, a: number) => void; view: (p: [number, number, number]) => void } | null>(null);
  const [intensity, setIntensity] = useState(1.6);
  const [angle, setAngle] = useState(45);
  const [ok, setOk] = useState(true);

  useEffect(() => {
    const el = mount.current;
    if (!el || !node.model) return;
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true });
    } catch {
      setOk(false);
      return;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setClearColor(0x090909, 1);
    el.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
    camera.position.set(4, 2.4, 5);
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.minDistance = 3;
    controls.maxDistance = 14;
    controls.enablePan = false;

    scene.add(new THREE.AmbientLight(0xffffff, 0.35));
    const key = new THREE.DirectionalLight(0xffffff, 1.6);
    scene.add(key);
    const rim = new THREE.DirectionalLight(0xffffff, 0.4);
    rim.position.set(-4, -2, -3);
    scene.add(rim);
    const grid = new THREE.GridHelper(8, 16, 0x3a3936, 0x1e1e1d);
    grid.position.y = -2.2;
    scene.add(grid);

    const obj = buildObject(node.model);
    scene.add(obj);

    const setLight = (i: number, a: number) => {
      key.intensity = i;
      const r = (a * Math.PI) / 180;
      key.position.set(Math.cos(r) * 5, 4, Math.sin(r) * 5);
    };
    setLight(1.6, 45);

    let tween: { from: THREE.Vector3; to: THREE.Vector3; t0: number } | null = null;
    api.current = {
      setLight,
      view: (p) => {
        tween = { from: camera.position.clone(), to: new THREE.Vector3(...p), t0: performance.now() };
      },
    };

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const resize = () => {
      const r = el.getBoundingClientRect();
      renderer.setSize(r.width, r.height);
      camera.aspect = r.width / Math.max(1, r.height);
      camera.updateProjectionMatrix();
    };
    resize();
    window.addEventListener('resize', resize);

    let raf = 0;
    const loop = () => {
      raf = requestAnimationFrame(loop);
      if (tween) {
        const t = Math.min(1, (performance.now() - tween.t0) / (reduced ? 1 : 700));
        camera.position.lerpVectors(tween.from, tween.to, 1 - Math.pow(1 - t, 3));
        if (t >= 1) tween = null;
      }
      if (!reduced) obj.rotation.y += 0.0018;
      controls.update();
      renderer.render(scene, camera);
    };
    loop();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      controls.dispose();
      scene.traverse((o) => {
        const m = o as THREE.Mesh;
        m.geometry?.dispose?.();
        (m.material as THREE.Material | undefined)?.dispose?.();
      });
      renderer.dispose();
      renderer.domElement.remove();
      api.current = null;
    };
  }, [node]);

  useEffect(() => {
    api.current?.setLight(intensity, angle);
  }, [intensity, angle]);

  return (
    <div className="fixed inset-0 z-[70] flex flex-col bg-ink" role="dialog" aria-modal="true" aria-label={`Object viewer: ${node.title}`}>
      <div className="wrap flex h-14 items-center justify-between border-b rule">
        <p className="label text-grey-1">
          {node.code} / {node.title}
        </p>
        <button type="button" className="label link-quiet text-paper" onClick={onClose}>
          Return to the Palace
        </button>
      </div>
      <div ref={mount} className="relative flex-1 cursor-grab active:cursor-grabbing">
        {!ok && <p className="label absolute inset-0 grid place-items-center text-grey-2">WebGL is unavailable on this device.</p>}
        <span className="label pointer-events-none absolute left-[var(--gutter)] top-4 text-grey-3">Drag to rotate / scroll to zoom</span>
        {node.placeholder && <span className="label pointer-events-none absolute right-[var(--gutter)] top-4 text-grey-3">Placeholder geometry</span>}
      </div>
      <div className="wrap grid gap-6 border-t rule py-5 md:grid-cols-3">
        <div className="flex gap-4">
          {Object.entries(VIEWS).map(([k, p]) => (
            <button key={k} type="button" className="label link-quiet text-grey-1 hover:text-paper" onClick={() => api.current?.view(p)}>
              {k}
            </button>
          ))}
        </div>
        <label className="label flex items-center gap-3 text-grey-2">
          Light
          <input type="range" min={0} max={3} step={0.1} value={intensity} onChange={(e) => setIntensity(+e.target.value)} className="w-full accent-[#f1f0ec]" />
        </label>
        <label className="label flex items-center gap-3 text-grey-2">
          Angle
          <input type="range" min={0} max={360} step={1} value={angle} onChange={(e) => setAngle(+e.target.value)} className="w-full accent-[#f1f0ec]" />
        </label>
      </div>
    </div>
  );
}
