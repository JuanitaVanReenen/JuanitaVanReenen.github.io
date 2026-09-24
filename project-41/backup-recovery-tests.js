import assert from "node:assert/strict";
import {createRecoveryRecord,assessRecoverability} from "./backup-recovery.js";

const tested=createRecoveryRecord({
 backupId:"BKP-001",scope:"TENANT-A/PROJECT-41",
 createdAt:"2026-09-24T10:00:00Z",storageRef:"vault://backup-001",
 recoveryTestedAt:"2026-09-24T11:00:00Z",status:"verified"
});
assert.equal(assessRecoverability(tested).status,"recoverable_tested");

const untested=createRecoveryRecord({
 backupId:"BKP-002",scope:"TENANT-A/PROJECT-41",
 createdAt:"2026-09-24T10:00:00Z",status:"unverified"
});
assert.equal(assessRecoverability(untested).status,"recovery_test_required");

console.log("Backup and recovery tests passed.");
