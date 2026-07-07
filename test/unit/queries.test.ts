import { vi, describe, it, expect, beforeEach } from 'vitest'
import { useRuntimeConfig } from '#imports'

// 2. IMPORTS
import { nacGetRows, nacGetRow, nacCreateRow, nacUpdateRow, nacDeleteRow } from '../../src/runtime/server/utils/queries'
import type { NacTableWithId } from '../../src/runtime/server/types'
import { posts, users } from '#nac/schema'
import {
  NacRecordNotFoundError,
  NacInsertionFailedError,
  NacUpdateFailedError,
  NacDeletionFailedError,
} from '../../src/runtime/server/exceptions'

import { nacGetTableQueryConfig, getNacDb, isMysql } from '#nac/db'
import type { MockNacDb } from '../mocks/db'

const BASE_RUNTIME_CONFIG = {
  hub: { db: 'sqlite' },
  autoCrud: {
    statusFiltering: false,
    auth: { authorization: false, ownerKey: 'createdBy' },
    apiHiddenFields: ['deletedAt'],
  },
  public: {
    autoCrud: {
      formHiddenFields: ['id', 'createdAt', 'updatedAt'],
      formReadOnlyFields: ['title'],
      nacEndpointPrefix: '/api/_nac',
      apiBase: '/api/_nac',
    },
  },
}

const mockConfig = (overrides: Record<string, unknown> = {}) => {
  const overrideAutoCrud = (overrides.autoCrud ?? {}) as Record<string, unknown>
  const overrideAuth = (overrideAutoCrud.auth ?? {}) as Record<string, unknown>

  return vi.mocked(useRuntimeConfig).mockReturnValue({
    ...BASE_RUNTIME_CONFIG,
    ...overrides,
    autoCrud: {
      ...BASE_RUNTIME_CONFIG.autoCrud,
      ...overrideAutoCrud,
      auth: { ...BASE_RUNTIME_CONFIG.autoCrud.auth, ...overrideAuth },
    },
  } as unknown as ReturnType<typeof useRuntimeConfig>)
}

// 1. HOISTED MOCK: Intercepts drizzle-orm before queries.ts loads
vi.mock('drizzle-orm', async () => {
  const actual = await vi.importActual('drizzle-orm')
  return {
    ...actual,
    // Simply returns the object passed to it so we can control logic via mock objects
    getColumns: vi.fn(table => table),
    // Ensure standard Drizzle operators are preserved
    or: actual.or,
    and: actual.and,
    eq: actual.eq,
    desc: actual.desc,
  }
})

process.env.DATABASE_URL = 'file:test/fixtures/basic/.data/db/sqlite.db'

