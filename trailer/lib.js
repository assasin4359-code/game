// boots the debug build of the game in headless Chromium with every frame under the script's control
const fs = require('fs');
let pw;
try { pw = require('playwright'); } catch (e) { pw = require(process.env.PLAYWRIGHT || '/opt/node-tools/node_modules/playwright'); }
const PORT = process.env.PORT || 8765;
const URL = `http://127.0.0.1:${PORT}/game-dev.html`;
const launch = () => pw.chromium.launch(process.env.CHROMIUM ? { executablePath: process.env.CHROMIUM } : {});
async function boot() {
  const browser = await launch();
  const page = await browser.newPage({ viewport: { width: 1000, height: 700 } });
  page.on('pageerror', e => console.log('pageerror:', e.message));
  await page.goto(URL);
  await page.evaluate(async () => {
    await Promise.all(['400 11px "Nanum Gothic Coding"', '700 11px "Nanum Gothic Coding"', '20px "Do Hyeon"', '600 30px "Cinzel"'].map(f => document.fonts.load(f, '가A')));
    window.__freeze = true;
  });
  await page.waitForTimeout(100);
  const ev = (f, a) => page.evaluate(f, a);
  return { browser, page, ev };
}
module.exports = { boot, launch, URL };
