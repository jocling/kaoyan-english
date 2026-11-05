"""P6 writing entry and source-backed guidance. Applied only at the import stage."""
import json, os

def apply_writing_p6(s, B):
    def rep(old, new):
        nonlocal s
        assert s.count(old) == 1, ('P6 patch', old[:110], s.count(old))
        s = s.replace(old, new)
    rep("translation:{name:'翻译',hint:'1篇 / 年 · 15分'}};", "translation:{name:'翻译',hint:'1篇 / 年 · 15分'},writing:{name:'作文',hint:'2题 / 年 · 25分'}};")
    rep("{key:'translation',kind:'translation',name:'翻译'}];}", "{key:'translation',kind:'translation',name:'翻译'},{key:'writing-A',kind:'writing',part:'A',name:'小作文'},{key:'writing-B',kind:'writing',part:'B',name:'图表作文'}];}")
    rep("function practiceUnitStatus(unit,year){", "function practiceUnitStatus(unit,year){\n  if(unit.kind==='writing')return writingP6Status(unit,year);")
    rep("function practiceOpenUnit(year,key){", "function practiceOpenUnit(year,key){\n  const writingPart=/^writing-([AB])$/.exec(key);\n  if(writingPart){spWritingPart=writingPart[1];key='writing';}")
    rep("?curText.id:spKind;", "?curText.id:(spKind==='writing'?`writing-${spWritingPart}`:spKind);")
    rep('作文暂不纳入 · 可随时切换部分', '含两篇作文 · 可随时切换部分')
    rep('完型 → 阅读（4篇） → 新题型 → 翻译。作文暂不纳入，当前每卷覆盖 75 分。', '完型 → 阅读（4篇） → 新题型 → 翻译 → 小作文 → 图表作文。全卷100分；作文保存练写记录，反馈经自查或另行批改。')
    rep('完型 · 阅读 · 新题型 · 翻译<br>共 7 个部分', '完型 · 阅读 · 新题型 · 翻译 · 作文<br>共 ${units.length} 个部分')
    rep('已完成 ${done}/7', '已保存/提交 ${done}/${units.length}')
    rep('${done/7*100}%', '${done/units.length*100}%')
    rep('2015—2026 · 答题 / 精读</span>', "2015—2026 · ${practiceKind==='writing'?'练写 / 审题指导':'答题 / 精读'}</span>")
    rep('${v.hint} · 原文与题目左右对照', "${v.hint} · ${practiceKind==='writing'?'原题、审题、练写与自查':'原文与题目左右对照'}")
    rep("  const responseKey=spKey(spKind,spYear);", "  document.getElementById('view-special').classList.toggle('writing-p6',spKind==='writing');\n  const responseKey=spKey(spKind,spYear);")
    rep("if(spMode==='study')renderSpStudy();else if(spKind==='cloze')", "if(spKind==='writing')renderSpWriting();else if(spMode==='study')renderSpStudy();else if(spKind==='cloze')")
    data=json.load(open(os.path.join(B,'data','writing_p6.json'),encoding='utf-8'))
    late='\nconst WRITING_P6='+json.dumps(data,ensure_ascii=False,separators=(',',':')).replace('</','<\\/')+';\n'
    late+=open(os.path.join(B,'tools','writing_p6.js'),encoding='utf-8').read()
    return s,late
