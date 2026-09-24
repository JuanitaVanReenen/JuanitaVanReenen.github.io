import assert from "node:assert/strict";
import {assessControlHealth,summarizeControlHealth} from "./control-health.js";

assert.equal(assessControlHealth({controlId:"CTRL-001",lastTestedAt:"2026-09-24"}).status,"healthy");
assert.equal(assessControlHealth({controlId:"CTRL-002",lastTestedAt:"2026-09-24",failed:true}).status,"failed");
assert.equal(assessControlHealth({controlId:"CTRL-003"}).status,"unknown");

const summary=summarizeControlHealth([
 {controlId:"CTRL-001",lastTestedAt:"2026-09-24"},
 {controlId:"CTRL-002",lastTestedAt:"2026-09-24",attention:true},
 {controlId:"CTRL-003",lastTestedAt:"2026-09-24",failed:true}
]);
assert.equal(summary.total,3);
assert.equal(summary.healthy,1);
assert.equal(summary.attention,1);
assert.equal(summary.failed,1);

console.log("Control health tests passed.");
