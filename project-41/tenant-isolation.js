/**
 * Tenant/project isolation policy foundation.
 * Ensures records are scoped to an explicit tenant and project context.
 */

export function assertScope(record,context) {
  if(!context?.tenantId || !context?.projectId) throw new Error("Tenant and project scope are required.");
  if(record?.tenantId!==context.tenantId || record?.projectId!==context.projectId) {
    throw new Error("Record is outside the requested tenant/project scope.");
  }
  return true;
}

export function attachScope(record,context) {
  if(!context?.tenantId || !context?.projectId) throw new Error("Tenant and project scope are required.");
  return {...record,tenantId:context.tenantId,projectId:context.projectId};
}

export function filterScoped(records=[],context) {
  if(!context?.tenantId || !context?.projectId) throw new Error("Tenant and project scope are required.");
  return records.filter(r=>r.tenantId===context.tenantId && r.projectId===context.projectId);
}
