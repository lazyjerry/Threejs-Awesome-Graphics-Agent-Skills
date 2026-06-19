# Large point clouds and LOD

Do not load and draw every point at full fidelity merely because the GPU accepts the buffer.

## Scale strategy

- Partition spatially into chunks, tiles, or an octree.
- Load coarse representatives first.
- Refine by projected screen-space error, distance, and interaction priority.
- Cap visible points and upload work per frame.
- Cull chunks against the frustum and optional clipping regions.
- Aggregate dense distant data instead of shrinking points into noise.

## Budgets

Track:

- transferred and decoded bytes;
- resident CPU/GPU memory;
- visible points and draw calls;
- upload/decode time;
- picking cost;
- frame time during camera movement.

Potree is purpose-built for large point-cloud viewing; deck.gl provides point-cloud layers and data-layer management. Use raw Three.js when custom rendering/control justifies owning streaming, LOD, picking, and precision.

Avoid rebuilding huge typed arrays for every filter. Prefer masks, chunk selection, or worker-built replacement buffers.
