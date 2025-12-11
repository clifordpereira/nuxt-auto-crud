import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { ofetch } from 'ofetch'

const PORT = process.env.TEST_PORT || '3000'

describe('Status Filtering Tests', () => {
  let adminApi: typeof ofetch
  let publicApi: typeof ofetch
  let activeId: number
  let inactiveId: number

  beforeAll(async () => {
    // 1. Setup Admin API Client with Login
    let adminHeaders: Record<string, string> = {}
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
        adminHeaders.cookie = setCookie
      }
    } catch (e) {
      console.error('Admin login failed', e)
      throw e
    }

    adminApi = ofetch.create({
      baseURL: `http://localhost:${PORT}`,
      headers: adminHeaders,
    })

    // 2. Setup Public API Client (No Auth)
    publicApi = ofetch.create({
      baseURL: `http://localhost:${PORT}`,
    })

    // 3. Create Test Data (Testimonials)
    // Create Active Testimonial (Admin creates it to ensure it is created successfully)
    const activeTestimonial = await adminApi('/api/testimonials', {
      method: 'POST',
      body: {
        name: 'Active User',
        role: 'Tester',
        content: 'This is an active testimonial',
        status: 'active',
      },
    })
    activeId = activeTestimonial.id

    // Create Inactive Testimonial
    const inactiveTestimonial = await adminApi('/api/testimonials', {
      method: 'POST',
      body: {
        name: 'Inactive User',
        role: 'Tester',
        content: 'This is an inactive testimonial',
        status: 'inactive',
      },
    })
    inactiveId = inactiveTestimonial.id

    console.log(`Created Active Testimonial: ${activeId}`)
    console.log(`Created Inactive Testimonial: ${inactiveId}`)
  }, 30000)

  afterAll(async () => {
    // Cleanup
    if (activeId) await adminApi(`/api/testimonials/${activeId}`, { method: 'DELETE' })
    if (inactiveId) await adminApi(`/api/testimonials/${inactiveId}`, { method: 'DELETE' })
  })

  describe('Admin Access (Has list_all permission)', () => {
    it('should list both active and inactive items', async () => {
      const list = await adminApi('/api/testimonials')
      const ids = list.map((item: any) => item.id)
      expect(ids).toContain(activeId)
      expect(ids).toContain(inactiveId)
    })

    it('should retrieve active item by ID', async () => {
      const item = await adminApi(`/api/testimonials/${activeId}`)
      expect(item.id).toBe(activeId)
      expect(item.status).toBe('active')
    })

    it('should retrieve inactive item by ID', async () => {
      const item = await adminApi(`/api/testimonials/${inactiveId}`)
      expect(item.id).toBe(inactiveId)
      expect(item.status).toBe('inactive')
    })
  })

  describe('Public Access (No list_all permission)', () => {
    it('should have public permissions', async () => {
      try {
        const perms = await publicApi('/api/public-permissions')
        console.log('Public Permissions:', JSON.stringify(perms, null, 2))
        expect(perms).toBeDefined()
        expect(perms.testimonials).toContain('read')
      } catch (err) {
        console.error('Failed to fetch public permissions in test:', err)
        throw err
      }
    })

    it('should list ONLY active items', async () => {
      const list = await publicApi('/api/testimonials')
      const ids = list.map((item: any) => item.id)
      expect(ids).toContain(activeId)
      expect(ids).not.toContain(inactiveId)
    })

    it('should retrieve active item by ID', async () => {
      const item = await publicApi(`/api/testimonials/${activeId}`)
      expect(item.id).toBe(activeId)
    })

    it('should NOT retrieve inactive item by ID (404)', async () => {
      try {
        await publicApi(`/api/testimonials/${inactiveId}`)
        // Should fail if it succeeds
        expect(true).toBe(false)
      } catch (err: any) {
        expect(err.statusCode).toBe(404)
      }
    })
  })
})
