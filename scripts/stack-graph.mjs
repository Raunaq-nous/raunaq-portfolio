#!/usr/bin/env node
/*
 * Builds a tech-stack architecture graph for a project: technologies as nodes, grouped into
 * layers (interface, application, data, AI, delivery), with edges for how they talk to each other.
 *
 *   node scripts/stack-graph.mjs <slug> <repo-dir>    scan a local checkout's manifests
 *   node scripts/stack-graph.mjs <slug> --spec        use the hand-written spec in scripts/stack-specs.mjs
 *
 * Writes public/media/projects/<slug>/stack.json. Repo scans read package.json, pyproject.toml,
 * requirements*.txt, Dockerfiles, compose files, vercel.json and GitHub workflows, plus the model
 * IDs named in source. AI features always come from stack-specs.mjs, written from the build write-up.
 */
import fs from 'node:fs';
import path from 'node:path';
import { specs } from './stack-specs.mjs';

export const LAYERS = [
  { id: 'interface', label: 'Interface' },
  { id: 'application', label: 'Application' },
  { id: 'data', label: 'Data' },
  { id: 'ai', label: 'AI' },
  { id: 'delivery', label: 'Delivery' },
];

// dependency name -> [label, layer, role]
const DEPS = {
  next: ['Next.js', 'interface', 'web'],
  react: ['React', 'interface', 'ui'],
  vite: ['Vite', 'interface', 'build'],
  'react-native': ['React Native', 'interface', 'mobile'],
  expo: ['Expo', 'interface', 'mobile'],
  tailwindcss: ['Tailwind CSS', 'interface', 'style'],
  nativewind: ['NativeWind', 'interface', 'style'],
  'framer-motion': ['Framer Motion', 'interface', 'style'],
  '@radix-ui/react-dialog': ['Radix UI', 'interface', 'style'],
  recharts: ['Recharts', 'interface', 'viz'],
  'react-native-chart-kit': ['Chart Kit', 'interface', 'viz'],
  'maplibre-gl': ['MapLibre GL', 'interface', 'viz'],
  cobe: ['Cobe globe', 'interface', 'viz'],
  '@turf/area': ['Turf.js', 'application', 'geo'],
  zustand: ['Zustand', 'interface', 'state'],
  '@tanstack/react-query': ['TanStack Query', 'interface', 'state'],
  'react-hook-form': ['React Hook Form', 'interface', 'state'],
  zod: ['Zod', 'application', 'validate'],
  pydantic: ['Pydantic', 'application', 'validate'],
  '@nestjs/core': ['NestJS', 'application', 'server'],
  fastapi: ['FastAPI', 'application', 'server'],
  'next-auth': ['NextAuth', 'application', 'auth'],
  jose: ['JWT (jose)', 'application', 'auth'],
  '@nestjs/jwt': ['JWT + Passport', 'application', 'auth'],
  bcryptjs: ['bcrypt', 'application', 'auth'],
  'node-cron': ['node-cron jobs', 'application', 'jobs'],
  '@nestjs/schedule': ['Scheduled jobs', 'application', 'jobs'],
  bull: ['Bull queues', 'application', 'jobs'],
  cheerio: ['Cheerio scraping', 'application', 'ingest'],
  'pdf-parse': ['PDF parsing', 'application', 'ingest'],
  pdfplumber: ['pdfplumber', 'application', 'ingest'],
  structlog: ['structlog', 'application', 'observe'],
  'nestjs-pino': ['Pino logging', 'application', 'observe'],
  '@sentry/nextjs': ['Sentry', 'delivery', 'observe'],
  '@vercel/analytics': ['Vercel Analytics', 'delivery', 'observe'],
  '@prisma/client': ['Prisma ORM', 'data', 'orm'],
  postgres: ['PostgreSQL', 'data', 'db'],
  '@supabase/supabase-js': ['Supabase', 'data', 'db'],
  '@upstash/redis': ['Upstash Redis', 'data', 'cache'],
  ioredis: ['Redis', 'data', 'cache'],
  redis: ['Redis', 'data', 'cache'],
  dexie: ['IndexedDB (Dexie)', 'data', 'local'],
  '@aws-sdk/client-s3': ['S3 storage', 'data', 'storage'],
  boto3: ['S3 storage', 'data', 'storage'],
  'pinecone-client': ['Pinecone vectors', 'data', 'vector'],
  pyyaml: ['YAML taxonomies', 'data', 'local'],
  openai: ['OpenAI SDK', 'ai', 'sdk'],
  '@google/genai': ['Google GenAI SDK', 'ai', 'sdk'],
  'groq-sdk': ['Groq SDK', 'ai', 'sdk'],
  anthropic: ['Anthropic SDK', 'ai', 'sdk'],
  'claude-agent-sdk': ['Claude Agent SDK', 'ai', 'orchestrate'],
  langchain: ['LangChain', 'ai', 'orchestrate'],
  tiktoken: ['tiktoken', 'ai', 'sdk'],
  deepeval: ['DeepEval evals', 'ai', 'eval'],
  pytesseract: ['Tesseract OCR', 'ai', 'perception'],
  paddleocr: ['PaddleOCR', 'ai', 'perception'],
  'opencv-python': ['OpenCV', 'ai', 'perception'],
  'opencv-python-headless': ['OpenCV', 'ai', 'perception'],
  spacy: ['spaCy NLP', 'ai', 'perception'],
  vitest: ['Vitest', 'delivery', 'test'],
  jest: ['Jest', 'delivery', 'test'],
  pytest: ['pytest', 'delivery', 'test'],
  playwright: ['Playwright', 'delivery', 'test'],
  mypy: ['mypy strict', 'delivery', 'test'],
};

