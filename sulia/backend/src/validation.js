const TYPES=new Set(['text','voice','face']);

function assertMessageInput(input={}){
  if(!input || typeof input!=='object') throw new Error('Invalid message payload');
  if(!TYPES.has(input.type||'text')) throw new Error('Unsupported message type');
  if(typeof input.body!=='string') throw new Error('Message body must be text');
  if(input.body.length>20000) throw new Error('Message body is too large');
  if((input.type||'text')==='text' && !input.body.trim()) throw new Error('Text message body is required');
  if(input.replyTo!==null && input.replyTo!==undefined && typeof input.replyTo!=='string') throw new Error('Invalid reply target');
  if(input.clientMessageId!==null && input.clientMessageId!==undefined && !/^[A-Za-z0-9_-]{1,128}$/.test(input.clientMessageId)) throw new Error('Invalid client message ID');
}

function assertConversationInput(input={}){
  if(!Array.isArray(input.members) || input.members.length<2 || input.members.length>100) throw new Error('A conversation needs 2 to 100 members');
  const unique=[...new Set(input.members)];
  if(unique.length!==input.members.length) throw new Error('Duplicate conversation member');
  if(unique.some(x=>typeof x!=='string'||!/^[A-Za-z0-9_-]{2,64}$/.test(x))) throw new Error('Invalid conversation member');
  if(input.title!==undefined && (typeof input.title!=='string'||input.title.length>200)) throw new Error('Invalid conversation title');
}

module.exports={assertMessageInput,assertConversationInput};
