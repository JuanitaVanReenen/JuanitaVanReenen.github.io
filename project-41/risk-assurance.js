/**
 * Risk assurance layer.
 * Maps affected dependencies and unresolved findings to traceable risk records.
 */

const ACTIVE=new Set(["open","mitigated","accepted"]);

export function assessRisks(risks=[],dependencies=[],findings=[]) {
  const openFindingIds=new Set(findings.filter(f=>!["resolved","superseded"].includes(f.status)).map(f=>f.id));
  const affectedDependencies=new Set(
    dependencies.filter(d=>d.assuranceStatus==="affected").map(d=>d.id)
  );

  return risks.map(r=>{
    const findingLinks=(r.findingIds??[]).filter(id=>openFindingIds.has(id));
    const dependencyLinks=(r.dependencyIds??[]).filter(id=>affectedDependencies.has(id));
    const affected=findingLinks.length>0||dependencyLinks.length>0;
    return {
      ...r,
      assuranceStatus:affected?"affected":"not_affected",
      openFindingIds:findingLinks,
      affectedDependencyIds:dependencyLinks,
      active:ACTIVE.has(r.status)
    };
  });
}

export function riskGateImpact(risks=[]) {
  return risks
    .filter(r=>r.assuranceStatus==="affected" && r.active)
    .map(r=>({riskId:r.id,severity:r.severity,gateIds:r.gateIds??[]}));
}
