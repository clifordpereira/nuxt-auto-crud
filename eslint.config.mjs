import { createConfigForNuxt } from '@nuxt/eslint-config/flat'
import tsdoc from 'eslint-plugin-tsdoc'

export default createConfigForNuxt({
  features: {
    tooling: true,
    stylistic: true,
  },
  dirs: {
    src: [
      './src',
      './playground',
      './test/fixtures/basic',
      './test/fixtures/authz',
    ],
  },
})
  .append(
    // Block 1: Strict TypeScript / Vue configurations & projectService fallbacks
    {
      files: ['**/*.ts', '**/*.vue'],
      languageOptions: {
        parserOptions: {
          projectService: {
            allowWithoutProject: [
              'eslint.config.mjs',
              'vitest.config.ts',
              'test/fixtures/**/*.ts',
            ],
          },
          extraFileExtensions: ['.vue'],
        },
      },
      rules: {
        'vue/multi-word-component-names': 'off',
        '@typescript-eslint/consistent-type-imports': 'error',
        '@typescript-eslint/no-floating-promises': 'error',
        '@typescript-eslint/no-explicit-any': 'error',
      },
    },
    // Block 2: TSDoc Syntax Validation
    {
      files: ['**/*.ts', '**/*.vue'],
      plugins: {
        tsdoc,
      },
      rules: {
        'tsdoc/syntax': 'warn',
      },
    },
  )
