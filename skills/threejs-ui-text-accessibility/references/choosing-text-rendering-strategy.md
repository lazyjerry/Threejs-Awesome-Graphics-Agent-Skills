# Choosing a text rendering strategy

| Strategy | Strengths | Constraints | Use for |
| --- | --- | --- | --- |
| DOM overlay | semantics, focus, selection, responsive CSS | separate from scene depth | HUD, menus, forms, inspector |
| CSS2D | DOM readability attached to Object3D | translation only; 100% zoom limitation | labels, hotspots |
| CSS3D | hierarchical CSS 3D transforms | no Three.js materials/geometries; depth compositing limits; 100% zoom limitation | transformed DOM panels |
| SDF mesh text | perspective, depth, lighting/material integration | font/SDF lifecycle; not inherently accessible | in-world text, titles |
| sprite/texture text | simple and cheap for static content | raster scaling and update cost | static billboards |

## Decision rules

- If the user must operate, select, copy, zoom, or hear the content, start with DOM.
- If text only needs to follow a 3D point, project to DOM or use CSS2D.
- If a panel truly needs CSS 3D transforms, test overlap and occlusion early.
- If text must be physically inside the rendered scene, use SDF text and pair important content with a semantic equivalent.
- Avoid repeatedly drawing dynamic text into canvas textures; it creates update, resolution, and accessibility costs.

R3F helpers such as Drei `Html` and `Text` are optional adapters to these same choices, not separate accessibility models.
