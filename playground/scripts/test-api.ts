import { ofetch } from 'ofetch'

const BASE_URL = 'http://localhost:3000'

async function login(email: string) {
  try {
    const response = await ofetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      body: { email, password: '$1Password' },
      ignoreResponseError: true,
      onResponse({ response }) {
        // Capture cookies
      }
    })
    
    // ofetch automatically handles cookies if we use a create instance, but here we are just grabbing headers?
    // Actually, let's use a fetcher with cookie support or just manual header management.
    return response
  } catch (e) {
    console.error('Login failed', e)
    return null
  }
}

async function testScenario(role: string, email: string) {
  console.log(`\nTesting as ${role} (${email})...`)
  
  // 1. Login
  // We need to persist cookies.
  // Let's use a custom fetcher wrapper that stores cookies.
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
        // Simple split, might need better parsing for multiple cookies
        cookies = [setCookie.split(';')[0]] 
      }
    }
  })

  try {
    await client('/api/auth/login', {
      method: 'POST',
      body: { email, password: '$1Password' }
    })
    console.log('✅ Login successful')
  } catch (e) {
    console.error('❌ Login failed:', e)
    return
  }

  // 2. List Users
  try {
    await client('/api/users')
    console.log('✅ List Users: Allowed')
  } catch (e: any) {
    if (e.statusCode === 403 || e.statusCode === 401) {
      console.log('🚫 List Users: Denied (Expected for Customer)')
    } else {
      console.log(`❌ List Users: Failed with ${e.statusCode}`)
    }
  }

  // 3. Create User (Should fail for Manager/Customer)
  try {
    await client('/api/users', {
      method: 'POST',
      body: {
        email: `test-${role}@example.com`,
        password: 'password',
        name: 'Test User'
      }
    })
    console.log('⚠️ Create User: Allowed (Unexpected for Manager/Customer)')
  } catch (e: any) {
    if (e.statusCode === 403 || e.statusCode === 401) {
      console.log('✅ Create User: Denied (Expected)')
    } else {
      console.log(`❌ Create User: Failed with ${e.statusCode}`)
    }
  }
}

async function main() {
  await testScenario('Manager', 'manager@example.com')
  await testScenario('Customer', 'customer@example.com')
}

main()
