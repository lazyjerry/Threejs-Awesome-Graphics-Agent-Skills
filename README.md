# Three.js Awesome Graphics Agent Skills

This is a Three.js agent skill pack for producing awesome graphics.

It includes mesh design, lighting, PBR materials, textures, shaders, TSL/WebGPU, GLSL, post-processing, realism, stylization, particles, procedural visuals, color management, tone mapping, etc. Graphics excellence is the **main focus** of this skill pack, with sophisticated design aesthetics, philosophy, ergonomics, sensibility, taste

This is NOT a three.js API cheat sheet, it skips basic 3D production fundamentals (any decent LLM already has that internal knowledge), it also skips three.js API technicalities (just look up docs or use existing API oriented agent skills). This skill pack is meant for agent to produce stunning 3D scenes and graphics that transcend simple demos. It brings the sophistication of good graphics and eliminates cheap effort.

## Operating model

Load `$threejs-skill-router` for a broad visual task, then load only the atomic systems the work actually needs.

Every graphics system is expected to expose:

- deterministic or reproducible inputs;
- named controlling fields and perceptual parameters;
- diagnostic outputs;
- scale, distance, and temporal stability rules;
- an intentional mechanism-backed quality or resolution tier when the system defines one;
- a no-post baseline that still reads.

## Skills

| Skill | Expertise |
| --- | --- |
| `threejs-skill-router` | Decompose a visual target into the smallest relevant expert systems. |
| `threejs-camera-direction` | Authored lenses and shots, chase/side/orbit rigs, body-relative frames, handoffs, pointer look, floating origins. |
| `threejs-procedural-animation` | Analytic timelines, gravity turns, staging, rotating-frame docking, springs, quaternion alignment, debris motion. |
| `threejs-procedural-fields` | Shared scalar/vector fields, frequency bands, domain warping, causal masks, procedural normals. |
| `threejs-procedural-materials` | Atlas filtering, specular AA, planetary materials, terrain wetness, frame PBR, per-instance dissolve. |
| `threejs-procedural-geometry` | Sculpted frame rails, branch rings, semantic mesh writers, UV density, material groups. |
| `threejs-procedural-vegetation` | Growth hierarchies, branch-ring geometry, stratified children, foliage normals, wind. |
| `threejs-procedural-architecture` | Massing and façade grammars, exposed-edge analysis, modules, material-slot compilation. |
| `threejs-procedural-planets` | Spherical terrain, ridges, craters, biomes, procedural normals, altitude filtering. |
| `threejs-spectral-ocean` | Validated FFT synthesis, spectral cascades, choppy derivatives, Jacobian foam, ocean shading. |
| `threejs-water-optics` | Shared analytic waves/normals, heuristic refraction, fallback absorption, reflection, crest foam. |
| `threejs-atmosphere-aerial-perspective` | Shared Rayleigh/Mie atmosphere, sky, shell/post handoff, depth-based scattering. |
| `threejs-volumetric-clouds` | Weather-shaped density, bounded raymarching, cloud lighting, history, cloud shadows. |
| `threejs-raymarched-space-effects` | Curved-ray integration, black holes, accretion disks, wormholes, bounded quality. |
| `threejs-procedural-vfx` | Reentry shells/wakes, instanced sparks, dissolving debris, dense pools, HDR hierarchy. |
| `threejs-temporal-surfaces` | Persistent touch history, reduced blur, frost composite, and normal refraction. |
| `threejs-shadow-systems` | Stable cascades and cached clipmap shadows with update budgets and invalidation. |
| `threejs-screen-space-ambient-occlusion` | GTAO-style horizon sampling, bent normals, bilateral and temporal reconstruction. |
| `threejs-bloom` | HDR extraction, multi-scale filtering, selective contribution, exposure coupling. |
| `threejs-exposure-color-grading` | Encoded luminance metering, asymmetric adaptation, tone mapping, generated 3D LUT. |
| `threejs-image-pipeline` | Shared render-signal ownership and ordering across multiple image-space systems. |
| `threejs-visual-validation` | Fixed-view captures, diagnostic mosaics, seed/scale sweeps, temporal and GPU evidence. |

## Examples of use

```text
Use $threejs-skill-router to decompose and build a procedural ocean planet
with a ground-to-orbit camera.
```

```text
Use $threejs-procedural-vegetation to build a deterministic tree species
with coherent branching, bark scale, foliage normals, and hierarchical wind.
```

```text
Use $threejs-camera-direction and $threejs-procedural-animation to stage a
planet-relative ship approach with an authored side-camera handoff and docking.
```

