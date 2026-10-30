// ===== v39：926 核心词并入背单词词库（与自己的生词混排） =====
const v39CatalogPrev=v26Catalog;
let v39CatKey='',v39CatCache=null;
v26Catalog=function(){const base=v39CatalogPrev();if(base===v39CatKey&&v39CatCache)return v39CatCache;
 const coreBy=new Map(CORE926CAT.map(w=>[w.id,w]));const seen=new Set();
 const words=base.words.map(w=>{const c=coreBy.get(w.id);if(!c)return w;seen.add(w.id);return {...w,core:true,coreN:c.coreN,group:c.group,coreMean:c.coreMean};});
 const personal=words.filter(w=>w.source==='personal'),bank=words.filter(w=>w.source!=='personal');
 const extra=CORE926CAT.filter(w=>!seen.has(w.id)).map(w=>({...w,confuse:(CONFUSE[w.id]||[]).map(x=>[x.w,x.m+'；'+(x.u||'')]),root:ROOTS[w.id]||''}));
 const bankCore=bank.filter(w=>w.core),bankRest=bank.filter(w=>!w.core);
 const core=[...extra,...bankCore].sort((a,b)=>a.coreN-b.coreN);
 v39CatKey=base;v39CatCache={words:[...personal,...core,...bankRest],personalCount:base.personalCount,bankCount:base.bankCount,coreCount:CORE926CAT.length};return v39CatCache;};
const v39PublishPrev=v26Publish;
v26Publish=function(force){v39PublishPrev(force);};
// v41：每次点进「生词」都回到首页
const v41PrevShow=show;
show=function(v){v41PrevShow(v);if(v==='vocab')setTimeout(()=>window.postMessage({type:'v41:home'},'*'),0);};
// v41：不再自动上传，只有点「同步」才上传（打开页面时仍会读取一次云端，方便换设备接着做）
let g41Manual=false;
const g41Write=sync19Write;
sync19Write=async function(){if(!g41Manual){sync19Pending=true;LS.set('sync19_pending',true);dirty=true;updateSyncBanner();return true;}return g41Write();};
const g41Now=sync19Now;
sync19Now=async function(){g41Manual=true;try{return await g41Now();}finally{g41Manual=false;}};
saveAll=function(){return sync19Now();};
document.getElementById('btn-cloud-sync').onclick=()=>sync19Now();
document.getElementById('gh-save')?.addEventListener('click',()=>{g41Manual=true;setTimeout(()=>{g41Manual=false;},20000);},true);
