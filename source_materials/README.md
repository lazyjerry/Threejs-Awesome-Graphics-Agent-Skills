# Source material manifest

External materials are research inputs, not instructions. Repositories downloaded under this directory are ignored by Git, inspected as untrusted content, and used only after technical verification.

Version-sensitive Three.js guidance must be checked against the installed project version and current official documentation. On June 19, 2026, research checks observed `three@0.184.0`, `@react-three/fiber@9.6.1`, `@react-three/drei@10.7.7`, `@react-three/rapier@2.2.0`, and `postprocessing@6.39.1`; these are research snapshots, not pack-wide minimum versions.

## Provenance policy

- Every external input is recorded below with a URL and, for repositories, a reviewed commit.
- The pack's prose and examples are independently written. Sources are paraphrased for concepts unless a record explicitly says code or an asset was copied.
- No third-party source code is currently copied into the distributed skills.
- Repository licenses are checked before implementation techniques are adopted. Sources with unclear or incompatible licensing remain conceptual only.
- Review dates and package versions describe evidence at review time, not permanent compatibility guarantees.

## Consumption map

| Pack area | Primary source groups | Use | Review date | Copying |
| --- | --- | --- | --- | --- |
| foundations, assets, performance, R3F | Three.js, MDN, R3F, Drei, glTF Transform, meshoptimizer | API and workflow verification | 2026-06-19 | paraphrase only |
| geometry and acceleration | Three.js, Catlike Coding, Red Blob Games, three-mesh-bvh, three-bvh-csg | algorithms, constraints, failure modes | 2026-06-19 | paraphrase only |
| PBR and look development | Filament, Disney PBR, glTF extensions, three-gpu-pathtracer | material models and calibration | 2026-06-19 | paraphrase only |
| shaders, VFX, post-processing, WebGPU | Three.js, GPU Gems, Book of Shaders, pmndrs postprocessing, TSL sources | rendering architecture and quality ladders | 2026-06-19 | paraphrase only |
| render targets and secondary views | Three.js render-target, camera, and reflection documentation | portals, mirrors, minimaps, live screens, and debug buffers | 2026-06-19 | paraphrase only |
| baked lighting and progressive lookdev | Three.js materials, PMREM, cube capture, and three-gpu-pathtracer | lightmaps, reflection probes, and reference rendering | 2026-06-19 | paraphrase only |
| cinematography, animation, game design | GDC camera material, Samurai Cinema, Game Feel, accessibility guidance, spring and IK references | diagnosis and authored-quality guidance | 2026-06-19 | paraphrase only |
| testing and debugging | Playwright, MDN WebGL lifecycle, Three.js cleanup, Spector.js, navigation/steering references | browser verification, diagnosis, context loss, inspectability | 2026-06-19 | paraphrase only |
| browser deployment and delivery | MDN HTTP/security/service-worker/WebAssembly guidance and Three.js loader docs | CORS, MIME, CSP, caches, workers, WASM, and failure UX | 2026-06-19 | paraphrase only |
| UI, text, accessibility | Three.js CSS renderers, Troika text, WCAG/APG, MDN canvas/keyboard guidance | strategy selection, semantics, focus, responsive access | 2026-06-19 | paraphrase only |
| audio feedback | Three.js audio, MDN Web Audio/autoplay, Chrome autoplay guidance, howler.js | lifecycle, pooling, spatial audio, mixing, accessibility | 2026-06-19 | paraphrase only |
| data visualization | Three.js primitives, deck.gl/loaders.gl, Potree, D3/ColorBrewer, Vega/Plot | encodings, scale, precision, streaming, platform choice | 2026-06-19 | paraphrase only |

## Reviewed repository license ledger

