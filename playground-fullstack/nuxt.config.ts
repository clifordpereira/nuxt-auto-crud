export default defineNuxtConfig({
  modules: ['@nuxthub/core', 'nuxt-auth-utils', 'nuxt-authorization', '../src/module'],

  devtools: { enabled: true },

  // NuxtHub configuration for local database
  hub: {
    database: true,
  },

  // Auto CRUD configuration
  autoCrud: {
    schemaPath: 'server/database/schema',
    auth: {
      enabled: true,
      authorization: true,
    },
    resources: {
      users: {
        public: ['list', 'read'],
        publicColumns: ['id', 'name', 'avatar'],
      },
    },
  },
})
