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
    '@nuxt/scripts',
    'nuxt-auth-utils',
    'nuxt-authorization',
    '../src/module'
  ],

  ssr: true,

  devtools: {
    enabled: true
  },

  css: ['~/assets/css/main.css'],

  runtimeConfig: {
    adminEmail: 'admin@example.com',
    adminPassword: '$1Password',
    public: {
      crudBaseUrl: '/api'
    }
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
    // preset: 'cloudflare_module',
    // cloudflare: {
    //   nodeCompat: true
    // }
  },

  hub: {
    db: 'sqlite'
  },

  autoCrud: {
    schemaPath: 'server/db/schema',
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
  },
  scripts: {
    registry: {
      googleAnalytics: {
        id: 'G-2Q3XHYBQC6'
      }
    }
  }
})