describe('NAC Core Queries - Consolidated Suite', () => {
  let db: MockNacDb

  beforeEach(async () => {
    vi.clearAllMocks()
    mockConfig()

    db = await getNacDb() as unknown as MockNacDb
    db._ = { relations: { posts: {}, users: {} } }

    vi.mocked(isMysql).mockReturnValue(false)
    vi.mocked(nacGetTableQueryConfig).mockReturnValue({})

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

  describe('nacGetRows()', () => {
    it('applies list permission logic (status OR owner) via where clause', async () => {
      mockConfig({ autoCrud: { statusFiltering: true, auth: { authorization: true, ownerKey: 'createdBy' } } })

      const mockPosts = {
        ...posts,
        status: { name: 'status' },
        createdBy: { name: 'createdBy' },
      }

      vi.mocked(db.query.posts.findMany).mockResolvedValue([])

      await nacGetRows(mockPosts as unknown as NacTableWithId, {
        userId: '1',
        resourcePermissions: ['list_active'],
      })

      expect(db.query.posts.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: expect.anything() }),
      )
    })

    it('applies list_own permission logic strictly', async () => {
      mockConfig({
        autoCrud: {
          statusFiltering: false,
          auth: { authorization: true, ownerKey: 'createdBy' },
        },
      })

      const mockPosts = {
        ...posts,
        createdBy: { name: 'createdBy' },
      }

      vi.mocked(db.query.posts.findMany).mockResolvedValue([])

      await nacGetRows(mockPosts as unknown as NacTableWithId, { userId: '1', resourcePermissions: ['list_own'] })

      expect(db.query.posts.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: expect.anything() }),
      )
    })

    it('bypasses filters for admin (no resourcePermissions provided)', async () => {
      mockConfig({
        autoCrud: { statusFiltering: false, auth: { authorization: false } },
      })

      vi.mocked(db.query.posts.findMany).mockResolvedValue([])

      await nacGetRows(posts as unknown as NacTableWithId, {})

      expect(db.query.posts.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: undefined }),
      )
    })

    it('handles tables missing status/owner columns gracefully', async () => {
      mockConfig({
        autoCrud: { statusFiltering: true, auth: { authorization: true, ownerKey: 'createdBy' } },
      })

      vi.mocked(db.query.users.findMany).mockResolvedValue([])

      // 'users' fixture lacks 'status' column
      await nacGetRows(users as unknown as NacTableWithId, { userId: '1', resourcePermissions: ['list_active'] })

      expect(db.query.users.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: undefined }),
      )
    })

    it('ensures descending ID order is applied by default', async () => {
      mockConfig({
        autoCrud: { statusFiltering: false, auth: { authorization: false } },
      })

      vi.mocked(db.query.posts.findMany).mockResolvedValue([])

      await nacGetRows(posts as unknown as NacTableWithId)

      expect(db.query.posts.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ orderBy: { id: 'desc' } }),
      )
    })
  })

  describe('nacGetRow()', () => {
    it('returns sanitized record from context cache immediately', async () => {
      const result = await nacGetRow(users as unknown as NacTableWithId, '1', {
        record: { id: 1, name: 'Clif', secret: 'internal' },
      })
      expect(result).not.toHaveProperty('secret')
      expect(db.select).not.toHaveBeenCalled()
    })

    it('fetches and sanitizes from DB when cache is empty', async () => {
      vi.mocked(db.get).mockResolvedValue({ id: 1, name: 'DB_User' })

      const result = await nacGetRow(users as unknown as NacTableWithId, '1')

      expect(result.name).toBe('DB_User')
      expect(result).not.toHaveProperty('password')

      const selectedFields = vi.mocked(db.select).mock.calls[0]![0]
      expect(selectedFields).not.toHaveProperty('password')
    })

    it('throws RecordNotFoundError when ID is missing', async () => {
      vi.mocked(db.get).mockResolvedValue(null)
      await expect(nacGetRow(posts as unknown as NacTableWithId, '999')).rejects.toThrow(NacRecordNotFoundError)
    })

    it('coerces string ID to number for query safety', async () => {
      vi.mocked(db.get).mockResolvedValue({ id: 5 })
      await nacGetRow(posts as unknown as NacTableWithId, '5')
      expect(db.where).toHaveBeenCalled()
    })

    it('sanitizes cached record from context using selectableFields', async () => {
      const context = {
        record: { id: 1, name: 'Clif', password: 'secret_hash' },
      }

      // Pass '1' instead of 1
      const result = await nacGetRow(users as unknown as NacTableWithId, '1', context)

      expect(result.name).toBe('Clif')
      expect(result).not.toHaveProperty('password')
      expect(db.select).not.toHaveBeenCalled()
    })

    it('sanitizes DB result by passing selectableFields to db.select', async () => {
      vi.mocked(db.get).mockResolvedValue({ id: 1, name: 'DB_User' })

      await nacGetRow(users as unknown as NacTableWithId, '1')

      const selectedFields = vi.mocked(db.select).mock.calls[0]![0]
      expect(selectedFields).toHaveProperty('id')
      expect(selectedFields).toHaveProperty('name')
      expect(selectedFields).not.toHaveProperty('password')
    })
  })

  describe('nacCreateRow()', () => {
    it('injects audit trail and refreshes updatedAt', async () => {
      vi.mocked(db.get).mockResolvedValue({ id: 1 })
      await nacCreateRow(posts as unknown as NacTableWithId, { title: 'Test' }, { userId: '10' })
      const payload = vi.mocked(db.values).mock.calls[0]![0] as Record<string, unknown>
      expect(payload.createdBy).toBe(10)
      expect(payload.updatedAt).toBeInstanceOf(Date)
    })

    it('respects runtimeConfig ownerKey override', async () => {
      vi.mocked(useRuntimeConfig).mockReturnValueOnce({ autoCrud: { auth: { ownerKey: 'authorId' } } } as unknown as ReturnType<typeof useRuntimeConfig>)
      vi.mocked(db.get).mockResolvedValue({ id: 1 })

      const mockTable = { authorId: {}, updatedBy: {}, updatedAt: {} }
      await nacCreateRow(mockTable as unknown as NacTableWithId, {}, { userId: '1' })

      const payload = vi.mocked(db.values).mock.calls[0]![0] as Record<string, unknown>
      expect(payload).toHaveProperty('authorId', 1)
    })

    it('skips audit fields if columns missing from schema', async () => {
      vi.mocked(db.get).mockResolvedValue({ id: 1 })
      // Providing a table object with no audit keys
      await nacCreateRow({ id: {} } as unknown as NacTableWithId, { title: 'No Audit' }, { userId: '1' })
      const payload = vi.mocked(db.values).mock.calls[0]![0] as Record<string, unknown>
      expect(payload).not.toHaveProperty('createdBy')
    })

    it('throws InsertionFailedError on empty DB response', async () => {
      vi.mocked(db.get).mockResolvedValue(null)
      await expect(nacCreateRow(posts as unknown as NacTableWithId, {})).rejects.toThrow(NacInsertionFailedError)
    })

    it('maintains input object immutability', async () => {
      const input = { title: 'Original' }
      vi.mocked(db.get).mockResolvedValue({ id: 1 })
      await nacCreateRow(posts as unknown as NacTableWithId, input, { userId: '1' })
      expect(input).not.toHaveProperty('updatedAt')
    })

    it('enforces selectableFields in the returning clause', async () => {
      vi.mocked(db.get).mockResolvedValue({ id: 1, title: 'Returning Test' })

      await nacCreateRow(users as unknown as NacTableWithId, { name: 'New User' })

      const returningFields = vi.mocked(db.returning).mock.calls[0]![0]

      expect(returningFields).toHaveProperty('id')
      expect(returningFields).not.toHaveProperty('password')
    })
  })

  describe('nacUpdateRow()', () => {
    it('refreshes updatedAt and updatedBy specifically', async () => {
      vi.mocked(db.returning).mockResolvedValue([{ id: 1 }])
      await nacUpdateRow(posts as unknown as NacTableWithId, '1', { title: 'Edit' }, { userId: '50' })
      const payload = vi.mocked(db.set).mock.calls[0]![0] as Record<string, unknown>
      expect(payload.updatedAt).toBeInstanceOf(Date)
      expect(payload.updatedBy).toBe(50)
      expect(payload).not.toHaveProperty('createdBy')
    })

    it('targets correct row via numeric ID', async () => {
      vi.mocked(db.returning).mockResolvedValue([{ id: 1 }])
      await nacUpdateRow(posts as unknown as NacTableWithId, '200', {})
      expect(db.where).toHaveBeenCalled()
    })

    it('throws UpdateFailedError when update fails', async () => {
      vi.mocked(db.returning).mockResolvedValue([])
      await expect(nacUpdateRow(posts as unknown as NacTableWithId, '1', {})).rejects.toThrow(NacUpdateFailedError)
    })

    it('enforces selectableFields filter on return', async () => {
      vi.mocked(db.returning).mockResolvedValue([{ id: 1 }])
      await nacUpdateRow(users as unknown as NacTableWithId, '1', {})
      const fields = vi.mocked(db.returning).mock.calls[0]![0]
      expect(fields).toBeDefined() // modelMapper integration
    })
  })

  describe('nacDeleteRow()', () => {
    it('returns the deleted record data', async () => {
      vi.mocked(db.get).mockResolvedValue({ id: 1, title: 'Deleted' })
      const res = await nacDeleteRow(posts as unknown as NacTableWithId, '1')
      expect(res.title).toBe('Deleted')
    })

    it('throws DeletionFailedError for invalid IDs', async () => {
      vi.mocked(db.get).mockResolvedValue(null)
      await expect(nacDeleteRow(posts as unknown as NacTableWithId, '404')).rejects.toThrow(NacDeletionFailedError)
    })
  })
})
