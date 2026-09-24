import {runAssuranceWorkflow} from "./assurance-workflow.js";
import {createPackageSnapshot,comparePackageSnapshots} from "./package-snapshots.js";
import {recordGateReview,compareGateReviews,lifecycleSummary} from "./gate-lifecycle.js";
import {appendLedgerEvent} from "./assurance-ledger.js";
import {evaluateGateTransition} from "./transition-rules.js";

function deriveFindings(input, workflow) {
  const supplied = [...(input.workflowInput?.findings ?? [])];
  for (const failure of workflow.gate.criticalFailures ?? []) {
    if (!supplied.some(f => f.id === `FINDING-${failure}`)) {
      supplied.push({id:`FINDING-${failure}`,title:`Critical requirement ${failure} is not established`,severity:"critical",status:"open",requirementId:failure});
    }
  }
  for (const conflict of workflow.conflicts ?? []) {
    const id=`CONFLICT-${conflict.id}`;
    if (!supplied.some(f => f.id === id)) {
      supplied.push({id,title:`Conflicting claim set for ${conflict.subject}`,severity:"critical",status:"open",conflictId:conflict.id});
    }
  }
  return supplied;
}

function deriveActions(input, findings) {
  const actions=[...(input.workflowInput?.actions ?? [])];
  for (const finding of findings) {
    if (finding.status!=="resolved" && finding.status!=="superseded" && !actions.some(a=>a.findingId===finding.id)) {
      actions.push({id:`ACTION-${finding.id}`,findingId:finding.id,status:"open",description:"Resolve the finding and provide verified evidence."});
    }
  }
  return actions;
}

export function processGateReview(input){
  if(!input?.project || !input?.gate) throw new Error("Project and gate are required.");

  const base={...(input.workflowInput ?? {}),project:input.project,gate:input.gate};
  const workflow=runAssuranceWorkflow(base);
  const findings=deriveFindings(input,workflow);
  const actions=deriveActions(input,findings);

  const packageWorkflow=runAssuranceWorkflow({...base,findings,actions});
  const snapshot=createPackageSnapshot(packageWorkflow.decisionPackage,{
    snapshotId:input.snapshotId,
    projectId:input.project.id,
    gateId:input.gate.id
  });

  const review={
    id:input.reviewId,
    gate:input.gate,
    snapshotId:snapshot.snapshotId,
    readiness:packageWorkflow.decisionPackage.readiness,
    unresolvedFindingIds:packageWorkflow.decisionPackage.sections.criticalFindings.map(f=>f.id),
    openActionIds:packageWorkflow.decisionPackage.sections.openActions.map(a=>a.id),
    evidenceChangeIds:input.evidenceChangeIds ?? [],
    downstreamImpactIds:input.downstreamImpactIds ?? [],
    humanDecision:input.humanDecision ?? packageWorkflow.decisionPackage.humanDecision
  };

  const lifecycle=recordGateReview(input.lifecycle ?? {id:input.project.id},review);
  const previous=input.previousReview ?? null;
  const comparison=previous?compareGateReviews(previous,review):null;
  const packageComparison=input.previousPackage?comparePackageSnapshots(input.previousPackage,snapshot):null;
  const transition=input.targetGate?evaluateGateTransition({currentReview:review,targetGate:input.targetGate}):null;

  let ledger=[...(input.ledger ?? [])];
  ledger=appendLedgerEvent(ledger,{type:"gate_assessed",gateId:input.gate.id,reviewId:review.id,readiness:review.readiness});
  ledger=appendLedgerEvent(ledger,{type:"package_snapshot_created",gateId:input.gate.id,snapshotId:snapshot.snapshotId});

  return {workflow:packageWorkflow,snapshot,review,lifecycle,comparison,packageComparison,transition,lifecycleSummary:lifecycleSummary(lifecycle),ledger,findings,actions};
}
