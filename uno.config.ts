import { defineConfig, presetWind4, presetTypography } from 'unocss';
import presetIcons from '@unocss/preset-icons';
import transformerAttributifyJsx from '@unocss/transformer-attributify-jsx';
import { SOCIAL_LINKS, STACK } from './src/lib/site';

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
  // UnoCSS 的 Astro 集成只扫描 `src/components/**/*` 且 Vite include 不含纯 `.ts`，
  // 因此仅存在于 `src/lib/site.ts` 中的图标类名不会被自动提取，必须从该数据源显式加入 safelist。
  safelist: [
    'i-mdi-link-variant',
    'inline-block',
    ...STACK.flatMap(({ items }) => items.map(({ icon }) => icon)),
    ...SOCIAL_LINKS.map(({ icon }) => icon),
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
    'page-narrow': 'mx-auto px-6 py-12 max-w-3xl',
    'page-wide': 'mx-auto px-6 py-12 max-w-5xl',
    'back-link':
      'font-mono text-xs text-muted-foreground inline-flex gap-1.5 items-center transition-colors hover:text-foreground',
    'focus-ring':
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background',
    'date-text': 'font-mono text-xs text-muted-foreground whitespace-nowrap tabular-nums',
    // 注意：`presetWind4` 会静默吞掉以 `link-` 开头的 shortcut 名（不生成任何 CSS）。
    // 该 shortcut 原名 `link-accent`，导致所有调用点都是无样式的裸链接；请勿改回 `link-*`。
    'accent-link':
      'text-link underline decoration-accent/40 underline-offset-2 transition-colors hover:decoration-accent',
  },
});
