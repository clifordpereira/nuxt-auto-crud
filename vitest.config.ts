import { defineConfig } from 'vitest/config'
import { defineVitestProject } from '@nuxt/test-utils/config'
import { resolve } from 'node:path'
import { existsSync } from 'node:fs'

const r = (p: string) => resolve(import.meta.dirname, p)

const stubPath = r('./src/runtime/server/stubs/empty-stub')

const makeUnitProject = (fixtureName: string) => ({
  test: {
    name: `unit-${fixtureName}`,
    include: [`test/unit/${fixtureName}/*.{test,spec}.ts`],
    environment: 'node',
    alias: {
      '#nac/db': r('./test/mocks/db.ts'),
      '#nac/schema': r(`./test/fixtures/${fixtureName}/server/db/schema.ts`),
      '#nac/relations': existsSync(r(`./test/fixtures/${fixtureName}/server/db/relations.ts`))
        ? r(`./test/fixtures/${fixtureName}/server/db/relations.ts`)
        : stubPath,
      '@nuxthub/db': existsSync(r(`./test/fixtures/${fixtureName}/server/db/nuxthub-db.ts`))
        ? r(`./test/fixtures/${fixtureName}/server/db/nuxthub-db.ts`)
        : r('./test/mocks/nuxthub-db-empty.ts'),
      '#imports': r('./test/mocks/imports.ts'),
    },
  },
})

const makeE2eProject = (fixtureName: string) => ({
  test: {
    name: `e2e-${fixtureName}`,
    include: [`test/e2e/${fixtureName}/*.{test,spec}.ts`],
    setupFiles: [r(`./test/e2e/${fixtureName}/setup.ts`)],
    environment: 'node',
    alias: { '#imports': r('./test/mocks/imports.ts') },
    fileParallelism: false,
  },
})

export default defineConfig({
  test: {
    projects: [
      makeUnitProject('basic'),
      makeUnitProject('relations'),
      makeUnitProject('authz'),
      makeE2eProject('basic'),
      makeE2eProject('authz'),
      makeE2eProject('relations'),
      await defineVitestProject({
        test: { name: 'nuxt', include: ['test/nuxt/*.{test,spec}.ts'], environment: 'nuxt' },
      }),
    ],
  },
})
