import { defineVitestConfig } from '@nuxt/test-utils/config'

export default defineVitestConfig({
  test: {
    exclude: ['test/api.test.ts', 'test/status-filtering.test.ts', 'node_modules', 'dist', '.nuxt', '.output', 'playground', 'playground-backendonly'],
  },
})
