---
name: threejs-audio-feedback
description: "Implement practical browser audio and synchronized feedback for Three.js and React Three Fiber scenes and games. Use for Web Audio lifecycle and autoplay unlocking, AudioListener setup, positional and non-positional sounds, pooling, audio sprites, mixer categories, ducking, distance attenuation, approximate occlusion, mobile constraints, mute/pause settings, or synchronizing hover, click, pickup, collision, damage, success, animation, and VFX events with sound."
---

# Three.js Audio Feedback

Make audio reliable first, then use it to clarify interaction and world state.

## Workflow

1. Define audio categories: master, music/ambience, world, UI, and voice as needed.
2. Create or resume audio only from a valid user gesture and expose locked/unlocked state.
3. Attach one `AudioListener` to the active camera when using Three.js audio.
4. Use non-positional audio for UI and global feedback; use positional audio only for world-located sources.
5. Decode and cache buffers before they are needed; pool concurrent short effects.
6. Trigger audio, VFX, animation, UI, and haptics from one semantic gameplay event.
7. Tune loudness, concurrency, attenuation, ducking, pause, and hidden-tab behavior.
8. Provide mute/volume controls and visual alternatives for essential audio cues.

## Rules

- Never assume autoplay will succeed.
- Do not create or decode a new buffer on every gameplay event.
- Avoid stacking unlimited copies of the same impact sound.
- Keep event timing authoritative; do not infer critical audio only from a rendered frame.
- Pause, stop, or duck appropriate categories when paused, hidden, or covered by a modal.
- Treat approximate occlusion as a controlled filter/gain effect, not physical acoustics.

See the runnable [`examples/audio-unlock-mixer/index.html`](examples/audio-unlock-mixer/index.html).

## References

- Context creation, unlock, suspend, and teardown: [web-audio-lifecycle-and-autoplay.md](references/web-audio-lifecycle-and-autoplay.md)
- Three.js audio graph: [threejs-audio-listener-and-positional-audio.md](references/threejs-audio-listener-and-positional-audio.md)
- Reuse short effects: [sound-pooling-and-audio-sprites.md](references/sound-pooling-and-audio-sprites.md)
- Interaction sound language: [interaction-feedback-sounds.md](references/interaction-feedback-sounds.md)
- Event synchronization: [event-sync-animation-vfx-audio.md](references/event-sync-animation-vfx-audio.md)
- World attenuation and approximate occlusion: [positional-audio-distance-occlusion.md](references/positional-audio-distance-occlusion.md)
- Categories, gain, and ducking: [mixer-categories-and-ducking.md](references/mixer-categories-and-ducking.md)
- Mobile/runtime constraints: [mobile-audio-constraints.md](references/mobile-audio-constraints.md)
- Multimodal accessibility: [audio-accessibility.md](references/audio-accessibility.md)
