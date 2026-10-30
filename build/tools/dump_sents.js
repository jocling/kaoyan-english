// 新增真题后重新生成 build/data/all_sents.json（拆解定位以它为准）：node build/tools/dump_sents.js
const {chromium}=require('playwright');const path=require('path'),fs=require('fs');
(async()=>{const b=await chromium.launch(),p=await b.newPage();await p.goto('file://'+path.join(__dirname,'..','..','index.html'));await p.waitForTimeout(2500);
 const o=await p.evaluate(()=>{const o={};for(const t of TEXTS){o[t.id]={};t.paragraphs.forEach((para,pi)=>splitSentences(para).forEach((x,si)=>{o[t.id][pi+':'+si]=[sentText(t.id,pi,si),trOf(t.id,pi,si)];}));}
  for(const r of GRAMMAR23_ROWS){if(!String(r.tid).startsWith('special-'))continue;(o[r.tid]=o[r.tid]||{})[r.key]=[r.text,r.cn||r.parse?.cn||''];}return o;});
 fs.writeFileSync(path.join(__dirname,'..','data','all_sents.json'),JSON.stringify(o));console.log(Object.keys(o).length,'篇',Object.values(o).reduce((n,v)=>n+Object.keys(v).length,0),'句');await b.close();})();
