import { describe, it, expect, beforeAll } from 'vitest'
import { ofetch } from 'ofetch'

const PORT = 3000

describe.runIf(process.env.TEST_SUITE !== 'backend')('Profile Password Update Tests', () => {
  let userAApi: typeof ofetch
  let userA: { id: number | string, email: string, name: string }
  let userAEmail: string
  const initialPassword = 'password123'
  const newPassword = 'newpassword456'

  beforeAll(async () => {
    // 1. Signup User A
    userAEmail = `user.pass.${Date.now()}@test.com`
    let userACookie = ''

    try {
      const response = await ofetch.raw(`http://localhost:${PORT}/api/auth/signup`, {
        method: 'POST',
        body: {
          name: 'User Password',
          email: userAEmail,
          password: initialPassword,
        },
      })
      userA = response._data.user
      const setCookie = response.headers.get('set-cookie')
      if (setCookie) {
        userACookie = setCookie
      }
    }
    catch (e: unknown) {
      const err = e as { data?: unknown }
      console.error('User Signup failed', err.data || e)
      throw e
    }

    userAApi = ofetch.create({
      baseURL: `http://localhost:${PORT}`,
      headers: { cookie: userACookie },
    })
  }, 30000)

  it('should allow User A to update their password', async () => {
    // Update password
    const res = await userAApi(`/api/users/${userA.id}`, {
      method: 'PATCH',
      body: {
        password: newPassword,
      },
    })

    // Response should NOT contain password
    expect(res.password).toBeUndefined()

    // Verify login with OLD password fails
    try {
      await ofetch(`http://localhost:${PORT}/api/auth/login`, {
        method: 'POST',
        body: {
          email: userAEmail,
          password: initialPassword,
        },
      })
      throw new Error('Should not be able to login with old password')
    }
    catch (e: unknown) {
      const err = e as { statusCode: number }
      expect(err.statusCode).toBe(401)
    }

    // Verify login with NEW password succeeds
    const loginRes = await ofetch(`http://localhost:${PORT}/api/auth/login`, {
      method: 'POST',
      body: {
        email: userAEmail,
        password: newPassword,
      },
    })
    expect(loginRes).toBeDefined()
    expect(loginRes.user.email).toBe(userAEmail)
  })
})
