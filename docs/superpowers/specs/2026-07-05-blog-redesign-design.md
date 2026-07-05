# 博客重设计 — 设计文档 (Technical Archive)

- **日期**: 2026-07-05
- **范围档位**: 视觉演进 + 架构补全（保留架构选型，不推倒重来）
- **视觉方向**: Technical Archive（技术档案感）
- **强调色**: 电光青 (electric cyan)
- **字体策略**: 系统中文 + 自托管子集拉丁等宽
- **内容定位**: 泛技术博客（算法/题解只是现阶段占比最大的一类）

---

## 1. 背景与现状

中文技术博客，约 45 篇文章，≈90% 为 LeetCode 算法题解（含代码块与少量 KaTeX 公式），另有一个两篇的「搭建监控平台」系列。技术栈：Astro 7 + SolidJS islands + Kobalte（仅 Dialog/TextField）+ UnoCSS presetWind4 + presetTypography + presetIcons + presetWebFonts；expressive-code 代码块；KaTeX 数学。

架构选型正确，问题集中在「缺失 / 未接线」而非「用错工具」。因此本次为**系统性补全 + 视觉重塑**。

### 现状问题清单（按严重度）

**🔴 严重**

1. **暗色模式是死代码**：`global.css` 定义了 `.dark` 变量、prose 用 `dark:prose-invert`，但全站无任何处将 `.dark` 加到 `<html>`，也无切换按钮、无 `prefers-color-scheme` 处理。expressive-code 打包了 latte+mocha 两套主题却未接线。
2. **嵌套 `<main>` 地标**：`Layout.astro` 有 `<main>`，每个页面又各自渲染 `<main>`，一个页面两个 main 地标——全站无障碍违规。
3. **CJK 字体走 Google Fonts 且无优化**：Noto Sans/Serif SC + Noto Sans Mono CJK SC，数 MB、无子集、无 `font-display`，与性能目标冲突；`Noto Sans Mono CJK SC` 在 Google Fonts 基本取不到。
4. **`site: 'https://example.com'` 占位符**：canonical/sitemap/RSS/OG 全部失效。

**🟡 中等** 5. 「阅读优先」缺阅读设施：无 TOC、无标题锚点、无阅读进度、`heroImage` 定义未用。6. 「post row」组件重复三份：`PostItem.astro` / `PostsList.tsx` / `tags/[tag].astro`。7. prev/next 按全局日期排序，把互不相关的题串在一起。8. `.astro` 文件排版噪音（属性换行/缩进不一致）。9. head 单薄：无 canonical / og:image / RSS 自动发现 / JSON-LD；无 404。

**🟢 轻微** 10. 正文内联链接仅 hover 下划线，扫读性与可辨识度弱（缺强调色）。11. 阅读时长 `body.length/300` 把代码块算入。12. 搜索结果计数变化无 `aria-live` 播报。

---

## 2. 设计系统：Technical Archive

### 2.1 色彩 token（双主题）

保留中性灰阶骨架，引入**电光青**作为唯一强调色，仅用于：正文内联链接、当前导航项、focus 环、交互下划线。

起始 token（实现时用对比度校验法验证 ≥4.5:1，可微调）：

```
Light (:root)
--background:        #ffffff
--surface:           #f8fafc   /* 卡片/代码框微底 */
--foreground:        #0f172a
--muted-foreground:  #64748b   /* 已知 ~4.5:1，元信息用 */
--border:            #e2e8f0
--accent:            #0891b2   /* 非文字：focus/下划线/图标 */
--link:              #0e7490   /* 文字链接，~5.3:1 过 AA */

Dark (.dark)
--background:        #0f172a
--surface:           #1e293b
--foreground:        #e2e8f0
--muted-foreground:  #94a3b8
--border:            #1e293b
--accent:            #22d3ee   /* 电光青，暗底高对比 */
--link:              #22d3ee
```

- 代码块：expressive-code `catppuccin-latte`（light）/ `catppuccin-mocha`（dark），随主题切换。
- **主题策略**：默认跟随系统 `prefers-color-scheme`，提供切换按钮；选择持久化到 `localStorage`。`<head>` 内联极小脚本在首帧前定 `.dark`，杜绝闪白（FOUC）。

### 2.2 排版

- **等宽拉丁体（自托管子集，起始选 JetBrains Mono，可替换）** 用于：站名/导航、日期与阅读时长等元信息、序号、`section-label`、标签。这是 Technical Archive 的记忆点来源。
- **系统中文 sans**（`system-ui, -apple-system, "PingFang SC", "Microsoft YaHei", "Noto Sans SC", sans-serif`）用于正文与标题。
- **标题弃 serif**：改用更重字重 + 更紧字距的 sans（与档案气质一致）。
- 定义模块化字号刻度；**专为 CJK 调 `line-height` / `letter-spacing` / 段距**（当前 prose 用英文默认，中文偏挤）。正文测量宽度控制在舒适 CJK 行长。

