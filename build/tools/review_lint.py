#!/usr/bin/env python3
"""审核辅助：python3 build/tools/review_lint.py 2018"""
import sys, re, json, os
Y = sys.argv[1]; R = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
KIND = re.compile(r'(宾语|定语|状语|主语|表语|同位语)从句|状语|比较|让步|条件|原因|时间|目的|结果|方式|定语|关系')
ROLES = set('主语 谓语 宾语 表语 宾补 主语补足语 间接宾语 直接宾语 形式主语 真正主语 形式宾语 真正宾语 状语'.split())
bad = 0
cur = None
for ln in open(f'{R}/build/skel/{Y}.txt', encoding='utf-8'):
    ln = ln.rstrip('\n')
    if ln.startswith('# '): cur = ln[2:]; continue
    m = re.match(r'(C\d+) ([^|]+)\|', ln)
    parts = []
    if m:
        k = m.group(2).strip()
        if not KIND.search(k): print(f'[从句类型] {cur} {m.group(1)}: {k}'); bad += 1
        parts = ln.split('|')[4:]
    elif ln.startswith('main '):
        parts = re.split(r'\|\|?', ln[5:])
    for p in parts:
        p = p.strip()
        if ':' not in p or p.startswith('&'): continue
        role = p.split(':', 1)[0]
        for r in role.split('＋'):
            if r and r not in ROLES: print(f'[成分名] {cur}: {role}:{p.split(":",1)[1][:30]}'); bad += 1; break
qc = f'{R}/build/data/qchoice{Y}.json'
if os.path.exists(qc):
    q = json.load(open(qc, encoding='utf-8'))
    base = open(f'{R}/build/base_v35.html', encoding='utf-8').read()
    for tid, qs in q.items():
        i = base.find('{"id":"%s"' % tid); keys = []
        if i >= 0:
            j = base.find('{"id":"', i + 10); keys = re.findall(r'"answer":"([A-D])"', base[i:j])
        for n, (num, opts) in enumerate(qs.items()):
            right = [k for k, v in opts.items() if not v.startswith('错')]
            if keys and n < len(keys) and right != [keys[n]]: print(f'[答案] {tid} {num}: 解析正确项{right} 答案键{keys[n]}'); bad += 1
            for k, v in opts.items():
                if re.search(r'工作台|段落块|页面|显示为', v): print(f'[界面词] {tid} {num}{k}: {v[:40]}'); bad += 1
print(f'共 {bad} 处' if bad else '未发现问题')
