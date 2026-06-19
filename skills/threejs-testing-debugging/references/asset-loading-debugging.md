# Asset loading debugging

## Capture

- URL, status, MIME type, redirects, CORS response, and cache behavior;
- loader and decoder versions;
- base URL and nested glTF resource paths;
- loading-manager errors and rejected promises;
- parsed scene counts, bounds, animation names, and material/texture assignments.

## Triage

| Symptom | Check |
| --- | --- |
| 404 in production only | deployment base path and filename case |
| decoder error | Draco/Meshopt/KTX2 worker and transcoder paths |
| model loads but invisible | bounds, scale, camera clipping, material transparency |
| wrong colors | texture color-space annotation and export settings |
| CORS failure | asset host response headers, not loader retries |
| intermittent stale asset | service worker/CDN cache versioning |

Always surface a visible loading error and retry/fallback path. Do not leave a promise rejection as a permanent blank canvas.

Create a reduced asset-inspection scene with neutral light, grid, axes, bounds, animation controls, and material names before debugging the asset inside the full application.
