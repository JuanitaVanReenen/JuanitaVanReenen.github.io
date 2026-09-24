import assert from "node:assert/strict";
import {createRulesetChange,evaluateRulesetPublication} from "./ruleset-approval.js";

const proposed=createRulesetChange({
 changeId:"RULE-CHG-001",rulesetId:"WATER-ASSURANCE",
 fromVersion:"1.1.0",toVersion:"1.2.0",reviewerId:"reviewer-7",
 status:"proposed",evidenceRefs:["TEST-RULE-001"]
});
assert.equal(evaluateRulesetPublication(proposed).publishable,false);

const approved=createRulesetChange({
 ...proposed,status:"approved",effectiveAt:"2026-10-01T00:00:00Z"
});
assert.equal(evaluateRulesetPublication(approved).publishable,true);

console.log("Ruleset governance tests passed.");
