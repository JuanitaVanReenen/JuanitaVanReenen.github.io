/**
 * Project-level assurance ledger.
 * Provides one chronological, queryable view across evidence, findings, actions,
 * changes and gate packages while preserving source references.
 */

const EVENT_TYPES = new Set([
  "evidence_added",
  "evidence_version_change",
  "claim_changed",
  "requirement_reassessed",
  "finding_created",
  "finding_resolved",
  "action_created",
  "action_completed",
  "gate_assessed",
  "package_snapshot_created",
  "human_decision_recorded"
]);

export function appendLedgerEvent(ledger, event) {
  if (!EVENT_TYPES.has(event.type)) throw new Error(`Unsupported ledger event type: ${event.type}`);
  if (!event.id || !event.occurredAt) throw new Error("Ledger events require id and occurredAt.");

  const events = [...(ledger.events ?? [])];
  if (events.some(e => e.id === event.id)) throw new Error(`Duplicate ledger event id: ${event.id}`);

  return {
    schemaVersion: "0.1",
    ...ledger,
    events: [...events, { ...event, immutable: true }]
      .sort((a,b) => new Date(a.occurredAt) - new Date(b.occurredAt))
  };
}

export function queryLedger(ledger, filters = {}) {
  return (ledger.events ?? []).filter(event => {
    if (filters.type && event.type !== filters.type) return false;
    if (filters.targetId && event.targetId !== filters.targetId) return false;
    if (filters.from && new Date(event.occurredAt) < new Date(filters.from)) return false;
    if (filters.to && new Date(event.occurredAt) > new Date(filters.to)) return false;
    return true;
  });
}

export function buildAssuranceTimeline(ledger) {
  return (ledger.events ?? []).map(event => ({
    id: event.id,
    occurredAt: event.occurredAt,
    type: event.type,
    targetId: event.targetId ?? null,
    summary: event.summary ?? "",
    sourceRefs: event.sourceRefs ?? []
  }));
}
