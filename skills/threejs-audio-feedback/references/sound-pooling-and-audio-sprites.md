# Sound pooling and audio sprites

Short effects often overlap. Reusing one currently playing source can cut off prior playback, while unlimited source creation causes noise and overhead.

## Pool

- Decode each asset once.
- Maintain a bounded number of concurrent voices per cue/category.
- Reuse idle voice wrappers; create fresh `AudioBufferSourceNode` instances as required by Web Audio.
- Choose a steal policy: oldest, quietest, farthest, or lowest priority.
- Apply small pitch/gain variation only within the intended sound language.

## Audio sprites

Use a sprite sheet when many short clips benefit from shared loading. Store named offsets/durations and test codec seek behavior. Sprites trade simpler requests for more complex authoring, seek, and cache invalidation.

| Symptom | Fix |
| --- | --- |
| rapid fire becomes painfully loud | concurrency cap and gain compression |
| old sound is cut off | increase pool or use steal policy |
| first playback hitches | preload/decode after unlock |
| sprite cue is misaligned | verify encoded timing and format |

Libraries such as howler.js can provide pooling/sprites and fallback behavior when the project benefits from that abstraction.
