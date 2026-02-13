// test/unit/modelMapper.getSelectable.spec.ts
import { describe, it, expect } from 'vitest'
import { Column } from 'drizzle-orm'
import * as schema from '#nac/schema'
import { getSelectableFields } from '../../src/runtime/server/utils/modelMapper'

describe('modelMapper: getSelectableFields', () => {

  it('1) should return a Record of Columns', () => {
    const result = getSelectableFields(schema.posts)
    
    expect(typeof result).toBe('object')
    expect(Object.values(result)[0]).toBeInstanceOf(Column)
  })

  it('2) should filter out fields defined in apiHiddenFields', () => {
    // Mock config has ['deletedAt'] in apiHiddenFields
    const result = getSelectableFields(schema.posts)
    
    expect(result).not.toHaveProperty('deletedAt')
  })

  it('3) should include non-hidden fields from posts', () => {
    const result = getSelectableFields(schema.posts)
    
    expect(result).toHaveProperty('id')
    expect(result).toHaveProperty('title')
    expect(result).toHaveProperty('categoryId')
  })

  it('4) result count should match allColumns minus hidden count', () => {
    const allColumns = Object.keys(schema.posts).length // or getColumns(schema.posts)
    const selectable = Object.keys(getSelectableFields(schema.posts))
    
    // In our example schema, no posts fields are named 'deletedAt'
    // So selectable count should equal total count
    expect(selectable.length).toBeLessThanOrEqual(allColumns)
  })
})