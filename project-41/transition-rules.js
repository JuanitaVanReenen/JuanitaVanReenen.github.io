/**
 * Gate transition control layer.
 * Evaluates whether a project may be presented as ready to move from one configured
 * lifecycle stage to another. It never grants approval.
 */

export function evaluateGateTransition(input) {
  const blockers = [];

  if (!input?.currentReview) blockers.push({code:"NO_CURRENT_REVIEW",message:"Current gate review is missing."});
  if (!input?.targetGate?.id) blockers.push({code:"NO_TARGET_GATE",message:"Target gate is not configured."});

  const review=input?.currentReview;
  if (review?.readiness !== "ready_for_human_decision") {
    blockers.push({
      code:"READINESS_BLOCKED",
      message:"Current assurance package is not ready for human decision."
    });
  }

  for (const id of review?.unresolvedFindingIds ?? []) {
    blockers.push({code:"OPEN_FINDING",targetId:id,message:`Finding ${id} remains unresolved.`});
  }

  for (const id of review?.openActionIds ?? []) {
    blockers.push({code:"OPEN_ACTION",targetId:id,message:`Action ${id} remains open.`});
  }

  const result={
    schemaVersion:"0.1",
    fromGate:review?.gate?.id ?? null,
    toGate:input?.targetGate?.id ?? null,
    status:blockers.length ? "blocked_pending_resolution" : "eligible_for_human_gate_review",
    blockers
  };

  return result;
}

export function assertNoAutomaticApproval(result) {
  if (result.status === "approved") {
    throw new Error("Automatic approval is prohibited.");
  }
  return true;
}
