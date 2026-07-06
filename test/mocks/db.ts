import { getTableName } from 'drizzle-orm'
import { vi } from 'vitest'

// Cache so the same fn instance is returned every time a table is accessed
const queryTableCache = new Map<string, { findMany: ReturnType<typeof vi.fn>, findFirst: ReturnType<typeof vi.fn> }>()

const queryMock = new Proxy({} as Record<string, { findMany: ReturnType<typeof vi.fn>, findFirst: ReturnType<typeof vi.fn> }>, {
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

export const db = {
  select: vi.fn().mockReturnThis(),
  from: vi.fn().mockReturnThis(),
  insert: vi.fn().mockReturnThis(),
  update: vi.fn(() => ({
    set: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    returning: vi.fn(),
  })),
  delete: vi.fn().mockReturnThis(),
  innerJoin: vi.fn().mockReturnThis(),
  where: vi.fn().mockReturnThis(),
  orderBy: vi.fn().mockReturnThis(),
  limit: vi.fn().mockReturnThis(),
  offset: vi.fn().mockReturnThis(),
  set: vi.fn().mockReturnThis(),
  values: vi.fn().mockReturnThis(),
  $dynamic: vi.fn().mockReturnThis(),

  returning: vi.fn(),
  get: vi.fn(),
  all: vi.fn(),
  run: vi.fn(),
  
  query: queryMock,
  transaction: vi.fn(cb => cb(db)),
}

export const getNacDb = () => db
export const isMysql = vi.fn(() => false)
export const nacGetTableName = vi.fn(async (table: any) => getTableName(table))
export const hasActiveRelations = vi.fn(() => true)
export const nacGetTableQueryConfig = vi.fn((_tableName?: string) => ({}))

export default db