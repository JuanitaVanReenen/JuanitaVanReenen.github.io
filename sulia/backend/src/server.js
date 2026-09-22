const http=require('node:http');
const path=require('node:path');
const {SuliaStore}=require('./store');
const {IdentityService}=require('./auth');
const {JsonPersistence}=require('./persistence');

const dataFile=process.env.SULIA_DATA_FILE||path.join(__dirname,'..','data','sulia.json');
const persistence=new JsonPersistence(dataFile);
const saved=persistence.load();
const store=new SuliaStore(saved.store||saved);
const identity=new IdentityService(saved.identity||{});
const rate=new Map();

function json(res,status,payload){
  res.writeHead(status,{
    'content-type':'application/json; charset=utf-8',
    'cache-control':'no-store',
    'x-content-type-options':'nosniff',
    'x-frame-options':'DENY',
    'referrer-policy':'no-referrer'
  });
  res.end(JSON.stringify(payload));
}

function body(req){
  return new Promise((resolve,reject)=>{
    let data='';
    req.on('data',c=>{
      data+=c;
      if(data.length>262144){reject(new Error('Request body too large'));req.destroy();}
    });
    req.on('end',()=>{
      try{resolve(data?JSON.parse(data):{});}catch{reject(new Error('Invalid JSON'));}
    });
    req.on('error',reject);
  });
}

function route(method,url){
  const parts=new URL(url,'http://localhost').pathname.split('/').filter(Boolean);
  return {method,parts};
}

function clientKey(req){
  return String(req.headers.authorization||req.socket.remoteAddress||'unknown');
}

function enforceRate(req){
  const now=Date.now();
  const key=clientKey(req);
  const prior=rate.get(key)||{start:now,count:0};
  if(now-prior.start>=60000){prior.start=now;prior.count=0;}
  prior.count+=1;
  rate.set(key,prior);
  if(prior.count>120)throw new Error('Rate limit exceeded');
}

function auth(req){return identity.authenticate(req.headers.authorization);}

function save(){
  persistence.save({version:1,store:store.snapshot(),identity:identity.snapshot()});
}

const server=http.createServer(async(req,res)=>{
  try{
    enforceRate(req);
    const r=route(req.method,req.url);

    if(r.parts[0]!=='api')return json(res,404,{error:'Not found'});

    if(r.method==='POST'&&r.parts.join('/')==='api/auth/register'){
      const result=identity.register(await body(req));
      save();
      return json(res,201,result);
    }

    const user=auth(req);

    if(r.method==='POST'&&r.parts.join('/')==='api/conversations'){
      const input=await body(req);
      if(!Array.isArray(input.members)||!input.members.includes(user.userId))throw new Error('Authenticated user must be a conversation member');
      if(input.members.some(member=>!identity.hasUser(member)))throw new Error('Conversation member does not exist');
      const conversation=store.createConversation(input);
      save();
      return json(res,201,conversation);
    }

    if(r.parts[1]==='conversations'&&r.parts[2]){
      const id=r.parts[2];
      const conversation=store.getConversation(id);
      if(!conversation.members.includes(user.userId))throw new Error('Conversation access denied');

      if(r.method==='GET'&&r.parts.length===3)return json(res,200,conversation);

      if(r.method==='POST'&&r.parts[3]==='messages'){
        const input=await body(req);
        const message=store.createMessage(id,{...input,senderId:user.userId});
        save();
        return json(res,201,message);
      }

      if(r.method==='GET'&&r.parts[3]==='events'){
        return json(res,200,{events:store.eventsSince(id,new URL(req.url,'http://localhost').searchParams.get('after')||0)});
      }
    }

    if(r.method==='POST'&&r.parts[1]==='messages'&&r.parts[2]&&r.parts[3]==='reactions'){
      const message=store.messages.get(r.parts[2]);
      if(!message)throw new Error('Message not found');
      const conversation=store.getConversation(message.conversationId);
      if(!conversation.members.includes(user.userId))throw new Error('Conversation access denied');
      const input=await body(req);
      const result=store.addReaction(r.parts[2],{...input,senderId:user.userId});
      save();
      return json(res,201,result);
    }

    if(r.method==='POST'&&r.parts[1]==='messages'&&r.parts[2]&&r.parts[3]==='read'){
      const message=store.messages.get(r.parts[2]);
      if(!message)throw new Error('Message not found');
      const conversation=store.getConversation(message.conversationId);
      if(!conversation.members.includes(user.userId))throw new Error('Conversation access denied');
      const result=store.markRead(r.parts[2],user.userId);
      save();
      return json(res,200,result);
    }

    return json(res,404,{error:'Route not found'});
  }catch(e){
    const status=e.message==='Authentication required'||e.message==='Invalid authentication token'?401:
      e.message==='Conversation access denied'?403:
      e.message==='Rate limit exceeded'||e.message==='Request body too large'?429:
      e.message==='Not found'?404:400;
    return json(res,status,{error:e.message});
  }
});

const port=Number(process.env.PORT||8787);
if(require.main===module)server.listen(port,()=>console.log(`Sulia Communication Core listening on http://localhost:${port}`));
module.exports={server,store,identity,persistence};
