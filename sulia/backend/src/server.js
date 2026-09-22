const http=require('node:http');
const path=require('node:path');
const fs=require('node:fs');
const {SuliaStore}=require('./store');
const {IdentityService}=require('./auth');
const {JsonPersistence}=require('./persistence');
const {MediaService}=require('./media');
const {NotificationQueue}=require('./notifications');
const {RealtimeHub}=require('./realtime');

const dataFile=process.env.SULIA_DATA_FILE||path.join(__dirname,'..','data','sulia.json');
const mediaRoot=process.env.SULIA_MEDIA_DIR||path.join(__dirname,'..','data','media');
const persistence=new JsonPersistence(dataFile);
const saved=persistence.load();
const store=new SuliaStore(saved.store||{});
const identity=new IdentityService(saved.identity||{});
const notifications=new NotificationQueue(saved.notifications||[]);
const media=new MediaService(mediaRoot,{seed:saved.media||{}});
const realtime=new RealtimeHub();
const rate=new Map();
const MAX_MEDIA_BYTES=25*1024*1024;

function json(res,status,payload){
  res.writeHead(status,{'content-type':'application/json; charset=utf-8','cache-control':'no-store','x-content-type-options':'nosniff','x-frame-options':'DENY','referrer-policy':'no-referrer'});
  res.end(JSON.stringify(payload));
}
function body(req){
  return new Promise((resolve,reject)=>{
    let data='';
    req.on('data',c=>{data+=c;if(data.length>262144){reject(new Error('Request body too large'));req.destroy();}});
    req.on('end',()=>{try{resolve(data?JSON.parse(data):{});}catch{reject(new Error('Invalid JSON'));}});
    req.on('error',reject);
  });
}
function binaryBody(req,max=MAX_MEDIA_BYTES){
  return new Promise((resolve,reject)=>{
    const chunks=[];let size=0;
    req.on('data',c=>{size+=c.length;if(size>max){reject(new Error('Media payload exceeds limit'));req.destroy();return;}chunks.push(c);});
    req.on('end',()=>resolve(Buffer.concat(chunks)));
    req.on('error',reject);
  });
}
function route(method,url){return {method,parts:new URL(url,'http://localhost').pathname.split('/').filter(Boolean)};}
function clientKey(req){return String(req.headers.authorization||req.socket.remoteAddress||'unknown');}
function enforceRate(req){
  const now=Date.now();const key=clientKey(req);const prior=rate.get(key)||{start:now,count:0};
  if(now-prior.start>=60000){prior.start=now;prior.count=0;}prior.count++;rate.set(key,prior);
  if(prior.count>120)throw new Error('Rate limit exceeded');
}
function auth(req){return identity.authenticate(req.headers.authorization);}
function save(){persistence.save({version:3,store:store.snapshot(),identity:identity.snapshot(),notifications:notifications.snapshot(),media:media.snapshot()});}
function notifyOthers(conversation,actorId,type,payload){
  for(const member of conversation.members){if(member!==actorId)notifications.enqueue({userId:member,type,payload});}
}
function publish(conversationId,type,payload){realtime.publish(conversationId,{type,payload,at:new Date().toISOString()});}

