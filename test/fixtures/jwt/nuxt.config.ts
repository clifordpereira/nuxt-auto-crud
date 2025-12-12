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

  // @ts-ignore
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
