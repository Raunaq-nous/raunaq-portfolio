// Builds a code knowledge graph from a repository: source files are nodes, imports are edges,
// grouped by top-level module. Layout is precomputed with a small force simulation so the site
// can render it statically. Usage: node scripts/code-graph.mjs <repoDir> <outFile> [srcRoots...]
import { readFileSync, readdirSync, statSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, relative, dirname, extname, resolve, normalize } from 'node:path';

const [, , repo, out, ...roots] = process.argv;
const EXT = new Set(['.ts', '.tsx', '.js', '.jsx', '.mjs', '.py']);
const SKIP = /node_modules|\.next|dist|build|\.git|coverage|__pycache__|\.venv|\.test\.|\.spec\.|tests?\/|evals\/golden|public\/|\.d\.ts$/;

const files = [];
const walk = (d) => {
  for (const f of readdirSync(d)) {
    const p = join(d, f);
    const rel = relative(repo, p);
    if (SKIP.test(rel + (statSync(p).isDirectory() ? '/' : ''))) continue;
    if (statSync(p).isDirectory()) walk(p);
    else if (EXT.has(extname(f))) files.push(rel);
  }
};
(roots.length ? roots : ['.']).forEach((r) => walk(join(repo, r)));

const set = new Set(files);
const tryResolve = (base, spec) => {
  const cands = [];
  const p = normalize(join(dirname(base), spec));
  for (const e of ['', '.ts', '.tsx', '.js', '.jsx', '.mjs', '/index.ts', '/index.tsx', '/index.js']) cands.push(p + e);
  return cands.find((c) => set.has(c));
};
// Path aliases: @/x -> src/x, ~/x -> src/x
const alias = (spec) => {
  for (const pre of ['@/', '~/']) if (spec.startsWith(pre)) for (const r of ['src/', 'app/', '']) {
    const c = tryResolve(r + 'x', './' + spec.slice(2));
    if (c) return c;
  }
  return null;
};
// Python: "from packages.value.engine import x" or "from .engine import x"
const pyIndex = new Map();
files.filter((f) => f.endsWith('.py')).forEach((f) => {
  const mod = f.replace(/\.py$/, '').replace(/\/__init__$/, '').split('/');
  for (let i = 0; i < mod.length; i++) pyIndex.set(mod.slice(i).join('.'), f);
});

const edges = new Set();
const lines = {};
for (const f of files) {
  const src = readFileSync(join(repo, f), 'utf8');
  lines[f] = src.split('\n').length;
  if (f.endsWith('.py')) {
    for (const m of src.matchAll(/^\s*(?:from\s+([.\w]+)\s+import|import\s+([\w.]+))/gm)) {
      let mod = m[1] || m[2];
      if (mod.startsWith('.')) {
        const up = mod.match(/^\.+/)[0].length;
        const base = dirname(f).split('/').slice(0, Math.max(0, dirname(f).split('/').length - (up - 1)));
        mod = [...base, mod.slice(up)].filter(Boolean).join('.');
      }
      let t = pyIndex.get(mod);
      while (!t && mod.includes('.')) {
        mod = mod.slice(0, mod.lastIndexOf('.'));
        t = pyIndex.get(mod);
      }
      if (t && t !== f) edges.add(f + '>' + t);
    }
  } else {
    for (const m of src.matchAll(/(?:import|export)[^'"]*?from\s+['"]([^'"]+)['"]|import\(\s*['"]([^'"]+)['"]\s*\)|require\(\s*['"]([^'"]+)['"]\s*\)/g)) {
      const spec = m[1] || m[2] || m[3];
      const t = spec.startsWith('.') ? tryResolve(f, spec) : alias(spec);
      if (t && t !== f) edges.add(f + '>' + t);
    }
  }
}

const groupOf = (f) => {
  const parts = f.split('/');
  const skip = ['src', 'app', 'packages', 'apps', 'services', 'lib', 'components'];
  let i = 0;
  while (i < parts.length - 2 && skip.includes(parts[i]) && i < 1) i++;
  return parts.length > 1 ? parts.slice(0, Math.min(parts.length - 1, i + 2)).join('/') : '(root)';
};

const nodes = files.map((f, i) => ({ id: i, path: f, group: groupOf(f), lines: lines[f] }));
const idx = new Map(files.map((f, i) => [f, i]));
const E = [...edges].map((e) => e.split('>')).map(([a, b]) => [idx.get(a), idx.get(b)]);

// Force layout
const groups = [...new Set(nodes.map((n) => n.group))];
const gpos = new Map(groups.map((g, i) => [g, [Math.cos((i / groups.length) * 6.283) * 300, Math.sin((i / groups.length) * 6.283) * 300]]));
const P = nodes.map((n) => {
  const [gx, gy] = gpos.get(n.group);
  return [gx + (Math.random() - 0.5) * 60, gy + (Math.random() - 0.5) * 60, 0, 0];
});
for (let it = 0; it < 400; it++) {
  const cool = 1 - it / 400;
  for (let i = 0; i < P.length; i++) {
    for (let j = i + 1; j < P.length; j++) {
      const dx = P[i][0] - P[j][0];
      const dy = P[i][1] - P[j][1];
      const d2 = dx * dx + dy * dy + 0.01;
      if (d2 > 90000) continue;
      const f = 900 / d2;
      P[i][2] += dx * f; P[i][3] += dy * f; P[j][2] -= dx * f; P[j][3] -= dy * f;
    }
  }
  for (const [a, b] of E) {
    const dx = P[b][0] - P[a][0];
    const dy = P[b][1] - P[a][1];
    const d = Math.sqrt(dx * dx + dy * dy) + 0.01;
    const f = (d - 40) * 0.02;
    P[a][2] += (dx / d) * f; P[a][3] += (dy / d) * f; P[b][2] -= (dx / d) * f; P[b][3] -= (dy / d) * f;
  }
  nodes.forEach((n, i) => {
    const [gx, gy] = gpos.get(n.group);
    P[i][2] += (gx - P[i][0]) * 0.004 - P[i][0] * 0.002;
    P[i][3] += (gy - P[i][1]) * 0.004 - P[i][1] * 0.002;
    const m = Math.min(12, Math.hypot(P[i][2], P[i][3]));
    const a = Math.atan2(P[i][3], P[i][2]);
    P[i][0] += Math.cos(a) * m * cool; P[i][1] += Math.sin(a) * m * cool;
    P[i][2] *= 0.5; P[i][3] *= 0.5;
  });
}
const xs = P.map((p) => p[0]); const ys = P.map((p) => p[1]);
const [x0, x1, y0, y1] = [Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys)];
nodes.forEach((n, i) => {
  n.x = +((P[i][0] - x0) / Math.max(1, x1 - x0)).toFixed(4);
  n.y = +((P[i][1] - y0) / Math.max(1, y1 - y0)).toFixed(4);
});
mkdirSync(dirname(out), { recursive: true });
writeFileSync(out, JSON.stringify({ files: nodes.length, imports: E.length, groups, lines: Object.values(lines).reduce((a, b) => a + b, 0), nodes, edges: E }));
console.log(out, nodes.length, 'files', E.length, 'imports', groups.length, 'groups');
