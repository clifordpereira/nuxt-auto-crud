import { fileURLToPath } from 'node:url'
import { describe, it, expect } from 'vitest'
import { setup, $fetch } from '@nuxt/test-utils/e2e'
import { SignJWT } from 'jose'

const JWT_SECRET = 'test-secret-key-123'

describe('JWT Authentication', async () => {
  await setup({
    rootDir: fileURLToPath(new URL('./fixtures/jwt', import.meta.url)),
  })

  it('should reject requests without token', async () => {
    try {
      await $fetch('/api/users', { method: 'POST', body: { name: 'Test' } })
      expect.fail('Should have thrown 401')
    }
    catch (e: unknown) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect((e as any).response?.status).toBe(401)
    }
  })

  it('should reject requests with invalid token', async () => {
    try {
      await $fetch('/api/users', {
        method: 'POST',
        body: { name: 'Test' },
        headers: { Authorization: 'Bearer invalid-token' },
      })
      expect.fail('Should have thrown 401')
    }
    catch (e: unknown) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect((e as any).response?.status).toBe(401)
    }
  })

  it('should accept requests with valid token', async () => {
    const secret = new TextEncoder().encode(JWT_SECRET)
    const token = await new SignJWT({ role: 'admin' })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('1h')
      .sign(secret)

    const response = await $fetch('/api/users', {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` },
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

    try {
      const response = await $fetch('/api/users', {
        method: 'POST',
        body: {
          name: 'JWT Admin',
          email: `jwt-${Date.now()}@example.com`,
          password: 'password',
          avatar: 'avatar.png',
        },
        headers: { Authorization: `Bearer ${token}` },
      })
      expect(response).toBeDefined()
      expect(response.name).toBe('JWT Admin')
    }
    catch (e: unknown) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if ((e as any).response?.status === 401) {
        expect.fail('Auth failed with valid token')
      }
    }
  })
})
