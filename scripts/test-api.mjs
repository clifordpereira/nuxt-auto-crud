import { spawn } from 'node:child_process'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = fileURLToPath(new URL('.', import.meta.url))
const rootDir = resolve(__dirname, '..')

import { openSync } from 'node:fs'

async function startServer(playgroundDir, port) {
  console.log(`Starting server for ${playgroundDir} on port ${port}...`)
  const out = openSync('server.log', 'w')
  const server = spawn('nuxi', ['dev', '--port', port], {
    cwd: resolve(rootDir, playgroundDir),
    stdio: ['ignore', out, out],
    env: { ...process.env, PORT: port, NUXT_SESSION_PASSWORD: 'password-must-be-at-least-32-characters-long' },
  })

  // Wait for server to be ready (naive wait, better to check output or poll)
  await new Promise((resolve) => setTimeout(resolve, 10000))
  return server
}

async function runTests(suiteName, port) {
  console.log(`Running ${suiteName} tests on port ${port}...`)
  const test = spawn('vitest', ['run', 'test/api.test.ts'], {
    cwd: rootDir,
    stdio: 'inherit',
    env: { ...process.env, TEST_PORT: port, TEST_SUITE: suiteName },
  })

  return new Promise((resolve, reject) => {
    test.on('close', (code) => {
      if (code === 0) resolve()
      else reject(new Error(`Tests failed with code ${code}`))
    })
  })
}

async function main() {
  let server
  try {
    // 1. Backend-only (No Auth)
    // server = await startServer('playground-backend', '3001')
    // await runTests('backend', '3001')
    // server.kill()

    // 2. Full-stack (With Auth)
    server = await startServer('playground-fullstack', '3002')
    await runTests('fullstack', '3002')
    server.kill()

    console.log('All tests passed!')
    process.exit(0)
  } catch (err) {
    console.error(err)
    if (server) server.kill()
    process.exit(1)
  }
}

main()
