// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    '@nuxt/eslint',
    '@nuxt/image',
    '@nuxt/ui',
    '@nuxt/content',
    '@vueuse/nuxt',
    'nuxt-og-image',
    '@nuxthub/core',
    'nuxt-auth-utils',
    'nuxt-authorization',
    '../src/module',
  ],

  devtools: {
    enabled: true
  },

  css: ['~/assets/css/main.css'],

  runtimeConfig: {
    public: {
      crudBaseUrl: '/api',
    },
  },

  routeRules: {
    '/docs': { redirect: '/docs/auto-crud', prerender: false }
  },

  compatibilityDate: '2024-07-11',

  nitro: {
    prerender: {
      routes: [
        '/'
      ],
      crawlLinks: true
    },
    experimental: {
      tasks: true,
      openAPI: true
    }
  },

  hub: {
    database: true
  },

  autoCrud: {
    schemaPath: 'server/database/schema',
    auth: {
      type: 'session',
      authentication: true,
      authorization: true
    }
  },

  eslint: {
    config: {
      stylistic: {
        commaDangle: 'never',
        braceStyle: '1tbs'
      }
    }
  }
})
