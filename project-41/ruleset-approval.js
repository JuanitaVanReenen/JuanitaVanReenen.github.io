/**
 * Ruleset governance foundation.
 * Separates ruleset publication from ordinary configuration editing.
 */
export function createRulesetChange(input) {
  if(!input?.changeId || !input?.rulesetId || !input?.fromVersion || !input?.toVersion || !input?.reviewerId) {
    throw new Error("Ruleset change requires version transition and reviewer.");
  }
  return {
    changeId:input.changeId,
    rulesetId:input.rulesetId,
    fromVersion:input.fromVersion,
    toVersion:input.toVersion,
    reviewerId:input.reviewerId,
    status:input.status??"proposed",
    rationale:input.rationale??null,
    evidenceRefs:input.evidenceRefs??[],
    effectiveAt:input.effectiveAt??null
  };
}

export function evaluateRulesetPublication(change) {
  if(change.status!=="approved") return {publishable:false,reason:"human_ruleset_review_required"};
  if(!change.evidenceRefs?.length) return {publishable:false,reason:"supporting_evidence_required"};
  if(!change.effectiveAt) return {publishable:false,reason:"effective_date_required"};
  return {publishable:true,reason:"approved_and_evidenced"};
}
