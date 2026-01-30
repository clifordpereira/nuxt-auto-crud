// server/stubs/hub-db.ts
export const db = {
  select: () => {
    throw new Error('Nuxt Hub (hub:db) not initialized. Ensure @nuxthub/core is installed and linked.')
  },
  insert: () => { throw new Error('hub:db stub: insert not available') },
  update: () => { throw new Error('hub:db stub: update not available') },
  delete: () => { throw new Error('hub:db stub: delete not available') }
}