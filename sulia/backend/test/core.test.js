const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const os=require('node:os');
const path=require('node:path');
const {SuliaStore}=require('../src/store');
const {IdentityService}=require('../src/auth');
const {MediaService}=require('../src/media');
const {NotificationQueue}=require('../src/notifications');

test('conversation lifecycle supports text, face reply, reaction, read receipt, media reference and event history',()=>{
  const s=new SuliaStore();
  const c=s.createConversation({members:['u1','u2'],title:'Mia & Juanita'});
  const text=s.createMessage(c.id,{senderId:'u1',type:'text',body:'Hello',clientMessageId:'m1'});
  const duplicate=s.createMessage(c.id,{senderId:'u1',type:'text',body:'Hello',clientMessageId:'m1'});
  assert.equal(duplicate.id,text.id);
  const face=s.createMessage(c.id,{senderId:'u2',type:'face',body:'',mediaId:'media_1234567890',replyTo:text.id});
  assert.equal(face.replyTo,text.id);
  assert.equal(face.mediaId,'media_1234567890');
  const reaction=s.addReaction(text.id,{senderId:'u2',reaction:'heart'});
  assert.equal(reaction.reactionCount,1);
  const read=s.markRead(text.id,'u2');
  assert.equal(read.delivery.state,'read');
  const events=s.eventsSince(c.id,1);
  assert.ok(events.some(e=>e.type==='message.created'));
  assert.ok(events.some(e=>e.type==='message.reacted'));
  assert.ok(events.some(e=>e.type==='message.read'));
});

test('membership and validation boundaries are enforced',()=>{
  const s=new SuliaStore();
  const c=s.createConversation({members:['u1','u2']});
  assert.throws(()=>s.createMessage(c.id,{senderId:'u3',type:'text',body:'x'}),/member/);
  assert.throws(()=>s.createMessage(c.id,{senderId:'u1',type:'video',body:'x'}),/Unsupported/);
  assert.throws(()=>s.createMessage(c.id,{senderId:'u1',type:'text',body:''}),/required/);
  assert.throws(()=>s.createMessage(c.id,{senderId:'u1',type:'face',body:''}),/Media message/);
  assert.throws(()=>s.addReaction('missing',{senderId:'u2',reaction:'ok'}),/Message not found/);
  assert.throws(()=>s.eventsSince('missing',0),/Conversation not found/);
});

test('identity service issues bearer tokens and rejects invalid tokens',()=>{
  const auth=new IdentityService();
  const result=auth.register({userId:'u1',displayName:'Juanita'});
  assert.equal(result.user.userId,'u1');
  assert.match(result.token,/^[a-f0-9]{64}$/);
  assert.equal(auth.authenticate('Bearer '+result.token).userId,'u1');
  assert.throws(()=>auth.authenticate('Bearer invalid'),/Invalid authentication token/);
  assert.throws(()=>auth.register({userId:'u1',displayName:'Again'}),/already exists/);
});

test('media service enforces type, size, ownership and safe storage',()=>{
  const dir=fs.mkdtempSync(path.join(os.tmpdir(),'sulia-media-'));
  const media=new MediaService(dir,{maxBytes:1024});
  const meta=media.beginUpload({ownerId:'u1',contentType:'audio/mpeg',expectedBytes:4});
  const stored=media.write(meta.id,Buffer.from([1,2,3,4]));
  const result=media.complete(meta.id,stored.sizeBytes);
  assert.equal(result.ownerId,'u1');
  assert.equal(result.sizeBytes,4);
  assert.ok(fs.existsSync(stored.path));
  assert.throws(()=>media.beginUpload({ownerId:'u1',contentType:'application/exe'}),/Unsupported/);
  fs.rmSync(dir,{recursive:true,force:true});
});

test('notification queue isolates users and supports read state',()=>{
  const q=new NotificationQueue();
  const n=q.enqueue({userId:'u2',type:'message.received',payload:{messageId:'m1'}});
  q.enqueue({userId:'u3',type:'message.received',payload:{messageId:'m2'}});
  assert.equal(q.forUser('u2').length,1);
  assert.equal(q.forUser('u2',{unreadOnly:true}).length,1);
  q.markRead(n.id,'u2');
  assert.equal(q.forUser('u2',{unreadOnly:true}).length,0);
});
