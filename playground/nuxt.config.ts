import { defineNuxtConfig } from 'nuxt/config'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    '@nuxthub/core',
    'nuxt-auth-utils',
    '@vueuse/nuxt',
    'nuxt-authorization',
    '@nuxt/ui',
    '@nuxt/eslint',
    '../src/module'
  ],

  devtools: { enabled: true },

  css: ['~/assets/css/main.css'],

  runtimeConfig: {
    public: {
      crudBaseUrl: '/api'
    }
  },

  future: {
    compatibilityVersion: 4
  },

  compatibilityDate: '2024-11-27',

  nitro: {
    experimental: {
      tasks: true
    }
  },

  hub: {
    database: true
  },

  autoCrud: {
    schemaPath: 'server/database/schema',
    // auth: false, // Uncomment this line for testing APIs without auth
    auth: {
      type: 'session', // for Normal Authentication with nuxt-auth-utils
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
