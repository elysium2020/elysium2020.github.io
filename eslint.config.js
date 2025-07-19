import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import eslintReact from 'eslint-plugin-react';
import eslintAstro from 'eslint-plugin-astro';
import eslintImport from 'eslint-plugin-import';
import eslintUnicorn from 'eslint-plugin-unicorn';
import eslintReactHooks from 'eslint-plugin-react-hooks';
import eslintJsxA11y from 'eslint-plugin-jsx-a11y';

export default tseslint.config(
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
    ],
  },
  {
    files: ['**/.tsx'],
    extends: [
      eslintReact.configs.recommended,
      eslintReactHooks.configs.recommended,
      eslintJsxA11y.flatConfigs.recommended,
    ],
  },
);
