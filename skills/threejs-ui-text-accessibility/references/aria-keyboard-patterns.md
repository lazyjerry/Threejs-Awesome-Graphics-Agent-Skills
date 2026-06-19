# ARIA and keyboard patterns

Prefer native HTML semantics. Add ARIA only when native elements cannot express the component.

## Requirements

- Every interactive control has an accessible name matching its visible label.
- Keyboard behavior follows the established pattern for buttons, dialogs, sliders, tabs, menus, and grids.
- Focus order follows task order.
- Focus is not hidden behind overlays.
- State is exposed with name, role, value, and properties such as expanded, pressed, selected, or disabled.
- Escape closes dismissible layers and returns focus appropriately.
- Single-key gameplay shortcuts are disabled or remappable while typing.

Do not use ARIA to make a `div` button when `<button>` works. Do not place interactive descendants inside a control with conflicting semantics.

For 3D object collections, a DOM listbox/grid/tree may mirror selection, but only choose a composite ARIA pattern if its keyboard contract is fully implemented.
