// ===== v39：926 核心词混进每日队列（每组 10 个：6 个自己的生词 + 4 个核心/补充词） =====
const V39_MIX=4;
queueWords=function(){const map=new Map(CATALOG.filter(w=>!w.reference&&w.quality!=='missing').map(w=>[w.id,w]));const pending=w=>!state.learning[w.id]||!state.learning[w.id].nextDue||state.learning[w.id].nextDue<=Date.now();const all=[...map.values()].filter(pending);const personal=all.filter(w=>w.source==='personal'),supp=all.filter(w=>w.source!=='personal');const fresh=personal.filter(w=>!state.learning[w.id]&&!w.legacyDeferred),due=personal.filter(w=>!fresh.includes(w));due.sort((a,b)=>(state.learning[a.id]?.nextDue||a.legacyDue||0)-(state.learning[b.id]?.nextDue||b.legacyDue||0));const p=[];while(fresh.length||due.length){p.push(...fresh.splice(0,6),...due.splice(0,2));if(!fresh.length&&due.length)p.push(...due.splice(0,6));}
 const rows=[];while(p.length||supp.length){const batch=p.splice(0,10-V39_MIX);batch.push(...supp.splice(0,10-batch.length));if(batch.length<10)batch.push(...p.splice(0,10-batch.length));rows.push(...batch);}return [...new Set(rows.map(w=>w.id))];};
