export default defineNuxtConfig({
  modules: ['nuxt-auto-crud', '@nuxthub/core', 'nuxt-auth-utils'],
  devtools: { enabled: true },
  compatibilityDate: '2025-07-15',
  nitro: {
    experimental: {
      tasks: true,
    },
  },
  hub: {
    db: 'sqlite',
  },
  autoCrud: {
    relationsPath: 'server/db/relations',
    auth: {
      useNacSchema: true,
    },
  },
})
