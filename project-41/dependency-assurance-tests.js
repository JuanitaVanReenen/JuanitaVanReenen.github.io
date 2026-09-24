import assert from "node:assert/strict";
import {assessDependencies,downstreamGateImpact} from "./dependency-assurance.js";

const deps=[{
 id:"DEP-POWER",
 findingIds:["FND-001"],
 changeIds:["CHG-002"],
 downstreamGateIds:["GATE-PROC","GATE-CONSTR"]
}];

const affected=assessDependencies(
 deps,
 [{id:"FND-001",status:"open"}],
 [{id:"CHG-002"}]
);
assert.equal(affected[0].assuranceStatus,"affected");
assert.deepEqual(affected[0].openFindingIds,["FND-001"]);

const impacts=downstreamGateImpact(affected);
assert.deepEqual(impacts,[{gateId:"GATE-PROC",dependencyIds:["DEP-POWER"]},{gateId:"GATE-CONSTR",dependencyIds:["DEP-POWER"]}]);

console.log("Dependency assurance tests passed.");
