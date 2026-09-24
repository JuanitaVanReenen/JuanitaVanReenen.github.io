import assert from "node:assert/strict";
import {assessRisks,riskGateImpact} from "./risk-assurance.js";

const risks=[{
 id:"RISK-POWER",
 status:"open",
 severity:"high",
 findingIds:["FND-001"],
 dependencyIds:["DEP-POWER"],
 gateIds:["GATE-PROC"]
}];

const deps=[{id:"DEP-POWER",assuranceStatus:"affected"}];
const findings=[{id:"FND-001",status:"open"}];

const assessed=assessRisks(risks,deps,findings);
assert.equal(assessed[0].assuranceStatus,"affected");
assert.deepEqual(assessed[0].openFindingIds,["FND-001"]);
assert.deepEqual(riskGateImpact(assessed),[{riskId:"RISK-POWER",severity:"high",gateIds:["GATE-PROC"]}]);

console.log("Risk assurance tests passed.");
