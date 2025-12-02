import Database from 'better-sqlite3'
import { resolve } from 'node:path'

const dbPath = resolve('playground-backendonly/.data/hub/database.sqlite')
console.log('Checking DB at:', dbPath)

try {
  const db = new Database(dbPath)
  const tables = db.prepare('SELECT name FROM sqlite_master WHERE type=\'table\'').all()
  console.log('Tables:', tables)
}
catch (err) {
  console.error('Error opening DB:', err)
}
