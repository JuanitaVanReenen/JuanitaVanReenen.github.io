const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const os=require('node:os');
const path=require('node:path');

const root=fs.mkdtempSync(path.join(os.tmpdir(),'sulia-api-'));
process.env.SULIA_DATA_FILE=path.join(root,'sulia.json');
process.env.SULIA_MEDIA_DIR=path.join(root,'media');

const {server}=require('../src/server');

async function req(port,path,options={}){
  const response=await fetch('http://127.0.0.1:'+port+path,options);
  const text=await response.text();
  let body={};try{body=text?JSON.parse(text):{};}catch{body={raw:text};}
  return {status:response.status,body};
}

test('HTTP API enforces identity, ownership, persistence and notification boundaries',async()=>{
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  const port=server.address().port;
  try{
    const a=await req(port,'/api/auth/register',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({userId:'alice',displayName:'Alice'})});
    const b=await req(port,'/api/auth/register',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({userId:'bob',displayName:'Bob'})});
    assert.equal(a.status,201);assert.equal(b.status,201);
    const alice='Bearer '+a.body.token,bob='Bearer '+b.body.token;

    const c=await req(port,'/api/conversations',{method:'POST',headers:{authorization:alice,'content-type':'application/json'},body:JSON.stringify({members:['alice','bob'],title:'Sulia test'})});
    assert.equal(c.status,201);
    const id=c.body.id;

    const m=await req(port,'/api/conversations/'+id+'/messages',{method:'POST',headers:{authorization:alice,'content-type':'application/json'},body:JSON.stringify({type:'text',body:'Hello',clientMessageId:'hello-1'})});
    assert.equal(m.status,201);

    const n=await req(port,'/api/notifications?unread=1',{headers:{authorization:bob}});
    assert.equal(n.status,200);assert.equal(n.body.notifications.length,1);

    const media=await req(port,'/api/media',{method:'POST',headers:{authorization:alice,'content-type':'audio/mpeg','content-length':'4'},body:Buffer.from([1,2,3,4])});
    assert.equal(media.status,201);

    const voice=await req(port,'/api/conversations/'+id+'/messages',{method:'POST',headers:{authorization:alice,'content-type':'application/json'},body:JSON.stringify({type:'voice',body:'',mediaId:media.body.id})});
    assert.equal(voice.status,201);

    const badMedia=await req(port,'/api/conversations/'+id+'/messages',{method:'POST',headers:{authorization:bob,'content-type':'application/json'},body:JSON.stringify({type:'voice',body:'',mediaId:media.body.id})});
    assert.equal(badMedia.status,403);

    const revoke=await req(port,'/api/auth/revoke',{method:'POST',headers:{authorization:alice}});
    assert.equal(revoke.status,200);
    const after=await req(port,'/api/notifications',{headers:{authorization:alice}});
    assert.equal(after.status,401);
  }finally{
    await new Promise(resolve=>server.close(resolve));
    fs.rmSync(root,{recursive:true,force:true});
  }
});
