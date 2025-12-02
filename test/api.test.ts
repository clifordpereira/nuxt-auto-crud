import { describe, it, expect } from 'vitest'
import { ofetch } from 'ofetch'
import { getTableName, getTableColumns } from 'drizzle-orm'
import * as fullstackSchema from '../playground/server/database/schema'
import * as backendSchema from '../playground-backendonly/server/database/schema'

const schema = (process.env.TEST_SUITE || 'backend') === 'backend' ? backendSchema : fullstackSchema

const PORT = process.env.TEST_PORT || '3000'
const BASE_URL = `http://localhost:${PORT}/api`
const SUITE = process.env.TEST_SUITE || 'backend'
const api = ofetch.create({ baseURL: `http://localhost:${PORT}` })

// Helper to generate random payload based on columns
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function generatePayload(table: any) {
  const columns = getTableColumns(table)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const payload: any = {}

  for (const [key, col] of Object.entries(columns)) {
    // Skip primary key and auto-generated fields
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((col as any).primary || key === 'createdAt' || key === 'updatedAt') continue

    // Simple type mapping (enhance as needed)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const type = (col as any).columnType || (col as any).dataType

    if (type === 'SQLiteText') {
      if (key === 'email') payload[key] = `test-${Date.now()}@example.com`
      else payload[key] = `Test ${key}`
    }
    else if (type === 'SQLiteInteger') {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if ((col as any).mode === 'boolean') payload[key] = false
      else payload[key] = 1 // Default integer
    }
  }
  return payload
}

describe(`API Tests (${SUITE})`, () => {
  // Dynamic Test Generation
  for (const [_key, table] of Object.entries(schema)) {
    // Only process Drizzle tables
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (!table || typeof table !== 'object' || !('name' in (table as any))) continue

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const tableName = getTableName(table as any)
    const modelName = tableName // Assuming model name matches table name for now

    // Skip posts/comments for now to avoid FK complexity in this iteration
    if (tableName !== 'users') continue

    describe(`Model: ${modelName}`, () => {
      let createdId: number | string
      const payload = generatePayload(table)

      describe('LCRUD Operations', () => {
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
          }
          catch (err: unknown) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            expect((err as any).statusCode).toBe(404)
          }
        })
      })
    })
  }
  describe.runIf(process.env.TEST_SUITE === 'fullstack')('Controlled API Exposure', () => {
    const publicColumns = ['id', 'name', 'avatar', 'email']
    const privateColumns = ['password']

    it('Public: List users (Allowed & Filtered)', async () => {
      const response = await api('/api/users')
      expect(response).toBeDefined()
      expect(Array.isArray(response)).toBe(true)

      if (response.length > 0) {
        const user = response[0]
        // Check public columns exist
        publicColumns.forEach(col => expect(user).toHaveProperty(col))
        // Check private columns are hidden
        privateColumns.forEach(col => expect(user).not.toHaveProperty(col))
      }
    })

    it('Public: Read user (Allowed & Filtered)', async () => {
      // Assuming user with ID 1 exists from previous tests
      const response = await api('/api/users/1')
      expect(response).toBeDefined()

      // Check public columns exist
      publicColumns.forEach(col => expect(response).toHaveProperty(col))
      // Check private columns are hidden
      privateColumns.forEach(col => expect(response).not.toHaveProperty(col))
    })


  })
}, 20000)