const server=http.createServer(async(req,res)=>{
  try{
    enforceRate(req);
    const r=route(req.method,req.url);
    if(r.parts[0]!=='api')return json(res,404,{error:'Not found'});

    if(r.method==='POST'&&r.parts.join('/')==='api/auth/revoke'){
      const result=identity.revoke(req.headers.authorization);save();return json(res,200,result);
    }

    if(r.method==='POST'&&r.parts.join('/')==='api/auth/register'){
      const result=identity.register(await body(req));save();return json(res,201,result);
    }

    const user=auth(req);

    if(r.method==='POST'&&r.parts.join('/')==='api/media'){
      const contentType=String(req.headers['content-type']||'').split(';')[0].trim();
      const expected=req.headers['content-length']?Number(req.headers['content-length']):undefined;
      const meta=media.beginUpload({ownerId:user.userId,contentType,expectedBytes:expected});
      const data=await binaryBody(req);
      const stored=media.write(meta.id,data);
      const result=media.complete(meta.id,stored.sizeBytes);
      return json(res,201,result);
    }

    if(r.method==='GET'&&r.parts[1]==='conversations'&&r.parts[2]&&r.parts[3]==='stream'){
      const id=r.parts[2];const conversation=store.getConversation(id);
      if(!conversation.members.includes(user.userId))throw new Error('Conversation access denied');
      res.writeHead(200,{'content-type':'text/event-stream; charset=utf-8','cache-control':'no-cache','connection':'keep-alive','x-accel-buffering':'no'});
      res.write('event: ready\ndata: '+JSON.stringify({conversationId:id})+'\n\n');
      const unsubscribe=realtime.subscribe(id,res);
      const heartbeat=setInterval(()=>{try{res.write(': heartbeat\\n\\n')}catch{}},15000);
      req.on('close',()=>{clearInterval(heartbeat);unsubscribe();});
      return;
    }

    if(r.method==='POST'&&r.parts.join('/')==='api/conversations'){
      const input=await body(req);
      if(!Array.isArray(input.members)||!input.members.includes(user.userId))throw new Error('Authenticated user must be a conversation member');
      if(input.members.some(member=>!identity.hasUser(member)))throw new Error('Conversation member does not exist');
      const conversation=store.createConversation(input);save();publish(conversation.id,'conversation.created',{conversationId:conversation.id});
      return json(res,201,conversation);
    }

    if(r.parts[1]==='conversations'&&r.parts[2]){
      const id=r.parts[2];const conversation=store.getConversation(id);
      if(!conversation.members.includes(user.userId))throw new Error('Conversation access denied');
      if(r.method==='GET'&&r.parts.length===3)return json(res,200,conversation);

      if(r.method==='POST'&&r.parts[3]==='messages'){
        const input=await body(req);\n        if(input.mediaId)media.getOwned(input.mediaId,user.userId);\n        const message=store.createMessage(id,{...input,senderId:user.userId});
        notifyOthers(conversation,user.userId,'message.received',{conversationId:id,messageId:message.id,type:message.type});
        save();publish(id,'message.created',{message});return json(res,201,message);
      }

      if(r.method==='GET'&&r.parts[3]==='events'){
        return json(res,200,{events:store.eventsSince(id,new URL(req.url,'http://localhost').searchParams.get('after')||0)});
      }
    }

    if(r.method==='GET'&&r.parts.join('/')==='api/notifications'){
      return json(res,200,{notifications:notifications.forUser(user.userId,{unreadOnly:new URL(req.url,'http://localhost').searchParams.get('unread')==='1'})});
    }

    if(r.method==='POST'&&r.parts[1]==='notifications'&&r.parts[2]&&r.parts[3]==='read'){
      const result=notifications.markRead(r.parts[2],user.userId);save();return json(res,200,result);
    }

    if(r.method==='POST'&&r.parts[1]==='messages'&&r.parts[2]&&r.parts[3]==='reactions'){
      const message=store.messages.get(r.parts[2]);if(!message)throw new Error('Message not found');
      const conversation=store.getConversation(message.conversationId);
      if(!conversation.members.includes(user.userId))throw new Error('Conversation access denied');
      const input=await body(req);const result=store.addReaction(r.parts[2],{...input,senderId:user.userId});
      notifyOthers(conversation,user.userId,'message.reaction',{messageId:r.parts[2],reaction:result.reaction});
      save();publish(conversation.id,'message.reacted',result);return json(res,201,result);
    }

    if(r.method==='POST'&&r.parts[1]==='messages'&&r.parts[2]&&r.parts[3]==='read'){
      const message=store.messages.get(r.parts[2]);if(!message)throw new Error('Message not found');
      const conversation=store.getConversation(message.conversationId);
      if(!conversation.members.includes(user.userId))throw new Error('Conversation access denied');
      const result=store.markRead(r.parts[2],user.userId);save();publish(conversation.id,'message.read',{messageId:r.parts[2],readerId:user.userId});return json(res,200,result);
    }

    return json(res,404,{error:'Route not found'});
  }catch(e){
    const status=e.message==='Authentication required'||e.message==='Invalid authentication token'||e.message==='Authentication token expired'?401:
      e.message==='Conversation access denied'||e.message==='Media access denied'?403:
      e.message==='Rate limit exceeded'||e.message==='Request body too large'||e.message==='Media payload exceeds limit'?429:
      e.message==='Not found'?404:400;
    return json(res,status,{error:e.message});
  }
});
const port=Number(process.env.PORT||8787);
if(require.main===module)server.listen(port,()=>console.log('Sulia Communication Core listening on http://localhost:'+port));
module.exports={server,store,identity,persistence,notifications,media,realtime};
