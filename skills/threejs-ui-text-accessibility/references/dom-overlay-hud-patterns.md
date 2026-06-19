# DOM overlay and HUD patterns

Use a positioned application shell:

```text
scene-shell
├── canvas-host
├── status/live-region
├── hud (non-blocking regions)
├── menus/dialogs
└── loading/error layer
```

Keep the overlay root non-interactive only when appropriate; restore `pointer-events: auto` on actual controls. Do not make the entire HUD intercept canvas gestures.

## State

- Drive scene and UI from explicit application state.
- Keep loading, ready, paused, error, and unsupported states mutually understandable.
- Use native buttons, inputs, progress, dialog patterns, and headings.
- Avoid updating DOM text every frame; publish coarse semantic state changes.
- Keep pause, restart, settings, mute, and exit-pointer-lock reachable.

## Failure modes

| Failure | Fix |
| --- | --- |
| HUD covers targets | reserve safe areas and expose layout bounds |
| controls disappear over scene | adaptive scrim/outline and contrast testing |
| duplicated state | one state source with UI/scene adapters |
| mobile browser chrome overlaps UI | safe-area insets and dynamic viewport units |
| loading hangs silently | timeout, error detail, retry, fallback |