activeWords=(()=>{const prev=activeWords;return ()=>{const all=WORDS;const marked=all.reduce((last,w,i)=>judgments()[w.id]?i+1:last,0);return all.slice(0,Math.max(+state.dailyGoal||100,marked,(state.batch+1)*10));};})();
// 已在进行中的一轮：把还没出现过的 926 词按 6+4 插进尚未筛到的部分
const receive39=receive;
receive=function(data){receive39(data);try{const inQ=new Set(WORDS.map(w=>w.id));const missing=CATALOG.filter(w=>w.core&&w.source!=='personal'&&!inQ.has(w.id)&&!state.learning[w.id]);if(missing.length){const cut=(state.batch+1)*10,prefix=WORDS.slice(0,cut),tail=WORDS.slice(cut).filter(w=>!judgments()[w.id]);const pers=tail.filter(w=>w.source==='personal'),sup=[...missing,...tail.filter(w=>w.source!=='personal')];const out=[...prefix];while(pers.length||sup.length){const b=pers.splice(0,10-V39_MIX);b.push(...sup.splice(0,10-b.length));if(b.length<10)b.push(...pers.splice(0,10-b.length));out.push(...b);}WORDS=out;state.queueIDs=WORDS.map(w=>w.id);state.supplement=true;}}catch(e){}render();};
// 发音：先用有道真人读音，失败再用本机
const speak39=speak;
speak=function(w,manual=false){if(!w||(!manual&&!state.sound))return;stopAudio();const t=audioTicket;try{const a=new Audio('https://dict.youdao.com/dictvoice?type=2&audio='+encodeURIComponent(w.say||w.w));activeAudio=a;let f=false;const fb=()=>{if(f||t!==audioTicket)return;f=true;if(activeAudio===a)activeAudio=null;speak39(w,true);};a.onerror=fb;const p=a.play();if(p&&p.catch)p.catch(fb);}catch(e){speak39(w,manual);}};
// 原句高亮：词形变化也标出来
hl=function(w){const forms=[...new Set([w.w,...(w.surface||[])])].filter(Boolean).sort((a,b)=>b.length-a.length).map(x=>x.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'));return esc(w.sent||'').replace(new RegExp('(?<![A-Za-z])('+forms.join('|')+')(?![A-Za-z])','ig'),'<mark>$1</mark>');};

// ===== v39：今天的任务一目了然 =====
function plan39(compact){config29();const L=ledger29(),screened=Object.keys(L.screened||{}).length,cardsDone=Object.keys(L.cards||{}).length,goal=+state.dailyGoal||100,pend=pendingWords().length,now=Date.now(),due=CATALOG.filter(w=>{const r=state.learning[w.id];return r&&r.needsReview&&r.nextDue&&r.nextDue<=now&&!judgments()[w.id];}).length,pct=Math.min(100,Math.round(screened/goal*100));
 return `<section class="vl-plan39${compact?' compact':''}"><div class="p39-row"><strong>今天</strong><span>筛词 <b>${screened}</b> / ${goal}</span><span>待精背 <b>${pend}</b></span><span>已背卡片 <b>${cardsDone}</b></span>${due?`<span>到期复习 <b>${due}</b></span>`:''}</div><div class="p39-bar"><i style="width:${pct}%"></i></div>${compact?'':`<p class="p39-tip">${screened<goal?`还差 ${goal-screened} 个词完成今天的筛词；每筛 ${state.screenLimit||'完'}${state.screenLimit?' 组':''}会进一次卡片。`:'今天的筛词目标完成了，把待精背的卡片过完就可以休息。'}</p>`}</section>`;}
const render39=render;
render=function(){render39();try{if(ready&&!state.paused&&['screen','summary','cards'].includes(state.stage)&&activeWords().length){main.insertAdjacentHTML('afterbegin',plan39(state.stage==='cards'));}}catch(e){}};

// ===== v39：快速筛词——一次一个词，一下判断 =====
if(state.quick39===undefined)state.quick39=true;
const screen39=screen;
screen=function(){if(state.quick39===false)return screen39().replace('<div class="vl-heading28">','<div class="vl-heading28"><button class="vl-link" data-action="quick39-mode">切到一词一判 ⇄</button>');
 const ws=listWords(),js=judgments(),next=ws.find(w=>!js[w.id]),idx=ws.indexOf(next),total=Math.ceil(activeWords().length/10),last=state.quick39Last&&word(state.quick39Last);
 const lastHTML=last&&js[last.id]?`<div class="q39-last"><span>上一个</span><b>${esc(last.w)}</b><em>${esc(last.core?last.coreMean:(last.pos+' '+last.mean))}</em><span class="q39-tag ${js[last.id].grade==='known'?'ok':'no'}">${js[last.id].grade==='known'?'认识':js[last.id].grade==='fuzzy'?'模糊':'不认识'}</span><button class="vl-link" data-action="quick39-fix">改判</button></div>`:'';
 if(next)return `<div class="q39"><div class="q39-top"><span>第 ${state.batch+1} 组 · ${idx+1} / ${ws.length}</span><span>${pendingWords().length?`<button class="vl-link" data-action="start">现在精背 · ${pendingWords().length} 词</button> · `:''}<button class="vl-link" data-action="quick39-mode">列表视图 ⇄</button></span></div><section class="q39-card"><div class="q39-src">${next.core?`926 核心词 · Group ${next.group}`:next.source==='personal'?'我的生词':'补充词'}</div><div class="q39-word">${esc(next.w)}</div><div class="q39-pron">${esc(next.pron||'')}<button class="vl-audio" data-action="speak39" data-id="${esc(next.id)}" aria-label="发音">♪</button></div><p class="q39-ask">看到就想：认识吗？</p></section><div class="q39-btns"><button class="vl-button" data-action="quick39" data-id="${esc(next.id)}" data-grade="forgot">不认识<small>←</small></button><button class="vl-button" data-action="quick39" data-id="${esc(next.id)}" data-grade="fuzzy">模糊<small>↓</small></button><button class="vl-button primary" data-action="quick39" data-id="${esc(next.id)}" data-grade="known">认识<small>→</small></button></div>${lastHTML}<p class="vl-tiny q39-note">“认识”的词这一轮跳过卡片；不认识和模糊的进入精背。判错了点上一个旁边的“改判”。</p></div>`;
 const known=ws.filter(w=>js[w.id]?.grade==='known').length,more=(state.batch+1)*10<activeWords().length;
 return `<div class="q39"><div class="q39-top"><span>第 ${state.batch+1} 组筛完 · 认识 ${known} / ${ws.length}</span><button class="vl-link" data-action="quick39-mode">列表视图 ⇄</button></div><div class="q39-review">${ws.map(w=>`<button class="q39-item ${js[w.id]?.grade==='known'?'ok':'no'}" data-action="quick39-toggle" data-id="${esc(w.id)}"><b>${esc(w.w)}</b><span>${esc(w.core?w.coreMean:(w.pos+' '+w.mean))}</span><em>${js[w.id]?.grade==='known'?'认识':js[w.id]?.grade==='fuzzy'?'模糊':'不认识'}</em></button>`).join('')}</div><p class="vl-tiny">对照释义看一眼，判错的点一下就能改。</p><div class="vl-batch-actions"><button class="vl-button primary" data-action="next-list">${more?'下一组 →':'筛选完成，进入精背 →'}</button><div class="vl-list-secondary"><button class="vl-button" data-action="start">现在就精背 · ${pendingWords().length} 词</button><button class="vl-button" data-action="list-finish">先停在这里</button></div></div></div>`;};
const action39=mobileAction;
mobileAction=function(a,b){
 if(a==='quick39'){const id=b.dataset.id,g=b.dataset.grade;if(!word(id))return true;record(id,g,'selfcheck','list');judgments()[id]={grade:g,at:state.learning[id].at};state.quick39Last=id;stopAudio();save();render();q39AutoSpeak();return true;}
 if(a==='quick39-fix'||a==='quick39-toggle'){const id=a==='quick39-fix'?state.quick39Last:b.dataset.id;const cur=judgments()[id]?.grade;if(!cur)return true;const g=cur==='known'?'forgot':'known';record(id,g,'selfcheck','list');judgments()[id]={grade:g,at:state.learning[id].at};save();render();return true;}
 if(a==='quick39-mode'){state.quick39=state.quick39===false;save();render();q39AutoSpeak();return true;}
 if(a==='speak39'){speak(word(b.dataset.id),true);return true;}
 return action39(a,b);};
let q39Spoken='';
function q39AutoSpeak(){if(state.stage!=='screen'||state.quick39===false||state.paused)return;const n=listWords().find(w=>!judgments()[w.id]);if(n&&n.id!==q39Spoken){q39Spoken=n.id;speak(n);}}
root.addEventListener('keydown',e=>{if(state.stage!=='screen'||state.quick39===false||e.target.closest('input,textarea,select'))return;const n=listWords().find(w=>!judgments()[w.id]);if(!n)return;const g={ArrowLeft:'forgot',ArrowDown:'fuzzy',ArrowRight:'known'}[e.key];if(!g)return;e.preventDefault();mobileAction('quick39',{dataset:{id:n.id,grade:g}});});
document.addEventListener('keydown',e=>{if(document.getElementById('view-vocab')?.classList.contains('hide'))return;if(state.stage!=='screen'||state.quick39===false||/INPUT|TEXTAREA|SELECT/.test(e.target.tagName))return;const n=listWords().find(w=>!judgments()[w.id]);if(!n)return;const g={ArrowLeft:'forgot',ArrowDown:'fuzzy',ArrowRight:'known'}[e.key];if(!g)return;e.preventDefault();mobileAction('quick39',{dataset:{id:n.id,grade:g}});});

// ===== v39：卡片展开后一页看全，不用左右翻 =====
tabContent=function(w){const notes=noteList(w,'general'),cn=noteList(w,'confuse');
 return `<div class="c39"><div class="c39-mean"><span class="c39-pos">${esc(w.pos)}</span> ${esc(w.core?w.coreMean.replace(/^\S+\.\s*/,''):w.mean)}${w.core&&w.source==='personal'&&w.mean?`<div class="c39-ctx">原文语境义：${esc(w.mean)}</div>`:''}</div>
 ${w.sent?`<div class="c39-sec"><div class="vl-page-label">${esc(w.from||'')} · 真题原句</div><div class="vl-sentence">${hl(w)}</div>${w.cn?`<details><summary>看整句译文</summary><p class="vl-translation">${esc(w.cn)}</p></details>`:''}</div>`:''}
 ${w.phrase?`<div class="c39-sec"><div class="vl-page-label">搭配</div><div class="vl-phrase">${esc(w.phrase)}</div>${w.phraseCn?`<div class="vl-phrase-cn">${esc(w.phraseCn)}</div>`:''}</div>`:''}
 ${w.root||w.family?.length?`<details class="c39-more"><summary>构词 / 词族</summary>${w.root?`<div class="vl-callout">${esc(w.root)}</div>`:''}${w.family?.length?`<div class="vl-family">${w.family.map(x=>`<div class="vl-family-item"><strong>${esc(x[0])}</strong><span>${esc(x[1])}</span></div>`).join('')}</div>`:''}</details>`:''}
 ${w.confuse?.length||cn.length?`<details class="c39-more"${cn.length?' open':''}><summary>易混辨析${cn.length?' · 我的 '+cn.length:''}</summary>${w.confuse?.length?`<div class="vl-family">${w.confuse.map(x=>`<div class="vl-family-item"><strong>${esc(x[0])}</strong><span>${esc(x[1])}</span></div>`).join('')}</div>`:''}${notesHTML(w,'confuse')}</details>`:''}
 ${w.other?`<details class="c39-more"><summary>其他常见含义</summary><p>${esc(w.other)}</p></details>`:''}
 <details class="c39-more"><summary>我的注释${notes.length?' · '+notes.length:''}</summary>${notesHTML(w,'general')}</details></div>`;};
const cards39=cards;
cards=function(){let h=cards39();const w=current();if(w?.core)h=h.replace(/(补充重点词|我的生词)/,w.source==='personal'?'我的生词 · 也是 926 核心词':'926 核心词 · Group '+w.group);return h;};

// ===== v41：生词首页（今天要做什么）+ 只在学习时计时 + 卡片分页 =====
let lastAct41=Date.now();
['pointerdown','keydown'].forEach(t=>root.addEventListener(t,()=>{lastAct41=Date.now();},true));
document.addEventListener('keydown',()=>{lastAct41=Date.now();},true);
const tick41=tick;
tick=function(){if(['home39','library'].includes(state.stage)){last=Date.now();return;}if(ready&&state.started&&!state.paused&&['screen','cards','context'].includes(state.stage)&&Date.now()-lastAct41>90000){state.paused=true;stopAudio();save();render();announce('一分半没有操作，计时已自动暂停。');return;}tick41();};
function due41(){const now=Date.now();return CATALOG.filter(w=>{const r=state.learning[w.id];return r&&r.needsReview&&r.nextDue&&r.nextDue<=now;}).length;}
function home41(){config29();const L=ledger29(),screened=Object.keys(L.screened||{}).length,cardsDone=Object.keys(L.cards||{}).length,goal=+state.dailyGoal||100,pend=pendingWords().length,inCards=state.ids?.length&&state.index<state.ids.length&&state.stage0==='cards',left=Math.max(0,goal-screened),coreSeen=CATALOG.filter(w=>w.core&&judgments()[w.id]).length,coreAll=CATALOG.filter(w=>w.core).length,mine=CATALOG.filter(w=>w.source==='personal'&&!w.reference).length;
 const next=inCards?{a:'home-resume',t:`继续单词卡 · 第 ${state.index+1} / ${state.ids.length} 个`}:pend>=10||left===0&&pend?{a:'home-cards',t:`开始今天：先背 ${pend} 张单词卡`}:left?{a:'home-screen',t:`开始今天：筛新词（还差 ${left} 个）`}:{a:'home-done',t:'今天的任务完成了 ✓'};
 return `<section class="h41"><div class="h41-today"><div class="h41-title"><h1>今天</h1><span>${new Date().getMonth()+1} 月 ${new Date().getDate()} 日</span></div>
 <div class="h41-steps"><div class="h41-step${left?'':' done'}"><b>${screened}<small> / ${goal}</small></b><span>① 筛新词</span><em>一词一判，认识的跳过</em></div><div class="h41-step${pend?'':' done'}"><b>${pend}</b><span>② 单词卡精背</span><em>没认出来的词，逐个过卡片</em></div><div class="h41-step"><b>${cardsDone}</b><span>今天已背卡片</span><em>${due41()?`另有 ${due41()} 个到期复习，筛词时会出现`:'没有到期要复习的'}</em></div></div>
 <button class="vl-button primary h41-go" data-action="${next.a}"${next.a==='home-done'?' disabled':''}>${next.t} →</button></div>
 <div class="h41-entries"><button class="h41-entry" data-action="home-screen"><strong>筛词</strong><span>今天的新词 + 到期复习，一次一个判断</span></button><button class="h41-entry" data-action="home-cards"${pend?'':' disabled'}><strong>单词卡 · ${pend}</strong><span>${pend?'筛出来不熟的词，逐个精背':'还没有待精背的词，先筛词'}</span></button><button class="h41-entry" data-action="library"><strong>词库</strong><span>我的生词 ${mine} · 926 已筛 ${coreSeen}/${coreAll} · 搜索查词</span></button></div>
 <details class="h41-set"><summary>每日目标 ${goal} 词 · 每筛 ${state.screenLimit||'完'}${state.screenLimit?' 组':''}进一次卡片</summary><div class="vl-plan-fields29"><label>每日筛词目标（10 的倍数）<input id="v29-goal" type="number" min="10" max="1000" step="10" value="${goal}"></label><label>进入卡片的时机<select id="v29-limit"><option value="3"${state.screenLimit===3?' selected':''}>筛 3 组后</option><option value="5"${state.screenLimit===5?' selected':''}>筛 5 组后</option><option value="0"${state.screenLimit===0?' selected':''}>筛完今天的目标后</option></select></label><button class="vl-button" data-action="apply-plan29">保存</button></div></details></section>`;}
const render41=render;
render=function(){if(ready&&state.stage==='home39'){root.dataset.stage='home39';root.querySelector('.vl-steps').innerHTML='';main.innerHTML=home41()+overlay();return;}render41();
 if(ready&&['screen','cards','context','library','summary'].includes(state.stage)&&!main.querySelector('.h41-back'))main.insertAdjacentHTML('afterbegin','<button class="vl-link h41-back" data-action="home41">‹ 生词首页</button>');};
function goHome41(){if(state.stage==='cards'||state.stage==='context')state.stage0=state.stage;else state.stage0=null;state.stage='home39';state.paused=false;state.menu=false;stopAudio();save();render();}
const action41=mobileAction;
mobileAction=function(a,b){
 if(a==='home41'||a==='library-back'&&state.stage==='library'){goHome41();return true;}
 if(a==='home-resume'){state.stage=state.stage0||'cards';state.started=true;state.paused=false;last=Date.now();lastAct41=Date.now();save();render();return true;}
 if(a==='home-screen'){state.stage='screen';state.started=true;state.paused=false;last=Date.now();lastAct41=Date.now();const ws=listWords();if(ws.length&&ws.every(w=>judgments()[w.id])&&(state.batch+1)*10<activeWords().length)state.batch++;save();render();q39AutoSpeak();return true;}
 if(a==='home-cards'){state.started=true;state.paused=false;last=Date.now();lastAct41=Date.now();return action41('pending-cards',b);}
 if(a==='apply-plan29'&&state.stage==='home39'){const r=action41(a,b);state.stage='home39';save();render();return r;}
 return action41(a,b);};
root.addEventListener('click',e=>{const b=e.target.closest('[data-action="home41"],[data-action="home-resume"],[data-action="home-screen"],[data-action="home-cards"]');if(!b||b.disabled)return;e.stopImmediatePropagation();mobileAction(b.dataset.action,b);},true);
const receive41=receive;
receive=function(data){receive41(data);if(!state.home41Seen||state.stage!=='cards'){goHome41();}state.home41Seen=true;};
window.addEventListener('message',e=>{if(e.source!==parent)return;if(e.data?.type==='v41:home'&&ready&&state.stage!=='home39')goHome41();});

// 词库：去掉参考项（人名、虚词），加 926 筛选
const library41=library;
library=function(){const saved=CATALOG;CATALOG=saved.filter(w=>!w.reference&&!(state.libraryFilter==='core'&&!w.core));try{let h=library41();h=h.replace(/<p class="vl-sub">我的词[^<]*<\/p>/,`<p class="vl-sub">我的生词 ${CATALOG.filter(w=>w.source==='personal').length} · 926 核心词 ${CATALOG.filter(w=>w.core).length} · 补充词 ${CATALOG.filter(w=>w.source!=='personal'&&!w.core).length}</p>`).replace('<button class="vl-button " data-filter="supplement">补充词</button>','<button class="vl-button '+(state.libraryFilter==='core'?'vl-selected':'')+'" data-filter="core">926 核心</button><button class="vl-button " data-filter="supplement">补充词</button>').replace(/data-filter="supplement">补充词<\/button>/,'data-filter="supplement">补充词</button>'+(h.includes('data-filter="core"')?'':`<button class="vl-button ${state.libraryFilter==='core'?'vl-selected':''}" data-filter="core">926 核心</button>`)).replace('<button class="vl-link" data-action="library-back">‹ 返回学习列表</button>','');return h;}finally{CATALOG=saved;}};

// 卡片：分页（释义 / 原句 / 词形 / 短语 / 同根 / 近义易混），可点可左右滑
const TABS41=['释义','原句','词形','短语','同根','近义·易混'];
setTab=function(i){if(!state.flip)return;const n=Math.max(0,Math.min(TABS41.length-1,i));if(n===(state.tab41||0))return;state.tab41=n;save();render();};
function d41(w){return (typeof DICT!=='undefined'&&(DICT[w.id]||DICT[w.w]))||{};}
function phr41(w){const forms=new Set([w.w,...(w.surface||[])].map(x=>x.toLowerCase()));const out=[];if(w.phrase)out.push([w.phrase,w.phraseCn||'']);if(typeof PHD!=='undefined')for(const [k,v] of Object.entries(PHD)){if(out.length>=10)break;const toks=k.toLowerCase().split(/\s+/);if(toks.length>1&&toks.some(t=>forms.has(t)))out.push([k,v.t||'']);}return out;}
function fam41(w){const out=[...(w.family||[])];const id=w.id;let stem=id.replace(/(ation|ition|tion|sion|ment|ness|ity|ive|ize|ise|ally|al|ly|ing|ed|er|ous|ful|less|able|ible|ence|ance|ate|ent|ant|y|e)$/,'');if(stem.length<4)stem=id.slice(0,Math.max(4,id.length-2));if(typeof DICT!=='undefined')for(const k of Object.keys(DICT)){if(out.length>=8)break;if(k!==id&&!k.includes(' ')&&k.startsWith(stem)&&k.length<=stem.length+7&&!out.some(x=>x[0]===k)&&!(DICT[k].l&&DICT[k].l===id))out.push([k,String(DICT[k].t||'').split('\n')[0].slice(0,40)]);}return out;}
function sents41(w){const cs=(w.contexts&&w.contexts.length?w.contexts:[{from:w.from,sent:w.sent,cn:w.cn}]).filter(c=>c.sent);return cs.slice(0,4);}
function tabsHave41(w){return [true,sents41(w).length>0,!!(d41(w).x||(w.surface||[]).some(x=>x!==w.w)),phr41(w).length>0,!!(w.root||fam41(w).length),!!((w.confuse||[]).length||w.compare||noteList(w,'confuse').length)];}
tabContent=function(w){const t=state.tab41||0,have=tabsHave41(w);
 const bar=`<div class="t41-bar" role="tablist">${TABS41.map((x,i)=>`<button class="t41-tab${i===t?' on':''}${have[i]?'':' empty'}" data-action="tab" data-tab="${i}" role="tab" aria-selected="${i===t}">${x}</button>`).join('')}</div>`;
 let body='';
 if(t===0){const other=w.other||String(d41(w).t||'').replace(/\n/g,'；');body=`<div class="c39-mean"><span class="c39-pos">${esc(w.pos)}</span> ${esc(w.core?w.coreMean.replace(/^\S+\.\s*/,''):w.mean)}${w.core&&w.source==='personal'&&w.mean?`<div class="c39-ctx">原文语境义：${esc(w.mean)}</div>`:''}</div>${other?`<div class="vl-page-label">词典释义</div><p class="t41-p">${esc(other)}</p>`:''}<details class="c39-more"><summary>我的注释${noteList(w,'general').length?' · '+noteList(w,'general').length:''}</summary>${notesHTML(w,'general')}</details>`;}
 else if(t===1){const cs=sents41(w);body=cs.length?cs.map(c=>`<div class="t41-sent"><div class="vl-page-label">${esc(c.from||'')}</div><div class="vl-sentence">${hl({...w,sent:c.sent})}</div>${c.cn?`<details><summary>看整句译文</summary><p class="vl-translation">${esc(c.cn)}</p></details>`:''}</div>`).join(''):'<p class="vl-tiny">你做过的真题里还没有出现这个词。</p>';}
 else if(t===2){const x=d41(w).x,seen=(w.surface||[]).filter(s=>s!==w.w);body=`${x?`<div class="vl-page-label">词形变化</div><div class="t41-forms">${String(x).split('·').map(s=>`<span>${esc(s.trim())}</span>`).join('')}</div>`:'<p class="vl-tiny">词典里没有记录变形（多为不变形的词）。</p>'}${seen.length?`<div class="vl-page-label" style="margin-top:14px">真题里出现过的形式</div><div class="t41-forms">${seen.map(s=>`<span>${esc(s)}</span>`).join('')}</div>`:''}`;}
 else if(t===3){const ps=phr41(w);body=ps.length?`<div class="vl-family">${ps.map(p=>`<div class="vl-family-item"><strong>${esc(p[0])}</strong><span>${esc(p[1])}</span></div>`).join('')}</div>`:'<p class="vl-tiny">词典短语库里暂时没有这个词的固定搭配。</p>';}
 else if(t===4){const fs=fam41(w);body=`${w.root?`<div class="vl-callout">${esc(w.root)}</div>`:''}${fs.length?`<div class="vl-page-label">同根／同词族（按拼写找出，供参考）</div><div class="vl-family">${fs.map(x=>`<div class="vl-family-item"><strong>${esc(x[0])}</strong><span>${esc(x[1])}</span></div>`).join('')}</div>`:'<p class="vl-tiny">暂时没找到同根词，先整体记忆。</p>'}`;}
 else{body=`${(w.confuse||[]).length?`<div class="vl-family">${w.confuse.map(x=>`<div class="vl-family-item"><strong>${esc(x[0])}</strong><span>${esc(x[1])}</span></div>`).join('')}</div>`:'<p class="vl-tiny">暂无整理好的近义／易混词。遇到容易混的，可以在下面写进自己的易混注释。</p>'}${w.compare?`<div class="vl-callout">${esc(w.compare)}</div>`:''}${notesHTML(w,'confuse')}`;}
 return bar+`<div class="t41-body">${body}</div><p class="vl-tiny t41-hint">左右滑动或点上面的标签切换</p>`;};
// 展开后保持在上次看的那一页，换词时回到“释义”
const grade41=grade;grade=function(g){state.tab41=0;grade41(g);};

// ===== v42：精简界面、每日计时、上一个/下一个、词典数据（短语/同根/近义/例句/巧记） =====
state.paused=false;
function dayKey42(){return day29();}
function dayTime42(){state.dayTime42=state.dayTime42||{};return state.dayTime42[dayKey42()]||0;}
tick=function(){const now=Date.now(),dt=Math.min(2,(now-last)/1000);last=now;if(!ready||document.hidden||document.getElementById('view-vocab')?.classList.contains('hide'))return;if(['screen','cards','context'].includes(state.stage)){state.dayTime42=state.dayTime42||{};state.dayTime42[dayKey42()]=dayTime42()+dt;}updateClock();};
updateClock=function(){const el=main.querySelector('.tb42-time');if(!el)return;const L=ledger29(),n=Object.keys(L.screened||{}).length+Object.keys(L.cards||{}).length;el.textContent=`今天 ${textTime(dayTime42())} · ${n} 词`;};
function topbar42(){config29();const L=ledger29(),screened=Object.keys(L.screened||{}).length,goal=+state.dailyGoal||100,pend=pendingWords().length,pct=Math.min(100,Math.round(screened/goal*100));
 const mid=state.stage==='cards'?`<span class="tb42-title">${current()?.source==='personal'?'我的生词':current()?.core?'926 核心词':'补充词'} · ${Math.min(state.index+1,state.ids.length)} / ${state.ids.length}</span>`:state.stage==='library'?'<span class="tb42-title">词库</span>':`<span class="tb42-stat">筛词 <b>${screened}</b>/${goal}<i class="tb42-bar"><i style="width:${pct}%"></i></i></span><span class="tb42-stat">待精背 <b>${pend}</b></span>`;
 return `<div class="tb42"><button class="vl-button tb42-back" data-action="home41">‹ 生词首页</button><div class="tb42-mid">${mid}</div><span class="tb42-time"></span></div>`;}
const render42=render;
render=function(){state.paused=false;render42();if(!ready||state.stage==='home39')return;
 main.querySelectorAll('.q39-note,.q39-top [data-action="quick39-mode"],.vl-heading28 [data-action="quick39-mode"],.h41-back,.vl-plan39,.vl-heading28,.vl-totals28,.vl-plan29,.vl-day29,.vl-mobile-bar,.vl-under,.vl-front .vl-tiny,.t41-hint').forEach(e=>e.remove());
 main.querySelectorAll('.vl-sub').forEach(e=>{if(/只需标出|先想意思/.test(e.textContent))e.remove();});
 if(state.stage==='library'){main.querySelector('[data-action="library-back"]')?.remove();main.querySelector('h1')?.remove();const cores=main.querySelectorAll('[data-filter="core"]');if(cores.length>1)cores[1].remove();}
 main.insertAdjacentHTML('afterbegin',topbar42());
 if(state.stage==='cards'&&current()){const dock=main.querySelector('.vl-dock');dock?.insertAdjacentHTML('afterbegin',`<div class="nav42"><button class="vl-button" data-action="prev42"${state.grades.length?'':' disabled'}>‹ 上一个</button><button class="vl-button" data-action="next42">下一个 ›</button></div>`);}
 updateClock();};
const action42=mobileAction;
mobileAction=function(a,b){
 if(a==='pause'||a==='menu')return true;
 if(a==='prev42'){if(!state.grades.length)return true;action42('undo',b);const g=state.grades.pop();if(!g)return true;state.learning[g.id]=g.previous?{...g.previous,at:Date.now()}:{disposition:'review',needsReview:true,recall:null,evidence:'undo',at:Date.now(),nextDue:0};state.marks[g.id]=g.previous?.disposition==='skip'?'known':'study';state.index=Math.max(0,state.index-1);state.flip=true;state.tab41=0;return true;}
 if(a==='next42'){const id=state.ids[state.index];if(id){state.ids.splice(state.index,1);state.ids.push(id);state.flip=false;state.tab41=0;stopAudio();save();render();}return true;}
 return action42(a,b);};
root.addEventListener('click',e=>{const b=e.target.closest('[data-action="prev42"],[data-action="next42"],[data-action="pause"],[data-action="menu"]');if(!b||b.disabled)return;e.stopImmediatePropagation();mobileAction(b.dataset.action,b);save();if(b.dataset.action!=='next42')render();},true);
// 首页设置里加入筛词方式
const home42=home41;
home41=function(){return home42().replace('<button class="vl-button" data-action="apply-plan29">保存</button>',`<label>筛词方式<select id="v42-mode"><option value="list"${state.quick39===false?' selected':''}>列表（一屏 10 个）</option><option value="quick"${state.quick39!==false?' selected':''}>一词一判</option></select></label><button class="vl-button" data-action="apply-plan29">保存</button>`);};
const apply42=mobileAction;
mobileAction=function(a,b){if(a==='apply-plan29'){const m=root.querySelector('#v42-mode');if(m)state.quick39=m.value!=='list';}return apply42(a,b);};
// 词典数据
function k42(w){return (typeof KDICT!=='undefined'&&KDICT[w.id])||null;}
function norm42(s){return String(s||'').replace(/[\s，,；;、。.()（）\/]/g,'');}
function body42(w,t){const k=k42(w),D=d41(w);let body='';
 if(t===0){const mean=w.core?w.coreMean.replace(/^\S+\.\s*/,''):w.mean;const kt=(k?.t||[]).filter(x=>!norm42(mean).includes(norm42(x[1]))&&!norm42(x[1]).includes(norm42(mean)));const other=!k&&w.other&&norm42(w.other)!==norm42(w.pos+mean)&&!norm42(w.other).includes(norm42(mean))?w.other:'';
  body=`<div class="c39-mean"><span class="c39-pos">${esc(w.pos)}</span> ${esc(mean)}${w.core&&w.source==='personal'&&w.mean&&norm42(w.mean)!==norm42(mean)?`<div class="c39-ctx">本文语境义：${esc(w.mean)}</div>`:''}</div>${kt.length?`<div class="vl-page-label">其他义项</div>${kt.map(x=>`<p class="t41-p"><b>${esc(x[0])}.</b> ${esc(x[1])}</p>`).join('')}`:''}${other?`<div class="vl-page-label">其他义项</div><p class="t41-p">${esc(other)}</p>`:''}${k?.rem?`<div class="vl-page-label">巧记</div><div class="vl-callout">${esc(k.rem)}</div>`:''}<details class="c39-more"><summary>我的注释${noteList(w,'general').length?' · '+noteList(w,'general').length:''}</summary>${notesHTML(w,'general')}</details>`;}
 else if(t===1){const cs=sents41(w),ex=k?.ex||[];body=`${cs.map(c=>`<div class="t41-sent"><div class="vl-page-label">${esc(c.from||'')} · 真题</div><div class="vl-sentence">${hl({...w,sent:c.sent})}</div>${c.cn?`<details><summary>看译文</summary><p class="vl-translation">${esc(c.cn)}</p></details>`:''}</div>`).join('')}${ex.map(x=>`<div class="t41-sent"><div class="vl-page-label">词典例句</div><div class="vl-sentence">${hl({...w,sent:x[0]})}</div><details><summary>看译文</summary><p class="vl-translation">${esc(x[1])}</p></details></div>`).join('')}`||'<p class="vl-tiny">暂无例句。</p>';}
 else if(t===2){const x=D.x,seen=(w.surface||[]).filter(s=>s!==w.w);body=`${x?`<div class="vl-page-label">词形变化</div><div class="t41-forms">${String(x).split('·').map(s=>`<span>${esc(s.trim())}</span>`).join('')}</div>`:'<p class="vl-tiny">这个词没有常见的变形。</p>'}${seen.length?`<div class="vl-page-label" style="margin-top:14px">真题里出现过的形式</div><div class="t41-forms">${seen.map(s=>`<span>${esc(s)}</span>`).join('')}</div>`:''}`;}
 else if(t===3){const seen=new Set(),ps=[...(w.phrase?[[w.phrase,w.phraseCn||'']]:[]),...(k?.ph||[]),...phr41(w)].filter(p=>{const key=p[0].toLowerCase();if(seen.has(key))return false;seen.add(key);return true;}).slice(0,12);body=ps.length?`<div class="vl-family">${ps.map(p=>`<div class="vl-family-item"><strong>${esc(p[0])}</strong><span>${esc(p[1])}</span></div>`).join('')}</div>`:'<p class="vl-tiny">暂无常用短语。</p>';}
 else if(t===4){const rel=(k?.rel||[]).flatMap(r=>r[1].map(x=>[x[0],(r[0]?r[0]+'. ':'')+x[1]]));const fs=rel.length?rel:fam41(w);body=`${w.root?`<div class="vl-callout">${esc(w.root)}</div>`:''}${k?.rem&&!w.root?`<div class="vl-callout">${esc(k.rem)}</div>`:''}${fs.length?`<div class="vl-family">${fs.map(x=>`<div class="vl-family-item"><strong>${esc(x[0])}</strong><span>${esc(x[1])}</span></div>`).join('')}</div>`:'<p class="vl-tiny">暂无同根词。</p>'}`;}
 else{const syn=k?.syn||[];body=`${syn.length?`<div class="vl-page-label">同近义</div><div class="vl-family">${syn.map(s=>`<div class="vl-family-item"><strong>${esc(s[2].join(', '))}</strong><span>${esc((s[0]?s[0]+'. ':'')+s[1])}</span></div>`).join('')}</div>`:''}${(w.confuse||[]).length?`<div class="vl-page-label" style="margin-top:12px">易混</div><div class="vl-family">${w.confuse.map(x=>`<div class="vl-family-item"><strong>${esc(x[0])}</strong><span>${esc(x[1])}</span></div>`).join('')}</div>`:''}${w.compare?`<div class="vl-callout">${esc(w.compare)}</div>`:''}${!syn.length&&!(w.confuse||[]).length?'<p class="vl-tiny">暂无同近义词。</p>':''}${notesHTML(w,'confuse')}`;}
 return body;}
function have42(w){const k=k42(w)||{};return [true,sents41(w).length+(k.ex||[]).length>0,!!(d41(w).x||(w.surface||[]).some(x=>x!==w.w)),!!(w.phrase||(k.ph||[]).length||phr41(w).length),!!(w.root||(k.rel||[]).length||fam41(w).length),!!((k.syn||[]).length||(w.confuse||[]).length||noteList(w,'confuse').length)];}
function tabbar42(w,t,act){const h=have42(w);return `<div class="t41-bar" role="tablist">${TABS41.map((x,i)=>`<button class="t41-tab${i===t?' on':''}${h[i]?'':' empty'}" data-action="${act}" data-tab="${i}" data-id="${esc(w.id)}" role="tab" aria-selected="${i===t}">${x}</button>`).join('')}</div>`;}
tabContent=function(w){const t=state.tab41||0;return tabbar42(w,t,'tab')+`<div class="t41-body">${body42(w,t)}</div>`;};
// 词库展开 = 同一张卡片内容
state.libTab42=state.libTab42||{};
library=(()=>{const prev=library;return function(){let h=prev();return h;};})();
const render42b=render;
render=function(){render42b();if(state.stage!=='library')return;main.querySelectorAll('.vl-library-items > details').forEach(d=>{const w=word42(d.querySelector('summary')?.childNodes[0]?.textContent?.trim());if(!w)return;d.dataset.id=w.id;const keep=d.querySelector('summary').outerHTML;const btn=`<div class="lib42-acts"><button class="vl-button" data-action="speak39" data-id="${esc(w.id)}">♪ 发音</button><button class="vl-link" data-action="relearn" data-id="${esc(w.id)}">留到下次复习</button></div>`;const t=(state.libTab42||={})[w.id]||0;d.innerHTML=keep+`<div class="lib42">${tabbar42(w,t,'lib-tab')}<div class="t41-body">${body42(w,t)}</div>${btn}</div>`;if(state.libOpen42===w.id)d.open=true;});};
function word42(id){return CATALOG.find(w=>w.id===id||w.w===id);}
root.addEventListener('click',e=>{const b=e.target.closest('[data-action="lib-tab"]');if(!b)return;e.stopImmediatePropagation();(state.libTab42||={})[b.dataset.id]=+b.dataset.tab;state.libOpen42=b.dataset.id;const y=window.scrollY;render();window.scrollTo(0,y);},true);
// 公告区不再在页面底部显示“待同步”等字样

// ===== v43：筛词默认回到“一组 10 个”的列表；近义与易混分开；词库发音放在单词旁 =====
if(!state.v43list){state.quick39=false;state.v43list=true;}
const receive43=receive;receive=function(d){receive43(d);if(!state.v43list){state.quick39=false;state.showAll=true;state.v43list=true;save();render();}};
TABS41.splice(0,TABS41.length,'释义','原句','词形','短语','同根','近义','易混');
function lev43(a,b){if(Math.abs(a.length-b.length)>2)return 9;const m=a.length,n=b.length;let prev=Array.from({length:n+1},(_,j)=>j);for(let i=1;i<=m;i++){const cur=[i];let best=i;for(let j=1;j<=n;j++){cur[j]=Math.min(prev[j]+1,cur[j-1]+1,prev[j-1]+(a[i-1]===b[j-1]?0:1));best=Math.min(best,cur[j]);}if(best>2)return 9;prev=cur;}return prev[n];}
const easy43Cache={};
function easy43(w){const id=w.id;if(easy43Cache[id])return easy43Cache[id];const out=(w.confuse||[]).map(x=>[x[0],x[1]]);if(typeof DICT!=='undefined'&&!id.includes(' ')&&id.length>=4){const fam=new Set(fam41(w).map(x=>x[0]));const lim=id.length<=5?1:2;const c=[];for(const k of Object.keys(DICT)){if(k===id||k.includes(' ')||fam.has(k))continue;const d=DICT[k];if(!d||d.l===id||!/(ky|cet4|cet6)/.test(d.g||''))continue;if(DICT[id]?.l===k)continue;if(k.slice(0,4)===id.slice(0,4)&&Math.abs(k.length-id.length)>1)continue;const dist=lev43(id,k);if(dist<=lim)c.push([dist,k]);}c.sort((a,b)=>a[0]-b[0]);for(const [,k] of c.slice(0,6))if(!out.some(x=>x[0]===k))out.push([k,String(DICT[k].t||'').split('\n')[0].slice(0,40)]);}return easy43Cache[id]=out;}
const body43=body42;
body42=function(w,t){if(t<5)return body43(w,t);const k=k42(w);
 if(t===5){const syn=k?.syn||[];return syn.length?`<div class="vl-family">${syn.map(s=>`<div class="vl-family-item"><strong>${esc(s[2].join(', '))}</strong><span>${esc((s[0]?s[0]+'. ':'')+s[1])}</span></div>`).join('')}</div>${w.compare?`<div class="vl-callout">${esc(w.compare)}</div>`:''}`:'<p class="vl-tiny">暂无同近义词。</p>';}
 const e=easy43(w);return `<p class="vl-tiny" style="margin:0 0 8px">长得像、容易看错的词</p>${e.length?`<div class="vl-family">${e.map(x=>`<div class="vl-family-item"><strong>${esc(x[0])}</strong><span>${esc(x[1])}</span></div>`).join('')}</div>`:'<p class="vl-tiny">没找到拼写相近的常考词。</p>'}${notesHTML(w,'confuse')}`;};
have42=(()=>{const prev=have42;return w=>{const h=prev(w),k=k42(w)||{};return [h[0],h[1],h[2],h[3],h[4],!!(k.syn||[]).length,true];};})();
// 词库：发音按钮放在单词旁
const render43=render;
render=function(){render43();if(state.stage!=='library')return;main.querySelectorAll('.vl-library-items > details').forEach(d=>{d.querySelector('.lib42-acts [data-action="speak39"]')?.remove();const s=d.querySelector('summary');if(s&&!s.querySelector('.lib43-say'))s.insertAdjacentHTML('beforeend',`<button class="lib43-say" data-action="speak39" data-id="${esc(d.dataset.id||'')}" aria-label="发音">♪</button>`);});};
root.addEventListener('click',e=>{const b=e.target.closest('.lib43-say');if(!b)return;e.preventDefault();e.stopImmediatePropagation();speak(word(b.dataset.id)||CATALOG.find(w=>w.id===b.dataset.id),true);},true);

// ===== v44：筛词／单词卡／词库都能搜词、跳有道；同根页总显示巧记（词根拆解） =====
function yd44(w){return `https://dict.youdao.com/result?word=${encodeURIComponent(w)}&lang=en`;}
function ydBtn44(w){return `<a class="yd44" href="${yd44(w)}" target="_blank" rel="noopener" title="在网易有道查看更多">有道 ↗</a>`;}
const body44=body42;
body42=function(w,t){let h=body44(w,t);if(t===4){const k=k42(w);if(k?.rem&&w.root&&!h.includes(esc(k.rem)))h=`<div class="vl-page-label">巧记／词根拆解</div><div class="vl-callout">${esc(k.rem)}</div>`+h;else if(k?.rem)h=h.replace(`<div class="vl-callout">${esc(k.rem)}</div>`,`<div class="vl-page-label">巧记／词根拆解</div><div class="vl-callout">${esc(k.rem)}</div>`);if(!k?.rem&&!w.root)h='<p class="vl-tiny" style="margin:0 0 8px">这个词暂时没有现成的词根拆解，可点右上角“有道 ↗”看更多。</p>'+h;}return h;};
const render44=render;
render=function(){render44();if(!ready||state.stage==='home39')return;
 const tb=main.querySelector('.tb42');if(tb&&!tb.querySelector('.s44')){tb.querySelector('.tb42-time')?.insertAdjacentHTML('beforebegin',`<form class="s44"><input type="search" placeholder="搜词" value="${state.stage==='library'?esc(state.search||''):''}" aria-label="搜词"></form>`);}
 if(state.stage==='cards'){const w=current(),head=main.querySelector('.vl-word-head');if(w&&head&&!head.querySelector('.yd44'))head.querySelector('.vl-audio')?.insertAdjacentHTML('beforebegin',ydBtn44(w.w));}
 if(state.stage==='screen'){main.querySelectorAll('.vl-row').forEach(r=>{const id=r.dataset.row,top=r.querySelector('.vl-row-actions');if(top&&!top.querySelector('.yd44'))top.insertAdjacentHTML('afterbegin',ydBtn44(id));});const q=main.querySelector('.q39-word');if(q&&!main.querySelector('.q39-pron .yd44'))main.querySelector('.q39-pron')?.insertAdjacentHTML('beforeend',ydBtn44(q.textContent));}
 if(state.stage==='library'){main.querySelector('#v26-search')?.remove();main.querySelectorAll('.vl-library-items > details > summary').forEach(s=>{if(!s.querySelector('.yd44'))s.insertAdjacentHTML('beforeend',ydBtn44(s.parentElement.dataset.id||s.childNodes[0]?.textContent?.trim()));});}};
root.addEventListener('submit',e=>{const f=e.target.closest('.s44');if(!f)return;e.preventDefault();openSearch44(f.querySelector('input').value.trim());});
root.addEventListener('input',e=>{if(!e.target.closest('.s44')||state.stage!=='library')return;state.search=e.target.value;const pos=e.target.selectionStart;render();const el=main.querySelector('.s44 input');el?.focus();el?.setSelectionRange(pos,pos);});
function openSearch44(q){if(state.stage==='cards'||state.stage==='context')state.stage0=state.stage;state.prev44=state.stage;state.search=q;state.libraryFilter='all';state.stage='library';save();render();const hit=CATALOG.find(w=>w.id===q.toLowerCase());if(hit){state.libOpen42=hit.id;render();}else if(q&&!main.querySelector('.vl-library-items > details'))main.querySelector('.vl-library-items')?.insertAdjacentHTML('afterbegin',`<p class="vl-tiny">词库里没有「${esc(q)}」。<a href="${yd44(q)}" target="_blank" rel="noopener">去有道查 ↗</a></p>`);setTimeout(()=>{const el=main.querySelector('.s44 input');el?.focus();},0);}
root.addEventListener('click',e=>{if(e.target.closest('.yd44'))e.stopPropagation();},true);

// ===== v45：词根／词缀用 DictionaryByGPT4 补全；有道只留在单词卡 =====
function g45(w){return (typeof GROOT!=='undefined'&&GROOT[w.id])||null;}
const body45=body42;
body42=function(w,t){if(t!==4)return body45(w,t);const k=k42(w),g=g45(w);const rel=(k?.rel||[]).flatMap(r=>r[1].map(x=>[x[0],(r[0]?r[0]+'. ':'')+x[1]]));const fs=rel.length?rel:fam41(w);
 const blocks=[];if(w.root)blocks.push(['词根',w.root]);if(k?.rem)blocks.push(['巧记',k.rem]);if(g?.root)blocks.push(['词根分析',g.root]);if(g?.affix)blocks.push(['词缀分析',g.affix]);if(g?.mem&&!k?.rem)blocks.push(['记忆辅助',g.mem]);
 return `${blocks.map(b=>`<div class="vl-page-label">${b[0]}${/分析|记忆辅助/.test(b[0])?' · AI 整理，供参考':''}</div><div class="vl-callout r45">${esc(b[1])}</div>`).join('')}${!blocks.length?'<p class="vl-tiny">这个词暂时没有词根拆解，可点上方“有道 ↗”看更多。</p>':''}${fs.length?`<div class="vl-page-label" style="margin-top:12px">同根词</div><div class="vl-family">${fs.map(x=>`<div class="vl-family-item"><strong>${esc(x[0])}</strong><span>${esc(x[1])}</span></div>`).join('')}</div>`:''}`;};
const have45=have42;have42=w=>{const h=have45(w);h[4]=h[4]||!!g45(w);return h;};
const render45=render;
render=function(){render45();if(state.stage!=='cards')main.querySelectorAll('.yd44').forEach(e=>e.remove());};
// v46：有道链接放在分页标签的最右边（单词卡和词库展开一致）
const tb46=tabbar42;
tabbar42=function(w,t,act){return tb46(w,t,act).replace(/<\/div>$/,`<a class="yd44 yd46" href="${yd44(w.w)}" target="_blank" rel="noopener">有道 ↗</a></div>`);};
const render46=render;
render=function(){render46();main.querySelectorAll('.yd44:not(.yd46)').forEach(e=>e.remove());};

// ===== v47：单词卡展开后，核心释义固定在单词下方，切换分页时一直可见 =====
function mean47(w){return w.core?w.coreMean.replace(/^\S+\.\s*/,''):w.mean;}
const tab47=tabContent;
tabContent=function(w){let h=tab47(w);if((state.tab41||0)===0)h=h.replace(/<div class="c39-mean">[\s\S]*?<\/div>(?=<div class="vl-page-label">|<details|$)/,m=>{const ctx=m.match(/<div class="c39-ctx">[\s\S]*?<\/div>/);return ctx?ctx[0]:'';});return h;};
const render47=render;
render=function(){render47();if(state.stage!=='cards'||!state.flip)return;const w=current(),p=main.querySelector('.vl-pron');if(w&&p&&!main.querySelector('.m47'))p.insertAdjacentHTML('afterend',`<div class="m47"><span class="c39-pos">${esc(w.pos)}</span> ${esc(mean47(w))}</div>`);};
