// Procedural technical spec sheets, one visual language per industry. Monochrome blueprint style.

type Motif = 'pipes' | 'solar' | 'nuclear' | 'contours' | 'truss' | 'containers' | 'racks' | 'shelves' | 'candles' | 'waves' | 'gear' | 'molecule' | 'waveform' | 'orbit' | 'columns' | 'cycle' | 'grid';

function motifFor(name: string): Motif {
  const n = name.toLowerCase();
  if (/oil|gas|energy|ev|charging/.test(n)) return 'pipes';
  if (/solar/.test(n)) return 'solar';
  if (/nuclear/.test(n)) return 'nuclear';
  if (/mining|metal/.test(n)) return 'contours';
  if (/infra|conglomerate/.test(n)) return 'truss';
  if (/port|logistic/.test(n)) return 'containers';
  if (/cloud|it|telecom|cpaas|tech|software/.test(n)) return 'racks';
  if (/fmcg|beverage|consumer|commerce|cosmetic/.test(n)) return 'shelves';
  if (/financ|fund|trading/.test(n)) return 'candles';
  if (/climate/.test(n)) return 'waves';
  if (/auto|manufactur|battery/.test(n)) return 'gear';
  if (/pharma|health/.test(n)) return 'molecule';
  if (/media|creator/.test(n)) return 'waveform';
  if (/aero|satellite/.test(n)) return 'orbit';
  if (/public/.test(n)) return 'columns';
  if (/waste/.test(n)) return 'cycle';
  return 'grid';
}

function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

const hash = (s: string) => [...s].reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7);

