# Picking, selection, and brushing

Screen-space interaction is not equivalent to world-space distance.

## Picking

- Normalize pointer coordinates from canvas bounds.
- Tune `Raycaster.params.Points.threshold` in world units with awareness of camera scale.
- For dense data, narrow candidates spatially or use GPU/ID picking.
- Verify the selected stable data identifier, not only a transient vertex index.
- Resolve occlusion policy: nearest visible, all under cursor, or depth-ignored.

## Selection

Keep selection state outside render objects. Support hover, focused, selected, filtered, and compared states deliberately.

## Brushing

For rectangle/lasso selection:

1. Project candidate points or test against a selection frustum.
2. Use spatial/chunk filtering before exact tests.
3. Throttle preview and commit final selection on completion.
4. Expose selected counts and clear/reset controls.

Provide keyboard/search alternatives when selection is required for the task.
