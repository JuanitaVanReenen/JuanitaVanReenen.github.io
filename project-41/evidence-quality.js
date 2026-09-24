/**
 * Evidence quality assessment foundation.
 * Separates evidence existence from quality, verification and decision sufficiency.
 */
export const QUALITY={strong:"strong",adequate:"adequate",weak:"weak",insufficient:"insufficient"};

export function assessEvidenceQuality(evidence) {
  if(!evidence?.evidenceId) throw new Error("evidenceId is required.");
  if(!evidence.sourceRef || !evidence.locator) return {evidenceId:evidence.evidenceId,quality:QUALITY.insufficient,reason:"source_or_locator_missing"};
  if(evidence.verificationStatus==="verified" && evidence.integrityVerified===true) return {evidenceId:evidence.evidenceId,quality:QUALITY.strong,reason:"verified_and_integrity_checked"};
  if(evidence.verificationStatus==="verified") return {evidenceId:evidence.evidenceId,quality:QUALITY.adequate,reason:"verified_source_evidence"};
  if(evidence.verificationStatus==="partially_verified") return {evidenceId:evidence.evidenceId,quality:QUALITY.weak,reason:"partial_verification"};
  return {evidenceId:evidence.evidenceId,quality:QUALITY.weak,reason:"verification_incomplete"};
}

export function assessEvidenceSet(evidence=[]) {
  const results=evidence.map(assessEvidenceQuality);
  return {total:results.length,strong:results.filter(x=>x.quality==="strong").length,adequate:results.filter(x=>x.quality==="adequate").length,weak:results.filter(x=>x.quality==="weak").length,insufficient:results.filter(x=>x.quality==="insufficient").length,results};
}
