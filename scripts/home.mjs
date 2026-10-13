#!/usr/bin/env node
// The home page is a hand-built static page (home/index.html). After `next build`, it replaces
// the placeholder index Next writes, so the rest of the site (work pages, data) stays in Next.
import fs from 'node:fs';
fs.copyFileSync('home/index.html', 'out/index.html');
console.log('home: out/index.html <- home/index.html');
