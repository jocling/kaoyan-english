"""从完整版 ECDICT（github.com/skywind3000/ECDICT 的 ecdict.csv）抽出真题里用到的词和短语，生成 build/data/ecdict_ext.json。

用法：python3 build/tools/make_ecdict_ext.py <ecdict.csv 路径>
  - 词：真题出现的每个词 + 它的原形（ECDICT exchange 字段 0:），格式同原 DICT（变形词存原形释义 + l 原形 + f 变形名）；只输出新增词和原来没有可用中文义项的词。
  - 短语：真题里 2–6 词的连续片段（原样 + 逐词还原原形两种写法），与 ECDICT 多词条目、kdict 短语对上的才收。
  - 释义全部来自词典原文，不手写。新增年份后重跑一次即可。
"""
import csv, json, os, re, sys, glob

B = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
csv.field_size_limit(10**9)
clean = lambda w: re.sub(r'^[^A-Za-z]+|[^A-Za-z]+$', '', w).lower()

# ---------- 收集真题文本 ----------
texts = []
def walk(v):
    if isinstance(v, str):
        if re.search(r'[A-Za-z]{2,}', v) and len(re.findall(r'[A-Za-z]', v)) > len(v) * 0.5: texts.append(v)
    elif isinstance(v, dict): [walk(x) for x in v.values()]
    elif isinstance(v, list): [walk(x) for x in v]
for tid, ss in json.load(open(os.path.join(B, 'data', 'all_sents.json'), encoding='utf-8')).items():
    for v in ss.values(): texts.append(v[0] if isinstance(v, list) else str(v))
for f in glob.glob(os.path.join(B, 'data', 'papers', '*.json')): walk(json.load(open(f, encoding='utf-8')))
base = open(os.path.join(B, 'base_v35.html'), encoding='utf-8').read()
for name in ['DATA', 'EXAM_DATA']:
    k = '\nconst ' + name + ' = '; i = base.find(k)
    if i >= 0: walk(json.JSONDecoder().raw_decode(base, i + len(k))[0])
def grab(name):
    k = '\nconst ' + name + ' = '; i = base.find(k)
    return json.JSONDecoder().raw_decode(base, i + len(k))[0]
DICT0, PHD0 = grab('DICT'), grab('PHD')

sents = []
for t in texts:
    for s in re.split(r'(?<=[.!?;:])\s+|\n+', t):
        toks = [clean(x) for x in s.split()]
        toks = [x for x in toks if x]
        if toks: sents.append(toks)
vocab = {w for s in sents for w in s}

# ---------- 读 ECDICT ----------
ec = {}
for r in csv.DictReader(open(sys.argv[1], encoding='utf-8')):
    w = r['word'].strip(); lw = w.lower()
    if lw in ec and ec[lw]['word'] == lw: continue   # 小写原词优先
    ec[lw] = r

FORM = {'p': '过去式', 'd': '过去分词', 'i': '现在分词', '3': '第三人称单数', 's': '复数', 'r': '比较级', 't': '最高级'}
K = json.load(open(os.path.join(B, 'data', 'kdict.json'), encoding='utf-8'))
def lines(t): return [x.strip() for x in str(t or '').replace('\\r', '').replace('\r', '').split('\n') if x.strip()]
def weak(t):
    """没有可用中文义项：只剩 [计][医] 这类专业行、缩写，或只写着"X的过去式" """
    u = [x for x in lines(t) if not x.startswith('[')]
    return not u or all(x.startswith('abbr.') or re.match(r'^[A-Za-z .]*的(过去式|过去分词|现在分词|复数|现在式|第三人称|比较级|最高级)', x) for x in u)
def raw(w):
    r = ec.get(w)
    if not r: return None
    e = {'t': r['translation'].replace('\\n', '\n').strip()}
    if r['phonetic']: e['p'] = r['phonetic']
    if r['collins'] and r['collins'] != '0': e['c'] = int(r['collins'])
    if r['tag']: e['g'] = r['tag']
    ex = dict(x.split(':', 1) for x in r['exchange'].split('/') if ':' in x)
    if ex.get('0') and ex['0'].lower() != w: e['_b'] = ex['0'].lower(); e['_f'] = '、'.join(dict.fromkeys(FORM[c] for c in ex.get('1', '') if c in FORM)) or '变形'
    e['_en'] = r['definition'].replace('\\n', '\n').split('\n')[0].strip()
    return e
