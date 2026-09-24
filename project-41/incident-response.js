/**
 * Incident response governance foundation.
 * Classifies assurance/security incidents and creates controlled response records.
 */
export const INCIDENT_TYPES={
 INTEGRITY_FAILURE:"integrity_failure",
 UNAUTHORIZED_ACCESS:"unauthorized_access",
 UNAUTHORIZED_DECISION:"unauthorized_decision",
 DATA_LOSS:"data_loss",
 RECOVERY_FAILURE:"recovery_failure",
 PROVENANCE_BREAK:"provenance_break"
};

export function createIncident(input) {
  if(!input?.incidentId || !input?.type || !input?.detectedAt || !input?.scope) {
    throw new Error("incidentId, type, detectedAt and scope are required.");
  }
  return {
    incidentId:input.incidentId,
    type:input.type,
    detectedAt:input.detectedAt,
    scope:input.scope,
    severity:input.severity??"unclassified",
    status:input.status??"open",
    affectedRecords:input.affectedRecords??[],
    containmentRequired:input.containmentRequired!==false,
    responseOwner:input.responseOwner??null
  };
}

export function assessIncident(incident) {
  if(incident.status==="closed") return {incidentId:incident.incidentId,action:"post_incident_review"};
  if(incident.containmentRequired) return {incidentId:incident.incidentId,action:"contain_and_investigate"};
  return {incidentId:incident.incidentId,action:"investigate"};
}
