import { describe, it, expect } from 'vitest'
import { $fetch } from '@nuxt/test-utils/e2e'

describe('NAC: CRUD Permission Enforcement (authz fixture, real DB)', () => {
  const noPerms = { 'x-test-user-id': '1', 'x-test-permissions': '' }
  const canCreate = { 'x-test-user-id': '1', 'x-test-permissions': 'create,read,list' }
  const ownerHeaders = { 'x-test-user-id': '2', 'x-test-permissions': 'create,read_own,update_own,delete_own,list_own' }
  const otherUserHeaders = { 'x-test-user-id': '3', 'x-test-permissions': 'read_own,update_own,delete_own,list_own' }

  // resources.name is unique — every test that creates a row needs a name
  // that won't collide with a previous, un-cleaned-up run against a
  // persisted DB. A per-run-unique suffix keeps each test independently
  // rerunnable without needing to delete rows afterward.
  const unique = (label: string) => `perm-e2e-${label}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`

  it('POST /resources: rejected without "create"', async () => {
    await expect($fetch('/api/_nac/resources', {
      method: 'POST',
      body: { name: unique('no-perm') },
      headers: noPerms,
    })).rejects.toMatchObject({ status: 403 })
  })

  it('POST /resources: succeeds with "create"', async () => {
    const name = unique('created')
    const created = await $fetch<Record<string, unknown>>('/api/_nac/resources', {
      method: 'POST',
      body: { name },
      headers: canCreate,
    })
    expect(created.name).toBe(name)
  })

  it('GET /resources/:id: rejected without any read permission', async () => {
    const created = await $fetch<Record<string, unknown>>('/api/_nac/resources', {
      method: 'POST', body: { name: unique('read-target') }, headers: canCreate,
    })
    await expect($fetch(`/api/_nac/resources/${created.id}`, { headers: noPerms }))
      .rejects.toMatchObject({ status: 403 })
  })

  it('GET /resources/:id: "read_own" on someone else\'s row returns 404, not 403', async () => {
    const created = await $fetch<Record<string, unknown>>('/api/_nac/resources', {
      method: 'POST', body: { name: unique('owned-by-2') }, headers: ownerHeaders,
    })
    await expect($fetch(`/api/_nac/resources/${created.id}`, { headers: otherUserHeaders }))
      .rejects.toMatchObject({ status: 404 })
  })

  it('GET /resources/:id: "read_own" on your own row succeeds', async () => {
    const name = unique('owned-and-read')
    const created = await $fetch<Record<string, unknown>>('/api/_nac/resources', {
      method: 'POST', body: { name }, headers: ownerHeaders,
    })
    const fetched = await $fetch<Record<string, unknown>>(`/api/_nac/resources/${created.id}`, { headers: ownerHeaders })
    expect(fetched.name).toBe(name)
  })

  it('PATCH /resources/:id: "update_own" on someone else\'s row returns 404', async () => {
    const created = await $fetch<Record<string, unknown>>('/api/_nac/resources', {
      method: 'POST', body: { name: unique('not-yours') }, headers: ownerHeaders,
    })
    await expect($fetch(`/api/_nac/resources/${created.id}`, {
      method: 'PATCH', body: { name: unique('hijacked') }, headers: otherUserHeaders,
    })).rejects.toMatchObject({ status: 404 })
  })

  it('PATCH /resources/:id: "update_own" on your own row succeeds', async () => {
    const created = await $fetch<Record<string, unknown>>('/api/_nac/resources', {
      method: 'POST', body: { name: unique('editable') }, headers: ownerHeaders,
    })
    const newName = unique('edited')
    const updated = await $fetch<Record<string, unknown>>(`/api/_nac/resources/${created.id}`, {
      method: 'PATCH', body: { name: newName }, headers: ownerHeaders,
    })
    expect(updated.name).toBe(newName)
  })

  it('DELETE /resources/:id: rejected without any delete permission', async () => {
    const created = await $fetch<Record<string, unknown>>('/api/_nac/resources', {
      method: 'POST', body: { name: unique('undeletable') }, headers: canCreate,
    })
    await expect($fetch(`/api/_nac/resources/${created.id}`, { method: 'DELETE', headers: noPerms }))
      .rejects.toMatchObject({ status: 403 })
  })

  it('DELETE /resources/:id: "delete_own" on your own row succeeds', async () => {
    const name = unique('deletable')
    const created = await $fetch<Record<string, unknown>>('/api/_nac/resources', {
      method: 'POST', body: { name }, headers: ownerHeaders,
    })
    const deleted = await $fetch<Record<string, unknown>>(`/api/_nac/resources/${created.id}`, {
      method: 'DELETE', headers: ownerHeaders,
    })
    expect(deleted.name).toBe(name)
  })
})