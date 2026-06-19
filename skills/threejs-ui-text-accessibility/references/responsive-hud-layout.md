# Responsive HUD layout

Size renderer and UI from a shared host, not independently from `window.innerWidth`.

## Layout inputs

- host `ResizeObserver`;
- CSS container queries or media queries;
- safe-area insets;
- dynamic viewport units on mobile;
- minimum touch target and readable text sizes;
- virtual keyboard and orientation changes;
- scene focal/interaction safe regions.

## Strategy

- Use layout regions instead of absolute coordinates for primary UI.
- Move secondary panels into drawers or sheets on narrow screens.
- Keep critical controls reachable by one hand when mobile use is expected.
- Clamp canvas DPR separately from CSS layout.
- Recompute camera projection and label placement after host resize.
- Test text zoom and browser zoom.

Avoid placing essential controls directly against device edges or over high-motion focal regions. If the HUD materially reduces scene space, update camera framing rather than allowing content to hide underneath it.
