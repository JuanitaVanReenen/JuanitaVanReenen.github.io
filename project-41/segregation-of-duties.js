/**
 * Segregation-of-duties policy foundation.
 * Prevents a single role from silently combining incompatible governance actions.
 */
const incompatible={
 verify_and_decide:["verify","record_decision"],
 prepare_and_administer_ruleset:["prepare","administer_ruleset"]
};

export function canPerformWithSeparation(role,action,context={}) {
  const prior=context.priorActions??[];
  for(const actions of Object.values(incompatible)) {
    if(actions.includes(action) && prior.some(a=>actions.includes(a) && a!==action)) {
      return {allowed:false,reason:"segregation_of_duties_required",conflict:actions};
    }
  }
  return {allowed:true,reason:"no_separation_conflict"};
}

export function evaluateDecisionSeparation(input) {
  if(!input?.preparerId || !input?.verifierId || !input?.decisionMakerId) {
    throw new Error("Preparer, verifier and decision maker are required.");
  }
  return {
    allowed:input.preparerId!==input.decisionMakerId && input.verifierId!==input.decisionMakerId,
    reason:input.preparerId!==input.decisionMakerId && input.verifierId!==input.decisionMakerId
      ?"roles_separated":"decision_role_conflict"
  };
}
