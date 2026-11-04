// Pure, idempotent conversion. Original answers remain embedded in each migrated record.
function sourceCopy51(v){return JSON.parse(JSON.stringify(v));}
function sourceSpan51(map,a,b){
 const r=map.slice(a,b+1).filter(Boolean);return r.length?[Math.min(...r.map(x=>x[0])),Math.max(...r.map(x=>x[1]))]:null;
}
function sourceMigrateBundle51(bundle){
 let changed=false;const groups=SOURCE_COMPAT51;
 const lookup=new Map();for(const g of groups)for(const o of g.old)lookup.set(o.key,g);
 function items(tid,rows,kind){
  if(!Array.isArray(rows))return rows;
  const out=[];
  for(const item of rows){
   const loc=item.loc||`${item.p}:${item.s}`,key=tid+'|'+loc,g=lookup.get(key);
   const revision=g?.revision||1;
   if(!g||Number(item.sourceRevision51||0)>=revision){out.push(item);continue;}
   // Entries created on the corrected page already use the new token coordinates.
   const currentText=item.sent||(kind==='sentences'?item.text:null);
   if(currentText&&g.new.some(n=>n.key===key&&n.text===currentText)){item.sourceRevision51=revision;out.push(item);changed=true;continue;}
   const candidates=g.new.filter(n=>n.sources.some(s=>s.key===key&&s.tokens.some(Boolean)));
   let selected=candidates;
   if(kind!=='sentences'){
    const text=(item.raw||item.w||item.text||'').replace(/^[^\w]+|[^\w]+$/g,'').toLowerCase();
    const pos=Number.isInteger(item.i)?item.i:Number.isInteger(item.a)?item.a:null;
    selected=pos===null?candidates.filter(n=>n.text.toLowerCase().includes(text)):candidates.filter(n=>n.sources.find(s=>s.key===key)?.tokens[pos]);
    selected=selected.slice(0,1);if(!selected.length)selected=candidates.slice(0,1);
   }
   if(!selected.length){out.push(item);continue;}
   for(const target of selected){
    const r=sourceCopy51(item),src=target.sources.find(s=>s.key===key),loc2=target.key.split('|')[1],[p,s]=loc2.split(':').map(Number);
    r.sourceOriginal51=sourceCopy51(item);r.sourceRevision51=revision;r.p=p;r.s=s;
    if('loc'in r)r.loc=loc2;if(kind==='sentences')r.text=target.text;
    if('sent'in r)r.sent=target.text;
    if(Number.isInteger(r.a)&&Number.isInteger(r.b)){const range=sourceSpan51(src.tokens,r.a,r.b);if(range)[r.a,r.b]=range;}
    if(Number.isInteger(r.i)&&src.tokens[r.i])r.i=src.tokens[r.i][0];
    if('wk'in r&&Number.isInteger(r.i))r.wk=`${loc2}:${r.i}`;
    out.push(r);changed=true;
   }
  }return out;
 }
 for(const [tid,n] of Object.entries(bundle.notes||{}))for(const kind of ['sentences','words','phrases'])if(n[kind])n[kind]=items(tid,n[kind],kind);
 for(const a of Object.values(bundle.attempts||{}))if(a?.textId)for(const kind of ['sentences','words','phrases'])if(a[kind])a[kind]=items(a.textId,a[kind],kind);
 const store=bundle.prefs?.sent36;
 if(store?.states){
  for(const g of groups){
   const revision=g.revision||1;
   const snapshots=Object.fromEntries(g.old.map(o=>[o.key,store.states[o.key]]).filter(([,s])=>s&&Number(s.sourceRevision51||0)<revision).map(([k,v])=>[k,sourceCopy51(v)]));
   if(!Object.keys(snapshots).length)continue;
   for(const target of g.new){
    if(Number(store.states[target.key]?.sourceRevision51||0)>=revision)continue;
    const relevant=target.sources.filter(s=>s.tokens.some(Boolean)),present=relevant.map(s=>snapshots[s.key]);
    if(!present.some(Boolean))continue;
    const latest=present.filter(Boolean).sort((a,b)=>(a.updatedAt||'').localeCompare(b.updatedAt||'')).at(-1);
    const state={...sourceCopy51(latest),chunks:{},roles:[],chunkChecked:present.every(s=>!!s?.chunkChecked),roleChecked:present.every(s=>!!s?.roleChecked),skipRole:present.every(s=>!!s?.skipRole),sourceOriginal51:sourceCopy51(snapshots),sourceRevision51:revision};
    const chunkAnswers={};
    for(const src of relevant){const old=snapshots[src.key];if(!old)continue;
     for(const [ni,oldIndexes] of Object.entries(src.chunks))for(const oi of oldIndexes){const a=old.chunks?.[oi];if(a)(chunkAnswers[ni]||=[]).push(a);}
     for(const role of old.roles||[]){const r=sourceSpan51(src.tokens,role.a,role.b),unit=src.units[role.u];if(r&&unit)state.roles.push({...role,u:unit,a:r[0],b:r[1]});}
    }
    for(const [i,answers] of Object.entries(chunkAnswers))if(new Set(answers).size===1)state.chunks[i]=answers[0];
    store.states[target.key]=state;changed=true;
   }
   // Retain obsolete IDs and their full historical answers for rollback and old imports.
   for(const [key,snapshot] of Object.entries(snapshots))if(!g.new.some(n=>n.key===key))store.states[key]={...snapshot,sourceOriginal51:sourceCopy51(snapshot),sourceRevision51:revision,sourceAlias51:g.new.map(n=>n.key)};
  }
  if(store.current&&lookup.has(store.current)){const next=lookup.get(store.current).new[0].key;if(next!==store.current){store.sourceCurrentOriginal51??=store.current;store.current=next;changed=true;}}
 }
 return changed;
}
if(typeof window!=='undefined')window.addEventListener('DOMContentLoaded',()=>{
 const convert=()=>{if(sourceMigrateBundle51({attempts,notes,prefs}))touch();};
 convert();
 // New exercise states must never be interpreted as v50 token coordinates.
 const priorState=ls36State;
 ls36State=function(key){const existed=!!ls36Store().states[key],state=priorState(key);if(!existed)state.sourceRevision51=SOURCE_COMPAT51.find(g=>g.new.some(n=>n.key===key))?.revision||1;return state;};
 // Imports also persist before rendering; use that boundary to normalize old backups.
 const priorPersist=persist;
 persist=function(){sourceMigrateBundle51({attempts,notes,prefs});return priorPersist();};
 const merge=sync19MergeRemote;
 sync19MergeRemote=function(remote){const copy=sourceCopy51(remote);sourceMigrateBundle51(copy);const result=merge(copy);convert();return result;};
 const oldLocate=locateOf;
 locateOf=function(tid,n){const seen=new Set();return oldLocate(tid,n).flatMap(([p,s])=>{
  const key=tid+'|'+p+':'+s,mapped=SOURCE_SENTENCE_ALIASES[key]||[key];
  return mapped.map(k=>k.split('|')[1]).filter(k=>!seen.has(k)&&seen.add(k)).map(k=>k.split(':').map(Number));
 });};
});
