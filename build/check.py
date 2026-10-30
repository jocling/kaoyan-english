"""交付前检查：python3 build/check.py [--content]
--content：内容任务（补拆解/译文/错因）只允许改 build/skel 和 build/data，改了别的直接失败。"""
import json,os,re,subprocess,sys,glob
B=os.path.dirname(os.path.abspath(__file__));ROOT=os.path.dirname(B);bad=0
def fail(m):
    global bad;bad+=1;print('FAIL',m)
# 1 拆解格式
r=subprocess.run([sys.executable,os.path.join(B,'parse_skel.py')],capture_output=True,text=True);print(r.stdout.strip().splitlines()[0] if r.stdout else r.stderr)
if ' 0 errors' not in r.stdout: fail('parse_skel 有错误：\n'+r.stdout)
skel=json.load(open(os.path.join(B,'data','skel.json')))
for k,v in skel.items():
    for c in v['clauses']:
        if len(c.get('judge',''))<12: fail(f'{k} {c["id"]} 缺“连接词与判断”理由')
    if not v.get('gist'): fail(f'{k} 缺 gist')
    for g in v['main']:
        for p in g['parts']:
            if p.get('rg') and p['r']=='谓语' and re.fullmatch(r'[A-Za-z-]+(ing|ed)',p['t'].strip()) and p['t'].strip().endswith('ing'): fail(f'{k} 谓语“{p["t"]}”是 -ing 却没有助动词')
# 2 题目译文 / 错因
BAN=['定位句真正支持的是','该项的关键问题是','因为A正确','故其他','其余选项均']
for f in glob.glob(os.path.join(B,'data','qchoice*.json')):
    for tid,qs in json.load(open(f)).items():
        for n,opts in qs.items():
            if set(opts)!={'A','B','C','D'}: fail(f'{os.path.basename(f)} {tid} 第{n}题 选项不全')
            for k,t in opts.items():
                if any(b in t for b in BAN): fail(f'{tid} 第{n}题 {k} 用了模板句')
                if len(t)<25: fail(f'{tid} 第{n}题 {k} 解析过短')
for f in glob.glob(os.path.join(B,'data','qtr*.json')):
    for tid,qs in json.load(open(f)).items():
        for n,q in qs.items():
            if set(q)!={'stem','A','B','C','D'}: fail(f'{os.path.basename(f)} {tid} 第{n}题 译文不全')
# 3 范围
if '--content' in sys.argv:
    ch=subprocess.run(['git','-C',ROOT,'status','--porcelain'],capture_output=True,text=True).stdout.split('\n')
    for l in ch:
        f=l[3:].strip()
        if f and not (f.startswith('build/skel/') or f.startswith('build/data/') or f=='index.html'): fail(f'内容任务不许改：{f}')
print('\n'+('全部通过' if not bad else f'{bad} 项未通过——不要交付'));sys.exit(1 if bad else 0)
