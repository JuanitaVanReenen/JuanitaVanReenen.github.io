# Flexible Line Recovery Robot — Software Architecture V0.1

## System layers
1. Perception
2. Line reconstruction
3. State estimation
4. Manipulation planning
5. Motion/control
6. Verification
7. Recovery
8. Operator control
9. Diagnostics and data

## Perception
Inputs:
- overhead RGB/depth cameras
- chamber cameras
- optional tactile/force sensors
- motor current
- encoder position
- tension sensors

Outputs:
- line pixels/segments
- endpoints
- crossings
- loops
- occlusion estimates
- confidence

## Line-state model
Each line is represented as a graph:
endpoint -> segment -> crossing/loop -> segment -> endpoint

Each segment stores approximate geometry, tension estimate, material profile and handling history.

## Planner
The planner selects actions from:
- acquire
- slide
- lift
- create slack
- separate
- transfer
- reverse
- verify
- coil

The planner prioritizes low-risk slack creation before high-force separation.

## Control
Each handling module has:
- position target
- velocity limit
- force/tension limit
- grip state
- watchdog
- emergency release

## Verification
A recovery step is accepted only when geometry and sensor response satisfy the expected transition. Otherwise the controller rolls back to the last verified state.

## Recovery state machine
OBSERVE
-> MAP
-> SELECT_ACTION
-> EXECUTE
-> VERIFY
-> [SUCCESS -> NEXT]
-> [FAILURE -> ROLLBACK -> ALTERNATIVE_ACTION]

## Operator console
Views:
- live chamber
- line map
- machine state
- active action
- safety state
- recovery history
- completed lines
- maintenance alerts

## Simulation
The first digital prototype will model:
- flexible lines as segmented curves
- crossings
- slack
- guide points
- actuator movements
- simplified collision constraints
- verification outcomes
- recovery loops

The simulation is an engineering planning tool, not evidence that physical performance has been validated.

## API boundary
Future hardware adapters should expose:
- sensor frames
- actuator commands
- safety state
- calibration
- telemetry

The high-level planner remains hardware-independent.
