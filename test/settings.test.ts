import { describe, it, expect, beforeAll } from 'vitest'
import { ofetch } from 'ofetch'

const PORT = process.env.TEST_PORT || 3000

describe('Settings / Password Change Tests', () => {
  let userApi: typeof ofetch
  let userEmail: string
  const originalPassword = 'password123'
  const newPassword = 'newpassword456'

  beforeAll(async () => {
    userEmail = `settings.user.${Date.now()}@test.com`
    
    // Cleanup/Setup logic could go here if needed
  })

  it('should allow user to signup and obtain session', async () => {
    const signupRes = await ofetch.raw(`http://localhost:${PORT}/api/auth/signup`, {
      method: 'POST',
      body: {
        name: 'Settings User',
        email: userEmail,
        password: originalPassword,
      },
    })
    
    expect(signupRes.status).toBe(200)
    const setCookie = signupRes.headers.get('set-cookie')
    expect(setCookie).toBeDefined()

    userApi = ofetch.create({
      baseURL: `http://localhost:${PORT}`,
      headers: { cookie: setCookie! },
    })
  })

  it('should FAIL to change password if current password is wrong', async () => {
    try {
      await userApi('/api/auth/change-password', {
        method: 'POST',
        body: {
          currentPassword: 'wrongpassword',
          newPassword: newPassword
        }
      })
      throw new Error('Should have failed with invalid current password')
    } catch (err: any) {
      expect(err.statusCode).toBe(401)
      expect(err.data?.message).toContain('Invalid current password')
    }
  })

  it('should successfully change password with correct current password', async () => {
    const res = await userApi('/api/auth/change-password', {
      method: 'POST',
      body: {
        currentPassword: originalPassword,
        newPassword: newPassword
      }
    })
    expect(res.message).toContain('Password updated successfully')
  })

  it('should allow login with NEW password', async () => {
    const loginRes = await ofetch(`http://localhost:${PORT}/api/auth/login`, {
      method: 'POST',
      body: {
        email: userEmail,
        password: newPassword
      }
    })
    expect(loginRes.user).toBeDefined()
    expect(loginRes.user.email).toBe(userEmail)
  })

  it('should FAIL login with OLD password', async () => {
    try {
      await ofetch(`http://localhost:${PORT}/api/auth/login`, {
        method: 'POST',
        body: {
          email: userEmail,
          password: originalPassword
        }
      })
      throw new Error('Should have failed login with old password')
    } catch (err: any) {
       expect(err.statusCode).toBe(401)
    }
  })
})
