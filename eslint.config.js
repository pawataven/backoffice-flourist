// @ts-check
import { defineConfig } from 'eslint/config'
import js from '@eslint/js'
import tseslint from 'typescript-eslint'
import pluginVue from 'eslint-plugin-vue'
import prettier from 'eslint-config-prettier'

export default defineConfig(
  {
    ignores: ['**/node_modules/**', '**/.nuxt/**', '**/.output/**', '**/dist/**', '**/coverage/**'],
  },
  js.configs.recommended,
  tseslint.configs.recommended,
  pluginVue.configs['flat/recommended'],
  {
    files: ['**/*.vue', 'app/**/*.ts', 'i18n/**/*.ts'],
    languageOptions: { parserOptions: { parser: tseslint.parser } },
    // Nuxt auto-imports (ref, useI18n, defineI18nLocale, ...) are globals ESLint cannot see; vue-tsc checks them.
    // Optional props typed with TypeScript are already `undefined` when omitted; no default needed.
    rules: { 'no-undef': 'off', 'vue/require-default-prop': 'off' },
  },
  {
    // Nuxt names pages after their route (index.vue, [id].vue), so single-word names are expected.
    // The UI kit keeps the design-system names (Button, Card, Tabs, …).
    files: [
      'app/pages/**/*.vue',
      'app/layouts/**/*.vue',
      'app/ui/components/*.vue',
      'app/app.vue',
      'app/error.vue',
    ],
    rules: { 'vue/multi-word-component-names': 'off' },
  },
  {
    // Node scripts (mock generator).
    files: ['scripts/**/*.mjs'],
    languageOptions: { globals: { console: 'readonly' } },
  },
  prettier,
)
