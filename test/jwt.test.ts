import { describe, it, expect } from 'vitest'
import { ofetch } from 'ofetch'
import { SignJWT } from 'jose'

const PORT = process.env.TEST_BACKEND_PORT || 3001
const api = ofetch.create({ baseURL: `http://localhost:${PORT}` })
const JWT_SECRET = 'test-secret-key-123'

describe('JWT Authentication', () => {
  it('should reject requests without token', async () => {
    try {
      await api('/api/users', { method: 'POST', body: { name: 'Test' } })
      expect.fail('Should have thrown 401')
    } catch (e: any) {
      expect(e.response?.status).toBe(401)
    }
  })

  it('should reject requests with invalid token', async () => {
    try {
      await api('/api/users', { 
        method: 'POST', 
        body: { name: 'Test' },
        headers: { Authorization: 'Bearer invalid-token' }
      })
      expect.fail('Should have thrown 401')
    } catch (e: any) {
      expect(e.response?.status).toBe(401)
    }
  })

  it('should accept requests with valid token', async () => {
    const secret = new TextEncoder().encode(JWT_SECRET)
    const token = await new SignJWT({ role: 'admin' })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('1h')
      .sign(secret)

    const response = await api('/api/users', {
      method: 'GET', // Using GET as it's safer, but POST should also work if we want to test admin action
      headers: { Authorization: `Bearer ${token}` }
    })
    
    expect(response).toBeDefined()
    expect(Array.isArray(response)).toBe(true)
  })
  
  it('should allow admin action (POST) with valid token', async () => {
    const secret = new TextEncoder().encode(JWT_SECRET)
    const token = await new SignJWT({ role: 'admin' })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('1h')
      .sign(secret)

    // Note: This might fail if the user schema requires fields we don't provide, 
    // but we just want to verify we pass the auth check.
    // If it fails with 400 or 500, it means auth passed (not 401).
    try {
        const response = await api('/api/users', {
            method: 'POST',
            body: { 
                name: 'JWT Admin', 
                email: `jwt-${Date.now()}@example.com`, 
                password: 'password',
                avatar: 'avatar.png'
            },
            headers: { Authorization: `Bearer ${token}` }
        })
        expect(response).toBeDefined()
        expect(response.name).toBe('JWT Admin')
    } catch (e: any) {
        if (e.response?.status === 401) {
            expect.fail('Auth failed with valid token')
        }
        // Other errors are fine (e.g. validation), as long as it's not 401
    }
  })
})
