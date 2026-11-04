# P3 第7项 · Claude 复审（2026-11-04）

状态：复审完成（只审不改）。22 条原文修正的 PDF 依据成立，机器检查全过；有 4 条必改（均为小改），改完机器检查全过即可等用户说「推」，**不需再复审**。

## 机器检查
| 项 | 结果 |
|---|---|
| parse_skel | 1518 ok, 0 errors |
| review_lint special-2015…2026 | 12 年全部「未发现问题」 |
| check.py --content --p3-parser-authorized-revision | 全部通过；授权与 HEAD、文件、补丁一致 |
| test_source_fixes.cjs | 71 组迁移 / 26 组专项 / 生词位置 全 PASS |
| 重建一致性 | 重建前后 index.html SHA 均为 c5dd2f39…，一致 |
| PDF 抽核 | 2024 主 PDF 第 8 页图像：must consider、Joseph、an tended、in each、extracurricular 后无 activities 均与清单一致；2019/2021/2022 文本层与清单一致 |
| 残留说法 | special 全库已无「原文如此」；剩 2 处见必改 2、4 |

## 必改问题
| # | 条目 | 问题 | 改成 | 理由 |
|---|---|---|---|---|
| 1 | special-2021-newtype 6:3 | mod 片段写成 `as a position, not as a fact), demonstrate → asserted`，把主句谓语 demonstrate 包进修饰；点击会把谓语标黄。是原来为定位粘连词 `fact),demonstrate` 留下的写法，修正原文后已无必要 | `mod as a position, not as a fact → asserted | 方式补充 | 当作立场提出，而非事实。` | 主句谓语不能当修饰显示 |
| 2 | special-2024-newtype 0:11 | ① C2 判断理由仍写「muse疑为must误录」，原文已改成 must；② C1 骨架只有 `主语:one | 谓语:is`，缺表语，学生无法完成②标成分 | ① 删掉该半句；② C1 补 `表语:"What makes you unique?"`（片段以 all_sents 实际字元为准） | 原文已修正；从句骨架要完整 |
| 3 | special-2022-cloze 0:1 | `job-a` 改成 `job - a`（连字符加空格），而同一篇 0:13/0:14/0:18 都改成「 — 」；清单里给的 PDF 依据也是 `job—a` | `job — a`（并同步 chunk 与兼容映射） | 同一篇破折号写法统一，且与所列 PDF 依据一致。2019 `best - and` 原卷文本层即为「 - 」，可不改 |
| 4 | special-2018-newtype 2:7 | 漏网：`"Hey"or` 同属粘连类，原卷 PDF（2018 文本层第 450 行附近）也缺空格；mod 仍写「原数据Hey后与or粘连，保留原字元」 | original_fixes 增一条 `"Hey"or` → `"Hey" or`（依据：2018 原卷 PDF，仅恢复词边界）；mod 说明改为 `举例说明 | 例如 Hi、Hey、Hello` | 第7项范围包括所有空格切词问题；不再向学生提示“原数据有误” |

## 不改 / 待定
- 2024 新题型 0:4 的 extracurricular 后缺词、in each、an tended，以及 0:11 的 `…activity, a conventional one`：两份本地 PDF 一致，Codex 未猜改，同意保留待定。若用户手头有其他可靠版本（如纸质真题或官方解析册英二 2024），可再补；否则维持现状。
- 2025 新题型 5:2：C3 谓语写成 `solved … has failed`，按规范并列谓语宜用 `|| &or ||` 分开；C2 `whatever the problem` 无谓语仍标为从句。属原有分析，非第7项引入，不阻塞。
- 单独切出的破折号块标〔修〕，可接受。

## 给 Codex 的指令（可直接复制）
> 读 `review/P3-第7项-Claude复审.md`，按「必改问题」1–4 修改：1) special-2021-newtype 6:3 的 mod 去掉 `), demonstrate`；2) special-2024-newtype 0:11 删 C2 中“muse疑为must误录”，C1 补表语 "What makes you unique?"；3) special-2022-cloze 0:1 的修正改为 `job — a`，同步 chunk/兼容映射；4) original_fixes 增 special-2018-newtype 2:7 `"Hey"or` → `"Hey" or`（依据 2018 原卷 PDF），改写该句 mod 说明。跑 parse_skel、12 年 review_lint、check.py --content --p3-parser-authorized-revision、freeze.js、test_source_fixes.cjs、重建一致性，全过后更新 v51 预览，HANDOFF §9 记一笔。不需再交 Claude 复审，不 push，等用户说「推」。
