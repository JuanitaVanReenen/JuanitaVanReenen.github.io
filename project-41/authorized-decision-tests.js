import assert from "node:assert/strict";
import {recordAuthorizedDecision} from "./authorized-decision.js";

const policy={
 project_analyst:["view","prepare"],
 evidence_reviewer:["view","verify"],
 gate_reviewer:["view","review_gate","record_decision"],
 system_administrator:["view","administer_ruleset"]
};

const base={
 decision:{
   decisionId:"DEC-001",packageSnapshotId:"SNAP-002",rulesetId:"WATER-ASSURANCE",
   rulesetVersion:"1.1.0",decisionMaker:"reviewer-7",outcome:"accepted_for_next_gate",
   rationale:"Controlled test decision",decidedAt:"2026-09-24T09:00:00Z",sourceRefs:["E-CAP-2"]
 }
};

assert.throws(()=>recordAuthorizedDecision({...base,actor:{role:"project_analyst"}},policy));
const allowed=recordAuthorizedDecision({...base,actor:{role:"gate_reviewer"}},policy);
assert.equal(allowed.authorization.authorized,true);
assert.equal(allowed.decision.packageSnapshotId,"SNAP-002");

console.log("Authorized decision tests passed.");
