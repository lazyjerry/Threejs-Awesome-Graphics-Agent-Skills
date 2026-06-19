# Context loss and lifecycle tests

## Context loss

Use `WEBGL_lose_context` in development tests when available. Assert that the app:

- receives `webglcontextlost`;
- stops or safely gates rendering work;
- presents recoverable status if restoration is not immediate;
- rebuilds GPU-dependent resources or reinitializes the rendering boundary after restoration;
- does not create a second uncontrolled loop.

The extension destroys underlying graphics resources until `restoreContext()` is called. Do not treat context restoration as merely resuming `requestAnimationFrame`.

## Lifecycle matrix

Test:

- initial mount and first ready state;
- repeated resize and orientation changes;
- tab hide/show;
- route unmount/remount;
- restart after success and failure;
- hot reload in development;
- context loss/restoration;
- teardown during asset loading.

After teardown, verify animation loops are stopped, observers/listeners removed, async work cancelled or ignored, controls disposed, audio stopped, and owned GPU resources disposed. Repeated mount should return to the same number of canvases, loops, and listeners.
