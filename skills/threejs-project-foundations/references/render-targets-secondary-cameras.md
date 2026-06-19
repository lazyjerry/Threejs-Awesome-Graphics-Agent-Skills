# Render targets and secondary cameras

Use offscreen rendering when another view of a scene must become a texture or
buffer. Common jobs include:

- live screens, security monitors, rear-view mirrors, and picture-in-picture;
- minimaps and secondary camera views;
- portals and scene-inside-scene surfaces;
- planar mirrors and constrained reflection/refraction views;
- depth, normal, object-ID, mask, shadow, and post-processing debug views.

## Pipeline

1. Define the visual consumer and required signal: color, depth, normals, IDs,
   masks, or another intermediate buffer.
2. Create a secondary camera or special render pass with an intentional
   frustum, aspect ratio, layer mask, and update policy.
3. Allocate a render target at the lowest resolution and feature set that
   preserves the intended result.
4. Save renderer state that the pass changes.
5. Bind the target, render the scene or selected subset, then restore the
   previous target, viewport, scissor, clear state, camera layers, visibility,
   and other modified state.
6. Consume the target texture in a material, HUD, portal surface, reflection
   helper, post-process pass, or diagnostic panel.
7. Resize, suspend, reset, and dispose the target with its owner.

Do not sample a texture from the same target currently being written. Use
separate source/destination targets or ping-pong buffers when a pass needs its
previous output.

## Portals, mirrors, and recursion

For a portal, derive the secondary camera transform from the viewer and the
relationship between entrance and exit transforms. Match projection and
clipping deliberately. Hide or exclude the destination surface when needed to
avoid feedback.

For a planar mirror, reflect the camera across the mirror plane and use an
oblique clip plane or equivalent strategy so geometry behind the mirror does
not leak into the result. A general cubemap is not a replacement for a true
planar reflection when the surface must preserve perspective.

Prevent recursive rendering:

- exclude the rendering surface with layers or temporary visibility;
- cap recursion depth for portal chains;
- never let a mirror render an unbounded view of itself;
- restore temporary visibility and material changes even when rendering fails.

## Cost and quality

Every refreshed target can add another scene render plus target memory and
bandwidth. Control cost independently:

- lower mirror, minimap, monitor, and debug-view resolution;
- update static captures on demand and slow views at a reduced cadence;
- render only relevant layers or simplified proxy scenes;
- disable unnecessary depth, stencil, mipmaps, multisampling, or alpha;
- use texture filtering and mipmaps that match how the result is viewed;
- avoid multiplying target size by the main canvas DPR without measurement.

Use dynamic cube captures selectively. Six cube faces can cost roughly six
additional views per update before filtering. Static environment maps or
infrequent probe updates are usually better for broad reflective coverage.

## Failure diagnosis

| Symptom | Check |
| --- | --- |
| output is upside down or mirrored | texture orientation, UVs, camera reflection transform |
| stretched or clipped view | target aspect, camera projection, viewport, scissor |
| blurry result | target resolution, DPR assumption, filtering, mip generation |
| wrong color or contrast | target color space, tone-mapping location, double output conversion |
| recursive mirror or portal | surface exclusion, recursion limit, read/write feedback |
| missing depth behavior | depth attachment, depth texture format, camera near/far consistency |
| stale or expensive view | invalidation policy and update cadence |
| later renders are corrupted | renderer state was not fully restored |

Sources:

- [Three.js render-target manual](https://threejs.org/manual/en/rendertargets.html)
- [WebGLRenderTarget](https://threejs.org/docs/pages/WebGLRenderTarget.html)
- [CubeCamera](https://threejs.org/docs/pages/CubeCamera.html)
- [Reflector add-on](https://threejs.org/docs/pages/Reflector.html)

