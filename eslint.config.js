import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import eslintPluginAstro from 'eslint-plugin-astro';
import eslintPluginTailwindcss from 'eslint-plugin-tailwindcss';
import eslintConfigPrettier from 'eslint-config-prettier';
import globals from 'globals';

export default tseslint.config(
  {
    ignores: ['dist/', '.astro/', 'public/orion/', '.kilo/'],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...eslintPluginAstro.configs['flat/recommended'],
  ...eslintPluginAstro.configs['flat/jsx-a11y-recommended'],
  {
    // The plugin's own `recommended` preset only targets .ts/.tsx/.js/.jsx —
    // this project's Tailwind classes live almost entirely in .astro
    // template markup, so extend the same rules to that extension too.
    ...eslintPluginTailwindcss.configs.recommended,
    files: [...eslintPluginTailwindcss.configs.recommended.files, '**/*.astro'],
    settings: {
      tailwindcss: {
        cssConfigPath: './src/styles/global.css',
      },
    },
    rules: {
      ...eslintPluginTailwindcss.configs.recommended.rules,
      // This design system leans on `@layer components` classes (.btn-primary,
      // .card, .section-heading, ...) throughout — those aren't Tailwind
      // utilities, so this rule would flag nearly every component file.
      'tailwindcss/no-custom-classname': 'off',
      // False positives on utilities that compose rather than conflict, e.g.
      // `outline` + `outline-2` (style + width) or `inset-shadow` + `shadow`.
      'tailwindcss/no-contradicting-classname': 'off',
    },
  },
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    rules: {
      // TypeScript (`astro check` / tsc) already catches genuinely undefined
      // names; this core rule doesn't understand ambient/global *types*
      // (ImageMetadata, RequestInit, ...) and flags them as if undefined.
      'no-undef': 'off',
      // TypeScript already reports unused bindings; let a leading underscore
      // opt a deliberately-unused arg/destructure out of both.
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
    },
  },
  // Must stay last: disables core/TS rules that would otherwise fight Prettier's formatting.
  eslintConfigPrettier
);
