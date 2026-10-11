/**
 * Automated 3-Minute Demo Video Recorder for HeatRoute
 * Uses Playwright to programmatically drive the browser and record a 1080p demo video.
 *
 * Usage:
 *   1. npx playwright install chromium
 *   2. node scripts/record_demo_playwright.mjs
 */

import { chromium } from "playwright";
import fs from "fs";
import path from "path";

const TARGET_URL = process.env.DEMO_URL || "https://main.d1n8kxpr67xo92.amplifyapp.com";
const OUTPUT_DIR = path.resolve("./demo_recordings");

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function run() {
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  console.log("🎬 Starting automated demo recording...");
  console.log(`🌐 Target URL: ${TARGET_URL}`);
  console.log(`📁 Output Directory: ${OUTPUT_DIR}`);

  const browser = await chromium.launch({
    headless: false, // Set to false to see the automated walkthrough live on screen
    args: ["--start-maximized", "--no-sandbox"]
  });

  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    deviceScaleFactor: 1,
    recordVideo: {
      dir: OUTPUT_DIR,
      size: { width: 1920, height: 1080 }
    }
  });

  const page = await context.newPage();

  console.log("⏳ Loading HeatRoute application...");
  await page.goto(TARGET_URL, { waitUntil: "networkidle" });
  await sleep(4000); // Allow MapLibre vector tiles to stream in

  // --- SCENE 1: The Problem Hook (0:00 - 0:25) ---
  console.log("📍 Scene 1: The Problem Hook (Heatwave 43.5°C)");
  await sleep(6000);

  // --- SCENE 2: Comparing Routes (0:25 - 0:55) ---
  console.log("📍 Scene 2: Comparing Routes (Fastest vs Shaded)");
  // Click Kasturba Gandhi Marg (Shaded Path)
  const routeCards = page.locator(".route-card-item");
  const count = await routeCards.count();
  if (count > 1) {
    await routeCards.nth(1).click();
    console.log("  -> Clicked Kasturba Gandhi Marg Tree Avenue");
  }
  await sleep(8000);

  // Click Coolest Path
  if (count > 2) {
    await routeCards.nth(2).click();
    console.log("  -> Clicked Connaught Colonnade & Shaded Lane");
  }
  await sleep(7000);

  // --- SCENE 3: Diurnal Solar Time-Travel (1:20 - 1:50) ---
  console.log("📍 Scene 3: Diurnal Solar Engine");
  // Click 09:00 AM preset
  const morningBtn = page.locator("button:has-text('09:00 AM')");
  if (await morningBtn.count() > 0) {
    await morningBtn.first().click();
    console.log("  -> Switched time to 09:00 AM");
    await sleep(4000);
  }

  // Click 01:30 PM preset (Apex)
  const noonBtn = page.locator("button:has-text('01:30 PM')");
  if (await noonBtn.count() > 0) {
    await noonBtn.first().click();
    console.log("  -> Switched time to 01:30 PM (Solar Apex)");
    await sleep(5000);
  }

  // Click 05:00 PM preset
  const eveningBtn = page.locator("button:has-text('05:00 PM')");
  if (await eveningBtn.count() > 0) {
    await eveningBtn.first().click();
    console.log("  -> Switched time to 05:00 PM (Shaded Canyon)");
    await sleep(5000);
  }

  // --- SCENE 4: Hydration & Recovery Layer (1:50 - 2:15) ---
  console.log("📍 Scene 4: Hydration & Water Recovery Layer");
  const hydrationBtn = page.locator("button:has-text('Water & Rest Stops')");
  if (await hydrationBtn.count() > 0) {
    await hydrationBtn.first().click();
    console.log("  -> Opened Hydration HUD");
    await sleep(6000);
  }

  // --- SCENE 5: Dual-Hazard Monsoon Flood Mode (2:15 - 2:40) ---
  console.log("📍 Scene 5: Dual-Hazard Monsoon Mode");
  const monsoonBtn = page.locator("#season-monsoon-btn");
  if (await monsoonBtn.count() > 0) {
    await monsoonBtn.first().click();
    console.log("  -> Switched to Monsoon Flood Scenario");
    await sleep(7000);
  }

  // --- SCENE 6: AWS Architecture & Cloud Telemetry (2:40 - 3:00) ---
  console.log("📍 Scene 6: AWS Cloud Telemetry");
  const telemetryBtn = page.locator("button:has-text('AWS Telemetry')");
  if (await telemetryBtn.count() > 0) {
    await telemetryBtn.first().click();
    console.log("  -> Opened AWS Telemetry Modal");
    await sleep(7000);

    const closeBtn = page.locator(".modal-close-btn");
    if (await closeBtn.count() > 0) {
      await closeBtn.first().click();
    }
  }

  // Final overview
  await sleep(3000);

  console.log("🏁 Recording complete. Closing browser...");
  await page.close();
  await context.close();
  await browser.close();

  console.log(`🎉 Demo video successfully saved in: ${OUTPUT_DIR}`);
}

run().catch(err => {
  console.error("❌ Recording error:", err);
  process.exit(1);
});
