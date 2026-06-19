---
name: threejs-ui-text-accessibility
description: "Design and implement interface, text, HUD, labels, hotspots, tooltips, annotations, loading/error states, and accessibility around or inside Three.js and React Three Fiber scenes. Use when choosing DOM overlays, CSS2D, CSS3D, SDF mesh text, sprites, or texture text; routing canvas/DOM input and focus; building keyboard-accessible controls or DOM mirrors; or supporting responsive layouts, reduced motion, contrast, and mobile-safe overlays."
---

# Three.js UI, Text, and Accessibility

Choose the most semantic interface layer that satisfies the visual requirement.

## Workflow

1. Inventory information, controls, world labels, and decorative text.
2. Classify each element as document UI, screen-space HUD, object-tracked label, transformed DOM panel, or in-world mesh text.
3. Prefer native DOM for semantic controls and readable content.
4. Define pointer routing, focus order, keyboard behavior, and canvas fallback before styling.
5. Add occlusion, priority, zoom thresholds, and collision handling for tracked labels.
6. Test bright/dark scenes, narrow screens, zoom, keyboard-only use, reduced motion, and error/loading states.
7. Keep an accessible DOM representation for important canvas-only interactions where practical.

## Strategy

| Need | Prefer |
| --- | --- |
| menus, forms, HUD, settings, status | DOM overlay |
| flat labels attached to objects | CSS2D or projected DOM |
| DOM panels with 3D transforms | CSS3D, accepting compositing limits |
| text participating in scene depth/perspective | SDF mesh text |
| simple static billboard | sprite or pre-rendered texture |

DOM is the default for accessibility, selection, responsive layout, and semantics. Do not move ordinary application UI into WebGL merely for visual consistency.

See the runnable [`examples/accessible-object-picker/index.html`](examples/accessible-object-picker/index.html).

## References

- Choose the rendering layer: [choosing-text-rendering-strategy.md](references/choosing-text-rendering-strategy.md)
- DOM HUD structure: [dom-overlay-hud-patterns.md](references/dom-overlay-hud-patterns.md)
- Object-tracked labels: [css2d-labels-and-hotspots.md](references/css2d-labels-and-hotspots.md)
- Transformed DOM: [css3d-panels-and-limitations.md](references/css3d-panels-and-limitations.md)
- In-world SDF text: [sdf-text-and-mesh-text.md](references/sdf-text-and-mesh-text.md)
- Canvas/DOM events and focus: [pointer-events-and-focus-routing.md](references/pointer-events-and-focus-routing.md)
- Semantic alternatives for 3D interactions: [accessible-dom-mirrors-for-3d.md](references/accessible-dom-mirrors-for-3d.md)
- ARIA and keyboard behavior: [aria-keyboard-patterns.md](references/aria-keyboard-patterns.md)
- Responsive integration: [responsive-hud-layout.md](references/responsive-hud-layout.md)
- Readability and hierarchy: [visual-hierarchy-and-readable-labels.md](references/visual-hierarchy-and-readable-labels.md)
- Motion, contrast, and multimodal access: [reduced-motion-and-accessibility.md](references/reduced-motion-and-accessibility.md)
