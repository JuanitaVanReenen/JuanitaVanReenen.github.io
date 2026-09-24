import assert from "node:assert/strict";
import {processGateReview} from "./lifecycle-orchestrator.js";

const base={
  project:{id:"P-001"},
  workflowInput:{
    requirements:[{id:"TECH-002",criticality:"critical"}],
    evidence:[{id:"E-CAP-1",supports:["TECH-002"],status:"conflict",verified:false,value:100}],
    claims:[
      {id:"C-1",subject:"plant_capacity",value:100},
      {id:"C-2",subject:"plant_capacity",value:120}
    ]
  },
  gate:{id:"GATE-DEV",stage:"development",name:"Development"},
  reviewId:"REV-DEV-001",
  snapshotId:"SNAP-DEV-001"
};

const first=processGateReview(base);
assert.equal(first.review.readiness,"blocked_pending_resolution");
assert.ok(first.review.unresolvedFindingIds.length>0);
assert.equal(first.transition,null);

const resolved={
  ...base,
  workflowInput:{
    ...base.workflowInput,
    evidence:[{id:"E-CAP-2",supports:["TECH-002"],status:"verified",verified:true,value:120}],
    claims:[{id:"C-2",subject:"plant_capacity",value:120}]
  },
  gate:{id:"GATE-PROC",stage:"procurement",name:"Procurement"},
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
assert.equal(second.review.humanDecision.outcome,null);
assert.equal(first.review.readiness,"blocked_pending_resolution");
assert.equal(second.comparison.gateTransition.from,"development");
assert.equal(second.comparison.gateTransition.to,"procurement");
assert.ok(second.packageComparison.readiness.changed);

console.log("Lifecycle integration tests passed.");
