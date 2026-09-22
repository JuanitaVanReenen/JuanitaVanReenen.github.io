/* Flexible Line Recovery Robot — functional software demonstrator
 * Browser-safe supervisory engine. No hardware actuation is performed.
 * Production safety limits and real-time control require qualified engineering.
 */
(function(global){
  const STATES=Object.freeze(['BOOT','SAFE','OBSERVE','MAP','SELECT_ACTION','EXECUTE','VERIFY','COMMIT','ROLLBACK','COMPLETE','FAULT']);
  const ACTIONS=Object.freeze(['ACQUIRE','SLIDE','CREATE_SLACK','LIFT','SEPARATE','TRANSFER','REVERSE','RELEASE','COIL']);
  const clone=o=>JSON.parse(JSON.stringify(o));
  class RecoveryEngine{
    constructor(opts={}){this.maxActions=opts.maxActions||40;this.reset()}
    reset(){this.state='BOOT';this.runId='RUN-'+Date.now();this.actionIndex=0;this.history=[];this.logs=[];this.fault=null;this.faultInjection=null;this.line={segments:[{id:'S1',length:1},{id:'S2',length:1},{id:'S3',length:1}],endpoints:['E1','E2'],crossings:2,loops:1,tension:'medium',owners:{S1:'M1',S2:'M2',S3:null},organized:false,confidence:.91};this.verified=clone(this.line);this.verifiedStateId='V0';return this.snapshot()}
    log(event,data={}){this.logs.push({time:new Date().toISOString(),state:this.state,event,...clone(data)})}
    snapshot(){return {runId:this.runId,state:this.state,actionIndex:this.actionIndex,line:clone(this.line),verifiedStateId:this.verifiedStateId,fault:this.fault,logs:clone(this.logs)}}
    transition(next){if(!STATES.includes(next))throw Error('Invalid state');this.state=next;this.log('STATE_TRANSITION',{to:next});return this.snapshot()}
    observe(){this.transition('OBSERVE');this.log('SENSE',{confidence:this.line.confidence,tension:this.line.tension});return this.map()}
    map(){this.transition('MAP');this.line.confidence=Math.max(.85,this.line.confidence);this.log('MAP_BUILT',{crossings:this.line.crossings,loops:this.line.loops});return this.selectAction()}
    selectAction(){this.transition('SELECT_ACTION');let action;if(this.line.tension!=='low')action='CREATE_SLACK';else if(this.line.crossings>0)action='SEPARATE';else if(this.line.loops>0)action='REVERSE';else action='TRANSFER';this.log('ACTION_SELECTED',{action});return action}
    execute(action){if(!ACTIONS.includes(action))throw Error('Invalid action');this.transition('EXECUTE');this.actionIndex++;const before=clone(this.line);this.log('ACTION_EXECUTE',{action,before});if(this.faultInjection==='actuator_stall'){this.fault='ACTUATOR_STALL';this.log('FAULT',{code:this.fault});this.faultInjection=null;return this.rollback('actuator stall')}
      if(action==='CREATE_SLACK'){this.line.tension='low'}
      if(action==='SEPARATE'){if(this.line.crossings>0)this.line.crossings--}
      if(action==='REVERSE'&&this.line.loops>0)this.line.loops--;
      if(action==='TRANSFER'){this.line.owners.S3='M3'}
      if(action==='COIL'){this.line.organized=true}
      if(action==='RELEASE'){this.line.tension='low'}
      return this.verify(action,before)
    }
    verify(action,before){this.transition('VERIFY');let pass=true;let reason='PASS';if(this.faultInjection==='verification_fail'){pass=false;reason='INJECTED_VERIFICATION_FAILURE';this.faultInjection=null}if(this.line.tension==='high'){pass=false;reason='TENSION_LIMIT'}if(action==='SEPARATE'&&this.line.crossings===before.crossings){pass=false;reason='NO_GEOMETRY_CHANGE'}this.log('VERIFICATION',{action,pass,reason,before,after:clone(this.line)});if(pass){this.verified=clone(this.line);this.verifiedStateId='V'+this.actionIndex;this.transition('COMMIT');return this.continue()}return this.rollback(reason)}
    continue(){if(this.line.crossings===0&&this.line.loops===0&&!this.line.organized){this.line.tension='low';return this.selectAction()}if(this.line.crossings===0&&this.line.loops===0&&this.line.organized){this.transition('COMPLETE');return this.snapshot()}return this.selectAction()}
    rollback(reason){this.transition('ROLLBACK');this.line=clone(this.verified);this.log('ROLLBACK',{reason,toState:this.verifiedStateId});if(this.fault){this.transition('FAULT');return this.snapshot()}this.line.tension='low';this.log('ALTERNATIVE_ACTION_READY',{});return this.selectAction()}
    step(){if(this.state==='BOOT'){this.transition('SAFE');return this.observe()}if(this.state==='SELECT_ACTION'){const action=this.selectAction();return this.execute(action)}if(this.state==='COMPLETE'||this.state==='FAULT')return this.snapshot();if(this.state==='EXECUTE'||this.state==='VERIFY'||this.state==='ROLLBACK')return this.snapshot();return this.snapshot()}
    run(){let guard=0;this.transition('SAFE');this.observe();while(!['COMPLETE','FAULT'].includes(this.state)&&guard++<this.maxActions){if(this.state==='SELECT_ACTION'){const action=this.selectAction();this.execute(action)}else if(this.state==='SAFE'){this.observe()}else break}if(guard>=this.maxActions&&this.state!=='COMPLETE'){this.fault='MAX_ACTIONS';this.transition('FAULT')}return this.snapshot()}
    inject(type){const allowed=['verification_fail','actuator_stall'];if(!allowed.includes(type))throw Error('Unsupported fault');this.faultInjection=type;this.log('FAULT_INJECTION',{type});return this.snapshot()}
    exportRun(){return JSON.stringify(this.snapshot(),null,2)}
  }
  global.FlexibleLineRecovery=Object.freeze({RecoveryEngine,STATES,ACTIONS});
})(window);