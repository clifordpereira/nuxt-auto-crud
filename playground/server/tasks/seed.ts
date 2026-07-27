import seedConfig from '../config/authz-seed'

export default defineTask({
  meta: {
    name: 'db:seed',
    description: 'Seed database with initial data',
  },
  async run() {
    console.log('Seeding database...')

    await nacSeedAuthz({
      db,
      schema,
      config: seedConfig,
      hashPassword, // The hashing function you use eg: hashPassword() from nuxt-auth-utils
    })

    return { result: 'Database seeded successfully' }
  },
})