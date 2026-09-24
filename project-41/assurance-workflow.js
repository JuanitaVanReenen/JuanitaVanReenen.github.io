/**
 * Integrated orchestration layer.
 * Connects assessment, conflicts, findings and gate package generation.
 */

import { assessRequirement, detectConflicts, assessGate } from "./assurance-engine.js";
import { generateDecisionPackage } from "./decision-package.js";

export function runAssuranceWorkflow(input) {
  const requirements = input.requirements ?? [];
  const evidence = input.evidence ?? [];
  const claims = input.claims ?? [];
  const findings = input.findings ?? [];
  const actions = input.actions ?? [];

  const assessments = requirements.map(requirement =>
    assessRequirement(requirement, evidence)
  );

  const conflicts = detectConflicts(claims);

  const gate = assessGate(
    requirements,
    assessments,
    new Set(["missing", "conflicting", "unsupported"])
  );

  const normalizedRequirements = assessments.map(a => ({
    id: a.requirementId,
    status: a.status,
    evidenceIds: a.evidenceIds ?? [],
    issues: a.issues ?? []
  }));

  const packageResult = generateDecisionPackage({
    project: input.project,
    gate: input.gate,
    requirements: normalizedRequirements,
    findings,
    actions,
    changes: input.changes ?? [],
    evidence,
    decisions: input.decisions ?? []
  });

  return {
    schemaVersion: "0.1",
    project: input.project,
    assessments,
    conflicts,
    gate,
    decisionPackage: packageResult
  };
}
