# Positional audio, distance, and occlusion

`PositionalAudio` uses a `PannerNode` and supports distance models, reference distance, rolloff, maximum distance, and directional cones.

## Tune in world scale

- Establish what one world unit represents.
- Set reference distance near the expected full-volume listening distance.
- Choose inverse/exponential behavior for natural falloff or linear for controlled ranges.
- Cap or virtualize inaudible distant sources.
- Test headphones and speakers; stereo width and localization differ.

## Approximate occlusion

For important sources, perform a low-frequency raycast from listener to source against intentional occluders. When blocked, smoothly reduce gain and/or lower a low-pass filter cutoff. Do not raycast every source every frame:

- stagger checks;
- prioritize nearby/loud sources;
- cache stable results briefly;
- smooth transitions to avoid clicks.

This is an approximation. Avoid claiming physically accurate acoustics without a dedicated system.
