import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import eslintAstro from 'eslint-plugin-astro';
import eslintImport from 'eslint-plugin-import';

export default tseslint.config(
  { ignores: ['**/node_modules/**', '**/.astro/**'] },
  eslint.configs.recommended,
  tseslint.configs.recommended,
  eslintAstro.configs.recommended,
  {
    files: ['**/.{ts,tsx,astro}'],
    extends: [
      eslintImport.flatConfigs.recommended,
      eslintImport.flatConfigs.typescript,
    ],
  },
);
