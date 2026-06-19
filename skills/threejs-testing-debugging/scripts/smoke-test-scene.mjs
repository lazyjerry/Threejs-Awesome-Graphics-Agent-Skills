#!/usr/bin/env node

import process from "node:process";
import { createRequire } from "node:module";
import path from "node:path";

const requireFromProject = createRequire(path.join(process.cwd(), "package.json"));
let chromium;
try {
  ({ chromium } = requireFromProject("playwright"));
} catch {
  console.error(
    "smoke-test-scene.mjs requires Playwright in the current project. Install and configure Playwright there, or use the agent's browser automation tools.",
  );
  process.exit(2);
}

const args = process.argv.slice(2);
const url = args.find((arg) => !arg.startsWith("--"));
const viewportArg = args.find((arg) => arg.startsWith("--viewport="));
const readyArg = args.find((arg) => arg.startsWith("--ready="));
const timeoutArg = args.find((arg) => arg.startsWith("--timeout="));

if (!url) {
  console.error("Usage: smoke-test-scene.mjs <url> [--ready=selector] [--viewport=1280x720] [--timeout=10000]");
  process.exit(2);
}

const viewportMatch = viewportArg?.split("=")[1].match(/^(\d+)x(\d+)$/);
const viewport = viewportMatch
  ? { width: Number(viewportMatch[1]), height: Number(viewportMatch[2]) }
  : { width: 1280, height: 720 };
const readySelector = readyArg?.slice("--ready=".length);
const timeout = Number(timeoutArg?.slice("--timeout=".length) ?? 10_000);
const failures = [];
const failedRequests = [];

const browser = await chromium.launch({ headless: true });
try {
  const page = await browser.newPage({ viewport });
  page.on("pageerror", (error) => failures.push(`pageerror: ${error.message}`));
  page.on("console", (message) => {
    if (message.type() === "error") failures.push(`console: ${message.text()}`);
  });
  page.on("requestfailed", (request) => {
    failedRequests.push(`${request.method()} ${request.url()}: ${request.failure()?.errorText}`);
  });

  const response = await page.goto(url, { waitUntil: "networkidle", timeout });
  if (!response?.ok()) failures.push(`navigation: HTTP ${response?.status() ?? "no response"}`);
  if (readySelector) await page.locator(readySelector).waitFor({ state: "visible", timeout });

  const canvasCount = await page.locator("canvas").count();
  if (canvasCount !== 1) failures.push(`canvas: expected 1, found ${canvasCount}`);

  const canvas = page.locator("canvas").first();
  if (canvasCount) {
    const box = await canvas.boundingBox();
    if (!box || box.width < 2 || box.height < 2) failures.push("canvas: empty layout bounds");
  }

  await page.setViewportSize({ width: viewport.height, height: viewport.width });
  await page.waitForTimeout(100);
  if (failedRequests.length) failures.push(...failedRequests.map((item) => `request: ${item}`));

  if (failures.length) {
    console.error(failures.join("\n"));
    process.exitCode = 1;
  } else {
    console.log(JSON.stringify({ url, canvasCount, viewport, status: "passed" }, null, 2));
  }
} finally {
  await browser.close();
}
