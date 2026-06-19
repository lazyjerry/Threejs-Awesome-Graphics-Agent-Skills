# Web Audio lifecycle and autoplay

Browsers commonly block audible programmatic playback before user interaction.

## Lifecycle

1. Prepare UI and load/decode assets without pretending audio is active.
2. On a clear user gesture, create or resume the `AudioContext`.
3. Confirm `context.state === "running"` and update the UI.
4. Suspend, duck, or mute according to pause/visibility policy.
5. Stop sources, disconnect owned nodes, and release references on teardown.

Do not hide unlock inside an unrelated delayed callback; preserve the browser's user-activation chain.

## Failure handling

| State | Response |
| --- | --- |
| `suspended` before interaction | show enable-audio affordance |
| `resume()` rejects | keep UI usable and offer retry |
| tab becomes hidden | pause/duck according to product policy |
| context interrupted on mobile | retry resume from next explicit gesture |
| asset decode fails | continue without that cue and report/fallback |

Audio should be optional to basic operation unless the product explicitly requires it and provides an accessible alternative.
