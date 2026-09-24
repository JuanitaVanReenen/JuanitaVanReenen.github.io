import assert from "node:assert/strict";
import {recordGateReview,compareGateReviews,lifecycleSummary} from "./gate-lifecycle.js";

let lifecycle={reviews:[]};
lifecycle=recordGateReview(lifecycle,{
 id:"REV-001",snapshotId:"SNAP-001",readiness:"blocked_pending_resolution",
 gate:{id:"GATE-DEV",stage:"development"},unresolvedFindingIds:["FND-001"],
 openActionIds:["ACT-001"],evidenceChangeIds:[],downstreamImpactIds:[],
 humanDecision:{outcome:null},recordedAt:"2026-02-01T10:00:00Z"
});
lifecycle=recordGateReview(lifecycle,{
 id:"REV-002",snapshotId:"SNAP-002",readiness:"ready_for_human_decision",
 gate:{id:"GATE-PROC",stage:"procurement"},unresolvedFindingIds:[],
 openActionIds:[],evidenceChangeIds:["CHG-EVID-CAP-v2"],downstreamImpactIds:["TECH-002"],
 humanDecision:{outcome:null},recordedAt:"2026-03-01T10:00:00Z"
});
const comparison=compareGateReviews(lifecycle.reviews[0],lifecycle.reviews[1]);
assert.equal(comparison.gateTransition.from,"development");
assert.equal(comparison.gateTransition.to,"procurement");
assert.equal(comparison.readinessChanged,true);
assert.deepEqual(comparison.unresolvedFindings.previous,["FND-001"]);
assert.deepEqual(comparison.unresolvedFindings.current,[]);
assert.equal(comparison.humanDecisionRecorded,false);
const summary=lifecycleSummary(lifecycle);
assert.equal(summary.reviewCount,2);
assert.deepEqual(summary.stagesReviewed,["development","procurement"]);
console.log("Gate lifecycle tests passed.");
