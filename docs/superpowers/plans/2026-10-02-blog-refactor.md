# 博客重构（经典个人技术博客）Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 把现有 Astro 博客全站重塑为「经典个人技术博客」，统一文章行/页头组件，补齐阅读设施与 Pagefind 搜索，并删除全部未用依赖与死代码。

**Architecture:** 展示组件写成 Solid `.tsx`，由 Astro 页面组合；不加 `client:*` 时构建期渲染为静态 HTML（0 JS），仅「主题切换 / 移动菜单 / 搜索 / TOC / 进度条」hydrate。Kobalte 仅用于 `Dialog`（移动菜单）与 `TextField`（搜索）。数据访问与派生逻辑拆为纯函数（`lib/derive.ts`），可脱离 Astro 单测。

**Tech Stack:** Astro 7、`@astrojs/solid-js`、`@kobalte/core`、UnoCSS presetWind4/Typography/Icons、Astro Content Collections（glob loader）、expressive-code（core+line-numbers+collapsible+frames）、KaTeX、Pagefind、rehype-autolink-headings、Node ≥22.12 内置测试运行器。

**Spec:** `docs/superpowers/specs/2026-10-02-blog-refactor-design.md`

## Global Constraints

- Node ≥ `22.12.0`，包管理器 `pnpm`；`type: module`。
- 站点：`site = https://elysium2020.github.io`，`lang = zh-CN`，标题 `Elysium's Blog`，作者 `Elysium`。
- Kobalte 仅允许 `Dialog`、`TextField`；不得引入其他 Kobalte 组件。
- Solid 组件默认**不写 `client:*`**；只有 `ThemeToggle`、`MobileNav`、`Search`、`Toc`、`ReadingProgress` 五个岛可 hydrate。
- Solid 组件**禁止在模块顶层或渲染期调用浏览器 API**（`window`/`document`/`localStorage`/`matchMedia`/`IntersectionObserver`），仅可在 `onMount`/`createEffect`/事件处理器内。
- **不新增运行时依赖**；新增 devDependencies 仅允许 `pagefind`、`rehype-autolink-headings`。
- 内容 schema 不变：`title, description, pubDate, updatedDate?, heroImage?, tags`；不新增 frontmatter 字段。
- 强调色保持电光青（`--accent` / `--link` 值同现有 `tokens.css`）；标题弃 `font-serif`。
- 正文测度 `max-w-3xl`，列表 `max-w-5xl`；正文 `line-height: 1.8`。
- 每个 Task 结束时 `pnpm check` 与 `pnpm build` 必须通过（站点保持可构建）。`pnpm check` 定义为 `astro sync && tsc --noEmit`（`astro check` 与仓内 TypeScript 7.0.2 不兼容，为预存在缺陷；见 ledger Ruling 1）。

## Review Focus

1. **无标签文章**：`tags.length === 0` 时，文章页标签区与卡片不得渲染空容器；`PostRow` 不得渲染空 tag 行。
2. **`heroImage` 缺失**（绝大多数文章如此）：文章头与 `<head>` 不得渲染空 `<img>` / 空 `og:image`，且不报错。
3. **搜索索引缺失**（`pnpm dev` 或未跑 Pagefind）：`Search` 岛必须降级为本地 `searchable` 子串过滤，不得抛错、不得白屏。
4. **无 JS / `prefers-reduced-motion`**：TOC 初始 HTML 必须是完整静态列表；进度条与平滑滚动在 reduced-motion 下退化为非动效，不产生布局位移。
5. **URL 特殊字符标签/标题**（含空格、`/`、中文、`#`）：`TagChip` 与文章链接必须正确百分号编码，不产生 404。

---

### Task 1: 纯逻辑层（site / reading-time / derive）+ 测试运行器

**Files:**
- Create: `src/lib/site.ts`, `src/lib/reading-time.ts`, `src/lib/derive.ts`
- Create: `tests/lib.test.mjs`
- Modify: `package.json`（加 `test` script；修 `check` script）, `tsconfig.json`（`exclude` 加 `tests`）

**Interfaces:**
- Produces（后续所有 Task 依赖）:
  - `SITE: { title; author; tagline; description; url; lang }`，`NAV_ITEMS: readonly {title;href}[]`，`SOCIAL_LINKS: readonly {name;href;icon}[]`，`STACK: {label:string; items:{name:string;icon:string}[]}[]`
  - `readingMinutes(markdown: string): number`
  - `type PostLike = { id: string; tags: string[]; pubDate: Date }`
  - `sortPosts<T extends PostLike>(posts: T[]): T[]`（`pubDate` 降序，返回新数组）
  - `getTagCounts(posts: PostLike[]): Map<string, number>`
  - `getPopularTags(posts: PostLike[], limit?: number): string[]`（默认 8，按计数降序，同数保持首现顺序）
  - `getRelated<T extends PostLike>(post: T, posts: T[], limit?: number): T[]`（默认 3；按共享标签数降序，同分按 `pubDate` 降序；排除自身；无共享标签时回退最近 `limit` 篇）
  - `getPrevNext<T extends PostLike>(post: T, posts: T[]): { prev?: T; next?: T }`（`posts` 视为已降序；优先同标签，其次相邻）

