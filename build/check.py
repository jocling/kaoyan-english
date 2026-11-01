"""交付前检查：python3 build/check.py [--content]
--content：按 REVIEW.md 的已授权内容/审核范围检查；HANDOFF 只许 §9。"""
import json,os,re,subprocess,sys,glob,hashlib
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
# 3 范围：REVIEW.md 记载的 10-30 授权；本次另获准补齐新年份导入器。
def changed_inside(path, start, end):
    old=subprocess.run(['git','-C',ROOT,'show','HEAD:'+path],capture_output=True,text=True,check=True).stdout
    new=open(os.path.join(ROOT,path),encoding='utf-8').read()
    def bounds(t):
        lines=t.splitlines();a=next(i for i,l in enumerate(lines,1) if l.startswith(start));b=next(i for i,l in enumerate(lines,1) if i>a and l.startswith(end));return a,b
    oa,ob=bounds(old);na,nb=bounds(new)
    diff=subprocess.run(['git','-C',ROOT,'diff','HEAD','--unified=0','--',path],capture_output=True,text=True,check=True).stdout
    for m in re.finditer(r'^@@ -(\d+)(?:,(\d+))? \+(\d+)(?:,(\d+))? @@',diff,re.M):
        ol,oc,nl,nc=map(int,(m[1],m[2] if m[2] is not None else 1,m[3],m[4] if m[4] is not None else 1))
        # Count-zero hunks insert after the indicated old line (or delete after new line).
        if oc and not (oa<ol and ol+oc<=ob):return False
        if nc and not (na<nl and nl+nc<=nb):return False
        if not oc and not (oa<=ol<ob):return False
        if not nc and not (na<=nl<nb):return False
    return True
# 用户本轮明确授权的一次性修订：必须显式启用，绑定 HEAD 和精确补丁。
# 该记录不是永久白名单；不得在后续任务自行更新它以绕过范围检查。
def p2_revision_authorization():
    if '--p2-authorized-revision' not in sys.argv:return {}
    try:
        record=json.load(open(os.path.join(ROOT,'review','P2-一次性范围授权.json'),encoding='utf-8'))
        head=subprocess.run(['git','-C',ROOT,'rev-parse','HEAD'],capture_output=True,text=True,check=True).stdout.strip()
        if record.get('head')!=head or set(record.get('files',{}))!={'build/check.py','build/build.py'}:
            raise ValueError('授权的提交或文件范围不匹配')
        verified={}
        for path,expected in record['files'].items():
            actual=hashlib.sha256(open(os.path.join(ROOT,path),'rb').read()).hexdigest()
            patch=subprocess.run(['git','-C',ROOT,'diff','HEAD','--binary','--',path],capture_output=True,check=True).stdout
            if actual!=expected['sha256'] or hashlib.sha256(patch).hexdigest()!=expected['patch_sha256']:
                raise ValueError(path+' 不再是本次已授权的精确改动')
            verified[path]=True
        print('本次显式授权核对通过：两份文件、HEAD、文件内容和补丁均匹配；非永久放行')
        return verified
    except (OSError,ValueError,KeyError,subprocess.CalledProcessError) as e:
        fail('一次性授权无效：'+str(e));return {}
if '--content' in sys.argv:
    authorized=p2_revision_authorization()
    ch=subprocess.run(['git','-C',ROOT,'status','--porcelain=v1','-z'],capture_output=True,text=True,check=True).stdout.split('\0')
    for l in ch:
        if not l:continue
        f=l[3:]
        allowed=f.startswith(('build/skel/','build/data/','build/tools/','review/')) or f in {'index.html','进度.csv','REVIEW.md'}
        if f=='HANDOFF.md':allowed=changed_inside(f,'## 9.','## 10.')
        if f=='build/build.py':allowed=changed_inside(f,'# ---- 新增真题年份','css=open')
        if not allowed and authorized.get(f) is True:allowed=True
        if not allowed:fail(f'内容任务不许改：{f}')
print('\n'+('全部通过' if not bad else f'{bad} 项未通过——不要交付'));sys.exit(1 if bad else 0)