const MODEL_RE = /\b(gpt-4o(?:-mini)?|gpt-4\.1(?:-mini)?|gpt-oss-120b|claude-(?:opus|sonnet|haiku)-[0-9](?:[0-9a-z.-]*[0-9a-z])?|gemini-[0-9](?:[0-9a-z.-]*[0-9a-z])?|llama-?3[0-9a-z.-]*)\b/g;
const SKIP = new Set(['node_modules', '.next', '.git', '.venv', 'dist', 'build', 'docs', '.claude', 'coverage', 'public']);

function walk(dir, out = [], depth = 0) {
  if (depth > 7) return out;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (SKIP.has(e.name)) continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, out, depth + 1);
    else out.push(p);
  }
  return out;
}

function scan(repo) {
  const files = walk(repo);
  const found = new Map();
  const add = (key, label, layer, role) => {
    if (![...found.values()].some((n) => n.label === label)) found.set(key, { id: key, label, layer, role });
  };
  for (const f of files) {
    const base = path.basename(f);
    if (base === 'package.json') {
      const d = JSON.parse(fs.readFileSync(f, 'utf8'));
      for (const k of Object.keys({ ...d.dependencies, ...d.devDependencies })) if (DEPS[k]) add(k, ...DEPS[k]);
      if (d.workspaces) add('monorepo', 'npm workspaces', 'delivery', 'build');
    } else if (base === 'pyproject.toml' || /^requirements.*\.txt$/.test(base)) {
      const txt = fs.readFileSync(f, 'utf8');
      for (const m of txt.matchAll(/^\s*"?([A-Za-z0-9_.-]+)/gm)) {
        const k = m[1].toLowerCase();
        if (DEPS[k]) add(k, ...DEPS[k]);
      }
      add('python', 'Python', 'application', 'lang');
    } else if (base === 'Dockerfile') add('docker', 'Docker', 'delivery', 'container');
    else if (/^docker-compose.*\.ya?ml$/.test(base)) add('compose', 'Docker Compose', 'delivery', 'container');
    else if (base === 'vercel.json') add('vercel', 'Vercel', 'delivery', 'host');
    else if (f.includes(`${path.sep}.github${path.sep}workflows`)) {
      const txt = fs.readFileSync(f, 'utf8');
      add('actions', 'GitHub Actions', 'delivery', 'ci');
      if (/deploy-pages|pages/i.test(txt)) add('pages', 'GitHub Pages', 'delivery', 'host');
    } else if (base === 'schema.prisma') {
      const txt = fs.readFileSync(f, 'utf8');
      if (/provider\s*=\s*"postgresql"/.test(txt)) add('postgres', 'PostgreSQL', 'data', 'db');
    }
    if (/\.(ts|tsx|py)$/.test(base) && !/\.(test|spec)\./.test(base)) {
      const txt = fs.readFileSync(f, 'utf8');
      for (const m of txt.matchAll(MODEL_RE)) add(`model:${m[1]}`, m[1], 'ai', 'model');
      if (base.endsWith('.ts') || base.endsWith('.tsx')) add('typescript', 'TypeScript', 'application', 'lang');
    }
  }
  return [...found.values()];
}

/** Rule-based edges between roles: how a request flows through the stack. */
function edges(nodes) {
  const by = (...roles) => nodes.filter((n) => roles.includes(n.role));
  const first = (...roles) => by(...roles)[0];
  const out = [];
  const link = (a, b, label) => a && b && a.id !== b.id && out.push({ s: a.id, t: b.id, ...(label ? { label } : {}) });
  const shell = first('web', 'mobile', 'ui', 'build');
  const server = first('server') ?? (by('web')[0] ? by('web')[0] : first('lang'));
  for (const n of by('style', 'viz', 'state')) link(n, shell);
  for (const n of by('ui', 'build')) if (n !== shell) link(n, shell);
  for (const m of by('mobile')) if (m !== shell) link(m, server, 'API');
  if (server && shell && server !== shell) link(shell, server, 'API');
  for (const n of by('auth', 'jobs', 'ingest', 'validate', 'geo', 'observe').filter((n) => n.layer === 'application')) link(server, n);
  const orm = first('orm');
  for (const db of by('db')) link(orm ?? server, db, orm ? undefined : 'query');
  if (orm) link(server, orm);
  for (const n of by('cache', 'storage', 'local')) link(n.role === 'local' && first('state') ? first('state') : server, n);
  const sdks = by('sdk', 'orchestrate', 'perception');
  for (const n of sdks) link(n.role === 'orchestrate' || !first('orchestrate') ? server : first('orchestrate'), n);
  for (const m of by('model')) {
    const sdk = by('sdk', 'orchestrate').find((s) => sdkFor(s.label, m.label)) ?? first('orchestrate', 'sdk');
    link(sdk, m);
  }
  for (const v of by('vector')) link(first('orchestrate') ?? server, v, 'retrieve');
  for (const e of by('eval')) link(e, first('orchestrate', 'sdk'), 'gates');
  for (const h of by('host')) link(h, shell ?? server, 'serves');
  for (const c of by('container')) link(c, server, 'runs');
  for (const ci of by('ci')) by('test').forEach((t) => link(ci, t, 'runs'));
  for (const t of by('test')) if (!first('ci')) link(t, server);
  return out;
}

function sdkFor(sdk, model) {
  if (/^claude/.test(model)) return /Anthropic|Claude/.test(sdk);
  if (/^gemini/.test(model)) return /Google/.test(sdk);
  if (/^gpt-oss|^llama/.test(model)) return /Groq|OpenAI/.test(sdk);
  if (/^gpt/.test(model)) return /OpenAI|LangChain/.test(sdk);
  return false;
}

const [slug, src] = process.argv.slice(2);
if (!slug || !src) {
  console.error('usage: node scripts/stack-graph.mjs <slug> <repo-dir | --spec>');
  process.exit(1);
}
const spec = specs[slug] ?? {};
let nodes;
let source;
if (src === '--spec') {
  if (!spec.nodes) throw new Error(`no spec nodes for ${slug}`);
  nodes = spec.nodes.map(([id, label, layer, role]) => ({ id, label, layer, role }));
  source = 'From the build write-up';
} else {
  nodes = scan(path.resolve(src));
  for (const drop of spec.drop ?? []) nodes = nodes.filter((n) => n.id !== drop && n.label !== drop);
  for (const [id, label, layer, role] of spec.extra ?? []) nodes.push({ id, label, layer, role });
  source = 'Scanned from the repository manifests';
}
const graph = {
  source,
  layers: LAYERS,
  nodes,
  edges: [...edges(nodes), ...(spec.edges ?? []).map(([s, t, label]) => ({ s, t, ...(label ? { label } : {}) }))],
  features: spec.features ?? [],
};
const dir = path.join('public/media/projects', slug);
fs.mkdirSync(dir, { recursive: true });
fs.writeFileSync(path.join(dir, 'stack.json'), JSON.stringify(graph, null, 1));
const old = path.join(dir, 'codegraph.json');
if (fs.existsSync(old)) fs.rmSync(old);
console.log(`${slug}: ${nodes.length} technologies, ${graph.edges.length} links, ${graph.features.length} AI features`);
