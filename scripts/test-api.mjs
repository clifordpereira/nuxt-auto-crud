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

async function main() {
  console.log('Starting servers...')
  const logStream = fs.createWriteStream('server.log')

  const fullstack = spawn('nuxi', ['dev', 'playground-fullstack', '--port', FULLSTACK_PORT], {
    cwd: rootDir,
    stdio: 'pipe',
    env: { ...process.env, NUXT_SESSION_PASSWORD: 'password-must-be-at-least-32-characters-long' },
  })

  fullstack.stdout.pipe(logStream)
  fullstack.stderr.pipe(logStream)

  const backend = spawn('nuxi', ['dev', 'playground-backend', '--port', BACKEND_PORT], {
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

    console.log('Servers ready. Running tests...')

    const test = spawn('npx', ['vitest', 'run'], {
      cwd: rootDir,
      stdio: 'inherit',
      env: {
        ...process.env,
        TEST_PORT: FULLSTACK_PORT,
        TEST_BACKEND_PORT: BACKEND_PORT,
      },
    })

    test.on('close', (code) => {
      fullstack.kill()
      backend.kill()
      process.exit(code)
    })
  }
  catch {
    console.error('Error starting servers')
    fullstack.kill()
    backend.kill()
    process.exit(1)
  }
}

main()
