const crypto = require('node:crypto');

function hash(value){
  return crypto.createHash('sha256').update(value).digest('hex');
}

class IdentityService {
  constructor(seed={}){
    this.users = new Map(Object.entries(seed.users||{}));
    this.tokens = new Map(Object.entries(seed.tokens||{}));
  }

  register({userId, displayName}){
    if(!/^[A-Za-z0-9_-]{2,64}$/.test(userId||'')) throw new Error('Invalid user ID');
    if(this.users.has(userId)) throw new Error('User already exists');
    if(typeof displayName!=='string' || displayName.trim().length<1 || displayName.length>120) throw new Error('Invalid display name');
    const token = crypto.randomBytes(32).toString('hex');
    const user = {userId, displayName:displayName.trim(), createdAt:new Date().toISOString()};
    this.users.set(userId,user);
    this.tokens.set(hash(token),userId);
    return {user, token};
  }

  hasUser(userId){ return this.users.has(userId); }

  authenticate(authorization){
    if(typeof authorization!=='string' || !authorization.startsWith('Bearer ')) throw new Error('Authentication required');
    const token=authorization.slice(7).trim();
    if(!/^[a-f0-9]{64}$/.test(token)) throw new Error('Invalid authentication token');
    const userId=this.tokens.get(hash(token));
    if(!userId || !this.users.has(userId)) throw new Error('Invalid authentication token');
    return this.users.get(userId);
  }

  snapshot(){
    return {
      users:Object.fromEntries(this.users),
      tokens:Object.fromEntries(this.tokens)
    };
  }
}

module.exports={IdentityService,hash};
