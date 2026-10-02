# 博客重构 — 经典个人技术博客重设计（设计规格）

- **日期**: 2026-10-02
- **档位**: 架构级（视觉重塑 + 组件重构 + 依赖清理）
- **前作**: `docs/superpowers/specs/2026-07-05-blog-redesign-design.md`（Technical Archive，实施不完全）
- **本次决策**: 范围=全站统一重塑；风格=经典个人技术博客；清理=激进（代码层重写 + 删依赖）；新增=Pagefind 全文搜索 + expressive-code 增强；不做评论、不做分享

---

## 1. 背景

中文技术博客，约 45 篇文章，≈90% 为 LeetCode 题解（代码块 + 少量 KaTeX），另有 2 篇监控平台搭建。

技术栈：Astro 7 + `@astrojs/solid-js` + Kobalte（Dialog/TextField）+ UnoCSS（presetWind4 / presetTypography / presetIcons）+ expressive-code + KaTeX，部署 GitHub Pages（`withastro/action`）。

**问题**（旧重设计只完成了一半）：

1. **文章行三处重复**：`PostItem.astro`、`PostsList.tsx`、`tags/[tag].astro` 各写一份，无统一组件。
2. **无阅读设施**：无 TOC、无标题锚点、无阅读进度；prev/next 按全局日期排序；阅读时长按 `body.length/300`（把代码算进去）。
3. **`heroImage` 定义未接线**。
4. **冗余面板**：`Searcher.tsx`、`LinkWithUnderline.tsx`、`ButtonLink.tsx`、`TagLink.tsx` 等碎组件与内联实现并存；`.astro` 排版噪音。
5. **未用依赖**（已核实引用）：`@astrojs/compiler-rs`、`@unocss/preset-web-fonts`、`@astrojs/mdx`（0 个 `.mdx`）、`stylelint*`+`postcss-html`（无脚本/CI 调用）、`@typescript-eslint/parser`（无 ESLint 配置）、`markdown-it`+`sanitize-html`+类型（仅 RSS 使用）。
6. `README.md` 仍是 Astro 起始模板。

**已存在且保留**：双主题令牌、无 FOUC 主题初始化、自托管 JetBrains Mono 子集、skip-link、唯一 `<main>`、`aria-current`、404、JSON-LD、RSS 发现。

---

## 2. 目标与非目标

**目标**：全站视觉统一为「经典个人技术博客」；文章行/页头单一实现；文章页具备完整阅读设施；客户端全文搜索；删除全部未用依赖与死代码。

**非目标**（本轮明确不做）：
- 系列/合集（series）机制、分页（~45 篇不需要）
- 评论系统、分享按钮
- 构建期 OG 预览图生成（改用 `heroImage` 作为 OG 图来源）
- 推倒品牌语言、引入新 UI 框架

---

## 3. 设计系统

- **色彩**：保留双主题 + 电光青。`--accent`（非文字：focus/下划线）`--link`（文字链接）。明暗各校验 ≥4.5:1。令牌分层：`tokens.css`（色）→ `typography.css`（字号/行高）→ `global.css`（base + `@font-face`）。
- **字体**：正文/标题 = 系统中文 sans；元信息/日期/标签/label = 自托管 JetBrains Mono。**弃用 `font-serif`**。
- **字号刻度**：`xs .75 / sm .875 / base 1 / lg 1.125 / xl 1.25 / 2xl 1.5 / 3xl 2 / 4xl 2.5rem`；正文 `line-height 1.8`（CJK），标题 `1.25`、`weight 600`、`tracking-tight`。
- **测度**：文章正文 `max-w-3xl`（~68ch）；列表 `max-w-5xl`。
- **母题**：发丝分隔线、`tabular-nums` 日期列、mono 小标签、hover 青下划线、统一 `focus-ring`。
- **快捷类**（UnoCSS shortcuts，收敛现有）：`page-narrow`、`page-wide`、`section-label`、`focus-ring`、`date-text`、`accent-link`、`back-link`。（注意：原名 `link-accent` 以 `link-` 开头，会被 `presetWind4` 静默吞掉、不产出 CSS，故改名。）

---

## 4. 信息架构与页面

路由：`/`、`/blog`、`/blog/[slug]`、`/tags`、`/tags/[tag]`、`/about`、`/404`、`/rss.xml`。

- **首页 `/`**：HERO（名字 + 一句话 + GitHub/RSS）→ 最新 4 篇（`PostList`）→ 热门标签。
- **列表 `/blog`**：`PageHeader` + `Search` 岛 + 年分组文章行。
- **文章 `/blog/[slug]`**：返回链接 → H1 + 日期/阅读时长/标签 → 顶部阅读进度条 → 桌面右侧 sticky TOC、移动端折叠「本页目录」→ 正文（标题锚点 `#`、expressive-code 增强）→ 标签 → 相关文章（同标签 2–3）→ 同标签优先的 prev/next → 可选 `heroImage`。
- **标签 `/tags`**：`PageHeader` + `Search` 岛 + 标签网格（count 徽标）。
- **标签详情 `/tags/[tag]`**：`PageHeader` + `PostList`。
- **关于 `/about`**：`PageHeader` + 技术栈分组 + 社交链接（数据内联为常量）。
- **404**：沿用现设计，套新 `PageHeader`。

