vi.mock('drizzle-orm', async () => {
  const actual = await vi.importActual('drizzle-orm')
  return {
    ...actual,
    getColumns: vi.fn((table) => table)
  }
})

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getRows, getRow, createRow, updateRow, deleteRow } from '../../src/runtime/server/utils/queries'
import { db } from 'hub:db'
import { posts, users } from '#nac/schema'
import { 
  RecordNotFoundError, 
  InsertionFailedError, 
  UpdationFailedError, 
  DeletionFailedError 
} from '../../src/runtime/server/exceptions'

describe('NAC Core Queries - Full Suite', () => {
  beforeEach(() => {
    vi.clearAllMocks()
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
    it('applies list permission (status="active" OR owner=userId)', async () => {
      vi.mocked(db.all).mockResolvedValue([])
      await getRows(posts as any, { userId: '1', permissions: ['list'] })
      expect(db.where).toHaveBeenCalled()
    })

    it('applies list_own permission (owner=userId) strictly', async () => {
      vi.mocked(db.all).mockResolvedValue([])
      await getRows(posts as any, { userId: '1', permissions: ['list_own'] })
      expect(db.where).toHaveBeenCalled()
    })

    it('returns all records if no permissions specified (Admin path)', async () => {
      vi.mocked(db.all).mockResolvedValue([])
      await getRows(posts as any, {})
      expect(db.where).not.toHaveBeenCalled()
    })

    it('gracefully skips filters if columns do not exist in schema', async () => {
      vi.mocked(db.all).mockResolvedValue([])
      await getRows(users as any, { userId: '1', permissions: ['list'] })
      expect(db.where).not.toHaveBeenCalled() // users fixture lacks status/owner
    })

    it('always applies id DESC ordering', async () => {
      vi.mocked(db.all).mockResolvedValue([])
      await getRows(posts as any)
      expect(db.orderBy).toHaveBeenCalled()
    })
  })

  describe('getRow()', () => {
    it('returns and sanitizes record from context if present', async () => {
      const result = await getRow(users as any, '1', { 
        record: { id: 1, name: 'Clif', secret: 'hide' } 
      })
      expect(result).not.toHaveProperty('secret')
      expect(db.select).not.toHaveBeenCalled()
    })

    it('fetches from DB and sanitizes if context is empty', async () => {
      vi.mocked(db.get).mockResolvedValue({ id: 1, name: 'DB', email: 'a@b.com' })
      const result = await getRow(users as any, '1')
      expect(result.name).toBe('DB')
    })

    it('throws RecordNotFoundError on miss', async () => {
      vi.mocked(db.get).mockResolvedValue(null)
      await expect(getRow(posts as any, '99')).rejects.toThrow(RecordNotFoundError)
    })

    it('converts string ID to number for query', async () => {
      vi.mocked(db.get).mockResolvedValue({ id: 1 })
      await getRow(posts as any, '5')
      expect(db.where).toHaveBeenCalled()
    })
  })

  describe('createRow()', () => {
    it('injects ownerKey, updatedBy, and updatedAt', async () => {
      vi.mocked(db.get).mockResolvedValue({ id: 1 })
      await createRow(posts as any, { title: 'New' }, { userId: '123' })
      const payload = vi.mocked(db.values).mock.calls[0]![0] as any
      expect(payload.createdBy).toBe(123)
      expect(payload.updatedBy).toBe(123)
      expect(payload.updatedAt).toBeInstanceOf(Date)
    })

    it('skips audit injection if userId is missing', async () => {
      vi.mocked(db.get).mockResolvedValue({ id: 1 })
      await createRow(posts as any, { title: 'Anon' })
      const payload = vi.mocked(db.values).mock.calls[0]![0] as any
      expect(payload).not.toHaveProperty('createdBy')
    })

    it('respects runtimeConfig ownerKey override', async () => {
        const { useRuntimeConfig } = await import('#imports')
        
        vi.mocked(useRuntimeConfig).mockReturnValueOnce({ 
            autoCrud: { auth: { ownerKey: 'authorId' } } 
        } as any)

        vi.mocked(db.get).mockResolvedValue({ id: 1 })

        const mockTable = {
            authorId: {}, 
            updatedBy: {},
            updatedAt: {}
        }

        await createRow(mockTable as any, {}, { userId: '1' })

        const payload = vi.mocked(db.values).mock.calls[0]![0] as any
        expect(payload).toHaveProperty('authorId', 1)
    })

    it('throws InsertionFailedError on DB failure', async () => {
      vi.mocked(db.get).mockResolvedValue(null)
      await expect(createRow(posts as any, {})).rejects.toThrow(InsertionFailedError)
    })

    it('does not mutate original data object', async () => {
      const data = { title: 'Pure' }
      vi.mocked(db.get).mockResolvedValue({ id: 1 })
      await createRow(posts as any, data, { userId: '1' })
      expect(data).not.toHaveProperty('updatedAt')
    })
  })

  describe('updateRow()', () => {
    it('refreshes updatedAt and updatedBy but never createdBy', async () => {
      vi.mocked(db.returning).mockResolvedValue([{ id: 1 }])
      await updateRow(posts as any, '1', { title: 'Edit' }, { userId: '42' })
      const payload = vi.mocked(db.set).mock.calls[0]![0] as any
      expect(payload.updatedAt).toBeInstanceOf(Date)
      expect(payload.updatedBy).toBe(42)
      expect(payload).not.toHaveProperty('createdBy')
    })

    it('targets specific ID via numeric conversion', async () => {
      vi.mocked(db.returning).mockResolvedValue([{ id: 1 }])
      await updateRow(posts as any, '100', {})
      expect(db.where).toHaveBeenCalled()
    })

    it('throws UpdationFailedError if no rows returned', async () => {
      vi.mocked(db.returning).mockResolvedValue([])
      await expect(updateRow(posts as any, '1', {})).rejects.toThrow(UpdationFailedError)
    })

    it('uses selectableFields in returning clause', async () => {
      vi.mocked(db.returning).mockResolvedValue([{ id: 1 }])
      await updateRow(users as any, '1', {})
      const fields = vi.mocked(db.returning).mock.calls[0]![0]
      expect(fields).toBeDefined()
    })
  })

  describe('deleteRow()', () => {
    it('executes delete and returns result', async () => {
      vi.mocked(db.get).mockResolvedValue({ id: 1 })
      const res = await deleteRow(posts as any, '1')
      expect(res.id).toBe(1)
    })

    it('throws DeletionFailedError if ID does not exist', async () => {
      vi.mocked(db.get).mockResolvedValue(null)
      await expect(deleteRow(posts as any, '99')).rejects.toThrow(DeletionFailedError)
    })
  })
})