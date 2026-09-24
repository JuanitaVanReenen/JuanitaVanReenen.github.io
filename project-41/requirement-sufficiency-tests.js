import assert from "node:assert/strict";
import {assessRequirementSufficiency} from "./requirement-sufficiency.js";

const r={requirementId:"TECH-002",minimumEvidenceQuality:"adequate"};
const weak={requirementId:"TECH-002",quality:"weak"};
const adequate={requirementId:"TECH-002",quality:"adequate"};

assert.equal(assessRequirementSufficiency(r,[weak]).status,"insufficient");
const result=assessRequirementSufficiency(r,[weak,adequate]);
assert.equal(result.status,"supported");
assert.equal(result.qualifyingEvidenceCount,1);
assert.equal(result.humanReviewRequired,true);

console.log("Requirement sufficiency tests passed.");