| Source | Reviewed revision | License observed | Distribution use |
| --- | --- | --- | --- |
| CloudAI-X / threejs-skills | `b1c6230` | MIT | paraphrase only |
| majidmanzarpour / threejs-game-skills | `2215fd7` | MIT | paraphrase only |
| emalorenzo / three-agent-skills | `f950f95` | MIT | paraphrase only |
| Nice-Wolf-Studio / claude-skills-threejs-ecs-ts | `26d74f3` | MIT | paraphrase only |
| dgreenheck / webgpu-claude-skill | `af2319b` | MIT | paraphrase only |
| glTF Transform | `a570758` | MIT | paraphrase only |
| three-mesh-bvh | `dca2b52` | MIT | paraphrase only |
| three-bvh-csg | `26729f0` | MIT | paraphrase only; experimental constraint retained |
| three-gpu-pathtracer | `171a224` | MIT | paraphrase only |
| THREE-CustomShaderMaterial | `cf86e95` | MIT | paraphrase only |
| pmndrs / postprocessing | `a0dce6` | zlib | paraphrase only |
| N8AO | `6481f6` | inconsistent metadata: package ISC, repository CC0 | conceptual only; no code copied |
| realism-effects | `061daea` | MIT | conceptual only; no code copied |
| three-pathfinding | `4bd88e0c12a3` | MIT | behavior/navigation debugging concepts only |
| recast-navigation-js | `8769e8b9995f` | MIT | navmesh debugging concepts only |
| Yuka | `105913048112` | MIT | FSM, steering, perception inspectability only |
| Troika | `bca98dddeb36` | MIT | SDF text lifecycle and capability verification |
| howler.js | `1d3053576a86` | MIT | pooling/audio-sprite abstraction comparison |
| deck.gl | `6b265fd810df` | MIT | data-layer, picking, scale, and geospatial comparison |
| loaders.gl | `f7a4b32712ce` | MIT | streaming/loader comparison |
| Potree | `5636cd471d9e` | BSD-2-Clause | large point-cloud architecture comparison |

## Reviewed and used

