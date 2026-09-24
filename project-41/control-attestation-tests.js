import assert from "node:assert/strict";
import {createControlAttestation,compareAttestationToHealth} from "./control-attestation.js";

const attestation=createControlAttestation({
 attestationId:"ATT-001",controlId:"CTRL-001",reviewerId:"reviewer-7",
 outcome:"effective",reviewedAt:"2026-09-24T14:00:00Z",
 evidenceRefs:["TEST-CTRL-001"],rationale:"Latest control evidence reviewed.",
 nextReviewAt:"2026-10-24T14:00:00Z"
});
assert.equal(attestation.outcome,"effective");
assert.equal(compareAttestationToHealth(attestation,{status:"healthy"}).aligned,true);
assert.equal(compareAttestationToHealth(attestation,{status:"failed"}).aligned,false);

console.log("Control attestation tests passed.");
