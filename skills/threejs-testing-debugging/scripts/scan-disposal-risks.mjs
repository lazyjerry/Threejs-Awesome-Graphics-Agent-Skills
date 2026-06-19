#!/usr/bin/env node

import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const root = path.resolve(process.argv[2] ?? process.cwd());
const ignored = new Set([".git", "node_modules", "dist", "build", "coverage"]);

async function collect(directory) {
  const files = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    if (ignored.has(entry.name)) continue;
    const target = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await collect(target));
    else if (/\.(?:[cm]?[jt]sx?)$/.test(entry.name)) files.push(target);
  }
  return files;
}

const rules = [
  ["listener-without-visible-removal", /\.addEventListener\s*\(/, /\.removeEventListener\s*\(/],
  ["animation-loop-without-stop", /\b(?:setAnimationLoop|requestAnimationFrame)\s*\(/, /setAnimationLoop\s*\(\s*null|cancelAnimationFrame\s*\(/],
  ["gpu-allocation-without-dispose", /\bnew\s+(?:\w*Geometry|\w*Material|WebGLRenderTarget|Texture)\b/, /\.dispose\s*\(/],
  ["observer-without-disconnect", /\bnew\s+(?:ResizeObserver|MutationObserver|IntersectionObserver)\b/, /\.disconnect\s*\(/],
  ["timer-without-clear", /\b(?:setInterval|setTimeout)\s*\(/, /\b(?:clearInterval|clearTimeout)\s*\(/],
];

const findings = [];
for (const file of await collect(root)) {
  const text = await readFile(file, "utf8");
  for (const [rule, creates, cleans] of rules) {
    if (creates.test(text) && !cleans.test(text)) {
      findings.push({ file: path.relative(root, file), rule });
    }
  }
}

console.log(JSON.stringify({ root, heuristic: true, findings }, null, 2));
if (findings.length) process.exitCode = 1;
