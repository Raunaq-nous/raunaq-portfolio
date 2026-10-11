'use client';

import { useEffect, useRef, useState } from 'react';
import { asset } from '@/lib/asset';
import { drawPlaceholder, type PlaceholderSpec } from '@/lib/placeholder';
import { useReducedMotion } from '@/lib/motion';

/*
 * PixelImage: the site's shared image system.
 *
 * mode="distort": the image is clean; the pointer fragments it locally (hero portrait).
 * mode="reveal":  the image is fragmented; the pointer reconstructs it locally (project media).
 *
 * A low-resolution distortion field lives on the CPU. The pointer stamps into it, it decays
 * over time, and the fragment shader turns it into irregular rectangular blocks, staggered
 * fragments, horizontal scanline displacement and monochrome noise. Per-block thresholds make
 * reconstruction uneven rather than a circular spotlight.
 */

const VERT = `
attribute vec2 aPos;
varying vec2 vUv;
void main() {
  vUv = aPos * 0.5 + 0.5;
  gl_Position = vec4(aPos, 0.0, 1.0);
}`;

const FRAG = `
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif
varying vec2 vUv;
uniform sampler2D uTex;
uniform sampler2D uField;
uniform vec2 uRes;
uniform vec2 uScale;
uniform vec2 uOffset;
uniform float uTime;
uniform float uMode;
uniform float uMono;
uniform float uDpr;

float h21(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

vec3 samp(vec2 uv) {
  vec2 t = (uv - 0.5) * uScale + 0.5 + uOffset;
  t = clamp(t, vec2(0.001), vec2(0.999));
  return texture2D(uTex, t).rgb;
}

float fieldAt(vec2 uv) {
  float f = smoothstep(0.02, 0.72, texture2D(uField, vec2(uv.x, 1.0 - uv.y)).r);
  return mix(f, 1.0 - f, uMode);
}

void main() {
  float u = uDpr;
  vec2 px = vUv * uRes;
  float d = fieldAt(vUv);

  if (d < 0.004) {
    vec3 c = samp(vUv);
    float l = dot(c, vec3(0.299, 0.587, 0.114));
    gl_FragColor = vec4(mix(c, vec3(l), uMono), 1.0);
    return;
  }

  float tick = floor(uTime * 7.0);

  // Region-level block shapes keep the grid irregular: wide strips, squares, thin slivers.
  vec2 region = floor(px / (96.0 * u));
  float rh = h21(region + 3.1);
  vec2 bs = rh < 0.34 ? vec2(48.0, 12.0) : (rh < 0.67 ? vec2(24.0, 24.0) : vec2(96.0, 6.0));
  bs *= u;
  vec2 bid = floor(px / bs);
  vec2 bo = bid * bs;
  vec2 bc = bo + 0.5 * bs;
  float db = fieldAt(bc / uRes);

  float th = h21(bid + region * 7.0);
  float big = step(th * 0.85 + 0.1, db);

  vec2 sbs = max(bs * 0.25, vec2(3.0 * u));
  vec2 sid = floor(px / sbs);
  float small = (1.0 - big) * step(h21(sid + 11.0) * 0.7 + 0.22, d);

  vec2 q = px;
  if (big > 0.5) {
    q = bc;
    float sh = h21(bid + vec2(tick * 0.13, 2.0));
    if (sh > 0.6) q.x += (floor(sh * 7.0) - 3.5) * bs.x * 0.6 * db;
    if (sh < 0.16) q.y += bs.y * (sh < 0.08 ? 1.0 : -1.0);
    // Vertical striation: repeat a narrow slice across the fragment.
    if (rh > 0.67 || h21(bid + 5.0) > 0.72) {
      float sw = 3.0 * u;
      q = vec2(bo.x + floor((px.x - bo.x) / sw) * sw * 0.22 + (q.x - bc.x), px.y + (q.y - bc.y));
    }
  } else if (small > 0.5) {
    q = (sid + 0.5) * sbs;
  }

  // Horizontal scanline displacement.
  float band = floor(px.y / (7.0 * u));
  float bh = h21(vec2(band, tick + 1.0));
  q.x += step(0.84, bh) * step(0.12, d) * (bh - 0.92) * 220.0 * u * d * d;

  vec3 c = samp(q / uRes);
  float l = dot(c, vec3(0.299, 0.587, 0.114));
  c = mix(c, vec3(l), clamp(uMono + d * 0.85, 0.0, 1.0));
  c += big * (h21(bid + 9.0) - 0.5) * 0.16 * db;
  c *= 1.0 - big * step(0.94, h21(bid + 13.0)) * 0.85;
  c *= 1.0 - 0.12 * d * step(0.5, fract(px.y / (3.0 * u)));
  c += (h21(px + fract(uTime) * 91.0) - 0.5) * 0.09 * d;
  gl_FragColor = vec4(clamp(c, 0.0, 1.0), 1.0);
}`;

