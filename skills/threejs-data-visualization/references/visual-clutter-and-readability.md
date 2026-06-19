# Visual clutter and readability

More visible marks do not necessarily communicate more information.

## Reduce clutter

- filter or aggregate before adding transparency;
- use level-of-detail and zoom-dependent detail;
- suppress low-priority labels and edges;
- emphasize selection/context instead of everything;
- separate overview from detail views;
- provide search and direct lookup;
- use small multiples or linked 2D views when comparison is difficult in 3D.

## Camera

Use constrained orbit/map controls, sensible bounds, reset view, and stable up direction. Avoid cinematic camera motion that interferes with analysis.

## Depth

Use perspective only when depth is meaningful. Orthographic projection can improve size comparison. Provide depth cues—grid/reference planes, fog restraint, shadows only when informative, and selected-item emphasis.

Test with representative density, not a tiny demo dataset. A clean 1,000-point prototype may become illegible at production scale.
