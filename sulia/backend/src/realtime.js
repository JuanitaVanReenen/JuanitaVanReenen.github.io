class RealtimeHub{
  constructor(){this.clients=new Map();}
  subscribe(conversationId,res){const set=this.clients.get(conversationId)||new Set();set.add(res);this.clients.set(conversationId,set);return ()=>{set.delete(res);if(!set.size)this.clients.delete(conversationId);};}
  publish(conversationId,event){const set=this.clients.get(conversationId)||new Set();const payload='data: '+JSON.stringify(event)+'\n\n';for(const res of set){try{res.write(payload)}catch{set.delete(res);}}}
}
module.exports={RealtimeHub};
