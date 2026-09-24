import assert from "node:assert/strict";
import {attachScope,assertScope,filterScoped} from "./tenant-isolation.js";

const context={tenantId:"TENANT-A",projectId:"PROJECT-41"};
const record=attachScope({id:"E-1"},context);
assert.equal(assertScope(record,context),true);
assert.equal(filterScoped([
 record,
 {id:"E-2",tenantId:"TENANT-B",projectId:"PROJECT-41"},
 {id:"E-3",tenantId:"TENANT-A",projectId:"PROJECT-99"}
],context).length,1);
assert.throws(()=>assertScope({tenantId:"TENANT-B",projectId:"PROJECT-41"},context));

console.log("Tenant isolation tests passed.");
