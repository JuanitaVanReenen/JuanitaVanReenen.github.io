# Flexible Line Recovery Robot — Safety Architecture V0.1

## Safety objective
Prevent hazardous motion, excessive tension, entrapment and unexpected restart while the machine manipulates flexible material.

## Safety layers
1. Mechanical protection
2. Safety-rated stop chain
3. Local actuator limits
4. Software watchdogs
5. Sensor plausibility checks
6. Controlled recovery
7. Operator intervention

## Required protections
- guarded access to moving mechanisms;
- emergency stop;
- access-door/interlock monitoring where appropriate;
- force/tension limits;
- position and velocity limits;
- actuator overcurrent detection;
- loss-of-sensor detection;
- communication watchdog;
- controlled release on fault;
- no automatic restart after a safety stop.

## Fault classes

### F1 — perception disagreement
If cameras disagree or confidence falls below threshold, stop manipulation and re-observe.

### F2 — unexpected line motion
If observed motion exceeds the predicted envelope, stop the active primitive and hold/release according to the configured safe state.

### F3 — excessive tension
Stop the pulling action and enter controlled slack/release behavior.

### F4 — actuator fault
Disable the affected module and prevent coordinated motion until the fault is cleared.

### F5 — communication timeout
Command a safe stop using the hardware watchdog.

### F6 — access/interlock event
Stop hazardous motion immediately and require a deliberate restart procedure.

## Safe-state hierarchy
SAFE_STOP -> HOLD/RELEASE -> OPERATOR_REVIEW -> RE-OBSERVE -> RECOVERY

The exact safe state depends on the mechanical configuration and must be validated during prototype testing.

## Safety verification tests
- emergency-stop response;
- watchdog timeout;
- sensor disconnect;
- encoder disagreement;
- force/tension threshold;
- access/interlock interruption;
- power interruption and restoration;
- jam/overcurrent;
- unexpected line release.

## Important
This document is an engineering safety architecture, not a certification. A physical machine must be assessed against the applicable machinery, electrical, functional-safety and workplace requirements before deployment.
