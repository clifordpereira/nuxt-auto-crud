// test/unit/modelMapper.buildMap.spec.ts
import { describe, it, expect } from 'vitest'
import { Table, is } from 'drizzle-orm'
import * as schema from '#nac/schema'
import { buildModelTableMap } from '../../src/runtime/server/utils/modelMapper'

describe('modelMapper: buildModelTableMap', () => {
  it('1) schema should be loaded correctly via alias', () => {
    expect(schema).toBeDefined()
    expect(schema.users).toBeDefined()
    expect(schema.posts).toBeDefined()
  })

  it('2) loaded schema items should be Drizzle Table instances', () => {
    expect(is(schema.users, Table)).toBe(true)
    expect(is(schema.posts, Table)).toBe(true)
    expect(is(schema.categories, Table)).toBe(true)
  })

  it('3) output modelTableMap should be a Record of Tables', () => {
    const map = buildModelTableMap()

    expect(typeof map).toBe('object')
    // Validate every entry in the resulting map is indeed a Table
    Object.values(map).forEach((table) => {
      expect(is(table, Table)).toBe(true)
    })
  })

  it('4) output has expected value and excludes system tables', () => {
    const map = buildModelTableMap()
    const keys = Object.keys(map)

    // Should include standard entities
    expect(keys).toContain('users')
    expect(keys).toContain('posts')
    expect(keys).toContain('categories')

    // Should exclude system-level/hub tables (based on NAC_SYSTEM_TABLES)
    expect(keys).not.toContain('_hub_migrations')
  })
})
