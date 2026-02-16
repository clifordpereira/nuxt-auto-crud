import { setup } from '@nuxt/test-utils/e2e'
import { resolve } from 'node:path'

const fixture = process.env.TEST_FIXTURE || 'basic'
process.env.NAC_AGENTIC_TOKEN = 'test-token'

await setup({
  rootDir: resolve(__dirname, `../fixtures/${fixture}`),
  server: true,
  browser: false, // Set true only if testing Nuxt UI components
})
