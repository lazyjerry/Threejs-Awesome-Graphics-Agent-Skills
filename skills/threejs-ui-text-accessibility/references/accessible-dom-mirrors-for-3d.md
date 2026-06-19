# Accessible DOM mirrors for 3D

Canvas pixels do not provide a semantic accessibility tree. Mirror important scene interactions in DOM when practical.

## Mirror patterns

- A list or grid of selectable scene objects synchronized with 3D selection.
- A details region for the focused/selected object.
- Native controls for rotate, zoom, reset, inspect, start, pause, and restart.
- A text summary of dynamic status and objectives.
- A live region for infrequent high-value state changes, not frame-by-frame telemetry.

Keep one application state. DOM and 3D are two views/controllers of that state; neither should maintain a divergent private selection.

## Canvas fallback

Provide fallback content or adjacent instructions describing the experience and available alternatives. Ensure unsupported rendering, loading failure, and keyboard-only paths do not end at an unexplained blank canvas.

Do not mirror every decorative object. Prioritize tasks, controls, results, hazards, targets, and data values required to understand or complete the experience.
