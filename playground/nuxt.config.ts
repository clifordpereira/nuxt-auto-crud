import { defineNuxtConfig } from "nuxt/config";

// https://nuxt.com/docs/api/configuration/nuxt-config
// Force restart
export default defineNuxtConfig({
  modules: [
    "@nuxt/ui",
    "@nuxt/eslint",
    "@nuxthub/core",
    "nuxt-auth-utils",
    "@vueuse/nuxt",
    "nuxt-authorization",
    "nuxt-security",
    "nuxt-delay-hydration",
    "../src/module",
    "@nuxt/content",
    "@nuxt/image",
    "@nuxt/scripts",
    "@nuxt/fonts",
  ],

  // Nuxt Scripts configuration
  scripts: {
    registry: {
      googleTagManager: true, // Tell the module to enable GTM
      googleAnalytics: true, // Tell the module to enable GA
    },
  },

  devtools: { enabled: true },

  css: ["~/assets/css/main.css"],

  runtimeConfig: {
    // Private keys (Server-side only)
    sessionPassword: "",
    adminEmail: "admin@example.com",
    adminPassword: "$1Password", // Overridden by NUXT_ADMIN_PASSWORD

    oauth: {
      github: {
        clientId: "", // Overridden by NUXT_OAUTH_GITHUB_CLIENT_ID
        clientSecret: "", // Overridden by NUXT_OAUTH_GITHUB_CLIENT_SECRET
      },
      google: {
        clientId: "", // Overridden by NUXT_OAUTH_GOOGLE_CLIENT_ID
        clientSecret: "", // Overridden by NUXT_OAUTH_GOOGLE_CLIENT_SECRET
      },
    },

    emailFrom: "", // Overridden by NUXT_EMAIL_FROM
    resendApiKey: "", // Overridden by NUXT_RESEND_API_KEY

    // Public keys (Available on Server and Client)
    public: {
      crudBaseUrl: "/api",
      scripts: {
        googleTagManager: {
          id: "", // Overridden by NUXT_PUBLIC_SCRIPTS_GOOGLE_TAG_MANAGER_ID
        },
        googleAnalytics: {
          id: "", // Overridden by NUXT_PUBLIC_SCRIPTS_GOOGLE_ANALYTICS_ID
        },
      },
    },
  },

  routeRules: {
    "/": { isr: 3600 },
    "/docs/**": { isr: 86400 },
  },

  future: {
    compatibilityVersion: 4,
  },

  compatibilityDate: "2024-11-27",

  nitro: {
    compressPublicAssets: true,
    minify: true,
    experimental: {
      tasks: true,
      openAPI: false,
    },
    externals: {
      external: ["better-sqlite3", "@libsql/client"],
    },
  },

  hub: {
    db: "sqlite",
  },

  autoCrud: {
    schemaPath: "server/db/schema",
    auth: {
      type: "session",
      authentication: true,
      authorization: true,
    },
  },
  delayHydration: {
    mode: "mount",
    debug: process.env.NODE_ENV === "development",
  },

  eslint: {
    config: {
      stylistic: {
        commaDangle: "never",
        braceStyle: "1tbs",
      },
    },
  },

  image: {
    domains: ["img.youtube.com", "i.ytimg.com"],
  },
  security: {
    headers: {
      contentSecurityPolicy: false,
      permissionsPolicy: false,
      crossOriginEmbedderPolicy: false,
      crossOriginOpenerPolicy: false,
      referrerPolicy: "no-referrer-when-downgrade",
    },
  },
});
