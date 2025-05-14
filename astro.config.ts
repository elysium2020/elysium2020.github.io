// @ts-check
import { defineConfig } from 'astro/config';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

import tailwindcss from '@tailwindcss/vite';
import react from '@astrojs/react';

export default defineConfig({
  markdown: {
    remarkPlugins: [remarkMath],
    rehypePlugins: [rehypeKatex],
  },

  experimental: {
    responsiveImages: true,
    preserveScriptOrder: true,
    contentIntellisense: true,
  },

  vite: {
    plugins: [tailwindcss()],
  },

  integrations: [react()],
});
