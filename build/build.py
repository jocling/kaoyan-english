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
rep('font:600 10px/1 sans-serif;color:var(--accent)">v35</small>','font:600 10px/1 sans-serif;color:var(--accent)">v47</small>')
rep('<span>点词看释义 · 拖选或点「划短语」存短语 · 点句子编号看拆解</span>','<span>点词看释义 · 拖选两个以上的词存短语 · 点句子编号看拆解</span>')
skel=json.load(open(os.path.join(B,'data','skel.json')))
# QCHOICE overrides
try:
    qc=json.load(open(os.path.join(B,'data','qchoice2017.json')))
except FileNotFoundError: qc={}

# ---- 新增真题年份（2023–2026 等）：build/data/papers/<年份>.json ----
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
else:
    late=''

css=open(os.path.join(B,'src','g36.css')).read()
qtr=json.load(open(os.path.join(B,'data','qtr2017.json')))
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
