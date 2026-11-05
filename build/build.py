import json,sys,re,subprocess,os,glob
B=os.path.dirname(os.path.abspath(__file__))
ROOT=os.path.dirname(B)
src=os.path.join(ROOT,'index.html')
base=open(os.path.join(B,'base_v35.html'),encoding='utf-8').read()  # v35（提交 e0d140d）的页面，作为生成底稿
s=base
def rep(old,new,count=1):
    global s
    n=s.count(old)
    assert n==count, (old[:80],n)
    s=s.replace(old,new)
rep('#view-sent>*:not(#sr27-frame){display:none!important}','')
rep('window.innerHeight-g.getBoundingClientRect().top-18','(window.visualViewport?window.visualViewport.height:window.innerHeight)-(g.getBoundingClientRect().top+window.scrollY)-18')
rep('font:600 10px/1 sans-serif;color:var(--accent)">v35</small>','font:600 10px/1 sans-serif;color:var(--accent)">v50</small>')
rep('<span>点词看释义 · 拖选或点「划短语」存短语 · 点句子编号看拆解</span>','<span>点词看释义 · 拖选两个以上的词存短语 · 点句子编号看拆解</span>')
# ---- v50 查词修复：完整 ECDICT 补词、变形词还原原形、短语按原形查（数据由 tools/make_ecdict_ext.py 生成）----
_ecx=open(os.path.join(B,'data','ecdict_ext.json'),encoding='utf-8').read()
_k='\nconst PHD = '; _i=s.find(_k); assert _i>0 and s.count(_k)==1
_, _e=json.JSONDecoder().raw_decode(s,_i+len(_k)); assert s[_e]==';'
s=s[:_e+1]+'\nconst ECX='+_ecx.replace('</','<\\/')+';\nObject.assign(DICT,ECX.w);\nconst PHX=ECX.ph;'+s[_e+1:]
rep("function phraseInfo(tid, loc, a, b){","function phLook(key){ if(!key) return null; const lk = key.split(' ').map(w => (DICT[w] && DICT[w].l) || w).join(' '); return PHD[key] || PHX[key] || PHD[lk] || PHX[lk] || null; }\nfunction phraseInfo(tid, loc, a, b){")
rep("const out = { known: best || null, others: ks.filter(k => k !== best), dict: PHD[key] || null, subs: [] };","const out = { known: best || null, others: ks.filter(k => k !== best), dict: phLook(key), subs: [] };")
rep("const k2 = toks.slice(i, i + len + 1).map(clean).filter(Boolean).join(' '); if(PHD[k2] && !out.subs.some(x => x.k === PHD[k2].k)) out.subs.push(Object.assign({ a: i, b: i + len }, PHD[k2])); }","const k2 = toks.slice(i, i + len + 1).map(clean).filter(Boolean).join(' '); const d2 = phLook(k2); if(d2 && !out.subs.some(x => x.k === d2.k)) out.subs.push(Object.assign({ a: i, b: i + len }, d2)); }")
rep("  const parts = toks.slice(a, b + 1)","  if(!info.known && !info.dict) meanHtml += `<div class=\"u\"><a href=\"https://dict.youdao.com/result?word=${encodeURIComponent(text)}&lang=en\" target=\"_blank\" rel=\"noopener\" style=\"color:var(--accent)\">本地词典没有整段，去有道查「${esc(text)}」↗</a></div>`;\n  const parts = toks.slice(a, b + 1)")
rep("本地词典没收录这个词（多半是人名或合成词）。","本地词典没收录这个词（多为人名、地名，或原文里和标点粘在一起的词）。",2)
skel=json.load(open(os.path.join(B,'data','skel.json')))
# QCHOICE overrides
try:
    qc={}
    for _f in sorted(glob.glob(os.path.join(B,'data','qchoice*.json'))):
        for _t,_q in json.load(open(_f,encoding='utf-8')).items(): qc.setdefault(_t,{}).update(_q)
except FileNotFoundError: qc={}

