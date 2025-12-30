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
    'nuxt-nodemailer',
    '../src/module',
  ],

  ssr: true,

  devtools: {
    enabled: true,
  },

  css: ['~/assets/css/main.css'],

  runtimeConfig: {
    adminEmail: 'admin@example.com',
    adminPassword: '$1Password',
    public: {
      crudBaseUrl: '/api',
    },
    oauth: {
      github: {
        clientId: process.env.NUXT_OAUTH_GITHUB_CLIENT_ID,
        clientSecret: process.env.NUXT_OAUTH_GITHUB_CLIENT_SECRET,
      },
      google: {
        clientId: process.env.NUXT_OAUTH_GOOGLE_CLIENT_ID,
        clientSecret: process.env.NUXT_OAUTH_GOOGLE_CLIENT_SECRET,
      },
    },
    resendApiKey: process.env.NUXT_RESEND_API_KEY,
  },

  routeRules: {
    '/docs': { redirect: '/docs/auto-crud', prerender: false },
  },

  compatibilityDate: '2025-12-30',

  nitro: {
    prerender: {
      routes: [
        '/',
      ],
      crawlLinks: true,
    },
    experimental: {
      tasks: true,
      openAPI: true,
    },
  },

  hub: {
    db: 'sqlite',
  },

  autoCrud: {
    schemaPath: 'server/db/schema',
    auth: {
      type: 'session',
      authentication: true,
      authorization: true,
    },
  },

  eslint: {
    config: {
      stylistic: {
        commaDangle: 'never',
        braceStyle: '1tbs',
      },
    },
  },

  fonts: {
    devtools: false,
    providers: {
      google: false, // Disable google provider if it's causing timeouts
    },
  },
  nodemailer: {
    from: process.env.NUXT_NODEMAILER_FROM || '"Cliford Pereira" <cliford.pereira@gmail.com>',
    host: process.env.NUXT_NODEMAILER_HOST || 'smtp.gmail.com',
    port: Number.parseInt(process.env.NUXT_NODEMAILER_PORT || '465'),
    secure: process.env.NUXT_NODEMAILER_SECURE !== 'false', // Default to true
    auth: {
      user: process.env.NUXT_NODEMAILER_USER || 'cliford.pereira@gmail.com',
      pass: process.env.NUXT_NODEMAILER_AUTH_PASS || '',
    },
  },
})
