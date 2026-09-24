import {runAssuranceWorkflow} from "./assurance-workflow.js";
import {createPackageSnapshot,comparePackageSnapshots} from "./package-snapshots.js";
import {recordGateReview,compareGateReviews,lifecycleSummary} from "./gate-lifecycle.js";
import {appendLedgerEvent} from "./assurance-ledger.js";
import {evaluateGateTransition} from "./transition-rules.js";

export function processGateReview(input){
  if(!input?.project || !input?.gate) throw new Error("Project and gate are required.");
  const workflow=runAssuranceWorkflow(input.workflowInput);
  const snapshot=createPackageSnapshot(workflow.decisionPackage,{
    snapshotId:input.snapshotId,
    projectId:input.project.id,
    gateId:input.gate.id
  });

  const previous=input.previousReview ?? null;
  const review={
    id:input.reviewId,
    gate:input.gate,
    snapshotId:snapshot.id,
    readiness:workflow.decisionPackage.readiness,
    unresolvedFindingIds:workflow.findings.filter(f=>f.status!=="resolved").map(f=>f.id),
    openActionIds:workflow.actions.filter(a=>a.status!=="completed").map(a=>a.id),
    evidenceChangeIds:input.evidenceChangeIds ?? [],
    downstreamImpactIds:input.downstreamImpactIds ?? [],
    humanDecision:input.humanDecision ?? null
  };

  const lifecycle=recordGateReview(input.lifecycle ?? {id:input.project.id},review);
  const comparison=previous?compareGateReviews(previous,review):null;
  const packageComparison=input.previousPackage
    ? comparePackageSnapshots(input.previousPackage,snapshot)
    : null;
  const transition=input.targetGate
    ? evaluateGateTransition({currentReview:review,targetGate:input.targetGate})
    : null;

  const ledger=[...(input.ledger ?? [])];
  ledger.push(appendLedgerEvent(ledger,{type:"gate_assessed",gateId:input.gate.id,reviewId:review.id,readiness:review.readiness}));
  ledger.push(appendLedgerEvent(ledger,{type:"package_snapshot_created",gateId:input.gate.id,snapshotId:snapshot.id}));

  return {
    workflow,snapshot,review,lifecycle,
    comparison,packageComparison,transition,
    lifecycleSummary:lifecycleSummary(lifecycle),
    ledger
  };
}
