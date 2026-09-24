/**
 * Gate decision-package generator.
 * Produces a structured, auditable package from assurance records.
 */

export function generateDecisionPackage(input) {
  const {
    project,
    gate,
    requirements = [],
    findings = [],
    actions = [],
    changes = [],
    evidence = [],
    decisions = []
  } = input;

  const criticalOpen = findings.filter(f =>
    f.severity === "critical" && !["resolved", "superseded"].includes(f.status)
  );

  const unresolvedRequirements = requirements.filter(r =>
    ["missing", "conflicting", "unsupported"].includes(r.status)
  );

  const readiness = criticalOpen.length === 0 && unresolvedRequirements.length === 0
    ? "ready_for_human_decision"
    : "blocked_pending_resolution";

  return {
    schemaVersion: "0.1",
    generatedAt: new Date().toISOString(),
    project,
    gate,
    readiness,
    executiveSummary: readiness === "ready_for_human_decision"
      ? "No critical unresolved assurance blockers were identified by the configured rules."
      : "One or more assurance blockers remain and require resolution before gate progression can be considered.",
    sections: {
      requirementStatus: requirements,
      criticalFindings: criticalOpen,
      openActions: actions.filter(a => a.status !== "complete"),
      changeRegister: changes,
      evidenceRegister: evidence.map(e => ({
        id: e.id,
        source: e.source,
        version: e.version ?? null,
        verificationStatus: e.verification?.status ?? "unverified"
      })),
      priorDecisions: decisions
    },
    humanDecision: {
      required: true,
      outcome: null,
      decisionMaker: null,
      rationale: null,
      decidedAt: null
    }
  };
}

export function renderDecisionPackageMarkdown(pkg) {
  return [
    "# Gate Decision Assurance Package",
    "",
    `Project: ${pkg.project?.name ?? "Unnamed project"}`,
    `Gate: ${pkg.gate?.name ?? "Unnamed gate"}`,
    `Readiness: ${pkg.readiness}`,
    "",
    "## Executive summary",
    pkg.executiveSummary,
    "",
    "## Critical findings",
    ...((pkg.sections.criticalFindings.length
      ? pkg.sections.criticalFindings.map(f => `- [${f.severity.toUpperCase()}] ${f.id}: ${f.title}`)
      : ["- None identified by the configured rules."])),
    "",
    "## Open actions",
    ...((pkg.sections.openActions.length
      ? pkg.sections.openActions.map(a => `- ${a.id}: ${a.findingId ?? "General action"} — ${a.status}`)
      : ["- None."])),
    "",
    "## Human decision record",
    "- Decision maker: ____________________",
    "- Outcome: ___________________________",
    "- Rationale: _________________________",
    "- Date: ______________________________",
    "",
    "This package is an assurance aid. It does not replace qualified engineering, regulatory, environmental, financial or investment judgement."
  ].join("\n");
}
