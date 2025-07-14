import { defineConfig } from 'astro/config';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

import tailwindcss from '@tailwindcss/vite';
import react from '@astrojs/react';

import starlight from '@astrojs/starlight';

export default defineConfig({
  markdown: {
    remarkPlugins: [remarkMath],
    rehypePlugins: [rehypeKatex],
  },

  experimental: {
    preserveScriptOrder: true,
    contentIntellisense: true,
  },

  vite: {
    plugins: [tailwindcss()],
  },

  integrations: [react(), starlight()],
});