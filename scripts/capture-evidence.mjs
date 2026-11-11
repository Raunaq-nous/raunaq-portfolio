// Captures the evidence behind a research notebook (EVIDENCE_DIR, default public/notebooks/ai-sport/evidence).
// Runs on GitHub Actions (.github/workflows/capture-evidence.yml), where every source is reachable.
// For each source: open the page, highlight the words that support the note, stamp a receipt banner,
// and save a screenshot plus a thumbnail. PDFs are rendered at the page that contains the phrase.
// Results go to captured.json; a good earlier capture is kept if a new attempt fails.
import { chromium } from 'playwright';
import { mkdirSync, readFileSync, writeFileSync, existsSync, rmSync } from 'node:fs';
import { execFileSync } from 'node:child_process';

const dir = process.env.EVIDENCE_DIR || 'public/notebooks/ai-sport/evidence';
const only = (process.env.ONLY || '').split(',').filter(Boolean).map(Number);
const manifest = JSON.parse(readFileSync(`${dir}/manifest.json`, 'utf8'));
mkdirSync(`${dir}/img`, { recursive: true });
const prevFile = `${dir}/captured.json`;
const items = existsSync(prevFile) ? (JSON.parse(readFileSync(prevFile, 'utf8')).items || {}) : {};
const today = new Date().toISOString();
const browser = await chromium.launch(process.env.CHROME ? { executablePath: process.env.CHROME, args: ['--no-sandbox'] } : {});
const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 }, deviceScaleFactor: 1, locale: 'en-GB',
  userAgent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36' });
const scratch = await ctx.newPage();

