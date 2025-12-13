import { defineNuxtConfig } from 'nuxt/config'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const currentDir = dirname(fileURLToPath(import.meta.url))
const modulePath = join(currentDir, '../../../dist/module.mjs')

export default defineNuxtConfig({
  modules: [
    '@nuxthub/core',
    modulePath,
  ],
  alias: {
    'hub:db': fileURLToPath(new URL('./server/utils/db.ts', import.meta.url)),
  },

  // @ts-expect-error - hub is a valid property but not typed in this context
  hub: {
    db: 'sqlite',
  },

  autoCrud: {
    auth: {
      enabled: true,
      type: 'jwt',
      jwtSecret: 'test-secret-key-123',
    },
  },
})
