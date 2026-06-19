# Progressive loading and streaming

Show useful coarse structure early and refine without blocking interaction.

## Pipeline

```text
fetch chunk
→ parse/decode worker
→ validate/schema-map
→ build typed arrays
→ bounded GPU upload
→ reveal/refine
```

## Rules

- Cancel obsolete requests after filter/view changes.
- Limit concurrent fetch, decode, and upload work.
- Keep chunk identity and bounds.
- Validate counts/ranges before allocation.
- Surface progress, partial status, failure, and retry.
- Retain a memory budget and evict least-useful chunks.
- Avoid replacing the entire scene graph for every arriving chunk.

`loaders.gl` can provide streaming loaders for many data formats; deck.gl layers can manage substantial data-flow concerns. Raw Three.js gives maximum control but makes the application responsible for cancellation, workers, chunk ownership, LOD, and picking.

Test slow network, malformed chunks, partial failure, and rapid camera/filter changes.
