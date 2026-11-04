# P3 · Claude复核第7项改动清单（2026-11-03）

状态：已按用户批准范围实施22条、25处可核定调整；句子编号保持。尚未核定的文字列于下方，未猜改。**第7项待Claude复审**；第1–6项按原复核约定无需再次正式复审。未commit、未push。

## 原文修正机制

- 仍由`build/data/original_fixes.json`声明原样、改成及PDF依据；扩展既有导入器到专项源对象和新增年份PAPERS，再刷新既有句子索引/词键。未改build/src或冻结界面。
- 破折号两侧没有空格是正常英文排版。本批给破折号恢复分词边界，服务于当前按空格切词的工具；**不把正常排版说成原题错误**。保留原有句子编号与条目数。
- `all_sents.json`对本轮开始快照恰有下表22条原句变化；所有译文和编号保持。2024的must、Joseph、often及引语间隔按主PDF页面图像核定；汇编PDF本身包含不同转录，不能单靠文本层纠错。
- 兼容仍走R1原映射逻辑：原45组不变，新增26组（22条原文＋4条切块结构修订），共71组。专项标记升为revision2，能接住此前已带revision1的记录；旧切块、成分答案与旧生词词键完整归档，迁移幂等；新保存记录按新坐标，不重复偏移。未修改records/attempts.json。

## 逐条清单

“PDF页”均为文件中的1起算物理页，不是试卷页脚页码。引文只用于定位；破折号形式沿用现有字元并增加分词间隔，未改写词语。

| 编号 | 原样 | 改成 | PDF依据 |
|---|---|---|---|
| special-2019-newtype\|0:23 | `best-and` | `best - and` | 2019年考研英语二真题（可复制搜索查词）.pdf，PDF第13页：what home can meet their needs best – and give them an opportunity |
| special-2021-newtype\|2:3 | `thinking-all` | `thinking — all` | 2021年考研英语二真题（可复制搜索查词）.pdf，PDF第12页：thinking—all the things that would make the disagreement stronger or more valid |
| special-2021-newtype\|3:0 | `about-it` | `about — it` | 2021年考研英语二真题（可复制搜索查词）.pdf，PDF第12页：cares about—it may be the credibility of their team |
| special-2021-newtype\|5:2 | `message,and` | `message, and` | 2021年考研英语二真题（可复制搜索查词）.pdf，PDF第13页：It sends a mixed message, and your counterpart gets to choose |
| special-2021-newtype\|5:3 | `help,as` | `help, as` | 2021年考研英语二真题（可复制搜索查词）.pdf，PDF第13页：Deep breaths can help, as can speaking more slowly and deliberately |
| special-2021-newtype\|6:3 | `fact),demonstrate` | `fact), demonstrate` | 2021年考研英语二真题（可复制搜索查词）.pdf，PDF第13页：as a position, not as a fact), demonstrate equal curiosity |
| special-2022-cloze\|0:1 | `job-a` | `job - a` | 2022年考研英语二真题【可复制搜索查词】.pdf，PDF第2页：job—a job like any other |
| special-2022-cloze\|0:13 | `writing-and` | `writing — and` | 2022年考研英语二真题【可复制搜索查词】.pdf，PDF第2页：writing—and that’s reading |
| special-2022-cloze\|0:14 | `supporter-something` | `supporter — something` | 2022年考研英语二真题【可复制搜索查词】.pdf，PDF第2页：supporter—something you can’t do without |
| special-2022-cloze\|0:18 | `means-` | `means —` | 2022年考研英语二真题【可复制搜索查词】.pdf，PDF第2页：that means—（第20空）writing |
| special-2024-newtype\|0:10 | `Josoph` | `Joseph` | 2024年考研英语二真题（网络补齐）.pdf，PDF第8页：Joseph Adegboyega-Edun |
| special-2024-newtype\|0:11 | `muse consider`；`is"What` | `must consider`；`is "What` | 2024年考研英语二真题（网络补齐）.pdf，PDF第8页：high school seniors must consider is ‘What makes you unique?’ |
| special-2024-newtype\|0:16 | `plus,"says` | `plus," says` | 2024年考研英语二真题（网络补齐）.pdf，PDF第8页：a big plus,” says Mayghin Levine |
| special-2024-translation\|0:2 | `oflen` | `often` | 2024年考研英语二真题（网络补齐）.pdf，PDF第9页：most often with outdoor stalls |
| special-2025-cloze\|0:3 | `part—there's` | `part — there's` | 2025年考研英语二真题（网络补齐）.pdf，PDF第1页：on your part- / there’s something you can’t do |
| special-2025-newtype\|1:0 | `person—the` | `person — the` | 2025年考研英语二真题（网络补齐）.pdf，PDF第11页：that person—the one who looks at the same information |
| special-2025-newtype\|1:4 | `script—literally`；`figuratively—means` | `script — literally`；`figuratively — means` | 2025年考研英语二真题（网络补齐）.pdf，PDF第11页：writing a new script-literally or figuratively- / means that other team members |
| special-2025-newtype\|3:2 | `great—because` | `great — because` | 2025年考研英语二真题（网络补齐）.pdf，PDF第12页：it works great—because you’re ready |
| special-2025-newtype\|3:4 | `informed—which` | `informed — which` | 2025年考研英语二真题（网络补齐）.pdf，PDF第12页：he wasn’t informed—which could lead him |
| special-2025-newtype\|4:4 | `that—and` | `that — and` | 2025年考研英语二真题（网络补齐）.pdf，PDF第12页：build on that—and be clearer for new customers |
| special-2025-newtype\|5:2 | `solved—or`；`memory—it` | `solved — or`；`memory — it` | 2025年考研英语二真题（网络补齐）.pdf，PDF第12页：the old system solved—or, maybe, has failed to solve in recent memory—it was a great idea |
| special-2025-translation\|0:0 | `moment—the` | `moment — the` | 2025年考研英语二真题（网络补齐）.pdf，PDF第13页：You know the moment --- the conversation slows |


