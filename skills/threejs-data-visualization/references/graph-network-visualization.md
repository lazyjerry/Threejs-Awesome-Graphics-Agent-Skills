# Graph and network visualization

3D node-link graphs can reduce some overlap but add occlusion, navigation, and depth-perception cost.

## Build

- Compute layout separately from rendering, often in a worker.
- Batch nodes with instancing or points.
- Batch edges with line segments or purpose-built geometry.
- Maintain stable node identifiers across layout updates.
- Use selection adjacency/highlighting instead of showing all labels.
- Provide search, filtering, reset view, and a 2D/table alternative when exact lookup matters.

## Diagnose

| Problem | Response |
| --- | --- |
| hairball | filter, aggregate, cluster, edge bundling, focus neighborhood |
| layout never settles | bounded iterations and explicit freeze |
| picking is slow | spatial index, color/ID picking, narrowed candidates |
| depth is unreadable | depth cues, controlled camera, selected path emphasis |
| labels overwhelm | selected/hovered/high-priority only |

Do not imply geometric distance has meaning unless the layout defines it.
