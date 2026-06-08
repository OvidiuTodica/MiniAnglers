// Capture the mobile hamburger menu open.
import puppeteer from 'puppeteer';
import { mkdir } from 'node:fs/promises';
import { join } from 'node:path';
const url = process.argv[2] || 'http://127.0.0.1:9292';
const OUT = join(process.cwd(), 'temporary screenshots');
await mkdir(OUT, { recursive: true });
const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
try {
  const page = await browser.newPage();
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });
  await new Promise(r => setTimeout(r, 700));
  await page.click('[data-nav-toggle]');
  await new Promise(r => setTimeout(r, 400));
  await page.screenshot({ path: join(OUT, 'menu-open-mobile.png') });
  const expanded = await page.$eval('[data-nav-toggle]', el => el.getAttribute('aria-expanded'));
  const visible = await page.$eval('[data-nav-mobile]', el => !el.hidden);
  console.log(JSON.stringify({ aria_expanded: expanded, panel_visible: visible }));
} finally { await browser.close(); }
