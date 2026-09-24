import assert from "node:assert/strict";
import {createIncident,assessIncident,INCIDENT_TYPES} from "./incident-response.js";

const incident=createIncident({
 incidentId:"INC-001",type:INCIDENT_TYPES.INTEGRITY_FAILURE,
 detectedAt:"2026-09-24T12:00:00Z",scope:"TENANT-A/PROJECT-41",
 severity:"high",affectedRecords:["SNAP-002"]
});
assert.equal(assessIncident(incident).action,"contain_and_investigate");
const closed=createIncident({
 incidentId:"INC-002",type:INCIDENT_TYPES.DATA_LOSS,
 detectedAt:"2026-09-24T13:00:00Z",scope:"TENANT-A/PROJECT-41",status:"closed"
});
assert.equal(assessIncident(closed).action,"post_incident_review");

console.log("Incident response tests passed.");
