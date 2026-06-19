# Visual hierarchy and readable labels

UI must remain legible across changing scene luminance, motion, and depth.

## Hierarchy

1. Current objective, critical status, and blocking error.
2. Primary action and immediate feedback.
3. Navigation/settings and contextual details.
4. Decorative or expert telemetry.

Use size, weight, grouping, position, and spacing before adding more color or glow.

## Labels

- Keep copy short and specific.
- Maintain contrast using adaptive scrims, outlines, or controlled placement.
- Avoid color-only state.
- Use consistent anchors and leader lines where association is ambiguous.
- Limit simultaneous labels with priority and disclosure.
- Keep world labels stable enough to read; avoid excessive camera-facing jitter.

| Failure | Response |
| --- | --- |
| labels blend into scene | scrim/outline, placement, contrast |
| dense overlap | priority, clustering, zoom threshold, hover |
| unclear association | leader line, anchor marker, proximity |
| UI competes with focal subject | simplify hierarchy and reserve safe region |
