# Mixer categories and ducking

Route sources through category gain nodes:

```text
music ─┐
world ─┼→ master → destination
ui ────┤
voice ─┘
```

Persist user-facing category volumes separately from temporary ducking multipliers.

## Ducking

- Lower music/ambience during important voice, modal, failure, or pause states.
- Ramp gain; abrupt gain changes click.
- Restore from the current value and handle overlapping duck requests.
- Avoid compressing the entire mix merely to make one cue audible.

## Controls

- master mute and volume;
- optional category sliders;
- sensible defaults and reset;
- visible current state;
- keyboard-accessible native controls.

Use a limiter/compressor only with a clear loudness goal. First solve excessive source gain and concurrency.
