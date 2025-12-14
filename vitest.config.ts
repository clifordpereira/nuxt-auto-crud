import { defineVitestConfig } from '@nuxt/test-utils/config'

export default defineVitestConfig({
  test: {
    exclude: [
      'test/api.test.ts',
      'test/status-filtering.test.ts',
      'test/blog.test.ts',
      'test/profile-password.test.ts',
      'test/profile.test.ts',
      'test/settings.test.ts',
      'node_modules',
      'dist',
      '.nuxt',
      '.output',
      'playground',
      'playground-backendonly',
      'test/resources-ownership.test.ts',
    ],
  },
})
