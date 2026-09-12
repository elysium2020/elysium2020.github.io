# 博客重设计 (Technical Archive) 实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将博客从「Bear Blog 式中性极简」演进为 Technical Archive 视觉系统，并补全暗色模式、自托管字体、无障碍、SEO、阅读设施等工程缺口，架构不推倒重来。

**Architecture:** 分层推进——先建设计系统 token 与字体基座，再修布局/无障碍地基，然后组件去重，最后逐页重塑与 SEO。静态内容一律 Astro 零 JS；仅搜索、TOC、阅读进度、主题切换、移动菜单为 Solid island。Kobalte 严格限定在 Dialog。

**Tech Stack:** Astro 7、SolidJS islands、Kobalte（Dialog）、UnoCSS presetWind4 + presetTypography + presetIcons、expressive-code、KaTeX。

## Global Constraints

- Node `>=22.12.0`，包管理器 **pnpm**。
- 路径别名 `@/*` → `./src/*`。
- 不引入新的大型 UI 框架；Kobalte 仅用于 Dialog/交互无障碍关键组件。
- 代码风格：oxfmt（单引号、分号、`sortTailwindcss`）；`.astro` 文件写整洁、缩进一致。
- 强调色**电光青**；文字链接在明/暗双主题均需 **≥4.5:1** 对比度。
- 中文正文用系统字体栈（零下载）；拉丁等宽体自托管子集。
- **每个 Task 的验证循环**：`pnpm check`（astro check 类型通过）→ `pnpm build`（构建成功）→ `pnpm dev` 下核对该 Task 的「验收标准」→ commit。视觉任务以验收标准为「测试」。
- 每步一个动作、频繁提交、DRY / YAGNI。

**Out of scope（本次不做）：** series/合集机制、可筛选题解索引、评论系统、全文搜索后端、全新品牌语言。

---

## 文件结构总览

**新建**

- `src/styles/tokens.css` — 双主题 CSS 变量（唯一色彩来源）
- `src/components/ThemeScript.astro` — `<head>` 内联无闪烁主题初始化
- `src/components/ThemeToggle.tsx` — Solid 主题切换按钮 island
- `src/components/BaseHead.astro` — 统一 SEO/元数据 head
- `src/components/SkipLink.astro` — 跳到主内容
- `src/components/PageHeader.astro` — eyebrow + 标题 + 计数
- `src/components/PostRow.astro` — 统一文章行（唯一来源）
- `src/components/TableOfContents.tsx` — 文章目录 island
- `src/components/ReadingProgress.tsx` — 阅读进度条 island
- `src/lib/reading.ts` — 阅读时长（剔除代码）+ 相关文章
- `src/pages/404.astro` — 404 页
- `public/fonts/jetbrains-mono-*.woff2` — 自托管等宽子集

**修改**

- `uno.config.ts` — 移除 presetWebFonts；加 mono/sans 字体族、surface/link/accent 色、更新 shortcuts
- `src/styles/global.css` — 引入 tokens、base CJK 排版、prose 调优、@font-face
- `astro.config.ts` — 修 `site` 域名
- `src/layouts/Layout.astro` — 唯一 `<main>`、SkipLink、ThemeScript、BaseHead
- `src/components/Header.astro` — 等宽导航、`aria-current`、挂 ThemeToggle
- `src/components/MobileHeader.tsx` — `aria-current`、挂 ThemeToggle
- `src/components/Footer.tsx` — 等宽化
- `src/components/Searcher.tsx` — 结果计数 `aria-live`
- `src/pages/index.astro`、`blog/index.astro`、`blog/[...slug].astro`、`tags/index.astro`、`tags/[tag].astro`、`about.astro` — 用新组件 + Technical Archive 样式
- `src/components/PostItem.astro`、`PostsList.tsx`、`TagsList.tsx`、`ButtonLink.tsx`、`TagLink.tsx` — 收敛/适配

> 说明：`tokens.css` 独立成文件是因为「色彩是全站唯一真源」，与 base 排版关注点不同；`reading.ts` 纯函数便于独立测试。

---

## Task 1: 设计系统 token 层 + Uno 配置 + CJK base 排版

**Files:**

- Create: `src/styles/tokens.css`
- Modify: `src/styles/global.css`
- Modify: `uno.config.ts`

**Interfaces:**

- Produces: CSS 变量 `--background/--surface/--foreground/--muted/--muted-foreground/--border/--accent/--link`（`:root` 与 `:root.dark`）；Uno 颜色 `background surface foreground border muted muted-foreground accent link`；字体族工具类 `font-sans` `font-mono`。

- [ ] **Step 1: 写 tokens.css（双主题唯一色彩来源）**

```css
/* src/styles/tokens.css */
@layer base {
  :root {
    color-scheme: light;
    --background: #ffffff;
    --surface: #f8fafc;
    --foreground: #0f172a;
    --muted: #f1f5f9;
    --muted-foreground: #64748b;
    --border: #e2e8f0;
    --accent: #0891b2; /* 非文字：focus/下划线/图标 */
    --link: #0e7490; /* 文字链接，~5.3:1 过 AA */
  }

  :root.dark {
    color-scheme: dark;
    --background: #0f172a;
    --surface: #1e293b;
    --foreground: #e2e8f0;
    --muted: #1e293b;
    --muted-foreground: #94a3b8;
    --border: #1e293b;
    --accent: #22d3ee; /* 电光青，暗底高对比 */
    --link: #22d3ee;
  }
}
```

- [ ] **Step 2: 改写 global.css（引入 tokens + CJK base；暂不加 @font-face）**

```css
/* src/styles/global.css */
@import './tokens.css';

@layer base {
  html {
    scroll-behavior: smooth;
    -webkit-text-size-adjust: 100%;
  }

  @media (prefers-reduced-motion: reduce) {
    html {
      scroll-behavior: auto;
    }
  }

  body {
    background-color: var(--background);
    color: var(--foreground);
    font-family: var(--font-sans);
    line-height: 1.75; /* CJK 正文更透气 */
    text-rendering: optimizeLegibility;
    -webkit-font-smoothing: antialiased;
  }

  ::selection {
    background-color: color-mix(in srgb, var(--accent) 25%, transparent);
  }
}
```

- [ ] **Step 3: 更新 uno.config.ts（移除 presetWebFonts，加字体族与颜色，更新 shortcuts）**

