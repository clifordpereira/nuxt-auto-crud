import { describe, it, expect } from 'vitest'
import { setup, $fetch } from '@nuxt/test-utils/e2e'
import { getAdminClient, api } from '../test-utils'

describe('Smoke Test', async () => {
  await setup({
    // Let test-utils handle server lifecycle
  })

  it('should fetch the home page', async () => {
    const html = await $fetch('/')
    expect(html).toContain('Nuxt')
  })

  // it('should authenticate as admin using helper', async () => {
  //   // This assumes a server is running or we are in a test environment that supports this.
  //   // For now, we just verify the helper returns a configured client.
  //   const admin = await getAdminClient()
  //   expect(admin).toBeDefined()
  // })
})
