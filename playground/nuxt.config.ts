import { defineNuxtConfig } from 'nuxt/config'

export default defineNuxtConfig({
  modules: [
    '@nuxt/ui',
    '@nuxt/content',
    '@nuxt/image',
    '@nuxt/fonts',
    '@nuxt/scripts',
    '@nuxt/eslint',
    '@nuxt/test-utils/module',
    '@nuxthub/core',
    '@vueuse/nuxt',
    'nuxt-auth-utils',
    'nuxt-authorization',
    'nuxt-security',
    'nuxt-delay-hydration',
    '../src/module',
  ],

  devtools: { enabled: true },

  css: ['~/assets/css/main.css'],

  runtimeConfig: {
    // Private keys (Server-side only)
    apiSecretToken: '',
    sessionPassword: '',
    adminEmail: 'admin@example.com',
    adminPassword: '$1Password', // Overridden by NUXT_ADMIN_PASSWORD

    oauth: {
      github: {
        clientId: '', // Overridden by NUXT_OAUTH_GITHUB_CLIENT_ID
        clientSecret: '', // Overridden by NUXT_OAUTH_GITHUB_CLIENT_SECRET
      },
      google: {
        clientId: '', // Overridden by NUXT_OAUTH_GOOGLE_CLIENT_ID
        clientSecret: '', // Overridden by NUXT_OAUTH_GOOGLE_CLIENT_SECRET
      },
    },

    emailFrom: '', // Overridden by NUXT_EMAIL_FROM
    resendApiKey: '', // Overridden by NUXT_RESEND_API_KEY

    // Public keys (Available on Server and Client)
    public: {
      scripts: {
        googleTagManager: {
          id: '', // Overridden by NUXT_PUBLIC_SCRIPTS_GOOGLE_TAG_MANAGER_ID
        },
        googleAnalytics: {
          id: '', // Overridden by NUXT_PUBLIC_SCRIPTS_GOOGLE_ANALYTICS_ID
        },
      },
    },
  },

  routeRules: {
    '/': { isr: 3600 },
    '/docs/**': { isr: 86400 },
    '/api/_nac/_sse': {
      cache: false,
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        'Connection': 'keep-alive',
        'X-Accel-Buffering': 'no',
      },
    },
  },

  future: {
    compatibilityVersion: 4,
  },

  compatibilityDate: '2026-01-21',

  nitro: {
    compressPublicAssets: false,
    minify: true,
    experimental: {
      tasks: true,
      openAPI: false,
    },
    externals: {
      external: ['better-sqlite3', '@libsql/client', 'xlsx'],
      inline: ['@nuxthub/kv'],
    },
    alias: {
      'node:crypto': 'crypto',
      'node:stream/web': 'stream/web',
      'node:events': 'events',
      'node:stream': 'stream',
    },
  },

  hub: {
    db: 'sqlite',
    kv: true,
  },

  autoCrud: {
    endpointPrefix: '/api/_nac',
    schemaPath: 'server/db/schema',
    auth: {
      authentication: true,
      authorization: true,
      ownerKey: 'createdBy',
    },
    // Fields exposed to guest users.
    // Ensure the `list` permission for the `public` role is enabled for these resources in the Admin Dashboard.
    resources: {
      testimonials: ['id', 'name', 'content', 'avatar', 'company', 'createdAt'],
    },
  },
  delayHydration: {
    mode: 'mount',
    debug: process.env.NODE_ENV === 'development',
  },

  eslint: {
    config: {
      stylistic: {
        commaDangle: 'never',
        braceStyle: '1tbs',
      },
    },
  },

  image: {
    domains: ['img.youtube.com', 'i.ytimg.com'],
  },

  // Nuxt Scripts configuration
  scripts: {
    registry: {
      googleTagManager: true, // Tell the module to enable GTM
      googleAnalytics: true, // Tell the module to enable GA
    },
  },

  security: {
    headers: {
      contentSecurityPolicy: false,
      permissionsPolicy: false,
      crossOriginEmbedderPolicy: false,
      crossOriginOpenerPolicy: false,
      referrerPolicy: 'no-referrer-when-downgrade',
    },
  },
})