async function thumb(jpg, file) {
  const data = await scratch.evaluate(async (src) => {
    const im = new Image(); im.src = src; await im.decode();
    const c = document.createElement('canvas'); c.width = 400; c.height = 250;
    c.getContext('2d').drawImage(im, 0, 0, im.width, Math.min(im.height, im.width * 0.625), 0, 0, 400, 250);
    return c.toDataURL('image/jpeg', 0.74);
  }, 'data:image/jpeg;base64,' + jpg.toString('base64'));
  writeFileSync(file, Buffer.from(data.split(',')[1], 'base64'));
}
function highlightInPage({ terms, banner }) {
  const found = [], marks = [];
  for (const term of terms) {
    const low = term.toLowerCase();
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, { acceptNode: (n) =>
      n.nodeValue && n.nodeValue.length > 1 && n.parentElement && !n.parentElement.closest('script,style,noscript,svg,textarea,mark[data-ae]') ? 1 : 2 });
    let n;
    while ((n = walker.nextNode())) {
      const i = n.nodeValue.toLowerCase().indexOf(low);
      if (i < 0) continue;
      const r = document.createRange(); r.setStart(n, i); r.setEnd(n, i + term.length);
      const m = document.createElement('mark'); m.setAttribute('data-ae', '1');
      m.style.cssText = 'background:#ffe14d !important;color:#111 !important;outline:3px solid #d4a853;outline-offset:2px;border-radius:2px;box-shadow:0 0 0 7px rgba(255,225,77,.35)';
      try { r.surroundContents(m); marks.push(m); found.push(term); } catch (e) {}
      break;
    }
  }
  const b = document.createElement('div');
  b.style.cssText = 'position:fixed;top:0;left:0;right:0;z-index:2147483647;background:#0b0b0a;color:#f1ead6;font:600 12px/1.2 ui-monospace,monospace;letter-spacing:.08em;padding:9px 14px;border-bottom:3px solid #d4a853';
  b.textContent = banner + (found.length ? ' \u00b7 HIGHLIGHTED: ' + found.join(' | ') : ' \u00b7 PHRASE NOT FOUND ON THIS PAGE');
  document.body.appendChild(b);
  if (marks[0]) marks[0].scrollIntoView({ block: 'center' });
  return found;
}
async function capturePdf(it, base) {
  const res = await ctx.request.get(it.url, { timeout: 60000 });
  if (!res.ok()) throw new Error('PDF HTTP ' + res.status());
  writeFileSync('/tmp/ev.pdf', await res.body());
  const pages = Number((execFileSync('pdfinfo', ['/tmp/ev.pdf']).toString().match(/Pages:\s+(\d+)/) || [])[1] || 1);
  let pg = 1, found = [];
  for (let i = 1; i <= Math.min(pages, 40) && !found.length; i++) {
    const txt = execFileSync('pdftotext', ['-f', String(i), '-l', String(i), '/tmp/ev.pdf', '-']).toString().toLowerCase();
    const hits = it.terms.filter((t) => txt.includes(t.toLowerCase()));
    if (hits.length) { pg = i; found = hits; }
  }
  execFileSync('pdftoppm', ['-f', String(pg), '-l', String(pg), '-r', '80', '-jpeg', '-singlefile', '/tmp/ev.pdf', '/tmp/evp']);
  const jpg = readFileSync('/tmp/evp.jpg'); writeFileSync(`${dir}/img/${base}.jpg`, jpg); await thumb(jpg, `${dir}/img/${base}_t.jpg`);
  rmSync('/tmp/ev.pdf', { force: true });
  return { found, title: `PDF page ${pg} of ${pages}` };
}
const force = process.env.FORCE === '1';
let skipped = 0;
for (const it of manifest.items) {
  if (only.length && !only.includes(it.n)) continue;
  const prev = items[it.n];
  if (!force && !only.length && prev && prev.ok && prev.img && prev.url === it.url && JSON.stringify(prev.terms || []) === JSON.stringify(it.terms || []) && existsSync(`${dir}/${prev.img}`)) { skipped++; continue; }
  const base = `r${it.n}`, host = (() => { try { return new URL(it.url).hostname.replace(/^www\./, ''); } catch { return ''; } })();
  const banner = `RECEIPT ${it.n} \u00b7 ${host} \u00b7 CAPTURED ${today.slice(0, 10)}`;
  try {
    let found, title;
    if (it.pdf) { ({ found, title } = await capturePdf(it, base)); }
    else {
      const page = await ctx.newPage();
      try {
        const resp = await page.goto(it.url, { waitUntil: 'domcontentloaded', timeout: 45000 });
        if (resp && resp.status() >= 400) throw new Error('HTTP ' + resp.status());
        await page.waitForTimeout(2500);
        for (const label of [/accept all/i, /allow all/i, /^accept/i, /i agree/i, /^agree/i, /got it/i]) {
          const btn = page.getByRole('button', { name: label }).first();
          if (await btn.count().catch(() => 0)) { await btn.click({ timeout: 1500 }).catch(() => {}); break; }
        }
        await page.waitForTimeout(800);
        title = await page.title();
        const text = (await page.locator('body').innerText().catch(() => '')).slice(0, 3000);
        if (!title && !text) throw new Error('empty page');
        if (/access denied|just a moment|attention required|captcha|are you a robot/i.test(title + ' ' + text.slice(0, 400))) throw new Error('blocked: ' + (title || text.slice(0, 60)));
        found = await page.evaluate(highlightInPage, { terms: it.terms, banner });
        await page.waitForTimeout(400);
        const jpg = await page.screenshot({ type: 'jpeg', quality: 72 });
        writeFileSync(`${dir}/img/${base}.jpg`, jpg); await thumb(jpg, `${dir}/img/${base}_t.jpg`);
      } finally { await page.close(); }
    }
    items[it.n] = { ok: true, url: it.url, terms: it.terms, img: `img/${base}.jpg`, thumb: `img/${base}_t.jpg`, found, missing: it.terms.filter((t) => !found.includes(t)), title: (title || '').slice(0, 140), capturedAt: today };
    console.log(`#${it.n} ok  found ${found.length}/${it.terms.length}  ${host}`);
  } catch (e) {
    const keep = items[it.n] && items[it.n].ok && (!items[it.n].url || items[it.n].url === it.url) ? items[it.n] : {};
    items[it.n] = { ...keep, ok: !!keep.ok, lastError: String(e.message || e).slice(0, 160), lastTriedAt: today, ...(keep.ok ? {} : { error: String(e.message || e).slice(0, 160) }) };
    console.log(`#${it.n} FAIL ${host}: ${String(e.message || e).slice(0, 90)}`);
  }
}
await browser.close();
writeFileSync(prevFile, JSON.stringify({ capturedAt: today, items }, null, 1));
const ok = Object.values(items).filter((x) => x.ok).length;
console.log(`captured ${ok} of ${manifest.items.length} (${skipped} unchanged and skipped; set FORCE=1 to recapture all)`);
