import { fileURLToPath } from 'node:url'
import { describe, it, expect } from 'vitest'
import { setup, $fetch } from '@nuxt/test-utils/e2e'

describe('API CRUD Operations', async () => {
  await setup({
    rootDir: fileURLToPath(new URL('./fixtures/crud', import.meta.url)),
  })

  let userId: number

  it('Create a new user (POST)', async () => {
    const newUser = {
      name: 'Test User',
      email: 'test@example.com',
      bio: 'A test user bio',
    }

    const response = await $fetch('/api/users', {
      method: 'POST',
      body: newUser,
    })

    expect(response).toHaveProperty('id')
    expect(response.name).toBe(newUser.name)
    expect(response.email).toBe(newUser.email)
    userId = response.id
  })

  it('List users (GET)', async () => {
    const response = await $fetch('/api/users')
    expect(Array.isArray(response)).toBe(true)
    expect(response.length).toBeGreaterThan(0)
    const user = response.find((u: any) => u.id === userId)
    expect(user).toBeDefined()
    expect(user.email).toBe('test@example.com')
  })

  it('Get a specific user (GET)', async () => {
    const response = await $fetch(`/api/users/${userId}`)
    expect(response).toHaveProperty('id', userId)
    expect(response.name).toBe('Test User')
  })

  it('Update a user (PATCH)', async () => {
    const updates = {
      name: 'Updated User',
      bio: 'Updated bio',
    }

    const response = await $fetch(`/api/users/${userId}`, {
      method: 'PATCH',
      body: updates,
    })

    expect(response.id).toBe(userId)
    expect(response.name).toBe(updates.name)
    expect(response.bio).toBe(updates.bio)
  })

  it('Delete a user (DELETE)', async () => {
    const response = await $fetch(`/api/users/${userId}`, {
      method: 'DELETE',
    })

    expect(response).toEqual({ success: true })

    // Verify user is gone
    try {
      await $fetch(`/api/users/${userId}`)
    } catch (error: any) {
      expect(error.response.status).toBe(404)
    }
  })
})
