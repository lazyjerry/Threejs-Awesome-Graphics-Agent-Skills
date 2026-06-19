import { execFile } from "node:child_process";
import { mkdir, mkdtemp, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { promisify } from "node:util";
import {
  captureRendererSnapshot,
} from "../skills/threejs-performance-profiling/scripts/capture-renderer-snapshot.js";

const execFileAsync = promisify(execFile);
const temporaryRoot = await mkdtemp(path.join(os.tmpdir(), "threejs-skill-scripts-"));
const gltfPath = path.join(temporaryRoot, "triangle.gltf");
await writeFile(gltfPath, JSON.stringify({
  asset: { version: "2.0", generator: "threejs-gamedev-mega-skills-test" },
  accessors: [{ count: 3, type: "VEC3", componentType: 5126 }],
  meshes: [{ primitives: [{ attributes: { POSITION: 0 } }] }],
  nodes: [{ mesh: 0 }],
  scenes: [{ nodes: [0] }],
  scene: 0,
}));

const inspector = await execFileAsync(process.execPath, [
  "skills/threejs-asset-pipeline/scripts/inspect-gltf.mjs",
  gltfPath,
]);
const report = JSON.parse(inspector.stdout);
if (
  report.meshes !== 1 ||
  report.primitives !== 1 ||
  report.estimatedTriangles !== 1
) {
  throw new Error("glTF inspector returned incorrect counts.");
}

const renderer = {
  info: {
    frame: 6,
    memory: { geometries: 2, textures: 3 },
    programs: [{}],
    render: { calls: 4, triangles: 5 },
  },
  getPixelRatio: () => 2,
  outputColorSpace: "srgb",
  shadowMap: { enabled: true },
  toneMapping: 1,
};
const snapshot = captureRendererSnapshot(renderer);
if (
  snapshot.render.calls !== 4 ||
  snapshot.memory.textures !== 3 ||
  snapshot.programs !== 1
) {
  throw new Error("Renderer snapshot helper returned incorrect values.");
}

const projectRoot = path.join(temporaryRoot, "three-project");
await mkdir(path.join(projectRoot, "src"), { recursive: true });
await writeFile(
  path.join(projectRoot, "package.json"),
  JSON.stringify({ dependencies: { three: "0.184.0" } }),
);
await writeFile(
  path.join(projectRoot, "src", "main.js"),
  `const renderer = new WebGLRenderer();
function onResize() {}
window.addEventListener("resize", onResize);
renderer.setAnimationLoop(render);
function destroy() {
  window.removeEventListener("resize", onResize);
  renderer.setAnimationLoop(null);
  renderer.dispose();
}
`,
);

const projectInspector = await execFileAsync(process.execPath, [
  "skills/threejs-testing-debugging/scripts/inspect-three-project.mjs",
  projectRoot,
]);
const projectReport = JSON.parse(projectInspector.stdout);
if (
  projectReport.relatedDependencies.three !== "0.184.0" ||
  projectReport.counts.renderers !== 1
) {
  throw new Error("Three.js project inspector returned incorrect values.");
}

for (const script of ["scan-disposal-risks.mjs", "scan-render-budget.mjs"]) {
  const result = await execFileAsync(process.execPath, [
    path.join("skills/threejs-testing-debugging/scripts", script),
    projectRoot,
  ]);
  const scan = JSON.parse(result.stdout);
  if (scan.findings.length !== 0) {
    throw new Error(`${script} reported a false positive for the clean fixture.`);
  }
}

console.log("Skill script tests passed.");
