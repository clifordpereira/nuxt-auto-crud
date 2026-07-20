import { describe, it, expect, vi } from 'vitest'
import { nacGetSchemaDefinition } from '../../src/runtime/server/utils/modelMapper'
import { useRuntimeConfig } from '#imports'

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

    // 'id' is intentionally NOT hidden — it must survive to be marked readonly (see test 5).
    // Only genuinely UI-irrelevant audit fields are hidden via formHiddenFields.
    const createdAtField = schema.fields.find(f => f.name === 'createdAt')
    const idField = schema.fields.find(f => f.name === 'id')

    expect(createdAtField).toBeUndefined()
    expect(idField).toBeDefined()
  })

  it('5) marks only "id" as readonly, ignoring deprecated formReadOnlyFields config', async () => {
    vi.mocked(useRuntimeConfig).mockReturnValueOnce({
      autoCrud: { apiHiddenFields: [] },
      public: {
        autoCrud: {
          // 'id' intentionally NOT hidden here, so it survives to the readonly check
          formHiddenFields: ['createdAt', 'updatedAt'],
          formReadOnlyFields: ['title'], // deprecated — should have zero effect
        },
      },
    } as unknown as ReturnType<typeof useRuntimeConfig>)

    const def = await nacGetSchemaDefinition('posts')
    const idField = def.fields.find(f => f.name === 'id')
    const titleField = def.fields.find(f => f.name === 'title')

    expect(idField?.readonly).toBe(true)
    expect(titleField?.readonly).toBe(false) // proves formReadOnlyFields is ignored
  })
})
