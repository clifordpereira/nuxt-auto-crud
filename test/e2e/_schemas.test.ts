import { describe, it, expect } from 'vitest'
import { $fetch } from '@nuxt/test-utils/e2e'
import { useRuntimeConfig } from '#imports'

describe('NAC: Schema Definition Reflection', async () => {
  const { endpointPrefix } = useRuntimeConfig().public.autoCrud
  const schemaBase = `${endpointPrefix}/_schemas`

  it('GET: retrieves users schema with inferred metadata', async () => {
    const res = await $fetch<any>(`${schemaBase}/users`)

    expect(res.resource).toBe('users')
    expect(res.labelField).toBe('name')
    
    // Check specific field inference
    const bioField = res.fields.find((f: any) => f.name === 'bio')
    expect(bioField.type).toBe('textarea') // Inferred from TEXTAREA_HINTS
  })

  it('GET: respects hidden fields and read-only status', async () => {
    const res = await $fetch<any>(`${schemaBase}/posts`)
    
    // Check system field protection/visibility
    const idField = res.fields.find((f: any) => f.name === 'id')
    // Assuming 'id' is in formHiddenFields in your nuxt.config.ts
    if (idField) {
      expect(idField.isReadOnly).toBe(true)
    }
  })

  it('GET: retrieves posts schema with complex types', async () => {
    const res = await $fetch<any>(`${schemaBase}/posts`)

    // Verify Enum detection from status: text(..., { enum: [...] })
    const statusField = res.fields.find((f: any) => f.name === 'status')
    expect(statusField.type).toBe('enum')
    expect(statusField.selectOptions).toEqual(['draft', 'published', 'archived'])

    // Verify Relation mapping via categoryId
    const categoryField = res.fields.find((f: any) => f.name === 'categoryId')
    expect(categoryField.references).toBe('categories')
  })

  it('GET: returns 404 for non-existent model schema', async () => {
    try {
      await $fetch(`${schemaBase}/ghost_table`)
      throw new Error('Endpoint should have failed')
    } catch (error: any) {
      // ofetch throws an object containing the response
      expect(error.response?.status).toBe(404)
    }
  })

  it('GET: returns an array of all registered model keys', async () => {
    const res = await $fetch<string[]>(schemaBase)
    
    expect(Array.isArray(res)).toBe(true)
    // Checks if the modelTableMap keys are correctly returned
    expect(res).toContain('users')
    expect(res).toContain('posts')
    expect(res).toContain('categories')
    
    // Validates that NAC_SYSTEM_TABLES are filtered out
    expect(res).not.toContain('__drizzle_migrations')
  })
})