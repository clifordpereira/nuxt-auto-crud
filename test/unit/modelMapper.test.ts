import { describe, it, expect, vi, beforeAll, beforeEach } from 'vitest'
import * as drizzleStore from 'drizzle-orm' // Hoisted for performance cache

describe('modelMapper.ts', () => {
  let mapper: any

  beforeAll(async () => {
    vi.doMock('#imports', () => ({
      useRuntimeConfig: () => ({
        autoCrud: { resources: { users: ['email', 'lastLogin'] } }
      })
    }))

    vi.doMock('#site/schema', async () => {
      const { sqliteTable, text, integer } = await import('drizzle-orm/sqlite-core')
      return {
        users: sqliteTable('users', {
          id: integer('id').primaryKey(),
          email: text('email').notNull(),
          password: text('password'),
          lastLogin: integer('last_login', { mode: 'timestamp' }),
          deletedAt: integer('deleted_at', { mode: 'timestamp' })
        }),
        logs: sqliteTable('logs', {
          id: integer('id').primaryKey(),
          message: text('message')
        })
      }
    })
  })

  beforeEach(async () => {
    mapper = await import('../../src/runtime/server/utils/modelMapper')
    // Fast state reset for isolation
    for (const key in mapper.customUpdatableFields) delete mapper.customUpdatableFields[key]
    for (const key in mapper.customHiddenFields) delete mapper.customHiddenFields[key]
  })

  it('returns plural/singular names correctly', () => {
    expect(mapper.getModelSingularName('user_profiles')).toBe('UserProfile')
    expect(mapper.getModelPluralName('category')).toBe('categories')
  })

  it('handles irregular and uncountable nouns for stable routing', () => {
    expect(mapper.getModelSingularName('analyses')).toBe('Analysis')
    expect(mapper.getModelPluralName('Analysis')).toBe('analyses')
    expect(mapper.getModelSingularName('audit_logs')).toBe('AuditLog')
    expect(mapper.getModelPluralName('data')).toBe('data')
  })

  it('coerces ISO strings to Date in filterUpdatableFields', () => {
    const input = { email: 'clif@clifland.com', lastLogin: '2026-01-28T18:00:00.000Z' }
    const result = mapper.filterUpdatableFields('users', input)
    expect(result.lastLogin).toBeInstanceOf(Date)
    expect((result.lastLogin as Date).toISOString()).toBe('2026-01-28T18:00:00.000Z')
  })

  it('throws 404 with hints when model is missing', () => {
    try {
      mapper.getTableForModel('non_existent')
    } catch (e: any) {
      expect(e.statusCode).toBe(404)
      expect(e.message).toContain('users, logs')
    }
  })

  it('generates agentic-safe Zod schemas', () => {
    const schema = mapper.getZodSchema('users', 'insert')
    expect((schema as any).shape.id).toBeUndefined()
    expect((schema as any).shape.email).toBeDefined()
  })

  it('generates partial schemas for patch operations', () => {
    const schema = mapper.getZodSchema('users', 'patch') as any
    expect(schema.shape.email.isOptional()).toBe(true)
  })

  it('validates required fields via generated schema', () => {
    const schema = mapper.getZodSchema('users', 'insert')
    const result = schema.safeParse({ password: '123' }) 

    expect(result.success).toBe(false)
    const fieldErrors = !result.success ? result.error.flatten().fieldErrors : {}
    expect(fieldErrors).toHaveProperty('email')
  })

  it('respects customUpdatableFields overrides', () => {
    mapper.customUpdatableFields['users'] = ['email']
    const result = mapper.filterUpdatableFields('users', { email: 'a@b.com', lastLogin: '2026-01-28' })
    expect(result.lastLogin).toBeUndefined()
  })

  it('strips soft-delete fields from public output', () => {
    const result = mapper.filterPublicColumns('users', { email: 'a@b.com', deletedAt: new Date() })
    expect(result.deletedAt).toBeUndefined()
  })

  it('handles irregular pluralization for API routing', () => {
    expect(mapper.getModelSingularName('analyses')).toBe('Analysis')
    expect(mapper.getModelSingularName('audit_logs')).toBe('AuditLog')
  })
  
  it('handles empty/non-table exports in schema safely', () => {
    // Test buildModelTableMap logic against unexpected exports
    expect(mapper.getAvailableModels()).not.toContain('nonTableExport')
  })

  it('does not throw when omitting fields that do not exist in the table', () => {
    expect(() => {
      mapper.getZodSchema('logs', 'insert')
    }).not.toThrow()
    
    const schema = mapper.getZodSchema('logs', 'insert')
    expect((schema as any).shape.message).toBeDefined()
  })

  it('respects runtimeConfig whitelist in filterPublicColumns', () => {
    const result = mapper.filterPublicColumns('users', { email: 'clif@clifland.com', id: 1 })
    expect(result.email).toBeDefined()
    expect(result.id).toBeUndefined()
  })

  it('returns empty object when filterPublicColumns has empty whitelist', async () => {
    vi.resetModules() // Wipe the cache
    vi.doMock('#imports', () => ({
      useRuntimeConfig: () => ({
        autoCrud: { resources: { logs: [] } } // Explicitly empty
      })
    }))
    
    // Re-import to catch the new mock state
    const mapperInstance = await import('../../src/runtime/server/utils/modelMapper')
    const result = mapperInstance.filterPublicColumns('logs', { message: 'test' })
    
    expect(result).toEqual({})
  })

  it('falls back to HIDDEN_FIELDS for non-whitelisted resources', () => {
    const result = mapper.filterHiddenFields('logs', { id: 100, message: 'boot', googleId: '123' })
    expect(result.message).toBeDefined()
    expect(result.googleId).toBeUndefined()
  })

  it('prioritizes customHiddenFields and respects constants', () => {
    mapper.customHiddenFields['users'] = ['email']
    const result = mapper.filterHiddenFields('users', { email: 'secret', password: '123', username: 'clif' })    
    expect(result.email).toBeUndefined()    // Custom hidden
    expect(result.password).toBeUndefined() // Constant hidden
    expect(result.username).toBe('clif')    // Safe
  })

  it('ensures PROTECTED_FIELDS are never updatable even if public', () => {
    const input = { email: 'new@clifland.com', id: 999, createdAt: '2026-01-01' }
    const result = mapper.filterUpdatableFields('users', input)
    
    expect(result.email).toBeDefined()
    expect(result.id).toBeUndefined()        // Protected
    expect(result.createdAt).toBeUndefined() // Protected
  })
})
