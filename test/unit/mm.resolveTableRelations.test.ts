// test/unit/modelMapper.resolveTableRelations.spec.ts
import { describe, it, expect } from 'vitest'
import * as schema from '#nac/schema'
import { resolveTableRelations } from '../../src/runtime/server/utils/modelMapper'

describe('modelMapper: resolveTableRelations', () => {
  it('1) returns record mapping property keys to target table names', () => {
    const result = resolveTableRelations(schema.posts)

    // Validates categoryId maps to 'categories' string
    expect(result).toEqual({
      categoryId: 'categories',
    })
  })

  it('2) returns empty object when no foreign keys exist', () => {
    const result = resolveTableRelations(schema.categories)

    expect(result).toEqual({})
    expect(Object.keys(result).length).toBe(0)
  })

  it('3) ensures result keys exist in the source table columns', () => {
    const result = resolveTableRelations(schema.posts)
    const columnKeys = Object.keys(schema.posts)

    Object.keys(result).forEach((key) => {
      expect(columnKeys).toContain(key)
    })
  })
})