所有列表页复用 `PageHeader.tsx` 与 `PostRow.tsx`。

---

## 5. 组件与文件结构

```
src/
  layouts/BaseLayout.astro        # 唯一 <head>/<main>；header/footer/skip-link/主题内联脚本
  components/
    SiteHeader.astro  SiteFooter.astro
    PageHeader.tsx                # mono eyebrow + h1 + 计数
    PostRow.tsx                   # 唯一文章行（静态页与搜索岛共用）
    PostList.tsx                  # 行容器（年分组 + 空态）
    TagChip.tsx  EmptyState.tsx
    islands/ThemeToggle.tsx  MobileNav.tsx  Search.tsx  Toc.tsx  ReadingProgress.tsx
  lib/
    posts.ts                      # 集合访问 + 派生：排序/标签计数/相关/summary
    reading-time.ts               # 剔代码块 + CJK 感知
    site.ts                       # 站点常量：标题/描述/导航/作者/社交
  pages/ index · blog/index · blog/[...slug] · tags/index · tags/[tag] · about · 404 · rss.xml
  styles/ tokens.css · typography.css · global.css
```

**架构约定（关键）**：展示组件写成 `.tsx`（Solid），由 Astro 页面组合。**不加 `client:*` 时 Astro 在构建期渲染为静态 HTML、0 JS**。仅交互岛 hydrate：
- `ThemeToggle`（`client:idle`）、`MobileNav`（Kobalte `Dialog`，`client:idle`）、`Search`（`client:visible`）、`Toc` + `ReadingProgress`（`client:load`，仅文章页且 TOC 非空时）。

**禁止**：在 Solid 组件顶层或渲染期使用浏览器 API（`onMount`/`createEffect` 内除外），否则构建期 SSR 失败。

**Kobalte 限定**：`Dialog`（MobileNav）、`TextField`（Search）。其余交互用原生元素 + signals。

---

## 6. 数据流

`lib/posts.ts` 产出唯一视图模型：

```ts
type PostSummary = {
  id: string; title: string; description: string;
  pubDate: Date; dateLabel: string;        // zh-CN 长日期
  readingMinutes: number; tags: string[];
  heroImage?: { src: string; width: number; height: number };
  searchable: string;                       // title+description+tags 小写
};
```

- `sortedPosts`（按 `pubDate` 降序）、`allTags`、`getTagCounts`、`getPopularTags(n)`。
- `toSummary(post)`；`getRelated(post, n=3)` = 同标签命中数降序，**同分按日期降序（最近优先）**，无共享标签时回退最近 `limit` 篇；`getPrevNext(post)` = 同标签子序列优先（≥2 篇时），否则全局相邻；`prev` = 更旧（「上一篇」），`next` = 更新（「下一篇」）。
- 搜索数据在构建期序列化进 `Search` 岛（Pagefind 负责全文；`searchable` 供无索引时降级）。

---

## 7. 阅读设施

- **阅读时长**：`lib/reading-time.ts` 剔除围栏代码块与 `$$…$$`/`$…$`，按 CJK 字数（每字 1）+ 拉丁词（每词 1）计，除以 ~350 字/分，最小 1 分钟。
- **TOC**：`render(post)` 返回的 `headings`（构建期，零解析）→ `Toc` 岛；IntersectionObserver scroll-spy 高亮；点击平滑滚动（`prefers-reduced-motion` 时禁用）。无 `h2/h3` 时不渲染。
- **标题锚点**：`rehype-autolink-headings` 包裹/追加 `#` 链接，hover/`focus-visible` 显现。
- **进度条**：`ReadingProgress` 岛，`scroll` 计算 `scrollY/(docHeight-innerHeight)`，顶部 2px；`prefers-reduced-motion` 下仍可（非动效）。
- **降级**：无 JS 时正文与 TOC 仍为静态 HTML（TOC 岛初始渲染完整列表）。

---

## 8. 搜索（Pagefind）

- devDep `pagefind`；`build` = `astro build && pagefind --site dist`。CI 的 `withastro/action` 默认跑 `pnpm build`，索引随之生成。
- 索引范围：文章 `<article>` 标 `data-pagefind-body`；`header`/`footer`/导航/相关文章标 `data-pagefind-ignore`。`meta`：`data-pagefind-meta="title"`。
- `Search` 岛：Kobalte `TextField` + `pagefind.search(query)` 的 Solid 结果列表（异步 `data()` 取标题/摘要）；结果计数 `aria-live="polite"`；空态用 `EmptyState`。
- `astro dev` 无索引：懒加载 `/pagefind/pagefind.js` 失败时渲染禁用态提示（不报错、不阻塞）。

---

## 9. 无障碍 / SEO

