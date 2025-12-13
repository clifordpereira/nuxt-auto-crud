import { defineVitestConfig } from '@nuxt/test-utils/config'

export default defineVitestConfig({
  test: {
    exclude: [
      'test/basic.test.ts',
      'test/jwt.test.ts',
      'node_modules',
      'dist',
      '.nuxt',
      '.output',
      'playground',
      'playground-backendonly',
    ],
  },
})
