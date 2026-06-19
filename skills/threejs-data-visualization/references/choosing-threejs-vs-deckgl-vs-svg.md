# Choosing Three.js vs deck.gl vs SVG/DOM/canvas

| Tool | Prefer when |
| --- | --- |
| Three.js | custom 3D geometry/shaders, scene integration, bespoke interaction |
| deck.gl | large geospatial/data layers, built-in picking, aggregation, precision, layer lifecycle |
| SVG/DOM | modest mark counts, rich semantics, exact labels, document integration |
| Canvas 2D | many simple 2D marks with custom rendering |
| Vega/Vega-Lite | declarative statistical visualization and repeatable encodings |
| Observable Plot | concise exploratory 2D charts |

## Decision

- If 2D answers the question better, do not force Three.js.
- If geospatial scale/precision and standard layers dominate, prefer deck.gl.
- If the view needs custom volumetric or spatial rendering, Three.js is appropriate.
- Combine systems when responsibilities remain clear: Three.js/deck.gl for marks, DOM for controls/labels, a table/chart for exact values.

Consider team expertise, accessibility, export needs, testability, bundle size, and maintenance—not only peak mark count.
