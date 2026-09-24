import assert from "node:assert/strict";
import {createRetentionPolicy,evaluateRetention} from "./retention-policy.js";

const policy=createRetentionPolicy({
 policyId:"RET-ASSURANCE-1",recordType:"decision_package",
 retentionClass:"critical_assurance_record",
 minimumRetention:"organization_defined",
 legalHoldSupported:true
});
const normal=evaluateRetention({id:"SNAP-002"},policy);
assert.equal(normal.action,"retain");
assert.equal(normal.reason,"policy_review_required");

const hold=evaluateRetention({id:"SNAP-002"},policy,{legalHold:true});
assert.equal(hold.reason,"legal_hold");

console.log("Retention governance tests passed.");
