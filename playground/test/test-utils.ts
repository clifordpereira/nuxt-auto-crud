import { $fetch, fetch } from '@nuxt/test-utils/e2e'

/**
 * Base API client for the playground.
 * Returns parsed JSON directly.
 */
export const api = $fetch

/**
 * Helper to create an authenticated wrapper around $fetch.
 */
const createAuthenticatedClient = (cookie: string) => {
  const client = (url: string, opts?: any) => $fetch(url, {
    ...opts,
    headers: { ...opts?.headers, cookie },
  })

  client.raw = (url: string, opts?: any) => $fetch.raw(url, {
    ...opts,
    headers: { ...opts?.headers, cookie },
  })

  return client
}

/**
 * Create a client for a new authenticated user session.
 * Uses 'fetch' to reliably extract 'set-cookie' headers from the response.
 */
export async function getAuthClient(creds = {
  name: 'Test',
  email: `u.${Date.now()}@test.com`,
  password: 'password123',
}) {
  const res = await fetch('/api/auth/signup', {
    method: 'POST',
    body: JSON.stringify(creds),
    headers: { 'Content-Type': 'application/json' },
  })

  const cookie = res.headers.get('set-cookie') ?? ''
  const data = await res.json()
  const client = createAuthenticatedClient(cookie)

  return {
    client,
    user: data?.user ?? data?.data?.user,
    creds,
  }
}

/**
 * Create a client for the admin user.
 */
export async function getAdminClient(email = 'admin@example.com', password = '$1Password') {
  const res = await fetch('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
    headers: { 'Content-Type': 'application/json' },
  })

  const cookie = res.headers.get('set-cookie') ?? ''
  return createAuthenticatedClient(cookie)
}

/**
 * Utility to wait for a specific duration.
 */
export const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))
