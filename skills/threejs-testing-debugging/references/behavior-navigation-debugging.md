# Behavior and navigation debugging

This reference is for inspectability and runtime diagnosis in small games, not for designing a full AI architecture.

## Debug overlay contract

For each agent, expose:

- stable identifier and current FSM state;
- target and reason for the latest transition;
- current path and waypoint index;
- velocity, desired velocity, and steering contribution;
- perception cone/radius and line-of-sight ray;
- last path-replan time and result;
- update cost/frequency and stuck status.

## Diagnose

| Symptom | Inspect |
| --- | --- |
| agent oscillates | arrive radius, competing steering, timestep |
| agent cuts corners | navmesh projection, funnel/path smoothing, collider radius |
| agent never sees target | layers, ray origin, occluders, cone math |
| agent freezes | invalid path, unreachable goal, state with no exit |
| many agents hitch | synchronous replans or sensing every frame |
| agent walks through walls | movement not constrained/projected to navigation space |

Detect stuck state from low displacement over a window while desired speed remains meaningful. Log a reason and choose a bounded recovery: replan, advance/rewind waypoint, move to nearest valid nav point, or transition to idle.

Stagger perception and replanning. Keep visual state labels and paths available behind a debug flag. For small games, readable FSMs and seek/flee/arrive/wander/patrol/chase behaviors are often easier to verify than opaque systems.
