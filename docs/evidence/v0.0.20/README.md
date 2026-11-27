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

以上证据记录本地浏览器和mock验证，不证明真实服务商的效果。公测HTTPS的候选字节、Pages构建与线上检查待发布回执补录。
