const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 375, height: 812 },
    deviceScaleFactor: 3,
    isMobile: true,
    hasTouch: true,
  });
  const page = await context.newPage();

  await page.goto('http://localhost:8080');
  await page.waitForTimeout(2000);

  // Open menu
  await page.click('[aria-label="Toggle menu"]');
  await page.waitForTimeout(1000);

  await page.screenshot({ path: '/home/jules/verification/mobile_nav_debug.png' });

  await browser.close();
})();
