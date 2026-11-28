# v0.0.20 可共享验收证据

本目录只归档隔离浏览器中的合成数据与检查结果。真实作品、凭据、日常浏览器档案和CPU采样文件不入库。完整方法、输入、限制及数据回滚见[检测报告](../../V0.0.20_TEST_REPORT.md)。路径中的个人工作区和临时档案目录已替换；性能报告只删去冗长重复探针，保留断言、实际写入键、数据量及每次测量。

- `performance-baseline.json`：开工前旧版、相同固定样例9次。其`passed=false`包含旧版不满足新行为的预期失败，不能当作新版失败，也不代表旧版通过新标准。
- `performance-final.json`：最终源码9次比较，19项断言；含每次样本、中位数、P95、来源指纹、增量保存、懒加载备份与事务中断结果。
- `performance-prior-failure.json`：此前启动改善未达30%的失败摘要；不以旧的好结果替换失败。最终旧/新版紧邻重测，样例和断言保持不变。
- `gate-complete.json`、`gate-publish-date.json`：完整31步浏览器门禁，以及1128公告变更后的10步普通门禁。
- `gate-native-prior-failure.json`：第一次完整浏览器门禁中最后一项进程异常退出的原始记录；原因未定位，不计通过。
- `memory-local.json`、`snapshot-local.json`、`branch-context-date.json`、`settings-search-date.json`、`release-local-date.json`、`performance-current.json`：隔离浏览器与本地mock结果；文件标明各自断言数和限制。
- `date-specific-browser.log`：公告实际发布日期变为1128后，入口、分支和角色批量功能的专项通过日志。
- `phone-character-long-name.png`、`tablet-settings-dark.png`：390宽手机超长角色名与1024×1366平板设置截图。两者是本机Edge视口模拟，不是实体设备照片。

线上补充证据文件：`public-candidate-pages.json`记录目标账号、Pages来源与实际构建；`public-release-gate.json`及两个`public-*-details.json`记录公测55项发布门禁、7个启动文件指纹及桌面/入口/平板结果。`public-memory.json`是公测HTTPS页面内的22项合成记忆测试，真实服务端口已拦截；`public-memory-prior-failure.log`保留首次滚动点击未命中的原始失败，`public-memory-animation-prior-failure.log`保留动画期间43.988px的原始失败；`public-memory.log`为调整等待方式后完整通过记录。`public-characters.log`记录公测站100角色保存与13个尺寸/主题场景。`gate-receipt.json`记录回执更新后的普通门禁与结构审计。候选`3f2ef87f12fc138e59ca41ccb65c7b490a07cb03`已部署，2026-11-28核对Pages构建ID`1409164296`状态built，线上门禁完成。

证据反映本机Edge对公测HTTPS的模拟视口和mock请求；不会证明真实服务商、iOS/厂商真机或用户200.7MB备份。

`public-postdocs-gate-prior-failure.json/.log`保留回执提交后的文件指纹CDP超时；`public-postdocs-release-gate.json`记录并行读取修正后的整轮55/55通过。`public-postdocs-release-results.json`、`public-postdocs-tablet-results.json`及对应`.log`分别保存入口25项和平板30项的详细证据，实际线上基准为`0f2805794371c87f62679a1c5691737eaa01d5a7`，8个资源均匹配Git字节。最终收尾提交的部署回执另保留在本机`.ui-check/release-gate/`并随最终交付说明引用。
