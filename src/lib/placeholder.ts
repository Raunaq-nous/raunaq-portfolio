// Procedural, clearly labelled placeholder artwork for media slots that have no real asset yet.

export interface PlaceholderSpec {
  title: string;
  code: string;
  label: string;
  seed: number;
}

function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

export function drawPlaceholder(canvas: HTMLCanvasElement, spec: PlaceholderSpec, width: number, height: number) {
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const r = rng(spec.seed * 7919 + 13);
  const u = width / 1600;

  // Tonal base
  const g = ctx.createLinearGradient(0, 0, width, height);
  g.addColorStop(0, '#1a1a19');
  g.addColorStop(1, '#0d0d0d');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, width, height);

  // Soft light falloff
  const cx = width * (0.35 + r() * 0.3);
  const cy = height * (0.3 + r() * 0.4);
  const rad = ctx.createRadialGradient(cx, cy, 0, cx, cy, width * 0.6);
  rad.addColorStop(0, 'rgba(241,240,236,0.22)');
  rad.addColorStop(1, 'rgba(241,240,236,0)');
  ctx.fillStyle = rad;
  ctx.fillRect(0, 0, width, height);

  // Measurement grid
  ctx.strokeStyle = 'rgba(241,240,236,0.06)';
  ctx.lineWidth = 1;
  const step = 80 * u;
  for (let x = 0; x < width; x += step) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }
  for (let y = 0; y < height; y += step) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }

  // Interface-like panels
  const panels = 3 + Math.floor(r() * 3);
  for (let i = 0; i < panels; i++) {
    const pw = width * (0.18 + r() * 0.32);
    const ph = height * (0.12 + r() * 0.3);
    const px = width * 0.06 + r() * (width * 0.88 - pw);
    const py = height * 0.1 + r() * (height * 0.8 - ph);
    ctx.fillStyle = `rgba(241,240,236,${0.04 + r() * 0.08})`;
    ctx.fillRect(px, py, pw, ph);
    ctx.strokeStyle = 'rgba(241,240,236,0.22)';
    ctx.strokeRect(px + 0.5, py + 0.5, pw, ph);
    const rows = 2 + Math.floor(r() * 4);
    for (let k = 0; k < rows; k++) {
      ctx.fillStyle = `rgba(241,240,236,${0.18 + r() * 0.3})`;
      ctx.fillRect(px + 16 * u, py + 20 * u + k * 22 * u, pw * (0.2 + r() * 0.6), 6 * u);
    }
  }

  // Concentric structure
  ctx.strokeStyle = 'rgba(241,240,236,0.35)';
  ctx.lineWidth = 1.2 * u;
  for (let i = 1; i <= 4; i++) {
    ctx.beginPath();
    ctx.arc(cx, cy, i * 70 * u, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.beginPath();
  ctx.moveTo(cx - 340 * u, cy);
  ctx.lineTo(cx + 340 * u, cy);
  ctx.moveTo(cx, cy - 340 * u);
  ctx.lineTo(cx, cy + 340 * u);
  ctx.stroke();

  // Title
  ctx.fillStyle = 'rgba(241,240,236,0.92)';
  ctx.font = `500 ${Math.round(150 * u)}px Geist, Helvetica Neue, Arial, sans-serif`;
  ctx.textBaseline = 'alphabetic';
  ctx.fillText(spec.title.toUpperCase(), 64 * u, height - 96 * u);

  // Labels
  ctx.font = `${Math.round(22 * u)}px "Geist Mono", ui-monospace, monospace`;
  ctx.fillStyle = 'rgba(241,240,236,0.7)';
  ctx.fillText(`${spec.code} / ${spec.label.toUpperCase()}`, 64 * u, 72 * u);
  ctx.fillText('PLACEHOLDER / REPLACE IN src/data/assets.ts', 64 * u, height - 48 * u);
  const coords = `X: ${String(Math.round(cx)).padStart(4, '0')}  Y: ${String(Math.round(cy)).padStart(4, '0')}`;
  const w = ctx.measureText(coords).width;
  ctx.fillText(coords, width - w - 64 * u, 72 * u);
}
