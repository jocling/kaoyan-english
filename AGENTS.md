# 给 AI 的入口（英语工作台）
本目录是 GitHub 仓库 `jocling/kaoyan-english` 的本地克隆，也是线上做题页的唯一源码。
1. 开工先 `git pull --rebase`（页面会往仓库写做题记录）。
2. 完整读 `HANDOFF.md`：冻结区、长难句拆解格式、计划表、发布流程。
3. 不手改 `index.html`；改 `build/` 后运行 `python3 build/parse_skel.py && python3 build/build.py`，再跑 `python3 build/check.py` 和 `node build/test/freeze.js`。
4. 预览放 `../../outputs/`，使用者说「推」之前不要 commit/push；不要用 GitHub 网页上传。
