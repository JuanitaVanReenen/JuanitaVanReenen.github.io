/**
 * Retention/lifecycle policy foundation.
 * Defines policy metadata without performing deletion.
 */
export function createRetentionPolicy(input) {
  if(!input?.policyId || !input?.recordType || !input?.retentionClass) {
    throw new Error("policyId, recordType and retentionClass are required.");
  }
  return {
    policyId:input.policyId,
    recordType:input.recordType,
    retentionClass:input.retentionClass,
    minimumRetention:input.minimumRetention??null,
    legalHoldSupported:input.legalHoldSupported!==false,
    reviewRequired:input.reviewRequired!==false
  };
}

export function evaluateRetention(record,policy,context={}) {
  if(!record || !policy) throw new Error("Record and policy are required.");
  if(context.legalHold===true) return {action:"retain",reason:"legal_hold"};
  return {
    action:"retain",
    reason:"policy_review_required",
    policyId:policy.policyId,
    recordId:record.id??null
  };
}
