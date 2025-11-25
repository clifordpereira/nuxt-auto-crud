export default defineNuxtConfig({
  modules: ['@nuxthub/core', '../src/module'],
  
  // NuxtHub configuration for local database
  hub: {
    database: true,
  },
  
  // Ghost API configuration
  ghostApi: {
    schemaPath: 'server/database/schema',
  },
  
  devtools: { enabled: true },
})
