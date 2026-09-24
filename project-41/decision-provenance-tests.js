import assert from "node:assert/strict";
import {recordHumanDecision,verifyDecisionProvenance} from "./decision-provenance.js";

const decision=recordHumanDecision({
 decisionId:"DEC-001",
 snapshotId:"SNAP-002",
 gateId:"GATE-PROC",
 rulesetRef:{id:"WATER-ASSURANCE",version:"1.1.0"},
 decisionMaker:{id:"REVIEWER-001",role:"authorized-gate-reviewer"},
 outcome:"accepted_for_next_stage",
 rationale:"Controlled test decision.",
 decidedAt:"2026-09-24T10:00:00Z",
 sourceRefs:["E-CAP-2"]
});

const check=verifyDecisionProvenance(decision,{
 snapshotId:"SNAP-002",
 rulesetRef:{id:"WATER-ASSURANCE",version:"1.1.0"}
});
assert.equal(check.snapshotMatch,true);
assert.equal(check.rulesetMatch,true);
assert.equal(check.provenanceComplete,true);

console.log("Decision provenance tests passed.");
