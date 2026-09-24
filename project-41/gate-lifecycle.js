/**
 * Cross-gate lifecycle layer.
 * Preserves gate assessments and compares successive review states.
 */

const ORDER = ["definition","development","procurement","construction","commissioning","operation"];

export function recordGateReview(lifecycle, review) {
  if (!review?.id || !review?.gate?.id || !review?.snapshotId) {
    throw new Error("Gate review requires id, gate.id and snapshotId.");
  }
  const reviews = [...(lifecycle.reviews ?? [])];
  if (reviews.some(r => r.id === review.id)) throw new Error(`Duplicate review id: ${review.id}`);
  return {
    schemaVersion:"0.1",
    ...lifecycle,
    reviews:[...reviews,{...review, recordedAt:review.recordedAt ?? new Date().toISOString()}]
  };
}

export function orderGateReviews(reviews=[]) {
  return [...reviews].sort((a,b) => {
    const ai=ORDER.indexOf(a.gate?.stage); const bi=ORDER.indexOf(b.gate?.stage);
    return (ai<0?999:ai)-(bi<0?999:bi) || new Date(a.recordedAt)-new Date(b.recordedAt);
  });
}

export function compareGateReviews(previous, current) {
  if (!previous || !current) throw new Error("Two gate reviews are required.");
  return {
    previousReviewId:previous.id,
    currentReviewId:current.id,
    gateTransition:{
      from:previous.gate?.stage ?? null,
      to:current.gate?.stage ?? null,
      sameStage:previous.gate?.stage === current.gate?.stage
    },
    snapshotTransition:{
      from:previous.snapshotId,
      to:current.snapshotId
    },
    readinessChanged:previous.readiness !== current.readiness,
    readiness:{previous:previous.readiness,current:current.readiness},
    unresolvedFindings:{
      previous:previous.unresolvedFindingIds ?? [],
      current:current.unresolvedFindingIds ?? []
    },
    openActions:{
      previous:previous.openActionIds ?? [],
      current:current.openActionIds ?? []
    },
    evidenceChanges:current.evidenceChangeIds ?? [],
    downstreamImpacts:current.downstreamImpactIds ?? [],
    humanDecisionRecorded:Boolean(current.humanDecision?.outcome)
  };
}

export function lifecycleSummary(lifecycle) {
  const reviews=orderGateReviews(lifecycle.reviews ?? []);
  return {
    reviewCount:reviews.length,
    latestReview:reviews.at(-1) ?? null,
    stagesReviewed:[...new Set(reviews.map(r=>r.gate?.stage).filter(Boolean))],
    blockedReviews:reviews.filter(r=>r.readiness==="blocked_pending_resolution").map(r=>r.id),
    decisionReadyReviews:reviews.filter(r=>r.readiness==="ready_for_human_decision").map(r=>r.id)
  };
}
