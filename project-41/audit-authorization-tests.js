import assert from "node:assert/strict";
import {createAuthorizationAuditEvent,isDenied} from "./audit-authorization.js";

const denied=createAuthorizationAuditEvent({
 eventId:"AUTH-001",actorId:"analyst-4",tenantId:"TENANT-A",projectId:"PROJECT-41",
 action:"record_decision",result:"denied",reason:"role_not_authorized",
 occurredAt:"2026-09-24T09:30:00Z"
});
assert.equal(isDenied(denied),true);
assert.equal(denied.projectId,"PROJECT-41");

const granted=createAuthorizationAuditEvent({
 eventId:"AUTH-002",actorId:"reviewer-7",tenantId:"TENANT-A",projectId:"PROJECT-41",
 action:"record_decision",result:"granted",occurredAt:"2026-09-24T09:31:00Z"
});
assert.equal(isDenied(granted),false);

console.log("Authorization audit tests passed.");
