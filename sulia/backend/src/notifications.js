class NotificationQueue{
  constructor(seed=[]){this.items=Array.isArray(seed)?seed:[];}
  enqueue({userId,type,payload}){
    if(!userId||!type)throw new Error('Notification user and type are required');
    const item={id:'notification_'+(this.items.length+1),userId,type,payload:payload||{},createdAt:new Date().toISOString(),read:false};
    this.items.push(item);return item;
  }
  forUser(userId,{unreadOnly=false}={}){return this.items.filter(x=>x.userId===userId&&(!unreadOnly||!x.read));}
  markRead(id,userId){const item=this.items.find(x=>x.id===id&&x.userId===userId);if(!item)throw new Error('Notification not found');item.read=true;item.readAt=new Date().toISOString();return item;}
  snapshot(){return this.items;}
}
module.exports={NotificationQueue};
