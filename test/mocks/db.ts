import { getTableName } from 'drizzle-orm'
import { vi, type Mock } from 'vitest' // ← import Mock type

// ── type ──────────────────────────────────────────────────────────────────────
type TableQueryMock = {
  findMany: Mock
  findFirst: Mock
}

// ── query proxy ───────────────────────────────────────────────────────────────
const queryTableCache = new Map<string, TableQueryMock>() // ← use TableQueryMock

const queryMock = new Proxy({} as Record<string, TableQueryMock>, { // ← same here
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

// ── db mock ───────────────────────────────────────────────────────────────────
export const db = {
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
  // terminal methods — do NOT use mockReturnThis
  returning: vi.fn(),
  values: vi.fn(),
  get: vi.fn(),
  all: vi.fn(),
  run: vi.fn(),
  _: { relations: {} }, // ← needed for db._.relations check in queries.ts
  query: queryMock,
  transaction: vi.fn(cb => cb(db)),
}

export const getNacDb = () => db

export const isMysql = vi.fn(() => false)
export const nacGetTableName = vi.fn(async (table: any) => getTableName(table))
export const hasActiveRelations = vi.fn(() => true)
export const nacGetTableQueryConfig = vi.fn((_tableName?: string) => ({}))

export default db
