import { chromium } from 'playwright';
(async () => {
  try {
    const browser = await chromium.launch();
    const page = await browser.newPage();
    page.on('console', msg => { if (msg.type() === 'error') console.log(`[Browser Console Error] ${msg.text()}`); });
    page.on('pageerror', err => { console.log(`[Uncaught Exception] ${err.message}`); });
    await page.goto('http://localhost:5173/admin/reports'); // Try a route user recently touched
    await page.waitForTimeout(2000);
    await browser.close();
  } catch(e) { console.error('Playwright failed:', e); }
})();
