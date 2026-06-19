# Geospatial coordinates and precision

Large Earth-centered or projected coordinates can exceed the precision suitable for direct single-precision GPU world positions.

## Strategies

- Recenter data around a local origin near the current view.
- Store high/low coordinate parts or use relative-to-eye techniques when necessary.
- Tile data and transform each tile from a local frame.
- Use a geospatial library such as deck.gl when projections, globe/mercator transitions, tiled loading, and precision are core requirements.
- Record the coordinate reference system and conversion path.

## Checks

- latitude/longitude order and units;
- altitude datum and scale;
- projection distortion;
- antimeridian and polar behavior;
- camera near/far ratio and depth precision;
- picking conversion back to source coordinates.

Do not treat longitude/latitude degrees as uniform Cartesian meters. For a small local site, project once and recenter. For regional/global scenes, use a deliberate geospatial stack.
