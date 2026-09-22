# Flexible Line Recovery Robot — IP Claim Boundary Matrix V0.1

## Purpose
Engineering/IP working document for identifying combinations that may warrant professional patent review. This is **not** a patentability opinion, claim drafting, or freedom-to-operate opinion.

## Prior-art areas observed
| Area | What is already established | Boundary implication |
|---|---|---|
| Cable/DLO manipulation | Robots visually perceive and manipulate cables and other deformable linear objects. | Do not claim generic robotic cable manipulation. |
| Untangling/disentangling | Published systems use learned perception, loosening actions, grasping and recovery interventions. | Do not claim generic untangling or recovery. |
| Cable routing/harness handling | Industrial systems use specialized gripping and routing mechanisms. | Do not claim generic wire routing or gripping. |
| Straightening/untwisting | Cable straightening and untwisting apparatuses are established. | Do not claim straightening alone. |
| Recovery/recycling machines | Cable recovery machines can feed, straighten, cut and process cable. | Do not claim cable recovery as a broad category. |

## Candidate combination boundaries for legal review

### B1 — Constrained recovery environment
**Combination:** A shallow, observable recovery chamber deliberately constraining flexible-line motion + distributed handling modules operating within that chamber + downstream organization path.

**Potential distinction to investigate:** The environment itself is part of the manipulation architecture rather than merely a passive work surface.

**Risk:** Constrained cable manipulation/workspace concepts may exist. Requires targeted patent search.

### B2 — State-based recovery control
**Combination:** A live line-state representation containing segment/endpoints, crossing relationships, loop candidates, local tension class, module ownership and a last-verified state ID + action selection based on that state.

**Potential distinction to investigate:** Coupling topology and physical-response state into a recoverable control state.

**Risk:** Graph/state representations for deformable objects and cable manipulation are established. Requires claim charting.

### B3 — Slack-first manipulation
**Combination:** Deliberately reducing local tension as a selected manipulation primitive before attempting separation of a detected crossing/loop + selecting the action from the line-state representation.

**Potential distinction to investigate:** A specific planning/control rule coupling local tension reduction to topological recovery.

**Risk:** Loosening/slackening actions are already present in cable untangling research. The exact combination must be compared against prior art.

### B4 — Verified state transition
**Combination:** Every manipulation requires a verification gate using predicted geometry change + observed geometry + physical response such as tension/contact/motor response before state commit.

**Potential distinction to investigate:** Explicit physical-response verification as a prerequisite for committing a topological line-state transition.

**Risk:** Closed-loop verification and recovery are broad established control concepts.

### B5 — Verified rollback + alternative action
**Combination:** Failed verification causes the system to return to the last verified state when physically feasible, then select an alternate manipulation primitive against the same unresolved line state.

**Potential distinction to investigate:** A persistent verified-state checkpoint coupled specifically to flexible-line topology recovery.

**Risk:** Autonomous recovery/error handling is established; novelty would depend on the precise combination and implementation.

### B6 — Distributed transfer
**Combination:** Multiple local compliant modules transfer ownership of a line segment within the constrained chamber without requiring a conventional full robot arm to execute the entire manipulation.

**Potential distinction to investigate:** Module-to-module ownership transfer as a primitive in the recovery state machine.

**Risk:** Multi-gripper and multi-robot cable handling exists; targeted search required.

### B7 — Recovery-to-organization transition
**Combination:** Once verified recovery reaches a defined state, the same control architecture transfers the line directly into a controlled straightening/loose-coil organization path.

**Potential distinction to investigate:** A continuous verified state transition from disorder recovery to organized output.

**Risk:** Straightening/coiling machinery is established; the integrated transition is the part requiring review.

## Candidate composite architecture
The strongest legal-review candidate is **not any single element above**. The investigation should examine the combination:

> constrained recovery chamber + distributed compliant handling + topology/tension line-state + slack-first action selection + physical-response verification + verified-state rollback + alternate action + controlled organization output.

## Evidence needed before any filing decision
1. Professional patent search across apparatus, method and control claims.
2. Claim chart against the closest references.
3. Search of patent families and legal status.
4. Freedom-to-operate review for intended implementation.
5. Engineering prototype evidence showing the combined mechanism can actually operate.
6. Dated design records and disclosure-control record.

## Current conclusion
This matrix identifies **potentially investigable combinations**, not established novelty. Broad cable manipulation, untangling, recovery, straightening and error recovery are already documented in research and patents. Formal legal review remains required.

## Research references
- Berkeley EECS report: Robotic Untangling and Disentangling of Cables via Learned Manipulation and Recovery Strategies.
- Relevant patent families covering cable recovery/straightening/untwisting and industrial wire handling should be reviewed during a formal search.

**Status: IP candidate — boundary investigation in progress.**
