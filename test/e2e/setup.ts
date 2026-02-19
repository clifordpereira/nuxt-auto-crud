import { setup } from '@nuxt/test-utils/e2e'
import { resolve } from 'node:path'

const fixture = process.env.TEST_FIXTURE || 'basic'
process.env.NUXT_AUTO_CRUD_AGENTIC_TOKEN = 'test-token' // NUXT_[CONFIG_KEY]_[PROPERTY_NAME]

await setup({
  rootDir: resolve(import.meta.dirname, `../fixtures/${fixture}`),
  server: true,
  browser: false, // Set true only if testing Nuxt UI components
})
