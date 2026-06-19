# Shader and material debugging

## Isolation sequence

1. Capture the full shader compiler log and material identity.
2. Replace the suspect material with `MeshBasicMaterial` to separate geometry/camera issues from shading.
3. Reduce the shader to position plus a constant color.
4. Restore one varying, uniform, texture, branch, or node at a time.
5. Visualize intermediate values as RGB or grayscale.
6. Verify coordinate spaces, normal transforms, color spaces, defines, precision, and extension support.

## Failure table

| Symptom | Common causes |
| --- | --- |
| black output | NaN/Inf, unbound texture, zero normal, invalid light space |
| magenta/error material | compile or link failure |
| flicker | z-fighting, uninitialized value, temporal instability |
| wrong lighting direction | mixed world/view/tangent spaces |
| washed color | duplicate transfer conversion or wrong texture color space |
| device-only failure | precision, loop limits, extension/backend assumptions |

For `onBeforeCompile`, log the final generated source and cache key. For TSL/WebGPU, first confirm the installed Three.js version and backend before translating a WebGL-only debugging assumption.
