/* Hardware abstraction layer for the Flexible Line Recovery Robot.
 * The simulator implements the same contract expected from future physical drivers.
 * No physical hardware is controlled by this browser implementation.
 */
(function(global){
  class SimClock{constructor(){this.t=0}now(){return ++this.t}}
  class SimSensorBus{
    constructor(){this.clock=new SimClock();this.faults={};this.state={confidence:.94,tension:.42,contact:true,motorCurrent:.18,positions:{M1:0,M2:0,M3:0,M4:0}}}
    inject(name){this.faults[name]=true}
    clear(){this.faults={}}
    read(){const s={...this.state,timestamp:this.clock.now()};if(this.faults.camera)s.confidence=.18;if(this.faults.tension)s.tension=.98;if(this.faults.contact)s.contact=false;return s}
  }
  class SimActuatorBus{
    constructor(sensors){this.sensors=sensors;this.enabled=false;this.watchdog=true}
    enable(){this.enabled=true;return {ok:true}}
    safeStop(){this.enabled=false;return {ok:true,reason:'SAFE_STOP'}}
    command(moduleId,command){if(!this.enabled||!this.watchdog)return {ok:false,error:'ACTUATION_NOT_ENABLED'};if(this.sensors.faults.stall)return {ok:false,error:'ACTUATOR_STALL'};this.sensors.state.positions[moduleId]=command.target_position||0;return {ok:true,moduleId,position:this.sensors.state.positions[moduleId]}}
  }
  class HardwareAdapter{
    constructor(){this.sensors=new SimSensorBus();this.actuators=new SimActuatorBus(this.sensors)}
    snapshot(){return {sensors:this.sensors.read(),enabled:this.actuators.enabled,watchdog:this.actuators.watchdog}}
    command(moduleId,action,target_position=0){return this.actuators.command(moduleId,{action,target_position})}
    stop(){return this.actuators.safeStop()}
  }
  global.RecoveryHardware=Object.freeze({HardwareAdapter,SimSensorBus,SimActuatorBus});
})(window);