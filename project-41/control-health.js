/**
 * Control-health monitoring foundation.
 * Checks whether key governance controls have current evidence of operation.
 */
export const CONTROL_STATUS={healthy:"healthy",attention:"attention",failed:"failed",unknown:"unknown"};

export function assessControlHealth(control) {
  if(!control?.controlId || !control?.lastTestedAt) {
    return {controlId:control?.controlId??null,status:CONTROL_STATUS.unknown,reason:"control_test_record_missing"};
  }
  if(control.failed===true) return {controlId:control.controlId,status:CONTROL_STATUS.failed,reason:"control_test_failed"};
  if(control.attention===true) return {controlId:control.controlId,status:CONTROL_STATUS.attention,reason:"control_requires_review"};
  return {controlId:control.controlId,status:CONTROL_STATUS.healthy,reason:"control_test_passed"};
}

export function summarizeControlHealth(controls=[]) {
  const results=controls.map(assessControlHealth);
  return {
    total:results.length,
    healthy:results.filter(x=>x.status==="healthy").length,
    attention:results.filter(x=>x.status==="attention").length,
    failed:results.filter(x=>x.status==="failed").length,
    unknown:results.filter(x=>x.status==="unknown").length,
    results
  };
}
