# 设置与真实旧书验收证据

本目录仅保存计数、来源指纹、断言和脱敏结果。真实书稿、具体问题、答案文字、向量正文、凭据和用户文件路径不上传。测试方法、边界与回滚见 ../../V0.0.20_SETTINGS_REALBOOKS_REPORT.md。

- real-book-a.json、real-book-b.json：两份完整旧书的原生导入、刷新、关键词回退、完整导出再导入与源文件不变。样本分别为 92／84 章；不是模拟书。
- live-vector-a.json、live-vector-b.json：各 6 个真实章节的索引与 4 个改写事实问题，检查最终历史消息、前五条、预算和未来章节隔离。top5.chapter 是抽样后的位置，原章节号见 selectedChapterNumbers。
- live-vector-a-before-fix.json：修复前确实命中章节却没有带回完整事实的失败，保留用于对照。
- live-vector-call-ledger.json：每次向量请求发出前的预算占用记录，包括失败、测试缓存失效后重建的请求。合计 572 次，不是 572 个问题。
- live-vector-summary.json：572 次请求包含 5471 条输入，向量为 3072 维；finalRunsStatuses 只汇总最后两次运行实际记录的 155 个 HTTP 200 响应，不代表全部 572 次响应。第一次样本的最终复验复用了先前真实索引，所以其索引 requests 为 0；查询重新调用真实服务。
- settings-worldbook.json：本地 mock 浏览器的设置分类、320／360／768／1024／1280 明暗主题点击、世界书保存/导回/请求、向量连接与增量索引断言。此文件不能证明真实写作或生图服务兼容。
- 320-light.png、1024-dark.png：使用合成空白书的手机与平板界面截图，不含用户书稿。
- browser-gate-prior-failure.log、reader-prior-failure.json：旧阅读导航脚本仍进入已搬走控件的分区而失败；该批次随后主动中止，不能算完整门禁。
- browser-gate-second-failure.json／.log：第二批完整执行的 28/32 结果，四项失败保留。announcement-prior-failure、branch-announcement-prior-failure 是旧公告正文断言；tablet-prior-failure 是弹窗动画中的尺寸；memory-ui-prior-failure 是把说明文字当作停止按钮。修正原因见检测报告，原尺寸、点击、取消和数据保护要求没有降低。
- browser-gate-third-failure.json／.log、search-frame-prior-failure.json：第三批 31/32，Enter 跳转的目标高亮在固定 180ms 等待后未出现；改为等待实际渲染帧，保留高亮断言。
- browser-gate-fourth-failure.json／.log：第四批 31/32，角色与阅读导航子进程启动 1.3 秒以 Windows 0xC0000409 退出，没有断言输出；原结果保留，不计通过。
- browser-gate-fifth-failure.json／.log、search-click-prior-failure.json：第五批 31/32，v19 鼠标搜索专项读取短暂高亮的时序失败；改为等待 Vue 更新与渲染帧，保留点击、高亮和尺寸断言。search-click-recheck.log 为随后原专项复验。
- browser-gate-sixth-failure.json／.log：第六批 31/32，性能测试进程 1.5 秒以 0xC0000409 退出，无断言输出；storage-process-recheck.log 保留其后原命令单独执行的结果。
- browser-gate-seventh-failure.log：提示语改为“辅助功能”后，旧单测仍逐字要求“上下文”；该批提前停止，不算完整门禁。修正预期后审查员专项 15/15 通过，再重新执行整套。
- memory-browser.json、tablet-browser.json、announcement-browser.json、branch-browser.json：最终完整门禁中的相关专项明细，便于对照上述失败。
- basic-gate.log：最后代码修改后的普通门禁；browser-gate.json／.log 为其后重新完整执行的浏览器门禁。
- reviewed-files.json：最后审查的源文件和构建产物 LF 归一化指纹；线上验收另用 Git 提交原始字节比较。pages-before.json 是发布前两站状态。

真实服务调用只使用授权的 OpenAI 兼容 /embeddings 和 [官]gemini-embedding-2。写作、总结、生图、外部重排没有真实调用。47 条找不到现存章节来源的记忆仍保留，没有自动关联。整书任意问题效果与手机真机仍未覆盖。

- performance.json：最终完整门禁内五轮合成百万字书性能、增量写入和故障回滚结果；全部 17 条断言通过。
- public-release-gate.json／public-release.log：候选 f97adad 的公测 HTTPS 发布门禁 55/55；public-release-results.json、public-tablet-results.json 分别包含入口与触屏平板明细及 8 个资源指纹。
- public-settings-worldbook.json／.log：同一线上候选的新设置专项 18/18；书籍为合成夹具，请求为 mock，不消耗真实向量额度。
- pages-candidate.json、repo-metadata.json：两站 Pages 提交／来源／构建及公测身份回执，正式库不变。
- proxy-session.json：经用户本轮授权的临时 GitHub 专用代理启动范围；不是最终关闭证明。最终停止状态在全部上传与验收后检查，保留于本机忽略目录。
