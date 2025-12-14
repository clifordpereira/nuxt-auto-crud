import { describe, it, expect, beforeAll } from 'vitest'
import { ofetch } from 'ofetch'

const PORT = process.env.TEST_PORT || 3000

describe.runIf(process.env.TEST_SUITE !== 'backend')('Resource Ownership Tests', () => {
  let adminApi: typeof ofetch
  let userAApi: typeof ofetch
  let userBApi: typeof ofetch

  let userA: { id: number | string, name: string, email: string }
  let _userB: { id: number | string, name: string, email: string }

  beforeAll(async () => {
    // 1. Admin Login
    let adminCookie = ''
    try {
      const response = await ofetch.raw(`http://localhost:${PORT}/api/auth/login`, {
        method: 'POST',
        body: {
          email: 'admin@example.com',
          password: '$1Password',
        },
      })
      const setCookie = response.headers.get('set-cookie')
      if (setCookie) adminCookie = setCookie
    }
    catch (e) {
      console.error('Admin Login failed', e)
      throw e
    }

    adminApi = ofetch.create({
      baseURL: `http://localhost:${PORT}`,
      headers: { cookie: adminCookie },
    })

    // 2. Ensure Permissions (Grant create/read/update_own/delete_own on 'testimonials' to userA's role)
    // We execute this BEFORE User A logs in so their session picks up the new permissions.
    try {
      const allRoles = await adminApi('/api/roles')
      const role = allRoles.find((r: { name: string, id: number }) => r.name === 'user')
      const [_resource] = await adminApi('/api/resources', { query: { name: 'testimonials' } }) // Resources by name logic? Same issue?
      // Check if resources API supports filtering? Likely not if it's the same handler.
      const allResources = await adminApi('/api/resources') // Fetch all just in case
      const targetResource = allResources.find((r: { name: string, id: number }) => r.name === 'testimonials')

      if (role && targetResource) {
        const permsToGrant = ['create', 'read', 'update_own', 'delete_own']
        const availablePerms = await adminApi('/api/permissions')

        for (const code of permsToGrant) {
          const perm = availablePerms.find((p: { code: string, id: number }) => p.code === code)
          if (perm) {
            try {
              await adminApi('/api/roleResourcePermissions', {
                method: 'POST',
                body: {
                  roleId: role.id,
                  resourceId: targetResource.id,
                  permissionId: perm.id,
                },
              })
            }
            catch (e: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
              console.error(`Failed to grant ${code}:`, e.data || e)
            }
          }
        }

        // Verify permissions exist
        // const rrps = await adminApi('/api/roleResourcePermissions')
        // const relevant = rrps.filter((p: any) => p.roleId === role.id && p.resourceId === targetResource.id)
      }
    }
    catch (e) {
      console.log('Permission setup skipped/failed, hoping defaults work.', e)
    }

    // 3. Signup User A
    const userAEmail = `user.a.own.${Date.now()}@test.com`
    try {
      const response = await ofetch.raw(`http://localhost:${PORT}/api/auth/signup`, {
        method: 'POST',
        body: {
          name: 'User A',
          email: userAEmail,
          password: 'password123',
        },
      })
      userA = response._data.user
      userAApi = ofetch.create({
        baseURL: `http://localhost:${PORT}`,
        headers: { cookie: response.headers.get('set-cookie') || '' },
      })
    }
    catch (e) {
      console.error('User A Signup failed', e)
      throw e
    }

    // 4. Signup User B
    const userBEmail = `user.b.own.${Date.now()}@test.com`
    try {
      const response = await ofetch.raw(`http://localhost:${PORT}/api/auth/signup`, {
        method: 'POST',
        body: {
          name: 'User B',
          email: userBEmail,
          password: 'password123',
        },
      })
      _userB = response._data.user
      userBApi = ofetch.create({
        baseURL: `http://localhost:${PORT}`,
        headers: { cookie: response.headers.get('set-cookie') || '' },
      })
    }
    catch (e) {
      console.error('User B Signup failed', e)
      throw e
    }
  }, 40000)

  it('should handle ownership correctly', async () => {
    // 1. User A creates a testimonial
    const payload = {
      name: 'User A Testimonial',
      role: 'Tester',
      content: 'This is my content',
      status: 'active',
    }

    let createdRecord
    try {
      createdRecord = await userAApi('/api/testimonials', {
        method: 'POST',
        body: payload,
      })
    }
    catch (e: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
      console.error('Creation failed', e.data)
      throw new Error(`User A failed to create record: ${e.statusCode}`)
    }

    expect(createdRecord).toBeDefined()
    expect(createdRecord).toBeDefined()
    expect(createdRecord.name).toBe(payload.name)

    // Check createdBy (strictly)
    expect(createdRecord.createdBy).toBeDefined()
    expect(String(createdRecord.createdBy)).toBe(String(userA.id))

    const recordId = createdRecord.id

    // 2. User A updates their own record
    const updatePayload = { content: 'Updated content by Owner' }
    const updatedRecord = await userAApi(`/api/testimonials/${recordId}`, {
      method: 'PATCH',
      body: updatePayload,
    })

    expect(updatedRecord.content).toBe(updatePayload.content)
    if (updatedRecord.updatedBy) {
      expect(String(updatedRecord.updatedBy)).toBe(String(userA.id))
    }

    // 3. User B tries to update User A's record -> Should Fail
    try {
      await userBApi(`/api/testimonials/${recordId}`, {
        method: 'PATCH',
        body: { content: 'Hacked content' },
      })
      throw new Error('User B was able to update User A record')
    }
    catch (e: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
      expect(e.statusCode).toBe(403)
    }

    // 4. User B tries to delete User A's record -> Should Fail
    try {
      await userBApi(`/api/testimonials/${recordId}`, {
        method: 'DELETE',
      })
      throw new Error('User B was able to delete User A record')
    }
    catch (e: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
      expect(e.statusCode).toBe(403)
    }

    // 5. User A deletes their own record
    await userAApi(`/api/testimonials/${recordId}`, {
      method: 'DELETE',
    })

    // Verify it's gone
    try {
      await userAApi(`/api/testimonials/${recordId}`)
      throw new Error('Record should be deleted')
    }
    catch (e: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
      expect(e.statusCode).toBe(404)
    }
  })
})
