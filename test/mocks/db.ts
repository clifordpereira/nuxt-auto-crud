import { vi } from 'vitest'

/**
 * Fluent Drizzle Mock
 * Supports: .select().from().innerJoin().where().get() | .all()
 */
const fluentMock = {
  select: vi.fn().mockReturnThis(),
  from: vi.fn().mockReturnThis(),
  innerJoin: vi.fn().mockReturnThis(),
  where: vi.fn().mockReturnThis(),
  orderBy: vi.fn().mockReturnThis(),
  limit: vi.fn().mockReturnThis(),
  offset: vi.fn().mockReturnThis(),
  get: vi.fn(),
  all: vi.fn(),
  run: vi.fn(),
  values: vi.fn(),
}

export const useDb = () => {
  const db = {
    ...fluentMock,
    // transaction mock if needed later for soft-deletes
    transaction: vi.fn((cb) => cb(fluentMock))
  }
  return db
}
