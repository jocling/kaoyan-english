"""Source corrections and explicit sentence boundaries; no mutation of the v35 base."""
import json
from pathlib import Path

def encoded(value):
    return json.dumps(value,ensure_ascii=False,separators=(',',':')).replace('</','<\\/')

def replace_object(html,name,mutate,marker=None):
    marker=marker or '\nconst '+name+' = '; start=html.index(marker)+len(marker)
    obj,end=json.JSONDecoder().raw_decode(html,start);mutate(obj)
    return html[:start]+encoded(obj)+html[end:]

def apply_original_fixes(html, build_dir):
    b=Path(build_dir);changes=json.loads((b/'data/original_fixes.json').read_text())
    migrations=json.loads((b/'data/sentence_migrations.json').read_text())
    final=json.loads((b/'data/all_sents.json').read_text());overrides={};aliases={}
    def update_data(data):
        texts={t['id']:t for year in data for t in year['texts']}
        for row in changes:
            if row['key'].startswith('special-'):continue
            tid,key=row['key'].split('|');pi=int(key.split(':')[0]);para=texts[tid]['paragraphs'][pi]
            if para.count(row['before'])!=1:raise ValueError('Original correction mismatch: '+row['key'])
            texts[tid]['paragraphs'][pi]=para.replace(row['before'],row['after'],1)
        affected=set()
        for row in migrations:
            for old in row['old']:
                tid,key=old['key'].split('|');pi=int(key.split(':')[0]);para=texts[tid]['paragraphs'][pi]
                if old['text'] not in para:raise ValueError('Migration source mismatch: '+old['key'])
                affected.add((tid,pi))
                aliases[old['key']]=[n['key'] for n in row['new']]
            for new in row['new']:affected.add((new['key'].split('|')[0],int(new['key'].split('|')[1].split(':')[0])))
        for tid,pi in sorted(affected):
            slots={int(k.split(':')[1]):v[0] for k,v in final[tid].items() if int(k.split(':')[0])==pi}
            arr=[slots.get(i) for i in range(max(slots,default=-1)+1)]
            para=' '.join(t for t in arr if t);texts[tid]['paragraphs'][pi]=para
            if para in overrides and overrides[para]!=arr:raise ValueError('Ambiguous paragraph override')
            overrides[para]=arr
    html=replace_object(html,'DATA',update_data)
    def update_ann(ann):
        for row in migrations:
            for old in row['old']:
                tid,key=old['key'].split('|');pi,si=map(int,key.split(':'));ann[tid]['trans'][pi][si]=''
            for new in row['new']:
                tid,key=new['key'].split('|');pi,si=map(int,key.split(':'));arr=ann[tid]['trans'][pi]
                while len(arr)<=si:arr.append('')
                arr[si]=new['cn']
    html=replace_object(html,'ANN',update_ann)
    def update_legacy(parses):
        def correct(v,replacements):
            if isinstance(v,str):
                for old,new in replacements:v=v.replace(old,new)
                return v
            if isinstance(v,list):return [correct(x,replacements) for x in v]
            if isinstance(v,dict):return {k:correct(x,replacements) for k,x in v.items()}
            return v
        for row in changes:
            tid,key=row['key'].split('|')
            if key in parses.get(tid,{}):parses[tid][key]=correct(parses[tid][key],row['replacements'])
    html=replace_object(html,'PARSE2',update_legacy)
    # The same verified correction table also feeds all special-paper source objects.
    special=[r for r in changes if r['key'].startswith('special-')]
    def corrected(value,replacements):
        if isinstance(value,str):
            for old,new in replacements:value=value.replace(old,new)
            return value
        if isinstance(value,list):return [corrected(v,replacements) for v in value]
        if isinstance(value,dict):return {k:corrected(v,replacements) for k,v in value.items()}
        return value
    def update_special(obj,name):
        for row in special:
            tid=row['key'].split('|')[0];_,year,kind=tid.split('-')
            if name=='EXAM_DATA':
                if year in obj and kind in obj[year]:obj[year][kind]=corrected(obj[year][kind],row['replacements'])
            elif name=='STUDY_V17':
                if tid in obj:obj[tid]=corrected(obj[tid],row['replacements'])
            elif name=={'newtype':'NEWTYPE_STUDY','translation':'TRANSLATION_STUDY'}.get(kind):
                if year in obj:obj[year]=corrected(obj[year],row['replacements'])
    for name in ['EXAM_DATA','NEWTYPE_STUDY','TRANSLATION_STUDY','STUDY_V17']:
        html=replace_object(html,name,lambda obj,name=name:update_special(obj,name))
    if special:
        def update_papers(papers):
            for paper in papers.values():
                for name in ['EXAM_DATA','NEWTYPE_STUDY','TRANSLATION_STUDY']:
                    if name in paper:update_special(paper[name],name)
        html=replace_object(html,'PAPERS',update_papers,marker='const PAPERS=')
    marker='function splitSentences(p){';assert html.count(marker)==1
    prefix='const SOURCE_SENTENCE_OVERRIDES='+encoded(overrides)+';\nconst SOURCE_SENTENCE_ALIASES='+encoded(aliases)+';\n'
    prefix+='function splitSentences(p){if(Object.prototype.hasOwnProperty.call(SOURCE_SENTENCE_OVERRIDES,p)){const out=[];SOURCE_SENTENCE_OVERRIDES[p].forEach((v,i)=>{if(v!==null)out[i]=v;});return out;}return sourceOriginalSplitSentences(p);}\n'
    html=html.replace(marker,prefix+'function sourceOriginalSplitSentences(p){')
    marker='text.paragraphs.forEach((para, pi) => {';assert html.count(marker)==1
    html=html.replace(marker,marker+"\n    if(!para.trim())return; // Stable paragraph IDs may leave an empty paragraph after a merge.")
    # Hide empty translation slots while retaining stable sentence numbers.
    old='tr[pi].map((z, si) => `<span class="sn">${si + 1}</span>${esc(z)} `).join(\'\')'
    new='tr[pi].map((z, si) => z ? `<span class="sn">${si + 1}</span>${esc(z)} ` : \'\').join(\'\')'
    assert html.count(old)==1
    html=html.replace(old,new)
    # Compatibility is inline and runs after all existing modules have initialized.
    compat=(b/'tools/original_compat.js').read_text()
    tables=(b/'data/original_compat.json').read_text().replace('</','<\\/')
    html=html.replace('</body>','<script>\nconst SOURCE_COMPAT51='+tables+';\n'+compat+'\n</script>\n</body>')
    # This source-correction batch is the next preview/release after v50.
    return html.replace('>v50</small>','>v52</small>')

