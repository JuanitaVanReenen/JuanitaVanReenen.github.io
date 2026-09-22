# Flexible Line Recovery Robot — Mechanism Specification V0.2

## Purpose
Define the proposed physical architecture for an engineering demonstrator that receives disordered flexible lines and progressively separates, verifies and organizes them.

## 1. Recovery chamber
The primary work envelope is a shallow, transparent-front chamber rather than an open robot-arm workspace.

### Functional zones
- Intake zone: operator or upstream equipment places the disordered line bundle.
- Detection zone: overhead and side sensing establishes the initial line map.
- Recovery field: distributed guide/grip modules manipulate local sections.
- Verification zone: the machine checks separation and tension response.
- Organization path: recovered line enters a straightening and coiling path.
- Reject/service zone: unresolved material can be presented for operator intervention.

## 2. Distributed handling modules
A module is a compact compliant actuator assembly rather than a conventional robot arm.

Each module may contain:
- two opposed compliant guide/grip elements;
- independent opening/closing control;
- lateral translation;
- vertical lift or local pivot;
- encoder;
- force/tension or motor-current proxy;
- mechanical overload release.

Modules operate cooperatively. A line can be transferred from one module to another while remaining inside the constrained chamber.

## 3. Recovery geometry
The chamber uses low-friction guide surfaces and controlled openings to make local line motion predictable. The objective is to create useful boundary conditions around a deformable object rather than reproduce unrestricted human manipulation.

## 4. Slack-first manipulation
Before attempting to separate a suspected crossing, the controller attempts to reduce local tension by moving a selected guide pair or creating a controlled local loop. Separation is attempted only after the estimated state indicates sufficient slack.

This is an engineering hypothesis requiring physical validation; it is not asserted here as novel or patentable.

## 5. State verification
After each manipulation, the system compares:
- predicted line geometry;
- observed geometry;
- tension/motor response;
- module position;
- motion response;
- confidence.

Only a verified transition advances the state machine.

## 6. Rollback
The controller stores the last verified state. A failed action returns the system to that state where mechanically safe, then selects a different action primitive or asks for operator intervention.

## 7. Organization path
After separation, the line is captured by guide rollers and directed through a straightening path. A downstream take-up/coiling mechanism may produce a loose coil, spool-ready loop, or controlled straight length depending on the configured handling cartridge.

## 8. Interchangeable cartridges
The interface should permit different compliant handling surfaces for:
- electrical cables;
- cords;
- ropes;
- straps;
- selected hoses.

Material limits, diameter limits and force limits must be configured per cartridge.

## 9. Engineering constraints
The demonstrator must prioritize:
- no uncontrolled high-force pulling;
- visible operator access;
- rapid emergency release;
- guarded pinch points;
- deterministic motion limits;
- sensor plausibility checks;
- recovery on sensor disagreement.

## 10. Open validation questions
Physical testing must determine:
- minimum/maximum line diameter;
- acceptable bend radius;
- friction ranges;
- maximum safe tension;
- module spacing;
- transfer reliability;
- camera occlusion tolerance;
- rollback reliability;
- organization-path performance.

## Status
V0.2 mechanism definition. Proposed engineering architecture; physical performance not yet validated.
