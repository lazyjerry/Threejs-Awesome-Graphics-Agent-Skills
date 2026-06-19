#!/usr/bin/env node

import { readFile, readdir, stat } from "node:fs/promises";
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
    else if (/\.(?:[cm]?[jt]sx?|html)$/.test(entry.name)) files.push(target);
  }
  return files;
}

async function optionalJson(file) {
  try {
    return JSON.parse(await readFile(file, "utf8"));
  } catch {
    return null;
  }
}

if (!(await stat(root)).isDirectory()) throw new Error(`Not a directory: ${root}`);

const packageJson = await optionalJson(path.join(root, "package.json"));
const files = await collect(root);
const patterns = {
  renderers: /\b(?:WebGLRenderer|WebGPURenderer|Canvas)\b/g,
  animationLoops: /\b(?:setAnimationLoop|requestAnimationFrame)\s*\(/g,
  controls: /\b(?:OrbitControls|MapControls|PointerLockControls|FlyControls)\b/g,
  loaders: /\b(?:GLTFLoader|TextureLoader|KTX2Loader|DRACOLoader|FileLoader)\b/g,
  listeners: /\.addEventListener\s*\(/g,
  disposals: /\.dispose\s*\(/g,
  postprocessing: /\b(?:EffectComposer|RenderPipeline|PostProcessing)\b/g,
  physics: /\b(?:Rapier|Cannon|Ammo|Oimo)\b/gi,
};
const counts = Object.fromEntries(Object.keys(patterns).map((key) => [key, 0]));
const matchingFiles = Object.fromEntries(Object.keys(patterns).map((key) => [key, []]));

for (const file of files) {
  const text = await readFile(file, "utf8");
  for (const [name, pattern] of Object.entries(patterns)) {
    pattern.lastIndex = 0;
    const matches = text.match(pattern) ?? [];
    counts[name] += matches.length;
    if (matches.length) matchingFiles[name].push(path.relative(root, file));
  }
}

const dependencies = {
  ...packageJson?.dependencies,
  ...packageJson?.devDependencies,
};
const relatedDependencies = Object.fromEntries(
  Object.entries(dependencies ?? {}).filter(([name]) =>
    /three|react-three|rapier|postprocessing|playwright|vitest|jest|cypress/i.test(name),
  ),
);

console.log(JSON.stringify({
  root,
  filesScanned: files.length,
  relatedDependencies,
  counts,
  matchingFiles,
}, null, 2));
