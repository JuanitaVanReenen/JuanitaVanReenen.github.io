const fs=require('node:fs');
const path=require('node:path');
const crypto=require('node:crypto');

const TYPES=new Map([
  ['audio/mpeg','.mp3'],['audio/wav','.wav'],['audio/x-wav','.wav'],
  ['video/mp4','.mp4'],['video/webm','.webm'],['image/jpeg','.jpg'],['image/png','.png']
]);

class MediaService{
  constructor(root,{maxBytes=25*1024*1024,seed={}}={}){
    this.root=path.resolve(root);this.maxBytes=maxBytes;this.pending=new Map();
    this.records=new Map(Object.entries(seed.records||{}));fs.mkdirSync(this.root,{recursive:true});
  }
  beginUpload({ownerId,contentType,expectedBytes}){
    if(!ownerId)throw new Error('Media owner is required');
    const ext=TYPES.get(contentType);if(!ext)throw new Error('Unsupported media type');
    if(expectedBytes!==undefined&&(!Number.isInteger(expectedBytes)||expectedBytes<1||expectedBytes>this.maxBytes))throw new Error('Invalid media size');
    const id='media_'+crypto.randomUUID();
    const meta={id,ownerId,contentType,ext,expectedBytes};
    this.pending.set(id,meta);return meta;
  }
  write(id,buffer){
    if(!Buffer.isBuffer(buffer))throw new Error('Media payload must be binary');
    if(buffer.length<1||buffer.length>this.maxBytes)throw new Error('Media payload exceeds limit');
    const meta=this.pending.get(id);if(!meta)throw new Error('Media upload not found');
    const file=path.join(this.root,id+meta.ext);
    fs.writeFileSync(file,buffer,{flag:'wx'});
    return {id,sizeBytes:buffer.length,path:file};
  }
  complete(id,sizeBytes){
    const meta=this.pending.get(id);if(!meta)throw new Error('Media upload not found');
    if(sizeBytes<1||sizeBytes>this.maxBytes)throw new Error('Media payload exceeds limit');
    if(meta.expectedBytes!==undefined&&meta.expectedBytes!==sizeBytes)throw new Error('Media size mismatch');
    const record={id,ownerId:meta.ownerId,contentType:meta.contentType,sizeBytes,extension:meta.ext,createdAt:new Date().toISOString()};
    this.pending.delete(id);this.records.set(id,record);return record;
  }
  getOwned(id,ownerId){
    const record=this.records.get(id);
    if(!record)throw new Error('Media not found');
    if(record.ownerId!==ownerId)throw new Error('Media access denied');
    return record;
  }
  snapshot(){return {records:Object.fromEntries(this.records)};}
}
module.exports={MediaService,TYPES};
