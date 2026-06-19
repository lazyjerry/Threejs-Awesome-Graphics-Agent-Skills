# Visual regression testing

## Baseline policy

- Name snapshots by meaningful state, not test order.
- Commit baselines and review changes as visual artifacts.
- Separate browser/platform baselines when rendering differences are unavoidable.
- Capture representative active, loading, error, pause, and narrow-screen states.
- Mask or style volatile regions rather than increasing the global threshold.
- Require an explicit reason when updating a baseline.

## Diagnose a diff

1. Compare actual, expected, and diff images.
2. Check whether the scene state, camera, assets, fonts, and renderer settings match.
3. Determine whether the change is intended, environmental, timing-related, or a defect.
4. Inspect numeric state when pixels alone cannot identify the cause.
5. Update the baseline only after reviewing the intended result.

| Diff pattern | Likely cause |
| --- | --- |
| whole image shifted | viewport, camera, font, or layout |
| edges shimmer | animation/time, AA, DPR, unstable geometry |
| global brightness change | color space, tone mapping, exposure, environment |
| objects missing | loading race, layers, culling, camera |
| small random clusters | particles, noise seed, temporal effect |

Visual tests complement behavioral assertions; they do not replace them.
