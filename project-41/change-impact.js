/**
 * Change propagation / golden-thread impact analysis.
 * A change is evaluated through the assurance graph instead of being treated
 * as an isolated document revision.
 */

export function buildAdjacency(edges = []) {
  const adjacency = new Map();
  for (const edge of edges) {
    if (!adjacency.has(edge.from)) adjacency.set(edge.from, []);
    adjacency.get(edge.from).push({ to: edge.to, relation: edge.relation });
  }
  return adjacency;
}

export function calculateChangeImpact(changeId, graph, options = {}) {
  const adjacency = buildAdjacency(graph.edges);
  const impacted = [];
  const visited = new Set([changeId]);
  const queue = [{ id: changeId, depth: 0 }];

  while (queue.length) {
    const current = queue.shift();
    const next = adjacency.get(current.id) ?? [];

    for (const edge of next) {
      if (visited.has(edge.to)) continue;
      visited.add(edge.to);

      const item = graph.nodes.find(n => n.id === edge.to);
      impacted.push({
        nodeId: edge.to,
        nodeType: item?.type ?? "unknown",
        relation: edge.relation,
        depth: current.depth + 1
      });

      if ((options.maxDepth ?? 12) > current.depth + 1) {
        queue.push({ id: edge.to, depth: current.depth + 1 });
      }
    }
  }

  return {
    changeId,
    impactedCount: impacted.length,
    impacted
  };
}

export function identifyGateImpact(impact, graph) {
  const gateIds = new Set(
    graph.nodes.filter(n => n.type === "gate").map(n => n.id)
  );
  return impact.impacted.filter(item => gateIds.has(item.nodeId));
}