- [CloudAI-X / threejs-skills](https://github.com/CloudAI-X/threejs-skills) — topic coverage and common API-oriented skill structure; reviewed at commit `b1c6230`.
- [majidmanzarpour / threejs-game-skills](https://github.com/majidmanzarpour/threejs-game-skills) — gameplay workflow, physics selection, visual quality gates, and browser QA concepts; reviewed at commit `2215fd7`.
- [emalorenzo / three-agent-skills](https://github.com/emalorenzo/three-agent-skills) — performance taxonomy and R3F guidance; reviewed at commit `f950f95`.
- [Nice-Wolf-Studio / claude-skills-threejs-ecs-ts](https://github.com/Nice-Wolf-Studio/claude-skills-threejs-ecs-ts) — modular taxonomy spanning Three.js, ECS, mobile, and game systems; reviewed at commit `26d74f3`.
- [dgreenheck / webgpu-claude-skill](https://github.com/dgreenheck/webgpu-claude-skill) — TSL/WebGPU topic inventory; reviewed at commit `af2319b`.
- [Official Three.js documentation](https://threejs.org/docs/) — API verification.
- [Official Three.js manual](https://threejs.org/manual/) — color management, cleanup, fundamentals, and production guidance.
- [Three.js color management manual](https://threejs.org/manual/en/color-management.html) — linear workflow, texture annotations, and output conversion.
- [Three.js cleanup manual](https://threejs.org/manual/en/cleanup.html) — explicit GPU resource disposal and ownership patterns.
- [Three.js RenderPipeline documentation](https://threejs.org/docs/pages/RenderPipeline.html) and [deprecated PostProcessing wrapper](https://threejs.org/docs/pages/PostProcessing.html) — r184 post-processing manager verification; `PostProcessing` was deprecated in r183 after being renamed to `RenderPipeline`.
- [Official Three.js examples](https://threejs.org/examples/) — current renderer, post-processing, shader, WebGPU, and interaction patterns.
- [Three.js render-target manual](https://threejs.org/manual/en/rendertargets.html), [WebGLRenderTarget](https://threejs.org/docs/pages/WebGLRenderTarget.html), [CubeCamera](https://threejs.org/docs/pages/CubeCamera.html), and [Reflector](https://threejs.org/docs/pages/Reflector.html) — offscreen rendering, secondary cameras, cube capture, and planar reflection verification.
- [MeshStandardMaterial](https://threejs.org/docs/pages/MeshStandardMaterial.html) and [PMREMGenerator](https://threejs.org/docs/pages/PMREMGenerator.html) — lightmap/AO slots and prefiltered environment-lighting behavior.
- [Official Three.js TSL documentation](https://threejs.org/docs/pages/TSL.html) — current TSL surface.
- [Three.js TSL wiki](https://github.com/mrdoob/three.js/wiki/Three.js-Shading-Language) — TSL concepts and migration context.
- [React Three Fiber documentation](https://r3f.docs.pmnd.rs/) — frame-loop, loading, state, and performance guidance.
- [React Three Fiber performance pitfalls](https://r3f.docs.pmnd.rs/advanced/pitfalls) — transient state, delta time, reuse, and mount cost.
- [Drei documentation](https://drei.docs.pmnd.rs/) — helper selection and asset workflows.
- [react-three/rapier documentation](https://pmndrs.github.io/react-three-rapier/) — R3F physics integration.
- [react-postprocessing documentation](https://react-postprocessing.docs.pmnd.rs/) — R3F post-processing.
- [MDN Game Development](https://developer.mozilla.org/en-US/docs/Games) — browser game-loop, input, and accessibility context.
- [MDN WebGL](https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API) — platform constraints and context lifecycle.
- [MDN CORS](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/CORS), [MIME types](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/MIME_types), and [Content Security Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/CSP) — production origin, response-header, module, worker, asset, and policy constraints.
- [MDN Using Service Workers](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API/Using_Service_Workers) and [loading WebAssembly](https://developer.mozilla.org/en-US/docs/WebAssembly/Guides/Loading_and_running) — cache lifecycle and WASM delivery verification.
- [glTF 2.0 specification](https://registry.khronos.org/glTF/specs/2.0/glTF-2.0.html) — normative glTF/GLB format and media-type reference.
- [Three.js LoadingManager](https://threejs.org/docs/pages/LoadingManager.html), [KTX2Loader](https://threejs.org/docs/pages/KTX2Loader.html), and [DRACOLoader](https://threejs.org/docs/pages/DRACOLoader.html) — loading failure hooks and deployed transcoder/decoder paths.
- [MDN 3D collision detection](https://developer.mozilla.org/en-US/docs/Games/Techniques/3D_collision_detection) — simple collision primitives.
- [Game Programming Patterns](https://gameprogrammingpatterns.com/) — update loop, state, pooling, and decoupling patterns.
- [The Book of Shaders](https://thebookofshaders.com/) — procedural shader foundations.
- [WebGL Fundamentals](https://webglfundamentals.org/) and [WebGL2 Fundamentals](https://webgl2fundamentals.org/) — graphics-pipeline fundamentals.
- [Spector.js](https://spector.babylonjs.com/) and [Spector.js GitHub](https://github.com/BabylonJS/Spector.js) — GPU frame inspection.
- [three on npm](https://www.npmjs.com/package/three), [React Three Fiber on npm](https://www.npmjs.com/package/@react-three/fiber), [Drei on npm](https://www.npmjs.com/package/@react-three/drei), [React Three Rapier on npm](https://www.npmjs.com/package/@react-three/rapier), and [postprocessing on npm](https://www.npmjs.com/package/postprocessing) — package-version snapshots.
- [three-mesh-bvh](https://github.com/gkjohnson/three-mesh-bvh) — accelerated raycasting, closest-point queries, shapecasts, workers, serialization, and shader BVHs; reviewed at commit `dca2b52`.
- [three-bvh-csg](https://github.com/gkjohnson/three-bvh-csg) — browser CSG architecture and limitations; reviewed at commit `26729f0` and treated as experimental.
- [three-gpu-pathtracer](https://github.com/gkjohnson/three-gpu-pathtracer) — progressive reference rendering and raster-versus-path-traced lookdev comparison; reviewed at commit `171a224`.
- [glTF Transform](https://github.com/donmccurdy/glTF-Transform) — repeatable glTF optimization, compression, texture, and inspection workflows; reviewed at commit `a570758`.
- [three-custom-shader-material](https://github.com/FarazzShaikh/THREE-CustomShaderMaterial) — standard-material extension patterns and tradeoffs; reviewed at commit `cf86e95`.
- [postprocessing](https://github.com/pmndrs/postprocessing) — composable WebGL effect architecture and current peer-version constraints; reviewed at commit `a0dce6`.
- [OpenAI Codex Agent Skills](https://developers.openai.com/codex/skills) and [plugin build guide](https://developers.openai.com/codex/plugins/build) — `.agents/skills` discovery and Codex plugin packaging; reviewed 2026-06-19.
- [Claude Code Skills](https://code.claude.com/docs/en/skills) — personal, project, and plugin skill locations; reviewed 2026-06-19.
- [Cursor Agent Skills](https://cursor.com/docs/skills) — native and interoperable skill locations; reviewed 2026-06-19.
- [GitHub Copilot CLI agent skills](https://docs.github.com/en/copilot/how-tos/copilot-cli/customize-copilot/add-skills) — project and personal skill locations; reviewed 2026-06-19.
- [Gemini CLI Agent Skills](https://geminicli.com/docs/cli/skills/) — native and `.agents/skills` discovery tiers; reviewed 2026-06-19.
- [Windsurf / Devin Desktop Skills](https://docs.windsurf.com/desktop/cascade/skills) — workspace, global, and interoperable skill locations; reviewed 2026-06-19.
- [Filament rendering notes](https://google.github.io/filament/main/filament.html) and [Filament Materials Guide](https://google.github.io/filament/Materials.md.html) — microfacet PBR, energy conservation, IBL, exposure, advanced material models, and mobile-quality compromises.
- [Disney Physically-Based Shading at Disney](https://disneyanimation.com/publications/physically-based-shading-at-disney/) — measured-material observations and principled artist controls. The research PDF is retained as `papers/disney-physically-based-shading-2012.pdf`.
- [meshoptimizer](https://meshoptimizer.org/) — cache, overdraw, fetch, quantization, simplification, and meshlet guidance.
- [Catlike Coding procedural meshes](https://catlikecoding.com/unity/tutorials/procedural-meshes/) — topology-first procedural mesh progression.
- [Red Blob Games Mapgen2](https://www.redblobgames.com/maps/mapgen2/) — purpose-driven procedural map and world generation.
- [GPU Gems: Effective Water Simulation](https://developer.nvidia.com/gpugems/gpugems/part-i-natural-effects/chapter-1-effective-water-simulation-physical-models) — geometric and normal-wave decomposition, analytic derivatives, and Gerstner waves.
- [GPU Gems 2: Accurate Atmospheric Scattering](https://developer.nvidia.com/gpugems/gpugems2/part-ii-shading-lighting-and-shadows/chapter-16-accurate-atmospheric-scattering) — Rayleigh/Mie scattering, phase functions, sampling, and lookup tradeoffs.
- [Real-Time Samurai Cinema](https://advances.realtimerendering.com/s2021/jpatry_advances2021/index.html) — production lighting, atmosphere, exposure, and tone-mapping system design.
- [Real-Time Camera Design Fundamentals](https://www.gdcvault.com/play/1020460/Real-Time-Cameras) — camera intent, framing, movement, and player information. The research PDF is retained as `papers/real-time-camera-design-fundamentals.pdf`.
- [Game Feel: The Secret Ingredient](https://www.gamedeveloper.com/design/game-feel-the-secret-ingredient) — input, response, context, polish, metaphor, and rules as separately tunable contributors.
- [Game Accessibility Guidelines](https://gameaccessibilityguidelines.com/full-list/) — remapping, camera sensitivity, FOV, reduced motion, readable UI, subtitles, alternatives to color-only information, and assist options.
- [Little Polygon: Analytical Two-Bone IK](https://blog.littlepolygon.com/posts/twobone/) — law-of-cosines IK, stable pole planes, reach clamping, and transform-space consistency.
- [Orange Duck: Spring Roll Call](https://theorangeduck.com/page/spring-roll-call) — frame-rate-independent damping, half-life controls, springs, quaternion motion, and inertialization.
- [Three.js AnimationMixer documentation](https://threejs.org/docs/#api/en/animation/AnimationMixer) and [animation examples](https://threejs.org/examples/?q=animation) — mixer/action lifecycle and maintained runtime examples.
- [Fundamentals of Real-Time Camera Design PDF](https://media.gdcvault.com/gdc05/slides/GD_Haigh-Hutchinson_FundamentalsReal-TimeCameraDesign2.pdf) — camera intent, constraints, framing, and movement.
- [Playwright browser testing](https://playwright.dev/docs/intro), [visual comparisons](https://playwright.dev/docs/test-snapshots), and [snapshot assertions](https://playwright.dev/docs/api/class-snapshotassertions) — browser smoke, deterministic capture, environment-sensitive baselines, and diff controls.
- [MDN `webglcontextlost`](https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement/webglcontextlost_event), [`WEBGL_lose_context`](https://developer.mozilla.org/en-US/docs/Web/API/WEBGL_lose_context/loseContext), [`WEBGL_debug_renderer_info`](https://developer.mozilla.org/en-US/docs/Web/API/WEBGL_debug_renderer_info), and [WebGL extensions](https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/Using_Extensions) — context lifecycle and optional renderer diagnostics.
- [Spector.js](https://spector.babylonjs.com/) and its [repository](https://github.com/BabylonJS/Spector.js) — WebGL frame-capture workflow.
- [Real-Time Rendering: Debugging WebGL with SpectorJS](https://www.realtimerendering.com/blog/debugging-webgl-with-spectorjs/) — practical frame-capture investigation sequence.
- [three-pathfinding](https://github.com/donmccurdy/three-pathfinding), [recast-navigation-js](https://github.com/isaac-mason/recast-navigation-js), and [Yuka](https://github.com/Mugen87/yuka) — navigation, steering, perception, and state concepts used only to make small-game behavior inspectable.
- [Red Blob Games pathfinding introduction](https://www.redblobgames.com/pathfinding/a-star/introduction.html) and [implementation guide](https://www.redblobgames.com/pathfinding/a-star/implementation.html), [Craig Reynolds steering behaviors](https://www.red3d.com/cwr/steer/), and [Nature of Code autonomous agents](https://natureofcode.com/autonomous-agents/) — conceptual path and steering diagnostics.
- [Three.js CSS2DRenderer](https://threejs.org/docs/pages/CSS2DRenderer.html) and [CSS3DRenderer](https://threejs.org/docs/pages/CSS3DRenderer.html) — DOM/scene transform capabilities and documented limitations.
- [Three.js Fundamentals: aligning HTML elements to 3D](https://threejsfundamentals.org/threejs/lessons/threejs-align-html-elements-to-3d.html) — projected-DOM label patterns and occlusion considerations.
- [Troika Three Text](https://protectwise.github.io/troika/troika-three-text/), [Drei Text](https://drei.docs.pmnd.rs/abstractions/text), and [Drei Html](https://drei.docs.pmnd.rs/misc/html) — SDF text and optional R3F adapters.
- [WCAG 2.2](https://www.w3.org/TR/WCAG22/), [WAI WCAG overview](https://www.w3.org/WAI/standards-guidelines/wcag/), [WCAG understanding documents](https://www.w3.org/WAI/WCAG22/Understanding/), [WAI-ARIA APG](https://www.w3.org/WAI/ARIA/apg/), [MDN ARIA](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA), [MDN keyboard accessibility](https://developer.mozilla.org/en-US/docs/Web/Accessibility/Guides/Understanding_WCAG/Keyboard), and [MDN canvas](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/canvas) — semantics, focus, keyboard behavior, and canvas alternatives.
- [Three.js AudioListener](https://threejs.org/docs/pages/AudioListener.html), [Audio](https://threejs.org/docs/pages/Audio.html), and [PositionalAudio](https://threejs.org/docs/pages/PositionalAudio.html) — listener topology and positional/non-positional APIs.
- [MDN Web Audio](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API), [best practices](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Best_practices), [autoplay guidance](https://developer.mozilla.org/en-US/docs/Web/Media/Guides/Autoplay), [`PannerNode`](https://developer.mozilla.org/en-US/docs/Web/API/PannerNode), and [Web Audio examples](https://mdn.github.io/webaudio-examples/) — lifecycle, user activation, graphs, and spatial parameters.
- [Chrome autoplay policy](https://developer.chrome.com/blog/autoplay), [Web Audio autoplay for games](https://developer.chrome.com/blog/web-audio-autoplay), [howler.js site](https://howlerjs.com/), and [howler.js repository](https://github.com/goldfire/howler.js) — browser policy context and optional pooling/audio-sprite abstraction.
- [Three.js BufferGeometry](https://threejs.org/docs/#api/en/core/BufferGeometry), [Points](https://threejs.org/docs/#api/en/objects/Points), [PointsMaterial](https://threejs.org/docs/#api/en/materials/PointsMaterial), [Line](https://threejs.org/docs/#api/en/objects/Line), and [Raycaster](https://threejs.org/docs/#api/en/core/Raycaster) — data primitive and picking verification.
- [deck.gl](https://deck.gl/), [ScatterplotLayer](https://deck.gl/docs/api-reference/layers/scatterplot-layer), [PointCloudLayer](https://deck.gl/docs/api-reference/layers/point-cloud-layer), and its [large-scale visual analytics paper](https://arxiv.org/abs/1910.08865) — platform choice, layer lifecycle, picking, and geospatial scale.
- [loaders.gl](https://loaders.gl/), [Potree site](https://potree.github.io/), and [Potree repository](https://github.com/potree/potree) — streaming formats and purpose-built large point-cloud architecture.
- [D3 scales](https://d3js.org/d3-scale), [D3 scale-chromatic](https://d3js.org/d3-scale-chromatic), [ColorBrewer](https://colorbrewer2.org/), and [scheme types](https://colorbrewer2.org/learnmore/schemes_full.html) — quantitative/categorical scale and palette semantics.
- [Vega-Lite](https://vega.github.io/vega-lite/), [Vega](https://vega.github.io/vega/), and [Observable Plot](https://observablehq.com/plot/) — declarative and 2D alternatives to custom Three.js visualization.
- [PBRT v4](https://pbr-book.org/4ed/contents) — deeper BSDF and light-transport reference for look-development reasoning.
- [Khronos glTF material extensions](https://github.com/KhronosGroup/glTF/tree/main/extensions/2.0/Khronos/) — portable advanced-material semantics.
- [Three.js DecalGeometry](https://threejs.org/docs/#examples/en/geometries/DecalGeometry) — maintained decal projection API.
- [Garland–Heckbert quadric error metrics](https://www.cs.cmu.edu/~garland/quadrics/quadrics.html) and [glTF Transform](https://gltf-transform.dev/) — simplification and reproducible asset optimization.
- [Scalar Spatiotemporal Blue Noise Masks](https://arxiv.org/abs/2112.09629), [Playdead temporal reprojection](https://github.com/playdeadgames/temporal), and [Temporal AA and the Quest for the Holy Trail](https://www.elopezr.com/temporal-aa-and-the-quest-for-the-holy-trail/) — temporal sampling and stability concepts.
- [Inigo Quilez articles](https://iquilezles.org/articles/) — practical noise, SDF, and domain-warping techniques.
- [Bruneton precomputed atmosphere](https://ebruneton.github.io/precomputed_atmospheric_scattering/) and [Maxime Heckel on sky, sunsets, and planets](https://blog.maximeheckel.com/posts/on-rendering-the-sky-sunsets-and-planets/) — atmosphere implementation and browser-oriented presentation.
- [Fractals to Forests](https://tympanus.net/codrops/2025/01/27/fractals-to-forests-creating-realistic-3d-trees-with-three-js/) and [StreetGen](https://arxiv.org/abs/1801.05741) — procedural tree and street-network concepts.
- [Evan Wallace realtime caustics](https://medium.com/@evanwallace/rendering-realtime-caustics-in-webgl-2a99a29a0b2c) and [Martin Renou realtime water caustics](https://medium.com/@martinRenou/real-time-rendering-of-water-caustics-59cda1d74aa) — browser-oriented caustic techniques.

## Reviewed with constraints

- [N8AO](https://github.com/N8Programs/n8ao) — current AO implementation patterns; reviewed at commit `6481f6`. Repository/package license metadata was inconsistent during review, so no code was copied and it is not used as a normative source.
- [realism-effects](https://github.com/0beqz/realism-effects) — useful SSGI, HBAO, and temporal concepts; reviewed at commit `061daea`. Its declared Three.js peer range is substantially older than the June 2026 research baseline, so it is treated as conceptual only.

## Intentional scope boundaries

- WebXR is intentionally outside this Three.js-centered pack.
- A standalone game-AI/navigation skill was rejected. Small-game FSM, steering, path, navmesh, perception, and line-of-sight material is included only as behavior/navigation debugging inside `threejs-testing-debugging`.
- Broad multiplayer, persistence, progression, and engine-level game-system curricula are outside scope. The pack covers game concerns where they materially shape Three.js scenes, interaction, rendering, browser delivery, and playability.
- Full music production, advanced acoustics, and general sound-design curricula remain outside `threejs-audio-feedback`.
- General charting theory and every 3D-web domain remain outside the data-visualization module; platform alternatives are preferred when Three.js is not justified.

## Supplied candidate backlog

These sources were supplied for future expansion. Inclusion here does not mean their claims have been accepted or copied.

- [CloudAI-X / threejs-fundamentals](https://github.com/CloudAI-X/threejs-skills/tree/main/skills/threejs-fundamentals)
- [CloudAI-X / threejs-geometry](https://github.com/CloudAI-X/threejs-skills/tree/main/skills/threejs-geometry)
- [CloudAI-X / threejs-materials](https://github.com/CloudAI-X/threejs-skills/tree/main/skills/threejs-materials)
- [CloudAI-X / threejs-lighting](https://github.com/CloudAI-X/threejs-skills/tree/main/skills/threejs-lighting)
- [CloudAI-X / threejs-textures](https://github.com/CloudAI-X/threejs-skills/tree/main/skills/threejs-textures)
- [CloudAI-X / threejs-animation](https://github.com/CloudAI-X/threejs-skills/tree/main/skills/threejs-animation)
- [CloudAI-X / threejs-loaders](https://github.com/CloudAI-X/threejs-skills/tree/main/skills/threejs-loaders)
- [CloudAI-X / threejs-shaders](https://github.com/CloudAI-X/threejs-skills/tree/main/skills/threejs-shaders)
- [CloudAI-X / threejs-postprocessing](https://github.com/CloudAI-X/threejs-skills/tree/main/skills/threejs-postprocessing)
- [CloudAI-X / threejs-interaction](https://github.com/CloudAI-X/threejs-skills/tree/main/skills/threejs-interaction)
- [Impertio-Studio / Three.js-Claude-Skill-Package](https://github.com/Impertio-Studio/Three.js-Claude-Skill-Package)
- [EnzeD / r3f-skills](https://github.com/EnzeD/r3f-skills)
- [freshtechbro / claudedesignskills](https://github.com/freshtechbro/claudedesignskills)
- [freshtechbro / web3d-integration-patterns](https://github.com/freshtechbro/claudedesignskills/tree/main/.claude/skills/web3d-integration-patterns)
- [Anthropic official Skills repository](https://github.com/anthropics/skills)
- [Anthropic / frontend-design skill](https://github.com/anthropics/skills/tree/main/skills/frontend-design)
- [Anthropic / algorithmic-art skill](https://github.com/anthropics/skills/tree/main/skills/algorithmic-art)
- [Anthropic Agent Skills overview](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/overview)
- [Anthropic Agent Skills engineering post](https://www.anthropic.com/engineering/equipping-agents-for-the-real-world-with-agent-skills)
- [OpenAI Codex Skills documentation](https://developers.openai.com/codex/skills)
- [OpenAI API Skills documentation](https://developers.openai.com/api/docs/guides/tools-skills)
- [Three.js forum](https://discourse.threejs.org/)
- [Maxime Heckel blog](https://blog.maximeheckel.com/)
- [The Study of Shaders with React Three Fiber](https://blog.maximeheckel.com/posts/the-study-of-shaders-with-react-three-fiber/)
- [Field Guide to TSL and WebGPU](https://blog.maximeheckel.com/posts/field-guide-to-tsl-and-webgpu/)
- [Painting with Math: Raymarching](https://blog.maximeheckel.com/posts/painting-with-math-a-gentle-study-of-raymarching/)
- [Real-time Cloudscapes with Volumetric Raymarching](https://blog.maximeheckel.com/posts/real-time-cloudscapes-with-volumetric-raymarching/)
- [Volumetric Lighting with Post-processing and Raymarching](https://blog.maximeheckel.com/posts/shaping-light-volumetric-lighting-with-post-processing-and-raymarching/)
- [Three.js Journey](https://threejs-journey.com/)
- [Discover Three.js](https://discoverthreejs.com/)
- [Poimandres ecosystem](https://github.com/pmndrs)
- [MDN 3D on the web](https://developer.mozilla.org/en-US/docs/Games/Techniques/3D_on_the_web)
- [MDN GLSL shaders](https://developer.mozilla.org/en-US/docs/Games/Techniques/3D_on_the_web/GLSL_Shaders)
- [Game Feel — GDC Vault](https://www.gdcvault.com/play/817/The-Secrets-of-Game)
- [Game Feel — GameDeveloper](https://www.gamedeveloper.com/design/game-feel-the-secret-ingredient)
- [Fasani / three-js-resources](https://github.com/Fasani/three-js-resources)
