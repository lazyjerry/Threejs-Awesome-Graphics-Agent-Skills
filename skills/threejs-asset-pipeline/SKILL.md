---
name: threejs-asset-pipeline
description: "Design and implement Three.js asset pipelines for glTF/GLB models, textures, HDR environments, animation clips, compression, progressive loading, hosted delivery, CORS, MIME types, CSP, caching, workers, WASM decoders, cloning, validation, and disposal. Use when importing, optimizing, or deploying 3D assets; fixing scale, material, texture, path, cache, decoder, or production-hosting failures; reducing download or GPU memory cost; building loading UX; or managing dynamic asset lifetimes."
---

# Three.js Asset Pipeline

Treat assets as runtime systems with budgets and ownership, not files that happen to load.

## Workflow

1. Inventory formats, byte sizes, texture dimensions, animation clips, triangle counts, material count, and reuse frequency.
2. Prefer glTF 2.0/GLB for delivered scenes and models.
3. Normalize coordinate assumptions, scale, pivot, naming, and collision proxies at the asset boundary.
4. Apply compression only after measuring transfer, decode, GPU memory, and visual cost.
5. Design critical, deferred, and optional loading tiers.
6. Verify final deployed URLs, MIME types, CORS, CSP, cache/version policy,
   worker paths, and decoder/transcoder delivery.
7. Define cache and clone semantics. Shared assets must not be accidentally mutated or disposed by one consumer.
8. Provide visible loading, failure, and fallback states.
9. Dispose only when the final owner releases a resource.

Run [`scripts/inspect-gltf.mjs`](scripts/inspect-gltf.mjs) with
`node scripts/inspect-gltf.mjs <model.gltf|model.glb>` for a deterministic
container, primitive, triangle, material, texture, animation, skin, and
extension inventory before optimization.

## Quality rules

- Annotate color textures correctly; do not mark normal, roughness, metalness, or AO data as sRGB.
- Prefer KTX2/Basis for GPU texture compression when the target matrix supports it.
- Evaluate Meshopt and Draco based on asset profile and decode constraints; do not stack transforms blindly.
- Keep collision geometry separate from render geometry.
- Reuse geometries, materials, and textures deliberately.
- Avoid cloning a loaded scene when consumers actually need independent skeletons, materials, or mutable state; choose the appropriate clone strategy.
- Test assets in isolation before diagnosing the renderer.

Read [references/loading-compression.md](references/loading-compression.md) for delivery decisions. Read [references/ownership-disposal.md](references/ownership-disposal.md) for lifetime rules. Read [references/browser-deployment-delivery.md](references/browser-deployment-delivery.md) for production URLs, CORS, MIME, CSP, service-worker caching, workers, WASM, and hosted failure states.
