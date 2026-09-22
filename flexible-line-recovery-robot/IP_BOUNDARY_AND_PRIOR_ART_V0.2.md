# Flexible Line Recovery Robot — IP Boundary & Prior-Art Record V0.2

## Purpose
Record what the project should and should not claim after initial research.

## Established areas
Research and industrial development already cover:
- robotic manipulation of cables and deformable linear objects;
- tactile cable following;
- cable routing and wire-harness assembly;
- robotic cable untangling;
- model-based DLO planning;
- autonomous error recovery;
- automated winding and cable management.

Examples reviewed include MIT cable manipulation research, RoboCable at the University of Stuttgart, published industrial cable-manipulation research, and recent work on autonomous error recovery. These references demonstrate that broad cable manipulation and untangling are not an appropriate standalone novelty claim.

## Proposed boundary for investigation
The project should investigate the combined architecture of:
1. a purpose-built shallow recovery chamber;
2. distributed compliant handling modules arranged around that chamber;
3. a line-state graph incorporating geometry, crossings, loops and tension/recovery status;
4. slack-first local manipulation as a deliberate planning primitive;
5. module-to-module transfer inside the constrained recovery field;
6. verification using geometry plus physical response;
7. rollback to a verified state followed by alternative manipulation;
8. direct transition from recovery into controlled organization.

## Why the combination matters
The design premise is not simply “use a robot to untangle cables.” It is to change the physical problem itself by constraining the environment, distributing handling, representing the line as a recoverable state and requiring verified state transitions.

That combination remains an engineering/IP hypothesis. It requires a formal patent search, claim charting and legal review before any patent filing or novelty statement.

## Search record — 22 September 2026
Initial web screening covered:
- cable manipulation;
- cable untangling;
- deformable linear object manipulation;
- industrial cable recovery;
- autonomous error recovery;
- cable routing and harness handling.

Representative sources:
- MIT CSAIL / MIT News on tactile cable manipulation.
- University of Stuttgart RoboCable.
- Scientific Reports research on heavy industrial cable manipulation.
- 2025 model-based DLO path planning research.
- 2026 autonomous error-recovery research.

## IP discipline
Do not publicly describe this as “patented,” “patentable,” “unique,” or “first” without a formal legal opinion. Maintain dated records of every design revision, simulation, test and disclosure.

## Status
Initial prior-art boundary recorded. Formal patent search and professional legal review remain required.
