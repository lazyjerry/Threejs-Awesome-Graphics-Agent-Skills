# Three.js AudioListener and positional audio

Three.js normally uses one `AudioListener`, attached to the active camera. Both `Audio` and `PositionalAudio` require that listener.

## Choose

- `THREE.Audio`: global/non-positional music, ambience, narration, and UI cues.
- `THREE.PositionalAudio`: sound emitted by a world object.

When switching active cameras, move the listener deliberately and ensure only one listener drives the mix.

## Setup checks

- listener is attached to the camera actually rendered;
- context is running after a user gesture;
- buffer has loaded and decoded;
- volume/category gain is not zero;
- positional source has plausible world scale and distance parameters;
- source is stopped/disconnected when its owner is removed.

Do not make button clicks positional. Do not attach a separate listener to every camera or viewport without a deliberate multi-listener architecture.
