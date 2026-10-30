import json,re,sys,glob,os
B=os.path.dirname(os.path.abspath(__file__))
ALL=json.load(open(os.path.join(B,'data','all_sents.json')))
def norm(w): return re.sub(r"[^\w%$'-]","",w.lower().replace('’',"'")).strip("'")
def toks(s): return s.split(' ')
class Err(Exception): pass
def find_seq(T, piece, lo, hi, after=None):
    P=[norm(x) for x in piece.split(' ') if norm(x)]
    if not P: raise Err('empty piece '+piece)
    cands=[]
    for i in range(lo, hi+1):
        j=i; k=0
        while j<=hi and k<len(P):
            if not norm(T[j]): j+=1; continue
            if norm(T[j])!=P[k]: break
            j+=1;k+=1
        if k==len(P): cands.append((i,j-1))
    return cands
def locate(T, text, regions, near=None, occ=1):
    # text may contain … for gaps ; regions list of (lo,hi)
    pieces=[p.strip() for p in re.split(r'\s*…\s*|\s*\.\.\.\s*',text) if p.strip()]
    for lo,hi in regions:
        res=[];start=lo;ok=True
        for pc in pieces:
            c=find_seq(T,pc,start,hi)
            if not c: ok=False;break
            pick=c[min(occ,len(c))-1] if len(pieces)==1 else c[0]
            res.append(list(pick)); start=pick[1]+1
        if ok: return res
    raise Err(f'cannot find「{text}」')
def parse_parts(s):
    out=[]
    for seg in s.split('|'):
        seg=seg.strip()
        if not seg: continue
        r,_,t=seg.partition(':')
        if not _: raise Err('bad part '+seg)
        out.append((r.strip(),t.strip()))
    return out
