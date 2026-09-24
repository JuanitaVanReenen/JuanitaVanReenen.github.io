/**
 * Controlled governance-exception foundation.
 * Exceptions never erase the underlying control conflict.
 */
export function createGovernanceException(input) {
  if(!input?.exceptionId || !input?.controlId || !input?.requesterId || !input?.reason || !input?.expiresAt) {
    throw new Error("Exception requires control, requester, reason and expiry.");
  }
  return {
    exceptionId:input.exceptionId,
    controlId:input.controlId,
    requesterId:input.requesterId,
    reason:input.reason,
    scope:input.scope??null,
    compensatingControls:input.compensatingControls??[],
    status:input.status??"proposed",
    approvedBy:input.approvedBy??null,
    approvedAt:input.approvedAt??null,
    expiresAt:input.expiresAt
  };
}

export function evaluateException(exception) {
  if(exception.status!=="approved") return {usable:false,reason:"exception_not_approved"};
  if(!exception.approvedBy || !exception.approvedAt) return {usable:false,reason:"approval_provenance_missing"};
  if(!exception.compensatingControls.length) return {usable:false,reason:"compensating_control_required"};
  return {usable:true,reason:"controlled_exception"};
}
