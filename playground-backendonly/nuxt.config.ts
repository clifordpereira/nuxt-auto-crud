export default defineNuxtConfig({
  modules: ['@nuxthub/core', '../src/module'],

  devtools: { enabled: true },

  // NuxtHub configuration for local database
  hub: {
    db: 'sqlite',
  },

  // Auto CRUD configuration
  autoCrud: {
    schemaPath: 'server/db/schema',
    // auth: false, // Uncomment this line for testing APIs without auth
    auth: {
      type: 'jwt', // for app providing backend apis only
      authentication: true,
      authorization: true,
      jwtSecret: process.env.NUXT_JWT_SECRET || 'test-secret-key-123',
    },
  },
})
