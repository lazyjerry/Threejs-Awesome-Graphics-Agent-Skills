# Interaction feedback sounds

Sound should confirm cause and state, not add constant noise.

## Event vocabulary

- hover/focus: subtle, rate-limited preview;
- click/activate: crisp confirmation;
- invalid/blocked: distinct restrained rejection;
- pickup/reward: positive onset and optional tonal rise;
- collision/impact: scale by impulse/material class;
- damage/danger: prioritize readability over realism;
- success/failure: resolve the interaction loop;
- pause/resume: confirm mode transition.

Vary sound by semantic class, not every object instance. Reserve the strongest transients and low-frequency energy for high-priority events.

## Diagnosis

| Problem | Likely cause |
| --- | --- |
| UI feels sluggish | sound starts late or event fires after animation |
| mix becomes muddy | too many long tails/concurrent cues |
| sounds feel random | events lack shared naming and priority |
| hover chatters | no debounce/rate limit |
| impacts lack scale | no mapping from impulse/size/material |

Every essential audio cue needs a visual or textual equivalent.
