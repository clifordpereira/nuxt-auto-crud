import { vi } from 'vitest'

const fluentMock = {
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
  returning: vi.fn().mockReturnThis(),
  values: vi.fn().mockReturnThis(),
  get: vi.fn(),
  all: vi.fn(),
  run: vi.fn(),
  $dynamic: vi.fn().mockReturnThis(),
}

export const db = {
  ...fluentMock,
  transaction: vi.fn((cb) => cb(fluentMock))
}

// Keep useDb for composition if needed
export const useDb = () => db