const test=require('node:test');
const assert=require('node:assert/strict');
const {SuliaStore}=require('../src/store');
const {IdentityService}=require('../src/auth');

test('conversation lifecycle supports text, face reply, reaction, read receipt and event history',()=>{
  const s=new SuliaStore();
  const c=s.createConversation({members:['u1','u2'],title:'Mia & Juanita'});
  const text=s.createMessage(c.id,{senderId:'u1',type:'text',body:'Hello',clientMessageId:'m1'});
  const duplicate=s.createMessage(c.id,{senderId:'u1',type:'text',body:'Hello',clientMessageId:'m1'});
  assert.equal(duplicate.id,text.id);
  const face=s.createMessage(c.id,{senderId:'u2',type:'face',body:'Face reply video',replyTo:text.id});
  assert.equal(face.replyTo,text.id);
  const reaction=s.addReaction(text.id,{senderId:'u2',reaction:'❤️'});
  assert.equal(reaction.reactionCount,1);
  const read=s.markRead(text.id,'u2');
  assert.equal(read.delivery.state,'read');
  const events=s.eventsSince(c.id,1);
  assert.ok(events.some(e=>e.type==='message.created'));
  assert.ok(events.some(e=>e.type==='message.reacted'));
  assert.ok(events.some(e=>e.type==='message.read'));
});

test('membership and message validation boundaries are enforced',()=>{
  const s=new SuliaStore();
  const c=s.createConversation({members:['u1','u2']});
  assert.throws(()=>s.createMessage(c.id,{senderId:'u3',type:'text',body:'x'}),/member/);
  assert.throws(()=>s.createMessage(c.id,{senderId:'u1',type:'video',body:'x'}),/Unsupported/);
  assert.throws(()=>s.createMessage(c.id,{senderId:'u1',type:'text',body:''}),/required/);
  assert.throws(()=>s.addReaction('missing',{senderId:'u2',reaction:'ok'}),/Message not found/);
  assert.throws(()=>s.eventsSince('missing',0),/Conversation not found/);
});

test('identity service issues bearer tokens and rejects invalid tokens',()=>{
  const auth=new IdentityService();
  const result=auth.register({userId:'u1',displayName:'Juanita'});
  assert.equal(result.user.userId,'u1');
  assert.match(result.token,/^[a-f0-9]{64}$/);
  assert.equal(auth.authenticate(`Bearer ${result.token}`).userId,'u1');
  assert.throws(()=>auth.authenticate('Bearer invalid'),/Invalid authentication token/);
  assert.throws(()=>auth.register({userId:'u1',displayName:'Again'}),/already exists/);
});
