import assert from "node:assert/strict";
import {evaluateGateTransition,assertNoAutomaticApproval} from "./transition-rules.js";

const blocked=evaluateGateTransition({
 currentReview:{
  gate:{id:"GATE-DEV"},readiness:"blocked_pending_resolution",
  unresolvedFindingIds:["FND-001"],openActionIds:["ACT-001"]
 },
 targetGate:{id:"GATE-PROC"}
});
assert.equal(blocked.status,"blocked_pending_resolution");
assert.equal(blocked.blockers.length,3);
assertNoAutomaticApproval(blocked);

const eligible=evaluateGateTransition({
 currentReview:{
  gate:{id:"GATE-DEV"},readiness:"ready_for_human_decision",
  unresolvedFindingIds:[],openActionIds:[]
 },
 targetGate:{id:"GATE-PROC"}
});
assert.equal(eligible.status,"eligible_for_human_gate_review");
assertNoAutomaticApproval(eligible);

console.log("Gate transition rule tests passed.");
