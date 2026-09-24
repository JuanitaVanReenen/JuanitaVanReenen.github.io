import assert from "node:assert/strict";
import { appendLedgerEvent, queryLedger, buildAssuranceTimeline } from "./assurance-ledger.js";

let ledger = { events: [] };

ledger = appendLedgerEvent(ledger, {
  id:"EV-001", type:"evidence_added", occurredAt:"2026-01-01T09:00:00Z",
  targetId:"E-CAP-1", summary:"Capacity evidence added", sourceRefs:["DOC-1"]
});
ledger = appendLedgerEvent(ledger, {
  id:"EV-002", type:"requirement_reassessed", occurredAt:"2026-01-01T10:00:00Z",
  targetId:"TECH-002", summary:"Capacity requirement reassessed", sourceRefs:["E-CAP-1"]
});
ledger = appendLedgerEvent(ledger, {
  id:"EV-003", type:"gate_assessed", occurredAt:"2026-01-01T11:00:00Z",
  targetId:"GATE-DEV", summary:"Development gate assessed", sourceRefs:["TECH-002"]
});

assert.equal(queryLedger(ledger,{targetId:"TECH-002"}).length,1);
assert.equal(queryLedger(ledger,{type:"gate_assessed"}).length,1);
assert.equal(buildAssuranceTimeline(ledger).length,3);
assert.throws(() => appendLedgerEvent(ledger,{
  id:"EV-001", type:"finding_created", occurredAt:"2026-01-01T12:00:00Z"
}),/Duplicate ledger event id/);

console.log("Assurance ledger tests passed.");
