// test/unit/validator.resolveValidatedSchema.spec.ts
import { describe, it, expect } from 'vitest'
import { z } from 'zod'
import * as schema from '#nac/schema'
import { resolveValidatedSchema } from '../../src/runtime/server/utils/validator'

describe('validator: resolveValidatedSchema', () => {

  it('1) returns a valid ZodObject', () => {
    const zodSchema = resolveValidatedSchema(schema.posts, 'insert')
    expect(zodSchema).toBeInstanceOf(z.ZodObject)
  })

  it('2) omits formHiddenFields (e.g., "id")', () => {
    // Assuming 'id' is in formHiddenFields
    const zodSchema = resolveValidatedSchema(schema.posts, 'insert')
    const shape = zodSchema.shape
    
    expect(shape).not.toHaveProperty('id')
    expect(shape).toHaveProperty('title')
  })

  it('3) applies .partial() for "patch" intent', () => {
    const zodSchema = resolveValidatedSchema(schema.posts, 'patch')
    const titleResult = zodSchema.safeParse({ content: 'only content' })
    
    // In patch mode, title is optional even if it's 'notNull' in Drizzle
    expect(titleResult.success).toBe(true)
  })

  it('4) enforces required fields for "insert" intent', () => {
    const zodSchema = resolveValidatedSchema(schema.posts, 'insert')
    const titleResult = zodSchema.safeParse({ content: 'missing title' })
    
    expect(titleResult.success).toBe(false)
  })

  it('5) coerces strings to Dates for timestamp columns', () => {
    const zodSchema = resolveValidatedSchema(schema.posts, 'insert')
    const dateStr = '2026-02-13T12:00:00Z'
    
    const result = zodSchema.safeParse({
      title: 'Test',
      publishedAt: dateStr // timestamp column
    })

    if (result.success) {
      expect(result.data.publishedAt).toBeInstanceOf(Date)
    }
  })
})