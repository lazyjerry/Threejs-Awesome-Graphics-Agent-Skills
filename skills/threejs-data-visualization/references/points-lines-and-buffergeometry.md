# Points, lines, and BufferGeometry

Use `BufferGeometry` with typed attributes for large data-driven primitives.

## Points

- Store positions and encodings in typed arrays.
- Prefer one/few `Points` objects over one object per datum.
- Define whether point size is screen-space or perspective-scaled.
- Handle transparency carefully; dense alpha blending can obscure distributions and increase cost.
- Use custom shaders/TSL only when built-in `PointsMaterial` cannot express required size/color behavior.

## Lines

- `Line`, `LineSegments`, and line-loop primitives use geometry attributes.
- Platform line-width support can be constrained; use screen-space line geometry or tubes only when wider lines are required.
- Separate topology from presentation so filtered/selected segments can update efficiently.

Update buffer ranges deliberately and set `needsUpdate` only when data changes. Dispose replaced geometries/materials.

For static data, compute bounds once. For streamed data, update bounds or maintain chunk-level bounds for culling.
