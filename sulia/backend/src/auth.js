const crypto=require('node:crypto');

function hash(value){return crypto.createHash('sha256').update(value).digest('hex');}

class IdentityService{
  constructor(seed={}){
    this.users=new Map(Object.entries(seed.users||{}));
    this.tokens=new Map(Object.entries(seed.tokens||{}));
    this.tokenTtlMs=Number(seed.tokenTtlMs||7*24*60*60*1000);
  }

  register({userId,displayName}){
    if(!/^[A-Za-z0-9_-]{2,64}$/.test(userId||''))throw new Error('Invalid user ID');
    if(this.users.has(userId))throw new Error('User already exists');
    if(typeof displayName!=='string'||displayName.trim().length<1||displayName.length>120)throw new Error('Invalid display name');
    const token=crypto.randomBytes(32).toString('hex');
    const now=Date.now();
    const user={userId,displayName:displayName.trim(),createdAt:new Date(now).toISOString()};
    this.users.set(userId,user);
    this.tokens.set(hash(token),{userId,issuedAt:now,expiresAt:now+this.tokenTtlMs});
    return {user,token,expiresAt:new Date(now+this.tokenTtlMs).toISOString()};
  }

  hasUser(userId){return this.users.has(userId);}

  authenticate(authorization){
    if(typeof authorization!=='string'||!authorization.startsWith('Bearer '))throw new Error('Authentication required');
    const token=authorization.slice(7).trim();
    if(!/^[a-f0-9]{64}$/.test(token))throw new Error('Invalid authentication token');
    const record=this.tokens.get(hash(token));
    if(!record)throw new Error('Invalid authentication token');
    const normalized=typeof record==='string'?{userId:record,issuedAt:0,expiresAt:Infinity}:record;
    if(normalized.expiresAt!==Infinity&&Date.now()>normalized.expiresAt){
      this.tokens.delete(hash(token));
      throw new Error('Authentication token expired');
    }
    if(!this.users.has(normalized.userId))throw new Error('Invalid authentication token');
    return this.users.get(normalized.userId);
  }

  revoke(authorization){
    if(typeof authorization!=='string'||!authorization.startsWith('Bearer '))throw new Error('Authentication required');
    const token=authorization.slice(7).trim();
    if(!/^[a-f0-9]{64}$/.test(token))throw new Error('Invalid authentication token');
    const key=hash(token);
    if(!this.tokens.has(key))throw new Error('Invalid authentication token');
    this.tokens.delete(key);
    return {revoked:true};
  }

  snapshot(){return {users:Object.fromEntries(this.users),tokens:Object.fromEntries(this.tokens),tokenTtlMs:this.tokenTtlMs};}
}
module.exports={IdentityService,hash};
