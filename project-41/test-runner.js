/**
 * Controlled test runner for the assurance foundation.
 * Run with: node project-41/test-runner.js
 */

import fs from "node:fs";
import { assessRequirement, detectConflicts, assessGate } from "./assurance-engine.js";

const fixture = JSON.parse(
  fs.readFileSync(new URL("./test-fixtures/sample-project.json", import.meta.url), "utf8")
);
const requirements = JSON.parse(
  fs.readFileSync(new URL("./requirements.json", import.meta.url), "utf8")
).requirements;

const assessments = requirements.map(req =>
  assessRequirement(req, fixture.evidence ?? [])
);

const conflicts = detectConflicts(fixture.claims ?? []);

const gate = assessGate(
  requirements,
  assessments,
  new Set(["missing", "conflicting", "unsupported"])
);

const expected = {
  hasCapacityConflict: conflicts.some(c => c.subject === "plant_capacity_ml_day"),
  capacityIsConflicting: assessments.some(
    a => a.requirementId === "TECH-002" && a.status === "conflicting"
  ),
  criticalGateBlocked: gate.ready === false
};

const failed = Object.entries(expected).filter(([, value]) => !value);

console.log(JSON.stringify({
  fixture: fixture.project?.name,
  requirementAssessments: assessments,
  conflicts,
  gate,
  expected,
  passed: failed.length === 0,
  failedChecks: failed.map(([name]) => name)
}, null, 2));

if (failed.length) process.exit(1);
