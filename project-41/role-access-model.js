/**
 * Role/access policy foundation.
 * Defines which roles may prepare, review, record or administer assurance data.
 * This is policy metadata; production authorization must be enforced server-side.
 */

const ACTIONS=Object.freeze({
  VIEW:"view",
  PREPARE:"prepare",
  VERIFY:"verify",
  REVIEW_GATE:"review_gate",
  RECORD_DECISION:"record_decision",
  ADMINISTER_RULESET:"administer_ruleset"
});

const DEFAULT_POLICY=Object.freeze({
  project_analyst:[ACTIONS.VIEW,ACTIONS.PREPARE],
  evidence_reviewer:[ACTIONS.VIEW,ACTIONS.VERIFY],
  gate_reviewer:[ACTIONS.VIEW,ACTIONS.REVIEW_GATE,ACTIONS.RECORD_DECISION],
  system_administrator:[ACTIONS.VIEW,ACTIONS.ADMINISTER_RULESET]
});

export function can(role,action,policy=DEFAULT_POLICY) {
  return Boolean(policy[role]?.includes(action));
}

export function explainAccess(role,action,policy=DEFAULT_POLICY) {
  return {
    role,
    action,
    allowed:can(role,action,policy),
    reason:can(role,action,policy)
      ? "Role is configured for this action."
      : "Role is not configured for this action."
  };
}

export {ACTIONS,DEFAULT_POLICY};
