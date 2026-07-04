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
  select: vi.fn(),
  from: vi.fn(),
  insert: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
  innerJoin: vi.fn(),
  where: vi.fn(),
  orderBy: vi.fn(),
  limit: vi.fn(),
  offset: vi.fn(),
  set: vi.fn(),
  returning: vi.fn(),
  values: vi.fn(),
  get: vi.fn(),
  all: vi.fn(),
  run: vi.fn(),
  $dynamic: vi.fn(),
  query: queryMock,
  transaction: vi.fn(cb => cb(db)),
}

export const getNacDb = () => db
export default db
