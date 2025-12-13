import { spawn } from 'node:child_process'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import fs from 'node:fs'

const __dirname = fileURLToPath(new URL('.', import.meta.url))
const rootDir = resolve(__dirname, '..')

const FULLSTACK_PORT = '3000'
const BACKEND_PORT = '3001'

async function waitServer(port) {
  const start = Date.now()
  while (Date.now() - start < 30000) {
    try {
      await fetch(`http://localhost:${port}/api/users`)
      return true
    }
    catch {
      await new Promise(r => setTimeout(r, 1000))
    }
  }
  return false
}

function runTest(suite, port) {
  return new Promise((resolve, reject) => {
    console.log(`Running tests for ${suite} on port ${port}...`)
    const test = spawn('npx', ['vitest', 'run', '--config', 'vitest.api.config.ts'], {
      cwd: rootDir,
      stdio: 'inherit',
      env: {
        ...process.env,
        TEST_SUITE: suite,
        TEST_PORT: port,
      },
    })

    test.on('close', (code) => {
      if (code === 0) {
        resolve()
      }
      else {
        reject(new Error(`Tests failed for ${suite} with code ${code}`))
      }
    })
  })
}

async function main() {
  console.log('Starting servers...')
  const logStream = fs.createWriteStream('server.log')

  const fullstack = spawn('nuxi', ['dev', 'playground', '--port', FULLSTACK_PORT], {
    cwd: rootDir,
    stdio: 'pipe',
    env: { ...process.env, NUXT_SESSION_PASSWORD: 'password-must-be-at-least-32-characters-long' },
  })

  fullstack.stdout.pipe(logStream)
  fullstack.stderr.pipe(logStream)

  const backend = spawn('nuxi', ['dev', 'playground-backendonly', '--port', BACKEND_PORT], {
    cwd: rootDir,
    stdio: 'pipe',
    env: { ...process.env },
  })

  backend.stdout.pipe(logStream)
  backend.stderr.pipe(logStream)

  try {
    console.log('Waiting for servers to be ready...')
    const fullstackReady = await waitServer(FULLSTACK_PORT)
    const backendReady = await waitServer(BACKEND_PORT)

    if (!fullstackReady || !backendReady) {
      throw new Error('Servers failed to start')
    }

    console.log('Servers ready.')

    await runTest('backend', BACKEND_PORT)
    await runTest('fullstack', FULLSTACK_PORT)

    console.log('All tests passed!')
    fullstack.kill()
    backend.kill()
    process.exit(0)
  }
  catch (e) {
    console.error(e.message)
    fullstack.kill()
    backend.kill()
    process.exit(1)
  }
}

main()
