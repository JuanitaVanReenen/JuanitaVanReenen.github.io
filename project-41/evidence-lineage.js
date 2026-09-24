/**
 * Evidence lineage and verification foundation.
 * Every decision-relevant statement should be traceable to source evidence,
 * its extraction/interpretation, verification status and reviewer.
 */

export const VERIFICATION_STATUS = Object.freeze({
  UNVERIFIED: "unverified",
  PARTIALLY_VERIFIED: "partially_verified",
  VERIFIED: "verified",
  REJECTED: "rejected",
  SUPERSEDED: "superseded"
});

export function createEvidenceRecord(input) {
  if (!input?.id || !input?.source) throw new Error("Evidence requires id and source");
  return {
    id: input.id,
    source: input.source,
    documentId: input.documentId ?? null,
    locator: input.locator ?? null,
    extractedText: input.extractedText ?? null,
    issuedAt: input.issuedAt ?? null,
    receivedAt: input.receivedAt ?? null,
    version: input.version ?? null,
    checksum: input.checksum ?? null,
    authority: input.authority ?? "unknown",
    verification: {
      status: input.verification?.status ?? VERIFICATION_STATUS.UNVERIFIED,
      verifiedBy: input.verification?.verifiedBy ?? null,
      verifiedAt: input.verification?.verifiedAt ?? null,
      method: input.verification?.method ?? null,
      notes: input.verification?.notes ?? null
    },
    supersedes: input.supersedes ?? null
  };
}

export function createClaimRecord(input) {
  if (!input?.id || !input?.subject) throw new Error("Claim requires id and subject");
  return {
    id: input.id,
    subject: input.subject,
    value: input.value ?? null,
    unit: input.unit ?? null,
    evidenceIds: input.evidenceIds ?? [],
    assumption: Boolean(input.assumption),
    status: input.status ?? "active"
  };
}

export function traceClaim(claim, evidenceById) {
  const lineage = (claim.evidenceIds ?? []).map(id => {
    const evidence = evidenceById.get(id);
    return evidence ? {
      evidenceId: id,
      verificationStatus: evidence.verification.status,
      source: evidence.source,
      locator: evidence.locator,
      version: evidence.version,
      checksum: evidence.checksum
    } : {
      evidenceId: id,
      verificationStatus: "missing_evidence_record"
    };
  });

  const hasMissing = lineage.some(x => x.verificationStatus === "missing_evidence_record");
  const hasRejected = lineage.some(x => x.verificationStatus === VERIFICATION_STATUS.REJECTED);

  return {
    claimId: claim.id,
    traceable: !hasMissing && !hasRejected && lineage.length > 0,
    lineage
  };
}
