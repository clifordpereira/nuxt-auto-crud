// playground/shared/utils/auth-logic.test.ts
import { describe, it, expect } from 'vitest'
import { hasPermission, hasOwnershipPermission, isOwner, type AuthUser } from '../../shared/utils/auth-logic'

describe('NAC Auth Logic', () => {
  const mockUser: AuthUser = { 
    id: 123, 
    role: 'user',
    permissions: { 
      posts: ['read', 'update_own'],
      tasks: ['delete_own']
    } 
  }

  describe('Permission Discovery', () => {
    it('identifies explicit global permissions', () => {
      expect(hasPermission(mockUser, 'posts', 'read')).toBe(true)
      expect(hasPermission(mockUser, 'posts', 'update')).toBe(false)
    })

    it('identifies ownership-based permissions via suffix', () => {
      expect(hasOwnershipPermission(mockUser, 'posts', 'update')).toBe(true)
      expect(hasOwnershipPermission(mockUser, 'tasks', 'delete')).toBe(true)
      expect(hasOwnershipPermission(mockUser, 'posts', 'read')).toBe(false)
    })
  })

  describe('Identity Matching (isOwner)', () => {
    it('validates self-check for "users" table', () => {
      expect(isOwner(mockUser, 'users', { id: 123 })).toBe(true)
      expect(isOwner(mockUser, 'users', { id: '123' })).toBe(true) // string conversion check
    })

    it('validates standard ownership fields', () => {
      expect(isOwner(mockUser, 'posts', { createdBy: 123 })).toBe(true)
      expect(isOwner(mockUser, 'posts', { ownerId: 123 })).toBe(true)
      expect(isOwner(mockUser, 'posts', { userId: 123 })).toBe(true)
    })

    it('denies when ID does not match', () => {
      expect(isOwner(mockUser, 'posts', { createdBy: 999 })).toBe(false)
    })

    it('gracefully handles null context', () => {
      expect(isOwner(mockUser, 'posts', null)).toBe(false)
    })
  })
})