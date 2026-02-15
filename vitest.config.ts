import { defineConfig } from 'vitest/config'
import { defineVitestProject } from '@nuxt/test-utils/config'
import { resolve } from 'node:path'

const fixture = process.env.TEST_FIXTURE || 'basic'
const r = (p: string) => resolve(__dirname, p)

export default defineConfig({
  test: {
    projects: [
      {
        test: {
          name: 'unit',
          include: ['test/unit/*.{test,spec}.ts'],
          environment: 'node',
          alias: {
            // Match module.ts aliases
            '#nac/shared': r('./src/runtime/shared'),
            '#nac/types': r('./src/runtime/server/types'),
            '#nac/schema': r(`./test/fixtures/${fixture}/server/db/schema.ts`),
            
            // Mocking Nuxt environment
            '#imports': r('./test/mocks/imports.ts'),
            'hub:db': r('./test/mocks/db.ts'),
          },
        },
      },
      {
        test: {
          name: 'e2e',
          include: ['test/e2e/*.{test,spec}.ts'],
          setupFiles: [r('./test/e2e/setup.ts')],
          environment: 'node',
          alias: {
            '#imports': r('./test/mocks/imports.ts'),
          }
        },
      },
      await defineVitestProject({
        test: {
          name: 'nuxt',
          include: ['test/nuxt/*.{test,spec}.ts'],
          environment: 'nuxt',
        },
      }),
    ],
  },
})
