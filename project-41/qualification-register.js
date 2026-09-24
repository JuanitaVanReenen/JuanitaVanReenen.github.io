/**
 * Reviewer qualification foundation.
 * Records whether a reviewer is currently qualified for a review domain/action.
 */
export function createQualification(input) {
  if(!input?.qualificationId || !input?.reviewerId || !input?.domain || !input?.validFrom || !input?.validUntil) {
    throw new Error("qualificationId, reviewerId, domain, validFrom and validUntil are required.");
  }
  return {
    qualificationId:input.qualificationId,
    reviewerId:input.reviewerId,
    domain:input.domain,
    scope:input.scope??[],
    validFrom:input.validFrom,
    validUntil:input.validUntil,
    status:input.status??"active",
    evidenceRefs:input.evidenceRefs??[]
  };
}

export function assessQualification(qualification,atDate) {
  if(qualification.status!=="active") return {qualified:false,reason:"qualification_inactive"};
  if(atDate<qualification.validFrom || atDate>qualification.validUntil) return {qualified:false,reason:"qualification_outside_validity"};
  return {qualified:true,reason:"qualification_current"};
}
