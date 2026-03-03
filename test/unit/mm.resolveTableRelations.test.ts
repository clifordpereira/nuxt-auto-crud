// test/unit/modelMapper.resolveTableRelations.spec.ts
import { describe, it, expect } from 'vitest'
import * as schema from '#nac/schema'
import { resolveTableRelations } from '../../src/runtime/server/utils/modelMapper'

describe('modelMapper: resolveTableRelations', () => {
  it('1) returns record mapping property keys to target table names', async () => {
    // Add await here
    const result = await resolveTableRelations(schema.posts)

    expect(result).toEqual({
      categoryId: 'categories',
    })
  })

  it('2) returns empty object when no foreign keys exist', async () => {
    // Add await here
    const result = await resolveTableRelations(schema.categories)

    expect(result).toEqual({})
    expect(Object.keys(result).length).toBe(0)
  })

  it('3) ensures result keys exist in the source table columns', async () => {
    // Add await here
    const result = await resolveTableRelations(schema.posts)
    const columnKeys = Object.keys(schema.posts)

    Object.keys(result).forEach((key) => {
      expect(columnKeys).toContain(key)
    })
  })
})