```ts
// uno.config.ts
import { defineConfig, presetWind4, presetTypography } from 'unocss';
import presetIcons from '@unocss/preset-icons';
import transformerAttributifyJsx from '@unocss/transformer-attributify-jsx';

const SANS =
  'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Microsoft YaHei", "Noto Sans SC", "Hiragino Sans GB", sans-serif';
const MONO =
  '"JetBrains Mono", ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace';

export default defineConfig({
  presets: [
    presetWind4({ preflights: { reset: true } }),
    presetTypography,
    presetIcons({
      collections: {
        mdi: () => import('@iconify-json/mdi/icons.json').then((i) => i.default),
        tabler: () => import('@iconify-json/tabler/icons.json').then((i) => i.default),
      },
    }),
  ],
  transformers: [transformerAttributifyJsx()],
  theme: {
    font: { sans: SANS, mono: MONO },
    colors: {
      background: 'var(--background)',
      surface: 'var(--surface)',
      foreground: 'var(--foreground)',
      border: 'var(--border)',
      accent: 'var(--accent)',
      link: 'var(--link)',
      muted: { DEFAULT: 'var(--muted)', foreground: 'var(--muted-foreground)' },
    },
  },
  preflights: [{ getCSS: () => `:root { --font-sans: ${SANS}; --font-mono: ${MONO}; }` }],
  shortcuts: {
    'section-label': 'font-mono text-xs text-muted-foreground tracking-widest uppercase',
    'page-container': 'mx-auto px-6 py-12 container max-w-4xl',
    'back-link':
      'font-mono text-xs text-muted-foreground inline-flex gap-1.5 items-center transition-colors hover:text-foreground',
    'focus-ring':
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background',
    'date-text': 'font-mono text-xs text-muted-foreground whitespace-nowrap tabular-nums',
    'link-accent':
      'text-link underline decoration-accent/40 underline-offset-2 transition-colors hover:decoration-accent',
  },
});
```

- [ ] **Step 4: 验证类型与构建**

Run: `pnpm check && pnpm build`
Expected: 均通过（若 `presetWebFonts` 仍被别处引用会报错——搜索 `presetWebFonts` 确认已清除）。

- [ ] **Step 5: 视觉验收（`pnpm dev`）**

验收标准：站点仍渲染；`section-label`/日期呈现等宽体；无控制台报错。此时暗色尚不可切换（Task 3 接线），但在 DevTools 给 `<html>` 手动加 `class="dark"` 应看到背景变深、变量生效。

- [ ] **Step 6: Commit**

```bash
git add uno.config.ts src/styles/tokens.css src/styles/global.css
git commit -m "feat(design): add dual-theme tokens, mono/sans font families, remove Google Fonts"
```

---

## Task 2: 自托管 JetBrains Mono 子集 + @font-face + preload

**Files:**

- Create: `public/fonts/jetbrains-mono-latin-400.woff2`, `public/fonts/jetbrains-mono-latin-500.woff2`, `public/fonts/jetbrains-mono-latin-700.woff2`
- Modify: `src/styles/global.css`
- Modify: `src/layouts/Layout.astro`（preload 链接，Task 4 会整合进 BaseHead；此处先加）

**Interfaces:**

- Produces: `font-family: "JetBrains Mono"` 可用（400/500/700）。

- [ ] **Step 1: 获取拉丁子集 woff2**

从 fontsource 取 JetBrains Mono 拉丁子集（三个字重）：

```bash
mkdir -p /tmp/jbm && cd /tmp/jbm
for w in 400 500 700; do
  curl -fsSL "https://cdn.jsdelivr.net/fontsource/fonts/jetbrains-mono@latest/latin-${w}-normal.woff2" \
    -o "jetbrains-mono-latin-${w}.woff2"
done
ls -la
cp jetbrains-mono-latin-*.woff2 "$OLDPWD/public/fonts/"
```

Expected: `public/fonts/` 下出现三个 woff2（各约 15–25KB）。若 CDN 路径失效，改用 `pnpm add -D @fontsource/jetbrains-mono` 后从 `node_modules/@fontsource/jetbrains-mono/files/*-latin-400-normal.woff2` 拷贝对应文件。

- [ ] **Step 2: 在 global.css 声明 @font-face**

在 `global.css` 顶部 `@import './tokens.css';` 之后加：

```css
@font-face {
  font-family: 'JetBrains Mono';
  font-style: normal;
  font-weight: 400;
  font-display: swap;
  src: url('/fonts/jetbrains-mono-latin-400.woff2') format('woff2');
}
@font-face {
  font-family: 'JetBrains Mono';
  font-style: normal;
  font-weight: 500;
  font-display: swap;
  src: url('/fonts/jetbrains-mono-latin-500.woff2') format('woff2');
}
@font-face {
  font-family: 'JetBrains Mono';
  font-style: normal;
  font-weight: 700;
  font-display: swap;
  src: url('/fonts/jetbrains-mono-latin-700.woff2') format('woff2');
}
```

- [ ] **Step 3: 在 Layout `<head>` 加 preload（导航等宽体首屏可见，优先 400）**

在 `Layout.astro` 的 `<head>` 内 `<link rel="icon">` 附近加：

```html
<link
  rel="preload"
  href="/fonts/jetbrains-mono-latin-400.woff2"
  as="font"
  type="font/woff2"
  crossorigin
/>
```

- [ ] **Step 4: 验证构建**

Run: `pnpm build`
Expected: 成功；`dist/fonts/` 含三个 woff2。

- [ ] **Step 5: 视觉验收**

验收标准：`pnpm dev` 下站名/导航/日期为 JetBrains Mono（拉丁数字字形明显等宽、带斜杠 0）；Network 面板确认字体本地加载、无 Google Fonts 请求。

- [ ] **Step 6: Commit**

```bash
git add public/fonts/jetbrains-mono-latin-*.woff2 src/styles/global.css src/layouts/Layout.astro
git commit -m "feat(perf): self-host JetBrains Mono latin subset with preload"
```

---

## Task 3: 无闪烁主题初始化 + 主题切换 island

**Files:**

- Create: `src/components/ThemeScript.astro`
- Create: `src/components/ThemeToggle.tsx`
- Modify: `src/layouts/Layout.astro`
- Modify: `src/components/Header.astro`
- Modify: `src/components/MobileHeader.tsx`

**Interfaces:**