## 查不到可靠改法，保留并请Claude核定

2024新题型0:4：

| 待核定处 | 主PDF第8页 | 汇编PDF第167页（页脚166） | 本次处理 |
|---|---|---|---|
| extracurricular后是否补activities | extracurricular后直接接that，未印activities | 同样未印activities | 不凭语法推断补词 |
| in each | 确实印有in each | 同样印有in each | 不擅自移位或删除each |
| an tended是否应为an extended | 确实印为an tended | 同样印为an tended | 没有本地PDF能支持extended，未改 |

2024新题型0:11的`having an uncommon, extracurricular activity, a conventional one`在两份PDF中关系同样不完整，尚不能据本地PDF补出比较词或否定词，未改。主PDF可明确读出`must consider`，而汇编作`muse consider`，故仅此处按主PDF纠正。

2024新题型0:1的`quality ... matter`在两份PDF中也一致，未以语法推断改为matters。这里属于来源文本限制，不是已核定的转录修复。

2024新题型0:2与0:3仍按旧编号保留Charles. E.校名跨条目；本次未合并编号。两条说明已指出完整人名主语位于上一条，未把跨条目当成英语允许自由省略主语。

## 依据文件

- 2019：`2. 英语/2.1 原始资料/英二/2010-2026 真题/2019年考研英语二真题（可复制搜索查词）.pdf`，第13页；实际查看。
- 2021：同目录`2021年考研英语二真题（可复制搜索查词）.pdf`，第12、13页；实际查看。
- 2022：同目录`2022年考研英语二真题【可复制搜索查词】.pdf`，第2页；实际查看。
- 2024：同目录`2024年考研英语二真题（网络补齐）.pdf`，第8、9页页面图像；该文件文字层不完整，因此以放大图像逐字核对。
- 2024对照：同目录`P2 补充核对来源/2024 上海工程技术大学汇编.pdf`，第167、168页；实际查看并记录异文，没有把错误文本层当作原卷已核准。
- 2025：同目录`2025年考研英语二真题（网络补齐）.pdf`，第1、11–13页；实际查看。该文件其他未列措辞与已入库来源仍有差异，本批不借机换整篇原文。

## 第1–6项落实及检查

- 第1项：main/C成分显式`#N`按整句原文第N次真实词语出现定位；显示时不带后缀。未带后缀的原查找行为不变。实际扫描为28处非缩写合并成分（原表的21处为示例/近似数），已全部拆开。显式计次过滤独立标点，缺失次数报错，不默默退到最后一处。测试见`build/tools/test_skel_occurrence.py`。
- 第2项：共改35条gist，补清所指内容/从句编号，并将抽象“这种结果/这种情形”改成实际意思。
- 第3项：2019新题型0:23末尾give为主句切块，不再挂C2；made#2、but rather、and分别定位；give后的them用them#2，省略祈使主语you的解释保留。
- 第4项：三处疑问不定式删除C卡片，作为疑问词＋不定式宾语挂靠；2021完型0:37改简单句。没有把to do标成时态谓语。
- 第5项：2026完型0:16按强调句it's because...that...还原，main列they/felt/able，because作被强调的原因；译文同一读法，so不再误配that为结果。
- 第6项：2025新题型5:2的it单独归C1并补主语，破折号补充部分不再吞掉it。
- 第8项按用户决定未改。2026完型0:5 like从句的原分析继续保留；本批只按第1项拆开该句的非缩写主谓标签。

机器验证：parse_skel 1518条0错误；12年special review_lint全过；`check.py --content --p3-parser-authorized-revision`全过；freeze.js原14项全过；test_source_fixes.cjs的71组（含26组旧v51→revision2）全过；专项真实生词标记只命中正确单词一次，词键同步；重建一致性通过。

页面验证：全部682条逐句打开，1185处修饰点击、36题型收藏及三步练习通过；原文与目标一致，无旧版回退，译文存在；另逐项核对22条所有现有源索引、26个旧v51练习和26个新状态，迁移幂等且原答案归档。离线脚本异常0、云端PUT 0。桌面/iPad实际查看。

本次授权：`review/P3-parser-一次性范围授权.json`绑定当前HEAD、build/parse_skel.py和build/check.py的文件SHA及精确补丁SHA；使用新参数即可同时核对本轮授权与此前已批准的swing例外。旧swing记录未篡改，因check.py已按本轮授权增加入口，不再用于核对本次最终补丁。提交后本轮授权失效，无永久白名单。

## 给Claude的复审指令

只复审第7项：对照本表22条原样/改成及所列PDF页，检查原卷依据、专项源索引一致性、词位置兼容和受影响拆解。重点检查2019新题型0:23、2021新题型6:3、2024新题型0:11、2025新题型1:4/3:4/5:2。对上方未核定处保留待定；没有更可靠来源时，不按语法猜改。先运行本节检查命令，check使用`--content --p3-parser-authorized-revision`。只列问题，不改文件。本清单是交接材料，不代表已完成Claude复审。