def special_index_patch(build_dir):
    """Refresh corrected text and token keys after existing special indexes register."""
    b=Path(build_dir);rows=json.loads((b/'data/original_fixes.json').read_text())
    final=json.loads((b/'data/all_sents.json').read_text())
    sentences={r['key']:final[r['key'].split('|')[0]][r['key'].split('|')[1]] for r in rows if r['key'].startswith('special-')}
    return 'const SOURCE_SPECIAL_SENTENCES51='+encoded(sentences)+';\n'+"""for(const [full,[text,cn]] of Object.entries(SOURCE_SPECIAL_SENTENCES51)){
 const [id,key]=full.split('|'),[,year,kind]=id.split('-'),[pi,si]=key.split(':').map(Number);
 const tokenKeys=text.split(' ').map((_,i)=>`${key}:${i}`);
 if(STUDY_V17[id]?.sentences[key])Object.assign(STUDY_V17[id].sentences[key],{text,tokenKeys});
 for(const index of [PARSE2,SPECIAL_PARSE])if(index[id]?.[key])index[id][key].text=text;
 const row=kind==='newtype'?NEWTYPE_STUDY[year]?.blocks[pi]?.sentences.find(s=>s.key===key):kind==='translation'?TRANSLATION_STUDY[year]?.sentences.find(s=>s.key===key):null;
 if(row)Object.assign(row,{text,tokenKeys});
}
"""
