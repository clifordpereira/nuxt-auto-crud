import { $fetch } from '@nuxt/test-utils/e2e'

/**
 * Base API client for the playground, integrated with @nuxt/test-utils/e2e.
 */
export const api = $fetch

/**
 * Create a client for a new authenticated user session.
 */
export async function getAuthClient(creds = { 
  name: 'Test', 
  email: `u.${Date.now()}@test.com`, 
  password: 'password123' 
}) {
  const res = await $fetch.raw<any>('/api/auth/signup', {
    method: 'POST',
    body: creds
  })
  
  const cookie = res.headers.get('set-cookie') ?? ''
  
  const client = (url: string, opts?: any) => $fetch(url, { 
    ...opts, 
    headers: { ...opts?.headers, cookie } 
  })
  
  // Attach raw helper for convenience
  client.raw = (url: string, opts?: any) => $fetch.raw(url, { 
    ...opts, 
    headers: { ...opts?.headers, cookie } 
  })
  
  return {
    client,
    user: (res as any)._data?.user || (res as any).data?.user,
    creds
  }
}

/**
 * Create a client for the admin user.
 */
export async function getAdminClient(email = 'admin@example.com', password = '$1Password') {
  const res = await $fetch.raw<any>('/api/auth/login', {
    method: 'POST',
    body: { email, password }
  })
  
  const cookie = res.headers.get('set-cookie') ?? ''
  
  const client = (url: string, opts?: any) => $fetch(url, { 
    ...opts, 
    headers: { ...opts?.headers, cookie } 
  })
  
  client.raw = (url: string, opts?: any) => $fetch.raw(url, { 
    ...opts, 
    headers: { ...opts?.headers, cookie } 
  })

  return client
}

/**
 * Utility to wait for a specific duration.
 */
export const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))
