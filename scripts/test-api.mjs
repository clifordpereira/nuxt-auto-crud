import { spawn } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { join } from 'node:path'

const projectDir = fileURLToPath(new URL('..', import.meta.url))
const fixtureDir = join(projectDir, 'test/fixtures/crud')
const outputDir = join(fixtureDir, '.output/server/index.mjs')

async function startServer() {
  return new Promise((resolve, reject) => {
    const server = spawn('npx', ['nuxi', 'dev', 'test/fixtures/crud', '--port', '3335'], {
      env: { ...process.env },
      stdio: 'inherit'
    })

    // Wait for server to be ready (longer timeout for dev server)
    setTimeout(() => resolve(server), 10000)
    
    server.on('error', reject)
  })
}

async function runTests() {
  const baseUrl = 'http://localhost:3335'
  let userId

  console.log('Starting tests...')

  try {
    // 1. Create User
    console.log('Testing POST /api/users...')
    const createRes = await fetch(`${baseUrl}/api/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test User',
        email: 'test@example.com',
        bio: 'A test user bio',
      })
    })
    if (!createRes.ok) throw new Error(`Create failed: ${createRes.status}`)
    const user = await createRes.json()
    if (user.name !== 'Test User') throw new Error('Name mismatch')
    userId = user.id
    console.log('✅ Create User passed')

    // 2. List Users
    console.log('Testing GET /api/users...')
    const listRes = await fetch(`${baseUrl}/api/users`)
    if (!listRes.ok) throw new Error(`List failed: ${listRes.status}`)
    const users = await listRes.json()
    if (!Array.isArray(users) || users.length === 0) throw new Error('List invalid')
    console.log('✅ List Users passed')

    // 3. Get User
    console.log(`Testing GET /api/users/${userId}...`)
    const getRes = await fetch(`${baseUrl}/api/users/${userId}`)
    if (!getRes.ok) throw new Error(`Get failed: ${getRes.status}`)
    const fetchedUser = await getRes.json()
    if (fetchedUser.id !== userId) throw new Error('ID mismatch')
    console.log('✅ Get User passed')

    // 4. Update User
    console.log(`Testing PATCH /api/users/${userId}...`)
    const updateRes = await fetch(`${baseUrl}/api/users/${userId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bio: 'Updated bio' })
    })
    if (!updateRes.ok) throw new Error(`Update failed: ${updateRes.status}`)
    const updatedUser = await updateRes.json()
    if (updatedUser.bio !== 'Updated bio') throw new Error('Bio mismatch')
    console.log('✅ Update User passed')

    // 5. Delete User
    console.log(`Testing DELETE /api/users/${userId}...`)
    const deleteRes = await fetch(`${baseUrl}/api/users/${userId}`, {
      method: 'DELETE'
    })
    if (!deleteRes.ok) throw new Error(`Delete failed: ${deleteRes.status}`)
    console.log('✅ Delete User passed')

    // Verify Delete
    const verifyRes = await fetch(`${baseUrl}/api/users/${userId}`)
    if (verifyRes.status !== 404) throw new Error('User still exists')
    console.log('✅ Verify Delete passed')

  } catch (err) {
    console.error('❌ Test failed:', err)
    process.exit(1)
  }
}

async function main() {
  let server
  try {
    server = await startServer()
    await runTests()
  } catch (err) {
    console.error(err)
    process.exit(1)
  } finally {
    if (server) server.kill()
  }
}

main()
