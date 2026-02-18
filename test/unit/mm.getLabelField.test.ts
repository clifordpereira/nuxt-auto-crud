// test/unit/modelMapper.getLabelField.spec.ts
import { describe, it, expect } from 'vitest'
import { getColumns } from 'drizzle-orm'
import * as schema from '#nac/schema'
import { getLabelField } from '../../src/runtime/server/utils/modelMapper'

describe('modelMapper: getLabelField', () => {
  it('1) should return "title" for posts table', () => {
    const columnNames = Object.keys(getColumns(schema.posts))
    const result = getLabelField(columnNames)

    // posts has: id, title, content...
    // "title" is the first candidate matched.
    expect(result).toBe('title')
  })

  it('2) should return "name" for categories table', () => {
    const columnNames = Object.keys(getColumns(schema.categories))
    const result = getLabelField(columnNames)

    // categories has: id, name...
    // "name" is the first candidate matched.
    expect(result).toBe('name')
  })

  it('3) should return "email" if name/title/label are missing', () => {
    const columnNames = ['id', 'email', 'password']
    const result = getLabelField(columnNames)

    expect(result).toBe('email')
  })

  it('4) should fallback to "id" when no candidates match', () => {
    const columnNames = ['id', 'slug', 'hexCode']
    const result = getLabelField(columnNames)

    expect(result).toBe('id')
  })
})
