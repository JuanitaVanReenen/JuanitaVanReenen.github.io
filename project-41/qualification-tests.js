import assert from "node:assert/strict";
import {createQualification,assessQualification} from "./qualification-register.js";

const q=createQualification({
 qualificationId:"QUAL-001",reviewerId:"reviewer-7",domain:"water_infrastructure",
 scope:["capacity","gate_review"],validFrom:"2026-01-01",validUntil:"2026-12-31",
 evidenceRefs:["CERT-001"]
});
assert.equal(assessQualification(q,"2026-09-24").qualified,true);
assert.equal(assessQualification(q,"2027-01-01").qualified,false);
assert.equal(assessQualification({...q,status:"inactive"},"2026-09-24").qualified,false);

console.log("Reviewer qualification tests passed.");
