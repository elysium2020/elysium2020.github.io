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