- Consumes: tokens `.dark`（Task 1）。
- Produces: `<ThemeScript />`（放 `<head>` 首位）；`<ThemeToggle client:idle />`（默认导出）。约定 `localStorage['theme']` 取值 `'light' | 'dark'`；`document.documentElement.classList` 含 `dark` 即暗色。

- [ ] **Step 1: ThemeScript.astro（首帧前定 class，杜绝 FOUC）**

```astro
---
// src/components/ThemeScript.astro —— 必须内联、在 body 渲染前执行
---
<script is:inline>
  (() => {
    try {
      const stored = localStorage.getItem('theme');
      const dark = stored ? stored === 'dark' : matchMedia('(prefers-color-scheme: dark)').matches;
      document.documentElement.classList.toggle('dark', dark);
    } catch (_) {}
  })();
</script>
```

- [ ] **Step 2: ThemeToggle.tsx（Solid island，单按钮切换，aria-pressed）**

```tsx
// src/components/ThemeToggle.tsx
import { createSignal, onMount } from 'solid-js';

const ThemeToggle = () => {
  const [dark, setDark] = createSignal(false);

  onMount(() => setDark(document.documentElement.classList.contains('dark')));

  const toggle = () => {
    const next = !dark();
    setDark(next);
    document.documentElement.classList.toggle('dark', next);
    localStorage.setItem('theme', next ? 'dark' : 'light');
  };

  return (
    <button
      type="button"
      onClick={toggle}
      class="hover:text-foreground text-muted-foreground focus-ring rounded-md p-2 transition-colors"
      aria-label={dark() ? '切换到浅色主题' : '切换到深色主题'}
      aria-pressed={dark()}
    >
      <span
        class={dark() ? 'i-tabler-sun h-4.5 w-4.5' : 'i-tabler-moon h-4.5 w-4.5'}
        aria-hidden="true"
      />
    </button>
  );
};

export default ThemeToggle;
```

- [ ] **Step 3: 在 Layout `<head>` 首位挂 ThemeScript**

`Layout.astro` frontmatter 加 `import ThemeScript from "@/components/ThemeScript.astro";`，并在 `<head>` 内**第一个子元素**放 `<ThemeScript />`（在 charset/viewport 之后、其余之前均可，但必须早于任何可见内容）。

- [ ] **Step 4: 在 Header 桌面导航右侧挂 ThemeToggle**

`Header.astro` 加 `import ThemeToggle from "@/components/ThemeToggle.tsx";`。将桌面 `<ul>` 与 `<MobileHeader>` 包一层 `<div class="flex items-center gap-1">`，在 `<ul>` 后加 `<ThemeToggle client:idle />`（桌面）；移动端在 `MobileHeader` 触发器旁也放一个（见 Step 5）。

- [ ] **Step 5: 移动端也放 ThemeToggle**

`MobileHeader.tsx` 顶部菜单栏（`Dialog.Title` 那行）内加入 `<ThemeToggle />`（无需 client 指令，已在 island 内）。import 之。

- [ ] **Step 6: 验证**

Run: `pnpm check && pnpm build`
Expected: 通过。

- [ ] **Step 7: 无闪烁验收**

验收标准：`pnpm dev` →（a）系统设为暗色、无 localStorage 时，首屏直接暗色**无白闪**；（b）点击切换按钮明暗互换并持久化（刷新保持）；（c）代码块主题随之切换（Task 未接 EC 主题切换则先记录，见备注）。

> 备注：expressive-code 双主题切换默认按 `data-theme`/媒体查询；若代码块未跟随 `.dark`，在收尾 Task 12 统一处理 EC 的 `themeCssSelector`（把 mocha 绑到 `:root.dark`）。

- [ ] **Step 8: Commit**

```bash
git add src/components/ThemeScript.astro src/components/ThemeToggle.tsx src/layouts/Layout.astro src/components/Header.astro src/components/MobileHeader.tsx
git commit -m "feat(theme): no-FOUC theme init + light/dark toggle island"
```

---

## Task 4: 布局与无障碍地基（唯一 main、SkipLink、aria-current）

**Files:**

- Create: `src/components/SkipLink.astro`
- Modify: `src/layouts/Layout.astro`
- Modify: `src/components/Header.astro`
- Modify: `src/components/MobileHeader.tsx`
- Modify: 所有页面（去掉各自的 `<main>`）：`index.astro`、`blog/index.astro`、`blog/[...slug].astro`、`tags/index.astro`、`tags/[tag].astro`、`about.astro`

**Interfaces:**

- Produces: 全站唯一 `<main id="main">`；SkipLink 目标 `#main`。

- [ ] **Step 1: SkipLink.astro**

```astro
---
// src/components/SkipLink.astro
---
<a
  href="#main"
  class="bg-background text-foreground border-border focus-ring sr-only z-100 rounded-md border px-4 py-2 focus:not-sr-only focus:absolute focus:left-4 focus:top-3"
>
  跳到主内容
</a>
```

- [ ] **Step 2: Layout 保留唯一 `<main id="main">`，加 SkipLink**

`Layout.astro` `<body>` 结构改为：

```astro
<body class="flex flex-col h-full">
  <SkipLink />
  <Header />
  <main id="main" class="flex-1">
    <slot />
  </main>
  <Footer />
</body>
```

import `SkipLink`。

- [ ] **Step 3: 各页面移除自己的 `<main>`**

把每个页面里最外层的 `<main class="page-container">`（或 `<main class="mx-auto ...">`）替换为 `<div class="page-container">`（文章页与 tag 页保留其原有宽度类，只把标签名 `main`→`div`）。确保页面内不再出现 `main` 标签。

- [ ] **Step 4: 导航 `aria-current`**

`Header.astro`：激活项 `<a>` 加 `aria-current={isActive ? "page" : undefined}`。
`MobileHeader.tsx`：同样加 `aria-current={isActive ? 'page' : undefined}`。

- [ ] **Step 5: 验证**

Run: `pnpm check && pnpm build`
Expected: 通过。

- [ ] **Step 6: 无障碍验收**

验收标准：（a）键盘 Tab 首个可聚焦元素是「跳到主内容」，回车跳转到正文；（b）DevTools 检查每页仅一个 `<main>`；（c）当前导航项 DOM 有 `aria-current="page"`；（d）所有交互元素 focus 有电光青 focus 环。

- [ ] **Step 7: Commit**

```bash
git add src/components/SkipLink.astro src/layouts/Layout.astro src/components/Header.astro src/components/MobileHeader.tsx src/pages
git commit -m "fix(a11y): single main landmark, skip link, aria-current on nav"
```

