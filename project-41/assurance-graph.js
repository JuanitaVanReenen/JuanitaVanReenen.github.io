/**
 * Water Infrastructure Decision Assurance
 * Assurance graph foundation.
 *
 * Core chain:
 * Requirement -> Evidence -> Claim/Assumption -> Verification
 * -> Conflict/Gap -> Risk/Dependency -> Gate -> Decision
 *
 * Deterministic and explainable by design. AI may assist extraction later,
 * but this layer remains auditable and does not silently make decisions.
 */

export const NODE_TYPES = Object.freeze({
  PROJECT: "project",
  REQUIREMENT: "requirement",
  EVIDENCE: "evidence",
  CLAIM: "claim",
  ASSUMPTION: "assumption",
  VERIFICATION: "verification",
  CONFLICT: "conflict",
  GAP: "gap",
  RISK: "risk",
  DEPENDENCY: "dependency",
  CHANGE: "change",
  GATE: "gate",
  FINDING: "finding",
  ACTION: "action",
  DECISION: "decision"
});

export function createGraph(records = {}) {
  return {
    schemaVersion: "0.1",
    project: records.project ?? null,
    nodes: records.nodes ?? [],
    edges: records.edges ?? []
  };
}

export function addNode(graph, node) {
  if (!node?.id || !node?.type) throw new Error("Node requires id and type");
  if (graph.nodes.some(n => n.id === node.id)) {
    throw new Error(`Duplicate node id: ${node.id}`);
  }
  graph.nodes.push({ ...node });
  return node.id;
}

export function addEdge(graph, from, to, relation) {
  if (!from || !to || !relation) throw new Error("Edge requires from, to and relation");
  graph.edges.push({ from, to, relation });
}

export function validateGraph(graph) {
  const ids = new Set(graph.nodes.map(n => n.id));
  const errors = [];

  for (const edge of graph.edges) {
    if (!ids.has(edge.from)) errors.push(`Missing edge source: ${edge.from}`);
    if (!ids.has(edge.to)) errors.push(`Missing edge target: ${edge.to}`);
  }

  const allowedRelations = new Set([
    "supported_by",
    "supports",
    "states",
    "assumed_by",
    "verified_by",
    "conflicts_with",
    "creates_gap",
    "creates_risk",
    "depends_on",
    "changed_by",
    "requires",
    "finds",
    "requires_action",
    "informs"
  ]);

  for (const edge of graph.edges) {
    if (!allowedRelations.has(edge.relation)) {
      errors.push(`Unsupported relation: ${edge.relation}`);
    }
  }

  return { valid: errors.length === 0, errors };
}

export function buildProjectAssuranceGraph(project, requirements, evidence, claims, assumptions = []) {
  const graph = createGraph({ project });
  addNode(graph, { id: project.id, type: NODE_TYPES.PROJECT, name: project.name });

  for (const req of requirements) {
    addNode(graph, { ...req, type: NODE_TYPES.REQUIREMENT });
  }

  for (const item of evidence) {
    addNode(graph, { ...item, type: NODE_TYPES.EVIDENCE });
    for (const reqId of item.supportsRequirements ?? []) {
      addEdge(graph, item.id, reqId, "supported_by");
    }
  }

  for (const claim of claims) {
    addNode(graph, { ...claim, type: NODE_TYPES.CLAIM });
    for (const evidenceId of claim.supportedBy ?? []) {
      addEdge(graph, evidenceId, claim.id, "supports");
    }
  }

  for (const assumption of assumptions) {
    addNode(graph, { ...assumption, type: NODE_TYPES.ASSUMPTION });
    for (const claimId of assumption.basedOn ?? []) {
      addEdge(graph, claimId, assumption.id, "assumed_by");
    }
  }

  return graph;
}
