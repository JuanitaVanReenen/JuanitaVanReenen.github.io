/**
 * Gate package snapshot and comparison layer.
 * Snapshots preserve what was presented at a gate review; comparisons explain what changed.
 */

function stable(value) {
  return JSON.parse(JSON.stringify(value ?? null));
}

function indexById(items = []) {
  return new Map(items.filter(x => x?.id).map(x => [x.id, x]));
}

export function createPackageSnapshot(pkg, metadata = {}) {
  if (!pkg) throw new Error("Decision package is required.");
  return {
    schemaVersion: "0.1",
    snapshotId: metadata.snapshotId ?? `SNAP-${Date.now()}`,
    capturedAt: metadata.capturedAt ?? new Date().toISOString(),
    sourcePackageVersion: metadata.sourcePackageVersion ?? pkg.schemaVersion ?? "0.1",
    project: stable(pkg.project),
    gate: stable(pkg.gate),
    readiness: pkg.readiness,
    executiveSummary: pkg.executiveSummary,
    sections: stable(pkg.sections),
    humanDecision: stable(pkg.humanDecision)
  };
}

export function comparePackageSnapshots(previous, current) {
  if (!previous || !current) throw new Error("Both snapshots are required.");

  const compareList = (before = [], after = []) => {
    const a = indexById(before);
    const b = indexById(after);
    const added = [...b.keys()].filter(id => !a.has(id));
    const removed = [...a.keys()].filter(id => !b.has(id));
    const changed = [...b.keys()]
      .filter(id => a.has(id))
      .filter(id => JSON.stringify(a.get(id)) !== JSON.stringify(b.get(id)));
    return { added, removed, changed };
  };

  const requirementStatus = compareList(
    previous.sections?.requirementStatus,
    current.sections?.requirementStatus
  );
  const findings = compareList(
    previous.sections?.criticalFindings,
    current.sections?.criticalFindings
  );
  const actions = compareList(
    previous.sections?.openActions,
    current.sections?.openActions
  );
  const evidence = compareList(
    previous.sections?.evidenceRegister,
    current.sections?.evidenceRegister
  );

  return {
    schemaVersion: "0.1",
    previousSnapshotId: previous.snapshotId,
    currentSnapshotId: current.snapshotId,
    readiness: {
      previous: previous.readiness,
      current: current.readiness,
      changed: previous.readiness !== current.readiness
    },
    requirementStatus,
    findings,
    actions,
    evidence,
    summary: {
      addedItems: requirementStatus.added.length + findings.added.length + actions.added.length + evidence.added.length,
      removedItems: requirementStatus.removed.length + findings.removed.length + actions.removed.length + evidence.removed.length,
      changedItems: requirementStatus.changed.length + findings.changed.length + actions.changed.length + evidence.changed.length
    }
  };
}

export function renderPackageComparisonMarkdown(comparison) {
  return [
    "# Gate Package Change Report",
    "",
    `Previous snapshot: ${comparison.previousSnapshotId}`,
    `Current snapshot: ${comparison.currentSnapshotId}`,
    `Readiness: ${comparison.readiness.previous} → ${comparison.readiness.current}`,
    "",
    "## Requirement status changes",
    `- Added: ${comparison.requirementStatus.added.join(", ") || "None"}`,
    `- Removed: ${comparison.requirementStatus.removed.join(", ") || "None"}`,
    `- Changed: ${comparison.requirementStatus.changed.join(", ") || "None"}`,
    "",
    "## Findings",
    `- Added: ${comparison.findings.added.join(", ") || "None"}`,
    `- Removed: ${comparison.findings.removed.join(", ") || "None"}`,
    `- Changed: ${comparison.findings.changed.join(", ") || "None"}`,
    "",
    "## Evidence",
    `- Added: ${comparison.evidence.added.join(", ") || "None"}`,
    `- Removed: ${comparison.evidence.removed.join(", ") || "None"}`,
    `- Changed: ${comparison.evidence.changed.join(", ") || "None"}`,
    "",
    "This report describes package changes. It does not constitute approval or a substitute for qualified human decisions."
  ].join("\n");
}