### 2.3 档案母题

细边框网格、`tabular-nums` 对齐的日期列、可选序号前缀、克制的分隔线。整体冷静、工程化。

### 取舍

- 放弃 serif 标题失去一点书卷气，换来与内容一致的工程气质。
- 电光青需在明暗双主题分别校验对比度（文字链接用较深青过 AA，非文字元素可更亮）。
- 系统中文字形跨 OS 略有差异——以性能与零抖动为代价换取，符合定位。

---

## 3. 信息架构 & 路由

维持**写作流**为主（泛技术定位），补齐结构：

- **系列（series）机制本次搁置**：不引入 `series` frontmatter，不新增 `/series` 路由。监控两篇靠「同标签相关文章」自然串联。
- **标签**保留强化；算法作为一个大标签簇自然存在，不做专门题解索引。
- 路由：
  - `/` 首页
  - `/blog` 全部文章（**预留分页**以满足可扩展）
  - `/blog/[slug]` 文章页
  - `/tags`、`/tags/[tag]`
  - `/about`
  - `/404`（新增）

### 取舍

不做「可筛选题解表格」重 IA——泛技术定位下会浪费投入且限制未来内容形态。

---

## 4. 阅读体验（第一目标）

文章页重塑：

- **右侧 sticky 目录（TOC）**：桌面显示、移动折叠；由标题自动生成，滚动高亮当前节；仅在有标题时渲染。
- **标题锚点**：hover 出现 `#`，可复制直链。
- **顶部阅读进度条**：极细，随滚动。
- **相关文章替换按日期 prev/next**：给 2–3 篇同标签相关文章；无相关时优雅退化。
- **阅读时长**：剔除代码块后按 CJK 字数估算。
- **`heroImage`**：接线为可选文章头图 + OG 图来源。

### 取舍

TOC/进度条是新增 island，JS 成本极小（`client:visible` + 条件渲染），收益远大于成本。

---

## 5. 组件架构

- **统一 `PostRow`**：收敛首页 `PostItem.astro`、`PostsList.tsx`、`tags/[tag].astro` 三处重复实现为单一来源（Astro 组件；搜索场景用 Solid 包一层传入）。
- 抽出 **`PageHeader`**（eyebrow label + 标题 + 计数），四页复用。
- **island 策略明确化**：静态内容一律 Astro 零 JS；仅**搜索、TOC、主题切换、移动菜单**为 island。
- **Kobalte 严格限定**在 Dialog（移动菜单）与主题切换菜单等交互/无障碍关键组件——符合约束。
- 顺手清理 `.astro` 排版噪音，统一 formatter。

### 取舍

去重会一次性改动多处文件，但此后维护成本大降。

---

## 6. 性能

- 落地**系统中文 + 自托管子集拉丁等宽**：`font-display: swap` + `preload`；中文零下载零抖动。
- **无闪烁主题初始化**：`<head>` 内联脚本首帧前定 `.dark`。
- 审计 hydration，确保首屏关键路径零多余 JS。
- 移除 `presetWebFonts`（Google 依赖）。

---

## 7. 无障碍（Accessibility-first）

- **修复嵌套 `<main>`**：Layout 保留唯一 `<main>`，页面改 `<section>`。
- 新增 **skip-to-content** 链接。
- 导航加 **`aria-current="page"`**。
- 搜索结果计数加 **`aria-live`** 播报。
- 电光青链接在明暗双主题校验 **≥4.5:1**；统一应用 `focus-ring`。

---

## 8. SEO / 元数据

- 修 **`site` 占位域名**（canonical/sitemap/RSS/OG 依赖）。
- 每篇文章**生成 OG 预览图**（Astro 端渲染，档案风模板：标题/标签/站名）。
- `<head>` 补 canonical、`og:url`、`og:image`、Twitter card、**文章 JSON-LD**、**RSS 自动发现 `<link>`**。

---

## 9. 实施顺序（增量、每步不破坏站点）

1. 设计系统 token 层（色彩/字体/字号/主题初始化脚手架）
2. 布局 / Header / Footer + a11y 修复（嵌套 main、skip link、aria-current）
3. 组件去重（`PostRow` / `PageHeader`）
4. 首页
5. 文章页（TOC / 锚点 / 进度条 / 相关文章 / 阅读时长）
6. blog / tags 列表页
7. 性能（自托管字体、主题无闪烁）
8. SEO / OG 图 / JSON-LD / RSS 发现 / 404
9. 收尾校验（对比度、Lighthouse、键盘走查、明暗双主题）

每步可独立预览验证。

---

## 10. 明确的非目标（Out of Scope）

- series/合集 机制（本次搁置）
- 可筛选题解索引 / 表格式 IA
- 引入新的大型 UI 框架
- 全新品牌视觉语言（本次为演进而非推倒重来）
- 评论系统、全文搜索后端（当前客户端子串搜索保留）
