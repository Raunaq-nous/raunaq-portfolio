// Captures snapshots of the published papers' IEEE Xplore pages into public/media/snapshots.
// Runs in GitHub Actions (see .github/workflows/capture-snapshots.yml), where IEEE is reachable.
import { chromium } from 'playwright';
import { mkdirSync, writeFileSync } from 'node:fs';

const papers = {
  'tether-deploy': 'https://ieeexplore.ieee.org/document/7119062',
  'adcs-core': 'https://ieeexplore.ieee.org/document/7275676',
  'tether-control': 'https://ieeexplore.ieee.org/document/7275680',
  'sil-rig': 'https://ieeexplore.ieee.org/document/7500603',
};

const out = 'public/media/snapshots';
mkdirSync(out, { recursive: true });
const browser = await chromium.launch();
const context = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  deviceScaleFactor: 1,
  userAgent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36',
});
const results = {};
for (const [id, url] of Object.entries(papers)) {
  const page = await context.newPage();
  try {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.waitForTimeout(6000);
    for (const label of [/accept all/i, /accept/i, /close/i]) {
      const btn = page.getByRole('button', { name: label }).first();
      if (await btn.count()) await btn.click({ timeout: 2000 }).catch(() => {});
    }
    await page.waitForTimeout(1500);
    const title = await page.title();
    const text = await page.locator('body').innerText().catch(() => '');
    if (!title || /access denied|robot|captcha/i.test(title) || /unable to load page|error code: 4\d\d/i.test(text)) {
      throw new Error(`blocked or error page: ${title || text.slice(0, 80)}`);
    }
    await page.screenshot({ path: `${out}/paper-${id}.jpg`, type: 'jpeg', quality: 80 });
    results[id] = { ok: true, title };
  } catch (e) {
    results[id] = { ok: false, error: String(e.message || e).slice(0, 200) };
  }
  await page.close();
}
await browser.close();
writeFileSync(`${out}/manifest.json`, JSON.stringify({ capturedAt: new Date().toISOString(), results }, null, 2));
console.log(JSON.stringify(results, null, 2));