- [ ] **Step 1: 写失败测试 `tests/lib.test.mjs`**

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import { readingMinutes } from '../src/lib/reading-time.ts';
import { sortPosts, getTagCounts, getPopularTags, getRelated, getPrevNext } from '../src/lib/derive.ts';

const P = (id, tags, day) => ({ id, tags, pubDate: new Date(`2026-01-${String(day).padStart(2, '0')}`) });

test('readingMinutes: 围栏代码块不计入', () => {
  assert.equal(readingMinutes('```ts\n' + 'word '.repeat(700) + '\n```'), 1);
});
test('readingMinutes: 块级与行内公式不计入', () => {
  assert.equal(readingMinutes('$$ ' + 'word '.repeat(700) + ' $$'), 1);
  assert.equal(readingMinutes('$' + 'word '.repeat(700) + '$'), 1);
});
test('readingMinutes: 700 词基数反证（未剔除时应为 2）', () => {
  assert.equal(readingMinutes('word '.repeat(700)), 2);
});
test('readingMinutes: CJK 按字数、拉丁按词数，350/分钟', () => {
  const zh = '中'.repeat(700);
  assert.equal(readingMinutes(zh), 2);
  assert.equal(readingMinutes(Array(350).fill('word').join(' ')), 1);
});

test('sortPosts: pubDate 降序且不改原数组', () => {
  const input = [P('a', [], 1), P('b', [], 3)];
  assert.deepEqual(sortPosts(input).map((p) => p.id), ['b', 'a']);
  assert.deepEqual(input.map((p) => p.id), ['a', 'b']);
});

test('getTagCounts / getPopularTags', () => {
  const posts = [P('a', ['x', 'y'], 1), P('b', ['x'], 2), P('c', ['z'], 3)];
  assert.equal(getTagCounts(posts).get('x'), 2);
  assert.deepEqual(getPopularTags(posts, 2), ['x', 'y']);
});

test('getRelated: 共享标签数优先，同分按时间降序', () => {
  const posts = sortPosts([P('a', ['x'], 1), P('b', ['x'], 2), P('c', ['y'], 3), P('d', ['z'], 4)]);
  const rel = getRelated(posts.find((p) => p.id === 'a'), posts, 2);
  assert.deepEqual(rel.map((p) => p.id), ['b', 'd']);
});

test('getRelated: 无共享标签时回退最近', () => {
  const posts = sortPosts([P('a', ['x'], 1), P('b', ['y'], 2), P('c', ['z'], 3)]);
  const rel = getRelated(posts.find((p) => p.id === 'a'), posts, 2);
  assert.deepEqual(rel.map((p) => p.id), ['c', 'b']);
});

test('getRelated: 单篇文章返回空数组', () => {
  const only = [P('a', ['x'], 1)];
  assert.deepEqual(getRelated(only[0], only), []);
});

test('getPrevNext: 优先同标签', () => {
  const posts = sortPosts([P('a', ['x'], 1), P('b', ['y'], 2), P('c', ['x'], 3)]);
  const { prev, next } = getPrevNext(posts.find((p) => p.id === 'c'), posts);
  assert.equal(prev.id, 'a');
  assert.equal(next, undefined);
});