---

## Task 5: 统一 SEO head + 修 site 域名 + 404

**Files:**

- Create: `src/components/BaseHead.astro`
- Create: `src/pages/404.astro`
- Modify: `astro.config.ts`
- Modify: `src/layouts/Layout.astro`

**Interfaces:**

- Consumes: `Astro.props` from Layout。
- Produces: `BaseHead` props：`{ title: string; description: string; type?: 'website' | 'article'; image?: string; publishedTime?: Date; tags?: string[] }`。Layout 透传这些 props 给 BaseHead。

- [ ] **Step 1: 修 astro.config.ts 的 site**

把 `site: 'https://example.com'` 改为真实域名（占位用 `https://blog.elysium.dev`，实现者按实际替换）。

- [ ] **Step 2: BaseHead.astro（canonical/og/twitter/jsonld/rss 发现）**

```astro
---
// src/components/BaseHead.astro
import ThemeScript from '@/components/ThemeScript.astro';

interface Props {
  title: string;
  description: string;
  type?: 'website' | 'article';
  image?: string;
  publishedTime?: Date;
  tags?: string[];
}
const { title, description, type = 'website', image, publishedTime, tags } = Astro.props;
const canonical = new URL(Astro.url.pathname, Astro.site).href;
const ogImage = image ? new URL(image, Astro.site).href : undefined;
const jsonld =
  type === 'article'
    ? {
        '@context': 'https://schema.org',
        '@type': 'BlogPosting',
        headline: title,
        description,
        datePublished: publishedTime?.toISOString(),
        keywords: tags?.join(', '),
        url: canonical,
      }
    : undefined;
---
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<ThemeScript />
<link rel="icon" href="/favicon.svg" type="image/svg+xml" />
<link rel="icon" href="/favicon.ico" sizes="any" />
<link rel="preload" href="/fonts/jetbrains-mono-latin-400.woff2" as="font" type="font/woff2" crossorigin />
<link rel="canonical" href={canonical} />
<link rel="alternate" type="application/rss+xml" title="Elysium's Blog" href={new URL('/rss.xml', Astro.site).href} />
<title>{title}</title>
<meta name="description" content={description} />
<meta property="og:title" content={title} />
<meta property="og:description" content={description} />
<meta property="og:type" content={type} />
<meta property="og:url" content={canonical} />
{ogImage && <meta property="og:image" content={ogImage} />}
<meta name="twitter:card" content={ogImage ? 'summary_large_image' : 'summary'} />
<meta name="twitter:title" content={title} />
<meta name="twitter:description" content={description} />
{ogImage && <meta name="twitter:image" content={ogImage} />}
{jsonld && <script type="application/ld+json" set:html={JSON.stringify(jsonld)} />}
```

- [ ] **Step 3: Layout 改用 BaseHead**

`Layout.astro` frontmatter 接收扩展 props 并透传：

```astro
---
import '@/styles/global.css';
import BaseHead from '@/components/BaseHead.astro';
import Header from '@/components/Header.astro';
import Footer from '@/components/Footer';
import SkipLink from '@/components/SkipLink.astro';

interface Props {
  pageTitle: string;
  description?: string;
  type?: 'website' | 'article';
  image?: string;
  publishedTime?: Date;
  tags?: string[];
}
const { pageTitle, description = 'Elysium 的博客', type, image, publishedTime, tags } = Astro.props;
---
<html lang="zh-CN" class="h-full">
  <head>
    <BaseHead title={pageTitle} description={description} type={type} image={image} publishedTime={publishedTime} tags={tags} />
    <slot name="head" />
  </head>
  <body class="flex flex-col h-full">
    <SkipLink />
    <Header />
    <main id="main" class="flex-1"><slot /></main>
    <Footer />
  </body>
</html>
```

（移除原先手写的 meta；ThemeScript 现在由 BaseHead 内含——删除 Task 3 里 Layout 单独引入的 ThemeScript 以免重复。）

- [ ] **Step 4: 文章页传 article 元数据**

`blog/[...slug].astro` 的 `<Layout>` 加：`type="article"`、`publishedTime={post.data.pubDate}`、`tags={post.data.tags}`、`image={post.data.heroImage?.src}`。

- [ ] **Step 5: 404.astro**

```astro
---
import Layout from '@/layouts/Layout.astro';
---
<Layout pageTitle="404 · 页面走失了" description="页面不存在">
  <div class="page-container flex flex-col items-center gap-6 py-24 text-center">
    <p class="section-label">Error 404</p>
    <h1 class="text-4xl font-semibold tracking-tight">页面走失了</h1>
    <p class="text-muted-foreground text-sm">你要找的内容不存在，或已被移动。</p>
    <a href="/" class="link-accent font-mono text-sm">← 回到首页</a>
  </div>
</Layout>
```

- [ ] **Step 6: 验证**

Run: `pnpm check && pnpm build`
Expected: 通过；`dist/404.html` 存在。

- [ ] **Step 7: SEO 验收**

验收标准：查看页面源码，`<head>` 含正确 canonical（真实域名）、`og:url`、RSS `<link rel="alternate">`；文章页含 `og:type=article` 与 BlogPosting JSON-LD；`/不存在的路径` 渲染 404 页。

- [ ] **Step 8: Commit**

```bash
git add astro.config.ts src/components/BaseHead.astro src/pages/404.astro src/layouts/Layout.astro src/pages/blog/[...slug].astro
git commit -m "feat(seo): unified BaseHead (canonical/og/jsonld/rss), fix site domain, add 404"
```

---

## Task 6: 组件去重 —— PageHeader + PostRow

**Files:**

- Create: `src/components/PageHeader.astro`
- Create: `src/components/PostRow.astro`
- Modify: `src/components/PostItem.astro`（删除，改用 PostRow）
- Modify: `src/pages/index.astro`、`blog/index.astro`、`tags/index.astro`、`tags/[tag].astro`、`about.astro`
- Modify: `src/components/PostsList.tsx`（搜索结果行改用统一样式，见备注）

**Interfaces:**

- Produces:
  - `PageHeader` props：`{ eyebrow: string; title: string; meta?: string }`
  - `PostRow` props：`{ href: string; title: string; description: string; date: string; tags: string[]; activeTag?: string }`

- [ ] **Step 1: PageHeader.astro**

