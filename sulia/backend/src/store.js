const crypto = require('node:crypto');
const {assertMessageInput,assertConversationInput}=require('./validation');

function id(prefix){return `${prefix}_${crypto.randomUUID()}`;}

class SuliaStore {
  constructor(seed={}){
    this.conversations=new Map(Object.entries(seed.conversations||{}));
    this.messages=new Map(Object.entries(seed.messages||{}));
    this.events=new Map(Object.entries(seed.events||{}));
    this.idempotency=new Map(Object.entries(seed.idempotency||{}));
  }

  createConversation({members,title=''}) {
    assertConversationInput({members,title});
    const c={id:id('conv'),title,members:[...new Set(members)],createdAt:new Date().toISOString(),messageIds:[]};
    this.conversations.set(c.id,c);
    this._event(c.id,'conversation.created',{members:c.members});
    return c;
  }

  getConversation(conversationId){
    const c=this.conversations.get(conversationId);
    if(!c)throw new Error('Conversation not found');
    return {...c,messages:c.messageIds.map(x=>this.messages.get(x)).filter(Boolean),events:this.events.get(conversationId)||[]};
  }

  createMessage(conversationId,input={}){
    assertMessageInput(input);
    const {senderId,type='text',body,replyTo=null,clientMessageId=null,mediaId=null}=input;
    const c=this.conversations.get(conversationId);
    if(!c)throw new Error('Conversation not found');
    if(!c.members.includes(senderId))throw new Error('Sender is not a conversation member');
    if(replyTo&&!this.messages.has(replyTo))throw new Error('Reply target not found');
    if(clientMessageId){
      const prior=this.idempotency.get(`${conversationId}:${clientMessageId}`);
      if(prior)return prior;
    }
    const now=new Date().toISOString();
    const m={
      id:id('msg'),conversationId,senderId,type,body,mediaId,replyTo,reactionCount:0,
      delivery:{state:'queued',queuedAt:now,deliveredAt:null,readAt:null},
      createdAt:now
    };
    m.delivery.state='delivered';
    m.delivery.deliveredAt=new Date().toISOString();
    this.messages.set(m.id,m);
    c.messageIds.push(m.id);
    if(clientMessageId)this.idempotency.set(`${conversationId}:${clientMessageId}`,m);
    this._event(conversationId,'message.created',{messageId:m.id,type,replyTo});
    return m;
  }

  addReaction(messageId,{senderId,reaction}={}){
    const m=this.messages.get(messageId);
    if(!m)throw new Error('Message not found');
    const c=this.conversations.get(m.conversationId);
    if(!c.members.includes(senderId))throw new Error('Reactor is not a conversation member');
    if(typeof reaction!=='string'||!reaction.trim()||reaction.length>32)throw new Error('Invalid reaction');
    m.reactionCount+=1;
    this._event(c.id,'message.reacted',{messageId,senderId,reaction});
    return {messageId,senderId,reaction,reactionCount:m.reactionCount};
  }

  markRead(messageId,readerId){
    const m=this.messages.get(messageId);
    if(!m)throw new Error('Message not found');
    const c=this.conversations.get(m.conversationId);
    if(!c.members.includes(readerId))throw new Error('Reader is not a conversation member');
    m.delivery.state='read';
    m.delivery.readAt=new Date().toISOString();
    this._event(c.id,'message.read',{messageId,readerId});
    return m;
  }

  eventsSince(conversationId,after=0){
    if(!this.conversations.has(conversationId))throw new Error('Conversation not found');
    return (this.events.get(conversationId)||[]).filter(e=>e.sequence>Number(after));
  }

  _event(conversationId,type,data){
    const list=this.events.get(conversationId)||[];
    list.push({sequence:list.length+1,type,data,at:new Date().toISOString()});
    this.events.set(conversationId,list);
  }

  snapshot(){
    return {
      conversations:Object.fromEntries(this.conversations),
      messages:Object.fromEntries(this.messages),
      events:Object.fromEntries(this.events),
      idempotency:Object.fromEntries(this.idempotency)
    };
  }
}

module.exports={SuliaStore};
