import assert from "node:assert/strict";
import {can,ACTIONS} from "./role-access-model.js";

assert.equal(can("project_analyst",ACTIONS.PREPARE),true);
assert.equal(can("project_analyst",ACTIONS.RECORD_DECISION),false);
assert.equal(can("evidence_reviewer",ACTIONS.VERIFY),true);
assert.equal(can("evidence_reviewer",ACTIONS.REVIEW_GATE),false);
assert.equal(can("gate_reviewer",ACTIONS.RECORD_DECISION),true);
assert.equal(can("system_administrator",ACTIONS.ADMINISTER_RULESET),true);

console.log("Role access tests passed.");
