import { defineConfig } from 'vitest/config'
import { defineVitestProject } from '@nuxt/test-utils/config'
import { resolve } from 'node:path'
import { existsSync } from 'node:fs'

const r = (p: string) => resolve(import.meta.dirname, p)

const stubPath = r('./src/runtime/server/stubs/empty-stub')

const makeUnitProject = (fixtureName: string, includePattern: string, excludePattern?: string) => ({
  test: {
    name: `unit-${fixtureName}`,
    include: [includePattern],
    ...(excludePattern && { exclude: [excludePattern] }),
    environment: 'node',
    alias: {
      '#nac/schema': r(`./test/fixtures/${fixtureName}/server/db/schema.ts`),
      '#nac/relations': existsSync(r(`./test/fixtures/${fixtureName}/server/db/relations.ts`))
        ? r(`./test/fixtures/${fixtureName}/server/db/relations.ts`)
        : stubPath,
      '#imports': r('./test/mocks/imports.ts'),
      '#nac/db': r('./test/mocks/db.ts'),
    },
  },
})

export default defineConfig({
  test: {
    projects: [
      makeUnitProject('basic', 'test/unit/*.{test,spec}.ts', 'test/unit/relations.test.ts'),
      makeUnitProject('relations', 'test/unit/relations.test.ts'),
      {
        test: {
          name: 'e2e',
          include: ['test/e2e/*.{test,spec}.ts'],
          setupFiles: [r('./test/e2e/setup.ts')],
          environment: 'node',
          alias: {
            '#imports': r('./test/mocks/imports.ts'),
          },
          fileParallelism: false,
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
