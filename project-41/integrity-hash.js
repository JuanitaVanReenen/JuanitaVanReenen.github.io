import {createHash} from "node:crypto";

/**
 * Integrity metadata foundation.
 * Production storage should calculate and preserve a content hash for immutable
 * evidence/package artifacts. This utility is deterministic for serialized input.
 */

export function canonicalize(value) {
  return JSON.stringify(value, Object.keys(value??{}).sort());
}

export function contentHash(value) {
  return createHash("sha256").update(canonicalize(value)).digest("hex");
}

export function createIntegrityRecord(record) {
  return {
    algorithm:"SHA-256",
    hash:contentHash(record),
    generatedAt:new Date().toISOString()
  };
}

export function verifyIntegrity(record,integrity) {
  return Boolean(integrity?.hash) && contentHash(record)===integrity.hash;
}
