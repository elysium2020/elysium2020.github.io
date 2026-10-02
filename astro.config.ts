import sitemap from '@astrojs/sitemap';
import UnoCSS from 'unocss/astro';
import { defineConfig, svgoOptimizer } from 'astro/config';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import { unified, rehypeHeadingIds } from '@astrojs/markdown-remark';

import solidJs from '@astrojs/solid-js';

import expressiveCode from 'astro-expressive-code';

export default defineConfig({
  site: 'https://elysium2020.github.io',
  integrations: [expressiveCode(), sitemap(), UnoCSS(), solidJs()],
  markdown: {
    processor: unified({
      remarkPlugins: [remarkMath],
      rehypePlugins: [
        rehypeKatex,
        // Astro adds heading ids *after* user rehype plugins; autolink needs
        // them, so run the same (exported) id plugin first to stay in sync.
        rehypeHeadingIds,
        [
          rehypeAutolinkHeadings,
          {
            behavior: 'append',
            properties: { class: 'heading-anchor', ariaHidden: 'true', tabIndex: -1 },
            content: {
              type: 'element',
              tagName: 'span',
              properties: { className: ['i-mdi-link-variant', 'inline-block'] },
              children: [],
            },
          },
        ],
      ],
    }),
  },
  vite: { ssr: { noExternal: ['katex'] }, css: { transformer: 'lightningcss' } },
  experimental: {
    svgOptimizer: svgoOptimizer(),
    contentIntellisense: true,
    chromeDevtoolsWorkspace: true,
  },
});
