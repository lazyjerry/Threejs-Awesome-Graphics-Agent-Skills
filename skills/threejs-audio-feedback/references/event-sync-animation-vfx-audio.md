# Event synchronization across animation, VFX, and audio

Emit one semantic event and let presentation systems respond:

```text
gameplay event
├── animation response
├── VFX response
├── audio cue
├── camera/haptic response
└── UI/state announcement
```

Examples: `pickup.collected`, `weapon.impact`, `player.damaged`, `door.unlocked`.

## Timing

- Trigger at the causal simulation event when possible.
- Use animation markers for authored contact moments.
- Schedule Web Audio against `AudioContext.currentTime` for precise offsets.
- Avoid polling animation pose or pixels to infer critical events.
- Make replay/restart reset pending callbacks and loops.

For networked or rollback systems, define whether a cue is speculative, confirmed, or suppressible. For ordinary browser games, keep event identity and deduplication simple and inspectable.

Tune audio and VFX together at normal and low frame rates. Frame drops should not create duplicate cues.
