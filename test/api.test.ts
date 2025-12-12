import { describe, it, expect, beforeAll } from 'vitest'
import { ofetch } from 'ofetch'
import { getTableName, getTableColumns } from 'drizzle-orm'
import { SignJWT } from 'jose'
import * as fullstackSchema from '../playground/server/db/schema'
import * as backendSchema from '../playground-backendonly/server/db/schema'

const schema = (process.env.TEST_SUITE || 'backend') === 'backend' ? backendSchema : fullstackSchema

const PORT = process.env.TEST_PORT || '3000'
const SUITE = process.env.TEST_SUITE || 'backend'

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
      if (key === 'email') payload[key] = `test-${Date.now()}-${Math.floor(Math.random() * 10000)}@example.com`
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
  let api: typeof ofetch

  beforeAll(async () => {
    const headers: Record<string, string> = {}

    if (SUITE === 'backend') {
      const secret = new TextEncoder().encode('test-secret-key-123')
      const token = await new SignJWT({ role: 'admin' })
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('2h')
        .sign(secret)
      
      headers.Authorization = `Bearer ${token}`
    }

    if (SUITE === 'fullstack') {
      try {
        const response = await ofetch.raw(`http://localhost:${PORT}/api/auth/login`, {
          method: 'POST',
          body: {
            email: 'admin@example.com',
            password: '$1Password',
          },
        })
        const setCookie = response.headers.get('set-cookie')
        if (setCookie) {
          headers.cookie = setCookie
        }
      }
      catch (e) {
        console.error('Login failed', e)
        throw e
      }
    }

    api = ofetch.create({
      baseURL: `http://localhost:${PORT}`,
      headers,
    })
  }, 30000)

  // Dynamic Test Generation
  console.log('Schema keys:', Object.keys(schema))
  for (const [_key, table] of Object.entries(schema)) {
    // Only process Drizzle tables
    if (!table || typeof table !== 'object') continue

    let tableName
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      tableName = getTableName(table as any)
    }
    catch {
      continue
    }

    if (!tableName) continue

    const modelName = tableName // Assuming model name matches table name for now

    // Filter tables to test
    if (!['users', 'subscribers', 'testimonials'].includes(tableName)) continue

    describe(`Model: ${modelName}`, () => {
      let createdId: number | string
      const payload = generatePayload(table)

      describe('LCRUD Operations', () => {
        it(`should list ${modelName}`, async () => {
          const res = await api(`/api/${modelName}`)
          expect(Array.isArray(res)).toBe(true)
        })

        it(`should create ${modelName}`, async () => {
          console.log(`Creating ${modelName} with payload:`, JSON.stringify(payload, null, 2))
          let res
          try {
            res = await api(`/api/${modelName}`, {
              method: 'POST',
              body: payload,
            })
          }
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          catch (err: any) {
            console.error(`Failed to create ${modelName}:`, err.data || err.message)
            throw err
          }

          const { password, ...expectedPayload } = payload
          expect(res).toMatchObject(expectedPayload)

          if (res.password) expect(res.password).toBeUndefined()
          expect(res.id).toBeDefined()
          createdId = res.id
        })

        it(`should read ${modelName}`, async () => {
          const res = await api(`/api/${modelName}/${createdId}`)
          const { password, ...expectedPayload } = payload
          expect(res).toMatchObject(expectedPayload)
        })

        it(`should update ${modelName}`, async () => {
          const updatePayload = { ...payload }
          // Generic update: just change strings if they exist
          for (const key of Object.keys(updatePayload)) {
            if (typeof updatePayload[key] === 'string' && key !== 'email') {
              updatePayload[key] = `Updated ${key}`
            }
          }

          const res = await api(`/api/${modelName}/${createdId}`, {
            method: 'PATCH',
            body: updatePayload,
          })

          const { password, ...expectedUpdate } = updatePayload
          expect(res).toMatchObject(expectedUpdate)
        })

        it(`should delete ${modelName}`, async () => {
          if (!createdId) throw new Error('No createdId to delete')
          await api(`/api/${modelName}/${createdId}`, {
            method: 'DELETE',
          })
          try {
            await api(`/api/${modelName}/${createdId}`)
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
      // Find an effective user to test read permissions
      const users = await api('/api/users')
      if (users.length === 0) {
        throw new Error('No users found to test read. Seeding might have failed.')
      }
      const userId = users[0].id

      const response = await api(`/api/users/${userId}`)
      expect(response).toBeDefined()

      // Check public columns exist
      publicColumns.forEach(col => expect(response).toHaveProperty(col))
      // Check private columns are hidden
      privateColumns.forEach(col => expect(response).not.toHaveProperty(col))
    })
  })
}, 20000)