def base_of(w):
    d0 = DICT0.get(w)
    if d0 and not weak(d0['t']): return d0
    e = raw(w)
    return e if e and not weak(e['t']) else None
def final(w):
    """返回要写进 DICT 的条目（格式同原 DICT：变形词存原形的释义，l=原形，f=变形名，wp=本词音标）；不需要改的返回 None"""
    d0 = DICT0.get(w)
    if d0 and not weak(d0['t']): return None
    e = raw(w)
    if not e: return None
    b = e.get('_b'); bd = base_of(b) if b else None
    if bd and weak(e['t']):
        out = {k: v for k, v in bd.items() if k in ('t', 'p', 'c', 'g')}
        out.update({'l': b, 'f': e['_f']})
        if e.get('p'): out['wp'] = e['p']
        return out
    out = {k: v for k, v in e.items() if not k.startswith('_')}
    if b: out.update({'l': b, 'f': e['_f']})
    if weak(out['t']):
        add = []
        if w in K and K[w].get('t'): add += [f"{p}. {m}" for p, m in K[w]['t']]
        for suf, rep in (('ly', ''), ('ly', 'le'), ('ily', 'y'), ('ness', ''), ('iness', 'y')):
            st = w[:-len(suf)] + rep if w.endswith(suf) else None
            sd = base_of(st) if st and len(st) > 2 else None
            if sd: add.append(f"（由 {st} 派生；{st}：{[x for x in lines(sd['t']) if not x.startswith('[')][0]}）"); break
        # 只有 [计][网络] 这类行时，把标签挪到行尾，让"常用义项"能显示它（内容不改）
        tagged = [re.sub(r'^(\[[^\]]+\])\s*(.+)$', r'\2（\1）', x) for x in lines(out['t']) if x.startswith('[')]
        add = add[:1] + tagged + add[1:]
        if e['_en']: add.append('英文释义：' + e['_en'])
        out['t'] = '\n'.join(add + [x for x in lines(out['t']) if not x.startswith('[')]) or out['t']
    return out

words = {}
for w in sorted(vocab):
    f = final(w)
    if f:
        words[w] = f
        b = f.get('l')
        if b and b not in DICT0 and b not in words:
            fb = final(b)
            if fb: words[b] = fb
def lemma(w):
    d = words.get(w) or DICT0.get(w) or {}
    return d.get('l') or w

# ---------- 短语 ----------
def norm(p):
    p = re.sub(r'(\.\.\.|…)+', ' ', p)
    return ' '.join(x for x in (clean(t) for t in p.split()) if x)
cands = set()
for s in sents:
    ls = [lemma(w) for w in s]
    for n in range(2, 7):
        for i in range(len(s) - n + 1):
            cands.add(' '.join(s[i:i + n])); cands.add(' '.join(ls[i:i + n]))
STOP = set('a an the of to in on at by for with and or but be is are was were it this that as from not no so do does did have has had i you he she we they his her their its our my your one'.split())
phr = {}
def addp(key, orig, t, src):
    if not t or key in PHD0 or key in phr or key not in cands: return
    if all(x in STOP for x in key.split()): return
    phr[key] = {'k': orig, 't': t, **({'s': src} if src else {})}
for lw, r in ec.items():
    if ' ' in lw and r['translation']: addp(norm(lw), r['word'], r['translation'].replace('\\n', '\n').strip(), '')
for v in K.values():
    for p in v.get('ph', []): addp(norm(p[0]), p[0], p[1], 'kdict')

out = {'w': words, 'ph': phr}
p = os.path.join(B, 'data', 'ecdict_ext.json')
json.dump(out, open(p, 'w', encoding='utf-8'), ensure_ascii=False, separators=(',', ':'))
print('真题词', len(vocab), '新增/修正词条', len(words), '其中修正原有', sum(1 for w in words if w in DICT0), '新增短语', len(phr), '文件', os.path.getsize(p))
