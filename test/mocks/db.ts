import { getTableName, type Table } from 'drizzle-orm'
import { vi, type Mock } from 'vitest'

type TableQueryMock = {
  findMany: Mock
  findFirst: Mock
}

const queryTableCache = new Map<string, TableQueryMock>()

const queryMock = new Proxy({} as Record<string, TableQueryMock>, {
  get: (_target, prop: string) => {
    if (!queryTableCache.has(prop)) {
      queryTableCache.set(prop, {
        findMany: vi.fn(),
        findFirst: vi.fn(),
      })
    }
    return queryTableCache.get(prop)!
  },
})

const db = {
  select: vi.fn().mockReturnThis(),
  from: vi.fn().mockReturnThis(),
  insert: vi.fn().mockReturnThis(),
  update: vi.fn().mockReturnThis(),
  delete: vi.fn().mockReturnThis(),
  innerJoin: vi.fn().mockReturnThis(),
  where: vi.fn().mockReturnThis(),
  orderBy: vi.fn().mockReturnThis(),
  limit: vi.fn().mockReturnThis(),
  offset: vi.fn().mockReturnThis(),
  set: vi.fn().mockReturnThis(),
  $dynamic: vi.fn().mockReturnThis(),
  returning: vi.fn(),
  values: vi.fn(),
  get: vi.fn(),
  all: vi.fn(),
  run: vi.fn(),
  _: { relations: {} },
  query: queryMock,
  transaction: vi.fn((cb: (tx: typeof db) => unknown) => cb(db)),
}
export type MockNacDb = typeof db

export const getNacDb = vi.fn(async () => db)

export const isMysql = vi.fn(() => false)
export const nacGetTableName = vi.fn(async (table: Table) => getTableName(table))
export const hasActiveRelations = vi.fn(() => true)
export const nacGetTableQueryConfig = vi.fn((_tableName?: string) => ({}))

