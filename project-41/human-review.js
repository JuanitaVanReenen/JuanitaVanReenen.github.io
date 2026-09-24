/**
 * Human review workflow foundation.
 * Keeps reviewer observations and disposition separate from automated findings.
 */
export function createHumanReview(input) {
  if(!input?.reviewId || !input?.reviewerId || !input?.subjectId || !input?.reviewedAt) {
    throw new Error("reviewId, reviewerId, subjectId and reviewedAt are required.");
  }
  if(!["confirmed","challenged","deferred"].includes(input.disposition)) {
    throw new Error("Invalid review disposition.");
  }
  return {
    reviewId:input.reviewId,
    reviewerId:input.reviewerId,
    subjectId:input.subjectId,
    disposition:input.disposition,
    reviewedAt:input.reviewedAt,
    observations:input.observations??[],
    evidenceRefs:input.evidenceRefs??[],
    rationale:input.rationale??null,
    followUpActionIds:input.followUpActionIds??[]
  };
}

export function reviewRequiresFollowUp(review) {
  return review.disposition!=="confirmed" || review.followUpActionIds.length>0;
}
