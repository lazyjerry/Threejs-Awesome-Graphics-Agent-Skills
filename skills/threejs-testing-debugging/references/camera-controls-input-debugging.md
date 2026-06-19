# Camera, controls, and input debugging

## Make state visible

Display camera position/quaternion, projection parameters, controls target, pointer normalized-device coordinates, active input intents, pointer-lock state, focused element, and canvas bounds.

## Checks

- Normalize pointer coordinates from `canvas.getBoundingClientRect()`, not the window.
- Confirm the event target and overlay `pointer-events` behavior.
- Clear held intents on blur, visibility change, pointer cancel, and lock loss.
- Test keyboard focus before and after menus or modals.
- Verify controls update exactly once per frame and use delta time where required.
- Recompute projection and renderer size from the host element on resize.
- Test portrait/landscape transitions and DPR changes.
- Treat pointer-lock denial or exit as a normal state with visible recovery UI.

| Symptom | Likely cause |
| --- | --- |
| picking offset | canvas bounds, CSS scaling, DPR math |
| camera jumps on resume | stale pointer delta or large frame delta |
| movement sticks | missing cancel/blur cleanup |
| click reaches scene through UI | overlay routing or propagation |
| controls fight animation | multiple owners writing camera transform |

Use a temporary ray line and hit marker to debug picking before changing target geometry.
