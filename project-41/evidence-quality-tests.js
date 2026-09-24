import assert from "node:assert/strict";
import {assessEvidenceQuality,assessEvidenceSet} from "./evidence-quality.js";

assert.equal(assessEvidenceQuality({evidenceId:"E-1"}).quality,"insufficient");
assert.equal(assessEvidenceQuality({evidenceId:"E-2",sourceRef:"DOC-1",locator:"p14",verificationStatus:"partially_verified"}).quality,"weak");
assert.equal(assessEvidenceQuality({evidenceId:"E-3",sourceRef:"DOC-2",locator:"p20",verificationStatus:"verified"}).quality,"adequate");
assert.equal(assessEvidenceQuality({evidenceId:"E-4",sourceRef:"DOC-3",locator:"p9",verificationStatus:"verified",integrityVerified:true}).quality,"strong");
assert.equal(assessEvidenceSet([{evidenceId:"E-1",sourceRef:"D",locator:"p1",verificationStatus:"verified"}]).adequate,1);

console.log("Evidence quality tests passed.");
