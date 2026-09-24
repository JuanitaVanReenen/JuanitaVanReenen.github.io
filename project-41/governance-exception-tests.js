import assert from "node:assert/strict";
import {createGovernanceException,evaluateException} from "./governance-exceptions.js";

const proposed=createGovernanceException({
 exceptionId:"EX-001",controlId:"SOD-001",requesterId:"analyst-1",
 reason:"Temporary staffing constraint",expiresAt:"2026-10-01",
 compensatingControls:["secondary independent review"]
});
assert.equal(evaluateException(proposed).usable,false);

const approved=createGovernanceException({
 ...proposed,status:"approved",approvedBy:"governance-lead",
 approvedAt:"2026-09-24T15:00:00Z"
});
assert.equal(evaluateException(approved).usable,true);

console.log("Governance exception tests passed.");