```text
Use $threejs-bloom to diagnose the HDR signal and tune bloom without making
the glow carry the underlying form.
```

```text
Use $threejs-visual-validation to produce a deterministic evidence set for
this procedural material across camera distance, seeds, motion, and quality tiers.
```

## Install

The published package and installer command are `threejs-awesome-graphics-agent-skills`.

```sh
# User-wide installation
npx threejs-awesome-graphics-agent-skills install --agent codex
npx threejs-awesome-graphics-agent-skills install --agent claude-code
npx threejs-awesome-graphics-agent-skills install --agent cursor

# Project installation
npx threejs-awesome-graphics-agent-skills install --agent github-copilot --scope project

# Any custom-built agent
npx threejs-awesome-graphics-agent-skills install --agent custom --path ~/.my-agent/skills
```

Supported targets:

| Target | User scope | Project scope |
| --- | --- | --- |
| `universal` | `~/.agents/skills` | `.agents/skills` |
| `codex` | `~/.agents/skills` | `.agents/skills` |
| `claude-code` | `~/.claude/skills` | `.claude/skills` |
| `cursor` | `~/.cursor/skills` | `.cursor/skills` |
| `github-copilot` | `~/.copilot/skills` | `.github/skills` |
| `gemini-cli` | `~/.gemini/skills` | `.gemini/skills` |
| `windsurf` | `~/.codeium/windsurf/skills` | `.windsurf/skills` |
| `custom` | exact `--path` | exact `--path` |

Each installation contains the complete pack so its router can reference every atomic skill. Use `--force` to replace an existing installation and `--dry-run` to inspect changes.

```sh
npx threejs-awesome-graphics-agent-skills uninstall --agent cursor
```

## Development

```sh
npm run validate
npm test
npm run check:freshness
npm pack --dry-run
```

Inspect every included graphics example from one development surface:

```sh
npm run dev:examples
```

The gallery discovers examples from each skill automatically and provides
single-example and live-overview modes, viewport/DPR controls, pause/time
controls, debug-mode routing, standalone launch, runtime metrics, and canvas
capture. It is repository tooling and is not installed as an agent skill.

Current accepted inspection surfaces:

- [Sculpted gallery frame](skills/threejs-procedural-geometry/examples/sculpted-gallery-frame/index.html)
  — profile-swept mesh, authored frame PBR, grazing lights, shadows, and
  selective bloom;
- [Ash growth system](skills/threejs-procedural-vegetation/examples/structured-ash-growth/index.html)
  — species-specific hierarchy, branch geometry, foliage, wind, and meadow;
- [Curved-ray accretion volume](skills/threejs-raymarched-space-effects/examples/curved-ray-accretion-volume/index.html)
  — bounded ray steering, accretion density, transmittance, and bent
  environment lookup;
- [Spectral cascade ocean](skills/threejs-spectral-ocean/examples/spectral-cascade-ocean/index.html)
  — directional spectra, staged inverse FFT, choppy displacement, and
  persistent Jacobian foam;
- [Planet field and atmosphere](skills/threejs-procedural-planets/examples/planet-field-atmosphere/index.html)
  — coupled displacement, geological fields, biome masks, water, and
  atmospheric scattering;
- [Authored financial tower](skills/threejs-procedural-architecture/examples/authored-financial-tower/index.html)
  — semantic massing, façade grammar, grouped mesh emission, and cached
  clipmap shadows;
- [Analytic wave optics](skills/threejs-water-optics/examples/analytic-wave-optics/index.html)
  — shared displaced waves and normals, filtered microstructure, Fresnel,
  refraction, absorption, and crest response;
- [Weather volume clouds](skills/threejs-volumetric-clouds/examples/weather-volume-clouds/index.html)
  — packed weather channels, profile-shaped density, bounded integration,
  directional lighting, and temporal reconstruction;
- [Reentry plasma and sparks](skills/threejs-procedural-vfx/examples/reentry-plasma-and-sparks/index.html)
  — hull-conforming plasma, layered wakes, fixed-capacity HDR sparks, debris,
  and bloom ownership;
- [Touch-history frost](skills/threejs-temporal-surfaces/examples/touch-history-frost/index.html)
  — persistent interaction history, static crystalline fields, reduced blur,
  and two-scale refraction.

Generate deterministic captures and a contact sheet:

```sh
npm run capture:examples
```

The gallery contract is documented in
[`dev/example-gallery/README.md`](dev/example-gallery/README.md).
