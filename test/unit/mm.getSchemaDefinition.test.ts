// test/unit/modelMapper.getSchemaDefinition.spec.ts
import { describe, it, expect } from 'vitest'
import { getSchemaDefinition } from '../../src/runtime/server/utils/modelMapper'

describe('modelMapper: getSchemaDefinition', () => {
  it('1) should return a complete SchemaDefinition for posts', () => {
    const schema = getSchemaDefinition('posts')

    expect(schema.resource).toBe('posts')
    expect(schema.labelField).toBe('title')
    expect(Array.isArray(schema.fields)).toBe(true)
  })

  it('2) should correctly map relation "categoryId" to "categories"', () => {
    const schema = getSchemaDefinition('posts')
    const catField = schema.fields.find(f => f.name === 'categoryId')

    expect(catField?.references).toBe('categories')
  })

  it('3) should detect enum types and options', () => {
    const schema = getSchemaDefinition('posts')
    const statusField = schema.fields.find(f => f.name === 'status')

    expect(statusField?.type).toBe('enum')
    expect(statusField?.selectOptions).toContain('published')
  })

  it('4) should respect formHiddenFields as isReadOnly', () => {
    // If 'id' is in formHiddenFields in mock config
    const schema = getSchemaDefinition('posts')
    const idField = schema.fields.find(f => f.name === 'id')

    expect(idField?.isReadOnly).toBe(true)
  })

  it('5) should throw error for non-existent models', () => {
    expect(() => getSchemaDefinition('ghost_table')).toThrow('Resource ghost_table not found')
  })
})
