/* Automated verification suite for the supervisory recovery demonstrator. */
(function(global){
  function assert(name, condition, details){return {name,pass:!!condition,details:details||''}}
  function runSuite(){
    const out=[];
    const e=new global.FlexibleLineRecovery.RecoveryEngine();
    e.run();
    out.push(assert('Normal recovery reaches COMPLETE',e.state===global.FlexibleLineRecovery.STATES.COMPLETE,e.state));
    out.push(assert('Normal run has verified state',!!e.verifiedSnapshot,'verified snapshot missing'));
    const f=new global.FlexibleLineRecovery.RecoveryEngine();
    f.inject('verification_fail'); f.run();
    out.push(assert('Verification failure triggers rollback',f.history.some(x=>x.state==='ROLLBACK'),'rollback not observed'));
    out.push(assert('Rollback restores a verified snapshot',!!f.verifiedSnapshot,'verified snapshot missing'));
    const s=new global.FlexibleLineRecovery.RecoveryEngine();
    s.inject('actuator_stall'); s.run();
    out.push(assert('Actuator stall becomes FAULT',s.state===global.FlexibleLineRecovery.STATES.FAULT,s.state));
    const j=e.exportRun();
    out.push(assert('Run export contains run id',typeof j.runId==='string','runId missing'));
    out.push(assert('Run export contains action log',Array.isArray(j.logs),'logs missing'));
    const order=e.history.map(x=>x.state);
    out.push(assert('Run history is non-empty',order.length>0,'history empty'));
    return {passed:out.filter(x=>x.pass).length,total:out.length,tests:out};
  }
  global.RecoverySoftwareTests={runSuite};
})(window);