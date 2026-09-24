import assert from "node:assert/strict";
import {evaluateReviewAssignment} from "./review-assignment.js";

const policy={
 gate_reviewer:["view","review_gate","record_decision"],
 project_analyst:["view","prepare"]
};
const qualification={
 qualificationId:"QUAL-001",reviewerId:"reviewer-7",domain:"water_infrastructure",
 validFrom:"2026-01-01",validUntil:"2026-12-31",status:"active"
};

const assigned=evaluateReviewAssignment({
 reviewer:{role:"gate_reviewer"},
 qualification,requiredAction:"review_gate",asOf:"2026-09-24",policy
});
assert.equal(assigned.assignable,true);

const denied=evaluateReviewAssignment({
 reviewer:{role:"project_analyst"},
 qualification,requiredAction:"review_gate",asOf:"2026-09-24",policy
});
assert.equal(denied.assignable,false);

console.log("Review assignment tests passed.");
