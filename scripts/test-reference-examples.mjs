import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { ashMedium } from "../skills/threejs-procedural-vegetation/examples/structured-ash-growth/ash-preset.js";
import { compileAshTree } from "../skills/threejs-procedural-vegetation/examples/structured-ash-growth/tree-system.js";

function assertVector(actual, expected, label, epsilon = 1e-5) {
  assert.equal(actual.length, expected.length, `${label}: dimension mismatch`);
  for (let index = 0; index < expected.length; index += 1) {
    assert.ok(
      Math.abs(actual[index] - expected[index]) <= epsilon,
      `${label}[${index}]: expected ${expected[index]}, received ${actual[index]}`,
    );
  }
}

function testEzTreeAshParity() {
  const compiled = compileAshTree(ashMedium);
  const branchPosition = compiled.branchGeometry.getAttribute("position");
  const branchIndex = compiled.branchGeometry.getIndex();
  const leafPosition = compiled.leafGeometry.getAttribute("position");
  const leafIndex = compiled.leafGeometry.getIndex();

  assert.equal(branchPosition.count, 6639, "ez-tree Ash branch vertex count");
  assert.equal(branchIndex.count / 3, 9120, "ez-tree Ash branch triangle count");
  assert.equal(leafPosition.count, 21760, "ez-tree Ash leaf vertex count");
  assert.equal(leafIndex.count / 3, 10880, "ez-tree Ash leaf triangle count");
  assert.deepEqual(
    compiled.stats.branchJobs,
    [1, 8, 40, 160],
    "ez-tree Ash branch jobs by hierarchy level",
  );
  assert.deepEqual(
    compiled.stats.continuations,
    [1, 1, 8, 40],
    "ez-tree Ash continuation jobs by hierarchy level",
  );
  assert.deepEqual(
    compiled.stats.lateralChildren,
    [0, 7, 32, 120],
    "ez-tree Ash lateral jobs by hierarchy level",
  );
  assert.equal(compiled.stats.leafCards, 5440, "ez-tree Ash leaf card count");

  assertVector(
    compiled.branchGeometry.boundingBox.min.toArray(),
    [-23.327627182006836, 0, -19.976058959960938],
    "ez-tree Ash branch bounds minimum",
  );
  assertVector(
    compiled.branchGeometry.boundingBox.max.toArray(),
    [29.321561813354492, 80.29814147949219, 31.910205841064453],
    "ez-tree Ash branch bounds maximum",
  );
  assertVector(
    compiled.leafGeometry.boundingBox.min.toArray(),
    [-27.341381072998047, 15.998337745666504, -23.50076675415039],
    "ez-tree Ash leaf bounds minimum",
  );
  assertVector(
    compiled.leafGeometry.boundingBox.max.toArray(),
    [33.317710876464844, 83.69017028808594, 34.63191604614258],
    "ez-tree Ash leaf bounds maximum",
  );
}

testEzTreeAshParity();

async function assertCopiedExactly(sourcePath, copiedPath, label) {
  const [source, copied] = await Promise.all([
    readFile(new URL(`../${sourcePath}`, import.meta.url)),
    readFile(new URL(`../${copiedPath}`, import.meta.url)),
  ]);
  assert.deepEqual(copied, source, `${label}: copied bytes differ`);
}

await Promise.all([
  assertCopiedExactly(
    "source_materials/rain/shaders/rain.frag",
    "skills/threejs-temporal-surfaces/examples/refractive-window-rain/rain-window.frag",
    "window rain shader",
  ),
  assertCopiedExactly(
    "source_materials/threejs-silhouette-pom/ParallaxOcclusion.js",
    "skills/threejs-parallax-occlusion-mapping/examples/silhouette-relief/ParallaxOcclusion.js",
    "silhouette POM march",
  ),
  ...["ivy.ts", "flowers.ts", "leafTexture.ts", "wind.ts", "bvh.ts"].map((file) =>
    assertCopiedExactly(
      `source_materials/VegetationGeneratorThreeJS/src/${file}`,
      `skills/threejs-procedural-vegetation/examples/procedural-surface-ivy/source/${file}`,
      `procedural ivy ${file}`,
    )
  ),
  ...[
    "AmbientOcclusion",
    "Color",
    "Displacement",
    "NormalGL",
    "Roughness",
  ].map((suffix) =>
    assertCopiedExactly(
      `source_materials/GrassSystemThreeJS/public/Ground103_1K-JPG_${suffix}.jpg`,
      `skills/threejs-procedural-materials/assets/hybrid-soil-moss-surface/Ground103_1K-JPG_${suffix}.jpg`,
      `hybrid soil PBR ${suffix}`,
    )
  ),
  ...[
    "AmbientOcclusion",
    "Color",
    "NormalGL",
    "Roughness",
  ].map((suffix) =>
    assertCopiedExactly(
      `source_materials/GrassSystemThreeJS/public/Moss002_1K-JPG_${suffix}.jpg`,
      `skills/threejs-procedural-materials/assets/hybrid-soil-moss-surface/moss/Moss002_1K-JPG_${suffix}.jpg`,
      `procedural moss ${suffix}`,
    )
  ),
  assertCopiedExactly(
    "source_materials/GrassSystemThreeJS/public/old_rusty_car_2.glb",
    "dev/example-gallery/examples/threejs-precipitation-surfaces/snow-accumulation/assets/old_rusty_car_2.glb",
    "shared rusty car model",
  ),
]);
console.log("Reference example parity checks passed.");
