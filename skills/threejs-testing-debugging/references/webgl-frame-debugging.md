# WebGL frame debugging

Use a frame debugger such as Spector.js when the browser trace says the GPU/render path is implicated but application-level metrics are insufficient.

## Capture a representative frame

- Reproduce the expensive or incorrect state first.
- Avoid capturing a loading frame unless startup is the problem.
- Record renderer, browser, GPU identity when available, viewport, DPR, and quality tier.
- Inspect draw-call order, framebuffer changes, programs, uniforms, textures, blend/depth state, and attachment sizes.
- Find redundant clears, state churn, full-resolution passes, overdraw, and unexpected geometry.

`WEBGL_debug_renderer_info` may be unavailable for privacy reasons. Treat renderer strings as optional diagnostic metadata, not application logic.

## Questions

- Is the expected framebuffer bound?
- Is depth writing/testing correct for this draw?
- Are texture dimensions and formats plausible?
- Did one visual effect add many passes or large targets?
- Are identical objects failing to batch?
- Is a transparent full-screen surface causing avoidable overdraw?

Connect the captured GPU event back to the owning scene object or pass before editing.
