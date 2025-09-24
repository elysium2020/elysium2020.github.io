import { defineConfig } from 'astro/config';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import tailwindcss from '@tailwindcss/vite';
import react from '@astrojs/react';
import expressiveCode from 'astro-expressive-code';
import { pluginLineNumbers } from '@expressive-code/plugin-line-numbers';

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
  integrations: [
    react(),
    expressiveCode({
      themes: ['catppuccin-mocha'],
      plugins: [pluginLineNumbers()],
    }),
  ],
});
