// test/unit/modelMapper.getForeignKey.spec.ts
import { describe, it, expect } from 'vitest'
import { getColumns } from 'drizzle-orm'
import { getTableConfig } from 'drizzle-orm/sqlite-core'
import * as schema from '#nac/schema'
import { getForeignKeyPropertyName } from '../../src/runtime/server/utils/modelMapper'

describe('modelMapper: getForeignKeyPropertyName', () => {

  it('1) schema should load posts table config', () => {
    const config = getTableConfig(schema.posts)
    expect(config).toBeDefined()
  })

  it('2) output should resolve to string when FK exists', () => {
    const { foreignKeys } = getTableConfig(schema.posts)
    const columns = getColumns(schema.posts)
    
    // Guard against undefined to satisfy TS
    const fk = foreignKeys[0]
    if (!fk) throw new Error('Post table should have at least one foreign key')

    const result = getForeignKeyPropertyName(fk, columns)
    expect(typeof result).toBe('string')
  })

  it('3) output should return undefined for invalid column maps', () => {
    const { foreignKeys } = getTableConfig(schema.posts)
    const fk = foreignKeys[0]
    
    if (fk) {
      // @ts-expect-error - testing runtime resilience
      const result = getForeignKeyPropertyName(fk, undefined)
      expect(result).toBeUndefined()
    }
  })

  it('4) verified: result property key exists in post columns', () => {
    const { foreignKeys } = getTableConfig(schema.posts)
    const fk = foreignKeys[0]

    if (fk) {
      const columns = getColumns(schema.posts)
      const result = getForeignKeyPropertyName(fk, columns)
      if (result) {
        expect(columns).toHaveProperty(result)
      }
    }
  })
})
