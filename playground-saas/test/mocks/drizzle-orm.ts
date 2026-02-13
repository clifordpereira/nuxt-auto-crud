import { vi } from 'vitest'

export const eq = vi.fn()
export const getTableColumns = vi.fn(() => ({
  id: { primary: true },
  userId: { name: 'userId' },
  ownerId: { name: 'ownerId' },
  createdBy: { name: 'createdBy' },
}))

export const getTableName = vi.fn(table => table?._?.name || 'mock_table')