```astro
---
// src/components/PageHeader.astro
interface Props { eyebrow: string; title: string; meta?: string }
const { eyebrow, title, meta } = Astro.props;
---
<header class="border-border mb-10 border-b pb-10">
  <p class="section-label mb-3">{eyebrow}</p>
  <h1 class="text-4xl font-semibold tracking-tight lg:text-5xl">{title}</h1>
  {meta && <p class="text-muted-foreground mt-2 font-mono text-xs">{meta}</p>}
</header>
```

- [ ] **Step 2: PostRow.astro（唯一文章行来源，档案风：等宽日期列 + 悬停高亮）**

```astro
---
// src/components/PostRow.astro
import TagLink from '@/components/TagLink';
interface Props {
  href: string;
  title: string;
  description: string;
  date: string;
  tags: string[];
  activeTag?: string;
}
const { href, title, description, date, tags, activeTag } = Astro.props;
---
<a
  href={href}
  class="group border-border hover:bg-surface focus-ring -mx-3 flex items-baseline gap-5 border-b border-dashed px-3 py-4 transition-colors first:border-t-0"
  aria-label={`阅读 ${title}`}
>
  <time class="date-text min-w-24 shrink-0">{date}</time>
  <div class="min-w-0 flex-1">
    <h3 class="group-hover:text-link mb-1 truncate text-sm font-medium transition-colors">{title}</h3>
    <p class="text-muted-foreground mb-2 truncate text-xs leading-relaxed">{description}</p>
    <div class="flex flex-wrap gap-1.5">
      {tags.slice(0, 3).map((t) => (
        <span
          class:list={[
            'font-mono rounded px-2 py-0.5 text-xs',
            t === activeTag ? 'bg-accent/15 text-link' : 'bg-muted text-muted-foreground',
          ]}
        >{t}</span>
      ))}
    </div>
  </div>
  <span class="i-mdi-arrow-top-right text-muted-foreground shrink-0 text-xs opacity-0 transition-opacity group-hover:opacity-100" aria-hidden="true" />
</a>
```

- [ ] **Step 3: 首页/blog/tag 列表改用 PostRow + PageHeader**

- `index.astro`：最新文章区把 `PostItem` 循环替换为 `PostRow`（传 `date={formatDate(post.data.pubDate)}` 等）；hero 区标题去 `font-serif` 改 `font-semibold`。
- `blog/index.astro`：头部换 `PageHeader`（eyebrow `All Posts`、title `所有文章`、meta `共 {total} 篇`）。搜索列表见 Step 5。
- `tags/[tag].astro`：头部换 `PageHeader`，文章列表循环换 `PostRow`（传 `activeTag={tag}`）；删除内联行标记。
- `tags/index.astro`：头部换 `PageHeader`。

- [ ] **Step 4: 删除 PostItem.astro**

`git rm src/components/PostItem.astro`（其职责已并入 PostRow）。确认无其他引用：`grep -rn PostItem src`。

- [ ] **Step 5: PostsList.tsx 搜索结果行与 PostRow 视觉对齐**

PostsList 是 Solid island（搜索需客户端），无法直接复用 Astro 的 PostRow。将其行标记改成与 PostRow **同一套 class**（等宽日期列、`border-dashed`、`group-hover:text-link`、tag 用 `font-mono bg-muted`），保证视觉一致。（保留为 Solid 组件，仅同步样式类。）

- [ ] **Step 6: 验证**

Run: `pnpm check && pnpm build`
Expected: 通过；`grep -rn PostItem src` 无结果。

- [ ] **Step 7: 验收**

验收标准：首页、`/blog`、`/tags/xxx` 三处文章行**外观完全一致**（等宽日期、虚线分隔、悬停标题变电光青）；四个页面头部为统一 PageHeader。

- [ ] **Step 8: Commit**

```bash
git add -A src/components src/pages
git commit -m "refactor(components): unify PostRow + PageHeader, remove duplication"
```

---

## Task 7: reading.ts —— 阅读时长（剔除代码）+ 相关文章

**Files:**

- Create: `src/lib/reading.ts`

**Interfaces:**

- Consumes: `Post`（`@/lib/blog`）。
- Produces:
  - `readingMinutes(body: string): number`
  - `relatedPosts(current: Post, all: Post[], limit?: number): Post[]`

- [ ] **Step 1: 写函数**

````ts
// src/lib/reading.ts
import type { Post } from '@/lib/blog';

/** 剔除代码块与行内代码后，按 CJK 字数 + 拉丁词数估算阅读分钟数 */
export function readingMinutes(body: string): number {
  const text = body.replace(/```[\s\S]*?```/g, '').replace(/`[^`]*`/g, '');
  const cjk = (text.match(/[一-鿿]/g) ?? []).length;
  const words = (text.match(/[A-Za-z0-9]+/g) ?? []).length;
  const minutes = Math.ceil(cjk / 400 + words / 200);
  return Math.max(1, minutes);
}

/** 按共享标签数排序取前 N 篇（排除自身）；不足时返回已有的 */
export function relatedPosts(current: Post, all: Post[], limit = 3): Post[] {
  const tags = new Set(current.data.tags);
  return all
    .filter((p) => p.id !== current.id)
    .map((p) => ({ p, score: p.data.tags.filter((t) => tags.has(t)).length }))
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score || b.p.data.pubDate.getTime() - a.p.data.pubDate.getTime())
    .slice(0, limit)
    .map((x) => x.p);
}
````

- [ ] **Step 2: 快速自测（临时脚本，验证纯函数）**

````bash
cat > /tmp/t.mjs <<'EOF'
const readingMinutes = (body) => {
  const text = body.replace(/```[\s\S]*?```/g, '').replace(/`[^`]*`/g, '');
  const cjk = (text.match(/[一-鿿]/g) ?? []).length;
  const words = (text.match(/[A-Za-z0-9]+/g) ?? []).length;
  return Math.max(1, Math.ceil(cjk / 400 + words / 200));
};
console.assert(readingMinutes('```\n' + 'x'.repeat(9999) + '\n```') === 1, 'code excluded');
console.assert(readingMinutes('中'.repeat(800)) === 2, 'cjk counted');
console.log('ok');
EOF
node /tmp/t.mjs
````

Expected: 输出 `ok`（无 assert 报错）。

- [ ] **Step 3: 类型检查**

Run: `pnpm check`
Expected: 通过。

- [ ] **Step 4: Commit**

```bash
git add src/lib/reading.ts
git commit -m "feat(reading): reading-time (code-excluded) + related-posts helpers"
```

---

