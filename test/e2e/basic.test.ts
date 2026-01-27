import { fileURLToPath } from 'node:url'
import { describe, it, expect } from 'vitest'
import { setup, $fetch } from '@nuxt/test-utils/e2e'

describe('NAC Basic Fixture', async () => {
  await setup({
    rootDir: fileURLToPath(new URL('../fixtures/basic', import.meta.url)),
    host: 'http://localhost:3000',
  })

  it('boots without internal server errors', async () => {
    const html = await $fetch('/')
    expect(html).toBeDefined()
    expect(html).not.toContain('Internal Server Error')
  })
})