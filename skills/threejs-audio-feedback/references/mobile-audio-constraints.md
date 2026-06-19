# Mobile audio constraints

Mobile browsers may suspend or interrupt audio more aggressively and have tighter CPU, memory, and speaker limitations.

## Test

- first unlock from touch;
- screen lock, app switch, phone interruption, and return;
- orientation change;
- silent/mute expectations and visible controls;
- Bluetooth/headphone route changes;
- many concurrent effects;
- low-power device and thermal pressure.

## Design

- Keep compressed assets appropriately sized and provide compatible formats.
- Decode only what the memory budget supports.
- Limit simultaneous voices and expensive filter graphs.
- Resume from explicit interaction when the context is interrupted.
- Do not rely on low bass or subtle stereo placement for essential cues on phone speakers.
- Avoid autoplay loops that repeatedly fail and spam promises/console.

Treat mobile audio as a stateful subsystem with recovery UI, not a fire-and-forget effect.
