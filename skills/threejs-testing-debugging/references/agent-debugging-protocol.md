# Agent debugging protocol

## Required behavior

1. Reproduce before modifying code.
2. Preserve raw evidence: console output, failed requests, screenshots, trace, and relevant state.
3. State the strongest current hypothesis and the observation that would falsify it.
4. Change one causal layer at a time.
5. Prefer a reduced scene or deterministic test hook when the full app obscures the failure.
6. Distinguish verified facts, source-backed constraints, and inference.
7. Remove or gate temporary diagnostics.
8. Verify the fix with the original reproduction plus adjacent regressions.

## Avoid

- blind rewrites before inspecting runtime behavior;
- suppressing console errors without fixing their source;
- accepting a screenshot from an idle/title state as full verification;
- increasing snapshot tolerance to hide nondeterminism;
- optimizing based only on code appearance;
- adding physics, navigation, or state machinery before proving it is required;
- leaving global debug hooks enabled in production.

## Handoff

Report:

- reproduction and environment;
- root cause and evidence;
- files and behavior changed;
- tests rerun;
- residual risk or untested device/backend.
