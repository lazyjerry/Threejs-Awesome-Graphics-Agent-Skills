# Scalar color maps and legends

## Choose the scale

- Sequential: low-to-high ordered magnitude.
- Diverging: values around a meaningful center such as zero or target.
- Categorical: unordered classes.
- Cyclic: wrapped quantities such as angle or phase.

Avoid rainbow maps by default because perceptual ordering and luminance are uneven.

## Domain

- Declare min/max or robust quantiles.
- Decide whether outliers clamp, extend, or use a separate marker.
- Represent missing/invalid values distinctly.
- Use log/symlog transforms only when the legend states the transformation.
- Keep the same domain across comparable views.

## Legend

Include units, endpoints, midpoint where relevant, tick values, missing-data meaning, and interaction/filter state. A legend is part of the visualization contract, not decoration.

D3 scales and scale-chromatic/ColorBrewer schemes are useful for constructing and documenting domains and palettes. Verify contrast and do not rely on hue alone for critical classification.
