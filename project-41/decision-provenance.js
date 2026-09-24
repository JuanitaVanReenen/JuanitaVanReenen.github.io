/**
 * Decision provenance layer.
 * Links a human decision to the exact assurance package, snapshot and ruleset
 * that were presented when the decision was recorded.
 */

export function recordHumanDecision(input) {
  if(!input?.decisionId || !input?.snapshotId || !input?.rulesetRef) {
    throw new Error("Decision requires decisionId, snapshotId and rulesetRef.");
  }
  if(!input.decisionMaker || !input.outcome) {
    throw new Error("Human decision requires decision maker and outcome.");
  }
  return {
    schemaVersion:"0.1",
    decisionId:input.decisionId,
    snapshotId:input.snapshotId,
    gateId:input.gateId ?? null,
    rulesetRef:{...input.rulesetRef},
    decisionMaker:{...input.decisionMaker},
    outcome:input.outcome,
    rationale:input.rationale ?? "",
    decidedAt:input.decidedAt ?? new Date().toISOString(),
    sourceRefs:[...(input.sourceRefs??[])]
  };
}

export function verifyDecisionProvenance(decision,{snapshotId,rulesetRef}={}) {
  return {
    decisionId:decision?.decisionId ?? null,
    snapshotMatch:decision?.snapshotId===snapshotId,
    rulesetMatch:decision?.rulesetRef?.id===rulesetRef?.id &&
      decision?.rulesetRef?.version===rulesetRef?.version,
    provenanceComplete:Boolean(
      decision?.decisionMaker &&
      decision?.outcome &&
      decision?.snapshotId &&
      decision?.rulesetRef?.id &&
      decision?.rulesetRef?.version
    )
  };
}
