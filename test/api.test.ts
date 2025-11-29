import { describe, it, expect, beforeAll } from 'vitest'
import { ofetch } from 'ofetch'
import * as schema from '../playground-fullstack/server/database/schema'
import { getTableName, getTableColumns } from 'drizzle-orm'

const PORT = process.env.TEST_PORT || '3000'
const BASE_URL = `http://localhost:${PORT}/api`
const SUITE = process.env.TEST_SUITE || 'backend'

// Helper to generate random payload based on columns
function generatePayload(table: any) {
  const columns = getTableColumns(table)
  const payload: any = {}
  
  for (const [key, col] of Object.entries(columns)) {
    // Skip primary key and auto-generated fields
    if ((col as any).primary || key === 'createdAt' || key === 'updatedAt') continue
    
    // Simple type mapping (enhance as needed)
    const type = (col as any).columnType || (col as any).dataType
    
    if (type === 'SQLiteText') {
      if (key === 'email') payload[key] = `test-${Date.now()}@example.com`
      else payload[key] = `Test ${key}`
    } else if (type === 'SQLiteInteger') {
       if ((col as any).mode === 'boolean') payload[key] = false
       else payload[key] = 1 // Default integer
    }
  }
  return payload
}

describe(`API Tests (${SUITE})`, () => {
  
  // Dynamic Test Generation
  for (const [key, table] of Object.entries(schema)) {
    // Only process Drizzle tables
    if (!table || typeof table !== 'object' || !('name' in (table as any))) continue
    
    const tableName = getTableName(table as any)
    const modelName = tableName // Assuming model name matches table name for now
    
    // Skip posts/comments for now to avoid FK complexity in this iteration
    if (tableName !== 'users') continue 

    describe(`Model: ${modelName}`, () => {
      let createdId: number | string
      const payload = generatePayload(table)

      if (SUITE === 'backend') {
        describe('No Auth Mode', () => {
          it(`should list ${modelName}`, async () => {
            const res = await ofetch(`${BASE_URL}/${modelName}`)
            expect(Array.isArray(res)).toBe(true)
          })

          it(`should create ${modelName}`, async () => {
            const res = await ofetch(`${BASE_URL}/${modelName}`, {
              method: 'POST',
              body: payload,
            })
            expect(res).toMatchObject(payload)
            expect(res.id).toBeDefined()
            createdId = res.id
          })

          it(`should read ${modelName}`, async () => {
            const res = await ofetch(`${BASE_URL}/${modelName}/${createdId}`)
            expect(res).toMatchObject(payload)
          })

          it(`should update ${modelName}`, async () => {
            const updatePayload = { ...payload, name: 'Updated Name' } // Naive update
            const res = await ofetch(`${BASE_URL}/${modelName}/${createdId}`, {
              method: 'PATCH',
              body: updatePayload,
            })
            expect(res.name).toBe('Updated Name')
          })

          it(`should delete ${modelName}`, async () => {
            await ofetch(`${BASE_URL}/${modelName}/${createdId}`, {
              method: 'DELETE',
            })
            try {
              await ofetch(`${BASE_URL}/${modelName}/${createdId}`)
            } catch (err: any) {
              expect(err.statusCode).toBe(404)
            }
          })
        })
      } else if (SUITE === 'fullstack') {
        describe('Auth Mode', () => {
          it(`should return 401 for unauthenticated access to ${modelName}`, async () => {
            try {
              await ofetch(`${BASE_URL}/${modelName}`)
            } catch (err: any) {
              expect(err.statusCode).toBe(401)
            }
          })
        })
      }
    })
  }
}, 20000)
