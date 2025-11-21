//@ts-check

import eslint from '@eslint/js';
import { defineConfig } from 'eslint/config';
import tseslint from 'typescript-eslint';
import eslintAstro from 'eslint-plugin-astro';
import eslintImport from 'eslint-plugin-import';
import eslintUnicorn from 'eslint-plugin-unicorn';
import eslintReact from '@eslint-react/eslint-plugin';
import eslintPluginBetterTailwindcss from 'eslint-plugin-better-tailwindcss';

export default defineConfig(
  { ignores: ['**/node_modules/**', '**/.astro/**'] },
  eslint.configs.recommended,
  tseslint.configs.strict,
  eslintAstro.configs.recommended,
  eslintUnicorn.configs.recommended,
  {
    files: ['**/.{ts,tsx,astro}'],
    extends: [
      eslintImport.flatConfigs.recommended,
      eslintImport.flatConfigs.typescript,
      eslintReact.configs['recommended-typescript'],
    ],
  },
  {
    rules: {
      'unicorn/prevent-abbreviations': 'off',
      'unicorn/filename-case': 'off',
    },
  },
);
