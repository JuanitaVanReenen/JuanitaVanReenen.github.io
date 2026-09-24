import assert from "node:assert/strict";
import {assessChange,changeRequiresReassessment} from "./change-assurance.js";

const impact=assessChange(
 {id:"CHG-POWER-01",targetIds:["ENERGY-001"],gateIds:["GATE-PROC"]},
 {
  requirements:[{id:"ENERGY-001"}],
  dependencies:[{id:"DEP-POWER",from:"ENERGY-001",to:"TECH-002"}],
  risks:[{id:"RISK-POWER",dependencyIds:["DEP-POWER"]}],
  gateIds:[]
 }
);
assert.deepEqual(impact.affectedRequirements,["ENERGY-001"]);
assert.deepEqual(impact.affectedDependencies,["DEP-POWER"]);
assert.deepEqual(impact.affectedRisks,["RISK-POWER"]);
assert.equal(changeRequiresReassessment({id:"CHG-POWER-01"},impact),true);
assert.deepEqual(impact.affectedGateIds,["GATE-PROC"]);

console.log("Change assurance tests passed.");
