/**
 * Versioned assurance ruleset layer.
 * Makes the rule configuration used for an assessment explicit and traceable.
 */

export function createRulesetVersion(input={}) {
  if(!input.id) throw new Error("Ruleset requires an id.");
  return {
    schemaVersion:"0.1",
    id:input.id,
    version:input.version ?? "0.1.0",
    effectiveAt:input.effectiveAt ?? new Date().toISOString(),
    jurisdiction:input.jurisdiction ?? null,
    domain:input.domain ?? "water-infrastructure",
    rules:[...(input.rules??[])],
    checksum:input.checksum ?? null
  };
}

export function attachRuleset(record,ruleset) {
  if(!ruleset?.id) throw new Error("Ruleset is required.");
  return {...record,rulesetRef:{id:ruleset.id,version:ruleset.version}};
}

export function compareRulesets(previous,current) {
  return {
    previous:{id:previous?.id??null,version:previous?.version??null},
    current:{id:current?.id??null,version:current?.version??null},
    changed:previous?.id!==current?.id || previous?.version!==current?.version
  };
}
