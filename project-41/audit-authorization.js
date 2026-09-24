/**
 * Authorization audit events.
 * Records security-relevant authorization decisions without changing assurance results.
 */

export const AUTH_EVENTS={
 ACCESS_GRANTED:"access_granted",
 ACCESS_DENIED:"access_denied",
 DECISION_RECORDING_GRANTED:"decision_recording_granted",
 DECISION_RECORDING_DENIED:"decision_recording_denied"
};

export function createAuthorizationAuditEvent(input) {
  if(!input?.eventId || !input?.actorId || !input?.tenantId || !input?.projectId || !input?.action || !input?.result) {
    throw new Error("Authorization audit event requires identity, scope, action and result.");
  }
  return {
    eventId:input.eventId,
    actorId:input.actorId,
    tenantId:input.tenantId,
    projectId:input.projectId,
    action:input.action,
    result:input.result,
    reason:input.reason??null,
    occurredAt:input.occurredAt??new Date().toISOString()
  };
}

export function isDenied(event) {
  return event.result==="denied";
}
