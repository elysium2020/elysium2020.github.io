# Elysium's Blog

个人技术博客：记录算法题解与工程实践（Astro 7 + SolidJS 静态站点）。

## 技术栈

- **框架**：[Astro 7](https://astro.build)（静态输出）+ [SolidJS](https://www.solidjs.com) 交互岛屿
- **UI 组件**：[Kobalte](https://kobalte.dev) 无障碍组件原语
- **样式**：[UnoCSS](https://unocss.dev)（Wind4 预设、图标预设、attributify）+ Lightning CSS
- **代码高亮**：[Expressive Code](https://expressive-code.com)（Shiki）
- **数学公式**：remark-math + rehype-katex（KaTeX）
- **搜索**：[Pagefind](https://pagefind.app) 全文索引
- **图片**：Astro 内置 `sharp` 图像处理
- **语言/工具链**：TypeScript、pnpm、Node ≥ 22.12（ESM）

## 命令

| 命令            | 说明                                                                                 |
| :-------------- | :----------------------------------------------------------------------------------- |
| `pnpm dev`      | 启动本地开发服务器（`http://localhost:4321`）                                          |
| `pnpm build`    | 构建生产站点到 `./dist/`，随后生成 Pagefind 全文索引                                    |
| `pnpm preview`  | 本地预览构建产物                                                                      |
| `pnpm check`    | 类型检查（`astro sync` + `tsc --noEmit`）                                              |
| `pnpm test`     | 用 Node 内置测试运行器执行 `tests/`                                                    |

首次使用先运行 `pnpm install`。

## 搜索说明

全文搜索依赖构建期生成的 Pagefind 索引。因此：

- `pnpm dev` 下**没有**索引，搜索会自动降级为对标题 / 描述 / 标签的本地过滤；
- 体验完整全文搜索请先 `pnpm build`（或 `pnpm build && pnpm preview`）。

## 部署

推送到 `master` 后由 GitHub Actions 工作流 `.github/workflows/astro.yml` 自动发布到 GitHub Pages。该流程使用 [`withastro/action`](https://github.com/withastro/action)，会执行本仓库的 `pnpm build` 脚本（即 `astro build && pagefind --site dist`），再交给 `actions/deploy-pages` 上线。

## 目录结构

```text
src/
├── components/   # Astro / Solid 组件
├── content/blog/ # Markdown 文章（内容集合）
├── layouts/      # 页面布局
├── lib/          # 数据加载与派生逻辑
└── pages/        # 路由（含 rss.xml）
```
