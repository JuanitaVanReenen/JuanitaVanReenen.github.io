/**
 * Water Infrastructure Decision Assurance Engine
 * Project 41 — foundation prototype
 *
 * Deterministic assurance logic. AI/document extraction can be added later,
 * but important statuses must remain traceable to explicit evidence and rules.
 */

const STATUS = Object.freeze({
  ESTABLISHED: "established",
  PARTIAL: "partially_established",
  MISSING: "missing",
  CONFLICTING: "conflicting",
  UNSUPPORTED: "unsupported"
});

export function assessRequirement(requirement, evidenceItems = []) {
  const linked = evidenceItems.filter(e =>
    Array.isArray(e.supports) && e.supports.includes(requirement.id)
  );

  if (linked.length === 0) {
    return {
      requirementId: requirement.id,
      status: STATUS.MISSING,
      evidenceCount: 0,
      reason: "No linked evidence was supplied."
    };
  }

  const conflicts = linked.filter(e => e.status === "conflict");
  if (conflicts.length) {
    return {
      requirementId: requirement.id,
      status: STATUS.CONFLICTING,
      evidenceCount: linked.length,
      reason: "Linked evidence contains a declared conflict.",
      evidenceIds: conflicts.map(e => e.id)
    };
  }

  const verified = linked.filter(e => e.verified === true);
  if (verified.length === linked.length) {
    return {
      requirementId: requirement.id,
      status: STATUS.ESTABLISHED,
      evidenceCount: linked.length,
      reason: "All linked evidence is marked verified.",
      evidenceIds: linked.map(e => e.id)
    };
  }

  return {
    requirementId: requirement.id,
    status: STATUS.PARTIAL,
    evidenceCount: linked.length,
    reason: "Evidence exists, but not all linked evidence is verified.",
    evidenceIds: linked.map(e => e.id)
  };
}

export function detectConflicts(claims = []) {
  const groups = new Map();

  for (const claim of claims) {
    const key = claim.subject;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(claim);
  }

  const conflicts = [];

  for (const [subject, group] of groups) {
    const values = [...new Set(group.map(c => JSON.stringify(c.value)))];
    if (values.length > 1) {
      conflicts.push({
        id: "CONFLICT-" + String(conflicts.length + 1).padStart(3, "0"),
        subject,
        claims: group.map(c => c.id),
        values,
        status: "open"
      });
    }
  }

  return conflicts;
}

export function assessGate(requirements, assessments, criticalStatuses = [
  STATUS.MISSING,
  STATUS.CONFLICTING,
  STATUS.UNSUPPORTED
]) {
  const criticalFailures = assessments.filter(a => {
    const req = requirements.find(r => r.id === a.requirementId);
    return req?.criticality === "critical" && criticalStatuses.includes(a.status);
  });

  return {
    ready: criticalFailures.length === 0,
    criticalFailures: criticalFailures.map(a => a.requirementId),
    assessments
  };
}

if (typeof module !== "undefined") {
  module.exports = {
    STATUS,
    assessRequirement,
    detectConflicts,
    assessGate
  };
}
