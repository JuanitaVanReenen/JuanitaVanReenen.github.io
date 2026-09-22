const fs=require('node:fs');
const path=require('node:path');

class JsonPersistence{
  constructor(filePath){this.filePath=filePath;}
  load(){
    if(!fs.existsSync(this.filePath))return {};
    const raw=fs.readFileSync(this.filePath,'utf8');if(!raw.trim())return {};
    return JSON.parse(raw);
  }
  save(snapshot){
    const dir=path.dirname(this.filePath);fs.mkdirSync(dir,{recursive:true});
    const temp=this.filePath+'.tmp';
    fs.writeFileSync(temp,JSON.stringify(snapshot,null,2),'utf8');
    fs.renameSync(temp,this.filePath);
  }
}
module.exports={JsonPersistence};
