import assert from "node:assert/strict";
import { createPackageSnapshot, comparePackageSnapshots } from "./package-snapshots.js";

const fixture = JSON.parse(
  await import("node:fs/promises").then(fs =>
    fs.readFile("./test-fixtures/package-snapshot-test.json", "utf8")
  )
);

const previous = createPackageSnapshot(fixture.previous, { snapshotId: fixture.previous.snapshotId });
const current = createPackageSnapshot(fixture.current, { snapshotId: fixture.current.snapshotId });
const comparison = comparePackageSnapshots(previous, current);

assert.equal(comparison.readiness.changed, true);
assert.equal(comparison.readiness.previous, "blocked_pending_resolution");
assert.equal(comparison.readiness.current, "ready_for_human_decision");
assert.deepEqual(comparison.requirementStatus.changed, ["TECH-002"]);
assert.deepEqual(comparison.findings.removed, ["FND-001"]);
assert.deepEqual(comparison.actions.removed, ["ACT-001"]);
assert.deepEqual(comparison.evidence.added, ["E-CAP-2"]);
assert.equal(comparison.summary.changedItems >= 1, true);

console.log("Package snapshot comparison tests passed.");
