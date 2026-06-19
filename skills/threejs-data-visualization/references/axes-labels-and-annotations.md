# Axes, labels, and annotations

Axes provide orientation only when their coordinate system, units, direction, and scale are clear.

## Axes

- Keep ticks and labels screen-readable.
- Use a limited number of meaningful ticks.
- State transformed or normalized units.
- Preserve a stable origin/reference plane.
- Avoid dense 3D grids that become visual noise.

## Labels

- Project important labels to DOM when semantic readability matters.
- Use priority, zoom thresholds, collision suppression, and hover/focus disclosure.
- Keep a selected annotation visible unless occlusion conveys essential meaning.
- Add leader lines when anchor association is ambiguous.

## Tooltips

Show exact values, units, series/category, timestamp, uncertainty, and selection state as relevant. Keep tooltip position within the viewport and keyboard-accessible through a DOM mirror.

Annotations should explain patterns, thresholds, anomalies, or events—not repeat every visible value.
