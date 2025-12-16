import { fileURLToPath } from 'node:url'
import { describe, it, expect } from 'vitest'
import { setup, $fetch } from '@nuxt/test-utils/e2e'

describe('Error Handling', async () => {
  await setup({
    rootDir: fileURLToPath(new URL('./fixtures/basic', import.meta.url)),
  })

  it('should return 404 for non-existent record', async () => {
    try {
      await $fetch('/api/users/99999')
      expect.fail('Should have thrown 404')
    }
    catch (e: unknown) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect((e as any).response?.status).toBe(404)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect((e as any).response?.statusText).toBe('Record not found')
    }
  })
})
