import { describe, it, expect, beforeAll } from 'vitest'
import { ofetch } from 'ofetch'

const PORT = process.env.TEST_PORT || 3000

describe('Profile Feature Tests', () => {
  let userAApi: typeof ofetch
  let userA: any
  let userB: any

  beforeAll(async () => {
    // 1. Signup User A
    const userAEmail = `user.a.${Date.now()}@test.com`
    let userACookie = ''
    
    try {
      const response = await ofetch.raw(`http://localhost:${PORT}/api/auth/signup`, {
        method: 'POST',
        body: {
          name: 'User A',
          email: userAEmail,
          password: 'password123', // min 8 chars
        },
      })
      userA = response._data.user
      const setCookie = response.headers.get('set-cookie')
      if (setCookie) {
        userACookie = setCookie
      }
    } catch (e: any) {
      console.error('User A Signup failed', e.data || e)
      throw e
    }

    userAApi = ofetch.create({
      baseURL: `http://localhost:${PORT}`,
      headers: { cookie: userACookie },
    })

    // 2. Signup User B (we just need their ID)
    const userBEmail = `user.b.${Date.now()}@test.com`
    try {
      const response = await ofetch.raw(`http://localhost:${PORT}/api/auth/signup`, {
        method: 'POST',
        body: {
          name: 'User B',
          email: userBEmail,
          password: 'password123',
        },
      })
      userB = response._data.user
      // We don't need User B's session
    } catch (e: any) {
      console.error('User B Signup failed', e.data || e)
      throw e
    }
  }, 30000)

  it('should allow User A to update their own profile', async () => {
    const newName = 'User A Updated'
    const res = await userAApi(`/api/users/${userA.id}`, {
      method: 'PATCH',
      body: {
        name: newName,
      },
    })
    expect(res.name).toBe(newName)
    // Update local userA object to reflect change for subsequent tests if any
    userA.name = newName
  })

  it('should NOT allow User A to update User B profile', async () => {
    try {
      await userAApi(`/api/users/${userB.id}`, {
        method: 'PATCH',
        body: {
          name: 'Hacked Name',
        },
      })
      // If it doesn't throw, fail the test
      throw new Error('User A was able to update User B!')
    } catch (err: any) {
      // Expect 403 Forbidden
      expect(err.statusCode).toBe(403)
    }
  })
})
