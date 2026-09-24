/**
 * Change assurance layer.
 * Evaluates which assurance objects and lifecycle gates are affected by a recorded change.
 */

export function assessChange(change, {requirements=[],dependencies=[],risks=[],gateIds=[]}={}) {
  if(!change?.id) throw new Error("Change requires an id.");
  const targets=new Set(change.targetIds??[]);
  const affectedRequirements=requirements.filter(r=>targets.has(r.id)).map(r=>r.id);
  const affectedDependencies=dependencies.filter(d=>targets.has(d.id)||affectedRequirements.includes(d.from)||affectedRequirements.includes(d.to)).map(d=>d.id);
  const affectedRisks=risks.filter(r=>
    (r.findingIds??[]).some(id=>targets.has(id)) ||
    (r.dependencyIds??[]).some(id=>affectedDependencies.includes(id))
  ).map(r=>r.id);
  return {
    changeId:change.id,
    affectedRequirements,
    affectedDependencies,
    affectedRisks,
    affectedGateIds:[...(change.gateIds??[]),...gateIds].filter((v,i,a)=>a.indexOf(v)===i)
  };
}

export function changeRequiresReassessment(change, impact) {
  return Boolean(
    impact.affectedRequirements.length ||
    impact.affectedDependencies.length ||
    impact.affectedRisks.length
  );
}
