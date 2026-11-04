# R1–R5 ＋ P3（2015–2026 专项 682 条）· Claude 正式复核

状态：2026-11-03 Claude 复核完成（只审不改）。机器检查全过；R1–R5 无必改项；P3 有 6 条必改（含 2 条系统性）＋ 2 项待用户决定。改完机器检查全过即可等用户说「推」，**不需复审**（第 7 项除外）。

## 用户决定（2026-11-03）
- 用户原话：「1批准，按照你的来」。
- 第 1 项：**批准** 修改 `build/parse_skel.py`，仅限 main / C 成分支持 `#N` 指定第几次出现（与 mod 同规则）。不改 build/src、不改界面。Codex 照 P2/P3 swing 先例建一次性授权记录（绑定 HEAD、文件 SHA、补丁 SHA），提交后失效。
- 第 7 项：按 Claude 建议执行——把 R1 的 `original_fixes.json` 机制扩展到 special 句子，修破折号/连字符分词问题和 2024 新题型转录错误（必须逐字对照本地原卷 PDF，查不到的列出来，不猜）；改动后重写受影响条目，**这一部分回到 Claude 复审**。
- 第 8 项：不改。

## 机器检查
| 项 | 结果 |
|---|---|
| parse_skel | 1518 ok, 0 errors |
| review_lint special-2015…2026、2012、2013-14、2017-3、2018–2022 | 全部「未发现问题」 |
| check.py --content --p3-swing-authorized-revision | 全部通过（swing 补丁仅一行例外，范围与授权记录一致） |
| check.py --content（不带授权参数） | 仅拦 build/check.py，符合预期 |
| freeze.js | 14/14 PASS（云端 playwright 跑） |
| 重建一致性 | 重建前后 index.html SHA 均为 b532dbe0…，一致 |

## 人工抽查范围
Codex 列出的 18 条复杂句 ＋ 2016 新题型 5:0 ＋ R1–R5 六组合并句（2013-1 3:2、2017-3 2:1、2018-3 0:0 / 3:7、2019-3 4:6、2020-1 5:1 / 5:2）＋ 全库按模式扫描。

R1–R5：六组合并句的切块、骨架、从句判断、修饰挂靠均正确，无必改。

## 必改问题

| # | 条目 | 问题 | 改成 | 理由 |
|---|---|---|---|---|
| 1 | 全库 21 处（2017:131/446/470，2018:68/222/283/348/386/406，2019:32/446，2020:203，2021:374，2022:179，2023:467，2024:73，2025:168/222/375，2026:55 等，`grep '主语＋谓语'` 排除缩写即得） | 为绕开“重复词定位到第一处”，把 `I decided`、`you come away`、`it can be` 等写成「主语＋谓语」。HANDOFF §4.1 只允许缩写（it's/we'd）用这个名；学生在主干里看到的是“主语和谓语不分”，与拆法第 1–3 步相反 | 在 `parse_skel.py` 的 main / C 成分里支持与 mod 相同的 `#N`（如 `主语:I#2 | 谓语:decided`），再把这 21 处拆回「主语」「谓语」 | 这是工具限制，不该用错误成分名去适配。**parse_skel.py 不在内容任务允许范围，需用户先批准这一处工具改动**（不碰 build/src，不影响界面） |
| 2 | gist 30 条以“一件事”结尾（2015 最多），另有「假设发生这一情境」「变化、局限和不足意味着这一结果」「这一切意味着这种结果」 | 只说“一件事”不说是什么，主干意思没传达信息 | 按 2017 样板补尾巴：`…说了（一件事）——内容是从句①`；后 3 条写出实际意思 | 用户已确认 2017 样板写法；P1 阅读也是这样写的 |
| 3 | special-2019-newtype 0:23 | ① 末块 `give them … their own.` 标成〔C2修〕，但 point 说 give 不在 what 从句里，自相矛盾；② main 写成 `谓语:should … not be made … made` | ① 末块改〔主〕（不定式部分可另切〔修〕）；② main 改为 `谓语:should … not be made || &but rather || 谓语:made`，give 组前加 `|| &and ||` 并在 point 注明省略主语 | 标签决定点击高亮和长难句切块判分，标错会把学生判错 |
| 4 | special-2021-cloze 0:37；special-2016-newtype 5:0 C2；special-2020 第463行 C2 | 把“疑问词＋不定式”（how to help / what to cook / how to look）标成“宾语从句”。2021 0:37 因此还把整句 type 写成“主从复合句”，C1 骨架缺 `谓语:help` | 这三处去掉 C 条目，改为 `mod how to help … → understand | 宾语（疑问词＋不定式）| …`，main 的宾语直接写原文；2021 0:37 type 改“简单句｜not only…but also 并列表语” | 拆法第 1 条：to do 永远不是谓语，没有谓语就不是从句。长难句①切块会让学生把它当从句判，强化错误认识 |
| 5 | special-2026-cloze 0:16 | 拆解按 `so strong that` 结果从句，译文却是“正因为……他们才……”（强调句读法），两者不一致 | 建议按强调句 `it's because … that …` 拆：主干为被强调的 because 从句＋ that they felt able to cancel；point 说明 so strong 只是程度，不引出 that。若坚持结果从句读法，就把译文改成“友谊牢固到他们觉得可以临时取消” | 拆解和译文必须是同一种读法。`maybe it's because X that Y` 是典型强调句 |
| 6 | special-2025-newtype 5:2 | `in recent memory—it` 整块标〔C3修〕，但 it 是 C1 的主语；C1 骨架缺 `主语:it` | 若做第 8 项（破折号拆分），it 单独切〔C1〕并补 `主语:it`；不做的话至少在 C1 补主语并在 point 说明 | 外层从句无主语，学生无法完成②标成分 |