export function drawIndustrySheet(name: string, code: string, rows: [string, string][], w = 960, h = 600, motifKey?: string): string {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const x = c.getContext('2d')!;
  const r = rng(hash(name));
  const ink = 'rgba(241,240,236,';
  x.fillStyle = '#0d0d0d';
  x.fillRect(0, 0, w, h);
  // grid
  x.strokeStyle = ink + '0.06)';
  x.lineWidth = 1;
  for (let i = 0; i < w; i += 24) {
    x.beginPath();
    x.moveTo(i + 0.5, 0);
    x.lineTo(i + 0.5, h);
    x.stroke();
  }
  for (let j = 0; j < h; j += 24) {
    x.beginPath();
    x.moveTo(0, j + 0.5);
    x.lineTo(w, j + 0.5);
    x.stroke();
  }
  // drawing area
  const ax = 40;
  const ay = 70;
  const aw = w * 0.62;
  const ah = h - 130;
  x.strokeStyle = ink + '0.35)';
  x.strokeRect(ax + 0.5, ay + 0.5, aw, ah);
  x.save();
  x.beginPath();
  x.rect(ax, ay, aw, ah);
  x.clip();
  x.strokeStyle = ink + '0.85)';
  x.fillStyle = ink + '0.85)';
  x.lineWidth = 1.4;
  const cx = ax + aw / 2;
  const cy = ay + ah / 2;
  const m = motifFor(motifKey ?? name);
  const line = (a: number, b: number, c2: number, d: number) => {
    x.beginPath();
    x.moveTo(a, b);
    x.lineTo(c2, d);
    x.stroke();
  };
  if (m === 'pipes') {
    for (let k = 0; k < 5; k++) {
      const y = ay + 50 + k * (ah - 100) / 4;
      line(ax + 20, y, ax + aw - 20, y);
      for (let v = 0; v < 4; v++) {
        const vx = ax + 60 + r() * (aw - 120);
        x.strokeRect(vx - 8, y - 8, 16, 16);
        line(vx - 8, y - 8, vx + 8, y + 8);
      }
      if (k < 4) line(ax + 40 + k * 90, y, ax + 40 + k * 90, y + (ah - 100) / 4);
    }
  } else if (m === 'solar') {
    for (let i = 0; i < 6; i++)
      for (let j = 0; j < 4; j++) {
        const px = ax + 30 + i * (aw - 60) / 6;
        const py = ay + 30 + j * (ah - 60) / 4;
        x.beginPath();
        x.moveTo(px + 10, py + 50);
        x.lineTo(px + 30, py + 8);
        x.lineTo(px + (aw - 60) / 6 - 4, py + 8);
        x.lineTo(px + (aw - 60) / 6 - 24, py + 50);
        x.closePath();
        x.stroke();
      }
  } else if (m === 'nuclear') {
    for (let k = 1; k <= 7; k++) {
      x.beginPath();
      x.arc(cx, cy, k * 26, 0, Math.PI * 2);
      x.stroke();
    }
    for (let a = 0; a < 6; a++) line(cx, cy, cx + Math.cos(a) * 200, cy + Math.sin(a) * 200);
  } else if (m === 'contours') {
    for (let k = 0; k < 14; k++) {
      x.beginPath();
      for (let t = 0; t <= 60; t++) {
        const a = (t / 60) * Math.PI * 2;
        const rr = 20 + k * 16 + Math.sin(a * 3 + k) * 10 + Math.cos(a * 5) * 6;
        const px = cx + Math.cos(a) * rr * 1.4;
        const py = cy + Math.sin(a) * rr;
        if (t) x.lineTo(px, py);
        else x.moveTo(px, py);
      }
      x.stroke();
    }
  } else if (m === 'truss') {
    const n = 10;
    const sw = (aw - 60) / n;
    for (let i = 0; i <= n; i++) {
      const px = ax + 30 + i * sw;
      line(px, cy - 60, px, cy + 60);
      if (i < n) {
        line(px, cy - 60, px + sw, cy + 60);
        line(px, cy + 60, px + sw, cy - 60);
      }
    }
    line(ax + 30, cy - 60, ax + aw - 30, cy - 60);
    line(ax + 30, cy + 60, ax + aw - 30, cy + 60);
  } else if (m === 'containers') {
    for (let i = 0; i < 9; i++) {
      const hgt = 2 + Math.floor(r() * 5);
      for (let j = 0; j < hgt; j++) {
        const px = ax + 30 + i * (aw - 60) / 9;
        const py = ay + ah - 40 - j * 34;
        x.strokeRect(px, py - 30, (aw - 60) / 9 - 6, 30);
        for (let s = 1; s < 4; s++) line(px + s * 12, py - 30, px + s * 12, py);
      }
    }
    line(ax + aw - 80, ay + 30, ax + aw - 80, ay + ah - 40);
    line(ax + aw - 160, ay + 40, ax + aw - 20, ay + 40);
  } else if (m === 'racks') {
    for (let i = 0; i < 5; i++) {
      const px = ax + 30 + i * (aw - 60) / 5;
      x.strokeRect(px, ay + 30, (aw - 60) / 5 - 14, ah - 60);
      for (let j = 0; j < 12; j++) {
        const py = ay + 40 + j * (ah - 80) / 12;
        x.strokeRect(px + 6, py, (aw - 60) / 5 - 26, (ah - 80) / 12 - 6);
        if (r() < 0.4) x.fillRect(px + 10, py + 4, 4, 4);
      }
    }
  } else if (m === 'shelves') {
    for (let j = 0; j < 4; j++) {
      const py = ay + 40 + j * (ah - 60) / 4;
      line(ax + 20, py + (ah - 60) / 4 - 10, ax + aw - 20, py + (ah - 60) / 4 - 10);
      let px = ax + 30;
      while (px < ax + aw - 60) {
        const bw = 20 + r() * 40;
        const bh = 20 + r() * ((ah - 60) / 4 - 40);
        x.strokeRect(px, py + (ah - 60) / 4 - 10 - bh, bw, bh);
        px += bw + 8;
      }
    }
  } else if (m === 'candles') {
    let v = cy;
    for (let i = 0; i < 28; i++) {
      const px = ax + 30 + i * (aw - 60) / 28;
      const o = v;
      v += (r() - 0.48) * 40;
      const hi = Math.min(o, v) - r() * 20;
      const lo = Math.max(o, v) + r() * 20;
      line(px + 5, hi, px + 5, lo);
      if (v < o) x.fillRect(px, v, 10, o - v);
      else x.strokeRect(px, o, 10, v - o);
    }
  } else if (m === 'waves') {
    for (let k = 0; k < 12; k++) {
      x.beginPath();
      for (let t = 0; t <= 100; t++) {
        const px = ax + (t / 100) * aw;
        const py = ay + 30 + k * (ah - 60) / 12 + Math.sin(t / 8 + k) * 10;
        if (t) x.lineTo(px, py);
        else x.moveTo(px, py);
      }
      x.stroke();
    }
  } else if (m === 'gear') {
    for (const [gx, gy, gr] of [
      [cx - 70, cy, 90],
      [cx + 100, cy - 60, 55],
      [cx + 110, cy + 90, 40],
    ] as const) {
      x.beginPath();
      for (let t = 0; t <= 96; t++) {
        const a = (t / 96) * Math.PI * 2;
        const rr = gr + (Math.floor(t / 4) % 2 ? 10 : 0);
        if (t) x.lineTo(gx + Math.cos(a) * rr, gy + Math.sin(a) * rr);
        else x.moveTo(gx + Math.cos(a) * rr, gy + Math.sin(a) * rr);
      }
      x.stroke();
      x.beginPath();
      x.arc(gx, gy, gr * 0.3, 0, Math.PI * 2);
      x.stroke();
    }
  } else if (m === 'molecule') {
    const pts: [number, number][] = [];
    for (let i = 0; i < 12; i++) pts.push([ax + 60 + r() * (aw - 120), ay + 50 + r() * (ah - 100)]);
    pts.forEach((p, i) => {
      const q = pts[(i + 1) % pts.length];
      line(p[0], p[1], q[0], q[1]);
      x.beginPath();
      for (let k = 0; k <= 6; k++) {
        const a = (k / 6) * Math.PI * 2;
        if (k) x.lineTo(p[0] + Math.cos(a) * 14, p[1] + Math.sin(a) * 14);
        else x.moveTo(p[0] + 14, p[1]);
      }
      x.stroke();
    });
  } else if (m === 'waveform') {
    for (let i = 0; i < 90; i++) {
      const px = ax + 20 + i * (aw - 40) / 90;
      const amp = (Math.sin(i / 6) * 0.5 + 0.5) * (ah * 0.35) * (0.4 + r() * 0.6);
      line(px, cy - amp, px, cy + amp);
    }
  } else if (m === 'orbit') {
    x.beginPath();
    x.arc(cx, cy, 50, 0, Math.PI * 2);
    x.stroke();
    for (let k = 0; k < 3; k++) {
      x.beginPath();
      x.ellipse(cx, cy, 120 + k * 50, 40 + k * 22, -0.4 + k * 0.3, 0, Math.PI * 2);
      x.stroke();
    }
    x.strokeRect(cx + 150, cy - 70, 16, 16);
    line(cx + 140, cy - 62, cx + 176, cy - 62);
  } else if (m === 'columns') {
    line(ax + 40, ay + 60, ax + aw - 40, ay + 60);
    line(ax + 60, ay + 40, ax + aw - 60, ay + 40);
    for (let i = 0; i < 7; i++) {
      const px = ax + 70 + i * (aw - 140) / 6;
      line(px - 12, ay + 70, px - 12, ay + ah - 50);
      line(px + 12, ay + 70, px + 12, ay + ah - 50);
    }
    line(ax + 40, ay + ah - 40, ax + aw - 40, ay + ah - 40);
  } else if (m === 'cycle') {
    for (let k = 0; k < 3; k++) {
      const a = (k / 3) * Math.PI * 2 - Math.PI / 2;
      const b = a + (Math.PI * 2) / 3 - 0.4;
      x.beginPath();
      x.arc(cx, cy, 120, a, b);
      x.stroke();
      const ex = cx + Math.cos(b) * 120;
      const ey = cy + Math.sin(b) * 120;
      line(ex, ey, ex - 14 * Math.cos(b - 0.8), ey - 14 * Math.sin(b - 0.8));
    }
  } else {
    for (let i = 0; i < 30; i++) x.strokeRect(ax + 30 + r() * (aw - 100), ay + 30 + r() * (ah - 100), 20 + r() * 60, 10 + r() * 40);
  }
  x.restore();

  // dimension line
  x.strokeStyle = ink + '0.4)';
  x.beginPath();
  x.moveTo(ax, ay + ah + 20);
  x.lineTo(ax + aw, ay + ah + 20);
  x.stroke();
  x.font = '13px "JetBrains Mono", ui-monospace, monospace';
  x.fillStyle = ink + '0.6)';
  x.fillText(`FIG. ${code}`, ax, ay + ah + 42);

  // title block
  const tx = ax + aw + 30;
  x.fillStyle = ink + '0.92)';
  x.font = '600 30px "Hanken Grotesk", Helvetica, Arial, sans-serif';
  const words = name.toUpperCase().split(' ');
  let ly = ay + 30;
  let cur = '';
  words.forEach((wd) => {
    if (x.measureText(cur + wd).width > w - tx - 30) {
      x.fillText(cur.trim(), tx, ly);
      ly += 34;
      cur = '';
    }
    cur += wd + ' ';
  });
  x.fillText(cur.trim(), tx, ly);
  x.font = '13px "JetBrains Mono", ui-monospace, monospace';
  x.fillStyle = ink + '0.55)';
  x.fillText(`SPEC ${code} / SECTOR SHEET`, tx, 40);
  let ry = ly + 40;
  rows.slice(0, 6).forEach(([k, v]) => {
    x.strokeStyle = ink + '0.2)';
    x.beginPath();
    x.moveTo(tx, ry - 16);
    x.lineTo(w - 30, ry - 16);
    x.stroke();
    x.fillStyle = ink + '0.5)';
    x.fillText(k.toUpperCase(), tx, ry);
    x.fillStyle = ink + '0.9)';
    const val = v.length > 26 ? v.slice(0, 25) + '…' : v;
    x.fillText(val, tx, ry + 18);
    ry += 50;
  });
  return c.toDataURL('image/jpeg', 0.85);
}
