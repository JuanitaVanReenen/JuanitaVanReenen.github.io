import assert from "node:assert/strict";
import {contentHash,createIntegrityRecord,verifyIntegrity} from "./integrity-hash.js";

const record={id:"SNAP-001",readiness:"blocked_pending_resolution",version:1};
const integrity=createIntegrityRecord(record);
assert.equal(contentHash(record),integrity.hash);
assert.equal(verifyIntegrity(record,integrity),true);
assert.equal(verifyIntegrity({...record,version:2},integrity),false);

console.log("Integrity tests passed.");
