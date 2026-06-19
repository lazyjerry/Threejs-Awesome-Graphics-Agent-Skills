# CSS2D labels and hotspots

`CSS2DRenderer` applies translation to DOM-backed objects and is useful for flat labels attached to scene nodes. It ignores ordinary meshes and point clouds.

## Pattern

- Render WebGL and CSS2D from the same camera after world matrices update.
- Size both renderers from the same host bounds.
- Place the CSS layer over the canvas and route pointer events intentionally.
- Keep label state and accessible name in the DOM element.
- Dispose by removing DOM elements and scene objects during teardown.

## Occlusion and clutter

CSS2D does not automatically solve scene occlusion. For important labels:

- project the anchor and hide points outside the clip volume;
- raycast against intentional occluders or compare depth when justified;
- apply distance/zoom thresholds;
- assign priority and suppress overlapping low-priority labels;
- prefer hover/focus disclosure for dense scenes.

The renderer documents a 100% browser/display zoom limitation. Test zoom behavior rather than assuming pixel-perfect alignment.