## 待用户决定（不阻塞本次推送）

7. **专项原文的粘连 / 转录损坏走 R1 同一机制修**（需复审）：
   - 2025 的 `informed—which`、`solved—or`、`memory—it`、`script—literally`、`moment—the` 等：**英文破折号两侧不空格是正常排版，原卷没错**，是分词按空格切导致的。Codex 在 point 里称之为“粘连/原文如此”，会让学生以为原题有误。2019 `best-and`、2021 `fact),demonstrate`、`thinking-all` 等同理。
   - 2024 新题型 `muse consider`（应为 must）、`an tended`（应为 extended）、`is"What`、`extracurricular` 后缺词、`in each` 等，是 P2 入库时没逐字照 PDF 的转录错误。
   - R1 已有 `original_fixes.json`（如 `rat-one → rat - one`），建议用户授权把同一机制扩到 special 句子，修完后重写受影响条目（约 10–20 条），这部分回到 Claude 复审。
8. 2026-cloze 0:5 C2 把 `feeling like this means…` 的 like 从句标为宾语从句，可接受但不典型（也可视作 feel like ＋ 从句 = 感觉好像）；不强制改。

## 其他确认
- 本地落后 origin 15 个仅 attempts.json 的记录提交；本地未改 attempts.json，推送时 `git pull --rebase` 不会冲突。
- P3 一次交 567 条超过“每批 ≤80”，属用户明确要求，不计问题。
- swing 一次性授权绑定 HEAD 806eb00，按第 1 项改 parse_skel.py 后需用户另给一次授权（或把 parse_skel.py 改动单独提交）。

## 给 Codex 的指令（可直接复制）
> 读 `review/P3-R1-R5-Claude复核.md`，用户已批准第 1、7 项（见“用户决定”）。按顺序做：
> 1. 改 `build/parse_skel.py`：main 与 C 成分支持 `#N`（同 mod 规则），建一次性授权记录（照 `P3-swing-一次性范围授权.json` 格式）并在 check.py 增加对应参数核对；把 21 处非缩写「主语＋谓语」拆回 `主语:…#N | 谓语:…`。
> 2. 按第 2–6 项逐条修改 special-*.txt。
> 3. 第 7 项：扩展 `original_fixes` 到 special 句子，修破折号/连字符分词（2025 informed—which 等、2019 best-and、2021 fact),demonstrate / thinking-all 等）及 2024 新题型转录错误（muse、an tended、is"What、extracurricular 缺词、in each 等），逐字对照本地原卷 PDF，查不到的列出来不猜；句子编号不变，收藏和练习记录兼容沿用 R1 的迁移逻辑；重写受影响条目，point 里删掉“原文粘连/原文如此”的说法。
> 4. 跑 parse_skel、12 年 review_lint、check.py --content（带有效授权参数）、freeze.js、test_source_fixes.cjs、重建一致性，全过后生成 `outputs/英语工作台 v51 预览（未发布）.html`，HANDOFF §9 记一笔，在 review/ 写“第 7 项改动清单”（每条：编号、原样、改成、PDF 依据）交 Claude 复审。
> 5. 不 push。
