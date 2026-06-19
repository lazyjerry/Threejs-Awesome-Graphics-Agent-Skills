# Browser deployment and asset delivery

Test the production URL. A correct local scene can still fail after deployment
because hosting changes paths, origins, MIME types, caching, security policy,
worker resolution, and compression behavior.

## Delivery contract

Inventory every runtime dependency:

- GLB/glTF files and nested buffers or textures;
- HDR and ordinary textures, including KTX2/Basis;
- Draco, Meshopt, and transcoder/decoder files;
- workers, WASM modules, audio, fonts, and shader or data files;
- module imports, dynamic chunks, base paths, and CDN origins.

For each dependency, record its final deployed URL, expected MIME type, cache
policy, CORS requirements, versioning strategy, and failure fallback.

## Common deployment failures

### Paths and base URLs

Relative URLs resolve from the requesting document or module, not necessarily
the repository root. Verify nested glTF references, router subpaths, CDN
prefixes, case-sensitive filenames, and production bundler base settings.

### CORS and MIME types

Remote textures, HDRs, models, audio, workers, and WASM need compatible
cross-origin responses. Configure the asset host rather than retrying a blocked
request in the loader.

Serve modules, workers, GLB, KTX2, WASM, JSON, images, and compressed assets
with appropriate content types. WASM streaming compilation and strict module
loading are especially sensitive to incorrect server headers.

Common types include:

| Asset | Typical media type |
| --- | --- |
| JavaScript module or worker | `text/javascript` |
| glTF JSON | `model/gltf+json` |
| GLB | `model/gltf-binary` |
| KTX2 | `image/ktx2` |
| WebAssembly | `application/wasm` |
| JSON data | `application/json` |

Use `Content-Encoding` for gzip or Brotli transfer encoding; do not replace the
underlying asset media type with the compression format.

### Workers, decoders, and transcoders

Set deployed decoder/transcoder paths explicitly when the library requires it.
Test:

- Draco decoder JS/WASM files;
- KTX2/Basis transcoder JS/WASM files;
- Meshopt decoder availability and initialization;
- physics or custom worker URLs;
- CSP permission for worker sources, blob URLs, and WASM execution.

A model or texture compressed correctly can still fail because its helper
runtime was not deployed at the expected URL.

### Caching and service workers

Use content-hashed or versioned asset URLs for immutable assets. Coordinate
HTML, JavaScript, models, textures, and decoder versions so an old shell does
not request incompatible new assets.

When stale visuals survive deployment, inspect:

- CDN cache keys and invalidation;
- browser HTTP cache;
- service-worker cache names and update lifecycle;
- unversioned GLB, environment, or texture URLs;
- cached manifests that still point to retired files.

Do not add random query strings as a permanent substitute for a coherent asset
versioning policy.

### Content Security Policy

Review the production CSP for:

- module and CDN script origins;
- worker origins and `blob:` workers;
- WASM compilation policy;
- image, media, font, and connection origins;
- `data:` or `blob:` URLs used by generated textures, downloads, or helpers;
- inline bootstrap scripts or styles.

Prefer explicit allowed origins and bundled assets over weakening the policy
globally.

## Failure reporting

Connect loader failures, rejected imports, shader diagnostics, context loss,
and unsupported capabilities to useful diagnostics. Record the failed URL,
status, MIME type, loader stage, browser capability, and selected fallback.

Provide visible user states:

- loading with meaningful progress or activity;
- retry for recoverable network failures;
- reduced assets or alternate formats when practical;
- explicit unsupported-browser or unavailable-WebGL message;
- nonblank error state for shader, model, environment, or decoder failure.

## Deployment checklist

- Build and serve the production output, not the development server.
- Load every route from its final hosted base path.
- Test a hard refresh and a cache-cleared cold load.
- Test slow network, offline mode, and selected failed requests.
- Verify workers, WASM, Draco, Meshopt, and KTX2 paths.
- Inspect CORS, CSP, MIME, 404, and module errors in the browser console/network log.
- Test mobile browser startup, memory pressure, resize, and orientation changes.
- Verify service-worker update behavior when one is present.
- Confirm loading, retry, fallback, and unsupported-feature UI.

## Diagnosis table

| Symptom | Most likely checks |
| --- | --- |
| works locally, fails deployed | base path, filename case, MIME, CORS, CSP, worker URL, cache |
| black scene | console/shader failure, missing environment, failed GLB, camera, context loss |
| missing textures | nested path, CORS, MIME, color-space assignment, unsupported format |
| KTX2/Draco/Meshopt failure | decoder/transcoder deployment, WASM MIME, CSP, version mismatch |
| stale scene after release | CDN or service-worker cache, unversioned asset URL |
| worker works in dev only | production URL construction, CSP `worker-src`, missing bundled file |

Sources:

- [MDN CORS](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/CORS)
- [MDN MIME types](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/MIME_types)
- [MDN Content Security Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/CSP)
- [MDN Using Service Workers](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API/Using_Service_Workers)
- [MDN loading WebAssembly](https://developer.mozilla.org/en-US/docs/WebAssembly/Guides/Loading_and_running)
- [glTF 2.0 specification](https://registry.khronos.org/glTF/specs/2.0/glTF-2.0.html)
- [Three.js LoadingManager](https://threejs.org/docs/pages/LoadingManager.html)
- [Three.js KTX2Loader](https://threejs.org/docs/pages/KTX2Loader.html)
- [Three.js DRACOLoader](https://threejs.org/docs/pages/DRACOLoader.html)
