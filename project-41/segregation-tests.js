import assert from "node:assert/strict";
import {canPerformWithSeparation,evaluateDecisionSeparation} from "./segregation-of-duties.js";

assert.equal(canPerformWithSeparation("gate_reviewer","record_decision",{priorActions:["verify"]}).allowed,false);
assert.equal(canPerformWithSeparation("gate_reviewer","record_decision",{priorActions:["prepare"]}).allowed,true);

assert.equal(evaluateDecisionSeparation({
 preparerId:"analyst-1",verifierId:"reviewer-2",decisionMakerId:"reviewer-3"
}).allowed,true);

assert.equal(evaluateDecisionSeparation({
 preparerId:"analyst-1",verifierId:"reviewer-2",decisionMakerId:"analyst-1"
}).allowed,false);

console.log("Segregation of duties tests passed.");