export type Annotate = 'hero' | 'project' | 'none';

export interface PixelImageProps {
  /** Path relative to /public. Omit to render a labelled placeholder. */
  src?: string;
  placeholder?: PlaceholderSpec;
  alt: string;
  mode: 'distort' | 'reveal';
  focus?: [number, number];
  /** 0 keeps original colour, 1 renders fully monochrome. */
  monochrome?: number;
  annotate?: Annotate;
  fieldLabel?: string;
  /** Natural pixel size of the source, used for coordinate readouts. */
  naturalSize?: [number, number];
  /** Forces full reconstruction (used for tap-to-reveal on touch devices). */
  revealed?: boolean;
  className?: string;
  priority?: boolean;
}

interface Pointer {
  x: number;
  y: number;
  inside: boolean;
  speed: number;
  hold: boolean;
}

export default function PixelImage({
  src,
  placeholder,
  alt,
  mode,
  focus = [0.5, 0.5],
  monochrome = 0,
  annotate = 'none',
  fieldLabel,
  naturalSize,
  revealed = false,
  className = '',
  priority = false,
}: PixelImageProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const crossRef = useRef<HTMLDivElement>(null);
  const readoutRef = useRef<HTMLDivElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  const boxLabelRef = useRef<HTMLSpanElement>(null);
  const measureRef = useRef<HTMLDivElement>(null);
  const measureLabelRef = useRef<HTMLSpanElement>(null);
  const revealedRef = useRef(revealed);
  const wakeRef = useRef<() => void>(() => {});
  const reduced = useReducedMotion();

  const [glReady, setGlReady] = useState(false);
  const [fallback, setFallback] = useState<string | undefined>(src ? asset(src) : undefined);
  const [natural, setNatural] = useState<[number, number] | undefined>(naturalSize);

  useEffect(() => {
    revealedRef.current = revealed;
    wakeRef.current();
  }, [revealed]);

  const placeholderKey = placeholder ? `${placeholder.code}:${placeholder.seed}:${placeholder.title}` : '';

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;
    let disposed = false;
    let raf = 0;
    setGlReady(false);

    const makePlaceholder = async (): Promise<HTMLCanvasElement | null> => {
      if (!placeholder) return null;
      try {
        await (document as Document & { fonts?: FontFaceSet }).fonts?.ready;
      } catch {
        /* fonts unavailable, draw anyway */
      }
      const rect = wrap.getBoundingClientRect();
      const aspect = rect.width > 0 && rect.height > 0 ? rect.width / rect.height : 16 / 9;
      const w = 1600;
      const h = Math.round(w / aspect);
      const c = document.createElement('canvas');
      drawPlaceholder(c, placeholder, w, h);
      if (!disposed) {
        setFallback(c.toDataURL('image/jpeg', 0.86));
        setNatural([w, h]);
      }
      return c;
    };

    if (reduced) {
      if (!src) makePlaceholder();
      return () => {
        disposed = true;
      };
    }

    const gl = canvas.getContext('webgl', { antialias: false, premultipliedAlpha: false, alpha: false });
    if (!gl) {
      if (!src) makePlaceholder();
      return () => {
        disposed = true;
      };
    }

    const compile = (type: number, source: string) => {
      const s = gl.createShader(type)!;
      gl.shaderSource(s, source);
      gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
        console.warn(gl.getShaderInfoLog(s));
        return null;
      }
      return s;
    };
    const vs = compile(gl.VERTEX_SHADER, VERT);
    const fs = compile(gl.FRAGMENT_SHADER, FRAG);
    if (!vs || !fs) return;
    const prog = gl.createProgram()!;
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return;
    gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, 'aPos');
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

    const U = (n: string) => gl.getUniformLocation(prog, n);
    const uRes = U('uRes');
    const uScale = U('uScale');
    const uOffset = U('uOffset');
    const uTime = U('uTime');
    const uMode = U('uMode');
    const uMono = U('uMono');
    const uDpr = U('uDpr');
    gl.uniform1i(U('uTex'), 0);
    gl.uniform1i(U('uField'), 1);
    gl.uniform1f(uMode, mode === 'reveal' ? 1 : 0);
    gl.uniform1f(uMono, monochrome);

    const makeTex = (unit: number) => {
      const t = gl.createTexture();
      gl.activeTexture(gl.TEXTURE0 + unit);
      gl.bindTexture(gl.TEXTURE_2D, t);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      return t;
    };
    makeTex(0);
    makeTex(1);

    // Distortion field
    const FW = 56;
    let FH = 36;
    let field = new Float32Array(FW * FH);
    let bytes = new Uint8Array(FW * FH);
    let grain = new Float32Array(FW * FH);
    const resetField = () => {
      field = new Float32Array(FW * FH);
      bytes = new Uint8Array(FW * FH);
      grain = new Float32Array(FW * FH).map(() => 0.55 + Math.random() * 0.9);
    };
    resetField();

    let srcW = 1;
    let srcH = 1;
    let texReady = false;
    const pointer: Pointer = { x: 0.5, y: 0.5, inside: false, speed: 0, hold: false };
    const box = { x: 0.5, y: 0.5, o: 0 };
    let time = 0;
    let last = 0;
    let visible = true;
    let running = false;
    let w = 1;
    let h = 1;
    let dpr = 1;
    let scale: [number, number] = [1, 1];
    let offset: [number, number] = [0, 0];

    const computeCover = () => {
      const ca = w / h;
      const ia = srcW / srcH;
      scale = ca > ia ? [1, ia / ca] : [ca / ia, 1];
      offset = [(focus[0] - 0.5) * (1 - scale[0]), (1 - focus[1] - 0.5) * (1 - scale[1])];
    };

    const resize = () => {
      const rect = wrap.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = Math.max(1, Math.round(rect.width * dpr));
      h = Math.max(1, Math.round(rect.height * dpr));
      canvas.width = w;
      canvas.height = h;
      const nextFH = Math.max(8, Math.min(72, Math.round((FW * rect.height) / Math.max(1, rect.width))));
      if (nextFH !== FH) {
        FH = nextFH;
        resetField();
      }
      computeCover();
      wake();
    };

    const toImagePx = (ux: number, uy: number): [number, number] => {
      const ix = (ux - 0.5) * scale[0] + 0.5 + offset[0];
      const iyUp = (1 - uy - 0.5) * scale[1] + 0.5 + offset[1];
      const nat = natural ?? [srcW, srcH];
      return [Math.round(ix * nat[0]), Math.round((1 - iyUp) * nat[1])];
    };

    const stepField = (dt: number) => {
      const forced = revealedRef.current;
      const p = pointer;
      p.speed *= Math.exp(-dt * 6);
      const distort = mode === 'distort';
      const decay = distort ? 0.75 : p.inside ? 0.28 : 0.85;
      const stamping = p.inside || p.hold;
      const rx = distort ? 0.17 : 0.26;
      const ry = distort ? 0.095 : 0.13;
      const amt = distort ? (p.hold ? 1.6 : 1.0 + Math.min(p.speed, 4) * 4) : 4.5;
      const aspect = h / w;
      let any = false;
      for (let j = 0; j < FH; j++) {
        const cy = (j + 0.5) / FH;
        const dy = (cy - p.y) * aspect;
        for (let i = 0; i < FW; i++) {
          const k = j * FW + i;
          let v = field[k];
          if (forced && !distort) v = Math.min(1, v + dt * 1.5);
          else v = Math.max(0, v - decay * dt);
          if (stamping && !(forced && !distort)) {
            const dx = (i + 0.5) / FW - p.x;
            const e = (dx / rx) * (dx / rx) + (dy / ry) * (dy / ry);
            if (e < 6) v = Math.min(1, v + Math.exp(-e * 1.5) * grain[k] * amt * dt);
          }
          field[k] = v;
          bytes[k] = v * 255;
          if (v > 0.004) any = true;
        }
      }
      return any || stamping || (forced && !distort);
    };

    const updateOverlay = (dt: number) => {
      if (annotate === 'none') return;
      const p = pointer;
      const on = p.inside;
      box.o += ((on ? 1 : 0) - box.o) * Math.min(1, dt * 6);
      const lag = Math.min(1, dt * (annotate === 'hero' ? 3.5 : 5));
      box.x += (p.x - box.x) * lag;
      box.y += (p.y - box.y) * lag;
      const rect = wrap.getBoundingClientRect();
      const px = p.x * rect.width;
      const py = p.y * rect.height;
      if (crossRef.current) {
        crossRef.current.style.opacity = on ? '1' : '0';
        crossRef.current.style.transform = `translate3d(${px}px, ${py}px, 0)`;
      }
      const [ix, iy] = toImagePx(p.x, p.y);
      if (readoutRef.current && on) {
        readoutRef.current.textContent = `X: ${String(ix).padStart(4, '0')}  Y: ${String(iy).padStart(4, '0')}`;
      }
      if (boxRef.current) {
        const bw = rect.width * (annotate === 'hero' ? 0.26 : 0.3);
        const bh = annotate === 'hero' ? bw * 0.62 : bw * 0.56;
        const bx = Math.max(0, Math.min(rect.width - bw, box.x * rect.width - bw / 2));
        const by = Math.max(0, Math.min(rect.height - bh, box.y * rect.height - bh / 2));
        const s = 0.92 + box.o * 0.08;
        boxRef.current.style.opacity = String(box.o);
        boxRef.current.style.width = `${bw}px`;
        boxRef.current.style.height = `${bh}px`;
        boxRef.current.style.transform = `translate3d(${bx}px, ${by}px, 0) scale(${s})`;
        if (boxLabelRef.current) {
          const [bix, biy] = toImagePx(box.x, box.y);
          boxLabelRef.current.textContent = `TRK ${String(bix).padStart(4, '0')} / ${String(biy).padStart(4, '0')}`;
        }
        if (measureRef.current) {
          measureRef.current.style.opacity = String(box.o);
          measureRef.current.style.width = `${bx}px`;
          measureRef.current.style.transform = `translate3d(0, ${by + bh}px, 0)`;
          if (measureLabelRef.current) {
            const [edgeX] = toImagePx(bx / rect.width, 0);
            const [zeroX] = toImagePx(0, 0);
            measureLabelRef.current.textContent = `${String(Math.max(0, edgeX - zeroX)).padStart(4, '0')} PX`;
          }
        }
      }
    };

    const draw = () => {
      if (!texReady) return;
      gl.viewport(0, 0, w, h);
      gl.uniform2f(uRes, w, h);
      gl.uniform2f(uScale, scale[0], scale[1]);
      gl.uniform2f(uOffset, offset[0], offset[1]);
      gl.uniform1f(uTime, time);
      gl.uniform1f(uDpr, dpr);
      gl.activeTexture(gl.TEXTURE1);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
      gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.LUMINANCE, FW, FH, 0, gl.LUMINANCE, gl.UNSIGNED_BYTE, bytes);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    };

    const frame = (t: number) => {
      const dt = Math.min(0.05, last ? (t - last) / 1000 : 0.016);
      last = t;
      const active = stepField(dt);
      if (active) time += dt;
      updateOverlay(dt);
      draw();
      const overlayBusy = annotate !== 'none' && (pointer.inside || box.o > 0.01);
      if ((active || overlayBusy) && visible && !disposed) {
        raf = requestAnimationFrame(frame);
      } else {
        running = false;
        last = 0;
      }
    };

    function wake() {
      if (running || disposed || !visible) {
        if (!running && texReady) draw();
        return;
      }
      running = true;
      raf = requestAnimationFrame(frame);
    }
    wakeRef.current = wake;

    let lastMoveT = 0;
    const local = (e: PointerEvent): [number, number] => {
      const r = wrap.getBoundingClientRect();
      return [(e.clientX - r.left) / r.width, (e.clientY - r.top) / r.height];
    };
    const onMove = (e: PointerEvent) => {
      if (e.pointerType === 'touch') return;
      const [x, y] = local(e);
      const dist = Math.hypot(x - pointer.x, y - pointer.y);
      const now = performance.now();
      const dts = Math.max(0.008, (lastMoveT ? now - lastMoveT : 16) / 1000);
      lastMoveT = now;
      if (pointer.inside) pointer.speed = Math.max(pointer.speed, dist / dts);
      pointer.x = x;
      pointer.y = y;
      pointer.inside = true;
      wake();
    };
    const onLeave = (e: PointerEvent) => {
      if (e.pointerType === 'touch') return;
      pointer.inside = false;
      wake();
    };
    const onDown = (e: PointerEvent) => {
      if (e.pointerType !== 'touch' || mode !== 'distort') return;
      const [x, y] = local(e);
      pointer.x = x;
      pointer.y = y;
      pointer.hold = !pointer.hold;
      wake();
    };
    wrap.addEventListener('pointermove', onMove);
    wrap.addEventListener('pointerleave', onLeave);
    wrap.addEventListener('pointerdown', onDown);

    const ro = new ResizeObserver(resize);
    ro.observe(wrap);
    const io = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        if (visible) wake();
      },
      { rootMargin: '120px' },
    );
    io.observe(wrap);

    (async () => {
      let source: TexImageSource | null = null;
      if (src) {
        const img = new Image();
        img.decoding = 'async';
        img.src = asset(src);
        try {
          await img.decode();
        } catch {
          return;
        }
        source = img;
        srcW = img.naturalWidth;
        srcH = img.naturalHeight;
        if (!naturalSize) setNatural([srcW, srcH]);
      } else {
        const c = await makePlaceholder();
        if (!c) return;
        source = c;
        srcW = c.width;
        srcH = c.height;
      }
      if (disposed) return;
      gl.activeTexture(gl.TEXTURE0);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, source);
      texReady = true;
      resize();
      draw();
      setGlReady(true);
    })();

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      wrap.removeEventListener('pointermove', onMove);
      wrap.removeEventListener('pointerleave', onLeave);
      wrap.removeEventListener('pointerdown', onDown);
      wakeRef.current = () => {};
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      setGlReady(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [src, placeholderKey, mode, reduced, monochrome, annotate]);

  const nat = natural;
  const showFallbackImg = !glReady && fallback;

  return (
    <div
      ref={wrapRef}
      className={`relative h-full w-full overflow-hidden bg-ink-3 ${className}`}
      style={{ touchAction: 'pan-y' }}
    >
      {showFallbackImg && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={fallback}
          alt={alt}
          loading={priority ? 'eager' : 'lazy'}
          className="absolute inset-0 h-full w-full object-cover"
          style={{
            objectPosition: `${focus[0] * 100}% ${focus[1] * 100}%`,
            filter: monochrome ? `grayscale(${monochrome})` : undefined,
          }}
        />
      )}
      <canvas
        ref={canvasRef}
        role="img"
        aria-label={alt}
        className="absolute inset-0 h-full w-full transition-opacity duration-700"
        style={{ opacity: glReady ? 1 : 0 }}
      />

      {annotate !== 'none' && (
        <div className="pointer-events-none absolute inset-0 select-none font-mono text-[10px] uppercase tracking-label text-paper/80 mix-blend-difference" aria-hidden>
          {/* Static frame annotations */}
          <span className="absolute left-3 top-3">{fieldLabel ?? 'FIELD'}</span>
          {nat && (
            <span className="absolute bottom-3 left-3 text-paper/50">
              {nat[0]} × {nat[1]} PX
            </span>
          )}
          <span className="absolute right-3 top-3 text-paper/50">{mode === 'distort' ? 'SAMPLING' : 'RECONSTRUCT'}</span>
          <span className="corner-ticks absolute inset-0" />

          {/* Tracking box */}
          <div ref={boxRef} className="track-box absolute left-0 top-0 opacity-0" style={{ transformOrigin: 'center' }}>
            <span ref={boxLabelRef} className="absolute -top-4 left-0 whitespace-nowrap text-[9px] text-paper/80" />
          </div>
          {annotate === 'project' && (
            <div ref={measureRef} className="measure absolute left-0 top-0 opacity-0">
              <span ref={measureLabelRef} className="absolute -top-4 left-1 whitespace-nowrap text-[9px] text-paper/70" />
            </div>
          )}

          {/* Crosshair and live coordinates */}
          <div ref={crossRef} className="crosshair absolute left-0 top-0 opacity-0 transition-opacity duration-300">
            <div ref={readoutRef} className="absolute left-3 top-3 whitespace-nowrap text-[9px] text-paper/90" />
          </div>
        </div>
      )}
    </div>
  );
}
