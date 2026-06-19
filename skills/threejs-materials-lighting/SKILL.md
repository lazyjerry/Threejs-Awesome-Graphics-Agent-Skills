---
name: threejs-materials-lighting
description: "Establish and diagnose scene-wide Three.js PBR, material roles, texture color spaces, real-time and baked lighting, lightmaps, environment maps, reflection probes, PMREM, shadows, exposure, tone mapping, and progressive reference rendering. Use for a coherent scene foundation, static-environment lighting, glossy reflection context, broad lighting correction, or reference-quality lookdev; use threejs-material-lookdev to match one specific surface or layered material."
---

# Three.js Materials and Lighting

Treat materials, environment, direct light, exposure, and tone mapping as one system.

## Workflow

1. Confirm color-space correctness before changing light intensity.
2. Define material roles such as painted metal, bare metal, rubber, glass, emissive, fabric, skin, or stylized matte.
3. Choose the lighting representation: real-time, baked, environment/probe, or
   a deliberate hybrid.
4. Establish an environment or ambient basis for PBR response.
5. Add the minimum direct lights needed for shape, focus, and narrative.
6. Tune roughness and normal response before adding more lights.
7. Fit shadows tightly and enable them selectively.
8. Tune exposure and tone mapping against representative bright and dark surfaces.
9. Validate from every important camera and on lower-quality targets.

## Material rules

- Metalness is usually categorical: a surface is metal or it is not. Dirt, paint, and oxidation change that classification locally.
- Roughness creates most of the readable surface character. Avoid one roughness value across the world.
- Emissive materials do not automatically illuminate nearby geometry.
- Transmission, clearcoat, iridescence, dispersion, and layered physical features cost more; use them where visible.
- Normal maps require valid tangents or an appropriate derivative path and should not carry color-space tags.
- Use shared material families and controlled variations to preserve cohesion.

Read [references/pbr-material-language.md](references/pbr-material-language.md) and [references/lighting-shadows-environments.md](references/lighting-shadows-environments.md). Read [references/baked-lighting-probes-progressive.md](references/baked-lighting-probes-progressive.md) for lightmaps, baked lighting, reflection probes, PMREM, and narrow progressive/path-traced lookdev.
