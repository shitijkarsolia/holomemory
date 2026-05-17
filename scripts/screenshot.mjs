// scripts/screenshot.mjs
//
// Regenerate the screenshots referenced from README.md.
//
// Prerequisites:
//   1. Frontend dev server running on http://localhost:3000
//        cd frontend && npm run dev
//   2. Playwright + Chromium available to Node. Easiest:
//        npm i -D playwright    # inside frontend/
//        npx playwright install chromium
//
// Usage (from repo root):
//   node scripts/screenshot.mjs
//   SCREEN_BASE_URL=http://localhost:3001 node scripts/screenshot.mjs

import { createRequire } from "node:module";
import { mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const frontendNodeModules = resolve(here, "..", "frontend", "node_modules");
const require = createRequire(`${frontendNodeModules}/.dummy`);

let chromium;
try {
  ({ chromium } = require("playwright"));
} catch {
  try {
    ({ chromium } = require("playwright-core"));
  } catch (e) {
    console.error(
      "Playwright not found. Install it inside frontend/: `cd frontend && npm i -D playwright && npx playwright install chromium`",
    );
    throw e;
  }
}

const BASE = process.env.SCREEN_BASE_URL ?? "http://localhost:3000";
const OUT_DIR = resolve(here, "..", "frontend", "public", "screenshots");

const SHOTS = [
  { name: "home-desktop", url: "/", width: 1440, height: 900, fullPage: true },
  { name: "home-hero-desktop", url: "/", width: 1440, height: 900, fullPage: false },
  { name: "home-mobile", url: "/", width: 390, height: 844, fullPage: true },
  { name: "home-hero-mobile", url: "/", width: 390, height: 844, fullPage: false },
  { name: "playground-desktop", url: "/playground", width: 1440, height: 900, fullPage: false },
];

async function main() {
  await mkdir(OUT_DIR, { recursive: true });
  const browser = await chromium.launch();
  for (const s of SHOTS) {
    const ctx = await browser.newContext({
      viewport: { width: s.width, height: s.height },
      deviceScaleFactor: 2,
      colorScheme: "dark",
      reducedMotion: "reduce",
    });
    const page = await ctx.newPage();
    const url = `${BASE}${s.url}`;
    console.log(`→ ${s.name}  ${s.width}x${s.height}  ${url}`);
    await page.goto(url, { waitUntil: "networkidle", timeout: 30_000 });
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(600);
    const path = `${OUT_DIR}/${s.name}.png`;
    await page.screenshot({ path, fullPage: s.fullPage });
    console.log(`  saved ${path}`);
    await ctx.close();
  }
  await browser.close();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

