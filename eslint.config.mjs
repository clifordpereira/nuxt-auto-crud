// @ts-check
import { createConfigForNuxt } from '@nuxt/eslint-config/flat'

export default createConfigForNuxt({
  features: {
    tooling: true,
    stylistic: true,
  },
  dirs: {
    src: [
      './src',
      './playground',
      './playground-saas',
      './test/fixtures/basic',
      './test/fixtures/authz',
    ],
  },
})
  .append(
    {
      files: ['**/*.ts', '**/*.vue'],
      languageOptions: {
        parserOptions: {
          projectService: true,
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
  )
