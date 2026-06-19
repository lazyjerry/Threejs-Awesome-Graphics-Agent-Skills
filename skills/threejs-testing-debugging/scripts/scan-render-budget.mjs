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
  ["uncapped-device-pixel-ratio", /setPixelRatio\s*\(\s*(?:window\.)?devicePixelRatio\s*\)/],
  ["large-shadow-map", /shadow\.mapSize\.(?:width|height)\s*=\s*(?:4096|8192)/],
  ["per-frame-allocation", /(?:function\s+animate|setAnimationLoop\s*\([^]*?)\bnew\s+(?:Vector[234]|Matrix[34]|Quaternion|Color|Raycaster)\b/],
  ["renderer-info-auto-reset-disabled", /renderer\.info\.autoReset\s*=\s*false/],
  ["many-explicit-render-calls", /renderer\.render\s*\(/g],
];

const findings = [];
for (const file of await collect(root)) {
  const text = await readFile(file, "utf8");
  for (const [rule, pattern] of rules) {
    pattern.lastIndex = 0;
    const matches = text.match(pattern) ?? [];
    const report = rule === "many-explicit-render-calls" ? matches.length > 3 : matches.length > 0;
    if (report) findings.push({ file: path.relative(root, file), rule, count: matches.length });
  }
}

console.log(JSON.stringify({ root, heuristic: true, findings }, null, 2));
if (findings.length) process.exitCode = 1;
