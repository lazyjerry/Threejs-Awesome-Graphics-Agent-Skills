# Deterministic screenshot testing

Visual tests are trustworthy only when uncontrolled variation is removed.

## Stabilize

- Pin browser, OS/container image, viewport, device scale factor, locale, timezone, and fonts.
- Fix random seeds and procedural inputs.
- Freeze or explicitly advance time and animation.
- Wait for assets, font layout, shader compilation, and the intended scene state.
- Disable cursor blinking, nonessential transitions, particles, video, and dynamic timestamps.
- Fix camera transform, controls target, exposure, quality tier, and renderer pixel ratio.
- Capture the canvas or stable region instead of unrelated browser chrome.
- Generate and compare baselines in the same environment.

Playwright's `toHaveScreenshot()` retries until consecutive screenshots stabilize, but it cannot make a nondeterministic scene deterministic. Use tolerances only for understood raster differences; do not hide large regressions with broad thresholds.

## Useful test hook

```js
window.__THREE_TEST__ = {
  ready: false,
  setSeed(seed) {},
  setTime(seconds) {},
  setCamera(pose) {},
};
```

Keep the hook small and development/test gated.
