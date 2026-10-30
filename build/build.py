import json,sys,re,subprocess,os
B=os.path.dirname(os.path.abspath(__file__))
ROOT=os.path.dirname(B)
src=os.path.join(ROOT,'index.html')
base=subprocess.run(['git','-C',ROOT,'show','e0d140d:index.html'],capture_output=True).stdout.decode('utf-8')
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
inj='<style>'+css+'</style>\n<script>\nconst SKEL36='+json.dumps(skel,ensure_ascii=False,separators=(',',':')).replace('</','<\\/')+';\nconst QC36='+json.dumps(qc,ensure_ascii=False,separators=(',',':')).replace('</','<\\/')+';\nconst CORE926='+json.dumps(core,ensure_ascii=False,separators=(',',':'))+';\nconst CORE926CAT='+corecat.replace('</','<\\/')+';\nconst KDICT='+kdict.replace('</','<\\/')+';\nconst GROOT='+groot.replace('</','<\\/')+';\nconst QTR37='+json.dumps(qtr,ensure_ascii=False,separators=(',',':'))+';\nfor(const [tid,qs] of Object.entries(QTR37))QTR[tid]=Object.assign(QTR[tid]||{},qs);\n'+qjs+js+'\n'+open(os.path.join(B,'src','v39host.js')).read()+'\n</script>\n'
i=s.rfind('</body>')
s=s[:i]+inj+s[i:]
open(src,'w',encoding='utf-8').write(s)
print('written',len(s))
