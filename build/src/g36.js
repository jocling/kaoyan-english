
// ===== v36：长难句拆解统一渲染（先主句主谓宾 → 再从句整体与内部 → 再修饰；译文放最后） =====
const G36_NO='①②③④⑤⑥⑦⑧⑨⑩';
const G36_SHORT={'主语':'主','谓语':'谓','宾语':'宾','表语':'表','间接宾语':'间宾','直接宾语':'直宾','宾语补足语':'宾补','宾补':'宾补','形式主语':'形主','真正主语':'真主','形式宾语':'形宾','真正宾语':'真宾','系动词':'系','连接词':'连'};
function g36Sk(tid,key){return (typeof SKEL36!=='undefined'&&SKEL36[tid+'|'+key])||null;}
function g36RgStr(rgs){return (rgs||[]).map(r=>r[0]+'-'+r[1]).join(',');}
function g36ClauseName(id){return '从句'+G36_NO[(+id.slice(1))-1];}
function g36Span(T,rgs){return (rgs||[]).map(r=>T.slice(r[0],r[1]+1).join(' ')).join(' … ');}
function g36ScrollInPane(el){
 if(!el)return;let p=el.parentElement;
 while(p&&p!==document.body){const st=getComputedStyle(p);if(/(auto|scroll)/.test(st.overflowY)&&p.scrollHeight>p.clientHeight+2){const top=el.getBoundingClientRect().top-p.getBoundingClientRect().top+p.scrollTop-p.clientHeight/3;p.scrollTo({top:Math.max(0,top),behavior:'smooth'});return;}p=p.parentElement;}
}
function g36Body(tid,key,raw,pre,cn,opts){
 opts=opts||{};const sk=g36Sk(tid,key);
 return sk?g36Full(raw,sk,pre,cn,opts):g36Fallback(raw,pre,cn,opts);
}
function g36Tail(sk,pre,cn,n){
 let i=n,out='';
 const pick=k=>(sk&&sk[k])||(pre&&pre[k]);
 for(const [title,k] of [['本句容易读错的地方','point'],['可带走的认识','remember'],['下次怎样识别','spot']]){const v=pick(k);if(v)out+=`<li><h5>${G36_NO[i++]} ${title}</h5><div class="fb">${esc(v)}</div></li>`;}
 return out;
}
function g36Cn(cn){return cn?`<div class="g36-cn"><span>本句译文 · 看完拆解再对照</span>${esc(cn)}</div>`:'';}
function g36Legend(hasClause){return `<div class="g36-legend"><span><b>黑色粗体</b>＝主句骨架</span>${hasClause?'<span class="lc">灰色＝从句（灰色粗体＝从句骨架）</span><span class="lj">青色＝从句连接词</span>':''}<span>｜＝顺读切块</span><details class="g36-help"><summary aria-label="怎么用">?</summary><p>下面每一条都能点：点了以后，上面原句里黄色是这一块，蓝色下划线是它挂靠的词。再点一次取消。</p></details></div>`;}
function g36Full(raw,sk,pre,cn,opts){
 const T=raw.split(' '),n=T.length,cls=T.map(()=>new Set());
 for(const c of sk.clauses){for(let i=c.a;i<=c.b;i++)cls[i].add('c');for(const p of c.parts)for(const r of p.rg||[])for(let i=r[0];i<=r[1];i++)cls[i].add('cc');for(const r of c.connRg||[])for(let i=r[0];i<=r[1];i++)cls[i].add('cj');}
 const rubyStart={},rubyEnd={};
 for(const g of sk.main){for(const p of g.parts){if(!p.rg)continue;for(const r of p.rg){for(let i=r[0];i<=r[1];i++){cls[i].add('m');cls[i].delete('c');}}}for(const r of g.connRg||[]){for(let i=r[0];i<=r[1];i++)cls[i].add('m');}}
 const cutAfter=new Set(sk.chunks.slice(0,-1).map(c=>c.b));
 let sent='';
 for(let i=0;i<n;i++){
  if(rubyStart[i])sent+='<ruby>';
  sent+=`<span class="g36-t ${[...cls[i]].join(' ')}" data-i="${i}">${esc(T[i])}</span>`;
  if(rubyEnd[i]!==undefined)sent+=`<rt>${esc(rubyEnd[i])}</rt></ruby>`;
  if(i<n-1)sent+=cutAfter.has(i)?' <span class="g36-cut" aria-hidden="true"></span>':' ';
 }
 const clauseById=Object.fromEntries(sk.clauses.map(c=>[c.id,c]));
 const chip=(p,clauseOwner)=>{
  if(p.c){const c=clauseById[p.c];return `<button type="button" class="g36-chip ref" data-hl="${c.a}-${c.b}"><i>${esc(p.r)}</i><b>${g36ClauseName(p.c)}（整块）</b></button>`;}
  return `<button type="button" class="g36-chip" data-hl="${g36RgStr(p.rg)}"><i>${esc(p.r)}</i><b>${esc(g36Span(T,p.rg))}</b></button>`;
 };
 let sec=[],no=0;
 // ① 主句
 const mainRows=sk.main.map((g,gi)=>`${g.conn?`<div class="g36-row" style="margin:6px 0"><button type="button" class="g36-chip" data-hl="${g36RgStr(g.connRg)}"><i>并列连词</i><b>${esc(g.conn)}</b></button><span class="g36-sub" style="align-self:center;margin:0">${g.parts.some(p=>/主语/.test(p.r))?'连接前后两个都能独立成立的句子':'连接两个谓语，后一个谓语共用前面的主语'}</span></div>`:''}<div class="g36-row">${g.parts.map(p=>chip(p)).join('')}</div>`).join('');
 const how=g36How(T,sk);
 sec.push(`<li><h5>${G36_NO[no++]} 主句怎样成立${sk.main.length>1?(sk.main.slice(1).every(g=>g.parts.some(p=>/主语/.test(p.r)))?'（'+sk.main.length+' 个并列的句子）':'（一个主语带并列的谓语）'):''}</h5><div class="g36-sub">只看骨架：主语、谓语、宾语／表语，修饰先不带进来</div>${mainRows}${sk.gist?`<p class="g36-gist">${esc(sk.gist)}</p>`:''}${how}</li>`);
 // ② 从句
 if(sk.clauses.length){
  const card=c=>`<div class="g36-clause${c.parent?' nested':''}"><button type="button" class="g36-chead" data-hl="${c.a}-${c.b}"><span class="no">${g36ClauseName(c.id)}</span><span class="kind">${esc(c.kind)}</span><span class="fn">${esc(c.fn)}</span></button><div class="g36-ctext">${esc(T.slice(c.a,c.b+1).join(' '))}</div>${c.judge?`<div class="g36-judge"><span class="lb">连接词与判断${c.conn?` · <code>${esc(c.conn)}</code>`:''}</span>${esc(c.judge)}</div>`:''}${c.parts.length?`<div class="g36-sub">从句内部的骨架</div><div class="g36-row">${c.parts.map(p=>chip(p)).join('')}</div>`:''}</div>`;
  const order=[];const walk=pid=>sk.clauses.filter(c=>(c.parent||null)===pid).forEach(c=>{order.push(c);walk(c.id);});walk(null);
  for(const c of sk.clauses)if(!order.includes(c))order.push(c);
  sec.push(`<li><h5>${G36_NO[no++]} 从句：先看整块是什么，再看内部</h5>${order.map(card).join('')}</li>`);
 }
 // ③ 修饰
 if(sk.mods.length)sec.push(`<li><h5>${G36_NO[no++]} 修饰和补充：挂回到谁身上</h5>${sk.mods.map(m=>`<button type="button" class="g36-mod" data-hl="${g36RgStr(m.rg)}" data-tg="${g36RgStr(m.tg)}"><div class="mt">${esc(m.t)}</div><div class="ar">→ <b>${esc(m.to)}</b><span class="rl">${esc(m.role)}</span></div><div class="cn">${esc(m.cn)}</div></button>`).join('')}</li>`);
 const tail=g36Tail(sk,pre,cn,no);
 return `<section class="g36"><div class="pa-head"><span class="pa-type">${esc(sk.type||pre?.type||'句子结构')}</span></div><div class="g36-sent">${sent}</div>${g36Legend(sk.clauses.length)}<ol class="g36-flow">${sec.join('')}${tail}</ol>${opts.noCn?'':g36Cn(cn||sk.cn)}</section>`;
}
function g36How(T,sk){
 const txt=p=>p.c?g36ClauseName(p.c):g36Span(T,p.rg).replace(/[,;:.!?"”']+$/,''),out=[];let subj0='';
 sk.main.forEach((g,gi)=>{
  const v=g.parts.find(p=>/谓语/.test(p.r)),sj=g.parts.find(p=>/^(主语|形式主语|主语＋谓语|谓语＋主语|形式主语＋谓语)$/.test(p.r));
  if(gi===0){
   if(v)out.push(`先找带时态的动词：<b>${esc(txt(v))}</b>。它不在任何从句里，也不是 doing／done／to do 这种不带时态的形式，所以是主句谓语。`);
   if(sj&&!sj.c&&sj.rg){const end=sj.rg[sj.rg.length-1][1];const ofm=sk.mods.find(m=>m.rg[0][0]===end+1&&/^(of|in|on|for|with|from|about|at|by|to|across|among|between)\b/i.test(m.t));var g36OfLine=ofm?(`<b>${esc(txt(sj))} ${esc(ofm.t.split(' ')[0])} …</b> 这种“A ${esc(ofm.t.split(' ')[0])} B”结构：主语是前面的 A（<b>${esc(txt(sj))}</b>）。<b>${esc(ofm.t)}</b> 是介词短语，介词后面的名词是介词的宾语，永远不能当主语，它只是修饰 A。所以谓语的单复数也跟 A 走。`+(/^of\b/i.test(ofm.t)?'（例外：a number of／a lot of／a group of 这类表示“数量”的说法，A 只是量词，真正的中心是 B，例如 A number of students <b>are</b>…'+(/number/i.test(txt(sj))?'；本句是 the number of＝“……的数量”，中心仍是 number':'')+'。）':'')):'';}
   if(sj&&!sj.c){subj0=txt(sj);out.push(/形式/.test(sj.r)?`谓语前的 <b>${esc(txt(sj))}</b> 只是形式主语（占位），真正要说的内容在后面。`:`谓语前面真正发出动作的是 <b>${esc(txt(sj))}</b>，它就是主语${sj.rg&&sj.rg[0][0]>0?'；它前面的词是修饰，先跳过':''}。`);if(typeof g36OfLine!=='undefined'&&g36OfLine){out.push(g36OfLine);g36OfLine='';}}
   else if(sj&&sj.c)out.push(`谓语前面没有名词当主语，是一整个句子 → 主语是${g36ClauseName(sj.c)}。`);
  }else{
   const c=g.conn?`<b>${esc(g.conn)}</b> 后面`:'后面';
   if(sj)out.push(`${c}又出现主语 <b>${esc(txt(sj))}</b> 和带时态的谓语 <b>${esc(v?txt(v):'')}</b> → 这是另一个并列的句子。`);
   else if(v)out.push(`${c}又出现带时态的动词 <b>${esc(txt(v))}</b>，但前面没有新主语 → 和前面共用主语${subj0?' '+esc(subj0):''}，是并列谓语。`);
  }
  for(const p of g.parts){if(p===v||p===sj||/谓语/.test(p.r))continue;
   if(p.c)out.push(`${esc(v?txt(v):'谓语')} 后面还缺${esc(p.r)}，而后面跟的是一个完整句子（有自己的主语和谓语）→ ${esc(p.r)}是一整个${g36ClauseName(p.c)}，下面单独拆。`);
   else if(/真正主语/.test(p.r))out.push(`真正的主语是 <b>${esc(txt(p))}</b>。`);
   else if(/状语/.test(p.r))continue;
   else out.push(`${esc(v?txt(v):'')} 后面的 <b>${esc(txt(p))}</b> 是${esc(p.r)}。`);
  }
 });
 // 像动词、但不带时态的部分：明确说它为什么不是谓语
 let k=0;for(const m of sk.mods){if(k>=3)break;const kind=/现在分词/.test(m.role)?'-ing 分词':/过去分词/.test(m.role)?'过去分词（done）':/不定式/.test(m.role)?'不定式（to do）':/动名词/.test(m.role)?'动名词（doing）':null;if(!kind)continue;
  const w=(m.t.match(/\b(to\s+)?[A-Za-z-]+(ing|ed|en)\b|\bto\s+[a-z]+/)||[m.t.split(' ')[0]])[0];k++;
  out.push(`<b>${esc(w)}</b> 看着像动词，但它是${kind}，前面没有 be／have 之类的助动词，本身不带时态 → 不能当谓语，这里作${esc(m.role.replace(/^(现在分词|过去分词|不定式|动名词)作?/,'')||'修饰')}，挂在 ${esc(m.to)} 上。`);}
 return out.length?`<div class="g36-how"><div class="g36-sub" style="margin:10px 0 4px">怎么找到这个主干</div><ol>${out.map(x=>`<li>${x}</li>`).join('')}</ol></div>`:'';
}
function g36Fallback(raw,pre,cn,opts){
 const T=raw.split(' ');
 if(!pre)return `<section class="g36"><div class="miss">这句还没有人工拆解。</div>${opts.noCn?'':g36Cn(cn)}</section>`;
 const core=typeof grammar23Core==='function'?grammar23Core(pre,raw):new Set();
 const sent=T.map((t,i)=>`<span class="g36-t ${core.has(i)?'m':''}" data-i="${i}">${esc(t)}</span>`).join(' ');
 let no=0;const sec=[];
  sec.push(`<li><h5>${G36_NO[no++]} 主句怎样成立</h5><div class="fb" style="font-family:'Source Serif 4',Georgia,serif;color:var(--ink)">${esc(pre.trunk||'')}</div>${pre.why?`<div class="fb" style="margin-top:6px">${esc(pre.why)}</div>`:''}</li>`);
 if((pre.mods||[]).length)sec.push(`<li><h5>${G36_NO[no++]} 从句、短语与句内关系</h5>${pre.mods.map(m=>{const h=modRanges(raw,m);const rg=s=>{const a=[...s].sort((x,y)=>x-y);const out=[];for(const i of a){const l=out[out.length-1];if(l&&l[1]===i-1)l[1]=i;else out.push([i,i]);}return g36RgStr(out);};return `<button type="button" class="g36-mod" data-hl="${rg(h.mod)}" data-tg="${rg(h.to)}"><div class="mt">${esc(m.t)}</div><div class="ar">→ <b>${esc(m.to)}</b><span class="rl">${esc(m.role)}</span></div><div class="cn">${esc(m.cn)}</div></button>`;}).join('')}</li>`);
 return `<section class="g36"><div class="pa-head"><span class="pa-type">${esc(pre.type||'句子结构')}</span></div><div class="g36-old">这句还是旧版拆解（未按“主句骨架→从句→修饰”重排）。</div><div class="g36-sent">${sent}</div><ol class="g36-flow">${sec.join('')}${g36Tail(null,pre,cn,no)}</ol>${opts.noCn?'':g36Cn(cn)}</section>`;
}
// 点任意一条 → 原句标黄 / 蓝线（事件委托，所有页面通用）
document.addEventListener('click',e=>{
 const b=e.target.closest('.g36 [data-hl]');if(!b)return;
 e.stopPropagation();
 const root=b.closest('.g36'),on=!b.classList.contains('on');
 root.querySelectorAll('[data-hl].on').forEach(x=>x.classList.remove('on'));
 root.querySelectorAll('.g36-t.hl,.g36-t.tg').forEach(x=>x.classList.remove('hl','tg'));
 if(!on)return;b.classList.add('on');
 const each=(s,f)=>(s||'').split(',').filter(Boolean).forEach(r=>{const [a,z]=r.split('-').map(Number);for(let i=a;i<=z;i++)f(i);});
 const hl=new Set();each(b.dataset.hl,i=>hl.add(i));
 each(b.dataset.hl,i=>root.querySelector(`.g36-t[data-i="${i}"]`)?.classList.add('hl'));
 each(b.dataset.tg,i=>{if(!hl.has(i))root.querySelector(`.g36-t[data-i="${i}"]`)?.classList.add('tg');});
 const first=root.querySelector('.g36-t.hl');const sentBox=root.querySelector('.g36-sent');
 if(first&&sentBox){const r=sentBox.getBoundingClientRect();if(r.bottom<0||r.top<0)g36ScrollInPane(sentBox);}
},true);

// ---- 接到各个拆解入口 ----
sideParse=function(t){
 if(!sidePick||sidePick.type!=='sent')return '<div class="side-hint">点左侧句首数字，按“主句骨架 → 从句 → 修饰”的顺序看这一句。</div>';
 const[p,s]=sidePick.k.split(':').map(Number),raw=sentText(t.id,p,s),pre=parseOf(t.id,p,s),marked=readMarks&&readMarks.sents.has(sidePick.k);
 return `<h4>P${p+1} 第 ${s+1} 句</h4>`+g36Body(t.id,sidePick.k,raw,pre,pre?.cn||trOf(t.id,p,s))+`<div class="pa-acts"><button class="btn ${marked?'':'primary'}" id="pa-mark">${marked?'已存进长难句 · 取消':'存进长难句'}</button></div>`;
};
trParseBody=function(s,marked=false,withSave=true){return `<div class="tr-parse" data-parse-key="${s.key}">`+g36Body(spReadId(),s.key,s.text,s,s.cn)+(withSave?`<div class="pa-acts"><button class="btn ${marked?'':'primary'}" id="tr-save-sent">${marked?'已存进长难句 · 取消':'存进长难句'}</button></div>`:'')+'</div>';};
spStudySide=function(data){
 if(!spStudyPick)return '<h3>逐句拆解</h3><div class="side-hint">点左侧句首数字，按“主句骨架 → 从句 → 修饰”的顺序看这一句。</div>';
 const tid=spReadId(),pre=parseOf(tid,...spStudyPick.key.split(':').map(Number)),marked=!!spReadNote().sentences[spStudyPick.key];
 return g36Body(tid,spStudyPick.key,spStudyPick.sent,pre,pre?.cn||spStudyPick.cn)+`<button class="btn ${marked?'':'primary'}" id="sp-mark-sent" style="margin-top:12px">${marked?'已存进长难句 · 取消':'存进长难句'}</button>`;
};
// 答案定位只滚动原文那一栏，不再把整页拉到底
highlightLocate=function(n){
 const pEl=document.getElementById('r-passage');if(!pEl)return;
 pEl.querySelectorAll('.s.lit').forEach(s=>s.classList.remove('lit'));let first=null;
 locateOf(curText.id,n).forEach(([p,s])=>{const el=pEl.querySelector(`.s[data-k="${p}:${s}"]`);if(el){el.classList.add('lit');first=first||el;}});
 if(first)g36ScrollInPane(first);
};

// ===== v36：长难句 Tab —— 在工作台里直接做，不再盖住顶部 =====
let ls36={i:0,step:'chunk',sel:null,anchor:null,unit:null,year:'',q:''},ls36FocusKey=null;
function ls36Rows(){return allSents().filter(r=>byId[r.tid]||String(r.tid).startsWith('special-')).map(r=>({...r,key:r.tid+'|'+r.p+':'+r.s,k:r.p+':'+r.s,raw:sentText(r.tid,r.p,r.s)||r.text}));}
function ls36Store(){prefs.sent36=prefs.sent36||{states:{},updatedAt:''};prefs.sent36.states=prefs.sent36.states||{};return prefs.sent36;}
function ls36State(key){const st=ls36Store().states;return st[key]||(st[key]={chunks:{},roles:[],chunkChecked:false,roleChecked:false,updatedAt:''});}
function ls36Save(key){const s=ls36State(key);s.updatedAt=new Date().toISOString();ls36Store().updatedAt=s.updatedAt;touch();}
function ls36Status(key){const s=ls36Store().states[key];if(!s)return 0;if(s.roleChecked||(s.chunkChecked&&s.skipRole))return 2;if(s.chunkChecked||Object.keys(s.chunks||{}).length)return 1;return 0;}
const LS36_KINDS=['宾语从句','定语从句','状语从句','主语从句','表语从句','同位语从句'];
function ls36KindOf(kind){for(const k of LS36_KINDS){if(kind.includes(k.replace('从句','')+'从句'))return k;}if(/状语|比较|让步|条件|原因|时间|目的|结果|方式/.test(kind))return '状语从句';if(/定语|关系/.test(kind))return '定语从句';return kind;}
function ls36KeyLabel(sk,ch){const b=ch.base;if(b==='主')return {cat:'主句',text:'主句'};if(b==='连')return {cat:'连接词',text:'并列连接词'};if(ch.lab.endsWith('修')||b==='修')return {cat:'修饰',text:ch.lab.startsWith('C')?'修饰（在'+g36ClauseName(ch.lab.match(/C\d+/)[0])+'里）':'修饰／插入'};const c=sk.clauses.find(x=>x.id===b);return {cat:'从句:'+ls36KindOf(c?.kind||''),text:g36ClauseName(b)+' · '+(c?.kind||'从句')};}
function ls36UserText(v){if(!v)return '';if(v.startsWith('从句:'))return v.slice(3);return v==='修饰'?'修饰／插入':v;}
function ls36Render(){

 const box=document.getElementById('sent-main');if(!box)return;
 try{document.documentElement.style.setProperty('--ls36-top',(document.querySelector('.top')?.offsetHeight||60)+'px');}catch(e){}
 const rows=ls36Rows();
 if(ls36FocusKey){const j=rows.findIndex(r=>r.key===ls36FocusKey);if(j>=0)ls36.i=j;ls36FocusKey=null;}
 else if(prefs.sent36?.current){const j=rows.findIndex(r=>r.key===prefs.sent36.current);if(j>=0&&ls36._init!==true)ls36.i=j;}
 ls36._init=true;
 const years=[...new Set(rows.map(r=>r.year))].sort();
 const vis=rows.map((r,i)=>({r,i})).filter(({r})=>(!ls36.year||r.year===ls36.year)&&(!ls36.done||(ls36.done==='todo'?ls36Status(r.key)<2:ls36Status(r.key)===2))&&(!ls36.q||(r.raw+' '+r.label).toLowerCase().includes(ls36.q.toLowerCase())));
 const nDone=rows.filter(r=>ls36Status(r.key)===2).length;
 if(!rows.length){box.innerHTML='<div class="ls36-empty">还没有收藏句子。精读时点句首编号 →「存进长难句」，句子会出现在这里。</div>';return;}
 if(ls36.i>=rows.length)ls36.i=0;
 const r=rows[ls36.i],sk=g36Sk(r.tid,r.k),st=ls36State(r.key);
 if(!sk&&ls36.step!=='explain')ls36.step='explain';
 const listHtml=vis.map(({r:x,i})=>`<button class="ls36-item${i===ls36.i?' on':''}" data-ls36-go="${i}"><span class="src"><i class="s${ls36Status(x.key)}"></i>${esc(x.label)} · P${x.p+1}-${x.s+1}<em class="st st${ls36Status(x.key)}">${['未做','做了一半','已完成'][ls36Status(x.key)]}</em>${g36Sk(x.tid,x.k)?'':' · <span style="font-weight:400;color:var(--ink-3)">仅讲解</span>'}</span><span class="en">${esc(x.raw)}</span></button>`).join('');
 const pick=`<div class="ls36-pick"><select id="ls36-pick" aria-label="选择句子">${vis.map(({r:x,i})=>`<option value="${i}" ${i===ls36.i?'selected':''}>${esc(x.label)} P${x.p+1}-${x.s+1} · ${esc(x.raw.slice(0,40))}</option>`).join('')}</select></div>`;
 const steps=[['chunk','① 顺读切块',st.chunkChecked],['role','② 标主干成分',st.roleChecked],['explain','③ 讲解']];
 box.innerHTML=`<div class="ls36"><aside class="ls36-list"><div class="ls36-filter"><select id="ls36-year"><option value="">全部年份</option>${years.map(y=>`<option ${y===ls36.year?'selected':''}>${y}</option>`).join('')}</select><input id="ls36-q" type="search" placeholder="搜索" value="${esc(ls36.q)}"></div><div class="ls36-done">${[['','全部 '+rows.length],['todo','没做完 '+(rows.length-nDone)],['done','已完成 '+nDone]].map(([v,t])=>`<button data-ls36-done="${v}" class="${(ls36.done||'')===v?'on':''}">${t}</button>`).join('')}</div>${pick}<div class="ls36-items">${listHtml||'<div class="ls36-empty">没有符合的句子</div>'}</div></aside>
 <section class="ls36-work" id="ls36-work"><div class="ls36-head"><span class="ttl">${esc(r.label)} · P${r.p+1} 第 ${r.s+1} 句</span><span class="nav"><button class="ls36-btn" id="ls36-prev" ${ls36.i?'':'disabled'}>←</button>${ls36.i+1} / ${rows.length}<button class="ls36-btn" id="ls36-next" ${ls36.i<rows.length-1?'':'disabled'}>→</button>${byId[r.tid]?'<button class="ls36-btn" id="ls36-src">回原文精读</button>':''}</span></div>
 <div class="ls36-steps" role="tablist">${steps.map(([k,t,ok])=>`<button data-ls36-step="${k}" class="${ls36.step===k?'on':''}" ${!sk&&k!=='explain'?'disabled':''}>${t}${ok?'<span class="ck">✓</span>':''}</button>`).join('')}</div>
 <div id="ls36-body">${ls36.step==='chunk'?ls36ChunkHTML(r,sk,st):ls36.step==='role'?ls36RoleHTML(r,sk,st):ls36ExplainHTML(r,sk)}</div></section></div>`;
 ls36Bind(r,sk,st,rows);
}
function ls36ExplainHTML(r,sk){
 const pre=parseOf(r.tid,r.p,r.s);
 return g36Body(r.tid,r.k,r.raw,pre,pre?.cn||trOf(r.tid,r.p,r.s))+`<div class="ls36-actions"><button class="ls36-btn" id="ls36-unsave">从长难句移除</button>${sk?'<button class="ls36-btn" id="ls36-redo">重新自己拆一遍</button>':''}</div>`;
}
function ls36ChunkHTML(r,sk,st){
 const T=r.raw.split(' ');const sel=ls36.sel;
 const chunks=sk.chunks.map((ch,i)=>{const u=st.chunks[i];const key=ls36KeyLabel(sk,ch);const cat=u?(u==='主句'?'l-main':u.startsWith('从句')?'l-clause':u==='连接词'?'l-conn':'l-mod'):'';let res='';if(st.chunkChecked){const ok=u===key.cat||(u&&key.cat.startsWith('从句:')&&u==='从句:'+key.cat.slice(3));res=ok?' ok':' bad';}
  return `<button class="ls36-chunk ${cat}${sel===i?' sel':''}${res}" data-ls36-chunk="${i}"><span>${esc(T.slice(ch.a,ch.b+1).join(' '))}</span><span class="lb">${u?esc(ls36UserText(u)):'点一下，判断这块'}</span>${st.chunkChecked?`<span class="key">${res===' ok'?'✓ ':'答案：'}${esc(key.text)}</span>`:''}</button>`;}).join('');
 const cur=sel!=null?st.chunks[sel]:null;
 const pal=sel!=null&&!st.chunkChecked?`<div class="ls36-pal"><div class="cap">这块「${esc(T.slice(sk.chunks[sel].a,sk.chunks[sel].b+1).join(' '))}」是：</div><div class="row">${['主句','从句','修饰','连接词'].map(v=>`<button data-ls36-lab="${v}" class="${cur===v||(v==='从句'&&cur?.startsWith('从句'))?'on':''}">${{主句:'主句',从句:'从句',修饰:'修饰／插入',连接词:'并列连接词'}[v]}</button>`).join('')}</div>${cur?.startsWith('从句')?`<div class="row">${LS36_KINDS.map(k=>`<button data-ls36-kind="${k}" class="${cur==='从句:'+k?'on':''}">${k}</button>`).join('')}</div>`:''}</div>`:'';
 let fb='';
 if(st.chunkChecked){const wrong=sk.chunks.map((ch,i)=>({ch,i,u:st.chunks[i],key:ls36KeyLabel(sk,ch)})).filter(x=>!(x.u===x.key.cat));
  fb=`<div class="ls36-fb"><b>${sk.chunks.length-wrong.length} / ${sk.chunks.length} 块判断对了。</b>${wrong.length?'判错的已展开；判对的也可以点开看依据。':'每块都可以点开看判断依据。'}<div class="ls40-list">${sk.chunks.map((ch,i)=>ls40Chunk(sk,T,ch,st.chunks[i])).join('')}</div></div>`;}
 const all=sk.chunks.every((_,i)=>st.chunks[i]);
 return `<p class="ls36-tip">从左往右顺着读。每读到一块，先判断它是<b>主句</b>、<b>从句</b>（是哪种从句），还是<b>修饰／插入</b>。主句可能被从句隔开成好几块。</p><div class="ls36-chunks">${chunks}</div>${pal}${fb}<div class="ls36-actions">${st.chunkChecked?'<button class="ls36-btn" id="ls36-chunk-reset">重新判断</button><button class="ls36-btn" id="ls36-skip-role">跳过标成分，看讲解</button><button class="ls36-btn primary" data-ls36-step="role">下一步：标主干成分 →</button>':`<button class="ls36-btn" data-ls36-step="explain">直接看讲解</button><button class="ls36-btn primary" id="ls36-chunk-check" ${all?'':'disabled'}>核对切块</button>`}</div>`;
}
function ls36Units(sk){
 const units=[];sk.main.forEach((g,gi)=>units.push({id:'M'+gi,title:sk.main.length>1?`主句 ${gi+1}`:'主句',parts:g.parts.filter(p=>p.rg),refs:g.parts.filter(p=>p.c),own:sk.chunks.filter(c=>c.base==='主'),nested:false}));
 for(const c of sk.clauses)units.push({id:c.id,title:`${g36ClauseName(c.id)} · ${c.kind}`,parts:c.parts.filter(p=>!p.c).concat(c.connRg&&!c.parts.some(p=>p.rg&&g36RgStr(p.rg)===g36RgStr(c.connRg))?[{r:'连接词',t:c.conn,rg:c.connRg}]:[]),refs:c.parts.filter(p=>p.c),own:sk.chunks.filter(ch=>ch.lab===c.id),nested:!!c.parent});
 return units;
}
const LS36_ROLES=['主语','谓语','宾语','表语','连接词','宾补'];
function ls36RoleHTML(r,sk,st){
 const T=r.raw.split(' '),units=ls36Units(sk);
 const markAt=(u,i)=>st.roles.find(m=>m.u===u&&i>=m.a&&i<=m.b);
 const html=units.map(u=>{const idx=[];for(const ch of u.own)for(let i=ch.a;i<=ch.b;i++)idx.push(i);
  ls36._sk=sk;ls36._T=T;const grade=st.roleChecked?ls36Grade(u,st):null;
  const words=idx.map(i=>{const m=markAt(u.id,i);const s=ls36.unit===u.id&&ls36.sel&&i>=ls36.sel[0]&&i<=ls36.sel[1];let g='';if(grade&&m)g=grade.okMarks.has(m)?' ok':' bad';return `<button class="ls36-w${m?' mk':''}${s?' sel':''}${g}" data-ls36-w="${i}" data-ls36-u="${u.id}" ${m&&i===m.a?`data-r="${esc(m.r)}"`:''}>${esc(T[i])}</button>`;}).join(' ');
  const pal=ls36.unit===u.id&&ls36.sel&&!st.roleChecked?`<div class="ls36-pal"><div class="cap">「${esc(T.slice(ls36.sel[0],ls36.sel[1]+1).join(' '))}」是：</div><div class="row">${LS36_ROLES.filter(x=>u.id[0]==='C'||x!=='连接词').map(x=>`<button data-ls36-role="${x}">${x}</button>`).join('')}<button data-ls36-role="">清除</button></div></div>`:'';
  const refs=u.refs.length?`<div class="g36-sub" style="margin-top:4px">提示：${u.refs.map(p=>`${p.r}是整个${g36ClauseName(p.c)}`).join('；')}，不用在这里标。</div>`:'';
  const ucl=u.id[0]==='C'?sk.clauses.find(x=>x.id===u.id):null,urule=ucl?LS40_RULE[ls36KindOf(ucl.kind)]:LS40_RULE['主句'];const fb=grade?`<div class="ls36-fb"><div class="ls40-list">${grade.lines.join('')}</div>${urule?`<p class="ls40-next"><span class="lb">下次怎么认${ucl?'这类从句':'主句'}</span>${esc(urule)}</p>`:''}</div>`:'';
  return `<div class="ls36-unit${u.nested?' nested':''}"><div class="uh">${esc(u.title)}</div><div class="ls36-words">${words}</div>${refs}${pal}${fb}</div>`;}).join('');
 return `<p class="ls36-tip">在每个主句、从句里找骨架：点第一个词、再点最后一个词选中一段，然后标成分。从句记得把<b>连接词</b>也标出来（它若在从句里当主语／宾语，就标那个成分）。</p>${html}<div class="ls36-actions">${st.roleChecked?'<button class="ls36-btn" id="ls36-role-reset">重新标</button><button class="ls36-btn primary" data-ls36-step="explain">看完整讲解 →</button>':'<button class="ls36-btn" data-ls36-step="explain">直接看讲解</button><button class="ls36-btn primary" id="ls36-role-check">核对成分</button>'}</div>`;
}
function ls36Accept(r){if(/^(形式主语)$/.test(r))return ['主语'];if(/真正主语|真正宾语|状语/.test(r))return null;if(/补足语|宾补/.test(r))return ['宾补'];if(/宾语/.test(r))return ['宾语'];if(r==='助动词')return ['谓语'];if(r.includes('＋'))return r.split('＋').map(x=>x.replace('形式',''));return LS36_ROLES.includes(r)?[r]:null;}
function ls36Grade(u,st){
 const marks=st.roles.filter(m=>m.u===u.id),okMarks=new Set(),lines=[];
 for(const p of u.parts){const acc=ls36Accept(p.r);if(!acc){continue;}const hits=marks.filter(m=>acc.includes(m.r)&&p.rg.some(r=>m.a<=r[1]&&m.b>=r[0]));const hit=hits[0];
  const why=ls40PartWhy(u,p,ls36._sk,ls36._T);const wrongRole=!hit&&marks.find(m=>p.rg.some(r=>m.a<=r[1]&&m.b>=r[0]));
  if(hit){hits.forEach(h=>okMarks.add(h));lines.push(`<details class="ls40-item ok"><summary><span class="mk">✓</span>${esc(p.r)}：<b>${esc(p.t)}</b></summary>${why?`<p><span class="lb">为什么</span>${esc(why)}</p>`:''}</details>`);}
  else lines.push(`<details class="ls40-item ${marks.length?'bad':'todo'}" open><summary><span class="mk">${marks.length?'✗':'○'}</span>${esc(p.r)}：${wrongRole?`你标成了「${esc(wrongRole.r)}」，`:marks.length?'没标出来，':'还没标，'}应是 <b>${esc(p.t)}</b></summary>${why?`<p><span class="lb">为什么</span>${esc(why)}</p>`:''}</details>`);}
 for(const m of marks)if(!okMarks.has(m)){const p=u.parts.find(p=>p.rg.some(r=>m.a<=r[1]&&m.b>=r[0]));if(!p){const T=ls36._T,mt=T?T.slice(m.a,m.b+1).join(' '):'';lines.push(`<details class="ls40-item bad" open><summary><span class="mk">✗</span>你把「${esc(mt)}」标成了「${esc(m.r)}」</summary><p><span class="lb">为什么不算</span>这几个词不在骨架里，是修饰成分（形容词、副词、介词短语或分词），骨架只标中心词：主语找“谁”，谓语找带时态的动词，宾语找动作的对象。</p></details>`);}}
 return {okMarks,lines};
}

// ===== v40：自己拆之后，对错之外给讲解 + 下次怎么认 =====
const LS40_RULE={
 '主句':'不被任何连接词管着、自己带时态的谓语、能独立成句的那一块是主句；主句可能被从句或插入语隔成几段，顺着读要把它们接起来。',
 '连接词':'and／but／or／so 连接两个地位相同的句子或谓语，是并列，不属于任何从句；看到它就要准备再找一套主谓。',
 '修饰':'这块里没有带时态的谓语——只有 to do、doing、done 或“介词＋名词”，所以不是从句，是修饰／插入；被两个逗号夹住的插入语顺读时先跳过。',
 '宾语从句':'动词（say／think／find／claim／believe／show／suggest…）或介词后面缺“内容”，紧接着出现一个完整句子 → 宾语从句。that 常被省略：动词后面直接跟“主语＋带时态谓语”，就是省略了 that。',
 '定语从句':'前面紧挨一个名词，连接词（that／which／who／where…）在从句里自己当成分，后面会“缺一块”（多半缺主语或宾语）→ 定语从句，修饰前面那个名词。',
 '状语从句':'前面的主句已经完整、不缺成分，这块用 if／when／while／as／because／although／as long as／so that 等开头，补充条件、时间、原因、让步 → 状语从句，挂在主句的动作上。',
 '主语从句':'句首就是 That／What／Whether／How 开头的一整块，读到它结束才出现谓语；或者 It is … that … 里 it 只是占位 → 主语从句。',
 '表语从句':'be／seem／look 这类系动词后面缺表语，接一个 that／whether／why／as if 开头的完整句子 → 表语从句。',
 '同位语从句':'前面是 fact／idea／news／indication／evidence 这类抽象名词，that 后面是完整句子、that 自己不当成分 → 同位语从句，解释这个名词的内容。'};
function ls40CatName(cat){return cat.startsWith('从句:')?cat.slice(3):cat;}
function ls40Contrast(user,key){
 const u=ls40CatName(user||''),k=ls40CatName(key);const pair=[u,k].sort().join('|');
 if(!user)return '这块你还没判断。';
 if(k==='主句'&&user.startsWith('从句'))return '这块前面没有引导它的连接词（也没有被前面的动词“管着”），而且它就是整句真正发出动作的骨架，所以是主句。';
 if(u==='主句'&&key.startsWith('从句'))return '这块虽然有自己的主语和谓语，但前面有连接词（或省略了 that），它是被前面的词“管着”的内容，不能单独成句，所以是从句。';
 if(k==='修饰'&&user.startsWith('从句'))return '这块里找不到带时态的谓语（只有 to do／doing／done 或介词短语），没有“主语＋谓语”，所以不是从句。';
 if(u==='修饰'&&key.startsWith('从句'))return '这块里有自己的主语和带时态的谓语，是一个完整的小句，所以是从句，不是短语修饰。';
 if(pair==='定语从句|宾语从句')return '两者区别看连接词前面：前面是缺宾语的动词 → 宾语从句；前面是名词，且连接词在从句里当主语／宾语（后面缺一块）→ 定语从句。';
 if(pair==='宾语从句|状语从句')return '宾语从句是前面动词“缺”的内容，去掉它前面的句子就不完整；状语从句前面的句子已经完整，它只补充条件／时间／原因。';
 if(pair==='同位语从句|定语从句')return '都跟在名词后面：that 在从句里当成分（后面缺一块）→ 定语从句；从句本身完整、that 不当成分 → 同位语从句。';
 if(pair==='定语从句|状语从句')return '定语从句贴着一个名词、修饰这个名词；状语从句修饰的是整个动作或事件，常用 if／when／as long as／because 开头。';
 if(k==='连接词'||u==='连接词')return '并列连接词（and／but／or）只是把两个地位相同的部分连起来，本身不是主句也不是从句。';
 return '';
}
function ls40Chunk(sk,T,ch,user){
 const key=ls36KeyLabel(sk,ch),ok=user===key.cat,c=sk.clauses.find(y=>y.id===ch.base),txt=T.slice(ch.a,ch.b+1).join(' ');
 const kind=key.cat.startsWith('从句:')?key.cat.slice(3):key.cat;const rule=LS40_RULE[kind]||'';
 const mod=key.cat==='修饰'?sk.mods.find(m=>m.rg.some(r=>r[0]<=ch.b&&r[1]>=ch.a)):null;
 const why=c?.judge||(mod?`${mod.t} → 挂在 ${mod.to} 上（${mod.role}）：${mod.cn}`:key.cat==='主句'?'这一段带着主句的主语或谓语。':'');
 return `<details class="ls40-item ${ok?'ok':'bad'}"${ok?'':' open'}><summary><span class="mk">${ok?'✓':'✗'}</span>「${esc(txt)}」<span class="ans">${ok?'':`你标：${esc(ls36UserText(user)||'未判断')} → `}<b>${esc(key.text)}</b></span></summary>${why?`<p><span class="lb">为什么</span>${esc(why)}</p>`:''}${ok?'':(ls40Contrast(user,key.cat)?`<p><span class="lb">你为什么会判错</span>${esc(ls40Contrast(user,key.cat))}</p>`:'')}${rule?`<p><span class="lb">下次怎么认</span>${esc(rule)}</p>`:''}</details>`;
}
function ls40PartWhy(u,p,sk,T){
 const v=u.parts.find(x=>/谓语/.test(x.r)),vt=v?v.t:'谓语';const c=u.id[0]==='C'?sk.clauses.find(x=>x.id===u.id):null;
 if(p.r==='连接词')return c?.judge||'';
 if(/主语/.test(p.r)){if(c&&/^(that|which|who|whom|whose)$/i.test(p.t.trim()))return `${p.t} 是关系词，在定语从句里代替前面那个名词，充当 ${vt} 的主语——所以这里“缺主语”，说明它是定语从句。`;if(/形式/.test(p.r))return `${p.t} 只是占位的形式主语，真正的内容在后面。`;return `谁在“${vt}”？是 ${p.t}。主语是谓语动作的发出者，找到谓语后往前找名词／代词；前面的介词短语、插入语不算。`;}
 if(/谓语/.test(p.r))return `${p.t} 带时态（情态动词／助动词／be 加上后面的动词算一个整体谓语${/,| or | and /.test(p.t)?'；or／and 连着的几个动词共用同一个主语，一起算谓语':''}）。不带时态的 doing／done／to do 不是谓语。`;
 if(/宾语/.test(p.r))return `“${vt}”这个动作落在谁身上？是 ${p.t}，所以它是宾语。只标中心词组，后面的修饰不用带进来。`;
 if(/表语/.test(p.r))return `${vt} 是系动词（be／become／seem…），后面说明主语身份或状态的 ${p.t} 是表语。`;
 if(/补/.test(p.r))return `${p.t} 补充说明宾语的状态或要做的事，是宾语补足语。`;
 return '';
}

function ls36Bind(r,sk,st,rows){
 const box=document.getElementById('sent-main'),$q=s=>box.querySelector(s),go=i=>{ls36.i=i;ls36.sel=null;ls36.unit=null;ls36.anchor=null;const k=rows[i].key,s2=ls36Store().states[k];ls36.step=s2?.roleChecked?'explain':s2?.chunkChecked?'role':'chunk';ls36Store().current=k;ls36Render();document.getElementById('ls36-work')?.scrollIntoView({block:'start'});window.scrollTo(0,0);};
 box.querySelectorAll('[data-ls36-go]').forEach(b=>b.onclick=()=>go(+b.dataset.ls36Go));
 $q('#ls36-pick')?.addEventListener('change',e=>go(+e.target.value));
 $q('#ls36-year').onchange=e=>{ls36.year=e.target.value;ls36Render();};
 box.querySelectorAll('[data-ls36-done]').forEach(b=>b.onclick=()=>{ls36.done=b.dataset.ls36Done;ls36Render();});
 $q('#ls36-next-todo')?.addEventListener('click',()=>{const j=rows.findIndex((x,k)=>k>ls36.i&&ls36Status(x.key)<2);const k=j>=0?j:rows.findIndex(x=>ls36Status(x.key)<2);if(k>=0)go(k);else toast('全部做完了');});
 $q('#ls36-q').oninput=e=>{ls36.q=e.target.value;clearTimeout(ls36._qt);ls36._qt=setTimeout(()=>{ls36Render();const q=document.getElementById('ls36-q');q.focus();q.setSelectionRange(q.value.length,q.value.length);},250);};
 $q('#ls36-prev')?.addEventListener('click',()=>go(ls36.i-1));$q('#ls36-next')?.addEventListener('click',()=>go(ls36.i+1));
 $q('#ls36-src')?.addEventListener('click',()=>{ls40ShowBack(r);openExam(r.tid,'read');setTimeout(()=>{pickSentence(r.k);const el=document.querySelector(`#r-passage .s[data-k="${r.k}"]`);g36ScrollInPane(el);},120);});
 box.querySelectorAll('[data-ls36-step]').forEach(b=>b.onclick=()=>{ls36.step=b.dataset.ls36Step;ls36.sel=null;ls36.unit=null;ls36.anchor=null;ls36Render();});
 box.querySelectorAll('[data-ls36-chunk]').forEach(b=>b.onclick=()=>{if(st.chunkChecked)return;const i=+b.dataset.ls36Chunk;ls36.sel=ls36.sel===i?null:i;ls36Render();});
 box.querySelectorAll('[data-ls36-lab]').forEach(b=>b.onclick=()=>{const v=b.dataset.ls36Lab;if(v==='从句'){st.chunks[ls36.sel]=st.chunks[ls36.sel]?.startsWith('从句')?st.chunks[ls36.sel]:'从句';ls36Save(r.key);ls36Render();return;}st.chunks[ls36.sel]=v;ls36Save(r.key);ls36.sel=ls36.sel+1<sk.chunks.length?ls36.sel+1:null;ls36Render();});
 box.querySelectorAll('[data-ls36-kind]').forEach(b=>b.onclick=()=>{st.chunks[ls36.sel]='从句:'+b.dataset.ls36Kind;ls36Save(r.key);ls36.sel=ls36.sel+1<sk.chunks.length?ls36.sel+1:null;ls36Render();});
 $q('#ls36-chunk-check')?.addEventListener('click',()=>{const und=Object.entries(st.chunks).find(([,v])=>v==='从句');if(und){ls36.sel=+und[0];ls36Render();toast('这一块标了“从句”，再选一下是哪种从句');return;}st.chunkChecked=true;ls36.sel=null;ls36Save(r.key);ls36Render();});
 $q('#ls36-chunk-reset')?.addEventListener('click',()=>{st.chunks={};st.chunkChecked=false;ls36Save(r.key);ls36Render();});
 box.querySelectorAll('[data-ls36-w]').forEach(b=>b.onclick=()=>{if(st.roleChecked)return;const i=+b.dataset.ls36W,u=b.dataset.ls36U;
  const m=st.roles.find(x=>x.u===u&&i>=x.a&&i<=x.b);
  if(m&&ls36.anchor==null){ls36.unit=u;ls36.sel=[m.a,m.b];ls36Render();return;}
  if(ls36.unit!==u||ls36.anchor==null){ls36.unit=u;ls36.anchor=i;ls36.sel=[i,i];}else{ls36.sel=[Math.min(ls36.anchor,i),Math.max(ls36.anchor,i)];ls36.anchor=null;}
  ls36Render();});
 box.querySelectorAll('[data-ls36-role]').forEach(b=>b.onclick=()=>{const[a,z]=ls36.sel,u=ls36.unit,role=b.dataset.ls36Role;st.roles=st.roles.filter(x=>!(x.u===u&&x.a<=z&&x.b>=a));if(role)st.roles.push({u,a,b:z,r:role});ls36.sel=null;ls36.anchor=null;ls36Save(r.key);ls36Render();});
 $q('#ls36-skip-role')?.addEventListener('click',()=>{st.skipRole=true;ls36Save(r.key);ls36.step='explain';ls36Render();});
 $q('#ls36-role-check')?.addEventListener('click',()=>{st.roleChecked=true;ls36.sel=null;ls36Save(r.key);ls36Render();});
 $q('#ls36-role-reset')?.addEventListener('click',()=>{st.roles=[];st.roleChecked=false;ls36Save(r.key);ls36Render();});
 $q('#ls36-redo')?.addEventListener('click',()=>{st.chunks={};st.roles=[];st.chunkChecked=false;st.roleChecked=false;ls36Save(r.key);ls36.step='chunk';ls36Render();});
 $q('#ls36-unsave')?.addEventListener('click',()=>{if(!confirm('从长难句里移除这一句？'))return;Object.values(attempts).forEach(a=>{if(a.textId===r.tid)a.sentences=a.sentences.filter(x=>!(x.p===r.p&&x.s===r.s));});const n=notes[r.tid];if(n)n.sentences=n.sentences.filter(x=>!(x.p===r.p&&x.s===r.s));touch();ls36Render();toast('已从长难句移除');});
}
renderSent=function(){ls36Render();};
startDrill=function(tid,p,s){ls36FocusKey=tid+'|'+p+':'+s;ls36.step='chunk';show('sent');};
startSentBatch=function(){show('sent');};
const ls36PriorShow=show;
show=function(v){ls36PriorShow(v);document.body.classList.remove('sr27-active');if(v==='sent')ls36Render();};
const ls36PriorPrefs=mergePrefs;
function ls36Merge(a,b){if(!a)return b;if(!b)return a;const states={...(b.states||{})};for(const[k,s]of Object.entries(a.states||{}))if(!states[k]||(s.updatedAt||'')>=(states[k].updatedAt||''))states[k]=s;const meta=(a.updatedAt||'')>=(b.updatedAt||'')?a:b;return {...meta,states};}
mergePrefs=function(remote){const local=prefs.sent36;ls36PriorPrefs(remote);const m=ls36Merge(local,remote?.sent36);if(m)prefs.sent36=m;};
const ls36PriorRemote=sync19MergeRemote;
sync19MergeRemote=function(remote){const local=prefs.sent36?JSON.parse(JSON.stringify(prefs.sent36)):null;ls36PriorRemote(remote);const m=ls36Merge(local,remote?.prefs?.sent36);if(m){prefs.sent36=m;persist();}if(!document.getElementById('view-sent').classList.contains('hide'))ls36Render();};
if(!document.getElementById('view-sent').classList.contains('hide'))ls36Render();

// ===== v37：精读点词发音改用有道真人发音（iPad 本机合成常常无声），失败再回退本机 =====
let g37Audio=null;
speak=function(txt){
 if(!txt)return;txt=String(txt).trim();
 try{if(g37Audio){g37Audio.pause();g37Audio=null;}window.speechSynthesis?.cancel();}catch(e){}
 const local=()=>{try{if(!window.speechSynthesis)return;const u=new SpeechSynthesisUtterance(txt);u.lang='en-US';u.rate=.9;const v=enVoice();if(v)u.voice=v;speechSynthesis.resume();speechSynthesis.speak(u);}catch(e){}};
 try{
  const a=new Audio('https://dict.youdao.com/dictvoice?type=2&audio='+encodeURIComponent(txt));g37Audio=a;let done=false;
  const fb=()=>{if(done)return;done=true;if(g37Audio===a)g37Audio=null;local();};
  a.onerror=fb;const p=a.play();if(p&&p.catch)p.catch(fb);
 }catch(e){local();}
};
// ===== v37：拖选短语——按每个词的中间字符是否被选中来判断，2 个词也能存 =====
selectionWords=function(){
 const sel=window.getSelection();if(!sel||sel.isCollapsed||!sel.rangeCount||!curText||mode!=='read')return null;
 const r=sel.getRangeAt(0);
 const roots=[document.getElementById('r-passage'),document.getElementById('side-body')];
 let node=r.commonAncestorContainer;if(node.nodeType===3)node=node.parentElement;
 const root=roots.find(x=>x&&x.contains(node));if(!root)return null;
 const scope=node.closest('.s, .q')||(node.querySelector&&node.querySelector('.w')?node:root);
 const inRange=el=>{const w=document.createTreeWalker(el,NodeFilter.SHOW_TEXT);const ts=[];let t;while((t=w.nextNode()))ts.push(t);const total=ts.reduce((n,x)=>n+x.length,0);if(!total)return false;let mid=Math.floor((total-1)/2);for(const x of ts){if(mid<x.length){try{return r.isPointInRange(x,mid)||r.isPointInRange(x,mid+1>x.length?mid:mid+1);}catch(e){return r.intersectsNode(el);}}mid-=x.length;}return false;};
 const els=[...scope.querySelectorAll('.w')].filter(inRange);
 if(els.length<2)return null;
 const infos=els.map(tokInfo),loc=infos[0].loc,same=infos.every(x=>x.loc===loc),idx=infos.map(x=>x.i);
 return {loc,same,a:Math.min(...idx),b:Math.max(...idx),n:els.length,rect:r.getBoundingClientRect()};
};
try{phMode.on=false;}catch(e){}

// ===== v39：连接词表——用收藏句和已拆句的真例子，按连接词归类 =====
function ls36TailsRender(){
 const box=document.getElementById('sent-tails');if(!box)return;
 const saved=new Set(ls36Rows().map(r=>r.key));const groups={};
 const norm=c=>{c=String(c||'').trim();if(/省略/.test(c))return '（省略 that）';return c.replace(/[（(].*$/,'').trim().toLowerCase()||'—';};
 for(const [key,sk] of Object.entries(SKEL36)){const [tid,k]=key.split('|');const [p,si]=k.split(':').map(Number);const raw=sentText(tid,p,si)||'';const T=raw.split(' ');
  for(const c of sk.clauses){const g=norm(c.conn);(groups[g]=groups[g]||[]).push({key,tid,k,kind:c.kind,judge:c.judge,text:T.slice(c.a,c.b+1).join(' '),label:(byId[tid]?.label||tid)+' · P'+(p+1)+'-'+(si+1),saved:saved.has(key)});}}
 const order=Object.keys(groups).sort((a,b)=>groups[b].length-groups[a].length);
 const kinds=list=>[...new Set(list.map(x=>ls36KindOf(x.kind)))].join('／');
 box.innerHTML=`<div class="ls36-tails"><div class="ls36-rule"><b>判断从句的三步</b><ol><li>先找连接词前面：是名词？还是缺宾语／表语的动词或介词？还是一个完整句子？</li><li>再看连接词后面的句子缺不缺成分：缺主语／宾语 → 连接词在从句里当成分（多半是定语从句或 what 类名词从句）；不缺 → 连接词只起连接作用。</li><li>前面是名词 + 后面缺成分 → 定语从句；前面是名词 + 后面不缺 → 同位语从句；前面是动词／介词缺东西 → 宾语从句；前面是完整句子 → 状语从句。</li></ol></div>
 <p class="small muted" style="margin:14px 0 8px">下面是你拆过的句子里出现的连接词（2017 全部 + 你的收藏），按出现次数排。点例句直接跳过去看讲解。</p>
 ${order.map(g=>`<details class="ls36-conn"${g==='that'?' open':''}><summary><b>${esc(g)}</b><span>${groups[g].length} 处 · ${esc(kinds(groups[g]))}</span></summary>${groups[g].map(x=>`<button class="ls36-ex" data-ls36-ex="${esc(x.key)}"><span class="kd">${esc(x.kind)}</span><span class="tx">${esc(x.text)}</span><span class="jd">${esc(x.judge||'')}</span><span class="lb">${esc(x.label)}${x.saved?' · 收藏':''}</span></button>`).join('')}</details>`).join('')}</div>`;
 box.querySelectorAll('[data-ls36-ex]').forEach(b=>b.onclick=()=>{const key=b.dataset.ls36Ex,[tid,k]=key.split('|');const rows=ls36Rows(),j=rows.findIndex(r=>r.key===key);
  if(j>=0){ls36.i=j;ls36.step='explain';document.querySelector('[data-grp=sent] [data-sub=list]')?.click();ls36Render();window.scrollTo(0,0);}
  else{openExam(tid,'read');setTimeout(()=>{pickSentence(k);g36ScrollInPane(document.querySelector(`#r-passage .s[data-k="${k}"]`));},120);}});
}
document.querySelector('[data-grp=sent] [data-sub=tails]')?.addEventListener('click',()=>setTimeout(ls36TailsRender,0));

// ===== v39：点词时提示“已在生词本”，同一个词（含不同词形）只算一条 =====
const g39OpenWord=openWord;
openWord=function(el,textId,fromVocab,opts){
 const r=g39OpenWord.apply(this,arguments);
 try{
  const raw=(el&&(el.dataset.w||el.textContent))||'';if(!raw||fromVocab)return r;
  const id=v26Norm(raw);const cat=v26Catalog();const hit=cat.words.find(w=>w.id===id&&w.source==='personal');
  const core=typeof CORE926!=='undefined'?CORE926.find(x=>x.w===id):null;
  const sheet=document.getElementById('wsheet');if(!sheet||(!hit&&!core))return r;
  sheet.querySelector('.g39-invocab')?.remove();
  const from=hit?[...new Set((hit.contexts||[]).map(c=>c.from).filter(Boolean))]:[];
  const div=document.createElement('div');div.className='g39-invocab';
  div.innerHTML=(hit?`<b>已在生词本</b>${id!==raw.toLowerCase()?`（按原形 ${esc(id)} 合并）`:''}${from.length?`，来自 ${from.slice(0,3).map(esc).join('、')}${from.length>3?' 等 '+from.length+' 处':''}`:''}。再标一次只会多记一处出处，不会重复入库。`:'')+(core?`${hit?'<br>':''}<b>石雷鹏 926 核心词</b> 第 ${core.n} 个（Group ${core.g}）：${esc(core.m)}`:'');
  const head=sheet.querySelector('.hd');(head?head.nextElementSibling:sheet.firstElementChild)?.before?.(div);if(!div.isConnected)sheet.prepend(div);
 }catch(e){}
 return r;
};

// ===== v40：从长难句“回原文精读”后，能一键回到刚才那句 =====
let ls40Back=null;
function ls40ShowBack(r){ls40Back={key:r.key,step:ls36.step};let b=document.getElementById('ls40-back');if(!b){b=document.createElement('button');b.id='ls40-back';b.type='button';document.body.append(b);b.onclick=()=>{const k=ls40Back?.key,stp=ls40Back?.step;b.hidden=true;ls40Back=null;const rows=ls36Rows(),j=rows.findIndex(x=>x.key===k);if(j>=0){ls36.i=j;ls36.step=stp||'explain';}show('sent');ls36Render();window.scrollTo(0,0);};}b.textContent='← 回到长难句 · '+r.label+' P'+(r.p+1)+'-'+(r.s+1);b.hidden=false;}
const ls40PrevShow=show;
show=function(v){ls40PrevShow(v);const b=document.getElementById('ls40-back');if(b)b.hidden=!ls40Back||v!=='exam';if(v==='sent')ls40Back=null;};

// ===== v42：同步提示条只在出错时出现；平时看右上角按钮（“待同步”＝本机有改动还没上传） =====
const g42Banner=updateSyncBanner;
updateSyncBanner=function(){g42Banner();const el=document.getElementById('syncbanner');if(el&&!syncErr)el.style.display='none';else if(el)el.style.display='';};
try{updateSyncBanner();}catch(e){}

// ===== v42：连接词表——每个连接词先给综合说明，再看例句 =====
const CONN42={
 'that':{use:'that 能引导五种从句，判断全看两件事：前面是什么、that 在从句里当不当成分。',rows:[['宾语从句','动词（say／find／believe／show…）后面，that 不当成分','He said that it would rain.'],['定语从句','前面是名词，that 在从句里当主语或宾语（后面缺一块）','the bird that they kill'],['同位语从句','前面是 fact／idea／indication 这类抽象名词，后面完整、that 不当成分','the fact that he left'],['主语从句','句首 That …，或 It is … that … 里 it 占位','That he is busy is clear.'],['表语从句','be 动词后面','The point is that …']],tip:'口诀：前面是动词 → 宾语从句；前面是名词 → 看后面缺不缺：缺 → 定语从句，不缺 → 同位语从句。'},
 '（省略 that）':{use:'that 引导宾语从句、定语从句（作宾语时）常被省略，读的时候要自己补回来。',rows:[['省略的宾语从句','said／think／believe 后面直接跟“主语＋带时态的谓语”','He said it would rain.'],['省略的定语从句','名词后面直接跟“主语＋谓语”，且谓语后缺宾语','the book I read']],tip:'看到两个“主语＋谓语”挨在一起、中间没有连词，就是省略了 that。'},
 'which':{use:'which 只引导定语从句，在从句里当主语或宾语。',rows:[['限制性','紧跟名词，没有逗号','the plan which they signed'],['非限制性','前面有逗号，可以指前面整件事','…, which lets them relax.']],tip:'逗号 + which 常指前面整句话，翻译成“这（件事）……”。'},
 'who':{use:'who 引导定语从句（指人），在从句里当主语；也可引导名词性从句表示“谁”。',rows:[['定语从句','前面是人，who 后直接跟谓语','mothers who used devices'],['名词性从句','know／ask 等后面，意思是“谁”','I wonder who he is.']],tip:'those who … ＝ 那些……的人。'},
 'as':{use:'as 的用法很多，先看后面是不是完整句子，再按意思判断。',rows:[['时间／伴随','随着、当……时','As companies continue …'],['原因','因为（常在句首）','As it was late, …'],['方式／比较','正如、像……一样；as … as','as they often are'],['倒装','as + 助动词 + 主语：……也一样','as does conflict']],tip:'as 后面主谓倒装，多半是“……也一样”或比较。'},
 'while':{use:'while 引导状语从句，有三种意思。',rows:[['时间','当……时（常与进行时连用）','while the children were …'],['对比','而（前后两件事对照）','A is …, while B is …'],['让步','虽然（放在句首）','While this may be true, …']],tip:'while 在句首、后面主句出现转折含义，多半是“虽然”。'},
 'if':{use:'if 引导条件状语从句；在 know／ask／wonder 后引导宾语从句，意思是“是否”。',rows:[['条件','如果','If there is a role …'],['宾语从句','是否（＝whether）','I wonder if …']],tip:'虚拟：If + 过去式, would do——与事实相反。'},
 'whether':{use:'whether 引导名词性从句，意思是“是否”；whether … or … 也可引导让步状语从句“无论……还是……”。',rows:[['主语／宾语／表语从句','是否','is whether …'],['让步状语从句','无论……还是……','whether it is A or B']],tip:'句子前面已经完整、whether … or … 放在逗号后，多半是让步。'},
 'what':{use:'what 引导名词性从句，自己在从句里当成分（＝the thing that）。',rows:[['主语从句','句首 What …，到 is 前结束','What makes it thornier is …'],['宾语从句','动词或介词后面','of what the solution is']],tip:'what 不能引导定语从句；前面有名词时要用 that／which。'},
 'how':{use:'how 引导名词性从句（宾语、同位语等），意思是“如何、怎样”。',rows:[['宾语从句','figure out／know 后面','how you relate to your work']],tip:'how 后面通常是完整句子，how 本身作方式状语。'},
 'why':{use:'why 引导名词性从句，常见 This is why …（这就是……的原因）。',rows:[['表语从句','This is why …','This is why people …']],tip:'This is why + 结果；This is because + 原因。'},
 'when':{use:'when 引导时间状语从句；跟在时间名词后时是定语从句；也可引导名词性从句。',rows:[['时间状语','当……时','When there is …'],['固定结构','when it comes to doing：说到、在……方面','when it comes to adjusting']],tip:'when + 过去分词（when absorbed）是省略了主语和 be。'},
 'where':{use:'where 跟在地点名词后引导定语从句；前面没有地点名词时是地点（范围）状语从句。',rows:[['定语从句','前面是地点名词，where 在从句里作地点状语','college, where classes are packed'],['状语从句','前面没有名词，意思是“在……的地方／方面”','succeeding where X is failing']],tip:'先看 where 前面有没有表示地点的名词。'},
 'than':{use:'than 引导比较状语从句，常省略和前面相同的部分，有时倒装。',rows:[['比较','比……更','better than those who do not'],['倒装','than + be/助动词 + 主语','than are cotton fibres']],tip:'把省略的部分补回来再理解，比较对象要对等。'}
};
const ls42Tails=ls36TailsRender;
ls36TailsRender=function(){ls42Tails();const box=document.getElementById('sent-tails');if(!box)return;
 box.querySelector('.ls36-rule')?.insertAdjacentHTML('beforebegin','<p class="ls42-how"><b>怎么用：</b>先看下面判断从句的三步；然后点开一个连接词，先读它的“综合说明”（能引导哪几种从句、怎么区分），再看你拆过的真实例句，点例句可以回到原句看讲解。</p>');
 box.querySelectorAll('.ls36-conn').forEach(d=>{const g=d.querySelector('summary b')?.textContent.trim();const c=CONN42[g];if(!c)return;d.querySelector('summary').insertAdjacentHTML('afterend',`<div class="ls42-sum"><p>${esc(c.use)}</p><table>${c.rows.map(r=>`<tr><th>${esc(r[0])}</th><td>${esc(r[1])}</td><td class="ex">${esc(r[2])}</td></tr>`).join('')}</table><p class="tip">${esc(c.tip)}</p><div class="ls42-exhd">你拆过的例句</div></div>`);});};

// ===== v46：补齐所有连接词的综合说明，并列出你还没拆到的常见连接词 =====
Object.assign(CONN42,{
 'though':{use:'though／although 引导让步状语从句：“虽然……（但）”。',rows:[['让步','放句首或句中，主句不能再用 but','though it may celebrate girlhood …'],['省略','though + 分词／形容词，省略了主语和 be','Though often viewed as …']],tip:'看到 though 后面直接跟 -ed／形容词，就补上“主语 + be”。'},
 'although':{use:'although 和 though 一样，引导让步状语从句，语气更正式，只能放句首或句中。',rows:[['让步','虽然……','Although he tried, …']],tip:'although 与 but 不能同时用。'},
 'before':{use:'before 引导时间状语从句：“在……之前”。',rows:[['时间','主句动作发生在从句之前','Before it ends, …']],tip:'before + doing 是介词短语，不是从句。'},
 'after':{use:'after 引导时间状语从句：“在……之后”。',rows:[['时间','从句先发生','after he had left']],tip:'after + doing 是介词短语。'},
 'until':{use:'until 引导时间状语从句：“直到……”；not … until … 表示“直到……才”。',rows:[['时间','直到','until the early 20th century（介词）']],tip:'not until 放句首时主句要倒装。'},
 'since':{use:'since 有两种：时间“自从……以来”（主句常用完成时），原因“因为、既然”。',rows:[['时间','主句用完成时','since he arrived'],['原因','逗号后补充理由','…, since the only way … was to boil them.']],tip:'主句不是完成时、也没有时间起点的意思，多半是“因为”。'},
 'because':{use:'because 引导原因状语从句，回答“为什么”。',rows:[['原因','because + 完整句子','because they remain the exception'],['介词短语','because of + 名词，不是从句','because of its impact']],tip:'just because … doesn’t mean …：“仅仅因为……并不意味着……”，此时 because 从句作主语。'},
 'just because':{use:'口语里 Just because A doesn’t mean B：“仅仅因为 A 并不意味着 B”，just because 小句整体作主语。',rows:[['主语从句','后面紧跟 doesn’t mean','just because a child isn’t learning … doesn’t mean …']],tip:'看到 doesn’t mean 前面没有名词主语，往前找 just because。'},
 'whatever':{use:'whatever 引导名词性从句（＝anything that），或让步状语从句（＝no matter what）。',rows:[['名词性从句','作介词／动词的宾语','into whatever else we’re doing'],['让步','无论什么','Whatever happens, …']],tip:'后面句子缺宾语且 whatever 补位 → 名词性从句；放句首后接逗号 → 让步。'},
 'as if':{use:'as if／as though 引导方式状语从句或在 look／seem 后引导表语从句：“好像……”。',rows:[['表语从句','look／seem as if','it does look as if …'],['方式状语','做某事的样子','He talks as if he knew.']],tip:'as if 后常用虚拟语气（过去式）表示与事实不符。'},
 'whether … or':{use:'whether … or … 放在句子完整之后，引导让步状语从句：“无论……还是……”。',rows:[['让步','无论是 A 还是 B','whether it is household work or work …']],tip:'和名词性的 whether（是否）区别：前面句子完整 → 让步。'},
 'in that':{use:'in that 引导原因状语从句：“因为、在于”，正式文体。',rows:[['原因','解释前面的判断','a paradox in that …']],tip:'in that ≠ in which；in that 后面是完整句子。'},
 'as long as':{use:'as long as／so long as 引导条件状语从句：“只要……”。',rows:[['条件','只要','as long as they had signed …']],tip:'和 if 一样是条件，只是语气更强调“前提”。'},
 'in so far as':{use:'in so far as（insofar as）引导程度／条件状语从句：“在……范围内；只要”。',rows:[['程度／条件','只在……的程度上','only in so far as it advances progress']],tip:'和 as far as 类似，表示限定范围。'},
 'providing':{use:'providing／provided (that) 引导条件状语从句：“如果、只要”。',rows:[['条件','＝if／as long as','providing you dip in often enough']],tip:'providing 看着像分词，其实这里是连词，后面跟完整句子。'},
 'so that':{use:'so that 引导目的状语从句（以便）或结果状语从句（因此）。',rows:[['目的','从句里常有 can／could／may','so that they can …'],['结果','前面常有逗号，表示“所以”','…, so that reading becomes …'],['so … that','so + 形容词 + that：如此……以致','so exhausted that …']],tip:'有情态动词多半是目的；没有、表示自然结果的是结果。'},
 'from which':{use:'介词 + which 引导定语从句，介词由从句里的动词搭配决定。',rows:[['定语从句','surface from the state → the state from which you surface','the default state from which you temporarily surface']],tip:'把先行词放回从句里，看介词跟谁搭配：surface from sth。'},
 'were':{use:'省略 if 的虚拟条件句：把 were／had／should 提到主语前面。',rows:[['倒装条件句','were you to … ＝ if you were to …','were you to switch to the nursing school']],tip:'主句有 would／could，句中出现“were／had／should + 主语”，就是省略了 if。'},
 'whom':{use:'whom 引导定语从句（指人），在从句里作宾语；介词后只能用 whom。',rows:[['定语从句','前面是人，从句缺宾语','the man whom I met']],tip:'口语里常用 who 或省略。'},
 'whose':{use:'whose 引导定语从句，表示“……的”，后面紧跟名词。',rows:[['定语从句','whose + 名词','a company whose profits rose']],tip:'whose 可以指人也可以指物。'},
 'unless':{use:'unless 引导条件状语从句：“除非、如果不”。',rows:[['条件','＝if … not','unless you work hard']],tip:'unless 从句里不再用否定。'},
 'once':{use:'once 作连词引导时间／条件状语从句：“一旦……”。',rows:[['时间／条件','一旦','Once you start, …']],tip:'once 后跟完整句子时是连词，不是“一次”。'},
 'no matter':{use:'no matter what／how／who … 引导让步状语从句：“无论……”。',rows:[['让步','无论','no matter how hard it is']],tip:'= whatever／however／whoever 的让步用法。'},
 'whereas':{use:'whereas 引导对比状语从句：“而、然而”。',rows:[['对比','前后两件事对照','A is …, whereas B is …']],tip:'和对比义的 while 用法相同。'},
 'now that':{use:'now that 引导原因状语从句：“既然、由于现在”。',rows:[['原因','既然','Now that you are here, …']],tip:'强调现在的新情况。'},
 'given that':{use:'given (that) 引导原因／条件：“考虑到、鉴于”。',rows:[['原因','鉴于','Given that the cost is high, …']],tip:'given 看着像分词，后面跟完整句子时作连词。'}
});
const ls46Tails=ls36TailsRender;
ls36TailsRender=function(){ls46Tails();const box=document.getElementById('sent-tails');if(!box)return;const have=new Set([...box.querySelectorAll('.ls36-conn summary b')].map(b=>b.textContent.trim()));
 const extra=['although','after','until','whom','whose','unless','once','no matter','whereas','now that','given that'].filter(k=>!have.has(k)&&CONN42[k]);
 if(extra.length)box.querySelector('.ls36-tails')?.insertAdjacentHTML('beforeend',`<h3 class="ls46-h">还没在你拆过的句子里出现、但考研常见的连接词</h3>${extra.map(g=>{const c=CONN42[g];return `<details class="ls36-conn"><summary><b>${esc(g)}</b><span>暂无例句</span></summary><div class="ls42-sum"><p>${esc(c.use)}</p><table>${c.rows.map(r=>`<tr><th>${esc(r[0])}</th><td>${esc(r[1])}</td><td class="ex">${esc(r[2])}</td></tr>`).join('')}</table><p class="tip">${esc(c.tip)}</p></div></details>`;}).join('')}`);};
