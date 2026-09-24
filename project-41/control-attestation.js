/**
 * Control attestation foundation.
 * Separates automated test results from accountable human review of control operation.
 */
export function createControlAttestation(input) {
  if(!input?.attestationId || !input?.controlId || !input?.reviewerId || !input?.outcome || !input?.reviewedAt) {
    throw new Error("attestationId, controlId, reviewerId, outcome and reviewedAt are required.");
  }
  if(!["effective","needs_attention","ineffective"].includes(input.outcome)) {
    throw new Error("Invalid attestation outcome.");
  }
  return {
    attestationId:input.attestationId,
    controlId:input.controlId,
    reviewerId:input.reviewerId,
    outcome:input.outcome,
    reviewedAt:input.reviewedAt,
    evidenceRefs:input.evidenceRefs??[],
    rationale:input.rationale??null,
    nextReviewAt:input.nextReviewAt??null
  };
}

export function compareAttestationToHealth(attestation,health) {
  return {
    controlId:attestation.controlId,
    aligned:(
      (attestation.outcome==="effective" && health.status==="healthy") ||
      (attestation.outcome==="ineffective" && health.status==="failed") ||
      (attestation.outcome==="needs_attention" && health.status==="attention")
    )
  };
}
