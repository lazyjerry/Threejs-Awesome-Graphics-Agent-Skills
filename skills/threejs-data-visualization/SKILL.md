---
name: threejs-data-visualization
description: "Design and implement clear, precise, performant Three.js and React Three Fiber data scenes: points and point clouds, lines and curves, node-link graphs, scalar fields, scientific views, geospatial layers, large interactive datasets, picking, brushing, axes, legends, labels, annotations, streaming, aggregation, and LOD. Use when choosing Three.js versus deck.gl, SVG, DOM, canvas, Vega, or Plot, with clarity and data integrity prioritized over cinematic styling."
---

# Three.js Data Visualization

Start from the analytical question and encoding, not from a dramatic 3D scene.

## Workflow

1. State the question, audience, data shape, units, uncertainty, and required interactions.
2. Decide whether 3D adds useful spatial structure or merely occlusion and navigation cost.
3. Map fields intentionally to position, size, color, opacity, shape, and line width.
4. Choose Three.js, deck.gl, SVG/DOM/canvas, Vega, or Plot based on scale and interaction.
5. Establish normalized coordinates, precision strategy, camera, axes, legend, and selection state.
6. Use typed buffers, batching, chunking, aggregation, progressive loading, and LOD as scale requires.
7. Manage picking and labels in screen space.
8. Validate values, units, color semantics, missing data, clutter, performance, and accessibility.

## Rules

- Clarity beats cinematic style.
- Use sequential scales for ordered magnitude, diverging scales around a meaningful midpoint, and categorical palettes for unordered classes.
- Do not use a rainbow scale by default.
- Include units, legends, axes, or equivalent orientation when they are necessary to interpret values.
- Normalize large geospatial coordinates around a local origin or use a geospatial engine with deliberate precision handling.
- Use hover/focus or priority labels instead of showing every annotation.

See the runnable [`examples/point-cloud-colormap/index.html`](examples/point-cloud-colormap/index.html).

## References

- Scope and truthful encodings: [data-viz-scope-and-principles.md](references/data-viz-scope-and-principles.md)
- Buffer-based primitives: [points-lines-and-buffergeometry.md](references/points-lines-and-buffergeometry.md)
- Point-cloud scale and LOD: [large-point-clouds-and-lod.md](references/large-point-clouds-and-lod.md)
- Node-link layouts and interaction: [graph-network-visualization.md](references/graph-network-visualization.md)
- Color semantics and legends: [scalar-color-maps-and-legends.md](references/scalar-color-maps-and-legends.md)
- Axes and screen-space annotation: [axes-labels-and-annotations.md](references/axes-labels-and-annotations.md)
- Accurate interaction: [picking-selection-and-brushing.md](references/picking-selection-and-brushing.md)
- Geospatial precision: [geospatial-coordinates-and-precision.md](references/geospatial-coordinates-and-precision.md)
- Chunking and streaming: [progressive-loading-and-streaming.md](references/progressive-loading-and-streaming.md)
- Clutter control: [visual-clutter-and-readability.md](references/visual-clutter-and-readability.md)
- Platform choice: [choosing-threejs-vs-deckgl-vs-svg.md](references/choosing-threejs-vs-deckgl-vs-svg.md)
