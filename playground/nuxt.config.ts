export default defineNuxtConfig({
  modules: ['@nuxthub/core', '../src/module'],

  devtools: { enabled: true },

  // NuxtHub configuration for local database
  hub: {
    database: true,
  },

  // Auto CRUD configuration
  autoCrud: {
    schemaPath: 'server/database/schema',
  },
})
