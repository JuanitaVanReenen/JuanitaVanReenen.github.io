import assert from "node:assert/strict";
import {createDocumentVersion,createEvidenceProvenance,traceEvidenceToSource} from "./source-provenance.js";

const doc=createDocumentVersion({documentId:"DOC-001",versionId:"DOC-001-v2",sourceRef:"engineering-register",issuedAt:"2026-09-24",supersedes:"DOC-001-v1"});
const evidence=createEvidenceProvenance({evidenceId:"E-CAP-2",documentVersionId:"DOC-001-v2",locator:"page 14 / capacity table",verificationStatus:"verified",verifiedBy:"reviewer-7"});
const trace=traceEvidenceToSource(evidence,[doc]);

assert.equal(trace.status,"source_resolved");
assert.equal(trace.documentVersion.versionId,"DOC-001-v2");
assert.equal(trace.locator,"page 14 / capacity table");
assert.throws(()=>createDocumentVersion({documentId:"DOC-001"}));

console.log("Source provenance tests passed.");
