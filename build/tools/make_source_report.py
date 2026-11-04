"""Write the self-contained, shareable audit report for the R1–R5 batch."""
from pathlib import Path
import json,html
B=Path(__file__).resolve().parents[1];root=B.parent;out=root.parents[1]/'outputs'
fix=json.loads((B/'data/original_fixes.json').read_text());mig=json.loads((B/'data/sentence_migrations.json').read_text())
e=html.escape
parts=[]
for r in fix:
 changes='；'.join(e(a)+' → <b>'+e(b)+'</b>' for a,b in r['replacements'])
 parts.append(f'<details class="item"><summary><code>{e(r["key"])}</code><span>{changes}</span></summary><p class="before">修复前：{e(r["before"])}</p><p class="after">修复后：{e(r["after"])}</p><p class="source">依据：{e(r["source"])}</p></details>')
trs=[]
for r in mig:
 old='<br>'.join(e(o['key']) for o in r['old']);new='<br>'.join(e(n['key']) for n in r['new']);text='<br>'.join(e(n['text']) for n in r['new']);trs.append(f'<tr><td>{old}</td><td>{new}</td><td>{text}</td></tr>')
issues=[
('2022-2｜4:1、4:2等','32%与302%统计句在本地原卷中不存在，无法按本地原卷核定正确数字；72%/59%句及部分其他补充措辞也属于来源差异。本批不猜改数字、不静默删句。'),
('2020-1｜3:2～3:4、6:0','部分引述语与本地原卷不同；6:0的says Wiles在本地原卷不存在，不能只把前面的句号改成逗号。'),
('2020-2｜2:5、2:6','部分措辞、连接词与本地原卷不同，超出粘词和断句修复；原文保留，待确定统一来源。'),
('2020-3｜1:0、4:3、4:4','本地原卷另有Madrid段的一句，工作台缺少；健康收益列举与Fewer untimely deaths在工作台中存在，但原卷没有。'),
('2022-1｜2:0','工作台有Denver-based Nest Fresh Eggs等增补，本地原卷没有；本批撤回对此增补的字形更正。'),
('2013-3｜2:2','doing, Subjects中的逗号本地原卷也是如此；保留原题，不擅改为句号。'),
('2021-3｜5:1','sub- $ 1在本地原卷也有这种排印；本批保留，不用排印偏好改写真题。'),
('2022-1｜5:2','两个what是原题口语引语，之前复核已结案；继续保留。')]
issuehtml=''.join('<tr><td>'+e(k)+'</td><td>'+e(v)+'</td></tr>' for k,v in issues)
css='''*{box-sizing:border-box}body{margin:0;background:#f7f6f0;color:#243238;font:15px/1.75 system-ui,-apple-system,"PingFang SC",sans-serif}main{max-width:1150px;margin:auto;padding:46px 24px}h1{font-size:32px;line-height:1.3}h2{margin-top:38px;font-size:23px}.muted,.source{color:#68787c}.hero{padding:28px;background:#e8f1ed;border:1px solid #cbded5;border-radius:18px}.stats{display:flex;gap:12px;flex-wrap:wrap}.stats span{background:#fff;padding:8px 14px;border-radius:8px}input{width:100%;padding:12px;border:1px solid #c5d3cf;border-radius:8px;font:inherit;margin:16px 0}.item{background:white;border:1px solid #dce2de;border-radius:9px;margin:9px 0;padding:14px}summary{cursor:pointer;display:flex;gap:18px;align-items:baseline}summary code{min-width:120px;color:#176c66}.before{color:#82574c}.after{color:#216747}.source{font-size:13px}table{width:100%;border-collapse:collapse;background:#fff}th,td{border:1px solid #d8e0db;padding:12px;text-align:left;vertical-align:top}td:first-child,td:nth-child(2){min-width:130px}th{background:#e8eeea}.scroll{overflow:auto}.note{padding:16px 20px;border-left:4px solid #a67b39;background:#fff9eb}a{color:#176c66}code{font-size:13px}p{overflow-wrap:anywhere}@media(max-width:700px){main{padding:20px 14px}h1{font-size:26px}summary{display:block}.hero{padding:20px}}@media print{input{display:none}details{break-inside:avoid}body{background:white}}'''
body=f'''<!doctype html><html lang="zh-CN"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>英语工作台 R1–R5 修复清单</title><style>{css}</style><main><p class="muted">2026-11-02 · v51 本地预览 · 未发布</p><h1>英语工作台：原文与断句修复</h1><section class="hero"><p>已完成有明确依据的字词和标点修复、用户批准的六组断句迁移，以及对应拆解和记录兼容。其他句子保留原编号。源文件中的学习记录未修改。</p><div class="stats"><span><b>40</b> 个句子</span><span><b>50</b> 处明确修复</span><span><b>6</b> 组断句迁移</span><span><b>46</b> 条页面核对</span></div></section><h2>验证状态</h2><ul><li>全库新版拆解836条，0错误；内容范围检查通过。</li><li>实际页面1134条阅读原句、编号、译文与数据一致。</li><li>46条修复内容逐条打开，161处修饰点击正常；桌面与iPad尺寸查看通过。</li><li>45组兼容迁移验证：原答案归档、部分完成不冒充整句完成、重复运行不重复迁移、新记录不再偏移、旧备份在保存时立即迁移。</li><li>已收藏的hail from词位置由27–28校正为26–27，个人释义保留；阅读成绩不变。</li><li>原有14项交互检查通过。独立Codex审核发现的问题已修复并核验；未冒充Claude正式复核。</li></ul><p class="note">当前阶段：可在本地预览，尚未commit或push。R5机器验证与独立Codex复核已完成，仍按项目流程交Claude做一次正式复核。</p><h2>R3：已批准的编号迁移</h2><p>采用显式边界与兼容映射，不对整篇重排编号。合并后不再显示空白段落或空译文标签；旧记录完整归档，旧收藏关联到新句。只做过部分片段时，不将合并后的整句标为完成。</p><div class="scroll"><table><thead><tr><th>旧编号</th><th>新编号</th><th>完整原句</th></tr></thead><tbody>{''.join(trs)}</tbody></table></div><h2>R1／R2／R4：逐项修复</h2><p>已检查2012–2022阅读845个原始句子条目的词界与句界候选，核对本地原卷；明确错误见下表。修复同时进入原文、拆解和旧版拆解中的匹配片段。合并／拆分后的译文已写成完整句，不保留残句拼接。</p><input id="q" type="search" placeholder="搜索年份、句子编号或英文片段" aria-label="搜索修复条目">{''.join(parts)}<h2>另列的来源差异与保留项</h2><p>以下内容超出明确粘连和断句修复。保留源记录，尚未统一替换，不能据此宣称工作台全文已逐字对齐本地原卷。</p><div class="scroll"><table><thead><tr><th>位置</th><th>核对结果与处理</th></tr></thead><tbody>{issuehtml}</tbody></table></div><p class="muted">本文件的内容、样式和搜索功能均已内嵌，可离线打开及直接分享。工作台预览另为独立HTML文件。</p></main><script>document.querySelector('#q').addEventListener('input',e=>{{const q=e.target.value.toLowerCase();document.querySelectorAll('.item').forEach(x=>x.hidden=!x.textContent.toLowerCase().includes(q));}});</script></html>'''
out.mkdir(exist_ok=True);target=out/'英语工作台 R1-R5 修复清单.html';target.write_text(body);print(target)