- 保留唯一 `<main>`、skip-link、`aria-current="page"`。
- 移动菜单（Kobalte Dialog）焦点陷阱与 Esc 关闭；主题切换 `aria-pressed`。
- TOC 为 `<nav aria-label="本页目录">`；进度条 `role="progressbar"` 或纯装饰 `aria-hidden`。
- `<head>`：canonical、OG（`og:image` 取 `heroImage`，无则省略）、Twitter card、文章 JSON-LD、RSS 发现 `<link>`、自托管字体 `preload`。
- `site` 已为 `https://elysium2020.github.io`，无需改。

---

## 10. 清理清单

**删除组件**：`PostItem.astro`、`PostsList.tsx`、`TagsList.tsx`、`Searcher.tsx`、`TagLink.tsx`、`ButtonLink.tsx`、`LinkWithUnderline.tsx`、`Footer.tsx`、`MobileHeader.tsx`、`SkipLink.astro`、`ThemeScript.astro`、`BaseHead.astro`（重写并入 `BaseLayout`）。

**删除依赖**：
| 依赖 | 依据 |
|---|---|
| `@astrojs/compiler-rs` | 仅 `package.json` 出现，无引用 |
| `@unocss/preset-web-fonts` | `uno.config.ts` 未 import |
| `@astrojs/mdx` | 仓内 0 个 `.mdx`（用户已确认删除） |
| `markdown-it` + `@types/markdown-it` | 仅 `rss.xml.ts`，改用 Container API |
| `sanitize-html` + `@types/sanitize-html` | 同上（自有内容，无需净化） |
| `stylelint-config-recommended` + `stylelint-config-html` + `postcss-html` | 无任何脚本/CI 调用 |
| `@typescript-eslint/parser` | 无 ESLint 配置 |

**删除/改写文件**：`stylelint.config.ts`；`content.config.ts` glob 去 `mdx`；`README.md` 换真实内容。

**新增**：`pagefind`（dev）、`rehype-autolink-headings`（dev）。

**保留**：KaTeX 三件套、`sharp`、`@astrojs/rss`、`@astrojs/sitemap`、`@kobalte/core`、UnoCSS 全家（除 preset-web-fonts）、`oxfmt`/`oxlint` 配置、`expressive-code` + 其 line-numbers/collapsible 插件。**`@astrojs/check` 最终被移除**：`check` 脚本改为 `astro sync && tsc --noEmit` 后它没有任何消费者，而本仓 TypeScript 7 又跑不了 `astro check`（见 Ruling 1/22）；若日后工具链可用再装回。

**expressive-code 增强**：`ec.config.mjs` 保留双主题（latte/mocha）与已装的 `pluginLineNumbers` / `pluginCollapsibleSections`；新增 `frames: { showCopyToClipboardButton: true }`（`@expressive-code/plugin-frames@0.44.2` 已随 `expressive-code` 装入，无需新增依赖）；行高亮用核心 text-markers fence meta（如 ```` ```ts {1,3-5} ````）。

---

## 11. 风险

1. `astro dev` 无 Pagefind 索引 → 搜索降级（README 注明）。
2. Solid 组件构建期渲染、0 JS 的约定需严格遵守（见 §5 禁止项）。
3. 移除 MDX：已确认可接受。
4. RSS 用 `astro/container` 的 `experimental_AstroContainer` 将 `Content` 渲染为 HTML；若受阻，回退保留 `markdown-it`（仅 RSS 一处），其余清理照常。
5. 现有文章 frontmatter 均含 `title/description/pubDate/tags`，`heroImage` 可选；schema 不变。

---

## 12. 验收标准

1. `pnpm build` 成功，`dist/pagefind/` 索引生成，无 TS/astro check 错误。
2. `pnpm dev` 冒烟：首页/列表/文章/标签/关于/404 均可渲染；明暗双主题与切换正常、无 FOUC；键盘可完成 skip-link→导航→内容。
3. 文章页：TOC 高亮随滚动、锚点可跳转、进度条随滚动、相关文章与 prev/next 合理、阅读时长剔除代码。
4. 搜索：构建产物中可搜出文章并跳转；dev 下优雅降级。
5. 死代码/未用依赖清理后，`grep` 无残留引用；`pnpm check` 通过。

---

## 13. 实施顺序

1. 设计系统：`tokens/typography/global` + shortcuts 重写。
2. `lib`（site/posts/reading-time）+ `BaseLayout` + `SiteHeader/SiteFooter` + a11y。
3. 展示组件：`PageHeader` / `PostRow` / `PostList` / `TagChip` / `EmptyState`。
4. 首页 + 列表/标签/关于/404 接入。
5. 文章页：TOC/锚点/进度条/相关/prev-next/heroImage。
6. 搜索：Pagefind 接入 + `Search` 岛。
7. 清理：删组件/依赖、RSS 改 Container API、README、content glob。
8. 收尾：`pnpm build` + `pnpm check` + dev 冒烟 + 键盘/对比度走查。

每步可独立预览；1–7 步之间保持站点可构建。
