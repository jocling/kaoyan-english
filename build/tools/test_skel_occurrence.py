"""Regression checks for main/C occurrence suffixes; existing lookup remains unchanged."""
import sys
from pathlib import Path
sys.dont_write_bytecode=True
sys.path.insert(0,str(Path(__file__).resolve().parents[1]))
from parse_skel import parse_block,Err,located_part
raw='If I leave and I return, I rest.'
lines=['type 主从复合句','chunks If I leave and I return,〔C1〕 I rest.〔主〕','main 主语:I#3 | 谓语:rest','gist 我休息。','C1 条件状语从句 | 提供条件 | If | If后有两套主谓，and连接条件从句内的两项动作 | 主语:I#1 | 谓语:leave | 主语:I#2 | 谓语:return']
sk=parse_block('test|0:0',lines,raw)
assert sk['main'][0]['parts'][0]=={'r':'主语','t':'I','rg':[[6,6]]}
assert [p['rg'] for p in sk['clauses'][0]['parts'] if p['r']=='主语']==[[[1,1]],[[4,4]]]
# A suffix never leaks into displayed labels or matches; invalid ordinals must fail.
for text in ['I#4','absent#2']:
 try:located_part(raw.split(' '),'主语',text,[(0,7)])
 except Err:pass
 else:raise AssertionError('missing occurrence must fail: '+text)
# No suffix retains owner-region-first lookup even if that is a later occurrence.
assert located_part(raw.split(' '),'主语','I',[(6,7),(0,7)])['rg']==[[6,6]]
assert located_part('It is related and it is created.'.split(' '),'谓语','is … created#2',[(0,6)])['rg']==[[5,5],[6,6]]
tokens='you is here , you is are'.split(' ')
assert located_part(tokens,'主语','you#2',[(0,6)])['rg']==[[4,4]]
try:located_part(tokens,'主语','you#3',[(0,6)])
except Err:pass
else:raise AssertionError('punctuation must not duplicate an occurrence')
print('PASS main/C #N：全句计次、角色分开、缺失报错、不显示后缀、不带后缀行为保持、非连续谓语')