test('getPrevNext: 单篇时两端皆 undefined', () => {
  const only = [P('a', [], 1)];
  assert.deepEqual(getPrevNext(only[0], only), { prev: undefined, next: undefined });
});
```

- [ ] **Step 2: 运行测试确认失败**

Run: `node --experimental-strip-types --test tests/`
Expected: FAIL — `Cannot find module '../src/lib/reading-time.ts'`。

- [ ] **Step 3: 实现 `src/lib/reading-time.ts`**

签名 `export function readingMinutes(markdown: string): number`。做法：依次移除围栏代码块 `/```[\s\S]*?```/g`、行内代码 /`[^`]*`/g、块级公式 `/\$\$[\s\S]*?\$\$/g`、行内公式 `/\$[^$\n]*\$/g`；再统计 CJK 字符（`/[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Hangul}]/gu`）与拉丁词（`/[A-Za-z0-9]+/g`）之和，返回 `Math.max(1, Math.round(total / 350))`。

- [ ] **Step 4: 实现 `src/lib/derive.ts`**

```ts
export type PostLike = { id: string; tags: string[]; pubDate: Date };
export function sortPosts<T extends PostLike>(posts: T[]): T[] {
  return posts.toSorted((a, b) => b.pubDate.getTime() - a.pubDate.getTime());
}
export function getTagCounts(posts: PostLike[]): Map<string, number> { /* 累加 */ }
export function getPopularTags(posts: PostLike[], limit = 8): string[] { /* 计数降序 → slice(limit) → 取 key */ }
export function getRelated<T extends PostLike>(post: T, posts: T[], limit = 3): T[] { /* 共享标签数降序，同分按 pubDate 降序（最近优先）；无共享则回退 sortPosts(posts).filter(p=>p!==post).slice(0,limit) */ }
export function getPrevNext<T extends PostLike>(post: T, posts: T[]): { prev?: T; next?: T } { /* 同标签子序列优先，否则相邻；idx±1 越界为 undefined */ }
```

`getPrevNext` 语义固定：在 `posts`（已降序）中取「与 `post` 共享至少一个标签」的子序列；该子序列长度 ≥2 时在其内取前/后一篇，否则回退到 `posts` 全局相邻。**注意**：`getPrevNext` 的 `prev` 指「更旧的一篇」（对应 UI「上一篇」）、`next` 指「更新的一篇」（对应 UI「下一篇」）——即降序数组里的 idx+1 / idx-1；以 Step 1 中 `getPrevNext: 优先同标签` 的断言为准（对最新一篇 `c` 断言 `prev.id === 'a'`）。实现不得交换。

- [ ] **Step 5: 实现 `src/lib/site.ts`** — 常量：`SITE`（`title: "Elysium's Blog"`、`author: 'Elysium'`、`tagline: 'Fullstack / DevOps'`、`description: 'Elysium 的个人技术博客，记录算法题解与工程实践。'`、`url: 'https://elysium2020.github.io'`、`lang: 'zh-CN'`）；`NAV_ITEMS` = 文章 `/blog`、标签 `/tags`、关于 `/about`；`SOCIAL_LINKS` = GitHub `https://github.com/elysium2020`；`STACK` 从现 `src/pages/about.astro` 原样迁移（language/frontend/backend/DevOps 四组）。

- [ ] **Step 6: 加测试脚本、修 check 脚本、排除 tests 出 type-check**

`package.json` scripts 增 `"test": "node --experimental-strip-types --test tests/"`，并把 `"check"` 改为 `"astro sync && tsc --noEmit"`（`astro check` 与仓内 TypeScript 7.0.2 不兼容，属预存在缺陷；见 ledger Ruling 1）。`tsconfig.json` 的 `exclude` 改为 `["dist", "tests"]`。

- [ ] **Step 7: 运行测试 + 类型检查**

Run: `node --experimental-strip-types --test tests/` → 11 tests PASS。
Run: `pnpm check` → 无错误。

- [ ] **Step 8: 提交**

```bash
git add src/lib/site.ts src/lib/reading-time.ts src/lib/derive.ts tests/lib.test.mjs package.json tsconfig.json
git commit -m "feat(lib): add pure site/reading-time/derive helpers with tests"
```

---

### Task 2: 设计系统 + BaseLayout + 站点外壳与岛

**Files:**
- Create: `src/styles/typography.css`
- Modify: `src/styles/tokens.css`, `src/styles/global.css`, `uno.config.ts`
- Create: `src/layouts/BaseLayout.astro`, `src/components/SiteHeader.astro`, `src/components/SiteFooter.astro`
- Create: `src/components/islands/ThemeToggle.tsx`, `src/components/islands/MobileNav.tsx`
- Delete: `src/layouts/Layout.astro`, `src/components/Header.astro`, `src/components/BaseHead.astro`, `src/components/SkipLink.astro`, `src/components/ThemeScript.astro`, `src/components/MobileHeader.tsx`, `src/components/Footer.tsx`
- Modify: 所有 `src/pages/**/*.astro`（7 个）把 `@/layouts/Layout.astro` 改为 `@/layouts/BaseLayout.astro`

**Interfaces:**
- Consumes: `SITE`, `NAV_ITEMS`（Task 1）
- Produces:
  - `BaseLayout` props: `{ pageTitle: string; description?: string; type?: 'website' | 'article'; image?: string; publishedTime?: Date; tags?: string[] }`
  - `SiteHeader` 无 props；`SiteFooter` 无 props
  - `islands/ThemeToggle.tsx` 无 props；`islands/MobileNav.tsx` 无 props

- [ ] **Step 1: 重写 `src/styles/tokens.css`** — 保留现有明暗两套变量值不变（`--background/--surface/--foreground/--muted/--muted-foreground/--border/--accent/--link`）；移除 `@layer base` 包裹，改为顶层 `:root` / `:root.dark`（避免与 global.css 的 layer 嵌套重复）。

- [ ] **Step 2: 新建 `src/styles/typography.css`** — `:root` 定义字号刻度 `--text-xs:.75rem … --text-4xl:2.5rem`、`--leading-body:1.8`、`--leading-heading:1.25`；`@layer base` 内设 `h1–h4 { font-weight: 600; line-height: var(--leading-heading); letter-spacing: -0.02em; }` 与 `body { font-size: 1rem; }`。**不得**出现 `font-serif`。

- [ ] **Step 3: 重写 `src/styles/global.css`** — 保留三个 JetBrains Mono `@font-face`；`@import './tokens.css'; @import './typography.css';`；`html{scroll-behavior:smooth}` + `@media (prefers-reduced-motion: reduce){html{scroll-behavior:auto}}`；`body` 背景/前景/字体/`text-rendering`/`-webkit-font-smoothing`；`::selection`。

- [ ] **Step 4: 更新 `uno.config.ts` shortcuts** — 保留 `focus-ring`、`date-text`、`link-accent`、`back-link`；把 `page-container` 拆为 `page-narrow`（`mx-auto px-6 py-12 max-w-3xl`）与 `page-wide`（`mx-auto px-6 py-12 max-w-5xl`）；`section-label` 去 `font-serif`、保持 `font-mono text-xs tracking-widest uppercase text-muted-foreground`。theme font 去掉 `serif` 键。

- [ ] **Step 5: 创建 `BaseLayout.astro`** — `src/styles/global.css` 导入；`<html lang={SITE.lang}>`；`<head>` 内联主题初始化脚本（原 `ThemeScript` 逻辑：读 `localStorage.theme`，否则 `matchMedia('(prefers-color-scheme: dark)')`，`documentElement.classList.toggle('dark', dark)`，`try/catch` 包裹并加 `/* @ts-ignore */` 需要时）；canonical/OG/Twitter/JSON-LD（`type==='article'` 时）/RSS 发现 `<link>`/favicon/字体 `preload`；`<body class="flex min-h-full flex-col">` 内 `SkipLink` 内联 a → `<SiteHeader/>` → `<main id="main" class="flex-1"><slot/></main>` → `<SiteFooter/>`。**唯一 `<main>`**。

- [ ] **Step 6: 创建 `SiteHeader.astro`** — sticky 发丝下边框；左侧 `SITE.title`（mono）；右侧 `NAV_ITEMS`（`hidden md:flex`，`aria-current={Astro.url.pathname.startsWith(item.href) ? 'page' : undefined}`）、`<ThemeToggle client:idle/>`、`<MobileNav client:idle/>`。

- [ ] **Step 7: 创建 `SiteFooter.astro`** — 居中版权 + `CC-BY-SA 4.0` 文案（不再依赖已删的 `Footer.tsx`/`LinkWithUnderline`；直接 `<a class="link-accent">`）+ CC 图标（`i-tabler-creative-commons*`）。年份用 `new Date().getFullYear()`。

- [ ] **Step 8: 创建 `islands/ThemeToggle.tsx`** — 与现实现一致：`createSignal`、`onMount` 读 `documentElement.classList.contains('dark')`、点击切换 `classList.toggle('dark')` + `localStorage.setItem('theme', ...)`；`aria-pressed`、`aria-label`；图标 `i-tabler-sun`/`i-tabler-moon`。

- [ ] **Step 9: 创建 `islands/MobileNav.tsx`** — Kobalte `Dialog` + `Dialog.Trigger`(`i-mdi-menu`, `aria-label`)/`Portal`/`Overlay`/`Content`/`Title(sr-only)`/`CloseButton`；`createSignal` 控制开合；导航项来自 `NAV_ITEMS`；当前项 `aria-current`；点击项关闭。**不得**在渲染期读 `location`（当前项高亮改用 `onMount` 后的 signal）。

- [ ] **Step 10: 删除被替换文件并改页面的 Layout 导入**

```bash
git rm -q src/layouts/Layout.astro src/components/Header.astro src/components/BaseHead.astro \
  src/components/SkipLink.astro src/components/ThemeScript.astro \
  src/components/MobileHeader.tsx src/components/Footer.tsx src/components/ThemeToggle.tsx
grep -rl "@/layouts/Layout.astro" src/pages | xargs sed -i 's#@/layouts/Layout.astro#@/layouts/BaseLayout.astro#'
grep -rn "Layout.astro" src/pages   # 期望：全部为 BaseLayout.astro
```

- [ ] **Step 11: 验证**

Run: `pnpm check` → 无错误。
Run: `pnpm build` → 成功；`grep -c 'aria-current\|id="main"' dist/index.html` → ≥1；`grep -c 'theme' dist/index.html` → ≥1（内联主题脚本存在）。

- [ ] **Step 12: 提交**

```bash
git add -A
git commit -m "feat(layout): design tokens, BaseLayout, site chrome and theme/mobile islands"
```

---

### Task 3: 统一展示组件 + 重接全部列表页

**Files:**
- Create: `src/components/PageHeader.tsx`, `src/components/PostRow.tsx`, `src/components/PostList.tsx`, `src/components/TagChip.tsx`, `src/components/EmptyState.tsx`
- Create: `src/lib/posts.ts`
- Modify: `src/pages/index.astro`, `src/pages/blog/index.astro`, `src/pages/tags/index.astro`, `src/pages/tags/[tag].astro`, `src/pages/about.astro`, `src/pages/404.astro`, `src/pages/rss.xml.ts`（仅 `import { sortedPosts } from '@/lib/posts'`）、`src/pages/blog/[...slug].astro`（仅改导入行为 `import { allPosts, sortedPosts, type Post, dateLabel as formatDate } from '@/lib/posts'`，并把其中唯一的 `<TagLink tag={tag} icon/>` 换成 `<TagChip tag={tag} icon/>`（props 相同），页面其余内容一律不动——Task 4 才重写该页）、`uno.config.ts`（删除已无消费者的 `page-container`）
- Delete: `src/components/PostItem.astro`, `src/components/PostsList.tsx`, `src/components/TagsList.tsx`, `src/components/Searcher.tsx`, `src/components/TagLink.tsx`, `src/components/ButtonLink.tsx`, `src/components/LinkWithUnderline.tsx`, `src/lib/blog.ts`

**Interfaces:**
- Consumes: `sortPosts`/`getTagCounts`/`getPopularTags`/`getRelated`（Task 1）、`readingMinutes`（Task 1）、`BaseLayout`（Task 2）
- Produces:
  - `lib/posts.ts`: `type Post = CollectionEntry<'blog'> & { tags: string[]; pubDate: Date }`（`allPosts` 把 `data.tags`/`data.pubDate` 展平到顶层以结构满足 `derive` 的 `PostLike`，同时保留 `.data`）；`type PostSummary = { id: string; title: string; description: string; pubDate: Date; dateLabel: string; readingMinutes: number; tags: string[]; heroImage?: { src: string; width: number; height: number }; searchable: string }`；`allPosts: Post[]`、`sortedPosts: Post[]`、`allTags: string[]`、`toSummary(post: Post): PostSummary`
  - `PageHeader` props: `{ eyebrow: string; title: string; count?: string }`
  - `PostRow` props: `{ post: PostSummary }`
  - `PostList` props: `{ posts: PostSummary[]; groupByYear?: boolean; empty?: string }`
  - `TagChip` props: `{ tag: string; icon?: boolean }`
  - `EmptyState` props: `{ icon: string; title: string; hint?: string }`

- [ ] **Step 1: 实现 `src/lib/posts.ts`**

```ts
import { getCollection, type CollectionEntry } from 'astro:content';
import { sortPosts, getTagCounts, getPopularTags, getRelated } from './derive';
import { readingMinutes } from './reading-time';
export const allPosts = await getCollection('blog');
export const sortedPosts = sortPosts(allPosts);
export const allTags = [...new Set(allPosts.flatMap((p) => p.data.tags))].toSorted();
export const popularTags = getPopularTags(sortedPosts, 8);
export { getRelated, getTagCounts };
export const dateLabel = (d: Date) => d.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' });
export function toSummary(post: Post): PostSummary { /* id:post.id, title/description/tags from data, pubDate, dateLabel, readingMinutes(post.body ?? ''), heroImage: post.data.heroImage && {src,width,height}, searchable: `${title} ${description} ${tags.join(' ')}`.toLowerCase() */ }
```

- [ ] **Step 2: 实现 `TagChip.tsx`** — `<a href={`/tags/${encodeURIComponent(tag)}/`}>`；`rounded-full border` 胶囊；`icon` 为真时前置 `i-mdi-tag`；`focus-ring`。

- [ ] **Step 3: 实现 `PostRow.tsx`** — 单行，**严禁嵌套 `<a>`**（HTML 不允许 anchor 套 anchor；浏览器会按 adoption-agency 算法重排，行布局会被打散，且行尾箭头会脱离 `.group` hover 作用域）。用 stretched-link 结构：外层 `<div class="group relative -mx-3 flex items-baseline gap-5 rounded-sm border-b border-border px-3 py-3.5 transition-colors hover:bg-accent/20">`；覆盖式点击区 `<a href={`/blog/${post.id}/`} aria-hidden="true" tabindex="-1" class="absolute inset-0 rounded-sm"/>`（仅扩大点击面，对辅助技术隐藏、不可 Tab 聚焦）；可见标题即真正的链接 `<a href={`/blog/${post.id}/`} class="focus-ring relative truncate text-sm font-medium">{post.title}</a>`；`<time class="date-text min-w-16 shrink-0">{post.dateLabel}</time>`；描述 `line-clamp-1`；行尾箭头 `i-mdi-arrow-top-right`（`group-hover` 显现）；标签行仅当 `post.tags.length > 0` 渲染，容器必须 `relative z-1`（否则会被覆盖层挡住不可点），内放前 3 个 `TagChip`。副作用：非定位的列表文字不可用鼠标选中——列表行可接受。

- [ ] **Step 4: 实现 `PostList.tsx`** — `groupByYear` 为真时按 `pubDate.getFullYear()` 分组，每年一个 `h2`（mono） + 行；否则直接 `PostRow` 列表。`posts.length === 0` 时渲染 `EmptyState`（`empty` 文案默认 `暂无文章`）。

- [ ] **Step 5: 实现 `PageHeader.tsx`** — `<section class="mb-10 border-b border-border pb-10"><p class="section-label mb-3">{eyebrow}</p><h1 class="text-4xl lg:text-5xl">{title}</h1>{count && <p class="mt-2 text-sm text-muted-foreground">{count}</p>}</section>`。

- [ ] **Step 6: 实现 `EmptyState.tsx`** — 居中列：icon（`text-muted-foreground/40 h-10 w-10`）+ `title`（`text-sm font-medium`）+ 可选 `hint`。

- [ ] **Step 7: 重接 `src/pages/index.astro`** — `page-narrow` 容器；HERO（`SITE.title` + `SITE.tagline` + `SOCIAL_LINKS` 链接）；`PageHeader` 不用（首页用 HERO）；「最新文章」取 `sortedPosts.slice(0,4).map(toSummary)` → `PostList`；「热门标签」`popularTags.map(t => <TagChip tag={t}/>)`。

- [ ] **Step 8: 重接 `blog/index.astro`、`tags/index.astro`、`tags/[tag].astro`、`about.astro`、`404.astro`**

- `blog/index.astro`：`page-wide` + `PageHeader(eyebrow="All Posts", title="所有文章", count={`共 ${total} 篇`})` + `PostList posts={summaries} groupByYear`。（搜索岛在 Task 5 加入。）
- `tags/index.astro`：`page-wide` + `PageHeader(eyebrow="All Tags", title="所有标签", count={`共 ${allTags.length} 个标签`})` + 标签网格（沿用 `TagChip` + count 徽标，`grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5`）。（过滤岛在 Task 5 加入。）
- `tags/[tag].astro`：`page-wide` + back-link + `PageHeader(eyebrow="Tag", title={tag}, count={共 N 篇})` + `PostList`。
- `about.astro`：`page-narrow` + `PageHeader(eyebrow="About", title=SITE.author, count=SITE.tagline)` + `STACK` 分组（`divide-y`）+ `SOCIAL_LINKS`。
- `404.astro`：`page-narrow` + `EmptyState` 或原文案，套 `PageHeader(eyebrow="Error 404", title="页面走失了")`。

- [ ] **Step 9: 删除被替换组件**

```bash
git rm -q src/components/PostItem.astro src/components/PostsList.tsx src/components/TagsList.tsx \
  src/components/Searcher.tsx src/components/TagLink.tsx src/components/ButtonLink.tsx \
  src/components/LinkWithUnderline.tsx src/lib/blog.ts
grep -rn "PostItem\|PostsList\|TagsList\|Searcher\|TagLink\|ButtonLink\|LinkWithUnderline\|lib/blog" src || echo "no stale refs"
```

- [ ] **Step 10: 验证**

Run: `pnpm check` → 无错误。
Run: `pnpm build` → 成功。

- [ ] **Step 11: 提交**

```bash
git add -A
git commit -m "feat(components): unify PostRow/PostList/PageHeader/TagChip and rewire pages"
```

---

### Task 4: 文章页阅读设施（TOC / 锚点 / 进度条 / 相关文章 / 阅读时长 / heroImage）

**Files:**
- Modify: `src/pages/blog/[...slug].astro`, `astro.config.ts`, `package.json`
- Create: `src/components/islands/Toc.tsx`, `src/components/islands/ReadingProgress.tsx`

**Interfaces:**
- Consumes: `toSummary`/`getRelated`/`sortedPosts`（Task 3）、`derive.getPrevNext`（Task 1）、`render()` 返回的 `headings`
- Produces: `islands/Toc.tsx` props `{ headings: { depth: number; slug: string; text: string }[] }`；`islands/ReadingProgress.tsx` props `{}`（无）

- [ ] **Step 1: 加锚点插件** — `pnpm add -D rehype-autolink-headings`；`astro.config.ts` 的 `rehypePlugins` 改为 `[rehypeKatex, rehypeAutolinkHeadings]`（顺序：Katex 在前）。插件配置：`{ behavior: 'append', properties: { class: 'heading-anchor', ariaHidden: true, tabIndex: -1 }, content: { type: 'element', tagName: 'span', properties: { className: ['i-mdi-link-variant'] }, children: [] } }`。

- [ ] **Step 2: 实现 `islands/Toc.tsx`** — **初始渲染输出完整 `<nav aria-label="本页目录">` 列表**（无 JS 也可见）；`onMount` 用 `IntersectionObserver`（`rootMargin: '0px 0px -70% 0px'`）标记当前 slug 并高亮；点击 `e.preventDefault()` + `scrollIntoView`（`matchMedia('(prefers-reduced-motion: reduce)').matches` 时 `behavior:'auto'`）。`headings` 为空时返回 `null`。

- [ ] **Step 3: 实现 `islands/ReadingProgress.tsx`** — 固定顶部 2px 条；`onMount` 监听 `scroll`（passive）算 `scrollY/(scrollHeight-innerHeight)` 写入 `transform: scaleX()`；无 JS 时不渲染可见元素（初始宽度 0）；`aria-hidden="true"`。

- [ ] **Step 4: 改写 `blog/[...slug].astro`** — `const { Content, headings } = await render(post)`；`const summary = toSummary(post)`；`const related = getRelated(post, sortedPosts, 3).map(toSummary)`；`const { prev, next } = getPrevNext(post, sortedPosts)`；标签区 `post.data.tags.length > 0` 时才渲染；`heroImage` 存在时在 header 下渲染 `<Image src={post.data.heroImage} ... />`（`astro:assets`，`widths`/`sizes` 或固定 `width`+`loading="eager"`），否则不渲染；正文包 `<article data-pagefind-body>`（data 属性在 Task 5 校验）；桌面右栏 sticky `<Toc client:load headings={headings}/>`（`hidden lg:block`），移动端折叠为 `<details>` 包裹的同一 island 的静态列表（`lg:hidden`）；`<aside>` 放 `related`（`PostList`）与 prev/next 导航（`prev`→「上一篇」、`next`→「下一篇」，指向 `/blog/${id}/`，无则渲染占位文案）。

- [ ] **Step 5: 添加 heading-anchor 样式** — 在 `global.css` 的 `@layer base` 加 `.prose :is(h2,h3) .heading-anchor { opacity: 0; transition: opacity .15s; }` 与 `.prose :is(h2,h3):hover .heading-anchor, .heading-anchor:focus-visible { opacity: .6; }`。

- [ ] **Step 6: 验证**

Run: `pnpm check` → 无错误。
Run: `pnpm build` → 成功。
Run: `grep -o 'class="heading-anchor"' dist/blog/two_sum_ii_-_input_array_is_sorted/index.html | head -1` → 命中（锚点生成）。
Run: `grep -c '本页目录' dist/blog/two_sum_ii_-_input_array_is_sorted/index.html` → ≥1（TOC 静态存在）。

- [ ] **Step 7: 提交**

```bash
git add -A
git commit -m "feat(article): TOC, heading anchors, reading progress, related and prev/next"
```

---

### Task 5: Pagefind 搜索 + `Search` 岛

**Files:**
- Modify: `package.json`（devDep + `build` script）, `src/layouts/BaseLayout.astro`（`SiteHeader`/`SiteFooter` 加 `data-pagefind-ignore`）
- Create: `src/components/islands/Search.tsx`
- Modify: `src/pages/blog/index.astro`, `src/pages/tags/index.astro`, `src/pages/blog/[...slug].astro`（相关文章/导航加 `data-pagefind-ignore`）

**Interfaces:**
- Consumes: `PostSummary`（Task 3）、`EmptyState`（Task 3）
- Produces: `islands/Search.tsx` props:
  ```ts
  type TagItem = { tag: string; count: number; searchable: string };
  type Props =
    | { mode: 'posts'; items: PostSummary[]; placeholder: string; noun: string }
    | { mode: 'tags'; items: TagItem[]; placeholder: string; noun: string };
  ```

- [ ] **Step 1: 安装与脚本** — `pnpm add -D pagefind`；`package.json` 的 `build` 改为 `"astro build && pagefind --site dist"`。

- [ ] **Step 2: 实现 `islands/Search.tsx`**

- Kobalte `TextField` 包裹输入框，`aria-label={placeholder}`。
- `mode === 'tags'`：本地 `tokenize`（`split(/[\s,，、]+/)`）+ `searchable.includes` 过滤，渲染标签网格（同 Task 3 卡片样式）。
- `mode === 'posts'`：`onMount` 异步加载 Pagefind：`const mod = await (new Function('u', 'return import(u)'))('/pagefind/pagefind.js')`；成功后 `mod.init()`；查询时 `mod.search(q)` → 取前 N 条 `await r.data()` → 用 `items` 里 `id` 映射回 `PostSummary` 渲染 `PostRow`。加载失败（dev 无索引）`try/catch` → `setAvailable(false)` → 回退为本地 `searchable` 过滤 `items`。
- 结果计数 `<p aria-live="polite">找到 N {noun}</p>`；无结果渲染 `EmptyState`（icon `i-mdi-magnify-remove-outline`）。
- 输入事件加 150ms 防抖。

- [ ] **Step 3: 接入 `blog/index.astro`** — `<Search client:visible mode="posts" items={summaries} placeholder="搜索文章…" noun="篇文章"/>`，置于 `PageHeader` 与 `PostList` 之间（列表在搜索为空时展示全部；有查询时展示 Pagefind 结果）。

- [ ] **Step 4: 接入 `tags/index.astro`** — `<Search client:visible mode="tags" items={tagItems} placeholder="搜索标签…" noun="个标签"/>` + 其后标签网格。

- [ ] **Step 5: 索引范围属性** — `SiteHeader.astro`/`SiteFooter.astro` 根元素加 `data-pagefind-ignore`；`blog/[...slug].astro` 的 `<article>` 已有 `data-pagefind-body`（Task 4），其内的标签/相关/prev-next 区块加 `data-pagefind-ignore`；给 `<h1>` 加 `data-pagefind-meta="title"`。

- [ ] **Step 6: 验证**

Run: `pnpm build` → 成功且 `dist/pagefind/pagefind.js` 存在。
Run: `ls dist/pagefind/` → 含 `pagefind.js` 与 `index/`。
Run: `pnpm check` → 无错误。

- [ ] **Step 7: 提交**

```bash
git add -A
git commit -m "feat(search): Pagefind index with Kobalte-powered search island"
```

---

### Task 6: 依赖与配置清理 + RSS + README

**Files:**
- Modify: `package.json`, `pnpm-lock.yaml`（由 pnpm 生成）, `astro.config.ts`, `src/content.config.ts`, `src/pages/rss.xml.ts`, `README.md`
- Delete: `stylelint.config.ts`

**Interfaces:**
- Consumes: `sortedPosts`, `SITE`（Task 1/3）
- Produces: 无新导出

- [ ] **Step 1: 删除未用依赖**

```bash
pnpm remove @astrojs/compiler-rs @unocss/preset-web-fonts @astrojs/mdx \
  markdown-it sanitize-html @types/markdown-it @types/sanitize-html \
  stylelint-config-recommended stylelint-config-html postcss-html @typescript-eslint/parser
git rm -q stylelint.config.ts
```

- [ ] **Step 2: `astro.config.ts` 去掉 MDX** — 移除 `import mdx from '@astrojs/mdx'` 与 `integrations` 中的 `mdx()`。

- [ ] **Step 3: `src/content.config.ts` 去掉 mdx glob** — `pattern: '**/*.md'`。

- [ ] **Step 4: 重写 `src/pages/rss.xml.ts` 用 Container API**

```ts
import rss from '@astrojs/rss';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { getContainerRenderer } from '@astrojs/solid-js/container-renderer';
import { render } from 'astro:content';
import { sortedPosts } from '@/lib/posts';
import { SITE } from '@/lib/site';
```
实现：`const container = await AstroContainer.create({ renderers: [await getContainerRenderer()] })`；对每篇 `const { Content } = await render(post)`、`content: await container.renderToString(Content)`。`title: SITE.title`、`description: SITE.description`、`customData: '<language>zh-CN</language>'`。**若 `getContainerRenderer` 子路径导入失败**，回退导入 `@astrojs/solid-js` 的 `getContainerRenderer`（已弃用但有导出）；**若 Container 渲染仍失败**，回退方案：`pnpm add -D markdown-it @types/markdown-it` 并用旧实现，其余清理不变。

- [ ] **Step 5: 重写 `README.md`** — 项目简介、技术栈、`pnpm dev`/`build`/`preview`/`check`/`test` 脚本表；**注明**：`astro dev` 下无 Pagefind 索引，搜索会降级为本地过滤，需 `pnpm build` 后才能体验全文搜索；删除 Astro starter 模板内容。

- [ ] **Step 6: 验证**

Run: `pnpm install && pnpm check && pnpm build` → 全部成功。
Run: `grep -rn "markdown-it\|sanitize-html\|compiler-rs\|preset-web-fonts\|@astrojs/mdx\|stylelint" package.json astro.config.ts src || echo clean` → 输出 `clean`。
Run: `ls dist/rss.xml && grep -c "<item>" dist/rss.xml` → ≥ 文章数。
Run: `node --experimental-strip-types --test tests/` → PASS（回归）。

- [ ] **Step 7: 提交**

```bash
git add -A
git commit -m "chore: drop unused deps/config, RSS via container API, real README"
```

---

### Task 7: 收尾验证（构建产物 + 冒烟 + a11y/对比度）

**Files:**
- Modify: `ec.config.mjs`（expressive-code 复制按钮 + 行高亮示例注释）

**Interfaces:** 无新导出

- [ ] **Step 1: expressive-code 增强** — `ec.config.mjs` 的 `defineEcConfig` 增 `frames: { showCopyToClipboardButton: true }`（保留 `plugins`、`themes`、`defaultProps`）。

- [ ] **Step 2: 全量构建与检查**

Run: `pnpm check && pnpm build` → 成功；`dist/pagefind/pagefind.js` 存在。

- [ ] **Step 3: 预览冒烟（真实渲染）**

Run: `pnpm preview`（后台）后对以下路径各取一次 HTTP 200 且含关键标记：
- `/` → 含 `SITE.title`
- `/blog/` → 含 `搜索文章`（Search 岛输入）
- `/blog/two_sum_ii_-_input_array_is_sorted/` → 含 `本页目录`、`heading-anchor`
- `/tags/` → 含 `搜索标签`
- `/about/`、`/404`（`/404` 由 Astro 生成 `dist/404.html`）

- [ ] **Step 4: 浏览器冒烟（按需）** — `browser` 打开 `pnpm preview` 地址，验证：主题切换写入 `localStorage` 且刷新无 FOUC；移动端菜单可开合并 `Esc` 关闭；文章页滚动 TOC 高亮与进度条推进；构建产物搜索框输入能出结果并跳转。

- [ ] **Step 5: 对比度与键盘走查** — 明暗两主题下 `--link` 对 `--background` ≥4.5:1、`--muted-foreground` 对背景 ≥4.5:1；Tab 顺序 skip-link → 导航 → 内容，焦点环可见。

- [ ] **Step 6: 提交**

```bash
git add -A
git commit -m "chore(ec): enable copy button; final build and a11y verification"
```

---

## Self-Review

**Spec coverage:** §3 设计系统→Task 2；§4 IA/页面→Task 3+4；§5 组件结构→Task 2/3/5；§6 数据流→Task 1+3；§7 阅读设施→Task 1(reading-time)+Task 4；§8 搜索→Task 5；§9 a11y/SEO→Task 2(BaseLayout head)+Task 7；§10 清理→Task 3(组件)+Task 6(依赖)；§13 顺序→Task 1–7。无未覆盖章节。

**Type consistency:** `PostSummary` 定义只在 Task 3 一次，Task 5 复用；`PostLike`（Task 1）与 `Post`/`PostSummary`（Task 3）命名区分明确；`getPrevNext` 的 prev/next 方向在 Task 1 Step 4 显式锁定。

**Review Focus 落实:** 第 1、5 条由 Task 1 derive 测试（空标签、单篇）与 Task 3 `TagChip` `encodeURIComponent` 覆盖；第 2 条由 Task 4 Step 4 的条件渲染覆盖；第 3 条由 Task 5 Step 2 的 `try/catch` 降级覆盖；第 4 条由 Task 4 Step 2/3 的静态 TOC 与 reduced-motion 分支覆盖。
