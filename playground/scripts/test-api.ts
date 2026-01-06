import { ofetch } from 'ofetch'

const BASE_URL = 'http://localhost:3000'

async function testScenario(role: string, email: string) {
  console.log(`\nTesting as ${role} (${email})...`)

  // 1. Login
  let cookies: string[] = []

  const client = ofetch.create({
    baseURL: BASE_URL,
    onRequest({ options }) {
      if (cookies.length > 0) {
        const headers = new Headers(options.headers)
        headers.set('cookie', cookies.join('; '))
        options.headers = headers
      }
    },
    onResponse({ response }) {
      const setCookie = response.headers.get('set-cookie')
      if (setCookie) {
        cookies = [setCookie.split(';')[0]]
      }
    },
  })

  try {
    await client('/api/auth/login', {
      method: 'POST',
      body: { email, password: '$1Password' },
    })
    console.log('✅ Login successful')
  }
  catch (e) {
    console.error('❌ Login failed:', e)
    return
  }

  // 2. List Users
  let users: Record<string, unknown>[] = []
  try {
    const response = await client('/api/users')
    users = response.data || response
    console.log(`✅ List Users: Allowed (${users.length} users found)`)
  }
  catch (error: unknown) {
    const e = error as { statusCode: number }
    if (e.statusCode === 403 || e.statusCode === 401) {
      console.log('🚫 List Users: Denied')
    }
    else {
      console.log(`❌ List Users: Failed with ${e.statusCode}`)
    }
  }

  // 3. Create User
  let createdUserId: number | null = null
  try {
    const newUser = await client('/api/users', {
      method: 'POST',
      body: {
        email: `test-${role}-${Date.now()}@example.com`,
        password: 'password',
        name: 'Test User',
      },
    })
    createdUserId = newUser.id
    if (role === 'Admin') {
      console.log('✅ Create User: Allowed (Expected for Admin)')
    }
    else {
      console.log('⚠️ Create User: Allowed (Unexpected for ' + role + ')')
    }
  }
  catch (error: unknown) {
    const e = error as { statusCode: number }
    if (e.statusCode === 403 || e.statusCode === 401) {
      if (role !== 'Admin') {
        console.log(`✅ Create User: Denied (Expected for ${role})`)
      }
      else {
        console.log(`❌ Create User: Denied (Unexpected for Admin)`)
      }
    }
    else {
      console.log(`❌ Create User: Failed with ${e.statusCode}`)
    }
  }

  // 4. Delete User
  // If we created a user, try to delete it. If not, try to delete the last user from the list (if not empty)
  // Be careful not to delete the current user or important seed data if possible.
  // For safety, let's only try to delete if we created one, or if we found a user that looks like a test user.

  const targetId = createdUserId

  if (targetId) {
    try {
      await client(`/api/users/${targetId}`, {
        method: 'DELETE',
      })
      console.log(`⚠️ Delete User: Allowed (Unexpected for ${role} based on config)`)
    }
    catch (error: unknown) {
      const e = error as { statusCode: number }
      if (e.statusCode === 403 || e.statusCode === 401) {
        console.log(`✅ Delete User: Denied (Expected for ${role})`)
      }
      else {
        console.log(`❌ Delete User: Failed with ${e.statusCode}`)
      }
    }
  }
  else {
    console.log('ℹ️ Skipping Delete User test (no user created to delete)')
  }
}

async function main() {
  await testScenario('Admin', 'admin@example.com')
  await testScenario('Manager', 'manager@example.com')
  await testScenario('Moderator', 'moderator@example.com')
  await testScenario('Customer', 'customer@example.com')
}

main()