def parse_block(key, lines, raw):
    T=toks(raw); n=len(T)
    d={'type':None,'chunks':[],'main':[],'gist':'','clauses':[],'mods':[]}
    for ln in lines:
        tag,_,rest=ln.partition(' '); rest=rest.strip()
        if tag=='type': d['type']=rest
        elif tag=='gist': d['gist']=rest
        elif tag in('point','remember','spot','cn'): d[tag]=rest
        elif tag=='chunks':
            items=re.findall(r'(.+?)〔([^〕]+)〕',rest)
            pos=0
            for txt,lab in items:
                w=txt.strip().split(' ')
                a=pos;b=pos+len(w)-1
                if [x for x in T[a:b+1]]!=w: raise Err(f'chunk mismatch at {a}: {" ".join(T[a:b+1])!r} vs {txt.strip()!r}')
                d['chunks'].append({'a':a,'b':b,'lab':lab.strip()}); pos=b+1
            if pos!=n: raise Err(f'chunks cover {pos}/{n}: missing「{" ".join(T[pos:])}」')
        elif tag=='main':
            groups=[g.strip() for g in rest.split('||')]
            conn=None
            for g in groups:
                if g.startswith('&'): conn=g[1:].strip(); continue
                d['main'].append({'conn':conn,'parts':parse_parts(g)}); conn=None
        elif re.fullmatch(r'C\d+',tag):
            f=[x.strip() for x in rest.split('|')]
            # kind | fn | conn | judge | parts...
            c={'id':tag,'kind':f[0],'fn':f[1],'conn':f[2],'judge':f[3],'parts':parse_parts('|'.join(f[4:])),'parent':None}
            m=re.match(r'(.*?)\s*\bin (C\d+)$',c['kind'])
            if m: c['kind']=m.group(1); c['parent']=m.group(2)
            d['clauses'].append(c)
        elif tag=='mod':
            m=re.match(r'(.+?)\s*→\s*(.+?)\s*\|\s*(.+?)\s*\|\s*(.+)$',rest)
            if not m: raise Err('bad mod '+rest)
            d['mods'].append({'t':m.group(1),'to':m.group(2),'role':m.group(3),'cn':m.group(4)})
        else: raise Err('unknown tag '+tag)
    if not d['chunks']: raise Err('no chunks')
    # spans
    lab_tokens={}
    for ch in d['chunks']:
        base=re.match(r'(C\d+|主|修|连)',ch['lab'])
        if not base: raise Err('bad chunk label '+ch['lab'])
        ch['base']=base.group(1)
        ch['owner']=re.match(r'(C\d+)',ch['lab']).group(1) if ch['lab'].startswith('C') else '主'
    cid={c['id']:c for c in d['clauses']}
    def kids(i): return [c['id'] for c in d['clauses'] if c['parent']==i]
    def span(i):
        a=min([ch['a'] for ch in d['chunks'] if ch['owner']==i]+[999]);b=max([ch['b'] for ch in d['chunks'] if ch['owner']==i]+[-1])
        for k in kids(i): x,y=span(k); a=min(a,x);b=max(b,y)
        if b<0: raise Err('no chunk for '+i)
        return a,b
    for c in d['clauses']:
        c['a'],c['b']=span(c['id'])
        own=[(ch['a'],ch['b']) for ch in d['chunks'] if ch['owner']==c['id']]
        c['parts']=[({'r':r,'t':t,'c':t} if re.fullmatch(r'C\d+',t) else {'r':r,'t':t,'rg':locate(T,t,own+[(c['a'],c['b'])])}) for r,t in c['parts']]
        if c['conn'] and c['conn'] not in('(that)','（省略 that）','—','无'):
            try: c['connRg']=locate(T,c['conn'].split('/')[0],[(c['a'],c['b'])])
            except Err: c['connRg']=None
    mainreg=[(ch['a'],ch['b']) for ch in d['chunks'] if ch['owner']=='主']+[(0,n-1)]
    for g in d['main']:
        np=[]
        for r,t in g['parts']:
            if re.fullmatch(r'C\d+',t):
                if t not in cid: raise Err('unknown clause ref '+t)
                np.append({'r':r,'t':t,'c':t})
            else: np.append({'r':r,'t':t,'rg':locate(T,t,mainreg)})
        g['parts']=np
        if g['conn']:
            g['connRg']=locate(T,g['conn'],[(0,n-1)])
    for m in d['mods']:
        occ=1;t=m['t']
        mm=re.match(r'(.*)#(\d)$',t)
        if mm: t=mm.group(1).strip();occ=int(mm.group(2));m['t']=t
        m['rg']=locate(T,t,[(0,n-1)],occ=occ)
        to=m['to']
        if to in('整句','全句','主句'): m['tg']=[]
        elif re.fullmatch(r'C\d+',to): m['tg']=[[cid[to]['a'],cid[to]['b']]]; m['to']='从句'+to[1:]
        else:
            a=m['rg'][0][0]
            cands=find_seq(T,to.split('…')[0].strip(),0,n-1)
            if not cands: raise Err(f'mod target 「{to}」 not found')
            out=[c for c in cands if c[1]<m['rg'][0][0] or c[0]>m['rg'][-1][1]] or cands
            best=min(out,key=lambda c:abs(c[0]-a))
            m['tg']=[list(best)] if '…' not in to else locate(T,to,[(0,n-1)])
    for ch in d['chunks']: del ch['owner']
    return d
def load(paths):
    out={};errs=[]
    for p in paths:
        cur=None;buf=[]
        def flush():
            if cur is None: return
            tid,k=cur.split('|')
            raw=ALL[tid][k][0]
            try: out[cur]=parse_block(cur,buf,raw)
            except Err as e: errs.append(f'{p.split("/")[-1]} {cur}: {e}\n    RAW: {raw}')
        for ln in open(p,encoding='utf-8'):
            ln=ln.rstrip('\n')
            if not ln.strip() or ln.startswith('//'): continue
            if ln.startswith('# '):
                flush(); cur=ln[2:].strip(); buf=[]
            else: buf.append(ln.strip())
        flush()
    return out,errs
if __name__=='__main__':
    out,errs=load(sorted(glob.glob(os.path.join(B,'skel','*.txt'))))
    print(len(out),'ok;',len(errs),'errors')
    for e in errs: print(e)
    json.dump(out,open(os.path.join(B,'data','skel.json'),'w'),ensure_ascii=False,separators=(',',':'))