## Task 8: 文章页重塑（TOC / 锚点 / 进度条 / 相关文章）

**Files:**

- Create: `src/components/TableOfContents.tsx`
- Create: `src/components/ReadingProgress.tsx`
- Modify: `src/pages/blog/[...slug].astro`
- Modify: `src/styles/global.css`（prose 调优 + 标题锚点）

**Interfaces:**

- Consumes: `render(post)` 返回的 `headings: { depth: number; slug: string; text: string }[]`；`readingMinutes`、`relatedPosts`（Task 7）。
- Produces: `<TableOfContents client:visible headings={...} />`、`<ReadingProgress client:visible />`。

- [ ] **Step 1: ReadingProgress.tsx**

```tsx
// src/components/ReadingProgress.tsx
import { createSignal, onCleanup, onMount } from 'solid-js';

const ReadingProgress = () => {
  const [pct, setPct] = createSignal(0);
  const update = () => {
    const h = document.documentElement;
    const max = h.scrollHeight - h.clientHeight;
    setPct(max > 0 ? (h.scrollTop / max) * 100 : 0);
  };
  onMount(() => {
    update();
    addEventListener('scroll', update, { passive: true });
    addEventListener('resize', update);
    onCleanup(() => {
      removeEventListener('scroll', update);
      removeEventListener('resize', update);
    });
  });
  return (
    <div class="fixed inset-x-0 top-0 z-50 h-0.5 bg-transparent" aria-hidden="true">
      <div
        class="bg-accent h-full origin-left transition-[width] duration-75"
        style={{ width: `${pct()}%` }}
      />
    </div>
  );
};
export default ReadingProgress;
```

- [ ] **Step 2: TableOfContents.tsx（滚动高亮当前节）**

```tsx
// src/components/TableOfContents.tsx
import { createSignal, For, onCleanup, onMount } from 'solid-js';

type Heading = { depth: number; slug: string; text: string };

const TableOfContents = (props: { headings: Heading[] }) => {
  const items = () => props.headings.filter((h) => h.depth === 2 || h.depth === 3);
  const [active, setActive] = createSignal('');

  onMount(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setActive(e.target.id);
      },
      { rootMargin: '0px 0px -70% 0px', threshold: 1 },
    );
    for (const h of items()) {
      const el = document.getElementById(h.slug);
      if (el) observer.observe(el);
    }
    onCleanup(() => observer.disconnect());
  });

  return (
    <nav class="text-xs" aria-label="目录">
      <p class="section-label mb-3">On this page</p>
      <ul class="border-border space-y-2 border-l">
        <For each={items()}>
          {(h) => (
            <li style={{ 'padding-left': `${(h.depth - 2) * 12 + 12}px` }}>
              <a
                href={`#${h.slug}`}
                class:list={[
                  'block truncate transition-colors',
                  active() === h.slug
                    ? 'text-link font-medium'
                    : 'text-muted-foreground hover:text-foreground',
                ]}
              >
                {h.text}
              </a>
            </li>
          )}
        </For>
      </ul>
    </nav>
  );
};
export default TableOfContents;
```

- [ ] **Step 3: prose 调优 + 标题锚点样式（global.css）**

在 `global.css` 追加：

```css
@layer base {
  /* 文章正文 CJK 调优 */
  .prose {
    --un-prose-body: var(--foreground);
    line-height: 1.85;
  }
  .prose :where(h2, h3) {
    scroll-margin-top: 5rem;
    font-weight: 600;
    letter-spacing: -0.01em;
  }
  /* 标题锚点：hover 显示 # */
  .prose :where(h2, h3) > a.anchor {
    margin-left: 0.4em;
    opacity: 0;
    color: var(--accent);
    text-decoration: none;
    transition: opacity 0.15s;
  }
  .prose :where(h2, h3):hover > a.anchor {
    opacity: 1;
  }
  .prose a:not(.anchor) {
    color: var(--link);
    text-decoration-color: color-mix(in srgb, var(--accent) 40%, transparent);
    text-underline-offset: 2px;
  }
}
```

- [ ] **Step 4: 标题锚点自动注入（rehype 插件）**

`astro.config.ts` 的 markdown `rehypePlugins` 增加 `rehype-slug` 与 `rehype-autolink-headings`（配置 `behavior: 'append'`、`properties: { class: 'anchor', ariaLabel: '锚点' }`、`content` 为 `#`）。先安装：

```bash
pnpm add -D rehype-slug rehype-autolink-headings
```

在 `astro.config.ts`：

```ts
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
// markdown.processor rehypePlugins:
[
  rehypeKatex,
  rehypeSlug,
  [
    rehypeAutolinkHeadings,
    {
      behavior: 'append',
      properties: { class: 'anchor', 'aria-label': '锚点链接' },
      content: { type: 'text', value: '#' },
    },
  ],
];
```

- [ ] **Step 5: 重写 blog/[...slug].astro 文章页布局**

结构：进度条（island）→ back-link → 文章两栏（`lg:grid lg:grid-cols-[1fr_16rem] lg:gap-12`，右列 sticky TOC，仅当 `headings.length > 0`）→ header（标签 eyebrow、`font-semibold` 标题、元信息栏用 `readingMinutes(post.body)`）→ prose 正文 → footer（标签 + `relatedPosts` 卡片，替换按日期 prev/next）。关键片段：

