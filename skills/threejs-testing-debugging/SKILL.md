---
name: threejs-testing-debugging
description: "Test, debug, and stabilize Three.js and React Three Fiber scenes, games, and interactive applications. Use for browser smoke tests, deterministic screenshots, visual regressions, console or shader failures, broken assets, resize/input/camera defects, context loss, memory leaks, performance regressions, WebGL frame inspection, or inspectability of simple NPC behavior, steering, paths, perception, and navigation."
---

# Three.js Testing and Debugging

Reproduce first, reduce uncertainty, and verify the fix against the original failure.

## Protocol

1. Reproduce the issue in a real browser and record the route, viewport, device scale, input sequence, and active state.
2. Capture console errors, page errors, failed requests, and shader diagnostics before editing.
3. Verify renderer, scene, camera, controls, animation loop, resize state, and loaded assets.
4. Add temporary visual helpers for the failing subsystem: axes, boxes, frusta, ray lines, paths, state labels, or timing overlays.
5. Test one hypothesis at a time, preferably in a reduced diagnostic scene.
6. Fix the earliest broken invariant rather than downstream symptoms.
7. Remove temporary diagnostics or place them behind an explicit debug flag.
8. Re-run smoke, screenshot, resize, context-loss, teardown, and performance checks relevant to the change.

## Evidence order

```text
console/network failure
→ lifecycle and scene invariants
→ visual helpers and state traces
→ frame/GPU capture
→ reduced reproduction
→ fix
→ regression checks
```

Use [`scripts/inspect-three-project.mjs`](scripts/inspect-three-project.mjs) for a quick project inventory, [`scripts/smoke-test-scene.mjs`](scripts/smoke-test-scene.mjs) for browser smoke checks when the current project has Playwright installed, [`scripts/scan-disposal-risks.mjs`](scripts/scan-disposal-risks.mjs) for lifecycle heuristics, and [`scripts/scan-render-budget.mjs`](scripts/scan-render-budget.mjs) for likely rendering-cost risks.

## Behavior and navigation boundary

Debug simple behavior; do not turn this skill into a game-AI curriculum.

- Expose every agent's current finite state in debug mode.
- Draw paths, navmesh regions, velocity, desired velocity, perception cones, and line-of-sight rays.
- Detect stuck agents from insufficient position progress over a time window.
- Log state transitions and path replans with reasons.
- Budget expensive sensing and pathfinding; stagger work instead of updating every agent every frame.
- Prefer readable FSMs and steering for small games when they are sufficient.

See the runnable [`examples/behavior-debug-overlay/index.html`](examples/behavior-debug-overlay/index.html).

## References

- Browser automation and smoke coverage: [browser-smoke-tests.md](references/browser-smoke-tests.md)
- Stable screenshot capture: [deterministic-screenshot-testing.md](references/deterministic-screenshot-testing.md)
- Baselines and visual diffs: [visual-regression-testing.md](references/visual-regression-testing.md)
- Shader and material failures: [shader-and-material-debugging.md](references/shader-and-material-debugging.md)
- Asset and network failures: [asset-loading-debugging.md](references/asset-loading-debugging.md)
- Camera, controls, and input: [camera-controls-input-debugging.md](references/camera-controls-input-debugging.md)
- Context loss, resize, and teardown: [context-loss-and-lifecycle-tests.md](references/context-loss-and-lifecycle-tests.md)
- Regression budgets: [performance-regression-gates.md](references/performance-regression-gates.md)
- Disposal and leak checks: [resource-disposal-and-memory-leaks.md](references/resource-disposal-and-memory-leaks.md)
- GPU frame inspection: [webgl-frame-debugging.md](references/webgl-frame-debugging.md)
- FSM, steering, paths, and perception: [behavior-navigation-debugging.md](references/behavior-navigation-debugging.md)
- Agent-oriented investigation discipline: [agent-debugging-protocol.md](references/agent-debugging-protocol.md)
