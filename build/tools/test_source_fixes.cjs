const fs=require('fs'),path=require('path'),vm=require('vm'),assert=require('assert/strict');
const B=path.join(__dirname,'..'),groups=JSON.parse(fs.readFileSync(path.join(B,'data/original_compat.json'),'utf8'));
const context={SOURCE_COMPAT51:groups};vm.createContext(context);vm.runInContext(fs.readFileSync(path.join(__dirname,'original_compat.js'),'utf8'),context);
const migrate=b=>context.sourceMigrateBundle51(b),clone=o=>JSON.parse(JSON.stringify(o));
const records=JSON.parse(fs.readFileSync(path.join(B,'../records/attempts.json'),'utf8'));const before=clone(records);migrate(records);
const phrase=records.notes['2014-3'].phrases.find(p=>p.text==='hail from');assert.equal(phrase.a,26);assert.equal(phrase.b,27);assert.equal(phrase.m,'来自（麻省理工）');assert.equal(phrase.sourceOriginal51.a,27);assert.equal(phrase.sourceOriginal51.b,28);
assert.deepEqual(records.attempts.map(a=>a.answers),before.attempts.map(a=>a.answers));assert.equal(records.attempts.length,before.attempts.length);
const once=JSON.stringify(records);assert.equal(migrate(records),false);assert.equal(JSON.stringify(records),once);
for(const group of groups){
 const states={};for(const o of group.old){const n=o.text.split(' ').length;states[o.key]={chunks:{0:'主句'},roles:[{u:'M0',a:0,b:n-1,r:'主语'}],chunkChecked:true,roleChecked:true,updatedAt:'2026-10-30T00:00:00Z'};}
 const b={notes:{},attempts:{},prefs:{sent36:{states,current:group.old.at(-1).key}}};
 const originals=clone(states);migrate(b);
 for(const target of group.new){const st=b.prefs.sent36.states[target.key];assert.equal(st.roleChecked,true);assert.equal(st.chunkChecked,true);assert.deepEqual(clone(st.sourceOriginal51),originals);for(const r of st.roles)assert(r.a>=0&&r.b<target.text.split(' ').length);}
 const one=JSON.stringify(b);migrate(b);assert.equal(JSON.stringify(b),one);
 if(group.old.length>1){const partial={prefs:{sent36:{states:{[group.old[0].key]:clone(originals[group.old[0].key])}}}};migrate(partial);assert.equal(partial.prefs.sent36.states[group.new[0].key].roleChecked,false);assert.equal(partial.prefs.sent36.states[group.new[0].key].sourceOriginal51[group.old[0].key].roleChecked,true);}
}
const split=groups.find(g=>g.new.length===2),bundle={notes:{'2020-1':{sentences:[{p:5,s:1,text:split.old[0].text}],words:[],phrases:[]}},prefs:{}};migrate(bundle);assert.equal(bundle.notes['2020-1'].sentences.length,2);assert(bundle.notes['2020-1'].sentences.every(s=>s.sourceOriginal51.text===split.old[0].text));
console.log(`PASS ${groups.length}组迁移：完整/部分完成、原答案归档、合并/拆分、重复执行、真实短语位置、成绩保留`);

const current=groups.find(g=>g.id==='2022-4|4:4'),fresh={notes:{'2022-4':{phrases:[{p:4,s:4,loc:'4:4',a:3,b:5,text:'who had predicted',sent:current.new[0].text}]}}};migrate(fresh);assert.equal(fresh.notes['2022-4'].phrases[0].a,3);assert.equal(fresh.notes['2022-4'].phrases[0].b,5);console.log('PASS 新版本短语不重复偏移');

for(const group of groups.filter(g=>g.revision===2)){
 const key=group.old[0].key,[tid,loc]=key.split('|'),[p,s]=loc.split(':').map(Number),n=group.old[0].text.split(' ').length;
 const oldState={sourceRevision51:1,chunks:{0:'主句'},roles:[{u:'M0',a:0,b:n-1,r:'主语'}],chunkChecked:true,roleChecked:false,updatedAt:'2026-11-02T00:00:00Z'};
 const bundle={notes:{[tid]:{sentences:[{p,s,text:group.old[0].text,sourceRevision51:1}],phrases:[{p,s,a:0,b:n-1,text:'old span',sent:group.old[0].text,sourceRevision51:1}]}},prefs:{sent36:{states:{[key]:clone(oldState)}}}};
 migrate(bundle);const st=bundle.prefs.sent36.states[key];assert.equal(st.sourceRevision51,2);assert.equal(st.roleChecked,false);assert.deepEqual(clone(st.sourceOriginal51[key]),oldState);
 const phrase=bundle.notes[tid].phrases[0];assert.equal(phrase.sourceRevision51,2);assert(phrase.b<group.new[0].text.split(' ').length);
 const once=JSON.stringify(bundle);assert.equal(migrate(bundle),false);assert.equal(JSON.stringify(bundle),once);
 const fresh={notes:{[tid]:{phrases:[{p,s,a:0,b:0,text:'fresh',sent:group.new[0].text}]}}};migrate(fresh);assert.equal(fresh.notes[tid].phrases[0].a,0);assert.equal(fresh.notes[tid].phrases[0].b,0);
}
console.log(`PASS ${groups.filter(g=>g.revision===2).length}组专项：旧v51标记升到2、部分完成保留、原答案归档、幂等及新短语坐标`);
const wordGroup=groups.find(g=>g.id==='special-2025-translation|0:0');
const wordBundle={notes:{'special-2025-translation':{words:[{p:0,s:0,i:5,wk:'0:0:5',w:'slows',sent:wordGroup.old[0].text,sourceRevision51:1}]}}};
migrate(wordBundle);const migratedWord=wordBundle.notes['special-2025-translation'].words[0];
assert.equal(migratedWord.i,7);assert.equal(migratedWord.wk,'0:0:7');assert.equal(migratedWord.sourceOriginal51.wk,'0:0:5');
const marked=wordGroup.new[0].text.split(' ').map((_,i)=>migratedWord.wk===`0:0:${i}`||(migratedWord.p===0&&migratedWord.s===0&&migratedWord.i===i));
assert.deepEqual(marked.map((v,i)=>v?i:-1).filter(i=>i>=0),[7]);
console.log('PASS 专项生词位置与wk同步，标记只命中正确单词一次');
