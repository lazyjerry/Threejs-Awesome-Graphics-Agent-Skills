# Data visualization scope and principles

Use 3D when depth represents meaningful structure: physical space, volume, topology, simulation, terrain, molecular form, or a spatial relationship users need to explore.

Prefer 2D when the task is comparison, ranking, trend reading, exact lookup, or dense labeling without meaningful depth.

## Encoding discipline

- Position is usually the strongest quantitative channel.
- Size communicates magnitude but must define area/radius/volume semantics.
- Color needs a declared scale and missing-data treatment.
- Opacity is weak for exact comparison and creates blending/order issues.
- Shape is useful for a limited number of categories.
- Line width and point size have screen-space versus world-space implications.

Show units, transformations, filters, aggregation, and uncertainty. Do not imply precision the data does not contain.

## Questions before implementation

- What decision should the view support?
- Which dimensions are quantitative, ordinal, categorical, temporal, or spatial?
- What must be selectable or compared?
- What is the largest expected dataset?
- What does “no data” mean?
- Is 3D navigation acceptable for the audience?
