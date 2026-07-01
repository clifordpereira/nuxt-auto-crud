import { describe, it, expect } from 'vitest'
import { nacGetSchemaDefinition } from '../../src/runtime/server/utils/modelMapper'

describe('modelMapper: nacGetSchemaDefinition', () => {
  it('1) should return a complete SchemaDefinition for posts', async () => {
    const schema = await nacGetSchemaDefinition('posts')

    expect(schema.resource).toBe('posts')
    expect(schema.labelField).toBe('title')
    expect(Array.isArray(schema.fields)).toBe(true)
  })

  it('2) should correctly map relation "categoryId" to "categories"', async () => {
    const schema = await nacGetSchemaDefinition('posts')
    const catField = schema.fields.find(f => f.name === 'categoryId')

    expect(catField?.references).toBe('categories')
  })

  it('3) should detect enum types and options', async () => {
    const schema = await nacGetSchemaDefinition('posts')
    const statusField = schema.fields.find(f => f.name === 'status')

    expect(statusField?.type).toBe('enum')
    expect(statusField?.selectOptions).toContain('published')
  })

  it('4) should filter out fields present in formHiddenFields', async () => {
    const schema = await nacGetSchemaDefinition('posts')

    // id and createdAt should be excluded from the fields array entirely
    const idField = schema.fields.find(f => f.name === 'id')
    const createdAtField = schema.fields.find(f => f.name === 'createdAt')

    expect(idField).toBeUndefined()
    expect(createdAtField).toBeUndefined()
  })

  it('5) should mark fields in formReadOnlyFields as readonly', async () => {
    const schema = await nacGetSchemaDefinition('posts')

    // These fields should exist in the array but have the read-only flag
    const titleField = schema.fields.find(f => f.name === 'title')

    expect(titleField).toBeDefined()
    expect(titleField?.readonly).toBe(true)
  })
})
