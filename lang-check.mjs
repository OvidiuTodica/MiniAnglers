// Verify the RO/EN language toggle: capture hero in RO, click toggle, capture EN.
import puppeteer from 'puppeteer';
import { mkdir } from 'node:fs/promises';
import { join } from 'node:path';

const url = process.argv[2] || 'http://127.0.0.1:9292';
const OUT = join(process.cwd(), 'temporary screenshots');
await mkdir(OUT, { recursive: true });

const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
try {
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });
  await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });
  try { await page.evaluateHandle('document.fonts.ready'); } catch {}
  await new Promise(r => setTimeout(r, 800));

  const hero = await page.$('.hero');
  await hero.screenshot({ path: join(OUT, 'lang-ro.png') });
  const roLine1 = await page.$eval('[data-i18n="hero.line1"]', el => el.textContent.trim());
  const toggleLabel = await page.$eval('[data-lang-toggle]', el => el.textContent.trim());

  // click the toggle
  await page.click('[data-lang-toggle]');
  await new Promise(r => setTimeout(r, 500));
  await hero.screenshot({ path: join(OUT, 'lang-en.png') });
  const enLine1 = await page.$eval('[data-i18n="hero.line1"]', el => el.textContent.trim());
  const toggleLabel2 = await page.$eval('[data-lang-toggle]', el => el.textContent.trim());
  const htmlLang = await page.$eval('html', el => el.getAttribute('lang'));

  console.log(JSON.stringify({
    default_line1: roLine1, default_toggle: toggleLabel,
    after_click_line1: enLine1, after_click_toggle: toggleLabel2, html_lang: htmlLang,
  }, null, 2));
} finally {
  await browser.close();
}