# ---- 新增真题年份（2023–2026 等）：build/data/papers/<年份>.json ----
# P5: keep the existing navigation; refresh only its stale year/score copy.
rep('<span>2015—2022</span>', '<span>2015—2026</span>')
rep('<span>2015—2022 · 答题 / 精读</span>', '<span>2015—2026 · 答题 / 精读</span>')
rep('当前每卷覆盖 70 分', '当前每卷覆盖 75 分')
papers={}
for f in sorted(glob.glob(os.path.join(B,'data','papers','*.json'))):
    papers[os.path.splitext(os.path.basename(f))[0]]=json.load(open(f,encoding='utf-8'))
if papers:
    early='const PAPERS='+json.dumps(papers,ensure_ascii=False,separators=(',',':')).replace('</','<\\/')+';\n'+"""for(const [y,p] of Object.entries(PAPERS)){
 if(p.reading&&p.reading.length){let e=DATA.find(x=>String(x.year)===String(y));if(!e){e={year:+y,texts:[]};DATA.push(e);DATA.sort((a,b)=>a.year-b.year);}for(const t of p.reading){if(!e.texts.some(x=>x.id===t.id))e.texts.push(t);}}
 for(const k of ['EXAM_DATA','WRITING_CHARTS'])if(p[k])Object.assign({EXAM_DATA,WRITING_CHARTS}[k],p[k]);
 for(const k of ['ANN','ANN2','QTR','QCHOICE'])if(p[k])for(const [id,v] of Object.entries(p[k])){const o={ANN,ANN2,QTR,QCHOICE}[k];o[id]=Object.assign(o[id]||{},v);}
}
"""
    marker='const TEXTS = DATA.flatMap'
    assert s.count(marker)==1
    s=s.replace(marker,early+marker)
    late="""for(const [y,p] of Object.entries(PAPERS)){for(const k of ['CLOZE_STUDY','NEWTYPE_STUDY','TRANSLATION_STUDY'])if(p[k])Object.assign({CLOZE_STUDY,NEWTYPE_STUDY,TRANSLATION_STUDY}[k],p[k]);}\n"""
    # Register new special-paper sentences in the same indexes used by existing years.
    late+="""for(const [y,p] of Object.entries(PAPERS)){
 const kinds=[['cloze','完型'],['newtype','新题型'],['translation','翻译']];
 for(const [kind,label] of kinds){
  const id=`special-${y}-${kind}`,sentences={};let paragraphs=[];
  if(kind==='cloze'){
   paragraphs=[spFillCloze(EXAM_DATA[y].cloze)];
   splitSentences(paragraphs[0]).forEach((text,i)=>sentences[`0:${i}`]={text,cn:'暂无'});
  }else if(kind==='newtype'){
   for(const [pi,block] of NEWTYPE_STUDY[y].blocks.entries()){
    const previous=new Map(block.sentences.map(s=>[s.text,s.cn]));
    block.sentences=splitSentences(block.text).map((text,si)=>{
     const key=`${pi}:${si}`,s={key,text,cn:previous.get(text)||'暂无',tokenKeys:text.split(' ').map((_,i)=>`${key}:${i}`)};
     sentences[key]={text,cn:s.cn};return s;
    });paragraphs.push(block.text);
   }
  }else{
   const data=TRANSLATION_STUDY[y];paragraphs=[data.sentences.map(s=>s.text).join(' ')];
   for(const s of data.sentences)sentences[s.key]={text:s.text,cn:s.cn};
   PARSE2[id]=Object.fromEntries(data.sentences.map(s=>[s.key,s]));SPECIAL_PARSE[id]=PARSE2[id];PHR[id]=data.phrases;
  }
  byId[id]={id,label:`${y} · ${label}`,paragraphs,questions:[]};
  ANN[id]={...(ANN[id]||{}),trans:[],vocab:[],kw:[]};
  for(const [key,s] of Object.entries(sentences)){const [pi,si]=key.split(':').map(Number);(ANN[id].trans[pi]||=[])[si]=s.cn;}
  if(kind!=='translation'){STUDY_V17[id]={label:`${y} · ${label}`,sentences};SPECIAL_PARSE[id]||={};PARSE2[id]=SPECIAL_PARSE[id];}
 }
}
"""
else:
    late=''

