# Performance regression gates

Use stable scenarios and compare frame time distributions, not a single FPS reading.

## Record

- browser, device/GPU, viewport, DPR, quality tier, and commit;
- startup, steady, stress, and teardown states;
- median and high-percentile frame time;
- renderer calls, triangles, points, lines, textures, and programs;
- JS heap trend where measurable;
- loading duration and transferred bytes;
- long tasks and shader compilation stalls.

## Gate design

- Gate metrics that map to a product budget.
- Allow explicit device/quality-tier baselines.
- Warm up before sampling but retain a separate startup measurement.
- Fail on sustained regression, not isolated CI noise.
- Store the evidence artifact with the test result.
- Investigate changed scene content before assuming engine overhead.

| Gate | Example intent |
| --- | --- |
| renderer calls | catch accidental material/object fragmentation |
| frame-time percentile | catch recurring hitching |
| heap after repeated restart | catch retained ownership |
| startup ready time | catch asset/shader-loading regressions |

Coordinate deep profiling with `$threejs-performance-profiling`.
