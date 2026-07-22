import { setup, $fetch } from '@nuxt/test-utils/e2e'
import { resolve } from 'node:path'
import { beforeAll } from 'vitest'

await setup({
  rootDir: resolve(import.meta.dirname, '../../fixtures/authz'),
  server: true,
  browser: false,
})

const seedAuthHeaders = { 'x-test-user-id': '1' }

beforeAll(async () => {
  const existing = await $fetch<Record<string, unknown>[]>('/api/_nac/roles', {
    headers: seedAuthHeaders,
  })
  if (existing.length === 0) {
    await $fetch('/api/_nac/roles', {
      method: 'POST',
      body: { name: 'admin' },
      headers: seedAuthHeaders,
    })
  }
})
