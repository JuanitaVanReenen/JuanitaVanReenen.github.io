import assert from "node:assert/strict";
import {processGateReview} from "./lifecycle-orchestrator.js";

const result=processGateReview({
  project:{id:"P-LEDGER"},
  gate:{id:"GATE-DEV",stage:"development",name:"Development"},
  reviewId:"REV-LEDGER-001",
  snapshotId:"SNAP-LEDGER-001",
  occurredAt:"2026-09-24T08:00:00.000Z",
  workflowInput:{
    requirements:[{id:"TECH-001",criticality:"critical"}],
    evidence:[{id:"E-001",supports:["TECH-001"],verified:true,status:"verified"}]
  }
});

assert.equal(result.ledger.events.length,2);
assert.equal(result.ledger.events[0].immutable,true);
assert.equal(result.ledger.events[0].id,"LEDGER-REV-LEDGER-001-GATE");
assert.equal(result.ledger.events[1].id,"LEDGER-REV-LEDGER-001-SNAPSHOT");
assert.equal(result.ledger.events[0].occurredAt,"2026-09-24T08:00:00.000Z");
assert.equal(result.review.humanDecision.outcome,null);

console.log("Lifecycle ledger integration tests passed.");
