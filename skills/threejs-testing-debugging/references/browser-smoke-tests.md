# Browser smoke tests

## Minimum contract

Test the built application through its real entry point. Assert:

- no uncaught page errors or unexpected console errors;
- required assets return successfully;
- exactly the expected canvas and primary UI root exist;
- a known ready signal appears rather than relying only on a delay;
- the first interactive state can be reached;
- resize, focus loss, and one representative input path work;
- teardown or route remount does not duplicate canvas, listeners, or loops.

Prefer semantic DOM locators and explicit app test hooks over pixel coordinates. For canvas interaction, expose narrow debug/test APIs such as `window.__THREE_TEST__.ready`, `step()`, `setSeed()`, or `snapshotState()`. Do not expose production secrets or make tests depend on internal object identities.

## Failure diagnosis

| Symptom | Check first |
| --- | --- |
| blank canvas | page errors, camera pose, renderer size, render loop |
| timeout waiting for ready | failed requests, decoder paths, rejected promises |
| automation click misses | canvas bounds, overlay pointer events, DPR assumptions |
| works headed only | timing, hidden-tab behavior, GPU/backend differences |
| duplicate canvas after navigation | mount ownership and teardown |

Record trace, screenshot, console, and failed-request evidence on failure.
