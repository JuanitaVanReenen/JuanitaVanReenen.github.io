/**
 * Versioned evidence/change ledger.
 * Preserves history and calculates downstream impact without overwriting prior state.
 */

export function appendEvidenceVersion(ledger, nextEvidence) {
  const history = [...(ledger.evidenceHistory ?? [])];
  const prior = history.filter(e => e.id === nextEvidence.id).at(-1) ?? null;
  const versionNumber = prior ? Number(prior.versionNumber ?? 0) + 1 : 1;

  const record = {
    ...nextEvidence,
    versionNumber,
    recordedAt: nextEvidence.recordedAt ?? new Date().toISOString(),
    supersedesVersion: prior?.versionNumber ?? null
  };

  return {
    ...ledger,
    evidenceHistory: [...history, record],
    changeEvents: [
      ...(ledger.changeEvents ?? []),
      {
        id: nextEvidence.changeId ?? `CHG-EVID-${nextEvidence.id}-v${versionNumber}`,
        type: prior ? "evidence_version_change" : "evidence_added",
        evidenceId: nextEvidence.id,
        fromVersion: prior?.versionNumber ?? null,
        toVersion: versionNumber,
        recordedAt: record.recordedAt,
        reason: nextEvidence.changeReason ?? null
      }
    ]
  };
}

export function compareEvidenceVersions(ledger, evidenceId) {
  const versions = (ledger.evidenceHistory ?? [])
    .filter(e => e.id === evidenceId)
    .sort((a,b) => a.versionNumber - b.versionNumber);

  if (versions.length < 2) {
    return { evidenceId, comparable: false, versions };
  }

  const previous = versions.at(-2);
  const current = versions.at(-1);

  return {
    evidenceId,
    comparable: true,
    previousVersion: previous,
    currentVersion: current,
    changedFields: Object.keys({...previous, ...current}).filter(key =>
      JSON.stringify(previous[key]) !== JSON.stringify(current[key])
    )
  };
}

export function auditEvent(type, actor, target, metadata = {}) {
  return {
    id: `AUD-${Date.now()}-${Math.random().toString(36).slice(2,8)}`,
    type,
    actor,
    target,
    metadata,
    occurredAt: new Date().toISOString()
  };
}
