/**
 * Source/document provenance foundation.
 * Keeps the origin and locator of evidence explicit.
 */

export function createDocumentVersion(input) {
  if(!input?.documentId || !input?.versionId || !input?.sourceRef) {
    throw new Error("documentId, versionId and sourceRef are required.");
  }
  return {
    documentId:input.documentId,
    versionId:input.versionId,
    sourceRef:input.sourceRef,
    issuedAt:input.issuedAt??null,
    supersedes:input.supersedes??null,
    integrityRef:input.integrityRef??null
  };
}

export function createEvidenceProvenance(input) {
  if(!input?.evidenceId || !input?.documentVersionId || !input?.locator) {
    throw new Error("evidenceId, documentVersionId and locator are required.");
  }
  return {
    evidenceId:input.evidenceId,
    documentVersionId:input.documentVersionId,
    locator:input.locator,
    extractedBy:input.extractedBy??"human",
    verifiedBy:input.verifiedBy??null,
    verificationStatus:input.verificationStatus??"unverified"
  };
}

export function traceEvidenceToSource(evidence,documents=[]) {
  const doc=documents.find(d=>d.versionId===evidence.documentVersionId);
  if(!doc) return {status:"source_not_found",evidenceId:evidence.evidenceId};
  return {status:"source_resolved",evidenceId:evidence.evidenceId,documentVersion:doc,locator:evidence.locator};
}
