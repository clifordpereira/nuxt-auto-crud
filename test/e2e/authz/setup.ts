import { setup } from '@nuxt/test-utils/e2e'
import { resolve } from 'node:path'

process.env.NUXT_AUTO_CRUD_AGENTIC_TOKEN = 'test-token'

await setup({
  rootDir: resolve(import.meta.dirname, '../../fixtures/authz'),
  server: true,
  browser: false,
})
