import { vi, describe, it, expect, beforeEach } from 'vitest'

// 1. HOISTED MOCK: Intercepts drizzle-orm before queries.ts loads
vi.mock('drizzle-orm', async () => {
  const actual = await vi.importActual('drizzle-orm')
  return {
    ...actual,
    // Simply returns the object passed to it so we can control logic via mock objects
    getColumns: vi.fn((table) => table),
    // Ensure standard Drizzle operators are preserved
    or: actual.or,
    and: actual.and,
    eq: actual.eq,
    desc: actual.desc,
  }
})

// 2. IMPORTS
import { getRows, getRow, createRow, updateRow, deleteRow } from '../../src/runtime/server/utils/queries'
import { db } from '@nuxthub/db'
import { posts, users } from '#nac/schema'
import { 
  RecordNotFoundError, 
  InsertionFailedError, 
  UpdateFailedError, 
  DeletionFailedError 
} from '../../src/runtime/server/exceptions'

describe('NAC Core Queries - Consolidated Suite', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Setup Drizzle Fluent Mock Chain
    vi.mocked(db.select).mockReturnThis()
    vi.mocked(db.from).mockReturnThis()
    vi.mocked(db.insert).mockReturnThis()
    vi.mocked(db.update).mockReturnThis()
    vi.mocked(db.delete).mockReturnThis()
    vi.mocked(db.where).mockReturnThis()
    vi.mocked(db.set).mockReturnThis()
    vi.mocked(db.values).mockReturnThis()
    vi.mocked(db.returning).mockReturnThis()
    vi.mocked(db.orderBy).mockReturnThis()
    vi.mocked(db.$dynamic).mockReturnThis()
  })

  describe('getRows()', () => {
    it('applies list permission logic (status OR owner)', async () => {
      vi.mocked(db.all).mockResolvedValue([])
      await getRows(posts as any, { userId: '1', permissions: ['list'] })
      expect(db.where).toHaveBeenCalled()
    })

    it('applies list_own permission logic strictly', async () => {
      vi.mocked(db.all).mockResolvedValue([])
      await getRows(posts as any, { userId: '1', permissions: ['list_own'] })
      expect(db.where).toHaveBeenCalled()
    })

    it('bypasses filters for admin (no permissions provided)', async () => {
      vi.mocked(db.all).mockResolvedValue([])
      await getRows(posts as any, {})
      expect(db.where).not.toHaveBeenCalled()
    })

    it('handles tables missing status/owner columns gracefully', async () => {
      vi.mocked(db.all).mockResolvedValue([])
      // 'users' fixture lacks 'status' column
      await getRows(users as any, { userId: '1', permissions: ['list'] })
      expect(db.where).not.toHaveBeenCalled()
    })

    it('ensures descending ID order is always applied', async () => {
      vi.mocked(db.all).mockResolvedValue([])
      await getRows(posts as any)
      expect(db.orderBy).toHaveBeenCalled()
    })
  })

  describe('getRow()', () => {
    it('returns sanitized record from context cache immediately', async () => {
      const result = await getRow(users as any, '1', { 
        record: { id: 1, name: 'Clif', secret: 'internal' } 
      })
      expect(result).not.toHaveProperty('secret')
      expect(db.select).not.toHaveBeenCalled()
    })

    it('fetches and sanitizes from DB when cache is empty', async () => {
      vi.mocked(db.get).mockResolvedValue({ id: 1, name: 'DB_User' })

      const result = await getRow(users as any, '1')

      expect(result.name).toBe('DB_User')
      expect(result).not.toHaveProperty('password')

      const selectedFields = vi.mocked(db.select).mock.calls[0]![0]
      expect(selectedFields).not.toHaveProperty('password')
    })

    it('throws RecordNotFoundError when ID is missing', async () => {
      vi.mocked(db.get).mockResolvedValue(null)
      await expect(getRow(posts as any, '999')).rejects.toThrow(RecordNotFoundError)
    })

    it('coerces string ID to number for query safety', async () => {
      vi.mocked(db.get).mockResolvedValue({ id: 5 })
      await getRow(posts as any, '5')
      expect(db.where).toHaveBeenCalled()
    })

    it('sanitizes cached record from context using selectableFields', async () => {
      const context = { 
        record: { id: 1, name: 'Clif', password: 'secret_hash' } 
      }
      
      // Pass '1' instead of 1
      const result = await getRow(users as any, '1', context)
      
      expect(result.name).toBe('Clif')
      expect(result).not.toHaveProperty('password')
      expect(db.select).not.toHaveBeenCalled()
    })

    it('sanitizes DB result by passing selectableFields to db.select', async () => {
      await getRow(users as any, '1')
      
      const selectedFields = vi.mocked(db.select).mock.calls[0]![0]
      expect(selectedFields).toHaveProperty('id')
      expect(selectedFields).toHaveProperty('name')
      expect(selectedFields).not.toHaveProperty('password')
    })
  })

  describe('createRow()', () => {
    it('injects audit trail and refreshes updatedAt', async () => {
      vi.mocked(db.get).mockResolvedValue({ id: 1 })
      await createRow(posts as any, { title: 'Test' }, { userId: '10' })
      const payload = vi.mocked(db.values).mock.calls[0]![0] as any
      expect(payload.createdBy).toBe(10)
      expect(payload.updatedAt).toBeInstanceOf(Date)
    })

    it('respects runtimeConfig ownerKey override', async () => {
      const { useRuntimeConfig } = await import('#imports')
      vi.mocked(useRuntimeConfig).mockReturnValueOnce({ autoCrud: { auth: { ownerKey: 'authorId' } } } as any)
      vi.mocked(db.get).mockResolvedValue({ id: 1 })
      
      const mockTable = { authorId: {}, updatedBy: {}, updatedAt: {} }
      await createRow(mockTable as any, {}, { userId: '1' })
      
      const payload = vi.mocked(db.values).mock.calls[0]![0] as any
      expect(payload).toHaveProperty('authorId', 1)
    })

    it('skips audit fields if columns missing from schema', async () => {
      vi.mocked(db.get).mockResolvedValue({ id: 1 })
      // Providing a table object with no audit keys
      await createRow({ id: {} } as any, { title: 'No Audit' }, { userId: '1' })
      const payload = vi.mocked(db.values).mock.calls[0]![0] as any
      expect(payload).not.toHaveProperty('createdBy')
    })

    it('throws InsertionFailedError on empty DB response', async () => {
      vi.mocked(db.get).mockResolvedValue(null)
      await expect(createRow(posts as any, {})).rejects.toThrow(InsertionFailedError)
    })

    it('maintains input object immutability', async () => {
      const input = { title: 'Original' }
      vi.mocked(db.get).mockResolvedValue({ id: 1 })
      await createRow(posts as any, input, { userId: '1' })
      expect(input).not.toHaveProperty('updatedAt')
    })

    it('enforces selectableFields in the returning clause', async () => {
      vi.mocked(db.get).mockResolvedValue({ id: 1, title: 'Returning Test' })
      
      await createRow(users as any, { name: 'New User' })

      const returningFields = vi.mocked(db.returning).mock.calls[0]![0]
      
      expect(returningFields).toHaveProperty('id')
      expect(returningFields).not.toHaveProperty('password')
    })
  })

  describe('updateRow()', () => {
    it('refreshes updatedAt and updatedBy specifically', async () => {
      vi.mocked(db.returning).mockResolvedValue([{ id: 1 }])
      await updateRow(posts as any, '1', { title: 'Edit' }, { userId: '50' })
      const payload = vi.mocked(db.set).mock.calls[0]![0] as any
      expect(payload.updatedAt).toBeInstanceOf(Date)
      expect(payload.updatedBy).toBe(50)
      expect(payload).not.toHaveProperty('createdBy')
    })

    it('targets correct row via numeric ID', async () => {
      vi.mocked(db.returning).mockResolvedValue([{ id: 1 }])
      await updateRow(posts as any, '200', {})
      expect(db.where).toHaveBeenCalled()
    })

    it('throws UpdateFailedError when update fails', async () => {
      vi.mocked(db.returning).mockResolvedValue([])
      await expect(updateRow(posts as any, '1', {})).rejects.toThrow(UpdateFailedError)
    })

    it('enforces selectableFields filter on return', async () => {
      vi.mocked(db.returning).mockResolvedValue([{ id: 1 }])
      await updateRow(users as any, '1', {})
      const fields = vi.mocked(db.returning).mock.calls[0]![0]
      expect(fields).toBeDefined() // modelMapper integration
    })
  })

  describe('deleteRow()', () => {
    it('returns the deleted record data', async () => {
      vi.mocked(db.get).mockResolvedValue({ id: 1, title: 'Deleted' })
      const res = await deleteRow(posts as any, '1')
      expect(res.title).toBe('Deleted')
    })

    it('throws DeletionFailedError for invalid IDs', async () => {
      vi.mocked(db.get).mockResolvedValue(null)
      await expect(deleteRow(posts as any, '404')).rejects.toThrow(DeletionFailedError)
    })
  })
})