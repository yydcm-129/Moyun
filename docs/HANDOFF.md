# Moyun 接手说明

## 项目定位

Moyun 是本地优先的纯前端长篇小说写作工作台。书籍、章节、正文、设定、角色、卷纲、细纲、资料条目和事件时间线保存在浏览器存储中；模型接口由用户在连接中心自行配置。项目不依赖自有后端，静态入口可部署到 GitHub Pages。

## 源码与构建

- 唯一业务源：[source/moyun.single.html](../source/moyun.single.html)
- 构建脚本：[scripts/build-static-site.cjs](../scripts/build-static-site.cjs)
- 生成入口：`index.html`
- 生成样式：`assets/css/moyun.css`
- 生成逻辑：`assets/js/moyun.js`
- 构建命令：`npm run build`

不要直接编辑 `index.html` 或 `assets/` 下的生成文件。修改 `source/moyun.single.html` 后再构建。

## 关键运行结构

- Vue 3 通过 CDN 加载，应用逻辑集中在单文件源的内联脚本中。
- `novel.value` 保存当前书籍，`novelVolumes` 保存卷纲，`activeVolumeEditor` 控制卷纲放大编辑。
- 生成正文、大纲、细纲、评论和工作台补充时，会通过上下文构建逻辑注入设定、资料、事件和卷纲边界。
- `toggleNovelVolumeCollapsed` 管理卷纲全局/单项折叠；v0.0.7 修复了全局收起后单项展开。
- 所有本地数据通过既有保存逻辑持久化；不要在测试中写入真实作品或 API Key。

## 版本和分支规则

当前文档版本：`v0.0.8`。

接手下一轮时：

1. 先读取 `AGENTS.md`、本文件、[UPDATE_LOG.md](./UPDATE_LOG.md) 和 [TEST_REPORT.md](./TEST_REPORT.md)。
2. 检查 `git status --short --branch`，确认没有覆盖用户未提交的修改。
3. 从上一稳定版本创建临时分支，例如 `temp/v0.0.8-v009-work`，再开始任何源码修改。
4. 每轮只把最后一位加 1，并在完成测试后更新日志和检测报告。
5. 需要回滚时使用对应分支/提交；不要使用 `git reset --hard` 或删除用户数据。

## 标准验证

```powershell
npm run build
node --check assets/js/moyun.js
git diff --check
```

涉及 UI 时，使用用户已打开的 Edge 页面进行桌面和 `390×844` 移动端检查。重点检查卷纲内部滚动、收起/单项展开、细纲按钮、Logo 资源、水平溢出和控制台错误。测试服务若确有必要，只使用系统已有 Node，测试完成后立即停止。

## 不可触碰内容

- `F:\yydcm129\codex 自用小说软件\图片和文件\绘图风格2.0.txt` 是用户提供的示例文件，严禁修改。
- 不得未经明确授权下载软件、安装依赖、发送真实 API 请求或上传用户作品。
- 不要把 API Key、Token、真实作品或浏览器导出数据写进仓库。

## 交付格式

每轮最终交付必须说明：版本号、临时分支/提交、更新说明、测试方法和结果、已知风险、回滚位置，以及示例文件未修改的确认。
