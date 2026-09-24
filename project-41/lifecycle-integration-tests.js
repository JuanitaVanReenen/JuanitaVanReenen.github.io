import assert from "node:assert/strict";
import {processGateReview} from "./lifecycle-orchestrator.js";

const base={
 project:{id:"P-001"},
 workflowInput:{
  requirements:[
   {id:"TECH-002",critical:true}
  ],
  evidence:[
   {id:"E-CAP-1",requirementId:"TECH-002",status:"verified",value:100},
   {id:"E-CAP-2",requirementId:"TECH-002",status:"verified",value:120}
  ],
  claims:[
   {id:"C-1",subject:"plant_capacity",value:100},
   {id:"C-2",subject:"plant_capacity",value:120}
  ],
  gate:{id:"GATE-DEV",name:"Development"}
 },
 gate:{id:"GATE-DEV",stage:"development"},
 reviewId:"REV-DEV-001",
 snapshotId:"SNAP-DEV-001"
};

const first=processGateReview(base);
assert.equal(first.review.readiness,"blocked_pending_resolution");
assert.equal(first.transition,null);

const resolved={
 ...base,
 workflowInput:{
  ...base.workflowInput,
  evidence:[{id:"E-CAP-2",requirementId:"TECH-002",status:"verified",value:120}],
  claims:[{id:"C-2",subject:"plant_capacity",value:120}],
  gate:{id:"GATE-PROC",name:"Procurement"}
 },
 gate:{id:"GATE-PROC",stage:"procurement"},
 reviewId:"REV-PROC-001",
 snapshotId:"SNAP-PROC-001",
 previousReview:first.review,
 targetGate:{id:"GATE-CONSTR",stage:"construction"},
 evidenceChangeIds:["E-CAP-2"],
 downstreamImpactIds:["TECH-002","GATE-DEV"]
};

const second=processGateReview(resolved);
assert.equal(second.review.readiness,"ready_for_human_decision");
assert.equal(second.transition.status,"eligible_for_human_gate_review");
assert.equal(second.review.humanDecision,null);
assert.equal(first.review.readiness,"blocked_pending_resolution");
assert.equal(second.comparison.gateTransition.from,"development");
assert.equal(second.comparison.gateTransition.to,"procurement");

console.log("Lifecycle integration tests passed.");
