import { drizzle } from 'drizzle-orm/better-sqlite3'
import Database from 'better-sqlite3'
import * as schema from '../server/database/schema'
import { readdirSync, existsSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { scrypt, randomBytes } from 'node:crypto'
import { promisify } from 'node:util'

const scryptAsync = promisify(scrypt)

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString('hex')
  const derivedKey = (await scryptAsync(password, salt, 64)) as Buffer
  return `${salt}:${derivedKey.toString('hex')}`
}

async function main() {
  // Find the database file
  // Try to find .data directory relative to cwd or script location
  let rootDir = process.cwd()
  if (!existsSync(join(rootDir, '.data'))) {
    // try going up if we are in scripts
    if (existsSync(join(rootDir, '../.data'))) {
      rootDir = join(rootDir, '..')
    } else {
      // try relative to this file
      rootDir = resolve(__dirname, '..')
    }
  }

  const dbDir = join(rootDir, '.data/hub/d1/miniflare-D1DatabaseObject')
  
  if (!existsSync(dbDir)) {
    console.error('Database directory not found at', dbDir)
    process.exit(1)
  }

  const files = readdirSync(dbDir).filter(f => f.endsWith('.sqlite'))
  if (files.length === 0) {
    console.error('No .sqlite database file found in', dbDir)
    process.exit(1)
  }
  
  const dbPath = join(dbDir, files[0])
  console.log('Using database:', dbPath)

  const sqlite = new Database(dbPath)
  const db = drizzle(sqlite, { schema })

  const password = await hashPassword('$1Password')

  console.log('Seeding users...')

  try {
    await db.insert(schema.users).values([
      {
        email: 'manager@example.com',
        password,
        role: 'manager',
        name: 'Manager',
        avatar: '',
      },
      {
        email: 'customer@example.com',
        password,
        role: 'customer',
        name: 'Customer',
        avatar: '',
      }
    ]).onConflictDoNothing()
    console.log('Users seeded successfully.')
  } catch (e) {
    console.error('Error seeding users:', e)
  }
}

main()
