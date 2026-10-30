# 复核规范（Claude 审 / Codex 写）

## 分工
- Codex：按 HANDOFF.md 写内容，本地跑完检查，写 §9.1 进度、更新 `进度.csv` 并刷新进度页，**不推送**。
- Claude（审核方）：**只审不改**，输出「问题清单 + 给 Codex 的修改指令」，写入 review/<年份>-复核.md。
- **只审一次，不复审**：Claude 给出必改清单后，Codex 改完、机器检查全过，用户说「推」就直接推送。只有清单里写了「需复审」的条目才回到 Claude。
- 用户说「推」才推送。

## 省额度流程（审核方必须照做）
1. 只读本文件 + review/ 下最新复核记录 + `git status` / `git diff --stat`，不要通读 HANDOFF 和历史。
2. 先跑机器检查，按输出定位问题，**不要逐行通读整份 skel**：
   - `python3 build/parse_skel.py`（0 errors）
   - `python3 build/tools/review_lint.py <年份>`（非标准从句类型/成分名、解析里提界面、正确项与答案键不符）
   - `python3 build/check.py --content`
   - `node test/freeze.js`
   - 重建一致性：`python3 build/build.py` 后 `git diff --stat index.html` 应无新增差异
3. 人工只抽查：lint 报出的条目 + Codex 审核说明里列的抽查句 + 每篇随机 2 句。
4. 不做复审（见分工）。

## 审核清单（判定标准）
- 从句类型只用：宾语/定语/状语(时间、让步、条件、原因、目的、结果、方式、比较可细分)/主语/表语/同位语从句；括号补充可保留。
- 成分名只用 HANDOFF §4.1 标准名。常见错法：补足语(appear/tend to be…)→表语；介词宾语→宾语；引导词＋谓语→谓语；过去分词→谓语；宾语中心/宾语限定词→宾语。
- 选项解析：正确项与真题答案一致；每个错项写清自身错因并引原文；不用模板句；**不提工作台/页面/段落块等界面信息**。
- 原文断句/粘词问题：不在内容任务里改原文，只在 point 说明，并记入 HANDOFF 待办（原文修正机制，P1 后统一处理）。
- 范围（用户 10-30 决定）：内容任务可改 build/skel、build/data、build/tools、index.html、进度.csv、REVIEW.md、AGENTS.md、review/；HANDOFF.md 只许改 §9（`## 9.` 到 `## 10.` 之间），改到别处 check.py 报错。

## 输出格式（写入 review/<年份>-复核.md）
状态行 → 机器检查结果 → 必改问题（条目｜问题｜改成｜理由）→ 不改/待定事项 → 可直接复制给 Codex 的指令。
