/**
 * Dependency assurance layer.
 * Connects unresolved findings/requirements to downstream project dependencies
 * and identifies which gate reviews may be affected.
 */

export function assessDependencies(dependencies=[], findings=[], changes=[]) {
  const openFindings=new Set(
    findings.filter(f=>!["resolved","superseded"].includes(f.status)).map(f=>f.id)
  );
  const changed=new Set(changes.map(c=>c.id ?? c.targetId));

  return dependencies.map(d=>{
    const findingLinks=(d.findingIds ?? []).filter(id=>openFindings.has(id));
    const changeLinks=(d.changeIds ?? []).filter(id=>changed.has(id));
    return {
      ...d,
      assuranceStatus: findingLinks.length || changeLinks.length ? "affected" : "unaffected",
      openFindingIds:findingLinks,
      changeIds:changeLinks,
      downstreamGateIds:d.downstreamGateIds ?? []
    };
  });
}

export function downstreamGateImpact(dependencies=[]) {
  const impacts=new Map();
  for(const d of dependencies){
    if(d.assuranceStatus!=="affected") continue;
    for(const gateId of d.downstreamGateIds ?? []){
      if(!impacts.has(gateId)) impacts.set(gateId,[]);
      impacts.get(gateId).push(d.id);
    }
  }
  return [...impacts.entries()].map(([gateId,dependencyIds])=>({gateId,dependencyIds}));
}
