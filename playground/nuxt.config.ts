import { defineNuxtConfig } from 'nuxt/config'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    '@nuxt/ui',
    '@nuxt/eslint',
    '@nuxthub/core',
    'nuxt-auth-utils',
    '@vueuse/nuxt',
    'nuxt-authorization',
    '../src/module',
  ],

  devtools: { enabled: true },

  css: ['~/assets/css/main.css'],

  runtimeConfig: {
    public: {
      crudBaseUrl: '/api',
    },
  },

  future: {
    compatibilityVersion: 4,
  },

  compatibilityDate: '2024-11-27',

  hub: {
    database: true,
  },

  autoCrud: {
    schemaPath: 'server/database/schema',
    auth: true,
    /*
    auth: {
      type: 'session',
      authentication: true,
      authorization: true,
    },
    */
  },

  eslint: {
    config: {
      stylistic: {
        commaDangle: 'never',
        braceStyle: '1tbs',
      },
    },
  },
})
