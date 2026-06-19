# SDF text and mesh text

Use SDF text when glyphs must participate in scene perspective, scale, fog, material response, and depth.

## Practical rules

- Preload fonts/glyphs needed for the first meaningful frame.
- Choose world-space size from the expected camera distance and minimum readable screen size.
- Use outline or backing only to preserve contrast, not as decorative noise.
- Limit per-frame text changes and avoid generating many unique styles.
- Dispose text instances and generated resources according to the library contract.
- Test Unicode, fallback fonts, right-to-left layout, wrapping, and missing glyphs when relevant.

Troika generates SDF glyphs and layout asynchronously, supports derived Three.js materials, and requires `dispose()` when a text instance is no longer used.

## Accessibility

Mesh text has no native DOM semantics. Mirror essential labels, instructions, values, or controls in accessible DOM. Decorative scene text may remain presentation-only.

Use sprites or texture text only for static/simple content where raster resolution and accessibility tradeoffs are acceptable.