```astro
---
import { render } from 'astro:content';
import { allPosts, sortedPosts, type Post, formatDate } from '@/lib/blog';
import { readingMinutes, relatedPosts } from '@/lib/reading';
import Layout from '@/layouts/Layout.astro';
import TagLink from '@/components/TagLink';
import PostRow from '@/components/PostRow';
import TableOfContents from '@/components/TableOfContents';
import ReadingProgress from '@/components/ReadingProgress';

export async function getStaticPaths() {
  return allPosts.map((post) => ({ params: { slug: post.id }, props: { post } }));
}
const { post } = Astro.props as { post: Post };
const { Content, headings } = await render(post);
const minutes = readingMinutes(post.body ?? '');
const related = relatedPosts(post, sortedPosts);
const tags = post.data.tags ?? [];
---
<Layout pageTitle={post.data.title} description={post.data.description} type="article" publishedTime={post.data.pubDate} tags={tags}>
  <ReadingProgress client:visible />
  <div class="mx-auto max-w-4xl px-6 py-12">
    <a href="/blog" class="back-link mb-10"><span class="i-mdi-arrow-left h-3.5 w-3.5" aria-hidden="true" />全部文章</a>
    <div class:list={['lg:grid lg:gap-12', headings.length > 0 && 'lg:grid-cols-[1fr_15rem]']}>
      <article aria-label={post.data.title}>
        <header class="mb-8">
          {tags.length > 0 && <p class="section-label mb-3">{tags.slice(0, 3).join(' · ')}</p>}
          <h1 class="mb-5 text-4xl font-semibold leading-tight tracking-tight lg:text-5xl">{post.data.title}</h1>
          <div class="text-muted-foreground border-border flex items-center gap-4 border-b pb-6 font-mono text-xs">
            <span class="inline-flex items-center gap-1.5"><span class="i-mdi-calendar h-3.5 w-3.5" /><time>{formatDate(post.data.pubDate)}</time></span>
            <span class="inline-flex items-center gap-1.5"><span class="i-mdi-clock-outline h-3.5 w-3.5" />约 {minutes} 分钟</span>
          </div>
        </header>
        <div id="post-content" class="prose prose-zinc dark:prose-invert prose-lg max-w-none">
          <Content />
        </div>
        <footer class="border-border mt-12 border-t pt-8">
          {tags.length > 0 && <div class="mb-8 flex flex-wrap gap-2">{tags.map((t) => <TagLink tag={t} icon />)}</div>}
          {related.length > 0 && (
            <section aria-label="相关文章">
              <p class="section-label mb-4">相关文章</p>
              <div class="flex flex-col">
                {related.map((p) => (
                  <PostRow href={`/blog/${p.id}`} title={p.data.title} description={p.data.description} date={formatDate(p.data.pubDate)} tags={p.data.tags} />
                ))}
              </div>
            </section>
          )}
        </footer>
      </article>
      {headings.length > 0 && (
        <aside class="hidden lg:block">
          <div class="sticky top-20"><TableOfContents client:visible headings={headings} /></div>
        </aside>
      )}
    </div>
  </div>
</Layout>
```

（`PostRow` 现为 `.astro`，在 `.astro` 中直接以组件用；无需 client 指令。）

- [ ] **Step 6: 验证**

Run: `pnpm check && pnpm build`
Expected: 通过。

- [ ] **Step 7: 阅读页验收**

验收标准（用监控系列长文验证）：（a）顶部电光青进度条随滚动增长；（b）桌面右侧出现 sticky TOC，滚动时当前节高亮为电光青；（c）hover 标题出现可点 `#` 锚点，点击后 URL 带 hash 且滚动位置正确（`scroll-margin-top` 生效不被 header 遮挡）；（d）底部显示 2–3 篇相关文章而非按日期 prev/next；（e）阅读时长明显小于旧值（代码被剔除）；（f）移动端 TOC 隐藏、正文单栏。

- [ ] **Step 8: Commit**

```bash
git add src/components/TableOfContents.tsx src/components/ReadingProgress.tsx src/pages/blog/[...slug].astro src/styles/global.css astro.config.ts package.json pnpm-lock.yaml
git commit -m "feat(reading): article TOC, reading progress, heading anchors, related posts"
```

---

## Task 9: 搜索无障碍（aria-live）+ Searcher 档案化

**Files:**

- Modify: `src/components/Searcher.tsx`

- [ ] **Step 1: 结果计数加 aria-live，输入框档案化**

在 `Searcher.tsx`：

- 包裹结果计数与空状态的容器加 `aria-live="polite"`，使结果数变化被屏幕阅读器播报：

```tsx
<div aria-live="polite">
  <Show when={tokens().length > 0 && filtered().length > 0}>
    <p class="text-muted-foreground mt-2 font-mono text-xs">
      找到 {filtered().length} {noun()}
    </p>
  </Show>
  <Show when={tokens().length > 0 && filtered().length === 0}>
    <div class="mt-12 flex flex-col items-center gap-3 text-center">
      <span
        class="i-mdi-magnify-remove-outline text-muted-foreground/40 h-10 w-10"
        aria-hidden="true"
      />
      <p class="text-muted-foreground text-sm font-medium">没有找到相关{noun()}</p>
    </div>
  </Show>
</div>
```

- 输入框 class 的 `focus:ring-foreground/30` 改为 `focus:ring-accent/40`，与全站 focus 语义统一；搜索图标加 `aria-hidden="true"`。

- [ ] **Step 2: 验证**

Run: `pnpm check && pnpm build`
Expected: 通过。

- [ ] **Step 3: 验收**

验收标准：`/blog` 搜索输入时结果计数即时更新；开启屏幕阅读器（或 DevTools Accessibility 面板确认 live region）时计数变化被播报；focus 环为电光青。

- [ ] **Step 4: Commit**

```bash
git add src/components/Searcher.tsx
git commit -m "fix(a11y): announce search result count via aria-live, unify focus ring"
```

---

## Task 10: 首页 + About + Footer 视觉收束（Technical Archive）

**Files:**

- Modify: `src/pages/index.astro`、`src/pages/about.astro`、`src/components/Footer.tsx`、`src/components/ButtonLink.tsx`、`src/components/TagLink.tsx`

- [ ] **Step 1: 首页 hero 档案化**

`index.astro` hero：eyebrow 保持 `section-label`（现为等宽）；`<h1>` 去 `font-serif` 改 `font-semibold tracking-tight`；描述文案保留；`ButtonLink` 主按钮用 `bg-foreground text-background`，次按钮用边框。区块标题「最新文章 / 热门标签」保持 `section-label`。确保用 Task 6 的 `PostRow`。

- [ ] **Step 2: ButtonLink 与 TagLink 融入电光青语义**

- `ButtonLink.tsx`：primary 悬停 `hover:bg-accent hover:text-background`（电光青行动色）；secondary 悬停边框 `hover:border-accent/50 hover:text-foreground`。
- `TagLink.tsx`：加 `font-mono`；悬停 `hover:border-accent/50 hover:text-link`。

- [ ] **Step 3: About 标题去 serif + 等宽标签**

`about.astro`：`<h1>` 去 `font-serif` 改 `font-semibold tracking-tight`；技术栈 chip 加 `font-mono`；`section-label` 已等宽。

- [ ] **Step 4: Footer 等宽化**

`Footer.tsx`：整体文本加 `font-mono text-xs`；`Elysium` 去 `font-serif`。

- [ ] **Step 5: 验证**

Run: `pnpm check && pnpm build`
Expected: 通过。

