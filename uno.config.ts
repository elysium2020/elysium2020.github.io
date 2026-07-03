import { defineConfig, presetWind4, presetTypography } from 'unocss';
import presetIcons from '@unocss/preset-icons';
import presetWebFonts from '@unocss/preset-web-fonts';
import transformerAttributifyJsx from '@unocss/transformer-attributify-jsx';

export default defineConfig({
  presets: [
    presetWind4({
      preflights: {
        reset: true,
      },
    }),
    presetTypography,
    presetIcons({
      collections: {
        mdi: () => import('@iconify-json/mdi/icons.json').then((index) => index.default),
        tabler: () => import('@iconify-json/tabler/icons.json').then((i) => i.default),
      },
    }),
    presetWebFonts({
      provider: 'google',
      fonts: { sans: 'Noto Sans SC', serif: 'Noto Serif SC', mono: 'Noto Sans Mono CJK SC' },
      inlineImports: false,
    }),
  ],
  transformers: [transformerAttributifyJsx()],
  shortcuts: {
    'section-label': 'text-xs text-muted-foreground tracking-widest uppercase',
    'page-container': 'mx-auto px-6 py-12 container max-w-5xl',
    'back-link':
      'text-xs text-muted-foreground inline-flex gap-1.5 items-center transition-colors hover:text-foreground',
    'focus-ring': 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground',
    'date-text': 'text-xs text-muted-foreground whitespace-nowrap tabular-nums',
  },
  theme: {
    colors: {
      background: 'var(--background)',
      foreground: 'var(--foreground)',
      primary: {
        DEFAULT: 'var(--primary)',
        foreground: 'var(--primary-foreground)',
      },
      accent: {
        DEFAULT: 'var(--accent)',
        foreground: 'var(--accent-foreground)',
      },
      border: 'var(--border)',
      muted: {
        DEFAULT: 'var(--muted)',
        foreground: 'var(--muted-foreground)',
      },
    },
  },
});
