// Screenshot harness for visual QA.
// Usage: node screenshot.mjs <url> [label]
// Captures desktop + mobile full-page PNGs into ./temporary screenshots/
import puppeteer from 'puppeteer';
import { mkdir } from 'node:fs/promises';
import { join } from 'node:path';

const url = process.argv[2] || 'http://127.0.0.1:9292';
const label = process.argv[3] || 'shot';
const OUT = join(process.cwd(), 'temporary screenshots');

const VIEWPORTS = [
  { name: 'desktop', width: 1440, height: 900, dsf: 1, mobile: false },
  { name: 'mobile', width: 390, height: 844, dsf: 2, mobile: true }, // iPhone 12/13/14
];

await mkdir(OUT, { recursive: true });

// Optional 4th arg: comma-separated CSS selectors to clip (per-section detail shots)
const sections = (process.argv[4] || '').split(',').map(s => s.trim()).filter(Boolean);

const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
try {
  for (const v of VIEWPORTS) {
    const page = await browser.newPage();
    await page.setViewport({ width: v.width, height: v.height, deviceScaleFactor: v.dsf, isMobile: v.mobile, hasTouch: v.mobile });
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });
    try { await page.evaluateHandle('document.fonts.ready'); } catch {}
    await new Promise(r => setTimeout(r, 900));

    const file = join(OUT, `${label}-${v.name}.png`);
    await page.screenshot({ path: file, fullPage: true });
    console.log(`saved ${file}  (${v.width}x${v.height})`);

    for (const sel of sections) {
      const el = await page.$(sel);
      if (!el) { console.log(`  [skip] no element for "${sel}"`); continue; }
      await el.scrollIntoView();
      await new Promise(r => setTimeout(r, 300));
      const safe = sel.replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '');
      const f = join(OUT, `${label}-${v.name}-${safe}.png`);
      await el.screenshot({ path: f });
      console.log(`  clip ${f}`);
    }
    await page.close();
  }
} finally {
  await browser.close();
}
