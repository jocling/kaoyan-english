import json,sys
def grab(path,name):
    s=open(path,encoding='utf-8').read()
    k='\nconst '+name+' = '
    i=s.find(k)
    if i<0: return None
    v,e=json.JSONDecoder().raw_decode(s,i+len(k)); return v