- [ ] **Step 6: 全站视觉验收**

验收标准：首页、About、Footer 呈现统一 Technical Archive 气质（等宽元信息、无 serif、电光青交互色）；明暗双主题均协调；无遗留 `font-serif`（`grep -rn "font-serif" src` 应为空）。

- [ ] **Step 7: Commit**

```bash
git add src/pages/index.astro src/pages/about.astro src/components/Footer.tsx src/components/ButtonLink.tsx src/components/TagLink.tsx
git commit -m "feat(design): Technical Archive pass on home, about, footer, buttons, tags"
```

---

## Task 11: 文章 OG 预览图生成（archive 风模板）

> 唯一新增运行时依赖的任务。若要保持零新增依赖，可跳过本 Task，OG 退化为无图 `summary` 卡片（BaseHead 已支持）。

**Files:**

- Modify: `astro.config.ts`（加 integration）
- Modify: `src/pages/blog/[...slug].astro`（传 og image 路径）
- Modify: `package.json`

- [ ] **Step 1: 安装 astro-og-canvas（轻量、专用，非 UI 框架）**

```bash
pnpm add astro-og-canvas
```

- [ ] **Step 2: 新增 OG 端点**

```ts
// src/pages/og/[...slug].png.ts
import { OGImageRoute } from 'astro-og-canvas';
import { allPosts } from '@/lib/blog';

const pages = Object.fromEntries(
  allPosts.map((p) => [p.id, { title: p.data.title, description: p.data.tags.join(' · ') }]),
);

export const { getStaticPaths, GET } = OGImageRoute({
  param: 'slug',
  pages,
  getImageOptions: (_id, page) => ({
    title: page.title,
    description: page.description,
    bgGradient: [[15, 23, 42]],
    border: { color: [34, 211, 238], width: 8, side: 'inline-start' },
    font: { title: { color: [226, 232, 240] }, description: { color: [148, 163, 184] } },
  }),
});
```

- [ ] **Step 3: 文章页引用 OG 图**

`blog/[...slug].astro` 的 `<Layout>` `image` 优先用 `post.data.heroImage?.src ?? \`/og/${post.id}.png\``。

- [ ] **Step 4: 验证**

Run: `pnpm build`
Expected: 成功；`dist/og/*.png` 生成。

- [ ] **Step 5: 验收**

验收标准：访问 `/og/<某文章 id>.png` 显示电光青左边框、深底、标题+标签的档案风预览图；文章页 `<head>` 的 `og:image` 指向它。

- [ ] **Step 6: Commit**

```bash
git add astro.config.ts src/pages/og package.json pnpm-lock.yaml src/pages/blog/[...slug].astro
git commit -m "feat(seo): generate archive-style OG preview images per post"
```

---

## Task 12: 收尾校验（EC 主题、对比度、Lighthouse、键盘、双主题）

**Files:**

- Modify: `ec.config.mjs`（代码块主题绑定 `.dark`）
- Modify: 视校验结果修补

- [ ] **Step 1: expressive-code 主题跟随 .dark**

`ec.config.mjs` 设 `themes: ['catppuccin-latte', 'catppuccin-mocha']` 并加 `themeCssSelector: (theme) => theme.name === 'catppuccin-mocha' ? ':root.dark' : ':root'`，`useDarkModeMediaQuery: false`，确保代码块主题严格跟随手动切换的 `.dark`。

- [ ] **Step 2: 对比度校验**

用对比度公式核验：明主题 `--link #0e7490` on `#ffffff`、暗主题 `--link #22d3ee` on `#0f172a`、`--muted-foreground` on 各自背景，均 **≥4.5:1**（正文/链接）。不达标则微调 token（记录最终值回填 spec 第 2.1 节）。

Run（可选，用 node 快速算）：

```bash
node -e "const L=h=>{const s=[0,2,4].map(i=>{let c=parseInt(h.slice(1).substr(i,2),16)/255;return c<=.03928?c/12.92:((c+.055)/1.055)**2.4});return .2126*s[0]+.7152*s[1]+.0722*s[2]};const R=(a,b)=>{const x=L(a),y=L(b);return ((Math.max(x,y)+.05)/(Math.min(x,y)+.05)).toFixed(2)};console.log('light link',R('#0e7490','#ffffff'));console.log('dark link',R('#22d3ee','#0f172a'));"
```

Expected: 两者均 ≥ 4.5。

- [ ] **Step 3: 构建 + Lighthouse / 键盘 / 双主题走查**

Run: `pnpm build && pnpm preview`
手动核对：

- Lighthouse（性能/可访问性/最佳实践/SEO）四项均 ≥95；无 Google Fonts 请求；无 CLS 抖动。
- 纯键盘走查全站：skip link → 导航（`aria-current`）→ 主题切换 → 搜索 → 文章 TOC/锚点，焦点可见且顺序合理。
- 明暗主题逐页切换：无死区、无对比度过低、代码块主题正确跟随。

- [ ] **Step 4: 修补发现的问题并提交**

```bash
git add -A
git commit -m "chore: EC theme binding + contrast/a11y/perf polish from final audit"
```

---

## Self-Review（计划对照 spec 的覆盖检查）

- **暗色死代码** → Task 1（tokens）+ Task 3（无闪烁初始化/切换）+ Task 12（EC 跟随）。✅
- **嵌套 main** → Task 4。✅
- **CJK 字体性能** → Task 1（移除 Google）+ Task 2（自托管子集）。✅
- **site 占位符 / SEO** → Task 5（BaseHead/site）+ Task 11（OG）。✅
- **阅读设施（TOC/锚点/进度/heroImage/相关）** → Task 7 + Task 8。✅
- **PostRow 三处重复 / PageHeader** → Task 6。✅
- **prev/next 按日期无意义** → Task 8（相关文章替换）。✅
- **.astro 排版噪音** → 各 Task 重写涉及页面时一并整洁化（Task 4/6/8/10）。✅
- **内联链接可辨识度 / 强调色** → Task 1（`link-accent`/prose 链接）+ Task 10。✅
- **阅读时长含代码** → Task 7。✅
- **搜索 aria-live** → Task 9。✅
- **404** → Task 5。✅
- **系列机制** → 明确 out of scope，无对应 Task（符合 spec）。✅

类型/命名一致性：`readingMinutes`、`relatedPosts`、`PostRow` props、`PageHeader` props、`ThemeToggle` 的 `localStorage['theme']` 约定在引用处均一致。
