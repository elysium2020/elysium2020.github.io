import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import UnoCSS from 'unocss/astro';
import { defineConfig, svgoOptimizer } from 'astro/config';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { unified } from '@astrojs/markdown-remark';

import solidJs from '@astrojs/solid-js';

import expressiveCode from 'astro-expressive-code';

export default defineConfig({
  site: 'https://elysium2020.github.io',
  integrations: [expressiveCode(), mdx(), sitemap(), UnoCSS(), solidJs()],
  markdown: { processor: unified({ remarkPlugins: [remarkMath], rehypePlugins: [rehypeKatex] }) },
  vite: { ssr: { noExternal: ['katex'] }, css: { transformer: 'lightningcss' } },
  experimental: {
    svgOptimizer: svgoOptimizer(),
    contentIntellisense: true,
    chromeDevtoolsWorkspace: true,
  },
});
