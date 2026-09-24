import assert from "node:assert/strict";
import {createHumanReview,reviewRequiresFollowUp} from "./human-review.js";

const confirmed=createHumanReview({
 reviewId:"REV-001",reviewerId:"reviewer-7",subjectId:"TECH-002",
 disposition:"confirmed",reviewedAt:"2026-09-24T16:00:00Z",
 observations:["Capacity basis reviewed against source evidence."],
 evidenceRefs:["E-CAP-2"],rationale:"Evidence supports the requirement."
});
assert.equal(reviewRequiresFollowUp(confirmed),false);

const challenged=createHumanReview({
 reviewId:"REV-002",reviewerId:"reviewer-8",subjectId:"ENV-001",
 disposition:"challenged",reviewedAt:"2026-09-24T16:10:00Z",
 followUpActionIds:["ACT-ENV-1"]
});
assert.equal(reviewRequiresFollowUp(challenged),true);

console.log("Human review tests passed.");
