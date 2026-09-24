import assert from "node:assert/strict";
import {createRulesetVersion,attachRuleset,compareRulesets} from "./ruleset-version.js";

const v1=createRulesetVersion({id:"WATER-ASSURANCE",version:"1.0.0",effectiveAt:"2026-09-01T00:00:00Z",rules:["critical blockers"]});
const v2=createRulesetVersion({id:"WATER-ASSURANCE",version:"1.1.0",effectiveAt:"2026-09-20T00:00:00Z",rules:["critical blockers","dependency impact"]});

const packageRecord=attachRuleset({id:"SNAP-001"},v1);
assert.deepEqual(packageRecord.rulesetRef,{id:"WATER-ASSURANCE",version:"1.0.0"});
assert.equal(compareRulesets(v1,v2).changed,true);
assert.equal(compareRulesets(v1,v1).changed,false);

console.log("Ruleset version tests passed.");
