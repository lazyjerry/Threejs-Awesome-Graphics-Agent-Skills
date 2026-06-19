# Baked lighting, reflection probes, and progressive lookdev

Choose the lighting representation from scene mutability and response needs.

| Need | Prefer |
| --- | --- |
| responsive moving scene and changing lights | real-time lights and shadows |
| static environment with a fixed lighting design | baked lightmaps and AO |
| plausible glossy response around a location | environment map or reflection probe |
| material/lighting reference, still capture, or idle quality mode | progressive or path-traced rendering |

These approaches can be combined. A static environment may use baked diffuse
lighting, a processed environment for reflections, dynamic key lights for a
character, and restrained real-time shadows for contact and interaction cues.

## Lightmaps and baked detail

Use lightmaps when geometry, lighting, and major occluders are sufficiently
static. Author a non-overlapping secondary UV set with appropriate padding and
texel density. Treat the map as lighting data and verify its expected color
space against the export and Three.js material path.

Ambient-occlusion maps can reinforce local contact and cavities, but should not
replace broad lighting or paint permanent dirt over the entire scene. Check
which UV channel the installed Three.js material expects.

Limitations:

- moving objects do not automatically affect or receive the baked result;
- time-of-day and movable-light changes invalidate the bake;
- dynamic objects can appear detached from baked shadows;
- low texel density, seams, dilation errors, and inconsistent UV scale remain
  visible even when the real-time renderer is correct.

Mix baking with dynamic content by adding contact shadows, blob shadows,
selective real-time shadow casters, light probes or ambient terms for moving
objects, and dynamic highlights that preserve interaction readability.

## Environment maps and reflection probes

Use a static HDR or cubemap when one environment can plausibly light the scene.
Use local probes or cube captures when rooms, product stages, metals, glass, or
glossy floors require location-specific reflection context.

Process environment lighting for the material model. In Three.js, PMREM
prepares environment maps for roughness-dependent image-based lighting. Keep
the visible background and reflected environment coherent unless a deliberate
art-direction difference is documented.

Probe rules:

- place captures where reflective objects need representative surroundings;
- exclude the reflective object when self-capture causes obvious artifacts;
- use static captures for static scenes and invalidate dynamic probes only when
  relevant scene state changes;
- avoid one high-resolution dynamic cube capture per object;
- dispose generated cube targets and PMREM outputs with their owner.

Stale probes, excessive environment intensity, incorrect color handling, and
poor capture placement commonly produce over-bright metals or reflections that
do not match the visible room.

## Progressive and path-traced lookdev

Use progressive rendering narrowly:

- reference-quality material and lighting validation;
- product configurator quality mode when the camera can remain still;
- screenshot or still-output mode;
- comparison against the real-time approximation;
- diagnosing whether a raster result is limited by material parameters,
  lighting, shadows, or screen-space techniques.

Do not make path tracing the default path for an ordinary responsive game.
Accumulation needs stable camera, geometry, materials, lights, and environment.
Reset accumulation whenever any of those inputs change. Also reset after
resize, animation, camera movement, or quality changes that alter the sample.

Provide a clear interaction policy: pause accumulation while the user moves,
show a responsive raster preview, then resume progressive refinement after the
scene becomes stable.

## Failure diagnosis

| Symptom | Check |
| --- | --- |
| baked scene feels flat | missing dynamic hierarchy, weak contrast, bake calibration |
| seams or blocky lighting | secondary UVs, padding, texel density, compression |
| character floats above floor | baked/dynamic shadow mismatch and contact cue |
| metal is over-bright | environment intensity, exposure, probe content, roughness |
| reflections are stale | probe invalidation and update ownership |
| progressive output ghosts | accumulation was not reset after scene change |
| interaction becomes unusable | path tracing selected for a continuously changing view |

Sources:

- [MeshStandardMaterial lightMap and aoMap](https://threejs.org/docs/pages/MeshStandardMaterial.html)
- [PMREMGenerator](https://threejs.org/docs/pages/PMREMGenerator.html)
- [CubeCamera](https://threejs.org/docs/pages/CubeCamera.html)
- [three-gpu-pathtracer](https://github.com/gkjohnson/three-gpu-pathtracer)

