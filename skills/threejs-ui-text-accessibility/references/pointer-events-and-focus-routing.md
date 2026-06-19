# Pointer events and focus routing

Define ownership for every screen region:

- canvas owns scene gestures;
- DOM controls own their hit areas;
- modal layers suspend or constrain scene input;
- pointer-lock mode has an explicit enter and escape path.

## Rules

- Normalize scene pointers from canvas bounds.
- Do not globally stop propagation without understanding the interaction path.
- Use pointer capture for drags that must continue outside the original element.
- Clear scene intents when focus moves to a form control or dialog.
- Avoid `tabindex` on noninteractive elements when native controls fit.
- Preserve a visible focus indicator above HUD and scene content.
- Restore focus to the initiating control after closing menus/dialogs.

| Symptom | Check |
| --- | --- |
| canvas clicks through button | overlay `pointer-events`, bubbling |
| keyboard moves player while typing | focused element and input-intent gating |
| drag drops at canvas edge | pointer capture/cancel |
| tab enters invisible controls | hidden-state focus management |
| pointer lock traps user | escape instructions and alternate controls |
