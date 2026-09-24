/**
 * Requirement sufficiency foundation.
 * Combines evidence quality with requirement-specific thresholds without making
 * the final engineering decision automatically.
 */
export function assessRequirementSufficiency(requirement,evidenceAssessments=[]) {
  if(!requirement?.requirementId) throw new Error("requirementId is required.");
  const threshold=requirement.minimumEvidenceQuality??"adequate";
  const order={insufficient:0,weak:1,adequate:2,strong:3};
  const relevant=evidenceAssessments.filter(e=>e.requirementId===requirement.requirementId);
  const qualifying=relevant.filter(e=>order[e.quality]>=order[threshold]);
  const status=qualifying.length?"supported":"insufficient";
  return {
    requirementId:requirement.requirementId,
    threshold,
    evidenceCount:relevant.length,
    qualifyingEvidenceCount:qualifying.length,
    status,
    humanReviewRequired:true
  };
}

export function assessRequirementSet(requirements=[],evidenceAssessments=[]) {
  return requirements.map(r=>assessRequirementSufficiency(r,evidenceAssessments));
}
