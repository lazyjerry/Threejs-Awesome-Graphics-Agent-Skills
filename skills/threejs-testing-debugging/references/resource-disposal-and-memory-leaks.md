# Resource disposal and memory leaks

JavaScript garbage collection does not automatically release every GPU or browser resource owned by a Three.js feature.

## Ownership audit

Track who creates and disposes:

- geometries, materials, textures, render targets, PMREM outputs;
- controls, loaders/workers, observers, listeners, timers;
- animation mixers and cached clips;
- audio nodes and media elements;
- post-processing passes and composers/pipelines;
- DOM overlays and test/debug helpers.

## Verification loop

1. Capture renderer and heap evidence after warm-up.
2. Mount, exercise, and tear down the feature repeatedly.
3. Force no assumptions about garbage collection timing; compare retained ownership and eventual trends.
4. Confirm `renderer.info.memory` settles where applicable.
5. Inspect detached DOM nodes, active listeners, and continuing callbacks.

`scene.clear()` removes children but does not dispose their GPU resources. Shared assets require reference-counted or centralized ownership; indiscriminate recursive disposal can break another feature.

Use [`../scripts/scan-disposal-risks.mjs`](../scripts/scan-disposal-risks.mjs) only as a heuristic. Manual ownership review remains authoritative.
