import {can} from "./role-access-model.js";
import {recordHumanDecision,verifyDecisionProvenance} from "./decision-provenance.js";

/**
 * Authorization-aware human decision recording.
 * Authorization is checked before provenance is created.
 */
export function recordAuthorizedDecision(input,policy) {
  const actor=input?.actor;
  if(!actor?.role) throw new Error("Authenticated actor role is required.");
  if(!can(actor.role,"record_decision",policy)) {
    throw new Error("Actor is not authorized to record decisions.");
  }
  const decision=recordHumanDecision(input.decision);
  const verification=verifyDecisionProvenance(decision);
  return {decision,verification,authorization:{role:actor.role,action:"record_decision",authorized:true}};
}
