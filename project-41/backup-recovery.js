/**
 * Backup/recovery governance foundation.
 * Models recoverability metadata; it does not perform infrastructure backups.
 */
export function createRecoveryRecord(input) {
  if(!input?.backupId || !input?.scope || !input?.createdAt) {
    throw new Error("backupId, scope and createdAt are required.");
  }
  return {
    backupId:input.backupId,
    scope:input.scope,
    createdAt:input.createdAt,
    integrityRef:input.integrityRef??null,
    storageRef:input.storageRef??null,
    recoveryTestedAt:input.recoveryTestedAt??null,
    status:input.status??"unverified"
  };
}

export function assessRecoverability(record) {
  if(record.status==="verified" && record.recoveryTestedAt) {
    return {status:"recoverable_tested",backupId:record.backupId};
  }
  return {status:"recovery_test_required",backupId:record.backupId};
}