# P3 sentence translations live beside their manually authored analyses.
# Update the existing data indexes before the unchanged renderers read them.
late+="""for(const [full,sk] of Object.entries(SKEL36)){
 if(!sk.cn||!full.startsWith('special-'))continue;
 const [id,key]=full.split('|'),[pi,si]=key.split(':').map(Number),[,year,kind]=id.split('-');
 if(ANN[id])((ANN[id].trans[pi]||=[])[si]=sk.cn);
 if(STUDY_V17[id]?.sentences[key])STUDY_V17[id].sentences[key].cn=sk.cn;
 for(const index of [PARSE2,SPECIAL_PARSE])if(index[id]?.[key])index[id][key].cn=sk.cn;
 if(kind==='newtype'){
  const block=NEWTYPE_STUDY[year]?.blocks[pi],sentence=block?.sentences.find(s=>s.key===key);
  if(sentence)sentence.cn=sk.cn;
 }else if(kind==='translation'){
  const sentence=TRANSLATION_STUDY[year]?.sentences.find(s=>s.key===key);if(sentence)sentence.cn=sk.cn;
 }
}
for(const year of Object.keys(PAPERS))for(const block of NEWTYPE_STUDY[year]?.blocks||[]){
 if(block.sentences.length&&block.sentences.every(s=>s.cn&&s.cn!=='暂无'))block.cn=block.sentences.map(s=>s.cn).join(' ');
}
"""

# Source-backed reading corrections share the data-import stage; the v35 base stays immutable.
sys.dont_write_bytecode=True
from tools.original_fixes import apply_original_fixes, special_index_patch
s=apply_original_fixes(s,B)
late+=special_index_patch(B)

# P6: user-requested writing entry, guide data, and local drafting adapter.
from tools.writing_p6 import apply_writing_p6
s,writing_late=apply_writing_p6(s,B)
late+=writing_late

css=open(os.path.join(B,'src','g36.css')).read()
qtr={}
for _f in sorted(glob.glob(os.path.join(B,'data','qtr*.json'))):
    for _t,_q in json.load(open(_f,encoding='utf-8')).items(): qtr.setdefault(_t,{}).update(_q)
core=json.load(open(os.path.join(B,'data','core926.json')))
# v39: vocab doc patch
k='const V26_DOCUMENT='
i0=s.find(k)+len(k)
docstr,e0=json.JSONDecoder().raw_decode(s,i0)
assert "tell('ready');\n\nrender();setInterval(tick,1000);" in docstr
docstr=docstr.replace("tell('ready');\n\nrender();setInterval(tick,1000);",open(os.path.join(B,'src','v39doc.js')).read()+"\ntell('ready');\n\nrender();setInterval(tick,1000);")
j=docstr.rfind('<script>')
docstr=docstr[:j]+'<style>'+open(os.path.join(B,'src','v39doc.css')).read()+'</style>'+docstr[j:]
s=s[:i0]+json.dumps(docstr,ensure_ascii=False).replace('</','<\\/')+s[e0:]
corecat=open(os.path.join(B,'data','core926cat.json')).read()
kdict=open(os.path.join(B,'data','kdict.json')).read()
groot=open(os.path.join(B,'data','gptroot.json')).read()
js=open(os.path.join(B,'src','g36.js')).read()
qjs=''
if qc:
    qjs='for(const [tid,qs] of Object.entries(QC36))QCHOICE[tid]=Object.assign(QCHOICE[tid]||{},qs);\n'
inj='<style>'+css+'</style>\n<script>\nconst SKEL36='+json.dumps(skel,ensure_ascii=False,separators=(',',':')).replace('</','<\\/')+';\nconst QC36='+json.dumps(qc,ensure_ascii=False,separators=(',',':')).replace('</','<\\/')+';\nconst CORE926='+json.dumps(core,ensure_ascii=False,separators=(',',':'))+';\nconst CORE926CAT='+corecat.replace('</','<\\/')+';\nconst KDICT='+kdict.replace('</','<\\/')+';\nconst GROOT='+groot.replace('</','<\\/')+';\nconst QTR37='+json.dumps(qtr,ensure_ascii=False,separators=(',',':'))+';\nfor(const [tid,qs] of Object.entries(QTR37))QTR[tid]=Object.assign(QTR[tid]||{},qs);\n'+qjs+late+js+'\n'+open(os.path.join(B,'src','v39host.js')).read()+'\n</script>\n'
i=s.rfind('</body>')
s=s[:i]+inj+s[i:]
open(src,'w',encoding='utf-8').write(s)
print('written',len(s))
